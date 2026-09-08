// ─── Rewind — shared type contract + derivation engine ───────────────────────
//
// Single source of truth for the shape shared by the editor, the published
// viewer and the server payload. Field names here === server model field names
// === wire-format keys. Keep them in sync.
//
// CORE DESIGN PRINCIPLE, enforced by this file: the numbers are DERIVED, never
// typed. A year-in-review where the sender types "847 days" into a form is a
// slideshow with big fonts — the surprise is gone before it starts. Everything
// time-shaped on the screen comes out of `deriveStats()` below, from one date.
// The archetype comes out of `computeArchetype()`, from the answers. Neither is
// an input field, and there is deliberately no `daysTogether` in `RewindData`.
//
// BRAND SAFETY, not a preference: this reproduces the LAYOUT CONVENTIONS of a
// year-in-review story — vertical slides, tap to advance, progress segments,
// one huge stat per slide, kinetic type, hard colour cuts. Those are a genre.
// It reproduces no one's identity: not the three-arc mark, not the green, and
// neither the incumbent's name nor its year-in-review wordmark appears anywhere
// in this template — including the product name, because that second mark is
// held for exactly this context. This one is called Rewind.

import { bodyFromKeys, str, strList, strOr, type Raw } from "@/lib/wire";
import { hash32 } from "@/lib/seededRandom";

export type EditMode = null | "manual" | "preview";

export interface Toast {
  id: number;
  type: "success" | "info" | "publish";
  title: string;
  message?: string;
}

export interface Stat {
  key: string;
  label: string;
  value: string;
  sub: string;
}

export interface RewindData {
  senderName: string;
  senderPhotoUrl: string;
  recipientName: string;
  recipientPhotoUrl: string;
  /** ISO date. EVERY time-based stat on screen derives from this one field. */
  startDate: string;
  songTitle: string;
  songArtist: string;
  /** "" skips the song slide entirely rather than rendering a placeholder. */
  audioUrl: string;
  /** Up to 5. The ranked list — the highest-screenshot slide in the deck. */
  topReasons: string[];
  /** Sender-authored jokes. Not time-derived; these are the ones they write. */
  stats: Stat[];
  /** Keyed by question id. Drives the archetype. */
  answers: Record<string, string>;
  photos: string[];
  closingLine: string;
}

// ─── Slide mechanics ─────────────────────────────────────────────────────────

export const SLIDE = {
  defaultMs: 4500,
  textHeavyMs: 7000,
  /** The ranked list gets the longest hold — it is what people screenshot. */
  listMs: 8000,
  beatMs: 2000,
  /** Rapid tapping must never skip two. */
  inputLockMs: 300,
  /** Tap zones. Left 30% goes back, right 70% goes forward. */
  backZoneFraction: 0.3,
  countUpMs: 1400,
  wordStaggerMs: 80,
  rowStaggerMs: 220,
} as const;

/** Deceleration curve for every count-up and every entrance. */
export const EASE_OUT_EXPO = "cubic-bezier(0.16, 1, 0.3, 1)";

// ─── Derivation ──────────────────────────────────────────────────────────────
//
// Festival dates are a lookup rather than a computation: Diwali and Holi follow
// the lunisolar calendar and cannot be derived from a Gregorian date without an
// ephemeris, which this template is explicitly not allowed to pull in. A table
// of real dates is smaller, exact, and honest about its horizon.

const DIWALI: string[] = [
  "2019-10-27", "2020-11-14", "2021-11-04", "2022-10-24", "2023-11-12",
  "2024-11-01", "2025-10-20", "2026-11-08", "2027-10-29", "2028-10-17",
  "2029-11-05", "2030-10-26",
];

const HOLI: string[] = [
  "2019-03-21", "2020-03-10", "2021-03-29", "2022-03-18", "2023-03-08",
  "2024-03-25", "2025-03-14", "2026-03-04", "2027-03-22", "2028-03-11",
  "2029-03-01", "2030-03-20",
];

const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export interface DerivedStats {
  /** True when the relationship is under 30 days old — the copy changes. */
  isEarly: boolean;
  /** True when startDate is in the future. The editor surfaces this inline. */
  isFuture: boolean;
  days: number;
  weeks: number;
  months: number;
  hours: number;
  /** "14 March" */
  startDateLabel: string;
  /** "Tuesday" — real, specific, and it always lands. */
  startWeekday: string;
  /** Dec–Feb boundaries crossed together. */
  winters: number;
  monsoons: number;
  diwalis: number;
  holis: number;
  /** Share of the current calendar year they have been together, 0-100. */
  yearPercent: number;
  /** Ready-made copy for the time-breakdown slide. Already handles the early case. */
  breakdown: string;
}

function countFestivals(table: string[], startMs: number, nowMs: number): number {
  return table.filter((d) => {
    const t = Date.parse(`${d}T12:00:00Z`);
    return !Number.isNaN(t) && t >= startMs && t <= nowMs;
  }).length;
}

/** Dec, Jan, Feb spans crossed. Counting month boundaries, not calendar years. */
function countSeason(startMs: number, nowMs: number, months: number[]): number {
  if (nowMs <= startMs) return 0;
  const seen = new Set<string>();
  const cur = new Date(startMs);
  cur.setUTCDate(1);
  while (cur.getTime() <= nowMs) {
    const m = cur.getUTCMonth();
    if (months.includes(m)) {
      // Dec of year Y and Jan/Feb of Y+1 are the same winter.
      const seasonYear = m === 11 ? cur.getUTCFullYear() : cur.getUTCFullYear() - (months[0] === 11 ? 1 : 0);
      seen.add(String(seasonYear));
    }
    cur.setUTCMonth(cur.getUTCMonth() + 1);
  }
  return seen.size;
}

export function deriveStats(startDate: string, nowMs: number = Date.now()): DerivedStats {
  const startMs = Date.parse(startDate);
  const valid = !Number.isNaN(startMs);
  const start = valid ? new Date(startMs) : new Date(nowMs);
  const isFuture = valid && startMs > nowMs;

  const elapsed = Math.max(0, nowMs - (valid ? startMs : nowMs));
  const days = Math.floor(elapsed / 86_400_000);
  const hours = Math.floor(elapsed / 3_600_000);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30.44);

  const winters = countSeason(startMs, nowMs, [11, 0, 1]);
  const monsoons = countSeason(startMs, nowMs, [6, 7, 8]);
  const diwalis = valid ? countFestivals(DIWALI, startMs, nowMs) : 0;
  const holis = valid ? countFestivals(HOLI, startMs, nowMs) : 0;

  const yearStart = Date.UTC(new Date(nowMs).getUTCFullYear(), 0, 1);
  const yearMs = nowMs - yearStart;
  const inYear = Math.max(0, nowMs - Math.max(startMs, yearStart));
  const yearPercent = yearMs > 0 ? Math.round((inYear / yearMs) * 100) : 0;

  const isEarly = valid && !isFuture && days < 30;

  const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
  const bits: string[] = [];
  if (winters > 0) bits.push(plural(winters, "winter"));
  if (diwalis > 0) bits.push(plural(diwalis, "Diwali", "Diwalis"));
  if (holis > 0 && bits.length < 3) bits.push(plural(holis, "Holi", "Holis"));
  if (monsoons > 0 && bits.length < 3) bits.push(plural(monsoons, "monsoon"));

  // "0 winters" is never shown. A three-week-old relationship gets its own line
  // rather than a table of zeroes.
  const breakdown = isEarly
    ? "it's early. that's the good part."
    : bits.length
      ? `that's ${hours.toLocaleString("en-IN")} hours. ${bits.join(". ")}.`
      : `that's ${hours.toLocaleString("en-IN")} hours.`;

  return {
    isEarly,
    isFuture,
    days,
    weeks,
    months,
    hours,
    startDateLabel: `${start.getUTCDate()} ${MONTHS[start.getUTCMonth()]}`,
    startWeekday: WEEKDAYS[start.getUTCDay()],
    winters,
    monsoons,
    diwalis,
    holis,
    yearPercent,
    breakdown,
  };
}

// ─── Archetype ───────────────────────────────────────────────────────────────
//
// The payoff slide. Real year-in-review formats end on a personality because a
// verdict is more screenshot-worthy than a fact — this ends on a relationship
// archetype computed from the answers, so two couples who fill the same form
// differently get different endings.
//
// Every archetype is affectionate. There is no bad outcome, and nothing here
// may read as a real negative judgement about two actual people.

export interface Archetype {
  id: string;
  /** ≤ 24 characters so it cannot overflow at 380px. Enforced by the test below. */
  name: string;
  line: string;
  /** Full-bleed background for the reveal slide. */
  bg: string;
}

export const ARCHETYPES: Archetype[] = [
  { id: "overthinkers", name: "THE 3 AM OVERTHINKERS", line: "Neither of you has ever ended a conversation. You've only ever paused one.", bg: "#1B2A6B" },
  { id: "feeders",      name: "THE FEEDERS",           line: "Every problem you've ever had was solved by one of you saying 'have you eaten'.", bg: "#C4451C" },
  { id: "competitors",  name: "THE SILENT COMPETITORS", line: "Nobody has declared a competition. Both of you are definitely winning it.", bg: "#0F5132" },
  { id: "slowburn",     name: "THE SLOW BURN",          line: "Took you both an embarrassingly long time. Worth every month of it.", bg: "#7A1F4B" },
  { id: "chaos",        name: "THE CHAOS COORDINATORS", line: "No plan survives either of you. Somehow you always end up in the right place.", bg: "#B8860B" },
  { id: "repliers",     name: "THE 90-MINUTE REPLIERS", line: "Two people who reply in ninety minutes and then send eleven messages.", bg: "#4B2E83" },
  { id: "homebodies",   name: "THE HOMEBODIES",         line: "You cancelled the plans. You were always going to cancel the plans.", bg: "#2A4C3F" },
  { id: "documentarians", name: "THE DOCUMENTARIANS",   line: "There is photographic evidence of everything, and all of it is blurry.", bg: "#8A2E2E" },
  { id: "translators",  name: "THE TRANSLATORS",        line: "Neither of you says the thing. Both of you hear it anyway.", bg: "#1F4E5F" },
  { id: "loudones",     name: "THE LOUD ONES",          line: "Everyone in a ten-metre radius knows exactly how you feel about each other.", bg: "#A8327D" },
];

export interface Question {
  id: string;
  prompt: string;
  options: { value: string; label: string; weights: Record<string, number> }[];
}

/**
 * Six questions, each option weighting two or three archetypes. Deliberately
 * overlapping — an option that maps 1:1 to an outcome makes the result feel
 * chosen rather than computed.
 */
export const QUESTIONS: Question[] = [
  {
    id: "argue",
    prompt: "When you argue, what actually happens?",
    options: [
      { value: "talk", label: "We talk it to death at 2 AM", weights: { overthinkers: 3, translators: 1 } },
      { value: "feed", label: "One of us makes food", weights: { feeders: 3, homebodies: 1 } },
      { value: "silence", label: "Nobody says anything for six hours", weights: { competitors: 3, translators: 2 } },
      { value: "loud", label: "Loudly, and then it's over", weights: { loudones: 3, chaos: 1 } },
    ],
  },
  {
    id: "reply",
    prompt: "How fast do you reply to each other?",
    options: [
      { value: "instant", label: "Instantly. Always.", weights: { loudones: 2, overthinkers: 1 } },
      { value: "slow", label: "Ninety minutes, then a novel", weights: { repliers: 3, overthinkers: 1 } },
      { value: "voice", label: "Eleven-minute voice notes", weights: { repliers: 2, documentarians: 2 } },
      { value: "unread", label: "Left on read, then a phone call", weights: { chaos: 2, translators: 2 } },
    ],
  },
  {
    id: "plans",
    prompt: "What happens to your plans?",
    options: [
      { value: "cancel", label: "We cancel and stay in", weights: { homebodies: 3, feeders: 1 } },
      { value: "chaos", label: "They change four times", weights: { chaos: 3, loudones: 1 } },
      { value: "spread", label: "Planned to the minute", weights: { competitors: 2, documentarians: 1 } },
      { value: "drift", label: "We just start walking", weights: { slowburn: 2, translators: 1 } },
    ],
  },
  {
    id: "start",
    prompt: "How did this start?",
    options: [
      { value: "slow", label: "Slowly. Painfully slowly.", weights: { slowburn: 3, overthinkers: 1 } },
      { value: "fast", label: "Immediately, and everyone knew", weights: { loudones: 3, documentarians: 1 } },
      { value: "friends", label: "We were friends for years", weights: { slowburn: 2, translators: 2 } },
      { value: "chaos", label: "Nobody can agree on the story", weights: { chaos: 2, documentarians: 2 } },
    ],
  },
  {
    id: "love",
    prompt: "How do you say I love you without saying it?",
    options: [
      { value: "food", label: "'Have you eaten'", weights: { feeders: 3, translators: 1 } },
      { value: "photo", label: "Sending a photo of nothing", weights: { documentarians: 3, repliers: 1 } },
      { value: "wait", label: "Waiting outside in the rain", weights: { slowburn: 2, homebodies: 1 } },
      { value: "argue", label: "Arguing about something pointless", weights: { competitors: 3, loudones: 1 } },
    ],
  },
  {
    id: "weekend",
    prompt: "A perfect Saturday is…",
    options: [
      { value: "home", label: "Neither of us leaves the house", weights: { homebodies: 3, feeders: 2 } },
      { value: "out", label: "Six places, no plan", weights: { chaos: 3, loudones: 1 } },
      { value: "talk", label: "One long conversation", weights: { overthinkers: 2, translators: 2 } },
      { value: "photo", label: "Four hundred photos", weights: { documentarians: 3, competitors: 1 } },
    ],
  },
];

/**
 * Deterministic: the same answers always produce the same archetype.
 *
 * Ties are broken by a hash of the start date rather than by array order, so a
 * couple with a perfectly balanced answer set still gets a stable result
 * instead of whichever archetype happened to be declared first.
 */
export function computeArchetype(answers: Record<string, string>, startDate: string): Archetype {
  const score = new Map<string, number>();
  for (const a of ARCHETYPES) score.set(a.id, 0);

  for (const q of QUESTIONS) {
    const chosen = answers[q.id];
    const opt = q.options.find((o) => o.value === chosen);
    if (!opt) continue;
    for (const [id, w] of Object.entries(opt.weights)) {
      score.set(id, (score.get(id) ?? 0) + w);
    }
  }

  const max = Math.max(...ARCHETYPES.map((a) => score.get(a.id) ?? 0));
  const leaders = ARCHETYPES.filter((a) => (score.get(a.id) ?? 0) === max);
  if (leaders.length === 1) return leaders[0];

  // No answers at all, or a genuine tie. Stable, and never the same for two
  // different couples who happened to skip the questions.
  const seed = hash32(`archetype:${startDate}:${JSON.stringify(answers)}`);
  return leaders[seed % leaders.length];
}

/** Every archetype name must fit at 380px. Verified rather than assumed. */
export const ARCHETYPE_NAME_MAX = 24;
export const oversizedArchetypeNames = (): string[] =>
  ARCHETYPES.filter((a) => a.name.length > ARCHETYPE_NAME_MAX).map((a) => a.name);

// ─── Colour ──────────────────────────────────────────────────────────────────

/**
 * Bold, flat, high-saturation. No gradients — the abrupt cut between two
 * saturated backgrounds is the entire visual signature of this format, and it
 * feels wrong while you are building it. Do not soften it into a cross-fade.
 *
 * `hue` groups them into families so `assignBackgrounds()` can guarantee no two
 * adjacent slides share one.
 */
export const PALETTE: { bg: string; hue: string }[] = [
  { bg: "#0E0E12", hue: "ink" },
  { bg: "#F72585", hue: "pink" },
  { bg: "#6C5CE7", hue: "indigo" },
  { bg: "#C6FF3D", hue: "lime" },
  { bg: "#FF6B35", hue: "orange" },
  { bg: "#00B4A6", hue: "teal" },
  { bg: "#FFB020", hue: "amber" },
  { bg: "#3A0CA3", hue: "violet" },
  { bg: "#E5383B", hue: "red" },
  { bg: "#1B4332", hue: "green" },
  { bg: "#F2E8CF", hue: "cream" },
  { bg: "#4361EE", hue: "blue" },
];

/** Never repeats a hue family on consecutive slides. Deterministic. */
export function assignBackgrounds(count: number, seed: string): string[] {
  const out: string[] = [];
  let lastHue = "";
  let cursor = hash32(`bg:${seed}`) % PALETTE.length;
  for (let i = 0; i < count; i++) {
    let guard = 0;
    while (PALETTE[cursor % PALETTE.length].hue === lastHue && guard++ < PALETTE.length) {
      cursor += 1;
    }
    const pick = PALETTE[cursor % PALETTE.length];
    out.push(pick.bg);
    lastHue = pick.hue;
    // A stride that is coprime with the palette length walks the whole set
    // before repeating, so a long deck does not oscillate between two colours.
    cursor += 5;
  }
  return out;
}

const srgbToLinear = (c: number): number =>
  c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

export function relativeLuminance(hex: string): number {
  const h = hex.replace("#", "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  return 0.2126 * srgbToLinear(r) + 0.7152 * srgbToLinear(g) + 0.0722 * srgbToLinear(b);
}

export const NEAR_BLACK = "#0E0E12";
export const NEAR_WHITE = "#FFFFFF";

export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

/** Computed, never hardcoded — a hand-picked pair fails the moment a bg changes. */
export function textOn(bg: string): string {
  return contrastRatio(NEAR_WHITE, bg) >= contrastRatio(NEAR_BLACK, bg) ? NEAR_WHITE : NEAR_BLACK;
}

// ─── Component contract ──────────────────────────────────────────────────────

export interface RewindTemplateProps {
  data: RewindData;
  mode: "demo" | "live";
  shareId?: string;
  hasPassword?: boolean;
}

// ─── Demo data ───────────────────────────────────────────────────────────────

function demoStart(): string {
  // ~2 years and 4 months back, so every derived stat has something to say.
  const d = new Date(Date.now() - 847 * 86_400_000);
  return d.toISOString().slice(0, 10);
}

export const DEMO_DATA: RewindData = {
  senderName: "Rohan",
  senderPhotoUrl: "",
  recipientName: "Aditi",
  recipientPhotoUrl: "",
  startDate: demoStart(),
  songTitle: "the one you played twice",
  songArtist: "in the auto, both times",
  audioUrl: "",
  topReasons: [
    "You hand me the left earbud without looking",
    "You laugh half a second before the punchline",
    "You have never once made me feel like too much",
    "You fed a street dog one biscuit and adopted a responsibility",
    "You stop at page forty of every book and I find them everywhere",
  ],
  stats: [
    { key: "fine", label: "times you said", value: "47", sub: "\"I'm fine.\" You were fine twice." },
    { key: "chai", label: "cups of chai abandoned", value: "112", sub: "on every surface in the house" },
    { key: "voice", label: "longest voice note", value: "11:42", sub: "no summary was provided" },
  ],
  answers: {
    argue: "silence",
    reply: "slow",
    plans: "cancel",
    start: "friends",
    love: "food",
    weekend: "talk",
  },
  photos: [],
  closingLine: "Same time next year.",
};

// ─── Wire format ─────────────────────────────────────────────────────────────

export const REWIND_CONTENT_KEYS: (keyof RewindData)[] = [
  "senderName", "senderPhotoUrl", "recipientName", "recipientPhotoUrl",
  "startDate", "songTitle", "songArtist", "audioUrl", "topReasons", "stats",
  "answers", "photos", "closingLine",
];

export function rewindDataToBody(data: RewindData, password?: string): Record<string, unknown> {
  return bodyFromKeys(data, REWIND_CONTENT_KEYS, password);
}

export function dbToRewindData(db: Raw | null | undefined): RewindData {
  const src = db ?? {};

  const rawStats = Array.isArray(src.stats) ? src.stats : [];
  const stats: Stat[] = rawStats
    .map((v) => (v && typeof v === "object" ? (v as Raw) : {}))
    .map((o, i) => ({
      key: str(o.key, `s${i + 1}`),
      label: strOr(o.label, ""),
      value: strOr(o.value, ""),
      sub: strOr(o.sub, ""),
    }))
    .filter((s) => s.value || s.label)
    .slice(0, 6);

  const rawAnswers = src.answers && typeof src.answers === "object" ? (src.answers as Raw) : {};
  const answers: Record<string, string> = {};
  for (const q of QUESTIONS) {
    const v = rawAnswers[q.id];
    if (typeof v === "string" && q.options.some((o) => o.value === v)) answers[q.id] = v;
  }

  return {
    senderName: str(src.senderName, DEMO_DATA.senderName),
    senderPhotoUrl: strOr(src.senderPhotoUrl, ""),
    recipientName: str(src.recipientName, DEMO_DATA.recipientName),
    recipientPhotoUrl: strOr(src.recipientPhotoUrl, ""),
    startDate: str(src.startDate, DEMO_DATA.startDate),
    songTitle: strOr(src.songTitle, ""),
    songArtist: strOr(src.songArtist, ""),
    audioUrl: strOr(src.audioUrl, ""),
    topReasons: strList(src.topReasons, DEMO_DATA.topReasons).slice(0, 5),
    stats: stats.length ? stats : DEMO_DATA.stats,
    answers: Object.keys(answers).length ? answers : DEMO_DATA.answers,
    photos: strList(src.photos, []).slice(0, 8),
    closingLine: str(src.closingLine, DEMO_DATA.closingLine),
  };
}
