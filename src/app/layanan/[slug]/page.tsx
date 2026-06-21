import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { PengajuanForm } from "@/components/layanan/PengajuanForm";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getJenisSuratBySlug } from "@/data/jenis-surat";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const surat = getJenisSuratBySlug(slug);
  if (!surat) return { title: "Layanan Tidak Ditemukan" };
  return { title: surat.nama, description: surat.deskripsi };
}

export default async function PengajuanSuratPage({ params }: Props) {
  const { slug } = await params;
  const surat = getJenisSuratBySlug(slug);
  if (!surat) notFound();

  return (
    <>
      <Header />
      <main className="flex-1 bg-[var(--color-background)]">
        <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
            <Link
              href="/layanan"
              className="mb-4 inline-flex cursor-pointer items-center gap-1 text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary)]"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Daftar Layanan
            </Link>
            <h1 className="text-3xl font-bold tracking-tight">{surat.nama}</h1>
            <p className="mt-2 max-w-2xl leading-relaxed text-[var(--color-text-muted)]">{surat.deskripsi}</p>
          </div>
        </div>

        <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:px-6">
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
            <h2 className="font-semibold">Persyaratan</h2>
            <ul className="mt-4 space-y-2">
              {surat.persyaratan.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-[var(--color-text-muted)]">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-accent)]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <PengajuanForm jenisSurat={surat.slug} namaLayanan={surat.nama} />
        </div>
      </main>
      <Footer />
    </>
  );
}
