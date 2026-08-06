"use client";

// ─── The Ashtakoota table ────────────────────────────────────────────────────
//
// The centrepiece. Eight rows in KOOTA_ORDER, each carrying the two attributes,
// the maximum, the obtained score and a verdict — then, spanning the full
// width beneath it, the reading. All of it comes straight off the KootaResult
// objects; nothing is recomputed here, and the maxima are read from the row
// (which the engine sourced from KOOTA_MAX) rather than typed in again.

import { Fragment } from "react";
import { KOOTA_TOTAL, type KundliReport } from "./types";
import { INK, MAROON, MONO, SERIF, DEVA, WARM_INK } from "./ui";

/** Sums to 384 — the content width inside the document's border band. */
const COLS = "76px 66px 66px 28px 38px 110px";

const cellBase: React.CSSProperties = {
  padding: "3px 4px",
  borderRight: `1px solid ${INK}`,
  boxSizing: "border-box",
  overflowWrap: "anywhere",
};

const headCell: React.CSSProperties = {
  ...cellBase,
  fontFamily: SERIF,
  fontSize: 6.6,
  fontWeight: 700,
  letterSpacing: 0.7,
  textTransform: "uppercase",
  borderBottom: `1px solid ${INK}`,
  background: "rgba(20,17,13,.045)",
};

export default function AshtakootaTable({
  report,
  onYoniTap,
}: {
  report: KundliReport;
  onYoniTap?: () => void;
}) {
  return (
    <div style={{ border: `1px solid ${INK}` }}>
      <div style={{ display: "grid", gridTemplateColumns: COLS }}>
        <div style={headCell}>Koota</div>
        <div style={headCell}>Vara</div>
        <div style={headCell}>Vadhu</div>
        <div style={{ ...headCell, textAlign: "center" }}>Max</div>
        <div style={{ ...headCell, textAlign: "center" }}>Obtained</div>
        <div style={{ ...headCell, borderRight: "none" }}>Remarks</div>

        {report.kootas.map((k) => {
          const isYoni = k.name === "yoni";
          const tap = isYoni && onYoniTap ? onYoniTap : undefined;
          // The yoni row is the one people screenshot, so it is also the one
          // that is tappable. Extra padding keeps the combined row + reading
          // hit area at ~44px once the document is scaled down on a phone.
          const pad = isYoni ? "9px 4px" : "3px 4px";
          const rowCell: React.CSSProperties = {
            ...cellBase,
            padding: pad,
            cursor: tap ? "pointer" : undefined,
          };
          return (
            <Fragment key={k.name}>
              <div style={rowCell} onClick={tap}>
                <div style={{ fontFamily: SERIF, fontSize: 8.5, lineHeight: 1.15 }}>{k.labelEn}</div>
                <div style={{ fontFamily: DEVA, fontSize: 8, lineHeight: 1.3, opacity: 0.8 }}>{k.labelHi}</div>
              </div>
              <div style={{ ...rowCell, fontFamily: MONO, fontSize: 7.2, lineHeight: 1.3 }} onClick={tap}>
                {k.groomAttr}
              </div>
              <div style={{ ...rowCell, fontFamily: MONO, fontSize: 7.2, lineHeight: 1.3 }} onClick={tap}>
                {k.brideAttr}
              </div>
              <div
                style={{ ...rowCell, fontFamily: MONO, fontSize: 8, textAlign: "center" }}
                onClick={tap}
              >
                {k.max}
              </div>
              <div
                style={{ ...rowCell, fontFamily: MONO, fontSize: 9, fontWeight: 700, textAlign: "center" }}
                onClick={tap}
              >
                {k.obtained}
              </div>
              <div
                style={{ ...rowCell, borderRight: "none", fontFamily: MONO, fontSize: 7.2 }}
                onClick={tap}
              >
                {k.verdict}
              </div>

              {/* Where all the personality is. Indented, italic, warmer ink. */}
              <div
                onClick={tap}
                style={{
                  gridColumn: "1 / -1",
                  padding: isYoni ? "3px 8px 8px 20px" : "2px 8px 4px 20px",
                  borderTop: `1px dotted rgba(20,17,13,.42)`,
                  borderBottom: `1px solid ${INK}`,
                  fontFamily: SERIF,
                  fontStyle: "italic",
                  fontSize: 7.6,
                  lineHeight: 1.35,
                  color: WARM_INK,
                  cursor: tap ? "pointer" : undefined,
                }}
              >
                {k.reading}
              </div>
            </Fragment>
          );
        })}

        {/* Footer. 36 comes from KOOTA_TOTAL, never from a typed-in copy. */}
        <div
          style={{
            gridColumn: "1 / 4",
            padding: "6px 4px",
            borderRight: `1px solid ${INK}`,
            fontFamily: SERIF,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: 1.4,
            background: "rgba(122,32,32,.05)",
          }}
        >
          TOTAL
        </div>
        <div
          style={{
            padding: "6px 4px",
            borderRight: `1px solid ${INK}`,
            fontFamily: MONO,
            fontSize: 9,
            textAlign: "center",
            background: "rgba(122,32,32,.05)",
          }}
        >
          {KOOTA_TOTAL}
        </div>
        <div
          style={{
            padding: "6px 4px",
            borderRight: `1px solid ${INK}`,
            fontFamily: MONO,
            fontSize: 13,
            fontWeight: 700,
            textAlign: "center",
            color: MAROON,
            background: "rgba(122,32,32,.05)",
          }}
        >
          {report.total}
        </div>
        <div
          style={{
            padding: "6px 4px",
            fontFamily: MONO,
            fontSize: 7.6,
            background: "rgba(122,32,32,.05)",
            color: MAROON,
          }}
        >
          {report.grade}
        </div>
      </div>
    </div>
  );
}
