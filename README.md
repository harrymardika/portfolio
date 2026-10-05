# harry.mardika.my.id

Website portfolio pribadi **Harry Mardika** (AI Engineer · Founder, Decklify), di-host sendiri di home server.

- **Live:** https://harry.mardika.my.id *(belum online)*
- **Status pengembangan:** lihat [`PROGRESS.md`](PROGRESS.md)
- **Dokumentasi lengkap:** lihat [`docs/`](docs/README.md)

## Fitur utama

| Fitur | Ringkasan |
|---|---|
| Dwibahasa | English (default, `/`) dan Bahasa Indonesia (`/id/`) |
| Satu sumber data | Semua isi (profil, pengalaman, proyek, dll.) ada di folder [`content/`](content/). Cukup edit YAML/Markdown, lalu web, CV, dan Portfolio PDF ikut ter-update. |
| Download CV & Portfolio | PDF dibuat otomatis saat build. CV ramah ATS dan tanpa nomor HP. |
| 3D interaktif | Kartu foto 3D di hero dan jalur perjalanan karier 3D, dengan fallback statis untuk HP lemah dan `prefers-reduced-motion` |
| Sinkronisasi GitHub | Repo `harrymardika` dengan topic `portfolio` otomatis tampil sebagai proyek |
| Analytics | Umami self-hosted: pengunjung, download CV, sumber trafik, link pelacak per lamaran |
| Self-hosted | Docker + Cloudflare Tunnel di home server; image di-build oleh GitHub Actions |

## Tech stack (rencana, lihat [ADR](docs/adr/))

Astro (SSG) · TypeScript strict · Bun · Tailwind CSS · Three.js (vanilla) · Zod (content schema) · Playwright (PDF & e2e) · Docker + Caddy · GitHub Actions · Umami

## Quick start

```bash
bun install
bun run dev          # http://localhost:4321

# Atau dengan Docker (tanpa memasang Bun/Node di laptop)
docker compose -f docker/compose.dev.yml up   # http://localhost:4321
```

Syarat tanpa Docker: Bun 1.3+ dan Node.js 22.12+. Sebelum commit: `bun run check && bun test && bun run test:e2e`.

Perintah lengkap ada di [docs/06-development-workflow.md](docs/06-development-workflow.md).

## Mengubah isi website

Lihat [docs/04-content-guide.md](docs/04-content-guide.md). Singkatnya: edit file di `content/`, commit, push. Deploy berjalan otomatis.

## Untuk AI agent dan kontributor

Baca **[`AGENTS.md`](AGENTS.md)** terlebih dahulu. Isinya urutan membaca dokumen, cara mengambil tugas dari `PROGRESS.md`, standar kode, dan Definition of Done.

## Struktur repo

```
.
├── AGENTS.md            # Aturan kerja untuk AI agent & developer (wajib dibaca)
├── CLAUDE.md            # Tambahan khusus Claude Code (mengimpor AGENTS.md)
├── PROGRESS.md          # Status, daftar tugas, dan log sesi
├── CHANGELOG.md         # Riwayat perubahan
├── content/             # SUMBER DATA: profil, pengalaman, proyek, dll.
├── docs/                # Dokumentasi: SRS, arsitektur, desain, standar, ADR
│   └── design/theme-prototypes.html   # Prototipe tema (buka di browser)
├── src/                 # Kode aplikasi Astro (lib, components, scenes, pages)
├── scripts/             # (Fase 3–4) Script build: GitHub sync, PDF
├── tests/               # unit (bun test) & e2e (Playwright + axe)
├── docker/              # Dockerfile.dev + compose.dev.yml (Fase 1); produksi di Fase 6
└── .github/workflows/   # (Fase 6) CI/CD
```

## Lisensi

Belum ditentukan (lihat `PROGRESS.md` → Keputusan tertunda). Isi pribadi di `content/` (teks, foto) bukan untuk digunakan ulang.
