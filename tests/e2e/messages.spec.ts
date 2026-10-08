/**
 * "Kind words" / "Kesan & pesan" (T9.4). The e2e build reads tests/fixtures/messages.yaml
 * (MESSAGES_FILE), so these fictional messages never reach the real site.
 */
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

import { UI } from '../../src/lib/i18n/ui';

test('the home page shows the messages in file order, with the writer and context @fixture', async ({
  page,
}) => {
  await page.goto('/');
  const section = page.getByRole('region', { name: UI.en['messages.title'] });
  await expect(section.locator('blockquote')).toHaveCount(2);
  await expect(section.locator('blockquote').first()).toContainText('shipping a product in 3 months');
  await expect(section.locator('figcaption').first()).toContainText(
    'Head of Testing, Example Corp · Manager at Example Corp',
  );
  // A message without a role shows only the relationship.
  await expect(section.locator('figcaption').nth(1)).toContainText('Test Learner');
  await expect(section.locator('figcaption').nth(1)).not.toContainText('·');
  await expect(section.getByRole('link', { name: 'Profile of Test Manager' })).toHaveAttribute(
    'href',
    'https://example.com/test-manager',
  );
});

test('the Indonesian home page translates messages and marks untranslated ones as English @fixture', async ({
  page,
}) => {
  await page.goto('/id/');
  const section = page.getByRole('region', { name: UI.id['messages.title'] });
  await expect(section.locator('blockquote').first()).toContainText('peluncuran produk dalam 3 bulan');
  await expect(section.locator('blockquote').first()).not.toHaveAttribute('lang', 'en');
  await expect(section.locator('blockquote').nth(1)).toHaveAttribute('lang', 'en');
});

for (const colorScheme of ['light', 'dark'] as const) {
  test(`the messages section has no serious accessibility violations (${colorScheme}) @fixture`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme });
    await page.goto('/');
    const results = await new AxeBuilder({ page })
      .include('#messages')
      .withTags(['wcag2a', 'wcag2aa', 'wcag22aa'])
      .analyze();
    const serious = results.violations
      .filter((v) => v.impact === 'serious' || v.impact === 'critical')
      .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
    expect(serious).toEqual([]);
  });
}
