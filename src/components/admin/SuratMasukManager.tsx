"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import type { StatusSurat, SuratMasuk } from "@/lib/types";

const emptyForm = {
  pengirim: "",
  perihal: "",
  tanggalTerima: new Date().toISOString().slice(0, 10),
  status: "diproses" as StatusSurat,
};

export function SuratMasukManager() {
  const [items, setItems] = useState<SuratMasuk[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    const res = await fetch("/api/surat-masuk");
    setItems(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/surat-masuk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setShowForm(false);
    setForm(emptyForm);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus catatan surat masuk ini?")) return;
    await fetch(`/api/surat-masuk?id=${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <AdminPageHeader
          title="Surat Masuk"
          description="Pencatatan surat dari RW, kelurahan, atau instansi lain dengan nomor agenda otomatis."
        />
        <Button type="button" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          Catat Surat
        </Button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
        >
          <h2 className="pb-4 font-semibold">Surat Masuk Baru</h2>
          <div className="grid gap-4 py-4 sm:grid-cols-2">
            <Input label="Pengirim" required value={form.pengirim} onChange={(e) => setForm({ ...form, pengirim: e.target.value })} />
            <Input label="Tanggal Terima" type="date" value={form.tanggalTerima} onChange={(e) => setForm({ ...form, tanggalTerima: e.target.value })} />
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

      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        {loading ? (
          <p className="p-6 text-sm text-[var(--color-text-muted)]">Memuat data...</p>
        ) : items.length === 0 ? (
          <p className="p-10 text-center text-sm text-[var(--color-text-muted)]">Belum ada surat masuk tercatat.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">No. Agenda</th>
                <th className="px-4 py-3 font-medium">Tanggal</th>
                <th className="px-4 py-3 font-medium">Pengirim</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Perihal</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {items.map((s) => (
                <tr key={s.id} className="transition-colors hover:bg-[var(--color-surface-muted)]/60">
                  <td className="px-4 py-3 font-mono text-xs font-medium">{s.nomorAgenda}</td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)]">{s.tanggalTerima}</td>
                  <td className="px-4 py-3 font-medium">{s.pengirim}</td>
                  <td className="hidden px-4 py-3 text-[var(--color-text-muted)] md:table-cell">{s.perihal}</td>
                  <td className="px-4 py-3"><Badge status={s.status} /></td>
                  <td className="px-4 py-3">
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleDelete(s.id)} aria-label="Hapus">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
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
