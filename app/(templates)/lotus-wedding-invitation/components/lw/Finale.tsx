"use client";

// ─── The finale: the lotus blooms once more over "Shubh Vivah" ───────────────
// Gold lights across the top, a pair of brass lamps glowing, pink lotuses in
// the corners. When the pond is 50% on screen the lotus opens (the same SVG as
// the opening) and a few petals drift up; then the seal, the names, the
// closing line and the hashtag. Reduced motion: already open.

import { useEffect, useMemo, useRef, useState } from "react";
import { Reveal, useWeddingReducedMotion } from "../../../_wedding";
import LotusBloom from "./LotusBloom";
import { img, seeded } from "./art";

export interface FinaleProps {
  seal: string;
  sealHi: string;
  closing: string;
  endLine: string;
  first: string;
  second: string;
  hashtag: string;
  lang: "en" | "hi";
}

export default function Finale({ seal, sealHi, closing, endLine, first, second, hashtag, lang }: FinaleProps) {
  const ref = useRef<HTMLElement>(null);
  const pondRef = useRef<HTMLDivElement>(null);
  const reduce = useWeddingReducedMotion();
  const [on, setOn] = useState(false);
  const [bloom, setBloom] = useState(false);
  const drift = useMemo(() => {
    const r = seeded(19);
    return Array.from({ length: 10 }, () => ({ left: 6 + r() * 88, size: 9 + r() * 10, delay: -r() * 12, dur: 10 + r() * 8, dx: (r() - 0.5) * 80 }));
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([en]) => setOn(en.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    const el = pondRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([en]) => {
        if (en.isIntersecting) {
          setBloom(true);
          io.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} className={`lw-finale${on ? " is-on" : ""}`} aria-label={seal}>
      <div className="lw-finale-lights" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img("lights", { lazy: true })} />
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img("lights", { lazy: true })} className="lw-lights-b" />
      </div>
      <div className="lw-finale-lamps" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img("lampsPair", { lazy: true })} className="lw-finale-lamp lw-finale-lamp-l" />
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img("lampsPair", { lazy: true })} className="lw-finale-lamp lw-finale-lamp-r" />
      </div>
      <div className="lw-drift" aria-hidden>
        {drift.map((d, i) => (
          <i key={i} style={{ left: `${d.left}%`, width: d.size, height: d.size * 1.6, animationDelay: `${d.delay}s`, animationDuration: `${d.dur}s`, ["--dx" as string]: `${d.dx}px` }} />
        ))}
      </div>
      <div className="lw-finale-in">
        <div ref={pondRef} className="lw-finale-pond">
          <span className="lw-pond-water" aria-hidden />
          <span className="lw-ripple" aria-hidden />
          <span className="lw-ripple" aria-hidden />
          <LotusBloom open={bloom || reduce} />
        </div>
        <Reveal as="p" className="lw-seal">
          <b lang="hi">{sealHi}</b>
          <small>{seal}</small>
        </Reveal>
        <Reveal as="p" className="lw-eyebrow" delay={100}>
          <span lang={lang}>{closing}</span>
        </Reveal>
        <Reveal as="p" className="lw-finale-names" delay={180}>
          {first} <span>&amp;</span> {second}
        </Reveal>
        {endLine && (
          <Reveal as="p" className="lw-finale-line" delay={240}>
            {endLine}
          </Reveal>
        )}
        {hashtag && (
          <Reveal as="p" className="lw-hashtag" delay={280}>
            {hashtag}
          </Reveal>
        )}
      </div>
      <div className="lw-finale-foot" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img("lotusCluster", { lazy: true })} className="lw-finale-l" />
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img("lotusPair", { lazy: true })} className="lw-finale-r" />
      </div>
    </section>
  );
}
