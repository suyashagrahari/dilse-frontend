// ─── Royal Wedding Invitation: the art, served from /public/wedding-v3 ───────
//
// Every file lives IN THE REPO (client/public/wedding-v3/…) and is served by
// Next from the site's own origin. Never upload them to S3 or the CDN.
// Sizes are the intrinsic webp sizes (width/height on every <img>, so nothing
// shifts while it loads).
//   openings/royal   the sandstone gateway, the jaali screens, brass toran and
//                    the elephants (CC0 / drawn in-house, see
//                    ~/Desktop/wedding-assets/openings/royal/SOURCES.md)
//   royal/           the screens re-encoded at 820px tall (111 KB each; the
//                    stage never shows them taller than ~800 device px)
//   template1        pink chhatris, the peacock, clouds, lantern, gazebo, hedge
//   template14       one illustrated couple per function + the parchment scroll
//   template15       jhumkas, gold lanterns, havan kund, balustrade, carpet

export interface WeddingAsset {
  src: string;
  w: number;
  h: number;
}

const a = (src: string, w: number, h: number): WeddingAsset => ({ src: `/wedding-v3/${src}`, w, h });

export const A = {
  // The opening.
  gateway: a("openings/royal/gateway-frame.webp", 1246, 1800),
  screenL: a("royal/left-screen-820.webp", 340, 820),
  screenR: a("royal/right-screen-820.webp", 351, 820),
  toran: a("openings/royal/brass-toran.webp", 1300, 300),
  elephantL: a("openings/royal/elephant-left.webp", 900, 760),
  elephantR: a("openings/royal/elephant-right.webp", 900, 760),
  rays: a("openings/_shared/light-rays-sm.webp", 675, 900),
  // template1 (garden palace).
  cloud: a("template1/01-cloud-1.webp", 800, 541),
  cloud2: a("template1/gw-cloud-2-900.webp", 900, 609),
  parchment: a("template1/07-parchment-2.webp", 800, 447),
  gazebo: a("template1/03-gazebo.webp", 503, 800),
  lanternPink: a("template1/04-pink-lantern.webp", 382, 800),
  gazeboGarden: a("template1/05-gazebo-with-garden-1.webp", 800, 618),
  peacock: a("template1/08-peacock.webp", 392, 800),
  rocks: a("template1/09-garden-rocks.webp", 800, 315),
  chhatri: a("template1/12-pink-chhatri-umbrella.webp", 549, 800),
  hedge: a("template1/13-hedge-stone-wall.webp", 800, 514),
  coupleGarba: a("template1/14-couple-lehenga.webp", 589, 800),
  rose: a("template1/15-rose-stem.webp", 378, 800),
  // template14 (the couple, dressed for every function).
  scroll: a("template14-couple-haldi-mehndi/02-parchment-scroll-banner.webp", 1600, 668),
  coupleSangeet: a("template14-couple-haldi-mehndi/03-couple-sangeet-dancing.webp", 748, 800),
  coupleReception: a("template14-couple-haldi-mehndi/04-couple-reception-tux-gown.webp", 604, 800),
  coupleMehndi: a("template14-couple-haldi-mehndi/05-couple-mehndi-orange-saree.webp", 581, 800),
  coupleEngagement: a("template14-couple-haldi-mehndi/06-couple-engagement-ivory-lehenga.webp", 502, 800),
  coupleHaldi: a("template14-couple-haldi-mehndi/07-couple-haldi-yellow.webp", 466, 800),
  coupleWedding: a("template14-couple-haldi-mehndi/08-couple-wedding-red-lehenga.webp", 446, 800),
  // template15 (the mandap's brass and stone).
  lanterns: a("template15/03-hanging-gold-lanterns-trio.webp", 800, 800),
  // The same trio with its strings stretched (the lanterns start 79.4% down): portrait screens hang it from above the top edge.
  lanternsLong: a("royal/lanterns-long.webp", 400, 1008),
  jhumka: a("template15/05-gold-pearl-jhumka-hangings.webp", 399, 800),
  havan: a("template15/06-havan-kund-fire-aag.webp", 791, 800),
  balustrade: a("template15/07-white-stone-railing-balustrade.webp", 1600, 375),
  carpet: a("template15/08-terracotta-carpet.webp", 800, 114),
} as const;

/** Small kit pieces already in the repo (public/wedding-v3/palace-door/kit + openings/_shared). */
export const RW_KIT = {
  linen: "/wedding-v3/palace-door/kit/linen-overlay.webp",
  silk: "/wedding-v3/palace-door/kit/paper-silk-light.webp",
  petals: {
    rose: "/wedding-v3/openings/_shared/petal-rose.webp",
    marigold: "/wedding-v3/openings/_shared/petal-marigold.webp",
    sparkle: "/wedding-v3/openings/_shared/sparkle.webp",
    confetti: "/wedding-v3/palace-door/kit/gold-confetti.webp",
  },
} as const;
export type RwPetal = keyof typeof RW_KIT.petals;

/**
 * Where each piece sits on the gateway (openings/royal/layout.json), in % of
 * the 1246×1800 frame. The aperture is the screens' combined box.
 */
export const GATE = {
  screenL: { x: 20.588, y: 39.104, w: 29.152, h: 48.676 },
  screenR: { x: 49.308, y: 39.104, w: 30.104, h: 48.676 },
  toran: { x: 11.765, y: 38.289, w: 76.471, h: 12.22 },
  aperture: { x: 20.588, y: 39.104, w: 58.824, h: 48.676 },
} as const;

/** <img> props for one asset: intrinsic size (no layout shift), lazy below the fold. */
export function img(x: WeddingAsset, opts: { lazy?: boolean; high?: boolean; alt?: string } = {}) {
  return {
    src: x.src,
    width: x.w,
    height: x.h,
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
