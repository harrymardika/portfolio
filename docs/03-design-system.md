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
| Data | **IBM Plex Mono** 400/500 | Hanya keluaran mesin: label deteksi, nama kelas, nama file dataset, kode 404. Angka dan tahun memakai Plus Jakarta Sans tebal + `tabular-nums` (T13.2). Sisa mono di kartu proyek dan statistik situs diganti di T15.1/T15.3 |

Self-host via Fontsource (tanpa request ke Google Fonts, demi privasi dan CSP), subset Latin saja, diimpor di `src/styles/global.css`. Kelas: `font-display`, `font-sans` (default body), `font-mono`. Selalu `font-display: swap` dengan fallback `Georgia, serif` / `system-ui, sans-serif` / `ui-monospace, monospace`. Young Serif (latin 400, ±27 KB) di-*preload* di `BaseLayout` untuk layar < 64rem (kecuali halaman cetak) agar sudah ada sebelum tampilan pertama: tanpa itu nama di hero HP pindah ke dua baris saat font masuk (pergeseran tata letak, T14.5). Di layar lebar tidak, karena di sana pergantian font tidak menggeser apa pun dan cetakan hero tetap menjadi LCP (keputusan pemilik T13.4), bukan judul yang tergambar lebih dulu.

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
- **Beranda sebagai ruangan** (ADR 0020, hanya saat 3D jalan, `html[data-room-3d]` dari skrip di `<head>`): setiap bagian selayar penuh (`100svh`; hero dikurangi tinggi header), tanpa garis pemisah dan tanpa garis bawah header. Layar ≥ `lg`: teks di kolom kiri di atas scrim (gradasi `surface` 70% → transparan sampai 46% lebar layar). Layar < `lg`: blok teks bagian (`data-room-copy`) di panel `surface` 92% dengan blur 6 px, radius 14 px, padding 20 px; cetakan hero dan laptop pindah ke atas panel. Di mode ruangan: Journey setinggi 260svh dengan judul dan daftar milestone dalam satu kolom kiri yang menempel (desktop setinggi ≥ 52rem; di layar laptop yang lebih pendek kolomnya ikut tergulir) sementara kamera turun mengikuti benang; Proyek pilihan setinggi 150svh dengan judul dan tiga proyek berjajar di satu panel `surface` 92% di atas (ringkasan maks. 2 baris, tanpa peran; di layar lebar yang pendek, < 52rem, ringkasan disembunyikan secara visual tetapi tetap dibaca pembaca layar) dan konveyor di lantai di bawahnya (di HP: konveyor di atas, panel di bawah); di HP, 3D tiap ruang mengisi bagian atas layar (padding atas 48svh) dan teks di bawahnya. Tanpa 3D: tata letak biasa di atas.

## 5. Komponen kunci

| Komponen | Spesifikasi |
|---|---|
| **Hero** (`src/components/hero/`) | Latar: ruangan (§2). Kiri: baris "peran di kota" (`hero.roleIn`), H1 = nama pemilik (`text-name`, D19), `headline` sebagai kalimat Young Serif tanpa warna aksen, tagline, tombol utama (amber) + outline, lalu 3 angka dari `profile.yaml → stats` sebagai daftar bergaris (angka `amber-deep` + konteks). Kanan: foto cetak di depan lembar aksara Jawa (`HeroPrints.astro`), masing-masing dengan kotak deteksi; kembaran 3D-nya di `src/scenes/room/parts/hero.ts`. Tombol: "Download CV" (amber, solid) + "Portfolio PDF" (outline), ikon unduh, atribut `download` dan `data-download` (untuk statistik T5.3); URL dari `downloadPath()`. |
| **Cetakan hero** (`HeroPrints.astro`, `src/scenes/room/parts/hero.ts`) | Foto cetak (kertas putih, tepi bawah lebih lebar) di depan lembar aksara Jawa bergaris (`content/media/aksara-sheet.png`, dibuat `scripts/generate-aksara.ts`), masing-masing sedikit diputar. Kotak deteksi: wajah (`FACE_BOX`) berlabel nama; lima suku kata berlabel kelas (`ha`, `ra`, …, mono) dan transliterasi. Versi HTML = gambar LCP dan fallback lengkap; versi 3D (ADR 0020) memakai pecahan yang sama dari `hero-config.ts` (`printLayout`) di stasiun hero pada dinding ruangan, kira-kira seukuran pratinjau (lembar ±3,5 satuan), digantung dengan jepitan (`line`) di tali jemuran yang menjadi awal benang journey, kertas bertekstur serat dengan bayangan kontak lembut, di bawah lampu gantung (kap `forest`, bohlam `room-sun`). Pembuka sekali di atas halaman: ruangan redup, lampu berkedip lalu menyala, baru deteksi (reduced motion: langsung keadaan akhir). Cahaya bergeser pelan mengikuti kursor (mouse/pen saja). Urutan deteksi diputar sekali ("Play again" untuk mengulang). Saat pembuka, dinding ikut redup lewat lapisan `room-shadow` di belakang kanvas. |
| **Journey** (`src/components/journey/`, `src/scenes/room/parts/journey.ts`) | Latar: ruangan (§2). Kiri: H2 (tanpa warna aksen) + paragraf dari `profile.yaml → journey`. Kanan: panggung tinggi tetap (480/560 px; di mode ruangan setinggi isinya, di bawah judul dalam satu kolom kiri) berisi `<ol>` kartu milestone (tahun `amber-deep`, judul, subjudul); klik kartu membuka popover detail (Popover API, berfungsi tanpa JS). Dengan ruang 3D (ADR 0020): benang (`--ink`) turun di dinding dari bawah lembar aksara hero, lewat satu titik `amber` bercincin per milestone (berselang-seling kiri dan kanan), lalu menyeberang lantai ke konveyor; kamera turun mengikuti benang dan bola putih mengikuti kamera; titik yang dilewati menyala dan kartunya `data-reached`, kartu yang belum tercapai bergaris putus-putus tetapi tetap berlatar `surface` agar benang di belakangnya tidak memotong teks (bukan opacity, demi kontras). Klik titik = klik kartunya. |
| **Fallback Journey** | `<ol>` yang sama sebagai timeline vertikal (garis + titik CSS) tanpa JS/WebGL atau saat 3D `off`. Popover detail tetap berfungsi. |
| **Button** | Varian `primary` (amber di forest / forest di terang), `outline`. Tinggi min 44px. Fokus: outline 2px `currentColor`, offset 2px. |
| **Stat** | Baris: angka tebal `amber-deep` (tabular) + konteks `ink-muted`, dipisah garis tipis. |
| **Indeks proyek** (`ProjectIndex.astro`, `ProjectRow.astro`) | Baris, bukan kartu (D20): tahun, judul (Young Serif, tautan membentang ke seluruh baris) + ringkasan, peran, angka utama (rata kanan). Di HP menjadi dua kolom. Dipakai di beranda; halaman Projects menyusul di T15.1. |
| **Konveyor proyek** (`SelectedProjects.astro`, `src/scenes/room/parts/sorting.ts`) | Berdiri di lantai ruangan (ADR 0020), terlihat saat kamera berhenti di Proyek pilihan; datanya di pita setinggi 0 di bagian itu. Sabuk `forest` bergaris (`line`) rebah di lantai; kartu kertas putih (strip `amber`, tahun, dan judul proyek Young Serif maks. 3 baris, dipotong di tanda hubung dan diberi "…" bila tidak muat) membawa 3 proyek pilihan lebih dulu lalu studi kasus lain yang punya bidang (maks. 8). Kamera di tiang mendeteksi kartu di bawahnya: kotak `amber` + label bidang (mono, latar `amber`), lalu pendorong di depan sabuk mendorongnya ke belakang, ke wadah bidangnya di belakang sabuk (`surface`, dinding belakang lebih tinggi, nama bidang Plus Jakarta Sans di atasnya), seperti pratinjau. **Log deteksi:** proyek yang terdeteksi ditandai di barisnya di panel HTML (`data-detected`: latar `amber` 12% + garis kiri `amber`) dan satu baris mono "Judul → Bidang" di bawah intro (ruangnya disediakan sejak awal, tidak pernah turun baris; judul panjang dipotong "…") (dari `content/`, tanpa skor; `aria-hidden` karena barisnya sudah mengatakan hal yang sama). Konveyor membawa hingga 8 studi kasus, sedangkan beranda menampilkan 3 baris: kartu proyek tanpa baris hanya mengisi log (sorotan sebelumnya hilang). Hover/ketuk: judul lengkap di atas kartu (latar `surface`); label deteksi dan judul selalu tergambar di atas mesin; klik: studi kasus. Reduced motion: satu frame dengan kartu pertama terdeteksi. |
| **Kind words** (`Messages.astro`, `src/scenes/room/parts/notes.ts`) | Pesan sebagai kartu `surface` bergaris (juga dengan 3D; di desktop satu kolom kiri bersama judul dan undangan). Dengan 3D: maksimal 4 kertas ditempel di dinding pendek yang berdiri di lantai ruangan di kanan (dinding itu hanya menangkap bayangan kertas, jadi hanya terlihat di perangkat dengan bayangan nyata; tanpa itu tiap kertas punya bayangan lembut sendiri), dua per baris dari lantai ke atas, masing-masing dengan tanda kutip besar `amber` dan nama penulisnya (Young Serif, `ink` di atas `surface` tanpa pencahayaan, sedikit miring, selotip `amber` transparan, bayangan lembut). Isi pesan hanya di HTML agar terbaca di semua ukuran. |
| **Kontak** (`src/components/contact/`) | H2 + intro, alamat email besar (Young Serif, `mailto:`) + tombol "Copy" (hanya dengan JS), lalu media sosial sebagai tautan teks. Tanpa nomor HP. Dengan 3D: di kanan (desktop) atau di atas (HP), laptop homelab di lantai ruangan (`forest`, lampu `mint`) yang layarnya menggambar beranda mini: bilah alamat situs, baris peran, nama (Young Serif), tombol `amber` "Download CV", foto cetak, dan baris status asli (titik `mint`, `contact.screenOnline` · `contact.screenVisitors`: pengunjung 30 hari dari `/api/health` + `/api/stats/summary`; disembunyikan bila server tidak menjawab; tanpa data baru). Keterangan `contact.homelab` di kolom teks, di bawah tautan sosial. Di mode ruangan desktop kolom teks dibatasi `min(40rem, 44vw)` (tidak sampai ke laptop dan tetap di dalam scrim), email sedikit lebih kecil agar satu baris, dan tombol Copy (latar `surface`) di bawahnya. |
| **Chatbot "Tanya Harry"** (`src/components/assistant/`) | Tombol pil `forest` di kanan bawah (cincin `surface` agar terlihat di atas hero), di HP hanya ikon (label tetap untuk pembaca layar). Muncul hanya jika JS aktif dan `/api/ask/health` menyatakan fitur menyala. Panel: dialog non-modal (`surface`, radius 12px), di HP menjadi lembar bawah selebar layar. Gelembung pengunjung `forest`/`on-forest`, jawaban `sage`/`ink`. `body` diberi ruang bawah 4,5rem saat tombol tampil agar tidak menutupi akhir halaman. |

## 6. Aturan 3D

1. **Progressive enhancement.** HTML statis yang setara selalu ada. 3D dimuat dengan dynamic import setelah LCP (`load`). Beranda memakai "satu ruang" (ADR 0019, 0020): satu kanvas tetap; benda 3D berdiri di stasiun tetap di dalam ruangan (dinding dan lantai), dan kamera bergerak di antara stasiun mengikuti scroll, dengan subjek di kanan kolom teks (desktop) atau di atas panel (HP). Warna dinding mengikuti kamera dari giok ke nila.
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
