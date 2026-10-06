/**
 * docker/deploy/update.sh with stand-ins for `docker` and `curl` (ADR 0012): Cloudflare's cache is
 * purged exactly when the web image changed, the token stays out of arguments and output, and a failed
 * purge is retried on the next run.
 */
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const SCRIPT = join(import.meta.dir, '..', '..', 'docker', 'deploy', 'update.sh');
const TOKEN = 'cf-test-token-should-never-leak';

let dir: string;

/** Fake binaries: `docker` serves image IDs from files, `curl` logs its arguments and stdin. */
function setUp(): void {
  dir = mkdtempSync(join(tmpdir(), 'update-sh-'));
  const bin = join(dir, 'bin');
  mkdirSync(bin);
  cpSync(SCRIPT, join(dir, 'update.sh'));
  writeFileSync(join(dir, 'image'), 'sha256:old\n');
  writeFileSync(
    join(bin, 'docker'),
    `#!/usr/bin/env bash
echo "docker $*" >> "${dir}/calls"
case "$*" in
  "compose images -q web") cat "${dir}/image" ;;
  "compose pull --quiet") [ -f "${dir}/next" ] && cp "${dir}/next" "${dir}/image" || true ;;
esac
`,
    { mode: 0o755 },
  );
  writeFileSync(
    join(bin, 'curl'),
    `#!/usr/bin/env bash
echo "curl $*" >> "${dir}/calls"
cat >> "${dir}/curl-stdin"
cat "${dir}/curl-response" 2>/dev/null || echo '{"success":true}'
`,
    { mode: 0o755 },
  );
}

function run(): { code: number; output: string } {
  const result = Bun.spawnSync(['bash', join(dir, 'update.sh')], {
    env: { PATH: `${join(dir, 'bin')}:/usr/bin:/bin` },
  });
  return { code: result.exitCode, output: result.stdout.toString() + result.stderr.toString() };
}

const calls = (): string => (existsSync(join(dir, 'calls')) ? readFileSync(join(dir, 'calls'), 'utf8') : '');
const purged = (): boolean => calls().includes('purge_cache');
const newWebImage = (): void => writeFileSync(join(dir, 'next'), 'sha256:new\n');
const configure = (extra = ''): void =>
  writeFileSync(
    join(dir, '.env'),
    `STATS_ADMIN_TOKEN=x\nCF_API_TOKEN="${TOKEN}"\nCF_ZONE_ID=zone123\n${extra}`,
  );

beforeEach(setUp);
afterEach(() => rmSync(dir, { recursive: true, force: true }));

describe('update.sh', () => {
  it('does not purge when the web image is unchanged', () => {
    configure();
    expect(run().code).toBe(0);
    expect(calls()).toContain('docker compose up -d --remove-orphans --wait --wait-timeout 180');
    expect(purged()).toBe(false);
  });

  it('purges only this hostname after a new web image is healthy, keeping the token secret', () => {
    configure();
    newWebImage();
    const { code, output } = run();
    expect(code).toBe(0);
    expect(output).toContain('purged Cloudflare cache for harry.mardika.my.id');
    const log = calls();
    expect(log.indexOf('compose up')).toBeLessThan(log.indexOf('purge_cache'));
    expect(log).toContain('https://api.cloudflare.com/client/v4/zones/zone123/purge_cache');
    expect(log).toContain('{"hosts":["harry.mardika.my.id"]}');
    // The token travels on stdin as a header, never as an argument or in the output.
    expect(log).not.toContain(TOKEN);
    expect(output).not.toContain(TOKEN);
    expect(readFileSync(join(dir, 'curl-stdin'), 'utf8')).toBe(`Authorization: Bearer ${TOKEN}\n`);
    expect(existsSync(join(dir, '.purge-pending'))).toBe(false);
  });

  it('honors SITE_HOST from .env', () => {
    configure('SITE_HOST=staging.example.com\n');
    newWebImage();
    run();
    expect(calls()).toContain('{"hosts":["staging.example.com"]}');
  });

  it('fails and retries on the next run when the purge fails', () => {
    configure();
    newWebImage();
    writeFileSync(join(dir, 'curl-response'), '{"success":false,"errors":[{"code":10000}]}');
    const first = run();
    expect(first.code).not.toBe(0);
    expect(existsSync(join(dir, '.purge-pending'))).toBe(true);

    // Same image now, but the purge is still owed.
    rmSync(join(dir, 'curl-response'));
    rmSync(join(dir, 'calls'));
    expect(run().code).toBe(0);
    expect(purged()).toBe(true);
    expect(existsSync(join(dir, '.purge-pending'))).toBe(false);
  });

  it('skips the purge without Cloudflare settings and keeps deploying', () => {
    writeFileSync(join(dir, '.env'), 'STATS_ADMIN_TOKEN=x\n');
    newWebImage();
    const { code, output } = run();
    expect(code).toBe(0);
    expect(output).toContain('skipping the Cloudflare cache purge');
    expect(purged()).toBe(false);
  });
});
