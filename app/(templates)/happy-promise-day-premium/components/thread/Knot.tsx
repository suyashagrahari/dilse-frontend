"use client";

// ─── Scene: the other end — THE drop ───────────────────────────────────────
//
// The sender's hand arrives from the top; both threads run into a loose
// figure-eight that cinches through the riser. On the song's peak: a white
// flash, the thread turns molten gold from the knot outward, and "I promise"
// writes itself with a spark at the pen tip; the big promise fades in below.
// Tap the knot to cinch it again.

import { useEffect, useRef, useState } from "react";
import { haptic } from "../../../_valentine/kit";
import { Letterbox, useSongDrop } from "../../../_valentine/kit/premium";
import { Hand } from "./art";
import type { SceneProps } from "./shared";

const MY = "M60 300 C 70 250, 120 210, 150 176";
const THEIRS = "M240 40 C 230 90, 180 130, 150 164";
const MY_OUT = "M150 176 C 120 210, 70 250, 60 300";
const THEIRS_OUT = "M150 164 C 180 130, 230 90, 240 40";
const KNOT = "M150 170 C 120 140, 120 200, 150 170 C 180 140, 180 200, 150 170";

export default function Knot({ data, x, color, hi, reduced, sfx, sticker, next, onPeak }: SceneProps & { onPeak: () => void }) {
  const [phase, setPhase] = useState<"arrive" | "cinch" | "gold">(reduced ? "cinch" : "arrive");
  const [again, setAgain] = useState(0);
  const { drop } = useSongDrop();
  const timers = useRef<number[]>([]);
  useEffect(() => {
    timers.current.push(
      window.setTimeout(() => {
        setPhase("cinch");
        sfx("tp-cinch");
        haptic([20, 30, 60]);
        drop(() => {
          setPhase("gold");
          sfx("tp-flash");
          sfx("tp-ignite", { at: 0.15 });
          sfx("tp-pen", { dur: 2.4, at: 0.9 });
          onPeak();
        });
      }, reduced ? 100 : 1300),
    );
    const t = timers.current;
    return () => t.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const recinch = () => {
    if (phase !== "gold") return;
    setAgain((a) => a + 1);
    sfx("tp-cinch", { gain: 0.8 });
    haptic([20, 30, 60]);
  };
  const gold = phase === "gold";
  return (
    <section className="tp-sec">
      <Letterbox show={phase === "cinch" && !reduced} />
      <header className="tp-head">
        <p className="tp-kick">{gold ? "Both ends tied" : "The other end"}</p>
        <h2 className="tp-h">{gold ? "" : `…was always ${data.senderName || "me"}.`}</h2>
      </header>
      <div className={`tp-knot is-${phase}`}>
        <Hand color={color} className="tp-knotHand is-mine" loop={false} />
        <Hand color={color} flip className="tp-knotHand is-theirs" loop={false} />
        <svg viewBox="0 0 300 340" className="tp-knotSvg" aria-hidden>
          <defs>
            <linearGradient id="tp-molten" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stopColor="#FFF1BF" />
              <stop offset=".45" stopColor="#F2C14E" />
              <stop offset="1" stopColor="#B07D22" />
            </linearGradient>
          </defs>
          <path d={MY} stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" className="tp-th" />
          <path d={THEIRS} stroke={color} strokeWidth="4" fill="none" strokeLinecap="round" className="tp-th" />
          <g key={again} className="tp-knotG" onClick={recinch}>
            <path d={KNOT} stroke={gold ? "url(#tp-molten)" : color} strokeWidth="5" fill="none" strokeLinecap="round" />
            <path d={KNOT} stroke={hi} strokeOpacity=".6" strokeWidth="1.4" fill="none" />
          </g>
          {gold && (
            <>
              <path d={MY_OUT} stroke="url(#tp-molten)" strokeWidth="4.4" fill="none" strokeLinecap="round" pathLength={1} className="tp-goldRun" />
              <path d={THEIRS_OUT} stroke="url(#tp-molten)" strokeWidth="4.4" fill="none" strokeLinecap="round" pathLength={1} className="tp-goldRun" />
            </>
          )}
        </svg>
        {gold && <span className="tp-flash" aria-hidden />}
        <button type="button" className="tp-knotTap" onClick={recinch} aria-label="Tighten the knot again" disabled={!gold} />
      </div>
      <div className="tp-promiseWrap" aria-live="polite">
        {gold && (
          <>
            <svg viewBox="0 0 340 90" className="tp-iPromise" role="img" aria-label="I promise">
              <text x="170" y="64" textAnchor="middle">
                I promise
              </text>
            </svg>
            {!reduced && <span className="tp-pen" aria-hidden />}
            <p className="tp-big">{x.bigPromise || "Wherever life pulls us, I'll be on the other end of this thread."}</p>
          </>
        )}
      </div>
      <div className="tp-actions">
        {gold && (
          <>
            <span className="tp-stick">{sticker("pp3-knot", 64)}</span>
            <button type="button" className="tp-btn" onClick={() => { sfx("whoosh", { gain: 0.5 }); next(); }}>
              Thread the promises →
            </button>
          </>
        )}
      </div>
    </section>
  );
}
