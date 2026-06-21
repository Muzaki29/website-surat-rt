# Alur Bisnis — SuratRT

Platform manajemen RT dengan empat pilar operasional: **Layanan**, **Keuangan**, **Insight**, dan **Dukungan**.

---

## 1. Diagram Alur Utama

```
                    ┌─────────────────────────────────────┐
                    │           WARGA RT                  │
                    └──────────────┬──────────────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         ▼                         ▼                         ▼
   ┌───────────┐            ┌───────────┐            ┌───────────┐
   │  LAYANAN  │            │ KEUANGAN  │            │  DUKUNGAN │
   │  Surat    │            │  Iuran    │            │  FAQ /    │
   │  Pengajuan│            │  Bayar    │            │  Tiket    │
   └─────┬─────┘            └─────┬─────┘            └─────┬─────┘
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  ▼
                    ┌─────────────────────────────────────┐
                    │         PENGURUS RT (Admin)           │
                    │  Verifikasi · Konfirmasi · Kelola     │
                    └──────────────┬──────────────────────┘
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         ▼                         ▼                         ▼
   ┌───────────┐            ┌───────────┐            ┌───────────┐
   │ MONITORING│            │ ANALITIK  │            │   KAS RT  │
   │  Alert &  │            │  Laporan  │            │  Buku     │
   │  Tindak   │            │  Trend    │            │  Kas      │
   └───────────┘            └───────────┘            └───────────┘
```

---

## 2. Alur Layanan Surat (Warga → RT)

| Step | Aktor | Aksi | Status |
|------|-------|------|--------|
| 1 | Warga | Pilih layanan di `/layanan` | — |
| 2 | Warga | Isi formulir pengajuan | `diajukan` |
| 3 | Warga | Simpan ID, lacak di `/status` | `diajukan` |
| 4 | Sekretaris RT | Review di `/admin/pengajuan` | `diproses` |
| 5 | Sekretaris RT | Setujui / Tolak | `disetujui` / `ditolak` |
| 6 | Sekretaris RT | Buat surat keluar | `selesai` |

---

## 3. Alur Pembayaran Iuran (Payment)

| Step | Aktor | Aksi | Status Tagihan |
|------|-------|------|----------------|
| 1 | Bendahara RT | Terbitkan tagihan di `/admin/iuran` | `belum-bayar` |
| 2 | Warga | Cek tagihan via NIK di `/pembayaran` | `belum-bayar` |
| 3 | Warga | Transfer ke rekening RT / QRIS | — |
| 4 | Warga | Submit bukti (no. ref + metode) | `menunggu-konfirmasi` |
| 5 | Bendahara RT | Konfirmasi di `/admin/iuran` | `lunas` |
| 6 | Sistem | Otomatis catat pemasukan ke Kas RT | — |

**Metode pembayaran:** Transfer Bank, QRIS, Tunai (tunai dikonfirmasi langsung oleh pengurus).

---

## 4. Alur Monitoring (Pengurus RT)

| Indikator | Sumber | Tindakan |
|-----------|--------|----------|
| Pengajuan menunggu | `pengajuan.json` | Proses di Pengajuan Warga |
| Pembayaran menunggu konfirmasi | `iuran.json` | Konfirmasi di Iuran |
| Tagihan belum bayar > 30 hari | `iuran.json` | Follow-up warga |
| Tiket support terbuka | `support.json` | Balas di Support |

Dashboard monitoring: `/admin/monitoring`

---

## 5. Alur Analitik

| Metrik | Kegunaan |
|--------|----------|
| Tingkat koleksi iuran (%) | Transparansi ke warga |
| Tren surat masuk/keluar | Beban administrasi |
| Pemasukan vs pengeluaran kas | Kesehatan keuangan RT |
| Pengajuan per jenis surat | Perencanaan layanan |

Dashboard analitik: `/admin/analitik`

---

## 6. Alur Support Sistem

| Step | Aktor | Aksi |
|------|-------|------|
| 1 | Warga/Pengurus | Baca FAQ di `/bantuan` |
| 2 | User | Buat tiket (topik + pesan) | Status: `terbuka` |
| 3 | Admin RT | Tanggapi di `/admin/support` | `diproses` |
| 4 | Admin RT | Tutup tiket | `selesai` |

---

## 7. Peran & Hak Akses (Fase 5 — Aktif)

| Peran | Email Demo | Modul |
|-------|------------|-------|
| Admin RT | admin@rt001.local | Semua modul |
| Sekretaris RT | sekretaris@rt001.local | Surat, pengajuan, pengumuman, arsip |
| Bendahara RT | bendahara@rt001.local | Iuran, pembayaran, kas, analitik keuangan |

Login wajib untuk `/admin/*`. Password demo: `admin123`, `sekretaris123`, `bendahara123`.

---

## 8. Fitur Lanjutan (Fase 5)

| Fitur | SuratRT | Status |
|-------|---------|--------|
| Tagihan otomatis | ✅ | Aktif |
| Multi-channel payment | ✅ Transfer/QRIS/Tunai + Midtrans | Aktif |
| WhatsApp notifikasi | ✅ Webhook + link wa.me | Aktif (konfigurasi `.env`) |
| Payment gateway Midtrans | ✅ Snap + webhook | Aktif (set `MIDTRANS_*`) |
| Polling warga | ✅ `/polling` + `/admin/polling` | Aktif |
| Arsip digital | ✅ `/admin/arsip` | Aktif |
| Cetak PDF surat | ✅ `/api/surat-keluar/[id]/pdf` | Aktif |
| Database Prisma | ✅ SQLite (dev) / PostgreSQL (prod) | Aktif |
