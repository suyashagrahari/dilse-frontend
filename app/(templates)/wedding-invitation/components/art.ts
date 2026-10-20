// ─── Classic's per-theme art (the v2 pack, ../../_wedding/art) ───────────────
//
// One backdrop plate and ONE floral pose per theme (the spec keeps Classic to a
// single floral family pose: a top-right cluster and its smaller mirror at the
// bottom-left), plus the shared gold flourish divider. The light themes wear
// watercolour florals in their own palette (blush anemones, peach roses,
// powder hydrangea); the dark ones wear ivory / white roses on velvet, marble
// or damask, with a gold laurel round the monogram.
//
// A `crop` cuts a cluster out of a larger piece (a % window of the image), with
// soft feathered edges (a static gradient mask), so a framed bouquet can be
// used without its gold frame lines.

import { art, art2x, type WeddingArtId } from "../../_wedding/art";
import type { WeddingThemeId } from "../../_wedding/themes";

export interface FloralSpec {
  id: WeddingArtId;
  /** Window of the image to show, in % of its width/height: [x, y, w, h]. */
  crop?: [number, number, number, number];
  /** Feather the crop's left/right edges (%, 0 = hard). */
  feather?: number;
  /** Rotation of the top-right cluster (deg); the bottom-left mirrors it. */
  rot: number;
  /** Width of the top-right cluster as a share of the card width. */
  size: number;
}

export interface ClassicArt {
  plate: WeddingArtId;
  /** The plate is heavy at 2× (velvet / damask): ship 1× and let it scale (it is soft texture). */
  plate1x?: boolean;
  floral: FloralSpec;
  /** Gold laurel round the monogram (dark themes). */
  laurel?: boolean;
  /** Petal fill: [light, deep] gradient stops, and the vein. */
  petal: [string, string, string];
}

export const CLASSIC_ART: Record<WeddingThemeId, ClassicArt> = {
  blush: {
    plate: "plate/blush",
    floral: { id: "floral/blush-floral-spray-01", rot: 38, size: 0.62 },
    petal: ["#fde3e6", "#e9a2ad", "rgba(176, 82, 98, .35)"],
  },
  champagne: {
    plate: "plate/champagne",
    floral: { id: "floral/peach-roses-spray-01", rot: 36, size: 0.6 },
    petal: ["#fff1e2", "#f2b996", "rgba(176, 112, 70, .32)"],
  },
  powder: {
    plate: "plate/powder",
    floral: { id: "floral/powder-hydrangea-gold-frame-01", crop: [10, 44, 82, 56], feather: 9, rot: 30, size: 0.64 },
    petal: ["#f4f8fd", "#a9c1db", "rgba(62, 95, 134, .3)"],
  },
  maroon: {
    plate: "plate/maroon",
    plate1x: true,
    floral: { id: "floral/white-roses-bunch-01", rot: 28, size: 0.6 },
    laurel: true,
    petal: ["#fffaf0", "#ecd9bd", "rgba(150, 110, 50, .3)"],
  },
  noir: {
    plate: "plate/noir",
    floral: { id: "floral/ivory-rose-bloom-01", rot: 0, size: 0.4 },
    laurel: true,
    petal: ["#fff8e8", "#e3cfa6", "rgba(150, 115, 40, .32)"],
  },
  emerald: {
    plate: "plate/emerald",
    plate1x: true,
    floral: { id: "floral/white-roses-bunch-01", rot: 28, size: 0.6 },
    laurel: true,
    petal: ["#fffaf0", "#ecdcc0", "rgba(150, 115, 50, .3)"],
  },
};

/** The plate as an <img>: 540w / 1080w (1× only for the heavy velvet / damask plates). */
export function plateImg(theme: WeddingThemeId) {
  const a = CLASSIC_ART[theme];
  const one = art(a.plate);
  return {
    src: one.src,
    srcSet: a.plate1x ? undefined : `${one.src} 540w, ${art2x(a.plate)} 1080w`,
    sizes: a.plate1x ? undefined : "100vw",
    w: one.w,
    h: one.h,
  };
}

/** A cutout as an <img> with width descriptors, so a 640 px source covers a ~300 css px slot at 2×. */
export function cutoutImg(id: WeddingArtId) {
  const a = art(id);
  return { src: a.src, srcSet: `${a.src} ${a.w}w, ${art2x(id)} ${a.w * 2}w`, w: a.w, h: a.h };
}

/** The gold laurel round the monogram: the crown wreath, crown cropped off. */
export const LAUREL: { id: WeddingArtId; crop: [number, number, number, number] } = { id: "gold/gold-laurel-crown-wreath-01", crop: [0, 25, 100, 75] };
export const DIVIDER_ART: WeddingArtId = "gold/gold-flourish-divider-01";

/** Every image the opened card needs, to decode before the scene starts. */
export function cardArtUrls(theme: WeddingThemeId): string[] {
  const a = CLASSIC_ART[theme];
  const urls = [art(a.floral.id).src, art(DIVIDER_ART).src];
  if (a.laurel) urls.push(art(LAUREL.id).src);
  return urls;
}
