"use client";

// ─── The garden gate (the opening) ──────────────────────────────────────────
//
// A pastel sky, two cloud banks and a gate of flowering peony trees, lanterns
// hanging as a mirrored pair at the top corners, lotus at the foot. In the middle a rounded ivory card
// under the gold lattice crown: "॥ श्री गणेशाय नमः ॥", the guest's own greeting
// (?to=), the names, the date and a lotus seal to tap. The tap is also the
// gesture that starts the music (DayMusic listens for the first tap).
//
//   0.00 s  the seal presses, petals burst from it, a soft light blooms behind the card
//   0.05 s  the card settles back and fades; the peony trees part like gate doors
//   0.15 s  the clouds part (they slide out and grow, as if we fly through)
//   0.20 s  the lanterns rise away, the veil thins to the garden below
//   2.00 s  the gate layer is removed
//
// The gate's own art is decoded before it fades in, and the garden under it
// (already mounted) is decoded while the guest reads the card, so the reveal's
// first frames never stall. Transform/opacity only. Reduced motion: a 400 ms
// cross-fade.

import { useEffect, useRef, useState } from "react";
import { useWeddingReducedMotion } from "../../../_wedding";
import { GW, gwImg } from "../assets";
import { decodeAll } from "./art";
import type { Strings } from "./model";
import Petals from "./Petals";

export interface GateProps {
  first: string;
  second: string;
  dateLine: string;
  guest: string;
  s: Strings;
  lang: "en" | "hi";
  invocation: boolean;
  onOpened: () => void;
}

type Phase = "closed" | "opening" | "gone";

export function LotusSeal({ size = 64 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden focusable="false">
      <defs>
        <radialGradient id="gw-seal-g" cx="50%" cy="38%" r="70%">
          <stop offset="0" stopColor="#fff6f7" />
          <stop offset=".55" stopColor="#f6c9d4" />
          <stop offset="1" stopColor="#d98aa0" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#gw-seal-g)" />
      <circle cx="32" cy="32" r="26.5" fill="none" stroke="#c08a5c" strokeWidth="1.4" strokeDasharray="2 2.6" />
      <g fill="#fff" stroke="#b4596c" strokeWidth="1.1" strokeLinejoin="round">
        <path d="M32 18c5 5.5 5 13 0 20-5-7-5-14.5 0-20z" />
        <path d="M32 38c-2.5-6-8.5-10-15-10 1.5 7 7.5 11 15 10z" />
        <path d="M32 38c2.5-6 8.5-10 15-10-1.5 7-7.5 11-15 10z" />
        <path d="M32 38c-5.5-2.6-11.5-1.6-15.5 2.6 5.2 3.4 11.4 2.8 15.5-2.6zM32 38c5.5-2.6 11.5-1.6 15.5 2.6-5.2 3.4-11.4 2.8-15.5-2.6z" />
      </g>
      <path d="M22 45.5h20" stroke="#c08a5c" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export default function Gate({ first, second, dateLine, guest, s, lang, invocation, onOpened }: GateProps) {
  const reduce = useWeddingReducedMotion();
  const [phase, setPhase] = useState<Phase>("closed");
  const [ready, setReady] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  // The page stays still behind the closed gate.
  useEffect(() => {
    if (phase === "gone") return;
    const el = document.documentElement;
    const prev = el.style.overflow;
    el.style.overflow = "hidden";
    return () => {
      el.style.overflow = prev;
    };
  }, [phase]);

  // Decode the gate's art, then fade it in; meanwhile warm the garden below.
  useEffect(() => {
    let live = true;
    const own = Array.from(ref.current?.querySelectorAll<HTMLImageElement>("img") ?? []);
    void decodeAll(own, 1400).then(() => live && setReady(true));
    const garden = Array.from(document.querySelectorAll<HTMLImageElement>(".gw-hero img"));
    void decodeAll(garden, 4000);
    const list = timers.current;
    return () => {
      live = false;
      list.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  const later = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));

  const open = () => {
    if (phase !== "closed") return;
    try {
      navigator.vibrate?.(14);
    } catch {}
    setPhase("opening");
    onOpened();
    later(reduce ? 420 : 2000, () => setPhase("gone"));
  };

  if (phase === "gone") return null;
  return (
    <div ref={ref} className={`gw-gate is-${phase}${ready ? " is-ready" : ""}${reduce ? " is-reduced" : ""}`} data-gw-gate={phase}>
      <div className="gw-gate-veil" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img className="gw-gate-sky" {...gwImg(GW.sky, { high: true })} />
      </div>
      <span className="gw-gc gw-gc-l" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...gwImg(GW.cloudA, { high: true })} />
      </span>
      <span className="gw-gc gw-gc-r" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...gwImg(GW.cloudB)} />
      </span>
      <span className="gw-gleaf gw-gleaf-l" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img className="gw-gleaf-tree" {...gwImg(GW.peonyL, { high: true, hi: GW.peonyL2x, sizes: "300px" })} />
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img className="gw-gleaf-flower" {...gwImg(GW.anthurium)} />
      </span>
      <span className="gw-gleaf gw-gleaf-r" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img className="gw-gleaf-tree" {...gwImg(GW.peonyR, { high: true, hi: GW.peonyR2x, sizes: "300px" })} />
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img className="gw-gleaf-flower" {...gwImg(GW.rose)} />
      </span>
      <span className="gw-ghang gw-ghang-l" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...gwImg(GW.lanterns)} />
      </span>
      <span className="gw-ghang gw-ghang-r" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...gwImg(GW.lanterns)} />
      </span>
      <span className="gw-gfoot" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...gwImg(GW.lotus)} />
      </span>

      <div className="gw-gcard">
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img className="gw-gcard-crown" {...gwImg(GW.archCrown, { high: true })} />
        <div className="gw-gcard-in">
          {invocation && (
            <p className="gw-mantra" lang="hi">
              ॥ श्री गणेशाय नमः ॥
            </p>
          )}
          {guest ? (
            <p className="gw-dear">
              <span lang={lang}>{s.dear}</span> <b>{guest}</b>,<br />
              <span lang={lang}>{s.invitedYou}</span>
            </p>
          ) : (
            <p className="wk-eyebrow gw-gcard-k" lang={lang}>
              {s.together}
            </p>
          )}
          <p className="gw-gnames">
            <span>{first}</span>
            <i aria-hidden>&amp;</i>
            <span>{second}</span>
          </p>
          {dateLine && <p className="gw-gdate">{dateLine}</p>}
          <button type="button" className="gw-gseal" onClick={open} aria-label={`${s.open}: ${first} ${s.and} ${second}`}>
            <span className="gw-gseal-ring" aria-hidden />
            <LotusSeal size={70} />
          </button>
          <button type="button" className="gw-gcta" onClick={open} lang={lang} tabIndex={-1}>
            {s.open}
          </button>
        </div>
      </div>
      <div className="gw-gbloom" aria-hidden />
      {ready && phase === "closed" && <Petals mode="drift" count={8} seed={3} />}
      {phase === "opening" && !reduce && <Petals mode="burst" count={26} seed={11} className="gw-gate-burst" />}
    </div>
  );
}
