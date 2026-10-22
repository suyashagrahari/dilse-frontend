// ─── Royal: which pack art each theme wears ──────────────────────────────────
// One small map (spec 3.2: per-theme plates + two art families, shared gold).
// Light themes (blush / champagne / powder) get daylight scenes, the painted
// caparisoned elephant and the watercolour Taj; dark themes (maroon / noir /
// emerald) get the lamp-lit interiors, the gold elephant and the lake palace.

import { art, art2x, type WeddingArtId } from "../../../_wedding/art";
import type { WeddingThemeId } from "../../../_wedding/themes";

export interface GardenArt {
  /** Full-bleed 9:16 backdrop behind the gates and every section. */
  plate: WeddingArtId;
  /** The courtyard seen through the open gates (dimmed, behind the jharokha). */
  scene: WeddingArtId;
  /** How much of the scene shows through the theme wash. */
  sceneOpacity: number;
  /** Both elephant arts face left; the left-hand one is mirrored to face in. */
  elephant: WeddingArtId;
  /** The palace painting in the venue section. */
  venue: WeddingArtId;
  dark: boolean;
}

const LIGHT = { elephant: "royal/elephant-caparisoned-painted-01", venue: "scene/taj-mahal-watercolor-01", sceneOpacity: 0.55, dark: false } as const;
const DARK = { elephant: "royal/elephant-gold-ornate-01", venue: "scene/jal-mahal-lake-palace-01", sceneOpacity: 0.46, dark: true } as const;

export const GW_ART: Record<WeddingThemeId, GardenArt> = {
  blush: { ...LIGHT, plate: "plate/royal-blush", scene: "scene/palace-corridor-arches-01" },
  champagne: { ...LIGHT, plate: "plate/royal-champagne", scene: "scene/udaipur-city-palace-interior-01" },
  powder: { ...LIGHT, plate: "plate/royal-powder", scene: "scene/jal-mahal-lake-palace-01" },
  maroon: { ...DARK, plate: "plate/royal-maroon", scene: "scene/palace-corridor-arches-01" },
  noir: { ...DARK, plate: "plate/royal-noir", scene: "scene/udaipur-city-palace-interior-01" },
  emerald: { ...DARK, plate: "plate/royal-emerald", scene: "scene/jal-mahal-lake-palace-01" },
};

export const gardenArt = (theme: WeddingThemeId): GardenArt => GW_ART[theme] ?? GW_ART.maroon;

/** <img> props for one pack image: 1×/2× srcSet + intrinsic size (no layout shift). */
export function artImg(id: WeddingArtId, opts: { lazy?: boolean; high?: boolean; one?: boolean } = {}) {
  const a = art(id);
  return {
    src: a.src,
    // Soft, dimmed layers ship 1× only (spec 7.1: blurry art scales up for free).
    ...(opts.one ? {} : { srcSet: a.srcSet }),
    width: a.w,
    height: a.h,
    alt: "",
    decoding: "async" as const,
    loading: opts.lazy ? ("lazy" as const) : ("eager" as const),
    ...(opts.high ? { fetchPriority: "high" as const } : {}),
  };
}

export { art, art2x };

/** Wait for these <img>s to decode (spec 7.1.7), but never longer than `cap` ms. */
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

/** Hotlinked GIPHY stickers (never downloaded; LEDGER.md GIFS table). */
export const GIF = {
  dhol: "https://media.giphy.com/media/BhUsVxOppv7jcmUrDy/giphy.gif",
} as const;
