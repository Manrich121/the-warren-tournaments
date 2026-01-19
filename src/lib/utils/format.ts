
export const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('en-UK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Formats a date range for display in a compact, human-readable format.
 *
 * Format: "MMM D - MMM D" or "MMM D - MMM D, YYYY" if spanning years
 *
 * @param startDate - Start date of the range
 * @param endDate - End date of the range
 * @returns Formatted date range string
 *
 * @example
 * ```typescript
 * const range = formatDateRange(
 *   new Date('2024-06-01'),
 *   new Date('2024-08-31')
 * );
 * // Returns "Jun 1 - Aug 31"
 *
 * const crossYearRange = formatDateRange(
 *   new Date('2024-12-01'),
 *   new Date('2025-02-28')
 * );
 * // Returns "Dec 1, 2024 - Feb 28, 2025"
 * ```
 */
export function formatDateRange(startDate: Date | string, endDate: Date | string): string {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const startYear = start.getFullYear();
  const endYear = end.getFullYear();

  const formatOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric'
  };

  const startFormatted = start.toLocaleDateString('en-UK', formatOptions);
  const endFormatted = end.toLocaleDateString('en-UK', formatOptions);

  return `${startFormatted} ${startYear} - ${endFormatted} ${endYear}`;
}
