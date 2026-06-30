import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-api";
import { createId } from "@/lib/id";
import { readJson, writeJson } from "@/lib/storage";
import type { TransaksiKas } from "@/lib/types";

export async function GET() {
  const auth = await requirePermission("kas:read");
  if (auth.error) return auth.error;

  const kas = await readJson<TransaksiKas[]>("kas.json", []);
  return NextResponse.json(kas);
}

export async function POST(request: Request) {
  const auth = await requirePermission("kas:write");
  if (auth.error) return auth.error;

  const body = await request.json();
  const kas = await readJson<TransaksiKas[]>("kas.json", []);

  const baru: TransaksiKas = {
    id: createId(),
    tanggal: body.tanggal ?? new Date().toISOString().slice(0, 10),
    jenis: body.jenis === "pengeluaran" ? "pengeluaran" : "pemasukan",
    kategori: body.kategori ?? "Lainnya",
    keterangan: body.keterangan ?? "",
    nominal: Number(body.nominal) || 0,
  };

  kas.unshift(baru);
  await writeJson("kas.json", kas);
  return NextResponse.json(baru, { status: 201 });
}

export async function DELETE(request: Request) {
  const auth = await requirePermission("kas:write");
  if (auth.error) return auth.error;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID wajib" }, { status: 400 });

  const kas = await readJson<TransaksiKas[]>("kas.json", []);
  const filtered = kas.filter((t) => t.id !== id);
  await writeJson("kas.json", filtered);
  return NextResponse.json({ ok: true });
}
