"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageSquarePlus, MessagesSquare } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { RT_INFO } from "@/lib/constants";
import type { ForumThread } from "@/lib/types";

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleString("id-ID", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
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
      setError(data.error ?? "Gagal membuat topik.");
      return;
    }

    router.push(`/forum/${data.id}`);
  }

  return (
    <>
      <Header />

      <main className="flex min-h-[calc(100dvh-4rem)] flex-1 flex-col bg-[var(--color-background)]">
        <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-4 py-8 sm:px-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Forum Diskusi Warga</h1>
              <p className="mt-2 max-w-[55ch] text-sm text-[var(--color-text-muted)]">
                Ruang ngobrol antar warga {RT_INFO.nama} — saling bantu info lingkungan, kegiatan,
                dan hal RT.
              </p>
            </div>
            <Button type="button" onClick={() => setShowForm((v) => !v)}>
              <MessageSquarePlus className="h-4 w-4" />
              Topik Baru
            </Button>
          </div>
        </div>

        <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6">
          {showForm && (
            <form
              onSubmit={handleCreate}
              className="mb-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
            >
              <h2 className="font-semibold">Buat Topik Diskusi</h2>
              <div className="mt-4 space-y-4">
                <Input
                  label="Judul topik"
                  required
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  placeholder="Contoh: Jadwal kerja bakti Minggu"
                />
                <Textarea
                  label="Pesan pembuka"
                  required
                  rows={3}
                  value={pesanAwal}
                  onChange={(e) => setPesanAwal(e.target.value)}
                />
                {error && <p className="text-sm text-red-600">{error}</p>}
                <div className="flex gap-2">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Membuat..." : "Mulai Diskusi"}
                  </Button>
                  <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                    Batal
                  </Button>
                </div>
              </div>
            </form>
          )}

          {loading ? (
            <p className="text-sm text-[var(--color-text-muted)]">Memuat forum...</p>
          ) : threads.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--color-border)] p-12 text-center">
              <MessagesSquare className="mx-auto h-10 w-10 text-[var(--color-text-subtle)]" />
              <p className="mt-4 font-medium">Belum ada diskusi</p>
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                Jadilah yang pertama memulai percakapan warga RT.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
              {threads.map((thread) => (
                <Link
                  key={thread.id}
                  href={`/forum/${thread.id}`}
                  className="flex cursor-pointer flex-col gap-2 px-5 py-4 transition-colors hover:bg-[var(--color-surface-muted)] sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold">{thread.judul}</p>
                    <p className="mt-1 line-clamp-1 text-sm text-[var(--color-text-muted)]">
                      {thread.pesanTerakhir ?? "—"}
                    </p>
                    <p className="mt-2 text-xs text-[var(--color-text-subtle)]">
                      oleh {thread.penulisNama} · {formatTime(thread.updatedAt)}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-medium tabular-nums text-[var(--color-accent)]">
                    {thread.jumlahPesan ?? 0} pesan
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
