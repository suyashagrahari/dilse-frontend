"use client";

// Materials, not illustrations: wax (a displaced radial gradient with a
// debossed monogram), the notary's red rubber stamp (type on a circle with
// an ink-starved texture), the heavy envelope (CSS paper), and the sender's
// signature drawn in ink (the deed's own italic, stroked then filled).

import { useId, type CSSProperties } from "react";
import { SERIF, TYPE } from "./fonts";
import { SP, WAX } from "./model";

type Wax = (typeof WAX)[keyof typeof WAX];

export function WaxSeal({ W, mono, size = 120, pressed = true, style, className }: { W: Wax; mono: string; size?: number | string; pressed?: boolean; style?: CSSProperties; className?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const fs = mono.length > 3 ? 30 : mono.length > 2 ? 36 : 46;
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} className={className} style={style} aria-hidden>
      <defs>
        <filter id={`e${id}`} x="-25%" y="-25%" width="150%" height="150%">
          <feTurbulence type="fractalNoise" baseFrequency="0.032" numOctaves="2" seed="11" />
          <feDisplacementMap in="SourceGraphic" scale="24" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <radialGradient id={`g${id}`} cx="36%" cy="30%" r="78%">
          <stop offset="0" stopColor={W.hi} />
          <stop offset=".46" stopColor={W.c} />
          <stop offset="1" stopColor={W.lo} />
        </radialGradient>
        <radialGradient id={`w${id}`} cx="56%" cy="60%" r="60%">
          <stop offset="0" stopColor={W.c} />
          <stop offset=".8" stopColor={W.c} />
          <stop offset="1" stopColor={W.lo} />
        </radialGradient>
      </defs>
      <g filter={`url(#e${id})`}>
        <circle cx="100" cy="102" r="84" fill={W.lo} opacity=".55" />
        <circle cx="100" cy="100" r="82" fill={`url(#g${id})`} />
      </g>
      <ellipse cx="70" cy="58" rx="28" ry="10" fill="rgba(255,255,255,.2)" transform="rotate(-32 70 58)" />
      {pressed && (
        <g>
          <circle cx="100" cy="100" r="58" fill={`url(#w${id})`} />
          <circle cx="101.4" cy="101.8" r="58" fill="none" stroke="rgba(255,255,255,.26)" strokeWidth="1.6" />
          <circle cx="98.8" cy="98.4" r="58" fill="none" stroke={W.lo} strokeOpacity=".75" strokeWidth="2.4" />
          <circle cx="100" cy="100" r="49" fill="none" stroke={W.lo} strokeOpacity=".6" strokeWidth="1.4" strokeDasharray="1.5 4.5" strokeLinecap="round" />
          <g fontFamily={SERIF} fontStyle="italic" fontWeight={500} fontSize={fs} textAnchor="middle" dominantBaseline="central">
            <text x="101.6" y="102.2" fill="rgba(255,255,255,.38)">{mono}</text>
            <text x="98.6" y="98.2" fill={W.lo}>{mono}</text>
            <text x="98.9" y="98.6" fill={W.lo}>{mono}</text>
            <text x="100" y="100" fill={W.c}>{mono}</text>
          </g>
        </g>
      )}
    </svg>
  );
}

/** The notary's stamp: SIGNED · SEALED · PROMISED around today's date, in red ink. */
export function NotaryStamp({ date, size = 132, style, className }: { date: string; size?: number | string; style?: CSSProperties; className?: string }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} className={className} style={style} aria-hidden>
      <defs>
        <filter id={`r${id}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.5 1.55" result="m" />
          <feComposite in="SourceGraphic" in2="m" operator="in" />
        </filter>
        <path id={`c${id}`} d="M100,100 m-68,0 a68,68 0 1,1 136,0 a68,68 0 1,1 -136,0" />
      </defs>
      <g filter={`url(#r${id})`} fill={SP.notary} stroke={SP.notary}>
        <circle cx="100" cy="100" r="90" fill="none" strokeWidth="4" />
        <circle cx="100" cy="100" r="82" fill="none" strokeWidth="1.5" />
        <circle cx="100" cy="100" r="52" fill="none" strokeWidth="1.5" />
        <text fontFamily={TYPE} fontWeight={700} fontSize="15.5" letterSpacing="3.2" stroke="none">
          <textPath href={`#c${id}`} startOffset="0">SIGNED · SEALED · PROMISED · SIGNED · SEALED ·</textPath>
        </text>
        <text x="100" y="92" textAnchor="middle" fontFamily={TYPE} fontWeight={700} fontSize="13" letterSpacing="2" stroke="none">PROMISED</text>
        <text x="100" y="114" textAnchor="middle" fontFamily={TYPE} fontWeight={700} fontSize="14" letterSpacing="1" stroke="none">{date}</text>
      </g>
    </svg>
  );
}

/** The sender's signature: their name in the deed's italic, drawn in ink, then a swash under it. */
export function InkSignature({ text, play = true, ink = SP.navy, delay = 0, style, className }: { text: string; play?: boolean; ink?: string; delay?: number; style?: CSSProperties; className?: string }) {
  const long = text.length > 11;
  return (
    <svg viewBox="0 0 400 120" className={`sp-sig${play ? " is-play" : " is-static"}${className ? ` ${className}` : ""}`} style={{ ["--d" as string]: `${delay}s`, ...style }} role="img" aria-label={`Signed, ${text}`}>
      <text
        x="200"
        y="70"
        textAnchor="middle"
        fontFamily={SERIF}
        fontStyle="italic"
        fontWeight={500}
        fontSize={long ? 52 : 66}
        fill={ink}
        stroke={ink}
        strokeWidth="1.1"
        {...(long ? { textLength: 360, lengthAdjust: "spacingAndGlyphs" } : {})}
        className="sp-sigText"
        transform="skewX(-8) translate(8 0)"
      >
        {text}
      </text>
      <path className="sp-sigSwash" d="M60 96 C 140 80, 230 112, 300 90 S 360 78, 372 86" fill="none" stroke={ink} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export const ART_CSS = `
.sp-sig { display: block; width: 100%; height: auto; overflow: visible; }
.sp-sigText { stroke-dasharray: 900; stroke-dashoffset: 900; fill-opacity: 0; }
.sp-sigSwash { stroke-dasharray: 420; stroke-dashoffset: 420; }
.sp-sig.is-play .sp-sigText { animation: sp-ink 1.5s cubic-bezier(.45,.05,.55,.95) var(--d) forwards, sp-inkfill .5s ease calc(var(--d) + 1.2s) forwards; }
.sp-sig.is-play .sp-sigSwash { animation: sp-ink .6s cubic-bezier(.22,1,.36,1) calc(var(--d) + 1.35s) forwards; }
@keyframes sp-ink { to { stroke-dashoffset: 0; } }
@keyframes sp-inkfill { to { fill-opacity: 1; stroke-opacity: .2; } }
.sp-sig.is-static .sp-sigText, .sp-sig.is-static .sp-sigSwash { stroke-dashoffset: 0; fill-opacity: 1; stroke-opacity: .2; }
@media (prefers-reduced-motion: reduce) {
  .sp-sig .sp-sigText, .sp-sig .sp-sigSwash { animation: none !important; stroke-dashoffset: 0; fill-opacity: 1; }
}
`;
