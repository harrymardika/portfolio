# PROGRESS

> Satu-satunya sumber kebenaran tentang status proyek. **Perbarui setiap kali menyelesaikan atau menghentikan tugas.**
> Legenda: `[ ]` belum · `[~]` sedang dikerjakan (tulis siapa) · `[x]` selesai · `[!]` terblokir (tulis alasannya)

**Terakhir diperbarui:** 2026-10-08 · **Fase aktif:** Fase 10 (T10.3 menunggu tinjauan pemilik) dan Fase 11 · **Tugas berikutnya:** T11.1 (rencana chatbot sudah disetujui); pemilik meninjau 12 PDF varian CV di `/cv/`, lalu T10.4

## Ringkasan

| Fase | Tujuan | Status |
|---|---|---|
| 0 | Fondasi: dokumentasi, keputusan, data konten | ✅ Selesai |
| 1 | Scaffold aplikasi, tooling, skema konten, i18n, layout dasar | ✅ Selesai |
| 2 | Halaman & UI (hero kartu 3D, journey 3D, proyek, about, kontak) | ✅ Selesai |
| 3 | Sinkronisasi proyek dari GitHub | ✅ Selesai (run terjadwal tiap 6 jam berjalan sejak 2026-10-06) |
| 4 | Generate PDF CV & Portfolio | ✅ Selesai |
| 5 | Statistik bawaan di situs & link pelacak (ADR 0009) | ✅ Selesai |
| 6 | Docker, CI/CD, deploy ke home server | ✅ Selesai: online di server Debian 13 sejak 2026-10-06 |
| 7 | Kualitas: SEO, a11y, performa, header keamanan | ✅ Selesai (Lighthouse ≥ 90/95 di CI, Observatory A+) |
| 8 | Otomasi lanjutan: CMS, draf konten oleh AI | ✅ Selesai |
| 9 | Personal branding & konten: positioning, skill, terjemahan studi kasus, kesan & pesan (`docs/11-roadmap.md` §A, C, D, F) | ✅ Selesai 2026-10-08 (rilis 1.1.0) |
| 10 | CV per posisi (§B) | 🔄 T10.1–T10.2 selesai; T10.3 menunggu tinjauan pemilik, lalu penutupan (T10.4) |
| 11 | Chatbot "Tanya Harry" di sudut (§E) | ⏳ Rencana disetujui; berikutnya (T11.1) |
| 12 | Formulir kesan & pesan bermoderasi (§F) | ⏳ Setelah Fase 11 |
| 13 | 3D tambahan di halaman selain beranda (§H) | ⏳ Setelah Fase 11 dan 12 |

Progres keseluruhan: **Fase 0–9 selesai; situs online sejak 2026-10-06. Rencana lanjutan Fase 10–13: `docs/11-roadmap.md`**

---

## Fase 0: Fondasi ✅

- [x] **T0.1** Analisis SRS (PDF) dan bahan CV
- [x] **T0.2** Pilih tema: **F + E, palet Hijau** → `docs/adr/0006-visual-theme.md`, prototipe di `docs/design/theme-prototypes.html`
- [x] **T0.3** Dokumentasi: README, AGENTS.md, CLAUDE.md, `docs/01`–`09`, ADR 0001–0008
- [x] **T0.4** Ekstrak data CV ke `content/` (EN lengkap, ID sebagian), dengan koreksi data yang disetujui pemilik
- [x] **T0.5** Subagent reviewer (`.claude/agents/reviewer.md`), `.gitignore`, `.editorconfig`, `.env.example`

## Fase 1: Scaffold & fondasi kode ✅

- [x] **T1.1** Scaffold Astro + Bun + TypeScript strict
  - Kriteria: `bun run dev` jalan; `tsconfig` strict (`strict`, `noUncheckedIndexedAccess`); struktur folder sesuai `docs/02-architecture.md` §4; path alias `@/` → `src/`.
- [x] **T1.2** Tooling kualitas
  - Kriteria: ESLint (+ plugin astro), Prettier (+ plugin astro), script `bun run check` = typecheck + lint + format:check; `bun test` jalan dengan 1 contoh tes; Playwright terpasang dengan 1 smoke test.
- [x] **T1.3** Skema konten (Zod) untuk semua file di `content/` + loader Astro Content Layer
  - Kriteria: build gagal dengan pesan jelas jika data salah; tipe TS diekspor; tes unit untuk validasi `LocalizedText`, tanggal `YYYY-MM`, dan sertifikat kedaluwarsa.
- [x] **T1.4** Helper konten murni di `src/lib/content/` (`localize`, `formatDateRange`, `isActiveCertification`, `sortByDateDesc`, dll.)
  - Kriteria: fungsi murni tanpa I/O, cakupan tes ≥ 90%.
- [x] **T1.5** i18n: routing `en` (default `/`) + `id` (`/id/`), kamus UI di `src/lib/i18n/`, tombol ganti bahasa
  - Kriteria: setiap halaman punya `hreflang` alternatif; teks UI tidak ada yang hardcode.
- [x] **T1.6** Design tokens & Tailwind: tokens dari `docs/03-design-system.md` di `src/styles/tokens.css`, font dimuat (self-host via Fontsource)
  - Kriteria: tidak ada hex mentah di komponen; mode gelap/terang berfungsi.
- [x] **T1.7** Layout dasar: `BaseLayout`, `Header`, `Footer` (ikon sosial: LinkedIn, Instagram @harry.mrdk, GitHub, email), skip-link, meta SEO dasar
  - Kriteria: lolos axe tanpa pelanggaran serius; navigasi keyboard berfungsi.
- [x] **T1.8** Docker dev: `docker/compose.dev.yml` dengan hot reload *(independen, boleh dikerjakan paralel)*
  - Kriteria: `docker compose -f docker/compose.dev.yml up` menjalankan dev server di port 4321.

## Fase 2: Halaman & UI ✅

- [x] **T2.1** Modul inti 3D `src/scenes/core/` (renderer, loop, pause saat offscreen, reduced-motion, deteksi WebGL, dispose)
  - Kriteria: kontrak `SceneHandle` sesuai `docs/02-architecture.md` §6; tes unit untuk util non-WebGL.
- [x] **T2.2** Hero: kartu foto 3D + kotak deteksi wajah + statistik
  - Kriteria: sesuai prototipe (F + E, Hijau); tanpa JS/WebGL tampil versi statis yang setara; LCP < 2.5 s di mobile.
- [x] **T2.3** Bagian Journey: jalur 3D dari `content/journey.yaml`, bola bergerak mengikuti scroll, titik bisa diklik (dialog detail)
  - Kriteria: versi tanpa 3D berupa timeline HTML yang dapat diakses; label tidak menutupi teks di mobile.
- [x] **T2.4** Halaman Projects (daftar + filter tag) dan detail proyek (case study dari `content/projects/*.md`); tambahkan ke `NAV_ITEMS`
- [x] **T2.5** Halaman About: ringkasan, pengalaman, pendidikan, penghargaan, sertifikat aktif, skills; tambahkan ke `NAV_ITEMS`
- [x] **T2.8** Menu navigasi di HP (saat `NAV_ITEMS` > 0, menu disembunyikan di bawah `md`)
- [x] **T2.6** Bagian Contact (email, LinkedIn, Instagram, GitHub) tanpa nomor HP
- [x] **T2.7** Halaman 404 dan halaman `/homelab` (spesifikasi server; status live menyusul di Fase 6)

## Fase 3: Sinkronisasi GitHub

- [x] **T3.1** `scripts/fetch-github.ts`: ambil repo publik `harrymardika` (REST, token opsional), pilih yang ada di `content/github.yaml → include` atau bertopic `portfolio`, kurangi `exclude` (keputusan D5); simpan ke `src/data/generated/github.json`
  - Kriteria: skema Zod untuk `content/github.yaml`; fungsi seleksi murni + tes; retry + backoff; tetap build jika API gagal (pakai cache terakhir); tes untuk fungsi mapping.
- [x] **T3.2** Gabungkan data GitHub dengan `content/projects/*.md` (Markdown lokal menimpa data GitHub jika `repo` sama)
- [x] **T3.3** Jalankan sinkronisasi terjadwal (cron di GitHub Actions, tiap 6 jam): jadwal `17 */6 * * *` di `deploy.yml`. Run terjadwal pertama 2026-10-06 13:19 dan 22:39 UTC sukses (GitHub menjalankannya terlambat ±1–20 menit, normal); server memasang image 22:50 UTC dan cache Cloudflare terhapus otomatis

## Fase 4: PDF CV & Portfolio ✅

- [x] **T4.1** Halaman cetak `/print/cv` dan `/id/print/cv` (ATS: 1 kolom, teks asli, tanpa grafik, tanpa nomor HP)
- [x] **T4.2** Halaman cetak `/print/portfolio` (visual, case study unggulan)
- [x] **T4.3** `scripts/generate-pdf.ts` (Playwright) → `dist/downloads/` (setelah `astro build`) dengan nama `Harry-Mardika-CV-EN.pdf`, dst.
  - Kriteria: berjalan di build Docker; teks PDF bisa dipilih/disalin; ukuran < 1 MB.
- [x] **T4.4** Tombol download di UI (EN/ID) dan event statistik (T5.3); ganti CTA sementara di hero ("Get in touch"/"LinkedIn profile") menjadi "Download CV"/"Portfolio PDF"

## Fase 5: Statistik bawaan (ADR 0009, `docs/08-analytics.md`)

- [x] **T5.1** Service `services/stats/` (Bun + SQLite): `POST /api/stats/event`, `GET /api/stats/summary`, `GET /api/stats/private` (token)
  - Kriteria: hash pengunjung harian dengan salt yang berganti & dibuang, tanpa IP tersimpan; filter bot; rate limit; validasi input (Zod); unit test untuk agregasi & privasi; RAM ≤ 96 MB *(direvisi dari 64 MB setelah diukur: runtime Bun 36 MB + Zod 32 MB + layanan ±4 MB)*.
- [x] **T5.2** `docker/compose.yml` + `Caddyfile`: service `stats` (bundel `server.js`), volume `stats-data` (`STATS_DB_PATH`), route `/api/stats/*`, batas memori 128 MB (terukur 17 MiB), backup SQLite `docker/deploy/backup-stats.sh` (diuji)
- [x] **T5.3** Skrip beacon di situs: `pageview`, `download-cv`, `download-portfolio`, `outbound` (konstanta di `src/lib/stats/events.ts`); hormati DNT/GPC; tidak aktif di dev dan `/print/*`
- [x] **T5.4** Tampilan statistik publik di situs (EN/ID): pengunjung, tampilan halaman, unduhan, halaman & sumber teratas, negara; fallback "—" jika API tidak tersedia
- [x] **T5.5** Laporan privat tautan `?ref=` untuk pemilik (`scripts/stats-report.ts` / endpoint bertoken) + panduan

## Fase 6: Docker, CI/CD, deploy

- [x] **T6.1** `docker/Dockerfile` multi-stage (build: Node + Bun + Chromium → GitHub, Astro, PDF, CSP, kompresi → `web` Caddy / `stats` Bun) + `Caddyfile` dengan header keamanan dan CSP berbasis hash
- [x] **T6.2** GitHub Actions `ci.yml`: `bun run verify` pada setiap PR (dipanggil juga oleh `deploy.yml`; lulus di GitHub 2026-10-06)
- [x] **T6.3** GitHub Actions `deploy.yml`: verify → build & push `portfolio-web`/`portfolio-stats` ke GHCR (`latest` + `sha-…`) saat push ke `main`, tiap 6 jam, dan manual (run pertama sukses 2026-10-06; image bisa ditarik tanpa login)
- [x] **T6.4** `docker/compose.yml` produksi: `web` (96 MB) + `stats` (128 MB), read-only, tanpa capability; update lewat systemd timer, **bukan Watchtower** (diarsipkan; ADR 0010). Cloudflare Tunnel diurus pemilik
- [x] **T6.5** Halaman `/homelab`: status server live dari `/api/health` (tanpa Uptime Kuma: tidak perlu container tambahan; saat server mati, Cloudflare menyajikan salinan dan badge menulis offline)

## Fase 7: Kualitas

- [x] **T7.1** SEO: sitemap (dari HTML build, dengan hreflang), robots.txt, gambar OG 1200×630 per halaman (22, EN+ID), JSON-LD `Person`/`WebSite`/`CreativeWork`, canonical + hreflang
- [x] **T7.2** Lighthouse CI di GitHub Actions (target: Perf ≥ 90 mobile, A11y/BP/SEO ≥ 95): `lighthouserc.cjs`, langkah di `ci.yml` (menahan deploy). Beranda (3D) gagal di < 80 dan memberi peringatan di < 90; lihat `docs/progress-archive.md` (log 2026-10-06)
- [x] **T7.3** Header keamanan (CSP, HSTS, dll.): situs live mendapat **A+ (120, 12/12)** di Mozilla HTTP Observatory (2026-10-06); securityheaders.com menolak akses otomatis, cek manual oleh pemilik bila perlu
- [x] **T7.5** Ketersediaan saat server mati: HTML di-cache Cloudflare 7 hari + purge otomatis saat deploy (ADR 0012). Aktif dan diuji di produksi 2026-10-06
- [x] **T7.4** Uji e2e utama: ganti bahasa (tetap di halaman yang sama), download CV, navigasi keyboard (`keyboard.spec.ts`), fallback tanpa WebGL (hero + journey)

## Fase 8: Otomasi lanjutan

- [x] **T8.1** CMS berbasis Git untuk mengedit `content/` dari browser: **Pages CMS** (ADR 0011), `.pages.yml`, penjaga drift `tests/unit/cms-config.test.ts`. *Pemilik: pasang GitHub App sekali (docs/04 §1).*
- [x] **T8.2** Workflow AI: repo baru bertopic `portfolio` → draf case study + terjemahan ID sebagai Pull Request (tidak auto-merge): Gemini, cadangan Groq (ADR 0013). Run nyata pertama 2026-10-07: Gemini 503 → Groq → [PR #1](https://github.com/harrymardika/portfolio/pull/1) untuk `camera-genai`
- [x] **T8.3** Terjemahkan semua `highlights` di `content/` ke Bahasa Indonesia: draf AI 2026-10-05, **direview pemilik 2026-10-07** (54 OK, 1 diperbaiki: judul resmi skripsi)

## Fase 9: Personal branding & konten (`docs/11-roadmap.md` §A, C, D, F) ✅

- [x] **T9.1** Positioning dan baris peran (D8, D9) · disetujui pemilik 2026-10-07. *Sisa untuk pemilik: samakan headline LinkedIn menjadi "AI Product Manager".*
  - Kriteria: `profile.role` = "AI Product Manager" (EN + ID); tagline, ringkasan, dan tiga angka di hero ditulis ulang dengan suara produk (masalah pengguna, peluncuran, metrik) dengan AI engineering sebagai pembeda, ditinjau pemilik; tampil konsisten di hero, About, CV umum, sampul Portfolio, JSON-LD; tes e2e/PDF tidak bergantung pada teks lama. Pemilik menyamakan headline LinkedIn.
- [x] **T9.2** Skill lebih lengkap (D11)
  - Kriteria: `content/skills.yaml` disusun ulang ke grup baru (AI & ML, LLM & Generative AI, Data, Cloud & MLOps, Web & produk, Produk & manajemen, Kepemimpinan, Bahasa); hanya skill yang dicentang pemilik; EN + ID; CV umum tetap ≤ 2 halaman; kategori filter Projects disesuaikan jika ada tag baru.
- [x] **T9.3** Studi kasus bahasa Indonesia (D12) · terjemahan disetujui pemilik 2026-10-08
  - Keputusan: semua 11 diterjemahkan; istilah teknis/asing tetap bahasa Inggris.
  - Kriteria: body `content/projects/id/<slug>.md` untuk semua studi kasus, fallback ke Inggris (+ catatan) bila belum ada; menu CMS; Portfolio PDF ID memakai terjemahan; tes kesamaan struktur EN/ID (judul bagian, gambar); terjemahan ditinjau pemilik; draf AI baru (T8.2) ikut menulis versi ID.
- [x] **T9.4** Tampilan kesan & pesan (dulu "testimoni"; D15; formulirnya T12.1)
  - Kriteria: `content/messages.yaml` (nama, peran opsional, hubungan, pesan EN/ID, tautan opsional, bulan izin) + skema + CMS; tampil di beranda ("Kind words" / "Kesan & pesan"); tidak tampil jika kosong; hanya dengan izin penulisnya. Portfolio PDF: belum (opsional, setelah ada isinya).

- [x] **T9.5** Format angka konsisten di semua bahasa (D16)
  - Aturan: **ikuti aturan baku tiap bahasa**. EN: titik desimal, koma ribuan (`92.5%`, `12,000`). ID (PUEBI): koma desimal, titik ribuan (`92,5%`, `12.000`). Berlaku di web, CV, Portfolio PDF, statistik, studi kasus terjemahan (T9.3), draf AI.
  - Kriteria: nilai yang ditulis sekali untuk dua bahasa (angka hero, angka utama proyek, IPK) ditulis gaya Inggris dan diubah otomatis di halaman/PDF ID (`localizeNumber`); tes unit menolak desimal yang tertukar di `content/` dan kamus UI; aturan ditulis di docs/04 §6 dan prompt draf AI.
- [x] **T9.6** Penutupan Fase 9: rapikan dan dokumentasikan (AGENTS.md §2a)
  - Kriteria: kode/dependency/branch yang tidak terpakai dihapus; README, docs/02, docs/04 (dan docs/07/10, ADR bila perlu) sesuai kode; fase ✅ dan ringkasan fase di PROGRESS; entri CHANGELOG fase dipindah ke rilis bertanggal; `bun run verify` lulus dan situs live dicek; laporan ke pemilik.

## Fase 10: CV per posisi (`docs/11-roadmap.md` §B)

- [x] **T10.1** Model data varian (D10)
  - Kriteria: `content/cv-variants.yaml` (id, baris peran, ringkasan EN/ID, urutan bagian, label fokus yang dipilih, grup skill); label fokus (`ai`, `data`, `product`, `leadership`) pada `highlights`; skema + CMS + tes; varian hanya memilih/mengurutkan data yang ada.
- [x] **T10.2** Pembuat PDF per varian
  - Kriteria: build menghasilkan PDF tiap varian (EN + ID) di jalur yang disepakati D10; tiap varian ≤ 2 halaman, ATS-friendly, tanpa nomor HP (tes per varian).
- [~] **T10.3** Isi varian awal: AI/ML, Data Engineer, Data Analyst, Product Manager, Project Manager, Management Trainee · *Claude Code: terisi, menunggu tinjauan pemilik di `/cv/`*
  - Kriteria: ringkasan dan pilihan poin tiap varian ditinjau pemilik (lewat pratinjau PDF).
- [ ] **T10.4** Penutupan Fase 10: rapikan dan dokumentasikan (AGENTS.md §2a)
  - Kriteria: kode/dependency/branch yang tidak terpakai dihapus; README, docs/02, docs/04 (dan docs/07/10, ADR bila perlu) sesuai kode; fase ✅ dan ringkasan fase di PROGRESS; entri CHANGELOG fase dipindah ke rilis bertanggal; `bun run verify` lulus dan situs live dicek; laporan ke pemilik.

## Fase 11: Chatbot "Tanya Harry" di sudut (`docs/11-roadmap.md` §E, D13, D14)

Rencana rinci (arsitektur, batas, keamanan) di `docs/11-roadmap.md` §E. Pratinjau yang dipilih pemilik: https://claude.ai/artifact/9bHCrGGLHm7t1BJoh2fV7a (bagian 3).

- [ ] **T11.1** ADR 0014 + pengetahuan dari konten
  - Kriteria: ADR 0014 (layanan terpisah, penyedia, privasi tanpa penyimpanan, batas, tanpa vector DB, widget sudut, kill switch); `knowledge.json` (lengkap, untuk Gemini) dan `knowledge-compact.json` (≤ 5 ribu token, untuk Groq) dibuat saat build dari `content/` publik saja, beserta daftar path situs yang boleh ditautkan; tes: tanpa nomor HP, tanpa draf, ukuran di bawah batas, path valid.
- [ ] **T11.2** Layanan `services/assistant` (`POST /api/ask`, `GET /api/ask/health`)
  - Kriteria: penyedia Gemini/Groq direfaktor ke `src/lib/ai/` (dipakai juga draf T8.2); validasi masuk (Origin, ukuran, 1–500 karakter, riwayat ≤ 6 pesan, bot); batas per pengunjung 10/jam dan 30/hari (hash harian, tanpa IP), total 300/hari, ≤ 3 permintaan bersamaan, timeout 20 s; jawaban JSON tervalidasi (teks biasa, tautan hanya path situs, pola nomor HP ditolak), Gemini → Groq → pesan cadangan; kill switch `ASSISTANT_ENABLED`; log tanpa teks pertanyaan; tes unit dengan penyedia tiruan.
- [ ] **T11.3** Infrastruktur: Docker, deploy, Caddy (+ `/security-review`)
  - Kriteria: target `assistant` di Dockerfile + matrix deploy; service `assistant` di compose (hardening, 128 MB, tanpa volume); Caddy `/api/ask*` (no-store); CSP tetap; `.env.example`, docs/07 dan docs/10 (key terpisah, mematikan fitur, kuota); `test:e2e:docker` mencakup health.
- [ ] **T11.4** Widget chat di sudut
  - Kriteria: tombol kecil di semua halaman `PageLayout` (bukan halaman cetak), tersembunyi tanpa JS; panel dimuat saat diklik; dialog non-modal yang ramah keyboard dan pembaca layar; contoh pertanyaan, hapus percakapan, pemberitahuan privasi; percakapan bertahan antar-halaman dalam satu tab (`sessionStorage`); fallback CV + email saat server mati/batas habis; lembar bawah di HP tanpa menutupi footer; EN/ID; event statistik `ask` tanpa teks; e2e dengan API tiruan + axe; Lighthouse tetap ≥ 90/95.
- [ ] **T11.5** Uji kualitas dan keamanan
  - Kriteria: ±30 pertanyaan uji (fakta EN/ID, di luar topik, data pribadi, prompt injection, tautan luar/HTML) dijalankan lewat workflow manual `assistant-eval.yml` (secret repo, tanpa laptop); hasil di `docs/assistant-eval.md`; prompt diperbaiki sampai lulus; `/security-review` seluruh fase.
- [ ] **T11.6** Peluncuran dan pemantauan
  - Kriteria: pemilik membuat key Gemini dan Groq terpisah dan memasangnya di server (panduan di docs/10); fitur dinyalakan setelah T11.5 lulus; situs live dicek; jumlah pertanyaan tampil di statistik privat.
- [ ] **T11.7** Penutupan Fase 11: rapikan dan dokumentasikan (AGENTS.md §2a)
  - Kriteria: sesuai checklist §2a.

## Fase 12: Formulir kesan & pesan bermoderasi (`docs/11-roadmap.md` §F, D15)

- [ ] **T12.1** Formulir + antrean moderasi (D15)
  - Kriteria: `POST /api/messages` (honeypot, batas per IP, validasi), disimpan sebagai *pending* di SQLite, tidak pernah tampil otomatis; pemilik meninjau lewat perintah/halaman ber-token; yang disetujui masuk `content/messages.yaml` lewat PR; privasi dan penghapusan data dijelaskan.
- [ ] **T12.2** Penutupan Fase 12: rapikan dan dokumentasikan (AGENTS.md §2a)
  - Kriteria: kode/dependency/branch yang tidak terpakai dihapus; README, docs/02, docs/04 (dan docs/07/10, ADR bila perlu) sesuai kode; fase ✅ dan ringkasan fase di PROGRESS; entri CHANGELOG fase dipindah ke rilis bertanggal; `bun run verify` lulus dan situs live dicek; laporan ke pemilik.

## Fase 13: 3D tambahan (`docs/11-roadmap.md` §H, D17)

Pratinjau yang disetujui pemilik: https://claude.ai/artifact/4FEfd4Ce4LKWzeaYZB9gfw (privat). Aturan 3D di `docs/03-design-system.md` §6 berlaku untuk semua: HTML setara sebagai fallback, mati otomatis di perangkat lemah, satu frame diam untuk reduced motion, berhenti saat tidak terlihat, ≤ 180 KB JS 3D per halaman, Lighthouse ≥ 90/95.

- [ ] **T13.1** Peta proyek di halaman Projects + komponen bersama
  - Kriteria: studi kasus sebagai titik di ruang 3D per bidang (kategori dari `profile.projects.categories`), hover/ketuk menampilkan judul, klik membuka studi kasus, filter bidang yang ada ikut menyorot; putar/hover/label menjadi modul bersama di `src/scenes/core/`; tanpa 3D tetap grid kartu; e2e + axe; Lighthouse `/projects/` ≥ 90.
- [ ] **T13.2** 404 ala computer vision
  - Kriteria: halaman melayang dan kotak deteksi (dari kartu foto) memindai lalu mengunci "page · not found 0.99"; teks 404 dan tautan tetap HTML; label dari kamus UI (EN/ID).
- [ ] **T13.3** Rasi skill di halaman About
  - Kriteria: grup skill dari `skills.yaml` sebagai rasi, sorot per grup; tanpa 3D tetap daftar chip; hanya grup `show_on_web`.
- [ ] **T13.4** Globe pengunjung di halaman Statistik
  - Kriteria: titik negara dari statistik publik yang sudah ada (tanpa data baru yang disimpan); tabel koordinat negara statis; tanpa 3D atau saat API mati tetap daftar negara.

---
- [ ] **T13.5** Penutupan Fase 13: rapikan dan dokumentasikan (AGENTS.md §2a)
  - Kriteria: kode/dependency/branch yang tidak terpakai dihapus; README, docs/02, docs/04 (dan docs/07/10, ADR bila perlu) sesuai kode; fase ✅ dan ringkasan fase di PROGRESS; entri CHANGELOG fase dipindah ke rilis bertanggal; `bun run verify` lulus dan situs live dicek; laporan ke pemilik.

## Keputusan pemilik

Semua keputusan D1–D7 sudah dijawab pada 2026-10-05.

| # | Pertanyaan | Keputusan |
|---|---|---|
| D1 | Lisensi | Kode **MIT** (`LICENSE`); isi `content/` *all rights reserved* |
| D2 | Teks badge status di hero | **Tidak ada** (`status_badge` kosong) |
| D3 | Latar foto | **Tetap biru** |
| D4 | Analytics | **Tanpa layanan analytics terpisah.** Statistik tampil langsung di situs (ADR 0009 menggantikan 0004; Fase 5 ditulis ulang) |
| D5 | Memilih repo GitHub | **Bisa:** `content/github.yaml` (`include`/`exclude`) dan/atau topic `portfolio` (T3.1) |
| D6 | Sertifikat Azure | **Tidak diperpanjang**, tetap tersembunyi otomatis |
| D7 | Spesifikasi server | Dibaca dari server via SSH: IdeaPad 300S-11IBR, Celeron N3050, RAM 1,8 GB, SSD 500 GB (header `docs/07-deployment.md`). OS diinstal ulang pemilik menjadi **Debian 13 (trixie)** pada 2026-10-06 (dari fastfetch pemilik); Docker 29.8.2 + Compose 5.6.0 (dibaca via SSH setelah deploy, 2026-10-06) |
| D8 | Baris peran | **AI Product Manager** di website, CV umum, Portfolio PDF, dan JSON-LD (2026-10-07). Jabatan di Pengalaman tetap faktual (Founder & CEO, AI Engineer) |
| D9 | Positioning | **AI Product Manager dengan kemampuan AI engineering**: suara produk lebih dulu (masalah pengguna, peluncuran, metrik), kemampuan AI sebagai pembeda; jalur lain lewat varian CV (2026-10-07) |
| D10 | Varian CV | **6 varian** (AI/ML, Data Engineer, Data Analyst, Product Manager, Project Manager, Management Trainee; Product dan Project dipisah 2026-10-08). **CV per perusahaan tidak dibuat** (2026-10-07). PDF varian dibuat saat deploy di `/downloads/cv/` (pemilik tidak ingin membuatnya di laptop) dan **ditautkan di footer** lewat halaman `/cv/` "CV per posisi" (label footer: "Resumes" / "Resume", pilihan pemilik; istilah "CV" tetap dipakai di tempat lain), atas pilihan pemilik walau disarankan tetap tersembunyi; halaman tetap noindex agar hasil pencarian tetap memuat positioning utama (2026-10-08). Varian MT memakai baris peran "Informatics Graduate · Technology & Leadership" karena MT adalah program yang dilamar |
| D11 | Skill tambahan | Dikonfirmasi satu per satu (2026-10-08): SQL, Pandas/NumPy, scikit-learn, Apache Airflow, Apache Spark/PySpark, Vertex AI, BigQuery, Cloud Run, LangChain, Power BI, Tableau, Looker/Looker Studio, Figma, Jira, Notion, Scrum/Agile, Git, Linux |
| D12 | Studi kasus bahasa Indonesia | **Terjemahkan semua** studi kasus; **istilah teknis/asing tidak diterjemahkan** (mis. *false negative*, *edge deployment*, *pipeline*) (2026-10-07) |
| D15 | Kesan & pesan (dulu "testimoni") | **Langsung dengan formulir bermoderasi**: tidak ada yang tampil sebelum disetujui pemilik (2026-10-07). Fase 12 tidak lagi opsional |
| D17 | 3D tambahan | **Keempatnya** (peta proyek, 404, rasi skill, globe pengunjung), di halaman selain beranda, **setelah Fase 11 dan 12**, urutan Proyek → 404 → Skill → Globe (2026-10-08) |
| D13 | Asisten AI: lanjut dan letaknya | **Lanjut, sebagai chatbot mengambang di sudut kanan bawah setiap halaman** (bukan halaman cetak), dipilih setelah membandingkan pratinjau dengan versi About + tombol hero (2026-10-08) |
| D14 | Asisten AI: penyedia & penyimpanan | **Gemini utama, Groq cadangan** (batas tier gratis Groq dicek di ADR T11.1), dengan pemberitahuan privasi singkat di bawah kotak tanya; **teks pertanyaan tidak disimpan**, hanya jumlahnya di statistik privat (2026-10-08) |
| D16 | Format angka | **Ikuti aturan baku tiap bahasa**: EN `92.5%`/`12,000`, ID `92,5%`/`12.000` (2026-10-08; menggantikan usulan "titik untuk semua") |

**Belum diputuskan:** tidak ada (D8–D17 sudah diputuskan pemilik). Keputusan baru ditambahkan di sini dengan rekomendasinya.

## Catatan data

- Alibaba Cloud Certified Associate **kedaluwarsa Nov 2026**. Setelah lewat tanggalnya, sertifikat otomatis hilang dari web dan CV (`expires` di `content/certifications.yaml`).
- Isian pemilik (7 `TODO(owner)`) dan review 55 terjemahan ID **selesai 2026-10-07**; lihat `docs/progress-archive.md`. Terjemahan baru tetap perlu dibaca pemilik sebelum dianggap final.

---

## Log sesi

Format: `### YYYY-MM-DD · <agent/orang> · <tugas>`, lalu poin: dikerjakan / belum / langkah berikutnya / catatan. Entri terbaru di atas. Simpan sekitar 5 entri terakhir di sini; entri yang lebih lama dipindah ke [`docs/progress-archive.md`](docs/progress-archive.md) agar file ini tetap ringkas.

### 2026-10-08 · Claude Code (Opus) · T9.6 penutupan Fase 9 (ringkasan fase)
- **Dibangun di Fase 9:** positioning **AI Product Manager** di hero, About, CV umum, Portfolio, JSON-LD (T9.1); `skills.yaml` 8 grup dengan `show_on_cv` agar CV umum tetap 2 halaman (T9.2); 11 studi kasus bahasa Indonesia di `content/projects/id/` dengan fallback dan tes kesamaan struktur (T9.3); bagian "Kind words / Kesan & pesan" dari `content/messages.yaml`, tersembunyi selama kosong (T9.4); format angka per bahasa lewat `localizeNumber` + tes (T9.5). Tambahan di luar tugas: profil Medium, judul "Finalist", template prompt sesi.
- **Keputusan pemilik:** D8, D9, D11, D12, D15, D16 (dan rencana D13, D14, D17 untuk Fase 11 dan 13).
- **Penutupan:** satu kunci teks UI tak terpakai (`portfolio.page`) dan `src/lib/seo/.gitkeep` dihapus; tidak ada dependency, komponen, atau aset yang tak terpakai; tidak ada `TODO`; semua `test.skip` beralasan. README, `docs/02` (struktur folder kini sesuai kode), `docs/11` (Fase 9–13, tabel keputusan D8–D17), `docs/README.md`, dan tabel `AGENTS.md` §1 diperbarui. CHANGELOG punya rilis **1.0.0 (2026-10-07, Fase 0–8)** dan **1.1.0 (2026-10-08, Fase 9)**; `package.json` ikut 1.1.0. Branch lokal `feat/T9.2-skills` dihapus setelah perbaikan `docs/06` di dalamnya (commit `911d2d2`, belum ada di `main`, berbeda dari catatan serah terima) dibawa ke `main`; branch remote `drafts/case-study-camera-genai` dihapus.
- **Sisa untuk pemilik:** headline LinkedIn "AI Product Manager"; meninjau 12 PDF varian di `/cv/` (T10.3); mengisi `content/messages.yaml` bila sudah ada pesan yang diizinkan; memastikan run draf AI dua bahasa pertama (tab *Actions* → *Case study drafts*).
- **Cek situs live (2026-10-08, build 06:20 UTC, ±17 menit setelah push):** beranda, About, Projects, studi kasus, `/stats/` EN/ID, `/cv/` (12 PDF varian), 4 PDF utama, `/api/health`, dan `/api/stats/summary` menjawab 200; baris peran "AI Product Manager" dan angka gaya Indonesia (`92,5%`) tampil benar.
- **Fase berikutnya:** T11.1 (ADR 0014 + pengetahuan dari konten); T10.4 setelah tinjauan T10.3.

### 2026-10-08 · Claude Code (Opus) · Akhir sesi: ringkasan dan serah terima
- **Sudah (sesi ini):** T9.1 positioning, T9.2 skill (8 grup, CV umum tetap 2 halaman), T9.3 studi kasus ID, T9.4 kesan & pesan, T9.5 format angka; Fase 10 T10.1–T10.2 dan isi T10.3 (6 varian di `/cv/`, tautan footer "Resumes"); Medium dan judul "Finalist"; aturan penutupan fase (`AGENTS.md` §2a); rencana Fase 11 (chatbot di sudut, D13/D14) dan Fase 13 (empat 3D, D17). Semua sudah di-push kecuali commit penutup ini.
- **Belum:** T9.6 penutupan Fase 9; T10.3 tinjauan pemilik atas 12 PDF varian lalu T10.4; seluruh Fase 11–13. Uji draf AI dua bahasa belum terjadi (run terjadwal 2026-10-08 02:41 UTC belum muncul sampai 05:44 UTC; GitHub bisa menunda atau melewatkan jadwal): cek tab *Actions*, atau jalankan *Case study drafts* manual.
- **Langkah berikutnya:** (1) T9.6 sesuai `AGENTS.md` §2a, termasuk menghapus branch lokal `feat/T9.2-skills` (tercampur dengan commit sesi lain, isinya sudah di `main`) dan branch remote `drafts/case-study-camera-genai` yang sudah di-merge; (2) T11.1.
- **Catatan:** jangan jalankan dua sesi yang menulis kode di folder yang sama; sesi lain sempat berpindah branch dan meng-stash di tengah T9.2. Pratinjau pemilik: 3D https://claude.ai/artifact/4FEfd4Ce4LKWzeaYZB9gfw, chatbot https://claude.ai/artifact/9bHCrGGLHm7t1BJoh2fV7a. Commit ini belum di-push (permintaan pemilik).

### 2026-10-08 · Claude Code (Opus) · Rencana Fase 11: chatbot di sudut
- Pemilik membandingkan pratinjau dan memilih **chatbot di sudut** (D13), lalu meminta rencana yang matang. Rencana disetujui: layanan terpisah `services/assistant`, pengetahuan lengkap (Gemini) + ringkas (Groq, karena batas ±8 ribu token/menit), tanpa penyimpanan percakapan di server, batas per pengunjung dan harian, validasi jawaban, kill switch, widget yang dimuat saat diklik, uji ±30 pertanyaan lewat workflow manual.
- Dikerjakan: Fase 11 ditulis ulang (T11.1–T11.7), D13 dicatat, `docs/11-roadmap.md` §E diperbarui. Belum ada kode.
- Langkah berikutnya: T9.6 (penutupan Fase 9), lalu T11.1.
