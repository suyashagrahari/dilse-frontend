// ─── Pampas & Peony: the art, as <img> props ─────────────────────────────────
// Every piece comes from ../assets.ts (client/public/wedding-v3, same origin,
// never the CDN). `pic()` returns width/height (no layout shift), lazy or
// eager + priority, and a 1×/2× srcSet where a smaller twin of the same
// painting exists (pampas clouds 1600/800, drape arch 1372/686, swirl 1600/720).

import { FW_ASSETS } from "../assets";

const T3 = FW_ASSETS.template3;
const T8 = FW_ASSETS.template8;
const T2 = FW_ASSETS.template2;

/** Named roles → files. Components ask for a role, not a file name. */
export const ART = {
  paper: T3["02-paper-background-2"],
  paperSoft: T3["04-paper-background-3"],
  clouds: T3["03-pampas-grass-clouds-1"],
  cloudsSm: T3["07-pampas-grass-clouds-2"],
  swing: T3["05-couple-on-swing"],
  drape: T3["12-floral-drape-arch-2"],
  drapeSm: T3["06-floral-drape-arch-1"],
  rocks: T3["08-garden-rocks"],
  pampasCorner: T3["09-pampas-grass-corner"],
  peonyBeige: T3["10-beige-peony"],
  peonyPink: T3["11-pink-peony-bouquet"],
  pampasBorder: T3["13-pampas-grass-border"],
  swirl: T8["01-gold-line-art-floral-swirl"],
  swirlSm: T8["01-gold-line-art-floral-swirl-720"],
  roses: T8["02-pink-white-rose-bouquet"],
  ganesha: T8["03-gold-ganesha"],
  mandala: T8["04-cream-mandala-diamond-pattern-tile"],
  garland: T2["01-garland-strand"],
  marigoldPots: T2["02-marigold-pots"],
  umbrella: T2["03-umbrella-guard-1"],
  cloudWash: T2["04-cloud-texture-1"],
  gazebo: T2["05-gazebo"],
  goldLeaf: T2["06-gold-leaf-branch"],
  fountain: T2["07-fountain"],
  greenBranch: T2["08-green-branch"],
  cloudWashSm: T2["09-cloud-texture-2"],
  banana: T2["11-banana-leaves"],
  peacock: T2["12-peacock"],
  vine: T2["13-hanging-vine"],
  coupleStanding: T2["14-couple"],
} as const;

export type ArtRole = keyof typeof ART;

/** Smaller twin (same painting) for the 1× slot. */
const SMALL: Partial<Record<ArtRole, ArtRole>> = { clouds: "cloudsSm", drape: "drapeSm", swirl: "swirlSm" };

export interface PicOpts {
  /** Below the fold. */
  lazy?: boolean;
  /** The opening scene (fetchpriority=high). */
  high?: boolean;
  /** CSS width the image is drawn at, for `sizes` (e.g. "(min-width: 1024px) 520px, 88vw"). */
  sizes?: string;
  alt?: string;
}

/** <img> props for one piece of art. Decorative by default (alt=""). */
export function pic(role: ArtRole, o: PicOpts = {}) {
  const a = ART[role];
  const small = SMALL[role] ? ART[SMALL[role]!] : null;
  return {
    src: small && !o.high ? small.src : a.src,
    ...(small ? { srcSet: `${small.src} ${small.w}w, ${a.src} ${a.w}w`, sizes: o.sizes ?? "100vw" } : {}),
    width: a.w,
    height: a.h,
    alt: o.alt ?? "",
    decoding: "async" as const,
    loading: o.lazy ? ("lazy" as const) : ("eager" as const),
    draggable: false,
    ...(o.high ? { fetchPriority: "high" as const } : {}),
  };
}

/** Wait for these <img>s to decode, but never longer than `cap` ms. */
export function decodeAll(imgs: (HTMLImageElement | null | undefined)[], cap = 1200): Promise<void> {
  const list = imgs.filter((i): i is HTMLImageElement => !!i);
  const all = Promise.all(list.map((i) => (i.decode ? i.decode().catch(() => undefined) : undefined))).then(() => undefined);
  return Promise.race([all, new Promise<void>((r) => window.setTimeout(r, cap))]);
}

/** A seeded PRNG so particle layouts render identically every time. */
export function seeded(seed: number) {
  let s = seed >>> 0 || 1;
  return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296;
}

/** Per-theme paper strength: the beige paper sits best on champagne, lighter on blush, faint on powder. */
export const PAPER_OPACITY: Record<string, number> = { champagne: 0.92, blush: 0.6, powder: 0.38 };
