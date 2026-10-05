# 0004 · Analytics dengan Umami self-hosted

- **Status:** Accepted
- **Tanggal:** 2026-10-05

## Konteks
Pemilik ingin tahu jumlah pengunjung, unduhan CV/Portfolio, dan sumber trafik, tanpa mengorbankan privasi atau performa.

## Keputusan
Gunakan **Umami** self-hosted (Docker + Postgres) di home server, dengan custom event untuk unduhan dan klik keluar.

## Alternatif yang dipertimbangkan
- **Google Analytics:** cookie dan banner persetujuan, script berat, data di pihak ketiga.
- **Cloudflare Web Analytics:** gratis dan ringan, tetapi tanpa custom event yang memadai.
- **Plausible self-hosted:** setara, tetapi membutuhkan ClickHouse yang lebih berat untuk home server.

## Konsekuensi
- Tanpa cookie, data milik sendiri, dan menjadi nilai tambah showcase DevOps.
- Ada satu layanan tambahan (dan database) yang harus dirawat serta di-backup.
