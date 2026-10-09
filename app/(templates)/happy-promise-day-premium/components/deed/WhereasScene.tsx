"use client";

// Chapter I · Whereas. The deed arrives folded in three, the way it came out
// of the envelope. Drag it down (or tap) and it unfolds panel by panel, with
// heavy-paper sounds: the letterhead, then their story in two "Whereas…"
// lines, then how long it has been in force. Exhibit A (photo 1) is clipped
// to the corner as it opens.

import { useCallback, useEffect, useRef, useState } from "react";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import { CinematicPhoto, PremiumCTA, sfx } from "../../../_valentine/kit/premium";
import { fmt, longDate, type Deed } from "./model";
import { CTA_STYLE, Eyebrow, Letterhead, Scene } from "./ui";

export default function WhereasScene({ d, onNext }: { d: Deed; onNext: () => void }) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const p = useRef(0);
  const drag = useRef<{ y: number; p: number; moved: boolean } | null>(null);
  const crossed = useRef([false, false]);
  const raf = useRef(0);
  const [open, setOpen] = useState(false);

  const paint = useCallback((v: number) => {
    p.current = Math.max(0, Math.min(1, v));
    const el = ref.current;
    if (!el) return;
    const p1 = Math.min(1, p.current * 2);
    const p2 = Math.max(0, Math.min(1, p.current * 2 - 1));
    el.style.setProperty("--p1", p1.toFixed(4));
    el.style.setProperty("--p2", p2.toFixed(4));
    [p1, p2].forEach((q, i) => {
      if (q > 0.5 && !crossed.current[i]) {
        crossed.current[i] = true;
        sfx("sp-unfold", { gain: 0.9, detune: i * 120 });
        haptic(10);
      }
    });
  }, []);

  const finish = useCallback(() => {
    if (open) return;
    cancelAnimationFrame(raf.current);
    const from = p.current;
    const dur = reduce ? 1 : 1100 * (1 - from) + 200;
    const t0 = performance.now();
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / dur);
      const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      paint(from + (1 - from) * e);
      if (k < 1) raf.current = requestAnimationFrame(step);
      else {
        setOpen(true);
        window.setTimeout(() => sfx("sp-clip", { gain: 0.9 }), reduce ? 0 : 380);
      }
    };
    raf.current = requestAnimationFrame(step);
  }, [open, paint, reduce]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const onDown = (e: React.PointerEvent) => {
    if (open) return;
    drag.current = { y: e.clientY, p: p.current, moved: false };
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    const g = drag.current;
    if (!g) return;
    const h = ref.current?.offsetHeight ?? 400;
    const dy = e.clientY - g.y;
    if (Math.abs(dy) > 6) g.moved = true;
    paint(g.p + dy / (h * 2.2));
  };
  const onUp = () => {
    const g = drag.current;
    drag.current = null;
    if (!g) return;
    if (!g.moved || p.current > 0.28) finish();
    else {
      // too little: settle back.
      const from = p.current;
      const t0 = performance.now();
      const step = (t: number) => {
        const k = Math.min(1, (t - t0) / 300);
        paint(from * (1 - k));
        if (k < 1) raf.current = requestAnimationFrame(step);
      };
      raf.current = requestAnimationFrame(step);
    }
  };

  const ex = d.photos[0];
  const sinceLine = d.sinceDays ? `In force since ${longDate(d.since)} · ${fmt(d.sinceDays)} days` : "";

  return (
    <Scene label="Whereas" className="sp-wh">
      <Eyebrow className={open ? "is-dim" : ""}>{open ? "Clause the first" : `For ${d.recipient}, by hand`}</Eyebrow>
      <div className={`sp-whStage${open ? " is-open" : ""}`}>
        <div
          ref={ref}
          className="sp-fold"
          style={{ ["--p1" as string]: 0, ["--p2" as string]: 0 }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          role="button"
          tabIndex={open ? -1 : 0}
          aria-label="Unfold the deed"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              finish();
            }
          }}
        >
          <div className="sp-pan sp-panMid sp-paper">
            <p className="sp-whClause">
              <span className="sp-whCap">Whereas</span> {d.whereas[0].replace(/^whereas[,\s]*/i, "")}
            </p>
            <div className="sp-flap sp-flapTop">
              <div className="sp-face sp-paper">
                <Letterhead sender={d.sender} recipient={d.recipient} />
              </div>
              <div className="sp-face sp-back sp-paper">
                <span className="sp-backTx sp-typed">For {d.recipient}</span>
                <span className="sp-backHint">Pull down to unfold</span>
              </div>
            </div>
            <div className="sp-flap sp-flapBot">
              <div className="sp-face sp-paper">
                {d.whereas[1] && <p className="sp-whClause sp-whClause2">{d.whereas[1]}</p>}
                {sinceLine && <p className="sp-whSince sp-typed">{sinceLine}</p>}
                <p className="sp-whNow">now, therefore, the Promisor promises:</p>
              </div>
              <div className="sp-face sp-back sp-paper" />
            </div>
          </div>
        </div>
        {ex && (
          <figure className={`sp-exA${open ? " is-in" : ""}`} aria-hidden={!open}>
            <span className="sp-clipIcon" aria-hidden />
            <CinematicPhoto photo={ex} grade="warm" kenBurns={false} focusPull={false} caption="" aspect="4 / 5" eager />
            <figcaption className="sp-exTag">Exhibit A</figcaption>
          </figure>
        )}
      </div>
      <div className="sp-foot">
        {open ? (
          <PremiumCTA style={CTA_STYLE} tone="pearl" cue="page-turn" onClick={onNext}>
            Read the terms
          </PremiumCTA>
        ) : (
          <button type="button" className="sp-quiet" onClick={finish}>
            Unfold it ↓
          </button>
        )}
      </div>
      <style>{CSS}</style>
    </Scene>
  );
}

const CSS = `
.sp-wh .sp-in { justify-content: flex-start; gap: 14px; }
.sp-wh .sp-foot { padding-top: 12px; }
.sp-wh .sp-eyebrow.is-dim { opacity: .8; }
.sp-whStage { --W: min(360px, calc(100vw - 48px)); --H: calc(var(--W) * .5); position: relative; width: var(--W); height: calc(var(--H) * 3); margin: 6px auto 0; flex: none; }
@media (min-width: 768px) { .sp-whStage { --W: 440px; } }
@media (max-height: 700px) { .sp-whStage { --W: min(320px, calc(100vw - 48px)); } }
.sp-fold { position: absolute; left: 0; right: 0; top: var(--H); height: var(--H); perspective: 1600px; touch-action: none; cursor: grab; -webkit-tap-highlight-color: transparent; outline: none; }
.sp-fold:focus-visible { outline: 2px solid var(--sp-gold); outline-offset: 6px; }
.sp-whStage.is-open .sp-fold { cursor: default; }
.sp-pan { position: absolute; inset: 0; transform-style: preserve-3d; box-sizing: border-box; padding: 18px 24px; display: grid; align-content: center; }
.sp-panMid { box-shadow: 0 40px 70px -30px rgba(0,0,0,.95); }
.sp-flap { position: absolute; left: 0; right: 0; height: 100%; transform-style: preserve-3d; }
.sp-flapTop { bottom: 100%; transform-origin: 50% 100%; transform: translateZ(2px) rotateX(calc(-180deg * (1 - var(--p1)))); }
.sp-flapBot { top: 100%; transform-origin: 50% 0; transform: translateZ(1px) rotateX(calc(180deg * (1 - var(--p2)))); }
.sp-face { position: absolute; inset: 0; box-sizing: border-box; padding: 18px 24px; display: grid; align-content: center; justify-items: center; backface-visibility: hidden; -webkit-backface-visibility: hidden; border-radius: 0; }
.sp-flapTop > .sp-face:first-child { box-shadow: inset 0 -14px 18px -16px rgba(80,55,25,.35); }
.sp-flapBot > .sp-face:first-child { box-shadow: inset 0 14px 18px -16px rgba(80,55,25,.35); }
.sp-back { transform: rotateX(180deg); background-color: #EDE3CF; }
.sp-backTx { font-size: 15px; letter-spacing: .1em; }
.sp-backHint { font: 700 9.5px/1 var(--sp-type); letter-spacing: .3em; text-transform: uppercase; color: rgba(28,37,65,.5); margin-top: 10px; animation: sp-hint 2.4s ease-in-out infinite; }
@keyframes sp-hint { 0%, 100% { transform: translateY(0); opacity: .5; } 50% { transform: translateY(4px); opacity: 1; } }
.sp-whClause { margin: 0; font: 400 clamp(18px, 5.2vw, 22px)/1.35 var(--sp-serif); color: var(--sp-navy); text-wrap: balance; text-align: center; }
.sp-whCap { font-variant: small-caps; letter-spacing: .12em; font-weight: 600; }
.sp-whClause2 { font-style: italic; }
.sp-whSince { margin: 10px 0 0; font-size: 10.5px; line-height: 1.5; letter-spacing: .1em; text-transform: uppercase; opacity: .75; text-wrap: balance; max-width: 30ch; }
.sp-flapTop > .sp-face:first-child { justify-items: start; text-align: left; padding-right: 40%; }
.sp-flapTop .sp-lh { justify-items: start; gap: 7px; }
.sp-flapTop .sp-lhNo { white-space: nowrap; letter-spacing: .22em; }
.sp-flapTop .sp-lhTitle { font-size: clamp(24px, 7vw, 32px); line-height: .95; }
.sp-flapTop .sp-rule { width: 100%; }
.sp-flapTop .sp-lhBetween { font-size: 13.5px; max-width: 22ch; text-wrap: pretty; }
.sp-fold::before { content: ""; position: absolute; left: 3px; right: 3px; bottom: -5px; height: 100%; background: #e3d8c0; border-radius: 1px; box-shadow: 0 30px 50px -24px rgba(0,0,0,.9); transition: opacity .4s ease; }
.sp-whStage.is-open .sp-fold::before { opacity: 0; }
.sp-whNow { margin: 8px 0 0; font: italic 400 13px/1.3 var(--sp-serif); color: rgba(28,37,65,.62); }
.sp-exA { position: absolute; right: -8px; top: calc(var(--H) * .06); width: 36%; margin: 0; padding: 7px 7px 26px; background: #fbf8f1; box-shadow: 0 18px 30px -12px rgba(0,0,0,.75);
  transform: translate(20px, -30px) rotate(9deg); opacity: 0; transition: transform .9s var(--sp-ease), opacity .5s ease; z-index: 3; pointer-events: none; }
.sp-exA.is-in { transform: rotate(5deg); opacity: 1; }
.sp-exA .cin-photo, .sp-exA figure { margin: 0 !important; }
.sp-exTag { position: absolute; left: 0; right: 0; bottom: 7px; text-align: center; font: 700 9px/1 var(--sp-type) !important; letter-spacing: .26em; text-transform: uppercase; color: var(--sp-navy); }
.sp-clipIcon { position: absolute; left: 22%; top: -14px; width: 12px; height: 40px; border: 2px solid #b9bec5; border-radius: 7px; z-index: 2; box-shadow: 0 2px 2px rgba(0,0,0,.35); }
.sp-clipIcon::after { content: ""; position: absolute; left: 2px; right: 2px; top: 6px; bottom: -6px; border: 2px solid #d6dade; border-radius: 5px; }
@media (min-width: 1024px) { .sp-exA { right: -4%; width: 38%; } }
@media (prefers-reduced-motion: reduce) { .sp-backHint { animation: none; } .sp-exA { transition: opacity .3s ease; transform: rotate(5deg); } }
`;
