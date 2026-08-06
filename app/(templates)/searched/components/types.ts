// ─── Searched — the frozen contract ──────────────────────────────────────────
//
// LEAD-OWNED AND FROZEN. Import from here; do not extend it.
//
// This template must look like a BORING UTILITY. The comedy is entirely in the
// copy, and any decoration undermines it. No gradients, no shadows beyond a 1px
// border on the search box and the knowledge panel, greyscale everything except
// the wordmark and the link colour. If a change makes this prettier, it makes
// it worse.
//
// ── BRAND ────────────────────────────────────────────────────────────────────
// The LAYOUT is a genre and is built here in full: centred search bar, the
// autocomplete dropdown, the tab row, the results-count line, the
// URL-breadcrumb / blue-title / grey-snippet hierarchy, People Also Ask
// accordions, the right-hand knowledge panel, related searches.
//
// The MARKS are not. This file's `assertBrandSafe` is run over the rendered
// template as part of verification, and fails on the trademarked wordmark, the
// four-colour sequence, the type family, and the specific link blue. The
// recognition comes from the layout, not from the logo — strip the mark and
// swap the palette and it still reads as a search page in under a second.

// ═══════════════════════════════════════════════════════════════════════════
// Brand safety — mechanically enforced
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Substrings that must not appear ANYWHERE — copy, class names, alt text,
 * file names, or comments. Split so that this contract file can name what it
 * forbids without itself tripping the grep that runs over the template.
 */
export const FORBIDDEN_TOKENS: readonly string[] = [
  ["Goo", "gle"].join(""),
  ["Gm", "ail"].join(""),
  ["You", "Tube"].join(""),
  ["Product", " Sans"].join(""),
  ["And", "roid"].join(""),
  ["Chr", "ome"].join(""),
];

/** The four-colour sequence, and the link blue. Never these exact values. */
export const FORBIDDEN_COLORS: readonly string[] = [
  "#4285F4",
  "#EA4335",
  "#FBBC05",
  "#34A853",
  "#1A0DAB",
];

/**
 * Returns every violation found in the given source text. Empty array = clean.
 * Run over the concatenated template source and over the rendered DOM.
 */
export function assertBrandSafe(source: string): string[] {
  const hits: string[] = [];
  const lower = source.toLowerCase();
  for (const t of FORBIDDEN_TOKENS) {
    if (lower.includes(t.toLowerCase())) hits.push(t);
  }
  for (const c of FORBIDDEN_COLORS) {
    if (lower.includes(c.toLowerCase())) hits.push(c);
  }
  return hits;
}

// ═══════════════════════════════════════════════════════════════════════════
// Palette — greyscale, plus exactly two colours
// ═══════════════════════════════════════════════════════════════════════════

export const PALETTE = {
  bg: "#fdfdfd",
  /** Primary text. */
  ink: "#1f1f1f",
  /** Snippets and the results-count line. */
  grey: "#5f6368",
  greyLight: "#70757a",
  border: "#dadce0",
  /** Result titles. A blue-violet, deliberately distinct. */
  link: "#5B4FD6",
  linkVisited: "#6d3fa8",
  /** Breadcrumb URLs. */
  url: "#3c4043",
  hover: "#f1f3f4",
} as const;

/**
 * The wordmark palette: plum, coral, amber, teal, rose. Clearly not the
 * four-colour sequence, in a different count and a different order.
 * Cycled per character of the recipient's name.
 */
export const WORDMARK_COLORS = ["#8E3B8E", "#E2664F", "#D9A21B", "#2E8B8B", "#C2456E"] as const;

export const colorForIndex = (i: number): string =>
  WORDMARK_COLORS[i % WORDMARK_COLORS.length];

/** Native-ish UI sans. Not a licensed brand face. */
export const UI =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif';
/** The fake pages are deliberately plain — a personal blog from 2011. */
export const ARTICLE = "var(--font-tinos), Georgia, 'Times New Roman', serif";

// ═══════════════════════════════════════════════════════════════════════════
// Stored shape
// ═══════════════════════════════════════════════════════════════════════════

export interface FakePage {
  title: string;
  url: string;
  body: string[];
  imageUrl?: string;
}

export interface SearchResult {
  id: string;
  title: string;
  /** "meera.verma › my-life" — breadcrumb form, not a real URL. */
  url: string;
  /** May contain <b> on matched terms. Rendered through a strict sanitiser. */
  snippet: string;
  /** Present → the result is clickable and opens a full fake page. */
  page?: FakePage;
  /** "Ad · sponsored by me" */
  badge?: string;
}

export interface PaaItem {
  question: string;
  answer: string;
  /** "arjun.exe › feelings" */
  source?: string;
}

export interface KnowledgeFact {
  label: string;
  value: string;
}

export interface KnowledgePanel {
  /** "Person · The Love of My Life" */
  subtitle: string;
  description: string;
  facts: KnowledgeFact[];
  quote?: string;
  /** Friends' names → generated initial-circles. No fetched avatars. */
  alsoSearchFor: string[];
}

export interface SearchData {
  sender: { name: string };
  recipient: { name: string; photoUrl: string };
  /** 5-6, funniest first. */
  autocomplete: string[];
  didYouMean?: string;
  /** "8,47,000" — Indian digit grouping, pre-formatted by `groupIndian`. */
  resultCount: string;
  searchSeconds: string;
  results: SearchResult[];
  paa: PaaItem[];
  /** Held back, appended two at a time as questions are expanded. */
  paaReserve: PaaItem[];
  knowledgePanel: KnowledgePanel;
  relatedSearches: string[];
  images: { url: string; caption?: string }[];
  /** Swapped in when a related search is tapped. Cheap: 2-3 results, no pages. */
  alternateResults: Record<string, SearchResult[]>;
}

// ═══════════════════════════════════════════════════════════════════════════
// Numbers
// ═══════════════════════════════════════════════════════════════════════════

/** 847000 → "8,47,000". Lakh/crore grouping, which is the joke's home turf. */
export function groupIndian(n: number): string {
  const s = Math.abs(Math.trunc(n)).toString();
  if (s.length <= 3) return (n < 0 ? "-" : "") + s;
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return `${n < 0 ? "-" : ""}${rest},${last3}`;
}

// ═══════════════════════════════════════════════════════════════════════════
// Autocomplete — the best moment in the template
// ═══════════════════════════════════════════════════════════════════════════

export const AUTOCOMPLETE = {
  /** Rows appear staggered. */
  staggerMs: 40,
  /** After this long idle with a non-empty field, pulse the top suggestion once. */
  nudgeAfterMs: 1500,
  /** Loose-match threshold against the recipient's first name. */
  looseMatchChars: 3,
  maxRows: 6,
} as const;

/**
 * Filter entries that start with what's typed, but ALSO surface everything once
 * at least 3 characters of the recipient's first name match — sloppy typing
 * must not hide the jokes, and an empty dropdown is a dead moment.
 */
export function matchSuggestions(
  query: string,
  suggestions: string[],
  recipientFirstName: string,
): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const prefix = suggestions.filter((s) => s.toLowerCase().startsWith(q));
  const first = recipientFirstName.trim().toLowerCase();
  const loose =
    first.length > 0 &&
    q.length >= AUTOCOMPLETE.looseMatchChars &&
    (first.startsWith(q.slice(0, AUTOCOMPLETE.looseMatchChars)) ||
      q.startsWith(first.slice(0, AUTOCOMPLETE.looseMatchChars)));
  const pool = prefix.length > 0 ? prefix : loose ? suggestions : suggestions;
  return pool.slice(0, AUTOCOMPLETE.maxRows);
}

export interface SuggestionParts {
  /** The portion the user has already typed. Rendered at NORMAL weight. */
  typed: string;
  /** Everything after it. Rendered BOLD. */
  rest: string;
}

/**
 * The real convention, and almost everyone gets it backwards: the typed prefix
 * is normal weight and the COMPLETION is bold. Bolding the typed part instead
 * makes the dropdown look fake instantly.
 */
export function splitSuggestion(suggestion: string, query: string): SuggestionParts {
  const q = query.trim();
  if (q && suggestion.toLowerCase().startsWith(q.toLowerCase())) {
    return { typed: suggestion.slice(0, q.length), rest: suggestion.slice(q.length) };
  }
  return { typed: "", rest: suggestion };
}

// ═══════════════════════════════════════════════════════════════════════════
// People Also Ask
// ═══════════════════════════════════════════════════════════════════════════

export const PAA = {
  /** Measure scrollHeight and animate max-height. A fixed cap clips long answers. */
  expandMs: 300,
  /** Expanding one appends this many more to the bottom. A real behaviour. */
  appendOnExpand: 2,
} as const;

/**
 * Expanding a question appends two held-back ones. Never removes, never
 * collapses a sibling — people open all of them, and the box feeling alive is
 * exactly why the page reads as authentic.
 */
export function appendReserve(
  shown: PaaItem[],
  reserve: PaaItem[],
  alreadyAppended: number,
): { items: PaaItem[]; appended: number } {
  const next = reserve.slice(alreadyAppended, alreadyAppended + PAA.appendOnExpand);
  if (next.length === 0) return { items: shown, appended: alreadyAppended };
  return { items: [...shown, ...next], appended: alreadyAppended + next.length };
}

// ═══════════════════════════════════════════════════════════════════════════
// Layout & motion
// ═══════════════════════════════════════════════════════════════════════════

export const TIMING = {
  /** Results animate in staggered on first paint. */
  resultStaggerMs: 60,
  /** The fake page slides in from the right. */
  pageSlideMs: 300,
  toastMs: 2200,
} as const;

export const TAP_TARGET_PX = 44;

export type Tab = "all" | "images" | "news" | "videos" | "shopping" | "more";

/** Only "all" and "images" have content. The rest are one-line jokes. */
export const TAB_EMPTY_COPY: Record<Exclude<Tab, "all" | "images">, string> = {
  news: "no news. we're private people.",
  videos: "nothing recorded. you had to be there.",
  shopping: "not for sale.",
  more: "that's everything. there isn't a more.",
};

export const COPY = {
  placeholder: "search your name",
  search: "Search",
  lucky: "I'm Feeling Lucky",
  didYouMean: (s: string) => `Did you mean: ${s}`,
  refuseCorrection: "no. I meant you.",
  wrongName: (name: string) => `showing results for ${name} instead. obviously.`,
  privateResult: "some things stay private",
  emptySearch: "type something. anything. preferably your name.",
  noImages: "no images. you'll have to remember.",
  resultsLine: (count: string, secs: string) => `About ${count} results (${secs} seconds)`,
} as const;

/** Deterministic initial-circle colour. Never fetch a real favicon. */
export function initialCircle(name: string): { initial: string; bg: string } {
  const initial = (name.trim()[0] ?? "?").toUpperCase();
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return { initial, bg: WORDMARK_COLORS[h % WORDMARK_COLORS.length] };
}
