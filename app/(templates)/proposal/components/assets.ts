// ─── Proposal — asset manifest ───────────────────────────────────────────────
// Every animation the template uses, in one place.
//
// All ten files carry an alpha channel, so they sit directly on the pastel
// background with no white box around them. They stayed as GIF/WebP rather than
// being re-encoded: the sources are already palette-optimised (a full
// palettegen pass won back only 6% on the largest one), and converting the
// transparent GIFs to MP4 would have cost the alpha channel.
//
// Weight discipline: only `hello-cat` and the chosen `heroArt` are needed for
// first paint. The four reactions are pulled in lazily by the dodge ladder, so
// a recipient who says yes immediately never downloads them.

import type { HeroArt, ReactionKey } from "./types";

const BASE = "/assets/proposal";

export const ASSETS = {
  /** Mochi cat waving with floating hearts — greets the recipient at the audio gate. */
  helloCat: `${BASE}/hello-cat.webp`,
  /** Flat-vector couple mid-proposal inside a heart — the scrapbook's closing frame. */
  askHero: `${BASE}/ask-hero.webp`,
  /** Penguin overwhelmed with happy tears — the payoff after YES. */
  joyTears: `${BASE}/joy-tears.webp`,
} as const;

/** The three animations a sender can headline the proposal with. */
export const HERO_ART: Record<HeroArt, { src: string; alt: string; label: string; emoji: string }> = {
  ring: {
    src: `${BASE}/ask-ring.gif`,
    alt: "A ring box opening to the words will you marry me",
    label: "Ring box",
    emoji: "💍",
  },
  rose: {
    src: `${BASE}/ask-rose.gif`,
    alt: "A single rose beside the words will you marry me",
    label: "Single rose",
    emoji: "🌹",
  },
  bouquet: {
    src: `${BASE}/ask-bouquet.gif`,
    alt: "A bouquet held out with the words will you marry me",
    label: "Bouquet",
    emoji: "💐",
  },
};

/**
 * The guilt-trip gallery. The dodge ladder in ./types names one of these per
 * rung, so each attempt to press "No" is met with a different sad face.
 */
export const REACTIONS: Record<ReactionKey, { src: string; alt: string }> = {
  sadCry: { src: `${BASE}/sad-cry.webp`, alt: "A small character sobbing" },
  sadBear: { src: `${BASE}/sad-bear.webp`, alt: "Mocha the bear slumped in a puddle of tears" },
  sadBaby: { src: `${BASE}/sad-baby.webp`, alt: "A baby with a wobbling lip" },
  sadWhy: { src: `${BASE}/sad-why.webp`, alt: "A character asking why, mid-cry" },
};

/** Art shown in the memory-lane picker when the sender has not uploaded a photo. */
export const MEMORY_PLACEHOLDERS: string[] = [
  ASSETS.helloCat,
  REACTIONS.sadBear.src,
  ASSETS.joyTears,
  ASSETS.askHero,
];
