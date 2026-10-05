import { describe, expect, it } from 'bun:test';

import { pageviewPayload, shouldSend, type BeaconEnvironment } from '@/lib/stats/beacon';
import { eventPayloadSchema } from '@/lib/stats/events';

const env = (extra: Partial<BeaconEnvironment> = {}): BeaconEnvironment => ({
  enabled: true,
  hostname: 'harry.mardika.my.id',
  doNotTrack: false,
  globalPrivacyControl: false,
  debug: false,
  ...extra,
});

describe('shouldSend', () => {
  it('sends from the real site when stats are enabled', () => {
    expect(shouldSend(env())).toBe(true);
  });

  it('never sends when disabled or when the visitor opted out', () => {
    expect(shouldSend(env({ enabled: false }))).toBe(false);
    expect(shouldSend(env({ doNotTrack: true }))).toBe(false);
    expect(shouldSend(env({ globalPrivacyControl: true }))).toBe(false);
    expect(shouldSend(env({ doNotTrack: true, debug: true }))).toBe(false);
  });

  it('skips localhost unless the debug flag is set', () => {
    for (const hostname of ['localhost', '127.0.0.1', '[::1]']) {
      expect(shouldSend(env({ hostname }))).toBe(false);
      expect(shouldSend(env({ hostname, debug: true }))).toBe(true);
    }
  });
});

describe('pageviewPayload', () => {
  it('sends the path only and extracts a valid ref', () => {
    const payload = pageviewPayload(
      { pathname: '/id/', search: '?ref=Acme-ML&utm_source=x' },
      'id',
      'https://www.linkedin.com/',
    );
    expect(payload).toEqual({
      type: 'pageview',
      path: '/id/',
      lang: 'id',
      referrer: 'https://www.linkedin.com/',
      ref: 'acme-ml',
    });
    expect(eventPayloadSchema.safeParse(payload).success).toBe(true);
  });

  it('drops invalid refs and empty referrers', () => {
    expect(pageviewPayload({ pathname: '/', search: '?ref=<script>' }, 'en', '')).toEqual({
      type: 'pageview',
      path: '/',
      lang: 'en',
    });
  });
});
