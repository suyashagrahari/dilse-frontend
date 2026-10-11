"use client";

// ─── Little Halloween visitors ───────────────────────────────────────────────
//
// The Halloween kinds for the shared critter engine (CritterLayer.tsx, which
// owns the waves, lanes, preloading, shooing and reduced-motion rules below).
//
// While the site is in Halloween mode, small creatures wander through the home
// hero or the blog: the running ghost dashes across, a spider crawls along,
// another drops from the top edge, a flock of bats (or the witch on her broom)
// flies over. They come in waves — the first right after the page settles
// (~0.5 s), then a new wave every 2–3 s — and several kinds are out at once,
// capped so phones stay smooth (≤4 at a time on phones, ≤6 on wider screens).
//
// ── THE RULES IT KEEPS ──────────────────────────────────────────────────────
//
// - Cheap up front. Nothing renders until the browser has a short idle moment
//   after mount; the GIFs are then preloaded (all of them, in parallel) and a
//   creature appears only once its GIF has decoded.
// - Never moves the page. Each creature flies inside its own clipped "lane", an
//   absolutely positioned pointer-events:none box, animated with transforms.
// - Never covers a CTA. Before each appearance it measures the elements that
//   must stay clear (`avoid`) plus the lanes already in flight and picks a lane
//   that misses all of them, or skips the slot.
// - Tap to shoo. The creature itself takes the tap and flees at speed (the
//   spider zips back up its thread). That is its only interactive part.
// - Off under prefers-reduced-motion. Paused (animations and spawning) while
//   the tab is hidden, and a hero-scoped layer is quiet while the hero is
//   scrolled out of view.

import { useIsHalloween } from "@/hooks/useSeason";
import { HALLOWEEN_GIF } from "@/lib/season";
import CritterLayer, { crossingLane, rand, toLayer, clearOf, type Box, type Planner } from "./CritterLayer";

type Kind = "ghost" | "crawl" | "drop" | "bats" | "witch";

const ART: Record<Kind, { file: string; ratio: number }> = {
  ghost: { file: "ghost-running.webp", ratio: 1 },
  crawl: { file: "spider-crawl.webp", ratio: 1 },
  drop: { file: "spider-drop-from-top.gif", ratio: 498 / 214 },
  bats: { file: "cute-bats.webp", ratio: 1 },
  witch: { file: "witch-seal-broom.webp", ratio: 1 },
};

const plan: Planner = (k, W, H, oy, avoid, id) => {
  const kind = k as Kind;
  const s = W < 640 ? 0.72 : W < 1024 ? 0.86 : 1;
  const { file, ratio } = ART[kind];
  const src = HALLOWEEN_GIF(file);

  // A horizontal crossing: try a handful of lanes and keep the first clear one.
  const crossing = (h: number, pad: number, lo: number, hi: number) => crossingLane(W, H, avoid, h, pad, lo, hi);
  const layer = (b: Box): Box => toLayer(b, oy);

  if (kind === "ghost") {
    const w = Math.round(rand(64, 96) * s);
    const pad = Math.round(w * 0.22);
    const lane = crossing(w, pad, 0.08, 0.95);
    if (!lane) return null;
    const duration = rand(3800, 5600) * (W < 640 ? 0.8 : 1);
    return {
      id, kind, src, lane: layer(lane), w, h: w, left: -w, top: pad, duration, shooText: "boo!",
      frames: [
        { transform: "translate(0,0)", opacity: 0 },
        { opacity: 1, offset: 0.06 },
        { transform: `translate(${(W + w) * 0.5}px,-${Math.round(w * 0.18)}px)`, offset: 0.5 },
        { opacity: 1, offset: 0.94 },
        { transform: `translate(${W + w * 1.2}px,0)`, opacity: 0 },
      ],
    };
  }
  if (kind === "crawl") {
    const w = Math.round(rand(46, 60) * s);
    const lane = crossing(w, 2, 0.12, 0.98);
    if (!lane) return null;
    const rtl = Math.random() < 0.5;
    const dx = W + w * 2;
    const at = (f: number) => `translateX(${rtl ? -f * dx : f * dx}px)`;
    return {
      id, kind, src, lane: layer(lane), w, h: w, left: rtl ? W + w * 0.2 : -w * 1.2, top: 2, shooText: "eek!",
      duration: rand(7000, 9500), rotate: rtl ? -90 : 90,
      frames: [
        { transform: at(0) },
        { transform: at(0.38), offset: 0.4 },
        { transform: at(0.38), offset: 0.52 }, // a pause, as if it noticed you
        { transform: at(1) },
      ],
    };
  }
  if (kind === "drop") {
    const w = Math.round(rand(54, 68) * s);
    const h = Math.round(w * ratio);
    for (let i = 0; i < 12; i++) {
      const left = Math.random() < 0.5 ? rand(W * 0.02, W * 0.24) : rand(W * 0.68, W * 0.97 - w);
      const box = { top: 0, bottom: h, left, right: left + w };
      if (clearOf({ ...box, bottom: h * 0.6 }, avoid)) {
        return {
          id, kind, src, lane: layer(box), w, h, left: 0, top: 0, duration: 5600, shooRate: -4, shooText: "eek!",
          frames: [
            { transform: `translateY(-${h}px)` },
            { transform: "translateY(0)", offset: 0.16, easing: "cubic-bezier(.3,1.5,.6,1)" },
            { transform: "translateY(0) rotate(3deg)", offset: 0.5 },
            { transform: "translateY(0) rotate(-3deg)", offset: 0.78 },
            { transform: `translateY(-${h}px)`, easing: "ease-in" },
          ],
        };
      }
    }
    return null;
  }
  // bats and the witch fly the upper part of the region.
  const w = Math.round((kind === "bats" ? rand(92, 124) : rand(92, 120)) * s);
  const amp = Math.round(w * 0.25);
  const lane = crossing(w, amp, 0.04, 0.85);
  if (!lane) return null;
  const rtl = kind === "witch"; // the witch faces left; the bats face right
  const dx = W + w * 2.2;
  const sx = rtl ? -1 : 1;
  return {
    id, kind, src, lane: layer(lane), w, h: w, left: rtl ? W + w * 0.2 : -w * 1.2, top: amp, duration: rand(6000, 8000), shooText: "eek!",
    frames: [0, 0.25, 0.5, 0.75, 1].map((f) => ({
      transform: `translate(${sx * f * dx}px,${Math.round(Math.sin(f * Math.PI * 2) * amp)}px)`,
      opacity: f === 0 || f === 1 ? 0.2 : 1,
    })),
  };
};

const srcOf = (k: string) => HALLOWEEN_GIF(ART[k as Kind].file);

export default function HalloweenCritters({
  scope = "parent",
  kinds = ["ghost", "crawl", "drop", "bats", "witch"],
  avoid = "",
}: {
  /**
   * "parent": fills the nearest positioned ancestor (the home hero).
   * "page": the part of the page on screen when a creature sets off (the blog).
   */
  scope?: "parent" | "page";
  kinds?: Kind[];
  /** Selector for things a creature must never cover (CTAs, the navbar). */
  avoid?: string;
}) {
  const on = useIsHalloween();
  return <CritterLayer on={on} scope={scope} kinds={kinds} avoid={avoid} plan={plan} srcOf={srcOf} css={HW_KIND_CSS} />;
}

const HW_KIND_CSS = `
.hwc-ghost img, .hwc-bats img, .hwc-witch img { filter: drop-shadow(0 6px 10px rgba(23,19,42,.3)); }
.hwc-crawl img { filter: drop-shadow(0 3px 4px rgba(0,0,0,.25)); }
.hwc-drop { transform-origin: 50% 0; }
.hwc-drop .hwc-eek { top: auto; bottom: 18%; }
`;
