// ─── The Lake Terrace: the owner's art, from the media CDN ─────────────────
// Every image lives in the repo (client/public/wedding-v3/…) and is mirrored on
// the media CDN (../../../_wedding/media.ts). The table keeps the same-origin
// paths; `img()` and the CSS backgrounds hand the browser the CDN URL. The
// premium/ copies are right-sized crops of template6 + template11 (the
// originals are 1600px for slots no wider than 600px).

import { cdn } from "../../../_wedding/media";

export interface Art {
  src: string;
  w: number;
  h: number;
}

const O = "/wedding-v3/openings";
const P = "/wedding-v3/premium";

export const A = {
  // The opening (openings/premium: drawn French doors, layout.json).
  frame: { src: `${O}/premium/frame.webp`, w: 1149, h: 1800 },
  doorL: { src: `${O}/premium/left-door.webp`, w: 568, h: 1800 },
  doorR: { src: `${O}/premium/right-door.webp`, w: 568, h: 1800 },
  terrace: { src: `${O}/premium/terrace-bg.webp`, w: 1080, h: 1800 },
  glare: { src: `${O}/premium/glare-sweep.webp`, w: 500, h: 1800 },
  sparkle: { src: `${O}/_shared/sparkle.webp`, w: 128, h: 128 },
  petal: { src: `${O}/_shared/petal-rose.webp`, w: 128, h: 128 },
  // template6: sky, flamingos, lake, balustrade, couple, florals.
  sky: { src: `${P}/sky-1200.webp`, w: 1200, h: 675 },
  flamingo: { src: `${P}/flamingo-top-1200.webp`, w: 1200, h: 446 },
  flamingoSm: { src: `${P}/flamingo-top-720.webp`, w: 720, h: 268 },
  foliage: { src: `${P}/foliage-hang-1200.webp`, w: 1200, h: 443 },
  foliageSm: { src: `${P}/foliage-hang-720.webp`, w: 720, h: 266 },
  lake: { src: `${P}/lake-1091.webp`, w: 1091, h: 380 },
  balustrade: { src: `${P}/balustrade-800.webp`, w: 800, h: 266 },
  couple: { src: `${P}/couple-sofa-640.webp`, w: 640, h: 450 },
  anthurium: { src: `${P}/anthurium-480.webp`, w: 480, h: 559 },
  palm: { src: `${P}/palm-360.webp`, w: 360, h: 575 },
  banana: { src: `${P}/banana-400.webp`, w: 400, h: 593 },
  // template11: gazebo, fountain, lotus, blossom, lanterns, peacock.
  gazebo: { src: `${P}/gazebo-420.webp`, w: 420, h: 668 },
  fountain: { src: `${P}/fountain-560.webp`, w: 560, h: 528 },
  lotus: { src: `${P}/lotus-cluster-480.webp`, w: 480, h: 481 },
  lotusStems: { src: `${P}/lotus-stems-420.webp`, w: 420, h: 506 },
  blossom: { src: `${P}/blossom-640.webp`, w: 640, h: 403 },
  lanterns: { src: `${P}/lanterns-360.webp`, w: 360, h: 615 },
  peacock: { src: `${P}/peacock-360.webp`, w: 360, h: 662 },
  // The Lake Terrace scene (template6 + template15), right-sized for the slots they fill.
  skyFull: { src: `${P}/sky-1920.webp`, w: 1920, h: 1080 },
  peacockGreen: { src: `${P}/peacock-green-300.webp`, w: 300, h: 612 },
  bananaA: { src: `${P}/banana-a-560.webp`, w: 560, h: 830 },
  palmTall: { src: `${P}/palm-420.webp`, w: 420, h: 671 },
  shrub: { src: `${P}/shrub-520.webp`, w: 520, h: 414 },
  // the crown of template15's floral arch (1600 × 600 of its 1600 × 1188): the opening's top garland
  floralTop: { src: `${P}/floral-top-1600.webp`, w: 1600, h: 600 },
  floralTopSm: { src: `${P}/floral-top-800.webp`, w: 800, h: 300 },
  // the arch's two halves at full resolution (800 × 640 each): the opening's and the finale's corner garlands
  floralCornerL: { src: `${P}/floral-corner-l.webp`, w: 800, h: 640 },
  floralCornerR: { src: `${P}/floral-corner-r.webp`, w: 800, h: 640 },
  jhumka: { src: `${P}/jhumka-260.webp`, w: 260, h: 521 },
  goldLanterns: { src: `${P}/gold-lanterns-500.webp`, w: 500, h: 500 },
  urn: { src: `${P}/urn-320.webp`, w: 320, h: 452 },
  // template6's lower border (leaves + anthuriums only; the flamingo legs painted out), cropped to its flat top edge: the hero's top garland
  garland: { src: `${P}/leaf-garland-1600.webp`, w: 1600, h: 458 },
  garlandSm: { src: `${P}/leaf-garland-800.webp`, w: 800, h: 229 },
} satisfies Record<string, Art>;

export type ArtKey = keyof typeof A;

/** <img> props for one piece, from the CDN: intrinsic size (no layout shift), lazy or eager. Never feed this src to a mask. */
export function img(key: ArtKey, opts: { lazy?: boolean; high?: boolean } = {}) {
  const a = A[key];
  return {
    src: cdn(a.src),
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
