"use client";

// ─── Our story: chapters along a gold thread that the scroll draws ───────────
// The thread is the mauli (red-and-gold sacred thread) from the hands art: a
// line whose scaleY follows the scroll (one rAF-throttled listener writes ONE
// custom property, --pd-p 0→1). Photos sit in gold-framed rounded windows that
// alternate sides on desktop; each chapter rises in as it arrives.

import { useEffect, useRef } from "react";
import { Reveal, useWeddingReducedMotion } from "../../../_wedding";
import CroppedPhoto from "../../../_valentine/kit/CroppedPhoto";
import type { PdChapter } from "./model";

export default function Story({ chapters }: { chapters: PdChapter[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useWeddingReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduce) {
      el.style.setProperty("--pd-p", "1");
      return;
    }
    let raf = 0;
    let on = false;
    const tick = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const p = Math.min(1, Math.max(0, (vh * 0.7 - r.top) / Math.max(1, r.height)));
      el.style.setProperty("--pd-p", p.toFixed(4));
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
    <div className="pd-story" ref={ref}>
      <span className="pd-story-rail" aria-hidden>
        <i />
      </span>
      <ol className="pd-chapters">
        {chapters.map((c, i) => (
          <li key={i} className={`pd-ch${i % 2 ? " is-alt" : ""}${c.photo ? "" : " no-photo"}`}>
            <span className="pd-ch-dot" aria-hidden>
              <i />
            </span>
            {c.photo && (
              <Reveal className="pd-ch-photo" effect="zoom">
                <span className="pd-ch-win">
                  <CroppedPhoto photo={c.photo} alt={c.title} />
                </span>
              </Reveal>
            )}
            <Reveal className="pd-ch-text" delay={110}>
              {c.when && <p className="pd-ch-when">{c.when}</p>}
              {c.title && <h3 className="pd-ch-title">{c.title}</h3>}
              {c.line && <p className="pd-ch-line">{c.line}</p>}
            </Reveal>
          </li>
        ))}
      </ol>
    </div>
  );
}
