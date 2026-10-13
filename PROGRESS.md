# PROGRESS

> Satu-satunya sumber kebenaran tentang status proyek. **Perbarui setiap kali menyelesaikan atau menghentikan tugas.**
> Legenda: `[ ]` belum · `[~]` sedang dikerjakan (tulis siapa) · `[x]` selesai · `[!]` terblokir (tulis alasannya)

**Terakhir diperbarui:** 2026-10-13 · **Fase aktif:** Fase 15 (menunggu pemilik meninjau Fase 14) · **Tugas berikutnya:** T15.1 (Projects: jalur sortir penuh dan daftar indeks)

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
| 10 | CV per posisi (§B) | ✅ Selesai 2026-10-08 (rilis 1.2.0) |
| 11 | Chatbot "Tanya Harry" di sudut (§E) | ✅ Selesai 2026-10-09 (rilis 1.3.0; chatbot tayang) |
| 12 | Formulir kesan & pesan bermoderasi (§F) | ✅ Selesai 2026-10-09 (rilis 1.4.0; formulir tayang) |
| 13 | Tampilan baru Giok → Nila dan beranda "satu ruang" 3D (§H, §I) | ✅ Selesai 2026-10-10 (rilis 1.5.0) |
| 14 | Beranda "full 3D" persis artifact: ruangan selayar penuh, kamera bergerak (§H2, D22) | ✅ Selesai 2026-10-13 (rilis 1.6.0) |
| 15 | Halaman lain (Projects, About, Statistik, 404) dalam ruang 3D yang sama (§H) | ⏳ Berikutnya |

Progres keseluruhan: **Fase 0–14 selesai; situs online sejak 2026-10-06, chatbot dan formulir kesan & pesan sejak 2026-10-09, tampilan Giok → Nila sejak 2026-10-10, beranda "full 3D" (ruangan selayar penuh, kamera bergerak) sejak 2026-10-13. Rencana Fase 15: `docs/11-roadmap.md`**

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

## Fase 10: CV per posisi (`docs/11-roadmap.md` §B) ✅

- [x] **T10.1** Model data varian (D10)
  - Kriteria: `content/cv-variants.yaml` (id, baris peran, ringkasan EN/ID, urutan bagian, label fokus yang dipilih, grup skill); label fokus (`ai`, `data`, `product`, `leadership`) pada `highlights`; skema + CMS + tes; varian hanya memilih/mengurutkan data yang ada.
- [x] **T10.2** Pembuat PDF per varian
  - Kriteria: build menghasilkan PDF tiap varian (EN + ID) di jalur yang disepakati D10; tiap varian ≤ 2 halaman, ATS-friendly, tanpa nomor HP (tes per varian).
- [x] **T10.3** Isi varian awal: AI/ML, Data Engineer, Data Analyst, Product Manager, Project Manager, Management Trainee · disetujui pemilik 2026-10-08
  - Kriteria: ringkasan dan pilihan poin tiap varian ditinjau pemilik (lewat pratinjau PDF).
- [x] **T10.4** Penutupan Fase 10: rapikan dan dokumentasikan (AGENTS.md §2a)
  - Kriteria: kode/dependency/branch yang tidak terpakai dihapus; README, docs/02, docs/04 (dan docs/07/10, ADR bila perlu) sesuai kode; fase ✅ dan ringkasan fase di PROGRESS; entri CHANGELOG fase dipindah ke rilis bertanggal; `bun run verify` lulus dan situs live dicek; laporan ke pemilik.

## Fase 11: Chatbot "Tanya Harry" di sudut (`docs/11-roadmap.md` §E, D13, D14) ✅

Rencana rinci (arsitektur, batas, keamanan) di `docs/11-roadmap.md` §E. Pratinjau yang dipilih pemilik: https://claude.ai/artifact/9bHCrGGLHm7t1BJoh2fV7a (bagian 3).

- [x] **T11.1** ADR 0014 + pengetahuan dari konten
  - Kriteria: ADR 0014 (layanan terpisah, penyedia, privasi tanpa penyimpanan, batas, tanpa vector DB, widget sudut, kill switch); `knowledge.json` (lengkap, untuk Gemini) dan `knowledge-compact.json` (≤ 5 ribu token, untuk Groq) dibuat saat build dari `content/` publik saja, beserta daftar path situs yang boleh ditautkan; tes: tanpa nomor HP, tanpa draf, ukuran di bawah batas, path valid.
- [x] **T11.2** Layanan `services/assistant` (`POST /api/ask`, `GET /api/ask/health`)
  - Kriteria: penyedia Gemini/Groq direfaktor ke `src/lib/ai/` (dipakai juga draf T8.2); validasi masuk (Origin, ukuran, 1–500 karakter, riwayat ≤ 6 pesan, bot); batas per pengunjung 10/jam dan 30/hari (hash harian, tanpa IP), total 300/hari, ≤ 3 permintaan bersamaan, timeout 20 s; jawaban JSON tervalidasi (teks biasa, tautan hanya path situs, pola nomor HP ditolak), Gemini → Groq → pesan cadangan; kill switch `ASSISTANT_ENABLED`; log tanpa teks pertanyaan; tes unit dengan penyedia tiruan.
- [x] **T11.3** Infrastruktur: Docker, deploy, Caddy (+ `/security-review`)
  - Kriteria: target `assistant` di Dockerfile + matrix deploy; service `assistant` di compose (hardening, 128 MB, tanpa volume); Caddy `/api/ask*` (no-store); CSP tetap; `.env.example`, docs/07 dan docs/10 (key terpisah, mematikan fitur, kuota); `test:e2e:docker` mencakup health.
- [x] **T11.4** Widget chat di sudut
  - Kriteria: tombol kecil di semua halaman `PageLayout` (bukan halaman cetak), tersembunyi tanpa JS; panel dimuat saat diklik; dialog non-modal yang ramah keyboard dan pembaca layar; contoh pertanyaan, hapus percakapan, pemberitahuan privasi; percakapan bertahan antar-halaman dalam satu tab (`sessionStorage`); fallback CV + email saat server mati/batas habis; lembar bawah di HP tanpa menutupi footer; EN/ID; event statistik `ask` tanpa teks; e2e dengan API tiruan + axe; Lighthouse tetap ≥ 90/95.
- [x] **T11.5** Uji kualitas dan keamanan
  - Kriteria: ±30 pertanyaan uji (fakta EN/ID, di luar topik, data pribadi, prompt injection, tautan luar/HTML) dijalankan lewat workflow manual `assistant-eval.yml` (secret repo, tanpa laptop); hasil di `docs/assistant-eval.md`; prompt diperbaiki sampai lulus; `/security-review` seluruh fase.
- [x] **T11.5b** Key AI terpisah dan model chatbot Gemini Flash Lite
  - Kriteria: chatbot hanya memakai `ASSISTANT_GEMINI_API_KEY` → `ASSISTANT_GROQ_API_KEY`, draf AI hanya `DRAFT_GEMINI_API_KEY` → `DRAFT_GROQ_API_KEY` (nama sama di GitHub, server, compose, dan kode; diganti pemilik 2026-10-09); chatbot memakai `gemini-3.5-flash-lite` (500/hari), draf tetap `gemini-3.5-flash`; eval dibagi dua (15 Gemini, 15 Groq); pesan error penyedia menyebut jenis kuota; ADR 0015 (menggantikan sebagian ADR 0013 dan 0014); docs/10; tes unit.
- [x] **T11.6** Peluncuran dan pemantauan
  - Kriteria: pemilik membuat key Gemini dan Groq terpisah dan memasangnya di server (panduan di docs/10); fitur dinyalakan setelah T11.5 lulus; situs live dicek; jumlah pertanyaan tampil di statistik privat.
- [x] **T11.6b** Draf AI sadar-grup (independen, permintaan pemilik 2026-10-09)
  - Kriteria: grup di `content/github.yaml` = satu kandidat draf (bila salah satu anggota bertopic `portfolio`); anggota grup tidak didraf sendiri; grup tercakup bila repo anggota mana pun ditautkan; branch draf lama anggota memblokir grup; draf membaca README semua anggota (total ≤ 12.000 karakter); judul/slug dari judul grup, `links.repo` = repo pertama; ADR 0016; docs/04, docs/10; tes unit.
- [x] **T11.7** Penutupan Fase 11: rapikan dan dokumentasikan (AGENTS.md §2a)
  - Kriteria: sesuai checklist §2a.

## Fase 12: Formulir kesan & pesan bermoderasi (`docs/11-roadmap.md` §F, D15) ✅

Rencana disetujui pemilik 2026-10-09 (formulir di halaman sendiri; tinjau di halaman privat ber-token; yang disetujui otomatis jadi PR; tanpa email penulis; notifikasi harian lewat issue GitHub berisi jumlah saja). Repo publik: pesan yang belum disetujui tidak boleh masuk PR, issue, atau log Actions.

- [x] **T12.1** API kesan & pesan di layanan stats + ADR 0017
  - Kriteria: `POST /api/messages` (Origin, honeypot, bot, 3/pengunjung/hari, antrean ≤ 100, validasi termasuk tolak nomor HP/email/URL di teks, persetujuan tayang wajib; JSON atau form biasa → 303), disimpan *pending* di `messages.sqlite` terpisah (tanpa backup, tanpa IP); endpoint ber-token `MESSAGES_ADMIN_TOKEN` untuk tinjau (pending, approve, reject = hapus), workflow (approved, published = hapus), dan jumlah; pending > 90 hari terhapus otomatis; Caddy `/api/messages*` (no-store, ≤ 8 KiB); compose + `.env.example`; tes unit; `/security-review`.
- [x] **T12.2** Halaman formulir `/messages/` (EN/ID)
  - Kriteria: formulir dengan validasi per field, terkirim tanpa JS (303 ke halaman terima kasih / belum terkirim), pemberitahuan privasi, tautan dari bagian Kesan & pesan di beranda (tetap tampil walau kosong) dan footer; e2e + axe; Lighthouse ≥ 90/95.
- [x] **T12.3** Halaman tinjau privat
  - Kriteria: `/messages/review/` noindex, di luar sitemap, `Disallow` robots; token di `sessionStorage`; daftar pending (teks aman), Setujui/Tolak dengan konfirmasi; e2e + axe; `/security-review`.
- [x] **T12.4** Workflow `kind-words.yml`: PR otomatis + notifikasi harian
  - Kriteria: tiap jam pesan yang disetujui diterjemahkan AI (key `DRAFT_*`, teks dianggap tak tepercaya, diperiksa), ditambahkan ke `content/messages.yaml`, dicek tes konten, dibuka sebagai PR `kind-words` (merge = tayang), lalu dihapus dari server; tiap hari 08.00 WIB issue berisi jumlah pesan menunggu (tanpa isi); `/security-review`.
- [x] **T12.5** Penutupan Fase 12: rapikan dan dokumentasikan (AGENTS.md §2a)
  - Kriteria: kode/dependency/branch yang tidak terpakai dihapus; README, docs/02, docs/04 (dan docs/07/10, ADR bila perlu) sesuai kode; fase ✅ dan ringkasan fase di PROGRESS; entri CHANGELOG fase dipindah ke rilis bertanggal; `bun run verify` lulus dan situs live dicek; laporan ke pemilik.

## Fase 13: Tampilan baru Giok → Nila dan beranda "satu ruang" 3D (`docs/11-roadmap.md` §H, §I; D18–D21) ✅

Rencana disetujui pemilik 2026-10-10. Pratinjau (privat): [satu ruang 3D, warna Giok → Nila](https://claude.ai/artifact/Xkm8xfNPp6m1d1ijtf64jb) dan [diagnosis "pola AI", hero foto + aksara, konveyor](https://claude.ai/artifact/ERboSgCo7gpAGg1LZoNe1t). Pratinjau lama Fase 13 (peta embedding dkk.) tidak berlaku lagi (D21).

Aturan untuk semua tugas Fase 13 dan 14:
- **Fitur lama tidak boleh hilang.** Daftar wajibnya di `docs/11-roadmap.md` §I, dijaga oleh `tests/e2e/feature-inventory.spec.ts` (T13.0). Tes lama boleh disesuaikan dengan tampilan baru hanya bila yang dicek tetap setara; tes tidak boleh dihapus atau dilemahkan (AGENTS.md §3).
- **Aturan 3D tetap** (`docs/03-design-system.md` §6, ADR 0007): isi selalu HTML dan lengkap tanpa JS/WebGL, mati otomatis di perangkat lemah, satu frame diam untuk reduced motion, berhenti saat tidak terlihat, ≤ 180 KB gzip JS 3D per halaman (sekarang ±136 KB), Lighthouse ≥ 90/95 (CI mengukur tanpa GPU, jadi yang diukur adalah fallback).
- **Halaman cetak dan PDF tidak berubah** (ATS, selalu terang).
- Tugas yang mengubah tampilan dicek di desktop dan HP, tema terang dan gelap; T13.1, T13.4, dan T13.6 dipratinjaukan ke pemilik sebelum merge.

- [x] **T13.0** Pagar pengaman fitur lama (sebelum tampilan diubah)
  - Kriteria: `tests/e2e/feature-inventory.spec.ts` memeriksa setiap butir §I di EN dan ID, desktop dan HP (selector berdasarkan peran dan teks, bukan kelas CSS, agar tetap berlaku setelah tampilan berubah); semua lulus pada tampilan sekarang; angka Lighthouse ketujuh halaman saat ini dicatat di log sesi sebagai pembanding; screenshot acuan (desktop/HP × terang/gelap) dibuat sebagai artefak lokal untuk perbandingan, tidak di-commit.
- [x] **T13.1** Warna Giok → Nila, terang dan gelap (ADR 0018 menggantikan ADR 0006)
  - Kriteria: token baru di `src/styles/tokens.css` untuk tiga titik ruangan (giok, tengah, nila) × tema terang (muda) dan gelap (tua), amber tetap; latar halaman berupa gradasi CSS panjang dari giok ke nila sehingga perubahan warna tetap ada tanpa JS; sorot cahaya dan tekstur butiran halus; halaman selain beranda memakai satu titik tetap (About giok, Projects tengah, Statistik dan 404 nila, lainnya tengah); `tests/unit/tokens-contrast.test.ts` mencakup semua pasangan teks di kedua tema, termasuk titik antara gradasi (sampel tiap 10%); `bun run lint:tokens` lulus; tombol tema tetap bekerja tanpa kedip; `docs/03-design-system.md` §2 ditulis ulang. Belum ada perubahan tata letak; pratinjau ke pemilik.
- [x] **T13.2** Rapikan "pola AI" di seluruh situs (tanpa 3D)
  - Kriteria: H1 beranda = nama pemilik (D19), `headline` tampil sebagai kalimat di bawahnya tanpa warna aksen; `*aksen*` tidak lagi diwarnai di web (format tetap diterima di `content/`, PDF tidak berubah); badge pil peran dan label mono huruf kapital dihapus (font mono hanya untuk keluaran mesin: label deteksi, nama kelas); tiga angka hero menjadi daftar dengan konteks (label di `profile.yaml` diperpanjang EN/ID, ditinjau pemilik); proyek pilihan di beranda menjadi baris, bukan kartu; Kontak menjadi email besar + tombol salin + tautan media sosial (semuanya tetap ada); judul halaman, meta, dan JSON-LD tidak berubah; `docs/03` dan `docs/04` diperbarui; `feature-inventory` lulus.
- [x] **T13.3** Inti "satu ruang" 3D (`src/scenes/room/`, ADR 0019)
  - Kriteria (diubah 2026-10-10 mengikuti ADR 0019, lihat log sesi T13.3): satu kanvas `position: fixed` per halaman di belakang isi; benda 3D **ditambatkan ke elemen HTML** dan ikut bergeser bersama scroll (pemetaan halaman ↔ dunia sebagai fungsi murni + tes), menggantikan "jalur kamera dengan titik jangkar"; dinding penangkap bayangan di belakang bidang halaman (lantai tidak diperlukan karena benda dimiringkan sendiri); satu cahaya utama tetap (bukan mengikuti kamera) dengan warna dari token (`--room-sky/-ground/-sun/-shadow`) yang ikut berubah saat tema diganti; warna dinding mengikuti gradasi CSS (T13.1), bukan posisi scroll di 3D; tingkatan: bayangan real-time (≥ 6 core dan bukan layar sentuh), selain itu setiap bagian menggambar bayangan lembut statis sendiri, `still` untuk reduced motion, `off` = HTML saja (`decide3D`); render hanya bila perlu; bagian dibangun saat slotnya dekat dan shader-nya dikompilasi async lebih dulu; `SceneHandle` tetap; kanvas `aria-hidden`, tanpa pointer, dan klik ke 3D diabaikan saat menyeret atau memilih teks; `docs/02` §6.1. Pemasangan di beranda setelah LCP lewat dynamic import dipindah ke T13.4.
- [x] **T13.4** Beranda, ruang 1: foto cetak dan lembar aksara Jawa
  - Kriteria: foto dan lembar aksara bertuliskan "Harry Mardika" melayang dengan bayangan (bayangan foto jatuh ke lembar); urutan deteksi sekali saat halaman dibuka (wajah → `person` → nama; lalu kotak ha, ra, ma, da, ka → transliterasi), tombol "putar ulang"; gambar lembar dan koordinat kotaknya dibuat sekali oleh `scripts/generate-aksara.ts` dan hasilnya di-commit ke `content/media/` (font Noto Sans Javanese hanya dipakai skrip itu, alasan dependency ditulis di commit), sehingga browser tidak memuat font aksara; fallback HTML = foto + gambar lembar dengan bayangan CSS, elemen LCP adalah foto atau lembar aksara (keduanya `eager` + `fetchpriority=high`; di desktop lembar yang terbesar, diubah atas persetujuan pemilik 2026-10-10); semua label dan keterangan dari kamus UI EN/ID; tombol Download CV dan Portfolio PDF tetap (beserta statistik unduhan); scene `photo-card` lama dihapus setelah diganti; LCP < 2,5 s di HP; pratinjau ke pemilik.
- [x] **T13.5** Beranda, ruang 2: benang journey
  - Kriteria: benang dari bawah lembar aksara melewati titik-titik `journey.yaml` (4–6 item) sampai ke lantai proyek; bola mengikuti scroll; titik yang sudah dilewati menyala dan daftar HTML ikut menandainya; klik titik 3D membuka popover detail yang sama dengan daftar (popover tetap jalan tanpa JS); scene `journey-path` lama dihapus setelah diganti; tes journey lama tetap lulus atau disesuaikan setara.
- [x] **T13.6** Beranda, ruang 3–5: konveyor, Kind words, laptop homelab
  - Kriteria: konveyor membawa 3 proyek pilihan di depan dan proyek lain dari data, wadah dari `profile.projects.categories`; hover/ketuk menampilkan judul, klik membuka studi kasus; Kind words: pesan dari `messages.yaml` sebagai kertas yang ditempel (teks tetap HTML) + tombol "Leave a message"; Kontak: laptop homelab yang layarnya menampilkan beranda; tanpa 3D semuanya tetap HTML; pratinjau ke pemilik.

---
- [x] **T13.7** Penutupan Fase 13: rapikan dan dokumentasikan (AGENTS.md §2a), rilis 1.5.0
  - Kriteria: kode/dependency/branch yang tidak terpakai dihapus (termasuk scene lama dan token hijau lama); README, docs/02, docs/03, docs/04 sesuai kode; ADR 0018 dan 0019 tercatat di `docs/adr/README.md`; fase ✅ dan ringkasan fase di PROGRESS; entri CHANGELOG fase dipindah ke rilis bertanggal; `bun run verify` lulus, `feature-inventory` lulus, Lighthouse ketujuh halaman ≥ 90/95 dan dibandingkan dengan angka T13.0; situs live dicek di desktop dan HP sungguhan; laporan ke pemilik.

## Fase 14: Beranda "full 3D" persis artifact (`docs/11-roadmap.md` §H2; D22)

Rencana disetujui pemilik 2026-10-10 (rencana lengkap: `docs/11-roadmap.md` §H2 dan ADR 0020). Pembanding: [artifact satu ruang Giok → Nila](https://claude.ai/artifact/Xkm8xfNPp6m1d1ijtf64jb). Aturan Fase 13 (fitur lama tetap, `feature-inventory`, aturan 3D, PDF tidak berubah) tetap berlaku. Dikerjakan di branch `phase/14`, merge ke `main` sekali di T14.6.

- [x] **T14.0** Kerangka: ADR 0020, rencana di docs, keputusan 3D sebelum tampilan pertama (`html[data-room-3d]` dari skrip inline `earlyMode`, salinan mandiri `decide3D` yang dijaga tes), tata letak ruangan (selayar penuh, kolom teks kiri dengan scrim, panel bawah di HP, tanpa garis) hanya saat 3D aktif
  - Kriteria: tanpa 3D (tanpa WebGL/GPU, Save-Data, Lighthouse CI) beranda tetap tata letak sekarang tanpa ruang kosong; dengan 3D tidak ada lompatan tata letak setelah `load`; `feature-inventory` lulus di kedua mode; CSP memuat hash skrip baru.
- [x] **T14.1** Kamera di dunia tetap dan warna ruangan mengikuti kamera
  - Kriteria: `src/scenes/room/camera.ts` murni + tes (titik jangkar dari posisi bagian, interpolasi, jarak untuk lebar yang harus muat, offset tampilan desktop/HP); grup halaman tidak lagi digeser scroll; dinding dan lantai penangkap bayangan; cahaya mengikuti target kamera; `--room-a/b/c` mengikuti kamera dari giok ke nila (diskret, hanya saat berubah).
- [x] **T14.2** Ruang hero dan journey skala artifact + tali jemuran, lampu yang menyala, lampu ikut kursor, kertas bertekstur
  - Kriteria: foto dan lembar aksara besar digantung dengan jepitan di tali yang menjadi benang journey (satu benang utuh); urutan pembuka: ruangan redup → lampu menyala → deteksi, sekali (reduced motion: keadaan akhir); titik journey besar, kamera turun mengikuti bola, klik titik membuka cerita, `data-reached` tetap; lampu bergeser pelan mengikuti kursor (pointer halus saja); serat kertas prosedural dan bayangan kontak.
- [x] **T14.3** Ruang proyek: konveyor di lantai (wadah di belakang sabuk, kartu berjudul) + 3 kolom proyek + log deteksi sinkron
  - Kriteria: kartu yang terdeteksi menyorot kolom/baris proyek yang sama di HTML (`data-detected`) dengan catatan mono "Judul → Bidang" dari `content/` (tanpa skor rekaan); klik kartu membuka studi kasus.
- [x] **T14.4** Ruang Kind words dan kontak: laptop besar dengan beranda mini dan angka asli
  - Kriteria: layar = nama, baris peran, tombol Download CV, foto, dan baris status dari `/api/health` + `/api/stats/summary` (pengunjung 30 hari; disembunyikan bila gagal; tanpa data baru); pesan Kind words ditempel di dinding (teks tetap HTML).
- [x] **T14.5** Tema terang yang hidup, HP, reduced motion, aksesibilitas, performa
  - Kriteria: tema mengikuti perangkat (pilihan pemilik) dan versi terang sama hidupnya dengan gelap; HP: 3D di atas, panel teks di bawah; kontras teks di atas scrim/panel ≥ 4,5:1 di kedua tema; JS 3D beranda ≤ 180 KB gzip; Lighthouse ≥ 90/95.

---
- [x] **T14.6** Penutupan Fase 14 (AGENTS.md §2a), rilis 1.6.0
  - Kriteria: review subagent; screenshot berdampingan dengan artifact (desktop 1440, HP 412, terang/gelap); `bun run verify`; merge `phase/14` → `main`, deploy, tag v1.6.0, cek live; laporan ke pemilik.

## Fase 15: Halaman lain dalam ruang yang sama (`docs/11-roadmap.md` §H; D20, D21)

Dikerjakan setelah Fase 14 selesai. Setiap halaman adalah sudut lain dari ruangan yang sama, memakai inti dari T13.3.

- [ ] **T15.1** Projects: jalur sortir penuh dan daftar indeks (D20)
  - Catatan dari T13.2: `ProjectRow` belum menampilkan jumlah bintang GitHub, chip tag, dan bidang (menampilkan peran); putuskan apa yang dibutuhkan indeks `/projects/` sebelum grid diganti, dan ganti sisa font mono di kartu.
  - Kriteria: semua proyek (studi kasus dan repo GitHub) di konveyor dari data, wadah per kategori (aturan sama dengan filter: kategori < 2 proyek disembunyikan); filter dan tautan `?filter=` menyorot wadah dan proyeknya; pencarian tetap; daftar indeks (tahun, judul, deskripsi, bidang, angka utama) menggantikan grid kartu; klik kartu di konveyor membuka studi kasus; e2e memakai helper `publishedCaseStudies` (tanpa daftar proyek di kode tes); Lighthouse `/projects/` ≥ 90.
- [ ] **T15.2** About: dinding penghargaan
  - Kriteria: penghargaan dan sertifikat aktif sebagai cetakan berbingkai dari `awards.yaml` dan `certifications.yaml` (sertifikat kedaluwarsa tetap hilang otomatis); hover/klik menyorot item yang sama di daftar HTML; semua bagian About tetap (ringkasan, pengalaman, pendidikan, penghargaan, sertifikat, skill).
- [ ] **T15.3** Statistik: laptop homelab
  - Kriteria: layar laptop menampilkan status server dan kunjungan dari API statistik publik yang sudah ada (tidak ada data baru yang disimpan); saat API mati layar menampilkan "offline" dan isi HTML `/stats/` tetap; semua isi halaman Statistik tetap.
- [ ] **T15.4** 404 ala computer vision
  - Kriteria: kotak deteksi memindai dinding kosong lalu mengunci "page · not found 0.99"; teks 404 dan tautan tetap HTML; label dari kamus UI (EN/ID).
- [ ] **T15.5** Halaman tanpa 3D mengikuti tampilan baru
  - Kriteria: studi kasus, `/cv/`, `/messages/` (beserta halaman terkirim, belum terkirim, dan tinjau), panel chatbot, menu HP, dan footer memakai warna dan tipografi baru; gambar OG dibuat ulang dengan warna baru; halaman cetak dan PDF tidak berubah; axe tanpa pelanggaran di kedua tema.
- [ ] **T15.6** (opsional, diputuskan pemilik setelah T15.5) Transisi antarhalaman
  - Kriteria: kanvas tetap hidup saat pindah halaman (Astro View Transitions) dan kamera terbang ke sudut halaman baru, hanya bila chatbot, statistik, formulir, dan skrip halaman tetap benar; bila tidak, dibatalkan dan alasannya dicatat.

---
- [ ] **T15.7** Penutupan Fase 15: rapikan dan dokumentasikan (AGENTS.md §2a), rilis 1.7.0
  - Kriteria: seperti T13.7; `feature-inventory` lulus; laporan ke pemilik.

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
| D10 | Varian CV | **7 varian** (AI/ML, Data Scientist, Data Engineer, Data Analyst, Product Manager, Project Manager, Management Trainee; Product dan Project dipisah 2026-10-08; Data Scientist ditambah 2026-10-12). **CV per perusahaan tidak dibuat** (2026-10-07). PDF varian dibuat saat deploy di `/downloads/cv/` (pemilik tidak ingin membuatnya di laptop) dan **ditautkan di footer** lewat halaman `/cv/` "CV per posisi" (label footer: "Resumes" / "Resume", pilihan pemilik; istilah "CV" tetap dipakai di tempat lain), atas pilihan pemilik walau disarankan tetap tersembunyi; halaman tetap noindex agar hasil pencarian tetap memuat positioning utama (2026-10-08). Varian MT memakai baris peran "Informatics Graduate · Technology & Leadership" karena MT adalah program yang dilamar |
| D11 | Skill tambahan | Dikonfirmasi satu per satu (2026-10-08): SQL, Pandas/NumPy, scikit-learn, Apache Airflow, Apache Spark/PySpark, Vertex AI, BigQuery, Cloud Run, LangChain, Power BI, Tableau, Looker/Looker Studio, Figma, Jira, Notion, Scrum/Agile, Git, Linux |
| D12 | Studi kasus bahasa Indonesia | **Terjemahkan semua** studi kasus; **istilah teknis/asing tidak diterjemahkan** (mis. *false negative*, *edge deployment*, *pipeline*) (2026-10-07) |
| D15 | Kesan & pesan (dulu "testimoni") | **Langsung dengan formulir bermoderasi**: tidak ada yang tampil sebelum disetujui pemilik (2026-10-07). Fase 12 tidak lagi opsional |
| D17 | 3D tambahan | ~~Keempatnya (peta proyek, 404, rasi skill, globe pengunjung)~~ (2026-10-08). **Diganti D21** (2026-10-10): hanya 404 yang tetap |
| D13 | Asisten AI: lanjut dan letaknya | **Lanjut, sebagai chatbot mengambang di sudut kanan bawah setiap halaman** (bukan halaman cetak), dipilih setelah membandingkan pratinjau dengan versi About + tombol hero (2026-10-08) |
| D14 | Asisten AI: penyedia & penyimpanan | **Gemini utama, Groq cadangan** (batas tier gratis Groq dicek di ADR T11.1), dengan pemberitahuan privasi singkat di bawah kotak tanya; **teks pertanyaan tidak disimpan**, hanya jumlahnya di statistik privat (2026-10-08). Model chatbot diganti `gemini-3.5-flash-lite` karena kuota (ADR 0015, 2026-10-09) |
| D16 | Format angka | **Ikuti aturan baku tiap bahasa**: EN `92.5%`/`12,000`, ID `92,5%`/`12.000` (2026-10-08; menggantikan usulan "titik untuk semua") |
| D18 | Warna situs | **Giok → Nila**: ruangan berubah pelan dari hijau giok di atas ke biru nila di bawah saat scroll; tema terang memakai warna yang sama tetapi muda, tema gelap yang tua; amber tetap untuk tombol dan kotak deteksi. Menggantikan palet Hijau (ADR 0006 → ADR 0018, T13.1). Dipilih setelah membandingkan Giok, Nila, Studio, Sogan, dan tiga campuran di pratinjau (2026-10-10) |
| D19 | Judul hero | **Nama pemilik** ("Harry Mardika") sebagai H1; kalimat `headline` tampil di bawahnya tanpa kata berwarna (2026-10-10) |
| D20 | Halaman Projects | **Daftar indeks** menggantikan grid kartu; pencarian dan filter tetap (2026-10-10) |
| D21 | Arah 3D | **"Satu ruang"**: satu kanvas 3D di belakang setiap halaman, isi tetap HTML. Beranda: foto + lembar aksara Jawa, benang journey, konveyor proyek, Kind words, laptop homelab. Projects: konveyor penuh. About: dinding penghargaan. Statistik: laptop homelab. 404: kotak deteksi. Menggantikan D17 (peta embedding, rasi skill, dan globe batal) (2026-10-10) |
| D22 | Beranda "full 3D" | **Persis artifact** "satu ruang" Giok → Nila: ruangan selayar penuh, kamera bergerak mengikuti scroll (menggantikan "ditambatkan ke HTML" ADR 0019 → ADR 0020); tema tetap mengikuti perangkat (versi terang harus sama hidupnya); layar laptop = beranda mini; plus peningkatan: tali jemuran (satu benang), lampu yang menyala, log deteksi sinkron, laptop dengan angka asli, lampu ikut kursor, kertas bertekstur; live sekali di akhir fase (2026-10-10) |

**Dijawab pemilik 2026-10-10 sebelum pergi** (Fase 13 dikerjakan tanpa pemilik):
- **Deploy:** semua tugas Fase 13 dikumpulkan di branch `phase/13` (di-push sebagai cadangan) dan baru di-merge ke `main` di T13.7 setelah semua tes dan Lighthouse lulus, agar situs live tidak pernah tampil setengah jadi.
- **Pratinjau** T13.1, T13.4, T13.6: agent memakai penilaian sendiri mengikuti pratinjau yang disetujui; screenshot desktop/HP × terang/gelap disiapkan untuk ditinjau pemilik setelah kembali.
- **Label angka hero (T13.2):** "from idea to commercial launch at Decklify", "NPS in Decklify's first two weeks", "accuracy in grant-funded crisis-detection research" (versi ID diterjemahkan).
- **Ejaan aksara:** ꦲꦂꦫꦶ ꦩꦂꦢꦶꦏ (har-ri mar-di-ka) sudah benar.

**Dijawab pemilik 2026-10-13:**
- **Tinjauan Fase 13:** pemilik meminta agent yang meninjau (bukan di perangkat sungguhan). Hasilnya di log sesi 2026-10-13.
- **Perbaikan dari tinjauan:** dikerjakan sekarang, tetapi **tayang bersama Fase 14** (tidak ada rilis terpisah). Fase 14 dikerjakan sampai selesai; `main` dan situs live baru berubah di T14.6.

**Belum diputuskan** (dijawab saat tugasnya tiba):
- Transisi antarhalaman (T15.6, opsional): diputuskan setelah T15.5. Rekomendasi: kerjakan hanya bila chatbot, statistik, dan formulir tetap benar.
- Skor kelas pada label aksara (T13.4, opsional): pemilik boleh menjalankan model skripsinya pada gambar lembar aksara untuk mendapat skor asli; tanpa itu label hanya berisi nama kelas, tanpa angka.

## Catatan data

- Alibaba Cloud Certified Associate **kedaluwarsa Nov 2026**. Setelah lewat tanggalnya, sertifikat otomatis hilang dari web dan CV (`expires` di `content/certifications.yaml`).
- Isian pemilik (7 `TODO(owner)`) dan review 55 terjemahan ID **selesai 2026-10-07**; lihat `docs/progress-archive.md`. Terjemahan baru tetap perlu dibaca pemilik sebelum dianggap final.

---

## Log sesi

Format: `### YYYY-MM-DD · <agent/orang> · <tugas>`, lalu poin: dikerjakan / belum / langkah berikutnya / catatan. Entri terbaru di atas. Simpan sekitar 5 entri terakhir di sini; entri yang lebih lama dipindah ke [`docs/progress-archive.md`](docs/progress-archive.md) agar file ini tetap ringkas.

### 2026-10-13 · Claude Code (Opus) · T14.6 penutupan Fase 14 (rilis 1.6.0) · ringkasan fase
- **Yang dibangun di Fase 14 (ADR 0020, D22):** beranda sebagai ruangan selayar penuh seperti artifact yang disetujui: keputusan 3D diambil di `<head>` sebelum tampilan pertama (tanpa lompatan; tanpa 3D tata letak biasa), dunia tetap dengan dinding dan lantai, kamera yang bergerak mengikuti scroll (`camera.ts`, murni dan dites), warna dinding mengikuti kamera dari giok ke nila. Hero: foto dan lembar aksara digantung dengan jepitan di tali jemuran yang menjadi benang journey (satu benang sampai konveyor), pembuka sekali (redup → lampu berkedip menyala → deteksi), cahaya ikut kursor, kertas berserat. Journey: titik besar di dinding, kamera turun mengikuti bola, klik titik membuka cerita. Proyek: konveyor di lantai dengan wadah di belakang sabuk, tiga proyek berjajar di panel, log deteksi "Judul → Bidang" yang menandai barisnya. Kind words: kertas di dinding pendek. Kontak: laptop dengan beranda mini dan angka asli dari `/api/health` + `/api/stats/summary`. HP: 3D di atas, panel teks di bawah; reduced motion: frame diam dan kamera berganti dengan potongan.
- **Keputusan pemilik di fase ini:** D22 (persis artifact + enam peningkatan, tema mengikuti perangkat, live sekali di akhir fase); 2026-10-13: tinjauan Fase 13 diserahkan ke agent; perbaikan dari tinjauan tayang bersama Fase 14.
- **Keputusan agent (bisa diubah pemilik):** (1) konveyor tetap membawa hingga 8 studi kasus seperti pratinjau; kartu tanpa baris di beranda hanya mengisi log. (2) Reduced motion: kamera berpindah dengan potongan, bukan melayang. (3) Font Young Serif di-*preload* hanya di layar < 64rem, agar di desktop cetakan hero tetap LCP sesuai keputusan T13.4. (4) Kertas Kind words hanya menampilkan nama penulis; isi pesan tetap HTML (teks di kanvas terlalu kecil dan tidak bisa diperbesar).
- **Penutupan:** review subagent untuk seluruh fase (tanpa blocker; should-fix diperbaiki: watchdog di skrip `<head>` mengembalikan tata letak biasa bila skrip ruangan gagal dimuat (+ tes), kamera reduced motion tanpa melayang (+ tes), dokumen yang basi di docs/03 dan docs/11); `/security-review`: tanpa temuan; nit: label pengunjung tanpa bentuk jamak ("Visitors in the last 30 days: N"), cetak beranda tanpa ruang selayar penuh, ekspor yang tak terpakai. README, docs/02, docs/03, docs/11 diselaraskan; tidak ada kunci teks UI, TODO, atau dependency yang tak terpakai; `skip` di tes semuanya beralasan. Screenshot berdampingan dengan artifact (1440 dan 412, gelap/terang) dibuat; versi 1.6.0; CHANGELOG 1.6.0.
- **Angka:** Lighthouse HP CI (tanpa GPU) 99 di ketujuh halaman, sisanya 100; beranda dengan ruangan berjalan di GPU 90–91. JS 3D ±158 KB gzip. CLS beranda 0.
- **Menunggu pemilik:** (1) tinjau beranda baru di HP dan laptop sungguhan; (2) keputusan agent di atas; (3) sisa kecil: di 1024 px tali lampu lewat di belakang tautan "Projects" di header; dinding kertas Kind words hanya terlihat di perangkat dengan bayangan nyata; LCP beranda dengan GPU ±3 s di HP karena pemeriksaan WebGL di `<head>`; (4) mulai Fase 15.

### 2026-10-13 · Claude Code (Opus) · T14.5 tema terang, HP, reduced motion, aksesibilitas, performa
- **Pergeseran tata letak:** Young Serif di-*preload* di `BaseLayout` untuk layar < 64rem (kecuali cetak; di desktop preload membuat judul H1 menjadi LCP, padahal kriteria pemilik T13.4 adalah cetakan hero, dan di sana pergantian font tidak menggeser apa pun): CLS beranda di HP kini 0 (sebelumnya ±0,02–0,04 karena nama di hero pindah ke dua baris saat font masuk), baik dengan maupun tanpa 3D. Tes e2e pergeseran kembali ketat: seluruh umur halaman (hero sampai ruang Proyek) < 0,01, tanpa pengecualian font.
- **Kontras:** tes token baru: teks di panel ruangan, apa pun 3D di belakangnya (dinding, benang `ink`, mesin `forest`, bayangan), dan di baris proyek yang disorot. Ditemukan `amber-deep` di baris yang disorot 4,39:1 di tema terang bila benang gelap ada di belakang panel; panel kini `surface` 92% (sebelumnya 88%) dan sorotan `amber` 12% (sebelumnya 16%): terburuk ±4,7:1.
- **Performa:** JS 3D beranda ±158 KB gzip (batas 180), kini dijaga tes e2e. **Dengan ruangan 3D berjalan** (Chrome dengan GPU, satu kali di laptop agent, atas temuan review): beranda awalnya hanya 80–85 (TBT ±400 ms: evaluasi three.js, pembangunan bagian, dan frame pertama yang mendekode serta mengunggah tekstur). Kini bagian dibangun satu per satu dengan jeda (`yieldToMain`), tekstur diunggah satu per satu, gambar hero didekode di luar thread utama (`ImageBitmapLoader`), dan evaluasi three.js dipisah dari pembuatan renderer: **90–91** (TBT ±150 ms, CLS 0, LCP ±3,0 s; sisa terbesar: pemeriksaan WebGL di `<head>` saat GPU belum siap). Lighthouse CI (build tanpa GPU, jalur tanpa 3D): `/` 99 · `/id/` 99 · `/about/` 99 · `/projects/` 99 · `/projects/decklify/` 99 · `/stats/` 99 · `/messages/` 99; aksesibilitas, best practices, SEO semuanya 100 (setara T13.7). Pemeriksaan WebGL di `<head>` tidak terlihat dampaknya di angka ini (tanpa GPU pemeriksaannya murah). Review subagent: tanpa blocker; should-fix (Lighthouse belum mengukur ruangan) dikerjakan di atas; nit: `pivot` hero dihapus, komentar lama (kartu foto, slot tertambat), tes anggaran diperketat (halaman pembanding harus tanpa ruangan, ukuran per skrip di pesan gagal), tes kontras termasuk hitam dan putih di belakang panel.
- **Tema terang, HP, reduced motion:** dicek lewat screenshot di setiap tugas (1440/1280/1024 desktop, HP 412, terang/gelap): tema terang memakai warna giok → nila muda dengan bayangan, benang `ink`, lampu, dan peredup yang sama, jadi sama hidupnya dengan gelap; di HP 3D di atas, panel teks di bawah; reduced motion: pembuka dilewati, satu frame diam (dites e2e). Sisa kecil: di 1024 px tali lampu lewat di belakang tautan "Projects" di header (teks tetap terbaca).

### 2026-10-13 · Claude Code (Opus) · T14.4 Kind words dan kontak
- **Dikerjakan:** layar laptop = beranda mini (bilah alamat, baris peran, nama Young Serif, tombol "Download CV", foto dari tekstur hero) dengan baris status asli: `statusLine` + `visitorsOf` (murni, dites) dari `/api/health` dan `/api/stats/summary` (pengunjung 30 hari; hanya bila `PUBLIC_STATS_ENABLED`; baris disembunyikan bila server tidak menjawab; "Online" saja bila statistik gagal; tanpa data baru). Teks dari kamus UI (`contact.screenOnline`, `contact.screenVisitors`, EN/ID) dan atribut data di `Contact.astro`. Kertas Kind words ditempel di dinding pendek penangkap bayangan (kertas menjatuhkan bayangan nyata; bayangan lembut hanya tanpa bayangan nyata); teks pesan tetap HTML. Keterangan laptop pindah ke kolom teks di bawah tautan sosial (sebelumnya menumpuk di atas laptop 3D); kolom Kontak 40rem di mode ruangan agar email satu baris.
- **Review subagent `reviewer`:** blocker diperbaiki: di tema terang desktop tombol Copy jatuh di atas tutup laptop 3D (kolom 40rem terlalu lebar); kini kolom `min(40rem, 44vw)`, email sedikit lebih kecil agar satu baris, tombol Copy di bawahnya dan berlatar `surface`; bingkai laptop diperlebar. Ditemukan juga saat cek 1024 px: kamera memakai lebar kanvas (tanpa scrollbar, 1009 px) sehingga memilih bingkai HP sementara CSS sudah memakai tata letak lebar; kini kamera memakai media query yang sama dengan CSS (`WIDE_QUERY`). Should-fix: `AbortSignal.timeout` dijaga (Safari lama, juga di `ServerStatus.astro`), ringkasan statistik boleh dari cache browser (5 menit, seperti `/stats/`), tes "server tidak menjawab" menunggu penanda `data-screen-checked`, tes baru statistik gagal → "Online". Nit: penjaga `disposed`, komentar, catatan dinding kertas hanya terlihat dengan bayangan nyata.
- **Tes:** unit `statusLine`, `visitorsOf`, `laptopSize`; e2e status laptop dengan API tiruan (`data-screen-status` = "Online · Visitors in the last 30 days: 1,234") dan tanpa jawaban server (baris hilang).

### 2026-10-13 · Claude Code (Opus) · T14.3 ruang proyek
- **Dikerjakan:** konveyor kini seperti pratinjau: wadah di belakang sabuk (dinding belakang lebih tinggi, nama bidang di atasnya), pendorong di depan sabuk mendorong kartu ke belakang (`cardAt` di `sorting-plan.ts`: `z` negatif saat didorong, tes diperbarui). Log deteksi sinkron: kartu yang terdeteksi menandai baris proyek yang sama di panel (`data-detected`, latar `amber` 16% + garis kiri) dan mengisi `[data-detection-log]` "Judul → Bidang" (mono, dari data `content/`, tanpa skor, `aria-hidden`). Tiga kolom proyek sudah ada sejak T14.1; klik kartu tetap membuka studi kasus.
- **Kamera:** target Proyek di antara sabuk dan wadah agar wadah terlihat di bawah panel; pemberhentian kamera untuk bagian yang lebih tinggi dari layar kini di tepi atasnya (sebelumnya di tengah, sehingga di HP panel menutupi sabuk); di layar laptop pendek (< 52rem) ringkasan proyek disembunyikan agar sabuk dan wadah tetap terlihat.
- **Review subagent `reviewer`:** tanpa blocker. Should-fix diperbaiki: baris log kini disediakan sejak awal dan tidak pernah turun baris (sebelumnya muncul belakangan dan menggeser baris proyek; tes pergeseran kini juga mencakup ruang Proyek); ringkasan proyek di layar laptop pendek disembunyikan secara visual saja (tetap dibaca pembaca layar); dokumen diselaraskan. **Keputusan agent (bisa diubah pemilik):** konveyor tetap membawa hingga 8 studi kasus seperti pratinjau (pratinjau: 12 kartu, 3 baris); kartu proyek yang tidak punya baris di beranda hanya mengisi log. Nit: perbandingan URL lengkap, sorotan memudar dua arah, garis sorotan `amber-deep`, pemberhentian Kontak memakai aturan yang sama, tes bagian yang lebih pendek dari layar.
- **Tes:** unit `sorting-plan` (dorong ke belakang) dan `stopsFor`; e2e log deteksi (baris yang ditandai = kartu yang terdeteksi, log "Judul → …"); helper gulir e2e mengikuti aturan pemberhentian baru. Screenshot 1440×900, 1280×720, HP 412.

### 2026-10-13 · Claude Code (Opus) · T14.2 hero dan journey skala artifact
- **Dikerjakan:** `printLayout`, `STAGE_WIDTH`, `HERO_UNIT` (lembar ±3,5 satuan, seperti pratinjau) dan `heroPins` (jepitan di tengah tepi atas tiap cetakan, ikut terputar) pindah ke `hero-config.ts` (murni, dites). Benang journey kini satu benang utuh: tali jemuran dari paku kiri lewat kedua jepitan ke paku kanan (`clotheslineNails`, melendut di antaranya), turun di dinding lewat titik-titik milestone, lalu ke konveyor; bola menunggu di paku kanan (`ballAt` dengan titik `rest`). Hero: jepitan (`line`), lampu gantung (tali `ink`, kap `forest`, bohlam `room-sun`) dan pembuka `lampAt` (redup 0,18 → berkedip → menyala penuh 1,15 s → deteksi mulai 1,3 s): sekali, hanya bila ruangan mulai di atas halaman dan mode `animated` (`data-lamp`); `RoomContext.setLight` di inti; pembuka yang terpotong (dispose) mengembalikan cahaya penuh. Cahaya bergeser pelan mengikuti kursor (pointer halus, animated). Kertas: tekstur serat prosedural (`drawFibers`/`paperFibers`, acak berbenih agar sama tiap kunjungan) sebagai `bumpMap` cetakan dan digambar di kertas Kind words; bayangan kontak lembut di belakang cetakan juga saat bayangan nyata menyala. Bingkai kamera hero diperlebar agar paku dan lampu masuk.
- **Tes:** unit `heroPins`, `lampAt`, `threadWaypoints` (tali jemuran → titik → lantai), `ballAt`; e2e: pembuka lampu (`data-lamp` → `on`), dibuka di `#contact` lampu langsung menyala, reduced motion langsung menyala.
- **Review subagent `reviewer`:** tanpa blocker. Should-fix diperbaiki: pembuka diperiksa lagi saat cetakan tampil (pembaca yang sudah menggulir tidak membuat ruangan lain redup); tes e2e pembuka kini membuktikan urutan `off` → `on` dan dinding sempat redup. Nit: dinding ikut redup lewat lapisan `room-shadow` di belakang kanvas (`--room-dark`, sebelumnya hanya benda 3D yang redup; di layar lebar lapisan itu tidak sampai ke kolom teks agar kontrasnya tetap), "Play again" saat pembuka menunggu lampu, cetakan tidak lagi miring mengikuti pointer (tali jemuran tetap), matahari hanya mengikuti mouse/pen (juga di laptop sentuh), material jepitan tidak dibuang ulang tiap tema, komentar `paperFibers`/`world.ts`, kalimat di docs/03.
- **Catatan:** lampu diturunkan setelah screenshot (semula tergambar di belakang navigasi header). Titik journey sudah besar sejak T14.1 (seperti pratinjau), kamera turun mengikuti bola, klik titik membuka cerita, `data-reached` tetap.

