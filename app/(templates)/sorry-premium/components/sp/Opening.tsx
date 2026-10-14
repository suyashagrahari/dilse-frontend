"use client";

// Scenes 1–3: the knock at the door, the wilted flower, the cracked heart.
// Each is one screen; its Next pill appears only once her moment is done.

import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { burst, haptic, useReducedMotion } from "../../../_valentine/kit";
import { FONTS } from "../../../_valentine/theme";
import { CRACK_SPOTS, Flower, MendHeart, Plaster, PuddleBear, WateringCan } from "./art";
import { SP_DISPLAY, SP_HAND } from "./fonts";
import { useNext, useSp } from "./stage";
import { Head, SpScroll } from "./ui";

// ─── 1 · Knock knock ────────────────────────────────────────────────────────

export function Knock({
  recipient,
  sender,
  knock,
  punch,
  knockLine,
  sticker,
  onEnter,
}: {
  recipient: string;
  sender: string;
  knock: readonly [string, string];
  punch: string;
  knockLine: string;
  sticker: ReactNode;
  onEnter: () => void;
}) {
  const { cue } = useSp();
  const reduced = useReducedMotion();
  const [at, setAt] = useState(0);
  const open = at >= 2;
  const lines = ["Knock knock 🚪", knock[0], punch.replace("{name}", recipient)];
  const replies = ["Who's there?", knock[1]];

  const answer = () => {
    if (open) return;
    const n = at + 1;
    haptic(n >= 2 ? 22 : 10);
    cue("pop", { gain: 0.5, detune: n * 120 });
    if (n >= 2) {
      cue("creak", { gain: 0.55, at: 0.1 });
      cue("chime-cascade", { gain: 0.5, at: 0.7 });
      if (!reduced) window.setTimeout(() => burst({ kind: "hearts", origin: { x: 0.5, y: 0.5 }, count: 18, emojis: ["💗", "☔", "💧", "✨"] }), 650);
    } else {
      cue("knock", { gain: 0.7, count: 2, at: 0.25 });
    }
    setAt(n);
  };

  useEffect(() => {
    // The first knock, once she's tapped anything (sounds unlock on the first tap).
    cue("knock", { gain: 0.7, count: 3, at: 0.4 });
  }, [cue]);

  useNext(open ? "Let them in ☔" : null, onEnter, "umbrella");

  return (
    <>
      <Head kicker={`For ${recipient} 💌`} title={open ? <>It&apos;s {sender}, in the rain</> : "Someone's at your door…"} sub={open ? undefined : "and it's drizzling a little out there"} />
      <div className="sp-fill">
        <div className={`sp-door-wrap sp-zoom${open ? " is-open" : ""}`} data-sp-door={open ? "open" : "shut"}>
          <AnimatePresence mode="wait">
            <motion.div
              key={at}
              className="sp-say-bubble"
              initial={reduced ? false : { opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={reduced ? undefined : { opacity: 0, y: -6, transition: { duration: 0.12 } }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              aria-live="polite"
            >
              {lines[Math.min(at, 2)]}
            </motion.div>
          </AnimatePresence>
          <div className="sp-door-frame">
            <div className="sp-door-out">
              <span className="sp-door-rain" aria-hidden />
              <div className="sp-door-bear">
                <PuddleBear mood={open ? "hope" : "sad"} size="100%" />
              </div>
              {open && <div className="sp-door-gif">{sticker}</div>}
            </div>
            <div className="sp-door" aria-hidden>
              <span className="sp-door-win" />
              <span className="sp-door-knocker">♥</span>
              <span className="sp-door-knob" />
            </div>
            <span className="sp-door-mat" aria-hidden>
              welcome
            </span>
          </div>
        </div>
      </div>
      <div className="sp-say">
        {open ? (
          <motion.p className="sp-say-card" initial={reduced ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: reduced ? 0 : 0.7, type: "spring", stiffness: 240, damping: 22 }}>
            {knockLine}
          </motion.p>
        ) : (
          <button type="button" className="sp-reply" onClick={answer} data-sp-reply={at}>
            {replies[at]}
          </button>
        )}
      </div>
      <style>{KNOCK_CSS}</style>
    </>
  );
}

const KNOCK_CSS = `
.sp-door-wrap { position: relative; height: min(100cqh, 420px); aspect-ratio: .62; max-width: 92cqw; display: grid; grid-template-rows: auto 1fr; justify-items: center; gap: 10px; }
.sp-say-bubble { position: relative; z-index: 3; max-width: min(320px, 86cqw); padding: 10px 16px; border-radius: 20px; background: var(--vw-paper); color: var(--vw-ink);
  font: 600 clamp(16px, 2.4dvh, 19px)/1.3 ${SP_HAND}; box-shadow: 0 0 0 2px var(--vw-edge), 0 10px 22px -12px color-mix(in srgb, var(--sp-deep) 55%, transparent); overflow-wrap: anywhere; }
.sp-say-bubble::after { content: ""; position: absolute; left: 50%; bottom: -8px; width: 14px; height: 14px; margin-left: -7px; background: var(--vw-paper); transform: rotate(45deg); box-shadow: 2px 2px 0 0 var(--vw-edge); }
.sp-door-frame { position: relative; height: 100%; aspect-ratio: .66; max-width: 100%; min-height: 0; border-radius: 999px 999px 14px 14px; padding: 10px 10px 0;
  background: linear-gradient(180deg, color-mix(in srgb, var(--vw-gold) 60%, #FFFFFF), var(--vw-gold)); box-shadow: inset 0 0 0 3px #5A3B33, 0 24px 40px -22px color-mix(in srgb, var(--sp-deep) 70%, transparent); perspective: 900px; box-sizing: border-box; }
.sp-door-out, .sp-door { position: absolute; inset: 10px 10px 0; border-radius: 999px 999px 6px 6px; }
.sp-door-out { overflow: hidden; background: linear-gradient(180deg, var(--sp-rain-a), var(--sp-rain-b)); box-shadow: inset 0 0 0 3px #5A3B33; }
.sp-door-rain { position: absolute; inset: 0; background: repeating-linear-gradient(105deg, transparent 0 14px, rgba(255,255,255,.55) 14px 15.5px); background-size: 200% 200%; animation: sp-door-rain .7s linear infinite; opacity: .8; }
@keyframes sp-door-rain { from { background-position: 0 0 } to { background-position: -30px 60px } }
.sp-door-bear { position: absolute; left: 50%; bottom: 2%; width: 86%; transform: translateX(-50%); }
.sp-door-gif { position: absolute; right: -2%; top: 6%; transform: rotate(8deg); }
.sp-door-gif .sp-stk img { width: clamp(64px, 15cqh, 92px) !important; height: auto !important; }
.sp-door { z-index: 2; transform-origin: 0 50%; transform-style: preserve-3d; transition: transform 1.1s cubic-bezier(.3,.7,.2,1);
  background: repeating-linear-gradient(90deg, color-mix(in srgb, var(--vw-accent) 30%, #FFFFFF) 0 22%, color-mix(in srgb, var(--vw-accent) 40%, #FFFFFF) 22% 25%);
  box-shadow: inset 0 0 0 3px #5A3B33, inset 0 -18px 0 color-mix(in srgb, var(--sp-deep) 12%, transparent); animation: sp-knock 2.6s ease-in-out 1s infinite; }
@keyframes sp-knock { 0%, 70%, 100% { transform: rotate(0) } 74% { transform: translateX(2px) rotate(.6deg) } 78% { transform: translateX(-2px) } 82% { transform: translateX(2px) rotate(.6deg) } 86% { transform: none } }
.sp-door-wrap.is-open .sp-door { animation: none; transform: rotateY(-108deg); }
.sp-door-win { position: absolute; left: 50%; top: 14%; width: 38%; aspect-ratio: 1; transform: translateX(-50%); border-radius: 50%; background: radial-gradient(circle at 35% 30%, #FFFFFF, color-mix(in srgb, var(--sp-rain-a) 80%, #FFFFFF)); box-shadow: inset 0 0 0 3px #5A3B33; }
.sp-door-win::before, .sp-door-win::after { content: ""; position: absolute; background: #5A3B33; }
.sp-door-win::before { left: 50%; top: 0; bottom: 0; width: 3px; margin-left: -1.5px; } .sp-door-win::after { top: 50%; left: 0; right: 0; height: 3px; margin-top: -1.5px; }
.sp-door-knocker { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); font: 800 28px/1 ${SP_DISPLAY}; color: #FFD45E; -webkit-text-stroke: 1.5px #5A3B33; }
.sp-door-knob { position: absolute; right: 12%; top: 62%; width: 16px; height: 16px; border-radius: 50%; background: #FFD45E; box-shadow: inset 0 0 0 2.5px #5A3B33; }
.sp-door-mat { position: absolute; left: 50%; bottom: -14px; transform: translateX(-50%); padding: 3px 18px; border-radius: 8px; background: var(--vw-paper); box-shadow: 0 0 0 2px #5A3B33; font: 700 12px ${FONTS.ui}; letter-spacing: .14em; text-transform: uppercase; color: var(--vw-accent-deep); white-space: nowrap; z-index: 3; }
.sp-reply { min-height: 52px; max-width: 100%; padding: 10px 26px; border-radius: 999px; border: 0; cursor: pointer; touch-action: manipulation; font: 800 clamp(17px, 2.5dvh, 20px)/1.2 ${SP_DISPLAY}; color: var(--vw-accent-deep);
  background: var(--vw-paper); box-shadow: 0 0 0 2.5px var(--vw-accent), 0 5px 0 color-mix(in srgb, var(--vw-accent) 55%, var(--vw-paper)), 0 14px 24px -12px color-mix(in srgb, var(--sp-deep) 60%, transparent); animation: sp-reply 1.6s ease-in-out infinite; overflow-wrap: anywhere; }
.sp-reply:active { transform: translateY(3px); }
.sp-reply:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 4px; }
@keyframes sp-reply { 0%, 100% { transform: scale(1) } 50% { transform: scale(1.04) } }
@media (prefers-reduced-motion: reduce) { .sp-door, .sp-door-rain, .sp-reply { animation: none !important; } .sp-door { transition: none; } }
`;

// ─── 2 · Water the wilted flower ────────────────────────────────────────────

const POUR_MS = 2600;

export function Water({ confession, sender, sticker, onNext }: { confession: string; sender: string; sticker: ReactNode; onNext: () => void }) {
  const { cue } = useSp();
  const reduced = useReducedMotion();
  const arena = useRef<HTMLDivElement | null>(null);
  const canRef = useRef<HTMLDivElement | null>(null);
  const flowerRef = useRef<HTMLDivElement | null>(null);
  const [b, setB] = useState(0);
  const bRef = useRef(0);
  const [pouring, setPouring] = useState(false);
  const pourRef = useRef(false);
  const [spout, setSpout] = useState<{ x: number; y: number } | null>(null);
  const done = b >= 1;
  const lastTick = useRef(0);
  const dragged = useRef(0);

  // While the can is over the flower, a rAF loop waters it.
  useEffect(() => {
    if (!pouring || done) return;
    let raf = 0;
    let t0 = performance.now();
    const step = (t: number) => {
      const dt = t - t0;
      t0 = t;
      const nb = Math.min(1, bRef.current + dt / POUR_MS);
      bRef.current = nb;
      setB(nb);
      const tick = Math.floor(nb * 6);
      if (tick > lastTick.current) {
        lastTick.current = tick;
        cue("bubble", { gain: 0.35, detune: tick * 140 });
        haptic(6);
      }
      if (nb < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [pouring, done, cue]);

  useEffect(() => {
    if (!done) return;
    pourRef.current = false;
    haptic(24);
    cue("chime-cascade", { gain: 0.7 });
    cue("sparkle", { gain: 0.4, at: 0.2 });
    if (!reduced) burst({ kind: "hearts", origin: { x: 0.5, y: 0.45 }, count: 22, emojis: ["🌸", "💗", "✨", "🌷"] });
  }, [done, cue, reduced]);

  const measure = () => {
    const a = arena.current?.getBoundingClientRect();
    const c = canRef.current?.getBoundingClientRect();
    const f = flowerRef.current?.getBoundingClientRect();
    if (!a || !c || !f) return;
    // The rose of the can (its top-right), and the flower head's zone.
    const sx = c.left + c.width * 0.94;
    const sy = c.top + c.height * 0.3;
    const hx = f.left + f.width * 0.55;
    const over = sx > hx - f.width * 0.55 && sx < hx + f.width * 0.5 && sy < f.top + f.height * 0.55;
    if (over !== pourRef.current) {
      pourRef.current = over;
      setPouring(over && bRef.current < 1);
      if (over) cue("swoosh-soft", { gain: 0.25 });
    }
    setSpout(over ? { x: sx - a.left, y: sy - a.top } : null);
  };

  const onDrag = () => {
    if (!done) measure();
  };
  const onDragEnd = () => {
    dragged.current = performance.now();
    pourRef.current = false;
    setPouring(false);
    setSpout(null);
  };
  // Tap fallback (keyboard, or a tap without a drag): a little splash each time.
  const splash = () => {
    if (done) return;
    const nb = Math.min(1, bRef.current + 0.26);
    bRef.current = nb;
    setB(nb);
    haptic(8);
    cue("bubble", { gain: 0.45, detune: nb * 600 });
  };

  useNext(done ? "It bloomed" : null, onNext, "flower");

  return (
    <>
      <Head kicker="Let me own it" title={done ? "What I did 🌷" : "Water the little flower"} sub={done ? undefined : "Drag the watering can over it 💧"} />
      <div className="sp-fill" ref={arena}>
        <div className="sp-water" data-sp-bloom={Math.round(b * 100)}>
          <div className="sp-flower" ref={flowerRef} onClick={splash} role="button" tabIndex={done ? -1 : 0} aria-label="Water the flower" onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), splash())}>
            <Flower b={b} />
            <span className="sp-flower-meter" aria-hidden style={{ ["--b" as string]: String(b) }} />
          </div>
          {done && <motion.div className="sp-flower-gif" initial={reduced ? false : { opacity: 0, scale: 0.6, rotate: -20 }} animate={{ opacity: 1, scale: 1, rotate: -6 }} transition={{ type: "spring", stiffness: 220, damping: 14, delay: 0.3 }}>{sticker}</motion.div>}
        </div>
        {!done && (
          <motion.div
            ref={canRef}
            className={`sp-can${pouring ? " is-pouring" : ""}`}
            drag
            dragConstraints={arena}
            dragElastic={0.08}
            dragMomentum={false}
            onDrag={onDrag}
            onDragEnd={onDragEnd}
            onDragStart={() => (dragged.current = performance.now())}
            onTap={() => performance.now() - dragged.current > 400 && splash()}
            whileDrag={{ scale: 1.06 }}
            role="button"
            aria-label="The watering can: drag it over the flower, or tap the flower"
            data-sp-can
          >
            <WateringCan size="100%" />
          </motion.div>
        )}
        {spout && !done && (
          <span className="sp-stream" style={{ left: spout.x, top: spout.y }} aria-hidden>
            {[0, 1, 2, 3, 4, 5].map((k) => (
              <i key={k} style={{ left: `${(k % 3) * 7 - 4}px`, animationDelay: `${k * 90}ms` }} />
            ))}
          </span>
        )}
      </div>
      <div className="sp-say">
        {done ? (
          <motion.div className="sp-say-card sp-tag" initial={reduced ? false : { opacity: 0, y: 14, rotate: -2 }} animate={{ opacity: 1, y: 0, rotate: -1 }} transition={{ type: "spring", stiffness: 240, damping: 20 }}>
            “{confession}”<span className="sp-tag-by">— {sender}, owning it</span>
          </motion.div>
        ) : (
          <p className="sp-hint">{b > 0 ? `Blooming… ${Math.round(b * 100)}%` : "It's been raining on it all day 🥀"}</p>
        )}
      </div>
      <style>{WATER_CSS}</style>
    </>
  );
}

const WATER_CSS = `
.sp-water { position: relative; width: 100%; height: 100%; display: grid; place-items: end center; }
.sp-flower { position: relative; width: min(62cqh, 68cqw, 300px); aspect-ratio: 160 / 230; cursor: pointer; touch-action: manipulation; -webkit-tap-highlight-color: transparent; margin-bottom: 2px; }
.sp-flower:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 4px; border-radius: 18px; }
.sp-flower-meter { position: absolute; left: 50%; bottom: -10px; width: 70%; height: 6px; transform: translateX(-50%); border-radius: 99px; background: color-mix(in srgb, var(--vw-accent) 18%, var(--vw-paper));
  overflow: hidden; box-shadow: inset 0 0 0 1px var(--vw-edge); }
.sp-flower-meter::after { content: ""; position: absolute; inset: 0; transform-origin: 0 50%; transform: scaleX(var(--b)); background: linear-gradient(90deg, #8FD3A6, var(--vw-accent)); }
.sp-flower-gif { position: absolute; left: 2%; top: 4%; }
.sp-flower-gif .sp-stk img { width: clamp(70px, 22cqh, 110px) !important; height: auto !important; }
.sp-can { position: absolute; left: 4%; top: 6%; width: clamp(118px, 36cqw, 176px); aspect-ratio: 150 / 104; cursor: grab; touch-action: none; z-index: 3; filter: drop-shadow(0 12px 14px color-mix(in srgb, var(--sp-deep) 30%, transparent)); }
.sp-can > svg { transition: transform .35s cubic-bezier(.3,1.4,.5,1); transform-origin: 40% 60%; animation: sp-can-hint 2.4s ease-in-out infinite; }
.sp-can.is-pouring > svg { transform: rotate(32deg); animation: none; }
.sp-can:active { cursor: grabbing; }
@keyframes sp-can-hint { 0%, 100% { transform: rotate(0) } 50% { transform: rotate(10deg) } }
.sp-stream { position: absolute; z-index: 2; width: 0; height: 0; pointer-events: none; }
.sp-stream i { position: absolute; top: 0; width: 6px; height: 10px; border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%; background: #9CC8F2; box-shadow: inset 0 0 0 1.5px #6FA6DD; animation: sp-pour .6s linear infinite; }
@keyframes sp-pour { from { transform: translate(0, 0); opacity: 1 } to { transform: translate(10px, 90px); opacity: 0 } }
.sp-tag { text-align: left; position: relative; }
.sp-tag-by { display: block; margin-top: 6px; font: 600 13px ${FONTS.ui}; color: var(--vw-accent-deep); }
@media (prefers-reduced-motion: reduce) { .sp-can > svg, .sp-stream i { animation: none !important; } }
`;

// ─── 3 · Mend the cracked heart ─────────────────────────────────────────────

export function Mend({ feelings, sticker, onNext }: { feelings: readonly string[]; sticker: ReactNode; onNext: () => void }) {
  const { cue } = useSp();
  const reduced = useReducedMotion();
  const heart = useRef<HTMLDivElement | null>(null);
  const [mended, setMended] = useState<boolean[]>([false, false, false]);
  const [order, setOrder] = useState<number[]>([]);
  const all = mended.every(Boolean);
  // framer fires onTap after a short drag too: a drop already placed it.
  const dragged = useRef(0);

  const place = (k: number) => {
    setMended((m) => {
      if (m[k]) return m;
      const n = [...m];
      n[k] = true;
      return n;
    });
    setOrder((o) => (o.includes(k) ? o : [...o, k]));
    haptic(16);
    cue("ribbon", { gain: 0.45 });
    cue("glass-ping", { gain: 0.35, at: 0.12, detune: k * 200 });
  };

  useEffect(() => {
    if (!all) return;
    cue("chime-cascade", { gain: 0.6, at: 0.2 });
    cue("heartbeat", { gain: 0.5, at: 0.4, count: 2 });
    if (!reduced) burst({ kind: "sparkles", origin: { x: 0.5, y: 0.42 }, count: 24 });
  }, [all, cue, reduced]);

  /** Drop: the nearest open crack within reach, else back to the tray. */
  const drop = (point: { x: number; y: number }, fallback: boolean) => {
    const r = heart.current?.getBoundingClientRect();
    const open = mended.map((m, k) => (m ? -1 : k)).filter((k) => k >= 0);
    if (!r || !open.length) return;
    let best = -1;
    let bestD = Infinity;
    for (const k of open) {
      const [px, py] = CRACK_SPOTS[k];
      const d = Math.hypot(point.x - (r.left + (r.width * px) / 100), point.y - (r.top + (r.height * py) / 100));
      if (d < bestD) {
        bestD = d;
        best = k;
      }
    }
    if (best >= 0 && (fallback || bestD < r.width * 0.32)) place(best);
    else cue("plush-squeak", { gain: 0.3 });
  };

  const left = 3 - order.length;
  const last = order.length ? order[order.length - 1] : null;
  useNext(all ? "I understand now" : null, onNext, "heart");

  return (
    <>
      <Head kicker="I understand" title={all ? "How it must have felt" : "Mend my mess"} sub={all ? undefined : "Drag a plaster onto each crack 🩹"} />
      <div className="sp-fill">
        {all ? (
          <motion.div className="sp-feel" initial={reduced ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 220, damping: 22 }}>
            <div className="sp-feel-top">
              <div className="sp-feel-heart" aria-hidden>
                <MendHeart mended={mended} />
              </div>
              <div className="sp-feel-gif">{sticker}</div>
            </div>
            <SpScroll className="sp-feel-scroll" label="How it must have felt">
              <ul className="sp-feel-list">
                {order.map((k, i) => (
                  <li key={k} style={{ animationDelay: `${120 + i * 110}ms` }}>
                    <span aria-hidden>🩹</span>
                    <span>{feelings[k]}</span>
                  </li>
                ))}
              </ul>
            </SpScroll>
          </motion.div>
        ) : (
          <div className="sp-mend">
            <div className="sp-mend-heart" ref={heart} data-sp-heart>
              <MendHeart mended={mended} />
              {mended.map((m, k) =>
                m ? (
                  <motion.span
                    key={k}
                    className="sp-plaster-on"
                    style={{ left: `${CRACK_SPOTS[k][0]}%`, top: `${CRACK_SPOTS[k][1]}%`, rotate: CRACK_SPOTS[k][2] }}
                    initial={reduced ? false : { scale: 1.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 18 }}
                  >
                    <Plaster size="100%" />
                  </motion.span>
                ) : null,
              )}
            </div>
            <div className="sp-tray" aria-label="Plasters">
              {[0, 1, 2].map((t) =>
                t < left ? (
                  <motion.button
                    key={`${t}-${order.length}`}
                    type="button"
                    className="sp-plaster"
                    drag
                    dragSnapToOrigin
                    dragElastic={0.2}
                    dragMomentum={false}
                    whileDrag={{ scale: 1.15, rotate: -8, zIndex: 9 }}
                    onDragStart={() => (dragged.current = performance.now())}
                    onDragEnd={(_e, info) => {
                      dragged.current = performance.now();
                      drop({ x: info.point.x - window.scrollX, y: info.point.y - window.scrollY }, false);
                    }}
                    onTap={() => performance.now() - dragged.current > 400 && drop({ x: 0, y: 0 }, true)}
                    aria-label="A plaster: drag it onto a crack, or tap to stick it on"
                    data-sp-plaster={t}
                  >
                    <Plaster size="100%" />
                  </motion.button>
                ) : (
                  <span key={`e${t}`} className="sp-plaster-slot" aria-hidden />
                ),
              )}
            </div>
          </div>
        )}
      </div>
      <div className="sp-say" hidden={all}>
        {last === null ? (
          <p className="sp-hint">Three cracks. Three plasters. 🩹</p>
        ) : (
          <AnimatePresence mode="wait">
            <motion.p key={last} className="sp-say-card" initial={reduced ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 280, damping: 22 }} aria-live="polite">
              {feelings[last]}
            </motion.p>
          </AnimatePresence>
        )}
      </div>
      <style>{MEND_CSS}</style>
    </>
  );
}

const MEND_CSS = `
.sp-mend { width: 100%; height: 100%; display: grid; grid-template-rows: minmax(0, 1fr) auto; justify-items: center; align-items: center; gap: clamp(8px, 2cqh, 16px); }
.sp-mend-heart { position: relative; width: min(74cqw, 64cqh, 300px); aspect-ratio: 200 / 184; filter: drop-shadow(0 16px 22px color-mix(in srgb, var(--sp-deep) 28%, transparent)); animation: sp-sob 2.8s ease-in-out infinite; }
@keyframes sp-sob { 0%, 100% { transform: scale(1) } 50% { transform: scale(.975) translateY(2px) } }
.sp-plaster-on { position: absolute; width: 25%; translate: -50% -50%; pointer-events: none; }
.sp-tray { display: flex; gap: clamp(10px, 4cqw, 22px); padding: 10px 16px; border-radius: 22px; background: color-mix(in srgb, var(--vw-paper) 70%, transparent); box-shadow: 0 0 0 2px var(--vw-edge); }
.sp-plaster { width: clamp(70px, 21cqw, 92px); min-height: 44px; padding: 6px 0; border: 0; background: none; cursor: grab; touch-action: none; position: relative; z-index: 2; }
.sp-plaster:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 3px; border-radius: 12px; }
.sp-plaster-slot { width: clamp(70px, 21cqw, 92px); min-height: 44px; border-radius: 16px; border: 2px dashed var(--vw-edge); box-sizing: border-box; }
.sp-feel { width: min(100%, 420px); height: 100%; display: flex; flex-direction: column; gap: clamp(8px, 1.6dvh, 14px); min-height: 0; }
.sp-feel-top { flex: none; display: flex; align-items: center; justify-content: center; gap: 14px; }
.sp-feel-heart { width: clamp(84px, 16dvh, 130px); aspect-ratio: 200 / 184; }
.sp-feel-gif .sp-stk img { width: clamp(72px, 14dvh, 108px) !important; height: auto !important; }
.sp-feel-scroll { flex: 1 1 auto; }
.sp-feel-list { list-style: none; margin: 0; padding: 4px 2px 10px; display: grid; gap: 9px; }
.sp-feel-list li { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 10px; align-items: start; padding: 11px 14px; border-radius: 18px; text-align: left;
  background: var(--vw-paper); box-shadow: 0 0 0 2px var(--vw-edge), 0 8px 16px -12px color-mix(in srgb, var(--sp-deep) 55%, transparent); animation: sp-li .4s cubic-bezier(.3,1.4,.5,1) both;
  font: 400 clamp(16px, 2.4dvh, 19px)/1.35 ${SP_HAND}; color: var(--vw-ink); overflow-wrap: anywhere; }
@keyframes sp-li { from { opacity: 0; transform: translateY(10px) scale(.96) } to { opacity: 1; transform: none } }
@media (prefers-reduced-motion: reduce) { .sp-mend-heart { animation: none; } }
`;
