import type { PeranPengguna } from "@/lib/types";
import { ADMIN_NAV_GROUPS } from "@/lib/constants";

export const STAFF_ROLES = ["admin", "ketua-rt", "sekretaris-rt", "bendahara-rt"] as const;
export type StaffRole = (typeof STAFF_ROLES)[number];

export type Permission =
  | "dashboard:view"
  | "warga:read"
  | "warga:write"
  | "warga:verify"
  | "surat:read"
  | "surat:write"
  | "pengajuan:read"
  | "pengajuan:manage"
  | "arsip:read"
  | "arsip:write"
  | "pengumuman:read"
  | "pengumuman:write"
  | "polling:read"
  | "polling:write"
  | "iuran:read"
  | "iuran:manage"
  | "kas:read"
  | "kas:write"
  | "monitoring:view"
  | "analitik:view"
  | "support:read"
  | "support:manage"
  | "notifikasi:read"
  | "pengurus:manage"
  | "kalender:read"
  | "kalender:write"
  | "audit:read"
  | "laporan:read";

const ALL_PERMISSIONS: Permission[] = [
  "dashboard:view",
  "warga:read",
  "warga:write",
  "warga:verify",
  "surat:read",
  "surat:write",
  "pengajuan:read",
  "pengajuan:manage",
  "arsip:read",
  "arsip:write",
  "pengumuman:read",
  "pengumuman:write",
  "polling:read",
  "polling:write",
  "iuran:read",
  "iuran:manage",
  "kas:read",
  "kas:write",
  "monitoring:view",
  "analitik:view",
  "support:read",
  "support:manage",
  "notifikasi:read",
  "pengurus:manage",
  "kalender:read",
  "kalender:write",
  "audit:read",
  "laporan:read",
];

const ROLE_PERMISSIONS: Record<PeranPengguna, Permission[]> = {
  admin: ALL_PERMISSIONS,
  "ketua-rt": ALL_PERMISSIONS,
  "sekretaris-rt": [
    "dashboard:view",
    "warga:read",
    "warga:write",
    "warga:verify",
    "surat:read",
    "surat:write",
    "pengajuan:read",
    "pengajuan:manage",
    "arsip:read",
    "arsip:write",
    "pengumuman:read",
    "pengumuman:write",
    "polling:read",
    "polling:write",
    "monitoring:view",
    "support:read",
    "support:manage",
    "notifikasi:read",
    "kalender:read",
    "kalender:write",
  ],
  "bendahara-rt": [
    "dashboard:view",
    "warga:read",
    "iuran:read",
    "iuran:manage",
    "kas:read",
    "kas:write",
    "monitoring:view",
    "analitik:view",
    "support:read",
    "notifikasi:read",
    "laporan:read",
  ],
  warga: [],
};

export const ADMIN_PATH_PERMISSION: Record<string, Permission> = {
  "/admin": "dashboard:view",
  "/admin/warga": "warga:read",
  "/admin/surat-masuk": "surat:read",
  "/admin/surat-keluar": "surat:write",
  "/admin/pengajuan": "pengajuan:read",
  "/admin/arsip": "arsip:read",
  "/admin/pengumuman": "pengumuman:read",
  "/admin/polling": "polling:read",
  "/admin/iuran": "iuran:read",
  "/admin/kas": "kas:read",
  "/admin/monitoring": "monitoring:view",
  "/admin/analitik": "analitik:view",
  "/admin/support": "support:read",
  "/admin/pengurus": "pengurus:manage",
  "/admin/kalender": "kalender:read",
  "/admin/audit-log": "audit:read",
  "/admin/laporan": "laporan:read",
};

export const BULK_RESOURCE_PERMISSION: Record<string, Permission> = {
  warga: "warga:write",
  "surat-masuk": "surat:write",
  "surat-keluar": "surat:write",
  pengajuan: "pengajuan:manage",
  iuran: "iuran:manage",
  kas: "kas:write",
  pengumuman: "pengumuman:write",
  support: "support:manage",
  polling: "polling:write",
};

export function isStaffRole(role: string): role is StaffRole {
  return (STAFF_ROLES as readonly string[]).includes(role);
}

export function hasPermission(role: PeranPengguna | string, permission: Permission): boolean {
  const perms = ROLE_PERMISSIONS[role as PeranPengguna];
  if (!perms) return false;
  return perms.includes(permission);
}

export function canAccessAdminPath(role: PeranPengguna | string, pathname: string): boolean {
  if (pathname === "/admin" || pathname === "/admin/") {
    return hasPermission(role, "dashboard:view");
  }
  const base = Object.keys(ADMIN_PATH_PERMISSION)
    .filter((p) => p !== "/admin")
    .find((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (!base) return hasPermission(role, "dashboard:view");
  return hasPermission(role, ADMIN_PATH_PERMISSION[base]);
}

export function filterAdminNavGroups(role: PeranPengguna | string) {
  return ADMIN_NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => {
      const perm = ADMIN_PATH_PERMISSION[item.href];
      return perm ? hasPermission(role, perm) : true;
    }),
  })).filter((group) => group.items.length > 0);
}

export function getRoleDescription(role: PeranPengguna | string): string {
  switch (role) {
    case "ketua-rt":
      return "Akses penuh seluruh modul platform — pengawasan, keputusan, dan koordinasi pengurus.";
    case "admin":
      return "Administrator sistem dengan akses penuh ke seluruh fitur operasional RT.";
    case "sekretaris-rt":
      return "Penyuratan, data warga, pengajuan surat, pengumuman, polling, dan arsip dokumen.";
    case "bendahara-rt":
      return "Keuangan RT — iuran warga, kas, monitoring pembayaran, dan analitik keuangan.";
    default:
      return "Panel pengurus RT.";
  }
}
