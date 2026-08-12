/**
 * The template slugs that can appear on the Wall.
 *
 * Mirrors WALL_TEMPLATES in `server/src/config/wallTemplates.ts`, which is the
 * authority — this copy exists only so `generateStaticParams` can pre-render one
 * page per filter at build time, without a network call.
 *
 * Drift is safe in both directions and cannot show anyone a wrong page:
 *   - a slug here that the server does not serve renders as an empty filter,
 *     which is the honest catalogue state
 *   - a slug missing here still works, because `dynamicParams` is left on and
 *     the route renders on demand
 *
 * Templates absent from this list are the ones with no two-person name pair —
 * see the header comment on the server file for why each is excluded.
 */
export const WALL_SLUGS = [
  "birthday-gf",
  "valentine-gf",
  "holi",
  "eid-mubarak",
  "love-gf",
  "darling",
  "apology-dashboard",
  "missyou-gf",
  "bouquet-gf",
  "proposal",
  "hold-my-hand",
  "vending-machine",
  "catch",
  "date-invitation",
  "photo-puzzle",
  "loveflix",
  "rewind",
  "streak",
  "dedication",
  "searched",
  "capsule",
  "us",
  "call",
  "court-of-love",
  "legal-notice",
  "flags",
  "wedding-shaadi",
  "reception",
  "shaadi-card",
  "christian-wedding",
] as const;

export type WallSlug = (typeof WALL_SLUGS)[number];

export function isWallSlug(slug: string): boolean {
  return (WALL_SLUGS as readonly string[]).includes(slug);
}
