// The night's data, made safe: every extra is read through here with a
// sensible fallback, so a half-filled draft, an older page (v1/v2 had
// wallNotes / tarot, the $2 house has trickLine / ingredients) or an upgrade
// from the $2 day still plays the whole night.

import type { HalloweenExtrasPremium } from "../../../_valentine/days/happy-halloween-premium";
import type { HalloweenTone } from "../../../_valentine/days/happy-halloween";
import type { LovePhoto } from "../../../_love/types";
import type { ValentineDayData } from "../../../_valentine/types";

/** Pumpkin Candy Night (research §C1). */
export const BN = {
  night: "#3B2D6E",
  night2: "#4A3A80",
  plum: "#6A4C96",
  cream: "#FFF4E3",
  card: "#FFFBF4",
  lilac: "#C9B6FF",
  lilacDeep: "#8E6FE0",
  orange: "#FF9A3C",
  orangeDeep: "#E06A12",
  ink: "#2A1F3D",
  inkSoft: "#6B5A86",
  onNight: "#FFF7EC",
  mint: "#9BE7C4",
  pink: "#FF9EC4",
  pinkDeep: "#F06BA4",
  candle: "#FFD27A",
} as const;

interface ToneCopy {
  question: string;
  yes: string;
  noLines: readonly string[];
  surrender: string;
  /** Family + kids: no No button, gentler jokes. */
  gentle: boolean;
  license: string;
  licensed: string;
}

const TONES: Record<HalloweenTone, ToneCopy> = {
  romantic: {
    question: "Will you be my boo, this Halloween and every one after?",
    yes: "Yes, obviously 🧡",
    noLines: ["boo… I mean no?", "*floats away*", "I'm see-through, sorry", "ghosts can't say no"],
    surrender: "Fine, yes 👻",
    gentle: false,
    license: "Boo License",
    licensed: "Certified boo of",
  },
  friends: {
    question: "Will you be my boo-st friend forever?",
    yes: "Bestie for life 🦇",
    noLines: ["*vanishes*", "nice try, bestie", "I'm see-through, sorry", "ghosts can't say no"],
    surrender: "Fine, forever 🦇",
    gentle: false,
    license: "Boo-st Friend License",
    licensed: "Certified bestie of",
  },
  family: {
    question: "Will you be my favourite little pumpkin?",
    yes: "Yes, always 🎃",
    noLines: [],
    surrender: "Yes",
    gentle: true,
    license: "Favourite Pumpkin License",
    licensed: "Favourite pumpkin of",
  },
  kids: {
    question: "Ready for a spooky-sweet adventure?",
    yes: "Yes! 🍭",
    noLines: [],
    surrender: "Yes!",
    gentle: true,
    license: "Junior Ghost License",
    licensed: "Best little ghost of",
  },
};

export interface Ingredient {
  name: string;
  line: string;
}

export interface Night {
  tone: HalloweenTone;
  copy: ToneCopy;
  gentle: boolean;
  recipient: string;
  sender: string;
  pet: string;
  house: string;
  treats: string[];
  ingredients: Ingredient[];
  spell: string;
  perks: string[];
  duo: string;
  question: string;
  yesLine: string;
  /** Her photo in the moonlight (the YES) and on the license. */
  hero: LovePhoto | null;
  /** The ghost booth: photos 2–5 (or the hero alone when it's the only one). */
  booth: LovePhoto[];
  photos: LovePhoto[];
  initials: string;
}

const s = (v: unknown, fb = ""): string => (typeof v === "string" && v.trim() ? v.trim() : fb);
const strs = (v: unknown): string[] => (Array.isArray(v) ? v.map((x) => s(x)).filter(Boolean) : []);

const TREATS_FALLBACK = [
  "Treat: one tight hug, delivered tonight.",
  "Trick: you owe me a dance in the kitchen.",
  "Treat: I'll share my last piece of candy. Only with you.",
];
const INGREDIENTS_FALLBACK: Ingredient[] = [
  { name: "A pinch of stardust", line: "every late night that turned into a story" },
  { name: "A drop of your laugh", line: "the one I'd play on repeat" },
  { name: "A sprinkle of hugs", line: "the long ones, the ones that fix things" },
];
const PERKS_FALLBACK = ["Unlimited hoodie access", "First pick of the candy", "Hugs on demand"];

const initial = (n: string) => (n.trim().match(/\p{L}/u)?.[0] ?? "").toUpperCase();

export function readNight(data: ValentineDayData): Night {
  const x = (data.extras ?? {}) as Partial<HalloweenExtrasPremium> & Record<string, unknown>;
  const tone: HalloweenTone = (["romantic", "friends", "family", "kids"] as const).includes(x.tone as HalloweenTone) ? (x.tone as HalloweenTone) : "romantic";
  const copy = TONES[tone];

  // Older pages: the $2 house's single trickLine, v2's wall notes.
  let treats = strs(x.treats).slice(0, 5);
  if (treats.length === 0) {
    const legacy = [s(x.trickLine), ...strs(x.wallNotes).map((n) => `Treat: ${n}`)].filter(Boolean);
    treats = legacy.length ? legacy.slice(0, 5) : TREATS_FALLBACK;
  }
  while (treats.length < 3) treats.push(TREATS_FALLBACK[treats.length]);

  const rawIng = Array.isArray(x.ingredients) ? (x.ingredients as unknown[]) : [];
  const ingredients = [0, 1, 2].map((i) => {
    const r = (rawIng[i] ?? {}) as Record<string, unknown>;
    return { name: s(r.name, INGREDIENTS_FALLBACK[i].name), line: s(r.line, s(r.name) ? "" : INGREDIENTS_FALLBACK[i].line) };
  });

  const perks = strs(x.perks).slice(0, 3);
  const photos = (data.photos ?? []).filter((p): p is LovePhoto => !!p && !!p.url);
  const recipient = s(data.recipientName, "you");
  const sender = s(data.senderName);
  const a = initial(recipient === "you" ? "" : recipient);
  const b = initial(sender);
  return {
    tone,
    copy,
    gentle: copy.gentle,
    recipient,
    sender,
    pet: s(data.petName),
    house: s(x.houseName, "Villa Boo-tiful"),
    treats,
    ingredients,
    spell: s(x.potionSpell, "One sip and you're stuck with me. Every October after."),
    perks: perks.length ? perks : PERKS_FALLBACK,
    duo: s(x.costumeDuo),
    question: s(x.question, copy.question),
    yesLine: s(x.yesLine),
    hero: photos[0] ?? null,
    booth: photos.length > 1 ? photos.slice(1, 5) : photos.slice(0, 1),
    photos,
    initials: a && b ? `${a} + ${b}` : a || b || "♥",
  };
}

/** "Treat: …" / "Trick: …" → the label and the line. */
export function splitTreat(t: string): { kind: "treat" | "trick" | ""; line: string } {
  const m = /^\s*(treat|trick)\s*[:!\-–]\s*/i.exec(t);
  if (!m) return { kind: "", line: t };
  return { kind: m[1].toLowerCase() as "treat" | "trick", line: t.slice(m[0].length) };
}
