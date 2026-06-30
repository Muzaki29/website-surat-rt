import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-api";
import { readJson } from "@/lib/storage";
import { generateSuratKeluarPdf } from "@/lib/pdf-surat";
import type { SuratKeluar } from "@/lib/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requirePermission("surat:read");
  if (auth.error) return auth.error;
  const { id } = await params;
  const data = await readJson<SuratKeluar[]>("surat-keluar.json", []);
  const surat = data.find((s) => s.id === id);

  if (!surat) {
    return NextResponse.json({ error: "Surat tidak ditemukan" }, { status: 404 });
  }

  const pdf = await generateSuratKeluarPdf(surat);
  const filename = `surat-keluar-${surat.nomorSurat.replace(/\//g, "-")}.pdf`;

  return new NextResponse(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
