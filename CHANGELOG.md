# Changelog

Format mengikuti [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versi mengikuti [SemVer](https://semver.org/).
Setiap tugas yang selesai menambahkan entri di bagian **Unreleased**. Saat sebuah fase ditutup, entrinya dipindah ke rilis bertanggal (`AGENTS.md` §2a).

## [Unreleased]

### Added
- "Kind words" message API in the stats service, closed until `MESSAGES_ADMIN_TOKEN` is set: visitors' messages wait in a private queue (its own SQLite file, never backed up, no address or e-mail stored) until the owner approves or rejects them; rejected ones are deleted at once, unreviewed ones after 90 days, approved ones once their pull request opens (30 days at most); deleted text leaves no readable copy on disk. Checks: the site's origin, honeypot, bots, 3 messages per visitor per day, at most 100 waiting, no phone number, e-mail, or web address in the text, consent required; plain form posts work without JavaScript. Caddy route `/api/messages*` (never cached, bodies up to 8 KiB) (T12.1, ADR 0017).

## [1.3.0] - 2026-10-09

Phase 11: the "Ask Harry" chatbot.

### Added
- The "Ask Harry" chatbot is live on the site (2026-10-09): service running with its own keys and the kill switch on, corner chat built in (T11.6).
- Manual quality and safety evaluation of the assistant with the real models (`assistant-eval.yml`, 30 graded cases: facts in English and Indonesian, off-topic, personal data, prompt injection, markup); 30/30 passed on 2026-10-09 after prompt fixes (answers always JSON, numbers in the answer's language) (T11.5).
- "Ask Harry" corner chat on every page (not print pages): appears only when the assistant service is on, loads on the first click, keeps the conversation for the tab, answers as plain text with links to site pages, offers the CV and email when it cannot answer, and works as a bottom sheet on phones; the private stats report counts questions by outcome, never their text (T11.4).
- Docker image `portfolio-assistant` (built and published with every deploy), its compose service (128 MB, read-only, no volume, off until `ASSISTANT_ENABLED=true`, its own `ASSISTANT_*` keys), and the Caddy route `/api/ask*` (never cached, bodies over 8 KB refused); deployment tests cover its health check (T11.3).
- "Ask Harry" assistant service (`services/assistant`): answers questions from the site's knowledge with Gemini, or Groq as a fallback; plain-text answers whose links must exist on the site, no phone numbers, per-visitor and daily limits, a kill switch that is off by default, and nothing stored (T11.2, ADR 0014).
- Knowledge for the "Ask Harry" chatbot, built with every deploy from the public site content only (no drafts, hidden items, or phone numbers): a full English and Indonesian version for Gemini and a compact English one for Groq, with link, phone-number, and size checks that stop the build (T11.1, ADR 0014).

### Changed
- AI case study drafts are per project: a group of repositories in `content/github.yaml` gets one draft written from all its READMEs, titled and named after the group, and its members are never drafted on their own (T11.6b, ADR 0016).
- The chat's privacy notice now sits behind a small "Privacy" toggle under the question box (still one tap away, no JavaScript needed), so the panel is less crowded (T11.6).
- AI keys renamed per feature, the same everywhere (GitHub, server, compose, code): `ASSISTANT_GEMINI_API_KEY`/`ASSISTANT_GROQ_API_KEY` for the chatbot and `DRAFT_GEMINI_API_KEY`/`DRAFT_GROQ_API_KEY` for the case study drafts; the chatbot now uses Gemini 3.5 Flash Lite (500 free requests a day instead of 20), the drafts keep Gemini 3.5 Flash; provider errors name the exhausted quota (T11.5b, ADR 0015).
- The Gemini and Groq clients moved to a shared module (`src/lib/ai`) used by the AI case study drafts and the assistant; the drafts behave as before (T11.2).

## [1.2.0] - 2026-10-08

Phase 10: CVs by role.

### Added
- CVs by role (AI/ML Engineer, Data Engineer, Data Analyst, Product Manager, Project Manager, Management Trainee) in English and Indonesian: built at deploy time into `/downloads/cv/` and listed on the page `/cv/`, linked from the footer ("Resumes" / "Resume") next to the site statistics (kept out of search results); each stays within two ATS-friendly pages (T10.2, T10.3).
- CV variant model: `content/cv-variants.yaml` (role line, summary, focus, section order, skill groups per variant) and optional focus labels on highlights, with schema, CMS menu "Varian CV", and tests; variants only select and order existing content (T10.1, D10).

### Changed
- AI case study drafts run twice a day (09:41 and 21:41 WIB) because GitHub sometimes skips a scheduled run; the first daily run on 2026-10-08 never started (T8.2).
- Phase 10 close-out: README, roadmap, content guide, and SRS match the code; the main CV link on `/cv/` takes its role line from `profile.yaml` instead of a fixed UI string.

## [1.1.0] - 2026-10-08

Phase 9: personal branding and content.

### Added
- Medium profile (https://medium.com/@harrymardika) in the footer, the contact section, the portfolio PDF, and structured data; clicks are counted like the other social links.
- "Kind words" / "Kesan & pesan" on the home page: messages people left for Harry, from `content/messages.yaml` (editable in the CMS), shown only with the writer's permission and hidden while the list is empty (T9.4, D15).
- Indonesian case studies: all 11 case study bodies are translated (`content/projects/id/`), shown on `/id/` pages and in the Indonesian Portfolio PDF, editable in the CMS, with tests that keep sections and images in step with the English version; AI drafts now include the Indonesian body (T9.3, D12).

### Changed
- Contributor workflow: every phase now ends with a close-out task (tidy unused code and branches, check docs against code, phase summary, dated CHANGELOG release, final verify and live check), listed in `AGENTS.md` §2a.
- Plans: phase 11 is a floating "Ask Harry" chatbot (separate assistant service, no stored conversations, Gemini with Groq fallback), and phase 13 adds four 3D scenes off the home page (project map, 404, skill constellation, visitor globe); not built yet.
- Skills regrouped into eight groups (AI & ML, LLM & generative AI, Data, Cloud & MLOps, Web & product, Product & project management, Leadership, Languages) with the skills the owner confirmed (SQL, Pandas/NumPy, scikit-learn, Airflow, Spark, Google Cloud, LangChain, BI tools, Figma, Jira, Notion, Scrum, Git, Linux); CV variants pick the relevant groups, and the general CV leaves out the Web & product and Leadership groups to stay at two pages (T9.2, D11).
- Contributor workflow: `docs/06-development-workflow.md` has ready-to-copy prompts for each kind of AI agent session (continue, a specific task, resume interrupted work, a new request, close the session, review) and habits for Claude Code.
- Contributor workflow: older session log entries move from `PROGRESS.md` to `docs/progress-archive.md`, AI agents read only the docs a task needs, and project Claude Code settings (`.claude/settings.json`) allow the verification commands and block reading the private `CV/` folder and `.env`.
- Award titles: "Finalist" / "Finalis" everywhere, with team context in parentheses (Neurontara Data Clash is now "Finalist (Top 5 of 40 Teams)"; Gunadarma Business Idea Competition drops "Team").
- New positioning: the role line is now "AI Product Manager" on the site, CV, Portfolio PDF, and structured data; the tagline, summary, and the three hero numbers lead with product outcomes (launch in 3 months, +45 NPS) and keep AI engineering as the differentiator (T9.1).
- Phase 9 close-out: README, architecture, roadmap, and docs index match the code; an unused UI string is removed.

### Fixed
- Numbers follow each language's rules everywhere: Indonesian pages and PDFs now show headline numbers as `92,5%` instead of `92.5%`, and a test rejects mixed decimal separators in content and UI text (T9.5, D16).

## [1.0.0] - 2026-10-07

Phases 0–8: the site, PDFs, statistics, deployment to the home server (live since 2026-10-06), quality checks, the CMS, and AI case study drafts.

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
