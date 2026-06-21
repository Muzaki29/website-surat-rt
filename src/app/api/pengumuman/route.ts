import { NextResponse } from "next/server";
import { createId } from "@/lib/id";
import { readJson, writeJson } from "@/lib/storage";
import type { Pengumuman } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const publicOnly = searchParams.get("public") === "1";
  const pengumuman = await readJson<Pengumuman[]>("pengumuman.json", []);
  const data = publicOnly
    ? pengumuman.filter((p) => p.published).sort((a, b) => b.tanggal.localeCompare(a.tanggal))
    : pengumuman.sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const pengumuman = await readJson<Pengumuman[]>("pengumuman.json", []);

  const baru: Pengumuman = {
    id: createId(),
    judul: body.judul ?? "",
    isi: body.isi ?? "",
    tanggal: body.tanggal ?? new Date().toISOString().slice(0, 10),
    penulis: body.penulis ?? "Pengurus RT",
    published: body.published !== false,
  };

  pengumuman.unshift(baru);
  await writeJson("pengumuman.json", pengumuman);
  return NextResponse.json(baru, { status: 201 });
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID wajib" }, { status: 400 });

  const pengumuman = await readJson<Pengumuman[]>("pengumuman.json", []);
  await writeJson(
    "pengumuman.json",
    pengumuman.filter((p) => p.id !== id),
  );
  return NextResponse.json({ ok: true });
}
