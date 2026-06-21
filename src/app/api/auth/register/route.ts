import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createId } from "@/lib/id";

function isValidNik(nik: string): boolean {
  return /^\d{16}$/.test(nik);
}

function isValidPhone(phone: string): boolean {
  return /^(\+62|62|0)\d{8,13}$/.test(phone.replace(/\s/g, ""));
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nama, nik, alamat, noHp, password, confirmPassword } = body;
    const email = (body.email as string | undefined)?.trim() || `${nik}@warga.suratrt.local`;

    if (!nama?.trim() || !nik || !alamat?.trim() || !noHp || !password) {
      return NextResponse.json({ error: "Semua field wajib diisi." }, { status: 400 });
    }

    if (!isValidNik(nik)) {
      return NextResponse.json({ error: "NIK harus 16 digit angka." }, { status: 400 });
    }

    if (!isValidPhone(noHp)) {
      return NextResponse.json({ error: "Nomor telepon tidak valid." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Kata sandi minimal 6 karakter." }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Konfirmasi kata sandi tidak cocok." }, { status: 400 });
    }

    const existingNik = await prisma.warga.findUnique({ where: { nik } });
    if (existingNik) {
      return NextResponse.json({ error: "NIK sudah terdaftar." }, { status: 409 });
    }

    const existingByEmail = await prisma.user.findUnique({ where: { email } });
    if (existingByEmail) {
      return NextResponse.json({ error: "Email sudah digunakan." }, { status: 409 });
    }

    const existingByNik = await prisma.user.findFirst({ where: { nik } });
    if (existingByNik) {
      return NextResponse.json({ error: "NIK sudah digunakan." }, { status: 409 });
    }

    const wargaId = createId();
    const userId = createId();
    const tanggal = new Date().toISOString().slice(0, 10);
    const hashed = await bcrypt.hash(password, 10);

    await prisma.$transaction([
      prisma.warga.create({
        data: {
          id: wargaId,
          nama: nama.trim(),
          nik,
          alamat: alamat.trim(),
          noHp: noHp.replace(/\s/g, ""),
          status: "menunggu-verifikasi",
          tanggalMasuk: tanggal,
          userId,
        },
      }),
      prisma.user.create({
        data: {
          id: userId,
          email,
          name: nama.trim(),
          nik,
          password: hashed,
          role: "warga",
          wargaId,
        },
      }),
    ]);

    return NextResponse.json(
      {
        message:
          "Pendaftaran berhasil. Akun menunggu verifikasi pengurus RT sebelum bisa masuk forum.",
        email,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[register]", error);
    const message =
      error instanceof Error && error.message.includes("Unknown argument")
        ? "Database belum sinkron. Jalankan: npm run db:setup lalu restart dev server."
        : "Terjadi kesalahan server. Coba lagi atau hubungi pengurus RT.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
