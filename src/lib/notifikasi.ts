import { prisma } from "@/lib/db";
import { createId } from "@/lib/id";
import type { Notifikasi } from "@/lib/types";

export async function createNotifikasi(input: {
  tipe: Notifikasi["tipe"];
  judul: string;
  pesan: string;
  href?: string;
  level?: Notifikasi["level"];
  meta?: Record<string, unknown>;
}): Promise<Notifikasi> {
  const row = await prisma.notifikasi.create({
    data: {
      id: createId(),
      tipe: input.tipe,
      judul: input.judul,
      pesan: input.pesan,
      href: input.href ?? null,
      level: input.level ?? "info",
      dibaca: false,
      createdAt: new Date().toISOString(),
      metaJson: JSON.stringify(input.meta ?? {}),
    },
  });

  return mapNotifikasi(row);
}

function mapNotifikasi(row: {
  id: string;
  tipe: string;
  judul: string;
  pesan: string;
  href: string | null;
  level: string;
  dibaca: boolean;
  createdAt: string;
  metaJson: string;
}): Notifikasi {
  let meta: Record<string, unknown> = {};
  try {
    meta = JSON.parse(row.metaJson) as Record<string, unknown>;
  } catch {
    meta = {};
  }
  return {
    id: row.id,
    tipe: row.tipe as Notifikasi["tipe"],
    judul: row.judul,
    pesan: row.pesan,
    href: row.href ?? undefined,
    level: row.level as Notifikasi["level"],
    dibaca: row.dibaca,
    createdAt: row.createdAt,
    meta,
  };
}

export async function listNotifikasi(limit = 50): Promise<Notifikasi[]> {
  const rows = await prisma.notifikasi.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map(mapNotifikasi);
}

export async function countUnreadNotifikasi(): Promise<number> {
  return prisma.notifikasi.count({ where: { dibaca: false } });
}

export async function markNotifikasiRead(id: string): Promise<void> {
  await prisma.notifikasi.update({
    where: { id },
    data: { dibaca: true },
  });
}

export async function markAllNotifikasiRead(): Promise<void> {
  await prisma.notifikasi.updateMany({
    where: { dibaca: false },
    data: { dibaca: true },
  });
}
