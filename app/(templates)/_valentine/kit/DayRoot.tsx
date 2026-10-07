"use client";

// ─── DayRoot + BrandMark ─────────────────────────────────────────────────────
//
// DayRoot mounts a day's theme as CSS variables (see ../theme.ts), paints the
// day's background, sets the UI font and reserves the full viewport. Wrap a
// whole Experience in it; everything inside can use `var(--vw-*)` / `VW.*`.
//
//   <DayRoot day={day}> … </DayRoot>
//
// BrandMark is the live-mode logo top-right that doubles as the recipient's
// "make your own" link (share-page-builder rule 8). The viewer renders it, so
// Experiences don't have to.

import { useEffect, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import type { DayConfig } from "../types";
import { FONTS, themeVars } from "../theme";
import { VW_FONT_VARS } from "../fonts";
import { ensureKitCss } from "./kitCss";

export default function DayRoot({ day, children, style, className }: { day: DayConfig; children: ReactNode; style?: CSSProperties; className?: string }) {
  useEffect(ensureKitCss, []);
  return (
    <div
      className={`${VW_FONT_VARS}${className ? ` ${className}` : ""}`}
      data-vw-day={day.slug}
      style={{
        ...themeVars(day.theme),
        position: "relative",
        minHeight: "100dvh",
        width: "100%",
        background: day.theme.bg,
        backgroundColor: day.theme.base,
        color: day.theme.ink,
        fontFamily: FONTS.ui,
        colorScheme: day.theme.dark ? "dark" : "light",
        overflowX: "hidden",
        paddingBottom: "var(--vw-dock-space, 0px)",
        boxSizing: "border-box",
        // Every day is a toy of drags, holds and swipes: a swipe must never
        // paint a text selection or pop the iOS callout over the scene.
        userSelect: "none",
        WebkitUserSelect: "none",
        WebkitTouchCallout: "none",
        WebkitTapHighlightColor: "transparent",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function BrandMark({ dark }: { dark?: boolean }) {
  return (
    <Link
      href="/templates"
      aria-label="SubhSandesh — make your own"
      style={{
        position: "fixed",
        right: 12,
        top: 12,
        zIndex: 95,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "7px 12px",
        minHeight: 36,
        borderRadius: 999,
        textDecoration: "none",
        background: dark ? "rgba(255,255,255,.12)" : "rgba(255,255,255,.72)",
        border: `1px solid ${dark ? "rgba(255,255,255,.18)" : "rgba(0,0,0,.06)"}`,
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.webp" alt="" width={18} height={18} style={{ width: 18, height: 18 }} />
      <span style={{ font: `600 11.5px ${FONTS.ui}`, color: dark ? "#fff" : "#2a1a22" }}>SubhSandesh</span>
    </Link>
  );
}
