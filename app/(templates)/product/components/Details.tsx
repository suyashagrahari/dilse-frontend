"use client";

// ─── Details — the centre column, in three grid areas ────────────────────────
//
//   DetailsHead   title, store link, rating row, the "<Sender>'s Choice" badge
//   DetailsPrice  bought line, deal badge, price + M.R.P., offers, icon row,
//                 variant swatches
//   DetailsRest   the short spec strip and "About this item"
//
// Three pieces rather than one because the phone and the desktop order them
// differently around the gallery and the buy box, and a CSS grid with named
// areas can only move whole children.
//
// ── NOTHING PARSES MONEY ─────────────────────────────────────────────────────
// `price.amount` is a string and the demo is "∞". See ./types.ts.

import { useState } from "react";
import StarRating from "@/components/contrib/StarRating";
import { C, FONT, WRAP, spokenAverage, type Aggregate } from "./tokens";
import type { PhotoCrop, ProductData } from "./types";
import { Framed } from "./Gallery";
import { FeatureIcon, IconChevronDown, IconChevronRight } from "./icons";

/** "<Sender>'s Choice" — the two-tone badge. Our name, not theirs. */
export function ChoiceBadge({ sender }: { sender: string }) {
  const who = sender.trim() || "Editor";
  return (
    <span className="lk-choice">
      <span className="lk-choice-a">{who}&apos;s</span>
      <span className="lk-choice-b">Choice</span>
    </span>
  );
}

export function Stars({ value, size = 16 }: { value: number; size?: number }) {
  return <StarRating rating={value} size={size} fillColor={C.star} emptyColor="#E3E6E6" label={`${spokenAverage(value)} out of 5 stars`} />;
}

export function priceParts(amount: string): { symbol: string; rest: string } {
  const lead = amount.slice(0, 1);
  if (/^[₹$€£¥]$/.test(lead)) return { symbol: lead, rest: amount.slice(1).trim() };
  return { symbol: "₹", rest: amount };
}

/** ₹ superscript, big amount — the real price lock-up. */
export function PriceTag({ amount, size = 28 }: { amount: string; size?: number }) {
  const { symbol, rest } = priceParts(amount);
  return (
    <span style={{ display: "inline-flex", alignItems: "flex-start", color: C.text, fontFamily: FONT }}>
      <span style={{ fontSize: size * 0.46, lineHeight: 1, marginTop: size * 0.12 }}>{symbol}</span>
      <span style={{ fontSize: rest === "∞" ? size * 1.3 : size, lineHeight: 1, fontWeight: 400, ...WRAP }}>{rest}</span>
    </span>
  );
}

/* ── Head ──────────────────────────────────────────────────────────────────── */

export function DetailsHead({
  data,
  aggregate,
  onJumpToReviews,
}: {
  data: ProductData;
  aggregate: Aggregate;
  onJumpToReviews: () => void;
}) {
  const store = data.storeName.trim();
  return (
    <div className="lk-head">
      {/* Phone: store left, rating right, above the title. */}
      <div className="lk-head-m">
        {store ? <span className="lk-link" style={{ fontSize: 13 }}>{store}</span> : <span />}
        {aggregate.count > 0 && (
          <button type="button" onClick={onJumpToReviews} className="lk-rate-m" aria-label="See reviews">
            <span>{spokenAverage(aggregate.average)}</span>
            <Stars value={aggregate.average} size={13} />
            <span style={{ color: C.link }}>{aggregate.count.toLocaleString("en-IN")}</span>
          </button>
        )}
      </div>

      <h1 className="lk-title">{data.title}</h1>

      <div className="lk-head-d">
        {store ? <span className="lk-link" style={{ fontSize: 14 }}>{store}</span> : null}
        {aggregate.count > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, flexWrap: "wrap", fontSize: 14 }}>
            <span>{spokenAverage(aggregate.average)}</span>
            <Stars value={aggregate.average} size={16} />
            <IconChevronDown size={10} color={C.secondary} />
            <button type="button" onClick={onJumpToReviews} className="lk-link" style={{ fontSize: 14 }}>
              {aggregate.count.toLocaleString("en-IN")} rating{aggregate.count === 1 ? "" : "s"}
            </button>
            <span style={{ color: C.border }}>|</span>
            <button type="button" onClick={onJumpToReviews} className="lk-link" style={{ fontSize: 14 }}>
              Search this page
            </button>
          </div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
        <ChoiceBadge sender={data.sender.firstName} />
        <span className="lk-choice-for">for &ldquo;the one&rdquo;</span>
      </div>
    </div>
  );
}

/* ── Price, offers, icons, variants ─────────────────────────────────────────── */

const FEATURES = [
  { kind: "return" as const, label: "Non-returnable. Ever." },
  { kind: "truck" as const, label: "Free Delivery, forever" },
  { kind: "cash" as const, label: "Pay on Delivery (in hugs)" },
  { kind: "crown" as const, label: "Top Brand" },
  { kind: "gift" as const, label: "Gift-wrapped in me" },
  { kind: "shield" as const, label: "Secure transaction" },
];

export function DetailsPrice({
  data,
  crops,
  variant,
  onVariant,
  onOffer,
}: {
  data: ProductData;
  crops: PhotoCrop[];
  variant: number;
  onVariant: (i: number) => void;
  onOffer: (label: string, text: string) => void;
}) {
  const discount = data.price.discountPct ?? 0;
  const photos = data.subject.photos;
  const offers = data.offers
    .map((o) => {
      const at = o.indexOf("|");
      return at < 0 ? { label: "Offer", text: o.trim() } : { label: o.slice(0, at).trim() || "Offer", text: o.slice(at + 1).trim() };
    })
    .filter((o) => o.text);
  const variants = data.variants.filter(Boolean);
  const current = variants[Math.min(variant, variants.length - 1)] ?? "";

  return (
    <div className="lk-price">
      {data.boughtLine ? <p className="lk-bought">{data.boughtLine}</p> : null}
      <hr className="lk-hr lk-desk-hr" />

      {data.dealLabel ? <span className="lk-deal">{data.dealLabel}</span> : null}

      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginTop: 6 }}>
        {discount > 0 ? <span className="lk-discount">-{discount}%</span> : null}
        <PriceTag amount={data.price.amount} size={28} />
      </div>
      {data.price.original ? (
        <p className="lk-mrp">
          M.R.P.: <span style={{ textDecoration: "line-through" }}>{data.price.original}</span>
        </p>
      ) : null}
      <p className="lk-tax">Inclusive of all taxes · and all feelings</p>
      <p style={{ margin: "6px 0 0", fontSize: 14, color: C.text }}>
        <strong>EMI</strong> starts at 1 hug/day. No Cost EMI available{" "}
        <span className="lk-link" style={{ fontSize: 14 }}>
          EMI options <IconChevronDown size={9} color={C.link} style={{ display: "inline-block" }} />
        </span>
      </p>

      {offers.length > 0 && (
        <>
          <hr className="lk-hr" />
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
            <span style={{ fontSize: 16, fontWeight: 700 }}>Offers</span>
          </div>
          <div className="lk-offers">
            {offers.map((o, i) => (
              <button key={`${o.label}-${i}`} type="button" className="lk-offer" onClick={() => onOffer(o.label, o.text)}>
                <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{o.label}</span>
                <span className="lk-offer-text">{o.text}</span>
                <span className="lk-link" style={{ fontSize: 13, marginTop: "auto" }}>
                  1 offer <IconChevronRight size={10} color={C.link} style={{ display: "inline-block" }} />
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      <hr className="lk-hr" />
      <div className="lk-features">
        {FEATURES.map((f) => (
          <span key={f.kind} className="lk-feature">
            <span className="lk-feature-disc">
              <FeatureIcon kind={f.kind} size={30} />
            </span>
            <span className="lk-link" style={{ fontSize: 12, textAlign: "center", lineHeight: 1.3 }}>
              {f.label}
            </span>
          </span>
        ))}
      </div>

      {variants.length > 0 && (
        <>
          <hr className="lk-hr" />
          <p style={{ margin: "0 0 8px", fontSize: 14, color: C.text }}>
            {data.variantLabel || "Style"}: <strong>{current}</strong>
          </p>
          <div className="lk-variants" role="radiogroup" aria-label={data.variantLabel || "Style"}>
            {variants.map((v, i) => {
              const on = i === variant;
              const pi = photos.length ? i % photos.length : -1;
              return (
                <button
                  key={`${v}-${i}`}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => onVariant(i)}
                  className={`lk-variant${on ? " lk-variant-on" : ""}`}
                >
                  <span className="lk-variant-img">
                    {pi >= 0 ? <Framed src={photos[pi] ?? ""} crop={crops[pi]} alt="" /> : null}
                  </span>
                  <span className="lk-variant-name">{v}</span>
                  <span className="lk-variant-price">{priceParts(data.price.amount).symbol}{priceParts(data.price.amount).rest}</span>
                </button>
              );
            })}
          </div>
          <p style={{ margin: "8px 0 0", fontSize: 12, color: C.secondary }}>All moods included at no extra cost. Non-negotiable.</p>
        </>
      )}
    </div>
  );
}

/* ── Spec strip + About this item ───────────────────────────────────────────── */

export function DetailsRest({ data }: { data: ProductData }) {
  const [more, setMore] = useState(false);
  const top = data.specs.slice(0, 5);
  const bullets = data.bullets;
  const clipped = !more && bullets.length > 4;

  return (
    <div className="lk-rest">
      {top.length > 0 && (
        <>
          <hr className="lk-hr" />
          <table className="lk-minispec">
            <tbody>
              {top.map((s) => (
                <tr key={s.label}>
                  <th scope="row">{s.label}</th>
                  <td>{s.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {bullets.length > 0 && (
        <>
          <hr className="lk-hr" />
          <h2 className="lk-h2" style={{ fontSize: 16 }}>About this item</h2>
          <ul className={`lk-bullets${clipped ? " lk-bullets-clip" : ""}`}>
            {bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
          {bullets.length > 4 && (
            <button type="button" className="lk-link" style={{ fontSize: 14, marginTop: 4 }} onClick={() => setMore((v) => !v)}>
              {more ? "See less" : "See more product details"}
            </button>
          )}
        </>
      )}
    </div>
  );
}

export function DetailsStyles() {
  return (
    <style>{`
      .lk-head-m { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin: 2px 0 4px; }
      .lk-rate-m { display: inline-flex; align-items: center; gap: 4px; border: 0; background: none; padding: 0; font: 400 13px ${FONT}; color: ${C.text}; cursor: pointer; }
      .lk-head-d { display: none; }
      .lk-title { margin: 0; font: 400 14.5px/1.4 ${FONT}; color: #333; overflow-wrap: anywhere; }
      @media (min-width: 768px) {
        .lk-head-m { display: none; }
        .lk-head-d { display: block; margin-top: 4px; }
        .lk-title { font-size: 24px; line-height: 1.3; color: ${C.text}; }
      }

      .lk-choice { display: inline-flex; align-items: stretch; font: 700 12px/1 ${FONT}; border-radius: 0 2px 2px 0; overflow: hidden; }
      .lk-choice-a { background: #232F3E; color: #fff; padding: 5px 6px 5px 8px; }
      .lk-choice-b { background: #232F3E; color: #FF9900; padding: 5px 12px 5px 0; clip-path: polygon(0 0, 100% 0, 88% 50%, 100% 100%, 0 100%); }
      .lk-choice-for { font-size: 12px; color: ${C.secondary}; }

      .lk-bought { margin: 8px 0 0; font-size: 14px; color: ${C.secondary}; }
      .lk-bought::first-letter { font-weight: 700; color: ${C.text}; }
      .lk-hr { border: 0; border-top: 1px solid ${C.hairline}; margin: 14px 0; }
      .lk-desk-hr { display: none; }
      @media (min-width: 768px) { .lk-desk-hr { display: block; } }
      .lk-deal {
        display: inline-block; background: ${C.priceRed}; color: #fff; font: 700 12px/1 ${FONT};
        padding: 6px 8px; border-radius: 2px; margin-top: 10px;
      }
      .lk-discount { color: ${C.priceRed}; font: 300 28px/1 ${FONT}; }
      .lk-mrp { margin: 4px 0 0; font-size: 12px; color: ${C.secondary}; }
      .lk-tax { margin: 2px 0 0; font-size: 14px; color: ${C.text}; }

      .lk-offers { display: flex; gap: 10px; overflow-x: auto; scrollbar-width: none; padding: 2px 2px 6px; margin: 0 -14px; padding-left: 14px; padding-right: 14px; scroll-snap-type: x proximity; }
      .lk-offers::-webkit-scrollbar { display: none; }
      @media (min-width: 768px) { .lk-offers { margin: 0; padding: 2px 2px 6px; } }
      .lk-offer {
        flex: 0 0 160px; min-height: 124px; display: flex; flex-direction: column; gap: 4px; text-align: left; padding: 10px 12px;
        border-radius: 8px; border: 0; background: #fff; box-shadow: 0 0 0 1px ${C.border}, 0 2px 5px rgba(15,17,17,.12);
        font-family: ${FONT}; cursor: pointer; scroll-snap-align: start; transition: box-shadow .15s ease, transform .15s ease;
      }
      .lk-offer:hover { box-shadow: 0 0 0 1px #A6A6A6, 0 3px 8px rgba(15,17,17,.18); }
      .lk-offer:active { transform: scale(.98); }
      .lk-offer-text { font-size: 13px; line-height: 1.35; color: ${C.text}; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }

      .lk-features { display: flex; gap: 4px; overflow-x: auto; scrollbar-width: none; margin: 0 -14px; padding: 0 14px; }
      .lk-features::-webkit-scrollbar { display: none; }
      @media (min-width: 768px) { .lk-features { margin: 0; padding: 0; } }
      .lk-feature { flex: 0 0 76px; display: flex; flex-direction: column; align-items: center; gap: 6px; }
      .lk-feature-disc { width: 46px; height: 46px; border-radius: 50%; background: #F0F2F2; display: grid; place-items: center; }

      .lk-variants { display: flex; gap: 8px; overflow-x: auto; scrollbar-width: none; padding: 3px; margin: -3px; }
      .lk-variants::-webkit-scrollbar { display: none; }
      .lk-variant {
        flex: 0 0 86px; display: flex; flex-direction: column; align-items: stretch; padding: 0 0 6px; border-radius: 8px; cursor: pointer;
        background: #fff; border: 1px solid ${C.border}; overflow: hidden; font-family: ${FONT}; transition: box-shadow .15s ease, border-color .15s ease;
        -webkit-tap-highlight-color: transparent;
      }
      .lk-variant:hover { border-color: #A6A6A6; }
      .lk-variant-on { border-color: ${C.chipEdge}; box-shadow: 0 0 0 2px ${C.chipEdge}; background: ${C.chipTint}; }
      .lk-variant-img { display: block; width: 100%; aspect-ratio: 1 / 1; background: #F3F3F3; }
      .lk-variant-name { font-size: 12px; font-weight: 700; color: ${C.text}; padding: 5px 6px 0; line-height: 1.25; text-align: left; overflow-wrap: anywhere; }
      .lk-variant-price { font-size: 12px; color: ${C.text}; padding: 1px 6px 0; text-align: left; }

      .lk-minispec { border-collapse: collapse; font-size: 14px; width: 100%; max-width: 420px; }
      .lk-minispec th { text-align: left; font-weight: 700; padding: 4px 16px 4px 0; vertical-align: top; width: 38%; color: ${C.text}; }
      .lk-minispec td { padding: 4px 0; color: ${C.text}; overflow-wrap: anywhere; }

      .lk-h2 { margin: 0 0 8px; font: 700 20px/1.3 ${FONT}; color: ${C.text}; }
      .lk-bullets { margin: 0; padding-left: 18px; font-size: 14px; line-height: 1.5; color: ${C.text}; position: relative; }
      .lk-bullets li { margin: 0 0 6px; overflow-wrap: anywhere; }
      .lk-bullets li::marker { color: ${C.text}; }
      .lk-bullets-clip { max-height: 250px; overflow: hidden; }
      .lk-bullets-clip::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 60px; background: linear-gradient(transparent, #fff); }
    `}</style>
  );
}
