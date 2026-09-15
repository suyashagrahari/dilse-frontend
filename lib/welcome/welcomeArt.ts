// ─── The welcome-back set ────────────────────────────────────────────────────
//
// Two animations, one of which greets a returning creator at the moment their
// page goes live. They live in object storage beside every other binary this app
// renders — see `lib/templateMedia.ts` for why nothing here is in /public —
// under `gifts-media/welcome/`, uploaded with the house headers
// (`public, max-age=31536000, immutable`).
//
// ── WHY TWO, AND WHY THE PICK IS RANDOM ─────────────────────────────────────
//
// One would be a feature; the same one every time is a screensaver. A creator
// who publishes a card a week should not be able to predict the greeting, and
// two is the smallest number that makes it a small surprise rather than a
// fixture. The pick is made once per session in `welcomeBus`, not per render,
// so the one that is warmed is the one that is shown — see `pickMascot` there.
//
// ── WHY THE LOOP LENGTH IS RECORDED ─────────────────────────────────────────
//
// `loopMs` is each file's real duration, measured with ffprobe, and it is what
// decides how long the greeting stays on screen: entrance, then exactly one
// loop, then a short rest. This matters because the two are not the same
// length — 1.72s and 1.80s — and a single hard-coded hold would either cut the
// penguin's confetti off mid-fall or leave the shiba standing there having
// already started waving again. A greeting that restarts before it leaves reads
// as a stuck image, which is the opposite of the intended effect.
//
// ── WHY THE INTRINSIC SIZE IS RECORDED ──────────────────────────────────────
//
// `width`/`height` are the real pixel dimensions, handed to the <img> so the
// browser reserves the box before the bytes land. The same reasoning as
// `lib/feedback/feedbackArt.ts`, and the same trap if it is skipped: a reflow
// on the one screen whose whole job is to feel considered.
//
// ── ON THE FILES THEMSELVES ─────────────────────────────────────────────────
//
// Both are 1-bit transparent with clear corners, so they render directly on the
// scrim with no plate behind them, and both set their caption HARD AGAINST THE
// TOP EDGE — "WELCOME BACK" literally touches the first row of pixels. That is
// the exact hazard `components/feedback/MascotStage.tsx` was rewritten to make
// impossible, which is why the overlay reuses that component rather than
// rolling its own box. Read the crop note at the top of that file before
// changing anything about how these are sized.
//
// `good-to-see-you` was a 408px, 248 KB source and ships at 320px/64 colours
// and 194 KB, which is indistinguishable at the ~236px slot it renders into.
// `welcome-back` is shipped as authored: every re-encode tried came out LARGER
// than the 200 KB original, because ffmpeg's GIF encoder does not match the
// source's inter-frame optimisation. Only one of the two is ever downloaded.

import { media } from "@/lib/templateMedia";

export type WelcomeMascotKey = "welcomeBack" | "goodToSeeYou";

export interface WelcomeMascot {
  src: string;
  /** Described for a screen reader, because the picture IS the greeting here. */
  alt: string;
  width: number;
  height: number;
  /** One full loop, in ms. Measured, not guessed. See the note above. */
  loopMs: number;
  /**
   * The greeting in words, for the line under the art.
   *
   * It lives with the artwork rather than in the overlay because the two have
   * to agree: the shiba's sign says "Good to see you" and a headline reading
   * "Welcome back" underneath it would be two greetings at once. Pair them here
   * and a third mascot cannot be added with the wrong caption.
   */
  greeting: string;
  /**
   * The halo behind the art, and the colour of the progress line. Taken from
   * each character's own palette — the penguin's cornflower blue, the shiba's
   * wooden sign — so the glow reads as light coming off the artwork rather than
   * a house colour applied to it.
   */
  tone: string;
}

export const WELCOME_MASCOTS: Record<WelcomeMascotKey, WelcomeMascot> = {
  welcomeBack: {
    src: media("welcome/welcome-back.gif"),
    alt: "A small blue penguin throwing its flippers up as confetti falls, saying welcome back",
    width: 300,
    height: 300,
    loopMs: 1720,
    greeting: "Welcome back",
    tone: "#7f9fe0",
  },
  goodToSeeYou: {
    src: media("welcome/good-to-see-you.gif"),
    alt: "A cheerful white dog bursting out of the ground waving, holding a sign reading good to see you",
    width: 320,
    height: 320,
    loopMs: 1800,
    greeting: "Good to see you",
    tone: "#c9a84c",
  },
};

export const WELCOME_MASCOT_KEYS = Object.keys(WELCOME_MASCOTS) as WelcomeMascotKey[];

/**
 * Warm one animation so the greeting renders without a blank first frame.
 *
 * The same `new Image()` as `lib/feedback/feedbackArt.ts` and for the same
 * reasons: it primes the image cache, which is the thing actually being asked
 * for, and it works from inside an effect. Failures are silent because a missed
 * preload costs a few hundred milliseconds of empty stage and nothing else.
 */
export function preloadWelcomeMascot(key: WelcomeMascotKey): void {
  if (typeof window === "undefined") return;
  try {
    const img = new window.Image();
    img.decoding = "async";
    img.src = WELCOME_MASCOTS[key].src;
  } catch {
    /* a cold greeting, and nothing worth reporting */
  }
}
