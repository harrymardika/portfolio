---
title: Netflix Prize data warehouse & recommender
---

## Masalah
Industri streaming membutuhkan cara andal untuk mengubah log rating mentah yang masif menjadi warehouse terstruktur yang mendukung analitik, personalisasi, prediksi churn, dan optimasi konten.

## Pendekatan
Saya mengimplementasikan pipeline ETL resumable dengan PySpark yang mengekstrak, mentransformasi, dan memuat lebih dari 100 juta rating ke dalam skema PostgreSQL dimensional, menambahkan checkpoint otomatis dan dukungan Docker. Selanjutnya saya melatih model collaborative-filtering—TruncatedSVD dari Scikit-Learn untuk baseline lokal dan ALS dari Spark MLlib untuk rekomendasi skala besar—serta analitik graf untuk deteksi komunitas.

## Hasil
- Pipeline ETL produksi yang resumable yang memproses seluruh dataset Netflix Prize ke dalam warehouse PostgreSQL berbentuk star-schema.
- Checkpoint otomatis memungkinkan restart aman tanpa duplikasi data yang dimuat.
- Model collaborative-filtering (SVD dan ALS) dilatih pada data warehouse, siap menghasilkan rekomendasi film yang dipersonalisasi.
- Analitik graf mengidentifikasi komunitas film, film hub, dan pola co-viewing.
- Setup berbasis Docker memungkinkan seluruh pipeline dan lingkungan modeling dideploy secara lokal dalam hitungan menit.
