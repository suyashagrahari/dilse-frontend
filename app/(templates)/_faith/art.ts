// ─── Faith weddings: the art, as <img> props ────────────────────────────────
// Components ask for a role ("bloom", "heroBg"); the page's FaithProfile says
// which painting plays it. `usePic()` returns `pic(role)` bound to the faith in
// context: width/height (no layout shift), lazy or eager + priority, the media
// CDN through `cdn()`, and a 1×/2× srcSet where a smaller twin of the same
// painting exists (swirl 1600/720, the hero card, the hero figure).

import { createContext, createElement, useCallback, useContext, type ReactNode } from "react";
import { cdn } from "../_wedding/media";
import type { ArtRole, FaithArt } from "./types";

/** Smaller twin (same painting) for the 1× slot. */
const SMALL: Partial<Record<ArtRole, ArtRole>> = { swirl: "swirlSm", heroBg: "heroBgSm", heroFigure: "heroFigureSm" };

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
export function picOf(art: FaithArt, role: ArtRole, o: PicOpts = {}) {
  const a = art[role];
  if (!a) return { src: "", width: 1, height: 1, alt: "", hidden: true };
  const smallRole = SMALL[role];
  const small = smallRole ? art[smallRole] : undefined;
  return {
    src: cdn(small && !o.high ? small.src : a.src),
    ...(small ? { srcSet: `${cdn(small.src)} ${small.w}w, ${cdn(a.src)} ${a.w}w`, sizes: o.sizes ?? "100vw" } : {}),
    width: a.w,
    height: a.h,
    alt: o.alt ?? "",
    decoding: "async" as const,
    loading: o.lazy ? ("lazy" as const) : ("eager" as const),
    draggable: false,
    ...(o.high ? { fetchPriority: "high" as const } : {}),
  };
}

const ArtCtx = createContext<FaithArt | null>(null);

export function FaithArtProvider({ art, children }: { art: FaithArt; children: ReactNode }) {
  return createElement(ArtCtx.Provider, { value: art }, children);
}

/** The faith's art table (throws outside a FaithArtProvider: every engine piece renders inside one). */
export function useArt(): FaithArt {
  const art = useContext(ArtCtx);
  if (!art) throw new Error("faith art: no FaithArtProvider");
  return art;
}

/** `pic(role, opts)` for the faith in context. */
export function usePic() {
  const art = useArt();
  return useCallback((role: ArtRole, o?: PicOpts) => picOf(art, role, o), [art]);
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
export const PAPER_OPACITY: Record<string, number> = { champagne: 0.85, blush: 0.55, powder: 0.35 };
