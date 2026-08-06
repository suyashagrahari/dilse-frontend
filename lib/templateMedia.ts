// ─── Template media origin ───────────────────────────────────────────────────
//
// The animation set for the document templates (court-marriage, hold-my-hand,
// train-ticket, legal-notice) is served from S3, not from the repo.
//
// Why not /public: these are binary blobs that never diff usefully, they are
// identical in every environment, and together they would add ~1.8 MB to the
// git history, the Docker image and every deploy. Instead the source of truth
// lives outside both repos at <workspace>/media-src/templates, S3 is the
// origin, and the repo carries only these URLs.
//
// Objects are written with `public, max-age=31536000, immutable` and stable
// keys, so a browser fetches each one exactly once and a CDN can hold it
// forever. Re-running the uploader replaces an object in place without changing
// its URL:
//
//     cd server && npm run upload:template-media
//     cd server && npm run upload:template-media -- --only=train-ticket --dry
//
// The bucket host is already whitelisted in next.config.ts `remotePatterns`, so
// next/image can optimise anything served from here.
//
// To move behind CloudFront later, change this one line — every consumer reads
// through `templateMedia()`.
export const TEMPLATE_MEDIA_BASE =
  "https://gifts-media-prod-123.s3.ap-south-1.amazonaws.com/gifts-media/templates";

/** Base URL for one template's media folder. */
export const templateMediaBase = (slug: string): string => `${TEMPLATE_MEDIA_BASE}/${slug}`;

/** Resolve a single asset, e.g. templateMedia("train-ticket", "hug.webm"). */
export const templateMedia = (slug: string, file: string): string =>
  `${TEMPLATE_MEDIA_BASE}/${slug}/${file}`;
