"use client";

// ─── Our story: chapters along a gold thread that grows with the scroll ──────
// At ≥960px the lanterns and cherry blossom stay pinned on the left while the
// chapters scroll past on the right; on phones the thread runs down the left
// edge. One passive, rAF-throttled scroll listener (only while the section is
// on screen) writes ONE custom property, --wp-p (0→1), read by the thread's
// scaleY. Each chapter photo is a rounded rectangle, drawn the way the sender
// framed it (focal point + zoom).

import { useEffect, useRef } from "react";
import { cdn, photoImgStyle, Reveal, useWeddingReducedMotion } from "../../../_wedding";
import { img } from "./art";
import type { WpChapter } from "./model";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII"];

export default function Story({ chapters }: { chapters: WpChapter[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useWeddingReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduce) {
      el.style.setProperty("--wp-p", "1");
      return;
    }
    let raf = 0;
    let on = false;
    const tick = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const p = Math.min(1, Math.max(0, (vh * 0.7 - r.top) / Math.max(1, r.height)));
      el.style.setProperty("--wp-p", p.toFixed(4));
    };
    const onScroll = () => {
      if (on && !raf) raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([en]) => {
      on = en.isIntersecting;
      if (on) onScroll();
    });
    io.observe(el);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    tick();
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduce]);

  return (
    <div className="wp-story" ref={ref}>
      <div className="wp-story-art" aria-hidden>
        <div className="wp-story-pin">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...img("lanterns", { lazy: true })} className="wp-story-lanterns" />
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...img("blossom", { lazy: true })} className="wp-story-blossom" />
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...img("lotusStems", { lazy: true })} className="wp-story-lotus" />
        </div>
      </div>
      <div className="wp-story-body">
        <span className="wp-story-thread" aria-hidden>
          <i />
        </span>
        <ol className="wp-chapters">
          {chapters.map((c, i) => (
            <li key={i} className={`wp-ch${c.photo ? "" : " no-photo"}${i % 2 ? " is-alt" : ""}`}>
              <span className="wp-ch-dot" aria-hidden>
                {ROMAN[i] ?? i + 1}
              </span>
              {c.photo && (
                <Reveal className="wp-ch-photo" effect="zoom">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cdn(c.photo.url)} alt={c.title || c.when} loading="lazy" decoding="async" style={photoImgStyle(c.photo)} />
                </Reveal>
              )}
              <Reveal className="wp-ch-text" delay={90}>
                {c.when && <p className="wp-ch-when">{c.when}</p>}
                {c.title && <h3 className="wp-ch-title">{c.title}</h3>}
                {c.line && <p className="wp-ch-line">{c.line}</p>}
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
