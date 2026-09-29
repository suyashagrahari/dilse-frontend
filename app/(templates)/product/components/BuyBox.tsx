"use client";

// ─── Buy box — the right rail on desktop, the inline block on a phone ────────
//
// Every row a real one has: price, the delivery promise with the date in bold,
// the deliver-to link, the stock line, ships-from / sold-by, quantity, the two
// pill CTAs, secure transaction, gift options, wish list.
//
// ── THE JOKE IS IN THE COLOUR ────────────────────────────────────────────────
// `stockLine` is the reassuring green UNLESS it says there is one left, and
// then it is red. That inversion only lands because everything around it is
// played completely straight.

import { useState } from "react";
import { C, FONT, WRAP } from "./tokens";
import type { ProductData } from "./types";
import { PriceTag } from "./Details";
import { IconLock, IconPin, IconChevronDown } from "./icons";

const DATE_RE =
  /((?:Today|Tonight|Tomorrow|Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)(?:,\s*\d{1,2}\s+[A-Za-z]+)?(?:,?\s*\d{1,2}(?::\d{2})?\s*(?:AM|PM))?|\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December))/g;

function DeliveryLine({ line }: { line: string }) {
  const parts = line.split(DATE_RE);
  return (
    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.45, color: C.text, ...WRAP }}>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <strong key={`d${i}`} style={{ fontWeight: 700 }}>
            {part}
          </strong>
        ) : (
          <span key={`t${i}`}>{part}</span>
        )
      )}
    </p>
  );
}

const SCARCE = /only\s*(1|one)\b|1\s*left|last\s+one/i;

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", gap: 10, fontSize: 12.5, lineHeight: 1.5 }}>
      <span style={{ flex: "0 0 82px", color: C.secondary }}>{label}</span>
      <span style={{ flex: "1 1 auto", color: C.text, ...WRAP }}>{value}</span>
    </div>
  );
}

export default function BuyBox({
  data,
  inCart,
  onAddToCart,
  onBuyNow,
  onWishList,
  onQuantity,
}: {
  data: ProductData;
  inCart: boolean;
  onAddToCart: (from: HTMLElement) => void;
  onBuyNow: () => void;
  onWishList: () => void;
  onQuantity: () => void;
}) {
  const scarce = SCARCE.test(data.stockLine);
  const [gift, setGift] = useState(true);
  const her = data.subject.firstName.trim() || "her";

  return (
    <aside aria-label="Buy box" className="lk-buy">
      <div className="lk-buy-price">
        <PriceTag amount={data.price.amount} size={28} />
      </div>

      <DeliveryLine line={data.deliveryLine} />
      <p style={{ margin: "8px 0 0", fontSize: 14, color: C.text }}>
        Or fastest delivery <strong>right now</strong>. Just call. <span className="lk-link">Details</span>
      </p>

      <p className="lk-link" style={{ margin: "10px 0 0", display: "flex", alignItems: "center", gap: 5, fontSize: 13 }}>
        <IconPin size={15} color={C.text} />
        Deliver to {her} – My heart 143001
      </p>

      <p style={{ margin: "12px 0 0", fontSize: 18, color: scarce ? C.priceRed : C.green, fontWeight: scarce ? 700 : 400, ...WRAP }}>
        {data.stockLine}
      </p>

      <div style={{ display: "grid", gap: 3, marginTop: 10 }}>
        <InfoRow label="Ships from" value="The seller's heart" />
        <InfoRow label="Sold by" value="Nobody. Not for sale." />
        <InfoRow label="Payment" value="Secure transaction" />
        <InfoRow label="Packaging" value="Wrapped in hugs" />
      </div>

      <button type="button" className="lk-qty" onClick={onQuantity} aria-label="Quantity: 1">
        Quantity: 1 <IconChevronDown size={10} color={C.text} />
      </button>

      <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
        <button
          type="button"
          className="lk-cta lk-cta-yellow"
          data-lk-add=""
          onClick={(e) => onAddToCart(e.currentTarget)}
        >
          {inCart ? "Added to Cart ✓" : "Add to Cart"}
        </button>
        <button type="button" className="lk-cta lk-cta-orange" onClick={onBuyNow}>
          Buy Now
        </button>
      </div>

      <p className="lk-link" style={{ margin: "12px 0 0", display: "flex", alignItems: "center", gap: 5, fontSize: 13 }}>
        <IconLock size={13} color={C.secondary} /> Secure transaction
      </p>

      <label className="lk-gift">
        <input type="checkbox" checked={gift} onChange={(e) => setGift(e.target.checked)} />
        <span>
          Add gift options {gift ? <span style={{ color: C.secondary }}>· a handwritten note is already in the box 💌</span> : null}
        </span>
      </label>

      <hr className="lk-hr" style={{ margin: "12px 0" }} />
      <button type="button" className="lk-cta lk-cta-ghost" onClick={onWishList}>
        Add to Wish List
      </button>
    </aside>
  );
}

export function BuyBoxStyles() {
  return (
    <style>{`
      .lk-buy { font-family: ${FONT}; color: ${C.text}; background: #fff; min-width: 0; }
      .lk-buy-price { display: none; margin-bottom: 10px; }
      @media (min-width: 768px) {
        .lk-buy { border: 1px solid ${C.border}; border-radius: 8px; padding: 18px; }
        .lk-buy-price { display: block; }
      }
      .lk-qty {
        margin-top: 12px; display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 8px;
        background: #F0F2F2; border: 1px solid ${C.border}; box-shadow: 0 2px 5px rgba(213,217,217,.5);
        font: 400 13px ${FONT}; color: ${C.text}; cursor: pointer;
      }
      .lk-qty:hover { background: #E3E6E6; }
      .lk-cta {
        width: 100%; min-height: 44px; border-radius: 100px; font: 400 15px ${FONT}; color: ${C.text}; cursor: pointer; padding: 8px 14px;
        touch-action: manipulation; transition: background .12s ease, transform .12s ease; -webkit-tap-highlight-color: transparent;
      }
      @media (min-width: 768px) { .lk-cta { min-height: 34px; font-size: 13px; padding: 6px 12px; } }
      .lk-cta:active { transform: scale(.98); }
      .lk-cta-yellow { background: ${C.ctaYellow}; border: 1px solid ${C.ctaYellowEdge}; }
      .lk-cta-yellow:hover { background: ${C.ctaYellowHover}; }
      .lk-cta-orange { background: ${C.ctaOrange}; border: 1px solid ${C.ctaOrangeEdge}; }
      .lk-cta-orange:hover { background: ${C.ctaOrangeHover}; }
      .lk-cta-ghost { background: #fff; border: 1px solid ${C.border}; box-shadow: 0 2px 5px rgba(213,217,217,.5); }
      .lk-cta-ghost:hover { background: #F7FAFA; }
      .lk-gift { display: flex; gap: 8px; align-items: flex-start; margin-top: 12px; font-size: 13px; line-height: 1.4; cursor: pointer; }
      .lk-gift input { accent-color: #007185; width: 16px; height: 16px; margin: 1px 0 0; flex: none; }
    `}</style>
  );
}
