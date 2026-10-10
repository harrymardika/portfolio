# harry.mardika.my.id

Website portfolio pribadi **Harry Mardika** (AI Product Manager; Founder, Decklify), dwibahasa, dengan CV dan Portfolio PDF yang dibuat otomatis, di-host sendiri di server rumah.

- **Live:** https://harry.mardika.my.id (Indonesia: https://harry.mardika.my.id/id/)
- **Status:** online sejak 2026-10-06. Fase 0–13 selesai: chatbot "Tanya Harry" dan formulir kesan & pesan tayang 2026-10-09, tampilan baru Giok → Nila dengan beranda "satu ruang" 3D tayang 2026-10-10 (rilis 1.5.0). Rencana Fase 14 (halaman lain dalam ruang yang sama) di [`docs/11-roadmap.md`](docs/11-roadmap.md). Detail di [`PROGRESS.md`](PROGRESS.md).
- **Dokumentasi:** [`docs/`](docs/README.md). Untuk pemilik, mulai dari **[panduan operasional](docs/10-operations.md)**.

## Fitur

| Fitur | Ringkasan |
|---|---|
| Dwibahasa | English di `/`, Bahasa Indonesia di `/id/`, dengan `hreflang` dan tombol ganti bahasa. Studi kasus juga diterjemahkan; angka mengikuti format tiap bahasa (`92.5%` / `92,5%`) |
| Satu sumber data | Semua isi (profil, pengalaman, proyek, dll.) ada di [`content/`](content/). Website, CV, dan Portfolio PDF membaca data yang sama. |
| CV & Portfolio PDF | Dibuat otomatis setiap build (EN dan ID). CV ramah ATS, maks. 2 halaman, tanpa nomor HP. Ditambah 6 CV per posisi (AI/ML, Data Engineer, Data Analyst, Product Manager, Project Manager, Management Trainee) di `/cv/` (tautan "Resumes" di footer) |
| Kesan & pesan | Pesan dari orang yang pernah bekerja dengan Harry di beranda (`content/messages.yaml`). Pengunjung bisa menulis lewat formulir `/messages/`; tidak ada yang tampil sebelum pemilik menyetujuinya di halaman privat, lalu pesan masuk lewat Pull Request dengan terjemahan AI ([ADR 0017](docs/adr/0017-kind-words-form.md)) |
| Tampilan | Warna "Giok → Nila" ([ADR 0018](docs/adr/0018-giok-nila-room.md)): halaman sebagai ruangan yang berubah pelan dari hijau giok ke biru nila saat scroll, tema terang dan gelap; kontras teks dicek otomatis di setiap titik gradasi |
| 3D | "Satu ruang" (Three.js, ADR 0019): satu kanvas di belakang beranda dengan foto cetak dan lembar aksara Jawa, benang journey, konveyor proyek, kertas Kind words, dan laptop homelab. Tanpa GPU, hemat data, atau tanpa JS, isinya tetap HTML lengkap; *reduced motion* mendapat frame diam. |
| Edit dari browser | [Pages CMS](https://app.pagescms.org): setiap simpan menjadi commit dan tayang otomatis ([ADR 0011](docs/adr/0011-pages-cms.md)) |
| Proyek dari GitHub | Repo yang dipilih di `content/github.yaml` atau ber-topic `portfolio` tampil otomatis, diperbarui tiap 6 jam |
| Chatbot "Tanya Harry" | Tombol di sudut setiap halaman: pengunjung bertanya tentang Harry, jawaban singkat dari isi situs dengan tautan ke halaman terkait (Gemini Flash Lite, cadangan Groq). Teks pertanyaan tidak disimpan, batas per pengunjung, bisa dimatikan tanpa build ([ADR 0014](docs/adr/0014-ask-harry-assistant.md), [ADR 0015](docs/adr/0015-separate-ai-keys-flash-lite.md)) |
| Draf studi kasus oleh AI | Repo ber-topic `portfolio` tanpa studi kasus → Gemini (cadangan Groq) menulis draf dari README → Pull Request; proyek multi-repo (grup di `content/github.yaml`) = satu draf dari semua README; **merge = tayang** ([ADR 0013](docs/adr/0013-ai-case-study-drafts.md), [ADR 0016](docs/adr/0016-group-aware-drafts.md)) |
| Statistik bawaan | Pengunjung, unduhan CV/Portfolio, sumber trafik, ditampilkan di `/stats/` (tautan di footer); tanpa cookie, tanpa layanan pihak ketiga ([ADR 0009](docs/adr/0009-built-in-stats.md)) |
| Tetap tersaji saat server mati | Cloudflare menyimpan halaman 7 hari; cache dihapus otomatis setiap deploy ([ADR 0012](docs/adr/0012-edge-cache-purge-on-deploy.md)) |
| Kualitas | Lighthouse ≥ 90 (performa) dan ≥ 95 (a11y, best practices, SEO) dijaga CI; header keamanan **A+** (Mozilla Observatory); SEO: sitemap, gambar pratinjau, JSON-LD |

## Cara kerja singkat

```mermaid
flowchart LR
  CMS[Pages CMS] -->|commit| R[(Repo GitHub<br/>content/)]
  L[Laptop] -->|git push| R
  AI[Workflow draf AI] -->|Pull Request → merge| R
  R --> CI[GitHub Actions<br/>verify → build → image]
  CI --> G[(GHCR)]
  G -->|tarik tiap 10 menit| S[Server rumah<br/>Caddy + stats]
  S --> CF[Cloudflare<br/>Tunnel + cache] --> V((Pengunjung))
```

Setiap perubahan di `main` diperiksa (skema data, tes, Lighthouse), lalu dibangun menjadi image Docker. Server rumah menariknya sendiri, dan cache Cloudflare dihapus otomatis. Dari simpan sampai tayang ±20 menit. Detail: [docs/02-architecture.md](docs/02-architecture.md).

## Mengubah isi

| Cara | Kapan dipakai | Panduan |
|---|---|---|
| **Pages CMS** (browser, juga HP) | Mengubah teks, pengalaman, proyek, terjemahan | [docs/04 §1](docs/04-content-guide.md) |
| **Topic `portfolio` di repo GitHub** | Menambah proyek baru; draf studi kasus datang sebagai PR | [docs/04 §4](docs/04-content-guide.md) |
| **Laptop** (edit `content/`, commit, push) | Perubahan besar atau banyak file sekaligus | [docs/04](docs/04-content-guide.md), [docs/06](docs/06-development-workflow.md) |

Data yang tidak valid ditolak oleh CI dan situs lama tetap tayang; pesan error menyebut file, item, dan field-nya.

## Untuk pengembang

```bash
bun install
bun run dev                 # http://localhost:4321
bun run verify              # wajib sebelum commit: check → unit → e2e

# Atau dengan Docker, tanpa memasang Bun/Node di laptop
docker compose -f docker/compose.dev.yml up
```

Syarat: Bun 1.3+ dan Node.js 22.12+. Semua perintah: [docs/06-development-workflow.md](docs/06-development-workflow.md).

**AI agent dan kontributor:** baca **[`AGENTS.md`](AGENTS.md)** terlebih dahulu (urutan membaca dokumen, cara mengambil tugas, standar kode, Definition of Done), lalu [`PROGRESS.md`](PROGRESS.md).

**Tech stack** ([ADR](docs/adr/)): Astro 7 (SSG) · TypeScript strict · Bun · Tailwind CSS 4 · Three.js · Zod · Playwright (e2e, PDF, gambar pratinjau) · Caddy · Bun + SQLite (statistik) · Docker · GitHub Actions · Cloudflare Tunnel · Pages CMS · Gemini / Groq.

## Struktur repo

```
.
├── AGENTS.md · CLAUDE.md      # Aturan kerja untuk AI agent & developer (wajib dibaca)
├── PROGRESS.md · CHANGELOG.md # Status, log sesi, dan riwayat perubahan
├── .pages.yml                 # Konfigurasi editor browser Pages CMS
├── content/                   # SUMBER DATA: profil, pengalaman, proyek, media
├── src/                       # Astro: lib (logika murni), components, scenes (3D), pages, layouts
├── services/stats/            # Service statistik (Bun + SQLite)
├── scripts/                   # Build & alat: GitHub sync, PDF, gambar pratinjau, sitemap, CSP, draf AI
├── tests/                     # unit (bun test) & e2e (Playwright + axe)
├── docker/                    # Dockerfile, Caddyfile, compose produksi & dev, deploy/ (server)
├── .github/workflows/         # ci, deploy (+ jadwal 6 jam), case-study-drafts (2× sehari)
└── docs/                      # Dokumentasi, ADR, prototipe tema
```

## Lisensi

Kode: [MIT](LICENSE). Isi pribadi di `content/` (teks, foto, data CV): © Harry Mardika, *all rights reserved*.
