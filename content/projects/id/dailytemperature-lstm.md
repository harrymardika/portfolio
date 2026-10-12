---
title: Daily Temperature Forecasting in Japan with Stacked LSTM
---

## Masalah
Saya perlu memprakirakan suhu harian rata-rata di Jepang menggunakan data historis cuaca time series. Dataset sumber berisi jutaan catatan global dengan nilai hilang dan outlier yang memerlukan pra-pemrosesan bersih serta pengkondisian sekuensi untuk pemodelan jaringan saraf.

## Pendekatan
Saya memfilter 27.798 catatan data Jepang, menghapus outlier dan nilai hilang dengan metode IQR, serta membagi data secara kronologis menjadi set pelatihan, validasi, dan pengujian. Menggunakan MinMaxScaler, saya membuat jendela 100 hari untuk melatih jaringan stacked LSTM 5 layer (64-128-256-128-64 unit) dengan layer Dropout, Huber loss, dan pengoptimalkan Adam. Saya mengimplementasikan callback untuk early stopping, model checkpointing, penurunan learning rate, dan pemicu ambang batas MAE kustom.

## Hasil
- Mencapai MAE pelatihan sebesar 0,0497 dan MAE validasi sebesar 0,0440 pada data suhu berskala min-max.
- Mencapai ambang batas target MAE di bawah 0,05 pada set pelatihan dan validasi, menghentikan pelatihan secara otomatis pada epoh 34 dari 100.
- Mengevaluasi hasil prediksi model terhadap nilai suhu aktual pada set pengujian sebanyak 5.540 catatan data.
