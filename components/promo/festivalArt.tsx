// Small inline SVG pieces for the two festival drops — Diwali's diya, sky
// lantern, rangoli and firework burst; Navratri's ornate dandiya sticks,
// mirror-work disc and dhol; the marigold both share — for the strips, cards,
// teasers, hero and offer pages. Inline so they paint with the HTML (no
// request, no pop-in); the GIFs load only after idle (see FestivalCritters).

import { useId, type ReactNode } from "react";

type P = { size?: number; className?: string };

/** A clay diya with a flickering flame (the flame flickers via the .fv-flame class if the host CSS animates it). */
export function Diya({ size = 22, className }: P) {
  // Unique gradient ids: many diyas share a page, and a hidden first copy would blank the rest.
  const u = useId().replace(/:/g, "");
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} aria-hidden>
      <defs>
        <radialGradient id={`${u}f`} cx="50%" cy="70%" r="60%">
          <stop offset="0" stopColor="#fff6c8" />
          <stop offset=".45" stopColor="#ffd36b" />
          <stop offset="1" stopColor="#f07c0a" />
        </radialGradient>
        <linearGradient id={`${u}b`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#e2722b" />
          <stop offset="1" stopColor="#9c3a12" />
        </linearGradient>
      </defs>
      <g className="fv-flame" style={{ transformOrigin: "16px 18px" }}>
        <path d="M16 4c3 4.2 4.4 7.2 4.4 9.4A4.4 4.4 0 0 1 16 17.8a4.4 4.4 0 0 1-4.4-4.4C11.6 11.2 13 8.2 16 4z" fill={`url(#${u}f)`} />
        <path d="M16 9.5c1.3 1.9 1.9 3.2 1.9 4.2a1.9 1.9 0 0 1-3.8 0c0-1 .6-2.3 1.9-4.2z" fill="#fffbe8" />
      </g>
      <path d="M3 18.5h26c-1.2 5.6-6.4 9-13 9s-11.8-3.4-13-9z" fill={`url(#${u}b)`} />
      <path d="M3 18.5h26" stroke="#ffcf7a" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="9.5" cy="22.4" r="1" fill="#ffd36b" />
      <circle cx="16" cy="23.6" r="1" fill="#ffd36b" />
      <circle cx="22.5" cy="22.4" r="1" fill="#ffd36b" />
    </svg>
  );
}

/** A paper sky lantern (kandil) with its warm glow. */
export function Lantern({ size = 22, className }: P) {
  const u = useId().replace(/:/g, "");
  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 30 39" className={className} aria-hidden>
      <defs>
        <linearGradient id={`${u}l`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#ffe3a3" />
          <stop offset=".55" stopColor="#ffb020" />
          <stop offset="1" stopColor="#f0620a" />
        </linearGradient>
      </defs>
      <path d="M7 3h16l4 25c-3.4 3-8 4-12 4s-8.6-1-12-4L7 3z" fill={`url(#${u}l)`} />
      <path d="M15 3v29M10.5 3 9 31M19.5 3 21 31" stroke="#d2560a" strokeWidth=".8" opacity=".55" />
      <ellipse cx="15" cy="28.5" rx="5" ry="2.2" fill="#fff6c8" opacity=".85" />
      <path d="M7 3h16" stroke="#9c3a12" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Two crossed dandiya sticks, lacquered like the real ones: a peacock-blue and
 * a rani-pink stick with gold bands, a diamond motif and a tassel. `.ft-stick-l`
 * / `.ft-stick-r` let the host CSS click them together.
 */
export function Dandiya({ size = 22, className }: P) {
  const u = useId().replace(/:/g, "");
  const stick = (side: "l" | "r", rot: number, a: string, b: string) => (
    <g className={`ft-stick-${side}`} style={{ transformOrigin: "16px 16px" }}>
      <g transform={`rotate(${rot} 16 16)`}>
        <rect x="14.3" y="1.5" width="3.4" height="28.5" rx="1.7" fill={`url(#${u}${side})`} />
        <rect x="14.3" y="5.6" width="3.4" height="1.6" fill="#f7c64a" />
        <rect x="14.3" y="24.2" width="3.4" height="1.6" fill="#f7c64a" />
        <path d="M16 11.2l1.5 2.4-1.5 2.4-1.5-2.4z" fill="#f7c64a" />
        <path d="M16 17.2l1.2 1.9-1.2 1.9-1.2-1.9z" fill={b} />
        <rect x="14.3" y="1.5" width="3.4" height="1.6" rx=".8" fill="#f7c64a" />
        <path d="M16 30v1.4" stroke="#f7c64a" strokeWidth=".8" />
        <path d="M14.9 31.2h2.2l.6 2.2h-3.4z" fill={a === "#1f5fd1" ? "#ff3d9a" : "#12b5a6"} />
      </g>
      <defs>
        <linearGradient id={`${u}${side}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={b} />
          <stop offset=".45" stopColor={a} />
          <stop offset="1" stopColor={b} />
        </linearGradient>
      </defs>
    </g>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 32 34" className={className} aria-hidden style={{ overflow: "visible" }}>
      {stick("l", -34, "#1f5fd1", "#123a8a")}
      {stick("r", 34, "#ff3d9a", "#b3126a")}
    </svg>
  );
}

/**
 * A shisha (mirror-work) disc: a silver mirror stitched into a ring of thread
 * petals, the way it sits on a chaniya choli. `.ft-glint` is the shine the host
 * CSS can sweep.
 */
export function Mirror({ size = 22, className, thread = "#ffb000" }: P & { thread?: string }) {
  const u = useId().replace(/:/g, "");
  const petals = Array.from({ length: 10 }, (_, i) => i * 36);
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} aria-hidden>
      <defs>
        <radialGradient id={`${u}m`} cx="38%" cy="34%" r="70%">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".45" stopColor="#dfe6ef" />
          <stop offset="1" stopColor="#8f9cad" />
        </radialGradient>
      </defs>
      {petals.map((a) => (
        <ellipse key={a} cx="16" cy="4.2" rx="2.3" ry="3.4" fill={thread} transform={`rotate(${a} 16 16)`} />
      ))}
      <circle cx="16" cy="16" r="9.6" fill="#7a0f12" />
      <circle cx="16" cy="16" r="9.6" fill="none" stroke="#f7c64a" strokeWidth="1.1" strokeDasharray="1.4 1.2" />
      <circle cx="16" cy="16" r="7" fill={`url(#${u}m)`} />
      <path className="ft-glint" d="M11.6 13.4a5.4 5.4 0 0 1 4-3.6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity=".95" />
    </svg>
  );
}

/** A dhol: the barrel drum of every garba night, ropes laced across a red shell. */
export function Dhol({ size = 34, className }: P) {
  const u = useId().replace(/:/g, "");
  return (
    <svg width={size} height={size * 0.72} viewBox="0 0 50 36" className={className} aria-hidden>
      <defs>
        <linearGradient id={`${u}d`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#e2343c" />
          <stop offset=".55" stopColor="#a8121b" />
          <stop offset="1" stopColor="#5a070c" />
        </linearGradient>
      </defs>
      <path d="M8 6h34c3 4 3 20 0 24H8C5 26 5 10 8 6z" fill={`url(#${u}d)`} />
      <path d="M10 6l6 24M18 6l6 24M26 6l6 24M34 6l6 24M16 6l-6 24M24 6l-6 24M32 6l-6 24M40 6l-6 24" stroke="#ffd36b" strokeWidth=".8" opacity=".8" />
      <ellipse cx="8" cy="18" rx="3.6" ry="12" fill="#f3d9b0" stroke="#d4a537" strokeWidth="1.4" />
      <ellipse cx="42" cy="18" rx="3.6" ry="12" fill="#f3d9b0" stroke="#d4a537" strokeWidth="1.4" />
      <path d="M8 6h34M8 30h34" stroke="#d4a537" strokeWidth="1.8" />
    </svg>
  );
}

/** A marigold head (genda phool). */
export function Marigold({ size = 18, className }: P) {
  const petals = Array.from({ length: 12 }, (_, i) => i * 30);
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden>
      {petals.map((a) => (
        <ellipse key={a} cx="12" cy="5.6" rx="2.6" ry="4.4" fill={a % 60 ? "#ffb020" : "#f07c0a"} transform={`rotate(${a} 12 12)`} />
      ))}
      <circle cx="12" cy="12" r="4.2" fill="#ffcf3a" />
      <circle cx="12" cy="12" r="2" fill="#e8820c" />
    </svg>
  );
}

/** A small rangoli: an eight-petal lotus ring with dots. */
export function Rangoli({ size = 40, className }: P) {
  const ring = (n: number, _r: number, el: (a: number, i: number) => ReactNode) =>
    Array.from({ length: n }, (_, i) => el((360 / n) * i, i));
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden>
      {ring(8, 0, (a, i) => (
        <path key={`p${i}`} d="M32 6c5 7 5 14 0 20-5-6-5-13 0-20z" fill={i % 2 ? "#ff5d8f" : "#ffb020"} transform={`rotate(${a} 32 32)`} />
      ))}
      {ring(8, 0, (a, i) => (
        <path key={`q${i}`} d="M32 14c3 4 3 8 0 12-3-4-3-8 0-12z" fill={i % 2 ? "#2fd3c0" : "#fff3c4"} transform={`rotate(${a + 22.5} 32 32)`} />
      ))}
      <circle cx="32" cy="32" r="6.5" fill="#ffd36b" />
      <circle cx="32" cy="32" r="3" fill="#f07c0a" />
      {ring(16, 0, (a, i) => (
        <circle key={`d${i}`} cx="32" cy="2.6" r="1.5" fill={i % 2 ? "#ffd36b" : "#ff5d8f"} transform={`rotate(${a} 32 32)`} />
      ))}
    </svg>
  );
}

/** A firework burst (static star of rays + dots); animate scale/opacity in CSS. */
export function Burst({ size = 40, className, color = "#ffd36b" }: P & { color?: string }) {
  const rays = Array.from({ length: 14 }, (_, i) => (360 / 14) * i);
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" className={className} aria-hidden>
      {rays.map((a, i) => (
        <g key={a} transform={`rotate(${a} 30 30)`}>
          <path d="M30 22V6" stroke={color} strokeWidth={i % 2 ? 1.4 : 2} strokeLinecap="round" opacity={i % 2 ? 0.7 : 1} />
          <circle cx="30" cy={i % 2 ? 4.5 : 3} r={i % 2 ? 1.1 : 1.6} fill={i % 3 ? color : "#fff6c8"} />
        </g>
      ))}
    </svg>
  );
}

/**
 * A bandhanwar: the Navratri door toran — an embroidered band with a row of
 * triangular flaps, each set with a mirror and a tassel bead, in kumkum,
 * peacock and rani pink. Drawn `n` flaps wide; pair with
 * preserveAspectRatio "xMidYMin slice" to crop instead of stretching.
 */
export function Bandhanwar({ n = 12, className }: { n?: number; className?: string }) {
  const w = n * 24;
  const fills = ["#c8141f", "#0f8f84", "#e5197d", "#f29a00"];
  return (
    <svg viewBox={`0 0 ${w} 46`} className={className} preserveAspectRatio="xMidYMin slice" aria-hidden>
      <rect x="0" y="0" width={w} height="9" fill="#7a0f12" />
      <path d={`M0 9H${w}`} stroke="#d4a537" strokeWidth="1.6" />
      <path d={`M0 2.6H${w}`} stroke="#ffb000" strokeWidth="1" strokeDasharray="2 2.4" />
      {Array.from({ length: n * 2 }, (_, i) => (
        <circle key={`d${i}`} cx={6 + i * 12} cy="5.6" r="1.5" fill={i % 2 ? "#fff4e2" : "#12b5a6"} />
      ))}
      {Array.from({ length: n }, (_, i) => {
        const x = i * 24;
        const f = fills[i % fills.length];
        return (
          <g key={i}>
            <path d={`M${x + 1.5} 9H${x + 22.5}L${x + 12} 33z`} fill={f} stroke="#d4a537" strokeWidth="1" />
            <path d={`M${x + 5} 11.5H${x + 19}`} stroke="#ffe6a6" strokeWidth=".8" strokeDasharray="1.2 1.4" />
            <circle cx={x + 12} cy="18" r="3.6" fill="#e6ecf3" stroke="#d4a537" strokeWidth=".9" />
            <circle cx={x + 11} cy="17" r="1.1" fill="#fff" />
            <path d={`M${x + 12} 33v5`} stroke="#d4a537" strokeWidth=".8" />
            <circle cx={x + 12} cy="40" r="2.4" fill={i % 2 ? "#ffb000" : "#ff3d9a"} />
          </g>
        );
      })}
    </svg>
  );
}
