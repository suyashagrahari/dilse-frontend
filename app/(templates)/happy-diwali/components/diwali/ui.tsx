"use client";

// Small building blocks shared by the Diwali scenes: the palette, the pulsing
// hint chip and the scene heading. Type is clamp()ed to the viewport's height
// as well as its width, so every scene fits one screen from 360×640 up.

import type { CSSProperties, ReactNode } from "react";
import { motion } from "framer-motion";
import { FONTS, VW } from "../../../_valentine/theme";
import { useReducedMotion } from "../../../_valentine/kit";
import { DW_DISPLAY } from "./fonts";

export const DW = {
  /** the red Diwali night (ROUND2 palette): deepest → kumkum */
  night: "#2A0507",
  maroon: "#4A0A0D",
  red: "#8F1416",
  kumkum: "#B3121B",
  gold: "#FFCF5A",
  diya: "#F6A821",
  flame: "#FFF3C4",
  marigold: "#FF8A1E",
  marigoldDeep: "#C25E0A",
  clay: "#B5481A",
  clayDark: "#7A2A0C",
  pink: "#FF5FA2",
  magenta: "#D6337A",
  teal: "#2EC4B6",
  purple: "#8E4FD8",
  cream: "#FFF6E3",
  mist: "#F3D9C4",
  paper: "#FFF7E8",
  paperInk: "#3A1A0C",
} as const;

/** The five rangoli colours (powder colours: marigold, rani pink, peacock teal, violet, haldi yellow). */
export const RANGOLI_COLORS = [DW.marigold, DW.pink, DW.teal, DW.purple, "#FFD23F"] as const;

/** A soft, pulsing instruction chip. */
export function Hint({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  const reduced = useReducedMotion();
  return (
    <motion.p
      initial={{ opacity: 0, y: 6 }}
      animate={reduced ? { opacity: 1, y: 0 } : { opacity: [0.78, 1, 0.78], y: 0 }}
      transition={reduced ? { duration: 0.3 } : { opacity: { duration: 2.4, repeat: Infinity }, y: { duration: 0.4 } }}
      style={{
        margin: 0,
        padding: "6px 14px",
        borderRadius: 99,
        background: "rgba(42,5,7,.42)",
        border: "1px solid rgba(255,211,110,.28)",
        color: VW.ink,
        font: `600 clamp(12.5px, 1.9dvh, 14px) ${FONTS.ui}`,
        flex: "none",
        ...style,
      }}
    >
      {children}
    </motion.p>
  );
}

/** Scene heading: a small kicker, the title in the display face, an optional line. */
export function SceneTitle({ kicker, title, sub, as = "h2" }: { kicker?: ReactNode; title: ReactNode; sub?: ReactNode; as?: "h1" | "h2" }) {
  const H = as;
  return (
    <header className="dw-head" style={{ display: "grid", gap: "clamp(2px, .7dvh, 6px)", justifyItems: "center", flex: "none" }}>
      {kicker && <p style={{ margin: 0, font: `700 clamp(10.5px, 1.6dvh, 12px) ${FONTS.ui}`, letterSpacing: ".18em", textTransform: "uppercase", color: VW.gold }}>{kicker}</p>}
      <H
        style={{
          margin: 0,
          font: `400 clamp(25px, min(8.2vw, 4.5dvh), 38px)/1.12 ${DW_DISPLAY}`,
          color: VW.ink,
          letterSpacing: ".005em",
          textWrap: "balance",
          overflowWrap: "anywhere",
          textShadow: "0 2px 3px rgba(40,4,6,.85), 0 0 22px rgba(255,190,70,.45)",
        }}
      >
        {title}
      </H>
      {sub && <p style={{ margin: 0, maxWidth: 340, font: `500 clamp(13px, 2.05dvh, 15px)/1.4 ${FONTS.ui}`, color: VW.inkSoft, textWrap: "pretty" }}>{sub}</p>}
    </header>
  );
}

export const clean = (v: unknown) => (typeof v === "string" ? v.trim() : "");
