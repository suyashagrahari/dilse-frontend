"use client";

// ─── The full-width sections: bundle, spec table, seller note ────────────────
//
// Three blocks that sit below the three-column grid and run the width of the
// page. They are in one file because they share nothing but the page they are
// on, and three twelve-line files would be worse than one.
//
// ── THE SELLER NOTE IS THE PAYLOAD ───────────────────────────────────────────
// Everything above it is spec-sheet comedy. `FromTheSeller` is where the page
// stops joking, and it is the only block on the whole listing set in a serif
// with real whitespace around it. That tonal break is the thing the recipient
// actually keeps, so it gets the room. Do not compress it to match the density
// of the rest of the page — the mismatch is deliberate.

import { C, FONT, Photo, SECTION_IDS, SERIF, WRAP } from "./tokens";
import type { BundleItem, ProductData, Spec } from "./types";

const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight"];
const numberWord = (n: number): string => NUMBER_WORDS[n] ?? String(n);

/** The checkbox glyph. Drawn, not a native control — this list is decorative. */
function CheckBox({ on }: { on: boolean }) {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true" focusable="false" style={{ flex: "none", marginTop: 2 }}>
      <rect
        x="0.9"
        y="0.9"
        width="14.2"
        height="14.2"
        rx="2.4"
        fill={on ? C.link : "#fff"}
        stroke={on ? C.link : C.border}
        strokeWidth="1.4"
      />
      {on && (
        <path d="M4 8.4 6.8 11 12 5.2" fill="none" stroke="#fff" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

/* ── Frequently bought together ────────────────────────────────────────────── */

interface Tile {
  name: string;
  price: string;
  imageUrl: string;
  note?: string;
  thisItem?: boolean;
}

export function FrequentlyBoughtTogether({
  data,
  onAddAll,
}: {
  data: ProductData;
  onAddAll: () => void;
}) {
  const tiles: Tile[] = [
    {
      name: data.title,
      // String. Never parsed, never summed. See the note in ./types.ts.
      price: data.price.amount,
      imageUrl: data.subject.photos[0] ?? "",
      thisItem: true,
    },
    ...data.bundle.map((b: BundleItem) => ({
      name: b.name,
      price: b.price,
      imageUrl: b.imageUrl,
      note: b.note,
    })),
  ];

  return (
    <section
      style={{
        borderTop: `1px solid ${C.border}`,
        padding: "20px 0",
        fontFamily: FONT,
        color: C.text,
      }}
    >
      <h2 style={{ margin: "0 0 14px", fontSize: 20, fontWeight: 700 }}>Frequently bought together</h2>

      <div className="lk-fbt">
        {/* The image strip: image + image + image = Total. */}
        <div className="lk-fbt-strip">
          {tiles.map((tile, i) => (
            <div key={`${tile.name}-${i}`} style={{ display: "contents" }}>
              {i > 0 && (
                <span aria-hidden="true" style={{ fontSize: 22, color: C.secondary, padding: "0 2px" }}>
                  +
                </span>
              )}
              <span className="lk-fbt-tile">
                <Photo src={tile.imageUrl} alt={tile.name} fit="cover" glyphSize={22} />
              </span>
            </div>
          ))}
          <span aria-hidden="true" style={{ fontSize: 22, color: C.secondary, padding: "0 2px" }}>
            =
          </span>
          <span className="lk-fbt-total">
            <span style={{ fontSize: 12, color: C.secondary }}>Total</span>
            <span style={{ fontSize: 19, color: C.text, ...WRAP }}>{data.price.amount}</span>
          </span>
        </div>

        {/* The list. */}
        <div style={{ minWidth: 0, display: "grid", gap: 10 }}>
          {tiles.map((tile, i) => (
            <div key={`row-${tile.name}-${i}`} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
              <CheckBox on />
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.4, ...WRAP }}>
                  {tile.thisItem ? <strong style={{ fontWeight: 700 }}>This item: </strong> : null}
                  {tile.name}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: 13, color: C.text }}>{tile.price}</p>
                {tile.note ? (
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: C.secondary, ...WRAP }}>{tile.note}</p>
                ) : null}
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={onAddAll}
            style={{
              justifySelf: "start",
              minHeight: 31,
              padding: "5px 16px",
              borderRadius: 100,
              border: "1px solid #E7B93C",
              background: C.ctaYellow,
              color: C.text,
              fontFamily: FONT,
              fontSize: 13,
              cursor: "pointer",
              touchAction: "manipulation",
            }}
          >
            Add all {numberWord(tiles.length)} to Cart
          </button>
        </div>
      </div>
    </section>
  );
}

/* ── Product information ───────────────────────────────────────────────────── */

/**
 * Every row from `data.specs`, alternating fill, label column at 30% / 700.
 *
 * `specs` may arrive from the AI fill as "Label: Value" strings; they are
 * turned into `{label, value}` upstream by `normalizeProductData`, splitting on
 * the FIRST colon only so a value may contain further colons.
 */
export function SpecTable({ specs }: { specs: Spec[] }) {
  if (specs.length === 0) return null;
  return (
    <section
      id={SECTION_IDS.specs}
      style={{ borderTop: `1px solid ${C.border}`, padding: "20px 0", fontFamily: FONT }}
    >
      <h2 style={{ margin: "0 0 14px", fontSize: 20, fontWeight: 700, color: C.text }}>
        Product information
      </h2>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          tableLayout: "fixed",
          border: `1px solid ${C.border}`,
        }}
      >
        <tbody>
          {specs.map((row, i) => (
            <tr key={`${row.label}-${i}`} style={{ background: i % 2 === 0 ? C.section : C.page }}>
              <th
                scope="row"
                style={{
                  width: "30%",
                  textAlign: "left",
                  verticalAlign: "top",
                  padding: "9px 12px",
                  border: `1px solid ${C.border}`,
                  fontSize: 14,
                  fontWeight: 700,
                  color: C.text,
                  ...WRAP,
                }}
              >
                {row.label}
              </th>
              <td
                style={{
                  padding: "9px 12px",
                  border: `1px solid ${C.border}`,
                  fontSize: 14,
                  color: C.text,
                  lineHeight: 1.45,
                  ...WRAP,
                }}
              >
                {row.value}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

/* ── From the seller ───────────────────────────────────────────────────────── */

export function FromTheSeller({ about }: { about: ProductData["aboutSection"] }) {
  const paragraphs = about.body.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  return (
    <section
      style={{
        background: C.section,
        borderTop: `1px solid ${C.border}`,
        borderBottom: `1px solid ${C.border}`,
        margin: "8px 0 0",
        padding: "44px 0 48px",
      }}
    >
      <div className="lk-shell">
        <h2
          style={{
            margin: "0 0 26px",
            fontFamily: SERIF,
            fontSize: 27,
            fontWeight: 400,
            lineHeight: 1.25,
            color: C.text,
            ...WRAP,
          }}
        >
          {about.heading}
        </h2>

        <div className="lk-seller">
          <div style={{ minWidth: 0 }}>
            <div style={{ aspectRatio: "16 / 9", width: "100%" }}>
              <Photo src={about.imageUrl} alt={about.heading} fit="cover" background="#EDEEEE" />
            </div>
          </div>

          <div style={{ minWidth: 0, display: "grid", gap: 18 }}>
            {(paragraphs.length > 0 ? paragraphs : [about.body]).map((p, i) => (
              <p
                key={`p${i}`}
                style={{
                  margin: 0,
                  fontFamily: SERIF,
                  fontSize: 17,
                  lineHeight: 1.75,
                  color: C.text,
                  ...WRAP,
                }}
              >
                {p}
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function SectionStyles() {
  return (
    <style>{`
      .lk-fbt { display: grid; gap: 18px; }
      .lk-fbt-strip {
        display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
      }
      .lk-fbt-tile {
        display: block; width: 78px; height: 78px; flex: none;
        border: 1px solid ${C.border}; background: #fff;
      }
      .lk-fbt-total {
        display: inline-flex; flex-direction: column; gap: 2px;
        padding-left: 4px; min-width: 0;
      }
      .lk-seller { display: grid; gap: 24px; }

      @media (min-width: 900px) {
        .lk-fbt { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 28px; align-items: start; }
        .lk-seller { grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr); gap: 40px; align-items: start; }
      }
    `}</style>
  );
}
