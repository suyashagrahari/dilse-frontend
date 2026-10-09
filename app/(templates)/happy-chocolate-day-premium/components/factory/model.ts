// Pure helpers for "The Sweetheart Chocolate Factory": read the extras defensively, the palette, the GIF library,
// the six truffles and the house defaults.

import type { LovePhoto } from "../../../_love/types";
import type { DayConfig, ValentineDayData } from "../../../_valentine/types";
import { suggestionFor } from "../../../_valentine/music/youtube";
import { media } from "@/lib/templateMedia";

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

// ─── Palette: Choco Latte + Strawberry Milk (research §C1) ─────────────────────
export const C = {
  bg: "#FFF8F0",
  bg2: "#F6E2CF",
  card: "#FFFCF7",
  soft: "#EBCBAE",
  primary: "#B9744D",
  deep: "#7B4A2E",
  ink: "#4A2C1E",
  choc: "#5A3221",
  milk: "#8B5A3C",
  pink: "#FF6F9C",
  pinkDeep: "#D63F72",
  pinkSoft: "#FFD1DF",
  pop: "#FF9EBB",
  butter: "#FFD166",
  mint: "#9FE5C8",
} as const;

export const CONFETTI = [C.pink, C.pop, C.butter, C.mint, "#FFFFFF", C.primary, "#C9A7FF"] as const;

// ─── GIF library (templates/_premium/gifs on the CDN; research-v3 gifs.json) ───
export const gif = (name: string) => media(`templates/_premium/gifs/${name}.webp`);
export const GIF = {
  heartBox: gif("chocolate-day/heart-chocolate-box"),
  barHeart: gif("chocolate-day/chocolate-bar-heart"),
  dayText: gif("chocolate-day/happy-chocolate-day-text"),
  penguinBar: gif("chocolate-day/penguin-chocolate-bar"),
  penguinCookie: gif("chocolate-day/penguin-munching-cookie"),
  bearsDinner: gif("chocolate-day/bears-dinner-date"),
  penguinHeart: gif("chocolate-day/penguin-chocolate-heart"),
  loveBox: gif("chocolate-day/i-love-you-chocolate-box"),
  pandaSnack: gif("chocolate-day/panda-cloud-snack"),
  bearCookie: gif("chocolate-day/bear-eating-cookie"),
  catMold: gif("chocolate-day/cat-chocolate-mold"),
  bearsNuzzle: gif("teddy-day/bears-nuzzle"),
  bearsCuddle: gif("teddy-day/bears-pink-cuddle"),
  bearsGift: gif("promise-day/bears-promise-gift"),
  bearsCheek: gif("hug-day/bears-cheek-hug"),
  penguinsSway: gif("hug-day/penguins-sway-hug"),
  catsJump: gif("hug-day/cats-jump-hug"),
  mwahBear: gif("kiss-day/mwah-blushing-bear"),
  catsBoop: gif("kiss-day/cats-boop-kiss"),
  loveLetter: gif("common/noto-love-letter"),
  partyPopper: gif("common/noto-party-popper"),
  smilingHearts: gif("common/noto-smiling-hearts"),
  heartEyes: gif("common/noto-heart-eyes"),
  handMouth: gif("common/noto-hand-over-mouth"),
  pleading: gif("common/noto-pleading-face"),
  holdingTears: gif("common/noto-holding-back-tears"),
  partying: gif("common/noto-partying-face"),
} as const;

// ─── The six truffles ──────────────────────────────────────────────────────────
export type TruffleShape = "round" | "heart" | "square" | "swirl" | "dome" | "star";
export interface TruffleLook {
  shape: TruffleShape;
  /** Body, shading, topping. */
  body: string;
  shade: string;
  top: string;
}
/** One look per box slot, in order (the colour hints at the house flavour). */
export const LOOKS: TruffleLook[] = [
  { shape: "round", body: "#A0673F", shade: "#7B4A2E", top: "#F3D9B5" },
  { shape: "heart", body: "#FF8FAB", shade: "#E0607F", top: "#FFFFFF" },
  { shape: "square", body: "#D9954A", shade: "#B0703A", top: "#FFF1D6" },
  { shape: "swirl", body: "#5A3221", shade: "#3E2216", top: "#C98A5B" },
  { shape: "dome", body: "#E8A0B4", shade: "#C97890", top: "#9FE5C8" },
  { shape: "star", body: "#E6B85C", shade: "#C4943A", top: "#FFF6D6" },
];

/** The house picks for any truffle the sender leaves blank. */
export const HOUSE_TRUFFLES: { name: string; reason: string }[] = [
  { name: "Hazelnut crunch", reason: "your laugh, the loud one" },
  { name: "Strawberry cream", reason: "how you say my name when you're sleepy" },
  { name: "Salted caramel", reason: "your “five more minutes” that means forty" },
  { name: "Dark 70%", reason: "you before your morning coffee. Still cute." },
  { name: "Rose pistachio", reason: "the way you hold my hand in a crowd" },
  { name: "The gold heart", reason: "just you. That's the whole recipe." },
];

export interface Truffle {
  name: string;
  reason: string;
  look: TruffleLook;
}

export interface Factory {
  to: string;
  from: string;
  pet: string;
  house: string;
  ticketLine: string;
  truffles: Truffle[];
  boxLine: string;
  catchPrize: string;
  heartLine: string;
  lastPiece: string;
  since: string;
  signOff: string;
  coupon: string;
  endLine: string;
  photos: LovePhoto[];
  song: { title: string; artist: string } | null;
}

/** "Maroon 5 - Sugar (Official Music Video)" → { title: "Sugar", artist: "Maroon 5" } */
export function cleanTitle(raw: string): { title: string; artist: string } {
  const t = raw.replace(/\s*[([【][^)\]】]*[)\]】]/g, "").replace(/\s*\|.*$/, "").replace(/\s+(ft|feat)\.?\s.*$/i, "").trim();
  const parts = t.split(/\s+[-–—]\s+/);
  if (parts.length >= 2) return { artist: parts[0].trim(), title: parts.slice(1).join(" – ").trim() };
  return { title: t, artist: "" };
}

export function readFactory(day: DayConfig, data: ValentineDayData, ytTitle?: string | null): Factory {
  const x = (data.extras ?? {}) as Record<string, unknown>;
  const from = data.senderName.trim() || "me";
  let song: Factory["song"] = null;
  if (data.musicMode === "youtube" && data.musicYoutubeId) {
    const known = suggestionFor(data.musicYoutubeId, day.music?.suggestions);
    if (known) song = { title: known.title, artist: known.artist };
    else if (ytTitle) song = cleanTitle(ytTitle);
  }
  const raw = Array.isArray(x.flavours) ? (x.flavours as unknown[]) : [];
  const truffles: Truffle[] = LOOKS.map((look, i) => {
    const r = (raw[i] ?? {}) as Record<string, unknown>;
    return { name: str(r.name) || HOUSE_TRUFFLES[i].name, reason: str(r.reason) || HOUSE_TRUFFLES[i].reason, look };
  });
  return {
    to: data.recipientName.trim() || "you",
    from,
    pet: data.petName.trim(),
    house: str(x.houseName) || `${from}'s Chocolate Factory`,
    ticketLine: str(x.openingLine) || "Admit one · unlimited chocolate · forever",
    truffles,
    boxLine: str(x.boxLine) || "Six reasons. One box. All you.",
    catchPrize: str(x.catchPrize) || "kisses I owe you",
    heartLine: str(x.heartLine) || "I saved the sweetest part for you.",
    lastPiece: str(x.lastPiece) || "The bigger half is always yours.",
    since: str(x.sinceDate),
    // "Forever yours," (the name left off) gets the sender's name.
    signOff: /,$/.test(str(x.signOff)) ? `${str(x.signOff)} ${from}` : str(x.signOff),
    coupon: str(x.coupon) || "Valid for one real chocolate date. My treat.",
    endLine: data.endLine.trim(),
    photos: (data.photos ?? []).filter((p) => p && p.url),
    song,
  };
}

/** Photo i, cycling through what exists (null when there are none). */
export const pick = (photos: LovePhoto[], i: number): LovePhoto | null => (photos.length ? photos[i % photos.length] : null);

/** The dipping station's strawberries: photos 2–7 (photo 1 is the chocolate bar), at least three. */
export function dipPhotos(photos: LovePhoto[]): (LovePhoto | null)[] {
  if (!photos.length) return [null, null, null];
  const rest = photos.length > 1 ? photos.slice(1, 7) : photos;
  const n = Math.max(3, rest.length);
  return Array.from({ length: n }, (_, i) => rest[i % rest.length]);
}

/** Six photos for the finale's box (cycling). */
export const boxPhotos = (photos: LovePhoto[]) => Array.from({ length: 6 }, (_, i) => pick(photos, i));

/** "kisses I owe you" → "1 kiss I owe you"? Keep it simple: the number then the prize. */
export const prizeLine = (n: number, prize: string) => `${n} ${prize}`;
