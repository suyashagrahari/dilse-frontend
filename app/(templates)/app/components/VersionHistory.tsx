// ─── Version History — the comedic centrepiece ───────────────────────────────
//
// This is the thing people scroll to and screenshot, so it is built as a real
// expanding view rather than a footnote or a separate page. Tapping "Version
// History" in the What's New block flips `open`, and this panel grows from 0 to
// its measured `scrollHeight` in place, directly beneath the block that opened
// it. Nothing navigates. Nothing is a modal.
//
// ── WHY MEASURED HEIGHT AND NOT max-height ──────────────────────────────────
//
// `max-height: 9999px` is the cheap version of this animation and it is wrong
// twice over: the easing curve is applied to a number nobody can see (the
// distance from the real height to the fake ceiling), so short panels snap and
// long ones crawl; and the panel's own transition duration silently becomes a
// function of its content length. Measuring once and animating to a real pixel
// value gives every panel the same 280ms regardless of how many versions the
// sender wrote. After the transition settles we hand the height back to `auto`
// so the panel keeps tracking its content if anything below it reflows.
//
// ── WHAT MUST NOT HAPPEN TO THE DATA ────────────────────────────────────────
//
// Never reorder. Never truncate. Never collapse "the boring old ones" behind a
// second level of disclosure. The array arrives newest-first and the OLDEST
// entry — v1.0 — carries the shortest, driest note in the whole template. The
// joke is the distance between that line and the unhinged ones above it, and
// that distance only exists if the reader can see both ends of it at once. A
// renderer that shows the five most recent versions deletes the punchline and
// leaves the setup.
//
// A single-version history still renders the full panel. The link is never
// hidden — a sender who has written one entry has written the first line of a
// running joke, and hiding the affordance tells them there is nowhere to put
// the second.

"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import type { AppVersion } from "./types";
import { AP } from "./theme";

/**
 * Shared between the trigger (in `WhatsNew`) and this panel so the button's
 * `aria-controls` actually points at something. Exported rather than duplicated
 * because two string literals that must match are one typo away from silently
 * breaking assistive tech, which nobody testing by eye would ever notice.
 */
export const VERSION_HISTORY_PANEL_ID = "version-history-panel";

/** Matches the CSS transition below. Kept in one place so they cannot drift. */
const EXPAND_MS = 280;

/** Per-entry fade delay. Five entries stagger over a quarter second, not two. */
const STAGGER_MS = 50;

const EASE = "cubic-bezier(0.32, 0.72, 0, 1)";

/** 44px floor — this is pressed with a thumb. */
const TAP = 44;

/**
 * One changelog entry.
 *
 * Kept a plain function rather than a memoised component: the list is a dozen
 * items at most and every one of them re-renders anyway when `open` flips,
 * because the fade is driven off that same boolean.
 */
function VersionEntry({
  entry,
  index,
  open,
  reduced,
  first,
}: {
  entry: AppVersion;
  index: number;
  open: boolean;
  reduced: boolean;
  first: boolean;
}) {
  // On the way in the entries cascade; on the way out they all leave together.
  // A staggered exit reads as the panel struggling to close rather than as
  // deliberate motion, and it delays the collapse by the length of the list.
  const delay = reduced || !open ? 0 : index * STAGGER_MS;

  return (
    <li style={{ listStyle: "none" }}>
      {/*
        The separator is a sibling of the row rather than a border on it, so it
        can be inset 16px from the left while still running flush to the right
        edge. A border with a left inset is not expressible; a div with a left
        margin is.
      */}
      {!first && (
        <div
          aria-hidden="true"
          style={{ height: 1, marginLeft: 16, background: AP.edge }}
        />
      )}

      <div
        style={{
          padding: "14px 16px",
          opacity: open || reduced ? 1 : 0,
          transform: open || reduced ? "translateY(0)" : "translateY(6px)",
          transition: reduced
            ? "none"
            : `opacity 260ms ease ${delay}ms, transform 260ms ${EASE} ${delay}ms`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <span
            style={{
              fontSize: 17,
              fontWeight: 600,
              color: AP.ink,
              lineHeight: 1.3,
              overflowWrap: "anywhere",
            }}
          >
            {entry.version}
          </span>
          <span
            style={{
              fontSize: 13,
              color: AP.inkSoft,
              lineHeight: 1.3,
              textAlign: "right",
              flex: "none",
            }}
          >
            {entry.date}
          </span>
        </div>

        <div style={{ fontSize: 13, color: AP.inkSoft, marginTop: 2 }}>
          {entry.size}
        </div>

        {entry.notes.length > 0 && (
          <ul style={{ margin: "8px 0 0", padding: 0 }}>
            {entry.notes.map((note, i) => (
              <li
                key={i}
                style={{
                  listStyle: "none",
                  display: "flex",
                  gap: 8,
                  fontSize: 15,
                  lineHeight: 1.47,
                  color: AP.ink,
                  marginTop: i === 0 ? 0 : 6,
                  overflowWrap: "anywhere",
                }}
              >
                <span aria-hidden="true" style={{ color: AP.inkSoft, flex: "none" }}>
                  •
                </span>
                <span>{note}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}

export function VersionHistory({
  versions,
  open,
  onClose,
}: {
  versions: AppVersion[];
  open: boolean;
  onClose: () => void;
}) {
  const reduced = useReducedMotion() ?? false;

  const innerRef = useRef<HTMLDivElement | null>(null);

  /**
   * `0` closed, a pixel number mid-transition, `"auto"` once open and settled.
   *
   * Three states rather than two because the endpoint of an opening animation
   * and the resting state of an open panel are genuinely different things: the
   * first has to be a number for the transition to interpolate, the second has
   * to be `auto` for the panel to keep fitting its content.
   */
  const [height, setHeight] = useState<number | "auto">(0);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;

    if (reduced) {
      setHeight(open ? "auto" : 0);
      return;
    }

    if (open) {
      setHeight(el.scrollHeight);
      const t = window.setTimeout(() => setHeight("auto"), EXPAND_MS);
      return () => window.clearTimeout(t);
    }

    // Closing from `auto`: pin the current height first, let the browser paint
    // that frame, then drop to 0. Without the intermediate paint there is no
    // "from" value for the transition and the panel simply vanishes.
    setHeight(el.scrollHeight);
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setHeight(0));
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [open, reduced]);

  return (
    <section
      id={VERSION_HISTORY_PANEL_ID}
      aria-label="Version history"
      aria-hidden={!open}
      // Removes the collapsed panel from the tab order and the accessibility
      // tree. `height: 0` with `overflow: hidden` hides it from eyes only —
      // every link inside stays focusable, so a keyboard user tabbing past a
      // closed panel disappears into content they cannot see.
      inert={!open}
      style={{
        fontFamily: AP.font,
        height: height === "auto" ? "auto" : height,
        overflow: "hidden",
        transition: reduced ? "none" : `height ${EXPAND_MS}ms ${EASE}`,
      }}
    >
      <div ref={innerRef} style={{ paddingTop: 4 }}>
        {versions.length === 0 ? (
          <p
            style={{
              margin: 0,
              padding: "14px 16px",
              fontSize: 15,
              color: AP.inkSoft,
            }}
          >
            No version history yet.
          </p>
        ) : (
          <ul style={{ margin: 0, padding: 0 }}>
            {versions.map((entry, i) => (
              <VersionEntry
                key={`${entry.version}-${i}`}
                entry={entry}
                index={i}
                open={open}
                reduced={reduced}
                first={i === 0}
              />
            ))}
          </ul>
        )}

        <div style={{ paddingLeft: 12 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              minHeight: TAP,
              display: "inline-flex",
              alignItems: "center",
              padding: "0 4px",
              border: "none",
              background: "transparent",
              color: AP.accent,
              font: "inherit",
              fontSize: 15,
              cursor: "pointer",
              touchAction: "manipulation",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            Show Less
          </button>
        </div>
      </div>
    </section>
  );
}

export default VersionHistory;
