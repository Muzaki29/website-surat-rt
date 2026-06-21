"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2, Vote } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import type { Polling, StatusPolling } from "@/lib/types";

const emptyForm = {
  judul: "",
  deskripsi: "",
  tanggalMulai: new Date().toISOString().slice(0, 10),
  tanggalSelesai: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
  status: "draft" as StatusPolling,
  opsi: ["", ""],
};

export function PollingManager() {
  const [items, setItems] = useState<Polling[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    const res = await fetch("/api/polling");
    setItems(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/polling", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowForm(false);
    setForm(emptyForm);
    load();
  }

  async function setStatus(id: string, status: StatusPolling) {
    await fetch("/api/polling", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus polling ini?")) return;
    await fetch(`/api/polling?id=${id}`, { method: "DELETE" });
    load();
  }

  function updateOpsi(index: number, value: string) {
    const opsi = [...form.opsi];
    opsi[index] = value;
    setForm({ ...form, opsi });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <AdminPageHeader
          title="Polling Warga"
          description="Buat voting keputusan bersama — warga vote via halaman publik /polling."
        />
        <Button type="button" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          Buat Polling
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
        >
          <h2 className="pb-4 font-semibold">Polling Baru</h2>
          <div className="grid gap-4 py-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input label="Judul" required value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Textarea label="Deskripsi" value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} />
            </div>
            <Input label="Tanggal Mulai" type="date" value={form.tanggalMulai} onChange={(e) => setForm({ ...form, tanggalMulai: e.target.value })} />
            <Input label="Tanggal Selesai" type="date" value={form.tanggalSelesai} onChange={(e) => setForm({ ...form, tanggalSelesai: e.target.value })} />
            <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as StatusPolling })}>
              <option value="draft">Draft</option>
              <option value="aktif">Aktif</option>
              <option value="selesai">Selesai</option>
            </Select>
          </div>
          <div className="py-4">
            <p className="mb-3 text-sm font-medium">Opsi Pilihan</p>
            <div className="space-y-2">
              {form.opsi.map((opsi, i) => (
                <Input
                  key={i}
                  label={`Opsi ${i + 1}`}
                  required
                  value={opsi}
                  onChange={(e) => updateOpsi(i, e.target.value)}
                />
              ))}
            </div>
            <Button
              type="button"
              variant="secondary"
              className="mt-3"
              onClick={() => setForm({ ...form, opsi: [...form.opsi, ""] })}
            >
              Tambah Opsi
            </Button>
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit">Simpan</Button>
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
              Batal
            </Button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-sm text-[var(--color-text-muted)]">Memuat...</p>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--color-border)] p-8 text-center">
          <Vote className="mx-auto h-8 w-8 text-[var(--color-text-subtle)]" />
          <p className="mt-3 text-sm text-[var(--color-text-muted)]">Belum ada polling. Buat polling pertama untuk warga RT.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <article
              key={item.id}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{item.judul}</h3>
                    <Badge status={item.status === "aktif" ? "aktif" : item.status === "selesai" ? "selesai" : "draft"} />
                  </div>
                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">{item.deskripsi}</p>
                  <p className="mt-2 text-xs text-[var(--color-text-subtle)]">
                    {item.tanggalMulai} — {item.tanggalSelesai}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.status !== "aktif" && (
                    <Button type="button" variant="secondary" onClick={() => setStatus(item.id, "aktif")}>
                      Aktifkan
                    </Button>
                  )}
                  {item.status === "aktif" && (
                    <Button type="button" variant="secondary" onClick={() => setStatus(item.id, "selesai")}>
                      Tutup
                    </Button>
                  )}
                  <Button type="button" variant="danger" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {item.opsi.map((opsi) => {
                  const total = item.opsi.reduce((s, o) => s + o.votes, 0);
                  const pct = total > 0 ? Math.round((opsi.votes / total) * 100) : 0;
                  return (
                    <div key={opsi.id} className="border-t border-[var(--color-border)] pt-3">
                      <div className="flex justify-between text-sm">
                        <span>{opsi.label}</span>
                        <span className="tabular-nums font-medium">{opsi.votes} suara ({pct}%)</span>
                      </div>
                      <div className="mt-2 h-1.5 rounded-full bg-[var(--color-surface-muted)]">
                        <div
                          className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-300"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
