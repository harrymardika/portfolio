#!/usr/bin/env bun
/**
 * Fails when a raw hex color appears outside src/styles/tokens.css
 * (docs/05-coding-standards.md §5: components use design tokens only).
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = join(import.meta.dir, '..');
const SCAN_DIR = join(ROOT, 'src');
const ALLOWED = new Set(['src/styles/tokens.css']);
const EXTENSIONS = ['.astro', '.ts', '.css'];
const HEX = /#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b/g;

function* walk(dir: string): Generator<string> {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* walk(path);
    else if (EXTENSIONS.some((ext) => name.endsWith(ext))) yield path;
  }
}

const violations: string[] = [];
for (const file of walk(SCAN_DIR)) {
  const rel = relative(ROOT, file);
  if (ALLOWED.has(rel)) continue;
  readFileSync(file, 'utf8')
    .split('\n')
    .forEach((line, index) => {
      for (const match of line.matchAll(HEX)) violations.push(`${rel}:${index + 1}  ${match[0]}`);
    });
}

if (violations.length > 0) {
  console.error('Raw hex colors found. Use a token from src/styles/tokens.css instead:');
  for (const violation of violations) console.error(`  ${violation}`);
  process.exit(1);
}
console.log('No raw hex colors outside src/styles/tokens.css.');
