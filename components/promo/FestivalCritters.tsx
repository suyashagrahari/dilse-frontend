"use client";

// ─── Festival visitors: Navratri Dandiya and Diwali ──────────────────────────
//
// The festival kinds for the shared critter engine (CritterLayer.tsx — the same
// waves as Halloween: the first right away, then every 2–3 s, several at once,
// capped, never over a CTA, tap to shoo, off under reduced motion). Each
// festival brings its own crowd:
//
//   dandiya — panda    the bubudubu panda dances across with his sticks, hopping
//             sticks   a pair of lacquered dandiya sticks twirls across the hero
//             mirror   a mirror-work disc pops up, spins and flashes
//             bandhani a bandhani dot flower blooms and fades
//             petal    marigold heads tumble down from the top
//   diwali  — diya     a little clay diya floats up, its flame flickering
//             lantern  a paper sky lantern rises, swaying, glowing
//             dudu     the sparkler penguin waddles across
//             sparkle  a burst of Diwali sparkle-stars pops and fades
//             burst    a firework blooms high in the sky
//             rangoli  a rangoli blooms open, turns and fades
//
// The SVG kinds are data URIs (nothing to download); the GIFs are small CDN
// files (12–139 KB), preloaded after idle. The heavy skyshots are never used.

import { useFestival } from "@/hooks/useSeason";
import { FESTIVE_GIF, type FestivalId } from "@/lib/season";
import CritterLayer, { clearOf, crossingLane, rand, toLayer, type Box, type Planner } from "./CritterLayer";

type DandiyaKind = "panda" | "sticks" | "mirror" | "bandhani" | "petal";
type DiwaliKind = "diya" | "lantern" | "dudu" | "sparkle" | "burst" | "rangoli";
type Kind = DandiyaKind | DiwaliKind;

const svgUri = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

const LANTERN = svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 84"><defs><radialGradient id="g" cx="50%" cy="72%" r="70%"><stop offset="0" stop-color="#fff6c8"/><stop offset=".35" stop-color="#ffc94d"/><stop offset=".8" stop-color="#f58a12"/><stop offset="1" stop-color="#c8141f"/></radialGradient><radialGradient id="h" cx="50%" cy="60%" r="50%"><stop offset="0" stop-color="rgba(255,200,90,.55)"/><stop offset="1" stop-color="rgba(255,200,90,0)"/></radialGradient></defs><ellipse cx="30" cy="46" rx="30" ry="38" fill="url(#h)"/><path d="M14 12h32l7 50c-6 6-14 8-23 8s-17-2-23-8l7-50z" fill="url(#g)"/><path d="M30 12v58M22 12l-3 57M38 12l3 57" stroke="#9e0f18" stroke-width="1" opacity=".45"/><path d="M14 12h32" stroke="#7a0f12" stroke-width="2.4" stroke-linecap="round"/><ellipse cx="30" cy="64" rx="9" ry="3.6" fill="#fff8d8" opacity=".9"/></svg>`);

const DIYA = svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 56"><defs><radialGradient id="f" cx="50%" cy="70%" r="60%"><stop offset="0" stop-color="#fff6c8"/><stop offset=".45" stop-color="#ffd36b"/><stop offset="1" stop-color="#f07c0a"/></radialGradient><linearGradient id="b" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#d9452b"/><stop offset="1" stop-color="#7a0f12"/></linearGradient><radialGradient id="h" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="rgba(255,200,90,.6)"/><stop offset="1" stop-color="rgba(255,200,90,0)"/></radialGradient></defs><circle cx="32" cy="20" r="20" fill="url(#h)"/><path d="M32 6c5 7 7.4 12 7.4 15.6A7.4 7.4 0 0 1 32 29a7.4 7.4 0 0 1-7.4-7.4C24.6 18 27 13 32 6z" fill="url(#f)"/><path d="M32 14c2 3 3 5 3 6.6a3 3 0 0 1-6 0c0-1.6 1-3.6 3-6.6z" fill="#fffbe8"/><path d="M4 32h56c-2.6 11-13 18-28 18S6.6 43 4 32z" fill="url(#b)"/><path d="M4 32h56" stroke="#ffcf7a" stroke-width="2.4" stroke-linecap="round"/><circle cx="18" cy="39" r="1.8" fill="#ffd36b"/><circle cx="32" cy="41" r="1.8" fill="#ffd36b"/><circle cx="46" cy="39" r="1.8" fill="#ffd36b"/></svg>`);

const stick = (rot: number, a: string, b: string, tassel: string) =>
  `<g transform="rotate(${rot} 32 32)"><rect x="29" y="3" width="6" height="56" rx="3" fill="url(#g${a.slice(1)})"/><rect x="29" y="11" width="6" height="3" fill="#f7c64a"/><rect x="29" y="48" width="6" height="3" fill="#f7c64a"/><path d="M32 22l3 5-3 5-3-5z" fill="#f7c64a"/><path d="M32 35l2.4 4-2.4 4-2.4-4z" fill="${b}"/><rect x="29" y="3" width="6" height="3" rx="1.5" fill="#f7c64a"/><path d="M30 59h4l1.4 5h-6.8z" fill="${tassel}"/></g>`;
const STICKS = svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 68"><defs><linearGradient id="g1f5fd1" x1="0" x2="1"><stop offset="0" stop-color="#123a8a"/><stop offset=".45" stop-color="#2f74ee"/><stop offset="1" stop-color="#123a8a"/></linearGradient><linearGradient id="gff3d9a" x1="0" x2="1"><stop offset="0" stop-color="#a80f5f"/><stop offset=".45" stop-color="#ff4fa6"/><stop offset="1" stop-color="#a80f5f"/></linearGradient></defs>${stick(-34, "#1f5fd1", "#ff3d9a", "#ff3d9a")}${stick(34, "#ff3d9a", "#12b5a6", "#12b5a6")}</svg>`);

const MIRROR = svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><defs><radialGradient id="m" cx="38%" cy="34%" r="70%"><stop offset="0" stop-color="#fff"/><stop offset=".45" stop-color="#e3e9f1"/><stop offset="1" stop-color="#8f9cad"/></radialGradient><radialGradient id="h" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="rgba(255,255,255,.7)"/><stop offset="1" stop-color="rgba(255,255,255,0)"/></radialGradient></defs><circle cx="32" cy="32" r="32" fill="url(#h)"/>${Array.from({ length: 12 }, (_, i) => `<ellipse cx="32" cy="12" rx="4" ry="6" fill="${i % 2 ? "#ff3d9a" : "#ffb000"}" transform="rotate(${i * 30} 32 32)"/>`).join("")}<circle cx="32" cy="32" r="15" fill="#7a0f12"/><circle cx="32" cy="32" r="15" fill="none" stroke="#f7c64a" stroke-width="2" stroke-dasharray="2.4 2"/><circle cx="32" cy="32" r="11" fill="url(#m)"/><path d="M25 28a8.6 8.6 0 0 1 6.4-5.6" stroke="#fff" stroke-width="2.4" stroke-linecap="round" fill="none"/></svg>`);

const BANDHANI = svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${[0, 1, 2].map((ring) => Array.from({ length: 6 + ring * 6 }, (_, i) => { const a = (i / (6 + ring * 6)) * Math.PI * 2; const r = 7 + ring * 10; return `<circle cx="${(32 + Math.cos(a) * r).toFixed(1)}" cy="${(32 + Math.sin(a) * r).toFixed(1)}" r="${(3 - ring * 0.6).toFixed(1)}" fill="${ring === 1 ? "#ffb000" : "#fff4e2"}" stroke="#7a0f12" stroke-width=".8"/>`; }).join("")).join("")}<circle cx="32" cy="32" r="3.6" fill="#ff3d9a"/></svg>`);

const PETAL = svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${Array.from({ length: 12 }, (_, i) => `<ellipse cx="12" cy="5.6" rx="2.6" ry="4.4" fill="${(i * 30) % 60 ? "#ffb020" : "#f07c0a"}" transform="rotate(${i * 30} 12 12)"/>`).join("")}<circle cx="12" cy="12" r="4.2" fill="#ffcf3a"/><circle cx="12" cy="12" r="2" fill="#e8820c"/></svg>`);

const RANGOLI = svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${Array.from({ length: 8 }, (_, i) => `<path d="M32 6c5 7 5 14 0 20-5-6-5-13 0-20z" fill="${i % 2 ? "#ff6f9c" : "#ffc53d"}" transform="rotate(${i * 45} 32 32)"/>`).join("")}${Array.from({ length: 8 }, (_, i) => `<path d="M32 14c3 4 3 8 0 12-3-4-3-8 0-12z" fill="${i % 2 ? "#33d1c1" : "#fff0c8"}" transform="rotate(${i * 45 + 22.5} 32 32)"/>`).join("")}<circle cx="32" cy="32" r="6.5" fill="#ffcf5a"/><circle cx="32" cy="32" r="3" fill="#c8141f"/>${Array.from({ length: 16 }, (_, i) => `<circle cx="32" cy="2.6" r="1.5" fill="${i % 2 ? "#ffcf5a" : "#ff6f9c"}" transform="rotate(${i * 22.5} 32 32)"/>`).join("")}</svg>`);

const ART: Record<Kind, { src: string; ratio: number }> = {
  panda: { src: FESTIVE_GIF("bubudubu-dandiya-playing.webp"), ratio: 240 / 236 },
  sticks: { src: STICKS, ratio: 68 / 64 },
  mirror: { src: MIRROR, ratio: 1 },
  bandhani: { src: BANDHANI, ratio: 1 },
  petal: { src: PETAL, ratio: 1 },
  diya: { src: DIYA, ratio: 56 / 64 },
  lantern: { src: LANTERN, ratio: 84 / 60 },
  dudu: { src: FESTIVE_GIF("celebration-with-crackers-dudu.webp"), ratio: 1 },
  sparkle: { src: FESTIVE_GIF("diwali-sparkles-stars.gif"), ratio: 467 / 498 },
  burst: { src: FESTIVE_GIF("fireworks-hanabi-skyshot.gif"), ratio: 1 },
  rangoli: { src: RANGOLI, ratio: 1 },
};

/** A vertical column `w` wide, the full region tall, that misses `avoid`; x biased to the edges. */
function column(W: number, H: number, avoid: Box[], w: number): Box | null {
  for (let i = 0; i < 14; i++) {
    const edge = Math.random() < 0.7;
    const x = edge
      ? (Math.random() < 0.5 ? rand(W * 0.01, W * 0.2) : rand(W * 0.74, W * 0.99 - w))
      : rand(W * 0.2, W * 0.74 - w);
    const box = { top: 0, bottom: H, left: x, right: x + w };
    // Only the middle 80% of the column has to be clear: the ends are where it fades.
    if (clearOf({ ...box, top: H * 0.1, bottom: H * 0.9 }, avoid, 6)) return box;
  }
  return null;
}

/** A free spot of w×h between the `lo` and `hi` fractions of the region's height. */
function spot(W: number, H: number, avoid: Box[], w: number, h: number, lo: number, hi: number): Box | null {
  for (let i = 0; i < 14; i++) {
    const left = rand(W * 0.02, W * 0.98 - w);
    const top = rand(H * lo, Math.max(H * lo, H * hi - h));
    const box = { top, bottom: top + h, left, right: left + w };
    if (clearOf(box, avoid, 4)) return box;
  }
  return null;
}

const POP: Keyframe[] = [
  { transform: "scale(.6)", opacity: 0 },
  { transform: "scale(1)", opacity: 1, offset: 0.15 },
  { transform: "scale(1)", opacity: 1, offset: 0.75 },
  { transform: "scale(1.05)", opacity: 0 },
];

const plan: Planner = (k, W, H, oy, avoid, id) => {
  const kind = k as Kind;
  const s = W < 640 ? 0.72 : W < 1024 ? 0.86 : 1;
  const { src, ratio } = ART[kind];
  const layer = (b: Box): Box => toLayer(b, oy);

  if (kind === "panda" || kind === "dudu") {
    // Dances (panda) or waddles (penguin) across: hops with a little spin half-way.
    const w = Math.round((kind === "panda" ? rand(74, 100) : rand(80, 104)) * s);
    const h = Math.round(w * ratio);
    const hop = Math.round(h * (kind === "panda" ? 0.22 : 0.08));
    const lane = crossingLane(W, H, avoid, h, hop, 0.12, 0.96);
    if (!lane) return null;
    const rtl = Math.random() < 0.5;
    const dx = W + w * 2;
    const steps = kind === "panda" ? 10 : 14;
    const frames: Keyframe[] = Array.from({ length: steps + 1 }, (_, i) => {
      const f = i / steps;
      const x = (rtl ? -1 : 1) * f * dx;
      const y = i % 2 ? -hop : 0;
      const flip = rtl && kind === "dudu" ? " scaleX(-1)" : "";
      const turn = kind === "panda" ? (i === 5 ? " rotate(-10deg)" : i === 6 ? " rotate(8deg)" : "") : ` rotate(${i % 2 ? 4 : -4}deg)`;
      return { transform: `translate(${Math.round(x)}px,${y}px)${turn}${flip}`, opacity: f === 0 || f === 1 ? 0 : 1 };
    });
    frames[1].opacity = 1;
    frames[steps - 1].opacity = 1;
    return {
      id, kind, src, lane: layer(lane), w, h, left: rtl ? W + w * 0.2 : -w * 1.2, top: hop,
      duration: rand(5600, 7400) * (W < 640 ? 0.8 : 1), frames, shooText: kind === "panda" ? "Garba!" : "Happy Diwali!",
    };
  }
  if (kind === "sticks") {
    // A pair of sticks twirls across in a shallow arc, two full turns.
    const w = Math.round(rand(40, 58) * s);
    const h = Math.round(w * ratio);
    const arc = Math.round(h * 0.9);
    const lane = crossingLane(W, H, avoid, h, arc, 0.1, 0.9);
    if (!lane) return null;
    const rtl = Math.random() < 0.5;
    const dx = W + w * 2;
    const frames: Keyframe[] = [0, 0.25, 0.5, 0.75, 1].map((f) => ({
      transform: `translate(${Math.round((rtl ? -1 : 1) * f * dx)}px,${Math.round(-Math.sin(f * Math.PI) * arc)}px) rotate(${(rtl ? -1 : 1) * Math.round(f * 900)}deg)`,
      opacity: f === 0 || f === 1 ? 0 : 1,
    }));
    return {
      id, kind, src, lane: layer(lane), w, h, left: rtl ? W + w * 0.2 : -w * 1.2, top: arc,
      duration: rand(3800, 5000), frames, shooRate: 5, shooText: "Twirl!",
    };
  }
  if (kind === "mirror" || kind === "bandhani" || kind === "rangoli") {
    const w = Math.round((kind === "mirror" ? rand(38, 56) : kind === "bandhani" ? rand(44, 64) : rand(54, 80)) * s);
    const box = spot(W, H, avoid, w, w, 0.05, 0.95);
    if (!box) return null;
    const spin = kind === "mirror" ? 180 : kind === "rangoli" ? 120 : 40;
    return {
      id, kind, src, lane: layer(box), w, h: w, left: 0, top: 0, duration: kind === "mirror" ? 2600 : 3200, shooRate: 3,
      shooText: kind === "mirror" ? "✨" : undefined,
      frames: [
        { transform: "scale(.2) rotate(0deg)", opacity: 0 },
        { transform: `scale(1.08) rotate(${spin * 0.3}deg)`, opacity: 1, offset: 0.18 },
        { transform: `scale(1) rotate(${spin * 0.45}deg)`, opacity: 1, offset: 0.3 },
        { transform: `scale(1) rotate(${spin * 0.85}deg)`, opacity: 1, offset: 0.75 },
        { transform: `scale(.9) rotate(${spin}deg)`, opacity: 0 },
      ],
    };
  }
  if (kind === "petal") {
    // Marigold heads tumble down a column, swaying and spinning.
    const w = Math.round(rand(18, 28) * s);
    const sway = Math.round(w * 1.4);
    const lane = column(W, H, avoid, w + sway * 2);
    if (!lane) return null;
    const fall = H + w;
    return {
      id, kind, src, lane: layer(lane), w, h: w, left: sway, top: -w, duration: rand(5200, 7200), shooRate: 4,
      frames: [0, 0.25, 0.5, 0.75, 1].map((f) => ({
        transform: `translate(${Math.round(Math.sin(f * Math.PI * 3) * sway)}px,${Math.round(f * fall)}px) rotate(${Math.round(f * 540)}deg)`,
        opacity: f === 0 ? 0 : f === 1 ? 0 : 1,
      })),
    };
  }
  if (kind === "lantern" || kind === "diya") {
    const w = Math.round((kind === "lantern" ? rand(30, 46) : rand(34, 48)) * s);
    const h = Math.round(w * ratio);
    const sway = Math.round(w * 0.6);
    const lane = column(W, H, avoid, w + sway * 2);
    if (!lane) return null;
    const rise = H + h;
    return {
      id, kind, src, lane: layer(lane), w, h, left: sway, top: H, duration: rand(6500, 9000),
      shooRate: 5, shooText: kind === "diya" ? "✨" : "Shubh!",
      frames: [0, 0.25, 0.5, 0.75, 1].map((f) => ({
        transform: `translate(${Math.round(Math.sin(f * Math.PI * 2) * sway)}px,${Math.round(-f * rise)}px) rotate(${Math.round(Math.sin(f * Math.PI * 2) * 6)}deg)`,
        opacity: f === 0 ? 0 : f === 1 ? 0 : f >= 0.75 ? 0.75 : 1,
      })),
    };
  }
  if (kind === "sparkle") {
    const w = Math.round(rand(90, 130) * s);
    const h = Math.round(w * ratio);
    const box = spot(W, H, avoid, w, h, 0.05, 0.95);
    if (!box) return null;
    return { id, kind, src, lane: layer(box), w, h, left: 0, top: 0, duration: 2600, shooRate: 3, frames: POP };
  }
  // burst: a firework high up in the region
  const w = Math.round(rand(120, 170) * s);
  const box = spot(W, H, avoid, w, w, 0.02, 0.6);
  if (!box) return null;
  return {
    id, kind, src, lane: layer(box), w, h: w, left: 0, top: 0, duration: 2400, shooRate: 3,
    frames: [
      { opacity: 0 },
      { opacity: 1, offset: 0.08 },
      { opacity: 1, offset: 0.8 },
      { opacity: 0 },
    ],
  };
};

const srcOf = (k: string) => ART[k as Kind].src;

export const FESTIVAL_KINDS: Record<FestivalId, Kind[]> = {
  dandiya: ["panda", "sticks", "mirror", "bandhani", "petal"],
  diwali: ["diya", "lantern", "dudu", "sparkle", "burst", "rangoli"],
};

export default function FestivalCritters({
  kind,
  scope = "parent",
  avoid = "",
}: {
  kind: FestivalId;
  /** "parent": fills the nearest positioned ancestor (the home hero). "page": the visible part of the page (the blog). */
  scope?: "parent" | "page";
  /** Selector for things a visitor must never cover (CTAs, the navbar). */
  avoid?: string;
}) {
  const on = useFestival() === kind;
  return <CritterLayer on={on} scope={scope} kinds={FESTIVAL_KINDS[kind]} avoid={avoid} plan={plan} srcOf={srcOf} css={kind === "dandiya" ? DANDIYA_CSS : DIWALI_CSS} />;
}

const DANDIYA_CSS = `
.hwc-panda img { filter: drop-shadow(0 6px 10px rgba(90,7,12,.3)); }
.hwc-sticks img { filter: drop-shadow(0 0 8px rgba(255,214,120,.8)); }
.hwc-mirror img { filter: drop-shadow(0 0 12px rgba(255,255,255,.75)); }
.hwc-bandhani img, .hwc-petal img { filter: drop-shadow(0 2px 4px rgba(90,7,12,.35)); }
.hwc-mirror, .hwc-bandhani { transform-origin: 50% 50%; }
.hwc-eek { color: #3a0508; background: #ffb000; }
`;

const DIWALI_CSS = `
.hwc-dudu img { filter: drop-shadow(0 6px 10px rgba(51,6,10,.3)); }
.hwc-lantern img, .hwc-diya img { filter: drop-shadow(0 0 10px rgba(255,190,80,.75)); }
.hwc-rangoli img { filter: drop-shadow(0 0 8px rgba(255,197,61,.6)); }
.hwc-sparkle, .hwc-burst, .hwc-rangoli { transform-origin: 50% 50%; }
.hwc-eek { color: #3a0a04; background: #ffcf5a; }
`;
