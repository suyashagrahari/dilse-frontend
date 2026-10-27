"use client";

// ─── The finale: the terrace again, one full screen ─────────────────────────
// The hero's leaf garland flush along the top with two blossom lanterns, the
// "Shubh Vivah" seal, the names, the closing line, the hashtag and "Replay
// the opening", and at the foot the still lake, the pink
// gazebo and the white balustrade. On phones it fills
// exactly one screen. Nothing moves.

import { useEffect, useRef, useState } from "react";
import { Reveal } from "../../../_wedding";
import { img } from "./art";
import Lake from "./Lake";

export interface FinaleProps {
  seal: string;
  sealHi: string;
  bilingual: boolean;
  closing: string;
  endLine: string;
  first: string;
  second: string;
  hashtag: string;
  lang: "en" | "hi";
  replay: string;
  onReplay: () => void;
}

export default function Finale({ seal, sealHi, bilingual, closing, endLine, first, second, hashtag, lang, replay, onReplay }: FinaleProps) {
  const ref = useRef<HTMLElement>(null);
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([en]) => setOn(en.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} className={`wp-finale${on ? " is-on" : ""}`} aria-label={seal}>
      {/* The same leaf garland as the hero, flush with the top edge (mirrored into a second strip on wide screens). */}
      <div className="wp-garland wp-finale-garland" aria-hidden>
        <picture>
          <source media="(max-width: 700px)" srcSet={img("garlandSm").src} />
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <img {...img("garland", { lazy: true })} className="wp-garland-a" />
        </picture>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img("garland", { lazy: true })} className="wp-garland-b" />
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
      <img {...img("lanterns", { lazy: true })} className="wp-finale-lantern wp-finale-lantern-l" aria-hidden />
      {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
      <img {...img("lanterns", { lazy: true })} className="wp-finale-lantern wp-finale-lantern-r" aria-hidden />
      <div className="wp-finale-in">
        <Reveal as="p" className="wp-seal">
          {bilingual && <b lang="hi">{sealHi}</b>}
          <small>{seal}</small>
        </Reveal>
        <Reveal as="p" className="wp-eyebrow" delay={100}>
          <span lang={lang}>{closing}</span>
        </Reveal>
        <Reveal as="p" className="wp-finale-names" delay={180}>
          {first} <span>&amp;</span> {second}
        </Reveal>
        {endLine && (
          <Reveal as="p" className="wp-finale-line" delay={240}>
            {endLine}
          </Reveal>
        )}
        {hashtag && (
          <Reveal as="p" className="wp-hashtag" delay={280}>
            {hashtag}
          </Reveal>
        )}
        <Reveal delay={320} className="wp-finale-actions">
          <button type="button" className="wp-replay" onClick={onReplay} lang={lang}>
            ↺ {replay}
          </button>
        </Reveal>
      </div>
      {/* The terrace at the foot of the screen: the still lake with lotuses, the gazebo, the balustrade. */}
      <div className="wp-finale-foot" aria-hidden>
        <Lake className="wp-finale-lake" lotus={false} />
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img("gazebo", { lazy: true })} className="wp-finale-gazebo" />
        <span className="wp-balustrade" />
      </div>
    </section>
  );
}
