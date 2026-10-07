"use client";

// ─── Rose Day — hand-drawn SVG art ───────────────────────────────────────────
//
// Every hero object of the day is drawn here: the rose head (petal layers
// that open with one 0–1 value), the potted plant that grows, the top-down
// pluckable flower, a pressed rose, the bouquet bud, the bud vase. The rose
// geometry is plain data (`headParts`) so the same petals render as React
// SVG on the page AND as an SVG string for the keepsake canvas.

import type { ReactNode } from "react";

// ─── Colour ──────────────────────────────────────────────────────────────────

export interface RoseShades {
  petal: string;
  light: string;
  dark: string;
  deep: string;
  /** Wax seal colour. */
  seal: string;
}

const SHADES: Record<string, RoseShades> = {
  red: { petal: "#C8102E", light: "#EC5068", dark: "#8E0B20", deep: "#5C0614", seal: "#A50E26" },
  pink: { petal: "#F48FB1", light: "#FCC8D9", dark: "#D9628C", deep: "#A73E66", seal: "#C9507B" },
  lavender: { petal: "#B39DDB", light: "#DCD0F2", dark: "#8D73C2", deep: "#5E4894", seal: "#7D62B3" },
  peach: { petal: "#FFB38A", light: "#FFD9C2", dark: "#EF8A5A", deep: "#B85C36", seal: "#D9774A" },
  white: { petal: "#FFF6EE", light: "#FFFFFF", dark: "#EBD9D0", deep: "#BFA295", seal: "#C9A27A" },
  yellow: { petal: "#FFD54F", light: "#FFEB9C", dark: "#F0B428", deep: "#B9820C", seal: "#D79B1C" },
  orange: { petal: "#FF8A50", light: "#FFB98F", dark: "#E8652B", deep: "#AE4418", seal: "#D2582A" },
  coral: { petal: "#FF7F6E", light: "#FFB2A7", dark: "#E8584A", deep: "#AE372E", seal: "#D24E42" },
};

export const shadesFor = (color: string): RoseShades => SHADES[color] ?? SHADES.red;

/** UI accent per rose colour (buttons, chips) — the page follows the rose. Contrast-checked against accentInk. */
const ACCENTS: Record<string, { accent: string; deep: string; ink: string; soft: string; edge: string; petalEdge: string }> = {
  red: { accent: "#C8102E", deep: "#8E0B20", ink: "#FFFFFF", soft: "#FBE3E8", edge: "#F1D3DA", petalEdge: "rgba(90,10,26,.18)" },
  pink: { accent: "#C8406F", deep: "#8F2A50", ink: "#FFFFFF", soft: "#FDE6EE", edge: "#F5D0DD", petalEdge: "rgba(140,40,80,.2)" },
  lavender: { accent: "#7458AE", deep: "#4F3B85", ink: "#FFFFFF", soft: "#EEE8F8", edge: "#DDD2F0", petalEdge: "rgba(70,50,120,.22)" },
  peach: { accent: "#C95F31", deep: "#93421F", ink: "#FFFFFF", soft: "#FFEDE2", edge: "#F7D9C6", petalEdge: "rgba(150,70,30,.22)" },
  white: { accent: "#B0303F", deep: "#7E1F2B", ink: "#FFFFFF", soft: "#F7EEE9", edge: "#EADCD3", petalEdge: "rgba(110,70,60,.42)" },
  yellow: { accent: "#F2B630", deep: "#B9820C", ink: "#3B2205", soft: "#FFF4D6", edge: "#F5E2AE", petalEdge: "rgba(150,100,10,.3)" },
  orange: { accent: "#CF5422", deep: "#953A14", ink: "#FFFFFF", soft: "#FFE9DD", edge: "#F7D3C0", petalEdge: "rgba(150,60,20,.22)" },
  coral: { accent: "#C9483C", deep: "#922F26", ink: "#FFFFFF", soft: "#FFE7E3", edge: "#F7D0CA", petalEdge: "rgba(150,50,40,.22)" },
};

/** CSS variable overrides for DayRoot's `style`, so the whole page wears the chosen rose. */
export function accentVars(color: string): Record<string, string> {
  const a = ACCENTS[color] ?? ACCENTS.red;
  return { "--vw-accent": a.accent, "--vw-accent-deep": a.deep, "--vw-accent-ink": a.ink, "--vw-soft": a.soft, "--vw-edge": a.edge, "--rd-edge": a.petalEdge };
}
export const petalEdgeFor = (color: string) => (ACCENTS[color] ?? ACCENTS.red).petalEdge;

export const LEAF = { light: "#8DB97A", mid: "#5E8C61", dark: "#3F6B45", stem: "#5B8A4E" };

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
/** Where `p` sits between a and b, 0–1. */
export const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const r1 = (n: number) => Math.round(n * 100) / 100;

// ─── Geometry as data ────────────────────────────────────────────────────────

export interface Part {
  d: string;
  fill: string;
  stroke?: string;
  sw?: number;
  transform?: string;
  opacity?: number;
}

export interface Grad {
  id: string;
  kind: "linear" | "radial";
  stops: [number, string, number?][];
  attrs: Record<string, string | number>;
}

export function roseGrads(id: string, sh: RoseShades): Grad[] {
  return [
    { id: `${id}-pd`, kind: "radial", attrs: { cx: "50%", cy: "85%", r: "85%" }, stops: [[0, sh.deep], [0.45, sh.dark], [1, sh.petal]] },
    { id: `${id}-pm`, kind: "linear", attrs: { x1: 0, y1: 1, x2: 0, y2: 0 }, stops: [[0, sh.dark], [0.7, sh.petal], [1, sh.light]] },
    { id: `${id}-pl`, kind: "linear", attrs: { x1: 0, y1: 1, x2: 0, y2: 0 }, stops: [[0, sh.dark], [0.45, sh.petal], [1, sh.light]] },
    { id: `${id}-pc`, kind: "radial", attrs: { cx: "50%", cy: "70%", r: "70%" }, stops: [[0, sh.deep], [1, sh.dark]] },
    { id: `${id}-lf`, kind: "linear", attrs: { x1: 0, y1: 0, x2: 1, y2: 1 }, stops: [[0, LEAF.light], [1, LEAF.dark]] },
  ];
}

const BACK_SIDE = "M-2 -4 C -30 -2 -56 -26 -52 -58 C -50 -72 -36 -80 -24 -72 C -12 -52 -6 -26 -2 -4 Z";
const BACK_MID = "M0 -6 C -30 -10 -40 -60 -22 -82 C -12 -94 12 -94 22 -82 C 40 -60 30 -10 0 -6 Z";
const CORE = "M-21 -44 C -26 -74 26 -78 21 -46 C 18 -32 -18 -30 -21 -44 Z";
const CORE_SWIRL = "M-12 -52 C -8 -64 12 -64 12 -54 C 12 -46 -2 -44 -4 -52 C -5 -58 4 -59 5 -54";
const MID_SIDE = "M3 0 C -24 0 -40 -22 -34 -52 C -30 -60 -21 -62 -15 -55 C -10 -40 -3 -20 3 0 Z";
const FRONT_LOW = "M0 0 C -24 6 -54 -4 -60 -30 C -44 -34 -18 -24 0 0 Z";
const FRONT_CUP =
  "M-38 -44 C -41 -14 -20 3 0 3 C 20 3 41 -14 38 -44 C 30 -36 18 -32 5 -39 C -1 -34 -8 -31 -15 -35 C -23 -39 -31 -39 -38 -44 Z";
const FRONT_LIP = "M-37 -43 C -30 -38 -22 -37 -15 -34 C -8 -30 -1 -33 5 -38 C 17 -31 29 -35 37 -43";
const SEPAL = "M0 2 C -10 -3 -27 -1 -38 8 C -25 9 -11 9 0 7 Z";
const SEPAL_FRONT = "M-3 4 C -6 13 -3 23 1 30 C 4 21 6 12 3 4 Z";

/**
 * The rose head, base at (0,0), growing up (−y). `o` = 0 closed bud → 1 full bloom.
 */
export function headParts(o: number, id: string): Part[] {
  const om = easeOut(seg(o, 0.1, 0.8));
  const oo = easeOut(seg(o, 0.3, 1));
  const of = easeOut(seg(o, 0.55, 1));
  const g = (k: string) => `url(#${id}-${k})`;
  const sideBack = `rotate(${r1(14 - 38 * oo)}) scale(${r1(0.55 + 0.45 * oo)})`;
  const sideMid = `rotate(${r1(6 - 20 * om)}) scale(${r1(0.8 + 0.2 * om)})`;
  const low = `rotate(${r1(14 - 26 * of)}) scale(${r1(Math.max(0.01, of))})`;
  const sepal = `rotate(${r1(-58 + 82 * om)})`;
  const parts: Part[] = [
    { d: BACK_MID, fill: g("pd"), transform: `scale(${r1(0.62 + 0.38 * om)})` },
    { d: BACK_SIDE, fill: g("pd"), transform: sideBack },
    { d: BACK_SIDE, fill: g("pd"), transform: `scale(-1 1) ${sideBack}` },
    { d: CORE, fill: g("pc"), transform: `scale(${r1(0.86 + 0.14 * om)})` },
    { d: CORE_SWIRL, fill: "none", stroke: "rgba(0,0,0,.22)", sw: 1.6, transform: `scale(${r1(0.86 + 0.14 * om)})` },
    { d: MID_SIDE, fill: g("pm"), transform: sideMid },
    { d: MID_SIDE, fill: g("pm"), transform: `scale(-1 1) ${sideMid}` },
  ];
  if (of > 0.01) {
    parts.push({ d: FRONT_LOW, fill: g("pm"), transform: low });
    parts.push({ d: FRONT_LOW, fill: g("pm"), transform: `scale(-1 1) ${low}` });
  }
  parts.push(
    { d: FRONT_CUP, fill: g("pl"), transform: `scale(${r1(0.6 + 0.4 * om)} ${r1(0.86 + 0.14 * om)})` },
    { d: FRONT_LIP, fill: "none", stroke: "rgba(255,255,255,.5)", sw: 1.4, transform: `scale(${r1(0.6 + 0.4 * om)} ${r1(0.86 + 0.14 * om)})` },
    { d: SEPAL, fill: LEAF.mid, transform: sepal },
    { d: SEPAL, fill: LEAF.mid, transform: `scale(-1 1) ${sepal}` },
    { d: SEPAL_FRONT, fill: LEAF.dark },
    { d: "M-9 2 a9 7 0 1 0 18 0 a9 7 0 1 0 -18 0 Z", fill: LEAF.mid },
  );
  return parts;
}

const LEAF_D = "M0 0 C 10 -15 34 -20 50 -9 C 35 4 14 6 0 0 Z";
const LEAF_VEIN = "M3 -1 C 17 -7 32 -9 46 -9";

// ─── React renderers ─────────────────────────────────────────────────────────

export function GradDefs({ grads }: { grads: Grad[] }) {
  return (
    <defs>
      {grads.map((gr) =>
        gr.kind === "linear" ? (
          <linearGradient key={gr.id} id={gr.id} {...gr.attrs}>
            {gr.stops.map(([o, c, a], i) => (
              <stop key={i} offset={o} stopColor={c} stopOpacity={a ?? 1} />
            ))}
          </linearGradient>
        ) : (
          <radialGradient key={gr.id} id={gr.id} {...gr.attrs}>
            {gr.stops.map(([o, c, a], i) => (
              <stop key={i} offset={o} stopColor={c} stopOpacity={a ?? 1} />
            ))}
          </radialGradient>
        ),
      )}
    </defs>
  );
}

export function Parts({ parts }: { parts: Part[] }) {
  return (
    <>
      {parts.map((p, i) => (
        <path
          key={i}
          d={p.d}
          fill={p.fill}
          stroke={p.stroke}
          strokeWidth={p.sw}
          strokeLinecap="round"
          transform={p.transform}
          opacity={p.opacity}
          style={!p.stroke && p.fill.startsWith("url(") ? { stroke: "var(--rd-edge, rgba(90,10,26,.16))", strokeWidth: 0.8 } : undefined}
        />
      ))}
    </>
  );
}

/** A rose head at (x, y) — base of the head — scaled by `s`. Needs <GradDefs> for `id` in the same SVG. */
export function RoseHead({ open, id, x = 0, y = 0, s = 1, rotate = 0 }: { open: number; id: string; x?: number; y?: number; s?: number; rotate?: number }) {
  return (
    <g transform={`translate(${r1(x)} ${r1(y)}) rotate(${r1(rotate)}) scale(${r1(s)})`}>
      <Parts parts={headParts(open, id)} />
    </g>
  );
}

export function Leaf({ x, y, angle, s = 1, flip }: { x: number; y: number; angle: number; s?: number; flip?: boolean; id: string }) {
  return (
    <g transform={`translate(${r1(x)} ${r1(y)}) ${flip ? "scale(-1 1)" : ""} rotate(${r1(angle)}) scale(${r1(Math.max(0.01, s))})`}>
      <path d={LEAF_D} fill={LEAF.mid} />
      <path d={LEAF_D} fill="rgba(255,255,255,.14)" transform="scale(1 .55)" />
      <path d={LEAF_VEIN} fill="none" stroke={LEAF.dark} strokeWidth={1.4} strokeLinecap="round" />
    </g>
  );
}

// Cubic bezier point (for leaves riding the stem).
const bez = (t: number, a: number, b: number, c: number, d: number) =>
  (1 - t) ** 3 * a + 3 * (1 - t) ** 2 * t * b + 3 * (1 - t) * t ** 2 * c + t ** 3 * d;

// Plant viewBox 0 0 240 360. Pot soil at y=292.
const STEM = { x0: 120, y0: 292, c1x: 110, c1y: 236, c2x: 132, c2y: 176, x1: 120, y1: 112 };
const STEM_D = `M${STEM.x0} ${STEM.y0} C ${STEM.c1x} ${STEM.c1y} ${STEM.c2x} ${STEM.c2y} ${STEM.x1} ${STEM.y1}`;

export interface PlantProps {
  /** 0–1 growth (hold progress). */
  progress: number;
  id: string;
  sh: RoseShades;
  /** Dew drops (ids) still on the leaves. */
  dew?: boolean[];
  onDew?: (i: number) => void;
  /** Overlay rendered inside the SVG after the plant (e.g. sparkles). */
  children?: ReactNode;
}

/** The terracotta pot with a stem that grows, leaves that unfurl and a bud that blooms. */
export function Plant({ progress, id, sh, dew, onDew, children }: PlantProps) {
  const sGrow = 0.3 + 0.7 * easeOut(seg(progress, 0, 0.5));
  const tipY = STEM.y0 - (STEM.y0 - STEM.y1) * sGrow;
  const leafL = easeOut(seg(progress, 0.18, 0.55));
  const leafR = easeOut(seg(progress, 0.3, 0.66));
  const open = seg(progress, 0.42, 1);
  const headS = 0.34 + 0.66 * easeOut(seg(progress, 0.2, 0.9));
  const at = (t: number) => ({ x: bez(t, STEM.x0, STEM.c1x, STEM.c2x, STEM.x1), y: STEM.y0 - (STEM.y0 - bez(t, STEM.y0, STEM.c1y, STEM.c2y, STEM.y1)) * sGrow });
  const lA = at(0.36);
  const lB = at(0.58);
  const sway = `rotate(0 120 292)`;
  return (
    <svg viewBox="0 0 240 360" width="100%" height="100%" style={{ overflow: "visible", display: "block" }} aria-hidden>
      <GradDefs grads={roseGrads(id, sh)} />
      <defs>
        <linearGradient id={`${id}-pot`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#B4542F" />
          <stop offset=".45" stopColor="#D9774A" />
          <stop offset="1" stopColor="#A54826" />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor={sh.light} stopOpacity=".75" />
          <stop offset="1" stopColor={sh.light} stopOpacity="0" />
        </radialGradient>
      </defs>
      {/* bloom glow */}
      <circle cx={120} cy={tipY - 40} r={70 + 40 * open} fill={`url(#${id}-glow)`} opacity={0.15 + 0.85 * open} />
      <g transform={sway}>
        {/* stem */}
        <g transform={`translate(0 ${r1(STEM.y0 * (1 - sGrow))}) scale(1 ${r1(sGrow)})`}>
          <path d={STEM_D} fill="none" stroke={LEAF.stem} strokeWidth={5.5} strokeLinecap="round" vectorEffect="non-scaling-stroke" />
          <path d={STEM_D} fill="none" stroke="rgba(255,255,255,.25)" strokeWidth={1.6} strokeLinecap="round" vectorEffect="non-scaling-stroke" transform="translate(-1.4 0)" />
        </g>
        {/* thorns */}
        {sGrow > 0.6 && (
          <g fill={LEAF.dark} opacity={seg(sGrow, 0.6, 0.9)}>
            <path d={`M${r1(at(0.22).x + 2)} ${r1(at(0.22).y)} l7 -4 l-6 -3 Z`} />
            <path d={`M${r1(at(0.5).x - 2)} ${r1(at(0.5).y)} l-7 -4 l6 -3 Z`} />
            <path d={`M${r1(at(0.74).x + 2)} ${r1(at(0.74).y)} l6 -4 l-5 -3 Z`} />
          </g>
        )}
        <Leaf id={id} x={lA.x - 2} y={lA.y} angle={-10 - 30 * (1 - leafL)} s={leafL} flip />
        <Leaf id={id} x={lB.x + 2} y={lB.y} angle={-14 - 30 * (1 - leafR)} s={leafR * 0.9} />
        {dew &&
          [
            { x: lA.x - 30 * leafL, y: lA.y - 8 * leafL },
            { x: lB.x + 26 * leafR, y: lB.y - 8 * leafR },
            { x: lA.x - 14 * leafL, y: lA.y - 2 },
          ].map((p, i) =>
            dew[i] ? (
              <g
                key={i}
                role="button"
                tabIndex={0}
                aria-label="Pop a dew drop"
                onClick={() => onDew?.(i)}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onDew?.(i)}
                style={{ cursor: "pointer", outline: "none" }}
              >
                <circle cx={p.x} cy={p.y} r={14} fill="transparent" />
                <ellipse cx={p.x} cy={p.y} rx={3.6} ry={4.2} fill="rgba(235,248,255,.85)" stroke="rgba(120,170,200,.55)" strokeWidth={0.8} />
                <circle cx={p.x - 1.2} cy={p.y - 1.4} r={1.1} fill="#fff" />
              </g>
            ) : null,
          )}
        {/* the head rides the stem tip */}
        <RoseHead id={id} open={open} x={STEM.x1 + 0} y={tipY + 2} s={headS * 1.12} />
      </g>
      {/* pot */}
      <g>
        <ellipse cx={120} cy={352} rx={58} ry={6} fill="rgba(90,26,43,.12)" />
        <path d="M78 306 L162 306 L152 350 Q120 356 88 350 Z" fill={`url(#${id}-pot)`} />
        <path d="M86 318 Q120 324 154 318" stroke="rgba(255,255,255,.18)" strokeWidth={2} fill="none" />
        <rect x={70} y={288} width={100} height={20} rx={6} fill="#DE8457" />
        <rect x={70} y={288} width={100} height={6} rx={3} fill="rgba(255,255,255,.22)" />
        <ellipse cx={120} cy={291} rx={44} ry={4} fill="#5B3A2A" />
        <path d="M120 340 c-6 -5 -12 -8 -12 -13 a5 5 0 0 1 12 -2 a5 5 0 0 1 12 2 c0 5 -6 8 -12 13 Z" fill="#FBE3E8" opacity=".9" />
      </g>
      {children}
    </svg>
  );
}

// ─── Pluckable flower (top-down) ─────────────────────────────────────────────

export const PLUCK_PETAL = "M0 -16 C -24 -30 -34 -74 -14 -92 C -8 -98 -3 -97 0 -93 C 3 -97 8 -98 14 -92 C 34 -74 24 -30 0 -16 Z";
export const PLUCK_VEIN = "M0 -22 C -2 -44 -1 -66 0 -84";
export const CENTER_SPIRAL =
  "M0 -3 C 5 -6 9 -1 6 4 C 2 10 -8 8 -9 0 C -10 -10 4 -16 12 -10 C 20 -3 16 12 4 16 C -10 20 -21 9 -20 -4 C -18 -18 -2 -27 12 -23";

// ─── Small rose for the bouquet / meaning card / vase ────────────────────────

/** A long-stemmed rose (stem from (0,0) down to (0,len)), head on top. Needs GradDefs. */
export function StemRose({ id, open, x, y, s = 1, len = 120, rotate = 0, leaves = true }: { id: string; open: number; x: number; y: number; s?: number; len?: number; rotate?: number; leaves?: boolean }) {
  return (
    <g transform={`translate(${r1(x)} ${r1(y)}) rotate(${r1(rotate)}) scale(${r1(s)})`}>
      <path d={`M0 0 C -4 ${len * 0.35} 5 ${len * 0.7} 0 ${len}`} stroke={LEAF.stem} strokeWidth={4.5} fill="none" strokeLinecap="round" />
      {leaves && <Leaf id={id} x={0} y={len * 0.42} angle={-18} s={0.62} />}
      {leaves && <Leaf id={id} x={0} y={len * 0.62} angle={-10} s={0.55} flip />}
      <Parts parts={headParts(open, id)} />
    </g>
  );
}

// ─── SVG string (keepsake wallpaper) ─────────────────────────────────────────

const esc = (s: string) => s.replace(/[<>&"]/g, "");

function gradString(gr: Grad): string {
  const attrs = Object.entries(gr.attrs)
    .map(([k, v]) => `${k}="${esc(String(v))}"`)
    .join(" ");
  const stops = gr.stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${esc(c)}" stop-opacity="${a ?? 1}"/>`).join("");
  return gr.kind === "linear" ? `<linearGradient id="${gr.id}" ${attrs}>${stops}</linearGradient>` : `<radialGradient id="${gr.id}" ${attrs}>${stops}</radialGradient>`;
}

function partsString(parts: Part[], edge: string): string {
  return parts
    .map(
      (p) =>
        `<path d="${p.d}" fill="${esc(p.fill)}"${p.stroke ? ` stroke="${esc(p.stroke)}" stroke-width="${p.sw ?? 1}" stroke-linecap="round"` : p.fill.startsWith("url(") ? ` stroke="${esc(edge)}" stroke-width="0.8"` : ""}${p.transform ? ` transform="${p.transform}"` : ""}/>`,
    )
    .join("");
}

const leafString = (x: number, y: number, angle: number, s: number, flip: boolean) =>
  `<g transform="translate(${x} ${y}) ${flip ? "scale(-1 1)" : ""} rotate(${angle}) scale(${s})"><path d="${LEAF_D}" fill="${LEAF.mid}"/><path d="${LEAF_D}" fill="rgba(255,255,255,.14)" transform="scale(1 .55)"/><path d="${LEAF_VEIN}" fill="none" stroke="${LEAF.dark}" stroke-width="1.4" stroke-linecap="round"/></g>`;

/**
 * A data: URL of one long-stemmed rose tied with a satin ribbon (or a little
 * cluster for several), for the keepsake canvas. 600×900.
 */
export function roseWallpaperDataUrl(color: string, count: number): string {
  const sh = shadesFor(color);
  const id = "k";
  const grads = roseGrads(id, sh).map(gradString).join("");
  const glow = `<radialGradient id="glow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${sh.light}" stop-opacity=".7"/><stop offset="1" stop-color="${sh.light}" stop-opacity="0"/></radialGradient>`;
  const n = count >= 7 ? 5 : count >= 3 ? 3 : 1;
  const layout = n === 1 ? [{ x: 300, y: 300, r: 0, s: 2.6 }] : n === 3 ? [{ x: 210, y: 360, r: -14, s: 1.9 }, { x: 390, y: 360, r: 14, s: 1.9 }, { x: 300, y: 270, r: 0, s: 2.2 }] : [{ x: 170, y: 410, r: -22, s: 1.6 }, { x: 430, y: 410, r: 22, s: 1.6 }, { x: 230, y: 300, r: -10, s: 1.8 }, { x: 370, y: 300, r: 10, s: 1.8 }, { x: 300, y: 230, r: 0, s: 2 }];
  const stems = layout.map((l) => `<path d="M${l.x} ${l.y} Q ${(l.x + 300) / 2} ${(l.y + 700) / 2} 300 820" stroke="${LEAF.stem}" stroke-width="10" fill="none" stroke-linecap="round"/>`).join("");
  const heads = layout
    .map((l) => `<g transform="translate(${l.x} ${l.y}) rotate(${l.r}) scale(${l.s})">${partsString(headParts(1, id), petalEdgeFor(color))}</g>`)
    .join("");
  const leaves = leafString(296, 600, -20, 2, false) + leafString(304, 520, -14, 1.7, true);
  const ribbon = `<path d="M262 660 h76 v26 h-76 Z" fill="${sh.seal}"/><path d="M300 672 C 250 630 226 648 232 672 C 238 694 270 690 300 672 Z" fill="${sh.seal}"/><path d="M300 672 C 350 630 374 648 368 672 C 362 694 330 690 300 672 Z" fill="${sh.seal}"/><path d="M300 676 L 270 760 L 286 756 L 300 680 Z M300 676 L 330 760 L 314 756 L 300 680 Z" fill="${sh.seal}"/><circle cx="300" cy="673" r="10" fill="${sh.deep}"/>`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="900" viewBox="0 0 600 900"><defs>${grads}${glow}</defs><circle cx="300" cy="300" r="290" fill="url(#glow)"/>${stems}${leaves}${heads}${ribbon}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
