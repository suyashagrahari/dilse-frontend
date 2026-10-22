"use client";

// ─── The finale: the palace gates close softly on "Shubh Vivah" ──────────────
// The same carved doors as the opening, at a smaller scale, stand open with
// lamplight behind; when the gate is 60% on screen they swing shut (rotateY
// ±78° → 0, 1.4 s), "शुभ विवाह · Shubh Vivah" settles onto the closed doors and
// a last shower of petals falls. Diya lanterns rise behind (only while the
// section is on screen). Reduced motion: doors closed, lanterns hang still.

import { useEffect, useRef, useState } from "react";
import { Ornament, PetalBurst, Reveal, useWeddingReducedMotion } from "../../../_wedding";
import Door from "./Door";
import { seeded } from "./art";

const LANTERNS = (() => {
  const r = seeded(17);
  return Array.from({ length: 10 }, () => ({ left: 4 + r() * 92, size: 16 + r() * 18, delay: -r() * 14, dur: 11 + r() * 8, sway: 8 + r() * 18 }));
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
  whatsapp: string;
  shareText: string;
}

export default function Finale({ seal, sealHi, closing, endLine, first, second, hashtag, lang, whatsapp, shareText }: FinaleProps) {
  const ref = useRef<HTMLElement>(null);
  const gateRef = useRef<HTMLDivElement>(null);
  const reduce = useWeddingReducedMotion();
  const [on, setOn] = useState(false);
  const [closed, setClosed] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([en]) => setOn(en.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
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
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduce]);

  const shut = closed || reduce;
  const share = () => {
    const url = typeof window !== "undefined" ? window.location.href.split("#")[0] : "";
    window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText}\n${url}`)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <section ref={ref} className={`fw-finale${on ? " is-on" : ""}`} aria-label={seal}>
      <div className="fw-lanterns" aria-hidden>
        {LANTERNS.map((l, i) => (
          <i
            key={i}
            className="fw-lantern"
            style={{ left: `${l.left}%`, width: l.size, height: l.size * 1.3, animationDelay: `${l.delay}s, ${l.delay}s`, animationDuration: `${l.dur}s, ${3 + (i % 4)}s`, ["--sway" as string]: `${l.sway}px` }}
          />
        ))}
      </div>
      <div className="fw-finale-in">
        <div ref={gateRef} className={`fw-close${shut ? " is-closed" : ""}`}>
          <div className="fw-arch fw-arch-sm">
            <div className="fw-light" aria-hidden />
            <div className="fw-doors">
              <Door side="left" lazy />
              <Door side="right" lazy />
            </div>
            <Ornament id="jharokha-arch" className="fw-arch-frame" shimmer />
            <p className="fw-close-seal">
              <b lang="hi">{sealHi}</b>
              <small>{seal}</small>
            </p>
          </div>
          {closed && !reduce && (
            <div className="fw-close-petals">
              <PetalBurst kind={["marigold-petal", "rose-petal", "gold-confetti"]} count={10} mode="fall" seed={23} />
            </div>
          )}
        </div>
        <Reveal as="p" className="wk-eyebrow" delay={120}>
          <span lang={lang}>{closing}</span>
        </Reveal>
        <Reveal as="p" className="fw-finale-names wk-foil-text wk-shimmer" delay={200}>
          {first} <span>&amp;</span> {second}
        </Reveal>
        {endLine && (
          <Reveal as="p" className="fw-finale-line" delay={260}>
            {endLine}
          </Reveal>
        )}
        {hashtag && (
          <Reveal as="p" className="fw-hashtag" delay={300}>
            {hashtag}
          </Reveal>
        )}
        <Reveal delay={340}>
          <button type="button" className="wk-btn wk-btn-lg fw-wa" onClick={share} lang={lang}>
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden fill="currentColor">
              <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3a.5.5 0 0 0 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.6-.3z" />
            </svg>
            {whatsapp}
          </button>
        </Reveal>
      </div>
      <div className="fw-palace" aria-hidden>
        <Ornament id="elephant-pair" width="min(560px, 92vw)" />
      </div>
    </section>
  );
}
