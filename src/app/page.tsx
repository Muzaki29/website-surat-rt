import Link from "next/link";
import {
  ArrowRight,
  CreditCard,
  FileText,
  HelpCircle,
  MapPin,
  MessageSquare,
  Search,
  UserPlus,
  Vote,
} from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { JENIS_SURAT } from "@/data/jenis-surat";
import {
  APP_NAME,
  APP_TAGLINE,
  FASILITAS_SEKITAR,
  INFO_LAYANAN_KEPENDUDUKAN,
  RT_INFO,
} from "@/lib/constants";

const layananWarga = [
  {
    href: "/layanan",
    icon: FileText,
    title: "Ajukan Surat",
    description: "Surat keterangan domisili, usaha, pengantar, dan lainnya — online.",
  },
  {
    href: "/pembayaran",
    icon: CreditCard,
    title: "Bayar Iuran",
    description: "Cek tagihan via NIK, transfer, atau Midtrans — konfirmasi bendahara.",
  },
  {
    href: "/daftar",
    icon: UserPlus,
    title: "Daftar Warga",
    description: "Registrasi mandiri NIK & telepon — diverifikasi pengurus RT.",
  },
  {
    href: "/forum",
    icon: MessageSquare,
    title: "Forum Diskusi",
    description: "Ngobrol antar warga setelah akun aktif.",
  },
  {
    href: "/polling",
    icon: Vote,
    title: "Polling RT",
    description: "Ikut voting keputusan bersama warga.",
  },
  {
    href: "/bantuan",
    icon: HelpCircle,
    title: "Bantuan & FAQ",
    description: "Pertanyaan umum dan tiket support ke pengurus.",
  },
];

const alurLayanan = [
  {
    title: "Pilih layanan",
    desc: "Surat, iuran, atau daftar akun warga.",
    href: "/layanan",
  },
  {
    title: "Isi data & kirim",
    desc: "Formulir online — simpan ID untuk lacak status.",
    href: "/status",
  },
  {
    title: "Verifikasi pengurus",
    desc: "Sekretaris / bendahara RT memproses di panel admin.",
  },
  {
    title: "Selesai",
    desc: "Surat jadi, iuran lunas, atau akun aktif untuk forum.",
  },
];

export default function HomePage() {
  return (
    <>
      <Header />

      <main>
        {/* Hero — split, left-aligned (anti-center slop) */}
        <section className="border-b border-[var(--color-border)]">
          <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end lg:py-20">
            <div>
              <p className="text-sm font-medium text-[var(--color-accent)]">{RT_INFO.nama}</p>
              <h1 className="mt-3 text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-[3.25rem] lg:leading-[1.05]">
                {APP_TAGLINE}
              </h1>
              <p className="mt-5 max-w-[60ch] text-base leading-relaxed text-[var(--color-text-muted)]">
                {RT_INFO.deskripsiWilayah} Satu pintu layanan surat, iuran, forum, dan
                pengumuman untuk warga {RT_INFO.kampung}.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/layanan"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-[var(--color-primary-hover)] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
                >
                  Ajukan Surat
                  <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
                </Link>
                <Link
                  href="/status"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-3 text-sm font-semibold text-[var(--color-text)] transition-colors duration-200 hover:bg-[var(--color-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
                >
                  <Search className="h-4 w-4" strokeWidth={1.75} />
                  Cek Status
                </Link>
              </div>
            </div>

            <div className="border-t border-[var(--color-border)] pt-8 lg:border-t-0 lg:border-l lg:pl-10 lg:pt-0">
              <p className="text-sm font-semibold text-[var(--color-text)]">Alur bisnis singkat</p>
              <ol className="mt-5 space-y-0 divide-y divide-[var(--color-border)]">
                {alurLayanan.map((step, i) => (
                  <li key={step.title} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--color-surface-muted)] text-xs font-semibold tabular-nums text-[var(--color-primary)]">
                      {i + 1}
                    </span>
                    <div>
                      {step.href ? (
                        <Link
                          href={step.href}
                          className="cursor-pointer font-medium text-[var(--color-text)] hover:text-[var(--color-primary)]"
                        >
                          {step.title}
                        </Link>
                      ) : (
                        <p className="font-medium text-[var(--color-text)]">{step.title}</p>
                      )}
                      <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-muted)]">
                        {step.desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* Layanan warga — 2-col list, bukan 4 card grid */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">
              Layanan untuk Warga
            </h2>
            <p className="mt-2 text-[var(--color-text-muted)]">
              Semua fitur di bawah untuk warga {RT_INFO.nama}. Pengurus RT masuk via menu Masuk.
            </p>
          </div>

          <div className="mt-10 grid gap-0 divide-y divide-[var(--color-border)] border-y border-[var(--color-border)] sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            {layananWarga.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex cursor-pointer gap-4 px-0 py-6 sm:px-6 sm:first:pl-0 sm:last:pr-0 transition-colors duration-200 hover:bg-[var(--color-surface-muted)]/50"
              >
                <item.icon
                  className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-primary)]"
                  strokeWidth={1.75}
                />
                <div>
                  <p className="font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary)]">
                    {item.title}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-muted)]">
                    {item.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Surat populer — horizontal list, bukan 4 identical cards */}
        <section className="border-t border-[var(--color-border)] bg-[var(--color-surface-muted)]/60">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">
                  Surat Sering Diajukan
                </h2>
                <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                  {INFO_LAYANAN_KEPENDUDUKAN}
                </p>
              </div>
              <Link
                href="/layanan"
                className="inline-flex cursor-pointer items-center gap-1 text-sm font-semibold text-[var(--color-primary)] hover:underline"
              >
                Semua layanan
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <ul className="mt-8 divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
              {JENIS_SURAT.slice(0, 5).map((surat) => (
                <li key={surat.slug}>
                  <Link
                    href={`/layanan/${surat.slug}`}
                    className="flex cursor-pointer flex-wrap items-center justify-between gap-3 px-5 py-4 transition-colors duration-200 hover:bg-[var(--color-surface-muted)]"
                  >
                    <div>
                      <p className="font-medium text-[var(--color-text)]">{surat.nama}</p>
                      <p className="mt-0.5 line-clamp-1 text-sm text-[var(--color-text-muted)]">
                        {surat.deskripsi}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs tabular-nums text-[var(--color-text-subtle)]">
                      ±{surat.estimasiHari} hari kerja
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Wilayah — tanpa uppercase eyebrow, tanpa card grid */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">
                Wilayah & Fasilitas
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-muted)]">
                {RT_INFO.kelurahan}, {RT_INFO.kecamatan}, {RT_INFO.kabupaten}.
              </p>
              <div className="mt-6 flex items-start gap-2 text-sm text-[var(--color-text-muted)]">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent)]" strokeWidth={1.75} />
                <span>{RT_INFO.alamat}</span>
              </div>
            </div>

            <ul className="divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
              {FASILITAS_SEKITAR.map((item) => (
                <li key={item.nama} className="py-4 first:pt-4 last:pb-4">
                  <p className="text-xs font-medium text-[var(--color-text-subtle)]">
                    {item.kategori}
                  </p>
                  <p className="mt-1 font-medium text-[var(--color-text)]">{item.nama}</p>
                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">{item.keterangan}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTA pengurus — terpisah, bukan link admin di footer utama */}
        <section className="border-t border-[var(--color-border)] bg-[var(--color-primary)] text-white">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-6 px-4 py-10 sm:px-6">
            <div>
              <p className="text-sm text-white/80">Untuk pengurus RT</p>
              <p className="mt-1 text-lg font-semibold">{APP_NAME} — Panel Admin</p>
              <p className="mt-2 max-w-md text-sm text-white/85">
                Verifikasi pengajuan, iuran, monitoring, arsip, dan data warga.
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-semibold text-[var(--color-primary)] transition-colors duration-200 hover:bg-white/90 active:scale-[0.98]"
            >
              Masuk Pengurus
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
