---
title: Self-hosted portfolio platform
---

## Masalah
Saya ingin portfolio yang selalu terbarui tanpa kerja manual: satu tempat untuk mengedit, CV dan PDF portfolio yang tidak pernah berbeda dari website, proyek GitHub yang muncul dengan sendirinya, dan statistik pengunjung tanpa pelacak pihak ketiga. Semuanya harus berjalan di perangkat yang sudah saya punya, laptop lama dengan Celeron 2 core dan RAM 1,8 GB, tanpa membuka satu port pun di router rumah.

## Pendekatan
- **Satu sumber data.** Semua isi disimpan dalam file YAML dan Markdown yang diperiksa skema Zod. Website (Astro, dalam bahasa Inggris dan Indonesia) dan kedua PDF (dicetak oleh Playwright) dibuat dari file tersebut, sehingga data yang salah menggagalkan build alih-alih sampai ke pengunjung.
- **Build di CI, bukan di server.** GitHub Actions menjalankan type check, unit test, end-to-end test di desktop dan mobile, serta batas skor Lighthouse, lalu menerbitkan image Docker. Laptop hanya menarik image baru sesuai jadwal, dan file teks dikompresi saat build sehingga CPU-nya tidak pernah mengompresi saat ada permintaan.
- **Terbuka dengan aman.** Cloudflare Tunnel hanya membuat koneksi keluar. Cloudflare menyimpan halaman selama seminggu, jadi halaman yang baru dikunjungi tetap tersedia saat server mati, dan setiap deploy menghapus cache tersebut. Setiap build membuat content security policy dengan hash untuk setiap inline script.
- **Mudah diperbarui.** Perubahan dari browser lewat Pages CMS menjadi commit yang melewati pemeriksaan yang sama. Memberi topic `portfolio` pada repository GitHub akan menambahkannya ke situs, dan job harian meminta Gemini (dengan Groq sebagai cadangan) menulis draf studi kasusnya dari README sebagai pull request. Jawaban model diperlakukan sebagai data yang tidak tepercaya, dan angka utama yang tidak tertulis di README dibuang.
- **3D sebagai tambahan.** Scene Three.js hanya dimuat di perangkat yang mampu; setiap halaman tetap lengkap tanpa WebGL atau JavaScript.
- **Statistik sendiri.** Layanan kecil berbasis Bun dan SQLite menghitung kunjungan dan unduhan tanpa cookie dan tanpa menyimpan alamat IP.

## Hasil
- Skor performa Lighthouse minimal 90, serta aksesibilitas, best practices, dan SEO minimal 95, di enam halaman utama, diperiksa sebelum setiap deploy.
- Nilai A+ di Mozilla HTTP Observatory.
- Saat diukur, server web dan layanan statistik bersama-sama memakai sekitar 39 MiB RAM, dan perubahan yang disimpan tayang dalam sekitar 20 menit.
