---
title: Netflix Prize Data Warehouse & Recommendation System
---

## Masalah
Memproses dataset berskala besar seperti Netflix Prize yang berisi lebih dari 100 juta rating film memerlukan infrastruktur yang kuat dan skalabel. Data rating mentah harus divalidasi, ditransformasi, dan diatur ke dalam skema data warehouse yang optimal sebelum dapat digunakan secara efektif untuk pemodelan rekomendasi skala besar tanpa kendala performa.

## Pendekatan
Saya membangun sistem modular yang dibagi menjadi data ingestion pipeline dan mesin pemodelan rekomendasi. Untuk data ingestion, saya menggunakan `Apache Spark 3.5` dengan PySpark untuk mengekstrak, memvalidasi, dan memuat data mentah ke dalam star schema data warehouse berbasis `PostgreSQL 12`, lengkap dengan sistem checkpoint yang dapat dilanjutkan. Untuk pemodelan, saya melatih model collaborative filtering menggunakan Scikit-Learn (SVD) dan Spark MLlib (ALS) di dalam lingkungan `Python 3.11`, serta memanfaatkan Docker untuk mempermudah deployment database.

## Hasil
- Mengembangkan ETL pipeline tingkat produksi menggunakan `Apache Spark 3.5` untuk melakukan ingestion dan memproses lebih dari 100 juta rating secara efisien.
- Merancang dan mengimplementasikan star schema data warehouse analitis di `PostgreSQL 12` dengan tabel dimensi untuk pelanggan, film, dan tanggal.
- Membangun model rekomendasi collaborative filtering yang skalabel menggunakan algoritma Matrix Factorization (SVD) dan Spark MLlib ALS.
- Membuat sistem checkpoint pipeline yang dapat dilanjutkan untuk memastikan keandalan data ingestion dan mencegah kehilangan data selama proses berjalan.
