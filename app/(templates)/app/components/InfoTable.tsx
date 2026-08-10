// ─── Information — the label/value table at the foot of the listing ──────────
//
// Provider, size, category, languages, age rating, price. Dry on purpose: this
// block is the straight man, and it only works because everything above it has
// already established that none of these figures mean what they normally mean.
// "Size: 1 human" lands because it is set in the same quiet type as a real byte
// count, not because it is shouted.
//
// ── ROWS THAT LOOK LIKE LINKS ───────────────────────────────────────────────
//
// A row flagged `link` renders in the accent colour and fires a toast instead
// of navigating. It is a <button>, never an <a href="#">: a real anchor offers
// the browser's whole link menu — open in new tab, copy address, long-press
// preview — and every one of those routes ends somewhere that does not exist.
// A button promises a local reaction and delivers exactly that.
//
// ── SEPARATORS ──────────────────────────────────────────────────────────────
//
// Inset 16px from the left, flush to the right. This is the detail that makes a
// stack of rows read as one table rather than as a pile of unrelated lines, and
// it is why the rows are full-bleed with their own padding rather than sitting
// inside a padded parent — a border cannot be inset on one side, but a sibling
// div with a left margin can.

"use client";

import { toast } from "sonner";
import type { AppInfoRow } from "./types";
import { AP, SECTION_GAP } from "./theme";

/** 44px floor — this is pressed with a thumb. */
const TAP = 44;

export function InfoTable({ rows }: { rows: AppInfoRow[] }) {
  return (
    <section
      aria-labelledby="info-heading"
      style={{ fontFamily: AP.font, marginTop: SECTION_GAP }}
    >
      <h2
        id="info-heading"
        style={{
          margin: "0 16px",
          fontSize: 19,
          fontWeight: 700,
          lineHeight: 1.2,
          color: AP.ink,
          letterSpacing: "-0.01em",
        }}
      >
        Information
      </h2>

      <dl style={{ margin: "8px 0 0" }}>
        {rows.map((row, i) => (
          <div key={`${row.label}-${i}`}>
            {i > 0 && (
              <div
                aria-hidden="true"
                style={{ height: 1, marginLeft: 16, background: AP.edge }}
              />
            )}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                minHeight: TAP,
                padding: "8px 16px",
              }}
            >
              <dt
                style={{
                  fontSize: 15,
                  lineHeight: 1.33,
                  color: AP.inkSoft,
                  flex: "none",
                  overflowWrap: "anywhere",
                }}
              >
                {row.label}
              </dt>

              <dd
                style={{
                  margin: 0,
                  flex: "1 1 auto",
                  minWidth: 0,
                  textAlign: "right",
                  fontSize: 15,
                  lineHeight: 1.33,
                  color: AP.ink,
                  overflowWrap: "anywhere",
                }}
              >
                {row.link ? (
                  <button
                    type="button"
                    onClick={() =>
                      toast(row.value, {
                        description: `${row.label} — this listing is a keepsake, so there is nothing to open.`,
                      })
                    }
                    style={{
                      minHeight: TAP,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      maxWidth: "100%",
                      padding: 0,
                      border: "none",
                      background: "transparent",
                      color: AP.accent,
                      font: "inherit",
                      fontSize: 15,
                      textAlign: "right",
                      cursor: "pointer",
                      overflowWrap: "anywhere",
                      touchAction: "manipulation",
                      WebkitTapHighlightColor: "transparent",
                    }}
                  >
                    {row.value}
                  </button>
                ) : (
                  row.value
                )}
              </dd>
            </div>
          </div>
        ))}
      </dl>
    </section>
  );
}

export default InfoTable;
