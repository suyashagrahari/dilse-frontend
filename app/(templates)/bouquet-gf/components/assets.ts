// ─── Bouquet — central media registry + flower catalog ───────────────────────
// Every flower + greenery image is addressed through BQ_MEDIA_BASE, so the whole
// set can move to an S3/CDN origin by editing one line (after the files are
// uploaded with the same layout under a `bouquet-gf/` folder). Default is the
// local /public/assets/bouquet-gf folder, which always works in dev + as a
// fallback. Two parallel asset sets: `color/` and `mono/` (black-and-white).

// Served from /public/assets/bouquet-gf — the local fallback this module was
// always designed around. It used to point at S3 (bucket gifts-media-prod-123,
// ap-south-1, uploaded via `npm run upload:bouquet-media` in /server), but AWS
// disabled that bucket: every key now answers 403 `AllAccessDisabled`, anonymous
// and authenticated alike, so every bloom on this template rendered broken.
// All 33 files are tracked in git and copied into the image (Dockerfile copies
// /app/public), so this origin costs nothing extra and cannot be cut off.
// To move back to object storage, upload the same folder layout to the new
// bucket and set this to that base.
export const BQ_MEDIA_BASE = "/assets/bouquet-gf";

/** The composed gallery/OG cover, served from the same S3 origin. */
export const BQ_COVER_URL = `${BQ_MEDIA_BASE}/cover.webp`;

export type BouquetMode = "color" | "mono";

/** Resolve a flower/greenery file for the chosen mode. */
export const bqMedia = (mode: BouquetMode, file: string): string =>
  `${BQ_MEDIA_BASE.replace(/\/+$/, "")}/${mode}/${file.replace(/^\/+/, "")}`;

export interface Flower {
  /** Stable id (matches digibouquet's ordering) — stored in the payload. */
  id: number;
  /** Filename key (also the asset basename, `<key>.webp`). */
  key: string;
  /** Display name. */
  name: string;
  /** Flower-language meaning, surfaced as a tooltip. */
  meaning: string;
  /** Birth month it's associated with. */
  birthMonth: string;
  /** Rough visual size — biases how big it's drawn in the arrangement. */
  size: "small" | "medium" | "large";
}

/** The 12 pickable blooms, each with its flower-language meaning + birth month. */
export const FLOWERS: Flower[] = [
  { id: 1, key: "orchid", name: "Orchid", meaning: "Beauty", birthMonth: "October", size: "medium" },
  { id: 2, key: "tulip", name: "Tulip", meaning: "Perfect love", birthMonth: "April", size: "medium" },
  { id: 3, key: "dahlia", name: "Dahlia", meaning: "Elegance", birthMonth: "August", size: "small" },
  { id: 4, key: "anemone", name: "Anemone", meaning: "Anticipation", birthMonth: "September", size: "medium" },
  { id: 5, key: "carnation", name: "Carnation", meaning: "Fascination", birthMonth: "January", size: "large" },
  { id: 6, key: "zinnia", name: "Zinnia", meaning: "Lasting affection", birthMonth: "July", size: "medium" },
  { id: 7, key: "ranunculus", name: "Ranunculus", meaning: "Radiant charm", birthMonth: "March", size: "medium" },
  { id: 8, key: "sunflower", name: "Sunflower", meaning: "Adoration", birthMonth: "August", size: "large" },
  { id: 9, key: "lily", name: "Lily", meaning: "Purity", birthMonth: "May", size: "large" },
  { id: 10, key: "daisy", name: "Daisy", meaning: "Innocence", birthMonth: "April", size: "small" },
  { id: 11, key: "peony", name: "Peony", meaning: "Romance", birthMonth: "May", size: "medium" },
  { id: 12, key: "rose", name: "Rose", meaning: "Love & passion", birthMonth: "June", size: "medium" },
];

export const flowerById = (id: number): Flower | undefined => FLOWERS.find((f) => f.id === id);

/** Number of greenery "wraps" available (bush-1 … bush-3). */
export const GREENERY_COUNT = 3;

/** Background greenery image for a greenery index (0-based → bush-1…3). */
export const greeneryBack = (mode: BouquetMode, greenery: number): string =>
  bqMedia(mode, `bush-${(((greenery % GREENERY_COUNT) + GREENERY_COUNT) % GREENERY_COUNT) + 1}.webp`);

/** Optional foreground overlay that sits IN FRONT of the stems (only bush-1 has one). */
export const greeneryFront = (mode: BouquetMode, greenery: number): string | null => {
  const idx = (((greenery % GREENERY_COUNT) + GREENERY_COUNT) % GREENERY_COUNT);
  return idx === 0 ? bqMedia(mode, "bush-1-top.webp") : null;
};

/** Min / max blooms a bouquet may hold (matches digibouquet's 6–10 rule). */
export const MIN_BLOOMS = 6;
export const MAX_BLOOMS = 10;
