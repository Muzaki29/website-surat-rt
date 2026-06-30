import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getWargaFromSession } from "@/lib/auth-api";
import { generateKwitansiPdf } from "@/lib/pdf-surat";
import { readJson } from "@/lib/storage";
import type { TagihanIuran } from "@/lib/types";

type Props = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Props) {
  const { id } = await params;
  const tagihan = await readJson<TagihanIuran[]>("iuran.json", []);
  const item = tagihan.find((t) => t.id === id);

  if (!item) {
    return NextResponse.json({ error: "Tagihan tidak ditemukan." }, { status: 404 });
  }

  if (item.status !== "lunas") {
    return NextResponse.json({ error: "Kwitansi hanya untuk pembayaran lunas." }, { status: 403 });
  }

  const session = await auth();
  const isStaff = session?.user && session.user.role !== "warga";
  let isOwner = false;
  if (session?.user?.role === "warga") {
    const warga = await getWargaFromSession(session);
    isOwner = warga?.id === item.wargaId;
  }

  if (!isStaff && !isOwner) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pdf = await generateKwitansiPdf(item);
  return new NextResponse(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="kwitansi-${id.slice(0, 8)}.pdf"`,
    },
  });
}
