"use client";

// Boo-tiful Night v6: the haunted atmosphere around every scene.
//
//   <Haunt>        one fixed layer over the sky: a hill of candy-lit haunted
//                  houses (on desktop they fill the wings), two banks of fog
//                  drifting, cute bats flying across now and then, a corner web
//                  whose red spider lowers itself (top-left) and, on wide
//                  screens, a cute spider web in the other corner.
//   <DropSpider>   the owner's spider-drop GIF used as a real drop: it comes
//                  down from the very top edge of the screen on its own thread
//                  (a CSS line that tracks the GIF's head), swinging a little,
//                  then zips back up. Tap it: "eek!" and it's gone.
//   <Crawler>      a spider crosses the ground once per scene, behind the
//                  content (never over text). Tap it and it scurries off.
//   <Trail>        the progress trail, far top-left: lit pumpkins jump back,
//                  the little ghost is "you are here", the rest are dim.
//   <Veil>         the scene change: a night-mist curtain with a row of ghost
//                  heads rises over the screen, the next scene swaps in under
//                  it, and it lifts away (one composited translate).
//   <Manor>        the gate's big pastel haunted house (SVG).
//   <RunningGhost> v7: the owner's running ghost dashes across at random
//                  moments (behind the scene, or a quick small whoosh in front
//                  near the top); a shadow trails it, it flickers mid-run and,
//                  on some passes, the lights dim for a beat. Tap: it zooms off.
//
// Everything animates transform/opacity only. Reduced motion: no drop, no
// crawl, no bats; the spiders are static ones.

import { memo, useEffect, useRef, useState, type CSSProperties, type RefObject } from "react";
import { haptic } from "../../../_valentine/kit";
import { sfx } from "../../../_valentine/kit/premium";
import { Bat, Ghost } from "./art";
import { HAND } from "./fonts";
import { freshGif, GIF, preloadGif } from "./gifs";
import { BN } from "./model";
import { useBoo } from "./Scare";

// ── The fixed atmosphere ─────────────────────────────────────────────────────

/** (memo: a scene change must not re-render the town, the yards and the manor) */
export const Haunt = memo(function Haunt({ reduce, peak, gate }: { reduce: boolean; peak: boolean; gate: boolean }) {
  return (
    <div className={`bn-haunt${peak ? " is-peak" : ""}${gate ? " is-gate" : ""}`} aria-hidden>
      <span className="bn-vignette" />
      <span className="bn-cloud is-a" />
      <span className="bn-cloud is-b" />
      {!reduce && <span className="bn-flash" />}
      <Skyline />
      {/* desktop: the big haunted house stands on the left hill (the gate draws its own, centre stage) */}
      {!gate && <Manor className="bn-bigManor" />}
      <Yard className="is-l" />
      <Yard className="is-r" flip />
      <span className="bn-fog bn-fog1" />
      <span className="bn-fog bn-fog2" />
      {!reduce && (
        <>
          <span className="bn-flyBat is-a">
            <Bat size={46} />
          </span>
          <span className="bn-flyBat is-b">
            <Bat size={34} />
          </span>
          <span className="bn-flyBat is-c">
            <Bat size={40} />
          </span>
          <span className="bn-flyBat is-d">
            <Bat size={56} />
          </span>
          <span className="bn-flyBat is-e">
            <Bat size={30} />
          </span>
        </>
      )}
      {/* v7: both webs sit flush in the true top corners, on every scene and every screen.
          top-left: the corner web (its red spider lowers itself); reduced motion: the still one */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={`bn-cornerWeb${reduce ? " is-still" : ""}`} src={reduce ? GIF.cuteWeb : GIF.cornerWeb} alt="" width={280} height={362} decoding="async" draggable={false} />
      {/* top-right: the cute spider web, mirrored (the editor's bar sits above it) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="bn-cuteWeb" src={GIF.cuteWeb} alt="" width={300} height={300} loading="lazy" decoding="async" draggable={false} />
    </div>
  );
});

/** A row of little haunted houses on the hills: two on phones, five across a desktop. */
function Skyline() {
  return (
    <div className="bn-skyline">
      <Town />
      <House className="bn-h1" variant={0} />
      <House className="bn-h2" variant={1} />
      <House className="bn-h3" variant={2} />
      <House className="bn-h4" variant={1} />
      <House className="bn-h5" variant={0} />
    </div>
  );
}

/** The distant haunted town along the horizon (one wide silhouette, a few lit windows). */
function Town() {
  return (
    <svg className="bn-town" viewBox="0 0 800 120" preserveAspectRatio="xMidYMax slice" aria-hidden>
      <path
        d="M0 120 V88 H30 V70 L44 56 L58 70 V84 H84 V62 H92 V48 L100 34 L108 48 V62 H118 V90 H150 V74 L170 58 L190 74 V92 H214 V40 L222 28 L224 10 L226 28 L234 40 V96 H262 V78 H290 V66 L306 52 L322 66 V88 H350 V70 L380 46 L410 70 V92 H440 V58 H446 V44 L456 26 L466 44 V58 H472 V94 H500 V80 L516 66 L532 80 V90 H560 V64 L586 44 L612 64 V96 H640 V76 H652 V60 L660 44 L668 60 V76 H690 V88 H720 V68 L736 54 L752 68 V90 H800 V120 Z"
        fill="#3D2D78"
      />
      {[
        [96, 70], [104, 80], [176, 80], [222, 50], [222, 66], [300, 74], [376, 74], [390, 82], [452, 62], [458, 74], [580, 70], [596, 80], [656, 66], [732, 74],
      ].map(([x, y], i) => (
        <rect key={i} x={x} y={y} width="5" height="6" rx="1" fill={WIN[i % 3]} opacity=".85" className={i % 4 === 0 ? "bn-win is-2" : undefined} />
      ))}
    </svg>
  );
}

/** A little graveyard in front of the houses: cute rounded stones ("BOO", a heart), an iron fence, a glowing pumpkin. */
function Yard({ className, flip }: { className: string; flip?: boolean }) {
  const st = "#3A2C6E";
  return (
    <svg className={`bn-yardSil ${className}`} viewBox="0 0 220 80" aria-hidden style={flip ? { transform: "scaleX(-1)" } : undefined}>
      <path d="M0 80 V62 Q110 50 220 64 V80 Z" fill="#2A1F4D" />
      {[0, 14, 28, 42, 56, 70, 84].map((x) => (
        <path key={x} d={`M${x + 4} 66 V40 l3 -6 l3 6 V66`} fill="#221940" />
      ))}
      <path d="M2 46 H96 M2 58 H96" stroke="#221940" strokeWidth="2.5" />
      <path d="M108 66 V38 Q108 20 126 20 Q144 20 144 38 V66 Z" fill={st} stroke="#5B4290" strokeWidth="2" />
      <text x="126" y="45" textAnchor="middle" fontSize="12" fontWeight="800" fill="#C9B6FF" fontFamily="system-ui, sans-serif" transform={flip ? "translate(252 0) scale(-1 1)" : undefined}>
        BOO
      </text>
      <path d="M156 66 V48 Q156 36 168 36 Q180 36 180 48 V66 Z" fill={st} stroke="#5B4290" strokeWidth="2" />
      <path d="M168 47 a3 3 0 0 1 4.5 4 l-4.5 4.5 l-4.5 -4.5 a3 3 0 0 1 4.5 -4 Z" fill="#FF9EC4" />
      <ellipse cx="200" cy="62" rx="12" ry="10" fill="#FF9A3C" className="bn-win is-2" />
      <path d="M195 60 l2 -3 l2 3 Z M201 60 l2 -3 l2 3 Z M195 65 q5 3 10 0" fill="#FFE7A3" stroke="#FFE7A3" strokeWidth=".8" />
      <path d="M200 52 q1 -4 4 -5" stroke="#5E8C3A" strokeWidth="2" fill="none" />
    </svg>
  );
}

const WIN = ["#FFD27A", "#FFB0D0", "#9BE7C4"];
function House({ variant, className }: { variant: 0 | 1 | 2; className: string }) {
  const sil = "#2B2052";
  if (variant === 0)
    return (
      <svg className={`bn-house ${className}`} viewBox="0 0 120 110" aria-hidden>
        <path d="M14 110 V58 L40 34 L66 58 V110 Z" fill={sil} />
        <path d="M58 110 V44 H96 V110 Z" fill={sil} />
        <path d="M54 46 L77 4 Q80 0 82 6 L100 46 Z" fill={sil} />
        <rect x="24" y="66" width="10" height="13" rx="2" fill={WIN[0]} className="bn-win" />
        <rect x="45" y="66" width="10" height="13" rx="2" fill={WIN[1]} className="bn-win is-2" />
        <rect x="71" y="56" width="11" height="15" rx="5" fill={WIN[0]} className="bn-win is-3" />
        <rect x="71" y="82" width="11" height="14" rx="2" fill={WIN[2]} />
      </svg>
    );
  if (variant === 1)
    return (
      <svg className={`bn-house ${className}`} viewBox="0 0 120 110" aria-hidden>
        <path d="M20 110 V52 L60 18 L100 52 V110 Z" fill={sil} />
        <rect x="74" y="22" width="9" height="20" fill={sil} />
        <path d="M60 36 a5 5 0 0 1 7 7 l-7 7 l-7 -7 a5 5 0 0 1 7 -7 Z" fill={WIN[1]} className="bn-win is-2" />
        <rect x="32" y="62" width="12" height="15" rx="2" fill={WIN[0]} className="bn-win" />
        <rect x="76" y="62" width="12" height="15" rx="2" fill={WIN[0]} className="bn-win is-3" />
        <path d="M52 110 V90 Q60 80 68 90 V110 Z" fill="#FF9A3C" opacity=".75" />
      </svg>
    );
  return (
    <svg className={`bn-house ${className}`} viewBox="0 0 120 110" aria-hidden>
      <path d="M30 110 V30 L52 0 L74 30 V110 Z" fill={sil} transform="rotate(-4 52 110)" />
      <path d="M62 110 V62 L88 44 L114 62 V110 Z" fill={sil} />
      <circle cx="51" cy="44" r="6" fill={WIN[2]} className="bn-win is-2" />
      <rect x="45" y="68" width="10" height="13" rx="2" fill={WIN[0]} className="bn-win" />
      <rect x="82" y="70" width="12" height="14" rx="2" fill={WIN[1]} className="bn-win is-3" />
    </svg>
  );
}

// ── The spider drop (spider-drop-from-top.gif) ───────────────────────────────
//
// The GIF is one 4 s descent (the head goes from 10% to 77% of the box) and
// then loops back to the top, so every drop is a fresh, frame-0 copy (warmed
// ahead) that plays once: the box slides down from above the top edge while
// the GIF climbs down, a thread line runs from the screen's top edge to its
// head (same 3.6 s, linear, started on the image's load), and at 3.6 s, before
// the loop would jump, it zips back up. Head path in the box: x 0.44 → 0.72 W,
// y 0.10 → 0.77 H; the box slides −35% → −10% H, so the head crosses the top
// edge at 29% of the run at x 0.51 W and ends 0.6 H down, 7.3° off vertical.

const DROP_MS = 3600;

export function DropSpider({ run, side }: { run: number; side: "l" | "r" }) {
  const [drop, setDrop] = useState<{ id: number; src: string } | null>(null);
  const [phase, setPhase] = useState<"wait" | "down" | "up">("wait");
  const [eek, setEek] = useState(0);
  const timers = useRef<number[]>([]);
  useEffect(() => {
    const t = timers.current;
    return () => t.forEach((x) => window.clearTimeout(x));
  }, []);

  useEffect(() => {
    if (!run) return;
    preloadGif(GIF.spiderDrop);
    const t = window.setTimeout(() => {
      setPhase("wait");
      setDrop({ id: run, src: freshGif(GIF.spiderDrop) });
    }, 1400);
    return () => window.clearTimeout(t);
  }, [run]);

  const onLoad = () => {
    setPhase("down");
    timers.current.push(window.setTimeout(() => setPhase((ph) => (ph === "down" ? "up" : ph)), DROP_MS));
    timers.current.push(window.setTimeout(() => setDrop(null), DROP_MS + 520));
  };
  const tap = () => {
    if (phase !== "down") return;
    setPhase("up");
    setEek((n) => n + 1);
    haptic(10);
    sfx("swoosh-soft", { gain: 0.5 });
    sfx("bn-giggle", { gain: 0.45, at: 0.15 });
    timers.current.push(window.setTimeout(() => setDrop(null), 520));
  };

  return (
    <>
      {drop && (
        <div key={drop.id} className={`bn-drop is-${side} is-${phase}`} aria-hidden>
          <div className="bn-dropSwing">
            <span className="bn-thread" />
            <span className="bn-dropIn" onPointerDown={tap}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={drop.src} alt="" width={180} height={419} decoding="async" draggable={false} onLoad={onLoad} />
            </span>
          </div>
        </div>
      )}
      {eek > 0 && (
        <span key={`eek${eek}`} className={`bn-eek is-${side}`} aria-hidden>
          eek!
        </span>
      )}
    </>
  );
}

// ── The crawler (spider-crawl.webp) ──────────────────────────────────────────

/**
 * One spider crosses the ground per scene, `delay` ms in. It walks behind the
 * scene's content, so a document-level hit test catches taps on the visible bit
 * (never stealing a tap from a button). Tapped: it scurries off, 7× faster.
 */
export function Crawler({ run, delay = 6500 }: { run: number; delay?: number }) {
  const el = useRef<HTMLSpanElement>(null);
  const [on, setOn] = useState(false);
  // (keyed by the scene visit, so a new scene starts a new crossing)
  useEffect(() => {
    const t = window.setTimeout(() => setOn(true), delay);
    return () => window.clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    const node = el.current;
    if (!on || !node) return;
    const w = window.innerWidth;
    const s = node.offsetWidth;
    const ltr = run % 2 === 0;
    const xs = ltr ? [-s - 10, w * 0.3, w * 0.62, w + 10] : [w + 10, w * 0.66, w * 0.34, -s - 10];
    const anim = node.animate(
      [
        { transform: `translate(${xs[0]}px, 0) rotate(${ltr ? 4 : -4}deg)` },
        { transform: `translate(${xs[1]}px, -9px) rotate(${ltr ? -3 : 3}deg)` },
        { transform: `translate(${xs[2]}px, 3px) rotate(${ltr ? 3 : -3}deg)` },
        { transform: `translate(${xs[3]}px, -4px) rotate(0deg)` },
      ],
      { duration: Math.max(7000, w * 14), easing: "linear", fill: "forwards" },
    );
    anim.onfinish = () => setOn(false);
    const hit = (e: PointerEvent) => {
      const t = e.target as Element | null;
      if (t?.closest?.("button, a, input, textarea, select, [role='slider'], .bn-gateBox")) return;
      const r = node.getBoundingClientRect();
      const pad = 10;
      if (e.clientX < r.left - pad || e.clientX > r.right + pad || e.clientY < r.top - pad || e.clientY > r.bottom + pad) return;
      if (anim.playbackRate > 1) return;
      anim.playbackRate = 7;
      haptic(8);
      sfx("swoosh-soft", { gain: 0.35 });
    };
    document.addEventListener("pointerdown", hit, true);
    return () => {
      document.removeEventListener("pointerdown", hit, true);
      anim.cancel();
    };
  }, [on, run]);

  if (!on) return null;
  return (
    <span ref={el} className="bn-crawl" aria-hidden>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={GIF.spiderCrawl} alt="" width={260} height={260} decoding="async" draggable={false} />
    </span>
  );
}

// ── The running ghost (ghost-running.webp, v7) ───────────────────────────────

interface Dash {
  id: number;
  /** a quick small whoosh in front, near the top (else: a slower pass behind the scene) */
  front: boolean;
  /** vertical position, in vh */
  y: number;
  ms: number;
  size: number;
  /** the lights dim for a beat as it passes */
  dim: boolean;
}

/**
 * Every 8–20 s (the first 5–9 s in) the ghost dashes left → right at a random
 * height and speed. Most passes run behind the scene's content (never over the
 * Next pill or the text); about one in four is a small, fast whoosh in front
 * across the top band. Horror (not on kids pages): a dark shadow trails it, it
 * flickers mid-run, and every other slow pass dims the lights for a beat with a
 * soft "woo". Skipped while a scare or a scene change is on screen, or the tab
 * is hidden. Tap it (a document-level hit test, like the crawler): it gets
 * spooked and zooms off.
 */
export function RunningGhost({ horror }: { horror: boolean }) {
  const boo = useBoo();
  const busy = useRef(boo.busy);
  useEffect(() => {
    busy.current = boo.busy;
  }, [boo.busy]);
  const [dash, setDash] = useState<Dash | null>(null);
  const el = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let t = 0;
    let k = 0;
    const plan = (ms: number) => {
      t = window.setTimeout(fire, ms);
    };
    const fire = () => {
      if (document.hidden || busy.current || document.querySelector(".bn-veil.is-on, .bn-scareStage")) return plan(2500);
      k += 1;
      const front = k > 1 && Math.random() < 0.28;
      const wide = window.innerWidth >= 768;
      setDash({
        id: k,
        front,
        y: front ? 7 + Math.random() * 7 : 24 + Math.random() * 40,
        ms: (front ? 1150 + Math.random() * 450 : 2700 + Math.random() * 2300) * (wide ? 1.35 : 1),
        size: front ? (wide ? 74 : 58) : (wide ? 128 : 92) * (0.85 + Math.random() * 0.35),
        dim: horror && !front && k % 2 === 1,
      });
      plan(8000 + Math.random() * 12000);
    };
    plan(5000 + Math.random() * 4000);
    return () => window.clearTimeout(t);
  }, [horror]);

  useEffect(() => {
    const node = el.current;
    if (!dash || !node) return;
    const w = window.innerWidth;
    const s = dash.size;
    const anim = node.animate(
      [
        { transform: `translate(${-s - 30}px, 0)` },
        { transform: `translate(${w * 0.25}px, -14px)` },
        { transform: `translate(${w * 0.5}px, 8px)` },
        { transform: `translate(${w * 0.75}px, -12px)` },
        { transform: `translate(${w + 30}px, 0)` },
      ],
      { duration: dash.ms, easing: "linear", fill: "forwards" },
    );
    anim.onfinish = () => setDash(null);
    if (dash.front) sfx("swoosh-soft", { gain: 0.3 });
    if (dash.dim) sfx("bn-woo", { gain: 0.3, at: dash.ms / 2600 });
    const hit = (e: PointerEvent) => {
      const tg = e.target as Element | null;
      if (!dash.front && tg?.closest?.("button, a, input, textarea, select, [role='slider'], .bn-gateBox")) return;
      const r = node.getBoundingClientRect();
      const pad = 12;
      if (e.clientX < r.left - pad || e.clientX > r.right + pad || e.clientY < r.top - pad || e.clientY > r.bottom + pad) return;
      if (anim.playbackRate > 1) return;
      anim.playbackRate = 6;
      node.classList.add("is-spooked");
      haptic(10);
      sfx("swoosh-soft", { gain: 0.45 });
      sfx("bn-giggle", { gain: 0.35, at: 0.1 });
    };
    document.addEventListener("pointerdown", hit, true);
    return () => {
      document.removeEventListener("pointerdown", hit, true);
      anim.cancel();
    };
  }, [dash]);

  if (!dash) return null;
  return (
    <>
      {dash.dim && <span className="bn-dim" style={{ animationDuration: `${dash.ms}ms` }} aria-hidden />}
      <span
        ref={el}
        key={dash.id}
        className={`bn-runGhost${dash.front ? " is-front" : ""}${horror ? " is-horror" : ""}`}
        style={{ top: `${dash.y}vh`, width: dash.size, height: dash.size, ["--run" as string]: `${dash.ms}ms` }}
        aria-hidden
      >
        <span className="bn-runIn">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={GIF.ghostRun} alt="" width={220} height={220} decoding="async" draggable={false} />
        </span>
      </span>
    </>
  );
}

// ── The progress trail ───────────────────────────────────────────────────────

function MiniPumpkin() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden>
      <path d="M12 4.5 q1 -2.6 3.2 -2.9" stroke="#5E8C3A" strokeWidth="2" fill="none" strokeLinecap="round" />
      <ellipse cx="7.6" cy="14" rx="5.4" ry="7" fill="#F27B1F" />
      <ellipse cx="16.4" cy="14" rx="5.4" ry="7" fill="#F27B1F" />
      <ellipse cx="12" cy="14" rx="5.6" ry="7.6" fill="#FF9A3C" />
      <path d="M8.6 12.4 l1.6 -1.8 l1.4 1.8 Z M12.4 12.4 l1.6 -1.8 l1.4 1.8 Z" fill="#FFE7A3" />
      <path d="M8.4 16 q3.6 3 7.2 0 q-3.6 1.2 -7.2 0 Z" fill="#FFE7A3" />
    </svg>
  );
}

export function Trail({ labels, at, onJump }: { labels: string[]; at: number; onJump: (k: number) => void }) {
  const [nope, setNope] = useState<{ k: number; n: number } | null>(null);
  return (
    <nav className="bn-trail" aria-label={`Step ${Math.min(at + 1, labels.length)} of ${labels.length}`}>
      {labels.map((label, k) => {
        const done = k < at;
        const here = k === at;
        return (
          <button
            key={k}
            type="button"
            className={`bn-tk${done ? " is-done" : ""}${here ? " is-here" : ""}`}
            aria-label={done ? `Back to ${label}` : here ? `${label}, you are here` : `${label}, not yet`}
            aria-current={here ? "step" : undefined}
            title={done ? `Back to ${label}` : undefined}
            onClick={() => {
              if (done) {
                haptic(10);
                onJump(k);
              } else if (!here) {
                haptic(6);
                setNope((p) => ({ k, n: (p?.n ?? 0) + 1 }));
              }
            }}
          >
            <span key={nope?.k === k ? `n${nope.n}` : "s"} className={nope?.k === k ? "bn-tkNope" : undefined}>
              <MiniPumpkin />
            </span>
          </button>
        );
      })}
    </nav>
  );
}

// ── The scene change ─────────────────────────────────────────────────────────

/** Total length, and when the next scene is swapped in (the mist covers the screen then). */
export const VEIL_MS = 1250;
export const VEIL_SWAP_MS = 520;

export interface VeilControl {
  play: () => void;
}

/**
 * v7: one veil, mounted once and parked off-screen (hidden); each scene change
 * replays it with the Web Animations API, so the Next tap itself mounts and
 * re-renders nothing (the old per-change <Veil> cost a long task on the tap).
 */
export const Veil = memo(function Veil({ ctlRef }: { ctlRef: RefObject<VeilControl | null> }) {
  const el = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    ctlRef.current = {
      play: () => {
        const node = el.current;
        if (!node) return;
        node.getAnimations().forEach((a) => a.cancel());
        node.classList.add("is-on");
        const a = node.animate(
          [
            { transform: "translateY(100vh)", offset: 0 },
            { transform: "translateY(-30vh)", offset: 0.42 },
            { transform: "translateY(-62vh)", offset: 0.58 },
            { transform: "translateY(-250vh)", offset: 1 },
          ],
          { duration: VEIL_MS, easing: "cubic-bezier(.45,.05,.55,.95)" },
        );
        a.onfinish = () => node.classList.remove("is-on");
      },
    };
    return () => {
      ctlRef.current = null;
    };
  }, [ctlRef]);
  return (
    <span ref={el} className="bn-veil" aria-hidden>
      <span className="bn-veilGhosts">
        {[0, 1, 2, 3, 4].map((i) => (
          <Ghost key={i} size={74} mood={i === 2 ? "wink" : i % 2 ? "shy" : "happy"} tint="#E9E1FF" />
        ))}
      </span>
      <span className="bn-veilBody">
        <span className="bn-veilMoon" />
      </span>
      <span className="bn-veilBats">
        <Bat size={44} />
        <Bat size={32} />
        <Bat size={38} />
      </span>
    </span>
  );
});

// ── The gate's haunted house ─────────────────────────────────────────────────

const LIGHTS = [BN.pink, BN.candle, BN.mint, "#FFB27A", BN.lilac];

export function Manor({ style, className }: { style?: CSSProperties; className?: string }) {
  // fairy lights along a sagging wire from the left tower to the right one
  const bulbs = Array.from({ length: 11 }, (_, i) => {
    const t = (i + 0.5) / 11;
    const x = (1 - t) * (1 - t) * 116 + 2 * (1 - t) * t * 200 + t * t * 286;
    const y = (1 - t) * (1 - t) * 128 + 2 * (1 - t) * t * 166 + t * t * 116;
    return { x, y, c: LIGHTS[i % LIGHTS.length], d: (i * 0.37) % 1.6 };
  });
  return (
    <svg className={`bn-manor${className ? ` ${className}` : ""}`} style={style} viewBox="0 0 400 300" aria-hidden>
      <defs>
        <radialGradient id="bnManorGlow" cx="50%" cy="55%" r="55%">
          <stop offset="0" stopColor="#C9B6FF" stopOpacity=".55" />
          <stop offset="1" stopColor="#C9B6FF" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="bnWall" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#56439A" />
          <stop offset="1" stopColor="#3B2D6E" />
        </linearGradient>
        <linearGradient id="bnRoof" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#2F2360" />
          <stop offset="1" stopColor="#241A4A" />
        </linearGradient>
      </defs>
      <ellipse cx="200" cy="168" rx="200" ry="136" fill="url(#bnManorGlow)" />

      {/* chimney + candy smoke */}
      <rect x="246" y="66" width="20" height="46" fill="#33275F" />
      <rect x="242" y="62" width="28" height="8" rx="2" fill="#2A1F4D" />
      <circle className="bn-smoke" cx="256" cy="54" r="7" fill="#FFB0D0" />
      <circle className="bn-smoke is-2" cx="256" cy="54" r="6" fill="#C9B6FF" />
      <circle className="bn-smoke is-3" cx="256" cy="54" r="5" fill="#9BE7C4" />

      {/* left tower, witch-hat roof, a heart weathervane */}
      <rect x="58" y="108" width="58" height="192" fill="url(#bnWall)" />
      <path d="M46 112 Q78 76 86 16 Q96 76 128 112 Z" fill="url(#bnRoof)" />
      <path d="M86 16 q-2 -6 -8 -8" stroke="#2F2360" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M86 4 a4 4 0 0 1 6 5 l-6 6 l-6 -6 a4 4 0 0 1 6 -5 Z" fill={BN.pink} className="bn-vane" />
      <circle cx="87" cy="148" r="12" fill={BN.candle} className="bn-win" />
      <path d="M75 148 h24 M87 136 v24" stroke="#3B2D6E" strokeWidth="2.5" />
      <rect x="76" y="190" width="22" height="30" rx="11" fill={BN.pink} className="bn-win is-2" />

      {/* main house */}
      <rect x="110" y="138" width="180" height="162" fill="url(#bnWall)" />
      <path d="M96 142 L200 58 L304 142 Z" fill="url(#bnRoof)" data-roof="" />
      <path d="M118 126 L282 126 M134 112 L266 112 M150 98 L250 98" stroke="#3A2C6E" strokeWidth="2" />
      <path d="M200 98 a7 7 0 0 1 10 10 l-10 10 l-10 -10 a7 7 0 0 1 10 -10 Z" fill="#FFB0D0" className="bn-win is-3" />
      {[
        [128, 166, BN.candle, ""],
        [242, 166, BN.candle, " is-2"],
        [128, 226, "#FFB0D0", " is-3"],
        [242, 226, BN.candle, ""],
      ].map(([x, y, c, k], i) => (
        <g key={i}>
          <rect x={x as number} y={y as number} width="30" height="38" rx="3" fill={c as string} className={`bn-win${k}`} />
          <path d={`M${(x as number) + 15} ${y} v38 M${x} ${(y as number) + 19} h30`} stroke="#3B2D6E" strokeWidth="2.5" />
        </g>
      ))}
      {/* a little ghost peeks out of the top-right window */}
      <g className="bn-peek">
        <path d="M246 204 q0 -26 11 -26 q11 0 11 26 l-4 -3 l-3.5 3 l-3.5 -3 l-3.5 3 l-3.5 -3 Z" fill="#fff" />
        <circle cx="253" cy="190" r="1.8" fill={BN.ink} />
        <circle cx="261" cy="190" r="1.8" fill={BN.ink} />
        <ellipse cx="250" cy="195" rx="2.4" ry="1.4" fill={BN.pink} />
        <ellipse cx="264" cy="195" rx="2.4" ry="1.4" fill={BN.pink} />
      </g>
      <rect x="242" y="166" width="30" height="38" rx="3" fill="none" stroke="#3B2D6E" strokeWidth="3" />
      {/* door + porch */}
      <path d="M172 300 V248 Q200 214 228 248 V300 Z" fill="#2A1F4D" />
      <path d="M176 300 V250 Q200 220 224 250 V300" fill="none" stroke={BN.candle} strokeOpacity=".55" strokeWidth="2" />
      <path d="M200 262 a3.5 3.5 0 0 1 5 4.5 l-5 5 l-5 -5 a3.5 3.5 0 0 1 5 -4.5 Z" fill={BN.candle} />
      <path d="M160 238 L200 212 L240 238 Z" fill="#2F2360" />

      {/* right tower, leaning, with a mint window */}
      <g transform="rotate(4 308 300)">
        <rect x="282" y="88" width="52" height="212" fill="url(#bnWall)" />
        <path d="M270 92 Q302 60 312 8 Q320 60 348 92 Z" fill="url(#bnRoof)" />
        <rect x="296" y="116" width="24" height="32" rx="12" fill={BN.mint} className="bn-win is-3" />
        <rect x="296" y="186" width="24" height="30" rx="3" fill={BN.candle} className="bn-win" />
      </g>

      {/* fairy lights */}
      <path d="M116 128 Q200 204 286 116" stroke="#1F173D" strokeWidth="1.5" fill="none" />
      {bulbs.map((b, i) => (
        <circle key={i} cx={b.x.toFixed(1)} cy={(b.y + 3).toFixed(1)} r="3.2" fill={b.c} className="bn-bulb" style={{ animationDelay: `${b.d}s` }} />
      ))}

      {/* a tiny bat circling the tower */}
      <g className="bn-towerBat">
        <path d="M0 0 q-6 -6 -13 -2 q4 1 4 5 q3 -2 5 1 q1 -3 4 -4 q3 1 4 4 q2 -3 5 -1 q0 -4 4 -5 q-7 -4 -13 2 Z" fill="#1F173D" />
      </g>

      {/* ground + little fences */}
      <path d="M0 292 Q200 270 400 292 V300 H0 Z" fill="#2E2357" />
      {[8, 26, 44, 62, 336, 354, 372, 390].map((x) => (
        <path key={x} d={`M${x} 300 V276 l5 -7 l5 7 V300 Z`} fill="#241A4A" />
      ))}
      <path d="M4 284 H72 M332 284 H400" stroke="#241A4A" strokeWidth="3" />
    </svg>
  );
}

// ── CSS ──────────────────────────────────────────────────────────────────────

export const HAUNT_CSS = `
/* the atmosphere: over the sky (z 0), under the scenes (z 2) */
.bn-haunt { position: fixed; inset: 0; z-index: 1; pointer-events: none; overflow: hidden; }
.bn-fog { position: absolute; left: -50vw; width: 200vw; bottom: -4vh; height: 30vh; will-change: transform; opacity: .75;
  background: radial-gradient(22% 46% at 12% 62%, rgba(232,222,255,.5), transparent 70%), radial-gradient(18% 40% at 36% 70%, rgba(255,214,236,.35), transparent 70%),
    radial-gradient(24% 50% at 62% 66%, rgba(232,222,255,.45), transparent 70%), radial-gradient(18% 40% at 86% 72%, rgba(255,214,236,.32), transparent 70%); }
.bn-fog1 { animation: bn-fogA 38s ease-in-out infinite alternate; }
.bn-fog2 { bottom: 2vh; height: 22vh; opacity: .5; animation: bn-fogB 54s ease-in-out infinite alternate; }
@keyframes bn-fogA { from { transform: translateX(-12vw) } to { transform: translateX(14vw) } }
@keyframes bn-fogB { from { transform: translateX(16vw) } to { transform: translateX(-16vw) } }
.bn-haunt.is-peak .bn-fog { opacity: .25; }
.bn-vignette { position: absolute; inset: 0; background: radial-gradient(120% 90% at 50% 42%, transparent 52%, rgba(18,10,40,.5) 100%), linear-gradient(180deg, rgba(18,10,40,.32), transparent 22%); transition: opacity 1.4s ease; }
.bn-haunt.is-peak .bn-vignette { opacity: .3; }
.bn-flash { position: absolute; inset: 0; background: radial-gradient(90% 60% at 70% 10%, rgba(240,232,255,.9), rgba(200,182,255,.3) 60%, transparent); opacity: 0; animation: bn-flash 21s linear 6s infinite; }
@keyframes bn-flash { 0%, 92%, 100% { opacity: 0 } 92.6% { opacity: .2 } 93.2% { opacity: .04 } 94% { opacity: .14 } 95.5% { opacity: 0 } }
.bn-haunt.is-peak .bn-flash { display: none; }
.bn-yardSil { position: absolute; bottom: 0; width: clamp(150px, 44vw, 230px); height: auto; transition: opacity 1.4s ease; }
.bn-yardSil.is-l { left: -24px; } .bn-yardSil.is-r { right: -24px; }
@media (max-width: 767px) { .bn-yardSil { display: none; } }
.bn-haunt .bn-bigManor { display: none; }
@media (min-width: 1100px) { .bn-haunt .bn-bigManor { display: block; position: absolute; left: 1.5vw; bottom: 2vh; width: clamp(340px, 31vw, 640px); opacity: .92; transition: opacity 1.4s ease; } .bn-haunt.is-peak .bn-bigManor { opacity: .3; } .bn-h1 { display: none; } }
.bn-haunt.is-peak .bn-yardSil { opacity: .3; }

.bn-skyline { position: absolute; inset: auto 0 0 0; height: 30vh; }
.bn-town { position: absolute; left: 0; right: 0; bottom: 5vh; width: 100%; height: 13vh; min-height: 70px; opacity: .9; transition: opacity 1.4s ease; }
.bn-haunt.is-peak .bn-town { opacity: .25; }
.bn-cloud { position: absolute; left: 0; width: 70vw; max-width: 520px; height: 70px; border-radius: 50%; will-change: transform; opacity: .5;
  background: radial-gradient(40% 50% at 30% 60%, rgba(214,200,255,.45), transparent 70%), radial-gradient(36% 46% at 62% 46%, rgba(214,200,255,.4), transparent 70%), radial-gradient(30% 40% at 82% 64%, rgba(255,214,236,.3), transparent 70%); }
.bn-cloud.is-a { top: 15vh; animation: bn-cloud 70s linear infinite; animation-delay: -20s; }
.bn-cloud.is-b { top: 31vh; height: 54px; opacity: .35; animation: bn-cloud 95s linear infinite; animation-delay: -60s; }
@keyframes bn-cloud { from { transform: translateX(-80vw) } to { transform: translateX(110vw) } }
.bn-house { position: absolute; bottom: 7vh; width: clamp(84px, 24vw, 130px); height: auto; opacity: .92; transition: opacity 1.4s ease; }
.bn-h1 { left: -18px; bottom: 6vh; }
.bn-h5 { right: -22px; bottom: 5vh; width: clamp(80px, 22vw, 120px); }
.bn-h2, .bn-h3, .bn-h4 { display: none; }
.bn-haunt.is-peak .bn-house { opacity: .3; }
.bn-win { animation: bn-flicker 5.4s steps(1) infinite; }
.bn-win.is-2 { animation-duration: 7.1s; animation-delay: -2s; }
.bn-win.is-3 { animation-duration: 6.3s; animation-delay: -4s; }
@keyframes bn-flicker { 0%, 61%, 66%, 100% { opacity: 1 } 62% { opacity: .35 } 64% { opacity: .8 } 65% { opacity: .4 } }

.bn-flyBat { position: absolute; left: 0; top: 0; will-change: transform; opacity: .9; }
.bn-flyBat svg { display: block; }
.bn-flyBat.is-a { animation: bn-batA 17s linear infinite; animation-delay: -3s; }
.bn-flyBat.is-b { animation: bn-batB 23s linear infinite; animation-delay: -14s; }
.bn-flyBat.is-c { animation: bn-batC 29s linear infinite; animation-delay: -8s; }
.bn-flyBat.is-d { animation: bn-batA 21s linear infinite; animation-delay: -12s; }
.bn-flyBat.is-d svg { transform: translateY(-14vh); }
.bn-flyBat.is-e { animation: bn-batB 15s linear infinite; animation-delay: -2s; }
.bn-flyBat.is-e svg { transform: translateY(16vh); }
@keyframes bn-batA { 0% { transform: translate(-60px, 26vh) } 20% { transform: translate(30vw, 18vh) rotate(-6deg) } 40% { transform: translate(60vw, 24vh) } 60%, 100% { transform: translate(115vw, 12vh) } }
@keyframes bn-batB { 0% { transform: translate(110vw, 40vh) scale(.8) } 25% { transform: translate(70vw, 31vh) scale(.8) rotate(8deg) } 50%, 100% { transform: translate(-80px, 36vh) scale(.8) } }
@keyframes bn-batC { 0%, 45% { transform: translate(-70px, 8vh) scale(.9) } 70% { transform: translate(45vw, 14vh) scale(.9) rotate(-8deg) } 100% { transform: translate(112vw, 6vh) scale(.9) } }

/* v7: the webs are flush in the true screen corners (zero margin), generous, on every scene */
.bn-cornerWeb { position: absolute; left: 0; top: 0; width: clamp(112px, 31vw, 150px); height: auto; opacity: .95;
  filter: drop-shadow(0 0 .8px rgba(237,228,255,.95)) drop-shadow(0 0 .8px rgba(237,228,255,.8)); }
.bn-cornerWeb.is-still { filter: none; }
.bn-cuteWeb { position: absolute; right: -2px; top: -2px; width: clamp(122px, 35vw, 164px); height: auto; transform: scaleX(-1); transform-origin: 50% 0; opacity: .92; }
/* v8: on phones every scene's kicker sits right under the top bar, so both webs (and their
   dangling spiders) tuck into the corners above it and never cross the text */
@media (max-width: 767px) { .bn-cornerWeb { width: 56px; } .bn-cuteWeb { width: 64px; } }

@media (min-width: 768px) {
  .bn-house { width: clamp(110px, 11vw, 190px); bottom: 8vh; }
  .bn-h1 { left: 2vw; } .bn-h5 { right: 2vw; width: clamp(110px, 10vw, 170px); }
  .bn-h2 { display: block; left: 14vw; bottom: 12vh; width: clamp(80px, 7vw, 120px); opacity: .7; }
  .bn-h4 { display: block; right: 15vw; bottom: 11vh; width: clamp(80px, 7.5vw, 130px); opacity: .75; }
  .bn-cornerWeb { width: clamp(190px, 15vw, 300px); }
  .bn-cuteWeb { width: clamp(190px, 15vw, 300px); }
  .bn-yardSil { width: clamp(220px, 22vw, 340px); } .bn-yardSil.is-l { left: 0; } .bn-yardSil.is-r { right: 0; }
  .bn-flyBat svg { scale: 1.5; }
}
@media (min-width: 1100px) { .bn-h3 { display: block; left: calc(50% - var(--vw-stage-w, 600px) / 2 - 150px); bottom: 15vh; width: 120px; opacity: .6; } }

/* the spider drop: from the very top edge of the screen */
.bn-drop { --dw: 74px; --dh: calc(var(--dw) * 419 / 180); position: fixed; z-index: 40; top: 0; width: var(--dw); height: var(--dh); pointer-events: none;
  transition: transform .42s cubic-bezier(.5,0,.75,0); }
.bn-drop.is-r { right: calc(var(--vw-gutter, 0px) + 10px); }
.bn-drop.is-l { left: calc(var(--vw-gutter, 0px) + 6px); }
.bn-drop.is-up { transform: translateY(-120%); }
.bn-dropSwing { position: absolute; inset: 0; transform-origin: 51% 0; }
.bn-drop.is-down .bn-dropSwing, .bn-drop.is-up .bn-dropSwing { animation: bn-swing 1.7s ease-in-out infinite alternate; }
@keyframes bn-swing { from { transform: rotate(-3deg) } to { transform: rotate(3deg) } }
.bn-thread { position: absolute; left: 51%; top: 0; width: 1.5px; margin-left: -.75px; height: calc(var(--dh) * .6); transform-origin: 50% 0; transform: rotate(-7.3deg) scaleY(0);
  background: linear-gradient(180deg, rgba(255,255,255,.35), rgba(255,255,255,.85)); }
.bn-dropIn { position: absolute; inset: 0; display: block; transform: translateY(-35%); opacity: 0; pointer-events: auto; cursor: pointer; -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
.bn-dropIn img { display: block; width: 100%; height: 100%; filter: drop-shadow(0 0 1.5px rgba(255,255,255,.9)) drop-shadow(0 6px 8px rgba(20,10,40,.45)); }
.bn-drop.is-down .bn-dropIn, .bn-drop.is-up .bn-dropIn { opacity: 1; animation: bn-dropDown ${DROP_MS}ms linear forwards; }
.bn-drop.is-down .bn-thread, .bn-drop.is-up .bn-thread { animation: bn-threadDown ${DROP_MS}ms linear forwards; }
@keyframes bn-dropDown { from { transform: translateY(-35%) } to { transform: translateY(-10%) } }
@keyframes bn-threadDown { 0%, 29% { transform: rotate(-7.3deg) scaleY(0) } 100% { transform: rotate(-7.3deg) scaleY(1) } }
.bn-eek { position: fixed; z-index: 41; top: 74px; padding: 5px 11px 6px; border-radius: 14px 14px 14px 4px; background: #FFFBF4; color: ${BN.ink}; font: 400 19px/1 ${HAND};
  box-shadow: 0 0 0 2px #fff inset, 0 6px 14px rgba(30,16,60,.35); pointer-events: none; animation: bn-eek 1.3s cubic-bezier(.3,1.5,.5,1) forwards; }
.bn-eek.is-r { right: calc(var(--vw-gutter, 0px) + 54px); border-radius: 14px 14px 4px 14px; }
.bn-eek.is-l { left: calc(var(--vw-gutter, 0px) + 54px); }
@keyframes bn-eek { 0% { opacity: 0; transform: scale(.4) } 18% { opacity: 1; transform: scale(1.08) } 30%, 75% { opacity: 1; transform: scale(1) } 100% { opacity: 0; transform: translateY(-14px) scale(.9) } }
/* v8: phones: a small, short drop hugging the screen edge, ending above the scene's text */
@media (max-width: 767px) {
  .bn-drop { --dw: 40px; }
  .bn-drop.is-r { right: calc(var(--vw-gutter, 0px) + 2px); }
  .bn-drop.is-l { left: calc(var(--vw-gutter, 0px) + 2px); }
  .bn-eek { top: 70px; }
  .bn-eek.is-r { right: calc(var(--vw-gutter, 0px) + 40px); }
  .bn-eek.is-l { left: calc(var(--vw-gutter, 0px) + 40px); }
}
@media (min-width: 768px) {
  .bn-drop { --dw: 104px; }
  .bn-drop.is-r { right: 13vw; }
  .bn-drop.is-l { left: 12vw; }
  .bn-eek.is-r { right: calc(13vw + 58px); top: 110px; }
  .bn-eek.is-l { left: calc(12vw + 58px); top: 110px; }
}

/* the crawler: on the ground, behind the scene */
.bn-crawl { position: fixed; z-index: 1; left: 0; bottom: max(2px, calc(env(safe-area-inset-bottom, 0px) - 6px)); width: 62px; height: 62px; pointer-events: none; will-change: transform; }
.bn-crawl img { display: block; width: 100%; height: 100%; filter: drop-shadow(0 0 1.5px rgba(255,255,255,.75)) drop-shadow(0 4px 4px rgba(20,10,40,.5)); }
@media (min-width: 768px) { .bn-crawl { width: 84px; height: 84px; bottom: 4px; } }

/* the trail: a small pumpkin trail in the very top-left corner (level with the editor's top-right bar) */
.bn-trail { position: fixed; z-index: 62; top: max(8px, env(safe-area-inset-top, 0px)); left: max(8px, env(safe-area-inset-left, 0px));
  display: flex; align-items: center; height: 28px; padding: 0 4px; border-radius: 99px;
  background: rgba(36,26,70,.62); border: 1px solid rgba(255,210,122,.28); box-shadow: 0 0 16px -6px rgba(255,154,60,.55), inset 0 1px 0 rgba(255,255,255,.1);
  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
.bn-tk { all: unset; width: 17px; height: 28px; display: grid; place-items: center; cursor: default; touch-action: manipulation; -webkit-tap-highlight-color: transparent; position: relative; }
/* a bigger invisible tap target for the lit (tappable) ones */
.bn-tk.is-done::after { content: ""; position: absolute; inset: -8px -2px; }
.bn-tk > span { display: grid; place-items: center; filter: grayscale(1) brightness(.6); opacity: .55; transition: filter .3s, opacity .3s; }
.bn-tk.is-done { cursor: pointer; }
.bn-tk.is-done > span { filter: drop-shadow(0 0 3px rgba(255,179,71,.9)); opacity: 1; }
.bn-tk.is-done:active > span { transform: scale(.8); }
.bn-tk.is-here > span { filter: drop-shadow(0 0 5px rgba(255,210,122,1)); opacity: 1; animation: bn-tkBob 1.3s ease-in-out infinite alternate; }
.bn-tk:focus-visible { outline: 2px solid ${BN.mint}; outline-offset: -2px; border-radius: 6px; }
.bn-tkNope { animation: bn-tkNope .42s ease-in-out; }
@keyframes bn-tkBob { from { transform: translateY(1px) scale(1.1) } to { transform: translateY(-2px) scale(1.28) } }
@keyframes bn-tkNope { 0%,100% { transform: rotate(0) } 20% { transform: rotate(-16deg) } 45% { transform: rotate(13deg) } 70% { transform: rotate(-8deg) } }

/* the running ghost (v7): behind the scene (z 1) or a small whoosh in front (z 70) */
.bn-runGhost { position: fixed; z-index: 1; left: 0; pointer-events: none; will-change: transform; }
.bn-runGhost.is-front { z-index: 70; }
.bn-runIn { display: block; width: 100%; height: 100%; animation: bn-runBob .34s ease-in-out infinite alternate; }
.bn-runGhost img { display: block; width: 100%; height: 100%; filter: drop-shadow(0 0 2px rgba(255,255,255,.9)) drop-shadow(0 0 10px rgba(201,182,255,.55)); }
.bn-runGhost.is-horror img { filter: drop-shadow(0 0 2px rgba(255,255,255,.9)) drop-shadow(0 0 12px rgba(155,231,196,.55)) drop-shadow(-26px 14px 7px rgba(10,4,26,.6)); }
.bn-runGhost.is-horror .bn-runIn { animation: bn-runBob .34s ease-in-out infinite alternate, bn-runFlicker var(--run, 3s) steps(1) forwards; }
.bn-runGhost.is-spooked .bn-runIn { animation: bn-runSpook .5s cubic-bezier(.3,1.6,.5,1) forwards; }
@keyframes bn-runBob { from { translate: 0 0 } to { translate: 0 -5px } }
@keyframes bn-runFlicker { 0%, 40%, 49%, 100% { opacity: 1 } 42% { opacity: .15 } 44% { opacity: .9 } 46% { opacity: .05 } 47.5% { opacity: .7 } }
@keyframes bn-runSpook { 0% { transform: scale(1) rotate(0) } 30% { transform: scale(1.3) rotate(-12deg) } 100% { transform: scale(.7) rotate(8deg) } }
/* the lights dim for a beat as it passes (the night behind the scene; the ghost glows over it) */
.bn-dim { position: fixed; inset: 0; z-index: 1; pointer-events: none; opacity: 0; animation: bn-dim 3s linear forwards;
  background: radial-gradient(130% 100% at 50% 45%, rgba(10,4,26,.25), rgba(10,4,26,.7)); }
@keyframes bn-dim { 0%, 18% { opacity: 0 } 24% { opacity: .9 } 27% { opacity: .35 } 30%, 62% { opacity: .85 } 64% { opacity: .5 } 66% { opacity: .8 } 88%, 100% { opacity: 0 } }

/* the scene change: a mist curtain with ghost heads rises and lifts away */
.bn-veil { position: fixed; z-index: 85; left: 0; right: 0; top: 0; height: 250vh; pointer-events: none; contain: strict; transform: translateY(100vh); visibility: hidden; }
.bn-veil.is-on { visibility: visible; will-change: transform; }
.bn-veilGhosts { position: absolute; left: -4vw; right: -4vw; top: 0; height: 60px; display: flex; justify-content: space-around; align-items: flex-end; }
.bn-veilGhosts svg { width: clamp(60px, 9vw, 110px); height: auto; margin-bottom: -26px; filter: drop-shadow(0 -6px 14px rgba(201,182,255,.45)); }
.bn-veilGhosts svg:nth-child(odd) { margin-bottom: -38px; }
.bn-veilBody { position: absolute; left: 0; right: 0; top: 50px; bottom: 0; border-radius: 40% 40% 0 0 / 30px 30px 0 0;
  background: linear-gradient(180deg, #E9E1FF 0, #B9A6F0 30px, #5B4290 22vh, #3B2D6E 60vh, #2A1F4D 100%); }
.bn-veilMoon { position: absolute; left: 50%; top: 92vh; width: 120px; height: 120px; margin-left: -60px; border-radius: 50%;
  background: radial-gradient(circle at 40% 40%, #FFF6D8, #FFE3A3 55%, rgba(255,210,122,0) 72%); box-shadow: 0 0 80px 30px rgba(255,210,122,.25); }
.bn-veilBats { position: absolute; left: 0; right: 0; top: 70vh; display: flex; justify-content: space-around; }
.bn-veilBats svg:nth-child(2) { margin-top: 18vh; } .bn-veilBats svg:nth-child(3) { margin-top: 6vh; }

/* the gate's manor */
.bn-manor { display: block; width: 100%; height: auto; overflow: visible; }
.bn-smoke { animation: bn-smoke 3.6s ease-out infinite; transform-box: fill-box; transform-origin: center; opacity: 0; }
.bn-smoke.is-2 { animation-delay: 1.2s; } .bn-smoke.is-3 { animation-delay: 2.4s; }
@keyframes bn-smoke { 0% { transform: translate(0, 0) scale(.5); opacity: 0 } 15% { opacity: .9 } 100% { transform: translate(14px, -46px) scale(1.6); opacity: 0 } }
.bn-bulb { animation: bn-bulb 1.6s ease-in-out infinite alternate; }
@keyframes bn-bulb { from { opacity: .45 } to { opacity: 1 } }
.bn-peek { animation: bn-peek 6s ease-in-out infinite; }
@keyframes bn-peek { 0%, 55%, 100% { transform: translateY(30px) } 65%, 88% { transform: translateY(0) } }
.bn-vane { transform-box: fill-box; transform-origin: 50% 100%; animation: bn-vane 3s ease-in-out infinite alternate; }
@keyframes bn-vane { from { transform: rotate(-12deg) } to { transform: rotate(12deg) } }
.bn-towerBat { animation: bn-towerBat 7s linear infinite; }
@keyframes bn-towerBat { 0% { transform: translate(40px, 70px) } 25% { transform: translate(110px, 40px) scale(.8) } 50% { transform: translate(150px, 76px) } 75% { transform: translate(90px, 96px) scale(1.1) } 100% { transform: translate(40px, 70px) } }

@media (prefers-reduced-motion: reduce) {
  .bn-fog, .bn-flash, .bn-cloud, .bn-win, .bn-smoke, .bn-bulb, .bn-peek, .bn-vane, .bn-towerBat, .bn-tk > span { animation: none !important; }
  .bn-smoke, .bn-towerBat { display: none; }
  .bn-peek { transform: translateY(30px); }
}
`;
