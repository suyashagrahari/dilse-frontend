"use client";

// Station 3 · The dipping station. Her photos hang one at a time from a little clothes-peg over a pot of warm
// chocolate. She drags the polaroid down into the pot (or taps it): it dips with a plop and comes back up dipped like
// a chocolate strawberry, sprinkles on, and its tag shows the memory. Each dipped one joins the tray below.

import { useMemo, useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { GIF, dipPhotos } from "./model";
import { Drips, Gif, Polaroid, Sprinkles, StationHead, reward, useStation } from "./ui";
import { CroppedPhoto } from "../../../_valentine/kit";

const DIP_AT = 70;

export default function Dip() {
  const { f, sfx, done } = useStation();
  const photos = useMemo(() => dipPhotos(f.photos), [f.photos]);
  const [at, setAt] = useState(0);
  const [dipped, setDipped] = useState<number[]>([]);
  const [phase, setPhase] = useState<"hang" | "down" | "up">("hang");
  const [dy, setDy] = useState(0);
  const [dragging, setDragging] = useState(false);
  const start = useRef<{ y: number; id: number } | null>(null);
  const cur = photos[at];
  const isDipped = dipped.includes(at);
  const allDone = dipped.length >= photos.length;

  const dip = () => {
    if (phase !== "hang" || isDipped) return;
    setPhase("down");
    setDy(0);
    sfx("swoosh-soft", { gain: 0.4 });
    window.setTimeout(() => {
      sfx("sf-plop", { gain: 0.7 });
      sfx("bubble", { gain: 0.35, count: 3 });
    }, 300);
    window.setTimeout(() => {
      setPhase("up");
      const next = [...dipped, at];
      setDipped(next);
      reward(sfx, document.querySelector(".sf-dipFrame"), { cue: "chime" });
      if (next.length === Math.min(3, photos.length)) done();
      if (next.length === photos.length) window.setTimeout(() => reward(sfx, document.querySelector(".sf-tray"), { big: true, cue: "sf-ding" }), 500);
    }, 900);
  };
  const nextPhoto = () => {
    const n = photos.findIndex((_, i) => !dipped.includes(i) && i !== at);
    if (n < 0) return;
    setAt(n);
    setPhase("hang");
    sfx("swoosh-soft", { gain: 0.35 });
  };

  const onDown = (e: RPointerEvent<HTMLButtonElement>) => {
    if (phase !== "hang" || isDipped) return;
    start.current = { y: e.clientY, id: e.pointerId };
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setDragging(true);
  };
  const onMove = (e: RPointerEvent<HTMLButtonElement>) => {
    const s = start.current;
    if (!s || s.id !== e.pointerId) return;
    setDy(Math.max(0, Math.min(120, e.clientY - s.y)));
  };
  const onUp = () => {
    const s = start.current;
    start.current = null;
    setDragging(false);
    if (!s) return;
    if (dy > DIP_AT || dy < 6) dip();
    else setDy(0);
  };

  const shownDipped = isDipped && phase !== "down";

  return (
    <section className="sf-scene sf-dip" aria-label="The dipping station">
      <StationHead
        kicker="Station 3 · The dipping station"
        title="Chocolate-dipped memories"
        hint={allDone ? "Every one of them dipped. Delicious." : phase === "hang" && !isDipped ? "Pull the photo down into the chocolate" : undefined}
      />
      <div className="sf-dipStage">
        <svg className="sf-line" viewBox="0 0 300 30" preserveAspectRatio="none" aria-hidden>
          <path d="M0 6 Q150 30 300 6" fill="none" stroke="#C98A5B" strokeWidth="2.5" />
        </svg>
        <button
          type="button"
          key={at}
          className={`sf-dipFrame is-${phase}${shownDipped ? " is-dipped" : ""}`}
          style={phase === "hang" && !isDipped ? { transform: `translateY(${dy}px)`, transition: dragging ? "none" : undefined } : undefined}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && (e.preventDefault(), dip())}
          aria-label={isDipped ? "Dipped" : "Dip this photo in chocolate"}
        >
          <i className="sf-peg" aria-hidden />
          <Polaroid photo={cur} width={196} tilt={at % 2 ? 3 : -3} caption={shownDipped ? cur?.caption || "us, dipped in chocolate" : ""} eager>
            {shownDipped && (
              <>
                <Drips className="sf-dipCoat" seed={at + 1} band={30} />
                <Sprinkles n={9} seed={at + 2} className="sf-dipSprinkles" />
              </>
            )}
          </Polaroid>
        </button>
        <div className="sf-pot" aria-hidden>
          <span className="sf-potChoc">
            <i className="sf-bub" style={{ ["--i" as string]: 0 }} />
            <i className="sf-bub" style={{ ["--i" as string]: 1 }} />
            <i className="sf-bub" style={{ ["--i" as string]: 2 }} />
          </span>
          <span className="sf-potBody">
            <b>warm chocolate</b>
          </span>
        </div>
        <Gif src={GIF.pandaSnack} size={84} tilt={7} float className="sf-dipGif" />
      </div>

      <div className="sf-dipNote" aria-live="polite">
        {shownDipped && cur?.note ? <p key={at}>{cur.note}</p> : null}
      </div>

      <div className="sf-tray" aria-label="Your dipped photos">
        {photos.map((ph, i) => (
          <button
            key={i}
            type="button"
            className={`sf-trayItem${dipped.includes(i) ? " is-dipped" : ""}${i === at ? " is-now" : ""}`}
            onClick={() => {
              if (phase === "down" || i === at) return;
              setAt(i);
              setPhase(dipped.includes(i) ? "up" : "hang");
              sfx("tick", { gain: 0.3 });
            }}
            aria-label={`Photo ${i + 1}${dipped.includes(i) ? ", dipped" : ""}`}
          >
            {ph ? <CroppedPhoto photo={ph} alt="" /> : <span>💗</span>}
            {dipped.includes(i) && <Drips className="sf-trayCoat" seed={i + 1} />}
          </button>
        ))}
      </div>
      {shownDipped && !allDone && (
        <button type="button" className="sf-link" onClick={nextPhoto}>
          Next strawberry 🍓
        </button>
      )}
    </section>
  );
}
