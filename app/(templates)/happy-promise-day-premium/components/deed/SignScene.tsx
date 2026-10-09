"use client";

// Chapter VI · In witness whereof. The last clause ("And above all…") sits
// over two signature lines. The sender's signature writes itself in ink as
// the page settles; the recipient's line is a live pad: they sign with a
// finger (the pen scratches as they go), or tap "sign with my name".

import { useCallback, useEffect, useRef, useState } from "react";
import { haptic } from "../../../_valentine/kit";
import { PremiumCTA, sfx } from "../../../_valentine/kit/premium";
import { InkSignature } from "./art";
import { SERIF } from "./fonts";
import { SP, type Deed } from "./model";
import { PAD_ASPECT, drawInk, inkLength, inkToDataUrl, type Stroke } from "./signature";
import { CTA_STYLE, Eyebrow, Scene } from "./ui";

export interface SignResult {
  strokes: Stroke[];
  png: string;
  typed: boolean;
}

/** Their name, set in the deed's italic, as a signature image (the no-drawing path). */
function typedSignature(name: string): string {
  const c = document.createElement("canvas");
  c.width = 720;
  c.height = Math.round(720 / PAD_ASPECT);
  const ctx = c.getContext("2d");
  if (!ctx) return "";
  const root = document.querySelector(".sp-root");
  const fam = (root && getComputedStyle(root).getPropertyValue("--font-sp-serif").trim()) || "Georgia";
  let size = 130;
  ctx.font = `italic 500 ${size}px ${fam}, Georgia, serif`;
  while (ctx.measureText(name).width > 660 && size > 40) {
    size -= 6;
    ctx.font = `italic 500 ${size}px ${fam}, Georgia, serif`;
  }
  ctx.fillStyle = SP.navy;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(name, 360, c.height * 0.52);
  return c.toDataURL("image/png");
}

export default function SignScene({ d, onSigned }: { d: Deed; onSigned: (r: SignResult) => void }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const strokes = useRef<Stroke[]>([]);
  const live = useRef<{ x: number; y: number; t: number; w: number } | null>(null);
  const lastSfx = useRef(0);
  const [ink, setInk] = useState(0);

  const redraw = useCallback(() => {
    const c = canvas.current;
    if (!c) return;
    const r = c.getBoundingClientRect();
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (c.width !== Math.round(r.width * dpr)) {
      c.width = Math.round(r.width * dpr);
      c.height = Math.round(r.height * dpr);
    }
    const ctx = c.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, c.width, c.height);
    drawInk(ctx, strokes.current, 0, 0, c.width, c.height, SP.navy, Math.max(3, c.width * 0.0125));
  }, []);

  useEffect(() => {
    redraw();
    const on = () => redraw();
    window.addEventListener("resize", on);
    // The sender's pen, as their signature writes itself.
    const t = window.setTimeout(() => sfx("nib-scratch", { gain: 0.8 }), 700);
    const t2 = window.setTimeout(() => sfx("nib-scratch", { gain: 0.6, detune: 200 }), 1500);
    return () => {
      window.removeEventListener("resize", on);
      window.clearTimeout(t);
      window.clearTimeout(t2);
    };
  }, [redraw]);

  const at = (e: React.PointerEvent) => {
    const r = canvas.current!.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height, px: e.clientX, py: e.clientY };
  };
  const down = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    const p = at(e);
    live.current = { x: p.px, y: p.py, t: performance.now(), w: 0.8 };
    strokes.current.push([{ x: p.x, y: p.y, w: 0.8 }]);
    redraw();
  };
  const move = (e: React.PointerEvent) => {
    const L = live.current;
    if (!L) return;
    const p = at(e);
    const now = performance.now();
    const dist = Math.hypot(p.px - L.x, p.py - L.y);
    if (dist < 1.5) return;
    const v = dist / Math.max(1, now - L.t); // px per ms
    const w = L.w * 0.55 + Math.max(0, Math.min(1, 1 - v / 2.2)) * 0.45;
    live.current = { x: p.px, y: p.py, t: now, w };
    strokes.current[strokes.current.length - 1].push({ x: p.x, y: p.y, w });
    redraw();
    if (now - lastSfx.current > 130) {
      lastSfx.current = now;
      sfx("nib-scratch", { gain: Math.min(1, 0.35 + v * 0.4), detune: (Math.random() - 0.5) * 300 });
    }
  };
  const up = () => {
    if (!live.current) return;
    live.current = null;
    setInk(inkLength(strokes.current));
  };
  const clear = () => {
    strokes.current = [];
    setInk(0);
    redraw();
    sfx("paper-rustle", { gain: 0.5 });
  };
  const ready = ink > 0.45;
  const done = (typed: boolean) => {
    haptic([10, 40, 14]);
    if (typed) onSigned({ strokes: [], png: typedSignature(d.recipient), typed: true });
    else onSigned({ strokes: strokes.current.map((s) => s.slice()), png: inkToDataUrl(strokes.current, SP.navy), typed: false });
  };

  return (
    <Scene label="Sign the deed" className="sp-sg">
      <Eyebrow>In witness whereof</Eyebrow>
      <div className="sp-sgPage sp-paper sp-rise">
        <p className="sp-sgAbove">
          <span>And above all,</span> {d.bigPromise || "I promise to keep every one of these."}
        </p>
        <div className="sp-sgRow">
          <div className="sp-sgBlock">
            <div className="sp-sgSig">
              <InkSignature text={d.sender} delay={0.6} />
            </div>
            <div className="sp-sgLine" />
            <p className="sp-sgWho">
              <b>{d.sender}</b> · the Promisor
            </p>
          </div>
          <div className="sp-sgBlock">
            <div className={`sp-sgPad${ink ? " has-ink" : ""}`} style={{ aspectRatio: String(PAD_ASPECT) }}>
              <span className="sp-sgX" aria-hidden>
                ✕
              </span>
              {!ink && <span className="sp-sgHere">sign here</span>}
              <canvas
                ref={canvas}
                className="sp-sgCanvas"
                onPointerDown={down}
                onPointerMove={move}
                onPointerUp={up}
                onPointerCancel={up}
                onPointerLeave={up}
                aria-label={`Signature pad for ${d.recipient}. Draw your signature, or use the button to sign with your name.`}
                role="img"
              />
            </div>
            <div className="sp-sgLine" />
            <p className="sp-sgWho">
              <b>{d.recipient}</b> · the Promisee
            </p>
          </div>
        </div>
      </div>
      <div className="sp-foot">
        {ready ? (
          <PremiumCTA style={CTA_STYLE} tone="pearl" cue={null} onClick={() => done(false)}>
            I promise too
          </PremiumCTA>
        ) : (
          <p className="sp-sgHint">Sign with your finger</p>
        )}
        <div className="sp-sgAlt">
          {ink > 0 && (
            <button type="button" className="sp-quiet" onClick={clear}>
              Clear
            </button>
          )}
          {!ready && (
            <button type="button" className="sp-quiet" onClick={() => done(true)}>
              Sign with my name instead
            </button>
          )}
        </div>
      </div>
      <style>{CSS}</style>
    </Scene>
  );
}

const CSS = `
.sp-sg .sp-in { gap: 16px; }
@media (min-width: 768px) { .sp-sg .sp-in { justify-content: center; } .sp-sg .sp-foot { margin-top: 18px; } }
.sp-sgPage { width: min(680px, 100%); box-sizing: border-box; padding: clamp(24px, 6vw, 44px) clamp(20px, 6vw, 48px) 26px; }
.sp-sgAbove { margin: 0 auto 22px; max-width: 26ch; font: italic 400 clamp(21px, 5.8vw, 28px)/1.3 ${SERIF}; color: var(--sp-navy); text-wrap: balance; }
.sp-sgAbove span { display: block; margin-bottom: 6px; font: 600 12px/1 ${SERIF}; font-style: normal; font-variant: small-caps; letter-spacing: .2em; color: var(--sp-ox); }
.sp-sgRow { display: grid; gap: 18px; }
@media (min-width: 640px) { .sp-sgRow { grid-template-columns: 1fr 1fr; gap: 28px; align-items: end; } }
.sp-sgBlock { display: grid; justify-items: stretch; }
.sp-sgSig { height: 0; padding-bottom: calc(100% / ${PAD_ASPECT}); position: relative; }
.sp-sgSig .sp-sig { position: absolute; inset: 6% 4% 0; width: 92%; height: 94%; }
.sp-sgPad { position: relative; width: 100%; border-radius: 4px; background: rgba(28,37,65,.035); box-shadow: inset 0 0 0 1px rgba(28,37,65,.08); }
.sp-sgPad.has-ink { background: transparent; box-shadow: none; }
.sp-sgCanvas { position: absolute; inset: 0; width: 100%; height: 100%; touch-action: none; cursor: crosshair; }
.sp-sgX { position: absolute; left: 6px; bottom: 6px; font: 400 16px/1 var(--sp-type); color: var(--sp-ox); opacity: .7; pointer-events: none; }
.sp-sgHere { position: absolute; inset: 0; display: grid; place-items: center; font: italic 400 22px/1 ${SERIF}; color: rgba(28,37,65,.28); pointer-events: none; animation: sp-here 2.6s ease-in-out infinite; }
@keyframes sp-here { 0%, 100% { opacity: .55; } 50% { opacity: 1; } }
.sp-sgLine { height: 1px; background: rgba(28,37,65,.55); margin-top: 2px; }
.sp-sgWho { margin: 8px 0 0; text-align: left; font: 400 10.5px/1.2 var(--sp-type); letter-spacing: .16em; text-transform: uppercase; color: rgba(28,37,65,.6); }
.sp-sgWho b { color: var(--sp-navy); }
.sp-sgHint { margin: 0; min-height: 54px; display: grid; place-items: center; font: 700 11px/1 var(--sp-type); letter-spacing: .26em; text-transform: uppercase; color: rgba(245,239,226,.7); }
.sp-sgAlt { display: flex; gap: 4px; justify-content: center; flex-wrap: wrap; }
@media (prefers-reduced-motion: reduce) { .sp-sgHere { animation: none; } }
`;
