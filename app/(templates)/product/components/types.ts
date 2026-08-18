// ─── Product — the frozen contract ───────────────────────────────────────────
//
// LEAD-OWNED AND FROZEN. Import from here; do not extend it.
//
// A person, listed as a product. The goal is LAYOUT FIDELITY: this must read as
// a real marketplace listing within one second — the breadcrumb, the gallery
// rail, the buy box, the "frequently bought together" strip, the customer
// questions block, the star-histogram review list. The humour is entirely in
// the copy. The UI itself is plain, dense, and correct.
//
// ── BRAND ────────────────────────────────────────────────────────────────────
// The layout conventions ARE the recognition, and they are free to reproduce.
// The marks are not. Nothing anywhere in this template — copy, file name, class
// name, alt text, comment, or test — may carry the name of the marketplace this
// borrows its shape from, its voice assistant, its cloud arm, its membership
// programme, its smile-and-arrow device, or its corporate typeface. The
// wordmark is ours and it is WORDMARK below.
//
// The listing chrome that IS safe and IS required for the illusion: breadcrumbs,
// "Visit the … Store", the star row, "In stock", the delivery promise line, the
// bullet block, the spec table, the Q&A section, and the review list.
//
// ── THE DETAIL THAT DECIDES THIS TEMPLATE ────────────────────────────────────
// `price.amount` is a STRING and the demo value is "∞". Every field on this
// contract that names money is a string for that reason. Do not call Number(),
// parseInt() or parseFloat() on any of them, anywhere, ever — not to sort, not
// to compare, not to format. The moment one of them is parsed the buy box
// renders "NaN" and the joke dies on the most-looked-at line of the page.

import { obj, str, strOr, num, bool, clampNum, oneOf, list, strList, bodyFromKeys, type Raw } from "@/lib/wire";

/** Our own mark, top-left of the site header. Devanagari second half is intentional. */
export const WORDMARK = "loveकार्ट";

// ═══════════════════════════════════════════════════════════════════════════
// Stored shape
// ═══════════════════════════════════════════════════════════════════════════

/** 1–5, as rendered by the star row. Never a float — the histogram buckets on it. */
export type StarRating = 1 | 2 | 3 | 4 | 5;

/**
 * Contributed reviews land as "pending" and only a "published" one is shown to
 * the recipient. The gate is deliberate: the review box is open to anybody with
 * the link, and this page is a gift.
 */
export type ReviewStatus = "pending" | "published";

export interface Review {
  id: string;
  author: string;
  stars: StarRating;
  title: string;
  body: string;
  /** "Reviewed on 14 February 2021" — free text, never a parsed date. */
  ago: string;
  /** Renders the "Verified Purchase" flag under the byline. */
  verified: boolean;
  helpful: number;
  imageUrl?: string;
  status: ReviewStatus;
}

/** One row of the spec table under the bullets. */
export interface Spec {
  label: string;
  value: string;
}

/** One tile in the "frequently bought together" strip. */
export interface BundleItem {
  name: string;
  /** STRING. May be "Free", "₹0" or "∞". Never parsed. */
  price: string;
  imageUrl: string;
  note?: string;
}

/** One entry in the customer-questions block. */
export interface QA {
  question: string;
  answer: string;
  /** Who answered — a person, or the store itself. */
  by: string;
  ago: string;
  votes: number;
}

export interface ProductPrice {
  /**
   * STRING, and the demo value is "∞". Never Number()/parseInt/parseFloat it.
   * The currency symbol, the grouping and any unit all live inside the string.
   */
  amount: string;
  /** The struck-through was-price. Also a string. Also never parsed. */
  original?: string;
  /** The only number in this object, because it is the only one that is one. */
  discountPct?: number;
}

export interface ProductData {
  /** The product. Photos fill the gallery rail; the first is the hero. */
  subject: { firstName: string; lastName: string; photos: string[] };
  /** Who listed it. */
  sender: { firstName: string };
  /** The listing title. Long on purpose — real ones are. */
  title: string;
  /** "Visit the Sharma Store" — the blue link above the title. */
  storeName: string;
  price: ProductPrice;
  /** "In stock." / "Only 1 left in stock." */
  stockLine: string;
  /** The delivery promise, cut-off included. */
  deliveryLine: string;
  /** "About this item" — the bullet block. */
  bullets: string[];
  specs: Spec[];
  bundle: BundleItem[];
  qa: QA[];
  reviews: Review[];
  aboutSection: { heading: string; body: string; imageUrl?: string };
  /** Shown above the "write a review" box on the published page. */
  contributorPrompt: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// Demo content
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Unsplash serves `access-control-allow-origin: *`, which matters more than it
 * looks: the share card is captured with html-to-image, and a photo without
 * CORS headers taints the canvas and kills the whole export.
 */
const photo = (id: string, w = 600, h = 600): string =>
  `https://images.unsplash.com/${id}?q=80&w=${w}&h=${h}&fit=crop&auto=format`;

export const DEMO_DATA: ProductData = {
  subject: {
    firstName: "Meera",
    lastName: "Sharma",
    photos: [
      photo("photo-1494790108377-be9c29b29330", 800, 800),
      photo("photo-1524504388940-b1c1722653e1", 800, 800),
      photo("photo-1534528741775-53994a69daeb", 800, 800),
      photo("photo-1517841905240-472988babdf9", 800, 800),
      photo("photo-1531123897727-8f129e1688ce", 800, 800),
    ],
  },
  sender: { firstName: "Karan" },
  title: "Meera Sharma — Girlfriend, Original, 1 Count",
  storeName: "Visit the Sharma Store",
  price: {
    amount: "∞",
    original: "₹4,99,999",
    // Zero, and the bullets explain why. A discount here would be insulting.
    discountPct: 0,
  },
  stockLine: "In stock. Only 1 left — there was only ever 1.",
  deliveryLine:
    "FREE delivery Sunday, 14 February. Order within 4 hrs 12 mins. Hand-delivered by Karan, on foot, holding flowers he will claim were on offer.",
  bullets: [
    "ORIGINAL, 1 COUNT. No refurbished unit exists. Do not accept substitutes; there are none to accept.",
    "Laughs at her own jokes roughly 0.4 seconds before the punchline. This is a feature and it is not adjustable.",
    "Compatible with: long drives, bad weather, hospital waiting rooms, and Karan's playlist, which she has described in writing as 'a hate crime'.",
    "Battery: 6 hours of relentless enthusiasm followed by 11 hours of sleep. Non-removable. Do not attempt to wake before 9 AM.",
    "0% off. She is not on sale, has never been on sale, and will not be on sale during any forthcoming event.",
    "Warranty: lifetime, non-transferable. Void if returned.",
  ],
  specs: [
    { label: "Brand", value: "Sharma" },
    { label: "Model Number", value: "MEERA-1998" },
    { label: "Country of Origin", value: "Lucknow, Uttar Pradesh" },
    { label: "Material", value: "80% patience, 20% sarcasm" },
    { label: "Colour", value: "Warm, mostly" },
    { label: "Item Weight", value: "She has asked us not to list this" },
    { label: "Included Components", value: "1 × Meera, 1 × opinion about your shirt" },
    { label: "Batteries Required", value: "No. Runs on cold coffee." },
    { label: "Care Instructions", value: "Feed on time. Do not begin a discussion before dinner." },
    { label: "Date First Available", value: "14 February 2021" },
    { label: "Item Code", value: "KRN-MRA-140221" },
  ],
  bundle: [
    {
      name: "Karan Mehra — Boyfriend, Refurbished, 1 Count",
      price: "₹0",
      imageUrl: photo("photo-1500648767791-00dcc994a43e", 300, 300),
      note: "Cannot be bought separately. Nobody has tried.",
    },
    {
      name: "Cold coffee, 1 × large, extra ice, less sugar",
      price: "₹180",
      imageUrl: photo("photo-1461023058943-07fcbe16d735", 300, 300),
      note: "Ships with every order whether requested or not.",
    },
    {
      name: "Mrs. Sharma's opinion on your career (Unsolicited, Annual Subscription)",
      price: "Free",
      imageUrl: photo("photo-1516534775068-ba3e7458af70", 300, 300),
      note: "Auto-renews. Cannot be cancelled.",
    },
  ],
  qa: [
    {
      question: "Is this the original or a refurbished unit?",
      answer: "Original. There is no refurbished unit. I have checked repeatedly and at some cost to my dignity.",
      by: "Karan",
      ago: "asked 2 years ago",
      votes: 214,
    },
    {
      question: "Does it come with the argument about the AC temperature?",
      answer: "Yes. Pre-installed. Cannot be uninstalled. You will lose it at 24°C and you will deserve to.",
      by: "Rohit (friend of the owner)",
      ago: "asked 8 months ago",
      votes: 96,
    },
    {
      question: "Return policy if it does not fit?",
      answer: "It fits. You will adjust.",
      by: "Sharma Store",
      ago: "asked 1 year ago",
      votes: 341,
    },
    {
      question: "What is the actual price? The listing shows a symbol.",
      answer:
        "The listing shows ∞ because ∞ is the price. This is not a display error and we would be grateful if you stopped writing in about it.",
      by: "Sharma Store",
      ago: "asked 3 months ago",
      votes: 502,
    },
    {
      question: "Bulk orders available?",
      answer: "No.",
      by: "Sharma Store",
      ago: "asked 5 months ago",
      votes: 1188,
    },
  ],
  reviews: [
    {
      id: "rv1",
      author: "Karan",
      stars: 5,
      title: "Ordered once in 2021. Still using daily. Would order again.",
      body:
        "Arrived early, which set the tone. Four years in and the build quality has not moved — same laugh, same terrible aim with the TV remote, same habit of finishing my sentences slightly better than I was going to. I have nothing constructive. I have tried, for the sake of a balanced review, and I have nothing.",
      ago: "Reviewed on 14 February 2021",
      verified: true,
      helpful: 1284,
      imageUrl: photo("photo-1518199266791-5375a83190b7", 500, 500),
      status: "published",
    },
    {
      id: "rv2",
      author: "Priya S.",
      stars: 5,
      title: "Product is exactly as described in the listing",
      body:
        "I have known this unit since 2014, which is longer than the seller has, and I can confirm every bullet point. The 0.4-second early laugh is real. Deducting nothing. Karan, if you are reading this, you got extremely lucky and we all know it.",
      ago: "Reviewed on 3 March 2023",
      verified: true,
      helpful: 903,
      status: "published",
    },
    {
      id: "rv3",
      author: "Mrs. Sharma",
      stars: 4,
      title: "One star withheld on principle",
      body:
        "She is perfect. I am her mother. If I write five she will read this and get ideas, and then who will hear about it for a week. Otherwise no complaints. Boy is fine also. He eats properly now.",
      ago: "Reviewed on 19 August 2023",
      verified: true,
      helpful: 2140,
      status: "published",
    },
    {
      id: "rv4",
      author: "Rohit",
      stars: 5,
      title: "Cannot get the buyer to stop talking about this purchase",
      body:
        "Three years of it. Every dinner. Someone asks him a normal question and forty minutes later we are hearing about the time she carried his bag through the airport because his shoulder hurt. Five stars for the product. One star for what it has done to my Friday evenings, but that is not what this field is for.",
      ago: "Reviewed on 11 January 2024",
      verified: false,
      helpful: 412,
      status: "published",
    },
    {
      id: "rv5",
      author: "Bunty (3rd floor)",
      stars: 5,
      title: "She said hi to me once in the lift",
      body: "10/10. Have not recovered. Do not intend to.",
      ago: "Reviewed on 2 February 2026",
      verified: false,
      helpful: 7,
      status: "pending",
    },
  ],
  aboutSection: {
    heading: "From the Sharma Store",
    body:
      "We are a small family operation established in Lucknow in 1998 and we have released exactly one product. There is no roadmap, no second edition and no plan to scale. Everything we know about quality we learned from watching her decide, at 2 AM, that a friend of hers who lives four hours away needed company, and then going. If your order arrives and the packaging is a little dented, that is from the same trip. We do not intend to fix it.",
    imageUrl: photo("photo-1509316975850-ff9c5deb0cd9", 900, 500),
  },
  contributorPrompt:
    "Know Meera? Leave a review. Karan reads every one before it goes up, and he has a documented bias toward publishing the nice ones.",
};

/** Whitelisted keys that make up the flat wire payload (also the model content fields). */
export const PRODUCT_CONTENT_KEYS: readonly (keyof ProductData)[] = [
  "subject",
  "sender",
  "title",
  "storeName",
  "price",
  "stockLine",
  "deliveryLine",
  "bullets",
  "specs",
  "bundle",
  "qa",
  "reviews",
  "aboutSection",
  "contributorPrompt",
];

// ═══════════════════════════════════════════════════════════════════════════
// Caps and helpers
// ═══════════════════════════════════════════════════════════════════════════

export const MAX_PHOTOS = 8;
export const MAX_BULLETS = 10;
export const MAX_SPECS = 20;
export const MAX_BUNDLE = 4;
export const MAX_QA = 12;
export const MAX_REVIEWS = 40;

/** Hard caps on free text, so one pasted essay cannot destroy the buy box. */
const LIMITS = {
  name: 60,
  title: 200,
  storeName: 80,
  price: 24,
  /** "Reviewed on 14 February 2021" is 27 characters. Do not lower this to 24. */
  ago: 48,
  line: 200,
  bullet: 300,
  specLabel: 60,
  specValue: 160,
  question: 240,
  answer: 600,
  reviewTitle: 160,
  reviewBody: 2000,
  heading: 120,
  aboutBody: 2000,
  prompt: 240,
} as const;

const cut = (s: string, max: number): string => (s.length > max ? s.slice(0, max) : s);

/** A non-negative integer. Guards every rendered count against floats and negatives. */
const count = (v: unknown, fallback: number): number => {
  const n = num(v, fallback);
  return Number.isFinite(n) ? Math.max(0, Math.trunc(n)) : fallback;
};

/**
 * Only http(s) and data: URLs reach an <img src>. Anything else — `javascript:`
 * most of all — becomes the empty string, which the renderer draws as the grey
 * fallback cell.
 */
const imageUrl = (v: unknown): string => {
  const raw = strOr(v, "").trim();
  if (/^data:image\//i.test(raw)) return raw;
  if (/^https?:\/\//i.test(raw)) return raw;
  return "";
};

/** Clamps to 1…5 and truncates, because the histogram buckets on this. */
const starsOf = (v: unknown, fallback: StarRating): StarRating => {
  const n = Math.round(num(v, fallback));
  if (n >= 1 && n <= 5) return n as StarRating;
  return fallback;
};

/** Published reviews only, in the order given. What the recipient actually sees. */
export const publishedReviews = (data: ProductData): Review[] =>
  data.reviews.filter((r) => r.status === "published");

/** The star histogram: index 0 is 1★ … index 4 is 5★. Counts published only. */
export function starHistogram(data: ProductData): [number, number, number, number, number] {
  const buckets: [number, number, number, number, number] = [0, 0, 0, 0, 0];
  for (const r of publishedReviews(data)) buckets[r.stars - 1] += 1;
  return buckets;
}

/**
 * Mean rating over published reviews, to one decimal, as a NUMBER — this one is
 * genuinely arithmetic and has nothing to do with `price.amount`.
 */
export function averageStars(data: ProductData): number {
  const rows = publishedReviews(data);
  if (rows.length === 0) return 0;
  const total = rows.reduce((n, r) => n + r.stars, 0);
  return Math.round((total / rows.length) * 10) / 10;
}

// ═══════════════════════════════════════════════════════════════════════════
// Wire format
// ═══════════════════════════════════════════════════════════════════════════

/** UI state → flat body sent to POST/PUT. `password` optional (empty = no gate). */
export function productDataToBody(data: ProductData, password?: string): Record<string, unknown> {
  return bodyFromKeys(data, PRODUCT_CONTENT_KEYS, password);
}

function coerceSpec(o: Raw): Spec | null {
  const label = cut(strOr(o.label, "").trim(), LIMITS.specLabel);
  const value = cut(strOr(o.value, "").trim(), LIMITS.specValue);
  // A spec row with a blank side renders as a hole in the table.
  if (!label || !value) return null;
  return { label, value };
}

function coerceBundleItem(o: Raw): BundleItem | null {
  const name = cut(strOr(o.name, "").trim(), LIMITS.title);
  if (!name) return null;
  const note = cut(strOr(o.note, "").trim(), LIMITS.line);
  return {
    name,
    // String. Untouched by any numeric parse — see the header of this file.
    price: cut(str(o.price, "—").trim(), LIMITS.price),
    imageUrl: imageUrl(o.imageUrl),
    ...(note ? { note } : {}),
  };
}

function coerceQA(o: Raw): QA | null {
  const question = cut(strOr(o.question, "").trim(), LIMITS.question);
  const answer = cut(strOr(o.answer, "").trim(), LIMITS.answer);
  if (!question || !answer) return null;
  return {
    question,
    answer,
    by: cut(str(o.by, "Anonymous").trim(), LIMITS.name),
    ago: cut(strOr(o.ago, "").trim(), LIMITS.ago),
    votes: count(o.votes, 0),
  };
}

function coerceReview(o: Raw, index: number): Review | null {
  const body = cut(strOr(o.body, "").trim(), LIMITS.reviewBody);
  const title = cut(strOr(o.title, "").trim(), LIMITS.reviewTitle);
  // A review with neither a headline nor a body is not a review.
  if (!body && !title) return null;
  const img = imageUrl(o.imageUrl);
  return {
    id: cut(str(o.id, "").trim(), 64) || `rv${index + 1}`,
    author: cut(str(o.author, "Anonymous").trim(), LIMITS.name),
    stars: starsOf(o.stars, 5),
    title,
    body,
    ago: cut(strOr(o.ago, "").trim(), LIMITS.ago),
    verified: bool(o.verified, false),
    helpful: count(o.helpful, 0),
    ...(img ? { imageUrl: img } : {}),
    // Unknown values fail closed to "pending" — an unmoderated review must never
    // default its way onto the recipient's page.
    status: oneOf<ReviewStatus>(o.status, ["pending", "published"], "pending"),
  };
}

/**
 * DB/share response → UI state.
 *
 * Total function: every branch returns something drawable, and an empty or
 * absent payload falls all the way back to the demo listing rather than to a
 * blank screen. Nothing here parses a money string.
 */
export function dbToProductData(db: Raw | null | undefined): ProductData {
  const src = obj(db);

  const rawSubject = obj(src.subject);
  const photos = strList(rawSubject.photos, DEMO_DATA.subject.photos)
    .map(imageUrl)
    .filter(Boolean)
    .slice(0, MAX_PHOTOS);

  const rawPrice = obj(src.price);
  const original = cut(strOr(rawPrice.original, "").trim(), LIMITS.price);
  const discountPct =
    rawPrice.discountPct === undefined || rawPrice.discountPct === null
      ? undefined
      : Math.round(clampNum(rawPrice.discountPct, 0, 0, 100));

  const rawAbout = obj(src.aboutSection);
  const aboutImg = imageUrl(rawAbout.imageUrl);

  const reviews = list<Review>(src.reviews, coerceReview, DEMO_DATA.reviews).slice(0, MAX_REVIEWS);
  // Duplicate ids break React keys and make moderation ambiguous, so they are
  // renumbered here rather than anywhere downstream.
  const seen = new Set<string>();
  const uniqueReviews: Review[] = reviews.map((r, i) => {
    if (!seen.has(r.id)) {
      seen.add(r.id);
      return r;
    }
    let id = `${r.id}-${i}`;
    while (seen.has(id)) id = `${id}x`;
    seen.add(id);
    return { ...r, id };
  });

  return {
    subject: {
      firstName: cut(str(rawSubject.firstName, DEMO_DATA.subject.firstName).trim(), LIMITS.name),
      lastName: cut(strOr(rawSubject.lastName, DEMO_DATA.subject.lastName).trim(), LIMITS.name),
      photos: photos.length > 0 ? photos : DEMO_DATA.subject.photos,
    },
    sender: {
      firstName: cut(str(obj(src.sender).firstName, DEMO_DATA.sender.firstName).trim(), LIMITS.name),
    },
    title: cut(str(src.title, DEMO_DATA.title).trim(), LIMITS.title),
    storeName: cut(str(src.storeName, DEMO_DATA.storeName).trim(), LIMITS.storeName),
    price: {
      // str() keeps the string a string. "∞" survives, and so does "₹4,99,999".
      amount: cut(str(rawPrice.amount, DEMO_DATA.price.amount).trim(), LIMITS.price),
      ...(original ? { original } : {}),
      ...(discountPct === undefined ? {} : { discountPct }),
    },
    stockLine: cut(str(src.stockLine, DEMO_DATA.stockLine).trim(), LIMITS.line),
    deliveryLine: cut(str(src.deliveryLine, DEMO_DATA.deliveryLine).trim(), LIMITS.line),
    bullets: strList(src.bullets, DEMO_DATA.bullets)
      .map((b) => cut(b.trim(), LIMITS.bullet))
      .filter(Boolean)
      .slice(0, MAX_BULLETS),
    specs: list<Spec>(src.specs, coerceSpec, DEMO_DATA.specs).slice(0, MAX_SPECS),
    bundle: list<BundleItem>(src.bundle, coerceBundleItem, DEMO_DATA.bundle).slice(0, MAX_BUNDLE),
    qa: list<QA>(src.qa, coerceQA, DEMO_DATA.qa).slice(0, MAX_QA),
    reviews: uniqueReviews,
    aboutSection: {
      heading: cut(str(rawAbout.heading, DEMO_DATA.aboutSection.heading).trim(), LIMITS.heading),
      body: cut(str(rawAbout.body, DEMO_DATA.aboutSection.body).trim(), LIMITS.aboutBody),
      ...(aboutImg ? { imageUrl: aboutImg } : {}),
    },
    contributorPrompt: cut(str(src.contributorPrompt, DEMO_DATA.contributorPrompt).trim(), LIMITS.prompt),
  };
}
