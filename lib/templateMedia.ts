// ─── Media origin ────────────────────────────────────────────────────────────
//
// Every remote asset this app renders — template covers, the document animation
// set, the apology-dashboard audio — is served from object storage, not from the
// repo.
//
// Why not /public: these are binary blobs that never diff usefully, they are
// identical in every environment, and together they would add ~1.8 MB to the git
// history, the Docker image and every deploy. The source of truth lives outside
// both repos at <workspace>/media-src, object storage is the origin, and the
// repo carries only these URLs.
//
// Objects are written with `public, max-age=31536000, immutable` and stable
// keys, so a browser fetches each one exactly once and a CDN can hold it
// forever. Re-running the uploader replaces an object in place without changing
// its URL:
//
//     cd server && npm run upload:template-media
//     cd server && npm run upload:template-media -- --only=train-ticket --dry
//
// ── MOVING BEHIND A CDN IS ONE ENVIRONMENT VARIABLE ──────────────────────────
//
// `NEXT_PUBLIC_MEDIA_ORIGIN` replaces the scheme+host and nothing else — the
// `/gifts-media/...` key path is preserved, because that is the object key and
// it does not change just because the edge in front of it did:
//
//     NEXT_PUBLIC_MEDIA_ORIGIN=https://cdn.subhsandesh.in
//
// It is deliberately NOT set by default. As of this writing the distribution at
// cdn.subhsandesh.in answers AccessDenied on every path — including keys that
// are public and return 200 straight from the bucket — which means its origin is
// not this bucket. Setting the variable before that is fixed would break every
// image on the site rather than speed one up. Verify a real key end to end
// through the CDN first, then set it.
//
// Whatever host is used must also be listed in `next.config.ts` `remotePatterns`
// or `next/image` will refuse to optimise it. Both the bucket and
// cdn.subhsandesh.in are already listed.

/** Scheme + host only. Override to move every asset behind a CDN at once. */
export const MEDIA_ORIGIN =
  process.env.NEXT_PUBLIC_MEDIA_ORIGIN?.replace(/\/+$/, "") ||
  "https://gifts-media-prod-123.s3.ap-south-1.amazonaws.com";

/**
 * The key prefix every object shares. Mirrors `S3_UPLOAD_PREFIX` on the server
 * (see `uploadTemplateMedia.ts`), so the two halves cannot drift apart silently.
 */
export const MEDIA_PREFIX = "gifts-media";

/** Origin + prefix. Everything below is built from this. */
export const MEDIA_BASE = `${MEDIA_ORIGIN}/${MEDIA_PREFIX}`;

/** Resolve any object by its key path below the prefix, e.g. "bouquet-gf/cover.webp". */
export const media = (keyPath: string): string => `${MEDIA_BASE}/${keyPath.replace(/^\/+/, "")}`;

/** Where the per-template folders live. */
export const TEMPLATE_MEDIA_BASE = `${MEDIA_BASE}/templates`;

/** Base URL for one template's media folder. */
export const templateMediaBase = (slug: string): string => `${TEMPLATE_MEDIA_BASE}/${slug}`;

/** Resolve a single asset, e.g. templateMedia("train-ticket", "hug.webm"). */
export const templateMedia = (slug: string, file: string): string =>
  `${TEMPLATE_MEDIA_BASE}/${slug}/${file}`;
