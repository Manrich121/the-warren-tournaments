/**
 * Input sanitization utilities for preventing XSS attacks
 * Used for search inputs and typeahead highlighted text
 */

/**
 * Escapes HTML entities to prevent XSS attacks
 * @param input - The string to sanitize
 * @returns Sanitized string with HTML entities escaped
 * @example
 * sanitizeInput('<script>alert("XSS")</script>')
 * // Returns: '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;'
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Highlights matched text in a string by wrapping it with <mark> tags
 * @param text - The full text to search in
 * @param query - The search query to highlight
 * @returns HTML string with highlighted matches (sanitized)
 * @example
 * highlightMatch('John Doe', 'doe')
 * // Returns: 'John <mark>Doe</mark>'
 */
export function highlightMatch(text: string, query: string): string {
  if (!query.trim()) {
    return sanitizeInput(text);
  }

  // Escape special regex characters in the query
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Case-insensitive substring matching
  const regex = new RegExp(`(${escapedQuery})`, 'gi');

  // First sanitize the entire text to prevent XSS
  const sanitizedText = sanitizeInput(text);

  // Then apply highlighting (safe because text is already sanitized)
  return sanitizedText.replace(new RegExp(`(${sanitizeInput(query)})`, 'gi'), '<mark>$1</mark>');
}
