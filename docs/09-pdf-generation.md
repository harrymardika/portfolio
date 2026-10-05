# 09 · PDF CV & Portfolio otomatis

Alasan teknis: ADR 0003.

## 1. Cara kerja

1. Astro membuat halaman khusus cetak: `/print/cv/`, `/id/print/cv/`, `/print/portfolio/`, `/id/print/portfolio/` (tidak ada di navigasi, `noindex`, tidak dilacak analytics).
2. Setelah `astro build`, `scripts/generate-pdf.ts` menyajikan `dist/` secara lokal, membuka setiap halaman cetak dengan Playwright Chromium, menunggu font termuat, lalu `page.pdf()`.
3. Hasilnya disimpan di `dist/downloads/`:

| File | Isi |
|---|---|
| `Harry-Mardika-CV-EN.pdf` | CV, English |
| `Harry-Mardika-CV-ID.pdf` | CV, Bahasa Indonesia |
| `Harry-Mardika-Portfolio-EN.pdf` | Portfolio, English |
| `Harry-Mardika-Portfolio-ID.pdf` | Portfolio, Bahasa Indonesia |

Nama file stabil agar tautan tidak pernah rusak.

## 2. Aturan CV (ramah ATS)

- A4, margin 12–15 mm, **satu kolom**, maksimal 2 halaman.
- Teks asli yang bisa dipilih (bukan gambar). Tanpa tabel tata letak, ikon sebagai pengganti teks, grafik skill bar, atau foto.
- Judul bagian standar: Summary, Experience, Education, Leadership, Training, Awards, Certifications, Skills.
- Header: nama, kota, email, LinkedIn, GitHub, URL website. **Tanpa nomor HP.**
- Isi: item dengan `show_on_cv: true`, sertifikat yang masih berlaku, urutan terbaru dulu.
- Font: Plus Jakarta Sans (body) dan Young Serif (nama saja), keduanya di-embed.
- Metadata PDF: `title`, `author`, `subject`, `keywords` diisi.

## 3. Aturan Portfolio (visual)

- A4 landscape. Isi: sampul (foto, peran), profil singkat, Journey, proyek `featured: true` (urut `order`) dengan angka unggulan, skills, kontak.
- Memakai token warna tema (hijau/amber). Boleh berisi gambar, dengan ukuran total < 3 MB.
- 3D diganti gambar statis (render atau screenshot).

## 4. Kriteria kualitas

- Tes e2e: file ada, ukuran wajar, teks "Harry Mardika" bisa diekstrak, dan **tidak ada pola nomor telepon** (`/\+?62[\d\s-]{8,}/`).
- Dicek manual dengan ATS checker gratis sebelum rilis besar.
