# 05 · Standar kode

Tujuan: kode yang **mudah dibaca, mudah dites, dan aman diubah** oleh siapa pun, manusia atau AI.

## 1. Prinsip

| Prinsip | Artinya di proyek ini |
|---|---|
| **Modular** | Satu folder = satu fitur (`components/journey/`, `scenes/room/parts/journey.ts`). Satu file = satu tanggung jawab. |
| **Single Responsibility** | Komponen hanya menampilkan. Logika (format tanggal, filter sertifikat, merge data GitHub) ada di `src/lib/`. |
| **Separation of concerns** | Data (`content/`) ↔ logika (`lib/`) ↔ tampilan (`components/`) ↔ efek imperatif (`scenes/`). Arah dependensi: lihat `02-architecture.md` §3. |
| **Pure functions first** | Fungsi di `lib/` sebisa mungkin murni: input → output, tanpa I/O atau state global. I/O dipisah ke file `client.ts`/`io.ts` yang tipis. |
| **Explicit over clever** | Nama jelas lebih baik daripada komentar. Hindari abstraksi yang belum dibutuhkan (YAGNI). |
| **DRY dengan akal sehat** | Gabungkan logika yang dipakai 3 kali atau lebih. Duplikasi kecil lebih baik daripada abstraksi yang salah. |
| **Fail fast saat build** | Validasi data dengan Zod; build gagal lebih baik daripada website rusak. |
| **Progressive enhancement** | HTML lengkap dulu, lalu CSS, lalu JS/3D sebagai tambahan. |
| **Accessible by default** | Semantik HTML, keyboard, kontras, alt text sejak awal, bukan di akhir. |

## 2. TypeScript

- `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`.
- **Dilarang `any`.** Gunakan `unknown` lalu persempit (narrowing), atau tipe hasil `z.infer`.
- Tipe data konten **hanya** berasal dari skema Zod (`z.infer<typeof schema>`). Jangan menulis ulang interface yang sama.
- Ekspor bernama (named export). Default export hanya bila diwajibkan framework (halaman Astro, config).
- Gunakan `readonly` untuk data yang tidak diubah. Hindari mutasi parameter.
- Error: lempar `Error` dengan pesan yang menjelaskan **apa** yang salah dan **bagaimana** memperbaikinya.

## 3. Penamaan

| Hal | Gaya | Contoh |
|---|---|---|
| Komponen Astro | PascalCase | `ExperienceList.astro` |
| Modul TS | camelCase | `formatDateRange.ts`, `isActiveCertification.ts` |
| Folder | kebab-case | `room/`, `kind-words/` |
| Konstanta | UPPER_SNAKE | `MAX_PIXEL_RATIO` |
| Tipe/interface | PascalCase, tanpa awalan `I` | `SceneHandle` |
| Boolean | awalan `is/has/should/can` | `isReducedMotion` |
| Event analytics | kebab-case | `download-cv` |
| Slug konten | kebab-case | `crowd-violence-detection` |
| Tes | `<nama>.test.ts` | `formatDateRange.test.ts` |

## 4. Ukuran dan struktur

- File ≤ ±200 baris (panduan, bukan hukum). Jika lebih, pecah per tanggung jawab.
- Fungsi ≤ ±40 baris dengan maksimal 3 parameter; lebih dari itu gunakan objek opsi.
- Setiap folder fitur boleh punya `index.ts` sebagai pintu masuk publik. Modul lain mengimpor dari `index.ts`, bukan dari file internal.
- Import memakai alias `@/` (mis. `@/lib/content`), bukan `../../..`.

## 5. Komponen Astro

- Props diketik dengan `interface Props`.
- Tidak mengambil data sendiri (lihat `02-architecture.md` §3); data masuk lewat props.
- Teks UI dari `t('key')`; teks konten dari `localize(field, locale)`.
- Styling dengan kelas Tailwind yang memakai token (`bg-forest`, `text-amber`). **Hex mentah dilarang.**
- Island (JS di klien) hanya bila perlu, dengan `client:visible` atau `client:idle`.

## 6. Modul 3D (`src/scenes/`)

- Ikuti kontrak `SceneHandle` (`02-architecture.md` §6).
- Semua yang dibuat (geometry, material, texture, renderer, listener, observer) harus dibersihkan di `destroy()`.
- Tidak ada angka ajaib tersebar. Kumpulkan di `config.ts` per scene (posisi, kecepatan, ukuran).
- Warna diambil dari token CSS saat mount.
- Logika yang bisa dites tanpa WebGL (easing, layout milestone, clamp dt) dipisah ke fungsi murni dan dites.

## 7. CSS

- Tailwind untuk layout dan spacing; CSS custom properties untuk token.
- Hindari `!important` dan selektor bersarang dalam.
- Semua animasi CSS dibungkus `@media (prefers-reduced-motion: no-preference)`.

## 8. Testing

| Jenis | Alat | Apa yang dites | Kapan wajib |
|---|---|---|---|
| Unit | `bun test` | Semua fungsi di `src/lib/` dan util murni di `scenes/` | Setiap fungsi baru di `lib/` |
| Skema | `bun test` | Contoh data valid/invalid untuk setiap skema | Setiap perubahan skema |
| E2E | Playwright | Halaman utama tampil, ganti bahasa, download PDF, fallback tanpa WebGL | Setiap perubahan UI/halaman |
| A11y | `@axe-core/playwright` | Tidak ada pelanggaran `serious`/`critical` | Setiap halaman baru |
| Visual (manual) | Screenshot Playwright | Desktop 1280 dan HP 390 | Setiap perubahan tampilan |

Aturan: tes mengikuti pola **Arrange–Act–Assert**, satu perilaku per `it`, nama tes berupa kalimat (`it('hides certifications whose expiry date has passed')`).
Target cakupan `src/lib/` ≥ 90%.

## 9. Definition of Done

Sebuah tugas **selesai** hanya jika semua poin ini terpenuhi:

- [ ] Kriteria penerimaan tugas di `PROGRESS.md` terpenuhi
- [ ] `bun run check` lulus (typecheck, lint, format)
- [ ] `bun test` lulus; fungsi baru di `lib/` punya tes
- [ ] E2E lulus jika menyentuh UI; dicek visual di desktop dan HP
- [ ] Jika menyentuh tampilan, 3D, atau aset: `bun run build && bun run lighthouse` lulus (juga dijalankan CI; ambang di `lighthouserc.cjs`)
- [ ] Tidak ada teks hardcode, hex mentah, `any`, `console.log` sisa debug, atau secret
- [ ] Aksesibel: keyboard, fokus terlihat, alt text, kontras
- [ ] Dokumentasi terdampak diperbarui
- [ ] `PROGRESS.md` (status + log sesi) dan `CHANGELOG.md` diperbarui
- [ ] Review: subagent `reviewer` atau `/code-review` tanpa temuan `blocker`

## 10. Git

- **Branch:** `main` selalu bisa di-deploy. Kerja di branch `<tipe>/<ID>-<slug>`, mis. `feat/T2.3-journey-section`.
- **Commit:** [Conventional Commits](https://www.conventionalcommits.org/): `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `ci`, `build`, `perf`, `style`, `wip`.
  Format: `feat(journey): add 3D career path section (T2.3)`. Pesan dalam English, kalimat perintah, ≤ 72 karakter di baris pertama.
- **Satu commit = satu perubahan logis.** Jangan mencampur refactor dengan fitur.
- **Pull Request:** judul = commit utama; deskripsi berisi tugas (T-ID), ringkasan, cara mengetes, dan screenshot untuk perubahan UI.
- Merge dengan squash ke `main`.

## 11. Dependency

- Tambah dependency hanya jika menghemat banyak kode atau sulit dibuat sendiri dengan benar. Tulis alasannya di pesan commit.
- Kunci versi lewat `bun.lock`. Perbarui secara berkala dalam commit `chore(deps)` tersendiri.
- Hindari library yang tidak terawat (rilis terakhir lebih dari 12 bulan, banyak issue terbuka).
