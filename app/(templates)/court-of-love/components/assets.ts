// ─── Court of Love — asset manifest ──────────────────────────────────────────
// Every animation the template uses, in one place.
//
// `verdict-love-more` is an MP4 rather than a GIF on purpose: it is 13.5 s of
// hand-drawn text animation, which GIF cannot compress (it ballooned to 1.7 MB).
// As H.264 it is 53 KB — a 31x saving — and its background is opaque white, so
// flattening the alpha channel costs nothing visually.

const BASE = "/assets/court-of-love";

export const ASSETS = {
  /** Two penguins balanced on the scales — nobody is above the Court. */
  scales: `${BASE}/scales-equal.gif`,
  /** Judge at the podium, gavel in hand. */
  gavel: `${BASE}/judge-gavel.gif`,
  /** The clerk who reads out each hearing. */
  clerk: `${BASE}/clerk-pengu.gif`,
  /** "THE COURT HAS DECIDED I LOVE YOU MORE / THERE WILL BE NO APPEALS" (video). */
  verdict: `${BASE}/verdict-love-more.mp4`,
  /** Gold medal on the winner's podium. */
  win: `${BASE}/win-medal.gif`,
  /** "I LOVE YOU THIS MUCH" — punctuates the letter. */
  loveThisMuch: `${BASE}/love-this-much.gif`,
} as const;

export interface Reaction {
  src: string;
  alt: string;
  /**
   * How long the screen holds before auto-advancing, in ms. Defaults to
   * REACTION_DWELL; set it only to override that for one piece of art.
   */
  dwell?: number;
  /** Whether the art itself contains words. Drives the "let it finish" hint. */
  hasText: boolean;
  /**
   * Rendered width in px. Defaults to REACTION_SIZE. Set it lower for art with a
   * small native resolution — `koi-baat-nahi` is only 140px wide at source, so
   * stretching it to the standard size visibly softens its Hindi lettering.
   */
  size?: number;
}

/** Standard reaction width; most reaction art is 390-440px at source. */
export const REACTION_SIZE = 250;

/**
 * How long a reaction holds before advancing on its own: a full ten seconds.
 *
 * Nearly all of this art has words drawn into it, and the loops are short
 * (0.3-3.2 s), so ten seconds lets a short GIF cycle several times and a long
 * one finish comfortably — with room to actually read the line underneath
 * rather than racing it. Nobody is trapped for ten seconds: there is an explicit
 * close button on the art, tapping anywhere advances, and a ring counts the
 * time down so the hold always looks intentional.
 */
export const REACTION_DWELL = 10_000;

/**
 * After a correct answer — celebration. Rotated so five hearings never repeat.
 */
export const CORRECT_REACTIONS: Reaction[] = [
  {
    src: `${BASE}/love-heart.gif`,
    alt: "A big beating heart celebrating a correct answer",
    hasText: false,
  },
  {
    src: `${BASE}/you-are-amazing.gif`,
    alt: "A penguin cheering under the words “you are amazing”",
    hasText: true,
  },
  {
    src: `${BASE}/hearts.gif`,
    alt: "Floating hearts sent as a reward",
    hasText: false,
  },
];

/**
 * After a wrong answer — comfort, never punishment. All three of these say some
 * version of "it's okay": "koi baat nahi", "don't worry", "don't be sad".
 */
export const WRONG_REACTIONS: Reaction[] = [
  {
    src: `${BASE}/koi-baat-nahi.gif`,
    alt: "A sad cartoon lion cub under the Hindi words “koi baat nahi”, meaning it's okay",
    hasText: true,
    size: 200, // 140px at source — anything larger softens the Devanagari text
  },
  {
    src: `${BASE}/wipe-tears.gif`,
    alt: "One cartoon character gently wiping another's tears — don't worry",
    hasText: true,
  },
  {
    src: `${BASE}/dont-be-sad.gif`,
    alt: "Two penguins hugging under the words “don't be sad”",
    hasText: true,
  },
];

/**
 * Shown at the recess before the final cross-examination. These three GIFs
 * literally say "you can do it" / "you can" / "keep going", so they belong here
 * — cheering the accused on with one hearing left — rather than in the
 * correct-answer pool, where the words would make no sense.
 */
export const ENCOURAGEMENTS: Reaction[] = [
  {
    src: `${BASE}/you-can-do-it.gif`,
    alt: "A penguin raising a flipper under the words “you can do it!!”",
    hasText: true,
  },
  {
    src: `${BASE}/keep-going.gif`,
    alt: "A cheerful penguin under the words “keep going”",
    hasText: true,
  },
  {
    src: `${BASE}/you-can.gif`,
    alt: "A smiling penguin on an iceberg under the words “you can”",
    hasText: true,
  },
];

/**
 * Pick a reaction for hearing `index`. Deterministic, so replaying a hearing
 * shows the same art instead of shuffling under the user.
 */
export function reactionFor(correct: boolean, index: number): Reaction {
  const list = correct ? CORRECT_REACTIONS : WRONG_REACTIONS;
  return list[index % list.length];
}

/**
 * Pick the recess cheer. Someone who has missed a few gets the emphatic
 * "you can do it!!"; someone cruising gets "keep going".
 */
export function encouragementFor(score: number, answered: number): Reaction {
  if (answered > 0 && score / answered < 0.5) return ENCOURAGEMENTS[0]; // struggling
  if (score === answered) return ENCOURAGEMENTS[1]; // perfect so far
  return ENCOURAGEMENTS[2];
}
