// ─── LoveFlix — shared type contract + scene-graph validator ─────────────────
//
// Single source of truth for the shape shared by the editor, the published
// viewer and the server payload. Field names here === server model field names
// === wire-format keys. Keep them in sync.
//
// BRAND SAFETY, and this is not a preference:
// This template reproduces the LAYOUT CONVENTIONS of a streaming service —
// profile selection, a dark browse grid, horizontal rows, a hero banner, a
// Top 10 rail with oversized numerals, skip-intro, autoplay countdowns, timed
// binary choices. Those are a genre and are not protectable.
//
// It reproduces NO ONE'S IDENTITY. There is no "N" mark, no #E50914, and the
// incumbent's name appears nowhere in this template — not in copy, file names,
// class names, alt text, or comments. `assertBrandSafe()` at the bottom is run
// by the template at mount in development and will report it if that ever slips.
//
// (The one place the literal token does appear is inside that guard's own
// pattern list, because a screen has to name what it screens for.)
//
// THE VALIDATOR IS THE OTHER LOAD-BEARING PIECE. A branch that dead-ends
// renders a blank screen with no error and is miserable to debug, so the graph
// is walked at load and a dead end is a loud, specific failure.

import { bodyFromKeys, clampNum, list, str, strOr, type Raw } from "@/lib/wire";

export type EditMode = null | "manual" | "preview";

export interface Toast {
  id: number;
  type: "success" | "info" | "publish";
  title: string;
  message?: string;
  shareUrl?: string;
}

// ─── Palette ─────────────────────────────────────────────────────────────────

/**
 * Deep warm amber. Chosen because it is unmistakably not the streaming red it
 * would otherwise be mistaken for, and because it reads well as a progress bar
 * against near-black. ONE accent runs through the entire template — buttons,
 * progress bars, the match percentage, the choice countdown. Nothing else in
 * the UI is allowed to be coloured.
 */
export const ACCENT = "#E8913A";
export const ACCENT_DIM = "#8a5520";
export const BG = "#0d0d0d";
export const BG_RAISED = "#161616";
export const TEXT = "#f5f5f5";
export const TEXT_DIM = "#a0a0a0";

export const WORDMARK = "LOVEFLIX";

// ─── Data ────────────────────────────────────────────────────────────────────

export type RowKind = "cards" | "top10";

export interface RowItem {
  title: string;
  imageUrl: string;
  caption: string;
  runtime: string;
  /** 0-100. Renders a thin accent bar across the card bottom. 0 hides it. */
  progress: number;
}

export interface Row {
  title: string;
  kind: RowKind;
  items: RowItem[];
}

export interface Choice {
  label: string;
  nextSceneId: string;
}

export interface Scene {
  id: string;
  imageUrl: string;
  /** Narration, revealed line by line. Split on newlines by the renderer. */
  text: string;
  /** Exactly 2 on a non-finale scene; empty on a finale. */
  choices: Choice[];
  choiceSeconds: number;
  /** Used when the timer runs out. Timing out is a joke, never a failure. */
  defaultChoiceIndex: number;
  isFinale: boolean;
}

export interface Credit {
  role: string;
  name: string;
}

export interface LoveflixData {
  senderName: string;
  senderPhotoUrl: string;
  recipientName: string;
  recipientPhotoUrl: string;
  showTitle: string;
  tagline: string;
  heroImageUrl: string;
  /** Rendered as "99% Match" in the accent colour. */
  matchPercent: number;
  /** "Rated A — for Aditi only". Invented rating board, obviously. */
  rating: string;
  seasons: string;
  /** The year they met. Sits in the hero metadata row. */
  metYear: string;
  rows: Row[];
  scenes: Scene[];
  startSceneId: string;
  finaleText: string;
  /** Optional. When present, a single button appears after the text settles. */
  finaleQuestion: string;
  credits: Credit[];
}

// ─── Timing ──────────────────────────────────────────────────────────────────

export const PLAYER = {
  /** The 2.5s that gets screen-recorded. Spend real time on it. */
  introMs: 2500,
  wordmarkMs: 1400,
  /** Skip Intro is offered, and refuses. Build the joke. */
  skipIntroWindowMs: 6000,
  lineRevealMs: 700,
  /** Beat between the last narration line and the choices arriving. */
  choiceBeatMs: 400,
  choiceCommitHoldMs: 350,
  sceneFadeMs: 400,
  defaultChoiceSeconds: 10,
  /** "Are you still watching?" — fires once, after this much idle. */
  stillWatchingIdleMs: 25_000,
  /** …and only once the episode is roughly this far along. */
  stillWatchingAtProgress: 0.6,
  kenBurnsMs: 12_000,
  autoplayNextSeconds: 5,
} as const;

export const TIMEOUT_LINE = "you took too long. I chose for you.";
export const SKIP_INTRO_JOKE = "you can't skip this one";
export const LOCKED_PROFILE_JOKE = "not you.";

// ─── Scene graph ─────────────────────────────────────────────────────────────

export type SceneIndex = Record<string, Scene>;

export const indexScenes = (scenes: Scene[]): SceneIndex =>
  Object.fromEntries(scenes.map((s) => [s.id, s]));

export interface GraphReport {
  ok: boolean;
  errors: string[];
  warnings: string[];
  /** Every distinct root→finale path length. Used to check branch balance. */
  pathDepths: number[];
  /** Scenes never reachable from the start. Dead weight, not fatal. */
  unreachable: string[];
}

/**
 * Walks the graph exhaustively and reports every structural problem at once,
 * rather than failing on the first.
 *
 * The rules, all of which the format depends on:
 *   - the start scene exists
 *   - every non-finale scene has exactly 2 choices
 *   - every nextSceneId resolves
 *   - every terminal node is a finale — no dead ends
 *   - all paths converge on a finale, so no choice is ever "wrong"
 *   - no cycles (a loop means the progress bar can never be honest)
 *   - branch depths stay within 2 of each other, so one path is not twice the
 *     length of another
 *
 * Cycle detection is why this is a colour-marked DFS rather than a queue: a
 * cycle would otherwise hang the walk instead of reporting itself.
 */
export function validateSceneGraph(scenes: Scene[], startSceneId: string): GraphReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  const byId = indexScenes(scenes);
  const pathDepths: number[] = [];

  if (scenes.length === 0) {
    return { ok: false, errors: ["the episode has no scenes"], warnings, pathDepths, unreachable: [] };
  }

  const dupes = scenes.map((s) => s.id).filter((id, i, a) => a.indexOf(id) !== i);
  if (dupes.length) errors.push(`duplicate scene ids: ${[...new Set(dupes)].join(", ")}`);

  if (!byId[startSceneId]) {
    errors.push(`startSceneId "${startSceneId}" is not a scene`);
    return { ok: false, errors, warnings, pathDepths, unreachable: [] };
  }

  const reached = new Set<string>();
  const onStack = new Set<string>();
  // Guard against a pathological fan-out enumerating an exponential path count.
  let visits = 0;
  const MAX_VISITS = 20_000;

  const walk = (id: string, depth: number) => {
    if (visits++ > MAX_VISITS) return;
    const scene = byId[id];
    if (!scene) return;

    if (onStack.has(id)) {
      errors.push(`cycle: "${id}" is reachable from itself`);
      return;
    }
    onStack.add(id);
    reached.add(id);

    if (scene.isFinale) {
      pathDepths.push(depth);
      if (scene.choices.length > 0) {
        warnings.push(`finale "${id}" has choices; they will not be rendered`);
      }
    } else if (scene.choices.length !== 2) {
      errors.push(`scene "${id}" has ${scene.choices.length} choices; every non-finale scene needs exactly 2`);
      // A scene with no valid choices is a dead end whichever way you count it.
      if (scene.choices.length === 0) errors.push(`dead end: "${id}" is terminal but is not marked isFinale`);
    }

    if (!scene.isFinale) {
      scene.choices.forEach((ch, i) => {
        if (!byId[ch.nextSceneId]) {
          errors.push(`scene "${id}" choice ${i + 1} ("${ch.label}") points at missing scene "${ch.nextSceneId}"`);
          return;
        }
        walk(ch.nextSceneId, depth + 1);
      });
      if (scene.defaultChoiceIndex < 0 || scene.defaultChoiceIndex >= Math.max(1, scene.choices.length)) {
        errors.push(`scene "${id}" defaultChoiceIndex ${scene.defaultChoiceIndex} is out of range`);
      }
    }

    onStack.delete(id);
  };

  walk(startSceneId, 1);

  if (visits > MAX_VISITS) {
    errors.push("scene graph is too large to validate; it is almost certainly looping");
  }

  const unreachable = scenes.map((s) => s.id).filter((id) => !reached.has(id));
  if (unreachable.length) warnings.push(`unreachable scenes: ${unreachable.join(", ")}`);

  if (pathDepths.length === 0 && errors.length === 0) {
    errors.push("no path from the start scene reaches a finale");
  }
  if (pathDepths.length) {
    const min = Math.min(...pathDepths);
    const max = Math.max(...pathDepths);
    if (max - min > 2) {
      warnings.push(`branch lengths are uneven (${min}-${max} scenes); one path is much longer than another`);
    }
    if (min < 4) warnings.push(`shortest path is only ${min} scenes; aim for 5-8`);
  }

  return { ok: errors.length === 0, errors, warnings, pathDepths, unreachable };
}

/**
 * The denominator for the progress bar.
 *
 * Deliberately the SHORTEST path, not the longest: the bar must always feel
 * like it is moving forward regardless of which way they went, and a bar
 * measured against the longest branch crawls on the short one. Overshoot is
 * clamped, so a long path simply pins at full rather than looking broken.
 */
export function progressDenominator(report: GraphReport): number {
  return report.pathDepths.length ? Math.min(...report.pathDepths) : 6;
}

export const sceneProgress = (visitedCount: number, denom: number): number =>
  Math.min(1, denom > 0 ? visitedCount / denom : 0);

/** One entry per choice actually taken. This list IS the share card. */
export interface PathEntry {
  sceneId: string;
  label: string;
  /** True when the timer ran out and the default fired. */
  auto: boolean;
}

// ─── Component contract ──────────────────────────────────────────────────────

export interface LoveflixTemplateProps {
  data: LoveflixData;
  mode: "demo" | "live";
  shareId?: string;
  hasPassword?: boolean;
}

// ─── Brand safety ────────────────────────────────────────────────────────────

/**
 * Run at mount in development. Cheap insurance against the one mistake in this
 * template that would be genuinely expensive: shipping someone else's trade
 * dress on a monetised product under our own domain.
 */
export function assertBrandSafe(data: LoveflixData): string[] {
  const banned = [/netflix/i, /#e50914/i, /\be5\s*09\s*14\b/i];
  const haystack = JSON.stringify(data);
  const hits: string[] = [];
  for (const re of banned) {
    if (re.test(haystack)) hits.push(`content matches ${re}`);
  }
  if (ACCENT.toLowerCase() === "#e50914") hits.push("accent colour is the wrong red");
  return hits;
}

// ─── Demo data ───────────────────────────────────────────────────────────────
//
// Six scenes, three branches, one finale. Every path is 5 scenes long; every
// terminal is the finale. This demo doubles as the validator's fixture — if it
// ever stops passing, the validator has changed behaviour.

const SC = (
  id: string,
  text: string,
  choices: [string, string][],
  extra: Partial<Scene> = {},
): Scene => ({
  id,
  imageUrl: "",
  text,
  choices: choices.map(([label, nextSceneId]) => ({ label, nextSceneId })),
  choiceSeconds: PLAYER.defaultChoiceSeconds,
  defaultChoiceIndex: 0,
  isFinale: false,
  ...extra,
});

export const DEMO_DATA: LoveflixData = {
  senderName: "Rohan",
  senderPhotoUrl: "",
  recipientName: "Aditi",
  recipientPhotoUrl: "",
  showTitle: "US",
  tagline:
    "Two people who were extremely bad at admitting anything. Three seasons. One unresolved argument about a film.",
  heroImageUrl: "",
  matchPercent: 99,
  rating: "Rated A — for Aditi only",
  seasons: "3 Seasons",
  metYear: "2023",
  rows: [
    {
      title: "Continue Watching Us",
      kind: "cards",
      items: [
        { title: "The Airport", imageUrl: "", caption: "You ran. I have never recovered.", runtime: "8 min", progress: 72 },
        { title: "The Power Cut", imageUrl: "", caption: "Four hours, no phones, one very long conversation.", runtime: "14 min", progress: 40 },
        { title: "2 AM Maggi", imageUrl: "", caption: "Half-cooked. On the floor. Perfect.", runtime: "6 min", progress: 95 },
        { title: "The Argument About The Film", imageUrl: "", caption: "Ongoing. Season 3.", runtime: "41 min", progress: 12 },
      ],
    },
    {
      title: "Top 10 Reasons I Like You In This Country Today",
      kind: "top10",
      items: [
        { title: "The left earbud", imageUrl: "", caption: "You always hand me the left one. Every time. Without looking.", runtime: "", progress: 0 },
        { title: "Page forty", imageUrl: "", caption: "Every book you start. Bookmarked at forty. Everywhere.", runtime: "", progress: 0 },
        { title: "The dog", imageUrl: "", caption: "One biscuit in 2023 and now he's technically ours.", runtime: "", progress: 0 },
        { title: "Terrible harmony", imageUrl: "", caption: "I can't hear that song without hearing you over it.", runtime: "", progress: 0 },
        { title: "The ring, wrong finger", imageUrl: "", caption: "So nobody asks. I noticed on day one.", runtime: "", progress: 0 },
        { title: "Abandoned chai", imageUrl: "", caption: "On every surface in the house.", runtime: "", progress: 0 },
        { title: "The blurry photo", imageUrl: "", caption: "Our only one from that year, and you won't delete it.", runtime: "", progress: 0 },
        { title: "Half a second early", imageUrl: "", caption: "You laugh before the punchline. Every time.", runtime: "", progress: 0 },
        { title: "The umbrella thing", imageUrl: "", caption: "Refused it on principle. Complained for an hour.", runtime: "", progress: 0 },
        { title: "The grey hoodie", imageUrl: "", caption: "I've stopped asking. Consider it a transfer of ownership.", runtime: "", progress: 0 },
      ],
    },
    {
      title: "Trending In My World",
      kind: "cards",
      items: [
        { title: "Your Voice Note At 1 AM", imageUrl: "", caption: "Eleven minutes. No summary.", runtime: "11 min", progress: 0 },
        { title: "The Monsoon Episode", imageUrl: "", caption: "Soaked, furious, laughing.", runtime: "22 min", progress: 0 },
        { title: "Cubbon Park, Golden Hour", imageUrl: "", caption: "The one I keep rewatching.", runtime: "9 min", progress: 0 },
      ],
    },
    {
      title: "Because You Watched: Us",
      kind: "cards",
      items: [
        { title: "Us: The Sequel", imageUrl: "", caption: "In development. Indefinitely.", runtime: "∞", progress: 0 },
        { title: "Us: Behind The Scenes", imageUrl: "", caption: "Mostly you fixing my collar.", runtime: "3 min", progress: 0 },
      ],
    },
  ],
  scenes: [
    SC(
      "s1",
      "It's raining, which is not unusual.\nWhat's unusual is that you're standing outside a café you don't like, checking your phone every forty seconds.\nI'm eleven minutes late. You know exactly how late I am.",
      [["wait outside anyway", "s2a"], ["go in and take the corner table", "s2b"]],
    ),
    SC(
      "s2a",
      "You stay under the awning.\nWhen I finally turn the corner you don't say anything about the eleven minutes, which is somehow worse.\nYou just hand me the umbrella. Yours. You're already wet.",
      [["say sorry properly", "s3a"], ["make a joke about it", "s3b"]],
    ),
    SC(
      "s2b",
      "You take the corner table, order for both of us, and get mine wrong on purpose.\nI arrive to a cup of something I have complained about by name.\nYou don't look up from your book.",
      [["drink it without comment", "s3a"], ["complain, loudly, for the record", "s3b"]],
    ),
    SC(
      "s3a",
      "Something goes quiet between us, in the good way.\nThe rain does that thing where it stops mattering.\nYou say: \"you're always late and I always wait, we should probably talk about that.\"",
      [["talk about it", "s4"], ["order more coffee first", "s4"]],
    ),
    SC(
      "s3b",
      "You laugh about half a second before the punchline, the way you always do.\nI've never worked out how you do that.\nThen you go quiet and say: \"can I say something serious for once.\"",
      [["let them", "s4"], ["say something serious first", "s4"]],
    ),
    SC(
      "s4",
      "And here's the part I've been trying to get to for three seasons.",
      [["go on", "finale"], ["I already know", "finale"]],
    ),
    SC("finale", "", [], { isFinale: true }),
  ],
  startSceneId: "s1",
  finaleText:
    "Whatever you picked, we ended up here.\n\nThat's not a bug in the writing. That's the whole point.\n\nEvery version of this where I'm eleven minutes late and you wait anyway — I'd take all of them.",
  finaleQuestion: "still here?",
  credits: [
    { role: "Directed by", name: "Rohan" },
    { role: "Starring", name: "Aditi" },
    { role: "Cinematography", name: "her front camera" },
    { role: "Soundtrack", name: "whatever was playing" },
    { role: "Catering", name: "2 AM maggi" },
    { role: "Based on", name: "a true story" },
  ],
};

// ─── Wire format ─────────────────────────────────────────────────────────────

export const LOVEFLIX_CONTENT_KEYS: (keyof LoveflixData)[] = [
  "senderName", "senderPhotoUrl", "recipientName", "recipientPhotoUrl",
  "showTitle", "tagline", "heroImageUrl", "matchPercent", "rating", "seasons",
  "metYear", "rows", "scenes", "startSceneId", "finaleText", "finaleQuestion",
  "credits",
];

export function loveflixDataToBody(data: LoveflixData, password?: string): Record<string, unknown> {
  return bodyFromKeys(data, LOVEFLIX_CONTENT_KEYS, password);
}

export function dbToLoveflixData(db: Raw | null | undefined): LoveflixData {
  const src = db ?? {};

  const rows = list<Row>(
    src.rows,
    (o) => {
      const title = str(o.title, "");
      if (!title) return null;
      return {
        title,
        kind: o.kind === "top10" ? "top10" : "cards",
        items: list<RowItem>(
          o.items,
          (it) => {
            const t = str(it.title, "");
            if (!t) return null;
            return {
              title: t,
              imageUrl: strOr(it.imageUrl, ""),
              caption: strOr(it.caption, ""),
              runtime: strOr(it.runtime, ""),
              progress: clampNum(it.progress, 0, 0, 100),
            };
          },
          [],
        ).slice(0, 12),
      };
    },
    DEMO_DATA.rows,
  ).slice(0, 6);

  const scenes = list<Scene>(
    src.scenes,
    (o) => {
      const id = str(o.id, "");
      if (!id) return null;
      const isFinale = o.isFinale === true;
      const choices = list<Choice>(
        o.choices,
        (c) => {
          const label = str(c.label, "");
          const nextSceneId = str(c.nextSceneId, "");
          if (!label || !nextSceneId) return null;
          return { label, nextSceneId };
        },
        [],
      ).slice(0, 2);
      return {
        id,
        imageUrl: strOr(o.imageUrl, ""),
        text: strOr(o.text, ""),
        choices: isFinale ? [] : choices,
        choiceSeconds: clampNum(o.choiceSeconds, PLAYER.defaultChoiceSeconds, 4, 60),
        defaultChoiceIndex: clampNum(o.defaultChoiceIndex, 0, 0, 1),
        isFinale,
      };
    },
    DEMO_DATA.scenes,
  ).slice(0, 24);

  return {
    senderName: str(src.senderName, DEMO_DATA.senderName),
    senderPhotoUrl: strOr(src.senderPhotoUrl, ""),
    recipientName: str(src.recipientName, DEMO_DATA.recipientName),
    recipientPhotoUrl: strOr(src.recipientPhotoUrl, ""),
    showTitle: str(src.showTitle, DEMO_DATA.showTitle),
    tagline: str(src.tagline, DEMO_DATA.tagline),
    heroImageUrl: strOr(src.heroImageUrl, ""),
    matchPercent: clampNum(src.matchPercent, 99, 1, 100),
    rating: str(src.rating, DEMO_DATA.rating),
    seasons: str(src.seasons, DEMO_DATA.seasons),
    metYear: strOr(src.metYear, DEMO_DATA.metYear),
    rows,
    scenes,
    startSceneId: str(src.startSceneId, scenes[0]?.id ?? DEMO_DATA.startSceneId),
    finaleText: str(src.finaleText, DEMO_DATA.finaleText),
    finaleQuestion: strOr(src.finaleQuestion, ""),
    credits: list<Credit>(
      src.credits,
      (o) => {
        const role = str(o.role, "");
        if (!role) return null;
        return { role, name: strOr(o.name, "") };
      },
      DEMO_DATA.credits,
    ).slice(0, 12),
  };
}
