import Link from "next/link";
import { AlertTriangle, ArrowRight, Info } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { formatRupiah } from "@/lib/format";
import { getMonitoringData } from "@/lib/monitoring";

const levelStyles = {
  info: "border-sky-200 bg-sky-50 text-sky-900",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
  critical: "border-red-200 bg-red-50 text-red-900",
};

export default async function MonitoringPage() {
  const data = await getMonitoringData();

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Monitoring Sistem"
        description="Pantau alert operasional RT — pengajuan, pembayaran, support, dan aktivitas terbaru."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { label: "Pengajuan", value: data.ringkasan.pengajuanMenunggu },
          { label: "Bayar Pending", value: data.ringkasan.pembayaranMenunggu },
          { label: "Tunggakan", value: data.ringkasan.tagihanBelumBayar },
          { label: "Tiket Support", value: data.ringkasan.tiketTerbuka },
          { label: "Saldo Kas", value: formatRupiah(data.ringkasan.saldoKas) },
        ].map((item) => (
          <div key={item.label} className="border-t-2 border-[var(--color-accent)]/30 pt-3">
            <p className="text-xs uppercase tracking-wide text-[var(--color-text-subtle)]">{item.label}</p>
            <p className="mt-1 text-xl font-bold tabular-nums">{item.value}</p>
          </div>
        ))}
      </div>

      <section>
        <h2 className="mb-4 font-semibold">Alert Aktif</h2>
        {data.alerts.length === 0 ? (
          <p className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 text-sm text-[var(--color-text-muted)]">
            Semua sistem normal. Tidak ada alert saat ini.
          </p>
        ) : (
          <div className="space-y-3">
            {data.alerts.map((alert) => (
              <Link
                key={alert.id}
                href={alert.href}
                className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all hover:shadow-sm ${levelStyles[alert.level]}`}
              >
                <div className="flex items-start gap-3">
                  {alert.level === "critical" ? (
                    <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
                  ) : (
                    <Info className="mt-0.5 h-5 w-5 shrink-0" />
                  )}
                  <div>
                    <p className="font-medium">{alert.title}</p>
                    <p className="text-sm opacity-90">{alert.description}</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 font-semibold">Aktivitas Terbaru</h2>
        <ul className="divide-y divide-[var(--color-border)] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          {data.aktivitasTerbaru.length === 0 ? (
            <li className="p-6 text-sm text-[var(--color-text-muted)]">Belum ada aktivitas.</li>
          ) : (
            data.aktivitasTerbaru.map((a) => (
              <li key={`${a.tipe}-${a.kegiatan}`} className="flex items-center justify-between px-4 py-3 text-sm">
                <span>{a.kegiatan}</span>
                <span className="text-[var(--color-text-subtle)]">{a.waktu}</span>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
