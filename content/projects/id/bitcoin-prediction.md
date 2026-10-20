---
title: Bitcoin Price Prediction with LSTM and CNN-LSTM
---

## Masalah
Volatilitas harga Bitcoin yang sangat tinggi membuat perkiraan jangka pendek yang akurat penting bagi trader, investor, dan institusi, namun perilaku non-linear dan non-stationary menimbulkan tantangan pemodelan yang signifikan.

## Pendekatan
Saya membersihkan data historis OHLCV (1 Jan 2016 – 2 Mei 2025), melakukan rekayasa fitur (lag, statistik rolling, fitur berbasis tanggal), lalu membangun dua pipeline deep-learning: LSTM standar dan hybrid CNN-LSTM yang mengekstrak pola lokal sebelum pemodelan temporal. Kedua model dilatih dan dievaluasi pada pembagian train-test yang sama.

## Hasil
- Membuat dataset bersih berisi 3.380 baris dan 21 fitur hasil rekayasa.
- Mengimplementasikan serta melatih model LSTM standar dan model hybrid CNN-LSTM dengan data pelatihan yang sama.
- Mengevaluasi kedua model pada data uji dengan metrik MAE, RMSE, dan MAPE untuk perbandingan kuantitatif.
- Memvisualisasikan prediksi dibandingkan harga penutupan aktual untuk menilai kualitas peramalan.
