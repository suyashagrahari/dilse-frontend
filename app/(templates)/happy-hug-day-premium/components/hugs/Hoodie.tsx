"use client";

// Room 5 — The hoodie letter. An oversized knit hoodie fills the frame, a tag
// stitched in the collar ("Property of us"). Drag the zipper pull down — a
// tick for every tooth, rising as it runs — and the two halves fall open onto
// the soft lining where the letter is written. "Unzip it" does it for you. In
// the pocket: the voice note (or its line) and a P.S.

import { useRef, useState } from "react";
import { sfx, usePremium, VoiceNotePlayer } from "../../../_valentine/kit/premium";
import { haptic, useReducedMotion } from "../../../_valentine/kit";
import { HAND, SOFT } from "./fonts";
import type { Hug } from "./model";
import { Hint, Kicker, Quiet, Room, Satin, Title } from "./ui";

const KNIT =
  "repeating-linear-gradient(90deg, rgba(255,255,255,.05) 0 3px, transparent 3px 9px), repeating-linear-gradient(0deg, rgba(0,0,0,.07) 0 2px, transparent 2px 7px), linear-gradient(180deg, #6E5A86, #4F4068)";

export default function Hoodie({ h, letter, onNext }: { h: Hug; letter: string; onNext: () => void }) {
  const p = usePremium();
  const reduce = useReducedMotion();
  const [z, setZ] = useState(0);
  const [psOpen, setPsOpen] = useState(false);
  const track = useRef<HTMLDivElement>(null);
  const lastTooth = useRef(0);
  const dragging = useRef(false);
  const open = z >= 1;

  const setZip = (v: number) => {
    const n = Math.max(0, Math.min(1, v));
    const tooth = Math.floor(n * 26);
    if (tooth > lastTooth.current) {
      lastTooth.current = tooth;
      sfx("hg-zip", { detune: tooth * 40, gain: 0.7 });
      if (tooth % 4 === 0) haptic(4);
    }
    if (n >= 0.96) {
      setZ(1);
      sfx("hg-fabric", { gain: 0.8 });
      haptic([12, 30, 12]);
    } else setZ(n);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!dragging.current || open) return;
    const r = track.current?.getBoundingClientRect();
    if (!r) return;
    setZip((e.clientY - r.top) / r.height);
  };
  const unzip = () => {
    if (open) return;
    if (reduce) return setZip(1);
    let v = z;
    const t = window.setInterval(() => {
      v += 0.05;
      setZip(v);
      if (v >= 1) window.clearInterval(t);
    }, 45);
  };

  return (
    <Room label="The hoodie letter" className="hg-hoodieRoom">
      <Kicker>Wear this one</Kicker>
      <Title>{open ? "Wrapped up in you" : "Unzip the hoodie"}</Title>
      <div className={`hg-hoodie${open ? " is-open" : ""}`} style={{ ["--z" as string]: String(z) }}>
        <div className="hg-lining">
          <p className="hg-dear" style={{ fontFamily: HAND }}>Dear {h.recipient},</p>
          <div className="hg-letter" style={{ fontFamily: SOFT }}>{letter}</div>
          <p className="hg-sign" style={{ fontFamily: HAND }}>— {h.sender}</p>
        </div>
        {!open && (
          <>
            <div className="hg-half is-l" style={{ background: KNIT, transform: `translateX(${-z * 18}%) rotate(${-z * 4}deg)` }} aria-hidden />
            <div className="hg-half is-r" style={{ background: KNIT, transform: `translateX(${z * 18}%) rotate(${z * 4}deg)` }} aria-hidden />
            <span className="hg-hood" aria-hidden />
            <span className="hg-tag" style={{ fontFamily: HAND }}>{h.tag}</span>
            <span className="hg-string is-l" aria-hidden />
            <span className="hg-string is-r" aria-hidden />
            <div
              ref={track}
              className="hg-zipTrack"
              onPointerDown={(e) => { (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId); dragging.current = true; }}
              onPointerMove={onMove}
              onPointerUp={() => (dragging.current = false)}
              onPointerCancel={() => (dragging.current = false)}
              role="slider"
              tabIndex={0}
              aria-label="Zipper. Drag down to open the hoodie."
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(z * 100)}
              onKeyDown={(e) => { if (e.key === "ArrowDown") { e.preventDefault(); setZip(z + 0.1); } }}
            >
              <span className="hg-teeth" aria-hidden />
              <span className="hg-pull" style={{ top: `${z * 100}%` }} aria-hidden />
            </div>
          </>
        )}
      </div>
      {open ? (
        <>
          <VoiceNotePlayer label={`In the pocket · ${h.sender}`} accent="#D9367A" track="rgba(244,235,221,.7)" className="hg-voice" />
          {p.premium.psLetter && (
            <button type="button" className={`hg-ps${psOpen ? " is-open" : ""}`} onClick={() => { if (!psOpen) { sfx("hg-pop", { gain: 0.6 }); setPsOpen(true); } }} aria-expanded={psOpen}>
              {psOpen ? <span style={{ fontFamily: SOFT }}>{p.premium.psLetter}</span> : <span className="hg-psShut" style={{ fontFamily: HAND }}>P.S. — in the other pocket</span>}
            </button>
          )}
          <Satin big onClick={() => { sfx("hg-drape", { gain: 0.7 }); onNext(); }}>Into the blanket fort →</Satin>
        </>
      ) : (
        <>
          <Hint>Drag the zipper down</Hint>
          <Quiet onClick={unzip}>Unzip it</Quiet>
        </>
      )}
      <style>{CSS}</style>
    </Room>
  );
}

const CSS = `
.hg-hoodieRoom { gap: 12px; }
.hg-hoodie { position: relative; width: 100%; max-width: 420px; min-height: min(56vh, 480px); border-radius: 30px 30px 18px 18px; overflow: hidden;
  background: #F4EBDD; box-shadow: 0 30px 60px -30px rgba(0,0,0,.85); }
.hg-hoodie:not(.is-open) { max-height: min(56vh, 480px); }
.hg-hoodie.is-open { overflow: visible; animation: hg-open .8s ease both; }
@keyframes hg-open { from { transform: scale(.98); } to { transform: none; } }
.hg-lining { padding: 30px 24px 26px; text-align: left; color: #4A2C2A; background: repeating-linear-gradient(45deg, rgba(74,44,42,.03) 0 6px, transparent 6px 12px), #F4EBDD; border-radius: inherit; }
.hg-dear { margin: 0 0 8px; font-size: 30px; color: #C2410C; }
.hg-letter { white-space: pre-wrap; font-size: 18px; line-height: 1.6; overflow-wrap: anywhere; user-select: text; -webkit-user-select: text; }
.hg-sign { margin: 12px 0 0; text-align: right; font-size: 30px; color: #C2410C; }
.hg-half { position: absolute; top: 0; bottom: 0; width: 51%; box-shadow: inset 0 0 40px rgba(0,0,0,.35); transition: transform .12s linear; }
.hg-half.is-l { left: 0; transform-origin: 0 0; border-radius: 30px 0 0 18px; }
.hg-half.is-r { right: 0; transform-origin: 100% 0; border-radius: 0 30px 18px 0; }
.hg-hood { position: absolute; left: 50%; top: -40px; width: 64%; height: 110px; transform: translateX(-50%); border-radius: 0 0 50% 50%; background: #3E3254; box-shadow: inset 0 -14px 24px rgba(0,0,0,.35); }
.hg-tag { position: absolute; left: 50%; top: 22px; transform: translateX(-50%); padding: 3px 12px; background: #F4EBDD; color: #4A2C2A; font-size: 17px; border-radius: 3px; white-space: nowrap;
  box-shadow: 0 2px 6px rgba(0,0,0,.35); outline: 1px dashed rgba(74,44,42,.4); outline-offset: -4px; }
.hg-string { position: absolute; top: 64px; width: 5px; height: 110px; border-radius: 3px; background: #F4EBDD; transform-origin: 50% 0; animation: hg-swing 3.2s ease-in-out infinite; }
.hg-string.is-l { left: 40%; } .hg-string.is-r { left: 59%; animation-delay: -1.2s; }
.hg-string::after { content: ""; position: absolute; bottom: -8px; left: -3px; width: 11px; height: 14px; border-radius: 3px; background: #C9B9A2; }
@keyframes hg-swing { 0%, 100% { transform: rotate(4deg); } 50% { transform: rotate(-4deg); } }
.hg-zipTrack { position: absolute; left: 50%; top: 56px; bottom: 26px; width: 64px; transform: translateX(-50%); cursor: grab; touch-action: none; }
.hg-zipTrack:focus-visible { outline: 3px solid #FFE08A; outline-offset: 2px; border-radius: 10px; }
.hg-teeth { position: absolute; left: 50%; top: 0; bottom: 0; width: 8px; margin-left: -4px; background: repeating-linear-gradient(180deg, #D9D2C4 0 3px, #8E8576 3px 6px); }
.hg-pull { position: absolute; left: 50%; width: 26px; height: 46px; margin: -6px 0 0 -13px; border-radius: 6px 6px 13px 13px;
  background: linear-gradient(180deg, #FFE08A, #B8862E); box-shadow: 0 4px 10px rgba(0,0,0,.45); }
.hg-pull::after { content: ""; position: absolute; left: 50%; top: 22px; width: 10px; height: 14px; margin-left: -5px; border-radius: 4px; background: rgba(0,0,0,.25); }
.hg-voice { background: rgba(27,35,64,.55) !important; border-color: rgba(220,232,242,.25) !important; color: #F4EBDD !important; }
.hg-ps { all: unset; cursor: pointer; width: min(100%, 420px); box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
.hg-ps:focus-visible { outline: 3px solid #FFE08A; outline-offset: 3px; border-radius: 14px; }
.hg-ps > span { display: block; padding: 16px 18px; border-radius: 14px; background: #F4EBDD; color: #4A2C2A; text-align: left; font-size: 18px; line-height: 1.45; white-space: pre-wrap; font-style: italic; }
.hg-psShut { font-size: 22px !important; font-style: normal !important; text-align: center !important; }
@media (prefers-reduced-motion: reduce) { .hg-string, .hg-hoodie.is-open { animation: none; } }
`;
