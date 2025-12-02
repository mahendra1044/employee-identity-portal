/**
 * Formatting and transformation utilities
 */

/**
 * Convert object to key-value pairs for display
 */
export function toPairs(obj: any): Array<{ k: string; v: any }> {
  if (typeof obj !== "object" || obj === null) return [];
  return Object.entries(obj).map(([k, v]) => ({ k, v }));
}
