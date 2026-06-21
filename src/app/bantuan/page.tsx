"use client";

import { useState } from "react";
import Link from "next/link";
import { HelpCircle, MessageSquare } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { FAQ_ITEMS } from "@/data/faq";
import { FASILITAS_SEKITAR, INFO_LAYANAN_KEPENDUDUKAN, RT_INFO } from "@/lib/constants";

export default function BantuanPage() {
  const [form, setForm] = useState({ nama: "", kontak: "", topik: "Pembayaran", pesan: "" });
  const [loading, setLoading] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setTicketId(data.id);
    setForm({ nama: "", kontak: "", topik: "Pembayaran", pesan: "" });
    setLoading(false);
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-[var(--color-background)]">
        <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
            <h1 className="text-3xl font-bold tracking-tight">Bantuan & Support</h1>
            <p className="mt-2 text-[var(--color-text-muted)]">
              FAQ, kontak RT, dan tiket bantuan sistem SuratRT.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-3xl space-y-10 px-4 py-10 sm:px-6">
          <section>
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <HelpCircle className="h-5 w-5 text-[var(--color-accent)]" />
              Pertanyaan Umum
            </h2>
            <dl className="mt-4 space-y-4">
              {FAQ_ITEMS.map((item) => (
                <div key={item.q} className="border-b border-[var(--color-border)] pb-4">
                  <dt className="font-medium">{item.q}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-[var(--color-text-muted)]">{item.a}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-5 text-sm">
            <p className="font-medium">Kontak Langsung — {RT_INFO.nama}</p>
            <p className="mt-2 text-[var(--color-text-muted)]">
              {RT_INFO.kampung}, {RT_INFO.kelurahan}, {RT_INFO.kecamatan}, {RT_INFO.kabupaten}
            </p>
            <p className="mt-2 text-[var(--color-text-muted)]">
              {RT_INFO.ketua} · Telp: {RT_INFO.telepon} · Email: {RT_INFO.email}
            </p>
            <p className="mt-3 text-[var(--color-text-muted)]">{INFO_LAYANAN_KEPENDUDUKAN}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Fasilitas Sekitar RW 002</h2>
            <ul className="mt-4 space-y-3">
              {FASILITAS_SEKITAR.map((item) => (
                <li
                  key={item.nama}
                  className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3"
                >
                  <p className="text-xs font-semibold uppercase text-[var(--color-accent)]">{item.kategori}</p>
                  <p className="font-medium">{item.nama}</p>
                  <p className="mt-1 text-sm text-[var(--color-text-muted)]">{item.keterangan}</p>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <MessageSquare className="h-5 w-5 text-[var(--color-accent)]" />
              Buat Tiket Support
            </h2>

            {ticketId ? (
              <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-sm">
                Tiket berhasil dibuat. ID: <span className="font-mono font-medium">{ticketId}</span>.
                Pengurus RT akan menanggapi melalui kontak Anda.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-4 space-y-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Nama" required value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
                  <Input label="No. HP / Email" required value={form.kontak} onChange={(e) => setForm({ ...form, kontak: e.target.value })} />
                </div>
                <Select label="Topik" value={form.topik} onChange={(e) => setForm({ ...form, topik: e.target.value })}>
                  <option value="Pembayaran">Pembayaran / Iuran</option>
                  <option value="Pengajuan Surat">Pengajuan Surat</option>
                  <option value="Akun & Akses">Akun & Akses</option>
                  <option value="Bug Sistem">Bug / Error Sistem</option>
                  <option value="Lainnya">Lainnya</option>
                </Select>
                <Textarea label="Pesan" required rows={4} value={form.pesan} onChange={(e) => setForm({ ...form, pesan: e.target.value })} />
                <Button type="submit" disabled={loading}>{loading ? "Mengirim..." : "Kirim Tiket"}</Button>
              </form>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
