import Link from "next/link";
import {
  FileInput,
  FileOutput,
  Megaphone,
  Receipt,
  Shield,
  Users,
  Wallet,
} from "lucide-react";
import { formatRupiah } from "@/lib/format";
import { filterAdminNavGroups, getRoleDescription } from "@/lib/permissions";
import type { DashboardStats, PeranPengguna } from "@/lib/types";

const roleLabels: Record<string, string> = {
  admin: "Admin RT",
  "ketua-rt": "Ketua RT",
  "sekretaris-rt": "Sekretaris RT",
  "bendahara-rt": "Bendahara RT",
};

const ROLE_QUICK_LINKS: Record<string, { href: string; label: string; desc: string }[]> = {
  "ketua-rt": [
    { href: "/admin/monitoring", label: "Monitoring", desc: "Pantau operasional & pembayaran" },
    { href: "/admin/warga", label: "Data Warga", desc: "Verifikasi & kelola KK" },
    { href: "/admin/pengajuan", label: "Pengajuan", desc: "Tindaklanjuti surat warga" },
    { href: "/admin/analitik", label: "Analitik", desc: "Laporan kinerja RT" },
    { href: "/admin/iuran", label: "Iuran", desc: "Awasi tagihan & pembayaran" },
    { href: "/admin/support", label: "Support", desc: "Tiket bantuan warga" },
  ],
  admin: [
    { href: "/admin/warga", label: "Data Warga", desc: "Kelola database warga" },
    { href: "/admin/pengajuan", label: "Pengajuan Warga", desc: "Verifikasi pengajuan online" },
    { href: "/admin/monitoring", label: "Monitoring", desc: "Aktivitas real-time" },
    { href: "/admin/iuran", label: "Iuran & Tagihan", desc: "Terbitkan tagihan IPL" },
    { href: "/admin/surat-keluar", label: "Surat Keluar", desc: "Nomor surat otomatis" },
    { href: "/admin/analitik", label: "Analitik", desc: "Statistik platform" },
  ],
  "sekretaris-rt": [
    { href: "/admin/surat-masuk", label: "Surat Masuk", desc: "Catat surat instansi" },
    { href: "/admin/surat-keluar", label: "Surat Keluar", desc: "Terbitkan surat resmi" },
    { href: "/admin/pengajuan", label: "Pengajuan Warga", desc: "Proses permohonan surat" },
    { href: "/admin/warga", label: "Data Warga", desc: "Verifikasi pendaftaran baru" },
    { href: "/admin/arsip", label: "Arsip", desc: "Cari dokumen historis" },
    { href: "/admin/pengumuman", label: "Pengumuman", desc: "Siarkan ke warga" },
  ],
  "bendahara-rt": [
    { href: "/admin/iuran", label: "Iuran & Tagihan", desc: "Terbitkan & konfirmasi bayar" },
    { href: "/admin/kas", label: "Kas RT", desc: "Pemasukan & pengeluaran" },
    { href: "/admin/monitoring", label: "Monitoring", desc: "QRIS, transfer, tunai pending" },
    { href: "/admin/analitik", label: "Analitik", desc: "Grafik keuangan RT" },
    { href: "/admin/warga", label: "Data Warga", desc: "Lihat data untuk penagihan" },
    { href: "/admin/support", label: "Support", desc: "Tiket terkait iuran" },
  ],
};

function statsForRole(role: PeranPengguna, stats: DashboardStats) {
  const all = [
    { label: "Warga Aktif", value: `${stats.wargaAktif}/${stats.totalWarga}`, icon: Users },
    { label: "Surat Masuk (bulan ini)", value: String(stats.suratMasukBulanIni), icon: FileInput },
    { label: "Surat Keluar (bulan ini)", value: String(stats.suratKeluarBulanIni), icon: FileOutput },
    { label: "Pengajuan Menunggu", value: String(stats.pengajuanMenunggu), icon: Receipt },
    { label: "Saldo Kas RT", value: formatRupiah(stats.saldoKas), icon: Wallet },
    { label: "Pengumuman Aktif", value: String(stats.pengumumanAktif), icon: Megaphone },
  ];

  switch (role) {
    case "bendahara-rt":
      return [all[4], all[0], { label: "Pengajuan Menunggu", value: String(stats.pengajuanMenunggu), icon: Receipt }];
  case "sekretaris-rt":
      return [all[1], all[2], all[3], all[0], all[5]];
    default:
      return all;
  }
}

export function AdminRoleDashboard({
  role,
  stats,
  accessDenied,
}: {
  role: PeranPengguna;
  stats: DashboardStats;
  accessDenied?: boolean;
}) {
  const cards = statsForRole(role, stats);
  const quickLinks = ROLE_QUICK_LINKS[role] ?? ROLE_QUICK_LINKS.admin;
  const navGroups = filterAdminNavGroups(role);
  const moduleCount = navGroups.reduce((n, g) => n + g.items.length, 0);

  return (
    <div className="space-y-8">
      {accessDenied && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Anda tidak memiliki akses ke halaman tersebut. Menu disesuaikan dengan peran{" "}
          <strong>{roleLabels[role] ?? role}</strong>.
        </div>
      )}

      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-accent)]">
          {roleLabels[role] ?? "Pengurus RT"}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-2 max-w-2xl text-sm text-[var(--color-text-muted)]">
          {getRoleDescription(role)}
        </p>
        <p className="mt-2 text-xs text-[var(--color-text-subtle)]">
          {moduleCount} modul tersedia untuk peran Anda.
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 text-sm">
        <Shield className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent)]" />
        <p className="text-[var(--color-text-muted)]">
          Data warga dilindungi kontrol akses per peran. Hanya pengurus berwenang yang dapat
          mengubah data sensitif (NIK, KK, verifikasi akun).
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((item) => (
          <div
            key={item.label}
            className="flex items-start justify-between border-t-2 border-[var(--color-primary)]/20 pt-4"
          >
            <div>
              <p className="text-sm text-[var(--color-text-muted)]">{item.label}</p>
              <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight">{item.value}</p>
            </div>
            <item.icon className="h-5 w-5 text-[var(--color-accent)]" strokeWidth={1.75} />
          </div>
        ))}
      </div>

      <div>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
          Aksi Cepat — {roleLabels[role]}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group cursor-pointer rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-4 transition-all duration-200 hover:border-[var(--color-accent)]/40 hover:shadow-sm"
            >
              <p className="font-medium group-hover:text-[var(--color-primary)]">{link.label}</p>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">{link.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
