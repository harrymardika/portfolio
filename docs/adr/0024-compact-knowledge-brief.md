# 0024 · Pengetahuan ringkas chatbot: baris pendek untuk studi kasus yang tidak unggulan

- **Status:** Accepted · mengubah sebagian [ADR 0022](0022-knowledge-english-case-studies.md) (isi `knowledge-compact.json`)
- **Tanggal:** 2026-11-09
- **Tugas:** T17.0

## Konteks
Sejak 2026-11-04 setiap Deploy gagal di langkah `knowledge`: pemilik me-merge 14 draf studi kasus AI, dan versi ringkas pengetahuan chatbot (`knowledge-compact.json`, untuk Groq) naik menjadi ±5.107 token dengan data asli (±5.205 dengan fixture e2e), di atas anggaran 5.000. Situs live tidak ter-update, sehingga 14 studi kasus itu belum tampil.

Hitungan per bagian versi ringkas: studi kasus ±2.878 token (36 studi kasus, ±80 token per studi kasus untuk judul, peran, dan ringkasan), pengalaman ±899, sisanya kecil. Ringkasan repo GitHub (langkah berikutnya yang disebut ADR 0022) hanya ±22 token, jadi memindahkannya tidak cukup.

## Keputusan
- Bagian pengetahuan boleh punya `brief`: teks EN yang lebih pendek, dipakai **hanya** di versi ringkas sebagai pengganti `text` (`src/lib/assistant/knowledge.ts`, `toCompact` di `budget.ts`).
- Studi kasus yang **tidak** `featured` mendapat `brief` berisi judul, tahun, dan tag, mis. `Chatbot RAG Universitas Gunadarma (2026, Python, FastAPI, …)`. Studi kasus unggulan (`featured: true`) tetap membawa ringkasan lengkap.
- Versi lengkap (`knowledge.json`, Gemini) tidak berubah. Anggaran 5.000 dan 30.000 token tidak dinaikkan.

## Alternatif yang dipertimbangkan
- **Menaikkan anggaran ringkas:** Groq tier gratis ±8.000 token per menit untuk prompt + pertanyaan + jawaban (ADR 0014); ruang yang tersisa terlalu sempit.
- **Memotong ringkasan menjadi N karakter:** kalimat terpotong bisa menyesatkan, dan pertumbuhan per studi kasus tetap besar.
- **Membuang studi kasus yang tidak unggulan dari versi ringkas:** penyedia cadangan tidak tahu proyek itu ada dan tidak bisa menautkannya.

## Konsekuensi
- Ukuran versi ringkas turun ±1,7 ribu token; tiap studi kasus baru menambah ±15–25 token, bukan ±80.
- Bila Gemini gagal dan Groq yang menjawab, pertanyaan rinci tentang studi kasus yang tidak unggulan dijawab dari judul dan tag, dengan tautan ke halamannya. Pemilik bisa menandai studi kasus penting sebagai `featured` agar ringkasannya tetap ada di versi ringkas.
