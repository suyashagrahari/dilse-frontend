// ─── Share-sheet palette ─────────────────────────────────────────────────────
//
// Every template hands the sheet its own accent, so these helpers derive a whole
// palette from one hex value rather than each template shipping five colours it
// would have to keep in sync.

/** The house accent, used when a template does not name one. */
export const DEFAULT_ACCENT = "#C2185B";

/** `#C2185B` → `[194, 24, 91]`. Falls back to the house accent on bad input. */
export function toRgb(hex: string): [number, number, number] {
  const clean = (hex || "").trim().replace(/^#/, "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return toRgb(DEFAULT_ACCENT);
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

export const alpha = (hex: string, a: number): string => {
  const [r, g, b] = toRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
};

/**
 * `[8, 65, 60]` → `"#08413c"`.
 *
 * Every helper in this file BOTH takes and returns hex, and that is not
 * cosmetic — `tint` and `shade` are composed with `alpha` constantly
 * (`alpha(shade(accent, 0.45), 0.7)`). While they returned `rgb(...)` strings,
 * `toRgb` failed to parse them and quietly fell back to the house pink, so a
 * teal template rendered a teal sheet with pink body copy. It was invisible on
 * the default accent, because there the fallback happened to be the right
 * answer.
 */
const toHex = (r: number, g: number, b: number): string =>
  `#${[r, g, b].map((c) => Math.max(0, Math.min(255, c)).toString(16).padStart(2, "0")).join("")}`;

/** Mix towards white. `amount` 0 keeps the colour, 1 is pure white. */
export const tint = (hex: string, amount: number): string => {
  const [r, g, b] = toRgb(hex);
  const m = (c: number) => Math.round(c + (255 - c) * amount);
  return toHex(m(r), m(g), m(b));
};

/** Mix towards black, for text that has to stay legible on a tinted ground. */
export const shade = (hex: string, amount: number): string => {
  const [r, g, b] = toRgb(hex);
  const m = (c: number) => Math.round(c * (1 - amount));
  return toHex(m(r), m(g), m(b));
};

/**
 * True when a colour is close to grey — the accent carries almost no hue.
 *
 * Three templates are deliberately achromatic (the monochrome one, the ticket,
 * the nutrition label), and their accents are near-black or slate. Used as-is
 * on the printed card those produce a grey poster, which is a fine screen
 * design and a miserable thing to find taped to a present. See `PrintableCard`
 * for what is substituted and what is not.
 */
export function isMuted(hex: string): boolean {
  const [r, g, b] = toRgb(hex);
  return Math.max(r, g, b) - Math.min(r, g, b) < 26;
}

/**
 * Black or white, whichever stays readable on `hex`.
 *
 * Uses the WCAG relative-luminance formula rather than a naive average: a
 * saturated green and a saturated blue of the same "average" brightness need
 * opposite ink, and templates use both.
 */
export function readableInk(hex: string): string {
  const [r, g, b] = toRgb(hex);
  const lin = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  const luminance = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  return luminance > 0.45 ? "#1A1523" : "#FFFFFF";
}

/**
 * The QR's own dark colour.
 *
 * Deliberately NOT the template accent. A tinted QR loses contrast against its
 * white ground, and a scanner's binariser wants the widest possible gap — this
 * returns a near-black carrying just enough of the accent's hue to look
 * intentional, and only when the accent is dark enough to afford it.
 */
export function qrInk(hex: string): string {
  const [r, g, b] = toRgb(hex);
  const mix = (c: number) => Math.round(c * 0.18);
  const candidate: [number, number, number] = [mix(r), mix(g), mix(b)];
  const luminance = (0.2126 * candidate[0] + 0.7152 * candidate[1] + 0.0722 * candidate[2]) / 255;
  // Anything brighter than this and the contrast ratio against white starts to
  // dip below what a phone camera handles at an angle.
  return luminance > 0.16 ? "#111111" : toHex(candidate[0], candidate[1], candidate[2]);
}
