import { NextResponse } from "next/server";
import { createId } from "@/lib/id";
import { readJson, writeJson } from "@/lib/storage";
import type { Warga } from "@/lib/types";

export async function GET() {
  const warga = await readJson<Warga[]>("warga.json", []);
  return NextResponse.json(warga);
}

export async function POST(request: Request) {
  const body = await request.json();
  const warga = await readJson<Warga[]>("warga.json", []);

  const baru: Warga = {
    id: createId(),
    nama: body.nama ?? "",
    nik: body.nik ?? "",
    alamat: body.alamat ?? "",
    noHp: body.noHp ?? "",
    status: body.status === "nonaktif" ? "nonaktif" : "aktif",
    tanggalMasuk: body.tanggalMasuk ?? new Date().toISOString().slice(0, 10),
  };

  warga.push(baru);
  await writeJson("warga.json", warga);
  return NextResponse.json(baru, { status: 201 });
}
