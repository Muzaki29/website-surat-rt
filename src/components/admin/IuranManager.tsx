"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CheckCircle, QrCode, Receipt, Trash2, Wallet, XCircle } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  BulkActionBar,
  BulkSelectAll,
  BulkSelectRow,
  useBulkDeleteHandler,
} from "@/components/admin/BulkActions";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { JENIS_IURAN } from "@/lib/constants";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import { bulkDeleteRequest } from "@/lib/bulk-client";
import { METODE_PEMBAYARAN_LABEL } from "@/lib/keluarga";
import { formatRupiah } from "@/lib/format";
import type { TagihanIuran } from "@/lib/types";

export function IuranManager() {
  const [tagihan, setTagihan] = useState<TagihanIuran[]>([]);
  const [loading, setLoading] = useState(true);
  const [periode, setPeriode] = useState(new Date().toISOString().slice(0, 7));
  const [jenisIuran, setJenisIuran] = useState<string>(JENIS_IURAN[0].id);
  const [generating, setGenerating] = useState(false);
  const [filterMetode, setFilterMetode] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const load = useCallback(async () => {
    const res = await fetch("/api/iuran");
    setTagihan(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const allIds = useMemo(() => tagihan.map((t) => t.id), [tagihan]);
  const bulk = useBulkSelection(allIds);
  const { deleting, handleBulkDelete } = useBulkDeleteHandler({
    resource: "iuran",
    selectedIds: bulk.selectedIds,
    itemLabel: "tagihan",
    clear: bulk.clear,
    onSuccess: load,
  });

  async function handleGenerate() {
    setGenerating(true);
    await fetch("/api/iuran", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "generate", periode, jenisIuran }),
    });
    setGenerating(false);
    load();
  }

  async function handleKonfirmasi(id: string) {
    await fetch("/api/iuran", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "konfirmasi", id }),
    });
    load();
  }

  async function handleTolak(id: string) {
    await fetch("/api/iuran", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "tolak", id }),
    });
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus tagihan ini?")) return;
    await bulkDeleteRequest("iuran", [id]);
    load();
  }

  const belumBayar = tagihan.filter((t) => t.status === "belum-bayar").length;
  const menunggu = tagihan.filter((t) => t.status === "menunggu-konfirmasi").length;
  const qrisPending = tagihan.filter(
    (t) => t.status === "menunggu-konfirmasi" && t.metodePembayaran === "qris",
  ).length;
  const transferPending = tagihan.filter(
    (t) => t.status === "menunggu-konfirmasi" && t.metodePembayaran === "transfer-bank",
  ).length;
  const tunaiPending = tagihan.filter(
    (t) => t.status === "menunggu-konfirmasi" && t.metodePembayaran === "tunai",
  ).length;
  const totalTunggak = tagihan
    .filter((t) => t.status === "belum-bayar")
    .reduce((acc, t) => acc + t.nominal, 0);

  const filtered = useMemo(() => {
    return tagihan.filter((t) => {
      if (filterStatus !== "all" && t.status !== filterStatus) return false;
      if (filterMetode !== "all" && t.metodePembayaran !== filterMetode) return false;
      return true;
    });
  }, [tagihan, filterMetode, filterStatus]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Iuran & Tagihan"
        description="Terbitkan tagihan, konfirmasi pembayaran warga, otomatis catat ke Kas RT."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <StatCard label="Total Tagihan" value={String(tagihan.length)} />
        <StatCard label="Belum Bayar" value={String(belumBayar)} accent="amber" />
        <StatCard label="Menunggu Konfirmasi" value={String(menunggu)} accent="sky" />
        <StatCard label="QRIS Pending" value={String(qrisPending)} icon={QrCode} />
        <StatCard label="Transfer Pending" value={String(transferPending)} icon={Wallet} />
        <StatCard label="Tunggakan" value={formatRupiah(totalTunggak)} />
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { id: "all", label: "Semua status" },
          { id: "menunggu-konfirmasi", label: "Menunggu konfirmasi" },
          { id: "belum-bayar", label: "Belum bayar" },
          { id: "lunas", label: "Lunas" },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilterStatus(f.id)}
            className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium ${
              filterStatus === f.id
                ? "bg-blue-700 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200"
            }`}
          >
            {f.label}
          </button>
        ))}
        <span className="mx-1 w-px bg-slate-200" />
        {[
          { id: "all", label: "Semua metode" },
          { id: "qris", label: "QRIS" },
          { id: "transfer-bank", label: "Transfer" },
          { id: "tunai", label: "Tunai" },
          { id: "midtrans", label: "Midtrans" },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilterMetode(f.id)}
            className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium ${
              filterMetode === f.id
                ? "bg-teal-700 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-slate-900">Terbitkan Tagihan Baru</h2>
        <p className="mt-1 text-sm text-slate-600">
          Generate tagihan otomatis untuk semua warga aktif. Pastikan data warga sudah diisi.
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Periode</label>
            <input
              type="month"
              value={periode}
              onChange={(e) => setPeriode(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Jenis Iuran</label>
            <select
              value={jenisIuran}
              onChange={(e) => setJenisIuran(e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              {JENIS_IURAN.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.nama} — {formatRupiah(j.nominal)}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="rounded-xl bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
          >
            {generating ? "Memproses..." : "Terbitkan Tagihan"}
          </button>
        </div>
      </div>

      <BulkActionBar
        count={bulk.selectedCount}
        itemLabel="tagihan"
        deleting={deleting}
        onClear={bulk.clear}
        onDelete={handleBulkDelete}
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <p className="p-6 text-sm text-slate-500">Memuat tagihan...</p>
        ) : tagihan.length === 0 ? (
          <div className="p-10 text-center">
            <Receipt className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm text-slate-600">Belum ada tagihan. Terbitkan tagihan periode baru.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm text-slate-600">Tidak ada tagihan sesuai filter.</p>
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
                <th className="px-4 py-3 font-medium">Warga</th>
                <th className="px-4 py-3 font-medium">Jenis</th>
                <th className="px-4 py-3 font-medium">Periode</th>
                <th className="px-4 py-3 font-medium">Metode</th>
                <th className="px-4 py-3 font-medium">Nominal</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <BulkSelectRow
                      checked={bulk.isSelected(t.id)}
                      onChange={() => bulk.toggle(t.id)}
                      label={t.wargaNama}
                    />
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-900">{t.wargaNama}</td>
                  <td className="px-4 py-3 text-slate-600">{t.jenisIuran}</td>
                  <td className="px-4 py-3 text-slate-600">{t.periode}</td>
                  <td className="px-4 py-3">
                    {t.metodePembayaran ? (
                      <span className="inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                        {METODE_PEMBAYARAN_LABEL[t.metodePembayaran] ?? t.metodePembayaran}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-900">{formatRupiah(t.nominal)}</td>
                  <td className="px-4 py-3"><Badge status={t.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-1">
                      {t.status === "menunggu-konfirmasi" && (
                        <>
                          <Button type="button" size="sm" onClick={() => handleKonfirmasi(t.id)}>
                            <CheckCircle className="h-3.5 w-3.5" />
                            Konfirmasi
                          </Button>
                          <Button type="button" size="sm" variant="danger" onClick={() => handleTolak(t.id)}>
                            <XCircle className="h-3.5 w-3.5" />
                            Tolak
                          </Button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(t.id)}
                        className="rounded p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
                        aria-label="Hapus tagihan"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    {t.kodeReferensi && (
                      <p className="mt-1 font-mono text-xs text-[var(--color-text-subtle)]">
                        Ref: {t.kodeReferensi}
                      </p>
                    )}
                    {t.tanggalAjuanBayar && (
                      <p className="mt-0.5 text-xs text-[var(--color-text-subtle)]">
                        Diajukan: {t.tanggalAjuanBayar}
                      </p>
                    )}
                    {t.catatanPembayaran && (
                      <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                        {t.catatanPembayaran}
                      </p>
                    )}
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

function StatCard({
  label,
  value,
  accent,
  icon: Icon,
}: {
  label: string;
  value: string;
  accent?: string;
  icon?: typeof Receipt;
}) {
  const color =
    accent === "amber" ? "text-amber-700" : accent === "sky" ? "text-sky-700" : "text-slate-900";
  return (
    <div className="border-t-2 border-[var(--color-primary)]/20 pt-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-[var(--color-text-muted)]">{label}</p>
        {Icon && <Icon className="h-4 w-4 text-[var(--color-text-subtle)]" />}
      </div>
      <p className={`mt-1 text-2xl font-bold tabular-nums tracking-tight ${color}`}>{value}</p>
    </div>
  );
}
