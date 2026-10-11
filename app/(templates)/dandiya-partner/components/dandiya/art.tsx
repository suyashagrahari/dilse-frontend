"use client";

// The Dandiya night's hand-drawn props, all inline SVG (no requests, crisp at
// any size): the clay diya, a dandiya stick, the garbo (the perforated pot lamp
// the garba circles around), the marigold toran, the twirling ghagra and the
// dhol. Every animation is a CSS class (DD_ART_CSS) on transform/opacity only,
// and reduced motion stills them.

import { useId, type CSSProperties } from "react";
import { DD } from "./ui";

// ─── Diya ────────────────────────────────────────────────────────────────────

/** A clay diya. `hue` paints the dots on its belly; `lit` adds the flame and glow. */
export function Diya({ lit, hue = DD.kumkum, size = 64, style }: { lit: boolean; hue?: string; size?: number | string; style?: CSSProperties }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ display: "block", overflow: "visible", ...style }} aria-hidden>
      <defs>
        <radialGradient id={`dg${id}`} cx="50%" cy="60%" r="55%">
          <stop offset="0" stopColor="#FFD27A" stopOpacity=".75" />
          <stop offset="1" stopColor="#FFB627" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`db${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E0874A" />
          <stop offset="1" stopColor="#8A3B17" />
        </linearGradient>
        <radialGradient id={`df${id}`} cx="50%" cy="72%" r="60%">
          <stop offset="0" stopColor="#FFFDF0" />
          <stop offset=".45" stopColor="#FFE07A" />
          <stop offset="1" stopColor="#FF8A1F" />
        </radialGradient>
      </defs>
      {lit && <circle className="dd-glow" cx="50" cy="52" r="46" fill={`url(#dg${id})`} />}
      {/* the bowl, with a pinched spout on the right */}
      <path d="M12 62 Q14 86 48 88 Q80 88 86 66 L95 58 Q88 60 82 60 Q50 66 12 62 Z" fill={`url(#db${id})`} />
      <path d="M12 62 Q50 70 82 60 L95 58" fill="none" stroke="#F6D27A" strokeWidth="2.6" strokeLinecap="round" />
      {[24, 36, 48, 60, 72].map((x, i) => (
        <circle key={x} cx={x} cy={i % 2 ? 78 : 74} r="2.8" fill={hue} stroke="#FFF4DE" strokeWidth="1" />
      ))}
      {/* the oil and the wick */}
      <ellipse cx="50" cy="63" rx="34" ry="4" fill="#5A260C" opacity=".55" />
      <path d="M80 60 Q84 54 86 52" stroke="#3B1B0A" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      {lit && (
        <g className="dd-flame" style={{ transformOrigin: "86px 52px" }}>
          <path d="M86 22 Q76 38 79 47 Q82 55 86 55 Q91 55 93 47 Q95 38 86 22 Z" fill={`url(#df${id})`} />
          <path d="M86 36 Q82 44 84 49 Q86 52 88 49 Q90 44 86 36 Z" fill="#FFFFFF" opacity=".85" />
        </g>
      )}
    </svg>
  );
}

// ─── Dandiya stick ───────────────────────────────────────────────────────────

/** One dandiya stick, drawn horizontal (rotate it with CSS). Bands of gold, kumkum, peacock; a tassel at one end. */
export function Stick({ length = 160, a = DD.kumkum, b = DD.peacock, style, className }: { length?: number | string; a?: string; b?: string; style?: CSSProperties; className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 200 40" width={length} style={{ display: "block", overflow: "visible", ...style }} className={className} aria-hidden>
      <defs>
        <linearGradient id={`s${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity=".55" />
          <stop offset=".45" stopColor="#FFFFFF" stopOpacity="0" />
          <stop offset="1" stopColor="#000000" stopOpacity=".25" />
        </linearGradient>
      </defs>
      <rect x="8" y="12" width="184" height="16" rx="8" fill={a} />
      {[30, 70, 110, 150].map((x, i) => (
        <rect key={x} x={x} y="12" width="20" height="16" fill={i % 2 ? DD.gold : b} />
      ))}
      {[22, 62, 102, 142, 182].map((x) => (
        <rect key={x} x={x} y="12" width="3" height="16" fill={DD.gold} />
      ))}
      <rect x="8" y="12" width="184" height="16" rx="8" fill={`url(#s${id})`} />
      <circle cx="190" cy="20" r="6" fill={DD.gold} stroke="#8A5A10" strokeWidth="1.2" />
      {/* the tassel */}
      <path d="M8 20 Q0 24 -2 34" stroke={DD.gold} strokeWidth="2" fill="none" />
      <path d="M-6 32 L2 32 L4 44 L-8 44 Z" fill={a} />
      <path d="M-6 36 L2 36" stroke={DD.gold} strokeWidth="2" />
    </svg>
  );
}

/** Two sticks crossed in an X (the gate's seal, the pill's icon). `clash` swings them together. */
export function CrossedSticks({ size = 120, clash = 0 }: { size?: number | string; clash?: number }) {
  // clash 0 → a relaxed X, 1 → the sticks meet harder (a clash frame)
  const open = 34 - clash * 10;
  return (
    <span aria-hidden style={{ position: "relative", display: "block", width: size, height: size }}>
      <span style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", transform: `rotate(${-open}deg)`, transition: "transform .14s cubic-bezier(.3,1.6,.5,1)" }}>
        <Stick length="96%" a={DD.kumkum} b={DD.peacock} />
      </span>
      <span style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", transform: `rotate(${180 + open}deg)`, transition: "transform .14s cubic-bezier(.3,1.6,.5,1)" }}>
        <Stick length="96%" a={DD.rani} b={DD.emerald} />
      </span>
    </span>
  );
}

// ─── Garbo (the pot lamp at the heart of the circle) ─────────────────────────

export function Garbo({ size = 120, glow = 1 }: { size?: number | string; glow?: number }) {
  const id = useId().replace(/:/g, "");
  const holes: [number, number][] = [];
  for (let r = 0; r < 4; r++) {
    const y = 66 + r * 11;
    const n = [7, 9, 9, 7][r];
    const w = [44, 54, 54, 42][r];
    for (let i = 0; i < n; i++) holes.push([60 - w + (i * (2 * w)) / (n - 1), y]);
  }
  return (
    <svg viewBox="0 0 120 140" width={size} style={{ display: "block", overflow: "visible", aspectRatio: "120 / 140", height: "auto" }} aria-hidden>
      <defs>
        <radialGradient id={`gp${id}`} cx="45%" cy="40%" r="70%">
          <stop offset="0" stopColor="#E9914F" />
          <stop offset=".7" stopColor="#B2501F" />
          <stop offset="1" stopColor="#6E2A0C" />
        </radialGradient>
        <radialGradient id={`gh${id}`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#FFD27A" stopOpacity=".8" />
          <stop offset="1" stopColor="#FFB627" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle className="dd-glow" cx="60" cy="82" r="70" fill={`url(#gh${id})`} opacity={0.35 + 0.65 * glow} />
      <ellipse cx="60" cy="88" rx="56" ry="46" fill={`url(#gp${id})`} />
      <path d="M38 46 Q60 38 82 46 L80 52 Q60 46 40 52 Z" fill="#8A3B17" />
      <ellipse cx="60" cy="46" rx="22" ry="5" fill="#5A260C" />
      {/* the marigold garland round its neck */}
      {Array.from({ length: 9 }, (_, i) => (
        <circle key={i} cx={36 + i * 6} cy={55 + Math.sin((i / 8) * Math.PI) * 5} r="4" fill={i % 2 ? DD.marigold : DD.saffron} stroke="#C46A00" strokeWidth=".8" />
      ))}
      {holes.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 2.6 : 2} fill="#FFE9A8" opacity={0.45 + 0.55 * glow} className={i % 4 === 0 ? "dd-twinkle" : undefined} style={{ animationDelay: `${(i % 7) * 0.31}s` }} />
      ))}
      {/* the little flame on top */}
      <g className="dd-flame" style={{ transformOrigin: "60px 44px" }}>
        <path d="M60 14 Q52 28 54 36 Q56 44 60 44 Q65 44 66 36 Q68 28 60 14 Z" fill="#FFB627" />
        <path d="M60 26 Q57 33 58 38 Q60 41 62 38 Q63 33 60 26 Z" fill="#FFFDF0" />
      </g>
    </svg>
  );
}

// ─── Marigold toran ──────────────────────────────────────────────────────────

/** A marigold garland with mango leaves, swagged across the full width. */
export function Toran({ height = 46, style, className }: { height?: number; style?: CSSProperties; className?: string }) {
  const id = useId().replace(/:/g, "");
  // one 120×60 unit: a swag of marigolds dipping to a hanging leaf + bell
  const beads = Array.from({ length: 9 }, (_, i) => {
    const t = i / 8;
    const x = t * 120;
    const y = 6 + 26 * 4 * t * (1 - t);
    return [x, y] as const;
  });
  return (
    <svg className={className} width="100%" height={height} style={{ display: "block", ...style }} aria-hidden preserveAspectRatio="xMidYMin slice">
      <defs>
        <radialGradient id={`m${id}`} cx="40%" cy="35%" r="65%">
          <stop offset="0" stopColor="#FFE07A" />
          <stop offset=".6" stopColor="#FFB627" />
          <stop offset="1" stopColor="#E07B00" />
        </radialGradient>
        <radialGradient id={`o${id}`} cx="40%" cy="35%" r="65%">
          <stop offset="0" stopColor="#FFC27A" />
          <stop offset=".6" stopColor="#FF8A1F" />
          <stop offset="1" stopColor="#C4560A" />
        </radialGradient>
        <pattern id={`p${id}`} width="120" height={height} patternUnits="userSpaceOnUse" patternTransform={`scale(${height / 60})`}>
          <path d="M0 6 Q60 58 120 6" stroke="#7A3B0A" strokeWidth="1.4" fill="none" />
          {/* the hanging mango leaf and a tiny bell at the swag's dip */}
          <path d="M60 32 Q52 46 60 58 Q68 46 60 32 Z" fill="#2E8B57" />
          <path d="M60 34 L60 56" stroke="#7FD18F" strokeWidth="1" />
          {beads.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i % 2 ? 6.2 : 7} fill={i % 2 ? `url(#o${id})` : `url(#m${id})`} />
          ))}
          {beads.map(([x, y], i) => (
            <circle key={`c${i}`} cx={x} cy={y} r="1.8" fill="#A85500" opacity=".55" />
          ))}
          <circle cx="0" cy="6" r="5" fill={DD.gold} />
          <circle cx="120" cy="6" r="5" fill={DD.gold} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#p${id})`} />
    </svg>
  );
}

// ─── The twirling ghagra (chaniya / kediyu flare) ───────────────────────────

/** A flared skirt with pleats, a zari band and a mirror-work hem — the colour they twirl in. */
export function Ghagra({ base, deep, light, size = 220, spin = 0 }: { base: string; deep: string; light: string; size?: number | string; spin?: number }) {
  const id = useId().replace(/:/g, "");
  const pleats = 14;
  const hemY = 168;
  const pts = Array.from({ length: pleats + 1 }, (_, i) => {
    const t = i / pleats;
    const x = 12 + t * 196;
    const y = hemY + Math.sin(t * Math.PI * pleats + spin) * 5;
    return [x, y] as const;
  });
  return (
    <svg viewBox="0 0 220 200" width={size} style={{ display: "block", overflow: "visible", aspectRatio: "220 / 200", height: "auto" }} aria-hidden>
      <defs>
        <linearGradient id={`k${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={light} />
          <stop offset=".5" stopColor={base} />
          <stop offset="1" stopColor={deep} />
        </linearGradient>
      </defs>
      {/* choli / kediyu top */}
      <path d="M86 18 Q110 8 134 18 L140 52 Q110 60 80 52 Z" fill={deep} />
      <path d="M80 50 Q110 60 140 50" stroke={DD.gold} strokeWidth="4" fill="none" />
      {[92, 104, 116, 128].map((x) => (
        <circle key={x} cx={x} cy="34" r="3" fill="#EEF4FF" stroke={DD.gold} strokeWidth="1.4" />
      ))}
      {/* the flare */}
      <path d={`M82 54 Q110 62 138 54 L208 ${hemY} ${pts.map(([x, y]) => `L${(220 - x).toFixed(1)} ${y.toFixed(1)}`).join(" ")} L12 ${hemY} Z`} fill={`url(#k${id})`} />
      {pts.slice(1, -1).map(([x], i) => (
        <path key={i} d={`M110 58 L${x.toFixed(1)} ${hemY - 4}`} stroke={i % 2 ? deep : light} strokeOpacity=".45" strokeWidth="3" />
      ))}
      {/* zari band + mirror hem */}
      <path d={`M14 ${hemY - 14} Q110 ${hemY - 2} 206 ${hemY - 14}`} stroke={DD.gold} strokeWidth="6" fill="none" />
      {Array.from({ length: 11 }, (_, i) => {
        const t = (i + 0.5) / 11;
        const x = 18 + t * 184;
        const y = hemY - 14 + Math.sin(t * Math.PI) * 6;
        return <circle key={i} className={i % 3 === 0 ? "dd-twinkle" : undefined} style={{ animationDelay: `${i * 0.2}s` }} cx={x} cy={y} r="4" fill="#FFFFFF" stroke="#B8862E" strokeWidth="1.6" />;
      })}
      <path d={`M12 ${hemY} ${pts.map(([x, y]) => `L${x.toFixed(1)} ${y.toFixed(1)}`).join(" ")}`} stroke={DD.gold} strokeWidth="3" fill="none" />
    </svg>
  );
}

// ─── The dhol ────────────────────────────────────────────────────────────────

export function Dhol({ size = 160, hit = false }: { size?: number | string; hit?: boolean }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 200 140" width={size} style={{ display: "block", overflow: "visible", aspectRatio: "200 / 140", height: "auto" }} aria-hidden>
      <defs>
        <linearGradient id={`b${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#E25A3A" />
          <stop offset=".5" stopColor={DD.kumkum} />
          <stop offset="1" stopColor={DD.kumkumDeep} />
        </linearGradient>
      </defs>
      <path d="M30 30 Q100 10 170 30 L170 110 Q100 130 30 110 Z" fill={`url(#b${id})`} />
      {/* the rope zig-zag */}
      <path d={`M30 34 ${Array.from({ length: 10 }, (_, i) => `L${44 + i * 14} ${i % 2 ? 36 : 104}`).join(" ")} L170 34`} stroke={DD.gold} strokeWidth="3" fill="none" strokeLinejoin="round" />
      <ellipse cx="30" cy="70" rx="14" ry="40" fill="#F2DFC0" stroke={DD.gold} strokeWidth="4" style={{ transformOrigin: "30px 70px", transform: hit ? "scaleX(.82)" : "none", transition: "transform .08s" }} />
      <ellipse cx="170" cy="70" rx="14" ry="40" fill="#E9D2AE" stroke={DD.gold} strokeWidth="4" />
      {[60, 100, 140].map((x) => (
        <circle key={x} cx={x} cy="70" r="5" fill="#EEF4FF" stroke={DD.gold} strokeWidth="1.6" />
      ))}
    </svg>
  );
}

// ─── Mirror sparkle (a 4-point star) ─────────────────────────────────────────

export function Sparkle({ size = 14, color = "#FFF7E8", style, className }: { size?: number; color?: string; style?: CSSProperties; className?: string }) {
  return (
    <svg viewBox="0 0 20 20" width={size} height={size} className={className} style={{ display: "block", ...style }} aria-hidden>
      <path d="M10 0 Q11 9 20 10 Q11 11 10 20 Q9 11 0 10 Q9 9 10 0 Z" fill={color} />
    </svg>
  );
}

export const DD_ART_CSS = `
.dd-flame { animation: dd-flicker 1.1s ease-in-out infinite alternate; }
@keyframes dd-flicker { 0% { transform: scale(1, 1) rotate(-2deg) } 40% { transform: scale(.94, 1.06) rotate(2deg) } 100% { transform: scale(1.04, .95) rotate(-1deg) } }
.dd-glow { animation: dd-breathe 2.6s ease-in-out infinite alternate; transform-box: fill-box; transform-origin: center; }
@keyframes dd-breathe { from { opacity: .75; transform: scale(.94) } to { opacity: 1; transform: scale(1.04) } }
.dd-twinkle { animation: dd-twinkle 1.8s ease-in-out infinite alternate; }
@keyframes dd-twinkle { from { opacity: .35 } to { opacity: 1 } }
@media (prefers-reduced-motion: reduce) { .dd-flame, .dd-glow, .dd-twinkle { animation: none !important; } }
`;
