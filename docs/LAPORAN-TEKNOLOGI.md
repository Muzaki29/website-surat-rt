# Laporan Teknologi — SuratRT

**Versi aplikasi:** 0.2.0 (Fase 5)  
**Tanggal:** Juni 2026  
**Proyek:** Aplikasi Penyuratan Digital RT  

---

## 1. Ringkasan Eksekutif

**SuratRT** adalah website layanan penyuratan dan manajemen RT/RW — surat masuk/keluar, arsip digital, layanan publik warga, iuran, forum, dan panel admin pengurus.

Saat ini aplikasi berada di **Fase 5** — autentikasi, database Prisma, polling, arsip, PDF, Midtrans, dan notifikasi WhatsApp sudah aktif.

---

## 2. Tech Stack

### 2.1 Frontend & Framework

| Komponen | Teknologi | Versi | Keterangan |
|----------|-----------|-------|------------|
| Framework | **Next.js** (App Router) | 16.2.9 | Server & client components, middleware auth |
| UI Library | **React** | 19.2.4 | Komponen interaktif |
| Bahasa | **TypeScript** | ^5 | Type safety untuk data surat & pengguna |
| Styling | **Tailwind CSS** | ^4 | Utility-first CSS, responsif mobile-first |
| Ikon | **Lucide React** | ^1.21.0 | Ikon konsisten di seluruh UI |
| Font | **Plus Jakarta Sans** (Google Fonts) | — | Tipografi modern via `next/font` |

### 2.2 Backend & Data

| Komponen | Teknologi | Keterangan |
|----------|-----------|------------|
| Database | **Prisma + SQLite** | Dev: `prisma/dev.db`. Prod: ganti ke PostgreSQL |
| ORM | **Prisma Client** | ^6.19 |
| Autentikasi | **NextAuth v5** | Credentials provider, JWT session |
| PDF | **pdf-lib** | Cetak surat keluar RT |
| Payment | **Midtrans Snap** | Opsional via env `MIDTRANS_*` |
| Notifikasi | **WhatsApp API** | Opsional via env `WHATSAPP_*` + fallback wa.me |
| API Routes | **Next.js Route Handlers** | CRUD + webhook Midtrans |

### 2.3 Tooling & DevOps

| Tool | Versi | Fungsi |
|------|-------|--------|
| Node.js | v24+ (disarankan LTS) | Runtime JavaScript |
| npm | 11+ | Manajemen paket |
| ESLint | ^9 | Linting kode |
| eslint-config-next | 16.2.9 | Aturan ESLint Next.js |
| Git | — | Version control (repo sudah diinisialisasi) |

### 2.4 Persyaratan Sistem

**Pengembangan (lokal):**
- Node.js 20 LTS atau lebih baru
- RAM minimal 4 GB
- Browser modern (Chrome, Firefox, Edge, Safari)

**Produksi (rekomendasi):**
- VPS 1 vCPU / 1 GB RAM (cukup untuk traffic RT skala kecil)
- Atau platform serverless: Vercel, Netlify, Railway

---

## 3. Arsitektur Aplikasi

```
┌─────────────────────────────────────────────────────────┐
│                    PENGGUNA AKHIR                        │
│         Warga RT          │        Pengurus RT           │
└─────────────┬─────────────┴──────────────┬──────────────┘
              │                            │
              ▼                            ▼
┌─────────────────────┐      ┌──────────────────────────┐
│   Portal Publik     │      │    Panel Admin           │
│   /                 │      │    /admin/*              │
│   /layanan          │      │    - Dashboard           │
│   /layanan/[slug]   │      │    - Surat Masuk         │
│   /login            │      │    - Surat Keluar        │
└─────────┬───────────┘      │    - Pengajuan Warga     │
          │                  │    - Arsip               │
          └────────┬─────────┴────────────┬─────────────┘
                   │                      │
                   ▼                      ▼
          ┌────────────────────────────────────┐
          │         Next.js App Router          │
          │   (Server Components + Routing)     │
          └────────────────┬───────────────────┘
                           │
          ┌────────────────┴───────────────────┐
          │  Fase 5 (rencana):                   │
          │  - API Routes / Server Actions       │
          │  - Database (SQLite / PostgreSQL)    │
          │  - Auth (NextAuth / Credentials)     │
          │  - PDF Generator (surat cetak)       │
          └──────────────────────────────────────┘
```

---

## 4. Struktur Folder Proyek

```
aplikasi-surat-rt/
├── docs/                          # Dokumentasi (laporan & panduan)
├── public/                        # Asset statis (ikon, gambar)
├── src/
│   ├── app/                       # Routing Next.js App Router
│   │   ├── layout.tsx             # Layout root + metadata
│   │   ├── page.tsx               # Beranda
│   │   ├── globals.css            # Style global + Tailwind
│   │   ├── layanan/               # Portal layanan warga
│   │   │   ├── page.tsx           # Daftar jenis surat
│   │   │   └── [slug]/page.tsx    # Detail & formulir pengajuan
│   │   ├── login/page.tsx         # Halaman masuk pengurus
│   │   └── admin/                 # Panel admin RT
│   │       ├── layout.tsx         # Sidebar + header admin
│   │       ├── page.tsx           # Dashboard
│   │       ├── surat-masuk/
│   │       ├── surat-keluar/
│   │       ├── pengajuan/
│   │       └── arsip/
│   ├── components/
│   │   ├── layout/                # Header, Footer
│   │   └── admin/                 # Komponen khusus admin
│   ├── data/
│   │   └── jenis-surat.ts         # Katalog layanan surat
│   └── lib/
│       ├── constants.ts           # Konfigurasi RT & navigasi
│       └── types.ts               # TypeScript interfaces
├── package.json
├── tsconfig.json
├── next.config.ts
└── postcss.config.mjs
```

---

## 5. Model Data (TypeScript)

Tipe data sudah didefinisikan di `src/lib/types.ts`:

| Entitas | Field Utama | Status Implementasi |
|---------|-------------|---------------------|
| `SuratMasuk` | nomorAgenda, pengirim, perihal, status | Type only — UI placeholder |
| `SuratKeluar` | nomorSurat, tujuan, perihal, status | Type only — UI placeholder |
| `PengajuanSurat` | jenisSurat, NIK, keperluan, status | Type only — form disabled |
| `JenisSuratInfo` | slug, nama, persyaratan | **Aktif** — data statis |
| `PeranPengguna` | ketua-rt, sekretaris-rt, warga, admin | Type only — belum dipakai |

**Status surat:** `draft` → `diajukan` → `diproses` → `disetujui` / `ditolak` → `selesai`

---

## 6. Rute Aplikasi

| URL | Akses | Status Fase 1 |
|-----|-------|---------------|
| `/` | Publik | ✅ Selesai |
| `/layanan` | Publik | ✅ Selesai |
| `/layanan/[slug]` | Publik | ✅ UI selesai, form disabled |
| `/login` | Publik | ✅ UI selesai, auth demo |
| `/admin` | Admin (demo) | ✅ Dashboard mock data |
| `/admin/surat-masuk` | Admin | ⏳ Placeholder |
| `/admin/surat-keluar` | Admin | ⏳ Placeholder |
| `/admin/pengajuan` | Admin | ⏳ Placeholder |
| `/admin/arsip` | Admin | ⏳ Placeholder |

---

## 7. Perbandingan Fitur vs Referensi

### Sudah ada (Fase 1)

- Landing page profesional
- Katalog 8 jenis layanan surat RT
- Panel admin dengan sidebar navigasi
- Dashboard ringkasan statistik (mock)
- Desain responsif (mobile + desktop)
- Struktur peran pengguna (type definition)

### Direncanakan (Fase 2–5) — sudah diimplementasi

| Fitur | Status |
|-------|--------|
| Surat masuk/keluar CRUD | ✅ Aktif |
| Pengajuan online warga | ✅ Aktif |
| Tracking status pengajuan | ✅ Aktif |
| Arsip & pencarian | ✅ Aktif |
| Login & peran pengguna | ✅ Aktif |
| Cetak/PDF surat | ✅ Aktif |
| Database warga + verifikasi | ✅ Aktif |
| Forum & polling warga | ✅ Aktif |
| IPL / iuran & kas RT | ✅ Aktif |
| Notifikasi WhatsApp | ✅ Opsional (`.env`) |
| Midtrans payment | ✅ Opsional (`.env`) |

---

## 8. Roadmap Teknis

| Fase | Deliverable | Stack tambahan (rencana) |
|------|-------------|--------------------------|
| **1** ✅ | UI, routing, types, katalog surat | — |
| **2** | CRUD Surat Masuk & Keluar | Server Actions, localStorage atau SQLite |
| **3** | Form pengajuan warga aktif | React Hook Form + Zod, upload file |
| **4** | Arsip + filter + pencarian | Full-text search, pagination |
| **5** | Auth + DB + PDF | NextAuth, Prisma + PostgreSQL, react-pdf |

---

## 9. Keamanan (Status & Rencana)

| Aspek | Status Saat Ini | Rencana |
|-------|-----------------|---------|
| Autentikasi | Tidak ada (demo) | NextAuth.js + bcrypt |
| Autorisasi per role | Tidak ada | Middleware route `/admin` |
| Validasi input | Minimal | Zod schema di server |
| HTTPS | Tergantung hosting | Wajib di produksi |
| Data NIK warga | Belum disimpan | Enkripsi at-rest (Fase 5) |

---

## 10. Perintah Pengembangan

```bash
# Install dependensi
npm install

# Setup database (pertama kali / setelah clone)
npm run db:setup

# Jalankan development server
npm run dev          # → http://localhost:3000

# Build production
npm run build

# Jalankan production lokal
npm run start

# Lint
npm run lint
```

---

## 11. Deployment (Rekomendasi)

**Opsi A — Vercel (termudah untuk Next.js):**
1. Push repo ke GitHub
2. Import project di vercel.com
3. Deploy otomatis setiap push

**Opsi B — VPS (Ubuntu):**
1. Install Node.js 20 LTS
2. `npm run build && npm run start`
3. Reverse proxy via Nginx + SSL Let's Encrypt

**Opsi C — Docker (future):**
- Dockerfile akan ditambahkan saat Fase 5 stabil

---

*Dokumen ini diperbarui sesuai versi aplikasi. Perubahan tech stack akan dicatat di changelog README.*
