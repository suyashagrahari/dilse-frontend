// ─── Proposal — data contract ────────────────────────────────────────────────
// The single source of truth for the template's shape. The editor hook, the
// visual template, the EditSheet and the recipient viewer all import from here,
// so this file is frozen once the others are being built against it.

// A value import, unlike assets.ts's type-only import back to this file — so
// the edge exists in one direction at runtime and there is no cycle.
import { MEMORY_PHOTOS } from "./assets";
import type { MusicChoice } from "./music";
import { DEFAULT_MUSIC_URL, isTrackId } from "./music";
import type { Perspective } from "./copy";
import { copyFor, isPerspective } from "./copy";

export type EditMode = null | "manual" | "preview";

export interface Toast {
  id: number;
  type: "success" | "info" | "publish";
  title: string;
  message?: string;
}

/** Which bundled animation headlines the proposal moment. */
export type HeroArt = "ring" | "rose" | "bouquet";

export interface Memory {
  /**
   * Either a bundled asset path (`/assets/proposal/…`) or a base64 data URL the
   * sender uploaded in the EditSheet. Both render through a plain <img>.
   */
  imageUrl: string;
  /** The line written under the polaroid. Kept short — it sits on one or two lines. */
  caption: string;
}

export interface ProposalData {
  /** Who is asking. Signs the secret note. */
  senderName: string;
  /** Who is being asked. Drives every second-person line in the template. */
  recipientName: string;

  /** Section 1 — the audio gate. */
  gateTitle: string;
  gateButtonLabel: string;

  /** Section 2 — the scrapbook. */
  memoryLaneTitle: string;
  memories: Memory[];

  /** Section 3 — the ask. */
  askHeadline: string;
  heroArt: HeroArt;
  yesLabel: string;

  /** Section 4 — the payoff. */
  celebrationTitle: string;
  secretNote: string;

  /**
   * ISO `YYYY-MM-DD` of the day they met. Empty string hides the day counter.
   * Stored as a string rather than a Date so it round-trips through JSON
   * untouched and never shifts across timezones.
   */
  metDate: string;

  /**
   * Optional URL of a track to loop behind the page — a YouTube link, or a
   * direct link to an audio file. Empty string means the built-in melody named
   * by `musicTrack` plays, so a proposal always has music without the sender
   * having to host or licence anything.
   */
  musicUrl: string;

  /**
   * Which built-in melody plays when `musicUrl` is empty: one of the three ids
   * in ./music, or "auto" for a different one on every visit. "auto" is the
   * default, and is why the gallery preview does not sound the same twice.
   */
  musicTrack: MusicChoice;

  /**
   * Which of the two asks this page is making. Drives every default string in
   * the template — see ./copy.
   */
  perspective: Perspective;
}

/** Every field persisted to the server. Anything absent here is view-only state. */
export const PROPOSAL_CONTENT_KEYS: (keyof ProposalData)[] = [
  "senderName",
  "recipientName",
  "gateTitle",
  "gateButtonLabel",
  "memoryLaneTitle",
  "memories",
  "askHeadline",
  "heroArt",
  "yesLabel",
  "celebrationTitle",
  "secretNote",
  "metDate",
  "musicUrl",
  "musicTrack",
  "perspective",
];

export const MAX_MEMORIES = 6;
export const MIN_MEMORIES = 1;

/** How far the "No" button can be pushed before it gives up and admits defeat. */
export const MAX_DODGES = 12;

/**
 * The escalation ladder for the "No" button. Each dodge advances one rung: the
 * label gets needier and a different sad animation appears. This is the part
 * people screenshot, so the copy matters more than the code.
 *
 * `art` keys map into `REACTIONS` in ./assets.
 */
/** Keys of the sad-reaction art in ./assets. Declared here to keep types.ts import-free. */
export type ReactionKey = "sadCry" | "sadBear" | "sadBaby" | "sadWhy";

export const DODGE_RUNGS: { label: string; art: ReactionKey | null; nudge: string }[] = [
  { label: "No", art: null, nudge: "" },
  { label: "Are you sure?", art: "sadCry", nudge: "wait— hold on 🥺" },
  { label: "Really sure?", art: "sadBear", nudge: "that button is very slippery" },
  { label: "Think again 🥺", art: "sadBaby", nudge: "you're really trying, huh" },
  { label: "Please? 🥹", art: "sadWhy", nudge: "okay this is getting personal" },
  { label: "I'll cry 💔", art: "sadCry", nudge: "tears are being manufactured" },
  { label: "You're breaking me", art: "sadBear", nudge: "the bear is disappointed" },
  { label: "Last chance 🥲", art: "sadBaby", nudge: "one of us has to give up" },
  { label: "Not happening", art: "sadWhy", nudge: "spoiler: it won't be me" },
];

export function dodgeRung(dodges: number) {
  return DODGE_RUNGS[Math.min(dodges, DODGE_RUNGS.length - 1)];
}

/**
 * How much the YES button has grown, as a scale factor. Every refusal feeds it.
 * Capped so it never overflows a phone screen.
 */
export function yesScale(dodges: number): number {
  return Math.min(1 + dodges * 0.07, 1.7);
}

/** Days since they met, or null when no date was set (or it's in the future). */
export function daysSince(metDate: string): number | null {
  if (!metDate) return null;
  const then = new Date(`${metDate}T00:00:00`);
  if (Number.isNaN(then.getTime())) return null;
  const days = Math.floor((Date.now() - then.getTime()) / 86_400_000);
  return days > 0 ? days : null;
}

const MARRIAGE_COPY = copyFor("marriage");

export const DEMO_DATA: ProposalData = {
  senderName: "Aarav",
  recipientName: "Ananya",
  gateTitle: MARRIAGE_COPY.gateTitle,
  gateButtonLabel: MARRIAGE_COPY.gateButtonLabel,
  memoryLaneTitle: MARRIAGE_COPY.memoryLaneTitle,
  memories: [
    { imageUrl: MEMORY_PHOTOS[0], caption: "the day you said hi first ☕" },
    { imageUrl: MEMORY_PHOTOS[1], caption: "our first fight, over pizza toppings 🍕" },
    { imageUrl: MEMORY_PHOTOS[2], caption: "when you cried at that movie (twice)" },
    { imageUrl: MEMORY_PHOTOS[3], caption: "every single day after that 💕" },
  ],
  askHeadline: MARRIAGE_COPY.askHeadline,
  heroArt: "ring",
  yesLabel: MARRIAGE_COPY.yesLabel,
  celebrationTitle: MARRIAGE_COPY.celebrationTitle,
  secretNote: MARRIAGE_COPY.secretNote,
  metDate: "",
  // A real song from the first tap. The synthesised melodies are still in the
  // picker, but a preview that opens on a pad nobody chose sounds like the
  // feature is missing rather than like a default.
  musicUrl: DEFAULT_MUSIC_URL,
  musicTrack: "auto",
  perspective: "marriage",
};

export function proposalDataToBody(data: ProposalData, password?: string): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  for (const k of PROPOSAL_CONTENT_KEYS) body[k] = data[k];
  if (password !== undefined) body.password = password;
  return body;
}

function normalizeMemory(raw: unknown, fallback: Memory): Memory {
  const m = (raw ?? {}) as Partial<Memory>;
  return {
    imageUrl: typeof m.imageUrl === "string" && m.imageUrl.trim() ? m.imageUrl : fallback.imageUrl,
    caption: typeof m.caption === "string" ? m.caption.slice(0, 140) : fallback.caption,
  };
}

const HERO_ART: HeroArt[] = ["ring", "rose", "bouquet"];

export function dbToProposalData(db: Record<string, unknown> | null | undefined): ProposalData {
  const src = db ?? {};
  const pick = <K extends keyof ProposalData>(k: K): ProposalData[K] =>
    (src[k as string] as ProposalData[K]) ?? DEMO_DATA[k];

  const rawMemories = Array.isArray(src.memories) ? (src.memories as unknown[]) : [];
  const memories = rawMemories.length
    ? rawMemories
        .slice(0, MAX_MEMORIES)
        .map((m, i) => normalizeMemory(m, DEMO_DATA.memories[i] ?? DEMO_DATA.memories[0]))
        // A polaroid with no picture would render an empty white card — drop it.
        .filter((m) => m.imageUrl.trim().length > 0)
    : DEMO_DATA.memories;

  const heroArt = pick("heroArt");

  return {
    senderName: pick("senderName"),
    recipientName: pick("recipientName"),
    gateTitle: pick("gateTitle"),
    gateButtonLabel: pick("gateButtonLabel"),
    memoryLaneTitle: pick("memoryLaneTitle"),
    memories: memories.length ? memories : DEMO_DATA.memories,
    askHeadline: pick("askHeadline"),
    heroArt: HERO_ART.includes(heroArt) ? heroArt : "ring",
    yesLabel: pick("yesLabel"),
    celebrationTitle: pick("celebrationTitle"),
    secretNote: pick("secretNote"),
    metDate: pick("metDate"),
    musicUrl: pick("musicUrl"),
    // Anything unrecognised becomes "auto" rather than silencing the page.
    musicTrack: typeof src.musicTrack === "string" && isTrackId(src.musicTrack)
      ? (src.musicTrack as MusicChoice)
      : "auto",
    perspective: isPerspective(src.perspective) ? src.perspective : "marriage",
  };
}
