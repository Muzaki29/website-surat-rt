import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import {
  hasPermission,
  isStaffRole,
  type Permission,
} from "@/lib/permissions";
import { NextResponse } from "next/server";
import type { PeranPengguna } from "@/lib/types";

export async function requireSession() {
  const session = await auth();
  if (!session?.user) {
    return { session: null, error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session, error: null };
}

export async function requireRole(roles: string[]) {
  const { session, error } = await requireSession();
  if (error) return { session: null, error };
  if (!roles.includes(session!.user.role)) {
    return {
      session: null,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return { session, error: null };
}

export async function requireStaff() {
  const { session, error } = await requireSession();
  if (error) return { session: null, error };
  if (!isStaffRole(session!.user.role)) {
    return {
      session: null,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return { session, error: null };
}

export async function requirePermission(permission: Permission) {
  const { session, error } = await requireSession();
  if (error) return { session: null, error };
  if (!hasPermission(session!.user.role as PeranPengguna, permission)) {
    return {
      session: null,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return { session, error: null };
}

export async function requireWarga() {
  const { session, error } = await requireSession();
  if (error) return { session: null, error };
  if (session!.user.role !== "warga" || !session.user.wargaId) {
    return {
      session: null,
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return { session, error: null };
}

export async function getWargaFromSession(session: { user: { wargaId?: string | null } }) {
  if (!session.user.wargaId) return null;
  return prisma.warga.findUnique({ where: { id: session.user.wargaId } });
}
