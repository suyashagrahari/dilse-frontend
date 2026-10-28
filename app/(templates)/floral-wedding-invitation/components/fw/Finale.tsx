"use client";

// ─── The finale: the last page of the suite, sealed ─────────────────────────
// The couple on their swing again in the gold arch, a pampas cloud bank
// and pampas in the corners. When the page is 45 % on screen a dusty-rose wax
// seal is pressed onto it ("शुभ विवाह", scale 1.6 → 1 with a soft squash, then
// a ring of light), the closing words, the names and the hashtag, inside a
// fine gold frame, sized so the whole goodbye fits one screen. Reduced motion:
// the seal is simply there.

import { useEffect, useRef, useState } from "react";
import { Reveal, useWeddingReducedMotion } from "../../../_wedding";
import { pic } from "./art";

export interface FinaleProps {
  sealHi: string;
  seal: string;
  closing: string;
  endLine: string;
  first: string;
  second: string;
  hashtag: string;
  lang: "en" | "hi";
}

export default function Finale({ sealHi, seal, closing, endLine, first, second, hashtag, lang }: FinaleProps) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useWeddingReducedMotion();
  const [on, setOn] = useState(false);
  const [pressed, setPressed] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([en]) => setOn(en.isIntersecting), { threshold: 0.02 });
    io.observe(el);
    const io2 = new IntersectionObserver(
      ([en]) => {
        if (en.isIntersecting) {
          setPressed(true);
          io2.disconnect();
        }
      },
      { threshold: 0.45 },
    );
    io2.observe(el.querySelector(".fw-fin-stage") ?? el);
    return () => {
      io.disconnect();
      io2.disconnect();
    };
  }, []);

  return (
    <section ref={ref} className={`fw-finale${on ? " is-on" : ""}${pressed || reduce ? " is-pressed" : ""}`} aria-label={seal}>
      <span className="fw-frame" aria-hidden />
      <div className="fw-fin-bank" aria-hidden>
        <span className="fw-hero-corner is-l">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...pic("pampasCorner", { lazy: true })} />
        </span>
        <span className="fw-hero-corner is-r">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...pic("pampasCorner", { lazy: true })} />
        </span>
        <span className="fw-fin-clouds">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...pic("clouds", { lazy: true, sizes: "100vw" })} />
        </span>
      </div>
      <div className="fw-fin-in">
        <div className="fw-fin-stage">
          <span className="fw-hero-arch" aria-hidden />
          <span className="fw-fin-swing" aria-hidden>
            <span className="fw-hero-swing-in">
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img {...pic("swing", { lazy: true })} />
            </span>
          </span>
          <p className="fw-wax" role="img" aria-label={`${sealHi} · ${seal}`}>
            <span className="fw-wax-ring" aria-hidden />
            <span className="fw-wax-disc" aria-hidden />
            <b lang="hi" aria-hidden>
              {sealHi}
            </b>
            <small aria-hidden>{seal}</small>
          </p>
        </div>
        {/* "With love" over the names, unless the sender's own closing line already opens with it. */}
        {!(endLine ?? "").trim().toLowerCase().startsWith(closing.toLowerCase()) && (
          <Reveal as="p" className="wk-eyebrow" delay={120}>
            <span lang={lang}>{closing}</span>
          </Reveal>
        )}
        <span className="fw-fin-rule" aria-hidden />
        <Reveal as="p" className="fw-fin-names" delay={200}>
          {first} <span>&amp;</span> {second}
        </Reveal>
        {endLine && (
          <Reveal as="p" className="fw-fin-line" delay={260}>
            {endLine}
          </Reveal>
        )}
        {hashtag && (
          <Reveal as="p" className="fw-hashtag" delay={300}>
            {hashtag}
          </Reveal>
        )}
      </div>
    </section>
  );
}
