# 0022 · Pengetahuan chatbot: isi studi kasus hanya EN, anggaran 30 ribu token, versi ringkas lebih ramping

- **Status:** Accepted · mengubah sebagian [ADR 0014](0014-ask-harry-assistant.md) (isi dan anggaran `knowledge.json`)
- **Tanggal:** 2026-10-30
- **Tugas:** T16.2

## Konteks
`knowledge.json` (pengetahuan lengkap untuk Gemini) memuat isi setiap studi kasus dua kali, EN dan ID. Setelah tujuh draf studi kasus AI di-merge dan studi kasus Decklify dilengkapi (T16.2), ukurannya ±25.756 token, di atas anggaran 25.000, sehingga build berhenti; versi ringkas untuk Groq juga naik menjadi ±5.351 dari 5.000 token. Setiap studi kasus baru akan mengulang masalah ini.

## Keputusan (pemilik, 2026-10-30)
- Bagian `detail` studi kasus (metrik, tag, tautan, isi) **hanya versi EN**. Judul, peran, dan ringkasan studi kasus, serta profil, pengalaman, dan bagian lain tetap EN + ID.
- Anggaran `FULL_MAX_TOKENS` naik dari 25.000 menjadi **30.000** (`src/lib/assistant/budget.ts`). Anggaran versi ringkas untuk Groq (5.000) tidak berubah.
- Versi ringkas (`knowledge-compact.json`) juga di atas anggarannya (±5.351 dari 5.000 token), jadi isinya diramping tanpa menaikkan batas (cara yang dianjurkan `docs/10-operations.md` §5.8): metrik studi kasus pindah ke `detail` (hanya versi lengkap), dan pengalaman/pelatihan hanya membawa **1** poin di `text` (`COMPACT_HIGHLIGHTS`, sebelumnya 2); sisanya tetap ada di versi lengkap.

## Alternatif yang dipertimbangkan
- **Hanya menaikkan anggaran:** setiap pertanyaan memakai lebih banyak kuota gratis Gemini per menit, dan isi ganda tetap tumbuh dua kali lebih cepat.
- **Memendekkan studi kasus:** detail yang diminta pemilik hilang, dan studi kasus berikutnya tetap menggagalkan build.

## Konsekuensi
- Chatbot tetap menjawab dalam bahasa pengunjung (aturan di `src/lib/assistant/ask.ts`); detail dan metrik studi kasus untuk jawaban berbahasa Indonesia diterjemahkan model dari versi EN (angka ditulis ulang sesuai bahasa jawaban, aturan di `ask.ts`), sedangkan ringkasan tetap punya versi ID. Eval chatbot punya kasus EN dan ID tentang isi studi kasus.
- Ukuran saat diputuskan: versi lengkap ±19 ribu dari 30 ribu token, versi ringkas ±4,5 ribu dari 5 ribu. Versi ringkas tetap yang paling cepat penuh (tiap studi kasus baru ±60–130 token); bila penuh lagi, langkah berikutnya memindahkan ringkasan repo GitHub ke `detail`. Peringatan build di 90% anggaran tetap berlaku dan saat ini sudah muncul untuk versi ringkas (±91%).
