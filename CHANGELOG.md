# Changelog

Format mengikuti [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versi mengikuti [SemVer](https://semver.org/).
Setiap tugas yang selesai menambahkan entri di bagian **Unreleased**.

## [Unreleased]

### Added
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
- YAML label in the multimodal crisis-detection project split by an unquoted comma (T1.3).

### Removed
- Previous "Temporal Portal" React/Vite codebase (fresh start).
