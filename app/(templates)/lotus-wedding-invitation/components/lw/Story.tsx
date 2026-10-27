"use client";

// ─── Our story: chapters along a lotus stem that grows with the scroll ───────
// At ≥960px the couple on their marigold swing (the owner's art) stays pinned
// on the left under a mossy branch while the chapters scroll past on the
// right. One passive, rAF-throttled scroll listener (only while the section is
// on screen) writes ONE custom property, --lw-p (0→1); the stem's scaleY reads
// it. Each chapter's photo is drawn the way the sender framed it.

import { useEffect, useRef } from "react";
import { cdn, photoImgStyle, Reveal, useWeddingReducedMotion } from "../../../_wedding";
import { img } from "./art";
import type { LwChapter } from "./model";

export default function Story({ chapters }: { chapters: LwChapter[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useWeddingReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduce) {
      el.style.setProperty("--lw-p", "1");
      return;
    }
    let raf = 0;
    let on = false;
    const tick = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const p = Math.min(1, Math.max(0, (vh * 0.7 - r.top) / Math.max(1, r.height)));
      el.style.setProperty("--lw-p", p.toFixed(4));
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
    <div className="lw-story" ref={ref}>
      <div className="lw-story-art" aria-hidden>
        <div className="lw-story-pin">
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...img("branch", { lazy: true })} className="lw-story-branch" />
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...img("swing", { lazy: true })} className="lw-story-swing" />
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img {...img("feather", { lazy: true })} className="lw-story-feather" />
        </div>
      </div>
      <div className="lw-story-body">
        <span className="lw-story-stem" aria-hidden>
          <i />
        </span>
        <ol className="lw-chapters">
          {chapters.map((c, i) => (
            <li key={i} className={`lw-ch${c.photo ? "" : " no-photo"}`}>
              <span className="lw-ch-dot" aria-hidden>
                <svg viewBox="0 0 24 24" width="22" height="22">
                  <path d="M12 20c-3-2.6-3.6-7 0-12 3.6 5 3 9.4 0 12z" fill="#F3B6C8" stroke="#C9A24A" strokeWidth="1" />
                  <path d="M12 20c-4.4-.4-7.2-3.2-7.2-6.8 3.4.2 6 2.6 7.2 6.8zM12 20c4.4-.4 7.2-3.2 7.2-6.8-3.4.2-6 2.6-7.2 6.8z" fill="#F9D7E1" stroke="#C9A24A" strokeWidth="1" />
                </svg>
              </span>
              {c.photo && (
                <Reveal className="lw-ch-photo" effect="zoom">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cdn(c.photo.url)} alt={c.title || c.when} loading="lazy" decoding="async" style={photoImgStyle(c.photo)} />
                </Reveal>
              )}
              <Reveal className="lw-ch-text" delay={90}>
                {c.when && <p className="lw-ch-when">{c.when}</p>}
                {c.title && <h3 className="lw-ch-title">{c.title}</h3>}
                {c.line && <p className="lw-ch-line">{c.line}</p>}
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
