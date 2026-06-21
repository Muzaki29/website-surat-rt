import type { JenisSuratInfo } from "@/lib/types";

export const JENIS_SURAT: JenisSuratInfo[] = [
  {
    slug: "surat-keterangan-domisili",
    nama: "Surat Keterangan Domisili",
    deskripsi: "Surat keterangan tempat tinggal warga di lingkungan RT.",
    estimasiHari: 1,
    persyaratan: ["KTP", "KK", "Surat pengantar RW (jika diperlukan)"],
  },
  {
    slug: "surat-keterangan-tidak-mampu",
    nama: "Surat Keterangan Tidak Mampu (SKTM)",
    deskripsi: "Surat keterangan tidak mampu untuk keperluan bantuan sosial atau pendidikan.",
    estimasiHari: 2,
    persyaratan: ["KTP", "KK", "Surat permohonan", "Foto rumah (opsional)"],
  },
  {
    slug: "surat-pengantar-nikah",
    nama: "Surat Pengantar Nikah",
    deskripsi: "Surat pengantar ke KUA untuk keperluan pernikahan.",
    estimasiHari: 1,
    persyaratan: ["KTP calon mempelai", "KK", "Foto calon mempelai", "Akte kelahiran"],
  },
  {
    slug: "surat-keterangan-usaha",
    nama: "Surat Keterangan Usaha",
    deskripsi: "Surat keterangan usaha untuk UMKM di lingkungan RT.",
    estimasiHari: 1,
    persyaratan: ["KTP", "KK", "Foto tempat usaha"],
  },
  {
    slug: "surat-keterangan-belum-menikah",
    nama: "Surat Keterangan Belum Menikah",
    deskripsi: "Surat keterangan status belum menikah.",
    estimasiHari: 1,
    persyaratan: ["KTP", "KK"],
  },
  {
    slug: "surat-pengantar-skck",
    nama: "Surat Pengantar SKCK",
    deskripsi: "Surat pengantar ke Polsek untuk pembuatan SKCK.",
    estimasiHari: 1,
    persyaratan: ["KTP", "KK", "Pas foto 4x6 (2 lembar)"],
  },
  {
    slug: "surat-keterangan-ahli-waris",
    nama: "Surat Keterangan Ahli Waris",
    deskripsi: "Surat keterangan ahli waris untuk keperluan administrasi warisan.",
    estimasiHari: 3,
    persyaratan: ["KTP ahli waris", "KK", "Akte kematian", "Akte kelahiran ahli waris"],
  },
  {
    slug: "surat-lainnya",
    nama: "Surat Lainnya",
    deskripsi: "Pengajuan surat keterangan lain sesuai kebutuhan warga.",
    estimasiHari: 2,
    persyaratan: ["KTP", "KK", "Keterangan keperluan surat"],
  },
];

export function getJenisSuratBySlug(slug: string): JenisSuratInfo | undefined {
  return JENIS_SURAT.find((item) => item.slug === slug);
}
