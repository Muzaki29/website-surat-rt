import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { JENIS_SURAT } from "@/data/jenis-surat";
import { RT_INFO } from "@/lib/constants";
import type { PengajuanSurat, SuratKeluar, TagihanIuran } from "@/lib/types";

function jenisLabel(slug: string) {
  return JENIS_SURAT.find((j) => j.slug === slug)?.nama ?? slug.replace(/-/g, " ");
}

export async function generateSuratKeluarPdf(surat: SuratKeluar): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  const margin = 56;
  let y = 780;

  const draw = (text: string, size = 11, bold = false, color = rgb(0.1, 0.1, 0.1)) => {
    page.drawText(text, {
      x: margin,
      y,
      size,
      font: bold ? fontBold : font,
      color,
    });
    y -= size + 8;
  };

  draw(RT_INFO.nama.toUpperCase(), 14, true);
  draw(`${RT_INFO.alamat}, ${RT_INFO.kelurahan}`, 10);
  draw(`${RT_INFO.kecamatan}, ${RT_INFO.kabupaten}, ${RT_INFO.provinsi}`, 10);
  draw(`Telp: ${RT_INFO.telepon}`, 10);
  y -= 12;

  draw(`Nomor: ${surat.nomorSurat}`, 11, true);
  draw(`Tanggal: ${surat.tanggalSurat}`, 11);
  y -= 8;

  draw("SURAT KELUAR", 13, true);
  y -= 4;

  draw(`Kepada Yth. ${surat.tujuan}`, 11);
  draw(`Perihal: ${surat.perihal}`, 11, true);
  y -= 12;

  const body =
    "Dengan hormat,\n\nBersama surat ini kami sampaikan hal-hal sebagaimana dimaksud dalam perihal di atas. " +
    "Demikian surat ini kami buat untuk dapat dipergunakan sebagaimana mestinya.";

  for (const line of body.split("\n")) {
    draw(line, 11);
  }

  y -= 24;
  draw(`${RT_INFO.kelurahan}, ${surat.tanggalSurat}`, 11);
  y -= 36;
  draw(RT_INFO.ketua, 11, true);
  draw("Ketua RT", 10);

  return doc.save();
}

export async function generatePengajuanPdf(pengajuan: PengajuanSurat): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const margin = 56;
  let y = 780;

  const draw = (text: string, size = 11, bold = false) => {
    const lines = text.match(/.{1,80}(\s|$)/g) ?? [text];
    for (const line of lines) {
      page.drawText(line.trim(), { x: margin, y, size, font: bold ? fontBold : font });
      y -= size + 6;
    }
  };

  draw(RT_INFO.nama.toUpperCase(), 14, true);
  draw(`${RT_INFO.alamat}`, 10);
  y -= 8;
  draw("SURAT KETERANGAN / PENGANTAR RT", 13, true);
  y -= 4;
  if (pengajuan.nomorSuratKeluar) draw(`Nomor: ${pengajuan.nomorSuratKeluar}`, 11, true);
  draw(`Tanggal: ${pengajuan.estimasiSelesai ?? pengajuan.tanggalAjuan}`, 11);
  y -= 8;
  draw(`Jenis: ${jenisLabel(pengajuan.jenisSurat)}`, 11, true);
  draw(`Nama: ${pengajuan.namaPemohon}`, 11);
  draw(`NIK: ${pengajuan.nik}`, 11);
  draw(`Alamat: ${pengajuan.alamat}`, 11);
  draw(`Keperluan: ${pengajuan.keperluan}`, 11);
  y -= 12;
  draw(
    "Surat ini diterbitkan berdasarkan pengajuan warga melalui platform digital RT dan berlaku setelah ditandatangani pengurus.",
    11,
  );
  y -= 24;
  draw(`${RT_INFO.kelurahan}, ${new Date().toISOString().slice(0, 10)}`, 11);
  y -= 36;
  draw(RT_INFO.ketua, 11, true);
  draw("Ketua RT", 10);

  return doc.save();
}

export async function generateKwitansiPdf(tagihan: TagihanIuran): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([595.28, 841.89]);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const margin = 56;
  let y = 760;

  const draw = (text: string, size = 11, bold = false) => {
    page.drawText(text, { x: margin, y, size, font: bold ? fontBold : font });
    y -= size + 8;
  };

  draw("KWITANSI PEMBAYARAN IURAN RT", 14, true);
  draw(RT_INFO.nama, 10);
  y -= 8;
  draw(`No. Ref: ${tagihan.kodeReferensi ?? tagihan.id.slice(0, 12)}`, 11);
  draw(`Tanggal: ${tagihan.tanggalBayar ?? "-"}`, 11);
  draw(`Telah terima dari: ${tagihan.wargaNama}`, 11);
  draw(`Untuk: ${tagihan.jenisIuran} — Periode ${tagihan.periode}`, 11);
  draw(`Nominal: Rp ${tagihan.nominal.toLocaleString("id-ID")}`, 12, true);
  draw(`Metode: ${tagihan.metodePembayaran ?? "manual"}`, 11);
  draw(`Status: ${tagihan.status}`, 11);
  y -= 24;
  draw(RT_INFO.bendahara, 11, true);
  draw("Bendahara RT", 10);

  return doc.save();
}
