"use client";

// The Will You Be Mine artwork, all drawn here (original):
//
//   • VelvetBox — the ring box in the palette's velvet. Closed (a bow on the
//     clasp), or open: the lid flips up to its satin lining and, when `ring`,
//     a ring with a sparkling stone rises from the cushion.
//   • FillHeart — the heart that fills with the palette's colour as she holds it.
//   • Fireworks — CSS bursts behind the YES (transform/opacity only).
//   • Sparkle — a four-point twinkle.
//
// Everything animates with CSS transforms only, and stops for reduced motion.

import type { CSSProperties } from "react";

export function VelvetBox({ open, ring = false, size = 200, className, style }: { open: boolean; ring?: boolean; size?: number | string; className?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} className={`wy-box${open ? " is-open" : ""}${ring ? " has-ring" : ""}${className ? ` ${className}` : ""}`} style={{ overflow: "visible", ...style }} aria-hidden>
      <defs>
        <linearGradient id="wyVelvet" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="color-mix(in srgb, var(--wy-velvet, #B8435F) 72%, #FFFFFF)" />
          <stop offset=".35" stopColor="var(--wy-velvet, #B8435F)" />
          <stop offset="1" stopColor="color-mix(in srgb, var(--wy-velvet, #B8435F) 62%, #000000)" />
        </linearGradient>
        <linearGradient id="wySatin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset=".55" stopColor="color-mix(in srgb, var(--wy-blush, #FBDCD6) 55%, #FFFFFF)" />
          <stop offset="1" stopColor="color-mix(in srgb, var(--wy-velvet, #B8435F) 30%, #FFFFFF)" />
        </linearGradient>
        <radialGradient id="wyGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="var(--vw-gold, #E2A98F)" stopOpacity="1" />
          <stop offset=".6" stopColor="var(--vw-gold, #E2A98F)" stopOpacity=".45" />
          <stop offset="1" stopColor="var(--vw-gold, #E2A98F)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="wyBand" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#B8862F" />
          <stop offset=".3" stopColor="#FFE7A8" />
          <stop offset=".6" stopColor="#E9B95A" />
          <stop offset="1" stopColor="#9C6B1E" />
        </linearGradient>
        <linearGradient id="wyGem" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset=".5" stopColor="#DDF2FF" />
          <stop offset="1" stopColor="#A9D8FF" />
        </linearGradient>
      </defs>
      {/* glow behind an open box */}
      <circle className="wy-box-glow" cx="100" cy="100" r="96" fill="url(#wyGlow)" opacity="0" />
      {/* the open lid: its satin lining standing up behind the box */}
      <g className="wy-box-lining">
        <path d="M40 104 L46 40 Q48 32 56 32 L144 32 Q152 32 154 40 L160 104 Z" fill="url(#wyVelvet)" />
        <path d="M50 100 L54 46 Q55 40 61 40 L139 40 Q145 40 146 46 L150 100 Z" fill="url(#wySatin)" />
        <path d="M70 46 Q100 58 130 46" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".7" />
      </g>
      {/* the base */}
      <rect x="30" y="104" width="140" height="76" rx="16" fill="url(#wyVelvet)" />
      <rect x="30" y="104" width="140" height="10" rx="5" fill="#FFFFFF" opacity=".16" />
      <path d="M36 172 Q100 182 164 172" stroke="#000000" strokeOpacity=".18" strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* the cushion + the ring (visible once open) */}
      <g className="wy-box-cushion">
        <ellipse cx="100" cy="110" rx="62" ry="12" fill="color-mix(in srgb, var(--wy-velvet, #B8435F) 55%, #000000)" />
        <ellipse cx="100" cy="108" rx="56" ry="9" fill="url(#wySatin)" opacity=".9" />
        <path d="M74 108 Q100 114 126 108" stroke="color-mix(in srgb, var(--wy-velvet, #B8435F) 60%, #000000)" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
      {ring && (
        <g className="wy-ring">
          <ellipse cx="100" cy="92" rx="22" ry="20" fill="none" stroke="url(#wyBand)" strokeWidth="7" />
          <ellipse cx="100" cy="92" rx="22" ry="20" fill="none" stroke="#FFFFFF" strokeOpacity=".5" strokeWidth="1.5" strokeDasharray="10 40" />
          <path d="M86 70 L92 62 L108 62 L114 70 L100 84 Z" fill="url(#wyGem)" stroke="#7FB6E6" strokeWidth="1.5" strokeLinejoin="round" />
          <path d="M86 70 L114 70 M92 62 L96 70 L100 84 L104 70 L108 62" stroke="#7FB6E6" strokeWidth="1" fill="none" strokeLinejoin="round" />
          <path d="M93 64 L96 64 L94 68 Z" fill="#FFFFFF" />
          <g className="wy-ring-glint">
            <path d="M118 54 L120 60 L126 62 L120 64 L118 70 L116 64 L110 62 L116 60 Z" fill="#FFFFFF" />
          </g>
          <g className="wy-ring-glint b">
            <path d="M80 56 L81.4 60 L85 61.4 L81.4 62.8 L80 66.6 L78.6 62.8 L75 61.4 L78.6 60 Z" fill="#FFFFFF" />
          </g>
        </g>
      )}
      {/* the closed lid */}
      <g className="wy-box-lid">
        <path d="M26 112 L26 84 Q26 70 42 70 L158 70 Q174 70 174 84 L174 112 Z" fill="url(#wyVelvet)" />
        <path d="M32 78 Q100 70 168 78" stroke="#FFFFFF" strokeOpacity=".28" strokeWidth="4" fill="none" strokeLinecap="round" />
        <rect x="26" y="106" width="148" height="7" rx="3.5" fill="#000000" opacity=".16" />
        {/* the bow on the clasp */}
        <g className="wy-box-bow">
          <path d="M100 98 C84 80 66 84 70 98 C74 110 90 104 100 98 Z" fill="var(--vw-gold, #E2A98F)" stroke="color-mix(in srgb, var(--vw-gold, #E2A98F) 60%, #000000)" strokeWidth="2" />
          <path d="M100 98 C116 80 134 84 130 98 C126 110 110 104 100 98 Z" fill="var(--vw-gold, #E2A98F)" stroke="color-mix(in srgb, var(--vw-gold, #E2A98F) 60%, #000000)" strokeWidth="2" />
          <path d="M96 100 L88 120 L96 116 L100 122 L100 100 Z M104 100 L112 120 L104 116 L100 122 Z" fill="var(--vw-gold, #E2A98F)" stroke="color-mix(in srgb, var(--vw-gold, #E2A98F) 60%, #000000)" strokeWidth="1.5" strokeLinejoin="round" />
          <circle cx="100" cy="98" r="7" fill="color-mix(in srgb, var(--vw-gold, #E2A98F) 80%, #FFFFFF)" stroke="color-mix(in srgb, var(--vw-gold, #E2A98F) 60%, #000000)" strokeWidth="2" />
          <path d="M76 92 Q80 88 86 90" stroke="#FFFFFF" strokeOpacity=".7" strokeWidth="2" fill="none" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
}

const HEART = "M50 90 C18 68 2 50 4 30 C6 10 32 4 50 24 C68 4 94 10 96 30 C98 50 82 68 50 90 Z";

/** The heart that fills from the bottom as `p` goes 0 → 1, with a little wave on the surface. */
export function FillHeart({ p, size = "100%" }: { p: number; size?: number | string }) {
  const y = 92 - Math.max(0, Math.min(1, p)) * 96;
  return (
    <svg viewBox="-4 -4 108 100" width={size} height={size} className="wy-fillheart" style={{ overflow: "visible" }} aria-hidden>
      <defs>
        <clipPath id="wyHeartClip">
          <path d={HEART} />
        </clipPath>
        <linearGradient id="wyLiquid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="color-mix(in srgb, var(--vw-accent, #E0637F) 70%, #FFFFFF)" />
          <stop offset="1" stopColor="var(--vw-accent-deep, #B8435F)" />
        </linearGradient>
      </defs>
      <path d={HEART} fill="var(--wy-card, #FFFFFF)" />
      <g clipPath="url(#wyHeartClip)">
        <g style={{ transform: `translateY(${y}px)`, transition: "transform .12s linear" }}>
          <path className="wy-wave" d="M-100 4 Q-87.5 -4 -75 4 T-50 4 T-25 4 T0 4 T25 4 T50 4 T75 4 T100 4 T125 4 T150 4 T175 4 T200 4 L200 120 L-100 120 Z" fill="url(#wyLiquid)" />
        </g>
        
      </g>
      <path d={HEART} fill="none" stroke="var(--vw-accent-deep, #B8435F)" strokeWidth="3.2" strokeLinejoin="round" />
      <path d="M14 30 Q16 18 28 16" fill="none" stroke="#FFFFFF" strokeOpacity=".75" strokeWidth="3.4" strokeLinecap="round" />
    </svg>
  );
}

export function Sparkle({ size = 24, color = "#FFE07A", style }: { size?: number; color?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={style} aria-hidden>
      <path d="M12 0 L14.2 9.8 L24 12 L14.2 14.2 L12 24 L9.8 14.2 L0 12 L9.8 9.8 Z" fill={color} />
    </svg>
  );
}

const FW = [
  { x: 18, y: 22, c: 0, d: 0 },
  { x: 80, y: 16, c: 1, d: 0.5 },
  { x: 50, y: 10, c: 2, d: 1.1 },
  { x: 28, y: 46, c: 3, d: 1.6 },
  { x: 74, y: 42, c: 4, d: 2.1 },
];

/** Looping CSS fireworks for the YES room. `colors` from the palette's confetti. */
export function Fireworks({ colors }: { colors: readonly string[] }) {
  return (
    <div className="wy-fw" aria-hidden>
      {FW.map((f, k) => (
        <span key={k} className="wy-fw-burst" style={{ left: `${f.x}%`, top: `${f.y}%`, animationDelay: `${f.d}s`, ["--c" as string]: colors[f.c % colors.length] }}>
          {Array.from({ length: 12 }, (_, i) => (
            <i key={i} style={{ ["--a" as string]: `${i * 30}deg` }} />
          ))}
        </span>
      ))}
    </div>
  );
}

export const WY_ART_CSS = `
.wy-box-lid, .wy-box-lining, .wy-box-cushion, .wy-ring, .wy-box-glow { transform-box: fill-box; }
.wy-box-lid { transform-origin: 50% 100%; transition: transform .38s cubic-bezier(.5,0,.8,.4); }
.wy-box-lining { transform-origin: 50% 100%; transform: scaleY(0); transition: transform .5s cubic-bezier(.2,.9,.3,1.25) .34s; }
.wy-box-cushion { opacity: 0; transition: opacity .3s ease .3s; }
.wy-ring { transform-origin: 50% 100%; transform: translateY(30px) scale(.4); opacity: 0; transition: transform .8s cubic-bezier(.2,1.4,.4,1) .7s, opacity .4s ease .7s; }
.wy-box.is-open .wy-box-lid { transform: scaleY(0); }
.wy-box.is-open .wy-box-lining { transform: scaleY(1); }
.wy-box.is-open .wy-box-cushion { opacity: 1; }
.wy-box.is-open .wy-ring { transform: none; opacity: 1; }
.wy-box.is-open .wy-box-glow { animation: wy-glow 2.6s ease-in-out 1s infinite; }
@keyframes wy-glow { 0%, 100% { opacity: .12; transform: scale(.9) } 50% { opacity: .3; transform: scale(1.04) } }
.wy-box-glow { transform-origin: 50% 50%; }
.wy-ring-glint { transform-box: fill-box; transform-origin: 50% 50%; animation: wy-glint 1.8s ease-in-out infinite; }
.wy-ring-glint.b { animation-delay: .9s; }
@keyframes wy-glint { 0%, 100% { transform: scale(.3) rotate(0); opacity: .2 } 50% { transform: scale(1.15) rotate(45deg); opacity: 1 } }
@keyframes wy-heart-beat { 0%, 100% { transform: scale(1) } 25% { transform: scale(1.14) } 45% { transform: scale(1.02) } 65% { transform: scale(1.1) } }
.wy-wave { animation: wy-wave 1.6s linear infinite; }
@keyframes wy-wave { from { transform: translateX(0) } to { transform: translateX(50px) } }
.wy-fw { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
.wy-fw-burst { position: absolute; width: 0; height: 0; animation: wy-fw-cycle 2.8s ease-out infinite; opacity: 0; }
.wy-fw-burst i { position: absolute; left: -3px; top: -3px; width: 6px; height: 6px; border-radius: 50%; background: var(--c); box-shadow: 0 0 8px 1px var(--c);
  transform: rotate(var(--a)) translateY(0); animation: wy-fw-spark 2.8s cubic-bezier(.15,.7,.3,1) infinite; animation-delay: inherit; }
@keyframes wy-fw-cycle { 0% { opacity: 0 } 4% { opacity: 1 } 55% { opacity: 1 } 75%, 100% { opacity: 0 } }
@keyframes wy-fw-spark { 0% { transform: rotate(var(--a)) translateY(0) scale(1.4) } 60% { transform: rotate(var(--a)) translateY(-13vmin) scale(.9) } 100% { transform: rotate(var(--a)) translateY(-15vmin) scale(.2) } }
@media (prefers-reduced-motion: reduce) {
  .wy-box-lid, .wy-box-lining, .wy-box-cushion, .wy-ring { transition: none !important; }
  .wy-ring-glint, .wy-wave, .wy-box.is-open .wy-box-glow { animation: none !important; }
  .wy-fw { display: none; }
}
`;
