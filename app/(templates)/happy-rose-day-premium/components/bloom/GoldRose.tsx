"use client";

// The gate's rose: not an illustration, a single hairline of gold light that draws itself (stroke-dashoffset), the
// way a foil-stamped line sits on a good card. One long stem, two leaves, a cupped head with a spiral heart.
// The head's glow is the only fill. Reduced motion: drawn at once.

export function GoldRose({ size = 260 }: { size?: number }) {
  return (
    <svg className="rb-goldRose" viewBox="0 0 200 300" width={size * (200 / 300)} height={size} aria-hidden>
      <defs>
        <linearGradient id="rbGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFF1C9" />
          <stop offset=".35" stopColor="#E3C27E" />
          <stop offset="1" stopColor="#9C7834" />
        </linearGradient>
        <radialGradient id="rbHeadGlow">
          <stop offset="0" stopColor="rgba(255,190,170,.55)" />
          <stop offset="1" stopColor="rgba(255,190,170,0)" />
        </radialGradient>
      </defs>
      <circle className="rb-grGlow" cx="100" cy="86" r="70" fill="url(#rbHeadGlow)" />
      <g fill="none" stroke="url(#rbGold)" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
        {/* stem */}
        <path className="rb-grLine" style={{ ["--len" as string]: 190, ["--dl" as string]: "0s" }} d="M101 296 C97 262 104 232 100 200 C97 178 99 156 100 136" />
        {/* leaves */}
        <path className="rb-grLine" style={{ ["--len" as string]: 120, ["--dl" as string]: ".7s" }} d="M100 226 C90 210 72 204 54 208 C64 224 84 232 100 226 M54 208 C70 214 86 220 100 226" />
        <path className="rb-grLine" style={{ ["--len" as string]: 110, ["--dl" as string]: ".95s" }} d="M100 186 C110 172 128 166 146 170 C136 186 116 192 100 186 M146 170 C130 174 114 180 100 186" />
        {/* the cup: outer petals */}
        <path className="rb-grLine" style={{ ["--len" as string]: 260, ["--dl" as string]: "1.15s" }} d="M100 136 C80 134 62 120 60 98 C58 80 66 66 78 60 M100 136 C120 134 138 120 140 98 C142 80 134 66 122 60" />
        <path className="rb-grLine" style={{ ["--len" as string]: 220, ["--dl" as string]: "1.45s" }} d="M70 100 C74 118 86 128 100 128 C114 128 126 118 130 100 M78 60 C86 74 92 80 100 82 C108 80 114 74 122 60" />
        {/* the heart: a spiral */}
        <path className="rb-grLine" style={{ ["--len" as string]: 330, ["--dl" as string]: "1.75s" }} d="M100 82 C86 82 76 70 82 58 C88 46 108 42 118 52 C128 62 122 80 106 84 C94 87 86 76 92 66 C97 58 110 58 112 66 C114 72 108 76 103 73" />
      </g>
    </svg>
  );
}

export const GOLD_ROSE_CSS = `
.rb-goldRose { overflow: visible; filter: drop-shadow(0 0 6px rgba(255,214,150,.45)) drop-shadow(0 0 22px rgba(201,164,92,.25)); }
.rb-grLine { stroke-dasharray: var(--len) var(--len); stroke-dashoffset: var(--len); animation: rb-draw 2.4s cubic-bezier(.65,0,.35,1) var(--dl) forwards; }
.rb-grGlow { opacity: 0; transform-origin: 100px 86px; animation: rb-grGlow 3s ease 2.6s forwards, rb-grBreathe 4.8s ease-in-out 5.6s infinite; }
@keyframes rb-draw { to { stroke-dashoffset: 0; } }
@keyframes rb-grGlow { to { opacity: 1; } }
@keyframes rb-grBreathe { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: .7; transform: scale(1.08); } }
@media (prefers-reduced-motion: reduce) { .rb-grLine { animation: none; stroke-dashoffset: 0; } .rb-grGlow { animation: none; opacity: 1; } }
`;
