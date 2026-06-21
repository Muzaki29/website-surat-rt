"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatusTracker } from "@/components/layanan/StatusTracker";
import type { PengajuanSurat } from "@/lib/types";

export default function CekStatusPage() {
  const [id, setId] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<PengajuanSurat | null>(null);
  const [error, setError] = useState("");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setData(null);

    const res = await fetch(`/api/pengajuan?id=${encodeURIComponent(id.trim())}`);
    if (!res.ok) {
      setError("Pengajuan tidak ditemukan. Periksa ID Anda.");
      setLoading(false);
      return;
    }
    setData(await res.json());
    setLoading(false);
  }

  return (
    <>
      <Header />
      <main className="flex-1 bg-[var(--color-background)]">
        <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
          <h1 className="text-3xl font-bold tracking-tight">Cek Status Pengajuan</h1>
          <p className="mt-2 text-[var(--color-text-muted)]">
            Masukkan ID pengajuan yang Anda terima setelah mengajukan surat.
          </p>

          <form onSubmit={handleSearch} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <Input
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="Contoh: 1718..."
                required
                aria-label="ID pengajuan"
              />
            </div>
            <Button type="submit" disabled={loading}>
              <Search className="h-4 w-4" />
              {loading ? "Mencari..." : "Cari"}
            </Button>
          </form>

          {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

          {data && (
            <div className="mt-8">
              <StatusTracker data={data} id={id.trim()} />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
