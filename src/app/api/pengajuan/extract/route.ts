import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  isAllowedBerkasType,
  isOcrSupported,
  MAX_BERKAS_SIZE,
} from "@/lib/berkas-constants";
import { saveTempUpload } from "@/lib/berkas-storage";
import { mergeExtracted, parseIdentityDocument } from "@/lib/ktp-parser";
import { createId } from "@/lib/id";
import { ocrBuffer } from "@/lib/ocr";
import type { ExtractedBerkasResult, JenisBerkasPengajuan } from "@/lib/types";

const OCR_JENIS: JenisBerkasPengajuan[] = ["ktp", "kk"];

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("file");
    const jenis = (form.get("jenis") as JenisBerkasPengajuan) || "ktp";

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File wajib diunggah." }, { status: 400 });
    }

    if (!isAllowedBerkasType(file.type)) {
      return NextResponse.json(
        { error: "Format tidak didukung. Gunakan JPG, PNG, WEBP, atau PDF." },
        { status: 400 },
      );
    }

    if (file.size > MAX_BERKAS_SIZE) {
      return NextResponse.json({ error: "Ukuran file maksimal 5 MB." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploadId = createId();
    await saveTempUpload(uploadId, buffer, file.type);

    let extracted = {
      nik: undefined as string | undefined,
      noKk: undefined as string | undefined,
      namaPemohon: undefined as string | undefined,
      alamat: undefined as string | undefined,
    };
    let source: string[] = [];
    let message = "Berkas berhasil diunggah.";

    if (OCR_JENIS.includes(jenis) && isOcrSupported(file.type)) {
      const text = await ocrBuffer(buffer, file.type);
      if (text && text.trim().length > 10) {
        const parsed = parseIdentityDocument(text);
        let warga = null;
        if (parsed.nik) {
          warga = await prisma.warga.findUnique({ where: { nik: parsed.nik } });
        }
        const merged = mergeExtracted(parsed, warga);
        extracted = {
          nik: merged.nik,
          noKk: merged.noKk,
          namaPemohon: merged.namaPemohon,
          alamat: merged.alamat,
        };
        source = merged.source;

        const fields = Object.entries(extracted)
          .filter(([, v]) => v)
          .map(([k]) => k);

        if (fields.length > 0) {
          message = warga
            ? "Data terdeteksi dari berkas dan dicocokkan dengan database warga RT."
            : "Data terdeteksi dari berkas. Periksa dan sesuaikan jika perlu.";
        } else {
          message = "Berkas diunggah, tetapi data tidak terbaca jelas. Isi formulir manual.";
        }
      } else {
        message = "OCR tidak membaca teks dengan jelas. Isi formulir manual.";
      }
    } else if (OCR_JENIS.includes(jenis) && file.type === "application/pdf") {
      message = "PDF diunggah. Deteksi otomatis hanya untuk foto/scan (JPG/PNG).";
    }

    const fieldsDetected = Object.entries(extracted)
      .filter(([, v]) => Boolean(v))
      .map(([k]) => k);

    const result: ExtractedBerkasResult = {
      uploadId,
      jenis,
      namaFile: file.name,
      mimeType: file.type,
      extracted,
      fieldsDetected,
      source,
      ocrSupported: isOcrSupported(file.type),
      message,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("[pengajuan/extract]", error);
    return NextResponse.json({ error: "Gagal memproses berkas." }, { status: 500 });
  }
}
