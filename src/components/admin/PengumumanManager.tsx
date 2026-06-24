"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Megaphone, Plus, Trash2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  BulkActionBar,
  BulkCardSelect,
  BulkSelectAll,
  useBulkDeleteHandler,
} from "@/components/admin/BulkActions";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import { bulkDeleteRequest } from "@/lib/bulk-client";
import type { Pengumuman } from "@/lib/types";

export function PengumumanManager() {
  const [items, setItems] = useState<Pengumuman[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    judul: "",
    isi: "",
    penulis: "Pengurus RT",
    published: true,
  });

  const load = useCallback(async () => {
    const res = await fetch("/api/pengumuman");
    setItems(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const allIds = useMemo(() => items.map((p) => p.id), [items]);
  const bulk = useBulkSelection(allIds);
  const { deleting, handleBulkDelete } = useBulkDeleteHandler({
    resource: "pengumuman",
    selectedIds: bulk.selectedIds,
    itemLabel: "pengumuman",
    clear: bulk.clear,
    onSuccess: load,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/pengumuman", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ judul: "", isi: "", penulis: "Pengurus RT", published: true });
    setShowForm(false);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus pengumuman ini?")) return;
    await bulkDeleteRequest("pengumuman", [id]);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <AdminPageHeader
          title="Pengumuman"
          description="Siarkan informasi ke warga — tampil otomatis di halaman publik /pengumuman."
        />
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
        >
          <Plus className="h-4 w-4" />
          Buat Pengumuman
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-semibold text-slate-900">Pengumuman Baru</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Judul</label>
              <input required value={form.judul} onChange={(e) => setForm({ ...form, judul: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Isi</label>
              <textarea required rows={4} value={form.isi} onChange={(e) => setForm({ ...form, isi: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
              Publikasikan ke halaman warga
            </label>
          </div>
          <div className="mt-4 flex gap-2">
            <button type="submit" className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">Publikasikan</button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">Batal</button>
          </div>
        </form>
      )}

      {items.length > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
          <BulkSelectAll
            checked={bulk.allSelected}
            indeterminate={bulk.someSelected}
            onChange={bulk.toggleAll}
            label="Pilih semua pengumuman"
          />
          <span className="text-sm text-slate-600">Pilih semua</span>
        </div>
      )}

      <BulkActionBar
        count={bulk.selectedCount}
        itemLabel="pengumuman"
        deleting={deleting}
        onClear={bulk.clear}
        onDelete={handleBulkDelete}
      />

      <div className="space-y-3">
        {loading ? (
          <p className="text-sm text-slate-500">Memuat pengumuman...</p>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
            <Megaphone className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm text-slate-600">Belum ada pengumuman.</p>
          </div>
        ) : (
          items.map((p) => (
            <BulkCardSelect
              key={p.id}
              checked={bulk.isSelected(p.id)}
              onChange={() => bulk.toggle(p.id)}
              label={p.judul}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-900">{p.judul}</h3>
                    {!p.published && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">Draft</span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{p.tanggal} · {p.penulis}</p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-700">{p.isi}</p>
                </div>
                <button type="button" onClick={() => handleDelete(p.id)} className="shrink-0 rounded p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </BulkCardSelect>
          ))
        )}
      </div>
    </div>
  );
}
