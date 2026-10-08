# 09 · PDF CV & Portfolio otomatis

Alasan teknis: ADR 0003.

## 1. Cara kerja

1. Astro membuat halaman khusus cetak: `/print/cv/`, `/id/print/cv/`, `/print/portfolio/`, `/id/print/portfolio/` (tidak ada di navigasi, `noindex`, tidak dilacak analytics).
2. Setelah `astro build`, `scripts/generate-pdf.ts` (`bun run pdf`, otomatis di akhir `bun run build`) menyajikan folder build secara lokal dengan `Bun.serve` (port acak, menolak path di luar folder build), membuka setiap halaman cetak dengan Playwright Chromium, menunggu font termuat, lalu `page.pdf({ preferCSSPageSize, printBackground, tagged, outline })`. Ukuran kertas dan margin berasal dari `@page` di `src/layouts/PrintLayout.astro`.
3. Hasilnya disimpan di `<BUILD_OUT_DIR>/downloads/` (default `dist/downloads/`). Nama file dan URL dibuat oleh `src/lib/downloads.ts`, yang juga dipakai tombol download, sehingga tidak bisa berbeda:

| File | Isi |
|---|---|
| `Harry-Mardika-CV-EN.pdf` | CV, English |
| `Harry-Mardika-CV-ID.pdf` | CV, Bahasa Indonesia |
| `Harry-Mardika-Portfolio-EN.pdf` | Portfolio, English |
| `Harry-Mardika-Portfolio-ID.pdf` | Portfolio, Bahasa Indonesia |

Nama file stabil agar tautan tidak pernah rusak.

Tombol unduh ada di hero beranda dan di halaman About (EN/ID), dengan atribut `download` dan `data-download="cv|portfolio"`.

## 2. Aturan CV (ramah ATS)

- A4, margin 12–15 mm, **satu kolom**, maksimal 2 halaman.
- Teks asli yang bisa dipilih (bukan gambar). Tanpa tabel tata letak, ikon sebagai pengganti teks, grafik skill bar, atau foto.
- Judul bagian standar, dengan urutan (keputusan pemilik 2026-10-07): Summary, Education, Skills, Experience, Leadership & teaching, Training, Awards, Certifications.
- Teks **hitam** (`--print-ink`) di atas putih, tidak memakai warna tema. Yang tebal: nama, judul entri, nama grup skill, dan frasa yang ditandai `**…**` di konten (docs/04 §6). Daftar Awards dan Certifications sengaja polos (keputusan pemilik 2026-10-07): jika semua baris tebal, tidak ada yang menonjol.
- Header: nama, kota, email, LinkedIn, GitHub, URL website. **Tanpa nomor HP.**
- Isi: item dengan `show_on_cv: true`, sertifikat yang masih berlaku, urutan terbaru dulu.
- Font: Plus Jakarta Sans (body) dan Young Serif (nama saja), keduanya di-embed. Ukuran 8,6 pt agar muat 2 halaman seperti CV asli.
- PDF ber-*tag* (struktur heading terbaca ATS dan pembaca layar). Metadata: judul dokumen dari `<title>` (mis. "Harry Mardika · CV"). *Author/keywords* tidak diisi: Chromium tidak mendukungnya dan tidak sebanding dengan menambah library PDF.

## 2a. Varian CV per posisi (Fase 10, D10)

- Didefinisikan di `content/cv-variants.yaml` (docs/04). Halaman cetaknya `/print/cv/<id>/` dan `/id/print/cv/<id>/`, memakai template CV umum yang sama (`CvDocument.astro`) dengan baris peran, ringkasan, urutan bagian, dan poin yang dipilih varian (`applyVariant`).
- `scripts/generate-pdf.ts` mencetaknya saat build ke `downloads/cv/`, mis. `/downloads/cv/Harry-Mardika-CV-Data-Engineer-EN.pdf`. Aturan sama dengan CV umum: ≤ 2 halaman, ≤ 1 MB, teks bisa dipilih, tanpa nomor HP (dites per varian di `tests/e2e/pdf.spec.ts`).
- Didaftar di halaman **`/cv/`** ("CV per posisi", EN + ID) yang ditautkan di **footer** di samping "Statistik situs" (keputusan pemilik, D10). Halaman itu noindex dan `robots.txt` melarang `/downloads/cv/`, jadi varian tidak muncul di hasil pencarian; unduhan tercatat di statistik sebagai `download-cv`.

## 3. Aturan Portfolio (visual)

- A4 landscape. Isi: sampul (foto, peran), profil singkat, Journey, proyek `featured: true` (urut `order`) dengan angka unggulan, skills, kontak.
- Memakai token warna tema (hijau/amber). Boleh berisi gambar, dengan ukuran total < 3 MB.
- 3D diganti gambar statis (render atau screenshot).

## 4. Kriteria kualitas

- **Anggaran ukuran** ditegakkan oleh skrip (build gagal jika dilampaui): CV < 1 MB, Portfolio < 3 MB. Saat ini ±195 KB dan ±440 KB.
- **Tes e2e** (`tests/e2e/pdf.spec.ts`, membaca PDF dengan pdf.js): file tersedia, ukuran sesuai anggaran, CV ≤ 2 halaman, Portfolio ≤ 8 halaman, judul dokumen benar, teks bisa diekstrak (termasuk teks ID), dan **tidak ada pola nomor telepon**.
- Tes halaman cetak (`tests/e2e/print.spec.ts`): struktur ATS, tanpa gambar di CV, noindex, tema terang, semua kartu proyek muat.
- Jika konten bertambah dan CV menjadi 3 halaman, tes e2e gagal: pindahkan item kurang penting ke `show_on_cv: false`.
- Dicek manual dengan ATS checker gratis sebelum rilis besar.
- **Butuh Chromium Playwright** saat build (lokal: `bunx playwright install chromium`; Docker: T6.1).
