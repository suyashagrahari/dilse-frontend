"use client";

// Room 4 — Hugs for every weather (mini-game 1: "Warm hands"). Knitted mitten
// pockets, each labelled with a moment ("For exam nights"). Rub one in circles
// to warm it (a heat bar fills; five taps also count); warm, it pops open and
// its note slides out on a card with a curl of steam. Saved for real bad days.

import { useRef, useState, type ReactNode } from "react";
import { sfx } from "../../../_valentine/kit/premium";
import { haptic } from "../../../_valentine/kit";
import { HAND, SOFT } from "./fonts";
import type { Hug } from "./model";
import { Hint, Kicker, Room, Satin, Title } from "./ui";

const KNITS = ["#C2410C", "#D9367A", "#7A5AB8", "#2F7A6B", "#B8862E", "#3A5BA8"];

function Mitten({ color, heat, open }: { color: string; heat: number; open: boolean }) {
  return (
    <svg viewBox="0 0 80 100" width="100%" height="100%" aria-hidden style={{ overflow: "visible" }}>
      <defs>
        <pattern id={`knit-${color.slice(1)}`} width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill={color} />
          <path d="M0 4 L4 8 L8 4 M0 0 L4 4 L8 0" stroke="rgba(255,255,255,.18)" strokeWidth="1.4" fill="none" />
        </pattern>
      </defs>
      <path d="M22 92 L22 40 C22 20 30 8 44 8 C58 8 64 22 64 38 L64 92 Z" fill={`url(#knit-${color.slice(1)})`} />
      <path d="M22 54 C12 52 8 44 10 36 C12 30 20 30 22 36 Z" fill={`url(#knit-${color.slice(1)})`} />
      <rect x="18" y="80" width="50" height="14" rx="4" fill="#F4EBDD" />
      <path d="M22 84 L66 84 M22 88 L66 88" stroke="rgba(74,44,42,.25)" strokeWidth="1.5" />
      <rect x="28" y={open ? 28 : 40} width="30" height="26" rx="4" fill="rgba(255,255,255,.18)" stroke="rgba(255,255,255,.35)" style={{ transition: "y .4s" }} />
      <rect x="20" y="96" width="46" height="4" rx="2" fill="rgba(0,0,0,.25)" />
      <rect x="20" y="96" width={46 * heat} height="4" rx="2" fill={heat >= 1 ? "#FFE08A" : "#FF8A3D"} />
    </svg>
  );
}

export default function Mittens({ h, sticker, onNext }: { h: Hug; sticker: ReactNode; onNext: () => void }) {
  const [heat, setHeat] = useState<number[]>(() => h.mittens.map(() => 0));
  const [open, setOpen] = useState<number[]>([]);
  const [shown, setShown] = useState<number | null>(null);
  const drag = useRef<{ i: number; x: number; y: number; rub: number } | null>(null);
  const taps = useRef<number[]>(h.mittens.map(() => 0));

  const heatRef = useRef<number[]>(h.mittens.map(() => 0));
  const openRef = useRef<number[]>([]);
  const warm = (i: number, by: number) => {
    if (openRef.current.includes(i)) {
      setShown(i);
      return;
    }
    const next = [...heatRef.current];
    next[i] = Math.min(1, next[i] + by);
    heatRef.current = next;
    setHeat(next);
    if (next[i] >= 1) {
      openRef.current = [...openRef.current, i];
      setOpen(openRef.current);
      setShown(i);
      sfx("hg-pop", { gain: 0.8 });
      sfx("hg-steam", { at: 0.15, gain: 0.7 });
      haptic([14, 30, 14]);
    }
  };
  const onDown = (i: number) => (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    drag.current = { i, x: e.clientX, y: e.clientY, rub: 0 };
  };
  const onMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dist = Math.hypot(e.clientX - d.x, e.clientY - d.y);
    d.x = e.clientX;
    d.y = e.clientY;
    d.rub += dist;
    if (d.rub > 40) {
      d.rub = 0;
      sfx("hg-rub", { gain: 0.5 });
    }
    warm(d.i, dist / 700);
  };
  const onUp = (i: number) => () => {
    const d = drag.current;
    drag.current = null;
    if (d && d.rub < 6) {
      taps.current[i] += 1;
      sfx("hg-rub", { gain: 0.4 });
      warm(i, 0.2);
    }
  };

  const need = Math.min(2, h.mittens.length);
  return (
    <Room label="Hugs for every weather" className="hg-mittens">
      <Kicker>Hugs for every weather</Kicker>
      <Title>Rub them warm</Title>
      <div className="hg-mitRow" style={{ ["--n" as string]: Math.min(3, h.mittens.length) }}>
        {h.mittens.map((m, i) => (
          <div key={i} className={`hg-mit${open.includes(i) ? " is-open" : ""}`}>
            <button
              type="button"
              className="hg-mitBtn"
              onPointerDown={onDown(i)}
              onPointerMove={onMove}
              onPointerUp={onUp(i)}
              onPointerCancel={() => (drag.current = null)}
              aria-label={open.includes(i) ? `${m.when} — read the note` : `${m.when}: rub to warm, or tap five times`}
            >
              <Mitten color={KNITS[i % KNITS.length]} heat={heat[i]} open={open.includes(i)} />
            </button>
            <span className="hg-mitTag" style={{ fontFamily: HAND }}>{m.when}</span>
          </div>
        ))}
        <span className="hg-mitSticker">{sticker}</span>
      </div>
      {shown !== null && (
        <div key={shown} className="hg-note">
          <span className="hg-steamCurl" aria-hidden />
          <b style={{ fontFamily: HAND }}>{h.mittens[shown].when}</b>
          <p style={{ fontFamily: SOFT }}>{h.mittens[shown].note}</p>
        </div>
      )}
      {open.length >= need ? (
        <Satin big onClick={() => { sfx("hg-fabric", { gain: 0.6 }); onNext(); }}>{open.length < h.mittens.length ? "Save the rest for later →" : "Onward →"}</Satin>
      ) : (
        <Hint>Rub a mitten in circles until it&rsquo;s warm</Hint>
      )}
      <style>{CSS}</style>
    </Room>
  );
}

const CSS = `
.hg-mittens { gap: 12px; }
.hg-mitRow { position: relative; display: grid; grid-template-columns: repeat(var(--n), 1fr); gap: 14px 10px; width: 100%; max-width: 420px; }
.hg-mit { display: grid; justify-items: center; gap: 4px; }
.hg-mitBtn { all: unset; width: 92px; height: 112px; cursor: pointer; touch-action: none; -webkit-tap-highlight-color: transparent; transition: transform .3s; }
.hg-mitBtn:active { transform: rotate(-4deg) scale(.97); }
.hg-mitBtn:focus-visible { outline: 3px solid #FFE08A; outline-offset: 3px; border-radius: 12px; }
.hg-mit.is-open .hg-mitBtn { filter: drop-shadow(0 0 14px rgba(255,224,138,.6)); }
.hg-mitTag { font-size: 18px; line-height: 1.05; color: #FFE3CC; text-align: center; max-width: 110px; }
.hg-mitSticker { position: absolute; right: -10px; top: -30px; pointer-events: none; }
.hg-note { position: relative; width: 100%; max-width: 400px; box-sizing: border-box; padding: 18px 20px; border-radius: 16px; text-align: left; color: #4A2C2A;
  background: #F4EBDD; box-shadow: 0 20px 40px -20px rgba(0,0,0,.7); animation: hg-noteIn .7s cubic-bezier(.22,1,.36,1) both; }
@keyframes hg-noteIn { from { opacity: 0; transform: translateY(24px) rotate(-2deg); } to { opacity: 1; transform: rotate(-1deg); } }
.hg-note b { font-size: 22px; color: #C2410C; }
.hg-note p { margin: 4px 0 0; font-size: 18px; line-height: 1.45; font-style: italic; }
.hg-steamCurl { position: absolute; right: 18px; top: -26px; width: 18px; height: 30px; border-radius: 50%; border-left: 3px solid rgba(255,255,255,.7); animation: hg-steamUp 2.4s ease-in-out infinite; }
@keyframes hg-steamUp { 0% { opacity: 0; transform: translateY(8px); } 40% { opacity: .9; } 100% { opacity: 0; transform: translateY(-16px) scaleX(-1); } }
@media (max-width: 360px) { .hg-mitBtn { width: 78px; height: 96px; } }
@media (prefers-reduced-motion: reduce) { .hg-note, .hg-steamCurl { animation: none; } }
`;
