"use client";

// Station 2 · The wrapping room. A giant chocolate bar in a pink paper wrapper ("{house} · {her} edition"). She drags
// the wrapper down (or taps it) and it slides off with a crinkle; then she tears the gold foil open; inside, the bar
// is her photo pressed in "chocolate relief" (sepia, ridged into squares) that warms into full colour.

import { useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { CroppedPhoto } from "../../../_valentine/kit";
import { GIF, pick } from "./model";
import { Gif, StationHead, reward, useStation } from "./ui";

const PULL = 90;

export default function Unwrap() {
  const { f, sfx, done } = useStation();
  const photo = pick(f.photos, 0);
  const [stage, setStage] = useState<"wrapped" | "foil" | "bar">("wrapped");
  const [dy, setDy] = useState(0);
  const [dragging, setDragging] = useState(false);
  const start = useRef<{ y: number; id: number } | null>(null);

  const slideOff = () => {
    if (stage !== "wrapped") return;
    setStage("foil");
    setDy(0);
    sfx("paper-rustle", { gain: 0.8 });
    sfx("whoosh", { gain: 0.35 });
    reward(sfx, document.querySelector(".sf-bar"), { small: true, cue: "pop" });
  };
  const tearFoil = () => {
    if (stage !== "foil") return;
    setStage("bar");
    sfx("paper-rustle", { gain: 0.9, detune: 500 });
    window.setTimeout(() => sfx("snap", { gain: 0.5 }), 120);
    window.setTimeout(() => {
      reward(sfx, document.querySelector(".sf-bar"), { big: true, cue: "chime-cascade" });
      done();
    }, 900);
  };

  const onDown = (e: RPointerEvent<HTMLButtonElement>) => {
    if (stage !== "wrapped") return;
    start.current = { y: e.clientY, id: e.pointerId };
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDragging(true);
  };
  const onMove = (e: RPointerEvent<HTMLButtonElement>) => {
    const s = start.current;
    if (!s || s.id !== e.pointerId) return;
    const v = Math.max(0, e.clientY - s.y);
    if (Math.floor(v / 30) !== Math.floor(dy / 30)) sfx("paper-rustle", { gain: 0.25, detune: v * 3 });
    setDy(v);
  };
  const onUp = () => {
    const s = start.current;
    start.current = null;
    setDragging(false);
    if (!s) return;
    // A real pull or a plain tap both slide it off.
    if (dy > PULL || dy < 6) slideOff();
    else setDy(0);
  };

  const pull = Math.min(1, dy / PULL);

  return (
    <section className="sf-scene sf-unwrap" aria-label="The wrapping room">
      <StationHead
        kicker="Station 2 · The wrapping room"
        title={stage === "bar" ? "Limited edition: you" : "One bar. Made for you."}
        hint={stage === "wrapped" ? "Pull the wrapper down to unwrap it" : stage === "foil" ? "Now tear the gold foil open" : undefined}
      />
      <div className={`sf-barStage is-${stage}`}>
        <Gif src={stage === "bar" ? GIF.barHeart : GIF.penguinBar} size={92} tilt={-8} float className="sf-barGif" key={stage === "bar" ? "b" : "a"} />
        <div className="sf-bar">
          <div className="sf-barPhoto">
            {photo ? <CroppedPhoto photo={photo} eager alt={photo.caption || ""} /> : <span className="sf-barEmpty">💗</span>}
            <i className="sf-barGrid" aria-hidden />
          </div>
          <button type="button" className="sf-foil" onClick={tearFoil} disabled={stage !== "foil"} aria-label="Tear the gold foil" tabIndex={stage === "foil" ? 0 : -1}>
            <i className="sf-foilHalf is-l" />
            <i className="sf-foilHalf is-r" />
            {stage === "foil" && <span className="sf-foilHint">tear ✦</span>}
          </button>
          <button
            type="button"
            className="sf-wrapper"
            style={stage === "wrapped" ? { transform: `translateY(${dy}px) rotate(${pull * 3}deg)`, transition: dragging ? "none" : undefined } : undefined}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), slideOff())}
            disabled={stage !== "wrapped"}
            aria-label="Pull the wrapper off"
          >
            <span className="sf-wrapTop">{f.house}</span>
            <b className="sf-wrapName">{f.to}</b>
            <span className="sf-wrapEd">limited edition · 100% you</span>
            <span className="sf-wrapNet">net wt. all my love · 0 calories</span>
            <span className="sf-wrapPull" aria-hidden>
              ↓ pull
            </span>
          </button>
        </div>
      </div>
      <p className={`sf-barCaption${stage === "bar" ? " is-on" : ""}`}>{stage === "bar" ? photo?.caption || `Ingredients: ${f.to}, and a lot of me missing you.` : " "}</p>
    </section>
  );
}
