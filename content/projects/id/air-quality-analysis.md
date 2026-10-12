---
title: Beijing Air Quality Analysis & Dashboard
---

## Masalah
Data kualitas udara kota tersebar dalam 12 file CSV, sehingga sulit mengidentifikasi penyebab polusi, pola musiman, dan level tidak aman.

## Pendekatan
Saya menggabungkan file, membersihkan nilai yang hilang dengan interpolasi serta imputasi median/mode, melakukan EDA dan analisis korelasi, menjawab enam pertanyaan bisnis dengan visualisasi, dan membuat aplikasi Streamlit yang memungkinkan pengguna menyaring stasiun, polutan, rentang tanggal, menerapkan smoothing EMA/SMA, melihat peringatan, serta mengekspor data.

## Hasil
- Dataset bersih `all_stations_cleaned.csv` berisi 420.768 rekaman per jam telah dibuat.
- Analisis eksplorasi mengungkap CO, NO2, dan SO2 sebagai faktor utama PM2.5 dan PM10, serta menyoroti tren suhu dan tekanan musiman.
- Enam pertanyaan bisnis dijawab dengan grafik, termasuk distribusi polutan per stasiun dan perbandingan kota vs pinggiran.
- Dashboard interaktif Streamlit dengan visualisasi Plotly, smoothing EMA/SMA, peringatan ambang batas, dan ekspor CSV telah di-deploy.
