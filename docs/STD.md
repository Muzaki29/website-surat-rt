# STD — Spesifikasi Pengujian Perangkat Lunak

**Produk:** SuratRT  
**Versi dokumen:** 1.0  
**Tanggal:** Juni 2026  
**Jenis pengujian:** Manual UAT + checklist regresi + verifikasi keamanan  

---

## 1. Tujuan & ruang lingkup

Dokumen ini mendefinisikan strategi, skenario, dan kriteria penerimaan pengujian SuratRT sebelum rilis ke warga RT 005 / RW 002 Kampung Makasar.

**Lingkup:** fungsional, keamanan, kompatibilitas browser, backup/restore.  
**Di luar lingkup:** load testing skala kota, penetration test pihak ketiga formal.

---

## 2. Lingkungan pengujian

| Item | Spesifikasi |
|------|-------------|
| OS | Windows 10/11, Android 12+ (browser) |
| Browser | Chrome 120+, Firefox 120+, Edge 120+ |
| Node.js | 20 LTS |
| Database | SQLite (`npm run db:setup`) |
| Akun demo | Lihat README — Admin, Ketua, Sekretaris, Bendahara |
| Warga uji | Daftar mandiri via `/daftar` |

### 2.1 Data uji

| Entitas | Contoh |
|---------|--------|
| NIK warga uji | `3201010101010001` (fiktif, 16 digit) |
| KK uji | `3201010101010002` |
| Jenis surat | `surat-keterangan-domisili` |

---

## 3. Strategi pengujian

| Level | Metode | Pelaksana |
|-------|--------|-----------|
| Unit | TypeScript compile (`tsc --noEmit`) | Developer |
| Build | `npm run build` | Developer / CI |
| Integrasi API | Checklist manual + Postman/curl | QA / Maintainer |
| UI/UX | Walkthrough halaman | Pengurus RT |
| Keamanan | Checklist OWASP + review kode | Maintainer |
| Regresi | Skrip TC-01 s/d TC-40 sebelum rilis | Maintainer |

---

## 4. Kriteria penerimaan global

- [ ] `npm run build` sukses tanpa error TypeScript
- [ ] Tidak ada password demo di produksi
- [ ] `AUTH_SECRET` dan `AUTH_URL` terisi di produksi
- [ ] Backup `npm run db:backup` menghasilkan folder di `backups/`
- [ ] Semua TC **Kritis** lulus 100%
- [ ] TC **Tinggi** lulus ≥ 95%

---

## 5. Kasus uji fungsional

### 5.1 Autentikasi & akun

| ID | Prioritas | Langkah | Hasil yang diharapkan |
|----|-----------|---------|----------------------|
| TC-AUTH-01 | Kritis | Daftar warga baru lengkap | Status `menunggu-verifikasi`, notifikasi admin |
| TC-AUTH-02 | Kritis | Login warga belum diverifikasi | Ditolak dengan pesan verifikasi |
| TC-AUTH-03 | Kritis | Pengurus verifikasi warga | Status `aktif`, warga bisa login |
| TC-AUTH-04 | Tinggi | Login dengan CAPTCHA salah | Error captcha, tidak masuk |
| TC-AUTH-05 | Tinggi | Login 11x gagal | Rate limit 429 |
| TC-AUTH-06 | Tinggi | Lupa password → reset | Password berubah, sesi lama invalid |
| TC-AUTH-07 | Tinggi | Ubah password di `/akun/profil` | Berhasil, harus login ulang di perangkat lain |
| TC-AUTH-08 | Tinggi | Nonaktifkan pengurus di admin | Sesi pengurus langsung invalid |

### 5.2 Layanan surat

| ID | Prioritas | Langkah | Hasil yang diharapkan |
|----|-----------|---------|----------------------|
| TC-SURAT-01 | Kritis | Ajukan surat + unggah KTP | ID pengajuan, status `diajukan` |
| TC-SURAT-02 | Kritis | Lacak `/status/[id]` tanpa login | Status tampil, **tanpa** catatan internal |
| TC-SURAT-03 | Kritis | Admin ubah status + catatan internal | Warga tidak lihat catatan internal di API publik |
| TC-SURAT-04 | Tinggi | Status `disetujui` → unduh PDF | PDF terunduh (login pemilik atau staff) |
| TC-SURAT-05 | Tinggi | Unduh PDF tanpa auth | 401 Unauthorized |
| TC-SURAT-06 | Sedang | OCR ekstrak berkas | Field terisi sebagian (jika file jelas) |

### 5.3 Keuangan

| ID | Prioritas | Langkah | Hasil yang diharapkan |
|----|-----------|---------|----------------------|
| TC-KEU-01 | Kritis | Bendahara terbitkan tagihan | Muncul di `/pembayaran` warga login |
| TC-KEU-02 | Kritis | Warga A tidak bisa lihat tagihan warga B | Hanya tagihan sendiri |
| TC-KEU-03 | Tinggi | Konfirmasi pembayaran manual | Status `lunas`, notifikasi warga |
| TC-KEU-04 | Tinggi | Unduh kwitansi PDF | Hanya jika lunas + auth valid |
| TC-KEU-05 | Tinggi | Export CSV `/admin/laporan` | File CSV valid |
| TC-KEU-06 | Sedang | Midtrans sandbox (jika dikonfigurasi) | Webhook update status |

### 5.4 Komunitas

| ID | Prioritas | Langkah | Hasil yang diharapkan |
|----|-----------|---------|----------------------|
| TC-KOM-01 | Tinggi | Buat thread forum | Tampil di `/forum` |
| TC-KOM-02 | Tinggi | Vote polling 2x dengan akun sama | Vote kedua ditolak |
| TC-KOM-03 | Tinggi | Publish pengumuman | Muncul di `/pengumuman` + notifikasi warga |
| TC-KOM-04 | Sedang | Tambah event kalender | Tampil di `/kalender` |

### 5.5 Admin & RBAC

| ID | Prioritas | Langkah | Hasil yang diharapkan |
|----|-----------|---------|----------------------|
| TC-RBAC-01 | Kritis | Bendahara akses `/admin/surat-keluar` | Redirect + pesan akses ditolak |
| TC-RBAC-02 | Tinggi | Sekretaris kelola pengajuan | Berhasil PATCH status |
| TC-RBAC-03 | Tinggi | Ketua lihat KPI dashboard | Kartu prioritas tampil |
| TC-RBAC-04 | Tinggi | Audit log setelah verifikasi warga | Entri `verify` tercatat |

---

## 6. Kasus uji keamanan

| ID | Prioritas | Langkah | Hasil yang diharapkan |
|----|-----------|---------|----------------------|
| TC-SEC-01 | Kritis | `GET /api/pengajuan?id=X` | Tidak ada `catatanInternal`, `penugasanKe` |
| TC-SEC-02 | Kritis | PATCH notifikasi warga ID milik orang lain | 404 / tidak berubah |
| TC-SEC-03 | Kritis | Akses `/admin` tanpa login | Redirect `/login` |
| TC-SEC-04 | Tinggi | Response headers | Ada `X-Content-Type-Options`, CSP |
| TC-SEC-05 | Tinggi | Password `12345678` saat daftar | Ditolak (butuh huruf) |
| TC-SEC-06 | Tinggi | Forgot-password tanpa EMAIL di prod | 503, tidak log token |
| TC-SEC-07 | Tinggi | Cron tanpa `x-cron-secret` | 401/403 |
| TC-SEC-08 | Sedang | Midtrans webhook signature invalid | Ditolak |

---

## 7. Kasus uji UI & landing page

| ID | Prioritas | Langkah | Hasil yang diharapkan |
|----|-----------|---------|----------------------|
| TC-UI-01 | Tinggi | Buka `/` di mobile | 9 layanan warga tampil, tanpa banner admin |
| TC-UI-02 | Tinggi | Lonceng notifikasi warga mobile | Icon tampil di header mobile |
| TC-UI-03 | Sedang | Semua link layanan warga | Tidak 404 |

---

## 8. Pengujian backup & recovery

| ID | Langkah | Hasil yang diharapkan |
|----|---------|----------------------|
| TC-BAK-01 | Jalankan `npm run db:backup` | Folder `backups/YYYY-MM-DD...` berisi `dev.db` |
| TC-BAK-02 | Restore manual `dev.db` dari backup | Data kembali seperti sebelum backup |

---

## 9. Matriks pelacakan (template)

| ID TC | Tanggal | Tester | Status | Catatan |
|-------|---------|--------|--------|---------|
| TC-AUTH-01 | | | ☐ Lulus ☐ Gagal | |
| TC-SURAT-02 | | | ☐ Lulus ☐ Gagal | |
| ... | | | | |

---

## 10. Regresi pra-rilis (checklist cepat)

```
□ Daftar → verifikasi → login warga
□ Ajukan surat → proses admin → unduh PDF
□ Tagihan → bayar → konfirmasi → kwitansi
□ Polling vote sekali
□ Lupa password end-to-end
□ npm run build sukses
□ backup.bat sukses
```

---

## 11. Defect severity

| Level | Definisi | SLA perbaikan |
|-------|----------|---------------|
| Kritis | Data bocor, auth bypass, keuangan salah | Segera / hotfix |
| Tinggi | Fitur utama tidak jalan | 1–3 hari |
| Sedang | Fitur sekunder, UI minor | Rilis berikutnya |
| Rendah | Kosmetik | Backlog |

---

*Dokumen ini melengkapi [SRS.md](./SRS.md) (kebutuhan) dan [SDD.md](./SDD.md) (desain).*
