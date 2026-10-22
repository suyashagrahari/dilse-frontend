"use client";

// ─── A pink lotus drawn in SVG whose petals unfold ───────────────────────────
// Three rings of petals (back, middle, front) around a gold seed pod. Closed,
// every petal leans in and narrows into a bud; `open` lets each one rotate out
// to its own angle with a stagger. Transform only (each petal is a <g> with
// transform-box: fill-box, pivoting on its base), so it stays on the compositor.

import { useId } from "react";

const PETAL = "M0 0 C -30 -26 -32 -96 0 -150 C 32 -96 30 -26 0 0 Z";
const VEIN = "M0 -8 C -2 -50 -2 -100 0 -138";

interface Ring {
  angles: number[];
  scale: number;
  grad: "a" | "b" | "c";
  /** Base delay of the ring (ms). */
  delay: number;
  y: number;
}

const RINGS: Ring[] = [
  { angles: [-78, -54, -30, -10, 10, 30, 54, 78], scale: 0.98, grad: "a", delay: 0, y: 0 },
  { angles: [-62, -36, -12, 12, 36, 62], scale: 0.86, grad: "b", delay: 160, y: 6 },
  { angles: [-84, -46, -18, 18, 46, 84], scale: 0.72, grad: "c", delay: 320, y: 16 },
];

export default function LotusBloom({ open, className, label }: { open: boolean; className?: string; label?: string }) {
  const uid = useId().replace(/:/g, "");
  const ring = (r: Ring, ri: number) => (
    <g key={ri} transform={`translate(200 ${206 + r.y}) scale(${r.scale})`}>
      {r.angles.map((a, i) => {
        const order = Math.abs(a) / 90; // the outer petals open last
        return (
          <g key={i} className="lw-petal" style={{ ["--a" as string]: `${a}deg`, ["--d" as string]: `${r.delay + Math.round(order * 360)}ms` }}>
            <path d={PETAL} fill={`url(#${uid}${r.grad})`} stroke="#C9A24A" strokeWidth="1.4" strokeLinejoin="round" />
            <path d={VEIN} fill="none" stroke="#D99AAE" strokeWidth="1" opacity=".7" />
          </g>
        );
      })}
    </g>
  );
  return (
    <svg className={`lw-bloom${open ? " is-open" : ""}${className ? ` ${className}` : ""}`} viewBox="0 0 400 250" role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <defs>
        <linearGradient id={`${uid}a`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#FFF6F2" />
          <stop offset=".55" stopColor="#F6C3D1" />
          <stop offset="1" stopColor="#E0779A" />
        </linearGradient>
        <linearGradient id={`${uid}b`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#FFF9F6" />
          <stop offset=".5" stopColor="#F9D3DD" />
          <stop offset="1" stopColor="#EA8CAA" />
        </linearGradient>
        <linearGradient id={`${uid}c`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset=".6" stopColor="#FBE1E8" />
          <stop offset="1" stopColor="#F0A2BA" />
        </linearGradient>
        <radialGradient id={`${uid}g`} cx=".5" cy=".4" r=".6">
          <stop offset="0" stopColor="#FFF0B8" />
          <stop offset=".7" stopColor="#E8C25E" />
          <stop offset="1" stopColor="#B98A2C" />
        </radialGradient>
        <radialGradient id={`${uid}h`} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#FFF4D2" stopOpacity=".95" />
          <stop offset="1" stopColor="#FFF4D2" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse className="lw-bloom-halo" cx="200" cy="150" rx="190" ry="120" fill={`url(#${uid}h)`} />
      {ring(RINGS[0], 0)}
      {ring(RINGS[1], 1)}
      <g className="lw-bloom-pod" transform="translate(200 196)">
        <ellipse rx="26" ry="11" fill={`url(#${uid}g)`} stroke="#A57A22" strokeWidth="1.2" />
        {[-14, -5, 5, 14, -9, 0, 9].map((x, i) => (
          <circle key={i} cx={x} cy={i < 4 ? -2 : 4} r="2.1" fill="#A57A22" opacity=".75" />
        ))}
      </g>
      {ring(RINGS[2], 2)}
    </svg>
  );
}
