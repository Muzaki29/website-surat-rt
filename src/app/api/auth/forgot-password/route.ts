import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createId } from "@/lib/id";
import { passwordResetEmailHtml, sendEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";
import { isDebugResetEnabled } from "@/lib/security";

export async function POST(request: Request) {
  const body = await request.json();
  const identifier = (body.identifier as string | undefined)?.trim();
  if (!identifier) {
    return NextResponse.json({ error: "Email atau NIK wajib diisi." }, { status: 400 });
  }

  const rl = await checkRateLimit(`forgot:${identifier}`);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Terlalu banyak percobaan. Coba lagi dalam ${rl.retryAfterSec} detik.` },
      { status: 429 },
    );
  }

  const user = await prisma.user.findFirst({
    where: { OR: [{ email: identifier }, { nik: identifier }] },
  });

  // Jangan bocorkan apakah akun ada
  if (!user || user.active === false) {
    return NextResponse.json({
      message: "Jika akun terdaftar, instruksi reset telah dikirim ke email.",
    });
  }

  const token = createId() + createId();
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

  await prisma.passwordResetToken.create({
    data: { id: createId(), userId: user.id, token, expiresAt, used: false },
  });

  const baseUrl = process.env.AUTH_URL ?? "http://localhost:3000";
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;

  const emailResult = await sendEmail({
    to: user.email,
    subject: "Reset Kata Sandi — SuratRT",
    text: `Reset kata sandi: ${resetUrl}`,
    html: passwordResetEmailHtml(user.name, resetUrl),
  });

  if (!emailResult.sent && process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Layanan email belum dikonfigurasi. Hubungi pengurus RT." },
      { status: 503 },
    );
  }

  const devHint = isDebugResetEnabled() ? { devResetUrl: resetUrl } : {};

  return NextResponse.json({
    message: "Jika akun terdaftar, instruksi reset telah dikirim ke email.",
    ...devHint,
  });
}
