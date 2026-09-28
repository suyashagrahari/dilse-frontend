// ─── Vending Machine — shared type contract ──────────────────────────────────
//
// Single source of truth for the shape shared by the editor, the published
// viewer and the server payload. Field names here === server model field names
// === wire-format keys (flat payload). Keep them in sync.

import { seededInt, seededSpread } from "@/lib/seededRandom";
import { bodyFromKeys, bool, clampNum, list, num, obj, oneOf, str, strList, strOr, type Raw } from "@/lib/wire";
import { templateMedia } from "@/lib/templateMedia";
import {
  DEMO_PHOTOS,
  MAX_GIFS,
  parseLoveGifs,
  parseLoveLetter,
  parseLovePhotos,
  parseTheme,
  type LovePhoto,
} from "../../_love/types";
import { DEFAULT_VEND_THEME, VEND_THEME_IDS } from "./themes";

export type EditMode = null | "manual" | "preview";

export interface Toast {
  id: number;
  type: "success" | "info" | "publish";
  title: string;
  message?: string;
}

export type SlotKind = "compliment" | "memory" | "voucher" | "empty";
export const SLOT_KINDS: SlotKind[] = ["compliment", "memory", "voucher", "empty"];

export interface Slot {
  /** "A1".."C6" */
  code: string;
  kind: SlotKind;
  /** Shelf-tag text. Truncated with an ellipsis past SHELF_LABEL_MAX. */
  label: string;
  /** The full text revealed on the coupon. */
  payload: string;
  /** In credits. Almost always 1. */
  price: number;
  soldOut: boolean;
  /** The sender picks exactly ONE slot that jams. */
  sticks: boolean;
}

export interface VendingData {
  machineName: string;
  senderName: string;
  recipientName: string;
  slots: Slot[];
  /** Questions the machine asks to earn credit. */
  creditPrompts: string[];
  /** Scrolling LED copy, joined with "  ·  ". */
  displayIdleMessages: string[];
  /**
   * Love kit: the limited-edition memory cards. Each photo is a collectible
   * card (M1, M2…) in the card vendor under the machine, framed in the editor,
   * with a caption (the card's title) and a note printed on its back.
   */
  photos: LovePhoto[];
  /** Up to three GIF/animated-sticker links — the machine's own lead the picker. */
  gifs: string[];
  /** The main letter — printed as the secret prize at the foot of the receipt. */
  letter: string;
  /** A VEND_THEMES id. */
  theme: string;
}

/**
 * What the recipient typed to earn credit. Collected in component state during
 * the session and POSTed to the sender's page.
 *
 * PRIVACY — decided deliberately, see PRIVACY_NOTICE below. These answers are
 * personal text written by someone who never signed up for anything. They go to
 * the SENDER ONLY: stored on the sender's page document so they can read them
 * back, never aggregated, never used for anything else. The machine must say so
 * on screen before it accepts the first answer.
 */
export interface CreditAnswer {
  prompt: string;
  answer: string;
}

/** Must be rendered near the input, before the first answer is submitted. */
export const PRIVACY_NOTICE = "What you type here goes to " as const;
export const PRIVACY_NOTICE_TAIL = " and nobody else. We don't keep it." as const;

// ─── Machine geometry ────────────────────────────────────────────────────────

export const ROWS = ["A", "B", "C"] as const;
export const COLS = [1, 2, 3, 4, 5, 6] as const;
export const SLOT_CODES: string[] = ROWS.flatMap((r) => COLS.map((c) => `${r}${c}`));
export const SLOT_COUNT = SLOT_CODES.length; // 18
export const SHELF_LABEL_MAX = 22;

/** A joke that costs one boolean: A1 is the sender's own, and never vends. */
export const RESERVED_SLOT = "A1";
export const RESERVED_MESSAGE = "THAT ONE'S MINE.";

export const isValidSlotCode = (code: string): boolean => SLOT_CODES.includes(code.toUpperCase());

/** Shelf tags truncate; the coupon always carries the full text. */
export const shelfLabel = (label: string): string =>
  label.length > SHELF_LABEL_MAX ? `${label.slice(0, SHELF_LABEL_MAX - 1)}…` : label;

// ─── Purchase sequence timings (ms) ──────────────────────────────────────────
// Exported as data so the renderer, the reduced-motion path and any test all
// agree on one timeline. The drop easing is the product; do not linearise it.

export const VEND = {
  coilRotateMs: 1100,
  /** Real motors stutter. A perfectly smooth coil reads as CSS. */
  stutterAtPct: 0.4,
  stutterMs: 60,
  tipAtMs: 930,
  tipMs: 140,
  fallStartMs: 1070,
  fallMs: 380,
  /** Gravity accelerates. Never ease-out, never linear. */
  fallEasing: "cubic-bezier(0.55, 0, 1, 0.45)",
  impactAtMs: 1450,
  flapOutMs: 80,
  flapBackMs: 160,
  joltMs: 90,
  collectAtMs: 1600,
  idleAfterMs: 2000,
  /** Stuck-item resolution — never a dead end. */
  shakesRequired: 3,
  shakeDebounceMs: 400,
  shakeThreshold: 14, // m/s²
  stuckOverrideMs: 20000,
} as const;

/** Deterministic tumble so an item lands the same way on every render. */
export const tumbleFor = (code: string): number => seededSpread(code, "tumble", 25) + 65;
export const itemTiltFor = (code: string, index: number): number =>
  (index % 2 === 0 ? 1 : -1) * (3 + seededInt(code, "tilt", 0, 2));

// ─── Coupon ──────────────────────────────────────────────────────────────────

export interface Coupon {
  code: string;
  serial: string;
  label: string;
  payload: string;
  redeemed: boolean;
}

export const couponSerial = (machineSerial: string, code: string): string =>
  `RH-${code}-${machineSerial}`;

export const MACHINE_SERIAL = "0447";
export const MACHINE_MODEL = "MODEL RH-4402";

// ─── Component contract ──────────────────────────────────────────────────────

export interface VendingMachineTemplateProps {
  data: VendingData;
  mode: "demo" | "live";
  shareId?: string;
  hasPassword?: boolean;
}

// ─── The machine's own animated stickers ─────────────────────────────────────
// Already used by the machine itself (credit accepted, the thinking prompt, the
// coupon, the jam, sold out). They lead the GIF picker and are the demo's
// stickers. Three are .webm, which an <img> cannot play — every place this
// template renders a GIF goes through <GifSticker>, which picks <video> for them.

export const MACHINE_GIFS: { url: string; label: string }[] = [
  { url: templateMedia("vending-machine", "credit-accepted.webp"), label: "credit accepted" },
  { url: templateMedia("vending-machine", "prompt-thinking.webp"), label: "i'm thinking" },
  { url: templateMedia("vending-machine", "coupon-reading.webm"), label: "reading it" },
  { url: templateMedia("vending-machine", "shake-it.webm"), label: "shake it" },
  { url: templateMedia("vending-machine", "sold-out.webm"), label: "sold out" },
];

export const isVideoGif = (url: string): boolean => /\.(webm|mp4)(\?|#|$)/i.test(url);

// ─── Memory cards ────────────────────────────────────────────────────────────

/** "M1".."M10" — the card vendor's codes. */
export const cardCode = (i: number): string => `M${i + 1}`;

/** Every card is rare; the last one in the set is always the 1 of 1. */
export function cardRarity(i: number, total: number): { label: string; stars: number } {
  if (i === total - 1 && total > 1) return { label: "1 OF 1", stars: 5 };
  const tiers = [
    { label: "RARE", stars: 2 },
    { label: "SUPER RARE", stars: 3 },
    { label: "ULTRA RARE", stars: 4 },
    { label: "HOLO RARE", stars: 3 },
    { label: "SECRET RARE", stars: 4 },
  ];
  return tiers[i % tiers.length];
}

// ─── Demo data ───────────────────────────────────────────────────────────────

const demoSlot = (
  code: string, kind: SlotKind, label: string, payload: string,
  extra?: Partial<Slot>,
): Slot => ({ code, kind, label, payload, price: 1, soldOut: false, sticks: false, ...extra });

export const DEMO_DATA: VendingData = {
  machineName: "AFFECTION DISPENSER",
  senderName: "Rohan",
  recipientName: "Ananya",
  slots: [
    demoSlot("A1", "empty", "RESERVED", "This one's mine. I'm keeping it.", { soldOut: true }),
    demoSlot("A2", "compliment", "you, arguing", "You argue like someone who has already decided, and you are usually right, which is the annoying part."),
    demoSlot("A3", "memory", "the 2 AM maggi", "The night the gas went out and we ate half-cooked maggi on the floor and you said it was the best meal of your life. You were lying. I still think about it."),
    demoSlot("A4", "voucher", "one (1) real apology", "Redeemable for one genuine, non-defensive apology. No conditions. No 'but'. Expires never."),
    demoSlot("A5", "compliment", "your terrible laugh", "It is loud, it is ugly, and it has fixed more of my bad days than anything else."),
    demoSlot("A6", "memory", "the airport, 2024", "You ran. Actually ran. In a crowded terminal. I have never been more embarrassed or more sure."),
    demoSlot("B1", "voucher", "one silent car ride", "Redeemable for one long drive where neither of us has to say anything."),
    demoSlot("B2", "compliment", "how you handle me", "You have never once made me feel like a project."),
    demoSlot("B3", "memory", "your grandmother's kitchen", "She handed me chai without asking how I take it, and got it exactly right, and you looked at me like that meant something. It did."),
    demoSlot("B4", "voucher", "the last slice. always.", "Permanent, non-revocable claim to the last slice of anything.", { sticks: true }),
    demoSlot("B5", "compliment", "you at 6 AM", "Unbrushed, furious, monosyllabic. My favourite version."),
    demoSlot("B6", "memory", "the power cut", "Four hours, no phones, and you talked about your father for the first time."),
    demoSlot("C1", "voucher", "one won argument", "Redeemable for one argument I will concede immediately regardless of merit."),
    demoSlot("C2", "compliment", "your handwriting", "Illegible. Confident. Entirely you."),
    demoSlot("C3", "memory", "the first monsoon", "You refused the umbrella on principle and then complained for an hour. I would do it again."),
    demoSlot("C4", "compliment", "you when you're wrong", "You get very quiet and very polite, and it is the funniest thing I have ever seen."),
    demoSlot("C5", "voucher", "one no-questions yes", "One request. Any request. I say yes and I don't ask why."),
    demoSlot("C6", "memory", "right now", "Whatever you are doing while you read this — that's the bit I'd want back."),
  ],
  creditPrompts: [
    "ONE THING YOU LOVE ABOUT HIM",
    "SOMETHING YOU'VE NEVER SAID OUT LOUD",
    "THE LAST TIME HE MADE YOU LAUGH",
    "ONE THING YOU'D CHANGE. BE HONEST.",
    "WHAT YOU THOUGHT THE FIRST TIME YOU SAW HIM",
  ],
  displayIdleMessages: [
    "WELCOME", "SELECT ITEM", "PLEASE COLLECT ITEM",
    "THANK YOU", "HAVE A NICE DAY", "I MEAN IT",
  ],
  photos: [
    { ...DEMO_PHOTOS[0], caption: "the first sunset", note: "Limited edition, because there was only ever one. You said the sky looked like mango lassi and I stopped looking at the sky." },
    { ...DEMO_PHOTOS[1], caption: "date night, round 1", note: "You stole my fries and then my heart. In that order. I have been meaning to file a complaint for two years." },
    { ...DEMO_PHOTOS[2], caption: "cherry blossom era", note: "Even the trees were showing off that day. They lost." },
    { ...DEMO_PHOTOS[3], caption: "us, no re-rolls", note: "Out of every timeline, I'd pick this one. Every single time. Don't even offer me the others." },
    { ...DEMO_PHOTOS[0], caption: "same day, zoomed in", note: "I zoomed in on your face. Obviously. Rarest card in the set.", cropX: 58, cropY: 38, scale: 190 },
  ],
  gifs: [...MACHINE_GIFS.slice(0, MAX_GIFS).map((g) => g.url)],
  letter:
    "Ananya,\n\nEighteen slots weren't enough, so the machine printed the rest.\n\nI know a vending machine is a ridiculous way to say this. But I didn't want to hand it all over at once. I wanted you to punch the codes, shake the stuck one, and watch every single thing drop — because that is roughly what loving you has felt like. Small, loud, a little jammed sometimes, and always worth the wait.\n\nYou are the best thing that ever happened to me on an ordinary Tuesday. I would pay any price, in any currency, including the embarrassing ones.\n\nNo refunds. No returns. No expiry.\n\n— Rohan",
  theme: DEFAULT_VEND_THEME,
};

// ─── Wire format ─────────────────────────────────────────────────────────────

export const VENDING_CONTENT_KEYS: (keyof VendingData)[] = [
  "machineName", "senderName", "recipientName", "slots", "creditPrompts", "displayIdleMessages",
  "photos", "gifs", "letter", "theme",
];

export function vendingDataToBody(data: VendingData, password?: string): Record<string, unknown> {
  return bodyFromKeys(data, VENDING_CONTENT_KEYS, password);
}

export function dbToVendingData(db: Raw | null | undefined): VendingData {
  const src = db ?? {};
  const slots = list<Slot>(
    src.slots,
    (o) => {
      const code = str(o.code, "").toUpperCase();
      if (!isValidSlotCode(code)) return null;
      return {
        code,
        kind: oneOf<SlotKind>(o.kind, SLOT_KINDS, "compliment"),
        label: str(o.label, "—"),
        payload: strOr(o.payload, ""),
        price: clampNum(o.price, 1, 0, 9),
        soldOut: bool(o.soldOut, false),
        sticks: bool(o.sticks, false),
      };
    },
    DEMO_DATA.slots,
  );

  // A1 is always the sender's, and exactly one slot may jam — enforced here so
  // a hand-edited payload can never produce two stuck items or a vendable A1.
  let seenSticky = false;
  const normalised = slots.map((s) => {
    const sticks = s.sticks && !seenSticky && s.code !== RESERVED_SLOT;
    if (sticks) seenSticky = true;
    return { ...s, sticks, soldOut: s.code === RESERVED_SLOT ? true : s.soldOut };
  });

  return {
    machineName: str(src.machineName, DEMO_DATA.machineName),
    senderName: str(src.senderName, DEMO_DATA.senderName),
    recipientName: str(src.recipientName, DEMO_DATA.recipientName),
    slots: normalised,
    creditPrompts: strList(src.creditPrompts, DEMO_DATA.creditPrompts),
    displayIdleMessages: strList(src.displayIdleMessages, DEMO_DATA.displayIdleMessages),
    // Love kit. A page published before the kit existed has none of these:
    // it gets no memory cards (never the demo couple's photos), the machine's
    // own stickers, no letter (the receipt prints a fallback prize) and the
    // original teal machine.
    photos: parseLovePhotos(src.photos, []),
    gifs: parseLoveGifs(src.gifs, DEMO_DATA.gifs),
    letter: parseLoveLetter(src.letter, ""),
    theme: parseTheme(src.theme, VEND_THEME_IDS, DEFAULT_VEND_THEME),
  };
}

/** Old drafts (saved before the love kit) lack the kit fields; fill them in. */
export function withKitDefaults(d: Partial<VendingData>): VendingData {
  return {
    ...DEMO_DATA,
    ...d,
    photos: Array.isArray(d.photos) ? d.photos : [],
    gifs: Array.isArray(d.gifs) ? d.gifs : DEMO_DATA.gifs,
    letter: typeof d.letter === "string" ? d.letter : "",
    theme: typeof d.theme === "string" && VEND_THEME_IDS.includes(d.theme) ? d.theme : DEFAULT_VEND_THEME,
  } as VendingData;
}

export { num, obj, seededInt };
