# PROGRESS

> Satu-satunya sumber kebenaran tentang status proyek. **Perbarui setiap kali menyelesaikan atau menghentikan tugas.**
> Legenda: `[ ]` belum · `[~]` sedang dikerjakan (tulis siapa) · `[x]` selesai · `[!]` terblokir (tulis alasannya)

**Terakhir diperbarui:** 2026-10-06 · **Fase aktif:** Fase 7 · **Tugas berikutnya:** `T7.2` (pemilik: pasang di server Debian 13, docs/07 §3)

## Ringkasan

| Fase | Tujuan | Status |
|---|---|---|
| 0 | Fondasi: dokumentasi, keputusan, data konten | ✅ Selesai |
| 1 | Scaffold aplikasi, tooling, skema konten, i18n, layout dasar | ✅ Selesai |
| 2 | Halaman & UI (hero kartu 3D, journey 3D, proyek, about, kontak) | ✅ Selesai |
| 3 | Sinkronisasi proyek dari GitHub | 🔄 T3.3 siap (cron di `deploy.yml`), menunggu run pertama |
| 4 | Generate PDF CV & Portfolio | ✅ Selesai |
| 5 | Statistik bawaan di situs & link pelacak (ADR 0009) | ✅ Selesai |
| 6 | Docker, CI/CD, deploy ke home server | ✅ Image terbit di GHCR; tinggal pemasangan di server oleh pemilik |
| 7 | Kualitas: SEO, a11y, performa, header keamanan | ⬜ |
| 8 | Otomasi lanjutan: CMS, draf konten oleh AI | ⬜ |

Progres keseluruhan: **Fase 0–2, 4, 5 selesai; Fase 3 dan 6 menunggu run pertama GitHub Actions — ≈70%**

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
- [~] **T3.3** Jalankan sinkronisasi terjadwal (cron di GitHub Actions, tiap 6 jam): jadwal `17 */6 * * *` di `deploy.yml` membangun ulang image (GitHub + PDF). *Selesai setelah run terjadwal pertama berhasil.*

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
- [~] **T6.3** GitHub Actions `deploy.yml`: verify → build & push `portfolio-web`/`portfolio-stats` ke GHCR (`latest` + `sha-…`) saat push ke `main`, tiap 6 jam, dan manual (run pertama sukses 2026-10-06; image bisa ditarik tanpa login)
- [x] **T6.4** `docker/compose.yml` produksi: `web` (96 MB) + `stats` (128 MB), read-only, tanpa capability; update lewat systemd timer, **bukan Watchtower** (diarsipkan; ADR 0010). Cloudflare Tunnel diurus pemilik
- [x] **T6.5** Halaman `/homelab`: status server live dari `/api/health` (tanpa Uptime Kuma: tidak perlu container tambahan; saat server mati, Cloudflare menyajikan salinan dan badge menulis offline)

## Fase 7: Kualitas

- [x] **T7.1** SEO: sitemap (dari HTML build, dengan hreflang), robots.txt, gambar OG 1200×630 per halaman (22, EN+ID), JSON-LD `Person`/`WebSite`/`CreativeWork`, canonical + hreflang
- [ ] **T7.2** Lighthouse CI di GitHub Actions (target: Perf ≥ 90 mobile, A11y/BP/SEO ≥ 95)
- [ ] **T7.3** Header keamanan (CSP, HSTS, dll.), target nilai A di securityheaders.com
- [ ] **T7.4** Uji e2e utama: ganti bahasa, download CV, navigasi keyboard, fallback tanpa WebGL

## Fase 8: Otomasi lanjutan

- [ ] **T8.1** CMS berbasis Git (Keystatic atau Pages CMS) untuk mengedit `content/` dari browser
- [ ] **T8.2** Workflow AI: repo baru bertopic `portfolio` → draf case study + terjemahan ID sebagai Pull Request (tidak auto-merge)
- [x] **T8.3** *(draf, 2026-10-05; **menunggu review pemilik**)* Terjemahkan semua `highlights` di `content/` ke Bahasa Indonesia (bisa dibantu AI, wajib direview pemilik)

---

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
| D7 | Spesifikasi server | Dibaca dari server via SSH: IdeaPad 300S-11IBR, Celeron N3050, RAM 1,8 GB, SSD 500 GB, Ubuntu 24.04, Docker 29 (`content/homelab.yaml`) |

## Catatan data

- Alibaba Cloud Certified Associate **kedaluwarsa Nov 2026**. Setelah lewat tanggalnya, sertifikat otomatis hilang dari web dan CV (`expires` di `content/certifications.yaml`).
- **Perlu review pemilik:** 55 terjemahan `highlights` (EN → ID) di `experience.yaml`, `education.yaml`, `trainings.yaml` dibuat oleh AI pada 2026-10-05. Periksa terutama istilah dan angka.
- Proyek dengan `draft: true` di `content/projects/` butuh detail/tautan dari pemilik sebelum ditampilkan.

---

## Log sesi

Format: `### YYYY-MM-DD · <agent/orang> · <tugas>`, lalu poin: dikerjakan / belum / langkah berikutnya / catatan. Entri terbaru di atas.

### 2026-10-06 · Claude Code (Opus) · T7.1
- **Dikerjakan:** `src/lib/seo/` murni (`og.ts`: nama gambar per halaman + pembaca meta; `sitemap.ts`: sitemap + robots; `json-ld.ts`: Person/WebSite/CreativeWork, tanpa email, `<` di-escape) + `person.ts` (khusus Astro); `BaseLayout` menulis `og:image` (+ ukuran, alt), `twitter:card=summary_large_image`, dan blok JSON-LD; `src/pages/og-template.astro` + `scripts/generate-og.ts` (Chromium, JPEG 1200×630, anggaran 150 KB; terbesar 64 KB); `scripts/generate-sitemap.ts`; `src/pages/robots.txt.ts`; server statis dipindah ke `scripts/lib/static-server.ts` (dipakai PDF & OG); Caddy: `/og/*` cache 1 hari.
- **Verifikasi:** unit 12 (`tests/unit/seo`), e2e `seo.spec.ts` 16 (robots, sitemap tanpa halaman cetak/404, gambar 1200×630 per halaman, JSON-LD); gambar EN/ID diperiksa visual (bug: judul gelap karena gaya global `h1` → diperbaiki).
- **Catatan:** pemilik tidak perlu mengisi apa pun; judul/deskripsi diambil dari konten (docs/04 §5). Setelah situs online: daftarkan `sitemap.xml` di Google Search Console.

### 2026-10-05 · Claude Code (Opus) · T6.1–T6.5, T5.2, T3.3 (Fase 6 lokal)
- **Dikerjakan:** `docker/Dockerfile` (stage `build`/`web`/`stats`), `docker/Caddyfile`, `docker/compose.yml`, `docker/deploy/` (update.sh, backup-stats.sh, systemd service + timer), `.github/workflows/ci.yml` + `deploy.yml`, ADR 0010 (timer menggantikan Watchtower yang diarsipkan), `src/lib/security/csp.ts` + `scripts/generate-csp.ts` (CSP hash, tanpa `unsafe-inline` untuk script), `scripts/precompress.ts`, `ServerStatus` di `/homelab`, `tests/e2e/deployment.spec.ts` + `bun run test:e2e:docker`, docs/07 ditulis ulang.
- **Bug yang tertangkap saat uji container:** (1) font Plus Jakarta Sans kecil di-*inline* Vite sebagai `data:` → diblokir CSP → `assetsInlineLimit` tidak meng-inline font + `generate-csp.ts` gagal jika ada `data:font`; (2) `encode zstd gzip` membuat Caddy 74 MB RAM → kompresi saat build (`precompressed br gzip`) + `GOMEMLIMIT` → 22 MB; (3) `backup-stats.sh` memakai `docker compose cp` yang tidak bisa membaca tmpfs → dialirkan lewat `exec cat` + file `.part`, dan sisa run gagal dibersihkan dulu.
- **Verifikasi:** `bun run verify` lulus; image dibangun lokal (web ±100 MB, stats ±260 MB); stack `-p portfolio-local`: 98 tes e2e lulus terhadap container (header, CSP tanpa pelanggaran di semua halaman + 3D, cache, kompresi, 404, API stats lewat Caddy, health); event nyata tercatat dan muncul di laporan privat; backup dua kali berturut-turut, `integrity_check: ok`; `actionlint` bersih.
- **Update 2026-10-06:** run Deploy pertama sukses (verify + publish web & stats); package GHCR sudah publik (pull anonim 200). T3.3 selesai setelah run terjadwal pertama.
- **Belum:** pemilik: pasang di server (docs/07 §3), arahkan Cloudflare Tunnel ke `http://localhost:8080`.
- **Catatan:** run terjadwal membuat image baru tiap 6 jam (PDF tidak byte-identik), jadi server me-restart container ±4×/hari selama beberapa detik; Cloudflare *Always Online* menutupinya.

### 2026-10-05 · Claude Code (Opus) · T5.5 (Fase 5 selesai kecuali T5.2)
- **Dikerjakan:** `refReportSchema`/`privateReportSchema` + `formatRefReport` (murni, tabel rata, terbaru dulu) di `src/lib/stats/summary.ts` (tipe juga dipakai layanan); `scripts/stats-report.ts` (`bun run stats:report`; `STATS_ADMIN_TOKEN` wajib, `STATS_URL` opsional; pesan jelas untuk token kosong/salah, server tak terjangkau, HTTP error). Panduan di `docs/08-analytics.md` §4.
- **Verifikasi:** unit 3 (tabel, kosong, cocok dengan output layanan); uji nyata terhadap layanan lokal: 2 ref tampil, unduhan CV tercatat "yes", token salah → pesan + exit 1, tanpa token → pesan + exit 1; `bun run verify` lulus.
- **Sisa Fase 5:** T5.2 (service `stats` di compose + route Caddy + batas memori + backup) dikerjakan bersama T6.1/T6.4.

### 2026-10-05 · Claude Code (Opus) · T5.4
- **Dikerjakan:** `src/lib/stats/summary.ts` (skema Zod ringkasan dipakai bersama layanan & halaman; `formatCount`, `countryName` via `Intl.DisplayNames`, `formatSince`); `SiteStats.astro` di `/homelab` (4 angka + 3 daftar teratas + "dihitung sejak"; HTML awal "—", diisi dari `/api/stats/summary`; status `aria-busy`/`role=status`; hanya ter-build bila statistik aktif).
- **Verifikasi:** unit (format EN/ID, nama negara, skema cocok dengan output layanan); e2e 5 (angka & format per bahasa, layanan 502 → pesan tidak tersedia, respons rusak/berbahaya ditolak tanpa merender HTML, daftar kosong, axe); screenshot desktop & HP gelap. Tes homelab lama diperketat (menghitung `li` hanya di bagian pipeline).

### 2026-10-05 · Claude Code (Opus) · T5.3
- **Dikerjakan:** `src/lib/stats/beacon.ts` (murni: `shouldSend` — build aktif, DNT/GPC, localhost hanya dengan flag `stats:debug`; `pageviewPayload` — path tanpa query, `ref` valid), `StatsBeacon.astro` (hanya ter-build bila `PUBLIC_STATS_ENABLED=true`; `sendBeacon` pageview + klik `data-download`/`data-outbound`), `BaseLayout` prop `track` (off untuk halaman cetak), `data-outbound` di Footer & Contact, proxy dev `/api/stats` → :8787, `src/env.d.ts`. E2E build kini `PUBLIC_STATS_ENABLED=true` (beacon tetap diam di localhost tanpa flag).
- **Temuan:** `trailingSlash: 'always'` membuat dev server Astro mengembalikan 404 untuk `/api/stats/...` sebelum proxy → dev memakai `'ignore'`, build tetap `'always'`. Uji integrasi pertama tercatat 0 event karena User-Agent `HeadlessChrome` difilter sebagai bot (perilaku yang benar).
- **Verifikasi:** unit 5 (beacon); e2e 5 (pageview + ref tanpa query, unduhan & klik LinkedIn, diam di localhost tanpa flag, menghormati GPC, halaman cetak tanpa beacon); integrasi nyata browser → proxy → layanan → SQLite: 3 pageview (ref tercatat), 1 unduhan CV, visitor hanya hash 32 karakter.

### 2026-10-05 · Claude Code (Opus) · T5.1
- **Dikerjakan:** `src/lib/stats/events.ts` (skema payload Zod bersama: pageview/download/outbound, path tanpa query, `ref` terbatas), `src/lib/stats/privacy.ts` (bot, DNT/GPC, alamat via Cloudflare, negara, host referrer, hash harian, hari UTC). `services/stats/`: `store.ts` (SQLite bawaan Bun: events + salt harian; salt lama dihapus; ringkasan semua waktu & 30 hari, top halaman/referrer/negara; laporan `?ref` per visitor-hari), `handler.ts` (Request → Response: selalu 204 untuk event, cek origin, batas body 2 KB, rate limit 60/menit/visitor, cache ringkasan 300 s, token privat dengan perbandingan waktu-konstan, 404 jika token kosong), `server.ts` (env `STATS_DB_PATH`, `STATS_PORT`, `STATS_SITE_HOST`, `STATS_ADMIN_TOKEN`). `bun run stats:dev`. `.data/` di-gitignore.
- **Verifikasi:** unit 20 tes (skema, privasi, salt, agregasi, `ref` tidak bocor ke publik, semua jalur handler); uji nyata: 1.000 event → 351 pengunjung unik, referrer jadi host, laporan `?ref` hanya dengan token (tanpa token 401).
- **Temuan & keputusan:** RAM 80–84 MB, bukan < 64 MB. Diukur per modul: runtime Bun 36 MB, import `zod` (termasuk `zod/mini`) +32 MB, layanan ±4 MB; `--smol` tidak membantu. Validator manual ditolak (duplikasi aturan). Kriteria direvisi ke ≤ 96 MB dengan batas container 128 MB (server: 1,8 GB, terpakai ±765 MB).

### 2026-10-05 · Claude Code (Opus) · T4.4 (Fase 4 selesai)
- **Dikerjakan:** tombol "Download CV" + "Portfolio PDF" (EN/ID) di hero (menggantikan CTA sementara mailto/LinkedIn) dan di halaman About; URL dari `downloadPath()`, atribut `download` dan `data-download` untuk statistik T5.3; `DownloadIcon`.
- **Verifikasi:** e2e: href per bahasa, setiap tombol di 4 halaman mengarah ke PDF yang ada (200, `application/pdf`), klik memicu unduhan bernama `Harry-Mardika-CV-EN.pdf`; screenshot desktop & HP gelap; `bun run verify` lulus.
- **Ringkasan Fase 4:** CV ATS 2 halaman + Portfolio visual 8 halaman, EN & ID, dibuat otomatis tiap build (±5 detik), ber-tag, dalam anggaran ukuran; highlight diterjemahkan (menunggu review pemilik).

### 2026-10-05 · Claude Code (Opus) · T4.3
- **Dikerjakan:** `src/lib/downloads.ts` (murni: nama file, URL, halaman sumber; dipakai skrip & tombol), `scripts/generate-pdf.ts` (`Bun.serve` port acak + Chromium; PDF ber-tag dengan outline; anggaran ukuran CV < 1 MB, Portfolio < 3 MB menggagalkan build), `bun run build` = fetch → astro → pdf. `BUILD_OUT_DIR` menggantikan flag `--outDir` (Astro & skrip PDF membaca variabel yang sama). `pdfjs-dist` (dev) untuk membaca PDF dalam tes.
- **Hasil:** build lengkap ±5 detik; CV-EN/ID 2 halaman ±195 KB; Portfolio-EN/ID 8 halaman ±440 KB; semua `Tagged: yes` dengan judul dokumen.
- **Verifikasi:** unit `downloads` 3/3; e2e PDF 4/4 (status, content-type, ukuran, jumlah halaman, judul, teks EN/ID, tanpa nomor HP); `bun run verify` lulus.
- **Catatan:** metadata author/keywords tidak diisi (keterbatasan Chromium; docs/09 diperbarui). Docker build (T6.1) wajib memasang Chromium.
- **Tes flaky ditemukan:** satu tes a11y Journey gagal karena 3D belum siap dalam 15 s saat 8 worker paralel merender WebGL di CPU (lulus 42/42 bila dijalankan sendiri). Batas waktu dijadikan konstanta `SCENE_READY_TIMEOUT` = 30 s di `tests/e2e/helpers.ts`.

### 2026-10-05 · Claude Code (Opus) · T4.2
- **Dikerjakan:** `PortfolioDocument` + `/print/portfolio/` dan `/id/print/portfolio/` (A4 landscape, 8 halaman: sampul dengan foto, profil + statistik + 5 penghargaan teratas, journey statis pengganti 3D, 3 proyek featured dengan isi case study, grid "proyek lainnya" 4×4 (case study non-featured + repo GitHub), keahlian & kontak).
- **Penyesuaian:** grid semula dibatasi 12 kartu → 2 dari 14 proyek asli terpotong diam-diam; kini 4 kolom, maks. 16, ringkasan dipotong 4 baris. Huruf halaman proyek diperbesar.
- **Verifikasi:** dengan data asli: 14/14 kartu, **0 elemen melewati tepi halaman** di 8 halaman (EN & ID), PDF uji ±400 KB; e2e halaman portfolio (8 halaman, foto, 5 milestone, noindex, tanpa nomor HP, jumlah kartu); `bun run verify` lulus.
- **Catatan proses:** di sesi ini ditemukan bahwa baris setelah heredoc `git commit -F - <<'EOF'` berada di luar rantai `&&`; tidak ada commit gagal yang masuk, tetapi kini dipakai skrip `ship` dengan `set -e` dan aturannya dicatat di `AGENTS.md`.

### 2026-10-05 · Claude Code (Opus) · Terjemahan highlight (T8.3 dimajukan untuk CV-ID)
- **Alasan:** CV-ID (T4.1) bercampur bahasa karena highlight hanya EN.
- **Dikerjakan:** 55 highlight diterjemahkan (gaya CV: kata kerja aktif, desimal koma, angka/nama teknologi tetap). Item skill kini boleh `string | LocalizedText` (grup Bahasa & Kepemimpinan diterjemahkan); penerbit penghargaan boleh `LocalizedText` (Kemdiktisaintek). Kalimat skripsi diselaraskan ke "YOLO26".
- **Verifikasi:** CV-ID semula meluber 1 baris → font CV 8,6 pt → **EN & ID tetap 2 halaman**; sisa kata Inggris di CV-ID hanya nama resmi (program/sertifikat); `bun run verify` lulus.

### 2026-10-05 · Claude Code (Opus) · T4.1
- **Dikerjakan:** `PrintLayout` (selalu terang lewat opsi baru `forceTheme` di `BaseLayout`, noindex, tanpa canonical/hreflang, `@page` A4 dengan margin 10/11 mm, tampilan "kertas" di layar), `CvDocument` + `CvEntry` (satu kolom; judul standar; satu baris kepala per entri "Peran · Organisasi … Lokasi · Tanggal"; kontak sebagai teks; tanpa foto/ikon/grafik; tanpa nomor HP), halaman `/print/cv/` dan `/id/print/cv/` (data `show_on_cv`, sertifikat aktif).
- **Penyesuaian setelah render PDF uji:** awalnya 3 halaman; CV asli pemilik 2 halaman dengan jumlah kata yang sama (1.345 vs 1.318). Dirapatkan (8,7 pt, line-height 1,25, kepala entri satu baris, margin 10/11 mm) → **2 halaman, ±150 KB** untuk EN dan ID.
- **Verifikasi:** e2e halaman cetak (judul bagian EN/ID, tanpa img/svg/canvas, noindex, tanpa canonical, tanpa nomor HP, tema terang walau OS gelap, kontak teks, sertifikat kedaluwarsa tersembunyi); `bun run verify` lulus.
- **Catatan:** CV-ID masih memakai highlight bahasa Inggris (fallback); diterjemahkan pada tugas berikutnya.

### 2026-10-05 · Claude Code (Opus) · Kurasi repo GitHub (lanjutan T3.2)
- **Diminta pemilik:** memilih repo sendiri; beberapa proyek dipecah ke banyak repo.
- **Dikerjakan:** `include` di `github.yaml` kini menerima tiga bentuk: nama repo, `{ repo, description }` (deskripsi dwibahasa), dan `{ title, repos, description }` (grup → satu kartu, tertaut ke repo pertama; bahasa terbanyak, total bintang, push terakhir). Peringatan untuk nama hilang/privat/dikecualikan/duplikat. Case study bisa diklaim lewat repo anggota grup mana pun. Kartu menampilkan "N repositories" untuk grup; label bintang cukup "★ n".
- **Kurasi (dari README tiap repo, 2026-10-05):** 16 entri dari 41 repo: 6 repo terhubung ke case study (`links.repo`), 3 grup (Chatbot RAG Gunadarma 4 repo, Netflix Prize 3 repo, Leukemia ALL 2 repo), 7 repo tunggal dengan deskripsi dwibahasa. Tidak dipilih: repo tanpa README (`convert-model-to-hailo`), template/latihan dasar, dan proyek kecil lain.
- **Case study diaktifkan:** Aksara Jawa (ditulis ulang dari README: YOLO26 nano-cls, 20 karakter, visualisasi filter; tanpa angka akurasi karena tidak ada di README), Hoax, XSS, BCA. **Koreksi kejujuran metrik:** Hoax 89,6% dan BCA RMSE 0,0052 adalah nilai data latih; labelnya kini menyebut validasi (81,2% / 0,0186) sesuai README.
- **Verifikasi:** sinkron live tanpa peringatan; unit 180; e2e 140 lulus + 2 dilewati (tes filter tag kini aktif dan lulus); screenshot daftar & case study dicek.

### 2026-10-05 · Claude Code (Opus) · T3.2
- **Dikerjakan:** collection `githubRepos` (loader membaca cache; tidak ada file → kosong); `mergeProjects`/`itemTags`/`itemYear`/`normalizeRepoUrl` murni (`src/lib/content/project-items.ts`); `getGithubRepos`/`getProjectItems`; `ProjectCard` mendukung case study dan repo GitHub (badge "GitHub ↗", bahasa · tahun · ★ bintang, tag dari bahasa + topics); halaman Projects memakai item gabungan; beranda tetap hanya case study `featured`. Topic seleksi dibuang saat sinkron.
- **Isolasi data uji (ditemukan saat mengerjakan):** mode fixture semula menimpa cache asli, sehingga (a) repo palsu bisa dipakai sebagai "cache lama" saat GitHub tidak terjangkau, (b) `bun run dev` dan `dist/` menampilkan repo palsu setelah e2e. Perbaikan: cache mencatat `source` (`api`/`fixture`) dan fixture tidak pernah dipakai sebagai cadangan; `GITHUB_CACHE` + `--outDir dist-e2e` memisahkan build e2e; `bun run dev` menyinkron GitHub dulu.
- **Verifikasi:** unit 176/176; e2e 136 lulus + 4 dilewati (kartu GitHub: tautan, meta, tag, ID; beranda tanpa repo GitHub; urutan daftar); setelah e2e, `dist/` tidak dibuat dan cache asli tetap `source: api`; screenshot dicek; `bun run verify` lulus.

### 2026-10-05 · Claude Code (Opus) · T3.1
- **Dikerjakan:** `content/github.yaml` (username, topic, `include`, `exclude` [default: `harrymardika`, `portfolio`], opsi fork/arsip) + `githubConfigSchema`; `src/lib/github/` (`schemas`, `select` murni: seleksi + `missingIncludes` + `toGithubRepo`; `client` REST dengan paginasi, retry/backoff 500 ms → 1 s, gagal cepat saat rate limit/4xx, timeout 10 s; `sync` dengan I/O diinjeksi: fixture → cache segar → API → cache lama → daftar kosong); `scripts/fetch-github.ts` (`bun run fetch:github [--force]`), dijalankan sebelum `astro build`. E2E memakai `GITHUB_FIXTURE=tests/fixtures/github.json`.
- **Keputusan:** REST, bukan GraphQL (GraphQL selalu butuh token; REST tanpa token cukup untuk 1–2 request per build). Token opsional.
- **Verifikasi:** sinkron live: 41 repo publik, 0 terpilih (belum ada `include`/topic, sesuai harapan); unit 166/166 (seleksi, client dengan fetch palsu, semua jalur fallback sync), cakupan `src/lib/github` 95–100% baris; `bun run verify` lulus.
- **Catatan:** data GitHub belum ditampilkan di situs (T3.2). Pemilik belum memilih repo; usulan dari nama repo yang cocok dengan proyek draft disampaikan di chat.

### 2026-10-05 · Claude Code (Opus) · Keputusan D1–D7 + validasi ulang
- **Keputusan diterapkan:** `LICENSE` MIT (+ catatan hak cipta `content/`), `package.json` `license`; spesifikasi server dibaca via `ssh mardika-server` (perintah baca saja) ke `content/homelab.yaml`; Umami dihapus dari stack; ADR 0009 (statistik bawaan di situs) menggantikan ADR 0004; Fase 5 ditulis ulang (service Bun + SQLite di domain yang sama, tanpa cookie/IP, `?ref=` hanya untuk pemilik); T3.1 mendukung `content/github.yaml` (`include`/`exclude`) + topic; tabel keputusan diganti "Keputusan pemilik".
- **Validasi ulang:** tes baru `tests/e2e/links.spec.ts` menelusuri semua halaman dari `/` dan `/id/` dan memeriksa setiap tautan/gambar/stylesheet internal (0 rusak); audit path di dokumentasi (74 path; regex audit pertama ternyata tidak mencocokkan apa pun dan diperbaiki); audit teks hardcode di `.astro` (0); audit secret & nomor HP di file yang di-commit (0).
- **Ketidakkonsistenan yang diperbaiki:** lokasi PDF (`dist/downloads/`, bukan `public/downloads/`), pohon folder arsitektur (`components/contact/`, `lib/stats/`), folder kosong `src/lib/analytics` → `src/lib/stats`, `.gitkeep` usang di `tests/`.
- **Catatan penting dari spesifikasi server:** RAM 1,8 GB & Celeron 2 core → jangan build di server, batasi memori container, hindari database berat (dicatat di `docs/07-deployment.md`).

### 2026-10-05 · Claude Code (Opus) · T2.7 (Fase 2 selesai)
- **Dikerjakan:** `/homelab/` dari `content/homelab.yaml` (intro, 4 langkah pipeline deploy sesuai ADR 0005/docs 07, stack; bagian spesifikasi hardware hanya tampil jika diisi pemilik, D7) + `homelabSchema`/`getHomelab()`; menu "Homelab". `src/pages/404.astro` dwibahasa (satu h1, h2 untuk bahasa kedua, tautan ke `/` dan `/id/`), tanpa canonical/hreflang (opsi baru `linkAlternates` di `BaseLayout`). Tombol solid memakai amber di mode gelap.
- **Verifikasi:** `bun run verify` lulus; e2e homelab EN/ID, 404 (status 404, kedua bahasa, tanpa hreflang), axe bersih. Screenshot dicek.
- **Catatan:** spesifikasi server **tidak dikarang**; menunggu data pemilik. Status uptime live: T6.5.
- **Ringkasan Fase 2:** 8/8 tugas; halaman: beranda (hero 3D, journey 3D, proyek pilihan, kontak), Projects + 3 case study, About, Homelab, 404, semuanya EN/ID; menu HP.

### 2026-10-05 · Claude Code (Opus) · T2.6
- **Dikerjakan:** `src/components/contact/Contact.astro` di akhir beranda: kartu per kanal dari `socials` (email pertama dan selebar dua kolom, lalu LinkedIn, Instagram, GitHub), tombol salin email (hanya dengan JS, aman jika clipboard diblokir). Copy di `profile.yaml → contact`.
- **Verifikasi:** `bun run verify` lulus; e2e: urutan & href kanal, tidak ada nomor HP, salin email ke clipboard (Chromium), teks ID, tanpa JS tombol tersembunyi; axe beranda (sudah termasuk bagian ini) bersih. Screenshot desktop/HP dicek (email terpotong → kartu email dibuat penuh).

### 2026-10-05 · Claude Code (Opus) · T2.8
- **Dikerjakan:** `MobileMenu.astro` (tombol Menu + panel Popover API berisi Beranda + `NAV_ITEMS`, `aria-current`, item aktif amber di mode gelap), dipasang di `Header` (tampil < `md`). Tes header Projects/About kini juga berjalan di HP lewat menu.
- **Masalah penting ditemukan:** server preview untuk screenshot (sejak 10:44) tidak pernah berhenti karena pola `pkill` tidak cocok dengan nama proses `node_modules/.bin/astro preview`; dengan `reuseExistingServer`, Playwright tidak membangun ulang dan menguji `dist/` hasil build manual terakhir. **Perbaikan:** `reuseExistingServer: false` (e2e selalu build + server baru); preview manual dihentikan berdasarkan port. Seluruh suite dijalankan ulang dengan build baru: 109 lulus, 3 dilewati sesuai rencana. Hasil tugas sebelumnya tetap valid.
- **Verifikasi:** `bun run verify` lulus; e2e menu: buka, navigasi, `aria-current`, Escape, teks ID, tanpa JS, tidak tampil di desktop. Screenshot terang/gelap dicek.

### 2026-10-05 · Claude Code (Opus) · T2.5
- **Dikerjakan:** `/about/` (ringkasan, Pengalaman, Kepemimpinan & mengajar, Pendidikan, Pelatihan, Penghargaan, Sertifikasi aktif, Keahlian), komponen `TimelineItem` (highlight yang belum diterjemahkan diberi `lang="en"` di halaman ID) dan `AboutSection`; helper murni `splitExperience` (kategori seperti CV); menu "About". Kunci UI `journey.gpa` → `common.gpa`.
- **Verifikasi:** `bun run verify` lulus (unit 140, e2e termasuk urutan bagian, Present/Sekarang, sertifikat kedaluwarsa tersembunyi, `lang="en"`, axe EN/ID × terang/gelap). Screenshot desktop ID dan HP gelap dicek; tumpukan teks yang terlihat di satu screenshot terbukti artefak capture (0 overlap terukur).
- **Catatan:** "Microsoft Azure" tetap tampil sebagai *skill*; yang disembunyikan hanya *sertifikat* Azure yang kedaluwarsa.

### 2026-10-05 · Claude Code (Opus) · Perbaikan T2.4
- **Masalah:** commit T2.4 (`5752f03`) masuk ke `main` walau `bun run check` gagal (error TS `exactOptionalPropertyTypes` di `ProjectGrid.astro`), karena perintah dirangkai dengan `;` sehingga commit tetap jalan. Build dan semua tes tetap lulus; hanya typecheck yang gagal.
- **Perbaikan:** default `headingLevel = 3` di `ProjectGrid`. Script baru `bun run verify` (check → unit → e2e, berhenti saat gagal); `AGENTS.md` mewajibkan `bun run verify && git commit`.

### 2026-10-05 · Claude Code (Opus) · T2.4
- **Dikerjakan:** `/projects/` (grid + filter tag), `/projects/<slug>/` (case study Markdown via `render()`, metrik, tautan, kembali ke daftar; di `/id/` ada catatan bahasa dan `lang="en"` pada body), bagian "Proyek pilihan" di beranda (maks. 3 `featured`). Komponen `ProjectCard` (seluruh kartu dapat diklik lewat tautan judul), `ProjectGrid`, `TagFilter` (hanya untuk pengguna JS), `SelectedProjects`. Helper murni `collectTags(minCount)`, `filterByTag`, `tagKey`. `NAV_ITEMS` berisi Projects. Gaya `.prose` di `global.css`. Copy halaman di `profile.yaml → projects.intro`.
- **Keputusan:** filter hanya menampilkan tag yang dipakai ≥ 2 proyek dan disembunyikan jika < 2 tag seperti itu (saat ini tersembunyi: 3 proyek tanpa tag bersama). Judul kosong "What I learned" di `decklify.md` dipindah ke komentar TODO.
- **Verifikasi:** unit 139/139; e2e 80 lulus, 4 dilewati dengan alasan (filter belum punya data, menu HP = T2.8, keyboard di HP); axe bersih untuk daftar & detail (terang/gelap); `bun run check` lulus. Screenshot daftar/filter/detail ID/HP gelap/beranda dicek visual.
- **Catatan:** 6 proyek masih `draft: true` (menunggu data pemilik). Menu "Projects" belum terlihat di HP sampai T2.8.

### 2026-10-05 · Claude Code (Opus) · T2.3
- **Dikerjakan:** `Journey.astro` (satu `<ol>` = timeline fallback sekaligus label 3D), `MilestoneDetail.astro` (Popover API, tanpa JS), `src/scenes/journey-path/` (`layout.ts` murni: `pathPoints`, `sectionProgress`, `isReached`, `pathPlacement`; `index.ts` scene yang melaporkan posisi layar tiap titik). `resolveMilestoneSource`/`journeySpan` (murni) + `getJourney()`. Copy bagian di `profile.yaml → journey`.
- **Bug ditemukan & diperbaiki:** (1) `getCollection` mengurutkan berdasarkan id, sehingga urutan journey/skills teracak → parser menambah `position`; (2) progres scroll langsung penuh → rumus diperlambat (±0,66 saat bagian di tengah layar); (3) di HP titik terakhir tidak pernah tercapai karena halaman terlalu pendek → progres penuh di dasar halaman; (4) status "tercapai" kini mengikuti posisi scroll, bukan bola yang di-*damp*; (5) label belum tercapai memakai opacity (kontras gagal) → gaya putus-putus.
- **Verifikasi:** unit 135/135; e2e 63 lulus (+1 skip): timeline tanpa JS urut, popover buka/tutup tanpa JS, label diposisikan & tercapai bertahap saat scroll, label tidak keluar panggung/tidak menutupi teks (desktop & HP), reduced-motion = semua tercapai, axe bersih di bagian Journey (terang & gelap); `bun run check` lulus. Screenshot desktop/HP/tanpa JS/popover dicek visual.

### 2026-10-05 · Claude Code (Opus) · T2.2
- **Dikerjakan:** `Hero.astro` (badge peran, h1 headline + nama sr-only, tagline, CTA, statistik), `PhotoCard.astro` (kartu statis + panggung 3D, gambar `astro:assets` responsif `eager`/`fetchpriority=high`, kotak deteksi CSS), `src/scenes/photo-card/` (`config.ts`, `layout.ts` murni: `lockAmount`, `fitScale`, `visibleHeight`; `index.ts` scene). `src/lib/content/media.ts` (`contentImage`, path relatif `content/`). Kontrak inti ditambah `ready()` (`data-scene-ready`). Token dekoratif `--mint`. Three.js dimuat dinamis setelah `load` dan hanya jika `decide3D` mengizinkan.
- **Verifikasi:** e2e 49 lulus (+1 skip): isi hero EN/ID, 3D siap tanpa error console, reduced-motion → `still`, tanpa WebGL → `off` dan file three.js tidak diunduh, tanpa JS kartu statis tampil, LCP < 2,5 s; unit 119 lulus; `bun run check` lulus. JS 3D ≈ 136 KB gzip (anggaran 180 KB), skrip awal 1,5 KB. Screenshot desktop/HP/gelap/tanpa JS dicek visual.
- **Penyesuaian visual setelah screenshot:** jarak kamera 12 → 7,5 agar kartu 3D sama besar dengan kartu statis; intensitas lampu dinaikkan (satuan fisik three r155+); cincin −1,35 rad agar tidak menutupi wajah/teks; label deteksi dipendekkan; label kartu statis tidak lagi terpotong.
- **Catatan:** CTA sementara (mailto + LinkedIn) karena PDF baru ada di Fase 4 (dicatat di T4.4). Halaman beranda tidak lagi `noindex`.

### 2026-10-05 · Claude Code (Opus) · T2.1
- **Dikerjakan:** `three` 0.186.1 + `@types/three`. `src/scenes/core/`: `math.ts` (`frameDelta` dijepit, `damp`, `smoothstep`, `cappedPixelRatio`), `capabilities.ts` (`decide3D` murni + deteksi browser), `palette.ts` (warna dari token CSS), `pointer.ts`, `loop.ts` (rAF dapat diinjeksi, idempoten, error per frame tidak mematikan loop), `dispose.ts`, `mount.ts` (`mountScene` → `SceneHandle | null`), `types.ts` (`SceneModule`, `FrameContext`, `SceneSetup`).
- **Verifikasi:** `bun test` 114/114 (math, decide3D, parseCssColor, pointer, loop dengan rAF palsu, dispose dengan objek Three asli); `bun run check` lulus.
- **Catatan:** bagian yang butuh DOM/WebGL (`mountScene`, `hasWebGL`, `readPalette`) baru dites e2e di browser pada T2.2. Arsitektur §6 diperbarui sesuai implementasi.

### 2026-10-05 · Claude Code (Opus) · T1.8 (Fase 1 selesai)
- **Dikerjakan:** `docker/Dockerfile.dev` (`node:22-bookworm-slim` + Bun 1.3.9 disalin dari `oven/bun`), `docker/compose.dev.yml` (bind mount, volume `node_modules`, `DEV_PORT`), `.dockerignore`.
- **Verifikasi:** `compose config` valid; container start → `/` dan `/id/` 200; Astro berjalan di foreground di dalam container; edit `content/profile.yaml` dari host terlihat di container dalam ±2 s (data dikembalikan); file yang dibuat container dimiliki user host (Docker rootless); container dihentikan.
- **Catatan:** Port 4321 di host sedang dipakai dev server lokal yang tidak dijalankan oleh agent (kemungkinan dibuka pemilik), jadi pengujian memakai `DEV_PORT=4331` dan proses tersebut tidak dihentikan.
- **Ringkasan Fase 1:** 8/8 tugas; 98 unit test (cakupan `src/lib` 100%), 35 e2e (+1 skip HP), `bun run check` bersih.
- **Langkah berikutnya:** Fase 2, mulai `T2.1` (modul inti 3D).

### 2026-10-05 · Claude Code (Opus) · T1.7
- **Dikerjakan:** `PageLayout` (SkipLink → Header → `main#main` → Footer); `Header` (nama → beranda, menu dari `NAV_ITEMS`, LangSwitch, ThemeToggle); `Footer` (tahun, kalimat "self-hosted", ikon sosial dari `profile.yaml` dengan `rel="me"`); `SkipLink`; `Icon.astro` (ikon garis LinkedIn/Instagram/GitHub/Email, digambar sendiri karena LinkedIn sudah dihapus dari simple-icons); `BaseLayout` + meta Open Graph/Twitter. `src/lib/navigation.ts` (`NAV_ITEMS` sengaja kosong sampai halamannya ada). Varian `dark:` kini juga berlaku untuk mode gelap OS tanpa JS.
- **Verifikasi:** e2e 35 lulus + 1 dilewati (tes keyboard di HP): axe tanpa pelanggaran serious/critical di `/` & `/id/` × terang/gelap; Tab pertama fokus ke skip link, Enter memindahkan fokus ke `main`; landmark tunggal; tautan sosial sesuai; teks ID; tidak ada nomor HP. Screenshot desktop/HP/gelap/skip link dicek visual (dua perbaikan: padding skip link, pil bahasa aktif di mode gelap).
- **Catatan:** `theme-color` meta belum ada (butuh nilai warna; tambahkan di T7.1 lewat token). OG image, sitemap, JSON-LD: T7.1. Menu HP ditambahkan sebagai T2.8.

### 2026-10-05 · Claude Code (Opus) · T1.6
- **Dikerjakan:** Tailwind 4.3 via `@tailwindcss/vite`; `src/styles/tokens.css` (satu-satunya tempat hex; terang, gelap via OS, gelap/terang eksplisit via `data-theme`); `src/styles/global.css` (`@theme inline` memetakan token ke utilitas, skala tipe `text-hero/h2/h3/eyebrow`, varian `dark:` mengikuti `data-theme`, base style, fokus terlihat, reduced-motion). Font self-host Fontsource (subset Latin). `src/lib/theme.ts` (murni) + `ThemeToggle.astro` (tersembunyi tanpa JS, `aria-pressed`, label EN/ID) + skrip pre-paint di `BaseLayout` (kelas `js`, tema tersimpan). `scripts/check-tokens.ts` (`bun run lint:tokens`, termasuk dalam `check`).
- **Verifikasi:** `bun test` 98/98 (termasuk tes kontras WCAG untuk 11 pasangan token × 2 tema); e2e 18/18 (tema OS gelap, toggle + reload, label ID, tanpa JS); screenshot terang/gelap/HP dicek visual; `bun run check` lulus; probe hex di `src/lib` ditolak.
- **Perubahan desain:** token `text`/`text-muted` diganti nama menjadi `ink`/`ink-muted` (kelas Tailwind lebih jelas). `amber-deep` terang diganti `#d48a00` → `#8a5a00` karena kontras 2,5:1 tidak lolos AA. `docs/03-design-system.md` diperbarui.
- **Catatan untuk T7.3 (CSP):** skrip pre-paint adalah inline script; CSP harus memakai hash-nya.

### 2026-10-05 · Claude Code (Opus) · T1.5
- **Dikerjakan:** konfigurasi `i18n` Astro (en default tanpa prefix, id di `/id/`); helper murni `splitLocale`, `localizePath`, `alternates`, `localeStaticPaths` (`src/lib/i18n/routing.ts`); kamus UI bertipe `src/lib/i18n/ui.ts` (kunci `id` yang hilang = error TS) + `useTranslations`; `src/layouts/BaseLayout.astro` (lang, canonical, hreflang en/id/x-default); `LangSwitch.astro` (tautan biasa tanpa JS, `aria-current`); halaman `src/pages/[...locale]/index.astro` menggantikan placeholder dan kini membaca `profile.yaml` (tidak ada teks hardcode).
- **Verifikasi:** build menghasilkan `/index.html` dan `/id/index.html` dengan lang/canonical/hreflang yang benar; probe menghapus satu kunci `id` → error TS; `bun test` 71/71 (cakupan `src/lib` 100%); e2e 10/10 (lang, hreflang, perpindahan bahasa); `bun run check` lulus.
- **Catatan:** pola `[...locale]` dipilih agar setiap halaman cukup satu file (dokumentasi arsitektur §4 dan §7 serta ADR 0008 diperbarui). Kelas `sr-only` di LangSwitch baru berfungsi setelah Tailwind (T1.6). Halaman masih `noindex` sampai hero asli (T2.2).

### 2026-10-05 · Claude Code (Opus) · T1.4
- **Dikerjakan:** helper murni di `src/lib/content/`: `localize`/`isFallback`, `toYearMonth`/`formatYearMonth`/`formatDateRange` (Intl, UTC; label "Present" dari luar), `isActiveCertification` (berlaku sampai akhir bulan `expires`), `compareRangesDesc`/`compareDatesDesc`/`sortedBy`, `visibleOn` (web/cv), `splitEmphasis`/`stripEmphasis` (untuk `*kata*` di headline), `isPublished`/`compareProjects`. Barrel `@/lib/content` hanya berisi modul murni. `queries.ts` (getProfile, getExperience, getCertifications(now), getProjects, dll.) adalah satu-satunya yang memakai `astro:content`. `src/lib/i18n/locales.ts` (`LOCALES`, `Locale`, `isLocale`) dibuat lebih awal untuk dipakai T1.5.
- **Verifikasi:** `bun test` 62/62, cakupan `src/lib` 100% baris & fungsi; `bun run check` lulus (queries.ts lolos typecheck terhadap collection asli).
- **Catatan:** `queries.ts` belum dipanggil di runtime; pemakaian pertama di T1.7 (Footer).

### 2026-10-05 · Claude Code (Opus) · T1.3
- **Dikerjakan:** skema Zod 4 (`astro/zod`) di `src/lib/content/schemas/` (`primitives.ts`: `localizedText`, `yearMonth`, `endDate`, `slug`, dll.; `entities.ts`: semua entitas + tipe hasil `z.infer`). Semua objek `strictObject` agar salah ketik field ketahuan. Parser YAML murni `src/lib/content/yaml.ts` (`items:`/`groups:`/`milestones:`; singleton untuk `profile`). `src/content.config.ts` mendaftarkan 9 collection (`file()` + `glob()`). `js-yaml` 4.3.2 ditambahkan sebagai dependency langsung (versi sama dengan Astro).
- **Verifikasi:** build sukses; probe data salah menghasilkan pesan jelas (`experience → decklify … start: Use the YYYY-MM format`); `bun test` 36/36, termasuk tes integritas yang memvalidasi file `content/` asli (skema, id unik, `ref` Journey, tanpa nomor HP); `bun run check` lulus.
- **Perbaikan data:** label metrik di `projects/multimodal-crisis-detection.md` diberi tanda kutip (koma di `0,96` memecah objek YAML).
- **Catatan:** file terjemahan proyek `*.id.md` belum didaftarkan (T2.4). `photo`/`cover` masih string path; konversi ke `astro:assets` di T2.2.

### 2026-10-05 · Claude Code (Opus) · T1.2
- **Dikerjakan:** ESLint 10 flat config (`@eslint/js`, `typescript-eslint` strict, `eslint-plugin-astro` + a11y via `eslint-plugin-jsx-a11y-x`, `eslint-config-prettier`), aturan: tanpa `any`, tanpa `console.log`, `consistent-type-imports`, `eqeqeq`. Prettier + plugin Astro. Script `check`, `lint`, `format`, `test:coverage`, `test:e2e`. `bunfig.toml` membatasi `bun test` ke `tests/unit`. Playwright (desktop + Pixel 7) dengan smoke test 200/404. `src/lib/site.ts` dibuat murni (`resolveSiteUrl`) dan dipakai `astro.config.ts`.
- **Verifikasi:** `bun run check` lulus; probe membuktikan lint menolak `any` dan `console.log`; `bun test` 3/3; `bun run test:e2e` 4/4.
- **Catatan:** `eslint-plugin-jsx-a11y` asli belum mendukung ESLint 10, sehingga dipakai fork `-x`. TS 6 tidak memuat `@types/*` otomatis, jadi `types: ["node","bun"]` ditulis eksplisit di `tsconfig.json`. Auto-background Astro dipicu oleh deteksi AI agent (bukan TTY); `--ignore-lock` memaksa foreground.

### 2026-10-05 · Claude Code (Opus) · T1.1
- **Dikerjakan:** Astro 7.3.5 (static, `trailingSlash: 'always'`), TypeScript 6.0.3 dengan preset `astro/tsconfigs/strictest` (sudah termasuk `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`), alias `@/` → `src/`, `@types/node` 22, struktur folder sesuai arsitektur §4 (`.gitkeep` di folder kosong), placeholder `src/pages/index.astro`, favicon.
- **Verifikasi:** `bun run typecheck` 0 error; probe sementara membuktikan `noUncheckedIndexedAccess` aktif dan alias `@/` ter-resolve; `bun run build` sukses; dev server menyajikan `/` dan `/favicon.svg` (200).
- **Catatan:** TypeScript 7 belum didukung `@astrojs/check` (peer `^5 || ^6`), jadi dikunci ke 6.0.3. `baseUrl` tidak dipakai karena deprecated di TS 6. Tanpa TTY, `astro dev` berjalan di background; hentikan dengan `bunx astro dev stop`.
- **Langkah berikutnya:** `T1.2` tooling (ESLint, Prettier, `bun run check`, `bun test`, Playwright). Larangan `any` baru ditegakkan di T1.2 lewat ESLint.

### 2026-10-05 · Claude Code (Opus) · Fase 0
- **Dikerjakan:** analisis SRS + CV + LinkedIn + portfolio lama; 8 prototipe tema → dipilih F + E Hijau; seluruh dokumentasi dan ADR; ekstraksi data ke `content/`; foto profil dioptimasi ke `content/media/profile.jpg`.
- **Koreksi data yang disetujui pemilik:** Research Assistant = Sep–Okt 2024; kelulusan fasilitator DBS = 65%; Decklify = masih berjalan (Present); pendidikan selesai Agu 2026; sertifikat Azure tidak ditampilkan; nomor HP tidak ditampilkan di mana pun.
- **Belum:** belum ada kode aplikasi.
- **Langkah berikutnya:** `T1.1` scaffold Astro.
- **Catatan:** kode proyek lama ("Temporal Portal", React/Vite) sengaja dihapus oleh pemilik; mulai dari nol.
