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
import { readJson } from "@/lib/storage";

export interface MonitoringAlert {
  id: string;
  level: "info" | "warning" | "critical";
  title: string;
  description: string;
  href: string;
  count?: number;
}

export interface MonitoringData {
  alerts: MonitoringAlert[];
  ringkasan: {
    pengajuanMenunggu: number;
    pembayaranMenunggu: number;
    tagihanBelumBayar: number;
    tiketTerbuka: number;
    saldoKas: number;
    pembayaranQris: number;
    pembayaranTransfer: number;
    pembayaranTunai: number;
  };
  aktivitasTerbaru: { waktu: string; kegiatan: string; tipe: string }[];
}

export async function getMonitoringData(): Promise<MonitoringData> {
  const [pengajuan, tagihan, tiket, kas, suratMasuk, suratKeluar] = await Promise.all([
    readJson<PengajuanSurat[]>("pengajuan.json", []),
    readJson<TagihanIuran[]>("iuran.json", []),
    readJson<TiketSupport[]>("support.json", []),
    readJson<TransaksiKas[]>("kas.json", []),
    readJson<SuratMasuk[]>("surat-masuk.json", []),
    readJson<SuratKeluar[]>("surat-keluar.json", []),
  ]);

  const pengajuanMenunggu = pengajuan.filter(
    (p) => p.status === "diajukan" || p.status === "diproses",
  ).length;
  const pembayaranMenunggu = tagihan.filter((t) => t.status === "menunggu-konfirmasi").length;
  const pembayaranQris = tagihan.filter(
    (t) => t.status === "menunggu-konfirmasi" && t.metodePembayaran === "qris",
  ).length;
  const pembayaranTransfer = tagihan.filter(
    (t) => t.status === "menunggu-konfirmasi" && t.metodePembayaran === "transfer-bank",
  ).length;
  const pembayaranTunai = tagihan.filter(
    (t) => t.status === "menunggu-konfirmasi" && t.metodePembayaran === "tunai",
  ).length;
  const tagihanBelumBayar = tagihan.filter((t) => t.status === "belum-bayar").length;
  const tiketTerbuka = tiket.filter((t) => t.status === "terbuka" || t.status === "diproses").length;
  const saldoKas = kas.reduce(
    (acc, t) => (t.jenis === "pemasukan" ? acc + t.nominal : acc - t.nominal),
    0,
  );

  const alerts: MonitoringAlert[] = [];

  if (pengajuanMenunggu > 0) {
    alerts.push({
      id: "pengajuan",
      level: pengajuanMenunggu >= 5 ? "warning" : "info",
      title: "Pengajuan surat menunggu",
      description: `${pengajuanMenunggu} pengajuan perlu ditindaklanjuti`,
      href: "/admin/pengajuan",
      count: pengajuanMenunggu,
    });
  }

  if (pembayaranMenunggu > 0) {
    alerts.push({
      id: "pembayaran",
      level: "warning",
      title: "Pembayaran menunggu konfirmasi",
      description: `${pembayaranMenunggu} bukti transfer perlu diverifikasi`,
      href: "/admin/iuran",
      count: pembayaranMenunggu,
    });
  }

  if (tagihanBelumBayar > 10) {
    alerts.push({
      id: "tunggakan",
      level: "critical",
      title: "Tunggakan iuran tinggi",
      description: `${tagihanBelumBayar} tagihan belum dibayar`,
      href: "/admin/iuran",
      count: tagihanBelumBayar,
    });
  }

  if (tiketTerbuka > 0) {
    alerts.push({
      id: "support",
      level: "info",
      title: "Tiket support aktif",
      description: `${tiketTerbuka} tiket perlu ditanggapi`,
      href: "/admin/support",
      count: tiketTerbuka,
    });
  }

  const aktivitasTerbaru = [
    ...pengajuan.slice(0, 3).map((p) => ({
      waktu: p.tanggalAjuan,
      kegiatan: `Pengajuan ${p.jenisSurat} — ${p.namaPemohon}`,
      tipe: "pengajuan",
    })),
    ...tagihan
      .filter((t) => t.status === "menunggu-konfirmasi")
      .slice(0, 2)
      .map((t) => ({
        waktu: t.tanggalAjuanBayar ?? t.periode,
        kegiatan: `Bayar iuran — ${t.wargaNama} (${t.metodePembayaran ?? "manual"})`,
        tipe: "pembayaran",
      })),
    ...suratKeluar.slice(0, 2).map((s) => ({
      waktu: s.tanggalSurat,
      kegiatan: `Surat keluar ${s.nomorSurat}`,
      tipe: "surat",
    })),
    ...suratMasuk.slice(0, 2).map((s) => ({
      waktu: s.tanggalTerima,
      kegiatan: `Surat masuk — ${s.pengirim}`,
      tipe: "surat",
    })),
  ]
    .sort((a, b) => b.waktu.localeCompare(a.waktu))
    .slice(0, 8);

  return {
    alerts,
    ringkasan: {
      pengajuanMenunggu,
      pembayaranMenunggu,
      tagihanBelumBayar,
      tiketTerbuka,
      saldoKas,
      pembayaranQris,
      pembayaranTransfer,
      pembayaranTunai,
    },
    aktivitasTerbaru,
  };
}
