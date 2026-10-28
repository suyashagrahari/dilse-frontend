"use client";

// ─── Our story: chapters along a garden vine the scroll grows ────────────────
// One passive scroll listener, rAF-throttled and only while the section is on
// screen, writes ONE custom property (--gw-p, 0→1) on the section; the vine's
// scaleY and the drifting cherry branch read it (transform only). Each chapter
// photo sits in an rounded frame (the sender's crop + zoom kept), the text
// rises in beside it; phones read one column, wide screens alternate sides.

import { useEffect, useRef } from "react";
import { cdn, photoImgStyle, Reveal, useWeddingReducedMotion } from "../../../_wedding";
import type { GwChapter } from "./model";

function Bud() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden focusable="false">
      <circle cx="13" cy="13" r="12" fill="#fffaf8" stroke="currentColor" strokeWidth="1.2" />
      <g fill="#f4b6c6" stroke="#b4596c" strokeWidth=".8">
        <path d="M13 6c2.6 2.6 2.6 6.4 0 9.6-2.6-3.2-2.6-7 0-9.6z" />
        <path d="M13 15.6c-1.6-2.9-4.6-4.6-7.6-4.3.6 3.3 3.6 5.2 7.6 4.3zM13 15.6c1.6-2.9 4.6-4.6 7.6-4.3-.6 3.3-3.6 5.2-7.6 4.3z" />
      </g>
      <path d="M8.5 19h9" stroke="#9db89a" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export default function Story({ chapters }: { chapters: GwChapter[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useWeddingReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduce) {
      el.style.setProperty("--gw-p", "1");
      return;
    }
    let raf = 0;
    let on = false;
    const tick = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const p = Math.min(1, Math.max(0, (vh * 0.72 - r.top) / Math.max(1, r.height)));
      el.style.setProperty("--gw-p", p.toFixed(4));
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
    <div className="gw-story" ref={ref}>
      <span className="gw-story-rail" aria-hidden>
        <i />
      </span>
      <ol className="gw-chapters">
        {chapters.map((c, i) => (
          <li key={i} className={`gw-ch${i % 2 ? " is-alt" : ""}${c.photo ? "" : " no-photo"}`}>
            <span className="gw-ch-dot" aria-hidden>
              <Bud />
            </span>
            {c.photo && (
              <Reveal className="gw-ch-photo" effect="zoom">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cdn(c.photo.url)} alt={c.title} loading="lazy" decoding="async" style={photoImgStyle(c.photo)} />
              </Reveal>
            )}
            <Reveal className="gw-ch-text" delay={90}>
              {c.when && <p className="gw-ch-when">{c.when}</p>}
              {c.title && <h3 className="gw-ch-title">{c.title}</h3>}
              {c.line && <p className="gw-ch-line">{c.line}</p>}
            </Reveal>
          </li>
        ))}
      </ol>
    </div>
  );
}
