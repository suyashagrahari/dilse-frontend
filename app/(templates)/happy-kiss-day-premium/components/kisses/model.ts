// The kisses' data, made safe (every extra falls back), plus the palette.

import type { KissExtrasPremium, KissShade } from "../../../_valentine/days/happy-kiss-day-premium";
import type { ValentineDayData } from "../../../_valentine/types";

export const SHADES: Record<KissShade, { name: string; c: string; hi: string; lo: string }> = {
  ruby: { name: "Ruby", c: "#B3122E", hi: "#E2455F", lo: "#6E0A1C" },
  gulabi: { name: "Gulabi", c: "#D9466F", hi: "#F287A3", lo: "#8E1F44" },
  berry: { name: "Berry", c: "#7A1F4B", hi: "#B2507F", lo: "#45102A" },
  nude: { name: "Nude", c: "#C98A7A", hi: "#E7B5A6", lo: "#8A5345" },
};
export const SHADE_KEYS = Object.keys(SHADES) as KissShade[];

export const KD = {
  blush: "#F9D5DC",
  rose: "#E85A7A",
  cream: "#FFF6EE",
  velvet: "#5A0F24",
  velvetDeep: "#2E0612",
  gold: "#D4AF37",
  goldHi: "#F3DC8A",
} as const;

export const clean = (v: unknown) => (typeof v === "string" ? v.trim() : "");

const DEFAULT_NOTES = ["A kiss for the way you laugh", "A kiss for every goodnight text", "A kiss for being you"];

export interface Kisses {
  recipient: string;
  sender: string;
  lipstick: boolean;
  shade: KissShade;
  S: (typeof SHADES)[KissShade];
  envelope: string;
  target: number;
  notes: string[];
  mosaicIndex: number;
  count: number | null;
  countWhy: string;
  backText: string;
}

/** Days since a YYYY-MM-DD date (null if invalid or in the future). */
export function daysSince(iso: string, now = Date.now()): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return null;
  const t = Date.UTC(+m[1], +m[2] - 1, +m[3]);
  if (!Number.isFinite(t) || t > now) return null;
  return Math.max(1, Math.floor((now - t) / 86400000));
}

export function readKisses(data: ValentineDayData): Kisses {
  const x = (data.extras ?? {}) as Partial<KissExtrasPremium>;
  const shade = SHADE_KEYS.includes(x.lipShade as KissShade) ? (x.lipShade as KissShade) : "ruby";
  const notes = (Array.isArray(x.kissNotes) ? x.kissNotes : []).map(clean).filter(Boolean).slice(0, 6);
  const own = typeof x.kissCount === "number" && x.kissCount > 0 ? Math.round(x.kissCount) : null;
  const days = daysSince(clean(x.sinceDate));
  const photos = data.photos.filter((p) => p && p.url);
  const idx = Math.max(0, Math.min(photos.length - 1, Math.round(Number(x.mosaicPhoto) || 1) - 1));
  return {
    recipient: clean(data.recipientName) || "You",
    sender: clean(data.senderName) || "Someone",
    lipstick: x.kissStyle === "lipstick",
    shade,
    S: SHADES[shade],
    envelope: clean(x.openingLine) || "Sealed with a kiss. Open gently.",
    target: Math.max(5, Math.min(30, Math.round(Number(x.kissTarget) || 14))),
    notes: notes.length ? notes : DEFAULT_NOTES,
    mosaicIndex: idx,
    count: own ?? days,
    countWhy: own ? "and I'd send a thousand more" : days ? "one for every day since we met" : "and counting",
    backText: clean(x.kissBackText),
  };
}

export const initialOf = (s: string) => Array.from(s.trim())[0]?.toLocaleUpperCase() ?? "";
export const fmt = (n: number) => n.toLocaleString("en-IN");
