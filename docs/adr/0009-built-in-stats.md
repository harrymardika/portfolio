# 0009 · Statistik bawaan di situs, tanpa layanan analytics terpisah

- **Status:** Accepted
- **Tanggal:** 2026-10-05
- **Menggantikan:** [0004](0004-umami-analytics.md)

## Konteks
Pemilik tidak ingin layanan analytics terpisah (dashboard Umami di subdomain lain), tetapi ingin statistik kunjungan dan unduhan **tampil langsung di harry.mardika.my.id**. Server rumah hanya punya Celeron N3050 2 core dan RAM 1,8 GB, sehingga Umami + Postgres terlalu berat. Halaman HTML disajikan dari cache Cloudflare, jadi server tidak melihat setiap kunjungan.

## Keputusan
Layanan statistik kecil milik sendiri di stack yang sama:

- **`stats`**: service Bun + SQLite (file di volume Docker) di `docker/compose.yml`, diakses lewat Caddy di **domain yang sama** pada `/api/stats/*`. Tidak ada subdomain, tidak ada script pihak ketiga.
- **Pengumpulan:** skrip kecil di halaman mengirim `navigator.sendBeacon('/api/stats/event', …)` untuk tampilan halaman, unduhan CV/Portfolio, dan klik ke profil sosial. Beacon (POST) tidak di-cache Cloudflare, jadi tetap tercatat walau HTML dari cache.
- **Privasi:** tanpa cookie dan tanpa menyimpan IP. Pengunjung unik harian dihitung dari `SHA-256(IP + User-Agent + salt harian)`; salt acak diganti setiap hari dan dibuang, sehingga hash tidak bisa dikembalikan ke orang. Header *Do Not Track* / *Global Privacy Control* dihormati. Bot dan crawler diabaikan. Negara diambil dari header `CF-IPCountry`.
- **Tampilan publik:** bagian statistik di situs (EN/ID) berisi total pengunjung, tampilan halaman, unduhan CV dan Portfolio, halaman terpopuler, sumber trafik (hanya nama domain), dan negara. Data diambil dari `GET /api/stats/summary` (cache 5 menit). Jika server mati, bagian ini menampilkan "—" dan situs tetap jalan.
- **Data privat untuk pemilik:** asal lamaran dari tautan `?ref=` **tidak pernah ditampilkan publik** (bisa membocorkan perusahaan yang dilamar). Data ini hanya bisa dilihat lewat `GET /api/stats/private` dengan token dari `.env`, atau dengan skrip laporan.

## Alternatif yang dipertimbangkan
- **Umami self-hosted (ADR 0004):** dashboard terpisah dan Postgres terlalu berat untuk server 1,8 GB.
- **Cloudflare Web Analytics:** gratis, tetapi datanya di dashboard Cloudflare, tidak bisa ditampilkan di situs tanpa API berbayar, dan tidak punya event unduhan.
- **Log Caddy:** tidak melihat kunjungan yang dilayani dari cache Cloudflare.
- **Counter dari layanan pihak ketiga:** data di pihak lain dan menambah script eksternal.

## Konsekuensi
- Situs tetap statis; statistik adalah fitur tambahan yang boleh gagal tanpa merusak halaman.
- Ada satu service kecil (± 30–50 MB RAM) dan satu file SQLite yang perlu di-backup.
- Implementasi di Fase 5 (T5.1–T5.5). Semua event didefinisikan di satu tempat dan dites.
