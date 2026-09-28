// ─── The Last Piece — shared type contract ───────────────────────────────────
//
// Single source of truth for the shape shared by the editor, the published
// viewer and the server payload. Field names here === server model field names
// === wire-format keys. Keep them in sync with
// server/src/models/PhotoPuzzlePage.ts.
//
// The game is a sliding-tile puzzle: the sender's photo is cut into an N×N grid
// with ONE empty slot (the bottom-right tile — the "last piece" the sender
// keeps). The recipient slides tiles back into place; when the picture is
// whole, the last piece flies into the gap and the memories + letter open.

import { clampNum, num, oneOf, str, strOr, strList, type Raw } from "@/lib/wire";
import {
  DEMO_PHOTO_CDN,
  DEMO_PHOTOS,
  LOVE_KIT_KEYS,
  gifsFor,
  parseLoveKit,
  type LoveKitData,
  type LovePhoto,
} from "../../_love/types";
import { PUZZLE_THEME_IDS } from "./themes";

export type EditMode = null | "manual" | "preview";

export interface Toast {
  id: number;
  type: "success" | "info" | "publish";
  title: string;
  message?: string;
}

export type Difficulty = "easy" | "medium" | "hard";
export const DIFFICULTIES: readonly Difficulty[] = ["easy", "medium", "hard"];

export const DIFFICULTY_META: Record<Difficulty, { size: number; label: string; emoji: string; blurb: string; shuffle: number }> = {
  easy: { size: 3, label: "Easy", emoji: "🍓", blurb: "3×3 · a sweet two-minute warm-up", shuffle: 70 },
  medium: { size: 4, label: "Medium", emoji: "🍒", blurb: "4×4 · a proper little challenge", shuffle: 160 },
  hard: { size: 5, label: "Hard", emoji: "🔥", blurb: "5×5 · for the puzzle nerd you love", shuffle: 320 },
};

export interface PuzzleData extends LoveKitData {
  senderName: string;
  recipientName: string;
  /** The photo that gets cut into tiles. "" = the demo photo. */
  imageUrl: string;
  /** Square framing of `imageUrl`: focal point 0–100 and zoom 100–300. */
  imageCropX: number;
  imageCropY: number;
  imageScale: number;
  difficulty: Difficulty;
  /** The big line that appears when the last piece lands. */
  finalPieceMessage: string;
  /** The quiet sign-off on the very last screen. */
  closingLine: string;
}

export interface PhotoPuzzleTemplateProps {
  data: PuzzleData;
  mode: "demo" | "live";
  shareId?: string;
  hasPassword?: boolean;
  /** Preview only: the floating theme dock calls this. */
  onThemeChange?: (id: string) => void;
}

// ─── Demo ────────────────────────────────────────────────────────────────────

/** The Darling template's hero couple — square-cropped around the two of them. */
export const DEMO_IMAGE = `${DEMO_PHOTO_CDN}/hero-bg.webp`;

const LOVE_CDN = "https://cdn.subhsandesh.in/gifts-media/love";

export const DEMO_MEMORIES: LovePhoto[] = [
  { ...DEMO_PHOTOS[0], caption: "the first sunset", note: "You said the sky looked like mango lassi. I laughed, then spent the whole ride home thinking you were the most interesting person I'd ever met." },
  { ...DEMO_PHOTOS[1], caption: "date night, round 1", note: "You stole my fries, then my hoodie, then — very casually — my whole heart. In that order." },
  { url: `${LOVE_CDN}/image5.webp`, caption: "the 2am dance", note: "No music. Just you humming badly and me pretending I can dance. Best concert I've ever been to.", cropX: 50, cropY: 40, scale: 100 },
  { ...DEMO_PHOTOS[2], caption: "blossom era", note: "Even the trees were showing off that day and still, you were the prettiest thing in the frame." },
  { url: `${LOVE_CDN}/image13.webp`, caption: "lazy sunday", note: "Doing absolutely nothing with you is still my favourite plan. Please never make me choose a restaurant though." },
  { ...DEMO_PHOTOS[3], caption: "us, forever", note: "Out of every timeline, I'd pick this one. The one where you're next to me. Every single time." },
];

const DEMO_GIFS = gifsFor(["love", "hug", "yes"]).slice(0, 3).map((g) => g.url);

export const DEMO_DATA: PuzzleData = {
  senderName: "Rohan",
  recipientName: "Ananya",
  imageUrl: "",
  imageCropX: 50,
  imageCropY: 42,
  imageScale: 100,
  difficulty: "easy",
  finalPieceMessage: "Turns out you were the missing piece all along.",
  closingLine: "There. That's the whole picture.",
  photos: DEMO_MEMORIES,
  gifs: DEMO_GIFS,
  letter:
    "Ananya,\n\nI cut our photo into pieces just so I could watch you put it back together. Very on brand for us — you've been fixing my mess since day one.\n\nI still think about the auto ride back from Marine Drive, when you fell asleep on my shoulder mid-sentence and I didn't move for forty minutes. My arm died. Worth it.\n\nEvery version of my life that makes sense has you in it. You're not a piece of my picture. You're the reason it's a picture at all.\n\n— Rohan",
  theme: "cozy",
  lockQuestion: "",
  lockAnswer: "",
};

export const DEFAULT_LOCK_QUESTION = "Promise you'll smile while reading this?";
export const DEFAULT_LOCK_ANSWER = "pinky promise 🧩";

/** The image the board is cut from (the demo photo when none was uploaded). */
export const puzzleImage = (d: PuzzleData): string => d.imageUrl.trim() || DEMO_IMAGE;

// ─── Wire format ─────────────────────────────────────────────────────────────

export const PUZZLE_CONTENT_KEYS: (keyof PuzzleData)[] = [
  "senderName", "recipientName", "imageUrl", "imageCropX", "imageCropY", "imageScale",
  "difficulty", "finalPieceMessage", "closingLine", ...LOVE_KIT_KEYS,
];

export function puzzleDataToBody(data: PuzzleData, password?: string): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  for (const k of PUZZLE_CONTENT_KEYS) body[k] = data[k];
  if (password !== undefined) body.password = password;
  return body;
}

/**
 * Pages made before the sliding rebuild stored a jigsaw grid (cols × rows) and
 * the letter as one line per piece. Both still render: the grid maps onto the
 * nearest sliding size and the lines become the letter.
 */
function legacyDifficulty(src: Raw): Difficulty {
  const pieces = num(src.cols, 0) * num(src.rows, 0);
  if (!pieces) return DEMO_DATA.difficulty;
  return pieces <= 9 ? "easy" : pieces <= 16 ? "medium" : "hard";
}

export function dbToPuzzleData(db: Raw | null | undefined): PuzzleData {
  const src = db ?? {};
  const legacyLetter = strList(src.lines, []).join("\n");
  const hasLetter = typeof src.letter === "string" && src.letter.trim().length > 0;
  const kit = parseLoveKit({ ...src, letter: hasLetter ? src.letter : legacyLetter || src.letter }, DEMO_DATA, PUZZLE_THEME_IDS);
  // A stored page made before the love kit has no photos/gifs keys: it shows
  // none, rather than the demo couple's.
  const isStored = typeof src._id === "string" || typeof src.shareId === "string";
  return {
    ...kit,
    photos: isStored && !Array.isArray(src.photos) ? [] : kit.photos,
    gifs: isStored && !Array.isArray(src.gifs) ? [] : kit.gifs,
    senderName: str(src.senderName, DEMO_DATA.senderName),
    recipientName: str(src.recipientName, DEMO_DATA.recipientName),
    imageUrl: strOr(src.imageUrl, ""),
    imageCropX: clampNum(src.imageCropX, DEMO_DATA.imageCropX, 0, 100),
    imageCropY: clampNum(src.imageCropY, DEMO_DATA.imageCropY, 0, 100),
    imageScale: clampNum(src.imageScale, 100, 100, 300),
    difficulty: oneOf(src.difficulty, DIFFICULTIES, legacyDifficulty(src)),
    finalPieceMessage: str(src.finalPieceMessage, DEMO_DATA.finalPieceMessage),
    closingLine: str(src.closingLine, DEMO_DATA.closingLine),
  };
}

/** A draft saved by an older build may miss any of the newer fields. */
export function restoreDraft(raw: unknown): PuzzleData | null {
  if (!raw || typeof raw !== "object") return null;
  const d = raw as Raw;
  const merged = { ...DEMO_DATA, ...d } as PuzzleData;
  if (!DIFFICULTIES.includes(merged.difficulty)) merged.difficulty = legacyDifficulty(d);
  if (!Array.isArray(merged.photos)) merged.photos = [];
  if (!Array.isArray(merged.gifs)) merged.gifs = [];
  if (typeof d.letter !== "string") merged.letter = strList(d.lines, []).join("\n");
  if (!PUZZLE_THEME_IDS.includes(merged.theme)) merged.theme = DEMO_DATA.theme;
  for (const k of ["imageCropX", "imageCropY", "imageScale"] as const) {
    if (!Number.isFinite(merged[k])) merged[k] = DEMO_DATA[k];
  }
  return merged;
}
