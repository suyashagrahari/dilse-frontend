/* ─── Hold My Hand — the emotional timeline ──────────────────────────────────
 *
 * Holding on for a minute is a long time to look at one unchanging screen. This
 * file is the answer to that: the world warms as they hold. It starts as a cold
 * indigo night and ends at a golden dawn, and the little animation above their
 * person's face changes with it — hearts, then "love you this much", then a hug,
 * then the hug they earned.
 *
 * Everything is keyed off PROGRESS (0→1), never off elapsed seconds, because the
 * sender chooses the duration. A 20-second hold and a two-minute hold both pass
 * through all five stages; they just linger differently.
 *
 * ── WHY THESE GIFS AND NOT NEW ONES ─────────────────────────────────────────
 *
 * They already ship in /public/assets for court-of-love and missyou-gf. Reusing
 * them costs zero new bytes in the repo, the Docker image and every deploy —
 * and these are the same two characters the rest of the app already uses, so
 * the cast stays consistent instead of every template inventing its own.
 */

export interface Stage {
  /** Progress at which this stage begins (0→1). */
  from: number;
  /** Animation above the portrait. */
  gif: string;
  /** Alt text — these carry meaning, so they are never empty. */
  alt: string;
  /** Page background for this stage. */
  bg: string;
  /** The progress ring. */
  ring: string;
  /** The glow behind the portrait. */
  halo: string;
  /** Accent for the timer and small type. */
  accent: string;
  /** A warm line, shown when the stage begins. Plain, not clever. */
  whisper: string;
}

/**
 * Five stages. The background lightens and warms monotonically, so a glance at
 * the screen tells you roughly how far in you are without reading the timer.
 */
export const STAGES: Stage[] = [
  {
    from: 0,
    gif: "/assets/court-of-love/hearts.gif",
    alt: "Two hearts, beating",
    bg: "radial-gradient(120% 78% at 50% 16%, #241354 0%, #140B2E 46%, #07050D 100%)",
    ring: "rgb(124,110,220)",
    halo: "rgba(108,92,231,.55)",
    accent: "#B7ADFF",
    whisper: "there you are. don't let go.",
  },
  {
    from: 0.2,
    gif: "/assets/court-of-love/love-this-much.gif",
    alt: "Arms stretched wide — this much",
    bg: "radial-gradient(120% 78% at 50% 16%, #3A1655 0%, #1C0E33 46%, #0A0611 100%)",
    ring: "rgb(186,112,222)",
    halo: "rgba(186,112,222,.55)",
    accent: "#E3B4FF",
    whisper: "you're still here. that's the whole thing.",
  },
  {
    from: 0.45,
    gif: "/assets/missyou-gf/hug-penguin.gif",
    alt: "A small hug",
    bg: "radial-gradient(120% 78% at 50% 16%, #5A1C4E 0%, #2A1030 46%, #0D0712 100%)",
    ring: "rgb(240,110,170)",
    halo: "rgba(247,37,133,.5)",
    accent: "#FFB3D4",
    whisper: "your hand is warm through the glass.",
  },
  {
    from: 0.7,
    gif: "/assets/court-of-love/penguin-hug.gif",
    alt: "Holding on tight",
    bg: "radial-gradient(120% 78% at 50% 16%, #7A2A3E 0%, #3A1526 46%, #110710 100%)",
    ring: "rgb(255,150,120)",
    halo: "rgba(255,150,120,.55)",
    accent: "#FFC9B0",
    whisper: "nearly. stay with me.",
  },
  {
    from: 0.9,
    gif: "/assets/missyou-gf/hug-after-yes.gif",
    alt: "The hug at the end",
    bg: "radial-gradient(120% 78% at 50% 16%, #9C5A2C 0%, #4A2418 46%, #150A0C 100%)",
    ring: "rgb(255,196,92)",
    halo: "rgba(255,196,92,.6)",
    accent: "#FFE1A8",
    whisper: "you stayed. you actually stayed.",
  },
];

/** The stage a given progress belongs to. */
export function stageFor(p: number): Stage {
  let out = STAGES[0];
  for (const s of STAGES) if (p >= s.from) out = s;
  return out;
}

export function stageIndexFor(p: number): number {
  let i = 0;
  STAGES.forEach((s, idx) => {
    if (p >= s.from) i = idx;
  });
  return i;
}

/* ─── Letting go ─────────────────────────────────────────────────────────────
 *
 * Escalating, but never cruel. The point is "come back", not "you failed" — so
 * the first release gets the softest face and the copy stays affectionate all
 * the way down. Nobody should feel told off by a gift.
 */
export const RELEASE_MOMENTS: { gif: string; alt: string; line: string }[] = [
  { gif: "/assets/missyou-gf/cry-panda.gif", alt: "A small sad panda", line: "oh — come back?" },
  { gif: "/assets/missyou-gf/cry-bear.gif", alt: "A crying bear", line: "you let go. i felt that." },
  { gif: "/assets/court-of-love/dont-be-sad.gif", alt: "Please don't go", line: "i'll wait. i'm good at waiting." },
  { gif: "/assets/missyou-gf/cry-cat.gif", alt: "A cat in tears", line: "still here. whenever you are." },
];

export const releaseMoment = (releases: number) =>
  RELEASE_MOMENTS[Math.min(Math.max(releases - 1, 0), RELEASE_MOMENTS.length - 1)];

/** The wrong-password face. Sad, never scolding. */
export const WRONG_PASSWORD_GIF = "/assets/missyou-gf/cry-panda.gif";
/** Shown on the locked screen before they have tried anything. */
export const LOCKED_GIF = "/assets/court-of-love/love-heart.gif";

/**
 * Warm the next stage's animation while the current one is on screen, so the
 * swap is instant instead of a blank frame mid-hold. Fire-and-forget: a failed
 * preload must never surface to somebody who is concentrating on holding still.
 */
export function preloadStage(index: number): void {
  const next = STAGES[index + 1];
  if (!next || typeof window === "undefined") return;
  const img = new window.Image();
  img.src = next.gif;
}
