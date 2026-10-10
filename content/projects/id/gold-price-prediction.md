---
title: Gold Price Prediction (1994–2023)
---

## Masalah
Menganalisis dan memprediksi pergerakan harga emas dalam rentang waktu panjang memerlukan pemodelan interaksi antara indikator makroekonomi dan pasar komoditas. Proyek ini bertujuan untuk membangun dan membandingkan model regresi machine learning pada dataset historis 30 tahun dari 1994 hingga 2023.

## Pendekatan
Saya menggunakan dataset 30 tahun dengan 15 variabel, termasuk suku bunga, inflasi, nilai tukar, dan harga komoditas seperti perak, nikel, dan CPO. Saya melakukan exploratory data analysis, feature engineering menggunakan PCA dan seleksi fitur statistik, serta menguji lebih dari 70 konfigurasi model linier dan berbasis pohon menggunakan PyCaret dan scikit-learn dengan cross-validation dan hyperparameter tuning.

## Hasil
- Mencapai skor R² tertinggi sebesar 0,9899 dan MAPE 3,16% menggunakan Lasso Least Angle Regression dengan seluruh variabel dataset.
- Mengidentifikasi Gradient Boosting Regressor sebagai model pohon terbaik dengan skor R² sebesar 0,9609.
- Latih dan simpan model linier serta berbasis pohon bersama objek preprocessing untuk deployment.
