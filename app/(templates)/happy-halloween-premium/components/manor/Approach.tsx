"use client";

// Room 1 — The Approach. The invitation reads itself aloud in gold
// ("{sender} requests the pleasure of your company… at the midnight ball of
// {manor}"), then the iron gate: drag it open (the creak's pitch follows the
// finger's speed), or tap "Push the gate". Past 60% it swings by itself, a
// flock of bats leaves the tower, and the path to the door lights up.

import { useEffect, useRef, useState, type ReactNode } from "react";
import { sfx, KineticName } from "../../../_valentine/kit/premium";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import { Bat, GateLeaf } from "./art";
import { BOOK, ENGRAVED, SCRIPT } from "./fonts";
import type { Manor } from "./model";
import { Gilded, Hint, Kicker, Quiet, Room } from "./ui";

export default function Approach({ m, sticker, onOpened, onNext }: { m: Manor; sticker: ReactNode; onOpened: () => void; onNext: () => void }) {
  const reduce = useReducedMotion();
  const [line, setLine] = useState(reduce ? 4 : 0);
  const [prog, setProg] = useState(0);
  const [open, setOpen] = useState(false);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ x: number; y: number; base: number; lastT: number; lastX: number; lastY: number; creakAt: number } | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const touched = useRef(false);

  // The wind under the approach.
  useEffect(() => {
    const wind = sfx("wind-bed", { gain: 0.8 });
    return () => wind.stop(900);
  }, []);

  // The invitation's lines, one by one, each with a soft low boom.
  useEffect(() => {
    if (reduce) return;
    const ts = [400, 1500, 2700, 3700].map((ms, i) =>
      window.setTimeout(() => {
        setLine(i + 1);
        if (i === 1 || i === 3) sfx("mm-title", { gain: i === 1 ? 0.75 : 0.5 });
      }, ms),
    );
    return () => ts.forEach(clearTimeout);
  }, [reduce]);

  const swing = () => {
    if (open) return;
    setOpen(true);
    setProg(1);
    haptic([12, 40, 20]);
    sfx("creak", { dur: 1.4, detune: -200, gain: 0.9 });
    sfx("mm-bats", { at: 0.35 });
    onOpened();
  };

  // Untouched for a while → the gate opens on its own (the manor is expecting them).
  useEffect(() => {
    if (open) return;
    const t = window.setTimeout(() => {
      if (!touched.current) swing();
    }, 9000);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const onDown = (e: React.PointerEvent) => {
    if (open) return;
    touched.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    drag.current = { x: e.clientX, y: e.clientY, base: prog, lastT: performance.now(), lastX: e.clientX, lastY: e.clientY, creakAt: 0 };
    setDragging(true);
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || open) return;
    const w = stage.current?.clientWidth || 300;
    const dist = Math.max(Math.abs(e.clientX - d.x), Math.abs(e.clientY - d.y) * 0.9);
    const next = Math.min(1, d.base + dist / (w * 0.5));
    setProg(next);
    const now = performance.now();
    const v = Math.hypot(e.clientX - d.lastX, e.clientY - d.lastY) / Math.max(1, now - d.lastT);
    d.lastT = now;
    d.lastX = e.clientX;
    d.lastY = e.clientY;
    if (now - d.creakAt > 260 && v > 0.05) {
      d.creakAt = now;
      sfx("creak", { dur: 0.42, detune: Math.min(700, v * 500) - 150, gain: 0.55 + Math.min(0.4, v * 0.3) });
    }
    if (next >= 0.62) {
      drag.current = null;
      setDragging(false);
      swing();
    }
  };
  const onUp = () => {
    if (!drag.current) return;
    drag.current = null;
    setDragging(false);
    if (!open) setProg((v) => (v >= 0.6 ? 1 : v * 0.6));
  };

  const ang = prog * 76;
  return (
    <Room label="The approach to the manor" className="mm-approach" top={110}>
      <div className="mm-invite" aria-live="polite">
        <Kicker style={{ opacity: line >= 1 ? 0.92 : 0, transition: "opacity .9s" }}>{m.sender} requests the pleasure of your company</Kicker>
        <KineticName text={m.recipient} gilt play={line >= 2} size="clamp(42px, 13vw, 76px)" font={SCRIPT} color="#FFF4DA" as="h1" />
        <p className="mm-inviteAt" style={{ opacity: line >= 3 ? 1 : 0 }}>
          at the midnight ball of <b style={{ font: `700 1.05em ${ENGRAVED}` }}>{m.manorName}</b>
        </p>
        <p className="mm-inviteNight" style={{ opacity: line >= 4 ? 1 : 0, fontFamily: BOOK }}>
          “{m.nightTitle}” · tonight, until the clock strikes twelve
        </p>
      </div>

      <div
        ref={stage}
        className={`mm-gateStage${open ? " is-open" : ""}${dragging ? " is-drag" : ""}`}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
        role="img"
        aria-label={open ? "The gate is open" : "An iron gate. Drag it open, or use the button below."}
      >
        <div className="mm-path" style={{ opacity: 0.25 + prog * 0.75 }} />
        <div className="mm-peek" style={{ opacity: open ? 1 : 0, transform: open ? "translateY(0)" : "translateY(30px)" }}>
          {sticker}
        </div>
        <div className="mm-leaf is-left" style={{ transform: `rotateY(${-ang}deg)`, transition: dragging ? "none" : undefined }}>
          <GateLeaf side="left" />
        </div>
        <div className="mm-leaf is-right" style={{ transform: `rotateY(${ang}deg)`, transition: dragging ? "none" : undefined }}>
          <GateLeaf side="right" />
        </div>
        <div className="mm-plaque" style={{ opacity: 1 - prog * 0.9 }}>
          <span>{m.manorName}</span>
        </div>
        {open && !reduce && (
          <div className="mm-flock" aria-hidden>
            {Array.from({ length: 9 }, (_, i) => (
              <span key={i} style={{ ["--dx" as string]: `${(i - 4) * 34 + (i % 2 ? 18 : -12)}vw`, ["--dy" as string]: `${-40 - (i % 3) * 14}vh`, animationDelay: `${300 + i * 70}ms` }}>
                <Bat size={26 + (i % 3) * 8} />
              </span>
            ))}
          </div>
        )}
      </div>

      {open ? (
        <Gilded big onClick={() => { sfx("whoosh", { gain: 0.6 }); onNext(); }}>Step inside →</Gilded>
      ) : (
        <>
          <Hint>Drag the gate open</Hint>
          <Quiet onClick={() => { touched.current = true; swing(); }}>Push the gate</Quiet>
        </>
      )}
      <style>{CSS}</style>
    </Room>
  );
}

const CSS = `
.mm-approach { justify-content: flex-start; gap: 10px; }
.mm-invite { display: grid; justify-items: center; gap: 6px; min-height: 180px; }
.mm-inviteAt { margin: 0; font: 400 15px/1.4 var(--vw-font-ui, system-ui), sans-serif; color: var(--vw-ink); transition: opacity .9s; letter-spacing: .02em; }
.mm-inviteNight { margin: 0; font-size: 16px; font-style: italic; color: var(--vw-gold); transition: opacity .9s; }
.mm-gateStage { position: relative; width: min(340px, 86vw); height: min(300px, 40vh); min-height: 220px; perspective: 800px; touch-action: none; cursor: grab;
  margin-top: 6px; -webkit-user-select: none; user-select: none; }
.mm-gateStage.is-drag { cursor: grabbing; }
.mm-gateStage.is-open { cursor: default; }
.mm-path { position: absolute; left: 22%; right: 22%; bottom: 0; top: 18%; border-radius: 50% 50% 0 0;
  background: radial-gradient(70% 90% at 50% 100%, rgba(255,200,107,.55), rgba(255,122,47,.16) 55%, transparent 80%); transition: opacity .6s; }
.mm-peek { position: absolute; left: 50%; bottom: 8%; margin-left: -40px; transition: opacity .8s .5s, transform .8s .5s cubic-bezier(.22,1,.36,1); }
.mm-leaf { position: absolute; top: 0; bottom: 0; width: 50%; transition: transform 1.3s cubic-bezier(.3,.7,.2,1); will-change: transform; }
.mm-leaf.is-left { left: 0; transform-origin: 0 50%; }
.mm-leaf.is-right { right: 0; transform-origin: 100% 50%; }
.mm-plaque { position: absolute; left: 50%; top: 52%; transform: translate(-50%, -50%); max-width: 74%; padding: 7px 14px; border-radius: 6px;
  background: linear-gradient(180deg, #2C2338, #1A1424); border: 2px solid #9A6A1F; box-shadow: 0 8px 20px rgba(0,0,0,.5); transition: opacity .5s; pointer-events: none; }
.mm-plaque span { display: block; font: 700 12.5px/1.2 ${ENGRAVED}; letter-spacing: .12em; text-transform: uppercase; color: #F4D58D; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.mm-flock { position: fixed; left: 50%; top: 52%; z-index: 30; pointer-events: none; }
.mm-flock span { position: absolute; left: 0; top: 0; opacity: 0; animation: mm-flock 2.2s cubic-bezier(.3,.6,.4,1) forwards; }
@keyframes mm-flock { 0% { opacity: 0; transform: translate(0,0) scale(.3); } 12% { opacity: 1; } 85% { opacity: 1; } 100% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(1.1); } }
.mm-batWing { animation: mm-flap .16s ease-in-out infinite alternate; transform-origin: 32px 14px; }
@keyframes mm-flap { from { transform: scaleY(1); } to { transform: scaleY(.45); } }
@media (min-width: 768px) { .mm-gateStage { width: 380px; height: 330px; } }
@media (max-height: 700px) { .mm-invite { min-height: 150px; } .mm-gateStage { height: 34vh; } }
@media (prefers-reduced-motion: reduce) { .mm-leaf { transition: transform .3s ease; } .mm-batWing { animation: none; } }
`;
