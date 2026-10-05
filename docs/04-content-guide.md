# 04 · Panduan konten

Semua isi website, CV, dan Portfolio PDF berasal dari folder `content/`. **Tidak perlu menyentuh kode untuk mengubah isi.**

## 1. Cara cepat mengubah isi

1. Buka file yang relevan di `content/` (tabel di bawah).
2. Edit, lalu simpan. Pertahankan format YAML: indentasi 2 spasi, tanda `-` untuk item daftar.
3. Jalankan `bun run dev` untuk melihat hasilnya. Jika data salah, terminal menampilkan file dan baris yang bermasalah.
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
`groups[]`: `{ id, name: LocalizedText, items: string[] }`.

### `journey.yaml`
`milestones[]` (urut dari paling lama): `{ id, year, title: LocalizedText, subtitle: LocalizedText, ref? }`.
`ref` mengarah ke `id` di experience/awards/education agar dialog detail bisa menampilkan cerita lengkap. Disarankan 4–6 titik.

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

Isi (body) dalam Markdown, versi English. Versi Indonesia opsional di file `projects/<slug>.id.md` dengan frontmatter yang hanya berisi `title`/`summary` yang diterjemahkan.
Struktur body yang disarankan: **Problem → Approach → Result → What I learned**.

## 4. Proyek dari GitHub

Repo publik milik `harrymardika` yang diberi **topic `portfolio`** akan otomatis tampil (sinkron tiap 6 jam).
- Deskripsi repo → ringkasan; topics → tag; *social preview image* → gambar sampul.
- Jika ada `content/projects/*.md` dengan `links.repo` yang sama, data lokal menang dan data GitHub hanya melengkapi (bintang, bahasa, tanggal update).

## 5. Aturan isi

- **Tidak ada nomor HP** di file mana pun.
- Gunakan angka nyata dan bisa dipertanggungjawabkan; jangan dibulatkan ke atas.
- Satu `highlight` = satu kalimat, diawali kata kerja aktif ("Built", "Led", "Reduced").
- Sumber kebenaran data CV: `CV/CV_Harry Mardika.pdf` (lokal, di-gitignore) dengan koreksi yang tercatat di `PROGRESS.md` (log 2026-10-05).
