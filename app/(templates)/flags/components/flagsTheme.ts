// ─── Flags — visual tokens ───────────────────────────────────────────────────
//
// Dating-app STRUCTURE, editorial EXECUTION. The palette is deliberately tiny:
// paper, ink, and the three CHOICE_COLOR values from types.ts. Nothing else.
// Saturated gradients are what make a swipe deck read as a product screenshot
// instead of a printed object, and the printed object is the whole joke.
//
// Every mark in this template is invented. There is no real-world brand,
// wordmark, colour identity or icon set referenced anywhere — see the LEGAL
// section of the spec.

/** Card stock. */
export const PAPER = "#faf8f4";
/** Warmer stock, used only for the sincere card and the closing card. */
export const PAPER_WARM = "#f4ede0";
/** The surface the deck sits on. */
export const CANVAS = "#e7e3da";

export const INK = "#17150f";
export const INK_SOFT = "#5d564b";
export const INK_FAINT = "rgba(23,21,15,0.24)";
export const HAIRLINE = "rgba(23,21,15,0.30)";

/** The one ambient shadow the spec allows, under the card stack. */
export const STACK_SHADOW = "0 22px 44px -26px rgba(23,21,15,0.55)";

// Fonts — all loaded globally in app/layout.tsx as CSS variables.
export const SERIF = "var(--font-tinos), 'Times New Roman', Times, serif";
export const MONO = "var(--font-courier-prime), ui-monospace, 'Courier New', monospace";
export const STENCIL = "var(--font-oswald), 'Arial Narrow', system-ui, sans-serif";
export const UI = "var(--font-inter), ui-sans-serif, system-ui, sans-serif";

/** Shared id for the ink-edge SVG filter, mounted once at the template root. */
export const INK_FILTER_ID = "flags-ink-edge";

/** Uneven ink density. A stamp with flat coverage reads as a UI badge. */
export const INK_MASK =
  "radial-gradient(118% 150% at 28% 18%, rgba(0,0,0,1) 0%, rgba(0,0,0,0.94) 38%," +
  " rgba(0,0,0,0.66) 66%, rgba(0,0,0,0.93) 88%, rgba(0,0,0,0.78) 100%)";

/** Muted stock colours for the initial-card fallback when there is no photo. */
export const FALLBACK_STOCKS = ["#3d4a42", "#4a3d3a", "#3a3f4a", "#4a463a", "#423a4a"] as const;

/** Card geometry. Scaled, never reflowed. */
export const CARD_W = "min(340px, 84vw)";
export const CARD_H = "min(468px, 58vh)";

/** How much further the card travels on commit, before the hold. */
export const FLY_OUT_PUSH = 90;
/** The flipped card slides off downward before the stack advances. */
export const EXIT_MS = 220;
/** Behind cards move up one position over this. */
export const STACK_MS = 240;

export const clamp = (n: number, lo: number, hi: number): number =>
  n < lo ? lo : n > hi ? hi : n;
