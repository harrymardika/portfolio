# Changelog

Format mengikuti [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versi mengikuti [SemVer](https://semver.org/).
Setiap tugas yang selesai menambahkan entri di bagian **Unreleased**.

## [Unreleased]

### Added
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

### Fixed
- Journey and skills keep file order (Astro sorts collection entries by id) (T2.3).
- Light-theme `amber-deep` text color darkened to meet WCAG AA contrast (T1.6).
- YAML label in the multimodal crisis-detection project split by an unquoted comma (T1.3).

### Removed
- Previous "Temporal Portal" React/Vite codebase (fresh start).
