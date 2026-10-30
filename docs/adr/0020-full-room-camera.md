# 0020 · Beranda "full 3D": ruangan selayar penuh dengan kamera yang bergerak

- **Status:** **Superseded** oleh [0021](0021-v2-lamalama.md) (2026-10-28), tetap berlaku sampai rilis 2.0.0
- **Tanggal:** 2026-10-10
- **Menggantikan:** bagian "benda 3D ditambatkan ke elemen HTML" di [0019](0019-one-room.md), untuk **beranda**. Bagian lain ADR 0019 (satu kanvas tetap lewat `mountScene`, tingkatan perangkat, render seperlunya, klik hanya untuk benda yang punya padanan HTML) tetap berlaku. [0007](0007-threejs-progressive-enhancement.md) tetap berlaku.

## Konteks
Pemilik menyetujui pratinjau "satu ruang" dengan ruangan selayar penuh dan kamera yang bergerak mengikuti scroll. Di T13.3 agent memilih menempelkan 3D ke elemen HTML agar selalu sejajar dengan teksnya. Hasil live (rilis 1.5.0) membuat 3D kecil dan datar, dan pemilik menilai tampilannya berbeda dari pratinjau (D22). Keputusan T13.3 itu diambil agent, bukan pemilik.

## Keputusan
Beranda memakai **dunia tetap dengan kamera yang bergerak**, persis pratinjau:
- **Keputusan 3D sebelum tampilan pertama.** Skrip inline di `<head>` beranda menjalankan `earlyMode` (`src/scenes/core/early.ts`), salinan mandiri dari `decide3D(detectCapabilities())` yang sumbernya disisipkan saat build, dan memasang `html[data-room-3d]` berisi modenya (`animated`/`still`). Kedua fungsi dijaga tetap sama oleh `tests/unit/scenes/early.test.ts`: setiap perubahan di `capabilities.ts` harus diulang di `early.ts`. Keputusan ini berlaku penuh: `HomeRoom` tidak memeriksa WebGL lagi, dan tanpa atribut itu (skrip diblokir atau gagal) ruangan tidak dipasang. Tata letak ruangan hanya berlaku di bawah atribut itu: setiap bagian selayar penuh, teks di kolom kiri di atas scrim (desktop) atau panel bawah (HP), tanpa garis pemisah. Tanpa 3D beranda tetap memakai tata letak biasa, tanpa ruang kosong.
- **Kamera:** titik jangkar dihitung dari posisi setiap bagian HTML, lalu kamera diinterpolasi di antara keyframe (target, arah, jarak, lebar yang harus muat), dengan offset tampilan agar subjek berada di kanan (desktop) atau atas (HP). Fungsi murni, dites.
- **Dunia:** dinding (hero, journey) dan lantai (proyek, kontak) menangkap bayangan; cahaya mengikuti target kamera (dan kursor di desktop). Bagian 3D dibangun dari kode bagian yang sudah ada, ditempatkan di koordinat dunia.
- **Warna:** variabel dinding (`--room-a/b/c`) mengikuti kamera dari giok ke nila; tanpa JS tetap gradasi CSS (ADR 0018).

## Alternatif yang dipertimbangkan
- **Tetap ditambatkan ke HTML, hanya diperbesar:** lebih sederhana, tetapi tidak memberi perjalanan kamera yang menjadi inti pratinjau.
- **Memutuskan 3D setelah `load` (seperti sekarang):** tata letak akan melompat dari halaman biasa ke ruangan selayar penuh setelah halaman tampil (CLS buruk, posisi scroll bergeser).

## Konsekuensi
- 3D tidak lagi sejajar piksel dengan teks; teks selalu di kolom/panelnya sendiri, dan 3D mengisi ruang di sampingnya. Klik ke 3D tetap lewat raycast dan selalu punya padanan HTML.
- Skrip inline baru (hash CSP dibuat otomatis oleh `scripts/generate-csp.ts`).
- Pemeriksaan WebGL di `<head>` menunda tampilan pertama: diukur ±10–30 ms di laptop dengan GPU (2026-10-13), bisa lebih lama di HP murah. Sebagai gantinya WebGL hanya diperiksa sekali per halaman (keputusan awal dipakai ulang oleh `HomeRoom`). Dampaknya dipantau lewat Lighthouse di T14.5.
- Pengunjung tanpa GPU atau WebGL, dengan Save-Data, atau Lighthouse CI melihat beranda biasa; Lighthouse tetap mengukur versi itu.
- Halaman lain (Fase 15) memutuskan sendiri apakah memakai kamera bergerak atau penempatan biasa.
