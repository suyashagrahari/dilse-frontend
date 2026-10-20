"use client";

// ─── The opened invitation: an arch-topped paper card ────────────────────────
//
// The card the envelope delivered (spec §4.1 / §4.3, after the settle beat):
//   rise   the card lifts into place, .86 → 1
//   frame  a double gold hairline that follows the arch draws itself
//          (stroke-dashoffset on two paths, one shot)
//   bloom  the theme's floral cluster opens at the top-right shoulder of the
//          arch, its smaller mirror at the bottom-left (origin at the stem)
//   type   kicker → names (gold script, then the "&") → details, staggered
//   shine  one gold light sweep over the names (translateX), then every 8 s
//   petals ≤ 6 watercolour petals drift across, paused when off screen
// Everything is CSS keyed off [data-open] on the page; `children` is the card's
// text. Reduced motion: the final state.

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { WeddingThemeId } from "../../_wedding/themes";
import { CLASSIC_ART } from "./art";
import Floral from "./Floral";

/** The arch's vertical radius as a share of the card width. */
const ARCH = 0.44;

function borderPath(w: number, h: number, i: number) {
  const ry = w * ARCH - i;
  const rx = w / 2 - i;
  const top = w * ARCH;
  const c = 10;
  return `M${i} ${top}V${h - i - c}Q${i} ${h - i} ${i + c} ${h - i}H${w - i - c}Q${w - i} ${h - i} ${w - i} ${h - i - c}V${top}A${rx} ${ry} 0 0 0 ${i} ${top}Z`;
}

export default function ArchCard({ theme, children }: { theme: WeddingThemeId; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<[number, number] | null>(null);
  const a = CLASSIC_ART[theme];

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const read = () => {
      const w = Math.round(el.offsetWidth);
      const h = Math.round(el.offsetHeight);
      setSize((s) => (s && s[0] === w && s[1] === h ? s : [w, h]));
    };
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const rot = a.floral.rot;
  return (
    <div className="wi-cardWrap" style={{ ["--wi-fl-tr" as string]: `${a.floral.size * 100}%`, ["--wi-fl-rot" as string]: `${rot}deg` }}>
      <div ref={ref} className="wi-card">
        {size && (
          <svg className="wi-cardLine" width={size[0]} height={size[1]} viewBox={`0 0 ${size[0]} ${size[1]}`} aria-hidden>
            <path d={borderPath(size[0], size[1], 11)} pathLength={1} className="wi-cardLine-a" />
            <path d={borderPath(size[0], size[1], 17)} pathLength={1} className="wi-cardLine-b" />
          </svg>
        )}
        <span className="wi-cardCorner wi-cardCorner-l" aria-hidden />
        <span className="wi-cardCorner wi-cardCorner-r" aria-hidden />
        <div className="wi-cardIn">{children}</div>
      </div>
      <div className="wi-bloom wi-bloom-tr">
        <div className="wi-bloomIn">
          <Floral spec={a.floral} priority sizes="(min-width: 520px) 280px, 62vw" />
        </div>
      </div>
      <div className="wi-bloom wi-bloom-bl">
        <div className="wi-bloomIn">
          <Floral spec={a.floral} priority sizes="(min-width: 520px) 190px, 42vw" />
        </div>
      </div>
    </div>
  );
}

// ── Petals ──────────────────────────────────────────────────────────────────

const PETAL_PATHS = [
  "M20 50C8 44 2 30 6 16C9 6 16 4 20 9C24 4 31 6 34 16C38 30 32 44 20 50Z",
  "M20 2C31 10 38 25 34 38C31 47 25 51 20 50C15 51 9 47 6 38C2 25 9 10 20 2Z",
];

function petalUrl(i: number, [light, deep, vein]: [string, string, string]) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 52"><defs><radialGradient id="g" cx=".38" cy=".3" r=".85"><stop offset="0" stop-color="${light}"/><stop offset=".55" stop-color="${light}" stop-opacity=".92"/><stop offset="1" stop-color="${deep}"/></radialGradient></defs><path d="${PETAL_PATHS[i % 2]}" fill="url(#g)"/><path d="M20 ${i % 2 ? 8 : 12}C19 22 20 34 21 46" stroke="${vein}" stroke-width="1" fill="none" stroke-linecap="round"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/** Seeded so server and client agree. */
const PETALS = Array.from({ length: 6 }, (_, i) => {
  const r = (n: number) => {
    const v = Math.sin((i + 1) * 12.9898 + n * 78.233) * 43758.5453;
    return v - Math.floor(v);
  };
  return {
    x: 6 + ((i * 17 + r(1) * 12) % 88),
    size: 13 + r(2) * 9,
    dur: 7 + r(3) * 3,
    delay: i * 1.15 + r(4) * 0.6,
    dx: (r(5) - 0.5) * 120,
    rot: 200 + r(6) * 300,
  };
});

export function Petals({ theme, active }: { theme: WeddingThemeId; active: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const tint = CLASSIC_ART[theme].petal;
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    // Low-end phones (spec §7.1.11): half the petals.
    const nav = navigator as Navigator & { deviceMemory?: number };
    if ((nav.hardwareConcurrency || 8) <= 4 && (nav.deviceMemory ?? 8) <= 3) el.setAttribute("data-lite", "");
    const io = new IntersectionObserver(([e]) => el.toggleAttribute("data-off", !e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className="wi-petals" data-on={active || undefined} aria-hidden>
      {PETALS.map((p, i) => (
        <span
          key={i}
          className="wi-petal"
          style={{
            left: `${p.x}%`,
            width: p.size,
            height: p.size * 1.3,
            backgroundImage: petalUrl(i, tint),
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay}s`,
            ["--dx" as string]: `${p.dx}px`,
            ["--rot" as string]: `${p.rot}deg`,
          }}
        />
      ))}
    </div>
  );
}

export const ARCH_CSS = /* css */ `
.wi-cardWrap { position: relative; width: min(88vw, 440px); margin: 0 auto; }
.wi-card { position: relative; z-index: 1; min-height: calc(min(88vw, 440px) * 1.4); border-radius: 50% 50% 14px 14px / calc(min(88vw, 440px) * ${ARCH}) calc(min(88vw, 440px) * ${ARCH}) 14px 14px;
  background-color: var(--wk-surface-solid); background-image: radial-gradient(120% 80% at 50% 28%, transparent 50%, rgba(120, 80, 30, .08)), radial-gradient(60% 40% at 30% 12%, rgba(255, 255, 255, .7), transparent);
  box-shadow: var(--wi-card-shadow); }
[data-wk-dark] .wi-card { background-blend-mode: soft-light, normal; background-size: 512px 512px, 100% 100%; background-image: var(--wk-paper), radial-gradient(120% 80% at 50% 30%, rgba(255, 230, 170, .05), rgba(0, 0, 0, .28)); }
.wi-cardLine { position: absolute; inset: 0; pointer-events: none; overflow: visible; }
.wi-cardLine path { fill: none; stroke: var(--wk-gold); stroke-dasharray: 1; stroke-dashoffset: 0; }
.wi-cardLine-a { stroke-width: 1.4; }
.wi-cardLine-b { stroke-width: .7; opacity: .8; }
.wi-cardCorner { position: absolute; bottom: 22px; width: 54px; height: 54px; background: var(--wk-gold); pointer-events: none;
  -webkit-mask: url(/wedding/ornaments/corner-filigree.svg) center / contain no-repeat; mask: url(/wedding/ornaments/corner-filigree.svg) center / contain no-repeat; }
.wi-cardCorner-l { left: 22px; transform: scaleY(-1); }
.wi-cardCorner-r { right: 22px; transform: scale(-1, -1); }
.wi-cardIn { position: relative; padding: calc(min(88vw, 440px) * .17) clamp(22px, 7vw, 40px) clamp(64px, 16vw, 84px); display: grid; justify-items: center; text-align: center; }

.wi-bloom { position: absolute; z-index: 2; pointer-events: none; }
.wi-bloom-tr { width: var(--wi-fl-tr); right: -9%; top: 2%; transform: translate(0, -30%) rotate(var(--wi-fl-rot)); }
.wi-bloom-bl { width: calc(var(--wi-fl-tr) * .68); left: -8%; bottom: 3%; transform: translate(0, 30%) rotate(calc(var(--wi-fl-rot) + 180deg)); }
.wi-bloomIn { transform-origin: 90% 70%; }
.wi-bloom-tr .wi-bloomIn .wi-fl { animation: wi-sway 6s ease-in-out infinite alternate; transform-origin: 90% 70%; }
@keyframes wi-sway { from { transform: rotate(-.8deg); } to { transform: rotate(.8deg); } }

.wi-petals { position: absolute; inset: 0; z-index: 4; overflow: hidden; pointer-events: none; display: none; }
.wi-petals[data-on] { display: block; }
.wi-petals[data-off] .wi-petal { animation-play-state: paused; }
.wi-petals[data-lite] .wi-petal:nth-child(n + 4) { display: none; }
.wi-petal { position: absolute; top: -40px; background: center / contain no-repeat; opacity: 0; animation: wi-petal 8s linear infinite; }
@keyframes wi-petal {
  0% { transform: translate3d(0, 0, 0) rotate(0deg); opacity: 0; }
  10% { opacity: .95; }
  50% { transform: translate3d(calc(var(--dx) * -.4), 50vh, 0) rotate(calc(var(--rot) * .5)); }
  88% { opacity: .9; }
  100% { transform: translate3d(var(--dx), 104vh, 0) rotate(var(--rot)); opacity: 0; }
}
`;
