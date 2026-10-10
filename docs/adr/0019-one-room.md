# 0019 · "Satu ruang": satu kanvas 3D di belakang halaman, ditambatkan ke HTML

- **Status:** Accepted
- **Tanggal:** 2026-10-10
- **Melengkapi:** [0007](0007-threejs-progressive-enhancement.md) (tetap berlaku: Three.js vanilla, progressive enhancement, HTML lebih dulu)

## Konteks
Beranda punya dua scene terpisah di dalam kotak (kartu foto dan jalur journey), sehingga 3D terlihat seperti widget yang ditempel dan halaman terasa datar. Pemilik memilih arah "satu ruang" (D21): satu kanvas di belakang seluruh halaman, isi tetap HTML. Pratinjau yang disetujui menggerakkan kamera dari ruangan ke ruangan mengikuti scroll.

## Keputusan
Satu renderer per halaman (`src/scenes/room/`) dengan kanvas `position: fixed` di belakang `main`, dipasang lewat `mountScene` yang sudah ada.
- **Benda 3D ditambatkan ke elemen HTML** ("slot"): posisinya dihitung dari `getBoundingClientRect` slot dan ikut bergeser bersama scroll, sehingga 3D dan teksnya selalu sejajar di semua ukuran layar. Kamera tetap di depan bidang halaman; perspektif membuat benda terlihat dari sudut yang berubah saat di-scroll, dan pointer memberi sedikit paralaks (diubah: lihat Catatan 2026-10-10). Pemetaan halaman ↔ dunia adalah fungsi murni yang dites (`layout.ts`).
- **Dinding penangkap bayangan** di belakang bidang halaman: bayangan benda jatuh ke "halaman" itu sendiri. Satu cahaya utama.
- **Ruangan** (`RoomPart`) dibuat saat slotnya mendekati layar, dan dibuang bersama renderer.
- **Gambar ulang hanya bila perlu** (scroll, pointer, tema, animasi yang berjalan): `SceneModule.needsRender()` baru di kontrak inti; `mountScene` melewati render saat hasilnya `false`.
- **Tingkatan:** `animated` dengan bayangan real-time bila perangkat punya > 4 core (`realtimeShadows`; diubah menjadi ≥ 6 core dan bukan layar sentuh, lihat Catatan 2026-10-10); perangkat ≤ 4 core tanpa peta bayangan, dan setiap bagian menggambar bayangan lembut statis sendiri; `still` untuk reduced motion (satu frame per perubahan, tanpa animasi otomatis); `off` = HTML saja (keputusan `decide3D` yang sama).
- Warna dibaca dari token (`readPalette`) dan dibaca ulang saat tema berganti.

## Alternatif yang dipertimbangkan
- **Kamera terbang antar-ruangan di dunia tetap** (seperti pratinjau): dramatis, tetapi posisi 3D lepas dari teks HTML di layar yang ukurannya berbeda, jangkar dan sudut kamera perlu disetel per ukuran layar, dan rawan terasa seperti scroll-jacking. Kesan pratinjau (cetakan di dinding, benang, konveyor dilihat dari atas, laptop) dipertahankan dengan memiringkan benda itu sendiri.
- **Tetap scene per bagian di dalam kotak:** paling sederhana, tetapi justru penyebab kesan datar.

## Konsekuensi
- Satu konteks WebGL untuk seluruh beranda (sebelumnya dua).
- Setiap ruangan wajib punya fallback HTML di slotnya; kanvas `aria-hidden` dan tidak menerima klik kecuali lewat raycast untuk benda yang memang punya padanan HTML (titik journey, kartu proyek).
- Perubahan tata letak HTML otomatis memindahkan 3D; tidak ada koordinat dunia yang ditulis tangan per ukuran layar.

## Catatan

- **2026-10-10 (T13.4, T13.5), penyesuaian tanpa mengubah keputusan:**
  - Ambang bayangan real-time menjadi **≥ 6 core dan bukan layar sentuh** (`realtimeShadows`, `coarsePointer`). HP melaporkan jumlah core setara laptop tetapi GPU-nya jauh lebih lemah; perangkat lain memakai bayangan lembut statis.
  - **Kamera tidak lagi bergeser mengikuti pointer.** Paralaks kamera membuat benda 3D bergeser beberapa piksel dari elemen HTML-nya sehingga klik ke titik journey meleset. Kesan hidup didapat dari benda yang sedikit miring sendiri mengikuti pointer (cetakan hero).
