# Changelog

Format mengikuti [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versi mengikuti [SemVer](https://semver.org/).
Setiap tugas yang selesai menambahkan entri di bagian **Unreleased**.

## [Unreleased]

### Added
- Search and field filters on the Projects page (Computer Vision, NLP & Generative AI, and more, set in profile.yaml), with result counts and shareable links such as `/projects/?filter=computer-vision`.
- A case study about this site itself (Projects → Self-hosted portfolio platform).
- Owner operations guide (`docs/10-operations.md`): accounts and secrets, routine tasks, maintenance checklists, troubleshooting, and recovery; the README now describes the live site.
- AI case study drafts: tag a repository `portfolio` and a daily workflow drafts its case study (English and Indonesian) from the README with Gemini, or Groq as a fallback, as a pull request for review (T8.2, ADR 0013).
- Two more case studies: Reclaimyt (with design sketches and prototype photos) and Dompet Juara (with its dashboard); Decklify gains a "What I learned" section and Aksara Jawa its test accuracy.
- The site stays available from Cloudflare's cache when the home server is down; each deploy purges that cache so updates still show at once (ADR 0012).
- The site is live at https://harry.mardika.my.id on the home server (Debian 13), with an A+ security header grade on Mozilla HTTP Observatory (T7.3).
- Edit the site's content from the browser with Pages CMS: every save is a commit that is validated before it goes live (T8.1, ADR 0011).
- End-to-end tests for the main journeys with a keyboard only, language switching that keeps the current page, and the journey section without WebGL (T7.4).
- Lighthouse CI on every pull request and before every deploy: performance, accessibility, best practices, and SEO budgets for six key pages (T7.2).
- Search and sharing: sitemap with language alternates, robots.txt, a generated 1200×630 preview image for every page in both languages, and structured data for the person, the website, and each case study (T7.1).
- Production Docker images (Caddy web + Bun stats) built and published to GHCR by GitHub Actions on every push to `main`, every 6 hours (fresh GitHub projects and PDFs), and on demand; pull requests run the full verify suite (T6.1–T6.3, T3.3).
- Production compose stack for the home server with memory limits, read-only containers, a systemd update timer instead of Watchtower (ADR 0010), and a daily SQLite backup script (T6.4, T5.2).
- Hash-based Content Security Policy generated from each build, plus security and cache headers; text files are compressed at build time so the server never compresses on request.
- Live server status on the Homelab page (T6.5).
- Deployment tests that run against the real containers (`bun run test:e2e:docker`).
- Owner-only tracking-link report: `bun run stats:report` shows which `?ref=` links were opened and whether the CV was downloaded (T5.5).
- Live site statistics on the Homelab page, formatted per language, with a graceful fallback when the service is down (T5.4).
- Statistics beacon: page views (with private tracking ref), downloads, and social link clicks; respects DNT/GPC, never sends from localhost or print pages (T5.3).
- Built-in stats service (Bun + SQLite): privacy-preserving event recording, public summary, token-protected tracking-link report (T5.1).
- Download CV and Portfolio PDF buttons on the home hero and About page, in both languages (T4.4).
- Automatic PDF generation at build time: CV and portfolio in English and Indonesian, tagged, with size budgets (T4.3).
- Visual portfolio print pages (A4 landscape, 8 pages) in English and Indonesian (T4.2).
- Indonesian translations for all experience, education, and training highlights (draft, pending owner review); translatable skill items and award issuers.
- ATS-friendly CV print pages in English and Indonesian that fit on two A4 pages (T4.1).
- Curated GitHub projects: owner descriptions (EN/ID) and multi-repo project groups in `content/github.yaml`; four more case studies linked to their repos.
- Selected GitHub repositories appear on the Projects page (GitHub badge, language, stars, topics); case studies linked to a repo show its stars (T3.2).
- GitHub sync: choose repos in `content/github.yaml` or with the `portfolio` topic; REST client with retries; never breaks the build when GitHub is unreachable (T3.1).
- MIT license for the code; server specs on the Homelab page; site-wide link crawler test; ADR 0009 (built-in stats shown on the site) replacing the Umami plan; GitHub repo selection via `content/github.yaml` planned for Phase 3.
- Homelab page (deployment pipeline and stack from `content/homelab.yaml`) and a bilingual 404 page (T2.7).
- Contact section with email (copy button), LinkedIn, Instagram, and GitHub; no phone number (T2.6).
- Mobile navigation menu built on the Popover API (works without JavaScript) (T2.8).
- About page with summary, experience, leadership and teaching, education, training, awards, active certifications, and skills (T2.5).
- Projects list with tag filter, case study pages, and selected projects on the home page (T2.4).
- Journey section: 3D career path driven by scroll with milestone labels and no-JS detail popovers; accessible HTML timeline fallback (T2.3).
- Home hero with headline, stats, and a 3D photo card with a face-detection frame; static HTML card as LCP image and fallback; three.js loaded only after page load on capable devices (T2.2).
- 3D scene core: capability decision (off / still / animated), clamped frame loop that pauses off-screen, theme palette from CSS tokens, pointer tracking, and resource disposal (T2.1).
- Docker development environment with hot reload (`docker/compose.dev.yml`, Node 22 + Bun) and `.dockerignore` (T1.8).
- Page layout with skip link, header (home link, language switch, theme toggle), footer with social icons from `profile.yaml`, Open Graph meta, and automated axe accessibility and keyboard tests (T1.7).
- Design tokens with light/dark themes, Tailwind 4, self-hosted Latin fonts, theme toggle without flash, raw-hex guard (`lint:tokens`), and an automated WCAG contrast test for token pairs (T1.6).
- Bilingual routing (English at `/`, Indonesian at `/id/`), typed UI dictionary, locale URL helpers, base layout with canonical and hreflang, and a no-JS language switch (T1.5).
- Pure content helpers (localization fallback, date formatting, certification expiry, ordering, visibility, headline emphasis, project ordering) with 100% unit coverage, and typed data queries (T1.4).
- Zod content schemas for every `content/` file, Astro content collections, and a content integrity test suite (T1.3).
- Quality tooling: ESLint (strict TS, Astro, a11y), Prettier, `bun run check`, Bun unit tests, Playwright e2e smoke tests on desktop and mobile (T1.2).
- Astro 7 + Bun + TypeScript (strictest) scaffold with `@/` path alias, folder skeleton, placeholder home page, and favicon (T1.1).
- Project foundation (Phase 0): README, AGENTS.md, CLAUDE.md, PROGRESS.md, full documentation in `docs/`, ADR 0001–0008.
- Content source in `content/` extracted from the owner's CV (profile, experience, education, awards, trainings, certifications, skills, journey, projects).
- Theme prototypes (`docs/design/theme-prototypes.html`); chosen theme: F + E, green palette.
- Reviewer subagent for Claude Code (`.claude/agents/reviewer.md`).

### Changed
- New positioning: the role line is now "AI Product Manager" on the site, CV, Portfolio PDF, and structured data; the tagline, summary, and the three hero numbers lead with product outcomes (launch in 3 months, +45 NPS) and keep AI engineering as the differentiator (T9.1).
- The CV is printed in black, lists Education and Skills right after the Summary, and shows key results in bold; mark a phrase `**like this**` in content/ to make it bold on the CV, the portfolio PDF, and the About page.
- The Homelab page is replaced by a site statistics page at `/stats/`, linked from the footer instead of the main menu; the footer no longer says how the site is built.
- Merging an AI draft pull request now publishes the case study directly; no separate publish step.
- AI drafts retry a busy Gemini once before falling back to Groq, and use plain hyphens and spaces.
- Indonesian translations reviewed by the owner; the undergraduate thesis now appears under its official title.
- Devices that render WebGL on the CPU (no GPU) keep the static photo card instead of a 3D scene that blocked the page for seconds; Lighthouse now holds every page to performance ≥ 90.
- The Homelab page lists the server's new operating system, Debian 13.
- The journey 3D scene starts only when scrolled near, and shaders compile ahead of the first frame, cutting main-thread blocking on the home page by about three quarters.

### Fixed
- The server status badge no longer makes the statistics page scroll sideways on phones.
- Hoax and BCA case study metrics now say they are training values and show the validation values from the repos.
- E2E builds use a separate GitHub cache and output directory, so test fixtures never appear in dev or production (T3.2).
- E2E tests always build and start a fresh server instead of reusing a possibly stale one (T2.8).
- Type error in `ProjectGrid` optional prop that slipped into T2.4; added `bun run verify` to gate commits (T2.4).
- Journey and skills keep file order (Astro sorts collection entries by id) (T2.3).
- Light-theme `amber-deep` text color darkened to meet WCAG AA contrast (T1.6).
- YAML label in the multimodal crisis-detection project split by an unquoted comma (T1.3).

### Removed
- The Homelab page (`/homelab/` now returns 404) with `content/homelab.yaml` and its Pages CMS editor; its deploy story lives on as the new case study.
- Previous "Temporal Portal" React/Vite codebase (fresh start).
