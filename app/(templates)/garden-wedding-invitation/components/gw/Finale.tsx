"use client";

// ─── The finale: back in the garden, all on one screen ──────────────────────
// The hero's world again (watercolour sky, two cloud banks, a blossom branch in
// each top corner, a bunch of pink peonies in each bottom corner, a fine gold
// frame) around the hero's own gazebo with the couple standing in it; petals fall once the
// pavilion is 50% in view. Then "शुभ विवाह · Shubh Vivah", the names, the
// closing line and the hashtag, sized so the whole goodbye fits one screen. Reduced motion: no petals.

import { useEffect, useRef, useState } from "react";
import { Reveal, useWeddingReducedMotion } from "../../../_wedding";
import { GW, gwImg } from "../assets";
import { useOnScreen } from "./art";
import Petals from "./Petals";

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
      <div className="gw-fin-world" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img className="gw-fin-sky" {...gwImg(GW.sky, { lazy: true })} />
        <span className="gw-fin-cloud gw-fin-cloud-l">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...gwImg(GW.cloudA, { lazy: true })} />
        </span>
        <span className="gw-fin-cloud gw-fin-cloud-r">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...gwImg(GW.cloudB, { lazy: true })} />
        </span>
        <span className="gw-fin-blossom gw-fin-blossom-l">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...gwImg(GW.blossom, { lazy: true })} />
        </span>
        <span className="gw-fin-blossom gw-fin-blossom-r">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...gwImg(GW.blossom, { lazy: true })} />
        </span>
        <span className="gw-fin-peony gw-fin-peony-l">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...gwImg(GW.peonyCorner, { lazy: true, hi: GW.peonyCorner2x, sizes: "(min-width: 900px) 26vw, 40vw" })} />
        </span>
        <span className="gw-fin-peony gw-fin-peony-r">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...gwImg(GW.peonyCorner, { lazy: true, hi: GW.peonyCorner2x, sizes: "(min-width: 900px) 26vw, 40vw" })} />
        </span>
        <span className="gw-frame" />
      </div>
      <div ref={stage} className="gw-finale-stage" aria-hidden>
        <span className="gw-fin-pav">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img className="gw-fin-pav-img" {...gwImg(GW.gazebo, { lazy: true, hi: GW.gazebo2x, sizes: "(min-width: 1024px) 600px, 100vw" })} />
          <span className="gw-fin-couple">
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img {...gwImg(GW.couple, { lazy: true })} />
          </span>
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
      </div>
    </section>
  );
}
