# Panduan Maintenance — SuratRT

**Target pembaca:** Admin teknis, pengembang, atau pengurus RT yang ditunjuk mengelola website  
**Versi:** 1.0 (Fase 1)  

---

## Daftar Isi

1. [Tanggung Jawab Maintenance](#1-tanggung-jawab-maintenance)
2. [Akses & Kredensial](#2-akses--kredensial)
3. [Operasional Harian](#3-operasional-harian)
4. [Operasional Berkala](#4-operasional-berkala)
5. [Konfigurasi Aplikasi](#5-konfigurasi-aplikasi)
6. [Update & Deployment](#6-update--deployment)
7. [Backup & Recovery](#7-backup--recovery)
8. [Troubleshooting](#8-troubleshooting)
9. [Keamanan](#9-keamanan)
10. [Checklist Maintenance](#10-checklist-maintenance)

---

## 1. Tanggung Jawab Maintenance

| Area | Frekuensi | Penanggung Jawab |
|------|-----------|------------------|
| Website online & dapat diakses | Harian | Admin teknis / hosting |
| Update data RT (nama, kontak) | Saat ada perubahan | Sekretaris RT |
| Backup data surat | Mingguan *(Fase 5)* | Admin teknis |
| Update dependensi npm | Bulanan | Admin teknis |
| Review log error | Mingguan | Admin teknis |
| Rotasi password admin | 3 bulan *(Fase 5)* | Ketua RT + admin teknis |

---

## 2. Akses & Kredensial

### 2.1 Lingkungan

| Lingkungan | URL | Kegunaan |
|------------|-----|----------|
| **Lokal (dev)** | `http://localhost:3000` | Pengembangan & uji coba |
| **Produksi** | *(belum di-deploy)* | Akses warga & pengurus RT |

### 2.2 File & Repo Penting

```
d:\Project\aplikasi-surat-rt\     ← Root proyek
├── .env.local                    ← Environment variables (Fase 5, jangan commit)
├── src/lib/constants.ts          ← Data RT (nama, alamat, kontak)
├── src/data/jenis-surat.ts       ← Katalog layanan surat
└── docs/                         ← Dokumentasi
```

### 2.3 Kredensial yang Perlu Dikelola *(Fase 5)*

- [ ] Password admin Ketua RT
- [ ] Password admin Sekretaris RT
- [ ] Connection string database
- [ ] Secret key NextAuth (`NEXTAUTH_SECRET`)
- [ ] Akses hosting/VPS
- [ ] Domain & SSL certificate

> **Aturan:** Simpan kredensial di password manager. Jangan commit file `.env` ke Git.

---

## 3. Operasional Harian

### 3.1 Memastikan Website Online

**Jika di-hosting Vercel/Netlify:**
- Cek dashboard hosting — status deployment harus *Ready*
- Buka URL produksi dari browser

**Jika di VPS:**
```bash
# Cek apakah proses Node.js berjalan
pm2 status

# Atau cek service systemd
systemctl status suratrt
```

**Jika website down:**
1. Cek koneksi internet server
2. Restart aplikasi: `pm2 restart suratrt` atau `npm run start`
3. Cek log error (lihat [Troubleshooting](#8-troubleshooting))

### 3.2 Monitoring Sederhana (tanpa tool khusus)

Setiap hari kerja, pengurus RT dapat:
1. Buka `/admin` — pastikan dashboard load normal
2. Buka `/layanan` — pastikan daftar surat tampil
3. Laporkan ke admin teknis jika ada halaman error (404/500)

---

## 4. Operasional Berkala

### 4.1 Mingguan

| Tugas | Cara |
|-------|------|
| Backup database | *(Fase 5)* Export DB atau snapshot VPS |
| Cek npm audit | `npm audit` di folder proyek |
| Review pengajuan menumpuk | Panel Admin → Pengajuan Warga |

### 4.2 Bulanan

| Tugas | Cara |
|-------|------|
| Update dependensi patch | `npm update` lalu `npm run build` |
| Cek SSL certificate expiry | Dashboard hosting atau `certbot certificates` |
| Verifikasi data kontak RT | Edit `constants.ts` jika ada pergantian pengurus |

### 4.3 Tahunan

| Tugas | Cara |
|-------|------|
| Update major framework | Next.js major version — uji di staging dulu |
| Review jenis layanan surat | Update `jenis-surat.ts` sesuai kebutuhan warga |
| Audit akses pengguna | Nonaktifkan akun pengurus yang sudah tidak jabatan |

---

## 5. Konfigurasi Aplikasi

### 5.1 Mengubah Data RT

Edit file `src/lib/constants.ts`:

```typescript
export const RT_INFO = {
  nama: "RT 005 / RW 002",
  kampung: "Kampung Makasar",
  kelurahan: "Kelurahan Makasar",
  kecamatan: "Kecamatan Makasar",
  kabupaten: "Kota Jakarta Timur",
  provinsi: "DKI Jakarta",
  alamat: "Kampung Makasar, RW 002",
  telepon: "08xxxxxxxxxx",        // ← Ganti nomor aktif RT/RW
  email: "rt005rw002.makasar@gmail.com",
  ketua: "Nama Ketua RT",
  sekretaris: "Nama Sekretaris RT",
};
```

Setelah edit, rebuild dan deploy ulang.

### 5.2 Menambah / Mengubah Jenis Surat

Edit file `src/data/jenis-surat.ts`:

```typescript
{
  slug: "surat-keterangan-domisili",  // URL: /layanan/surat-keterangan-domisili
  nama: "Surat Keterangan Domisili",
  deskripsi: "...",
  estimasiHari: 1,
  persyaratan: ["KTP", "KK"],
},
```

**Aturan slug:** huruf kecil, pisah dengan tanda `-`, tanpa spasi.

### 5.3 Mengubah Menu Navigasi

Edit `NAV_LINKS` dan `ADMIN_NAV` di `src/lib/constants.ts`.

### 5.4 Environment Variables *(Fase 5)*

Buat file `.env.local` di root proyek:

```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/suratrt"

# Auth
NEXTAUTH_URL="https://suratrt-rt03.example.com"
NEXTAUTH_SECRET="generate-random-string-min-32-chars"

# App
NEXT_PUBLIC_APP_URL="https://suratrt-rt03.example.com"
```

Generate secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 6. Update & Deployment

### 6.1 Workflow Update Standar

```bash
# 1. Backup (Fase 5: backup DB dulu)
# 2. Pull perubahan terbaru
git pull origin main

# 3. Install dependensi baru
npm install

# 4. Build & uji lokal
npm run build
npm run start
# Buka browser, uji halaman utama

# 5. Deploy ke produksi
# Vercel: otomatis via git push
# VPS: pm2 restart suratrt
```

### 6.2 Deploy ke Vercel (Rekomendasi)

1. Push repo ke GitHub/GitLab
2. Login [vercel.com](https://vercel.com) → New Project → Import repo
3. Framework preset: **Next.js**
4. Deploy — dapat URL `*.vercel.app`
5. Custom domain: Settings → Domains → tambah domain RT

### 6.3 Deploy ke VPS (Manual)

```bash
# Di server
git clone <repo-url> /var/www/suratrt
cd /var/www/suratrt
npm install
npm run build

# Install PM2 (process manager)
npm install -g pm2
pm2 start npm --name "suratrt" -- start
pm2 save
pm2 startup
```

**Nginx reverse proxy (contoh):**
```nginx
server {
    listen 80;
    server_name suratrt.example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
```

SSL: `certbot --nginx -d suratrt.example.com`

---

## 7. Backup & Recovery

### 7.1 Yang Perlu Di-backup

| Item | Frekuensi | Metode |
|------|-----------|--------|
| Source code | Otomatis (Git) | Push ke GitHub/GitLab |
| Database surat & pengajuan | Mingguan | pg_dump / sqlite .backup |
| File upload (lampiran) | Mingguan | rsync / cloud storage |
| `.env.local` | Saat berubah | Password manager (encrypted) |

### 7.2 Backup Database *(Fase 5 — PostgreSQL)*

```bash
pg_dump -U user -d suratrt > backup_$(date +%Y%m%d).sql
```

### 7.3 Recovery

```bash
# Restore database
psql -U user -d suratrt < backup_20260621.sql

# Restore aplikasi dari Git
git checkout main
npm install && npm run build && pm2 restart suratrt
```

---

## 8. Troubleshooting

### Error: `npm run dev` — port 3000 sudah dipakai

```bash
# Windows — cari & hentikan proses
netstat -ano | findstr :3000
taskkill /PID <pid> /F

# Atau jalankan di port lain
npm run dev -- -p 3001
```

### Error: Build gagal setelah `git pull`

```bash
# Hapus cache & reinstall
rm -rf node_modules .next
npm install
npm run build
```

### Halaman admin blank / error 500

1. Cek terminal/log: `pm2 logs suratrt`
2. Pastikan `npm run build` sukses
3. Cek apakah ada syntax error di file yang baru diedit

### Formulir pengajuan tidak bisa dikirim

**Expected behavior Fase 1:** Form sengaja disabled. Fitur aktif di Fase 3.

### Login tidak memvalidasi password

**Expected behavior Fase 1:** Mode demo — semua input diterima. Auth nyata di Fase 5.

### Website lambat

1. Cek ukuran gambar di `public/` — kompres jika > 500 KB
2. Pastikan hosting tidak overload
3. Fase 5: aktifkan caching database query

---

## 9. Keamanan

### 9.1 Praktik Wajib

- [ ] Gunakan HTTPS di produksi (Let's Encrypt gratis)
- [ ] Jangan expose `.env` ke publik
- [ ] Batasi akses `/admin` dengan autentikasi *(Fase 5)*
- [ ] Update dependensi jika ada vulnerability: `npm audit fix`
- [ ] Nonaktifkan akun pengurus yang sudah tidak jabatan

### 9.2 npm Audit

```bash
npm audit           # Lihat vulnerability
npm audit fix       # Patch otomatis (minor)
```

Jika ada **critical/high**, prioritaskan update dalam 7 hari.

### 9.3 Data Pribadi (NIK Warga)

- Simpan minimal data yang diperlukan
- Batasi akses NIK hanya untuk Sekretaris RT
- Jangan log NIK ke console server
- Backup database di lokasi aman (encrypted)

---

## 10. Checklist Maintenance

### Harian
- [ ] Website dapat diakses dari browser
- [ ] Tidak ada laporan error dari pengurus RT

### Mingguan
- [ ] Backup database *(Fase 5)*
- [ ] Cek pengajuan menunggu di panel admin
- [ ] `npm audit` — review vulnerability

### Bulanan
- [ ] Update patch dependensi (`npm update`)
- [ ] Verifikasi data kontak RT di website
- [ ] Cek expiry SSL certificate

### Tahunan
- [ ] Review & update katalog jenis surat
- [ ] Audit akun pengguna admin
- [ ] Evaluasi upgrade Next.js major version

---

## Kontak Escalation

| Level | Masalah | Tindakan |
|-------|---------|----------|
| L1 | Website down, warga tidak bisa akses | Restart server / hubungi hosting |
| L2 | Bug fitur, data tidak tersimpan | Hubungi developer / buat issue Git |
| L3 | Kebocoran data, serangan | Segera offline-kan site, rotasi semua password, audit log |

---

## Log Perubahan Dokumen

| Versi | Tanggal | Perubahan |
|-------|---------|-----------|
| 1.0 | Juni 2026 | Dokumen awal — Fase 1 |

---

*Untuk detail teknis stack, lihat [LAPORAN-TEKNOLOGI.md](./LAPORAN-TEKNOLOGI.md). Untuk panduan penggunaan warga & pengurus, lihat [PANDUAN-PENGGUNA.md](./PANDUAN-PENGGUNA.md).*
