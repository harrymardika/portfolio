---
title: Video Emotion Classification for Satria Data 2025
---

## Masalah
Mengklasifikasikan emosi manusia ke dalam 8 kategori dari konten reels Instagram sangat menantang karena sifat data multimodal (video, audio, teks) yang kompleks serta ketidakseimbangan kelas yang signifikan, di mana kategori 'Surprise' mendominasi sekitar 50% dataset.

## Pendekatan
Saya membangun pipeline pemrosesan multimodal untuk mengekstrak fitur visual, audio (MFCC dan spektral), serta transkripsi teks dari 803 sampel data latih. Saya kemudian mengembangkan dan mengoptimalkan model machine learning, utamanya menggunakan CatBoost dan teknik ensemble voting yang dievaluasi dengan stratified cross-validation.

## Hasil
- Mencapai akurasi validasi sebesar 41% dan F1-score 0,254 menggunakan ensemble Voting Classifier.
- Merancang pipeline pemrosesan end-to-end yang mencakup ekstraksi fitur dari data audio, video, dan teks.
- Membuat workflow khusus untuk labelisasi data otomatis dan analisis submission untuk menganalisis performa model di setiap kelas emosi.
