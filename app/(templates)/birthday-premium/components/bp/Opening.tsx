"use client";

// Scenes 1–3: the storybook cover (lift it — the pop-up rises with it), the
// dandelion wish (blow into the mic, or swipe the wind across it) and the
// hot-air balloon ride over our milestones (drag the sky).

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { AnimatePresence, animate, motion, useMotionValue, useMotionValueEvent, useTransform, type MotionValue } from "framer-motion";
import { burst, haptic, useReducedMotion } from "../../../_valentine/kit";
import type { BpMilestone } from "../../../_valentine/days/birthday-premium";
import { FONTS } from "../../../_valentine/theme";
import { HotAirBalloon, PaperCake } from "./art";
import { BP_DISPLAY, BP_HAND } from "./fonts";
import { useBp, useNext } from "./stage";
import { Head, nameFit } from "./ui";

// ─── 1 · The storybook ──────────────────────────────────────────────────────

export function Cover({
  recipient,
  sender,
  petName,
  coverLine,
  sticker,
  pops,
  confetti,
  onEnter,
}: {
  recipient: string;
  sender: string;
  petName: string;
  coverLine: string;
  sticker: ReactNode;
  pops: readonly string[];
  confetti: readonly string[];
  onEnter: () => void;
}) {
  const reduced = useReducedMotion();
  const { cue } = useBp();
  const lift = useMotionValue(0);
  const flap = useTransform(lift, (v) => `rotateX(${v * -168}deg)`);
  const shade = useTransform(lift, [0, 0.5, 1], [0, 0.35, 0]);
  // Once it is all the way up the cover folds away, so it never hides the heading.
  const coverOpacity = useTransform(lift, [0.72, 0.98], [1, 0]);
  const [held, setHeld] = useState(false);
  const [open, setOpen] = useState(false);
  const [moved, setMoved] = useState(false);
  const bookRef = useRef<HTMLDivElement | null>(null);
  const drag = useRef<{ y: number; h: number; id: number; t: number } | null>(null);

  const finish = useCallback(() => {
    if (open) return;
    setOpen(true);
    haptic(24);
    cue("page-turn", { gain: 0.7 });
    cue("chime-cascade", { gain: 0.6, at: 0.25 });
    if (reduced) lift.set(1);
    else animate(lift, 1, { type: "spring", stiffness: 120, damping: 17 });
    window.setTimeout(() => burst({ kind: "confetti", colors: confetti, origin: { x: 0.5, y: 0.45 }, count: 90 }), reduced ? 0 : 380);
  }, [open, cue, reduced, lift, confetti]);

  const down = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (open) return;
    const h = bookRef.current?.getBoundingClientRect().height ?? 400;
    drag.current = { y: e.clientY, h, id: e.pointerId, t: performance.now() };
    setHeld(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || open || e.pointerId !== d.id) return;
    const v = Math.max(0, Math.min(1, (d.y - e.clientY) / (d.h * 0.85)));
    if (v > 0.03 && !moved) {
      setMoved(true);
      cue("paper-rustle", { gain: 0.45 });
    }
    lift.set(v);
  };
  const up = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    drag.current = null;
    if (!d || open) return;
    const v = lift.get();
    const tap = v < 0.04 && performance.now() - d.t < 400 && Math.abs(d.y - e.clientY) < 8;
    if (tap || v > 0.38) finish();
    else animate(lift, 0, { type: "spring", stiffness: 260, damping: 20 });
  };

  useNext(open ? "Turn the page" : null, onEnter, "book");

  return (
    <>
      <style>{COVER_CSS}</style>
      <Head
        kicker={open ? "Chapter one" : "A storybook for you"}
        title={open ? <>Happy birthday, <span className="bp-em">{petName || recipient}</span>!</> : "Someone wrote you a book"}
        sub={open ? "Every page in here is about you 💗" : undefined}
      />
      <div className="bp-fill">
        <div ref={bookRef} className={`bp-book${open ? " is-open" : ""}${held ? " is-held" : ""}`} data-bp-book>
          {/* The inside page, with its pop-up layers (they rise as the cover lifts). */}
          <div className="bp-book-in" aria-hidden={!open}>
            <span className="bp-book-sky" />
            <PopLayer lift={lift} from={0.12} to={0.62} className="bp-pop-hills" />
            <PopLayer lift={lift} from={0.2} to={0.7} className="bp-pop-bunting">
              <svg viewBox="0 0 200 40" preserveAspectRatio="none" width="100%" height="100%">
                <path d="M0 4 Q100 26 200 4" stroke="currentColor" strokeWidth="1.2" fill="none" />
                {Array.from({ length: 9 }, (_, k) => {
                  const x = 10 + k * 22.5;
                  const y = 4 + 22 * (1 - Math.pow((x - 100) / 100, 2)) - 1;
                  return <path key={k} d={`M${x - 7} ${y} L${x + 7} ${y} L${x} ${y + 15} Z`} fill={pops[k % pops.length]} />;
                })}
              </svg>
            </PopLayer>
            <PopLayer lift={lift} from={0.26} to={0.8} className="bp-pop-balloons">
              <i style={{ background: pops[0] }} />
              <i style={{ background: pops[2] }} />
              <i style={{ background: pops[3] }} />
            </PopLayer>
            <PopLayer lift={lift} from={0.3} to={0.85} className="bp-pop-cake">
              <PaperCake />
            </PopLayer>
            <PopLayer lift={lift} from={0.42} to={0.95} className="bp-pop-banner">
              <span>Happy Birthday</span>
            </PopLayer>
            <PopLayer lift={lift} from={0.5} to={1} className="bp-pop-gif">
              {sticker}
            </PopLayer>
          </div>
          {/* The cover: drag it up (or tap) and it lifts like a flap. */}
          <motion.div
            className="bp-book-cover"
            style={{ transform: flap, opacity: coverOpacity }}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={up}
            role="button"
            tabIndex={open ? -1 : 0}
            aria-label={`Open the storybook for ${recipient}`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                finish();
              }
            }}
            data-bp-cover
          >
            <span className="bp-cover-face">
              <span className="bp-cover-tape" aria-hidden />
              <span className="bp-cover-frame">
                <span className="bp-cover-k">The birthday book of</span>
                <span className="bp-cover-name" style={nameFit(recipient)}>
                  {recipient}
                </span>
                {coverLine && <span className="bp-cover-line">{coverLine}</span>}
                <span className="bp-cover-by">written with love by {sender}</span>
              </span>
              <span className="bp-cover-star bp-cs1" aria-hidden>✦</span>
              <span className="bp-cover-star bp-cs2" aria-hidden>✿</span>
              <span className="bp-cover-star bp-cs3" aria-hidden>✦</span>
              <span className="bp-cover-lip" aria-hidden>
                <b>⇡</b>
              </span>
            </span>
            <span className="bp-cover-back" aria-hidden />
            <motion.span className="bp-cover-shade" style={{ opacity: shade }} aria-hidden />
          </motion.div>
          <span className="bp-book-ribbon" aria-hidden />
        </div>
      </div>
      <p className="bp-hint" aria-live="polite">
        {open ? (
          "✨ ta-da ✨"
        ) : (
          <>
            <span className="bp-hint-hand" aria-hidden style={{ transform: "rotate(-90deg)" }}>
              👆
            </span>
            Lift the cover up (or tap it)
          </>
        )}
      </p>
    </>
  );
}

function PopLayer({ lift, from, to, className, children }: { lift: MotionValue<number>; from: number; to: number; className: string; children?: ReactNode }) {
  const s = useTransform(lift, [from, to], [0, 1], { clamp: true });
  const o = useTransform(lift, [from, from + 0.08], [0, 1], { clamp: true });
  return (
    <motion.div className={`bp-pop ${className}`} style={{ scaleY: s, opacity: o }}>
      {children}
    </motion.div>
  );
}

const COVER_CSS = `
.bp-book { position: relative; width: min(76cqw, 62cqh, 330px); aspect-ratio: 3 / 4; perspective: 1300px; }
.bp-book-in, .bp-book-cover { position: absolute; inset: 0; border-radius: 10px 18px 18px 10px; }
.bp-book-in { overflow: hidden; background: var(--vw-paper);
  box-shadow: inset 10px 0 14px -10px color-mix(in srgb, var(--bp-deep) 40%, transparent), 0 0 0 2px var(--vw-edge), 0 6px 0 color-mix(in srgb, var(--vw-edge) 80%, #FFF), 0 9px 0 var(--vw-edge), 0 26px 40px -22px color-mix(in srgb, var(--bp-deep) 70%, transparent); }
.bp-book-sky { position: absolute; inset: 0; background: radial-gradient(circle, color-mix(in srgb, var(--vw-gold) 45%, transparent) 0 1.5px, transparent 2px) 0 0 / 18px 18px, linear-gradient(180deg, var(--bp-blush), var(--vw-paper) 70%); }
.bp-pop { position: absolute; transform-origin: 50% 100%; will-change: transform; }
.bp-pop-hills { left: -6%; right: -6%; bottom: 0; height: 30%;
  background: radial-gradient(60% 100% at 25% 100%, color-mix(in srgb, var(--bp-second) 70%, #FFF) 98%, transparent 100%), radial-gradient(55% 90% at 78% 100%, color-mix(in srgb, var(--vw-accent) 30%, #FFF) 98%, transparent 100%);
  filter: drop-shadow(0 -2px 0 color-mix(in srgb, var(--vw-ink) 10%, transparent)); }
.bp-pop-bunting { left: 4%; right: 4%; top: 6%; height: 16%; color: color-mix(in srgb, var(--vw-ink) 45%, transparent); transform-origin: 50% 0; }
.bp-pop-balloons { left: 6%; bottom: 30%; width: 34%; height: 40%; }
.bp-pop-balloons i { position: absolute; width: 38%; aspect-ratio: 1 / 1.2; border-radius: 50% 50% 48% 48% / 55% 55% 45% 45%; box-shadow: inset -5px -6px 0 rgba(0,0,0,.08), inset 5px 5px 0 rgba(255,255,255,.4); }
.bp-pop-balloons i::after { content: ""; position: absolute; left: 50%; top: 100%; width: 1.5px; height: 160%; background: color-mix(in srgb, var(--vw-ink) 35%, transparent); }
.bp-pop-balloons i:nth-child(1) { left: 0; top: 10%; } .bp-pop-balloons i:nth-child(2) { left: 30%; top: 0; } .bp-pop-balloons i:nth-child(3) { left: 58%; top: 18%; }
.bp-pop-cake { left: 50%; bottom: 9%; width: 60%; margin-left: -30%; filter: drop-shadow(0 8px 10px color-mix(in srgb, var(--bp-deep) 30%, transparent)); }
.bp-pop-banner { left: 7%; right: 7%; bottom: 4%; display: grid; place-items: center; }
.bp-pop-banner span { display: block; padding: 6px 18px 7px; font: 800 clamp(17px, 7.4cqw, 26px)/1 ${BP_DISPLAY}; color: #FFFFFF; background: var(--vw-accent);
  clip-path: polygon(0 0, 100% 0, 94% 50%, 100% 100%, 0 100%, 6% 50%); box-shadow: inset 0 -3px 0 var(--vw-accent-deep); letter-spacing: .02em; }
.bp-pop-gif { right: 5%; top: 22%; transform-origin: 50% 100%; }
.bp-pop-gif .bp-stk { transform: rotate(6deg); }
.bp-pop-gif .bp-stk img { width: clamp(64px, 26cqw, 104px) !important; height: auto !important; }

.bp-book-cover { transform-origin: 50% 0; transform-style: preserve-3d; cursor: grab; touch-action: none; -webkit-tap-highlight-color: transparent; z-index: 2; }
.bp-book-cover:active { cursor: grabbing; }
.bp-book.is-open .bp-book-cover { pointer-events: none; }
.bp-cover-face, .bp-cover-back { position: absolute; inset: 0; border-radius: inherit; backface-visibility: hidden; -webkit-backface-visibility: hidden; }
.bp-cover-face { display: grid; place-items: center; overflow: hidden;
  background: radial-gradient(circle, rgba(255,255,255,.35) 0 2px, transparent 2.6px) 0 0 / 22px 22px, linear-gradient(155deg, color-mix(in srgb, var(--vw-accent) 72%, #FFFFFF), var(--vw-accent) 60%, var(--vw-accent-deep));
  box-shadow: inset 14px 0 0 color-mix(in srgb, var(--bp-deep) 35%, transparent), inset 16px 0 0 rgba(255,255,255,.25), 0 0 0 2px color-mix(in srgb, var(--bp-deep) 40%, transparent), 0 26px 40px -22px color-mix(in srgb, var(--bp-deep) 70%, transparent); }
.bp-cover-back { transform: rotateX(180deg); background: radial-gradient(circle, color-mix(in srgb, var(--vw-accent) 30%, transparent) 0 2px, transparent 2.6px) 0 0 / 16px 16px, var(--bp-blush); box-shadow: inset 0 0 0 2px var(--vw-edge); }
.bp-cover-shade { position: absolute; inset: 0; border-radius: inherit; background: linear-gradient(180deg, transparent, rgba(0,0,0,.5)); pointer-events: none; }
.bp-cover-tape { position: absolute; right: -14px; top: 14px; width: 74px; height: 22px; transform: rotate(36deg); background: repeating-linear-gradient(90deg, color-mix(in srgb, var(--vw-gold) 80%, #FFF) 0 8px, rgba(255,255,255,.75) 8px 16px); opacity: .9; box-shadow: 0 2px 4px rgba(0,0,0,.08); }
.bp-cover-frame { position: relative; width: 78%; box-sizing: border-box; padding: 18px 12px 16px; margin-left: 6%; border-radius: 16px; background: var(--vw-paper); display: grid; gap: 4px; justify-items: center; text-align: center;
  box-shadow: 0 0 0 3px var(--vw-gold), 0 0 0 7px color-mix(in srgb, var(--vw-paper) 60%, transparent), 0 14px 24px -12px rgba(0,0,0,.35); }
.bp-cover-k { font: 700 10.5px ${FONTS.ui}; letter-spacing: .2em; text-transform: uppercase; color: var(--vw-accent-deep); }
.bp-cover-name { font: 800 min(clamp(26px, 11cqw, 40px), calc(min(76cqw, 62cqh, 330px) * 1.3 / var(--nw, 5)))/1.02 ${BP_DISPLAY}; color: var(--vw-ink); overflow-wrap: break-word; max-width: 100%; }
.bp-cover-line { font: 400 clamp(17px, 6cqw, 21px)/1.15 ${BP_HAND}; color: var(--vw-ink-soft); overflow-wrap: anywhere; }
.bp-cover-by { margin-top: 4px; font: 600 11.5px ${FONTS.ui}; color: var(--vw-ink-soft); overflow-wrap: anywhere; }
.bp-cover-star { position: absolute; color: #FFFFFF; opacity: .85; font-size: 22px; animation: bp-twinkle 1.8s ease-in-out infinite alternate; }
.bp-cs1 { left: 18%; top: 8%; } .bp-cs2 { right: 12%; bottom: 18%; animation-delay: -.6s; font-size: 18px; } .bp-cs3 { left: 22%; bottom: 10%; animation-delay: -1.2s; font-size: 14px; }
@keyframes bp-twinkle { from { transform: scale(.8) rotate(-10deg); opacity: .5 } to { transform: scale(1.15) rotate(10deg); opacity: 1 } }
.bp-cover-lip { position: absolute; left: 0; right: 0; bottom: 0; height: 30px; display: grid; place-items: center; background: linear-gradient(180deg, transparent, rgba(255,255,255,.28)); }
.bp-cover-lip b { color: #FFFFFF; font: 800 20px ${FONTS.ui}; animation: bp-lift 1.2s ease-in-out infinite; }
@keyframes bp-lift { 0%, 100% { transform: translateY(2px) } 50% { transform: translateY(-5px) } }
.bp-book-ribbon { position: absolute; left: 62%; bottom: -22px; width: 14px; height: 40px; background: var(--vw-gold); clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 78%, 0 100%); z-index: 1; }
.bp-book:not(.is-open):not(.is-held) .bp-book-cover { animation: bp-peek 3.2s ease-in-out 1.2s infinite; }
@keyframes bp-peek { 0%, 70%, 100% { transform: rotateX(0) } 80% { transform: rotateX(-14deg) } 88% { transform: rotateX(-4deg) } }
@media (prefers-reduced-motion: reduce) { .bp-cover-star, .bp-cover-lip b, .bp-book:not(.is-open):not(.is-held) .bp-book-cover { animation: none; } }
@media (min-width: 1100px) { .bp-book { width: min(72cqw, 66cqh, 380px); } }
`;

// ─── 2 · The dandelion wish ─────────────────────────────────────────────────

const SEEDS = 28;

/** Listens to the mic and reports a 0–1 level every frame while it is on. */
function useMicLevel(onLevel: (level: number, dt: number) => void) {
  const [state, setState] = useState<"off" | "asking" | "on" | "denied">("off");
  const stop = useRef<(() => void) | null>(null);
  const cb = useRef(onLevel);
  useEffect(() => {
    cb.current = onLevel;
  });
  const end = useCallback(() => {
    stop.current?.();
    stop.current = null;
  }, []);
  useEffect(() => end, [end]);
  const start = useCallback(async () => {
    if (stop.current) return;
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setState("denied");
      return;
    }
    setState("asking");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AC();
      const an = ctx.createAnalyser();
      an.fftSize = 1024;
      ctx.createMediaStreamSource(stream).connect(an);
      const buf = new Uint8Array(an.fftSize);
      let raf = 0;
      let alive = true;
      let last = performance.now();
      stop.current = () => {
        alive = false;
        cancelAnimationFrame(raf);
        stream.getTracks().forEach((t) => t.stop());
        void ctx.close().catch(() => undefined);
        setState("off");
      };
      setState("on");
      const tick = () => {
        if (!alive) return;
        an.getByteTimeDomainData(buf);
        let sum = 0;
        for (let k = 0; k < buf.length; k++) {
          const v = (buf[k] - 128) / 128;
          sum += v * v;
        }
        const now = performance.now();
        cb.current(Math.min(1, Math.sqrt(sum / buf.length) / 0.2), now - last);
        last = now;
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    } catch {
      setState("denied");
    }
  }, []);
  return { state, start, stop: end };
}

export function Dandelion({ wishes, recipient, onNext }: { wishes: readonly string[]; recipient: string; onNext: () => void }) {
  const reduced = useReducedMotion();
  const { cue } = useBp();
  // The seeds, round the head; every few is a wish seed. The release order is shuffled but fixed.
  const seeds = useMemo(() => {
    const out = Array.from({ length: SEEDS }, (_, k) => {
      const a = (k / SEEDS) * Math.PI * 2 + Math.sin(k * 7.3) * 0.08;
      const r = 50 + ((k * 13) % 9);
      return { k, a, r, x: Math.cos(a) * r, y: Math.sin(a) * r, dx: 140 + ((k * 37) % 120), dy: -60 - ((k * 53) % 160), spin: ((k * 61) % 120) - 60, wish: -1 };
    });
    const step = Math.floor(SEEDS / Math.max(1, wishes.length));
    wishes.forEach((_, w) => {
      out[(w * step + 3) % SEEDS].wish = w;
    });
    return out;
  }, [wishes]);
  const order = useMemo(() => [...seeds].sort((p, q) => ((p.k * 17) % SEEDS) - ((q.k * 17) % SEEDS)).map((s) => s.k), [seeds]);
  const [gone, setGone] = useState(0);
  const [gust, setGust] = useState(0);
  const power = useRef(0);
  const goneRef = useRef(0);
  const done = gone >= SEEDS;

  const release = useCallback(
    (n: number) => {
      if (goneRef.current >= SEEDS || n <= 0) return;
      const before = goneRef.current;
      goneRef.current = Math.min(SEEDS, before + n);
      const freed = order.slice(before, goneRef.current);
      setGone(goneRef.current);
      setGust((g) => g + 1);
      haptic(6);
      cue("swoosh-soft", { gain: 0.35 });
      if (freed.some((k) => seeds[k].wish >= 0)) cue("chime", { gain: 0.4, detune: before * 20 });
      if (goneRef.current >= SEEDS) {
        cue("sparkle", { gain: 0.6, at: 0.2 });
        haptic(24);
      }
    },
    [order, seeds, cue],
  );

  const mic = useMicLevel((level, dt) => {
    if (level > 0.35) power.current += level * dt;
    if (power.current > 140) {
      power.current = 0;
      release(level > 0.8 ? 3 : 2);
    }
  });
  useEffect(() => {
    if (done) mic.stop();
  }, [done, mic]);

  // Swipe: fast strokes across the head are the wind.
  const last = useRef<{ x: number; y: number; t: number } | null>(null);
  const run = useRef(0);
  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.buttons === 0) {
      last.current = null;
      return;
    }
    const now = performance.now();
    const p = last.current;
    last.current = { x: e.clientX, y: e.clientY, t: now };
    if (!p) return;
    const d = Math.hypot(e.clientX - p.x, e.clientY - p.y);
    const v = d / Math.max(1, now - p.t);
    if (v > 0.5) run.current += d;
    if (run.current > 70) {
      run.current = 0;
      release(2);
    }
  };

  const freed = new Set(order.slice(0, gone));
  const wishOut = seeds.filter((s) => s.wish >= 0 && freed.has(s.k)).map((s) => s.wish).sort((a, b) => a - b);

  useNext(done ? "Climb aboard" : null, onNext, "balloon");

  return (
    <>
      <style>{DANDY_CSS}</style>
      <Head
        kicker="Chapter two · a wish"
        title={done ? "Your wishes are on their way ✨" : "Close your eyes, make a wish…"}
        sub={done ? `Every one of them is for you, ${recipient}.` : "…then blow the dandelion 🌬️"}
      />
      <div className="bp-fill">
        <div className="bp-dandy" onPointerMove={onMove} onPointerDown={(e) => (last.current = { x: e.clientX, y: e.clientY, t: performance.now() })} onPointerLeave={() => (last.current = null)} data-bp-dandelion>
          <svg viewBox="-110 -110 220 300" className="bp-dandy-svg" aria-hidden>
            <path d="M0 4 C 4 70 -6 120 2 186" stroke="color-mix(in srgb, var(--bp-second) 60%, #6FAE7A)" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M2 150 C 22 130 40 136 52 120 C 34 120 18 126 2 140" fill="color-mix(in srgb, var(--bp-second) 50%, #8CCB8E)" />
            <path d="M1 166 C -18 148 -38 152 -50 138 C -30 136 -14 144 1 156" fill="color-mix(in srgb, var(--bp-second) 50%, #8CCB8E)" />
            <circle r="9" fill="color-mix(in srgb, var(--vw-gold) 70%, #C99E4A)" />
            {seeds.map((s) => {
              const out = freed.has(s.k);
              return (
                <g
                  key={s.k}
                  className={`bp-seed${out ? " is-gone" : ""}${s.wish >= 0 ? " is-wish" : ""}`}
                  style={{ ["--dx" as string]: `${s.dx}px`, ["--dy" as string]: `${s.dy}px`, ["--sp" as string]: `${s.spin}deg`, ["--dl" as string]: `${(s.k % 4) * 0.05}s` }}
                >
                  <line x1={s.x * 0.12} y1={s.y * 0.12} x2={s.x} y2={s.y} />
                  {[-50, -25, 0, 25, 50].map((o) => {
                    const a = s.a + (o * Math.PI) / 180;
                    return <line key={o} className="bp-tuft" x1={s.x} y1={s.y} x2={s.x + Math.cos(a) * 11} y2={s.y + Math.sin(a) * 11} />;
                  })}
                  <circle cx={s.x} cy={s.y} r={s.wish >= 0 ? 3.2 : 1.8} />
                </g>
              );
            })}
          </svg>
          {!reduced && gust > 0 && !done && (
            <span key={gust} className="bp-wind" aria-hidden>
              <i />
              <i />
              <i />
            </span>
          )}
        </div>
      </div>
      <ul className="bp-wishes" aria-live="polite">
        <AnimatePresence initial={false}>
          {wishOut.map((w) => (
            <motion.li key={w} initial={reduced ? false : { opacity: 0, y: -30, scale: 0.6, rotate: -8 }} animate={{ opacity: 1, y: 0, scale: 1, rotate: w % 2 ? 2 : -2 }} transition={{ type: "spring", stiffness: 200, damping: 14 }}>
              <span aria-hidden>✦</span> {wishes[w]}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
      {!done && (
        <div className="bp-dandy-ctl">
          {mic.state !== "on" && mic.state !== "denied" && (
            <button type="button" className="bp-btn" onClick={() => void mic.start()} disabled={mic.state === "asking"} data-bp-mic>
              🎤 Blow into the mic
            </button>
          )}
          {mic.state === "on" && <p className="bp-dandy-live">🎤 Listening… blow!</p>}
          <button type="button" className="bp-ghost" onClick={() => release(4)} data-bp-blow>
            🌬️ {mic.state === "denied" ? "No mic? Tap to blow" : "or swipe / tap to blow"}
          </button>
        </div>
      )}
    </>
  );
}

const DANDY_CSS = `
.bp-dandy { position: relative; width: min(84cqw, 78cqh, 340px); height: 100%; max-height: 100%; display: grid; place-items: center; touch-action: none; cursor: crosshair; }
.bp-dandy-svg { width: 100%; height: 100%; overflow: visible; }
.bp-seed { transform-box: view-box; stroke: color-mix(in srgb, var(--vw-ink) 34%, #FFFFFF); stroke-width: 1.1; fill: color-mix(in srgb, var(--vw-ink) 30%, #FFFFFF); }
.bp-seed .bp-tuft { stroke: #FFFFFF; stroke-width: 1.4; filter: drop-shadow(0 0 1px color-mix(in srgb, var(--vw-ink) 45%, transparent)); }
.bp-seed.is-wish { fill: var(--vw-accent); }
.bp-seed.is-wish .bp-tuft { stroke: color-mix(in srgb, var(--vw-gold) 60%, #FFFFFF); }
.bp-seed:not(.is-gone) { animation: bp-sway-seed 3s ease-in-out infinite alternate; }
@keyframes bp-sway-seed { from { transform: rotate(-1.5deg) } to { transform: rotate(1.5deg) } }
.bp-seed.is-gone { animation: bp-fly 2.4s cubic-bezier(.2,.6,.3,1) var(--dl) forwards; }
@keyframes bp-fly { 0% { transform: translate(0, 0) rotate(0); opacity: 1 } 60% { opacity: .9 } 100% { transform: translate(var(--dx), var(--dy)) rotate(var(--sp)); opacity: 0 } }
.bp-wind { position: absolute; inset: 20% 0 40%; pointer-events: none; }
.bp-wind i { position: absolute; left: -10%; height: 3px; width: 40%; border-radius: 9px; background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--vw-accent) 35%, #FFF), transparent); animation: bp-gust .8s ease-out forwards; }
.bp-wind i:nth-child(1) { top: 20%; } .bp-wind i:nth-child(2) { top: 50%; animation-delay: .08s; } .bp-wind i:nth-child(3) { top: 78%; animation-delay: .16s; }
@keyframes bp-gust { from { transform: translateX(0); opacity: 0 } 30% { opacity: 1 } to { transform: translateX(260%); opacity: 0 } }
.bp-wishes { flex: none; list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; justify-content: center; gap: 6px 8px; min-height: 34px; max-width: 460px; }
.bp-wishes li { padding: 5px 13px 6px; border-radius: 99px; background: var(--vw-paper); box-shadow: 0 0 0 2px var(--vw-edge), 0 8px 14px -10px color-mix(in srgb, var(--bp-deep) 60%, transparent); font: 400 clamp(17px, 2.5dvh, 20px)/1.15 ${BP_HAND}; color: var(--vw-ink); overflow-wrap: anywhere; }
.bp-wishes li span { color: var(--vw-accent); font-family: ${FONTS.ui}; font-size: 12px; }
.bp-dandy-ctl { flex: none; display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; align-items: center; }
.bp-dandy-live { margin: 0; min-height: 44px; display: grid; place-items: center; padding: 0 16px; border-radius: 99px; background: color-mix(in srgb, var(--vw-accent) 14%, var(--vw-paper)); font: 700 15px ${FONTS.ui}; color: var(--vw-accent-deep); animation: bp-pulse 1s ease-in-out infinite alternate; }
@keyframes bp-pulse { from { transform: scale(.97) } to { transform: scale(1.03) } }
@media (prefers-reduced-motion: reduce) { .bp-seed, .bp-seed.is-gone, .bp-dandy-live { animation: none !important; } .bp-seed.is-gone { opacity: 0; } }
`;

// ─── 3 · The balloon ride ───────────────────────────────────────────────────

function sinceParts(since: string): { days: number; label: string } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(since);
  if (!m) return null;
  const start = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const now = new Date();
  const days = Math.floor((now.getTime() - start.getTime()) / 86400000);
  if (!Number.isFinite(days) || days < 1) return null;
  let months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  if (now.getDate() < start.getDate()) months -= 1;
  const y = Math.floor(months / 12);
  const mo = months % 12;
  const label = [y ? `${y} year${y > 1 ? "s" : ""}` : "", mo ? `${mo} month${mo > 1 ? "s" : ""}` : ""].filter(Boolean).join(", ") || "a few sweet weeks";
  return { days, label };
}

function CountUp({ to }: { to: number }) {
  const reduced = useReducedMotion();
  const [v, setV] = useState(reduced ? to : 0);
  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = () => {
      const p = Math.min(1, (performance.now() - t0) / 1600);
      setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, reduced]);
  return <>{(reduced ? to : v).toLocaleString("en-IN")}</>;
}

export function BalloonRide({ milestones, since, onNext }: { milestones: readonly BpMilestone[]; since: string; onNext: () => void }) {
  const reduced = useReducedMotion();
  const { cue } = useBp();
  const n = milestones.length;
  const R = 1 + Math.max(1, n - 1) * 0.72;
  const stops = useMemo(() => milestones.map((_, k) => (n > 1 ? k / (n - 1) : 0)), [milestones, n]);
  const p = useMotionValue(0);
  const [here, setHere] = useState(0);
  const [seen, setSeen] = useState<number[]>([0]);
  const [tilt, setTilt] = useState(0);
  const skyRef = useRef<HTMLDivElement | null>(null);
  const drag = useRef<{ x: number; p: number; w: number; id: number } | null>(null);
  const together = useMemo(() => sinceParts(since), [since]);

  const near = useTransform(p, (v) => `translateX(${-v * (1 - 1 / R) * 100}%)`);
  const mid = useTransform(p, (v) => `translateX(${-v * (1 - 1 / R) * 55}%)`);
  const far = useTransform(p, (v) => `translateX(${-v * (1 - 1 / R) * 25}%)`);

  useMotionValueEvent(p, "change", (v) => {
    let best = 0;
    for (let k = 1; k < n; k++) if (Math.abs(stops[k] - v) < Math.abs(stops[best] - v)) best = k;
    const close = n <= 1 || Math.abs(stops[best] - v) < 0.42 / Math.max(1, n - 1);
    if (close && best !== here) {
      setHere(best);
      setSeen((s) => (s.includes(best) ? s : [...s, best]));
      cue("chime", { gain: 0.4, detune: best * 120 });
      haptic(10);
    }
  });

  const flyTo = (k: number) => {
    const t = stops[Math.max(0, Math.min(n - 1, k))];
    setTilt(t > p.get() ? 8 : -8);
    cue("whoosh", { gain: 0.3 });
    if (reduced) p.set(t);
    else animate(p, t, { type: "spring", stiffness: 60, damping: 16, onComplete: () => setTilt(0) });
    if (reduced) setTilt(0);
  };

  const down = (e: ReactPointerEvent<HTMLDivElement>) => {
    const w = skyRef.current?.getBoundingClientRect().width ?? 300;
    drag.current = { x: e.clientX, p: p.get(), w, id: e.pointerId };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x;
    const v = Math.max(0, Math.min(1, d.p - dx / (d.w * (R - 1) * 0.9)));
    setTilt(Math.max(-12, Math.min(12, (v - p.get()) * 900)));
    p.set(v);
  };
  const up = () => {
    if (!drag.current) return;
    drag.current = null;
    // Settle on the nearest stop so its memory is read in full.
    let best = 0;
    for (let k = 1; k < n; k++) if (Math.abs(stops[k] - p.get()) < Math.abs(stops[best] - p.get())) best = k;
    flyTo(best);
  };

  const all = seen.length >= n;
  useNext(all ? "Next chapter" : null, onNext, "claw");
  const m = milestones[here];
  const flagX = (k: number) => ((0.5 + stops[k] * (R - 1)) / R) * 100;

  return (
    <>
      <style>{RIDE_CSS}</style>
      <Head
        kicker="Chapter three · our story"
        title={together ? <><span className="bp-em"><CountUp to={together.days} /></span> days of us</> : "Our story, so far"}
        sub={together ? `${together.label} · drag the sky to fly 🎈` : "Drag the sky to fly over it 🎈"}
      />
      <div className="bp-fill">
        <div
          ref={skyRef}
          className="bp-sky"
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          role="group"
          aria-label="The balloon ride over our story"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "ArrowRight") flyTo(here + 1);
            if (e.key === "ArrowLeft") flyTo(here - 1);
          }}
          data-bp-sky
        >
          <motion.span className="bp-sky-far" style={{ transform: far, width: `${R * 100}%` }} aria-hidden />
          <motion.span className="bp-sky-mid" style={{ transform: mid, width: `${R * 100}%` }} aria-hidden />
          <motion.div className="bp-sky-near" style={{ transform: near, width: `${R * 100}%` }} aria-hidden>
            {milestones.map((ms, k) => (
              <span key={k} className={`bp-stop${seen.includes(k) ? " is-seen" : ""}${k === here ? " is-here" : ""}`} style={{ left: `${flagX(k)}%` }}>
                <i className="bp-stop-flag">{k + 1}</i>
                <i className="bp-stop-pole" />
                <i className="bp-stop-when">{ms.when}</i>
              </span>
            ))}
          </motion.div>
          <div className="bp-balloon" style={{ ["--tilt" as string]: `${tilt}deg` }} aria-hidden>
            <HotAirBalloon />
          </div>
        </div>
      </div>
      <div className="bp-ride-card" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          {m && (
            <motion.div key={here} className="bp-ride-in" initial={reduced ? false : { opacity: 0, y: 14, rotate: -1.5 }} animate={{ opacity: 1, y: 0, rotate: 0 }} exit={reduced ? undefined : { opacity: 0, y: -10 }} transition={{ duration: 0.28 }}>
              {m.when && <span className="bp-ride-when">{m.when}</span>}
              <b className="bp-ride-t">{m.title}</b>
              {m.line && <span className="bp-ride-l">{m.line}</span>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="bp-ride-ctl">
        <button type="button" className="bp-ghost bp-ride-arrow" onClick={() => flyTo(here - 1)} disabled={here === 0} aria-label="Fly back">
          ◀
        </button>
        <span className="bp-ride-dots" aria-hidden>
          {milestones.map((_, k) => (
            <i key={k} className={k === here ? "is-on" : seen.includes(k) ? "is-seen" : undefined} />
          ))}
        </span>
        <button type="button" className="bp-btn bp-ride-go" onClick={() => flyTo(here + 1)} disabled={here >= n - 1} data-bp-fly>
          Fly on ▶
        </button>
      </div>
    </>
  );
}

const RIDE_CSS = `
.bp-sky { position: relative; width: 100%; height: 100%; max-width: 560px; border-radius: 26px; overflow: hidden; touch-action: pan-y; cursor: grab; outline: none;
  background: linear-gradient(180deg, color-mix(in srgb, var(--bp-blush) 70%, #FFFFFF) 0%, var(--vw-paper) 55%, color-mix(in srgb, var(--vw-gold) 22%, #FFFFFF) 100%);
  box-shadow: 0 0 0 2px var(--vw-edge), 0 0 0 6px color-mix(in srgb, var(--vw-paper) 60%, transparent), 0 20px 36px -22px color-mix(in srgb, var(--bp-deep) 60%, transparent); }
.bp-sky:active { cursor: grabbing; }
.bp-sky:focus-visible { box-shadow: 0 0 0 3px var(--vw-ink); }
.bp-sky-far, .bp-sky-mid, .bp-sky-near { position: absolute; left: 0; top: 0; bottom: 0; will-change: transform; pointer-events: none; }
.bp-sky-far { background:
  radial-gradient(40px 14px at 20% 22%, #FFFFFF 98%, transparent), radial-gradient(28px 10px at 23% 19%, #FFFFFF 98%, transparent),
  radial-gradient(46px 15px at 55% 14%, #FFFFFF 98%, transparent), radial-gradient(30px 11px at 85% 28%, #FFFFFF 98%, transparent);
  background-size: 380px 100%; opacity: .95; }
.bp-sky-mid { top: auto; height: 46%; background: radial-gradient(55% 80% at 50% 100%, color-mix(in srgb, var(--bp-second) 45%, #FFFFFF) 98%, transparent 100%) 0 100% / 260px 100% repeat-x; opacity: .9; }
.bp-sky-near { top: auto; height: 30%; background: radial-gradient(60% 90% at 50% 100%, color-mix(in srgb, var(--vw-accent) 26%, #FFFFFF) 98%, transparent 100%) 0 100% / 200px 100% repeat-x,
  linear-gradient(0deg, color-mix(in srgb, var(--vw-accent) 26%, #FFFFFF) 0 34%, transparent 34%); }
.bp-stop { position: absolute; bottom: 30%; width: 0; height: 0; }
.bp-stop i { position: absolute; font-style: normal; }
.bp-stop-pole { left: -1px; bottom: -40px; width: 2px; height: 70px; background: color-mix(in srgb, var(--vw-ink) 45%, transparent); }
.bp-stop-flag { left: 1px; bottom: 6px; width: 30px; height: 22px; display: grid; place-items: center; font: 800 12px ${FONTS.ui}; color: var(--vw-ink-soft); background: var(--vw-paper); clip-path: polygon(0 0, 100% 50%, 0 100%); padding-right: 8px; box-sizing: border-box; box-shadow: inset 0 0 0 2px var(--vw-edge); transition: background .3s ease, color .3s ease; }
.bp-stop.is-seen .bp-stop-flag { background: var(--vw-accent); color: #FFFFFF; }
.bp-stop.is-here .bp-stop-flag { transform: scale(1.25); transform-origin: 0 50%; }
.bp-stop-when { left: -60px; width: 120px; bottom: -64px; text-align: center; font: 700 11px ${FONTS.ui}; color: var(--vw-ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.bp-balloon { position: absolute; left: 50%; top: 9%; width: min(34%, 44cqh, 150px); transform: translateX(-50%); animation: bp-float-b 3.4s ease-in-out infinite alternate; pointer-events: none; filter: drop-shadow(0 14px 16px color-mix(in srgb, var(--bp-deep) 30%, transparent)); }
.bp-balloon > svg { transform: rotate(var(--tilt)); transition: transform .5s cubic-bezier(.3,1.4,.5,1); transform-origin: 50% 20%; }
@keyframes bp-float-b { from { margin-top: -6px } to { margin-top: 8px } }
.bp-ride-card { flex: none; width: 100%; max-width: 460px; min-height: clamp(84px, 13dvh, 104px); display: grid; }
.bp-ride-in { display: grid; gap: 2px; justify-items: center; padding: 10px 16px 12px; border-radius: 18px; background: var(--vw-paper); box-shadow: 0 0 0 2px var(--vw-edge), 0 12px 20px -14px color-mix(in srgb, var(--bp-deep) 60%, transparent); }
.bp-ride-when { font: 700 11px ${FONTS.ui}; letter-spacing: .14em; text-transform: uppercase; color: var(--vw-accent-deep); overflow-wrap: anywhere; }
.bp-ride-t { font: 800 clamp(18px, 2.7dvh, 22px)/1.15 ${BP_DISPLAY}; color: var(--vw-ink); overflow-wrap: anywhere; }
.bp-ride-l { font: 400 clamp(17px, 2.5dvh, 20px)/1.2 ${BP_HAND}; color: var(--vw-ink-soft); overflow-wrap: anywhere; }
.bp-ride-ctl { flex: none; display: flex; align-items: center; gap: 12px; }
.bp-ride-arrow { width: 48px; padding: 0; }
.bp-ride-arrow:disabled { opacity: .4; }
.bp-ride-go { min-height: 46px; font-size: 16px; }
.bp-ride-dots { display: flex; gap: 6px; }
.bp-ride-dots i { width: 8px; height: 8px; border-radius: 50%; background: var(--vw-edge); transition: transform .2s ease, background .2s ease; }
.bp-ride-dots i.is-seen { background: color-mix(in srgb, var(--vw-accent) 50%, #FFFFFF); }
.bp-ride-dots i.is-on { background: var(--vw-accent); transform: scale(1.4); }
@media (prefers-reduced-motion: reduce) { .bp-balloon { animation: none; } .bp-balloon > svg { transition: none; } }
`;
