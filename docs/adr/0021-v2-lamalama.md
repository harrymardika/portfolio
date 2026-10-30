# 0021 · Versi 2: tampilan ala lamalama.com, ruangan 3D diganti

- **Status:** Accepted
- **Tanggal:** 2026-10-28
- **Menggantikan:** [0018](0018-giok-nila-room.md) (warna Giok → Nila), [0019](0019-one-room.md) ("satu ruang" 3D), dan [0020](0020-full-room-camera.md) (beranda "full 3D"). Berlaku penuh setelah rilis 2.0.0 (penutupan Fase 18); sampai saat itu situs live tetap memakai ketiganya. [0007](0007-threejs-progressive-enhancement.md) tetap berlaku untuk animasi apa pun: isi selalu HTML dan lengkap tanpa JS.

## Konteks
Setelah Fase 14 (rilis 1.6.0) pemilik mengubah arah: tema dan konsep situs harus mirip [lamalama.com](https://lamalama.com/), sebuah agensi digital dengan tampilan gelap, tipografi raksasa, label mono dalam kurung siku, navigasi pil di tengah, dan deretan proyek bergambar (D23, 2026-10-28). Ruangan 3D selayar penuh tidak cocok dengan bahasa desain itu: keduanya berebut perhatian, dan ruangan 3D menyembunyikan visual proyek yang menjadi pusat gaya lamalama. Fase 15 (ruang 3D untuk halaman lain) dibatalkan. Rencana lengkap: [`docs/12-v2.md`](../12-v2.md) §E.

## Keputusan
- **Bahasa desain lamalama** menjadi dasar v2: latar arang dan teks krem (tema gelap bawaan), versi terang krem dan arang lewat tombol tema yang sudah ada, satu warna aksen (D28); judul grotesk tebal huruf kapital; label mono `[ ... ]`; navigasi pil di tengah; panel kecil yang bisa dibuka-tutup di kanan atas; deretan proyek dengan chip tag dan strip gambar; marquee; footer dengan jam live.
- **Hanya bahasa desain yang ditiru.** Logo, foto, teks, video, dan aset lamalama tidak dipakai. Isi tetap dari `content/`.
- **Ruangan 3D dan three.js dihapus** di akhir Fase 18: `src/scenes/room/`, skrip inline `earlyMode` dan `html[data-room-3d]`, token `--room-*`, dependency `three` dan `@types/three`. Animasi v2 memakai CSS dan satu canvas 2D kecil (animasi titik di hero) yang dimuat setelah LCP, diam untuk reduced motion, dan tidak ada tanpa JS.
- **Fitur lama tetap** (`docs/11-roadmap.md` §I, `tests/e2e/feature-inventory.spec.ts`); halaman cetak dan PDF tidak berubah; Lighthouse ≥ 90/95.

## Alternatif yang dipertimbangkan
- **Pertahankan ruangan 3D di beranda, gaya lamalama di halaman lain:** dua bahasa desain yang bertabrakan; ditolak pemilik.
- **Hapus semua animasi:** paling sederhana, tetapi kehilangan gerak yang menjadi bagian dari karakter lamalama.
- **Salin tampilan lamalama persis:** cepat, tetapi situs menjadi tiruan agensi lain, bukan portofolio pemilik.

## Konsekuensi
- JS per halaman turun drastis (±158 KB gzip three.js di beranda hilang), sehingga LCP dan Lighthouse beranda membaik.
- Label mono yang dihapus di T13.2 kembali, kali ini sebagai bagian dari sistem desain yang disengaja.
- `docs/03-design-system.md` ditulis ulang di Fase 18; bagian 3D di `docs/02-architecture.md` §6 dihapus atau diringkas.
- Gambar proyek (Fase 17) menjadi bagian inti tampilan; tanpa gambar, deretan proyek tampil tanpa strip.
