"use client";

// Chapter III: Pressed pages. Up to three of their photos, each pressed in an album under a sheet of vellum
// (translucent, blurred, fibrous). Swipe the vellum up (or tap it) and it lifts away on its top hinge: the photo
// comes into focus with its caption in italic and the little note under it. sfx paper-rustle on the lift (visual
// twin: the sheet lifting), page-turn on the next page (the new page slides onto the stack).

import { useRef, useState, type PointerEvent as RPointerEvent } from "react";
import { useReducedMotion } from "../../../_valentine/kit";
import { CinematicPhoto, PremiumCTA, usePremium } from "../../../_valentine/kit/premium";
import type { LovePhoto } from "../../../_love/types";

const ROMAN = ["I", "II", "III"];

export function PagesScene({ pages, to, onDone }: { pages: { photo: LovePhoto; index: number }[]; to: string; onDone: () => void }) {
  const [i, setI] = useState(0);
  const last = i >= pages.length - 1;
  const page = pages[i];
  return (
    <section className="rb-scene rb-pages" aria-label="Pressed pages">
      <header className="rb-head rb-headTight">
        <p className="rb-eyebrow">III · Pressed pages</p>
        <p className="rb-count" aria-live="polite">
          {ROMAN[i] ?? i + 1} <span>/ {ROMAN[pages.length - 1] ?? pages.length}</span>
        </p>
      </header>
      {page && <Page key={i} photo={page.photo} to={to} next={last ? onDone : () => setI(i + 1)} last={last} />}
    </section>
  );
}

function Page({ photo, to, next, last }: { photo: LovePhoto; to: string; next: () => void; last: boolean }) {
  const { sfx } = usePremium();
  const reduce = useReducedMotion();
  const [p, setP] = useState(0); // 0 → 1 drag progress
  const [lifted, setLifted] = useState(false);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ y: number; id: number; moved: boolean } | null>(null);

  const lift = () => {
    if (lifted) return;
    setLifted(true);
    setP(1);
    sfx("paper-rustle", { gain: 0.8 });
  };
  const down = (e: RPointerEvent) => {
    if (lifted) return;
    drag.current = { y: e.clientY, id: e.pointerId, moved: false };
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const move = (e: RPointerEvent) => {
    const d = drag.current;
    if (!d || lifted) return;
    const dy = d.y - e.clientY;
    if (Math.abs(dy) > 6) d.moved = true;
    setP(Math.max(0, Math.min(1, dy / 170)));
  };
  const up = () => {
    const d = drag.current;
    drag.current = null;
    setDragging(false);
    if (!d || lifted) return;
    if (!d.moved || p > 0.3) lift();
    else setP(0);
  };

  return (
    <div className={`rb-page${reduce ? " is-reduced" : ""}`}>
      <div className="rb-paper">
        <div className="rb-mat">
          <CinematicPhoto photo={photo} grade="warm" aspect="4 / 5" focusPull={false} kenBurns={lifted ? "in" : false} caption="" style={{ padding: 0, background: "transparent" }} />
        </div>
        <div className={`rb-pageText${lifted ? " is-on" : ""}`}>
          {photo.caption && <p className="rb-pageCap">{photo.caption}</p>}
          {photo.note && <p className="rb-pageNote">{photo.note}</p>}
        </div>
        <button
          type="button"
          className={`rb-vellum${lifted ? " is-lifted" : ""}${dragging ? " is-drag" : ""}`}
          style={{ ["--p" as string]: p }}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              lift();
            }
          }}
          aria-label="Lift the vellum"
          disabled={lifted}
        >
          <span className="rb-vellumMark">pressed for {to}</span>
          <span className="rb-vellumHint" aria-hidden>
            <i />
            Lift
          </span>
        </button>
      </div>
      <div className={`rb-pageNext${lifted ? " is-on" : ""}`}>
        {lifted && (
          <PremiumCTA tone={last ? "gold" : "pearl"} cue="page-turn" onClick={next}>
            {last ? "Read the letter" : "Next page"}
          </PremiumCTA>
        )}
      </div>
    </div>
  );
}
