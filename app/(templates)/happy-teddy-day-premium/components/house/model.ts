// The house's data, made safe: every extra is read through here with a sensible fallback, so a half-filled
// draft, an older page (v2 "Adoption Papers" had no outfit/question; the $2 day had squeezeLines/winLine) or an
// upgrade from the $2 day still plays every room.

import type { TeddyExtrasPremium, TeddyItem } from "../../../_valentine/days/happy-teddy-day-premium";
import type { LovePhoto } from "../../../_love/types";
import type { ValentineDayData } from "../../../_valentine/types";

/** Teddy Honey + strawberry pink (research §C1 "Teddy Honey" extra). */
export const TH = {
  cream: "#FFF6E5",
  blush: "#FFE3EC",
  card: "#FFFDF8",
  honey: "#F2B36B",
  honeyDeep: "#C98A4B",
  fur: "#E8B07A",
  furDark: "#C98A55",
  furLight: "#F8D9B0",
  pink: "#FF8FAB",
  pinkDeep: "#E0607E",
  pinkSoft: "#FFD9E4",
  ink: "#5A3A1E",
  inkSoft: "#8A6248",
  mint: "#BDEBD6",
  mintDeep: "#5FB893",
  sky: "#CFE8FF",
  butter: "#FFE27A",
  lilac: "#E3D4FF",
  night: "#4B3F7A",
} as const;

export const ITEM_IDS: readonly TeddyItem[] = ["bow", "glasses", "crown", "sweater", "scarf", "flower", "cap", "bowtie"];
export const ITEM_LABEL: Record<TeddyItem, string> = {
  bow: "Bow",
  sweater: "Heart sweater",
  crown: "Crown",
  glasses: "Heart glasses",
  scarf: "Scarf",
  flower: "Flower",
  cap: "Cap",
  bowtie: "Bow tie",
};
/** Where each piece sits; one piece per spot (a new one swaps the old). */
export const ITEM_SPOT: Record<TeddyItem, "top" | "ear" | "eyes" | "neck" | "body"> = {
  bow: "ear",
  flower: "ear",
  crown: "top",
  cap: "top",
  glasses: "eyes",
  scarf: "neck",
  bowtie: "neck",
  sweater: "body",
};
export const isItem = (v: unknown): v is TeddyItem => typeof v === "string" && (ITEM_IDS as readonly string[]).includes(v);

export function wear(worn: TeddyItem[], id: TeddyItem): TeddyItem[] {
  if (worn.includes(id)) return worn.filter((w) => w !== id);
  return [...worn.filter((w) => ITEM_SPOT[w] !== ITEM_SPOT[id]), id];
}

export interface Piece {
  item: TeddyItem;
  note: string;
}

export interface House {
  recipient: string;
  /** What he calls her: the pet name, or her name. */
  callHer: string;
  sender: string;
  teddyName: string;
  parcel: string;
  firstWords: string;
  /** The wardrobe: the sender's pieces (with notes) first, then plain extras, six in all. */
  wardrobe: Piece[];
  rules: string[];
  birthPlace: string;
  temperament: string;
  signOff: string;
  question: string;
  yesLine: string;
  /** The letter in squeeze-sized bubbles. */
  bubbles: string[];
  letter: string;
  /** Her photo: the heart of teddies at the YES, and the certificate. */
  hero: LovePhoto | null;
  /** His photo album: photos 2–8 (or the hero alone when it's the only one). */
  album: LovePhoto[];
  initials: string;
}

const s = (v: unknown, fb = ""): string => (typeof v === "string" && v.trim() ? v.trim() : fb);
const strs = (v: unknown): string[] => (Array.isArray(v) ? v.map((x) => s(x)).filter(Boolean) : []);
const initial = (n: string) => (n.trim().match(/\p{L}/u)?.[0] ?? "").toUpperCase();

const RULES_FALLBACK = ["Hug daily. Twice on Mondays.", "Responds to forehead kisses.", "If you're sad, squeeze firmly. Repeat as needed."];
const EXTRA_PIECES: TeddyItem[] = ["bow", "glasses", "crown", "sweater", "scarf", "flower"];

/**
 * Splits the letter into bubbles he can say one squeeze at a time: paragraphs first, then sentences packed up to
 * ~170 characters, never more than 8 bubbles (the last ones merge).
 */
export function letterBubbles(letter: string): string[] {
  const paras = letter
    .replace(/\r/g, "")
    .split(/\n\s*\n|\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  const out: string[] = [];
  for (const p of paras) {
    if (p.length <= 190) {
      out.push(p);
      continue;
    }
    const sentences = p.match(/[^.!?…]+(?:[.!?…]+["'”’)]*|$)\s*/g)?.map((x) => x.trim()).filter(Boolean) ?? [p];
    let cur = "";
    for (const sn of sentences) {
      if (cur && (cur + " " + sn).length > 170) {
        out.push(cur);
        cur = sn;
      } else cur = cur ? `${cur} ${sn}` : sn;
    }
    if (cur) out.push(cur);
  }
  while (out.length > 8) {
    // merge the shortest neighbouring pair
    let best = 0;
    for (let i = 1; i < out.length - 1; i++) if (out[i].length + out[i + 1].length < out[best].length + out[best + 1].length) best = i;
    out.splice(best, 2, `${out[best]} ${out[best + 1]}`);
  }
  return out.length ? out : ["I love you. That's the whole letter."];
}

export function readHouse(data: ValentineDayData): House {
  const x = (data.extras ?? {}) as Partial<TeddyExtrasPremium> & Record<string, unknown>;
  const recipient = s(data.recipientName, "you");
  const sender = s(data.senderName);
  const teddyName = s(x.teddyName, "Golu").slice(0, 20);

  const raw = Array.isArray(x.outfit) ? (x.outfit as unknown[]) : [];
  const mine: Piece[] = [];
  for (const r of raw) {
    const o = (r ?? {}) as Record<string, unknown>;
    if (isItem(o.item) && !mine.some((m) => m.item === o.item)) mine.push({ item: o.item, note: s(o.note) });
  }
  const wardrobe = [...mine];
  for (const id of EXTRA_PIECES) if (wardrobe.length < 6 && !wardrobe.some((w) => w.item === id)) wardrobe.push({ item: id, note: "" });

  // v2 + the $2 day: care labels; the $2 squeeze lines fill in when nothing else is there.
  let rules = strs(x.careLines).slice(0, 5);
  if (rules.length === 0) rules = strs(x.squeezeLines).slice(0, 5);
  while (rules.length < 3) rules.push(RULES_FALLBACK[rules.length]);

  const photos = (data.photos ?? []).filter((p): p is LovePhoto => !!p && !!p.url);
  const a = initial(recipient === "you" ? "" : recipient);
  const b = initial(sender);
  const letter = s(data.letter, "I love you. That's the whole letter.");
  return {
    recipient,
    callHer: s(data.petName, recipient),
    sender,
    teddyName,
    parcel: s(x.parcelNote, "Contains one (1) hug. Handle with love."),
    firstWords: s(x.firstWords, sender ? `Hi ${recipient}! ${sender} sent me. I'm yours now.` : `Hi ${recipient}! I'm yours now.`),
    wardrobe,
    rules,
    birthPlace: s(x.birthPlace, sender ? `${sender}'s hoodie pocket` : "A very soft hoodie pocket"),
    temperament: s(x.temperament, "Clingy. Extremely huggable."),
    signOff: s(x.signOff, sender ? `Always yours, ${sender}` : ""),
    question: s(x.question, "Will you keep him forever? (Me too?)"),
    yesLine: s(x.yesLine, s(x.winLine)),
    bubbles: letterBubbles(letter),
    letter,
    hero: photos[0] ?? null,
    album: photos.length > 1 ? photos.slice(1, 9) : photos.slice(0, 1),
    initials: a && b ? `${a} + ${b}` : a || b || "♥",
  };
}
