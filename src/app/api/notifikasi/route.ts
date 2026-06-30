import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-api";
import {
  countUnreadNotifikasi,
  listNotifikasi,
  markAllNotifikasiRead,
  markNotifikasiRead,
} from "@/lib/notifikasi";

export async function GET() {
  const auth = await requirePermission("notifikasi:read");
  if (auth.error) return auth.error;

  const [items, unread] = await Promise.all([listNotifikasi(40), countUnreadNotifikasi()]);
  return NextResponse.json({ items, unread });
}

export async function PATCH(request: Request) {
  const auth = await requirePermission("notifikasi:read");
  if (auth.error) return auth.error;

  const body = await request.json();

  if (body.action === "read-all") {
    await markAllNotifikasiRead();
    return NextResponse.json({ ok: true });
  }

  if (body.id) {
    await markNotifikasiRead(body.id as string);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 400 });
}
