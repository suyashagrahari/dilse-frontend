"use client";

// ─── The finale: the gateway again, closing softly on "Shubh Vivah" ─────────
// The same world as the opening, so the invitation ends where it began: the
// warm sandstone sky and halo, gold lanterns hanging from the top, the white
// balustrade flush along the bottom, and the drawn palace (./Palace) with its
// carved doors (./Door) standing open in warm light. When it is half on
// screen the doors slide shut (1.4 s) and the seal settles on them: शुभ विवाह
// and the couple's initials. The elephants stand guard at its foot. Beside it
// on laptops (below it on phones): "Shubh Vivah · With love", the names in
// maroon-to-gold foil script, the closing line, the hashtag, the share bar
// (children) and "Replay the opening". Reduced motion: the doors are shut.

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Reveal, initialOf, useWeddingReducedMotion } from "../../../_wedding";
import Petals from "./Petals";
import { A, GATE, img } from "../assets";
import Door from "./Door";
import Palace from "./Palace";

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
  onReplay: () => void;
  children?: ReactNode;
}

export default function Finale({ seal, sealHi, closing, endLine, first, second, hashtag, lang, replayLabel, onReplay, children }: FinaleProps) {
  const gateRef = useRef<HTMLDivElement>(null);
  const reduce = useWeddingReducedMotion();
  const [closed, setClosed] = useState(false);
  useEffect(() => {
    if (reduce) return;
    const el = gateRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([en]) => {
        if (en.isIntersecting) {
          setClosed(true);
          io.disconnect();
        }
      },
      { threshold: 0.55 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  const shut = closed || reduce;
  const ap = GATE.aperture;
  return (
    <section className="rw-finale" aria-label={seal}>
      <div className="rw-fin-sky" aria-hidden />
      {(["l", "r"] as const).map((side) => (
        <span key={side} className={`rw-fin-lamp is-${side}`} aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img className="is-short" {...img(A.lanterns, { lazy: true })} />
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img className="is-long" {...img(A.lanternsLong, { lazy: true })} />
        </span>
      ))}
      <span className="rw-fin-rail" aria-hidden />
      <div className="rw-finale-in">
        <div ref={gateRef} className={`rw-close${shut ? " is-closed" : ""}`}>
          <span className="rw-fin-halo" aria-hidden />
          <div className="rw-close-stage">
            <div className="rw-ap" style={{ left: `${ap.x}%`, top: `${ap.y}%`, width: `${ap.w}%`, height: `${ap.h}%` }}>
              <span className="rw-ap-glow" />
              {(["l", "r"] as const).map((side) => {
                const box = side === "l" ? GATE.screenL : GATE.screenR;
                return (
                  <span key={side} className={`rw-screen is-${side}`} style={{ left: `${((box.x - ap.x) / ap.w) * 100}%`, width: `${(box.w / ap.w) * 100}%` }}>
                    <Door side={side} />
                  </span>
                );
              })}
              <p className="rw-close-seal">
                <b lang="hi">{sealHi}</b>
                <small>
                  {initialOf(first)} &amp; {initialOf(second)}
                </small>
              </p>
            </div>
            <Palace className="rw-gateway" />
            <span className="rw-ele is-l">
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img {...img(A.elephantL, { lazy: true })} />
            </span>
            <span className="rw-ele is-r">
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img {...img(A.elephantR, { lazy: true })} />
            </span>
          </div>
          {closed && !reduce && (
            <div className="rw-close-petals">
              <Petals kind={["rose", "marigold", "confetti"]} count={14} mode="fall" seed={23} />
            </div>
          )}
        </div>
        <div className="rw-fin-words">
        <Reveal as="p" className="wk-eyebrow rw-finale-k" delay={100}>
          <span lang={lang}>
            {seal} · {closing}
          </span>
        </Reveal>
        <Reveal as="p" className="rw-finale-names wk-foil-text wk-shimmer" delay={180}>
          {first} <span>&amp;</span> {second}
        </Reveal>
        {endLine && (
          <Reveal as="p" className="rw-finale-line" delay={240}>
            {endLine}
          </Reveal>
        )}
        {hashtag && (
          <Reveal as="p" className="rw-hashtag" delay={280}>
            {hashtag}
          </Reveal>
        )}
        {children}
        <button type="button" className="rw-replay" onClick={onReplay} lang={lang}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4" />
          </svg>
          {replayLabel}
        </button>
        </div>
      </div>
    </section>
  );
}
