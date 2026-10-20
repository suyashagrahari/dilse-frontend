// ─── Premium's art direction: which pack image plays which part, per theme ──
//
// One small map (spec 3.2: "theme → family → shared"). Light themes get their
// own watercolour florals; the three dark themes share ivory roses + gold.
// Every id is from the v2 pack (../../_wedding/art.ts, on the CDN).
//
// Sizes: pack files are 1× = the numbers in WEDDING_ART and @2x = double, so
// srcSet uses width descriptors and `sizes` says how wide the layer is drawn.
// Front blooms are drawn ~220 css px wide, so a 640 px 1× file is already
// sharp at DPR 2 and the @2x never downloads (the budget in spec 7.2).

import { art, type WeddingArtId, type WeddingThemeId } from "../../_wedding";

/** A crop window over a pack image, in % of its width/height. */
export interface Crop {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Bloom {
  id: WeddingArtId;
  crop?: Crop;
  /** Mirror it (one file, two poses). */
  flip?: boolean;
}

/** Where a front bloom sits on the arch: width as a fraction of the arch's
 *  width, offsets in % of the arch box (left/top for TL, right/bottom for BR),
 *  and a static tilt. */
export interface Place {
  w: number;
  x: number;
  y: number;
  r: number;
}

export interface PremiumArt {
  plate: WeddingArtId;
  /** Back plane: soft foliage (light) or gold glitter haze (dark). */
  back: WeddingArtId;
  backKind: "foliage" | "glitter";
  bloomTL: Bloom;
  bloomBR: Bloom;
  tl: Place;
  br: Place;
  /** Closing garland (light) or the flanking rose bunches (dark). */
  garland: Bloom;
  garlandKind: "swag" | "flank";
}

/** The arch every theme shares: antique gold + ivory with rose inlay. Its
 *  opening (measured on the file): x 17–82.4 %, y 15.3–81.4 %, round top. */
export const ARCH: WeddingArtId = "gold/gold-arch-mirror-frame-roses-01";
export const ARCH_OPENING = { x: 17, y: 15.3, w: 65.4, h: 66.1 } as const;
export const STEM_HEAD: WeddingArtId = "floral/ivory-rose-bloom-01";
export const WREATH: WeddingArtId = "gold/gold-laurel-crown-wreath-01";

const HYDRANGEA: Bloom = {
  id: "floral/powder-hydrangea-gold-frame-01",
  crop: { x: 2, y: 50, w: 98, h: 50 },
};
const DARK: Omit<PremiumArt, "plate"> = {
  back: "gold/gold-glitter-lights-01",
  backKind: "glitter",
  bloomTL: { id: "floral/white-roses-bunch-01", flip: true },
  bloomBR: { id: "floral/white-roses-bunch-01" },
  tl: { w: 0.62, x: -22, y: -2, r: -14 },
  br: { w: 0.64, x: -22, y: 2, r: -8 },
  garland: { id: "floral/white-roses-bunch-01" },
  garlandKind: "flank",
};

export const PREMIUM_ART: Record<WeddingThemeId, PremiumArt> = {
  blush: {
    plate: "plate/blush",
    back: "floral/greenery-swag-pair-01",
    backKind: "foliage",
    bloomTL: { id: "floral/blush-floral-spray-01" },
    bloomBR: { id: "floral/peach-roses-spray-01" },
    tl: { w: 0.78, x: -30, y: 6, r: -38 },
    br: { w: 0.82, x: -26, y: 6, r: -16 },
    garland: { id: "floral/blush-roses-vintage-swag-01" },
    garlandKind: "swag",
  },
  champagne: {
    plate: "plate/champagne",
    back: "floral/greenery-swag-pair-01",
    backKind: "foliage",
    bloomTL: { id: "floral/peach-roses-spray-01", flip: true },
    bloomBR: { id: "floral/blush-roses-border-01" },
    tl: { w: 0.78, x: -28, y: 4, r: -34 },
    br: { w: 0.9, x: -22, y: 8, r: -20 },
    garland: { id: "floral/blush-roses-border-01" },
    garlandKind: "swag",
  },
  powder: {
    plate: "plate/powder",
    back: "floral/greenery-swag-pair-01",
    backKind: "foliage",
    bloomTL: {
      id: "floral/powder-roses-gold-diamond-01",
      crop: { x: 0, y: 4, w: 48, h: 72 },
    },
    bloomBR: HYDRANGEA,
    tl: { w: 0.5, x: -20, y: -4, r: -8 },
    br: { w: 0.9, x: -22, y: 4, r: -10 },
    garland: HYDRANGEA,
    garlandKind: "swag",
  },
  maroon: { plate: "plate/maroon", ...DARK },
  noir: { plate: "plate/noir", ...DARK },
  emerald: { plate: "plate/emerald", ...DARK },
};

/** <img> props for a pack image drawn `css` px wide (or a `sizes` string). */
export function artImg(id: WeddingArtId, sizes: string | number) {
  const a = art(id);
  const two = a.src.replace(/\.webp$/, "@2x.webp");
  return {
    src: a.src,
    srcSet: `${a.src} ${a.w}w, ${two} ${a.w * 2}w`,
    sizes: typeof sizes === "number" ? `${sizes}px` : sizes,
    width: a.w,
    height: a.h,
  };
}

/** Aspect (w / h) of a bloom, after its crop. */
export function bloomAspect(b: Bloom): number {
  const a = art(b.id);
  const c = b.crop ?? { x: 0, y: 0, w: 100, h: 100 };
  return (a.w * c.w) / (a.h * c.h);
}
