"use client";

// ─── Our story: pages pressed in a keepsake album ───────────────────────────
// A gold thread runs down the middle (drawn by the scroll: one passive,
// rAF-throttled listener writes --fw-p 0→1 on the section, the thread's
// scaleY reads it). Each chapter is a photo tucked into the album at a slight
// tilt, and a page of handwriting beside it; they alternate sides from 860 px.
// A chapter without a photo gets its year in large gold-foil numerals instead.
// A vine hangs over the top corner and sways. Transform/opacity only.

import { useEffect, useRef } from "react";
import { cdn, photoImgStyle, Reveal, useWeddingReducedMotion } from "../../../_wedding";
import type { FwChapter } from "./model";

export default function Story({ chapters }: { chapters: FwChapter[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useWeddingReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduce) {
      el.style.setProperty("--fw-p", "1");
      return;
    }
    let raf = 0;
    let on = false;
    const tick = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const p = Math.min(1, Math.max(0, (vh * 0.7 - r.top) / Math.max(1, r.height)));
      el.style.setProperty("--fw-p", p.toFixed(4));
    };
    const onScroll = () => {
      if (on && !raf) raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([en]) => {
      on = en.isIntersecting;
      el.classList.toggle("is-idle", !on);
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
    <div className="fw-story" ref={ref}>
      <span className="fw-thread" aria-hidden>
        <i />
      </span>
      <ol className="fw-chapters">
        {chapters.map((c, i) => (
          <li key={i} className={`fw-ch${i % 2 ? " is-alt" : ""}${c.photo ? "" : " no-photo"}`}>
            <span className="fw-ch-knot" aria-hidden />
            {!c.photo && (
              <Reveal className="fw-ch-deco" effect="fade" delay={200}>
                <span className="fw-ch-year" aria-hidden>
                  {c.when || String(i + 1).padStart(2, "0")}
                </span>
              </Reveal>
            )}
            {c.photo && (
              <Reveal className="fw-ch-photo" effect="zoom">
                <span className="fw-ch-print" style={{ ["--tilt" as string]: `${i % 2 ? 2.2 : -2.4}deg` }}>
                  <span className="fw-ch-pic">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={cdn(c.photo.url)} alt={c.title} loading="lazy" decoding="async" style={photoImgStyle(c.photo)} />
                  </span>
                  {c.when && <span className="fw-ch-stamp">{c.when}</span>}
                </span>
              </Reveal>
            )}
            <Reveal className="fw-ch-text fw-fold" delay={110}>
              {c.when && <p className="fw-ch-when">{c.when}</p>}
              {c.title && <h3 className="fw-ch-title">{c.title}</h3>}
              {c.line && <p className="fw-ch-line">{c.line}</p>}
            </Reveal>
          </li>
        ))}
      </ol>
    </div>
  );
}
