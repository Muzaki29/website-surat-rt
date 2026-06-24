import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { createId } from "@/lib/id";
import {
  computeForumExpiresAt,
  daysUntilExpiry,
  maintainForumRetention,
} from "@/lib/forum-retention";
import type { ForumThread } from "@/lib/types";

async function requireForumUser() {
  const session = await auth();
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (session.user.role === "warga" && !session.user.wargaId) {
    return { error: NextResponse.json({ error: "Akun warga tidak valid." }, { status: 403 }) };
  }
  return { session, error: null };
}

export async function GET() {
  const authResult = await requireForumUser();
  if (authResult.error) return authResult.error;

  await maintainForumRetention();

  const threads = await prisma.forumThread.findMany({ orderBy: { updatedAt: "desc" } });
  const enriched: ForumThread[] = await Promise.all(
    threads.map(async (t) => {
      const messages = await prisma.forumMessage.findMany({
        where: { threadId: t.id },
        orderBy: { createdAt: "asc" },
      });
      const last = messages.at(-1);
      const first = messages.at(0);
      const expiresAt = t.expiresAt ?? computeForumExpiresAt(new Date(t.createdAt));
      return {
        id: t.id,
        judul: t.judul,
        penulisUserId: t.penulisUserId,
        penulisNama: t.penulisNama,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        expiresAt,
        pesanPembuka: first?.isi,
        pesanTerakhir: last?.isi,
        jumlahPesan: messages.length,
        hariTersisa: daysUntilExpiry(expiresAt),
      };
    }),
  );

  return NextResponse.json(enriched);
}

export async function POST(request: Request) {
  const authResult = await requireForumUser();
  if (authResult.error) return authResult.error;

  const body = await request.json();
  const judul = (body.judul as string)?.trim();
  const pesanAwal = (body.pesanAwal as string)?.trim();

  if (!judul || judul.length < 3) {
    return NextResponse.json({ error: "Judul artikel minimal 3 karakter." }, { status: 400 });
  }
  if (!pesanAwal || pesanAwal.length < 10) {
    return NextResponse.json({ error: "Isi pembuka minimal 10 karakter." }, { status: 400 });
  }

  const now = new Date();
  const nowIso = now.toISOString();
  const threadId = createId();

  await prisma.$transaction([
    prisma.forumThread.create({
      data: {
        id: threadId,
        judul,
        penulisUserId: authResult.session!.user.id,
        penulisNama: authResult.session!.user.name,
        createdAt: nowIso,
        updatedAt: nowIso,
        expiresAt: computeForumExpiresAt(now),
      },
    }),
    prisma.forumMessage.create({
      data: {
        id: createId(),
        threadId,
        penulisUserId: authResult.session!.user.id,
        penulisNama: authResult.session!.user.name,
        isi: pesanAwal,
        createdAt: nowIso,
      },
    }),
  ]);

  return NextResponse.json({ id: threadId }, { status: 201 });
}
