# PROGRESS

> Satu-satunya sumber kebenaran tentang status proyek. **Perbarui setiap kali menyelesaikan atau menghentikan tugas.**
> Legenda: `[ ]` belum · `[~]` sedang dikerjakan (tulis siapa) · `[x]` selesai · `[!]` terblokir (tulis alasannya)

**Terakhir diperbarui:** 2026-10-10 · **Fase aktif:** Fase 13 · **Tugas berikutnya:** T13.1 (warna Giok → Nila)

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
| 13 | Tampilan baru Giok → Nila dan beranda "satu ruang" 3D (§H, §I) | ⏳ Berikutnya |
| 14 | Halaman lain (Projects, About, Statistik, 404) dalam ruang 3D yang sama (§H) | Direncanakan |

Progres keseluruhan: **Fase 0–12 selesai; situs online sejak 2026-10-06, chatbot dan formulir kesan & pesan sejak 2026-10-09. Rencana lanjutan Fase 11–14: `docs/11-roadmap.md`**

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

## Fase 13: Tampilan baru Giok → Nila dan beranda "satu ruang" 3D (`docs/11-roadmap.md` §H, §I; D18–D21)

Rencana disetujui pemilik 2026-10-10. Pratinjau (privat): [satu ruang 3D, warna Giok → Nila](https://claude.ai/artifact/Xkm8xfNPp6m1d1ijtf64jb) dan [diagnosis "pola AI", hero foto + aksara, konveyor](https://claude.ai/artifact/ERboSgCo7gpAGg1LZoNe1t). Pratinjau lama Fase 13 (peta embedding dkk.) tidak berlaku lagi (D21).

Aturan untuk semua tugas Fase 13 dan 14:
- **Fitur lama tidak boleh hilang.** Daftar wajibnya di `docs/11-roadmap.md` §I, dijaga oleh `tests/e2e/feature-inventory.spec.ts` (T13.0). Tes lama boleh disesuaikan dengan tampilan baru hanya bila yang dicek tetap setara; tes tidak boleh dihapus atau dilemahkan (AGENTS.md §3).
- **Aturan 3D tetap** (`docs/03-design-system.md` §6, ADR 0007): isi selalu HTML dan lengkap tanpa JS/WebGL, mati otomatis di perangkat lemah, satu frame diam untuk reduced motion, berhenti saat tidak terlihat, ≤ 180 KB gzip JS 3D per halaman (sekarang ±136 KB), Lighthouse ≥ 90/95 (CI mengukur tanpa GPU, jadi yang diukur adalah fallback).
- **Halaman cetak dan PDF tidak berubah** (ATS, selalu terang).
- Tugas yang mengubah tampilan dicek di desktop dan HP, tema terang dan gelap; T13.1, T13.4, dan T13.6 dipratinjaukan ke pemilik sebelum merge.

- [x] **T13.0** Pagar pengaman fitur lama (sebelum tampilan diubah)
  - Kriteria: `tests/e2e/feature-inventory.spec.ts` memeriksa setiap butir §I di EN dan ID, desktop dan HP (selector berdasarkan peran dan teks, bukan kelas CSS, agar tetap berlaku setelah tampilan berubah); semua lulus pada tampilan sekarang; angka Lighthouse ketujuh halaman saat ini dicatat di log sesi sebagai pembanding; screenshot acuan (desktop/HP × terang/gelap) dibuat sebagai artefak lokal untuk perbandingan, tidak di-commit.
- [ ] **T13.1** Warna Giok → Nila, terang dan gelap (ADR 0018 menggantikan ADR 0006)
  - Kriteria: token baru di `src/styles/tokens.css` untuk tiga titik ruangan (giok, tengah, nila) × tema terang (muda) dan gelap (tua), amber tetap; latar halaman berupa gradasi CSS panjang dari giok ke nila sehingga perubahan warna tetap ada tanpa JS; sorot cahaya dan tekstur butiran halus; halaman selain beranda memakai satu titik tetap (About giok, Projects tengah, Statistik dan 404 nila, lainnya tengah); `tests/unit/tokens-contrast.test.ts` mencakup semua pasangan teks di kedua tema, termasuk titik antara gradasi (sampel tiap 10%); `bun run lint:tokens` lulus; tombol tema tetap bekerja tanpa kedip; `docs/03-design-system.md` §2 ditulis ulang. Belum ada perubahan tata letak; pratinjau ke pemilik.
- [ ] **T13.2** Rapikan "pola AI" di seluruh situs (tanpa 3D)
  - Kriteria: H1 beranda = nama pemilik (D19), `headline` tampil sebagai kalimat di bawahnya tanpa warna aksen; `*aksen*` tidak lagi diwarnai di web (format tetap diterima di `content/`, PDF tidak berubah); badge pil peran dan label mono huruf kapital dihapus (font mono hanya untuk keluaran mesin: label deteksi, nama kelas); tiga angka hero menjadi daftar dengan konteks (label di `profile.yaml` diperpanjang EN/ID, ditinjau pemilik); proyek pilihan di beranda menjadi baris, bukan kartu; Kontak menjadi email besar + tombol salin + tautan media sosial (semuanya tetap ada); judul halaman, meta, dan JSON-LD tidak berubah; `docs/03` dan `docs/04` diperbarui; `feature-inventory` lulus.
- [ ] **T13.3** Inti "satu ruang" 3D (`src/scenes/room/`, ADR 0019)
  - Kriteria: satu kanvas `position: fixed` per halaman di belakang isi, dibuat setelah LCP lewat dynamic import; jalur kamera dihitung dari posisi bagian-bagian halaman (fungsi murni dengan tes: titik jangkar, interpolasi, offset tampilan desktop/HP); dinding dan lantai penangkap bayangan; satu cahaya utama mengikuti kamera; warna dari token sesuai tema dan posisi scroll, ikut berubah saat tema diganti; tingkatan perangkat: penuh (bayangan real-time), sedang (bayangan statis), `off` (HTML saja), memakai `decide3D` yang ada; reduced motion = kamera berpindah tanpa terbang dan tanpa animasi otomatis; hanya menggambar ulang saat ada perubahan; ruangan dibuat saat didekati; kontrak `SceneHandle` tetap; kanvas `aria-hidden` dan tidak menghalangi klik, fokus, atau seleksi teks; `docs/02-architecture.md` §6 diperbarui.
- [ ] **T13.4** Beranda, ruang 1: foto cetak dan lembar aksara Jawa
  - Kriteria: foto dan lembar aksara bertuliskan "Harry Mardika" melayang dengan bayangan (bayangan foto jatuh ke lembar); urutan deteksi sekali saat halaman dibuka (wajah → `person` → nama; lalu kotak ha, ra, ma, da, ka → transliterasi), tombol "putar ulang"; gambar lembar dan koordinat kotaknya dibuat sekali oleh `scripts/generate-aksara.ts` dan hasilnya di-commit ke `content/media/` (font Noto Sans Javanese hanya dipakai skrip itu, alasan dependency ditulis di commit), sehingga browser tidak memuat font aksara; fallback HTML = foto + gambar lembar dengan bayangan CSS, gambar LCP tetap foto; semua label dan keterangan dari kamus UI EN/ID; tombol Download CV dan Portfolio PDF tetap (beserta statistik unduhan); scene `photo-card` lama dihapus setelah diganti; LCP < 2,5 s di HP; pratinjau ke pemilik.
- [ ] **T13.5** Beranda, ruang 2: benang journey
  - Kriteria: benang dari bawah lembar aksara melewati titik-titik `journey.yaml` (4–6 item) sampai ke lantai proyek; bola mengikuti scroll; titik yang sudah dilewati menyala dan daftar HTML ikut menandainya; klik titik 3D membuka popover detail yang sama dengan daftar (popover tetap jalan tanpa JS); scene `journey-path` lama dihapus setelah diganti; tes journey lama tetap lulus atau disesuaikan setara.
- [ ] **T13.6** Beranda, ruang 3–5: konveyor, Kind words, laptop homelab
  - Kriteria: konveyor membawa 3 proyek pilihan di depan dan proyek lain dari data, wadah dari `profile.projects.categories`; hover/ketuk menampilkan judul, klik membuka studi kasus; Kind words: pesan dari `messages.yaml` sebagai kertas yang ditempel (teks tetap HTML) + tombol "Leave a message"; Kontak: laptop homelab yang layarnya menampilkan beranda; tanpa 3D semuanya tetap HTML; pratinjau ke pemilik.

---
- [ ] **T13.7** Penutupan Fase 13: rapikan dan dokumentasikan (AGENTS.md §2a), rilis 1.5.0
  - Kriteria: kode/dependency/branch yang tidak terpakai dihapus (termasuk scene lama dan token hijau lama); README, docs/02, docs/03, docs/04 sesuai kode; ADR 0018 dan 0019 tercatat di `docs/adr/README.md`; fase ✅ dan ringkasan fase di PROGRESS; entri CHANGELOG fase dipindah ke rilis bertanggal; `bun run verify` lulus, `feature-inventory` lulus, Lighthouse ketujuh halaman ≥ 90/95 dan dibandingkan dengan angka T13.0; situs live dicek di desktop dan HP sungguhan; laporan ke pemilik.

## Fase 14: Halaman lain dalam ruang yang sama (`docs/11-roadmap.md` §H; D20, D21)

Dikerjakan setelah Fase 13 selesai. Setiap halaman adalah sudut lain dari ruangan yang sama, memakai inti dari T13.3.

- [ ] **T14.1** Projects: jalur sortir penuh dan daftar indeks (D20)
  - Kriteria: semua proyek (studi kasus dan repo GitHub) di konveyor dari data, wadah per kategori (aturan sama dengan filter: kategori < 2 proyek disembunyikan); filter dan tautan `?filter=` menyorot wadah dan proyeknya; pencarian tetap; daftar indeks (tahun, judul, deskripsi, bidang, angka utama) menggantikan grid kartu; klik kartu di konveyor membuka studi kasus; e2e memakai helper `publishedCaseStudies` (tanpa daftar proyek di kode tes); Lighthouse `/projects/` ≥ 90.
- [ ] **T14.2** About: dinding penghargaan
  - Kriteria: penghargaan dan sertifikat aktif sebagai cetakan berbingkai dari `awards.yaml` dan `certifications.yaml` (sertifikat kedaluwarsa tetap hilang otomatis); hover/klik menyorot item yang sama di daftar HTML; semua bagian About tetap (ringkasan, pengalaman, pendidikan, penghargaan, sertifikat, skill).
- [ ] **T14.3** Statistik: laptop homelab
  - Kriteria: layar laptop menampilkan status server dan kunjungan dari API statistik publik yang sudah ada (tidak ada data baru yang disimpan); saat API mati layar menampilkan "offline" dan isi HTML `/stats/` tetap; semua isi halaman Statistik tetap.
- [ ] **T14.4** 404 ala computer vision
  - Kriteria: kotak deteksi memindai dinding kosong lalu mengunci "page · not found 0.99"; teks 404 dan tautan tetap HTML; label dari kamus UI (EN/ID).
- [ ] **T14.5** Halaman tanpa 3D mengikuti tampilan baru
  - Kriteria: studi kasus, `/cv/`, `/messages/` (beserta halaman terkirim, belum terkirim, dan tinjau), panel chatbot, menu HP, dan footer memakai warna dan tipografi baru; gambar OG dibuat ulang dengan warna baru; halaman cetak dan PDF tidak berubah; axe tanpa pelanggaran di kedua tema.
- [ ] **T14.6** (opsional, diputuskan pemilik setelah T14.5) Transisi antarhalaman
  - Kriteria: kanvas tetap hidup saat pindah halaman (Astro View Transitions) dan kamera terbang ke sudut halaman baru, hanya bila chatbot, statistik, formulir, dan skrip halaman tetap benar; bila tidak, dibatalkan dan alasannya dicatat.

---
- [ ] **T14.7** Penutupan Fase 14: rapikan dan dokumentasikan (AGENTS.md §2a), rilis 1.6.0
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
| D10 | Varian CV | **6 varian** (AI/ML, Data Engineer, Data Analyst, Product Manager, Project Manager, Management Trainee; Product dan Project dipisah 2026-10-08). **CV per perusahaan tidak dibuat** (2026-10-07). PDF varian dibuat saat deploy di `/downloads/cv/` (pemilik tidak ingin membuatnya di laptop) dan **ditautkan di footer** lewat halaman `/cv/` "CV per posisi" (label footer: "Resumes" / "Resume", pilihan pemilik; istilah "CV" tetap dipakai di tempat lain), atas pilihan pemilik walau disarankan tetap tersembunyi; halaman tetap noindex agar hasil pencarian tetap memuat positioning utama (2026-10-08). Varian MT memakai baris peran "Informatics Graduate · Technology & Leadership" karena MT adalah program yang dilamar |
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

**Dijawab pemilik 2026-10-10 sebelum pergi** (Fase 13 dikerjakan tanpa pemilik):
- **Deploy:** semua tugas Fase 13 dikumpulkan di branch `phase/13` (di-push sebagai cadangan) dan baru di-merge ke `main` di T13.7 setelah semua tes dan Lighthouse lulus, agar situs live tidak pernah tampil setengah jadi.
- **Pratinjau** T13.1, T13.4, T13.6: agent memakai penilaian sendiri mengikuti pratinjau yang disetujui; screenshot desktop/HP × terang/gelap disiapkan untuk ditinjau pemilik setelah kembali.
- **Label angka hero (T13.2):** "from idea to commercial launch at Decklify", "NPS in Decklify's first two weeks", "accuracy in grant-funded crisis-detection research" (versi ID diterjemahkan).
- **Ejaan aksara:** ꦲꦂꦫꦶ ꦩꦂꦢꦶꦏ (har-ri mar-di-ka) sudah benar.

**Belum diputuskan** (dijawab saat tugasnya tiba):
- Transisi antarhalaman (T14.6, opsional): diputuskan setelah T14.5. Rekomendasi: kerjakan hanya bila chatbot, statistik, dan formulir tetap benar.
- Skor kelas pada label aksara (T13.4, opsional): pemilik boleh menjalankan model skripsinya pada gambar lembar aksara untuk mendapat skor asli; tanpa itu label hanya berisi nama kelas, tanpa angka.

## Catatan data

- Alibaba Cloud Certified Associate **kedaluwarsa Nov 2026**. Setelah lewat tanggalnya, sertifikat otomatis hilang dari web dan CV (`expires` di `content/certifications.yaml`).
- Isian pemilik (7 `TODO(owner)`) dan review 55 terjemahan ID **selesai 2026-10-07**; lihat `docs/progress-archive.md`. Terjemahan baru tetap perlu dibaca pemilik sebelum dianggap final.

---

## Log sesi

Format: `### YYYY-MM-DD · <agent/orang> · <tugas>`, lalu poin: dikerjakan / belum / langkah berikutnya / catatan. Entri terbaru di atas. Simpan sekitar 5 entri terakhir di sini; entri yang lebih lama dipindah ke [`docs/progress-archive.md`](docs/progress-archive.md) agar file ini tetap ringkas.

### 2026-10-10 · Claude Code (Opus) · T13.0 pagar pengaman fitur lama
- **Dikerjakan:** `tests/e2e/feature-inventory.spec.ts` (60 tes: EN/ID × desktop/HP, plus tanpa JS dan file PDF): layout bersama di enam halaman (skip link, ganti bahasa, tombol tema, chatbot, footer Statistik/Resumes/Leave a message + lima tautan sosial, hreflang, og:image, navigasi termasuk menu HP), hero (nama di H1, Download CV + Portfolio PDF dengan `download`/`data-download`, tiga angka), Journey (semua milestone + cerita), proyek pilihan, Kind words + tautan formulir, Kontak (email, empat media sosial, tombol salin), Projects (pencarian, filter, `?filter=`, semua studi kasus), studi kasus, About, `/cv/` (dua PDF per varian), Statistik, formulir pesan, 404. Pemilih memakai peran, kamus UI, `content/`, dan id bagian (`#journey`, `#projects`, `#messages`, `#contact`) yang wajib dipertahankan oleh redesain.
- **Lighthouse pembanding (HP, median 3 run, build e2e):** `/` 99/100/100/100 · `/id/` 98 · `/about/` 100 · `/projects/` 100 · `/projects/decklify/` 100 · `/stats/` 99 · `/messages/` 100 (performa; a11y, best practices, SEO semuanya 100). `bun run lighthouse` butuh akses jaringan untuk `bunx` (di sandbox agent gagal tanpa itu).
- **Screenshot acuan** tampilan lama (beranda, Projects, About × desktop/HP × terang/gelap) dibuat di scratchpad agent untuk perbandingan, tidak di-commit.
- **Langkah berikutnya:** T13.1 (warna Giok → Nila, ADR 0018).

### 2026-10-10 · Claude Code (Opus) · Rencana baru Fase 13–14 (tampilan Giok → Nila, "satu ruang" 3D)
- **Permintaan pemilik:** tampilan lebih baik dan tidak terasa buatan AI, tidak datar, foto tetap ada, lebih banyak 3D, dan **fitur lama tidak boleh hilang**.
- **Diagnosis** (dari situs yang berjalan): kata terakhir judul diwarnai amber, badge pil dan label mono huruf kapital, tiga angka besar tanpa konteks, bola dan cincin dekoratif di sekitar foto, semua isi berupa kartu identik, warna rata tanpa cahaya; rencana Fase 13 lama (peta embedding, rasi bintang, globe titik) memakai motif yang paling umum di portfolio AI.
- **Pratinjau yang dibandingkan pemilik:** hero Aksara Jawa vs foto cetak, lalu gabungan keduanya; jalur sortir proyek (dari Reclaimyt); "full 3D" dua arti (dunia 3D penuh vs satu kanvas di belakang isi HTML; yang kedua dipilih karena tetap cepat, terbaca Google, dan sesuai ADR 0007); warna Giok, Nila, Studio, Sogan, dan tiga campuran giok-nila.
- **Keputusan pemilik:** D18 (Giok → Nila, terang = versi muda), D19 (H1 = nama), D20 (daftar indeks di Projects), D21 ("satu ruang"; menggantikan D17).
- **Dikerjakan:** Fase 13 ditulis ulang (T13.0–T13.7) dan Fase 14 baru (T14.1–T14.7) di file ini; `docs/11-roadmap.md` §H ditulis ulang dan §I baru (daftar fitur yang wajib tetap ada, dijaga e2e); README. Belum ada kode; ADR 0018/0019 ditulis di T13.1/T13.3.
- **Langkah berikutnya:** T13.0 (`tests/e2e/feature-inventory.spec.ts` dan angka Lighthouse pembanding), lalu T13.1.

### 2026-10-09 · Claude Code (Opus) · T12.5 penutupan Fase 12 (ringkasan fase)
- **Yang dibangun (Fase 12, ADR 0017):** formulir "Tinggalkan pesan" `/messages/` (EN/ID, tanpa JS tetap jalan, tanpa email penulis, persetujuan tayang wajib, honeypot, batas 3/hari); antrean privat di layanan stats (`messages.sqlite` terpisah tanpa backup, *rollback journal* + `secure_delete`, pending 90 hari, approved tanpa PR 30 hari, tanpa IP); halaman tinjau privat ber-token `/messages/review/`; workflow `kind-words.yml`: terjemahan AI → satu PR antrean `kind-words/queue` → hapus dari server, dan notifikasi harian berupa issue berisi jumlah saja. Satu aturan kontak (`src/lib/security/contact.ts`) untuk formulir, terjemahan, tes konten, dan chatbot.
- **Keputusan pemilik:** formulir di halaman sendiri; tinjau di halaman privat; PR otomatis; tanpa email; notifikasi lewat issue GitHub; seluruh fase dikerjakan selagi pemilik pergi (token dipasang di server dan GitHub atas izin itu).
- **Uji live:** kirim → notify (issue #4) → setujui/tolak → publish (PR #5, terjemahan, model antrean) → issue tertutup otomatis; PR uji ditutup, antrean server kosong. Satu bug ditemukan dan diperbaiki (terjemahan pesan tanpa jabatan).
- **Rapikan:** tidak ada dependency baru, kunci teks UI semuanya terpakai, tidak ada `TODO`, branch fase ini terhapus (sisa: `drafts/case-study-rocm-test` milik PR #2), konstanta internal tidak lagi diekspor.
- **Sisa untuk pemilik:** simpan `MESSAGES_ADMIN_TOKEN` dari `/opt/portfolio/.env` ke password manager; pastikan email notifikasi GitHub aktif untuk repo ini (*Watching*); review PR #2 dan draf AI yang menunggu; tutup issue #4/PR #5 tidak perlu (sudah ditutup).
- **Fase berikutnya:** Fase 13, T13.1 (peta proyek 3D di halaman Projects).

### 2026-10-09 · Claude Code (Opus) · T12.4 workflow kesan & pesan
- **Dikerjakan:** `kind-words.yml` (tiap jam `publish`, 08.07 WIB `notify`, manual) + `scripts/kind-words.ts` + `src/lib/messages/publish.ts`. Pesan yang disetujui → terjemahan AI (key `DRAFT_*`, teks pengunjung sebagai data, hasil dicek: skema, jabatan konsisten, tanpa kontak/markup) → entri divalidasi skema konten → **satu PR antrean** `kind-words/queue` (setiap pesan satu commit bertrailer `Kind-words-id`, sehingga tidak pernah dobel) → dihapus dari server setelah ada di PR terbuka. Pesan bahasa Inggris tetap masuk walau terjemahan gagal; pesan bahasa Indonesia dicoba lagi tiap jam. `notify`: satu issue berisi jumlah saja (email GitHub), komentar bila jumlah berubah, ditutup bila nol.
- **Dari review:** *blocker*: tes konten memakai aturan nomor HP lama dan menolak `**`, sehingga pesan wajar ("08-10-2024", "Rp 62 000 000") gagal terus → **satu aturan kontak** di `src/lib/security/contact.ts` untuk formulir, terjemahan, tes konten, dan chatbot; `**` dibuang di formulir dan terjemahan. Banyak PR per pesan akan saling konflik → satu PR antrean; branch tanpa PR dianggap belum selesai; cron harian digeser dari awal jam; teks persetujuan dan docs menyebut bahwa isi pesan terbaca publik di GitHub begitu masuk PR. `/security-review`: tanpa temuan.
- **Diuji:** 496 tes unit (termasuk entri yang dibuat selalu lolos tes konten); uji live menyusul setelah merge (workflow harus ada di `main`).
- **Uji live:** dua pesan uji lewat API publik → `notify` membuka issue #4 (jumlah saja) → satu disetujui, satu ditolak → `publish` membuka PR #5 dan menghapus salinan di server. Uji ini menemukan bug: terjemahan pesan tanpa jabatan selalu ditolak (cek "teks kosong" membaca jabatan yang tidak ada sebagai teks kosong); diperbaiki + tes regresi, dan alasan penolakan kini menyebut field dan kode masalah (tanpa teks).
- **Langkah berikutnya:** uji ulang (pesan ID tanpa jabatan ditambahkan ke PR #5), bersihkan PR/issue uji, lalu T12.5 (penutupan Fase 12, rilis 1.4.0).

### 2026-10-09 · Claude Code (Opus) · T12.3 halaman tinjau privat + token di server
- **Server (atas izin pemilik mengerjakan seluruh Fase 12):** `compose.yml` baru disalin (cadangan di `backups/`), `MESSAGES_ADMIN_TOKEN` dibuat di `/opt/portfolio/.env` (tidak pernah dicetak; ambil dari sana untuk password manager) dan disalin ke secret repo GitHub; `docker compose up -d stats` → log `kind words form open`, `/api/messages/count` = 0, tanpa token 401.
- **Dikerjakan:** `/messages/review/` + `/id/messages/review/` (`MessageReview.astro`): token di `sessionStorage` per tab, daftar pending (semua teks lewat `textContent`, tautan hanya bila https), ringkasan jumlah pending/approved, Setujui/Tolak dengan konfirmasi, token salah → dilupakan. `noindex`, `Disallow` di robots, `track={false}` (opsi baru di `PageLayout`).
- **Diuji:** 12 e2e (teks aman dari XSS, tautan `javascript:` tetap teks, konfirmasi, token dikirim, token salah, privat/robots/tanpa statistik, axe terang/gelap, tombol ≥ 44 px); dilihat langsung di desktop dan HP (gaya tombol kartu sempat hilang karena dibuat skrip, diperbaiki dengan `:global`).
- **Dari review (tanpa blocker):** setelah Setujui/Tolak kartu dihapus dan jumlah diperbarui di tempat (tadinya memuat ulang seluruh antrean, bisa balapan dan menimpa status sukses); tombol "Muat ulang antrean"; 404 = sudah diproses di tempat lain (kartu hilang, pesan jelas); fokus pindah ke kartu berikutnya / ringkasan / kolom token; tombol menyebut nama penulis (`aria-describedby`); placeholder diisi dengan fungsi (pola `$&` di nama tidak berlaku); tanggal sesuai bahasa halaman; tautan profil menampilkan alamat hasil parse (domain mirip terlihat); `autocomplete=current-password`. `/security-review`: tanpa temuan. 18 e2e.
- **Langkah berikutnya:** T12.4 (workflow PR otomatis + notifikasi harian).
