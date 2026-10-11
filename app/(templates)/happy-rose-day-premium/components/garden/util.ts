// Pure helpers for "The Rose Garden": read the page defensively, the colours and what each one says from him,
// the fixed sticker GIFs (beyond the six editable slots), and small maths.

import type { LovePhoto } from "../../../_love/types";
import type { ValentineDayData } from "../../../_valentine/types";

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

export type RoseColor = "red" | "pink" | "lavender" | "peach" | "white" | "yellow" | "orange" | "coral";
export const ALL_COLORS: RoseColor[] = ["red", "pink", "yellow", "peach", "white", "lavender", "orange", "coral"];

/** The swatch on the colour chips. */
export const SWATCH: Record<RoseColor, string> = {
  red: "#E0284A",
  pink: "#FF8FB5",
  lavender: "#B39DDB",
  peach: "#FFB38A",
  white: "#FFF6EE",
  yellow: "#FFD54F",
  orange: "#FF8A50",
  coral: "#FF7F6E",
};

export const COLOR_NAME: Record<RoseColor, string> = {
  red: "Red",
  pink: "Pink",
  lavender: "Lavender",
  peach: "Peach",
  white: "White",
  yellow: "Yellow",
  orange: "Orange",
  coral: "Coral",
};

/** What each colour says, in his voice (the sticky note). His own pick shows his reason instead. */
export const COLOR_SAYS: Record<RoseColor, string> = {
  red: "because I'm completely, hopelessly in love with you.",
  pink: "because you still make me shy.",
  yellow: "because you were my best friend first.",
  peach: "because thank you for choosing me.",
  white: "because every day with you feels brand new.",
  lavender: "because it was love at first sight. Mine, anyway.",
  orange: "because life with you is never boring.",
  coral: "because I'm so proud of you.",
};

export interface Garden {
  to: string;
  from: string;
  pet: string;
  color: RoseColor;
  colorReason: string;
  opening: string;
  question: string;
  yesLine: string;
  since: string;
  signOff: string;
  shayari: string;
  photos: LovePhoto[];
}

export function readGarden(data: ValentineDayData): Garden {
  const x = (data.extras ?? {}) as Record<string, unknown>;
  const color = ALL_COLORS.includes(x.roseColor as RoseColor) ? (x.roseColor as RoseColor) : "red";
  return {
    to: data.recipientName.trim() || "you",
    from: data.senderName.trim() || "Someone",
    pet: (data.petName ?? "").trim(),
    color,
    colorReason: str(x.colorReason),
    opening: str(x.openingLine) || "I couldn't send you a garden, so I grew you one.",
    question: str(x.question) || "Will you keep my rose forever?",
    yesLine: str(x.yesLine) || "Then it's yours. So am I.",
    since: str(x.sinceDate),
    signOff: str(x.signOff),
    shayari: str(x.shayari),
    photos: (data.photos ?? []).filter((p) => p && typeof p.url === "string" && p.url).slice(0, 12),
  };
}

/** The chips she sees: six classics, plus his colour if it isn't one of them. */
export function chipColors(his: RoseColor): RoseColor[] {
  const six: RoseColor[] = ["red", "pink", "yellow", "peach", "white", "lavender"];
  return six.includes(his) ? six : [his, ...six.slice(0, 5)];
}

// ─── Fixed stickers (our library, not sender-editable) ──────────────────────────
const G = "https://cdn.subhsandesh.in/gifts-media/templates/_premium/gifs";
export const FIXED_GIF = {
  /** Watering done: a bunny lounging in roses. */
  bunnyRoses: `${G}/rose-day/bunny-rose-bed.webp`,
  /** The loves-me suspense (blushing, nervous). */
  nervous: `${G}/common/noto-flushed.webp`,
  /** The singing rose's friend. */
  penguinRose: `${G}/rose-day/penguin-holding-rose.webp`,
  /** The bouquet table. */
  penguinsBouquet: `${G}/rose-day/penguins-bouquet.webp`,
  /** Asking nicely, beside the question. */
  pandaOffers: `${G}/rose-day/panda-offers-rose.webp`,
  /** Each No. */
  sad: `${G}/hug-day/bear-comforts-crying.webp`,
  /** The diary page. */
  flowersForYou: `${G}/rose-day/penguins-flowers-for-you.webp`,
  /** The reply. */
  catHeart: `${G}/hug-day/cat-big-heart-hug.webp`,
} as const;

/** Paragraphs of the letter (blank-line separated). */
export function paragraphs(s: string): string[] {
  return s
    .replace(/\r/g, "")
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** Deterministic 0–1 noise (positions that never jump between renders). */
export const rand = (i: number, salt = 1) => {
  const v = Math.sin(i * 127.1 * salt + salt * 311.7) * 43758.5453;
  return v - Math.floor(v);
};
