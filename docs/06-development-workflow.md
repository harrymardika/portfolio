# 06 · Alur pengembangan

## 1. Prasyarat

| Alat | Versi | Catatan |
|---|---|---|
| Docker + Docker Compose | terbaru | Cara yang disarankan; tidak perlu memasang Bun di laptop |
| Bun | terbaru 1.x | Jika ingin menjalankan tanpa Docker |
| Git | – | |
| Chromium untuk Playwright | – | `bunx playwright install chromium` (sekali saja) |

## 2. Perintah

Kolom **Sejak** menunjukkan tugas yang menambahkan perintah itu. Perintah dengan tugas yang belum selesai belum tersedia.

| Perintah | Fungsi | Sejak |
|---|---|---|
| `bun install` | Pasang dependency | T1.1 ✅ |
| `bun run dev` | Dev server di http://localhost:4321 | T1.1 ✅ |
| `bun run build` | Build (nanti: GitHub sync → Astro → PDF) | T1.1 ✅ |
| `bun run preview` | Menyajikan hasil build | T1.1 ✅ |
| `bun run typecheck` | `astro check` (TypeScript + file .astro) | T1.1 ✅ |
| `bun run verify` | **Wajib sebelum commit:** `check` → `bun test` → `test:e2e`, berhenti saat ada yang gagal | T2.4 ✅ |
| `bun run check` | Typecheck + lint + cek warna hex + format check | T1.2 ✅ |
| `bun run lint:tokens` | Gagal jika ada warna hex di luar `src/styles/tokens.css` | T1.6 ✅ |
| `bun run lint` / `lint:fix` | ESLint (tanpa warning) / perbaiki otomatis | T1.2 ✅ |
| `bun run format` | Merapikan format otomatis (Prettier) | T1.2 ✅ |
| `bun test` | Unit test (`tests/unit`, diatur di `bunfig.toml`) | T1.2 ✅ |
| `bun run test:coverage` | Unit test + laporan cakupan | T1.2 ✅ |
| `bun run test:e2e` | Playwright e2e (build + preview otomatis, desktop & mobile) | T1.2 ✅ |
| `bun run fetch:github` | Hanya sinkronisasi GitHub | T3.1 |
| `bun run pdf` | Hanya generate PDF (butuh hasil build) | T4.3 |
| `docker compose -f docker/compose.dev.yml up` | Dev di Docker dengan hot reload (http://localhost:4321) | T1.8 ✅ |
| `DEV_PORT=4331 docker compose -f docker/compose.dev.yml up` | Sama, di port host lain jika 4321 terpakai | T1.8 ✅ |
| `docker compose -f docker/compose.dev.yml down` | Hentikan container dev | T1.8 ✅ |
| `docker compose -f docker/compose.yml up -d --build` | Simulasi produksi secara lokal | T6.4 |

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
| `bun run dev` langsung kembali ke prompt / port 4321 terpakai | Jika mendeteksi AI agent (mis. Claude Code), Astro 7 otomatis menjalankan dev/preview server di background. Cek `bunx astro dev status`, log `bunx astro dev logs`, hentikan `bunx astro dev stop`. Tambahkan `--ignore-lock` untuk memaksa foreground (dipakai `playwright.config.ts`). Saat dijalankan manusia atau Docker, server berjalan normal di foreground. |
| Browser Playwright belum ada | `bunx playwright install chromium` |
| Port 4322 terpakai saat e2e | Ada preview lama yang masih jalan. Cari dengan `ss -ltnp \| grep 4322`, hentikan PID-nya. E2E selalu membangun ulang dan tidak memakai server yang sudah ada. |
| Docker: `address already in use` port 4321 | Dev server lokal masih jalan (`bunx astro dev status` / `stop`) atau pakai `DEV_PORT=4331`. |
| Docker: dependency tidak sinkron setelah `bun add` | Container menjalankan `bun install --frozen-lockfile` setiap start; restart container. Jika tetap error: `docker compose -f docker/compose.dev.yml down -v` (menghapus volume `node_modules`). |
| PDF kosong/terpotong | Jalankan `bun run preview` dan buka `/print/cv` di browser untuk melihat sumbernya |
