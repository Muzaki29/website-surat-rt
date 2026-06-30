import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createId } from "@/lib/id";
import { getWargaFromSession, requirePermission, requireSession } from "@/lib/auth-api";
import type { Polling, PollingOpsi, StatusPolling } from "@/lib/types";

function parsePolling(row: {
  id: string;
  judul: string;
  deskripsi: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  status: string;
  opsiJson: string;
}): Polling {
  return {
    id: row.id,
    judul: row.judul,
    deskripsi: row.deskripsi,
    tanggalMulai: row.tanggalMulai,
    tanggalSelesai: row.tanggalSelesai,
    status: row.status as StatusPolling,
    opsi: JSON.parse(row.opsiJson) as PollingOpsi[],
  };
}

export async function GET(request: Request) {
  const status = new URL(request.url).searchParams.get("status");
  const rows = await prisma.polling.findMany({ orderBy: { tanggalMulai: "desc" } });
  let items = rows.map(parsePolling);

  if (status === "aktif") {
    items = items.filter((p) => p.status === "aktif");
  }

  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const body = await request.json();

  if (body.action === "vote") {
    const auth = await requireSession();
    if (auth.error) return auth.error;

    const { pollingId, opsiId } = body;
    let nik = body.nik as string | undefined;

    if (auth.session!.user.role === "warga") {
      const warga = await getWargaFromSession(auth.session!);
      nik = warga?.nik;
    }

    if (!pollingId || !opsiId || !nik) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    const row = await prisma.polling.findUnique({ where: { id: pollingId } });
    if (!row || row.status !== "aktif") {
      return NextResponse.json({ error: "Polling tidak aktif" }, { status: 400 });
    }

    const warga = await prisma.warga.findUnique({ where: { nik } });
    if (!warga || warga.status !== "aktif") {
      return NextResponse.json({ error: "NIK tidak valid" }, { status: 404 });
    }

    const existingVote = await prisma.pollingVote.findUnique({
      where: { pollingId_wargaId: { pollingId, wargaId: warga.id } },
    });
    if (existingVote) {
      return NextResponse.json({ error: "Anda sudah memilih pada polling ini." }, { status: 409 });
    }

    const opsi = JSON.parse(row.opsiJson) as PollingOpsi[];
    const index = opsi.findIndex((o) => o.id === opsiId);
    if (index === -1) {
      return NextResponse.json({ error: "Opsi tidak ditemukan" }, { status: 404 });
    }

    opsi[index].votes += 1;
    await prisma.$transaction([
      prisma.polling.update({
        where: { id: pollingId },
        data: { opsiJson: JSON.stringify(opsi) },
      }),
      prisma.pollingVote.create({
        data: {
          id: createId(),
          pollingId,
          wargaId: warga.id,
          opsiId,
          createdAt: new Date().toISOString(),
        },
      }),
    ]);

    return NextResponse.json(parsePolling({ ...row, opsiJson: JSON.stringify(opsi) }));
  }

  const auth = await requirePermission("polling:write");
  if (auth.error) return auth.error;

  const opsi: PollingOpsi[] = (body.opsi as string[]).filter(Boolean).map((label) => ({
    id: createId(),
    label,
    votes: 0,
  }));

  if (opsi.length < 2) {
    return NextResponse.json({ error: "Minimal 2 opsi polling" }, { status: 400 });
  }

  const polling = await prisma.polling.create({
    data: {
      id: createId(),
      judul: body.judul ?? "",
      deskripsi: body.deskripsi ?? "",
      tanggalMulai: body.tanggalMulai ?? new Date().toISOString().slice(0, 10),
      tanggalSelesai: body.tanggalSelesai ?? new Date().toISOString().slice(0, 10),
      status: (body.status as StatusPolling) ?? "draft",
      opsiJson: JSON.stringify(opsi),
    },
  });

  return NextResponse.json(parsePolling(polling), { status: 201 });
}

export async function PATCH(request: Request) {
  const auth = await requirePermission("polling:write");
  if (auth.error) return auth.error;

  const body = await request.json();
  const row = await prisma.polling.findUnique({ where: { id: body.id } });
  if (!row) return NextResponse.json({ error: "Polling tidak ditemukan" }, { status: 404 });

  const updated = await prisma.polling.update({
    where: { id: body.id },
    data: {
      status: body.status ?? row.status,
      judul: body.judul ?? row.judul,
      deskripsi: body.deskripsi ?? row.deskripsi,
    },
  });

  return NextResponse.json(parsePolling(updated));
}

export async function DELETE(request: Request) {
  const auth = await requirePermission("polling:write");
  if (auth.error) return auth.error;

  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID wajib" }, { status: 400 });

  await prisma.polling.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
