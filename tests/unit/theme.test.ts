import { describe, expect, it } from 'bun:test';

import { effectiveTheme, isTheme, toggledTheme } from '@/lib/theme';

describe('theme', () => {
  it('uses a stored choice over the OS preference', () => {
    expect(effectiveTheme('light', true)).toBe('light');
    expect(effectiveTheme('dark', false)).toBe('dark');
  });

  it('follows the OS preference when nothing valid is stored', () => {
    expect(effectiveTheme(null, true)).toBe('dark');
    expect(effectiveTheme('purple', false)).toBe('light');
  });

  it('toggles between light and dark', () => {
    expect(toggledTheme('light')).toBe('dark');
    expect(toggledTheme('dark')).toBe('light');
  });

  it('recognizes valid themes only', () => {
    expect(isTheme('dark')).toBe(true);
    expect(isTheme('system')).toBe(false);
  });
});
