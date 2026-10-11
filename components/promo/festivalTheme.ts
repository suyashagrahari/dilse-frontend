// The two Hindu-festival drops each wear their OWN red, so switching the site
// from Dandiya to Diwali visibly changes everything seasonal (strip, blog card,
// gallery teaser, hero, critters, portal, offer page):
//
//   dandiya — a Navratri garba night: bright kumkum / sindoor red, marigold,
//             mirror-silver and gold, with rani pink and peacock teal accents,
//             bandhani dots and mirror-work. Loud, twirly, celebratory.
//   diwali  — the new-moon Diwali night: a deep maroon-red sky lit by diya
//             gold and marigold orange, rangoli pink/teal as small accents,
//             fireworks over a red-gold sky. Warm, glowing, still.
//
// Every festival surface paints from `FT[kind]`, either directly (inline SVG)
// or through CSS custom properties (`ftVars(kind)` on a root element, read as
// `var(--ft-*)`), so one stylesheet serves both festivals.

import type { CSSProperties } from "react";
import type { FestivalId } from "@/lib/season";

export type FestivalTheme = {
  name: string;
  /** Sky, light → dark. */
  sky0: string;
  sky1: string;
  sky2: string;
  ink: string;
  /** The brightest light: a diya flame / a mirror glint. */
  flame: string;
  /** rgba glow of the festival's light. */
  glow: string;
  gold: string;
  goldSoft: string;
  /** The CTA fill (top → bottom) and the ink on it. */
  cta: string;
  ctaDeep: string;
  ctaInk: string;
  /** Accents: rani pink / rangoli pink, peacock teal, mirror silver / pale gold. */
  a1: string;
  a2: string;
  a3: string;
  text: string;
  muted: string;
  /** Frosted glass: background + border, used with backdrop-filter: blur(14px). */
  glass: string;
  edge: string;
  /** The sky gradient most surfaces sit on. */
  skyBg: string;
};

const DANDIYA: FestivalTheme = {
  name: "dandiya",
  sky0: "#c8141f",
  sky1: "#9e0f18",
  sky2: "#5a070c",
  ink: "#2a0306",
  flame: "#fff1c2",
  glow: "rgba(255, 176, 0, 0.5)",
  gold: "#d4a537",
  goldSoft: "#ffe6a6",
  cta: "#ffb000",
  ctaDeep: "#e07800",
  ctaInk: "#3a0508",
  a1: "#ff3d9a",
  a2: "#12b5a6",
  a3: "#e6ecf3",
  text: "#fff6ea",
  muted: "rgba(255, 230, 214, 0.8)",
  glass: "rgba(98, 8, 16, 0.56)",
  edge: "rgba(255, 214, 120, 0.42)",
  skyBg:
    "radial-gradient(110% 80% at 85% 0%, rgba(255,61,154,.28) 0%, transparent 55%), radial-gradient(90% 70% at 8% 100%, rgba(255,176,0,.30) 0%, transparent 60%), radial-gradient(60% 50% at 50% 40%, rgba(255,90,60,.18) 0%, transparent 70%), linear-gradient(180deg, #b3121b 0%, #8a0d15 52%, #56070c 100%)",
};

const DIWALI: FestivalTheme = {
  name: "diwali",
  sky0: "#8f1416",
  sky1: "#5e0b10",
  sky2: "#33060a",
  ink: "#1e0306",
  flame: "#ffcf5a",
  glow: "rgba(255, 190, 70, 0.5)",
  gold: "#f6a821",
  goldSoft: "#ffe7a8",
  cta: "#ffc53d",
  ctaDeep: "#e8860c",
  ctaInk: "#3a0a04",
  a1: "#ff6f9c",
  a2: "#33d1c1",
  a3: "#fff0c8",
  text: "#fff4e2",
  muted: "rgba(255, 228, 196, 0.78)",
  glass: "rgba(62, 6, 10, 0.6)",
  edge: "rgba(255, 207, 90, 0.36)",
  skyBg:
    "radial-gradient(120% 80% at 75% 0%, rgba(255,190,70,.20) 0%, transparent 55%), radial-gradient(90% 60% at 10% 100%, rgba(232,134,12,.30) 0%, transparent 60%), linear-gradient(180deg, #7a1013 0%, #4f090d 55%, #2b0508 100%)",
};

export const FT: Record<FestivalId, FestivalTheme> = { dandiya: DANDIYA, diwali: DIWALI };

/** The festival's tokens as CSS custom properties, for a root element's `style`. */
export function ftVars(kind: FestivalId): CSSProperties {
  const t = FT[kind];
  return {
    "--ft-sky0": t.sky0,
    "--ft-sky1": t.sky1,
    "--ft-sky2": t.sky2,
    "--ft-ink": t.ink,
    "--ft-flame": t.flame,
    "--ft-glow": t.glow,
    "--ft-gold": t.gold,
    "--ft-gold-soft": t.goldSoft,
    "--ft-cta": t.cta,
    "--ft-cta-deep": t.ctaDeep,
    "--ft-cta-ink": t.ctaInk,
    "--ft-a1": t.a1,
    "--ft-a2": t.a2,
    "--ft-a3": t.a3,
    "--ft-text": t.text,
    "--ft-muted": t.muted,
    "--ft-glass": t.glass,
    "--ft-edge": t.edge,
    "--ft-sky": t.skyBg,
  } as CSSProperties;
}

/**
 * The bandhani (tie-dye) dot field the Dandiya surfaces lay over their red:
 * clusters of four pale dots around a centre, on a staggered grid. A CSS
 * background, so it costs nothing.
 */
export const BANDHANI_BG =
  "radial-gradient(circle at 50% 50%, rgba(255,240,220,.55) 0 1.3px, transparent 1.7px) 0 0 / 18px 18px, " +
  "radial-gradient(circle at 50% 50%, rgba(255,214,120,.45) 0 1.1px, transparent 1.5px) 9px 9px / 18px 18px";
