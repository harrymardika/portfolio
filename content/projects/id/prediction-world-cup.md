---
title: FIFA World Cup Match Prediction & Tournament Simulation
---

## Masalah
Memprediksi hasil pertandingan Piala Dunia sulit karena data terbatas dan harus mempertimbangkan kekuatan tim serta performa terbaru, serta saya ingin memperluas prediksi tersebut menjadi simulasi turnamen lengkap.

## Pendekatan
Saya menyaring pertandingan sejak Agustus 2018, menggabungkan peringkat FIFA harian, merancang fitur yang menggambarkan performa terbaru tiap tim, lalu melatih model Gradient Boosting dan Random Forest dengan GridSearchCV. Random Forest terbaik (max_depth=10, max_features='sqrt', dll.) dipakai untuk memprediksi setiap pertandingan dua kali (pertukaran tim) dan probabilitas rata-rata tertinggi menentukan pemenang, sementara hasil yang tidak konsisten dianggap seri. Braket turnamen dibangun dan disimulasikan menggunakan NetworkX.

## Hasil
- Mencapai akurasi uji 70,50% dengan model Random Forest pada 3.695 pertandingan yang telah direkayasa fiturnya.
- Akurasi pelatihan mencapai 84,34% untuk model yang sama.
- Memproses dataset berisi 45.315 hasil pertandingan internasional dari 1872-2023, dengan fokus pada 4.889 pertandingan sejak Agustus 2018 untuk rekayasa fitur.
- Mensimulasikan Piala Dunia 2026 menggunakan susunan grup 2022, memprediksi pemenang grup (Netherlands, England, Argentina, France, Spain, Belgium, Brazil, Portugal) serta final dimana England mengalahkan Argentina dengan probabilitas 0,54.
- Mengimplementasikan seluruh pipeline dalam Jupyter Notebook, memanfaatkan pandas, scikit-learn, dan NetworkX untuk pemrosesan data, pemodelan, dan simulasi braket.
