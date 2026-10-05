# 04 · Panduan konten

Semua isi website, CV, dan Portfolio PDF berasal dari folder `content/`. **Tidak perlu menyentuh kode untuk mengubah isi.**

## 1. Cara cepat mengubah isi

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
| Halaman Homelab (alur deploy, stack, spesifikasi server) | `content/homelab.yaml` |
| Proyek / case study | `content/projects/<slug>.md` |
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
| `socials[]` | `{ platform, url, handle? }` | ✔ | `platform`: `linkedin` · `instagram` · `github` · `email` |
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
| `highlights[]` | LocalizedText | ✔ | Poin pencapaian; utamakan angka |
| `tags[]` | string | | Teknologi/keahlian |
| `show_on_web`, `show_on_cv` | bool | | Default `true` |

### `education.yaml`, `trainings.yaml`
Mirip `experience`: `id`, `institution`, `program`/`degree` (LocalizedText), `location`, `start`, `end`, `gpa?`, `highlights[]`.

### `awards.yaml`
`items[]`: `id`, `title` (LocalizedText), `issuer`, `date` (`YYYY` atau `YYYY-MM`), `rank?`, `show_on_cv?`.

### `certifications.yaml`
`items[]`: `id`, `name`, `issuer`, `issued` (`YYYY-MM`), `expires?` (`YYYY-MM`), `credential_id?`, `url?`.
**Sertifikat yang `expires`-nya sudah lewat otomatis disembunyikan** dari web dan CV. Untuk menampilkannya lagi setelah diperpanjang, cukup perbarui `expires`.

### `skills.yaml`
`groups[]`: `{ id, name: LocalizedText, items: string[] }`. Urutan grup di file = urutan tampil.

### `journey.yaml`
`milestones[]` (**urutan file = urutan di jalur**, paling lama di atas): `{ id, year, title: LocalizedText, subtitle: LocalizedText, ref? }`. Jangan menulis field `position`; field itu ditambahkan otomatis oleh parser.
`ref` mengarah ke `id` di experience/awards/education agar dialog detail bisa menampilkan cerita lengkap. Disarankan 4–6 titik.

### `homelab.yaml`
`intro` (LocalizedText), `pipeline[]` (`{ title, body }`, LocalizedText), `stack[]` (string), `hardware[]` (`{ label: LocalizedText, value }`; bagian spesifikasi disembunyikan selama daftar ini kosong).

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

Isi (body) dalam Markdown, versi English. Di halaman `/id/` body ini tetap tampil (diberi `lang="en"`) dengan catatan bahwa studi kasus ditulis dalam bahasa Inggris; `summary`, `role`, dan label metrik sudah dwibahasa lewat frontmatter. *(Terjemahan body `projects/<slug>.id.md` belum didukung; tambahkan sebagai tugas baru bila dibutuhkan.)*

Catatan tampilan:
- Jangan menulis judul bagian (`## ...`) yang isinya kosong; tulis TODO di dalam komentar `<!-- -->`.
- Filter tag di halaman Projects hanya muncul jika minimal dua tag masing-masing dipakai oleh dua proyek atau lebih.
Struktur body yang disarankan: **Problem → Approach → Result → What I learned**.

## 4. Proyek dari GitHub (Fase 3)

Anda yang memilih repo mana yang tampil, dengan salah satu atau kedua cara:

1. **Daftar di `content/github.yaml`** (paling mudah, cukup edit file):
   ```yaml
   include: [decklify-web, crowd-violence-detection]   # repo ini selalu tampil
   exclude: [old-experiment]                           # repo ini tidak pernah tampil
   ```
2. **Topic `portfolio` di GitHub**: buka repo → ⚙️ di bagian *About* → tambahkan topic `portfolio`.

Repo yang tampil = (`include` ∪ repo bertopic `portfolio`) − `exclude`. Hanya repo publik milik `harrymardika`. Sinkron tiap 6 jam dan setiap push.
- Deskripsi repo → ringkasan; topics → tag; *social preview image* → gambar sampul.
- Jika ada `content/projects/*.md` dengan `links.repo` yang sama, data lokal menang dan data GitHub hanya melengkapi (bintang, bahasa, tanggal update).

## 5. Aturan isi

- Teks yang mengandung koma, titik dua, atau tanda kurung di dalam `{ ... }` satu baris **harus diberi tanda kutip**: `{ en: "accuracy (AUC 0.96)", id: "akurasi (AUC 0,96)" }`.
- Field yang tidak dikenal (misalnya salah ketik `show_on_cvv`) akan ditolak.

- **Tidak ada nomor HP** di file mana pun.
- Gunakan angka nyata dan bisa dipertanggungjawabkan; jangan dibulatkan ke atas.
- Satu `highlight` = satu kalimat, diawali kata kerja aktif ("Built", "Led", "Reduced").
- Sumber kebenaran data CV: `CV/CV_Harry Mardika.pdf` (lokal, di-gitignore) dengan koreksi yang tercatat di `PROGRESS.md` (log 2026-10-05).
