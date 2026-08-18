// ─── Photo Puzzle — shared visual language ───────────────────────────────────
//
// Indigo → rose, matching `config.ts` (`from-indigo-500 to-rose-400`) and the
// published viewer's password gate. Warm paper for the letter so the prose
// reads as a letter and not as UI.
//
// AUTHORED BY THE LEAD. Sub-agents: read it, import from it, do not edit it.
// If you need a token that is not here, tell the lead rather than hardcoding a
// second shade of indigo three files away.

/** Deep indigo. Headings, primary text accents. */
export const INDIGO = "#4338CA";
/** Lighter indigo. Gradients, glows, focus rings. */
export const INDIGO_SOFT = "#6366F1";
/** Rose. The second half of every gradient; the "warm" end. */
export const ROSE = "#FB7185";
/** The brand gradient, used on every primary control. */
export const GRAD = "linear-gradient(135deg,#6366F1,#FB7185)";

/** Body ink. */
export const INK = "#1E1B33";
/** Secondary ink — captions, meta, the "8 of 12" pill. */
export const INK_SOFT = "#6B6787";

/** Letter paper. Slightly warm so it sits apart from the cool page. */
export const PAPER = "#FFFDF9";
export const PAPER_EDGE = "#E7E3F5";

/** Page background. */
export const PAGE_BG = "linear-gradient(180deg,#EEF2FF 0%,#FFF1F2 58%,#FFFFFF 100%)";
/** Board felt — the surface the puzzle is being built on. */
export const FELT = "#221E3A";
/** Table under the tray. Reads as a wooden/linen surface, not as chrome. */
export const TABLE = "linear-gradient(180deg,#F6F4FF 0%,#EFECFB 100%)";

/** Cardboard edges. Light on the top-left, dark on the bottom-right. */
export const CARD_HILIGHT = "rgba(255,255,255,0.72)";
export const CARD_SHADOW = "rgba(30,27,51,0.30)";

/** UI / display face. */
export const OUTFIT = "var(--font-outfit), system-ui, sans-serif";
/** The letter's face. Serif, because it is a letter. */
export const SERIF = "var(--font-tinos), Georgia, serif";

/** Soft chrome for floating pills (mute, progress, hints). */
export const CHROME = "rgba(255,255,255,0.92)";
export const CHROME_BORDER = "1px solid rgba(199,193,235,0.9)";
export const CHROME_SHADOW = "0 6px 20px rgba(30,27,51,0.10)";

export const RADIUS = 20;
export const RADIUS_LG = 28;

/** Deterministic indigo-family fill for an initial disc when there is no photo. */
const NAME_FILLS = ["#6366F1", "#8B5CF6", "#A855F7", "#F472B6", "#FB7185", "#818CF8"] as const;
export function nameFill(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return NAME_FILLS[h % NAME_FILLS.length];
}

export function initialOf(name: string): string {
  const t = (name || "").trim();
  return t ? t[0].toUpperCase() : "♥";
}
