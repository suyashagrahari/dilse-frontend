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
// That verification has now been done, and the CDN is the default below.
// cdn.subhsandesh.in is a CloudFront distribution in front of the
// s3://subhsandesh-prod bucket and returns 200 with the right content-type on
// real keys; the earlier AccessDenied readings were probes for keys that simply
// did not exist in that bucket yet, not a broken origin.
//
// Whatever host is used must also be listed in `next.config.ts` `remotePatterns`
// or `next/image` will refuse to optimise it. Both the bucket and
// cdn.subhsandesh.in are already listed.

/**
 * Scheme + host only. Override to move every asset to another origin at once.
 *
 * The default was `gifts-media-prod-123.s3.ap-south-1.amazonaws.com`, a bucket
 * in the OLD AWS account. That account is gone: every key answers 403
 * `AllAccessDisabled` and its IAM key answers `InvalidAccessKeyId`. The account
 * migration carried user uploads over — the prod box already runs
 * S3_BUCKET_NAME=subhsandesh-prod with S3_PUBLIC_BASE_URL=https://cdn.subhsandesh.in
 * — but the static template assets were never copied across, so every cover,
 * bloom, gif and clip resolved through here was broken. They have since been
 * re-uploaded into the new bucket under the same `gifts-media/` prefix, so the
 * key paths below are unchanged and only the origin moves.
 */
export const MEDIA_ORIGIN =
  process.env.NEXT_PUBLIC_MEDIA_ORIGIN?.replace(/\/+$/, "") ||
  "https://cdn.subhsandesh.in";

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
