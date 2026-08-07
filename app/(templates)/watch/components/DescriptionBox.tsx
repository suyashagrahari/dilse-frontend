"use client";

// ─── Description + chapters ──────────────────────────────────────────────────
//
// The chapter list is the centrepiece of this page: it is the one control
// everybody taps, and every timestamp on it is a real seek into a real player.
//
// ── THE EXPANSION IS MEASURED ────────────────────────────────────────────────
//
// `max-height` animates from the collapsed strip to the element's ACTUAL
// `scrollHeight`, and is released to `none` when the transition finishes. A
// fixed "tall enough" value would silently guillotine a sender who wrote nine
// paragraphs and twenty chapters, which is exactly the sender who cared most.
// A ResizeObserver keeps the measurement honest when the content or the width
// changes underneath it.
//
// ── THE OUTRO IS A SERIF ─────────────────────────────────────────────────────
//
// Timestamps are machinery. The last paragraphs are not. The typeface change is
// the moment the page stops imitating a product and says the thing.

import { useCallback, useEffect, useRef, useState } from "react";
import { formatTimestamp, type Chapter, type WatchDescription } from "./types";
import { FONT, SERIF, T } from "./theme";

/** How tall the collapsed strip is: two lines of 14/20, plus a hair. */
const COLLAPSED_PX = 44;
const DURATION_MS = 300;

export interface DescriptionBoxProps {
  views: string;
  postedAgo: string;
  description: WatchDescription;
  /** Index into `description.chapters`, or -1. */
  activeChapter: number;
  onSeek: (seconds: number) => void;
  /** Set while a related video is loaded — its chapters are not this one's. */
  chaptersDisabled?: boolean;
}

export default function DescriptionBox({
  views,
  postedAgo,
  description,
  activeChapter,
  onSeek,
  chaptersDisabled = false,
}: DescriptionBoxProps) {
  const bodyRef = useRef<HTMLDivElement | null>(null);
  /**
   * Three states, not two.
   *
   * `opening` is the 300ms in which `max-height` travels from the collapsed
   * strip to the measured height; `open` releases the clamp to `none` so that
   * content growing afterwards — a "Read more", a reflow at a new width — is
   * never guillotined by a number measured a second ago.
   */
  const [mode, setMode] = useState<"collapsed" | "opening" | "open">("collapsed");
  const [full, setFull] = useState(0);
  const expanded = mode !== "collapsed";

  // Measured, not guessed. Re-measured whenever the content reflows.
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const measure = () => setFull(el.scrollHeight);
    if (typeof ResizeObserver === "undefined") {
      measure();
      return;
    }
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [description]);

  useEffect(() => {
    if (mode !== "opening") return;
    const timer = window.setTimeout(() => setMode("open"), DURATION_MS + 20);
    return () => window.clearTimeout(timer);
  }, [mode]);

  const toggle = useCallback(() => {
    setMode((m) => (m === "collapsed" ? "opening" : "collapsed"));
  }, []);

  const hasChapters = description.chapters.length > 0 && !chaptersDisabled;

  const maxHeight =
    mode === "open" ? "none" : mode === "opening" ? `${Math.max(full, COLLAPSED_PX)}px` : `${COLLAPSED_PX}px`;

  return (
    <section className="wt-desc">
      <p className="wt-desc-head">
        {views}
        {views && postedAgo ? "  " : ""}
        {postedAgo}
      </p>

      <div className="wt-desc-clip" style={{ maxHeight }}>
        <div ref={bodyRef}>
          {description.intro.map((p, i) => (
            <p key={`in-${i}`} className={`wt-desc-p${!expanded && i === 0 ? " wt-desc-clamp" : ""}`}>
              {p}
            </p>
          ))}

          {hasChapters ? (
            <>
              <p className="wt-desc-gap" aria-hidden="true" />
              <ul className="wt-chapters">
                {description.chapters.map((c: Chapter, i) => {
                  const active = i === activeChapter;
                  return (
                    <li key={`${c.seconds}-${i}`} className={`wt-chapter${active ? " is-now" : ""}`}>
                      <button
                        type="button"
                        className="wt-chapter-time"
                        onClick={() => onSeek(c.seconds)}
                        aria-label={`Jump to ${formatTimestamp(c.seconds)} — ${c.label}`}
                        aria-current={active ? "true" : undefined}
                      >
                        {formatTimestamp(c.seconds)}
                      </button>
                      <span className="wt-chapter-label">{c.label}</span>
                    </li>
                  );
                })}
              </ul>
              <p className="wt-desc-gap" aria-hidden="true" />
            </>
          ) : null}

          {description.outro.map((p, i) => (
            <p key={`out-${i}`} className="wt-desc-outro">
              {p}
            </p>
          ))}
        </div>
      </div>

      <button type="button" className="wt-desc-more" onClick={toggle}>
        {expanded ? "Show less" : "...more"}
      </button>
    </section>
  );
}

export const DESCRIPTION_CSS = `
.wt-desc {
  background: ${T.chip}; border-radius: 12px; padding: 12px; margin-top: 12px;
  font-family: ${FONT};
}
.wt-desc-head {
  margin: 0 0 4px; font-size: 14px; font-weight: 500; color: ${T.ink};
  white-space: pre-wrap;
}
.wt-desc-clip {
  overflow: hidden;
  transition: max-height ${DURATION_MS}ms ease;
}
.wt-desc-p {
  margin: 0 0 8px; font-size: 14px; line-height: 20px; color: ${T.ink};
  overflow-wrap: anywhere; white-space: pre-wrap;
}
.wt-desc-clamp {
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.wt-desc-gap { margin: 0; height: 14px; }
.wt-desc-outro {
  margin: 0 0 10px; font-family: ${SERIF}; font-size: 15px; line-height: 26px;
  color: ${T.ink}; overflow-wrap: anywhere; white-space: pre-wrap;
}
.wt-chapters { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px; }
.wt-chapter {
  display: flex; gap: 8px; align-items: baseline;
  padding: 3px 0 3px 8px; border-left: 2px solid transparent;
  transition: border-color 160ms ease, color 160ms ease;
}
.wt-chapter.is-now { border-left-color: ${T.accent}; background: rgba(224,87,74,0.07); }
.wt-chapter-time {
  flex: none; border: 0; background: transparent; padding: 0; cursor: pointer;
  font-family: ${FONT}; font-size: 14px; line-height: 20px; font-weight: 500;
  color: ${T.accent}; font-variant-numeric: tabular-nums; text-decoration: none;
}
.wt-chapter-time:hover { text-decoration: underline; }
.wt-chapter-label {
  font-size: 14px; line-height: 20px; color: ${T.inkSoft}; overflow-wrap: anywhere;
}
.wt-chapter.is-now .wt-chapter-label { color: ${T.ink}; }
.wt-desc-more {
  margin-top: 6px; border: 0; background: transparent; padding: 4px 0;
  font-family: ${FONT}; font-size: 14px; font-weight: 500; color: ${T.ink}; cursor: pointer;
}
@media (prefers-reduced-motion: reduce) {
  .wt-desc-clip { transition: none; }
  .wt-chapter { transition: none; }
}
`;
