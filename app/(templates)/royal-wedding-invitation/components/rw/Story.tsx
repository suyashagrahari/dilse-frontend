"use client";

// ─── The royal story: chapters along a gold line drawn by the scroll ────────
// One passive scroll listener, rAF-throttled and only while the section is on
// screen, writes ONE custom property (--rw-p, 0→1) on the section; the line's
// scaleY and the drifting ornaments read it (transform only).

import { useEffect, useRef } from "react";
import { Ornament, Reveal, photoImgStyle, useWeddingReducedMotion } from "../../../_wedding";
import type { RwChapter } from "./model";

export default function Story({ chapters }: { chapters: RwChapter[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useWeddingReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduce) {
      el.style.setProperty("--rw-p", "1");
      return;
    }
    let raf = 0;
    let on = false;
    const tick = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const p = Math.min(1, Math.max(0, (vh * 0.72 - r.top) / Math.max(1, r.height)));
      el.style.setProperty("--rw-p", p.toFixed(4));
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
    <div className="rw-story" ref={ref}>
      <span className="rw-drift rw-drift-a" aria-hidden>
        <Ornament id="peacock" width={150} />
      </span>
      <span className="rw-drift rw-drift-b" aria-hidden>
        <Ornament id="paisley" width={90} flip="x" />
      </span>
      <span className="rw-story-rail" aria-hidden>
        <i />
      </span>
      <ol className="rw-chapters">
        {chapters.map((c, i) => (
          <li key={i} className={`rw-ch${i % 2 ? " is-alt" : ""}${c.photo ? "" : " no-photo"}`}>
            <span className="rw-ch-dot" aria-hidden>
              <Ornament id="lotus" width={26} />
            </span>
            {c.photo && (
              <Reveal className="rw-ch-photo" effect="zoom">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.photo.url} alt={c.title} loading="lazy" decoding="async" style={photoImgStyle(c.photo)} />
              </Reveal>
            )}
            <Reveal className="rw-ch-text" delay={90}>
              {c.when && <p className="rw-ch-when">{c.when}</p>}
              {c.title && <h3 className="rw-ch-title">{c.title}</h3>}
              {c.line && <p className="rw-ch-line">{c.line}</p>}
            </Reveal>
          </li>
        ))}
      </ol>
    </div>
  );
}
