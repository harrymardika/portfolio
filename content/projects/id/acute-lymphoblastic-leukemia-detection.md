---
title: Acute lymphoblastic leukemia detection
---

## Masalah
Saya membutuhkan metode otomatis dengan akurasi tinggi untuk mengklasifikasikan citra smear darah perifer menjadi sel normal dan tiga subtipe ALL, sehingga skrining dapat dilakukan lebih cepat dan non-invasif di rumah sakit.

## Pendekatan
Saya mengumpulkan dataset PBS berisi 3.256 gambar, melakukan augmentasi, dan melatih tiga arsitektur—VGG16 fine-tune, VGG16 baseline, serta CNN custom ringan—dengan TensorFlow/Keras. Setelah mengevaluasi akurasi, jumlah parameter, dan kecepatan inferensi, saya memilih VGG16 baseline untuk produksi dan CNN untuk deployment di perangkat edge. Selanjutnya saya mengemas model terpilih ke dalam aplikasi Streamlit modular yang memuat model MobileNetV2 + CBAM, memproses gambar yang di-upload, dan menampilkan skor kepercayaan menggunakan Plotly.

## Hasil
- Melatih tiga classifier deep learning (VGG16 Fine-Tune, VGG16 Baseline, CNN custom) dengan akurasi hingga 98,62%.
- Membuat CNN ringan dengan hanya 127 rb parameter yang cocok untuk deployment mobile/edge dengan tetap mempertahankan akurasi 95%.
- Mengemas model VGG16 Baseline untuk integrasi produksi klinis.
- Membangun dashboard Streamlit modular yang memuat model MobileNetV2 + CBAM dan memberikan klasifikasi sel darah secara real-time dengan visualisasi kepercayaan.
- Menyusun basis kode dengan clean architecture, memungkinkan ekstensi mudah dan pipeline pelatihan yang dapat direproduksi.
