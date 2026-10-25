// ─── The wedding season's small art, as inline SVG ───────────────────────────
//
// The pieces every wedding surface strings together: a gold jhumka, a marigold
// lari (a hanging strand of genda flowers), a swagged marigold toran with mango
// leaves and little bells, interlocked rings, a rose petal. Inline SVG — no
// request, no pop-in, crisp at any size — and deterministic, so the server
// render and the client agree. The heavier painted art (the couples, the
// peacocks, the floral arch) comes from the hub's CDN files instead.

import { useId, type ReactNode } from "react";
import { WT } from "./weddingTheme";

type P = { size?: number; className?: string };

const r1 = (v: number) => Math.round(v * 10) / 10;

/** A gold jhumka: a domed bell with filigree, a ruby, and a fringe of pearls. Its top is the hook (rotate around 50% 0). */
export function Jhumka({ size = 34, className }: P) {
  // Per-instance ids: a gradient referenced from a copy hidden on phones would otherwise paint nothing.
  const id = useId().replace(/:/g, "");
  const g = `wjg${id}`;
  const pl = `wjp${id}`;
  const h = size * 1.7;
  const pearls = [6, 11, 16, 20, 24, 29, 34];
  return (
    <svg width={size} height={h} viewBox="0 0 40 68" className={className} aria-hidden>
      <defs>
        <linearGradient id={g} x1="0" x2="1">
          <stop offset="0" stopColor="#9c7424" />
          <stop offset=".35" stopColor="#f3d98b" />
          <stop offset=".6" stopColor="#d8ae4e" />
          <stop offset="1" stopColor="#8f6a22" />
        </linearGradient>
        <radialGradient id={pl} cx="35%" cy="30%" r="70%">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".6" stopColor="#f6eee2" />
          <stop offset="1" stopColor="#cdbfae" />
        </radialGradient>
      </defs>
      <path d="M20 0v6" stroke="#b58b34" strokeWidth="1.4" />
      <circle cx="20" cy="9" r="4.2" fill={`url(#${g})`} />
      <circle cx="20" cy="9" r="1.7" fill="#b3243f" />
      <path d="M20 13c-9 0-15 8-16 19h32c-1-11-7-19-16-19z" fill={`url(#${g})`} />
      <path d="M7 27q13-5 26 0" stroke="#fff3c9" strokeWidth=".9" fill="none" opacity=".8" />
      {[9, 14.5, 20, 25.5, 31].map((x) => (
        <circle key={x} cx={x} cy={22 + Math.abs(20 - x) * 0.18} r=".95" fill="#fff6d6" />
      ))}
      <rect x="3.4" y="31" width="33.2" height="3" rx="1.5" fill="#9c7424" />
      {pearls.map((x, i) => {
        const len = 12 + ((i * 7) % 3) * 4 + (i === 3 ? 6 : 0);
        return (
          <g key={x}>
            <path d={`M${x + 1} 34v${len}`} stroke="#d8ae4e" strokeWidth=".8" />
            <circle cx={x + 1} cy={34 + len * 0.5} r="1.5" fill={`url(#${pl})`} />
            <circle cx={x + 1} cy={36 + len} r={i === 3 ? 3 : 2.3} fill={i === 3 ? "#b3243f" : `url(#${pl})`} />
          </g>
        );
      })}
    </svg>
  );
}

/** One marigold head (fluffy genda), as a reusable group. */
function genda(x: number, y: number, r: number, key: string | number, deep = false): ReactNode {
  return (
    <g key={key}>
      <circle cx={x} cy={y} r={r} fill={deep ? WT.marigoldDeep : WT.marigold} />
      <circle cx={x} cy={y} r={r} fill="none" stroke={deep ? "#b85a06" : "#d77d0a"} strokeWidth=".7" strokeDasharray="1.6 1.8" opacity=".75" />
      <circle cx={x} cy={y} r={r * 0.62} fill={deep ? "#f59a1c" : "#ffc23a"} />
      <circle cx={x} cy={y} r={r * 0.28} fill={deep ? "#d0650a" : "#f08a12"} />
    </g>
  );
}

/**
 * A marigold lari: genda flowers threaded on a gold cord, alternating saffron
 * and yellow, with a rose bud and a tassel at the end. `n` flowers; the SVG is
 * 20 wide and grows down.
 */
export function GendaLari({ n = 7, className, rose = true }: { n?: number; className?: string; rose?: boolean }) {
  const step = 14;
  const h = 6 + n * step + (rose ? 22 : 10);
  return (
    <svg viewBox={`0 0 20 ${h}`} width={20} height={h} className={className} aria-hidden>
      <path d={`M10 0V${h - 6}`} stroke={WT.gold} strokeWidth="1" />
      {Array.from({ length: n }, (_, i) => genda(10, 8 + i * step, i % 2 ? 6 : 6.8, i, i % 2 === 1))}
      {rose ? (
        <g>
          <path d={`M10 ${8 + n * step - 2}q-5 5-2 9q2 2 2 2q0 0 2-2q3-4-2-9z`} fill={WT.leaf} />
          <circle cx="10" cy={8 + n * step + 4} r="4.4" fill={WT.roseDeep} />
          <path d={`M7.4 ${8 + n * step + 3.4}q2.6-3 5.2 0`} stroke="#f4b8c0" strokeWidth=".9" fill="none" />
          <path d={`M8.6 ${h - 8}h2.8l1 7h-4.8z`} fill={WT.gold} />
        </g>
      ) : (
        <path d={`M8.6 ${h - 8}h2.8l1 7h-4.8z`} fill={WT.gold} />
      )}
    </svg>
  );
}

/**
 * A swagged marigold toran: `n` swags of genda flowers on a gold cord, mango
 * leaves at every peg and a small gold bell hanging from each. Width = n × 120
 * in viewBox units; it scales to its box width (aspect kept).
 */
export function MarigoldToran({ n = 5, className, bells = true }: { n?: number; className?: string; bells?: boolean }) {
  const W = n * 120;
  const flowers: ReactNode[] = [];
  const leaves: ReactNode[] = [];
  for (let s = 0; s < n; s++) {
    const x0 = s * 120;
    for (let i = 0; i <= 9; i++) {
      const t = i / 9;
      const x = x0 + t * 120;
      const y = 6 + Math.sin(t * Math.PI) * 18;
      flowers.push(genda(r1(x), r1(y), i % 3 === 0 ? 6.4 : 5.4, `${s}-${i}`, i % 2 === 1));
    }
    leaves.push(
      <g key={`l${s}`}>
        <path d={`M${x0} 5q-9 9-4 20q5-6 4-20z`} fill={WT.leaf} />
        <path d={`M${x0} 5q9 9 4 20q-5-6-4-20z`} fill="#3f7a30" />
      </g>,
    );
    if (bells) {
      leaves.push(
        <g key={`b${s}`}>
          <path d={`M${x0 + 60} 25v9`} stroke={WT.gold} strokeWidth=".9" />
          <path d={`M${x0 + 55} 42q0-8 5-8t5 8z`} fill={WT.gold} />
          <circle cx={x0 + 60} cy={43.4} r="1.6" fill={WT.goldDeep} />
        </g>,
      );
    }
  }
  leaves.push(
    <g key="lend">
      <path d={`M${W} 5q-9 9-4 20q5-6 4-20z`} fill={WT.leaf} />
    </g>,
  );
  return (
    <svg viewBox={`-6 0 ${W + 12} 48`} className={className} preserveAspectRatio="xMidYMin meet" aria-hidden>
      <path d={Array.from({ length: n }, (_, s) => `M${s * 120} 6Q${s * 120 + 60} 42 ${s * 120 + 120} 6`).join("")} stroke={WT.goldDeep} strokeWidth="1.1" fill="none" />
      {leaves}
      {flowers}
    </svg>
  );
}

/** Two interlocked gold rings with a small diamond. */
export function Rings({ size = 20, className }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 28" className={className} aria-hidden>
      <circle cx="12" cy="17" r="8.2" fill="none" stroke="#c39a43" strokeWidth="2.6" />
      <circle cx="20" cy="17" r="8.2" fill="none" stroke="#e2c27a" strokeWidth="2.6" />
      <path d="M20 4.6l2.6 2.6-2.6 3-2.6-3z" fill="#fff" stroke="#9cc3e6" strokeWidth=".8" />
    </svg>
  );
}

/** A rose petal (the particle layers use the data-URI twins in WeddingDecor). */
export function Petal({ size = 14, className, color = WT.rose }: P & { color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" className={className} aria-hidden>
      <path d="M10 1c6 3 8 9 4 15-2 3-6 3-8 0C2 10 4 4 10 1z" fill={color} />
      <path d="M10 3c1 5 1 9-1 13" stroke="rgba(255,255,255,.5)" strokeWidth=".8" fill="none" />
    </svg>
  );
}
