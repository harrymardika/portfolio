# 01 · Software Requirements Specification

Versi Markdown dari *Dokumen Perencanaan Pengembangan Website Portfolio (Self-Hosted)*, ditambah kebutuhan yang disepakati pada 2026-10-05.
Bagian yang **baru/berubah** dari PDF asli ditandai 🆕.

## 1. Pendahuluan

### 1.1 Tujuan
Website portfolio pribadi yang menjadi etalase profesional Harry Mardika, sekaligus pembuktian kemampuan full-stack hingga DevOps lewat deployment di home server.

### 1.2 Pengguna

| Pengguna | Kebutuhan utama |
|---|---|
| Rekruter / HRD | Memahami profil dengan cepat, mengunduh CV |
| Calon klien / kolaborator | Menilai kualitas karya dan cara menghubungi |
| Senior engineer / tech lead | Menginspeksi arsitektur self-hosted: header HTTP, kecepatan, CI/CD |
| 🆕 Pemilik | Memperbarui isi dengan mudah, memantau statistik kunjungan dan unduhan |

### 1.3 Ruang lingkup
1. Frontend: profil, tautan sosial, pengalaman, proyek
2. Sinkronisasi proyek publik dari GitHub secara selektif
3. Kontainerisasi Docker
4. Jaringan home server yang aman (Cloudflare Tunnel, SSL/TLS)
5. CI/CD otomatis
6. 🆕 Pembuatan otomatis PDF CV dan Portfolio
7. 🆕 Statistik bawaan yang ditampilkan langsung di situs dan menghormati privasi (ADR 0009)
8. 🆕 Dua bahasa (EN/ID)
9. 🆕 Elemen 3D interaktif

## 2. Identitas

| Item | Nilai |
|---|---|
| Domain | `harry.mardika.my.id` (subdomain dari `mardika.my.id`) |
| GitHub | `harrymardika` |
| LinkedIn | https://www.linkedin.com/in/harry-mardika/ |
| Instagram | `@harry.mrdk` → https://www.instagram.com/harry.mrdk/ |
| Email publik | harrymardika48@gmail.com |
| Nomor HP | **Tidak ditampilkan** di web maupun PDF publik |

## 3. Kebutuhan fungsional

| ID | Kebutuhan | Prioritas |
|---|---|---|
| FR-01 | Menampilkan profil (nama, peran, ringkasan, foto, statistik unggulan) | Wajib |
| FR-02 | Menampilkan tautan kontak: email, LinkedIn, Instagram, GitHub | Wajib |
| FR-03 | 🆕 Menampilkan perjalanan karier sebagai jalur 3D interaktif dengan fallback timeline HTML | Wajib |
| FR-04 | Menampilkan pengalaman, pendidikan, penghargaan, pelatihan, sertifikat **yang masih berlaku**, dan skills | Wajib |
| FR-05 | Menampilkan proyek: gabungan case study lokal (`content/projects`) dan repo GitHub bertopic `portfolio` | Wajib |
| FR-06 | Mengambil data repo (nama, deskripsi, topics, URL, bahasa, bintang, tanggal update) via GitHub API | Wajib |
| FR-06a | 🆕 Pemilik memilih repo yang tampil: daftar di `content/github.yaml` (`include`/`exclude`) dan/atau topic `portfolio` | Wajib |
| FR-07 | Memperbarui data secara otomatis: terjadwal (tiap 6 jam) dan setiap push | Wajib |
| FR-08 | 🆕 Download CV (PDF, ramah ATS) dalam EN dan ID | Wajib |
| FR-09 | 🆕 Download Portfolio (PDF visual) dalam EN dan ID | Wajib |
| FR-10 | 🆕 PDF dibuat otomatis saat build dari data yang sama dengan website | Wajib |
| FR-11 | 🆕 Ganti bahasa EN ↔ ID di setiap halaman | Wajib |
| FR-12 | 🆕 Mencatat dan **menampilkan di situs** pengunjung, tampilan halaman, unduhan CV/Portfolio, sumber trafik, dan negara (tanpa layanan analytics terpisah) | Wajib |
| FR-13 | 🆕 Link pelacak per lamaran (`?ref=<nama>`), **hanya terlihat oleh pemilik** | Sebaiknya |
| FR-14 | Halaman `/homelab`: spesifikasi server dan status uptime live | Sebaiknya |
| FR-15 | 🆕 Mode gelap/terang | Sebaiknya |
| FR-16 | 🆕 Mengedit konten lewat CMS berbasis Git | Nanti |
| FR-17 | 🆕 Draf case study dan terjemahan oleh AI sebagai Pull Request | Nanti |

## 4. Kebutuhan non-fungsional

| ID | Kebutuhan | Target terukur |
|---|---|---|
| NFR-01 | Performa | Muat < 3 s; LCP < 2.5 s (mobile 4G); Lighthouse Perf ≥ 90 mobile |
| NFR-02 | Ketersediaan | Di belakang CDN Cloudflare; halaman statis tetap dilayani dari cache saat server mati |
| NFR-03 | Keamanan | Tanpa port forwarding (Cloudflare Tunnel); HTTPS; UFW; header keamanan nilai A |
| NFR-04 | 🆕 Aksesibilitas | WCAG 2.2 AA; Lighthouse A11y ≥ 95; dapat dinavigasi dengan keyboard |
| NFR-05 | 🆕 3D sebagai progressive enhancement | Konten lengkap tanpa JS/WebGL; 3D mati otomatis untuk `prefers-reduced-motion` dan perangkat lemah |
| NFR-06 | 🆕 Privasi | Statistik tanpa cookie dan tanpa menyimpan IP; DNT/GPC dihormati; tidak ada data pribadi sensitif di repo/web/PDF |
| NFR-07 | 🆕 Kemudahan perawatan | Isi diubah hanya lewat `content/`; kode modular; tes otomatis; dokumentasi selalu terbarui |
| NFR-08 | 🆕 SEO | Sitemap, OG image, JSON-LD `Person`, hreflang; Lighthouse SEO ≥ 95 |

## 5. Struktur halaman (sitemap)

| Path (EN) | Path (ID) | Isi |
|---|---|---|
| `/` | `/id/` | Hero (kartu foto 3D), Journey 3D, proyek unggulan, CTA download, kontak |
| `/projects/` | `/id/projects/` | Semua proyek + filter tag |
| `/projects/<slug>/` | `/id/projects/<slug>/` | Case study |
| `/about/` | `/id/about/` | Ringkasan, pengalaman, pendidikan, penghargaan, sertifikat, skills |
| `/homelab/` | `/id/homelab/` | Spesifikasi server, arsitektur, status live |
| `/print/cv/`, `/print/portfolio/` | `/id/print/...` | Sumber PDF (tidak ditautkan di navigasi, `noindex`) |

## 6. Infrastruktur

Server: Lenovo IdeaPad 300S-11IBR, Celeron N3050, RAM 1,8 GB, SSD 500 GB, Debian 13 (trixie). Lihat `docs/07-deployment.md`. Ringkasnya: build image di GitHub Actions → GHCR → home server menarik image baru (systemd timer, ADR 0010) → Caddy menyajikan file statis → Cloudflare Tunnel → Cloudflare CDN.

> Perubahan dari PDF: **self-hosted GitHub runner tidak digunakan** karena berisiko untuk repo publik (lihat ADR 0005).

## 7. Roadmap

Lihat `PROGRESS.md` (Fase 0–8).
