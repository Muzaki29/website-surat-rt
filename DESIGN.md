# SuratRT — DESIGN

## Scene
Portal layanan publik RT di Jakarta Timur — diakses warga dari HP, siang hari, butuh kejelasan bukan dekorasi.

## Color strategy
Restrained civic: primary `#0B4F8A`, accent `#0D9488`, neutral slate. Satu accent saja.

## Typography
Plus Jakarta Sans — body 16px, line-height 1.6, max 65ch for prose.

## Layout
- Split hero (bukan centered)
- Border-t / divide-y grouping — hindari card grid identik
- `max-w-6xl mx-auto` konsisten

## Components
Gunakan CSS variables dari `globals.css`. Jangan hardcode `blue-700` / `slate-*` di halaman.

## Motion
150–200ms transitions, `prefers-reduced-motion` respected (globals.css).
