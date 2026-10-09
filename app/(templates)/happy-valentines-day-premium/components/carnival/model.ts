// Pure helpers for the carnival: read the extras defensively, the palette, the GIF library, date maths.

import type { LovePhoto } from "../../../_love/types";
import type { DayConfig, ValentineDayData } from "../../../_valentine/types";
import { suggestionFor } from "../../../_valentine/music/youtube";
import { media } from "@/lib/templateMedia";
import { fluentUrl, type FluentKey } from "../../../_valentine/kit/premium";

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const list = (v: unknown) => (Array.isArray(v) ? v.map((s) => (typeof s === "string" ? s.trim() : "")) : []);

// ─── Palette: Cherry Soda + lavender + butter (research §C1) ───────────────────
export const C = {
  bg: "#FFF0F3",
  bg2: "#FFD6E0",
  card: "#FFFFFF",
  soft: "#FFB3C6",
  primary: "#FF4D6D",
  deep: "#C9184A",
  ink: "#590D22",
  pop: "#FFD166",
  lav: "#B9A7FF",
  lavSoft: "#EDE3FF",
  mint: "#9FE5C8",
} as const;

/** Balloon / capsule / can colours, cycled. */
export const CANDY = ["#FF4D6D", "#FF8FAB", "#B9A7FF", "#FFD166", "#7FD8BE", "#FF9E6B", "#C77DFF", "#FF6F9C"] as const;

// ─── GIF library (templates/_premium/gifs on the CDN; research-v3 gifs.json) ───
export const gif = (name: string) => media(`templates/_premium/gifs/${name}.webp`);
export const GIF = {
  bunnyHeart: gif("valentines-day/bunny-blows-heart"),
  bearHeart: gif("valentines-day/bear-love-you-heart"),
  pandaHeart: gif("valentines-day/panda-i-love-you-heart"),
  penguinPhone: gif("valentines-day/penguin-i-love-you-so-much"),
  penguinsDay: gif("valentines-day/penguins-valentines-day"),
  penguinsHappy: gif("valentines-day/penguins-happy-valentines"),
  bearsGift: gif("promise-day/bears-promise-gift"),
  penguinsLock: gif("propose-day/penguins-heart-lock"),
  teddyHeart: gif("teddy-day/teddy-i-love-you"),
  bearsCuddle: gif("teddy-day/bears-pink-cuddle"),
  catsJump: gif("hug-day/cats-jump-hug"),
  penguinRun: gif("hug-day/penguin-run-hug"),
  bearsCheek: gif("hug-day/bears-cheek-hug"),
  catsBoop: gif("kiss-day/cats-boop-kiss"),
  loveLetter: gif("common/noto-love-letter"),
  holdingTears: gif("common/noto-holding-back-tears"),
  crying: gif("common/noto-loudly-crying"),
  partyPopper: gif("common/noto-party-popper"),
  smilingHearts: gif("common/noto-smiling-hearts"),
} as const;

// ─── The week, one can each (Rose Day → Kiss Day) ──────────────────────────────
export const WEEK: { day: string; short: string; icon: FluentKey; color: string }[] = [
  { day: "Rose Day", short: "Rose", icon: "rose", color: "#FF4D6D" },
  { day: "Propose Day", short: "Ring", icon: "ring", color: "#B9A7FF" },
  { day: "Chocolate Day", short: "Choco", icon: "chocolate", color: "#C98A4B" },
  { day: "Teddy Day", short: "Teddy", icon: "teddy-bear", color: "#FF9E6B" },
  { day: "Promise Day", short: "Promise", icon: "lock", color: "#7FD8BE" },
  { day: "Hug Day", short: "Hug", icon: "smiling-hearts", color: "#FFD166" },
  { day: "Kiss Day", short: "Kiss", icon: "kiss-mark", color: "#FF8FAB" },
];
export const weekIcon = (i: number) => fluentUrl(WEEK[i].icon);

/** The four gacha prizes when there are no photos at all. */
export const COUPONS = ["1 extra-tight hug", "You pick the movie. No complaints.", "Momos on me, any day", "Forehead kisses ×∞"];

export interface Carnival {
  to: string;
  from: string;
  pet: string;
  year: number;
  ticketLine: string;
  words: string[];
  meterLine: string;
  weekLines: string[];
  since: Date | null;
  song: { title: string; artist: string } | null;
  songNote: string;
  question: string;
  noLines: string[];
  datePlan: string;
  endLine: string;
  photos: LovePhoto[];
}

export function parseDate(s: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isFinite(d.getTime()) && d.getTime() <= Date.now() + 864e5 ? d : null;
}

/** "John Legend - All of Me (Official Video)" → { title: "All of Me", artist: "John Legend" } */
export function cleanTitle(raw: string): { title: string; artist: string } {
  const t = raw.replace(/\s*[([【][^)\]】]*[)\]】]/g, "").replace(/\s*\|.*$/, "").replace(/\s+(ft|feat)\.?\s.*$/i, "").trim();
  const parts = t.split(/\s+[-–—]\s+/);
  if (parts.length >= 2) return { artist: parts[0].trim(), title: parts.slice(1).join(" – ").trim() };
  return { title: t, artist: "" };
}

/** The balloon line as ≤ 8 words (extra words ride on the last balloon). */
export function balloonWords(line: string): string[] {
  const w = line.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  if (!w.length) return ["You", "make", "every", "day", "feel", "like", "Valentine's"];
  if (w.length <= 8) return w;
  return [...w.slice(0, 7), w.slice(7).join(" ")];
}

/** The Valentine's Day this page belongs to: Feb 14 of this year until it passes, then next year's. */
export const valentineYear = (now = new Date()) => (now.getMonth() === 0 || (now.getMonth() === 1 && now.getDate() <= 21) ? now.getFullYear() : now.getFullYear() + 1);

export function readCarnival(day: DayConfig, data: ValentineDayData, ytTitle?: string | null): Carnival {
  const x = (data.extras ?? {}) as Record<string, unknown>;
  let song: Carnival["song"] = null;
  if (data.musicMode === "youtube" && data.musicYoutubeId) {
    const known = suggestionFor(data.musicYoutubeId, day.music?.suggestions);
    if (known) song = { title: known.title, artist: known.artist };
    else if (ytTitle) song = cleanTitle(ytTitle);
  }
  const week = list(x.weekLines).slice(0, 7);
  while (week.length < 7) week.push("");
  return {
    to: data.recipientName.trim() || "you",
    from: data.senderName.trim() || "me",
    pet: data.petName.trim(),
    year: valentineYear(),
    ticketLine: str(x.ticketLine) || "Admit one · all the rides · forever",
    words: balloonWords(str(x.balloonLine)),
    meterLine: str(x.meterLine) || "ERROR: too much love",
    weekLines: week,
    since: parseDate(str(x.togetherSince)),
    song,
    songNote: str(x.songNote),
    question: str(x.question) || "Will you be my Valentine?",
    noLines: list(x.noLines).filter(Boolean).slice(0, 4),
    datePlan: str(x.datePlan),
    endLine: data.endLine.trim(),
    photos: (data.photos ?? []).filter((p) => p && p.url),
  };
}

/** Whole days between `since` and now. */
export const daysSince = (since: Date, now = new Date()) => Math.max(0, Math.floor((now.getTime() - since.getTime()) / 864e5));
export const fmt = (n: number) => Math.round(n).toLocaleString("en-IN");
export const fmtDate = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

/** Photo i, cycling through what exists (null when there are none). */
export const pick = (photos: LovePhoto[], i: number): LovePhoto | null => (photos.length ? photos[i % photos.length] : null);

/** The four capsule prizes: photos 2–5, falling back to whatever exists. */
export function capsulePhotos(photos: LovePhoto[]): (LovePhoto | null)[] {
  if (!photos.length) return [null, null, null, null];
  const order = photos.length > 1 ? [...photos.slice(1, 5), ...photos.slice(0, 1)] : photos;
  return [0, 1, 2, 3].map((i) => order[i % order.length]);
}

/** Cabins on the wheel: every photo, at least 6 and at most 8 cabins. */
export function wheelPhotos(photos: LovePhoto[]): (LovePhoto | null)[] {
  const n = Math.max(6, Math.min(8, photos.length));
  return Array.from({ length: n }, (_, i) => pick(photos, i));
}
