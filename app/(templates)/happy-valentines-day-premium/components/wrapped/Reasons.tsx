"use client";

// ─── 6 · Reasons, fast-cut over their photos ───────────────────────────────────
// Tap = the next cut (a white flash, a snap, a new colour). Hold = it plays itself, one cut every 700 ms, the
// way you'd hold a Wrapped story. Each reason owns one palette colour, used as a duotone tint on its photo and as
// the highlighter behind its words.

import { useCallback, useEffect, useRef, useState } from "react";
import { CinematicPhoto, usePremium } from "../../../_valentine/kit/premium";
import { C, reasonPhotos } from "./model";
import type { SlideProps } from "./ui";

const TINTS = [C.tomato, C.lilac, C.pink, C.butter, C.tomato];

export default function Reasons({ w, ready }: SlideProps) {
  const { sfx } = usePremium();
  const reasons = w.reasons;
  const n = reasons.length;
  const photos = reasonPhotos(w.photos, n);
  const [i, setI] = useState(0);
  const [cut, setCut] = useState(0);
  const iRef = useRef(0);
  const hold = useRef<{ t: number; id: number } | null>(null);
  const finished = useRef(false);

  // Pre-decode the next photo so a cut never lands on an empty frame.
  useEffect(() => {
    const nx = photos[i + 1];
    if (!nx?.url) return;
    const im = new Image();
    im.src = nx.url;
    im.decode?.().catch(() => {});
  }, [i, photos]);

  const step = useCallback(() => {
    if (iRef.current >= n - 1) return false;
    iRef.current += 1;
    setI(iRef.current);
    setCut((c) => c + 1);
    sfx("snap", { gain: 0.65, detune: iRef.current * 90 });
    navigator.vibrate?.(6);
    if (iRef.current === n - 1 && !finished.current) {
      finished.current = true;
      window.setTimeout(ready, 600);
    }
    return true;
  }, [n, ready, sfx]);

  useEffect(() => {
    if (n <= 1) ready();
  }, [n, ready]);

  const stopHold = () => {
    if (hold.current) clearInterval(hold.current.id);
    hold.current = null;
  };
  useEffect(() => stopHold, []);

  const down = () => {
    stopHold();
    const id = window.setInterval(() => {
      if (!step()) stopHold();
    }, 700);
    hold.current = { t: performance.now(), id };
  };
  const up = () => {
    const h = hold.current;
    stopHold();
    // A short press is a tap: one cut.
    if (h && performance.now() - h.t < 260) step();
  };

  const tint = TINTS[i % TINTS.length];
  const p = photos[i];
  return (
    <div
      className="uw-slide uw-reasons"
      role="button"
      tabIndex={0}
      aria-label={`Reason ${i + 1} of ${n}: ${reasons[i]}. Tap for the next one.`}
      onPointerDown={down}
      onPointerUp={up}
      onPointerLeave={stopHold}
      onPointerCancel={stopHold}
      onContextMenu={(e) => e.preventDefault()}
      onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); step(); } }}
    >
      <div className="uw-cut" key={cut} style={{ background: tint }}>
        {p && <CinematicPhoto photo={p} grade="none" kenBurns="in" drift={6} focusPull={false} frame="full" caption="" eager alt="" style={{ position: "absolute", inset: 0, height: "100%" }} />}
        <span className="uw-cutTint" style={{ background: tint }} aria-hidden />
        <span className="uw-cutScrim" aria-hidden />
        <div className="uw-cutText" style={{ ["--c" as string]: tint }}>
          <p className="uw-eyebrow">Reason no. {i + 1}</p>
          <p><span>{reasons[i]}</span></p>
        </div>
        {cut > 0 && <span className="uw-cutFlash" aria-hidden />}
      </div>
      <div className="uw-dots" aria-hidden>
        {reasons.map((_, k) => <i key={k} className={k <= i ? "is-on" : ""} />)}
      </div>
      {i < n - 1 && <span className="uw-cutHint" aria-hidden>Tap · or hold</span>}
    </div>
  );
}
