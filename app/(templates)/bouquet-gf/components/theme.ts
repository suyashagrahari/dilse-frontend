// ─── Bouquet — Y2K pastel-pop theme tokens (JS side) ─────────────────────────
// The recipient-facing CSS variables live in bouquet.css (scoped to .bq-root).
// These mirror the key values for editor chrome (page.tsx / EditSheet) and the
// password gate, which render OUTSIDE the .bq-root scope.

export const BQ = {
  cream: "#fdf6ee",
  cream2: "#f7ecdd",
  paper: "#fffdf9",
  ink: "#2b2440",
  muted: "#7a7191",
  border: "#ece3d4",
  lilac: "#b8a4f0",
  lilacDeep: "#8b6fd4",
  butter: "#ffe08a",
  butterDeep: "#f5c74b",
  bubblegum: "#ff8fb1",
  bubblegumDeep: "#ff5f96",
  mint: "#a8e6cf",
} as const;

/** Editor-chrome surface tokens (light UI around the template). */
export const LIGHT = {
  surface: "#fffdf9",
  surfaceAlt: "#fbf3e8",
  muted: "#7a7191",
  border: "#ece3d4",
  ink: "#2b2440",
  accent: BQ.lilacDeep,
  accentSoft: "rgba(139,111,212,0.10)",
  pink: BQ.bubblegumDeep,
} as const;

/** Bubblegum→lilac brand gradient used on primary buttons. */
export const BRAND_GRADIENT = "linear-gradient(135deg,#ff8fb1,#b8a4f0)";

/** Soft pastel wash behind the password gate (rendered outside .bq-root). */
export const PAPER_GRADIENT =
  "radial-gradient(60vw 60vw at 12% 4%, rgba(184,164,240,0.45), transparent 60%)," +
  "radial-gradient(56vw 56vw at 96% 100%, rgba(255,143,177,0.4), transparent 62%)," +
  "radial-gradient(50vw 50vw at 60% 50%, rgba(255,224,138,0.4), transparent 60%)," +
  "#fdf6ee";
