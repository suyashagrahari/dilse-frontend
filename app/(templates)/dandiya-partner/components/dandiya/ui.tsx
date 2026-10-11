"use client";

// Small building blocks shared by the Dandiya scenes: the palette, the room
// heading, the pulsing hint chip and the CSS patterns (bandhani dots,
// mirror-work borders). Type is clamp()ed to the viewport's height as well as
// its width, so every scene fits one screen from 360×640 up.

import type { CSSProperties, ReactNode } from "react";
import { motion } from "framer-motion";
import { FONTS, VW } from "../../../_valentine/theme";
import { useReducedMotion } from "../../../_valentine/kit";
import { DD_DISPLAY } from "./fonts";

export const DD = {
  night: "#0A0F33",
  indigo: "#141C52",
  royal: "#22307A",
  marigold: "#FFB627",
  marigoldDeep: "#D17A00",
  saffron: "#FF8A1F",
  kumkum: "#D7263D",
  kumkumDeep: "#8E1022",
  peacock: "#1590B8",
  emerald: "#14A673",
  rani: "#E5489B",
  gold: "#F6D27A",
  goldDeep: "#B8862E",
  mirror: "#EEF4FF",
  cream: "#FFF4DE",
  maroon: "#3B0F1E",
  ink: "#FFF7E8",
  mist: "#CBD0F0",
  flame: "#FFE9A8",
} as const;

/** White bandhani dots on whatever colour sits under it (background layer). */
export const BANDHANI =
  "radial-gradient(circle, rgba(255,255,255,.92) 0 1.4px, rgba(255,255,255,0) 2px) 0 0 / 11px 11px, radial-gradient(circle, rgba(255,236,170,.75) 0 1.1px, rgba(255,255,255,0) 1.7px) 5.5px 5.5px / 11px 11px";

/** A horizontal row of little mirrors with gold rims (sheesha work) — use as a background on a 14px-tall strip. */
export const MIRROR_ROW =
  "radial-gradient(circle at 50% 50%, #FFFFFF 0 1.6px, #DCE7FF 2.2px, #9FB3E8 3.4px, #F6D27A 3.9px, #B8862E 4.9px, rgba(0,0,0,0) 5.4px) 0 50% / 14px 14px repeat-x";

export function Hint({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  const reduced = useReducedMotion();
  return (
    <motion.p
      initial={{ opacity: 0, y: 6 }}
      animate={reduced ? { opacity: 1, y: 0 } : { opacity: [0.8, 1, 0.8], y: 0 }}
      transition={reduced ? { duration: 0.3 } : { opacity: { duration: 2.4, repeat: Infinity }, y: { duration: 0.4 } }}
      style={{
        margin: 0,
        padding: "6px 14px",
        borderRadius: 99,
        background: "rgba(255,247,232,.1)",
        border: "1px solid rgba(246,210,122,.3)",
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

/** Scene heading: a small kicker, the title in the festive display face, an optional line. */
export function RoomTitle({ kicker, title, sub, as = "h2" }: { kicker?: ReactNode; title: ReactNode; sub?: ReactNode; as?: "h1" | "h2" }) {
  const H = as;
  return (
    <header className="dd-head" style={{ display: "grid", gap: "clamp(2px, .7dvh, 6px)", justifyItems: "center", flex: "none" }}>
      {kicker && (
        <p style={{ margin: 0, font: `700 clamp(10.5px, 1.6dvh, 12px) ${FONTS.ui}`, letterSpacing: ".2em", textTransform: "uppercase", color: DD.gold }}>
          {kicker}
        </p>
      )}
      <H
        style={{
          margin: 0,
          font: `400 clamp(26px, min(8.6vw, 4.8dvh), 40px)/1.12 ${DD_DISPLAY}`,
          color: VW.ink,
          textWrap: "balance",
          textShadow: "0 2px 3px rgba(5,8,30,.8), 0 0 18px rgba(5,8,30,.6), 0 0 26px rgba(255,182,39,.28)",
        }}
      >
        {title}
      </H>
      {sub && <p style={{ margin: 0, maxWidth: 340, font: `500 clamp(13px, 2.05dvh, 15px)/1.4 ${FONTS.ui}`, color: VW.inkSoft, textWrap: "pretty" }}>{sub}</p>}
    </header>
  );
}

export const clean = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/** "2026-10-17" → "Sat, 17 Oct" (local date, never shifted by a timezone). */
export function prettyDate(iso: string, long = false): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return "";
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", long ? { weekday: "long", day: "numeric", month: "long" } : { weekday: "short", day: "numeric", month: "short" });
}

/** Navratri this year, or next year's once this one's season has passed (from December). */
export function navratriYear(now = new Date()): number {
  return now.getMonth() >= 11 ? now.getFullYear() + 1 : now.getFullYear();
}
