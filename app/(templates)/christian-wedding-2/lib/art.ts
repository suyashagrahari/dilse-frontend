// ─── Christian Wedding — Scroll Edition: the art ─────────────────────────────
// Every piece lives in client/public/wedding-v3/ and is mirrored on the media
// CDN: the table keeps same-origin paths, `img()` and CSS backgrounds draw
// through `cdn()`, and the invite-card canvas loads the raw path (the CDN sends
// no CORS header):
//   openings/christian2  Tiffany "Magnolias and Irises" casement sashes (Met, CC0),
//                        the drawn casement frame + blossom garden (in-house)
//   openings/_shared     light rays, sakura petal, sparkle (in-house)
//   template11           the owner's cherry blossom, lanterns, fountain, lotus, banana
//   template6            the owner's sky watercolour, balustrade, palm, anthurium
//   template15           the owner's columns + ivy curtain (right-sized copies in christian2/)
//   christian2/demo      demo wedding photographs (Unsplash-licensed uploads on Wikimedia Commons)

export interface Art {
  src: string;
  w: number;
  h: number;
  /** A ≤900px (long edge) copy for phones, and its width. */
  sm?: string;
  smW?: number;
}

import { cdn } from "../../_wedding/media";

const O = "/wedding-v3/openings";
const V = "/wedding-v3";

export const A = {
  frame: { src: `${O}/christian2/casement-frame.webp`, w: 1145, h: 1800 },
  sashL: { src: `${O}/christian2/left-sash.webp`, w: 641, h: 1800, sm: `${O}/christian2/left-sash-sm.webp`, smW: 321 },
  sashR: { src: `${O}/christian2/right-sash.webp`, w: 641, h: 1800, sm: `${O}/christian2/right-sash-sm.webp`, smW: 321 },
  gardenBg: { src: `${O}/christian2/blossom-garden-bg.webp`, w: 1080, h: 1800 },
  glass: { src: `${O}/christian2/glass-full-sm.webp`, w: 634, h: 900 },
  rays: { src: `${O}/_shared/light-rays.webp`, w: 900, h: 1200, sm: `${O}/_shared/light-rays-sm.webp`, smW: 675 },
  petal: { src: `${O}/_shared/petal-sakura.webp`, w: 128, h: 128 },
  sparkle: { src: `${O}/_shared/sparkle.webp`, w: 128, h: 128 },
  sky: { src: `${V}/template6/01-sky-watercolour-background.webp`, w: 1800, h: 1013 },
  balustrade: { src: `${V}/template6/11-white-balustrade-railing.webp`, w: 800, h: 266 },
  railing: { src: `${V}/template15/07-white-stone-railing-balustrade.webp`, w: 1600, h: 375 },
  palm: { src: `${V}/template6/09-palm-frond.webp`, w: 501, h: 800 },
  anthurium: { src: `${V}/template6/05-anthurium-floral-bunch.webp`, w: 687, h: 800 },
  mountains: { src: `${V}/christian2/mountains-lake-840.webp`, w: 840, h: 650 },
  branch: { src: `${V}/christian2/blossom-branch-560.webp`, w: 560, h: 353 },
  lanterns: { src: `${V}/template11/08-hanging-lanterns-blossoms.webp`, w: 468, h: 800 },
  fountain: { src: `${V}/template11/03-stone-fountain.webp`, w: 800, h: 754 },
  lotus: { src: `${V}/template11/05-lotus-tall-stems.webp`, w: 664, h: 800 },
  banana: { src: `${V}/template11/gw-banana-800.webp`, w: 608, h: 800 },
  tropical: { src: `${V}/template11/04-tropical-leaf-plant.webp`, w: 800, h: 720 },
  gazebo: { src: `${V}/template11/07-pink-gazebo-dome.webp`, w: 503, h: 800 },
  column: { src: `${V}/christian2/column-1100.webp`, w: 263, h: 1100 },
  ivy: { src: `${V}/christian2/ivy-curtain-1000.webp`, w: 1000, h: 389 },
} satisfies Record<string, Art>;

export type ArtKey = keyof typeof A;

/** <img> props for one piece: intrinsic size (no layout shift), lazy or eager. */
export function img(key: ArtKey, opts: { lazy?: boolean; high?: boolean; sizes?: string } = {}) {
  const a: Art = A[key];
  return {
    src: cdn(a.src),
    ...(a.sm && a.smW ? { srcSet: `${cdn(a.sm)} ${a.smW}w, ${cdn(a.src)} ${a.w}w`, sizes: opts.sizes ?? "(max-width: 600px) 40vw, 22vw" } : {}),
    width: a.w,
    height: a.h,
    alt: "",
    "aria-hidden": true as const,
    decoding: "async" as const,
    loading: opts.lazy ? ("lazy" as const) : ("eager" as const),
    draggable: false,
    ...(opts.high ? { fetchPriority: "high" as const } : {}),
  };
}

/** Wait for these <img>s to decode, never longer than `cap` ms. */
export function decodeAll(imgs: (HTMLImageElement | null | undefined)[], cap = 1500): Promise<void> {
  const list = imgs.filter((i): i is HTMLImageElement => !!i);
  const all = Promise.all(list.map((i) => (i.decode ? i.decode().catch(() => undefined) : undefined))).then(() => undefined);
  return Promise.race([all, new Promise<void>((r) => window.setTimeout(r, cap))]);
}

/** Seeded PRNG: particle layouts render identically on server and client. */
export function seeded(seed: number) {
  let s = seed >>> 0 || 1;
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
}

/** Repo art saved as an absolute URL on some host (old drafts) → served from this origin. */
export function localArt(url: string): string {
  const m = url.match(/^https?:\/\/[^/]+(\/wedding-v3\/.+)$/);
  return m ? m[1] : url;
}
