// Pure helpers for "The Hug Passport": read the page defensively, the six stamps (what each hug is called, its ink,
// what it says from him), the fixed sticker GIFs beyond the editable slots, and small maths.

import type { LovePhoto } from "../../../_love/types";
import type { ValentineDayData } from "../../../_valentine/types";
import { pairOf, type Species } from "../../../happy-hug-day/components/hug/Characters";
import type { HugExtras } from "../../../_valentine/days/happy-hug-day";

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/** The five hugs she collects, plus the last one (the money moment). */
export type StampKind = "bear" | "back" | "twirl" | "pat" | "far" | "forever";
export const HUG_KINDS = ["bear", "back", "twirl", "pat", "far"] as const satisfies readonly StampKind[];
export const ALL_STAMPS: StampKind[] = [...HUG_KINDS, "forever"];

export const STAMP: Record<StampKind, { name: string; short: string; ink: string; emoji: string }> = {
  bear: { name: "The bear hug", short: "BEAR HUG", ink: "#E0603F", emoji: "🐻" },
  back: { name: "The back hug", short: "BACK HUG", ink: "#7A52E0", emoji: "🫶" },
  twirl: { name: "The twirl hug", short: "TWIRL HUG", ink: "#1F9A73", emoji: "💫" },
  pat: { name: "The pat-pat hug", short: "PAT-PAT HUG", ink: "#D63F72", emoji: "🤲" },
  far: { name: "The long-distance hug", short: "LONG-DISTANCE", ink: "#3577C4", emoji: "✈️" },
  forever: { name: "Forever hugger", short: "FOREVER", ink: "#E0603F", emoji: "💗" },
};

/** His line for each of the four hugs, when the sender left one blank. */
export const DEFAULT_HUG_LINES = [
  "For the days that are too much. I'll squeeze them smaller.",
  "For when you're making chai and pretending not to notice me.",
  "For good news. I'm lifting you off the ground.",
  "For bad days. Pat, pat. I'm right here.",
];

export const DEFAULT_COUPONS = [
  { title: "One 10-minute bear hug", detail: "Redeemable anytime, even in the middle of a fight." },
  { title: "Unlimited back hugs", detail: "Especially while you're cooking. No expiry." },
  { title: "One airport hug", detail: "The long one. The first thing I do when I land." },
];

export interface Passport {
  to: string;
  from: string;
  pet: string;
  opening: string;
  species: [Species, Species];
  hugLines: string[];
  km: number;
  meetLine: string;
  coupons: { title: string; detail: string }[];
  replyLine: string;
  question: string;
  yesLine: string;
  hugTitle: string;
  photos: LovePhoto[];
}

export function readPassport(data: ValentineDayData): Passport {
  const x = (data.extras ?? {}) as Record<string, unknown>;
  const lines = Array.isArray(x.hugLines) ? (x.hugLines as unknown[]).map(str) : [];
  const coupons = (Array.isArray(x.coupons) ? (x.coupons as unknown[]) : [])
    .map((c) => {
      const o = (c ?? {}) as Record<string, unknown>;
      const t = str(o.title);
      return { title: t.charAt(0).toUpperCase() + t.slice(1), detail: str(o.detail) };
    })
    .filter((c) => c.title)
    .slice(0, 6);
  const km = Number(x.distanceKm);
  return {
    to: data.recipientName.trim() || "you",
    from: data.senderName.trim() || "Someone",
    pet: (data.petName ?? "").trim(),
    opening: str(x.openingLine) || "Come here, you.",
    species: pairOf(x.characters as HugExtras["characters"]),
    hugLines: DEFAULT_HUG_LINES.map((d, i) => (lines[i] ? lines[i].charAt(0).toUpperCase() + lines[i].slice(1) : d)),
    km: Number.isFinite(km) ? Math.max(0, Math.min(20000, Math.round(km))) : 860,
    meetLine: str(x.meetLine) || "There you are. Finally.",
    coupons: coupons.length ? coupons : DEFAULT_COUPONS,
    replyLine: str(x.replyLine),
    question: str(x.question) || "Will you be my forever hug?",
    yesLine: str(x.yesLine) || "Then I'm never letting go.",
    hugTitle: str(x.hugTitle) || "VIP Hugger",
    photos: (data.photos ?? []).filter((p) => p && typeof p.url === "string" && p.url).slice(0, 12),
  };
}

/** The photo for the n-th souvenir (cycles; undefined when there are none). */
export const photoAt = (p: Passport, i: number): LovePhoto | undefined => (p.photos.length ? p.photos[i % p.photos.length] : undefined);

/** "860 km" / "1,200 km" / "too far". */
export const kmLabel = (km: number) => (km <= 0 ? "too far" : `${Math.round(km).toLocaleString("en-IN")} km`);

// ─── Fixed stickers (our library, not sender-editable) ──────────────────────────
const G = "https://cdn.subhsandesh.in/gifts-media/templates/_premium/gifs";
export const FIXED_GIF = {
  /** The twirl hug. */
  twirl: `${G}/hug-day/penguins-sway-hug.webp`,
  /** The pat-pat hug, once the cloud clears. */
  cheek: `${G}/hug-day/bears-cheek-hug.webp`,
  /** The sad bear in pat-pat, and every No. */
  comfort: `${G}/hug-day/bear-comforts-crying.webp`,
  /** The voice plush's friend. */
  snuggle: `${G}/hug-day/bunnies-snuggle.webp`,
  /** The letter. */
  loveYou: `${G}/valentines-day/bear-love-you-heart.webp`,
  /** Asking nicely, beside the question. */
  heart: `${G}/teddy-day/teddy-red-heart.webp`,
  /** The passport page. */
  cuddle: `${G}/promise-day/bears-cuddle-promise.webp`,
  /** The reply. */
  penguinText: `${G}/teddy-day/bear-i-love-you-heart.webp`,
} as const;

/** The money moment: a wall of hugging couples (all small; preloaded during the question). */
export const WALL_GIFS = [
  `${G}/hug-day/cats-squeeze-hug.webp`,
  `${G}/hug-day/bears-back-hug.webp`,
  `${G}/hug-day/bears-cheek-hug.webp`,
  `${G}/hug-day/penguin-run-hug.webp`,
  `${G}/hug-day/cats-jump-hug.webp`,
  `${G}/hug-day/penguins-sway-hug.webp`,
  `${G}/hug-day/bunnies-snuggle.webp`,
  `${G}/promise-day/bears-cuddle-promise.webp`,
  `${G}/teddy-day/bears-pink-cuddle.webp`,
  `${G}/halloween/ghosts-cuddling.webp`,
] as const;

/** Paragraphs of the letter (blank-line separated). */
export function paragraphs(s: string): string[] {
  return s
    .replace(/\r/g, "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/** Deterministic 0–1 noise (positions that never jump between renders). */
export const rand = (i: number, salt = 1) => {
  const v = Math.sin(i * 127.1 * salt + salt * 311.7) * 43758.5453;
  return v - Math.floor(v);
};
