import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { StatusTracker } from "@/components/layanan/StatusTracker";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { readJson } from "@/lib/storage";
import type { PengajuanSurat } from "@/lib/types";

type Props = { params: Promise<{ id: string }> };

export default async function StatusPage({ params }: Props) {
  const { id } = await params;
  const pengajuan = await readJson<PengajuanSurat[]>("pengajuan.json", []);
  const data = pengajuan.find((p) => p.id === id);
  if (!data) notFound();

  return (
    <>
      <Header />
      <main className="flex-1 bg-[var(--color-background)]">
        <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
          <Link
            href="/layanan"
            className="mb-6 inline-flex cursor-pointer items-center gap-1 text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-primary)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Link>
          <StatusTracker data={data} id={id} />
        </div>
      </main>
      <Footer />
    </>
  );
}
