"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { appendReserve, PAA, PALETTE, TAP_TARGET_PX, UI, type PaaItem } from "./types";
import { Snippet } from "./atoms";

/* ── People Also Ask ─────────────────────────────────────────────────────────
 *
 * Two behaviours make this box read as real rather than as a mock:
 *
 *   1. The expand is a MEASURED height animation. `scrollHeight` is read at
 *      toggle time and animated to; once the transition has run, `max-height`
 *      is released to `none` so a 400-character answer, a font swap or a resize
 *      can never clip it. A fixed max-height cap is the usual shortcut and it
 *      quietly truncates the longest, best answers.
 *
 *   2. Expanding one question APPENDS two more to the bottom and collapses
 *      nothing. People open all of them; the box growing under their thumb is
 *      exactly the thing they have seen a thousand times.
 */

function Row({
  item,
  expanded,
  onToggle,
  reduced,
  appeared,
}: {
  item: PaaItem;
  expanded: boolean;
  onToggle: () => void;
  reduced: boolean;
  /** True for rows that arrived by append — they fade in, once. */
  appeared: boolean;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const inner = innerRef.current;
    if (!wrap || !inner) return;

    if (reduced) {
      wrap.style.transition = "none";
      wrap.style.maxHeight = expanded ? "none" : "0px";
      return;
    }

    wrap.style.transition = `max-height ${PAA.expandMs}ms ease-out`;

    if (expanded) {
      wrap.style.maxHeight = `${inner.scrollHeight}px`;
      // Release the cap after the transition. From here the answer is
      // unbounded and cannot clip, whatever happens to it later.
      const t = window.setTimeout(() => {
        if (wrapRef.current) wrapRef.current.style.maxHeight = "none";
      }, PAA.expandMs);
      return () => window.clearTimeout(t);
    }

    // Collapsing from "none" needs a concrete start height and a reflow, or
    // the browser has nothing to animate from.
    wrap.style.maxHeight = `${inner.scrollHeight}px`;
    void wrap.offsetHeight;
    wrap.style.maxHeight = "0px";
  }, [expanded, reduced]);

  return (
    <div
      style={{
        borderTop: `1px solid ${PALETTE.border}`,
        animation: appeared && !reduced ? "srch-fade 320ms ease-out both" : "none",
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          width: "100%",
          minHeight: TAP_TARGET_PX,
          padding: "13px 16px",
          background: "transparent",
          border: "none",
          textAlign: "left",
          cursor: "pointer",
          fontFamily: UI,
          fontSize: 15.5,
          lineHeight: 1.4,
          color: PALETTE.ink,
        }}
      >
        <span style={{ flex: 1 }}>{item.question}</span>
        <ChevronDown
          size={18}
          strokeWidth={1.8}
          color={PALETTE.grey}
          aria-hidden
          style={{
            flex: "0 0 auto",
            transform: expanded ? "rotate(180deg)" : "none",
            transition: reduced ? "none" : `transform ${PAA.expandMs}ms ease-out`,
          }}
        />
      </button>

      <div ref={wrapRef} style={{ overflow: "hidden", maxHeight: 0 }}>
        <div ref={innerRef} style={{ padding: "0 16px 16px" }}>
          <Snippet text={item.answer} lines={0} size={14} />
          {item.source && (
            <p
              style={{
                fontFamily: UI,
                fontSize: 12.5,
                color: PALETTE.url,
                margin: "10px 0 0",
                overflowWrap: "anywhere",
              }}
            >
              {item.source}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PeopleAlsoAsk({
  paa,
  reserve,
  reduced,
}: {
  paa: PaaItem[];
  reserve: PaaItem[];
  reduced: boolean;
}) {
  const [items, setItems] = useState<PaaItem[]>(paa);
  const [appendedCount, setAppendedCount] = useState(0);
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const baseCount = paa.length;

  const toggle = useCallback(
    (question: string) => {
      const wasOpen = Boolean(open[question]);
      // Never collapses a sibling. Only this key moves.
      setOpen((prev) => ({ ...prev, [question]: !wasOpen }));
      if (wasOpen) return;
      // Opening — and only opening — grows the box.
      const { items: next, appended } = appendReserve(items, reserve, appendedCount);
      if (appended !== appendedCount) {
        setItems(next);
        setAppendedCount(appended);
      }
    },
    [open, items, reserve, appendedCount],
  );

  // Zero questions → no box at all. An empty bordered container is worse than
  // nothing; it reads as a bug.
  if (items.length === 0) return null;

  return (
    <section
      aria-label="People also ask"
      style={{
        border: `1px solid ${PALETTE.border}`,
        borderRadius: 8,
        margin: "26px 0 30px",
        overflow: "hidden",
        background: "#fff",
      }}
    >
      <h2
        style={{
          fontFamily: UI,
          fontSize: 19,
          fontWeight: 400,
          color: PALETTE.ink,
          margin: 0,
          padding: "14px 16px 12px",
        }}
      >
        People also ask
      </h2>
      {items.map((item, i) => (
        <Row
          key={item.question}
          item={item}
          expanded={Boolean(open[item.question])}
          onToggle={() => toggle(item.question)}
          reduced={reduced}
          appeared={i >= baseCount}
        />
      ))}
    </section>
  );
}
