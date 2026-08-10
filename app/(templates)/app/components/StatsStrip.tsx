// ─── StatsStrip — the signature element ──────────────────────────────────────
//
// Five cells on a horizontal scroller with hairline dividers between them, and
// the whole thing lives or dies on ONE property: the vertical rhythm.
//
// ── WHY EVERY CELL IS A THREE-ROW GRID WITH FIXED ROW HEIGHTS ────────────────
//
// The five cells hold wildly different things — a two-character age in a box, a
// glyph beside a word, a partial star row, a bare number. If each cell simply
// stacks its own content, the baselines drift: the age box is taller than the
// text beside it, the star row is shorter, and the caps labels end up on four
// different lines. That drift is instantly legible as "made up", because the
// real thing is a table.
//
// So the cell is a grid of three rows at FIXED heights (13 / 26 / 14) and the
// content is centred inside its row. The age box can be 22px tall and the star
// row 12px and the caps label 11px, and all three cells still line up to the
// pixel. Nothing here may be changed to `auto`.
//
// ── THE STAR WIDGET ──────────────────────────────────────────────────────────
//
// Reused from the shared contributor component, not rebuilt: it clips the fill
// to the exact fraction, so 4.9 draws as four stars and nine tenths of a fifth
// rather than five solid ones. Five solid stars over the number "4.9" is the
// single most common tell in a mocked-up listing.
//
// ── NO RATINGS ───────────────────────────────────────────────────────────────
//
// Zero published reviews prints "No Ratings Yet" and hides the star row
// entirely. It never prints "0.0" — a zero average is a claim about a person,
// an absent average is a fact about a page.

"use client";

import { Fragment } from "react";

import StarRating from "@/components/contrib/StarRating";
import { AP, AP_GUTTER } from "./theme";
import type { AppMeta, AppRating } from "./types";

/** Fixed row heights. The whole point of this file — see the note above. */
const ROW_LABEL = 13;
const ROW_VALUE = 26;
const ROW_SUB = 14;
const ROW_GAP = 3;

/**
 * "English, Hindi, Sarcasm" → { codes: "EN, HI", more: 1 }.
 *
 * Real listings show two codes and a count, never the full list — the full list
 * is what the info table further down the page is for.
 */
function languageCodes(languages: string): { codes: string; more: number } {
  const parts = languages
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length === 0) return { codes: "—", more: 0 };
  const codes = parts
    .slice(0, 2)
    .map((p) => p.slice(0, 2).toUpperCase())
    .join(", ");
  return { codes, more: Math.max(0, parts.length - 2) };
}

/** Generic line-art category glyph: an aperture ring. Belongs to no vendor. */
function CategoryGlyph() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <circle cx="8" cy="8" r="6.3" stroke={AP.inkSoft} strokeWidth="1.4" />
      <path
        d="M8 1.7v3.1M8 11.2v3.1M1.7 8h3.1M11.2 8h3.1"
        stroke={AP.inkSoft}
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * One cell of the table.
 *
 * `sub` is optional but its ROW is not — an omitted sub-label still reserves
 * its 14px, because a cell that is 14px shorter than its neighbours drags the
 * dividers out of alignment and undoes the whole grid.
 */
function Cell({
  label,
  value,
  sub,
  first,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  first?: boolean;
}) {
  return (
    <div
      style={{
        flex: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        gap: ROW_GAP,
        minWidth: 78,
        padding: `0 ${first ? 0 : 16}px 0 16px`,
      }}
    >
      <div
        style={{
          height: ROW_LABEL,
          display: "flex",
          alignItems: "center",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          color: AP.inkSoft,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </div>
      <div
        style={{
          height: ROW_VALUE,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: AP.inkSoft,
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </div>
      <div
        style={{
          height: ROW_SUB,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          lineHeight: "13px",
          color: AP.inkSoft,
          whiteSpace: "nowrap",
        }}
      >
        {sub ?? null}
      </div>
    </div>
  );
}

/** The 20/600 figure most cells put in their value row. */
function Figure({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        fontSize: 20,
        fontWeight: 600,
        letterSpacing: "-0.01em",
        lineHeight: 1,
        color: AP.inkSoft,
      }}
    >
      {children}
    </span>
  );
}

function Divider() {
  return (
    <span
      aria-hidden="true"
      style={{
        flex: "none",
        alignSelf: "center",
        width: 1,
        height: 44,
        background: AP.edge,
      }}
    />
  );
}

export function StatsStrip({ app, rating }: { app: AppMeta; rating: AppRating }) {
  const hasRatings = Number.isFinite(rating.average) && rating.average > 0;
  const { codes, more } = languageCodes(app.languages);

  const cells: React.ReactNode[] = [
    <Cell
      key="ratings"
      first
      label={hasRatings && rating.count.trim() ? `${rating.count} Ratings` : "Ratings"}
      value={
        hasRatings ? (
          <Figure>{rating.average.toFixed(1)}</Figure>
        ) : (
          <span style={{ fontSize: 15, fontWeight: 600, color: AP.inkSoft, lineHeight: 1 }}>
            No Ratings Yet
          </span>
        )
      }
      sub={
        hasRatings ? (
          <StarRating
            rating={rating.average}
            size={11}
            fillColor={AP.inkSoft}
            emptyColor={AP.edge}
            label={`${rating.average.toFixed(1)} out of 5 stars`}
          />
        ) : undefined
      }
    />,
    <Cell
      key="age"
      label="Age"
      value={
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            minWidth: 30,
            height: 24,
            padding: "0 5px",
            borderRadius: 6,
            border: `1.5px solid ${AP.inkSoft}`,
            fontSize: 15,
            fontWeight: 700,
            lineHeight: 1,
            color: AP.inkSoft,
          }}
        >
          {app.ageRating}
        </span>
      }
      sub="Years Old"
    />,
    <Cell
      key="category"
      label="Category"
      value={
        <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          <CategoryGlyph />
          <Figure>{app.category}</Figure>
        </span>
      }
    />,
    <Cell key="size" label="Size" value={<Figure>{app.size}</Figure>} />,
    <Cell
      key="language"
      label="Language"
      value={<Figure>{codes}</Figure>}
      sub={more > 0 ? `+ ${more} More` : undefined}
    />,
  ];

  return (
    <section
      aria-label="At a glance"
      className="[&::-webkit-scrollbar]:hidden"
      style={{
        display: "flex",
        alignItems: "stretch",
        overflowX: "auto",
        overflowY: "hidden",
        scrollbarWidth: "none",
        WebkitOverflowScrolling: "touch",
        paddingLeft: AP_GUTTER,
        fontFamily: AP.font,
      }}
    >
      {cells.map((cell, i) => (
        <Fragment key={i}>
          {i > 0 ? <Divider /> : null}
          {cell}
        </Fragment>
      ))}
      {/* Trailing gutter. A container `padding-right` is dropped by several
          browsers inside an overflowing flex row, so it is a real element. */}
      <span aria-hidden="true" style={{ flex: "none", width: AP_GUTTER }} />
    </section>
  );
}

export default StatsStrip;
