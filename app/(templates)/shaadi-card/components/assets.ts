// ─── The Shaadi Card's art (all same-origin, public/wedding-v3) ─────────────
//
// The owner's Canva extractions (template2 · 7 · 10 · 14 · 5), the drawn khidki
// kit (openings/shaadi, CC0 + in-house SVG → webp) and phone-sized variants of
// both in public/wedding-v3/shaadi (made by sharp; see the PR notes). Nothing
// comes from the CDN, so the invite-card canvas is never tainted.

export interface Art {
  src: string;
  w: number;
  h: number;
}

const a = (src: string, w: number, h: number): Art => ({ src, w, h });
const V3 = "/wedding-v3";

export const ART = {
  // The opening (openings/shaadi + _shared)
  frame: a(`${V3}/openings/shaadi/frame.webp`, 1300, 1640),
  shutterL: a(`${V3}/openings/shaadi/left-shutter.webp`, 490, 1120),
  shutterR: a(`${V3}/openings/shaadi/right-shutter.webp`, 490, 1120),
  toran: a(`${V3}/openings/shaadi/toran-marigold.webp`, 1400, 520),
  mandap: a(`${V3}/openings/shaadi/haldi-mandap-bg.webp`, 1080, 1800),
  mandapSm: a(`${V3}/shaadi/mandap-sm.webp`, 720, 1200),
  rays: a(`${V3}/openings/_shared/light-rays.webp`, 900, 1200),
  raysSm: a(`${V3}/openings/_shared/light-rays-sm.webp`, 675, 900),
  petalMarigold: a(`${V3}/openings/_shared/petal-marigold.webp`, 128, 128),
  petalRose: a(`${V3}/openings/_shared/petal-rose.webp`, 128, 128),
  sparkle: a(`${V3}/openings/_shared/sparkle.webp`, 128, 128),

  // template2: the haldi-yellow Rajasthani card
  garland: a(`${V3}/template2/01-garland-strand.webp`, 134, 800),
  pots: a(`${V3}/shaadi/marigold-pots.webp`, 300, 541),
  guard: a(`${V3}/shaadi/guard.webp`, 342, 800),
  gazebo: a(`${V3}/shaadi/gazebo.webp`, 503, 800),
  fountain: a(`${V3}/shaadi/fountain.webp`, 560, 421),
  peacock: a(`${V3}/shaadi/peacock.webp`, 420, 479),
  bananaLeaves: a(`${V3}/shaadi/banana-leaves.webp`, 380, 533),
  vine: a(`${V3}/shaadi/hanging-vine.webp`, 260, 487),
  goldLeaf: a(`${V3}/shaadi/gold-leaf.webp`, 340, 439),
  couple: a(`${V3}/shaadi/couple.webp`, 465, 800),

  // template7: the couple on the marigold jhoola
  swing: a(`${V3}/shaadi/couple-swing.webp`, 560, 953),
  feather: a(`${V3}/template7/03-peacock-feather.webp`, 108, 105),

  // template10: marigold garland border, banana leaf, umbrella, Shri Ganesh
  garlandBorder: a(`${V3}/template10/07-marigold-garland-top-border.webp`, 1091, 85),
  bananaLeaf: a(`${V3}/shaadi/banana-leaf.webp`, 420, 453),
  umbrella: a(`${V3}/shaadi/hanging-umbrella.webp`, 360, 462),
  ganeshText: a(`${V3}/template10/08-shri-ganeshay-namah-text.webp`, 282, 92),

  // template5: brass lamps, Ganesha, divider
  brassLamp: a(`${V3}/shaadi/brass-lamp.webp`, 214, 800),
  ganesha: a(`${V3}/template5/04-ganesha-red.webp`, 110, 135),
  divider: a(`${V3}/template5/06-divider.webp`, 385, 55),
} as const;

/** The illustrated couple per function (template14), keyed by FunctionPreset.art. */
export const FN_ART: Record<string, Art> = {
  "fn-haldi": a(`${V3}/shaadi/fn-haldi.webp`, 303, 520),
  "fn-mehendi": a(`${V3}/shaadi/fn-mehendi.webp`, 378, 520),
  "fn-sangeet": a(`${V3}/shaadi/fn-sangeet.webp`, 486, 520),
  "fn-wedding": a(`${V3}/shaadi/fn-wedding.webp`, 290, 520),
  "fn-reception": a(`${V3}/shaadi/fn-reception.webp`, 393, 520),
  "fn-engagement": a(`${V3}/shaadi/fn-engagement.webp`, 326, 520),
};

/** `<img>` props with intrinsic size; lazy below the fold. */
export function img(x: Art, o: { lazy?: boolean; high?: boolean; alt?: string } = {}) {
  return {
    src: x.src,
    width: x.w,
    height: x.h,
    alt: o.alt ?? "",
    decoding: "async" as const,
    ...(o.lazy ? { loading: "lazy" as const } : {}),
    ...(o.high ? { fetchPriority: "high" as const } : {}),
    draggable: false,
  };
}

/** Wait for images to be decoded (never longer than `ms`). */
export function decodeAll(list: HTMLImageElement[], ms = 2500): Promise<void> {
  const each = list.map((i) => (i.complete && i.naturalWidth ? i.decode?.().catch(() => undefined) : new Promise<void>((r) => { i.addEventListener("load", () => r(), { once: true }); i.addEventListener("error", () => r(), { once: true }); }).then(() => i.decode?.().catch(() => undefined))));
  return Promise.race([Promise.all(each).then(() => undefined), new Promise<void>((r) => window.setTimeout(r, ms))]);
}
