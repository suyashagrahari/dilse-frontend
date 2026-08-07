"use client";

// ─── Details column — title, rating row, price block, bullets ────────────────
//
// The middle column. Everything here is a straight reproduction of listing
// furniture, because the humour is entirely in the strings and the layout has
// to be so ordinary that the strings are the only thing you notice.
//
// ── TWO THINGS THAT ARE ACCEPTANCE CRITERIA ──────────────────────────────────
//
// 1. THE TITLE IS WEIGHT 400. Not 600, not bold. Real listing titles are set in
//    a large regular face, and a bold one instantly reads as a graphic somebody
//    made rather than a page that exists. 24px / 32px, regular.
//
// 2. NOTHING PARSES THE PRICE. `amount` is a string and the demo value is "∞".
//    The superscript is taken by SLICING a leading currency character off the
//    front, never by formatting a number, so "∞", "₹4,99,999" and "Priceless"
//    all render correctly and none of them can produce NaN.

import StarRating from "@/components/contrib/StarRating";
import { C, FONT, LinkText, WRAP, spokenAverage, type Aggregate } from "./tokens";
import type { ProductData } from "./types";

/** Leading currency character, if the string carries one. Never a parse. */
function splitCurrency(amount: string): { symbol: string; rest: string } {
  const first = amount.slice(0, 1);
  if (/[₹$€£¥]/.test(first)) return { symbol: first, rest: amount.slice(1).trim() };
  return { symbol: "₹", rest: amount };
}

export function RatingRow({
  aggregate,
  onJump,
  size = 17,
}: {
  aggregate: Aggregate;
  onJump: () => void;
  size?: number;
}) {
  if (aggregate.count === 0) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: FONT }}>
        <StarRating rating={0} size={size} label="Not yet rated" />
        <LinkText onClick={onJump} size={14}>
          No ratings yet. Be the first.
        </LinkText>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", fontFamily: FONT }}>
      <span style={{ fontSize: 14, color: C.text }}>{spokenAverage(aggregate.average)}</span>
      <StarRating
        rating={aggregate.average}
        size={size}
        label={`${spokenAverage(aggregate.average)} out of 5 stars`}
      />
      <LinkText onClick={onJump} size={14}>
        ({aggregate.count} {aggregate.count === 1 ? "rating" : "ratings"})
      </LinkText>
    </div>
  );
}

export default function Details({
  data,
  aggregate,
  onJumpToReviews,
}: {
  data: ProductData;
  aggregate: Aggregate;
  onJumpToReviews: () => void;
}) {
  const { symbol, rest } = splitCurrency(data.price.amount);
  const discount = data.price.discountPct ?? 0;

  return (
    <section style={{ fontFamily: FONT, color: C.text, minWidth: 0 }}>
      <LinkText onClick={onJumpToReviews} size={14}>
        {data.storeName}
      </LinkText>

      <h1
        style={{
          // Weight 400. See the note at the top of this file.
          fontWeight: 400,
          fontSize: 24,
          lineHeight: "32px",
          margin: "4px 0 6px",
          color: C.text,
          ...WRAP,
        }}
      >
        {data.title}
      </h1>

      <RatingRow aggregate={aggregate} onJump={onJumpToReviews} />

      <hr style={{ border: 0, borderTop: `1px solid ${C.border}`, margin: "12px 0" }} />

      {/* ── Price ──────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
        {discount > 0 && (
          <span style={{ fontSize: 26, color: C.priceRed, lineHeight: 1, fontWeight: 400 }}>
            -{discount}%
          </span>
        )}
        <span style={{ display: "inline-flex", alignItems: "flex-start", color: C.text }}>
          <span style={{ fontSize: 13, lineHeight: "18px", marginTop: 2 }}>{symbol}</span>
          <span style={{ fontSize: 30, lineHeight: "32px", letterSpacing: "-0.01em", ...WRAP }}>
            {rest}
          </span>
        </span>
      </div>

      {data.price.original ? (
        <p style={{ margin: "4px 0 0", fontSize: 13, color: C.secondary }}>
          M.R.P.: <span style={{ textDecoration: "line-through" }}>{data.price.original}</span>
        </p>
      ) : null}

      <p style={{ margin: "4px 0 0", fontSize: 12, color: C.secondary }}>Inclusive of all emotions</p>
      <p style={{ margin: "3px 0 0" }}>
        <LinkText onClick={onJumpToReviews} size={13}>
          EMI options available
        </LinkText>
      </p>

      {/* The house badge. Navy pill, orange accent — our own, not anyone else's. */}
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          marginTop: 12,
          padding: "3px 10px 4px",
          borderRadius: 3,
          background: C.subHeader,
          color: "#FFFFFF",
          fontSize: 12.5,
          fontWeight: 700,
          letterSpacing: "0.01em",
        }}
      >
        <span style={{ color: C.ctaOrange }}>us.in</span>
        <span style={{ fontWeight: 400 }}>Choice</span>
      </span>

      <hr style={{ border: 0, borderTop: `1px solid ${C.border}`, margin: "14px 0 12px" }} />

      {/* ── About this item ────────────────────────────────────────────── */}
      <h2 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 8px", color: C.text }}>
        About this item
      </h2>
      <ul style={{ margin: 0, paddingLeft: 20, listStyle: "disc", display: "grid", gap: 4 }}>
        {data.bullets.map((b, i) => (
          <li key={`${i}-${b.slice(0, 24)}`} style={{ fontSize: 14, lineHeight: 1.45, color: C.text, ...WRAP }}>
            {b}
          </li>
        ))}
      </ul>

      <p style={{ margin: "14px 0 0" }}>
        <LinkText onClick={onJumpToReviews} size={13}>
          Report an issue with this person
        </LinkText>
      </p>
    </section>
  );
}
