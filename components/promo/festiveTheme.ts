// The Navratri & Diwali drop's palette — a navy festival night lit by diyas:
// deep indigo sky, marigold and gold light, a rangoli magenta and a peacock
// teal for the dots. Every festive surface outside the templates (strip, blog
// card, gallery teaser, hero, /festive-offer) paints from these, the way the
// Halloween surfaces paint from halloweenTheme.ts.

export const FV = {
  /** Night sky, top → bottom. */
  sky0: "#232a66",
  sky1: "#181c4c",
  sky2: "#0d0f2e",
  ink: "#0a0b22",
  /** Diya light. */
  flame: "#ffd36b",
  flameGlow: "rgba(255, 196, 77, 0.42)",
  /** Marigold — CTA, percent. */
  marigold: "#ffb020",
  marigoldDeep: "#f07c0a",
  gold: "#f4c95d",
  goldSoft: "#ffe3a3",
  /** Rangoli accents. */
  rose: "#ff5d8f",
  teal: "#2fd3c0",
  text: "#fff7e8",
  muted: "rgba(255, 238, 205, 0.74)",
  /** Frosted navy glass: background + border, used with backdrop-filter: blur(14px). */
  glass: "rgba(24, 28, 76, 0.64)",
  glassEdge: "rgba(244, 201, 93, 0.32)",
} as const;

/** The sky gradient most festive surfaces sit on. */
export const FV_SKY = `radial-gradient(120% 90% at 80% 0%, #33408a 0%, transparent 55%), radial-gradient(90% 60% at 10% 100%, rgba(240,124,10,.22) 0%, transparent 60%), linear-gradient(180deg, ${FV.sky0} 0%, ${FV.sky1} 55%, ${FV.sky2} 100%)`;
