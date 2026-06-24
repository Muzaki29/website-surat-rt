"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Archive, Clock, MessageSquarePlus, MessagesSquare, PenLine } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { FORUM_RETENTION_DAYS, RT_INFO } from "@/lib/constants";
import type { ForumThread } from "@/lib/types";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

function excerpt(text: string, max = 160) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max).trim()}…`;
}

export function ForumListPage() {
  const router = useRouter();
  const [threads, setThreads] = useState<ForumThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [judul, setJudul] = useState("");
  const [pesanAwal, setPesanAwal] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/forum");
    if (res.ok) setThreads(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/forum", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ judul, pesanAwal }),
    });
    const data = await res.json();

    setSubmitting(false);

    if (!res.ok) {
      setError(data.error ?? "Gagal membuat artikel.");
      return;
    }

    router.push(`/forum/${data.id}`);
  }

  return (
    <>
      <Header />

      <main className="flex min-h-[calc(100dvh-4rem)] flex-1 flex-col bg-[var(--color-background)]">
        <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-[var(--color-accent)]">
                  Forum Warga
                </p>
                <h1 className="mt-1 text-3xl font-bold tracking-tight">Diskusi & Informasi RT</h1>
                <p className="mt-2 max-w-[55ch] text-sm leading-relaxed text-[var(--color-text-muted)]">
                  Bagikan informasi, tanya jawab, dan follow-up kegiatan {RT_INFO.nama}. Setiap
                  artikel aktif selama {FORUM_RETENTION_DAYS} hari, lalu otomatis diarsipkan.
                </p>
              </div>
              <Button type="button" onClick={() => setShowForm((v) => !v)}>
                <PenLine className="h-4 w-4" />
                Tulis Artikel
              </Button>
            </div>

            <nav className="mt-6 flex gap-4 border-t border-[var(--color-border)] pt-4 text-sm">
              <span className="font-medium text-[var(--color-text)]">Artikel Aktif</span>
              <Link
                href="/forum/riwayat"
                className="inline-flex items-center gap-1.5 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              >
                <Archive className="h-3.5 w-3.5" />
                Riwayat Arsip
              </Link>
            </nav>
          </div>
        </div>

        <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
          {showForm && (
            <form
              onSubmit={handleCreate}
              className="mb-10 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
            >
              <h2 className="font-semibold">Artikel / Diskusi Baru</h2>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                Tulis judul dan isi pembuka. Warga lain bisa menanggapi di bawah artikel.
              </p>
              <div className="mt-5 space-y-4">
                <Input
                  label="Judul"
                  required
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  placeholder="Contoh: Update got mampet Blok B — perlu kerja bakti"
                />
                <Textarea
                  label="Isi pembuka"
                  required
                  rows={6}
                  value={pesanAwal}
                  onChange={(e) => setPesanAwal(e.target.value)}
                  placeholder="Jelaskan informasi atau pertanyaan Anda secara lengkap..."
                />
                {error && <p className="text-sm text-red-600">{error}</p>}
                <div className="flex gap-2">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Mempublikasikan..." : "Publikasikan"}
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                    Batal
                  </Button>
                </div>
              </div>
            </form>
          )}

          {loading ? (
            <p className="text-sm text-[var(--color-text-muted)]">Memuat artikel...</p>
          ) : threads.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--color-border)] p-12 text-center">
              <MessagesSquare className="mx-auto h-10 w-10 text-[var(--color-text-subtle)]" />
              <p className="mt-4 font-medium">Belum ada artikel aktif</p>
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                Jadilah yang pertama berbagi informasi untuk warga RT.
              </p>
              <Button type="button" className="mt-6" onClick={() => setShowForm(true)}>
                <MessageSquarePlus className="h-4 w-4" />
                Tulis Artikel Pertama
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {threads.map((thread) => (
                <article
                  key={thread.id}
                  className="group rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 transition-shadow hover:shadow-sm"
                >
                  <Link href={`/forum/${thread.id}`} className="block cursor-pointer">
                    <h2 className="text-xl font-semibold leading-snug group-hover:text-[var(--color-accent)]">
                      {thread.judul}
                    </h2>
                    <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-muted)]">
                      {excerpt(thread.pesanPembuka ?? thread.pesanTerakhir ?? "—")}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--color-text-subtle)]">
                      <span>oleh {thread.penulisNama}</span>
                      <span>{formatDate(thread.createdAt)}</span>
                      <span className="inline-flex items-center gap-1">
                        <MessagesSquare className="h-3 w-3" />
                        {thread.jumlahPesan ?? 0} tanggapan
                      </span>
                      <span className="inline-flex items-center gap-1 text-amber-700">
                        <Clock className="h-3 w-3" />
                        {thread.hariTersisa === 0
                          ? "Berakhir hari ini"
                          : `${thread.hariTersisa} hari lagi`}
                      </span>
                    </div>
                  </Link>
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
