"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { CreditCard, LogIn } from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { REKENING_RT } from "@/lib/constants";
import { formatRupiah } from "@/lib/format";
import type { MetodePembayaran, TagihanIuran, Warga } from "@/lib/types";

export default function PembayaranPage() {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [warga, setWarga] = useState<Warga | null>(null);
  const [tagihan, setTagihan] = useState<TagihanIuran[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [metode, setMetode] = useState<MetodePembayaran>("transfer-bank");
  const [kodeReferensi, setKodeReferensi] = useState("");
  const [catatan, setCatatan] = useState("");
  const [success, setSuccess] = useState(false);
  const [midtransLoading, setMidtransLoading] = useState(false);

  const loadTagihan = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await fetch("/api/iuran?me=1");
    if (!res.ok) {
      setError("Gagal memuat tagihan. Pastikan akun warga sudah aktif.");
      setLoading(false);
      return;
    }
    const data = await res.json();
    setWarga(data.warga);
    setTagihan(data.tagihan.filter((t: TagihanIuran) => t.status === "belum-bayar"));
    setLoading(false);
  }, []);

  useEffect(() => {
    if (session?.user?.role === "warga") {
      loadTagihan();
    }
  }, [session, loadTagihan]);

  async function handleMidtransPay() {
    if (!selectedId) return;
    setMidtransLoading(true);
    setError("");

    const res = await fetch("/api/payment/midtrans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tagihanId: selectedId }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Midtrans tidak tersedia.");
      setMidtransLoading(false);
      return;
    }

    const snapUrl = process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL
      ?? "https://app.sandbox.midtrans.com/snap/snap.js";

    await new Promise<void>((resolve, reject) => {
      const existing = document.querySelector(`script[src="${snapUrl}"]`);
      if (existing) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = data.clientKey
        ? `https://app.sandbox.midtrans.com/snap/snap.js`
        : snapUrl;
      script.setAttribute("data-client-key", data.clientKey);
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Gagal memuat Midtrans Snap"));
      document.body.appendChild(script);
    }).catch(() => {
      setError("Gagal memuat gateway Midtrans.");
      setMidtransLoading(false);
      return;
    });

    // @ts-expect-error Snap injected by Midtrans script
    if (typeof window.snap !== "undefined") {
      // @ts-expect-error Snap global
      window.snap.pay(data.token, {
        onSuccess: () => {
          setSuccess(true);
          setMidtransLoading(false);
        },
        onPending: () => {
          setSuccess(true);
          setMidtransLoading(false);
        },
        onError: () => {
          setError("Pembayaran Midtrans gagal.");
          setMidtransLoading(false);
        },
        onClose: () => setMidtransLoading(false),
      });
    } else {
      setError("Midtrans Snap belum siap. Gunakan transfer manual.");
      setMidtransLoading(false);
    }
  }

  async function handleBayar(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId) return;
    setLoading(true);

    const res = await fetch("/api/iuran", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "ajukan-bayar",
        id: selectedId,
        metodePembayaran: metode,
        kodeReferensi,
        catatanPembayaran: catatan,
      }),
    });

    if (!res.ok) {
      setError("Gagal mengirim bukti pembayaran.");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  const selected = tagihan.find((t) => t.id === selectedId);
  const isWarga = session?.user?.role === "warga";

  return (
    <>
      <Header />
      <main className="flex-1 bg-[var(--color-background)]">
        <div className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
          <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
            <h1 className="text-3xl font-bold tracking-tight">Bayar Iuran RT</h1>
            <p className="mt-2 text-[var(--color-text-muted)]">
              Masuk sebagai warga untuk melihat tagihan Anda. Pembayaran dilindungi akun pribadi.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:px-6">
          {status === "loading" && (
            <p className="text-sm text-[var(--color-text-muted)]">Memeriksa sesi...</p>
          )}

          {status !== "loading" && !isWarga && (
            <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
              <LogIn className="mx-auto h-10 w-10 text-[var(--color-text-subtle)]" />
              <p className="mt-3 font-medium">Login diperlukan</p>
              <p className="mt-1 text-sm text-[var(--color-text-muted)]">
                Untuk keamanan data, tagihan hanya dapat diakses setelah login sebagai warga terdaftar.
              </p>
              <Link href="/login?callbackUrl=/pembayaran" className="mt-4 inline-block">
                <Button type="button">
                  <LogIn className="h-4 w-4" />
                  Masuk ke Akun Warga
                </Button>
              </Link>
            </div>
          )}

          {isWarga && loading && !warga && (
            <p className="text-sm text-[var(--color-text-muted)]">Memuat tagihan...</p>
          )}

          {isWarga && error && <p className="text-sm text-red-600">{error}</p>}

          {isWarga && success && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-sm text-emerald-900">
              Bukti pembayaran terkirim. Status: menunggu konfirmasi Bendahara RT (1×24 jam).
            </div>
          )}

          {isWarga && warga && !success && (
            <>
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                <p className="text-sm text-[var(--color-text-muted)]">Warga</p>
                <p className="font-semibold">{warga.nama}</p>
                <p className="text-sm text-[var(--color-text-muted)]">{warga.alamat}</p>
              </div>

              {tagihan.length === 0 ? (
                <p className="text-sm text-[var(--color-text-muted)]">Tidak ada tagihan belum bayar.</p>
              ) : (
                <>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Pilih tagihan</p>
                    {tagihan.map((t) => (
                      <label
                        key={t.id}
                        className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 transition-colors ${
                          selectedId === t.id
                            ? "border-[var(--color-accent)] bg-teal-50/50"
                            : "border-[var(--color-border)] hover:bg-[var(--color-surface-muted)]"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <input
                            type="radio"
                            name="tagihan"
                            value={t.id}
                            checked={selectedId === t.id}
                            onChange={() => setSelectedId(t.id)}
                            className="accent-[var(--color-accent)]"
                          />
                          <span>
                            <span className="font-medium">{t.jenisIuran}</span>
                            <span className="ml-2 text-sm text-[var(--color-text-muted)]">{t.periode}</span>
                          </span>
                        </span>
                        <span className="font-semibold tabular-nums">{formatRupiah(t.nominal)}</span>
                      </label>
                    ))}
                  </div>

                  {selected && (
                    <form onSubmit={handleBayar} className="space-y-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6">
                      <h2 className="flex items-center gap-2 font-semibold">
                        <CreditCard className="h-5 w-5 text-[var(--color-accent)]" />
                        Detail Pembayaran
                      </h2>

                      <div className="rounded-lg bg-[var(--color-surface-muted)] p-4 text-sm">
                        <p className="font-medium">Rekening RT</p>
                        <p className="mt-1">{REKENING_RT.bank} — {REKENING_RT.nomor}</p>
                        <p>a.n. {REKENING_RT.atasNama}</p>
                        <p className="mt-2 text-[var(--color-text-muted)]">{REKENING_RT.qrisInfo}</p>
                        <p className="mt-2 font-semibold tabular-nums">
                          Nominal: {formatRupiah(selected.nominal)}
                        </p>
                      </div>

                      <Select
                        label="Metode Pembayaran"
                        value={metode}
                        onChange={(e) => setMetode(e.target.value as MetodePembayaran)}
                      >
                        <option value="transfer-bank">Transfer Bank</option>
                        <option value="qris">QRIS</option>
                        <option value="tunai">Tunai (serahkan ke pengurus)</option>
                      </Select>

                      <Input
                        label="Kode Referensi / No. Transaksi"
                        required
                        value={kodeReferensi}
                        onChange={(e) => setKodeReferensi(e.target.value)}
                        placeholder="Contoh: TRF123456"
                      />

                      <Textarea
                        label="Catatan (opsional)"
                        rows={2}
                        value={catatan}
                        onChange={(e) => setCatatan(e.target.value)}
                      />

                      <Button type="submit" disabled={loading}>
                        {loading ? "Mengirim..." : "Kirim Bukti Pembayaran"}
                      </Button>

                      <div className="border-t border-[var(--color-border)] pt-4">
                        <p className="mb-3 text-sm text-[var(--color-text-muted)]">
                          Atau bayar otomatis via Midtrans (jika dikonfigurasi admin).
                        </p>
                        <Button
                          type="button"
                          variant="secondary"
                          disabled={midtransLoading}
                          onClick={handleMidtransPay}
                        >
                          {midtransLoading ? "Memuat gateway..." : "Bayar via Midtrans"}
                        </Button>
                      </div>
                    </form>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
