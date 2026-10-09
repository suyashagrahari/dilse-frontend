// The night's cast, drawn as puffy SVG stickers: everything has round shapes,
// a soft highlight, a darker outline and blush cheeks (research §C3, §D9 —
// cute-spooky, never scary: no skulls, no blood, no sharp teeth).
// Pure SVG with no ids that could collide (gradients are namespaced with a
// per-instance key), transform/opacity-only animation in the scenes' CSS.

import { useId, type CSSProperties } from "react";
import { BN } from "./model";

const INK = BN.ink;

/** A heart centred on (cx, cy) about `s` wide. */
export function heartPath(cx: number, cy: number, s: number): string {
  const k = s / 100;
  const p = (x: number, y: number) => `${(cx + (x - 50) * k).toFixed(1)} ${(cy + (y - 50) * k).toFixed(1)}`;
  return `M${p(50, 88)} C${p(20, 66)} ${p(2, 46)} ${p(10, 26)} C${p(18, 8)} ${p(42, 8)} ${p(50, 26)} C${p(58, 8)} ${p(82, 8)} ${p(90, 26)} C${p(98, 46)} ${p(80, 66)} ${p(50, 88)} Z`;
}

function starPath(cx: number, cy: number, r: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.48 : r;
    pts.push(`${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr).toFixed(1)}`);
  }
  return `M${pts.join(" L")} Z`;
}

// ── Ghost ────────────────────────────────────────────────────────────────────
export type GhostMood = "happy" | "boo" | "wink" | "kiss" | "shy";

export function Ghost({ size = 120, mood = "happy", hold, style, className, tint = "#FFFFFF" }: { size?: number; mood?: GhostMood; hold?: "letter" | "heart"; style?: CSSProperties; className?: string; tint?: string }) {
  return (
    <svg viewBox="0 0 120 132" width={size} height={size * 1.1} style={style} className={className} aria-hidden>
      <ellipse cx="60" cy="126" rx="34" ry="5" fill="rgba(20,10,40,.22)" />
      <path
        d="M60 6 C27 6 12 33 12 62 L12 110 Q20 101 28 110 Q36 119 44 110 Q52 101 60 110 Q68 119 76 110 Q84 101 92 110 Q100 119 108 110 L108 62 C108 33 93 6 60 6 Z"
        fill={tint}
        stroke="#E3D6F7"
        strokeWidth="3"
      />
      <path d="M30 40 C34 24 46 16 58 15" stroke="#fff" strokeWidth="5" strokeLinecap="round" fill="none" opacity=".9" />
      {/* arms */}
      <path d="M13 70 Q2 76 6 86" stroke="#E3D6F7" strokeWidth="3" fill={tint} strokeLinecap="round" />
      <path d="M107 70 Q118 76 114 86" stroke="#E3D6F7" strokeWidth="3" fill={tint} strokeLinecap="round" />
      {/* eyes */}
      {mood === "wink" ? (
        <>
          <path d="M37 58 Q44 52 51 58" stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />
          <ellipse cx="76" cy="57" rx="6" ry="8" fill={INK} />
          <circle cx="78.5" cy="53.5" r="2.2" fill="#fff" />
        </>
      ) : mood === "shy" || mood === "kiss" ? (
        <>
          <path d="M37 58 Q44 63 51 58" stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M69 58 Q76 63 83 58" stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <ellipse cx="44" cy="57" rx="6" ry={mood === "boo" ? 9 : 8} fill={INK} />
          <ellipse cx="76" cy="57" rx="6" ry={mood === "boo" ? 9 : 8} fill={INK} />
          <circle cx="46.5" cy="53.5" r="2.2" fill="#fff" />
          <circle cx="78.5" cy="53.5" r="2.2" fill="#fff" />
        </>
      )}
      <ellipse cx="33" cy="71" rx="8" ry="4.5" fill={BN.pink} opacity=".85" />
      <ellipse cx="87" cy="71" rx="8" ry="4.5" fill={BN.pink} opacity=".85" />
      {mood === "boo" ? (
        <>
          <ellipse cx="60" cy="77" rx="7" ry="9" fill={INK} />
          <ellipse cx="60" cy="82" rx="4" ry="3" fill={BN.pinkDeep} />
        </>
      ) : mood === "kiss" ? (
        <path d="M57 72 Q63 74 59 77 Q64 79 57 82" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
      ) : (
        <path d="M53 73 Q60 80 67 73" stroke={INK} strokeWidth="3.5" fill="none" strokeLinecap="round" />
      )}
      {hold === "letter" && (
        <g transform="translate(36 84) rotate(-6)">
          <rect x="0" y="0" width="48" height="32" rx="4" fill={BN.cream} stroke={BN.orangeDeep} strokeWidth="2.5" />
          <path d="M2 3 L24 18 L46 3" stroke={BN.orangeDeep} strokeWidth="2.5" fill="none" strokeLinejoin="round" />
          <path d={heartPath(24, 22, 14)} fill={BN.pinkDeep} />
        </g>
      )}
      {hold === "heart" && <path d={heartPath(60, 96, 34)} fill={BN.pinkDeep} stroke="#fff" strokeWidth="2.5" />}
    </svg>
  );
}

// ── Bat ──────────────────────────────────────────────────────────────────────
export function Bat({ size = 120, carry, style, className }: { size?: number; carry?: "scroll" | "heart"; style?: CSSProperties; className?: string }) {
  return (
    <svg viewBox="0 0 160 112" width={size} height={size * 0.7} style={style} className={className} aria-hidden>
      <g className="bn-wingL" style={{ transformOrigin: "62px 50px" }}>
        <path d="M62 44 Q42 14 6 30 Q20 38 18 52 Q30 45 36 58 Q44 48 62 56 Z" fill="#3A2E66" stroke={BN.lilac} strokeWidth="3" strokeLinejoin="round" />
      </g>
      <g className="bn-wingR" style={{ transformOrigin: "98px 50px" }}>
        <path d="M98 44 Q118 14 154 30 Q140 38 142 52 Q130 45 124 58 Q116 48 98 56 Z" fill="#3A2E66" stroke={BN.lilac} strokeWidth="3" strokeLinejoin="round" />
      </g>
      <path d="M64 30 L66 12 L76 26 Z" fill="#3A2E66" stroke={BN.lilac} strokeWidth="3" strokeLinejoin="round" />
      <path d="M96 30 L94 12 L84 26 Z" fill="#3A2E66" stroke={BN.lilac} strokeWidth="3" strokeLinejoin="round" />
      <path d="M67 26 L68 18 L73 25 Z" fill={BN.pink} />
      <path d="M93 26 L92 18 L87 25 Z" fill={BN.pink} />
      <circle cx="80" cy="48" r="23" fill="#3A2E66" stroke={BN.lilac} strokeWidth="3" />
      <circle cx="71" cy="44" r="7" fill="#fff" />
      <circle cx="89" cy="44" r="7" fill="#fff" />
      <circle cx="72" cy="45" r="4" fill={INK} />
      <circle cx="88" cy="45" r="4" fill={INK} />
      <circle cx="73.4" cy="43.4" r="1.5" fill="#fff" />
      <circle cx="89.4" cy="43.4" r="1.5" fill="#fff" />
      <ellipse cx="65" cy="55" rx="5" ry="3" fill={BN.pink} opacity=".9" />
      <ellipse cx="95" cy="55" rx="5" ry="3" fill={BN.pink} opacity=".9" />
      <path d="M75 56 Q80 61 85 56" stroke="#fff" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M78 58 L79.5 62 L81 58" fill="#fff" />
      {carry === "scroll" && (
        <g transform="translate(58 70)">
          <path d="M20 2 L22 -4" stroke={BN.lilac} strokeWidth="3" strokeLinecap="round" />
          <rect x="0" y="2" width="44" height="30" rx="6" fill={BN.cream} stroke="#D9B98A" strokeWidth="2.5" />
          <rect x="-3" y="0" width="8" height="34" rx="4" fill="#F2D7A6" stroke="#D9B98A" strokeWidth="2" />
          <rect x="39" y="0" width="8" height="34" rx="4" fill="#F2D7A6" stroke="#D9B98A" strokeWidth="2" />
          <rect x="18" y="2" width="6" height="30" fill={BN.pinkDeep} />
          <path d={heartPath(21, 17, 14)} fill={BN.pinkDeep} stroke="#fff" strokeWidth="1.5" />
        </g>
      )}
      {carry === "heart" && <path d={heartPath(80, 88, 30)} fill={BN.pinkDeep} stroke="#fff" strokeWidth="2" />}
    </svg>
  );
}

// ── Mailbox ──────────────────────────────────────────────────────────────────
export function Mailbox({ open, size = 220, style, className }: { open: boolean; size?: number; style?: CSSProperties; className?: string }) {
  const k = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 220 260" width={size} height={size * (260 / 220)} style={style} className={className} aria-hidden>
      <defs>
        <linearGradient id={`mb-${k}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFB76B" />
          <stop offset="1" stopColor={BN.orange} />
        </linearGradient>
      </defs>
      <ellipse cx="110" cy="248" rx="70" ry="9" fill="rgba(20,10,40,.25)" />
      <rect x="99" y="140" width="22" height="108" rx="8" fill={BN.lilacDeep} stroke="#6E52C4" strokeWidth="3" />
      <rect x="103" y="146" width="6" height="96" rx="3" fill="#B39BFF" opacity=".7" />
      {/* flag */}
      <g className={open ? "bn-flagUp" : "bn-flag"} style={{ transformOrigin: "186px 112px" }}>
        <rect x="182" y="70" width="8" height="46" rx="4" fill={BN.pinkDeep} />
        <path d="M186 70 L212 70 Q216 70 216 74 L216 88 Q216 92 212 92 L186 92 Z" fill={BN.pinkDeep} stroke="#D04E89" strokeWidth="2" />
        <path d={heartPath(201, 81, 12)} fill="#fff" />
      </g>
      {/* box */}
      <path d="M26 86 Q26 36 110 36 Q194 36 194 86 L194 140 Q194 150 184 150 L36 150 Q26 150 26 140 Z" fill={`url(#mb-${k})`} stroke={BN.orangeDeep} strokeWidth="4" />
      <path d="M44 66 Q60 46 92 44" stroke="#fff" strokeWidth="6" strokeLinecap="round" fill="none" opacity=".55" />
      {/* inside (seen when the door is down) */}
      <path d="M48 88 Q48 60 110 60 Q172 60 172 88 L172 140 L48 140 Z" fill="#2A1F3D" />
      {/* door: hinged at the bottom, flips down */}
      <g className={open ? "bn-doorOpen" : "bn-door"} style={{ transformOrigin: "110px 140px", transformBox: "view-box" }}>
        <path d="M48 88 Q48 60 110 60 Q172 60 172 88 L172 140 L48 140 Z" fill="#FFC889" stroke={BN.orangeDeep} strokeWidth="3.5" />
        <ellipse cx="90" cy="98" rx="5.5" ry="7.5" fill={INK} />
        <ellipse cx="130" cy="98" rx="5.5" ry="7.5" fill={INK} />
        <circle cx="92" cy="95" r="2" fill="#fff" />
        <circle cx="132" cy="95" r="2" fill="#fff" />
        <ellipse cx="78" cy="112" rx="8" ry="4.5" fill={BN.pink} />
        <ellipse cx="142" cy="112" rx="8" ry="4.5" fill={BN.pink} />
        <path d="M102 112 Q110 120 118 112" stroke={INK} strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <rect x="100" y="126" width="20" height="8" rx="4" fill={BN.orangeDeep} />
      </g>
      {/* pumpkins + grass at the foot */}
      <path d="M40 248 Q48 232 56 248 M60 248 Q66 236 72 248 M150 248 Q156 234 162 248 M166 248 Q172 238 178 248" stroke={BN.mint} strokeWidth="4" strokeLinecap="round" fill="none" />
      <g transform="translate(58 222)">
        <ellipse cx="0" cy="12" rx="17" ry="13" fill={BN.orange} stroke={BN.orangeDeep} strokeWidth="2.5" />
        <path d="M0 0 Q2 -6 6 -8" stroke="#4E8F62" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <path d="M-6 11 Q-4 13 -2 11 M2 11 Q4 13 6 11" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
      <g transform="translate(166 228) scale(.75)">
        <ellipse cx="0" cy="12" rx="17" ry="13" fill={BN.orange} stroke={BN.orangeDeep} strokeWidth="2.5" />
        <path d="M0 0 Q2 -6 6 -8" stroke="#4E8F62" strokeWidth="3.5" strokeLinecap="round" fill="none" />
        <path d={heartPath(-6, 10, 7)} fill={INK} />
        <path d={heartPath(6, 10, 7)} fill={INK} />
      </g>
    </svg>
  );
}

// ── Treat bucket ─────────────────────────────────────────────────────────────
export function Bucket({ size = 200, empty, style, className }: { size?: number; empty?: boolean; style?: CSSProperties; className?: string }) {
  const k = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} style={style} className={className} aria-hidden>
      <defs>
        <radialGradient id={`bk-${k}`} cx="40%" cy="35%" r="70%">
          <stop offset="0" stopColor="#FFC07A" />
          <stop offset=".6" stopColor={BN.orange} />
          <stop offset="1" stopColor="#E9741F" />
        </radialGradient>
      </defs>
      <ellipse cx="100" cy="190" rx="64" ry="8" fill="rgba(20,10,40,.25)" />
      <path d="M38 78 Q100 -6 162 78" stroke={INK} strokeWidth="7" fill="none" strokeLinecap="round" />
      {!empty && (
        <g>
          <circle cx="78" cy="70" r="13" fill={BN.pink} stroke="#fff" strokeWidth="3" />
          <circle cx="104" cy="62" r="14" fill={BN.mint} stroke="#fff" strokeWidth="3" />
          <circle cx="128" cy="70" r="12" fill={BN.lilac} stroke="#fff" strokeWidth="3" />
          <path d="M92 52 l-8 -8 M116 52 l8 -8" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        </g>
      )}
      <path d="M26 112 C26 76 60 70 100 70 C140 70 174 76 174 112 C174 160 146 184 100 184 C54 184 26 160 26 112 Z" fill={`url(#bk-${k})`} stroke={BN.orangeDeep} strokeWidth="4" />
      <ellipse cx="100" cy="76" rx="70" ry="10" fill="#E9741F" stroke={BN.orangeDeep} strokeWidth="3" />
      <path d="M48 104 Q54 92 66 90" stroke="#fff" strokeWidth="5" strokeLinecap="round" fill="none" opacity=".55" />
      <path d={heartPath(74, 116, 26)} fill={INK} />
      <path d={heartPath(126, 116, 26)} fill={INK} />
      <path d="M70 146 Q100 168 130 146 Q100 156 70 146 Z" fill={INK} stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      <ellipse cx="58" cy="140" rx="9" ry="5" fill={BN.pink} opacity=".8" />
      <ellipse cx="142" cy="140" rx="9" ry="5" fill={BN.pink} opacity=".8" />
    </svg>
  );
}

// ── Candy ────────────────────────────────────────────────────────────────────
export const CANDY_COLORS = [BN.pink, BN.mint, BN.lilac, BN.candle, "#FFB27A"] as const;

export function Candy({ color = BN.pink, size = 64, style, className }: { color?: string; size?: number; style?: CSSProperties; className?: string }) {
  return (
    <svg viewBox="0 0 100 60" width={size} height={size * 0.6} style={style} className={className} aria-hidden>
      <path d="M26 30 L4 12 Q2 30 4 48 Z" fill={color} stroke="#fff" strokeWidth="3" strokeLinejoin="round" />
      <path d="M74 30 L96 12 Q98 30 96 48 Z" fill={color} stroke="#fff" strokeWidth="3" strokeLinejoin="round" />
      <ellipse cx="50" cy="30" rx="27" ry="22" fill={color} stroke="#fff" strokeWidth="3.5" />
      <path d="M34 16 Q42 30 34 44 M50 9 Q58 30 50 51 M66 16 Q74 30 66 44" stroke="#fff" strokeWidth="4" fill="none" opacity=".7" strokeLinecap="round" />
      <ellipse cx="40" cy="20" rx="6" ry="3" fill="#fff" opacity=".8" />
    </svg>
  );
}

// ── Pumpkin (carvable) ───────────────────────────────────────────────────────
export type EyeStyle = "hearts" | "stars" | "happy";
export type MouthStyle = "grin" | "smile" | "kiss";

const EYES: Record<EyeStyle, (cx: number, cy: number) => string> = {
  hearts: (cx, cy) => heartPath(cx, cy, 44),
  stars: (cx, cy) => starPath(cx, cy + 2, 22),
  happy: (cx, cy) => `M${cx - 20} ${cy + 8} Q${cx} ${cy - 22} ${cx + 20} ${cy + 8} Q${cx} ${cy - 6} ${cx - 20} ${cy + 8} Z`,
};
const MOUTHS: Record<MouthStyle, string> = {
  grin: "M88 186 Q150 246 212 186 L198 189 L188 204 L174 195 L162 210 L150 199 L138 210 L126 195 L112 204 L102 189 Z",
  smile: "M100 188 Q150 232 200 188 Q150 210 100 188 Z",
  kiss: heartPath(150, 202, 40),
};

export function Pumpkin({ eyes, mouth, lit, size = 280, style, className }: { eyes: EyeStyle | null; mouth: MouthStyle | null; lit: boolean; size?: number; style?: CSSProperties; className?: string }) {
  const k = useId().replace(/:/g, "");
  const hole = lit ? `url(#pg-${k})` : "#5A2508";
  return (
    <svg viewBox="0 0 300 290" width={size} height={size * (290 / 300)} style={style} className={className} aria-hidden>
      <defs>
        <radialGradient id={`pb-${k}`} cx="42%" cy="34%" r="75%">
          <stop offset="0" stopColor="#FFB86E" />
          <stop offset=".55" stopColor={BN.orange} />
          <stop offset="1" stopColor="#E06A12" />
        </radialGradient>
        <radialGradient id={`pg-${k}`} cx="50%" cy="50%" r="60%">
          <stop offset="0" stopColor="#FFF6C2" />
          <stop offset=".6" stopColor="#FFD86B" />
          <stop offset="1" stopColor="#FFA93A" />
        </radialGradient>
      </defs>
      <ellipse cx="150" cy="280" rx="110" ry="9" fill="rgba(20,10,40,.25)" />
      <path d="M150 58 C146 40 150 26 164 16" stroke="#4E8F62" strokeWidth="13" strokeLinecap="round" fill="none" />
      <path d="M158 34 C178 20 196 28 200 44" stroke={BN.mint} strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M200 44 Q212 40 214 52 Q204 56 200 44 Z" fill={BN.mint} />
      <ellipse cx="94" cy="168" rx="70" ry="110" fill="#E06A12" />
      <ellipse cx="206" cy="168" rx="70" ry="110" fill="#E06A12" />
      <ellipse cx="150" cy="168" rx="126" ry="112" fill={`url(#pb-${k})`} stroke="#D2600F" strokeWidth="4" />
      <ellipse cx="110" cy="168" rx="58" ry="108" fill="none" stroke="rgba(170,70,10,.32)" strokeWidth="3.5" />
      <ellipse cx="190" cy="168" rx="58" ry="108" fill="none" stroke="rgba(170,70,10,.32)" strokeWidth="3.5" />
      <ellipse cx="100" cy="104" rx="16" ry="30" fill="#FFE0B8" opacity=".45" transform="rotate(20 100 104)" />
      {/* cheeks always there: it's a cute pumpkin */}
      <ellipse cx="72" cy="186" rx="15" ry="8" fill={BN.pink} opacity=".75" />
      <ellipse cx="228" cy="186" rx="15" ry="8" fill={BN.pink} opacity=".75" />
      {/* dotted guides before carving */}
      {!eyes && (
        <g stroke="#B34D0A" strokeWidth="3" strokeDasharray="6 7" fill="none" className="bn-ants">
          <circle cx="108" cy="132" r="22" />
          <circle cx="192" cy="132" r="22" />
        </g>
      )}
      {!mouth && <path d="M100 196 Q150 230 200 196" stroke="#B34D0A" strokeWidth="3" strokeDasharray="6 7" fill="none" className="bn-ants" />}
      {eyes && (
        <g className="bn-carved">
          <path d={EYES[eyes](108, 130)} fill={hole} stroke="#B34D0A" strokeWidth="2.5" strokeLinejoin="round" />
          <path d={EYES[eyes](192, 130)} fill={hole} stroke="#B34D0A" strokeWidth="2.5" strokeLinejoin="round" />
        </g>
      )}
      {eyes && mouth && <path className="bn-carved" d={heartPath(150, 166, 22)} fill={hole} stroke="#B34D0A" strokeWidth="2" />}
      {mouth && <path className="bn-carved" d={MOUTHS[mouth]} fill={hole} stroke="#B34D0A" strokeWidth="2.5" strokeLinejoin="round" />}
    </svg>
  );
}

/** Small preview tiles for the eye/mouth pickers. */
export function EyeIcon({ kind }: { kind: EyeStyle }) {
  return (
    <svg viewBox="0 0 120 60" width="64" height="32" aria-hidden>
      <path d={EYES[kind](32, 30)} fill="#FFB13D" stroke="#B34D0A" strokeWidth="3" transform="translate(16 15) scale(.5)" />
      <path d={EYES[kind](32, 30)} fill="#FFB13D" stroke="#B34D0A" strokeWidth="3" transform="translate(56 15) scale(.5)" />
    </svg>
  );
}
export function MouthIcon({ kind }: { kind: MouthStyle }) {
  return (
    <svg viewBox="80 150 140 100" width="64" height="44" aria-hidden>
      <path d={MOUTHS[kind]} fill="#FFB13D" stroke="#B34D0A" strokeWidth="4" strokeLinejoin="round" />
    </svg>
  );
}

// ── Cauldron + bottles ───────────────────────────────────────────────────────
export function Cauldron({ liquid = BN.mint, size = 240, style, className, happy }: { liquid?: string; size?: number; style?: CSSProperties; className?: string; happy?: boolean }) {
  return (
    <svg viewBox="0 0 240 210" width={size} height={size * (210 / 240)} style={style} className={className} aria-hidden>
      <ellipse cx="120" cy="200" rx="86" ry="8" fill="rgba(20,10,40,.28)" />
      <path d="M62 170 L50 198 M178 170 L190 198" stroke="#2A1F3D" strokeWidth="10" strokeLinecap="round" />
      <path d="M30 86 C30 150 64 186 120 186 C176 186 210 150 210 86 Z" fill="#3A2E66" stroke={BN.lilac} strokeWidth="4" />
      <path d="M48 104 Q56 140 86 160" stroke="#fff" strokeWidth="6" strokeLinecap="round" fill="none" opacity=".25" />
      <ellipse cx="120" cy="86" rx="98" ry="22" fill="#2A1F3D" stroke={BN.lilac} strokeWidth="4" />
      <ellipse cx="120" cy="88" rx="84" ry="15" fill={liquid} style={{ transition: "fill .8s ease" }} />
      <ellipse cx="96" cy="84" rx="20" ry="4" fill="#fff" opacity=".45" />
      {/* face */}
      {happy ? (
        <>
          <path d="M92 128 Q100 120 108 128" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" />
          <path d="M132 128 Q140 120 148 128" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <ellipse cx="100" cy="128" rx="6" ry="8" fill="#fff" />
          <ellipse cx="140" cy="128" rx="6" ry="8" fill="#fff" />
          <circle cx="101" cy="130" r="3.5" fill={INK} />
          <circle cx="141" cy="130" r="3.5" fill={INK} />
        </>
      )}
      <ellipse cx="86" cy="144" rx="9" ry="5" fill={BN.pink} opacity=".9" />
      <ellipse cx="154" cy="144" rx="9" ry="5" fill={BN.pink} opacity=".9" />
      <path d="M112 146 Q120 154 128 146" stroke="#fff" strokeWidth="3.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export const BOTTLE_COLORS = [BN.lilac, BN.pink, BN.mint] as const;
export function Bottle({ color, size = 70, style, className }: { color: string; size?: number; style?: CSSProperties; className?: string }) {
  return (
    <svg viewBox="0 0 70 96" width={size} height={size * (96 / 70)} style={style} className={className} aria-hidden>
      <rect x="25" y="2" width="20" height="14" rx="4" fill="#C98A4B" stroke="#8A5A2B" strokeWidth="2.5" />
      <rect x="27" y="14" width="16" height="18" fill="#EAF6FF" stroke="#fff" strokeWidth="2.5" />
      <circle cx="35" cy="60" r="31" fill="#EAF6FF" stroke="#fff" strokeWidth="3.5" />
      <path d="M6 64 A29 29 0 0 0 64 64 Q50 56 35 62 Q20 68 6 64 Z" fill={color} />
      <ellipse cx="22" cy="48" rx="6" ry="9" fill="#fff" opacity=".8" transform="rotate(20 22 48)" />
      <path d={heartPath(35, 74, 16)} fill="#fff" opacity=".9" />
    </svg>
  );
}

// ── Moon (turns into a heart on the YES) ─────────────────────────────────────
export function Moon({ heart, size = 110, style, className }: { heart: boolean; size?: number; style?: CSSProperties; className?: string }) {
  return (
    <svg viewBox="0 0 120 120" width={size} height={size} style={style} className={className} aria-hidden>
      <g style={{ transition: "opacity 1.2s ease, transform 1.2s cubic-bezier(.34,1.56,.64,1)", opacity: heart ? 0 : 1, transform: heart ? "scale(.6)" : "scale(1)", transformOrigin: "60px 60px" }}>
        <circle cx="60" cy="60" r="46" fill="#FFF1C4" />
        <circle cx="42" cy="44" r="7" fill="#F5DE9A" />
        <circle cx="80" cy="78" r="9" fill="#F5DE9A" />
        <circle cx="76" cy="38" r="4" fill="#F5DE9A" />
        <path d="M40 62 Q46 67 52 62 M68 62 Q74 67 80 62" stroke={INK} strokeWidth="3" fill="none" strokeLinecap="round" />
        <ellipse cx="36" cy="72" rx="6" ry="3.5" fill={BN.pink} opacity=".8" />
        <ellipse cx="84" cy="72" rx="6" ry="3.5" fill={BN.pink} opacity=".8" />
        <path d="M56 74 Q60 78 64 74" stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </g>
      <g style={{ transition: "opacity 1s ease .3s, transform 1.4s cubic-bezier(.34,1.56,.64,1) .3s", opacity: heart ? 1 : 0, transform: heart ? "scale(1)" : "scale(.3)", transformOrigin: "60px 60px" }}>
        <path d={heartPath(60, 62, 104)} fill="#FF7FB5" stroke="#FFE1EE" strokeWidth="4" />
        <path d="M30 44 Q34 30 48 28" stroke="#fff" strokeWidth="6" strokeLinecap="round" fill="none" opacity=".7" />
      </g>
    </svg>
  );
}

// ── Spirit radio ─────────────────────────────────────────────────────────────
export function Radio({ needle, on, size = 260, style, className }: { needle: number; on: boolean; size?: number; style?: CSSProperties; className?: string }) {
  const nx = 138 + Math.max(0, Math.min(1, needle)) * 72;
  return (
    <svg viewBox="0 0 260 210" width={size} height={size * (210 / 260)} style={style} className={className} aria-hidden>
      <ellipse cx="130" cy="202" rx="100" ry="7" fill="rgba(20,10,40,.25)" />
      <path d="M176 52 L206 8" stroke={BN.lilac} strokeWidth="5" strokeLinecap="round" />
      <path d={starPath(208, 8, 10)} fill={on ? BN.candle : "#EADFFF"} stroke="#fff" strokeWidth="2" />
      <rect x="18" y="50" width="224" height="146" rx="36" fill={BN.pink} stroke="#E0619C" strokeWidth="4" />
      <rect x="30" y="62" width="200" height="16" rx="8" fill="#fff" opacity=".35" />
      {/* ghost-shaped speaker holes */}
      <g fill="#C24E86">
        {[0, 1, 2].map((r) =>
          [0, 1, 2].map((c) => (
            <path
              key={`${r}${c}`}
              d={`M${48 + c * 24} ${98 + r * 26} c0 -8 5 -12 9 -12 s9 4 9 12 v8 l-3 -2 l-3 2 l-3 -2 l-3 2 l-3 -2 l-3 2 z`}
            />
          )),
        )}
      </g>
      <rect x="130" y="92" width="92" height="42" rx="12" fill={on ? "#FFF6D6" : BN.cream} stroke="#E0619C" strokeWidth="3" style={{ transition: "fill .6s ease" }} />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
        <path key={i} d={`M${140 + i * 8} 100 v${i % 2 ? 6 : 10}`} stroke="#B98CA6" strokeWidth="2" strokeLinecap="round" />
      ))}
      <path d={heartPath(197, 120, 12)} fill={BN.pinkDeep} />
      <path d={`M${nx} 96 V130`} stroke={BN.orangeDeep} strokeWidth="4" strokeLinecap="round" style={{ transition: "d .1s linear" }} />
      <circle cx="152" cy="164" r="14" fill={BN.lilac} stroke="#8E6FE0" strokeWidth="3" />
      <circle cx="200" cy="164" r="14" fill={BN.lilac} stroke="#8E6FE0" strokeWidth="3" />
      <path d="M152 154 v8 M200 154 v8" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      <ellipse cx="44" cy="180" rx="9" ry="5" fill="#fff" opacity=".35" />
    </svg>
  );
}
