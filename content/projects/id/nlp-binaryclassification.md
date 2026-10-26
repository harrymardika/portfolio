---
title: IMDB Movie Review Sentiment Classification
---

## Masalah
Mengklasifikasikan ulasan film menjadi sentimen positif atau negatif memerlukan pembersihan teks bahasa alami yang tidak terstruktur dan pembangunan jaringan saraf yang menghindari overfitting pada teks pelatihan.

## Pendekatan
Saya memproses 50.000 ulasan IMDB dengan menghapus tag HTML dan karakter non-huruf, menghapus stopword, serta melakukan lematisasi kata kerja dengan NLTK. Menggunakan Keras Tokenizer dengan vokabulari 25.000 kata, sekuens dipadatkan hingga 100 token dan dilatih dengan pembagian data latih-uji 80/20. Arsitektur model terdiri dari embedding layer, Bidirectional LSTM dengan dropout, global max pooling, dense layer dengan regularisasi L2, dan output sigmoid yang dilatih menggunakan Adam serta early stopping.

## Hasil
- Mencapai akurasi validasi terbaik sebesar 87,90% dan validation loss sebesar 0,3241 pada epoch 3.
- Berhasil memicu early stopping pada epoch 8 dari 20 untuk menghentikan pelatihan dan mengembalikan bobot optimal dari epoch 3.
- Membangun pipeline pemrosesan teks dan klasifikasi lengkap yang mampu memprediksi masukan ulasan uji positif dan negatif dengan benar.
