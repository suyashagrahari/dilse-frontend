// ─── Searched — shape, tokens and small pure helpers ─────────────────────────
//
// A search-engine results page, cloned down to the spacing: the doodle home,
// the pill search box with its mic and lens, autocomplete with the COMPLETION
// in bold, the tab row, "About N results", an AI Overview that streams in, the
// knowledge panel, People also ask, Top stories, the Images and Videos packs,
// a local pack of "places we've been", related searches and the stretched
// wordmark pagination. Every word of it is about one person.
//
// ── BRAND ────────────────────────────────────────────────────────────────────
// The LAYOUT is a genre. The MARKS are not ours: the wordmark is the
// recipient's own name in a colourful parody palette, and the checker below
// fails on the real product names and the exact trademark colours. It runs
// over this directory, so the deny-list is assembled from fragments.

import type { LovePhoto } from "../../_love/types";

export type { LovePhoto };

// ═══════════════════════════════════════════════════════════════════════════
// Brand safety — mechanically enforced
// ═══════════════════════════════════════════════════════════════════════════

export const FORBIDDEN_TOKENS: readonly string[] = [
  ["Goo", "gle"].join(""),
  ["Gm", "ail"].join(""),
  ["You", "Tube"].join(""),
  ["Product", " Sans"].join(""),
  ["And", "roid"].join(""),
  ["Chr", "ome"].join(""),
];

const hex = (...parts: string[]): string => parts.join("");

export const FORBIDDEN_COLORS: readonly string[] = [
  hex("#42", "85F4"),
  hex("#EA", "4335"),
  hex("#FB", "BC05"),
  hex("#34", "A853"),
  hex("#1A", "0DAB"),
];

/** Every violation found in the given text. Empty array = clean. */
export function assertBrandSafe(source: string): string[] {
  const lower = source.toLowerCase();
  return [...FORBIDDEN_TOKENS, ...FORBIDDEN_COLORS].filter((t) => lower.includes(t.toLowerCase()));
}

// ═══════════════════════════════════════════════════════════════════════════
// Palette
// ═══════════════════════════════════════════════════════════════════════════

/**
 * The parody wordmark palette — same spirit (primary, playful, one colour per
 * letter), never the real values. Blue, rose, sun, blue, leaf, rose.
 */
export const WORDMARK_COLORS = ["#3F76EE", "#E8445E", "#F4B42B", "#3F76EE", "#26A160", "#E8445E"] as const;
export const colorForIndex = (i: number): string => WORDMARK_COLORS[i % WORDMARK_COLORS.length];

/** The one light palette the password gate and editor UI borrow. */
export const PALETTE = {
  bg: "#ffffff",
  ink: "#1f1f1f",
  grey: "#4d5156",
  greyLight: "#70757a",
  border: "#dadce0",
  link: "#1f15ab",
  accent: "#0b57d0",
  rose: "#E8445E",
} as const;

export const UI = 'Arial, "Helvetica Neue", Helvetica, sans-serif';
/** A geometric sans for the wordmark, tabs and headings. Loaded app-wide. */
export const GS = 'var(--font-outfit), "Outfit", "Segoe UI", Roboto, Arial, sans-serif';

// ═══════════════════════════════════════════════════════════════════════════
// Stored shape
// ═══════════════════════════════════════════════════════════════════════════

/** Legacy: pages saved before the rebuild carried whole fake articles. */
export interface FakePage {
  title: string;
  url: string;
  body: string[];
  imageUrl?: string;
}

export interface SearchResult {
  id: string;
  /** "Unencyclopedia" — the site name over the breadcrumb. */
  site: string;
  /** "unencyclopedia.in › wiki › Meera" — breadcrumb form, not a real URL. */
  url: string;
  title: string;
  /** May contain <b> on matched terms. Rendered through a strict parser. */
  snippet: string;
  /** "2 days ago" — printed before the snippet. */
  date?: string;
  /** Legacy article body. */
  page?: FakePage;
  /** "Sponsored" */
  badge?: string;
}

export interface PaaItem {
  question: string;
  answer: string;
  source?: string;
}

export interface Fact {
  label: string;
  value: string;
}

export interface KnowledgePanel {
  /** "Arjun's favourite human" */
  subtitle: string;
  description: string;
  facts: Fact[];
  /** "Name — caption" strings; rendered as circles. */
  alsoSearchFor: string[];
  quote?: string;
}

export interface Review {
  author: string;
  stars: number;
  text: string;
  when?: string;
}

export interface Story {
  source: string;
  time: string;
  title: string;
}

export interface Video {
  channel: string;
  duration: string;
  title: string;
}

export interface Place {
  name: string;
  kind: string;
  rating: string;
  note: string;
}

export interface SearchData {
  sender: { name: string };
  recipient: { name: string };
  /** Hover title of the doodle: "Celebrating 3 years of Meera & Arjun". */
  doodleTitle: string;
  /** 5–6, funniest first. Each starts with the recipient's name. */
  autocomplete: string[];
  /** "Did you mean: Arjun's favourite person" */
  didYouMean: string;
  /** "8,47,000" — Indian grouping, pre-formatted. */
  resultCount: string;
  searchSeconds: string;
  /** Streams in, paragraph by paragraph. */
  aiOverview: string;
  /** "Label: text" key points under the overview. */
  aiPoints: string[];
  knowledgePanel: KnowledgePanel;
  reviews: Review[];
  results: SearchResult[];
  /** The first four show; opening one appends two more (the real behaviour). */
  paa: PaaItem[];
  topStories: Story[];
  videos: Video[];
  places: Place[];
  relatedSearches: string[];
  /** The memories: images pack, panel collage, thumbnails, the viewer. */
  photos: LovePhoto[];
  letter: string;
  lockQuestion: string;
  lockAnswer: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// Limits (client side; the server mirrors and enforces its own)
// ═══════════════════════════════════════════════════════════════════════════

export const L = {
  name: 48,
  doodleTitle: 90,
  suggestion: 90,
  didYouMean: 80,
  resultCount: 20,
  seconds: 6,
  overview: 900,
  point: 140,
  subtitle: 80,
  description: 420,
  factLabel: 28,
  factValue: 90,
  alsoSearch: 48,
  reviewAuthor: 32,
  reviewText: 200,
  reviewWhen: 24,
  site: 40,
  url: 90,
  title: 110,
  snippet: 260,
  date: 24,
  question: 110,
  answer: 420,
  storySource: 32,
  storyTime: 24,
  storyTitle: 120,
  videoChannel: 36,
  videoDuration: 8,
  videoTitle: 100,
  placeName: 40,
  placeKind: 48,
  placeRating: 4,
  placeNote: 140,
  related: 70,
  maxSuggestions: 6,
  maxPoints: 5,
  maxFacts: 8,
  maxAlso: 6,
  maxReviews: 5,
  maxResults: 8,
  maxPaa: 8,
  maxStories: 5,
  maxVideos: 4,
  maxPlaces: 5,
  maxRelated: 8,
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════════════════

export const firstNameOf = (full: string): string => (full || "").trim().split(/\s+/)[0] ?? "";

/** 847000 → "8,47,000". */
export function groupIndian(n: number): string {
  const s = Math.abs(Math.trunc(n)).toString();
  if (s.length <= 3) return (n < 0 ? "-" : "") + s;
  const last3 = s.slice(-3);
  const rest = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return `${n < 0 ? "-" : ""}${rest},${last3}`;
}

/** Deterministic small hash — favicon colours, review counts. */
export function hashOf(s: string): number {
  let h = 7;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function initialCircle(name: string): { initial: string; bg: string } {
  const initial = (name.trim()[0] ?? "?").toUpperCase();
  return { initial, bg: WORDMARK_COLORS[hashOf(name) % WORDMARK_COLORS.length] };
}

/**
 * Autocomplete: rows that start with what's typed; once three letters of the
 * first name match, everything — sloppy typing must never hide the jokes.
 */
export function matchSuggestions(query: string, suggestions: string[], recipientName: string): string[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const prefix = suggestions.filter((s) => s.toLowerCase().startsWith(q));
  if (prefix.length) return prefix.slice(0, L.maxSuggestions);
  const first = firstNameOf(recipientName).toLowerCase();
  const loose = first && (first.startsWith(q.slice(0, 3)) || q.startsWith(first.slice(0, 3)));
  return loose ? suggestions.slice(0, L.maxSuggestions) : suggestions.slice(0, 3);
}

/** The real convention: the typed prefix is NORMAL, the completion is BOLD. */
export function splitSuggestion(suggestion: string, query: string): { typed: string; rest: string } {
  const q = query.trim();
  if (q && suggestion.toLowerCase().startsWith(q.toLowerCase())) {
    return { typed: suggestion.slice(0, q.length), rest: suggestion.slice(q.length) };
  }
  return { typed: "", rest: suggestion };
}

export interface SnippetToken {
  text: string;
  bold: boolean;
}

/** `<b>` spans become bold tokens; every other tag becomes plain text. */
export function parseSnippet(raw: string): SnippetToken[] {
  const src = raw ?? "";
  const out: SnippetToken[] = [];
  const re = /<b>([\s\S]*?)<\/b>/gi;
  const clean = (s: string) => s.replace(/<[^>]*>/g, "");
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    if (m.index > last) out.push({ text: clean(src.slice(last, m.index)), bold: false });
    out.push({ text: clean(m[1]), bold: true });
    last = re.lastIndex;
  }
  if (last < src.length) out.push({ text: clean(src.slice(last)), bold: false });
  return out.filter((t) => t.text.length > 0);
}

/**
 * Bold the recipient's name parts inside plain text — the results page bolds
 * the query terms in every snippet, and the AI writes plain text.
 */
export function boldTerms(text: string, name: string): SnippetToken[] {
  if (/<b>/i.test(text)) return parseSnippet(text);
  const plain = text.replace(/<[^>]*>/g, "");
  const parts = name.trim().split(/\s+/).filter((p) => p.length > 1);
  if (!parts.length) return [{ text: plain, bold: false }];
  const esc = parts.map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const re = new RegExp(`(${esc.join("|")})`, "gi");
  return plain
    .split(re)
    .filter(Boolean)
    .map((t) => ({ text: t, bold: parts.some((p) => p.toLowerCase() === t.toLowerCase()) }));
}

/**
 * The stretched wordmark for pagination: "Meera" → M · e×N · ra.
 * The first vowel after the first letter is repeated once per page.
 */
export function stretchName(name: string): { head: string; vowel: string; tail: string } {
  const n = firstNameOf(name) || "Love";
  const m = /[aeiouy]/i.exec(n.slice(1));
  if (!m) return { head: n.slice(0, 1), vowel: "o", tail: n.slice(1) || "ve" };
  const at = m.index + 1;
  let end = at;
  while (end < n.length && n[end].toLowerCase() === n[at].toLowerCase()) end++;
  return { head: n.slice(0, at), vowel: n[at].toLowerCase(), tail: n.slice(end) };
}

/** "Label: value" → a fact; the first colon splits. */
export function splitFact(s: string): Fact {
  const i = s.indexOf(":");
  if (i < 0) return { label: "", value: s.trim() };
  return { label: s.slice(0, i).trim(), value: s.slice(i + 1).trim() };
}

/** "Name — caption" (em dash, en dash or hyphen with spaces). */
export function splitAlso(s: string): { name: string; caption: string } {
  const m = /^(.*?)\s+[—–-]\s+(.*)$/.exec(s.trim());
  return m ? { name: m[1].trim(), caption: m[2].trim() } : { name: s.trim(), caption: "" };
}

export type Tab = "all" | "ai" | "images" | "videos" | "news" | "maps" | "shopping";

export const TABS: { id: Tab; label: string }[] = [
  { id: "ai", label: "AI Mode" },
  { id: "all", label: "All" },
  { id: "images", label: "Images" },
  { id: "videos", label: "Videos" },
  { id: "news", label: "News" },
  { id: "maps", label: "Maps" },
  { id: "shopping", label: "Shopping" },
];

export const LUCKY_ROLL = [
  "I'm Feeling Lucky",
  "I'm Feeling Loved",
  "I'm Feeling Blushy",
  "I'm Feeling Clingy",
  "I'm Feeling Yours",
  "I'm Feeling Kissable",
  "I'm Feeling Lucky",
];
