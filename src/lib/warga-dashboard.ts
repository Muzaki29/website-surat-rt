import { prisma } from "@/lib/db";
import { readJson } from "@/lib/storage";
import type { PengajuanSurat, Pengumuman, TagihanIuran, Warga } from "@/lib/types";

export interface WargaDashboardData {
  warga: Warga;
  stats: {
    pengajuanAktif: number;
    pengajuanTotal: number;
    tagihanBelumBayar: number;
    artikelForum: number;
  };
  pengajuanTerbaru: PengajuanSurat[];
  tagihan: TagihanIuran[];
  riwayatPembayaran: TagihanIuran[];
  pengumumanTerbaru: Pengumuman[];
}

export async function getWargaDashboardData(
  userId: string,
  wargaId: string | null | undefined,
): Promise<WargaDashboardData | null> {
  if (!wargaId) return null;

  const row = await prisma.warga.findUnique({ where: { id: wargaId } });
  if (!row) return null;

  const warga: Warga = {
    id: row.id,
    nama: row.nama,
    nik: row.nik,
    noKk: row.noKk ?? "",
    alamat: row.alamat,
    noHp: row.noHp,
    status: row.status as Warga["status"],
    tanggalMasuk: row.tanggalMasuk,
    userId: row.userId ?? undefined,
  };

  const [allPengajuan, allTagihan, allPengumuman, artikelForum] = await Promise.all([
    readJson<PengajuanSurat[]>("pengajuan.json", []),
    readJson<TagihanIuran[]>("iuran.json", []),
    readJson<Pengumuman[]>("pengumuman.json", []),
    prisma.forumThread.count({ where: { penulisUserId: userId } }),
  ]);

  const pengajuanSaya = allPengajuan
    .filter((p) => p.nik === warga.nik)
    .sort((a, b) => b.tanggalAjuan.localeCompare(a.tanggalAjuan));

  const tagihan = allTagihan
    .filter((t) => t.wargaId === warga.id)
    .sort((a, b) => b.periode.localeCompare(a.periode));

  const pengumumanTerbaru = allPengumuman
    .filter((p) => p.published)
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal))
    .slice(0, 3);

  const pengajuanAktif = pengajuanSaya.filter(
    (p) => p.status !== "selesai" && p.status !== "ditolak",
  ).length;

  const tagihanBelumBayar = tagihan.filter((t) => t.status === "belum-bayar").length;

  const riwayatPembayaran = tagihan
    .filter((t) => t.status === "lunas" || t.status === "menunggu-konfirmasi" || t.status === "ditolak")
    .slice(0, 8);

  return {
    warga,
    stats: {
      pengajuanAktif,
      pengajuanTotal: pengajuanSaya.length,
      tagihanBelumBayar,
      artikelForum,
    },
    pengajuanTerbaru: pengajuanSaya.slice(0, 5),
    tagihan: tagihan.slice(0, 5),
    riwayatPembayaran,
    pengumumanTerbaru,
  };
}
