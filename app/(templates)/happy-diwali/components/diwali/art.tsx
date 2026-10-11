"use client";

// Hand-drawn SVG pieces of the Diwali night: the clay diya (unlit / lit, with a
// CSS-flickered flame), the carved front door, and the five sweets. Static
// SVG; only the flame and glow move (transform/opacity).

import type { CSSProperties } from "react";
import type { DiwaliMithai } from "../../../_valentine/days/happy-diwali";

export const ART_CSS = `
.dw-flame { transform-origin: 50% 100%; animation: dw-flick 1.6s ease-in-out infinite alternate; }
.dw-flame-in { transform-origin: 50% 100%; animation: dw-flick2 1.1s ease-in-out infinite alternate; }
@keyframes dw-flick { 0% { transform: scale(1, 1) skewX(0deg) } 30% { transform: scale(.96, 1.06) skewX(-3deg) } 65% { transform: scale(1.03, .95) skewX(2.5deg) } 100% { transform: scale(.98, 1.04) skewX(-1.5deg) } }
@keyframes dw-flick2 { 0% { transform: scale(1, 1) } 50% { transform: scale(.9, 1.1) } 100% { transform: scale(1.05, .92) } }
.dw-halo { transform-origin: 50% 50%; animation: dw-halo 2.4s ease-in-out infinite alternate; }
@keyframes dw-halo { from { opacity: .7; transform: scale(.94) } to { opacity: 1; transform: scale(1.06) } }
@media (prefers-reduced-motion: reduce) { .dw-flame, .dw-flame-in, .dw-halo { animation: none; } }
`;

/**
 * A clay diya seen from the front, 200×150 units. `lit` adds the flame and
 * the halo. `hue` shifts the clay paint a little so a row is not identical.
 */
export function Diya({ lit, hue = 0, style, id = "a" }: { lit: boolean; hue?: number; style?: CSSProperties; id?: string }) {
  const clayTop = ["#E86A24", "#D9541C", "#E07A2A", "#CF4A22", "#E3622A"][hue % 5];
  return (
    <svg viewBox="0 0 200 150" width="100%" height="100%" style={{ display: "block", overflow: "visible", ...style }} aria-hidden>
      <defs>
        <linearGradient id={`dw-clay-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={clayTop} />
          <stop offset="1" stopColor="#7A2A0C" />
        </linearGradient>
        <radialGradient id={`dw-oil-${id}`} cx="50%" cy="40%" r="60%">
          <stop offset="0" stopColor="#FFE9A8" />
          <stop offset="1" stopColor="#E9B04A" />
        </radialGradient>
        <radialGradient id={`dw-halo-${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="rgba(255,214,120,.85)" />
          <stop offset=".45" stopColor="rgba(255,170,60,.32)" />
          <stop offset="1" stopColor="rgba(255,150,40,0)" />
        </radialGradient>
      </defs>
      {lit && <circle className="dw-halo" cx="100" cy="62" r="78" fill={`url(#dw-halo-${id})`} />}
      {/* the bowl */}
      <path d="M14 84 Q100 66 186 84 Q178 140 100 142 Q22 140 14 84 Z" fill={`url(#dw-clay-${id})`} />
      {/* oil + rim */}
      <ellipse cx="100" cy="84" rx="86" ry="13" fill={lit ? `url(#dw-oil-${id})` : "#5E2A12"} />
      <path d="M14 84 Q100 104 186 84" fill="none" stroke="#FFD36E" strokeWidth="3.5" />
      <path d="M14 84 Q100 64 186 84" fill="none" stroke="#9A3A12" strokeWidth="2.5" />
      {/* painted band: dots and a mango (paisley) in the middle */}
      {[30, 46, 62, 138, 154, 170].map((x, i) => (
        <circle key={i} cx={x} cy={x < 100 ? 104 + (62 - x) * 0.18 : 104 + (x - 138) * 0.18} r="3.6" fill={i % 2 ? "#FFD36E" : "#FFF3D6"} />
      ))}
      <path d="M100 98 C116 98 120 116 106 124 C96 129 86 122 90 113 C93 107 101 110 100 116" fill="none" stroke="#FFD36E" strokeWidth="3.4" strokeLinecap="round" />
      <circle cx="104" cy="112" r="3" fill="#FF5FA2" />
      <path d="M40 124 Q100 136 160 124" fill="none" stroke="rgba(255,211,110,.55)" strokeWidth="2" strokeDasharray="2 6" strokeLinecap="round" />
      {/* the wick */}
      <path d="M100 84 L100 72" stroke={lit ? "#3A1A0C" : "#2A1408"} strokeWidth="3" strokeLinecap="round" />
      {lit && (
        <g>
          <path className="dw-flame" d="M100 4 C118 34 124 52 100 74 C76 52 82 34 100 4 Z" fill="#FFB23F" />
          <path className="dw-flame-in" d="M100 28 C109 44 111 56 100 70 C89 56 91 44 100 28 Z" fill="#FFF3C4" />
        </g>
      )}
    </svg>
  );
}

/** The front door: a carved arch, two wooden leaves, brass knockers, a little toran. `open` 0 → 1 swings the leaves in. */
export function Door({ open, glow }: { open: number; glow: number }) {
  const leaf = (side: -1 | 1) => (
    <g style={{ transformBox: "fill-box", transformOrigin: side < 0 ? "0% 50%" : "100% 50%", transform: `scaleX(${1 - open * 0.55})`, transition: "transform 1.4s cubic-bezier(.3,.8,.3,1)" }}>
      <rect x={side < 0 ? 62 : 120} y="92" width="58" height="178" fill="url(#dw-wood)" stroke="#3B1A0A" strokeWidth="2" />
      {[0, 1, 2].map((k) => (
        <rect key={k} x={side < 0 ? 70 : 128} y={104 + k * 56} width="42" height="46" rx="4" fill="none" stroke="#C98A3A" strokeWidth="2" opacity=".8" />
      ))}
      {[0, 1, 2].map((k) => (
        <circle key={k} cx={side < 0 ? 91 : 149} cy={127 + k * 56} r="4" fill="#E9B04A" />
      ))}
      <circle cx={side < 0 ? 112 : 128} cy="186" r="6" fill="none" stroke="#FFD36E" strokeWidth="2.6" />
    </g>
  );
  return (
    <svg viewBox="0 0 240 300" width="100%" height="100%" style={{ display: "block", overflow: "visible" }} aria-hidden>
      <defs>
        <linearGradient id="dw-wood" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#6B3214" />
          <stop offset=".5" stopColor="#8A4520" />
          <stop offset="1" stopColor="#5A2810" />
        </linearGradient>
        <radialGradient id="dw-wall" cx="50%" cy="62%" r="62%">
          <stop offset="0" stopColor="#2E3478" />
          <stop offset=".7" stopColor="#222868" stopOpacity=".85" />
          <stop offset="1" stopColor="#1A1F52" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="dw-inside" cx="50%" cy="70%" r="70%">
          <stop offset="0" stopColor="#FFE9A8" />
          <stop offset=".6" stopColor="#FFB23F" />
          <stop offset="1" stopColor="#C25E0A" />
        </radialGradient>
      </defs>
      {/* wall */}
      <rect x="-30" y="0" width="300" height="290" fill="url(#dw-wall)" />
      {/* the arch frame */}
      <path d="M48 282 L48 96 Q48 34 120 30 Q192 34 192 96 L192 282 Z" fill="#3B1A0A" />
      <path d="M56 282 L56 98 Q56 44 120 40 Q184 44 184 98 L184 282 Z" fill="#C98A3A" opacity=".9" />
      {/* the inside: warm light once the door opens */}
      <path d="M62 272 L62 100 Q62 52 120 48 Q178 52 178 100 L178 272 Z" fill="url(#dw-inside)" opacity={0.25 + glow * 0.75} style={{ transition: "opacity 1.2s ease" }} />
      {/* fanlight in the arch */}
      <path d="M62 92 Q62 52 120 48 Q178 52 178 92 Z" fill="#1A1F52" opacity={1 - glow * 0.7} style={{ transition: "opacity 1.2s ease" }} />
      {[0, 1, 2, 3, 4].map((k) => (
        <path key={k} d={`M120 92 L${70 + k * 25} ${k === 2 ? 50 : 60 - Math.abs(k - 2) * -2}`} stroke="#C98A3A" strokeWidth="2" />
      ))}
      {leaf(-1)}
      {leaf(1)}
      {/* the step */}
      <rect x="28" y="270" width="184" height="14" rx="3" fill="#4A3A78" />
      <rect x="16" y="282" width="208" height="16" rx="3" fill="#3A2E66" />
      {/* a little toran over the arch */}
      <path d="M44 40 Q120 66 196 40" fill="none" stroke="#7A4A12" strokeWidth="1.4" />
      {Array.from({ length: 11 }, (_, k) => {
        const t = (k + 0.5) / 11;
        const x = 44 + 152 * t;
        const y = 40 + 2 * t * (1 - t) * 26;
        return <circle key={k} cx={x} cy={y} r="5" fill={k % 3 === 1 ? "#FFC83D" : k % 3 === 2 ? "#FF5A1F" : "#FF9A1F"} />;
      })}
      {[0.25, 0.5, 0.75].map((t) => {
        const x = 44 + 152 * t;
        const y = 40 + 2 * t * (1 - t) * 26;
        return <path key={t} d={`M${x} ${y + 4} q-5 7 0 15 q5 -8 0 -15z`} fill="#2F8F4E" />;
      })}
      {/* rangoli corners on the step */}
      {[40, 200].map((cx) => (
        <g key={cx} transform={`translate(${cx} 291)`}>
          {Array.from({ length: 8 }, (_, k) => (
            <ellipse key={k} cx="0" cy="-6" rx="2.6" ry="5.5" fill={["#FF5FA2", "#2EC4B6", "#FFD36E", "#8E4FD8"][k % 4]} transform={`rotate(${k * 45})`} />
          ))}
          <circle r="2.6" fill="#FFF3D6" />
        </g>
      ))}
    </svg>
  );
}

// ─── The sweets ──────────────────────────────────────────────────────────────

/** One sweet, about 60×60 units, drawn for the box. `bitten` takes a bite out of it. */
export function Sweet({ kind, bitten, id = "s" }: { kind: DiwaliMithai; bitten?: boolean; id?: string }) {
  const m = `dw-bite-${id}`;
  return (
    <svg viewBox="0 0 60 60" width="100%" height="100%" aria-hidden style={{ display: "block", overflow: "visible", filter: "drop-shadow(0 3px 3px rgba(122,42,12,.35))" }}>
      <defs>
        <mask id={m}>
          <rect x="-10" y="-10" width="80" height="80" fill="#fff" />
          {bitten && (
            <g fill="#000">
              <circle cx="40" cy="15" r="10" />
              <circle cx="48" cy="23" r="9" />
              <circle cx="32" cy="10" r="7" />
            </g>
          )}
        </mask>
      </defs>
      <g mask={`url(#${m})`}>
        <SweetArt kind={kind} />
      </g>
    </svg>
  );
}

function SweetArt({ kind }: { kind: DiwaliMithai }) {
  switch (kind) {
    case "kaju-katli":
      return (
        <g>
          <path d="M30 6 L54 30 L30 54 L6 30 Z" fill="#F1DDB8" stroke="#B9945E" strokeWidth="2" />
          <path d="M30 10 L50 30 L30 50 L10 30 Z" fill="#E9D3A8" />
          <path d="M30 10 L50 30 L30 50 L10 30 Z" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="1.5 3" opacity=".95" />
          <path d="M18 30 L30 18 L42 30" fill="none" stroke="#FFFFFF" strokeOpacity=".6" strokeWidth="2" />
        </g>
      );
    case "jalebi":
      return (
        <g>
          <path d="M30 30 m-4 0 a4 4 0 1 1 8 0 a9 9 0 1 1 -17 1 a14 14 0 1 1 27 -2 a19 19 0 1 1 -36 4" fill="none" stroke="#E88A12" strokeWidth="6" strokeLinecap="round" />
          <path d="M30 30 m-4 0 a4 4 0 1 1 8 0 a9 9 0 1 1 -17 1 a14 14 0 1 1 27 -2 a19 19 0 1 1 -36 4" fill="none" stroke="#FFC24A" strokeWidth="2.4" strokeLinecap="round" />
        </g>
      );
    case "gulab-jamun":
      return (
        <g>
          <ellipse cx="30" cy="34" rx="22" ry="20" fill="#7A2E12" />
          <ellipse cx="30" cy="32" rx="20" ry="18" fill="#9A3F18" />
          <ellipse cx="22" cy="24" rx="7" ry="4" fill="#E9A06A" opacity=".55" />
          <path d="M14 46 Q30 54 46 46" fill="none" stroke="#FFB23F" strokeOpacity=".5" strokeWidth="2" />
        </g>
      );
    case "barfi":
      return (
        <g>
          <rect x="8" y="12" width="44" height="36" rx="4" fill="#FFF1C9" stroke="#E8CF8E" strokeWidth="2" />
          <rect x="8" y="12" width="44" height="12" rx="4" fill="#9ED36A" />
          <circle cx="22" cy="34" r="2" fill="#7BB54A" />
          <circle cx="36" cy="38" r="2" fill="#7BB54A" />
          <path d="M12 16 h36" stroke="#E6E6EE" strokeWidth="2" strokeDasharray="2 3" />
        </g>
      );
    default:
      // motichoor laddoo
      return (
        <g>
          <circle cx="30" cy="32" r="23" fill="#F28A1A" />
          {Array.from({ length: 34 }, (_, k) => {
            const a = k * 2.399;
            const rr = 4 + (k % 9) * 2.1;
            return <circle key={k} cx={30 + Math.cos(a) * rr} cy={32 + Math.sin(a) * rr} r="2.4" fill={k % 3 ? "#FFB23F" : "#E0700E"} />;
          })}
          <ellipse cx="22" cy="22" rx="6" ry="4" fill="#FFE2A8" opacity=".55" />
          <path d="M26 12 l3 -3 l3 3" fill="none" stroke="#2F8F4E" strokeWidth="2" />
        </g>
      );
  }
}
