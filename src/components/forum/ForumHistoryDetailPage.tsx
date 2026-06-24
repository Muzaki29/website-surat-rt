"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Archive, MessageCircle } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import type { ForumHistoryLog, ForumHistorySnapshot, ForumMessage } from "@/lib/types";

function formatDateTime(iso: string) {
  try {
    return new Date(iso).toLocaleString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function ForumHistoryDetailPage({ logId }: { logId: string }) {
  const [log, setLog] = useState<ForumHistoryLog | null>(null);
  const [snapshot, setSnapshot] = useState<ForumHistorySnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch(`/api/forum/history/${logId}`);
    if (!res.ok) {
      setLoading(false);
      return;
    }
    const data = await res.json();
    setLog(data.log);
    setSnapshot(data.snapshot);
    setLoading(false);
  }, [logId]);

  useEffect(() => {
    load();
  }, [load]);

  const messages = snapshot?.messages ?? [];
  const opening = messages[0];
  const replies = messages.slice(1);

  return (
    <>
      <Header />

      <main className="flex min-h-[calc(100dvh-4rem)] flex-1 flex-col bg-[var(--color-background)]">
        <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
            <Link
              href="/forum/riwayat"
              className="inline-flex cursor-pointer items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            >
              <ArrowLeft className="h-4 w-4" />
              Riwayat arsip
            </Link>
          </div>
        </div>

        <article className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
          {loading ? (
            <p className="text-sm text-[var(--color-text-muted)]">Memuat arsip...</p>
          ) : !log || !snapshot ? (
            <p className="text-sm text-[var(--color-text-muted)]">Arsip tidak ditemukan.</p>
          ) : (
            <>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                <Archive className="h-3.5 w-3.5" />
                Arsip · diarsipkan {formatDateTime(log.archivedAt)}
              </div>

              <header className="border-b border-[var(--color-border)] pb-8">
                <h1 className="text-3xl font-bold leading-tight tracking-tight">{log.judul}</h1>
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[var(--color-text-muted)]">
                  <span>oleh {log.penulisNama}</span>
                  <span>Dipublikasikan {formatDateTime(log.createdAt)}</span>
                </div>
              </header>

              {opening && (
                <div className="mt-8">
                  <p className="whitespace-pre-wrap text-base leading-relaxed text-[var(--color-text)]">
                    {opening.isi}
                  </p>
                </div>
              )}

              <section className="mt-12">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <MessageCircle className="h-5 w-5 text-[var(--color-text-muted)]" />
                  Tanggapan Warga
                  <span className="text-sm font-normal text-[var(--color-text-muted)]">
                    ({replies.length})
                  </span>
                </h2>

                {replies.length === 0 ? (
                  <p className="mt-4 text-sm text-[var(--color-text-muted)]">
                    Tidak ada tanggapan pada arsip ini.
                  </p>
                ) : (
                  <ol className="mt-6 space-y-6">
                    {replies.map((msg: ForumMessage) => (
                      <li
                        key={msg.id}
                        className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-5"
                      >
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <p className="font-medium">{msg.penulisNama}</p>
                          <time className="text-xs text-[var(--color-text-subtle)]">
                            {formatDateTime(msg.createdAt)}
                          </time>
                        </div>
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">
                          {msg.isi}
                        </p>
                      </li>
                    ))}
                  </ol>
                )}
              </section>

              <p className="mt-10 rounded-lg border border-dashed border-[var(--color-border)] p-4 text-center text-sm text-[var(--color-text-muted)]">
                Diskusi ini sudah ditutup. Lihat artikel aktif di{" "}
                <Link href="/forum" className="font-medium text-[var(--color-accent)] hover:underline">
                  forum
                </Link>
                .
              </p>
            </>
          )}
        </article>
      </main>

      <Footer />
    </>
  );
}
