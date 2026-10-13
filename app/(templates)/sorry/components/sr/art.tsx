"use client";

// The Sorry artwork, all drawn here (original — no licensed character):
//
//   • MochiBear — a round marshmallow bear in the page's palette (its inner
//     ears and cheeks follow --sr-blush / --sr-cheek). Eight faces: teary
//     "sad" (the apologiser), and the five moods the slider walks through
//     (calm → fuming, with a vein mark and steam at the top), then "happy" and
//     "love" (heart eyes) once forgiven.
//   • HeartSeal — the wax heart on the envelope.
//   • PinkyHand — one hand with its little finger out (mirrored for the other).
//   • Sparkle — a four-point twinkle.
//
// Everything animates with CSS transforms only, and stops for reduced motion.

import type { CSSProperties } from "react";

export type BearFace = "sad" | "calm" | "pout" | "huff" | "angry" | "fuming" | "happy" | "love";

const INK = "#5B3A30";
const FUR = "#FFFDF8";

export function MochiBear({ face = "sad", size = 160, className, style, holding }: { face?: BearFace; size?: number | string; className?: string; style?: CSSProperties; holding?: "heart" | "flowers" | null }) {
  const angry = face === "angry" || face === "fuming";
  return (
    <svg viewBox="0 0 200 210" width={size} height={size} className={`sr-bear sr-bear-${face}${className ? ` ${className}` : ""}`} style={{ overflow: "visible", ...style }} aria-hidden>
      <defs>
        <radialGradient id="srFur" cx="42%" cy="34%" r="70%">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset=".75" stopColor={FUR} />
          <stop offset="1" stopColor="#F3E9E2" />
        </radialGradient>
      </defs>
      {/* steam for "fuming" */}
      {face === "fuming" && (
        <g className="sr-steam" fill="#FFFFFF" stroke={INK} strokeWidth="3">
          <path d="M34 34 q-10 -12 2 -20 q2 -12 14 -8 q12 -4 12 8 q8 8 -4 16 z" />
          <path d="M166 34 q10 -12 -2 -20 q-2 -12 -14 -8 q-12 -4 -12 8 q-8 8 4 16 z" />
        </g>
      )}
      {/* body + arms + feet */}
      <g className="sr-bear-body">
        <ellipse cx="100" cy="170" rx="56" ry="36" fill="url(#srFur)" stroke={INK} strokeWidth="4" />
        <ellipse cx="72" cy="198" rx="17" ry="9" fill="url(#srFur)" stroke={INK} strokeWidth="4" />
        <ellipse cx="128" cy="198" rx="17" ry="9" fill="url(#srFur)" stroke={INK} strokeWidth="4" />
        <ellipse cx="74" cy="198" rx="7" ry="4" fill="var(--sr-blush, #FFD3E2)" />
        <ellipse cx="126" cy="198" rx="7" ry="4" fill="var(--sr-blush, #FFD3E2)" />
      </g>
      {holding === "heart" && (
        <g className="sr-bear-hold">
          <path d="M100 196 C80 182 70 170 74 160 C78 150 92 150 100 160 C108 150 122 150 126 160 C130 170 120 182 100 196 Z" fill="var(--vw-accent, #FF6F91)" stroke={INK} strokeWidth="3.5" />
          <path d="M84 162 q6 -6 12 0" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".8" />
        </g>
      )}
      {holding === "flowers" && (
        <g className="sr-bear-hold">
          <path d="M92 196 L100 168 L108 196 Z" fill="#9ADBB5" stroke={INK} strokeWidth="3" />
          {[[86, 162], [100, 154], [114, 162], [93, 172], [107, 172]].map(([x, y], k) => (
            <g key={k} transform={`translate(${x} ${y})`}>
              {[0, 72, 144, 216, 288].map((a) => (
                <ellipse key={a} cx="0" cy="-6" rx="4.5" ry="6" fill={k % 2 ? "var(--sr-blush, #FFD3E2)" : "var(--vw-accent, #FF6F91)"} transform={`rotate(${a})`} />
              ))}
              <circle r="3.5" fill="#FFE07A" stroke={INK} strokeWidth="1.5" />
            </g>
          ))}
        </g>
      )}
      <g className="sr-bear-arms">
        <ellipse cx="54" cy="160" rx="13" ry="18" transform="rotate(30 54 160)" fill="url(#srFur)" stroke={INK} strokeWidth="4" />
        <ellipse cx="146" cy="160" rx="13" ry="18" transform="rotate(-30 146 160)" fill="url(#srFur)" stroke={INK} strokeWidth="4" />
      </g>
      {/* head */}
      <g className="sr-bear-head">
        <circle cx="48" cy="44" r="21" fill="url(#srFur)" stroke={INK} strokeWidth="4" />
        <circle cx="152" cy="44" r="21" fill="url(#srFur)" stroke={INK} strokeWidth="4" />
        <circle cx="48" cy="44" r="11" fill="var(--sr-blush, #FFD3E2)" />
        <circle cx="152" cy="44" r="11" fill="var(--sr-blush, #FFD3E2)" />
        <ellipse cx="100" cy="92" rx="70" ry="62" fill="url(#srFur)" stroke={INK} strokeWidth="4" />
        {face === "fuming" && <ellipse cx="100" cy="92" rx="66" ry="58" fill="#FF5A6E" opacity=".22" />}
        {/* cheeks */}
        <ellipse className="sr-cheek" cx="58" cy="112" rx="15" ry="9" fill={angry ? "#FF7A8A" : "var(--sr-cheek, #FFB3C7)"} opacity={angry ? 0.75 : 0.85} />
        <ellipse className="sr-cheek" cx="142" cy="112" rx="15" ry="9" fill={angry ? "#FF7A8A" : "var(--sr-cheek, #FFB3C7)"} opacity={angry ? 0.75 : 0.85} />
        <Eyes face={face} />
        {/* nose */}
        <ellipse cx="100" cy="104" rx="7" ry="5" fill={INK} />
        <Mouth face={face} />
        {angry && (
          <g className="sr-vein" stroke="#E5374F" strokeWidth="4" strokeLinecap="round" fill="none">
            <path d="M138 50 q6 6 0 12" />
            <path d="M150 48 q-6 6 0 12" />
            <path d="M134 60 q8 -2 20 -2" />
          </g>
        )}
        {face === "huff" && (
          <g className="sr-puff" fill="#FFFFFF" stroke={INK} strokeWidth="2.5">
            <circle cx="132" cy="118" r="5" />
            <circle cx="141" cy="124" r="3.5" />
          </g>
        )}
        {face === "sad" && (
          <g className="sr-tears" fill="#8FD3FF" stroke={INK} strokeWidth="2">
            <path className="sr-tear sr-tear-l" d="M66 98 q-6 10 0 14 q6 -4 0 -14 z" />
            <path className="sr-tear sr-tear-r" d="M134 98 q-6 10 0 14 q6 -4 0 -14 z" />
          </g>
        )}
      </g>
    </svg>
  );
}

function Eyes({ face }: { face: BearFace }) {
  if (face === "sad")
    return (
      <g>
        {/* big glossy puppy eyes, brows up in the middle */}
        <path d="M54 70 q12 -10 24 -4" stroke={INK} strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <path d="M146 70 q-12 -10 -24 -4" stroke={INK} strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <circle cx="68" cy="88" r="11" fill={INK} />
        <circle cx="132" cy="88" r="11" fill={INK} />
        <circle cx="72" cy="84" r="4.2" fill="#FFFFFF" />
        <circle cx="136" cy="84" r="4.2" fill="#FFFFFF" />
        <circle cx="65" cy="92" r="2" fill="#FFFFFF" />
        <circle cx="129" cy="92" r="2" fill="#FFFFFF" />
      </g>
    );
  if (face === "calm")
    return (
      <g fill={INK}>
        <circle cx="70" cy="88" r="6.5" />
        <circle cx="130" cy="88" r="6.5" />
        <circle cx="72" cy="86" r="2" fill="#FFFFFF" />
        <circle cx="132" cy="86" r="2" fill="#FFFFFF" />
      </g>
    );
  if (face === "pout")
    return (
      <g stroke={INK} strokeWidth="4" strokeLinecap="round" fill="none">
        <path d="M60 88 q10 6 20 0" />
        <path d="M120 88 q10 6 20 0" />
        <path d="M58 74 l20 4" />
        <path d="M142 74 l-20 4" />
      </g>
    );
  if (face === "huff")
    return (
      <g stroke={INK} strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
        <path d="M60 80 l16 8 l-16 8" />
        <path d="M140 80 l-16 8 l16 8" />
      </g>
    );
  if (face === "angry" || face === "fuming")
    return (
      <g>
        <path d="M54 72 l26 10" stroke={INK} strokeWidth="5" strokeLinecap="round" />
        <path d="M146 72 l-26 10" stroke={INK} strokeWidth="5" strokeLinecap="round" />
        <circle cx="70" cy="92" r="6.5" fill={INK} />
        <circle cx="130" cy="92" r="6.5" fill={INK} />
      </g>
    );
  if (face === "love")
    return (
      <g fill="var(--vw-accent, #FF6F91)" stroke={INK} strokeWidth="2.5" className="sr-heart-eyes">
        <path d="M70 98 C58 90 54 84 56 79 C58 74 66 74 70 80 C74 74 82 74 84 79 C86 84 82 90 70 98 Z" />
        <path d="M130 98 C118 90 114 84 116 79 C118 74 126 74 130 80 C134 74 142 74 144 79 C146 84 142 90 130 98 Z" />
      </g>
    );
  // happy: closed smiling eyes
  return (
    <g stroke={INK} strokeWidth="4.5" strokeLinecap="round" fill="none">
      <path d="M58 92 q12 -14 24 0" />
      <path d="M118 92 q12 -14 24 0" />
    </g>
  );
}

function Mouth({ face }: { face: BearFace }) {
  const s = { stroke: INK, strokeWidth: 4, strokeLinecap: "round" as const, fill: "none" };
  if (face === "sad") return <path d="M88 124 q12 -10 24 0" {...s} />;
  if (face === "calm") return <path d="M90 116 q10 8 20 0" {...s} />;
  if (face === "pout") return <path d="M96 116 q6 -4 6 2 q0 6 -6 4 q6 2 6 6 q0 5 -6 2" {...s} strokeWidth={3.5} />;
  if (face === "huff") return <path d="M90 122 h20" {...s} />;
  if (face === "angry") return <path d="M86 126 q14 -12 28 0" {...s} />;
  if (face === "fuming")
    return (
      <g>
        <path d="M84 118 h32 v8 q-16 8 -32 0 z" fill="#FFFFFF" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
        <path d="M92 118 v10 M100 118 v12 M108 118 v10" stroke={INK} strokeWidth="2.5" />
      </g>
    );
  // happy / love: an open smile with a little tongue
  return (
    <g>
      <path d="M84 114 q16 22 32 0 z" fill="#7A2E3A" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M92 124 q8 6 16 0 q-8 -6 -16 0" fill="#FF8FA6" />
    </g>
  );
}

/** The wax heart that seals the envelope. `cracks` 0–3 draws the cracks as she taps. */
export function HeartSeal({ size = 96, cracks = 0 }: { size?: number | string; cracks?: number }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ display: "block", overflow: "visible" }} aria-hidden>
      <defs>
        <radialGradient id="srWax" cx="38%" cy="30%" r="75%">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity=".55" />
          <stop offset=".18" stopColor="var(--vw-accent, #FF6F91)" />
          <stop offset="1" stopColor="var(--vw-accent-deep, #D9466E)" />
        </radialGradient>
      </defs>
      <path d="M50 92 C20 72 6 56 8 38 C10 18 34 12 50 30 C66 12 90 18 92 38 C94 56 80 72 50 92 Z" fill="url(#srWax)" stroke="var(--sr-deep, #B83A62)" strokeWidth="3" />
      <path d="M50 78 C30 64 22 54 23 42 C24 30 38 26 50 38 C62 26 76 30 77 42 C78 54 70 64 50 78 Z" fill="none" stroke="#FFFFFF" strokeOpacity=".55" strokeWidth="2" strokeDasharray="3 4" />
      <text x="50" y="56" textAnchor="middle" fontSize="15" fontWeight="800" fill="#FFFFFF" fontFamily="system-ui, sans-serif" letterSpacing=".5">sorry</text>
      <path d="M22 30 Q30 20 42 22" stroke="#FFFFFF" strokeOpacity=".6" strokeWidth="4" strokeLinecap="round" fill="none" />
      {cracks > 0 && <path d="M50 30 L46 44 L54 52 L48 64" stroke="var(--sr-deep, #B83A62)" strokeWidth="2.6" fill="none" strokeLinejoin="round" />}
      {cracks > 1 && <path d="M30 40 L40 48 L36 58" stroke="var(--sr-deep, #B83A62)" strokeWidth="2.4" fill="none" strokeLinejoin="round" />}
      {cracks > 2 && <path d="M70 42 L62 52 L68 62" stroke="var(--sr-deep, #B83A62)" strokeWidth="2.4" fill="none" strokeLinejoin="round" />}
    </svg>
  );
}

/** A hand with its little finger out, reaching right (mirror with flip for the other side). */
export function PinkyHand({ size = 120, flip = false, tone = "#FFE2D2" }: { size?: number | string; flip?: boolean; tone?: string }) {
  return (
    <svg viewBox="0 0 140 100" width={size} style={{ display: "block", overflow: "visible", transform: flip ? "scaleX(-1)" : undefined }} aria-hidden>
      {/* sleeve */}
      <path d="M0 40 h34 v44 h-34 z" fill="var(--sr-blush, #FFD3E2)" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M8 40 v44 M18 40 v44" stroke="#FFFFFF" strokeOpacity=".7" strokeWidth="3" />
      {/* fist */}
      <path d="M32 44 C40 34 64 32 80 38 C92 42 94 54 90 64 C86 76 70 86 52 84 C40 83 32 78 32 72 Z" fill={tone} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      {/* knuckle lines */}
      <path d="M58 46 q4 8 0 16 M70 46 q4 8 0 16" stroke={INK} strokeWidth="2.5" strokeLinecap="round" fill="none" opacity=".55" />
      {/* the pinky, out and curled */}
      <path d="M84 62 C96 60 112 58 122 62 C130 66 128 76 120 76 C110 76 98 74 88 74" fill={tone} stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M116 64 q4 4 0 10" stroke={INK} strokeWidth="2" fill="none" opacity=".5" />
      {/* thumb */}
      <path d="M50 42 C58 30 74 28 78 36" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
      <ellipse cx="62" cy="70" rx="9" ry="5" fill="var(--sr-cheek, #FFB3C7)" opacity=".55" />
    </svg>
  );
}

export function Sparkle({ size = 18, color = "#FFFFFF", style }: { size?: number; color?: string; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={{ display: "block", ...style }} aria-hidden>
      <path d="M12 0 C13 8 16 11 24 12 C16 13 13 16 12 24 C11 16 8 13 0 12 C8 11 11 8 12 0 Z" fill={color} />
    </svg>
  );
}

export const SR_ART_CSS = `
.sr-bear { display: block; }
.sr-bear-head { transform-box: fill-box; transform-origin: 50% 90%; animation: sr-head 2.6s ease-in-out infinite alternate; }
@keyframes sr-head { from { transform: rotate(-3deg) } to { transform: rotate(3deg) } }
.sr-bear-sad .sr-bear-head { animation: sr-sniff 1.8s ease-in-out infinite; }
@keyframes sr-sniff { 0%, 100% { transform: translateY(0) rotate(-2deg) } 40% { transform: translateY(2px) rotate(-3deg) } 55% { transform: translateY(-1px) rotate(1deg) } }
.sr-bear-angry .sr-bear-head, .sr-bear-fuming .sr-bear-head { animation: sr-shake .35s ease-in-out infinite; }
@keyframes sr-shake { 0%, 100% { transform: translateX(0) } 25% { transform: translateX(-2px) rotate(-1.5deg) } 75% { transform: translateX(2px) rotate(1.5deg) } }
.sr-bear-happy .sr-bear-head, .sr-bear-love .sr-bear-head { animation: sr-bop .7s ease-in-out infinite alternate; }
@keyframes sr-bop { from { transform: translateY(0) rotate(-4deg) } to { transform: translateY(-5px) rotate(4deg) } }
.sr-tear { transform-box: fill-box; transform-origin: 50% 0; animation: sr-tear 1.6s ease-in infinite; }
.sr-tear-r { animation-delay: .8s; }
@keyframes sr-tear { 0% { transform: translateY(0) scale(.6); opacity: 0 } 15% { opacity: 1 } 100% { transform: translateY(26px) scale(1); opacity: 0 } }
.sr-steam path { transform-box: fill-box; transform-origin: 50% 100%; animation: sr-steam 1s ease-out infinite; }
.sr-steam path:last-child { animation-delay: .5s; }
@keyframes sr-steam { 0% { transform: translateY(6px) scale(.6); opacity: 0 } 30% { opacity: 1 } 100% { transform: translateY(-14px) scale(1.15); opacity: 0 } }
.sr-vein { transform-box: fill-box; transform-origin: 50% 50%; animation: sr-vein .6s ease-in-out infinite alternate; }
@keyframes sr-vein { from { transform: scale(.85) } to { transform: scale(1.12) } }
.sr-puff circle { transform-box: fill-box; transform-origin: 0 50%; animation: sr-puff 1.2s ease-out infinite; }
@keyframes sr-puff { 0% { transform: translate(-4px, 0) scale(.5); opacity: 0 } 30% { opacity: 1 } 100% { transform: translate(10px, -4px) scale(1.2); opacity: 0 } }
.sr-heart-eyes path { transform-box: fill-box; transform-origin: 50% 50%; animation: sr-beat .6s ease-in-out infinite alternate; }
@keyframes sr-beat { from { transform: scale(.9) } to { transform: scale(1.15) } }
.sr-bear-hold { transform-box: fill-box; transform-origin: 50% 100%; animation: sr-beat .9s ease-in-out infinite alternate; }
@media (prefers-reduced-motion: reduce) {
  .sr-bear *, .sr-bear { animation: none !important; }
}
`;
