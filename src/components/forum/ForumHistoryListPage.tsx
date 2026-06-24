"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Archive, ArrowLeft, MessagesSquare } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { FORUM_RETENTION_DAYS } from "@/lib/constants";
import type { ForumHistoryLog } from "@/lib/types";

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

export function ForumHistoryListPage() {
  const [logs, setLogs] = useState<ForumHistoryLog[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/forum/history");
    if (res.ok) setLogs(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <Header />

      <main className="flex min-h-[calc(100dvh-4rem)] flex-1 flex-col bg-[var(--color-background)]">
        <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
            <Link
              href="/forum"
              className="inline-flex cursor-pointer items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke artikel aktif
            </Link>
            <h1 className="mt-4 text-3xl font-bold tracking-tight">Riwayat Arsip Forum</h1>
            <p className="mt-2 max-w-[55ch] text-sm text-[var(--color-text-muted)]">
              Diskusi yang sudah melewati masa aktif ({FORUM_RETENTION_DAYS} hari) disimpan di sini
              sebagai log history. Konten tetap bisa dibaca, tetapi tidak menerima tanggapan baru.
            </p>
          </div>
        </div>

        <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6">
          {loading ? (
            <p className="text-sm text-[var(--color-text-muted)]">Memuat riwayat...</p>
          ) : logs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[var(--color-border)] p-12 text-center">
              <Archive className="mx-auto h-10 w-10 text-[var(--color-text-subtle)]" />
              <p className="mt-4 font-medium">Belum ada arsip</p>
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                Artikel yang sudah kedaluwarsa akan muncul di sini secara otomatis.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
              {logs.map((log) => (
                <Link
                  key={log.id}
                  href={`/forum/riwayat/${log.id}`}
                  className="flex cursor-pointer flex-col gap-2 px-5 py-4 transition-colors hover:bg-[var(--color-surface-muted)] sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-semibold">{log.judul}</p>
                    <p className="mt-1 text-xs text-[var(--color-text-subtle)]">
                      oleh {log.penulisNama} · dipublikasikan {formatDate(log.createdAt)}
                    </p>
                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                      Diarsipkan {formatDate(log.archivedAt)}
                    </p>
                  </div>
                  <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-[var(--color-text-muted)]">
                    <MessagesSquare className="h-3.5 w-3.5" />
                    {log.jumlahPesan} pesan
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
