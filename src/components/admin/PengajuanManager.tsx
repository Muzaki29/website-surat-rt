"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  BulkActionBar,
  BulkSelectAll,
  BulkSelectRow,
  useBulkDeleteHandler,
} from "@/components/admin/BulkActions";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { JENIS_SURAT } from "@/data/jenis-surat";
import { useBulkSelection } from "@/hooks/useBulkSelection";
import { bulkDeleteRequest } from "@/lib/bulk-client";
import type { PengajuanSurat } from "@/lib/types";

export function PengajuanManager() {
  const [items, setItems] = useState<PengajuanSurat[]>([]);
  const [loading, setLoading] = useState(true);
  const [workflowId, setWorkflowId] = useState<string | null>(null);
  const [workflow, setWorkflow] = useState({
    status: "" as PengajuanSurat["status"] | "",
    catatanInternal: "",
    penugasanKe: "",
    dokumenDiminta: "",
    estimasiSelesai: "",
    nomorSuratKeluar: "",
  });

  const load = useCallback(async () => {
    const res = await fetch("/api/pengajuan");
    setItems(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const allIds = useMemo(() => items.map((p) => p.id), [items]);
  const bulk = useBulkSelection(allIds);
  const { deleting, handleBulkDelete } = useBulkDeleteHandler({
    resource: "pengajuan",
    selectedIds: bulk.selectedIds,
    itemLabel: "pengajuan",
    clear: bulk.clear,
    onSuccess: load,
  });

  async function updateStatus(id: string, status: PengajuanSurat["status"]) {
    await fetch("/api/pengajuan", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    load();
  }

  function openWorkflow(p: PengajuanSurat) {
    setWorkflowId(p.id);
    setWorkflow({
      status: p.status,
      catatanInternal: p.catatanInternal ?? "",
      penugasanKe: p.penugasanKe ?? "",
      dokumenDiminta: p.dokumenDiminta ?? "",
      estimasiSelesai: p.estimasiSelesai ?? "",
      nomorSuratKeluar: p.nomorSuratKeluar ?? "",
    });
  }

  async function saveWorkflow(e: React.FormEvent) {
    e.preventDefault();
    if (!workflowId) return;
    await fetch("/api/pengajuan", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: workflowId, ...workflow }),
    });
    setWorkflowId(null);
    load();
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus pengajuan ini?")) return;
    await bulkDeleteRequest("pengajuan", [id]);
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

      <BulkActionBar
        count={bulk.selectedCount}
        itemLabel="pengajuan"
        deleting={deleting}
        onClear={bulk.clear}
        onDelete={handleBulkDelete}
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
                <th className="w-10 px-4 py-3">
                  <BulkSelectAll
                    checked={bulk.allSelected}
                    indeterminate={bulk.someSelected}
                    onChange={bulk.toggleAll}
                  />
                </th>
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
                    <BulkSelectRow
                      checked={bulk.isSelected(p.id)}
                      onChange={() => bulk.toggle(p.id)}
                      label={p.namaPemohon}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{p.namaPemohon}</p>
                    <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">{p.nik}</p>
                    {p.berkas && p.berkas.length > 0 && (
                      <p className="mt-1 text-xs text-[var(--color-accent)]">
                        {p.berkas.length} berkas ·{" "}
                        {p.berkas.map((b) => (
                          <a
                            key={b.id}
                            href={`/api/pengajuan/berkas/${b.id}?pengajuanId=${p.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mr-2 underline"
                          >
                            {b.jenis}
                          </a>
                        ))}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-[var(--color-text-subtle)] lg:hidden">{getJenisLabel(p.jenisSurat)}</p>
                  </td>
                  <td className="hidden px-4 py-3 text-[var(--color-text-muted)] lg:table-cell">
                    {getJenisLabel(p.jenisSurat)}
                  </td>
                  <td className="px-4 py-3 text-[var(--color-text-muted)]">{p.tanggalAjuan}</td>
                  <td className="px-4 py-3"><Badge status={p.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-1">
                      <Button type="button" size="sm" variant="secondary" onClick={() => openWorkflow(p)}>
                        Kelola
                      </Button>
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
                      <Button type="button" size="sm" variant="ghost" onClick={() => handleDelete(p.id)} aria-label="Hapus">
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

      {workflowId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form onSubmit={saveWorkflow} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold">Kelola Pengajuan</h3>
            <div className="mt-4 space-y-3">
              <div>
                <label className="text-sm font-medium">Status</label>
                <select className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" value={workflow.status} onChange={(e) => setWorkflow({ ...workflow, status: e.target.value as PengajuanSurat["status"] })}>
                  <option value="diajukan">Diajukan</option>
                  <option value="diproses">Diproses</option>
                  <option value="disetujui">Disetujui</option>
                  <option value="ditolak">Ditolak</option>
                  <option value="selesai">Selesai</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Penugasan ke</label>
                <input className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" value={workflow.penugasanKe} onChange={(e) => setWorkflow({ ...workflow, penugasanKe: e.target.value })} placeholder="Sekretaris / Ketua RT" />
              </div>
              <div>
                <label className="text-sm font-medium">Dokumen diminta</label>
                <textarea className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" rows={2} value={workflow.dokumenDiminta} onChange={(e) => setWorkflow({ ...workflow, dokumenDiminta: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium">Catatan internal (tidak tampil ke warga)</label>
                <textarea className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" rows={2} value={workflow.catatanInternal} onChange={(e) => setWorkflow({ ...workflow, catatanInternal: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Estimasi selesai</label>
                  <input type="date" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" value={workflow.estimasiSelesai} onChange={(e) => setWorkflow({ ...workflow, estimasiSelesai: e.target.value })} />
                </div>
                <div>
                  <label className="text-sm font-medium">No. surat keluar</label>
                  <input className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" value={workflow.nomorSuratKeluar} onChange={(e) => setWorkflow({ ...workflow, nomorSuratKeluar: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setWorkflowId(null)}>Batal</Button>
              <Button type="submit">Simpan</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
