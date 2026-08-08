// ─── Contributions — client-side wire types and surface tokens ───────────────
//
// A "contribution" is anything a THIRD PARTY adds to a page somebody else made:
// a review on the product page, a comment under the video, a note left on the
// call log. One sender builds the page, hands the link around, and other people
// write into it. The sender then approves or rejects what came in.
//
// Everything in this file is deliberately template-agnostic. A contribution has
// a person's name, some words, an optional rating and a moderation status —
// that is the whole vocabulary, and it is enough for all four templates. If a
// template needs a field that only it understands, it renders it from its own
// data; it does not widen this type.
//
// ── TWO HALVES ───────────────────────────────────────────────────────────────
//
// The top half mirrors the wire (what the API sends and accepts). It changes
// only when the server changes. The bottom half is the small palette the three
// shared components share, kept here rather than in one of the components
// because a component importing a sibling for its colours is how import cycles
// start.

/* ── Wire ──────────────────────────────────────────────────────────────────── */

/**
 * What kind of thing was left behind.
 *
 * The kind is part of the URL, so one page can collect two independent streams
 * (a rating and a plain note) without them mixing. Templates pick the kind that
 * matches the surface they are imitating; nothing here knows which is which.
 */
export const CONTRIBUTION_KINDS = [
  "review",
  "comment",
  "message",
  "note",
  /**
   * One tap, one name, no body. The only kind whose `body` is routinely empty —
   * the skill ids it applies to live in the template's own data, not here,
   * because widening this type to hold them is exactly the drift the header
   * warns about.
   */
  "endorsement",
  /** A written reference. Carries `title` (the author's headline) and a long `body`. */
  "recommendation",
] as const;
export type ContributionKind = (typeof CONTRIBUTION_KINDS)[number];

/**
 * `"pending"` is the default the server assigns. NOTHING IS PUBLIC UNTIL THE
 * SENDER SAYS SO — the page belongs to them and their name is on it, so an
 * un-moderated stranger's words must never appear on it. `"rejected"` is kept
 * rather than deleted so the queue can show what was dealt with, and so a
 * double-tap on Reject is idempotent instead of resurrecting the row.
 */
export const CONTRIBUTION_STATUSES = ["pending", "approved", "rejected"] as const;
export type ContributionStatus = (typeof CONTRIBUTION_STATUSES)[number];

/** The only ratings that exist. Half-stars are a display concern, never an input. */
export const STAR_VALUES = [1, 2, 3, 4, 5] as const;
export type StarValue = (typeof STAR_VALUES)[number];

/**
 * Field caps, enforced on both sides.
 *
 * The client clamps so the contributor sees the limit while typing instead of
 * losing a paragraph to a 400; the server clamps because a client-side cap is
 * a suggestion. Both read the same numbers from here.
 */
export const CONTRIB_LIMITS = {
  author: 40,
  title: 80,
  body: 600,
} as const;

export interface Contribution {
  id: string;
  kind: ContributionKind;
  /** The name the contributor typed. Never an account name — most have no account. */
  author: string;
  /** Optional headline, for the kinds that have one. */
  title?: string;
  body: string;
  /** Absent for kinds that do not rate. Always a whole star — see `StarValue`. */
  rating?: StarValue;
  /** Whatever the contributor's surface gave us. Often absent; render initials. */
  avatarUrl?: string;
  status: ContributionStatus;
  /**
   * The profanity pre-filter tripped on this one.
   *
   * IT IS A MARKER, NOT A VERDICT. A flagged item still arrives in the queue as
   * `"pending"` like everything else and the sender decides. The filter's job
   * is to make sure the one item that needs a second look is not the one they
   * skim past — false positives are cheap here, a slur shown to the recipient
   * is not.
   */
  flagged: boolean;
  /** Short reason for the flag, for the queue's tooltip. Never shown publicly. */
  flagReason?: string;
  /** ISO 8601. Formatted at render time, never on the server. */
  createdAt: string;
}

/**
 * The aggregate, computed server-side over APPROVED items only.
 *
 * Sent alongside the list rather than derived on the client because the public
 * list is paginated: an average computed from the twenty items in hand would
 * drift from the one the page claims the moment there are twenty-one.
 */
export interface ContributionSummary {
  /** How many approved contributions exist in total. */
  count: number;
  /**
   * Mean rating across the ones that carry a rating, unrounded.
   *
   * UNROUNDED IS THE POINT. `StarRating` fills to the exact fraction, and a
   * 4.7 that arrives here as 5 is the difference between a page that reads as
   * real and a page that reads as a mock-up.
   */
  average: number;
  /** How many rated it 1★, 2★ … in index order. Length 5. Empty when nobody rated. */
  distribution: readonly number[];
}

export interface ContributionFeed {
  items: Contribution[];
  summary: ContributionSummary;
}

/** What a contributor form hands to `submit`. The server assigns everything else. */
export interface ContributionDraft {
  author: string;
  body: string;
  title?: string;
  rating?: StarValue;
  avatarUrl?: string;
}

/* ── Surface tokens ────────────────────────────────────────────────────────── */

/**
 * The palette the three shared components render with.
 *
 * Neutral on purpose. These components are dropped into four templates with
 * four different skins, so the defaults are a plain paper-and-ink scheme that
 * looks deliberate anywhere, and every template overrides the two or three
 * values that matter to it (`accent`, usually `paper`) through the `theme`
 * prop. No template's brand colours live in this file.
 */
export interface ContribTheme {
  paper: string;
  paperDeep: string;
  edge: string;
  ink: string;
  inkSoft: string;
  inkFaint: string;
  accent: string;
  accentInk: string;
  danger: string;
  ok: string;
  /** The profanity marker's colour. Warning, not alarm — it is a suggestion. */
  warn: string;
  font: string;
  serif: string;
}

export const DEFAULT_CONTRIB_THEME: ContribTheme = {
  paper: "#ffffff",
  paperDeep: "#f5f4f1",
  edge: "#e3e0d9",
  ink: "#1f1c17",
  inkSoft: "#5f594f",
  inkFaint: "#9a9385",
  accent: "#2b2620",
  accentInk: "#ffffff",
  danger: "#a4432c",
  ok: "#2f7a4f",
  warn: "#b07213",
  font: "var(--font-outfit), system-ui, sans-serif",
  serif: "var(--font-tinos), Georgia, 'Times New Roman', serif",
};

/** Every tap target in this feature. Phones only, effectively. */
export const CONTRIB_TAP = 44;

/** Merge a caller's partial override onto the defaults. */
export function resolveTheme(theme?: Partial<ContribTheme>): ContribTheme {
  return theme ? { ...DEFAULT_CONTRIB_THEME, ...theme } : DEFAULT_CONTRIB_THEME;
}

/**
 * Initials for someone with no avatar.
 *
 * Two letters at most, because three is a monogram and reads as a logo. Falls
 * back to a dot rather than an empty circle — an empty circle looks broken.
 */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "·";
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase() || "·";
}
