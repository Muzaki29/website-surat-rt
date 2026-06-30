import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/auth-api";
import { logAudit } from "@/lib/audit-log";
import { createId } from "@/lib/id";
import { STAFF_ROLES } from "@/lib/permissions";
import { validatePassword } from "@/lib/security";
import type { PeranPengguna } from "@/lib/types";

export async function GET() {
  const auth = await requirePermission("pengurus:manage");
  if (auth.error) return auth.error;

  const users = await prisma.user.findMany({
    where: { role: { in: [...STAFF_ROLES] } },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      active: true,
      createdAt: true,
    },
  });
  return NextResponse.json(users);
}

export async function POST(request: Request) {
  const auth = await requirePermission("pengurus:manage");
  if (auth.error) return auth.error;

  const body = await request.json();
  const { name, email, password, role } = body;

  if (!name?.trim() || !email?.trim() || !password || !role) {
    return NextResponse.json({ error: "Semua field wajib diisi." }, { status: 400 });
  }

  if (!(STAFF_ROLES as readonly string[]).includes(role)) {
    return NextResponse.json({ error: "Peran tidak valid." }, { status: 400 });
  }

  const pwCheck = validatePassword(password);
  if (!pwCheck.valid) {
    return NextResponse.json({ error: pwCheck.error }, { status: 400 });
  }

  const exists = await prisma.user.findUnique({ where: { email: email.trim() } });
  if (exists) {
    return NextResponse.json({ error: "Email sudah digunakan." }, { status: 409 });
  }

  const user = await prisma.user.create({
    data: {
      email: email.trim(),
      name: name.trim(),
      role,
      password: await bcrypt.hash(password, 12),
      active: true,
    },
    select: { id: true, email: true, name: true, role: true, active: true, createdAt: true },
  });

  await logAudit({
    userId: auth.session!.user.id,
    userName: auth.session!.user.name,
    userRole: auth.session!.user.role,
    action: "create",
    resource: "pengurus",
    resourceId: user.id,
    detail: `Buat akun ${role}: ${email}`,
  });

  return NextResponse.json(user, { status: 201 });
}

export async function PATCH(request: Request) {
  const auth = await requirePermission("pengurus:manage");
  if (auth.error) return auth.error;

  const body = await request.json();
  const user = await prisma.user.findUnique({ where: { id: body.id } });
  if (!user || user.role === "warga") {
    return NextResponse.json({ error: "Pengurus tidak ditemukan." }, { status: 404 });
  }

  if (body.id === auth.session!.user.id && body.active === false) {
    return NextResponse.json({ error: "Tidak dapat menonaktifkan akun sendiri." }, { status: 400 });
  }

  const data: { active?: boolean; role?: string; name?: string; tokenVersion?: { increment: number } } = {};
  if (typeof body.active === "boolean") {
    data.active = body.active;
    if (body.active === false) {
      data.tokenVersion = { increment: 1 };
    }
  }
  if (body.role && (STAFF_ROLES as readonly string[]).includes(body.role)) {
    data.role = body.role as PeranPengguna;
  }
  if (body.name?.trim()) data.name = body.name.trim();

  const updated = await prisma.user.update({
    where: { id: body.id },
    data,
    select: { id: true, email: true, name: true, role: true, active: true, createdAt: true },
  });

  await logAudit({
    userId: auth.session!.user.id,
    userName: auth.session!.user.name,
    userRole: auth.session!.user.role,
    action: "update",
    resource: "pengurus",
    resourceId: updated.id,
    detail: JSON.stringify(data),
  });

  return NextResponse.json(updated);
}
