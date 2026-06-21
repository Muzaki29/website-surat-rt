import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Calendar, Megaphone } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { readJson } from "@/lib/storage";
import type { Pengumuman } from "@/lib/types";

export const metadata: Metadata = {
  title: "Pengumuman",
  description: "Pengumuman resmi dari pengurus RT untuk warga.",
};

export default async function PengumumanPublikPage() {
  const pengumuman = await readJson<Pengumuman[]>("pengumuman.json", []);
  const published = pengumuman
    .filter((p) => p.published)
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal));

  return (
    <>
      <Header />

      <main className="flex-1 bg-[var(--color-background)]">
        <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
            <Link
              href="/"
              className="mb-4 inline-flex cursor-pointer items-center gap-1 text-sm text-[var(--color-text-muted)] transition-colors duration-200 hover:text-[var(--color-primary)]"
            >
              <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
              Kembali ke Beranda
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--color-text)]">
              Pengumuman RT
            </h1>
            <p className="mt-2 text-[var(--color-text-muted)]">
              Informasi resmi dari pengurus RT untuk seluruh warga.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          {published.length === 0 ? (
            <div className="border border-dashed border-[var(--color-border)] py-16 text-center">
              <Megaphone
                className="mx-auto h-10 w-10 text-[var(--color-text-subtle)]"
                strokeWidth={1.5}
              />
              <p className="mt-4 text-sm text-[var(--color-text-muted)]">
                Belum ada pengumuman saat ini.
              </p>
              <Link
                href="/"
                className="mt-4 inline-block text-sm font-semibold text-[var(--color-primary)] hover:underline"
              >
                Kembali ke beranda
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-border)] border-y border-[var(--color-border)]">
              {published.map((p) => (
                <article key={p.id} className="py-8 first:pt-8 last:pb-8">
                  <h2 className="text-xl font-semibold text-[var(--color-text)]">{p.judul}</h2>
                  <p className="mt-2 flex items-center gap-1 text-xs text-[var(--color-text-subtle)]">
                    <Calendar className="h-3.5 w-3.5" strokeWidth={1.75} />
                    {p.tanggal} · {p.penulis}
                  </p>
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-text-muted)]">
                    {p.isi}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
