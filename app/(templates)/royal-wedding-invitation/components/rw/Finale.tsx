"use client";

// ─── The finale: diya lanterns rise over the palace, the Shubh Vivah seal ────
// Fourteen lanterns (CSS, transform/opacity only), animated only while the
// section is on screen. Reduced motion: they hang still, glowing.

import { useEffect, useRef, useState } from "react";
import { Ornament, Reveal } from "../../../_wedding";

const LANTERNS = Array.from({ length: 14 }, (_, i) => {
  const r = (n: number) => {
    const x = Math.sin((i + 1) * 9301 + n * 49297) * 233280;
    return x - Math.floor(x);
  };
  return { left: 4 + r(1) * 92, size: 16 + r(2) * 18, delay: -r(3) * 14, dur: 11 + r(4) * 8, sway: 8 + r(5) * 18 };
});

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
  const [on, setOn] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([en]) => setOn(en.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const share = () => {
    const url = typeof window !== "undefined" ? window.location.href.split("#")[0] : "";
    window.open(`https://wa.me/?text=${encodeURIComponent(`${shareText}\n${url}`)}`, "_blank", "noopener,noreferrer");
  };

  return (
    <section ref={ref} className={`rw-finale${on ? " is-on" : ""}`} aria-label={seal}>
      <div className="rw-lanterns" aria-hidden>
        {LANTERNS.map((l, i) => (
          <i
            key={i}
            className="rw-lantern"
            style={{ left: `${l.left}%`, width: l.size, height: l.size * 1.3, animationDelay: `${l.delay}s, ${l.delay}s`, animationDuration: `${l.dur}s, ${3 + (i % 4)}s`, ["--sway" as string]: `${l.sway}px` }}
          />
        ))}
      </div>
      <div className="rw-finale-in">
        <Reveal className="rw-seal-big" effect="zoom">
          <Ornament id="wax-seal" className="rw-seal-big-wax" shimmer />
          <span className="rw-seal-big-tx">
            <b lang="hi">{sealHi}</b>
            <small>{seal}</small>
          </span>
        </Reveal>
        <Reveal as="p" className="wk-eyebrow" delay={120}>
          <span lang={lang}>{closing}</span>
        </Reveal>
        <Reveal as="p" className="rw-finale-names wk-foil-text wk-shimmer" delay={200}>
          {first} <span>&amp;</span> {second}
        </Reveal>
        {endLine && (
          <Reveal as="p" className="rw-finale-line" delay={260}>
            {endLine}
          </Reveal>
        )}
        {hashtag && (
          <Reveal as="p" className="rw-hashtag" delay={300}>
            {hashtag}
          </Reveal>
        )}
        <Reveal delay={340}>
          <button type="button" className="wk-btn wk-btn-lg rw-wa" onClick={share} lang={lang}>
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden fill="currentColor">
              <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.3a.5.5 0 0 0 0-.5l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.6-.3z" />
            </svg>
            {whatsapp}
          </button>
        </Reveal>
      </div>
      <div className="rw-palace" aria-hidden>
        <Ornament id="elephant-pair" width="min(560px, 92vw)" />
      </div>
    </section>
  );
}
