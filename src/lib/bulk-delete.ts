import { prisma } from "@/lib/db";
import { readJson, writeJson } from "@/lib/storage";
import type {
  PengajuanSurat,
  Pengumuman,
  SuratKeluar,
  SuratMasuk,
  TagihanIuran,
  TiketSupport,
  TransaksiKas,
  Warga,
} from "@/lib/types";

export const BULK_RESOURCES = [
  "warga",
  "surat-masuk",
  "surat-keluar",
  "pengajuan",
  "iuran",
  "kas",
  "pengumuman",
  "support",
  "polling",
] as const;

export type BulkResource = (typeof BULK_RESOURCES)[number];

export function isBulkResource(value: string): value is BulkResource {
  return (BULK_RESOURCES as readonly string[]).includes(value);
}

export function parseBulkIds(ids: unknown): string[] {
  if (!Array.isArray(ids)) return [];
  return [...new Set(ids.filter((id): id is string => typeof id === "string" && id.length > 0))];
}

async function filterJsonFile<T extends { id: string }>(
  filename: Parameters<typeof readJson>[0],
  ids: string[],
): Promise<number> {
  const items = await readJson<T[]>(filename, [] as T[]);
  const idSet = new Set(ids);
  const before = items.length;
  const remaining = items.filter((item) => !idSet.has(item.id));
  await writeJson(filename, remaining);
  return before - remaining.length;
}

export async function bulkDeleteRecords(
  resource: BulkResource,
  ids: string[],
): Promise<{ deleted: number }> {
  switch (resource) {
    case "warga": {
      const warga = await readJson<Warga[]>("warga.json", []);
      const idSet = new Set(ids);
      const toDelete = warga.filter((w) => idSet.has(w.id));
      const userIds = toDelete.map((w) => w.userId).filter(Boolean) as string[];
      if (userIds.length > 0) {
        await prisma.user.deleteMany({ where: { id: { in: userIds } } });
      }
      const remaining = warga.filter((w) => !idSet.has(w.id));
      await writeJson("warga.json", remaining);
      return { deleted: toDelete.length };
    }
    case "surat-masuk":
      return { deleted: await filterJsonFile<SuratMasuk>("surat-masuk.json", ids) };
    case "surat-keluar":
      return { deleted: await filterJsonFile<SuratKeluar>("surat-keluar.json", ids) };
    case "pengajuan":
      return { deleted: await filterJsonFile<PengajuanSurat>("pengajuan.json", ids) };
    case "iuran":
      return { deleted: await filterJsonFile<TagihanIuran>("iuran.json", ids) };
    case "kas":
      return { deleted: await filterJsonFile<TransaksiKas>("kas.json", ids) };
    case "pengumuman":
      return { deleted: await filterJsonFile<Pengumuman>("pengumuman.json", ids) };
    case "support":
      return { deleted: await filterJsonFile<TiketSupport>("support.json", ids) };
    case "polling": {
      const result = await prisma.polling.deleteMany({ where: { id: { in: ids } } });
      return { deleted: result.count };
    }
    default:
      return { deleted: 0 };
  }
}
