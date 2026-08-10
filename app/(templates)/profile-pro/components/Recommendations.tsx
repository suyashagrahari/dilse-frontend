"use client";

// ─── Recommendations — lane two, rendered ────────────────────────────────────
//
// Endorsing is one tap. Recommending is a paragraph, and this is where the
// paragraphs live. The two lanes never touch: nothing in this file adds a step
// to the tap, and nothing in the tap flow borrows a field from here.
//
// ── FOUR LINES, THEN "…SEE MORE" ─────────────────────────────────────────────
//
// A 600-character recommendation printed in full turns the section into a wall
// and the third one never gets read. Four lines is enough to see whether it is
// funny, which is the only thing anyone is scanning for.
//
// The collapse is HEIGHT-ANIMATED FROM A MEASURED `scrollHeight`, not a fixed
// `max-height`. A max-height big enough for the longest possible entry makes
// every short one animate at a different apparent speed — a two-line note takes
// the same 200ms to travel a distance it does not need — and the ease curve
// lands on a different part of itself each time. Measuring means every card
// opens at the same rate. It also means the transition ends exactly at the
// content, so there is no dead gap under a short one.
//
// ── "GIVEN" IS A JOKE, NOT A FEATURE ─────────────────────────────────────────
//
// The tab exists so the empty state can exist. Do not wire it to real data.
//
// ── UNBREAKABLE ──────────────────────────────────────────────────────────────
//
// Somebody will paste 600 characters with no spaces in them, because somebody
// always does. `overflow-wrap: anywhere` on every text node in the card is what
// stops that from pushing the whole column sideways on a 380px phone.

import { useCallback, useEffect, useRef, useState } from "react";

import { ACCENT_TINT, Card, PP } from "./theme";
import { Avatar } from "./Avatar";
import type { Recommendation, RecommendationTab } from "./types";

/** The one muted grey in this section. Spec'd flat, not derived from a token. */
const MUTED = "#666";

/** 14px text on a 20px line, clipped at four of them. */
const LINE_HEIGHT = 20;
const COLLAPSED_LINES = 4;
const COLLAPSED_HEIGHT = LINE_HEIGHT * COLLAPSED_LINES;

/** Every tap target on this page. */
const TAP = 44;

/** Wrapping that survives a 600-character word. */
const WRAP = { overflowWrap: "anywhere" as const, wordBreak: "break-word" as const };

function firstNameOf(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "She";
  return trimmed.split(/\s+/)[0] ?? trimmed;
}

/* ── The collapsing body ───────────────────────────────────────────────────── */

/**
 * Four lines, then a disclosure.
 *
 * The measured element is the inner `<p>`, whose height we never set; the
 * clipping happens on the wrapper above it. That separation is what keeps the
 * `ResizeObserver` from feeding its own output back in — the observer only ever
 * sees the paragraph reflow because the column got narrower, which is exactly
 * when the four-line cut-off needs recomputing.
 */
function RecommendationBody({ text }: { text: string }): React.JSX.Element {
  const measured = useRef<HTMLParagraphElement | null>(null);
  const [fullHeight, setFullHeight] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const el = measured.current;
    if (!el) return;

    const read = () => setFullHeight(el.scrollHeight);
    read();

    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text]);

  // A one-pixel tolerance: sub-pixel line boxes make an exactly-four-line
  // paragraph report 80.5 and offer a "see more" that reveals nothing.
  const overflows = fullHeight > COLLAPSED_HEIGHT + 1;

  const height = !overflows ? undefined : open ? fullHeight : COLLAPSED_HEIGHT;

  return (
    <>
      <div
        className="pp-rec-clip"
        style={{
          overflow: "hidden",
          height,
          // Only the collapsible ones animate. A short note has nothing to
          // travel and a transition on `auto` does not run anyway.
          transition: overflows ? "height 200ms ease" : undefined,
        }}
      >
        <p
          ref={measured}
          style={{
            margin: 0,
            fontSize: 14,
            lineHeight: `${LINE_HEIGHT}px`,
            color: PP.ink,
            ...WRAP,
          }}
        >
          {text}
        </p>
      </div>

      {overflows ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          style={{
            alignSelf: "flex-start",
            minHeight: TAP,
            padding: 0,
            border: "none",
            background: "transparent",
            color: PP.accent,
            fontFamily: PP.font,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            touchAction: "manipulation",
          }}
        >
          {open ? "see less" : "…see more"}
        </button>
      ) : null}
    </>
  );
}

/* ── One recommendation ────────────────────────────────────────────────────── */

function RecommendationItem({ item }: { item: Recommendation }): React.JSX.Element {
  return (
    <li
      style={{
        listStyle: "none",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        padding: "16px 0 0",
        borderTop: `1px solid ${PP.edge}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
        <Avatar name={item.author} size={48} />

        <div style={{ minWidth: 0, flex: 1 }}>
          {/* Wraps rather than truncates: this is the one place a long name is
              allowed the space, because the card is the person's own words. */}
          <p style={{ margin: 0, fontSize: 16, fontWeight: 600, color: PP.ink, ...WRAP }}>
            {item.author}
          </p>
          {item.authorHeadline ? (
            <p style={{ margin: "2px 0 0", fontSize: 14, color: MUTED, ...WRAP }}>
              {item.authorHeadline}
            </p>
          ) : null}
          <p
            style={{
              margin: "4px 0 0",
              fontSize: 12,
              fontStyle: "italic",
              color: MUTED,
              ...WRAP,
            }}
          >
            {item.relationship}
            {item.ago ? ` · ${item.ago}` : ""}
          </p>
        </div>
      </div>

      <RecommendationBody text={item.text} />
    </li>
  );
}

/* ── The asks ──────────────────────────────────────────────────────────────── */

/**
 * The two accent links under the list.
 *
 * They open a one-line explainer rather than navigating, because the thing they
 * would navigate to is a link the sender hands out in a group chat — there is
 * no route the profile itself can send you to that would not be a dead end for
 * whichever of the two of you is reading it.
 */
function AskLinks({ personName }: { personName: string }): React.JSX.Element {
  const [hint, setHint] = useState<"ask" | "give" | null>(null);
  const first = firstNameOf(personName);

  const toggle = useCallback(
    (which: "ask" | "give") => setHint((prev) => (prev === which ? null : which)),
    []
  );

  const linkStyle: React.CSSProperties = {
    minHeight: TAP,
    padding: "0 2px",
    border: "none",
    background: "transparent",
    color: PP.accent,
    fontFamily: PP.font,
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    textAlign: "left",
    touchAction: "manipulation",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
        <button
          type="button"
          style={linkStyle}
          aria-expanded={hint === "ask"}
          onClick={() => toggle("ask")}
        >
          Ask for a recommendation
        </button>
        <button
          type="button"
          style={linkStyle}
          aria-expanded={hint === "give"}
          onClick={() => toggle("give")}
        >
          Give a recommendation
        </button>
      </div>

      {hint ? (
        <p
          style={{
            margin: 0,
            padding: "10px 12px",
            borderRadius: 6,
            background: ACCENT_TINT,
            fontSize: 13,
            lineHeight: "19px",
            color: PP.ink,
            ...WRAP,
          }}
        >
          {hint === "ask"
            ? `Send the link around. Whatever comes back waits for you to read it before it appears here.`
            : `Open the link ${first} was sent — that is where the writing happens. Nothing goes up until it is approved.`}
        </p>
      ) : null}
    </div>
  );
}

/* ── Tabs ──────────────────────────────────────────────────────────────────── */

function Tab({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}): React.JSX.Element {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      style={{
        minHeight: TAP,
        padding: "0 2px",
        border: "none",
        borderBottom: `2px solid ${active ? PP.accent : "transparent"}`,
        background: "transparent",
        color: active ? PP.accent : MUTED,
        fontFamily: PP.font,
        fontSize: 14,
        fontWeight: 600,
        cursor: "pointer",
        touchAction: "manipulation",
      }}
    >
      {label}
    </button>
  );
}

/* ── The section ───────────────────────────────────────────────────────────── */

export function Recommendations(props: {
  /** Published only — the parent filters. Nothing pending ever reaches here. */
  items: Recommendation[];
  tab: RecommendationTab;
  onTab: (t: RecommendationTab) => void;
  personName: string;
}): React.JSX.Element {
  const { items, tab, onTab, personName } = props;
  const first = firstNameOf(personName);

  return (
    <Card>
      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, color: PP.ink }}>Recommendations</h2>

      <div
        role="tablist"
        aria-label="Recommendations"
        style={{
          display: "flex",
          gap: 20,
          marginTop: 4,
          borderBottom: `1px solid ${PP.edge}`,
        }}
      >
        <Tab label="Received" active={tab === "received"} onClick={() => onTab("received")} />
        <Tab label="Given" active={tab === "given"} onClick={() => onTab("given")} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 16 }}>
        {tab === "given" ? (
          <p style={{ margin: 0, fontSize: 14, lineHeight: "20px", color: MUTED, ...WRAP }}>
            {`${first} has not given any recommendations. She is very selective.`}
          </p>
        ) : items.length === 0 ? (
          <p style={{ margin: 0, fontSize: 14, lineHeight: "20px", color: MUTED, ...WRAP }}>
            {`Nobody has written one for ${first} yet. The first one is always the hardest.`}
          </p>
        ) : (
          <ul style={{ display: "flex", flexDirection: "column", gap: 16, margin: 0, padding: 0 }}>
            {items.map((item) => (
              <RecommendationItem key={item.id} item={item} />
            ))}
          </ul>
        )}

        {/* Kept on both tabs and on the empty state — the ask is the point. */}
        <AskLinks personName={personName} />
      </div>

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .pp-rec-clip { transition: none !important; }
        }
      `}</style>
    </Card>
  );
}

export default Recommendations;
