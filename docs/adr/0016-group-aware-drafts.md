# 0016 · Draf studi kasus AI per proyek, bukan per repo

- **Status:** Accepted
- **Tanggal:** 2026-10-09
- **Tugas:** T11.6b
- **Menggantikan sebagian:** [ADR 0013](0013-ai-case-study-drafts.md) (pemilihan kandidat dan "satu PR per repo"). Bagian lain ADR 0013 tetap berlaku.

## Konteks
Beberapa proyek pemilik tersebar di beberapa repo (mis. Netflix: ETL, ingestion, model; Chatbot RAG Gunadarma: backend, frontend, klien). `content/github.yaml` sudah mengelompokkannya (`title` + `repos`), dan situs menampilkannya sebagai satu kartu. Studi kasus yang menautkan repo anggota mana pun mengklaim seluruh grup. Tetapi draf AI (ADR 0013) memilih kandidat per repo, sehingga:
- draf hanya membaca README satu repo (PR #3 Netflix tidak tahu isi `netflix-modelling`), dan judul serta nama filenya mengikuti nama repo;
- bila dua anggota grup diberi topic `portfolio`, muncul dua PR untuk proyek yang sama.

## Keputusan
- **Kandidat = proyek.** Grup di `content/github.yaml` menjadi satu kandidat bila salah satu anggotanya bertopic `portfolio`. Anggota grup tidak pernah menjadi kandidat sendiri. Repo tunggal tetap seperti ADR 0013. Anggota grup diambil dari pemilihan yang sama dengan situs (`selectRepos`): repo yang tercantum dua kali ikut daftar pertamanya, dan anggota *archived*/*fork* tetap ikut. Dengan begitu draf dan kartu grup selalu sepakat soal anggota dan repo yang ditautkan.
- Grup dianggap **sudah tercakup** bila studi kasus menautkan repo anggota mana pun (`links.repo`, tanpa peduli huruf besar, `/` di akhir, atau `.git`), atau bila sudah ada file dengan nama slug grup atau slug salah satu anggotanya. Grup **menunggu** selama ada branch draf untuk slug grup atau untuk anggota mana pun (termasuk branch per-repo yang dibuat sebelum ADR ini).
- Bila README salah satu anggota gagal diambil (bukan karena memang tidak ada), proyek itu dilewati di run tersebut dan dicoba lagi di run berikutnya. Kalau tidak, branch draf yang terbuka akan mengunci draf yang ditulis tanpa README itu.
- Draf grup membaca **README semua anggota**. Batas total tetap 12.000 karakter, dibagi rata, dan jatah README pendek dipakai README lain. Angka di *Angka utama* diperiksa terhadap gabungan README yang dibaca model.
- **Judul** dan nama file (`content/projects/<slug>.md`) mengikuti judul grup (bila judulnya tanpa huruf/angka Latin, slug memakai nama repo pertama). `links.repo` = repo pertama di daftar grup (sama dengan tautan kartu grup). Tahun = push terakhir di antara anggota. PR menyebut semua repo anggota.

## Alternatif yang dipertimbangkan
- **Tetap per repo, dengan aturan "hanya satu anggota grup yang diberi topic":** mudah dilanggar tanpa sadar, dan draf tetap hanya membaca satu README.
- **Tanpa batas total README** (setiap anggota 12.000 karakter): prompt bisa melewati batas 8 ribu token/menit Groq, penyedia cadangan draf.

## Konsekuensi
- Grup dengan banyak anggota memberi jatah README lebih kecil per repo. README utama sebaiknya ditaruh di repo pertama dan berisi gambaran seluruh proyek.
- PR #3 (Netflix, dibuat per repo sebelum ADR ini) menahan draf grup Netflix sampai PR itu ditutup dan branch-nya dihapus.
