# SRS — Spesifikasi Kebutuhan Perangkat Lunak

**Produk:** SuratRT  
**Versi dokumen:** 1.0  
**Tanggal:** Juni 2026  
**Pemangku kepentingan:** Pengurus RT 005 / RW 002 Kampung Makasar, warga, maintainer IT  

---

## 1. Pendahuluan

### 1.1 Tujuan dokumen

Dokumen ini mendefinisikan kebutuhan fungsional dan non-fungsional platform **SuratRT** — sistem informasi manajemen RT berbasis web untuk layanan surat, keuangan, komunikasi warga, dan administrasi pengurus.

### 1.2 Ruang lingkup

| Dalam lingkup | Di luar lingkup (v1) |
|---------------|----------------------|
| Pengajuan & pelacakan surat online | Absensi kehadiran rapat |
| Manajemen iuran & kas RT | Integrasi Dukcapil nasional |
| Forum, polling, pengumuman | Aplikasi mobile native |
| Panel admin multi-peran (RBAC) | Multi-RT penuh (UI) — fondasi data ada |
| Registrasi warga (NIK + KK) | |

### 1.3 Definisi & singkatan

| Istilah | Arti |
|---------|------|
| RT / RW | Rukun Tetangga / Rukun Warga |
| Warga | Penduduk terdaftar dengan akun login |
| Pengurus | Admin, Ketua, Sekretaris, atau Bendahara RT |
| IPL | Iuran Pengelolaan Lingkungan |
| RBAC | Role-Based Access Control |

### 1.4 Referensi

- [README.md](../README.md) — panduan instalasi & operasional
- [SDD.md](./SDD.md) — desain teknis
- [STD.md](./STD.md) — spesifikasi pengujian
- [ALUR-BISNIS.md](./ALUR-BISNIS.md) — diagram alur bisnis

---

## 2. Deskripsi umum

### 2.1 Perspektif produk

SuratRT adalah platform tunggal yang menghubungkan warga dengan pengurus RT untuk:

1. Mengajukan surat administratif tanpa antre fisik berulang
2. Membayar iuran dan melacak tagihan
3. Berpartisipasi dalam keputusan RT (polling) dan diskusi (forum)
4. Menerima pengumuman dan notifikasi status layanan

Pengurus menggunakan panel `/admin` untuk verifikasi, pemrosesan, pelaporan, dan audit.

### 2.2 Peran pengguna

| Peran | Kode | Deskripsi |
|-------|------|-----------|
| Warga | `warga` | Penduduk terdaftar, diverifikasi pengurus |
| Admin RT | `admin` | Akses penuh seluruh modul |
| Ketua RT | `ketua-rt` | Monitoring, KPI, verifikasi, laporan |
| Sekretaris RT | `sekretaris-rt` | Surat masuk/keluar, pengajuan, arsip |
| Bendahara RT | `bendahara-rt` | Iuran, kas, monitoring pembayaran |

### 2.3 Asumsi & ketergantungan

- Warga memiliki NIK 16 digit dan nomor KK valid
- Server dapat diakses via HTTPS di produksi
- SQLite (dev) atau PostgreSQL (prod direkomendasikan) tersedia
- Opsional: Midtrans (pembayaran), WhatsApp API, SMTP/Resend (email)

---

## 3. Kebutuhan fungsional

### 3.1 Modul autentikasi & akun

| ID | Kebutuhan | Prioritas |
|----|-----------|-----------|
| FR-AUTH-01 | Warga mendaftar dengan NIK, KK, alamat, HP, email, password | Wajib |
| FR-AUTH-02 | Login dengan email atau NIK + CAPTCHA matematika | Wajib |
| FR-AUTH-03 | Akun warga `menunggu-verifikasi` tidak dapat login forum | Wajib |
| FR-AUTH-04 | Lupa & reset kata sandi via email (token 1 jam) | Wajib |
| FR-AUTH-05 | Dashboard warga `/akun`: profil, ubah password, riwayat bayar | Wajib |
| FR-AUTH-06 | Notifikasi lonceng untuk warga (status pengajuan, iuran, pengumuman) | Wajib |
| FR-AUTH-07 | Pengurus login terpisah; menu admin disesuaikan RBAC | Wajib |
| FR-AUTH-08 | Nonaktifkan akun pengurus memutus sesi JWT (`tokenVersion`) | Wajib |

### 3.2 Modul layanan surat

| ID | Kebutuhan | Prioritas |
|----|-----------|-----------|
| FR-SURAT-01 | Katalog jenis surat dengan estimasi hari kerja | Wajib |
| FR-SURAT-02 | Formulir pengajuan + unggah berkas (KTP, KK, pendukung) | Wajib |
| FR-SURAT-03 | OCR ekstraksi teks dari berkas (Tesseract.js) | Opsional |
| FR-SURAT-04 | Lacak status via `/status` atau `/status/[id]` | Wajib |
| FR-SURAT-05 | API publik status **tanpa** catatan internal pengurus | Wajib |
| FR-SURAT-06 | Workflow admin: catatan internal, penugasan, timeline | Wajib |
| FR-SURAT-07 | Unduh PDF surat saat status disetujui/selesai (pemilik/staff) | Wajib |
| FR-SURAT-08 | Surat masuk/keluar, nomor otomatis, arsip terpadu | Wajib |

### 3.3 Modul keuangan

| ID | Kebutuhan | Prioritas |
|----|-----------|-----------|
| FR-KEU-01 | Terbitkan tagihan iuran per warga/periode | Wajib |
| FR-KEU-02 | Warga login melihat tagihan sendiri (`/pembayaran`) | Wajib |
| FR-KEU-03 | Konfirmasi manual (transfer/QRIS) oleh bendahara | Wajib |
| FR-KEU-04 | Integrasi Midtrans Snap (sandbox/prod) | Opsional |
| FR-KEU-05 | Buku kas RT (pemasukan/pengeluaran) | Wajib |
| FR-KEU-06 | Export CSV laporan iuran, kas, tunggakan | Wajib |
| FR-KEU-07 | Kwitansi PDF untuk pembayaran lunas | Wajib |
| FR-KEU-08 | Pengingat iuran otomatis (cron + WhatsApp/email) | Opsional |

### 3.4 Modul komunitas

| ID | Kebutuhan | Prioritas |
|----|-----------|-----------|
| FR-KOM-01 | Forum diskusi (login warga aktif) | Wajib |
| FR-KOM-02 | Polling RT — satu suara per warga | Wajib |
| FR-KOM-03 | Pengumuman publik + broadcast notifikasi warga | Wajib |
| FR-KOM-04 | Kalender kegiatan RT (publik + kelola admin) | Wajib |
| FR-KOM-05 | FAQ & tiket support ke pengurus | Wajib |

### 3.5 Modul administrasi

| ID | Kebutuhan | Prioritas |
|----|-----------|-----------|
| FR-ADM-01 | Dashboard per peran dengan statistik & aksi cepat | Wajib |
| FR-ADM-02 | KPI prioritas Ketua RT (tunggakan, pending, tiket) | Wajib |
| FR-ADM-03 | Verifikasi warga & pengelompokan KK | Wajib |
| FR-ADM-04 | Monitoring pembayaran per metode | Wajib |
| FR-ADM-05 | Analitik operasional & keuangan | Wajib |
| FR-ADM-06 | Kelola akun pengurus RT | Wajib |
| FR-ADM-07 | Audit log aktivitas sensitif | Wajib |
| FR-ADM-08 | Notifikasi lonceng admin | Wajib |

---

## 4. Kebutuhan non-fungsional

### 4.1 Keamanan

| ID | Kebutuhan |
|----|-----------|
| NFR-SEC-01 | Autentikasi JWT (NextAuth v5), cookie HttpOnly + Secure (prod) |
| NFR-SEC-02 | RBAC pada setiap route admin & API sensitif |
| NFR-SEC-03 | Rate limiting login, register, forgot/reset password |
| NFR-SEC-04 | Password min. 8 karakter, huruf + angka |
| NFR-SEC-05 | Security headers (CSP, X-Frame-Options, HSTS prod) |
| NFR-SEC-06 | Verifikasi signature Midtrans notification |
| NFR-SEC-07 | Data sensitif pengajuan tidak bocor via API publik |
| NFR-SEC-08 | IDOR dicegah pada notifikasi, PDF, berkas, kwitansi |

### 4.2 Kinerja & ketersediaan

| ID | Kebutuhan |
|----|-----------|
| NFR-PERF-01 | Halaman utama load < 3 detik di jaringan 4G |
| NFR-PERF-02 | API read response < 500 ms (data RT skala kecil) |
| NFR-AVAIL-01 | Target uptime 99% untuk deployment produksi |

### 4.3 Usabilitas

| ID | Kebutuhan |
|----|-----------|
| NFR-UX-01 | Bahasa Indonesia di seluruh UI |
| NFR-UX-02 | Responsif mobile & desktop |
| NFR-UX-03 | Kontras warna memadai (audit UI tersedia) |

### 4.4 Pemeliharaan

| ID | Kebutuhan |
|----|-----------|
| NFR-MAINT-01 | Backup database via `npm run db:backup` |
| NFR-MAINT-02 | Schema Prisma terdokumentasi |
| NFR-MAINT-03 | Seed akun demo untuk UAT |

---

## 5. Kasus penggunaan (ringkas)

### UC-01: Warga mengajukan surat

**Aktor:** Warga (belum login)  
**Alur utama:** Pilih layanan → isi formulir → unggah berkas → dapat ID → lacak di `/status`  
**Alur alternatif:** Pengurus meminta dokumen tambahan → warga lihat di timeline publik  

### UC-02: Verifikasi pendaftar baru

**Aktor:** Sekretaris / Ketua  
**Alur:** Notifikasi pendaftaran → `/admin/warga` → verifikasi → warga dapat login forum  

### UC-03: Konfirmasi pembayaran iuran

**Aktor:** Warga, Bendahara  
**Alur:** Warga bayar & upload bukti → status `menunggu-konfirmasi` → bendahara konfirmasi → kwitansi PDF  

### UC-04: Reset kata sandi

**Aktor:** Warga / Pengurus  
**Alur:** `/lupa-password` → email token → `/reset-password` → sesi lama invalid  

---

## 6. Aturan bisnis

1. Satu NIK hanya satu akun warga
2. Anggota satu KK terdeteksi otomatis saat registrasi (`noKk`)
3. Polling: satu suara per `pollingId` + `wargaId` (unique constraint)
4. PDF surat hanya jika status `disetujui` atau `selesai`
5. Kwitansi hanya jika status tagihan `lunas`
6. Catatan internal pengajuan tidak ditampilkan ke pemohon

---

## 7. Lampiran

### 7.1 Matriks URL publik vs terproteksi

| URL | Akses |
|-----|-------|
| `/`, `/layanan`, `/status`, `/kalender` | Publik |
| `/forum`, `/akun`, `/pembayaran` (tagihan) | Login warga |
| `/admin/*` | Login pengurus + RBAC |

### 7.2 Status pengajuan surat

`diajukan` → `diproses` → `disetujui` / `ditolak` → `selesai`

---

*Dokumen ini merupakan baseline kebutuhan. Perubahan wajib melalui review pengurus RT dan maintainer.*
