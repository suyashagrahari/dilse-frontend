"use client";

// ─── Full-width sections: bundle, product information, from the seller ───────
//
// ── THE SELLER NOTE IS THE PAYLOAD ───────────────────────────────────────────
// Everything above it is spec-sheet comedy. `FromTheSeller` is where the page
// stops joking — the only block on the listing set in a serif with real
// whitespace, the way a brand's A+ content breaks out of the grid. Do not
// compress it to match the density of the rest of the page.

import { useState } from "react";
import { C, FONT, SECTION_IDS, SERIF, WRAP } from "./tokens";
import type { BundleItem, PhotoCrop, ProductData, Spec } from "./types";
import { Framed } from "./Gallery";
import { PriceTag, priceParts } from "./Details";

/** A tile for an item with no photo — a soft square with the right emoji. */
const EMOJI_RULES: [RegExp, string][] = [
  [/coffee|chai|tea|latte/i, "☕"],
  [/boyfriend|husband|him\b|guy|man\b/i, "🙋‍♂️"],
  [/girlfriend|wife/i, "🙋‍♀️"],
  [/\b(mom|mother|maa|mummy|aunty|mrs|papa|dad|father|parents?)\b/i, "🏠"],
  [/flower|rose|bouquet/i, "💐"],
  [/pizza|momo|food|biryani|maggi|snack|dinner/i, "🍕"],
  [/dog|puppy|cat|kitten|pet/i, "🐶"],
  [/music|playlist|song|spotify/i, "🎧"],
  [/book|novel|read/i, "📚"],
  [/\b(car|drive|bike|scooty|scooter|activa|road trip)\b/i, "🚗"],
  [/chocolate|dessert|cake|ice ?cream/i, "🍫"],
  [/hug|cuddle|blanket|hoodie/i, "🧸"],
  [/movie|film|netflix|show/i, "🍿"],
  [/phone|call|text|message/i, "📱"],
];
const FALLBACK_EMOJI = ["🎁", "💐", "🧸", "🍫"];

export function emojiFor(name: string, i: number): string {
  for (const [re, e] of EMOJI_RULES) if (re.test(name)) return e;
  return FALLBACK_EMOJI[i % FALLBACK_EMOJI.length] ?? "🎁";
}

function Tile({ item, i }: { item: BundleItem; i: number }) {
  if (item.imageUrl) return <Framed src={item.imageUrl} alt={item.name} />;
  return (
    <span className="lk-emoji-tile" style={{ background: ["#FFF1E6", "#EAF7F5", "#FDEBF1", "#EEF1FF"][i % 4] }} aria-hidden="true">
      {emojiFor(item.name, i)}
    </span>
  );
}

/* ── Frequently bought together ────────────────────────────────────────────── */

export function FrequentlyBoughtTogether({
  data,
  heroCrop,
  onAddAll,
}: {
  data: ProductData;
  heroCrop?: PhotoCrop;
  onAddAll: (from: HTMLElement) => void;
}) {
  const extras = data.bundle.slice(0, 3);
  const [on, setOn] = useState<boolean[]>(() => extras.map(() => true));
  if (extras.length === 0) return null;
  const n = 1 + on.filter(Boolean).length;
  const words = ["", "", "both", "all three", "all four"];

  return (
    <section className="lk-sec" aria-labelledby="lk-fbt-h">
      <h2 id="lk-fbt-h" className="lk-h2">
        Frequently bought together
      </h2>
      <div className="lk-fbt">
        <div className="lk-fbt-imgs">
          <span className="lk-fbt-img" data-lk-fbt="">
            <Framed src={data.subject.photos[0] ?? ""} crop={heroCrop} alt={data.subject.firstName} />
          </span>
          {extras.map((b, i) => (
            <span key={`${b.name}-${i}`} style={{ display: "contents" }}>
              <span className="lk-fbt-plus">+</span>
              <span className="lk-fbt-img" style={{ opacity: on[i] ? 1 : 0.35 }}>
                <Tile item={b} i={i} />
              </span>
            </span>
          ))}
        </div>
        <div className="lk-fbt-total">
          <p style={{ margin: 0, fontSize: 14 }}>
            Total price: <PriceTag amount={data.price.amount} size={18} />
          </p>
          <button type="button" className="lk-cta lk-cta-yellow" style={{ marginTop: 8 }} onClick={(e) => onAddAll(e.currentTarget)}>
            Add {words[n] || `all ${n}`} to Cart
          </button>
          <p style={{ margin: "6px 0 0", fontSize: 12, color: C.secondary }}>Some of these items ship from the same heart.</p>
        </div>
      </div>

      <ul className="lk-fbt-list">
        <li>
          <input type="checkbox" checked readOnly aria-label="This item" />
          <span>
            <strong>This item:</strong> {data.title} <strong className="lk-fbt-price">{priceParts(data.price.amount).symbol}{priceParts(data.price.amount).rest}</strong>
          </span>
        </li>
        {extras.map((b, i) => (
          <li key={`${b.name}-row-${i}`}>
            <input
              type="checkbox"
              checked={on[i] ?? true}
              onChange={() => setOn((prev) => prev.map((v, k) => (k === i ? !v : v)))}
              aria-label={b.name}
            />
            <span>
              <span className="lk-link">{b.name}</span> <strong className="lk-fbt-price">{b.price}</strong>
              {b.note ? <span style={{ display: "block", color: C.secondary, fontSize: 12.5 }}>{b.note}</span> : null}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ── Product information ───────────────────────────────────────────────────── */

export function SpecTable({ specs }: { specs: Spec[] }) {
  if (specs.length === 0) return null;
  const half = Math.ceil(specs.length / 2);
  const cols = [specs.slice(0, half), specs.slice(half)];
  return (
    <section id={SECTION_IDS.specs} className="lk-sec" aria-labelledby="lk-spec-h">
      <h2 id="lk-spec-h" className="lk-h2">
        Product information
      </h2>
      <div className="lk-spec-grid">
        {cols.map((col, c) => (
          <div key={c}>
            {c === 0 && <h3 className="lk-h3">Technical Details</h3>}
            {c === 1 && <h3 className="lk-h3">Additional Information</h3>}
            <table className="lk-spec">
              <tbody>
                {col.map((s, i) => (
                  <tr key={`${s.label}-${i}`}>
                    <th scope="row">{s.label}</th>
                    <td>{s.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── From the seller (A+ content) ──────────────────────────────────────────── */

export function FromTheSeller({
  about,
  photo,
  crop,
  sender,
}: {
  about: ProductData["aboutSection"];
  photo: string;
  crop?: PhotoCrop;
  sender: string;
}) {
  const paras = about.body
    .split(/\n{2,}|\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (!about.heading && paras.length === 0) return null;
  const img = about.imageUrl || photo;

  return (
    <section className="lk-sec lk-aplus" aria-labelledby="lk-aplus-h">
      <h2 className="lk-h2">From the manufacturer</h2>
      <div className="lk-aplus-card">
        {img ? (
          <div className="lk-aplus-img">
            <Framed src={img} crop={about.imageUrl ? undefined : crop} alt="" />
            <span className="lk-aplus-tag">handmade · 1 of 1</span>
          </div>
        ) : null}
        <div className="lk-aplus-copy">
          {about.heading ? (
            <h3 id="lk-aplus-h" style={{ margin: 0, fontFamily: SERIF, fontSize: 28, lineHeight: 1.2, fontWeight: 400, color: C.text, ...WRAP }}>
              {about.heading}
            </h3>
          ) : null}
          {paras.map((p, i) => (
            <p key={i} style={{ margin: "14px 0 0", fontFamily: SERIF, fontSize: 17, lineHeight: 1.75, color: "#333", ...WRAP }}>
              {p}
            </p>
          ))}
          {sender ? (
            <p style={{ margin: "18px 0 0", fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: C.love }}>— {sender}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export function SectionStyles() {
  return (
    <style>{`
      .lk-sec { border-top: 1px solid ${C.hairline}; padding: 22px 0 6px; margin-top: 18px; font-family: ${FONT}; color: ${C.text}; }
      .lk-h3 { margin: 0 0 8px; font: 700 16px ${FONT}; color: ${C.text}; }
      .lk-emoji-tile { display: grid; place-items: center; width: 100%; height: 100%; font-size: 38px; }

      .lk-fbt { display: flex; flex-direction: column; gap: 14px; }
      @media (min-width: 768px) { .lk-fbt { flex-direction: row; align-items: center; gap: 28px; } }
      .lk-fbt-imgs { display: flex; align-items: center; gap: 6px; min-width: 0; }
      .lk-fbt-img { flex: 0 1 110px; min-width: 0; aspect-ratio: 1 / 1; border-radius: 8px; overflow: hidden; border: 1px solid ${C.hairline}; transition: opacity .2s ease; }
      .lk-fbt-plus { flex: none; font-size: 22px; color: ${C.secondary}; }
      .lk-fbt-total { min-width: 0; }
      @media (min-width: 768px) { .lk-fbt-total { width: 230px; } }
      .lk-fbt-list { list-style: none; margin: 14px 0 0; padding: 0; display: grid; gap: 8px; font-size: 14px; line-height: 1.45; }
      .lk-fbt-list li { display: flex; gap: 8px; align-items: flex-start; overflow-wrap: anywhere; }
      .lk-fbt-list input { accent-color: #007185; width: 16px; height: 16px; margin-top: 2px; flex: none; }
      .lk-fbt-price { color: ${C.priceRed}; font-weight: 700; white-space: nowrap; }

      .lk-spec-grid { display: grid; gap: 18px; }
      @media (min-width: 1024px) { .lk-spec-grid { grid-template-columns: 1fr 1fr; gap: 40px; } }
      .lk-spec { width: 100%; border-collapse: collapse; font-size: 14px; }
      .lk-spec th, .lk-spec td { border-top: 1px solid ${C.hairline}; padding: 8px 12px; vertical-align: top; text-align: left; overflow-wrap: anywhere; }
      .lk-spec tr:last-child th, .lk-spec tr:last-child td { border-bottom: 1px solid ${C.hairline}; }
      .lk-spec th { background: #F3F3F3; font-weight: 700; width: 42%; color: #333; }

      .lk-aplus-card { display: grid; gap: 0; border-radius: 12px; overflow: hidden; background: linear-gradient(180deg, #FFF8F1, #FFF 70%); border: 1px solid #F3E6D8; }
      @media (min-width: 900px) { .lk-aplus-card { grid-template-columns: 5fr 7fr; align-items: stretch; } }
      .lk-aplus-img { position: relative; aspect-ratio: 4 / 3; }
      @media (min-width: 900px) { .lk-aplus-img { aspect-ratio: auto; min-height: 380px; } }
      .lk-aplus-tag { position: absolute; left: 12px; bottom: 12px; background: rgba(255,255,255,.92); color: ${C.love}; font: 700 11px ${FONT}; letter-spacing: .08em; text-transform: uppercase; padding: 5px 10px; border-radius: 100px; }
      .lk-aplus-copy { padding: 26px 22px 28px; }
      @media (min-width: 900px) { .lk-aplus-copy { padding: 44px 48px; } }
    `}</style>
  );
}
