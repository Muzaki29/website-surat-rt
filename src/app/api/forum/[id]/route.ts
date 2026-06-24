import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { createId } from "@/lib/id";
import {
  computeForumExpiresAt,
  daysUntilExpiry,
  isForumExpired,
  maintainForumRetention,
} from "@/lib/forum-retention";

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

  await maintainForumRetention();

  const { id } = await params;
  const thread = await prisma.forumThread.findUnique({ where: { id } });
  if (!thread) {
    const archived = await prisma.forumHistoryLog.findFirst({ where: { threadId: id } });
    if (archived) {
      return NextResponse.json(
        {
          error: "Diskusi ini sudah diarsipkan.",
          archivedId: archived.id,
        },
        { status: 410 },
      );
    }
    return NextResponse.json({ error: "Artikel tidak ditemukan." }, { status: 404 });
  }

  const expiresAt = thread.expiresAt ?? computeForumExpiresAt(new Date(thread.createdAt));
  if (isForumExpired(expiresAt)) {
    await maintainForumRetention();
    const archived = await prisma.forumHistoryLog.findFirst({ where: { threadId: id } });
    return NextResponse.json(
      {
        error: "Diskusi ini sudah diarsipkan.",
        archivedId: archived?.id,
      },
      { status: 410 },
    );
  }

  const messages = await prisma.forumMessage.findMany({
    where: { threadId: id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    thread: {
      ...thread,
      expiresAt,
      hariTersisa: daysUntilExpiry(expiresAt),
    },
    messages,
  });
}

export async function POST(request: Request, { params }: Props) {
  const authResult = await requireForumUser();
  if (authResult.error) return authResult.error;

  await maintainForumRetention();

  const { id } = await params;
  const thread = await prisma.forumThread.findUnique({ where: { id } });
  if (!thread) {
    return NextResponse.json({ error: "Artikel tidak ditemukan." }, { status: 404 });
  }

  const expiresAt = thread.expiresAt ?? computeForumExpiresAt(new Date(thread.createdAt));
  if (isForumExpired(expiresAt)) {
    return NextResponse.json(
      { error: "Diskusi sudah berakhir dan tidak menerima tanggapan baru." },
      { status: 410 },
    );
  }

  const body = await request.json();
  const isi = (body.isi as string)?.trim();
  if (!isi || isi.length < 2) {
    return NextResponse.json({ error: "Tanggapan minimal 2 karakter." }, { status: 400 });
  }

  const now = new Date().toISOString();
  const message = await prisma.forumMessage.create({
    data: {
      id: createId(),
      threadId: id,
      penulisUserId: authResult.session!.user.id,
      penulisNama: authResult.session!.user.name,
      isi,
      createdAt: now,
    },
  });

  await prisma.forumThread.update({
    where: { id },
    data: { updatedAt: now },
  });

  return NextResponse.json(message, { status: 201 });
}
