"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle, Receipt, XCircle } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { JENIS_IURAN } from "@/lib/constants";
import { formatRupiah } from "@/lib/format";
import type { TagihanIuran } from "@/lib/types";

export function IuranManager() {
  const [tagihan, setTagihan] = useState<TagihanIuran[]>([]);
  const [loading, setLoading] = useState(true);
  const [periode, setPeriode] = useState(new Date().toISOString().slice(0, 7));
  const [jenisIuran, setJenisIuran] = useState<string>(JENIS_IURAN[0].id);
  const [generating, setGenerating] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/iuran");
    setTagihan(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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

  const belumBayar = tagihan.filter((t) => t.status === "belum-bayar").length;
  const menunggu = tagihan.filter((t) => t.status === "menunggu-konfirmasi").length;
  const totalTunggak = tagihan
    .filter((t) => t.status === "belum-bayar")
    .reduce((acc, t) => acc + t.nominal, 0);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Iuran & Tagihan"
        description="Terbitkan tagihan, konfirmasi pembayaran warga, otomatis catat ke Kas RT."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Tagihan" value={String(tagihan.length)} />
        <StatCard label="Belum Bayar" value={String(belumBayar)} accent="amber" />
        <StatCard label="Menunggu Konfirmasi" value={String(menunggu)} accent="sky" />
        <StatCard label="Tunggakan" value={formatRupiah(totalTunggak)} />
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

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <p className="p-6 text-sm text-slate-500">Memuat tagihan...</p>
        ) : tagihan.length === 0 ? (
          <div className="p-10 text-center">
            <Receipt className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm text-slate-600">Belum ada tagihan. Terbitkan tagihan periode baru.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Warga</th>
                <th className="px-4 py-3 font-medium">Jenis</th>
                <th className="px-4 py-3 font-medium">Periode</th>
                <th className="px-4 py-3 font-medium">Nominal</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tagihan.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{t.wargaNama}</td>
                  <td className="px-4 py-3 text-slate-600">{t.jenisIuran}</td>
                  <td className="px-4 py-3 text-slate-600">{t.periode}</td>
                  <td className="px-4 py-3 text-slate-900">{formatRupiah(t.nominal)}</td>
                  <td className="px-4 py-3"><Badge status={t.status} /></td>
                  <td className="px-4 py-3">
                    {t.status === "menunggu-konfirmasi" && (
                      <div className="flex flex-wrap gap-1">
                        <Button type="button" size="sm" onClick={() => handleKonfirmasi(t.id)}>
                          <CheckCircle className="h-3.5 w-3.5" />
                          Konfirmasi
                        </Button>
                        <Button type="button" size="sm" variant="danger" onClick={() => handleTolak(t.id)}>
                          <XCircle className="h-3.5 w-3.5" />
                          Tolak
                        </Button>
                      </div>
                    )}
                    {t.kodeReferensi && (
                      <p className="mt-1 font-mono text-xs text-[var(--color-text-subtle)]">
                        Ref: {t.kodeReferensi}
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

function StatCard({ label, value, accent }: { label: string; value: string; accent?: string }) {
  const color =
    accent === "amber" ? "text-amber-700" : accent === "sky" ? "text-sky-700" : "text-slate-900";
  return (
    <div className="border-t-2 border-[var(--color-primary)]/20 pt-4">
      <p className="text-sm text-[var(--color-text-muted)]">{label}</p>
      <p className={`mt-1 text-2xl font-bold tabular-nums tracking-tight ${color}`}>{value}</p>
    </div>
  );
}
