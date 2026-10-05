# 0001 · Astro (SSG) dengan Bun dan TypeScript strict

- **Status:** Accepted
- **Tanggal:** 2026-10-05

## Konteks
Situs portfolio hampir seluruhnya statis, di-host di home server di belakang CDN, dan harus memuat di bawah 3 detik. SRS menyebut Bun, Next.js, atau Astro.

## Keputusan
Gunakan **Astro dalam mode static (SSG)**, **Bun** sebagai runtime dan package manager, dan **TypeScript strict**.

## Alternatif yang dipertimbangkan
- **Next.js (SSR/SSG):** lebih berat; fitur server tidak dibutuhkan; JS klien bawaan lebih besar.
- **Vite + React SPA (proyek lama):** SEO dan performa awal lebih buruk; semua konten bergantung pada JS.

## Konsekuensi
- HTML siap saji, cocok dengan Cloudflare Always Online, dan permukaan serangan minimal.
- Interaktivitas (3D, dialog) harus dibuat sebagai island; tidak ada state global ala SPA.
- Data dinamis (GitHub) diperbarui lewat rebuild terjadwal, bukan runtime.
