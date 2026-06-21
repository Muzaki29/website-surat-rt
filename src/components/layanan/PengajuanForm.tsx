"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import type { JenisSurat } from "@/lib/types";

export function PengajuanForm({
  jenisSurat,
  namaLayanan,
}: {
  jenisSurat: JenisSurat;
  namaLayanan: string;
}) {
  const [form, setForm] = useState({
    namaPemohon: "",
    nik: "",
    alamat: "",
    keperluan: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/pengajuan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, jenisSurat }),
    });

    if (!res.ok) {
      setError("Gagal mengirim pengajuan. Coba lagi.");
      setLoading(false);
      return;
    }

    const data = await res.json();
    setSubmittedId(data.id);
    setLoading(false);
  }

  if (submittedId) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
        <h2 className="mt-4 text-xl font-semibold text-[var(--color-text)]">Pengajuan Terkirim</h2>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          {namaLayanan} Anda sedang diproses pengurus RT.
        </p>
        <p className="mt-4 font-mono text-sm text-[var(--color-text)]">
          ID: {submittedId}
        </p>
        <Link
          href={`/status/${submittedId}`}
          className="mt-6 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]"
        >
          Lacak status pengajuan
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
      <h2 className="font-semibold">Formulir Pengajuan</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Nama Lengkap"
          required
          value={form.namaPemohon}
          onChange={(e) => setForm({ ...form, namaPemohon: e.target.value })}
          placeholder="Sesuai KTP"
        />
        <Input
          label="NIK"
          required
          value={form.nik}
          onChange={(e) => setForm({ ...form, nik: e.target.value })}
          placeholder="16 digit"
          maxLength={16}
        />
      </div>
      <Textarea
        label="Alamat Lengkap"
        required
        rows={3}
        value={form.alamat}
        onChange={(e) => setForm({ ...form, alamat: e.target.value })}
        placeholder="Alamat di lingkungan RT"
      />
      <Textarea
        label="Keperluan Surat"
        required
        rows={3}
        value={form.keperluan}
        onChange={(e) => setForm({ ...form, keperluan: e.target.value })}
        placeholder="Jelaskan keperluan pengajuan"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" disabled={loading} className="w-full sm:w-auto">
        {loading ? "Mengirim..." : "Kirim Pengajuan"}
      </Button>
    </form>
  );
}
