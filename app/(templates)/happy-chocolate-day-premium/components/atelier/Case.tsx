"use client";

// ─── Scene 8: The Display Case — photos as labelled bonbons on lit glass tiers
//
// The case doors swing open and the bonbons light up tier by tier. Tap one:
// it lifts and the photo is revealed on a gold-edged card (prev / next /
// close, swipe-free). "Show me all" plays them in order (the montage).

import { useEffect, useRef, useState } from "react";
import { CroppedPhoto } from "../../../_valentine/kit";
import { SkipChip } from "../../../_valentine/kit/premium";
import type { SceneProps } from "./shared";

const BONBON = [
  "radial-gradient(circle at 35% 30%, #8d5a3b, #4a2617 62%, #2b140b)",
  "radial-gradient(circle at 35% 30%, #e0607e, #a11a45 60%, #5e0d27)",
  "radial-gradient(circle at 35% 30%, #f3e2c7, #cfb08a 60%, #8f6d4a)",
  "radial-gradient(circle at 35% 30%, #c9d79a, #8ea35a 58%, #4f5e2a)",
  "radial-gradient(circle at 35% 30%, #5c3624, #24110a 62%, #120804)",
  "radial-gradient(circle at 35% 30%, #f6c3cf, #d97e97 58%, #8f3a52)",
];

export default function Case({ data, reduced, sfx, sticker, next }: SceneProps) {
  const photos = data.photos.filter((p) => p && p.url).slice(0, 12);
  const [open, setOpen] = useState<number | null>(null);
  const [tour, setTour] = useState(false);
  const [lit, setLit] = useState(reduced);
  const timers = useRef<number[]>([]);
  useEffect(() => {
    sfx("creak", { gain: 0.4 });
    sfx("choc-shimmer", { gain: 0.5, at: 0.5 });
    timers.current.push(window.setTimeout(() => setLit(true), 450));
    const t = timers.current;
    return () => t.forEach(clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (!tour) return;
    const t = window.setTimeout(() => {
      if (open === null) show(0);
      else if (open < photos.length - 1) show(open + 1);
      else {
        setTour(false);
        setOpen(null);
      }
    }, open === null ? 60 : reduced ? 2800 : 2600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tour, open]);

  const show = (i: number) => {
    setOpen(i);
    sfx("glass-ping", { detune: i * 60 });
  };
  const close = () => {
    setTour(false);
    setOpen(null);
  };
  const ph = open !== null ? photos[open] : null;

  return (
    <section className="mc-sec">
      <header className="mc-head">
        <span className="mc-stickTop">{sticker("pc5-photos", 64)}</span>
        <p className="mc-kick">The display case</p>
        <h2 className="mc-h">Our best batches</h2>
        <p className="mc-sub">Tap a bonbon to see the moment it was made from.</p>
      </header>
      <div className={`mc-case${lit ? " is-lit" : ""}`}>
        <span className="mc-caseDoor is-l" aria-hidden />
        <span className="mc-caseDoor is-r" aria-hidden />
        <div className="mc-caseIn">
          {photos.map((p, i) => (
            <button
              key={i}
              type="button"
              className={`mc-bonbon${open === i ? " is-up" : ""}`}
              style={{ ["--bb" as string]: BONBON[i % BONBON.length], transitionDelay: lit ? `${i * 70}ms` : "0ms" }}
              onClick={() => show(i)}
              aria-label={`Photo ${i + 1}${p.caption ? `: ${p.caption}` : ""}`}
            >
              <span className="mc-bbBall" />
              <span className="mc-bbLabel">{p.caption || `Batch ${i + 1}`}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="mc-actions">
        <button type="button" className="mc-btn is-ghost" onClick={() => setTour(true)} disabled={tour}>
          {tour ? "Showing…" : "Show me all of them"}
        </button>
        <button type="button" className="mc-btn" onClick={() => { close(); next(); }}>
          Box it up →
        </button>
      </div>
      {ph && open !== null && (
        <div className="mc-photoCard" role="dialog" aria-modal="true" aria-label={ph.caption || `Photo ${open + 1}`} onClick={close}>
          <figure className="mc-photoFig" onClick={(e) => e.stopPropagation()}>
            <span key={open} className={`mc-photoImg${reduced ? "" : " is-kb"}`}>
              <CroppedPhoto photo={ph} eager alt={ph.caption || `Photo ${open + 1}`} />
            </span>
            <figcaption>
              {ph.caption && <b>{ph.caption}</b>}
              {ph.note && <span>{ph.note}</span>}
            </figcaption>
            <div className="mc-photoNav">
              <button type="button" onClick={() => { setTour(false); show((open + photos.length - 1) % photos.length); }} aria-label="Previous photo">‹</button>
              <span>{open + 1} / {photos.length}</span>
              <button type="button" onClick={() => { setTour(false); show((open + 1) % photos.length); }} aria-label="Next photo">›</button>
            </div>
            <button type="button" className="mc-photoX" onClick={close} aria-label="Close">×</button>
          </figure>
        </div>
      )}
      {tour && <SkipChip onSkip={close} delay={1200} label="Stop ▸" />}
    </section>
  );
}
