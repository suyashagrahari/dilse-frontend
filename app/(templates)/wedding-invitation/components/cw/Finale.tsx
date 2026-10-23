"use client";

// ─── The finale: the jharokha closes softly at dusk ─────────────────────────
// The same carved window, small, stands open on the pink lake; when it is
// half on screen the ivory shutters swing gently shut (1.6 s) and a few rose
// petals settle. Then "Shubh Vivah", the closing line, the hashtag, the share
// bar and "Replay the opening", over a border of pampas and peonies (template3).
// Reduced motion: the window is simply closed.

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Reveal, useWeddingReducedMotion } from "../../../_wedding";
import { A, SHUTTER_BOX, img } from "./assets";

export interface FinaleProps {
  seal: string;
  sealHi: string;
  closing: string;
  endLine: string;
  first: string;
  second: string;
  hashtag: string;
  lang: "en" | "hi";
  replayLabel: string;
  onReplay?: () => void;
  children?: ReactNode;
}

export default function Finale({ seal, sealHi, closing, endLine, first, second, hashtag, lang, replayLabel, onReplay, children }: FinaleProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useWeddingReducedMotion();
  const [closed, setClosed] = useState(false);
  useEffect(() => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([en]) => {
        if (en.isIntersecting) {
          setClosed(true);
          io.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);
  const shut = closed || reduce;
  const L = SHUTTER_BOX.left;
  const R = SHUTTER_BOX.right;

  return (
    <section className="cw-finale" aria-label={seal}>
      <div ref={ref} className={`cw-close${shut ? " is-closed" : ""}`} aria-hidden>
        <div className="cw-close-stage">
          <div className="cw-aperture" style={{ left: `${L.x}%`, top: `${L.y}%`, width: `${R.x + R.w - L.x}%`, height: `${L.h}%` }}>
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img className="cw-ap-dawn" {...img(A.dawn, { lazy: true })} />
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img className="cw-frame" {...img(A.frame, { lazy: true })} />
          {(["left", "right"] as const).map((side) => {
            const b = SHUTTER_BOX[side];
            return (
              <div key={side} className={`cw-shutter is-${side[0]}`} style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%`, height: `${b.h}%` }}>
                {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                <img {...img(side === "left" ? A.shutterLsm : A.shutterRsm, { lazy: true })} />
              </div>
            );
          })}
        </div>
      </div>
      <Reveal as="p" className="cw-finale-seal" delay={80}>
        <b lang="hi">{sealHi}</b>
        <small>{seal}</small>
      </Reveal>
      <Reveal as="p" className="wk-eyebrow" delay={140}>
        <span lang={lang}>{closing}</span>
      </Reveal>
      <Reveal as="p" className="cw-finale-names wk-foil-text wk-shimmer" delay={200}>
        {first} <span>&amp;</span> {second}
      </Reveal>
      {endLine && (
        <Reveal as="p" className="cw-finale-line" delay={260}>
          {endLine}
        </Reveal>
      )}
      {hashtag && (
        <Reveal as="p" className="cw-hashtag" delay={300}>
          {hashtag}
        </Reveal>
      )}
      {children && (
        <Reveal delay={340} className="cw-finale-share">
          {children}
        </Reveal>
      )}
      {onReplay && (
        <button type="button" className="cw-replay" onClick={onReplay} lang={lang}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M3 12a9 9 0 1 0 3-6.7M3 4v5h5" />
          </svg>
          {replayLabel}
        </button>
      )}
      <div className="cw-finale-floor" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img className="cw-finale-pampas is-l" {...img(A.pampas, { lazy: true })} />
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img className="cw-finale-peony" {...img(A.peonies, { lazy: true })} />
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img className="cw-finale-pampas is-r" {...img(A.pampas, { lazy: true })} />
      </div>
    </section>
  );
}
