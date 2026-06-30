import { auth } from "@/auth";
import { AdminRoleDashboard } from "@/components/admin/AdminRoleDashboard";
import { getDashboardStats } from "@/lib/stats";
import type { PeranPengguna } from "@/lib/types";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ akses?: string }>;
}) {
  const session = await auth();
  const role = (session?.user?.role ?? "admin") as PeranPengguna;
  const stats = await getDashboardStats();
  const params = await searchParams;

  return (
    <AdminRoleDashboard
      role={role}
      stats={stats}
      accessDenied={params.akses === "ditolak"}
    />
  );
}
