/**
 * Downloadable PDFs (docs/09-pdf-generation.md): file names, URLs, and the print pages they are made
 * from. Pure; shared by scripts/generate-pdf.ts and the download buttons so names never drift apart.
 */
import { LOCALES, localizePath, type Locale } from '@/lib/i18n';

export const DOWNLOAD_KINDS = ['cv', 'portfolio'] as const;
export type DownloadKind = (typeof DOWNLOAD_KINDS)[number];

/** Public folder (inside the build output) that holds the PDFs. */
export const DOWNLOADS_DIR = 'downloads';

const KIND_LABEL: Record<DownloadKind, string> = { cv: 'CV', portfolio: 'Portfolio' };

/** "Harry Mardika" → "Harry-Mardika", keeping letters and digits only. */
export function fileSlug(name: string): string {
  return name
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** e.g. "Harry-Mardika-CV-EN.pdf". Stable names, so shared links never break. */
export function downloadFileName(name: string, kind: DownloadKind, locale: Locale): string {
  return `${fileSlug(name)}-${KIND_LABEL[kind]}-${locale.toUpperCase()}.pdf`;
}

/** Site-relative URL of a PDF, e.g. "/downloads/Harry-Mardika-CV-EN.pdf". */
export function downloadPath(name: string, kind: DownloadKind, locale: Locale): string {
  return `/${DOWNLOADS_DIR}/${downloadFileName(name, kind, locale)}`;
}

/** The print page a PDF is generated from, e.g. "/id/print/cv/". */
export function printPath(kind: DownloadKind, locale: Locale): string {
  return localizePath(`/print/${kind}/`, locale);
}

export interface Download {
  kind: DownloadKind;
  locale: Locale;
  /** Path inside the downloads folder, e.g. "Harry-Mardika-CV-EN.pdf" or "cv/…-Data-Engineer-EN.pdf". */
  file: string;
  /** The print page it is made from. */
  source: string;
}

/** Every public PDF: each kind in each locale. */
export function allDownloads(name: string): Download[] {
  return DOWNLOAD_KINDS.flatMap((kind) =>
    LOCALES.map((locale) => ({
      kind,
      locale,
      file: downloadFileName(name, kind, locale),
      source: printPath(kind, locale),
    })),
  );
}

/**
 * Folder for the CV variants (T10.2, D10), listed on /cv/ and kept out of search results
 * (robots.txt disallows it).
 */
export const CV_VARIANTS_DIR = 'cv';

/** One PDF per CV variant and locale, e.g. "cv/Harry-Mardika-CV-Data-Engineer-EN.pdf". */
export function variantDownloads(
  name: string,
  variants: readonly { id: string; name: { en: string } }[],
): Download[] {
  return variants.flatMap((variant) =>
    LOCALES.map((locale) => ({
      kind: 'cv' as const,
      locale,
      file: `${CV_VARIANTS_DIR}/${fileSlug(name)}-CV-${fileSlug(variant.name.en)}-${locale.toUpperCase()}.pdf`,
      source: localizePath(`/print/cv/${variant.id}/`, locale),
    })),
  );
}
