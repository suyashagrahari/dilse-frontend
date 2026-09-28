"use client";

// ─── Capsule — shared chrome ─────────────────────────────────────────────────

import { useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useReducedMotion } from "framer-motion";
import { DATE_FONT_VARS } from "../../date-invitation/components/fonts";
import { LoveSky, LoveThemeContext } from "../../_love/LoveKit";
import { MONO, PALETTE, SERIF, TAP_TARGET_PX, UI } from "./types";
import { PaperTexture } from "./paper";
import { capsuleHand } from "./fonts";
import { CapsuleThemeContext, capsuleTheme, capsuleThemeVars, useCapsuleTheme } from "./themes";

/**
 * Mounts one theme: its custom properties, the three type families, and the
 * context the love-kit pieces read. Wraps the editor page AND the template, so
 * the preview chrome and the published page are painted by the same theme.
 */
export function CapsuleScope({
  themeId,
  children,
  className,
  style,
}: {
  themeId: string | undefined | null;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const theme = capsuleTheme(themeId);
  return (
    <CapsuleThemeContext.Provider value={theme}>
      <LoveThemeContext.Provider value={theme}>
        <div
          className={`${DATE_FONT_VARS} ${capsuleHand.variable} lv-root ${className ?? ""}`}
          data-capsule-theme={theme.id}
          style={{ ...capsuleThemeVars(theme), color: PALETTE.ink, ...style }}
        >
          {children}
        </div>
      </LoveThemeContext.Provider>
    </CapsuleThemeContext.Provider>
  );
}

/**
 * The page. The theme's sky sits fixed behind it; everything else is a
 * centred column — 440px for the ceremony screens, wider for the keepsakes.
 */
export function Frame({ children, seed = "capsule", wide = false }: { children: React.ReactNode; seed?: string; wide?: boolean }) {
  const theme = useCapsuleTheme();
  const reduce = useReducedMotion() ?? false;
  return (
    <div className="relative min-h-[100dvh] w-full" style={{ color: PALETTE.ink, overflowX: "clip", background: "var(--lv-base)" }}>
      <LoveSky theme={theme} reduceMotion={reduce} />
      <PaperTexture seed={`${seed}-page`} opacity={theme.dark ? 0.03 : 0.05} baseFrequency={0.75} />
      <div className="relative mx-auto w-full" style={{ maxWidth: wide ? 760 : 440, zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}

/**
 * Every touchable in the template. `TAP_TARGET_PX` is the floor, and the
 * judging buttons in particular are the ones a thumb hits without looking.
 */
export function TapButton({
  children,
  onClick,
  tone = "quiet",
  disabled,
  full,
  ariaLabel,
  style,
}: {
  children: React.ReactNode;
  onClick: () => void;
  tone?: "quiet" | "wax" | "ghost" | "amber";
  disabled?: boolean;
  full?: boolean;
  ariaLabel?: string;
  style?: React.CSSProperties;
}) {
  const palette: Record<string, React.CSSProperties> = {
    wax: {
      background: `linear-gradient(180deg, ${PALETTE.waxHi} -40%, ${PALETTE.wax} 55%, ${PALETTE.waxDeep} 140%)`,
      color: PALETTE.paper,
      border: `1px solid ${PALETTE.waxDeep}`,
      boxShadow: `0 1px 0 rgba(255,255,255,.35) inset, 0 12px 26px -14px ${PALETTE.waxDeep}`,
    },
    amber: { background: PALETTE.amberWash, color: PALETTE.amber, border: `1px solid ${PALETTE.amber}` },
    quiet: { background: PALETTE.quiet, color: PALETTE.ink, border: `1px solid ${PALETTE.edge}` },
    ghost: { background: "transparent", color: PALETTE.inkSoft, border: "1px solid transparent" },
  };
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`cp-press inline-flex items-center justify-center gap-2 rounded-full px-5 disabled:opacity-45 ${full ? "w-full" : ""}`}
      style={{
        minHeight: TAP_TARGET_PX + 4,
        minWidth: TAP_TARGET_PX,
        fontFamily: UI,
        fontSize: 15,
        fontWeight: 700,
        letterSpacing: "-0.01em",
        touchAction: "manipulation",
        ...palette[tone],
        ...style,
      }}
    >
      {children}
    </button>
  );
}

/** A monospace dot-leader row. The scorecard is built out of these. */
export function DotRow({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div
      className="flex items-baseline gap-1"
      style={{ fontFamily: MONO, fontSize: emphasis ? 15 : 13, color: emphasis ? PALETTE.ink : PALETTE.inkSoft }}
    >
      <span style={{ whiteSpace: "nowrap" }}>{label}</span>
      <span
        aria-hidden
        className="min-w-0 flex-1 translate-y-[-3px]"
        style={{ borderBottom: `1px dotted ${PALETTE.edge}` }}
      />
      <span style={{ whiteSpace: "nowrap", fontWeight: emphasis ? 700 : 400, color: PALETTE.ink }}>{value}</span>
    </div>
  );
}

/** A small caps label in mono. Dates, confidence, scores — nothing else. */
export function Mono({
  children,
  size = 11,
  colour = PALETTE.inkSoft,
  style,
}: {
  children: React.ReactNode;
  size?: number;
  colour?: string;
  style?: React.CSSProperties;
}) {
  return (
    <span style={{ fontFamily: MONO, fontSize: size, color: colour, letterSpacing: 1, ...style }}>{children}</span>
  );
}

/** Prediction text and anything that wants to read as handwriting-adjacent. */
export function Serif({
  children,
  size = 17,
  colour = PALETTE.ink,
  style,
}: {
  children: React.ReactNode;
  size?: number;
  colour?: string;
  style?: React.CSSProperties;
}) {
  return <span style={{ fontFamily: SERIF, fontSize: size, color: colour, lineHeight: 1.42, ...style }}>{children}</span>;
}

/** A hairline rule in the edge colour. */
export function Rule({ style }: { style?: React.CSSProperties }) {
  return <div aria-hidden style={{ height: 1, background: PALETTE.edge, ...style }} />;
}

/**
 * The preview-only time machine: a floating pill in the demo and in the
 * sender's own preview that jumps to opening day. It can only ever act on
 * content already in this tab (the demo, or the capsule this tab just wrote) —
 * a published capsule's contents are on the server, which will not send them
 * early, so there is nothing for it to reveal there.
 */
export function PreviewBar({ children, bottom = 16 }: { children: React.ReactNode; bottom?: number }) {
  return (
    <div
      className="fixed left-1/2 z-[118] flex max-w-[calc(100vw-24px)] -translate-x-1/2 items-center gap-1.5 rounded-full p-1.5"
      style={{
        bottom: `calc(${bottom}px + env(safe-area-inset-bottom, 0px))`,
        background: "rgba(20,14,30,.82)",
        border: "1px solid rgba(255,255,255,.16)",
        boxShadow: "0 18px 40px -16px rgba(0,0,0,.6)",
        fontFamily: UI,
      }}
    >
      {children}
    </div>
  );
}

export function PreviewButton({ label, onClick, primary = false, icon }: { label: string; onClick: () => void; primary?: boolean; icon?: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="cp-press inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5"
      style={{
        minHeight: 40,
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: "-0.01em",
        color: primary ? "#1a1320" : "#fff",
        background: primary ? "linear-gradient(115deg, var(--lv-a3), var(--lv-a2))" : "rgba(255,255,255,.1)",
        touchAction: "manipulation",
      }}
    >
      {icon}
      {label}
    </button>
  );
}

/** A small uppercase grotesk label — section kickers. */
export function Kicker({ children, colour = PALETTE.inkSoft, style }: { children: React.ReactNode; colour?: string; style?: React.CSSProperties }) {
  return (
    <p style={{ margin: 0, fontFamily: UI, fontSize: 11, fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase", color: colour, ...style }}>
      {children}
    </p>
  );
}

const noop = () => () => {};

/**
 * Portals an overlay to <body> — out from under the page's stacking contexts,
 * so nothing (the preview's top bar included) can sit on top of it — and
 * re-mounts the active theme there, since the custom properties do not follow
 * a portal.
 */
export function ThemedPortal({ children }: { children: React.ReactNode }) {
  const theme = useCapsuleTheme();
  const hydrated = useSyncExternalStore(noop, () => true, () => false);
  if (!hydrated) return null;
  return createPortal(<CapsuleScope themeId={theme.id}>{children}</CapsuleScope>, document.body);
}
