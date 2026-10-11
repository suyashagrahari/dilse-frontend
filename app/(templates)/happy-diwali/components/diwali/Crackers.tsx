"use client";

// Scene 6 — The crackers playground. A courtyard at night: a tray of five
// crackers along the bottom (anar, chakri, rocket, phuljhadi, colour pencil).
// Pick one and tap the ground (or the sky, for a rocket), or drag it straight
// out of the tray to where it should go. Each one lights from a fizzing fuse
// and does its own thing on the canvas (./crackerEngine.ts). A counter keeps
// score ("12 crackers lit!"); at 5 the way forward appears, and every
// milestone (5, 10, 20, 30…) sets off one of the owner's big fireworks GIFs as
// a finale across the sky. The heavy two (751 KB, 1.4 MB) are fetched only
// after the first finale, on idle.
//
// Reduced motion: no particles, no GIFs; every cracker becomes a calm, still
// pool of warm light where it was placed (the counter still counts).

import { useEffect, useRef, useState, type PointerEvent as RPointerEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import { FONTS } from "../../../_valentine/theme";
import { createCrackerEngine, type CrackerEngine, type CrackerKind } from "./crackerEngine";
import { DW_DISPLAY } from "./fonts";
import { DW_GIF, preload, useDw, useNext } from "./stage";
import { Hint, SceneTitle } from "./ui";

const TO_UNLOCK = 5;
const MILESTONES = (n: number) => n === TO_UNLOCK || (n >= 10 && n % 10 === 0);
/** ground starts this far down the playground */
const GROUND = 0.64;
const now = () => performance.now();
const rand = () => Math.random();

const KINDS: { id: CrackerKind; label: string; hint: string }[] = [
  { id: "anar", label: "Anar", hint: "flower pot" },
  { id: "chakri", label: "Chakri", hint: "spinner" },
  { id: "rocket", label: "Rocket", hint: "tap the sky" },
  { id: "phuljhadi", label: "Phuljhadi", hint: "sparkler" },
  { id: "pencil", label: "Pencil", hint: "colour stars" },
];

const CSS = `
.dw-cp { position: relative; width: 100%; height: 100%; border-radius: 22px; overflow: hidden; touch-action: none; cursor: crosshair; -webkit-tap-highlight-color: transparent; user-select: none; -webkit-user-select: none;
  box-shadow: inset 0 0 0 1px rgba(255,207,90,.22), 0 20px 50px -24px rgba(0,0,0,.8);
  background: radial-gradient(120% 70% at 50% 10%, rgba(143,20,22,.25), rgba(42,5,7,.35) 70%); }
@media (min-width: 1100px) { .dw-cp { border-radius: 28px; } }
.dw-cp canvas { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 2; }
.dw-cp-ground { position: absolute; left: 0; right: 0; bottom: 0; top: ${GROUND * 100}%; z-index: 0;
  background: linear-gradient(180deg, #5A160F 0%, #3E0B08 45%, #250504 100%); box-shadow: 0 -1px 0 rgba(255,207,90,.35), 0 -18px 40px -10px rgba(246,168,33,.25); }
/* a chalk rangoli on the courtyard floor, in perspective */
.dw-cp-ground::before { content: ""; position: absolute; left: 50%; top: 52%; width: min(70%, 420px); aspect-ratio: 1; transform: translate(-50%, -50%) scaleY(.32); border-radius: 50%;
  background: repeating-radial-gradient(circle, rgba(255,207,90,.28) 0 2px, transparent 2px 16px), radial-gradient(circle, rgba(255,95,162,.22), rgba(63,224,197,.12) 45%, transparent 70%); }
.dw-cp-ground::after { content: ""; position: absolute; inset: 0; background: repeating-linear-gradient(90deg, rgba(0,0,0,.12) 0 1px, transparent 1px 64px); opacity: .6; }
.dw-cp-count { position: absolute; z-index: 3; left: 50%; top: 10px; transform: translateX(-50%); padding: 6px 14px 5px; border-radius: 99px; white-space: nowrap; pointer-events: none;
  background: linear-gradient(180deg, rgba(122,15,18,.92), rgba(58,7,9,.92)); border: 1px solid rgba(255,207,90,.5); color: #FFE7A8;
  font: 400 clamp(15px, 2.4dvh, 19px)/1.2 ${DW_DISPLAY}; box-shadow: 0 0 22px -4px rgba(255,180,60,.6); }
.dw-cp-count b { color: #FFCF5A; font-weight: 400; }
.dw-cp-count.bump { animation: dw-cp-bump .4s cubic-bezier(.2,1.6,.4,1); }
@keyframes dw-cp-bump { 0% { transform: translateX(-50%) scale(1) } 40% { transform: translateX(-50%) scale(1.18) } 100% { transform: translateX(-50%) scale(1) } }
.dw-cp-hint { position: absolute; z-index: 1; left: 0; right: 0; top: 42%; text-align: center; pointer-events: none; font: 600 clamp(13px, 2dvh, 15px) ${FONTS.ui}; color: rgba(255,231,168,.75); }
.dw-finale { position: absolute; z-index: 1; left: 50%; top: 40%; width: min(96%, 96cqh, 520px); aspect-ratio: 1; transform: translate(-50%, -50%); pointer-events: none; mix-blend-mode: screen; }
.dw-finale img { width: 100%; height: 100%; object-fit: contain; display: block; }
.dw-calm { position: absolute; z-index: 1; width: 120px; height: 120px; margin: -60px 0 0 -60px; border-radius: 50%; pointer-events: none;
  background: radial-gradient(circle, rgba(255,240,200,.9) 0 6%, rgba(255,207,90,.5) 18%, rgba(246,140,33,.18) 45%, transparent 70%); transition: opacity 1.2s ease; }

/* the tray */
.dw-tray { flex: none; width: 100%; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); gap: clamp(4px, 1.6vw, 10px); padding: 8px; box-sizing: border-box; border-radius: 20px;
  background: linear-gradient(180deg, #7A1418, #4A0A0D); box-shadow: inset 0 0 0 1.5px rgba(255,207,90,.55), inset 0 0 0 5px rgba(122,20,24,1), inset 0 0 0 6px rgba(255,207,90,.25), 0 14px 30px -14px rgba(0,0,0,.8); }
.dw-ck { position: relative; display: grid; justify-items: center; gap: 1px; padding: 6px 2px 5px; border: 0; border-radius: 14px; background: rgba(42,5,7,.35); color: #FFE7A8; cursor: grab; touch-action: none;
  -webkit-tap-highlight-color: transparent; transition: transform .2s cubic-bezier(.2,1.4,.4,1), background .2s; }
.dw-ck svg { width: clamp(30px, 5.4dvh, 42px); height: clamp(30px, 5.4dvh, 42px); display: block; overflow: visible; }
.dw-ck span { font: 700 clamp(11px, 1.65dvh, 12.5px)/1.1 ${FONTS.ui}; letter-spacing: .01em; }
.dw-ck small { font: 500 clamp(9.5px, 1.4dvh, 10.5px)/1.1 ${FONTS.ui}; color: rgba(255,231,168,.6); white-space: nowrap; }
.dw-ck.is-on { background: radial-gradient(circle at 50% 30%, rgba(255,207,90,.4), rgba(246,168,33,.12) 70%); box-shadow: inset 0 0 0 2px #FFCF5A, 0 0 18px -2px rgba(255,190,70,.7); transform: translateY(-3px); }
.dw-ck:focus-visible { outline: 3px solid #FFF1B8; outline-offset: 2px; }
@media (max-height: 700px) { .dw-ck small { display: none; } }
.dw-ghost svg { width: 100%; height: 100%; display: block; overflow: visible; }
.dw-ghost { position: fixed; z-index: 80; width: 56px; height: 56px; margin: -28px 0 0 -28px; pointer-events: none; filter: drop-shadow(0 0 12px rgba(255,190,70,.9)); }
@media (prefers-reduced-motion: reduce) { .dw-cp-count.bump { animation: none; } }
`;

/** The tray's little cracker drawings (40×40). */
export function CrackerIcon({ kind }: { kind: CrackerKind }): ReactNode {
  switch (kind) {
    case "anar":
      return (
        <svg viewBox="0 0 40 40" aria-hidden>
          <path d="M20 2 l1.6 5 M14 5 l3 4.5 M26 5 l-3 4.5" stroke="#FFE7A8" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M8 36 L32 36 L24 12 L16 12 Z" fill="#C8321A" />
          <path d="M11.5 27 H28.5" stroke="#FFCF5A" strokeWidth="2.6" />
          <path d="M14 20 H26" stroke="#FFCF5A" strokeWidth="1.4" />
          <rect x="15" y="10" width="10" height="3" rx="1" fill="#FFCF5A" />
        </svg>
      );
    case "chakri":
      return (
        <svg viewBox="0 0 40 40" aria-hidden>
          <circle cx="20" cy="22" r="13" fill="none" stroke="#2E8F4E" strokeWidth="5" />
          <circle cx="20" cy="22" r="13" fill="none" stroke="#FFCF5A" strokeWidth="1.2" strokeDasharray="3 4" />
          <path d="M20 22 m-6 0 a6 6 0 1 1 6 6" fill="none" stroke="#C8321A" strokeWidth="2.4" />
          <circle cx="20" cy="22" r="2.4" fill="#FFCF5A" />
          <path d="M33 14 l4 -3 M35 22 h4" stroke="#7CFF6B" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "rocket":
      return (
        <svg viewBox="0 0 40 40" aria-hidden>
          <path d="M20 1 L25.5 10 H14.5 Z" fill="#FFCF5A" />
          <rect x="14.5" y="10" width="11" height="17" fill="#B3121B" />
          <path d="M14.5 15 H25.5 M14.5 21 H25.5" stroke="#FFCF5A" strokeWidth="1.6" />
          <path d="M20 27 V39" stroke="#9A6A3A" strokeWidth="1.8" />
          <path d="M14.5 27 L10 32 L14.5 30 Z M25.5 27 L30 32 L25.5 30 Z" fill="#FF8A1E" />
        </svg>
      );
    case "phuljhadi":
      return (
        <svg viewBox="0 0 40 40" aria-hidden>
          <path d="M14 38 L24 12" stroke="#9A8C80" strokeWidth="1.8" strokeLinecap="round" />
          <path d="M19.4 24 L24 12" stroke="#5A4A40" strokeWidth="3.4" strokeLinecap="round" />
          <g stroke="#FFF1B8" strokeWidth="1.4" strokeLinecap="round">
            <path d="M24 12 l0 -9 M24 12 l7 -6 M24 12 l9 1 M24 12 l6 6 M24 12 l-7 -5 M24 12 l-8 2" />
          </g>
          <circle cx="24" cy="12" r="3" fill="#FFF6DC" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 40 40" aria-hidden>
          <rect x="15" y="12" width="10" height="6" fill="#FF4D3A" />
          <rect x="15" y="18" width="10" height="6" fill="#FFCF5A" />
          <rect x="15" y="24" width="10" height="6" fill="#3FE0C5" />
          <rect x="15" y="30" width="10" height="7" fill="#FF5FA2" />
          <circle cx="13" cy="5" r="2.6" fill="#B98CFF" />
          <circle cx="27" cy="3.5" r="2.2" fill="#7CFF6B" />
          <circle cx="20" cy="8" r="2" fill="#FFF1B8" />
        </svg>
      );
  }
}

type Calm = { id: number; x: number; y: number };
type Drag = { kind: CrackerKind; id: number; x0: number; y0: number; moved: boolean };

export default function Crackers({ onNext }: { onNext: () => void }) {
  const reduced = useReducedMotion();
  const { cue, round } = useDw();
  const boxRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const eng = useRef<CrackerEngine | null>(null);
  const [kind, setKind] = useState<CrackerKind>("anar");
  const [lit, setLit] = useState(0);
  const litRef = useRef(0);
  const [bump, setBump] = useState(0);
  const [calm, setCalm] = useState<Calm[]>([]);
  const [finale, setFinale] = useState<{ id: number; src: string } | null>(null);
  const pool = useRef<string[]>([DW_GIF.skyDeepavali, DW_GIF.skyHanabi]);
  const finales = useRef(0);
  const drag = useRef<Drag | null>(null);
  const [ghost, setGhost] = useState<{ kind: CrackerKind; x: number; y: number } | null>(null);
  const lastBoom = useRef(0);

  // Media: the small sky-shots now; the confetti fountain after first paint.
  useEffect(() => {
    if (reduced) return;
    preload(DW_GIF.skyDeepavali);
    preload(DW_GIF.skyHanabi);
    const t = window.setTimeout(() => {
      const img = new Image();
      img.onload = () => {
        if (!pool.current.includes(DW_GIF.putukan)) pool.current.splice(1, 0, DW_GIF.putukan);
      };
      img.src = DW_GIF.putukan;
    }, 1800);
    return () => window.clearTimeout(t);
  }, [reduced]);

  // The engine lives as long as the scene.
  useEffect(() => {
    const el = boxRef.current;
    const cv = canvasRef.current;
    if (!el || !cv || reduced) return;
    const e = createCrackerEngine(cv, {
      onBoom: (k, x, w) => {
        const t = now();
        if (t - lastBoom.current < 70) return;
        lastBoom.current = t;
        const pan = (x / Math.max(1, w)) * 2 - 1;
        if (k === "rocket") {
          haptic([12, 40, 18]);
          cue("firework", { gain: 0.5, pan, detune: (rand() - 0.5) * 400 });
        } else {
          haptic(6);
          cue("pop", { gain: 0.3, pan, detune: rand() * 500 });
        }
      },
    });
    eng.current = e;
    const fit = () => {
      const r = el.getBoundingClientRect();
      e.resize(r.width, r.height);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => {
      ro.disconnect();
      e.destroy();
      eng.current = null;
    };
  }, [reduced, cue]);

  const showFinale = () => {
    const k = finales.current++;
    if (k === 0) {
      // the two heavy ones join the rotation, on idle, after the first finale
      const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
      const load = () => {
        for (const src of [DW_GIF.crackerExplode, DW_GIF.nemzeti]) {
          const img = new Image();
          img.decoding = "async";
          img.onload = () => {
            if (!pool.current.includes(src)) pool.current.push(src);
          };
          img.src = src;
        }
      };
      if (w.requestIdleCallback) w.requestIdleCallback(load, { timeout: 4000 });
      else window.setTimeout(load, 2500);
    }
    const src = pool.current[k % pool.current.length];
    const id = now();
    setFinale({ id, src });
    cue("chime-cascade", { gain: 0.4 });
    window.setTimeout(() => setFinale((f) => (f && f.id === id ? null : f)), 2600);
  };

  /** Light one: `x, y` in playground coordinates. */
  const light = (k: CrackerKind, x: number, y: number) => {
    const el = boxRef.current;
    if (!el) return;
    const W = el.clientWidth;
    const H = el.clientHeight;
    const gTop = H * GROUND;
    x = Math.max(18, Math.min(W - 18, x));
    const onGround = y >= gTop ? Math.min(H - 14, Math.max(gTop + 22, y)) : gTop + (H - gTop) * 0.5;
    haptic(10);
    cue("match-strike", { gain: 0.28, detune: (rand() - 0.5) * 300 });
    if (reduced) {
      const id = now();
      setCalm((c) => [...c.slice(-11), { id, x, y: k === "rocket" && y < gTop ? y : onGround }]);
    } else if (k === "rocket") {
      const ty = y < gTop - 30 ? Math.max(H * 0.08, y) : H * (0.12 + rand() * 0.25);
      eng.current?.place("rocket", x, onGround, ty);
      window.setTimeout(() => cue("whoosh", { gain: 0.3 }), 330);
    } else {
      eng.current?.place(k, x, onGround);
      if (k === "anar") window.setTimeout(() => cue("flame-whoosh", { gain: 0.35 }), 330);
      if (k === "phuljhadi") window.setTimeout(() => cue("sparkle", { gain: 0.4 }), 330);
    }
    const m = (litRef.current += 1);
    setLit(m);
    if (MILESTONES(m) && !reduced) window.setTimeout(showFinale, k === "rocket" ? 1300 : 900);
    setBump((b) => b + 1);
  };

  const onBoxDown = (e: RPointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    light(kind, e.clientX - r.left, e.clientY - r.top);
  };

  // Tray: tap = choose; drag out = light it where it's dropped.
  const onTrayDown = (k: CrackerKind, e: RPointerEvent<HTMLButtonElement>) => {
    drag.current = { kind: k, id: e.pointerId, x0: e.clientX, y0: e.clientY, moved: false };
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* fine */
    }
  };
  const onTrayMove = (e: RPointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    if (!d.moved && Math.hypot(e.clientX - d.x0, e.clientY - d.y0) > 10) {
      d.moved = true;
      setKind(d.kind);
    }
    if (d.moved) setGhost({ kind: d.kind, x: e.clientX, y: e.clientY });
  };
  const onTrayUp = (k: CrackerKind, e: RPointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    drag.current = null;
    setGhost(null);
    if (!d || d.id !== e.pointerId) return;
    if (!d.moved) {
      haptic(6);
      cue("tick", { gain: 0.3 });
      setKind(k);
      return;
    }
    const r = boxRef.current?.getBoundingClientRect();
    if (r && e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom) light(d.kind, e.clientX - r.left, e.clientY - r.top);
  };

  useNext(lit >= TO_UNLOCK ? "Open liffafa" : null, onNext, "letter");

  const sel = KINDS.find((k) => k.id === kind)!;
  const hint =
    lit === 0
      ? kind === "rocket"
        ? "Tap the sky to send a rocket up"
        : `Tap the ground to light the ${sel.label.toLowerCase()}`
      : lit < TO_UNLOCK
        ? `${TO_UNLOCK - lit} more to light up the sky…`
        : "Keep going, the tray never runs out 🎇";

  return (
    <>
      <style>{CSS}</style>
      <SceneTitle kicker="The crackers playground" title="Light them up!" sub="Pick a cracker, then tap the ground, or drag it out." />
      <div className="dw-fill">
        <div ref={boxRef} className="dw-cp" onPointerDown={onBoxDown} role="application" aria-label={`Crackers playground. ${sel.label} selected. Tap to light it.`} data-dw-lit={lit}>
          <div className="dw-cp-ground" aria-hidden />
          <canvas ref={canvasRef} aria-hidden />
          {calm.map((c) => (
            <span key={c.id} className="dw-calm" style={{ left: c.x, top: c.y }} aria-hidden />
          ))}
          <AnimatePresence>
            {finale && (
              <motion.span
                key={finale.id}
                className="dw-finale"
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.5 } }}
                transition={{ duration: 0.45, ease: [0.2, 0.9, 0.3, 1.2] }}
                aria-hidden
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={`${finale.src}?play=${round}-${finale.id.toFixed(0)}`} alt="" width={480} height={480} decoding="async" />
              </motion.span>
            )}
          </AnimatePresence>
          <p key={bump} className={`dw-cp-count${bump ? " bump" : ""}`} aria-live="polite">
            {lit === 0 ? (
              "0 crackers lit"
            ) : (
              <>
                <b>{lit}</b> {lit === 1 ? "cracker" : "crackers"} lit!
              </>
            )}
          </p>
          {lit === 0 && <p className="dw-cp-hint">{kind === "rocket" ? "☝ tap up in the sky" : "👇 tap down on the ground"}</p>}
        </div>
      </div>
      <div className="dw-tray" role="toolbar" aria-label="Crackers">
        {KINDS.map((k) => (
          <button
            key={k.id}
            type="button"
            className={`dw-ck${kind === k.id ? " is-on" : ""}`}
            aria-pressed={kind === k.id}
            aria-label={`${k.label}, ${k.hint}`}
            onPointerDown={(e) => onTrayDown(k.id, e)}
            onPointerMove={onTrayMove}
            onPointerUp={(e) => onTrayUp(k.id, e)}
            onPointerCancel={() => {
              drag.current = null;
              setGhost(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setKind(k.id);
                const el = boxRef.current;
                if (el) light(k.id, el.clientWidth * (0.25 + rand() * 0.5), el.clientHeight * (k.id === "rocket" ? 0.3 : 0.8));
              }
            }}
          >
            <CrackerIcon kind={k.id} />
            <span>{k.label}</span>
            <small>{k.hint}</small>
          </button>
        ))}
      </div>
      <div style={{ flex: "none", minHeight: 34, display: "grid", placeItems: "center" }}>
        <Hint>{hint}</Hint>
      </div>
      {ghost && (
        <span className="dw-ghost" style={{ left: ghost.x, top: ghost.y }} aria-hidden>
          <CrackerIcon kind={ghost.kind} />
        </span>
      )}
    </>
  );
}
