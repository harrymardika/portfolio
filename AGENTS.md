# AGENTS.md: Aturan kerja proyek

Berlaku untuk **semua** AI agent (Claude Code, Codex, Cursor, Copilot, Gemini, dll.) dan developer manusia.
Tujuannya agar siapa pun bisa melanjutkan proyek ini kapan saja tanpa kehilangan konteks.

## 1. Urutan membaca (sebelum menulis kode)

Baca secukupnya sesuai tugas, jangan seluruh `docs/` di setiap sesi: konteks yang terlalu panjang memboroskan token dan menurunkan kualitas hasil.

1. **Selalu:** `PROGRESS.md`: status terkini, fase aktif, keputusan pemilik, log sesi terbaru. Riwayat lama ada di `docs/progress-archive.md`; baca hanya bila butuh riwayat keputusan atau koreksi data.
2. **Tugas kode** (fitur, refactor, tes): `docs/02-architecture.md` (struktur folder, alur data, batas modul) dan `docs/05-coding-standards.md` (aturan kode, Definition of Done). Tambah `docs/01-srs.md` bila tugasnya menambah atau mengubah kebutuhan.
3. Dokumen spesifik tugas (lihat tabel di bawah).
4. `docs/adr/`: cek ADR terkait sebelum mengubah keputusan teknis. Keputusan di sana **tidak boleh diubah diam-diam**.

| Jika tugasnya tentang... | Baca juga |
|---|---|
| Tampilan, komponen, 3D | `docs/03-design-system.md` (warna "Giok → Nila", ADR 0018; pratinjau tertaut di bagian atasnya) |
| Isi / data / skema | `docs/04-content-guide.md` |
| Docker, CI/CD, server | `docs/07-deployment.md` |
| Analytics | `docs/08-analytics.md` |
| PDF CV / Portfolio | `docs/09-pdf-generation.md` |
| Operasional server, akun & secret, insiden, pemulihan | `docs/10-operations.md` |
| Fase 9–14 (branding, CV per posisi, chatbot, kesan & pesan, tampilan baru dan "satu ruang" 3D) | `docs/11-roadmap.md` (Fase 13–14: §H dan daftar fitur wajib §I) |

## 2. Alur kerja satu tugas

1. **Pilih** tugas teratas yang belum selesai (`[ ]`) di fase aktif `PROGRESS.md`. Jangan loncat fase kecuali tugasnya ditandai *independen*.
2. **Tandai** sebagai sedang dikerjakan: ubah `[ ]` menjadi `[~]` dan tulis nama agent/orang.
3. **Branch:** `feat/T2.3-journey-section` (format `<tipe>/<ID>-<slug>`).
4. **Rencanakan** dulu: file yang akan dibuat/diubah. Untuk tugas besar, tulis rencana singkat di log sesi.
5. **Implementasi** kecil dan bertahap. Satu tugas = satu tujuan.
6. **Verifikasi** (wajib, lihat Definition of Done di `docs/05-coding-standards.md`):
   `bun run verify` (= `check` → `bun test` → `test:e2e`, berhenti di langkah pertama yang gagal).
   Commit **hanya** jika perintah itu sukses. Saat merangkai perintah di shell, gunakan `bun run verify && git commit ...`, jangan `;`.
   Hati-hati dengan heredoc (`git commit -F - <<'EOF'`): baris setelah penutup `EOF` adalah perintah **baru** di luar rantai `&&`. Lebih aman memakai skrip dengan `set -e`.
7. **Perbarui dokumentasi** yang terdampak (arsitektur, content guide, dll.).
8. **Tutup:** ubah `[~]` menjadi `[x]`, tambah entri di **Log sesi** `PROGRESS.md` dan `CHANGELOG.md` (bagian *Unreleased*). Jika log sesi sudah lebih dari ±5 entri, pindahkan yang lama ke `docs/progress-archive.md`.
9. **Commit** dengan Conventional Commits: `feat(journey): add 3D career path section (T2.3)`.

> Jika kehabisan waktu/limit di tengah tugas: biarkan `[~]`, tulis di Log sesi **apa yang sudah, apa yang belum, dan langkah berikutnya**, lalu commit sebagai `wip(...)`. Agent berikutnya melanjutkan dari catatan itu.

## 2a. Penutupan fase (wajib, permintaan pemilik 2026-10-08)

Setiap fase diakhiri satu tugas **penutupan** (`T<fase>.Z`, tugas terakhir di fase itu) setelah semua tugas lain `[x]`. Tujuannya: proyek tetap rapi dan terdokumentasi, sehingga siapa pun bisa melanjutkan.

1. **Rapikan kode:** hapus kode, file, komponen, kunci teks UI, dan dependency yang tidak terpakai; hapus branch lokal/remote yang sudah di-merge; selesaikan atau catat `TODO` yang tersisa; tes yang di-skip diperiksa alasannya.
2. **Periksa dokumentasi terhadap kode:** `README.md` (status, fitur), `docs/02-architecture.md` (struktur folder, alur data), `docs/04-content-guide.md` (file dan field baru), `docs/07`/`docs/10` bila ada layanan atau secret baru, ADR baru bila ada keputusan teknis, `docs/11-roadmap.md` bila rencana berubah.
3. **`PROGRESS.md`:** tandai fase ✅ di tabel Ringkasan, tulis **ringkasan fase** (apa yang dibangun, keputusan pemilik, sisa pekerjaan untuk pemilik) di log sesi, dan pindahkan log lama ke `docs/progress-archive.md`.
4. **`CHANGELOG.md`:** pindahkan entri fase dari *Unreleased* ke bagian rilis bertanggal untuk fase itu.
5. **Verifikasi akhir:** `bun run verify`, lalu cek situs live setelah deploy (halaman utama EN/ID, PDF, statistik).
6. **Laporan ke pemilik:** ringkasan singkat dalam Bahasa Indonesia: apa yang selesai, apa yang menunggu keputusannya, dan fase berikutnya.

## 3. Aturan keras (jangan dilanggar)

- **Isi website tidak boleh di-hardcode di komponen.** Semua teks profil, pengalaman, proyek, dll. berasal dari `content/`. Teks UI (label tombol, judul bagian) berasal dari `src/lib/i18n/`.
- **Setiap teks yang tampil harus punya versi `en`**. Versi `id` boleh menyusul (otomatis fallback ke `en`).
- **Nomor HP dan data pribadi sensitif tidak boleh** masuk ke repo, web, atau PDF publik.
- **Jangan membaca dokumen pribadi pemilik** di luar repo (KTP, KK, NPWP, rekening, kode recovery, tanda tangan, ijazah). Bahan CV mentah ada di `CV/` (di-gitignore) dan sudah diekstrak ke `content/`.
- **Jangan mengubah keputusan di `docs/adr/`** tanpa membuat ADR baru yang menggantikannya (status `Superseded`).
- **Jangan menambah dependency** tanpa alasan di deskripsi commit/PR. Utamakan yang sudah ada.
- **Jangan commit secret.** Token hanya lewat environment variable (`.env`, tidak di-commit; contoh di `.env.example`).
- **3D harus progressive enhancement:** halaman tetap lengkap dan terbaca tanpa WebGL/JS.
- **Jangan menghapus atau memalsukan tes** agar lolos. Perbaiki penyebabnya.

## 4. Gaya komunikasi

- Dokumentasi untuk pemilik ditulis dalam **Bahasa Indonesia**. Kode, nama file, komentar kode, dan commit message dalam **English**.
- Pemilik: Harry Mardika. Kuat di ML/Python, sedang membangun keahlian web/DevOps lewat proyek ini. Jelaskan keputusan teknis web dengan singkat dan jelas.

## 5. Definition of Done (ringkas)

Tugas dianggap selesai jika: kriteria penerimaan di `PROGRESS.md` terpenuhi · `bun run check` dan `bun test` lulus · tidak ada teks hardcode · aksesibel (keyboard, kontras, alt) · dokumentasi dan `PROGRESS.md` diperbarui.
Detail lengkap: `docs/05-coding-standards.md` §9.
