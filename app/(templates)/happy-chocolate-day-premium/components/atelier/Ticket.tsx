"use client";

// ─── Scene 6: The Golden Ticket — peel the wrapper (drag down), a ticket glints out

import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { haptic } from "../../../_valentine/kit";
import { SkipChip } from "../../../_valentine/kit/premium";
import type { SceneProps } from "./shared";

export function GoldenTicket({ promise, sender, recipient, small }: { promise: string; sender: string; recipient: string; small?: boolean }) {
  return (
    <div className={`mc-ticket${small ? " is-small" : ""}`} role="img" aria-label={`Golden ticket: admit one. ${promise}. Valid forever, issued by ${sender}.`}>
      <div className="mc-ticketMain">
        <span className="mc-ticketKick">✦ Admit one ✦</span>
        <b className="mc-ticketPromise">{promise}</b>
        <span className="mc-ticketFine">valid forever · issued by {sender || "me"}</span>
      </div>
      <div className="mc-ticketStub">
        <span>Redeem with</span>
        <b>{sender || "me"}</b>
        <small>for {recipient || "you"}</small>
      </div>
      <span className="mc-ticketSheen" aria-hidden />
    </div>
  );
}

export default function Ticket({ data, x, reduced, sfx, sticker, next }: SceneProps) {
  const [p, setP] = useState(0);
  const [done, setDone] = useState(false);
  const drag = useRef<{ y: number; p: number; last: number } | null>(null);
  const bar = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const finish = () => {
    if (done) return;
    setP(1);
    setDone(true);
    sfx("choc-crinkle");
    timers.current.push(window.setTimeout(() => sfx("choc-shimmer"), reduced ? 50 : 450));
    haptic([15, 40, 15]);
  };
  const down = (e: RPointerEvent<HTMLDivElement>) => {
    if (done) return;
    e.currentTarget.setPointerCapture?.(e.pointerId);
    drag.current = { y: e.clientY, p, last: 0 };
  };
  const move = (e: RPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || done) return;
    const h = bar.current?.clientHeight ?? 300;
    const np = Math.max(0, Math.min(1, d.p + (e.clientY - d.y) / (h * 0.75)));
    setP(np);
    const now = performance.now();
    if (now - d.last > 70 && Math.abs(np - p) > 0.004) {
      d.last = now;
      sfx("choc-crinkle", { gain: 0.6 + Math.min(1, Math.abs(np - p) * 30) * 0.6 });
    }
    if (np > 0.68) {
      drag.current = null;
      finish();
    }
  };
  const up = () => {
    drag.current = null;
    if (!done) setP((v) => (v > 0.5 ? v : 0));
  };

  const promise = x.ticketPromise || "One date of your choosing. My treat.";

  return (
    <section className="mc-sec">
      <header className="mc-head">
        <p className="mc-kick">{done ? "You found it" : "One last thing"}</p>
        <h2 className="mc-h">{done ? "The golden ticket" : "Unwrap me."}</h2>
        <p className="mc-sub">{done ? "It's real. Keep it. Redeem it." : "Drag the wrapper down."}</p>
      </header>
      <div className={`mc-barStage${done ? " is-done" : ""}`}>
        <div ref={bar} className="mc-bar" onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} style={{ touchAction: "none" }} aria-hidden>
          <div className="mc-barChoc">
            {Array.from({ length: 8 }, (_, i) => (
              <span key={i} />
            ))}
          </div>
          <div className="mc-foil" style={{ transform: `translateY(${done ? 104 : p * 18}%)` }} />
          <div className="mc-wrap" style={{ transform: `translateY(${p * 104}%) rotate(${p * 4}deg)` }}>
            <span className="mc-wrapCurl" style={{ opacity: Math.min(1, p * 4) }} />
            <span className="mc-wrapBrand">Atelier</span>
            <span className="mc-wrapName">{data.senderName || "for you"}</span>
            <span className="mc-wrapNo">Nº 1 · midnight batch</span>
            <span className="mc-wrapPull">▼ pull ▼</span>
          </div>
        </div>
        {done && (
          <div className="mc-ticketRise">
            <GoldenTicket promise={promise} sender={data.senderName} recipient={data.recipientName} />
          </div>
        )}
      </div>
      <div className="mc-actions">
        {!done ? (
          <button type="button" className="mc-btn is-ghost" onClick={finish}>
            Unwrap it for me
          </button>
        ) : (
          <>
            <span className="mc-stick">{sticker("pc4-ticket", 76)}</span>
            <button type="button" className="mc-btn" onClick={next}>
              There's a note too →
            </button>
          </>
        )}
      </div>
      {!done && <SkipChip onSkip={finish} delay={3000} />}
    </section>
  );
}
