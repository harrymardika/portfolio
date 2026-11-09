/**
 * Publications (T17.0b, D33). Pure helpers shared by About, the CV, the portfolio, and the assistant.
 */
import type { Publication } from './schemas';

/** The paper's public link: its DOI through the resolver, else its URL; nothing before it is out. */
export const publicationLink = (paper: Pick<Publication, 'doi' | 'url'>): string | undefined =>
  paper.doi ? `https://doi.org/${paper.doi}` : paper.url;

/** "Venue, Vol. 7, No. 4": the venue with its volume and issue when known. */
export const publicationVenue = (paper: Pick<Publication, 'venue' | 'details'>): string =>
  paper.details ? `${paper.venue}, ${paper.details}` : paper.venue;
