"use client";

// ─── The finale: dusk in the garden ─────────────────────────────────────────
// The flowering pavilion with the couple standing in it, peony trees leaning
// in from both sides, sky lanterns rising (only while on screen) and petals
// falling once the pavilion is 50% in view. Then "शुभ विवाह · Shubh Vivah",
// the names, the closing line, the hashtag and the full share bar. Reduced
// motion: lanterns hang still, no petals.

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Reveal, useWeddingReducedMotion } from "../../../_wedding";
import { GW, gwImg } from "../assets";
import { seeded, useOnScreen } from "./art";
import Petals from "./Petals";

const LANTERNS = (() => {
  const r = seeded(17);
  // Two side lanes (2–26% and 74–98%) so no lantern drifts across the names and the share bar.
  return Array.from({ length: 9 }, (_, i) => ({ left: (i % 2 ? 74 : 2) + r() * 24, size: 14 + r() * 16, delay: -r() * 14, dur: 12 + r() * 8, sway: 8 + r() * 18 }));
})();

export interface FinaleProps {
  seal: string;
  sealHi: string;
  closing: string;
  endLine: string;
  first: string;
  second: string;
  hashtag: string;
  lang: "en" | "hi";
  share: ReactNode;
}

export default function Finale({ seal, sealHi, closing, endLine, first, second, hashtag, lang, share }: FinaleProps) {
  const ref = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const reduce = useWeddingReducedMotion();
  const on = useOnScreen(ref, "0px");
  const [bloom, setBloom] = useState(false);
  useEffect(() => {
    if (reduce) return;
    const el = stage.current;
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
  }, [reduce]);

  return (
    <section ref={ref} className={`gw-finale${on ? " is-on" : ""}${bloom || reduce ? " is-bloom" : ""}`} aria-label={seal}>
      <div className="gw-sky-lanterns" aria-hidden>
        {LANTERNS.map((l, i) => (
          <i
            key={i}
            style={{ left: `${l.left}%`, width: l.size, height: l.size * 1.3, animationDelay: `${l.delay}s, ${l.delay}s`, animationDuration: `${l.dur}s, ${3 + (i % 4)}s`, ["--sway" as string]: `${l.sway}px` }}
          />
        ))}
      </div>
      <div ref={stage} className="gw-finale-stage" aria-hidden>
        <span className="gw-fin-tree gw-fin-tree-l">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...gwImg(GW.peonyL, { lazy: true, hi: GW.peonyL2x, sizes: "300px" })} />
        </span>
        <span className="gw-fin-pav">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img className="gw-fin-pav-img" {...gwImg(GW.pavilion, { lazy: true })} />
          <span className="gw-fin-couple">
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img {...gwImg(GW.couplePeach, { lazy: true })} />
          </span>
        </span>
        <span className="gw-fin-tree gw-fin-tree-r">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...gwImg(GW.peonyR, { lazy: true, hi: GW.peonyR2x, sizes: "300px" })} />
        </span>
        {bloom && !reduce && <Petals mode="drift" count={10} seed={23} className="gw-fin-petals" />}
      </div>
      <div className="gw-finale-in">
        <Reveal as="p" className="gw-seal-line">
          <b lang="hi">{sealHi}</b>
          <small>{seal}</small>
        </Reveal>
        <Reveal as="p" className="wk-eyebrow" delay={100}>
          <span lang={lang}>{closing}</span>
        </Reveal>
        <Reveal as="p" className="gw-finale-names" delay={180}>
          {first} <span>&amp;</span> {second}
        </Reveal>
        {endLine && (
          <Reveal as="p" className="gw-finale-line" delay={240}>
            {endLine}
          </Reveal>
        )}
        {hashtag && (
          <Reveal as="p" className="gw-hashtag" delay={280}>
            {hashtag}
          </Reveal>
        )}
        <Reveal delay={320}>{share}</Reveal>
      </div>
    </section>
  );
}
