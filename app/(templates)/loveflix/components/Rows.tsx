"use client";

// Rails. Web: 16:9 cards in a paged slider with edge arrows, page ticks and a
// hover-expand preview (the preview itself lives in Browse so it can escape
// the rail's overflow). Mobile app: portrait posters in a swipe rail.

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { CornerL, Still, Top10Chip } from "./Brand";
import { titleKey, useLf, type Title } from "./context";
import { describe } from "./describe";
import { IcChevronLeft, IcChevronRight, IcInfo, IcPlay } from "./icons";

export type PreviewFn = (t: Title, el: HTMLElement) => void;

/* ── The rail ───────────────────────────────────────────────────────────── */

export function Rail({ title, children, kind = "wide", id }: { title: string; children: ReactNode; kind?: "wide" | "top10" | "poster"; id?: string }) {
  const track = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState({ i: 0, n: 1 });
  const [touched, setTouched] = useState(false);

  const measure = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const n = Math.max(1, Math.round(el.scrollWidth / el.clientWidth));
    const i = Math.min(n - 1, Math.round(el.scrollLeft / Math.max(1, el.clientWidth * 0.92)));
    setPage((p) => (p.i === i && p.n === n ? p : { i, n }));
  }, []);

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [measure]);

  const go = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    setTouched(true);
    el.scrollBy({ left: dir * el.clientWidth * 0.92, behavior: "smooth" });
  };

  return (
    <section className={`lf-row lf-row-${kind}`} id={id} aria-label={title}>
      <h2 className="lf-row-h">
        <span>{title}</span>
        <span className="lf-row-explore">
          Explore All <IcChevronRight size={14} />
        </span>
      </h2>
      {page.n > 1 && (
        <div className="lf-row-ticks" aria-hidden>
          {Array.from({ length: page.n }, (_, i) => (
            <i key={i} className={i === page.i ? "is-on" : ""} />
          ))}
        </div>
      )}
      <div className="lf-row-wrap">
        {(touched || page.i > 0) && (
          <button type="button" className="lf-row-arrow is-l" onClick={() => go(-1)} aria-label="Previous">
            <IcChevronLeft size={34} />
          </button>
        )}
        <div className="lf-row-track lf-nobar" ref={track} onScroll={measure}>
          {children}
        </div>
        {page.i < page.n - 1 && (
          <button type="button" className="lf-row-arrow is-r" onClick={() => go(1)} aria-label="Next">
            <IcChevronRight size={34} />
          </button>
        )}
      </div>
    </section>
  );
}

/* ── Hover wiring ───────────────────────────────────────────────────────── */

function useHover(t: Title, onPreview?: PreviewFn) {
  const { canHover } = useLf();
  const timer = useRef<number | null>(null);
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => () => { if (timer.current) window.clearTimeout(timer.current); }, []);
  if (!canHover || !onPreview) return { ref };
  return {
    ref,
    onMouseEnter: () => {
      timer.current = window.setTimeout(() => ref.current && onPreview(t, ref.current), 420);
    },
    onMouseLeave: () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
  };
}

/* ── Cards ──────────────────────────────────────────────────────────────── */

/** A 16:9 web card. Episodes carry a progress bar. */
export function WideCard({ t, onPreview }: { t: Title; onPreview?: PreviewFn }) {
  const { data, openDetails, watched } = useLf();
  const d = describe(t, data);
  const h = useHover(t, onPreview);
  const isEp = t.kind === "episode";
  const prog = isEp ? (watched.has(t.index) ? 100 : d.progress) : undefined;
  return (
    <button type="button" className="lf-card lf-card-wide" onClick={() => openDetails(t)} aria-label={d.title} {...h}>
      <Still src={d.src} crop={d.crop} label={d.title} seed={titleKey(t) + d.title} className={`lf-card-img${d.ribbon ? " has-ribbon" : ""}`}>
        <CornerL />
        {d.src && <span className="lf-card-title">{d.title}</span>}
        {d.ribbon && <span className="lf-ribbon">{d.ribbon}</span>}
      </Still>
      {prog !== undefined && (
        <span className="lf-prog" aria-hidden>
          <i style={{ width: `${prog}%` }} />
        </span>
      )}
    </button>
  );
}

/** The mobile app's portrait poster. */
export function PosterCard({ t }: { t: Title }) {
  const { data, openDetails, play, watched } = useLf();
  const d = describe(t, data);
  const isEp = t.kind === "episode";
  const prog = isEp ? (watched.has(t.index) ? 100 : d.progress) : undefined;
  return (
    <div className={`lf-card lf-card-poster${isEp ? " is-cw" : ""}`}>
      <button type="button" className="lf-card-hit" onClick={() => (isEp ? play(t.index) : openDetails(t))} aria-label={d.title}>
        <Still src={d.src} crop={d.crop} label={d.title} seed={titleKey(t) + d.title} artSize="sm" className={`lf-card-img${d.ribbon ? " has-ribbon" : ""}`}>
          <CornerL />
          {d.src && <span className="lf-card-title">{d.title}</span>}
          {d.ribbon && <span className="lf-ribbon">{d.ribbon}</span>}
          {isEp && (
            <span className="lf-cw-play" aria-hidden>
              <IcPlay size={18} />
            </span>
          )}
        </Still>
      </button>
      {isEp && (
        <>
          <span className="lf-prog" aria-hidden>
            <i style={{ width: `${prog}%` }} />
          </span>
          <span className="lf-cw-bar">
            <button type="button" onClick={() => openDetails(t)} aria-label="Details">
              <IcInfo size={18} />
            </button>
            <span>{d.episodeLabel}</span>
            <button type="button" onClick={() => openDetails(t)} aria-label="More">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <circle cx="12" cy="5" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="12" cy="19" r="2" />
              </svg>
            </button>
          </span>
        </>
      )}
    </div>
  );
}

/** Giant outlined numeral + portrait poster. */
export function Top10Card({ t, rank, onPreview }: { t: Title; rank: number; onPreview?: PreviewFn }) {
  const { data, openDetails } = useLf();
  const d = describe(t, data);
  const h = useHover(t, onPreview);
  return (
    <button type="button" className="lf-card lf-card-top10" onClick={() => openDetails(t)} aria-label={`Number ${rank}: ${d.title}`} {...h}>
      <span className={`lf-num${rank === 10 ? " is-10" : ""}`} aria-hidden>
        {rank}
      </span>
      <Still src={d.src} crop={d.crop} seed={`r${rank}`} className="lf-top10-poster">
        <span className="lf-top10-shade" />
        <CornerL />
        <span className="lf-top10-chip">
          <Top10Chip size={22} />
        </span>
        <span className="lf-top10-text">{d.title}</span>
      </Still>
    </button>
  );
}
