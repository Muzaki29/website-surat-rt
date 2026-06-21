import type { DashboardStats } from "@/lib/types";
import { readJson } from "@/lib/storage";
import type {
  PengajuanSurat,
  Pengumuman,
  SuratKeluar,
  SuratMasuk,
  TagihanIuran,
  TiketSupport,
  TransaksiKas,
  Warga,
} from "@/lib/types";

function isThisMonth(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [warga, tagihan, kas, pengumuman, suratMasuk, suratKeluar, pengajuan, tiket] =
    await Promise.all([
      readJson<Warga[]>("warga.json", []),
      readJson<TagihanIuran[]>("iuran.json", []),
      readJson<TransaksiKas[]>("kas.json", []),
      readJson<Pengumuman[]>("pengumuman.json", []),
      readJson<SuratMasuk[]>("surat-masuk.json", []),
      readJson<SuratKeluar[]>("surat-keluar.json", []),
      readJson<PengajuanSurat[]>("pengajuan.json", []),
      readJson<TiketSupport[]>("support.json", []),
    ]);

  const saldoKas = kas.reduce(
    (acc, t) => (t.jenis === "pemasukan" ? acc + t.nominal : acc - t.nominal),
    0,
  );

  return {
    totalWarga: warga.length,
    wargaAktif: warga.filter((w) => w.status === "aktif").length,
    tagihanBelumBayar: tagihan.filter((t) => t.status === "belum-bayar").length,
    pembayaranMenunggu: tagihan.filter((t) => t.status === "menunggu-konfirmasi").length,
    saldoKas,
    pengumumanAktif: pengumuman.filter((p) => p.published).length,
    suratMasukBulanIni: suratMasuk.filter((s) => isThisMonth(s.tanggalTerima)).length,
    suratKeluarBulanIni: suratKeluar.filter((s) => isThisMonth(s.tanggalSurat)).length,
    pengajuanMenunggu: pengajuan.filter((p) => p.status === "diajukan" || p.status === "diproses").length,
    pengajuanSelesai: pengajuan.filter((p) => p.status === "selesai").length,
    tiketSupportTerbuka: tiket.filter((t) => t.status === "terbuka" || t.status === "diproses").length,
  };
}
