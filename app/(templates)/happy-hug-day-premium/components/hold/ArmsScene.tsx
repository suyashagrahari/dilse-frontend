"use client";

// Chapter 2: Arms open. Two black-and-white prints of the two of them stand at the edges of the screen, the distance
// between them printed huge. Drag either print toward the other (or tap "Close the distance"): the kilometres count
// down to zero; when they touch they squeeze together with a soft "fwump", and the sender's meet line appears.

import { useCallback, useEffect, useRef, useState, type PointerEvent as RPE } from "react";
import { CroppedPhoto, haptic, useReducedMotion } from "../../../_valentine/kit";
import { PremiumCTA, sfx } from "../../../_valentine/kit/premium";
import type { LovePhoto } from "../../../_valentine/types";
import { fmtKm, initialOf, type Hug } from "./model";
import { CTA_STYLE, Eyebrow, Scene } from "./ui";

function Print({ photo, name, side }: { photo?: LovePhoto; name: string; side: "l" | "r" }) {
  return (
    <span className={`hh-print2 is-${side}`}>
      <span className="hh-printPic">
        {photo ? (
          <CroppedPhoto photo={photo} eager alt="" style={{ background: "#2a211b" }} />
        ) : (
          <span className="hh-printName" aria-hidden>
            <b>{initialOf(name)}</b>
            <i>{name}</i>
          </span>
        )}
      </span>
    </span>
  );
}

export default function ArmsScene({ h, onNext }: { h: Hug; onNext: () => void }) {
  const reduce = useReducedMotion();
  const [c, setC] = useState(0); // closeness 0 → 1
  const [met, setMet] = useState(false);
  const [dragging, setDragging] = useState(false);
  const cRef = useRef(0);
  const drag = useRef<{ x: number; c: number; side: number; w: number } | null>(null);
  const anim = useRef<number | null>(null);

  const meet = useCallback(() => {
    if (cRef.current >= 1 && met) return;
    cRef.current = 1;
    setC(1);
    setMet(true);
    sfx("hh-meet", { gain: 0.9 });
    haptic([18, 60, 24]);
  }, [met]);

  // Animate to 1 (the button, or a release past the snap point).
  const glide = useCallback(() => {
    if (anim.current) cancelAnimationFrame(anim.current);
    const from = cRef.current;
    const t0 = performance.now();
    const dur = reduce ? 1 : 900 * (1 - from) + 250;
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      cRef.current = from + (1 - from) * e;
      setC(cRef.current);
      if (k < 1) anim.current = requestAnimationFrame(step);
      else meet();
    };
    anim.current = requestAnimationFrame(step);
  }, [meet, reduce]);
  useEffect(() => () => { if (anim.current) cancelAnimationFrame(anim.current); }, []);

  const down = (side: number) => (e: RPE<HTMLElement>) => {
    if (met) return;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    drag.current = { x: e.clientX, c: cRef.current, side, w: Math.max(260, window.innerWidth) };
    setDragging(true);
    sfx("swoosh-soft", { gain: 0.35 });
    haptic(8);
  };
  const move = (e: RPE<HTMLElement>) => {
    const d = drag.current;
    if (!d || met) return;
    // Dragging the left print right (or the right print left) closes the gap; half a screen = all the way.
    const dx = (e.clientX - d.x) * d.side;
    const v = Math.max(0, Math.min(1, d.c + dx / (d.w * 0.42)));
    cRef.current = v;
    setC(v);
    if (v >= 0.995) {
      drag.current = null;
      setDragging(false);
      meet();
    }
  };
  const up = () => {
    if (!drag.current) return;
    drag.current = null;
    setDragging(false);
    if (cRef.current > 0.82) glide();
  };

  const left = Math.round(h.km * Math.pow(1 - c, 1.15));
  const gap = 1 - c;

  return (
    <Scene label="Arms open" className={`hh-arms${met ? " is-met" : ""}${dragging ? " is-dragging" : ""}`}>
      <header className="hh-armsHead">
        <Eyebrow>{met ? "Zero kilometres" : h.km > 0 ? "Between us" : "Between us, still"}</Eyebrow>
        {met ? (
          <h2 key="met" className="hh-h hh-meet hh-rise">{h.meetLine}</h2>
        ) : (
          <p className="hh-km" aria-live="off">
            {h.km > 0 ? (
              <>
                <span className="hh-kmN">{fmtKm(left)}</span>
                <span className="hh-kmU">km</span>
              </>
            ) : (
              <span className="hh-kmN hh-kmFar">too far</span>
            )}
          </p>
        )}
      </header>

      <div className="hh-pair" style={{ ["--gap" as string]: gap.toFixed(4) }}>
        <span className="hh-hold hh-holdL" onPointerDown={down(1)} onPointerMove={move} onPointerUp={up} onPointerCancel={up} style={{ touchAction: "none" }}>
          <Print photo={h.pair[0]} name={h.to} side="l" />
        </span>
        <span className="hh-hold hh-holdR" onPointerDown={down(-1)} onPointerMove={move} onPointerUp={up} onPointerCancel={up} style={{ touchAction: "none" }}>
          <Print photo={h.pair[1]} name={h.from} side="r" />
        </span>
        {met && <span className="hh-pairGlow" aria-hidden />}
      </div>

      <div className="hh-foot">
        {met ? (
          <PremiumCTA style={CTA_STYLE} tone="pearl" cue="tick" onClick={onNext}>
            Hold on
          </PremiumCTA>
        ) : (
          <>
            <p className="hh-armsHint" aria-hidden>Drag us together</p>
            <button type="button" className="hh-quiet" onClick={glide}>
              Close the distance
            </button>
          </>
        )}
      </div>
      <style>{CSS}</style>
    </Scene>
  );
}

const CSS = `
.hh-arms .hh-in { justify-content: space-between; gap: 18px; }
.hh-armsHead { display: grid; justify-items: center; gap: 10px; min-height: 150px; }
.hh-km { margin: 0; display: inline-flex; align-items: baseline; gap: 10px; color: var(--hh-cloud); }
.hh-kmN { font: 400 clamp(84px, 26vw, 168px)/.9 var(--hh-display); letter-spacing: -.04em; font-variant-numeric: tabular-nums; }
.hh-kmFar { font-style: italic; font-size: clamp(64px, 19vw, 128px); }
.hh-kmU { font: 700 13px/1 var(--hh-ui); letter-spacing: .3em; text-transform: uppercase; color: var(--hh-apricot); }
.hh-meet { font-style: italic; font-size: clamp(40px, 11.5vw, 84px); max-width: 11ch; }
.hh-pair { position: relative; width: 100%; max-width: 760px; height: clamp(260px, 44svh, 480px); flex: 1 0 auto; display: block; }
.hh-hold { position: absolute; top: 50%; left: 50%; cursor: grab; -webkit-tap-highlight-color: transparent; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none;
  width: clamp(150px, 44vw, 300px); aspect-ratio: 4 / 5; will-change: transform; transition: transform .5s var(--hh-ease); }
.hh-arms.is-dragging .hh-hold { transition: none; cursor: grabbing; }
/* --gap 1 = far apart (prints at the screen edges), 0 = touching. */
.hh-holdL { transform: translate(calc(-100% + 14px - var(--gap) * min(19vw, 200px)), -50%) rotate(calc(-3deg - var(--gap) * 6deg)); }
.hh-holdR { transform: translate(calc(-14px + var(--gap) * min(19vw, 200px)), -46%) rotate(calc(3deg + var(--gap) * 6deg)); }
.hh-arms.is-met .hh-holdL { animation: hh-squeezeL .9s var(--hh-ease) both; }
.hh-arms.is-met .hh-holdR { animation: hh-squeezeR .9s var(--hh-ease) both; }
@keyframes hh-squeezeL { 40% { transform: translate(calc(-100% + 30px), -50%) rotate(-1deg) scale(1.03); } to { transform: translate(calc(-100% + 22px), -50%) rotate(-2.5deg); } }
@keyframes hh-squeezeR { 40% { transform: translate(-30px, -47%) rotate(1deg) scale(1.03); } to { transform: translate(-22px, -46%) rotate(2.5deg); } }
.hh-print2 { display: block; width: 100%; height: 100%; padding: 8px 8px 30px; box-sizing: border-box; border-radius: 3px; background: #F4EFE7;
  box-shadow: 0 30px 60px -24px rgba(0,0,0,.85), 0 2px 6px rgba(0,0,0,.35), inset 0 0 0 1px rgba(0,0,0,.06); }
.hh-printPic { display: block; width: 100%; height: 100%; overflow: hidden; background: #2a211b; filter: grayscale(1) contrast(1.08) brightness(.95); }
.hh-printName { display: grid; place-items: center; align-content: center; gap: 6px; width: 100%; height: 100%; background: radial-gradient(circle at 50% 40%, #5b4536, #2a1d16); filter: none; color: var(--hh-cloud); }
.hh-printName b { font: 400 76px/1 var(--hh-display); font-style: italic; }
.hh-printName i { font: 700 10px/1 var(--hh-ui); letter-spacing: .3em; text-transform: uppercase; font-style: normal; opacity: .7; }
.hh-pairGlow { position: absolute; left: 50%; top: 50%; width: 140%; max-width: 900px; aspect-ratio: 1; transform: translate(-50%, -50%); border-radius: 50%; z-index: -1; pointer-events: none;
  background: radial-gradient(circle, rgba(242,164,119,.30), rgba(242,164,119,0) 60%); animation: hh-fade 1.4s var(--hh-ease) both; }
.hh-armsHint { margin: 0; font: 700 11px/1 var(--hh-ui); letter-spacing: .3em; text-transform: uppercase; color: rgba(250,247,242,.55); }
.hh-armsHint::before { content: "←  "; } .hh-armsHint::after { content: "  →"; }
@media (min-width: 1024px) { .hh-pair { height: min(52svh, 520px); } .hh-hold { width: min(300px, 26vw); } .hh-holdL { transform: translate(calc(-100% + 14px - var(--gap) * 240px), -50%) rotate(calc(-3deg - var(--gap) * 6deg)); } .hh-holdR { transform: translate(calc(-14px + var(--gap) * 240px), -46%) rotate(calc(3deg + var(--gap) * 6deg)); } }
@media (prefers-reduced-motion: reduce) { .hh-arms.is-met .hh-holdL, .hh-arms.is-met .hh-holdR { animation: none; } .hh-hold { transition: none; } }
`;
