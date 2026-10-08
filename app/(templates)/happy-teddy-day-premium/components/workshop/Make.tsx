"use client";

// ─── Scenes 1–2: the workshop (the unfinished teddy) and the stuffing crank ──

import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { haptic } from "../../../_valentine/kit";
import { SkipChip } from "../../../_valentine/kit/premium";
import { Teddy } from "./art";
import { fill, type SceneProps } from "./shared";

export function Workshop({ data, x, name, look, sticker, next, sfx }: SceneProps) {
  return (
    <section className="td-sec td-dolly">
      <header className="td-head">
        <p className="td-kick">The toy workshop · after hours</p>
        <h2 className="td-h">Meet {name}.</h2>
        <p className="td-sub">He's not finished yet.</p>
      </header>
      <div className="td-benchStage">
        <Teddy {...look} fluff={0} awake={false} className="td-flat" />
        <div className="td-tag">
          <span className="td-tagHole" aria-hidden />
          <p>{fill(x.parcelNote || "He's not finished yet. He needs you to give him a heart.", data)}</p>
          {data.senderName && <i>— {data.senderName}</i>}
        </div>
      </div>
      <span className="td-stick">{sticker("pt1-parcel", 76)}</span>
      <div className="td-actions">
        <button type="button" className="td-btn" onClick={() => { sfx("whoosh", { gain: 0.5 }); next(); }}>
          Let's finish him →
        </button>
      </div>
    </section>
  );
}

export function Stuff({ name, look, fluff, setFluff, reduced, sfx, next }: SceneProps) {
  const [puffs, setPuffs] = useState<{ id: number; x: number; y: number }[]>([]);
  const [angle, setAngle] = useState(0);
  const wheel = useRef<HTMLDivElement>(null);
  const drag = useRef<{ a: number; lastTick: number } | null>(null);
  const f = useRef(fluff);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const puff = () => {
    const id = Math.random();
    setPuffs((p) => [...p.slice(-6), { id, x: 30 + Math.random() * 40, y: 30 + Math.random() * 30 }]);
    timers.current.push(window.setTimeout(() => setPuffs((p) => p.filter((q) => q.id !== id)), 900));
  };
  const add = (rad: number) => {
    const nf = Math.min(1.3, f.current + rad / (Math.PI * 2 * 2.2));
    const crossed = f.current < 1 && nf >= 1;
    f.current = nf;
    setFluff(nf);
    setAngle((a) => a + (rad * 180) / Math.PI);
    if (crossed) {
      sfx("chime", { gain: 0.6 });
      haptic([15, 40, 15]);
    }
  };
  const ang = (e: { clientX: number; clientY: number }) => {
    const r = wheel.current?.getBoundingClientRect();
    if (!r) return 0;
    return Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2));
  };
  const down = (e: RPointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    drag.current = { a: ang(e), lastTick: 0 };
  };
  const move = (e: RPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const a = ang(e);
    let da = a - d.a;
    if (da > Math.PI) da -= Math.PI * 2;
    if (da < -Math.PI) da += Math.PI * 2;
    d.a = a;
    const step = Math.abs(da);
    d.lastTick += step;
    add(step);
    if (d.lastTick > Math.PI / 6) {
      d.lastTick = 0;
      sfx("td-ratchet", { detune: Math.random() * 200 - 100 });
      if (Math.random() < 0.6) {
        sfx("td-fluff", { gain: 0.6 });
        puff();
      }
    }
  };
  const auto = () => {
    let n = 0;
    const tick = () => {
      if (f.current >= 1) return;
      add(Math.PI / 5);
      sfx("td-ratchet");
      if (n++ % 2 === 0) {
        sfx("td-fluff", { gain: 0.6 });
        puff();
      }
      timers.current.push(window.setTimeout(tick, reduced ? 30 : 110));
    };
    tick();
  };

  const done = fluff >= 1;
  const chubby = fluff >= 1.2;
  const needle = -90 + Math.min(1.3, fluff) * 138;

  return (
    <section className="td-sec">
      <header className="td-head">
        <p className="td-kick">Step one · the stuffing</p>
        <h2 className="td-h">{done ? (chubby ? `${name} is going to be extra huggable.` : "Perfectly fluffy ♥") : "Crank the handle"}</h2>
        <p className="td-sub">{done ? "(You can keep going. Nobody's judging.)" : "Turn the brass wheel round and round to fill him with fluff."}</p>
      </header>
      <div className="td-stuffStage">
        <div className="td-machine" aria-hidden>
          <div className="td-gauge">
            <span className="td-gaugeNeedle" style={{ transform: `rotate(${needle}deg)` }} />
            <small>{fluff < 0.4 ? "flat" : fluff < 1 ? "fluffy…" : chubby ? "chubby!" : "perfect ♥"}</small>
          </div>
          <div className="td-hopper">
            {puffs.map((p) => (
              <span key={p.id} className="td-puff" style={{ left: `${p.x}%`, top: `${p.y}%` }} />
            ))}
          </div>
          <span className="td-tube" />
        </div>
        <Teddy {...look} fluff={Math.max(0.05, fluff)} awake={false} className="td-stuffTeddy" />
        <div
          ref={wheel}
          className="td-wheel"
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={() => (drag.current = null)}
          onPointerCancel={() => (drag.current = null)}
          style={{ touchAction: "none" }}
          role="img"
          aria-label={`Stuffing wheel, ${Math.round(Math.min(1, fluff) * 100)}% full`}
        >
          <div className="td-wheelIn" style={{ transform: `rotate(${angle}deg)` }}>
            <span className="td-spoke" />
            <span className="td-spoke is-b" />
            <span className="td-handle" />
          </div>
        </div>
      </div>
      <div className="td-actions">
        {!done ? (
          <button type="button" className="td-btn is-ghost" onClick={auto}>
            Fill him up for me
          </button>
        ) : (
          <button type="button" className="td-btn" onClick={() => { sfx("swoosh-soft"); next(); }}>
            Now, his heart →
          </button>
        )}
      </div>
      {!done && <SkipChip onSkip={() => { f.current = 1; setFluff(1); }} delay={3000} />}
    </section>
  );
}
