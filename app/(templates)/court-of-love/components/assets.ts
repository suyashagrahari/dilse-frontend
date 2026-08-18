// ─── Court of Love — asset manifest ──────────────────────────────────────────
// Every animation the template uses, in one place.
//
// `verdict-love-more` is an MP4 rather than a GIF on purpose: it is 13.5 s of
// hand-drawn text animation, which GIF cannot compress (it ballooned to 1.7 MB).
// As H.264 it is 53 KB — a 31x saving — and its background is opaque white, so
// flattening the alpha channel costs nothing visually.

const BASE = "https://cdn.subhsandesh.in/gifts-media/assets/court-of-love";

export const ASSETS = {
  /** Two penguins balanced on the scales — nobody is above the Court. */
  scales: `${BASE}/scales-equal.gif`,
  /** Judge at the podium, gavel in hand. */
  gavel: `${BASE}/judge-gavel.gif`,
  /** The clerk who reads out each question. */
  clerk: `${BASE}/clerk-pengu.gif`,
  /** "THE COURT HAS DECIDED I LOVE YOU MORE / THERE WILL BE NO APPEALS" (video). */
  verdict: `${BASE}/verdict-love-more.mp4`,
  /** Gold medal on the winner's podium. */
  win: `${BASE}/win-medal.gif`,
  /** "I LOVE YOU THIS MUCH" — punctuates the letter. */
  loveThisMuch: `${BASE}/love-this-much.gif`,
} as const;

// ── EVERY REACTION MUST BE SILHOUETTED, NOT A RECTANGLE ──────────────────────
//
// The reaction art used to sit inside a white card, which meant nobody could
// tell the difference between a GIF with a transparent background and one with
// an opaque white block behind it. Now the art sits directly on the page, so
// that difference is the whole design: a silhouetted character reads as a
// sticker, and an opaque one reads as a screenshot someone pasted in.
//
// Three assets failed that test and were dropped rather than framed around:
//
//   wipe-tears    100% opaque, AND it has two strangers' names ("You" /
//                 "Jiniret") drawn into the art plus an artist's watermark
//   keep-going    100% opaque white block, also watermarked
//   koi-baat-nahi 140px at source — the smallest art here by a wide margin, so
//                 it had to be under-sized to stay sharp while everything
//                 around it ran at 250px
//
// Before adding art here, check the WORST frame, not the first: a GIF can start
// transparent and flash an opaque panel mid-loop. Anything above ~90% opaque on
// any frame will read as a stray rectangle on the cream page.

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
  /** Rendered width in px. Defaults to REACTION_SIZE. */
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
 * After a correct answer — celebration. Rotated so consecutive answers never repeat.
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
 * After a wrong answer — comfort, never punishment.
 *
 * Softer and more romantic than it was. The hug leads, because a wrong answer in
 * a game about your own relationship should feel like being pulled closer, not
 * marked down.
 */
export const WRONG_REACTIONS: Reaction[] = [
  {
    src: `${BASE}/penguin-hug.gif`,
    alt: "A blue penguin and a pink penguin reaching for each other and hugging",
    hasText: false,
  },
  {
    src: `${BASE}/dont-be-sad.gif`,
    alt: "Two penguins hugging under the words “don't be sad”",
    hasText: true,
  },
  {
    src: `${BASE}/aww-bear.gif`,
    alt: "A small round cartoon bear bursting into cartoon tears",
    hasText: false,
  },
];

/**
 * Shown at the recess before the last question. Both of these literally say "you
 * can do it", so they belong here — cheering the player on with one to go —
 * rather than in the right-answer pool, where the words would make no sense.
 *
 * Two, not three: the third was `keep-going`, a solid white watermarked block
 * that only worked because a card used to hide its edges.
 */
export const ENCOURAGEMENTS: Reaction[] = [
  {
    src: `${BASE}/you-can-do-it.gif`,
    alt: "A penguin raising a flipper under the words “you can do it!!”",
    hasText: true,
  },
  {
    src: `${BASE}/you-can.gif`,
    alt: "A smiling penguin on an iceberg under the words “you can”",
    hasText: true,
  },
];

/**
 * Pick a reaction for question `index`. Deterministic, so replaying a question
 * shows the same art instead of shuffling under the user.
 */
export function reactionFor(correct: boolean, index: number): Reaction {
  const list = correct ? CORRECT_REACTIONS : WRONG_REACTIONS;
  return list[index % list.length];
}

/**
 * Pick the recess cheer. Someone who has missed a few gets the emphatic
 * "you can do it!!"; anyone else gets the calmer "you can".
 */
export function encouragementFor(score: number, answered: number): Reaction {
  const struggling = answered > 0 && score / answered < 0.5;
  return struggling ? ENCOURAGEMENTS[0] : ENCOURAGEMENTS[1];
}
