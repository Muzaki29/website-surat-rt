import { readJson } from "@/lib/storage";
import type { TagihanIuran, TransaksiKas, Warga } from "@/lib/types";

function csvEscape(value: string | number): string {
  const s = String(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function exportIuranCsv(): Promise<string> {
  const [tagihan, warga] = await Promise.all([
    readJson<TagihanIuran[]>("iuran.json", []),
    readJson<Warga[]>("warga.json", []),
  ]);
  const kkMap = new Map(warga.map((w) => [w.id, w.noKk]));

  const header = "Warga,NIK,KK,Jenis,Periode,Nominal,Status,Metode,Tanggal Bayar";
  const rows = tagihan.map((t) => {
    const w = warga.find((x) => x.id === t.wargaId);
    return [
      csvEscape(t.wargaNama),
      csvEscape(w?.nik ?? ""),
      csvEscape(kkMap.get(t.wargaId) ?? ""),
      csvEscape(t.jenisIuran),
      csvEscape(t.periode),
      t.nominal,
      csvEscape(t.status),
      csvEscape(t.metodePembayaran ?? ""),
      csvEscape(t.tanggalBayar ?? ""),
    ].join(",");
  });
  return [header, ...rows].join("\n");
}

export async function exportKasCsv(): Promise<string> {
  const kas = await readJson<TransaksiKas[]>("kas.json", []);
  const header = "Tanggal,Jenis,Kategori,Keterangan,Nominal";
  const rows = kas.map((k) =>
    [k.tanggal, k.jenis, csvEscape(k.kategori), csvEscape(k.keterangan), k.nominal].join(","),
  );
  return [header, ...rows].join("\n");
}

export async function exportTunggakanCsv(): Promise<string> {
  const tagihan = await readJson<TagihanIuran[]>("iuran.json", []);
  const tunggak = tagihan.filter((t) => t.status === "belum-bayar");
  const header = "Warga,Jenis,Periode,Nominal";
  const rows = tunggak.map((t) =>
    [csvEscape(t.wargaNama), csvEscape(t.jenisIuran), t.periode, t.nominal].join(","),
  );
  return [header, ...rows].join("\n");
}
