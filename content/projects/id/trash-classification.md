---
title: 'Trash Classification: Recyclable vs. Other Waste'
---

## Masalah
Memilah sampah secara manual menjadi kategori daur ulang dan non-daur ulang kurang efisien. Saya membutuhkan model klasifikasi gambar otomatis yang ringan untuk dijalankan secara efisien di perangkat seluler dan edge.

## Pendekatan
Saya membangun pipeline klasifikasi menggunakan transfer learning dengan arsitektur EfficientNetV2M pretrained ImageNet di TensorFlow/Keras. Saya melakukan pra-pemrosesan dan mengubah ukuran 12.000 gambar menjadi 200x200 piksel menggunakan OpenCV, menerapkan augmentasi data, serta menambahkan layer konvolusi dan dense kustom dengan dropout untuk regularisasi. Model dilatih menggunakan optimizer Adam dengan early stopping dan model checkpointing, lalu dikonversi ke format TensorFlow Lite untuk deployment di perangkat edge.

## Hasil
- Mencapai akurasi validasi sebesar 93,00% dan akurasi pelatihan sebesar 97,06% dalam 34 epoch.
- Memproses subset dataset seimbang sebanyak 12.000 gambar yang dibagi menjadi 9.600 gambar pelatihan dan 2.400 gambar validasi.
- Mengekspor model terlatih ke format TensorFlow Lite (`best_model.tflite`) untuk deployment ringan di perangkat edge.
