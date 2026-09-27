// ─── Love kit — shared content types ─────────────────────────────────────────
//
// The things every love-kit template lets the sender attach: framed photos
// (each with a caption and an optional little letter), up to three GIFs, one
// main letter and a theme id. The server mirror is `server/src/utils/loveMedia.ts`
// — keep the limits in step with LOVE_LIMITS there.

import { list, str, strList, strOr } from "@/lib/wire";

/** Same shape as the Dedication photo, so its framing tools work unchanged. */
export interface LovePhoto {
  url: string;
  caption?: string;
  note?: string;
  cropX?: number;
  cropY?: number;
  scale?: number;
}

export interface LoveKitData {
  photos: LovePhoto[];
  gifs: string[];
  /** The main letter. */
  letter: string;
  /** A theme id from the template's own theme list; "" = the default. */
  theme: string;
  /** The question that unlocks the main letter; "" = the template's default. */
  lockQuestion: string;
  /** The label of the button that answers it; "" = the template's default. */
  lockAnswer: string;
}

export const MAX_PHOTOS = 8;
export const MAX_GIFS = 3;
export const MAX_CAPTION_LEN = 60;
export const MAX_NOTE_LEN = 400;
export const MAX_LETTER_LEN = 1500;
export const MAX_LOCK_QUESTION_LEN = 140;
export const MAX_LOCK_ANSWER_LEN = 40;

export const LOVE_KIT_KEYS = ["photos", "gifs", "letter", "theme", "lockQuestion", "lockAnswer"] as const;

const CDN = "https://cdn.subhsandesh.in/gifts-media";
export const DEMO_PHOTO_CDN = `${CDN}/assets`;

export type GifTag = "love" | "hug" | "funny" | "travel" | "legal" | "yes" | "miss" | "sorry";

/** Hand-picked cute GIFs, all hosted on our own CDN so they never disappear. */
export const GIF_LIBRARY: { url: string; label: string; tags: GifTag[] }[] = [
  { url: `${CDN}/assets/court-of-love/penguin-hug.gif`, label: "penguin hug", tags: ["hug", "love"] },
  { url: `${CDN}/assets/court-of-love/love-this-much.gif`, label: "love you this much", tags: ["love"] },
  { url: `${CDN}/assets/court-of-love/aww-bear.gif`, label: "aww", tags: ["love"] },
  { url: `${CDN}/assets/court-of-love/hearts.gif`, label: "hearts", tags: ["love"] },
  { url: `${CDN}/assets/court-of-love/love-heart.gif`, label: "big heart", tags: ["love", "yes"] },
  { url: `${CDN}/assets/court-of-love/you-are-amazing.gif`, label: "you're amazing", tags: ["love"] },
  { url: `${CDN}/templates/hold-my-hand/holding-hands.gif`, label: "holding hands", tags: ["love", "hug"] },
  { url: `${CDN}/missyou-gf/hug-penguin.gif`, label: "squeeze", tags: ["hug", "miss"] },
  { url: `${CDN}/assets/proposal/ask-ring.gif`, label: "the ring", tags: ["yes", "love"] },
  { url: `${CDN}/assets/proposal/ask-rose.gif`, label: "a rose", tags: ["love"] },
  { url: `${CDN}/assets/proposal/ask-bouquet.gif`, label: "bouquet", tags: ["love", "yes"] },
  { url: `${CDN}/templates/train-ticket/bunnyonatrain.gif`, label: "on my way", tags: ["travel"] },
  { url: `${CDN}/templates/train-ticket/waiting.gif`, label: "waiting for you", tags: ["travel", "miss"] },
  { url: `${CDN}/templates/train-ticket/dancing.gif`, label: "happy dance", tags: ["funny", "yes", "travel"] },
  { url: `${CDN}/missyou-gf/miss-you-penguin.gif`, label: "miss you", tags: ["miss", "travel"] },
  { url: `${CDN}/assets/court-of-love/judge-gavel.gif`, label: "approved", tags: ["legal", "yes"] },
  { url: `${CDN}/assets/court-of-love/clerk-pengu.gif`, label: "clerk pengu", tags: ["legal", "funny"] },
  { url: `${CDN}/assets/court-of-love/scales-equal.gif`, label: "fair & square", tags: ["legal"] },
  { url: `${CDN}/templates/legal-notice/focus-typing.gif`, label: "drafting…", tags: ["legal", "funny"] },
  { url: `${CDN}/templates/legal-notice/unblinking.gif`, label: "the stare", tags: ["legal", "funny"] },
  { url: `${CDN}/templates/legal-notice/head-pat.gif`, label: "head pat", tags: ["sorry", "love"] },
  { url: `${CDN}/assets/court-of-love/win-medal.gif`, label: "we won", tags: ["yes", "funny"] },
  { url: `${CDN}/templates/hold-my-hand/cute-bear-evil-laugh.gif`, label: "evil laugh", tags: ["funny"] },
  { url: `${CDN}/feedback/please-please.gif`, label: "pretty please", tags: ["sorry", "funny"] },
  { url: `${CDN}/assets/court-of-love/dont-be-sad.gif`, label: "don't be sad", tags: ["sorry", "hug"] },
];

/** The library with the GIFs matching `tags` first — each template leads with its own mood. */
export function gifsFor(tags: GifTag[]): typeof GIF_LIBRARY {
  const score = (g: (typeof GIF_LIBRARY)[number]) => -g.tags.filter((t) => tags.includes(t)).length;
  return [...GIF_LIBRARY].sort((a, b) => score(a) - score(b));
}

/** The demo photos every template's preview uses. */
export const DEMO_PHOTOS: LovePhoto[] = [
  { url: `${DEMO_PHOTO_CDN}/couple1.webp`, caption: "the first sunset", note: "You said the sky looked like mango lassi. I have not stopped thinking about it.", cropX: 50, cropY: 45, scale: 100 },
  { url: `${DEMO_PHOTO_CDN}/couple2.webp`, caption: "date night, round 1", note: "You stole my fries and then my heart. In that order.", cropX: 50, cropY: 40, scale: 100 },
  { url: `${DEMO_PHOTO_CDN}/couple3.webp`, caption: "cherry blossom era", note: "Even the trees were jealous of your smile that day.", cropX: 50, cropY: 50, scale: 100 },
  { url: `${DEMO_PHOTO_CDN}/couple4.webp`, caption: "us, forever", note: "Out of every timeline, I'd pick this one. Every time.", cropX: 50, cropY: 50, scale: 100 },
];

// ─── Wire parsing ────────────────────────────────────────────────────────────

/** Photos off the wire. A missing field falls back to `fallback` (the demo); an empty list stays empty. */
export function parseLovePhotos(v: unknown, fallback: LovePhoto[]): LovePhoto[] {
  if (!Array.isArray(v)) return fallback;
  return list<LovePhoto>(
    v,
    (o) => {
      const url = str(o.url, "");
      if (!/^(https:\/\/|data:image\/)/.test(url)) return null;
      const p: LovePhoto = { url };
      const caption = strOr(o.caption, "");
      const note = strOr(o.note, "");
      if (caption) p.caption = caption.slice(0, MAX_CAPTION_LEN);
      if (note) p.note = note.slice(0, MAX_NOTE_LEN);
      for (const k of ["cropX", "cropY", "scale"] as const) {
        const n = Number(o[k]);
        if (Number.isFinite(n)) p[k] = n;
      }
      return p;
    },
    [],
  ).slice(0, MAX_PHOTOS);
}

export function parseLoveGifs(v: unknown, fallback: string[]): string[] {
  if (!Array.isArray(v)) return fallback;
  return strList(v, []).filter((g) => /^https:\/\//.test(g)).slice(0, MAX_GIFS);
}

export function parseLoveLetter(v: unknown, fallback: string): string {
  return typeof v === "string" ? v.slice(0, MAX_LETTER_LEN) : fallback;
}

export function parseTheme(v: unknown, ids: readonly string[], fallback: string): string {
  return typeof v === "string" && ids.includes(v) ? v : fallback;
}

/** All four love-kit fields off the wire, each with its own demo fallback. */
export function parseLoveKit(src: Record<string, unknown>, demo: LoveKitData, themeIds: readonly string[]): LoveKitData {
  return {
    photos: parseLovePhotos(src.photos, demo.photos),
    gifs: parseLoveGifs(src.gifs, demo.gifs),
    letter: parseLoveLetter(src.letter, demo.letter),
    theme: parseTheme(src.theme, themeIds, demo.theme),
    lockQuestion: typeof src.lockQuestion === "string" ? src.lockQuestion.slice(0, MAX_LOCK_QUESTION_LEN) : demo.lockQuestion,
    lockAnswer: typeof src.lockAnswer === "string" ? src.lockAnswer.slice(0, MAX_LOCK_ANSWER_LEN) : demo.lockAnswer,
  };
}
