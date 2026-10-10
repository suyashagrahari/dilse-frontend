"use client";

// Small building blocks shared by the Halloween rooms: the palette, the chunky
// pumpkin button (in-room actions — the way forward is the candy pill in
// ./stage.tsx), the quiet ghost button, the pulsing hint, the "do it for me"
// chip and the room heading. Type is clamp()ed to the viewport's height as well
// as its width, so every room fits one screen from 360×640 up.

import type { CSSProperties, ReactNode } from "react";
import { motion } from "framer-motion";
import { FONTS, VW } from "../../../_valentine/theme";
import { useReducedMotion } from "../../../_valentine/kit";
import { HW_DISPLAY } from "./fonts";

export const HW = {
  night: "#17122B",
  midnight: "#1B1330",
  indigo: "#251842",
  plum: "#3A2257",
  pumpkin: "#FF8A3D",
  pumpkinDeep: "#B84E14",
  pumpkinDark: "#7A3410",
  candle: "#FFD27A",
  flame: "#FFF1B8",
  ghost: "#F7F3FF",
  mist: "#CFC6E8",
  mint: "#9BE7C4",
  lavender: "#B79CFF",
  pink: "#FF9EC4",
  stem: "#6FBF8E",
  paper: "#FFF6E6",
  paperInk: "#2B1E3F",
} as const;

export const btn: CSSProperties = {
  minHeight: 50,
  padding: "12px 24px",
  borderRadius: 18,
  border: 0,
  background: VW.accent,
  color: VW.accentInk,
  font: `700 16.5px ${FONTS.ui}`,
  boxShadow: `0 5px 0 ${VW.accentDeep}, 0 16px 34px -14px rgba(255,138,61,.55)`,
  cursor: "pointer",
  touchAction: "manipulation",
};

export const ghostBtn: CSSProperties = {
  minHeight: 44,
  padding: "10px 18px",
  borderRadius: 14,
  border: "1.5px solid rgba(247,243,255,.28)",
  background: "rgba(247,243,255,.08)",
  color: VW.ink,
  font: `600 14px ${FONTS.ui}`,
  cursor: "pointer",
  touchAction: "manipulation",
};

export function Btn({ children, onClick, style, disabled, ariaLabel }: { children: ReactNode; onClick?: () => void; style?: CSSProperties; disabled?: boolean; ariaLabel?: string }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      whileTap={disabled ? undefined : { scale: 0.96, y: 3 }}
      style={{ ...btn, opacity: disabled ? 0.5 : 1, ...style }}
    >
      {children}
    </motion.button>
  );
}

export function GhostBtn({ children, onClick, style, ariaLabel }: { children: ReactNode; onClick?: () => void; style?: CSSProperties; ariaLabel?: string }) {
  return (
    <button type="button" onClick={onClick} aria-label={ariaLabel} style={{ ...ghostBtn, ...style }}>
      {children}
    </button>
  );
}

/** "Do it for me" — every interaction has one, so nobody gets stuck. */
export function SkipChip({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        minHeight: 36,
        padding: "6px 14px",
        borderRadius: 99,
        border: 0,
        background: "transparent",
        color: VW.inkSoft,
        font: `600 13.5px ${FONTS.ui}`,
        textDecoration: "underline",
        textUnderlineOffset: 3,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

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
        background: "rgba(247,243,255,.1)",
        border: "1px solid rgba(247,243,255,.18)",
        color: VW.ink,
        font: `600 clamp(12.5px, 1.9dvh, 14px) ${FONTS.ui}`,
        ...style,
      }}
    >
      {children}
    </motion.p>
  );
}

/** Room heading: a small kicker, the room name in the bubbly display face, an optional line. */
export function RoomTitle({ kicker, title, sub, as = "h2" }: { kicker?: ReactNode; title: ReactNode; sub?: ReactNode; as?: "h1" | "h2" }) {
  const H = as;
  return (
    <header style={{ display: "grid", gap: "clamp(2px, .7dvh, 6px)", justifyItems: "center", flex: "none" }}>
      {kicker && <p style={{ margin: 0, font: `700 clamp(10.5px, 1.6dvh, 12px) ${FONTS.ui}`, letterSpacing: ".18em", textTransform: "uppercase", color: VW.gold }}>{kicker}</p>}
      <H style={{ margin: 0, font: `400 clamp(25px, min(8.4vw, 4.6dvh), 38px)/1.06 ${HW_DISPLAY}`, color: VW.ink, letterSpacing: ".01em", textWrap: "balance", textShadow: "0 2px 3px rgba(20,8,40,.75), 0 0 14px rgba(20,8,40,.55), 0 2px 18px rgba(255,138,61,.25)" }}>{title}</H>
      {sub && <p style={{ margin: 0, maxWidth: 360, font: `500 clamp(13px, 2.05dvh, 15px)/1.4 ${FONTS.ui}`, color: VW.inkSoft, textWrap: "pretty" }}>{sub}</p>}
    </header>
  );
}

export const clean = (v: unknown) => (typeof v === "string" ? v.trim() : "");
