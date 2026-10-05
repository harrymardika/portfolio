# 0007 · Three.js vanilla sebagai progressive enhancement

- **Status:** Accepted
- **Tanggal:** 2026-10-05

## Konteks
Pemilik menginginkan elemen 3D, tetapi situs harus cepat (LCP < 2.5 s), aksesibel, dan tetap berfungsi di perangkat lemah atau tanpa WebGL.

## Keputusan
Gunakan **Three.js vanilla** (tanpa React Three Fiber) dalam modul `src/scenes/*` dengan kontrak `SceneHandle`, dimuat secara dinamis setelah konten utama tampil. HTML statis yang setara selalu dirender lebih dulu.

## Alternatif yang dipertimbangkan
- **React Three Fiber:** menambah React runtime (~40 KB+) hanya untuk 3D.
- **Spline:** runtime berat dan kurang kontrol.
- **CSS 3D saja:** tidak cukup untuk jalur journey.

## Konsekuensi
- Bundle kecil, kontrol penuh, dan mudah dites dengan memisahkan logika murni.
- Pembersihan resource (dispose) harus ditulis manual dan disiplin.
