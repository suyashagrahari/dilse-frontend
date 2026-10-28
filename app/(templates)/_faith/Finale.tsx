"use client";

// ─── The finale: the last page of the suite, sealed ─────────────────────────
// The hero's arched card again (quieter: no guest line), the faith's corners
// at the foot. When the page is 45 % on screen a wax seal is pressed onto the
// card (the faith's word — ਅਨੰਦ ਕਾਰਜ · نکاح · ✝ — scale 1.6 → 1 with a soft
// squash, then a ring of light), then the closing words, the names and the
// hashtag, sized so the whole goodbye fits one screen. Reduced motion: the
// seal is simply there.

import { useEffect, useRef, useState } from "react";
import { Reveal, useWeddingReducedMotion } from "../_wedding";
import { usePic } from "./art";
import { HeroCard } from "./Hero";
import type { FaithId, Lang, Strings } from "./types";

export interface FinaleProps {
  faith: FaithId;
  s: Strings;
  /** The seal's word in the faith's own script, and its English line. */
  sealWord: string;
  seal: string;
  endLine: string;
  first: string;
  second: string;
  hashtag: string;
  lang: Lang;
  invocation: boolean;
}

export default function Finale({ faith, s, sealWord, seal, endLine, first, second, hashtag, lang, invocation }: FinaleProps) {
  const closing = s.closing;
  const pic = usePic();
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
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img className="fh-corner is-l" {...pic("corner", { lazy: true, sizes: "30vw" })} />
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img className="fh-corner is-r" {...pic("cornerR", { lazy: true, sizes: "30vw" })} />
      </div>
      <div className="fw-fin-in">
        <div className="fw-fin-stage">
          <div className={`fh-fin-card fh-hero is-${faith} is-open`}>
            <HeroCard
              faith={faith}
              s={s}
              lang={lang}
              first={first}
              second={second}
              invocation={invocation}
              lazy
              as="p"
              copy={
                <>
                  {/* "With love" over the names, unless the sender's own closing line already opens with it. */}
                  {!(endLine ?? "").trim().toLowerCase().startsWith(closing.toLowerCase()) && (
                    <Reveal as="p" className="fh-eyebrow" delay={120}>
                      <span lang={lang}>{closing}</span>
                    </Reveal>
                  )}
                  <Reveal as="p" className="fh-names fh-fin-names" delay={200}>
                    <span className="fh-n">{first}</span>
                    <span className="fh-amp">&amp;</span>
                    <span className="fh-n">{second}</span>
                  </Reveal>
                  <span className="fw-fin-rule" aria-hidden />
                  {endLine && (
                    <Reveal as="p" className="fh-sub fh-fin-line" delay={260}>
                      {endLine}
                    </Reveal>
                  )}
                  {hashtag && (
                    <Reveal as="p" className="fw-hashtag" delay={300}>
                      {hashtag}
                    </Reveal>
                  )}
                </>
              }
            />
          </div>
          <p className="fw-wax" role="img" aria-label={`${sealWord} · ${seal}`}>
            <span className="fw-wax-ring" aria-hidden />
            <span className="fw-wax-disc" aria-hidden />
            <b lang={faith === "sikh" ? "pa" : faith === "muslim" ? "ur" : "en"} aria-hidden>
              {sealWord}
            </b>
            <small aria-hidden>{seal}</small>
          </p>
        </div>
      </div>
    </section>
  );
}
