import { NextResponse } from "next/server";
import {
  countUnreadWargaNotifikasi,
  listWargaNotifikasi,
  markAllWargaNotifikasiRead,
  markWargaNotifikasiRead,
} from "@/lib/notifikasi";
import { requireWarga } from "@/lib/auth-api";

export async function GET() {
  const auth = await requireWarga();
  if (auth.error) return auth.error;

  const userId = auth.session!.user.id;
  const [items, unread] = await Promise.all([
    listWargaNotifikasi(userId, 40),
    countUnreadWargaNotifikasi(userId),
  ]);
  return NextResponse.json({ items, unread });
}

export async function PATCH(request: Request) {
  const auth = await requireWarga();
  if (auth.error) return auth.error;

  const body = await request.json();
  const userId = auth.session!.user.id;

  if (body.action === "read-all") {
    await markAllWargaNotifikasiRead(userId);
    return NextResponse.json({ ok: true });
  }

  if (body.id) {
    const ok = await markWargaNotifikasiRead(body.id as string, userId);
    if (!ok) {
      return NextResponse.json({ error: "Notifikasi tidak ditemukan." }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 400 });
}
