import type { Metadata } from "next";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Daftar Warga",
  description: "Registrasi mandiri warga RT 005 RW 002 Kampung Makasar.",
};

export default function DaftarPage() {
  return <RegisterForm />;
}
