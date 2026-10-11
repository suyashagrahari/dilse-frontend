"use client";

// ─── The seasonal critter engine ─────────────────────────────────────────────
//
// Little visitors that wander through the home hero or the blog while a drop
// season is on: Halloween's ghosts, spiders and bats (HalloweenCritters.tsx),
// Navratri's twirling sticks, mirrors and dancing panda and Diwali's diyas,
// lanterns and fireworks (FestivalCritters.tsx). Each season brings only its kinds and a `plan`
// function that places one appearance; this layer runs them all the same way.
//
// They come in waves — the first right after the page settles (~0.5 s), then
// a new wave every 2–3 s — and several kinds are out at once, capped so phones
// stay smooth (≤4 at a time on phones, ≤6 on wider screens).
//
// ── THE RULES IT KEEPS ──────────────────────────────────────────────────────
//
// - Cheap up front. Nothing renders until the browser has a short idle moment
//   after mount; the art is then preloaded (all of it, in parallel) and a
//   creature appears only once its image has decoded.
// - Never moves the page. Each creature flies inside its own clipped "lane", an
//   absolutely positioned pointer-events:none box, animated with transforms.
// - Never covers a CTA. Before each appearance it measures the elements that
//   must stay clear (`avoid`) plus the lanes already in flight and asks `plan`
//   for a lane that misses all of them, or skips the slot.
// - Tap to shoo. The creature itself takes the tap and flees at speed. That is
//   its only interactive part.
// - Off under prefers-reduced-motion. Paused (animations and spawning) while
//   the tab is hidden, and a hero-scoped layer is quiet while the hero is
//   scrolled out of view.

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type Box = { top: number; bottom: number; left: number; right: number };

export type Spawn = {
  id: number;
  kind: string;
  src: string;
  /** The clipped lane, in layer coordinates. */
  lane: Box;
  /** The creature inside its lane. */
  w: number;
  h: number;
  left: number;
  top: number;
  frames: Keyframe[];
  duration: number;
  rotate?: number;
  /** playbackRate when shooed (default 4; negative runs it back the way it came). */
  shooRate?: number;
  /** The little word that pops up when shooed. */
  shooText?: string;
};

/**
 * Plan one appearance of `kind` in a W×H region whose top sits at `oy` in layer
 * coordinates, or null when no lane is clear. `avoid` is in region coordinates.
 */
export type Planner = (kind: string, W: number, H: number, oy: number, avoid: Box[], id: number) => Spawn | null;

/** Waves: the first after this long, then one every WAVE_MIN–WAVE_MAX ms. */
const FIRST_WAVE_MS = 450;
const WAVE_MIN = 2000;
const WAVE_MAX = 3000;

export const rand = (a: number, b: number) => a + Math.random() * (b - a);
const shuffle = <T,>(xs: T[]) => xs.map((x) => [Math.random(), x] as const).sort((a, b) => a[0] - b[0]).map(([, x]) => x);

export function clearOf(box: Box, avoid: Box[], pad = 10) {
  return avoid.every((a) => box.right < a.left - pad || box.left > a.right + pad || box.bottom < a.top - pad || box.top > a.bottom + pad);
}

/** A horizontal band of height `h` (+pad) somewhere between lo·H and hi·H that misses `avoid`. */
export function crossingLane(W: number, H: number, avoid: Box[], h: number, pad: number, lo: number, hi: number): Box | null {
  for (let i = 0; i < 12; i++) {
    const top = rand(lo * H, Math.max(lo * H, hi * H - h - pad));
    const box = { top: top - pad, bottom: top + h + pad, left: 0, right: W };
    if (clearOf(box, avoid)) return box;
  }
  return null;
}

export const toLayer = (b: Box, oy: number): Box => ({ ...b, top: b.top + oy, bottom: b.bottom + oy });

function Critter({ spawn, onDone }: { spawn: Spawn; onDone: (id: number) => void }) {
  const ref = useRef<HTMLSpanElement>(null);
  const anim = useRef<Animation | null>(null);
  const [shoo, setShoo] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const a = el.animate(spawn.frames, { duration: spawn.duration, easing: "linear", fill: "both" });
    anim.current = a;
    a.onfinish = () => onDone(spawn.id);
    // Hold still while the tab is hidden, carry on when it comes back.
    const vis = () => (document.hidden ? a.pause() : a.playState === "paused" && a.play());
    document.addEventListener("visibilitychange", vis);
    return () => {
      document.removeEventListener("visibilitychange", vis);
      a.onfinish = null;
      a.cancel();
    };
  }, [spawn, onDone]);

  const scare = () => {
    const a = anim.current;
    if (!a || shoo) return;
    setShoo(true);
    a.playbackRate = spawn.shooRate ?? 4;
  };

  const { lane } = spawn;
  return (
    <span
      className="hwc-lane"
      style={{ top: lane.top, left: lane.left, width: lane.right - lane.left, height: lane.bottom - lane.top }}
    >
      <span
        ref={ref}
        className={`hwc-c hwc-${spawn.kind}${shoo ? " is-shoo" : ""}`}
        style={{ left: spawn.left, top: spawn.top, width: spawn.w, height: spawn.h }}
        onPointerDown={scare}
        aria-hidden
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- an animated GIF; next/image would freeze it */}
        <img
          src={spawn.src}
          alt=""
          width={spawn.w}
          height={spawn.h}
          draggable={false}
          style={spawn.rotate ? { transform: `rotate(${spawn.rotate}deg)` } : undefined}
        />
        {shoo && spawn.shooText && <b className="hwc-eek">{spawn.shooText}</b>}
      </span>
    </span>
  );
}

/** One decode per GIF per page, shared by every layer. */
const decoded = new Map<string, Promise<void>>();
function preload(src: string): Promise<void> {
  let p = decoded.get(src);
  if (!p) {
    const img = new Image();
    img.decoding = "async";
    img.src = src;
    p = img.decode().catch(() => { decoded.delete(src); throw new Error("gif"); });
    decoded.set(src, p);
  }
  return p;
}

export default function CritterLayer({
  on,
  scope = "parent",
  kinds,
  avoid = "",
  plan,
  srcOf,
  css = "",
}: {
  /** Is this season on? Nothing runs while false. */
  on: boolean;
  /** Every kind's art, for preloading once the layer starts. */
  srcOf: (kind: string) => string;
  plan: Planner;
  /** The season's own CSS (per-kind classes `hwc-<kind>`). */
  css?: string;
  /**
   * "parent": fills the nearest positioned ancestor (the home hero).
   * "page": the part of the page on screen when a creature sets off (the blog).
   * Its lane is pinned to the document, not the viewport, so when the reader
   * scrolls the creature scrolls with the text — the lane it picked to keep
   * clear of a button stays clear.
   */
  scope?: "parent" | "page";
  kinds: string[];
  /** Selector for things a creature must never cover (CTAs, the navbar). */
  avoid?: string;
}) {
  const [ready, setReady] = useState(false);
  const [spawns, setSpawns] = useState<Spawn[]>([]);
  /** Planned and in flight (lanes reserved); `shown` once its GIF has decoded. */
  const live = useRef<Spawn[]>([]);
  const shown = useRef(new Set<number>());
  const layer = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seq = useRef(0);
  const visible = useRef(true);
  const kindsKey = kinds.join(",");

  // Start right after mount (a short idle moment), never under reduced motion.
  useEffect(() => {
    if (!on) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;
    let cancelled = false;
    const ric = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200));
    const idleId = ric(() => { if (!cancelled) setReady(true); }, { timeout: FIRST_WAVE_MS });
    const onMq = () => { if (mq.matches) setReady(false); };
    mq.addEventListener("change", onMq);
    return () => {
      cancelled = true;
      mq.removeEventListener("change", onMq);
      (window.cancelIdleCallback ?? window.clearTimeout)(idleId);
    };
  }, [on]);

  // Preload every GIF in parallel as soon as we're going.
  useEffect(() => {
    if (!ready) return;
    for (const k of kindsKey.split(",")) preload(srcOf(k)).catch(() => {});
  }, [ready, kindsKey, srcOf]);

  // A hero-scoped layer stays quiet while the hero is off screen.
  useEffect(() => {
    if (!ready || scope !== "parent" || !layer.current) return;
    const io = new IntersectionObserver(([e]) => { visible.current = e.isIntersecting; });
    io.observe(layer.current);
    return () => io.disconnect();
  }, [ready, scope]);

  const wave = useCallback((first: boolean) => {
    const el = layer.current;
    if (!el || document.hidden || !visible.current) return;
    const page = scope === "page";
    const vw = document.documentElement.clientWidth;
    const cap = vw < 640 ? 4 : 6;
    const room = cap - live.current.length;
    if (room <= 0) return;

    // The region: the viewport (page) or the layer itself (hero), and where
    // its top sits in layer coordinates.
    const lr = el.getBoundingClientRect();
    const r = page ? { top: 0, left: 0, width: vw, height: window.innerHeight } : lr;
    const oy = page ? window.scrollY : 0;
    const avoidBoxes: Box[] = avoid
      ? Array.from(document.querySelectorAll(avoid)).map((n) => {
          const b = n.getBoundingClientRect();
          return { top: b.top - r.top, bottom: b.bottom - r.top, left: b.left - r.left, right: b.right - r.left };
        }).filter((b) => b.bottom > 0 && b.top < r.height)
      : [];
    // Creatures may cross each other's paths (they are on separate lanes in
    // time), but two of the same kind never share a band — that reads as a clump.
    const sameKind = (k: string): Box[] => live.current.filter((x) => x.kind === k)
      .map((x) => ({ ...x.lane, top: x.lane.top - oy, bottom: x.lane.bottom - oy }));

    // Prefer kinds not already out; the first wave sends every kind at once.
    const all = kindsKey.split(",");
    const out = new Set(live.current.map((s) => s.kind));
    const fresh = shuffle(all.filter((k) => !out.has(k)));
    const want = first ? Math.min(room, all.length) : Math.min(room, Math.random() < 0.5 ? 1 : 2);
    // Walk every kind (fresh ones first) until `want` have found a clear lane.
    const order = [...fresh, ...shuffle(all.filter((k) => out.has(k)))];

    let sent = 0;
    for (const kind of order) {
      if (sent >= want) break;
      const p = plan(kind, r.width, r.height, oy, [...avoidBoxes, ...sameKind(kind)], ++seq.current);
      if (!p) continue;
      // Phones and tablets: a season's planner may only check part of a lane
      // (a rising column's faded ends, a spider's thread), which there is enough
      // to cross the hero's stacked copy. The lane clips the creature, so the
      // whole lane must miss every element to keep clear, or the slot is skipped.
      if (vw < 1024 && !clearOf({ ...p.lane, top: p.lane.top - oy, bottom: p.lane.bottom - oy }, avoidBoxes, 4)) continue;
      sent++;
      live.current = [...live.current, p];
      // Show it only once the GIF is in hand, so it never appears half-loaded.
      preload(p.src).then(
        () => {
          if (!live.current.includes(p)) return;
          shown.current.add(p.id);
          setSpawns(live.current.filter((s) => shown.current.has(s.id)));
        },
        () => { live.current = live.current.filter((s) => s !== p); },
      );
    }
  }, [avoid, kindsKey, scope, plan]);

  useEffect(() => {
    if (!ready) return;
    let first = true;
    const tick = () => {
      wave(first);
      first = false;
      timer.current = setTimeout(tick, rand(WAVE_MIN, WAVE_MAX));
    };
    timer.current = setTimeout(tick, 60);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [ready, wave]);

  const done = useCallback((id: number) => {
    live.current = live.current.filter((s) => s.id !== id);
    shown.current.delete(id);
    setSpawns(live.current.filter((s) => shown.current.has(s.id)));
  }, []);

  if (!on || !ready) return null;
  const node = (
    <div ref={layer} className={`hwc hwc-${scope}`} aria-hidden>
      <style>{HWC_CSS + css}</style>
      {spawns.map((s) => <Critter key={s.id} spawn={s} onDone={done} />)}
    </div>
  );
  // A page-scoped layer is positioned against the document, so it lives on <body>.
  return scope === "page" ? createPortal(node, document.body) : node;
}

const HWC_CSS = `
.hwc { pointer-events: none; }
.hwc-parent { position: absolute; inset: 0; z-index: 3; overflow: hidden; contain: strict; }
/* A zero-height layer at the top of the document; each lane clips its own
   creature, so nothing here can widen or lengthen the page. Beneath the fixed
   navbars (z 40+), so a creature passing there goes behind them. */
.hwc-page { position: absolute; top: 0; left: 0; width: 100%; height: 0; z-index: 39; }
.hwc-lane { position: absolute; display: block; overflow: hidden; pointer-events: none; contain: layout paint; }
.hwc-c { position: absolute; display: block; pointer-events: auto; cursor: pointer; will-change: transform; touch-action: manipulation;
  -webkit-tap-highlight-color: transparent; user-select: none; }
.hwc-c img { display: block; width: 100%; height: 100%; object-fit: contain; pointer-events: none; }
.hwc-eek { position: absolute; left: 50%; top: 0; transform: translateX(-50%); padding: 3px 8px; border-radius: 999px; white-space: nowrap;
  font: 800 11px/1.2 'Inter', sans-serif; color: #2a1206; background: #ffc37a; box-shadow: 0 4px 10px rgba(23,19,42,.3);
  animation: hwcEek .5s cubic-bezier(.3,1.6,.5,1) both; }
@keyframes hwcEek { from { transform: translate(-50%, 6px) scale(.4); opacity: 0; } to { transform: translate(-50%, 0) scale(1); opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .hwc { display: none; } }
`;
