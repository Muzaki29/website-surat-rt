import type {
  PengajuanSurat,
  SuratKeluar,
  SuratMasuk,
  TagihanIuran,
  TransaksiKas,
} from "@/lib/types";
import { readJson } from "@/lib/storage";

export interface AnalyticsData {
  koleksiIuran: { persen: number; lunas: number; total: number };
  suratBulanIni: { masuk: number; keluar: number };
  kasBulanIni: { pemasukan: number; pengeluaran: number };
  pengajuanPerJenis: { jenis: string; jumlah: number }[];
  trenIuran6Bulan: { periode: string; lunas: number; total: number }[];
}

function isThisMonth(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

export async function getAnalyticsData(): Promise<AnalyticsData> {
  const [tagihan, kas, suratMasuk, suratKeluar, pengajuan] = await Promise.all([
    readJson<TagihanIuran[]>("iuran.json", []),
    readJson<TransaksiKas[]>("kas.json", []),
    readJson<SuratMasuk[]>("surat-masuk.json", []),
    readJson<SuratKeluar[]>("surat-keluar.json", []),
    readJson<PengajuanSurat[]>("pengajuan.json", []),
  ]);

  const lunas = tagihan.filter((t) => t.status === "lunas").length;
  const total = tagihan.length;
  const persen = total > 0 ? Math.round((lunas / total) * 100) : 0;

  const pemasukan = kas
    .filter((k) => k.jenis === "pemasukan" && isThisMonth(k.tanggal))
    .reduce((a, k) => a + k.nominal, 0);
  const pengeluaran = kas
    .filter((k) => k.jenis === "pengeluaran" && isThisMonth(k.tanggal))
    .reduce((a, k) => a + k.nominal, 0);

  const jenisMap = new Map<string, number>();
  for (const p of pengajuan) {
    jenisMap.set(p.jenisSurat, (jenisMap.get(p.jenisSurat) ?? 0) + 1);
  }
  const pengajuanPerJenis = [...jenisMap.entries()]
    .map(([jenis, jumlah]) => ({ jenis, jumlah }))
    .sort((a, b) => b.jumlah - a.jumlah)
    .slice(0, 6);

  const trenIuran6Bulan: AnalyticsData["trenIuran6Bulan"] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const periode = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const periodeTagihan = tagihan.filter((t) => t.periode === periode);
    trenIuran6Bulan.push({
      periode,
      lunas: periodeTagihan.filter((t) => t.status === "lunas").length,
      total: periodeTagihan.length,
    });
  }

  return {
    koleksiIuran: { persen, lunas, total },
    suratBulanIni: {
      masuk: suratMasuk.filter((s) => isThisMonth(s.tanggalTerima)).length,
      keluar: suratKeluar.filter((s) => isThisMonth(s.tanggalSurat)).length,
    },
    kasBulanIni: { pemasukan, pengeluaran },
    pengajuanPerJenis,
    trenIuran6Bulan,
  };
}
