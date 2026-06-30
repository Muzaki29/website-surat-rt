# SDD — Spesifikasi Desain Perangkat Lunak

**Produk:** SuratRT  
**Versi dokumen:** 1.0  
**Tanggal:** Juni 2026  

---

## 1. Ringkasan arsitektur

### 1.1 Pola arsitektur

```
┌─────────────┐     HTTPS      ┌──────────────────┐
│   Browser   │ ◄────────────► │  Next.js 16 App  │
│  (React 19) │                │  App Router      │
└─────────────┘                └────────┬─────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    ▼                   ▼                   ▼
             ┌──────────┐        ┌──────────┐       ┌────────────┐
             │ Prisma   │        │ JSON     │       │ File upload│
             │ SQLite/  │        │ legacy   │       │ data/      │
             │ Postgres │        │ data/db  │       │ uploads    │
             └──────────┘        └──────────┘       └────────────┘
```

**Pola:** Monolith full-stack Next.js dengan App Router, Server Components, Route Handlers (API), dan middleware auth.

### 1.2 Stack teknologi

| Lapisan | Teknologi | Versi |
|---------|-----------|-------|
| Framework | Next.js (App Router) | 16.x |
| UI | React, Tailwind CSS v4 | 19.x / 4.x |
| ORM | Prisma | 6.x |
| Database | SQLite (dev), PostgreSQL (prod) | — |
| Auth | NextAuth.js v5 (Credentials + JWT) | 5.x beta |
| PDF | pdf-lib | 1.17 |
| OCR | Tesseract.js | 7.x |
| Pembayaran | Midtrans Snap | opsional |

---

## 2. Struktur direktori

```
src/
├── app/                    # Halaman & API routes (App Router)
│   ├── admin/              # Panel pengurus (RBAC per halaman)
│   ├── akun/               # Dashboard warga
│   ├── api/                # REST-style route handlers
│   └── (publik)/           # landing, layanan, status, dll.
├── auth.ts                 # Konfigurasi NextAuth
├── middleware.ts           # Guard /admin, /api, /forum, /akun
├── components/             # UI React (admin, warga, layout, ui)
├── lib/                    # Logika bisnis & utilitas
│   ├── permissions.ts      # RBAC
│   ├── security.ts         # Password policy, masking
│   ├── pengajuan-public.ts # Redaksi API publik
│   ├── audit-log.ts
│   ├── notifikasi.ts
│   └── storage.ts          # JSON legacy read/write
├── data/                   # Katalog statis (jenis surat, FAQ)
prisma/
├── schema.prisma           # Model database
└── seed.ts                 # Akun demo & RtConfig
```

---

## 3. Desain database (Prisma)

### 3.1 Model inti

| Model | Fungsi |
|-------|--------|
| `User` | Akun login (warga & pengurus), `role`, `active`, `tokenVersion` |
| `Warga` | Data kependudukan RT, `nik`, `noKk`, `status` |
| `Notifikasi` | Lonceng admin/warga, `audience`, `userId` |
| `AuditLog` | Jejak aksi sensitif |
| `PasswordResetToken` | Token reset 1 jam |
| `PollingVote` | Constraint unique `[pollingId, wargaId]` |
| `KalenderKegiatan` | Jadwal RT |
| `RtConfig` | Fondasi multi-RT |
| `RateLimitBucket` | Throttling login/register |
| `IuranReminderLog` | Anti-duplikasi pengingat |

### 3.2 Data legacy JSON

File di `data/db/*.json` menyimpan entitas operasional (pengajuan, iuran, kas, forum, dll.) dengan sinkronisasi impor awal ke Prisma jika kosong. Migrasi penuh ke Prisma direncanakan bertahap.

### 3.3 Diagram relasi (ringkas)

```
User 1──1 Warga (opsional, role=warga)
User 1──* Notifikasi (audience=warga, userId)
PollingVote ── pollingId, wargaId (unique)
PasswordResetToken ── userId
```

---

## 4. Desain autentikasi & otorisasi

### 4.1 Alur login

```
Client → POST /api/auth/callback/credentials
       → verify CAPTCHA (in-memory token, TTL 5 menit)
       → checkRateLimit(login:identifier)
       → bcrypt.compare(password)
       → cek user.active & status warga (jika role=warga)
       → JWT session (maxAge 8 jam)
```

### 4.2 Validasi sesi per request

JWT callback memuat ulang `active` dan `tokenVersion` dari database. Jika tidak cocok → `token.revoked = true` → sesi expired.

**Pemutusan sesi:** reset password, nonaktifkan pengurus → increment `tokenVersion`.

### 4.3 RBAC (`src/lib/permissions.ts`)

| Permission | Admin | Ketua | Sekretaris | Bendahara | Warga |
|------------|:-----:|:-----:|:----------:|:---------:|:-----:|
| `warga:verify` | ✓ | ✓ | ✓ | — | — |
| `pengajuan:manage` | ✓ | ✓ | ✓ | — | — |
| `iuran:manage` | ✓ | ✓ | — | ✓ | — |
| `audit:read` | ✓ | ✓ | — | — | — |
| `pengurus:manage` | ✓ | ✓ | — | — | — |

Middleware `canAccessAdminPath()` memetakan URL `/admin/*` ke permission.

---

## 5. Desain API

### 5.1 Konvensi

- Route handlers di `src/app/api/**/route.ts`
- Response JSON `{ error: string }` untuk 4xx/5xx
- Auth: `requirePermission()`, `requireWarga()`, `requireStaff()`

### 5.2 Endpoint kunci

| Method | Path | Auth | Deskripsi |
|--------|------|------|-----------|
| GET | `/api/pengajuan?id=` | Publik | Status redacted (`toPublicPengajuan`) |
| PATCH | `/api/pengajuan` | `pengajuan:manage` | Workflow + timeline |
| GET | `/api/pengajuan/[id]/pdf` | Owner/staff | PDF surat |
| GET | `/api/iuran?me=1` | Warga | Tagihan sendiri |
| GET | `/api/iuran/[id]/kwitansi` | Owner/staff | PDF kwitansi |
| POST | `/api/auth/forgot-password` | Publik + rate limit | Kirim email reset |
| POST | `/api/cron/iuran-reminder` | Header `x-cron-secret` | Pengingat iuran |
| GET | `/api/laporan/keuangan` | `laporan:read` | Export CSV |
| PATCH | `/api/notifikasi/warga` | Warga | Mark read (scoped userId) |

### 5.3 API publik (middleware whitelist)

- `POST /api/auth/register`
- `GET /api/captcha`
- `GET /api/pengajuan?id=` (redacted)
- `GET /api/pengumuman`, `GET /api/kalender`
- `POST /api/payment/midtrans/notification`

---

## 6. Desain keamanan

### 6.1 Lapisan pertahanan

| Lapisan | Implementasi |
|---------|--------------|
| Transport | HTTPS + HSTS (produksi) |
| Headers | CSP, X-Frame-Options, nosniff (`next.config.ts`) |
| Auth | JWT + CAPTCHA login + rate limit |
| AuthZ | RBAC middleware + per-route permission |
| Data | Redaksi API publik, mask NIK, audit log |
| Session | `tokenVersion`, cookie HttpOnly/Secure |
| Payment | Midtrans signature verification |

### 6.2 Alur data sensitif

```
NIK/KK (Warga) ──► Prisma SQLite ──► tidak di-commit Git
Berkas upload ──► data/uploads/ ──► akses via API auth check
Catatan internal ──► timeline.internal=true ──► disaring dari API publik
```

### 6.3 File keamanan

| File | Tanggung jawab |
|------|----------------|
| `src/lib/security.ts` | `validatePassword`, `maskNik` |
| `src/lib/pengajuan-public.ts` | `toPublicPengajuan()` |
| `src/lib/rate-limit.ts` | Bucket SQLite 15 menit / 10 percobaan |
| `src/middleware.ts` | Route guard |
| `next.config.ts` | Security headers |

---

## 7. Desain komponen UI

### 7.1 Layout publik

- `Header.tsx` — navigasi, lonceng warga (desktop + mobile)
- `Footer.tsx` — kontak RT
- Landing `/` — hero, layanan warga (9 fitur), surat populer, wilayah

### 7.2 Panel admin

- `admin/layout.tsx` — sidebar RBAC-filtered
- `AdminRoleDashboard.tsx` — statistik + KPI ketua
- Manager components per modul (CRUD + workflow modal)

### 7.3 Warga

- `WargaDashboard.tsx` — ringkasan akun
- `WargaNotificationBell.tsx` — polling API notifikasi
- `StatusTracker.tsx` — timeline + unduh PDF

---

## 8. Integrasi eksternal

| Layanan | Env vars | Protokol |
|---------|----------|----------|
| Midtrans | `MIDTRANS_*` | REST + Snap JS + webhook |
| WhatsApp | `WHATSAPP_*` | HTTP API |
| Email | `EMAIL_*` | REST (Resend-compatible) |
| Cron | `CRON_SECRET` | POST header secret |

---

## 9. Deployment

| Mode | Perintah | Catatan |
|------|----------|---------|
| Dev | `start.bat` / `npm run dev` | Port auto-fallback |
| Prod | `start-prod.bat` | Build + `npm run start` |
| Backup | `backup.bat` | SQLite + JSON ke `backups/` |

---

## 10. Keputusan desain (ADR ringkas)

| Keputusan | Alasan |
|-----------|--------|
| JWT vs DB session | Sederhana untuk skala RT; `tokenVersion` mitigasi revocation |
| JSON legacy + Prisma | Migrasi bertahap tanpa downtime data demo |
| SQLite dev | Zero-config untuk pengurus non-teknis |
| CAPTCHA matematika | Tanpa dependency pihak ketiga |
| Exclude absensi rapat | Di luar scope permintaan stakeholder |

---

*Rujuk [LAPORAN-TEKNOLOGI.md](./LAPORAN-TEKNOLOGI.md) untuk inventaris file lengkap.*
