---
title: ROCm Deep Learning Benchmark Suite
---

## Masalah
Saya perlu memahami dan membandingkan bagaimana framework deep learning Python utama berperilaku dan berkinerja pada perangkat keras GPU AMD ROCm yang sama saat menjalankan workload yang identik.

## Pendekatan
Saya mengembangkan serangkaian Jupyter notebook untuk PyTorch, TensorFlow, dan JAX guna mengukur kernel komputasi tingkat rendah dan workload tingkat tinggi pada AMD Radeon RX 6800S. Rangkaian ini menjalankan pengujian pada perkalian matriks, operasi element-wise, konvolusi, operasi layer, serta training model (CNN dan Transformer), lalu menyimpan statistik eksekusi ke file JSON untuk divisualisasikan dalam notebook perbandingan.

## Hasil
- Membuat script benchmark untuk PyTorch, TensorFlow, dan JAX yang mencakup perkalian matriks hingga ukuran 8192 dan operasi element-wise hingga 100 juta elemen.
- Mengimplementasikan benchmark untuk konfigurasi training dan inference pada model standar CNN (ResNet-18) dan Transformer.
- Merancang sistem untuk mencatat latency, throughput, bandwidth transfer memori, dan overhead kompilasi JIT pada JAX, lalu mengekspor hasilnya sebagai file JSON terstruktur.
- Membangun notebook visualisasi untuk menghasilkan grafik perbandingan lintas framework untuk analisis performa multi-dimensi.
