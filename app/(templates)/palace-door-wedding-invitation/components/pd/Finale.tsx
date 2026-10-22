"use client";

// ─── The finale: the palace door closes softly on "Shubh Vivah" ──────────────
// The same carved door, small, stands open with lamplight behind; when it is
// 55% on screen the leaves swing shut (rotateY ±78° → 0, 1.6 s) and the gold
// frame settles on the seam with the couple's initials. Then the closing line,
// the hashtag, the share bar, and at the very foot the bride's and groom's
// hands tied with the mauli thread, rising into view. Reduced motion: the door
// is simply closed.

import { useEffect, useRef, useState, type ReactNode } from "react";
import { PetalBurst, Reveal, initialOf, useWeddingReducedMotion } from "../../../_wedding";
import { A, LEAF_BOX, img } from "../assets";

export interface FinaleProps {
  seal: string;
  sealHi: string;
  closing: string;
  endLine: string;
  first: string;
  second: string;
  hashtag: string;
  lang: "en" | "hi";
  children?: ReactNode;
}

export default function Finale({ seal, sealHi, closing, endLine, first, second, hashtag, lang, children }: FinaleProps) {
  const doorRef = useRef<HTMLDivElement>(null);
  const reduce = useWeddingReducedMotion();
  const [closed, setClosed] = useState(false);
  useEffect(() => {
    if (reduce) return;
    const el = doorRef.current;
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

  return (
    <section className="pd-finale" aria-label={seal}>
      <div ref={doorRef} className={`pd-close${shut ? " is-closed" : ""}`}>
        <div className="pd-close-door">
          <div className="pd-door-3d">
            <div className="pd-door-light" aria-hidden>
              <span className="pd-door-glow" />
            </div>
            {(["left", "right"] as const).map((side) => {
              const b = LEAF_BOX[side];
              return (
                <div key={side} className={`pd-leaf is-${side[0]}`} style={{ left: `${b.x}%`, top: `${b.y}%`, width: `${b.w}%`, height: `${b.h}%` }} aria-hidden>
                  {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
                  <img {...img(side === "left" ? A.leafL : A.leafR, { lazy: true })} />
                </div>
              );
            })}
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img className="pd-door-wall" {...img(A.wall, { lazy: true })} />
          </div>
          <span className="pd-close-medal" aria-hidden>
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img {...img(A.frame, { lazy: true })} />
            <span className="pd-close-ini">
              {initialOf(first)}
              <i>&amp;</i>
              {initialOf(second)}
            </span>
          </span>
        </div>
        {closed && !reduce && (
          <div className="pd-close-petals" aria-hidden>
            <PetalBurst kind={["marigold-petal", "rose-petal", "gold-confetti"]} count={12} mode="fall" seed={23} />
          </div>
        )}
      </div>
      <Reveal as="p" className="pd-finale-seal" delay={80}>
        <b lang="hi">{sealHi}</b>
        <small>{seal}</small>
      </Reveal>
      <Reveal as="p" className="wk-eyebrow" delay={140}>
        <span lang={lang}>{closing}</span>
      </Reveal>
      <Reveal as="p" className="pd-finale-names wk-foil-text wk-shimmer" delay={200}>
        {first} <span>&amp;</span> {second}
      </Reveal>
      {endLine && (
        <Reveal as="p" className="pd-finale-line" delay={260}>
          {endLine}
        </Reveal>
      )}
      {hashtag && (
        <Reveal as="p" className="pd-hashtag" delay={300}>
          {hashtag}
        </Reveal>
      )}
      {children && <Reveal delay={340}>{children}</Reveal>}
      <div className="pd-hands" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img(A.hands, { lazy: true })} />
      </div>
    </section>
  );
}
