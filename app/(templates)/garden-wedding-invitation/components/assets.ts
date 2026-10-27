// ─── Mughal Garden Wedding Invitation: the owner's art, from the media CDN ───
//
// Generated from public/wedding-v3/manifest.json. These files live IN THE REPO
// (client/public/wedding-v3/<folder>/) and are mirrored on the media CDN
// (../../_wedding/media.ts). The table keeps the same-origin paths: `gwImg()`
// and the CSS backgrounds hand the browser the CDN URL, while the invite card's
// canvas (gw/inviteCard.ts) reads the same-origin path (the CDN sends no CORS
// header). Sizes are the intrinsic webp sizes (use them for width/height so
// images never shift the layout).

import { cdn } from "../../_wedding/media";

export interface WeddingAsset { src: string; w: number; h: number; sameOrigin?: boolean }

export const GW_ASSETS = {
  "template1": {
    "01-cloud-1": { src: "/wedding-v3/template1/01-cloud-1.webp", w: 800, h: 541 },
    "02-parchment-1": { src: "/wedding-v3/template1/02-parchment-1.webp", w: 1600, h: 893 },
    "03-gazebo": { src: "/wedding-v3/template1/03-gazebo.webp", w: 503, h: 800 },
    "04-pink-lantern": { src: "/wedding-v3/template1/04-pink-lantern.webp", w: 382, h: 800 },
    "05-gazebo-with-garden-1": { src: "/wedding-v3/template1/05-gazebo-with-garden-1.webp", w: 800, h: 618 },
    "06-gazebo-with-garden-2": { src: "/wedding-v3/template1/06-gazebo-with-garden-2.webp", w: 1600, h: 1235 },
    "07-parchment-2": { src: "/wedding-v3/template1/07-parchment-2.webp", w: 800, h: 447 },
    "08-peacock": { src: "/wedding-v3/template1/08-peacock.webp", w: 392, h: 800 },
    "09-garden-rocks": { src: "/wedding-v3/template1/09-garden-rocks.webp", w: 800, h: 315 },
    "10-cloud-2": { src: "/wedding-v3/template1/10-cloud-2.webp", w: 1600, h: 1082 },
    "11-parchment-3": { src: "/wedding-v3/template1/11-parchment-3.webp", w: 1800, h: 1005 },
    "12-pink-chhatri-umbrella": { src: "/wedding-v3/template1/12-pink-chhatri-umbrella.webp", w: 549, h: 800 },
    "13-hedge-stone-wall": { src: "/wedding-v3/template1/13-hedge-stone-wall.webp", w: 800, h: 514 },
    "14-couple-lehenga": { src: "/wedding-v3/template1/14-couple-lehenga.webp", w: 589, h: 800 },
    "15-rose-stem": { src: "/wedding-v3/template1/15-rose-stem.webp", w: 378, h: 800 },
    "card": { src: "/wedding-v3/template1/card.webp", w: 600, h: 847 },
    // Derived for this template (scratchpad derive.cjs): a lighter cloud and the OG backdrop.
    "gw-cloud-2-900": { src: "/wedding-v3/template1/gw-cloud-2-900.webp", w: 900, h: 609 },
    "gw-og": { src: "/wedding-v3/template1/gw-og.jpg", w: 1200, h: 630 },
  },
  "template6": {
    "01-sky-watercolour-background": { src: "/wedding-v3/template6/01-sky-watercolour-background.webp", w: 1800, h: 1013 },
    "02-flamingo-floral-top-bottom-border": { src: "/wedding-v3/template6/02-flamingo-floral-top-bottom-border.webp", w: 1600, h: 1551 },
    "03-banana-plant-a": { src: "/wedding-v3/template6/03-banana-plant-a.webp", w: 1080, h: 1600 },
    "04-pink-gazebo-dome": { src: "/wedding-v3/template6/04-pink-gazebo-dome.webp", w: 1006, h: 1600 },
    "05-anthurium-floral-bunch": { src: "/wedding-v3/template6/05-anthurium-floral-bunch.webp", w: 687, h: 800 },
    "06-green-tree-shrub": { src: "/wedding-v3/template6/06-green-tree-shrub.webp", w: 800, h: 637 },
    "07-couple-on-sofa-mehndi": { src: "/wedding-v3/template6/07-couple-on-sofa-mehndi.webp", w: 800, h: 562 },
    "08-banana-plant-b": { src: "/wedding-v3/template6/08-banana-plant-b.webp", w: 540, h: 800 },
    "09-palm-frond": { src: "/wedding-v3/template6/09-palm-frond.webp", w: 501, h: 800 },
    "10-peacock": { src: "/wedding-v3/template6/10-peacock.webp", w: 392, h: 800 },
    "11-white-balustrade-railing": { src: "/wedding-v3/template6/11-white-balustrade-railing.webp", w: 800, h: 266 },
    "12-mountains-lake-landscape-cutout": { src: "/wedding-v3/template6/12-mountains-lake-landscape-cutout.webp", w: 1091, h: 470 },
    "card": { src: "/wedding-v3/template6/card.webp", w: 600, h: 852 },
    // Derived: the flamingo band alone, the lake view above the sofa couple, a phone-sized banana plant.
    "gw-flamingo-top": { src: "/wedding-v3/template6/gw-flamingo-top.webp", w: 960, h: 346 },
    "gw-lake-venue": { src: "/wedding-v3/template6/gw-lake-venue.webp", w: 1091, h: 380 },
    "gw-banana-a-800": { src: "/wedding-v3/template6/gw-banana-a-800.webp", w: 540, h: 800 },
  },
  "template11": {
    "01-banana-plant": { src: "/wedding-v3/template11/01-banana-plant.webp", w: 1215, h: 1600 },
    "02-lotus-cluster-pink": { src: "/wedding-v3/template11/02-lotus-cluster-pink.webp", w: 799, h: 800 },
    "03-stone-fountain": { src: "/wedding-v3/template11/03-stone-fountain.webp", w: 800, h: 754 },
    "04-tropical-leaf-plant": { src: "/wedding-v3/template11/04-tropical-leaf-plant.webp", w: 800, h: 720 },
    "05-lotus-tall-stems": { src: "/wedding-v3/template11/05-lotus-tall-stems.webp", w: 664, h: 800 },
    "06-cherry-blossom-branch": { src: "/wedding-v3/template11/06-cherry-blossom-branch.webp", w: 800, h: 504 },
    "07-pink-gazebo-dome": { src: "/wedding-v3/template11/07-pink-gazebo-dome.webp", w: 503, h: 800 },
    "08-hanging-lanterns-blossoms": { src: "/wedding-v3/template11/08-hanging-lanterns-blossoms.webp", w: 468, h: 800 },
    "09-peacock-with-flowers": { src: "/wedding-v3/template11/09-peacock-with-flowers.webp", w: 435, h: 800 },
    "card": { src: "/wedding-v3/template11/card.webp", w: 600, h: 240 },
    "gw-banana-800": { src: "/wedding-v3/template11/gw-banana-800.webp", w: 608, h: 800 },
  },
  "template9": {
    "00-background-colour": { src: "/wedding-v3/template9/00-background-colour.webp", w: 1013, h: 1800 },
    "01-floral-gazebo-pavilion": { src: "/wedding-v3/template9/01-floral-gazebo-pavilion.webp", w: 800, h: 617 },
    "02-couple-illustration-peach": { src: "/wedding-v3/template9/02-couple-illustration-peach.webp", w: 575, h: 800 },
    "03-peony-tree-left-with-lotus-leaves": { src: "/wedding-v3/template9/03-peony-tree-left-with-lotus-leaves.webp", w: 300, h: 1029 },
    "04-peony-tree-right-with-lotus-leaves": { src: "/wedding-v3/template9/04-peony-tree-right-with-lotus-leaves.webp", w: 296, h: 1029 },
    "05-gold-lattice-arch-top-panel": { src: "/wedding-v3/template9/05-gold-lattice-arch-top-panel.webp", w: 1091, h: 380 },
    "card": { src: "/wedding-v3/template9/card.webp", w: 600, h: 852 },
    // Derived: the lattice band and arch crown above the panel's baked-in text.
    "gw-lattice-top": { src: "/wedding-v3/template9/gw-lattice-top.webp", w: 1091, h: 150 },
    // Derived: the whole lattice arch, its inside cut away so the card shows through.
    "gw-arch-crown": { src: "/wedding-v3/template9/gw-arch-crown.webp", w: 1091, h: 356, sameOrigin: true },
    // Derived: the peony trees at 2× (lanczos + light unsharp) so they stay crisp at full height.
    "gw-peony-left-2x": { src: "/wedding-v3/template9/gw-peony-left-2x.webp", w: 600, h: 2058, sameOrigin: true },
    "gw-peony-right-2x": { src: "/wedding-v3/template9/gw-peony-right-2x.webp", w: 592, h: 2058, sameOrigin: true },
    // From the owner's asset library (template21 pink peony flowers): a sharp bunch for the opening's corners.
    "gw-peony-corner": { src: "/wedding-v3/template9/gw-peony-corner.webp", w: 680, h: 977, sameOrigin: true },
  },
} as const satisfies Record<string, Record<string, WeddingAsset>>;

/** The gallery card (also the template's coverImage). */
export const GW_CARD = "/wedding-v3/template1/card.webp";

const T1 = GW_ASSETS.template1;
const T6 = GW_ASSETS.template6;
const T11 = GW_ASSETS.template11;
const T9 = GW_ASSETS.template9;

/** The pieces the garden is built from, by role. */
export const GW = {
  sky: T6["01-sky-watercolour-background"],
  cloudA: T1["01-cloud-1"],
  cloudB: T1["gw-cloud-2-900"],
  gazebo: T1["05-gazebo-with-garden-1"],
  gazebo2x: T1["06-gazebo-with-garden-2"],
  gazeboDome: T11["07-pink-gazebo-dome"],
  pavilion: T9["01-floral-gazebo-pavilion"],
  couple: T1["14-couple-lehenga"],
  coupleSofa: T6["07-couple-on-sofa-mehndi"],
  couplePeach: T9["02-couple-illustration-peach"],
  peacock: T1["08-peacock"],
  peacockFlowers: T11["09-peacock-with-flowers"],
  lantern: T1["04-pink-lantern"],
  lanterns: T11["08-hanging-lanterns-blossoms"],
  chhatri: T1["12-pink-chhatri-umbrella"],
  hedge: T1["13-hedge-stone-wall"],
  rocks: T1["09-garden-rocks"],
  rose: T1["15-rose-stem"],
  bananaL: T11["gw-banana-800"],
  bananaR: T6["gw-banana-a-800"],
  bananaB: T6["08-banana-plant-b"],
  palm: T6["09-palm-frond"],
  anthurium: T6["05-anthurium-floral-bunch"],
  shrub: T6["06-green-tree-shrub"],
  balustrade: T6["11-white-balustrade-railing"],
  lake: T6["gw-lake-venue"],
  flamingos: T6["gw-flamingo-top"],
  lotus: T11["02-lotus-cluster-pink"],
  lotusStems: T11["05-lotus-tall-stems"],
  fountain: T11["03-stone-fountain"],
  leaf: T11["04-tropical-leaf-plant"],
  blossom: T11["06-cherry-blossom-branch"],
  peonyL: T9["03-peony-tree-left-with-lotus-leaves"],
  peonyR: T9["04-peony-tree-right-with-lotus-leaves"],
  peonyL2x: T9["gw-peony-left-2x"],
  peonyR2x: T9["gw-peony-right-2x"],
  lattice: T9["gw-lattice-top"],
  archCrown: T9["gw-arch-crown"],
  peonyCorner: T9["gw-peony-corner"],
  og: T1["gw-og"],
} as const;

/**
 * <img> props for one asset: intrinsic width/height (no layout shift), async
 * decode, lazy below the fold, high priority for the opening scene, and an
 * optional 2× source (the 800 / 1600 gazebo pair). From the CDN: never a mask or canvas source.
 * `sameOrigin` files (the opening's derived art) are not on the CDN yet and come from public/.
 */
export function gwImg(a: WeddingAsset, o: { lazy?: boolean; high?: boolean; alt?: string; hi?: WeddingAsset; sizes?: string } = {}) {
  const url = (x: WeddingAsset) => (x.sameOrigin ? x.src : cdn(x.src));
  return {
    src: url(a),
    ...(o.hi ? { srcSet: `${url(a)} ${a.w}w, ${url(o.hi)} ${o.hi.w}w`, sizes: o.sizes ?? "(min-width: 1024px) 46vw, 100vw" } : {}),
    width: a.w,
    height: a.h,
    alt: o.alt ?? "",
    decoding: "async" as const,
    loading: o.lazy ? ("lazy" as const) : ("eager" as const),
    ...(o.high ? { fetchPriority: "high" as const } : {}),
    draggable: false,
  };
}
