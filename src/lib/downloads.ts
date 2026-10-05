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

/** Every PDF to generate: each kind in each locale. */
export function allDownloads(
  name: string,
): { kind: DownloadKind; locale: Locale; file: string; source: string }[] {
  return DOWNLOAD_KINDS.flatMap((kind) =>
    LOCALES.map((locale) => ({
      kind,
      locale,
      file: downloadFileName(name, kind, locale),
      source: printPath(kind, locale),
    })),
  );
}
