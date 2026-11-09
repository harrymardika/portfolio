/**
 * Publications (T17.0b, D33). Pure helpers shared by About, the CV, the portfolio, and the assistant.
 */
import type { Publication } from './schemas';

/**
 * The paper's public link: its `url` (the article page) when given, else its DOI through the resolver;
 * nothing before it is out. A new DOI can take a while to resolve, so the article page goes first (T17.0d).
 */
export const publicationLink = (paper: Pick<Publication, 'doi' | 'url'>): string | undefined =>
  paper.url ?? (paper.doi ? `https://doi.org/${paper.doi}` : undefined);

/** "Venue, Vol. 7, No. 4": the venue with its volume and issue when known. */
export const publicationVenue = (paper: Pick<Publication, 'venue' | 'details'>): string =>
  paper.details ? `${paper.venue}, ${paper.details}` : paper.venue;
