"use client";

// Rooms 6–9: the gift shop (she shakes a snow globe; each time the snow
// settles, one reason is left behind), the guestbook (the letter writes itself
// in once she dips the pen), the next exhibition (another year of us? — both
// buttons say yes) and the award room (she pulls the velvet cloth off her
// Masterpiece of the Year plaque; the keepsake).

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion, useMotionValue, animate } from "framer-motion";
import { EndingActions, haptic, useReducedMotion, type KeepsakeItem, type KeepsakeLayout } from "../../../_valentine/kit";
import type { HaPaletteDef } from "../../../_valentine/days/happy-anniversary";
import type { DayConfig, ValentineDayData } from "../../../_valentine/types";
import { FONTS } from "../../../_valentine/theme";
import { HA_CAPS, HA_DISPLAY, HA_HAND } from "./fonts";
import { useHa, useNext } from "./stage";
import { HaScroll, Head, type Together } from "./ui";

// ─── 6 · The gift shop: the snow globe ──────────────────────────────────────

interface Flake {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  c: string;
}

const FLAKES = 130;

function GlobeScene() {
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%" aria-hidden>
      <defs>
        <radialGradient id="haGlass" cx="40%" cy="30%" r="75%">
          <stop offset="0" stopColor="color-mix(in srgb, var(--vw-accent) 18%, #EEF4FF)" />
          <stop offset=".6" stopColor="color-mix(in srgb, var(--vw-accent) 34%, #DCE6F8)" />
          <stop offset="1" stopColor="color-mix(in srgb, var(--ha-deep) 40%, #C9D6EE)" />
        </radialGradient>
      </defs>
      <circle cx="100" cy="100" r="98" fill="url(#haGlass)" />
      <path d="M2 128 Q50 112 100 120 T198 126 V200 H2 Z" fill="#FFFFFF" />
      <g transform="translate(100 112) scale(1.3) translate(-100 -112)">
      <rect x="132" y="70" width="4" height="56" rx="2" fill="var(--ha-gilt-b)" />
      <circle cx="134" cy="66" r="8" fill="#FFF3C4" stroke="var(--ha-gilt-b)" strokeWidth="2" />
      <path d="M58 116 h64 M62 116 v12 M118 116 v12 M58 104 h64" stroke="var(--ha-deep)" strokeWidth="4" strokeLinecap="round" />
      <g>
        <circle cx="80" cy="94" r="12" fill="#C58E62" />
        <circle cx="71" cy="84" r="4.5" fill="#C58E62" />
        <circle cx="89" cy="84" r="4.5" fill="#C58E62" />
        <ellipse cx="80" cy="110" rx="11" ry="9" fill="#C58E62" />
        <circle cx="76" cy="93" r="1.6" fill="#3B2A1E" />
        <circle cx="84" cy="93" r="1.6" fill="#3B2A1E" />
        <circle cx="74" cy="98" r="2.4" fill="#FFB3C1" />
      </g>
      <g>
        <circle cx="102" cy="94" r="12" fill="#FFFFFF" stroke="#EADFD3" strokeWidth="1.2" />
        <circle cx="93" cy="84" r="4.5" fill="#3B2A1E" />
        <circle cx="111" cy="84" r="4.5" fill="#3B2A1E" />
        <ellipse cx="102" cy="110" rx="11" ry="9" fill="#FFFFFF" stroke="#EADFD3" strokeWidth="1.2" />
        <circle cx="98" cy="93" r="1.6" fill="#3B2A1E" />
        <circle cx="106" cy="93" r="1.6" fill="#3B2A1E" />
        <circle cx="108" cy="98" r="2.4" fill="#FFB3C1" />
        <path d="M108 79 l6 -4 v8 z M108 79 l-6 -4 v8 z" fill="var(--vw-accent)" />
      </g>
      <path d="M91 66 C85 61 83 58 84 55 C85 52 89 52 91 55 C93 52 97 52 98 55 C99 58 97 61 91 66 Z" fill="var(--vw-accent)" />
      </g>
      <ellipse cx="68" cy="46" rx="26" ry="12" fill="#FFFFFF" opacity=".55" transform="rotate(-30 68 46)" />
    </svg>
  );
}

/**
 * The snow inside the globe: a tiny physics loop on a canvas. It only runs
 * while flakes are moving (or while the visitor is waiting for them to settle).
 */
function makeSnow(c: HTMLCanvasElement, onCalm: () => void) {
  const css = getComputedStyle(c);
  const colors = ["#FFFFFF", "#FFFFFF", "#FFFFFF", css.getPropertyValue("--ha-blush").trim() || "#FFE0EA", css.getPropertyValue("--ha-gilt-a").trim() || "#F3D9A4"];
  let seed = 3;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  // Flakes start settled on the snowy ground.
  const flakes: Flake[] = Array.from({ length: FLAKES }, () => ({ x: (rnd() - 0.5) * 1.5, y: 0.55 + rnd() * 0.3, vx: 0, vy: 0, r: 1.6 + rnd() * 2.6, c: colors[Math.floor(rnd() * colors.length)] }));
  let raf = 0;
  let calmSince = 0;
  let waiting = false;

  const draw = () => {
    const g = c.getContext("2d");
    if (!g) return;
    const r = c.getBoundingClientRect();
    if (!r.width) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (c.width !== Math.round(r.width * dpr)) {
      c.width = Math.round(r.width * dpr);
      c.height = Math.round(r.height * dpr);
    }
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, r.width, r.height);
    const R = r.width / 2;
    const k = R / 110;
    for (const f of flakes) {
      g.fillStyle = f.c;
      g.shadowColor = "rgba(60,40,90,.35)";
      g.shadowBlur = 2 * k;
      g.beginPath();
      g.arc(R + f.x * R, R + f.y * R, f.r * k, 0, Math.PI * 2);
      g.fill();
    }
    g.shadowBlur = 0;
  };

  const tick = () => {
    let e = 0;
    for (const f of flakes) {
      f.vy += 0.0011 * (0.6 + f.r / 4);
      f.vx *= 0.975;
      f.vy *= 0.968;
      f.x += f.vx;
      f.y += f.vy;
      // The ground: a gentle mound inside the glass.
      const ground = 0.82 + 0.06 * Math.cos(f.x * 2);
      if (f.y > ground) {
        f.y = ground;
        f.vy *= -0.15;
        f.vx *= 0.6;
      }
      const d = Math.hypot(f.x, f.y);
      if (d > 0.92) {
        f.x = (f.x / d) * 0.92;
        f.y = (f.y / d) * 0.92;
        f.vx *= -0.4;
        f.vy *= -0.4;
      }
      e += Math.abs(f.vx) + Math.abs(f.vy);
    }
    e /= FLAKES;
    draw();
    const now = performance.now();
    if (e < 0.0016) {
      if (!calmSince) calmSince = now;
    } else calmSince = 0;
    if (waiting && calmSince && now - calmSince > 450) {
      waiting = false;
      onCalm();
    }
    raf = e > 0.0004 || waiting ? requestAnimationFrame(tick) : 0;
  };

  return {
    draw,
    /** A shake: push every flake about; `wait` = report when they've settled. */
    stir(dx: number, dy: number, wait: boolean) {
      const k = Math.min(0.06, Math.hypot(dx, dy) / 900);
      for (const f of flakes) {
        f.vx += (Math.random() - 0.5) * k * 2.4 + dx * 0.00018;
        f.vy -= Math.random() * k * 2.2 + Math.abs(dy) * 0.0001;
      }
      if (wait) {
        waiting = true;
        calmSince = 0;
      }
      if (!raf) raf = requestAnimationFrame(tick);
    },
    stop() {
      cancelAnimationFrame(raf);
      raf = 0;
    },
  };
}

export function GiftShop({ reasons, sender, recipient, sticker, onNext }: { reasons: readonly string[]; sender: string; recipient: string; sticker: ReactNode; onNext: () => void }) {
  const { cue } = useHa();
  const reduced = useReducedMotion();
  const canvas = useRef<HTMLCanvasElement | null>(null);
  const snow = useRef<ReturnType<typeof makeSnow> | null>(null);
  const stirred = useRef(0);
  const [phase, setPhase] = useState<"idle" | "snow" | "note">("idle");
  const [shown, setShown] = useState(-1);
  const phaseRef = useRef(phase);
  useLayoutEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  const gx = useMotionValue(0);
  const gy = useMotionValue(0);
  const total = reasons.length;

  const settled = useRef<() => void>(() => {});
  useLayoutEffect(() => {
    settled.current = () => {
      phaseRef.current = "note";
      setPhase("note");
      setShown((k) => Math.min(total - 1, k + 1));
      haptic(14);
      cue("glass-ping", { gain: 0.4 });
      cue("chime", { gain: 0.35, at: 0.1 });
    };
  }, [total, cue]);

  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const engine = makeSnow(c, () => settled.current());
    snow.current = engine;
    const id = requestAnimationFrame(engine.draw);
    const ro = new ResizeObserver(() => engine.draw());
    ro.observe(c);
    return () => {
      cancelAnimationFrame(id);
      engine.stop();
      ro.disconnect();
      snow.current = null;
    };
  }, []);

  const done = shown >= total - 1 && phase === "note";

  const stir = useCallback(
    (dx: number, dy: number) => {
      if (done) return;
      stirred.current += Math.hypot(dx, dy);
      let wait = false;
      if (stirred.current > 120 && phaseRef.current !== "snow") {
        stirred.current = 0;
        wait = true;
        phaseRef.current = "snow";
        setPhase("snow");
        cue("wind-bed", { gain: 0.18 });
      }
      snow.current?.stir(dx, dy, wait);
    },
    [done, cue],
  );

  const tapShake = () => {
    if (done) return;
    haptic(16);
    cue("glass-ping", { gain: 0.25 });
    if (!reduced) animate(gx, [0, -16, 14, -10, 8, 0], { duration: 0.6 });
    stirred.current = 200;
    stir(260, -220);
  };

  // A real shake works too, where the browser gives motion without asking.
  useEffect(() => {
    if (typeof window === "undefined" || !("DeviceMotionEvent" in window)) return;
    const DM = window.DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> };
    if (typeof DM.requestPermission === "function") return;
    let lastT = 0;
    const on = (e: DeviceMotionEvent) => {
      const a = e.acceleration;
      if (!a) return;
      const m = Math.hypot(a.x ?? 0, a.y ?? 0, a.z ?? 0);
      const now = performance.now();
      if (m > 14 && now - lastT > 120) {
        lastT = now;
        stir((a.x ?? 0) * 20, (a.y ?? 0) * 20);
      }
    };
    window.addEventListener("devicemotion", on);
    return () => window.removeEventListener("devicemotion", on);
  }, [stir]);

  useNext(done ? "The guestbook" : null, onNext, "book");

  const reason = shown >= 0 ? reasons[shown] : "";
  return (
    <>
      <Head
        kicker="Room 5 · The Gift Shop"
        title="A snow globe of us"
        sub={phase === "snow" ? "Let it settle… ❄️" : done ? "That's every reason in the globe (not every reason)" : shown < 0 ? "Shake it! Drag it about, or tap it" : "Shake it again for another reason"}
      />
      <div className="ha-fill">
        <div className="ha-shop ha-zoom">
          <motion.div
            className="ha-globe"
            style={{ x: gx, y: gy }}
            drag={!done}
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.45}
            dragSnapToOrigin
            onDrag={(_, info) => stir(info.delta.x, info.delta.y)}
            onTap={tapShake}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                tapShake();
              }
            }}
            aria-label="A snow globe. Shake it: drag it about or tap it."
            data-ha-globe={phase}
          >
            <div className="ha-dome">
              <GlobeScene />
              <canvas ref={canvas} className="ha-snow" aria-hidden />
              <span className="ha-dome-shine" aria-hidden />
            </div>
            <div className="ha-globe-base" aria-hidden>
              <span>
                {sender} &amp; {recipient}
              </span>
            </div>
          </motion.div>
          <div className="ha-shop-side">
            <AnimatePresence mode="wait">
              {phase === "note" && reason ? (
                <motion.div
                  key={shown}
                  className="ha-note"
                  initial={reduced ? false : { opacity: 0, y: 20, rotate: -6, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, rotate: shown % 2 ? 2 : -2, scale: 1 }}
                  exit={reduced ? undefined : { opacity: 0, y: -10, transition: { duration: 0.15 } }}
                  transition={{ type: "spring", stiffness: 220, damping: 16 }}
                  aria-live="polite"
                >
                  <span className="ha-note-k">Reason No. {shown + 1}</span>
                  <p className="ha-note-t">{reason}</p>
                </motion.div>
              ) : (
                <motion.div key="wait" className="ha-note is-wait" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <p className="ha-note-t">{phase === "snow" ? "❄️ ❄️ ❄️" : "a reason is hiding in the snow…"}</p>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="ha-shop-dots" aria-label={`${shown + 1} of ${reasons.length} reasons`}>
              {reasons.map((_, k) => (
                <i key={k} className={k <= shown ? "is-on" : undefined} />
              ))}
            </div>
            <div className="ha-shop-gif">{sticker}</div>
          </div>
        </div>
      </div>
      <style>{SHOP_CSS}</style>
    </>
  );
}

const SHOP_CSS = `
.ha-shop { width: min(100%, 440px); display: grid; justify-items: center; gap: clamp(10px, 2cqh, 16px); align-content: center; }
.ha-globe { --g: min(50cqh, 80cqw, 350px); position: relative; width: var(--g); display: grid; justify-items: center; cursor: grab; touch-action: none; outline: none; -webkit-tap-highlight-color: transparent; }
.ha-globe:active { cursor: grabbing; }
.ha-globe:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 6px; border-radius: 24px; }
.ha-dome { position: relative; width: 100%; aspect-ratio: 1; border-radius: 50%; overflow: hidden; z-index: 1;
  box-shadow: inset 0 0 0 3px rgba(255,255,255,.9), inset -10px -14px 30px color-mix(in srgb, var(--ha-deep) 14%, transparent), 0 20px 30px -18px color-mix(in srgb, var(--ha-deep) 50%, transparent); }
.ha-dome > svg, .ha-snow { position: absolute; inset: 0; width: 100%; height: 100%; }
.ha-dome-shine { position: absolute; inset: 0; border-radius: 50%; pointer-events: none; background: radial-gradient(40% 26% at 30% 22%, rgba(255,255,255,.7), transparent 70%), radial-gradient(70% 70% at 50% 50%, transparent 72%, rgba(255,255,255,.45) 92%); }
.ha-globe-base { position: relative; margin-top: -9%; width: 84%; height: calc(var(--g) * .24); border-radius: 12px 12px 22px 22px; display: grid; place-items: center;
  background: linear-gradient(180deg, var(--ha-gilt-a), color-mix(in srgb, var(--ha-gilt-b) 80%, var(--ha-deep))); box-shadow: inset 0 4px 0 rgba(255,255,255,.55), inset 0 -6px 0 rgba(0,0,0,.12), 0 16px 24px -14px rgba(60,35,10,.55); }
.ha-globe-base span { margin-top: 10%; max-width: 88%; padding: 2px 10px; border-radius: 4px; font: 700 clamp(14px, min(2.4cqh, 4.6cqw), 19px)/1.05 ${HA_HAND}; color: #3B2A14; background: #FFFBEF; box-shadow: 0 0 0 1.5px var(--ha-gilt-b); text-align: center; text-wrap: balance; overflow-wrap: break-word; }
.ha-shop-side { position: relative; width: 100%; display: grid; justify-items: center; gap: 8px; }
.ha-note { box-sizing: border-box; width: min(100%, 380px); min-height: clamp(84px, 15cqh, 118px); padding: 10px 16px 12px; display: grid; align-content: center; gap: 2px; border-radius: 4px; text-align: center;
  background: linear-gradient(180deg, #FFFEF8, var(--vw-paper)); box-shadow: 0 0 0 1.5px var(--vw-edge), 0 14px 24px -16px color-mix(in srgb, var(--ha-deep) 60%, transparent); }
.ha-note.is-wait { box-shadow: 0 0 0 1.5px dashed var(--vw-edge); background: color-mix(in srgb, var(--vw-paper) 60%, transparent); outline: 2px dashed var(--vw-edge); outline-offset: -6px; }
.ha-note-k { font: 700 11.5px ${HA_CAPS}; letter-spacing: .18em; text-transform: uppercase; color: var(--vw-accent-deep); }
.ha-note-t { margin: 0; font: 700 clamp(20px, 3cqh, 25px)/1.22 ${HA_HAND}; color: var(--vw-ink); overflow-wrap: anywhere; }
.ha-note.is-wait .ha-note-t { color: var(--vw-ink-soft); font-size: 19px; }
.ha-shop-dots { display: flex; gap: 6px; }
.ha-shop-dots i { width: 9px; height: 9px; border-radius: 50%; background: var(--vw-edge); }
.ha-shop-dots i.is-on { background: var(--vw-accent); }
.ha-shop-gif { position: absolute; left: -4px; top: calc(-1 * min(50cqh, 80cqw, 350px) - 20px); transform: rotate(-8deg); pointer-events: none; z-index: 3; }
.ha-shop-gif .ha-stk img { width: clamp(48px, 10cqh, 88px) !important; height: auto !important; }
@media (max-width: 999px) { .ha-shop-gif { left: -10px; } }
@media (min-width: 1000px) {
  .ha-shop { --hz: 1; width: min(100%, 980px); grid-template-columns: auto minmax(0, 440px); gap: 56px; align-items: center; justify-content: center; }
  .ha-globe { --g: min(70cqh, 430px); }
  .ha-note { width: 440px; min-height: 170px; padding: 18px 24px; }
  .ha-note-t { font-size: 31px; }
  .ha-note-k { font-size: 12px; }
  .ha-shop-dots i { width: 11px; height: 11px; }
  .ha-shop-gif { left: auto; right: 0; top: -120px; transform: rotate(8deg); }
}
`;

// ─── 7 · The guestbook ──────────────────────────────────────────────────────

export function Guestbook({ letter, recipient, sender, petName, onNext }: { letter: string; recipient: string; sender: string; petName: string; onNext: () => void }) {
  const { cue } = useHa();
  const reduced = useReducedMotion();
  const words = useMemo(() => letter.split(/(\s+)/), [letter]);
  const [started, setStarted] = useState(false);
  const [count, setN] = useState(0);
  const total = words.length;
  // Reduced motion: the whole letter at once.
  const n = reduced && started ? total : count;
  const written = n >= total;
  const today = useMemo(() => new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }), []);

  useEffect(() => {
    if (!started || written || reduced) return;
    const id = window.setInterval(() => {
      setN((v) => {
        const nx = Math.min(total, v + 2);
        if (nx % 16 === 0) cue("nib-scratch", { gain: 0.14 });
        return nx;
      });
    }, 70);
    return () => window.clearInterval(id);
  }, [started, written, reduced, total, cue]);

  useEffect(() => {
    if (written && started) cue("chime", { gain: 0.35 });
  }, [written, started, cue]);

  const dip = () => {
    haptic(12);
    if (!started) {
      setStarted(true);
      cue("nib-scratch", { gain: 0.3 });
    } else if (!written) setN(total);
  };

  useNext(written ? "Next exhibition" : null, onNext, "sparkle");

  return (
    <>
      <Head kicker="Room 6 · The Guestbook" title={`A note for you, ${recipient}`} sub={started ? (written ? "Signed in the guestbook 🖋️" : "Tap the page to write faster") : "Tap the quill to sign the guestbook 🪶"} />
      <div className="ha-fill">
        <div className="ha-book ha-zoom" data-ha-book={written ? "written" : started ? "writing" : "blank"}>
          <div className="ha-page is-left" aria-hidden>
            <p className="ha-pg-k">Guestbook</p>
            <p className="ha-pg-t">Our Little Love Museum</p>
            <p className="ha-pg-d">{today}</p>
            <p className="ha-pg-v">
              Visitor: <b>{recipient}</b>
            </p>
            <span className="ha-pg-flower">🌸</span>
          </div>
          <div className="ha-page is-right" onClick={started && !written ? dip : undefined}>
            <HaScroll className="ha-pg-scroll" label="The letter" follow={started && !written}>
              <p className="ha-pg-greet">Dear {petName || recipient},</p>
              <p className="ha-pg-letter">
                {words.slice(0, n).join("")}
                {started && !written && (
                  <span className="ha-quill-run" aria-hidden>
                    🪶
                  </span>
                )}
              </p>
              {written && (
                <motion.p className="ha-pg-sign" initial={reduced ? false : { opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                  — {sender}
                </motion.p>
              )}
            </HaScroll>
            {!started && (
              <button type="button" className="ha-quill" onClick={dip} aria-label="Dip the quill and write the letter" data-ha-quill>
                <span aria-hidden>🪶</span>
                <i aria-hidden>dip the pen</i>
              </button>
            )}
            <span className="vw-sr">{letter}</span>
          </div>
        </div>
      </div>
      <style>{BOOK_CSS}</style>
    </>
  );
}

const BOOK_CSS = `
.ha-book { position: relative; width: min(100%, 440px); height: min(100%, 560px); display: grid; grid-template-columns: minmax(0, 1fr); }
.ha-page { position: relative; box-sizing: border-box; min-height: 0; padding: 18px 16px 14px 22px; text-align: left; color: #3A2A20;
  background: repeating-linear-gradient(180deg, transparent 0 31px, color-mix(in srgb, var(--vw-accent) 16%, transparent) 31px 32px), linear-gradient(90deg, color-mix(in srgb, #E9DCC6 70%, transparent) 0, transparent 22px), #FFFDF6;
  background-position: 0 14px, 0 0, 0 0; border-radius: 4px 12px 12px 4px; box-shadow: 0 0 0 1.5px #E6D8C0, 6px 6px 0 -1px #F4EADA, 6px 6px 0 0 #E6D8C0, 12px 12px 0 -1px #F7F0E2, 12px 12px 0 0 #E6D8C0, 0 26px 40px -24px color-mix(in srgb, var(--ha-deep) 60%, transparent);
  display: grid; grid-template-rows: minmax(0, 1fr); }
.ha-page.is-left { display: none; }
.ha-pg-scroll { min-height: 0; }
.ha-pg-greet { margin: 0; font: 700 26px/32px ${HA_HAND}; color: var(--vw-accent-deep); }
.ha-pg-letter { margin: 0; white-space: pre-wrap; font: 600 clamp(20px, 2.9cqh, 23px)/32px ${HA_HAND}; overflow-wrap: anywhere; min-height: 64px; }
.ha-pg-sign { margin: 6px 0 4px; text-align: right; font: 700 28px/32px ${HA_HAND}; color: var(--vw-accent-deep); }
.ha-quill-run { display: inline-block; margin-left: 2px; font-size: 22px; line-height: 1; animation: ha-scribble .35s ease-in-out infinite alternate; }
@keyframes ha-scribble { from { transform: translate(-2px, 0) rotate(-12deg) } to { transform: translate(2px, -3px) rotate(6deg) } }
.ha-quill { position: absolute; left: 50%; top: 52%; translate: -50% -50%; display: grid; justify-items: center; gap: 2px; min-width: 120px; min-height: 96px; padding: 10px 16px; border: 0; border-radius: 22px; cursor: pointer; touch-action: manipulation;
  background: color-mix(in srgb, #FFFFFF 85%, transparent); box-shadow: 0 0 0 2px var(--ha-gilt-a), 0 14px 26px -12px color-mix(in srgb, var(--ha-deep) 60%, transparent); }
.ha-quill span { font-size: 46px; line-height: 1; animation: ha-dip 1.4s ease-in-out infinite; }
@keyframes ha-dip { 0%, 100% { transform: rotate(-14deg) translateY(0) } 50% { transform: rotate(6deg) translateY(6px) } }
.ha-quill i { font: 700 20px ${HA_HAND}; font-style: normal; color: var(--vw-accent-deep); }
.ha-quill:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 4px; }
.ha-pg-k { margin: 0; font: 700 11px ${HA_CAPS}; letter-spacing: .24em; text-transform: uppercase; color: var(--vw-accent-deep); }
.ha-pg-t { margin: 6px 0 0; font: 700 32px/1.05 ${HA_DISPLAY}; color: #3A2A20; }
.ha-pg-d { margin: 10px 0 0; font: 600 italic 18px ${HA_DISPLAY}; color: #6A5440; }
.ha-pg-v { margin: 28px 0 0; font: 600 22px ${HA_HAND}; color: #3A2A20; }
.ha-pg-v b { color: var(--vw-accent-deep); }
.ha-pg-flower { position: absolute; right: 18px; bottom: 16px; font-size: 54px; transform: rotate(-18deg); opacity: .85; }
@media (min-width: 1000px) {
  .ha-book { width: min(100%, 920px); grid-template-columns: minmax(0, .8fr) minmax(0, 1.2fr); }
  .ha-page.is-left { display: block; padding: 34px 26px; border-radius: 12px 4px 4px 12px; box-shadow: 0 0 0 1.5px #E6D8C0, -6px 6px 0 -1px #F4EADA, -6px 6px 0 0 #E6D8C0, inset -18px 0 24px -18px rgba(90,60,30,.35), 0 26px 40px -24px color-mix(in srgb, var(--ha-deep) 60%, transparent); }
  .ha-page.is-right { padding: 26px 22px 18px 30px; box-shadow: 0 0 0 1.5px #E6D8C0, 6px 6px 0 -1px #F4EADA, 6px 6px 0 0 #E6D8C0, inset 18px 0 24px -18px rgba(90,60,30,.35), 0 26px 40px -24px color-mix(in srgb, var(--ha-deep) 60%, transparent); }
}
@media (prefers-reduced-motion: reduce) { .ha-quill span, .ha-quill-run { animation: none; } }
`;

// ─── 8 · The next exhibition: another year of us? ───────────────────────────

export function NextExhibition({
  question,
  yes,
  yes2,
  promises,
  plan,
  sender,
  recipient,
  nextLabel,
  answered,
  yesLine,
  sticker,
  onYes,
  onNext,
}: {
  question: string;
  yes: string;
  yes2: string;
  promises: readonly string[];
  plan: string;
  sender: string;
  recipient: string;
  nextLabel: string;
  answered: boolean;
  yesLine: string;
  sticker: ReactNode;
  onYes: () => void;
  onNext: () => void;
}) {
  const { cue } = useHa();
  const reduced = useReducedMotion();
  const say = () => {
    if (answered) return;
    cue("chime-cascade", { gain: 0.8 });
    cue("kiss", { gain: 0.45, at: 0.2 });
    onYes();
  };
  useNext(answered ? "Unveil your award" : null, onNext, "trophy");
  return (
    <>
      <Head kicker={answered ? "It's official" : "Coming soon"} title={answered ? `${recipient} said yes 💗` : question} sub={answered ? undefined : "Read the poster, then answer 🥺"} />
      <div className="ha-fill">
        <div className={`ha-next-ex ha-zoom${answered ? " is-yes" : ""}`}>
          <div className="ha-poster ha-frame" data-ha-poster={answered ? "yes" : "ask"}>
            <div className="ha-frame-in ha-poster-in">
              <p className="ha-po-k">Next exhibition</p>
              <p className="ha-po-t">{nextLabel}</p>
              <p className="ha-po-f">Featuring</p>
              <ul className="ha-po-list">
                {promises.map((p, k) => (
                  <li key={k}>{p}</li>
                ))}
              </ul>
              {plan && (
                <p className="ha-po-plan">
                  <b>Opening night</b> {plan}
                </p>
              )}
              <p className="ha-po-by">
                curated by {sender}, for {recipient}
              </p>
              <AnimatePresence>
                {answered && (
                  <motion.span className="ha-po-stamp" initial={reduced ? false : { scale: 2.6, opacity: 0, rotate: 30 }} animate={{ scale: 1, opacity: 1, rotate: -10 }} transition={{ type: "spring", stiffness: 300, damping: 15 }}>
                    Confirmed ♡
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="ha-ex-side">
            {answered ? (
              <motion.div className="ha-yes" initial={reduced ? false : { opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 200, damping: 16, delay: 0.25 }}>
                <div className="ha-yes-gif">{sticker}</div>
                <p className="ha-say">{yesLine}</p>
              </motion.div>
            ) : (
              <div className="ha-q-actions">
                <button type="button" className="ha-q-yes" onClick={say} data-ha-yes>
                  {yes}
                </button>
                <button type="button" className="ha-q-yes is-alt" onClick={say} data-ha-yes2>
                  {yes2}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{EX_CSS}</style>
    </>
  );
}

const EX_CSS = `
.ha-next-ex { width: min(100%, 440px); display: grid; justify-items: center; gap: clamp(10px, 2cqh, 16px); align-content: center; }
.ha-poster { width: min(100%, 360px); }
.ha-poster-in { box-sizing: border-box; padding: 14px 18px 12px; display: grid; justify-items: center; gap: 3px; text-align: center;
  background: radial-gradient(120% 50% at 50% 0%, #FFFFFF, var(--ha-blush)); }
.ha-po-k { margin: 0; font: 700 11px ${HA_CAPS}; letter-spacing: .26em; text-transform: uppercase; color: var(--vw-accent-deep); }
.ha-po-t { margin: 0; font: 700 clamp(28px, 5cqh, 38px)/1 ${HA_DISPLAY}; color: var(--vw-ink); text-wrap: balance; }
.ha-po-f { margin: 6px 0 0; font: 600 italic 15px ${HA_DISPLAY}; color: var(--vw-ink-soft); }
.ha-po-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 1px; }
.ha-po-list li { font: 700 clamp(18px, 2.7cqh, 22px)/1.2 ${HA_HAND}; color: var(--vw-ink); overflow-wrap: anywhere; }
.ha-po-list li::before { content: "✦ "; color: var(--vw-accent); font-size: .8em; }
.ha-po-plan { margin: 6px 0 0; padding: 5px 12px; border-radius: 99px; background: #FFFFFF; box-shadow: 0 0 0 1.5px var(--vw-edge); font: 600 13.5px/1.3 ${FONTS.ui}; color: var(--vw-ink); overflow-wrap: anywhere; }
.ha-po-plan b { font: 700 10.5px ${HA_CAPS}; letter-spacing: .14em; text-transform: uppercase; color: var(--vw-accent-deep); margin-right: 4px; }
.ha-po-by { margin: 6px 0 0; font: 600 italic 14px ${HA_DISPLAY}; color: var(--vw-ink-soft); overflow-wrap: anywhere; }
.ha-po-stamp { position: absolute; right: -8px; bottom: 6px; z-index: 2; padding: 4px 10px; border: 3px solid var(--vw-accent); border-radius: 8px; pointer-events: none; font: 700 15px ${HA_CAPS}; letter-spacing: .12em; text-transform: uppercase; color: var(--vw-accent-deep); background: color-mix(in srgb, #FFFFFF 75%, transparent); }
.ha-ex-side { width: 100%; display: grid; justify-items: center; }
.ha-q-actions { width: 100%; max-width: 380px; display: grid; gap: 10px; }
.ha-q-yes { width: 100%; min-height: 56px; padding: 10px 22px; border: 0; border-radius: 999px; cursor: pointer; touch-action: manipulation; color: #FFFFFF; font: 700 clamp(21px, 3cqh, 24px)/1.15 ${HA_DISPLAY};
  background: linear-gradient(180deg, color-mix(in srgb, var(--vw-accent) 68%, #FFFFFF), var(--vw-accent) 55%, var(--vw-accent-deep)); text-shadow: 0 1px 0 color-mix(in srgb, var(--ha-deep) 60%, transparent);
  box-shadow: 0 5px 0 var(--ha-deep), 0 0 0 3px var(--ha-gilt-a), 0 0 34px -4px color-mix(in srgb, var(--vw-accent) 60%, transparent); animation: ha-yes-glow 2.2s ease-in-out infinite; overflow-wrap: anywhere; }
.ha-q-yes.is-alt { color: var(--vw-accent-deep); text-shadow: none; background: linear-gradient(180deg, #FFFFFF, var(--ha-blush)); box-shadow: 0 5px 0 color-mix(in srgb, var(--ha-deep) 50%, transparent), 0 0 0 3px var(--ha-gilt-a); animation: none; }
@keyframes ha-yes-glow { 50% { box-shadow: 0 5px 0 var(--ha-deep), 0 0 0 3px var(--ha-gilt-a), 0 0 50px 4px color-mix(in srgb, var(--vw-accent) 65%, transparent) } }
.ha-q-yes:active { transform: translateY(4px); }
/* Short screens: the two answers sit side by side so the whole poster stays readable above them. */
@container (max-height: 440px) { .ha-q-actions { grid-template-columns: 1fr 1fr; max-width: 440px; gap: 8px; } .ha-q-yes { min-height: 50px; padding: 8px 12px; font-size: 18px; } }
.ha-q-yes:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 4px; }
.ha-yes { display: grid; justify-items: center; gap: 8px; max-width: 400px; }
.ha-yes-gif .ha-stk img { width: clamp(84px, 16cqh, 130px) !important; height: auto !important; }
/* Once she says yes the "curated by" line moves up out of the stamp's way. */
.ha-next-ex.is-yes .ha-po-by { margin-bottom: 30px; }
/* Phones / short screens: after the yes, the poster folds to its title + stamp so the heading, the sticker
   and the reply line all fit above the pill (the full poster was read before answering). */
@container (max-height: 600px) {
  .ha-next-ex.is-yes .ha-po-f, .ha-next-ex.is-yes .ha-po-list, .ha-next-ex.is-yes .ha-po-plan { display: none; }
  .ha-next-ex.is-yes .ha-yes-gif .ha-stk img { width: clamp(64px, 18cqh, 110px) !important; }
  .ha-next-ex.is-yes .ha-say { font-size: clamp(18px, 4.6cqh, 22px); }
}
@container (max-height: 290px) { .ha-next-ex.is-yes .ha-yes-gif { display: none; } }
@media (min-width: 1000px) {
  .ha-next-ex { --hz: 1.22; width: min(100%, 860px); grid-template-columns: minmax(0, 400px) minmax(0, 360px); gap: 36px; align-items: center; justify-content: center; }
  .ha-poster { width: 100%; }
}
@media (prefers-reduced-motion: reduce) { .ha-q-yes { animation: none; } }
`;

// ─── 9 · The award room ─────────────────────────────────────────────────────

export function Award({
  day,
  data,
  mode,
  palette,
  recipient,
  sender,
  title,
  relation,
  t,
  label,
  photo,
  replyText,
  unveiled,
  sticker,
  bigSticker,
  onUnveil,
  onReplay,
}: {
  day: DayConfig;
  data: ValentineDayData;
  mode: "preview" | "live";
  palette: HaPaletteDef;
  recipient: string;
  sender: string;
  title: string;
  relation: string;
  t: Together;
  label: string;
  photo: string;
  replyText: string;
  unveiled: boolean;
  sticker: ReactNode;
  bigSticker: ReactNode;
  onUnveil: () => void;
  onReplay: () => void;
}) {
  const { cue, go } = useHa();
  const reduced = useReducedMotion();
  const [sheet, setSheet] = useState<"award" | "share">("award");
  const cloth = useMotionValue(0);
  const year = new Date().getFullYear();
  const statLine = t.ok
    ? `${t.years >= 1 ? `${t.years} year${t.years === 1 ? "" : "s"} · ` : ""}${t.totalDays.toLocaleString("en-IN")} days · countless I love yous`
    : "countless days · countless I love yous";

  const unveil = () => {
    if (unveiled) return;
    haptic(30);
    cue("whoosh", { gain: 0.5 });
    cue("chime-cascade", { gain: 0.8, at: 0.3 });
    if (!reduced) animate(cloth, 900, { duration: 0.9, ease: [0.5, 0, 0.9, 0.5] });
    window.setTimeout(onUnveil, reduced ? 0 : 380);
  };

  const makeOwn = () => {
    haptic(12);
    const link = typeof window !== "undefined" ? `${window.location.origin}/happy-anniversary` : "https://subhsandesh.in/happy-anniversary";
    const text = `Someone made me a whole little museum for our anniversary 🖼️💗\nMake one for your own person:\n${link}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
  };

  const th = palette.theme;
  const keepsake = (): KeepsakeLayout => {
    const W = 1080;
    const items: KeepsakeItem[] = [
      { type: "rect", x: 56, y: 56, w: 968, h: 1808, radius: 26, stroke: palette.gilt[1], lineWidth: 10 },
      { type: "rect", x: 78, y: 78, w: 924, h: 1764, radius: 18, stroke: palette.gilt[0], lineWidth: 4 },
      { type: "text", text: "OUR LITTLE LOVE MUSEUM", x: W / 2, y: 170, size: 38, weight: 700, color: th.accentDeep, face: "ui" },
      { type: "text", text: `The ${label} Exhibition`, x: W / 2, y: 240, size: 46, face: "serif", italic: true, color: th.inkSoft, maxWidth: 880, maxLines: 1 },
    ];
    let y = 300;
    if (photo) {
      items.push({ type: "image", src: photo, x: 290, y, w: 500, h: 600, frame: { pad: 26, bottom: 26, color: palette.gilt[0] } });
      y += 720;
    } else {
      items.push({ type: "emoji", char: "🏆", x: W / 2, y: y + 230, size: 300 });
      y += 520;
    }
    items.push(
      { type: "text", text: `✦ ${title} ✦`, x: W / 2, y: y + 30, size: 70, weight: 700, color: th.ink, face: "serif", maxWidth: 900, maxLines: 2 },
      { type: "text", text: String(year), x: W / 2, y: y + 130, size: 36, weight: 700, color: th.accent, face: "ui" },
      { type: "text", text: "awarded to", x: W / 2, y: y + 200, size: 34, color: th.inkSoft, face: "ui" },
      { type: "text", text: recipient, x: W / 2, y: y + 300, size: 110, face: "script", weight: 700, color: th.accentDeep, maxWidth: 880, maxLines: 1 },
      { type: "text", text: `for being the best ${relation} in the whole collection`, x: W / 2, y: y + 400, size: 38, color: th.ink, face: "ui", maxWidth: 860, maxLines: 2 },
      { type: "text", text: statLine, x: W / 2, y: y + 490, size: 34, weight: 700, color: th.accent, face: "ui", maxWidth: 900, maxLines: 1 },
    );
    if (data.endLine) items.push({ type: "text", text: data.endLine, x: W / 2, y: y + 580, size: 42, face: "serif", italic: true, color: th.ink, maxWidth: 880, maxLines: 2 });
    items.push(
      { type: "text", text: sender, x: W / 2, y: 1716, size: 64, face: "script", weight: 700, color: th.accentDeep, maxWidth: 700, maxLines: 1 },
      { type: "text", text: "Chief Curator", x: W / 2, y: 1770, size: 28, color: th.inkSoft, face: "ui" },
      { type: "text", text: "Made on subhsandesh.in 🖼️", x: W / 2, y: 1830, size: 26, color: th.inkSoft, face: "ui" },
    );
    return { background: { stops: [[0, palette.wall[0]], [0.62, th.base], [1, palette.wall[1]]] }, items };
  };

  useNext(
    unveiled ? (sheet === "award" ? "Keep it" : "Make one ✨") : null,
    sheet === "award" ? () => setSheet("share") : makeOwn,
    sheet === "award" ? "heart" : "sparkle",
    sheet === "award",
  );

  if (sheet === "share")
    return (
      <>
        <Head kicker="Thank you for visiting" title={`Happy anniversary, ${recipient} 💗`} sub={`Save your award, then tell ${sender}.`} />
        <div className="ha-fill">
          <motion.div className="ha-share-gif" initial={reduced ? false : { opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 180, damping: 16 }}>
            {bigSticker}
          </motion.div>
        </div>
        <div className="ha-zoom" style={{ flex: "none", width: "100%", maxWidth: 420 }}>
          <EndingActions day={day} data={data} mode={mode} onReplay={() => go(onReplay)} keepsake={keepsake} replyText={replyText} replyLabel={`💬 Reply to ${sender}`} />
        </div>
        <style>{AWARD_CSS}</style>
      </>
    );

  return (
    <>
      <Head kicker="Room 8 · The Award Room" title={unveiled ? "And the award goes to…" : "One last exhibit"} sub={unveiled ? undefined : "Pull the velvet cloth off ⤵"} />
      <div className="ha-fill">
        <div className="ha-award-wrap ha-zoom">
          <div className={`ha-award ha-frame${unveiled ? " is-on" : ""}`} data-ha-award={unveiled ? "unveiled" : "covered"}>
            <div className="ha-frame-in ha-award-in">
              <span className="ha-aw-rib" aria-hidden />
              <p className="ha-aw-k">{year} · {label}</p>
              <p className="ha-aw-t">{title}</p>
              <p className="ha-aw-to">awarded to</p>
              <p className="ha-aw-name">{recipient}</p>
              <p className="ha-aw-for">for being the best {relation} in the whole collection</p>
              <p className="ha-aw-stat">{statLine}</p>
              {data.endLine && <p className="ha-aw-end">{data.endLine}</p>}
              <div className="ha-aw-foot">
                <span className="ha-aw-sig">
                  <b>{sender}</b>
                  <i>Chief Curator</i>
                </span>
                <span className="ha-seal" aria-hidden>
                  ♥
                </span>
              </div>
            </div>
            {unveiled && <div className="ha-aw-gif">{sticker}</div>}
          </div>
          {!unveiled && (
            <motion.button
              type="button"
              className="ha-cloth"
              style={{ y: cloth }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 160 }}
              dragElastic={0.15}
              dragMomentum={false}
              dragSnapToOrigin
              onDrag={(_, info) => {
                if (info.offset.y > 90) unveil();
              }}
              onTap={unveil}
              aria-label="Pull the velvet cloth off the award"
              data-ha-cloth
            >
              <span className="ha-cloth-folds" aria-hidden />
              <span className="ha-tassel" aria-hidden />
              <span className="ha-cloth-q" aria-hidden>
                ?
              </span>
            </motion.button>
          )}
        </div>
      </div>
      <style>{AWARD_CSS}</style>
    </>
  );
}

const AWARD_CSS = `
.ha-award-wrap { position: relative; width: min(100%, 380px); max-height: 100%; display: grid; place-items: center; }
.ha-award { width: 100%; max-height: 100%; box-sizing: border-box; }
.ha-award-in { box-sizing: border-box; padding: 16px 16px 12px; display: grid; justify-items: center; gap: 2px; text-align: center; overflow: hidden;
  background: radial-gradient(120% 60% at 50% 0%, #FFFFFF, var(--vw-paper) 60%, var(--ha-blush)); }
.ha-aw-rib { position: absolute; left: -30px; top: 14px; width: 120px; height: 22px; transform: rotate(-38deg); background: var(--vw-accent); box-shadow: 0 2px 0 var(--ha-deep); }
.ha-aw-k { margin: 0; font: 700 11.5px ${HA_CAPS}; letter-spacing: .2em; text-transform: uppercase; color: var(--vw-accent-deep); overflow-wrap: anywhere; }
.ha-aw-t { margin: 2px 0 0; font: 700 clamp(27px, 4.6cqh, 36px)/1.02 ${HA_DISPLAY}; color: var(--vw-ink); text-wrap: balance; overflow-wrap: anywhere; }
.ha-aw-to { margin: 6px 0 0; font: 600 italic 15px ${HA_DISPLAY}; color: var(--vw-ink-soft); }
.ha-aw-name { margin: 0; font: 700 clamp(38px, 6.5cqh, 52px)/1 ${HA_HAND}; color: var(--vw-accent-deep); overflow-wrap: anywhere; }
.ha-aw-for { margin: 2px 0 0; font: 600 13.5px/1.35 ${FONTS.ui}; color: var(--vw-ink); overflow-wrap: anywhere; }
.ha-aw-stat { margin: 6px 0 0; padding: 4px 12px; border-radius: 99px; background: #FFFFFF; box-shadow: 0 0 0 1.5px var(--vw-edge); font: 700 12.5px/1.3 ${FONTS.ui}; color: var(--vw-ink); }
.ha-aw-end { margin: 6px 0 0; font: 600 italic clamp(16px, 2.5cqh, 19px)/1.25 ${HA_DISPLAY}; color: var(--vw-ink); overflow-wrap: anywhere; }
.ha-aw-foot { width: 100%; margin-top: 8px; display: flex; align-items: end; justify-content: space-between; gap: 10px; }
.ha-aw-sig { display: grid; justify-items: start; min-width: 0; }
.ha-aw-sig b { font: 700 clamp(22px, 7cqw, 27px)/1.05 ${HA_HAND}; color: var(--vw-accent-deep); border-bottom: 1.5px solid var(--vw-ink-soft); padding: 0 6px 2px 0; max-width: 100%; overflow-wrap: break-word; text-align: left; }
.ha-aw-sig i { font: 700 10.5px ${HA_CAPS}; font-style: normal; letter-spacing: .16em; text-transform: uppercase; color: var(--vw-ink-soft); margin-top: 3px; }
.ha-seal { flex: none; width: 54px; height: 54px; border-radius: 50%; display: grid; place-items: center; font-size: 22px; color: #FFFFFF; transform: rotate(-10deg);
  background: radial-gradient(circle, var(--vw-accent) 0 52%, transparent 53%), repeating-conic-gradient(from 0deg, var(--vw-accent-deep) 0 10deg, color-mix(in srgb, var(--vw-accent) 70%, #FFFFFF) 10deg 20deg); box-shadow: 0 4px 10px -4px color-mix(in srgb, var(--ha-deep) 70%, transparent); }
.ha-award.is-on { animation: ha-award-in .7s cubic-bezier(.3,1.5,.5,1) both; }
@keyframes ha-award-in { from { transform: scale(.94) } to { transform: scale(1) } }
.ha-aw-gif { position: absolute; right: -10px; top: -96px; transform: rotate(8deg); pointer-events: none; }
.ha-aw-gif .ha-stk img { width: clamp(64px, 11cqh, 96px) !important; height: auto !important; }
@media (max-width: 999px) {
  .ha-aw-gif { top: auto; right: -12px; bottom: -14px; }
  .ha-aw-gif .ha-stk img { width: clamp(52px, 10cqh, 80px) !important; }
  .ha-award:has(.ha-aw-gif) .ha-seal { visibility: hidden; }
}
.ha-cloth { position: absolute; inset: -14px -12px -10px; padding: 0; border: 0; cursor: grab; touch-action: none; border-radius: 10px 10px 18px 18px;
  background: linear-gradient(90deg, rgba(0,0,0,.16), transparent 14%, rgba(255,255,255,.14) 28%, transparent 40%, rgba(0,0,0,.12) 55%, transparent 68%, rgba(255,255,255,.12) 80%, rgba(0,0,0,.16)), linear-gradient(180deg, var(--vw-accent), var(--ha-deep));
  box-shadow: 0 24px 36px -18px color-mix(in srgb, var(--ha-deep) 80%, transparent), inset 0 8px 0 var(--ha-gilt-a); z-index: 3; }
.ha-cloth:focus-visible { outline: 3px solid var(--vw-ink); outline-offset: 4px; }
.ha-cloth-folds { position: absolute; left: 0; right: 0; bottom: -10px; height: 22px; background: radial-gradient(circle at 10px -2px, var(--ha-deep) 12px, transparent 13px) 0 0 / 24px 22px repeat-x; }
.ha-tassel { position: absolute; left: 50%; bottom: -46px; width: 16px; height: 50px; translate: -50% 0; border-radius: 4px 4px 8px 8px; background: linear-gradient(180deg, var(--ha-gilt-a), var(--ha-gilt-b)); box-shadow: 0 4px 6px rgba(0,0,0,.2); animation: ha-tassel 1.8s ease-in-out infinite; transform-origin: 50% 0; }
@keyframes ha-tassel { 0%, 100% { rotate: -6deg } 50% { rotate: 6deg } }
.ha-cloth-q { position: absolute; left: 50%; top: 42%; translate: -50% -50%; font: 700 74px/1 ${HA_DISPLAY}; color: color-mix(in srgb, #FFFFFF 75%, transparent); }
.ha-share-gif .ha-stk > span { width: clamp(130px, 34cqh, 230px) !important; height: auto !important; }
.ha-share-gif .ha-stk img { width: 100% !important; height: auto !important; }
@media (min-width: 1000px) { .ha-award-wrap { --hz: 1.16; width: min(100%, 480px); } .ha-award-in { padding: 22px 26px 16px; } .ha-aw-gif { right: -150px; top: 6%; } }
@media (prefers-reduced-motion: reduce) { .ha-tassel, .ha-award.is-on { animation: none; } }
`;
