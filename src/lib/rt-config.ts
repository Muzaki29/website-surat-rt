import { prisma } from "@/lib/db";
import { RT_INFO } from "@/lib/constants";

export interface RtConfigData {
  slug: string;
  nama: string;
  telepon?: string;
  email?: string;
}

export async function getRtConfig(): Promise<RtConfigData> {
  const slug = process.env.RT_SLUG ?? "rt005";
  const row = await prisma.rtConfig.findFirst({
    where: { OR: [{ id: "default" }, { slug }] },
  });

  if (!row) {
    return { slug, nama: RT_INFO.nama, telepon: RT_INFO.telepon, email: RT_INFO.email };
  }

  let extra: Record<string, string> = {};
  try {
    extra = JSON.parse(row.configJson) as Record<string, string>;
  } catch {
    extra = {};
  }

  return {
    slug: row.slug,
    nama: row.nama,
    telepon: extra.telepon ?? RT_INFO.telepon,
    email: extra.email ?? RT_INFO.email,
  };
}
