// ─── Catch — shared type contract ────────────────────────────────────────────
//
// Single source of truth for the shape shared by the editor, the published
// viewer and the server payload. Field names here === server model field names
// === wire-format keys (flat payload). Keep them in sync with
// server/src/models/CatchPage.ts.
//
// THE PROMISE: the game is a game — score, combos, hearts, power-ups, levels —
// but it is never a gate. Every letter line they miss is still on the results
// screen (tap to reveal it anyway), the memories are all in the gallery, and
// the main letter waits in the corner the whole time.

import { bodyFromKeys, clampNum, list, str, strOr, type Raw } from "@/lib/wire";
import {
  DEMO_PHOTO_CDN,
  MAX_LETTER_LEN,
  MAX_LOCK_ANSWER_LEN,
  MAX_LOCK_QUESTION_LEN,
  parseLovePhotos,
  type LovePhoto,
} from "../../_love/types";

export type EditMode = null | "manual" | "preview";

/** A falling letter piece — one line of the letter riding on an object. */
export interface GoodItem {
  id: string;
  emoji: string;
  /** "the grey hoodie" — what the object is, shown when it's caught. */
  label: string;
  /** The line of the letter it carries. */
  line: string;
}

/** Something to dodge. Petty, never cruel. Drawn as a little chat bubble. */
export interface BadItem {
  id: string;
  emoji: string;
  label: string;
}

export interface CatchData {
  recipientName: string;
  senderName: string;
  /** Their face — the thing that does the catching. "" = a drawn kawaii face. */
  faceUrl: string;
  faceCropX: number;
  faceCropY: number;
  faceScale: number;
  /** The ribbon under the CATCH! logo on the title screen. */
  tagline: string;
  /** 6–14 lines of the letter, each riding on an object. */
  goodItems: GoodItem[];
  /** 0–6 petty things to dodge. */
  badItems: BadItem[];
  /** Memory polaroids that fall as collectibles. Each has a caption + note. */
  photos: LovePhoto[];
  /** Always printed at the end of the assembled letter. */
  closingLine: string;
  /** The main letter — waits in the corner as an envelope (LetterPop). */
  letter: string;
  lockQuestion: string;
  lockAnswer: string;
  durationMs: number;
}

export interface CatchTemplateProps {
  data: CatchData;
  mode: "demo" | "live";
  shareId?: string;
  hasPassword?: boolean;
  /** Hide the corner letter (while an editor sheet is covering the page). */
  hideLetter?: boolean;
  /** Told when a run starts/stops so the editor can tuck its dock away. */
  onPlayingChange?: (playing: boolean) => void;
  /** The editor sheet is open on the right (desktop): slide the cabinet left. */
  shiftForSheet?: boolean;
}

export const LIMITS = {
  name: 40,
  tagline: 60,
  label: 34,
  line: 160,
  closing: 220,
  minGood: 6,
  maxGood: 14,
  maxBad: 6,
} as const;

export const DURATIONS = [30000, 45000, 60000] as const;

// ─── Demo ────────────────────────────────────────────────────────────────────

const P = DEMO_PHOTO_CDN;

export const DEMO_DATA: CatchData = {
  recipientName: "Ananya",
  senderName: "Rohan",
  faceUrl: `${P}/couple2.webp`,
  faceCropX: 63,
  faceCropY: 48,
  faceScale: 300,
  tagline: "the ananya edition 💘",
  goodItems: [
    { id: "g1", emoji: "☕", label: "the chai you never finish", line: "You make chai and abandon it half-drunk on every surface in the house. I drink the rest. That's love." },
    { id: "g2", emoji: "🧥", label: "the grey hoodie", line: "I've stopped asking for the hoodie back. Consider it a transfer of ownership." },
    { id: "g3", emoji: "🎧", label: "one earbud, always", line: "You always hand me the left one. Every time. Without looking." },
    { id: "g4", emoji: "🍜", label: "2 AM maggi", line: "Half-cooked, on the kitchen floor, during a power cut. Best meal of my life." },
    { id: "g5", emoji: "🎵", label: "the song you ruined", line: "I can't hear that song anymore without your terrible harmony over it. Don't stop." },
    { id: "g6", emoji: "🐕", label: "the dog you fed once", line: "One biscuit in 2023 and now that street dog is technically our responsibility." },
    { id: "g7", emoji: "📷", label: "the blurry photo", line: "The only photo of us from that year is blurry and you refuse to delete it. Good." },
    { id: "g8", emoji: "🕯️", label: "the power cut", line: "Four hours, no phones, and you told me about your dad. That's when I knew." },
  ],
  badItems: [
    { id: "b1", emoji: "💬", label: "k" },
    { id: "b2", emoji: "👀", label: "seen 9:41 PM" },
    { id: "b3", emoji: "🚩", label: "we need to talk" },
    { id: "b4", emoji: "🥱", label: "wyd" },
  ],
  photos: [
    { url: `${P}/couple1.webp`, caption: "the first sunset", note: "You said the sky looked like mango lassi. I have not stopped thinking about it.", cropX: 50, cropY: 50, scale: 100 },
    { url: `${P}/couple2.webp`, caption: "date night, round 1", note: "You stole my fries and then my heart. In that order.", cropX: 50, cropY: 40, scale: 100 },
    { url: `${P}/couple3.webp`, caption: "cherry blossom era", note: "Even the trees were showing off for you that day.", cropX: 60, cropY: 50, scale: 100 },
    { url: `${P}/couple4.webp`, caption: "stargazing, sort of", note: "You named every star wrong and I let you. I'll let you forever.", cropX: 50, cropY: 50, scale: 100 },
    { url: `${P}/Aniversary/aniversary.webp`, caption: "rooftop, 1 AM", note: "The city was loud and you were louder. My favourite noise.", cropX: 50, cropY: 60, scale: 100 },
    { url: "https://cdn.subhsandesh.in/gifts-media/love/image13.webp", caption: "sunday, no plans", note: "Page 40 of a book you'll never finish, and my head on your shoulder. Perfect.", cropX: 50, cropY: 55, scale: 100 },
  ],
  closingLine: "That's all of it. Even the pieces you didn't catch — they were always going to be yours.",
  letter:
    "Ananya,\n\nYou just played a whole game to read a letter. That's the most you thing ever, and I love it.\n\nHere's the part I couldn't fit on a falling hoodie: you make ordinary days feel like a level-up. The chai, the songs, the 2 AM maggi — none of it would be anything without you in it.\n\nI don't need a high score. I already won.\n\nPlayer 2, forever.",
  lockQuestion: "Ready for the final level?",
  lockAnswer: "press start 💖",
  durationMs: 45000,
};

// ─── Wire format ─────────────────────────────────────────────────────────────

export const CATCH_CONTENT_KEYS: (keyof CatchData)[] = [
  "recipientName", "senderName", "faceUrl", "faceCropX", "faceCropY", "faceScale", "tagline",
  "goodItems", "badItems", "photos", "closingLine", "letter", "lockQuestion", "lockAnswer", "durationMs",
];

export function catchDataToBody(data: CatchData, password?: string): Record<string, unknown> {
  return bodyFromKeys(data, CATCH_CONTENT_KEYS, password);
}

/** Old pages (made before photos/letter existed) simply get none of either. */
export function dbToCatchData(db: Raw | null | undefined): CatchData {
  const src = db ?? {};
  const fromServer = db != null;
  const face = strOr(src.faceUrl, "");
  return {
    recipientName: str(src.recipientName, DEMO_DATA.recipientName).slice(0, LIMITS.name),
    senderName: str(src.senderName, DEMO_DATA.senderName).slice(0, LIMITS.name),
    faceUrl: /^(https:\/\/|data:image\/)/.test(face) ? face : fromServer ? "" : DEMO_DATA.faceUrl,
    faceCropX: clampNum(src.faceCropX, 50, 0, 100),
    faceCropY: clampNum(src.faceCropY, 50, 0, 100),
    faceScale: clampNum(src.faceScale, 100, 100, 300),
    tagline: strOr(src.tagline, fromServer ? "" : DEMO_DATA.tagline).slice(0, LIMITS.tagline),
    goodItems: list<GoodItem>(
      src.goodItems,
      (o, i) => {
        const line = str(o.line, "");
        if (!line) return null;
        return { id: str(o.id, `g${i + 1}`), emoji: str(o.emoji, "💌"), label: strOr(o.label, ""), line };
      },
      DEMO_DATA.goodItems,
    ).slice(0, LIMITS.maxGood),
    badItems: Array.isArray(src.badItems)
      ? list<BadItem>(
          src.badItems,
          (o, i) => ({ id: str(o.id, `b${i + 1}`), emoji: str(o.emoji, "🚩"), label: strOr(o.label, "") }),
          [],
        ).slice(0, LIMITS.maxBad)
      : DEMO_DATA.badItems,
    photos: parseLovePhotos(src.photos, fromServer ? [] : DEMO_DATA.photos),
    closingLine: str(src.closingLine, DEMO_DATA.closingLine),
    letter: typeof src.letter === "string" ? src.letter.slice(0, MAX_LETTER_LEN) : fromServer ? "" : DEMO_DATA.letter,
    lockQuestion: typeof src.lockQuestion === "string" ? src.lockQuestion.slice(0, MAX_LOCK_QUESTION_LEN) : "",
    lockAnswer: typeof src.lockAnswer === "string" ? src.lockAnswer.slice(0, MAX_LOCK_ANSWER_LEN) : "",
    durationMs: clampNum(src.durationMs, DEMO_DATA.durationMs, 20000, 120000),
  };
}

/** Photos the AI may have stubbed (a caption on a slot with no picture) are dropped. */
export function tidyCatchData(d: CatchData): CatchData {
  return {
    ...d,
    photos: (d.photos ?? []).filter((p) => p && typeof p.url === "string" && p.url),
    goodItems: (d.goodItems ?? []).map((g, i) => ({ id: g.id || `g${i + 1}`, emoji: g.emoji || "💌", label: g.label ?? "", line: g.line ?? "" })),
  };
}
