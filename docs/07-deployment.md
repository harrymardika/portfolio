# 07 · Deployment

> Pengaturan Cloudflare (DNS, Tunnel, aturan cache) **diurus langsung oleh pemilik** di servernya. Dokumen ini menjelaskan bagian yang disediakan repo dan titik integrasinya.
>
> **Server:** Lenovo IdeaPad 300S-11IBR, Celeron N3050 (2 core), RAM 1,8 GB, SSD 500 GB, Debian 13 (trixie), Docker 29 + Compose 5 (lihat `content/homelab.yaml`). Karena RAM kecil: jangan pernah build di server, batasi memori tiap container, dan hindari database berat.

## 1. Alur

```
push ke main  /  jadwal tiap 6 jam (sinkron GitHub + PDF, T3.3)  /  manual (tab Actions)
   → GitHub Actions deploy.yml: job verify (= ci.yml: check, unit, e2e, Lighthouse)
   → build 2 image (docker/Dockerfile) → ghcr.io/harrymardika/portfolio-web  & portfolio-stats
                                          tag: latest + sha-<commit>
   → server rumah: portfolio-update.timer (tiap 10 menit) → update.sh → docker compose pull && up -d
   → Caddy :8080 (127.0.0.1) ← cloudflared ← Cloudflare CDN ← pengunjung
```

Build di GitHub, bukan di server: ADR 0005. Timer, bukan Watchtower: ADR 0010.

## 2. File

| File | Isi |
|---|---|
| `docker/Dockerfile` | Multi-stage: `build` (Node 22 + Bun + Chromium → GitHub sync, Astro, PDF, CSP, kompresi `.br`/`.gz`, bundle stats) → `web` (Caddy + `dist/`) dan `stats` (Bun + 1 file `server.js`) |
| `docker/Caddyfile` | File statis terkompresi (`precompressed br gzip`), `/api/health`, proxy `/api/stats/*`, header keamanan, CSP hasil build, cache header, halaman 404 |
| `docker/compose.yml` | Produksi: `web` (port `127.0.0.1:8080`, 96 MB, `GOMEMLIMIT=48MiB`) + `stats` (128 MB, volume `stats-data`); semua *read-only*, tanpa capability, `no-new-privileges` |
| `docker/deploy/update.sh` | `pull` → `up -d` → hapus image lama (> 7 hari) |
| `docker/deploy/portfolio-update.{service,timer}` | systemd: jalankan `update.sh` tiap 10 menit |
| `docker/deploy/backup-stats.sh` | Backup SQLite konsisten (`VACUUM INTO`), simpan 14 terakhir |
| `.github/workflows/ci.yml` | Pull request (dan sebelum setiap deploy): `bun run verify`, lalu Lighthouse CI (`lighthouserc.cjs`); laporan sebagai artifact `lighthouse-reports` |
| `.github/workflows/deploy.yml` | `main` + tiap 6 jam + manual: verify → build & push image |
| `docker/Dockerfile.dev`, `docker/compose.dev.yml` | Development (Fase 1) |

## 3. Pemasangan pertama di server (sekali saja)

> **Sebelum langkah 3, sekali saja di GitHub:** setelah workflow Deploy pertama selesai, buka github.com/harrymardika → *Packages* → `portfolio-web` dan `portfolio-stats` → *Package settings* → *Change visibility* → **Public**. Package GHCR baru biasanya privat; tanpa ini server perlu `docker login ghcr.io`.

Server: Lenovo IdeaPad 300S-11IBR, Celeron N3050, RAM 1,8 GB, Debian 13 (trixie), Docker 29 + Compose 5 (terpasang 2026-10-06). Pasang Docker dari repo resmi Docker untuk Debian, bukan paket `docker.io`. Karena RAM kecil: **jangan pernah build di server**; batas memori container sudah diset.

```bash
# 1. Folder kerja
sudo mkdir -p /opt/portfolio && sudo chown "$USER" /opt/portfolio
cd /opt/portfolio
# Salin dari repo: docker/compose.yml dan semua isi docker/deploy/
#   (mis. git clone https://github.com/harrymardika/portfolio /tmp/p && cp /tmp/p/docker/compose.yml /tmp/p/docker/deploy/* .)

# 2. Rahasia
cat > .env <<'ENV'
STATS_ADMIN_TOKEN=<hasil: openssl rand -hex 32>
STATS_SITE_HOST=harry.mardika.my.id
# TAG=sha-abc1234   # opsional: kunci ke versi tertentu (rollback)
ENV
chmod 600 .env

# 3. Jalankan (image publik dari GHCR, tidak perlu login)
docker compose pull && docker compose up -d
curl -s http://127.0.0.1:8080/api/health        # → {"ok":true}

# 4. Update otomatis
sudo cp portfolio-update.service portfolio-update.timer /etc/systemd/system/
sudo systemctl daemon-reload && sudo systemctl enable --now portfolio-update.timer
systemctl list-timers portfolio-update.timer

# 5. Backup statistik harian (opsional)
( crontab -l 2>/dev/null; echo "30 3 * * * /opt/portfolio/backup-stats.sh >/dev/null 2>&1" ) | crontab -
```

**Cloudflare Tunnel (diurus pemilik):** arahkan hostname `harry.mardika.my.id` ke `http://localhost:8080` (cloudflared di host) atau `http://web:8080` (jika cloudflared berjalan sebagai container di jaringan compose yang sama). Router tidak perlu port forwarding; UFW cukup mengizinkan SSH dari LAN.

**Simpan juga** `STATS_ADMIN_TOKEN` yang sama di `.env` laptop Anda untuk `bun run stats:report`.

## 4. Cache & ketersediaan

- HTML: `Cache-Control: public, max-age=0, must-revalidate`. Aktifkan aturan cache Cloudflare + *Always Online* agar halaman tetap tersaji saat server mati; badge di `/homelab` akan menulis "Sedang offline… salinan Cloudflare". Cek 2026-10-06: HTML masih `cf-cache-status: DYNAMIC` (belum di-cache di edge), jadi saat server mati halaman belum tersaji dari Cloudflare.
- **Cloudflare → Caching → Configuration → Browser Cache TTL: pilih "Respect Existing Headers".** Nilai bawaan (4 jam) menimpa header dari Caddy; terukur 2026-10-06: PDF `max-age=14400`, sehingga CV yang diperbarui bisa baru terlihat 4 jam kemudian.
- Aset ber-hash (`/_astro/*`): `public, max-age=31536000, immutable`.
- PDF (`/downloads/*`): `public, max-age=3600`.
- Gambar pratinjau sosial (`/og/*`): `public, max-age=86400`.
- `/api/health`, `/api/stats/private`: `no-store`. `/api/stats/summary`: 5 menit.
- **Kompresi saat build, bukan saat request.** `scripts/precompress.ts` menulis salinan `.br` (Brotli 11) dan `.gz` untuk file teks ≥ 1 KB (±1,2 MB → ±0,25 MB). Caddy menyajikannya apa adanya, jadi CPU Celeron tidak mengompresi apa pun. Dulu `encode zstd gzip` membuat Caddy memakai ±74 MB RAM setelah satu putaran e2e; kini ±22 MB.

**Hasil ukur (2026-10-05, setelah seluruh e2e):** web 22 MiB / 96, stats 17 MiB / 128. Image: web ±100 MB, stats ±260 MB (sebagian besar runtime Bun).

## 5. Header keamanan (target nilai A)

Diatur di `docker/Caddyfile`: `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`, header `Server` dihapus. **CSP** dibuat saat build oleh `scripts/generate-csp.ts`: `script-src 'self'` + hash SHA-256 setiap script inline (tanpa `unsafe-inline` untuk script), semua sumber lain `self`. Diuji terhadap container sungguhan dengan `bun run test:e2e:docker`.

## 6. Menguji stack produksi secara lokal

```bash
docker build -f docker/Dockerfile --target web   -t ghcr.io/harrymardika/portfolio-web:local .
docker build -f docker/Dockerfile --target stats -t ghcr.io/harrymardika/portfolio-stats:local .
TAG=local WEB_PORT=8080 docker compose -f docker/compose.yml -p portfolio-local up -d
bun run test:e2e:docker        # e2e + header + CSP + kompresi terhadap container
TAG=local docker compose -f docker/compose.yml -p portfolio-local down -v   # -v: hapus volume uji
```

`-p portfolio-local` memisahkan stack uji dari stack lain di laptop. Tes yang bergantung pada fixture GitHub (`@fixture`) dilewati karena image memakai data GitHub asli. CSP hanya diterapkan oleh Caddy, jadi pelanggaran CSP (mis. font yang di-*inline* sebagai `data:`) hanya tertangkap di sini; `scripts/generate-csp.ts` juga menggagalkan build jika ada font `data:`.

## 7. Rollback

Setiap image punya tag `sha-<commit>`. Di server: tulis `TAG=sha-<commit sebelumnya>` di `/opt/portfolio/.env`, jalankan `./update.sh`. Hapus baris `TAG` untuk kembali ke `latest`.
