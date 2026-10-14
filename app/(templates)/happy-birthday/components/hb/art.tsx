"use client";

// The Happy Birthday artwork, all drawn here (original — no licensed character):
//
//   • Cake — a frosted, drippy party cake in the page's flavour (--hb-* vars),
//     their name piped on the front, five candles (the middle one is the
//     number topper, or a heart). Each candle can be unlit, lit (a flickering
//     flame that leans as they blow) or out (a curl of smoke).
//   • PartyBear — a round marshmallow bear in a party hat: "hopeful" (the
//     question), "happy" and "love" (heart eyes) once they say yes.
//   • Crown, Bow, Sparkle — small pieces.
//
// Everything animates with CSS transforms only, and stops for reduced motion.

import type { CSSProperties } from "react";

const INK = "#5B3A30";
const FUR = "#FFFDF8";

export type CandleState = "unlit" | "lit" | "out";

/** Candle x positions on the cake top (viewBox units); index 2 is the number/heart topper. */
export const CANDLE_X = [64, 106, 150, 194, 236] as const;
const CANDLE_Y = [116, 106, 92, 106, 116] as const;
const TOPPER = 2;

/** The flame tip of each candle, as % of the cake's box — the tap targets sit there. */
export function candleSpot(k: number, age: string): { x: number; y: number } {
  const tall = k === TOPPER ? (age ? 50 : 40) : 46;
  return { x: (CANDLE_X[k] / 300) * 100, y: ((CANDLE_Y[k] - tall - 6) / 270) * 100 };
}

export function Cake({
  candles,
  name,
  age,
  blow = 0,
  sprinkles,
  className,
  style,
  showCandles = true,
}: {
  candles: readonly CandleState[];
  name: string;
  age: string;
  /** 0–1: how hard they are blowing (the flames lean). */
  blow?: number;
  sprinkles: readonly string[];
  className?: string;
  style?: CSSProperties;
  showCandles?: boolean;
}) {
  const label = name.length > 12 ? `${name.slice(0, 11)}…` : name;
  return (
    <svg viewBox="0 0 300 270" className={`hb-cake${className ? ` ${className}` : ""}`} style={{ overflow: "visible", ["--blow" as string]: String(blow), ...style }} aria-hidden>
      <defs>
        <linearGradient id="hbCakeSide" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="var(--hb-frost)" />
          <stop offset=".18" stopColor="#FFFFFF" stopOpacity=".55" />
          <stop offset=".32" stopColor="var(--hb-frost)" />
          <stop offset=".86" stopColor="var(--hb-frost)" />
          <stop offset="1" stopColor="color-mix(in srgb, var(--hb-frost) 78%, var(--hb-deep))" />
        </linearGradient>
        <radialGradient id="hbFlame" cx="50%" cy="70%" r="60%">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset=".35" stopColor="#FFE58A" />
          <stop offset=".75" stopColor="#FFB23E" />
          <stop offset="1" stopColor="#FF7A2E" />
        </radialGradient>
        <radialGradient id="hbGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#FFE9A8" stopOpacity=".75" />
          <stop offset="1" stopColor="#FFE9A8" stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* plate */}
      <ellipse cx="150" cy="242" rx="146" ry="24" fill="color-mix(in srgb, var(--hb-deep) 18%, transparent)" />
      <ellipse cx="150" cy="236" rx="142" ry="22" fill="var(--hb-plate)" stroke="var(--vw-edge)" strokeWidth="3" />
      <ellipse cx="150" cy="232" rx="118" ry="14" fill="none" stroke="var(--vw-edge)" strokeWidth="1.5" opacity=".7" />
      {/* body */}
      <path d="M40 124 L40 222 A110 19 0 0 0 260 222 L260 124 Z" fill="url(#hbCakeSide)" />
      {/* a sponge peek + cream band */}
      <path d="M40 176 A110 19 0 0 0 260 176 L260 184 A110 19 0 0 1 40 184 Z" fill="var(--hb-sponge)" opacity=".9" />
      <path d="M40 184 A110 19 0 0 0 260 184" fill="none" stroke="var(--hb-cream)" strokeWidth="3" opacity=".9" />
      {/* bottom pearls */}
      {Array.from({ length: 13 }, (_, k) => {
        const t = k / 12;
        const x = 44 + t * 212;
        const y = 222 + Math.sin(t * Math.PI) * 18;
        return <circle key={k} cx={x} cy={y} r="7" fill="var(--hb-cream)" stroke="color-mix(in srgb, var(--hb-deep) 22%, transparent)" strokeWidth="1" />;
      })}
      {/* top */}
      <ellipse cx="150" cy="124" rx="110" ry="22" fill="var(--hb-cream)" />
      {/* drips */}
      <path
        d="M40 124 C40 134 44 150 50 150 C56 150 56 134 60 134 C64 134 64 160 72 160 C80 160 80 138 86 138 C92 138 92 146 98 146 C104 146 104 136 112 140 C120 144 118 166 128 166 C138 166 136 142 144 144 C152 146 150 156 158 156 C166 156 164 140 172 140 C180 140 180 170 190 170 C200 170 198 142 206 142 C214 142 212 154 220 154 C228 154 226 136 234 136 C242 136 242 158 250 156 C258 154 260 136 260 124 A110 22 0 0 0 40 124 Z"
        fill="var(--hb-drip)"
      />
      <ellipse cx="150" cy="121" rx="104" ry="18" fill="var(--hb-drip)" />
      <ellipse cx="128" cy="116" rx="40" ry="5" fill="#FFFFFF" opacity=".28" />
      {/* sprinkles on top */}
      {Array.from({ length: 22 }, (_, k) => {
        const a = (k * 137.5 * Math.PI) / 180;
        const r = 18 + ((k * 23) % 78);
        const x = 150 + Math.cos(a) * r;
        const y = 121 + Math.sin(a) * r * 0.16;
        return <rect key={k} x={x - 4} y={y - 1.4} width="8" height="2.8" rx="1.4" fill={sprinkles[k % sprinkles.length]} transform={`rotate(${(k * 53) % 180} ${x} ${y})`} />;
      })}
      {/* piped name */}
      <text x="150" y="210" textAnchor="middle" className="hb-cake-name" fill="var(--hb-deep)">
        {label}
      </text>
      {/* candles */}
      {showCandles &&
        CANDLE_X.map((x, k) => {
          const st = candles[k] ?? "unlit";
          const top = CANDLE_Y[k];
          if (k === TOPPER) return <Topper key={k} x={x} y={top} age={age} state={st} />;
          return <Candle key={k} x={x} y={top} state={st} stripe={sprinkles[k % sprinkles.length]} />;
        })}
    </svg>
  );
}

function Flame({ x, y, state }: { x: number; y: number; state: CandleState }) {
  return (
    <g className={`hb-flame-g is-${state}`}>
      {state === "lit" && <circle cx={x} cy={y - 8} r="20" fill="url(#hbGlow)" className="hb-glow" />}
      <path className="hb-flame" d={`M${x} ${y - 22} C${x + 7} ${y - 12} ${x + 8} ${y - 5} ${x} ${y} C${x - 8} ${y - 5} ${x - 7} ${y - 12} ${x} ${y - 22} Z`} fill="url(#hbFlame)" />
      {state === "out" && (
        <g className="hb-smoke" fill="none" stroke="#B9B2B6" strokeWidth="2.4" strokeLinecap="round">
          <path d={`M${x} ${y - 2} q-6 -8 0 -16 q6 -8 0 -16`} />
          <path d={`M${x + 2} ${y - 4} q6 -8 0 -14 q-5 -7 1 -13`} className="hb-smoke-b" />
        </g>
      )}
    </g>
  );
}

function Candle({ x, y, state, stripe }: { x: number; y: number; state: CandleState; stripe: string }) {
  const h = 46;
  return (
    <g>
      <rect x={x - 6} y={y - h} width="12" height={h} rx="3" fill="#FFFFFF" stroke="color-mix(in srgb, var(--hb-deep) 40%, transparent)" strokeWidth="1.5" />
      <path d={`M${x - 6} ${y - h + 10} L${x + 6} ${y - h + 4} M${x - 6} ${y - h + 22} L${x + 6} ${y - h + 16} M${x - 6} ${y - h + 34} L${x + 6} ${y - h + 28}`} stroke={stripe === "#FFFFFF" ? "var(--vw-accent)" : stripe} strokeWidth="4" />
      <path d={`M${x} ${y - h} v-6`} stroke={INK} strokeWidth="2" strokeLinecap="round" />
      <Flame x={x} y={y - h - 6} state={state} />
    </g>
  );
}

function Topper({ x, y, age, state }: { x: number; y: number; age: string; state: CandleState }) {
  const h = age ? 50 : 40;
  return (
    <g>
      {age ? (
        <text x={x} y={y} textAnchor="middle" className="hb-topper-num" fill="var(--vw-accent)" stroke="#FFFFFF" strokeWidth="5" paintOrder="stroke">
          {age}
        </text>
      ) : (
        <path d={`M${x} ${y} C${x - 26} ${y - 16} ${x - 24} ${y - 40} ${x - 10} ${y - 40} C${x - 4} ${y - 40} ${x} ${y - 34} ${x} ${y - 30} C${x} ${y - 34} ${x + 4} ${y - 40} ${x + 10} ${y - 40} C${x + 24} ${y - 40} ${x + 26} ${y - 16} ${x} ${y} Z`} fill="var(--vw-accent)" stroke="#FFFFFF" strokeWidth="3" />
      )}
      <path d={`M${x} ${y - h} v-6`} stroke={INK} strokeWidth="2" strokeLinecap="round" />
      <Flame x={x} y={y - h - 6} state={state} />
    </g>
  );
}

export type BearFace = "hopeful" | "happy" | "love" | "wow";

/** A round marshmallow bear in a party hat. */
export function PartyBear({ face = "hopeful", size = 160, holding = "balloon", balloon = "var(--vw-accent, #EE5583)" }: { face?: BearFace; size?: number | string; holding?: "balloon" | "cake" | "heart" | null; balloon?: string }) {
  return (
    <svg viewBox="-10 -40 220 260" width={size} height={size} className={`hb-bear hb-bear-${face}`} style={{ overflow: "visible", display: "block" }} aria-hidden>
      <defs>
        <radialGradient id="hbFur" cx="42%" cy="34%" r="70%">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset=".75" stopColor={FUR} />
          <stop offset="1" stopColor="#F3E9E2" />
        </radialGradient>
      </defs>
      {holding === "balloon" && (
        <g className="hb-bear-balloon">
          <path d="M168 150 C176 110 186 80 182 40" stroke={INK} strokeWidth="2" fill="none" />
          <ellipse cx="182" cy="10" rx="26" ry="31" fill={balloon} stroke={INK} strokeWidth="3" />
          <path d="M178 41 l4 8 l4 -8 z" fill={balloon} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
          <ellipse cx="172" cy="-2" rx="6" ry="10" fill="#FFFFFF" opacity=".6" transform="rotate(-20 172 -2)" />
        </g>
      )}
      <g className="hb-bear-body">
        <ellipse cx="100" cy="170" rx="56" ry="36" fill="url(#hbFur)" stroke={INK} strokeWidth="4" />
        <ellipse cx="72" cy="198" rx="17" ry="9" fill="url(#hbFur)" stroke={INK} strokeWidth="4" />
        <ellipse cx="128" cy="198" rx="17" ry="9" fill="url(#hbFur)" stroke={INK} strokeWidth="4" />
        <ellipse cx="74" cy="198" rx="7" ry="4" fill="var(--hb-blush, #FFD8E3)" />
        <ellipse cx="126" cy="198" rx="7" ry="4" fill="var(--hb-blush, #FFD8E3)" />
      </g>
      {holding === "heart" && (
        <g className="hb-bear-hold">
          <path d="M100 196 C80 182 70 170 74 160 C78 150 92 150 100 160 C108 150 122 150 126 160 C130 170 120 182 100 196 Z" fill="var(--vw-accent, #EE5583)" stroke={INK} strokeWidth="3.5" />
          <path d="M84 162 q6 -6 12 0" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".8" />
        </g>
      )}
      {holding === "cake" && (
        <g className="hb-bear-hold">
          <rect x="76" y="164" width="48" height="28" rx="5" fill="var(--hb-frost, #FFB3C8)" stroke={INK} strokeWidth="3" />
          <path d="M76 172 q6 8 12 0 q6 8 12 0 q6 8 12 0 q6 8 12 0" fill="var(--hb-drip, #EE5583)" stroke={INK} strokeWidth="2" />
          <rect x="97" y="148" width="6" height="16" rx="2" fill="#FFFFFF" stroke={INK} strokeWidth="2" />
          <path className="hb-bear-candle" d="M100 136 C104 141 104 144 100 147 C96 144 96 141 100 136 Z" fill="#FFB23E" />
        </g>
      )}
      <g className="hb-bear-arms">
        <ellipse cx="54" cy="160" rx="13" ry="18" transform="rotate(30 54 160)" fill="url(#hbFur)" stroke={INK} strokeWidth="4" />
        <ellipse cx="146" cy="160" rx="13" ry="18" transform={holding === "balloon" ? "rotate(-60 150 156)" : "rotate(-30 146 160)"} fill="url(#hbFur)" stroke={INK} strokeWidth="4" />
      </g>
      <g className="hb-bear-head">
        <circle cx="48" cy="44" r="21" fill="url(#hbFur)" stroke={INK} strokeWidth="4" />
        <circle cx="152" cy="44" r="21" fill="url(#hbFur)" stroke={INK} strokeWidth="4" />
        <circle cx="48" cy="44" r="11" fill="var(--hb-blush, #FFD8E3)" />
        <circle cx="152" cy="44" r="11" fill="var(--hb-blush, #FFD8E3)" />
        <ellipse cx="100" cy="92" rx="70" ry="62" fill="url(#hbFur)" stroke={INK} strokeWidth="4" />
        {/* party hat */}
        <g className="hb-bear-hat">
          <path d="M74 38 L104 -26 L130 36 Z" fill="var(--vw-accent, #EE5583)" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
          <path d="M84 18 L118 12 M90 2 L112 -2 M80 30 L126 26" stroke="#FFFFFF" strokeWidth="5" opacity=".8" />
          <circle cx="104" cy="-28" r="9" fill="#FFE07A" stroke={INK} strokeWidth="3" />
        </g>
        <ellipse className="hb-cheek" cx="58" cy="112" rx="15" ry="9" fill="var(--hb-cheek, #FFB3C7)" opacity=".85" />
        <ellipse className="hb-cheek" cx="142" cy="112" rx="15" ry="9" fill="var(--hb-cheek, #FFB3C7)" opacity=".85" />
        <Eyes face={face} />
        <ellipse cx="100" cy="104" rx="7" ry="5" fill={INK} />
        <Mouth face={face} />
      </g>
    </svg>
  );
}

function Eyes({ face }: { face: BearFace }) {
  if (face === "hopeful" || face === "wow")
    return (
      <g>
        <circle cx="68" cy="88" r="11" fill={INK} />
        <circle cx="132" cy="88" r="11" fill={INK} />
        <circle cx="72" cy="84" r="4.2" fill="#FFFFFF" />
        <circle cx="136" cy="84" r="4.2" fill="#FFFFFF" />
        <circle cx="65" cy="92" r="2" fill="#FFFFFF" />
        <circle cx="129" cy="92" r="2" fill="#FFFFFF" />
      </g>
    );
  if (face === "love")
    return (
      <g fill="var(--vw-accent, #EE5583)" stroke={INK} strokeWidth="2.5" className="hb-heart-eyes">
        <path d="M70 98 C58 90 54 84 56 79 C58 74 66 74 70 80 C74 74 82 74 84 79 C86 84 82 90 70 98 Z" />
        <path d="M130 98 C118 90 114 84 116 79 C118 74 126 74 130 80 C134 74 142 74 144 79 C146 84 142 90 130 98 Z" />
      </g>
    );
  return (
    <g stroke={INK} strokeWidth="4.5" strokeLinecap="round" fill="none">
      <path d="M58 92 q12 -14 24 0" />
      <path d="M118 92 q12 -14 24 0" />
    </g>
  );
}

function Mouth({ face }: { face: BearFace }) {
  if (face === "hopeful") return <path d="M90 116 q10 8 20 0" stroke={INK} strokeWidth="4" strokeLinecap="round" fill="none" />;
  if (face === "wow") return <ellipse cx="100" cy="122" rx="7" ry="9" fill="#7A2E3A" stroke={INK} strokeWidth="3.5" />;
  return (
    <g>
      <path d="M84 114 q16 22 32 0 z" fill="#7A2E3A" stroke={INK} strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M92 124 q8 6 16 0 q-8 -6 -16 0" fill="#FF8FA6" />
    </g>
  );
}

/** A little gold crown with gems in the page's colours. */
export function Crown({ size = 80 }: { size?: number | string }) {
  return (
    <svg viewBox="0 0 120 84" width={size} style={{ display: "block", overflow: "visible" }} aria-hidden className="hb-crown">
      <defs>
        <linearGradient id="hbGold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFE9A0" />
          <stop offset=".5" stopColor="#FFC94D" />
          <stop offset="1" stopColor="#E59A1F" />
        </linearGradient>
      </defs>
      <path d="M10 70 L4 18 L34 44 L60 6 L86 44 L116 18 L110 70 Z" fill="url(#hbGold)" stroke="#B9751A" strokeWidth="3.5" strokeLinejoin="round" />
      <rect x="10" y="64" width="100" height="14" rx="5" fill="url(#hbGold)" stroke="#B9751A" strokeWidth="3.5" />
      <circle cx="60" cy="50" r="8" fill="var(--vw-accent, #EE5583)" stroke="#FFFFFF" strokeWidth="2.5" />
      <circle cx="30" cy="56" r="5.5" fill="var(--vw-gold, #FF9EB5)" stroke="#FFFFFF" strokeWidth="2" />
      <circle cx="90" cy="56" r="5.5" fill="var(--vw-gold, #FF9EB5)" stroke="#FFFFFF" strokeWidth="2" />
      <circle cx="4" cy="16" r="5" fill="#FFE9A0" stroke="#B9751A" strokeWidth="2.5" />
      <circle cx="60" cy="5" r="5.5" fill="#FFE9A0" stroke="#B9751A" strokeWidth="2.5" />
      <circle cx="116" cy="16" r="5" fill="#FFE9A0" stroke="#B9751A" strokeWidth="2.5" />
      <path d="M22 66 h76" stroke="#FFFFFF" strokeOpacity=".55" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

/** The gift bow (two loops, two tails, a knot). `loose` 0–3 opens the loops as they tug. */
export function Bow({ loose = 0 }: { loose?: number }) {
  const s = 1 + loose * 0.06;
  return (
    <svg viewBox="0 0 160 110" width="100%" style={{ display: "block", overflow: "visible" }} aria-hidden>
      <g transform={`translate(80 56) scale(${s}) translate(-80 -56)`}>
        <path d="M74 60 L46 104 L58 102 L64 112 L80 66 Z" fill="var(--hb-ribbon2)" stroke="var(--hb-ribbon-ink)" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M86 60 L114 104 L102 102 L96 112 L80 66 Z" fill="var(--hb-ribbon2)" stroke="var(--hb-ribbon-ink)" strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M78 54 C56 18 14 22 14 46 C14 70 54 70 78 58 Z" fill="var(--hb-ribbon)" stroke="var(--hb-ribbon-ink)" strokeWidth="3" strokeLinejoin="round" transform={`rotate(${-loose * 6} 78 56)`} />
        <path d="M82 54 C104 18 146 22 146 46 C146 70 106 70 82 58 Z" fill="var(--hb-ribbon)" stroke="var(--hb-ribbon-ink)" strokeWidth="3" strokeLinejoin="round" transform={`rotate(${loose * 6} 82 56)`} />
        <path d="M30 44 C34 34 50 32 62 42" stroke="#FFFFFF" strokeOpacity=".55" strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M130 44 C126 34 110 32 98 42" stroke="#FFFFFF" strokeOpacity=".55" strokeWidth="4" strokeLinecap="round" fill="none" />
        <rect x="68" y="44" width="24" height="24" rx="8" fill="var(--hb-ribbon)" stroke="var(--hb-ribbon-ink)" strokeWidth="3" />
        <path d="M74 50 q6 -3 12 0" stroke="#FFFFFF" strokeOpacity=".6" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      </g>
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

export const HB_ART_CSS = `
.hb-cake { display: block; width: 100%; height: auto; }
.hb-cake-name { font: 700 30px var(--font-hb-hand), 'Segoe Print', cursive; letter-spacing: .5px; }
.hb-topper-num { font: 800 54px var(--font-hb-display), 'Fredoka', system-ui, sans-serif; }
.hb-flame-g .hb-flame { transform-box: fill-box; transform-origin: 50% 100%; transition: transform .35s ease, opacity .35s ease; }
.hb-flame-g.is-unlit .hb-flame { transform: scale(0); opacity: 0; }
.hb-flame-g.is-lit .hb-flame { animation: hb-flame .32s ease-in-out infinite alternate; transform: skewX(calc(var(--blow, 0) * -28deg)) scaleY(calc(1 - var(--blow, 0) * .35)); }
.hb-flame-g.is-out .hb-flame { transform: scale(0); opacity: 0; transition-duration: .25s; }
@keyframes hb-flame { from { transform: skewX(calc(var(--blow, 0) * -28deg - 3deg)) scale(.94, 1) } to { transform: skewX(calc(var(--blow, 0) * -28deg + 3deg)) scale(1.04, calc(1.08 - var(--blow, 0) * .35)) } }
.hb-glow { transform-box: fill-box; transform-origin: 50% 50%; animation: hb-glow 1.1s ease-in-out infinite alternate; }
@keyframes hb-glow { from { opacity: .6; transform: scale(.9) } to { opacity: 1; transform: scale(1.1) } }
.hb-smoke path { stroke-dasharray: 40; stroke-dashoffset: 40; opacity: 0; animation: hb-smoke 1.8s ease-out forwards; }
.hb-smoke .hb-smoke-b { animation-delay: .25s; }
@keyframes hb-smoke { 0% { stroke-dashoffset: 40; opacity: 0; transform: translateY(0) } 20% { opacity: .85 } 100% { stroke-dashoffset: 0; opacity: 0; transform: translateY(-14px) } }
.hb-bear { display: block; }
.hb-bear-head { transform-box: fill-box; transform-origin: 50% 90%; animation: hb-head 2.6s ease-in-out infinite alternate; }
@keyframes hb-head { from { transform: rotate(-3deg) } to { transform: rotate(3deg) } }
.hb-bear-happy .hb-bear-head, .hb-bear-love .hb-bear-head { animation: hb-bop .7s ease-in-out infinite alternate; }
@keyframes hb-bop { from { transform: translateY(0) rotate(-4deg) } to { transform: translateY(-5px) rotate(4deg) } }
.hb-bear-balloon { transform-box: fill-box; transform-origin: 30% 100%; animation: hb-sway 2.2s ease-in-out infinite alternate; }
@keyframes hb-sway { from { transform: rotate(-4deg) } to { transform: rotate(5deg) } }
.hb-heart-eyes path { transform-box: fill-box; transform-origin: 50% 50%; animation: hb-beat .6s ease-in-out infinite alternate; }
@keyframes hb-beat { from { transform: scale(.9) } to { transform: scale(1.15) } }
.hb-bear-hold { transform-box: fill-box; transform-origin: 50% 100%; animation: hb-beat .9s ease-in-out infinite alternate; }
.hb-bear-candle { transform-box: fill-box; transform-origin: 50% 100%; animation: hb-flame .32s ease-in-out infinite alternate; }
@media (prefers-reduced-motion: reduce) {
  .hb-bear *, .hb-bear, .hb-cake * { animation: none !important; }
  .hb-smoke path { opacity: 0; }
}
`;
