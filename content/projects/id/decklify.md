---
title: Decklify
---

## Masalah
Membuat presentasi menuntut dua kemampuan sekaligus, merangkum isi dan mendesain slide, dan tidak banyak orang menguasai keduanya. Dalam riset pasar kami terhadap 38 responden (sebagian besar mahasiswa), **92,1%** butuh lebih dari 30 menit untuk satu presentasi, dan desain visual menjadi bagian tersulit (73,7%). Kebanyakan sudah memakai beberapa alat terpisah: satu untuk merangkum, satu lagi untuk mendesain. Alat global memakai langganan bulanan dalam dolar dan kurang baik mengolah dokumen panjang berbahasa Indonesia.

## Pendekatan
Decklify berawal dari hibah kewirausahaan mahasiswa nasional (PKM-K 2026) yang saya pimpin sebagai CEO tim lima orang, 22 Mei sampai 3 Oktober 2026. Bagian saya adalah perencanaan dan evaluasi; kodenya ditulis CTO kami.

- **Desain sistem:** saya merancang arsitektur layanannya: studio Next.js, API Go, PostgreSQL, penyimpanan objek, dan pipeline AI yang menyusun bagian dan alur cerita lebih dulu, baru menerapkan templat, sehingga draf terstruktur siap dalam kurang dari 20 detik. Pengguna bisa mulai dari perintah singkat, Markdown, PDF, DOCX, atau PPTX lama, lalu mengekspor ke PPTX dan PDF yang tetap bisa disunting. Pembayaran lewat gerbang pembayaran lokal (QRIS dan virtual account) berupa kredit prabayar dalam rupiah.
- **Infrastruktur:** saya merakit dan menjalankan server usaha sendiri berbasis Debian 13, dengan Docker dan Cloudflare Tunnel sehingga server tidak pernah terbuka langsung ke internet. Karena server milik sendiri, biaya tetap hanya Rp428.862 per bulan.
- **Evaluasi:** saya merencanakan dan menjalankan pemeriksaan mutu di sepanjang 25 iterasi pengembangan: uji beban 40 akun yang masing-masing menjalankan 5 generasi serentak, dua FGD bersama pakar, tiga validasi calon pengguna (termasuk pelaku UMKM), lima uji coba produk, dan kuesioner pengguna. Masukan langsung masuk ke iterasi berikutnya, misalnya tampilan seluler dan riwayat generasi.
- **Bisnis dan legalitas:** saya menyusun model biaya dan analisis titik impas, menulis proposal, laporan kemajuan dan laporan akhir, serta artikel ilmiah, mengelola logbook kegiatan dan keuangan, dan mengurus NIB, pencatatan hak cipta program dan logo, permohonan merek, serta kerja sama dengan Inkubator Bisnis Universitas Gunadarma.

## Hasil
- **Daring di decklify.id sejak 27 Agustus 2026**, tiga bulan setelah program dimulai; lebih dari 50 akun dan 100 presentasi hingga akhir program.
- Uji beban: **200 generasi serentak tanpa galat**, median waktu antrean 3,06 detik.
- Kuesioner (38 responden): kemudahan **8,39/10**, relevansi 8,26/10, dan **NPS +45**.
- **Margin kontribusi 83,68%** per paket berbayar dan titik impas 11 paket per bulan; **45 transaksi berbayar** pada Oktober 2026, bulan pertama ada pembeli, sebagian besar lewat kampanye voucher peluncuran.
- Dana hibah Rp8.125.000 terealisasi dan dilaporkan 100%, dalam 82 kegiatan yang tervalidasi di SIMBelmawa. Semua luaran wajib tercapai, ditambah buku manual, dua sertifikat hak cipta, NIB, dan permohonan merek.
- Terpilih sebagai **finalis PIMNAS 2026**, Pekan Ilmiah Mahasiswa Nasional.

## Yang saya pelajari
- **Produk:** mengubah ide menjadi sesuatu yang dipakai dan dibayar orang, mulai dari memutuskan apa yang dibangun lebih dulu hingga membiarkan hasil uji dan masukan pengguna membentuk iterasi berikutnya.
- **Memimpin tanpa menulis kodenya:** merancang sistem cukup jelas sehingga tim bisa membangunnya, lalu memeriksa hasilnya dengan uji sungguhan, bukan sekadar percaya pada demo.
- **Menjalankan bisnis:** model biaya dan titik impas, laporan keuangan yang jujur, izin usaha, dan kekayaan intelektual.
