# 08 · Statistik situs

Statistik dikumpulkan dan **ditampilkan langsung di harry.mardika.my.id**, tanpa layanan analytics terpisah. Keputusan dan alasan: [ADR 0009](adr/0009-built-in-stats.md). Implementasi: Fase 5.

## 1. Arsitektur

```
Browser ──sendBeacon──► Cloudflare ──► Caddy /api/stats/* ──► service `stats` (Bun + SQLite)
   ▲                                                                │
   └──── GET /api/stats/summary (cache 5 menit) ◄───────────────────┘
```

- Kode: `services/stats/` (`server.ts`, `handler.ts`, `store.ts`) + aturan bersama di `src/lib/stats/` (`events.ts`, `privacy.ts`). Lokal: `bun run stats:dev` (port 8787, data di `.data/`).
- `stats` berjalan di `docker/compose.yml` di samping `web`, dengan data SQLite di volume `stats-data`. RAM terukur ±17 MiB (2026-10-05, server di-bundle menjadi satu file), batas container 128 MB.
- Caddy meneruskan `/api/stats/*` ke `stats`; semua path lain adalah file statis.
- Jika `stats` tidak tersedia, situs tetap normal dan angka statistik tampil sebagai "—".

## 2. Yang dicatat

| Event | Data | Pemicu |
|---|---|---|
| `pageview` | path (tanpa query), bahasa, domain asal (referrer), negara (`CF-IPCountry`) | Setiap halaman dimuat |
| `download-cv` | `{ lang }` | Tombol Download CV (T4.4) dan tautan PDF di halaman `/cv/` (varian CV, Fase 10); jumlahnya menggabungkan CV utama dan varian, bedakan lewat path `/cv/` |
| `download-portfolio` | `{ lang }` | Tombol Portfolio PDF (T4.4) |
| `outbound` | `{ platform: linkedin \| instagram \| github \| email }` | Klik tautan sosial |
| `ref` *(privat)* | nilai `?ref=` | Kunjungan dari tautan lamaran |

Nama dan bentuk event didefinisikan di satu tempat, `src/lib/stats/events.ts` (skema Zod yang dipakai beacon dan layanan). Beacon (`src/components/layout/StatsBeacon.astro`, aturan murni di `src/lib/stats/beacon.ts`) mendengarkan klik pada elemen dengan atribut:
- `data-download="cv|portfolio"` (tombol unduh), dan
- `data-outbound="linkedin|instagram|github|email"` (tautan sosial di footer dan bagian Contact).

Kapan beacon mengirim:
- hanya jika build dibuat dengan `PUBLIC_STATS_ENABLED=true` (production);
- **tidak pernah dari `localhost`**, kecuali di browser di-set `localStorage['stats:debug'] = '1'`;
- tidak pernah jika *Do Not Track* / *Global Privacy Control* aktif;
- tidak pernah dari halaman `/print/*`.
Layanan juga menolak browser *headless* dan bot lain berdasarkan User-Agent.

### Mencoba secara lokal
```bash
bun run stats:dev                                   # terminal 1: layanan di :8787 (data di .data/)
STATS_SITE_HOST=localhost PUBLIC_STATS_ENABLED=true bun run dev   # terminal 2 (lihat catatan)
```
Di browser (DevTools → Console): `localStorage.setItem('stats:debug', '1')`, lalu buka beberapa halaman. Lihat hasil di http://localhost:4321/api/stats/summary (cache 5 menit). Untuk dev, Astro memakai `trailingSlash: 'ignore'` agar proxy `/api/stats` di `astro.config.ts` bisa dijangkau; build tetap `always`. Catatan: `STATS_SITE_HOST` milik layanan (terminal 1) harus `localhost` agar pemeriksaan origin menerima beacon lokal.

## 3. Yang ditampilkan publik

Tampil di halaman **/stats/** (tautan "Statistik situs" di footer, bukan menu utama) (`src/components/stats/SiteStats.astro`), hanya pada build dengan `PUBLIC_STATS_ENABLED=true`. Bentuk respons divalidasi dengan skema bersama `src/lib/stats/summary.ts`; jika layanan gagal atau responsnya tidak sesuai, bagian ini menampilkan "Statistik sementara tidak tersedia" dan halaman tetap normal.

Bagian statistik (EN/ID): total pengunjung unik dan tampilan halaman (semua waktu dan 30 hari), unduhan CV dan Portfolio, 5 halaman terpopuler, 5 sumber trafik (hanya nama domain), dan negara teratas. **Tidak** menampilkan nilai `?ref=`, path dengan query, atau data per orang.

## 4. Tautan pelacak lamaran (privat)

Kirim tautan dengan parameter `ref` saat melamar:

```
https://harry.mardika.my.id/?ref=tokopedia-ml-engineer
```

Formatnya `<perusahaan>-<posisi>`: huruf kecil, angka, dan tanda `-` saja (maks. 60 karakter; nilai lain diabaikan). Data `ref` hanya bisa dilihat oleh pemilik:

```bash
# .env lokal: STATS_ADMIN_TOKEN=<token yang sama dengan server>
bun run stats:report
```

```
ref                    first opened (UTC)  last opened (UTC)  visits  pages  CV   portfolio
tokopedia-ml-engineer  2026-10-05 08:41    2026-10-05 08:41   1       2      yes  -
```

"CV/portfolio = yes" berarti pengunjung yang sama (pada hari yang sama) mengunduh file itu. Alternatif tanpa skrip: `curl -H "Authorization: Bearer $STATS_ADMIN_TOKEN" https://harry.mardika.my.id/api/stats/private`. Membuat token: `openssl rand -hex 32`.

## 5. Privasi

- Tanpa cookie, tanpa localStorage untuk pelacakan, tanpa menyimpan IP.
- Pengunjung unik harian = `SHA-256(IP + User-Agent + salt harian)`. Salt acak diganti setiap hari dan dibuang, sehingga hash lama tidak bisa dicocokkan ulang.
- *Do Not Track* dan *Global Privacy Control* dihormati: beacon tidak dikirim.
- Bot dan crawler (berdasarkan User-Agent) tidak dihitung. Endpoint dibatasi laju (rate limit) per hash.
- Halaman `/print/*` dan mode development tidak dicatat.
