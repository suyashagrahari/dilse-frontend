"use client";

// ─── The finale: the gateway closes softly on "Shubh Vivah" ──────────────────
// The opening's gateway, small, stands open with warm light in the doorway;
// when it is 55% on screen the jaali screens slide shut (1.4 s), the toran
// swings once and the seal settles on the screens with the couple's initials.
// The two elephants stand guard at its foot. Then the closing line, the
// hashtag, the share bar (children) and "Replay the opening".
// Reduced motion: the screens are simply closed.

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Reveal, initialOf, useWeddingReducedMotion } from "../../../_wedding";
import Petals from "./Petals";
import { A, GATE, img } from "../assets";

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
      <div className="rw-finale-in">
        <div ref={gateRef} className={`rw-close${shut ? " is-closed" : ""}`}>
          <div className="rw-close-stage">
            <div className="rw-ap" style={{ left: `${ap.x}%`, top: `${ap.y}%`, width: `${ap.w}%`, height: `${ap.h}%` }}>
              <span className="rw-ap-glow" />
              {(["l", "r"] as const).map((side) => {
                const box = side === "l" ? GATE.screenL : GATE.screenR;
                return (
                  <span key={side} className={`rw-screen is-${side}`} style={{ left: `${((box.x - ap.x) / ap.w) * 100}%`, width: `${(box.w / ap.w) * 100}%` }}>
                    {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                    <img {...img(side === "l" ? A.screenL : A.screenR, { lazy: true })} />
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
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img className="rw-gateway" {...img(A.gateway, { lazy: true })} />
            <span className="rw-toran" style={{ left: `${GATE.toran.x}%`, top: `${GATE.toran.y}%`, width: `${GATE.toran.w}%` }}>
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img {...img(A.toran, { lazy: true })} />
            </span>
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
    </section>
  );
}
