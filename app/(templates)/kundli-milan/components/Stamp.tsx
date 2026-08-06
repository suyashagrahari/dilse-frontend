"use client";

// ─── The office stamp ────────────────────────────────────────────────────────
//
// A wholly invented mark. The issuing authority is the fictional "Office of the
// Registrar of Hearts"; the centre device is a plain geometric rosette. This is
// deliberately NOT any real emblem, coat of arms, state device, motto or
// astrology service's mark, and must never become one.
//
// Realism comes from four things, in order of importance:
//   1. it overlaps the signature line rather than sitting in clear space
//   2. semi-transparent ink, so the ruled line reads through it
//   3. uneven ink density, via a radial-gradient mask
//   4. slightly irregular edges, via feTurbulence + feDisplacementMap
//
// (4) is a refinement only. `html-to-image` has never been proven to carry SVG
// filters through its foreignObject serialisation in this codebase, so the mark
// is designed to stay completely legible with the filter dropped.

import { seededSpread, seededUnit } from "@/lib/seededRandom";
import { MAROON, MONO, SERIF } from "./ui";

export default function Stamp({
  uid,
  seed,
  size = 96,
}: {
  /** SVG ids are document-global; two stamps can share a page. */
  uid: string;
  /** The report seed — every imperfection below is derived from it. */
  seed: string;
  size?: number;
}) {
  const rotate = -5 + seededSpread(seed, "stampRot", 1.6);
  const inkX = 36 + seededSpread(seed, "stampInkX", 14);
  const inkY = 32 + seededSpread(seed, "stampInkY", 14);
  const noiseSeed = Math.floor(seededUnit(seed, "stampNoise") * 90) + 1;

  const bleed = `km-bleed-${uid}`;
  const grad = `km-ink-${uid}`;
  const mask = `km-mask-${uid}`;
  const topArc = `km-top-${uid}`;
  const botArc = `km-bot-${uid}`;

  // Eight spokes, drawn as a rosette. Geometry, not iconography.
  const spokes = Array.from({ length: 8 }, (_, i) => {
    const a = (i * Math.PI) / 4;
    return {
      x1: 50 + Math.cos(a) * 6.5,
      y1: 50 + Math.sin(a) * 6.5,
      x2: 50 + Math.cos(a) * 15.5,
      y2: 50 + Math.sin(a) * 15.5,
    };
  });

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      aria-hidden
      focusable="false"
      style={{
        transform: `rotate(${rotate}deg)`,
        opacity: 0.7,
        // Ink, not a sticker: it must let the ruled line beneath show through.
        mixBlendMode: "multiply",
        pointerEvents: "none",
      }}
    >
      <defs>
        <filter id={bleed} x="-25%" y="-25%" width="150%" height="150%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={noiseSeed} result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="1.05" xChannelSelector="R" yChannelSelector="G" />
        </filter>

        <radialGradient id={grad} cx={`${inkX}%`} cy={`${inkY}%`} r="84%">
          <stop offset="0%" stopColor="#fff" stopOpacity="1" />
          <stop offset="46%" stopColor="#fff" stopOpacity="0.9" />
          <stop offset="79%" stopColor="#fff" stopOpacity="0.58" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0.3" />
        </radialGradient>
        <mask id={mask} maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100">
          <rect x="0" y="0" width="100" height="100" fill={`url(#${grad})`} />
        </mask>

        <path id={topArc} d="M 11,53 A 39,39 0 0 1 89,53" fill="none" />
        <path id={botArc} d="M 16,50 A 34,34 0 0 0 84,50" fill="none" />
      </defs>

      <g mask={`url(#${mask})`} filter={`url(#${bleed})`} fill="none" stroke={MAROON}>
        <circle cx="50" cy="50" r="47" strokeWidth="2.2" />
        <circle cx="50" cy="50" r="42" strokeWidth="0.8" />
        <circle cx="50" cy="50" r="24" strokeWidth="0.7" />

        <text
          fill={MAROON}
          stroke="none"
          fontSize="6.6"
          letterSpacing="0.7"
          style={{ fontFamily: SERIF, fontWeight: 700 }}
        >
          <textPath href={`#${topArc}`} startOffset="50%" textAnchor="middle">
            OFFICE OF THE REGISTRAR OF HEARTS
          </textPath>
        </text>
        <text
          fill={MAROON}
          stroke="none"
          fontSize="6.2"
          letterSpacing="1.1"
          style={{ fontFamily: SERIF, fontWeight: 700 }}
        >
          <textPath href={`#${botArc}`} startOffset="50%" textAnchor="middle">
            JYOTISH VIBHAG · MILAN CELL
          </textPath>
        </text>

        {/* Separator lozenges at 9 and 3 o'clock, between the two legends */}
        <path d="M6.6,50 l2.1,-2.1 l2.1,2.1 l-2.1,2.1 z" fill={MAROON} stroke="none" />
        <path d="M89.2,50 l2.1,-2.1 l2.1,2.1 l-2.1,2.1 z" fill={MAROON} stroke="none" />

        {/* Centre device: an eight-spoke geometric rosette. Nothing heraldic. */}
        <g strokeWidth="1.1" strokeLinecap="round">
          {spokes.map((s, i) => (
            <line key={i} x1={s.x1} y1={s.y1} x2={s.x2} y2={s.y2} />
          ))}
          <circle cx="50" cy="50" r="5.4" strokeWidth="0.9" />
        </g>

        <text
          fill={MAROON}
          stroke="none"
          fontSize="4.4"
          letterSpacing="0.8"
          textAnchor="middle"
          x="50"
          y="72.5"
          style={{ fontFamily: MONO }}
        >
          MILAN VERIFIED
        </text>
      </g>
    </svg>
  );
}
