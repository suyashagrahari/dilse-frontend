// ─── Searched — the one place that decides what a page may contain ───────────
//
// `dbToSearchData` runs on the recipient's published page, where the payload is
// untrusted: it may be from before the rebuild (whole fake articles, a
// separate PAA reserve, an `images` list, one recipient photo), partial, or
// hostile. Every list is clamped, every string capped, nothing throws.
//
// `normaliseSearchData` is the AI boundary. The fill schema can only describe
// text leaves, so structured rows arrive as pipe strings
// ("site | breadcrumb | title | snippet"); this turns them back into rows and
// is idempotent — well-formed data passes through untouched. It runs on every
// render path, so nothing downstream ever sees a string where a row belongs.

import { obj, str, strOr, type Raw } from "@/lib/wire";
import { parseLovePhotos, MAX_LETTER_LEN, MAX_LOCK_ANSWER_LEN, MAX_LOCK_QUESTION_LEN, type LovePhoto } from "../../_love/types";
import { DEMO_DATA } from "./demoData";
import {
  L,
  firstNameOf,
  splitFact,
  type Fact,
  type FakePage,
  type KnowledgePanel,
  type PaaItem,
  type Place,
  type Review,
  type SearchData,
  type SearchResult,
  type Story,
  type Video,
} from "./types";

const cap = (s: string, max: number): string => (s.length > max ? s.slice(0, max) : s);
const t = (v: unknown, max: number, fallback = ""): string => cap(strOr(v, fallback).trim(), max);
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v.slice(0, 60) : []);
const pipes = (s: string): string[] => s.split("|").map((p) => p.trim()).map((p) => (/^[-–—]$/.test(p) ? "" : p));

/** Strip every tag except <b>/</b>; stray "<" becomes a harmless glyph. */
export function sanitiseSnippet(raw: unknown, max: number = L.snippet): string {
  const src = typeof raw === "string" ? raw : "";
  return cap(
    src
      .replace(/<\s*(script|style)[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
      .replace(/<\/?[^>]*>/g, (tag) => (/^<\s*\/?\s*b\s*>$/i.test(tag) ? tag.replace(/\s+/g, "").toLowerCase() : ""))
      .replace(/</g, (_m, offset: number, whole: string) => (/^<\/?b>/i.test(whole.slice(offset)) ? "<" : "‹")),
    max + 14,
  );
}

const siteFromUrl = (url: string): string => {
  const head = url.split("›")[0].trim().replace(/^https?:\/\//, "").replace(/^www\./, "");
  const base = head.split(/[./]/)[0] || head;
  return base ? base.charAt(0).toUpperCase() + base.slice(1) : "";
};

const breadcrumbFor = (site: string, title: string): string => {
  const host = site.toLowerCase().replace(/[^a-z0-9]+/g, "") || "love";
  const leaf = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 24) || "about";
  return `${host}.in › ${leaf}`;
};

// ── row parsers: string (AI) or object (form / wire) ─────────────────────────

function toResult(v: unknown, i: number): SearchResult | null {
  if (typeof v === "string") {
    const p = pipes(v);
    let site = "";
    let url = "";
    let title = "";
    let snippet = "";
    if (p.length >= 4) {
      [site, url, title] = p;
      snippet = p.slice(3).filter(Boolean).join(" · ");
    } else if (p.length === 3) [site, title, snippet] = p;
    else if (p.length === 2) [title, snippet] = p;
    else title = p[0] ?? "";
    title = cap(title, L.title);
    if (!title) return null;
    site = cap(site || "Notes", L.site);
    return { id: `r${i + 1}`, site, url: cap(url || breadcrumbFor(site, title), L.url), title, snippet: sanitiseSnippet(snippet) };
  }
  const o = obj(v);
  const title = t(o.title, L.title);
  if (!title) return null;
  const url = t(o.url, L.url + 60);
  const site = t(o.site, L.site) || siteFromUrl(url) || "Notes";
  const r: SearchResult = { id: cap(str(o.id, `r${i + 1}`), 48), site, url: url || breadcrumbFor(site, title), title, snippet: sanitiseSnippet(o.snippet) };
  const date = t(o.date, L.date);
  if (date) r.date = date;
  const badge = t(o.badge, 24);
  if (badge) r.badge = badge;
  const page = toPage(o.page);
  if (page) r.page = page;
  return r;
}

function toPage(v: unknown): FakePage | undefined {
  const o = obj(v);
  const title = t(o.title, 160);
  const body = arr(o.body).filter((x): x is string => typeof x === "string" && !!x.trim()).slice(0, 20).map((x) => cap(x, 1200));
  if (!title && !body.length) return undefined;
  const imageUrl = t(o.imageUrl, 600);
  return { title, url: t(o.url, 160), body, ...(/^https:\/\//.test(imageUrl) ? { imageUrl } : {}) };
}

function toPaa(v: unknown): PaaItem | null {
  if (typeof v === "string") {
    const p = pipes(v);
    const question = cap(p[0] ?? "", L.question);
    const answer = cap(p.slice(1).filter(Boolean).join(" "), L.answer);
    return question && answer ? { question, answer } : null;
  }
  const o = obj(v);
  const question = t(o.question, L.question);
  const answer = t(o.answer, L.answer + 200);
  if (!question || !answer) return null;
  const source = t(o.source, L.url);
  return { question, answer, ...(source ? { source } : {}) };
}

function toFact(v: unknown): Fact | null {
  if (typeof v === "string") {
    const f = splitFact(v);
    return f.value || f.label ? { label: cap(f.label, L.factLabel), value: cap(f.value, L.factValue) } : null;
  }
  const o = obj(v);
  const label = t(o.label, L.factLabel + 20);
  const value = t(o.value, L.factValue + 40);
  return label || value ? { label, value } : null;
}

const starsOf = (v: unknown): number => {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? "").replace(/[^\d.]/g, "")) || (String(v ?? "").match(/★/g)?.length ?? 5);
  return Math.min(5, Math.max(1, Math.round(n || 5)));
};

function toReview(v: unknown): Review | null {
  if (typeof v === "string") {
    const p = pipes(v);
    if (p.length < 2) return p[0] ? { author: "Anonymous", stars: 5, text: cap(p[0], L.reviewText) } : null;
    const [author, stars, ...rest] = p;
    const text = cap((p.length === 2 ? stars : rest.filter(Boolean).join(" ")) || "", L.reviewText);
    if (!text) return null;
    return { author: cap(author || "Anonymous", L.reviewAuthor), stars: p.length === 2 ? 5 : starsOf(stars), text };
  }
  const o = obj(v);
  const text = t(o.text, L.reviewText);
  if (!text) return null;
  const when = t(o.when, L.reviewWhen);
  return { author: t(o.author, L.reviewAuthor) || "Anonymous", stars: starsOf(o.stars), text, ...(when ? { when } : {}) };
}

function toStory(v: unknown): Story | null {
  if (typeof v === "string") {
    const p = pipes(v);
    const title = cap(p.length >= 3 ? p.slice(2).join(" ") : p[p.length - 1] ?? "", L.storyTitle);
    if (!title) return null;
    return { source: cap(p.length >= 2 ? p[0] : "Heartbeat News", L.storySource), time: cap(p.length >= 3 ? p[1] : "1 hour ago", L.storyTime), title };
  }
  const o = obj(v);
  const title = t(o.title, L.storyTitle);
  return title ? { source: t(o.source, L.storySource) || "News", time: t(o.time, L.storyTime), title } : null;
}

function toVideo(v: unknown): Video | null {
  if (typeof v === "string") {
    const p = pipes(v);
    const title = cap(p.length >= 3 ? p.slice(2).join(" ") : p[p.length - 1] ?? "", L.videoTitle);
    if (!title) return null;
    return { channel: cap(p.length >= 2 ? p[0] : "Camera Roll", L.videoChannel), duration: cap(p.length >= 3 ? p[1] : "1:24", L.videoDuration), title };
  }
  const o = obj(v);
  const title = t(o.title, L.videoTitle);
  return title ? { channel: t(o.channel, L.videoChannel), duration: t(o.duration, L.videoDuration), title } : null;
}

function toPlace(v: unknown): Place | null {
  if (typeof v === "string") {
    const p = pipes(v);
    const name = cap(p[0] ?? "", L.placeName);
    if (!name) return null;
    const rating = (p[2] ?? "").replace(/[^\d.]/g, "").slice(0, L.placeRating);
    return { name, kind: cap(p[1] ?? "", L.placeKind), rating: rating || "5.0", note: cap(p.slice(3).filter(Boolean).join(" "), L.placeNote) };
  }
  const o = obj(v);
  const name = t(o.name, L.placeName);
  if (!name) return null;
  return { name, kind: t(o.kind, L.placeKind), rating: t(o.rating, L.placeRating) || "5.0", note: t(o.note, L.placeNote) };
}

function rows<T>(v: unknown, fn: (x: unknown, i: number) => T | null, max: number): T[] {
  return arr(v).map(fn).filter((x): x is T => x !== null).slice(0, max);
}

const strings = (v: unknown, max: number, each: number): string[] =>
  arr(v)
    .filter((x): x is string => typeof x === "string")
    .map((x) => cap(x.trim(), each))
    .filter(Boolean)
    .slice(0, max);

function panelOf(v: unknown): KnowledgePanel {
  const o = obj(v);
  const quote = t(o.quote, 300);
  return {
    subtitle: t(o.subtitle, L.subtitle + 40),
    description: t(o.description, L.description + 400),
    facts: rows(o.facts, toFact, L.maxFacts),
    alsoSearchFor: strings(o.alsoSearchFor, L.maxAlso, L.alsoSearch),
    ...(quote ? { quote } : {}),
  };
}

/**
 * The AI boundary (and the form's safety net). Idempotent: rows already in
 * shape are re-validated and pass through; pipe strings become rows; photo
 * slots the model captioned but that hold no photo are dropped.
 */
export function normaliseSearchData(d: SearchData): SearchData {
  const photos = (Array.isArray(d.photos) ? d.photos : []).filter((p): p is LovePhoto => !!p && typeof p.url === "string" && !!p.url);
  return {
    ...d,
    sender: { name: strOr(d.sender?.name, "") },
    recipient: { name: strOr(d.recipient?.name, "") },
    autocomplete: Array.isArray(d.autocomplete) ? d.autocomplete.filter((s) => typeof s === "string") : [],
    aiPoints: Array.isArray(d.aiPoints) ? d.aiPoints.filter((s) => typeof s === "string") : typeof d.aiPoints === "string" ? String(d.aiPoints).split("\n") : [],
    relatedSearches: Array.isArray(d.relatedSearches) ? d.relatedSearches.filter((s) => typeof s === "string") : [],
    knowledgePanel: {
      ...d.knowledgePanel,
      subtitle: strOr(d.knowledgePanel?.subtitle, ""),
      description: strOr(d.knowledgePanel?.description, ""),
      facts: rows(d.knowledgePanel?.facts, toFact, L.maxFacts),
      alsoSearchFor: Array.isArray(d.knowledgePanel?.alsoSearchFor) ? d.knowledgePanel.alsoSearchFor.filter((s) => typeof s === "string") : [],
    },
    reviews: rows(d.reviews, toReview, L.maxReviews),
    results: rows(d.results, toResult, L.maxResults),
    paa: rows(d.paa, toPaa, L.maxPaa),
    topStories: rows(d.topStories, toStory, L.maxStories),
    videos: rows(d.videos, toVideo, L.maxVideos),
    places: rows(d.places, toPlace, L.maxPlaces),
    photos,
  };
}

/**
 * Stored page (or draft) → UI. `db` = a real stored page: missing new fields
 * become empty (sections hide) instead of borrowing the demo's words.
 */
export function dbToSearchData(raw: Record<string, unknown> | null | undefined, db = true): SearchData {
  const src: Raw = obj(raw);
  const D = DEMO_DATA;
  const pick = <T,>(key: string, val: T, demo: T): T => (src[key] === undefined && !db ? demo : val);

  const senderName = t(obj(src.sender).name, L.name) || t(src.senderName, L.name);
  const recipientName = t(obj(src.recipient).name, L.name) || t(src.recipientName, L.name);

  // Photos: the new list, else the legacy images list plus the one recipient photo.
  let photos = parseLovePhotos(src.photos, []);
  if (!photos.length) {
    const legacy = arr(src.images)
      .map((im) => obj(im))
      .map((im) => ({ url: t(im.url, 2000), caption: t(im.caption, 60) }))
      .filter((p) => /^https:\/\//.test(p.url))
      .map((p) => (p.caption ? p : { url: p.url }));
    const portrait = t(obj(src.recipient).photoUrl, 2000) || t(src.recipientPhoto, 2000);
    photos = [...(/^https:\/\//.test(portrait) ? [{ url: portrait, caption: firstNameOf(recipientName) }] : []), ...legacy].slice(0, 10);
    if (!photos.length && !db) photos = D.photos;
  }

  const paa = [...arr(src.paa), ...arr(src.paaReserve)];
  const count = src.resultCount;

  return normaliseSearchData({
    sender: { name: senderName || (db ? "" : D.sender.name) },
    recipient: { name: recipientName || (db ? "" : D.recipient.name) },
    doodleTitle: pick("doodleTitle", t(src.doodleTitle, L.doodleTitle), D.doodleTitle),
    autocomplete: pick("autocomplete", strings(src.autocomplete, L.maxSuggestions, L.suggestion + 40), D.autocomplete),
    didYouMean: pick("didYouMean", t(src.didYouMean, L.didYouMean + 40), D.didYouMean),
    resultCount: typeof count === "string" && count.trim() ? cap(count.trim(), 24) : typeof count === "number" && Number.isFinite(count) ? String(Math.trunc(count)) : D.resultCount,
    searchSeconds: t(src.searchSeconds, 8) || D.searchSeconds,
    aiOverview: pick("aiOverview", t(src.aiOverview, L.overview + 200), D.aiOverview),
    aiPoints: pick("aiPoints", strings(src.aiPoints, L.maxPoints, L.point + 40), D.aiPoints),
    knowledgePanel: src.knowledgePanel === undefined && !db ? D.knowledgePanel : panelOf(src.knowledgePanel),
    reviews: pick("reviews", rows(src.reviews, toReview, L.maxReviews), D.reviews),
    results: pick("results", rows(src.results, toResult, 12), D.results),
    paa: pick("paa", rows(paa, toPaa, 12), D.paa),
    topStories: pick("topStories", rows(src.topStories, toStory, L.maxStories), D.topStories),
    videos: pick("videos", rows(src.videos, toVideo, L.maxVideos), D.videos),
    places: pick("places", rows(src.places, toPlace, L.maxPlaces), D.places),
    relatedSearches: pick("relatedSearches", strings(src.relatedSearches, 10, L.related + 60), D.relatedSearches),
    photos,
    letter: typeof src.letter === "string" ? src.letter.slice(0, MAX_LETTER_LEN) : db ? "" : D.letter,
    lockQuestion: typeof src.lockQuestion === "string" ? src.lockQuestion.trim().slice(0, MAX_LOCK_QUESTION_LEN) : db ? "" : D.lockQuestion,
    lockAnswer: typeof src.lockAnswer === "string" ? src.lockAnswer.trim().slice(0, MAX_LOCK_ANSWER_LEN) : db ? "" : D.lockAnswer,
  });
}

/**
 * The form is seeded from the demo, so a sender who only types names would
 * publish "Meera" jokes under their own names. Every leaf still naming the
 * demo couple gets the real names.
 */
export function personaliseLeftovers(d: SearchData): SearchData {
  const demoTo = DEMO_DATA.recipient.name;
  const demoToFirst = firstNameOf(demoTo);
  const demoFrom = DEMO_DATA.sender.name;
  const to = d.recipient.name.trim();
  const from = d.sender.name.trim();
  if ((!to || to === demoTo) && (!from || from === demoFrom)) return d;
  const toFirst = firstNameOf(to);
  const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const fix = (s: string): string => {
    if (!s) return s;
    let out = s;
    if (to && to !== demoTo) {
      out = out
        .replace(new RegExp(esc(demoTo), "g"), to)
        .replace(new RegExp(esc(demoTo.toLowerCase()), "g"), to.toLowerCase())
        .replace(new RegExp(esc(demoTo.replace(/\s+/g, "_")), "g"), to.replace(/\s+/g, "_"))
        .replace(new RegExp(`\\b${esc(demoToFirst)}\\b`, "g"), toFirst)
        .replace(new RegExp(`\\b${esc(demoToFirst.toLowerCase())}\\b`, "g"), toFirst.toLowerCase());
    }
    if (from && from !== demoFrom) {
      out = out
        .replace(new RegExp(`\\b${esc(demoFrom)}\\b`, "g"), firstNameOf(from))
        .replace(new RegExp(`\\b${esc(demoFrom.toLowerCase())}\\b`, "g"), firstNameOf(from).toLowerCase());
    }
    return out;
  };
  return {
    ...d,
    doodleTitle: fix(d.doodleTitle),
    autocomplete: d.autocomplete.map(fix),
    didYouMean: fix(d.didYouMean),
    aiOverview: fix(d.aiOverview),
    aiPoints: d.aiPoints.map(fix),
    knowledgePanel: {
      ...d.knowledgePanel,
      subtitle: fix(d.knowledgePanel.subtitle),
      description: fix(d.knowledgePanel.description),
      facts: d.knowledgePanel.facts.map((f) => ({ label: fix(f.label), value: fix(f.value) })),
      alsoSearchFor: d.knowledgePanel.alsoSearchFor.map(fix),
    },
    reviews: d.reviews.map((r) => ({ ...r, author: fix(r.author), text: fix(r.text) })),
    results: d.results.map((r) => ({ ...r, site: fix(r.site), url: fix(r.url), title: fix(r.title), snippet: fix(r.snippet) })),
    paa: d.paa.map((p) => ({ ...p, question: fix(p.question), answer: fix(p.answer), source: p.source ? fix(p.source) : p.source })),
    topStories: d.topStories.map((s) => ({ ...s, title: fix(s.title) })),
    videos: d.videos.map((v) => ({ ...v, title: fix(v.title), channel: fix(v.channel) })),
    places: d.places.map((p) => ({ ...p, note: fix(p.note) })),
    relatedSearches: d.relatedSearches.map(fix),
    photos: d.photos.map((p) => ({ ...p, caption: p.caption ? fix(p.caption) : p.caption, note: p.note ? fix(p.note) : p.note })),
    letter: fix(d.letter),
    lockQuestion: fix(d.lockQuestion),
  };
}
