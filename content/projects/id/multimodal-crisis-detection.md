---
title: Multimodal crisis-detection model
---

## Masalah
Tanda awal krisis kesehatan mental muncul bersamaan di wajah, postur, dan suara, sehingga model yang hanya membaca satu sinyal melewatkan terlalu banyak kasus.

## Pendekatan
Mengoptimalkan CNN MobileNetV3 untuk emosi wajah dan pose tubuh, pipeline NLP dengan recall tinggi untuk ucapan berbahasa Indonesia, serta mekanisme fusion yang di-tuning untuk presisi. Dilatih pada 11 ribu+ citra dan 1 ribu+ transkrip, lalu dikuantisasi ke 8-bit dan dikompilasi ke HEF untuk akselerator Hailo-8L.

## Hasil
- Akurasi 92,5%, AUC 0,96, F1 0,92.
- False negative yang membahayakan nyawa berkurang 35%.
- Latensi 5–8 ms pada 30+ FPS dengan daya sekitar 2 W, 300–500% lebih cepat daripada CPU; ukuran model berkurang 40% tanpa penurunan akurasi.
