"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Pencil, Plus, Trash2, Users } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  BulkActionBar,
  BulkSelectAll,
  BulkSelectRow,
  useBulkDeleteHandler,
} from "@/components/admin/BulkActions";
import { Badge } from "@/components/ui/Badge";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import type { StatusWarga, Warga } from "@/lib/types";

const emptyForm = {
  nama: "",
  nik: "",
  alamat: "",
  noHp: "",
  status: "aktif" as StatusWarga,
  tanggalMasuk: new Date().toISOString().slice(0, 10),
};

export function WargaManager() {
  const [warga, setWarga] = useState<Warga[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const load = useCallback(async () => {
    const res = await fetch("/api/warga");
    setWarga(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const allIds = useMemo(() => warga.map((w) => w.id), [warga]);
  const bulk = useBulkSelection(allIds);
  const { deleting, handleBulkDelete } = useBulkDeleteHandler({
    resource: "warga",
    selectedIds: bulk.selectedIds,
    itemLabel: "warga",
    clear: bulk.clear,
    onSuccess: load,
  });

  function openCreate() {
    setEditId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(w: Warga) {
    setEditId(w.id);
    setForm({
      nama: w.nama,
      nik: w.nik,
      alamat: w.alamat,
      noHp: w.noHp,
      status: w.status,
      tanggalMasuk: w.tanggalMasuk,
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editId) {
      await fetch(`/api/warga/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch("/api/warga", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setShowForm(false);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus data warga ini?")) return;
    await fetch(`/api/warga/${id}`, { method: "DELETE" });
    load();
  }

  async function handleVerify(id: string) {
    await fetch(`/api/warga/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "verifikasi" }),
    });
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <AdminPageHeader
          title="Data Warga"
          description="Kelola database warga RT — fondasi iuran, surat, dan polling."
        />
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
        >
          <Plus className="h-4 w-4" />
          Tambah Warga
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
        >
          <h2 className="font-semibold text-slate-900">
            {editId ? "Edit Warga" : "Tambah Warga Baru"}
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Nama Lengkap" value={form.nama} onChange={(v) => setForm({ ...form, nama: v })} required />
            <Field label="NIK" value={form.nik} onChange={(v) => setForm({ ...form, nik: v })} />
            <Field label="No. HP" value={form.noHp} onChange={(v) => setForm({ ...form, noHp: v })} />
            <Field label="Tanggal Masuk" type="date" value={form.tanggalMasuk} onChange={(v) => setForm({ ...form, tanggalMasuk: v })} />
            <div className="sm:col-span-2">
              <Field label="Alamat" value={form.alamat} onChange={(v) => setForm({ ...form, alamat: v })} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as StatusWarga })}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              >
                <option value="aktif">Aktif</option>
                <option value="menunggu-verifikasi">Menunggu Verifikasi</option>
                <option value="nonaktif">Nonaktif</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button type="submit" className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800">
              Simpan
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
              Batal
            </button>
          </div>
        </form>
      )}

      <BulkActionBar
        count={bulk.selectedCount}
        itemLabel="warga"
        deleting={deleting}
        onClear={bulk.clear}
        onDelete={handleBulkDelete}
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <p className="p-6 text-sm text-slate-500">Memuat data...</p>
        ) : warga.length === 0 ? (
          <div className="p-10 text-center">
            <Users className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm text-slate-600">Belum ada data warga. Tambahkan warga pertama.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-slate-600">
              <tr>
                <th className="w-10 px-4 py-3">
                  <BulkSelectAll
                    checked={bulk.allSelected}
                    indeterminate={bulk.someSelected}
                    onChange={bulk.toggleAll}
                  />
                </th>
                <th className="px-4 py-3 font-medium">Nama</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">NIK</th>
                <th className="hidden px-4 py-3 font-medium lg:table-cell">No. HP</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {warga.map((w) => (
                <tr key={w.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <BulkSelectRow
                      checked={bulk.isSelected(w.id)}
                      onChange={() => bulk.toggle(w.id)}
                      label={w.nama}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{w.nama}</p>
                    <p className="text-xs text-slate-500 md:hidden">{w.nik}</p>
                  </td>
                  <td className="hidden px-4 py-3 text-slate-600 md:table-cell">{w.nik || "—"}</td>
                  <td className="hidden px-4 py-3 text-slate-600 lg:table-cell">{w.noHp || "—"}</td>
                  <td className="px-4 py-3">
                    <Badge status={w.status} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {w.status === "menunggu-verifikasi" && (
                        <button
                          type="button"
                          onClick={() => handleVerify(w.id)}
                          className="rounded p-1.5 text-emerald-600 hover:bg-emerald-50"
                          title="Verifikasi warga"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                      )}
                      <button type="button" onClick={() => openEdit(w)} className="rounded p-1.5 text-slate-500 hover:bg-slate-100 hover:text-blue-700">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => handleDelete(w.id)} className="rounded p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </button>
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

function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      />
    </div>
  );
}
