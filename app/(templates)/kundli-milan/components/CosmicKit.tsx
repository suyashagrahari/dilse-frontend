"use client";

// ─── The cosmic layer ────────────────────────────────────────────────────────
//
// The night-sky family look (shared with The Invitation via its NightKit and
// fonts) plus this template's own identity: a slowly turning zodiac ring, gold
// starlight and floating planets. Every animation stops under reduced motion.

import type { CSSProperties, ReactNode } from "react";

import { cropStyle, photoCrop } from "../../dedication/components/types";
import type { KundliPhoto } from "./types";

export const GOLD = "#ffd27a";
export const GOLD_SOFT = "rgba(255,210,122,.18)";
export const INDIGO = "#140a2e";
export const INDIGO_2 = "#24124a";

export const ZODIAC = ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"];

export const COSMIC_CSS = `
@keyframes km-spin { to { transform: rotate(360deg) } }
@keyframes km-spin-rev { to { transform: rotate(-360deg) } }
@keyframes km-twinkle { 0%,100% { opacity: .15 } 50% { opacity: .95 } }
@keyframes km-drift { 0%,100% { transform: translate3d(0,0,0) } 50% { transform: translate3d(0,-12px,0) } }
@keyframes km-orbit { from { transform: rotate(0deg) translateX(var(--r)) rotate(0deg) } to { transform: rotate(360deg) translateX(var(--r)) rotate(-360deg) } }
@keyframes km-glow { 0%,100% { box-shadow: 0 0 0 0 rgba(255,210,122,.0), 0 0 40px 6px rgba(255,79,139,.35) } 50% { box-shadow: 0 0 0 10px rgba(255,210,122,.08), 0 0 70px 14px rgba(255,79,139,.5) } }
@keyframes km-shoot { 0% { transform: translate(0,0) rotate(-30deg); opacity: 0 } 8% { opacity: 1 } 30% { transform: translate(-420px, 240px) rotate(-30deg); opacity: 0 } 100% { opacity: 0 } }
@keyframes km-bar { from { width: 0 } }
@keyframes km-wobble { 0%,100% { transform: rotate(-4deg) } 50% { transform: rotate(4deg) } }
.km-spin { animation: km-spin 60s linear infinite; }
.km-spin-fast { animation: km-spin 3.2s linear infinite; }
.km-spin-rev { animation: km-spin-rev 90s linear infinite; }
.km-drift { animation: km-drift 7s ease-in-out infinite; }
.km-glow { animation: km-glow 3.2s ease-in-out infinite; }
.km-wobble { animation: km-wobble 3s ease-in-out infinite; }
.km-card { transition: transform .25s cubic-bezier(.2,.9,.3,1.3), box-shadow .25s ease; }
.km-card:hover { transform: translateY(-4px) rotate(-.4deg); }
@media (prefers-reduced-motion: reduce) {
  .km-spin, .km-spin-fast, .km-spin-rev, .km-drift, .km-glow, .km-wobble, .km-star, .km-shoot, .km-planet { animation: none !important; }
}
`;

/** Deterministic star field, rounded so server and client print the same styles. */
const STARS = Array.from({ length: 60 }, (_, i) => {
  const r = (n: number) => {
    const x = Math.sin((i + 3) * 7919 + n * 104729) * 43758.5453;
    return x - Math.floor(x);
  };
  const q = (n: number) => Math.round(n * 100) / 100;
  return { x: q(r(1) * 100), y: q(r(2) * 100), s: q(r(3) * 2 + 0.5), d: q(r(4) * 4), t: q(2 + r(5) * 3), gold: r(6) > 0.85 };
});

export function CosmicSky({ reduceMotion }: { reduceMotion: boolean }) {
  const nebula = (bg: string, style: CSSProperties) => (
    <span style={{ position: "absolute", borderRadius: "50%", filter: "blur(80px)", background: bg, ...style }} />
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
        background: `radial-gradient(120% 80% at 50% -10%, ${INDIGO_2} 0%, ${INDIGO} 55%, #0b0619 100%)`,
      }}
    >
      {nebula("#ff4f8b", { width: "50vmax", height: "50vmax", left: "-20vmax", top: "-10vmax", opacity: 0.35 })}
      {nebula("#7c5cff", { width: "55vmax", height: "55vmax", right: "-22vmax", top: "20vh", opacity: 0.4 })}
      {nebula("#ffb03c", { width: "40vmax", height: "40vmax", left: "15vw", bottom: "-25vmax", opacity: 0.22 })}

      {/* A giant faint zodiac wheel behind everything. */}
      <div
        className={reduceMotion ? "" : "km-spin-rev"}
        style={{ position: "absolute", left: "50%", top: "38%", width: "140vmin", height: "140vmin", marginLeft: "-70vmin", marginTop: "-70vmin", opacity: 0.09 }}
      >
        <ZodiacRing size="100%" stroke={GOLD} glyphSize="5vmin" />
      </div>

      {STARS.map((s, i) => (
        <span
          key={i}
          className="km-star"
          style={{
            position: "absolute",
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.s,
            height: s.s,
            borderRadius: "50%",
            background: s.gold ? GOLD : "#fff",
            boxShadow: s.gold ? `0 0 6px ${GOLD}` : undefined,
            opacity: 0.5,
            animation: reduceMotion ? "none" : `km-twinkle ${s.t}s ease-in-out ${s.d}s infinite`,
          }}
        />
      ))}

      {!reduceMotion &&
        [0, 1].map((i) => (
          <span
            key={i}
            className="km-shoot"
            style={{
              position: "absolute",
              right: `${10 + i * 30}%`,
              top: `${8 + i * 22}%`,
              width: 120,
              height: 2,
              borderRadius: 2,
              background: "linear-gradient(90deg, #fff, transparent)",
              animation: `km-shoot ${9 + i * 4}s ease-in ${2 + i * 5}s infinite`,
            }}
          />
        ))}
    </div>
  );
}

/** The twelve signs on a ring. `size` is any CSS length. */
/** Server and browser disagree in the last float digit; round so they print the same. */
const r3 = (n: number) => Math.round(n * 1000) / 1000;

export function ZodiacRing({
  size,
  stroke = GOLD,
  glyphSize = 16,
  children,
}: {
  size: number | string;
  stroke?: string;
  glyphSize?: number | string;
  children?: ReactNode;
}) {
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg viewBox="0 0 100 100" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} aria-hidden>
        <circle cx="50" cy="50" r="49" fill="none" style={{ stroke }} strokeWidth="0.5" />
        <circle cx="50" cy="50" r="40" fill="none" style={{ stroke }} strokeWidth="0.35" strokeDasharray="1 2" />
        {ZODIAC.map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return (
            <line
              key={i}
              x1={r3(50 + Math.cos(a) * 40)}
              y1={r3(50 + Math.sin(a) * 40)}
              x2={r3(50 + Math.cos(a) * 49)}
              y2={r3(50 + Math.sin(a) * 49)}
              style={{ stroke }}
              strokeWidth="0.35"
            />
          );
        })}
      </svg>
      {ZODIAC.map((g, i) => {
        const a = ((i + 0.5) / 12) * Math.PI * 2;
        return (
          <span
            key={g}
            aria-hidden
            style={{
              position: "absolute",
              left: `${r3(50 + Math.cos(a) * 44.5)}%`,
              top: `${r3(50 + Math.sin(a) * 44.5)}%`,
              transform: "translate(-50%, -50%)",
              color: stroke,
              fontSize: glyphSize,
              lineHeight: 1,
            }}
          >
            {g}
          </span>
        );
      })}
      {children}
    </div>
  );
}

/** A photo inside a circle, using the framing the sender set in the editor. */
export function PhotoOrb({
  photo,
  size,
  fallback,
  ring = GOLD,
  className,
}: {
  photo?: KundliPhoto;
  size: number;
  fallback: string;
  ring?: string;
  className?: string;
}) {
  return (
    <span
      className={className}
      style={{
        position: "relative",
        display: "inline-block",
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        border: `3px solid ${ring}`,
        background: "linear-gradient(135deg, var(--lv-a1, #ff4f8b), var(--lv-a2, #7c5cff))",
        boxShadow: "0 18px 40px -16px rgba(0,0,0,.8)",
        flexShrink: 0,
      }}
    >
      {photo ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photo.url} alt="" draggable={false} style={cropStyle(photoCrop(photo))} />
      ) : (
        <span
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            color: "#fff",
            fontSize: size * 0.34,
            fontWeight: 800,
          }}
        >
          {fallback}
        </span>
      )}
    </span>
  );
}

export const initials = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "♥";

export const firstName = (name: string): string => name.trim().split(/\s+/)[0] || name;
