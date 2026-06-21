import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { formatRupiah } from "@/lib/format";
import { getAnalyticsData } from "@/lib/analytics";
import { JENIS_SURAT } from "@/data/jenis-surat";

export default async function AnalitikPage() {
  const data = await getAnalyticsData();

  function labelJenis(slug: string) {
    return JENIS_SURAT.find((j) => j.slug === slug)?.nama ?? slug;
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Analitik Sistem"
        description="Laporan kinerja RT — koleksi iuran, surat, kas, dan tren layanan."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <h2 className="font-semibold">Tingkat Koleksi Iuran</h2>
          <p className="mt-4 text-4xl font-bold tabular-nums text-[var(--color-primary)]">
            {data.koleksiIuran.persen}%
          </p>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            {data.koleksiIuran.lunas} dari {data.koleksiIuran.total} tagihan lunas
          </p>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-[var(--color-surface-muted)]">
            <div
              className="h-full rounded-full bg-[var(--color-accent)] transition-all"
              style={{ width: `${data.koleksiIuran.persen}%` }}
            />
          </div>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <h2 className="font-semibold">Surat Bulan Ini</h2>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-[var(--color-text-muted)]">Masuk</p>
              <p className="text-3xl font-bold tabular-nums">{data.suratBulanIni.masuk}</p>
            </div>
            <div>
              <p className="text-sm text-[var(--color-text-muted)]">Keluar</p>
              <p className="text-3xl font-bold tabular-nums">{data.suratBulanIni.keluar}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h2 className="font-semibold">Kas RT Bulan Ini</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-emerald-50 p-4">
            <p className="text-sm text-emerald-800">Pemasukan</p>
            <p className="text-xl font-bold tabular-nums text-emerald-900">
              {formatRupiah(data.kasBulanIni.pemasukan)}
            </p>
          </div>
          <div className="rounded-lg bg-red-50 p-4">
            <p className="text-sm text-red-800">Pengeluaran</p>
            <p className="text-xl font-bold tabular-nums text-red-900">
              {formatRupiah(data.kasBulanIni.pengeluaran)}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
        <h2 className="font-semibold">Tren Koleksi Iuran (6 Bulan)</h2>
        <div className="mt-6 space-y-3">
          {data.trenIuran6Bulan.map((row) => {
            const pct = row.total > 0 ? Math.round((row.lunas / row.total) * 100) : 0;
            return (
              <div key={row.periode}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-[var(--color-text-muted)]">{row.periode}</span>
                  <span className="tabular-nums">{row.lunas}/{row.total} ({pct}%)</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[var(--color-surface-muted)]">
                  <div className="h-full rounded-full bg-[var(--color-primary)]" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {data.pengajuanPerJenis.length > 0 && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
          <h2 className="font-semibold">Pengajuan per Jenis Surat</h2>
          <ul className="mt-4 space-y-2">
            {data.pengajuanPerJenis.map((item) => (
              <li key={item.jenis} className="flex items-center justify-between border-b border-[var(--color-border)] py-2 text-sm">
                <span>{labelJenis(item.jenis)}</span>
                <span className="font-semibold tabular-nums">{item.jumlah}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
