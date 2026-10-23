// ─── Christian Wedding: the art, served from /public/wedding-v3 ─────────────
//
// Every file lives IN THE REPO and is served by Next from the site's own
// origin (never S3 / the CDN). Sizes are the intrinsic webp sizes, so images
// never shift the layout.
//
//   wedding-v3/christian-wedding/   the chapel portal (ivory limestone, the
//       stained-glass fanlight and the small rose window baked in) and the two
//       oak leaves with iron strap hinges — derived from the CC0 pieces in
//       wedding-v3/openings/christian by
//       ~/Desktop/wedding-assets/openings/_scripts/christian-chapel.cjs
//   wedding-v3/openings/christian/  the aisle behind the doors, the doves
//   wedding-v3/openings/_shared/    light rays, petals
//   wedding-v3/template3|8|15/      the owner's florals, paper, columns, ivy

export interface Art {
  src: string;
  w: number;
  h: number;
  /** A half-size variant for phones. */
  sm?: string;
}

const V = "/wedding-v3/";

export const ART = {
  portal: { src: `${V}christian-wedding/portal.webp`, sm: `${V}christian-wedding/portal-sm.webp`, w: 1296, h: 1800 },
  doorL: { src: `${V}christian-wedding/door-l.webp`, sm: `${V}christian-wedding/door-l-sm.webp`, w: 549, h: 1502 },
  doorR: { src: `${V}christian-wedding/door-r.webp`, sm: `${V}christian-wedding/door-r-sm.webp`, w: 502, h: 1502 },
  roseWindow: { src: `${V}christian-wedding/rose-window.webp`, w: 520, h: 520 },
  aisle: { src: `${V}openings/christian/aisle-bg.webp`, w: 1080, h: 1800 },
  doveUp: { src: `${V}openings/christian/dove-up.webp`, w: 400, h: 300 },
  doveDown: { src: `${V}openings/christian/dove-down.webp`, w: 400, h: 300 },
  rays: { src: `${V}openings/_shared/light-rays.webp`, sm: `${V}openings/_shared/light-rays-sm.webp`, w: 900, h: 1200 },
  petalRose: { src: `${V}openings/_shared/petal-rose.webp`, w: 128, h: 128 },
  petalSakura: { src: `${V}openings/_shared/petal-sakura.webp`, w: 128, h: 128 },
  sparkle: { src: `${V}openings/_shared/sparkle.webp`, w: 128, h: 128 },
  // template3 — pampas & peony
  paper: { src: `${V}template3/02-paper-background-2.webp`, w: 1800, h: 1013 },
  pampasClouds: { src: `${V}template3/07-pampas-grass-clouds-2.webp`, w: 800, h: 361 },
  drapeArch: { src: `${V}template3/12-floral-drape-arch-2.webp`, w: 1372, h: 1600 },
  drapeArchSm: { src: `${V}template3/06-floral-drape-arch-1.webp`, w: 686, h: 800 },
  pampasCorner: { src: `${V}template3/09-pampas-grass-corner.webp`, w: 595, h: 800 },
  pampasBorder: { src: `${V}template3/13-pampas-grass-border.webp`, w: 800, h: 553 },
  peony: { src: `${V}template3/10-beige-peony.webp`, w: 800, h: 800 },
  peonyBouquet: { src: `${V}template3/11-pink-peony-bouquet.webp`, w: 728, h: 800 },
  // template8 — roses & gold line art (never its Ganesha)
  roseBouquet: { src: `${V}template8/02-pink-white-rose-bouquet.webp`, w: 800, h: 686 },
  goldSwirl: { src: `${V}template8/01-gold-line-art-floral-swirl-720.webp`, w: 720, h: 654 },
  // template15 — the white chapel garden
  floralArch: { src: `${V}template15/02-pink-white-floral-arch.webp`, w: 1600, h: 1188 },
  lanterns: { src: `${V}template15/03-hanging-gold-lanterns-trio.webp`, w: 800, h: 800 },
  urn: { src: `${V}template15/04-urn-planter-with-greenery.webp`, w: 566, h: 800 },
  balustrade: { src: `${V}template15/07-white-stone-railing-balustrade.webp`, w: 1600, h: 375 },
  column: { src: `${V}template15/09-white-classic-column-pillar.webp`, w: 431, h: 1800 },
  ivy: { src: `${V}template15/10-ivy-curtain-hanging-greenery.webp`, w: 1600, h: 622 },
} as const satisfies Record<string, Art>;

/** The kit's paper textures from this repo (the kit's defaults point at the CDN). */
export const KIT_TEXTURE = {
  linen: `${V}palace-door/kit/linen-overlay.webp`,
  silk: `${V}palace-door/kit/paper-silk-light.webp`,
} as const;

/** The gallery card / coverImage. */
export const CW_CARD = `${V}christian-wedding/card.webp`;

/**
 * Where the two leaves sit inside the 1296×1800 portal, in % (layout.json of
 * openings/christian). The left leaf is a little wider: the photo is real.
 */
export const LEAF = {
  l: { x: 30.496, y: 56.923, w: 20.954, h: 41.264 },
  r: { x: 50.992, y: 56.923, w: 19.16, h: 41.264 },
} as const;
/** The doorway (both leaves), for the aisle behind them. */
export const DOORWAY = { x: 30.496, y: 56.923, w: 39.656, h: 41.264 } as const;
/** The baked stained glass and rose window, for the light that glows through them. */
export const FANLIGHT = { x: 31.8, y: 40.4, w: 37.1, h: 14.8 } as const;
export const ROSE = { x: 50.15, y: 26.33, r: 3.5 } as const;

/** <img> props for one asset: intrinsic size (no layout shift), lazy below the fold. */
export function img(a: Art, opts: { lazy?: boolean; high?: boolean; alt?: string; small?: boolean } = {}) {
  return {
    src: opts.small && a.sm ? a.sm : a.src,
    ...(a.sm && !opts.small ? { srcSet: `${a.sm} ${Math.round(a.w / 2)}w, ${a.src} ${a.w}w` } : {}),
    width: a.w,
    height: a.h,
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
