import { describe, expect, it } from 'bun:test';
import { createHash } from 'node:crypto';

import { buildCsp, inlineScripts, scriptHash } from '@/lib/security/csp';

describe('inlineScripts', () => {
  it('collects executable inline scripts and skips external and data scripts', () => {
    const html = `
      <script>theme()</script>
      <script type="module">import "./a.js"</script>
      <script type="module" src="/_astro/x.js"></script>
      <script type="application/ld+json">{"@type":"Person"}</script>
      <SCRIPT type='text/javascript'>legacy()</SCRIPT>`;
    expect(inlineScripts(html)).toEqual(['theme()', 'import "./a.js"', 'legacy()']);
  });
});

describe('scriptHash', () => {
  it('matches the browser algorithm: base64 SHA-256 of the exact script text', () => {
    const expected = createHash('sha256').update('alert(1)').digest('base64');
    expect(scriptHash('alert(1)')).toBe(`'sha256-${expected}'`);
  });
});

describe('buildCsp', () => {
  it('allows inline scripts only by hash and never with unsafe-inline', () => {
    const policy = buildCsp(["'sha256-b'", "'sha256-a'", "'sha256-a'"]);
    const scriptSrc = policy.split('; ').find((d) => d.startsWith('script-src'));
    expect(scriptSrc).toBe("script-src 'self' 'sha256-a' 'sha256-b'");
    expect(policy).toContain("frame-ancestors 'none'");
    expect(policy).toContain("object-src 'none'");
  });
});
