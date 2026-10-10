"use client";

// The house's restless residents: things that turn up on their own while she
// reads, all driven from ONE scheduler so only one of them moves at a time.
//
//   • <Haunts>     every 8–20 s something passes: usually the little running
//                  ghost (ghost-running.webp), sometimes a spider walking the
//                  CEILING from one corner web to the other, upside down
//                  (spider-crawl.webp). The ghost picks a lane that is free of
//                  text (it measures the room), runs left → right at a random
//                  height and speed, flickering, with its shadow sliding under
//                  it. One run in three is a "whoosh": a small ghost in FRONT
//                  of the room while the lights dim for a beat. Tap either and
//                  it gets spooked and zooms off. Never during a scare or the
//                  scene change; the first ghost comes 6–9 s in.
//   • <DropSpider> spider-drop-from-top.gif on its own silk: it lowers itself
//                  from the very top edge of the screen (the thread is a CSS
//                  line pinned to the edge), hangs, then is yanked back up and
//                  comes down again a while later. Tap it: it shoots back up.
//
// All of it sits behind the room's content (z-index 0, after the night) and
// catches taps with a document-level hit test, so it never steals a button's
// tap; only the whoosh ghost passes in front, small and quick, in a text-free
// lane. Transform/opacity only. Reduced motion renders none of it.

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import { HW_GIF, preload, useHw } from "./stage";

const rnd = (a: number, b: number) => a + Math.random() * (b - a);

/** Call `fn` when a pointerdown lands on (or near) `el` and not on a control. */
function useTapNear(el: RefObject<HTMLElement | null>, on: boolean, fn: () => void, pad = 12) {
  const cb = useRef(fn);
  useEffect(() => {
    cb.current = fn;
  });
  useEffect(() => {
    if (!on) return;
    const hit = (e: PointerEvent) => {
      const node = el.current;
      if (!node) return;
      const t = e.target as Element | null;
      if (t?.closest?.("button, a, input, textarea, select, canvas, [role='slider'], [role='dialog'], .pmTopBar, .vm-icon")) return;
      const r = node.getBoundingClientRect();
      if (e.clientX < r.left - pad || e.clientX > r.right + pad || e.clientY < r.top - pad || e.clientY > r.bottom + pad) return;
      cb.current();
    };
    document.addEventListener("pointerdown", hit, true);
    return () => document.removeEventListener("pointerdown", hit, true);
  }, [on, el, pad]);
}

/** A lane (top px) of height `h` that crosses no visible text or control in the current room, or null. */
function freeLane(h: number): number | null {
  const scene = [...document.querySelectorAll<HTMLElement>("[data-hw-scene]")].pop();
  const H = window.innerHeight;
  const blocks: { t: number; b: number }[] = [];
  if (scene)
    for (const el of scene.querySelectorAll<HTMLElement>("h1, h2, h3, p, button, figcaption, [role='application'], .hw-envelope, .hw-sign")) {
      const r = el.getBoundingClientRect();
      if (r.width > 4 && r.height > 4) blocks.push({ t: r.top - 6, b: r.bottom + 6 });
    }
  // keep clear of the trail / top bar and of the candy pill
  blocks.push({ t: 0, b: 64 }, { t: H - 110, b: H });
  const lanes: number[] = [];
  for (let y = 70; y + h < H - 110; y += 12) if (!blocks.some((k) => y < k.b && y + h > k.t)) lanes.push(y);
  return lanes.length ? lanes[Math.floor(Math.random() * lanes.length)] : null;
}

type Pass = { id: number; kind: "ghost" | "crawl"; front: boolean; top: number; size: number; ms: number };

export function Haunts({ paused }: { paused: boolean }) {
  const reduced = useReducedMotion();
  const { gentle, cue } = useHw();
  const [pass, setPass] = useState<Pass | null>(null);
  const pausedRef = useRef(paused);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);
  const lastCrawl = useRef(0);

  useEffect(() => {
    if (reduced) return;
    let t = 0;
    let n = 0;
    const plan = (ms: number) => {
      t = window.setTimeout(go, ms);
    };
    const go = () => {
      if (pausedRef.current || document.hidden) return plan(2000);
      n += 1;
      const now = performance.now();
      const crawl = n > 1 && now - lastCrawl.current > 40000 && Math.random() < 0.3;
      if (crawl) {
        lastCrawl.current = now;
        setPass({ id: now, kind: "crawl", front: false, top: 0, size: Math.round(rnd(58, 74)), ms: Math.round(rnd(9000, 12000)) });
      } else {
        const front = n > 1 && Math.random() < 0.34;
        const size = Math.round(front ? rnd(46, 60) : rnd(72, 112));
        const lane = freeLane(size);
        const top = lane ?? rnd(0.2, 0.55) * window.innerHeight;
        setPass({ id: now, kind: "ghost", front: front && lane !== null, top, size, ms: Math.round(front ? rnd(1300, 1900) : rnd(2600, 4800)) });
      }
      plan(rnd(8000, 20000));
    };
    preload(HW_GIF.ghostRun);
    plan(rnd(6000, 9000));
    return () => window.clearTimeout(t);
  }, [reduced]);

  const done = useCallback(() => setPass(null), []);
  if (reduced || !pass) return null;
  return pass.kind === "ghost" ? (
    <RunningGhost key={pass.id} pass={pass} paused={paused} dim={pass.front && !gentle} onSpook={() => cue("swoosh-soft", { gain: 0.45 })} onDone={done} />
  ) : (
    <CeilingSpider key={pass.id} pass={pass} paused={paused} onDone={done} />
  );
}

function RunningGhost({ pass, paused, dim, onSpook, onDone }: { pass: Pass; paused: boolean; dim: boolean; onSpook: () => void; onDone: () => void }) {
  const el = useRef<HTMLSpanElement>(null);
  const anim = useRef<Animation | null>(null);
  const [spooked, setSpooked] = useState(false);
  useEffect(() => {
    const node = el.current;
    if (!node) return;
    const w = window.innerWidth;
    const a = node.animate(
      [
        { transform: `translate3d(${-pass.size - 20}px, 0, 0)` },
        { transform: `translate3d(${w * 0.5}px, ${pass.front ? -6 : -14}px, 0)`, offset: 0.5 },
        { transform: `translate3d(${w + 20}px, 0, 0)` },
      ],
      { duration: pass.ms, easing: "cubic-bezier(.35,.1,.65,.9)", fill: "forwards" },
    );
    anim.current = a;
    a.onfinish = onDone;
    return () => a.cancel();
  }, [pass, onDone]);
  // a scare or the scene change starts: clear the stage
  useEffect(() => {
    if (paused && anim.current) anim.current.playbackRate = 6;
  }, [paused]);
  useTapNear(el, !spooked, () => {
    if (!anim.current) return;
    setSpooked(true);
    anim.current.playbackRate = 5;
    haptic(8);
    onSpook();
  });
  return (
    <>
      {dim && <span className="hw-dim" aria-hidden style={{ animationDuration: `${pass.ms}ms` }} />}
      <span ref={el} className={`hw-runner${pass.front ? " is-front" : ""}${spooked ? " is-spooked" : ""}`} aria-hidden style={{ top: pass.top, width: pass.size }}>
        <span className="hw-runner-shadow" />
        <span className="hw-runner-bob">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={HW_GIF.ghostRun} alt="" width={220} height={220} decoding="async" draggable={false} />
        </span>
        {spooked && <b className="hw-runner-eek">!</b>}
      </span>
    </>
  );
}

/** A spider walks the ceiling, upside down, from the right web to the left one. */
function CeilingSpider({ pass, paused, onDone }: { pass: Pass; paused: boolean; onDone: () => void }) {
  const el = useRef<HTMLSpanElement>(null);
  const anim = useRef<Animation | null>(null);
  useEffect(() => {
    const node = el.current;
    if (!node) return;
    const w = window.innerWidth;
    const s = pass.size;
    const a = node.animate(
      [
        { transform: `translate3d(${w + 10}px, 0, 0) rotate(180deg)` },
        { transform: `translate3d(${w * 0.62}px, 4px, 0) rotate(184deg)`, offset: 0.35 },
        { transform: `translate3d(${w * 0.4}px, 0, 0) rotate(177deg)`, offset: 0.6 },
        { transform: `translate3d(${-s - 10}px, 2px, 0) rotate(180deg)` },
      ],
      { duration: pass.ms, easing: "linear", fill: "forwards" },
    );
    anim.current = a;
    a.onfinish = onDone;
    return () => a.cancel();
  }, [pass, onDone]);
  useEffect(() => {
    if (paused && anim.current) anim.current.playbackRate = 5;
  }, [paused]);
  useTapNear(el, true, () => {
    if (!anim.current || anim.current.playbackRate > 1) return;
    anim.current.playbackRate = 7;
    haptic(8);
  });
  return (
    <span ref={el} className="hw-ceiling" aria-hidden style={{ width: pass.size }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={HW_GIF.crawl} alt="" width={260} height={260} decoding="async" draggable={false} />
    </span>
  );
}

// ── The spider on its silk ───────────────────────────────────────────────────
//
// The GIF is one ≈4 s climb down (the head goes from 10% to 77% of its box)
// that then loops back up, so every drop mounts a fresh frame-0 copy and is
// yanked up at 3.5 s, before the loop would jump. The box hangs from the very
// top edge; the silk is a 1px line from the screen's edge to the box's top
// that grows with the descent.

const DROP_MS = 3500;
let dropN = 0;

export function DropSpider({ side = "r", x = "8%", first = 1600, again = [12000, 18000] as [number, number] }: { side?: "l" | "r"; x?: string; first?: number; again?: [number, number] }) {
  const reduced = useReducedMotion();
  const { cue } = useHw();
  const [drop, setDrop] = useState<{ src: string; n: number } | null>(null);
  const [phase, setPhase] = useState<"wait" | "down" | "up">("wait");
  const box = useRef<HTMLSpanElement>(null);
  const timers = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));

  useEffect(() => {
    if (reduced) return;
    preload(HW_GIF.spiderDrop);
    const t = timers.current;
    const start = () => {
      dropN += 1;
      setPhase("wait");
      setDrop({ src: `${HW_GIF.spiderDrop}?play=d${dropN}`, n: dropN });
    };
    t.push(window.setTimeout(start, first));
    return () => {
      t.forEach((k) => window.clearTimeout(k));
      t.length = 0;
    };
  }, [reduced, first]);

  const up = () => {
    setPhase("up");
    later(() => setDrop(null), 600);
    later(() => {
      dropN += 1;
      setPhase("wait");
      setDrop({ src: `${HW_GIF.spiderDrop}?play=d${dropN}`, n: dropN });
    }, rnd(again[0], again[1]));
  };
  const onLoad = () => {
    setPhase("down");
    // (a tap clears this timer and pulls it up itself)
    later(up, DROP_MS);
  };
  useTapNear(box, phase === "down", () => {
    haptic(10);
    cue("swoosh-soft", { gain: 0.5 });
    timers.current.forEach((k) => window.clearTimeout(k));
    timers.current.length = 0;
    up();
  });

  if (reduced || !drop) return null;
  return (
    <span key={drop.n} className={`hw-drop is-${phase}`} aria-hidden style={{ [side === "r" ? "right" : "left"]: x, ["--dms" as string]: `${DROP_MS}ms` }}>
      <span className="hw-drop-silk" />
      <span ref={box} className="hw-drop-box">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={drop.src} alt="" width={180} height={419} decoding="async" draggable={false} onLoad={onLoad} onError={() => setDrop(null)} />
      </span>
    </span>
  );
}

export const HAUNTS_CSS = `
/* behind the room (z 0, after the night), except the whoosh ghost */
.hw-runner { position: fixed; z-index: 0; left: 0; pointer-events: none; will-change: transform; }
.hw-runner.is-front { z-index: 58; }
.hw-runner-bob { display: block; animation: hw-run-bob .32s ease-in-out infinite alternate, hw-run-flicker 2.3s steps(1, end) infinite; }
.hw-runner img { display: block; width: 100%; height: auto; }
.hw-runner:not(.is-front) img { opacity: .9; }
.hw-runner-shadow { position: absolute; left: 4%; right: 4%; bottom: -14%; height: 16%; border-radius: 50%;
  background: radial-gradient(closest-side, rgba(5,3,12,.65), rgba(5,3,12,0)); animation: hw-run-shadow .32s ease-in-out infinite alternate; }
.hw-runner.is-spooked .hw-runner-bob { animation: hw-run-spook .5s cubic-bezier(.3,1.6,.5,1) both; }
.hw-runner-eek { position: absolute; right: -6px; top: -10px; font: 900 22px/1 system-ui, sans-serif; color: #FFD27A; text-shadow: 0 0 8px rgba(255,138,61,.9); }
@keyframes hw-run-bob { from { transform: translateY(-4px) rotate(-4deg) } to { transform: translateY(3px) rotate(3deg) } }
@keyframes hw-run-shadow { from { transform: scaleX(.8); opacity: .7 } to { transform: scaleX(1); opacity: 1 } }
@keyframes hw-run-flicker { 0%, 100% { opacity: 1 } 41% { opacity: .35 } 44% { opacity: 1 } 47% { opacity: .5 } 50% { opacity: 1 } 83% { opacity: .55 } 86% { opacity: 1 } }
@keyframes hw-run-spook { 0% { transform: scale(1) } 35% { transform: translateY(-18px) scale(1.25) rotate(-10deg) } 100% { transform: translateY(-8px) scale(.85) rotate(6deg) } }
/* the lights dip while the whoosh ghost passes */
.hw-dim { position: fixed; inset: 0; z-index: 57; pointer-events: none; opacity: 0;
  background: radial-gradient(130% 90% at 50% 40%, rgba(4,2,10,.35), rgba(4,2,10,.72)); animation: hw-dim 1.6s ease-in-out both; }
@keyframes hw-dim { 0% { opacity: 0 } 18% { opacity: .9 } 26% { opacity: .55 } 32% { opacity: .95 } 75% { opacity: .8 } 100% { opacity: 0 } }

.hw-ceiling { position: fixed; z-index: 0; left: 0; top: max(0px, env(safe-area-inset-top, 0px)); pointer-events: none; will-change: transform; }
.hw-ceiling img { display: block; width: 100%; height: auto; filter: drop-shadow(0 0 2px rgba(220,210,255,.55)); }

.hw-drop { --w: 64px; position: fixed; z-index: 0; top: 0; width: var(--w); pointer-events: none; }
@media (min-width: 768px) { .hw-drop { --w: 84px; } }
.hw-drop-box { position: absolute; left: 0; top: 0; width: 100%; aspect-ratio: 180 / 419; transform: translateY(-38%); will-change: transform; }
.hw-drop-box img { display: block; width: 100%; height: 100%; filter: drop-shadow(0 0 2px rgba(230,220,255,.75)); }
/* The silk runs from the top edge to the spider's head. The box slides from -38% to +60% of its height while
   the GIF's head climbs from 10% to ~69% of it, so the head enters the screen 18% into the drop at x 0.48 W
   and ends 2.99 W down at x 0.685 W (below the room's title, beside the moon): the silk is that straight
   line, growing with it. */
.hw-drop-silk { position: absolute; left: 48.4%; top: 0; width: 1px; height: calc(var(--w) * 2.99); background: linear-gradient(rgba(247,243,255,.2), rgba(247,243,255,.8));
  transform-origin: top; transform: rotate(-3.85deg) scaleY(0); }
.hw-drop.is-down .hw-drop-box { animation: hw-drop-down var(--dms) linear forwards; }
.hw-drop.is-down .hw-drop-silk { animation: hw-silk-down var(--dms) linear forwards; }
.hw-drop.is-up .hw-drop-box { transform: translateY(-120%); transition: transform .5s cubic-bezier(.6,0,.9,.4); }
.hw-drop.is-up .hw-drop-silk { transform: rotate(-3.85deg) scaleY(0); transition: transform .45s cubic-bezier(.6,0,.9,.4); }
@keyframes hw-drop-down { from { transform: translateY(-38%) } to { transform: translateY(60%) } }
@keyframes hw-silk-down { 0%, 18% { transform: rotate(-3.85deg) scaleY(0) } 100% { transform: rotate(-3.85deg) scaleY(1) } }
`;
