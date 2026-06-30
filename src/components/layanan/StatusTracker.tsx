import { Badge } from "@/components/ui/Badge";
import { JENIS_SURAT } from "@/data/jenis-surat";
import type { PengajuanSurat } from "@/lib/types";

const steps = [
  { key: "diajukan", label: "Diajukan" },
  { key: "diproses", label: "Diproses" },
  { key: "disetujui", label: "Disetujui" },
  { key: "selesai", label: "Selesai" },
];

export function StatusTracker({ data, id }: { data: PengajuanSurat; id: string }) {
  const jenisLabel = JENIS_SURAT.find((j) => j.slug === data.jenisSurat)?.nama ?? data.jenisSurat;
  const currentIndex = steps.findIndex((s) => s.key === data.status);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <p className="text-sm text-[var(--color-text-muted)]">Status Pengajuan</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">{jenisLabel}</h1>
        <p className="mt-2 font-mono text-xs text-[var(--color-text-subtle)]">ID: {id}</p>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">Pemohon: {data.namaPemohon}</p>
        {data.estimasiSelesai && (
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Estimasi selesai: {data.estimasiSelesai}
          </p>
        )}
        {data.dokumenDiminta && (
          <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Dokumen tambahan diminta: {data.dokumenDiminta}
          </p>
        )}
        <div className="mt-4"><Badge status={data.status} /></div>
        {["disetujui", "selesai"].includes(data.status) && (
          <a
            href={`/api/pengajuan/${id}/pdf`}
            className="mt-4 inline-flex rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Unduh Surat (PDF)
          </a>
        )}
        {data.berkas && data.berkas.length > 0 && (
          <div className="mt-4 border-t border-[var(--color-border)] pt-4">
            <p className="text-sm font-medium">Berkas terlampir ({data.berkas.length})</p>
            <ul className="mt-2 space-y-1">
              {data.berkas.map((b) => (
                <li key={b.id}>
                  <a
                    href={`/api/pengajuan/berkas/${b.id}?pengajuanId=${id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[var(--color-primary)] hover:underline"
                  >
                    {b.jenis.toUpperCase()} — {b.namaFile}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {data.status !== "ditolak" ? (
        <ol className="space-y-3" aria-label="Progress pengajuan">
          {steps.map((step, i) => (
            <li
              key={step.key}
              className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors ${
                i <= currentIndex
                  ? "border-[var(--color-accent)]/30 bg-teal-50/50"
                  : "border-[var(--color-border)] text-[var(--color-text-subtle)]"
              }`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                  i <= currentIndex
                    ? "bg-[var(--color-accent)] text-white"
                    : "bg-[var(--color-surface-muted)]"
                }`}
              >
                {i + 1}
              </span>
              {step.label}
            </li>
          ))}
        </ol>
      ) : (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-800">
          Pengajuan ditolak. Hubungi Sekretaris RT untuk informasi lebih lanjut.
        </p>
      )}
    </div>
  );
}
