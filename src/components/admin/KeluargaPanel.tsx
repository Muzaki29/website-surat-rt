import { Badge } from "@/components/ui/Badge";
import type { KeluargaGroup } from "@/lib/keluarga";
import type { Warga } from "@/lib/types";

export function KeluargaPanel({ groups, warga }: { groups: KeluargaGroup[]; warga: Warga[] }) {
  const tanpaKk = warga.filter((w) => !w.noKk?.trim()).length;
  const keluargaMulti = groups.filter((g) => g.jumlahAnggota > 1);

  if (groups.length === 0 && tanpaKk === 0) return null;

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="font-semibold text-slate-900">Informasi Keluarga (per KK)</h2>
        <p className="mt-1 text-sm text-slate-600">
          Warga dengan nomor Kartu Keluarga (KK) sama dikelompokkan otomatis untuk memudahkan
          verifikasi administrasi.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Total KK terdata" value={String(groups.length)} />
        <Stat label="Keluarga ≥ 2 anggota" value={String(keluargaMulti.length)} />
        <Stat label="Warga tanpa KK" value={String(tanpaKk)} accent={tanpaKk > 0} />
      </div>

      {keluargaMulti.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-slate-700">Keluarga dengan beberapa anggota</h3>
          {keluargaMulti.slice(0, 8).map((g) => (
            <div
              key={g.noKk}
              className="rounded-xl border border-slate-100 bg-slate-50/80 px-4 py-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-mono text-xs text-slate-600">KK {g.noKk}</p>
                <span className="text-xs font-medium text-slate-500">
                  {g.jumlahAnggota} anggota
                </span>
              </div>
              <ul className="mt-2 space-y-1">
                {g.anggota.map((a) => (
                  <li key={a.id} className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-medium text-slate-900">{a.nama}</span>
                    <span className="text-xs text-slate-500">NIK {a.nik}</span>
                    <Badge status={a.status} />
                  </li>
                ))}
              </ul>
              {g.alamatUtama && (
                <p className="mt-2 text-xs text-slate-500 line-clamp-2">{g.alamatUtama}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className={`rounded-xl border px-4 py-3 ${accent ? "border-amber-200 bg-amber-50" : "border-slate-100"}`}>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold tabular-nums text-slate-900">{value}</p>
    </div>
  );
}
