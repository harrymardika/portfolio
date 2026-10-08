import { describe, expect, it } from 'bun:test';

import { readFileSync } from 'node:fs';

import { SOCIAL_PLATFORMS } from '@/lib/content/schemas';
import { eventPayloadSchema, OUTBOUND_DETAILS } from '@/lib/stats/events';
import {
  clientAddress,
  countryCode,
  dayKey,
  isBot,
  optedOut,
  referrerHost,
  visitorHash,
} from '@/lib/stats/privacy';

describe('eventPayloadSchema', () => {
  it('accepts the three event types', () => {
    expect(
      eventPayloadSchema.safeParse({ type: 'pageview', path: '/', lang: 'en', ref: 'acme-ml' }).success,
    ).toBe(true);
    expect(
      eventPayloadSchema.safeParse({ type: 'download', path: '/', lang: 'id', detail: 'cv' }).success,
    ).toBe(true);
    expect(
      eventPayloadSchema.safeParse({ type: 'outbound', path: '/', lang: 'en', detail: 'github' }).success,
    ).toBe(true);
  });

  it('counts clicks on every social platform in profile.yaml, and nothing else', () => {
    expect([...OUTBOUND_DETAILS].sort()).toEqual([...SOCIAL_PLATFORMS].sort());
    // The beacon (an inline script) keeps its own allowlist; it must name every platform.
    const beacon = readFileSync('src/components/layout/StatsBeacon.astro', 'utf8');
    expect(OUTBOUND_DETAILS.filter((platform) => !beacon.includes(`outbound === '${platform}'`))).toEqual([]);
    expect(
      eventPayloadSchema.safeParse({ type: 'outbound', path: '/', lang: 'en', detail: 'medium' }).success,
    ).toBe(true);
  });

  it('rejects queries in paths, unknown fields, bad refs, and wrong details', () => {
    expect(eventPayloadSchema.safeParse({ type: 'pageview', path: '/?email=x', lang: 'en' }).success).toBe(
      false,
    );
    expect(
      eventPayloadSchema.safeParse({ type: 'pageview', path: '/', lang: 'en', ip: '1.2.3.4' }).success,
    ).toBe(false);
    expect(
      eventPayloadSchema.safeParse({ type: 'pageview', path: '/', lang: 'en', ref: 'Has Spaces' }).success,
    ).toBe(false);
    expect(
      eventPayloadSchema.safeParse({ type: 'download', path: '/', lang: 'en', detail: 'secrets' }).success,
    ).toBe(false);
    expect(eventPayloadSchema.safeParse({ type: 'pageview', path: '/', lang: 'fr' }).success).toBe(false);
  });
});

describe('privacy helpers', () => {
  it('detects bots, scripts, and missing user agents', () => {
    expect(isBot('Mozilla/5.0 (compatible; Googlebot/2.1)')).toBe(true);
    expect(isBot('curl/8.0')).toBe(true);
    expect(isBot(null)).toBe(true);
    expect(isBot('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/130 Safari/537.36')).toBe(false);
  });

  it('honors Do Not Track and Global Privacy Control', () => {
    expect(optedOut(new Headers({ dnt: '1' }))).toBe(true);
    expect(optedOut(new Headers({ 'sec-gpc': '1' }))).toBe(true);
    expect(optedOut(new Headers())).toBe(false);
  });

  it('prefers the Cloudflare address, then the first forwarded address', () => {
    expect(clientAddress(new Headers({ 'cf-connecting-ip': '1.1.1.1', 'x-forwarded-for': '2.2.2.2' }))).toBe(
      '1.1.1.1',
    );
    expect(clientAddress(new Headers({ 'x-forwarded-for': '2.2.2.2, 3.3.3.3' }))).toBe('2.2.2.2');
    expect(clientAddress(new Headers())).toBe('unknown');
  });

  it('keeps real country codes only', () => {
    expect(countryCode(new Headers({ 'cf-ipcountry': 'id' }))).toBe('ID');
    expect(countryCode(new Headers({ 'cf-ipcountry': 'XX' }))).toBeNull();
    expect(countryCode(new Headers({ 'cf-ipcountry': 'T1' }))).toBeNull();
    expect(countryCode(new Headers())).toBeNull();
  });

  it('reduces referrers to a host and drops self-referrals and junk', () => {
    expect(referrerHost('https://www.linkedin.com/in/someone?trk=abc', 'harry.mardika.my.id')).toBe(
      'linkedin.com',
    );
    expect(referrerHost('https://harry.mardika.my.id/projects/', 'harry.mardika.my.id')).toBeNull();
    expect(referrerHost('not a url', 'harry.mardika.my.id')).toBeNull();
    expect(referrerHost(undefined, 'harry.mardika.my.id')).toBeNull();
  });

  it('hashes visitors per salt so the same person is unlinkable across days', () => {
    const a = visitorHash('salt-day-1', '1.1.1.1', 'UA');
    expect(a).toBe(visitorHash('salt-day-1', '1.1.1.1', 'UA'));
    expect(a).not.toBe(visitorHash('salt-day-2', '1.1.1.1', 'UA'));
    expect(a).toHaveLength(32);
    expect(a).not.toContain('1.1.1.1');
  });

  it('uses UTC days', () => {
    expect(dayKey(new Date('2026-10-05T23:30:00-07:00'))).toBe('2026-10-06');
  });
});
