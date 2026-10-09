"use client";

// Small shared pieces for "The Premiere": the graded film still, the typewriter line, the cut flash.

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { CroppedPhoto, useReducedMotion } from "../../../_valentine/kit";
import { usePremium } from "../../../_valentine/kit/premium";
import type { LovePhoto } from "../../../_valentine/types";

export type Grade = "warm" | "noir" | "teal" | "none";

const GRADE: Record<Grade, { filter: string; tint: string; blend: CSSProperties["mixBlendMode"] }> = {
  warm: { filter: "contrast(1.06) saturate(.92) sepia(.1) brightness(1.01)", tint: "linear-gradient(180deg, rgba(255,186,110,.16), rgba(90,30,20,.22))", blend: "soft-light" },
  noir: { filter: "grayscale(1) contrast(1.22) brightness(.92)", tint: "radial-gradient(80% 70% at 50% 40%, transparent, rgba(0,0,0,.4))", blend: "multiply" },
  teal: { filter: "contrast(1.1) saturate(1.05)", tint: "linear-gradient(200deg, rgba(255,150,70,.24) 0%, transparent 45%, rgba(0,100,120,.36) 100%)", blend: "overlay" },
  none: { filter: "none", tint: "transparent", blend: "normal" },
};

export interface StillProps {
  photo: LovePhoto | null;
  grade?: Grade;
  /** Ken Burns drift, or false. */
  kb?: "in" | "out" | false;
  drift?: number;
  /** A second layer of the same photo on top (soft focus / black-and-white), faded by `opacity`. */
  over?: { grade?: Grade; blur?: number; opacity: number };
  /** Extra transform on the picture (Act II's slow push-in). */
  zoom?: number;
  eager?: boolean;
  style?: CSSProperties;
  className?: string;
}

/** A buyer's photo, graded and drifting like a film still. Portrait: fills the frame. Landscape: a tall still
 *  centred over a blurred, darkened copy of itself (never a stretched, cropped-to-the-forehead strip). */
export function Still({ photo, grade = "warm", kb = "in", drift = 16, over, zoom = 1, eager, style, className }: StillProps) {
  const reduce = useReducedMotion();
  if (!photo) {
    return <div className={`pr-still ${className ?? ""}`} style={{ background: "radial-gradient(90% 70% at 50% 35%, #3a1418 0%, #120708 60%, #050304 100%)", ...style }} aria-hidden />;
  }
  const g = GRADE[grade];
  const anim = !reduce && kb ? `pr-kb-${kb} ${drift}s cubic-bezier(.45,.05,.55,.95) infinite alternate` : undefined;
  return (
    <div className={`pr-still ${className ?? ""}`} style={style}>
      <div className="pr-still-fill" aria-hidden>
        <CroppedPhoto photo={photo} alt="" />
      </div>
      <div className="pr-still-main" style={{ animation: anim }}>
        <div className="pr-still-layer" style={{ transform: zoom !== 1 ? `scale(${zoom})` : undefined, transition: "transform .5s linear" }}>
          <div className="pr-still-layer" style={{ filter: g.filter }}>
            <CroppedPhoto photo={photo} eager={eager} />
          </div>
          <div className="pr-still-tint" style={{ background: g.tint, mixBlendMode: g.blend }} />
          {over && (
            <div className="pr-still-layer" style={{ opacity: over.opacity, transition: "opacity .25s linear" }} aria-hidden>
              <div className="pr-still-layer" style={{ filter: `${GRADE[over.grade ?? grade].filter}${over.blur ? ` blur(${over.blur}px)` : ""}`, transform: over.blur ? "scale(1.06)" : undefined }}>
                <CroppedPhoto photo={photo} alt="" eager={eager} />
              </div>
              <div className="pr-still-tint" style={{ background: GRADE[over.grade ?? grade].tint, mixBlendMode: GRADE[over.grade ?? grade].blend }} />
            </div>
          )}
        </div>
        <div className="pr-still-vig" />
      </div>
    </div>
  );
}

/** Types `text` in, with typewriter keys. `play` starts it; tap anywhere on it to finish. */
export function Typed({ text, play = true, speed = 42, onDone, className, style, caret }: { text: string; play?: boolean; speed?: number; onDone?: () => void; className?: string; style?: CSSProperties; caret?: boolean }) {
  const { sfx } = usePremium();
  const reduce = useReducedMotion();
  const [typed, setN] = useState(0);
  const n = reduce ? text.length : typed;
  const done = useRef(false);
  const doneCb = useRef(onDone);
  useEffect(() => {
    doneCb.current = onDone;
  });
  useEffect(() => {
    if (!play) return;
    if (reduce) return;
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setN(i);
      if (i % 3 === 1) sfx("pr-type", { gain: 0.55 });
      if (i >= text.length) window.clearInterval(id);
    }, speed);
    return () => window.clearInterval(id);
  }, [play, text, speed, reduce, sfx]);
  useEffect(() => {
    if (n >= text.length && play && !done.current) {
      done.current = true;
      doneCb.current?.();
    }
  }, [n, text.length, play]);
  return (
    <span className={className} style={style} onClick={() => setN(text.length)} aria-label={text}>
      <span aria-hidden>{text.slice(0, n)}</span>
      {caret && n < text.length && <span className="pr-caret" aria-hidden />}
      <span aria-hidden style={{ visibility: "hidden" }}>{text.slice(n)}</span>
    </span>
  );
}

/** A projector cut: a warm white flash. Bump `k` to fire it. */
export function Flash({ k }: { k: number }) {
  return <span key={k} className={`pr-flash${k ? " is-on" : ""}`} aria-hidden />;
}

/** The bottom bar's content area. */
export function Dock({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div className="pr-dock" style={style}>
      {children}
    </div>
  );
}
