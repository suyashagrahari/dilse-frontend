// The booth's data, made safe (every extra falls back), plus the palette.

import type { KissExtrasPremium, KissShade } from "../../../_valentine/days/happy-kiss-day-premium";
import type { LovePhoto, ValentineDayData } from "../../../_valentine/types";

/** Bright lipstick shades (keys are the $2/v2 keys; labels in the editor say Cherry/Gulabi/Berry/Peach). */
export const SHADES: Record<KissShade, { name: string; c: string; hi: string; lo: string }> = {
  ruby: { name: "Cherry", c: "#E0244E", hi: "#FF6F8E", lo: "#A3123A" },
  gulabi: { name: "Gulabi", c: "#FF4F8B", hi: "#FF9DBE", lo: "#C42A63" },
  berry: { name: "Berry", c: "#B0306A", hi: "#DE6FA1", lo: "#7A1D48" },
  nude: { name: "Peach", c: "#E9806C", hi: "#F8B5A6", lo: "#B8604F" },
};
const SHADE_KEYS = Object.keys(SHADES) as KissShade[];

/** research.md v3 §C1 "Strawberry Milk" + Cherry Soda lips. */
export const KM = {
  bg: "#FFF5F8",
  bg2: "#FFE3EC",
  card: "#FFFFFF",
  soft: "#FFD1DF",
  primary: "#FF4F86",
  deep: "#D63F72",
  ink: "#5B2333",
  inkSoft: "#8A4A5E",
  pop: "#FFE27A",
  mint: "#9FE5C8",
} as const;

export const clean = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export type MenuKey = "forehead" | "cheek" | "nose" | "hand";
export interface MenuCard {
  key: MenuKey;
  label: string;
  sub: string;
  line: string;
  gif: string;
}

const CDN = "https://cdn.subhsandesh.in/gifts-media/templates/_premium/gifs";
/** Fixed stickers (not sender slots): research §E Kiss Day + the shared set. */
export const GIF = {
  forehead: `${CDN}/kiss-day/bear-bunny-kiss.webp`,
  cheek: `${CDN}/kiss-day/cats-cheek-kiss.webp`,
  nose: `${CDN}/kiss-day/cats-boop-kiss.webp`,
  hand: `${CDN}/kiss-day/penguin-lift-kiss.webp`,
  blush: `${CDN}/common/noto-smiling-blush.webp`,
  kissing: `${CDN}/common/noto-kissing-face.webp`,
  closedEyes: `${CDN}/common/noto-kissing-closed-eyes.webp`,
  crying: `${CDN}/common/noto-loudly-crying.webp`,
  pleading: `${CDN}/common/noto-pleading-face.webp`,
  heartEyes: `${CDN}/common/noto-heart-eyes.webp`,
  sparkHeart: `${CDN}/common/noto-sparkling-heart.webp`,
  penguinsKiss: `${CDN}/kiss-day/penguins-kiss-hearts.webp`,
  bearsCheek: `${CDN}/hug-day/bears-cheek-hug.webp`,
  waiting: `${CDN}/kiss-day/mwah-blushing-bear.webp`,
} as const;

const DEFAULT_MENU: Record<MenuKey, string> = {
  forehead: "For every exam, interview and bad day. You've got this.",
  cheek: "The quick one when nobody's looking.",
  nose: "Boop. For when you're grumpy and pretending not to be.",
  hand: "Because you deserve to be treated like royalty. Always.",
};
const DEFAULT_NOTES = ["A kiss for the way you laugh", "A kiss for every goodnight text", "A kiss for being you"];

export interface Mwah {
  recipient: string;
  sender: string;
  pet: string;
  lipstick: boolean;
  shade: KissShade;
  S: (typeof SHADES)[KissShade];
  sign: string;
  /** Every photo with a URL. */
  photos: LovePhoto[];
  /** The photo they kiss (kissFrame), if any. */
  kissPhoto?: LovePhoto;
  /** The four strip frames (repeats when fewer than four photos; undefined = an empty frame). */
  strip: (LovePhoto | undefined)[];
  menu: MenuCard[];
  notes: string[];
  question: string;
  since: string;
  sinceDays: number | null;
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

export function readMwah(data: ValentineDayData): Mwah {
  const x = (data.extras ?? {}) as Partial<KissExtrasPremium>;
  const shade = SHADE_KEYS.includes(x.lipShade as KissShade) ? (x.lipShade as KissShade) : "ruby";
  const notes = (Array.isArray(x.kissNotes) ? x.kissNotes : []).map(clean).filter(Boolean).slice(0, 6);
  const photos = (data.photos ?? []).filter((p) => p && p.url);
  const ki = Math.max(0, Math.min(photos.length - 1, Math.round(Number(x.kissFrame) || 1) - 1));
  const strip: (LovePhoto | undefined)[] = photos.length ? [0, 1, 2, 3].map((i) => photos[i % photos.length]) : [undefined, undefined, undefined, undefined];
  const since = clean(x.sinceDate);
  const line = (k: MenuKey) => clean(x[`${k}Line`]) || DEFAULT_MENU[k];
  return {
    recipient: clean(data.recipientName) || "You",
    sender: clean(data.senderName) || "Someone",
    pet: clean(data.petName),
    lipstick: x.kissStyle !== "cute",
    shade,
    S: SHADES[shade],
    sign: clean(x.openingLine),
    photos,
    kissPhoto: photos[ki],
    strip,
    menu: [
      { key: "forehead", label: "Forehead", sub: "the safe one", line: line("forehead"), gif: GIF.forehead },
      { key: "cheek", label: "Cheek", sub: "the shy one", line: line("cheek"), gif: GIF.cheek },
      { key: "nose", label: "Nose", sub: "the eskimo one", line: line("nose"), gif: GIF.nose },
      { key: "hand", label: "Hand", sub: "the royal one", line: line("hand"), gif: GIF.hand },
    ],
    notes: notes.length ? notes : DEFAULT_NOTES,
    question: clean(x.question) || "Okay, final question. Kiss me?",
    since,
    sinceDays: daysSince(since),
    backText: clean(x.kissBackText),
  };
}

export const initialOf = (s: string) => Array.from(s.trim())[0]?.toLocaleUpperCase() ?? "";
export const fmt = (n: number) => n.toLocaleString("en-IN");

/** "13 Feb 2026" for the strip's footer. */
export function stampDate(d = new Date()) {
  const mon = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][d.getMonth()];
  return `${d.getDate()} ${mon} ${d.getFullYear()}`;
}

/** A sticker she put on the strip: kind + position in % of the strip box. */
export type DecoKind = "lips" | "heart" | "mwah" | "star";
export interface Deco {
  id: number;
  kind: DecoKind;
  x: number;
  y: number;
  rot: number;
}
