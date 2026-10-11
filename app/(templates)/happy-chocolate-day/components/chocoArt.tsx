"use client";

// ─── Chocolate Day — hand-drawn SVG art + shared data ────────────────────────
//
// Every hero object on this page is drawn here: the six piece silhouettes
// (also used as Path2D for the foil canvas), the metallic foil wrappers, the
// glossy chocolates with bite masks, the fluted paper cups and the bow. One
// 100×100 coordinate space for every piece so foil, chocolate and canvas line
// up exactly.

import { useId, type CSSProperties } from "react";

// ── Palette ──────────────────────────────────────────────────────────────────
export const C = {
  cocoa: "#3B2117",
  cocoaDeep: "#24130C",
  milk: "#7B4A2E",
  caramel: "#C98A4B",
  gold: "#E6B85C",
  goldLight: "#FFE7A8",
  goldDeep: "#A67A2A",
  rasp: "#E0457B",
  raspDeep: "#A82B58",
  cream: "#FFF4E6",
  strawberry: "#F7C6D3",
  pistachio: "#A8C686",
};

// ── Piece silhouettes (viewBox 0 0 100 100) ──────────────────────────────────
export type PieceShape = "round" | "square" | "oval" | "drop" | "hex" | "heart";

export const SHAPES: Record<PieceShape, string> = {
  round: "M50 14 C70 14 86 30 86 50 C86 70 70 86 50 86 C30 86 14 70 14 50 C14 30 30 14 50 14 Z",
  square: "M27 17 H73 Q83 17 83 27 V73 Q83 83 73 83 H27 Q17 83 17 73 V27 Q17 17 27 17 Z",
  oval: "M50 21 C73 21 88 34 88 50 C88 66 73 79 50 79 C27 79 12 66 12 50 C12 34 27 21 50 21 Z",
  drop: "M50 11 C57 27 82 40 82 60 C82 76 68 87 50 87 C32 87 18 76 18 60 C18 40 43 27 50 11 Z",
  hex: "M50 13 Q53 13 56 15 L79 28 Q83 31 83 35 L83 65 Q83 69 79 72 L56 85 Q53 87 50 87 Q47 87 44 85 L21 72 Q17 69 17 65 L17 35 Q17 31 21 28 L44 15 Q47 13 50 13 Z",
  heart: "M50 85 C24 66 10 51 10 35 C10 22 20 13 32 13 C40 13 46 17 50 24 C54 17 60 13 68 13 C80 13 90 22 90 35 C90 51 76 66 50 85 Z",
};

/** A shape path scaled about the centre (for inner highlights / fillings). */
export const scaledShape = (shape: PieceShape, s: number) => `translate(${50 - 50 * s} ${50 - 50 * s}) scale(${s})`;

// ── Foils ────────────────────────────────────────────────────────────────────
export interface Foil {
  name: string;
  /** dark, mid, light — the metallic bands are built from these. */
  stops: readonly [string, string, string];
}

export const FOILS: readonly Foil[] = [
  { name: "gold", stops: ["#A67A2A", "#E6B85C", "#FFF0BF"] },
  { name: "rose", stops: ["#C9798F", "#F2B3C4", "#FFE8EF"] },
  { name: "raspberry", stops: ["#8E2149", "#E0457B", "#FF9DBE"] },
  { name: "pistachio", stops: ["#5F7F43", "#A8C686", "#E6F4D3"] },
  { name: "copper", stops: ["#7E4A22", "#C98A4B", "#F6CC98"] },
  { name: "lilac", stops: ["#7D73A0", "#C7BEE0", "#F5F1FF"] },
];

// ── Chocolates ───────────────────────────────────────────────────────────────
export interface Choco {
  /** shell gradient: highlight → base → shadow */
  shell: readonly [string, string, string];
  /** what's inside the bite */
  filling: string;
  fillingName: string;
  deco: "drizzle" | "nut" | "swirl" | "dust" | "stripe" | "leaf";
  decoColor: string;
}

export const CHOCOS: readonly Choco[] = [
  { shell: ["#A26A47", "#6E4029", "#3E2214"], filling: "#D99A4E", fillingName: "salted caramel", deco: "drizzle", decoColor: "#F3E3C8" },
  { shell: ["#6B4433", "#3E2419", "#1E100A"], filling: "#2A150D", fillingName: "dark ganache", deco: "dust", decoColor: "#E6B85C" },
  { shell: ["#F7EAD5", "#E2CBA6", "#B79A72"], filling: "#F28DA9", fillingName: "strawberry cream", deco: "stripe", decoColor: "#E0457B" },
  { shell: ["#A26A47", "#7B4A2E", "#4A2A1A"], filling: "#B9D48E", fillingName: "pistachio", deco: "nut", decoColor: "#A8C686" },
  { shell: ["#6B4433", "#3E2419", "#1E100A"], filling: "#A86C3D", fillingName: "hazelnut praline", deco: "swirl", decoColor: "#C98A4B" },
  { shell: ["#E9A3B6", "#D07C95", "#9E4F67"], filling: "#FFF1E0", fillingName: "rose & cream", deco: "leaf", decoColor: "#F7EAD5" },
];

export const HEART_CHOCO: Choco = { shell: ["#E2557F", "#B12A55", "#6E1230"], filling: "#5B1023", fillingName: "ruby heart", deco: "dust", decoColor: "#FFD98A" };
export const GOOEY_FILLING = "#E0A04F";

/** Stable pseudo-random from an integer seed. */
export const rnd = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

const sid = (id: string) => id.replace(/[^a-zA-Z0-9_-]/g, "");

// ── Bite geometry ────────────────────────────────────────────────────────────
// Bites land on these spots in order; each is a cluster of circles whose union
// reads as a scalloped tooth mark.
export const BITE_SPOTS = [
  { x: 78, y: 24, a: -0.75 },
  { x: 16, y: 62, a: 2.9 },
  { x: 62, y: 92, a: 1.7 },
] as const;

export function biteCircles(n: number, k = 1) {
  const out: { cx: number; cy: number; r: number }[] = [];
  for (let i = 0; i < n && i < BITE_SPOTS.length; i++) {
    const b = BITE_SPOTS[i];
    const ox = Math.cos(b.a);
    const oy = Math.sin(b.a);
    const cx = b.x + ox * 4;
    const cy = b.y + oy * 4;
    out.push({ cx, cy, r: 21 * k });
    // tooth scallops along the inner rim
    for (let t = -2; t <= 2; t++) {
      const ang = b.a + Math.PI + t * 0.42;
      out.push({ cx: cx + Math.cos(ang) * 17 * k, cy: cy + Math.sin(ang) * 17 * k, r: 8 * k });
    }
  }
  return out;
}

// ── <ChocoArt> — a glossy chocolate, optionally bitten ───────────────────────
export function ChocoArt({
  shape,
  choco,
  bites = 0,
  gooey,
  size = 100,
  style,
}: {
  shape: PieceShape;
  choco: Choco;
  bites?: number;
  gooey?: boolean;
  size?: number | string;
  style?: CSSProperties;
}) {
  const id = sid(useId());
  const d = SHAPES[shape];
  const filling = gooey ? GOOEY_FILLING : choco.filling;
  const outer = biteCircles(bites, 1);
  const inner = biteCircles(bites, 0.78);
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ display: "block", overflow: "visible", ...style }} aria-hidden>
      <defs>
        <radialGradient id={`sh${id}`} cx="35%" cy="28%" r="80%">
          <stop offset="0" stopColor={choco.shell[0]} />
          <stop offset="0.55" stopColor={choco.shell[1]} />
          <stop offset="1" stopColor={choco.shell[2]} />
        </radialGradient>
        <radialGradient id={`fl${id}`} cx="50%" cy="45%" r="60%">
          <stop offset="0" stopColor={filling} stopOpacity="1" />
          <stop offset="1" stopColor={filling} stopOpacity="0.85" />
        </radialGradient>
        <mask id={`mo${id}`} maskUnits="userSpaceOnUse" x="-20" y="-20" width="140" height="140">
          <rect x="-20" y="-20" width="140" height="140" fill="#fff" />
          {outer.map((c, i) => (
            <circle key={i} cx={c.cx} cy={c.cy} r={c.r} fill="#000" />
          ))}
        </mask>
        <mask id={`mi${id}`} maskUnits="userSpaceOnUse" x="-20" y="-20" width="140" height="140">
          <rect x="-20" y="-20" width="140" height="140" fill="#fff" />
          {inner.map((c, i) => (
            <circle key={i} cx={c.cx} cy={c.cy} r={c.r} fill="#000" />
          ))}
        </mask>
        <clipPath id={`ci${id}`}>
          <path d={d} transform={scaledShape(shape, 0.84)} />
        </clipPath>
      </defs>
      {/* contact shadow */}
      <ellipse cx="52" cy="88" rx="34" ry="7" fill="rgba(0,0,0,.35)" />
      {/* filling, visible as a crescent along the bite edge */}
      {bites > 0 && (
        <g mask={`url(#mi${id})`}>
          <path d={d} fill={choco.shell[2]} />
          <g clipPath={`url(#ci${id})`}>
            <rect x="0" y="0" width="100" height="100" fill={`url(#fl${id})`} />
            {gooey && <circle cx="58" cy="44" r="8" fill="#FFD08A" opacity=".55" />}
          </g>
        </g>
      )}
      <g mask={bites > 0 ? `url(#mo${id})` : undefined}>
        <path d={d} fill={`url(#sh${id})`} />
        {/* rim light + gloss */}
        <path d={d} fill="none" stroke="rgba(255,255,255,.14)" strokeWidth="1.4" transform={scaledShape(shape, 0.94)} />
        <ellipse cx="36" cy="31" rx="15" ry="8" fill="#fff" opacity=".22" transform="rotate(-28 36 31)" />
        <ellipse cx="31" cy="30" rx="5" ry="2.6" fill="#fff" opacity=".5" transform="rotate(-28 31 30)" />
        <Deco choco={choco} shape={shape} />
      </g>
    </svg>
  );
}

function Deco({ choco, shape }: { choco: Choco; shape: PieceShape }) {
  const c = choco.decoColor;
  switch (choco.deco) {
    case "drizzle":
      return <path d="M24 46 L34 38 L42 52 L52 38 L60 52 L68 40 L77 50" fill="none" stroke={c} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" opacity=".9" />;
    case "stripe":
      return (
        <g stroke={c} strokeWidth="3" strokeLinecap="round" opacity=".85">
          <path d="M30 40 L70 32" />
          <path d="M28 52 L72 44" />
          <path d="M30 64 L68 56" />
        </g>
      );
    case "nut":
      return (
        <g>
          <ellipse cx="52" cy="46" rx="11" ry="7.5" fill={c} transform="rotate(-20 52 46)" />
          <ellipse cx="50" cy="44" rx="5" ry="2.4" fill="#fff" opacity=".45" transform="rotate(-20 50 44)" />
          <path d="M44 49 Q52 44 60 43" stroke="#5F7F43" strokeWidth="1.2" fill="none" />
        </g>
      );
    case "swirl":
      return <path d="M50 50 m-12 0 a12 12 0 1 1 12 12 a8 8 0 1 1 -8 -8 a4 4 0 1 1 4 4" fill="none" stroke={c} strokeWidth="2.6" strokeLinecap="round" opacity=".9" />;
    case "leaf":
      return (
        <g>
          <path d="M40 54 Q50 32 64 38 Q58 56 40 54 Z" fill={c} opacity=".9" />
          <path d="M42 53 Q52 46 61 40" stroke="#D07C95" strokeWidth="1" fill="none" />
        </g>
      );
    case "dust":
    default: {
      const dots = Array.from({ length: shape === "heart" ? 16 : 11 }, (_, i) => ({ x: 34 + rnd(i + 3) * 34, y: 30 + rnd(i + 17) * 30, r: 0.8 + rnd(i + 31) * 1.6 }));
      return (
        <g fill={c}>
          {dots.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r={p.r} opacity={0.65 + rnd(i) * 0.35} />
          ))}
          <path d="M44 40 l4 -6 l5 5 l-3 6 z" opacity=".85" />
        </g>
      );
    }
  }
}

// ── <FoilArt> — a foil-wrapped piece (tray view) ─────────────────────────────
export function FoilArt({ shape, foil, seed = 1, size = 100, style }: { shape: PieceShape; foil: Foil; seed?: number; size?: number | string; style?: CSSProperties }) {
  const id = sid(useId());
  const d = SHAPES[shape];
  const [dark, mid, light] = foil.stops;
  const crinkles = Array.from({ length: 7 }, (_, i) => {
    const x0 = 14 + rnd(seed * 7 + i) * 70;
    const y0 = 14 + rnd(seed * 13 + i) * 70;
    const pts = [0, 1, 2, 3].map((k) => `${(x0 + (rnd(seed + i * 5 + k) - 0.5) * 30).toFixed(1)},${(y0 + (rnd(seed * 3 + i + k * 11) - 0.5) * 30).toFixed(1)}`);
    return pts.join(" ");
  });
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ display: "block", overflow: "visible", ...style }} aria-hidden>
      <defs>
        <linearGradient id={`fg${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={mid} />
          <stop offset="0.18" stopColor={light} />
          <stop offset="0.34" stopColor={mid} />
          <stop offset="0.5" stopColor={dark} />
          <stop offset="0.64" stopColor={mid} />
          <stop offset="0.78" stopColor={light} />
          <stop offset="1" stopColor={dark} />
        </linearGradient>
        <clipPath id={`fc${id}`}>
          <path d={d} />
        </clipPath>
      </defs>
      <ellipse cx="52" cy="88" rx="34" ry="7" fill="rgba(0,0,0,.35)" />
      <path d={d} fill={`url(#fg${id})`} />
      <g clipPath={`url(#fc${id})`} fill="none" strokeLinejoin="round">
        {crinkles.map((p, i) => (
          <polyline key={i} points={p} stroke={i % 2 ? "rgba(255,255,255,.55)" : "rgba(0,0,0,.18)"} strokeWidth={i % 2 ? 1.1 : 0.9} />
        ))}
        {/* folded seam where the wrapper is tucked */}
        <path d="M10 70 Q50 58 92 72" stroke="rgba(0,0,0,.16)" strokeWidth="1.4" />
        <path d="M10 72 Q50 60 92 74" stroke="rgba(255,255,255,.4)" strokeWidth=".8" />
        <ellipse cx="36" cy="30" rx="16" ry="7" fill="#fff" opacity=".35" transform="rotate(-30 36 30)" />
      </g>
      {/* tiny embossed heart seal */}
      <path d="M50 57 C44 53 41 50 41 46.5 C41 44 43 42.5 45 42.5 C47 42.5 49 43.6 50 45.3 C51 43.6 53 42.5 55 42.5 C57 42.5 59 44 59 46.5 C59 50 56 53 50 57 Z" fill={dark} opacity=".45" />
      <path d="M50 56 C45 52.5 42 50 42 46.8 C42 44.6 43.6 43.4 45.2 43.4" fill="none" stroke={light} strokeWidth=".8" opacity=".9" />
      <path d={d} fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="1" />
    </svg>
  );
}

// ── <CupArt> — a fluted paper candy cup, seen from above ─────────────────────
export function CupArt({ color = "#5A3220", edge = "#3B2117", size = 100, style }: { color?: string; edge?: string; size?: number | string; style?: CSSProperties }) {
  const id = sid(useId());
  const N = 28;
  const pts: string[] = [];
  for (let i = 0; i <= N * 2; i++) {
    const a = (i / (N * 2)) * Math.PI * 2;
    const r = i % 2 ? 46 : 49;
    pts.push(`${(50 + Math.cos(a) * r).toFixed(2)},${(50 + Math.sin(a) * r).toFixed(2)}`);
  }
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} style={{ display: "block", ...style }} aria-hidden>
      <defs>
        <radialGradient id={`cg${id}`} cx="50%" cy="45%" r="55%">
          <stop offset="0.55" stopColor={edge} />
          <stop offset="0.8" stopColor={color} />
          <stop offset="1" stopColor={color} />
        </radialGradient>
      </defs>
      <polygon points={pts.join(" ")} fill={`url(#cg${id})`} />
      <g stroke="rgba(255,255,255,.12)" strokeWidth=".8">
        {Array.from({ length: N }, (_, i) => {
          const a = (i / N) * Math.PI * 2;
          return <line key={i} x1={50 + Math.cos(a) * 34} y1={50 + Math.sin(a) * 34} x2={50 + Math.cos(a) * 47} y2={50 + Math.sin(a) * 47} />;
        })}
      </g>
      <circle cx="50" cy="50" r="34" fill="rgba(0,0,0,.28)" />
    </svg>
  );
}

// ── Assortment of piece looks, by tray slot ──────────────────────────────────
const SHAPE_CYCLE: readonly PieceShape[] = ["round", "square", "drop", "hex", "oval", "square", "round", "drop", "hex"];

export interface PieceLook {
  shape: PieceShape;
  foil: Foil;
  choco: Choco;
  seed: number;
}

export function pieceLook(slot: number): PieceLook {
  return {
    shape: SHAPE_CYCLE[slot % SHAPE_CYCLE.length],
    foil: FOILS[(slot * 5 + 1) % FOILS.length],
    choco: CHOCOS[(slot * 7 + 2) % CHOCOS.length],
    seed: slot + 3,
  };
}

// ── The page's own keyframes (all off under reduced motion) ──────────────────
export const CHOCO_CSS = `
@keyframes ck-wobble { 0%, 86%, 100% { transform: rotate(0) } 89% { transform: rotate(-6deg) scale(1.03) } 92% { transform: rotate(5deg) } 95% { transform: rotate(-2deg) } }
@keyframes ck-swing { 0%, 100% { transform: rotate(-4deg) } 50% { transform: rotate(5deg) } }
@keyframes ck-glow { 0%, 100% { opacity: .55; transform: scale(.94) } 50% { opacity: 1; transform: scale(1.08) } }
@keyframes ck-steam { 0% { transform: translateY(6px) scaleX(1); opacity: 0 } 30% { opacity: .55 } 100% { transform: translateY(-34px) scaleX(1.6); opacity: 0 } }
@keyframes ck-finger { 0% { transform: translate(0, 0); opacity: 0 } 15% { opacity: 1 } 70% { transform: translate(var(--ck-fx, 0px), var(--ck-fy, 70px)); opacity: 1 } 100% { transform: translate(var(--ck-fx, 0px), var(--ck-fy, 70px)); opacity: 0 } }
@keyframes ck-shimmer { 0% { transform: translateX(-120%) skewX(-18deg) } 60%, 100% { transform: translateX(260%) skewX(-18deg) } }
@keyframes ck-dust { 0% { transform: translate3d(0, 0, 0); opacity: 0 } 15% { opacity: var(--ck-o, .5) } 100% { transform: translate3d(var(--ck-dx, 10px), -60vh, 0); opacity: 0 } }
@keyframes ck-pulse-ring { 0% { transform: scale(.9); opacity: .9 } 100% { transform: scale(1.5); opacity: 0 } }
@keyframes ck-drip { 0% { transform: scaleY(0) } 100% { transform: scaleY(1) } }
.ck-wobble { animation: ck-wobble 4.2s ease-in-out infinite; transform-origin: 50% 70% }
.ck-swing { animation: ck-swing 3.4s ease-in-out infinite; transform-origin: 50% 0 }
.ck-glow { animation: ck-glow 1.6s ease-in-out infinite }
.ck-steam { animation: ck-steam 2.6s ease-out infinite }
.ck-finger { animation: ck-finger 2.2s cubic-bezier(.4,0,.2,1) infinite }
.ck-shimmer::after { content: ""; position: absolute; inset: 0; width: 40%; background: linear-gradient(90deg, transparent, rgba(255,255,255,.35), transparent); animation: ck-shimmer 3.2s ease-in-out infinite; pointer-events: none }
.ck-dust { animation: ck-dust var(--ck-d, 14s) linear infinite }
.ck-pulse-ring { animation: ck-pulse-ring 1.4s ease-out infinite }
.ck-drip { animation: ck-drip 1.3s cubic-bezier(.3,.6,.3,1) both; transform-origin: 50% 0; transform-box: fill-box }
@media (prefers-reduced-motion: reduce) {
  .ck-wobble, .ck-swing, .ck-glow, .ck-steam, .ck-finger, .ck-dust, .ck-pulse-ring, .ck-drip, .ck-shimmer::after { animation: none !important }
  .ck-finger { opacity: .9 }
}
`;

/** Warm cocoa-dust motes drifting up (deterministic, decorative). */
export function CocoaDust({ count = 22 }: { count?: number }) {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {Array.from({ length: count }, (_, i) => {
        const size = 2 + rnd(i + 5) * 4;
        return (
          <span
            key={i}
            className="ck-dust"
            style={
              {
                position: "absolute",
                left: `${rnd(i + 1) * 100}%`,
                top: `${55 + rnd(i + 9) * 50}%`,
                width: size,
                height: size,
                borderRadius: "50%",
                background: i % 3 ? "#E9B98A" : "#FFE7A8",
                filter: "blur(.6px)",
                "--ck-d": `${11 + rnd(i + 2) * 12}s`,
                "--ck-dx": `${(rnd(i + 4) - 0.5) * 90}px`,
                "--ck-o": `${0.25 + rnd(i + 7) * 0.4}`,
                animationDelay: `${-rnd(i + 3) * 20}s`,
              } as CSSProperties
            }
          />
        );
      })}
    </div>
  );
}
