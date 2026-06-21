"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowLeft, Send } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import type { ForumMessage, ForumThread } from "@/lib/types";

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      day: "numeric",
      month: "short",
    });
  } catch {
    return iso;
  }
}

export function ForumChatPage({ threadId }: { threadId: string }) {
  const { data: session } = useSession();
  const [thread, setThread] = useState<ForumThread | null>(null);
  const [messages, setMessages] = useState<ForumMessage[]>([]);
  const [isi, setIsi] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/forum/${threadId}`);
    if (!res.ok) return;
    const data = await res.json();
    setThread(data.thread);
    setMessages(data.messages);
    setLoading(false);
  }, [threadId]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!isi.trim()) return;
    setSending(true);

    const res = await fetch(`/api/forum/${threadId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isi }),
    });

    setSending(false);

    if (res.ok) {
      setIsi("");
      load();
    }
  }

  const userId = session?.user?.id;

  return (
    <>
      <Header />

      <main className="flex min-h-[calc(100dvh-4rem)] flex-1 flex-col bg-[var(--color-background)]">
        <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-4 sm:px-6">
          <div className="mx-auto flex max-w-3xl items-center gap-3">
            <Link
              href="/forum"
              className="inline-flex cursor-pointer items-center gap-1 rounded-lg p-2 text-sm text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)]"
            >
              <ArrowLeft className="h-4 w-4" />
              Forum
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="truncate font-semibold">{thread?.judul ?? "Memuat..."}</h1>
              {thread && (
                <p className="text-xs text-[var(--color-text-subtle)]">
                  Dimulai oleh {thread.penulisNama}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-4 sm:px-6">
          <div className="flex-1 space-y-3 overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            {loading ? (
              <p className="text-sm text-[var(--color-text-muted)]">Memuat pesan...</p>
            ) : messages.length === 0 ? (
              <p className="text-center text-sm text-[var(--color-text-muted)]">
                Belum ada pesan. Mulai diskusi!
              </p>
            ) : (
              messages.map((msg) => {
                const own = msg.penulisUserId === userId;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${own ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                        own
                          ? "rounded-br-md bg-[var(--color-primary)] text-white"
                          : "rounded-bl-md bg-[var(--color-surface-muted)] text-[var(--color-text)]"
                      }`}
                    >
                      {!own && (
                        <p className="mb-1 text-xs font-semibold opacity-80">{msg.penulisNama}</p>
                      )}
                      <p className="whitespace-pre-wrap break-words">{msg.isi}</p>
                    </div>
                    <span className="mt-1 px-1 text-[10px] text-[var(--color-text-subtle)]">
                      {formatTime(msg.createdAt)}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSend} className="mt-4 flex items-end gap-2">
            <div className="min-w-0 flex-1">
              <Textarea
                aria-label="Tulis pesan"
                rows={2}
                value={isi}
                onChange={(e) => setIsi(e.target.value)}
                placeholder="Tulis pesan untuk warga RT..."
              />
            </div>
            <Button type="submit" disabled={sending || !isi.trim()} className="self-end">
              <Send className="h-4 w-4" />
              Kirim
            </Button>
          </form>
        </div>
      </main>

      <Footer />
    </>
  );
}
