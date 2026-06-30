import type { JenisBerkasPengajuan } from "@/lib/types";

export const MAX_BERKAS_SIZE = 5 * 1024 * 1024; // 5 MB

export const BERKAS_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

export const JENIS_BERKAS_OPTIONS: { id: JenisBerkasPengajuan; label: string; ocr: boolean }[] = [
  { id: "ktp", label: "KTP", ocr: true },
  { id: "kk", label: "Kartu Keluarga (KK)", ocr: true },
  { id: "pendukung", label: "Dokumen Pendukung", ocr: false },
];

export function isAllowedBerkasType(mime: string): boolean {
  return (BERKAS_ALLOWED_TYPES as readonly string[]).includes(mime);
}

export function extFromMime(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "application/pdf":
      return ".pdf";
    default:
      return ".bin";
  }
}

export function isOcrSupported(mime: string): boolean {
  return mime.startsWith("image/");
}
