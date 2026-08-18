"use client";

// ─── Buy box — the right rail, and the two jokes that are buttons ────────────
//
// 1px border, 8px radius, 14px padding, and every row a real one has: price,
// delivery promise with the date in bold black, the location line, the stock
// line, a quantity dropdown, two stacked CTAs, the secure-transaction line, the
// ships-from / sold-by / returns table, and a wish list button.
//
// ── THE JOKE IS IN THE COLOUR ────────────────────────────────────────────────
// `stockLine` is green — the reassuring green every listing uses — UNLESS it
// says there is one left, and then it is red. That inversion is the whole gag
// and it only lands because everything around it is played completely straight.
//
// ── NOTHING PARSES MONEY ─────────────────────────────────────────────────────
// `amount` is rendered by slicing a leading currency character off a string.
// See the note at the top of ./types.ts.

import { C, ChevronDown, FONT, LinkText, LockGlyph, PinGlyph, WRAP } from "./tokens";
import type { ProductData } from "./types";

/**
 * The bits of a delivery promise that get set in bold black.
 *
 * Weekdays, "Tomorrow", and bare day-plus-month, with the trailing time if the
 * line carries one. Everything else stays secondary — the whole point of the
 * row is that your eye lands on the date and nothing else.
 */
const DATE_RE =
  /((?:Today|Tonight|Tomorrow|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)(?:,\s*\d{1,2}\s+[A-Za-z]+)?(?:,?\s*\d{1,2}(?::\d{2})?\s*(?:AM|PM))?|\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December))/g;

function DeliveryLine({ line }: { line: string }) {
  const parts = line.split(DATE_RE);
  return (
    <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, color: C.secondary, ...WRAP }}>
      {parts.map((part, i) =>
        // `String.split` with a capturing group puts the matches at odd indices.
        i % 2 === 1 ? (
          <strong key={`d${i}`} style={{ color: C.text, fontWeight: 700 }}>
            {part}
          </strong>
        ) : (
          <span key={`t${i}`}>{part}</span>
        )
      )}
    </p>
  );
}

/** Red when there is exactly one of her. Green the rest of the time. */
const SCARCE = /only\s*(1|one)\b|1\s*left|last\s+one/i;

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: 10, fontSize: 12, lineHeight: 1.5 }}>
      <span style={{ flex: "0 0 78px", color: C.secondary }}>{label}</span>
      <span style={{ flex: "1 1 auto", color: C.text, ...WRAP }}>{value}</span>
    </div>
  );
}

export default function BuyBox({
  data,
  onAddToCart,
  onBuyNow,
  onWishList,
}: {
  data: ProductData;
  onAddToCart: () => void;
  onBuyNow: () => void;
  onWishList: () => void;
}) {
  const amount = data.price.amount;
  const symbol = /^[₹$€£¥]/.test(amount.slice(0, 1)) ? amount.slice(0, 1) : "₹";
  const rest = /^[₹$€£¥]/.test(amount.slice(0, 1)) ? amount.slice(1).trim() : amount;
  const scarce = SCARCE.test(data.stockLine);

  const cta: React.CSSProperties = {
    width: "100%",
    minHeight: 29,
    borderRadius: 100,
    fontSize: 13,
    fontFamily: FONT,
    color: C.text,
    cursor: "pointer",
    padding: "5px 12px",
    lineHeight: 1.4,
    touchAction: "manipulation",
  };

  return (
    <aside
      aria-label="Buy box"
      style={{
        border: `1px solid ${C.border}`,
        borderRadius: 8,
        padding: 14,
        fontFamily: FONT,
        color: C.text,
        background: "#fff",
        minWidth: 0,
      }}
    >
      <div style={{ display: "inline-flex", alignItems: "flex-start", marginBottom: 8 }}>
        <span style={{ fontSize: 13, lineHeight: "18px", marginTop: 2 }}>{symbol}</span>
        <span style={{ fontSize: 28, lineHeight: "30px", ...WRAP }}>{rest}</span>
      </div>

      <DeliveryLine line={data.deliveryLine} />

      <p style={{ margin: "6px 0 0", fontSize: 13 }}>
        <span style={{ color: C.text }}>Or fastest delivery: </span>
        <LinkText onClick={onBuyNow} size={13}>
          call her now
        </LinkText>
      </p>

      <p
        style={{
          margin: "8px 0 0",
          display: "flex",
          alignItems: "center",
          gap: 5,
          fontSize: 13,
          color: C.link,
        }}
      >
        <PinGlyph size={13} color={C.link} />
        Bengaluru 560001
      </p>

      <p
        style={{
          margin: "10px 0 0",
          fontSize: 17,
          fontWeight: 400,
          color: scarce ? C.priceRed : C.green,
          ...WRAP,
        }}
      >
        {data.stockLine}
      </p>

      {/* Quantity. There is one of her, so the menu has one option. */}
      <label style={{ display: "block", marginTop: 10 }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 13, color: C.text }}>Quantity:</span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              background: C.section,
              padding: "3px 8px",
              boxShadow: "0 1px 2px rgba(15,17,17,0.08) inset",
            }}
          >
            <select
              aria-label="Quantity"
              defaultValue="1"
              style={{
                border: 0,
                background: "transparent",
                fontFamily: FONT,
                fontSize: 13,
                color: C.text,
                appearance: "none",
                paddingRight: 2,
                cursor: "pointer",
              }}
            >
              <option value="1">1</option>
            </select>
            <ChevronDown size={11} color={C.secondary} />
          </span>
        </span>
      </label>
      <p style={{ margin: "5px 0 0", fontSize: 12, color: C.secondary }}>
        Qty limited to 1 per customer. Permanently.
      </p>

      <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
        <button
          type="button"
          onClick={onAddToCart}
          style={{ ...cta, background: C.ctaYellow, border: `1px solid #E7B93C` }}
        >
          Add to Cart
        </button>
        <button
          type="button"
          onClick={onBuyNow}
          style={{ ...cta, background: C.ctaOrange, border: `1px solid #E08A2B` }}
        >
          Buy Now
        </button>
      </div>

      <p
        style={{
          margin: "10px 0 0",
          display: "flex",
          alignItems: "center",
          gap: 5,
          fontSize: 12,
          color: C.link,
        }}
      >
        <LockGlyph size={13} />
        Secure transaction
      </p>

      <div style={{ display: "grid", gap: 5, marginTop: 12 }}>
        <InfoRow label="Ships from" value="Bengaluru" />
        <InfoRow label="Sold by" value="Nobody. She is not for sale." />
        <InfoRow label="Returns" value="Non-returnable" />
      </div>

      <button
        type="button"
        onClick={onWishList}
        style={{
          ...cta,
          marginTop: 12,
          background: C.section,
          border: `1px solid ${C.border}`,
          color: C.text,
        }}
      >
        Add to Wish List
      </button>
    </aside>
  );
}
