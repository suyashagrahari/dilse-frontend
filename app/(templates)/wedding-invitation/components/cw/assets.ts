// ─── Classic (Gulabi Jharokha): the art, served from /public/wedding-v3 ─────
//
// Every file lives IN THE REPO (client/public/wedding-v3/…) and is served by
// Next from the site's own origin. Never upload them to S3 or the CDN. Sizes
// are the intrinsic webp sizes (width/height on every <img>: no layout shift).
//
//   openings/classic  the jharokha frame + pink dawn over a lake palace (drawn
//                     in-house, feat/wr-openings) and the light rays / petals
//   classic/          the Met's CC0 marble jali split into two shutters,
//                     re-graded from grey marble to warm ivory for this palette
//                     (scratchpad tint.cjs: luminance → #64403C…#FFF7F0 ramp)
//   template9         peach couple, floral gazebo, peony trees, the gold lattice
//                     panel (classic/lattice-gold.webp: its sample text removed,
//                     the paper made transparent: scratchpad lattice.cjs)
//   template8         gold line-art swirl, rose bouquet, gold Ganesha, mandala tile
//   template3         pink peony bouquet, pampas border (the closing)
//   template14        the couple dressed for each function (haldi, mehndi,
//                     sangeet, engagement, wedding, reception) on its card
//   classic/floral-canopy  template15's floral arch, top band; template11's
//                     blossom lanterns; template3's couple on the swing (RSVP)
//   classic/gold-mandala  template16's gold mandala (480px), the slow halo
//                     turning behind the couple in the hero

export interface CwAsset {
  src: string;
  w: number;
  h: number;
}

const a = (src: string, w: number, h: number): CwAsset => ({ src: `/wedding-v3/${src}`, w, h });

export const A = {
  // the opening
  frame: a("openings/classic/jharokha-frame.webp", 908, 1800),
  dawn: a("openings/classic/dawn-bg.webp", 1080, 1800),
  shutterL: a("classic/jaali-left.webp", 475, 1800),
  shutterR: a("classic/jaali-right.webp", 505, 1800),
  shutterLsm: a("classic/jaali-left-sm.webp", 238, 902),
  shutterRsm: a("classic/jaali-right-sm.webp", 253, 902),
  rays: a("openings/_shared/light-rays-sm.webp", 675, 900),
  petal: a("openings/_shared/petal-rose.webp", 128, 128),
  petalSakura: a("openings/_shared/petal-sakura.webp", 128, 128),
  sparkle: a("openings/_shared/sparkle.webp", 128, 128),
  // the garden of the invitation
  gazebo: a("template9/01-floral-gazebo-pavilion.webp", 800, 617),
  couple: a("template9/02-couple-illustration-peach.webp", 575, 800),
  // template9's peony trees with the card's lattice and a stray gazebo pillar removed (scratchpad tree.cjs)
  treeL: a("classic/peony-tree-l.webp", 295, 1029),
  treeR: a("classic/peony-tree-r.webp", 291, 1029),
  lattice: a("classic/lattice-gold.webp", 1091, 380),
  swirl: a("template8/01-gold-line-art-floral-swirl-720.webp", 720, 654),
  roses: a("template8/02-pink-white-rose-bouquet.webp", 800, 686),
  ganesha: a("template8/03-gold-ganesha.webp", 415, 535),
  mandala: a("template8/04-cream-mandala-diamond-pattern-tile.webp", 320, 560),
  peonies: a("template3/11-pink-peony-bouquet.webp", 728, 800),
  pampas: a("template3/13-pampas-grass-border.webp", 800, 553),
  pampasCorner: a("template3/09-pampas-grass-corner.webp", 595, 800),
  mandalaGold: a("classic/gold-mandala.webp", 480, 480),
  // template15's pink-and-white floral arch, its top band only (1200 × 450): the canopy over the window and the hero
  canopy: a("classic/floral-canopy.webp", 1200, 450),
  // template11: two lanterns hanging on cherry-blossom strings
  lanterns: a("template11/08-hanging-lanterns-blossoms.webp", 468, 800),
  // template3: the couple on a flowered swing (the RSVP panel)
  swing: a("template3/05-couple-on-swing.webp", 800, 789),
} as const;

/** The couple dressed for each kind of function (template14): the kit's map. */
export { FN_COUPLE } from "../../../_wedding/i18n";

/** The kit's paper textures, from this repo (the kit's defaults point at the CDN). */
export const CW_KIT = {
  linen: "/wedding-v3/classic/kit/linen-overlay.webp",
  silk: "/wedding-v3/classic/kit/paper-silk-light.webp",
} as const;

/**
 * Where each shutter sits in the 908×1800 jharokha frame, in % of the frame
 * (left, top, width, height) — openings/classic/layout.json. The apex of the
 * jali is off-centre, so the split is 49/52, not 50/50.
 */
export const SHUTTER_BOX = {
  left: { x: 16.429, y: 20.18, w: 32.898, h: 62.883 },
  right: { x: 48.618, y: 20.18, w: 34.954, h: 62.883 },
} as const;

/** <img> props for one asset: intrinsic size (no layout shift), lazy below the fold. */
export function img(asset: CwAsset, opts: { lazy?: boolean; high?: boolean; alt?: string } = {}) {
  return {
    src: asset.src,
    width: asset.w,
    height: asset.h,
    alt: opts.alt ?? "",
    decoding: "async" as const,
    loading: opts.lazy ? ("lazy" as const) : ("eager" as const),
    ...(opts.high ? { fetchPriority: "high" as const } : {}),
  };
}

/** Wait for these <img>s to decode, but never longer than `cap` ms. */
export function decodeAll(imgs: (HTMLImageElement | null | undefined)[], cap = 1500): Promise<void> {
  const list = imgs.filter((i): i is HTMLImageElement => !!i);
  const all = Promise.all(list.map((i) => (i.decode ? i.decode().catch(() => undefined) : undefined))).then(() => undefined);
  return Promise.race([all, new Promise<void>((r) => window.setTimeout(r, cap))]);
}

/** A seeded PRNG so particle layouts render identically every time. */
export function seeded(seed: number) {
  let s = seed >>> 0 || 1;
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
}
