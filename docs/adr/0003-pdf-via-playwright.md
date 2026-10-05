# 0003 · PDF dibuat dengan Playwright dari halaman `/print/*`

- **Status:** Accepted
- **Tanggal:** 2026-10-05

## Konteks
CV dan Portfolio harus dibuat otomatis dari data yang sama, rapi, ramah ATS (teks bisa dipilih), dan mudah diubah tampilannya.

## Keputusan
Buat halaman Astro khusus cetak, lalu cetak menjadi PDF dengan **Playwright (Chromium headless)** setelah build.

## Alternatif yang dipertimbangkan
- **Typst/LaTeX:** tipografi sangat bagus, tetapi butuh template terpisah dalam bahasa lain dan tidak berbagi komponen/token dengan web.
- **react-pdf / pdfmake:** API tata letak sendiri; sulit mencapai desain yang sama.
- **Membuat PDF manual:** tidak otomatis.

## Konsekuensi
- Satu design system untuk web dan PDF; komponen bisa dipakai ulang.
- Image build memerlukan Chromium (ukuran stage build lebih besar), tetapi image runtime tetap kecil.
- CSS cetak (`@page`, `break-inside`) harus dijaga.
