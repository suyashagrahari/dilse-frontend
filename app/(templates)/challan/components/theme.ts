// ─── Challan — shared visual language ────────────────────────────────────────
//
// Government form, printed and scanned. Serif for the PRE-PRINTED labels, a
// typewriter face for every value FILLED IN. Hard 1px rules, square corners, no
// shadows, no gradients that read as UI. Two accents only: one red, one green.
//
// LEGAL: the issuing body is invented end to end — "Department of Heart Traffic,
// Republic of Us". Nothing in this file, or in anything that imports it, may
// reproduce a real emblem, a real force's seal, or a real transport-portal mark.
// The only insignia this template draws is two overlapping hearts in a double
// ring, generated as inline SVG in ChallanNotice.tsx.

import type { CSSProperties } from "react";

/** The single source of colour, type and geometry for the whole template. */
export const CH = {
  /** Paper stock. Slightly warm so the black reads as toner, not as #000 on #fff. */
  paper: "var(--lv-paper, #fdfbf6)",
  ink: "var(--lv-paper-ink, #111111)",
  /** The one red. Threat block, overdue overprint, the "1 challan found." line. */
  red: "var(--ch-red, #B3261E)",
  /** The one green. Settlement only. */
  green: "var(--ch-green, #2F7A4F)",
  /** Every rule and box edge in the document. */
  edge: "var(--lv-paper-ink, #111111)",

  /** Pre-printed form text. */
  serif: "var(--font-tinos), 'Times New Roman', Times, serif",
  /** Everything typed into the form. Never used for a printed label. */
  mono: "var(--font-courier-prime), 'Courier New', Courier, monospace",
  /** The invented motto line under the seal. */
  deva: "var(--font-tiro-devanagari), var(--font-tinos), 'Times New Roman', serif",

  /** Muted ink for sub-lines and dot leaders. */
  faint: "var(--lv-paper-soft, #5a5a5a)",
  /** Alternating table row fill. A tint of ink, never a grey of its own. */
  band: "color-mix(in srgb, var(--lv-paper-ink, #111) 4.5%, transparent)",
  /** Table header fill. */
  head: "color-mix(in srgb, var(--lv-paper-ink, #111) 8.5%, transparent)",
  /** Threat block ground. */
  tint: "color-mix(in srgb, var(--ch-red, #B3261E) 7%, var(--lv-paper, #fff))",
  /** Camera OSD yellow. Lives INSIDE the evidence photo only — it is the
   *  detection overlay a road camera burns in, not a colour of the document. */
  detect: "#E3C012",
  /** Deliberately ugly portal chrome for the lookup screen. */
  portalGrey: "#e4e4e4",
  portalEdge: "#9a9a9a",
  portalBg: "#f2f2f0",

  /** The document's design width in CSS pixels. Scaled by a transform on a
   *  wrapper — never reflowed at a breakpoint. */
  docW: 420,
  /** Design height of the two action buttons. Chosen so that at the smallest
   *  realistic scale (~0.76 on a 320px viewport) they still clear 44px. */
  btnH: 58,
} as const;

/** A tint of the paper ink — rules, hairlines and washes that follow the theme. */
export const chInk = (pct: number): string => `color-mix(in srgb, var(--lv-paper-ink, #111) ${pct}%, transparent)`;

/* ── Deterministic derivations ───────────────────────────────────────────────
   Everything below is a pure function of the challan number. No Math.random
   anywhere in this template: a jitter that changes on re-render also changes
   between the screen and the PNG capture, and a document that is not identical
   to its own photograph stops reading as a document. */

/** FNV-1a. Stable across renders, reloads, server and client. */
export function chHash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * The two character positions in the challan number that sit 1px high — the
 * typewriter striking slightly off the baseline twice on the same line.
 * Two, always, and always the same two for a given number.
 */
export function chJitter(challanNo: string): Set<number> {
  const n = challanNo.length;
  const out = new Set<number>();
  if (n < 2) return out;
  const h = chHash(challanNo);
  const a = h % n;
  let b = (h >>> 9) % n;
  if (b === a) b = (a + 1 + ((h >>> 17) % (n - 1))) % n;
  out.add(a);
  out.add(b);
  return out;
}

/** Skewed captcha text. Decorative — any input is accepted. */
const CAPTCHA_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function chCaptcha(seed: string, len = 5): string {
  let h = chHash(seed || "challan");
  let out = "";
  for (let i = 0; i < len; i += 1) {
    h = Math.imul(h ^ (i + 0x9e37), 16777619) >>> 0;
    out += CAPTCHA_ALPHABET[h % CAPTCHA_ALPHABET.length];
  }
  return out;
}

/** A small deterministic wobble in [-range, range] for glyph `i` of `seed`. */
export function chWobble(seed: string, i: number, range: number): number {
  const h = chHash(`${seed}#${i}`);
  return ((h % 2001) / 1000 - 1) * range;
}

/* ── Formatting ──────────────────────────────────────────────────────────────
   ISO strings are sliced textually, never fed through Date + toLocaleString.
   A locale- or timezone-dependent date renders one way on the server and
   another in the browser, and the hydration mismatch lands on the one line of
   the document a reader actually checks. */

/** "2026-03-14T23:41:00Z" → "14.03.2026" */
export function chDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || "");
  return m ? `${m[3]}.${m[2]}.${m[1]}` : iso || "—";
}

/** "2026-03-14T23:41:00Z" → "23:41" */
export function chTime(iso: string): string {
  const m = /T(\d{2}):(\d{2})/.exec(iso || "");
  return m ? `${m[1]}:${m[2]}` : "";
}

/** "14.03.2026, 23:41 hrs" */
export function chDateTime(iso: string): string {
  const t = chTime(iso);
  const d = chDate(iso);
  return t ? `${d}, ${t} hrs` : d;
}

/**
 * Lakh-grouped rupees for a PER-OFFENCE fine, which is a number.
 *
 * NEVER point this at `ChallanData.totalFine`. That field is free text — "one
 * date" is a valid total — and it is printed verbatim, never parsed, summed,
 * compared or formatted as currency.
 */
export function chRupees(n: number): string {
  if (!Number.isFinite(n)) return "—";
  const s = Math.abs(Math.round(n)).toString();
  let grouped = s;
  if (s.length > 3) {
    const last3 = s.slice(-3);
    let rest = s.slice(0, -3);
    const parts: string[] = [];
    while (rest.length > 2) {
      parts.unshift(rest.slice(-2));
      rest = rest.slice(0, -2);
    }
    if (rest) parts.unshift(rest);
    grouped = `${parts.join(",")},${last3}`;
  }
  return `${n < 0 ? "-" : ""}₹${grouped}`;
}

/* ── Reusable style fragments ────────────────────────────────────────────── */

/** Faint horizontal dot-matrix banding, the way a cheap printer lays down rows. */
export const CH_BANDING =
  "repeating-linear-gradient(to bottom, color-mix(in srgb, var(--lv-paper-ink, #111) 2.8%, transparent) 0px, color-mix(in srgb, var(--lv-paper-ink, #111) 2.8%, transparent) 1px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) 4px)";

/** Scanline ground for the evidence frame. 2px period, 4% ink. */
export const CH_SCANLINES =
  "repeating-linear-gradient(to bottom, rgba(0,0,0,.04) 0px, rgba(0,0,0,.04) 1px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) 2px)";

/** A pre-printed form label. */
export const chLabel = (size = 9.5): CSSProperties => ({
  fontFamily: CH.serif,
  fontSize: size,
  letterSpacing: 0.3,
  color: CH.ink,
  lineHeight: 1.35,
});

/** A value typed into the form. */
export const chValue = (size = 10.5): CSSProperties => ({
  fontFamily: CH.mono,
  fontSize: size,
  letterSpacing: 0.2,
  color: CH.ink,
  lineHeight: 1.35,
  wordBreak: "break-word",
});

/** The dotted run between a label and its value. */
export const CH_LEADER: CSSProperties = {
  flex: 1,
  margin: "0 5px",
  borderBottom: `1px dotted ${chInk(42)}`,
  transform: "translateY(-2px)",
};
