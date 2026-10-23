// ─── The art: the owner's pieces (public/wedding-v3) + the CC0 ballroom doors ─
// Every file ships from this repo's public folder (same origin: canvas-safe,
// no CDN). Sizes are the files' natural sizes so <img> reserves its box.

export const OPEN = "/wedding-v3/openings/reception";
export const SHARED = "/wedding-v3/openings/_shared";

export const A = {
  // The doors (Met, CC0): frame with a transparent aperture + two leaves.
  frame: { src: `${OPEN}/frame.webp`, w: 979, h: 1800 },
  leafL: { src: `${OPEN}/left-leaf.webp`, sm: `${OPEN}/left-leaf-sm.webp`, smw: 214, w: 404, h: 1701 },
  leafR: { src: `${OPEN}/right-leaf.webp`, sm: `${OPEN}/right-leaf-sm.webp`, smw: 210, w: 397, h: 1701 },
  ballroom: { src: `${OPEN}/ballroom-bg.webp`, w: 1080, h: 1800 },
  rays: { src: `${SHARED}/light-rays.webp`, sm: `${SHARED}/light-rays-sm.webp`, smw: 675, w: 900, h: 1200 },
  sparkle: { src: `${SHARED}/sparkle.webp`, w: 128, h: 128 },
  petal: { src: `${SHARED}/petal-rose.webp`, w: 128, h: 128 },
  // template12: gold string lights, white-gold lotus, cream geometric tile.
  lights: { src: "/wedding-v3/template12/01-gold-string-lights.webp", w: 1600, h: 922 },
  lotusOpen: { src: "/wedding-v3/template12/05-white-gold-lotus-open.webp", w: 800, h: 517 },
  lotusStem: { src: "/wedding-v3/template12/03-white-gold-lotus-bloom-stem.webp", w: 588, h: 800 },
  lotusBud: { src: "/wedding-v3/template12/07-white-gold-lotus-bud-a.webp", w: 386, h: 800 },
  tile: { src: "/wedding-v3/template12/12-cream-geometric-pattern-tile.webp", w: 580, h: 320 },
  // template8: gold line-art floral swirl, pink & white rose bouquet.
  swirl: { src: "/wedding-v3/template8/01-gold-line-art-floral-swirl-720.webp", w: 720, h: 654 },
  roses: { src: "/wedding-v3/template8/02-pink-white-rose-bouquet.webp", w: 800, h: 686 },
  // template14: the couple in a tuxedo and a gown.
  couple: { src: "/wedding-v3/template14-couple-haldi-mehndi/04-couple-reception-tux-gown.webp", w: 604, h: 800 },
} as const;

export type ArtKey = keyof typeof A;

/** <img> props for a piece: natural size (no layout shift), lazy below the fold. */
export function img(key: ArtKey, o: { lazy?: boolean; high?: boolean; sizes?: string } = {}) {
  const a = A[key] as { src: string; sm?: string; w: number; h: number; smw?: number };
  return {
    src: a.src,
    // Phones pick the 900px-tall variant (the browser chooses; nothing re-renders).
    srcSet: a.sm && a.smw ? `${a.sm} ${a.smw}w, ${a.src} ${a.w}w` : undefined,
    sizes: a.sm && a.smw ? (o.sizes ?? "(max-width: 600px) 50vw, 420px") : undefined,
    width: a.w,
    height: a.h,
    alt: "",
    decoding: "async" as const,
    loading: o.lazy ? ("lazy" as const) : undefined,
    fetchPriority: o.high ? ("high" as const) : undefined,
    draggable: false,
  };
}

/** Wait for images to be decoded (never longer than `ms`). */
export function decodeAll(imgs: HTMLImageElement[], ms = 1800): Promise<void> {
  const all = Promise.all(
    imgs.map((i) => {
      if (i.complete && i.naturalWidth) return i.decode?.().catch(() => undefined) ?? Promise.resolve();
      return new Promise<void>((res) => {
        const done = () => {
          i.removeEventListener("load", done);
          i.removeEventListener("error", done);
          void (i.decode?.().catch(() => undefined) ?? Promise.resolve()).then(() => res());
        };
        i.addEventListener("load", done);
        i.addEventListener("error", done);
      });
    }),
  ).then(() => undefined);
  return Promise.race([all, new Promise<void>((r) => window.setTimeout(r, ms))]);
}
