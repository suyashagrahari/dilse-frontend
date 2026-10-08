"use client";

// Scene 1 — "Tonight's Screening". The gate's sealed object is an ADMIT ONE ticket (the tap that starts the song
// is the kit's PremiumGate). After the tap: the projector lamp clunks on, its beam flickers through the dust and
// a film-leader counts 5-4-3-2 with a 1 kHz beep on each number (the "2" is the long one), then a white pop.

import { useEffect, useRef, useState, type ReactNode } from "react";
import { SkipChip, usePremium } from "../../../_valentine/kit/premium";
import { useReducedMotion } from "../../../_valentine/kit";

export function Ticket({ to, from, sticker }: { to: string; from: string; sticker: ReactNode }) {
  return (
    <div className="fm-ticketWrap">
      <div className="fm-ticket">
        <div className="fm-tMain">
          <span className="fm-tFine">Tonight&apos;s screening · Row L</span>
          <span className="fm-tAdmit">ADMIT ONE</span>
          <span className="fm-tName">{to}</span>
          <span className="fm-tFine">Seat: next to {from}</span>
        </div>
        <div className="fm-tStub"><b>No. 0214</b></div>
        <span className="fm-tSticker">{sticker}</span>
      </div>
    </div>
  );
}

const COUNT = [5, 4, 3, 2];

export function Leader({ onDone }: { onDone: () => void }) {
  const { sfx } = usePremium();
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);
  const [flash, setFlash] = useState(false);
  const done = useRef(onDone);
  useEffect(() => {
    done.current = onDone;
  });

  useEffect(() => {
    const step = reduce ? 650 : 900;
    const timers: number[] = [];
    COUNT.forEach((c, i) => {
      timers.push(window.setTimeout(() => {
        setN(i);
        sfx("film-beep", { dur: c === 2 ? 0.32 : 0.07, gain: 1.2 });
      }, 250 + i * step));
    });
    timers.push(window.setTimeout(() => setFlash(true), 250 + COUNT.length * step));
    timers.push(window.setTimeout(() => done.current(), 250 + COUNT.length * step + 380));
    return () => timers.forEach(clearTimeout);
  }, [sfx, reduce]);

  return (
    <div className="fm-leader" role="img" aria-label={`Film leader counting down: ${COUNT[n]}`}>
      <span className="fm-beam" aria-hidden />
      <div className="fm-ldr" aria-hidden>
        <svg viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="92" fill="none" stroke="rgba(244,234,214,.75)" strokeWidth="2" />
          <circle cx="100" cy="100" r="74" fill="none" stroke="rgba(244,234,214,.55)" strokeWidth="1.5" />
          <line x1="0" y1="100" x2="200" y2="100" stroke="rgba(244,234,214,.45)" strokeWidth="1" />
          <line x1="100" y1="0" x2="100" y2="200" stroke="rgba(244,234,214,.45)" strokeWidth="1" />
          {!reduce && (
            <g className="fm-ldrSweep" key={n}>
              <path d="M100 100 L100 8 A92 92 0 0 1 192 100 Z" fill="rgba(244,234,214,.16)" />
            </g>
          )}
        </svg>
        <span className="fm-ldrNum" key={`n${n}`}>{COUNT[n]}</span>
      </div>
      <span className={`fm-ldrFlash${flash ? " is-on" : ""}`} aria-hidden />
      <SkipChip onSkip={() => done.current()} label="Skip ▸" delay={900} />
    </div>
  );
}
