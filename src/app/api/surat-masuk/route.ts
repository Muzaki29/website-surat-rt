import { NextResponse } from "next/server";
import { createId } from "@/lib/id";
import { generateNomorAgenda } from "@/lib/nomor-surat";
import { readJson, writeJson } from "@/lib/storage";
import type { SuratMasuk } from "@/lib/types";

export async function GET() {
  const data = await readJson<SuratMasuk[]>("surat-masuk.json", []);
  return NextResponse.json(data.sort((a, b) => b.tanggalTerima.localeCompare(a.tanggalTerima)));
}

export async function POST(request: Request) {
  const body = await request.json();
  const data = await readJson<SuratMasuk[]>("surat-masuk.json", []);
  const nomorAgenda = body.nomorAgenda || (await generateNomorAgenda());

  const baru: SuratMasuk = {
    id: createId(),
    nomorAgenda,
    tanggalTerima: body.tanggalTerima ?? new Date().toISOString().slice(0, 10),
    pengirim: body.pengirim ?? "",
    perihal: body.perihal ?? "",
    status: body.status === "selesai" ? "selesai" : "diproses",
  };

  data.unshift(baru);
  await writeJson("surat-masuk.json", data);
  return NextResponse.json(baru, { status: 201 });
}

export async function DELETE(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID wajib" }, { status: 400 });
  const data = await readJson<SuratMasuk[]>("surat-masuk.json", []);
  await writeJson("surat-masuk.json", data.filter((s) => s.id !== id));
  return NextResponse.json({ ok: true });
}
