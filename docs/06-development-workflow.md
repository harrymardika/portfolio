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
| `bun run dev` | Sinkron GitHub (cache < 1 jam) lalu dev server di http://localhost:4321 | T1.1 ✅ |
| `bun run build` | Build lengkap: GitHub sync → Astro → PDF CV & Portfolio (±5 detik) | T1.1 ✅ |
| `bun run preview` | Menyajikan hasil build | T1.1 ✅ |
| `bun run typecheck` | `astro check` (TypeScript + file .astro) | T1.1 ✅ |
| `bun run verify` | **Wajib sebelum commit:** `check` → `bun test` → `test:e2e`, berhenti saat ada yang gagal | T2.4 ✅ |
| `bun run check` | Typecheck + lint + cek warna hex + format check | T1.2 ✅ |
| `bun run lint:tokens` | Gagal jika ada warna hex di luar `src/styles/tokens.css` | T1.6 ✅ |
| `bun run lint` / `lint:fix` | ESLint (tanpa warning) / perbaiki otomatis | T1.2 ✅ |
| `bun run format` | Merapikan format otomatis (Prettier) | T1.2 ✅ |
| `bun test` | Unit test (`tests/unit`, diatur di `bunfig.toml`) | T1.2 ✅ |
| `bun run test:coverage` | Unit test + laporan cakupan | T1.2 ✅ |
| `bun run test:e2e` | Playwright e2e (build terisolasi ke `dist-e2e/` dengan data GitHub fixture, desktop & mobile) | T1.2 ✅ |
| `bun run fetch:github` | Sinkronisasi repo GitHub ke `src/data/generated/github.json` (pakai cache < 1 jam) | T3.1 ✅ |
| `bun run fetch:github --force` | Sinkronisasi tanpa memakai cache | T3.1 ✅ |
| `bun run stats:dev` | Layanan statistik lokal di :8787 (lihat `docs/08-analytics.md` §2 untuk mencobanya) | T5.1 ✅ |
| `bun run stats:report` | Laporan privat tautan `?ref=` (butuh `STATS_ADMIN_TOKEN`, opsional `STATS_URL`) | T5.5 ✅ |
| `bun run pdf` | Generate 4 PDF dari build yang sudah ada (`BUILD_OUT_DIR`, default `dist`) | T4.3 ✅ |
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

### Siklus satu sesi

Satu sesi = satu tugas. Mulai dengan prompt **Lanjutkan** (atau **Tugas tertentu**), akhiri dengan prompt **Tutup sesi**. Sesi baru tidak ingat percakapan sebelumnya; ia hanya tahu apa yang tertulis di `PROGRESS.md`, jadi prompt penutup itulah yang membuat sesi berikutnya bisa melanjutkan.

| Situasi | Pakai template |
|---|---|
| Membuka sesi baru, ingin melanjutkan progres | 1. Lanjutkan |
| Sudah tahu tugas yang mau dikerjakan | 2. Tugas tertentu |
| Sesi sebelumnya terputus di tengah tugas | 3. Lanjutkan pekerjaan yang terputus |
| Ide atau perbaikan yang belum ada di `PROGRESS.md` | 4. Permintaan baru |
| Selesai bekerja, atau limit hampir habis | 5. Tutup sesi |
| Sebelum merge | 6. Review |

Template di bawah bisa disalin ke AI agent mana pun. Ganti bagian `<...>`.

#### 1. Lanjutkan
```
Lanjutkan proyek ini. Baca PROGRESS.md (status, fase aktif, keputusan pemilik, log sesi terbaru), lalu:
1. Ringkas dalam 3–5 poin: posisi proyek sekarang, tugas berikutnya, dan apa yang menunggu keputusan saya.
2. Usulkan satu tugas untuk dikerjakan, dengan rencana singkat: file yang diubah dan cara verifikasinya.
3. Tunggu persetujuan saya sebelum menulis kode. Kalau ada yang ambigu, tanya dengan pilihan.
```
Jika semua tugas berikutnya menunggu keputusan pemilik, agent akan menjawab dengan daftar keputusan itu. Jawab keputusannya, lalu minta agent melanjutkan.

#### 2. Tugas tertentu
```
Kerjakan <T-ID> (<nama tugas>). <Keputusan atau bahan dari saya, jika ada.>
Batasan: <yang tidak boleh diubah, gaya, bahasa>.
Selesai jika: kriteria di PROGRESS.md terpenuhi, bun run verify lulus, dan saya lihat screenshot desktop + HP.
Buat rencana dulu, tunggu persetujuan saya.
```

#### 3. Lanjutkan pekerjaan yang terputus
```
Sesi sebelumnya berhenti di tengah tugas. Cek git status, branch aktif, tugas bertanda [~] di PROGRESS.md,
dan log sesi terakhir. Jelaskan apa yang sudah dan belum selesai, lalu usulkan langkah berikutnya.
```

#### 4. Permintaan baru
```
Saya ingin <apa yang diinginkan>, karena <alasannya>. Ini belum ada di PROGRESS.md.
Tambahkan sebagai tugas baru di fase yang sesuai (ID + kriteria penerimaan), tunjukkan ke saya dulu, baru kerjakan.
```

#### 5. Tutup sesi
```
Kita berhenti di sini. Perbarui PROGRESS.md (status + log sesi: sudah, belum, langkah berikutnya) dan CHANGELOG.md,
jalankan bun run verify, lalu commit. Jangan push.
```
Jika tugas belum selesai, agent membiarkan tanda `[~]` dan meng-commit sebagai `wip(...)` (`AGENTS.md` §2).

#### 6. Review
```
Jalankan subagent reviewer (atau /code-review) untuk branch ini terhadap tugas <T-ID>.
Perbaiki semua temuan blocker dan should-fix, lalu jalankan ulang verifikasi.
```

### Menulis permintaan sendiri

Jika tidak ada template yang cocok, sertakan lima hal ini agar agent tidak perlu menebak (dan Anda tidak perlu banyak mengoreksi):

1. **Tujuan:** apa yang ingin dicapai, dan **kenapa**.
2. **Konteks:** halaman, file, atau `T-ID` terkait; contoh yang mirip.
3. **Batasan:** yang tidak boleh diubah.
4. **Selesai jika:** hasil yang bisa dicek (tes lulus, screenshot, PDF tetap 2 halaman).
5. **"Kalau ada yang ambigu, tanya dulu."**

Contoh: *"tambahin Medium di sosmed"* kurang jelas. Lebih baik: *"Tambahkan link Medium saya (<url>) ke daftar sosial media, datanya dari `content/`. Tampil di footer dan CV, setelah GitHub. Selesai jika verify lulus dan saya lihat screenshot desktop + HP. Kalau ada pilihan desain, tanya dulu."*

Follow-up untuk menyempurnakan hasil ("warnanya agak gelapkan") itu wajar. Jika Anda mengoreksi hal yang **sama** dua kali, minta agent mencatatnya di `CLAUDE.md` atau memory agar tidak terulang.

### Kebiasaan di Claude Code

| Kapan | Lakukan |
|---|---|
| Ganti tugas | `/clear` (sesi bersih; konteks lama tidak ikut terbawa) |
| Tugas besar, lebih dari 3 file | Shift+Tab sampai *plan mode*; koreksi rencananya sebelum kode ditulis |
| Agent salah arah | **Esc** untuk berhenti; **Esc Esc** untuk kembali ke titik sebelumnya |
| Sesi terasa panjang | `/context` untuk melihat pemakaian; `/compact` jika tugas belum selesai |
| Hanya ingin melanjutkan **obrolan** yang terputus | `claude --continue` atau `/resume`. Untuk tugas baru, lebih baik sesi bersih dengan template 1 |
| Tugas ringan (typo, ganti teks) | Turunkan model/effort lewat `/model` |

Pengaturan izin proyek ada di `.claude/settings.json`: perintah verifikasi dan git yang hanya membaca berjalan tanpa bertanya; folder `CV/` dan file `.env` tidak bisa dibaca lewat tool baca/tulis Claude Code. Ubah file itu jika ada perintah yang perlu ditambah.

### Jika Anda coding sendiri (tanpa AI)
Alurnya sama: ambil tugas di `PROGRESS.md` → branch → kerjakan → `bun run check && bun test` → perbarui `PROGRESS.md` dan `CHANGELOG.md` → commit → PR.

## 4. Menambah fitur baru (di luar daftar tugas)

1. Tambahkan tugas baru di fase yang sesuai di `PROGRESS.md` (ID berikutnya + kriteria penerimaan).
2. Jika mengubah arsitektur, stack, atau keputusan besar, buat ADR baru di `docs/adr/`.
3. Kerjakan sesuai alur biasa.

## 5. Troubleshooting

| Masalah | Solusi |
|---|---|
| Build/check gagal: "… data does not match collection schema" atau tes `content files` gagal | Baca pesan Zod; perbaiki field yang disebut (sering: format tanggal atau `en` yang hilang) |
| 3D tidak muncul | Cek console. Pastikan WebGL aktif (hardware acceleration). Fallback HTML harus tetap tampil. |
| GitHub sync gagal | Pesan `GitHub: warning: …` tidak menghentikan build: cache terakhir dipakai (atau daftar kosong). Penyebab umum: offline, rate limit (isi `GITHUB_TOKEN`), atau salah ketik nama di `include` (ada peringatannya). |
| `bun run dev` langsung kembali ke prompt / port 4321 terpakai | Jika mendeteksi AI agent (mis. Claude Code), Astro 7 otomatis menjalankan dev/preview server di background. Cek `bunx astro dev status`, log `bunx astro dev logs`, hentikan `bunx astro dev stop`. Tambahkan `--ignore-lock` untuk memaksa foreground (dipakai `playwright.config.ts`). Saat dijalankan manusia atau Docker, server berjalan normal di foreground. |
| Browser Playwright belum ada | `bunx playwright install chromium` |
| Tombol "Download CV" 404 di `bun run dev` | PDF hanya dibuat oleh `bun run build`. Untuk mengujinya: `bun run build && bun run preview`. |
| Port 4322 terpakai saat e2e | Ada preview lama yang masih jalan. Cari dengan `ss -ltnp \| grep 4322`, hentikan PID-nya. E2E selalu membangun ulang dan tidak memakai server yang sudah ada. |
| Docker: `address already in use` port 4321 | Dev server lokal masih jalan (`bunx astro dev status` / `stop`) atau pakai `DEV_PORT=4331`. |
| Docker: dependency tidak sinkron setelah `bun add` | Container menjalankan `bun install --frozen-lockfile` setiap start; restart container. Jika tetap error: `docker compose -f docker/compose.dev.yml down -v` (menghapus volume `node_modules`). |
| PDF kosong/terpotong | Jalankan `bun run preview` dan buka `/print/cv` di browser untuk melihat sumbernya |
