import { prisma } from "@/lib/db";
import { createId } from "@/lib/id";
import { createWargaNotifikasi } from "@/lib/notifikasi";
import { formatRupiah } from "@/lib/format";
import { sendWhatsAppNotification } from "@/lib/notifications";
import { readJson } from "@/lib/storage";
import type { TagihanIuran, Warga } from "@/lib/types";

const REMINDER_AFTER_DAYS = Number(process.env.IURAN_REMINDER_DAYS ?? "7");

export async function sendIuranReminders(): Promise<{ sent: number }> {
  const tagihan = await readJson<TagihanIuran[]>("iuran.json", []);
  const warga = await readJson<Warga[]>("warga.json", []);
  const now = Date.now();
  let sent = 0;

  const belumBayar = tagihan.filter((t) => t.status === "belum-bayar");

  for (const t of belumBayar) {
    const w = warga.find((x) => x.id === t.wargaId);
    if (!w || w.status !== "aktif" || !w.userId) continue;

    const exists = await prisma.iuranReminderLog.findUnique({
      where: { tagihanId_wargaId: { tagihanId: t.id, wargaId: w.id } },
    });
    if (exists) continue;

    const issued = new Date(`${t.periode}-01`).getTime();
    const daysSince = (now - issued) / (1000 * 60 * 60 * 24);
    if (daysSince < REMINDER_AFTER_DAYS) continue;

    await createWargaNotifikasi({
      userId: w.userId,
      tipe: "sistem",
      judul: "Pengingat iuran RT",
      pesan: `Tagihan ${t.jenisIuran} periode ${t.periode} sebesar ${formatRupiah(t.nominal)} belum dibayar.`,
      href: "/pembayaran",
      level: "warning",
    });

    if (w.noHp) {
      await sendWhatsAppNotification({
        to: w.noHp,
        message: `Pengingat iuran RT: ${t.jenisIuran} ${t.periode} — ${formatRupiah(t.nominal)}. Bayar di portal RT.`,
      });
    }

    await prisma.iuranReminderLog.create({
      data: {
        id: createId(),
        tagihanId: t.id,
        wargaId: w.id,
        sentAt: new Date().toISOString(),
      },
    });
    sent++;
  }

  return { sent };
}
