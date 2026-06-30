import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-api";
import { createId } from "@/lib/id";
import { generateNomorSurat } from "@/lib/nomor-surat";
import { readJson, writeJson } from "@/lib/storage";
import type { SuratKeluar } from "@/lib/types";

export async function GET() {
  const auth = await requirePermission("surat:read");
  if (auth.error) return auth.error;

  const data = await readJson<SuratKeluar[]>("surat-keluar.json", []);
  return NextResponse.json(data.sort((a, b) => b.tanggalSurat.localeCompare(a.tanggalSurat)));
}

export async function POST(request: Request) {
  const auth = await requirePermission("surat:write");
  if (auth.error) return auth.error;
  const body = await request.json();
  const data = await readJson<SuratKeluar[]>("surat-keluar.json", []);
  const nomorSurat = body.nomorSurat || (await generateNomorSurat());

  const baru: SuratKeluar = {
    id: createId(),
    nomorSurat,
    tanggalSurat: body.tanggalSurat ?? new Date().toISOString().slice(0, 10),
    tujuan: body.tujuan ?? "",
    perihal: body.perihal ?? "",
    status: body.status === "selesai" ? "selesai" : "diproses",
  };

  data.unshift(baru);
  await writeJson("surat-keluar.json", data);
  return NextResponse.json(baru, { status: 201 });
}

export async function DELETE(request: Request) {
  const auth = await requirePermission("surat:write");
  if (auth.error) return auth.error;

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID wajib" }, { status: 400 });
  const data = await readJson<SuratKeluar[]>("surat-keluar.json", []);
  await writeJson("surat-keluar.json", data.filter((s) => s.id !== id));
  return NextResponse.json({ ok: true });
}
