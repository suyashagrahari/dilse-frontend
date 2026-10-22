"use client";

// ─── The sage arch badge that carries the date ───────────────────────────────
// The owner's art (template12/11) has its own date baked in, so the shape is
// redrawn here as SVG: a hanging banner whose cusped shoulders narrow into a
// temple-arch point, with a line lotus at the tip. Text is live (any date,
// either language).

import { useId } from "react";

const SHAPE =
  "M0 0 H200 V112 C200 130 186 138 172 142 C160 146 156 154 156 164 V172 C156 188 140 196 124 202 C110 208 104 222 100 242 C96 222 90 208 76 202 C60 196 44 188 44 172 V164 C44 154 40 146 28 142 C14 138 0 130 0 112 Z";
const INNER =
  "M10 0 V110 C10 124 22 130 32 133 C46 137 54 148 54 162 V170 C54 182 66 189 80 194 C92 199 98 210 100 224 C102 210 108 199 120 194 C134 189 146 182 146 170 V162 C146 148 154 137 168 133 C178 130 190 124 190 110 V0";

export default function DateBadge({ month, day, year, className }: { month: string; day: string; year?: string; className?: string }) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg className={`lw-badge${className ? ` ${className}` : ""}`} viewBox="0 0 200 244" role="img" aria-label={[day, month, year].filter(Boolean).join(" ")}>
      <defs>
        <linearGradient id={`${uid}s`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8DAA98" />
          <stop offset=".55" stopColor="#6F8F7D" />
          <stop offset="1" stopColor="#5A7A69" />
        </linearGradient>
        <linearGradient id={`${uid}f`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#D9B45E" />
          <stop offset=".5" stopColor="#FFF0B5" />
          <stop offset="1" stopColor="#D2A84C" />
        </linearGradient>
      </defs>
      <path d={SHAPE} fill={`url(#${uid}s)`} />
      <path d={INNER} fill="none" stroke={`url(#${uid}f)`} strokeWidth="1.3" opacity=".8" />
      <text x="100" y="44" textAnchor="middle" fill={`url(#${uid}f)`} style={{ font: "600 26px var(--wk-font-display)", letterSpacing: "4px" }}>
        {month}
      </text>
      <text x="100" y="104" textAnchor="middle" fill={`url(#${uid}f)`} style={{ font: "500 66px/1 var(--wk-font-display)", fontVariantNumeric: "lining-nums" }}>
        {day}
      </text>
      {year && (
        <text x="100" y="130" textAnchor="middle" fill="#F4E6BE" style={{ font: "600 14px var(--wk-font-sans)", letterSpacing: "5px", fontVariantNumeric: "lining-nums" }}>
          {year}
        </text>
      )}
      <g transform="translate(100 176)" fill="none" stroke={`url(#${uid}f)`} strokeWidth="1.5" strokeLinejoin="round">
        <path d="M0 8 C-6 2 -6 -8 0 -16 C6 -8 6 2 0 8 Z" />
        <path d="M0 8 C-10 6 -16 -2 -15 -10 C-8 -8 -3 -2 0 8 Z" />
        <path d="M0 8 C10 6 16 -2 15 -10 C8 -8 3 -2 0 8 Z" />
        <path d="M0 8 C-14 9 -22 4 -25 -2 C-15 -3 -7 1 0 8 Z" />
        <path d="M0 8 C14 9 22 4 25 -2 C15 -3 7 1 0 8 Z" />
      </g>
    </svg>
  );
}
