---
title: Javanese script (Aksara Jawa) classification
---

## Masalah
Banyak aksara Jawa memiliki goresan yang hampir sama, sehingga sebuah classifier bisa menebak benar dengan alasan yang keliru. Akurasi saja tidak menunjukkan apa yang sebenarnya dipelajari model.

## Pendekatan
Melakukan fine-tuning model klasifikasi YOLO26 nano di PyTorch pada 20 aksara dasar, dengan preprocessing dataset otomatis, mixed precision, dan class weighting untuk data yang tidak seimbang. Selama training, bobot setiap convolution layer dicatat di tiap epoch untuk menelusuri bagaimana kernel berubah, bagaimana setiap blok mengubah input, dan bagaimana confidence softmax bergeser di antara aksara yang mirip.

## Hasil
- Akurasi 96% dan macro F1 0,97 pada test set terpisah berisi 25 citra dari 20 aksara, dengan akurasi validasi puncak 99,6%. Test set-nya kecil, jadi satu sampel saja bisa menggeser skor per kelas cukup jauh.
- Alat visual yang membuat proses belajar jaringan bisa diperiksa, epoch demi epoch.
- Berhasil dipertahankan sebagai skripsi saya di Universitas Gunadarma: “Klasifikasi Aksara Jawa Berbasis YOLO26 dengan Visualisasi dan Interpretasi Filter Konvolusi”.
