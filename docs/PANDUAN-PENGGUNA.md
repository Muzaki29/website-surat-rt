# Panduan Pengguna — SuratRT

**Aplikasi:** SuratRT — Layanan Penyuratan Digital RT  
**Versi panduan:** 1.0 (Fase 1)  
**Target pembaca:** Warga RT dan Pengurus RT  

---

## Daftar Isi

1. [Pengenalan](#1-pengenalan)
2. [Persyaratan Akses](#2-persyaratan-akses)
3. [Panduan untuk Warga](#3-panduan-untuk-warga)
4. [Panduan untuk Pengurus RT](#4-panduan-untuk-pengurus-rt)
5. [Jenis Layanan Surat](#5-jenis-layanan-surat)
6. [Status Pengajuan](#6-status-pengajuan)
7. [FAQ](#7-faq)

---

## 1. Pengenalan

**SuratRT** membantu warga RT mengajukan surat keterangan secara online, dan membantu pengurus RT mengelola surat masuk, surat keluar, iuran, forum, serta arsip — tanpa antre panjang di pos kamling.

> **Catatan versi:** Fitur lengkap tersedia mulai Fase 3–5 (pengajuan, auth, forum, pembayaran). Lihat README untuk panduan instalasi terbaru.

---

## 2. Persyaratan Akses

### Untuk Warga

| Item | Keterangan |
|------|------------|
| Perangkat | HP, tablet, atau komputer |
| Browser | Chrome, Firefox, Safari, atau Edge (versi terbaru) |
| Internet | Koneksi stabil (WiFi atau data seluler) |
| Dokumen | KTP, KK, dan persyaratan sesuai jenis surat |

### Untuk Pengurus RT

| Item | Keterangan |
|------|------------|
| Akun | Username & kata sandi dari admin RT *(Fase 5)* |
| Peran | Ketua RT, Sekretaris RT, atau Bendahara RT |
| Akses | Halaman `/login` → Panel Admin |

---

## 3. Panduan untuk Warga

### 3.1 Membuka Website

1. Buka browser di HP atau komputer
2. Kunjungi alamat website RT Anda (contoh: `http://localhost:3000` saat demo lokal)
3. Halaman **Beranda** akan menampilkan informasi RT dan layanan surat

### 3.2 Melihat Daftar Layanan Surat

1. Klik menu **Layanan Surat** di navigasi atas, atau tombol **Ajukan Surat**
2. Anda akan melihat daftar jenis surat yang tersedia
3. Setiap kartu menampilkan:
   - Nama layanan
   - Deskripsi singkat
   - Estimasi waktu proses (hari kerja)

### 3.3 Mengajukan Surat *(aktif penuh di Fase 3)*

**Alur yang direncanakan:**

```
Pilih layanan → Isi formulir → Upload persyaratan → Kirim
       ↓
Pengurus RT verifikasi → Disetujui / Ditolak
       ↓
Surat siap diambil / diunduh
```

**Langkah saat ini (Fase 1):**

1. Buka **Layanan Surat** → pilih jenis surat (mis. Surat Keterangan Domisili)
2. Baca **Persyaratan** yang harus disiapkan
3. Formulir pengajuan ditampilkan tetapi belum aktif — hubungi Sekretaris RT langsung untuk pengajuan manual

**Data yang perlu disiapkan:**

| Field | Contoh |
|-------|--------|
| Nama Lengkap | Sesuai KTP |
| NIK | 16 digit |
| Alamat | Alamat lengkap di RT |
| Keperluan | Alasan pengajuan surat |

### 3.4 Melacak Status Pengajuan *(Fase 3)*

Setelah Fase 3, warga dapat:
- Melihat daftar pengajuan yang pernah diajukan
- Memantau status: *Diajukan → Diproses → Disetujui → Selesai*
- Menerima notifikasi saat surat siap

---

## 4. Panduan untuk Pengurus RT

### 4.1 Masuk ke Panel Admin

1. Buka halaman **Masuk** (`/login`)
2. Masukkan username dan kata sandi
3. Klik **Masuk (Demo)** — saat ini langsung masuk tanpa validasi
4. Anda akan diarahkan ke **Dashboard Admin**

> ⚠️ Autentikasi nyata akan diaktifkan di Fase 5. Jangan gunakan data sensitif saat demo.

### 4.2 Dashboard

Dashboard menampilkan ringkasan:

| Kartu | Arti |
|-------|------|
| Surat Masuk Bulan Ini | Jumlah surat yang diterima RT dari luar |
| Surat Keluar Bulan Ini | Jumlah surat yang dikeluarkan RT |
| Pengajuan Menunggu | Pengajuan warga yang belum diproses |
| Arsip Total | Total dokumen tersimpan |

**Aktivitas Terbaru** — daftar kegiatan penyuratan terakhir.

*(Data dashboard saat ini contoh/mock — akan terhubung database di Fase 2–5.)*

### 4.3 Menu Panel Admin

| Menu | Fungsi | Status |
|------|--------|--------|
| **Dashboard** | Ringkasan aktivitas | ✅ Tampilan demo |
| **Surat Masuk** | Catat surat dari RW, kelurahan, instansi | ⏳ Fase 2 |
| **Surat Keluar** | Buat & kelola surat keluar RT | ⏳ Fase 2 |
| **Pengajuan Warga** | Verifikasi pengajuan online warga | ⏳ Fase 3 |
| **Arsip** | Cari & kelola arsip digital | ⏳ Fase 4 |

### 4.4 Surat Masuk *(Fase 2 — panduan alur)*

**Kapan digunakan:** RT menerima surat dari RW, kelurahan, atau undangan rapat.

**Langkah yang akan tersedia:**
1. Buka **Surat Masuk** → **Tambah Surat**
2. Isi: Nomor Agenda, Tanggal Terima, Pengirim, Perihal
3. Simpan — surat tercatat dengan status *Diproses*
4. Tindak lanjuti: disposisi ke pengurus terkait *(fitur lanjutan)*

### 4.5 Surat Keluar *(Fase 2 — panduan alur)*

**Kapan digunakan:** RT mengeluarkan surat resmi ke warga atau instansi.

**Langkah yang akan tersedia:**
1. Buka **Surat Keluar** → **Buat Surat**
2. Sistem generate nomor surat otomatis (contoh: `015/RT/I/2026`)
3. Isi tujuan, perihal, isi surat
4. Cetak atau unduh PDF *(Fase 5)*

### 4.6 Verifikasi Pengajuan Warga *(Fase 3)*

**Alur verifikasi:**

1. Warga mengajukan surat via portal
2. Pengurus buka **Pengajuan Warga**
3. Review data & kelengkapan persyaratan
4. Pilih: **Setujui** / **Tolak** / **Minta revisi**
5. Jika disetujui → buat surat keluar → status *Selesai*

### 4.7 Peran Pengguna

| Peran | Hak Akses (rencana) |
|-------|---------------------|
| **Ketua RT** | Semua modul + persetujuan final |
| **Sekretaris RT** | Surat masuk/keluar, pengajuan, arsip |
| **Bendahara RT** | Lihat arsip (read-only) |
| **Warga** | Portal pengajuan saja |

---

## 5. Jenis Layanan Surat

| No | Layanan | Estimasi | Persyaratan Utama |
|----|---------|----------|-------------------|
| 1 | Surat Keterangan Domisili | 1 hari | KTP, KK |
| 2 | Surat Keterangan Tidak Mampu (SKTM) | 2 hari | KTP, KK, surat permohonan |
| 3 | Surat Pengantar Nikah | 1 hari | KTP, KK, foto, akte kelahiran |
| 4 | Surat Keterangan Usaha | 1 hari | KTP, KK, foto usaha |
| 5 | Surat Keterangan Belum Menikah | 1 hari | KTP, KK |
| 6 | Surat Pengantar SKCK | 1 hari | KTP, KK, pas foto |
| 7 | Surat Keterangan Ahli Waris | 3 hari | KTP, KK, akte kematian |
| 8 | Surat Lainnya | 2 hari | KTP, KK, keterangan keperluan |

> Daftar layanan dapat disesuaikan pengurus RT melalui file konfigurasi `src/data/jenis-surat.ts`.

---

## 6. Status Pengajuan

| Status | Arti | Siapa yang mengubah |
|--------|------|---------------------|
| **Draft** | Belum dikirim | Warga |
| **Diajukan** | Formulir terkirim, menunggu review | Warga |
| **Diproses** | Pengurus sedang memverifikasi | Sekretaris RT |
| **Disetujui** | Pengajuan diterima, surat dibuat | Ketua/Sekretaris RT |
| **Ditolak** | Pengajuan ditolak (dengan alasan) | Pengurus RT |
| **Selesai** | Surat sudah diserahkan ke warga | Sekretaris RT |

---

## 7. FAQ

**Q: Apakah aplikasi ini gratis?**  
A: Aplikasi ini dikembangkan khusus untuk RT Anda dan di-host sendiri — tanpa biaya langganan platform pihak ketiga.

**Q: Apakah bisa diakses dari HP?**  
A: Ya. Tampilan sudah responsif untuk smartphone.

**Q: Bagaimana jika tidak punya internet?**  
A: Warga tetap bisa datang langsung ke pengurus RT. Pengurus mencatat manual di panel admin.

**Q: Apakah data NIK aman?**  
A: Pada Fase 5, data akan disimpan di database dengan kontrol akses per peran. Saat demo, jangan masukkan NIK asli.

**Q: Bisakah menambah jenis surat baru?**  
A: Ya. Hubungi admin/teknisi untuk menambah entri di katalog layanan.

**Q: Apakah ada fitur tanda tangan digital?**  
A: Belum. Fitur e-sign direncanakan sebagai pengembangan lanjutan.

**Q: Siapa yang bisa saya hubungi jika ada kendala?**  
A: Hubungi Sekretaris RT melalui kontak di footer website (telepon/email RT).

---

*Panduan ini akan diperbarui setiap fase pengembangan selesai. Versi terbaru selalu tersedia di folder `docs/`.*
