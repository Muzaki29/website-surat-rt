"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Clock, MessageCircle, Send } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import { FORUM_RETENTION_DAYS } from "@/lib/constants";
import type { ForumMessage, ForumThread } from "@/lib/types";

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

export function ForumThreadPage({ threadId }: { threadId: string }) {
  const router = useRouter();
  const [thread, setThread] = useState<ForumThread | null>(null);
  const [messages, setMessages] = useState<ForumMessage[]>([]);
  const [isi, setIsi] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [archived, setArchived] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/forum/${threadId}`);
    if (res.status === 410) {
      const data = await res.json();
      setArchived(true);
      setLoading(false);
      if (data.archivedId) {
        router.replace(`/forum/riwayat/${data.archivedId}`);
      }
      return;
    }
    if (!res.ok) {
      setLoading(false);
      return;
    }
    const data = await res.json();
    setThread(data.thread);
    setMessages(data.messages);
    setLoading(false);
  }, [threadId, router]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 15000);
    return () => clearInterval(interval);
  }, [load]);

  async function handleReply(e: React.FormEvent) {
    e.preventDefault();
    if (!isi.trim()) return;
    setSending(true);

    const res = await fetch(`/api/forum/${threadId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isi }),
    });

    setSending(false);

    if (res.status === 410) {
      setArchived(true);
      return;
    }

    if (res.ok) {
      setIsi("");
      load();
    }
  }

  const opening = messages[0];
  const replies = messages.slice(1);

  return (
    <>
      <Header />

      <main className="flex min-h-[calc(100dvh-4rem)] flex-1 flex-col bg-[var(--color-background)]">
        <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
            <Link
              href="/forum"
              className="inline-flex cursor-pointer items-center gap-1 rounded-lg py-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke forum
            </Link>
          </div>
        </div>

        <article className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
          {loading ? (
            <p className="text-sm text-[var(--color-text-muted)]">Memuat artikel...</p>
          ) : archived ? (
            <p className="text-sm text-[var(--color-text-muted)]">
              Diskusi ini sudah diarsipkan. Mengalihkan ke riwayat...
            </p>
          ) : !thread ? (
            <p className="text-sm text-[var(--color-text-muted)]">Artikel tidak ditemukan.</p>
          ) : (
            <>
              <header className="border-b border-[var(--color-border)] pb-8">
                <h1 className="text-3xl font-bold leading-tight tracking-tight">{thread.judul}</h1>
                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-[var(--color-text-muted)]">
                  <span>oleh {thread.penulisNama}</span>
                  <span>{formatDateTime(thread.createdAt)}</span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800 ring-1 ring-amber-200">
                    <Clock className="h-3 w-3" />
                    {thread.hariTersisa === 0
                      ? "Berakhir hari ini"
                      : `${thread.hariTersisa} hari tersisa`}
                  </span>
                </div>
                <p className="mt-3 text-xs text-[var(--color-text-subtle)]">
                  Artikel aktif {FORUM_RETENTION_DAYS} hari sejak publikasi, lalu otomatis masuk
                  riwayat arsip.
                </p>
              </header>

              {opening && (
                <div className="prose-forum mt-8">
                  <p className="whitespace-pre-wrap text-base leading-relaxed text-[var(--color-text)]">
                    {opening.isi}
                  </p>
                </div>
              )}

              <section className="mt-12">
                <h2 className="flex items-center gap-2 text-lg font-semibold">
                  <MessageCircle className="h-5 w-5 text-[var(--color-accent)]" />
                  Tanggapan Warga
                  <span className="text-sm font-normal text-[var(--color-text-muted)]">
                    ({replies.length})
                  </span>
                </h2>

                {replies.length === 0 ? (
                  <p className="mt-4 text-sm text-[var(--color-text-muted)]">
                    Belum ada tanggapan. Jadilah yang pertama merespons artikel ini.
                  </p>
                ) : (
                  <ol className="mt-6 space-y-6">
                    {replies.map((msg) => (
                      <li
                        key={msg.id}
                        className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
                      >
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                          <p className="font-medium">{msg.penulisNama}</p>
                          <time className="text-xs text-[var(--color-text-subtle)]">
                            {formatDateTime(msg.createdAt)}
                          </time>
                        </div>
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[var(--color-text)]">
                          {msg.isi}
                        </p>
                      </li>
                    ))}
                  </ol>
                )}

                {!archived && (
                  <form
                    onSubmit={handleReply}
                    className="mt-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
                  >
                    <label htmlFor="forum-reply" className="block text-sm font-medium">
                      Tambah tanggapan
                    </label>
                    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
                      <Textarea
                        id="forum-reply"
                        rows={3}
                        value={isi}
                        onChange={(e) => setIsi(e.target.value)}
                        placeholder="Tulis tanggapan atau informasi lanjutan..."
                        className="flex-1"
                      />
                      <Button type="submit" disabled={sending || !isi.trim()} className="shrink-0">
                        <Send className="h-4 w-4" />
                        Kirim Tanggapan
                      </Button>
                    </div>
                  </form>
                )}
              </section>
            </>
          )}
        </article>
      </main>

      <Footer />
    </>
  );
}
