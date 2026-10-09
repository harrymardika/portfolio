---
title: Sentiment Analysis for Hatred Speech Detection
---

## Masalah
Platform media sosial berisi konten buatan pengguna dalam jumlah sangat besar yang memerlukan moderasi otomatis secara cepat untuk menyaring ujaran kebencian dan menganalisis sentimen publik. Untuk membangun sistem moderasi yang efektif, diperlukan pemrosesan awal (preprocessing) teks media sosial yang tidak terstruktur secara sistematis serta perbandingan berbagai arsitektur deep learning untuk menentukan model terbaik dalam menangani konteks dan urutan kata.

## Pendekatan
Saya membangun pipeline text preprocessing menggunakan pustaka seperti NLTK, contractions, dan emoji untuk membersihkan tweet mentah dengan memperluas singkatan kata, mengubah emoji menjadi teks, serta menerapkan lemmatization. Saya melabeli dataset menggunakan VADER sentiment analyzer untuk menyeimbangkan kelas dengan masing-masing 6.000 sampel per sentimen, lalu melatih serta membandingkan empat arsitektur berbeda: fine-tuned BERT (PyTorch), RNN, LSTM, dan Deep CNN (TensorFlow/Keras).

## Hasil
- Mengembangkan pipeline preprocessing yang kuat untuk menangani masalah teks khas media sosial termasuk kontraksi kata, emoji, URL, mention, dan lemmatization.
- Membuat dataset yang seimbang dengan 6.000 sampel per kelas sentimen menggunakan pelabelan otomatis VADER sentiment.
- Menerapkan dan membandingkan empat arsitektur deep learning yang berbeda (BERT, LSTM, Deep CNN, dan RNN) untuk klasifikasi tweet.
