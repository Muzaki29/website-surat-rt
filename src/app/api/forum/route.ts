import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { createId } from "@/lib/id";
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

  const threads = await prisma.forumThread.findMany({ orderBy: { updatedAt: "desc" } });
  const enriched: ForumThread[] = await Promise.all(
    threads.map(async (t) => {
      const last = await prisma.forumMessage.findFirst({
        where: { threadId: t.id },
        orderBy: { createdAt: "desc" },
      });
      const count = await prisma.forumMessage.count({ where: { threadId: t.id } });
      return {
        id: t.id,
        judul: t.judul,
        penulisUserId: t.penulisUserId,
        penulisNama: t.penulisNama,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        pesanTerakhir: last?.isi,
        jumlahPesan: count,
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
    return NextResponse.json({ error: "Judul topik minimal 3 karakter." }, { status: 400 });
  }
  if (!pesanAwal || pesanAwal.length < 2) {
    return NextResponse.json({ error: "Pesan awal wajib diisi." }, { status: 400 });
  }

  const now = new Date().toISOString();
  const threadId = createId();

  await prisma.$transaction([
    prisma.forumThread.create({
      data: {
        id: threadId,
        judul,
        penulisUserId: authResult.session!.user.id,
        penulisNama: authResult.session!.user.name,
        createdAt: now,
        updatedAt: now,
      },
    }),
    prisma.forumMessage.create({
      data: {
        id: createId(),
        threadId,
        penulisUserId: authResult.session!.user.id,
        penulisNama: authResult.session!.user.name,
        isi: pesanAwal,
        createdAt: now,
      },
    }),
  ]);

  return NextResponse.json({ id: threadId }, { status: 201 });
}
