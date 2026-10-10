# 03 · Design system: tema "F + E", palet Hijau

Referensi visual: buka `docs/design/theme-prototypes.html` di browser, bagian **F + E**, tombol warna **Hijau (E)**.
Keputusan: `docs/adr/0006-visual-theme.md`.

> **Akan diganti di Fase 13 (D18–D21, 2026-10-10):** warna Giok → Nila, H1 = nama, tanpa kata beraksen dan label mono huruf kapital, 3D "satu ruang". Rencananya di `docs/11-roadmap.md` §H. Sampai tugas terkait selesai (T13.1 warna, T13.2 tipografi, T13.3–T13.6 3D), dokumen ini tetap menggambarkan kode yang berjalan.

## 1. Konsep

**"Kartu personal + perjalanan."** Bagian atas memperkenalkan *siapa* (foto sebagai kartu 3D, kalimat ajakan). Bagian berikutnya menceritakan *perjalanan* (jalur karier 3D). Kesan umum dan hangat, dengan detail teknis yang halus: kotak deteksi wajah ala computer vision dan angka berfont monospace.

Nada: tenang, dewasa, ramah. Tidak "neon", tidak gelap pekat.

## 2. Token warna

Semua warna di komponen **wajib** memakai token ini. Nilainya ada di `src/styles/tokens.css` (satu-satunya tempat hex diizinkan; dijaga oleh `bun run lint:tokens`) dan dipetakan ke utilitas Tailwind di `src/styles/global.css`: `bg-forest`, `text-amber-deep`, `border-line`, `text-ink-muted`, dst.

| Token | Terang | Gelap | Pemakaian |
|---|---|---|---|
| `--color-forest` | `#173d32` | `#173d32` | Latar hero, tombol utama di bagian terang |
| `--color-forest-ink` | `#12302a` | `#e7efe9` | Judul di latar terang |
| `--color-amber` | `#f2b134` | `#f2b134` | Aksen: kata kunci judul, tombol CTA di hero, titik jalur, kotak deteksi |
| `--color-amber-deep` | `#8a5a00` | `#f2b134` | Aksen **teks** di latar terang (eyebrow, tahun journey). Prototipe memakai `#d48a00`, tetapi kontrasnya hanya 2,5:1, jadi diganti. |
| `--color-sage` | `#eef3ef` | `#111a17` | Latar bagian terang (journey, konten) |
| `--color-surface` | `#ffffff` | `#18231f` | Kartu, label |
| `--color-ink` | `#173d32` | `#e7efe9` | Teks utama (`text-ink`) |
| `--color-ink-muted` | `#3f5d52` | `#a9c4b6` | Teks sekunder (`text-ink-muted`) |
| `--color-line` | `#d6e2d9` | `#2a3a33` | Garis, border |
| `--color-on-forest` | `#ffffff` | `#ffffff` | Teks di atas `forest` |
| `--color-on-forest-muted` | `#d3e2d9` | `#d3e2d9` | Teks sekunder di atas `forest` |
| `--color-success` | `#7ee2a8` | `#7ee2a8` | Indikator status |
| `--print-ink` | `#000000` | `#000000` | Teks CV PDF saja (halaman cetak selalu tema terang) |

Kontras minimal: teks normal 4.5:1, teks besar 3:1. `amber` di atas `sage` **tidak** lolos untuk teks kecil; gunakan `amber-deep`.
Semua pasangan teks/latar di atas dicek otomatis untuk kedua tema oleh `tests/unit/tokens-contrast.test.ts`. Jika menambah pasangan baru, tambahkan juga ke tes itu.

Mode gelap: hero tetap `forest`; bagian terang berganti ke `sage` gelap. Default mengikuti `prefers-color-scheme`; tombol `ThemeToggle` menyimpan pilihan di `localStorage` (kunci `theme`) dan skrip kecil di `<head>` menerapkannya sebelum halaman tampil (tanpa kedip). Varian Tailwind `dark:` mengikuti `data-theme`.

## 3. Tipografi

| Peran | Font | Pemakaian |
|---|---|---|
| Display | **Young Serif** 400 | H1–H2, nama di kartu |
| Body | **Plus Jakarta Sans** 400/500/600/700 | Paragraf, navigasi, tombol |
| Data | **IBM Plex Mono** 400/500 | Angka statistik, label teknis, eyebrow, tahun di journey |

Self-host via Fontsource (tanpa request ke Google Fonts, demi privasi dan CSP), subset Latin saja, diimpor di `src/styles/global.css`. Kelas: `font-display`, `font-sans` (default body), `font-mono`. Selalu `font-display: swap` dengan fallback `Georgia, serif` / `system-ui, sans-serif` / `ui-monospace, monospace`.

Skala (fluid, `clamp`):

| Token | Ukuran |
|---|---|
| `--text-hero` | `clamp(2.125rem, 5vw, 4rem)` / line-height 1.02 |
| `--text-h2` | `clamp(1.75rem, 3.8vw, 2.875rem)` / 1.05 |
| `--text-h3` | `1.25rem` / 1.3 |
| `--text-body` | `1rem`–`1.0625rem` / 1.6 |
| `--text-small` | `0.8125rem` |
| `--text-eyebrow` | `0.75rem` mono, uppercase, letter-spacing `0.08em` |

Kelas Tailwind: `text-hero`, `text-h2`, `text-h3`, `text-eyebrow` (line-height dan letter-spacing ikut).

Lebar teks maksimal ±65 karakter. Judul memakai `text-wrap: balance`.

## 4. Layout & spacing

- Kontainer maksimal `1120px`, gutter samping `clamp(16px, 4vw, 40px)`.
- Skala spacing kelipatan 4px (pakai skala Tailwind).
- Radius: tombol & badge `999px` (pil); kartu `12px`; label journey `10px`.
- Breakpoint: `sm 640`, `md 768`, `lg 1024`, `xl 1280`. Hero & journey berubah dari dua kolom menjadi satu kolom di bawah `lg`.

## 5. Komponen kunci

| Komponen | Spesifikasi |
|---|---|
| **Hero** (`src/components/hero/`) | Latar `forest`. Kiri: badge peran (mono), H1 = headline (kata `*bertanda*` berwarna `amber`, nama disisipkan `sr-only` untuk SEO), paragraf, tombol utama (amber) + outline, 3 statistik mono dari `profile.yaml → stats`. Kanan: kartu foto. Tombol: "Download CV" (amber, solid) + "Portfolio PDF" (outline), ikon unduh, atribut `download` dan `data-download` (untuk statistik T5.3); URL dari `downloadPath()`. |
| **Kartu foto** | `PhotoCard.astro` = kartu HTML statis (gambar LCP, fallback tanpa JS/WebGL) sekaligus panggung 3D. `src/scenes/photo-card/` = versi 3D: tekstur kanvas (foto, nama Young Serif, peran, chip lokasi `amber`), lapisan deteksi terpisah (4 sudut + label `hero.detectionLabel`) yang "mengunci" tiap 4 s lewat skala/opacity tanpa menggambar ulang, miring mengikuti pointer (maks ±0.45 rad), dekorasi bola amber/putih/`mint` + cincin orbit. Posisi kotak wajah: `FACE_BOX` di `config.ts` (dipakai HTML dan 3D). Kanvas muncul (cross-fade) hanya setelah tekstur siap (`data-scene-ready`). |
| **Journey** (`src/components/journey/`, `src/scenes/journey-path/`) | Latar `sage`. Kiri: eyebrow mono "Journey · 2022 → 2026" (dihitung dari data), H2 + paragraf dari `profile.yaml → journey`. Kanan: panggung tinggi tetap (480/560 px) berisi tabung `forest`, titik `amber` bercincin `forest`, bola amber yang mengikuti scroll (`sectionProgress`; selalu penuh di dasar halaman). Label = item `<ol>` yang sama dengan fallback, diposisikan di kanan titik lewat `--x/--y`; label belum tercapai bergaya putus-putus (bukan opacity, demi kontras). Klik label membuka popover detail (Popover API, berfungsi tanpa JS). |
| **Fallback Journey** | `<ol>` yang sama ditampilkan sebagai timeline vertikal (garis + titik) tanpa JS/WebGL atau saat 3D `off`. Popover detail tetap berfungsi. |
| **Button** | Varian `primary` (amber di forest / forest di terang), `outline`. Tinggi min 44px. Fokus: outline 2px `currentColor`, offset 2px. |
| **Stat** | Angka mono 500 + label kecil. |
| **Chatbot "Tanya Harry"** (`src/components/assistant/`) | Tombol pil `forest` di kanan bawah (cincin `surface` agar terlihat di atas hero), di HP hanya ikon (label tetap untuk pembaca layar). Muncul hanya jika JS aktif dan `/api/ask/health` menyatakan fitur menyala. Panel: dialog non-modal (`surface`, radius 12px), di HP menjadi lembar bawah selebar layar. Gelembung pengunjung `forest`/`on-forest`, jawaban `sage`/`ink`. `body` diberi ruang bawah 4,5rem saat tombol tampil agar tidak menutupi akhir halaman. |

## 6. Aturan 3D

1. **Progressive enhancement.** HTML statis yang setara selalu ada. 3D dimuat dengan `client:visible`/dynamic import setelah LCP.
2. **Matikan otomatis** (kartu statis) jika: tidak ada WebGL, WebGL berjalan di CPU (SwiftShader, llvmpipe, WARP: tanpa GPU, satu frame saja memblokir halaman), `navigator.hardwareConcurrency <= 2`, atau `saveData`. **Satu frame diam** (`still`) jika `prefers-reduced-motion: reduce`. Untuk debug: `localStorage.setItem('3d:mode', 'animated' | 'still' | 'off')`; tes memakai `localStorage['3d:gpu'] = '1'` agar renderer CPU dianggap GPU.
3. **Anggaran:** JS 3D ≤ 180 KB gzip per halaman; ≤ 60 fps; pause saat di luar layar; DPR maksimal 2.
   Scene di bawah layar pertama (journey) baru dibuat saat pengunjung menggulir mendekatinya; shader dikompilasi lebih dulu dengan `renderer.compileAsync` agar frame pertama tidak menjadi long task (T7.2).
4. **Warna** dibaca dari token CSS saat mount (`getComputedStyle`), bukan ditulis di kode scene.
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
