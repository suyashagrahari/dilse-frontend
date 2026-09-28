// ─── Flags — shared type contract ────────────────────────────────────────────
//
// Single source of truth for the shape shared by the editor, the published
// viewer and the server payload. Field names here === server model field names
// === wire-format keys (flat payload). Keep them in sync.
//
// CORE MECHANIC, enforced by this shape: the swipe direction selects which of
// THREE authored responses is revealed. If the same text can surface regardless
// of direction, the gesture is theatre and the template is a slideshow with
// gesture decoration. `responses` is a required record of all three — there is
// deliberately no single `back` field to fall into.

import { seededShuffleWhere } from "@/lib/seededRandom";
import { bodyFromKeys, clampNum, list, oneOf, str, strOr, type Raw } from "@/lib/wire";

import { DEMO_PHOTOS, LOVE_KIT_KEYS, parseLoveKit, type LoveKitData } from "../../_love/types";
import { FLAGS_THEME_IDS } from "./themes";

export type EditMode = null | "manual" | "preview";

export interface Toast {
  id: number;
  type: "success" | "info" | "publish";
  title: string;
  message?: string;
}

/** LEFT = red flag, RIGHT = green flag, UP = beige flag ("it's complicated").
 *  The wire key stays `complicated` so pages published before the rename
 *  keep working. */
export type SwipeChoice = "red" | "green" | "complicated";
export const SWIPE_CHOICES: SwipeChoice[] = ["red", "green", "complicated"];

export const CHOICE_LABEL: Record<SwipeChoice, string> = {
  red: "RED FLAG",
  green: "GREEN FLAG",
  complicated: "BEIGE FLAG",
};

export const CHOICE_EMOJI: Record<SwipeChoice, string> = {
  red: "🚩",
  green: "💚",
  complicated: "🫠",
};

/** Static inks, for the editor (which lives outside the themed template). */
export const CHOICE_COLOR: Record<SwipeChoice, string> = {
  red: "#e11d48",
  green: "#059669",
  complicated: "#b07d4f",
};

/** Themed inks, for everything inside the template root (see themes.ts). */
export const FLAG_VAR: Record<SwipeChoice, string> = {
  red: "var(--fl-red)",
  green: "var(--fl-green)",
  complicated: "var(--fl-beige)",
};

export type CardKind = "flag" | "sincere";

export interface FlagCard {
  id: string;
  /** About the SENDER. Max 70 chars. */
  statement: string;
  /** One authored response per direction. All three required. */
  responses: Record<SwipeChoice, string>;
  /** The sender's actual verdict. Drives the "HE SAYS" strip and OVERRULED. */
  truth: SwipeChoice;
  /** 'sincere' cards are drag-locked and break the comedy rhythm. */
  kind: CardKind;
}

export interface FlagsData extends LoveKitData {
  /** `photoUrl` is the pre-love-kit profile photo; the profile carousel now
   *  uses `photos` and only falls back to it on pages that have none. */
  sender: { name: string; age: number; photoUrl: string; tagline: string };
  recipientName: string;
  cards: FlagCard[];
  /** The closing sentence. Not a game. */
  finalCard: string;
}

export interface SwipeResult {
  cardId: string;
  choice: SwipeChoice;
}

// ─── Gesture tuning ──────────────────────────────────────────────────────────
// Exported as data so the renderer and any test agree on one set of numbers.

export const GESTURE = {
  /** Fraction of card width that commits a slow drag. */
  commitFraction: 0.32,
  /** px/ms — a short fast flick commits even under the distance threshold. */
  commitVelocity: 0.5,
  /** Velocity is measured over the tail of the gesture, not the whole thing. */
  velocityWindowMs: 80,
  /** Fraction of card height for an UP commit. */
  upFraction: 0.25,
  /** UP requires the vertical component to clearly dominate, or diagonal drags
   *  misfire into "complicated". */
  upDominance: 1.5,
  rotationDeg: 14,
  /** Pivot BELOW the card so it tilts like a physical card rather than spinning
   *  around its middle. This one property is most of the tactile quality. */
  transformOrigin: "50% 140%",
  springBackMs: 340,
  springEasing: "cubic-bezier(0.34, 1.4, 0.64, 1)",
  /** Feedback starts early — waiting until the threshold feels unresponsive. */
  tintStartProgress: 0.12,
  tintMaxOpacity: 0.55,
  stampAtProgress: 0.45,
  hapticMs: 12,
} as const;

/** Reveal beats, in ms from commit. The 120ms hold registers as a decision. */
export const REVEAL = {
  flyOutMs: 140,
  holdMs: 120,
  returnMs: 260,
  flipStartMs: 520,
  flipMs: 480,
  flipEasing: "cubic-bezier(0.4, 0, 0.2, 1)",
  /**
   * Must not be lower than `lockMs`. "tap to continue" appearing while input is
   * still locked shows an affordance that silently does nothing — the user taps,
   * gets no response, and reads it as a broken card rather than a deliberate
   * pause.
   */
  nextAffordanceMs: 1000,
  /** Input is locked for the whole sequence so mashing cannot skip a card. */
  lockMs: 1000,
} as const;

// ─── Deck ────────────────────────────────────────────────────────────────────

/** Where the sincere card is pinned — roughly two-thirds through. */
export const SINCERE_POSITION = 0.65;

/**
 * Build the deck order.
 *
 * Seeded, so a refresh produces the identical order (AC-8) — a reshuffle would
 * lose the recipient's place and let them re-roll a card they didn't like.
 *
 * The constraint: never 3+ consecutive cards sharing the same `truth`. The spec
 * calls this "the obvious answer", and same-truth runs are exactly what makes it
 * guessable — once she has seen three reds in a row she stops reading and starts
 * gaming the flip, and the template is over.
 */
export function buildDeck(cards: FlagCard[], seed: string): FlagCard[] {
  const flags = cards.filter((c) => c.kind === "flag");
  const sincere = cards.filter((c) => c.kind === "sincere");

  const noRun = (list: FlagCard[]): boolean => {
    let run = 1;
    for (let i = 1; i < list.length; i++) {
      run = list[i].truth === list[i - 1].truth ? run + 1 : 1;
      if (run >= 3) return false;
    }
    return true;
  };

  const shuffled = seededShuffleWhere(seed, flags, noRun, 20);

  // The sincere card is pinned, not shuffled — its job is to land at a
  // predictable point in the rhythm and break it.
  const out = shuffled.slice();
  if (sincere.length > 0) {
    const at = Math.min(out.length, Math.round(out.length * SINCERE_POSITION));
    out.splice(at, 0, ...sincere);
  }
  return out;
}

// ─── Scorecard ───────────────────────────────────────────────────────────────

export interface Scorecard {
  redCalled: number;
  greenCalled: number;
  complicatedCalled: number;
  /** Display percentage, always with one decimal. Never below 90. */
  compatibility: number;
  verdict: string;
  /** The single funniest mismatch, or null if she agreed with everything. */
  callout: string | null;
}

/**
 * Computed from HER swipes, not from the sender's truths. A verdict about her
 * own generosity is a self-own, and self-owns share harder than compliments.
 *
 * Warmth is structural, not a tone preference: every branch below is warm, and
 * the compatibility floor means no swipe pattern can produce a number that
 * reads as a real relationship judgement (AC-10).
 */
export function computeScorecard(deck: FlagCard[], results: SwipeResult[]): Scorecard {
  const byId = new Map(deck.map((c) => [c.id, c]));
  const flagResults = results.filter((r) => byId.get(r.cardId)?.kind === "flag");

  const redCalled = flagResults.filter((r) => r.choice === "red").length;
  const greenCalled = flagResults.filter((r) => r.choice === "green").length;
  const complicatedCalled = flagResults.filter((r) => r.choice === "complicated").length;

  const total = flagResults.length;
  const matches = flagResults.filter((r) => byId.get(r.cardId)?.truth === r.choice).length;
  const raw = total > 0 ? matches / total : 1;
  // Floor at 60% agreement, then map [0.6, 1] onto [90, 99.9].
  const floored = Math.max(0.6, raw);
  const compatibility = Math.round((90 + ((floored - 0.6) / 0.4) * 9.9) * 10) / 10;

  // The verdict is the line that gets screenshotted, so it has to actually
  // respond to how she swiped. Ordered most-specific first: the absolutes read
  // as a real reaction, the ratio bands catch the broad shapes, and accuracy is
  // checked before the neutral fallback so "you saw straight through me" beats
  // a shrug. Every branch stays warm — see the note on `Scorecard`.
  const pct = (n: number) => n / total;
  let verdict: string;
  if (total === 0) {
    verdict = "no verdict. you didn't play. also fair.";
  } else if (greenCalled === total) {
    verdict = `${total} for ${total}, all green. you have never once held anything against me and it's starting to worry me.`;
  } else if (redCalled === total) {
    verdict = `${total} for ${total}, all red. no notes. genuinely.`;
  } else if (pct(complicatedCalled) >= 0.45) {
    verdict = "you called most of me a beige flag. honestly the most accurate read anyone's given.";
  } else if (pct(greenCalled) >= 0.6) {
    verdict = `you called ${greenCalled} of my worst habits green flags. concerning.`;
  } else if (pct(redCalled) >= 0.6) {
    verdict = "brutal. accurate. still here though.";
  } else if (raw >= 0.8) {
    verdict = `you got ${matches} of ${total} right. you've been paying attention. unsettling.`;
  } else if (raw <= 0.3) {
    verdict = "you and I disagree about almost everything here. explains a lot, actually.";
  } else {
    verdict = "fair. that's the scary part.";
  }

  // Prefer the funniest mismatch: she called a genuine red flag green.
  const mismatches = flagResults.filter((r) => byId.get(r.cardId)?.truth !== r.choice);
  const generous = mismatches.find((r) => r.choice === "green" && byId.get(r.cardId)?.truth === "red");
  const pick = generous ?? mismatches[0] ?? null;
  const callout = pick
    ? `you called "${byId.get(pick.cardId)?.statement ?? ""}" a ${CHOICE_LABEL[pick.choice].toLowerCase()} ${CHOICE_EMOJI[pick.choice]}`
    : null;

  return { redCalled, greenCalled, complicatedCalled, compatibility, verdict, callout };
}

// ─── Component contract ──────────────────────────────────────────────────────

export interface FlagsTemplateProps {
  data: FlagsData;
  mode: "demo" | "live";
  shareId?: string;
  hasPassword?: boolean;
  /** Preview only: the floating theme dock calls this. */
  onThemeChange?: (id: string) => void;
}

// ─── Demo data ───────────────────────────────────────────────────────────────

const card = (
  id: string, statement: string, truth: SwipeChoice,
  red: string, green: string, complicated: string,
): FlagCard => ({ id, statement, truth, kind: "flag", responses: { red, green, complicated } });

export const DEMO_GIFS = [
  "https://cdn.subhsandesh.in/gifts-media/templates/hold-my-hand/cute-bear-evil-laugh.gif",
  "https://cdn.subhsandesh.in/gifts-media/assets/court-of-love/love-heart.gif",
  "https://cdn.subhsandesh.in/gifts-media/assets/court-of-love/penguin-hug.gif",
];

export const DEMO_DATA: FlagsData = {
  sender: {
    name: "Rohan",
    age: 27,
    photoUrl: "",
    tagline: "6'1\" because apparently that matters. bad at texting, elite at showing up.",
  },
  recipientName: "Ananya",
  cards: [
    card("c1", "he takes 45 minutes to reply", "red",
      "correct. no defence. I'm working on it.",
      "generous of you. it's a red flag. I'm working on it.",
      "not beige. not even a little. it's red and I'm working on it."),
    card("c2", "he calls his mother every single day", "green",
      "harsh. she's lovely and you know it.",
      "correct. and she asks about you first, every time.",
      "beige?? that one's just good. let me have this."),
    card("c3", "he has never once been on time", "red",
      "yes. I have no argument. I left late again writing this.",
      "you've been waiting outside restaurants for two years. this is Stockholm syndrome.",
      "calling it beige is the kindest lie anyone's told me."),
    card("c4", "he still has photos of his ex on facebook", "complicated",
      "fair call, honestly. I'll go delete them tonight.",
      "that's very relaxed of you. suspiciously relaxed.",
      "correct. it's 2016 photos and I forgot the password. peak beige."),
    card("c5", "he cannot cook a single thing", "green",
      "rude. I make excellent toast.",
      "correct — because it means you cook and I do everything else, which was the deal.",
      "the toast question does make it beige."),
    card("c6", "he says 'I'm fine' when he is not fine", "red",
      "yeah. that's the one I actually need to fix.",
      "please don't reward that. it isn't a good trait.",
      "okay, that's the honest answer. it is complicated."),
    card("c7", "he remembers everything you've ever said", "green",
      "that's a strange thing to hold against me.",
      "correct. including the thing you said in the car in March that you think I missed.",
      "only beige when I bring it up at the wrong moment. which I do."),
    {
      id: "c8",
      statement: "he was there the week your father was in hospital, and never mentioned it again.",
      truth: "green",
      kind: "sincere",
      responses: {
        red: "", green: "", complicated: "",
      },
    },
    card("c9", "he snores", "red",
      "correct and I'm sorry.",
      "you've called snoring a green flag. genuinely concerning.",
      "beige in that I deny it and you have recordings."),
    card("c10", "he has never finished a series you started together", "red",
      "guilty. I'm four episodes behind right now.",
      "you cannot possibly think that's fine.",
      "beige because I do watch them. just alone. at 2 AM. sorry."),
    card("c11", "he keeps every receipt, ticket and boarding pass", "green",
      "that's hoarding, apparently.",
      "correct. there's a box. you're in most of it.",
      "beige. the box is getting large."),
  ],
  finalCard:
    "You just spent eleven cards judging me and still gave me a 96. I'd have gone lower. Thanks for staying.",
  photos: [
    { ...DEMO_PHOTOS[0], caption: "golden hour, first date", note: "you said the sky looked like mango lassi and I decided right there I was going to marry you. told no one. til now." },
    { ...DEMO_PHOTOS[1], caption: "date night, round 1", note: "you stole my fries, then my hoodie, then my whole personality. zero complaints filed." },
    { ...DEMO_PHOTOS[2], caption: "cherry blossom era", note: "we got lost for two hours and you called it 'an adventure'. that's the green flag I fell for." },
    { ...DEMO_PHOTOS[3], caption: "us, unedited", note: "out of every timeline, I'd swipe right on this one. every single time." },
  ],
  gifs: DEMO_GIFS,
  letter:
    "Ananya,\n\nYou just judged eleven of my worst habits and I still somehow walked out with a 96. Rigged, probably. I'm not complaining.\n\nHere's the only card I didn't put in the deck: you are the best thing that ever happened to my camera roll, my Sundays and my patience. You make the ordinary days the good ones.\n\nRed flags and all, I'd swipe right on you every single time.\n\nRohan",
  theme: "swipe-night",
  lockQuestion: "swipe right on me for another year?",
  lockAnswer: "obviously 💚",
};

// ─── Wire format ─────────────────────────────────────────────────────────────

export const FLAGS_CONTENT_KEYS: (keyof FlagsData)[] = [
  "sender", "recipientName", "cards", "finalCard", ...LOVE_KIT_KEYS,
];

export function flagsDataToBody(data: FlagsData, password?: string): Record<string, unknown> {
  return bodyFromKeys(data, FLAGS_CONTENT_KEYS, password);
}

/**
 * Pages published before the love kit have no photos / gifs / letter. They
 * must not suddenly show the demo couple, so those fall back to EMPTY, and the
 * template draws its own fallbacks (initial card, the template clips, no
 * letter section). Only an absent theme falls back to the default.
 */
const LEGACY_KIT: LoveKitData = {
  photos: [],
  gifs: [],
  letter: "",
  theme: DEMO_DATA.theme,
  lockQuestion: "",
  lockAnswer: "",
};

export function dbToFlagsData(db: Raw | null | undefined, kitFallback: LoveKitData = LEGACY_KIT): FlagsData {
  const src = db ?? {};
  const s = (src.sender ?? {}) as Raw;
  return {
    ...parseLoveKit(src, kitFallback, FLAGS_THEME_IDS),
    sender: {
      name: str(s.name, DEMO_DATA.sender.name),
      age: clampNum(s.age, DEMO_DATA.sender.age, 13, 120),
      photoUrl: strOr(s.photoUrl, ""),
      tagline: str(s.tagline, DEMO_DATA.sender.tagline),
    },
    recipientName: str(src.recipientName, DEMO_DATA.recipientName),
    cards: list<FlagCard>(
      src.cards,
      (o, i) => {
        const statement = str(o.statement, "");
        if (!statement) return null;
        const r = (o.responses ?? {}) as Raw;
        return {
          id: str(o.id, `c${i + 1}`),
          statement,
          truth: oneOf<SwipeChoice>(o.truth, SWIPE_CHOICES, "red"),
          kind: oneOf<CardKind>(o.kind, ["flag", "sincere"], "flag"),
          responses: {
            red: strOr(r.red, ""),
            green: strOr(r.green, ""),
            complicated: strOr(r.complicated, ""),
          },
        };
      },
      DEMO_DATA.cards,
    ),
    finalCard: str(src.finalCard, DEMO_DATA.finalCard),
  };
}
