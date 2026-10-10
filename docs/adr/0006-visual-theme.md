# 0006 · Tema visual "F + E" dengan palet Hijau

- **Status:** Superseded by [0018](0018-giok-nila-room.md) (warna, 2026-10-10)
- **Tanggal:** 2026-10-05

## Konteks
Delapan arah visual dibuat sebagai prototipe (`docs/design/theme-prototypes.html`). Tema gelap yang sangat teknis (A, B, C) dinilai pemilik terlalu teknis. Pemilik menginginkan tampilan umum yang tetap punya kesan teknis dan memakai 3D.

## Keputusan
Gabungan **F (kartu foto personal 3D di hero)** dan **E (jalur perjalanan karier 3D)**, dengan **palet Hijau**: hijau tua `#173d32`, amber `#f2b134`, sage `#eef3ef`; font Young Serif, Plus Jakarta Sans, dan IBM Plex Mono. Detail teknis: kotak deteksi wajah ala computer vision di kartu dan angka berfont monospace. Spesifikasi lengkap: `docs/03-design-system.md`.

## Alternatif yang dipertimbangkan
- **F + E palet Biru:** lebih segar dan menyatu dengan latar foto; pemilik memilih hijau.
- **G Humanis + Teknis, D Ramah & Modern:** aman, tetapi kurang personal dan kurang bercerita.
- **A Signal → Insight, B Edge Lab:** terlalu teknis untuk pembaca umum.

## Konsekuensi
- Latar biru foto kontras dengan hijau (keputusan tertunda D3).
- Dua scene 3D yang harus dijaga performanya di mobile.
