import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { WargaDashboard } from "@/components/warga/WargaDashboard";
import { getWargaDashboardData } from "@/lib/warga-dashboard";

export const metadata: Metadata = {
  title: "Akun Saya",
  description: "Dashboard warga SuratRT — pengajuan, iuran, dan layanan RT.",
};

export default async function AkunPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/akun");
  }
  if (session.user.role !== "warga") {
    redirect("/admin");
  }

  const data = await getWargaDashboardData(session.user.id, session.user.wargaId);
  if (!data) {
    redirect("/login?callbackUrl=/akun");
  }

  return <WargaDashboard data={data} userName={session.user.name} />;
}
