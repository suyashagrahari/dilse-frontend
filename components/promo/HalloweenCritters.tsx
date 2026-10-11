"use client";

// ─── Little Halloween visitors ───────────────────────────────────────────────
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

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useIsHalloween } from "@/hooks/useSeason";
import { HALLOWEEN_GIF } from "@/lib/season";

type Kind = "ghost" | "crawl" | "drop" | "bats" | "witch";

type Box = { top: number; bottom: number; left: number; right: number };

type Spawn = {
  id: number;
  kind: Kind;
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
};

const ART: Record<Kind, { file: string; ratio: number }> = {
  ghost: { file: "ghost-running.webp", ratio: 1 },
  crawl: { file: "spider-crawl.webp", ratio: 1 },
  drop: { file: "spider-drop-from-top.gif", ratio: 498 / 214 },
  bats: { file: "cute-bats.webp", ratio: 1 },
  witch: { file: "witch-seal-broom.webp", ratio: 1 },
};

/** Waves: the first after this long, then one every WAVE_MIN–WAVE_MAX ms. */
const FIRST_WAVE_MS = 450;
const WAVE_MIN = 2000;
const WAVE_MAX = 3000;

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const shuffle = <T,>(xs: T[]) => xs.map((x) => [Math.random(), x] as const).sort((a, b) => a[0] - b[0]).map(([, x]) => x);

function clearOf(box: Box, avoid: Box[], pad = 10) {
  return avoid.every((a) => box.right < a.left - pad || box.left > a.right + pad || box.bottom < a.top - pad || box.top > a.bottom + pad);
}

/**
 * Plan one appearance in a W×H region whose top sits at `oy` in layer
 * coordinates, or null when no lane is clear. `avoid` is in region coordinates.
 */
function plan(kind: Kind, W: number, H: number, oy: number, avoid: Box[], id: number): Spawn | null {
  const s = W < 640 ? 0.72 : W < 1024 ? 0.86 : 1;
  const { file, ratio } = ART[kind];
  const src = HALLOWEEN_GIF(file);

  // A horizontal crossing: try a handful of lanes and keep the first clear one.
  const crossing = (h: number, pad: number, lo: number, hi: number) => {
    for (let i = 0; i < 12; i++) {
      const top = rand(lo * H, Math.max(lo * H, hi * H - h - pad));
      const box = { top: top - pad, bottom: top + h + pad, left: 0, right: W };
      if (clearOf(box, avoid)) return box;
    }
    return null;
  };
  const toLayer = (b: Box): Box => ({ ...b, top: b.top + oy, bottom: b.bottom + oy });

  if (kind === "ghost") {
    const w = Math.round(rand(64, 96) * s);
    const pad = Math.round(w * 0.22);
    const lane = crossing(w, pad, 0.08, 0.95);
    if (!lane) return null;
    const duration = rand(3800, 5600) * (W < 640 ? 0.8 : 1);
    return {
      id, kind, src, lane: toLayer(lane), w, h: w, left: -w, top: pad, duration,
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
      id, kind, src, lane: toLayer(lane), w, h: w, left: rtl ? W + w * 0.2 : -w * 1.2, top: 2,
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
          id, kind, src, lane: toLayer(box), w, h, left: 0, top: 0, duration: 5600,
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
    id, kind, src, lane: toLayer(lane), w, h: w, left: rtl ? W + w * 0.2 : -w * 1.2, top: amp, duration: rand(6000, 8000),
    frames: [0, 0.25, 0.5, 0.75, 1].map((f) => ({
      transform: `translate(${sx * f * dx}px,${Math.round(Math.sin(f * Math.PI * 2) * amp)}px)`,
      opacity: f === 0 || f === 1 ? 0.2 : 1,
    })),
  };
}

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
    a.playbackRate = spawn.kind === "drop" ? -4 : 4;
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
        {shoo && <b className="hwc-eek">{spawn.kind === "ghost" ? "boo!" : "eek!"}</b>}
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

export default function HalloweenCritters({
  scope = "parent",
  kinds = ["ghost", "crawl", "drop", "bats", "witch"],
  avoid = "",
}: {
  /**
   * "parent": fills the nearest positioned ancestor (the home hero).
   * "page": the part of the page on screen when a creature sets off (the blog).
   * Its lane is pinned to the document, not the viewport, so when the reader
   * scrolls the creature scrolls with the text — the lane it picked to keep
   * clear of a button stays clear.
   */
  scope?: "parent" | "page";
  kinds?: Kind[];
  /** Selector for things a creature must never cover (CTAs, the navbar). */
  avoid?: string;
}) {
  const on = useIsHalloween();
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
    for (const k of kindsKey.split(",") as Kind[]) preload(HALLOWEEN_GIF(ART[k].file)).catch(() => {});
  }, [ready, kindsKey]);

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
    const sameKind = (k: Kind): Box[] => live.current.filter((x) => x.kind === k)
      .map((x) => ({ ...x.lane, top: x.lane.top - oy, bottom: x.lane.bottom - oy }));

    // Prefer kinds not already out; the first wave sends every kind at once.
    const all = kindsKey.split(",") as Kind[];
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
  }, [avoid, kindsKey, scope]);

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
      <style>{HWC_CSS}</style>
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
.hwc-ghost img, .hwc-bats img, .hwc-witch img { filter: drop-shadow(0 6px 10px rgba(23,19,42,.3)); }
.hwc-crawl img { filter: drop-shadow(0 3px 4px rgba(0,0,0,.25)); }
.hwc-drop { transform-origin: 50% 0; }
.hwc-eek { position: absolute; left: 50%; top: 0; transform: translateX(-50%); padding: 3px 8px; border-radius: 999px; white-space: nowrap;
  font: 800 11px/1.2 'Inter', sans-serif; color: #2a1206; background: #ffc37a; box-shadow: 0 4px 10px rgba(23,19,42,.3);
  animation: hwcEek .5s cubic-bezier(.3,1.6,.5,1) both; }
.hwc-drop .hwc-eek { top: auto; bottom: 18%; }
@keyframes hwcEek { from { transform: translate(-50%, 6px) scale(.4); opacity: 0; } to { transform: translate(-50%, 0) scale(1); opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .hwc { display: none; } }
`;
