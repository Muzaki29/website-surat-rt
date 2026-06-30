"use client";

import Link from "next/link";
import {
  ArrowRight,
  CreditCard,
  FileText,
  HelpCircle,
  Megaphone,
  MessageSquare,
  Search,
  User,
  Vote,
} from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { JENIS_SURAT } from "@/data/jenis-surat";
import { RT_INFO } from "@/lib/constants";
import { formatRupiah } from "@/lib/format";
import type { WargaDashboardData } from "@/lib/warga-dashboard";

function jenisSuratLabel(slug: string) {
  return JENIS_SURAT.find((j) => j.slug === slug)?.nama ?? slug;
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

const quickLinks = [
  { href: "/layanan", icon: FileText, label: "Ajukan Surat", desc: "Buat pengajuan surat baru" },
  { href: "/pembayaran", icon: CreditCard, label: "Bayar Iuran", desc: "Cek & bayar tagihan IPL" },
  { href: "/status", icon: Search, label: "Cek Status", desc: "Lacak pengajuan surat" },
  { href: "/forum", icon: MessageSquare, label: "Forum", desc: "Diskusi & informasi warga" },
  { href: "/polling", icon: Vote, label: "Polling", desc: "Ikut voting keputusan RT" },
  { href: "/bantuan", icon: HelpCircle, label: "Bantuan", desc: "FAQ & tiket support" },
];

export function WargaDashboard({
  data,
  userName,
}: {
  data: WargaDashboardData;
  userName: string;
}) {
  const { warga, stats, pengajuanTerbaru, tagihan, riwayatPembayaran, pengumumanTerbaru } = data;

  return (
    <>
      <Header />

      <main className="flex-1 bg-[var(--color-background)]">
        <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-accent)]">
              Dashboard Warga
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              Halo, {userName.split(" ")[0]} 👋
            </h1>
            <p className="mt-2 text-sm text-[var(--color-text-muted)]">
              Ringkasan layanan Anda di {RT_INFO.nama}, {RT_INFO.kampung}.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <p className="text-sm text-[var(--color-text-muted)]">Pengajuan aktif</p>
              <p className="mt-1 text-3xl font-bold tabular-nums">{stats.pengajuanAktif}</p>
              <p className="mt-1 text-xs text-[var(--color-text-subtle)]">
                dari {stats.pengajuanTotal} total
              </p>
            </div>
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <p className="text-sm text-[var(--color-text-muted)]">Tagihan belum bayar</p>
              <p className="mt-1 text-3xl font-bold tabular-nums">{stats.tagihanBelumBayar}</p>
              <p className="mt-1 text-xs text-[var(--color-text-subtle)]">perlu ditindaklanjuti</p>
            </div>
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <p className="text-sm text-[var(--color-text-muted)]">Artikel forum</p>
              <p className="mt-1 text-3xl font-bold tabular-nums">{stats.artikelForum}</p>
              <p className="mt-1 text-xs text-[var(--color-text-subtle)]">yang Anda publikasikan</p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 lg:col-span-1">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-[var(--color-accent)]" />
                <h2 className="font-semibold">Profil Warga</h2>
              </div>
              <Link
                href="/akun/profil"
                className="mt-3 inline-flex text-xs font-medium text-[var(--color-primary)] hover:underline"
              >
                Ubah profil & kata sandi →
              </Link>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-[var(--color-text-subtle)]">Nama</dt>
                  <dd className="font-medium">{warga.nama}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-text-subtle)]">NIK</dt>
                  <dd className="font-mono text-xs">{warga.nik}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-text-subtle)]">Nomor KK</dt>
                  <dd className="font-mono text-xs">{warga.noKk || "—"}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-text-subtle)]">Status akun</dt>
                  <dd className="mt-1">
                    <Badge status={warga.status} />
                  </dd>
                </div>
                <div>
                  <dt className="text-[var(--color-text-subtle)]">Telepon</dt>
                  <dd>{warga.noHp}</dd>
                </div>
                <div>
                  <dt className="text-[var(--color-text-subtle)]">Alamat</dt>
                  <dd className="leading-relaxed">{warga.alamat}</dd>
                </div>
              </dl>
            </div>

            <div className="lg:col-span-2">
              <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-[var(--color-text-subtle)]">
                Aksi Cepat
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {quickLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group flex cursor-pointer items-start gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition-shadow hover:shadow-sm"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                      <link.icon className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="font-medium group-hover:text-[var(--color-primary)]">{link.label}</p>
                      <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{link.desc}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <section>
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold">Pengajuan Surat Terbaru</h2>
              <Link
                href="/layanan"
                className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] hover:underline"
              >
                Ajukan baru
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            {pengajuanTerbaru.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[var(--color-border)] p-8 text-center text-sm text-[var(--color-text-muted)]">
                Belum ada pengajuan surat. Mulai dari menu Ajukan Surat.
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
                {pengajuanTerbaru.map((p) => (
                  <div
                    key={p.id}
                    className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium">{jenisSuratLabel(p.jenisSurat)}</p>
                      <p className="mt-1 text-xs text-[var(--color-text-subtle)]">
                        {formatDate(p.tanggalAjuan)} · ID: {p.id.slice(0, 8)}…
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge status={p.status} />
                      <Link href={`/status/${p.id}`}>
                        <Button type="button" variant="secondary" className="text-xs">
                          Detail
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold">Tagihan Iuran</h2>
              <Link
                href="/pembayaran"
                className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-primary)] hover:underline"
              >
                Lihat semua
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            {tagihan.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[var(--color-border)] p-8 text-center text-sm text-[var(--color-text-muted)]">
                Tidak ada tagihan saat ini.
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
                {tagihan.map((t) => (
                  <div
                    key={t.id}
                    className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium">
                        {t.jenisIuran} — {t.periode}
                      </p>
                      <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                        {formatRupiah(t.nominal)}
                      </p>
                    </div>
                    <Badge status={t.status} />
                  </div>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-4 text-lg font-semibold">Riwayat Pembayaran</h2>
            {riwayatPembayaran.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[var(--color-border)] p-6 text-center text-sm text-[var(--color-text-muted)]">
                Belum ada riwayat pembayaran.
              </div>
            ) : (
              <div className="divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
                {riwayatPembayaran.map((t) => (
                  <div key={t.id} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-medium">{t.jenisIuran} — {t.periode}</p>
                      <p className="text-sm text-[var(--color-text-muted)]">{formatRupiah(t.nominal)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge status={t.status} />
                      {t.status === "lunas" && (
                        <a
                          href={`/api/iuran/${t.id}/kwitansi`}
                          className="text-xs font-medium text-[var(--color-primary)] hover:underline"
                        >
                          Kwitansi PDF
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {pengumumanTerbaru.length > 0 && (
            <section>
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <Megaphone className="h-5 w-5 text-[var(--color-accent)]" />
                  Pengumuman RT
                </h2>
                <Link
                  href="/pengumuman"
                  className="text-sm font-medium text-[var(--color-primary)] hover:underline"
                >
                  Semua pengumuman
                </Link>
              </div>
              <div className="space-y-3">
                {pengumumanTerbaru.map((p) => (
                  <Link
                    key={p.id}
                    href="/pengumuman"
                    className="block cursor-pointer rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4 hover:bg-[var(--color-surface-muted)]"
                  >
                    <p className="font-medium">{p.judul}</p>
                    <p className="mt-1 text-xs text-[var(--color-text-subtle)]">
                      {formatDate(p.tanggal)}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
