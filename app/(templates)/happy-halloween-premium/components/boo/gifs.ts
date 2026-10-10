// The GIF stickers (all on our CDN, from .template-factory/premium-v3/gifs.json
// and the owner's Halloween v4 picks in templates/_halloween/). Six of them are
// sender-swappable slots (day config `gifSlots`); the rest are fixed little
// reactors that dress each scene.
import { MEDIA_BASE } from "@/lib/templateMedia";

const H = (n: string) => `${MEDIA_BASE}/templates/_premium/gifs/halloween/${n}.webp`;
const C = (n: string) => `${MEDIA_BASE}/templates/_premium/gifs/common/${n}.webp`;
/** The owner's v4 picks (transparent animated WebP, ~300–360 px). */
const W = (n: string) => `${MEDIA_BASE}/templates/_halloween/${n}.webp`;

export const GIF = {
  // v4 — the owner's picks
  /** Pumpkin lid pops, a ghost jumps out, "BOO!" lands at frame 7 (280 ms); 0.96 s loop. */
  pumpkinBoo: W("pumpkin-ghost-boo"),
  /** A jack-o'-lantern whose eyes + mouth glow green (peaks at 1.24 s and 2.48 s). */
  pumpkinLight: W("pumpkin-light-up"),
  /** The cute witch seal on her broom: our guide, flies across on every "Next". */
  witchSeal: W("witch-seal-broom"),
  cuteBats: W("cute-bats"),
  /** Panda in a Scream mask hugging a pumpkin: the "got you!" mascot. */
  panda: W("panda-scream-mask"),
  /** "HAPPY HALLOWEEN" + a penguin peeking out of a pumpkin: the title card. */
  titleCard: W("happy-halloween-pumpkin"),
  // halloween library
  bucket: H("ghost-pumpkin-bucket"),
  pinkPumpkin: H("pink-pumpkin-smile"),
  blush: H("ghost-heart-eyes-blush"),
  spookyLove: H("ghost-spooky-love"),
  couple: H("ghost-couple-hearts"),
  cuddle: H("ghosts-cuddling"),
  heartEyes: H("ghost-heart-eyes"),
  // common (animated emoji): only shown after a No dodge
  pleading: C("noto-pleading-face"),
  crying: C("noto-loudly-crying"),
} as const;

/** Where "BOO!" lands in pumpkin-ghost-boo.webp (frame 7 × 40 ms), minus the sample's ~40 ms attack. */
export const BOO_FRAME_MS = 250;

/** Slot id → its default (mirrors `file` in the day config's gifSlots). */
export const SLOT_DEFAULT: Record<string, string> = {
  "hb1-hello": GIF.titleCard,
  "hb2-treats": GIF.bucket,
  "hb3-pumpkin": GIF.pinkPumpkin,
  "hb4-booth": GIF.cuddle,
  "hb5-potion": GIF.witchSeal,
  "hb6-yes": GIF.couple,
};

// ── Restartable GIFs ─────────────────────────────────────────────────────────
// An animated WebP shown twice from the same URL keeps one shared timeline, so
// a scare would land mid-loop. Each play gets its own URL (?play=N; the CDN
// ignores the query) and starts at frame 0 when it is first painted. The next
// copy is warmed ahead with new Image() so the scare never waits on the network.
// (Not fetch() + blob: — the CDN's edge cache sometimes serves these without
// CORS headers.)
const played = new Map<string, number>();
const warmed = new Set<string>();
const keep: HTMLImageElement[] = [];

const nth = (url: string, n: number) => `${url}?play=${n}`;

/** Warm the copy the next freshGif(url) will use. */
export function preloadGif(url: string): void {
  if (typeof window === "undefined") return;
  const src = nth(url, (played.get(url) ?? 0) + 1);
  if (warmed.has(src)) return;
  warmed.add(src);
  const img = new Image();
  img.decoding = "async";
  img.src = src;
  keep.push(img);
}

/** A never-shown copy of the GIF: it plays from frame 0. */
export function freshGif(url: string): string {
  const n = (played.get(url) ?? 0) + 1;
  played.set(url, n);
  return nth(url, n);
}

/** The copy the last freshGif(url) handed out (already downloaded). */
export const lastGif = (url: string): string => nth(url, played.get(url) ?? 1);
