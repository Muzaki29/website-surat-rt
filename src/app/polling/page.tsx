"use client";

import { useCallback, useEffect, useState } from "react";
import { Vote } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { Polling } from "@/lib/types";

export default function PollingPublikPage() {
  const [polls, setPolls] = useState<Polling[]>([]);
  const [nik, setNik] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const res = await fetch("/api/polling?status=aktif");
    setPolls(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleVote(pollingId: string, opsiId: string) {
    if (!nik.trim()) {
      setMessage("Masukkan NIK warga terlebih dahulu.");
      return;
    }

    const res = await fetch("/api/polling", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "vote", pollingId, opsiId, nik: nik.trim() }),
    });

    if (!res.ok) {
      const err = await res.json();
      setMessage(err.error ?? "Gagal mengirim suara.");
      return;
    }

    setMessage("Terima kasih, suara Anda tercatat.");
    load();
  }

  return (
    <>
      <Header />

      <main className="mx-auto max-w-3xl flex-1 px-4 py-12">
        <div className="mb-8">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
            <Vote className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Polling Warga RT</h1>
          <p className="mt-2 max-w-[65ch] text-[var(--color-text-muted)]">
            Ikut serta dalam keputusan bersama. Masukkan NIK Anda, lalu pilih opsi pada polling yang aktif.
          </p>
        </div>

        <div className="mb-8 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <Input
            label="NIK Warga"
            value={nik}
            onChange={(e) => setNik(e.target.value)}
            placeholder="16 digit NIK"
          />
          {message && (
            <p className="mt-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 py-2 text-sm">
              {message}
            </p>
          )}
        </div>

        {loading ? (
          <p className="text-sm text-[var(--color-text-muted)]">Memuat polling...</p>
        ) : polls.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[var(--color-border)] p-8 text-center text-sm text-[var(--color-text-muted)]">
            Tidak ada polling aktif saat ini.
          </p>
        ) : (
          <div className="space-y-6">
            {polls.map((poll) => (
              <article
                key={poll.id}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
              >
                <h2 className="text-xl font-semibold">{poll.judul}</h2>
                <p className="mt-2 text-sm text-[var(--color-text-muted)]">{poll.deskripsi}</p>
                <p className="mt-2 text-xs text-[var(--color-text-subtle)]">
                  Periode: {poll.tanggalMulai} — {poll.tanggalSelesai}
                </p>
                <div className="mt-5 space-y-2">
                  {poll.opsi.map((opsi) => (
                    <Button
                      key={opsi.id}
                      type="button"
                      variant="secondary"
                      className="w-full justify-start"
                      onClick={() => handleVote(poll.id, opsi.id)}
                    >
                      {opsi.label}
                      <span className="ml-auto tabular-nums text-xs opacity-70">{opsi.votes} suara</span>
                    </Button>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
