"use client";

// Stall 1 · Balloon pop. Heart balloons float over the stall; each pop drops its word into the line below, in its
// own place, until his whole sentence is there. The last pop: chime, heart burst, the cats cheer.

import { useEffect, useRef, useState } from "react";
import { burst, haptic } from "../../../_valentine/kit";
import { CANDY, C, GIF } from "./model";
import { Gif, SlotGif, StallHead, reward, useStall } from "./ui";

// Loose, hand-placed spots (percent of the sky) for up to 8 balloons.
const SPOTS = [
  [14, 22], [38, 10], [62, 20], [86, 8],
  [24, 58], [50, 46], [76, 58], [92, 40],
];

export default function Balloons() {
  const { c, done, isDone, sfx } = useStall();
  const words = c.words;
  const [popped, setPopped] = useState<boolean[]>(() => words.map(() => false));
  const [helpOn, setHelpOn] = useState(false);
  const lineRef = useRef<HTMLParagraphElement>(null);
  const count = popped.filter(Boolean).length;
  const all = count === words.length;
  const timers = useRef<number[]>([]);

  useEffect(() => {
    const t = window.setTimeout(() => setHelpOn(true), 6000);
    const ts = timers.current;
    return () => {
      clearTimeout(t);
      ts.forEach(clearTimeout);
    };
  }, []);

  const pop = (i: number, el?: HTMLElement | null) => {
    setPopped((p) => {
      if (p[i]) return p;
      const n = [...p];
      n[i] = true;
      return n;
    });
    sfx("pop", { gain: 0.9, detune: ((i * 137) % 500) - 250 });
    haptic(10);
    if (el) {
      const r = el.getBoundingClientRect();
      burst({ kind: "confetti", count: 14, spread: 0.12, colors: [CANDY[i % CANDY.length], "#FFFFFF", C.pop], origin: { x: (r.left + r.width / 2) / window.innerWidth, y: (r.top + r.height / 2) / window.innerHeight } });
    }
  };

  useEffect(() => {
    if (!all || isDone) return;
    const t = window.setTimeout(() => {
      reward(sfx, lineRef.current, { big: true, cue: "chime-cascade" });
      done();
    }, 380);
    return () => clearTimeout(t);
  }, [all, isDone, done, sfx]);

  const popAll = () => {
    words.forEach((_, i) => {
      if (popped[i]) return;
      timers.current.push(window.setTimeout(() => pop(i, document.getElementById(`vc-balloon-${i}`)), 160 * i));
    });
  };

  return (
    <section className="vc-scene vc-balloons" aria-label="Balloon pop">
      <StallHead kicker="Stall 1 · Balloon pop" title="Pop every balloon" hint={all ? "There it is. Read it out loud." : `Each one is hiding a word · ${count}/${words.length}`} />
      <div className={`vc-sky${all ? " is-clear" : ""}`}>
        {words.map((w, i) => {
          const [x, y] = SPOTS[i % SPOTS.length];
          const col = CANDY[i % CANDY.length];
          return (
            <button
              key={i}
              id={`vc-balloon-${i}`}
              type="button"
              className={`vc-balloon${popped[i] ? " is-popped" : ""}`}
              style={{ left: `${x}%`, top: `${y}%`, ["--d" as string]: `${(i * 0.37) % 2.4}s`, ["--col" as string]: col }}
              onPointerDown={(e) => pop(i, e.currentTarget)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && pop(i, e.currentTarget)}
              aria-label={popped[i] ? `Popped: ${w}` : `Pop balloon ${i + 1}`}
              disabled={popped[i]}
            >
              <svg viewBox="0 0 60 92" width="60" height="92" aria-hidden>
                <path d="M30 56 C 6 40, 0 26, 0 17 A 15 15 0 0 1 30 12 A 15 15 0 0 1 60 17 C 60 26, 54 40, 30 56 Z" fill={col} />
                <path d="M12 10 Q 8 18 11 26" stroke="#fff" strokeOpacity=".7" strokeWidth="4" strokeLinecap="round" fill="none" />
                <path d="M27 56 L33 56 L30 61 Z" fill={col} />
                <path d="M30 61 C 24 70, 36 76, 30 92" stroke="#C9184A" strokeOpacity=".45" strokeWidth="1.4" fill="none" />
              </svg>
              {popped[i] && <span className="vc-popWord">pop!</span>}
            </button>
          );
        })}
        <Gif src={GIF.bunnyHeart} size={92} tilt={-6} float className="vc-skyBunny" />
      </div>

      <p className={`vc-line${all ? " is-all" : ""}`} ref={lineRef} aria-live="polite">
        {words.map((w, i) => (
          <span key={i} className={`vc-word${popped[i] ? " is-on" : ""}`} style={{ ["--col" as string]: CANDY[i % CANDY.length] }}>
            {popped[i] ? w : "•••"}
          </span>
        ))}
      </p>

      <div className="vc-react">
        {all ? <SlotGif id="vc2-balloons" size={132} tilt={4} className="vc-popIn" /> : helpOn && <button type="button" className="vc-link" onClick={popAll}>Pop them all for me</button>}
      </div>
    </section>
  );
}
