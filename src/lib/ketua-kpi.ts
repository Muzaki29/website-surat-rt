import { prisma } from "@/lib/db";
import { readJson } from "@/lib/storage";
import type { KetuaKpi, PengajuanSurat, TagihanIuran, TiketSupport, Warga } from "@/lib/types";

export async function getKetuaKpi(): Promise<KetuaKpi> {
  const [warga, tagihan, pengajuan, tiket] = await Promise.all([
    readJson<Warga[]>("warga.json", []),
    readJson<TagihanIuran[]>("iuran.json", []),
    readJson<PengajuanSurat[]>("pengajuan.json", []),
    readJson<TiketSupport[]>("support.json", []),
  ]);

  return {
    tunggakanIuran: tagihan.filter((t) => t.status === "belum-bayar").length,
    pengajuanMenunggu: pengajuan.filter((p) =>
      ["diajukan", "diproses"].includes(p.status),
    ).length,
    wargaMenungguVerifikasi: warga.filter((w) => w.status === "menunggu-verifikasi").length,
    tiketTerbuka: tiket.filter((t) => t.status === "terbuka" || t.status === "diproses").length,
    pembayaranPending: tagihan.filter((t) => t.status === "menunggu-konfirmasi").length,
  };
}

export async function getWargaPaymentHistory(wargaId: string) {
  const tagihan = await readJson<TagihanIuran[]>("iuran.json", []);
  return tagihan
    .filter((t) => t.wargaId === wargaId)
    .sort((a, b) => (b.tanggalBayar ?? b.periode).localeCompare(a.tanggalBayar ?? a.periode));
}
