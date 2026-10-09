"use client";

// A piece, lifted out of the box: the bonbon large (their photo as the transfer, the gloss, the sheen following the
// tilt). Tap it to turn it over (lb-flip; visual twin: the 3D flip): the underside is the chocolate itself with the
// number and the flavour piped in gold, and the memory it tastes of appears under it (caption + note). Rendered at
// the root, outside every transformed scene, so `position: fixed` is the viewport. Tap outside / Esc / the button
// to set it back (lb-set).

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "../../../_valentine/kit";
import { usePremium } from "../../../_valentine/kit/premium";
import { Bonbon } from "./Box";
import { ROMAN, type Piece } from "./util";

export function Tasting({ piece, at, onClose }: { piece: Piece | null; at: number; onClose: () => void }) {
  const { sfx } = usePremium();
  const reduce = useReducedMotion();
  const [flipped, setFlipped] = useState(false);
  const close = useRef<HTMLButtonElement>(null);
  const shut = () => {
    sfx("lb-set", { gain: 0.7 });
    onClose();
  };
  const shutRef = useRef(shut);
  useEffect(() => {
    shutRef.current = shut;
  });
  useEffect(() => {
    if (!piece) return;
    close.current?.focus({ preventScroll: true });
    const k = (e: KeyboardEvent) => e.key === "Escape" && shutRef.current();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [piece]);
  if (!piece) return null;
  const flip = () => {
    sfx("lb-flip", { gain: 0.8 });
    setFlipped((f) => !f);
  };
  const memory = piece.caption || piece.note;
  return (
    <div className="lb-taste" role="dialog" aria-modal="true" aria-label={`Piece ${at + 1}: ${piece.flavour}`} onClick={shut}>
      <div className="lb-tasteIn" onClick={(e) => e.stopPropagation()}>
        <p className="lb-eyebrow">Nº {ROMAN[at] ?? at + 1}</p>
        <button type="button" className={`lb-coin${flipped ? " is-flipped" : ""}${reduce ? " is-reduced" : ""}`} onClick={flip} aria-pressed={flipped} aria-label={flipped ? "Turn it back over" : "Turn it over"}>
          <span className="lb-coinFace lb-coinFront">
            <Bonbon piece={piece} eager />
          </span>
          <span className="lb-coinFace lb-coinBack">
            <span className="lb-coinBackIn">
              <span className="lb-coinFlavour">{piece.flavour}</span>
              <i className="lb-coinRule" />
              <span className="lb-coinHouse">tasting note</span>
            </span>
          </span>
        </button>
        <div className={`lb-note${flipped ? " is-on" : ""}`} aria-live="polite">
          {flipped ? (
            <>
              {memory ? <p className="lb-noteCap">{piece.caption || piece.note}</p> : <p className="lb-noteCap">{piece.flavour}</p>}
              {piece.caption && piece.note && <p className="lb-noteText">{piece.note}</p>}
            </>
          ) : (
            <p className="lb-hint">Turn it over</p>
          )}
        </div>
      </div>
      <button ref={close} type="button" className="lb-tasteClose" onClick={shut}>
        Back in the box
      </button>
    </div>
  );
}
