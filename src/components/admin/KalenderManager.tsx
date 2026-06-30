"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { KalenderKegiatan } from "@/lib/types";

const empty = {
  judul: "",
  deskripsi: "",
  tanggalMulai: new Date().toISOString().slice(0, 10),
  tanggalSelesai: "",
  lokasi: "",
};

export function KalenderManager() {
  const [items, setItems] = useState<KalenderKegiatan[]>([]);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/kalender");
    setItems(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/kalender", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm(empty);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus kegiatan ini?")) return;
    await fetch(`/api/kalender?id=${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Kalender Kegiatan" description="Kelola agenda RT yang tampil ke warga." />
      <form onSubmit={handleSubmit} className="grid gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:grid-cols-2">
        <Input label="Judul" required value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} />
        <Input label="Lokasi" value={form.lokasi} onChange={(e) => setForm({ ...form, lokasi: e.target.value })} />
        <Input label="Tanggal mulai" type="date" required value={form.tanggalMulai} onChange={(e) => setForm({ ...form, tanggalMulai: e.target.value })} />
        <Input label="Tanggal selesai" type="date" value={form.tanggalSelesai} onChange={(e) => setForm({ ...form, tanggalSelesai: e.target.value })} />
        <div className="sm:col-span-2">
          <label className="mb-1 block text-sm font-medium">Deskripsi</label>
          <textarea className="w-full rounded-lg border px-3 py-2 text-sm" rows={2} value={form.deskripsi} onChange={(e) => setForm({ ...form, deskripsi: e.target.value })} />
        </div>
        <Button type="submit">Tambah Kegiatan</Button>
      </form>
      {loading ? (
        <p className="text-sm text-[var(--color-text-muted)]">Memuat...</p>
      ) : (
        <ul className="divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)]">
          {items.map((k) => (
            <li key={k.id} className="flex items-start justify-between gap-4 px-4 py-3">
              <div>
                <p className="font-medium">{k.judul}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{k.tanggalMulai}{k.lokasi ? ` · ${k.lokasi}` : ""}</p>
              </div>
              <button type="button" onClick={() => handleDelete(k.id)} className="text-xs text-red-600 hover:underline">Hapus</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
