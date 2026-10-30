"use client";

// ─── The finale: the last page of the suite, sealed ─────────────────────────
// The hero's whole scene again, full screen (the faith's wall, floor and
// flanking arches), the arch at full height with the goodbye inside it (no
// guest line). When the page is 45 % on screen a wax seal is pressed onto the
// arch (the faith's word — ਅਨੰਦ ਕਾਰਜ · نکاح · ✝ — scale 1.6 → 1 with a soft
// squash, then a ring of light), then the closing words, the names and the
// hashtag, sized so the whole goodbye fits one screen. Reduced motion: the
// seal is simply there.

import { useEffect, useRef, useState } from "react";
import { Reveal, useWeddingReducedMotion } from "../_wedding";
import { HeroCard, Scene } from "./Hero";
import type { FaithId, Lang, Strings } from "./types";

export interface FinaleProps {
  faith: FaithId;
  /** the seal word's script ("en" when the faith has no second language) */
  sealLang: string;
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

export default function Finale({ faith, sealLang, s, sealWord, seal, endLine, first, second, hashtag, lang, invocation }: FinaleProps) {
  const closing = s.closing;
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
    <section ref={ref} className={`fw-finale fw-hero fh-hero fh-fin is-${faith} is-open${on ? " is-on" : ""}${pressed || reduce ? " is-pressed" : ""}`} aria-label={seal}>
      <Scene lazy />
      <div className="fh-stage">
        <div className="fw-fin-stage fh-par">
          <div className="fh-fin-card">
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
            <b lang={sealLang} aria-hidden>
              {sealWord}
            </b>
            <small aria-hidden>{seal}</small>
          </p>
        </div>
      </div>
    </section>
  );
}
