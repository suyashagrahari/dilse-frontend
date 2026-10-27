// ─── Lotus Temple: the owner's art, served from /public/wedding-v3 ───────────
// Every image here lives in the repo (client/public/wedding-v3/<folder>/) and is
// served from the site's own origin. Nothing comes from S3 or the CDN.

import { LW_ASSETS, type WeddingAsset } from "../assets";

/** The pieces this template uses, by a short name. */
export const A = {
  lights: LW_ASSETS.template12["01-gold-string-lights"],
  leafLarge: LW_ASSETS.template12["02-gold-lotus-leaf-large"],
  bloomStem: LW_ASSETS.template12["03-white-gold-lotus-bloom-stem"],
  leafStem: LW_ASSETS.template12["04-gold-lotus-leaf-on-stem"],
  bloomOpen: LW_ASSETS.template12["05-white-gold-lotus-open"],
  leafTilt: LW_ASSETS.template12["06-gold-lotus-leaf-tilted"],
  budA: LW_ASSETS.template12["07-white-gold-lotus-bud-a"],
  podA: LW_ASSETS.template12["08-gold-lotus-seed-pod-a"],
  podB: LW_ASSETS.template12["09-gold-lotus-seed-pod-b"],
  budB: LW_ASSETS.template12["10-white-gold-lotus-bud-b"],
  tile: LW_ASSETS.template12["12-cream-geometric-pattern-tile"],
  lotusCluster: LW_ASSETS.template10["01-lotus-cluster-pink"],
  pondStems: LW_ASSETS.template10["02-lotus-pond-stems"],
  lotusPair: LW_ASSETS.template10["03-lotus-pair-with-leaves"],
  banana: LW_ASSETS.template10["04-banana-leaf"],
  gopuram: LW_ASSETS.template10["05-south-indian-temple-gopuram"],
  umbrella: LW_ASSETS.template10["06-hanging-embroidered-umbrella"],
  garland: LW_ASSETS.template10["07-marigold-garland-top-border"],
  shriGanesh: LW_ASSETS.template10["08-shri-ganeshay-namah-text"],
  lamp: LW_ASSETS.template5["01-hanging-brass-lamp"],
  couple: LW_ASSETS.template5["02-couple-red-saree"],
  gopuramFaded: LW_ASSETS.template5["03-temple-gopuram-faded"],
  ganesha: LW_ASSETS.template5["04-ganesha-red"],
  lampsPair: LW_ASSETS.template5["05-hanging-lamps-pair"],
  divider: LW_ASSETS.template5["06-divider"],
  hands: LW_ASSETS.template4["01-bride-groom-hands"],
  ganeshaLotus: LW_ASSETS.template4["02-ganesha-red"],
  cornerL: LW_ASSETS.template4["03-corner-ornament-left"],
  cornerR: LW_ASSETS.template4["04-corner-ornament-right"],
  // Right-sized copies of the owner's art (public/wedding-v3/lotus/): the originals are 1600px for a ≤520px slot.
  swing: { src: "/wedding-v3/lotus/couple-on-marigold-swing-760.webp", w: 760, h: 1294 },
  branch: { src: "/wedding-v3/lotus/mossy-tree-branch-1000.webp", w: 1000, h: 547 },
  feather: LW_ASSETS.template7["03-peacock-feather"],
  // The couple dressed for each function (template14), one per event card.
  coupleHaldi: { src: "/wedding-v3/template14-couple-haldi-mehndi/07-couple-haldi-yellow.webp", w: 466, h: 800 },
  coupleMehndi: { src: "/wedding-v3/template14-couple-haldi-mehndi/05-couple-mehndi-orange-saree.webp", w: 581, h: 800 },
  coupleSangeet: { src: "/wedding-v3/template14-couple-haldi-mehndi/03-couple-sangeet-dancing.webp", w: 748, h: 800 },
  coupleReception: { src: "/wedding-v3/template14-couple-haldi-mehndi/04-couple-reception-tux-gown.webp", w: 604, h: 800 },
  coupleEngagement: { src: "/wedding-v3/template14-couple-haldi-mehndi/06-couple-engagement-ivory-lehenga.webp", w: 502, h: 800 },
  coupleWedding: { src: "/wedding-v3/template14-couple-haldi-mehndi/08-couple-wedding-red-lehenga.webp", w: 446, h: 800 },
} satisfies Record<string, WeddingAsset>;

export type ArtKey = keyof typeof A;

/** <img> props for one piece: intrinsic size (no layout shift), lazy or eager. */
export function img(key: ArtKey, opts: { lazy?: boolean; high?: boolean } = {}) {
  const a = A[key];
  return {
    src: a.src,
    width: a.w,
    height: a.h,
    alt: "",
    decoding: "async" as const,
    loading: opts.lazy ? ("lazy" as const) : ("eager" as const),
    draggable: false,
    ...(opts.high ? { fetchPriority: "high" as const } : {}),
  };
}

/** Wait for these <img>s to decode, but never longer than `cap` ms. */
export function decodeAll(imgs: (HTMLImageElement | null | undefined)[], cap = 1200): Promise<void> {
  const list = imgs.filter((i): i is HTMLImageElement => !!i);
  const all = Promise.all(list.map((i) => (i.decode ? i.decode().catch(() => undefined) : undefined))).then(() => undefined);
  return Promise.race([all, new Promise<void>((r) => window.setTimeout(r, cap))]);
}

/** A seeded PRNG so particle layouts render identically every time (no hydration drift). */
export function seeded(seed: number) {
  let s = seed >>> 0 || 1;
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
}
