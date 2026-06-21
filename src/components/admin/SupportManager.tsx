"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import type { TiketSupport } from "@/lib/types";

export function SupportManager() {
  const [tiket, setTiket] = useState<TiketSupport[]>([]);
  const [loading, setLoading] = useState(true);
  const [balasan, setBalasan] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    const res = await fetch("/api/support");
    setTiket(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleBalas(id: string) {
    const text = balasan[id]?.trim();
    if (!text) return;
    await fetch("/api/support", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, balasan: text }),
    });
    load();
  }

  async function handleProses(id: string) {
    await fetch("/api/support", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "diproses" }),
    });
    load();
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Support & Tiket"
        description="Kelola pertanyaan dan laporan warga terkait sistem SuratRT."
      />

      {loading ? (
        <p className="text-sm text-[var(--color-text-muted)]">Memuat tiket...</p>
      ) : tiket.length === 0 ? (
        <p className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-10 text-center text-sm text-[var(--color-text-muted)]">
          Belum ada tiket support.
        </p>
      ) : (
        <div className="space-y-4">
          {tiket.map((t) => (
            <article key={t.id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{t.topik}</p>
                  <p className="text-sm text-[var(--color-text-muted)]">
                    {t.nama} · {t.kontak} · {t.tanggal}
                  </p>
                </div>
                <Badge status={t.status} />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-[var(--color-text-muted)]">{t.pesan}</p>

              {t.balasan && (
                <div className="mt-3 rounded-lg bg-[var(--color-surface-muted)] p-3 text-sm">
                  <p className="font-medium">Balasan ({t.tanggalBalasan})</p>
                  <p className="mt-1 text-[var(--color-text-muted)]">{t.balasan}</p>
                </div>
              )}

              {t.status !== "selesai" && (
                <div className="mt-4 space-y-2">
                  {t.status === "terbuka" && (
                    <Button type="button" size="sm" variant="secondary" onClick={() => handleProses(t.id)}>
                      Tandai Diproses
                    </Button>
                  )}
                  <Textarea
                    rows={2}
                    placeholder="Tulis balasan untuk warga..."
                    value={balasan[t.id] ?? ""}
                    onChange={(e) => setBalasan({ ...balasan, [t.id]: e.target.value })}
                  />
                  <Button type="button" size="sm" onClick={() => handleBalas(t.id)}>
                    Kirim Balasan & Tutup
                  </Button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
