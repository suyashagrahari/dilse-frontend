// The booth's data, made safe (every extra falls back), plus the palette.

import type { KissExtrasPremium, KissShade } from "../../../_valentine/days/happy-kiss-day-premium";
import type { LovePhoto, ValentineDayData } from "../../../_valentine/types";

export const SHADES: Record<KissShade, { name: string; c: string; hi: string; lo: string }> = {
  ruby: { name: "Ruby", c: "#B3122E", hi: "#E2455F", lo: "#6E0A1C" },
  gulabi: { name: "Gulabi", c: "#D9466F", hi: "#F287A3", lo: "#8E1F44" },
  berry: { name: "Berry", c: "#7A1F4B", hi: "#B2507F", lo: "#45102A" },
  nude: { name: "Nude", c: "#C98A7A", hi: "#E7B5A6", lo: "#8A5345" },
};
const SHADE_KEYS = Object.keys(SHADES) as KissShade[];

/** research.md §D.7 palette. */
export const PB = {
  lacquer: "#C1121F",
  lacquerDeep: "#7d0a14",
  black: "#111111",
  night: "#0b0607",
  chrome: "#C9CED6",
  cream: "#F4EDE1",
  lip: "#E5677D",
} as const;

export const clean = (v: unknown) => (typeof v === "string" ? v.trim() : "");

const DEFAULT_NOTES = ["A kiss for the way you laugh", "A kiss for every goodnight text", "A kiss for being you"];

export interface Booth {
  recipient: string;
  sender: string;
  lipstick: boolean;
  shade: KissShade;
  S: (typeof SHADES)[KissShade];
  mono: boolean;
  sign: string;
  notes: string[];
  since: string;
  sinceDays: number | null;
  backText: string;
  /** The four strip frames: three photos, then "the kiss". Missing = an empty frame. */
  frames: (LovePhoto | undefined)[];
  /** Photos that are not on the strip (the outtakes). */
  outtakes: LovePhoto[];
}

/** Days since a YYYY-MM-DD date (null if invalid or in the future). */
export function daysSince(iso: string, now = Date.now()): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const t = Date.UTC(+m[1], +m[2] - 1, +m[3]);
  if (!Number.isFinite(t) || t > now) return null;
  return Math.max(1, Math.floor((now - t) / 86400000));
}

export function readBooth(data: ValentineDayData): Booth {
  const x = (data.extras ?? {}) as Partial<KissExtrasPremium>;
  const shade = SHADE_KEYS.includes(x.lipShade as KissShade) ? (x.lipShade as KissShade) : "ruby";
  const notes = (Array.isArray(x.kissNotes) ? x.kissNotes : []).map(clean).filter(Boolean).slice(0, 6);
  const photos = (data.photos ?? []).filter((p) => p && p.url);
  const since = clean(x.sinceDate);
  // "The kiss" is the chosen photo; the first three others fill frames 1–3.
  let frames: (LovePhoto | undefined)[] = [];
  let outtakes: LovePhoto[] = [];
  if (photos.length) {
    const ki = Math.max(0, Math.min(photos.length - 1, Math.round(Number(x.kissFrame) || 4) - 1));
    const kiss = photos[ki];
    const rest = photos.filter((_, i) => i !== ki);
    const lead = rest.slice(0, 3);
    outtakes = rest.slice(3);
    // Fewer than four photos: repeat what there is, so the strip is never half empty.
    const pool = lead.length ? lead : [kiss];
    frames = [0, 1, 2].map((i) => pool[i % pool.length]);
    frames.push(kiss);
  } else frames = [undefined, undefined, undefined, undefined];
  return {
    recipient: clean(data.recipientName) || "You",
    sender: clean(data.senderName) || "Someone",
    lipstick: x.kissStyle !== "cute",
    shade,
    S: SHADES[shade],
    mono: x.stripTone !== "colour",
    sign: clean(x.openingLine),
    notes: notes.length ? notes : DEFAULT_NOTES,
    since,
    sinceDays: daysSince(since),
    backText: clean(x.kissBackText),
    frames,
    outtakes,
  };
}

export const initialOf = (s: string) => Array.from(s.trim())[0]?.toLocaleUpperCase() ?? "";
export const fmt = (n: number) => n.toLocaleString("en-IN");

/** "13.02.26" for the strip's date stamp. */
export function stampDate(d = new Date()) {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${String(d.getFullYear()).slice(2)}`;
}

/** "14 MAR 2022" for the receipt. */
export function receiptDate(iso: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return "";
  const mon = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"][+m[2] - 1];
  return mon ? `${+m[3]} ${mon} ${m[1]}` : "";
}
