import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/auth-api";
import { logAudit } from "@/lib/audit-log";
import { readJson, writeJson } from "@/lib/storage";
import type { StatusWarga, Warga } from "@/lib/types";

type Props = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Props) {
  const auth = await requirePermission("warga:write");
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
    noKk: (body.noKk as string | undefined)?.replace(/\s/g, "") ?? warga[index].noKk,
    alamat: body.alamat ?? warga[index].alamat,
    noHp: body.noHp ?? warga[index].noHp,
    status,
  };

  await writeJson("warga.json", warga);

  await logAudit({
    userId: auth.session!.user.id,
    userName: auth.session!.user.name ?? "Pengurus",
    userRole: auth.session!.user.role,
    action: "update",
    resource: "warga",
    resourceId: id,
    detail: `Status: ${status}`,
  });

  return NextResponse.json(warga[index]);
}

export async function PATCH(request: Request, { params }: Props) {
  const auth = await requirePermission("warga:verify");
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

    await logAudit({
      userId: auth.session!.user.id,
      userName: auth.session!.user.name ?? "Pengurus",
      userRole: auth.session!.user.role,
      action: "verify",
      resource: "warga",
      resourceId: id,
      detail: warga[index].nama,
    });

    return NextResponse.json(warga[index]);
  }

  return NextResponse.json({ error: "Aksi tidak valid" }, { status: 400 });
}

export async function DELETE(_request: Request, { params }: Props) {
  const auth = await requirePermission("warga:write");
  if (auth.error) return auth.error;

  const { id } = await params;
  const warga = await readJson<Warga[]>("warga.json", []);
  const filtered = warga.filter((w) => w.id !== id);

  if (filtered.length === warga.length) {
    return NextResponse.json({ error: "Warga tidak ditemukan" }, { status: 404 });
  }

  await writeJson("warga.json", filtered);

  await logAudit({
    userId: auth.session!.user.id,
    userName: auth.session!.user.name ?? "Pengurus",
    userRole: auth.session!.user.role,
    action: "delete",
    resource: "warga",
    resourceId: id,
  });

  return NextResponse.json({ ok: true });
}
