import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import type { ForumHistoryLog } from "@/lib/types";

async function requireForumUser() {
  const session = await auth();
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session, error: null };
}

export async function GET() {
  const authResult = await requireForumUser();
  if (authResult.error) return authResult.error;

  const logs = await prisma.forumHistoryLog.findMany({
    orderBy: { archivedAt: "desc" },
  });

  const items: ForumHistoryLog[] = logs.map((log) => ({
    id: log.id,
    threadId: log.threadId,
    judul: log.judul,
    penulisUserId: log.penulisUserId,
    penulisNama: log.penulisNama,
    createdAt: log.createdAt,
    archivedAt: log.archivedAt,
    expiresAt: log.expiresAt,
    jumlahPesan: log.jumlahPesan,
  }));

  return NextResponse.json(items);
}
