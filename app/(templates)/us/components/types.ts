// ─── Us — the contract ───────────────────────────────────────────────────────
//
// A relationship gets its own account. The layout is a straight-faced clone of
// a photo-sharing profile — phone app under 768px, the web app with its left
// rail above — and the romance lives in the copy, the photos and the little
// moments (the double-tap heart, the story reply, the DMs, the letter).
//
// ── BRAND ────────────────────────────────────────────────────────────────────
// We clone the layout grammar, never the brand: our own "us." wordmark, no
// product names anywhere (checked by `assertBrandSafe`), and the story ring is
// our own blush gradient — none of the real ring's six stops appear here.

// ═══════════════════════════════════════════════════════════════════════════
// Brand safety — mechanically enforced
// ═══════════════════════════════════════════════════════════════════════════

/** Split so this file can name what it forbids without tripping its own grep. */
export const FORBIDDEN_TOKENS: readonly string[] = [
  ["In", "stagram"].join(""),
  ["Ins", "ta"].join(""),
  ["Me", "ta"].join(""),
  ["Thre", "ads"].join(""),
  ["Face", "book"].join(""),
  ["Re", "els"].join(""),
  ["Boom", "erang"].join(""),
];

const hex = (...parts: string[]): string => parts.join("");

/** The real ring's stops. None of them may appear in this template. */
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
    if (new RegExp(`\\b${t.toLowerCase()}\\b`).test(lower)) hits.push(t);
  }
  for (const c of FORBIDDEN_COLORS) {
    if (lower.includes(c.toLowerCase())) hits.push(c);
  }
  return hits;
}

/** Our own mark. */
export const WORDMARK = "us.";

// ═══════════════════════════════════════════════════════════════════════════
// Look
// ═══════════════════════════════════════════════════════════════════════════

export const PALETTE = {
  bg: "#FFFFFF",
  ink: "#000000",
  ink2: "#262626",
  grey: "#737373",
  greyIcon: "#8E8E8E",
  border: "#DBDBDB",
  hair: "#EFEFEF",
  button: "#EFEFEF",
  buttonHover: "#DBDBDB",
  linkBlue: "#00376B",
  actionBlue: "#0095F6",
  likeRed: "#FF3040",
  /** Our romantic accents — the blush ring, the DM bubble, the letter. */
  rose: "#FF3D7F",
  blush: "#FF8FB1",
  peach: "#FFB38A",
  plum: "#B3246B",
  glyphShadow: "0 1px 2px rgba(0,0,0,0.35)",
} as const;

/** Our story ring. Blush → rose → plum → peach. Not the real one. */
export const RING = `conic-gradient(from 210deg, ${PALETTE.peach}, ${PALETTE.blush}, ${PALETTE.rose}, ${PALETTE.plum}, ${PALETTE.rose}, ${PALETTE.peach})`;
/** Our own-bubble in DMs. */
export const BUBBLE = `linear-gradient(135deg, #FF5E9A 0%, #E0287A 55%, #B3246B 100%)`;

export const SYSTEM_FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
export const WORDMARK_FONT = "var(--font-us-script), 'Grand Hotel', cursive";

export const METRICS = {
  topBarH: 44,
  bottomNavH: 50,
  pagePad: 16,
  railCollapsed: 72,
  railExpanded: 244,
  webMax: 935,
} as const;

/** Breakpoints the real web app uses. */
export const BP = {
  /** Below this it is the phone app: top bar + bottom nav. */
  web: 768,
  /** At and above this the left rail shows its labels. */
  wide: 1264,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// Stored shape
// ═══════════════════════════════════════════════════════════════════════════

/** Framing: focal point 0–100 and zoom 100–300 — the same shape PhotoAdjuster edits. */
export interface Crop {
  x: number;
  y: number;
  scale: number;
}

/** An extra carousel photo inside one post. */
export interface Frame {
  url: string;
  crop?: Crop;
}

export interface Comment {
  handle: string;
  text: string;
  likes?: number;
}

export interface Post {
  id: string;
  imageUrl: string;
  crop?: Crop;
  /** Carousel photos after the first. */
  more?: Frame[];
  caption: string;
  likes: number;
  /** "Liked by ___ and 847 others". Empty → one of `followedBy`. */
  likedByName: string;
  postedAgo: string;
  location?: string;
  /** Legacy flag: a stack glyph with no extra photos behind it. */
  isMultiple?: boolean;
  isVideo?: boolean;
  comments: Comment[];
}

export interface HighlightSlide {
  imageUrl: string;
  crop?: Crop;
  caption?: string;
}

export interface Highlight {
  title: string;
  coverUrl: string;
  slides: HighlightSlide[];
}

export interface ProfileData {
  /** The sender's first name — signs the letter, owns the grey DM bubbles. */
  from: string;
  /** The recipient's name — "Dear ___", owns the pink DM bubbles. */
  to: string;
  handle: string;
  displayName: string;
  category: string;
  bio: string[];
  link?: { label: string; url: string };
  avatarUrl: string;
  avatarCrop?: Crop;
  /** The little thought bubble above the avatar. */
  note: string;
  stats: { posts: number; followers: number; following: number };
  followedBy: string[];
  highlights: Highlight[];
  posts: Post[];
  pinnedPostIds: string[];
  /** The DM thread. Alternates: [0] from `from`, [1] from `to`, [2] from `from`… */
  dms: string[];
  /** The main letter, popped from the bottom-right corner. */
  letter: string;
  lockQuestion: string;
  lockAnswer: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════════

/** 847 → "847" · 9,999 → "9,999" · 84,700 → "84.7K" · 1,200,000 → "1.2M" */
export function formatStat(n: number): string {
  const v = Math.max(0, Math.trunc(n));
  if (v < 10_000) return v.toLocaleString("en-US");
  if (v < 1_000_000) return `${trim1(v / 1000)}K`;
  return `${trim1(v / 1_000_000)}M`;
}

const trim1 = (n: number): string => {
  const s = n.toFixed(1);
  return s.endsWith(".0") ? s.slice(0, -2) : s;
};

export function followedByLine(handles: string[]): { named: string[]; joiner: string; suffix: string } {
  if (handles.length === 0) return { named: [], joiner: "", suffix: "" };
  if (handles.length === 1) return { named: handles, joiner: "", suffix: "" };
  if (handles.length === 2) return { named: handles, joiner: " and ", suffix: "" };
  const rest = handles.length - 2;
  return { named: handles.slice(0, 2), joiner: ", ", suffix: ` and ${rest} ${rest === 1 ? "other" : "others"}` };
}

export function orderedPosts(data: ProfileData): Post[] {
  const pinned = new Set(data.pinnedPostIds.slice(0, 3));
  return [...data.posts.filter((p) => pinned.has(p.id)), ...data.posts.filter((p) => !pinned.has(p.id))];
}

/** Every photo in one post, first one included. */
export function postFrames(p: Post): Frame[] {
  const first: Frame = { url: p.imageUrl, crop: p.crop };
  return [first, ...(p.more ?? []).filter((f) => f.url)];
}

export function likedBy(p: Post, data: ProfileData, i: number): string {
  if (p.likedByName) return p.likedByName;
  const pool = data.followedBy.length ? data.followedBy : ["someone_special"];
  return pool[i % pool.length];
}

/** "handle: text" or "@handle text" — how a comment arrives from a one-line field. */
export function parseCommentLine(line: string): Comment | null {
  const s = line.trim();
  if (!s) return null;
  const m = /^@?([A-Za-z0-9._]{1,40})\s*[:\-–—]\s*(.+)$/.exec(s) || /^@([A-Za-z0-9._]{1,40})\s+(.+)$/.exec(s);
  if (m) return { handle: m[1].toLowerCase(), text: m[2].trim() };
  return { handle: "bestie", text: s };
}

export const commentToLine = (c: Comment): string => `${c.handle}: ${c.text}`;

export const TIMING = {
  storyMs: 5200,
  toastMs: 2200,
  bigHeartMs: 1000,
} as const;

export type ProfileTab = "grid" | "clips" | "tagged";
