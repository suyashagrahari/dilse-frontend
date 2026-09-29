// ─── The doodle and the wordmark ─────────────────────────────────────────────
//
// On the home page the logo is replaced by a "doodle", the way it is on a
// special day: the recipient's first name in the parody palette, two little
// people standing either side of it, and between them — held on two strings —
// a heart-shaped balloon with their first photo in it. It bobs, hearts rise,
// sparkles blink. Everywhere else the plain wordmark is used.

import type { CSSProperties } from "react";
import { cropStyle, photoCrop } from "../../dedication/components/types";
import { colorForIndex, firstNameOf, GS, type LovePhoto } from "./types";

export function Wordmark({ name, size = 24, className }: { name: string; size?: number; className?: string }) {
  const word = firstNameOf(name) || "Love";
  return (
    <span className={`srWord ${className ?? ""}`} style={{ fontSize: size, fontFamily: GS }} aria-label={word}>
      {[...word].map((ch, i) => (
        <span key={i} style={{ color: colorForIndex(i) }} aria-hidden>
          {ch}
        </span>
      ))}
    </span>
  );
}

const HEART = "M28 50 C6 34 0 24 0 15 A14 14 0 0 1 28 9 A14 14 0 0 1 56 15 C56 24 50 34 28 50 Z";

export default function Doodle({ name, photo, title, onClick }: { name: string; photo?: LovePhoto; title: string; onClick: () => void }) {
  const word = firstNameOf(name) || "Love";
  const len = [...word].length;
  const fs = Math.min(62, Math.floor(200 / Math.max(1, len * 0.56)));
  const crop = photo ? photoCrop(photo) : null;

  return (
    <button type="button" className="srDoodle" onClick={onClick} title={title} aria-label={title || `Search ${word}`}>
      <svg viewBox="0 0 340 142" className="srDoodleSvg" role="img" aria-hidden>
        <defs>
          <clipPath id="srHeartClip">
            <path d={HEART} />
          </clipPath>
          <radialGradient id="srGlow" cx=".5" cy=".5" r=".5">
            <stop offset="0" stopColor="#FFD6E2" stopOpacity=".9" />
            <stop offset="1" stopColor="#FFD6E2" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* soft glow + ground */}
        <ellipse cx="170" cy="44" rx="70" ry="44" fill="url(#srGlow)" className="srDGlow" />
        <path d="M14 128 Q170 138 326 128" fill="none" stroke="#F3C6D3" strokeWidth="2" strokeLinecap="round" strokeDasharray="1 7" />

        {/* strings */}
        <path className="srDString" d="M46 84 C 70 60, 120 86, 162 70" fill="none" stroke="#C9B6C2" strokeWidth="1.4" />
        <path className="srDString" d="M294 84 C 270 60, 220 86, 178 70" fill="none" stroke="#C9B6C2" strokeWidth="1.4" />

        {/* heart balloon with their photo */}
        <g className="srDBalloon">
          <g transform="translate(142 18)">
            <path d={HEART} fill="#FF8FB1" transform="translate(0 2)" opacity=".35" />
            <g clipPath="url(#srHeartClip)">
              <rect width="56" height="52" fill="#FFB3C8" />
              {photo && crop && (
                <foreignObject x="0" y="0" width="56" height="52">
                  <div style={{ width: 56, height: 52, overflow: "hidden" }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.url} alt="" draggable={false} style={cropStyle(crop)} />
                  </div>
                </foreignObject>
              )}
            </g>
            <path d={HEART} fill="none" stroke="#fff" strokeWidth="3" />
            <path d={HEART} fill="none" stroke="#FF5C8A" strokeWidth="1.4" />
            <path d="M24 50 l4 5 l4 -5 z" fill="#FF5C8A" />
          </g>
        </g>

        {/* rising hearts */}
        {[0, 1, 2, 3].map((i) => (
          <path
            key={i}
            className="srDRise"
            style={{ "--d": `${i * 1.1}s`, "--x": `${[118, 222, 96, 246][i]}px` } as CSSProperties}
            d="M0 3 C-4 0 -4 -3 -1.5 -3.4 C-0.6 -3.5 0 -2.8 0 -2.2 C0 -2.8 0.6 -3.5 1.5 -3.4 C4 -3 4 0 0 3 Z"
            fill={["#FF5C8A", "#F4B42B", "#E8445E", "#3F76EE"][i]}
          />
        ))}

        {/* sparkles */}
        {[
          [72, 26, 0],
          [270, 22, 0.8],
          [214, 8, 1.6],
          [110, 6, 2.2],
        ].map(([x, y, d], i) => (
          <path key={i} className="srDTwinkle" style={{ animationDelay: `${d}s` }} transform={`translate(${x} ${y})`} d="M0 -6 L1.4 -1.4 L6 0 L1.4 1.4 L0 6 L-1.4 1.4 L-6 0 L-1.4 -1.4 Z" fill="#F4B42B" />
        ))}

        {/* the name */}
        <text x="170" y="120" textAnchor="middle" fontFamily={GS} fontSize={fs} fontWeight={500} letterSpacing={-1}>
          {[...word].map((ch, i) => (
            <tspan key={i} fill={colorForIndex(i)}>
              {ch}
            </tspan>
          ))}
        </text>

        {/* her: long hair, rose dress, waving */}
        <g className="srDLeft">
          <path d="M31 74 q-9 8 -7 26 l6 -2 z" fill="#3B2A2E" />
          <circle cx="38" cy="80" r="9.5" fill="#F4C8A6" />
          <path d="M28 80 q1 -13 12 -12 q9 1 9 11 q-6 -6 -13 -4 q-4 4 -8 5 z" fill="#3B2A2E" />
          <circle cx="35" cy="81" r="1.1" fill="#2B1B1E" />
          <circle cx="41.5" cy="81" r="1.1" fill="#2B1B1E" />
          <path d="M36 85 q2 1.6 4 0" stroke="#C0506C" strokeWidth="1.1" fill="none" strokeLinecap="round" />
          <circle cx="33" cy="84" r="1.6" fill="#FF9EB5" opacity=".7" />
          <circle cx="44" cy="84" r="1.6" fill="#FF9EB5" opacity=".7" />
          <path d="M30 108 l8 -18 l8 18 z" fill="#FF6F96" />
          <path d="M44 94 l4 -8" stroke="#F4C8A6" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M32 94 l-5 6" stroke="#F4C8A6" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M35 108 v14 M41 108 v14" stroke="#3B2A2E" strokeWidth="2.4" strokeLinecap="round" />
        </g>

        {/* him: short hair, blue tee */}
        <g className="srDRight">
          <circle cx="302" cy="80" r="9.5" fill="#E9B78F" />
          <path d="M292 79 q0 -12 11 -12 q10 0 9 10 q-4 -4 -9 -3 q-6 -2 -11 5 z" fill="#2A2020" />
          <circle cx="299" cy="81" r="1.1" fill="#2B1B1E" />
          <circle cx="305.5" cy="81" r="1.1" fill="#2B1B1E" />
          <path d="M300 85 q2 1.6 4 0" stroke="#9A4A3A" strokeWidth="1.1" fill="none" strokeLinecap="round" />
          <circle cx="297" cy="84" r="1.6" fill="#FF9EB5" opacity=".6" />
          <rect x="294" y="90" width="16" height="18" rx="5" fill="#3F76EE" />
          <path d="M296 94 l-4 -8" stroke="#E9B78F" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M309 95 l5 6" stroke="#E9B78F" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M299 108 v14 M305 108 v14" stroke="#2A2020" strokeWidth="2.6" strokeLinecap="round" />
        </g>
      </svg>
    </button>
  );
}
