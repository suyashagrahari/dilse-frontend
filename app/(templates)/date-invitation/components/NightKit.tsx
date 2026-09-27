"use client";

// ─── The night-out kit ───────────────────────────────────────────────────────
//
// Shared pieces for every recipient screen: the animated night sky, the tape
// marquee, glass panels, sticker chips, the candy CTA and the demo-only
// "what happens next" nudge. One stylesheet (`NIGHT_CSS`) is mounted once by
// the phase router; every animation is switched off under reduced motion.

import { useSyncExternalStore, type CSSProperties, type ReactNode } from "react";

import {
  GLASS,
  GLASS_EDGE,
  GRAD,
  GRAD_TEXT,
  GROTESK,
  LILAC,
  MOON,
  MOON_SOFT,
  NIGHT,
  NIGHT_2,
  POP,
  TANG,
} from "./dateTheme";

export const NIGHT_CSS = `
@keyframes di-float { 0%,100% { transform: translate3d(0,0,0) } 50% { transform: translate3d(0,-14px,0) } }
@keyframes di-drift { 0% { transform: translate3d(-6%, -4%, 0) scale(1) } 50% { transform: translate3d(6%, 5%, 0) scale(1.12) } 100% { transform: translate3d(-6%, -4%, 0) scale(1) } }
@keyframes di-twinkle { 0%,100% { opacity: .15 } 50% { opacity: .9 } }
@keyframes di-marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
@keyframes di-shine { 0% { transform: translateX(-120%) skewX(-18deg) } 60%,100% { transform: translateX(260%) skewX(-18deg) } }
@keyframes di-pop-in { 0% { opacity: 0; transform: translateY(18px) scale(.96) } 100% { opacity: 1; transform: none } }
@keyframes di-slap { 0% { opacity: 0; transform: rotate(-14deg) scale(2.2) } 60% { opacity: 1; transform: rotate(-9deg) scale(.92) } 100% { opacity: 1; transform: rotate(-8deg) scale(1) } }
@keyframes di-burst { 0% { opacity: 1; transform: translate(0,0) scale(.4) rotate(0) } 100% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(1.1) rotate(var(--rot)) } }
@keyframes di-live { 0% { box-shadow: 0 0 0 0 rgba(255,79,139,.7) } 70% { box-shadow: 0 0 0 10px rgba(255,79,139,0) } 100% { box-shadow: 0 0 0 0 rgba(255,79,139,0) } }
@keyframes di-tick { 0% { transform: translateY(-38%); opacity: 0 } 100% { transform: none; opacity: 1 } }
@keyframes di-wiggle { 0%,100% { transform: rotate(-3deg) } 50% { transform: rotate(3deg) } }
@keyframes di-scramble { 0%,100% { filter: blur(5px) } 50% { filter: blur(3.5px) } }

.di-float { animation: di-float 6s ease-in-out infinite; }
.di-pop-in { animation: di-pop-in .55s cubic-bezier(.2,.9,.3,1.2) both; }
.di-slap { animation: di-slap .5s cubic-bezier(.2,.9,.3,1.3) both; }
.di-live-dot { animation: di-live 1.8s ease-out infinite; }
.di-tick { animation: di-tick .35s cubic-bezier(.2,.9,.3,1.2) both; }
.di-wiggle { animation: di-wiggle 2.8s ease-in-out infinite; }
.di-scramble { animation: di-scramble 2.4s ease-in-out infinite; }
.di-cta { position: relative; overflow: hidden; isolation: isolate; transition: transform .15s ease, box-shadow .2s ease, filter .2s ease; }
.di-cta:hover { transform: translateY(-2px); filter: saturate(1.1); }
.di-cta:active { transform: translateY(1px) scale(.985); }
.di-cta::after { content: ""; position: absolute; top: 0; bottom: 0; width: 38%; left: 0; z-index: -1;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.45), transparent); animation: di-shine 3.6s ease-in-out infinite; }
.di-ghost { transition: background-color .15s ease, transform .15s ease, border-color .15s ease; }
.di-ghost:hover { background-color: rgba(255,255,255,.1); }
.di-ghost:active { transform: scale(.985); }
.di-chip { transition: transform .2s cubic-bezier(.2,.9,.3,1.3); }
.di-chip:hover { transform: translateY(-2px) rotate(-1deg); }

@media (prefers-reduced-motion: reduce) {
  .di-float, .di-pop-in, .di-slap, .di-live-dot, .di-tick, .di-wiggle, .di-scramble,
  .di-sky-blob, .di-star, .di-marquee-track, .di-burst-bit, .di-cta::after { animation: none !important; }
}
`;

// ─── Hydration guard ─────────────────────────────────────────────────────────
//
// Dates and times are formatted in the VIEWER's zone and locale. The server has
// neither (it prints "7:52 PM" in UTC; the phone wants "7:52 pm" local), so any
// text built from them renders only once we are on the client.

const noop = () => () => {};
export function useHydrated(): boolean {
  return useSyncExternalStore(noop, () => true, () => false);
}

// ─── Sky ─────────────────────────────────────────────────────────────────────

/** Deterministic star field — the same on server and client, so it hydrates. */
const STARS = Array.from({ length: 46 }, (_, i) => {
  const r = (n: number) => {
    const x = Math.sin((i + 1) * 9301 + n * 49297) * 233280;
    return x - Math.floor(x);
  };
  // Rounded, so the server and the browser print identical style strings.
  const q = (n: number) => Math.round(n * 100) / 100;
  return { x: q(r(1) * 100), y: q(r(2) * 100), s: q(r(3) * 1.8 + 0.6), d: q(r(4) * 4), t: q(2.5 + r(5) * 3) };
});

export function NightSky({ reduceMotion }: { reduceMotion: boolean }) {
  const blob = (bg: string, style: CSSProperties, dur: number): ReactNode => (
    <span
      className="di-sky-blob"
      style={{
        position: "absolute",
        borderRadius: "50%",
        filter: "blur(70px)",
        opacity: 0.55,
        background: bg,
        animation: reduceMotion ? "none" : `di-drift ${dur}s ease-in-out infinite`,
        ...style,
      }}
    />
  );
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        overflow: "hidden",
        pointerEvents: "none",
        background: `radial-gradient(120% 90% at 50% 0%, ${NIGHT_2} 0%, ${NIGHT} 60%)`,
      }}
    >
      {blob(POP, { width: "55vmax", height: "55vmax", left: "-18vmax", top: "-14vmax" }, 22)}
      {blob(LILAC, { width: "50vmax", height: "50vmax", right: "-20vmax", top: "18vh" }, 28)}
      {blob(TANG, { width: "42vmax", height: "42vmax", left: "10vw", bottom: "-24vmax", opacity: 0.38 }, 26)}
      {STARS.map((s, i) => (
        <span
          key={i}
          className="di-star"
          style={{
            position: "absolute",
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.s,
            height: s.s,
            borderRadius: "50%",
            background: "#fff",
            opacity: 0.5,
            animation: reduceMotion ? "none" : `di-twinkle ${s.t}s ease-in-out ${s.d}s infinite`,
          }}
        />
      ))}
      {/* Film grain, so the gradients never band. */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.09, mixBlendMode: "overlay" }}>
        <filter id="di-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#di-grain)" />
      </svg>
    </div>
  );
}

// ─── Tape marquee ────────────────────────────────────────────────────────────

export function Tape({
  words,
  tilt = -3,
  tone = "pop",
  reduceMotion,
}: {
  words: string[];
  tilt?: number;
  tone?: "pop" | "lime";
  reduceMotion: boolean;
}) {
  const run = [...words, ...words, ...words, ...words];
  const lime = tone === "lime";
  return (
    <div
      aria-hidden
      style={{
        transform: `rotate(${tilt}deg)`,
        margin: "0 -40px",
        overflow: "hidden",
        background: lime ? "#d8ff5c" : GRAD,
        color: lime ? "#1a0d26" : "#fff",
        boxShadow: "0 10px 30px -12px rgba(0,0,0,.6)",
        fontFamily: GROTESK,
        fontWeight: 800,
        fontSize: 13,
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        whiteSpace: "nowrap",
      }}
    >
      <div
        className="di-marquee-track"
        style={{
          display: "inline-flex",
          padding: "8px 0",
          animation: reduceMotion ? "none" : "di-marquee 22s linear infinite",
        }}
      >
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

// ─── Glass + stickers ────────────────────────────────────────────────────────

export function Glass({
  children,
  style,
  className,
}: {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        background: GLASS,
        border: `1px solid ${GLASS_EDGE}`,
        borderRadius: 24,
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        boxShadow: "0 24px 60px -30px rgba(0,0,0,.7), inset 0 1px 0 rgba(255,255,255,.08)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** Small uppercase label on the sky. */
export function Eyebrow({ children, color = MOON_SOFT, style }: { children: ReactNode; color?: string; style?: CSSProperties }) {
  return (
    <p
      style={{
        margin: 0,
        fontFamily: GROTESK,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color,
        ...style,
      }}
    >
      {children}
    </p>
  );
}

/** Gradient headline text. */
export function GradText({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <span
      style={{
        background: GRAD_TEXT,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

/** The one loud button. */
export function CandyButton({
  children,
  onClick,
  disabled,
  ariaLabel,
  style,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
  style?: CSSProperties;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="di-cta"
      style={{
        width: "100%",
        minHeight: 58,
        padding: "14px 20px",
        borderRadius: 999,
        border: "none",
        background: GRAD,
        color: "#fff",
        fontFamily: GROTESK,
        fontWeight: 800,
        fontSize: 17,
        letterSpacing: "0.01em",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.6 : 1,
        boxShadow: "0 16px 34px -14px rgba(255,79,139,.85), inset 0 -3px 0 rgba(0,0,0,.12)",
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

/** Quiet outline button on the sky. */
export function GhostButton({
  children,
  onClick,
  disabled,
  ariaLabel,
  ariaExpanded,
  style,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  ariaLabel?: string;
  ariaExpanded?: boolean;
  style?: CSSProperties;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      aria-expanded={ariaExpanded}
      className="di-ghost"
      style={{
        width: "100%",
        minHeight: 50,
        padding: "12px 18px",
        borderRadius: 999,
        border: `1.5px solid ${GLASS_EDGE}`,
        background: "rgba(255,255,255,.04)",
        color: MOON,
        fontFamily: GROTESK,
        fontWeight: 600,
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

/** Confetti hearts for the yes. Pure CSS, fired once on mount. */
export function HeartBurst() {
  const bits = Array.from({ length: 22 }, (_, i) => {
    const a = (i / 22) * Math.PI * 2;
    const dist = 120 + (i % 5) * 34;
    return {
      dx: `${Math.cos(a) * dist}px`,
      dy: `${Math.sin(a) * dist - 40}px`,
      rot: `${(i % 2 ? 1 : -1) * (90 + i * 13)}deg`,
      ch: ["💘", "✨", "💖", "🩷", "⭐"][i % 5],
      delay: (i % 4) * 30,
    };
  });
  return (
    <div aria-hidden style={{ position: "absolute", left: "50%", top: "50%", width: 0, height: 0, pointerEvents: "none" }}>
      {bits.map((b, i) => (
        <span
          key={i}
          className="di-burst-bit"
          style={
            {
              position: "absolute",
              fontSize: 22,
              left: -11,
              top: -11,
              "--dx": b.dx,
              "--dy": b.dy,
              "--rot": b.rot,
              animation: `di-burst 1s cubic-bezier(.15,.8,.3,1) ${b.delay}ms both`,
            } as CSSProperties
          }
        >
          {b.ch}
        </span>
      ))}
    </div>
  );
}

// ─── Demo-only nudge ─────────────────────────────────────────────────────────
//
// The sender's preview has to show every screen, but a dev-tool phase bar is
// not product. Instead each screen offers the natural next step as a single
// floating pill: "peek at date night", "replay from the invite".

export function DemoNudge({ label, emoji, onClick }: { label: string; emoji: string; onClick: () => void }) {
  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        right: 0,
        bottom: "calc(18px + env(safe-area-inset-bottom, 0px))",
        zIndex: 130,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
        padding: "0 16px",
      }}
    >
      <button
        type="button"
        onClick={onClick}
        className="di-pop-in"
        style={{
          pointerEvents: "auto",
          display: "inline-flex",
          alignItems: "center",
          gap: 10,
          padding: "8px 18px 8px 8px",
          minHeight: 48,
          borderRadius: 999,
          border: "1px solid rgba(255,255,255,.18)",
          background: "rgba(18,8,31,.78)",
          backdropFilter: "blur(14px)",
          WebkitBackdropFilter: "blur(14px)",
          color: MOON,
          fontFamily: GROTESK,
          fontWeight: 700,
          fontSize: 14,
          boxShadow: "0 18px 40px -16px rgba(0,0,0,.8)",
          cursor: "pointer",
        }}
      >
        <span
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            background: GRAD,
            fontSize: 15,
          }}
        >
          {emoji}
        </span>
        {label}
        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: ".16em", color: "rgba(255,246,251,.5)", textTransform: "uppercase" }}>
          preview
        </span>
      </button>
    </div>
  );
}
