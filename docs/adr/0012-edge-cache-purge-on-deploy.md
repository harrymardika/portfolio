# 0012 · HTML di-cache Cloudflare, dihapus otomatis saat deploy

- **Status:** Accepted
- **Tanggal:** 2026-10-06
- **Melengkapi:** [0005](0005-ci-build-ghcr-pull.md), [0010](0010-update-timer-instead-of-watchtower.md)

## Konteks
Pada 2026-10-06 server rumah mati ±15 menit dan situs ikut mati (Cloudflare error 1033). Caddy mengirim `Cache-Control: max-age=0` untuk HTML agar update langsung terlihat, sehingga Cloudflare tidak menyimpan halaman (`cf-cache-status: DYNAMIC`). *Always Online* hanya menyajikan salinan dari Wayback Machine, yang belum ada untuk situs baru.

## Keputusan
- **Cache Rule Cloudflare** (diatur pemilik): semua path `harry.mardika.my.id` kecuali `/api/` *Eligible for cache*, *Edge TTL* 7 hari mengabaikan header origin, *Browser TTL* mengikuti origin (browser tetap memvalidasi ulang ke Cloudflare).
- **Purge saat deploy:** `docker/deploy/update.sh` membandingkan image `web` sebelum dan sesudah `pull`. Jika berubah, setelah container baru *healthy* (`up --wait`), skrip memanggil API Cloudflare `purge_cache` dengan `{"hosts":["harry.mardika.my.id"]}`. Jika gagal, penanda `.purge-pending` membuat run berikutnya (10 menit) mencoba lagi, dan unit systemd tercatat gagal.
- Token Cloudflare hanya berizin *Zone · Cache Purge · Purge* pada zona `mardika.my.id`, disimpan di `/opt/portfolio/.env` (mode 600). Skrip membaca nilainya tanpa mengeksekusi `.env`, dan mengirim token lewat stdin, bukan argumen, sehingga tidak muncul di daftar proses atau log.

## Alternatif yang dipertimbangkan
- **A. Tanpa cache HTML:** update instan, tetapi situs mati bersama server.
- **B. Edge TTL pendek tanpa purge** (mis. 1 jam): sederhana, tetapi update telat sampai 1 jam dan perlindungan hanya 1 jam.
- **Purge dari GitHub Actions:** image terbit ±10 menit sebelum server memasangnya, jadi purge terlalu awal akan mengisi cache dengan halaman lama.

## Konsekuensi
- Saat server mati, halaman yang pernah dikunjungi dalam 7 hari terakhir tetap tersaji; badge `/homelab` menulis "Sedang offline… salinan Cloudflare" karena `/api/health` (tidak di-cache) gagal. API statistik dan PDF yang belum pernah diminta tidak tersedia selama server mati.
- Build terjadwal tiap 6 jam selalu menghasilkan image baru (PDF tidak byte-identik), jadi cache dihapus ±4×/hari. Halaman diisi lagi oleh pengunjung berikutnya.
- Jika purge gagal terus, konten lama bisa bertahan sampai 7 hari; terlihat dari `systemctl status portfolio-update.service` dan `journalctl -u portfolio-update`.
