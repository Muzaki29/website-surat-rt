"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserPlus } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { TermsModal } from "@/components/auth/TermsModal";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { RT_INFO } from "@/lib/constants";
import { parseJsonResponse } from "@/lib/parse-response";

export function RegisterForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    nama: "",
    nik: "",
    noKk: "",
    alamat: `${RT_INFO.kampung}, ${RT_INFO.rw}`,
    noHp: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [termsOpen, setTermsOpen] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!agreedToTerms) {
      setError("Anda harus menyetujui Syarat & Ketentuan terlebih dahulu.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, agreedToTerms: true }),
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

  function handleAcceptTerms() {
    setAgreedToTerms(true);
    setTermsOpen(false);
    setError("");
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
                  label="Nomor Kartu Keluarga (KK)"
                  required
                  inputMode="numeric"
                  maxLength={16}
                  value={form.noKk}
                  onChange={(e) => setForm({ ...form, noKk: e.target.value.replace(/\D/g, "") })}
                  placeholder="16 digit nomor KK"
                />
                <p className="-mt-2 text-xs text-[var(--color-text-subtle)] sm:col-span-2">
                  Anggota keluarga dengan nomor KK yang sama akan terhubung di data admin RT.
                </p>
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

                <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3">
                  <label className="flex cursor-pointer items-start gap-3">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-[var(--color-border)] accent-[var(--color-accent)]"
                    />
                    <span className="text-sm leading-relaxed text-[var(--color-text-muted)]">
                      Saya telah membaca dan menyetujui{" "}
                      <button
                        type="button"
                        onClick={() => setTermsOpen(true)}
                        className="cursor-pointer font-semibold text-[var(--color-primary)] underline-offset-2 hover:underline"
                      >
                        Syarat & Ketentuan
                      </button>{" "}
                      pendaftaran warga {RT_INFO.nama}.
                    </span>
                  </label>
                </div>

                {error && (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                    {error}
                  </p>
                )}

                <Button type="submit" className="w-full" disabled={loading || !agreedToTerms}>
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

      <TermsModal
        open={termsOpen}
        onClose={() => setTermsOpen(false)}
        onAccept={handleAcceptTerms}
      />

      <Footer />
    </>
  );
}
