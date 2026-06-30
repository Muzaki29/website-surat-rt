import { NextResponse } from "next/server";
import { requirePermission, requireSession } from "@/lib/auth-api";
import { prisma } from "@/lib/db";
import { createId } from "@/lib/id";

function mapRow(r: {
  id: string;
  judul: string;
  deskripsi: string;
  tanggalMulai: string;
  tanggalSelesai: string | null;
  lokasi: string;
  published: boolean;
  createdBy: string;
  createdAt: string;
}) {
  return {
    id: r.id,
    judul: r.judul,
    deskripsi: r.deskripsi,
    tanggalMulai: r.tanggalMulai,
    tanggalSelesai: r.tanggalSelesai ?? undefined,
    lokasi: r.lokasi,
    published: r.published,
    createdBy: r.createdBy,
    createdAt: r.createdAt,
  };
}

export async function GET(request: Request) {
  const publicOnly = new URL(request.url).searchParams.get("public") === "1";

  if (publicOnly) {
    const rows = await prisma.kalenderKegiatan.findMany({
      where: { published: true },
      orderBy: { tanggalMulai: "asc" },
    });
    return NextResponse.json(rows.map(mapRow));
  }

  const auth = await requirePermission("kalender:read");
  if (auth.error) return auth.error;

  const rows = await prisma.kalenderKegiatan.findMany({
    orderBy: { tanggalMulai: "desc" },
  });
  return NextResponse.json(rows.map(mapRow));
}

export async function POST(request: Request) {
  const auth = await requirePermission("kalender:write");
  if (auth.error) return auth.error;

  const body = await request.json();
  const row = await prisma.kalenderKegiatan.create({
    data: {
      id: createId(),
      judul: body.judul ?? "",
      deskripsi: body.deskripsi ?? "",
      tanggalMulai: body.tanggalMulai ?? new Date().toISOString().slice(0, 10),
      tanggalSelesai: body.tanggalSelesai ?? null,
      lokasi: body.lokasi ?? "",
      published: body.published !== false,
      createdBy: auth.session!.user.name,
      createdAt: new Date().toISOString(),
    },
  });
  return NextResponse.json(mapRow(row), { status: 201 });
}

export async function PATCH(request: Request) {
  const auth = await requirePermission("kalender:write");
  if (auth.error) return auth.error;

  const body = await request.json();
  const existing = await prisma.kalenderKegiatan.findUnique({ where: { id: body.id } });
  if (!existing) return NextResponse.json({ error: "Kegiatan tidak ditemukan." }, { status: 404 });

  const row = await prisma.kalenderKegiatan.update({
    where: { id: body.id },
    data: {
      judul: body.judul ?? existing.judul,
      deskripsi: body.deskripsi ?? existing.deskripsi,
      tanggalMulai: body.tanggalMulai ?? existing.tanggalMulai,
      tanggalSelesai: body.tanggalSelesai ?? existing.tanggalSelesai,
      lokasi: body.lokasi ?? existing.lokasi,
      published: body.published ?? existing.published,
    },
  });
  return NextResponse.json(mapRow(row));
}

export async function DELETE(request: Request) {
  const auth = await requirePermission("kalender:write");
  if (auth.error) return auth.error;

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID wajib." }, { status: 400 });
  await prisma.kalenderKegiatan.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
