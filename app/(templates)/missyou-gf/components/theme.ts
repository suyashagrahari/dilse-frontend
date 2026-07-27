// ─── Miss You — shared design tokens (night layer + fonts) ───────────────────
// Night-layer tokens live in the template scope only. Do NOT mutate global
// --site-* tokens. Fonts come from the CSS vars set in this template's layout.tsx
// (Space Grotesk / Caveat / Inter, all display:"optional").

/** Font stacks for the editor/publish CHROME only (the recipient-facing gift uses
 *  components/missyou.css tokens). Kept on a clean sans + script fallback. */
export const FONT_HEADING =
  "var(--font-inter), 'Inter', 'Segoe UI', system-ui, sans-serif";
export const FONT_BODY =
  "var(--font-inter), 'Inter', system-ui, -apple-system, sans-serif";
export const FONT_SCRIPT =
  "var(--font-script), 'Dancing Script', 'Segoe Script', cursive";

/** Night-layer palette (immersive viewer). All pairs contrast-verified in 01-design §1.3. */
export const NIGHT = {
  base: "#12101F", // --mu-night
  base2: "#1B1830", // --mu-night-2 (card)
  raised: "#241F3D", // pressed/active tiles, modals over night
  gradient: "linear-gradient(180deg,#12101F 0%,#1B1830 100%)",
  onNight: "#FFFFFF",
  mutedNight: "#B8B3D6", // --mu-muted-night (9.34:1)
  indigoLt: "#B7ADFF", // --mu-indigo-lt small indigo text on night (9.32:1)
  pink: "#F72585", // --site-accent-2 (4.96:1 on night)
  pinkLt: "#FF6FB0", // --mu-pink-lt handwriting on night (7.28:1)
  lime: "#C6FF3D", // --site-accent-3 CTA fill (15.87:1)
  amber: "#FFB020", // stars / decoration (10.26:1)
  borderNight: "rgba(255,255,255,.10)",
  hairline: "rgba(183,173,255,.18)",
} as const;

/** Light-layer palette (letter paper + editor + overlays). */
export const LIGHT = {
  bg: "#FAFAF7", // --site-bg
  surface: "#FFFFFF",
  surfaceAlt: "#EFEDFD",
  text: "#0E0E12", // --site-text
  muted: "#5B5B66", // --site-text-muted
  border: "#ECEAE3", // --site-border
  indigo: "#6C5CE7", // --site-accent
  indigoStrong: "#5646C9", // small indigo text on light (6.74:1)
  pinkDark: "#C81E6E", // --mu-pink-dark pink small text on light (5.43:1)
  lime: "#C6FF3D",
} as const;

/** Brand gradient (share / OG / "Make your own" CTA / seal wax). */
export const BRAND_GRADIENT = "linear-gradient(135deg,#6C5CE7,#F72585)";

/** Accent tint → resolved accent hex on the night layer. */
export const tintAccent = (tint: "indigo" | "pink"): string =>
  tint === "pink" ? NIGHT.pinkLt : NIGHT.indigoLt;

export const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];
export const EASE_SOFT: [number, number, number, number] = [0.4, 0, 0.2, 1];

/** True when the user prefers reduced motion (SSR-safe, re-checked in a hook below). */
export const prefersReducedMotion = (): boolean =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches === true;
