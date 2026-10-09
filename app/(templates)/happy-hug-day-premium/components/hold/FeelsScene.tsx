"use client";

// Chapter 4: What your hugs feel like. The page is in colour now. Up to four prints lie in a loose stack, each with one
// line above it ("Like coming home with the lights on."). Swipe the top print away (or tap it) to reach the next; it
// flies off with a soft swoosh. After the last one: the letter.

import { useRef, useState, type PointerEvent as RPE } from "react";
import { CroppedPhoto, haptic, useReducedMotion } from "../../../_valentine/kit";
import { PremiumCTA, sfx } from "../../../_valentine/kit/premium";
import { initialOf, type Hug } from "./model";
import { CTA_STYLE, Eyebrow, Scene } from "./ui";

const TILT = [-4, 3, -2, 5];

export default function FeelsScene({ h, nextLabel, onNext }: { h: Hug; nextLabel: string; onNext: () => void }) {
  const reduce = useReducedMotion();
  const n = h.feels.length;
  const [top, setTop] = useState(0);
  const [gone, setGone] = useState<{ i: number; dir: number } | null>(null);
  const [dx, setDx] = useState(0);
  const start = useRef<{ x: number; y: number; t: number } | null>(null);
  const finished = top >= n;

  const fling = (dir: number) => {
    if (finished) return;
    setGone({ i: top, dir });
    setDx(0);
    sfx("swoosh-soft", { gain: 0.5, pan: dir * 0.4 });
    haptic(10);
    setTop((t) => t + 1);
  };

  const down = (e: RPE<HTMLElement>) => {
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
    start.current = { x: e.clientX, y: e.clientY, t: e.timeStamp };
  };
  const move = (e: RPE<HTMLElement>) => {
    if (start.current) setDx(e.clientX - start.current.x);
  };
  const up = (e: RPE<HTMLElement>) => {
    const s = start.current;
    start.current = null;
    if (!s) return;
    const d = e.clientX - s.x;
    const quick = e.timeStamp - s.t < 260 && Math.abs(d) < 8;
    if (Math.abs(d) > 70 || quick) fling(d === 0 ? 1 : Math.sign(d));
    else setDx(0);
  };

  return (
    <Scene label="What your hugs feel like" className="hh-light hh-feels">
      <header className="hh-feelsHead">
        <Eyebrow>{finished ? "Every time" : `What your hugs feel like · ${String(top + 1).padStart(2, "0")} / ${String(n).padStart(2, "0")}`}</Eyebrow>
        <p key={finished ? "done" : top} className="hh-feelLine hh-rise">
          {finished ? (
            <>
              All of it, <em>in one hug.</em>
            </>
          ) : (
            h.feels[top]
          )}
        </p>
      </header>

      <div className="hh-stack" aria-live="polite">
        {h.feels.map((line, i) => {
          if (i < top && gone?.i !== i) return null;
          const depth = i - top;
          const isTop = depth === 0;
          const flying = gone?.i === i;
          const ph = h.feelPhotos[i];
          const style = flying
            ? { transform: `translate3d(${gone!.dir * 120}vw, -4vh, 0) rotate(${gone!.dir * 24}deg)`, opacity: reduce ? 0 : 1, zIndex: 20 }
            : {
                transform: isTop
                  ? `translate3d(${dx}px, 0, 0) rotate(${TILT[i % 4] + dx / 18}deg)`
                  : `translate3d(${depth * 6}px, ${depth * 10}px, 0) rotate(${TILT[i % 4]}deg) scale(${1 - depth * 0.04})`,
                zIndex: 10 - depth,
                transition: isTop && dx !== 0 ? "none" : undefined,
              };
          return (
            <div
              key={i}
              className={`hh-card${isTop ? " is-top" : ""}${flying ? " is-gone" : ""}`}
              style={style}
              onTransitionEnd={flying ? () => setGone(null) : undefined}
              {...(isTop && !finished
                ? {
                    role: "button",
                    tabIndex: 0,
                    "aria-label": `${line}. Swipe or press to see the next one`,
                    onPointerDown: down,
                    onPointerMove: move,
                    onPointerUp: up,
                    onPointerCancel: () => {
                      start.current = null;
                      setDx(0);
                    },
                    onKeyDown: (e: React.KeyboardEvent) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        fling(1);
                      }
                    },
                  }
                : { "aria-hidden": true })}
            >
              <span className="hh-cardPic">
                {ph ? <CroppedPhoto photo={ph} eager={i < 2} alt="" style={{ background: "#d9c9b5" }} /> : <span className="hh-cardBlank">{initialOf(h.to)}</span>}
              </span>
              {ph?.caption && <span className="hh-cardCap">{ph.caption}</span>}
            </div>
          );
        })}
        {finished && (
          <div className="hh-stackDone hh-rise" aria-hidden>
            {h.feelPhotos.slice(0, 4).map((ph, i) =>
              ph ? (
                <span key={i} className="hh-mini" style={{ transform: `rotate(${TILT[i % 4] * 1.6}deg) translateY(${i % 2 ? 8 : -6}px)` }}>
                  <CroppedPhoto photo={ph} alt="" />
                </span>
              ) : null,
            )}
          </div>
        )}
      </div>

      <div className="hh-foot">
        {finished ? (
          <PremiumCTA style={CTA_STYLE} tone="ember" cue="tick" onClick={onNext}>
            {nextLabel}
          </PremiumCTA>
        ) : (
          <p className="hh-swipeHint" aria-hidden>
            Swipe it away
          </p>
        )}
      </div>
      <style>{CSS}</style>
    </Scene>
  );
}

const CSS = `
.hh-feels .hh-in { gap: 18px; }
.hh-feelsHead { display: grid; justify-items: center; gap: 14px; min-height: 148px; align-content: start; }
.hh-feelLine { margin: 0; font: 400 clamp(36px, 10.2vw, 70px)/1.02 var(--hh-display); font-style: italic; letter-spacing: -.015em; color: var(--hh-cocoa); max-width: 13ch; text-wrap: balance; }
.hh-feelLine em { color: var(--hh-apricot-deep); }
.hh-stack { position: relative; width: clamp(230px, 68vw, 360px); aspect-ratio: 4 / 5.15; flex: 0 0 auto; margin: 4px 0 0; }
.hh-card { position: absolute; inset: 0; box-sizing: border-box; padding: 10px 10px 44px; border-radius: 3px; background: #FFFCF7; touch-action: none; user-select: none; -webkit-user-select: none;
  box-shadow: 0 30px 60px -28px rgba(75,52,38,.6), 0 2px 6px rgba(75,52,38,.18); transition: transform .7s var(--hh-ease), opacity .7s ease; will-change: transform; }
.hh-card.is-top { cursor: grab; }
.hh-card.is-top:focus-visible { outline: 3px solid var(--hh-apricot-deep); outline-offset: 4px; }
.hh-card.is-gone { transition: transform .75s cubic-bezier(.5,0,.75,0), opacity .75s ease; pointer-events: none; }
.hh-cardPic { display: block; width: 100%; height: 100%; overflow: hidden; background: #d9c9b5; filter: saturate(1.06) contrast(1.03) sepia(.06); }
.hh-cardBlank { display: grid; place-items: center; width: 100%; height: 100%; font: 400 120px/1 var(--hh-display); font-style: italic; color: var(--hh-cloud); background: radial-gradient(circle, #F2A477, #C9774A); }
.hh-cardCap { position: absolute; left: 12px; right: 12px; bottom: 12px; font: 400 18px/1.1 var(--hh-display); font-style: italic; color: rgba(75,52,38,.82); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.hh-stackDone { position: absolute; inset: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; align-content: center; padding: 6px; }
.hh-mini { display: block; aspect-ratio: 4 / 5; padding: 5px 5px 16px; background: #FFFCF7; box-shadow: 0 16px 30px -18px rgba(75,52,38,.7); }
.hh-swipeHint { margin: 0; font: 700 11px/1 var(--hh-ui); letter-spacing: .3em; text-transform: uppercase; color: rgba(75,52,38,.55); }
.hh-swipeHint::before { content: "←  "; } .hh-swipeHint::after { content: "  →"; }
@media (min-width: 1024px) {
  .hh-feels .hh-in { display: grid; grid-template-columns: 1fr auto; grid-template-rows: 1fr 1fr; align-items: center; column-gap: 96px; text-align: left; max-width: 1100px; }
  .hh-feelsHead { justify-items: start; grid-column: 1; grid-row: 1; align-self: end; min-height: 0; }
  .hh-feelLine { max-width: 12ch; font-size: clamp(56px, 5.4vw, 84px); }
  .hh-stack { grid-column: 2; grid-row: 1 / span 2; width: min(380px, 30vw); }
  .hh-feels .hh-foot { grid-column: 1; grid-row: 2; justify-items: start; margin-top: 0; padding-top: 30px; align-self: start; }
}
@media (prefers-reduced-motion: reduce) { .hh-card, .hh-card.is-gone { transition: opacity .3s ease; } }
`;
