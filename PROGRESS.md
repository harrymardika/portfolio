# PROGRESS

> Satu-satunya sumber kebenaran tentang status proyek. **Perbarui setiap kali menyelesaikan atau menghentikan tugas.**
> Legenda: `[ ]` belum · `[~]` sedang dikerjakan (tulis siapa) · `[x]` selesai · `[!]` terblokir (tulis alasannya)

**Terakhir diperbarui:** 2026-11-10 · **Fase aktif:** Fase 17 (gambar proyek dan Portfolio PDF bergambar) · **Tugas berikutnya:** T17.1 (skema dan tampilan gambar proyek)

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
| 15 | ~~Halaman lain (Projects, About, Statistik, 404) dalam ruang 3D yang sama (§H)~~ | ❌ Dibatalkan 2026-10-28 (D23, digantikan versi 2) |
| 16 | Perbaikan dan konten: deploy, Kind words, PIMNAS dan Decklify, evaluasi CV per posisi, tracker issue, AI editor Kind words (`docs/12-v2.md` §A–C2) | ✅ Selesai 2026-10-30 (rilis 1.6.1 dan 1.7.0) |
| 17 | Gambar proyek (3 per proyek) dan Portfolio PDF bergambar (`docs/12-v2.md` §D) | Belum (rilis 1.8.0) |
| 18 | **Versi 2**: tampilan ala lamalama.com, ruangan 3D diganti (`docs/12-v2.md` §E, ADR 0021) | Belum (rilis 2.0.0) |

Progres keseluruhan: **Fase 0–14 dan 16 selesai (Fase 15 dibatalkan); situs online sejak 2026-10-06, chatbot dan formulir kesan & pesan sejak 2026-10-09, tampilan Giok → Nila sejak 2026-10-10, beranda "full 3D" sejak 2026-10-13, Decklify lengkap, CV per posisi dengan proyek pilihan, tracker permintaan, dan AI editor Kind words sejak 2026-10-30 (rilis 1.7.0). Berikutnya Fase 17–18 (versi 2): `docs/12-v2.md`**

---

## Fase 0–16 ✅

Semua tugas Fase 0–16 sudah selesai (Fase 15 dibatalkan). Daftar tugas lengkap beserta kriterianya dipindah ke [`docs/progress-archive.md`](docs/progress-archive.md#daftar-tugas-fase-016) agar file ini ringkas.

## Fase 17: Gambar proyek dan Portfolio PDF bergambar (`docs/12-v2.md` §D; D25)

Tiga gambar per studi kasus (sampul, diagram, hasil), jujur dan dibuat skrip; tidak ada angka atau tampilan rekaan.

**Sisipan mendesak (permintaan pemilik 2026-11-09, independen, dikerjakan sebelum T17.1):**

- [x] **T17.0** Hotfix: deploy jalan lagi (rilis 1.7.1)
  - Penyebab: sejak 2026-11-04 setiap Deploy gagal di langkah `knowledge`: setelah 14 draf studi kasus di-merge, `knowledge-compact.json` ±5.107 token (data asli) / ±5.205 (fixture e2e), di atas anggaran 5.000. Situs live belum memuat 14 studi kasus itu.
  - Kriteria: versi ringkas memakai baris pendek (judul, tahun, tag) untuk studi kasus yang tidak `featured` (ringkasan tetap di versi lengkap), sehingga tiap studi kasus baru menambah ±20 token, bukan ±80; batas 5.000 tidak dinaikkan; ADR baru mengubah sebagian ADR 0022; tes unit; `bun run build` (data asli) dan `bun run verify` lulus; Deploy sukses dan live dicek.
- [x] **T17.0b** Bagian Publikasi (D33)
  - Kriteria: `content/publications.yaml` (judul, penulis, jurnal, volume/nomor, tahun, DOI/URL, status `published`/`submitted`, tautan ke studi kasus) dengan skema Zod dan Pages CMS; bagian "Publications/Publikasi" di About, CV umum + 7 varian, dan Portfolio PDF (EN/ID); chatbot mengetahuinya; studi kasus `aksara-jawa-yolo` EN/ID menautkan DOI; isi pertama: artikel JSCE Vol 7 No 4 (Okt 2026), DOI 10.61628/jsce.v7i4.2904; CV tetap ≤ 2 halaman.
- [x] **T17.0c** Sertifikat BNSP, Penulisan Ilmiah, dan catatan ijazah (D34–D36)
  - Kriteria: `certifications.yaml` memuat BNSP "Associate Data Scientist (Ilmuwan Data Madya)", LSP Universitas Gunadarma atas nama BNSP, terbit 2026-07, berlaku s.d. 2029-07, nomor sertifikat sebagai `credential_id`; disebut di ringkasan CV varian Data Scientist dan AI/ML; Penulisan Ilmiah (PI, 2025) "Aplikasi Chatbot Akademik Berbasis RAG …" sebagai poin di Pendidikan yang menautkan studi kasus Chatbot RAG; CV menulis "Transcript and diploma available on request" tanpa mengunggah dokumen; NPM, tempat/tanggal lahir, dan nomor ijazah tidak masuk repo; CV tetap ≤ 2 halaman.
  - Catatan penutupan (temuan reviewer): (1) poin PI tidak bisa memuat tautan (teks poin hanya mendukung tebal), jadi tautannya dibalik: studi kasus Chatbot RAG EN/ID menyebut PI dengan judul lengkap. (2) Penerbit ditulis `BNSP` saja (LSP Universitas Gunadarma ada di komentar YAML), karena nama lembaga yang lebih panjang membuat CV ID kembali 3 halaman. Ubah bila pemilik ingin LSP tampil.
- [x] **T17.0d** Tautan artikel JSCE dan CV tanpa nama penulis (permintaan pemilik 2026-11-09, rilis 1.7.3)
  - Kriteria: DOI belum aktif di doi.org, jadi semua tautan artikel (About, CV, studi kasus aksara EN/ID) ke `https://journal.unpacti.ac.id/index.php/JSCE/article/view/2904`; `url` didahulukan atas DOI; DOI tetap ditulis dan tautannya ke halaman artikel (About, CV, Portfolio PDF, studi kasus); CV tanpa nama penulis; `bun run verify` lulus; live dicek.

- [ ] **T17.1** Skema dan tampilan gambar proyek
  - Kriteria: field `images` di frontmatter studi kasus (`src`, `alt` EN/ID, `kind`: `cover`/`diagram`/`result`) di skema + Pages CMS; galeri di halaman studi kasus (EN/ID, `loading="lazy"` di luar layar pertama, ukuran tetap tanpa CLS); sampul di daftar Projects; tes: setiap gambar ada filenya dan punya `alt` EN; dua gambar lama (reclaimyt, dompet-juara) dipakai; tes tidak mengasumsikan jumlah proyek.
- [ ] **T17.2** Skrip `scripts/generate-project-visuals.ts`
  - Kriteria: pola `generate-og.ts` (halaman template Astro + Chromium Playwright → WebP), tanpa dependency baru; masukan `content/media/projects/<slug>/visuals.yaml` (motif sampul, simpul/panah diagram, data grafik) divalidasi skema; warna dari token desain; hasil di-commit; dijalankan ulang menghasilkan file yang sama; diuji pada 2 proyek dan ditinjau pemilik sebelum T17.3.
- [ ] **T17.3** Isi gambar untuk semua studi kasus
  - Kriteria: setiap studi kasus terbit punya tepat 3 gambar; data diagram dan grafik hanya dari studi kasus/repo (sumber dicatat di `visuals.yaml`); tes "setiap studi kasus terbit punya 3 gambar" diaktifkan; dikerjakan per batch (±7 proyek) dan tiap batch ditinjau pemilik; draf AI baru (T8.2) ikut membuat `visuals.yaml`.
- [ ] **T17.4** Portfolio PDF bergambar
  - Kriteria: setiap proyek di Portfolio PDF EN/ID menampilkan sampul dan gambar hasil (diagram bila muat); ukuran PDF wajar (target dicatat di `docs/09-pdf-generation.md`); CV PDF dan tujuh varian tetap tanpa gambar (ATS); tes PDF diperbarui.

---
- [ ] **T17.5** Penutupan Fase 17 (AGENTS.md §2a), rilis 1.8.0
  - Kriteria: seperti T13.7; `docs/04-content-guide.md` menjelaskan `images` dan `visuals.yaml`; laporan ke pemilik.

## Fase 18: Versi 2, tampilan ala lamalama.com (`docs/12-v2.md` §E; ADR 0021; D23, D28)

Aturan untuk semua tugas Fase 18:
- **Fitur lama tidak boleh hilang** (`docs/11-roadmap.md` §I, `tests/e2e/feature-inventory.spec.ts`); tes lama hanya boleh disesuaikan bila yang dicek tetap setara.
- Situs utuh tanpa JS; reduced motion dihormati; Lighthouse ≥ 90/95; kontras ≥ 4,5:1 di kedua tema; halaman cetak dan PDF tidak berubah.
- Hanya bahasa desain lamalama yang ditiru; logo, foto, teks, dan aset mereka tidak dipakai.
- Semua tugas di branch `phase/18`, merge ke `main` sekali di T18.8 (situs live tidak pernah setengah jadi). Setiap tugas tampilan dicek di desktop dan HP, gelap dan terang.

- [ ] **T18.0** Pratinjau desain v2 untuk disetujui pemilik (sebelum kode tampilan)
  - Kriteria: pratinjau beranda, Projects, dan studi kasus (desktop 1440 dan HP 412, gelap dan terang) berdampingan dengan screenshot lamalama.com; keputusan yang tersisa di `docs/12-v2.md` §E dijawab pemilik (font grotesk berlisensi terbuka, warna aksen, teks navigasi pil, isi marquee, foto di hero, bentuk journey, sisa 3D); hasilnya dicatat sebagai keputusan baru di PROGRESS.
- [ ] **T18.1** Fondasi: token, tipografi, tema
  - Kriteria: token baru (arang, krem, aksen) di `src/styles/tokens.css`, tema gelap bawaan dan terang lewat tombol yang ada tanpa kedip (D28); font di-self-host (Fontsource, alasan di commit); skala tipografi judul raksasa; komponen label `[ ... ]` dan chip tag; `tokens-contrast.test.ts` dan `lint:tokens` diperbarui; `docs/03-design-system.md` ditulis ulang.
- [ ] **T18.2** Kerangka global: navigasi pil, panel kanan, footer
  - Kriteria: navigasi pil di tengah dengan teks per bagian (tanpa JS: teks tetap); panel kecil yang bisa dibuka-tutup (Download CV, Portfolio PDF, Tanya Harry, Leave a message) ramah keyboard dan pembaca layar; footer dengan jam live WIB (tanpa JS: tanpa jam), tautan sosial, saklar EN/ID; menu HP; chatbot dan semua tautan footer lama tetap.
- [ ] **T18.3** Beranda v2 dan pelepasan ruangan 3D
  - Kriteria: hero (H1 nama + pernyataan besar), journey, deretan proyek pilihan dengan chip dan strip gambar Fase 17, marquee, Kind words, kontak; animasi titik canvas 2D setelah LCP (diam untuk reduced motion); ruangan 3D tidak dipasang lagi di beranda; tombol Download CV/Portfolio PDF dan statistik unduhan tetap; LCP < 2,5 s di HP.
- [ ] **T18.4** Projects dan studi kasus
  - Kriteria: indeks Projects sebagai deretan baris (judul, chip tag/bidang, `( + )` ringkasan, strip gambar; catatan T15.1: bintang GitHub dan bidang); pencarian, filter, dan `?filter=` tetap; halaman studi kasus dengan galeri gambar besar; e2e memakai `publishedCaseStudies`.
- [ ] **T18.5** Halaman lain: About, Statistik, `/cv/`, `/messages/*`, 404, OG
  - Kriteria: semua halaman memakai tampilan v2; isi About, Statistik, formulir, dan halaman tinjau tetap; gambar OG dibuat ulang; axe tanpa pelanggaran di kedua tema.
- [ ] **T18.6** Gerak, aksesibilitas, performa
  - Kriteria: transisi dan hover halus dengan CSS; reduced motion; fokus keyboard terlihat; Lighthouse ≥ 90/95 di semua halaman; JS per halaman dicatat dan dibandingkan dengan 1.6.0.
- [ ] **T18.7** Hapus kode lama
  - Kriteria: `src/scenes/room/`, `earlyMode` dan `html[data-room-3d]` (beserta hash CSP-nya), token `--room-*`/Giok → Nila, dependency `three` dan `@types/three`, tes yang hanya menguji 3D (diganti tes setara bila fiturnya tetap) dihapus; `docs/02-architecture.md` §6 diselaraskan; gambar proyek dibuat ulang dengan token v2 (`generate-project-visuals`).

---
- [ ] **T18.8** Penutupan Fase 18 (AGENTS.md §2a), rilis **2.0.0**
  - Kriteria: seperti T13.7; review subagent dan `/security-review` seluruh fase; screenshot berdampingan dengan lamalama.com (desktop/HP × gelap/terang); merge `phase/18` → `main`, deploy, tag `v2.0.0`, cek live; laporan ke pemilik.

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
| D23 | Arah tampilan v2 | **Tema dan konsep mirip lamalama.com**, ruangan 3D diganti; menggantikan D18, D21, D22 dan "label mono dihapus" (T13.2). Fase 15 dibatalkan. Hanya bahasa desain yang ditiru, bukan aset (2026-10-28; `docs/12-v2.md` §E, ADR 0021) |
| D24 | Versi | **Bertahap:** 1.6.1 (hotfix) → 1.7.0 (konten, tracker, AI editor) → 1.8.0 (gambar proyek) → **2.0.0** (redesain) (2026-10-28) |
| D25 | Gambar proyek | **3 per studi kasus, campuran jujur**: sampul, diagram alur, hasil dari angka asli atau screenshot asli; dibuat skrip; Portfolio PDF wajib bergambar, CV tetap tanpa gambar (2026-10-28) |
| D26 | PKM-K dan dana | **Finalis PIMNAS 2026 (PKM-K)**, hasil PIMNAS belum keluar (pemilik membuat issue bila ada medali); dana hibah **Rp8.125.000**, bukan Rp5,85 juta (2026-10-28) |
| D27 | Tracker permintaan | **GitHub Issues + formulir**, label `inbox`/`planned`/`needs-owner`; repo publik, jadi tanpa data pribadi di issue (2026-10-28) |
| D28 | Tema v2 | **Gelap bawaan, terang pilihan, satu warna aksen** (2026-10-28) |
| D29 | Kind words Masriq | `role` dan `relationship` **boleh dirapikan**; isi pesan tetap, diterjemahkan ke Inggris (2026-10-28) |
| D30 | AI editor Kind words | **Setelah disetujui, di PR**: deteksi bahasa, rapikan metadata, terjemahkan, tandai masalah; **isi pesan hanya saran**; tanpa secret/layanan baru (2026-10-28) |
| D31 | Keterangan Decklify | Dilengkapi dari dokumen PKM-K. Pemilik **tidak menulis kode** Decklify; perannya perencanaan dan evaluasi (desain sistem, evaluasi produk), server, dokumen/keuangan, legalitas. 45 transaksi Oktober boleh tampil **tanpa rupiah**; klaim lama dikoreksi sesuai laporan akhir (2026-10-30) |
| D32 | Evaluasi CV | Semua CV (umum + 7 varian) dievaluasi menurut kriteria HR per posisi lalu **langsung diperbaiki**; pemilik meninjau di ringkasan akhir (2026-10-30) |
| D33 | Publikasi | **Bagian baru Publications/Publikasi** (About, CV umum + varian, Portfolio PDF, chatbot); isi pertama artikel JSCE skripsi (2026-11-09) |
| D34 | Penulisan Ilmiah (PI) | Masih proses dikirim ke jurnal: **poin di Pendidikan** sekarang; pindah ke Publikasi berstatus `submitted` setelah dikirim, lalu `published` + DOI setelah terbit (saran agent, 2026-11-09) |
| D35 | Ijazah dan transkrip | **Tidak diunggah**; CV menulis IPK + "Transcript and diploma available on request" (2026-11-09) |
| D36 | Sertifikat BNSP | **Nomor sertifikat ditampilkan** sebagai credential ID; disebut di ringkasan varian Data Scientist dan AI/ML (2026-11-09) |

**Dijawab pemilik 2026-10-10 sebelum pergi** (Fase 13 dikerjakan tanpa pemilik):
- **Deploy:** semua tugas Fase 13 dikumpulkan di branch `phase/13` (di-push sebagai cadangan) dan baru di-merge ke `main` di T13.7 setelah semua tes dan Lighthouse lulus, agar situs live tidak pernah tampil setengah jadi.
- **Pratinjau** T13.1, T13.4, T13.6: agent memakai penilaian sendiri mengikuti pratinjau yang disetujui; screenshot desktop/HP × terang/gelap disiapkan untuk ditinjau pemilik setelah kembali.
- **Label angka hero (T13.2):** "from idea to commercial launch at Decklify", "NPS in Decklify's first two weeks", "accuracy in grant-funded crisis-detection research" (versi ID diterjemahkan).
- **Ejaan aksara:** ꦲꦂꦫꦶ ꦩꦂꦢꦶꦏ (har-ri mar-di-ka) sudah benar.

**Dijawab pemilik 2026-10-13:**
- **Tinjauan Fase 13:** pemilik meminta agent yang meninjau (bukan di perangkat sungguhan). Hasilnya di log sesi 2026-10-13.
- **Perbaikan dari tinjauan:** dikerjakan sekarang, tetapi **tayang bersama Fase 14** (tidak ada rilis terpisah). Fase 14 dikerjakan sampai selesai; `main` dan situs live baru berubah di T14.6.

**Belum diputuskan** (dijawab saat tugasnya tiba):
- Detail desain v2 (T18.0, dengan pratinjau): font grotesk, warna aksen, teks navigasi pil, isi marquee, foto di hero, bentuk journey, sisa 3D (`docs/12-v2.md` §E).
- Medali PIMNAS 2026: menunggu hasil; pemilik membuat issue di tracker.

## Catatan data

- Alibaba Cloud Certified Associate **kedaluwarsa Nov 2026**. Setelah lewat tanggalnya, sertifikat otomatis hilang dari web dan CV (`expires` di `content/certifications.yaml`).
- Isian pemilik (7 `TODO(owner)`) dan review 55 terjemahan ID **selesai 2026-10-07**; lihat `docs/progress-archive.md`. Terjemahan baru tetap perlu dibaca pemilik sebelum dianggap final.

---

## Log sesi

Format: `### YYYY-MM-DD · <agent/orang> · <tugas>`, lalu poin: dikerjakan / belum / langkah berikutnya / catatan. Entri terbaru di atas. Simpan sekitar 5 entri terakhir di sini; entri yang lebih lama dipindah ke [`docs/progress-archive.md`](docs/progress-archive.md) agar file ini tetap ringkas.

### 2026-11-10 · Claude Code (Opus) · rapikan repo (permintaan pemilik)
- **Dikerjakan:** daftar tugas Fase 0–16 dan log lama dipindah ke `docs/progress-archive.md` (`PROGRESS.md` 442 → ±190 baris); 14 branch `drafts/case-study-*` yang sudah di-merge dihapus dari GitHub (aman: proyek yang sudah punya studi kasus tidak didraf ulang); tes format angka memakai `js-yaml` (paket `yaml` tidak tercantum di `package.json`); cache lokal (±105 MB: `.lighthouseci`, `.playwright-mcp`, `dist*`, `build-meta*`, `test-results`) dihapus.
- **Diperiksa, tidak dibuang:** `knip` tidak menemukan dependency yang tak terpakai; dua "file tak terpakai" (`scripts/precompress.ts`, `scripts/serve-build.ts`) ternyata dipakai Dockerfile dan Lighthouse; ekspor yang hanya dipakai di file sendiri dibiarkan. Kode 3D (`src/scenes/`) baru dibuang di Fase 18 (ADR 0021).

### 2026-11-09 · Claude Code (Opus) · T17.0b–c publikasi, BNSP, Penulisan Ilmiah (rilis 1.7.2)
- **Dikerjakan:** `content/publications.yaml` + skema (`status` published/accepted/submitted, DOI tanpa resolver), Pages CMS, bagian Publikasi di About, CV umum + 7 varian, halaman profil Portfolio PDF, chatbot; studi kasus `aksara-jawa-yolo` EN/ID menautkan DOI. BNSP Associate Data Scientist (2026-07 s.d. 2029-07, nomor sertifikat) di Sertifikasi dan ringkasan varian AI/ML + Data Scientist. PI sebagai poin Pendidikan (judul lengkap di studi kasus Chatbot RAG). CV: baris "Transcript and diploma available on request" di gelar ber-IPK.
- **Agar CV umum tetap 2 halaman:** poin skripsi dan PI satu baris; penghargaan MAPRES dan Best Student IDCamp disembunyikan dari CV saja (`show_on_cv: false`, sudah tertulis di Pendidikan/Pelatihan; tetap di web); entri CV boleh berlanjut ke halaman berikut di antara poin (judul tetap menempel poin pertama); jarak antarentri sedikit dirapatkan; label situs di kontak CV hanya domain. Semua 16 PDF CV 2 halaman.
- **Lainnya:** pemeriksa format angka (D16) kini mengabaikan URL (DOI bukan angka desimal). Dokumen pribadi (NPM, tempat/tanggal lahir, nomor ijazah, scan ijazah/transkrip) tidak masuk repo.
- **Menunggu pemilik:** setelah naskah PI dikirim ke jurnal, pindahkan ke `publications.yaml` dengan `status: submitted` (lewat CMS menu Publikasi atau minta agent).

### 2026-11-09 · Claude Code (Opus) · T17.0 hotfix deploy (rilis 1.7.1)
- **Penyebab:** 14 draf studi kasus di-merge pemilik (PR #18–#33); versi ringkas pengetahuan chatbot naik ke ±5.107 token (> 5.000), jadi setiap Deploy sejak 2026-11-04 berhenti di langkah `knowledge`.
- **Perbaikan:** field `brief` (hanya versi ringkas); studi kasus yang tidak `featured` cukup judul, tahun, tag (ADR 0024). Hasil build data asli: ringkas ±4.103/5.000, lengkap ±25.132/30.000 token. `bun run verify` lulus.
- **Permintaan pemilik yang sama:** publikasi JSCE, sertifikat BNSP, Penulisan Ilmiah, saran ijazah/transkrip → T17.0b–c. Keputusan: D33–D36.

### 2026-10-30 · Claude Code (Opus) · T16.6 penutupan Fase 16 (rilis 1.7.0) · ringkasan fase
- **Yang dibangun:** deploy jalan lagi (tes `appendEntry` tidak bergantung pada `content/`; batas pengetahuan chatbot diatur ulang, ADR 0022); Kind words pertama tayang dengan terjemahan benar; Decklify ditulis lengkap dari dokumen PKM-K sesuai peran pemilik (D31) dan Finalis PIMNAS 2026, dana Rp8.125.000; evaluasi semua CV per posisi (`docs/cv-evaluation.md`): bagian proyek pilihan, ringkasan per posisi, tanda hubung ATS; tracker permintaan di GitHub Issues (`AGENTS.md` §2b, dipakai pemilik di #35); AI editor Kind words (ADR 0023).
- **Keputusan pemilik:** D26, D29–D32; batas chatbot (isi studi kasus EN, 30 ribu token); bagian proyek untuk varian yang cocok; alat data tetap dicantumkan; frasa "100% spent and reported" dan "from 38 respondents" dihapus dari CV.
- **Pelajaran:** `bun run verify` memakai data GitHub tiruan, jadi batas pengetahuan chatbot hanya teruji di build Docker; cek dengan `bun run build` (data asli) bila studi kasus atau repo bertambah (`docs/12-v2.md`, tabel risiko).
- **Sisa untuk pemilik:** tinjau draf studi kasus yang masih terbuka (termasuk yang bisa menjadi bukti alat data untuk CV Data Engineer/Analyst); saran isi lama di `docs/cv-evaluation.md` §6; nomor HP tetap di luar PDF publik. Hasil PIMNAS (2–7 November): bila ada medali, buat issue di tracker.
- **Rapikan:** branch remote yang sudah di-merge dihapus (7 draf studi kasus, `kind-words/queue`); tidak ada TODO tersisa; log lama dipindah ke `docs/progress-archive.md`.

### 2026-10-30 · Claude Code (Opus) · T16.5 lanjutan: tinjauan HR blok Decklify
- **Permintaan pemilik:** hapus "(100% spent and reported)" dan "from 38 respondents", lalu nilai CV sebagai HR. Pemilik juga memutuskan alat data (SQL, Spark, Airflow, BigQuery, BI) tetap dicantumkan.
- **Dikerjakan:** blok Decklify ditulis ulang menjadi 5 poin (satu gagasan per poin, tim dan PIMNAS di depan, biaya tetap dibulatkan); ringkasan varian Data Analyst, Product Manager, Project Manager disesuaikan; penilaian dan saran berikutnya di `docs/cv-evaluation.md` §6. Semua 16 PDF tetap 2 halaman. Issue #35 (percobaan pemilik) ditriase dan ditutup.
