# 03 · Design system: ruangan "Giok → Nila"

Referensi visual: pratinjau "satu ruang" yang disetujui pemilik (2026-10-10, privat): https://claude.ai/artifact/Xkm8xfNPp6m1d1ijtf64jb, tombol **Giok → Nila**. Prototipe lama `docs/design/theme-prototypes.html` hanya arsip.
Keputusan: warna `docs/adr/0018-giok-nila-room.md` (menggantikan palet Hijau `docs/adr/0006-visual-theme.md`).

> **Akan diganti di Fase 13 (D18–D21, 2026-10-10):** warna Giok → Nila, H1 = nama, tanpa kata beraksen dan label mono huruf kapital, 3D "satu ruang". Rencananya di `docs/11-roadmap.md` §H. Warna (§2, T13.1) dan tipografi/komponen tanpa 3D (§3, §5, T13.2) sudah diganti. Sampai T13.3–T13.6 selesai, bagian 3D dokumen ini tetap menggambarkan kode yang berjalan.

## 1. Konsep

**"Kartu personal + perjalanan."** Bagian atas memperkenalkan *siapa* (foto sebagai kartu 3D, kalimat ajakan). Bagian berikutnya menceritakan *perjalanan* (jalur karier 3D). Kesan umum dan hangat, dengan detail teknis yang halus: kotak deteksi ala computer vision dengan label kelas bergaya keluaran model.

Nada: tenang, dewasa, ramah. Tidak "neon", tidak gelap pekat.

## 2. Token warna: "Giok → Nila" (ADR 0018)

Semua warna di komponen **wajib** memakai token ini. Nilainya ada di `src/styles/tokens.css` (satu-satunya tempat hex diizinkan; dijaga oleh `bun run lint:tokens`) dan dipetakan ke utilitas Tailwind di `src/styles/global.css`: `bg-forest`, `text-amber-deep`, `border-line`, `text-ink-muted`, dst.

**Ruangan.** Halaman adalah satu ruangan: dindingnya bergradasi dari hijau giok (atas) ke biru nila (bawah), dengan cahaya lembut di kanan atas dan butiran kertas halus (`body::before`). Setiap halaman memilih titiknya lewat `room` di `PageLayout`/`BaseLayout` (`<body data-room>`): beranda `flow` (seluruh gradasi), About `top`, Statistik dan 404 `bottom`, lainnya `mid`. Semuanya CSS, jadi tetap ada tanpa JS dan WebGL.

| Token | Terang | Gelap | Pemakaian |
|---|---|---|---|
| `--room-top` | `#dcefe5` | `#12483a` | Dinding atas (giok) |
| `--room-mid` | `#d5e9ea` | `#113a48` | Dinding tengah; warna dasar `body` |
| `--room-bottom` | `#dfe4f4` | `#172a66` | Dinding bawah (nila) |
| `--room-glow` | `#ffffff` | `#1a5645` | Cahaya lembut dekat atas (dicampur 70%) |
| `--room-shadow` | `#0f2a33` | `#020b10` | Bayangan benda 3D di dinding dan lantai |
| `--forest` | `#173d32` | `#173d32` | Tombol utama di luar hero (`bg-forest text-on-forest`), skip link |
| `--forest-ink` | `#0e2b35` | `#f1f6f4` | Judul |
| `--amber` | `#f2b134` | `#f2b134` | Tombol CTA, kotak deteksi, titik journey |
| `--amber-deep` | `#8a5a00` | `#f7c95f` | Aksen **teks** kecil (tahun, angka) di atas ruangan dan permukaan |
| `--sage` | `#e4efec` | `#0f2a31` | Latar kecil: chip, hover |
| `--surface` | `#fbfdfc` | `#12303a` | Kartu, panel, label |
| `--ink` | `#11293a` | `#e9f1ee` | Teks utama |
| `--ink-muted` | `#3d5565` | `#c4d6d3` | Teks sekunder |
| `--line` | `#c3d5d2` | `#2c4a52` | Garis, border |
| `--on-forest` | `#ffffff` | `#ffffff` | Teks di atas `forest` |
| `--on-forest-muted` | `#d3e2d9` | `#d3e2d9` | Teks sekunder di atas `forest` |
| `--success` | `#7ee2a8` | `#7ee2a8` | Indikator status |
| `--mint` | `#8fc2a8` | `#8fc2a8` | Dekorasi 3D saja, bukan teks |
| `--print-ink` | `#000000` | `#000000` | Teks CV PDF saja |

**Halaman cetak** (`data-print` di `<html>`, dipasang `PrintLayout`) memakai nilai palet Hijau lama untuk `forest-ink`, `sage`, `surface`, `ink`, `ink-muted`, `line`, sehingga PDF tidak berubah. Halaman cetak selalu tema terang.

Kontras minimal: teks normal 4.5:1, teks besar 3:1. `amber` di atas dinding terang **tidak** lolos untuk teks kecil; gunakan `amber-deep`. `tests/unit/tokens-contrast.test.ts` mengecek semua pasangan teks/latar untuk kedua tema, **termasuk teks di setiap 10% gradasi ruangan dan di atas cahaya**. Jika menambah pasangan baru, tambahkan juga ke tes itu.

Mode gelap: dinding giok dan nila yang tua dengan teks terang. Default mengikuti `prefers-color-scheme`; tombol `ThemeToggle` menyimpan pilihan di `localStorage` (kunci `theme`) dan skrip kecil di `<head>` menerapkannya sebelum halaman tampil (tanpa kedip). Varian Tailwind `dark:` mengikuti `data-theme`.

## 3. Tipografi

| Peran | Font | Pemakaian |
|---|---|---|
| Display | **Young Serif** 400 | H1–H2, nama di kartu |
| Body | **Plus Jakarta Sans** 400/500/600/700 | Paragraf, navigasi, tombol |
| Data | **IBM Plex Mono** 400/500 | Hanya keluaran mesin: label deteksi, nama kelas, nama file dataset, kode 404. Angka dan tahun memakai Plus Jakarta Sans tebal + `tabular-nums` (T13.2). Sisa mono di kartu proyek dan statistik situs diganti di T14.1/T14.3 |

Self-host via Fontsource (tanpa request ke Google Fonts, demi privasi dan CSP), subset Latin saja, diimpor di `src/styles/global.css`. Kelas: `font-display`, `font-sans` (default body), `font-mono`. Selalu `font-display: swap` dengan fallback `Georgia, serif` / `system-ui, sans-serif` / `ui-monospace, monospace`.

Skala (fluid, `clamp`):

| Token | Ukuran |
|---|---|
| `--text-name` | `clamp(3rem, 7.4vw, 5.75rem)` / line-height 0.95, letter-spacing −0.01em (nama pemilik, H1 beranda) |
| `--text-h2` | `clamp(1.75rem, 3.8vw, 2.875rem)` / 1.05 |
| `--text-h3` | `1.25rem` / 1.3 |
| `--text-body` | `1rem`–`1.0625rem` / 1.6 |
| `--text-small` | `0.8125rem` |
| `--text-eyebrow` | `0.75rem`, letter-spacing `0.08em` (label kecil sentence case; jangan dipakai sebagai label huruf kapital di atas judul) |

Kelas Tailwind: `text-name`, `text-h2`, `text-h3`, `text-eyebrow` (line-height dan letter-spacing ikut).

Lebar teks maksimal ±65 karakter. Judul memakai `text-wrap: balance`.

## 4. Layout & spacing

- Kontainer maksimal `1120px`, gutter samping `clamp(16px, 4vw, 40px)`.
- Skala spacing kelipatan 4px (pakai skala Tailwind).
- Radius: tombol & badge `999px` (pil); kartu `12px`; label journey `10px`.
- Breakpoint: `sm 640`, `md 768`, `lg 1024`, `xl 1280`. Hero & journey berubah dari dua kolom menjadi satu kolom di bawah `lg`.

## 5. Komponen kunci

| Komponen | Spesifikasi |
|---|---|
| **Hero** (`src/components/hero/`) | Latar: ruangan (§2). Kiri: baris "peran di kota" (`hero.roleIn`), H1 = nama pemilik (`text-name`, D19), `headline` sebagai kalimat Young Serif tanpa warna aksen, tagline, tombol utama (amber) + outline, lalu 3 angka dari `profile.yaml → stats` sebagai daftar bergaris (angka `amber-deep` + konteks). Kanan: kartu foto. Tombol: "Download CV" (amber, solid) + "Portfolio PDF" (outline), ikon unduh, atribut `download` dan `data-download` (untuk statistik T5.3); URL dari `downloadPath()`. |
| **Cetakan hero** (`HeroPrints.astro`, `src/scenes/room/parts/hero.ts`) | Foto cetak (kertas putih, tepi bawah lebih lebar) di depan lembar aksara Jawa bergaris (`content/media/aksara-sheet.png`, dibuat `scripts/generate-aksara.ts`), masing-masing sedikit diputar. Kotak deteksi: wajah (`FACE_BOX`) berlabel nama; lima suku kata berlabel kelas (`ha`, `ra`, …, mono) dan transliterasi. Versi HTML = gambar LCP dan fallback lengkap; versi 3D (ruang, ADR 0019) mengambil posisi dari HTML (`hero-config.ts`), melayang dengan bayangan, dan memutar urutan deteksi sekali ("Play again" untuk mengulang). |
| **Journey** (`src/components/journey/`, `src/scenes/journey-path/`) | Latar: ruangan (§2). Kiri: H2 (tanpa warna aksen) + paragraf dari `profile.yaml → journey`. Kanan: panggung tinggi tetap (480/560 px) berisi tabung `forest`, titik `amber` bercincin `forest`, bola amber yang mengikuti scroll (`sectionProgress`; selalu penuh di dasar halaman). Label = item `<ol>` yang sama dengan fallback, diposisikan di kanan titik lewat `--x/--y`; label belum tercapai bergaya putus-putus (bukan opacity, demi kontras). Klik label membuka popover detail (Popover API, berfungsi tanpa JS). |
| **Fallback Journey** | `<ol>` yang sama ditampilkan sebagai timeline vertikal (garis + titik) tanpa JS/WebGL atau saat 3D `off`. Popover detail tetap berfungsi. |
| **Button** | Varian `primary` (amber di forest / forest di terang), `outline`. Tinggi min 44px. Fokus: outline 2px `currentColor`, offset 2px. |
| **Stat** | Baris: angka tebal `amber-deep` (tabular) + konteks `ink-muted`, dipisah garis tipis. |
| **Indeks proyek** (`ProjectIndex.astro`, `ProjectRow.astro`) | Baris, bukan kartu (D20): tahun, judul (Young Serif, tautan membentang ke seluruh baris) + ringkasan, peran, angka utama (rata kanan). Di HP menjadi dua kolom. Dipakai di beranda; halaman Projects menyusul di T14.1. |
| **Kontak** (`src/components/contact/`) | H2 + intro, alamat email besar (Young Serif, `mailto:`) + tombol "Copy" (hanya dengan JS), lalu media sosial sebagai tautan teks. Tanpa nomor HP. |
| **Chatbot "Tanya Harry"** (`src/components/assistant/`) | Tombol pil `forest` di kanan bawah (cincin `surface` agar terlihat di atas hero), di HP hanya ikon (label tetap untuk pembaca layar). Muncul hanya jika JS aktif dan `/api/ask/health` menyatakan fitur menyala. Panel: dialog non-modal (`surface`, radius 12px), di HP menjadi lembar bawah selebar layar. Gelembung pengunjung `forest`/`on-forest`, jawaban `sage`/`ink`. `body` diberi ruang bawah 4,5rem saat tombol tampil agar tidak menutupi akhir halaman. |

## 6. Aturan 3D

1. **Progressive enhancement.** HTML statis yang setara selalu ada. 3D dimuat dengan dynamic import setelah LCP (`load`). Beranda memakai "satu ruang" (ADR 0019): satu kanvas tetap, benda 3D ditambatkan ke HTML-nya.
2. **Matikan otomatis** (kartu statis) jika: tidak ada WebGL, WebGL berjalan di CPU (SwiftShader, llvmpipe, WARP: tanpa GPU, satu frame saja memblokir halaman), `navigator.hardwareConcurrency <= 2`, atau `saveData`. **Satu frame diam** (`still`) jika `prefers-reduced-motion: reduce`. Untuk debug: `localStorage.setItem('3d:mode', 'animated' | 'still' | 'off')`; tes memakai `localStorage['3d:gpu'] = '1'` agar renderer CPU dianggap GPU.
3. **Anggaran:** JS 3D ≤ 180 KB gzip per halaman; ≤ 60 fps; pause saat di luar layar; DPR maksimal 2.
   Scene di bawah layar pertama (journey) baru dibuat saat pengunjung menggulir mendekatinya; shader dikompilasi lebih dulu dengan `renderer.compileAsync` agar frame pertama tidak menjadi long task (T7.2).
4. **Warna** dibaca dari token CSS saat mount (`getComputedStyle`), termasuk cahaya ruang (`--room-sky/-ground/-sun/-shadow`), dan dibaca ulang saat tema berganti; bukan ditulis di kode scene.
5. **Interaksi tidak wajib.** Semua informasi juga ada dalam teks; 3D tidak boleh menjadi satu-satunya cara mengakses konten.
6. **Label HTML** di atas kanvas (milestone) harus tetap berupa teks yang bisa dibaca screen reader, atau duplikat dari fallback.

## 7. Aksesibilitas

- Target WCAG 2.2 AA. Kanvas 3D diberi `aria-hidden="true"`; makna disampaikan oleh HTML.
- Semua gambar punya `alt` (foto profil: "Foto Harry Mardika"/"Photo of Harry Mardika").
- Gerakan menghormati `prefers-reduced-motion` (CSS dan JS).
- Skip link ke `#main`, `lang` di `<html>` sesuai locale, fokus terlihat di semua elemen interaktif.

## 8. Ikon & media

- Ikon: satu set konsisten (Lucide via `astro-icon` atau SVG inline). Ikon sosial (LinkedIn, Instagram, GitHub, Medium, email) digambar ulang dengan gaya outline yang sama (`src/components/ui/Icon.astro`).
- Foto profil: `content/media/profile.jpg` (1024×1024). Gunakan `astro:assets` untuk varian AVIF/WebP responsif.
- Latar foto saat ini biru. Ini sengaja dibiarkan kontras di atas hijau (keputusan tertunda D3 di `PROGRESS.md`).
