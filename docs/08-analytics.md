# 08 · Statistik situs

Statistik dikumpulkan dan **ditampilkan langsung di harry.mardika.my.id**, tanpa layanan analytics terpisah. Keputusan dan alasan: [ADR 0009](adr/0009-built-in-stats.md). Implementasi: Fase 5.

## 1. Arsitektur

```
Browser ──sendBeacon──► Cloudflare ──► Caddy /api/stats/* ──► service `stats` (Bun + SQLite)
   ▲                                                                │
   └──── GET /api/stats/summary (cache 5 menit) ◄───────────────────┘
```

- `stats` berjalan di `docker/compose.yml` di samping `web`, dengan data SQLite di volume `stats-data`.
- Caddy meneruskan `/api/stats/*` ke `stats`; semua path lain adalah file statis.
- Jika `stats` tidak tersedia, situs tetap normal dan angka statistik tampil sebagai "—".

## 2. Yang dicatat

| Event | Data | Pemicu |
|---|---|---|
| `pageview` | path (tanpa query), bahasa, domain asal (referrer), negara (`CF-IPCountry`) | Setiap halaman dimuat |
| `download-cv` | `{ lang }` | Tombol Download CV (T4.4) |
| `download-portfolio` | `{ lang }` | Tombol Portfolio PDF (T4.4) |
| `outbound` | `{ platform: linkedin \| instagram \| github \| email }` | Klik tautan sosial |
| `ref` *(privat)* | nilai `?ref=` | Kunjungan dari tautan lamaran |

Nama event akan didefinisikan di satu tempat, `src/lib/stats/events.ts` (dibuat di T5.3). Komponen memakai helper, tidak menulis string sendiri.

## 3. Yang ditampilkan publik

Bagian statistik (EN/ID): total pengunjung unik dan tampilan halaman (semua waktu dan 30 hari), unduhan CV dan Portfolio, 5 halaman terpopuler, 5 sumber trafik (hanya nama domain), dan negara teratas. **Tidak** menampilkan nilai `?ref=`, path dengan query, atau data per orang.

## 4. Tautan pelacak lamaran (privat)

Kirim tautan dengan parameter `ref` saat melamar:

```
https://harry.mardika.my.id/?ref=tokopedia-ml-engineer
```

Formatnya `<perusahaan>-<posisi>`, huruf kecil, tanpa spasi. Data `ref` hanya bisa dilihat oleh pemilik:
- `GET /api/stats/private` dengan header `Authorization: Bearer $STATS_ADMIN_TOKEN`, atau
- skrip laporan (T5.5), yang menampilkan kapan tautan dibuka dan apakah CV diunduh pada sesi yang sama.

## 5. Privasi

- Tanpa cookie, tanpa localStorage untuk pelacakan, tanpa menyimpan IP.
- Pengunjung unik harian = `SHA-256(IP + User-Agent + salt harian)`. Salt acak diganti setiap hari dan dibuang, sehingga hash lama tidak bisa dicocokkan ulang.
- *Do Not Track* dan *Global Privacy Control* dihormati: beacon tidak dikirim.
- Bot dan crawler (berdasarkan User-Agent) tidak dihitung. Endpoint dibatasi laju (rate limit) per hash.
- Halaman `/print/*` dan mode development tidak dicatat.
