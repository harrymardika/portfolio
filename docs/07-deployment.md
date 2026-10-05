# 07 · Deployment

> Pengaturan Cloudflare (DNS, Tunnel, aturan cache) **diurus langsung oleh pemilik** di servernya. Dokumen ini menjelaskan bagian yang disediakan repo dan titik integrasinya.

## 1. Alur

```
push ke main / jadwal tiap 6 jam
   → GitHub Actions (deploy.yml): check → test → docker build (termasuk GitHub sync + PDF)
   → push image ke ghcr.io/harrymardika/portfolio:latest (+ tag sha)
   → home server: Watchtower mendeteksi image baru → restart container `web`
   → Caddy (port 8080 internal) ← cloudflared ← Cloudflare CDN ← pengunjung
```

Alasan build di GitHub, bukan di server: ADR 0005.

## 2. File (dibuat di Fase 6)

| File | Isi |
|---|---|
| `docker/Dockerfile` | Multi-stage: `deps` (bun install) → `build` (fetch GitHub, astro build, Playwright PDF) → `runtime` (Caddy alpine + `dist/`) |
| `docker/Caddyfile` | Static file server, kompresi, cache header, header keamanan, `try_files` untuk 404 |
| `docker/compose.yml` | Produksi: `web`, `watchtower`, `umami`, `umami-db` |
| `docker/compose.dev.yml` | Dev: Bun + bind mount + hot reload |
| `.github/workflows/ci.yml` | PR: check, test, build |
| `.github/workflows/deploy.yml` | `main` + cron: build & push image |

## 3. Titik integrasi untuk pemilik server

| Item | Nilai |
|---|---|
| Hostname | `harry.mardika.my.id` → service `http://web:8080` (atau `localhost:8080`) |
| Analytics | `analytics.mardika.my.id` → `http://umami:3000` (keputusan D4) |
| Port publik di router | **Tidak ada** (Cloudflare Tunnel, koneksi keluar) |
| Firewall | UFW: tolak semua masuk kecuali SSH dari LAN |
| Secret di server | `.env` di folder deploy (lihat `.env.example`) |

## 4. Cache & ketersediaan

- HTML: `Cache-Control: public, max-age=0, must-revalidate` (Cloudflare tetap boleh menyimpan via aturan cache + Always Online).
- Aset ber-hash (`/_astro/*`): `public, max-age=31536000, immutable`.
- PDF di `/downloads/`: `public, max-age=3600`.

## 5. Header keamanan (target nilai A)

`Content-Security-Policy` (tanpa `unsafe-inline` untuk script; Umami dari domain sendiri), `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (matikan kamera, mic, geolocation), `Cross-Origin-Opener-Policy: same-origin`.

## 6. Rollback

Setiap image juga diberi tag `sha-<commit>`. Untuk rollback: ubah tag `web` di `compose.yml` ke sha sebelumnya, lalu `docker compose up -d`.
