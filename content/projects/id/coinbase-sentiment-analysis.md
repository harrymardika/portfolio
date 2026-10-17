---
title: Coinbase Review Sentiment Analysis
---

## Masalah
Memahami sentimen pengguna pada ulasan Coinbase di Play Store penting untuk keputusan produk, namun data mentahnya berisik dan tidak seimbang, sehingga analisis manual tidak praktis.

## Pendekatan
Saya melakukan scraping lebih dari 30 ribu ulasan, membersihkan serta melakukan lemmatization teks, memberi label sentimen menggunakan VADER dan rating, menyeimbangkan kelas menjadi 10 ribu sampel per kelas, mengekstrak fitur TF-IDF dan embedding FastText, melatih model ANN, CNN, Random Forest, XGBoost, dan LightGBM, lalu memilih model terbaik berdasarkan akurasi validasi dan uji.

## Hasil
- Mencapai akurasi uji 92,63% menggunakan LightGBM, melampaui target 92%.
- Menyusun dataset seimbang dengan 10 ribu sampel per kelas sentimen untuk pelatihan yang kuat.
- Menerapkan notebook Jupyter yang dapat digunakan kembali mencakup scraping, pembersihan, pelabelan, ekstraksi fitur, pelatihan model, evaluasi, dan inferensi.
- Membandingkan model ML klasik (RF, XGBoost, LightGBM) dan deep learning (ANN, CNN), mendokumentasikan trade-off performa.
- Menyediakan fungsi `predict_sentiment` untuk inferensi mudah pada teks ulasan baru.
