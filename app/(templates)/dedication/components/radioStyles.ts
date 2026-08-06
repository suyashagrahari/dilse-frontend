// ─── Dedication — the 1980s Indian transistor radio, in CSS ──────────────────
//
// Everything on the body is drawn with gradients and repeating patterns. There
// is no image asset: the brushed-metal speaker grille is a repeating dot/slot
// pattern, the wear marks are blurred ellipses, the knurling on the knobs is a
// repeating conic gradient.
//
// Motion policy: the VU needles and the NOW PLAYING marquee are the only two
// continuous animations in the whole template. Everything else is a one-shot
// transition. `prefers-reduced-motion` freezes both — the needles park at rest
// and the marquee goes static — but the tuner still works and the needle still
// drags, because that is the interaction, not decoration.

import type { CSSProperties } from "react";
import { PALETTE, WEAR_COUNT } from "./types";
import { seededUnit } from "@/lib/seededRandom";

/** Class applied to the capture subtree to kill every animation before export. */
export const FREEZE_CLASS = "ded-capture-freeze";

export const KEYFRAMES = `
@keyframes dedMarquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@keyframes dedCardUp { from { opacity: 0; transform: translateY(110%); } }
@keyframes dedLampIn { from { opacity: 0; } }
@keyframes dedSlipIn { from { opacity: 0; transform: translateY(18px); } }
@keyframes dedDim { from { opacity: 1; } to { opacity: 0.18; } }

.${FREEZE_CLASS}, .${FREEZE_CLASS} * {
  animation: none !important;
  transition: none !important;
}

@media (prefers-reduced-motion: reduce) {
  [data-ded-motion] { animation: none !important; }
}
`;

/**
 * Brushed metal speaker grille. Three layers:
 *   1. horizontal brushing (fine linear stripes)
 *   2. the punched hole pattern (a radial-gradient dot, tiled)
 *   3. a top-light sheen so it reads as metal rather than as wallpaper
 */
export const grilleBackground = (): CSSProperties => ({
  backgroundColor: PALETTE.metal,
  backgroundImage: [
    `radial-gradient(circle at 2px 2px, rgba(0,0,0,.55) 1.15px, rgba(0,0,0,0) 1.6px)`,
    `repeating-linear-gradient(0deg, rgba(255,255,255,.05) 0 1px, rgba(0,0,0,.05) 1px 2px)`,
    `linear-gradient(160deg, rgba(255,255,255,.22), rgba(0,0,0,.28))`,
  ].join(","),
  backgroundSize: "6px 6px, 100% 2px, 100% 100%",
  boxShadow: `inset 0 2px 5px rgba(0,0,0,.55), inset 0 -1px 0 rgba(255,255,255,.12)`,
});

/** Oxide-red plastic, moulded — lighter at the top edge, deep in the corners. */
export const bodyBackground = (): CSSProperties => ({
  background: [
    `radial-gradient(120% 80% at 50% -10%, ${PALETTE.bodyLight} 0%, rgba(0,0,0,0) 55%)`,
    `linear-gradient(180deg, ${PALETTE.body} 0%, ${PALETTE.bodyDeep} 100%)`,
  ].join(","),
  boxShadow: `inset 0 1px 0 rgba(255,255,255,.22), inset 0 -3px 8px rgba(0,0,0,.4), 0 22px 50px -20px rgba(0,0,0,.7)`,
});

/** Chrome with a knurled edge — a conic gradient does the milling. */
export const knobBackground = (): CSSProperties => ({
  background: [
    `radial-gradient(circle at 34% 28%, rgba(255,255,255,.85), rgba(255,255,255,0) 45%)`,
    `conic-gradient(from 0deg, ${PALETTE.chrome} 0deg 4deg, ${PALETTE.chromeDark} 4deg 8deg)`,
  ].join(","),
  boxShadow: `inset 0 -2px 5px rgba(0,0,0,.45), inset 0 2px 3px rgba(255,255,255,.5), 0 4px 10px -3px rgba(0,0,0,.6)`,
});

/** The amber display glass. Near-black with a faint bloom under the text. */
export const displayBackground = (): CSSProperties => ({
  background: [
    `radial-gradient(90% 140% at 50% 120%, rgba(240,166,60,.16), rgba(0,0,0,0) 70%)`,
    `linear-gradient(180deg, #0b0703, ${PALETTE.displayBg})`,
  ].join(","),
  boxShadow: `inset 0 3px 10px rgba(0,0,0,.85), 0 0 0 2px ${PALETTE.chromeDark}, 0 0 0 3px rgba(0,0,0,.35)`,
});

export interface WearShape {
  key: string;
  left: string;
  top: string;
  width: string;
  height: string;
  rotate: string;
  opacity: number;
}

/**
 * Faint irregular scuffs. Seeded off the station name so a given radio always
 * wears in the same places — a body whose scratches move every render reads as
 * a rendering bug, not as age.
 */
export function wearShapes(seed: string): WearShape[] {
  const out: WearShape[] = [];
  for (let i = 0; i < WEAR_COUNT; i++) {
    const k = `wear${i}`;
    out.push({
      key: k,
      left: `${6 + seededUnit(seed, `${k}x`) * 80}%`,
      top: `${5 + seededUnit(seed, `${k}y`) * 86}%`,
      width: `${26 + seededUnit(seed, `${k}w`) * 70}px`,
      height: `${8 + seededUnit(seed, `${k}h`) * 26}px`,
      rotate: `${-40 + seededUnit(seed, `${k}r`) * 80}deg`,
      opacity: 0.05 + seededUnit(seed, `${k}o`) * 0.06,
    });
  }
  return out;
}

/** Amber text with the glow an illuminated display actually has. */
export const amberGlow = (strength = 1): string =>
  `0 0 ${5 * strength}px rgba(240,166,60,${0.55 * strength}), 0 0 ${16 * strength}px rgba(240,166,60,${0.25 * strength})`;

export const lampStyle = (colour: string, lit: boolean): CSSProperties => ({
  background: lit
    ? `radial-gradient(circle at 34% 30%, #fff 0%, ${colour} 42%, rgba(0,0,0,.55) 100%)`
    : `radial-gradient(circle at 34% 30%, rgba(255,255,255,.28) 0%, ${colour}44 40%, rgba(0,0,0,.6) 100%)`,
  boxShadow: lit
    ? `0 0 8px ${colour}, 0 0 20px ${colour}88, inset 0 -1px 2px rgba(0,0,0,.5)`
    : `inset 0 -1px 2px rgba(0,0,0,.6)`,
});
