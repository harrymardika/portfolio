# 0013 · Draf studi kasus oleh AI sebagai Pull Request

- **Status:** Accepted
- **Tanggal:** 2026-10-07
- **Tugas:** T8.2

## Konteks
Repo GitHub dengan topic `portfolio` otomatis tampil sebagai kartu di halaman Projects (T3.1), tetapi studi kasus lengkap (`content/projects/<slug>.md`) masih ditulis tangan. Pemilik ingin draf awalnya dibuat otomatis, tanpa biaya tetap, dan tanpa ada yang tayang sebelum ia review.

## Keputusan
- **Workflow `case-study-drafts.yml`** (harian dan manual) memilih maksimal 2 repo per run: publik, ber-topic `portfolio` (`content/github.yaml`), tidak di `exclude`, belum punya studi kasus (`links.repo` atau slug yang sama), dan belum punya branch `drafts/case-study-<slug>`.
- **Model:** Gemini `gemini-3.5-flash` lewat `generateContent` (tier gratis Google AI Studio), lalu **Groq** `openai/gpt-oss-120b` (JSON schema strict) jika Gemini gagal (HTTP error, timeout, JSON tidak valid, bentuk salah, atau konten tidak aman). Dipilih pemilik setelah dicek 2026-10-07: GitHub Models sudah dihentikan 30 Juli 2026.
- **README dianggap input tak tepercaya.** Prompt memerintahkan model mengabaikan instruksi di README. Setiap jawaban dinormalisasi (baris baru dan penanda blok Markdown dihapus, daftar dipangkas), divalidasi Zod, lalu **ditolak** jika memuat sintaks yang bisa menjadi markup atau tautan: `[` `]` `<` `>`, entitas HTML, `//`, `www.`, skema URL, atau alamat e-mail (hanya tautan polos `https://github.com/…` yang boleh). Angka metrik dibuang jika tidak muncul utuh di bagian README yang dibaca model (angka di label dan teks hanya dijaga oleh prompt dan review). Frontmatter melewati `projectSchema` yang sama dengan build.
- **Hasil selalu Pull Request**, satu per repo, dengan `draft: false`: **merge = tayang** (keputusan pemilik 2026-10-07, menggantikan `draft: true` + langkah terbit terpisah di Pages CMS yang dinilai merepotkan). PR yang belum di-merge adalah draf; berlabel `ai-draft`, berisi asal-usul (provider, model, tanggal) dan checklist review; asal-usul tidak ditulis di file karena komentar HTML ikut tampil di halaman publik. Pemeriksaan konten (`bun test tests/unit/content`) dijalankan sebelum push; jika PR gagal dibuat, branch-nya dihapus lagi. Satu repo yang gagal tidak menghentikan repo lain. Tidak ada auto-merge.
- **Secret:** `GEMINI_API_KEY`, `GROQ_API_KEY` sebagai repository secret, hanya di job ini; key tidak pernah dicetak dan tidak diteruskan ke subproses (tes, git, gh hanya mendapat `PATH`/`HOME`, gh juga `GH_TOKEN`). Action di workflow ini di-pin ke commit karena job-nya bisa push.

## Alternatif yang dipertimbangkan
- **GitHub Models** (tanpa key, lewat `GITHUB_TOKEN`): dihentikan 30 Juli 2026.
- **Layanan gratis perantara/komunitas** (daftar awesome-free-models): sering berubah atau tutup, dan ikut memegang isi permintaan.
- **Langsung commit ke `main`:** ditolak; teks buatan AI harus direview manusia.
- **Draf untuk semua repo di `include`:** akan membuat belasan PR sekaligus; pemilik memilih per repo lewat topic.

## Konsekuensi
- Tier gratis Gemini: menurut Google, konten dipakai untuk memperbaiki produk. Aman di sini karena yang dikirim hanya README publik; key ini tidak boleh dipakai untuk data pribadi.
- PR yang dibuat dengan `GITHUB_TOKEN` tidak memicu workflow CI. Pemeriksaan konten sudah dijalankan di job ini, dan `deploy.yml` menjalankan verify lengkap saat PR di-merge ke `main`.
- Pemilik perlu sekali mengaktifkan *Allow GitHub Actions to create and approve pull requests*.
- Model dan ID-nya bisa berubah; ganti konstanta `GEMINI_MODEL` / `GROQ_MODEL` di `src/lib/drafts/providers.ts`.
- Menutup PR tanpa merge tidak menghapus branch-nya, sehingga repo itu tidak dibuatkan draf lagi sampai branch dihapus.
- Sejak T9.3 (2026-10-08) PR yang sama juga berisi body bahasa Indonesia `content/projects/id/<slug>.md`. Keputusan di atas tidak berubah.
