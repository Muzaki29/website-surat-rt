import type { Warga } from "@/lib/types";

export interface KeluargaGroup {
  noKk: string;
  anggota: Warga[];
  jumlahAnggota: number;
  alamatUtama?: string;
}

export function isValidNoKk(noKk: string): boolean {
  return /^\d{16}$/.test(noKk.replace(/\s/g, ""));
}

export function groupWargaByKk(warga: Warga[]): KeluargaGroup[] {
  const map = new Map<string, Warga[]>();

  for (const w of warga) {
    const key = w.noKk?.replace(/\s/g, "") ?? "";
    if (!key) continue;
    const list = map.get(key) ?? [];
    list.push(w);
    map.set(key, list);
  }

  return Array.from(map.entries())
    .map(([noKk, anggota]) => ({
      noKk,
      anggota: anggota.sort((a, b) => a.nama.localeCompare(b.nama)),
      jumlahAnggota: anggota.length,
      alamatUtama: anggota[0]?.alamat,
    }))
    .sort((a, b) => b.jumlahAnggota - a.jumlahAnggota || a.noKk.localeCompare(b.noKk));
}

export function getAnggotaKeluarga(warga: Warga[], noKk: string, excludeId?: string): Warga[] {
  const key = noKk.replace(/\s/g, "");
  if (!key) return [];
  return warga.filter((w) => w.noKk?.replace(/\s/g, "") === key && w.id !== excludeId);
}

export const METODE_PEMBAYARAN_LABEL: Record<string, string> = {
  "transfer-bank": "Transfer Bank",
  qris: "QRIS",
  tunai: "Tunai",
  midtrans: "Midtrans / Online",
};
