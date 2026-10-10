"use client";

// ─── Little Halloween visitors ───────────────────────────────────────────────
//
// While the site is in Halloween mode, one small creature at a time wanders
// through the home hero or the blog: the running ghost dashes left→right, a
// spider crawls along, another drops from the top edge, a flock of bats or the
// witch on her broom flies over. One every 6–15 s, never two at once.
//
// ── THE RULES IT KEEPS ──────────────────────────────────────────────────────
//
// - Costs nothing up front. Nothing renders and no GIF is requested until the
//   page has loaded AND the browser is idle; each GIF is fetched only when its
//   creature is about to appear, and only shown once it has decoded.
// - Never moves the page. Everything is absolutely/fixed positioned inside a
//   pointer-events:none layer and animated with transforms only.
// - Never covers a CTA. Before each appearance it measures the elements that
//   must stay clear (`avoid`) and picks a lane that misses all of them, or
//   skips the turn.
// - Tap to shoo. The creature itself takes the tap and flees at speed (the
//   spider zips back up its thread). That is its only interactive part.
// - Off under prefers-reduced-motion, off when the tab is hidden, and (for a
//   hero-scoped layer) quiet while the hero is scrolled out of view.

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useIsHalloween } from "@/hooks/useSeason";
import { HALLOWEEN_GIF } from "@/lib/season";

type Kind = "ghost" | "crawl" | "drop" | "bats" | "witch";

type Spawn = {
  id: number;
  kind: Kind;
  src: string;
  w: number;
  h: number;
  left: number;
  top: number;
  frames: Keyframe[];
  duration: number;
  /** Mirror the art (it faces the other way to where it travels). */
  flip?: boolean;
  rotate?: number;
};

const ART: Record<Kind, { file: string; ratio: number }> = {
  ghost: { file: "ghost-running.webp", ratio: 1 },
  crawl: { file: "spider-crawl.webp", ratio: 1 },
  drop: { file: "spider-drop-from-top.gif", ratio: 498 / 214 },
  bats: { file: "cute-bats.webp", ratio: 1 },
  witch: { file: "witch-seal-broom.webp", ratio: 1 },
};

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const pick = <T,>(xs: readonly T[]) => xs[Math.floor(Math.random() * xs.length)];

type Box = { top: number; bottom: number; left: number; right: number };

function clearOf(box: Box, avoid: Box[], pad = 10) {
  return avoid.every((a) => box.right < a.left - pad || box.left > a.right + pad || box.bottom < a.top - pad || box.top > a.bottom + pad);
}

/** Plan one appearance inside a W×H layer, or null when no lane is clear. */
function plan(kind: Kind, W: number, H: number, avoid: Box[], id: number): Spawn | null {
  const s = W < 640 ? 0.72 : W < 1024 ? 0.86 : 1;
  const { file, ratio } = ART[kind];
  const src = HALLOWEEN_GIF(file);

  // A horizontal crossing: try a handful of lanes and keep the first clear one.
  const lane = (w: number, h: number, lo: number, hi: number) => {
    for (let i = 0; i < 10; i++) {
      const top = rand(lo * H, Math.max(lo * H, hi * H - h));
      if (clearOf({ top, bottom: top + h, left: 0, right: W }, avoid)) return top;
    }
    return null;
  };

  if (kind === "ghost") {
    const w = Math.round(rand(64, 100) * s);
    const top = lane(w, w, 0.08, 0.95);
    if (top == null) return null;
    const duration = rand(3800, 6200) * (W < 640 ? 0.75 : 1);
    return {
      id, kind, src, w, h: w, left: -w, top, duration,
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
    const w = Math.round(rand(46, 62) * s);
    const top = lane(w, w, 0.12, 0.98);
    if (top == null) return null;
    const rtl = Math.random() < 0.5;
    const dx = W + w * 2;
    const at = (f: number) => `translateX(${rtl ? -f * dx : f * dx}px)`;
    return {
      id, kind, src, w, h: w, left: rtl ? W + w * 0.2 : -w * 1.2, top, duration: rand(8000, 11000), rotate: rtl ? -90 : 90,
      frames: [
        { transform: at(0) },
        { transform: at(0.38), offset: 0.4 },
        { transform: at(0.38), offset: 0.52 }, // a pause, as if it noticed you
        { transform: at(1) },
      ],
    };
  }
  if (kind === "drop") {
    const w = Math.round(rand(54, 70) * s);
    const h = Math.round(w * ratio);
    for (let i = 0; i < 10; i++) {
      const left = Math.random() < 0.5 ? rand(W * 0.02, W * 0.22) : rand(W * 0.7, W * 0.96 - w);
      if (clearOf({ top: 0, bottom: h * 0.6, left, right: left + w }, avoid)) {
        return {
          id, kind, src, w, h, left, top: 0, duration: 6200,
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
  // bats and the witch fly the upper part of the layer.
  const w = Math.round((kind === "bats" ? rand(96, 132) : rand(96, 128)) * s);
  const top = lane(w, w, 0.04, 0.6);
  if (top == null) return null;
  const rtl = kind === "witch"; // the witch faces left; the bats face right
  const dx = W + w * 2.2;
  const sx = rtl ? -1 : 1;
  return {
    id, kind, src, w, h: w, left: rtl ? W + w * 0.2 : -w * 1.2, top, duration: rand(6500, 9000),
    frames: [0, 0.25, 0.5, 0.75, 1].map((f) => ({
      transform: `translate(${sx * f * dx}px,${Math.round(Math.sin(f * Math.PI * 2) * w * 0.25)}px)`,
      opacity: f === 0 || f === 1 ? 0.2 : 1,
    })),
  };
}

function Critter({ spawn, onDone }: { spawn: Spawn; onDone: () => void }) {
  const ref = useRef<HTMLSpanElement>(null);
  const anim = useRef<Animation | null>(null);
  const [shoo, setShoo] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const a = el.animate(spawn.frames, { duration: spawn.duration, easing: "linear", fill: "both" });
    anim.current = a;
    a.onfinish = onDone;
    return () => {
      a.onfinish = null;
      a.cancel();
    };
  }, [spawn, onDone]);

  const scare = () => {
    const a = anim.current;
    if (!a || shoo) return;
    setShoo(true);
    if (spawn.kind === "drop") {
      a.playbackRate = -4;
      a.onfinish = onDone;
    } else {
      a.playbackRate = 4;
    }
  };

  return (
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
  );
}

export default function HalloweenCritters({
  scope = "parent",
  kinds = ["ghost", "crawl", "drop", "bats", "witch"],
  avoid = "",
}: {
  /**
   * "parent": fills the nearest positioned ancestor (the home hero).
   * "page": the part of the page on screen when a creature sets off (the blog).
   * It is pinned to the document, not the viewport, so when the reader
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
  const [spawn, setSpawn] = useState<Spawn | null>(null);
  const layer = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const seq = useRef(0);
  const last = useRef<Kind | null>(null);
  const visible = useRef(true);
  /** "page" scope: where the layer sits in the document (the scroll position it was planned at). */
  const [pageBox, setPageBox] = useState<{ top: number; height: number }>({ top: 0, height: 0 });
  const kindsKey = kinds.join(",");

  // Start only after load + idle, and never under reduced motion.
  useEffect(() => {
    if (!on) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;
    let cancelled = false;
    let idleId: number | undefined;
    const go = () => {
      const ric = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1200));
      idleId = ric(() => { if (!cancelled) setReady(true); }, { timeout: 5000 });
    };
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });
    const onMq = () => { if (mq.matches) setReady(false); };
    mq.addEventListener("change", onMq);
    return () => {
      cancelled = true;
      window.removeEventListener("load", go);
      mq.removeEventListener("change", onMq);
      if (idleId !== undefined) (window.cancelIdleCallback ?? window.clearTimeout)(idleId);
    };
  }, [on]);

  // A hero-scoped layer stays quiet while the hero is off screen.
  useEffect(() => {
    if (!ready || scope !== "parent" || !layer.current) return;
    const io = new IntersectionObserver(([e]) => { visible.current = e.isIntersecting; });
    io.observe(layer.current);
    return () => io.disconnect();
  }, [ready, scope]);

  const schedule = useCallback((ms: number) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(function tick() {
      const el = layer.current;
      if (!el || document.hidden || !visible.current) {
        timer.current = setTimeout(tick, 3000);
        return;
      }
      const page = scope === "page";
      const r = page
        ? { top: 0, left: 0, width: document.documentElement.clientWidth, height: window.innerHeight }
        : el.getBoundingClientRect();
      const box = page ? { top: window.scrollY, height: window.innerHeight } : null;
      const avoidBoxes: Box[] = avoid
        ? Array.from(document.querySelectorAll(avoid)).map((n) => {
            const b = n.getBoundingClientRect();
            return { top: b.top - r.top, bottom: b.bottom - r.top, left: b.left - r.left, right: b.right - r.left };
          }).filter((b) => b.bottom > 0 && b.top < r.height)
        : [];
      const pool = kindsKey.split(",").filter((k) => k !== last.current) as Kind[];
      const kind = pick(pool.length ? pool : (kindsKey.split(",") as Kind[]));
      const p = plan(kind, r.width, r.height, avoidBoxes, ++seq.current);
      if (!p) {
        timer.current = setTimeout(tick, 2500);
        return;
      }
      // Show it only once the GIF is in hand, so it never appears half-loaded.
      const img = new Image();
      img.src = p.src;
      const show = () => {
        last.current = kind;
        if (box) setPageBox(box);
        setSpawn(p);
      };
      img.decode().then(show, () => { timer.current = setTimeout(tick, 6000); });
    }, ms);
  }, [avoid, kindsKey, scope]);

  useEffect(() => {
    if (!ready) return;
    schedule(rand(1200, 3000));
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [ready, schedule]);

  const done = useCallback(() => {
    setSpawn(null);
    schedule(rand(6000, 15000));
  }, [schedule]);

  if (!on || !ready) return null;
  const node = (
    <div
      ref={layer}
      className={`hwc hwc-${scope}`}
      style={scope === "page" ? { top: pageBox.top, height: spawn ? pageBox.height : 0 } : undefined}
      aria-hidden
    >
      <style>{HWC_CSS}</style>
      {spawn && <Critter key={spawn.id} spawn={spawn} onDone={done} />}
    </div>
  );
  // A page-scoped layer is positioned against the document, so it lives on <body>.
  return scope === "page" ? createPortal(node, document.body) : node;
}

const HWC_CSS = `
.hwc { pointer-events: none; overflow: hidden; contain: strict; }
.hwc-parent { position: absolute; inset: 0; z-index: 3; }
/* Beneath the fixed navbars (z 40+), so a creature passing there goes behind them. */
.hwc-page { position: absolute; left: 0; width: 100%; z-index: 39; }
.hwc-c { position: absolute; display: block; pointer-events: auto; cursor: pointer; will-change: transform; touch-action: manipulation;
  -webkit-tap-highlight-color: transparent; user-select: none; }
.hwc-c img { display: block; width: 100%; height: 100%; object-fit: contain; pointer-events: none; }
.hwc-ghost img, .hwc-bats img, .hwc-witch img { filter: drop-shadow(0 6px 10px rgba(26,5,7,.28)); }
.hwc-crawl img { filter: drop-shadow(0 3px 4px rgba(0,0,0,.25)); }
.hwc-drop { transform-origin: 50% 0; }
.hwc-eek { position: absolute; left: 50%; top: -10px; transform: translateX(-50%); padding: 3px 8px; border-radius: 999px; white-space: nowrap;
  font: 800 11px/1.2 'Inter', sans-serif; color: #2a0a0e; background: #ffc37a; box-shadow: 0 4px 10px rgba(26,5,7,.3);
  animation: hwcEek .5s cubic-bezier(.3,1.6,.5,1) both; }
.hwc-drop .hwc-eek { top: auto; bottom: 18%; }
@keyframes hwcEek { from { transform: translate(-50%, 6px) scale(.4); opacity: 0; } to { transform: translate(-50%, 0) scale(1); opacity: 1; } }
@media (prefers-reduced-motion: reduce) { .hwc { display: none; } }
`;
