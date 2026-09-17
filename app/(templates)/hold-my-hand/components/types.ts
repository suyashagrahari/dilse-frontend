import { templateMediaBase } from "@/lib/templateMedia";

/** Animation set for this template — served from S3, never bundled. */
const ASSET = templateMediaBase("hold-my-hand");
// ─── Hold My Hand — shared type contract ─────────────────────────────────────
// Single source of truth for the data shape shared by the editor, the published
// viewer and the server payload. Field names here === server model field names
// === wire-format keys (flat payload). Keep them in sync.

export type EditMode = null | "manual" | "preview";

export type HoldMode = "kind" | "evil";

/** One line that surfaces once `progressMs` reaches `atMs`. */
export interface HoldLine {
  atMs: number;
  text: string;
}

export interface Toast {
  id: number;
  type: "success" | "info" | "publish";
  title: string;
  message?: string;
}

/**
 * One card in the keepsake row shown after the letter — a photo of the two of
 * them with a line written under it.
 *
 * `imageUrl` is uncapped in the controller on purpose: an uploaded photo arrives
 * as a data URL and is swapped for its CDN URL on the way in.
 */
export interface Memory {
  imageUrl: string;
  note: string;
}

/** More than six turns a keepsake into a gallery, and the letter stops landing. */
export const MAX_MEMORIES = 6;
/** Long enough for a real memory, short enough to stay a caption. */
export const MEMORY_NOTE_MAX = 220;

export interface HoldData {
  /** Who is holding on. Drives every second-person line. */
  recipientName: string;
  /** The face that comes into focus. Data URL or same-origin path. "" → heart fallback. */
  photoUrl: string;
  /** How long they must hold, in ms. */
  durationMs: number;
  /** `evil` arms the betrayal 5s before the end. */
  mode: HoldMode;
  /** 2 = requires two simultaneous pointers for the whole duration. */
  hands: 1 | 2;
  /** Timed lines shown during a successful hold. */
  holdLines: HoldLine[];
  /** Shown on release, indexed by how many times they have let go. */
  releaseLines: string[];
  /** Low-opacity fragments behind the photo; one surfaces per 12s of progress. */
  ghostFragments: string[];
  /** The full letter, revealed only at 100%. */
  letter: string;
  /** Who is asking. Signs the letter. */
  senderName: string;
  /** Photo cards shown under the letter. Empty is fine — the section hides. */
  memories: Memory[];
}

// ─── Theme tokens ────────────────────────────────────────────────────────────
// SubhSandesh palette. Space Grotesk / Caveat are not loaded in this app's
// layout.tsx (see NEEDS-SHARED-EDIT.md), so the closest loaded faces stand in:
// Outfit for geometric display, Inter for body, Dancing Script for the
// handwritten letter. Swap the two vars below once the fonts land.
export const HMH = {
  indigo: "#6C5CE7",
  indigoStrong: "#5646C9",
  pink: "#F72585",
  lime: "#C6FF3D",
  amber: "#FFB020",
  ink: "#0E0E12",
  /** The hold screen is its own dark world — deliberately darker than --site-bg. */
  void: "#07050D",
  bg: "#FAFAF7",
  surface: "#FFFFFF",
  border: "#ECEAE3",
  muted: "#5B5B66",
  display: "var(--font-outfit), system-ui, sans-serif",
  body: "var(--font-inter), system-ui, sans-serif",
  script: "var(--font-script), cursive",
} as const;

/** The bait shown at `durationMs - 5000` in evil mode when the sender wrote none. */
export const BAIT_FALLBACK = "okay, you can let go now.";
/** How long before the end the betrayal is armed. */
export const BETRAYAL_LEAD_MS = 5000;
/** Letting go inside this window after the bait triggers the 5x punishment. */
export const BETRAYAL_GRACE_MS = 3000;
/** How long the 5x drain lasts once triggered. */
export const PUNISH_MS = 2000;
/** One ghost fragment surfaces per this much accumulated progress. */
export const GHOST_INTERVAL_MS = 12000;

export const DURATION_PRESETS: { label: string; ms: number }[] = [
  { label: "20s — warm-up", ms: 20000 },
  { label: "30s — merciful", ms: 30000 },
  { label: "60s — the real one", ms: 60000 },
  { label: "90s — unkind", ms: 90000 },
  { label: "2 min — feral", ms: 120000 },
];

export const DEMO_DATA: HoldData = {
  recipientName: "",
  photoUrl: `${ASSET}/demo-portrait.svg`,
  durationMs: 60000,
  mode: "kind",
  hands: 1,
  // ── Default copy is WARM ──────────────────────────────────────────────────
  //
  // These defaults ship on every page whose sender does not rewrite them, so
  // they set the tone of the template. They are affectionate and a little shy —
  // the feeling of holding somebody's hand, not of being tested. Anyone who
  // wants the colder, needier version can still write it; `evil` mode is there
  // for the mischief.
  holdLines: [
    { atMs: 3000, text: "hi. hold on a second — literally." },
    { atMs: 8000, text: "there you are 🤍" },
    { atMs: 14000, text: "your hand is warm through the glass." },
    { atMs: 20000, text: "this is my favourite minute of the day." },
    { atMs: 26000, text: "i'd stay here a while, if you would." },
    { atMs: 33000, text: "you make ordinary seconds feel like something." },
    { atMs: 38000, text: "halfway. still holding. still you." },
    { atMs: 44000, text: "i keep thinking about how lucky this is." },
    { atMs: 49000, text: "nearly there, my favourite person." },
    { atMs: 52000, text: "ten seconds of us. that's all i wanted." },
    { atMs: 55000, text: "don't let go yet — something's coming." },
    { atMs: 58000, text: "two more. two 🤍" },
  ],
  releaseLines: [
    "oh — come back? 🥺",
    "you let go. i felt that.",
    "i'll wait. i'm good at waiting.",
    "no rush. i'm not going anywhere.",
    "whenever you're ready, my hand's still out.",
    "we can start again. i don't mind.",
    "still here. still yours.",
    "one more time. from wherever you are 🤍",
  ],
  ghostFragments: [
    "there is a version of this",
    "that only exists while you stay",
    "i wrote the rest of it down",
    "you are almost holding it",
  ],
  letter:
    "you held on 🤍\n\ni didn't make this to test you. i made it because i wanted one minute where the world couldn't interrupt us — and this was the only way i could think of to ask for it.\n\na minute is nothing. you gave it to me anyway. that's the part i'll keep.\n\nthank you for not letting go.",
  senderName: "Aarav",
  memories: [],
};

/** Whitelisted keys that make up the flat wire payload (= server model content fields). */
export const HOLD_CONTENT_KEYS: (keyof HoldData)[] = [
  "recipientName",
  "photoUrl",
  "durationMs",
  "mode",
  "hands",
  "holdLines",
  "releaseLines",
  "ghostFragments",
  "letter",
  "senderName",
  "memories",
];

/** UI state → flat body sent to POST/PUT. `password` is optional (empty = no gate). */
export function holdMyHandDataToBody(data: HoldData, password?: string): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  for (const k of HOLD_CONTENT_KEYS) body[k] = data[k];
  if (password !== undefined) body.password = password;
  return body;
}

const clampDuration = (raw: unknown): number => {
  const n = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(n)) return DEMO_DATA.durationMs;
  return Math.min(300000, Math.max(10000, Math.round(n)));
};

/** DB/share response → UI state (fills any missing field from DEMO_DATA). */
export function dbToHoldMyHandData(db: Record<string, unknown> | null | undefined): HoldData {
  const src = db ?? {};
  const pickStr = (k: keyof HoldData): string =>
    typeof src[k as string] === "string" ? (src[k as string] as string) : (DEMO_DATA[k] as string);

  const holdLines = Array.isArray(src.holdLines)
    ? (src.holdLines as unknown[])
        .map((l) => {
          const o = (l ?? {}) as Record<string, unknown>;
          return { atMs: Number(o.atMs) || 0, text: typeof o.text === "string" ? o.text : "" };
        })
        .filter((l) => l.text.trim().length > 0)
        .sort((a, b) => a.atMs - b.atMs)
    : DEMO_DATA.holdLines;

  const strList = (v: unknown, fallback: string[]): string[] =>
    Array.isArray(v) ? (v as unknown[]).filter((s): s is string => typeof s === "string" && s.trim().length > 0) : fallback;

  return {
    recipientName: pickStr("recipientName"),
    // An empty photo is a legitimate choice (heart fallback), so `??` — not `||`.
    photoUrl: typeof src.photoUrl === "string" ? src.photoUrl : DEMO_DATA.photoUrl,
    durationMs: clampDuration(src.durationMs),
    mode: src.mode === "evil" ? "evil" : "kind",
    hands: Number(src.hands) === 2 ? 2 : 1,
    holdLines,
    releaseLines: strList(src.releaseLines, DEMO_DATA.releaseLines),
    ghostFragments: strList(src.ghostFragments, DEMO_DATA.ghostFragments),
    letter: pickStr("letter"),
    senderName: pickStr("senderName"),
    memories: Array.isArray(src.memories)
      ? (src.memories as unknown[])
          .map((m) => {
            const o = (m ?? {}) as Record<string, unknown>;
            return {
              imageUrl: typeof o.imageUrl === "string" ? o.imageUrl : "",
              note: typeof o.note === "string" ? o.note : "",
            };
          })
          // A card with no picture would render an empty frame — drop it. A
          // card with a picture and no note is fine: the photo is the point.
          .filter((m) => m.imageUrl.trim().length > 0)
          .slice(0, MAX_MEMORIES)
      : [],
  };
}

/**
 * The bait must exist for evil mode to make sense, but the sender can delete
 * every line. Synthesise one at `durationMs - 5000` when nothing is close to it,
 * so the betrayal always has copy attached to it.
 */
export function effectiveHoldLines(data: HoldData): HoldLine[] {
  const lines = [...data.holdLines].sort((a, b) => a.atMs - b.atMs);
  if (data.mode !== "evil") return lines;
  const baitAt = Math.max(0, data.durationMs - BETRAYAL_LEAD_MS);
  if (!lines.some((l) => Math.abs(l.atMs - baitAt) <= 2000)) {
    lines.push({ atMs: baitAt, text: BAIT_FALLBACK });
    lines.sort((a, b) => a.atMs - b.atMs);
  }
  return lines;
}

/** Live counter — always seconds with one decimal, so it never re-formats mid-hold. */
export const fmtSecs = (ms: number): string => (Math.max(0, ms) / 1000).toFixed(1);

/** Whole seconds, for labels like "of 60". */
export const fmtWhole = (ms: number): string => String(Math.round(Math.max(0, ms) / 1000));
