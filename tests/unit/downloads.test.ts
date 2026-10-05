import { describe, expect, it } from 'bun:test';

import { allDownloads, downloadFileName, downloadPath, fileSlug, printPath } from '@/lib/downloads';

describe('downloads', () => {
  it('builds stable, URL-safe file names', () => {
    expect(fileSlug('Harry Mardika')).toBe('Harry-Mardika');
    expect(fileSlug('  José  O’Neil ')).toBe('Jose-O-Neil');
    expect(downloadFileName('Harry Mardika', 'cv', 'en')).toBe('Harry-Mardika-CV-EN.pdf');
    expect(downloadFileName('Harry Mardika', 'portfolio', 'id')).toBe('Harry-Mardika-Portfolio-ID.pdf');
  });

  it('points at the downloads folder and the localized print pages', () => {
    expect(downloadPath('Harry Mardika', 'cv', 'id')).toBe('/downloads/Harry-Mardika-CV-ID.pdf');
    expect(printPath('cv', 'en')).toBe('/print/cv/');
    expect(printPath('portfolio', 'id')).toBe('/id/print/portfolio/');
  });

  it('lists each kind in each locale', () => {
    expect(allDownloads('Harry Mardika').map((d) => d.file)).toEqual([
      'Harry-Mardika-CV-EN.pdf',
      'Harry-Mardika-CV-ID.pdf',
      'Harry-Mardika-Portfolio-EN.pdf',
      'Harry-Mardika-Portfolio-ID.pdf',
    ]);
  });
});
