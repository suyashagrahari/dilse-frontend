// ─── Searched — DB → UI coercion ─────────────────────────────────────────────
//
// This is the ONLY place that decides what a stored page is allowed to contain.
// It runs on the recipient's published page, where the payload is untrusted
// input: it may be older than the current schema, partially filled, or hostile.
// Every array is clamped, every string is length-capped, and every field
// degrades to something renderable rather than throwing.
//
// `types.ts` is frozen and holds the shape. The coercer lives here.
//
// MARKUP POLICY, decided once, here: `snippet` is authored with `<b>` on the
// matched terms because that is the real convention. Nothing else survives.
// `sanitiseSnippet` strips every tag except `<b>`/`</b>`, and the renderer then
// parses those spans itself — no `dangerouslySetInnerHTML` anywhere in the
// template. Two layers, and the outer one is this function.

import { list, num, obj, str, strList, strOr, type Raw } from "@/lib/wire";
import type {
  FakePage,
  KnowledgeFact,
  KnowledgePanel,
  PaaItem,
  SearchData,
  SearchResult,
} from "./types";
import { DEMO_DATA } from "./demoData";

// ── Limits. A stored page longer than these is malformed, not ambitious. ─────
export const LIMITS = {
  autocomplete: 6,
  results: 12,
  paa: 8,
  paaReserve: 8,
  facts: 10,
  alsoSearchFor: 8,
  relatedSearches: 10,
  images: 24,
  alternateTerms: 12,
  alternateResults: 4,
  bodyParagraphs: 24,
  /** Character caps, by role. Generous — these stop abuse, not long letters. */
  short: 120,
  line: 320,
  paragraph: 1200,
  url: 160,
} as const;

const cap = (s: string, max: number): string => (s.length > max ? s.slice(0, max) : s);

/** A capped, trimmed string that is allowed to be empty. */
const text = (v: unknown, max: number, fallback = ""): string => cap(strOr(v, fallback), max);

/**
 * Strip every tag except `<b>` and `</b>`. Also removes anything that merely
 * looks like a tag, so a stored `<img onerror=…>` becomes inert plain text
 * before it ever reaches a component.
 */
export function sanitiseSnippet(raw: unknown): string {
  const src = typeof raw === "string" ? raw : "";
  return cap(
    src
      // Drop script/style wholesale, contents and all.
      .replace(/<\s*(script|style)[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
      .replace(/<\s*(script|style)\b[^>]*>/gi, "")
      // Keep only well-formed <b> / </b>; every other tag becomes nothing.
      .replace(/<\/?[^>]*>/g, (tag) => (/^<\s*\/?\s*b\s*>$/i.test(tag) ? tag.replace(/\s+/g, "").toLowerCase() : ""))
      // A stray "<" that never closed would otherwise sit in the DOM as text.
      .replace(/</g, (_m, offset: number, whole: string) =>
        /^<\/?b>/i.test(whole.slice(offset)) ? "<" : "‹",
      ),
    LIMITS.line,
  );
}

const pageFrom = (v: unknown): FakePage | undefined => {
  const o = obj(v);
  const title = text(o.title, LIMITS.short);
  const body = strList(o.body, [])
    .slice(0, LIMITS.bodyParagraphs)
    .map((p) => cap(p, LIMITS.paragraph));
  if (!title && body.length === 0) return undefined;
  const imageUrl = text(o.imageUrl, LIMITS.url).trim();
  return { title, url: text(o.url, LIMITS.url), body, ...(imageUrl ? { imageUrl } : {}) };
};

const resultFrom = (o: Raw, i: number): SearchResult | null => {
  const title = text(o.title, LIMITS.short).trim();
  if (!title) return null;
  const badge = text(o.badge, 24).trim();
  const page = pageFrom(o.page);
  return {
    id: cap(str(o.id, `r${i + 1}`), 48),
    title,
    url: text(o.url, LIMITS.url),
    snippet: sanitiseSnippet(o.snippet),
    ...(page ? { page } : {}),
    ...(badge ? { badge } : {}),
  };
};

/** Alternate results are cheap by contract: no fake pages, no badges. */
const alternateFrom = (o: Raw, i: number): SearchResult | null => {
  const full = resultFrom(o, i);
  if (!full) return null;
  return { id: full.id, title: full.title, url: full.url, snippet: full.snippet };
};

const paaFrom = (o: Raw): PaaItem | null => {
  const question = text(o.question, LIMITS.short).trim();
  const answer = cap(text(o.answer, LIMITS.paragraph).trim(), LIMITS.paragraph);
  if (!question || !answer) return null;
  const source = text(o.source, LIMITS.url).trim();
  return { question, answer, ...(source ? { source } : {}) };
};

const factFrom = (o: Raw): KnowledgeFact | null => {
  const label = text(o.label, 40).trim();
  const value = text(o.value, LIMITS.short).trim();
  return label || value ? { label, value } : null;
};

const panelFrom = (v: unknown): KnowledgePanel => {
  const kp = obj(v);
  const quote = text(kp.quote, LIMITS.line).trim();
  return {
    subtitle: text(kp.subtitle, LIMITS.short),
    description: text(kp.description, LIMITS.paragraph),
    facts: list<KnowledgeFact>(kp.facts, factFrom, []).slice(0, LIMITS.facts),
    ...(quote ? { quote } : {}),
    alsoSearchFor: strList(kp.alsoSearchFor, [])
      .slice(0, LIMITS.alsoSearchFor)
      .map((n) => cap(n, 40)),
  };
};

/**
 * The public coercer. Never throws, never returns a shape the template cannot
 * render. Sections that legitimately came back empty STAY empty — the template
 * hides them rather than drawing an empty container.
 */
export function dbToSearchData(raw: Record<string, unknown> | null | undefined): SearchData {
  const src = obj(raw);

  const alternateResults: Record<string, SearchResult[]> = {};
  const altEntries = Object.entries(obj(src.alternateResults)).slice(0, LIMITS.alternateTerms);
  for (const [term, value] of altEntries) {
    const key = cap(String(term), LIMITS.short);
    const rows = list<SearchResult>(value, alternateFrom, []).slice(0, LIMITS.alternateResults);
    if (key && rows.length > 0) alternateResults[key] = rows;
  }

  const didYouMean = text(src.didYouMean, LIMITS.short).trim();

  // A stored count may arrive as a number from an older writer; keep the
  // pre-formatted string if that is what we were given.
  const rawCount = src.resultCount;
  const resultCount =
    typeof rawCount === "string" && rawCount.trim()
      ? cap(rawCount.trim(), 24)
      : Number.isFinite(num(rawCount, NaN))
        ? String(Math.trunc(num(rawCount, 0)))
        : DEMO_DATA.resultCount;

  return {
    sender: { name: cap(str(src.senderName, DEMO_DATA.sender.name), 48) },
    recipient: {
      name: cap(str(src.recipientName, DEMO_DATA.recipient.name), 48),
      // A blank photo is valid and expected — the panel draws an initial circle.
      photoUrl: text(src.recipientPhoto, 600).trim(),
    },
    autocomplete: strList(src.autocomplete, DEMO_DATA.autocomplete)
      .slice(0, LIMITS.autocomplete)
      .map((s) => cap(s, LIMITS.short)),
    ...(didYouMean ? { didYouMean } : {}),
    resultCount,
    searchSeconds: cap(str(src.searchSeconds, DEMO_DATA.searchSeconds), 8),
    results: list<SearchResult>(src.results, resultFrom, DEMO_DATA.results).slice(0, LIMITS.results),
    paa: list<PaaItem>(src.paa, paaFrom, []).slice(0, LIMITS.paa),
    paaReserve: list<PaaItem>(src.paaReserve, paaFrom, []).slice(0, LIMITS.paaReserve),
    knowledgePanel: panelFrom(src.knowledgePanel),
    relatedSearches: strList(src.relatedSearches, [])
      .slice(0, LIMITS.relatedSearches)
      .map((s) => cap(s, LIMITS.short)),
    images: list<{ url: string; caption?: string }>(
      src.images,
      (im) => {
        const url = text(im.url, 600).trim();
        if (!url) return null;
        const caption = text(im.caption, LIMITS.short).trim();
        return { url, ...(caption ? { caption } : {}) };
      },
      [],
    ).slice(0, LIMITS.images),
    alternateResults,
  };
}
