/**
 * Privacy rules for the stats service (docs/08-analytics.md §5). Pure apart from hashing.
 * No raw IP is ever stored: visitors are a daily salted hash that cannot be reversed or joined
 * across days once the salt is discarded.
 */
import { createHash } from 'node:crypto';

const BOT_PATTERN =
  /bot|crawl|spider|slurp|bingpreview|facebookexternalhit|embedly|preview|headless|lighthouse|pingdom|uptime|monitor|curl|wget|python-requests|httpclient|go-http-client|axios|node-fetch/i;

/** True for crawlers, link previews, monitors, and scripts, which are not counted. */
export function isBot(userAgent: string | null): boolean {
  return !userAgent || BOT_PATTERN.test(userAgent);
}

/** Do Not Track or Global Privacy Control: the visitor asked not to be counted. */
export function optedOut(headers: Headers): boolean {
  return headers.get('dnt') === '1' || headers.get('sec-gpc') === '1';
}

/** The visitor's address as seen through Cloudflare and Caddy, used only for hashing. */
export function clientAddress(headers: Headers): string {
  return (
    headers.get('cf-connecting-ip') ??
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headers.get('x-real-ip') ??
    'unknown'
  );
}

/** Two-letter country from Cloudflare, or null (also for Cloudflare's "XX"/"T1" placeholders). */
export function countryCode(headers: Headers): string | null {
  const code = headers.get('cf-ipcountry')?.toUpperCase() ?? '';
  return /^[A-Z]{2}$/.test(code) && code !== 'XX' && code !== 'T1' ? code : null;
}

/**
 * Host of a referrer URL, or null for direct visits, invalid values, and the site itself.
 * Only the host is kept so no full URLs (which can contain personal data) are stored.
 */
export function referrerHost(referrer: string | undefined, siteHost: string): string | null {
  if (!referrer) return null;
  try {
    const host = new URL(referrer).hostname.toLowerCase().replace(/^www\./, '');
    return host && host !== siteHost.toLowerCase().replace(/^www\./, '') ? host : null;
  } catch {
    return null;
  }
}

/** Daily visitor id: SHA-256 of the day's secret salt, the address, and the user agent. */
export function visitorHash(salt: string, address: string, userAgent: string): string {
  return createHash('sha256').update(`${salt}\n${address}\n${userAgent}`).digest('hex').slice(0, 32);
}

/** UTC day key, e.g. "2026-10-05". */
export function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}
