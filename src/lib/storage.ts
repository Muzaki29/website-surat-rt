import fs from "fs/promises";
import path from "path";
import { prisma } from "@/lib/db";
import type {
  BerkasPengajuan,
  PengajuanSurat,
  Pengumuman,
  SuratKeluar,
  SuratMasuk,
  TagihanIuran,
  TiketSupport,
  TransaksiKas,
  Warga,
} from "@/lib/types";

const LEGACY_DIR = path.join(process.cwd(), "data", "db");

type Counter = { keluar: number; masuk: number };

async function readLegacyJson<T>(filename: string): Promise<T | null> {
  try {
    const content = await fs.readFile(path.join(LEGACY_DIR, filename), "utf-8");
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}

function mapWarga(rows: Awaited<ReturnType<typeof prisma.warga.findMany>>): Warga[] {
  return rows.map((r) => ({
    id: r.id,
    nama: r.nama,
    nik: r.nik,
    noKk: r.noKk ?? "",
    alamat: r.alamat,
    noHp: r.noHp,
    status: r.status as Warga["status"],
    tanggalMasuk: r.tanggalMasuk,
    userId: r.userId ?? undefined,
  }));
}

function mapSuratMasuk(rows: Awaited<ReturnType<typeof prisma.suratMasuk.findMany>>): SuratMasuk[] {
  return rows.map((r) => ({
    id: r.id,
    nomorAgenda: r.nomorAgenda,
    tanggalTerima: r.tanggalTerima,
    pengirim: r.pengirim,
    perihal: r.perihal,
    status: r.status as SuratMasuk["status"],
  }));
}

function mapSuratKeluar(rows: Awaited<ReturnType<typeof prisma.suratKeluar.findMany>>): SuratKeluar[] {
  return rows.map((r) => ({
    id: r.id,
    nomorSurat: r.nomorSurat,
    tanggalSurat: r.tanggalSurat,
    tujuan: r.tujuan,
    perihal: r.perihal,
    status: r.status as SuratKeluar["status"],
  }));
}

function parseTimelineJson(json: string | null | undefined): PengajuanSurat["timeline"] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json) as PengajuanSurat["timeline"];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function mapPengajuan(rows: Awaited<ReturnType<typeof prisma.pengajuanSurat.findMany>>): PengajuanSurat[] {
  return rows.map((r) => ({
    id: r.id,
    jenisSurat: r.jenisSurat as PengajuanSurat["jenisSurat"],
    namaPemohon: r.namaPemohon,
    nik: r.nik,
    alamat: r.alamat,
    keperluan: r.keperluan,
    tanggalAjuan: r.tanggalAjuan,
    status: r.status as PengajuanSurat["status"],
    berkas: parseBerkasJson(r.berkasJson),
    catatanInternal: r.catatanInternal || undefined,
    penugasanKe: r.penugasanKe || undefined,
    dokumenDiminta: r.dokumenDiminta || undefined,
    estimasiSelesai: r.estimasiSelesai ?? undefined,
    nomorSuratKeluar: r.nomorSuratKeluar ?? undefined,
    timeline: parseTimelineJson(r.timelineJson),
  }));
}

function parseBerkasJson(json: string | null | undefined): BerkasPengajuan[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json) as BerkasPengajuan[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function serializeBerkas(berkas?: BerkasPengajuan[]): string {
  return JSON.stringify(berkas ?? []);
}

function mapTagihan(rows: Awaited<ReturnType<typeof prisma.tagihanIuran.findMany>>): TagihanIuran[] {
  return rows.map((r) => ({
    id: r.id,
    wargaId: r.wargaId,
    wargaNama: r.wargaNama,
    jenisIuran: r.jenisIuran,
    periode: r.periode,
    nominal: r.nominal,
    status: r.status as TagihanIuran["status"],
    tanggalBayar: r.tanggalBayar ?? undefined,
    metodePembayaran: (r.metodePembayaran as TagihanIuran["metodePembayaran"]) ?? undefined,
    kodeReferensi: r.kodeReferensi ?? undefined,
    catatanPembayaran: r.catatanPembayaran ?? undefined,
    tanggalAjuanBayar: r.tanggalAjuanBayar ?? undefined,
  }));
}

function mapKas(rows: Awaited<ReturnType<typeof prisma.transaksiKas.findMany>>): TransaksiKas[] {
  return rows.map((r) => ({
    id: r.id,
    tanggal: r.tanggal,
    jenis: r.jenis as TransaksiKas["jenis"],
    kategori: r.kategori,
    keterangan: r.keterangan,
    nominal: r.nominal,
  }));
}

function mapPengumuman(rows: Awaited<ReturnType<typeof prisma.pengumuman.findMany>>): Pengumuman[] {
  return rows.map((r) => ({
    id: r.id,
    judul: r.judul,
    isi: r.isi,
    tanggal: r.tanggal,
    penulis: r.penulis,
    published: r.published,
  }));
}

function mapTiket(rows: Awaited<ReturnType<typeof prisma.tiketSupport.findMany>>): TiketSupport[] {
  return rows.map((r) => ({
    id: r.id,
    nama: r.nama,
    kontak: r.kontak,
    topik: r.topik,
    pesan: r.pesan,
    tanggal: r.tanggal,
    status: r.status as TiketSupport["status"],
    balasan: r.balasan ?? undefined,
    tanggalBalasan: r.tanggalBalasan ?? undefined,
  }));
}

async function readCounter(): Promise<Counter> {
  const row = await prisma.suratCounter.findUnique({ where: { id: "singleton" } });
  return row ? { keluar: row.keluar, masuk: row.masuk } : { keluar: 0, masuk: 0 };
}

async function writeCounter(data: Counter): Promise<void> {
  await prisma.suratCounter.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", keluar: data.keluar, masuk: data.masuk },
    update: { keluar: data.keluar, masuk: data.masuk },
  });
}

export async function readJson<T>(filename: string, defaultValue: T): Promise<T> {
  switch (filename) {
    case "warga.json":
      return mapWarga(await prisma.warga.findMany({ orderBy: { nama: "asc" } })) as T;
    case "surat-masuk.json":
      return mapSuratMasuk(
        await prisma.suratMasuk.findMany({ orderBy: { tanggalTerima: "desc" } }),
      ) as T;
    case "surat-keluar.json":
      return mapSuratKeluar(
        await prisma.suratKeluar.findMany({ orderBy: { tanggalSurat: "desc" } }),
      ) as T;
    case "pengajuan.json":
      return mapPengajuan(
        await prisma.pengajuanSurat.findMany({ orderBy: { tanggalAjuan: "desc" } }),
      ) as T;
    case "iuran.json":
      return mapTagihan(await prisma.tagihanIuran.findMany()) as T;
    case "kas.json":
      return mapKas(await prisma.transaksiKas.findMany({ orderBy: { tanggal: "desc" } })) as T;
    case "pengumuman.json":
      return mapPengumuman(await prisma.pengumuman.findMany({ orderBy: { tanggal: "desc" } })) as T;
    case "support.json":
      return mapTiket(await prisma.tiketSupport.findMany({ orderBy: { tanggal: "desc" } })) as T;
    case "counter.json":
      return (await readCounter()) as T;
    default:
      return defaultValue;
  }
}

export async function writeJson<T>(filename: string, data: T): Promise<void> {
  switch (filename) {
    case "warga.json": {
      const items = data as Warga[];
      await prisma.$transaction([
        prisma.warga.deleteMany(),
        prisma.warga.createMany({
          data: items.map((w) => ({
            id: w.id,
            nama: w.nama,
            nik: w.nik,
            noKk: w.noKk ?? "",
            alamat: w.alamat,
            noHp: w.noHp,
            status: w.status,
            tanggalMasuk: w.tanggalMasuk,
            userId: w.userId ?? null,
          })),
        }),
      ]);
      break;
    }
    case "surat-masuk.json": {
      const items = data as SuratMasuk[];
      await prisma.$transaction([
        prisma.suratMasuk.deleteMany(),
        prisma.suratMasuk.createMany({
          data: items.map((s) => ({
            id: s.id,
            nomorAgenda: s.nomorAgenda,
            tanggalTerima: s.tanggalTerima,
            pengirim: s.pengirim,
            perihal: s.perihal,
            status: s.status,
          })),
        }),
      ]);
      break;
    }
    case "surat-keluar.json": {
      const items = data as SuratKeluar[];
      await prisma.$transaction([
        prisma.suratKeluar.deleteMany(),
        prisma.suratKeluar.createMany({
          data: items.map((s) => ({
            id: s.id,
            nomorSurat: s.nomorSurat,
            tanggalSurat: s.tanggalSurat,
            tujuan: s.tujuan,
            perihal: s.perihal,
            status: s.status,
          })),
        }),
      ]);
      break;
    }
    case "pengajuan.json": {
      const items = data as PengajuanSurat[];
      await prisma.$transaction([
        prisma.pengajuanSurat.deleteMany(),
        prisma.pengajuanSurat.createMany({
          data: items.map((p) => ({
            id: p.id,
            jenisSurat: p.jenisSurat,
            namaPemohon: p.namaPemohon,
            nik: p.nik,
            alamat: p.alamat,
            keperluan: p.keperluan,
            tanggalAjuan: p.tanggalAjuan,
            status: p.status,
            berkasJson: serializeBerkas(p.berkas),
            catatanInternal: p.catatanInternal ?? "",
            penugasanKe: p.penugasanKe ?? "",
            dokumenDiminta: p.dokumenDiminta ?? "",
            estimasiSelesai: p.estimasiSelesai ?? null,
            nomorSuratKeluar: p.nomorSuratKeluar ?? null,
            timelineJson: JSON.stringify(p.timeline ?? []),
          })),
        }),
      ]);
      break;
    }
    case "iuran.json": {
      const items = data as TagihanIuran[];
      await prisma.$transaction([
        prisma.tagihanIuran.deleteMany(),
        prisma.tagihanIuran.createMany({
          data: items.map((t) => ({
            id: t.id,
            wargaId: t.wargaId,
            wargaNama: t.wargaNama,
            jenisIuran: t.jenisIuran,
            periode: t.periode,
            nominal: t.nominal,
            status: t.status,
            tanggalBayar: t.tanggalBayar ?? null,
            metodePembayaran: t.metodePembayaran ?? null,
            kodeReferensi: t.kodeReferensi ?? null,
            catatanPembayaran: t.catatanPembayaran ?? null,
            tanggalAjuanBayar: t.tanggalAjuanBayar ?? null,
          })),
        }),
      ]);
      break;
    }
    case "kas.json": {
      const items = data as TransaksiKas[];
      await prisma.$transaction([
        prisma.transaksiKas.deleteMany(),
        prisma.transaksiKas.createMany({
          data: items.map((k) => ({
            id: k.id,
            tanggal: k.tanggal,
            jenis: k.jenis,
            kategori: k.kategori,
            keterangan: k.keterangan,
            nominal: k.nominal,
          })),
        }),
      ]);
      break;
    }
    case "pengumuman.json": {
      const items = data as Pengumuman[];
      await prisma.$transaction([
        prisma.pengumuman.deleteMany(),
        prisma.pengumuman.createMany({
          data: items.map((p) => ({
            id: p.id,
            judul: p.judul,
            isi: p.isi,
            tanggal: p.tanggal,
            penulis: p.penulis,
            published: p.published,
          })),
        }),
      ]);
      break;
    }
    case "support.json": {
      const items = data as TiketSupport[];
      await prisma.$transaction([
        prisma.tiketSupport.deleteMany(),
        prisma.tiketSupport.createMany({
          data: items.map((t) => ({
            id: t.id,
            nama: t.nama,
            kontak: t.kontak,
            topik: t.topik,
            pesan: t.pesan,
            tanggal: t.tanggal,
            status: t.status,
            balasan: t.balasan ?? null,
            tanggalBalasan: t.tanggalBalasan ?? null,
          })),
        }),
      ]);
      break;
    }
    case "counter.json":
      await writeCounter(data as Counter);
      break;
  }
}

/** Import legacy JSON files into Prisma (run once on seed). */
export async function importLegacyJsonIfEmpty(): Promise<void> {
  const wargaCount = await prisma.warga.count();
  if (wargaCount > 0) return;

  const files: { name: string; key: Parameters<typeof writeJson>[0] }[] = [
    { name: "warga.json", key: "warga.json" },
    { name: "surat-masuk.json", key: "surat-masuk.json" },
    { name: "surat-keluar.json", key: "surat-keluar.json" },
    { name: "pengajuan.json", key: "pengajuan.json" },
    { name: "iuran.json", key: "iuran.json" },
    { name: "kas.json", key: "kas.json" },
    { name: "pengumuman.json", key: "pengumuman.json" },
    { name: "support.json", key: "support.json" },
    { name: "counter.json", key: "counter.json" },
  ];

  for (const file of files) {
    const legacy = await readLegacyJson<unknown[] | Counter>(file.name);
    if (legacy && (Array.isArray(legacy) ? legacy.length > 0 : true)) {
      await writeJson(file.key, legacy);
    }
  }
}
