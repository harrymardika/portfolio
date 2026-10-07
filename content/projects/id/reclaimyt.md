---
title: Reclaimyt waste-sorting conveyor
---

## Masalah
Sampah masih dipilah dengan tangan, yang memakan waktu dan tenaga. Reclaimyt mengotomatiskan langkah itu: sensor mendeteksi setiap barang di konveyor, lalu sistem memisahkannya ke tempat sampah yang tepat.

## Pendekatan
Tim beranggotakan empat orang membangun belt conveyor berkamera yang dikendalikan ESP32, dengan gerbang bertenaga servo yang mendorong setiap barang ke tempatnya. Sebagai ML engineer, saya mengumpulkan dan menyiapkan data citra, membangun, melatih, dan bereksperimen dengan model computer vision, mengevaluasinya, lalu men-deploy model akhir untuk menentukan keputusan pemilahan.

![Sketsa desain konveyor: tiga pilihan tata letak, komponen, dan belt berukuran 80 × 15 cm](../../media/projects/reclaimyt-design.webp)

## Hasil
- Akurasi validasi 90,9%.
- Prototipe yang berfungsi untuk mengklasifikasikan dan memilah barang di atas belt.
- Finalis 10 besar Samsung Innovation Campus Batch 5 (April–Juli 2024).

![Prototipe yang berfungsi: belt conveyor dengan kamera ponsel pada penyangga, pemilah servo, dan rangkaian kabel ESP32](../../media/projects/reclaimyt-prototype.webp)
