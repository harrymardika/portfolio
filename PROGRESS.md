# PROGRESS

> Satu-satunya sumber kebenaran tentang status proyek. **Perbarui setiap kali menyelesaikan atau menghentikan tugas.**
> Legenda: `[ ]` belum · `[~]` sedang dikerjakan (tulis siapa) · `[x]` selesai · `[!]` terblokir (tulis alasannya)

**Terakhir diperbarui:** 2026-10-05 · **Fase aktif:** Fase 2 · **Tugas berikutnya:** `T2.3`

## Ringkasan

| Fase | Tujuan | Status |
|---|---|---|
| 0 | Fondasi: dokumentasi, keputusan, data konten | ✅ Selesai |
| 1 | Scaffold aplikasi, tooling, skema konten, i18n, layout dasar | ✅ Selesai |
| 2 | Halaman & UI (hero kartu 3D, journey 3D, proyek, about, kontak) | 🔄 2/8 tugas |
| 3 | Sinkronisasi proyek dari GitHub | ⬜ |
| 4 | Generate PDF CV & Portfolio | ⬜ |
| 5 | Analytics (Umami) & link pelacak | ⬜ |
| 6 | Docker, CI/CD, deploy ke home server | ⬜ |
| 7 | Kualitas: SEO, a11y, performa, header keamanan | ⬜ |
| 8 | Otomasi lanjutan: CMS, draf konten oleh AI | ⬜ |

Progres keseluruhan: **Fase 0–1 selesai, 2 dari 9 fase (≈20%)**

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

## Fase 2: Halaman & UI

- [x] **T2.1** Modul inti 3D `src/scenes/core/` (renderer, loop, pause saat offscreen, reduced-motion, deteksi WebGL, dispose)
  - Kriteria: kontrak `SceneHandle` sesuai `docs/02-architecture.md` §6; tes unit untuk util non-WebGL.
- [x] **T2.2** Hero: kartu foto 3D + kotak deteksi wajah + statistik
  - Kriteria: sesuai prototipe (F + E, Hijau); tanpa JS/WebGL tampil versi statis yang setara; LCP < 2.5 s di mobile.
- [ ] **T2.3** Bagian Journey: jalur 3D dari `content/journey.yaml`, bola bergerak mengikuti scroll, titik bisa diklik (dialog detail)
  - Kriteria: versi tanpa 3D berupa timeline HTML yang dapat diakses; label tidak menutupi teks di mobile.
- [ ] **T2.4** Halaman Projects (daftar + filter tag) dan detail proyek (case study dari `content/projects/*.md`); tambahkan ke `NAV_ITEMS`
- [ ] **T2.5** Halaman About: ringkasan, pengalaman, pendidikan, penghargaan, sertifikat aktif, skills; tambahkan ke `NAV_ITEMS`
- [ ] **T2.8** Menu navigasi di HP (saat `NAV_ITEMS` > 0, menu disembunyikan di bawah `md`)
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
- [ ] **T4.4** Tombol download di UI (EN/ID) dan event analytics; ganti CTA sementara di hero ("Get in touch"/"LinkedIn profile") menjadi "Download CV"/"Portfolio PDF"

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

Format: `### YYYY-MM-DD · <agent/orang> · <tugas>`, lalu poin: dikerjakan / belum / langkah berikutnya / catatan. Entri terbaru di atas.

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
