"use client";

import { useEffect, useState } from "react";
import { Calendar } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import type { KalenderKegiatan } from "@/lib/types";

export default function KalenderPage() {
  const [items, setItems] = useState<KalenderKegiatan[]>([]);

  useEffect(() => {
    fetch("/api/kalender?public=1")
      .then((r) => r.json())
      .then(setItems);
  }, []);

  return (
    <>
      <Header />
      <main className="flex-1 bg-[var(--color-background)]">
        <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="mx-auto max-w-3xl px-4 py-10">
            <h1 className="flex items-center gap-2 text-3xl font-bold">
              <Calendar className="h-8 w-8 text-[var(--color-accent)]" />
              Kalender Kegiatan RT
            </h1>
            <p className="mt-2 text-[var(--color-text-muted)]">
              Agenda kerja bakti, rapat, dan kegiatan warga.
            </p>
          </div>
        </div>
        <div className="mx-auto max-w-3xl space-y-4 px-4 py-8">
          {items.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)]">Belum ada kegiatan terjadwal.</p>
          ) : (
            items.map((k) => (
              <article
                key={k.id}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
              >
                <p className="text-xs font-medium text-[var(--color-accent)]">
                  {k.tanggalMulai}
                  {k.tanggalSelesai && k.tanggalSelesai !== k.tanggalMulai
                    ? ` — ${k.tanggalSelesai}`
                    : ""}
                </p>
                <h2 className="mt-1 text-lg font-semibold">{k.judul}</h2>
                {k.lokasi && <p className="mt-1 text-sm text-[var(--color-text-muted)]">{k.lokasi}</p>}
                {k.deskripsi && (
                  <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">{k.deskripsi}</p>
                )}
              </article>
            ))
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
