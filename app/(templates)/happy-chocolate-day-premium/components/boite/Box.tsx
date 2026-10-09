"use client";

// The box, built from material rather than drawn: a matte card lid with a foil-stamped monogram and a satin ribbon,
// a tray lined in dark cacao card, glassine cups, and bonbons whose tops are the buyer's photos (a cocoa-butter
// transfer: the photo, feathered, under a domed gloss and a foil sheen that follows the phone's tilt via --sx/--sy).
// No SVG objects: gradients, masks, shadows and their photos.
//
//   <LidFace>  the lid's face (gate art, the closed box, the keepsake card)
//   <Bonbon>   one piece (tray cell, the lifted piece, the poster)
//   <Box>      the whole box, phase-driven: closed → (drag) lifting → rising (the riser) → open (the drop)

import type { CSSProperties, ReactNode } from "react";
import { CroppedPhoto } from "../../../_valentine/kit";
import type { Boite, Piece } from "./util";
import { trayGrid } from "./util";

export function LidFace({ b, ribbon = false, pulled = false, children, className = "" }: { b: Boite; ribbon?: boolean; pulled?: boolean; children?: ReactNode; className?: string }) {
  return (
    <div className={`lb-lidFace${pulled ? " is-pulled" : ""} ${className}`}>
      <i className="lb-lidGrain" aria-hidden />
      <i className="lb-lidLine" aria-hidden />
      <div className="lb-lidMid">
        {children}
        <p className="lb-mono" aria-label={`${b.monogram[0]} and ${b.monogram[1]}`}>
          <span>{b.monogram[0]}</span>
          <em>&amp;</em>
          <span>{b.monogram[1]}</span>
        </p>
        <p className="lb-house">{b.house}</p>
        <p className="lb-est">{b.since ? `Est. ${b.since}` : "Chocolatier"}</p>
      </div>
      {ribbon && (
        <>
          <i className="lb-ribbon lb-ribbonV" aria-hidden />
          <i className="lb-ribbon lb-ribbonH" aria-hidden />
          <i className="lb-knot" aria-hidden />
        </>
      )}
    </div>
  );
}

export function Bonbon({ piece, eager, style, className = "" }: { piece: Piece | null; eager?: boolean; style?: CSSProperties; className?: string }) {
  return (
    <span className={`lb-bb ${className}`} style={style} aria-hidden>
      {piece?.photo ? (
        <span className="lb-bbPhoto">
          <CroppedPhoto photo={piece.photo} alt="" eager={eager} />
        </span>
      ) : (
        <span className="lb-bbDeco" />
      )}
      <span className="lb-bbGloss" />
      <span className="lb-bbSheen">
        <i />
      </span>
    </span>
  );
}

export type BoxPhase = "closed" | "rising" | "open";

export function Box({
  b,
  phase,
  lift,
  tasted,
  out,
  onPick,
  bind,
}: {
  b: Boite;
  phase: BoxPhase;
  /** 0–1 while the lid is being dragged up (closed phase only). */
  lift: number;
  tasted: ReadonlySet<number>;
  /** The piece currently lifted out (shown empty in its cup). */
  out: number | null;
  onPick: (i: number) => void;
  /** Pointer handlers for the drag-to-lift (closed phase). */
  bind?: Record<string, unknown>;
}) {
  const { cols, rows } = trayGrid(b.pieces.length);
  const cells = cols * rows;
  const open = phase === "open";
  return (
    <div className="lb-boxWrap" style={{ ["--cols" as string]: cols, ["--rows" as string]: rows }}>
      <div className={`lb-box3d is-${phase}`} style={{ ["--lift" as string]: phase === "closed" ? lift : 1 }} {...(bind ?? {})}>
        <div className="lb-base">
          <div className="lb-tray" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {Array.from({ length: cells }, (_, i) => {
              const piece = b.pieces[i];
              const col = i % cols;
              const row = Math.floor(i / cols);
              const vars = { ["--cx" as string]: col - (cols - 1) / 2, ["--cy" as string]: row - (rows - 1) / 2, ["--i" as string]: i } as CSSProperties;
              if (!piece) return <span key={i} className="lb-cell lb-cellEmpty" style={vars} aria-hidden><span className="lb-cup" /></span>;
              const label = `Piece ${i + 1}: ${piece.flavour}${tasted.has(i) ? " (tasted)" : ""}`;
              return (
                <button
                  key={i}
                  type="button"
                  className={`lb-cell${tasted.has(i) ? " is-tasted" : ""}${out === i ? " is-out" : ""}`}
                  style={vars}
                  disabled={!open}
                  tabIndex={open ? 0 : -1}
                  aria-label={label}
                  onClick={() => open && onPick(i)}
                >
                  <span className="lb-cup" />
                  <Bonbon piece={piece} eager={i < 9} />
                </button>
              );
            })}
          </div>
          <div className="lb-tissue" aria-hidden>
            <i className="lb-tissueL" />
            <i className="lb-tissueR" />
            <b className="lb-sticker">{b.monogram[0]}</b>
          </div>
        </div>
        <i className="lb-glowGap" aria-hidden />
        <div className="lb-lid" aria-hidden>
          <LidFace b={b} />
        </div>
      </div>
    </div>
  );
}
