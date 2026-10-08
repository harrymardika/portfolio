/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** "true" includes the statistics beacon in the build (docs/08-analytics.md). */
  readonly PUBLIC_STATS_ENABLED?: string;
  /** "true" includes the "Ask Harry" corner chat (T11.4); set once the assistant service is installed (T11.6). */
  readonly PUBLIC_ASSISTANT_ENABLED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
