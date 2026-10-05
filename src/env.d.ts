/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** "true" includes the statistics beacon in the build (docs/08-analytics.md). */
  readonly PUBLIC_STATS_ENABLED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
