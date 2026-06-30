"use client";

import { useCallback, useState } from "react";
import { getSession, signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MathCaptcha, type CaptchaValue } from "@/components/auth/MathCaptcha";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState<CaptchaValue>({ token: "", answer: "" });
  const [captchaKey, setCaptchaKey] = useState(0);
  const [error, setError] = useState("");
  const [captchaError, setCaptchaError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCaptchaChange = useCallback((value: CaptchaValue) => {
    setCaptcha(value);
    setCaptchaError("");
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setCaptchaError("");

    if (!captcha.token || !captcha.answer.trim()) {
      setCaptchaError("Jawaban captcha wajib diisi.");
      setLoading(false);
      return;
    }

    const result = await signIn("credentials", {
      email: identifier.trim(),
      password,
      captchaToken: captcha.token,
      captchaAnswer: captcha.answer.trim(),
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      if (result.error.toLowerCase().includes("captcha")) {
        setCaptchaError("Captcha salah atau kedaluwarsa. Coba lagi.");
        setCaptchaKey((k) => k + 1);
      } else {
        setError(
          "Login gagal. Periksa NIK/email dan kata sandi. Warga baru harus menunggu verifikasi RT.",
        );
      }
      return;
    }

    const session = await getSession();
    if (callbackUrl) {
      router.push(callbackUrl);
    } else if (session?.user?.role === "warga") {
      router.push("/akun");
    } else {
      router.push("/admin");
    }
    router.refresh();
  }

  return (
    <>
      <Header />

      <main className="flex flex-1 items-center justify-center bg-[var(--color-background)] px-4 py-16">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="mb-6 inline-flex cursor-pointer items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Beranda
          </Link>

          <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 shadow-sm">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
              <Lock className="h-6 w-6" strokeWidth={1.75} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--color-text)]">Masuk</h1>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">
              Pengurus RT: gunakan email admin. Warga: gunakan NIK atau email pendaftaran.
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              <Input
                label="Email atau NIK"
                type="text"
                required
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="NIK 16 digit atau email"
              />
              <Input
                label="Kata Sandi"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />

              <MathCaptcha
                key={captchaKey}
                value={captcha}
                onChange={handleCaptchaChange}
                error={captchaError}
              />

              {error && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Memproses..." : "Masuk"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
              Belum punya akun?{" "}
              <Link href="/daftar" className="font-semibold text-[var(--color-primary)] hover:underline">
                Daftar warga
              </Link>
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
