"use client";

// ─── The finale: evening on the terrace ──────────────────────────────────────
// Watercolour foliage hangs from the top, two lanterns glow either side, the
// pink gazebo rises over the lake and the white balustrade; then the "Shubh
// Vivah" seal, the names, the closing line, the hashtag, a WhatsApp share and
// "Replay the opening". A few petals drift down (transform only, paused off
// screen; none for reduced motion).

import { useEffect, useMemo, useRef, useState } from "react";
import { Reveal } from "../../../_wedding";
import { Icon, WA, openWhatsApp } from "./Actions";
import { img, seeded } from "./art";

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
  whatsapp: string;
  replay: string;
  shareText: string;
  onReplay: () => void;
}

export default function Finale({ seal, sealHi, bilingual, closing, endLine, first, second, hashtag, lang, whatsapp, replay, shareText, onReplay }: FinaleProps) {
  const ref = useRef<HTMLElement>(null);
  const [on, setOn] = useState(false);
  const drift = useMemo(() => {
    const r = seeded(23);
    return Array.from({ length: 10 }, () => ({ left: 4 + r() * 92, size: 10 + r() * 10, delay: -r() * 12, dur: 11 + r() * 8, dx: (r() - 0.5) * 90 }));
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([en]) => setOn(en.isIntersecting), { threshold: 0.05 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} className={`wp-finale${on ? " is-on" : ""}`} aria-label={seal}>
      <div className="wp-finale-foliage" aria-hidden>
        <picture>
          <source media="(max-width: 700px)" srcSet={img("foliageSm").src} />
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <img {...img("foliage", { lazy: true })} />
        </picture>
      </div>
      <div className="wp-drift" aria-hidden>
        {drift.map((d, i) => (
          <i key={i} style={{ left: `${d.left}%`, width: d.size, height: d.size, animationDelay: `${d.delay}s`, animationDuration: `${d.dur}s`, ["--dx" as string]: `${d.dx}px` }} />
        ))}
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
          <button type="button" className="wp-btn is-lg" onClick={() => openWhatsApp(shareText)} lang={lang}>
            <Icon d={WA} fill size={18} /> <span>{whatsapp}</span>
          </button>
          <button type="button" className="wp-replay" onClick={onReplay} lang={lang}>
            ↺ {replay}
          </button>
        </Reveal>
      </div>
      <div className="wp-finale-foot" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img("gazebo", { lazy: true })} className="wp-finale-gazebo" />
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img("lake", { lazy: true })} className="wp-lake" />
        <span className="wp-balustrade" />
      </div>
    </section>
  );
}
