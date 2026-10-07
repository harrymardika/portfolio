---
title: Real-Time Unusual Behavior Detection with Gemini Vision
---

## Masalah

Saya membutuhkan cara untuk mendeteksi perilaku tidak wajar pada rekaman kamera keamanan secara langsung tanpa melatih detector khusus, dengan pemrosesan yang tetap cukup cepat untuk pemantauan real-time.

## Pendekatan

Saya membangun pipeline asinkron yang mengambil frame dari kamera lokal atau RTSP, mengambil sampel setiap 500 ms, lalu mengirim setiap frame ke Gemini API dengan system prompt yang berisi kamus anomali. Model mengembalikan JSON terstruktur berisi koordinat ternormalisasi dan label prioritas, yang saya petakan kembali ke resolusi video asli untuk menggambar bounding box dengan OpenCV, sambil menjaga UI tetap responsif lewat multithreading.

## Hasil

- Frame sampling 2 fps untuk menekan latensi dan biaya API
- Integrasi Gemini Vision API untuk deteksi zero-shot objek dan perilaku anomali
- Output JSON terstruktur dengan koordinat ternormalisasi 0–1000 dan label prioritas
- Bounding box real-time dan dashboard keamanan dengan OpenCV tanpa UI yang membeku
- Kamus anomali mudah diperbarui lewat system prompt yang bisa dikonfigurasi
