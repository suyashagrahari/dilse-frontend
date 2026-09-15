// ─── Proposal — two things this page can be ──────────────────────────────────
//
// The same four acts carry two completely different asks:
//
//   • "marriage"     — a real proposal. Rings, forever, the big one.
//   • "relationship" — asking someone to be yours. Lighter, earlier, no ring.
//
// ── WHY THIS IS A PERSPECTIVE AND NOT TWO TEMPLATES ─────────────────────────
//
// The mechanics are identical: a gate, a scrapbook, a button that runs away, a
// letter. Only the words change. Two templates would mean two of everything to
// keep in sync, and the second one would quietly rot — the repo has a variant
// doing exactly this already (`toast-coverage.mjs` counts 45 templates and one
// variant borrowing another's hook).
//
// ── WHY THE DEFAULTS ARE A FUNCTION AND NOT A CONSTANT ──────────────────────
//
// Switching perspective in the editor has to rewrite the copy the sender has
// not personally touched, and leave alone the copy they have. That comparison
// needs both sets in hand, which is what `defaultsFor` gives you — see
// `applyPerspective` in the editor hook. A frozen DEMO object could not answer
// "was this string mine, or did the template put it there?".

export type Perspective = "marriage" | "relationship";

export const PERSPECTIVES: Perspective[] = ["marriage", "relationship"];

export function isPerspective(v: unknown): v is Perspective {
  return v === "marriage" || v === "relationship";
}

export interface PerspectiveCopy {
  /** Shown in the editor's own picker. */
  pickerLabel: string;
  pickerBlurb: string;
  emoji: string;

  gateTitle: string;
  gateButtonLabel: string;
  memoryLaneTitle: string;
  askHeadline: string;
  yesLabel: string;
  celebrationTitle: string;
  secretNote: string;

  /** The chip above the hero art on Act 3. */
  askChip: string;
  /** Sits under the headline: "— Aarav, <this>". */
  askByline: string;
  /** The chip on Act 4: "<name> <this>". */
  saidYesChip: string;
  /** Headline of the share card. */
  storyHeadline: string;
  /** What the share button says. */
  shareLabel: string;
  /** Text offered to the OS share sheet. */
  shareText: (recipient: string) => string;
}

const MARRIAGE: PerspectiveCopy = {
  pickerLabel: "A marriage proposal",
  pickerBlurb: "The ring, the knee, the whole thing.",
  emoji: "💍",

  gateTitle: "Are you ready for a surprise?",
  gateButtonLabel: "Yes, show me!",
  memoryLaneTitle: "Everything that led to this",
  askHeadline: "Will you marry me?",
  yesLabel: "YES! 💍",
  celebrationTitle: "You are officially mine forever ❤️",
  secretNote:
    "I practised this a hundred times in my head and still forgot every word. " +
    "So here it is, plainly: you are my favourite person, my calmest place and my " +
    "loudest laugh. I would like to keep choosing you, every ordinary morning, for " +
    "as long as you'll let me.",

  askChip: "the actual question",
  askByline: "holding their breath",
  saidYesChip: "said yes 💍",
  storyHeadline: "We're engaged",
  shareLabel: "Tell the whole world",
  shareText: (r) => `${r || "She"} said YES 💍💖`,
};

const RELATIONSHIP: PerspectiveCopy = {
  pickerLabel: "Asking them out",
  pickerBlurb: "Be mine, be my girlfriend, be my person.",
  emoji: "💗",

  gateTitle: "Got a minute? I made you something.",
  gateButtonLabel: "Okay, show me",
  memoryLaneTitle: "Everything that got us here",
  askHeadline: "Will you be mine?",
  yesLabel: "YES! 💖",
  celebrationTitle: "It's official — you're mine 💖",
  secretNote:
    "I rewrote this about nine times and deleted all of it, so I'm just going to " +
    "say it. You are my favourite part of an ordinary day. I like who I am when " +
    "you're around, and I have been wanting to ask you this for longer than I am " +
    "willing to admit. So — yes? Please?",

  askChip: "okay, here goes",
  askByline: "trying to sound calm",
  saidYesChip: "said yes 💖",
  storyHeadline: "They said yes",
  shareLabel: "Tell everyone",
  shareText: (r) => `${r || "They"} said YES 💖`,
};

const COPY: Record<Perspective, PerspectiveCopy> = {
  marriage: MARRIAGE,
  relationship: RELATIONSHIP,
};

export function copyFor(p: string | undefined | null): PerspectiveCopy {
  return isPerspective(p) ? COPY[p] : MARRIAGE;
}

/**
 * The subset of fields a perspective switch may rewrite.
 *
 * Only the ones that genuinely say a different thing. `memories` and names are
 * the sender's, and `heroArt` is a picture rather than a sentence — a bouquet
 * works for either ask, so switching perspective must not silently move it back
 * to the ring.
 */
export const PERSPECTIVE_FIELDS = [
  "gateTitle",
  "gateButtonLabel",
  "memoryLaneTitle",
  "askHeadline",
  "yesLabel",
  "celebrationTitle",
  "secretNote",
] as const;

export type PerspectiveField = (typeof PERSPECTIVE_FIELDS)[number];

export function defaultsFor(p: Perspective): Record<PerspectiveField, string> {
  const c = COPY[p];
  return {
    gateTitle: c.gateTitle,
    gateButtonLabel: c.gateButtonLabel,
    memoryLaneTitle: c.memoryLaneTitle,
    askHeadline: c.askHeadline,
    yesLabel: c.yesLabel,
    celebrationTitle: c.celebrationTitle,
    secretNote: c.secretNote,
  };
}

/**
 * Rewrite only what the sender has not personally changed.
 *
 * A field is "untouched" if it still equals the OTHER perspective's default (or
 * is empty). Anything else is theirs and survives the switch — which is the
 * whole contract: flipping the toggle to see what it looks like must never be
 * the thing that eats a letter somebody wrote.
 */
/**
 * The minimum shape this can operate on.
 *
 * Deliberately structural rather than importing `ProposalData`: types.ts
 * imports THIS file for the default copy, so depending on it back would be a
 * cycle. Anything carrying these fields can be switched, and ProposalData is.
 */
export type PerspectiveShaped = Record<PerspectiveField, string> & {
  perspective: Perspective;
};

export function applyPerspective<T extends PerspectiveShaped>(data: T, next: Perspective): T {
  const from = defaultsFor(next === "marriage" ? "relationship" : "marriage");
  const to = defaultsFor(next);
  const out: T = { ...data, perspective: next };
  for (const key of PERSPECTIVE_FIELDS) {
    const current = data[key];
    if (current.trim() === "" || current === from[key]) out[key] = to[key];
  }
  return out;
}
