// ─── The wedding art's CDN address ──────────────────────────────────────────
//
// Every file under public/wedding-v3 is also on the media CDN (CloudFront →
// s3://subhsandesh-prod, key gifts-media/wedding-v3/<same path>), where it is
// served from an edge near the guest with a year-long immutable cache. The
// templates keep their asset tables as same-origin paths ("/wedding-v3/…") and
// pass them through `cdn()` only where the browser simply DRAWS the image: an
// <img>, a CSS background, a cover.
//
// Never for a CSS mask, a canvas, a fetch() or a server-side file read: the CDN
// sends no CORS header, so a masked or canvas-read CDN image fails silently.
// Those keep the plain path.
//
// No deploy uploads media. A new or changed file in public/wedding-v3 must be
// uploaded (aws s3 sync … --content-type … --cache-control "public,
// max-age=31536000, immutable") BEFORE code that shows it ships.

import { MEDIA_BASE } from "@/lib/templateMedia";

export const WEDDING_ART_CDN = `${MEDIA_BASE}/wedding-v3`;

/** "/wedding-v3/x.webp" → its CDN URL. Any other string comes back unchanged. */
export function cdn(src: string): string {
  return src.startsWith("/wedding-v3/") ? WEDDING_ART_CDN + src.slice("/wedding-v3".length) : src;
}
