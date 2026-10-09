"use client";

// The gate: her golden ticket. She scratches the gold foil to see who's invited ("ADMIT ONE: Riya"); lifting her finger
// once enough gold is off opens the factory gates and starts the song. The big button does the same in one tap.
// Everything audible runs synchronously inside the pointer-up / click (the engine's open()).

import { useEffect, useRef, useState } from "react";
import { ScratchCanvas, burst, haptic, useReducedMotion } from "../../../_valentine/kit";
import { usePremium } from "../../../_valentine/kit/premium";
import { CONFETTI, C, GIF, type Factory } from "./model";
import { Gif, SlotGif, Spark, Truffle } from "./ui";
import { LOOKS } from "./model";

/** Hoisted: ScratchCanvas repaints its foil whenever `cover` changes identity. */
const FOIL = ["#E9B949", "#FFE9A8"] as const;

export default function Gate({ f, onOpen }: { f: Factory; onOpen: () => void }) {
  const p = usePremium();
  const reduce = useReducedMotion();
  const [gone, setGone] = useState(false);
  const [scratched, setScratched] = useState(0);
  const [waited, setWaited] = useState(false);
  const readyRef = useRef(false);
  const goneRef = useRef(false);

  useEffect(() => {
    const t = window.setTimeout(() => setWaited(true), 4000);
    return () => clearTimeout(t);
  }, []);
  const music = p.music;
  const tuning = !!music && music.mode === "youtube" && !music.ready && !waited;

  const enter = (quiet = false) => {
    if (goneRef.current) return;
    goneRef.current = true;
    // In the gesture: audio session, voice prime, YouTube unMute + playVideo.
    p.open({ quiet });
    if (!quiet) {
      p.sfx("chime-cascade", { gain: 0.6 });
      p.sfx("sf-ding", { gain: 0.5 });
    }
    setGone(true);
    haptic([15, 40, 25]);
    burst({ kind: "confetti", count: 80, colors: [...CONFETTI], origin: { x: 0.5, y: 0.45 } });
    window.setTimeout(onOpen, reduce ? 250 : 1150);
  };

  // The scratch reaches its threshold mid-stroke; the gate opens on the pointer-up / click that follows, which is a
  // real user activation (YouTube needs one to start with sound).
  const onProgress = (v: number) => {
    setScratched(v);
    if (v >= 1 && !readyRef.current) {
      readyRef.current = true;
      // The canvas (and its pointer capture) can vanish before the finger lifts: catch that pointer-up anywhere.
      window.addEventListener("pointerup", () => enter(false), { once: true, capture: true });
    }
  };
  const maybeEnter = () => {
    if (readyRef.current) enter(false);
  };

  return (
    <div className={`sf-gate${gone ? " is-gone" : ""}${reduce ? " is-reduced" : ""}`} role="dialog" aria-modal="true" aria-label={`A chocolate factory for ${f.to}`}>
      <FactorySkyline className="sf-gateSky" />
      <i className="sf-gateDoor is-l" aria-hidden />
      <i className="sf-gateDoor is-r" aria-hidden />
      <div className="sf-gateIn">
        <p className="sf-gateKick">
          <Spark className="sf-inlineSpark" color={C.pink} /> A chocolate factory made just for <Spark className="sf-inlineSpark" color={C.pink} />
        </p>
        <h1 className="sf-gateName">
          {f.to}
          <svg className="sf-scribble" viewBox="0 0 200 18" preserveAspectRatio="none" aria-hidden>
            <path d="M4 12 C 40 2, 70 16, 100 9 S 160 3, 196 10" fill="none" stroke={C.pink} strokeWidth="4" strokeLinecap="round" />
          </svg>
        </h1>

        <div className="sf-ticketWrap">
          <SlotGif id="sf1-ticket" size={92} tilt={-8} float className="sf-gateBear" eager />
          <Gif src={GIF.catMold} size={74} tilt={8} float className="sf-gateCat" eager />
          <div className="sf-ticket">
            <span className="sf-tTop">✦ GOLDEN TICKET ✦</span>
            <span className="sf-tHouse">{f.house}</span>
            <div className="sf-tScratch" onPointerUp={maybeEnter} onClick={maybeEnter}>
              <ScratchCanvas
                height={96}
                cover={FOIL}
                label="scratch the gold ✦"
                labelColor="#8A5A12"
                threshold={0.5}
                brush={20}
                radius={14}
                revealLinkAfterMs={6000}
                onProgress={onProgress}
              >
                <span className="sf-tAdmit">
                  <small>ADMIT ONE</small>
                  <b>{f.to} 💗</b>
                  <em>to the sweetest factory in the world</em>
                </span>
              </ScratchCanvas>
            </div>
            <span className="sf-tLine">{f.ticketLine}</span>
            <span className="sf-tFoot">
              <span>9 FEB · ALL DAY</span>
              <span>No. 0209</span>
            </span>
            <span className="sf-tNotch is-l" aria-hidden />
            <span className="sf-tNotch is-r" aria-hidden />
          </div>
        </div>
        <p className="sf-gateHint" aria-live="polite">
          {scratched > 0.05 ? (scratched >= 1 ? "Lift your finger… 🍫" : "Keep going, it's in there…") : "Scratch the gold to see who's invited"}
        </p>

        <button type="button" className={`sf-puffy is-pink sf-gateCta${tuning ? " is-tuning" : ""}`} onClick={() => enter(false)}>
          <span>Enter the factory 🍫</span>
          {tuning && <small aria-live="polite">warming up the music…</small>}
        </button>
        <span className="sf-gateSeal">
          <Truffle look={LOOKS[1]} size={28} /> Hand-made for {f.to} by {f.from}
        </span>
        <button type="button" className="sf-quiet" onClick={() => enter(true)}>
          <span aria-hidden>🔇</span> Open quietly
        </button>
      </div>
    </div>
  );
}

/** A candy-coloured factory skyline: chimneys puffing heart-shaped clouds, a striped awning and a big lollipop. */
export function FactorySkyline({ className }: { className?: string }) {
  return (
    <svg className={`sf-skyline${className ? ` ${className}` : ""}`} viewBox="0 0 400 180" preserveAspectRatio="xMidYMax slice" aria-hidden>
      <g className="sf-puffs">
        {[70, 150, 300].map((x, i) => (
          <path key={i} className="sf-puff" style={{ ["--i" as string]: i }} d={`M${x} 52 c -8 -10 -24 -2 -14 10 l 14 12 l 14 -12 c 10 -12 -6 -20 -14 -10 z`} fill="#FFD1DF" />
        ))}
      </g>
      <rect x="58" y="60" width="24" height="60" rx="4" fill="#C98A5B" />
      <rect x="54" y="56" width="32" height="10" rx="4" fill="#FF8FAB" />
      <rect x="138" y="70" width="24" height="50" rx="4" fill="#C98A5B" />
      <rect x="134" y="66" width="32" height="10" rx="4" fill="#FF8FAB" />
      <rect x="288" y="62" width="24" height="58" rx="4" fill="#C98A5B" />
      <rect x="284" y="58" width="32" height="10" rx="4" fill="#FF8FAB" />
      <path d="M20 180 V112 L70 92 L120 112 L170 92 L220 112 L270 92 L320 112 L380 92 V180 Z" fill="#E7BFA0" />
      <path d="M20 180 V122 H380 V180 Z" fill="#F3D9C4" />
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={i} x={36 + i * 38} y="134" width="18" height="18" rx="9" fill="#FFF8F0" stroke="#FF8FAB" strokeWidth="3" />
      ))}
      <path d="M170 180 V150 Q200 126 230 150 V180 Z" fill="#B9744D" />
      <circle cx="200" cy="158" r="5" fill="#FFD166" />
      <path d="M150 124 H250 L242 112 H158 Z" fill="#FF6F9C" />
      {Array.from({ length: 5 }, (_, i) => <path key={i} d={`M${158 + i * 18} 112 h9 l-2 12 h-9 z`} fill="#fff" opacity=".85" />)}
      <line x1="356" y1="180" x2="356" y2="70" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
      <circle cx="356" cy="58" r="22" fill="#FF8FAB" />
      <path d="M356 58 m-14 0 a14 14 0 1 1 14 14 a9 9 0 1 1 -9 -9 a4 4 0 1 1 4 4" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}
