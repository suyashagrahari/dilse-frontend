// The Halloween drop's palette — the haunted-house night from the
// happy-halloween template: deep navy-violet sky, lavender walls, ink
// outlines, a butter moon and one warm window. Every Halloween surface outside
// the templates (strip, blog card, gallery teaser, /halloween-offer) paints
// from these, so the drop reads as one place.

export const HW = {
  /** Night sky, top → bottom. */
  sky0: "#2b2245",
  sky1: "#221b38",
  sky2: "#17132a",
  /** The house: walls, roof, ink outline. */
  wall: "#5a4a7c",
  roof: "#3a2f58",
  ink: "#16111f",
  /** Moon and the lit window. */
  moon: "#f6e7a6",
  moonGlow: "rgba(246, 231, 166, 0.35)",
  window: "#ffc35a",
  /** Pumpkin accent (CTA, percent). */
  pumpkin: "#ff9a3c",
  pumpkinDeep: "#e36b1c",
  /** Lavender text accents and glass. */
  lilac: "#b9a6f0",
  text: "#f3eefe",
  muted: "rgba(226, 216, 250, 0.72)",
  /** Frosted navy glass: background + border, used with backdrop-filter: blur(14px). */
  glass: "rgba(36, 28, 62, 0.62)",
  glassEdge: "rgba(185, 166, 240, 0.28)",
} as const;

/** The sky gradient most surfaces sit on. */
export const HW_SKY = `radial-gradient(120% 90% at 80% 0%, #3b2f62 0%, transparent 55%), linear-gradient(180deg, ${HW.sky0} 0%, ${HW.sky1} 55%, ${HW.sky2} 100%)`;
