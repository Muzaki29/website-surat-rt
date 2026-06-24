import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  Clock,
  FileText,
  HelpCircle,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  UserPlus,
  Wallet,
} from "lucide-react";
import { BantuanTicketForm } from "@/components/bantuan/BantuanTicketForm";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/Badge";
import {
  ALUR_DAFTAR,
  ALUR_FORUM,
  ALUR_IURAN,
  ALUR_SURAT,
  FAQ_DETAIL,
  JENIS_SURAT_PANDUAN,
  PANDUAN_SECTIONS,
  STATUS_IURAN,
  STATUS_PENGAJUAN,
} from "@/data/panduan-warga";
import { FASILITAS_SEKITAR, RT_INFO } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Bantuan & Panduan",
  description:
    "Panduan lengkap warga RT: cara daftar, ajukan surat, bayar iuran, cek status, dan FAQ SuratRT.",
};

function StepList({
  steps,
}: {
  steps: readonly { title: string; detail: string; link?: { href: string; label: string } }[];
}) {
  return (
    <ol className="mt-5 space-y-0 divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
      {steps.map((step, i) => (
        <li key={step.title} className="flex gap-4 py-5 first:pt-5 last:pb-5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-surface-muted)] text-sm font-bold tabular-nums text-[var(--color-primary)]">
            {i + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-[var(--color-text)]">{step.title}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-text-muted)]">{step.detail}</p>
            {step.link && (
              <Link
                href={step.link.href}
                className="mt-2 inline-flex cursor-pointer items-center gap-1 text-sm font-semibold text-[var(--color-primary)] hover:underline"
              >
                {step.link.label}
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

function TipsBox({ tips }: { tips: readonly string[] }) {
  return (
    <div className="mt-5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)]/70 p-4">
      <p className="text-sm font-semibold text-[var(--color-text)]">Tips penting</p>
      <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-[var(--color-text-muted)]">
        {tips.map((tip) => (
          <li key={tip} className="flex gap-2">
            <span className="text-[var(--color-accent)]">·</span>
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function GuideSection({
  id,
  icon: Icon,
  title,
  intro,
  children,
}: {
  id: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  title: string;
  intro: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-b border-[var(--color-border)] pb-12 last:border-b-0">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-bold tracking-tight text-[var(--color-text)]">{title}</h2>
          <p className="mt-2 max-w-[65ch] text-sm leading-relaxed text-[var(--color-text-muted)]">{intro}</p>
          {children}
        </div>
      </div>
    </section>
  );
}

export default function BantuanPage() {
  return (
    <>
      <Header />

      <main className="flex-1 bg-[var(--color-background)]">
        {/* Hero */}
        <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
            <Link
              href="/"
              className="mb-4 inline-flex cursor-pointer items-center gap-1 text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary)]"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
              Kembali ke Beranda
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text)]">
              Pusat Bantuan Warga
            </h1>
            <p className="mt-3 max-w-[60ch] leading-relaxed text-[var(--color-text-muted)]">
              Panduan step-by-step untuk daftar akun, mengajukan surat, bayar iuran, dan memahami
              setiap status proses — khusus warga {RT_INFO.nama}, {RT_INFO.kampung}.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          {/* Daftar isi */}
          <nav
            aria-label="Daftar isi panduan"
            className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-5"
          >
            <p className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text)]">
              <BookOpen className="h-4 w-4 text-[var(--color-accent)]" strokeWidth={1.75} />
              Loncat ke bagian
            </p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {PANDUAN_SECTIONS.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="inline-flex cursor-pointer rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)]/50 px-3 py-1.5 text-xs font-medium text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-primary)]/30 hover:text-[var(--color-primary)]"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-12 space-y-12">
            {/* Daftar & login */}
            <GuideSection
              id="daftar"
              icon={UserPlus}
              title={ALUR_DAFTAR.title}
              intro={ALUR_DAFTAR.intro}
            >
              <StepList steps={ALUR_DAFTAR.steps} />
              <TipsBox tips={ALUR_DAFTAR.tips} />
            </GuideSection>

            {/* Ajukan surat */}
            <GuideSection id="surat" icon={FileText} title={ALUR_SURAT.title} intro={ALUR_SURAT.intro}>
              <StepList steps={ALUR_SURAT.steps} />
              <TipsBox tips={ALUR_SURAT.tips} />
            </GuideSection>

            {/* Jenis surat */}
            <section id="jenis-surat" className="scroll-mt-24 border-b border-[var(--color-border)] pb-12">
              <h2 className="text-xl font-bold tracking-tight text-[var(--color-text)]">
                Jenis surat & persyaratan dokumen
              </h2>
              <p className="mt-2 max-w-[65ch] text-sm leading-relaxed text-[var(--color-text-muted)]">
                Siapkan dokumen berikut sebelum mengisi formulir. Klik nama surat untuk langsung
                mengajukan.
              </p>

              <div className="mt-6 divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
                {JENIS_SURAT_PANDUAN.map((surat) => (
                  <div key={surat.slug} className="px-5 py-5">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <Link
                        href={surat.href}
                        className="cursor-pointer font-semibold text-[var(--color-text)] hover:text-[var(--color-primary)]"
                      >
                        {surat.nama}
                      </Link>
                      <span className="inline-flex items-center gap-1 text-xs text-[var(--color-text-subtle)]">
                        <Clock className="h-3.5 w-3.5" strokeWidth={1.75} />± {surat.estimasiHari} hari
                        kerja
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-[var(--color-text-muted)]">{surat.deskripsi}</p>
                    <p className="mt-3 text-xs font-semibold text-[var(--color-text)]">
                      Dokumen yang perlu disiapkan:
                    </p>
                    <ul className="mt-1.5 flex flex-wrap gap-2">
                      {surat.persyaratan.map((doc) => (
                        <li
                          key={doc}
                          className="rounded-md bg-[var(--color-surface-muted)] px-2.5 py-1 text-xs text-[var(--color-text-muted)]"
                        >
                          {doc}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={surat.href}
                      className="mt-3 inline-flex cursor-pointer items-center gap-1 text-sm font-semibold text-[var(--color-primary)] hover:underline"
                    >
                      Ajukan surat ini
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            </section>

            {/* Status */}
            <section id="status" className="scroll-mt-24 border-b border-[var(--color-border)] pb-12">
              <h2 className="text-xl font-bold tracking-tight text-[var(--color-text)]">
                Arti status pengajuan & pembayaran
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">
                Status muncul saat Anda cek progres di halaman Cek Status atau Bayar Iuran. Berikut
                penjelasan dan langkah yang bisa warga lakukan.
              </p>

              <h3 className="mt-8 text-sm font-semibold text-[var(--color-text)]">Status pengajuan surat</h3>
              <div className="mt-3 space-y-3">
                {STATUS_PENGAJUAN.map((row) => (
                  <div
                    key={row.status}
                    className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-4"
                  >
                    <Badge status={row.status} />
                    <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">
                      <span className="font-medium text-[var(--color-text)]">Artinya: </span>
                      {row.arti}
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-text-muted)]">
                      <span className="font-medium text-[var(--color-text)]">Yang bisa Anda lakukan: </span>
                      {row.aksiWarga}
                    </p>
                  </div>
                ))}
              </div>

              <h3 className="mt-8 text-sm font-semibold text-[var(--color-text)]">Status tagihan iuran</h3>
              <div className="mt-3 space-y-3">
                {STATUS_IURAN.map((row) => (
                  <div
                    key={row.status}
                    className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-4"
                  >
                    <Badge status={row.status} />
                    <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">
                      <span className="font-medium text-[var(--color-text)]">Artinya: </span>
                      {row.arti}
                    </p>
                    <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-text-muted)]">
                      <span className="font-medium text-[var(--color-text)]">Yang bisa Anda lakukan: </span>
                      {row.aksiWarga}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Iuran */}
            <GuideSection id="iuran" icon={Wallet} title={ALUR_IURAN.title} intro={ALUR_IURAN.intro}>
              <div className="mt-5 rounded-xl border border-[var(--color-primary)]/20 bg-[var(--color-primary)]/5 p-4 text-sm">
                <p className="font-semibold text-[var(--color-text)]">Rekening resmi RT</p>
                <p className="mt-2 font-mono text-[var(--color-text)]">
                  {ALUR_IURAN.rekening.bank} · {ALUR_IURAN.rekening.nomor}
                </p>
                <p className="mt-1 text-[var(--color-text-muted)]">a.n. {ALUR_IURAN.rekening.atasNama}</p>
                <p className="mt-2 text-[var(--color-text-muted)]">{ALUR_IURAN.rekening.qrisInfo}</p>
              </div>
              <StepList steps={ALUR_IURAN.steps} />
              <TipsBox tips={ALUR_IURAN.tips} />
            </GuideSection>

            {/* Forum */}
            <GuideSection
              id="forum"
              icon={MessageSquare}
              title={ALUR_FORUM.title}
              intro={ALUR_FORUM.intro}
            >
              <ul className="mt-5 divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
                {ALUR_FORUM.items.map((item) => (
                  <li key={item.title} className="py-5">
                    <p className="font-semibold text-[var(--color-text)]">{item.title}</p>
                    <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-text-muted)]">
                      {item.detail}
                    </p>
                    {item.link && (
                      <Link
                        href={item.link.href}
                        className="mt-2 inline-flex cursor-pointer items-center gap-1 text-sm font-semibold text-[var(--color-primary)] hover:underline"
                      >
                        {item.link.label}
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </GuideSection>

            {/* FAQ */}
            <section id="faq" className="scroll-mt-24 border-b border-[var(--color-border)] pb-12">
              <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight text-[var(--color-text)]">
                <HelpCircle className="h-5 w-5 text-[var(--color-accent)]" strokeWidth={1.75} />
                Pertanyaan yang sering ditanyakan
              </h2>
              <div className="mt-6 space-y-2">
                {FAQ_DETAIL.map((item) => (
                  <details
                    key={item.q}
                    className="group rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]"
                  >
                    <summary className="cursor-pointer list-none px-4 py-3.5 text-sm font-medium text-[var(--color-text)] marker:content-none [&::-webkit-details-marker]:hidden">
                      <span className="flex items-center justify-between gap-3">
                        {item.q}
                        <ChevronRight className="h-4 w-4 shrink-0 text-[var(--color-text-subtle)] transition-transform group-open:rotate-90" />
                      </span>
                    </summary>
                    <p className="border-t border-[var(--color-border)] px-4 py-3.5 text-sm leading-relaxed text-[var(--color-text-muted)]">
                      {item.a}
                    </p>
                  </details>
                ))}
              </div>
            </section>

            {/* Kontak & tiket */}
            <section id="kontak" className="scroll-mt-24 space-y-8">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-[var(--color-text)]">
                  Kontak langsung pengurus RT
                </h2>
                <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                  Untuk hal mendesak atau pertanyaan di luar jam operasional website.
                </p>

                <div className="mt-5 space-y-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-sm">
                  <p className="font-semibold text-[var(--color-text)]">{RT_INFO.nama}</p>
                  <p className="flex items-start gap-2 text-[var(--color-text-muted)]">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent)]" strokeWidth={1.75} />
                    {RT_INFO.alamat}, {RT_INFO.kelurahan}, {RT_INFO.kecamatan}, {RT_INFO.kabupaten}
                  </p>
                  <p className="flex items-center gap-2 text-[var(--color-text-muted)]">
                    <Phone className="h-4 w-4 shrink-0 text-[var(--color-accent)]" strokeWidth={1.75} />
                    {RT_INFO.telepon}
                  </p>
                  <p className="flex items-center gap-2 text-[var(--color-text-muted)]">
                    <Mail className="h-4 w-4 shrink-0 text-[var(--color-accent)]" strokeWidth={1.75} />
                    {RT_INFO.email}
                  </p>
                  <hr className="border-[var(--color-border)]" />
                  <p className="text-[var(--color-text-muted)]">
                    <span className="font-medium text-[var(--color-text)]">Ketua RT:</span> {RT_INFO.ketua}
                  </p>
                  <p className="text-[var(--color-text-muted)]">
                    <span className="font-medium text-[var(--color-text)]">Sekretaris:</span>{" "}
                    {RT_INFO.sekretaris} — urusan surat & verifikasi warga
                  </p>
                  <p className="text-[var(--color-text-muted)]">
                    <span className="font-medium text-[var(--color-text)]">Bendahara:</span>{" "}
                    {RT_INFO.bendahara} — urusan iuran & konfirmasi bayar
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-[var(--color-text)]">Fasilitas sekitar RW 002</h2>
                <ul className="mt-4 divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
                  {FASILITAS_SEKITAR.map((item) => (
                    <li key={item.nama} className="py-4">
                      <p className="text-xs font-medium text-[var(--color-text-subtle)]">{item.kategori}</p>
                      <p className="mt-0.5 font-medium text-[var(--color-text)]">{item.nama}</p>
                      <p className="mt-1 text-sm text-[var(--color-text-muted)]">{item.keterangan}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h2 className="flex items-center gap-2 text-lg font-semibold text-[var(--color-text)]">
                  <MessageSquare className="h-5 w-5 text-[var(--color-accent)]" strokeWidth={1.75} />
                  Masih bingung? Buat tiket bantuan
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">
                  Isi formulir di bawah. Pengurus RT akan membalas lewat HP atau email Anda. Cantumkan
                  ID pengajuan, NIK, atau screenshot jika ada kendala teknis.
                </p>
                <div className="mt-4">
                  <BantuanTicketForm />
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
