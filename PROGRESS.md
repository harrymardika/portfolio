# PROGRESS

> Satu-satunya sumber kebenaran tentang status proyek. **Perbarui setiap kali menyelesaikan atau menghentikan tugas.**
> Legenda: `[ ]` belum · `[~]` sedang dikerjakan (tulis siapa) · `[x]` selesai · `[!]` terblokir (tulis alasannya)

**Terakhir diperbarui:** 2026-10-05 · **Fase aktif:** Fase 1 · **Tugas berikutnya:** `T1.1`

## Ringkasan

| Fase | Tujuan | Status |
|---|---|---|
| 0 | Fondasi: dokumentasi, keputusan, data konten | ✅ Selesai |
| 1 | Scaffold aplikasi, tooling, skema konten, i18n, layout dasar | ⏳ Berikutnya |
| 2 | Halaman & UI (hero kartu 3D, journey 3D, proyek, about, kontak) | ⬜ |
| 3 | Sinkronisasi proyek dari GitHub | ⬜ |
| 4 | Generate PDF CV & Portfolio | ⬜ |
| 5 | Analytics (Umami) & link pelacak | ⬜ |
| 6 | Docker, CI/CD, deploy ke home server | ⬜ |
| 7 | Kualitas: SEO, a11y, performa, header keamanan | ⬜ |
| 8 | Otomasi lanjutan: CMS, draf konten oleh AI | ⬜ |

Progres keseluruhan: **Fase 0 dari 8 selesai (≈10%)**

---

## Fase 0: Fondasi ✅

- [x] **T0.1** Analisis SRS (PDF) dan bahan CV
- [x] **T0.2** Pilih tema: **F + E, palet Hijau** → `docs/adr/0006-visual-theme.md`, prototipe di `docs/design/theme-prototypes.html`
- [x] **T0.3** Dokumentasi: README, AGENTS.md, CLAUDE.md, `docs/01`–`09`, ADR 0001–0008
- [x] **T0.4** Ekstrak data CV ke `content/` (EN lengkap, ID sebagian), dengan koreksi data yang disetujui pemilik
- [x] **T0.5** Subagent reviewer (`.claude/agents/reviewer.md`), `.gitignore`, `.editorconfig`, `.env.example`

## Fase 1: Scaffold & fondasi kode

- [ ] **T1.1** Scaffold Astro + Bun + TypeScript strict
  - Kriteria: `bun run dev` jalan; `tsconfig` strict (`strict`, `noUncheckedIndexedAccess`); struktur folder sesuai `docs/02-architecture.md` §4; path alias `@/` → `src/`.
- [ ] **T1.2** Tooling kualitas
  - Kriteria: ESLint (+ plugin astro), Prettier (+ plugin astro), script `bun run check` = typecheck + lint + format:check; `bun test` jalan dengan 1 contoh tes; Playwright terpasang dengan 1 smoke test.
- [ ] **T1.3** Skema konten (Zod) untuk semua file di `content/` + loader Astro Content Layer
  - Kriteria: build gagal dengan pesan jelas jika data salah; tipe TS diekspor; tes unit untuk validasi `LocalizedText`, tanggal `YYYY-MM`, dan sertifikat kedaluwarsa.
- [ ] **T1.4** Helper konten murni di `src/lib/content/` (`localize`, `formatDateRange`, `isActiveCertification`, `sortByDateDesc`, dll.)
  - Kriteria: fungsi murni tanpa I/O, cakupan tes ≥ 90%.
- [ ] **T1.5** i18n: routing `en` (default `/`) + `id` (`/id/`), kamus UI di `src/lib/i18n/`, tombol ganti bahasa
  - Kriteria: setiap halaman punya `hreflang` alternatif; teks UI tidak ada yang hardcode.
- [ ] **T1.6** Design tokens & Tailwind: tokens dari `docs/03-design-system.md` di `src/styles/tokens.css`, font dimuat (self-host via Fontsource)
  - Kriteria: tidak ada hex mentah di komponen; mode gelap/terang berfungsi.
- [ ] **T1.7** Layout dasar: `BaseLayout`, `Header`, `Footer` (ikon sosial: LinkedIn, Instagram @harry.mrdk, GitHub, email), skip-link, meta SEO dasar
  - Kriteria: lolos axe tanpa pelanggaran serius; navigasi keyboard berfungsi.
- [ ] **T1.8** Docker dev: `docker/compose.dev.yml` dengan hot reload *(independen, boleh dikerjakan paralel)*
  - Kriteria: `docker compose -f docker/compose.dev.yml up` menjalankan dev server di port 4321.

## Fase 2: Halaman & UI

- [ ] **T2.1** Modul inti 3D `src/scenes/core/` (renderer, loop, pause saat offscreen, reduced-motion, deteksi WebGL, dispose)
  - Kriteria: kontrak `SceneHandle` sesuai `docs/02-architecture.md` §6; tes unit untuk util non-WebGL.
- [ ] **T2.2** Hero: kartu foto 3D + kotak deteksi wajah + statistik
  - Kriteria: sesuai prototipe (F + E, Hijau); tanpa JS/WebGL tampil versi statis yang setara; LCP < 2.5 s di mobile.
- [ ] **T2.3** Bagian Journey: jalur 3D dari `content/journey.yaml`, bola bergerak mengikuti scroll, titik bisa diklik (dialog detail)
  - Kriteria: versi tanpa 3D berupa timeline HTML yang dapat diakses; label tidak menutupi teks di mobile.
- [ ] **T2.4** Halaman Projects (daftar + filter tag) dan detail proyek (case study dari `content/projects/*.md`)
- [ ] **T2.5** Halaman About: ringkasan, pengalaman, pendidikan, penghargaan, sertifikat aktif, skills
- [ ] **T2.6** Bagian Contact (email, LinkedIn, Instagram, GitHub) tanpa nomor HP
- [ ] **T2.7** Halaman 404 dan halaman `/homelab` (spesifikasi server; status live menyusul di Fase 6)

## Fase 3: Sinkronisasi GitHub

- [ ] **T3.1** `scripts/fetch-github.ts`: ambil repo publik `harrymardika` dengan topic `portfolio` (GraphQL), simpan ke `src/data/generated/github.json`
  - Kriteria: retry + backoff, tetap build jika API gagal (pakai cache terakhir), tes untuk fungsi mapping.
- [ ] **T3.2** Gabungkan data GitHub dengan `content/projects/*.md` (Markdown lokal menimpa data GitHub jika `repo` sama)
- [ ] **T3.3** Jalankan sinkronisasi terjadwal (cron di GitHub Actions, tiap 6 jam) *(bergantung T6.2)*

## Fase 4: PDF CV & Portfolio

- [ ] **T4.1** Halaman cetak `/print/cv` dan `/id/print/cv` (ATS: 1 kolom, teks asli, tanpa grafik, tanpa nomor HP)
- [ ] **T4.2** Halaman cetak `/print/portfolio` (visual, case study unggulan)
- [ ] **T4.3** `scripts/generate-pdf.ts` (Playwright) → `public/downloads/` dengan nama `Harry-Mardika-CV-EN.pdf`, dst.
  - Kriteria: berjalan di build Docker; teks PDF bisa dipilih/disalin; ukuran < 1 MB.
- [ ] **T4.4** Tombol download di UI (EN/ID) dan event analytics

## Fase 5: Analytics

- [ ] **T5.1** Umami di `docker/compose.yml` (Postgres) + script tracking (hanya production)
- [ ] **T5.2** Event: `download-cv`, `download-portfolio`, `outbound-*`, `project-open`, `lang-switch` (lihat `docs/08-analytics.md`)
- [ ] **T5.3** Link pelacak `?ref=` per lamaran + panduan pemakaian

## Fase 6: Docker, CI/CD, deploy

- [ ] **T6.1** `docker/Dockerfile` multi-stage (deps → build → PDF → Caddy) + `Caddyfile` dengan header keamanan
- [ ] **T6.2** GitHub Actions `ci.yml`: check, test, build pada setiap PR
- [ ] **T6.3** GitHub Actions `deploy.yml`: build image dan push ke GHCR saat push ke `main` dan terjadwal
- [ ] **T6.4** `docker/compose.yml` produksi: `web` + `watchtower` (+ `umami`, `db`); Cloudflare Tunnel diurus pemilik
- [ ] **T6.5** Halaman `/homelab`: status uptime live (Uptime Kuma badge/API)

## Fase 7: Kualitas

- [ ] **T7.1** SEO: sitemap, robots, OG image per halaman, JSON-LD `Person`, canonical + hreflang
- [ ] **T7.2** Lighthouse CI di GitHub Actions (target: Perf ≥ 90 mobile, A11y/BP/SEO ≥ 95)
- [ ] **T7.3** Header keamanan (CSP, HSTS, dll.), target nilai A di securityheaders.com
- [ ] **T7.4** Uji e2e utama: ganti bahasa, download CV, navigasi keyboard, fallback tanpa WebGL

## Fase 8: Otomasi lanjutan

- [ ] **T8.1** CMS berbasis Git (Keystatic atau Pages CMS) untuk mengedit `content/` dari browser
- [ ] **T8.2** Workflow AI: repo baru bertopic `portfolio` → draf case study + terjemahan ID sebagai Pull Request (tidak auto-merge)
- [ ] **T8.3** Terjemahkan semua `highlights` di `content/` ke Bahasa Indonesia (bisa dibantu AI, wajib direview pemilik)

---

## Keputusan tertunda (butuh jawaban pemilik)

| # | Pertanyaan | Default jika tidak dijawab |
|---|---|---|
| D1 | Lisensi kode (MIT?) | Kode MIT, isi `content/` *All rights reserved* |
| D2 | Teks badge status di hero ("Open to work" / "Open for collaboration" / tidak ada) | Tidak ditampilkan |
| D3 | Latar foto: tetap biru (kontras) atau diganti hijau tua/putih | Tetap biru |
| D4 | Subdomain analytics (mis. `analytics.mardika.my.id`) | `analytics.mardika.my.id` |
| D5 | Repo mana saja yang diberi topic `portfolio` di GitHub | Pemilik menandai sendiri |
| D6 | Sertifikat Azure AI Engineer: diperpanjang atau tidak | Tetap tersembunyi (kedaluwarsa Jul 2026) |

## Catatan data

- Alibaba Cloud Certified Associate **kedaluwarsa Nov 2026**. Setelah lewat tanggalnya, sertifikat otomatis hilang dari web dan CV (`expires` di `content/certifications.yaml`).
- `highlights` pengalaman baru tersedia dalam EN (fallback). Terjemahan ID: T8.3.
- Proyek dengan `draft: true` di `content/projects/` butuh detail/tautan dari pemilik sebelum ditampilkan.

---

## Log sesi

Format: `### YYYY-MM-DD · <agent/orang> · <tugas>`, lalu poin: dikerjakan / belum / langkah berikutnya / catatan.

### 2026-10-05 · Claude Code (Opus) · Fase 0
- **Dikerjakan:** analisis SRS + CV + LinkedIn + portfolio lama; 8 prototipe tema → dipilih F + E Hijau; seluruh dokumentasi dan ADR; ekstraksi data ke `content/`; foto profil dioptimasi ke `content/media/profile.jpg`.
- **Koreksi data yang disetujui pemilik:** Research Assistant = Sep–Okt 2024; kelulusan fasilitator DBS = 65%; Decklify = masih berjalan (Present); pendidikan selesai Agu 2026; sertifikat Azure tidak ditampilkan; nomor HP tidak ditampilkan di mana pun.
- **Belum:** belum ada kode aplikasi.
- **Langkah berikutnya:** `T1.1` scaffold Astro.
- **Catatan:** kode proyek lama ("Temporal Portal", React/Vite) sengaja dihapus oleh pemilik; mulai dari nol.
