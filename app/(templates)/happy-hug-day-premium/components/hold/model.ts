// The hug's data, made safe (every extra falls back to something lovely), plus the palette.

import type { HugExtrasPremium } from "../../../_valentine/days/happy-hug-day-premium";
import type { LovePhoto, ValentineDayData } from "../../../_valentine/types";

/** research §D.6 palette. */
export const HH = {
  sand: "#EADBC8",
  apricot: "#F2A477",
  apricotDeep: "#C9774A",
  cocoa: "#4B3426",
  night: "#120C09",
  dusk: "#1E1510",
  cloud: "#FAF7F2",
  grey: "#8C8279",
} as const;

export const clean = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const strings = (v: unknown, max: number) => (Array.isArray(v) ? v : []).map(clean).filter(Boolean).slice(0, max);
const num = (v: unknown, lo: number, hi: number, d: number) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, Math.round(n))) : d;
};

const DEFAULT_LINES = ["Breathe. I've got you.", "You don't have to be okay right now.", "I'm not letting go first.", "This is my favourite place."];
const DEFAULT_FEELS = ["Like coming home with the lights on.", "Like a Sunday that doesn't end.", "Like the cold can't find me.", "Like the whole world got quieter."];

export interface Coupon {
  title: string;
  detail: string;
}

export interface Hug {
  to: string;
  from: string;
  /** "Come here." split into the words shown one per screen (≤ 5). */
  words: string[];
  km: number;
  meetLine: string;
  seconds: number;
  bpm: number;
  lines: string[];
  feels: string[];
  coupons: Coupon[];
  replyLine: string;
  photos: LovePhoto[];
  /** The photo they hold: it blooms into colour. */
  hero: LovePhoto | undefined;
  /** The two cards dragged together (the second may be missing: a name card stands in). */
  pair: [LovePhoto | undefined, LovePhoto | undefined];
  /** One photo per "what your hugs feel like" line (cycles through what there is). */
  feelPhotos: (LovePhoto | undefined)[];
}

export function readHug(data: ValentineDayData): Hug {
  const x = (data.extras ?? {}) as Partial<HugExtrasPremium>;
  const photos = (data.photos ?? []).filter((p) => p && p.url);
  const opening = clean(x.openingLine) || "Come here.";
  // Sentence case for the first word: it is shown alone, huge ("come" reads like a typo).
  const words = (opening.charAt(0).toLocaleUpperCase() + opening.slice(1)).split(/\s+/).filter(Boolean).slice(0, 5);
  const lines = strings(x.hugLines, 5);
  const feels = strings(x.hugFeels, 4);
  const coupons = (Array.isArray(x.coupons) ? x.coupons : [])
    .map((c) => ({ title: clean(c?.title), detail: clean(c?.detail) }))
    .filter((c) => c.title || c.detail)
    .slice(0, 3);
  const feelsOut = feels.length ? feels : DEFAULT_FEELS;
  // The feel cards use the photos after the pair first, then wrap around.
  const pool = photos.length > 2 ? [...photos.slice(2), ...photos.slice(0, 2)] : photos;
  return {
    to: clean(data.recipientName) || "you",
    from: clean(data.senderName) || "Someone",
    words,
    km: num(x.distanceKm, 0, 20000, 860),
    meetLine: clean(x.meetLine) || "Close enough. Now hold on.",
    seconds: num(x.holdSeconds, 10, 30, 20),
    bpm: num(x.heartbeatBpm, 50, 90, 64),
    lines: lines.length ? lines : DEFAULT_LINES,
    feels: feelsOut,
    coupons: coupons.length ? coupons : [{ title: "Hug owed: 1", detail: "Redeem in person." }],
    replyLine: clean(x.replyLine),
    photos,
    hero: photos[0],
    pair: [photos[0], photos[1]],
    feelPhotos: feelsOut.map((_, i) => (pool.length ? pool[i % pool.length] : undefined)),
  };
}

export const initialOf = (s: string) => Array.from(s.trim())[0]?.toLocaleUpperCase() ?? "";
export const fmtKm = (n: number) => n.toLocaleString("en-IN");

/** "9:41 pm" — when the hug was delivered. */
export function clock(d = new Date()) {
  const h = d.getHours();
  return `${h % 12 || 12}:${String(d.getMinutes()).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`;
}
