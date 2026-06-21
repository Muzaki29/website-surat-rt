"use client";

import { useCallback, useEffect, useState } from "react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { JENIS_SURAT } from "@/data/jenis-surat";
import type { PengajuanSurat } from "@/lib/types";

export function PengajuanManager() {
  const [items, setItems] = useState<PengajuanSurat[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/pengajuan");
    setItems(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function updateStatus(id: string, status: PengajuanSurat["status"]) {
    await fetch("/api/pengajuan", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    load();
  }

  function getJenisLabel(slug: string) {
    return JENIS_SURAT.find((j) => j.slug === slug)?.nama ?? slug;
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Pengajuan Warga"
        description="Verifikasi pengajuan surat online dari warga RT."
      />

      <div className="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
        {loading ? (
          <p className="p-6 text-sm text-[var(--color-text-muted)]">Memuat pengajuan...</p>
        ) : items.length === 0 ? (
          <p className="p-10 text-center text-sm text-[var(--color-text-muted)]">Belum ada pengajuan masuk.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-text-muted)]">
              <tr>
                <th className="px-4 py-3 font-medium">Pemohon</th>
                <th className="hidden px-4 py-3 font-medium lg:table-cell">Jenis Surat</th>
                <th className="px-4 py-3 font-medium">Tanggal</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {items.map((p) => (
                <tr key={p.id} className="align-top transition-colors hover:bg-[var(--color-surface-muted)]/60">
                  <td className="px-4 py-3">
                    <p className="font-medium">{p.namaPemohon}</p>
                    <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{p.nik}</p>
                    <p className="mt-1 text-xs text-[var(--color-text-subtle)] lg:hidden">{getJenisLabel(p.jenisSurat)}</p>
                  </td>
                  <td className="hidden px-4 py-3 text-[var(--color-text-muted)] lg:table-cell">
                    {getJenisLabel(p.jenisSurat)}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)]">{p.tanggalAjuan}</td>
                  <td className="px-4 py-3"><Badge status={p.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {p.status === "diajukan" && (
                        <Button type="button" size="sm" variant="secondary" onClick={() => updateStatus(p.id, "diproses")}>
                          Proses
                        </Button>
                      )}
                      {(p.status === "diajukan" || p.status === "diproses") && (
                        <>
                          <Button type="button" size="sm" onClick={() => updateStatus(p.id, "disetujui")}>
                            Setujui
                          </Button>
                          <Button type="button" size="sm" variant="danger" onClick={() => updateStatus(p.id, "ditolak")}>
                            Tolak
                          </Button>
                        </>
                      )}
                      {p.status === "disetujui" && (
                        <Button type="button" size="sm" onClick={() => updateStatus(p.id, "selesai")}>
                          Selesai
                        </Button>
                      )}
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
