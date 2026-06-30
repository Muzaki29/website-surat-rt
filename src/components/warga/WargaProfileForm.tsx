"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, KeyRound, Loader2, Save, User } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface ProfileData {
  nama: string;
  nik: string;
  noKk: string;
  alamat: string;
  noHp: string;
  email: string;
  status: string;
}

export function WargaProfileForm() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [form, setForm] = useState({ nama: "", alamat: "", noHp: "", email: "" });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/akun/profile");
    if (!res.ok) {
      setLoading(false);
      return;
    }
    const data = await res.json();
    setProfile(data);
    setForm({
      nama: data.nama,
      alamat: data.alamat,
      noHp: data.noHp,
      email: data.email,
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setProfileMsg(null);
    const res = await fetch("/api/akun/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setProfileMsg({ type: "err", text: data.error ?? "Gagal menyimpan profil." });
      return;
    }
    setProfileMsg({ type: "ok", text: data.message ?? "Profil diperbarui." });
    load();
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setChangingPassword(true);
    setPasswordMsg(null);
    const res = await fetch("/api/akun/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(passwordForm),
    });
    const data = await res.json();
    setChangingPassword(false);
    if (!res.ok) {
      setPasswordMsg({ type: "err", text: data.error ?? "Gagal mengubah kata sandi." });
      return;
    }
    setPasswordMsg({ type: "ok", text: data.message ?? "Kata sandi diubah." });
    setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-[var(--color-background)]">
        <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
            <Link
              href="/akun"
              className="inline-flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)]"
            >
              <ArrowLeft className="h-4 w-4" />
              Kembali ke dashboard
            </Link>
            <h1 className="mt-4 text-2xl font-bold tracking-tight">Pengaturan Akun</h1>
            <p className="mt-1 text-sm text-[var(--color-text-muted)]">
              Ubah profil dan kata sandi. NIK dan KK hanya dapat diubah melalui pengurus RT.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-2xl space-y-8 px-4 py-8 sm:px-6">
          {loading ? (
            <p className="flex items-center gap-2 text-sm text-[var(--color-text-muted)]">
              <Loader2 className="h-4 w-4 animate-spin" />
              Memuat profil...
            </p>
          ) : (
            <>
              <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
                <div className="mb-5 flex items-center gap-2">
                  <User className="h-5 w-5 text-[var(--color-accent)]" />
                  <h2 className="font-semibold">Profil</h2>
                </div>
                {profile && (
                  <div className="mb-5 grid gap-3 rounded-lg bg-[var(--color-surface-muted)] p-4 text-sm sm:grid-cols-2">
                    <div>
                      <p className="text-[var(--color-text-subtle)]">NIK</p>
                      <p className="font-mono text-xs">{profile.nik}</p>
                    </div>
                    <div>
                      <p className="text-[var(--color-text-subtle)]">Nomor KK</p>
                      <p className="font-mono text-xs">{profile.noKk || "—"}</p>
                    </div>
                  </div>
                )}
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <Input
                    label="Nama lengkap"
                    required
                    value={form.nama}
                    onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  />
                  <Input
                    label="Email login"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                  <Input
                    label="Nomor telepon / WhatsApp"
                    type="tel"
                    required
                    value={form.noHp}
                    onChange={(e) => setForm({ ...form, noHp: e.target.value })}
                  />
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">Alamat lengkap</label>
                    <textarea
                      required
                      rows={3}
                      value={form.alamat}
                      onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                      className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                    />
                  </div>
                  {profileMsg && (
                    <p
                      className={`text-sm ${profileMsg.type === "ok" ? "text-emerald-700" : "text-red-600"}`}
                    >
                      {profileMsg.text}
                    </p>
                  )}
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Simpan profil
                  </Button>
                </form>
              </section>

              <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
                <div className="mb-5 flex items-center gap-2">
                  <KeyRound className="h-5 w-5 text-[var(--color-accent)]" />
                  <h2 className="font-semibold">Keamanan — Ganti Kata Sandi</h2>
                </div>
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <Input
                    label="Kata sandi saat ini"
                    type="password"
                    required
                    autoComplete="current-password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                    }
                  />
                  <Input
                    label="Kata sandi baru"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                    }
                  />
                  <Input
                    label="Konfirmasi kata sandi baru"
                    type="password"
                    required
                    autoComplete="new-password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                    }
                  />
                  <p className="text-xs text-[var(--color-text-subtle)]">
                    Minimal 8 karakter. Gunakan kombinasi huruf dan angka untuk keamanan lebih baik.
                  </p>
                  {passwordMsg && (
                    <p
                      className={`text-sm ${passwordMsg.type === "ok" ? "text-emerald-700" : "text-red-600"}`}
                    >
                      {passwordMsg.text}
                    </p>
                  )}
                  <Button type="submit" variant="secondary" disabled={changingPassword}>
                    {changingPassword ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <KeyRound className="h-4 w-4" />
                    )}
                    Ubah kata sandi
                  </Button>
                </form>
              </section>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
