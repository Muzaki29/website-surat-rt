import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth-api";
import { readJson, writeJson } from "@/lib/storage";
import type { StatusWarga, Warga } from "@/lib/types";

type Props = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Props) {
  const auth = await requireSession();
  if (auth.error) return auth.error;

  const { id } = await params;
  const body = await request.json();
  const warga = await readJson<Warga[]>("warga.json", []);
  const index = warga.findIndex((w) => w.id === id);

  if (index === -1) {
    return NextResponse.json({ error: "Warga tidak ditemukan" }, { status: 404 });
  }

  const validStatus: StatusWarga[] = ["aktif", "nonaktif", "menunggu-verifikasi"];
  const status = validStatus.includes(body.status) ? body.status : warga[index].status;

  warga[index] = {
    ...warga[index],
    nama: body.nama ?? warga[index].nama,
    nik: body.nik ?? warga[index].nik,
    alamat: body.alamat ?? warga[index].alamat,
    noHp: body.noHp ?? warga[index].noHp,
    status,
  };

  await writeJson("warga.json", warga);
  return NextResponse.json(warga[index]);
}

export async function PATCH(request: Request, { params }: Props) {
  const auth = await requireSession();
  if (auth.error) return auth.error;

  const { id } = await params;
  const body = await request.json();

  if (body.action === "verifikasi") {
    const warga = await readJson<Warga[]>("warga.json", []);
    const index = warga.findIndex((w) => w.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "Warga tidak ditemukan" }, { status: 404 });
    }

    warga[index].status = "aktif";
    await writeJson("warga.json", warga);
    return NextResponse.json(warga[index]);
  }

  return NextResponse.json({ error: "Aksi tidak valid" }, { status: 400 });
}

export async function DELETE(_request: Request, { params }: Props) {
  const auth = await requireSession();
  if (auth.error) return auth.error;

  const { id } = await params;
  const warga = await readJson<Warga[]>("warga.json", []);
  const filtered = warga.filter((w) => w.id !== id);

  if (filtered.length === warga.length) {
    return NextResponse.json({ error: "Warga tidak ditemukan" }, { status: 404 });
  }

  await writeJson("warga.json", filtered);
  return NextResponse.json({ ok: true });
}
