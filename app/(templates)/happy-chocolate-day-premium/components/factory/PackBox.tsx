"use client";

// Station 1 · The packing line. Six kawaii truffles ride the conveyor belt; she taps one (or drags it down) and it
// flies into the next paper cup in her box, smiles, and its flavour card says the reason it's in there
// ("Hazelnut crunch: your laugh, the loud one"). Six in: the lid label pops on with his box line.

import { useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { GIF } from "./model";
import { Cup, Gif, SlotGif, StationHead, Truffle, reward, useStation } from "./ui";

interface Flyer {
  i: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
}

export default function PackBox() {
  const { f, sfx, done } = useStation();
  const [packed, setPacked] = useState<number[]>([]);
  const [last, setLast] = useState<number | null>(null);
  const [flyer, setFlyer] = useState<Flyer | null>(null);
  const [drag, setDrag] = useState<{ i: number; x: number; y: number } | null>(null);
  const start = useRef<{ i: number; x: number; y: number; id: number } | null>(null);
  const slotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const beltRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const busy = useRef(false);
  const full = packed.length >= 6;

  const pack = (i: number, from?: { x: number; y: number }) => {
    if (busy.current || packed.includes(i) || full) return;
    const slotIdx = packed.length;
    const slot = slotRefs.current[slotIdx];
    const src = beltRefs.current[i];
    busy.current = true;
    sfx("swoosh-soft", { gain: 0.45, detune: i * 60 });
    if (slot && src) {
      const a = src.getBoundingClientRect();
      const b = slot.getBoundingClientRect();
      const fx = from ? from.x - a.width / 2 : a.left;
      const fy = from ? from.y - a.height / 2 : a.top;
      setFlyer({ i, x: fx, y: fy, dx: b.left + b.width / 2 - (fx + a.width / 2), dy: b.top + b.height / 2 - (fy + a.height / 2) });
    }
    window.setTimeout(() => {
      setFlyer(null);
      busy.current = false;
      const next = [...packed, i];
      setPacked(next);
      setLast(i);
      sfx("sf-boing", { gain: 0.55, detune: slotIdx * 90 });
      sfx("pop", { gain: 0.4 });
      reward(sfx, slotRefs.current[slotIdx], { small: true, cue: "glass-ping" });
      if (next.length === 6) {
        window.setTimeout(() => {
          reward(sfx, document.querySelector(".sf-box"), { big: true, cue: "chime-cascade" });
          sfx("sf-ding", { gain: 0.5 });
          done();
        }, 650);
      }
    }, slot && src ? 460 : 0);
  };

  const onDown = (i: number) => (e: RPointerEvent<HTMLButtonElement>) => {
    if (packed.includes(i) || full) return;
    start.current = { i, x: e.clientX, y: e.clientY, id: e.pointerId };
    e.currentTarget.setPointerCapture?.(e.pointerId);
    sfx("tick", { gain: 0.25 });
  };
  const onMove = (e: RPointerEvent<HTMLButtonElement>) => {
    const s = start.current;
    if (!s || s.id !== e.pointerId) return;
    if (Math.hypot(e.clientX - s.x, e.clientY - s.y) > 8) setDrag({ i: s.i, x: e.clientX, y: e.clientY });
  };
  const onUp = (e: RPointerEvent<HTMLButtonElement>) => {
    const s = start.current;
    start.current = null;
    if (!s) return;
    const dragged = drag && drag.i === s.i;
    setDrag(null);
    // A tap or a drag anywhere both pack it: the drag is the fun, never a test.
    pack(s.i, dragged ? { x: e.clientX, y: e.clientY } : undefined);
  };

  const cur = last != null ? f.truffles[last] : null;

  return (
    <section className="sf-scene sf-pack" aria-label="The packing line">
      <StationHead kicker="Station 1 · The packing line" title="Fill your box" hint={full ? undefined : "Tap a truffle (or drag it) into your box"} />

      <div className="sf-belt" aria-label="The conveyor belt">
        <div className="sf-beltTrack" aria-hidden>
          <i className="sf-beltStripes" />
          <span className="sf-roller is-l" />
          <span className="sf-roller is-r" />
        </div>
        <div className="sf-beltItems">
          {f.truffles.map((t, i) => {
            const gone = packed.includes(i) || flyer?.i === i;
            return (
              <button
                key={i}
                ref={(el) => {
                  beltRefs.current[i] = el;
                }}
                type="button"
                className={`sf-beltItem${gone ? " is-gone" : ""}${drag?.i === i ? " is-lifted" : ""}`}
                style={{ ["--d" as string]: `${i * 0.23}s` }}
                onPointerDown={onDown(i)}
                onPointerMove={onMove}
                onPointerUp={onUp}
                onPointerCancel={() => {
                  start.current = null;
                  setDrag(null);
                }}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), pack(i))}
                disabled={gone}
                aria-label={`Pack the ${t.name} truffle`}
              >
                <Truffle look={t.look} size={50} />
              </button>
            );
          })}
        </div>
      </div>

      <div className={`sf-box${full ? " is-full" : ""}`}>
        <div className="sf-boxLabel" aria-hidden={!full}>
          {full ? <b>{f.boxLine}</b> : <span>{f.house} · box for {f.to}</span>}
        </div>
        <div className="sf-boxGrid">
          {Array.from({ length: 6 }, (_, s) => {
            const ti = packed[s];
            return (
              <div
                key={s}
                className="sf-slot"
                ref={(el) => {
                  slotRefs.current[s] = el;
                }}
              >
                <Cup size={64} />
                {ti != null && <Truffle look={f.truffles[ti].look} size={50} happy className="sf-slotTruffle" />}
              </div>
            );
          })}
        </div>
        <span className="sf-boxCount" aria-live="polite">
          {packed.length}/6
        </span>
        {full && <SlotGif id="sf2-box" size={96} tilt={8} className="sf-boxGif sf-popIn" eager />}
      </div>

      <div className="sf-flavour" aria-live="polite">
        <Gif src={GIF.catMold} size={74} tilt={-6} float className="sf-beltCat" />
        {cur ? (
          <p key={last} className="sf-flavourCard">
            <Truffle look={cur.look} size={40} happy />
            <span>
              <b>{cur.name}</b>
              {cur.reason}
            </span>
          </p>
        ) : (
          <p className="sf-flavourEmpty">Every flavour is a reason. Pack one to taste it.</p>
        )}
      </div>

      {flyer && (
        <span className="sf-flyer" style={{ left: flyer.x, top: flyer.y, ["--dx" as string]: `${flyer.dx}px`, ["--dy" as string]: `${flyer.dy}px` }} aria-hidden>
          <Truffle look={f.truffles[flyer.i].look} size={50} />
        </span>
      )}
      {drag && (
        <span className="sf-dragGhost" style={{ left: drag.x, top: drag.y }} aria-hidden>
          <Truffle look={f.truffles[drag.i].look} size={58} />
        </span>
      )}
    </section>
  );
}
