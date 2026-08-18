"use client";

// ─── Customer questions ──────────────────────────────────────────────────────
//
// "N answered questions", a search box that searches nothing (it is furniture —
// a real block has one and its absence is noticeable), then a list: the
// question in bold after a bold "Question:", the answer after "Answer:", the
// byline at 12px, and a vote widget on a left rail.
//
// The vote is real, in the sense that it moves and remembers which way you went
// for as long as the page is open. It is not persisted, because there is
// nothing on the server that stores a vote on a joke about the AC temperature,
// and pretending otherwise would be the only dishonest control on the page.
//
// Past four entries the list collapses behind "See all N answered questions",
// exactly like the block it is imitating.

import { useCallback, useState } from "react";
import { C, CaretGlyph, FONT, LinkText, SearchGlyph, SECTION_IDS, WRAP } from "./tokens";
import type { QA } from "./types";

const VISIBLE = 4;

function VoteRail({ votes }: { votes: number }) {
  const [delta, setDelta] = useState<0 | 1 | -1>(0);

  const cast = useCallback(
    (dir: 1 | -1) => setDelta((prev) => (prev === dir ? 0 : dir)),
    []
  );

  const shown = Math.max(0, votes + delta);
  const btn = (up: boolean) => (
    <button
      type="button"
      onClick={() => cast(up ? 1 : -1)}
      aria-label={up ? "This was helpful" : "This was not helpful"}
      aria-pressed={delta === (up ? 1 : -1)}
      style={{
        width: 30,
        height: 26,
        display: "grid",
        placeItems: "center",
        border: "none",
        background: "transparent",
        cursor: "pointer",
        touchAction: "manipulation",
      }}
    >
      <CaretGlyph up={up} size={15} color={delta === (up ? 1 : -1) ? C.activeEdge : "#B4B9B9"} />
    </button>
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        flex: "none",
        width: 34,
        fontFamily: FONT,
      }}
    >
      {btn(true)}
      <span style={{ fontSize: 13, color: C.text, lineHeight: 1 }}>{shown}</span>
      {btn(false)}
    </div>
  );
}

function Entry({ item }: { item: QA }) {
  return (
    <li style={{ listStyle: "none", display: "flex", gap: 12, padding: "14px 0", borderTop: `1px solid ${C.border}` }}>
      <VoteRail votes={item.votes} />
      <div style={{ minWidth: 0, flex: "1 1 auto" }}>
        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.45, color: C.text, ...WRAP }}>
          <strong style={{ fontWeight: 700 }}>Question: </strong>
          <strong style={{ fontWeight: 700 }}>{item.question}</strong>
        </p>
        <p style={{ margin: "6px 0 0", fontSize: 14, lineHeight: 1.5, color: C.text, ...WRAP }}>
          <strong style={{ fontWeight: 700 }}>Answer: </strong>
          {item.answer}
        </p>
        <p style={{ margin: "6px 0 0", fontSize: 12, color: C.secondary, ...WRAP }}>
          By {item.by}
          {item.ago ? ` · ${item.ago}` : ""}
        </p>
      </div>
    </li>
  );
}

export default function QandA({ qa }: { qa: QA[] }) {
  const [expanded, setExpanded] = useState(false);
  if (qa.length === 0) return null;

  const shown = expanded ? qa : qa.slice(0, VISIBLE);

  return (
    <section
      id={SECTION_IDS.qa}
      style={{ borderTop: `1px solid ${C.border}`, padding: "20px 0", fontFamily: FONT }}
    >
      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: C.text }}>
        Customer questions &amp; answers
      </h2>

      <div className="lk-qa-head">
        <p style={{ margin: 0, fontSize: 14, color: C.text }}>
          {qa.length} answered question{qa.length === 1 ? "" : "s"}
        </p>
        <form
          role="search"
          aria-label="Search customer questions"
          onSubmit={(e) => e.preventDefault()}
          className="lk-qa-search"
        >
          <span style={{ display: "grid", placeItems: "center", paddingLeft: 9 }}>
            <SearchGlyph size={15} color={C.secondary} />
          </span>
          <input
            type="search"
            aria-label="Have a question? Search for answers"
            placeholder="Have a question? Search for answers"
          />
        </form>
      </div>

      <ul style={{ margin: "6px 0 0", padding: 0 }}>
        {shown.map((item, i) => (
          <Entry key={`${i}-${item.question.slice(0, 24)}`} item={item} />
        ))}
      </ul>

      {qa.length > VISIBLE && (
        <p style={{ margin: "12px 0 0" }}>
          <LinkText onClick={() => setExpanded((v) => !v)} size={13}>
            {expanded ? "See fewer questions" : `See all ${qa.length} answered questions`}
          </LinkText>
        </p>
      )}
    </section>
  );
}

export function QaStyles() {
  return (
    <style>{`
      .lk-qa-head {
        display: flex; align-items: center; gap: 14px; flex-wrap: wrap;
        margin: 12px 0 4px;
      }
      .lk-qa-search {
        display: flex; align-items: stretch; height: 34px; flex: 1 1 240px;
        min-width: 0; max-width: 420px;
        border: 1px solid ${C.border}; border-radius: 6px; background: #fff;
        box-shadow: 0 1px 2px rgba(15,17,17,0.06) inset;
      }
      .lk-qa-search input {
        flex: 1 1 auto; min-width: 0; border: 0; outline: none; background: transparent;
        font-family: ${FONT}; font-size: 13px; color: ${C.text}; padding: 0 9px;
      }
      .lk-qa-search input::placeholder { color: #8b9090; }
    `}</style>
  );
}
