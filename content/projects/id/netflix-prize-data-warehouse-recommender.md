---
title: Netflix Prize data warehouse & recommender
---

## Masalah
Industri streaming menghasilkan log interaksi dalam jumlah besar yang harus diubah menjadi gudang data bersih dan dapat diquery untuk mendukung keputusan berbasis data, personalisasi, dan optimasi konten.

## Pendekatan
Saya merancang pipeline ETL yang dapat dilanjutkan dengan PySpark untuk mengekstrak, mentransformasi, dan memuat lebih dari 100 juta rating ke dalam gudang data dimensional PostgreSQL, lalu mengimplementasikan model TruncatedSVD berbasis Scikit-Learn dan ALS berbasis Spark MLlib, serta menambahkan analisis graf untuk deteksi komunitas.

## Hasil
- Mengimplementasikan pipeline ETL produksi yang dapat dilanjutkan dengan checkpoint otomatis untuk memproses seluruh dataset secara aman.
- Membuat gudang data PostgreSQL dengan star schema yang dioptimalkan untuk kueri analitis.
- Melatih model collaborative-filtering (TruncatedSVD dan ALS) serta mengevaluasinya dengan MAE, MSE, RMSE, dan lain-lain.
- Melakukan analisis graf untuk mengidentifikasi komunitas film, film hub, dan pola co-viewing.
- Menyediakan skrip Docker-Compose untuk deployment satu-klik seluruh stack.
