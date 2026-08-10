// ─── DescriptionBlock — the copy, and the "more" that opens it ───────────────
//
// The short paragraphs are always visible. The rest lives behind an accent
// "more" affordance and the developer line sits under both.
//
// ── WHY THE EXPANSION MEASURES INSTEAD OF GUESSING ───────────────────────────
//
// The obvious way to animate this is a fixed `max-height` large enough to fit
// the copy. It is also wrong twice over. Too small and long copy is silently
// guillotined; too large and the transition spends most of its 300ms animating
// empty space, so the panel appears to snap open and then wait. Either way the
// duration no longer corresponds to the distance travelled.
//
// So the panel animates between `0` and its MEASURED `scrollHeight`, and then
// lands on `auto` once the transition ends. That final hand-off matters: an
// expanded panel pinned to a pixel height will not reflow when the viewport
// narrows or the font loads, and the last paragraph gets clipped by a number
// that was correct at 420px and is not correct at 380px.
//
// Collapsing runs the same trick backwards — `auto` is read back to a concrete
// pixel height, the browser is forced to lay that out, and only then does the
// height go to zero. Without the forced reflow the two style writes coalesce
// into one and the panel vanishes instantly.
//
// ── REDUCED MOTION ───────────────────────────────────────────────────────────
//
// The whole measure/transition dance is skipped and the height is written as
// `auto` or `0` in a single pass. Nothing is animated, nothing is queued, and
// no transitionend is ever waited on — so the panel cannot get stuck at a
// stale pixel height if the transition never fires.

"use client";

import * as React from "react";
import { AP, AP_GUTTER, AP_TAP } from "./theme";
import type { AppDescription } from "./types";

const EXPAND_MS = 300;

const paraStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 15,
  lineHeight: "20px",
  color: AP.ink,
};

function Paragraphs({ items }: { items: string[] }) {
  return (
    <>
      {items.map((text, i) => (
        <p key={i} style={{ ...paraStyle, marginTop: i === 0 ? 0 : 12 }}>
          {text}
        </p>
      ))}
    </>
  );
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  return reduced;
}

export function DescriptionBlock({
  description,
  developer,
}: {
  description: AppDescription;
  developer: string;
}) {
  const short = (description?.short ?? []).filter((p) => p && p.trim());
  const full = (description?.full ?? []).filter((p) => p && p.trim());
  const hasMore = full.length > 0;

  const [expanded, setExpanded] = React.useState(false);
  const panelRef = React.useRef<HTMLDivElement | null>(null);
  const reduced = usePrefersReducedMotion();

  const toggle = () => {
    const el = panelRef.current;
    const next = !expanded;
    setExpanded(next);
    if (!el) return;

    if (reduced) {
      el.style.transition = "none";
      el.style.height = next ? "auto" : "0px";
      return;
    }

    el.style.transition = `height ${EXPAND_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`;

    if (next) {
      el.style.height = `${el.scrollHeight}px`;
    } else {
      // `auto` cannot be transitioned from, so pin the current height and force
      // a layout read before writing the target — see the note at the top.
      el.style.height = `${el.scrollHeight}px`;
      void el.offsetHeight;
      el.style.height = "0px";
    }
  };

  /** Only an OPEN panel is released to `auto`; a closed one stays at zero. */
  const onTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.propertyName !== "height" || e.target !== e.currentTarget) return;
    if (expanded && panelRef.current) panelRef.current.style.height = "auto";
  };

  return (
    <section
      aria-label="About"
      style={{ padding: `0 ${AP_GUTTER}px`, fontFamily: AP.font }}
    >
      <Paragraphs items={short} />

      {hasMore ? (
        <>
          <div
            ref={panelRef}
            id="description-more"
            aria-hidden={!expanded}
            onTransitionEnd={onTransitionEnd}
            style={{ height: 0, overflow: "hidden" }}
          >
            <div style={{ paddingTop: short.length > 0 ? 12 : 0 }}>
              <Paragraphs items={full} />
            </div>
          </div>

          <button
            type="button"
            onClick={toggle}
            aria-expanded={expanded}
            aria-controls="description-more"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              minHeight: AP_TAP,
              padding: 0,
              border: "none",
              background: "transparent",
              color: AP.accent,
              fontFamily: "inherit",
              fontSize: 15,
              lineHeight: "20px",
              fontWeight: 600,
              cursor: "pointer",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            {expanded ? "less" : "more"}
            <svg
              width="11"
              height="11"
              viewBox="0 0 12 12"
              fill="none"
              aria-hidden="true"
              focusable="false"
              style={{
                transform: expanded ? "rotate(180deg)" : "none",
                transition: reduced ? "none" : `transform ${EXPAND_MS}ms ease`,
              }}
            >
              <path
                d="M2.5 4.25 6 7.75l3.5-3.5"
                stroke={AP.accent}
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </>
      ) : null}

      <p
        style={{
          margin: `${hasMore ? 4 : 16}px 0 0`,
          fontSize: 15,
          lineHeight: "20px",
          fontWeight: 600,
          color: AP.accent,
        }}
      >
        {developer}
      </p>
    </section>
  );
}

export default DescriptionBlock;
