"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserPlus } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { RT_INFO } from "@/lib/constants";
import { parseJsonResponse } from "@/lib/parse-response";

export function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    nama: "",
    nik: "",
    alamat: `${RT_INFO.kampung}, ${RT_INFO.rw}`,
    noHp: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const { data } = await parseJsonResponse<{ error?: string; message?: string }>(res);

    setLoading(false);

    if (!res.ok) {
      setError(data?.error ?? "Pendaftaran gagal. Periksa koneksi atau coba lagi.");
      return;
    }

    setSuccess(data?.message ?? "Pendaftaran berhasil.");
    setTimeout(() => router.push("/login"), 2500);
  }

  return (
    <>
      <Header />

      <main className="flex flex-1 justify-center bg-[var(--color-background)] px-4 py-12">
        <div className="w-full max-w-lg">
          <Link
            href="/"
            className="mb-6 inline-flex cursor-pointer items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Beranda
          </Link>

          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-sm">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
              <UserPlus className="h-6 w-6" strokeWidth={1.75} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Daftar Warga RT</h1>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">
              Registrasi mandiri untuk {RT_INFO.nama}, {RT_INFO.kampung}. Setelah diverifikasi
              pengurus RT, Anda bisa masuk forum diskusi warga.
            </p>

            {success ? (
              <div className="mt-8 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
                {success}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                <Input
                  label="Nama Lengkap"
                  required
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                />
                <Input
                  label="NIK (16 digit)"
                  required
                  inputMode="numeric"
                  maxLength={16}
                  value={form.nik}
                  onChange={(e) => setForm({ ...form, nik: e.target.value.replace(/\D/g, "") })}
                  placeholder="3201xxxxxxxxxxxx"
                />
                <Input
                  label="Nomor Telepon / WhatsApp"
                  required
                  type="tel"
                  value={form.noHp}
                  onChange={(e) => setForm({ ...form, noHp: e.target.value })}
                  placeholder="08xxxxxxxxxx"
                />
                <Textarea
                  label="Alamat Lengkap"
                  required
                  rows={2}
                  value={form.alamat}
                  onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                />
                <Input
                  label="Email (opsional)"
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Kosongkan = NIK@warga.suratrt.local"
                />
                <Input
                  label="Kata Sandi"
                  type="password"
                  required
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <Input
                  label="Konfirmasi Kata Sandi"
                  type="password"
                  required
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                />

                {error && (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                    {error}
                  </p>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Mendaftar..." : "Daftar Sekarang"}
                </Button>
              </form>
            )}

            <p className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
              Sudah punya akun?{" "}
              <Link href="/login" className="font-semibold text-[var(--color-primary)] hover:underline">
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
