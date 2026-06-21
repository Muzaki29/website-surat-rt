"use client";

import { useCallback, useEffect, useState } from "react";
import { Trash2, Wallet } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { formatRupiah } from "@/lib/format";
import type { JenisTransaksi, TransaksiKas } from "@/lib/types";

export function KasManager() {
  const [kas, setKas] = useState<TransaksiKas[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    tanggal: new Date().toISOString().slice(0, 10),
    jenis: "pemasukan" as JenisTransaksi,
    kategori: "Iuran Warga",
    keterangan: "",
    nominal: "",
  });

  const load = useCallback(async () => {
    const res = await fetch("/api/kas");
    setKas(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const saldo = kas.reduce(
    (acc, t) => (t.jenis === "pemasukan" ? acc + t.nominal : acc - t.nominal),
    0,
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/kas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, nominal: Number(form.nominal) }),
    });
    setForm({ ...form, keterangan: "", nominal: "" });
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus transaksi ini?")) return;
    await fetch(`/api/kas?id=${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Kas RT"
        description="Pencatatan pemasukan dan pengeluaran kas lingkungan — laporan keuangan transparan."
      />

      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
        <p className="text-sm font-medium text-blue-800">Saldo Kas Saat Ini</p>
        <p className="mt-1 text-3xl font-bold text-blue-900">{formatRupiah(saldo)}</p>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900">Catat Transaksi</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Tanggal</label>
            <input type="date" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Jenis</label>
            <select value={form.jenis} onChange={(e) => setForm({ ...form, jenis: e.target.value as JenisTransaksi })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
              <option value="pemasukan">Pemasukan</option>
              <option value="pengeluaran">Pengeluaran</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Kategori</label>
            <input value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Keterangan</label>
            <input value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Nominal (Rp)</label>
            <input type="number" min="0" value={form.nominal} onChange={(e) => setForm({ ...form, nominal: e.target.value })} required className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
          </div>
        </div>
        <button type="submit" className="mt-4 rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800">
          Simpan Transaksi
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <p className="p-6 text-sm text-slate-500">Memuat transaksi...</p>
        ) : kas.length === 0 ? (
          <div className="p-10 text-center">
            <Wallet className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm text-slate-600">Belum ada transaksi kas.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Tanggal</th>
                <th className="px-4 py-3 font-medium">Keterangan</th>
                <th className="px-4 py-3 font-medium">Jenis</th>
                <th className="px-4 py-3 font-medium">Nominal</th>
                <th className="px-4 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {kas.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-600">{t.tanggal}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{t.keterangan}</p>
                    <p className="text-xs text-slate-500">{t.kategori}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${t.jenis === "pemasukan" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                      {t.jenis === "pemasukan" ? "Masuk" : "Keluar"}
                    </span>
                  </td>
                  <td className={`px-4 py-3 font-medium ${t.jenis === "pemasukan" ? "text-green-700" : "text-red-700"}`}>
                    {t.jenis === "pemasukan" ? "+" : "-"} {formatRupiah(t.nominal)}
                  </td>
                  <td className="px-4 py-3">
                    <button type="button" onClick={() => handleDelete(t.id)} className="rounded p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
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
