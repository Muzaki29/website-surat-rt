import { readJson } from "@/lib/storage";
import type { ArsipItem, PengajuanSurat, SuratKeluar, SuratMasuk } from "@/lib/types";

export interface ArsipFilter {
  q?: string;
  jenis?: "all" | "surat-masuk" | "surat-keluar" | "pengajuan";
  dari?: string;
  sampai?: string;
}

function matchQuery(text: string, q: string): boolean {
  return text.toLowerCase().includes(q.toLowerCase());
}

function inDateRange(tanggal: string, dari?: string, sampai?: string): boolean {
  if (dari && tanggal < dari) return false;
  if (sampai && tanggal > sampai) return false;
  return true;
}

export async function searchArsip(filter: ArsipFilter = {}): Promise<ArsipItem[]> {
  const [suratMasuk, suratKeluar, pengajuan] = await Promise.all([
    readJson<SuratMasuk[]>("surat-masuk.json", []),
    readJson<SuratKeluar[]>("surat-keluar.json", []),
    readJson<PengajuanSurat[]>("pengajuan.json", []),
  ]);

  const q = filter.q?.trim() ?? "";
  const jenis = filter.jenis ?? "all";
  const items: ArsipItem[] = [];

  if (jenis === "all" || jenis === "surat-masuk") {
    for (const s of suratMasuk) {
      if (!inDateRange(s.tanggalTerima, filter.dari, filter.sampai)) continue;
      const haystack = `${s.nomorAgenda} ${s.pengirim} ${s.perihal}`;
      if (q && !matchQuery(haystack, q)) continue;
      items.push({
        id: s.id,
        jenis: "surat-masuk",
        nomor: s.nomorAgenda,
        tanggal: s.tanggalTerima,
        subjek: s.perihal,
        pihak: s.pengirim,
        status: s.status,
      });
    }
  }

  if (jenis === "all" || jenis === "surat-keluar") {
    for (const s of suratKeluar) {
      if (!inDateRange(s.tanggalSurat, filter.dari, filter.sampai)) continue;
      const haystack = `${s.nomorSurat} ${s.tujuan} ${s.perihal}`;
      if (q && !matchQuery(haystack, q)) continue;
      items.push({
        id: s.id,
        jenis: "surat-keluar",
        nomor: s.nomorSurat,
        tanggal: s.tanggalSurat,
        subjek: s.perihal,
        pihak: s.tujuan,
        status: s.status,
      });
    }
  }

  if (jenis === "all" || jenis === "pengajuan") {
    for (const p of pengajuan) {
      if (!inDateRange(p.tanggalAjuan, filter.dari, filter.sampai)) continue;
      const haystack = `${p.jenisSurat} ${p.namaPemohon} ${p.nik} ${p.keperluan}`;
      if (q && !matchQuery(haystack, q)) continue;
      items.push({
        id: p.id,
        jenis: "pengajuan",
        nomor: p.id.slice(0, 8).toUpperCase(),
        tanggal: p.tanggalAjuan,
        subjek: p.jenisSurat.replace(/-/g, " "),
        pihak: p.namaPemohon,
        status: p.status,
      });
    }
  }

  return items.sort((a, b) => b.tanggal.localeCompare(a.tanggal));
}
