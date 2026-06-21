import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createId } from "@/lib/id";
import { readJson, writeJson } from "@/lib/storage";
import type { TagihanIuran, TransaksiKas } from "@/lib/types";

export async function POST(request: Request) {
  const body = await request.json();
  const orderId = body.order_id as string | undefined;
  const status = body.transaction_status as string | undefined;

  if (!orderId) {
    return NextResponse.json({ error: "order_id wajib" }, { status: 400 });
  }

  const log = await prisma.paymentLog.findUnique({ where: { orderId } });
  if (!log) {
    return NextResponse.json({ error: "Order tidak ditemukan" }, { status: 404 });
  }

  await prisma.paymentLog.update({
    where: { orderId },
    data: {
      status: status ?? "unknown",
      paymentType: body.payment_type ?? null,
      transactionId: body.transaction_id ?? null,
    },
  });

  if (status === "settlement" || status === "capture") {
    const tagihan = await readJson<TagihanIuran[]>("iuran.json", []);
    const index = tagihan.findIndex((t) => t.id === log.tagihanId);
    if (index !== -1 && tagihan[index].status === "belum-bayar") {
      tagihan[index] = {
        ...tagihan[index],
        status: "lunas",
        metodePembayaran: "transfer-bank",
        kodeReferensi: orderId,
        tanggalBayar: new Date().toISOString().slice(0, 10),
      };

      const kas = await readJson<TransaksiKas[]>("kas.json", []);
      kas.unshift({
        id: createId(),
        tanggal: new Date().toISOString().slice(0, 10),
        jenis: "pemasukan",
        kategori: "Iuran Warga (Midtrans)",
        keterangan: `${tagihan[index].jenisIuran} — ${tagihan[index].wargaNama} (${tagihan[index].periode})`,
        nominal: tagihan[index].nominal,
      });

      await writeJson("iuran.json", tagihan);
      await writeJson("kas.json", kas);
    }
  }

  return NextResponse.json({ ok: true });
}
