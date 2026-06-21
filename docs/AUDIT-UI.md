# Audit UI — SuratRT (Fase 3)

Audit visual dan UX berdasarkan tiga skill:

- [UI UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) — government/community, accessible & ethical
- [Taste Skill](https://github.com/Leonxlnx/taste-skill) — anti-slop, typography, layout
- [Impeccable](https://github.com/pbakaus/impeccable) — anti-patterns AI design

## Temuan & Perbaikan

| Isu (skill) | Sebelum | Perbaikan |
|-------------|---------|-----------|
| Font Inter (Impeccable, Taste) | Inter default | **Plus Jakarta Sans** — karakter profesional, cocok layanan publik |
| Gradient hero biru-ungu (Taste, Impeccable) | `gradient-to-br blue-teal` | **Split hero** — konten kiri + panel solid primary |
| Card overload dashboard (Taste density 4) | Kartu boxed statistik | **Border-top metrics** — hierarchy tanpa nested cards |
| Missing focus states (UI UX Pro Max) | Minimal | `focus-visible:ring` di link & button |
| Missing cursor-pointer (UI UX Pro Max) | Beberapa link | Semua clickable element |
| Gray on colored bg (Impeccable) | `text-blue-100` on gradient | Muted text pada surface netral |
| No reduced motion (UI UX Pro Max) | — | `@media (prefers-reduced-motion: reduce)` |
| Form disabled placeholder (Fase 2) | Form nonaktif | **Form pengajuan aktif** + tracking `/status` |
| Surat masuk/keluar placeholder | Placeholder saja | **CRUD aktif** dengan nomor otomatis |

## Design Tokens

| Token | Nilai | Penggunaan |
|-------|-------|------------|
| Primary | `#0B4F8A` | CTA, brand civic |
| Accent | `#0D9488` | Highlight, focus ring |
| Text | `#0F172A` | Body |
| Muted | `#475569` | Secondary text |
| Background | `#F8FAFC` | Page bg |

## Pre-delivery Checklist (UI UX Pro Max)

- [x] Lucide SVG icons (bukan emoji)
- [x] cursor-pointer pada clickable
- [x] Hover/active transitions 200ms
- [x] Kontras teks pada light mode
- [x] Focus states keyboard
- [x] prefers-reduced-motion
- [x] Responsive 375px+

## Fase 3 — Fitur Baru

| Modul | URL | Status |
|-------|-----|--------|
| Surat Masuk CRUD | `/admin/surat-masuk` | Aktif |
| Surat Keluar CRUD | `/admin/surat-keluar` | Aktif |
| Pengajuan warga | `/layanan/[slug]` | Aktif |
| Verifikasi pengajuan | `/admin/pengajuan` | Aktif |
| Cek status | `/status`, `/status/[id]` | Aktif |

## Rencana Polish Berikutnya

- Dark mode (opsional)
- WebSocket forum (opsional)
- Install Impeccable: `npx impeccable install`

---

## Audit Sistem — Registrasi & Forum (Juni 2026)

### Root cause error `/daftar`

| Lapisan | Temuan |
|---------|--------|
| Gejala | `Unexpected end of JSON input` di `RegisterForm.tsx` |
| Penyebab langsung | API `/api/auth/register` crash 500 **tanpa body JSON** |
| Penyebab akar | Prisma Client dev server **stale** — field `User.nik` belum ter-generate (EPERM saat dev server jalan) |
| Log server | `Unknown argument 'nik'. Did you mean 'id'?` |

### Perbaikan

1. API register: `try/catch` + respons JSON jelas
2. RegisterForm: `parseJsonResponse()` — tidak crash jika body kosong
3. Setelah update schema: **stop dev server → `npm run db:setup` → `npm run dev`**
