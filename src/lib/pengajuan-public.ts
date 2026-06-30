import { maskNik } from "@/lib/security";
import type { PengajuanSurat, PengajuanTimelineEntry } from "@/lib/types";

/** Data pengajuan yang aman untuk lookup publik (tanpa catatan internal pengurus). */
export function toPublicPengajuan(item: PengajuanSurat) {
  const publicTimeline = (item.timeline ?? []).filter(
    (e: PengajuanTimelineEntry & { internal?: boolean }) => !e.internal,
  );

  return {
    id: item.id,
    jenisSurat: item.jenisSurat,
    namaPemohon: item.namaPemohon,
    nik: maskNik(item.nik),
    alamat: item.alamat,
    keperluan: item.keperluan,
    tanggalAjuan: item.tanggalAjuan,
    status: item.status,
    dokumenDiminta: item.dokumenDiminta,
    estimasiSelesai: item.estimasiSelesai,
    nomorSuratKeluar: item.nomorSuratKeluar,
    berkas: item.berkas?.map((b) => ({
      id: b.id,
      jenis: b.jenis,
      namaFile: b.namaFile,
    })),
    timeline: publicTimeline,
  };
}
