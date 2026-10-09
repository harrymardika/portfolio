# 0017 · Formulir kesan & pesan: antrean privat di layanan stats, terbit lewat Pull Request

- **Status:** Accepted
- **Tanggal:** 2026-10-09
- **Tugas:** T12.1 (berlaku untuk T12.2–T12.4)

## Konteks
Bagian "Kesan & pesan" di beranda (T9.4) diisi pemilik dengan tangan di `content/messages.yaml`. D15 meminta formulir untuk pengunjung, dengan syarat **tidak ada pesan yang tampil sebelum pemilik menyetujuinya**. Repo GitHub ini publik, jadi pesan yang belum disetujui tidak boleh masuk PR, issue, maupun log Actions. Batasan proyek tetap berlaku: server rumah dengan RAM 1,8 GB, situs statis yang utuh saat server mati, tanpa biaya tetap, tanpa skrip pihak ketiga, dan data pribadi seminimal mungkin.

Keputusan pemilik (2026-10-09): formulir di halaman sendiri; tinjau di halaman privat ber-token (bisa dari HP); pesan yang disetujui otomatis dibuatkan PR (diterjemahkan AI, merge = tayang); tanpa email penulis; notifikasi harian lewat issue GitHub yang hanya berisi jumlah pesan.

## Keputusan
- **Modul `messages` di layanan stats** (`services/stats/messages.ts`), bukan layanan baru. Stats sudah punya Bun, SQLite, volume, dan rute Caddy, sehingga tidak ada container dan memori tambahan. Rute Caddy `/api/messages*`: `no-store`, body maksimal 8 KiB (cukup untuk pesan terpanjang dengan huruf beraksen atau emoji yang dikirim sebagai form biasa), alamat pengunjung diteruskan.
- **File SQLite terpisah** `/data/messages.sqlite` (`secure_delete`, *rollback journal* bukan WAL, karena dengan WAL pesan yang dihapus masih terbaca di file `-wal` sampai *checkpoint*), sengaja **tidak ikut** `backup-stats.sh`. Dengan begitu, pesan yang dihapus benar-benar hilang dan tidak tersisa 14 hari di cadangan. Akibatnya, antrean bisa hilang bila disk rusak (penulis tinggal mengirim ulang).
- **Siklus data:**
  - `pending` → disetujui → `approved` → PR dibuka (T12.4) → **dihapus dari server**;
  - ditolak → langsung dihapus;
  - `pending` yang tidak ditinjau → dihapus setelah 90 hari;
  - `approved` yang PR-nya tidak pernah terbuka (workflow rusak) → dihapus setelah 30 hari.

  Penghapusan berkala berjalan saat layanan mulai dan setiap 6 jam, juga saat formulir sedang ditutup.

  Tidak ada alamat IP, hash pengunjung, maupun email yang disimpan.
- **Pengaman kiriman:**
  - Origin harus dari situs; bot dan honeypot ditolak (honeypot dijawab "terkirim" agar bot tidak belajar).
  - Maksimal 3 kiriman per pengunjung per hari (hash harian di memori, sama seperti chatbot); antrean maksimal 100 pending.
  - Validasi panjang per field; teks tidak boleh berisi nomor HP, email, atau alamat web; tautan hanya profil publik `https://` (bukan tautan chat); centang persetujuan tayang wajib.
- **Token pemilik terpisah** `MESSAGES_ADMIN_TOKEN` (bukan `STATS_ADMIN_TOKEN`), dipakai halaman tinjau dan workflow. Tanpa token, formulir tertutup (503) dan endpoint pemilik tidak ada (404).
- **Tanpa JavaScript tetap bisa mengirim:** form biasa dijawab `303` ke halaman "terkirim"/"belum terkirim" dalam bahasa yang sama. Dengan JavaScript, jawaban JSON berisi masalah per field.
- **Terbit lewat PR (T12.4):** hanya pesan yang **sudah disetujui** yang keluar dari server, ke PR yang menambahkannya ke `content/messages.yaml`. Merge = tayang, sama seperti draf AI (ADR 0013).

## Alternatif yang dipertimbangkan
- **Layanan terpisah:** pemisahan lebih bersih, tetapi menambah container dan memori di server 1,8 GB untuk fitur yang jarang dipakai.
- **Pesan masuk langsung sebagai PR atau issue:** repo publik, sehingga pesan yang belum disetujui akan langsung terbaca semua orang. Ditolak.
- **Layanan formulir pihak ketiga (Formspree, Google Forms, Tally):** data pengunjung keluar ke vendor, skrip atau iframe pihak ketiga, dan CSP harus dilonggarkan.
- **Cloudflare Turnstile:** skrip pihak ketiga dan perubahan CSP. Baru dipertimbangkan bila honeypot dan batas per pengunjung tidak cukup.
- **Simpan di file SQLite stats yang sudah dicadangkan:** penghapusan tidak tuntas selama 14 hari karena masih ada di cadangan.

## Konsekuensi
- Pemilik memasang `MESSAGES_ADMIN_TOKEN` di `/opt/portfolio/.env` dan sebagai secret repo, lalu menyalin `compose.yml` baru ke server (`update.sh` tidak memperbaruinya). docs/10 §3.2.
- Batas per pengunjung direset setiap container dibuat ulang (setiap deploy), sama seperti chatbot. Batas sebenarnya adalah ukuran antrean (100).
- Pesan pengunjung adalah input tak tepercaya: halaman tinjau menampilkannya sebagai teks biasa, dan terjemahan AI di T12.4 memperlakukannya sebagai data.
