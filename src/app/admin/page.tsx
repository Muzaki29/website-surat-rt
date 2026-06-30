import { auth } from "@/auth";
import { AdminRoleDashboard } from "@/components/admin/AdminRoleDashboard";
import { getKetuaKpi } from "@/lib/ketua-kpi";
import { getDashboardStats } from "@/lib/stats";
import type { PeranPengguna } from "@/lib/types";

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ akses?: string }>;
}) {
  const session = await auth();
  const role = (session?.user?.role ?? "admin") as PeranPengguna;
  const [stats, kpi] = await Promise.all([getDashboardStats(), getKetuaKpi()]);
  const params = await searchParams;

  return (
    <AdminRoleDashboard
      role={role}
      stats={stats}
      kpi={kpi}
      accessDenied={params.akses === "ditolak"}
    />
  );
}
