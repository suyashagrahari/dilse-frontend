"use client";

// Scene 2 · Pick its colour. The bud blooms (sparkle + chime), then she taps colour chips: the rose recolours with
// a jelly squash and a sticky note says what that colour means, from him. His own pick wears a little heart and
// shows his reason. A blushing teddy with a rose peeks from the side.

import { useEffect, useRef, useState } from "react";
import { burst, haptic, useReducedMotion } from "../../../_valentine/kit";
import { usePremium } from "../../../_valentine/kit/premium";
import type { DayConfig } from "../../../_valentine/types";
import { Plant, shadesFor } from "../../../happy-rose-day/components/rose/art";
import { Slot } from "./art";
import { Puffy, Scene, originOf } from "./ui";
import { COLOR_NAME, COLOR_SAYS, SWATCH, chipColors, type Garden, type RoseColor } from "./util";

export function ColourScene({ g, day, gifs, step, total, onDone }: { g: Garden; day: DayConfig; gifs?: Record<string, string>; step: number; total: number; onDone: () => void }) {
  const { sfx } = usePremium();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(reduce ? 1 : 0.44);
  const [pick, setPick] = useState<RoseColor>(g.color);
  const [tries, setTries] = useState(0);
  const roseRef = useRef<HTMLDivElement>(null);
  const bloomed = open >= 1;

  useEffect(() => {
    if (reduce) return;
    let raf = 0;
    const t0 = performance.now() + 350;
    sfx("swoosh-soft", { gain: 0.5, at: 0.3 });
    const tick = (now: number) => {
      const k = Math.max(0, Math.min(1, (now - t0) / 1700));
      const e = 1 - Math.pow(1 - k, 3);
      setOpen(0.44 + 0.56 * e);
      if (k < 1) raf = requestAnimationFrame(tick);
      else {
        sfx("rg-aww", { gain: 0.7 });
        burst({ kind: "petals", origin: originOf(roseRef.current, 0.3), count: 18, spread: 0.3 });
        haptic([15, 40, 25]);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduce, sfx]);

  const choose = (c: RoseColor) => {
    setPick(c);
    setTries((t) => t + 1);
    sfx("rg-boing", { gain: 0.45, detune: ((tries * 137) % 200) - 100 });
    sfx("sparkle", { gain: 0.3 });
    haptic(12);
    if (c === g.color) burst({ kind: "hearts", origin: originOf(roseRef.current, 0.3), count: 14, spread: 0.22 });
  };

  const his = pick === g.color;
  const note = his && g.colorReason ? g.colorReason : `${COLOR_NAME[pick]}: ${COLOR_SAYS[pick]}`;

  return (
    <Scene
      id="colour"
      step={step}
      total={total}
      label="Pick the colour of your rose"
      kicker="Step 2 · your colour"
      title={bloomed ? "What colour is your rose?" : "It's blooming…"}
      sub={bloomed ? "Tap a colour. Each one says something 💬" : " "}
    >
      <div className="rg-colourStage">
        <div className="rg-colourRose" ref={roseRef}>
          <div key={pick} className={tries ? "rg-jelly" : undefined} style={{ width: "100%", height: "100%" }}>
            <Plant progress={open} id={`col-${pick}`} sh={shadesFor(pick)} />
          </div>
          <Slot day={day} gifs={gifs} id="rg3-blush" size={92} className="rg-colourPeek" tilt={8} eager />
        </div>
        {bloomed && (
          <div className="rg-sticky" key={pick} aria-live="polite">
            {his && <span className="rg-stickyTag">his pick for you 💗</span>}
            <p>{note}</p>
          </div>
        )}
      </div>
      <div className={`rg-chips${bloomed ? " is-on" : ""}`} role="radiogroup" aria-label="Rose colours">
        {chipColors(g.color).map((c) => (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={pick === c}
            aria-label={`${COLOR_NAME[c]}${c === g.color ? " (his pick)" : ""}`}
            className={`rg-chip${pick === c ? " is-on" : ""}`}
            style={{ ["--sw" as string]: SWATCH[c] }}
            onClick={() => choose(c)}
            disabled={!bloomed}
          >
            <i />
            {c === g.color && <b aria-hidden>💗</b>}
          </button>
        ))}
      </div>
      <div className="rg-foot">
        <Puffy onClick={onDone} disabled={!bloomed} cue="pop">
          {tries > 0 ? "Now, the real test… 🌼" : "I like it! Next 🌼"}
        </Puffy>
      </div>
    </Scene>
  );
}
