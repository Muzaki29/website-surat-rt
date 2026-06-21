import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { RT_INFO } from "@/lib/constants";
import type { SuratKeluar } from "@/lib/types";

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
