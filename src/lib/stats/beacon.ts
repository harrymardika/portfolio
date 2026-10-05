/**
 * Pure decisions for the page beacon (src/components/layout/StatsBeacon.astro).
 * Kept free of DOM access so every rule is unit-tested.
 */
import { type EventPayload } from './events';

import type { Locale } from '@/lib/i18n/locales';

/** localStorage key that allows sending from localhost (manual testing and e2e). */
export const STATS_DEBUG_KEY = 'stats:debug';

export interface BeaconEnvironment {
  /** PUBLIC_STATS_ENABLED at build time. */
  readonly enabled: boolean;
  readonly hostname: string;
  /** navigator.doNotTrack === '1' */
  readonly doNotTrack: boolean;
  /** navigator.globalPrivacyControl === true */
  readonly globalPrivacyControl: boolean;
  /** localStorage[STATS_DEBUG_KEY] === '1' */
  readonly debug: boolean;
}

const LOCAL_HOSTS = /^(localhost|127\.0\.0\.1|\[::1\]|0\.0\.0\.0)$/;

/** Send only in builds with stats enabled, respecting DNT/GPC, and never from localhost unless debugging. */
export function shouldSend(env: BeaconEnvironment): boolean {
  if (!env.enabled || env.doNotTrack || env.globalPrivacyControl) return false;
  return env.debug || !LOCAL_HOSTS.test(env.hostname);
}

const REF_PATTERN = /^[a-z0-9-]{1,60}$/;

/**
 * Page view payload. Only the path is sent (no query string); a valid `?ref=` value is extracted
 * for the owner's tracking links, and the referrer is passed through for the service to reduce to a host.
 */
export function pageviewPayload(
  location: { pathname: string; search: string },
  lang: Locale,
  referrer: string,
): EventPayload {
  const ref = new URLSearchParams(location.search).get('ref')?.toLowerCase() ?? '';
  return {
    type: 'pageview',
    path: location.pathname.slice(0, 200),
    lang,
    ...(referrer ? { referrer: referrer.slice(0, 500) } : {}),
    ...(REF_PATTERN.test(ref) ? { ref } : {}),
  };
}
