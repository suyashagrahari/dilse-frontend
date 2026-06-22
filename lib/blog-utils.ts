/** Small formatting helpers shared across the blog UI. */

export function formatDate(iso?: string | null): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

/** Estimate reading time (words / 200 wpm), used when Strapi hasn't computed one. */
export function readingMinutes(words: number): number {
  return Math.max(1, Math.round(words / 200));
}
