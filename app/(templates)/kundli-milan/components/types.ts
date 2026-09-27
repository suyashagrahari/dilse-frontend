// ─── Kundli Milan — shared type contract + scoring engine ────────────────────
//
// Single source of truth for the shape shared by the editor, the published
// viewer and the server payload. Field names here === server model field names
// === wire-format keys (flat payload). Keep them in sync.
//
// The scoring engine lives here rather than in a component because determinism
// is the correctness property of this template: the same two birth dates must
// produce a byte-identical report forever. Nothing below may call
// `Math.random()`, `Date.now()`, or read the clock.

import { hash32, seededInt, seededPick, seededPickExcluding, seededUnit } from "@/lib/seededRandom";
import { bodyFromKeys, dotDate, list, num, obj, oneOf, str, strList, strOr, type Raw } from "@/lib/wire";

export type EditMode = null | "manual" | "preview";

export interface Toast {
  id: number;
  type: "success" | "info" | "publish";
  title: string;
  message?: string;
}

// ─── Input ───────────────────────────────────────────────────────────────────

export interface Person {
  name: string;
  /** ISO `YYYY-MM-DD`. Stored as a string so it never shifts across timezones. */
  dob: string;
  /** `HH:mm`, 24h. Empty string = not stated; the engine defaults it to noon. */
  tob: string;
  /** Free text, unvalidated — decorative. */
  pob: string;
}

export type KootaName =
  | "varna" | "vashya" | "tara" | "yoni"
  | "grahaMaitri" | "gana" | "bhakoot" | "nadi";

export interface KundliData {
  groom: Person;
  bride: Person;
  /** ISO `YYYY-MM-DD`. Fixes the report year — never read the clock at render. */
  issuedOn: string;
  /** Sender-written one-liners, overriding the generated reading per koota. */
  customReadings: Partial<Record<KootaName, string>>;
  /** 2-4 items. Rendered verbatim, in order, as the upaya list. */
  remedies: string[];
  /** Invented, comic. Never a real astrologer's name. */
  astrologerName: string;
  /** Their photos, each framed in the editor with an optional little letter. */
  photos: KundliPhoto[];
  /** Up to three GIF links — picked from GIF_LIBRARY or pasted. */
  gifs: string[];
  /** The love letter that opens at the end. */
  letter: string;
}

/** Same shape as the Dedication photo, so its framing tools work unchanged. */
export interface KundliPhoto {
  url: string;
  caption?: string;
  note?: string;
  cropX?: number;
  cropY?: number;
  scale?: number;
}

export const MAX_PHOTOS = 8;
export const MAX_GIFS = 3;
export const MAX_CAPTION_LEN = 60;
export const MAX_NOTE_LEN = 400;
export const MAX_LETTER_LEN = 1500;

const GIF_CDN = "https://cdn.subhsandesh.in/gifts-media";

/** Hand-picked cute GIFs, all hosted on our own CDN so they never disappear. */
export const GIF_LIBRARY: { url: string; label: string }[] = [
  { url: `${GIF_CDN}/assets/court-of-love/penguin-hug.gif`, label: "penguin hug" },
  { url: `${GIF_CDN}/assets/court-of-love/love-this-much.gif`, label: "love you this much" },
  { url: `${GIF_CDN}/assets/court-of-love/aww-bear.gif`, label: "aww" },
  { url: `${GIF_CDN}/assets/court-of-love/hearts.gif`, label: "hearts" },
  { url: `${GIF_CDN}/assets/court-of-love/love-heart.gif`, label: "big heart" },
  { url: `${GIF_CDN}/assets/court-of-love/you-are-amazing.gif`, label: "you're amazing" },
  { url: `${GIF_CDN}/assets/proposal/ask-ring.gif`, label: "the ring" },
  { url: `${GIF_CDN}/assets/proposal/ask-rose.gif`, label: "a rose" },
  { url: `${GIF_CDN}/assets/proposal/ask-bouquet.gif`, label: "bouquet" },
  { url: `${GIF_CDN}/templates/train-ticket/dancing.gif`, label: "happy dance" },
  { url: `${GIF_CDN}/templates/legal-notice/head-pat.gif`, label: "head pat" },
  { url: `${GIF_CDN}/templates/train-ticket/bunnyonatrain.gif`, label: "on my way" },
  { url: `${GIF_CDN}/templates/hold-my-hand/cute-bear-evil-laugh.gif`, label: "evil laugh" },
  { url: `${GIF_CDN}/assets/court-of-love/win-medal.gif`, label: "we won" },
  { url: `${GIF_CDN}/assets/court-of-love/judge-gavel.gif`, label: "approved" },
];

const DEMO_PHOTO_CDN = "https://cdn.subhsandesh.in/gifts-media/assets";

// ─── The eight kootas ────────────────────────────────────────────────────────
// Canonical order and max values. Real Ashtakoota Milan sums to exactly 36 and
// anyone who has seen a report will check the arithmetic.

export const KOOTA_ORDER: KootaName[] = [
  "varna", "vashya", "tara", "yoni", "grahaMaitri", "gana", "bhakoot", "nadi",
];

export const KOOTA_MAX: Record<KootaName, number> = {
  varna: 1, vashya: 2, tara: 3, yoni: 4, grahaMaitri: 5, gana: 6, bhakoot: 7, nadi: 8,
};

export const KOOTA_LABELS: Record<KootaName, { en: string; hi: string; governs: string }> = {
  varna:       { en: "Varna",        hi: "वर्ण",        governs: "spiritual compatibility" },
  vashya:      { en: "Vashya",       hi: "वश्य",        governs: "mutual influence" },
  tara:        { en: "Tara",         hi: "तारा",        governs: "health & wellbeing" },
  yoni:        { en: "Yoni",         hi: "योनि",        governs: "physical compatibility" },
  grahaMaitri: { en: "Graha Maitri", hi: "ग्रह मैत्री", governs: "mental compatibility" },
  gana:        { en: "Gana",         hi: "गण",          governs: "temperament" },
  bhakoot:     { en: "Bhakoot",      hi: "भकूट",        governs: "family welfare" },
  nadi:        { en: "Nadi",         hi: "नाड़ी",        governs: "genetic compatibility" },
};

/** AC-1: the eight maxima must sum to exactly 36. Asserted, not assumed. */
export const KOOTA_TOTAL = KOOTA_ORDER.reduce((s, k) => s + KOOTA_MAX[k], 0);
if (KOOTA_TOTAL !== 36) {
  throw new Error(`Ashtakoota maxima must sum to 36, got ${KOOTA_TOTAL}`);
}

/** Every koota scores at least 60% of its max, rounded up. */
export const KOOTA_FLOOR: Record<KootaName, number> = KOOTA_ORDER.reduce(
  (acc, k) => { acc[k] = Math.ceil(KOOTA_MAX[k] * 0.6); return acc; },
  {} as Record<KootaName, number>,
);

const FLOOR_TOTAL = KOOTA_ORDER.reduce((s, k) => s + KOOTA_FLOOR[k], 0); // 25
const HEADROOM_TOTAL = KOOTA_TOTAL - FLOOR_TOTAL;                        // 11

// ─── Authentic attribute pools ───────────────────────────────────────────────
// These are the real sets. The comedy comes from the source material, not from
// inventing sillier categories.

export const NAKSHATRAS = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu",
  "Pushya", "Ashlesha", "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta",
  "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha", "Mula", "Purva Ashadha",
  "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada",
  "Uttara Bhadrapada", "Revati",
] as const;

export const RASHIS = [
  "Mesha", "Vrishabha", "Mithuna", "Karka", "Simha", "Kanya",
  "Tula", "Vrishchika", "Dhanu", "Makara", "Kumbha", "Meena",
] as const;

/** The 14 yoni animals. This is the funniest row; it is also entirely real. */
export const YONI_ANIMALS = [
  "Horse", "Elephant", "Goat", "Serpent", "Dog", "Cat", "Rat",
  "Cow", "Buffalo", "Tiger", "Deer", "Monkey", "Mongoose", "Lion",
] as const;

export const GANAS = ["Dev", "Manushya", "Rakshasa"] as const;
export const NADIS = ["Aadi", "Madhya", "Antya"] as const;
export const VARNAS = ["Brahmin", "Kshatriya", "Vaishya", "Shudra"] as const;
export const VASHYAS = ["Chatushpad", "Manav", "Jalchar", "Vanchar", "Keet"] as const;

/** Nine grahas, in the abbreviations a printed chart actually uses. */
export const PLANETS = ["Su", "Mo", "Ma", "Me", "Ju", "Ve", "Sa", "Ra", "Ke"] as const;

/**
 * Pairings that read as funny rather than neutral. When the seed lands on a
 * groom animal that has an entry here, the bride is drawn from its list — so
 * "Monkey / Cow" surfaces far more often than chance would give us.
 */
const FUNNY_PARTNERS: Partial<Record<string, readonly string[]>> = {
  Monkey:   ["Cow", "Buffalo", "Elephant"],
  Cat:      ["Rat", "Dog", "Mongoose"],
  Rat:      ["Cat", "Elephant", "Lion"],
  Elephant: ["Goat", "Rat", "Monkey"],
  Dog:      ["Cat", "Deer", "Mongoose"],
  Serpent:  ["Mongoose", "Rat", "Deer"],
  Lion:     ["Goat", "Deer", "Rat"],
  Tiger:    ["Cow", "Deer", "Goat"],
  Cow:      ["Tiger", "Monkey", "Lion"],
  Goat:     ["Lion", "Tiger", "Elephant"],
};

// ─── Computed report ─────────────────────────────────────────────────────────

export type Verdict = "Auspicious" | "Favourable" | "Acceptable";

export interface KootaResult {
  name: KootaName;
  labelEn: string;
  labelHi: string;
  max: number;
  obtained: number;
  groomAttr: string;
  brideAttr: string;
  verdict: Verdict;
  reading: string;
}

/** One person's derived chart particulars. */
export interface ChartData {
  nakshatra: string;
  charan: number;
  rashi: string;
  lagna: string;
  gana: string;
  yoni: string;
  nadi: string;
  varna: string;
  vashya: string;
  /** house number (1-12) -> planet abbreviations sitting in it */
  houses: Record<number, string[]>;
  /** True when the person's time of birth was left blank. */
  timeStated: boolean;
  /** `HH:mm` actually used — the stated time, or 12:00. */
  effectiveTob: string;
}

export interface KundliReport {
  reportNo: string;
  seed: string;
  kootas: KootaResult[];
  total: number;
  /** "Uttam (excellent)" | "Shubh (good)" */
  grade: string;
  groomChart: ChartData;
  brideChart: ChartData;
  conclusion: string;
  /** Always a resolved state. Never renders anyone as afflicted. */
  mangalDosha: string;
}

// ─── Default readings ────────────────────────────────────────────────────────
// Warm and funny, never mystical. Overridable per koota by the sender.

const DEFAULT_READINGS: Record<KootaName, string[]> = {
  varna: [
    "Spiritually aligned. Neither of you has been to a temple in two years, together.",
    "Your souls match. Your grocery lists do not.",
  ],
  vashya: [
    "You have equal influence over each other. Neither of you can pick a restaurant.",
    "Mutual control, perfectly balanced. Nobody is driving.",
  ],
  tara: [
    "Health is favourable. Sleep is not. These are related.",
    "The stars protect your wellbeing. They cannot protect you from 2 AM biryani.",
  ],
  yoni: [
    "You are not the same species. It shows. Continue anyway.",
    "Different species, same sofa. The system permits it.",
    "The animals disagree. You have overruled them before.",
  ],
  grahaMaitri: [
    "Your brains are compatible. Your sleep schedules are not.",
    "Mentally in sync, which is how you both got this wrong at the same time.",
  ],
  gana: [
    "Temperaments differ by exactly one argument per week. Sustainable.",
    "One of you is calm. The stars decline to say which.",
  ],
  bhakoot: [
    "Family welfare is strong. Both families have already picked the venue.",
    "The households will merge smoothly, once the guest list is settled. It will not be.",
  ],
  nadi: [
    "Genetically excellent. Your children will inherit the good hair and the bad jokes.",
    "The strongest koota, carrying the most points, doing the most work. Like one of you.",
  ],
};

// ─── The engine ──────────────────────────────────────────────────────────────

/**
 * Seed excludes names deliberately — a nickname must not change the result.
 * Only the four birth values feed it.
 */
export function kundliSeed(data: KundliData): string {
  const g = `${data.groom.dob}|${effectiveTime(data.groom.tob)}`;
  const b = `${data.bride.dob}|${effectiveTime(data.bride.tob)}`;
  return `${g}|${b}`;
}

const effectiveTime = (tob: string): string => (/^\d{2}:\d{2}$/.test(tob) ? tob : "12:00");

/**
 * Weighted total. Floors at 28, biases hard to 30-34, and lands 36/36 roughly
 * one time in eleven so a perfect score still means something.
 */
const TOTAL_WEIGHTS: [number, number][] = [
  [28, 3], [29, 5], [30, 9], [31, 12], [32, 14], [33, 12], [34, 9], [35, 6], [36, 7],
];

function pickTotal(seed: string): number {
  const sum = TOTAL_WEIGHTS.reduce((s, [, w]) => s + w, 0);
  let roll = Math.floor(seededUnit(seed, "total") * sum);
  for (const [total, w] of TOTAL_WEIGHTS) {
    if (roll < w) return total;
    roll -= w;
  }
  return 32;
}

/** Distribute the points above the floor across the kootas that have headroom. */
function distribute(seed: string, target: number): Record<KootaName, number> {
  const score = { ...KOOTA_FLOOR };
  let extra = Math.max(0, Math.min(HEADROOM_TOTAL, target - FLOOR_TOTAL));
  let guard = 0;
  while (extra > 0 && guard++ < 500) {
    const open = KOOTA_ORDER.filter((k) => score[k] < KOOTA_MAX[k]);
    if (open.length === 0) break;
    const k = open[seededInt(seed, `dist${extra}#${guard}`, 0, open.length - 1)];
    score[k] += 1;
    extra -= 1;
  }
  return score;
}

/** Derive one person's chart. `salt` keeps two people born the same minute distinct. */
function buildChart(seed: string, salt: string, tob: string): ChartData {
  const s = `${seed}|${salt}`;
  const houses: Record<number, string[]> = {};
  for (let h = 1; h <= 12; h++) houses[h] = [];
  PLANETS.forEach((p, i) => {
    const h = seededInt(s, `planet${i}`, 1, 12);
    houses[h].push(p);
  });
  return {
    nakshatra: seededPick(s, "nakshatra", NAKSHATRAS),
    charan: seededInt(s, "charan", 1, 4),
    rashi: seededPick(s, "rashi", RASHIS),
    lagna: seededPick(s, "lagna", RASHIS),
    gana: seededPick(s, "gana", GANAS),
    yoni: seededPick(s, "yoni", YONI_ANIMALS),
    nadi: seededPick(s, "nadi", NADIS),
    varna: seededPick(s, "varna", VARNAS),
    vashya: seededPick(s, "vashya", VASHYAS),
    houses,
    timeStated: /^\d{2}:\d{2}$/.test(tob),
    effectiveTob: effectiveTime(tob),
  };
}

/**
 * The whole report. Pure and deterministic: identical `data` in, identical
 * report out, on every machine and every reload.
 */
export function computeKundliReport(data: KundliData): KundliReport {
  const seed = kundliSeed(data);

  const groomChart = buildChart(seed, "vara", data.groom.tob);
  const brideChart = buildChart(seed, "vadhu", data.bride.tob);

  // The yoni animals must differ, and should prefer a comic pairing.
  const groomYoni = groomChart.yoni;
  const partners = FUNNY_PARTNERS[groomYoni];
  brideChart.yoni = partners && seededUnit(seed, "funnyYoni") < 0.72
    ? seededPick(seed, "funnyPartner", partners)
    : seededPickExcluding(seed, "yoniB", YONI_ANIMALS, groomYoni);

  const total = pickTotal(seed);
  const scores = distribute(seed, total);
  const actualTotal = KOOTA_ORDER.reduce((s, k) => s + scores[k], 0);

  const attrs: Record<KootaName, [string, string]> = {
    varna:       [groomChart.varna, brideChart.varna],
    vashya:      [groomChart.vashya, brideChart.vashya],
    tara:        [groomChart.nakshatra, brideChart.nakshatra],
    yoni:        [groomChart.yoni, brideChart.yoni],
    grahaMaitri: [groomChart.rashi, brideChart.rashi],
    gana:        [groomChart.gana, brideChart.gana],
    bhakoot:     [groomChart.rashi, brideChart.rashi],
    nadi:        [groomChart.nadi, brideChart.nadi],
  };

  const kootas: KootaResult[] = KOOTA_ORDER.map((name) => {
    const max = KOOTA_MAX[name];
    const obtained = scores[name];
    const ratio = obtained / max;
    const verdict: Verdict = ratio >= 0.9 ? "Auspicious" : ratio >= 0.75 ? "Favourable" : "Acceptable";
    const pool = DEFAULT_READINGS[name];
    const custom = data.customReadings?.[name];
    return {
      name,
      labelEn: KOOTA_LABELS[name].en,
      labelHi: KOOTA_LABELS[name].hi,
      max,
      obtained,
      groomAttr: attrs[name][0],
      brideAttr: attrs[name][1],
      verdict,
      reading: custom && custom.trim() ? custom.trim() : seededPick(seed, `read-${name}`, pool),
    };
  });

  const grade = actualTotal >= 32 ? "Uttam (excellent)" : "Shubh (good)";
  const weakest = kootas.reduce((a, b) => (b.obtained / b.max < a.obtained / a.max ? b : a));
  const year = /^(\d{4})-/.exec(data.issuedOn)?.[1] ?? "2026";
  const reportNo = `KM/${year}/${String(hash32(seed) % 10000).padStart(4, "0")}`;

  return {
    reportNo,
    seed,
    kootas,
    total: actualTotal,
    grade,
    groomChart,
    brideChart,
    conclusion:
      `The Ashtakoota Milan yields ${actualTotal} out of 36 gunas, which is classified as ` +
      `${grade}. The union is recommended without reservation. Minor incompatibility in ` +
      `${KOOTA_LABELS[weakest.name].en} Koota is noted and may be safely disregarded.`,
    // Never rendered as present-and-unresolved. Manglik status stalls real
    // marriages; a screenshot declaring someone afflicted can do real damage,
    // and "cancelled" is the funnier line anyway.
    mangalDosha: "Mangal Dosha: present in both charts — mutually cancelled. Convenient.",
  };
}

// ─── Component contract ──────────────────────────────────────────────────────
// The renderer owns the implementation; the flow layer only ever renders this.

export interface KundliMilanTemplateProps {
  data: KundliData;
  mode: "demo" | "live";
  shareId?: string;
  hasPassword?: boolean;
}

// ─── Demo data ───────────────────────────────────────────────────────────────

export const DEMO_DATA: KundliData = {
  groom: { name: "Rohan Mehta",  dob: "1998-03-14", tob: "04:20", pob: "Jaipur, Rajasthan" },
  bride: { name: "Ananya Iyer",  dob: "1999-11-02", tob: "21:45", pob: "Chennai, Tamil Nadu" },
  issuedOn: "2026-02-14",
  customReadings: {},
  remedies: [
    "He shall bring chai without being asked. Sundays.",
    "She shall stop bringing up 14.03.2024.",
    "Both shall sleep before 2 AM. This is the hardest one.",
  ],
  astrologerName: "Pt. Chandrakant Vyas-Sharma",
  photos: [
    { url: `${DEMO_PHOTO_CDN}/couple1.webp`, caption: "the first sunset", note: "You said the sky looked like mango lassi. I have not stopped thinking about it.", cropX: 50, cropY: 45, scale: 100 },
    { url: `${DEMO_PHOTO_CDN}/couple2.webp`, caption: "date night, round 1", note: "You stole my fries and then my heart. In that order.", cropX: 50, cropY: 40, scale: 100 },
    { url: `${DEMO_PHOTO_CDN}/couple3.webp`, caption: "cherry blossom era", note: "Even the trees were jealous of your smile that day.", cropX: 50, cropY: 50, scale: 100 },
    { url: `${DEMO_PHOTO_CDN}/couple4.webp`, caption: "us, forever", note: "Stars say 34/36. My heart says 36/36. Recount requested.", cropX: 50, cropY: 50, scale: 100 },
  ],
  gifs: [
    `${GIF_CDN}/assets/court-of-love/penguin-hug.gif`,
    `${GIF_CDN}/assets/court-of-love/love-this-much.gif`,
    `${GIF_CDN}/templates/train-ticket/dancing.gif`,
  ],
  letter:
    "Ananya,\n\nThe stars gave us a ridiculous score. Honestly, I would have argued for full marks.\n\nI knew it on the auto ride back from Marine Drive, when you fell asleep on my shoulder mid-sentence and I didn't move for forty minutes.\n\nNo kundli needed. Just you, every single day.\n\n— Rohan",
};

// ─── Wire format ─────────────────────────────────────────────────────────────

export const KUNDLI_MILAN_CONTENT_KEYS: (keyof KundliData)[] = [
  "groom", "bride", "issuedOn", "customReadings", "remedies", "astrologerName",
  "photos", "gifs", "letter",
];

export function kundliMilanDataToBody(data: KundliData, password?: string): Record<string, unknown> {
  return bodyFromKeys(data, KUNDLI_MILAN_CONTENT_KEYS, password);
}

const person = (v: unknown, fallback: Person): Person => {
  const src = obj(v);
  return {
    name: str(src.name, fallback.name),
    dob: str(src.dob, fallback.dob),
    tob: strOr(src.tob, fallback.tob),
    pob: str(src.pob, fallback.pob),
  };
};

export function dbToKundliMilanData(db: Raw | null | undefined): KundliData {
  const src = db ?? {};
  const rawReadings = obj(src.customReadings);
  const customReadings: Partial<Record<KootaName, string>> = {};
  for (const k of KOOTA_ORDER) {
    const v = rawReadings[k];
    if (typeof v === "string" && v.trim()) customReadings[k] = v.trim();
  }
  return {
    groom: person(src.groom, DEMO_DATA.groom),
    bride: person(src.bride, DEMO_DATA.bride),
    issuedOn: str(src.issuedOn, DEMO_DATA.issuedOn),
    customReadings,
    remedies: strList(src.remedies, DEMO_DATA.remedies).slice(0, 4),
    astrologerName: str(src.astrologerName, DEMO_DATA.astrologerName),
    photos: Array.isArray(src.photos)
      ? list<KundliPhoto>(src.photos, (o) => {
          const url = str(o.url, "");
          if (!/^(https:\/\/|data:image\/)/.test(url)) return null;
          const p: KundliPhoto = { url };
          const caption = strOr(o.caption, "");
          const note = strOr(o.note, "");
          if (caption) p.caption = caption.slice(0, MAX_CAPTION_LEN);
          if (note) p.note = note.slice(0, MAX_NOTE_LEN);
          for (const k of ["cropX", "cropY", "scale"] as const) {
            const n = Number(o[k]);
            if (Number.isFinite(n)) p[k] = n;
          }
          return p;
        }, []).slice(0, MAX_PHOTOS)
      : DEMO_DATA.photos,
    gifs: Array.isArray(src.gifs)
      ? strList(src.gifs, []).filter((g) => /^https:\/\//.test(g)).slice(0, MAX_GIFS)
      : DEMO_DATA.gifs,
    letter: typeof src.letter === "string" ? src.letter.slice(0, MAX_LETTER_LEN) : DEMO_DATA.letter,
  };
}

// Re-exported so components need only one import for formatting helpers.
export { dotDate, list, num, oneOf };
