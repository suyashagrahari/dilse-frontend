"use client";

// ─── The finale: back where it began, one full screen ───────────────────────
// The opening's world again: the watercolour sky, hills and lake under an
// ivory wash, template15's floral crowns hung from the top corners, the
// "Shubh Vivah" seal, the names, the closing line, the hashtag, a WhatsApp
// share and "Replay the opening", and the gold doors standing closed at the
// foot. Exactly one screen on every device. Nothing moves.

import { useEffect, useRef, useState } from "react";
import { Reveal } from "../../../_wedding";
import { Icon, WA, openWhatsApp } from "./Actions";
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
  whatsapp: string;
  replay: string;
  shareText: string;
  onReplay: () => void;
}

export default function Finale({ seal, sealHi, bilingual, closing, endLine, first, second, hashtag, lang, whatsapp, replay, shareText, onReplay }: FinaleProps) {
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
      {/* The opening's world again: the watercolour sky, hills and lake, the floral crowns hung from the top corners. */}
      <Lake className="wp-fin-lake" lotus={false} />
      <div className="wp-open-wash wp-fin-wash" aria-hidden />
      <div className="wp-fin-garland" aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img("floralCornerL", { lazy: true })} className="is-l" />
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img("floralCornerR", { lazy: true })} className="is-r" />
      </div>
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
      {/* The gold doors from the opening, closed again, the terrace glowing faintly through the glass. */}
      <div className="wp-fdoor-wrap" aria-hidden>
      <div className="wp-fdoor">
        <div className="wp-fdoor-ap">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...img("terrace", { lazy: true })} />
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img("doorL", { lazy: true })} className="wp-fdoor-l" />
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img("doorR", { lazy: true })} className="wp-fdoor-r" />
        {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
        <img {...img("frame", { lazy: true })} className="wp-fdoor-frame" />
      </div>
      </div>
    </section>
  );
}
