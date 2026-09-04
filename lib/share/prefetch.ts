// ─── What to fetch while the loader is on screen ─────────────────────────────
//
// The brand loader now holds for a moment so its reveal can finish. That time
// is spent, so it may as well buy something: the photos in the page are warmed
// while it plays, and the recipient's page arrives with its images already in
// the browser cache instead of popping in one by one afterwards.
//
// ── WHY ONLY http(s) ────────────────────────────────────────────────────────
//
// 38 of the 43 templates store their photos as base64 data URLs inside the Mongo
// document, so those images are already in memory the moment the payload lands —
// warming them would decode the same bytes twice for nothing. Only real network
// URLs are worth a head start, which in practice means the CDN.
//
// ── AND WHY IT IS CAPPED ────────────────────────────────────────────────────
//
// A rewind or a loveflix page can carry dozens of photos. Firing all of them at
// once on a phone on 3G competes with the viewer's own JavaScript chunk, which
// is the thing actually standing between the recipient and their page. The first
// few are what they see first; the rest arrive as they scroll, which is what
// scrolling is for.
//
// No imports on purpose: this module is loaded by `node --test` with type
// stripping, which cannot resolve the app's path aliases.

/** How many images get a head start. */
export const WARM_LIMIT = 6;

/** Depth guard for the walk. Payloads are shallow; a cycle is a bug elsewhere. */
const MAX_DEPTH = 6;

const IMAGE_EXT = /\.(jpe?g|png|webp|gif|avif|bmp|svg)(\?|#|$)/i;
/** Our own bucket serves images with no extension in the key. */
const MEDIA_HOST = /(^|\.)cdn\.subhsandesh\.in$/i;

/**
 * Is this string a network image worth warming?
 *
 * Exported because "what counts as an image URL" is the part of this worth
 * testing, and it is easier to be sure about it in isolation than through a
 * walk over a nested payload.
 */
export function isWarmableImageUrl(value: unknown): boolean {
  if (typeof value !== "string") return false;
  const url = value.trim();
  if (url.length < 12 || url.length > 2048) return false;
  if (!/^https?:\/\//i.test(url)) return false;

  let host = "";
  let path = "";
  try {
    const parsed = new URL(url);
    host = parsed.hostname;
    path = parsed.pathname;
  } catch {
    return false;
  }

  return MEDIA_HOST.test(host) || IMAGE_EXT.test(path);
}

/**
 * Every warmable image URL in a page payload, in the order it appears.
 *
 * Order matters: the first photos in the document are the ones the template
 * shows first, so taking the first N is taking the ones that are about to be
 * looked at.
 */
export function collectImageUrls(payload: unknown, limit: number = WARM_LIMIT): string[] {
  const found: string[] = [];
  const seen = new Set<string>();
  const visited = new WeakSet<object>();

  const walk = (value: unknown, depth: number): void => {
    if (found.length >= limit || depth > MAX_DEPTH) return;

    if (typeof value === "string") {
      if (isWarmableImageUrl(value) && !seen.has(value)) {
        seen.add(value);
        found.push(value.trim());
      }
      return;
    }

    if (!value || typeof value !== "object") return;
    if (visited.has(value as object)) return;
    visited.add(value as object);

    if (Array.isArray(value)) {
      for (const item of value) walk(item, depth + 1);
      return;
    }

    for (const inner of Object.values(value as Record<string, unknown>)) {
      walk(inner, depth + 1);
    }
  };

  walk(payload, 0);
  return found;
}

/**
 * Ask the browser to fetch these images, and resolve when it has — or when
 * `budgetMs` runs out, whichever comes first.
 *
 * The budget is the point. This runs inside a wait the recipient is already
 * doing; it must never make that wait LONGER because a photo is slow. A failed
 * warm is not an error either — the viewer will request the same URL again and
 * handle it the way it always did.
 */
export function warmImages(urls: string[], budgetMs: number): Promise<void> {
  if (typeof window === "undefined" || urls.length === 0 || budgetMs <= 0) {
    return Promise.resolve();
  }

  const all = Promise.all(
    urls.map(
      (url) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          // Decoding is the expensive half and can be done off the main thread
          // here, so the viewer does not do it during its own first paint.
          img.decoding = "async";
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = url;
        })
    )
  ).then(() => undefined);

  const budget = new Promise<void>((resolve) => setTimeout(resolve, budgetMs));
  return Promise.race([all, budget]);
}
