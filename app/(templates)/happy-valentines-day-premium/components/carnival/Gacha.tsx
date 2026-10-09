"use client";

// Stall 3 · The gacha machine. Turn the knob (a circular drag, or tap it): a capsule drops out of the chute with a
// boing. Tap a capsule to twist it open: inside is one of their photos as a prize polaroid. Collect all four.

import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { haptic } from "../../../_valentine/kit";
import { CANDY, COUPONS, GIF, capsulePhotos } from "./model";
import { Gif, PopCard, Polaroid, StallHead, Washi, reward, useStall } from "./ui";

const TURN = 280; // degrees of knob per capsule
/** Capsules piled in the dome: [left px, bottom px, rotation]. The top ones leave first. */
const BALLS: [number, number, number][] = [
  [6, 4, 20], [48, 2, -30], [92, 4, 70], [136, 2, -10], [176, 6, 40],
  [24, 44, -60], [68, 42, 15], [112, 46, 100], [154, 44, -35],
  [44, 84, 50], [92, 88, -20], [136, 86, 80],
];

export default function Gacha() {
  const { c, done, isDone, sfx } = useStall();
  const prizes = capsulePhotos(c.photos);
  const [out, setOut] = useState(0); // capsules dispensed
  const [opened, setOpened] = useState<boolean[]>([false, false, false, false]);
  const [show, setShow] = useState<number | null>(null);
  const [angle, setAngle] = useState(0);
  const knobRef = useRef<HTMLButtonElement>(null);
  const drag = useRef<{ last: number; acc: number; moved: number } | null>(null);
  const outRef = useRef(0);
  const openCount = opened.filter(Boolean).length;
  const all = openCount === 4;

  const dispense = () => {
    if (outRef.current >= 4) return;
    outRef.current += 1;
    setOut(outRef.current);
    sfx("creak", { gain: 0.35 });
    window.setTimeout(() => sfx("vc-boing", { gain: 0.9, detune: (Math.random() - 0.5) * 300 }), 420);
    haptic(12);
  };

  const ang = (e: RPointerEvent) => {
    const r = knobRef.current!.getBoundingClientRect();
    return (Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180) / Math.PI;
  };
  const onDown = (e: RPointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { last: ang(e), acc: 0, moved: 0 };
  };
  const onMove = (e: RPointerEvent<HTMLButtonElement>) => {
    const d = drag.current;
    if (!d) return;
    const a = ang(e);
    let delta = a - d.last;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    d.last = a;
    const step = Math.abs(delta);
    // A ratchet tick every 45° (the knob's rotation is its visual twin).
    if (Math.floor((d.moved + step) / 45) > Math.floor(d.moved / 45)) sfx("tick", { gain: 0.25 });
    d.acc += step;
    d.moved += step;
    setAngle((x) => x + step);
    if (d.acc >= TURN) {
      d.acc -= TURN;
      dispense();
    }
  };
  const onUp = () => {
    const d = drag.current;
    drag.current = null;
    // A tap (barely moved): the knob does one full click-turn for her.
    if (d && d.moved < 25) {
      setAngle((x) => x + 360);
      dispense();
    }
  };

  const openCapsule = (i: number) => {
    if (!opened[i]) {
      setOpened((o) => o.map((v, j) => (j === i ? true : v)));
      reward(sfx, document.getElementById(`vc-cap-${i}`), { cue: "chime" });
      sfx("pop", { gain: 0.7 });
    } else sfx("page-turn", { gain: 0.5 });
    setShow(i);
  };

  useEffect(() => {
    if (!all || isDone || show !== null) return;
    const t = window.setTimeout(() => {
      sfx("vc-ding", { gain: 0.7 });
      done();
    }, 300);
    return () => clearTimeout(t);
  }, [all, isDone, show, done, sfx]);

  const capLabel = (i: number) => prizes[i]?.caption || (prizes[i] ? `Memory #${i + 1}` : COUPONS[i]);

  return (
    <section className="vc-scene vc-gachaScene" aria-label="Gacha machine">
      <StallHead
        kicker="Stall 3 · Gacha machine"
        title="Win a memory"
        hint={all ? "All four won. Lucky girl (lucky me)." : out < 4 ? "Turn the knob, or just tap it" : "Tap a capsule to twist it open"}
      />
      <div className="vc-gacha">
        <div className="vc-dome" aria-hidden>
          {BALLS.map(([x, y, r], i) => (
            <i key={i} className="vc-ball" style={{ ["--col" as string]: CANDY[i % CANDY.length], left: x, bottom: y, transform: `rotate(${r}deg)`, opacity: i < BALLS.length - out ? 1 : 0 }} />
          ))}
          <i className="vc-domeShine" />
        </div>
        <div className="vc-gBase">
          <span className="vc-gLabel">♥ 1 TURN = 1 MEMORY ♥</span>
          <button
            ref={knobRef}
            type="button"
            className="vc-knob"
            style={{ transform: `rotate(${angle}deg)` }}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={() => (drag.current = null)}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), setAngle((x) => x + 360), dispense())}
            disabled={out >= 4}
            aria-label={`Turn the knob (${4 - out} capsules left)`}
          >
            <i />
          </button>
          <span className="vc-chute" aria-hidden />
        </div>
        <Gif src={all ? GIF.partyPopper : GIF.bearsGift} size={96} tilt={6} float className="vc-gachaGif" />
      </div>

      <div className="vc-tray" role="list" aria-label="Your capsules">
        {[0, 1, 2, 3].map((i) =>
          i < out ? (
            <button
              key={i}
              id={`vc-cap-${i}`}
              type="button"
              role="listitem"
              className={`vc-capsule${opened[i] ? " is-open" : ""}`}
              style={{ ["--col" as string]: CANDY[(i * 3) % CANDY.length], ["--i" as string]: i }}
              onClick={() => openCapsule(i)}
              aria-label={opened[i] ? `Prize ${i + 1}: ${capLabel(i)}` : `Open capsule ${i + 1}`}
            >
              {opened[i] ? (
                <span className="vc-capMini">{prizes[i] ? <Polaroid photo={prizes[i]} caption="" width={58} /> : <b>🎟</b>}</span>
              ) : (
                <>
                  <i className="vc-capTop" />
                  <i className="vc-capBot" />
                </>
              )}
            </button>
          ) : (
            <span key={i} className="vc-capSlot" role="listitem" aria-label="Still in the machine" />
          ),
        )}
      </div>

      <PopCard open={show !== null} onClose={() => setShow(null)} label="Your prize">
        {show !== null && (
          <div className="vc-prize">
            <span className="vc-prizeKick">Prize {show + 1} of 4 ✦</span>
            <Polaroid photo={prizes[show]} caption={capLabel(show)} fallback="🎟" tilt={-3} width={250} eager>
              <Washi rot={-8} style={{ left: "50%", top: -12, marginLeft: -40 }} />
            </Polaroid>
            {prizes[show]?.note && <p className="vc-prizeNote">{prizes[show]!.note}</p>}
          </div>
        )}
      </PopCard>
    </section>
  );
}
