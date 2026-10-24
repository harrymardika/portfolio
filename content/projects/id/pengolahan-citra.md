---
title: Image Processing Learning Tool (Go Clean Architecture)
---

## Masalah
Saya membutuhkan platform bagi mahasiswa dan hobiis untuk bereksperimen dengan konsep pemrosesan citra digital secara interaktif, sekaligus memiliki basis kode yang mudah diperluas dan diuji.

## Pendekatan
Saya membuat server web Go yang menyajikan UI berbasis HTML5 Canvas dan merombak kode monolitik menjadi struktur clean-architecture dengan lapisan terpisah untuk handler, service, dan model. Saya memanfaatkan pemrosesan paralel dengan goroutine, dependency injection, serta desain berbasis antarmuka untuk mendukung slider real-time, analisis histogram, threshold Otsu, dan deteksi tepi Sobel, semuanya tanpa pustaka eksternal.

## Hasil
- Menerapkan penyesuaian citra real-time (kecerahan, zoom 0,1-5,0×, rotasi ±360°) menggunakan slider responsif.
- Menambahkan rangkaian lengkap transformasi: konversi warna, flip, translasi, operasi aritmetika dan Boolean pada dua gambar.
- Menyediakan visualisasi histogram, threshold otomatis Otsu, equalisasi histogram, serta metrik statistik (mean, standar deviasi).
- Mengintegrasikan deteksi tepi Sobel dengan visualisasi magnitudo, gradien, dan kernel untuk pemahaman edukatif.
- Mencapai kinerja mulus sekitar 30 FPS menggunakan pemrosesan paralel goroutine dan LRU cache terbatas 50 gambar, semuanya terorganisir dalam basis kode clean-architecture yang dapat diuji.
