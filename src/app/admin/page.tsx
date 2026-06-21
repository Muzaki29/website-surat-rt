import Link from "next/link";
import {
  FileInput,
  FileOutput,
  Megaphone,
  Receipt,
  Users,
  Wallet,
} from "lucide-react";
import { formatRupiah } from "@/lib/format";
import { getDashboardStats } from "@/lib/stats";

export default async function AdminDashboardPage() {
  const stats = await getDashboardStats();

  const cards = [
    { label: "Warga Aktif", value: `${stats.wargaAktif}/${stats.totalWarga}`, icon: Users },
    { label: "Surat Masuk (bulan ini)", value: String(stats.suratMasukBulanIni), icon: FileInput },
    { label: "Surat Keluar (bulan ini)", value: String(stats.suratKeluarBulanIni), icon: FileOutput },
    { label: "Pengajuan Menunggu", value: String(stats.pengajuanMenunggu), icon: Receipt },
    { label: "Saldo Kas RT", value: formatRupiah(stats.saldoKas), icon: Wallet },
    { label: "Pengumuman Aktif", value: String(stats.pengumumanAktif), icon: Megaphone },
  ];

  const quickLinks = [
    { href: "/admin/warga", label: "Data Warga", desc: "Kelola database warga" },
    { href: "/admin/surat-masuk", label: "Surat Masuk", desc: "Catat surat dari instansi" },
    { href: "/admin/surat-keluar", label: "Surat Keluar", desc: "Buat surat dengan nomor otomatis" },
    { href: "/admin/pengajuan", label: "Pengajuan Warga", desc: "Verifikasi pengajuan online" },
    { href: "/admin/iuran", label: "Iuran & Tagihan", desc: "Terbitkan tagihan IPL" },
    { href: "/admin/pengumuman", label: "Pengumuman", desc: "Siarkan ke warga" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Ringkasan operasional RT — penyuratan, warga, keuangan, dan komunikasi.
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
          Aksi Cepat
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group cursor-pointer rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-4 transition-all duration-200 hover:border-[var(--color-accent)]/40 hover:shadow-sm active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
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
