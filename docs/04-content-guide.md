# 04 · Panduan konten

Semua isi website, CV, dan Portfolio PDF berasal dari folder `content/`. **Tidak perlu menyentuh kode untuk mengubah isi.**

## 1. Cara cepat mengubah isi

### Dari browser (Pages CMS, ADR 0011)

Cara termudah, juga dari HP.

1. **Sekali saja:** buka [app.pagescms.org](https://app.pagescms.org), masuk dengan akun GitHub, lalu pasang GitHub App Pages CMS **hanya** untuk repo `harrymardika/portfolio` (pilih *Only select repositories*). Periksa daftar izin di layar instalasi (lihat ADR 0011); cabut di GitHub *Settings → Applications* jika tidak dipakai lagi.
2. Pilih repo `portfolio`, branch `main`. Menu di kiri sama dengan tabel di bawah (Profil, Pengalaman, Studi kasus, dll.). Teks dwibahasa punya kolom *English* (wajib) dan *Indonesia* (kosongkan untuk memakai bahasa Inggris).
3. Klik **Save**. Itu menjadi satu commit ke `main`, lalu GitHub Actions memeriksa data (skema, tes, Lighthouse). Jika lolos, web dan PDF ter-update dalam ±15–25 menit (build ±8 menit + server menarik image tiap 10 menit).
4. **Jika data salah**, workflow Deploy di tab *Actions* GitHub berwarna merah dan **web lama tetap tayang**. Buka run itu untuk membaca pesan error (menyebut file, item, dan field), perbaiki di Pages CMS, simpan lagi. Isi situs juga menjadi pengetahuan chatbot; pesan yang diawali `Assistant knowledge:` dijelaskan di [docs/10 §5.8](10-operations.md).

Catatan: editor menulis ulang file YAML tanpa komentar. Simpan catatan di dokumen ini atau `PROGRESS.md`, bukan sebagai komentar di `content/`.

### Dari editor teks (laptop)

1. Buka file yang relevan di `content/` (tabel di bawah).
2. Edit, lalu simpan. Pertahankan format YAML: indentasi 2 spasi, tanda `-` untuk item daftar.
3. Jalankan `bun test` untuk mengecek data dalam hitungan detik (skema, id unik, referensi Journey, dan tidak ada nomor HP), lalu `bun run dev` untuk melihat hasilnya. Jika data salah, pesan error menyebut file, item, dan field-nya, misalnya `experience → decklify … start: Use the YYYY-MM format`.
4. Commit dan push ke `main`. GitHub Actions akan build dan deploy, dan PDF ikut diperbarui.

Bisa juga langsung lewat web GitHub (tombol ✏️ di file), bahkan dari HP.

| Ingin mengubah... | File |
|---|---|
| Nama, headline, ringkasan, email, sosial media, statistik di hero | `content/profile.yaml` |
| Pengalaman kerja, riset, organisasi, mengajar | `content/experience.yaml` |
| Pendidikan | `content/education.yaml` |
| Penghargaan & lomba | `content/awards.yaml` |
| Pelatihan / bootcamp | `content/trainings.yaml` |
| Sertifikat | `content/certifications.yaml` |
| Skills | `content/skills.yaml` |
| Titik-titik di jalur Journey 3D | `content/journey.yaml` |
| Proyek / case study | `content/projects/<slug>.md` (terjemahan body: `content/projects/id/<slug>.md`) |
| CV per posisi (varian) | `content/cv-variants.yaml` |
| Kesan & pesan | `content/messages.yaml` |
| Foto | `content/media/` |

## 2. Tipe data bersama

### `LocalizedText`
Teks yang tampil ke pengunjung ditulis dalam dua bahasa:

```yaml
title:
  en: Founder & CEO
  id: Pendiri & CEO        # opsional; jika kosong, versi en yang dipakai
```

Untuk nama diri yang sama di kedua bahasa (mis. "Decklify"), cukup tulis string biasa: `organization: Decklify`.

### Tanggal
Format `YYYY-MM` (mis. `2025-09`). Untuk yang masih berjalan, tulis `end: present`.

### Visibilitas
- `show_on_web: false` → tidak tampil di website (default `true`)
- `show_on_cv: false` → tidak masuk PDF CV (default `true`)

## 3. Skema per file

### `profile.yaml`
| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `name` | string | ✔ | |
| `role` | LocalizedText | ✔ | Ditampilkan di badge hero & kartu |
| `headline` | LocalizedText | ✔ | H1 hero; kata dalam `*bintang*` diberi warna aksen |
| `tagline` | LocalizedText | ✔ | Paragraf di bawah H1 |
| `summary` | LocalizedText | ✔ | Ringkasan untuk About dan CV |
| `location` | string | ✔ | |
| `email` | string | ✔ | |
| `photo` | path | ✔ | Relatif ke `content/` |
| `status_badge` | LocalizedText | | Kosongkan agar tidak tampil |
| `socials[]` | `{ platform, url, handle? }` | ✔ | `platform`: `linkedin` · `instagram` · `github` · `medium` · `email` |
| `stats[]` | `{ value, label: LocalizedText }` | ✔ | Tepat 3 item untuk hero |
| `journey` | `{ title, intro }` (LocalizedText) | ✔ | Judul (boleh `*penekanan*`) dan paragraf bagian Journey |
| `projects` | `{ intro }` (LocalizedText) | ✔ | Paragraf pembuka halaman Projects dan bagian proyek pilihan di beranda |
| `contact` | `{ title, intro }` (LocalizedText) | ✔ | Bagian Contact di beranda (judul boleh `*penekanan*`). Kanal kontak diambil dari `socials` |

### `experience.yaml`
List `items[]`:
| Field | Tipe | Wajib | Keterangan |
|---|---|---|---|
| `id` | slug | ✔ | Unik, huruf kecil dan tanda `-` |
| `organization` | string | ✔ | |
| `role` | LocalizedText | ✔ | |
| `category` | enum | ✔ | `work` · `founder` · `research` · `leadership` · `teaching` · `program` |
| `location` | string | ✔ | |
| `start`, `end` | `YYYY-MM` / `present` | ✔ | |
| `highlights[]` | LocalizedText + `focus?` | ✔ | Poin pencapaian; utamakan angka. `focus` opsional untuk varian CV (lihat `cv-variants.yaml`) |
| `tags[]` | string | | Teknologi/keahlian |
| `show_on_web`, `show_on_cv` | bool | | Default `true` |

### `education.yaml`, `trainings.yaml`
Mirip `experience`: `id`, `institution`, `program`/`degree` (LocalizedText), `location`, `start`, `end`, `gpa?`, `highlights[]`.

### `awards.yaml`
`items[]`: `id`, `title` (LocalizedText), `issuer` (teks biasa atau LocalizedText untuk nama yang berbeda per bahasa, mis. kementerian), `date` (`YYYY` atau `YYYY-MM`), `rank?`, `show_on_cv?`.

### `certifications.yaml`
`items[]`: `id`, `name`, `issuer`, `issued` (`YYYY-MM`), `expires?` (`YYYY-MM`), `credential_id?`, `url?`.
**Sertifikat yang `expires`-nya sudah lewat otomatis disembunyikan** dari web dan CV. Untuk menampilkannya lagi setelah diperpanjang, cukup perbarui `expires`.

### `skills.yaml`
`groups[]`: `{ id, name: LocalizedText, items: (string | LocalizedText)[], show_on_web?, show_on_cv? }`. `show_on_web` juga mengatur Portfolio PDF. Nama teknologi cukup ditulis biasa (`PyTorch`); kata sehari-hari ditulis dwibahasa (`{ en: Public speaking, id: Berbicara di depan umum }`). Urutan grup di file = urutan tampil.

Grup saat ini (urutan tampil): `ai-ml`, `llm-genai`, `data`, `cloud-mlops`, `web-product`, `product-management`, `leadership`, `languages`. **Hanya skill yang sanggup Anda jelaskan saat wawancara** (D11). Grup dengan `show_on_cv: false` tidak tampil di **CV umum** (agar tetap 2 halaman), tetapi tetap di website dan bisa dipilih varian CV; saat ini `web-product` dan `leadership`. Tulis ringkas dan hindari pengulangan (mis. `SQL (PostgreSQL)`, bukan dua item). Id grup dipakai `cv-variants.yaml` (`skills`); mengganti id berarti memperbarui varian juga (dicek tes). Teks yang mengandung koma di dalam `{ ... }` wajib diberi tanda kutip; tes menolak baris yang terpotong karena koma.

### `journey.yaml`
`milestones[]` (**urutan file = urutan di jalur**, paling lama di atas): `{ id, year, title: LocalizedText, subtitle: LocalizedText, ref? }`. Jangan menulis field `position`; field itu ditambahkan otomatis oleh parser.
`ref` mengarah ke `id` di experience/awards/education agar dialog detail bisa menampilkan cerita lengkap. Disarankan 4–6 titik.

### `cv-variants.yaml` (Varian CV, Fase 10, D10)
Satu CV per jenis posisi (mis. Data Engineer), dibuat otomatis dari isi yang sama. Di CMS: menu **Varian CV**. Varian **hanya memilih dan mengurutkan**; tidak ada pengalaman yang ditulis ulang. CV umum di website tidak berubah.

`variants[]`: `{ id, name, role, summary, focus[], sections[], skills? }`
- `name`: nama varian (dipakai di nama file PDF). `role` dan `summary`: baris peran dan ringkasan khusus varian ini; ringkasan **hanya berisi fakta yang sudah ada** di konten.
- `focus`: `ai` · `data` · `product` (produk) · `project` (manajemen proyek/delivery) · `leadership`. Poin pencapaian tampil jika **tanpa label fokus**, atau labelnya cocok.
- `sections`: urutan bagian setelah ringkasan, dari `education`, `skills`, `experience`, `leadership`, `training`, `awards`, `certifications`. Bagian yang tidak ditulis tidak tampil.
- `skills`: id grup skill (lihat `skills.yaml`) dengan urutan tampil. Jika tidak diisi, varian memakai grup yang tampil di CV umum (`show_on_cv` tidak `false`); daftar kosong ditolak.

**Label fokus pada poin pencapaian:** setiap `highlights[]` di experience, education, dan trainings boleh diberi `focus`, mis. `- { en: "...", id: "...", focus: [ai, data] }`. Aturan di varian:
- pekerjaan (kategori `work`, `founder`, `research`) dan pendidikan **selalu tampil** agar riwayat tidak bolong; jika tidak ada poin yang cocok, tampil poin pertama;
- peran kepemimpinan, mengajar, dan program (kategori `leadership`, `teaching`, `program`) serta pelatihan disembunyikan jika semua poinnya berlabel fokus lain; pelatihan tanpa poin sama sekali tetap tampil;
- penghargaan dan sertifikat selalu tampil.

### `messages.yaml` (Kesan & pesan, T9.4)
Pesan yang ditinggalkan orang lain untuk Anda (atasan, rekan, peserta bootcamp, teman). Tampil di beranda dengan judul **"Kind words" / "Kesan & pesan"**, dalam urutan file; **bagian ini tersembunyi selama daftarnya kosong**. Di CMS: menu **Kesan & pesan**.

`items[]`: `{ id, name, role?: LocalizedText, relationship: LocalizedText, message: LocalizedText, link?, approved }`.
- **Hanya dengan izin penulisnya (D15).** `approved` (wajib, `YYYY-MM`) = bulan orang itu mengizinkan pesannya ditampilkan. Simpan bukti izinnya (chat/email) di luar repo.
- Tulis pesan apa adanya; memendekkan dengan "…" hanya dengan persetujuan penulis. `message.id` boleh menyusul (tampil bahasa Inggris dengan `lang="en"`).
- `role` opsional (teman atau peserta tidak perlu jabatan); jika diisi, `en` wajib. `link` hanya profil publik dengan `https://` (mis. LinkedIn); email, nomor HP, dan WhatsApp ditolak skema.
- Selama daftar kosong, build menulis peringatan `No items found in content/messages.yaml`. Itu normal, bukan error.
- Sumber yang cocok: rekomendasi LinkedIn, pesan dari peserta/mentor. Formulir untuk pengunjung menyusul di T12.1 dan tetap melewati persetujuan Anda.

### `projects/<slug>.md`
Frontmatter:

```yaml
---
title: Decklify
summary:
  en: One-sentence description.
  id: Deskripsi satu kalimat.
role: { en: Founder, id: Pendiri }
year: 2026
tags: [Next.js, Go, PostgreSQL, AI]
metrics:                     # 0–3 angka unggulan
  - { value: "+45", label: { en: NPS, id: NPS } }
links:
  live: https://decklify.id
  repo: https://github.com/harrymardika/xxx   # jika sama dengan repo GitHub, data GitHub digabung
cover: ../media/projects/decklify.jpg        # opsional
featured: true               # tampil di beranda & PDF Portfolio
order: 1                     # urutan di antara yang featured
draft: false                 # true = tidak tampil di mana pun
---
```

Isi (body) dalam Markdown, versi English. `summary`, `role`, dan label metrik sudah dwibahasa lewat frontmatter.

**Versi Indonesia (T9.3, D12):** `content/projects/id/<slug>.md` dengan **nama file yang sama** dengan file Inggris. Isinya hanya body Indonesia plus `title` di frontmatter, **sama persis dengan judul file Inggris** (hanya label di daftar CMS, tidak tampil di halaman; dicek tes); ringkasan, peran, angka, dan tautan tetap diambil dari file Inggris. Di CMS: menu **Studi kasus (Indonesia)**. Saat membuat file baru, **ganti nama file** menjadi nama file Inggrisnya (mis. `aksara-jawa-yolo.md`); nama bawaan CMS dibuat dari judul dan biasanya berbeda.

```markdown
---
title: Decklify
---

## Masalah
...
```

- Judul bagian diterjemahkan (Problem → Masalah, Approach → Pendekatan, Result → Hasil, What I learned → Yang saya pelajari), tetapi **jumlah, level, dan urutannya harus sama** dengan versi Inggris, begitu juga gambarnya (jalur `../../media/projects/...`). Tes `tests/unit/content/translations.test.ts` memeriksanya.
- Istilah teknis/asing tidak diterjemahkan (*pipeline*, *fine-tuning*, *false negative*, *deployment*). Angka gaya Indonesia (`92,5%`, `12.000`, `11 ribu+`).
- Jika file Indonesia belum ada, halaman `/id/` dan Portfolio PDF Indonesia menampilkan body Inggris (diberi `lang="en"`) dengan catatan bahwa studi kasus ditulis dalam bahasa Inggris.
- Mengubah isi versi Inggris? Ubah juga versi Indonesianya di commit yang sama. Mengganti nama atau menghapus file Inggris? Lakukan hal yang sama pada file di `id/`, karena tes menolak terjemahan tanpa pasangan.

Catatan tampilan:
- Jangan menulis judul bagian (`## ...`) yang isinya kosong. Catatan internal (TODO, bahan yang belum ada) ditulis di `PROGRESS.md` atau deskripsi PR, **bukan** sebagai komentar `<!-- -->`: komentar HTML ikut terkirim di halaman publik dan bisa hilang saat file disimpan lewat Pages CMS.
- Filter tag di halaman Projects hanya muncul jika minimal dua tag masing-masing dipakai oleh dua proyek atau lebih.
Struktur body yang disarankan: **Problem → Approach → Result → What I learned**.

## 4. Proyek dari GitHub (Fase 3)

Anda yang memilih repo mana yang tampil, dengan salah satu atau kedua cara:

1. **Daftar di `content/github.yaml`** (paling mudah, cukup edit file). `include` menerima tiga bentuk:
   ```yaml
   include:
     - camera-genai                       # nama repo saja (deskripsi dari GitHub)
     - repo: rocm-test                    # repo + deskripsi Anda sendiri (EN/ID)
       description: { en: ..., id: ... }
     - title: Chatbot RAG Gunadarma       # satu proyek yang dipecah ke beberapa repo:
       repos: [gunadarma-ai, chatbot-rag-gunadarma-backend]   # tampil sebagai SATU kartu,
       description: { en: ..., id: ... }  # tertaut ke repo pertama
       tags: [RAG, LLM]                   # opsional: tag tambahan (repo maupun grup)
   exclude: [old-experiment]              # repo ini tidak pernah tampil
   ```
2. **Topic `portfolio` di GitHub**: buka repo → ⚙️ di bagian *About* → tambahkan topic `portfolio`.

Repo yang tampil = (`include` ∪ repo bertopic `portfolio`) − `exclude`. Hanya repo publik milik `harrymardika`; fork dan repo arsip dilewati kecuali dicantumkan di `include`. Secara bawaan `exclude` berisi repo profil (`harrymardika`) dan repo situs ini (`portfolio`).

Setelah mengubah `github.yaml`, jalankan `bun run fetch:github --force` untuk melihat hasilnya secara lokal (nama yang salah ketik akan diperingatkan). Di production, sinkron berjalan setiap build (T3.3: terjadwal tiap 6 jam).
Cara tampilnya:
- Repo **tanpa** case study tampil sebagai kartu bertanda "GitHub ↗" di halaman Projects (setelah semua case study), tertaut langsung ke GitHub: nama repo sebagai judul, deskripsi repo sebagai ringkasan, bahasa + topics sebagai tag (topic `portfolio` disembunyikan), tahun dari push terakhir, dan jumlah bintang jika ada.
- Repo **dengan** case study: tulis `links.repo` di `content/projects/<slug>.md` dengan URL repo. Case study tetap yang tampil (tanpa duplikat), dan jumlah bintang dari GitHub ikut ditampilkan.
- Beranda hanya menampilkan case study `featured`, bukan repo GitHub.
- `tags` di `include` ditambahkan ke topics GitHub repo itu (huruf besar/kecil tidak dibedakan, tanpa duplikat). Gunakan untuk repo yang belum punya topics, agar repo itu masuk kategori filter di bawah. Lebih baik lagi: isi topics langsung di GitHub (About → ⚙️ → Topics).

### Pencarian dan filter per bidang di halaman Projects

Halaman `/projects/` punya kotak **pencarian** (judul, ringkasan, tag, dan nama bidang) dan tombol **bidang** dengan jumlah proyeknya. Bidang diatur di `content/profile.yaml` → `projects.categories` (Pages CMS: *Profil → Bagian Projects → Kategori filter*):

```yaml
categories:
  - id: computer-vision                  # dipakai di link: /projects/?filter=computer-vision
    label: { en: Computer Vision, id: Computer Vision }
    tags: [Computer Vision, YOLO, OpenCV] # proyek masuk bidang ini jika punya salah satu tag ini
```

- Cocok tanpa membedakan huruf besar/kecil dan tanda baca (`Next.js` = `next-js`). Satu proyek boleh masuk beberapa bidang.
- Bidang dengan kurang dari 2 proyek tidak ditampilkan; urutan tombol = urutan di file.
- **Link yang sudah terfilter** bisa dikirim ke recruiter, mis. `https://harry.mardika.my.id/projects/?filter=computer-vision` atau dengan pencarian `?filter=nlp-genai&q=bert`. Versi Indonesia: `/id/projects/?filter=…`.
- Tanpa JavaScript, semua proyek tetap tampil.

### Draf studi kasus otomatis oleh AI (T8.2, ADR 0013, 0016)

Beri topic **`portfolio`** pada repo GitHub yang belum punya studi kasus (About → ⚙️ → Topics). Dua kali sehari, pukul 09:41 dan 21:41 WIB (atau saat dijalankan manual dari tab *Actions* → *Case study drafts* → *Run workflow*), Gemini (cadangan: Groq) menulis draf dari README repo itu dan membuka **Pull Request** berlabel `ai-draft`:

1. Buka PR-nya → tab **Files changed**, baca file `content/projects/<slug>.md` (ringkasan EN/ID, peran, Problem/Approach/Result) dan terjemahannya `content/projects/id/<slug>.md`. AI hanya membaca README: cek peran Anda, angka, dan hasil.
2. Perbaiki yang kurang tepat langsung di PR (⋯ → **Edit file**).
3. **Merge = tayang**: ±20 menit kemudian studi kasus muncul di situs, menggantikan kartu GitHub repo itu. Belum siap? Biarkan PR terbuka. Tidak perlu? **Tutup** PR-nya.

**Proyek multi-repo** (grup `title` + `repos` di `content/github.yaml`) dibuatkan **satu** draf untuk seluruh proyek: cukup beri topic pada salah satu repo anggotanya. AI membaca README semua anggota (total ±12.000 karakter, dibagi rata), judul dan nama file mengikuti judul grup (mis. `chatbot-rag-universitas-gunadarma.md`), dan studi kasusnya menautkan repo pertama di daftar grup. Repo anggota grup tidak pernah dibuatkan draf sendiri.

README yang lebih lengkap menghasilkan draf yang lebih baik. Repo tanpa README (atau README sangat pendek) dilewati. Angka di bagian *Angka utama* hanya dipertahankan jika tertulis persis di README; angka di kalimat tetap perlu Anda cek.

## 5. Mesin pencari dan pratinjau tautan (T7.1)

Tidak ada file SEO terpisah yang perlu diisi; semuanya diturunkan dari konten:

| Yang tampil di Google / WhatsApp / LinkedIn | Diambil dari |
|---|---|
| Judul dan deskripsi beranda & About | `profile.yaml`: `name`, `role`, `tagline` |
| Judul dan deskripsi studi kasus | `projects/<slug>.md`: `title`, `summary` |
| Gambar pratinjau (1200×630) | dibuat otomatis saat build dari judul + deskripsi halaman + foto `profile.photo` |
| Data terstruktur `Person` | `profile.yaml` (tanpa email) + institusi di `education.yaml` |
| `sitemap.xml` | semua halaman yang dibangun, kecuali halaman cetak dan 404 |

Tips: `summary` proyek idealnya 1–2 kalimat (± 160 karakter); di gambar pratinjau teks dipotong setelah 3 baris.

## 6. Aturan isi

- Teks yang mengandung koma, titik dua, atau tanda kurung di dalam `{ ... }` satu baris **harus diberi tanda kutip**: `{ en: "accuracy (AUC 0.96)", id: "akurasi (AUC 0,96)" }`.
- Field yang tidak dikenal (misalnya salah ketik `show_on_cvv`) akan ditolak.

- **Tidak ada nomor HP** di file mana pun.
- Gunakan angka nyata dan bisa dipertanggungjawabkan; jangan dibulatkan ke atas.
- **Format angka mengikuti bahasanya (D16):** teks `en` memakai titik desimal dan koma ribuan (`92.5%`, `3.99/4.00`, `12,000+`); teks `id` memakai koma desimal dan titik ribuan sesuai PUEBI (`92,5%`, `3,99/4,00`, `12.000+`, `Rp5,85 juta`). Nilai yang ditulis sekali untuk kedua bahasa (`value` di `stats`/`metrics`, `gpa`) **ditulis gaya Inggris**; halaman dan PDF Indonesia mengubahnya otomatis (`92.5%` → `92,5%`). Satuan dan kata masuk ke `label`, bukan `value` (`value: "3"`, label `months …`/`bulan …`), karena `value` tidak diterjemahkan. Nomor versi bukan desimal: tulis di dalam backtick (`` `Python 3.10` ``) atau menempel pada huruf (`YOLOv8.1`), sama di kedua bahasa. Tes `tests/unit/content/number-format.test.ts` menolak desimal yang tertukar.
- Satu `highlight` = satu kalimat, diawali kata kerja aktif ("Built", "Led", "Reduced").
- **Menebalkan frasa penting:** tulis `**frasa**` di `summary` (profile dan varian CV) dan `highlights` (experience, education, trainings), mis. `reducing overhead by **45%**`. Tampil tebal di CV, Portfolio PDF, halaman About, dan dialog Journey di beranda. Di field lain (tagline, judul, dll.) tanda ini ditolak tes karena akan tampil sebagai bintang. Cukup 1–2 frasa per poin (angka hasil, prestasi); kalau semua tebal, tidak ada yang menonjol. Tanda yang tidak berpasangan menggagalkan tes. Jika teks **diawali** `**`, beri tanda kutip: `en: "**Graduated with Distinction** (94.5/100)."`. Ini berbeda dengan `*bintang tunggal*` di `headline`/judul bagian, yang memberi warna aksen.
- Sumber kebenaran data CV: `CV/CV_Harry Mardika.pdf` (lokal, di-gitignore) dengan koreksi yang tercatat di `docs/progress-archive.md` (log 2026-10-05).
