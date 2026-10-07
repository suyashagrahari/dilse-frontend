"use client";

// ─── Kiss Day — hand-drawn SVG art ───────────────────────────────────────────
//
// Everything the day draws itself: the lipstick print, the family-safe
// "smooch heart" (cute mode), the envelope, a bullet lipstick, the heart jar,
// a chubby bear cub (cute-mode first kiss), the Kiss-Cam fallback couple.
// Pure SVG, no images, so it is crisp at any DPR and costs no requests.

import { useId, type CSSProperties } from "react";

export type KissStyle = "cute" | "lipstick";

export const SHADES = {
  ruby: { name: "Ruby Red", hex: "#D1123F", deep: "#8A0B2A", hi: "#FF5C7E" },
  gulabi: { name: "Gulabi Pink", hex: "#F0568C", deep: "#B42A62", hi: "#FF9DBE" },
  berry: { name: "Berry Wine", hex: "#8E1546", deep: "#560B29", hi: "#C9467A" },
} as const;
export type ShadeId = keyof typeof SHADES;
/** Cute mode always stamps a candy-pink heart. */
export const CUTE_PINK = { name: "Candy Pink", hex: "#FF5C8D", deep: "#C72E62", hi: "#FFB3CB" };

export function kissPalette(style: KissStyle, shade: ShadeId) {
  return style === "lipstick" ? SHADES[shade] ?? SHADES.ruby : CUTE_PINK;
}

// ── Lip print ────────────────────────────────────────────────────────────────

const UPPER =
  "M4 42 C14 30 30 14 46 16 C53 17 57 22 60 26 C63 22 67 17 74 16 C90 14 106 30 116 42 C100 41.5 86 39.5 74 41 C68 42 64 43 60 43 C56 43 52 42 46 41 C34 39.5 20 41.5 4 42 Z";
const LOWER = "M7 44.5 C24 44 40 45 60 45.5 C80 45 96 44 113 44.5 C104 63 84 78 60 78 C36 78 16 63 7 44.5 Z";
const CREASES = [
  "M28 24 Q30 31 28 38", "M38 19 Q40 28 38 37", "M50 22 Q51 30 50 38", "M70 22 Q69 30 70 38", "M82 19 Q80 28 82 37", "M92 24 Q90 31 92 38",
  "M26 52 Q29 61 32 70", "M40 50 Q42 62 44 74", "M53 50 Q54 63 54 76", "M67 50 Q66 63 66 76", "M80 50 Q78 62 76 74", "M94 52 Q91 61 88 70",
];

/** A lipstick print. `color` is the shade. viewBox 120×84. */
export function LipMark({ color, deep, size = 64, style, glossy = true }: { color: string; deep?: string; size?: number; style?: CSSProperties; glossy?: boolean }) {
  return (
    <svg viewBox="0 0 120 84" width={size} height={(size * 84) / 120} style={{ display: "block", overflow: "visible", ...style }} aria-hidden>
      <g opacity={0.94}>
        <path d={UPPER} fill={color} />
        <path d={LOWER} fill={color} />
      </g>
      <g stroke={deep ?? "#000"} strokeOpacity={0.28} strokeWidth={1.4} strokeLinecap="round" fill="none">
        {CREASES.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      {glossy && <ellipse cx={74} cy={58} rx={11} ry={4} fill="#fff" opacity={0.32} transform="rotate(-8 74 58)" />}
      {glossy && <ellipse cx={40} cy={26} rx={6} ry={2.4} fill="#fff" opacity={0.22} transform="rotate(-30 40 26)" />}
    </svg>
  );
}

// ── Smooch heart (cute, family-safe) ─────────────────────────────────────────

const HEART = "M50 88 C20 66 4 48 4 28 C4 13 16 4 29 4 C39 4 46 10 50 18 C54 10 61 4 71 4 C84 4 96 13 96 28 C96 48 80 66 50 88 Z";

/** A chubby heart with closed eyes, a kissy pout and blush. viewBox 100×92. */
export function SmoochHeart({ color, deep, hi, size = 60, style, face = true }: { color: string; deep?: string; hi?: string; size?: number; style?: CSSProperties; face?: boolean }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 100 92" width={size} height={(size * 92) / 100} style={{ display: "block", overflow: "visible", ...style }} aria-hidden>
      <defs>
        <radialGradient id={`sh${id}`} cx="35%" cy="28%" r="80%">
          <stop offset="0" stopColor={hi ?? "#FFB3CB"} />
          <stop offset="0.55" stopColor={color} />
          <stop offset="1" stopColor={deep ?? color} />
        </radialGradient>
      </defs>
      <path d={HEART} fill={`url(#sh${id})`} stroke={deep ?? color} strokeWidth={2} />
      <ellipse cx={27} cy={20} rx={9} ry={5} fill="#fff" opacity={0.55} transform="rotate(-28 27 20)" />
      {face && (
        <g stroke="#5A1430" strokeWidth={3} strokeLinecap="round" fill="none">
          <path d="M31 39 Q36 34 41 39" />
          <path d="M59 39 Q64 34 69 39" />
          <path d="M47 49 Q55 51 50 55 Q55 59 47 61" strokeWidth={2.8} />
        </g>
      )}
      {face && (
        <g fill="#FF8FB1" opacity={0.75}>
          <ellipse cx={28} cy={49} rx={6} ry={3.4} />
          <ellipse cx={72} cy={49} rx={6} ry={3.4} />
        </g>
      )}
    </svg>
  );
}

/** The day's kiss stamp in the chosen style. */
export function KissStamp({ kind, shade, size = 60, style, face }: { kind: KissStyle; shade: ShadeId; size?: number; style?: CSSProperties; face?: boolean }) {
  const p = kissPalette(kind, shade);
  return kind === "lipstick" ? (
    <LipMark color={p.hex} deep={p.deep} size={size} style={style} />
  ) : (
    <SmoochHeart color={p.hex} deep={p.deep} hi={p.hi} size={size * 0.86} style={style} face={face} />
  );
}

/** The same stamp as an SVG data URL — for the keepsake canvas. */
export function kissStampDataUrl(kind: KissStyle, shade: ShadeId): string {
  const p = kissPalette(kind, shade);
  const svg =
    kind === "lipstick"
      ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 84" width="240" height="168"><path d="${UPPER}" fill="${p.hex}" opacity=".94"/><path d="${LOWER}" fill="${p.hex}" opacity=".94"/><g stroke="${p.deep}" stroke-opacity=".28" stroke-width="1.4" fill="none" stroke-linecap="round">${CREASES.map((d) => `<path d="${d}"/>`).join("")}</g><ellipse cx="74" cy="58" rx="11" ry="4" fill="#fff" opacity=".32"/></svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 92" width="200" height="184"><path d="${HEART}" fill="${p.hex}" stroke="${p.deep}" stroke-width="2"/><ellipse cx="27" cy="20" rx="9" ry="5" fill="#fff" opacity=".55" transform="rotate(-28 27 20)"/><g stroke="#5A1430" stroke-width="3" stroke-linecap="round" fill="none"><path d="M31 39 Q36 34 41 39"/><path d="M59 39 Q64 34 69 39"/><path d="M47 49 Q55 51 50 55 Q55 59 47 61"/></g><g fill="#FF8FB1" opacity=".75"><ellipse cx="28" cy="49" rx="6" ry="3.4"/><ellipse cx="72" cy="49" rx="6" ry="3.4"/></g></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// ── Envelope ─────────────────────────────────────────────────────────────────

/** Back + flap of the pink envelope (the pocket front is EnvelopeFront). viewBox 300×200. */
export function EnvelopeBack({ open = false, style }: { open?: boolean; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 300 200" width="100%" style={{ display: "block", overflow: "visible", ...style }} aria-hidden>
      <defs>
        <linearGradient id="kd-env-back" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F7A9C1" />
          <stop offset="1" stopColor="#F28DAE" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="300" height="200" rx="14" fill="url(#kd-env-back)" />
      {open && <path d="M0 6 Q0 0 8 0 L292 0 Q300 0 300 6 L150 -96 Z" fill="#F6B3C8" stroke="#E98AAA" strokeWidth="1.5" />}
    </svg>
  );
}

export function EnvelopeFront({ closed = false, style }: { closed?: boolean; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 300 200" width="100%" style={{ display: "block", overflow: "visible", ...style }} aria-hidden>
      <defs>
        <linearGradient id="kd-env-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFD0DE" />
          <stop offset="1" stopColor="#FBB8CD" />
        </linearGradient>
        <pattern id="kd-env-dots" width="14" height="14" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="1.3" fill="#fff" opacity=".45" />
        </pattern>
      </defs>
      <path d="M0 186 Q0 200 14 200 L286 200 Q300 200 300 186 L300 70 L150 150 L0 70 Z" fill="url(#kd-env-front)" />
      <path d="M0 186 Q0 200 14 200 L286 200 Q300 200 300 186 L300 70 L150 150 L0 70 Z" fill="url(#kd-env-dots)" />
      <path d="M0 70 L150 150 L300 70" fill="none" stroke="#EE9AB6" strokeWidth="1.5" />
      {closed && <path d="M0 8 Q0 0 10 0 L290 0 Q300 0 300 8 L150 118 Z" fill="#F9BFD1" stroke="#EE9AB6" strokeWidth="1.5" />}
      {/* airmail stripes */}
      <g opacity=".55">
        {Array.from({ length: 6 }, (_, i) => (
          <rect key={i} x={120 + i * 16} y={178} width={9} height={6} rx={1.5} fill={i % 2 ? "#E0245E" : "#fff"} transform="skewX(-30)" />
        ))}
      </g>
    </svg>
  );
}

/** A wax seal disc with a kiss pressed into it. viewBox 100×100. */
export function WaxSeal({ kind, shade, size = 84 }: { kind: KissStyle; shade: ShadeId; size?: number }) {
  const id = useId().replace(/:/g, "");
  const p = kissPalette(kind, shade);
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ display: "block", overflow: "visible" }} aria-hidden>
      <defs>
        <radialGradient id={`ws${id}`} cx="38%" cy="32%" r="75%">
          <stop offset="0" stopColor="#F04A78" />
          <stop offset=".6" stopColor="#C4144A" />
          <stop offset="1" stopColor="#7E0B2E" />
        </radialGradient>
      </defs>
      <path
        d="M50 3 C58 4 62 9 70 8 C78 8 83 15 88 21 C93 28 92 35 95 42 C98 51 95 58 93 65 C90 74 85 79 78 85 C71 91 64 92 56 95 C47 98 40 95 32 92 C23 89 17 84 12 77 C7 70 5 63 4 55 C3 46 6 39 9 31 C13 22 19 15 27 10 C35 6 42 2 50 3 Z"
        fill={`url(#ws${id})`}
      />
      <circle cx="50" cy="50" r="31" fill="none" stroke="#FF8FAE" strokeOpacity=".5" strokeWidth="2" />
      <circle cx="50" cy="50" r="27" fill="#A50F3C" opacity=".55" />
      <g transform={kind === "lipstick" ? "translate(26 34) scale(.4)" : "translate(30 30) scale(.4)"} opacity=".95">
        {kind === "lipstick" ? (
          <>
            <path d={UPPER} fill={p.hi} />
            <path d={LOWER} fill={p.hi} />
          </>
        ) : (
          <path d={HEART} fill="#FFC2D4" />
        )}
      </g>
      <ellipse cx="34" cy="24" rx="12" ry="5" fill="#fff" opacity=".28" transform="rotate(-30 34 24)" />
    </svg>
  );
}

// ── Bullet lipstick ──────────────────────────────────────────────────────────

/** A bullet lipstick. `up` 0–1 twists the bullet up; `capOff` lifts the cap. viewBox 60×170. */
export function Lipstick({ shade, up, capOff }: { shade: ShadeId; up: number; capOff: boolean }) {
  const s = SHADES[shade];
  const id = useId().replace(/:/g, "");
  const rise = (1 - up) * 46;
  return (
    <svg viewBox="0 -70 60 240" width="100%" style={{ display: "block", overflow: "visible" }} aria-hidden>
      <defs>
        <linearGradient id={`gold${id}`} x1="0" x2="1">
          <stop offset="0" stopColor="#B9852C" />
          <stop offset=".35" stopColor="#F6D58A" />
          <stop offset=".6" stopColor="#E3B04F" />
          <stop offset="1" stopColor="#9C6A1B" />
        </linearGradient>
        <linearGradient id={`bul${id}`} x1="0" x2="1">
          <stop offset="0" stopColor={s.deep} />
          <stop offset=".4" stopColor={s.hi} />
          <stop offset=".65" stopColor={s.hex} />
          <stop offset="1" stopColor={s.deep} />
        </linearGradient>
        <linearGradient id={`case${id}`} x1="0" x2="1">
          <stop offset="0" stopColor="#2B0A16" />
          <stop offset=".4" stopColor="#5C1B33" />
          <stop offset="1" stopColor="#1F0610" />
        </linearGradient>
      </defs>
      {/* bullet (drawn first so the sleeve hides it when twisted down) */}
      <g style={{ transform: `translateY(${rise}px)`, transition: "transform .7s cubic-bezier(.3,1.4,.5,1)" }}>
        <path d="M17 76 L17 40 Q17 30 26 22 L43 32 L43 76 Z" fill={`url(#bul${id})`} />
        <path d="M21 72 L21 42 Q21 36 25 31" stroke="#fff" strokeOpacity=".35" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </g>
      {/* sleeve + case */}
      <rect x="14" y="74" width="32" height="26" rx="2" fill={`url(#gold${id})`} />
      <rect x="10" y="98" width="40" height="70" rx="5" fill={`url(#case${id})`} />
      <rect x="10" y="98" width="40" height="7" fill={`url(#gold${id})`} />
      <rect x="10" y="160" width="40" height="8" rx="3" fill={`url(#gold${id})`} />
      <rect x="16" y="112" width="5" height="42" rx="2.5" fill="#fff" opacity=".12" />
      {/* cap */}
      <g style={{ transform: capOff ? "translate(-6px,-78px) rotate(-14deg)" : "none", transformOrigin: "30px 60px", opacity: capOff ? 0 : 1, transition: "transform .55s cubic-bezier(.3,1.3,.5,1), opacity .5s ease .25s" }}>
        <rect x="10" y="20" width="40" height="80" rx="6" fill={`url(#case${id})`} />
        <rect x="10" y="90" width="40" height="10" fill={`url(#gold${id})`} />
        <rect x="16" y="28" width="5" height="56" rx="2.5" fill="#fff" opacity=".14" />
        <circle cx="30" cy="54" r="7" fill="none" stroke={`url(#gold${id})`} strokeWidth="2" />
      </g>
    </svg>
  );
}

// ── Heart jar ────────────────────────────────────────────────────────────────

const JAR_HEART = "M100 202 C40 162 8 124 8 84 C8 54 30 34 56 34 C76 34 92 46 100 60 C108 46 124 34 144 34 C170 34 192 54 192 84 C192 124 160 162 100 202 Z";

function insideHeart(x: number, y: number, m: number): boolean {
  const c1 = Math.hypot(x - 56, y - 84) <= 48 - m;
  const c2 = Math.hypot(x - 144, y - 84) <= 48 - m;
  const tri = y >= 84 && y <= 200 - m * 1.6 && Math.abs(x - 100) <= 92 * ((200 - y) / 116) - m * 1.3;
  return c1 || c2 || tri;
}

export interface JarSlot {
  x: number;
  y: number;
  r: number;
  s: number;
}

/** `n` stamp positions inside the heart, bottom first, sized so n of them fill it. */
export function jarSlots(n: number): JarSlot[] {
  let area = 0;
  for (let x = 8; x <= 192; x += 4) for (let y = 34; y <= 202; y += 4) if (insideHeart(x, y, 0)) area += 16;
  let cell = Math.sqrt(area / Math.max(1, n)) * 0.98;
  for (let tries = 0; tries < 12; tries++) {
    const pts: JarSlot[] = [];
    let row = 0;
    for (let y = 198 - cell * 0.55; y > 38; y -= cell * 0.86, row++) {
      for (let x = 8 + (row % 2 ? cell * 0.5 : cell * 0.15); x < 194; x += cell) {
        if (insideHeart(x, y, cell * 0.28)) pts.push({ x, y, r: 0, s: cell * 1.3 });
      }
    }
    pts.sort((a, b) => b.y - a.y || Math.abs(a.x - 100) - Math.abs(b.x - 100));
    if (pts.length >= n) {
      return pts.slice(0, n).map((p, i) => {
        const j = (k: number) => {
          const v = Math.sin((i + 1) * 12.9898 + k * 78.233) * 43758.5453;
          return v - Math.floor(v);
        };
        return { x: p.x + (j(1) - 0.5) * cell * 0.25, y: p.y + (j(2) - 0.5) * cell * 0.2, r: (j(3) - 0.5) * 50, s: p.s * (0.88 + j(4) * 0.24) };
      });
    }
    cell *= 0.92;
  }
  return [];
}

/** The hand-drawn heart-shaped glass jar, holding `count` of `slots`. viewBox 200×212. */
export function HeartJar({ slots, count, kind, shade, fill, glow }: { slots: JarSlot[]; count: number; kind: KissStyle; shade: ShadeId; fill: number; glow?: boolean }) {
  const id = useId().replace(/:/g, "");
  const p = kissPalette(kind, shade);
  const liquidTop = 202 - Math.min(1, fill) * 170;
  return (
    <svg viewBox="0 -14 200 226" width="100%" style={{ display: "block", overflow: "visible" }} aria-hidden>
      <defs>
        <clipPath id={`jc${id}`}>
          <path d={JAR_HEART} />
        </clipPath>
        <linearGradient id={`jg${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".65" />
          <stop offset=".45" stopColor="#FFE9F0" stopOpacity=".28" />
          <stop offset="1" stopColor="#FFD3E1" stopOpacity=".5" />
        </linearGradient>
        <linearGradient id={`lq${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={p.hi} stopOpacity=".35" />
          <stop offset="1" stopColor={p.hex} stopOpacity=".3" />
        </linearGradient>
      </defs>
      {glow && <path d={JAR_HEART} fill={p.hex} opacity=".25" style={{ filter: "blur(14px)" }} />}
      {/* glass body */}
      <path d={JAR_HEART} fill={`url(#jg${id})`} />
      <g clipPath={`url(#jc${id})`}>
        <rect x="0" y={liquidTop} width="200" height="220" fill={`url(#lq${id})`} style={{ transition: "y .6s cubic-bezier(.2,.8,.2,1)" }} />
        {slots.slice(0, count).map((s, i) =>
          kind === "lipstick" ? (
            <g key={i} transform={`translate(${s.x} ${s.y}) rotate(${s.r}) scale(${s.s / 120})`}>
              <g transform="translate(-60 -42)">
                <path d={UPPER} fill={p.hex} opacity=".92" />
                <path d={LOWER} fill={p.hex} opacity=".92" />
              </g>
            </g>
          ) : (
            <g key={i} transform={`translate(${s.x} ${s.y}) rotate(${s.r}) scale(${s.s / 100})`}>
              <g transform="translate(-50 -46)">
                <path d={HEART} fill={i % 3 === 1 ? p.hi : p.hex} stroke={p.deep} strokeWidth="2" />
                <ellipse cx="27" cy="20" rx="9" ry="5" fill="#fff" opacity=".5" transform="rotate(-28 27 20)" />
              </g>
            </g>
          ),
        )}
      </g>
      {/* glass outline, hand-drawn double stroke */}
      <path d={JAR_HEART} fill="none" stroke="#B4486E" strokeWidth="3" strokeLinejoin="round" />
      <path d={JAR_HEART} fill="none" stroke="#fff" strokeOpacity=".8" strokeWidth="1.2" transform="translate(2.5 -2) scale(.985)" style={{ transformOrigin: "100px 120px" }} />
      {/* shine */}
      <path d="M30 70 C30 58 40 48 54 46" stroke="#fff" strokeWidth="7" strokeLinecap="round" fill="none" opacity=".75" />
      <path d="M26 92 L26 102" stroke="#fff" strokeWidth="6" strokeLinecap="round" opacity=".7" />
      <path d="M158 120 C152 138 140 152 126 164" stroke="#fff" strokeWidth="4" strokeLinecap="round" fill="none" opacity=".35" />
      {/* neck, cork and ribbon */}
      <path d="M84.5 41 C84.5 37 85 33 86 30 L114 30 C115 33 115.5 37 115.5 41 C110 44 104 50 100 58 C96 50 90 44 84.5 41 Z" fill="#FFF2F6" opacity=".9" />
      <path d="M84.5 42 C84.5 37 85 33 86 30 M115.5 42 C115.5 37 115 33 114 30" stroke="#B4486E" strokeWidth="3" strokeLinecap="round" fill="none" />
      <rect x="82" y="22" width="36" height="10" rx="4" fill="#fff" stroke="#B4486E" strokeWidth="2.5" />
      <path d="M86 22 C86 10 88 2 90 -4 L110 -4 C112 2 114 10 114 22 Z" fill="#D9A066" stroke="#8C5A2B" strokeWidth="2.5" strokeLinejoin="round" />
      <g stroke="#8C5A2B" strokeOpacity=".35" strokeWidth="1.2">
        <path d="M94 2 L95 18" />
        <path d="M104 0 L105 16" />
      </g>
      <path d="M84 34 C70 26 66 40 78 40 C86 40 90 36 100 34 C110 36 114 40 122 40 C134 40 130 26 116 34" fill="none" stroke="#E0245E" strokeWidth="4" strokeLinecap="round" />
      <path d="M97 35 L90 50 M103 35 L110 50" stroke="#E0245E" strokeWidth="4" strokeLinecap="round" />
      <circle cx="100" cy="34" r="4.5" fill="#E0245E" />
    </svg>
  );
}

// ── Chubby bear cub (cute mode: where does the first kiss go?) ───────────────

export type KissSpot = "forehead" | "cheek" | "nose";
export const SPOTS: Record<KissSpot, { x: number; y: number; label: string; emoji: string; line: string }> = {
  forehead: { x: 100, y: 66, label: "Forehead", emoji: "🥹", line: "A forehead kiss. The safest place in the world." },
  cheek: { x: 146, y: 122, label: "Cheek", emoji: "😚", line: "A cheeky one on the cheek. They're blushing." },
  nose: { x: 100, y: 112, label: "Nose (boop)", emoji: "🐽", line: "Boop! A nose kiss. Maximum cuteness unlocked." },
};

/** A chubby bear cub face. viewBox 200×200. `happy` turns the eyes into ^ ^. */
export function BearCub({ happy, blush, kissed, kind, shade }: { happy: boolean; blush: number; kissed: KissSpot | null; kind: KissStyle; shade: ShadeId }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 200 200" width="100%" style={{ display: "block", overflow: "visible" }} aria-hidden>
      <defs>
        <radialGradient id={`fur${id}`} cx="40%" cy="35%" r="75%">
          <stop offset="0" stopColor="#F7D2A8" />
          <stop offset=".7" stopColor="#E3A973" />
          <stop offset="1" stopColor="#C98A55" />
        </radialGradient>
      </defs>
      <circle cx="44" cy="52" r="26" fill="#D8975F" />
      <circle cx="156" cy="52" r="26" fill="#D8975F" />
      <circle cx="44" cy="52" r="14" fill="#F4B9A6" />
      <circle cx="156" cy="52" r="14" fill="#F4B9A6" />
      <ellipse cx="100" cy="112" rx="84" ry="76" fill={`url(#fur${id})`} />
      <ellipse cx="100" cy="132" rx="38" ry="28" fill="#FBE4CB" />
      {/* eyes */}
      {happy ? (
        <g stroke="#3B1A10" strokeWidth="5" strokeLinecap="round" fill="none">
          <path d="M60 102 Q68 92 76 102" />
          <path d="M124 102 Q132 92 140 102" />
        </g>
      ) : (
        <g fill="#3B1A10">
          <ellipse cx="68" cy="100" rx="7.5" ry="9" />
          <ellipse cx="132" cy="100" rx="7.5" ry="9" />
          <circle cx="70.5" cy="96.5" r="2.6" fill="#fff" />
          <circle cx="134.5" cy="96.5" r="2.6" fill="#fff" />
        </g>
      )}
      <ellipse cx="100" cy="120" rx="10" ry="7" fill="#3B1A10" />
      <ellipse cx="97" cy="117.5" rx="3" ry="1.8" fill="#fff" opacity=".6" />
      <path d={happy ? "M90 134 Q100 144 110 134" : "M92 134 Q100 140 108 134"} stroke="#3B1A10" strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <g fill="#FF7FA3" opacity={0.35 + blush * 0.55}>
        <ellipse cx="50" cy="128" rx={12 + blush * 3} ry={7 + blush * 2} />
        <ellipse cx="150" cy="128" rx={12 + blush * 3} ry={7 + blush * 2} />
      </g>
      {kissed && (
        <g transform={`translate(${SPOTS[kissed].x} ${SPOTS[kissed].y}) rotate(${kissed === "cheek" ? 14 : -8})`}>
          {kind === "lipstick" ? (
            <g transform="translate(-21 -15) scale(.35)">
              <path d={UPPER} fill={kissPalette(kind, shade).hex} opacity=".9" />
              <path d={LOWER} fill={kissPalette(kind, shade).hex} opacity=".9" />
            </g>
          ) : (
            <g transform="translate(-15 -14) scale(.3)">
              <path d={HEART} fill={CUTE_PINK.hex} stroke={CUTE_PINK.deep} strokeWidth="3" />
            </g>
          )}
        </g>
      )}
    </svg>
  );
}

// ── Kiss-Cam fallback couple ─────────────────────────────────────────────────

function Cub({ x, y, s, tilt, fur, inner, eyesClosed }: { x: number; y: number; s: number; tilt: number; fur: string; inner: string; eyesClosed?: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${tilt}) scale(${s})`}>
      <ellipse cx="0" cy="96" rx="58" ry="50" fill={fur} />
      <circle cx="-42" cy="-46" r="20" fill={fur} />
      <circle cx="42" cy="-46" r="20" fill={fur} />
      <circle cx="-42" cy="-46" r="10" fill={inner} />
      <circle cx="42" cy="-46" r="10" fill={inner} />
      <ellipse cx="0" cy="0" rx="62" ry="56" fill={fur} />
      <ellipse cx="0" cy="16" rx="26" ry="19" fill="#FFF3E6" />
      {eyesClosed ? (
        <g stroke="#2A140C" strokeWidth="4" strokeLinecap="round" fill="none">
          <path d="M-30 -6 Q-23 -13 -16 -6" />
          <path d="M16 -6 Q23 -13 30 -6" />
        </g>
      ) : (
        <g fill="#2A140C">
          <circle cx="-23" cy="-6" r="6" />
          <circle cx="23" cy="-6" r="6" />
        </g>
      )}
      <ellipse cx="0" cy="8" rx="7" ry="5" fill="#2A140C" />
      <ellipse cx="-38" cy="14" rx="9" ry="5" fill="#FF8FB1" opacity=".7" />
      <ellipse cx="38" cy="14" rx="9" ry="5" fill="#FF8FB1" opacity=".7" />
    </g>
  );
}

/** Two cubs, one kissing the other's cheek. viewBox 320×240. */
export function CuteCouple({ style }: { style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 320 250" width="100%" style={{ display: "block", ...style }} aria-hidden>
      <Cub x={114} y={104} s={0.88} tilt={12} fur="#E7B07A" inner="#F4B9A6" eyesClosed />
      <Cub x={212} y={110} s={0.84} tilt={-4} fur="#FFFFFF" inner="#FFC9D6" />
      <g transform="translate(160 96) rotate(-10) scale(.24)">
        <path d={HEART} fill="#FF5C8D" stroke="#C72E62" strokeWidth="4" />
      </g>
      <g className="vw-anim-float" style={{ transformOrigin: "160px 40px" }}>
        <g transform="translate(150 20) scale(.22)">
          <path d={HEART} fill="#FF7AA2" />
        </g>
        <g transform="translate(182 40) scale(.14)">
          <path d={HEART} fill="#FFB3CB" />
        </g>
      </g>
    </svg>
  );
}
