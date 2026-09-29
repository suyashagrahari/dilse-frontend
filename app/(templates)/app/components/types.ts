// ─── App Listing — frozen data contract ──────────────────────────────────────
//
// A person rendered as a software listing: icon, ratings, screenshots,
// description, version history, and reviews that the couple's friends write.
//
// ── BRAND ────────────────────────────────────────────────────────────────────
//
// The LAYOUT is a faithful clone of a phone storefront's product page (and its
// desktop/tablet web counterpart): icon, GET pill with the real press/progress
// ring, the facts strip, marketing screenshots, ratings, privacy cards and the
// information table. What it never copies is a mark: no storefront wordmark,
// no vendor logo, no vendor or platform names in copy, alt text or comments.
// The chrome is "<seller>'s Store" and the tint is a warm system pink.
//
// ── THE ROMANCE LIVES IN THE COPY ────────────────────────────────────────────
//
// Played completely straight at first glance. Version history = relationship
// milestones, reviews = her friends, in-app purchases = hugs, privacy = the
// things he quietly keeps track of. OPEN, once installed, opens the letter.

export interface AppMeta {
  /** "Meera" */
  name: string;
  /** "Girlfriend · Utilities" */
  subtitle: string;
  iconUrl: string;
  /** "Sharma Family Enterprises" */
  developer: string;
  /** "4+" — printed in a rounded-square outline in the stats strip. */
  ageRating: string;
  category: string;
  /** "1 human" — free text, never a byte count. */
  size: string;
  /** "English, Hindi, Sarcasm" */
  languages: string;
  /** "Free (emotionally expensive)" — free text, never parsed as currency. */
  price: string;
  /** The sender's own name. The "Seller" row, and who signs the letter. */
  seller: string;
  /** "Works with me only." — the Compatibility row. */
  compatibility: string;
  /** Framing of the icon photo (focal point 0–100, zoom 100–300). */
  iconCropX?: number;
  iconCropY?: number;
  iconScale?: number;
}

/** The privacy "nutrition label" cards — short category names. */
export interface AppPrivacy {
  /** "Data Used to Track You" */
  tracked: string[];
  /** "Data Linked to You" */
  linked: string[];
}

/**
 * The aggregate.
 *
 * `average` is the mean over PUBLISHED reviews only, one decimal, half-up. It
 * arrives here unrounded-to-integer on purpose: the star widget fills to the
 * exact fraction, and a 4.9 that renders as five full stars is the single
 * fastest way to make the page read as a mock-up.
 *
 * Zero published reviews is "No Ratings Yet" with the histogram hidden. Never
 * "0.0" — a zero rating is a claim, an absent rating is a fact.
 */
export interface AppRating {
  average: number;
  /** Free text: "8,472". Display only. */
  count: string;
  /** 1★…5★ counts in index order. Percentages derived from this must sum to 100. */
  distribution: readonly number[];
}

export interface AppScreenshot {
  imageUrl: string;
  caption: string;
  cropX?: number;
  cropY?: number;
  scale?: number;
}

export interface AppDescription {
  /** Always shown. */
  short: string[];
  /** Revealed by "more". Height-animated from measured scrollHeight, never max-height. */
  full: string[];
}

export interface AppWhatsNew {
  version: string;
  date: string;
  notes: string[];
}

/**
 * One changelog entry.
 *
 * Newest first in the array. The OLDEST entry (v1.0) should carry the shortest,
 * driest note — the contrast against the later unhinged ones is where the joke
 * lands, so the renderer must never truncate or reorder.
 */
export interface AppVersion {
  version: string;
  date: string;
  /** "1 human", "1 human (now with opinions)" — free text. */
  size: string;
  notes: string[];
}

export interface AppInfoRow {
  label: string;
  value: string;
  /** Renders as an accent link that fires a toast rather than navigating. */
  link?: boolean;
}

export type AppStar = 1 | 2 | 3 | 4 | 5;

export interface AppReview {
  id: string;
  author: string;
  stars: AppStar;
  title: string;
  body: string;
  /** "2d ago" — pre-formatted by the caller. Never a Date. */
  ago: string;
  version?: string;
  /**
   * The sender's reply, indented beneath the review. This is the best place in
   * the whole template for their funniest writing.
   */
  developerResponse?: { text: string; ago: string };
  status: "pending" | "published";
}

export interface AppData {
  app: AppMeta;
  rating: AppRating;
  screenshots: AppScreenshot[];
  description: AppDescription;
  whatsNew: AppWhatsNew;
  versionHistory: AppVersion[];
  info: AppInfoRow[];
  reviews: AppReview[];
  /** Shown to friends on the contributor landing. */
  contributorPrompt: string;
  /** In-app purchases, one per line: "Forehead kiss · ₹0". */
  iap: string[];
  privacy: AppPrivacy;
  /** The main letter that waits in the bottom-right corner. */
  letter: string;
  /** Optional "answer me first" question before the letter opens. */
  lockQuestion: string;
  /** Label of the yes button on that question. */
  lockAnswer: string;
}

/** Contributor form caps. Exactly four fields — stars, title, body, name. */
export const APP_REVIEW_LIMITS = {
  title: 60,
  body: 200,
  author: 30,
} as const;

/** The install pill's three states. `installing` runs a 2s progress ring. */
export type InstallState = "idle" | "installing" | "installed";
