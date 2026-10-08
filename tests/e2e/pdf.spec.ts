/**
 * Checks the generated PDFs themselves (scripts/generate-pdf.ts), not just the print pages:
 * page count, selectable text, no phone number, size budget, and document title.
 */
import { expect, test } from '@playwright/test';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

import type { TextItem } from 'pdfjs-dist/types/src/display/api';

import { localize } from '../../src/lib/content/localize';
import { variantDownloads } from '../../src/lib/downloads';
import { cvVariants } from './helpers';

async function readPdf(bytes: Buffer) {
  const doc = await getDocument({ data: new Uint8Array(bytes), useSystemFonts: false }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const content = await (await doc.getPage(i)).getTextContent();
    pages.push(content.items.map((item) => (item as TextItem).str ?? '').join(' '));
  }
  const { info } = (await doc.getMetadata()) as { info: { Title?: string } };
  // pdf.js returns spaces as separate items; collapse runs of whitespace before matching.
  return { numPages: doc.numPages, text: pages.join('\n').replace(/\s+/g, ' '), title: info.Title ?? '' };
}

const CASES: { file: string; maxPages: number; maxBytes: number; mustContain: string[] }[] = [
  {
    file: 'Harry-Mardika-CV-EN.pdf',
    maxPages: 2,
    maxBytes: 1_000_000,
    mustContain: ['EXPERIENCE', 'Decklify'],
  },
  {
    file: 'Harry-Mardika-CV-ID.pdf',
    maxPages: 2,
    maxBytes: 1_000_000,
    mustContain: ['PENGALAMAN', 'Memimpin pengembangan'],
  },
  {
    file: 'Harry-Mardika-Portfolio-EN.pdf',
    maxPages: 8,
    maxBytes: 3_000_000,
    mustContain: ['Selected work'],
  },
  {
    file: 'Harry-Mardika-Portfolio-ID.pdf',
    maxPages: 8,
    maxBytes: 3_000_000,
    mustContain: ['Karya pilihan'],
  },
];

// CV variants (T10.2): same budgets as the general CV, and the variant's own role line.
for (const variant of cvVariants()) {
  for (const download of variantDownloads('Harry Mardika', [variant])) {
    CASES.push({
      file: download.file,
      maxPages: 2,
      maxBytes: 1_000_000,
      mustContain: [localize(variant.role, download.locale)],
    });
  }
}

for (const { file, maxPages, maxBytes, mustContain } of CASES) {
  test(`${file} is generated with selectable text and no phone number`, async ({ request }) => {
    test.skip(test.info().project.name !== 'desktop', 'PDF content does not depend on the browser viewport');
    const response = await request.get(`/downloads/${file}`);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('pdf');

    const bytes = await response.body();
    expect(bytes.length).toBeLessThan(maxBytes);

    const pdf = await readPdf(bytes);
    expect(pdf.numPages).toBeGreaterThan(0);
    expect(pdf.numPages).toBeLessThanOrEqual(maxPages);
    expect(pdf.title).toContain('Harry Mardika');
    expect(pdf.text).toContain('Harry Mardika');
    // Case-insensitive: CSS text-transform turns some headings into capitals in the PDF text.
    for (const phrase of mustContain) expect(pdf.text.toLowerCase()).toContain(phrase.toLowerCase());
    expect(pdf.text).not.toMatch(/(\+?62|\b08)[\d\s-]{8,}/);
    expect(pdf.text).not.toContain('**');
  });
}
