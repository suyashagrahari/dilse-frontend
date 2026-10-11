"use client";

// ─── DayRoot + BrandMark ─────────────────────────────────────────────────────
//
// DayRoot mounts a day's theme as CSS variables (see ../theme.ts), paints the
// day's background, sets the UI font and reserves the full viewport. Wrap a
// whole Experience in it; everything inside can use `var(--vw-*)` / `VW.*`.
//
//   <DayRoot day={day} data={data} art={<MyArt />}> … </DayRoot>
//
// `--vw-s` is a hero-art scale (1 on phones, up to 1.2 on tall tablets):
// size hero objects as calc(Npx * var(--vw-s, 1)) so tall screens are not
// a phone floating in space. Add className vw-feather to a column-sized
// backdrop panel to fade its edges into the page from 768px up; className
// vw-wide-fixed turns a page-sized absolute backdrop into a viewport one there.
//
// Wide screens (see ./WideFrame.tsx): phones (<768px) get exactly the scene.
// From 768px the scene sits in a centred stage column (`--vw-stage-w`) on a
// full-bleed backdrop with the day's motif drifting in the margins; from
// 1100px two decorative wings flank it (photos + names | day title + a line
// from the data + `art`). `layout="full"` hands the whole viewport to a scene
// designed as a wide stage (no column, no wings). Fixed elements that must stay
// with the column can offset by `var(--vw-gutter)` (0px on phones and in full).
//
// BrandMark is the live-mode logo top-right that doubles as the recipient's
// "make your own" link (share-page-builder rule 8). The viewer renders it, so
// Experiences don't have to.

import { useEffect, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import type { DayConfig, ValentineDayData } from "../types";
import { FONTS, themeVars } from "../theme";
import { VW_FONT_VARS } from "../fonts";
import { ensureKitCss } from "./kitCss";
import WideFrame, { useViewportTier } from "./WideFrame";

// The stage column must be right on the first (server) paint, so it ships with
// the markup instead of waiting for ensureKitCss. No quotes or angle brackets:
// React escapes <style> text on the server.
const STAGE_CSS = `
[data-vw-root] { --vw-gutter: 0px; --vw-stage-w: 100vw; --vw-s: 1 }
@media (min-width: 768px) {
  [data-vw-root] { isolation: isolate; --vw-stage-w: min(660px, calc(100vw - 112px)) }
  [data-vw-root][data-vw-layout=column] { --vw-gutter: calc((100vw - var(--vw-stage-w)) / 2) }
  [data-vw-root][data-vw-layout=column] .vw-stage { position: relative; max-width: var(--vw-stage-w); margin: 0 auto }
  [data-vw-root] .vw-wide-fixed { position: fixed !important; z-index: 0 }
  [data-vw-root] .vw-feather { -webkit-mask-image: radial-gradient(farthest-side, #000 55%, transparent); mask-image: radial-gradient(farthest-side, #000 55%, transparent) }
}
@media (min-width: 1100px) {
  [data-vw-root] { --vw-stage-w: clamp(560px, 40vw, 640px) }
}
@media (min-width: 768px) and (max-width: 1099px) and (min-height: 960px) {
  [data-vw-root] { --vw-s: 1.2 }
}
@media (min-width: 1100px) and (min-height: 1000px) {
  [data-vw-root] { --vw-s: 1.12 }
}
@media (min-width: 1100px) {
  [data-vw-root][data-vw-layout=full] { --vw-s: 1.2 }
}
@media (min-width: 1100px) and (min-height: 1000px) {
  [data-vw-root][data-vw-layout=full] { --vw-s: 1.34 }
}
`;

export interface DayRootProps {
  day: DayConfig;
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
  /** The page data — feeds the desktop wings (photos, names, endLine). */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: ValentineDayData<any>;
  /** "column" (default): centred stage + backdrop + wings. "full": the scene owns the viewport. */
  layout?: "column" | "full";
  /** Day illustration for the right wing (desktop). */
  art?: ReactNode;
  /** Right-wing quote (default data.endLine → day.title). */
  line?: string;
  /** The wings' tone when a step repaints the page against the theme (default theme.dark). */
  dark?: boolean;
}

export default function DayRoot({ day, children, style, className, data, layout = "column", art, line, dark }: DayRootProps) {
  useEffect(ensureKitCss, []);
  const tier = useViewportTier();
  return (
    <div
      className={`${VW_FONT_VARS}${className ? ` ${className}` : ""}`}
      data-vw-day={day.slug}
      data-vw-root={day.slug}
      data-vw-layout={layout}
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
      <style>{STAGE_CSS}</style>
      {tier !== "phone" && <WideFrame day={day} data={data} tier={tier} layout={layout} art={art} line={line} dark={dark} />}
      {/* <main>: the scene is the page's main content (one landmark for screen readers and agents). */}
      <main className="vw-stage">{children}</main>
    </div>
  );
}

export function BrandMark({ dark, stacked = false }: { dark?: boolean; stacked?: boolean }) {
  if (stacked)
    // The logo with the word under it, small, in the top-right corner (DayConfig.brandMark "stacked").
    return (
      <Link
        href="/templates"
        aria-label="SubhSandesh — make your own"
        className="vw-brand-stacked"
        style={{
          position: "fixed",
          right: "max(10px, env(safe-area-inset-right, 0px))",
          top: "calc(8px + env(safe-area-inset-top, 0px))",
          zIndex: 95,
          display: "grid",
          justifyItems: "center",
          gap: 2,
          padding: "5px 6px 4px",
          minWidth: 44,
          borderRadius: 12,
          textDecoration: "none",
          background: dark ? "rgba(23,18,43,.42)" : "rgba(255,255,255,.6)",
          border: `1px solid ${dark ? "rgba(255,255,255,.14)" : "rgba(0,0,0,.06)"}`,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.webp" alt="" width={26} height={26} style={{ width: 26, height: 26, borderRadius: 7, filter: dark ? "drop-shadow(0 0 6px rgba(255,210,122,.35))" : undefined }} />
        <span style={{ font: `700 9.5px/1 ${FONTS.ui}`, letterSpacing: ".02em", color: dark ? "rgba(255,255,255,.9)" : "#2a1a22" }}>SubhSandesh</span>
      </Link>
    );
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
