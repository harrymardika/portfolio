---
title: NOVA AI Backend
---

## Masalah
Aplikasi AI multimodal membutuhkan autentikasi pengguna yang aman, penyimpanan sesi chat yang persisten, dan integrasi media agar pengguna dapat mempertahankan konteks percakapan antar sesi tanpa mengorbankan kontrol akses data.

## Pendekatan
Saya membangun API Express menggunakan Bun dan MongoDB dengan model Mongoose untuk mengelola riwayat percakapan per pengguna. Saya mengintegrasikan Clerk untuk menerapkan kontrol akses tingkat pengguna di semua rute chat dan menambahkan tanda tangan endpoint ImageKit untuk unggahan gambar langsung dari sisi client. Saya juga menyetel aplikasi Express untuk menyajikan aset build frontend statis demi kelancaran deployment di Vercel.

## Hasil
- Membangun endpoint REST terproteksi untuk membuat, menampilkan, memperbarui, dan menghapus riwayat chat per pengguna menggunakan autentikasi Clerk.
- Mendesain model data MongoDB terstruktur untuk mengelola riwayat percakapan dengan judul chat yang dibuat otomatis berdasarkan pesan pertama.
- Mengimplementasikan pembuatan parameter terautentikasi ImageKit untuk mendukung unggahan gambar pada interaksi prompt multimodal.
- Mengonfigurasi penyajian aset statis untuk memungkinkan hosting deployment tunggal di Vercel.
