// Pure helpers for "Our Film": read the extras defensively, split the letter into chapters, date maths.

import type { ValentineDayData } from "../../../_valentine/types";

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");
const list = (v: unknown) => (Array.isArray(v) ? v.map((s) => (typeof s === "string" ? s.trim() : "")) : []);

export const DEFAULT_TAKES = [
  "CUT! Take 2. With feeling this time.",
  "Take 3. The director is very patient.",
  "Take 4. We have all night.",
  "Take 5. Craft services is out of snacks.",
];
export const DEFAULT_CHAPTERS = ["Then", "Now", "Always"];

export interface Film {
  to: string;
  from: string;
  star: string;
  title: string;
  tagline: string;
  week: { day: string; line: string }[];
  metPlace: string;
  metDate: Date | null;
  since: Date | null;
  chapters: string[];
  stats: { label: string; value: string }[];
  question: string;
  takes: string[];
  datePlan: string;
  dateOn: string;
}

const WEEK = ["Rose Day", "Propose Day", "Chocolate Day", "Teddy Day", "Promise Day", "Hug Day", "Kiss Day"];
const WEEK_EMOJI = ["🌹", "💍", "🍫", "🧸", "🤞", "🤗", "💋"];

export function parseDate(s: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return Number.isFinite(d.getTime()) && d.getTime() <= Date.now() + 864e5 ? d : null;
}

export function readFilm(data: ValentineDayData): Film {
  const x = (data.extras ?? {}) as Record<string, unknown>;
  const to = data.recipientName.trim() || "you";
  const from = data.senderName.trim() || "Someone";
  const week = list(x.weekLines)
    .slice(0, 7)
    .map((line, i) => ({ day: `${WEEK[i]} ${WEEK_EMOJI[i]}`, line }))
    .filter((w) => w.line);
  const stats = (Array.isArray(x.stats) ? x.stats : [])
    .filter((s): s is Record<string, unknown> => !!s && typeof s === "object")
    .map((s) => ({ label: str(s.label), value: str(s.value) }))
    .filter((s) => s.label && s.value)
    .slice(0, 3);
  const chapters = list(x.chapterTitles).slice(0, 3);
  const takes = list(x.noTakes).filter(Boolean).slice(0, 6);
  return {
    to,
    from,
    star: data.petName.trim() || to,
    title: str(x.filmTitle) || `${to} & ${from}`,
    tagline: str(x.tagline),
    week,
    metPlace: str(x.metPlace),
    metDate: parseDate(str(x.metDate)),
    since: parseDate(str(x.togetherSince)),
    chapters: [0, 1, 2].map((i) => chapters[i] || DEFAULT_CHAPTERS[i]),
    stats,
    question: str(x.question) || "Will you be my Valentine… for every sequel?",
    takes: takes.length >= 2 ? takes : DEFAULT_TAKES,
    datePlan: str(x.datePlan),
    dateOn: str(x.dateOn),
  };
}

/** First letter of a name (grapheme-safe enough for names), upper-cased. */
export const initial = (s: string) => (Array.from(s.trim())[0] ?? "♥").toUpperCase();

/** "9 August 2021" */
export const longDate = (d: Date) => d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

/**
 * The letter as three chapters: split at lines of "---" when the sender wrote them, else by paragraph
 * balance (character count), else by sentences. Never loses text.
 */
export function splitLetter(letter: string): string[] {
  const text = letter.replace(/\r\n?/g, "\n").trim();
  if (!text) return ["", "", ""];
  const byRule = text.split(/\n\s*-{3,}\s*\n?/).map((s) => s.trim()).filter(Boolean);
  if (byRule.length >= 3) return [byRule[0], byRule[1], byRule.slice(2).join("\n\n")];
  if (byRule.length === 2) {
    const [a, b] = byRule;
    const [b1, b2] = halve(b);
    if (b2) return [a, b1, b2];
    const [a1, a2] = halve(a);
    if (a2) return [a1, a2, b];
    return [a, b, ""];
  }
  const paras = text.split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  // A salutation on its own ("Mehu,") rides with the first paragraph, never alone on a page.
  if (paras.length >= 2 && /^[^\n]{1,40}[,!]$/.test(paras[0])) paras.splice(0, 2, `${paras[0]}\n${paras[1]}`);
  if (paras.length >= 3) return balance(paras, "\n\n", 3);
  if (paras.length === 2) return [paras[0], paras[1], ""];
  const sentences = text.match(/[^.!?…]+[.!?…]+["”']?\s*|[^.!?…]+$/g)?.map((s) => s.trim()).filter(Boolean) ?? [text];
  if (sentences.length >= 3) return balance(sentences, " ", 3);
  return [text, "", ""];
}

function halve(s: string): [string, string] {
  const paras = s.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  if (paras.length < 2) return [s, ""];
  const [a, b] = balance(paras, "\n\n", 2);
  return [a, b];
}

/** Cut `parts` into n non-empty runs whose lengths are as even as possible (brute force; letters are short). */
function balance(parts: string[], join: string, n: 2 | 3): string[] {
  const len = parts.map((p) => p.length);
  const sum = (a: number, b: number) => len.slice(a, b).reduce((x, y) => x + y, 0);
  const m = parts.length;
  let best: number[] = [];
  let score = Infinity;
  for (let i = 1; i < m; i++) {
    if (n === 2) {
      const sc = Math.abs(sum(0, i) - sum(i, m));
      if (sc < score) { score = sc; best = [i]; }
      continue;
    }
    for (let j = i + 1; j < m; j++) {
      const c = [sum(0, i), sum(i, j), sum(j, m)];
      const sc = Math.max(...c) - Math.min(...c);
      if (sc < score) { score = sc; best = [i, j]; }
    }
  }
  const cuts = [0, ...best, m];
  return cuts.slice(0, -1).map((c, k) => parts.slice(c, cuts[k + 1]).join(join));
}

/** Whole days between two dates (local midnights). */
export const daysBetween = (a: Date, b: Date) => Math.max(0, Math.floor((b.getTime() - a.getTime()) / 864e5));

/** How many 14 Februarys fall in [since, now]. */
export function valentinesBetween(since: Date, now: Date): number {
  let n = 0;
  for (let y = since.getFullYear(); y <= now.getFullYear(); y++) {
    const v = new Date(y, 1, 14);
    if (v >= since && v <= now) n++;
  }
  return n;
}

/** Best-effort start time for the calendar file: "8 PM", "8:30pm", "20:00" in the plan, else 19:00. */
export function planStart(dateOn: string, plan: string): string | null {
  const d = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateOn);
  if (!d) return null;
  let h = 19;
  let m = 0;
  const ampm = /\b(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)/i.exec(plan);
  const h24 = /\b([01]?\d|2[0-3])[:.]([0-5]\d)\b/.exec(plan);
  if (ampm) {
    h = Number(ampm[1]) % 12 + (/p/i.test(ampm[3]) ? 12 : 0);
    m = Number(ampm[2] ?? 0);
  } else if (h24) {
    h = Number(h24[1]);
    m = Number(h24[2]);
  }
  const start = new Date(Number(d[1]), Number(d[2]) - 1, Number(d[3]), h, m);
  return Number.isFinite(start.getTime()) ? start.toISOString() : null;
}

/** A small deterministic PRNG so each couple's sky and camera moves are their own (and stable on replay). */
export function seeded(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return () => {
    h += 0x6d2b79f5;
    let t = h;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * The book signs the last page with "— {sender}" itself, so a letter that ends with its own sign-off ("Kabir",
 * "Love,\nKabir", "Yours always,") would be signed twice: drop those trailing lines.
 */
export function stripSignOff(letter: string, from: string): string {
  const lines = letter.replace(/\s+$/, "").split("\n");
  const name = from.trim().toLowerCase();
  const isName = (l: string) => !!name && l.replace(/^[\s—–-]+/, "").replace(/[.!,\s]+$/, "").toLowerCase() === name;
  const isClosing = (l: string) => /^(with )?(all (of )?)?(my )?(love|yours|forever yours|yours always|always yours|always|lots of love|xoxo|forever)[,.!\s]*$/i.test(l.trim());
  let n = 0;
  while (lines.length > 1 && n < 2) {
    const last = lines[lines.length - 1];
    if (!last.trim()) { lines.pop(); continue; }
    if (isName(last) || isClosing(last)) { lines.pop(); n++; continue; }
    break;
  }
  return lines.join("\n").trim();
}

export const fmt = (n: number) => Math.round(n).toLocaleString("en-IN");
