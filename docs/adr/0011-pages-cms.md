# 0011 · Pages CMS untuk mengedit `content/` dari browser

- **Status:** Accepted
- **Tanggal:** 2026-10-06
- **Tugas:** T8.1

## Konteks
Isi web, CV, dan Portfolio PDF berasal dari `content/` (ADR 0002). Mengubahnya berarti mengedit YAML/Markdown lalu commit, yang tidak nyaman dari HP dan rawan salah format. Pemilik ingin web "mudah di-update". Batasannya: situs statis yang disajikan Caddy di server dengan RAM 1,8 GB (ADR 0005, 0010), tanpa port masuk dan tanpa server aplikasi tambahan.

## Keputusan
**Pages CMS** (MIT, gratis) lewat app.pagescms.org dan GitHub App-nya, dikonfigurasi dengan `.pages.yml` di root repo.
- Setiap simpan menjadi **commit langsung ke `main`** (keputusan pemilik). `deploy.yml` menjalankan verify (skema Zod, tes, Lighthouse) sebelum publish, jadi data yang salah tidak pernah tayang; web lama tetap sampai diperbaiki.
- `.pages.yml` mencerminkan skema di `src/lib/content/schemas`; `tests/unit/cms-config.test.ts` gagal jika keduanya tidak sejalan.
- Parser konten membuang nilai kosong (`""`, `null`, `{}`) yang bisa ditulis editor untuk field opsional yang dikosongkan (`pruneEmpty` di `src/lib/content/yaml.ts`).
- Field yang dulu menerima "string atau teks dwibahasa" (`awards.issuer`, `skills.items`) dan `github.yaml` `include` dinormalisasi ke bentuk objek, dan tahun penghargaan ditulis sebagai teks (`"2025"`), karena editor tidak bisa menampilkan union dan tidak mengubah angka menjadi teks. Skema tetap menerima bentuk lama.
- Field opsional yang punya pola (mis. `expires`, `ref`) memakai komponen `optional…` yang polanya juga menerima nilai kosong, karena Pages CMS memvalidasi `""` terhadap pola. Penjaga drift memeriksa wajib/opsional, list, angka, nilai `select`, dan pola terhadap skema.

## Alternatif yang dipertimbangkan
- **Keystatic:** mode GitHub butuh route server (OAuth dan proxy API, `prerender: false`), artinya adapter Node dan container tambahan di server kecil. Mode lokal hanya bisa dipakai di laptop.
- **Decap CMS:** butuh layanan OAuth sendiri untuk GitHub; proyeknya lebih lambat berkembang.
- **Edit langsung di GitHub (✏️):** tetap tersedia, tetapi tanpa form dan validasi per field.

## Konsekuensi
- Tidak ada perubahan di server. GitHub App hanya diberi akses ke repo `harrymardika/portfolio`.
- **Izin yang diminta cukup luas.** Menurut panduan GitHub App Pages CMS (2026-10): *Contents*, *Actions*, dan *Administration* read & write pada repo yang dipilih (tanpa izin *Workflows*, jadi file `.github/workflows/` tidak bisa diubahnya). Karena simpan = commit ke `main` dan push memicu deploy, layanan Pages CMS memegang token yang bisa mengubah isi situs. `verify` memeriksa kebenaran data, bukan niat. Mitigasi: pasang App hanya untuk repo ini, periksa daftar izin di layar instalasi, dan cabut instalasinya di GitHub (*Settings → Applications*) jika tidak dipakai lagi.
- `exclude` di Pages CMS hanya mencocokkan nama file persis (tanpa wildcard). Jika terjemahan studi kasus `*.id.md` (T2.4) dibuat kelak, simpan di subfolder agar tidak muncul sebagai studi kasus terpisah.
- Komentar di file YAML hilang saat file disimpan lewat editor. Catatan penting disimpan di `docs/04-content-guide.md` dan `PROGRESS.md`, bukan di komentar.
- Saat skema konten berubah, `.pages.yml` ikut diubah di commit yang sama (dijaga tes).
- Pages CMS menyimpan sesi login di layanannya; isi tetap hanya di repo. Jika layanan itu berhenti, `.pages.yml` bisa dipakai dengan instans Pages CMS self-hosted, atau edit kembali lewat Git.
