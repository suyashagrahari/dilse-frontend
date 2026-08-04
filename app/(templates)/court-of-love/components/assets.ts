// ─── Court of Love — asset manifest ──────────────────────────────────────────
// Every animation the template uses, in one place. Sizes are the optimised
// on-disk sizes (source GIFs were 5.4 MB total; these are 1.6 MB).
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
  /** "THE COURT HAS DECIDED I LOVE YOU MORE" — the verdict itself (video). */
  verdict: `${BASE}/verdict-love-more.mp4`,
  /** Gold medal on the winner's podium. */
  win: `${BASE}/win-medal.gif`,
  /** "I LOVE YOU THIS MUCH" — closes the letter. */
  loveThisMuch: `${BASE}/love-this-much.gif`,
} as const;

/** Shown after a correct answer, rotating so five hearings never repeat one. */
export const CORRECT_REACTIONS = [
  { src: `${BASE}/love-heart.gif`, alt: "A big beating heart celebrating a correct answer" },
  { src: `${BASE}/you-are-amazing.gif`, alt: "An animation reading 'you are amazing'" },
  { src: `${BASE}/hearts.gif`, alt: "Floating hearts sent as a reward" },
  { src: `${BASE}/keep-going.gif`, alt: "A cheerful 'keep going' animation" },
] as const;

/** Shown after a wrong answer — gentle and funny, never punishing. */
export const WRONG_REACTIONS = [
  { src: `${BASE}/koi-baat-nahi.gif`, alt: "A sad cartoon lion saying 'koi baat nahi' (no problem)" },
  { src: `${BASE}/wipe-tears.gif`, alt: "One cartoon character gently wiping another's tears" },
  { src: `${BASE}/dont-be-sad.gif`, alt: "Two penguins hugging under the words 'don't be sad'" },
] as const;

/**
 * Pick a reaction for hearing `index`. Deterministic so replaying the same
 * hearing shows the same GIF, and offset by one on the wrong list so a retry
 * after a miss doesn't repeat the identical consolation.
 */
export function reactionFor(correct: boolean, index: number) {
  const list = correct ? CORRECT_REACTIONS : WRONG_REACTIONS;
  return list[index % list.length];
}
