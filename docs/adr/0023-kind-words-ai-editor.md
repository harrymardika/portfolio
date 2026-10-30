# 0023 · AI editor untuk kesan & pesan: deteksi bahasa, rapikan metadata, saran, dan tanda di PR

- **Status:** Accepted · mengubah langkah terjemahan di [ADR 0017](0017-kind-words-form.md)
- **Tanggal:** 2026-10-30
- **Tugas:** T16.4 (D30, `docs/12-v2.md` §C2)

## Konteks
Langkah AI di workflow *Kind words* (ADR 0017) hanya menerjemahkan dari bahasa **halaman** formulir (`lang`) ke bahasa lainnya. Pesan pertama (Masriq) dikirim dari halaman Inggris tetapi ditulis dalam Bahasa Indonesia, sehingga versi `en` berisi teks Indonesia (diperbaiki tangan di T16.1). Langkah itu juga tidak merapikan salah ketik di `role`/`relationship` dan tidak memberi pemilik ringkasan pemeriksaan sebelum merge.

## Keputusan (pemilik, D30)
- AI bekerja **setelah pesan disetujui, di PR**, memakai key `DRAFT_*` dan workflow yang sama. Tidak ada agent, layanan, atau secret baru.
- Satu panggilan per pesan menghasilkan satu objek JSON: bahasa tulisan (`en`/`id`), versi EN dan ID (`role`, `relationship`, `message`), saran perbaikan isi, dan tanda (`spam`, `profanity`, `personal-data`, `prompt-injection`, `off-topic`). Jawaban divalidasi zod (dan skema JSON ketat untuk Groq) di `checkEdit` (`src/lib/messages/publish.ts`).
- **Isi pesan tidak pernah diubah:** di bahasa tulisannya, kode selalu memakai teks asli pengunjung, apa pun jawaban model. Saran hanya ditulis di tabel PR, dan hanya bila kutipannya benar-benar ada di pesan.
- **`role` dan `relationship` dirapikan langsung** (terlihat sebagai diff di PR), tetapi perubahan ditolak dan teks asli dipakai bila panjangnya berubah jauh atau ada kata berhuruf kapital (nama, termasuk kata pertama dan huruf beraksen) yang hilang; penolakan itu tertulis di tabel.
- **Jawaban yang tidak menerjemahkan ditolak:** bila versi bahasa lainnya sama dengan teks asli (tanpa memedulikan huruf besar dan spasi), penyedia berikutnya dicoba. Inilah penjaga kasus Masriq.
- Pemeriksaan lama tetap: tanpa markup (kecuali sudah ada di teks asli), tanpa detail kontak di teks buatan AI, `role` tidak ditambah atau dihapus, panjang dibatasi.
- **Bila semua penyedia gagal**, pesan tetap masuk PR tanpa diedit (teks asli di bahasa formulir) dengan tanda **"AI editor gagal, periksa manual"**. Sebelumnya, pesan berbahasa Indonesia ditunda ke jam berikutnya.
- Tanda tidak menghentikan apa pun; pemilik yang memutuskan, dan merge PR tetap berarti tayang (D15).

## Laporan dan privasi
- Badan PR (atau komentar, bila PR antrean sudah terbuka) berisi tabel per pesan: id entri, bahasa tulisan dan bahasa formulir, perubahan metadata, saran, dan tanda. Teks pengunjung di tabel ditulis sebagai *inline code*, sehingga tidak bisa tampil sebagai tautan atau gambar.
- Log workflow publik tetap hanya berisi id pesan, nama penyedia, dan kode (bahasa, jumlah perubahan dan saran, nama tanda), **tanpa isi pesan**.

## Alternatif yang dipertimbangkan
- **AI di halaman tinjau, sebelum disetujui:** pesan yang belum disetujui harus tetap di server privat (ADR 0017); memanggil AI dari layanan stats menambah key di server. Ditolak pemilik (D30).
- **Agent terpisah atau layanan baru:** lebih banyak secret dan perawatan untuk volume pesan yang sangat kecil.
- **Menerapkan saran langsung ke isi pesan:** mengubah kata-kata penulis tanpa izinnya; pemilik memilih saran saja.

## Konsekuensi
- Pesan yang ditulis dalam bahasa lain dari halaman formulirnya ditaruh di bahasa yang benar.
- Tes unit (`tests/unit/messages/publish.test.ts`) memakai penyedia tiruan: kasus Masriq, teks berisi instruksi, jawaban yang tidak menerjemahkan, saran yang tidak mengutip pesan atau terlalu panjang, nama yang hilang (juga di awal kalimat), AI gagal (juga untuk formulir berbahasa Indonesia), dan tabel laporan.
