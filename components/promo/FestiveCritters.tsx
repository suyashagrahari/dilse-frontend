"use client";

// ─── Festive visitors: Navratri & Diwali ─────────────────────────────────────
//
// The festive kinds for the shared critter engine (CritterLayer.tsx — the same
// waves as Halloween: the first right away, then every 2–3 s, several at once,
// capped, never over a CTA, tap to shoo, off under reduced motion):
//
//   dandiya  — the bubudubu panda dances across with his dandiya sticks, hopping
//   lantern  — a paper sky lantern rises from the bottom, swaying, glowing
//   diya     — a little clay diya floats up, its flame flickering
//   sparkle  — a burst of Diwali sparkle-stars pops at a random spot and fades
//   burst    — a firework blooms high in the sky and fades
//
// The lantern and diya are inline SVG (data URIs, nothing to download); the
// panda, sparkles and firework are small CDN GIFs (12–79 KB), preloaded after
// idle like the Halloween ones. The heavy skyshots are never used here.

import { useIsFestive } from "@/hooks/useSeason";
import { FESTIVE_GIF } from "@/lib/season";
import CritterLayer, { clearOf, crossingLane, rand, toLayer, type Box, type Planner } from "./CritterLayer";

type Kind = "dandiya" | "lantern" | "diya" | "sparkle" | "burst";

const svgUri = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

const LANTERN = svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 84"><defs><radialGradient id="g" cx="50%" cy="72%" r="70%"><stop offset="0" stop-color="#fff6c8"/><stop offset=".35" stop-color="#ffc94d"/><stop offset=".8" stop-color="#f58a12"/><stop offset="1" stop-color="#d4570a"/></radialGradient><radialGradient id="h" cx="50%" cy="60%" r="50%"><stop offset="0" stop-color="rgba(255,200,90,.55)"/><stop offset="1" stop-color="rgba(255,200,90,0)"/></radialGradient></defs><ellipse cx="30" cy="46" rx="30" ry="38" fill="url(#h)"/><path d="M14 12h32l7 50c-6 6-14 8-23 8s-17-2-23-8l7-50z" fill="url(#g)"/><path d="M30 12v58M22 12l-3 57M38 12l3 57" stroke="#c9530a" stroke-width="1" opacity=".45"/><path d="M14 12h32" stroke="#8a3210" stroke-width="2.4" stroke-linecap="round"/><ellipse cx="30" cy="64" rx="9" ry="3.6" fill="#fff8d8" opacity=".9"/></svg>`);

const DIYA = svgUri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 56"><defs><radialGradient id="f" cx="50%" cy="70%" r="60%"><stop offset="0" stop-color="#fff6c8"/><stop offset=".45" stop-color="#ffd36b"/><stop offset="1" stop-color="#f07c0a"/></radialGradient><linearGradient id="b" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#e2722b"/><stop offset="1" stop-color="#8a3210"/></linearGradient><radialGradient id="h" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="rgba(255,200,90,.6)"/><stop offset="1" stop-color="rgba(255,200,90,0)"/></radialGradient></defs><circle cx="32" cy="20" r="20" fill="url(#h)"/><path d="M32 6c5 7 7.4 12 7.4 15.6A7.4 7.4 0 0 1 32 29a7.4 7.4 0 0 1-7.4-7.4C24.6 18 27 13 32 6z" fill="url(#f)"/><path d="M32 14c2 3 3 5 3 6.6a3 3 0 0 1-6 0c0-1.6 1-3.6 3-6.6z" fill="#fffbe8"/><path d="M4 32h56c-2.6 11-13 18-28 18S6.6 43 4 32z" fill="url(#b)"/><path d="M4 32h56" stroke="#ffcf7a" stroke-width="2.4" stroke-linecap="round"/><circle cx="18" cy="39" r="1.8" fill="#ffd36b"/><circle cx="32" cy="41" r="1.8" fill="#ffd36b"/><circle cx="46" cy="39" r="1.8" fill="#ffd36b"/></svg>`);

const ART: Record<Kind, { src: string; ratio: number }> = {
  dandiya: { src: FESTIVE_GIF("bubudubu-dandiya-playing.webp"), ratio: 240 / 236 },
  lantern: { src: LANTERN, ratio: 84 / 60 },
  diya: { src: DIYA, ratio: 56 / 64 },
  sparkle: { src: FESTIVE_GIF("diwali-sparkles-stars.gif"), ratio: 467 / 498 },
  burst: { src: FESTIVE_GIF("fireworks-hanabi-skyshot.gif"), ratio: 1 },
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

/** A free spot of w×h within the top `hi` fraction of the region. */
function spot(W: number, H: number, avoid: Box[], w: number, h: number, lo: number, hi: number): Box | null {
  for (let i = 0; i < 14; i++) {
    const left = rand(W * 0.02, W * 0.98 - w);
    const top = rand(H * lo, Math.max(H * lo, H * hi - h));
    const box = { top, bottom: top + h, left, right: left + w };
    if (clearOf(box, avoid, 4)) return box;
  }
  return null;
}

const plan: Planner = (k, W, H, oy, avoid, id) => {
  const kind = k as Kind;
  const s = W < 640 ? 0.72 : W < 1024 ? 0.86 : 1;
  const { src, ratio } = ART[kind];
  const layer = (b: Box): Box => toLayer(b, oy);

  if (kind === "dandiya") {
    // The panda dances across: hops along with a little spin at the half-way mark.
    const w = Math.round(rand(74, 100) * s);
    const h = Math.round(w * ratio);
    const hop = Math.round(h * 0.22);
    const lane = crossingLane(W, H, avoid, h, hop, 0.12, 0.96);
    if (!lane) return null;
    const rtl = Math.random() < 0.5;
    const dx = W + w * 2;
    const steps = 10;
    const frames: Keyframe[] = Array.from({ length: steps + 1 }, (_, i) => {
      const f = i / steps;
      const x = (rtl ? -1 : 1) * f * dx;
      const y = i % 2 ? -hop : 0;
      const turn = i === 5 ? " rotate(-10deg)" : i === 6 ? " rotate(8deg)" : "";
      return { transform: `translate(${Math.round(x)}px,${y}px)${turn}`, opacity: f === 0 || f === 1 ? 0 : 1 };
    });
    frames[1].opacity = 1;
    frames[steps - 1].opacity = 1;
    return {
      id, kind, src, lane: layer(lane), w, h, left: rtl ? W + w * 0.2 : -w * 1.2, top: hop,
      duration: rand(5200, 7000) * (W < 640 ? 0.8 : 1), frames, shooText: "Garba!",
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
    return {
      id, kind, src, lane: layer(box), w, h, left: 0, top: 0, duration: 2600, shooRate: 3,
      frames: [
        { transform: "scale(.6)", opacity: 0 },
        { transform: "scale(1)", opacity: 1, offset: 0.15 },
        { transform: "scale(1)", opacity: 1, offset: 0.75 },
        { transform: "scale(1.05)", opacity: 0 },
      ],
    };
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

export const FESTIVE_KINDS: Kind[] = ["dandiya", "lantern", "diya", "sparkle", "burst"];

export default function FestiveCritters({
  scope = "parent",
  kinds = FESTIVE_KINDS,
  avoid = "",
}: {
  /** "parent": fills the nearest positioned ancestor (the home hero). "page": the visible part of the page (the blog). */
  scope?: "parent" | "page";
  kinds?: Kind[];
  /** Selector for things a visitor must never cover (CTAs, the navbar). */
  avoid?: string;
}) {
  const on = useIsFestive();
  return <CritterLayer on={on} scope={scope} kinds={kinds} avoid={avoid} plan={plan} srcOf={srcOf} css={FV_KIND_CSS} />;
}

const FV_KIND_CSS = `
.hwc-dandiya img { filter: drop-shadow(0 6px 10px rgba(13,15,46,.28)); }
.hwc-lantern img, .hwc-diya img { filter: drop-shadow(0 0 10px rgba(255,190,80,.75)); }
.hwc-sparkle, .hwc-burst { transform-origin: 50% 50%; }
.hwc-eek { color: #2a1206; background: #ffd36b; }
`;
