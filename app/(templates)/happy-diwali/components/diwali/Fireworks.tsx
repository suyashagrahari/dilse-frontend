"use client";

// Scene 6 — Fireworks, and the letter. The sky is hers: every tap sends a
// rocket up from the rooftops to exactly where she tapped and it bursts there
// (canvas sparks + one of the owner's sky-shot GIFs, restarted from frame one).
// After the third burst the sender's letter rises into the glow on warm paper,
// paged to fit the screen (never a scroll). She can keep launching around it.
//
// Media: the two small sky-shots (≈ 65 KB) were warmed on the lantern scene;
// the confetti fountain (386 KB) is fetched when this scene opens; the two
// heavy ones (751 KB, 1.4 MB) only once the letter is up, on idle, and join
// the rotation when they have arrived.

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type MouseEvent as RMouseEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import { FONTS } from "../../../_valentine/theme";
import { DW_GIF, preload, useDw, useNext } from "./stage";
import { DW, Hint, SceneTitle } from "./ui";

const LAUNCHES_FOR_LETTER = 3;
/** Outside the component: the React compiler treats these as impure inside it. */
const now = () => performance.now();
const rand = () => Math.random();
const COLORS = ["#FFD36E", "#FF5FA2", "#2EC4B6", "#FFB23F", "#B38CFF", "#FF7A1A", "#FFFFFF"];

const CSS = `
.dw-fw { position: relative; width: 100%; height: 100%; touch-action: manipulation; cursor: pointer; -webkit-tap-highlight-color: transparent; }
.dw-fw canvas { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
.dw-fw-gif { position: absolute; width: 220px; height: 220px; margin: -110px 0 0 -110px; pointer-events: none; }
.dw-fw-gif img { width: 100%; height: 100%; object-fit: contain; }
.dw-letter { position: absolute; left: 50%; top: 50%; width: min(100%, 440px); height: min(100%, 560px); transform: translate(-50%, -50%); box-sizing: border-box; display: flex; flex-direction: column;
  padding: clamp(14px, 2.6dvh, 22px) clamp(16px, 5cqw, 26px) 10px; border-radius: 18px; text-align: left; cursor: default;
  background: linear-gradient(180deg, #FFF9EC, #FFEFD2); color: ${DW.paperInk};
  box-shadow: 0 0 0 2px #E8B65A, 0 0 0 7px rgba(255,211,110,.22), 0 0 60px 8px rgba(255,170,60,.35), 0 30px 60px -20px rgba(0,0,0,.8); }
.dw-letter::before { content: ""; position: absolute; inset: 7px; border-radius: 12px; border: 1.5px dashed rgba(194,94,10,.35); pointer-events: none; }
.dw-letter-to { margin: 0 0 6px; font: 700 clamp(20px, 3.2dvh, 26px)/1.15 var(--font-vw-script, cursive); color: #A8430C; flex: none; }
.dw-letter-body { position: relative; flex: 1 1 0; min-height: 0; overflow: hidden; }
.dw-letter-text, .dw-letter-measure { margin: 0; font: 400 clamp(14.5px, 2.25dvh, 17px)/1.55 var(--font-vw-serif, Georgia, serif); white-space: pre-wrap; overflow-wrap: anywhere; }
.dw-letter-measure { position: absolute; left: 0; right: 0; top: 0; visibility: hidden; pointer-events: none; }
.dw-letter-sign { margin: 4px 0 0; text-align: right; font: 700 clamp(18px, 2.9dvh, 23px) var(--font-vw-script, cursive); color: #A8430C; }
.dw-letter-nav { flex: none; display: flex; align-items: center; justify-content: space-between; gap: 8px; padding-top: 6px; }
.dw-letter-nav button { min-width: 44px; min-height: 40px; border-radius: 12px; border: 1.5px solid rgba(168,67,12,.3); background: rgba(255,211,110,.25); color: #7A2A0C; font: 700 15px ${FONTS.ui}; cursor: pointer; padding: 0 12px; }
.dw-letter-nav button:disabled { opacity: .3; cursor: default; }
.dw-letter-dots { display: flex; gap: 5px; }
.dw-letter-dots i { width: 6px; height: 6px; border-radius: 50%; background: rgba(168,67,12,.25); }
.dw-letter-dots i.on { background: #C25E0A; }
`;

type P = { x: number; y: number; vx: number; vy: number; life: number; max: number; color: string; trail?: boolean };
type Rocket = { x: number; y: number; tx: number; ty: number; t: number; dur: number; color: string };
type GifBurst = { id: number; x: number; y: number; src: string; size: number };

/** Split the letter into pages that each fit `box` (measured with the real type). */
function paginate(text: string, measure: HTMLElement, avail: number): string[] {
  const tokens = text.split(/(\s+)/).filter((t) => t.length);
  const pages: string[] = [];
  let cur = "";
  for (const tok of tokens) {
    const test = cur + tok;
    measure.textContent = test;
    if (measure.scrollHeight > avail && cur.trim()) {
      pages.push(cur.trimEnd());
      cur = tok.trimStart();
    } else cur = test;
  }
  if (cur.trim()) pages.push(cur.trimEnd());
  return pages.length ? pages : [text];
}

export default function Fireworks({ letter, recipient, sender, onNext }: { letter: string; recipient: string; sender: string; onNext: () => void }) {
  const reduced = useReducedMotion();
  const { cue, round } = useDw();
  const boxRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const parts = useRef<P[]>([]);
  const rockets = useRef<Rocket[]>([]);
  const raf = useRef<number | null>(null);
  const size = useRef({ w: 300, h: 300, dpr: 1 });
  const [launches, setLaunches] = useState(0);
  const [gifs, setGifs] = useState<GifBurst[]>([]);
  const pool = useRef<string[]>([DW_GIF.skyDeepavali, DW_GIF.skyHanabi]);
  const showLetter = launches >= LAUNCHES_FOR_LETTER;

  useEffect(() => {
    preload(DW_GIF.skyDeepavali);
    preload(DW_GIF.skyHanabi);
    // the confetti fountain joins once it has arrived
    const img = new Image();
    img.onload = () => pool.current.push(DW_GIF.putukan);
    img.src = DW_GIF.putukan;
  }, []);

  // The heavy two: only once the letter is up, and only when the page is idle.
  useEffect(() => {
    if (!showLetter) return;
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
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(load, { timeout: 4000 });
      return () => w.cancelIdleCallback?.(id);
    }
    const t = window.setTimeout(load, 2500);
    return () => window.clearTimeout(t);
  }, [showLetter]);

  useEffect(() => {
    const el = boxRef.current;
    const cv = canvasRef.current;
    if (!el || !cv) return;
    const fit = () => {
      const r = el.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      size.current = { w: r.width, h: r.height, dpr };
      cv.width = Math.round(r.width * dpr);
      cv.height = Math.round(r.height * dpr);
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => {
      ro.disconnect();
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, []);

  const explode = useCallback((x: number, y: number, color: string) => {
    const n = 64;
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2 + rand() * 0.1;
      const v = 2.2 + rand() * 2.6;
      parts.current.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 0, max: 50 + rand() * 30, color: rand() < 0.2 ? "#FFF6E3" : color });
    }
  }, []);

  // rAF re-enters through a ref (a useCallback cannot name itself).
  const tickRef = useRef<() => void>(() => {});
  const loop = useCallback(() => tickRef.current(), []);
  const tick = useCallback(() => {
    const cv = canvasRef.current;
    const ctx = cv?.getContext("2d");
    if (!cv || !ctx) return;
    const { w, h, dpr } = size.current;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";
    for (let i = rockets.current.length - 1; i >= 0; i--) {
      const r = rockets.current[i];
      r.t += 1;
      const k = Math.min(1, r.t / r.dur);
      const e = 1 - Math.pow(1 - k, 2);
      const x = r.x + (r.tx - r.x) * e;
      const y = r.y + (r.ty - r.y) * e;
      parts.current.push({ x, y, vx: (rand() - 0.5) * 0.6, vy: 0.6 + rand() * 0.6, life: 0, max: 16, color: "#FFD36E", trail: true });
      ctx.fillStyle = "#FFF6E3";
      ctx.beginPath();
      ctx.arc(x, y, 2.4, 0, Math.PI * 2);
      ctx.fill();
      if (k >= 1) {
        rockets.current.splice(i, 1);
        explode(r.tx, r.ty, r.color);
      }
    }
    const list = parts.current;
    for (let i = list.length - 1; i >= 0; i--) {
      const p = list[i];
      p.life += 1;
      p.vy += p.trail ? 0.02 : 0.045;
      p.vx *= 0.985;
      p.vy *= 0.985;
      p.x += p.vx;
      p.y += p.vy;
      const t = 1 - p.life / p.max;
      if (t <= 0) {
        list.splice(i, 1);
        continue;
      }
      ctx.globalAlpha = Math.min(1, t * 1.4);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.trail ? 1.3 : 1.9, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    raf.current = list.length || rockets.current.length ? requestAnimationFrame(loop) : null;
    if (!raf.current) ctx.clearRect(0, 0, w, h);
  }, [explode, loop]);
  useLayoutEffect(() => {
    tickRef.current = tick;
  }, [tick]);

  const launch = (e: RMouseEvent<HTMLDivElement>) => {
    const r = boxRef.current!.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = Math.min(e.clientY - r.top, r.height * 0.8);
    const color = COLORS[(launches + Math.floor(rand() * 3)) % COLORS.length];
    haptic(10);
    cue("firework", { gain: 0.55, pan: (x / r.width) * 2 - 1, detune: (rand() - 0.5) * 300 });
    const delay = reduced ? 0 : 560;
    if (!reduced) {
      rockets.current.push({ x: x + (rand() - 0.5) * 60, y: r.height + 10, tx: x, ty: y, t: 0, dur: 34, color });
      if (!raf.current) raf.current = requestAnimationFrame(loop);
    }
    const src = pool.current[launches % pool.current.length];
    const id = now();
    const gsize = Math.round(Math.max(170, Math.min(300, r.width * 0.5)));
    window.setTimeout(() => {
      setGifs((g) => [...g.slice(-3), { id, x, y, src, size: gsize }]);
      window.setTimeout(() => setGifs((g) => g.filter((b) => b.id !== id)), 1900);
    }, delay);
    window.setTimeout(() => setLaunches((n) => n + 1), delay);
  };

  // ─── The letter, paged to fit ────────────────────────────────────────────
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const measureRef = useRef<HTMLParagraphElement | null>(null);
  const [pages, setPages] = useState<string[]>([letter]);
  const [page, setPage] = useState(0);
  const [seenLast, setSeenLast] = useState(false);
  useLayoutEffect(() => {
    if (!showLetter) return;
    const body = bodyRef.current;
    const m = measureRef.current;
    if (!body || !m) return;
    const run = () => {
      // leave room for the signature line on the last page
      const avail = body.clientHeight - 34;
      const ps = paginate(letter, m, Math.max(60, avail));
      setPages(ps);
      setPage((p) => Math.min(p, ps.length - 1));
    };
    run();
    const ro = new ResizeObserver(run);
    ro.observe(body);
    return () => ro.disconnect();
  }, [showLetter, letter]);
  const last = page >= pages.length - 1;
  useEffect(() => {
    if (showLetter && last) {
      const t = window.setTimeout(() => setSeenLast(true), 600);
      return () => window.clearTimeout(t);
    }
  }, [showLetter, last]);

  useNext(seenLast ? "Open the sweets" : null, onNext, "sweet");

  const left = Math.max(0, LAUNCHES_FOR_LETTER - launches);
  return (
    <>
      <style>{CSS}</style>
      <SceneTitle kicker="The sky is yours" title={showLetter ? "And in the glow…" : "Tap the sky"} sub={showLetter ? undefined : `Launch ${LAUNCHES_FOR_LETTER} fireworks, anywhere you like.`} />
      <div className="dw-fill">
        <div ref={boxRef} className="dw-fw" onClick={launch} role="button" tabIndex={-1} aria-label="Launch a firework">
          <canvas ref={canvasRef} aria-hidden />
          {gifs.map((g) => (
            <span key={g.id} className="dw-fw-gif" style={{ left: g.x, top: g.y, width: g.size, height: g.size, margin: `${-g.size / 2}px 0 0 ${-g.size / 2}px` }} aria-hidden>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`${g.src}?play=${round}-${g.id.toFixed(0)}`} alt="" width={g.size} height={g.size} decoding="async" />
            </span>
          ))}
          <AnimatePresence>
            {showLetter && (
              <motion.article
                className="dw-letter"
                initial={reduced ? false : { opacity: 0, y: "-40%", x: "-50%", scale: 0.9 }}
                animate={{ opacity: 1, y: "-50%", x: "-50%", scale: 1 }}
                transition={{ type: "spring", stiffness: 120, damping: 18 }}
                onClick={(e) => e.stopPropagation()}
                aria-label={`A letter from ${sender}`}
              >
                <p className="dw-letter-to">Dear {recipient},</p>
                <div ref={bodyRef} className="dw-letter-body">
                  <p ref={measureRef} className="dw-letter-measure" aria-hidden />
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div key={page} initial={reduced ? false : { opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} exit={reduced ? undefined : { opacity: 0, x: -14 }} transition={{ duration: 0.25 }}>
                      <p className="dw-letter-text">{pages[page]}</p>
                      {last && <p className="dw-letter-sign">— {sender}</p>}
                    </motion.div>
                  </AnimatePresence>
                </div>
                {pages.length > 1 && (
                  <nav className="dw-letter-nav" aria-label="Letter pages">
                    <button type="button" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} aria-label="Previous page">
                      ‹
                    </button>
                    <span className="dw-letter-dots" aria-label={`Page ${page + 1} of ${pages.length}`}>
                      {pages.map((_, k) => (
                        <i key={k} className={k === page ? "on" : undefined} />
                      ))}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        cue("page-turn", { gain: 0.4 });
                        setPage((p) => Math.min(pages.length - 1, p + 1));
                      }}
                      disabled={last}
                    >
                      Next page ›
                    </button>
                  </nav>
                )}
              </motion.article>
            )}
          </AnimatePresence>
        </div>
      </div>
      <div style={{ flex: "none", minHeight: 40, display: "grid", placeItems: "center" }}>
        <Hint>{showLetter ? "Keep tapping the sky, it's still yours 🎆" : left === LAUNCHES_FOR_LETTER ? "Tap anywhere in the sky 🎆" : `${left} more…`}</Hint>
      </div>
    </>
  );
}
