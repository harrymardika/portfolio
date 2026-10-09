# 0015 · Key chatbot dan draf AI terpisah dengan nama sendiri; chatbot memakai Gemini Flash Lite

- **Status:** Accepted
- **Tanggal:** 2026-10-09
- **Tugas:** T11.5b
- **Menggantikan sebagian:** [ADR 0013](0013-ai-case-study-drafts.md) (nama secret) dan [ADR 0014](0014-ask-harry-assistant.md) (model Gemini chatbot dan perkiraan kuota). Bagian lain kedua ADR itu tetap berlaku, termasuk urutan Gemini lalu Groq.

## Konteks
Eval pertama chatbot (T11.5, 2026-10-09) menghabiskan kuota harian `gemini-3.5-flash` dengan error `GenerateRequestsPerDayPerProjectPerModel-FreeTier`. ADR 0014 mengasumsikan kuota Gemini jauh di atas batas 300 pertanyaan per hari. Limit tier gratis yang dilihat pemilik pada 2026-10-09:

| Model | Permintaan/menit | Token/menit | Per hari |
|---|---|---|---|
| Gemini 3.5 Flash | 5 | 250 ribu | 20 permintaan |
| Gemini 3.5 Flash Lite | 15 | 250 ribu | 500 permintaan |
| Gemma 4 26B/31B | 30 | 16 ribu | 14.400 permintaan |
| Groq `openai/gpt-oss-120b` | 30 | 8 ribu | 1.000 permintaan, 200 ribu token |

Pemilik juga mengganti nama secret pada hari yang sama, di GitHub dan di server sekaligus, agar jelas key mana milik fitur mana. Sebelumnya `GEMINI_API_KEY` di GitHub adalah key draf, sedangkan di dalam container chatbot nama yang sama berisi key chatbot.

## Keputusan
- **Nama key sama di setiap lapisan** (secret GitHub, `/opt/portfolio/.env`, compose, dan kode):
  - chatbot: `ASSISTANT_GEMINI_API_KEY`, `ASSISTANT_GROQ_API_KEY`;
  - draf studi kasus: `DRAFT_GEMINI_API_KEY`, `DRAFT_GROQ_API_KEY`.
  Setiap fitur hanya membaca key-nya sendiri, agar kuota dan kebocoran tetap terpisah.
- **Chatbot: `gemini-3.5-flash-lite` dulu, lalu Groq** (`ASSISTANT_GEMINI_MODEL` di `src/lib/ai/providers.ts`). Flash Lite muat pengetahuan lengkap (±18 ribu token) sekitar 13 kali per menit dan 500 kali per hari.
- **Draf: tetap `gemini-3.5-flash` dulu, lalu Groq.** Draf hanya beberapa permintaan per hari dengan jawaban panjang dua bahasa. Kuota 20 per hari cukup, dan prompt README yang panjang mudah melewati batas 8 ribu token/menit Groq.
- **Eval** (`assistant-eval.yml`) memakai key chatbot. Bawaannya `split`: 15 kasus untuk Gemini dan 15 untuk Groq, setiap kategori ada di keduanya. Mode `both` mengirim semua kasus ke keduanya (memakan sebagian besar token harian Groq).

## Alternatif yang dipertimbangkan
- **Groq dulu, lalu Gemini** (sempat diputuskan pemilik pagi itu, sebelum limit di atas terlihat): Groq hanya ±35 pertanyaan per hari dan ±1 per menit, dengan pengetahuan ringkas. Dibatalkan pemilik setelah membandingkan limit.
- **Gemma 4 sebagai utama:** kuota hariannya terbesar, tetapi 16 ribu token/menit hanya muat pengetahuan ringkas sekitar 2 kali per menit, dan mutu serta kepatuhan JSON-nya belum teruji. Bisa ditambahkan sebagai cadangan ketiga bila perlu.
- **Key draf sebagai cadangan chatbot:** menambah kuota, tetapi kebocoran `.env` server ikut membuka key draf, dan rotasi harus dilakukan di dua tempat. Ditolak pemilik.
- **Billing Google:** bertentangan dengan prinsip "tanpa biaya tetap".

## Konsekuensi
- Kapasitas chatbot ±535 pertanyaan per hari (500 Gemini + ±35 Groq), di atas batas layanan 300 per hari. Batas layanan itu kembali menjadi batas yang berlaku.
- Mutu Flash Lite lebih rendah dari Flash. Eval T11.5 harus membuktikan jawabannya cukup baik sebelum fitur dinyalakan. Bila tidak cukup, model diganti di satu konstanta.
- Angka limit bisa berubah sewaktu-waktu. Angka aktif dilihat di AI Studio (*Usage/Limits*) dan console Groq (*Settings → Limits*). Pesan error penyedia kini menyebut jenis kuota yang habis (mis. `GenerateRequestsPerDayPerProjectPerModel-FreeTier`), sehingga log server bisa membedakan batas per menit dari batas harian.
