// Utility: formatDate
/**
 * Format an ISO date string into a readable format
 * Examples: "2025-01-15" → "January 15, 2025" or "Jan 15, 2025"
 */
export function formatDate(
  dateString: string,
  format: "long" | "short" = "long"
): string {
  try {
    const date = new Date(dateString);

    // Validate date
    if (isNaN(date.getTime())) {
      return dateString; // Return original if invalid
    }

    if (format === "short") {
      // "Jan 15, 2025"
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }

    // "January 15, 2025" (default)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}
