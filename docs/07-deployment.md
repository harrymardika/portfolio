# 07 · Deployment

> Pengaturan Cloudflare (DNS, Tunnel, aturan cache) **diurus langsung oleh pemilik** di servernya. Dokumen ini menjelaskan bagian yang disediakan repo dan titik integrasinya.
>
> **Server:** Lenovo IdeaPad 300S-11IBR, Celeron N3050 (2 core), RAM 1,8 GB, SSD 500 GB, Ubuntu 24.04, Docker 29 (lihat `content/homelab.yaml`). Karena RAM kecil: jangan pernah build di server, batasi memori tiap container, dan hindari database berat.

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
| `docker/compose.yml` | Produksi: `web` (Caddy), `stats` (Bun + SQLite), `watchtower` |
| `docker/Dockerfile.dev` ✅ | Image dev: `node:22-bookworm-slim` + binary Bun 1.3.9 (Astro butuh Node asli; `node` di image `oven/bun` hanya pembungkus Bun) |
| `docker/compose.dev.yml` ✅ | Dev: bind mount kode, volume `node_modules`, hot reload, port `DEV_PORT` (default 4321) |
| `.dockerignore` ✅ | Mengecualikan `node_modules`, `dist`, `.env`, `CV/`, `Photos/`, `.git` dari build context |
| `.github/workflows/ci.yml` | PR: check, test, build |
| `.github/workflows/deploy.yml` | `main` + cron: build & push image |

## 3. Titik integrasi untuk pemilik server

| Item | Nilai |
|---|---|
| Hostname | `harry.mardika.my.id` → service `http://web:8080` (atau `localhost:8080`) |
| Statistik | Tidak perlu hostname sendiri: Caddy meneruskan `/api/stats/*` ke service `stats` (ADR 0009) |
| Port publik di router | **Tidak ada** (Cloudflare Tunnel, koneksi keluar) |
| Firewall | UFW: tolak semua masuk kecuali SSH dari LAN |
| Secret di server | `.env` di folder deploy (lihat `.env.example`) |

## 4. Cache & ketersediaan

- HTML: `Cache-Control: public, max-age=0, must-revalidate` (Cloudflare tetap boleh menyimpan via aturan cache + Always Online).
- Aset ber-hash (`/_astro/*`): `public, max-age=31536000, immutable`.
- PDF di `/downloads/`: `public, max-age=3600`.

## 5. Header keamanan (target nilai A)

`Content-Security-Policy` (tanpa `unsafe-inline` untuk script; hanya `self`, plus hash skrip tema inline), `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (matikan kamera, mic, geolocation), `Cross-Origin-Opener-Policy: same-origin`.

## 6. Rollback

Setiap image juga diberi tag `sha-<commit>`. Untuk rollback: ubah tag `web` di `compose.yml` ke sha sebelumnya, lalu `docker compose up -d`.
