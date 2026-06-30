import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getWargaFromSession, requireWarga } from "@/lib/auth-api";

function isValidPhone(phone: string): boolean {
  return /^(\+62|62|0)\d{8,13}$/.test(phone.replace(/\s/g, ""));
}

export async function GET() {
  const auth = await requireWarga();
  if (auth.error) return auth.error;

  const warga = await getWargaFromSession(auth.session!);
  if (!warga) {
    return NextResponse.json({ error: "Data warga tidak ditemukan." }, { status: 404 });
  }

  const user = await prisma.user.findUnique({ where: { id: auth.session!.user.id } });
  if (!user) {
    return NextResponse.json({ error: "Akun tidak ditemukan." }, { status: 404 });
  }

  return NextResponse.json({
    nama: warga.nama,
    nik: warga.nik,
    noKk: warga.noKk,
    alamat: warga.alamat,
    noHp: warga.noHp,
    email: user.email,
    status: warga.status,
    tanggalMasuk: warga.tanggalMasuk,
  });
}

export async function PATCH(request: Request) {
  const auth = await requireWarga();
  if (auth.error) return auth.error;

  const warga = await getWargaFromSession(auth.session!);
  if (!warga) {
    return NextResponse.json({ error: "Data warga tidak ditemukan." }, { status: 404 });
  }

  const body = await request.json();
  const nama = (body.nama as string | undefined)?.trim();
  const alamat = (body.alamat as string | undefined)?.trim();
  const noHp = (body.noHp as string | undefined)?.replace(/\s/g, "");
  const email = (body.email as string | undefined)?.trim();

  if (!nama || !alamat || !noHp) {
    return NextResponse.json({ error: "Nama, alamat, dan telepon wajib diisi." }, { status: 400 });
  }

  if (!isValidPhone(noHp)) {
    return NextResponse.json({ error: "Nomor telepon tidak valid." }, { status: 400 });
  }

  if (email) {
    const existing = await prisma.user.findFirst({
      where: { email, NOT: { id: auth.session!.user.id } },
    });
    if (existing) {
      return NextResponse.json({ error: "Email sudah digunakan akun lain." }, { status: 409 });
    }
  }

  await prisma.$transaction([
    prisma.warga.update({
      where: { id: warga.id },
      data: { nama, alamat, noHp },
    }),
    prisma.user.update({
      where: { id: auth.session!.user.id },
      data: {
        name: nama,
        ...(email ? { email } : {}),
      },
    }),
  ]);

  return NextResponse.json({
    message: "Profil berhasil diperbarui.",
    nama,
    alamat,
    noHp,
    email: email ?? undefined,
  });
}
