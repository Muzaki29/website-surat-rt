"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { BerkasUploadZone, type BerkasUploadItem } from "@/components/layanan/BerkasUploadZone";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import type { ExtractedBerkasResult, JenisSurat } from "@/lib/types";

export function PengajuanForm({
  jenisSurat,
  namaLayanan,
}: {
  jenisSurat: JenisSurat;
  namaLayanan: string;
}) {
  const { data: session } = useSession();
  const [form, setForm] = useState({
    namaPemohon: "",
    nik: "",
    alamat: "",
    keperluan: "",
  });
  const [autoFilled, setAutoFilled] = useState<string[]>([]);
  const [uploads, setUploads] = useState<BerkasUploadItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const applyExtracted = useCallback((data: ExtractedBerkasResult) => {
    const filled: string[] = [];
    setForm((prev) => {
      const next = { ...prev };
      if (data.extracted.namaPemohon && !prev.namaPemohon) {
        next.namaPemohon = data.extracted.namaPemohon;
        filled.push("nama");
      }
      if (data.extracted.nik && !prev.nik) {
        next.nik = data.extracted.nik;
        filled.push("NIK");
      }
      if (data.extracted.alamat && !prev.alamat) {
        next.alamat = data.extracted.alamat;
        filled.push("alamat");
      }
      return next;
    });
    if (filled.length) setAutoFilled(filled);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/pengajuan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        jenisSurat,
        berkas: uploads,
      }),
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
          {uploads.length > 0 && ` ${uploads.length} berkas terlampir.`}
        </p>
        <p className="mt-4 font-mono text-sm text-[var(--color-text)]">ID: {submittedId}</p>
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
    <form
      onSubmit={handleSubmit}
      className="space-y-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
    >
      <div>
        <h2 className="font-semibold">Formulir Pengajuan</h2>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Unggah KTP/KK terlebih dahulu agar data terisi otomatis, lalu lengkapi keperluan surat.
        </p>
      </div>

      <BerkasUploadZone
        uploads={uploads}
        onUploadsChange={setUploads}
        onExtracted={applyExtracted}
      />

      {autoFilled.length > 0 && (
        <div className="flex items-start gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm text-sky-900">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            Data <strong>{autoFilled.join(", ")}</strong> terisi otomatis dari berkas.
            {session?.user?.role === "warga" ? " Diverifikasi dengan akun warga RT." : ""} Silakan
            periksa sebelum kirim.
          </p>
        </div>
      )}

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
          onChange={(e) => setForm({ ...form, nik: e.target.value.replace(/\D/g, "") })}
          placeholder="16 digit"
          maxLength={16}
          inputMode="numeric"
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
