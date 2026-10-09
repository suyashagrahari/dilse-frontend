// The night's data, made safe: every extra is read through here with a
// sensible fallback, so a half-filled draft, an old v1 page ("The Midnight
// Manor" had candleMemories / spiritQA) or an upgrade from the $2 house still
// plays the whole night.

import type { HalloweenExtrasPremium } from "../../../_valentine/days/happy-halloween-premium";
import type { HalloweenTone } from "../../../_valentine/days/happy-halloween";
import type { LovePhoto } from "../../../_love/types";
import type { ValentineDayData } from "../../../_valentine/types";

/** The palette (research §D.9: smoky gothic, not neon orange). */
export const NM = {
  aubergine: "#2B1A2F",
  night: "#120A14",
  ink: "#08050A",
  oxblood: "#5C1A1B",
  bone: "#E8DFCC",
  boneSoft: "#B9AC9A",
  candle: "#F2B35B",
  flame: "#FFE2A8",
  moss: "#3E4A35",
  pumpkin: "#E0782F",
  gold: "#E8CF8A",
  goldDeep: "#8A6A2F",
} as const;

export const GILT = "linear-gradient(115deg,#6f5022 0%,#c9a45c 22%,#f6e2a6 38%,#fff4cf 46%,#c9a45c 60%,#8a6a2f 78%,#e8cf8a 100%)";

interface ToneCopy {
  question: string;
  yes: string;
  noLines: readonly string[];
  surrender: string;
  /** Family + kids: no thunder crack, no lightning flash, the No never runs. */
  gentle: boolean;
  board: string;
}

const TONES: Record<HalloweenTone, ToneCopy> = {
  romantic: {
    question: "Will you be my boo, tonight and every Halloween after?",
    yes: "Yes, obviously",
    noLines: ["*floats away*", "boo… I mean no?", "ghosts can't hold buttons"],
    surrender: "Fine. Yes. 💜",
    gentle: false,
    board: "The spirits are listening",
  },
  friends: {
    question: "Will you be my boo-st friend forever?",
    yes: "Bestie-ghoul for life",
    noLines: ["*vanishes*", "nice try, bestie", "I'm see-through, sorry"],
    surrender: "Fine. Forever. 🦇",
    gentle: false,
    board: "The spirits are listening",
  },
  family: {
    question: "Will you be my favourite little pumpkin?",
    yes: "Yes, always",
    noLines: [],
    surrender: "Yes",
    gentle: true,
    board: "The magic board is listening",
  },
  kids: {
    question: "Ready for a spooky-sweet adventure?",
    yes: "Yes!",
    noLines: [],
    surrender: "Yes!",
    gentle: true,
    board: "The magic board is listening",
  },
};

export interface Night {
  tone: HalloweenTone;
  copy: ToneCopy;
  gentle: boolean;
  recipient: string;
  sender: string;
  manor: string;
  title: string;
  notes: string[];
  /** A–Z only. */
  boardName: string;
  boardWord: string;
  boardLine: string;
  tarot: { card: string; line: string; position: "Past" | "Present" | "Future" }[];
  duo: string;
  question: string;
  yesLine: string;
  /** The last portrait (the reveal) and the hall's portraits. */
  hero: LovePhoto | null;
  hall: LovePhoto[];
  /** Every photo, for the ending's gallery. */
  photos: LovePhoto[];
}

const s = (v: unknown, fb = ""): string => (typeof v === "string" && v.trim() ? v.trim() : fb);
const letters = (v: string, max: number) =>
  v
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, max);

const POSITIONS = ["Past", "Present", "Future"] as const;
const TAROT_FALLBACK = [
  { card: "The Moon", line: "Every late night that turned into a story." },
  { card: "The Lovers", line: "You, obviously." },
  { card: "The Sun", line: "More of this. Every October after." },
];

export function readNight(data: ValentineDayData): Night {
  const x = (data.extras ?? {}) as Partial<HalloweenExtrasPremium> & Record<string, unknown>;
  const tone: HalloweenTone = (["romantic", "friends", "family", "kids"] as const).includes(x.tone as HalloweenTone) ? (x.tone as HalloweenTone) : "romantic";
  const copy = TONES[tone];

  // v1 pages carried candleMemories; the $2 house carries nothing here.
  const rawNotes = Array.isArray(x.wallNotes) ? x.wallNotes : Array.isArray(x.candleMemories) ? (x.candleMemories as unknown[]) : [];
  const notes = rawNotes.map((n) => s(n)).filter(Boolean).slice(0, 3);

  const rawTarot = Array.isArray(x.tarot) ? (x.tarot as unknown[]) : [];
  const tarot = POSITIONS.map((position, i) => {
    const t = (rawTarot[i] ?? {}) as Record<string, unknown>;
    return { card: s(t.card, TAROT_FALLBACK[i].card), line: s(t.line, TAROT_FALLBACK[i].line), position };
  });

  const photos = (data.photos ?? []).filter((p): p is LovePhoto => !!p && !!p.url);
  const recipient = s(data.recipientName, "you");
  return {
    tone,
    copy,
    gentle: copy.gentle,
    recipient,
    sender: s(data.senderName),
    manor: s(x.houseName, "The Manor"),
    title: s(x.nightTitle, "The Haunting of Us"),
    notes,
    boardName: letters(recipient === "you" ? "" : recipient, 12),
    boardWord: letters(s(x.spiritWord, "MINE"), 10) || "MINE",
    boardLine: s(x.spiritLine),
    tarot,
    duo: s(x.costumeDuo),
    question: s(x.question, copy.question),
    yesLine: s(x.yesLine),
    hero: photos[0] ?? null,
    hall: photos.slice(1, 4),
    photos,
  };
}

/** "The Lovers" → its Major Arcana numeral (decoration only; unknown cards get a star). */
export function arcanaNumeral(card: string): string {
  const k = card.toLowerCase();
  const table: [RegExp, string][] = [
    [/fool/, "0"], [/magician/, "I"], [/priestess/, "II"], [/empress/, "III"], [/emperor/, "IV"], [/hierophant/, "V"],
    [/lovers?/, "VI"], [/chariot/, "VII"], [/strength/, "VIII"], [/hermit/, "IX"], [/wheel|fortune/, "X"], [/justice/, "XI"],
    [/hanged/, "XII"], [/temperance/, "XIV"], [/devil/, "XV"], [/tower/, "XVI"], [/star/, "XVII"], [/moon/, "XVIII"],
    [/sun/, "XIX"], [/judg/, "XX"], [/world/, "XXI"],
  ];
  for (const [re, n] of table) if (re.test(k)) return n;
  return "✦";
}
