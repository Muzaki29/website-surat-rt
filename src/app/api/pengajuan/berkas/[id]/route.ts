import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getUploadAbsolutePath } from "@/lib/berkas-storage";
import { readJson } from "@/lib/storage";
import type { PengajuanSurat } from "@/lib/types";
import fs from "fs/promises";

type Props = { params: Promise<{ id: string }> };

export async function GET(request: Request, { params }: Props) {
  const { id } = await params;
  const pengajuanId = new URL(request.url).searchParams.get("pengajuanId");

  if (!pengajuanId) {
    return NextResponse.json({ error: "pengajuanId wajib." }, { status: 400 });
  }

  const pengajuan = await readJson<PengajuanSurat[]>("pengajuan.json", []);
  const item = pengajuan.find((p) => p.id === pengajuanId);
  if (!item) {
    return NextResponse.json({ error: "Pengajuan tidak ditemukan." }, { status: 404 });
  }

  const berkas = item.berkas?.find((b) => b.id === id);
  if (!berkas) {
    return NextResponse.json({ error: "Berkas tidak ditemukan." }, { status: 404 });
  }

  const session = await auth();
  const isStaff =
    session?.user &&
    session.user.role !== "warga" &&
    ["admin", "ketua-rt", "sekretaris-rt", "bendahara-rt"].includes(session.user.role);

  let isOwner = false;
  if (session?.user?.role === "warga" && session.user.wargaId) {
    const warga = await prisma.warga.findUnique({ where: { id: session.user.wargaId } });
    isOwner = warga?.nik === item.nik;
  }

  if (!isStaff && !isOwner) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const fullPath = getUploadAbsolutePath(berkas.path);
    const buffer = await fs.readFile(fullPath);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": berkas.mimeType,
        "Content-Disposition": `inline; filename="${berkas.namaFile}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "File tidak ditemukan di server." }, { status: 404 });
  }
}
