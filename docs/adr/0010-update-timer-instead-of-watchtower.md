# 0010 · systemd timer, bukan Watchtower, untuk menarik image baru

- **Status:** Accepted
- **Tanggal:** 2026-10-05
- **Menggantikan:** bagian Watchtower di [0005](0005-ci-build-ghcr-pull.md) (build di GitHub Actions dan pull dari GHCR tetap berlaku)

## Konteks
ADR 0005 merencanakan Watchtower untuk menarik image baru di server rumah. Pada 2026-10-05 ditemukan bahwa repositori `containrrr/watchtower` sudah **diarsipkan** (tidak dirawat sejak Desember 2025). Ada fork yang aktif, tetapi Watchtower apa pun membutuhkan akses Docker socket (setara root di server) dan menambah satu container di mesin dengan RAM 1,8 GB.

## Keputusan
Skrip kecil `docker/deploy/update.sh` (`docker compose pull` → `up -d` → hapus image lama) dijalankan setiap 10 menit oleh **systemd timer** (`portfolio-update.timer`). Tidak ada container tambahan dan tidak ada pihak ketiga yang memegang Docker socket.

## Alternatif yang dipertimbangkan
- **Fork Watchtower (nicholas-fedor/watchtower):** dirawat, tetapi tetap pihak ketiga dengan akses setara root dan memakan RAM.
- **Webhook dari GitHub Actions ke server:** butuh endpoint masuk, bertentangan dengan prinsip "tanpa port terbuka".
- **Self-hosted runner:** sudah ditolak di ADR 0005.

## Konsekuensi
- Jeda deploy maksimal ±10 menit setelah image terbit.
- Pemilik memasang dua unit systemd sekali saja (`docs/07-deployment.md`).
- Rollback tetap sama: isi `TAG=sha-<commit>` di `.env` lalu jalankan `update.sh`.
