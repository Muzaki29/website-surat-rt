import { prisma } from "@/lib/db";
import { FORUM_RETENTION_DAYS } from "@/lib/constants";
import { createId } from "@/lib/id";

export function computeForumExpiresAt(fromDate: Date = new Date()): string {
  const d = new Date(fromDate);
  d.setDate(d.getDate() + FORUM_RETENTION_DAYS);
  return d.toISOString();
}

export function daysUntilExpiry(expiresAt: string): number {
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (86400000)));
}

export function isForumExpired(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() <= Date.now();
}

/** Backfill expiresAt untuk thread lama yang belum punya field ini. */
export async function backfillForumExpiry(): Promise<void> {
  const threads = await prisma.forumThread.findMany();
  for (const t of threads) {
    if (!t.expiresAt) {
      await prisma.forumThread.update({
        where: { id: t.id },
        data: { expiresAt: computeForumExpiresAt(new Date(t.createdAt)) },
      });
    }
  }
}

/** Arsip thread kedaluwarsa ke log history lalu hapus dari forum aktif. */
export async function purgeExpiredForumThreads(): Promise<number> {
  const now = new Date().toISOString();
  const expired = await prisma.forumThread.findMany({
    where: { expiresAt: { lte: now } },
  });

  for (const thread of expired) {
    const messages = await prisma.forumMessage.findMany({
      where: { threadId: thread.id },
      orderBy: { createdAt: "asc" },
    });

    await prisma.forumHistoryLog.create({
      data: {
        id: createId(),
        threadId: thread.id,
        judul: thread.judul,
        penulisUserId: thread.penulisUserId,
        penulisNama: thread.penulisNama,
        createdAt: thread.createdAt,
        archivedAt: now,
        expiresAt: thread.expiresAt,
        jumlahPesan: messages.length,
        snapshotJson: JSON.stringify({
          thread: {
            id: thread.id,
            judul: thread.judul,
            penulisUserId: thread.penulisUserId,
            penulisNama: thread.penulisNama,
            createdAt: thread.createdAt,
            updatedAt: thread.updatedAt,
            expiresAt: thread.expiresAt,
          },
          messages,
        }),
      },
    });

    await prisma.forumMessage.deleteMany({ where: { threadId: thread.id } });
    await prisma.forumThread.delete({ where: { id: thread.id } });
  }

  return expired.length;
}

export async function maintainForumRetention(): Promise<void> {
  await backfillForumExpiry();
  await purgeExpiredForumThreads();
}
