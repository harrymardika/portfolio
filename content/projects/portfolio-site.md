---
title: Self-hosted portfolio platform
summary:
  en: This website, bilingual, with a CV and portfolio PDF generated from one data source, built in CI and served from a 1.8 GB laptop at home.
  id: Website ini, dwibahasa, dengan CV dan PDF portfolio dari satu sumber data, dibangun di CI dan disajikan dari laptop 1,8 GB di rumah.
role: { en: Solo developer, id: Pengembang tunggal }
year: 2026
tags: [Astro, TypeScript, Three.js, Docker, GitHub Actions, Cloudflare]
metrics:
  - { value: "≥ 90", label: { en: Lighthouse performance on every key page, id: skor performa Lighthouse di setiap halaman utama } }
  - { value: "A+", label: { en: security headers (Mozilla Observatory), id: header keamanan (Mozilla Observatory) } }
  - { value: "39 MiB", label: { en: measured RAM for the web server and stats service, id: RAM terukur untuk server web dan layanan statistik } }
links:
  live: https://harry.mardika.my.id
  repo: https://github.com/harrymardika/portfolio
featured: false
draft: false
---

## Problem
I wanted a portfolio that stays current without manual work: one place to edit, a CV and portfolio PDF that never drift from the website, GitHub projects that show up on their own, and visitor numbers without third-party trackers. It had to run on hardware I already owned, an old laptop with a 2-core Celeron and 1.8 GB of RAM, without opening a single port on my home router.

## Approach
- **One data source.** All content lives in YAML and Markdown files checked by Zod schemas. The website (Astro, in English and Indonesian) and both PDFs (printed by Playwright) are generated from them, so invalid data fails the build instead of reaching visitors.
- **Build in CI, not on the server.** GitHub Actions runs type checks, unit tests, end-to-end tests on desktop and mobile, and Lighthouse budgets, then publishes Docker images. The laptop only pulls new images on a timer, and text files are compressed at build time so its CPU never compresses on request.
- **Safe exposure.** A Cloudflare Tunnel connects outbound only. Cloudflare keeps pages for a week, so recently visited pages stay available when the server is down, and every deploy clears that cache. Each build generates a content security policy with a hash for every inline script.
- **Easy updates.** Edits made in the browser through Pages CMS become commits that pass the same checks. Tagging a GitHub repository `portfolio` adds it to the site, and a daily job asks Gemini (with Groq as a fallback) to draft its case study from the README as a pull request. The model's answer is treated as untrusted, and headline metrics whose numbers do not appear in the README are dropped.
- **3D as an extra.** Three.js scenes load only on capable devices; every page is complete without WebGL or JavaScript.
- **Own statistics.** A small Bun and SQLite service counts visits and downloads without cookies or stored IP addresses.

## Result
- Lighthouse performance of at least 90, and accessibility, best practices, and SEO of at least 95, on six key pages, checked before every deploy.
- A+ on Mozilla HTTP Observatory.
- The web server and the statistics service used about 39 MiB of RAM together when measured, and a saved edit goes live in about 20 minutes.
