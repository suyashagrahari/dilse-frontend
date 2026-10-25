// ─── The wedding season's look ───────────────────────────────────────────────
//
// The festival drops paint a NIGHT (kumkum red, a Diwali maroon) with light
// text on dark glass. The wedding season is the opposite on purpose: a
// daylight shaadi — ivory and rose-blush silk, antique gold zari, marigold
// torans and a maroon ink for the words. Light, luxurious, quiet; the colour
// comes from the flowers and the gold, not from the background.
//
// Every wedding surface paints from `WT`, directly (inline SVG) or through CSS
// custom properties (`wtVars()` on a root element, read as `var(--wt-*)`).
//
// The art is the /wedding hub's (public/wedding-v3 → the media CDN). The CDN
// sends no CORS header: these URLs are for <img> and CSS backgrounds only —
// never a CSS mask, a canvas or a fetch.

import type { CSSProperties } from "react";
import { MEDIA_BASE } from "@/lib/templateMedia";

export const WT = {
  /** Paper, light → deeper. */
  ivory: "#fffaf2",
  cream: "#fbf1e3",
  blush: "#f9e1dc",
  rose: "#e79aa3",
  roseDeep: "#c95f71",
  /** The words: a deep maroon, never black. */
  ink: "#4a121c",
  inkSoft: "#7b4450",
  /** Antique gold zari. */
  gold: "#c39a43",
  goldSoft: "#f2dea4",
  goldDeep: "#8f6a22",
  /** Marigold (genda) and its leaf. */
  marigold: "#f4a21c",
  marigoldDeep: "#e0780c",
  leaf: "#4f8a3c",
  /** Sindoor red: the CTA. */
  sindoor: "#9e1f34",
  sindoorDeep: "#6e1022",
  /** Frosted ivory glass + its gold hairline. */
  glass: "rgba(255, 250, 242, 0.78)",
  edge: "rgba(195, 154, 67, 0.45)",
  glow: "rgba(244, 162, 28, 0.32)",
  /** The silk most surfaces sit on. */
  silk:
    "radial-gradient(90% 70% at 88% 0%, rgba(231,154,163,.30) 0%, transparent 60%), radial-gradient(80% 70% at 0% 100%, rgba(244,162,28,.16) 0%, transparent 62%), radial-gradient(60% 50% at 50% 45%, rgba(255,255,255,.7) 0%, transparent 70%), linear-gradient(180deg, #fffaf2 0%, #fbefe6 55%, #f8e2da 100%)",
} as const;

export function wtVars(): CSSProperties {
  return {
    "--wt-ivory": WT.ivory,
    "--wt-cream": WT.cream,
    "--wt-blush": WT.blush,
    "--wt-rose": WT.rose,
    "--wt-rose-deep": WT.roseDeep,
    "--wt-ink": WT.ink,
    "--wt-ink-soft": WT.inkSoft,
    "--wt-gold": WT.gold,
    "--wt-gold-soft": WT.goldSoft,
    "--wt-gold-deep": WT.goldDeep,
    "--wt-marigold": WT.marigold,
    "--wt-marigold-deep": WT.marigoldDeep,
    "--wt-leaf": WT.leaf,
    "--wt-sindoor": WT.sindoor,
    "--wt-sindoor-deep": WT.sindoorDeep,
    "--wt-glass": WT.glass,
    "--wt-edge": WT.edge,
    "--wt-glow": WT.glow,
    "--wt-silk": WT.silk,
  } as CSSProperties;
}

/** A file from the wedding art on the media CDN (the same paths as public/wedding-v3). */
export const WEDDING_ART = (path: string) => `${MEDIA_BASE}/wedding-v3/${path.replace(/^\/+/, "")}`;
/** The hub's page-weight cut-downs. */
export const WEDDING_LUX = (file: string) => WEDDING_ART(`hub/lux/${file}`);

/** A gold-zari gradient for text and seals. */
export const GOLD_TEXT = "linear-gradient(180deg, #f7e6b0 8%, #d8b058 46%, #a77a26 78%, #c99a3c 100%)";
