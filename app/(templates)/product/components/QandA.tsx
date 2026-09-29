"use client";

// ─── Customer questions & answers ────────────────────────────────────────────
//
// The vote column on the left, "Question:" / "Answer:" in bold labels, the
// byline under the answer, and a search box that filters as you type. Votes
// are local — the arrow you press moves by one and stays pressed.

import { useMemo, useState } from "react";
import { C, FONT, SECTION_IDS, WRAP } from "./tokens";
import type { QA } from "./types";
import { IconSearch } from "./icons";

function Votes({ votes }: { votes: number }) {
  const [v, setV] = useState<0 | 1 | -1>(0);
  return (
    <div className="lk-qa-votes">
      <button type="button" aria-label="Vote up" className={v === 1 ? "on" : ""} onClick={() => setV(v === 1 ? 0 : 1)}>
        ▲
      </button>
      <span style={{ fontWeight: 700, fontSize: 14 }}>{(votes + v).toLocaleString("en-IN")}</span>
      <span style={{ fontSize: 11, color: C.secondary }}>votes</span>
      <button type="button" aria-label="Vote down" className={v === -1 ? "on" : ""} onClick={() => setV(v === -1 ? 0 : -1)}>
        ▼
      </button>
    </div>
  );
}

export default function QandA({ qa }: { qa: QA[] }) {
  const [q, setQ] = useState("");
  const [all, setAll] = useState(false);
  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    return t ? qa.filter((x) => `${x.question} ${x.answer}`.toLowerCase().includes(t)) : qa;
  }, [q, qa]);
  if (qa.length === 0) return null;
  const visible = all ? rows : rows.slice(0, 4);

  return (
    <section id={SECTION_IDS.qa} className="lk-sec" aria-labelledby="lk-qa-h">
      <h2 id="lk-qa-h" className="lk-h2">
        Customer questions &amp; answers
      </h2>
      <label className="lk-qa-search">
        <IconSearch size={17} color={C.secondary} />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Have a question? Search for answers" aria-label="Search questions" />
      </label>

      {rows.length === 0 ? (
        <p style={{ fontSize: 14, color: C.secondary, margin: "14px 0 0" }}>
          No answers for that yet. Ask her directly — response time is usually under a minute.
        </p>
      ) : (
        <ul style={{ listStyle: "none", margin: "10px 0 0", padding: 0 }}>
          {visible.map((x, i) => (
            <li key={`${x.question}-${i}`} className="lk-qa-row">
              <Votes votes={x.votes} />
              <div style={{ minWidth: 0, fontSize: 14, lineHeight: 1.5 }}>
                <p style={{ margin: 0, ...WRAP }}>
                  <strong style={{ display: "inline-block", width: 82 }}>Question:</strong>
                  <span className="lk-link" style={{ fontWeight: 700 }}>
                    {x.question}
                  </span>
                </p>
                <p style={{ margin: "6px 0 0", display: "flex", ...WRAP }}>
                  <strong style={{ flex: "0 0 82px" }}>Answer:</strong>
                  <span style={{ minWidth: 0 }}>
                    {x.answer}
                    <span style={{ display: "block", color: C.secondary, fontSize: 13, marginTop: 3 }}>
                      By {x.by}
                      {x.ago ? ` · ${x.ago}` : ""}
                    </span>
                  </span>
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
      {rows.length > 4 && !all ? (
        <button type="button" className="lk-cta lk-cta-ghost" style={{ maxWidth: 300, marginTop: 6 }} onClick={() => setAll(true)}>
          See more answered questions ({rows.length - 4})
        </button>
      ) : null}
    </section>
  );
}

export function QaStyles() {
  return (
    <style>{`
      .lk-qa-search { display: flex; align-items: center; gap: 8px; height: 40px; max-width: 560px; padding: 0 12px; border-radius: 8px; border: 1px solid #888C8C; box-shadow: 0 1px 2px rgba(15,17,17,.15) inset; background: #fff; }
      .lk-qa-search:focus-within { border-color: #007185; box-shadow: 0 0 0 3px #C8F3FA; }
      .lk-qa-search input { flex: 1; min-width: 0; border: 0; outline: none; font: 400 16px ${FONT}; color: ${C.text}; background: transparent; }
      .lk-qa-row { display: flex; gap: 14px; padding: 14px 0; border-bottom: 1px solid ${C.hairline}; }
      .lk-qa-votes { flex: 0 0 48px; display: flex; flex-direction: column; align-items: center; gap: 1px; font-family: ${FONT}; }
      .lk-qa-votes button { border: 0; background: none; color: #999; cursor: pointer; font-size: 13px; padding: 2px 6px; line-height: 1; transition: color .12s ease, transform .12s ease; }
      .lk-qa-votes button:hover { color: ${C.text}; }
      .lk-qa-votes button.on { color: ${C.activeEdge}; transform: scale(1.2); }
    `}</style>
  );
}
