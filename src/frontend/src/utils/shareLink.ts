/**
 * Utilities for building and parsing share link URLs
 */

/**
 * Builds a complete share URL with the decryption key in the hash fragment
 * @param shareId - The share identifier from the backend
 * @param key - The base64-encoded decryption key
 * @returns The complete share URL
 */
export function buildShareUrl(shareId: string, key: string): string {
  const origin = window.location.origin;
  return `${origin}/s/${shareId}#k=${encodeURIComponent(key)}`;
}
