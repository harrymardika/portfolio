# 06 · Alur pengembangan

## 1. Prasyarat

| Alat | Versi | Catatan |
|---|---|---|
| Docker + Docker Compose | terbaru | Cara yang disarankan; tidak perlu memasang Bun di laptop |
| Bun | terbaru 1.x | Jika ingin menjalankan tanpa Docker |
| Git | – | |
| Chromium untuk Playwright | – | `bunx playwright install chromium` (sekali saja) |

## 2. Perintah (berlaku setelah T1.1–T1.2)

| Perintah | Fungsi |
|---|---|
| `bun install` | Pasang dependency |
| `bun run dev` | Dev server di http://localhost:4321 |
| `bun run build` | Build lengkap: GitHub sync → Astro → PDF |
| `bun run preview` | Menyajikan hasil build |
| `bun run check` | Typecheck + lint + format check (wajib sebelum commit) |
| `bun run format` | Merapikan format otomatis |
| `bun test` | Unit test |
| `bun run test:e2e` | Playwright e2e + a11y |
| `bun run fetch:github` | Hanya sinkronisasi GitHub |
| `bun run pdf` | Hanya generate PDF (butuh hasil build) |
| `docker compose -f docker/compose.dev.yml up` | Dev di Docker dengan hot reload |
| `docker compose -f docker/compose.yml up -d --build` | Simulasi produksi secara lokal |

> Saat mengubah perintah, perbarui tabel ini dan `README.md`.

## 3. Bekerja dengan AI agent

### Prinsip
- **Satu sesi utama yang menulis kode.** Banyak agent menulis di file yang sama secara paralel hanya membuat konflik.
- **Validasi otomatis lebih andal daripada agent tambahan.** Andalkan `bun run check`, tes, dan CI.
- **Subagent hanya untuk peran yang jelas:** riset/eksplorasi, dan review (`.claude/agents/reviewer.md`).
- **Tugas kecil, sesi pendek.** Satu tugas `T-ID` per sesi atau branch. Konteks yang terlalu panjang menurunkan kualitas hasil.

### Template perintah untuk memulai sesi
Salin ke AI agent mana pun:

```
Baca AGENTS.md lalu PROGRESS.md. Kerjakan tugas berikutnya yang belum selesai di fase aktif
(atau: kerjakan T2.3). Ikuti alur kerja di AGENTS.md §2 dan Definition of Done.
Sebelum menulis kode, jelaskan rencanamu singkat (file yang dibuat/diubah).
```

### Template saat limit hampir habis
```
Hentikan pekerjaan di titik yang aman. Perbarui PROGRESS.md: tandai tugas [~], tulis di Log sesi
apa yang sudah selesai, apa yang belum, dan langkah berikutnya yang spesifik. Commit sebagai wip.
```

### Template review
```
Jalankan subagent reviewer (atau /code-review) untuk branch ini terhadap tugas <T-ID>.
Perbaiki semua temuan blocker dan should-fix, lalu jalankan ulang verifikasi.
```

### Jika Anda coding sendiri (tanpa AI)
Alurnya sama: ambil tugas di `PROGRESS.md` → branch → kerjakan → `bun run check && bun test` → perbarui `PROGRESS.md` dan `CHANGELOG.md` → commit → PR.

## 4. Menambah fitur baru (di luar daftar tugas)

1. Tambahkan tugas baru di fase yang sesuai di `PROGRESS.md` (ID berikutnya + kriteria penerimaan).
2. Jika mengubah arsitektur, stack, atau keputusan besar, buat ADR baru di `docs/adr/`.
3. Kerjakan sesuai alur biasa.

## 5. Troubleshooting

| Masalah | Solusi |
|---|---|
| Build gagal: "Invalid content in content/…" | Baca pesan Zod; perbaiki field yang disebut (sering: format tanggal atau `en` yang hilang) |
| 3D tidak muncul | Cek console. Pastikan WebGL aktif (hardware acceleration). Fallback HTML harus tetap tampil. |
| GitHub sync gagal | Cek `GITHUB_TOKEN` di `.env`. Build tetap jalan dengan cache terakhir. |
| PDF kosong/terpotong | Jalankan `bun run preview` dan buka `/print/cv` di browser untuk melihat sumbernya |
