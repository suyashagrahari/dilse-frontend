"use client";

// "Look Up" art, all SVG/CSS (no images): the ring (solitaire / halo / heart / band × 5 stones), the velvet ring
// box, their hand (4 skin tones; the ring finger carries a target band and, once the ring is on, the band in two
// halves so it sits AROUND the finger), the candle, the matchbox and the phone chat.

import type { CSSProperties, ReactNode } from "react";
import type { HandTone, RingStyle, Stone } from "./util";

const STONES: Record<Stone, { hi: string; a: string; b: string; c: string; facet: string }> = {
  diamond: { hi: "#FFFFFF", a: "#EEF6FF", b: "#C9DDF0", c: "#8FA9C4", facet: "rgba(255,255,255,.75)" },
  ruby: { hi: "#FFC2CC", a: "#F04D63", b: "#C8102E", c: "#6E0718", facet: "rgba(255,200,210,.5)" },
  sapphire: { hi: "#D6E2FF", a: "#5B8CFF", b: "#1F4FBF", c: "#0E2A6E", facet: "rgba(210,225,255,.55)" },
  emerald: { hi: "#C9FFE9", a: "#3BD9A0", b: "#0E8A5F", c: "#064A33", facet: "rgba(200,255,230,.5)" },
  rosegold: { hi: "#FFF1F3", a: "#FAD0D7", b: "#EBA3B1", c: "#B86C7E", facet: "rgba(255,240,242,.7)" },
};

export function metal(stone: Stone) {
  return stone === "rosegold" ? { hi: "#FBE0D8", mid: "#E8A598", lo: "#B86E62" } : { hi: "#FFF3CF", mid: "#E6C27A", lo: "#A8823A" };
}

/** The ring, front view (viewBox 120×130; the band's centre is (60, 86)). */
export function Ring({ style: rs, stone, id, size = 120, css, sparkle = true }: { style: RingStyle; stone: Stone; id: string; size?: number; css?: CSSProperties; sparkle?: boolean }) {
  const m = metal(stone);
  const s = STONES[stone];
  const gem = (
    <g stroke={s.facet} strokeWidth={0.6} strokeLinejoin="round">
      <polygon points="34,28 46,14 47,28" fill={s.b} />
      <polygon points="46,14 60,20 47,28" fill={s.a} />
      <polygon points="46,14 74,14 60,20" fill={s.hi} />
      <polygon points="60,20 74,14 73,28" fill={s.b} />
      <polygon points="47,28 60,20 73,28" fill={s.a} />
      <polygon points="74,14 86,28 73,28" fill={s.c} />
      <polygon points="34,28 47,28 60,54" fill={s.b} />
      <polygon points="47,28 60,28 60,54" fill={s.c} />
      <polygon points="60,28 73,28 60,54" fill={s.a} />
      <polygon points="73,28 86,28 60,54" fill={s.c} />
    </g>
  );
  return (
    <svg viewBox="0 0 120 130" width={size} height={(size * 130) / 120} style={{ display: "block", overflow: "visible", ...css }} aria-hidden>
      <defs>
        <linearGradient id={`${id}-m`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={m.hi} /><stop offset=".45" stopColor={m.mid} /><stop offset="1" stopColor={m.lo} /></linearGradient>
        <linearGradient id={`${id}-m2`} x1="1" y1="0" x2="0" y2="1"><stop offset="0" stopColor={m.hi} /><stop offset=".5" stopColor={m.mid} /><stop offset="1" stopColor={m.lo} /></linearGradient>
        <linearGradient id={`${id}-s`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={s.a} /><stop offset=".55" stopColor={s.b} /><stop offset="1" stopColor={s.c} /></linearGradient>
        <linearGradient id={`${id}-sh`} x1="0" x2="1"><stop offset="0" stopColor="#fff" stopOpacity="0" /><stop offset=".5" stopColor="#fff" stopOpacity=".9" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></linearGradient>
        <radialGradient id={`${id}-g`}><stop offset="0" stopColor="#fff" stopOpacity=".9" /><stop offset="1" stopColor="#fff" stopOpacity="0" /></radialGradient>
        <clipPath id={`${id}-c`}>{rs === "heart" ? <path d="M60 50 C 40 38 32 26 36 18 C 40 9 54 9 60 18 C 66 9 80 9 84 18 C 88 26 80 38 60 50 Z" /> : <polygon points="34,28 46,14 74,14 86,28 60,54" />}</clipPath>
      </defs>
      <ellipse cx={60} cy={86} rx={36} ry={38} fill="none" stroke={m.lo} strokeWidth={6} />
      <path d="M24 86 A36 38 0 0 0 96 86" fill="none" stroke={`url(#${id}-m)`} strokeWidth={rs === "band" ? 10 : 7} strokeLinecap="round" />
      <path d="M24 86 A36 38 0 0 1 96 86" fill="none" stroke={`url(#${id}-m2)`} strokeWidth={rs === "band" ? 10 : 6.5} strokeLinecap="round" />
      <path d="M30 98 A32 32 0 0 0 54 120" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth={1.6} strokeLinecap="round" />
      {rs === "band" &&
        Array.from({ length: 7 }, (_, i) => {
          const a = Math.PI + (i + 1) * (Math.PI / 8);
          return <circle key={i} cx={60 + Math.cos(a) * 36} cy={86 + Math.sin(a) * 38} r={2.6} fill={`url(#${id}-s)`} stroke="#fff" strokeOpacity=".7" strokeWidth={0.6} />;
        })}
      {(rs === "solitaire" || rs === "halo") && (
        <g>
          <path d="M42 50 Q60 58 78 50 L72 45 Q60 49 48 45 Z" fill={`url(#${id}-m)`} />
          <path d="M46 46 L40 26 M74 46 L80 26 M53 48 L50 27 M67 48 L70 27" stroke={`url(#${id}-m)`} strokeWidth={2.4} strokeLinecap="round" />
          {rs === "halo" &&
            Array.from({ length: 16 }, (_, i) => {
              const a = (i / 16) * Math.PI * 2;
              return <circle key={i} cx={60 + Math.cos(a) * 31} cy={30 + Math.sin(a) * 22} r={2.2} fill="#F4FAFF" stroke={m.mid} strokeWidth={0.6} />;
            })}
          {gem}
          <g clipPath={`url(#${id}-c)`}><rect x={20} y={8} width={30} height={50} fill={`url(#${id}-sh)`} className={sparkle ? "sk-glint" : undefined} /></g>
        </g>
      )}
      {rs === "heart" && (
        <g>
          <path d="M46 50 Q60 58 74 50 L70 45 Q60 49 50 45 Z" fill={`url(#${id}-m)`} />
          <path d="M60 50 C 40 38 32 26 36 18 C 40 9 54 9 60 18 C 66 9 80 9 84 18 C 88 26 80 38 60 50 Z" fill={s.b} stroke={`url(#${id}-m)`} strokeWidth={1.6} />
          <g clipPath={`url(#${id}-c)`} stroke={s.facet} strokeWidth={0.6}>
            <polygon points="30,10 60,18 60,30 36,22" fill={s.a} />
            <polygon points="60,18 90,10 84,22 60,30" fill={s.c} />
            <polygon points="36,22 60,30 44,40" fill={s.b} />
            <polygon points="84,22 76,40 60,30" fill={s.c} />
            <polygon points="44,40 60,30 60,52" fill={s.a} />
            <polygon points="60,30 76,40 60,52" fill={s.c} />
            <polygon points="46,16 56,18 54,24 44,22" fill={s.hi} />
            <rect x={20} y={6} width={30} height={50} fill={`url(#${id}-sh)`} className={sparkle ? "sk-glint" : undefined} />
          </g>
        </g>
      )}
      {sparkle && <circle cx={60} cy={rs === "band" ? 50 : 26} r={22} fill={`url(#${id}-g)`} opacity=".5" />}
    </svg>
  );
}

/** The open velvet box (viewBox 200×150). The ring rests in the cushion slit at (100, 92). */
export function VelvetBox({ id, children }: { id: string; children?: ReactNode }) {
  return (
    <svg viewBox="0 0 200 150" style={{ display: "block", width: "100%", height: "auto", overflow: "visible" }} aria-hidden>
      <defs>
        <linearGradient id={`${id}-v`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#8A1838" /><stop offset=".6" stopColor="#5C0D24" /><stop offset="1" stopColor="#350615" /></linearGradient>
        <linearGradient id={`${id}-lid`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4A0A1D" /><stop offset="1" stopColor="#7A1532" /></linearGradient>
        <radialGradient id={`${id}-sat`} cx=".5" cy=".3" r=".8"><stop offset="0" stopColor="#FFF6F0" /><stop offset=".6" stopColor="#F1D9D2" /><stop offset="1" stopColor="#C9A7A0" /></radialGradient>
        <filter id={`${id}-n`}><feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="1" /><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .22 0" /><feComposite in2="SourceGraphic" operator="in" /></filter>
      </defs>
      {/* lid, swung open */}
      <path d="M28 64 L40 6 Q100 -4 160 6 L172 64 Z" fill={`url(#${id}-lid)`} />
      <path d="M40 14 Q100 4 160 14 L166 58 L34 58 Z" fill={`url(#${id}-sat)`} opacity=".9" />
      <path d="M28 64 L40 6 Q100 -4 160 6 L172 64 Z" fill="#000" filter={`url(#${id}-n)`} opacity=".6" />
      {/* body */}
      <rect x={18} y={62} width={164} height={80} rx={14} fill={`url(#${id}-v)`} />
      <rect x={18} y={62} width={164} height={80} rx={14} fill="#000" filter={`url(#${id}-n)`} opacity=".7" />
      <path d="M30 70 Q100 60 170 70 L168 110 Q100 120 32 110 Z" fill={`url(#${id}-sat)`} />
      <path d="M70 92 Q100 86 130 92" stroke="#9C7A72" strokeWidth={3} strokeLinecap="round" fill="none" />
      <rect x={18} y={62} width={164} height={6} rx={3} fill="#E6C27A" opacity=".85" />
      {children}
    </svg>
  );
}

const TONES: Record<HandTone, { base: string; shade: string; nail: string; line: string }> = {
  light: { base: "#F3D2BC", shade: "#E2B79C", nail: "#FBE4DA", line: "#C99A7E" },
  medium: { base: "#D9A27C", shade: "#C38A64", nail: "#EFC3AE", line: "#A6714E" },
  tan: { base: "#B07A52", shade: "#97653F", nail: "#D49F86", line: "#7E5233" },
  deep: { base: "#6E4630", shade: "#5A3725", nail: "#9C6E5A", line: "#40261A" },
};

/** Their left hand, back view, fingers up (viewBox 240×300). The ring sits on the ring finger at (101, 168). */
export function Hand({ tone, ringOn, stone, id }: { tone: HandTone; ringOn: boolean; stone: Stone; id: string }) {
  const t = TONES[tone];
  const m = metal(stone);
  const finger = (x: number, y: number, w: number, h: number, rot = 0, key = "") => (
    <g key={key} transform={`rotate(${rot} ${x + w / 2} ${y + h})`}>
      <rect x={x} y={y} width={w} height={h} rx={w / 2} fill={`url(#${id}-skin)`} stroke={t.line} strokeWidth={1.4} />
      <rect x={x + w * 0.2} y={y + 6} width={w * 0.6} height={w * 0.7} rx={w * 0.3} fill={t.nail} opacity=".85" />
      <path d={`M${x + w * 0.25} ${y + h * 0.42} q${w * 0.25} 4 ${w * 0.5} 0`} stroke={t.line} strokeWidth={1.1} fill="none" opacity=".6" />
    </g>
  );
  return (
    <svg viewBox="0 0 240 300" style={{ display: "block", width: "100%", height: "auto", overflow: "visible" }} role="img" aria-label="Their hand, waiting for the ring">
      <defs>
        <linearGradient id={`${id}-skin`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={t.shade} /><stop offset=".45" stopColor={t.base} /><stop offset="1" stopColor={t.shade} /></linearGradient>
        <linearGradient id={`${id}-band`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor={m.lo} /><stop offset=".5" stopColor={m.hi} /><stop offset="1" stopColor={m.lo} /></linearGradient>
      </defs>
      {/* wrist + palm */}
      <path d="M58 300 L56 200 Q54 158 86 150 L180 150 Q206 158 204 198 L198 300 Z" fill={`url(#${id}-skin)`} stroke={t.line} strokeWidth={1.4} />
      {/* thumb */}
      <g transform="rotate(30 210 236)"><rect x={194} y={150} width={34} height={96} rx={17} fill={`url(#${id}-skin)`} stroke={t.line} strokeWidth={1.4} /><rect x={201} y={156} width={20} height={22} rx={10} fill={t.nail} opacity=".85" /></g>
      {finger(52, 118, 30, 96, -7, "p")}
      {ringOn && <path d="M84 168 Q101 160 118 168" stroke={m.lo} strokeWidth={6} fill="none" strokeLinecap="round" />}
      {finger(84, 70, 34, 148, -2, "r")}
      {finger(122, 54, 35, 162, 1, "m")}
      {finger(160, 78, 32, 140, 7, "i")}
      {/* the sleeve cuff the wrist disappears into */}
      <path d="M40 262 Q128 248 216 262 L222 300 L34 300 Z" fill="#3A1238" />
      <path d="M40 262 Q128 248 216 262" stroke="#E6C27A" strokeWidth={2} fill="none" opacity=".7" />
      {/* knuckle shading */}
      <path d="M70 176 Q128 166 190 178" stroke={t.line} strokeWidth={1.2} fill="none" opacity=".35" />
      {ringOn ? (
        <g>
          <path d="M83 168 Q101 178 119 168" stroke={`url(#${id}-band)`} strokeWidth={7} fill="none" strokeLinecap="round" />
          <circle cx={101} cy={160} r={9} fill={STONES[stone].a} stroke={m.mid} strokeWidth={2} className="sk-onGem" />
        </g>
      ) : (
        <ellipse className="sk-target" cx={101} cy={170} rx={21} ry={6} fill="none" stroke="#FFD27A" strokeWidth={2} strokeDasharray="4 4" />
      )}
    </svg>
  );
}

export function Candle({ lit, h = 1 }: { lit: boolean; h?: number }) {
  return (
    <span className={`sk-candle${lit ? " is-lit" : ""}`} style={{ ["--ch" as string]: h }} aria-hidden>
      <span className="sk-glow" />
      <span className="sk-flame"><i /></span>
      <span className="sk-wick" />
      <span className="sk-wax" />
      <span className="sk-holder" />
    </span>
  );
}
