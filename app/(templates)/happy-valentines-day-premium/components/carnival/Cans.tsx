"use client";

// Stall 5 · Knock down the week. Seven cans on the prize shelf, Rose Day to Kiss Day. Tap a can: a ball flies,
// the can tumbles off the shelf and his line for that day lands in the list. All seven: "…and today, it's you."

import { useEffect, useRef, useState } from "react";
import { haptic } from "../../../_valentine/kit";
import { GIF, WEEK, weekIcon } from "./model";
import { Gif, StallHead, reward, useStall } from "./ui";

// Pyramid: 4 on the bottom shelf, 2 above, 1 on top (index into WEEK).
const ROWS = [[6], [4, 5], [0, 1, 2, 3]];
const FALLBACK = "…and I'd do this day all over again.";

export default function Cans() {
  const { c, done, isDone, sfx } = useStall();
  const [down, setDown] = useState<boolean[]>(() => WEEK.map(() => false));
  const [ball, setBall] = useState<{ x: number; y: number; k: number } | null>(null);
  const [last, setLast] = useState<number | null>(null);
  const [helpOn, setHelpOn] = useState(false);
  const stallRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const n = down.filter(Boolean).length;
  const all = n === WEEK.length;

  useEffect(() => {
    const t = window.setTimeout(() => setHelpOn(true), 7000);
    const ts = timers.current;
    return () => {
      clearTimeout(t);
      ts.forEach(clearTimeout);
    };
  }, []);

  const knock = (i: number) => {
    if (down[i]) return;
    const can = document.getElementById(`vc-can-${i}`);
    const box = stallRef.current?.getBoundingClientRect();
    if (can && box) {
      const r = can.getBoundingClientRect();
      setBall((b) => ({ x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2, k: (b?.k ?? 0) + 1 }));
    }
    sfx("whoosh", { gain: 0.35 });
    timers.current.push(
      window.setTimeout(() => {
        setDown((d) => d.map((v, j) => (j === i ? true : v)));
        setLast(i);
        sfx("knock", { gain: 0.6 });
        sfx("vc-boing", { gain: 0.5, detune: i * 80 });
        haptic(14);
      }, 260),
    );
  };

  useEffect(() => {
    if (!all || isDone) return;
    const t = window.setTimeout(() => {
      reward(sfx, document.querySelector(".vc-today"), { big: true, cue: "vc-ding" });
      done();
    }, 500);
    return () => clearTimeout(t);
  }, [all, isDone, done, sfx]);

  const knockAll = () => WEEK.forEach((_, i) => !down[i] && timers.current.push(window.setTimeout(() => knock(i), 320 * i)));

  return (
    <section className="vc-scene vc-cansScene" aria-label="Knock down the week">
      <StallHead kicker="Stall 5 · Prize stall" title="Knock down our week" hint={all ? "Seven days. One you." : `Tap a can to knock it over · ${n}/7`} />
      <div className="vc-stall" ref={stallRef}>
        <div className="vc-awning" aria-hidden />
        {all ? <Gif src={GIF.bearsCuddle} size={150} tilt={-3} className="vc-stallWin vc-popIn" /> : <Gif src={GIF.teddyHeart} size={84} tilt={-4} className="vc-stallPrize" />}
        <div className="vc-shelves">
          {ROWS.map((row, r) => (
            <div key={r} className="vc-shelfRow">
              {row.map((i) => (
                <button
                  key={i}
                  id={`vc-can-${i}`}
                  type="button"
                  className={`vc-can${down[i] ? " is-down" : ""}`}
                  style={{ ["--col" as string]: WEEK[i].color, ["--dir" as string]: i % 2 ? 1 : -1 }}
                  onClick={() => knock(i)}
                  disabled={down[i]}
                  aria-label={down[i] ? `${WEEK[i].day}: knocked over` : `Knock over the ${WEEK[i].day} can`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={weekIcon(i)} alt="" width={30} height={30} loading="lazy" decoding="async" draggable={false} />
                  <b>{WEEK[i].short}</b>
                </button>
              ))}
              <i className="vc-plank" aria-hidden />
            </div>
          ))}
        </div>
        {ball && <i key={ball.k} className="vc-throw" style={{ ["--tx" as string]: `${ball.x}px`, ["--ty" as string]: `${ball.y}px` }} aria-hidden />}
      </div>

      <div className="vc-weekCard" aria-live="polite">
        {last === null ? (
          <p className="is-empty">Every can is one day of our week</p>
        ) : (
          <div key={last} className="vc-weekLine">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={weekIcon(last)} alt="" width={40} height={40} decoding="async" />
            <span>
              <small>{WEEK[last].day}</small>
              {c.weekLines[last] || FALLBACK}
            </span>
          </div>
        )}
      </div>
      <div className="vc-weekTrack" aria-label="Days knocked down">
        {WEEK.map((w, i) => (
          <button key={i} type="button" className={`${down[i] ? "is-on" : ""}${last === i ? " is-now" : ""}`} disabled={!down[i]} onClick={() => (setLast(i), sfx("tick", { gain: 0.3 }))} aria-label={down[i] ? `Read ${w.day} again` : `${w.day}: still standing`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={weekIcon(i)} alt="" width={26} height={26} loading="lazy" decoding="async" />
          </button>
        ))}
      </div>
      {all ? (
        <p className="vc-today">…and today, it&apos;s you. 💘</p>
      ) : (
        helpOn && <button type="button" className="vc-link" onClick={knockAll}>Knock them all down for me</button>
      )}
    </section>
  );
}
