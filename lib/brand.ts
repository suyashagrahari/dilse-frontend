/**
 * The brand palette, in one place.
 *
 * ── WHY HEX AND NOT CSS VARIABLES ───────────────────────────────────────────
 *
 * The `--site-*` custom properties that a palette like this is normally read
 * from do not exist in `app/globals.css` in this repo, and there is no
 * `data-sitetheme` attribute to hang them off. So the values are inlined, once,
 * and every surface that needs them imports from here. If a token layer lands
 * later, this file is the only thing that has to change.
 *
 * ── WHERE THESE VALUES COME FROM ────────────────────────────────────────────
 *
 * What the site actually ships. `components/home/*` uses #c9a84c around 200
 * times, #3d0c11 61 times and #f5ede6 31 times, and every admin page —
 * analytics, contacts, users, templates — is built from the same three.
 * Headings are Lora, the serif the landing uses, already loaded globally by the
 * root layout as `--font-lora`.
 *
 * This started life as the `C` object in `app/(app)/admin/users/[userId]/types.ts`,
 * which is still where the user-detail screen reads it from — that file now
 * re-exports this one. It moved here when the paywall needed the same palette,
 * because a shared component must not import from an admin page's internals.
 */
export const BRAND = {
  bg: "#f5ede6",
  bgAlt: "#faf3ee",
  surface: "#fffdfb",
  surfaceAlt: "#f7eee5",

  text: "#2a0a0e",
  muted: "#7f5f5f",
  faint: "#9a7070",
  border: "rgba(61,12,17,0.10)",
  borderStrong: "rgba(61,12,17,0.18)",

  /** Readable gold for links and icons — #c9a84c itself fails contrast on cream. */
  accent: "#8b5a2b",
  /** Deep maroon: primary buttons, active tabs. */
  accentStrong: "#3d0c11",
  /** The brand gold, for highlights and fills rather than small text. */
  gold: "#c9a84c",
  goldDeep: "#a8823a",

  ok: "#3aa76d",
  warn: "#a8823a",
  danger: "#a13540",

  radius: 12,
  radiusLg: 16,
  shadow: "0 2px 10px rgba(61,12,17,0.05)",
  shadowElevated: "0 24px 60px -18px rgba(26,5,7,0.42)",
  gradient: "linear-gradient(135deg,#3d0c11,#5a1620)",
} as const;

export type BrandPalette = typeof BRAND;
