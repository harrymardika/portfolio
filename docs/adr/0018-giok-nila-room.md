# 0018 · Warna "Giok → Nila": halaman sebagai ruangan bergradasi

- **Status:** Accepted
- **Tanggal:** 2026-10-10
- **Menggantikan:** [0006](0006-visual-theme.md) (palet Hijau; konsep kartu foto + perjalanan tetap hidup dalam bentuk baru, ADR 0019 direncanakan di T13.3)

## Konteks
Pemilik merasa situs datar dan warnanya kurang hidup: setiap bagian diisi satu warna rata (hijau tua, abu-hijau), tanpa cahaya. Latar biru foto profil (D3) juga bertabrakan dengan hijau. Di pratinjau, pemilik membandingkan Giok, Nila, Studio (terang sejuk), Sogan (batik), dan tiga campuran hijau-biru, lalu memilih **Giok → Nila** (D18, 2026-10-10).

## Keputusan
Halaman adalah satu **ruangan** yang dindingnya berubah dari **hijau giok** di atas ke **biru nila** di bawah, dengan cahaya lembut di dekat atas dan butiran kertas halus.
- Token baru `--room-top`, `--room-mid`, `--room-bottom`, `--room-glow` (dan `--room-shadow` untuk 3D). Tema terang = warna yang sama tetapi muda, teks tinta gelap; tema gelap = warna tua, teks terang. Default tetap mengikuti sistem pengunjung.
- Beranda menjalani seluruh gradasi (`data-room="flow"`); halaman lain berdiri di satu titik: About di giok (`top`), Statistik dan 404 di nila (`bottom`), lainnya di tengah (`mid`). Semuanya CSS murni, jadi tetap ada tanpa JS dan tanpa WebGL.
- **Amber** tetap untuk aksi utama dan kotak deteksi; `--forest` tetap untuk tombol utama di luar hero.
- **Halaman cetak** (`data-print`) memakai palet Hijau lama, sehingga PDF tidak berubah.
- Font tetap: Young Serif, Plus Jakarta Sans, IBM Plex Mono.

## Alternatif yang dipertimbangkan
- **Giok saja / Nila saja:** satu warna rata; tidak menjawab keluhan "datar".
- **Studio** (putih sejuk): bayangan paling nyata, tetapi kehilangan identitas hijau.
- **Sogan** (cokelat soga + nila): paling khas Jawa, tetapi paling berani untuk profil profesional.
- **Giok + Nila / Nila + Giok** (satu warna dinding, satu warna benda): dinilai kurang bercerita dibanding perubahan warna sepanjang perjalanan.

## Konsekuensi
- Kontras teks dicek di **setiap 10% gradasi** dan di atas cahaya, di kedua tema (`tests/unit/tokens-contrast.test.ts`).
- Bagian yang dulu berlatar hijau tua (hero, kontak) kini menyatu dengan ruangan; komponen memakai `ink`/`ink-muted`, bukan `on-forest`.
- Lapisan butiran `position: fixed` memakai `mix-blend-mode: overlay` (22%). `body` sengaja **tidak** diberi `isolation: isolate`: latar `body` dipindah ke kanvas dokumen, jadi di dalam grup terisolasi overlay tidak punya apa pun untuk dicampur dan berubah menjadi lapisan putih yang menurunkan kontras tema gelap. Tes kontras memberi margin untuk butiran ini.
- Gambar OG masih memakai `--forest` dan diperbarui di T14.5.
