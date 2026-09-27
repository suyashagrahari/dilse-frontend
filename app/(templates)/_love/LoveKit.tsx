"use client";

// ─── Love kit — the shared visual pieces ─────────────────────────────────────
//
// The Gen-Z "night kit" look (Bricolage Grotesque + Instrument Serif, glass,
// candy gradients, tape marquees, stickers) made theme-aware: everything here
// paints with the `V.*` custom properties from ./theme, so one template can be
// Midnight, Sunset or Bubblegum without a single component knowing.
//
// Mount `LOVE_CSS` once on the template root. Every animation stops under
// prefers-reduced-motion.

import Link from "next/link";
import { createContext, useContext, type CSSProperties, type ReactNode } from "react";

import { DATE_FONT_VARS } from "../date-invitation/components/fonts";
import { V, themeVars, type LoveTheme } from "./theme";

/**
 * The active theme, for anything portalled out of the template root (sheets),
 * which would otherwise lose the root's CSS variables.
 */
export const LoveThemeContext = createContext<LoveTheme | null>(null);

/** Re-applies the theme variables + fonts on a portalled subtree. */
export function ThemeScope({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  const theme = useContext(LoveThemeContext);
  return (
    <div className={`${DATE_FONT_VARS} lv-root`} style={{ ...(theme ? themeVars(theme) : null), ...style }}>
      {children}
    </div>
  );
}

export const GROTESK = "var(--font-di-grotesk), 'Bricolage Grotesque', system-ui, sans-serif";
export const ITALIC = "var(--font-di-serif), 'Instrument Serif', Georgia, serif";

export const LOVE_CSS = `
@keyframes lv-float { 0%,100% { transform: translate3d(0,0,0) } 50% { transform: translate3d(0,-12px,0) } }
@keyframes lv-drift { 0% { transform: translate3d(-6%,-4%,0) scale(1) } 50% { transform: translate3d(6%,5%,0) scale(1.12) } 100% { transform: translate3d(-6%,-4%,0) scale(1) } }
@keyframes lv-twinkle { 0%,100% { opacity: .15 } 50% { opacity: .9 } }
@keyframes lv-rise { 0% { transform: translate3d(0, 10vh, 0) rotate(0deg); opacity: 0 } 10% { opacity: .9 } 100% { transform: translate3d(var(--sway), -110vh, 0) rotate(var(--spin)); opacity: 0 } }
@keyframes lv-marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
@keyframes lv-shine { 0% { transform: translateX(-120%) skewX(-18deg) } 60%,100% { transform: translateX(260%) skewX(-18deg) } }
@keyframes lv-pop { 0% { opacity: 0; transform: translateY(16px) scale(.96) } 100% { opacity: 1; transform: none } }
@keyframes lv-wiggle { 0%,100% { transform: rotate(-3deg) } 50% { transform: rotate(3deg) } }
@keyframes lv-slap { 0% { opacity: 0; transform: rotate(-14deg) scale(2.2) } 60% { opacity: 1; transform: rotate(-9deg) scale(.92) } 100% { opacity: 1; transform: rotate(-8deg) scale(1) } }
@keyframes lv-burst { 0% { opacity: 1; transform: translate(0,0) scale(.4) rotate(0) } 100% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(1.1) rotate(var(--rot)) } }
@keyframes lv-pulse { 0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--lv-a1) 70%, transparent) } 70% { box-shadow: 0 0 0 12px transparent } 100% { box-shadow: 0 0 0 0 transparent } }
@media (max-width: 480px) { .lv-dock-label { display: none; } }
.lv-root { transition: background-color .45s ease, color .45s ease; }
.lv-root *, .lv-root *::before, .lv-root *::after { transition-property: background-color, border-color, color, fill, stroke; transition-duration: .35s; transition-timing-function: ease; }
.lv-float { animation: lv-float 6s ease-in-out infinite; }
.lv-pop { animation: lv-pop .55s cubic-bezier(.2,.9,.3,1.2) both; }
.lv-wiggle { animation: lv-wiggle 2.8s ease-in-out infinite; }
.lv-slap { animation: lv-slap .5s cubic-bezier(.2,.9,.3,1.3) both; }
.lv-pulse { animation: lv-pulse 1.9s ease-out infinite; }
.lv-cta { position: relative; overflow: hidden; isolation: isolate; transition: transform .15s ease, box-shadow .2s ease, filter .2s ease !important; }
.lv-cta:hover { transform: translateY(-2px); filter: saturate(1.1); }
.lv-cta:active { transform: translateY(1px) scale(.985); }
.lv-cta::after { content: ""; position: absolute; top: 0; bottom: 0; width: 38%; left: 0; z-index: -1;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.45), transparent); animation: lv-shine 3.6s ease-in-out infinite; }
.lv-ghost { transition: background-color .15s ease, transform .15s ease !important; }
.lv-ghost:hover { background-color: color-mix(in srgb, var(--lv-ink) 8%, transparent) !important; }
.lv-ghost:active { transform: scale(.985); }
.lv-tile { transition: transform .28s cubic-bezier(.2,.9,.3,1.3), box-shadow .28s ease !important; }
.lv-tile:hover { transform: translateY(-4px) rotate(-.5deg); }
.lv-tile:active { transform: scale(.98); }
.lv-tile:focus-visible, .lv-focus:focus-visible { outline: 3px solid var(--lv-a2); outline-offset: 3px; }
@media (prefers-reduced-motion: reduce) {
  .lv-float, .lv-pop, .lv-wiggle, .lv-slap, .lv-pulse, .lv-sky-blob, .lv-star, .lv-rise, .lv-marquee-track, .lv-burst-bit, .lv-cta::after { animation: none !important; }
  .lv-root *, .lv-root { transition: none !important; }
}
`;

// ─── Sky ─────────────────────────────────────────────────────────────────────

/** Deterministic, rounded so the server and the browser print identical styles. */
const DOTS = Array.from({ length: 48 }, (_, i) => {
  const r = (n: number) => {
    const x = Math.sin((i + 5) * 12.9898 + n * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };
  const q = (n: number) => Math.round(n * 100) / 100;
  return { x: q(r(1) * 100), y: q(r(2) * 100), s: q(r(3) * 1.8 + 0.6), d: q(r(4) * 5), t: q(2.4 + r(5) * 3), k: Math.floor(r(6) * 100) };
});

const FLOATERS: Record<LoveTheme["sky"], string[]> = {
  stars: [],
  hearts: ["💗", "💕", "🩷", "💖", "❤️"],
  bokeh: [],
  sparkles: ["✦", "✧", "⋆", "✶"],
};

/** The full-bleed background: gradient + drifting colour blobs + theme floaters + grain. */
export function LoveSky({ theme, reduceMotion }: { theme: LoveTheme; reduceMotion: boolean }) {
  const blob = (color: string, style: CSSProperties, dur: number) => (
    <span
      className="lv-sky-blob"
      style={{
        position: "absolute",
        borderRadius: "50%",
        filter: "blur(80px)",
        opacity: theme.dark ? 0.5 : 0.42,
        background: color,
        animation: reduceMotion ? "none" : `lv-drift ${dur}s ease-in-out infinite`,
        ...style,
      }}
    />
  );
  const floaters = FLOATERS[theme.sky];
  return (
    <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none", background: V.bg }}>
      {blob(V.a1, { width: "55vmax", height: "55vmax", left: "-20vmax", top: "-16vmax" }, 24)}
      {blob(V.a3, { width: "48vmax", height: "48vmax", right: "-20vmax", top: "22vh" }, 30)}
      {blob(V.a2, { width: "40vmax", height: "40vmax", left: "12vw", bottom: "-24vmax", opacity: 0.3 }, 27)}

      {(theme.sky === "stars" || theme.sky === "bokeh") &&
        DOTS.map((s, i) => {
          const bokeh = theme.sky === "bokeh";
          const size = bokeh ? s.s * 9 : s.s;
          return (
            <span
              key={i}
              className="lv-star"
              style={{
                position: "absolute",
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: size,
                height: size,
                borderRadius: "50%",
                background: bokeh ? (i % 3 ? V.a1 : V.a3) : theme.dark ? "#fff" : V.a1,
                opacity: bokeh ? 0.16 : 0.5,
                filter: bokeh ? "blur(2px)" : undefined,
                animation: reduceMotion ? "none" : `lv-twinkle ${s.t}s ease-in-out ${s.d}s infinite`,
              }}
            />
          );
        })}

      {floaters.length > 0 &&
        DOTS.slice(0, reduceMotion ? 10 : 16).map((s, i) => (
          <span
            key={`f${i}`}
            className="lv-rise"
            style={
              {
                position: "absolute",
                left: `${s.x}%`,
                top: reduceMotion ? `${s.y}%` : "100%",
                fontSize: 12 + (s.k % 16),
                color: theme.sky === "sparkles" ? (i % 2 ? V.a1 : V.a3) : undefined,
                opacity: reduceMotion ? 0.35 : 0,
                "--sway": `${(s.k % 2 ? 1 : -1) * (20 + (s.k % 40))}px`,
                "--spin": `${(s.k % 2 ? 1 : -1) * 90}deg`,
                animation: reduceMotion ? "none" : `lv-rise ${11 + (s.k % 9)}s linear ${-s.d * 3}s infinite`,
              } as CSSProperties
            }
          >
            {floaters[i % floaters.length]}
          </span>
        ))}

      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: theme.dark ? 0.09 : 0.06, mixBlendMode: "overlay" }}>
        <filter id="lv-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#lv-grain)" />
      </svg>
    </div>
  );
}

// ─── Text + surfaces ─────────────────────────────────────────────────────────

export function Glass({ children, style, className }: { children: ReactNode; style?: CSSProperties; className?: string }) {
  return (
    <div
      className={className}
      style={{
        background: V.glass,
        border: `1px solid ${V.edge}`,
        borderRadius: 24,
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        boxShadow: `0 24px 60px -30px ${V.shadow}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function Eyebrow({ children, color = V.soft, style }: { children: ReactNode; color?: string; style?: CSSProperties }) {
  return (
    <p style={{ margin: 0, fontFamily: GROTESK, fontSize: 11, fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase", color, ...style }}>
      {children}
    </p>
  );
}

export function GradText({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <span style={{ background: V.gradText, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", ...style }}>{children}</span>
  );
}

/** A tilted sticker label — the "✓ it's official" chip. */
export function Sticker({ children, tilt = -2, style }: { children: ReactNode; tilt?: number; style?: CSSProperties }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "7px 15px",
        borderRadius: 999,
        background: V.chip,
        color: V.chipInk,
        fontFamily: GROTESK,
        fontWeight: 800,
        fontSize: 13,
        letterSpacing: ".1em",
        textTransform: "uppercase",
        transform: `rotate(${tilt}deg)`,
        boxShadow: `0 10px 24px -12px ${V.shadow}`,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export function SectionHead({ eyebrow, title, emoji, note, align = "center" }: { eyebrow: string; title: ReactNode; emoji?: string; note?: string; align?: "center" | "left" }) {
  return (
    <header style={{ textAlign: align, marginBottom: 20 }}>
      <Eyebrow color={V.a1}>{eyebrow}</Eyebrow>
      <h2 style={{ margin: "8px 0 0", fontFamily: GROTESK, fontWeight: 800, fontSize: "clamp(26px, 6.4vw, 40px)", lineHeight: 1.02, letterSpacing: "-0.035em", color: V.ink }}>
        {title} {emoji && <span aria-hidden>{emoji}</span>}
      </h2>
      {note && <p style={{ margin: "8px 0 0", fontSize: 14, color: V.soft }}>{note}</p>}
    </header>
  );
}

// ─── Buttons ─────────────────────────────────────────────────────────────────

type BtnProps = { children: ReactNode; onClick?: () => void; disabled?: boolean; ariaLabel?: string; style?: CSSProperties };

export function CandyButton({ children, onClick, disabled, ariaLabel, style }: BtnProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="lv-cta lv-focus"
      style={{
        width: "100%",
        minHeight: 56,
        padding: "14px 22px",
        borderRadius: 999,
        border: "none",
        background: V.grad,
        color: "#fff",
        fontFamily: GROTESK,
        fontWeight: 800,
        fontSize: 17,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.6 : 1,
        boxShadow: `0 16px 34px -14px color-mix(in srgb, var(--lv-a1) 80%, transparent), inset 0 -3px 0 rgba(0,0,0,.12)`,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        WebkitTapHighlightColor: "transparent",
        ...style,
      }}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, onClick, disabled, ariaLabel, style }: BtnProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="lv-ghost lv-focus"
      style={{
        width: "100%",
        minHeight: 50,
        padding: "12px 18px",
        borderRadius: 999,
        border: `1.5px solid ${V.edge}`,
        background: "transparent",
        color: V.ink,
        fontFamily: GROTESK,
        fontWeight: 700,
        fontSize: 15,
        cursor: disabled ? "default" : "pointer",
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

// ─── Tape marquee ────────────────────────────────────────────────────────────

export function Tape({ words, tilt = -3, tone = "grad", reduceMotion }: { words: string[]; tilt?: number; tone?: "grad" | "chip"; reduceMotion: boolean }) {
  const run = [...words, ...words, ...words, ...words];
  const chip = tone === "chip";
  return (
    <div
      aria-hidden
      style={{
        transform: `rotate(${tilt}deg)`,
        margin: "0 -40px",
        overflow: "hidden",
        background: chip ? V.chip : V.grad,
        color: chip ? V.chipInk : "#fff",
        boxShadow: `0 10px 30px -12px ${V.shadow}`,
        fontFamily: GROTESK,
        fontWeight: 800,
        fontSize: 13,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      <div className="lv-marquee-track" style={{ display: "inline-flex", padding: "8px 0", animation: reduceMotion ? "none" : "lv-marquee 24s linear infinite" }}>
        {[0, 1].map((half) => (
          <span key={half} style={{ display: "inline-flex" }}>
            {run.map((w, i) => (
              <span key={i} style={{ padding: "0 14px" }}>
                {w} <span style={{ opacity: 0.7, paddingLeft: 14 }}>✦</span>
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Confetti ────────────────────────────────────────────────────────────────

export function HeartBurst({ glyphs = ["💘", "✨", "💖", "🩷", "⭐"] }: { glyphs?: string[] }) {
  const bits = Array.from({ length: 22 }, (_, i) => {
    const a = (i / 22) * Math.PI * 2;
    const dist = 120 + (i % 5) * 34;
    return {
      dx: `${Math.round(Math.cos(a) * dist)}px`,
      dy: `${Math.round(Math.sin(a) * dist - 40)}px`,
      rot: `${(i % 2 ? 1 : -1) * (90 + i * 13)}deg`,
      ch: glyphs[i % glyphs.length],
      delay: (i % 4) * 30,
    };
  });
  return (
    <div aria-hidden style={{ position: "absolute", left: "50%", top: "50%", width: 0, height: 0, pointerEvents: "none", zIndex: 3 }}>
      {bits.map((b, i) => (
        <span
          key={i}
          className="lv-burst-bit"
          style={
            {
              position: "absolute",
              fontSize: 22,
              left: -11,
              top: -11,
              "--dx": b.dx,
              "--dy": b.dy,
              "--rot": b.rot,
              animation: `lv-burst 1s cubic-bezier(.15,.8,.3,1) ${b.delay}ms both`,
            } as CSSProperties
          }
        >
          {b.ch}
        </span>
      ))}
    </div>
  );
}

// ─── Chrome ──────────────────────────────────────────────────────────────────

/** Top-right brand badge on the published page — also the "make your own" link. */
export function BrandBadge() {
  return (
    <Link
      href="/templates"
      aria-label="SubhSandesh — make your own"
      className="fixed right-3 top-3 z-[95] inline-flex items-center gap-1.5 rounded-full px-3 py-1.5"
      style={{ background: V.glass, border: `1px solid ${V.edge}`, backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", textDecoration: "none" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.webp" alt="" width={18} height={18} style={{ width: 18, height: 18 }} />
      <span className="text-[11px] font-semibold" style={{ color: V.ink, fontFamily: GROTESK }}>
        SubhSandesh
      </span>
    </Link>
  );
}

/**
 * The sender's preview-only theme switcher: a floating pill of swatches at the
 * bottom. Tapping one re-themes the page instantly (and, once they have made
 * the page their own, it is the theme that gets published).
 */
export function ThemeDock({ themes, value, onChange }: { themes: readonly LoveTheme[]; value: string; onChange: (id: string) => void }) {
  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: "calc(16px + env(safe-area-inset-bottom, 0px))",
        zIndex: 110,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
        padding: "0 12px",
      }}
    >
      <div
        role="radiogroup"
        aria-label="Colour theme"
        className="lv-pop"
        style={{
          pointerEvents: "auto",
          display: "flex",
          alignItems: "center",
          gap: 6,
          padding: 6,
          borderRadius: 999,
          background: "rgba(18,10,30,.72)",
          border: "1px solid rgba(255,255,255,.18)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          boxShadow: "0 18px 40px -16px rgba(0,0,0,.7)",
          maxWidth: "100%",
          overflowX: "auto",
        }}
      >
        <span className="lv-dock-label" style={{ padding: "0 6px 0 10px", fontFamily: GROTESK, fontSize: 11, fontWeight: 800, letterSpacing: ".16em", textTransform: "uppercase", color: "rgba(255,255,255,.6)", whiteSpace: "nowrap" }}>
          🎨 vibe
        </span>
        {themes.map((t) => {
          const on = t.id === value;
          return (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={`${t.name} theme`}
              onClick={() => onChange(t.id)}
              className="lv-focus"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                minHeight: 40,
                padding: on ? "0 14px 0 5px" : 5,
                borderRadius: 999,
                border: "none",
                cursor: "pointer",
                background: on ? "#fff" : "transparent",
                color: "#1a0d26",
                fontFamily: GROTESK,
                fontWeight: 800,
                fontSize: 13,
                whiteSpace: "nowrap",
                transition: "background-color .2s ease, padding .2s ease",
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: `conic-gradient(${t.swatch[0]} 0 33%, ${t.swatch[1]} 0 66%, ${t.swatch[2]} 0)`,
                  border: "2px solid rgba(255,255,255,.85)",
                  display: "grid",
                  placeItems: "center",
                  fontSize: 14,
                  flexShrink: 0,
                }}
              >
                {on ? t.emoji : ""}
              </span>
              {on && t.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
