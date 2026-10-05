# 0002 · Satu sumber konten di `content/` dengan validasi Zod dan teks dwibahasa

- **Status:** Accepted
- **Tanggal:** 2026-10-05

## Konteks
Pemilik ingin website mudah diperbarui, dan CV serta Portfolio PDF harus selalu sama dengan isi website.

## Keputusan
Seluruh isi disimpan sebagai **YAML/Markdown di `content/`**, divalidasi oleh **skema Zod** (Astro Content Layer) saat build. Teks tampil memakai tipe `LocalizedText { en; id? }` dengan fallback ke `en`. Web, CV, dan Portfolio membaca data yang sama.

## Alternatif yang dipertimbangkan
- **Headless CMS (Contentful, Sanity):** ketergantungan layanan luar, tidak self-hosted.
- **Database:** berlebihan untuk data yang jarang berubah; perlu server runtime.
- **File terjemahan terpisah per bahasa:** mudah tidak sinkron.

## Konsekuensi
- Mengubah isi tidak memerlukan coding; riwayat perubahan tercatat di Git.
- CMS berbasis Git (Fase 8) bisa ditambahkan tanpa mengubah format.
- Skema harus dirawat: setiap field baru = perubahan skema + tes.
