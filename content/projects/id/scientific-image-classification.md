---
title: Multi-Class Scientific Image Classification with Transfer Learning
---

## Masalah
Analisis citra ilmiah membutuhkan pembedaan antara kategori visual khusus seperti Blot-Gel, FACS, Histopathology, Macroscopy, Microscopy, dan gambar non-ilmiah, yang rentan mengalami ketidakseimbangan kelas pada dataset mentah.

## Pendekatan
Saya mengembangkan pipeline end-to-end dalam `Python 3.9` dan `TensorFlow 2.10` menggunakan `main.ipynb`. Saya melakukan sampling pada kelas mayoritas hingga 2.000 gambar per kelas, membangun pipeline data teroptimasi dengan augmentasi menggunakan `tf.data`, dan menerapkan transfer learning dengan backbone MobileNetV2. Saya mengelola pelatihan menggunakan callback EarlyStopping dan ReduceLROnPlateau serta mengonversi model terlatih ke format SavedModel, TF-Lite, dan TensorFlow.js.

## Hasil
- Mencapai akurasi pengujian sekitar 96,34% di seluruh 6 kategori citra ilmiah.
- Menyeimbangkan dataset dengan membatasi kelas mayoritas pada 2.000 sampel per kelas.
- Berhasil mengekspor artefak model ke format SavedModel, TensorFlow Lite, dan TensorFlow.js untuk berbagai skenario deployment.
