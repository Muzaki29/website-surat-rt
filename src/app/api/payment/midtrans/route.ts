import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getWargaFromSession, requireWarga } from "@/lib/auth-api";
import { buildOrderId, createSnapToken, isMidtransEnabled } from "@/lib/midtrans";
import { createId } from "@/lib/id";
import { readJson } from "@/lib/storage";
import type { TagihanIuran } from "@/lib/types";

export async function POST(request: Request) {
  if (!isMidtransEnabled()) {
    return NextResponse.json(
      { error: "Midtrans belum dikonfigurasi. Set MIDTRANS_SERVER_KEY di .env" },
      { status: 503 },
    );
  }

  const auth = await requireWarga();
  if (auth.error) return auth.error;

  const warga = await getWargaFromSession(auth.session!);
  if (!warga) {
    return NextResponse.json({ error: "Data warga tidak ditemukan" }, { status: 404 });
  }

  const body = await request.json();
  const tagihan = await readJson<TagihanIuran[]>("iuran.json", []);
  const index = tagihan.findIndex((t) => t.id === body.tagihanId);

  if (index === -1) {
    return NextResponse.json({ error: "Tagihan tidak ditemukan" }, { status: 404 });
  }

  if (tagihan[index].wargaId !== warga.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (tagihan[index].status !== "belum-bayar") {
    return NextResponse.json({ error: "Tagihan tidak dapat dibayar" }, { status: 400 });
  }

  const orderId = buildOrderId(tagihan[index].id);
  const token = await createSnapToken({
    orderId,
    grossAmount: tagihan[index].nominal,
    customerName: tagihan[index].wargaNama,
    itemName: `${tagihan[index].jenisIuran} ${tagihan[index].periode}`,
  });

  if (!token) {
    return NextResponse.json({ error: "Gagal membuat token Midtrans" }, { status: 502 });
  }

  await prisma.paymentLog.create({
    data: {
      id: createId(),
      tagihanId: tagihan[index].id,
      orderId,
      grossAmount: tagihan[index].nominal,
      status: "pending",
      createdAt: new Date().toISOString(),
    },
  });

  return NextResponse.json({
    token,
    orderId,
    clientKey: process.env.MIDTRANS_CLIENT_KEY ?? "",
  });
}
