# SuratRT

Platform digital manajemen **RT 005 / RW 002 Kampung Makasar**, Jakarta Timur — layanan surat online, iuran, forum warga, polling, dan panel admin pengurus RT.

**Repository:** [github.com/Muzaki29/website-surat-rt](https://github.com/Muzaki29/website-surat-rt)

---

## Daftar Isi

1. [Fitur](#fitur)
2. [Tech Stack](#tech-stack)
3. [Persyaratan](#persyaratan)
4. [Instalasi](#instalasi)
5. [Variabel Lingkungan](#variabel-lingkungan)
6. [Akun Demo](#akun-demo)
7. [Konfigurasi RT](#konfigurasi-rt)
8. [Panduan Warga](#panduan-warga)
9. [Panduan Pengurus RT](#panduan-pengurus-rt)
10. [Alur Bisnis Singkat](#alur-bisnis-singkat)
11. [Modul & URL](#modul--url)
12. [Scripts](#scripts)
13. [Deploy Produksi](#deploy-produksi)
14. [Backup & Keamanan](#backup--keamanan)
15. [Troubleshooting](#troubleshooting)
16. [Dokumentasi Teknis (SRS / SDD / STD)](#dokumentasi-teknis-srs--sdd--std)
17. [Keamanan](#keamanan)

---

## Fitur

| Area | Keterangan |
|------|------------|
| **Layanan Surat** | Pengajuan online, lacak status, surat masuk/keluar, arsip, PDF surat keluar |
| **Keuangan** | Tagihan iuran, konfirmasi pembayaran, buku kas RT |
| **Komunitas** | Registrasi warga, forum diskusi, polling RT, pengumuman |
| **Dukungan** | FAQ, tiket support ke pengurus |
| **Admin** | Dashboard, monitoring, analitik, verifikasi warga & pengajuan |
| **Auth** | Login NIK/email, peran warga & pengurus (NextAuth v5), lupa/reset password |
| **Akun Warga** | Dashboard `/akun`, profil, riwayat pembayaran, unduh kwitansi PDF |
| **Notifikasi** | Lonceng admin & warga (status pengajuan, iuran, pengumuman) |
| **Workflow Surat** | Timeline pengajuan, catatan internal, penugasan, unduh PDF surat |
| **Keuangan+** | Export CSV laporan iuran/kas/tunggakan, pengingat iuran otomatis (cron) |
| **Kalender RT** | Jadwal kegiatan publik & kelola di admin |
| **Keamanan** | RBAC per peran, rate limit login/register, audit log aktivitas sensitif |
| **Pengurus** | Kelola akun pengurus RT, KPI prioritas Ketua RT di dashboard |

---

## Tech Stack

| Lapisan | Teknologi |
|---------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS v4, Lucide Icons |
| Database | SQLite + Prisma ORM |
| Auth | NextAuth.js v5 (Credentials) |
| PDF | pdf-lib |
| Pembayaran | Midtrans (opsional, sandbox) |

---

## Persyaratan

- **Node.js** 20 atau lebih baru
- **npm** 10+
- Browser modern (Chrome, Firefox, Safari, Edge)

---

## Instalasi

### 1. Clone repository

```bash
git clone https://github.com/Muzaki29/website-surat-rt.git
cd website-surat-rt
```

### 2. Install dependensi

```bash
npm install
```

### 3. Siapkan environment

```bash
cp .env.example .env
```

Edit `.env` — minimal isi `DATABASE_URL` dan `AUTH_SECRET` (lihat [Variabel Lingkungan](#variabel-lingkungan)).

### 4. Inisialisasi database

```bash
npm run db:setup
```

Perintah ini menjalankan `prisma db push` + seed akun demo dan data awal.

### 5. Jalankan development server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

> **Catatan:** Setelah mengubah schema Prisma, hentikan dev server, jalankan `npm run db:setup`, lalu start ulang `npm run dev`.

---

## Variabel Lingkungan

| Variabel | Wajib | Keterangan |
|----------|-------|------------|
| `DATABASE_URL` | Ya | SQLite: `file:./dev.db` |
| `AUTH_SECRET` | Ya | String acak min. 32 karakter untuk NextAuth |
| `AUTH_URL` | Ya (prod) | URL publik, mis. `https://rt-kampung-makasar.id` |
| `MIDTRANS_*` | Tidak | Kunci Midtrans jika pembayaran Snap aktif |
| `WHATSAPP_*` | Tidak | API notifikasi WhatsApp (opsional) |
| `EMAIL_*` | Tidak | Email transaksional (reset password, pengingat iuran) |
| `CRON_SECRET` | Tidak | Secret header untuk `/api/cron/iuran-reminder` |
| `IURAN_REMINDER_DAYS` | Tidak | Hari sebelum jatuh tempo, mis. `7,3,1` |
| `RT_SLUG` | Tidak | Slug konfigurasi multi-RT (`rt005`) |

File `.env` **jangan** di-commit ke Git.

---

## Akun Demo

Setelah `npm run db:setup`:

| Peran | Email | Password |
|-------|-------|----------|
| Admin | `admin@rt001.local` | `admin123` |
| Ketua RT | `ketua@rt001.local` | `ketua123` |
| Sekretaris RT | `sekretaris@rt001.local` | `sekretaris123` |
| Bendahara RT | `bendahara@rt001.local` | `bendahara123` |

**Warga:** daftar mandiri di `/daftar` → diverifikasi pengurus di `/admin/warga` → login dengan NIK atau email.

### Cara login pengurus

1. Buka `/login` (bukan `/daftar`).
2. **Email:** ketik persis `admin@rt001.local` (bukan NIK).
3. **Password:** `admin123` (atau sesuai tabel di atas).
4. **Captcha:** isi hasil penjumlahan angka (wajib).
5. Jika gagal setelah pull/clone baru, jalankan ulang:
   ```bash
   npm run db:setup
   ```
6. **Restart dev server** setelah update kode (`stop.bat` → `start.bat`).

> Ganti password demo sebelum deploy produksi.

---

## Konfigurasi RT

| File | Isi |
|------|-----|
| `src/lib/constants.ts` | Nama RT, alamat, kontak, rekening, navigasi |
| `src/data/jenis-surat.ts` | Katalog layanan surat & estimasi hari kerja |
| `src/data/faq.ts` | Pertanyaan umum halaman bantuan |

Contoh data RT saat ini: **RT 005 / RW 002, Kampung Makasar, Kelurahan Makasar, Jakarta Timur**.

---

## Panduan Warga

### Registrasi & login

1. Buka `/daftar` — isi NIK, nama, alamat, HP, email, password.
2. Tunggu verifikasi pengurus RT (status `menunggu-verifikasi`).
3. Setelah aktif, masuk di `/login` dengan **NIK** atau **email**.
4. Warga yang sudah login diarahkan ke **Forum** (`/forum`).

### Ajukan surat

1. Menu **Layanan Surat** → pilih jenis surat.
2. Isi formulir pengajuan.
3. Simpan **ID pengajuan**.
4. Lacak progres di **Cek Status** (`/status` atau `/status/[id]`).

### Bayar iuran

1. Buka `/pembayaran`.
2. Masukkan NIK untuk melihat tagihan.
3. Transfer ke rekening RT atau bayar via Midtrans (jika dikonfigurasi).
4. Upload/kirim bukti — bendahara konfirmasi di admin.

### Fitur lain

| Halaman | Fungsi |
|---------|--------|
| `/pengumuman` | Pengumuman resmi RT |
| `/polling` | Voting keputusan RT |
| `/forum` | Diskusi antar warga |
| `/bantuan` | FAQ & tiket support |
| `/kalender` | Jadwal kegiatan RT |
| `/lupa-password` | Permintaan reset kata sandi |
| `/akun` | Dashboard warga (login wajib) |

---

## Panduan Pengurus RT

1. Masuk di `/login` dengan akun pengurus.
2. Panel admin: `/admin`

### Tugas harian

| Modul | URL | Tugas |
|-------|-----|-------|
| Pengajuan Warga | `/admin/pengajuan` | Review, setujui/tolak, proses surat |
| Surat Masuk/Keluar | `/admin/surat-masuk`, `/admin/surat-keluar` | Catat & terbitkan surat |
| Data Warga | `/admin/warga` | CRUD warga, **verifikasi pendaftar baru** |
| Iuran | `/admin/iuran` | Terbitkan tagihan, konfirmasi bayar |
| Kas RT | `/admin/kas` | Catat pemasukan/pengeluaran |
| Pengumuman | `/admin/pengumuman` | Publikasikan info ke warga |
| Polling | `/admin/polling` | Buat & kelola voting |
| Arsip | `/admin/arsip` | Pencarian surat terpadu |
| Support | `/admin/support` | Balas tiket warga |
| Monitoring & Analitik | `/admin/monitoring`, `/admin/analitik` | Ringkasan operasional |
| Kalender | `/admin/kalender` | Jadwal rapat & kegiatan RT |
| Laporan Keuangan | `/admin/laporan` | Export CSV iuran, kas, tunggakan |
| Audit Log | `/admin/audit-log` | Jejak aktivitas sensitif |
| Pengurus | `/admin/pengurus` | Kelola akun pengurus RT |

---

## Alur Bisnis Singkat

```
Warga → Daftar / Ajukan Surat / Bayar Iuran / Forum / Bantuan
                    ↓
         Pengurus RT (verifikasi & kelola)
                    ↓
    Surat selesai · Iuran lunas · Akun aktif · Arsip tersimpan
```

Detail diagram dan status tiap langkah: [docs/ALUR-BISNIS.md](docs/ALUR-BISNIS.md)

---

## Modul & URL

### Halaman publik

| URL | Deskripsi |
|-----|-----------|
| `/` | Beranda |
| `/layanan` | Daftar layanan surat |
| `/layanan/[slug]` | Formulir pengajuan |
| `/status` | Lacak pengajuan |
| `/pembayaran` | Cek & bayar iuran |
| `/daftar` | Registrasi warga |
| `/login` | Masuk warga & pengurus |
| `/forum` | Forum diskusi |
| `/polling` | Polling RT |
| `/pengumuman` | Pengumuman publik |
| `/bantuan` | FAQ & support |

### Panel admin

Semua di bawah `/admin/*` — dilindungi middleware auth (hanya peran pengurus).

---

## Scripts

### Windows (otomatis)

Double-click atau jalankan di terminal:

```bat
start.bat        # Setup + dev server (disarankan)
start-prod.bat   # Build + server produksi
stop.bat         # Hentikan dev server SuratRT
backup.bat       # Backup database SQLite + JSON legacy
```

> **Port bentrok?** Jika port 3000 dipakai project lain, `start.bat` otomatis pindah ke 3001, 3002, dst. dan membuka URL yang benar. Akses **http://localhost:3001** jika 3000 sudah terpakai.

### npm

```bash
npm run dev          # Server development (port 3000)
npm run build        # Build produksi
npm run start        # Jalankan build produksi
npm run lint         # ESLint
npm run db:generate  # Generate Prisma client
npm run db:push      # Sinkronkan schema ke database
npm run db:seed      # Seed akun demo & data awal
npm run db:setup     # db:push + db:seed (disarankan saat setup awal)
npm run db:backup    # Backup DB + data/json ke folder backups/
```

---

## Deploy Produksi

### VPS Jetorbit (rt05kampungmakasar.web.id)

| Item | Nilai |
|------|-------|
| Server | `103.235.72.55` (Syahdu VPS) |
| Path app | `/var/www/rt05kampungmakasar` |
| Port internal | `3010` (PM2: `suratrt-rt05`) |
| Nginx config | `/etc/nginx/sites-available/rt05kampungmakasar.web.id` |

**Project lain tidak disentuh** — `web-syahdulab` tetap di port `3000`, site nginx lain tidak diubah.

#### DNS (wajib — lakukan di panel domain)

| Type | Host | Value |
|------|------|-------|
| A | `@` | `103.235.72.55` |
| A | `www` | `103.235.72.55` |

Tunggu propagasi DNS (5 menit–24 jam), lalu aktifkan SSL di server:

```bash
ssh root@103.235.72.55
bash /var/www/rt05kampungmakasar/scripts/vps-ssl.sh
```

#### Update deploy berikutnya

```bash
cd /var/www/rt05kampungmakasar
git pull origin main
npm install
npm run build
pm2 restart suratrt-rt05
```

> **Produksi:** ganti password demo admin segera setelah DNS aktif.

### Build lokal

```bash
npm run build
npm run start
```

### Checklist sebelum go-live

- [ ] Ganti semua password demo
- [ ] Set `AUTH_SECRET` dan `AUTH_URL` di hosting
- [ ] Backup database SQLite (`prisma/dev.db`) atau migrasi ke PostgreSQL
- [ ] Konfigurasi domain & HTTPS
- [ ] Uji alur: daftar warga → verifikasi → pengajuan surat → bayar iuran
- [ ] Rotasi kredensial Midtrans/WhatsApp jika dipakai

Panduan detail deploy, backup, dan checklist maintenance: [docs/PANDUAN-MAINTENANCE.md](docs/PANDUAN-MAINTENANCE.md)

---

## Backup & Keamanan

| Data | Lokasi | Frekuensi backup |
|------|--------|------------------|
| Database SQLite | `prisma/dev.db` | Mingguan (prod: harian) — jalankan `backup.bat` atau `npm run db:backup` |
| Upload / JSON legacy | `data/db/*.json` | Mingguan |

- Jangan commit `.env` atau database ke Git.
- Gunakan password manager untuk kredensial pengurus.
- Rotasi password admin setiap 3 bulan.

---

## Troubleshooting

| Masalah | Solusi |
|---------|--------|
| Error Prisma `Unknown argument` | Stop dev server → `npm run db:setup` → start ulang |
| Registrasi gagal / JSON error | Pastikan database sudah di-push; cek log terminal |
| Login warga ditolak | Akun belum diverifikasi di `/admin/warga` |
| Login pengurus gagal | Pakai **email** (bukan NIK), isi **captcha**, jalankan `npm run db:setup`, restart dev server |
| `/api/auth/session` error | Hentikan dev server lama, jalankan `stop.bat` lalu `start.bat` |
| Build gagal `EPERM` Prisma | Tutup proses `npm run dev` yang masih berjalan |
| Halaman admin redirect ke login | Pastikan `AUTH_SECRET` terisi di `.env` |

---

## Dokumentasi Teknis (SRS / SDD / STD)

Dokumen formal untuk audit, pengembangan lanjutan, dan UAT:

| Dokumen | Isi | Audiens |
|---------|-----|---------|
| [docs/SRS.md](docs/SRS.md) | **Spesifikasi Kebutuhan** — fitur, peran, aturan bisnis, NFR | Pengurus RT, PM, developer |
| [docs/SDD.md](docs/SDD.md) | **Spesifikasi Desain** — arsitektur, database, API, keamanan | Developer, maintainer |
| [docs/STD.md](docs/STD.md) | **Spesifikasi Pengujian** — skenario UAT, keamanan, kriteria rilis | QA, maintainer |

---

## Keamanan

SuratRT menerapkan pertahanan berlapis:

| Kontrol | Implementasi |
|---------|--------------|
| Autentikasi | NextAuth JWT, CAPTCHA login, sesi 8 jam |
| Otorisasi | RBAC per modul admin + cek pemilik data (PDF, kwitansi, berkas) |
| Sesi | `tokenVersion` — reset password / nonaktif pengurus memutus sesi |
| Rate limit | Login, daftar, lupa/reset password (10x / 15 menit) |
| API publik | Pengajuan status di-redaksi (`catatanInternal` tidak bocor) |
| Headers | CSP, X-Frame-Options, HSTS (produksi) — `next.config.ts` |
| Audit | Log verifikasi warga, pengajuan, iuran, pengurus |
| Pembayaran | Verifikasi signature Midtrans webhook |

**Checklist produksi:** ganti password demo, set `AUTH_SECRET`, konfigurasi `EMAIL_*`, jangan aktifkan `DEBUG_RESET`, jalankan backup rutin.

---

## Dokumentasi Lengkap

| Dokumen | Isi |
|---------|-----|
| [docs/PANDUAN-PENGGUNA.md](docs/PANDUAN-PENGGUNA.md) | Panduan lengkap warga & pengurus |
| [docs/SRS.md](docs/SRS.md) | Spesifikasi kebutuhan perangkat lunak |
| [docs/SDD.md](docs/SDD.md) | Spesifikasi desain & arsitektur |
| [docs/STD.md](docs/STD.md) | Spesifikasi pengujian (UAT) |
| [docs/PANDUAN-MAINTENANCE.md](docs/PANDUAN-MAINTENANCE.md) | Operasional, deploy, backup |
| [docs/ALUR-BISNIS.md](docs/ALUR-BISNIS.md) | Diagram alur bisnis & status |
| [docs/LAPORAN-TEKNOLOGI.md](docs/LAPORAN-TEKNOLOGI.md) | Arsitektur & struktur kode |
| [docs/AUDIT-UI.md](docs/AUDIT-UI.md) | Catatan audit antarmuka |

---

## Lisensi

Proyek privat untuk keperluan RT — hubungi pengurus RT / maintainer untuk penggunaan di luar lingkungan RT 005 RW 002 Kampung Makasar.
