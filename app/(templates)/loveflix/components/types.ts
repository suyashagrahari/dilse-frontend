// ─── LoveFlix — shared type contract ─────────────────────────────────────────
//
// Single source of truth for the shape shared by the editor, the published
// viewer and the server payload. Field names here === server model field names
// === wire-format keys. Keep them in sync with
// server/src/models/LoveflixPage.ts and server/src/config/aiFill/loveflix.ts.
//
// The template reproduces the LAYOUT GRAMMAR of a streaming service (profile
// picker, billboard, rails, Top 10 numerals, details modal, player) and nobody's
// identity: the mark is a parody "L", the wordmark is ours, and the red is a
// rose red, never the incumbent's. `assertBrandSafe()` checks the data.
//
// v2 (premium): the catalogue is fixed-shape — episodes, a Top 10 of reasons,
// inside jokes, coming-soon plans — so the form stays small and the AI can fill
// every text leaf. Pages saved by v1 (free-form `rows` + a branching `scenes`
// graph) are mapped onto this shape in `dbToLoveflixData`.

import { clampNum, list, obj, str, strOr, type Raw } from "@/lib/wire";

export type EditMode = null | "manual" | "preview";

// ─── Palette ─────────────────────────────────────────────────────────────────

/** Rose red. Warm enough to read as romance, far enough from the incumbent's red. */
export const ACCENT = "#E62E5C";
export const ACCENT_DEEP = "#B3173F";
export const MATCH_GREEN = "#46D369";
export const BG = "#141414";
export const BG_RAISED = "#181818";
export const BG_CARD = "#232323";
export const TEXT = "#FFFFFF";
export const TEXT_DIM = "#BCBCBC";
export const TEXT_MUTED = "#808080";

export const WORDMARK = "LOVEFLIX";

// ─── Crop ────────────────────────────────────────────────────────────────────

/** Focal point (0–100 each axis) and zoom (100–300 %). Same rule as Dedication. */
export interface Crop {
  x: number;
  y: number;
  scale: number;
}

export const CROP_CENTER: Crop = { x: 50, y: 50, scale: 100 };

export const toCrop = (v: unknown, fallback: Crop = CROP_CENTER): Crop => {
  const o = obj(v);
  return {
    x: clampNum(o.x, fallback.x, 0, 100),
    y: clampNum(o.y, fallback.y, 0, 100),
    scale: clampNum(o.scale, fallback.scale, 100, 300),
  };
};

// ─── Data ────────────────────────────────────────────────────────────────────

export interface Episode {
  title: string;
  /** Catalogue voice, shown in the episode list and on the hover card. */
  synopsis: string;
  /** What plays as subtitles in the player. One or more short lines. */
  subtitle: string;
  imageUrl: string;
  crop: Crop;
}

export interface LoveflixData {
  recipientName: string;
  recipientPhotoUrl: string;
  recipientCrop: Crop;
  senderName: string;
  senderPhotoUrl: string;
  senderCrop: Crop;
  /** The third, locked tile on the profile picker ("Our future cat"). */
  thirdProfile: string;

  showTitle: string;
  tagline: string;
  heroImageUrl: string;
  heroCrop: Crop;
  /** "99% Match". */
  matchPercent: number;
  /** Short maturity badge: "18+", "U/A 16+". */
  rating: string;
  /** Content descriptors shown with the badge: "forehead kisses, 2 AM calls". */
  ratingReason: string;
  seasons: string;
  metYear: string;
  genres: string[];

  episodes: Episode[];
  /** The Top 10. */
  reasons: string[];
  /** "Critically Acclaimed Inside Jokes". */
  insideJokes: string[];
  /** "Coming Soon" — plans. */
  plans: string[];

  finaleText: string;
  finaleQuestion: string;

  letter: string;
  lockQuestion: string;
  lockAnswer: string;
}

// ─── Limits (mirror the server) ──────────────────────────────────────────────

export const LIMITS = {
  name: 40,
  showTitle: 40,
  tagline: 220,
  rating: 12,
  ratingReason: 90,
  seasons: 24,
  metYear: 4,
  genre: 24,
  genres: 4,
  episodes: 6,
  epTitle: 48,
  synopsis: 200,
  subtitle: 320,
  reasons: 10,
  reason: 80,
  jokes: 8,
  joke: 70,
  plans: 6,
  plan: 70,
  finaleText: 800,
  finaleQuestion: 40,
  letter: 2000,
  lockQuestion: 140,
  lockAnswer: 40,
} as const;

// ─── Player timing ───────────────────────────────────────────────────────────

export const PLAYER = {
  /** The maturity card that shows at the start of playback. */
  ratingCardMs: 4200,
  /** The "intro" of an episode — Skip Intro is offered during it. */
  introMs: 5200,
  /** Per subtitle line. */
  lineMs: 3600,
  /** After the last line, before the next-episode card. */
  tailMs: 2200,
  autoplayNextSeconds: 6,
  /** "Are you still watching?" fires after this many episodes in a row. */
  stillWatchingAfter: 3,
} as const;

/** Stable fake runtime (minutes) for an episode — derived, never stored. */
export const runtimeOf = (title: string, i: number): number => {
  let h = 7;
  for (const ch of title) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return 18 + ((h + i * 13) % 34);
};

/** Stable fake "continue watching" progress, 0-100. */
export const progressOf = (title: string, i: number): number => {
  let h = 3;
  for (const ch of title) h = (h * 17 + ch.charCodeAt(0)) >>> 0;
  return 22 + ((h + i * 29) % 66);
};

// ─── Brand safety ────────────────────────────────────────────────────────────

export function assertBrandSafe(data: LoveflixData): string[] {
  const banned = [/netflix/i, /#e50914/i, /\be5\s*09\s*14\b/i];
  const haystack = JSON.stringify(data);
  const hits: string[] = [];
  for (const re of banned) if (re.test(haystack)) hits.push(`content matches ${re}`);
  if (ACCENT.toLowerCase() === "#e50914") hits.push("accent colour is the wrong red");
  return hits;
}

// ─── Demo ────────────────────────────────────────────────────────────────────

const CDN = "https://cdn.subhsandesh.in/gifts-media/assets";

const EP = (title: string, synopsis: string, subtitle: string, imageUrl: string, crop: Partial<Crop> = {}): Episode => ({
  title,
  synopsis,
  subtitle,
  imageUrl,
  crop: { ...CROP_CENTER, ...crop },
});

export const DEMO_DATA: LoveflixData = {
  recipientName: "Aditi",
  recipientPhotoUrl: "",
  recipientCrop: CROP_CENTER,
  senderName: "Rohan",
  senderPhotoUrl: "",
  senderCrop: CROP_CENTER,
  thirdProfile: "Our future cat",

  showTitle: "Us",
  tagline:
    "Two people who are extremely bad at admitting things. Three seasons, one shared hoodie and an argument about a film that is still, somehow, ongoing.",
  heroImageUrl: `${CDN}/Aniversary/aniversary.webp`,
  heroCrop: { x: 50, y: 58, scale: 100 },
  matchPercent: 99,
  rating: "18+",
  ratingReason: "forehead kisses, 2 AM calls, excessive clinginess",
  seasons: "3 Seasons",
  metYear: "2023",
  genres: ["Romantic", "Slow-burn", "Chaotic"],

  episodes: [
    EP(
      "The Airport",
      "She's late, he's early, and a departures board accidentally starts something neither of them planned.",
      "You ran the last fifty metres.\nI pretended I hadn't been waiting for an hour.\nI have never recovered.",
      `${CDN}/couple1.webp`,
      { y: 55 },
    ),
    EP(
      "The Power Cut",
      "Four hours, no phones, one candle and the longest conversation of the season.",
      "The fan stopped and you started talking.\nBy the time the lights came back\nI knew your whole childhood.",
      `${CDN}/couple4.webp`,
    ),
    EP(
      "2 AM Maggi",
      "A half-cooked midnight snack on the kitchen floor becomes the most rewatched episode on the service.",
      "Half-cooked. On the floor.\nYou stole the last bite and called it sharing.\nPerfect.",
      `${CDN}/couple2.webp`,
    ),
    EP(
      "Monsoon Special",
      "One umbrella, two people, and a strongly held opinion about who should carry it.",
      "You refused the umbrella on principle.\nThen complained for an hour.\nI'd walk in that rain again tomorrow.",
      `${CDN}/hero-bg.webp`,
    ),
    EP(
      "Missing You, Live",
      "A long-distance week told entirely through voice notes, bad video calls and one very dramatic sigh.",
      "Eleven-minute voice notes.\nNo summary. No regrets.\nI replayed every one.",
      `${CDN}/TemplateComingSoon/missyou1.webp`,
    ),
    EP(
      "The Argument About The Film",
      "The long-running feud reaches its season finale. Neither side has conceded. Neither side ever will.",
      "You're wrong about the ending.\nI'm going to keep saying it\nfor the rest of our lives.",
      `${CDN}/couple3.webp`,
      { y: 40 },
    ),
  ],
  reasons: [
    "You always hand me the left earbud",
    "Your laugh arrives before the punchline",
    "You bookmark every book at page forty",
    "The dog is technically ours now",
    "Your terrible, perfect harmonies",
    "Chai abandoned on every surface",
    "You keep the blurry photo",
    "The way you say my name when you're sleepy",
    "You fix my collar without asking",
    "You chose me. Every single day.",
  ],
  insideJokes: [
    "The Grey Hoodie: A Custody Battle",
    "Who Finished The Nutella?",
    "Five More Minutes (Extended Cut)",
    "The Waiter Who Called Us Married",
    "Left On Read: The Musical",
    "Parking Wars: Koramangala",
  ],
  plans: [
    "Goa, finally, no phones",
    "Adopting the loud dog",
    "Learning to cook one real dish",
    "Sunrise at Nandi Hills",
    "Growing old and annoying together",
  ],

  finaleText:
    "Six episodes, three seasons, and somehow I still get nervous before you reply.\n\nEvery version of this story ends up in the same place — with you.\n\nThat's not a plot hole. That's the whole show.",
  finaleQuestion: "renew for another season?",

  letter:
    "I made you a whole streaming service because a card felt too small.\n\nYou're the only show I never skip the intro on. I rewatch the boring episodes — the grocery runs, the traffic, the nights we just sit — because they're my favourite ones.\n\nThank you for being patient with my plot twists, for laughing at my terrible jokes half a second early, and for choosing me in every season.\n\nNo cliffhangers from here. Just more episodes. Lots of them.",
  lockQuestion: "Are you still watching… us?",
  lockAnswer: "always 💗",
};

// ─── Wire format ─────────────────────────────────────────────────────────────

export const LOVEFLIX_CONTENT_KEYS: (keyof LoveflixData)[] = [
  "recipientName", "recipientPhotoUrl", "recipientCrop",
  "senderName", "senderPhotoUrl", "senderCrop", "thirdProfile",
  "showTitle", "tagline", "heroImageUrl", "heroCrop",
  "matchPercent", "rating", "ratingReason", "seasons", "metYear", "genres",
  "episodes", "reasons", "insideJokes", "plans",
  "finaleText", "finaleQuestion",
  "letter", "lockQuestion", "lockAnswer",
];

export function loveflixDataToBody(data: LoveflixData, password?: string): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  for (const k of LOVEFLIX_CONTENT_KEYS) body[k] = data[k];
  if (password !== undefined) body.password = password;
  return body;
}

const strs = (v: unknown, max: number, each: number): string[] =>
  Array.isArray(v)
    ? v
        .filter((x): x is string => typeof x === "string" && x.trim().length > 0)
        .map((s) => s.slice(0, each))
        .slice(0, max)
    : [];

/**
 * v1 pages carried free-form `rows` and a branching `scenes` graph. Map them onto
 * the v2 catalogue so a page sent before the redesign still plays.
 */
function fromLegacy(src: Raw): Partial<LoveflixData> {
  const rows = Array.isArray(src.rows) ? src.rows.map(obj) : [];
  if (!rows.length) return {};
  const items = (r: Raw) => (Array.isArray(r.items) ? r.items.map(obj) : []);
  const cards = rows.filter((r) => r.kind !== "top10");
  const top10 = rows.find((r) => r.kind === "top10");
  const scenes = Array.isArray(src.scenes) ? src.scenes.map(obj) : [];
  const sceneLines = scenes.map((s) => strOr(s.text, "")).filter(Boolean);

  const episodes: Episode[] = (cards[0] ? items(cards[0]) : [])
    .filter((it) => str(it.title, ""))
    .slice(0, LIMITS.episodes)
    .map((it, i) => ({
      title: str(it.title, ""),
      synopsis: strOr(it.caption, ""),
      subtitle: sceneLines[i] ?? strOr(it.caption, ""),
      imageUrl: strOr(it.imageUrl, ""),
      crop: CROP_CENTER,
    }));

  const reasons = top10
    ? items(top10)
        .map((it) => [str(it.title, ""), strOr(it.caption, "")].filter(Boolean).join(" — "))
        .filter(Boolean)
    : [];
  const insideJokes = cards
    .slice(1)
    .flatMap((r) => items(r).map((it) => str(it.title, "")))
    .filter(Boolean);

  return {
    episodes,
    reasons: reasons.slice(0, LIMITS.reasons).map((r) => r.slice(0, LIMITS.reason)),
    insideJokes: insideJokes.slice(0, LIMITS.jokes).map((r) => r.slice(0, LIMITS.joke)),
  };
}

export function dbToLoveflixData(db: Raw | null | undefined): LoveflixData {
  const src = db ?? {};
  const isV2 = Array.isArray(src.episodes) && src.episodes.length > 0;
  const legacy = isV2 ? {} : fromLegacy(src);

  const episodes = list<Episode>(
    src.episodes,
    (o) => {
      const title = str(o.title, "");
      if (!title) return null;
      return {
        title: title.slice(0, LIMITS.epTitle),
        synopsis: strOr(o.synopsis, "").slice(0, LIMITS.synopsis),
        subtitle: strOr(o.subtitle, "").slice(0, LIMITS.subtitle),
        imageUrl: strOr(o.imageUrl, ""),
        crop: toCrop(o.crop),
      };
    },
    legacy.episodes?.length ? legacy.episodes : DEMO_DATA.episodes,
  ).slice(0, LIMITS.episodes);

  const reasons = strs(src.reasons, LIMITS.reasons, LIMITS.reason);
  const jokes = strs(src.insideJokes, LIMITS.jokes, LIMITS.joke);
  const plans = strs(src.plans, LIMITS.plans, LIMITS.plan);
  const genres = strs(src.genres, LIMITS.genres, LIMITS.genre);

  return {
    recipientName: str(src.recipientName, DEMO_DATA.recipientName),
    recipientPhotoUrl: strOr(src.recipientPhotoUrl, ""),
    recipientCrop: toCrop(src.recipientCrop),
    senderName: str(src.senderName, DEMO_DATA.senderName),
    senderPhotoUrl: strOr(src.senderPhotoUrl, ""),
    senderCrop: toCrop(src.senderCrop),
    thirdProfile: strOr(src.thirdProfile, ""),
    showTitle: str(src.showTitle, DEMO_DATA.showTitle),
    tagline: str(src.tagline, DEMO_DATA.tagline),
    heroImageUrl: strOr(src.heroImageUrl, ""),
    heroCrop: toCrop(src.heroCrop),
    matchPercent: Math.round(clampNum(src.matchPercent, 99, 1, 100)),
    rating: str(src.rating, DEMO_DATA.rating).slice(0, 24),
    ratingReason: strOr(src.ratingReason, ""),
    seasons: str(src.seasons, DEMO_DATA.seasons),
    metYear: strOr(src.metYear, ""),
    genres: genres.length ? genres : isV2 ? [] : DEMO_DATA.genres,
    episodes,
    reasons: reasons.length ? reasons : legacy.reasons ?? [],
    insideJokes: jokes.length ? jokes : legacy.insideJokes ?? [],
    plans,
    finaleText: str(src.finaleText, DEMO_DATA.finaleText),
    finaleQuestion: strOr(src.finaleQuestion, ""),
    letter: strOr(src.letter, "").slice(0, LIMITS.letter),
    lockQuestion: strOr(src.lockQuestion, "").slice(0, LIMITS.lockQuestion),
    lockAnswer: strOr(src.lockAnswer, "").slice(0, LIMITS.lockAnswer),
  };
}

// ─── Component contract ──────────────────────────────────────────────────────

export interface LoveflixTemplateProps {
  data: LoveflixData;
  mode: "demo" | "live";
  shareId?: string;
  hasPassword?: boolean;
  /** Height of the editor bar above the app in demo mode, px. */
  topInset?: number;
}
