---
title: Humidity IoT System
---

## Masalah
Untuk tugas SIC 5, saya perlu membangun sistem telemetri perangkat keras terhubung yang membaca kondisi lingkungan sekitar dan menyediakan data real-time untuk aplikasi eksternal.

## Pendekatan
Saya menulis firmware C++ untuk ESP32 guna mengumpulkan pembacaan suhu dan kelembapan dari sensor DHT11 di GPIO 4, menangani timestamp NTP, dan mengirimkan HTTP POST setiap 2 detik melalui tunnel ngrok. Di sisi backend, saya membangun REST API Flask modular dengan Python dan dukungan CORS untuk menyimpan pembacaan sensor terbaru di memori, serta menyediakan opsi penerima Paho MQTT yang berlangganan topik di broker publik.

## Hasil
- Memprogram firmware ESP32 dengan penanganan error untuk pembacaan sensor yang tidak valid, sinkronisasi waktu NTP, dan pemantauan HTTP POST.
- Membuat REST API Flask modular yang menyediakan endpoint khusus untuk telemetri lengkap, data suhu terpisah, dan data kelembapan terpisah.
- Mengimplementasikan integrasi klien MQTT alternatif menggunakan Paho untuk menerima dan memproses telemetri dari topik test.mosquitto.org.
