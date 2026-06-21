import { cn } from "@/lib/cn";

const statusStyles: Record<string, string> = {
  draft: "bg-slate-100 text-slate-700",
  diajukan: "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
  diproses: "bg-sky-50 text-sky-800 ring-1 ring-sky-200",
  disetujui: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200",
  ditolak: "bg-red-50 text-red-800 ring-1 ring-red-200",
  selesai: "bg-teal-50 text-teal-800 ring-1 ring-teal-200",
  "belum-bayar": "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
  "menunggu-konfirmasi": "bg-sky-50 text-sky-800 ring-1 ring-sky-200",
  lunas: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200",
  terbuka: "bg-amber-50 text-amber-800 ring-1 ring-amber-200",
  aktif: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200",
  "menunggu-verifikasi": "bg-violet-50 text-violet-800 ring-1 ring-violet-200",
};

const statusLabels: Record<string, string> = {
  draft: "Draft",
  diajukan: "Diajukan",
  diproses: "Diproses",
  disetujui: "Disetujui",
  ditolak: "Ditolak",
  selesai: "Selesai",
  "belum-bayar": "Belum Bayar",
  "menunggu-konfirmasi": "Menunggu Konfirmasi",
  lunas: "Lunas",
  terbuka: "Terbuka",
  aktif: "Aktif",
  "menunggu-verifikasi": "Menunggu Verifikasi",
};

export function Badge({
  status,
  className,
}: {
  status: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-md px-2 py-0.5 text-xs font-medium",
        statusStyles[status] ?? "bg-slate-100 text-slate-700",
        className,
      )}
    >
      {statusLabels[status] ?? status}
    </span>
  );
}
