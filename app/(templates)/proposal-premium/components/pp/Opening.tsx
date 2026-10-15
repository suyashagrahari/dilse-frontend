"use client";

// Scenes 1–4: the wax-sealed invitation, the string lights, our story
// carousel and the love-lock bridge. Each one is a single screen; its Next
// pill appears only once her moment is done (the seal broken, every bulb lit,
// every horse visited, the lock locked).

import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";
import { animate, motion, useMotionValue, useMotionValueEvent, useTransform, type MotionValue } from "framer-motion";
import { burst, haptic, useHoldProgress, useReducedMotion } from "../../../_valentine/kit";
import type { ProposalChapter } from "../../../_valentine/days/proposal-premium";
import { FONTS } from "../../../_valentine/theme";
import { Bulb, HeartLock, Horse, LoveKey, Sparkle, WaxSeal } from "./art";
import { PP_HAND, PP_SCRIPT, PP_SERIF } from "./fonts";
import { useNext, usePp } from "./stage";
import { Head, initial, nameFit } from "./ui";

// ─── 1 · The wax-sealed invitation ──────────────────────────────────────────

export function Invite({ recipient, sender, openingLine, sticker, onEnter }: { recipient: string; sender: string; openingLine: string; sticker: ReactNode; onEnter: () => void }) {
  const { cue } = usePp();
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const step = useRef(0);
  const hold = useHoldProgress({
    duration: 1300,
    taps: 4,
    onComplete: () => {
      setOpen(true);
      cue("wax-crack", { gain: 0.95 });
      cue("chime-cascade", { gain: 0.55, at: 0.3 });
      if (!reduced) window.setTimeout(() => burst({ kind: "petals", origin: { x: 0.5, y: 0.5 }, count: 30, spread: 0.55 }), 380);
    },
  });
  const p = open ? 1 : hold.progress;
  // A small creak at each quarter, so the press feels like it's giving way.
  useEffect(() => {
    const q = Math.floor(hold.progress * 4);
    if (q > step.current && q < 4) cue("snap", { gain: 0.25 + q * 0.1, detune: q * 120 });
    step.current = q;
  }, [hold.progress, cue]);

  useNext(open ? "Step into the garden" : null, onEnter, "flower");
  const a = initial(sender);
  const b = initial(recipient);

  return (
    <>
      <Head kicker={`Psst, ${recipient}…`} title={<>You&apos;re <em>invited</em></>} sub={openingLine || "a garden I grew just for you 🌷"} />
      <div className="pp-fill">
        <div className={`pp-inv${open ? " is-open" : ""}`} data-pp-invite={open ? "open" : "sealed"}>
          <div className="pp-inv-peek">{sticker}</div>
          <div className="pp-inv-card">
            <svg className="pp-inv-wreath" viewBox="0 0 120 40" aria-hidden>
              <path d="M10 30 C30 8 50 6 60 18 C70 6 90 8 110 30" fill="none" stroke="var(--pp-leaf)" strokeWidth="2" />
              {[16, 28, 40, 80, 92, 104].map((x, k) => (
                <ellipse key={x} cx={x} cy={k < 3 ? 24 - k * 4 : 16 + (k - 3) * 4} rx="5" ry="2.4" fill="var(--pp-leaf)" transform={`rotate(${k < 3 ? -35 : 35} ${x} ${k < 3 ? 24 - k * 4 : 16 + (k - 3) * 4})`} />
              ))}
              <circle cx="60" cy="16" r="6" fill="var(--vw-accent)" />
              <circle cx="50" cy="14" r="4" fill="var(--pp-blush)" stroke="var(--vw-gold)" />
              <circle cx="70" cy="14" r="4" fill="var(--pp-blush)" stroke="var(--vw-gold)" />
            </svg>
            <p className="pp-inv-k">{sender} requests the pleasure of</p>
            <p className="pp-inv-n" style={nameFit(recipient)}>
              {recipient}
            </p>
            <p className="pp-inv-s">in a little garden, at golden hour,</p>
            <p className="pp-inv-t">for one very important question</p>
            <span className="pp-inv-orn" aria-hidden>
              ✦ ❦ ✦
            </span>
          </div>
          <div className="pp-inv-door pp-inv-door-l" aria-hidden>
            <span className="pp-inv-lace" />
          </div>
          <div className="pp-inv-door pp-inv-door-r" aria-hidden>
            <span className="pp-inv-lace" />
          </div>
          <span className="pp-inv-for" style={nameFit(recipient)} aria-hidden>
            For {recipient}
          </span>
          <button
            type="button"
            className={`pp-seal${hold.holding ? " is-holding" : ""}`}
            {...hold.bind}
            disabled={open}
            aria-label={open ? "The seal is broken" : "Press and hold the wax seal to break it"}
            style={{ ...hold.bind.style, ["--p" as string]: String(p) }}
            data-pp-seal
          >
            <span className="pp-seal-half pp-seal-l">
              <WaxSeal a={a} b={b} crack={p} />
            </span>
            <span className="pp-seal-half pp-seal-r">
              <WaxSeal a={a} b={b} crack={p} />
            </span>
            {!open && <span className="pp-seal-ring" style={{ ["--p" as string]: String(hold.progress) }} aria-hidden />}
          </button>
        </div>
      </div>
      <p className="pp-hint" aria-live="polite">
        {open ? "The seal is broken 💌" : hold.progress > 0.05 ? "Keep pressing… it's cracking ✨" : "Press and hold the wax seal"}
      </p>
      <style>{INVITE_CSS}</style>
    </>
  );
}

const INVITE_CSS = `
.pp-inv { position: relative; width: min(82cqw, 62cqh, calc(330px * var(--vw-s, 1))); aspect-ratio: .84; margin-top: min(10cqh, 40px); perspective: 1100px; }
@container (max-height: 440px) { .pp-inv { width: min(82cqw, 58cqh); margin-top: min(14cqh, 44px); } }
/* The peeking GIF scales with the room above the card, so on a short phone it never climbs over the subtitle. */
.pp-inv-peek .pp-stk > span, .pp-inv-peek .pp-stk img { width: clamp(52px, 20cqh, 92px) !important; height: clamp(52px, 20cqh, 92px) !important; }
.pp-inv-card { position: absolute; inset: 0; box-sizing: border-box; padding: 8% 9% 8%; border-radius: 18px; display: grid; align-content: center; justify-items: center; gap: 4px; text-align: center;
  background: radial-gradient(120% 80% at 50% 0%, #FFFFFF, var(--vw-paper) 60%, var(--pp-blush));
  box-shadow: inset 0 0 0 2px var(--vw-gold), inset 0 0 0 7px var(--vw-paper), inset 0 0 0 8px var(--vw-edge), 0 30px 50px -26px color-mix(in srgb, var(--pp-deep) 70%, transparent); }
.pp-inv:not(.is-open) .pp-inv-card > * { visibility: hidden; }
.pp-inv-k { margin: 0; font: 600 italic clamp(14px, 4.6cqw, 17px)/1.25 ${PP_SERIF}; color: var(--vw-ink-soft); }
.pp-inv-n { margin: 2px 0; font: 700 min(clamp(34px, 13cqw, 50px), calc(min(82cqw, 62cqh, 330px) * 1.45 / var(--nw, 5)))/1.05 ${PP_SCRIPT}; color: var(--vw-accent-deep); overflow-wrap: break-word; max-width: 100%; }
.pp-inv-s { margin: 0; font: 600 italic clamp(14px, 4.6cqw, 17px)/1.3 ${PP_SERIF}; color: var(--vw-ink-soft); }
.pp-inv-t { margin: 6px 0 0; font: 700 clamp(17px, 5.6cqw, 21px)/1.2 ${PP_SERIF}; color: var(--vw-ink); text-wrap: balance; }
.pp-inv-orn { margin-top: 8px; font-size: 14px; letter-spacing: .3em; color: var(--vw-gold); }
.pp-inv-door { position: absolute; top: 0; bottom: 0; width: 50%; box-sizing: border-box; z-index: 2; transform-style: preserve-3d; backface-visibility: hidden; -webkit-backface-visibility: hidden;
  background: linear-gradient(160deg, #FFFFFF, var(--vw-paper) 45%, var(--pp-blush)); transition: transform 1.15s cubic-bezier(.3,.7,.2,1) .35s, opacity .4s ease 1.2s; }
.pp-inv-door-l { left: 0; border-radius: 18px 4px 4px 18px; transform-origin: 0 50%; box-shadow: inset 0 0 0 2px var(--vw-gold), inset -6px 0 12px -8px color-mix(in srgb, var(--pp-deep) 40%, transparent); }
.pp-inv-door-r { right: 0; border-radius: 4px 18px 18px 4px; transform-origin: 100% 50%; box-shadow: inset 0 0 0 2px var(--vw-gold), inset 6px 0 12px -8px color-mix(in srgb, var(--pp-deep) 40%, transparent); }
.pp-inv-lace { position: absolute; inset: 10px; border-radius: 10px; border: 1.5px dashed color-mix(in srgb, var(--vw-gold) 80%, transparent);
  background: radial-gradient(circle, color-mix(in srgb, var(--vw-gold) 30%, transparent) 0 1.5px, transparent 2px) 0 0 / 14px 14px; opacity: .8; }
.pp-inv-wreath { width: 46%; height: auto; margin-bottom: 4px; }
.pp-inv-for { position: absolute; left: 0; right: 0; top: max(5%, calc(13% - (var(--nw, 5) - 5) * 1.6%)); z-index: 4; padding: 0 8%; text-align: center; pointer-events: none; overflow-wrap: break-word; font: 700 min(clamp(24px, 8.6cqw, 32px), calc(min(82cqw, 62cqh, 330px) * 1.1 / var(--nw, 5)))/1.1 ${PP_SCRIPT}; color: var(--vw-accent-deep);
  text-shadow: 0 2px 0 #FFFFFF, 0 0 12px #FFFFFF; transition: opacity .3s ease; }
.pp-inv.is-open .pp-inv-for { opacity: 0; }
.pp-inv.is-open .pp-inv-door-l { transform: rotateY(-112deg); opacity: 0; }
.pp-inv.is-open .pp-inv-door-r { transform: rotateY(112deg); opacity: 0; }
.pp-inv-peek { position: absolute; left: 50%; top: 0; z-index: 0; transform: translate(-50%, 10%) scale(.6); opacity: 0; transition: transform .9s cubic-bezier(.3,1.5,.5,1) 1.1s, opacity .3s ease 1.1s; }
.pp-inv.is-open .pp-inv-peek { transform: translate(-50%, -78%) rotate(-4deg); opacity: 1; }
.pp-seal { position: absolute; z-index: 5; left: 50%; top: 52%; width: clamp(82px, 30cqw, 112px); aspect-ratio: 1; transform: translate(-50%, -50%) scale(calc(1 - var(--p) * .08)); border: 0; padding: 0; background: none; cursor: pointer;
  -webkit-tap-highlight-color: transparent; filter: drop-shadow(0 8px 10px color-mix(in srgb, var(--pp-deep) 50%, transparent)); }
.pp-seal:not(:disabled):not(.is-holding) { animation: pp-seal-breathe 1.8s ease-in-out infinite alternate; }
@keyframes pp-seal-breathe { from { filter: drop-shadow(0 8px 10px color-mix(in srgb, var(--pp-deep) 50%, transparent)) brightness(1) } to { filter: drop-shadow(0 10px 16px color-mix(in srgb, var(--pp-deep) 55%, transparent)) brightness(1.08) } }
.pp-seal.is-holding { animation: pp-seal-shake .12s linear infinite; }
@keyframes pp-seal-shake { 0%, 100% { translate: 0 0 } 25% { translate: calc(var(--p) * 2px) 0 } 75% { translate: calc(var(--p) * -2px) 0 } }
.pp-seal-half { position: absolute; inset: 0; transition: transform .7s cubic-bezier(.3,.8,.3,1), opacity .5s ease .35s; }
.pp-seal-l { clip-path: polygon(0 0, 50% 0, 46% 20%, 54% 34%, 47% 50%, 55% 66%, 48% 82%, 51% 100%, 0 100%); }
.pp-seal-r { clip-path: polygon(50% 0, 100% 0, 100% 100%, 51% 100%, 48% 82%, 55% 66%, 47% 50%, 54% 34%, 46% 20%); }
.pp-seal-half svg { width: 100%; height: 100%; }
.pp-seal:disabled { cursor: default; }
.pp-seal:disabled .pp-seal-l { transform: translate(-60%, 40%) rotate(-50deg); opacity: 0; }
.pp-seal:disabled .pp-seal-r { transform: translate(60%, 50%) rotate(45deg); opacity: 0; }
.pp-seal-ring { position: absolute; inset: -9px; border-radius: 50%; pointer-events: none;
  background: conic-gradient(var(--vw-gold) calc(var(--p) * 360deg), transparent 0);
  -webkit-mask: radial-gradient(circle, transparent 0 calc(50% - 4px), #000 calc(50% - 3px)); mask: radial-gradient(circle, transparent 0 calc(50% - 4px), #000 calc(50% - 3px)); }
.pp-seal:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 6px; border-radius: 50%; }
@media (prefers-reduced-motion: reduce) { .pp-inv *, .pp-seal { transition: none !important; animation: none !important; } }
`;

// ─── 2 · The string lights ──────────────────────────────────────────────────

/** Where bulb k of n hangs on the garland, in % of the arena (a soft catenary). */
const bulbAt = (k: number, n: number): [number, number] => {
  const t = n === 1 ? 0.5 : k / (n - 1);
  const x = 8 + t * 84;
  const y = 24 + 4 * t * (1 - t) * 34;
  return [x, y];
};

export function Lights({ line, onGlow, onNext }: { line: string; onGlow: () => void; onNext: () => void }) {
  const { cue } = usePp();
  const reduced = useReducedMotion();
  const words = useMemo(() => line.split(/\s+/).filter(Boolean).slice(0, 7), [line]);
  const [lit, setLit] = useState<number[]>([]);
  const litRef = useRef<number[]>([]);
  const swiping = useRef(false);
  const all = lit.length >= words.length;

  const light = (k: number) => {
    if (litRef.current.includes(k)) return;
    const nextLit = [...litRef.current, k];
    litRef.current = nextLit;
    setLit(nextLit);
    haptic(10);
    cue("glass-ping", { gain: 0.5, detune: nextLit.length * 140 - 300 });
    if (nextLit.length >= words.length) {
      onGlow();
      cue("chime-cascade", { gain: 0.6, at: 0.2 });
      if (!reduced) window.setTimeout(() => burst({ kind: "sparkles", origin: { x: 0.5, y: 0.34 }, count: 30, spread: 0.6 }), 200);
    }
  };

  const hit = (x: number, y: number) => {
    const el = document.elementFromPoint(x, y)?.closest<HTMLElement>("[data-pp-bulb]");
    if (el) light(Number(el.dataset.ppBulb));
  };
  const down = (e: ReactPointerEvent<HTMLDivElement>) => {
    swiping.current = true;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    hit(e.clientX, e.clientY);
  };
  const move = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (swiping.current || e.pointerType === "mouse") {
      if (e.pointerType === "mouse" && e.buttons === 0) return;
      hit(e.clientX, e.clientY);
    }
  };
  const up = () => {
    swiping.current = false;
  };

  useNext(all ? "It's glowing" : null, onNext, "light");
  const pts = words.map((_, k) => bulbAt(k, words.length));
  const wire = `M0 ${pts[0]?.[1] ?? 24} ${pts.map(([x, y]) => `L${x} ${y - 1.5}`).join(" ")} L100 ${pts[pts.length - 1]?.[1] ?? 24}`;

  return (
    <>
      <span className="pp-dusk" style={{ opacity: 1 - lit.length / Math.max(1, words.length) }} aria-hidden />
      <Head kicker="It's a little dark here…" title={all ? <>There. <em>Golden.</em></> : "Light up the garden"} sub={all ? undefined : "Swipe along the string lights, or tap each bulb 💡"} />
      <div className="pp-fill">
        <div className={`pp-lights${all ? " is-all" : ""}`} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onPointerLeave={up}>
          <svg className="pp-lights-wire" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
            <path d={wire} fill="none" stroke="var(--pp-deep)" strokeOpacity=".55" strokeWidth=".7" vectorEffect="non-scaling-stroke" style={{ strokeWidth: 2 }} />
          </svg>
          {words.map((w, k) => {
            const on = lit.includes(k);
            const [x, y] = pts[k];
            return (
              <button
                key={k}
                type="button"
                className={`pp-bulb${on ? " is-on" : ""}`}
                style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${-k * 0.4}s` }}
                data-pp-bulb={k}
                onClick={() => light(k)}
                aria-label={on ? `Bulb ${k + 1}: ${w}` : `Light bulb ${k + 1}`}
              >
                <Bulb lit={on} size="100%" />
              </button>
            );
          })}
          <div className="pp-lights-sign" aria-live="polite">
            {words.map((w, k) => (
              <span key={k} className={lit.includes(k) ? "is-on" : undefined}>
                {lit.includes(k) ? w : "• • •"}
              </span>
            ))}
          </div>
        </div>
      </div>
      <p className="pp-hint">{all ? "Every light is for you ✨" : `${lit.length} of ${words.length} lit`}</p>
      <style>{LIGHTS_CSS}</style>
    </>
  );
}

const LIGHTS_CSS = `
/* A soft pastel dusk over the garden that lifts as the bulbs light (still light: lavender haze, never night). */
.pp-dusk { position: fixed; inset: 0; z-index: -1; pointer-events: none; transition: opacity .8s ease;
  background: linear-gradient(180deg, color-mix(in srgb, #B9A8E0 46%, transparent) 0%, color-mix(in srgb, #D9C8F0 34%, transparent) 55%, color-mix(in srgb, #F3C9D6 22%, transparent) 100%); }
.pp-lights { position: relative; width: min(100cqw, 560px); height: min(100cqh, 420px); touch-action: none; user-select: none; -webkit-user-select: none; }
.pp-lights-wire { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.pp-bulb { position: absolute; width: clamp(40px, 11cqw, 50px); height: clamp(52px, 14cqw, 66px); margin: 0; padding: 0; border: 0; background: none; cursor: pointer; transform: translate(-50%, -6%); transform-origin: 50% 0;
  animation: pp-sway 3.2s ease-in-out infinite alternate; -webkit-tap-highlight-color: transparent; touch-action: none; }
.pp-bulb svg { width: 100%; height: 100%; pointer-events: none; }
.pp-bulb.is-on svg { filter: drop-shadow(0 0 10px var(--pp-sun)) drop-shadow(0 0 22px color-mix(in srgb, var(--pp-sun) 80%, transparent)); animation: pp-pop .45s cubic-bezier(.3,1.8,.5,1); }
@keyframes pp-sway { from { rotate: -5deg } to { rotate: 5deg } }
@keyframes pp-pop { 0% { transform: scale(.7) } 100% { transform: scale(1) } }
.pp-bulb:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 2px; border-radius: 12px; }
.pp-lights-sign { position: absolute; left: 50%; bottom: 2%; transform: translateX(-50%); width: min(94%, 440px); box-sizing: border-box; padding: 14px 16px; border-radius: 20px; display: flex; flex-wrap: wrap; justify-content: center; gap: 4px 9px;
  background: color-mix(in srgb, var(--vw-paper) 88%, transparent); box-shadow: 0 0 0 2px var(--vw-edge), 0 16px 30px -18px color-mix(in srgb, var(--pp-deep) 60%, transparent); }
.pp-lights-sign span { font: 700 clamp(22px, 7cqw, 30px)/1.15 ${PP_SCRIPT}; color: color-mix(in srgb, var(--vw-ink-soft) 45%, transparent); transition: color .3s ease; }
.pp-lights-sign span:not(.is-on) { font: 700 14px/2.1 ${FONTS.ui}; letter-spacing: .1em; }
.pp-lights-sign span.is-on { color: var(--vw-accent-deep); animation: pp-word-in .5s cubic-bezier(.3,1.6,.5,1); }
@keyframes pp-word-in { from { opacity: 0; transform: translateY(8px) scale(.8) } to { opacity: 1; transform: none } }
.pp-lights.is-all .pp-lights-sign { box-shadow: 0 0 0 2px var(--vw-gold), 0 0 34px -4px color-mix(in srgb, var(--pp-sun) 90%, transparent); }
@media (prefers-reduced-motion: reduce) { .pp-bulb, .pp-bulb.is-on svg, .pp-lights-sign span.is-on { animation: none; } }
`;

// ─── 3 · Our story carousel ─────────────────────────────────────────────────

const HORSE_COLORS = ["#FFFFFF", "var(--pp-blush)", "#FFF6E0", "color-mix(in srgb, var(--vw-gold) 45%, #FFFFFF)", "color-mix(in srgb, var(--pp-leaf) 45%, #FFFFFF)"];

function CarouselHorse({ angle, k, n, onPick }: { angle: MotionValue<number>; k: number; n: number; onPick: (k: number) => void }) {
  const step = 360 / n;
  const th = (a: number) => ((k * step + a) * Math.PI) / 180;
  const x = useTransform(angle, (a) => `${Math.sin(th(a)) * 38}cqw`);
  const s = useTransform(angle, (a) => 0.62 + ((Math.cos(th(a)) + 1) / 2) * 0.42);
  const z = useTransform(angle, (a) => Math.round((Math.cos(th(a)) + 1) * 50));
  const o = useTransform(angle, (a) => 0.55 + ((Math.cos(th(a)) + 1) / 2) * 0.45);
  const y = useTransform(angle, (a) => `${(1 - Math.cos(th(a))) * -4}cqh`);
  return (
    <motion.button type="button" className="pp-horse" style={{ x, y, scale: s, zIndex: z, opacity: o }} onClick={() => onPick(k)} aria-label={`Chapter ${k + 1}`} data-pp-horse={k}>
      <span className="pp-horse-bob" style={{ animationDelay: `${-k * 0.55}s` }}>
        <Horse color={HORSE_COLORS[k % HORSE_COLORS.length]} mane={k % 2 ? "var(--vw-accent)" : "var(--vw-gold)"} />
      </span>
    </motion.button>
  );
}

export function Carousel({ chapters, sticker, onNext }: { chapters: readonly ProposalChapter[]; sticker: ReactNode; onNext: () => void }) {
  const { cue } = usePp();
  const reduced = useReducedMotion();
  const n = chapters.length;
  const step = 360 / n;
  const angle = useMotionValue(0);
  const [front, setFront] = useState(0);
  const [seen, setSeen] = useState<number[]>([0]);
  const drag = useRef<{ x: number; a: number; t: number; v: number; moved: boolean } | null>(null);
  const all = seen.length >= n;

  const frontOf = (a: number) => (((Math.round(-a / step) % n) + n) % n);
  useMotionValueEvent(angle, "change", (a) => {
    const f = frontOf(a);
    if (f !== front) {
      setFront(f);
      cue("tick", { gain: 0.25, detune: f * 80 });
    }
  });

  const settle = (target: number) => {
    const f = frontOf(target);
    animate(angle, target, reduced ? { duration: 0 } : { type: "spring", stiffness: 70, damping: 16, velocity: drag.current?.v ?? 0 });
    setSeen((s) => (s.includes(f) ? s : [...s, f]));
    haptic(10);
    cue("chime", { gain: 0.4, detune: f * 120 });
  };
  const snapNear = (a: number) => settle(Math.round(a / step) * step);
  const pick = (k: number) => {
    if (drag.current?.moved) return;
    // Spin the short way round to bring horse k to the front.
    const cur = angle.get();
    const want = -k * step;
    const diff = ((((want - cur) % 360) + 540) % 360) - 180;
    settle(cur + diff);
  };
  const spin = (dir: 1 | -1) => settle(Math.round(angle.get() / step) * step - dir * step);

  const onDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    drag.current = { x: e.clientX, a: angle.get(), t: performance.now(), v: 0, moved: false };
    angle.stop();
  };
  const onMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 6) d.moved = true;
    const now = performance.now();
    const na = d.a + dx * 0.45;
    d.v = ((na - angle.get()) / Math.max(1, now - d.t)) * 1000;
    d.t = now;
    angle.set(na);
  };
  const onUp = () => {
    const d = drag.current;
    if (!d) return;
    if (d.moved) {
      const fling = angle.get() + Math.max(-240, Math.min(240, d.v * 0.25));
      snapNear(fling);
    }
    window.setTimeout(() => {
      drag.current = null;
    }, 0);
  };

  useEffect(() => {
    if (all && !reduced) burst({ kind: "hearts", origin: { x: 0.5, y: 0.4 }, count: 18 });
  }, [all, reduced]);

  useNext(all ? "Our story so far" : null, onNext, "carousel");
  const c = chapters[front];

  return (
    <>
      <Head kicker="Our story" title="Spin the carousel" sub={all ? "Every chapter, read 🎠" : `Drag it round, or tap a horse · ${seen.length} of ${n}`} />
      <div className="pp-fill">
        <div className="pp-carou-wrap">
          <div className="pp-carou" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp} onPointerLeave={onUp}>
            <svg className="pp-carou-top" viewBox="0 0 200 70" aria-hidden>
              <path d="M100 2 L104 12 L96 12 Z" fill="var(--vw-gold)" />
              <path d="M10 46 C40 10 160 10 190 46 Z" fill="var(--vw-paper)" stroke="var(--pp-deep)" strokeWidth="2" />
              {[0, 1, 2, 3, 4, 5, 6, 7].map((k) => (
                <path key={k} d={`M${100} 14 L${10 + k * 22.5} 46 L${10 + (k + 1) * 22.5} 46 Z`} fill={k % 2 ? "var(--vw-accent)" : "var(--vw-paper)"} opacity={k % 2 ? 0.85 : 1} />
              ))}
              <path d="M10 46 C40 10 160 10 190 46" fill="none" stroke="var(--pp-deep)" strokeWidth="2" />
              {Array.from({ length: 9 }, (_, k) => (
                <path key={k} d={`M${10 + k * 20} 46 q10 14 20 0`} fill={k % 2 ? "var(--vw-gold)" : "var(--vw-accent)"} stroke="var(--pp-deep)" strokeWidth="1.5" />
              ))}
              {Array.from({ length: 10 }, (_, k) => (
                <circle key={k} cx={10 + k * 20} cy="46" r="2.6" fill="#FFF6D8" stroke="var(--vw-gold)" />
              ))}
            </svg>
            <span className="pp-carou-pole" aria-hidden />
            <div className="pp-carou-ring">
              {chapters.map((_, k) => (
                <CarouselHorse key={k} angle={angle} k={k} n={n} onPick={pick} />
              ))}
            </div>
            <span className="pp-carou-base" aria-hidden />
          </div>
          <div className="pp-carou-ctl">
            <button type="button" className="pp-arrow" onClick={() => spin(-1)} aria-label="Previous chapter">
              ‹
            </button>
            <motion.div key={front} className="pp-chap" initial={reduced ? false : { opacity: 0, y: 10, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 22 }} aria-live="polite">
              <p className="pp-chap-w">{c.when || `Chapter ${front + 1}`}</p>
              <p className="pp-chap-t">{c.title}</p>
              {c.line && <p className="pp-chap-l">{c.line}</p>}
              <span className="pp-chap-gif" aria-hidden>
                {sticker}
              </span>
            </motion.div>
            <button type="button" className="pp-arrow" onClick={() => spin(1)} aria-label="Next chapter">
              ›
            </button>
          </div>
        </div>
      </div>
      <style>{CAROU_CSS}</style>
    </>
  );
}

const CAROU_CSS = `
.pp-carou-wrap { width: min(100%, 470px); height: 100%; display: flex; flex-direction: column; align-items: stretch; gap: clamp(8px, 1.6dvh, 14px); min-height: 0; }
.pp-carou { position: relative; flex: 1 1 0; min-height: 150px; container-type: size; touch-action: pan-y; user-select: none; -webkit-user-select: none; cursor: grab; }
.pp-carou:active { cursor: grabbing; }
.pp-carou-top { position: absolute; left: 4%; right: 4%; top: 0; width: 92%; height: auto; max-height: 30cqh; z-index: 120; filter: drop-shadow(0 8px 10px color-mix(in srgb, var(--pp-deep) 25%, transparent)); }
.pp-carou-pole { position: absolute; left: 50%; top: 16cqh; bottom: 16cqh; width: 10px; margin-left: -5px; border-radius: 5px; z-index: 50;
  background: repeating-linear-gradient(160deg, var(--vw-gold) 0 8px, #FFFFFF 8px 14px); box-shadow: 0 0 0 1.5px var(--pp-deep); }
.pp-carou-base { position: absolute; left: 6%; right: 6%; bottom: 8cqh; height: 13cqh; border-radius: 50%; z-index: 0;
  background: radial-gradient(ellipse at 50% 35%, var(--vw-paper), var(--pp-blush) 70%); box-shadow: 0 0 0 2px var(--pp-deep), 0 8px 0 var(--vw-accent), 0 8px 0 2px var(--pp-deep); }
.pp-carou-ring { position: absolute; left: 50%; top: 38cqh; width: 0; height: 0; }
.pp-horse { position: absolute; left: calc(min(34cqh, 32cqw) / -2); top: 0; width: min(34cqh, 32cqw); margin: 0; padding: 0; border: 0; background: none; cursor: pointer; transform-origin: 50% 30%; -webkit-tap-highlight-color: transparent; }
.pp-horse-bob { display: block; animation: pp-horse-bob 2.4s ease-in-out infinite alternate; }
.pp-horse-bob svg { width: 100%; height: auto; display: block; filter: drop-shadow(0 6px 6px color-mix(in srgb, var(--pp-deep) 25%, transparent)); }
@keyframes pp-horse-bob { from { transform: translateY(-5%) } to { transform: translateY(6%) } }
.pp-horse:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 2px; border-radius: 12px; }
.pp-carou-ctl { flex: none; display: grid; grid-template-columns: 44px minmax(0, 1fr) 44px; align-items: center; gap: 6px; }
.pp-arrow { width: 44px; height: 44px; border-radius: 50%; border: 2px solid var(--vw-edge); background: var(--vw-paper); color: var(--vw-accent-deep); font: 700 26px/1 ${FONTS.ui}; cursor: pointer; padding: 0 0 3px; box-shadow: 0 6px 12px -8px color-mix(in srgb, var(--pp-deep) 60%, transparent); }
.pp-arrow:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 2px; }
.pp-chap { position: relative; box-sizing: border-box; min-height: clamp(104px, 16dvh, 130px); padding: 12px 16px 12px; border-radius: 20px; display: grid; align-content: center; gap: 2px;
  background: var(--vw-paper); box-shadow: 0 0 0 2px var(--vw-edge), 0 14px 26px -16px color-mix(in srgb, var(--pp-deep) 60%, transparent); }
.pp-chap-w { margin: 0; font: 700 11px ${FONTS.ui}; letter-spacing: .16em; text-transform: uppercase; color: var(--vw-accent-deep); }
.pp-chap-t { margin: 0; font: 700 clamp(19px, 2.8dvh, 23px)/1.15 ${PP_SERIF}; color: var(--vw-ink); overflow-wrap: anywhere; }
.pp-chap-l { margin: 0; font: 400 clamp(15px, 2.2dvh, 17px)/1.35 ${PP_HAND}; color: var(--vw-ink-soft); overflow-wrap: anywhere; }
.pp-chap-gif { position: absolute; right: -14px; top: -58px; transform: rotate(8deg); pointer-events: none; }
.pp-chap-gif .pp-stk img { width: 64px !important; height: 64px !important; }
@media (max-height: 700px) { .pp-chap-gif { display: none; } }
@media (prefers-reduced-motion: reduce) { .pp-horse-bob { animation: none; } }
`;

// ─── 4 · The love-lock bridge ───────────────────────────────────────────────

const RAIL_LOCKS = ["var(--vw-gold)", "var(--pp-blush)", "var(--pp-leaf)", "var(--vw-accent)", "#FFFFFF", "var(--vw-gold)"];

export function LoveLock({ recipient, sender, sinceText, days, onNext }: { recipient: string; sender: string; sinceText: string; days: number | null; onNext: () => void }) {
  const { cue } = usePp();
  const reduced = useReducedMotion();
  const [locked, setLocked] = useState(false);
  const [turning, setTurning] = useState(false);
  const [count, setCount] = useState(0);
  const keyRef = useRef<HTMLButtonElement | null>(null);
  const holeRef = useRef<HTMLSpanElement | null>(null);
  const kx = useMotionValue(0);
  const ky = useMotionValue(0);
  const kr = useMotionValue(0);

  const insert = () => {
    if (turning || locked) return;
    const k = keyRef.current?.getBoundingClientRect();
    const h = holeRef.current?.getBoundingClientRect();
    if (!k || !h) return;
    setTurning(true);
    haptic(14);
    cue("key", { gain: 0.8 });
    // The key's tip is its right end, middle height.
    const dx = h.left + h.width / 2 - (k.right - k.width * 0.04);
    const dy = h.top + h.height / 2 - (k.top + k.height / 2);
    const fast = reduced ? { duration: 0 } : { type: "spring" as const, stiffness: 220, damping: 24 };
    animate(kx, kx.get() + dx, fast);
    animate(ky, ky.get() + dy, fast).then(() => {
      animate(kr, 90, reduced ? { duration: 0 } : { duration: 0.35, ease: "easeInOut" }).then(() => {
        cue("snap", { gain: 0.7 });
        cue("chime-cascade", { gain: 0.6, at: 0.15 });
        haptic([20, 30, 20]);
        setLocked(true);
        if (!reduced) burst({ kind: "hearts", origin: { x: 0.5, y: 0.45 }, count: 26 });
      });
    });
  };

  const tryLock = () => {
    const k = keyRef.current?.getBoundingClientRect();
    const h = holeRef.current?.getBoundingClientRect();
    if (!k || !h) return;
    const tipX = k.right - k.width * 0.04;
    const tipY = k.top + k.height / 2;
    const d = Math.hypot(tipX - (h.left + h.width / 2), tipY - (h.top + h.height / 2));
    if (d < Math.max(70, h.width * 2.4)) insert();
    else {
      haptic(6);
      animate(kx, 0, { type: "spring", stiffness: 300, damping: 22 });
      animate(ky, 0, { type: "spring", stiffness: 300, damping: 22 });
    }
  };

  // Count the days up once it's locked.
  useEffect(() => {
    if (!locked || days == null) return;
    if (reduced || days < 2) {
      const t = window.setTimeout(() => setCount(days), 0);
      return () => window.clearTimeout(t);
    }
    const ctl = animate(0, days, { duration: Math.min(2.2, 0.8 + days / 600), ease: [0.2, 0.8, 0.2, 1], onUpdate: (v) => setCount(Math.round(v)) });
    return () => ctl.stop();
  }, [locked, days, reduced]);

  useNext(locked ? "Locked forever" : null, onNext, "key");

  return (
    <>
      <Head kicker="The love-lock bridge" title={locked ? <>Locked. <em>Forever.</em></> : "Lock it with me?"} sub={locked ? "The key goes in the river 🗝️" : "Drag the key into the heart lock"} />
      <div className="pp-fill">
        <div className="pp-lock-col">
        <div className={`pp-bridge${locked ? " is-locked" : ""}`}>
          <svg className="pp-rail" viewBox="0 0 400 120" preserveAspectRatio="none" aria-hidden>
            <rect x="0" y="16" width="400" height="9" rx="4.5" fill="var(--vw-paper)" stroke="var(--pp-deep)" strokeWidth="2" />
            <rect x="0" y="100" width="400" height="9" rx="4.5" fill="var(--vw-paper)" stroke="var(--pp-deep)" strokeWidth="2" />
            {Array.from({ length: 11 }, (_, k) => (
              <path key={k} d={`M${18 + k * 36} 25 L${18 + k * 36} 100`} stroke="var(--pp-deep)" strokeOpacity=".5" strokeWidth="2" />
            ))}
            {Array.from({ length: 20 }, (_, k) => (
              <path key={`d${k}`} d={`M${k * 20} 25 L${k * 20 + 20} 100 M${k * 20 + 20} 25 L${k * 20} 100`} stroke="var(--vw-edge)" strokeWidth="1.2" />
            ))}
          </svg>
          {RAIL_LOCKS.map((c, k) => (
            <span key={k} className="pp-mini-lock" style={{ left: `${[8, 18, 30, 70, 82, 92][k]}%`, top: `${[34, 50, 38, 44, 32, 52][k]}%`, background: c, rotate: `${k % 2 ? 8 : -6}deg` }} aria-hidden />
          ))}
          <div className="pp-lock">
            <HeartLock open={!locked} />
            <span ref={holeRef} className="pp-lock-hole" aria-hidden />
            {locked && (
              <motion.div className="pp-engrave" initial={reduced ? false : { opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15, type: "spring", stiffness: 200, damping: 18 }}>
                <span className="pp-engrave-n">
                  {initial(sender)} &amp; {initial(recipient)}
                </span>
              </motion.div>
            )}
          </div>
          {!locked && (
            <motion.button
              ref={keyRef}
              type="button"
              className="pp-key"
              drag={!turning}
              dragMomentum={false}
              style={{ x: kx, y: ky, rotate: kr }}
              onDragEnd={tryLock}
              onTap={() => {
                if (!turning) insert();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  insert();
                }
              }}
              aria-label="The key — drag it into the heart lock (or press to use it)"
              data-pp-key
            >
              <LoveKey />
              {!turning && (
                <span className="pp-key-spark" aria-hidden>
                  <Sparkle size={18} />
                </span>
              )}
            </motion.button>
          )}
        </div>
      <div className="pp-since" aria-live="polite">
        {locked ? (
          days != null ? (
            <motion.p initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <span className="pp-since-n">{count.toLocaleString("en-IN")}</span> days of us
              <span className="pp-since-d">since {sinceText}, and counting</span>
            </motion.p>
          ) : (
            <motion.p initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <span className="pp-since-n">∞</span> days of us
              <span className="pp-since-d">starting today, and never stopping</span>
            </motion.p>
          )
        ) : (
          <p className="pp-since-empty">Drag the key ↗</p>
        )}
      </div>
        </div>
      </div>
      <style>{LOCK_CSS}</style>
    </>
  );
}

const LOCK_CSS = `
.pp-lock-col { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; }
.pp-bridge { position: relative; flex: none; width: min(100cqw, 460px); height: min(70cqh, 320px); }
.pp-rail { position: absolute; left: 0; right: 0; top: 18%; width: 100%; height: 46%; }
.pp-bridge.is-locked { height: min(56cqh, 260px); }
.pp-bridge.is-locked .pp-rail { top: 22%; height: 60%; }
.pp-bridge.is-locked .pp-lock { top: 8%; }
.pp-mini-lock { position: absolute; width: 18px; height: 16px; border-radius: 4px 4px 9px 9px; box-shadow: 0 0 0 1.5px var(--pp-deep); }
.pp-mini-lock::before { content: ""; position: absolute; left: 3px; top: -9px; width: 8px; height: 9px; border: 2px solid #B9B2C4; border-bottom: 0; border-radius: 6px 6px 0 0; }
.pp-lock { position: absolute; left: 50%; top: 10%; width: min(38cqw, 160px, 40cqh); transform: translateX(-50%); z-index: 2; filter: drop-shadow(0 14px 14px color-mix(in srgb, var(--pp-deep) 35%, transparent)); }
.pp-lock svg { width: 100%; height: auto; display: block; }
.pp-lock-hole { position: absolute; left: 50%; top: 64.5%; width: 14%; aspect-ratio: 1; transform: translate(-50%, -50%); border-radius: 50%; }
.pp-bridge:not(.is-locked) .pp-lock-hole { box-shadow: 0 0 0 4px color-mix(in srgb, #FFFFFF 70%, transparent); animation: pp-hole 1.4s ease-in-out infinite; }
@keyframes pp-hole { 0%, 100% { box-shadow: 0 0 0 3px color-mix(in srgb, #FFFFFF 70%, transparent) } 50% { box-shadow: 0 0 0 9px color-mix(in srgb, #FFFFFF 0%, transparent) } }
.pp-engrave { position: absolute; left: 0; right: 0; top: 44%; display: grid; justify-items: center; pointer-events: none; }
.pp-engrave-n { font: 700 clamp(18px, 6cqw, 24px) ${PP_SCRIPT}; color: color-mix(in srgb, var(--pp-deep) 85%, transparent); text-shadow: 0 1px 0 rgba(255,255,255,.6); }
.pp-key { position: absolute; left: 4%; bottom: 6%; width: min(44cqw, 190px); margin: 0; padding: 8px 4px; border: 0; background: none; cursor: grab; z-index: 3; touch-action: none; transform-origin: 96% 50%;
  filter: drop-shadow(0 10px 10px color-mix(in srgb, var(--pp-deep) 35%, transparent)); -webkit-tap-highlight-color: transparent; }
.pp-key:active { cursor: grabbing; }
.pp-key svg { width: 100%; height: auto; display: block; pointer-events: none; }
.pp-key-spark { position: absolute; left: 14%; top: -4px; animation: pp-twinkle 1.4s ease-in-out infinite alternate; }
@keyframes pp-twinkle { from { transform: scale(.6) rotate(0); opacity: .6 } to { transform: scale(1.15) rotate(45deg); opacity: 1 } }
.pp-key:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 2px; border-radius: 12px; }
.pp-since { flex: none; min-height: clamp(64px, 10dvh, 84px); display: grid; place-items: center; }
.pp-since p { margin: 0; display: grid; justify-items: center; gap: 4px; font: 700 clamp(16px, 2.4dvh, 19px) ${FONTS.ui}; color: var(--vw-ink); }
.pp-since-n { font: 700 clamp(40px, 6.4dvh, 56px)/1 ${PP_SERIF}; color: var(--vw-accent-deep); font-variant-numeric: tabular-nums; }
.pp-since-d { font: 400 clamp(15px, 2.2dvh, 17px) ${PP_HAND}; color: var(--vw-ink-soft); }
.pp-since-empty { color: var(--vw-ink-soft) !important; }
@media (prefers-reduced-motion: reduce) { .pp-key-spark, .pp-lock-hole { animation: none !important; } }
`;
