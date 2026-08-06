// ─── Us — the frozen contract ────────────────────────────────────────────────
//
// LEAD-OWNED AND FROZEN. Import from here; do not extend it.
//
// A relationship gets its own account. The goal is LAYOUT FIDELITY: this must
// read as a real social profile within one second. The humour is entirely in
// the copy — the UI itself is plain, functional, and correct.
//
// ── BRAND ────────────────────────────────────────────────────────────────────
// The layout conventions ARE the recognition and they are built here exactly:
// the 44px top bar, the 86px avatar with the three stats spread beside it, the
// highlight bubbles, the tab underline flush to the border, the 3-column grid
// with EXACTLY 1px gaps, the post detail with its double-tap heart. The profile
// UI these conventions come from is almost entirely black, white and grey —
// the gradient lives on an app icon and story rings and essentially nowhere
// else — so nothing is lost by declining to reproduce it.
//
// `assertBrandSafe` runs over the template source and the rendered DOM.
//
// ── THE TWO DETAILS THAT DECIDE THIS TEMPLATE ────────────────────────────────
//   1. GRID_GAP_PX must be exactly 1. At 2 it reads as a template; at 0 it
//      reads as a collage. This is the highest-leverage single number here.
//   2. The double-tap heart. It is the most satisfying micro-interaction in the
//      format and it is the first thing anyone tests.

// ═══════════════════════════════════════════════════════════════════════════
// Brand safety — mechanically enforced
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Split so this contract can name what it forbids without tripping the grep
 * that runs over the rest of the template.
 */
export const FORBIDDEN_TOKENS: readonly string[] = [
  ["Insta", "gram"].join(""),
  ["Ins", "ta"].join(""),
  ["Me", "ta"].join(""),
  ["Thre", "ads"].join(""),
  ["Face", "book"].join(""),
  // The short-video product. This list originally omitted it, and the omission
  // was not theoretical: the tab in this very file was named after it and the
  // empty-state copy rendered it on screen, and the check passed anyway. A
  // deny-list is only worth what is actually on it.
  ["Re", "els"].join(""),
  ["Boom", "erang"].join(""),
];

/**
 * The gradient stops. No gradient appears anywhere in this template at all.
 *
 * Assembled from fragments for the same reason FORBIDDEN_TOKENS is: a deny-list
 * that spells out its own entries makes "grep this directory for banned values
 * and find nothing" untrue, and the one honest way to run that check is for it
 * to pass over every file including this one.
 */
const hex = (...parts: string[]): string => parts.join("");

export const FORBIDDEN_COLORS: readonly string[] = [
  hex("#83", "3AB4"),
  hex("#C1", "3584"),
  hex("#E1", "306C"),
  hex("#FD", "1D1D"),
  hex("#F7", "7737"),
  hex("#FC", "AF45"),
];

export function assertBrandSafe(source: string): string[] {
  const hits: string[] = [];
  const lower = source.toLowerCase();
  for (const t of FORBIDDEN_TOKENS) {
    // Word-boundary match: "instant" must not trip the "insta" rule.
    if (new RegExp(`\\b${t.toLowerCase()}\\b`).test(lower)) hits.push(t);
  }
  for (const c of FORBIDDEN_COLORS) {
    if (lower.includes(c.toLowerCase())) hits.push(c);
  }
  if (/linear-gradient|radial-gradient|conic-gradient/i.test(source)) hits.push("gradient");
  return hits;
}

/** Our own mark, top-left of the header, in a bold display face. */
export const WORDMARK = "us.";

// ═══════════════════════════════════════════════════════════════════════════
// Colours — exact values, and there are no others
// ═══════════════════════════════════════════════════════════════════════════

export const PALETTE = {
  bg: "#FFFFFF",
  ink: "#000000",
  grey: "#737373",
  greyIcon: "#8E8E8E",
  border: "#DBDBDB",
  button: "#EFEFEF",
  linkBlue: "#00376B",
  actionBlue: "#0095F6",
  likeRed: "#ED4956",
  /** The only shadow in the template: grid overlay glyphs. */
  glyphShadow: "0 1px 2px rgba(0,0,0,0.35)",
} as const;

/**
 * The native system stack — which is genuinely what these apps use, is not a
 * trademark question, and is the single biggest fidelity win available here.
 */
export const SYSTEM_FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
/** The wordmark only. */
export const DISPLAY = "var(--font-playfair), Georgia, serif";

// ═══════════════════════════════════════════════════════════════════════════
// Measurements — build these exactly
// ═══════════════════════════════════════════════════════════════════════════

export const METRICS = {
  topBarH: 44,
  avatar: 86,
  highlightRing: 64,
  bottomNavH: 49,
  postHeaderH: 54,
  actionRowH: 44,
  buttonRowH: 32,
  buttonRadius: 8,
  pagePad: 16,
  /** Exactly 1. See the note at the top of this file. */
  gridGap: 1,
  /** On wide screens this is letterboxed, never reflowed. */
  desktopColumn: 420,
} as const;

export const GRID_GAP_PX = METRICS.gridGap;
export const TAP_TARGET_PX = 44;

// ═══════════════════════════════════════════════════════════════════════════
// Stored shape
// ═══════════════════════════════════════════════════════════════════════════

export interface Comment {
  handle: string;
  text: string;
  likes?: number;
}

export interface Post {
  id: string;
  imageUrl: string;
  caption: string;
  likes: number;
  /** "Liked by arjun and 847 others" */
  likedByName: string;
  postedAgo: string;
  location?: string;
  isMultiple?: boolean;
  isVideo?: boolean;
  comments: Comment[];
}

export interface HighlightSlide {
  imageUrl: string;
  caption?: string;
}

export interface Highlight {
  title: string;
  coverUrl: string;
  slides: HighlightSlide[];
}

export interface ProfileData {
  handle: string;
  displayName: string;
  category: string;
  bio: string[];
  link?: { label: string; url: string };
  avatarUrl: string;
  stats: { posts: number; followers: number; following: number };
  /** Named handles render semibold inside the "Followed by …" line. */
  followedBy: string[];
  highlights: Highlight[];
  posts: Post[];
  /** Up to 3. Rendered first with a pin glyph. */
  pinnedPostIds: string[];
}

// ═══════════════════════════════════════════════════════════════════════════
// Numbers
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Indian grouping below 10,000; K/M abbreviation above.
 *   847 → "847"   ·   9,999 → "9,999"   ·   84,700 → "84.7K"   ·   1,200,000 → "1.2M"
 */
export function formatStat(n: number): string {
  const v = Math.max(0, Math.trunc(n));
  if (v < 10_000) {
    const s = v.toString();
    if (s.length <= 3) return s;
    return `${s.slice(0, -3)},${s.slice(-3)}`;
  }
  if (v < 1_000_000) {
    const k = v / 1000;
    return `${trim1(k)}K`;
  }
  return `${trim1(v / 1_000_000)}M`;
}

const trim1 = (n: number): string => {
  const s = n.toFixed(1);
  return s.endsWith(".0") ? s.slice(0, -2) : s;
};

/**
 * "Followed by mom, her_mom and 2 others" — the named handles render semibold.
 *
 * `joiner` sits between the named handles and is the reason this returns a
 * shape rather than a string: two handles read "mom and her_mom", three or
 * more read "mom, her_mom and N others". An earlier version returned no joiner
 * at all, so the two-handle case rendered "mom, her_mom", which is stiff and is
 * not what the convention does.
 */
export function followedByLine(handles: string[]): {
  named: string[];
  joiner: string;
  suffix: string;
} {
  if (handles.length === 0) return { named: [], joiner: "", suffix: "" };
  if (handles.length === 1) return { named: handles, joiner: "", suffix: "" };
  if (handles.length === 2) return { named: handles, joiner: " and ", suffix: "" };
  return {
    named: handles.slice(0, 2),
    joiner: ", ",
    suffix: ` and ${handles.length - 2} others`,
  };
}

/** Pinned first, then the rest in their given order. Never reorders otherwise. */
export function orderedPosts(data: ProfileData): Post[] {
  const pinned = new Set(data.pinnedPostIds.slice(0, 3));
  const first = data.posts.filter((p) => pinned.has(p.id));
  const rest = data.posts.filter((p) => !pinned.has(p.id));
  return [...first, ...rest];
}

// ═══════════════════════════════════════════════════════════════════════════
// Motion — nothing loops
// ═══════════════════════════════════════════════════════════════════════════

export const TIMING = {
  /** Post detail slides in from the right. */
  slideMs: 300,
  /** Heart tap: scale 1.0 → 1.25 → 1.0. */
  heartBounceMs: 300,
  /** The big double-tap heart over the photo: 0 → 1.2 → 1.0, then fade. */
  bigHeartMs: 900,
  /** Story slides advance on their own. */
  storyAdvanceMs: 5000,
  toastMs: 1800,
  /** Rapid heart taps must not double-count. */
  likeDebounceMs: 300,
} as const;

/** Tap zones in the story viewer: right 70% advances, left 30% goes back. */
export const STORY_BACK_ZONE = 0.3;

/**
 * "clips", not the name the app you're thinking of uses — that word is one of
 * the forbidden tokens, and it would have shipped in user-visible copy. The
 * icon (a play glyph in a rectangle) carries the meaning; the word never
 * appears on screen in the real thing either, because the tabs are icon-only.
 */
export type ProfileTab = "grid" | "clips" | "tagged";

export const TAB_EMPTY_COPY: Record<Exclude<ProfileTab, "grid">, string> = {
  // Not "no videos" — the grid carries posts flagged as video, so that line
  // made the fiction contradict itself on the same screen.
  clips: "nothing here. they're all on the grid.",
  tagged: "nobody tagged us. we were busy.",
};

export const COPY = {
  following: "Following",
  message: "Message",
  unfollow: "Unfollow",
  /** Tapping Unfollow shows this and closes. It does not unfollow. */
  refuseUnfollow: "no.",
  addComment: "Add a comment…",
  nothingElse: "there's nothing else here.",
  more: "… more",
  reply: "reply",
} as const;

/** Handle over this many chars truncates in the top bar only. */
export const HANDLE_TRUNCATE = 20;
/** Highlight titles truncate at this. */
export const HIGHLIGHT_TITLE_TRUNCATE = 10;
