import { describe, expect, it } from 'bun:test';

import { DEFAULT_SITE_URL, resolveSiteUrl } from '@/lib/site';

describe('resolveSiteUrl', () => {
  it('falls back to the production URL when the env value is missing or blank', () => {
    expect(resolveSiteUrl(undefined)).toBe(DEFAULT_SITE_URL);
    expect(resolveSiteUrl('   ')).toBe(DEFAULT_SITE_URL);
  });

  it('normalizes a valid URL to its origin', () => {
    expect(resolveSiteUrl('http://localhost:4321/some/path')).toBe('http://localhost:4321');
  });

  it('rejects a value that is not an absolute URL', () => {
    expect(() => resolveSiteUrl('harry.mardika.my.id')).toThrow();
  });
});
