import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireWarga } from "@/lib/auth-api";

export async function PATCH(request: Request) {
  const auth = await requireWarga();
  if (auth.error) return auth.error;

  const body = await request.json();
  const currentPassword = body.currentPassword as string | undefined;
  const newPassword = body.newPassword as string | undefined;
  const confirmPassword = body.confirmPassword as string | undefined;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return NextResponse.json({ error: "Semua field kata sandi wajib diisi." }, { status: 400 });
  }

  if (newPassword.length < 8) {
    return NextResponse.json(
      { error: "Kata sandi baru minimal 8 karakter." },
      { status: 400 },
    );
  }

  if (newPassword !== confirmPassword) {
    return NextResponse.json({ error: "Konfirmasi kata sandi tidak cocok." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: auth.session!.user.id } });
  if (!user) {
    return NextResponse.json({ error: "Akun tidak ditemukan." }, { status: 404 });
  }

  const valid = await bcrypt.compare(currentPassword, user.password);
  if (!valid) {
    return NextResponse.json({ error: "Kata sandi saat ini salah." }, { status: 403 });
  }

  const sameAsOld = await bcrypt.compare(newPassword, user.password);
  if (sameAsOld) {
    return NextResponse.json(
      { error: "Kata sandi baru harus berbeda dari kata sandi saat ini." },
      { status: 400 },
    );
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { password: await bcrypt.hash(newPassword, 12) },
  });

  return NextResponse.json({ message: "Kata sandi berhasil diubah." });
}
