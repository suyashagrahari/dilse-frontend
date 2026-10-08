// The manor's data, made safe: every extra read through here falls back to a
// sensible default, so a half-filled draft, an old page or an upgrade from the
// $2 house still plays the whole night.

import type { HalloweenExtrasPremium, ManorAnswer } from "../../../_valentine/days/happy-halloween-premium";
import type { HalloweenTone } from "../../../_valentine/days/happy-halloween";
import type { ValentineDayData } from "../../../_valentine/types";

export const MM = {
  ink: "#0B0A14",
  storm: "#1A1633",
  dusk: "#2A2350",
  moon: "#DCE3F2",
  candle: "#FFC86B",
  flame: "#FFF1B8",
  ember: "#FF7A2F",
  mint: "#7FF5D8",
  wax: "#7A1E2C",
  waxHi: "#B23A48",
  plum: "#3A1F45",
  gold: "#E9B95A",
  goldDeep: "#9A6A1F",
  parchment: "#F4E9D2",
  parchmentInk: "#3B2414",
  rose: "#FFB3A7",
  amber: "#FFD49A",
} as const;

export interface ToneCopy {
  question: string;
  nightTitle: string;
  yes: string;
  noLines: readonly string[];
  surrender: string;
  /** Family + kids: no lightning, no thunder crack, no running No, no "beyond". */
  gentle: boolean;
  board: string;
  radio: (sender: string) => string;
  psSeal: string;
}

export const MANOR_TONES: Record<HalloweenTone, ToneCopy> = {
  romantic: {
    question: "Will you be my boo, tonight and every Halloween after?",
    nightTitle: "The Haunting of Us",
    yes: "YES, I'm your boo 💜",
    noLines: ["*drifts away*", "boo… I mean no?", "ghosts can't hold buttons"],
    surrender: "Fine… YES? 👻",
    gentle: false,
    board: "The Spirit Board",
    radio: () => "A message from beyond",
    psSeal: "Open only if you're scared",
  },
  friends: {
    question: "Will you be my boo-st friend forever?",
    nightTitle: "Ghouls Night Out",
    yes: "Bestie-ghoul for life 🦇",
    noLines: ["*vanishes*", "nice try, bestie", "I'm see-through, sorry"],
    surrender: "Fine… YES 🦇",
    gentle: false,
    board: "The Spirit Board",
    radio: () => "A message from beyond",
    psSeal: "Open only if you're scared",
  },
  family: {
    question: "Will you be my favourite little pumpkin?",
    nightTitle: "The Pumpkin Patch Mystery",
    yes: "Yes, I'm your pumpkin 🎃",
    noLines: [],
    surrender: "",
    gentle: true,
    board: "The Magic Letter Board",
    radio: (s) => `A message from ${s}`,
    psSeal: "Open only when you miss me",
  },
  kids: {
    question: "Ready for a spooky-sweet adventure?",
    nightTitle: "The Friendly Manor",
    yes: "Yes, let's go! 🍭",
    noLines: [],
    surrender: "",
    gentle: true,
    board: "The Magic Letter Board",
    radio: (s) => `A message from ${s}`,
    psSeal: "Open only at bedtime",
  },
};

const TONE_KEYS = Object.keys(MANOR_TONES) as HalloweenTone[];
const ANSWERS: ManorAnswer[] = ["YES", "NO", "ALWAYS", "SOON"];
export const clean = (v: unknown) => (typeof v === "string" ? v.trim() : "");

const DEFAULT_CANDLES = [
  "The first time you made me laugh until it hurt",
  "Every late-night call that should have ended hours earlier",
  "The way you look at me when you think I'm not looking",
];
const DEFAULT_QA: Manor["qa"] = [
  { q: "Do they think about me at midnight?", answer: "ALWAYS", line: "And at 12:01. And 12:02." },
];
const DEFAULT_INGREDIENTS = [
  { name: "A pinch of your laugh", line: "the loud one, at the worst moment" },
  { name: "One stolen fry", line: "you always take the crispy one" },
  { name: "A spoon of moonlight", line: "for every late-night walk" },
];

/** A–Z only (the board has no other letters); non-Latin names spell YOU. */
export function boardWord(s: string, max = 10, fallback = "YOU") {
  const up = s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
  return (up || fallback).slice(0, max);
}

export interface Manor {
  tone: HalloweenTone;
  T: ToneCopy;
  gentle: boolean;
  recipient: string;
  sender: string;
  manorName: string;
  nightTitle: string;
  candles: string[];
  spiritName: string;
  spiritWord: string;
  qa: { q: string; answer: ManorAnswer; line: string }[];
  ingredients: { name: string; line: string }[];
  prophecy: string;
  question: string;
  yesLine: string;
  guest: string;
}

export function readManor(data: ValentineDayData): Manor {
  const x = (data.extras ?? {}) as Partial<HalloweenExtrasPremium>;
  const tone = TONE_KEYS.includes(x.tone as HalloweenTone) ? (x.tone as HalloweenTone) : "romantic";
  const T = MANOR_TONES[tone];
  const recipient = clean(data.recipientName) || "You";
  const sender = clean(data.senderName) || "Someone";
  const candles = (Array.isArray(x.candleMemories) ? x.candleMemories : []).map(clean).filter(Boolean).slice(0, 5);
  const qa = (Array.isArray(x.spiritQA) ? x.spiritQA : [])
    .map((r) => ({ q: clean(r?.q), answer: (ANSWERS.includes(r?.answer as ManorAnswer) ? r?.answer : "YES") as ManorAnswer, line: clean(r?.line) }))
    .filter((r) => r.q)
    .slice(0, 3);
  const ings = (Array.isArray(x.ingredients) ? x.ingredients : []).map((r) => ({ name: clean(r?.name), line: clean(r?.line) })).filter((r) => r.name);
  const q = clean(x.question);
  const isOtherToneDefault = TONE_KEYS.some((k) => k !== tone && MANOR_TONES[k].question === q);
  return {
    tone,
    T,
    gentle: T.gentle,
    recipient,
    sender,
    manorName: clean(x.houseName) || "The Midnight Manor",
    nightTitle: clean(x.nightTitle) || T.nightTitle,
    candles: candles.length >= 3 ? candles : [...candles, ...DEFAULT_CANDLES].slice(0, Math.max(3, candles.length)),
    spiritName: boardWord(recipient.split(/\s+/)[0]),
    spiritWord: boardWord(clean(x.spiritWord), 10, "BOO"),
    qa: qa.length ? qa : DEFAULT_QA,
    ingredients: [...ings, ...DEFAULT_INGREDIENTS].slice(0, 3),
    prophecy: clean(x.prophecy) || "Many more midnights. Same two ghosts.",
    question: q && !isOtherToneDefault ? q : T.question,
    yesLine: clean(x.yesLine) || "Booked. Booed. Yours. See you at sunrise.",
    guest: clean(x.specialGuest),
  };
}

/** First letter of a name, upper-cased (whatever script it is in). */
export const initialOf = (s: string) => Array.from(s.trim())[0]?.toLocaleUpperCase() ?? "";
