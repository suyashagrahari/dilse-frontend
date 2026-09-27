// ─── The Invitation — shared visual language ─────────────────────────────────
//
// LEAD-OWNED. Every component in this template imports its colours, faces and
// time formatting from here. Do not re-declare a colour or a date formatter in
// a component file — two formatters means two different renderings of the same
// timestamp on the same screen.
//
// AESTHETIC BRIEF: this is the one template in the set that must read as a real
// invitation, not as a parody document. Cream paper, a display serif for the
// header, a book serif for the body, and monospace ONLY for times and the
// countdown. One muted accent. Ornament is line art, never fill.

// ── Paper & ink ──────────────────────────────────────────────────────────────

/** The paper. Specified by the brief; do not change it. */
export const PAPER = "#fdfaf3";
/** A half-tone deeper, for the card sitting on the page. */
export const PAPER_DEEP = "#f7f1e4";
/** Hairline rules, card borders, the dot leaders. */
export const PAPER_EDGE = "#e3d8c2";

/** Body ink. 13.9:1 on PAPER — readable outdoors, in sunlight, at arm's length. */
export const INK = "#241f1b";
/** Secondary ink for labels. 6.4:1 on PAPER. */
export const INK_SOFT = "#675f52";
/** Ornament and dot-leader ink only. Never used for text that must be read. */
export const INK_FAINT = "#a89b86";

/**
 * THE accent. One colour, muted oxblood-rose. 8.1:1 on PAPER.
 * Do not introduce a second accent — the restraint is the design.
 */
export const ACCENT = "#d0245f";
/** A wash of the accent, for the seal bed and the current-stop card. */
export const ACCENT_WASH = "#ffe8f0";
/** Accent at rule weight. */
export const ACCENT_EDGE = "#f4b4ca";

/** The one non-accent signal colour: a passed / done state. Muted moss. */
export const DONE = "#4e6046";

// ── Faces ────────────────────────────────────────────────────────────────────
//
// A note on export fidelity: `--font-tinos` and `--font-courier-prime` are
// registered in the root layout with `display:"swap"` and are self-hosted, so
// `await document.fonts.ready` inside `exportNodeToPng` genuinely waits for
// them. `--font-playfair` is registered `display:"optional"`, which the browser
// is allowed to decline outright.
//
//   → Anything captured into the share card PNG must use SERIF or MONO only.
//   → DISPLAY is for on-screen headers.

/** On-screen display serif. Headers, the recipient's name, "YOU ARE INVITED". */
export const DISPLAY = "var(--font-playfair), 'Cormorant Garamond', Georgia, serif";
/** Body serif. Everything that is read as a sentence. PNG-safe. */
export const SERIF = "var(--font-tinos), Georgia, 'Times New Roman', serif";
/** Times and the countdown. NOTHING else. PNG-safe. */
export const MONO = "var(--font-courier-prime), ui-monospace, 'SF Mono', Menlo, monospace";
/** UI chrome only — the top bar, the editor sheet. Never the invitation itself. */
export const UI = "var(--font-outfit), system-ui, sans-serif";

// ── Metrics ──────────────────────────────────────────────────────────────────

/**
 * Re-exported from the frozen types for convenience. Used outdoors, one-handed,
 * so every interactive target is at least this tall AND this wide.
 */
export { TAP_TARGET_PX as TAP } from "./types";

/** The invitation card's max width. Portrait, mobile-first, verified at 380px. */
export const CARD_MAX_W = 400;

/** Standard card chrome. */
export const CARD_SHADOW = "0 18px 44px -22px rgba(58,44,32,0.34), 0 2px 6px rgba(58,44,32,0.06)";
export const CARD_RADIUS = 16; // Soft sticker corners — the night-out redesign.

// ── Time formatting ──────────────────────────────────────────────────────────
//
// Stored and compared in UTC (see the frozen types); DISPLAYED in the viewer's
// local timezone, which is what every function below does — `toLocaleTimeString`
// with no timeZone option resolves to the device zone.

const invalid = (iso: string) => Number.isNaN(Date.parse(iso));

/**
 * "6:30 PM"
 *
 * `hour12` is forced rather than left to the locale. Without it a viewer on a
 * 24-hour locale gets a bare "4:07" with no meridiem — which on an INVITATION
 * is genuinely ambiguous: 4:07 in the morning and 4:07 in the afternoon are
 * very different evenings, and she has to decide whether to say yes based on
 * it. A meridiem is unambiguous in every locale; a bare hour is not.
 */
export function fmtTime(iso: string): string {
  if (!iso || invalid(iso)) return "";
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/** "Saturday, 16 August" */
export function fmtDateLong(iso: string): string {
  if (!iso || invalid(iso)) return "";
  return new Date(iso).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });
}

/** "16 August" */
export function fmtDateShort(iso: string): string {
  if (!iso || invalid(iso)) return "";
  return new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "long" });
}

/** "Saturday, 16 August · 6:30 PM" — the invitation's headline row. */
export function fmtDateTimeLong(iso: string): string {
  const d = fmtDateLong(iso);
  const t = fmtTime(iso);
  return d && t ? `${d} · ${t}` : d || t;
}

/** "2026-08-16" in LOCAL time — for seeding a <input type="date"> value. */
export function toLocalDateInput(iso: string): string {
  if (!iso || invalid(iso)) return "";
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

/** "about 4 hours" / "about 45 minutes" / "about 2½ hours". */
export function fmtDuration(mins: number): string {
  const m = Math.max(0, Math.round(mins));
  if (m < 60) return `about ${m} minutes`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (r === 0) return h === 1 ? "about an hour" : `about ${h} hours`;
  if (r === 30) return h === 1 ? "about an hour and a half" : `about ${h}½ hours`;
  return `about ${h}h ${r}m`;
}

/** "45 min" — the compact form used on a stop card. */
export function fmtMins(mins: number): string {
  const m = Math.max(0, Math.round(mins));
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r === 0 ? `${h} hr` : `${h} hr ${r} min`;
}

// ── The night-out layer ──────────────────────────────────────────────────────
//
// The recipient screens sit on a dark night sky with candy-gradient glows; the
// cards on it stay cream "tickets" and "stickers", so every paper token above
// still reads correctly inside them (maps, directions, share card, editor).

/** The sky. */
export const NIGHT = "#12081f";
export const NIGHT_2 = "#1f0f33";
/** Text on the sky. */
export const MOON = "#fff6fb";
export const MOON_SOFT = "rgba(255,246,251,0.72)";
export const MOON_FAINT = "rgba(255,246,251,0.46)";
/** Candy accents. */
export const POP = "#ff4f8b";
export const TANG = "#ff9a3c";
export const LILAC = "#b59bff";
export const LIME = "#d8ff5c";
export const GRAD = "linear-gradient(115deg, #ff4f8b 0%, #ff7a5c 48%, #ffb03c 100%)";
export const GRAD_TEXT = "linear-gradient(100deg, #ff8fb6 0%, #ffb36b 55%, #d8ff5c 100%)";
/** Frosted glass on the sky. */
export const GLASS = "rgba(255,255,255,0.07)";
export const GLASS_EDGE = "rgba(255,255,255,0.14)";

/** Chunky Gen-Z grotesk for headlines and UI on the sky. */
export const GROTESK = "var(--font-di-grotesk), var(--font-outfit), system-ui, sans-serif";
/** A soft editorial italic for the romantic lines. */
export const ITALIC = "var(--font-di-serif), var(--font-playfair), Georgia, serif";
