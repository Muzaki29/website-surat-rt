import { NextResponse } from "next/server";
import { RT_INFO } from "@/lib/constants";
import { JENIS_SURAT } from "@/data/jenis-surat";
import { requirePermission } from "@/lib/auth-api";
import { logAudit } from "@/lib/audit-log";
import { toPublicPengajuan } from "@/lib/pengajuan-public";
import { attachTempUploadsToPengajuan } from "@/lib/berkas-storage";
import { createId } from "@/lib/id";
import { createNotifikasi, createWargaNotifikasi } from "@/lib/notifikasi";
import {
  formatPengajuanNotification,
  formatStatusPengajuanNotification,
  sendWhatsAppNotification,
} from "@/lib/notifications";
import { readJson, writeJson } from "@/lib/storage";
import type {
  BerkasPengajuan,
  JenisBerkasPengajuan,
  JenisSurat,
  PengajuanSurat,
  PengajuanTimelineEntry,
  Warga,
} from "@/lib/types";

interface BerkasUploadRef {
  uploadId: string;
  jenis: JenisBerkasPengajuan;
  namaFile: string;
  mimeType: string;
}

function addTimeline(
  item: PengajuanSurat,
  entry: Omit<PengajuanTimelineEntry, "at"> & { at?: string },
) {
  const timeline = item.timeline ?? [];
  timeline.unshift({
    at: entry.at ?? new Date().toISOString(),
    status: entry.status,
    note: entry.note,
    by: entry.by,
  });
  item.timeline = timeline;
}

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  const data = await readJson<PengajuanSurat[]>("pengajuan.json", []);

  if (id) {
    const item = data.find((p) => p.id === id);
    if (!item) return NextResponse.json({ error: "Tidak ditemukan" }, { status: 404 });
    return NextResponse.json(toPublicPengajuan(item));
  }

  const auth = await requirePermission("pengajuan:read");
  if (auth.error) return auth.error;

  return NextResponse.json(data.sort((a, b) => b.tanggalAjuan.localeCompare(a.tanggalAjuan)));
}

export async function POST(request: Request) {
  const body = await request.json();
  const data = await readJson<PengajuanSurat[]>("pengajuan.json", []);
  const pengajuanId = createId();
  const now = new Date().toISOString();
  const jenisInfo = JENIS_SURAT.find((j) => j.slug === body.jenisSurat);
  const estimasi = jenisInfo
    ? new Date(Date.now() + jenisInfo.estimasiHari * 86400000).toISOString().slice(0, 10)
    : undefined;

  const berkasRefs = (body.berkas as BerkasUploadRef[] | undefined) ?? [];
  const pathMap = berkasRefs.length
    ? await attachTempUploadsToPengajuan(
        berkasRefs.map((b) => b.uploadId),
        pengajuanId,
      )
    : {};

  const berkas: BerkasPengajuan[] = berkasRefs.map((ref) => ({
    id: ref.uploadId,
    jenis: ref.jenis,
    namaFile: ref.namaFile,
    mimeType: ref.mimeType,
    path: pathMap[ref.uploadId] ?? `temp/${ref.uploadId}`,
    uploadedAt: now,
  }));

  const baru: PengajuanSurat = {
    id: pengajuanId,
    jenisSurat: body.jenisSurat as JenisSurat,
    namaPemohon: body.namaPemohon ?? "",
    nik: body.nik ?? "",
    alamat: body.alamat ?? "",
    keperluan: body.keperluan ?? "",
    tanggalAjuan: new Date().toISOString().slice(0, 10),
    status: "diajukan",
    berkas,
    estimasiSelesai: estimasi,
    timeline: [{ at: now, status: "diajukan", note: "Pengajuan diterima sistem" }],
  };

  data.unshift(baru);
  await writeJson("pengajuan.json", data);

  const phone = process.env.WHATSAPP_DEFAULT_PHONE || RT_INFO.telepon;
  await sendWhatsAppNotification({
    to: phone,
    message: formatPengajuanNotification(baru.namaPemohon, baru.jenisSurat, baru.id),
  });

  await createNotifikasi({
    tipe: "pengajuan",
    judul: "Pengajuan surat baru",
    pesan: `${baru.namaPemohon} mengajukan surat ${baru.jenisSurat}.`,
    href: "/admin/pengajuan",
    level: "info",
    meta: { pengajuanId: baru.id, jenisSurat: baru.jenisSurat },
  });

  return NextResponse.json(baru, { status: 201 });
}

export async function PATCH(request: Request) {
  const auth = await requirePermission("pengajuan:manage");
  if (auth.error) return auth.error;

  const body = await request.json();
  const data = await readJson<PengajuanSurat[]>("pengajuan.json", []);
  const index = data.findIndex((p) => p.id === body.id);

  if (index === -1) {
    return NextResponse.json({ error: "Pengajuan tidak ditemukan" }, { status: 404 });
  }

  const item = data[index];
  const prevStatus = item.status;

  const validStatus = ["diproses", "disetujui", "ditolak", "selesai"] as const;
  if (body.status && validStatus.includes(body.status)) {
    item.status = body.status;
  }
  if (body.catatanInternal !== undefined) item.catatanInternal = body.catatanInternal;
  if (body.penugasanKe !== undefined) item.penugasanKe = body.penugasanKe;
  if (body.dokumenDiminta !== undefined) item.dokumenDiminta = body.dokumenDiminta;
  if (body.estimasiSelesai !== undefined) item.estimasiSelesai = body.estimasiSelesai;
  if (body.nomorSuratKeluar !== undefined) item.nomorSuratKeluar = body.nomorSuratKeluar;

  if (body.status && body.status !== prevStatus) {
    addTimeline(item, {
      status: body.status,
      note: `Status diubah ke ${body.status}`,
      by: auth.session!.user.name,
    });
    if (body.catatanInternal) {
      addTimeline(item, {
        status: item.status,
        note: body.catatanInternal,
        by: auth.session!.user.name,
        internal: true,
      });
    }
  } else if (body.catatanInternal) {
    addTimeline(item, {
      status: item.status,
      note: body.catatanInternal,
      by: auth.session!.user.name,
      internal: true,
    });
  } else if (body.dokumenDiminta) {
    addTimeline(item, {
      status: item.status,
      note: `Dokumen diminta: ${body.dokumenDiminta}`,
      by: auth.session!.user.name,
    });
  }

  data[index] = item;
  await writeJson("pengajuan.json", data);

  await logAudit({
    userId: auth.session!.user.id,
    userName: auth.session!.user.name,
    userRole: auth.session!.user.role,
    action: "update",
    resource: "pengajuan",
    resourceId: item.id,
    detail: `status=${item.status}`,
  });

  const wargaList = await readJson<Warga[]>("warga.json", []);
  const pemohon = wargaList.find((w) => w.nik === item.nik);

  if (pemohon?.userId && body.status && body.status !== prevStatus) {
    await createWargaNotifikasi({
      userId: pemohon.userId,
      tipe: "pengajuan",
      judul: `Status pengajuan: ${item.status}`,
      pesan: `Pengajuan surat Anda kini berstatus ${item.status.replace(/-/g, " ")}.`,
      href: `/status/${item.id}`,
      level: item.status === "ditolak" ? "warning" : "success",
    });
  }

  if (pemohon?.noHp && body.status && body.status !== prevStatus) {
    await sendWhatsAppNotification({
      to: pemohon.noHp,
      message: formatStatusPengajuanNotification(item.namaPemohon, item.status, item.id),
    });
  }

  return NextResponse.json(item);
}
