"use client";

import { Download } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/Button";

const reports = [
  { type: "iuran", label: "Laporan Iuran Lengkap", desc: "Semua tagihan dengan status & metode bayar" },
  { type: "tunggakan", label: "Daftar Tunggakan", desc: "Warga yang belum membayar iuran" },
  { type: "kas", label: "Buku Kas RT", desc: "Semua transaksi pemasukan & pengeluaran" },
];

export function LaporanKeuanganPanel() {
  return (
    <div className="space-y-6">
      <AdminPageHeader title="Laporan Keuangan" description="Unduh data keuangan RT dalam format CSV (Excel)." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {reports.map((r) => (
          <div key={r.type} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
            <p className="font-semibold">{r.label}</p>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">{r.desc}</p>
            <a href={`/api/laporan/keuangan?type=${r.type}`} className="mt-4 inline-block">
              <Button type="button" variant="secondary" size="sm">
                <Download className="h-4 w-4" />
                Unduh CSV
              </Button>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
