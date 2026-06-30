import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getWargaFromSession, requireWarga } from "@/lib/auth-api";
import { generatePengajuanPdf } from "@/lib/pdf-surat";
import { readJson } from "@/lib/storage";
import type { PengajuanSurat } from "@/lib/types";

type Props = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Props) {
  const { id } = await params;
  const pengajuan = await readJson<PengajuanSurat[]>("pengajuan.json", []);
  const item = pengajuan.find((p) => p.id === id);

  if (!item) {
    return NextResponse.json({ error: "Pengajuan tidak ditemukan." }, { status: 404 });
  }

  if (!["disetujui", "selesai"].includes(item.status)) {
    return NextResponse.json(
      { error: "Surat belum disetujui dan tidak dapat diunduh." },
      { status: 403 },
    );
  }

  const session = await auth();
  const isStaff = session?.user && session.user.role !== "warga";

  let isOwner = false;
  if (session?.user?.role === "warga") {
    const warga = await getWargaFromSession(session);
    isOwner = warga?.nik === item.nik;
  }

  if (!isStaff && !isOwner) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pdf = await generatePengajuanPdf(item);
  return new NextResponse(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="surat-${id.slice(0, 8)}.pdf"`,
    },
  });
}
