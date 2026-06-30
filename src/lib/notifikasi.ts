import { prisma } from "@/lib/db";
import { createId } from "@/lib/id";
import type { Notifikasi } from "@/lib/types";

type NotifInput = {
  tipe: Notifikasi["tipe"];
  judul: string;
  pesan: string;
  href?: string;
  level?: Notifikasi["level"];
  meta?: Record<string, unknown>;
};

function mapNotifikasi(row: {
  id: string;
  tipe: string;
  judul: string;
  pesan: string;
  href: string | null;
  level: string;
  dibaca: boolean;
  audience: string;
  userId: string | null;
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
    audience: row.audience as Notifikasi["audience"],
    userId: row.userId ?? undefined,
    createdAt: row.createdAt,
    meta,
  };
}

async function insertNotifikasi(
  input: NotifInput & { audience: "admin" | "warga"; userId?: string },
): Promise<Notifikasi> {
  const row = await prisma.notifikasi.create({
    data: {
      id: createId(),
      tipe: input.tipe,
      judul: input.judul,
      pesan: input.pesan,
      href: input.href ?? null,
      level: input.level ?? "info",
      dibaca: false,
      audience: input.audience,
      userId: input.userId ?? null,
      createdAt: new Date().toISOString(),
      metaJson: JSON.stringify(input.meta ?? {}),
    },
  });
  return mapNotifikasi(row);
}

/** Notifikasi untuk panel admin (semua pengurus). */
export async function createNotifikasi(input: NotifInput): Promise<Notifikasi> {
  return insertNotifikasi({ ...input, audience: "admin" });
}

/** Notifikasi untuk satu akun warga. */
export async function createWargaNotifikasi(
  input: NotifInput & { userId: string },
): Promise<Notifikasi> {
  return insertNotifikasi({ ...input, audience: "warga", userId: input.userId });
}

/** Kirim notifikasi ke warga berdasarkan wargaId. */
export async function notifyWargaByWargaId(
  wargaId: string,
  input: NotifInput,
): Promise<void> {
  const warga = await prisma.warga.findUnique({ where: { id: wargaId } });
  if (!warga?.userId) return;
  await createWargaNotifikasi({ ...input, userId: warga.userId });
}

export async function listAdminNotifikasi(limit = 50): Promise<Notifikasi[]> {
  const rows = await prisma.notifikasi.findMany({
    where: { audience: "admin" },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map(mapNotifikasi);
}

export async function listWargaNotifikasi(userId: string, limit = 50): Promise<Notifikasi[]> {
  const rows = await prisma.notifikasi.findMany({
    where: { audience: "warga", userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map(mapNotifikasi);
}

export async function countUnreadAdminNotifikasi(): Promise<number> {
  return prisma.notifikasi.count({ where: { audience: "admin", dibaca: false } });
}

export async function countUnreadWargaNotifikasi(userId: string): Promise<number> {
  return prisma.notifikasi.count({
    where: { audience: "warga", userId, dibaca: false },
  });
}

export async function markNotifikasiRead(id: string): Promise<void> {
  await prisma.notifikasi.update({
    where: { id },
    data: { dibaca: true },
  });
}

export async function markWargaNotifikasiRead(id: string, userId: string): Promise<boolean> {
  const result = await prisma.notifikasi.updateMany({
    where: { id, audience: "warga", userId },
    data: { dibaca: true },
  });
  return result.count === 1;
}

export async function markAllAdminNotifikasiRead(): Promise<void> {
  await prisma.notifikasi.updateMany({
    where: { audience: "admin", dibaca: false },
    data: { dibaca: true },
  });
}

export async function markAllWargaNotifikasiRead(userId: string): Promise<void> {
  await prisma.notifikasi.updateMany({
    where: { audience: "warga", userId, dibaca: false },
    data: { dibaca: true },
  });
}

/** @deprecated use listAdminNotifikasi */
export async function listNotifikasi(limit = 50): Promise<Notifikasi[]> {
  return listAdminNotifikasi(limit);
}

/** @deprecated */
export async function countUnreadNotifikasi(): Promise<number> {
  return countUnreadAdminNotifikasi();
}

/** @deprecated */
export async function markAllNotifikasiRead(): Promise<void> {
  return markAllAdminNotifikasiRead();
}

export async function broadcastPengumumanToWarga(input: {
  judul: string;
  pengumumanId: string;
}): Promise<number> {
  const wargaUsers = await prisma.user.findMany({
    where: { role: "warga", active: true, wargaId: { not: null } },
  });
  let count = 0;
  for (const u of wargaUsers) {
    const w = await prisma.warga.findUnique({ where: { id: u.wargaId! } });
    if (!w || w.status !== "aktif") continue;
    await createWargaNotifikasi({
      userId: u.id,
      tipe: "sistem",
      judul: "Pengumuman RT baru",
      pesan: input.judul,
      href: "/pengumuman",
      level: "info",
      meta: { pengumumanId: input.pengumumanId },
    });
    count++;
  }
  return count;
}
