---
title: ROCm Deep Learning Benchmark Suite
---

## Masalah
Framework deep learning memiliki karakteristik performa yang berbeda pada perangkat keras AMD ROCm di berbagai operasi dasar dan arsitektur jaringan saraf. Saya membutuhkan cara terstandar untuk mengukur operasi matriks, aktivasi layer, throughput pelatihan model, serta kecepatan transfer memori antara PyTorch, TensorFlow, dan JAX.

## Pendekatan
Saya membangun suite benchmark menggunakan Jupyter Notebook (`pytorch.ipynb`, `tensorflow.ipynb`, `jax.ipynb`, dan `comparison.ipynb`) yang ditujukan untuk GPU AMD Radeon RX 6800S. Suite ini mengukur kernel matriks dan konvolusi tingkat rendah, tipe layer umum, beban kerja pelatihan CNN dan Transformer, bandwidth memori, serta overhead kompilasi JIT pada JAX, lalu menyimpan metrik eksekusi ke berkas JSON untuk visualisasi otomatis.

## Hasil
- Mencatat PyTorch mencapai throughput perkalian matriks puncak tertinggi sebesar 14,54 TFLOPS untuk float16 dan 7,87 TFLOPS untuk float32.
- Mengukur PyTorch memimpin pelatihan dan inferensi CNN pada model mirip ResNet-18, mencapai 1.864,6 gambar/dtk saat inferensi batch 32.
- Menemukan JAX menyamai performa PyTorch pada pelatihan transformer mirip BERT-base sebesar 265,5 sampel/dtk, sambil mencatat biaya kompilasi JIT JAX pada eksekusi fungsi pertama.
- Menghasilkan grafik visualisasi komparatif untuk operasi matriks, layer element-wise, pelatihan model, dan bandwidth transfer memori host-to-device.
