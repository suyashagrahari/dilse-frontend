"use client";

// ─── Court of Love — the courtroom's visual kit ──────────────────────────────
//
// Paper documents on a themed backdrop. Every piece paints with the love-kit
// `V.*` variables, so the four courtrooms (./themes) re-skin all of it.
//
//  Paper    the summons, the hearing card, polaroids, the judgement
//  Stamp    rubber stamps: GUILTY, ADMITTED, SO ORDERED, OVERRULED
//  Gavel/PaperGhost buttons (the kit's CandyButton paints white on the accent
//           gradient, which is unreadable on gold — ours paint ink on wax)
//  Polaroid a GIF or photo framed in paper, so an opaque GIF backdrop reads
//           as a deliberate print rather than a stray rectangle

import type { CSSProperties, ReactNode } from "react";

import { GROTESK, ITALIC } from "../../_love/LoveKit";
import { V } from "../../_love/theme";

export const SANS = GROTESK;
export const SERIF = ITALIC;
export const MONO = "var(--font-court-mono), 'Courier Prime', ui-monospace, Menlo, monospace";
export const HAND = "var(--font-caveat), 'Caveat', ui-rounded, cursive";

/**
 * Stamp ink: the theme's accent pulled toward the paper's ink, so gold (which
 * is unreadable on cream) prints as antique gold, and pink as a deep rose.
 */
export const STAMP_INK = "color-mix(in srgb, var(--lv-a1) 64%, var(--lv-paper-ink))";
/** A faint rule / border on paper. */
export const PAPER_RULE = "color-mix(in srgb, var(--lv-paper-ink) 12%, transparent)";
/** Manila case-folder tone, tinted by the theme. */
export const MANILA = "color-mix(in srgb, var(--lv-a3) 26%, var(--lv-paper))";

export const COURT_CSS = `
@keyframes col-stamp { 0% { opacity: 0; transform: rotate(var(--r, -8deg)) scale(2.4) } 55% { opacity: 1; transform: rotate(var(--r, -8deg)) scale(.92) } 100% { opacity: 1; transform: rotate(var(--r, -8deg)) scale(1) } }
@keyframes col-thud { 0%,100% { transform: translate3d(0,0,0) } 20% { transform: translate3d(0,3px,0) scale(.995) } 45% { transform: translate3d(-2px,0,0) } 70% { transform: translate3d(2px,0,0) } }
@keyframes col-bang { 0% { opacity: 0; transform: scale(.3) rotate(-12deg) } 40% { opacity: 1; transform: scale(1.15) rotate(-6deg) } 100% { opacity: 1; transform: scale(1) rotate(-6deg) } }
@keyframes col-rise { 0% { opacity: 0; transform: translate3d(0,14px,0) } 100% { opacity: 1; transform: none } }
@keyframes col-unfold { 0% { opacity: .2; transform: perspective(900px) rotateX(-78deg) } 100% { opacity: 1; transform: perspective(900px) rotateX(0) } }
@keyframes col-seal-l { 0% { transform: none } 100% { opacity: 0; transform: translate3d(-46px, 38px, 0) rotate(-38deg) } }
@keyframes col-seal-r { 0% { transform: none } 100% { opacity: 0; transform: translate3d(46px, 44px, 0) rotate(34deg) } }
@keyframes col-swing { 0%,100% { transform: rotate(var(--r, 8deg)) } 50% { transform: rotate(calc(var(--r, 8deg) - 5deg)) } }
@keyframes col-glow { 0%,100% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--lv-chip) 55%, transparent) } 60% { box-shadow: 0 0 0 14px transparent } }
.col-stamp { animation: col-stamp .55s cubic-bezier(.2,.9,.3,1.25) both; }
.col-thud { animation: col-thud .45s ease-out both; }
.col-bang { animation: col-bang .5s cubic-bezier(.2,.9,.3,1.4) both; }
.col-rise { animation: col-rise .6s cubic-bezier(.2,.8,.2,1) both; }
.col-unfold { animation: col-unfold .9s cubic-bezier(.2,.8,.2,1) both; transform-origin: 50% 0; }
.col-seal-l { animation: col-seal-l .9s cubic-bezier(.5,0,.7,.4) both; }
.col-seal-r { animation: col-seal-r .9s cubic-bezier(.5,0,.7,.4) both; }
.col-swing { animation: col-swing 3.2s ease-in-out infinite; transform-origin: 50% 0; }
.col-glow { animation: col-glow 2s ease-out infinite; }
.col-opt { transition: transform .16s ease, background-color .2s ease, border-color .2s ease, box-shadow .2s ease !important; }
.col-opt:hover:not(:disabled) { transform: translateY(-1px); border-color: ${STAMP_INK} !important; }
.col-opt:active:not(:disabled) { transform: scale(.985); }
.col-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 22px 14px; }
@media (min-width: 640px) { .col-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 30px 20px; } }
@media (min-width: 1000px) { .col-grid.col-grid-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
.col-ev { display: flex; flex-direction: column; gap: 14px; }
@media (min-width: 860px) { .col-ev { flex-direction: row; align-items: center; justify-content: center; gap: 34px; } .col-ev > :first-child { flex: 0 0 auto; margin: 0 !important; } .col-ev > :last-child { flex: 1 1 0; min-width: 0; margin: 0 !important; } }
@media (prefers-reduced-motion: reduce) {
  .col-stamp, .col-thud, .col-bang, .col-rise, .col-unfold, .col-seal-l, .col-seal-r, .col-swing, .col-glow { animation: none !important; }
  .col-seal-l, .col-seal-r { opacity: 0; }
}
`;

/** A sheet of paper — the template's primary surface. */
export function Paper({
  children,
  tilt = 0,
  lined = false,
  style,
  className,
  onClick,
}: {
  children: ReactNode;
  tilt?: number;
  lined?: boolean;
  style?: CSSProperties;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        position: "relative",
        backgroundColor: V.paper,
        color: V.paperInk,
        borderRadius: 18,
        border: `1px solid ${PAPER_RULE}`,
        boxShadow: `0 30px 60px -30px ${V.shadow}, 0 2px 0 rgba(0,0,0,.03)`,
        transform: tilt ? `rotate(${tilt}deg)` : undefined,
        backgroundImage: lined
          ? `repeating-linear-gradient(180deg, transparent 0 29px, ${PAPER_RULE} 29px 30px)`
          : "radial-gradient(120% 60% at 0% 0%, color-mix(in srgb, var(--lv-a3) 9%, transparent), transparent 60%)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** A rubber stamp. `animate` slams it in once on mount. */
export function Stamp({
  children,
  r = -8,
  size = 15,
  color = STAMP_INK,
  animate = true,
  delay = 0,
  style,
}: {
  children: ReactNode;
  r?: number;
  size?: number;
  color?: string;
  animate?: boolean;
  delay?: number;
  style?: CSSProperties;
}) {
  return (
    <span
      className={animate ? "col-stamp" : undefined}
      style={
        {
          "--r": `${r}deg`,
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: `${Math.round(size * 0.32)}px ${Math.round(size * 0.75)}px`,
          border: `${size > 20 ? 4 : 3}px solid ${color}`,
          borderRadius: 8,
          color,
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: size,
          lineHeight: 1.1,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
          transform: `rotate(${r}deg)`,
          boxShadow: `inset 0 0 0 2px color-mix(in srgb, ${color} 18%, transparent)`,
          animationDelay: delay ? `${delay}ms` : undefined,
          opacity: 0.94,
          ...style,
        } as CSSProperties
      }
    >
      {children}
    </span>
  );
}

/** Small typed label — "CASE NO.", "EXHIBIT A", "TESTIMONY". */
export function Typed({ children, color, size = 11, style }: { children: ReactNode; color?: string; size?: number; style?: CSSProperties }) {
  return (
    <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: size, letterSpacing: "0.16em", textTransform: "uppercase", color, ...style }}>
      {children}
    </span>
  );
}

type BtnProps = {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
  style?: CSSProperties;
  full?: boolean;
  glow?: boolean;
};

/** The primary action — wax/foil with ink text, readable in every theme. */
export function GavelButton({ children, onClick, disabled, ariaLabel, style, full = true, glow = false }: BtnProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`lv-cta lv-focus${glow ? " col-glow" : ""}`}
      style={{
        width: full ? "100%" : undefined,
        minHeight: 54,
        padding: "14px 24px",
        borderRadius: 999,
        border: "none",
        background: V.chip,
        color: V.chipInk,
        fontFamily: SANS,
        fontWeight: 800,
        fontSize: 16.5,
        letterSpacing: "-0.01em",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.55 : 1,
        boxShadow: `0 16px 34px -16px ${V.shadow}, inset 0 -3px 0 rgba(0,0,0,.14), inset 0 1px 0 rgba(255,255,255,.35)`,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 9,
        WebkitTapHighlightColor: "transparent",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

/** Secondary action on paper. */
export function PaperGhost({ children, onClick, disabled, ariaLabel, style, full = true }: BtnProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="lv-focus col-opt"
      style={{
        width: full ? "100%" : undefined,
        minHeight: 48,
        padding: "12px 18px",
        borderRadius: 999,
        border: `1.5px solid ${PAPER_RULE}`,
        background: V.paper,
        color: V.paperInk,
        fontFamily: SANS,
        fontWeight: 700,
        fontSize: 14.5,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.55 : 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        WebkitTapHighlightColor: "transparent",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

/** A strip of washi tape holding a print down. */
export function TapeStrip({ r = -4, style }: { r?: number; style?: CSSProperties }) {
  return (
    <span
      aria-hidden
      style={{
        position: "absolute",
        top: -11,
        left: "50%",
        width: 88,
        height: 22,
        marginLeft: -44,
        transform: `rotate(${r}deg)`,
        background: "color-mix(in srgb, var(--lv-a2) 40%, rgba(255,255,255,.55))",
        borderLeft: "2px dashed rgba(255,255,255,.5)",
        borderRight: "2px dashed rgba(255,255,255,.5)",
        boxShadow: "0 2px 6px rgba(0,0,0,.08)",
        zIndex: 2,
        ...style,
      }}
    />
  );
}

/** A paper print around a GIF / photo, with a handwritten caption. */
export function Polaroid({
  children,
  caption,
  tilt = -2,
  tape = true,
  width,
  style,
}: {
  children: ReactNode;
  caption?: ReactNode;
  tilt?: number;
  tape?: boolean;
  width?: number | string;
  style?: CSSProperties;
}) {
  return (
    <div
      style={{
        position: "relative",
        width,
        maxWidth: "100%",
        margin: "0 auto",
        padding: "10px 10px 0",
        background: V.paper,
        borderRadius: 6,
        border: `1px solid ${PAPER_RULE}`,
        transform: `rotate(${tilt}deg)`,
        boxShadow: `0 24px 44px -24px ${V.shadow}`,
        ...style,
      }}
    >
      {tape && <TapeStrip r={tilt > 0 ? 4 : -4} />}
      <div style={{ borderRadius: 3, overflow: "hidden", lineHeight: 0, background: "#fff" }}>{children}</div>
      <div style={{ minHeight: 34, display: "grid", placeItems: "center", padding: "4px 6px 8px", fontFamily: HAND, fontSize: 19, lineHeight: 1.1, color: V.paperInk, textAlign: "center" }}>
        {caption}
      </div>
    </div>
  );
}

/** A red-wax seal. `split` cracks it into two halves that fall away. */
export function WaxSeal({ size = 78, split = false, glyph = "⚖" }: { size?: number; split?: boolean; glyph?: string }) {
  const half = (side: "l" | "r") => (
    <span
      className={split ? `col-seal-${side}` : undefined}
      style={{
        position: "absolute",
        inset: 0,
        clipPath: side === "l" ? "polygon(0 0, 54% 0, 44% 38%, 56% 62%, 46% 100%, 0 100%)" : "polygon(54% 0, 100% 0, 100% 100%, 46% 100%, 56% 62%, 44% 38%)",
        borderRadius: "50%",
        background: "radial-gradient(circle at 34% 30%, color-mix(in srgb, var(--lv-chip) 70%, #fff) 0%, var(--lv-chip) 42%, color-mix(in srgb, var(--lv-chip) 62%, #000) 100%)",
        boxShadow: "inset 0 -5px 10px rgba(0,0,0,.28), inset 0 4px 8px rgba(255,255,255,.28)",
        display: "grid",
        placeItems: "center",
      }}
    >
      <span
        style={{
          width: size * 0.64,
          height: size * 0.64,
          borderRadius: "50%",
          border: "2px solid color-mix(in srgb, var(--lv-chip-ink) 30%, transparent)",
          display: "grid",
          placeItems: "center",
          fontSize: size * 0.34,
          color: "var(--lv-chip-ink)",
          opacity: 0.8,
          textShadow: "0 1px 0 rgba(255,255,255,.25), 0 -1px 0 rgba(0,0,0,.25)",
        }}
      >
        {glyph}
      </span>
    </span>
  );
  return (
    <span aria-hidden style={{ position: "relative", display: "inline-block", width: size, height: size, filter: "drop-shadow(0 8px 14px rgba(0,0,0,.28))" }}>
      {half("l")}
      {half("r")}
    </span>
  );
}

/** A paperclip, drawn — clips a polaroid into the case folder. */
export function PaperClip({ style }: { style?: CSSProperties }) {
  return (
    <svg aria-hidden width="18" height="44" viewBox="0 0 18 44" style={{ position: "absolute", zIndex: 3, ...style }}>
      <path
        d="M5 14 V33 a4 4 0 0 0 8 0 V9 a6 6 0 0 0 -12 0 V31"
        fill="none"
        stroke="color-mix(in srgb, var(--lv-paper-ink) 55%, #b9c0c9)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
