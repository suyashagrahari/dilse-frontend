import { useId, type CSSProperties } from "react";

// ─── A lit clay diya, drawn in SVG ───────────────────────────────────────────
// A terracotta bowl with a painted gold rim and a flame whose halo breathes
// (the .pd-diya-flame / .pd-diya-halo animations live in css.ts). Drawn on a
// 64 × 64 box; the bowl's foot sits on the box's bottom edge.

export default function Diya({ className, style }: { className?: string; style?: CSSProperties }) {
  const uid = useId().replace(/:/g, "");
  const u = (n: string) => `pd-diya-${n}-${uid}`;
  return (
    <svg className={className} style={style} viewBox="0 0 64 64" aria-hidden>
      <defs>
        <radialGradient id={u("halo")} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#FFE9A8" stopOpacity=".95" />
          <stop offset=".45" stopColor="#FFC45A" stopOpacity=".45" />
          <stop offset="1" stopColor="#FF9A2E" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={u("flame")} cx=".5" cy=".75" r=".65">
          <stop offset="0" stopColor="#FFFBE6" />
          <stop offset=".45" stopColor="#FFD066" />
          <stop offset="1" stopColor="#F2741C" />
        </radialGradient>
        <linearGradient id={u("clay")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#D9733A" />
          <stop offset=".55" stopColor="#A9471F" />
          <stop offset="1" stopColor="#6E2A12" />
        </linearGradient>
      </defs>
      <circle className="pd-diya-halo" cx="32" cy="26" r="24" fill={`url(#${u("halo")})`} />
      <g className="pd-diya-flame">
        <path d="M32 8 C37 17 38 25 32 31 C26 25 27 17 32 8 Z" fill={`url(#${u("flame")})`} />
        <path d="M32 18 C34 22 34 26 32 29 C30 26 30 22 32 18 Z" fill="#FFFDF2" opacity=".9" />
      </g>
      <path d="M6 38 C10 54 24 60 32 60 C40 60 54 54 58 38 C48 42 40 43 32 43 C24 43 16 42 6 38 Z" fill={`url(#${u("clay")})`} />
      <path d="M6 38 C16 42 24 43 32 43 C40 43 48 42 58 38 C48 36 40 35 32 35 C24 35 16 36 6 38 Z" fill="#5A220E" />
      <path d="M6 38 C16 42 24 43 32 43 C40 43 48 42 58 38" fill="none" stroke="#E9C46A" strokeWidth="1.6" />
      <path d="M14 47 Q20 50 26 47 M38 47 Q44 50 50 47" fill="none" stroke="#F3D88F" strokeWidth="1.3" strokeLinecap="round" opacity=".8" />
      <circle cx="32" cy="50" r="2" fill="#F3D88F" opacity=".85" />
    </svg>
  );
}
