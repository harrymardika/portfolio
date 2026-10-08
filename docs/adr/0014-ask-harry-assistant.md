# 0014 · Chatbot "Tanya Harry": layanan terpisah, pengetahuan dari konten, tanpa penyimpanan

- **Status:** Accepted
- **Tanggal:** 2026-10-08
- **Tugas:** T11.1 (berlaku untuk T11.2–T11.6)

## Konteks
Pemilik ingin pengunjung, terutama recruiter, bisa bertanya dalam bahasa sehari-hari ("Pernah pakai YOLO di produksi?", "Apa peran Harry di Decklify?") dan mendapat jawaban singkat dari isi situs dengan tautan ke halaman terkait. Keputusan pemilik: chatbot mengambang di sudut kanan bawah setiap halaman kecuali halaman cetak (D13); Gemini sebagai penyedia utama, Groq sebagai cadangan, teks pertanyaan tidak disimpan (D14). Batasan proyek tetap berlaku: server rumah dengan RAM 1,8 GB, situs statis yang utuh tanpa JS dan saat server mati, tanpa biaya tetap, tanpa secret di repo, dan tanpa skrip pihak ketiga di browser.

## Keputusan
- **Layanan terpisah `services/assistant`** (Bun, image sendiri, ≤ 128 MB, read-only, tanpa volume) dengan `POST /api/ask` dan `GET /api/ask/health` di balik Caddy. Key AI hanya ada di layanan ini, sehingga gangguan atau penyalahgunaan AI tidak menyentuh statistik (ADR 0009) maupun situs statis. Browser hanya berbicara dengan origin sendiri; CSP tidak berubah.
- **Pengetahuan = isi situs publik saja, dibuat saat build, tanpa vector DB.** Endpoint build `src/pages/assistant-knowledge.json.ts` memakai query yang sama dengan halaman (`src/lib/content/queries.ts`), sehingga draf, item tersembunyi, dan sertifikat kedaluwarsa tidak ikut. Isinya semua yang tampil di web, termasuk email publik dan kartu repo GitHub (keputusan pemilik 2026-10-08), **tanpa nomor HP**. `scripts/generate-knowledge.ts` memeriksa setiap path terhadap hasil build, menulis dua file ke `build-meta/`, lalu menghapus sumbernya dari situs:
  - `knowledge.json` (lengkap, EN + ID, termasuk isi studi kasus; anggaran ≤ 25 ribu token; saat ini ±16 ribu) untuk **Gemini**;
  - `knowledge-compact.json` (EN saja, tanpa `detail`; anggaran ≤ 5 ribu token; saat ini ±4,1 ribu) untuk **Groq**.
  Seluruh pengetahuan masuk ke prompt. Isinya kecil (±40 bagian), jadi pencarian vektor hanya menambah layanan, RAM, dan titik gagal tanpa menambah ketepatan. Build gagal jika ada tautan mati, pola nomor HP, atau ukuran melewati anggaran. Token diperkirakan dari jumlah karakter ÷ 3,5 (sengaja ditaksir lebih tinggi) tanpa dependency tokenizer.
- **Penyedia:** Gemini Flash (tier gratis Google AI Studio) dengan pengetahuan lengkap; jika gagal (HTTP error, timeout, JSON tidak valid), Groq `openai/gpt-oss-120b` dengan pengetahuan ringkas; jika keduanya gagal, pesan cadangan berisi tautan CV dan email. Penyedia direfaktor ke `src/lib/ai/` agar dipakai bersama draf studi kasus (ADR 0013).
- **Tanpa penyimpanan percakapan.** Browser mengirim pertanyaan dan maksimal 6 pesan terakhir setiap kali bertanya; percakapan hanya hidup di `sessionStorage` tab itu. Server tidak menyimpan dan tidak mencatat teks pertanyaan atau jawaban; yang dicatat hanya jumlah pertanyaan (statistik privat) dan kode kegagalan.
- **Batas pemakaian** (menjaga kuota gratis dan RAM server): 1–500 karakter per pertanyaan; 10 per jam dan 30 per hari per pengunjung (hash harian seperti statistik, tanpa IP); 300 per hari untuk seluruh situs; ≤ 3 permintaan bersamaan; timeout 20 detik. Origin dan ukuran body divalidasi; bot ditolak.
- **Pengaman jawaban:** prompt membatasi topik pada isi pengetahuan dan menolak data pribadi; teks pengunjung dan isi pengetahuan diperlakukan sebagai data, bukan instruksi. Jawaban harus berupa JSON tervalidasi Zod: teks biasa tanpa HTML/Markdown, tautan hanya path yang ada di `paths` pengetahuan, dan ditolak jika cocok dengan `PHONE_PATTERN`.
- **Widget di sudut** (T11.4): tombol kecil di halaman `PageLayout`, tersembunyi tanpa JS; panel dan kodenya baru dimuat saat tombol diklik, sehingga skor Lighthouse tidak turun. Halaman tetap lengkap tanpa chatbot.
- **Kill switch:** `ASSISTANT_ENABLED=false` di server mematikan fitur tanpa build ulang; widget lalu menampilkan tautan CV dan email. Fitur baru dinyalakan setelah uji ±30 pertanyaan (T11.5) lulus.

## Alternatif yang dipertimbangkan
- **Menambah endpoint di layanan statistik:** satu container lebih sedikit, tetapi key AI dan beban permintaan AI akan berbagi proses dengan data statistik. Ditolak.
- **RAG dengan vector DB (Qdrant/FAISS) atau embedding:** tidak perlu untuk pengetahuan ±16 ribu token, menambah RAM di server 1,8 GB, dan menambah sumber kesalahan.
- **Memanggil API AI langsung dari browser:** key akan terbuka ke publik dan CSP harus dilonggarkan. Ditolak.
- **Widget pihak ketiga (layanan chatbot siap pakai):** skrip pihak ketiga, data pengunjung keluar ke vendor, dan biaya bulanan.
- **Pengetahuan diambil dari HTML hasil build:** menangkap teks UI dan navigasi yang tidak perlu, dan kehilangan struktur. Query konten lebih bersih dan memakai aturan tampil yang sama.
- **Satu file pengetahuan untuk dua penyedia:** pengetahuan lengkap (±16 ribu token) melebihi batas Groq per menit (lihat Konsekuensi), jadi cadangan akan selalu gagal.

## Konsekuensi
- **Kuota Groq** (dicek 2026-10-08 di console.groq.com/docs/rate-limits; halaman itu tidak tegas membedakan paket Free dan Developer, angka pasti ada di *Settings → Limits* akun): `openai/gpt-oss-120b` 30 permintaan/menit, 1.000/hari, **8.000 token/menit**, 200.000 token/hari. Satu permintaan cadangan berukuran ±5–6 ribu token (pengetahuan ringkas + prompt + riwayat + jawaban), jadi Groq hanya menampung ±1 permintaan per menit dan ±35 per hari. Cukup sebagai cadangan, tidak sebagai penyedia utama.
- **Kuota Gemini** tidak lagi dicantumkan di dokumentasi Google; angka aktif dilihat di AI Studio (per project, reset tengah malam waktu Pasifik). Batas harian 300 pertanyaan dipilih agar tetap jauh di bawahnya; dicek ulang pemilik saat T11.6.
- **Privasi:** di tier gratis, Google boleh memakai isi permintaan untuk memperbaiki produknya. Karena itu widget menampilkan pemberitahuan privasi singkat (D14), pengetahuan hanya berisi isi publik, dan key chatbot dibuat terpisah dari key draf AI (T11.6).
- Setiap perubahan konten otomatis memperbarui pengetahuan pada build berikutnya. Versi ringkas sudah mendekati batasnya (±4,1 dari 5 ribu token), dan bisa melewatinya tanpa commit kode: studi kasus baru dari draf AI (PR draf tidak menjalankan CI, ADR 0013), repo baru bertopic `portfolio` (masuk saat sinkron GitHub), atau ringkasan yang diperpanjang. CI memakai data GitHub fixture yang lebih kecil, jadi kegagalan pertama bisa terjadi saat build Docker di deploy; situs lama tetap tayang. Untuk itu: hanya 2 poin pertama tiap pengalaman/pelatihan dan 2 kesan & pesan pertama yang masuk versi ringkas (sisanya `detail`), build memperingatkan di atas 90% anggaran, dan cara memperbaikinya ada di docs/10 §5.8. Perbaikannya memindahkan teks ke `detail` di `src/lib/assistant/`, bukan menaikkan anggaran Groq.
- Model bisa berganti atau dihentikan; ID model ada di satu tempat (`src/lib/ai/`, T11.2).
- Biaya tetap nol selama kuota gratis cukup; batas harian mencegah kuota habis oleh satu pengunjung.
