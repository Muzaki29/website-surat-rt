"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";

export function BantuanTicketForm() {
  const [form, setForm] = useState({ nama: "", kontak: "", topik: "Pengajuan Surat", pesan: "" });
  const [loading, setLoading] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal mengirim tiket. Coba lagi.");
        return;
      }
      setTicketId(data.id);
      setForm({ nama: "", kontak: "", topik: "Pengajuan Surat", pesan: "" });
    } catch {
      setError("Koneksi gagal. Periksa internet Anda.");
    } finally {
      setLoading(false);
    }
  }

  if (ticketId) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
        <p className="font-semibold">Tiket berhasil dikirim</p>
        <p className="mt-2">
          ID tiket: <span className="font-mono font-medium">{ticketId}</span>
        </p>
        <p className="mt-2 leading-relaxed">
          Pengurus RT akan menghubungi Anda lewat nomor HP atau email yang dicantumkan. Simpan ID
          tiket untuk referensi.
        </p>
        <button
          type="button"
          onClick={() => setTicketId(null)}
          className="mt-4 cursor-pointer text-sm font-semibold text-emerald-800 underline"
        >
          Kirim tiket baru
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Nama lengkap"
          required
          value={form.nama}
          onChange={(e) => setForm({ ...form, nama: e.target.value })}
          placeholder="Sesuai KTP"
        />
        <Input
          label="No. HP atau email"
          required
          value={form.kontak}
          onChange={(e) => setForm({ ...form, kontak: e.target.value })}
          placeholder="08xx atau email@..."
        />
      </div>
      <Select label="Topik bantuan" value={form.topik} onChange={(e) => setForm({ ...form, topik: e.target.value })}>
        <option value="Pengajuan Surat">Pengajuan Surat</option>
        <option value="Pembayaran">Pembayaran / Iuran</option>
        <option value="Akun & Akses">Akun & Verifikasi Warga</option>
        <option value="Bug Sistem">Bug / Error Website</option>
        <option value="Lainnya">Lainnya</option>
      </Select>
      <Textarea
        label="Ceritakan kendala Anda"
        required
        rows={5}
        value={form.pesan}
        onChange={(e) => setForm({ ...form, pesan: e.target.value })}
        placeholder="Contoh: ID pengajuan PJ-xxx status stuck di Diproses sejak 3 hari. NIK 32xxxxxxxxxx001."
      />
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
      )}
      <Button type="submit" disabled={loading}>
        {loading ? "Mengirim..." : "Kirim Tiket ke Pengurus RT"}
      </Button>
    </form>
  );
}
