"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function ForgotPasswordForm() {
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data.error ?? "Gagal memproses permintaan.");
      return;
    }
    setMessage(data.message);
    if (data.devResetUrl) {
      setMessage(`${data.message} (Dev: ${data.devResetUrl})`);
    }
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-[var(--color-background)]">
        <div className="mx-auto max-w-md px-4 py-12">
          <Link href="/login" className="inline-flex items-center gap-1 text-sm text-[var(--color-text-muted)]">
            <ArrowLeft className="h-4 w-4" /> Kembali ke login
          </Link>
          <h1 className="mt-4 text-2xl font-bold">Lupa Kata Sandi</h1>
          <p className="mt-2 text-sm text-[var(--color-text-muted)]">
            Masukkan email atau NIK terdaftar. Kami kirim link reset ke email Anda.
          </p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input
              label="Email atau NIK"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            {message && <p className="text-sm text-emerald-700">{message}</p>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Memproses..." : "Kirim Link Reset"}
            </Button>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
