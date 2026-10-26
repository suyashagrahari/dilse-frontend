"use client";

// ─── The finale: the knot is tied ────────────────────────────────────────────
// The bride's and groom's hands, tied with the mauli thread, in a gold-framed
// palace arch with warm light behind them. When the arch is 45% on screen it
// opens from the centre (a circle of light widening to the full window), the
// picture settles from a slight zoom, the couple's initials sit in a gold medal
// on the arch's crown, the diyas on its sill light from the centre out and
// petals fall. Then "Shubh Vivah", the closing line, the hashtag and the share
// bar. Reduced motion: everything is simply in place.

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Reveal, initialOf, useWeddingReducedMotion } from "../../../_wedding";
import Diya from "./Diya";
import Petals from "./Petals";
import { A, img } from "../assets";

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
  const knotRef = useRef<HTMLDivElement>(null);
  const reduce = useWeddingReducedMotion();
  const [tied, setTied] = useState(false);
  useEffect(() => {
    if (reduce) return;
    const el = knotRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([en]) => {
        if (en.isIntersecting) {
          setTied(true);
          io.disconnect();
        }
      },
      { threshold: 0.45 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);
  const on = tied || reduce;

  return (
    <section className="pd-finale" aria-label={seal}>
      <div ref={knotRef} className={`pd-knot${on ? " is-on" : ""}`}>
        <span className="pd-knot-glow" aria-hidden />
        <div className="pd-knot-arch">
          <span className="pd-knot-win">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img {...img(A.hands, { lazy: true })} alt={`${first} & ${second}`} />
          </span>
        </div>
        <span className="pd-knot-medal" aria-hidden>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...img(A.frame, { lazy: true })} />
          <span className="pd-close-ini">
            {initialOf(first)}
            <i>&amp;</i>
            {initialOf(second)}
          </span>
        </span>
        <span className="pd-knot-sill" aria-hidden>
          {[0, 1, 2, 3, 4].map((i) => (
            <Diya key={i} className="pd-knot-diya" style={{ ["--i" as string]: Math.abs(i - 2) }} />
          ))}
        </span>
        {tied && !reduce && (
          <div className="pd-close-petals" aria-hidden>
            <Petals kind={["marigold-petal", "rose-petal", "gold-confetti"]} count={14} mode="fall" seed={23} />
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
      {children && (
        <Reveal delay={340} className="pd-finale-share">
          {children}
        </Reveal>
      )}
    </section>
  );
}
