import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { WargaProfileForm } from "@/components/warga/WargaProfileForm";

export const metadata: Metadata = {
  title: "Pengaturan Akun",
  description: "Ubah profil dan kata sandi akun warga SuratRT.",
};

export default async function AkunProfilPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/akun/profil");
  }
  if (session.user.role !== "warga") {
    redirect("/admin");
  }

  return <WargaProfileForm />;
}
