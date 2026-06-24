import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import type { ForumHistorySnapshot } from "@/lib/types";

type Props = { params: Promise<{ id: string }> };

async function requireForumUser() {
  const session = await auth();
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session, error: null };
}

export async function GET(_request: Request, { params }: Props) {
  const authResult = await requireForumUser();
  if (authResult.error) return authResult.error;

  const { id } = await params;
  const log = await prisma.forumHistoryLog.findUnique({ where: { id } });
  if (!log) {
    return NextResponse.json({ error: "Arsip tidak ditemukan." }, { status: 404 });
  }

  let snapshot: ForumHistorySnapshot;
  try {
    snapshot = JSON.parse(log.snapshotJson) as ForumHistorySnapshot;
  } catch {
    return NextResponse.json({ error: "Data arsip rusak." }, { status: 500 });
  }

  return NextResponse.json({
    log: {
      id: log.id,
      threadId: log.threadId,
      judul: log.judul,
      penulisUserId: log.penulisUserId,
      penulisNama: log.penulisNama,
      createdAt: log.createdAt,
      archivedAt: log.archivedAt,
      expiresAt: log.expiresAt,
      jumlahPesan: log.jumlahPesan,
    },
    snapshot,
  });
}
