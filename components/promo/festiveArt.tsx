// Small inline SVG festive pieces — a diya, a sky lantern, crossed dandiya
// sticks, a marigold, a rangoli and a firework burst — for the festive strip,
// cards, teaser and offer page. Inline so they paint with the HTML (no request,
// no pop-in); the GIFs load only after idle (see FestiveCritters).

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

/** Two crossed dandiya sticks with ribbon bands and bells. */
export function Dandiya({ size = 22, className }: P) {
  const stick = (rot: number, c: string) => (
    <g transform={`rotate(${rot} 16 16)`}>
      <rect x="14.6" y="2" width="2.8" height="28" rx="1.4" fill={c} />
      <rect x="14.6" y="7" width="2.8" height="2.2" fill="#ffd36b" />
      <rect x="14.6" y="22.8" width="2.8" height="2.2" fill="#ffd36b" />
      <rect x="14.6" y="14.6" width="2.8" height="2.8" fill="#2fd3c0" />
      <circle cx="16" cy="2.4" r="1.6" fill="#ffd36b" />
    </g>
  );
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" className={className} aria-hidden>
      {stick(-32, "#ff5d8f")}
      {stick(32, "#ffb020")}
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
