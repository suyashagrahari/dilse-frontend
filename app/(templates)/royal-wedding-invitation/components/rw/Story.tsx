"use client";

// ─── The royal story: chapters along a gold thread drawn by the scroll ───────
// One passive scroll listener, rAF-throttled and only while the section is on
// screen, writes ONE custom property (--rw-p, 0→1); the thread's scaleY reads
// it (transform only). Each chapter is a sandstone card with its year on a
// small maroon-and-gold seal; the photo (if any) is a rounded rectangle with
// all four corners equal. Phones: one column along the left thread. ≥860px:
// chapters alternate either side of a centred thread.

import { useEffect, useRef } from "react";
import { Reveal, useWeddingReducedMotion } from "../../../_wedding";
import CroppedPhoto from "../../../_valentine/kit/CroppedPhoto";
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
      <span className="rw-story-rail" aria-hidden>
        <i />
      </span>
      <ol className="rw-chapters">
        {chapters.map((c, i) => (
          <li key={i} className={`rw-ch${i % 2 ? " is-alt" : ""}${c.photo ? "" : " no-photo"}`}>
            <span className="rw-ch-dot" aria-hidden />
            <Reveal className="rw-ch-card" effect="rise" delay={60}>
              {c.photo && (
                <span className="rw-ch-photo">
                  <CroppedPhoto photo={c.photo} alt={c.title} className="rw-ch-img" />
                </span>
              )}
              <div className="rw-ch-text">
                {c.when && <p className="rw-ch-when">{c.when}</p>}
                {c.title && <h3 className="rw-ch-title">{c.title}</h3>}
                {c.line && <p className="rw-ch-line">{c.line}</p>}
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </div>
  );
}
