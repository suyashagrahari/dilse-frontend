"use client";

// Scene 4 · The rose at your door. A rose lies on a heart doormat with a tag tied on by a ribbon. She pulls the
// ribbon's tail down (drag) until the bow unties (ribbon sfx, burst), and the tag unfolds into his letter, which
// types itself on notepaper with one of their photos taped to the corner. The bears handing over a bouquet sit
// beside it. Fallback: "Untie it for me". The full letter is always in the DOM (Typewriter reserves its space).

import { useRef, useState } from "react";
import { CroppedPhoto, Typewriter, haptic } from "../../../_valentine/kit";
import { usePremium } from "../../../_valentine/kit/premium";
import type { DayConfig } from "../../../_valentine/types";
import { Defs, RoseHead, Slot, Washi, LEAF } from "./art";
import { Puffy, Scene, originOf, useAww } from "./ui";
import type { Garden } from "./util";

const PULL = 110;

export function NoteScene({ g, day, gifs, letter, step, total, hasMore, onDone }: { g: Garden; day: DayConfig; gifs?: Record<string, string>; letter: string; step: number; total: number; hasMore: boolean; onDone: () => void }) {
  const { sfx } = usePremium();
  const aww = useAww();
  const [pull, setPull] = useState(0);
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState(false);
  const drag = useRef<{ y: number; id: number } | null>(null);
  const tagRef = useRef<HTMLDivElement>(null);
  const lastTick = useRef(0);

  const untie = () => {
    if (open) return;
    setPull(1);
    sfx("ribbon", { gain: 0.8 });
    haptic([12, 30, 12]);
    window.setTimeout(() => {
      setOpen(true);
      sfx("paper-rustle", { gain: 0.6 });
      aww(originOf(tagRef.current, 0.3));
    }, 420);
  };

  const onDown = (e: React.PointerEvent) => {
    if (open) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { y: e.clientY, id: e.pointerId };
  };
  const onMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const p = Math.max(0, Math.min(1, (e.clientY - drag.current.y) / PULL));
    setPull(p);
    if (p - lastTick.current > 0.2) {
      lastTick.current = p;
      sfx("tick", { gain: 0.35, detune: p * 600 });
    }
    if (p >= 1) {
      drag.current = null;
      untie();
    }
  };
  const onUp = () => {
    drag.current = null;
    lastTick.current = 0;
    if (!open && pull < 1) setPull(0);
  };

  const photo = g.photos[0];
  const body = letter.trim();

  return (
    <Scene
      id="note"
      step={step}
      total={total}
      label="A note tied to a rose"
      kicker="Step 4 · special delivery"
      title={open ? `For ${g.pet || g.to}` : "A rose at your door 🚪"}
      sub={open ? undefined : "Pull the ribbon to untie the note 🎀"}
    >
      {!open ? (
        <div className="rg-door">
          <div className="rg-mat" aria-hidden>
            <span>welcome home</span>
          </div>
          <svg className="rg-doorRose" viewBox="-150 -70 300 140" aria-hidden>
            <Defs id="door" color={g.color} />
            <path d="M-118 26 C -60 14 10 10 72 0" stroke={LEAF.stem} strokeWidth="6" fill="none" strokeLinecap="round" />
            <path d="M-46 16 C -36 -4 -12 -8 0 0 C -14 12 -32 16 -46 16 Z" fill={LEAF.mid} />
            <path d="M-80 22 C -86 40 -66 50 -56 44 C -58 32 -68 24 -80 22 Z" fill={LEAF.mid} />
            <RoseHead id="door" open={0.95} x={74} y={0} s={1} rotate={76} />
          </svg>
          <div className="rg-tag" ref={tagRef} style={{ ["--pull" as string]: String(pull) }}>
            <span className="rg-tagCard">
              <b>for</b>
              <span>{g.to}</span>
            </span>
            <span className="rg-bowKnot" aria-hidden />
            <button
              type="button"
              className="rg-tail"
              aria-label="Pull the ribbon to untie the note"
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={onUp}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), untie())}
            >
              <i />
              <span className="rg-tailHint">pull ↓</span>
            </button>
          </div>
          <Slot day={day} gifs={gifs} id="rg5-note" size={100} className="rg-doorPeek" tilt={-8} eager />
        </div>
      ) : (
        <div className="rg-letterWrap">
          <Slot day={day} gifs={gifs} id="rg5-note" size={86} className="rg-letterPeek" tilt={-8} eager />
          <article className="rg-letter">
            {photo && (
              <figure className="rg-letterPhoto">
                <Washi className="rg-letterTape" />
                <span className="rg-letterPhotoIn">
                  <CroppedPhoto photo={photo} alt={photo.caption ?? ""} />
                </span>
              </figure>
            )}
            <Typewriter text={body} speed={20} className="rg-letterText" caretColor="#D63F72" onDone={() => setTyped(true)} />
            <div className={`rg-letterEnd${typed ? " is-on" : ""}`}>
              {g.shayari && <p className="rg-shayari">{g.shayari}</p>}
              <p className="rg-signoff">{g.signOff || `Yours, ${g.from}`}</p>
            </div>
          </article>
        </div>
      )}
      <div className="rg-foot">
        {!open ? (
          <Puffy variant="ghost" onClick={untie} cue={null}>
            Untie it for me 🎀
          </Puffy>
        ) : (
          <Puffy onClick={onDone} className={typed ? "rg-heartbeat" : undefined}>
            {hasMore ? "There's more… 🎙" : "Next 🌷"}
          </Puffy>
        )}
      </div>
    </Scene>
  );
}
