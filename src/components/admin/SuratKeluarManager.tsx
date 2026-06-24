"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FileDown, Plus, Trash2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  BulkActionBar,
  BulkSelectAll,
  BulkSelectRow,
  useBulkDeleteHandler,
} from "@/components/admin/BulkActions";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import type { StatusSurat, SuratKeluar } from "@/lib/types";

const emptyForm = {
  tujuan: "",
  perihal: "",
  tanggalSurat: new Date().toISOString().slice(0, 10),
  status: "diproses" as StatusSurat,
};

export function SuratKeluarManager() {
  const [items, setItems] = useState<SuratKeluar[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    const res = await fetch("/api/surat-keluar");
    setItems(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const allIds = useMemo(() => items.map((s) => s.id), [items]);
  const bulk = useBulkSelection(allIds);
  const { deleting, handleBulkDelete } = useBulkDeleteHandler({
    resource: "surat-keluar",
    selectedIds: bulk.selectedIds,
    itemLabel: "catatan",
    clear: bulk.clear,
    onSuccess: load,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/surat-keluar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowForm(false);
    setForm(emptyForm);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus catatan surat keluar ini?")) return;
    await fetch(`/api/surat-keluar?id=${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <AdminPageHeader
          title="Surat Keluar"
          description="Buat surat keluar RT dengan penomoran otomatis."
        />
        <Button type="button" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          Buat Surat
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
        >
          <h2 className="pb-4 font-semibold">Surat Keluar Baru</h2>
          <p className="pb-4 text-sm text-[var(--color-text-muted)]">
            Nomor surat akan digenerate otomatis saat disimpan.
          </p>
          <div className="grid gap-4 py-4 sm:grid-cols-2">
            <Input label="Tujuan" required value={form.tujuan} onChange={(e) => setForm({ ...form, tujuan: e.target.value })} />
            <Input label="Tanggal Surat" type="date" value={form.tanggalSurat} onChange={(e) => setForm({ ...form, tanggalSurat: e.target.value })} />
            <div className="sm:col-span-2">
              <Input label="Perihal" required value={form.perihal} onChange={(e) => setForm({ ...form, perihal: e.target.value })} />
            </div>
            <Select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as StatusSurat })}>
              <option value="diproses">Diproses</option>
              <option value="selesai">Selesai</option>
            </Select>
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit">Simpan</Button>
            <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Batal</Button>
          </div>
        </form>
      )}

      <BulkActionBar
        count={bulk.selectedCount}
        itemLabel="catatan"
        deleting={deleting}
        onClear={bulk.clear}
        onDelete={handleBulkDelete}
      />

      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        {loading ? (
          <p className="p-6 text-sm text-[var(--color-text-muted)]">Memuat data...</p>
        ) : items.length === 0 ? (
          <p className="p-10 text-center text-sm text-[var(--color-text-muted)]">Belum ada surat keluar.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]">
              <tr>
                <th className="w-10 px-4 py-3">
                  <BulkSelectAll
                    checked={bulk.allSelected}
                    indeterminate={bulk.someSelected}
                    onChange={bulk.toggleAll}
                  />
                </th>
                <th className="px-4 py-3 font-medium">No. Surat</th>
                <th className="px-4 py-3 font-medium">Tanggal</th>
                <th className="px-4 py-3 font-medium">Tujuan</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Perihal</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {items.map((s) => (
                <tr key={s.id} className="transition-colors hover:bg-[var(--color-surface-muted)]/60">
                  <td className="px-4 py-3">
                    <BulkSelectRow
                      checked={bulk.isSelected(s.id)}
                      onChange={() => bulk.toggle(s.id)}
                      label={s.nomorSurat}
                    />
                  </td>
                  <td className="px-4 py-3 font-mono text-xs font-medium">{s.nomorSurat}</td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)]">{s.tanggalSurat}</td>
                  <td className="px-4 py-3 font-medium">{s.tujuan}</td>
                  <td className="hidden px-4 py-3 text-[var(--color-text-muted)] md:table-cell">{s.perihal}</td>
                  <td className="px-4 py-3"><Badge status={s.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <a
                        href={`/api/surat-keluar/${s.id}/pdf`}
                        className="inline-flex cursor-pointer items-center rounded-lg p-2 text-[var(--color-primary)] hover:bg-[var(--color-surface-muted)]"
                        aria-label="Unduh PDF"
                        title="Unduh PDF"
                      >
                        <FileDown className="h-4 w-4" />
                      </a>
                      <Button type="button" variant="ghost" size="sm" onClick={() => handleDelete(s.id)} aria-label="Hapus">
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
