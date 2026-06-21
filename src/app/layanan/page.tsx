import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Clock, FileText } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { JENIS_SURAT } from "@/data/jenis-surat";

export const metadata: Metadata = {
  title: "Layanan Surat",
  description: "Daftar layanan surat keterangan yang dapat diajukan warga RT.",
};

export default function LayananPage() {
  return (
    <>
      <Header />

      <main className="flex-1 bg-[var(--color-background)]">
        <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
            <Link
              href="/"
              className="mb-4 inline-flex cursor-pointer items-center gap-1 text-sm text-[var(--color-text-muted)] transition-colors duration-200 hover:text-[var(--color-primary)]"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
              Kembali ke Beranda
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text)]">
              Layanan Surat
            </h1>
            <p className="mt-2 max-w-[60ch] text-[var(--color-text-muted)]">
              Pilih jenis surat, isi formulir, lalu lacak status pengajuan. Pengurus RT akan
              memverifikasi sebelum surat diterbitkan.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <ul className="divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
            {JENIS_SURAT.map((surat) => (
              <li key={surat.slug}>
                <Link
                  href={`/layanan/${surat.slug}`}
                  className="group flex cursor-pointer gap-4 px-5 py-5 transition-colors duration-200 hover:bg-[var(--color-surface-muted)]"
                >
                  <FileText
                    className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-primary)]"
                    strokeWidth={1.75}
                  />
                  <div className="min-w-0 flex-1">
                    <h2 className="font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary)]">
                      {surat.nama}
                    </h2>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--color-text-muted)]">
                      {surat.deskripsi}
                    </p>
                    <p className="mt-2 inline-flex items-center gap-1 text-xs text-[var(--color-text-subtle)]">
                      <Clock className="h-3.5 w-3.5" strokeWidth={1.75} />
                      Estimasi {surat.estimasiHari} hari kerja
                    </p>
                  </div>
                  <ArrowLeft className="hidden h-4 w-4 rotate-180 text-[var(--color-text-subtle)] sm:block" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>

      <Footer />
    </>
  );
}
