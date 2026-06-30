import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-api";
import { createId } from "@/lib/id";
import { readJson, writeJson } from "@/lib/storage";
import type { Pengumuman } from "@/lib/types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const publicOnly = searchParams.get("public") === "1";
  const pengumuman = await readJson<Pengumuman[]>("pengumuman.json", []);

  if (publicOnly) {
    const data = pengumuman
      .filter((p) => p.published)
      .sort((a, b) => b.tanggal.localeCompare(a.tanggal));
    return NextResponse.json(data);
  }

  const auth = await requirePermission("pengumuman:read");
  if (auth.error) return auth.error;

  const data = pengumuman.sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const auth = await requirePermission("pengumuman:write");
  if (auth.error) return auth.error;
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
  const auth = await requirePermission("pengumuman:write");
  if (auth.error) return auth.error;

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
