---
title: Facial Expression Recognition (FER) Classification
---

## Masalah
Saya harus membuat model yang dapat mengenali ekspresi wajah manusia dari gambar grayscale beresolusi rendah, dengan tantangan dataset tidak seimbang dan sumber daya komputasi terbatas.

## Pendekatan
Saya merancang dua pipeline: CNN ringan yang dilatih langsung pada dataset FER 48×48 grayscale, dan pipeline transfer learning dengan MobileNetV2 yang dipra-latih pada ImageNet. Kedua model dilatih, dievaluasi menggunakan classification report dan confusion matrix, dan model dengan performa terbaik disimpan untuk inference.

## Hasil
- Baseline CNN mencapai akurasi 59,3%, mengungguli model transfer learning MobileNetV2 (54,7%).
- Model memperoleh presisi keseluruhan 0,60 dan skor F1 0,59 untuk tujuh kelas emosi.
- Analisis per kelas menunjukkan Happy dan Surprise paling mudah terdeteksi, sementara Fear dan Disgust paling sulit karena ketidakseimbangan kelas.
- Studi ini menjelaskan mengapa CNN sederhana mengungguli jaringan pretrained yang kompleks pada dataset khusus domain berwarna grayscale ini.
- Diberikan rekomendasi untuk fine-tuning, augmentasi data, dan penyesuaian bobot kelas guna meningkatkan performa lebih lanjut.
