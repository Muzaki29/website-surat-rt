import { NextResponse } from "next/server";
import { RT_INFO } from "@/lib/constants";
import { requireSession } from "@/lib/auth-api";
import { createId } from "@/lib/id";
import {
  formatPengajuanNotification,
  formatStatusPengajuanNotification,
  sendWhatsAppNotification,
} from "@/lib/notifications";
import { readJson, writeJson } from "@/lib/storage";
import type { JenisSurat, PengajuanSurat, Warga } from "@/lib/types";

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  const data = await readJson<PengajuanSurat[]>("pengajuan.json", []);

  if (id) {
    const item = data.find((p) => p.id === id);
    if (!item) return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
    return NextResponse.json(item);
  }

  const auth = await requireSession();
  if (auth.error) return auth.error;

  return NextResponse.json(data.sort((a, b) => b.tanggalAjuan.localeCompare(a.tanggalAjuan)));
}

export async function POST(request: Request) {
  const body = await request.json();
  const data = await readJson<PengajuanSurat[]>("pengajuan.json", []);

  const baru: PengajuanSurat = {
    id: createId(),
    jenisSurat: body.jenisSurat as JenisSurat,
    namaPemohon: body.namaPemohon ?? "",
    nik: body.nik ?? "",
    alamat: body.alamat ?? "",
    keperluan: body.keperluan ?? "",
    tanggalAjuan: new Date().toISOString().slice(0, 10),
    status: "diajukan",
  };

  data.unshift(baru);
  await writeJson("pengajuan.json", data);

  const phone = process.env.WHATSAPP_DEFAULT_PHONE || RT_INFO.telepon;
  await sendWhatsAppNotification({
    to: phone,
    message: formatPengajuanNotification(baru.namaPemohon, baru.jenisSurat, baru.id),
  });

  return NextResponse.json(baru, { status: 201 });
}

export async function PATCH(request: Request) {
  const auth = await requireSession();
  if (auth.error) return auth.error;

  const body = await request.json();
  const data = await readJson<PengajuanSurat[]>("pengajuan.json", []);
  const index = data.findIndex((p) => p.id === body.id);

  if (index === -1) {
    return NextResponse.json({ error: "Pengajuan tidak ditemukan" }, { status: 404 });
  }

  const validStatus = ["diproses", "disetujui", "ditolak", "selesai"] as const;
  if (body.status && validStatus.includes(body.status)) {
    data[index].status = body.status;
  }

  await writeJson("pengajuan.json", data);

  const warga = await readJson<Warga[]>("warga.json", []);
  const pemohon = warga.find((w) => w.nik === data[index].nik);
  if (pemohon?.noHp) {
    await sendWhatsAppNotification({
      to: pemohon.noHp,
      message: formatStatusPengajuanNotification(
        data[index].namaPemohon,
        data[index].status,
        data[index].id,
      ),
    });
  }

  return NextResponse.json(data[index]);
}
