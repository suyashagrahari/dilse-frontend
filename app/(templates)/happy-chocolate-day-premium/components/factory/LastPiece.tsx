"use client";

// Station 7 · The last piece. One piece of chocolate left on the plate: "Who gets it?" Her name, or his. His button
// won't take it (it hops away with a line each time and finally gives up and becomes hers). When she picks herself the
// bar snaps in two and the bigger half slides over to her with his line.

import { useRef, useState } from "react";
import { haptic } from "../../../_valentine/kit";
import { GIF } from "./model";
import { Gif, SlotGif, Sprinkles, StationHead, reward, useStation } from "./ui";

const SPOTS = [
  { x: 78, y: 16 },
  { x: 18, y: 70 },
  { x: 80, y: 74 },
];

export default function LastPiece() {
  const { f, sfx, done } = useStation();
  const [dodges, setDodges] = useState(0);
  const [taken, setTaken] = useState(false);
  const lastDodge = useRef(0);
  const lines = [`Nope. ${f.from} already had six 😋`, "It's yours. That's the rule.", "Okay fine, it's still yours 💖"];
  const gaveUp = dodges >= lines.length;

  const dodge = () => {
    if (gaveUp || taken) return;
    const now = performance.now();
    if (now - lastDodge.current < 300) return;
    lastDodge.current = now;
    setDodges((d) => d + 1);
    sfx("swoosh-soft", { gain: 0.45 });
    sfx("plush-squeak", { gain: 0.3, detune: dodges * 120 });
    haptic(8);
  };
  const take = () => {
    if (taken) return;
    setTaken(true);
    sfx("snap", { gain: 0.7 });
    window.setTimeout(() => sfx("swoosh-soft", { gain: 0.4 }), 300);
    window.setTimeout(() => {
      reward(sfx, document.querySelector(".sf-halfBig"), { big: true, cue: "chime-cascade" });
      done();
    }, 900);
  };

  const spot = SPOTS[(dodges - 1 + SPOTS.length) % SPOTS.length];

  return (
    <section className={`sf-scene sf-last${taken ? " is-taken" : ""}`} aria-label="The last piece">
      <StationHead kicker="Station 7 · The tasting table" title={taken ? "The bigger half. Obviously." : "Uh oh. One piece left."} hint={taken ? undefined : "Who gets the last piece?"} />
      <div className="sf-plate">
        <Gif src={taken ? GIF.bearsGift : GIF.bearsDinner} size={96} tilt={-6} float className="sf-plateGif" key={taken ? "t" : "a"} />
        <div className="sf-pieceBar" aria-hidden>
          <span className="sf-half sf-halfSmall">
            <i />
          </span>
          <span className="sf-half sf-halfBig">
            <i />
            <i />
          </span>
          <Sprinkles n={6} seed={4} className="sf-pieceSprinkles" />
        </div>
        <span className="sf-crumbs" aria-hidden />
      </div>

      {taken ? (
        <div className="sf-lastLine">
          <SlotGif id="sf5-share" size={92} tilt={5} className="sf-popIn" eager />
          <p>{f.lastPiece}</p>
        </div>
      ) : (
        <div className="sf-pick">
          {dodges > 0 && !gaveUp && (
            <span className="sf-bubble" key={dodges} aria-live="polite">
              {lines[dodges - 1]}
            </span>
          )}
          {gaveUp && (
            <span className="sf-bubble" aria-live="polite">
              {lines[lines.length - 1]}
            </span>
          )}
          <div className="sf-pickZone">
            <button type="button" className="sf-puffy is-pink sf-pickMe" onClick={take} style={{ transform: `scale(${Math.min(1.25, 1 + dodges * 0.08)})` }}>
              {f.to} 💖
            </button>
            {gaveUp ? (
              <button type="button" className="sf-puffy is-butter sf-pickMe2" onClick={take}>
                Also {f.to} 🍫
              </button>
            ) : (
              <button
                type="button"
                className={`sf-pickHim${dodges ? " is-hopping" : ""}`}
                style={dodges ? { left: `${spot.x}%`, top: `${spot.y}%`, transform: `translate(-50%, -50%) scale(${1 - dodges * 0.1})` } : undefined}
                onPointerEnter={(e) => e.pointerType === "mouse" && dodge()}
                onPointerDown={(e) => {
                  e.preventDefault();
                  dodge();
                }}
                onClick={dodge}
              >
                {f.from}
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
