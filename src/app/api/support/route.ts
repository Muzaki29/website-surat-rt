import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-api";
import { createId } from "@/lib/id";
import { readJson, writeJson } from "@/lib/storage";
import type { TiketSupport } from "@/lib/types";

export async function GET() {
  const auth = await requirePermission("support:read");
  if (auth.error) return auth.error;

  const tiket = await readJson<TiketSupport[]>("support.json", []);
  return NextResponse.json(tiket.sort((a, b) => b.tanggal.localeCompare(a.tanggal)));
}

export async function POST(request: Request) {
  const body = await request.json();
  const tiket = await readJson<TiketSupport[]>("support.json", []);

  const baru: TiketSupport = {
    id: createId(),
    nama: body.nama ?? "",
    kontak: body.kontak ?? "",
    topik: body.topik ?? "Lainnya",
    pesan: body.pesan ?? "",
    tanggal: new Date().toISOString().slice(0, 10),
    status: "terbuka",
  };

  tiket.unshift(baru);
  await writeJson("support.json", tiket);
  return NextResponse.json(baru, { status: 201 });
}

export async function PATCH(request: Request) {
  const auth = await requirePermission("support:manage");
  if (auth.error) return auth.error;

  const body = await request.json();
  const tiket = await readJson<TiketSupport[]>("support.json", []);
  const index = tiket.findIndex((t) => t.id === body.id);

  if (index === -1) {
    return NextResponse.json({ error: "Tiket tidak ditemukan" }, { status: 404 });
  }

  if (body.status) tiket[index].status = body.status;
  if (body.balasan) {
    tiket[index].balasan = body.balasan;
    tiket[index].tanggalBalasan = new Date().toISOString().slice(0, 10);
    tiket[index].status = "selesai";
  }

  await writeJson("support.json", tiket);
  return NextResponse.json(tiket[index]);
}
