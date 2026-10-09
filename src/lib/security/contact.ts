/**
 * Contact details in free text: one rule for the "Kind words" form, its AI translations, and the content
 * check that keeps phone numbers out of the repository (AGENTS.md §3). Pure.
 *
 * Phone numbers count digits, so dates ("08-10-2024") and amounts ("Rp 62 000 000") pass while
 * "0812.3456.7890", "(0812) 3456-7890", "62 812 3456 7890", and "+1 415 555 0100" do not. Domain endings
 * are matched in lower case only, so names such as ASP.NET or Socket.IO are not taken for addresses.
 */
export const PHONE_PATTERN = /(?:\+?\b62|\b0)[\s.\-()]*8(?:[\s.\-()]*\d){7,}|\+\d(?:[\s.\-()]*\d){7,}/;
export const EMAIL_PATTERN = /[^\s@]+@[^\s@]+\.[a-z]{2,}/i;
export const URL_PATTERN = /https?:\/\/|www\.|\b[A-Za-z0-9-]+\.(?:com|net|org|io|id|co|me|app|dev|xyz)\b/;

/** A phone number, e-mail address, or web address in free text. */
export function hasContactDetails(value: string): boolean {
  return PHONE_PATTERN.test(value) || EMAIL_PATTERN.test(value) || URL_PATTERN.test(value);
}
