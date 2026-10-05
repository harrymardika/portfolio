# 0008 · i18n: English default di `/`, Bahasa Indonesia di `/id/`

- **Status:** Accepted
- **Tanggal:** 2026-10-05

## Konteks
Situs harus dwibahasa. Pembaca utama adalah rekruter, baik nasional maupun internasional, dan CV utama pemilik berbahasa Inggris.

## Keputusan
Gunakan routing i18n bawaan Astro: **`en` sebagai default tanpa prefix**, **`id` dengan prefix `/id/`**. Tidak ada redirect otomatis berdasarkan bahasa browser; yang ada saran ganti bahasa yang tidak memaksa. Setiap halaman memiliki `hreflang`.

## Alternatif yang dipertimbangkan
- **`id` sebagai default:** kurang cocok untuk rekruter internasional dan konten sumber yang berbahasa Inggris.
- **Redirect otomatis:** buruk untuk SEO dan cache CDN.

## Konsekuensi
- Konten ditulis dulu dalam English; versi Indonesia boleh menyusul dengan fallback.
- Halaman `id` adalah komposisi tipis yang memakai komponen yang sama.
