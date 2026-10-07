"use client";

// ─── Valentine's Day — hand-drawn SVG/CSS art ────────────────────────────────
//
// Paper lanterns (unlit → lit with a flickering flame), the night rooftop,
// a twinkling starfield, the grand gift box parts, the cream envelope with a
// monogram wax seal, a candle, a gold gallery frame. Pure SVG/CSS.

import { useId, useMemo, type CSSProperties, type ReactNode } from "react";

export const NIGHT = {
  midnight: "#12081F",
  plum: "#2A1240",
  wine: "#7A1035",
  rose: "#E8436E",
  roseGold: "#E8A598",
  gold: "#F5C66B",
  amber: "#FFB347",
  blush: "#FFD6E0",
  star: "#FFF6E5",
};

export const VAL_CSS = `
@keyframes vn-twinkle { 0%,100% { opacity: .25 } 50% { opacity: 1 } }
@keyframes vn-flicker { 0%,100% { opacity: .92; transform: scale(1) } 25% { opacity: .78; transform: scale(.97) } 50% { opacity: 1; transform: scale(1.03) } 75% { opacity: .85; transform: scale(.99) } }
@keyframes vn-sway { 0%,100% { transform: rotate(-3deg) } 50% { transform: rotate(3deg) } }
@keyframes vn-shimmer { from { background-position: -200% 0 } to { background-position: 200% 0 } }
@keyframes vn-candle { 0%,100% { transform: scaleY(1) skewX(0) } 30% { transform: scaleY(1.08) skewX(3deg) } 60% { transform: scaleY(.94) skewX(-2deg) } }
.vn-twinkle { animation: vn-twinkle 3s ease-in-out infinite }
.vn-flicker { animation: vn-flicker 1.6s ease-in-out infinite; transform-origin: 50% 60% }
.vn-sway { animation: vn-sway 4.5s ease-in-out infinite; transform-origin: 50% 0 }
.vn-candle { animation: vn-candle 1.1s ease-in-out infinite; transform-origin: 50% 100% }
.vn-foil { background-size: 200% 100%; animation: vn-shimmer 4s linear infinite }
@media (prefers-reduced-motion: reduce) { .vn-twinkle, .vn-flicker, .vn-sway, .vn-candle, .vn-foil { animation: none !important } }
`;

export function ValCss() {
  return <style>{VAL_CSS}</style>;
}

/** A deterministic starfield (two layers), absolutely filling its parent. */
export function Starfield({ count = 70, style }: { count?: number; style?: CSSProperties }) {
  const stars = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const r = (k: number) => {
          const v = Math.sin((i + 1) * 127.1 + k * 311.7) * 43758.5453;
          return v - Math.floor(v);
        };
        return { x: r(1) * 100, y: r(2) * 100, s: 1 + r(3) * 2.2, d: r(4) * 3, dur: 2 + r(5) * 3, big: r(6) > 0.93 };
      }),
    [count],
  );
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", ...style }}>
      {stars.map((s, i) =>
        s.big ? (
          <svg key={i} viewBox="0 0 20 20" className="vn-twinkle" style={{ position: "absolute", left: `${s.x}%`, top: `${s.y}%`, width: 12, height: 12, animationDelay: `${s.d}s`, animationDuration: `${s.dur}s` }}>
            <path d="M10 0 L11.6 8.4 L20 10 L11.6 11.6 L10 20 L8.4 11.6 L0 10 L8.4 8.4 Z" fill={NIGHT.star} />
          </svg>
        ) : (
          <span key={i} className="vn-twinkle" style={{ position: "absolute", left: `${s.x}%`, top: `${s.y}%`, width: s.s, height: s.s, borderRadius: "50%", background: NIGHT.star, boxShadow: `0 0 ${s.s * 2}px rgba(255,246,229,.8)`, animationDelay: `${s.d}s`, animationDuration: `${s.dur}s` }} />
        ),
      )}
    </div>
  );
}

export function Moon({ size = 70, style }: { size?: number; style?: CSSProperties }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ display: "block", ...style }} aria-hidden>
      <defs>
        <radialGradient id="vn-moon" cx="40%" cy="38%" r="60%">
          <stop offset="0" stopColor="#FFF9EC" />
          <stop offset="1" stopColor="#F2D9A6" />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill="#FFE9B8" opacity=".14" />
      <circle cx="50" cy="50" r="34" fill="url(#vn-moon)" />
      <circle cx="40" cy="44" r="5" fill="#E8C98E" opacity=".5" />
      <circle cx="58" cy="60" r="7" fill="#E8C98E" opacity=".4" />
      <circle cx="60" cy="36" r="3" fill="#E8C98E" opacity=".45" />
    </svg>
  );
}

// ── Paper lantern ────────────────────────────────────────────────────────────

export const LANTERN_TINTS = ["#FF6B8B", "#C77DFF", "#D99560", "#FFA86B", "#FF8FB1", "#FFC46B", "#FF4F7B"] as const;

/** A paper lantern, viewBox 60×100. `lit` turns on the flame + glow. */
export function Lantern({ tint, lit, size = 48, glyph }: { tint: string; lit: boolean; size?: number; glyph?: ReactNode }) {
  const id = useId().replace(/:/g, "");
  return (
    <div style={{ position: "relative", width: size, height: (size * 100) / 60 }}>
      {lit && <span aria-hidden className="vn-flicker" style={{ position: "absolute", left: "-60%", right: "-60%", top: "-10%", bottom: "-20%", borderRadius: "50%", background: `radial-gradient(circle at 50% 50%, ${NIGHT.amber}88, ${tint}33 45%, transparent 70%)`, pointerEvents: "none" }} />}
      <svg viewBox="0 0 60 100" width={size} height={(size * 100) / 60} style={{ display: "block", position: "relative", overflow: "visible" }} aria-hidden>
        <defs>
          <radialGradient id={`lit${id}`} cx="50%" cy="58%" r="60%">
            <stop offset="0" stopColor="#FFF6D6" />
            <stop offset=".35" stopColor="#FFD27A" />
            <stop offset=".8" stopColor={tint} />
            <stop offset="1" stopColor="#8E2B3E" />
          </radialGradient>
          <linearGradient id={`off${id}`} x1="0" x2="1">
            <stop offset="0" stopColor="#2A0F25" />
            <stop offset=".5" stopColor={tint} stopOpacity=".38" />
            <stop offset="1" stopColor="#1C0A1C" />
          </linearGradient>
          <linearGradient id={`cap${id}`} x1="0" x2="1">
            <stop offset="0" stopColor="#9C6A1B" />
            <stop offset=".5" stopColor="#F6D58A" />
            <stop offset="1" stopColor="#9C6A1B" />
          </linearGradient>
        </defs>
        <path d="M30 0 V12" stroke="#C9A25A" strokeWidth="1.4" />
        <rect x="19" y="11" width="22" height="7" rx="2.5" fill={`url(#cap${id})`} />
        <path d="M15 18 C3 34 3 62 15 80 L45 80 C57 62 57 34 45 18 Z" fill={lit ? `url(#lit${id})` : `url(#off${id})`} stroke={lit ? "#FFDA94" : tint} strokeOpacity={lit ? 0.7 : 0.45} strokeWidth="1.2" />
        <g stroke={lit ? "#B4543E" : tint} strokeOpacity={lit ? 0.35 : 0.3} strokeWidth="1" fill="none">
          <path d="M22 18 C15 40 15 58 22 80" />
          <path d="M30 18 V80" />
          <path d="M38 18 C45 40 45 58 38 80" />
          <path d="M9 34 H51" />
          <path d="M7 64 H53" />
        </g>
        {lit && <ellipse className="vn-flicker" cx="30" cy="56" rx="5" ry="8" fill="#FFF9E0" opacity=".9" />}
        <rect x="19" y="80" width="22" height="6" rx="2.5" fill={`url(#cap${id})`} />
        <path d="M30 86 V92" stroke="#C9A25A" strokeWidth="1.4" />
        <path d="M27 92 h6 l-1 8 h-4 Z" fill={lit ? "#FF8A5C" : tint} opacity={lit ? 0.95 : 0.5} />
      </svg>
      {glyph && <span aria-hidden style={{ position: "absolute", left: 0, right: 0, top: "38%", textAlign: "center", fontSize: size * 0.32, lineHeight: 1, opacity: lit ? 1 : 0.35, filter: lit ? "none" : "grayscale(.8)" }}>{glyph}</span>}
    </div>
  );
}

/** Lantern as an SVG data URL — for the keepsake canvas. */
export function lanternDataUrl(tint: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 100" width="120" height="200"><defs><radialGradient id="g" cx="50%" cy="58%" r="60%"><stop offset="0" stop-color="#FFF6D6"/><stop offset=".35" stop-color="#FFD27A"/><stop offset=".8" stop-color="${tint}"/><stop offset="1" stop-color="#8E2B3E"/></radialGradient></defs><rect x="19" y="11" width="22" height="7" rx="2.5" fill="#E3B04F"/><path d="M15 18 C3 34 3 62 15 80 L45 80 C57 62 57 34 45 18 Z" fill="url(#g)"/><g stroke="#B4543E" stroke-opacity=".35" fill="none"><path d="M22 18 C15 40 15 58 22 80"/><path d="M30 18 V80"/><path d="M38 18 C45 40 45 58 38 80"/></g><ellipse cx="30" cy="56" rx="5" ry="8" fill="#FFF9E0" opacity=".9"/><rect x="19" y="80" width="22" height="6" rx="2.5" fill="#E3B04F"/><path d="M27 92 h6 l-1 8 h-4 Z" fill="#FF8A5C"/></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// ── Rooftop ──────────────────────────────────────────────────────────────────

/** City skyline + a rooftop parapet with a water tank, plants and fairy lights. viewBox 400×170. */
export function Rooftop({ glow = 0, style }: { glow?: number; style?: CSSProperties }) {
  const windows = useMemo(() => {
    const out: { x: number; y: number; on: boolean }[] = [];
    let s = 7;
    const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
    for (let b = 0; b < 9; b++) for (let k = 0; k < 6; k++) out.push({ x: 8 + b * 44 + (k % 2) * 12, y: 40 + Math.floor(k / 2) * 14 + (b % 3) * 6, on: rnd() > 0.55 });
    return out;
  }, []);
  return (
    <svg viewBox="0 0 400 170" width="100%" preserveAspectRatio="xMidYMax slice" style={{ display: "block", ...style }} aria-hidden>
      {/* far skyline */}
      <path d="M0 90 H20 V60 H44 V78 H60 V40 H86 V70 H100 V54 H128 V84 H146 V30 H168 V64 H188 V74 H206 V48 H232 V80 H250 V58 H276 V36 H300 V70 H318 V52 H344 V82 H360 V62 H384 V76 H400 V170 H0 Z" fill="#1E0C2E" />
      {windows.map((w, i) => (w.on ? <rect key={i} x={w.x} y={w.y + 20} width="4" height="5" fill={NIGHT.amber} opacity={0.35 + glow * 0.4} /> : null))}
      {/* parapet */}
      <path d="M0 128 H400 V170 H0 Z" fill="#0D0518" />
      <rect x="0" y="122" width="400" height="8" fill="#1A0B26" />
      {/* water tank */}
      <path d="M36 122 V92 Q36 84 52 84 H70 Q86 84 86 92 V122 Z" fill="#14081F" />
      <rect x="40" y="94" width="42" height="3" fill="#24112F" />
      {/* plant pots */}
      <path d="M318 122 l4 -16 h22 l4 16 Z" fill="#14081F" />
      <path d="M333 106 C326 92 316 92 312 86 M333 106 C334 90 342 84 350 80 M333 106 C330 96 334 88 330 78" stroke="#14081F" strokeWidth="4" fill="none" strokeLinecap="round" />
      {/* fairy lights */}
      <path d="M0 112 Q100 128 200 112 T400 112" stroke="#3A2340" strokeWidth="1" fill="none" />
      {Array.from({ length: 21 }, (_, i) => {
        const x = i * 20;
        const t = (x % 200) / 200;
        const y = 112 + Math.sin(t * Math.PI) * 8;
        return <circle key={i} cx={x} cy={y + 2} r="2.2" fill={i % 3 === 0 ? NIGHT.gold : i % 3 === 1 ? NIGHT.blush : NIGHT.amber} className="vn-twinkle" style={{ animationDelay: `${(i % 5) * 0.4}s` }} />;
      })}
    </svg>
  );
}

// ── Envelope + monogram seal ─────────────────────────────────────────────────

export function MonogramSeal({ a, b, size = 86 }: { a: string; b: string; size?: number }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ display: "block", overflow: "visible" }} aria-hidden>
      <defs>
        <radialGradient id={`ms${id}`} cx="38%" cy="32%" r="75%">
          <stop offset="0" stopColor="#C2264F" />
          <stop offset=".65" stopColor="#7A1035" />
          <stop offset="1" stopColor="#4A0820" />
        </radialGradient>
      </defs>
      <path
        d="M50 3 C58 4 62 9 70 8 C78 8 83 15 88 21 C93 28 92 35 95 42 C98 51 95 58 93 65 C90 74 85 79 78 85 C71 91 64 92 56 95 C47 98 40 95 32 92 C23 89 17 84 12 77 C7 70 5 63 4 55 C3 46 6 39 9 31 C13 22 19 15 27 10 C35 6 42 2 50 3 Z"
        fill={`url(#ms${id})`}
      />
      <circle cx="50" cy="50" r="32" fill="none" stroke="#F5C66B" strokeOpacity=".55" strokeWidth="1.6" />
      <text x="50" y="58" textAnchor="middle" fill="#F7D891" style={{ font: "italic 700 24px var(--vw-font-serif, Georgia), serif" }}>
        {a}
        <tspan fill="#FFB3C6" fontSize="16" dy="-2"> ♥ </tspan>
        <tspan dy="2">{b}</tspan>
      </text>
      <ellipse cx="34" cy="24" rx="12" ry="5" fill="#fff" opacity=".18" transform="rotate(-30 34 24)" />
    </svg>
  );
}

export function CreamEnvelope({ children, style }: { children?: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ position: "relative", width: "100%", aspectRatio: "300 / 190", ...style }}>
      <svg viewBox="0 0 300 190" width="100%" style={{ display: "block", position: "absolute", inset: 0 }} aria-hidden>
        <defs>
          <linearGradient id="vn-env" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#FFF6E5" />
            <stop offset="1" stopColor="#F1DFC0" />
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="300" height="190" rx="10" fill="url(#vn-env)" />
        <path d="M0 10 Q0 0 10 0 L290 0 Q300 0 300 10 L150 112 Z" fill="#F7E8CC" stroke="#E2C79A" strokeWidth="1.2" />
        <path d="M0 190 L120 96 M300 190 L180 96" stroke="#E2C79A" strokeWidth="1.2" />
        <rect x="6" y="6" width="288" height="178" rx="7" fill="none" stroke="#D9B46A" strokeOpacity=".5" strokeDasharray="2 4" />
      </svg>
      {children}
    </div>
  );
}

// ── Candle ───────────────────────────────────────────────────────────────────

export function Candle({ size = 46 }: { size?: number }) {
  return (
    <div style={{ position: "relative", width: size, height: size * 2 }} aria-hidden>
      <span className="vn-flicker" style={{ position: "absolute", left: "-120%", right: "-120%", top: "-60%", height: "160%", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,179,71,.35), transparent 65%)" }} />
      <svg viewBox="0 0 40 80" width={size} height={size * 2} style={{ position: "relative", display: "block", overflow: "visible" }}>
        <defs>
          <linearGradient id="vn-wax" x1="0" x2="1">
            <stop offset="0" stopColor="#E9D3B4" />
            <stop offset=".5" stopColor="#FFF6E5" />
            <stop offset="1" stopColor="#D9BE97" />
          </linearGradient>
        </defs>
        <rect x="10" y="30" width="20" height="46" rx="3" fill="url(#vn-wax)" />
        <path d="M10 34 q4 6 8 0 q2 8 6 2 q3 -4 6 0" fill="#FFF6E5" />
        <path d="M20 30 V24" stroke="#3A2A1A" strokeWidth="1.5" />
        <g className="vn-candle">
          <path d="M20 4 C26 12 26 20 20 25 C14 20 14 12 20 4 Z" fill="#FFB347" />
          <path d="M20 11 C23 15 23 20 20 22 C17 20 17 15 20 11 Z" fill="#FFF3C4" />
        </g>
        <ellipse cx="20" cy="78" rx="16" ry="3" fill="#000" opacity=".25" />
      </svg>
    </div>
  );
}

// ── Gold frame ───────────────────────────────────────────────────────────────

export function GoldFrame({ children, style, ratio = "4 / 5" }: { children?: ReactNode; style?: CSSProperties; ratio?: string }) {
  return (
    <div style={{ padding: 7, borderRadius: 4, background: "linear-gradient(135deg, #7C561C, #F5D58A 22%, #B8862F 45%, #FBE7B0 62%, #8C6420 85%, #E8C06A)", boxShadow: "0 22px 40px -18px rgba(0,0,0,.85), inset 0 0 0 1px rgba(255,255,255,.25)", ...style }}>
      <div style={{ padding: 7, background: "linear-gradient(#F3E6CC, #E6D3AE)", boxShadow: "inset 0 2px 6px rgba(0,0,0,.25)" }}>
        <div style={{ position: "relative", aspectRatio: ratio, overflow: "hidden", background: "#1A0712", boxShadow: "inset 0 0 0 1px rgba(0,0,0,.3)" }}>{children}</div>
      </div>
    </div>
  );
}

/** Initials for the monogram ("Ananya" → "A"). */
export const initial = (s: string) => (s.trim().match(/\p{L}|\p{N}/u)?.[0] ?? "♥").toUpperCase();
