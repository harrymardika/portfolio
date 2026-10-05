# 0005 · Build di GitHub Actions, image di GHCR, server hanya menarik image

- **Status:** Accepted
- **Tanggal:** 2026-10-05
- **Mengubah:** SRS PDF §5.4 Opsi 2 (self-hosted runner)

## Konteks
SRS menawarkan webhook (`git pull && docker compose up --build` di server) atau self-hosted GitHub runner. Repo bersifat publik.

## Keputusan
**GitHub Actions** (runner milik GitHub) membangun image Docker, lalu push ke **GHCR**. Home server hanya menarik image baru dengan **Watchtower**. Web disajikan oleh **Caddy** di dalam image.

## Alternatif yang dipertimbangkan
- **Self-hosted runner:** pada repo publik, pull request dari fork dapat menjalankan kode di server rumah. Risiko keamanan terlalu besar.
- **Webhook + build di server:** server memerlukan toolchain build, mengonsumsi CPU, dan membuka endpoint webhook.

## Konsekuensi
- Server tidak pernah menjalankan kode build dan tidak membuka endpoint masuk.
- Rollback mudah lewat tag image `sha-*`.
- Deploy bergantung pada GitHub Actions dan GHCR yang tersedia.
