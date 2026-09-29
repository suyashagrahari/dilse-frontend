// ─── App Listing — demo data and the wire converters ─────────────────────────
//
// `DEMO_APP` is what /app renders before anyone has typed anything, so it is
// also the specification for the tone: deadpan release-notes English about a
// real person, warm underneath. It is seeded into the editor form and handed to
// `useStoryFill` as the "this is still the demo" baseline, so every leaf the AI
// may write has a plausible value here.
//
// ── ONE NAME MAPPING, AND IT IS DELIBERATE ───────────────────────────────────
//
// The UI object calls the header block `app` (AppData.app); the document calls
// it `meta` (AppPage.meta). `app` is a reserved-feeling name on an Express
// document and `meta` is what the info table is actually built from, so the two
// sides differ by exactly one key and the translation happens here — in
// `appDataToBody` and `dbToAppData` — and nowhere else. `dbToAppData` accepts
// either spelling on the way in so a hand-written payload cannot silently
// produce a nameless listing.
//
// ── THREE VALUES THAT LOOK NUMERIC AND ARE NOT ───────────────────────────────
//
// `app.size`, `app.price` and `rating.count` are strings on both sides of the
// wire. "1 human", "Free (emotionally expensive)" and "8,472". Nothing here
// parses them.

import {
  APP_REVIEW_LIMITS,
  type AppData,
  type AppDescription,
  type AppInfoRow,
  type AppMeta,
  type AppRating,
  type AppReview,
  type AppScreenshot,
  type AppStar,
  type AppVersion,
  type AppWhatsNew,
} from "./types";

/** The chrome pill's label is built from this, not from a vendor's wordmark. */
export const DEMO_SENDER = "Karan";

/**
 * The current release. Declared once because the header, "What's New" and the
 * top of the changelog all have to agree — a listing whose version number
 * disagrees with itself reads as a mock-up instantly.
 */
const CURRENT = { version: "3.2", date: "12 August 2026" } as const;

const DEMO_META: AppMeta = {
  name: "Meera",
  subtitle: "Girlfriend · Utilities",
  // The template now ships its own artwork, so the demo shows a real icon
  // rather than the initials disc. The disc is still the fallback and still
  // fires on a broken or missing URL — it is just no longer what the demo
  // leads with, because an initials tile on the most-looked-at line of a
  // listing reads as unfinished rather than as a design choice.
  iconUrl: "https://cdn.subhsandesh.in/gifts-media/assets/couple2.webp",
  iconCropX: 74,
  iconCropY: 42,
  iconScale: 210,
  developer: "Sharma Family Enterprises",
  ageRating: "4+",
  category: "Utilities",
  size: "1 human",
  languages: "English, Hindi, Sarcasm",
  price: "Free (emotionally expensive)",
  seller: "Karan",
  compatibility: "Works with me only.",
};

/**
 * The demo reviews, published ones first.
 *
 * Ten published: seven 5★, two 4★, one 3★ — which is exactly what
 * `DEMO_RATING.distribution` says, and the two have to keep agreeing. A
 * histogram that does not match the reviews under it is the single cheapest way
 * to make a page read as fake, and it is the first thing anybody checks.
 *
 * The 3★ is load-bearing: a listing where every friend agrees is not a listing.
 * It is also affectionate, because she is going to read every line of this.
 */
const DEMO_REVIEWS: AppReview[] = [
  {
    id: "rv1",
    author: "priya_since_2014",
    stars: 5,
    title: "Ten years of daily use, zero crashes",
    body:
      "Been using her since college. Occasional lag when hungry, resolves itself after food. Support answers at 3am. The only real downside is that she is not available to anyone else, which feels deliberate.",
    ago: "2d ago",
    version: "3.2",
    developerResponse: {
      text:
        "Thanks for the report. The lag is expected behaviour and will not be fixed. Re: availability — correct, and that is by design. Closing this as the best thing that ever happened to me.",
      ago: "1d ago",
    },
    status: "published",
  },
  {
    id: "rv2",
    author: "rahul.exe",
    stars: 5,
    title: "Battery life is genuinely absurd",
    body:
      "Runs eighteen hours on four hours of sleep and one paratha. I have asked her how. She says she does not know. I no longer believe her.",
    ago: "4d ago",
    version: "3.2",
    status: "published",
  },
  {
    id: "rv3",
    author: "ananya ☕",
    stars: 4,
    title: "Talks through every film",
    body:
      "Every film. Has never once been wrong about what happens next, which is somehow worse than being wrong. Minus one star for spoilers, plus infinity for the commentary.",
    ago: "1w ago",
    version: "3.0",
    developerResponse: {
      text: "Escalated internally. I was told the films are predictable and I am the one with the bug. Ticket closed by her.",
      ago: "6d ago",
    },
    status: "published",
  },
  {
    id: "rv4",
    author: "kabir_from_hostel_b",
    stars: 5,
    title: "Best in category, not close",
    body:
      "I have met the alternatives. There are no alternatives. She once drove forty minutes to bring him a charger he had not asked for.",
    ago: "2w ago",
    version: "2.0",
    status: "published",
  },
  // Pending — what the sender's moderation queue looks like before approving.
  {
    id: "rv5",
    author: "dev a.",
    stars: 5,
    title: "Still finding features",
    body: "Two years in and he is still finding features. Last week: she can whistle. Nobody told any of us.",
    ago: "3h ago",
    version: "3.2",
    status: "pending",
  },
];

/**
 * Four published reviews: 3×5★ and 1×4★ → 4.8. The histogram is recomputed from
 * the published reviews at render, so this only matters for old callers.
 */
const DEMO_RATING: AppRating = {
  average: 4.8,
  count: "8,472",
  distribution: [0, 0, 0, 1, 3],
};

/**
 * The screenshot rail holds the couple's own photos. Each one is drawn as a
 * marketing screenshot: a short bold headline on a soft gradient, and the photo
 * on a phone screen underneath. Captions are headlines, not sentences.
 */
const COUPLE = (n: number) => `https://cdn.subhsandesh.in/gifts-media/assets/couple${n}.webp`;

const DEMO_SCREENSHOTS: AppScreenshot[] = [
  { imageUrl: COUPLE(2), caption: "Date nights, fully optimised", cropX: 52, cropY: 50, scale: 100 },
  { imageUrl: COUPLE(1), caption: "Runs in the background of every thought", cropX: 52, cropY: 60, scale: 110 },
  { imageUrl: COUPLE(4), caption: "Shares the blanket. Mostly.", cropX: 45, cropY: 60, scale: 100 },
  { imageUrl: COUPLE(3), caption: "Long-term support included", cropX: 62, cropY: 55, scale: 110 },
];

const DEMO_DESCRIPTION: AppDescription = {
  short: [
    "Handles incoming stress, outgoing plans, and every decision about where to eat. Runs continuously. Has never crashed in a way that mattered.",
    "Requires no configuration. Will configure you.",
  ],
  full: [
    "The honest version: I did not plan any of this. She turned up in a group chat I nearly muted, and now I check the weather in a city I do not live in.",
    "She is the only person who has ever asked me a follow-up question. Not the polite kind. The kind that means she was listening the first time.",
    "Everything above this line is a joke. This part is not — I would install her at 1.0 again, bugs and all, and I would not read the changelog first.",
  ],
};

const DEMO_WHATS_NEW: AppWhatsNew = {
  version: CURRENT.version,
  date: CURRENT.date,
  notes: [
    "Fixed a bug where she said “I’m fine” and meant the exact opposite. Fix confirmed working; root cause still unknown.",
    "Reduced morning startup time from 40 minutes to 38 minutes. That was the last of the easy wins.",
    "Deprecated the version of me that existed before her. No migration path. None needed.",
  ],
};

/**
 * The comedic centrepiece, newest first.
 *
 * It is an ESCALATION, and the curve only reads correctly in this order: v3.2
 * has completely lost its professional composure, v1.0 is two words of
 * maintenance English. The oldest entry carries the shortest, driest note and
 * the contrast against the newer ones is where the joke lands — so nothing
 * anywhere sorts, reverses or truncates this array.
 */
const DEMO_VERSIONS: AppVersion[] = [
  {
    version: "3.2",
    date: CURRENT.date,
    size: "1 human (now with opinions)",
    notes: [...DEMO_WHATS_NEW.notes],
  },
  {
    version: "3.0",
    date: "3 June 2026",
    size: "1 human (breaking changes)",
    notes: [
      "MAJOR: moved in. Everything downstream of this is a breaking change and every bit of it was worth it.",
      "Added a second toothbrush. And a third pillow nobody asked for.",
      "Removed the phrase “let’s see how it goes” from all responses.",
    ],
  },
  {
    version: "2.0",
    date: "14 February 2025",
    size: "1 human",
    notes: ["Said it back.", "Improved handling of long silences — she now knows which kind it is."],
  },
  {
    version: "1.5",
    date: "2 November 2024",
    size: "1 human",
    notes: ["First road trip. Navigation disabled, playlist enabled."],
  },
  {
    version: "1.1",
    date: "20 April 2024",
    size: "1 human",
    notes: ["Bug fixes. Added a shared calendar."],
  },
  {
    version: "1.0",
    date: "4 March 2024",
    size: "1 human",
    // The straight man for every entry above. Do not lengthen this.
    notes: ["Initial release."],
  },
];

/**
 * The information table. Row ORDER is a contract with the AI schema, which
 * addresses Compatibility as `info[3].value` — inserting a row above it would
 * silently move the model's answer into the wrong cell.
 */
const DEMO_INFO: AppInfoRow[] = [
  { label: "Provider", value: "Sharma Family Enterprises" },
  { label: "Size", value: "1 human" },
  { label: "Category", value: "Utilities" },
  { label: "Compatibility", value: "Works with me only." },
  { label: "Languages", value: "English, Hindi, Sarcasm" },
  { label: "Age Rating", value: "4+ · Infrequent chaos" },
  { label: "Price", value: "Free (emotionally expensive)" },
  { label: "Developer Website", value: "sharmafamilyenterprises.co", link: true },
  { label: "Privacy Policy", value: "There isn’t one. She tells her sister everything.", link: true },
];

export const DEMO_APP: AppData = {
  app: DEMO_META,
  rating: DEMO_RATING,
  screenshots: DEMO_SCREENSHOTS,
  description: DEMO_DESCRIPTION,
  whatsNew: DEMO_WHATS_NEW,
  versionHistory: DEMO_VERSIONS,
  info: DEMO_INFO,
  reviews: DEMO_REVIEWS,
  contributorPrompt: "Karan is collecting reviews of Meera. One line is plenty — she reads all of them.",
  iap: [
    "Forehead kiss · Free",
    "Extra-tight hug · Free",
    "Unlimited cuddles (lifetime) · ₹0",
    "Last bite of the fries · 1 kiss",
    "“You were right” · Priceless",
  ],
  privacy: {
    tracked: ["Location (home safe?)", "Coffee order", "Mood swings"],
    linked: ["My hoodie", "The last slice", "Every playlist", "My whole heart"],
  },
  letter:
    "Meera,\n\nI made you a listing because I ran out of ways to say it normally. Every line above is a joke and every joke is true — you really do wake up already talking, and I really have stopped wanting quiet mornings.\n\nThank you for version 1.0, for every update since, and for never once shipping without telling me. I read the changelog every day. It is still my favourite thing to read.\n\nNo uninstall option. I checked. I would not use it.",
  lockQuestion: "Will you install me back? 🥺",
  lockAnswer: "Already did 💗",
};

/* ── Aggregate helpers ─────────────────────────────────────────────────────── */

/** Published reviews only. Everything that renders a rating goes through this. */
export function publishedReviews(data: AppData): AppReview[] {
  return data.reviews.filter((r) => r.status === "published");
}

/**
 * The aggregate recomputed from the published reviews.
 *
 * Zero published reviews returns `count: 0`, which callers render as "No
 * Ratings Yet" with the histogram hidden — never "0.0". A zero rating is a
 * claim; an absent rating is a fact.
 */
export function aggregateOf(reviews: readonly AppReview[]): {
  average: number;
  count: number;
  distribution: number[];
  percents: number[];
} {
  const distribution = [0, 0, 0, 0, 0];
  let total = 0;
  for (const r of reviews) {
    const idx = Math.min(4, Math.max(0, Math.round(r.stars) - 1));
    distribution[idx] += 1;
    total += r.stars;
  }
  const count = reviews.length;
  const average = count === 0 ? 0 : Math.round((total / count) * 10) / 10;
  const percents = distribution.map((n) => (count === 0 ? 0 : Math.round((n / count) * 100)));
  return { average, count, distribution, percents };
}

/* ── Wire converters ──────────────────────────────────────────────────────── */

type Raw = Record<string, unknown>;

const obj = (v: unknown): Raw => (v && typeof v === "object" && !Array.isArray(v) ? (v as Raw) : {});
const arr = (v: unknown): unknown[] => (Array.isArray(v) ? v : []);
const cut = (s: string, max: number) => (s.length > max ? s.slice(0, max) : s);
const str = (v: unknown, fallback: string, max = 2000): string =>
  typeof v === "string" && v.trim() ? cut(v.trim(), max) : fallback;
/** Like `str` but an empty value stays empty rather than falling back. */
const strOr = (v: unknown, max = 2000): string => (typeof v === "string" ? cut(v.trim(), max) : "");

const num = (v: unknown, fallback: number, min: number, max: number): number => {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.min(max, Math.max(min, n));
};

const starsOf = (v: unknown): AppStar =>
  (Math.round(num(v, 5, 1, 5)) || 5) as AppStar;

/**
 * `javascript:` and friends never reach an href or a src. Anything that is not
 * http(s) or an inline image data URL becomes the empty string, which every
 * renderer here draws as its text fallback.
 */
const imageUrl = (v: unknown): string => {
  if (typeof v !== "string") return "";
  const raw = v.trim();
  // A draft holds freshly picked photos as data URLs, which run to hundreds of
  // KB. Cutting one at 2000 chars (as links are cut) leaves an invalid URL and
  // a broken photo after every refresh.
  if (/^data:image\//i.test(raw)) return raw.length <= 12_000_000 ? raw : "";
  const s = cut(raw, 2000);
  return /^https?:\/\//i.test(s) ? s : "";
};

const strList = (v: unknown, fallback: string[], max: number, itemMax: number): string[] => {
  const out = arr(v)
    .map((x) => strOr(x, itemMax))
    .filter(Boolean)
    .slice(0, max);
  return out.length > 0 ? out : fallback;
};

const cropNum = (v: unknown, min: number, max: number): number | undefined => {
  if (v === undefined || v === null || v === "") return undefined;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : undefined;
};

/** Framing numbers, only the ones present — absent means "centred, unzoomed". */
function cropOf(x: unknown, y: unknown, scale: unknown): { cropX?: number; cropY?: number; scale?: number } {
  const out: { cropX?: number; cropY?: number; scale?: number } = {};
  const cx = cropNum(x, 0, 100);
  const cy = cropNum(y, 0, 100);
  const sc = cropNum(scale, 100, 300);
  if (cx !== undefined) out.cropX = cx;
  if (cy !== undefined) out.cropY = cy;
  if (sc !== undefined) out.scale = sc;
  return out;
}

/**
 * UI state → wire body.
 *
 * The only place `app` becomes `meta`. An empty password is omitted rather than
 * sent as "", because the server reads an empty password on update as
 * "unchanged" and sending one anyway just makes that contract harder to read.
 */
export function appDataToBody(data: AppData, password?: string): Record<string, unknown> {
  return {
    meta: { ...data.app },
    rating: {
      average: data.rating.average,
      // String. Never a quantity.
      count: data.rating.count,
      distribution: [...data.rating.distribution],
    },
    screenshots: data.screenshots.map((s) => ({
      imageUrl: s.imageUrl,
      caption: s.caption,
      cropX: s.cropX,
      cropY: s.cropY,
      scale: s.scale,
    })),
    description: { short: [...data.description.short], full: [...data.description.full] },
    // "What's New" IS the newest changelog entry — one source, so they never disagree.
    whatsNew: data.versionHistory[0]
      ? {
          version: data.versionHistory[0].version,
          date: data.versionHistory[0].date,
          notes: [...data.versionHistory[0].notes],
        }
      : { ...data.whatsNew, notes: [...data.whatsNew.notes] },
    versionHistory: data.versionHistory.map((v) => ({ ...v, notes: [...v.notes] })),
    info: data.info.map((r) => ({ label: r.label, value: r.value, link: !!r.link })),
    reviews: data.reviews.map((r) => ({
      id: r.id,
      author: r.author,
      stars: r.stars,
      title: r.title,
      body: r.body,
      ago: r.ago,
      version: r.version ?? "",
      developerResponse: r.developerResponse
        ? { text: r.developerResponse.text, ago: r.developerResponse.ago }
        : { text: "", ago: "" },
      status: r.status,
    })),
    contributorPrompt: data.contributorPrompt,
    iap: [...data.iap],
    privacy: { tracked: [...data.privacy.tracked], linked: [...data.privacy.linked] },
    letter: data.letter,
    lockQuestion: data.lockQuestion,
    lockAnswer: data.lockAnswer,
    ...(password ? { password } : {}),
  };
}

function coerceReview(raw: unknown, index: number): AppReview | null {
  const src = obj(raw);
  const title = strOr(src.title, 120);
  const body = strOr(src.body, APP_REVIEW_LIMITS.body * 3);
  // A review with neither a headline nor a body is not a review.
  if (!title && !body) return null;

  const response = obj(src.developerResponse);
  const responseText = strOr(response.text, 800);
  const version = strOr(src.version, 24);

  return {
    id: strOr(src.id, 64) || `rv${index + 1}`,
    author: str(src.author, "Anonymous", 60),
    stars: starsOf(src.stars),
    title,
    body,
    ago: strOr(src.ago, 48),
    ...(version ? { version } : {}),
    ...(responseText
      ? { developerResponse: { text: responseText, ago: strOr(response.ago, 48) } }
      : {}),
    // Unknown values fail closed to "pending" — an unmoderated review must never
    // default its way onto the recipient's page.
    status: src.status === "published" ? "published" : "pending",
  };
}

/**
 * Wire/DB payload → UI state.
 *
 * Total function: every branch returns something drawable and an absent payload
 * falls all the way back to the demo listing rather than to a blank screen.
 * Nothing here parses `size`, `price` or `rating.count`.
 */
export function dbToAppData(db: unknown): AppData {
  const src = obj(db);
  // `meta` is the document's spelling; `app` is accepted so a payload written
  // against the UI shape cannot produce a nameless listing.
  const meta = { ...obj(src.app), ...obj(src.meta) };
  const rawRating = obj(src.rating);
  const rawDesc = obj(src.description);
  const rawNew = obj(src.whatsNew);

  const screenshots = arr(src.screenshots)
    .map((entry) => {
      const s = obj(entry);
      return {
        imageUrl: imageUrl(s.imageUrl),
        caption: strOr(s.caption, 160),
        ...cropOf(s.cropX, s.cropY, s.scale),
      };
    })
    .filter((s) => s.imageUrl || s.caption)
    .slice(0, 8);

  const versionHistory = arr(src.versionHistory)
    .map((entry) => {
      const v = obj(entry);
      const version = strOr(v.version, 24);
      if (!version) return null;
      return {
        version,
        date: strOr(v.date, 48),
        size: strOr(v.size, 60),
        notes: arr(v.notes).map((n) => strOr(n, 240)).filter(Boolean).slice(0, 8),
      };
    })
    .filter((v): v is AppVersion => v !== null)
    .slice(0, 12);

  const info = arr(src.info)
    .map((entry) => {
      const r = obj(entry);
      const label = strOr(r.label, 60);
      const value = strOr(r.value, 200);
      if (!label || !value) return null;
      // Typed on the way out rather than inferred: `link: true as const` widens
      // the element to `{ link?: true }`, which the `is AppInfoRow` predicate
      // below is then not assignable to.
      const row: AppInfoRow = { label, value, ...(r.link ? { link: true } : {}) };
      return row;
    })
    .filter((r): r is AppInfoRow => r !== null)
    .slice(0, 16);

  const reviewsIn = arr(src.reviews)
    .map(coerceReview)
    .filter((r): r is AppReview => r !== null)
    .slice(0, 40);
  // Duplicate ids break React keys and make moderation ambiguous — "publish
  // rv3" has to mean exactly one row — so they are renumbered here.
  const seen = new Set<string>();
  const reviews = reviewsIn.map((r, i) => {
    if (!seen.has(r.id)) { seen.add(r.id); return r; }
    let id = `${r.id}-${i}`;
    while (seen.has(id)) id = `${id}x`;
    seen.add(id);
    return { ...r, id };
  });

  const rawDistribution = arr(rawRating.distribution);
  const distribution =
    rawDistribution.length > 0
      ? [0, 1, 2, 3, 4].map((i) => Math.max(0, Math.trunc(num(rawDistribution[i], 0, 0, 1e6))))
      : [...DEMO_RATING.distribution];

  const iconCrop = cropOf(meta.iconCropX, meta.iconCropY, meta.iconScale);
  const rawPrivacy = obj(src.privacy);
  // Older pages kept Compatibility as a free-standing info row.
  const legacyCompat = info.find((r) => /compatib/i.test(r.label))?.value ?? "";

  return {
    app: {
      name: str(meta.name, DEMO_APP.app.name, 60),
      subtitle: str(meta.subtitle, DEMO_APP.app.subtitle, 120),
      iconUrl: imageUrl(meta.iconUrl),
      developer: str(meta.developer, DEMO_APP.app.developer, 80),
      ageRating: str(meta.ageRating, DEMO_APP.app.ageRating, 12),
      category: str(meta.category, DEMO_APP.app.category, 60),
      // Strings. "1 human" survives the round trip untouched.
      size: str(meta.size, DEMO_APP.app.size, 60),
      languages: str(meta.languages, DEMO_APP.app.languages, 120),
      price: str(meta.price, DEMO_APP.app.price, 60),
      seller: strOr(meta.seller, 40),
      compatibility: strOr(meta.compatibility, 90) || legacyCompat || DEMO_APP.app.compatibility,
      ...(iconCrop.cropX !== undefined ? { iconCropX: iconCrop.cropX } : {}),
      ...(iconCrop.cropY !== undefined ? { iconCropY: iconCrop.cropY } : {}),
      ...(iconCrop.scale !== undefined ? { iconScale: iconCrop.scale } : {}),
    },
    rating: {
      average: num(rawRating.average, DEMO_RATING.average, 0, 5),
      // String. Display only.
      count: str(rawRating.count, DEMO_RATING.count, 24),
      distribution,
    },
    screenshots: screenshots.length > 0 ? screenshots : DEMO_APP.screenshots,
    description: {
      short: strList(rawDesc.short, [...DEMO_APP.description.short], 12, 1200),
      full: strList(rawDesc.full, [...DEMO_APP.description.full], 12, 1200),
    },
    whatsNew: {
      version: str(rawNew.version, DEMO_APP.whatsNew.version, 24),
      date: str(rawNew.date, DEMO_APP.whatsNew.date, 48),
      notes: strList(rawNew.notes, [...DEMO_APP.whatsNew.notes], 8, 240),
    },
    versionHistory: versionHistory.length > 0 ? versionHistory : DEMO_APP.versionHistory,
    info: info.length > 0 ? info : DEMO_APP.info,
    reviews: arr(src.reviews).length > 0 ? reviews : DEMO_APP.reviews,
    contributorPrompt: str(src.contributorPrompt, DEMO_APP.contributorPrompt, 240),
    iap: Array.isArray(src.iap) ? strList(src.iap, [], 8, 80) : [...DEMO_APP.iap],
    privacy: {
      tracked: Array.isArray(rawPrivacy.tracked)
        ? strList(rawPrivacy.tracked, [], 6, 70)
        : [...DEMO_APP.privacy.tracked],
      linked: Array.isArray(rawPrivacy.linked)
        ? strList(rawPrivacy.linked, [], 6, 70)
        : [...DEMO_APP.privacy.linked],
    },
    // No fallback: an old page without a letter simply shows no envelope.
    letter: strOr(src.letter, 2000),
    lockQuestion: strOr(src.lockQuestion, 140),
    lockAnswer: strOr(src.lockAnswer, 40),
  };
}
