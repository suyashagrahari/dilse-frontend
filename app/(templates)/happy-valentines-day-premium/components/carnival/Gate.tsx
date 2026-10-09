"use client";

// The gate: her carnival ticket. Drag the stub to tear it (or tap the button): the striped curtains part and the
// song starts. Everything audible runs synchronously inside the tap/pointer-up (the engine's open()).

import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { burst, haptic, useReducedMotion } from "../../../_valentine/kit";
import { usePremium } from "../../../_valentine/kit/premium";
import { C, GIF, type Carnival } from "./model";
import { Gif, SlotGif, Spark } from "./ui";

const TEAR_AT = 64;

export default function Gate({ c, onOpen }: { c: Carnival; onOpen: () => void }) {
  const p = usePremium();
  const reduce = useReducedMotion();
  const [torn, setTorn] = useState(false);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [waited, setWaited] = useState(false);
  const start = useRef<{ x: number; y: number; id: number } | null>(null);
  const goneRef = useRef(false);

  useEffect(() => {
    const t = window.setTimeout(() => setWaited(true), 4000);
    return () => clearTimeout(t);
  }, []);
  const music = p.music;
  const tuning = !!music && music.mode === "youtube" && !music.ready && !waited;

  const tear = (quiet = false) => {
    if (goneRef.current) return;
    goneRef.current = true;
    // In the gesture: audio session, voice prime, YouTube unMute + playVideo.
    p.open({ quiet });
    if (!quiet) {
      p.sfx("paper-rustle", { gain: 0.9 });
      p.sfx("chime-cascade", { gain: 0.6 });
    }
    setTorn(true);
    haptic([15, 40, 25]);
    burst({ kind: "confetti", count: 70, colors: [C.primary, C.soft, C.pop, C.lav, "#FFFFFF", C.mint], origin: { x: 0.5, y: 0.5 } });
    window.setTimeout(onOpen, reduce ? 250 : 1100);
  };

  const onDown = (e: RPointerEvent<HTMLDivElement>) => {
    if (torn) return;
    start.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    p.sfx("tick", { gain: 0.3 });
  };
  const onMove = (e: RPointerEvent<HTMLDivElement>) => {
    const s = start.current;
    if (!s || s.id !== e.pointerId) return;
    setDrag({ x: Math.max(0, e.clientX - s.x), y: e.clientY - s.y });
  };
  const onUp = () => {
    const moved = Math.hypot(drag.x, drag.y);
    start.current = null;
    setDragging(false);
    // A far drag tears it; so does a plain tap (most people tap the stub before they think to drag it).
    if (moved > TEAR_AT || moved < 8) tear(false);
    else setDrag({ x: 0, y: 0 });
  };

  const pull = Math.min(1, Math.hypot(drag.x, drag.y) / TEAR_AT);
  const stubStyle = torn
    ? undefined
    : { transform: `translate(${drag.x * 0.6}px, ${drag.y * 0.4}px) rotate(${pull * 14}deg)`, transition: dragging ? "none" : undefined };

  return (
    <div className={`vc-gate${torn ? " is-torn" : ""}${reduce ? " is-reduced" : ""}`} role="dialog" aria-modal="true" aria-label={`A Valentine carnival for ${c.to}`}>
      <i className="vc-curtain is-l" aria-hidden />
      <i className="vc-curtain is-r" aria-hidden />
      <Bunting />
      <div className="vc-gateIn">
        <p className="vc-gateKick">
          <Spark className="vc-inlineSpark" color={C.primary} /> A carnival made just for <Spark className="vc-inlineSpark" color={C.primary} />
        </p>
        <h1 className="vc-gateName">
          {c.to}
          <svg className="vc-scribble" viewBox="0 0 200 18" preserveAspectRatio="none" aria-hidden>
            <path d="M4 12 C 40 2, 70 16, 100 9 S 160 3, 196 10" fill="none" stroke={C.primary} strokeWidth="4" strokeLinecap="round" />
          </svg>
        </h1>

        <div className="vc-ticketWrap">
          <SlotGif id="vc1-ticket" size={92} tilt={-8} float className="vc-gatePug" eager />
          <Gif src={GIF.bunnyHeart} size={78} tilt={8} float className="vc-gateBunny" eager />
          <div className="vc-ticket">
            <div className="vc-tBody">
              <span className="vc-tTop">★ Valentine Carnival ★</span>
              <b className="vc-tAdmit">ADMIT ONE</b>
              <span className="vc-tName">{c.to} ❤️</span>
              <span className="vc-tLine">{c.ticketLine}</span>
              <span className="vc-tFoot">
                <span>14 FEB · ALL DAY</span>
                <span>No. 0214</span>
              </span>
            </div>
            <div
              className={`vc-tStub${pull >= 1 ? " is-ready" : ""}`}
              style={stubStyle}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
              role="button"
              tabIndex={0}
              aria-label="Tear the stub (starts the music)"
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), tear(false))}
            >
              <span className="vc-stubKeep">KEEP ME</span>
              <span className="vc-stubHeart">♥</span>
              <span className="vc-stubCut">tear ✂</span>
            </div>
          </div>
        </div>
        <p className="vc-gateHint">Drag the stub to tear your ticket</p>

        <button type="button" className={`vc-puffy is-cherry vc-gateCta${tuning ? " is-tuning" : ""}`} onClick={() => tear(false)}>
          <span>Tear my ticket ✂️</span>
          {tuning && <small aria-live="polite">warming up the music…</small>}
        </button>
        <span className="vc-gateSeal">
          <i aria-hidden>✦</i> Hand-made for {c.to} by {c.from}
        </span>
        <button type="button" className="vc-quiet" onClick={() => tear(true)}>
          <span aria-hidden>🔇</span> Open quietly
        </button>
      </div>
    </div>
  );
}

/** Pastel pennant bunting across the top. */
export function Bunting({ className }: { className?: string }) {
  const cols = [C.primary, C.pop, C.lav, C.soft, C.mint, "#FF9E6B"];
  return (
    <svg className={`vc-bunting${className ? ` ${className}` : ""}`} viewBox="0 0 400 60" preserveAspectRatio="none" aria-hidden>
      <path d="M-4 6 Q 200 40 404 6" fill="none" stroke="#C9184A" strokeOpacity=".35" strokeWidth="1.6" />
      {Array.from({ length: 13 }, (_, i) => {
        const x = 8 + i * 31;
        const t = x / 400;
        const y = 6 + 4 * 34 * t * (1 - t) * 0.98;
        return <path key={i} d={`M${x - 11} ${y} L${x + 11} ${y + 1} L${x} ${y + 24} Z`} fill={cols[i % cols.length]} />;
      })}
    </svg>
  );
}
