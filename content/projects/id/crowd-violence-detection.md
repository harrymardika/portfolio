---
title: Real-time crowd violence detection
---

## Masalah
Tim keamanan tidak bisa memantau semua kamera sekaligus, dan menjalankan model berat pada setiap frame dari setiap stream terlalu mahal.

## Pendekatan
Menggabungkan deteksi YOLO dengan Temporal Shift Module (TSM) untuk action recognition pada beberapa stream RTSP sekaligus. Pipeline "lazy detection" membagi setiap frame menjadi grid 3×3 yang dimodifikasi dan hanya memproses 5 sel aktif, sementara ByteTrack menjaga identitas tetap konsisten. Google Gemini API menambahkan penalaran multimodal di atas hasil deteksi, dan penyimpanan RAG multi-agent dipindahkan dari FAISS lokal ke Qdrant agar query semantik lebih cepat.

## Hasil
- Beban komputasi turun 45% dengan tracking yang tetap akurat.
- Insight kontekstual secara real-time dari rekaman kamera langsung yang tidak terstruktur.
