"use client";

import { useCallback, useEffect, useState } from "react";
import { Archive, Search } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Input";
import type { ArsipItem } from "@/lib/types";

export function ArsipManager() {
  const [items, setItems] = useState<ArsipItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [jenis, setJenis] = useState<"all" | "surat-masuk" | "surat-keluar" | "pengajuan">("all");
  const [dari, setDari] = useState("");
  const [sampai, setSampai] = useState("");

  const search = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (jenis !== "all") params.set("jenis", jenis);
    if (dari) params.set("dari", dari);
    if (sampai) params.set("sampai", sampai);

    const res = await fetch(`/api/arsip?${params.toString()}`);
    setItems(await res.json());
    setLoading(false);
  }, [q, jenis, dari, sampai]);

  useEffect(() => {
    search();
  }, [search]);

  const jenisLabel: Record<ArsipItem["jenis"], string> = {
    "surat-masuk": "Surat Masuk",
    "surat-keluar": "Surat Keluar",
    pengajuan: "Pengajuan Warga",
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Arsip Digital"
        description="Pencarian terpadu surat masuk, keluar, dan pengajuan warga."
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          search();
        }}
        className="grid gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 sm:grid-cols-2 lg:grid-cols-5"
      >
        <div className="sm:col-span-2 lg:col-span-2">
          <Input
            label="Cari kata kunci"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Nomor, perihal, nama..."
          />
        </div>
        <Select label="Jenis arsip" value={jenis} onChange={(e) => setJenis(e.target.value as typeof jenis)}>
          <option value="all">Semua</option>
          <option value="surat-masuk">Surat Masuk</option>
          <option value="surat-keluar">Surat Keluar</option>
          <option value="pengajuan">Pengajuan Warga</option>
        </Select>
        <Input label="Dari tanggal" type="date" value={dari} onChange={(e) => setDari(e.target.value)} />
        <Input label="Sampai tanggal" type="date" value={sampai} onChange={(e) => setSampai(e.target.value)} />
        <div className="flex items-end sm:col-span-2 lg:col-span-5">
          <Button type="submit" disabled={loading}>
            <Search className="h-4 w-4" />
            {loading ? "Mencari..." : "Cari Arsip"}
          </Button>
        </div>
      </form>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--color-border)] p-8 text-center">
          <Archive className="mx-auto h-8 w-8 text-[var(--color-text-subtle)]" />
          <p className="mt-3 text-sm text-[var(--color-text-muted)]">
            {loading ? "Memuat arsip..." : "Tidak ada arsip yang cocok dengan filter."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[var(--color-border)]">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Nomor</th>
                <th className="px-4 py-3 font-medium">Jenis</th>
                <th className="px-4 py-3 font-medium">Tanggal</th>
                <th className="px-4 py-3 font-medium">Subjek</th>
                <th className="px-4 py-3 font-medium">Pihak</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {items.map((item) => (
                <tr key={`${item.jenis}-${item.id}`} className="hover:bg-[var(--color-surface-muted)]/50">
                  <td className="px-4 py-3 font-mono text-xs">{item.nomor}</td>
                  <td className="px-4 py-3">{jenisLabel[item.jenis]}</td>
                  <td className="px-4 py-3 tabular-nums">{item.tanggal}</td>
                  <td className="px-4 py-3">{item.subjek}</td>
                  <td className="px-4 py-3">{item.pihak}</td>
                  <td className="px-4 py-3">
                    <Badge status={item.status as "diajukan"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-[var(--color-border)] px-4 py-3 text-xs text-[var(--color-text-subtle)]">
            {items.length} dokumen ditemukan
          </p>
        </div>
      )}
    </div>
  );
}
