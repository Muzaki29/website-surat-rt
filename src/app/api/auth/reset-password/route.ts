import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { validatePassword } from "@/lib/security";

export async function POST(request: Request) {
  const body = await request.json();
  const token = body.token as string | undefined;
  const newPassword = body.newPassword as string | undefined;
  const confirmPassword = body.confirmPassword as string | undefined;

  if (!token || !newPassword || !confirmPassword) {
    return NextResponse.json({ error: "Data tidak lengkap." }, { status: 400 });
  }

  const rl = await checkRateLimit(`reset:${token.slice(0, 16)}`);
  if (!rl.allowed) {
    return NextResponse.json({ error: "Terlalu banyak percobaan." }, { status: 429 });
  }

  if (newPassword.length < 8) {
    return NextResponse.json({ error: "Kata sandi minimal 8 karakter." }, { status: 400 });
  }

  const pwCheck = validatePassword(newPassword);
  if (!pwCheck.valid) {
    return NextResponse.json({ error: pwCheck.error }, { status: 400 });
  }

  if (newPassword !== confirmPassword) {
    return NextResponse.json({ error: "Konfirmasi kata sandi tidak cocok." }, { status: 400 });
  }

  const row = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!row || row.used) {
    return NextResponse.json({ error: "Token tidak valid." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: row.userId } });
  if (!user || user.active === false) {
    return NextResponse.json({ error: "Token tidak valid." }, { status: 400 });
  }

  if (new Date(row.expiresAt).getTime() < Date.now()) {
    return NextResponse.json({ error: "Token sudah kedaluwarsa." }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: row.userId },
      data: {
        password: await bcrypt.hash(newPassword, 12),
        tokenVersion: { increment: 1 },
      },
    }),
    prisma.passwordResetToken.update({
      where: { id: row.id },
      data: { used: true },
    }),
  ]);

  return NextResponse.json({ message: "Kata sandi berhasil diubah. Silakan login." });
}
