"use client";

// ─── Site chrome — the two navigation bars and the breadcrumb ────────────────
//
// The chrome is what makes the page read as a listing inside one second, before
// a single word has been processed. So it is built to the real proportions: a
// 60px dark bar, a 39px darker one under it, a 40px search field with a 4px
// radius, a breadcrumb at 12px.
//
// ── BRAND ────────────────────────────────────────────────────────────────────
// The wordmark is ours — WORDMARK from ./types — set in the system stack, with
// a heart we draw ourselves underneath it. No borrowed device sits under or
// beside it, the type is the platform system stack and nothing licensed, and no
// retailer is named anywhere in this file.
//
// ── 380px ────────────────────────────────────────────────────────────────────
// The bar reflows to three rows on a phone (mark + account + cart / search /
// deliver-to) and the sub-nav scrolls sideways. Nothing is hidden — a listing
// page with no search box does not read as a listing page.

import { CartGlyph, ChevronDown, HeartMark, PinGlyph, SearchGlyph, C, FONT } from "./tokens";
import { WORDMARK } from "./types";

const SUB_NAV = [
  "All",
  "Today's Feelings",
  "Best Sellers",
  "New Releases",
  "Us",
  "Gift Ideas",
] as const;

export function Wordmark({ scale = 1 }: { scale?: number }) {
  return (
    <span
      style={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "flex-start",
        lineHeight: 1,
        padding: "2px 6px 2px 2px",
        flex: "none",
      }}
    >
      <span
        style={{
          fontFamily: FONT,
          fontSize: 22 * scale,
          fontWeight: 800,
          letterSpacing: "-0.02em",
          color: "#FFFFFF",
          whiteSpace: "nowrap",
        }}
      >
        {WORDMARK}
      </span>
      <span style={{ marginTop: 2 * scale, marginLeft: 2 }}>
        <HeartMark width={44 * scale} />
      </span>
    </span>
  );
}

/** "Hello, X / Account & Lists" — two stacked lines, the second one bold. */
function NavStack({ top, bottom }: { top: string; bottom: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "4px 7px",
        border: "1px solid transparent",
        borderRadius: 2,
        color: "#FFFFFF",
        fontFamily: FONT,
        lineHeight: 1.25,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ fontSize: 11.5, color: "#DDD" }}>{top}</span>
      <span style={{ fontSize: 13.5, fontWeight: 700 }}>{bottom}</span>
    </span>
  );
}

export default function Chrome({
  recipientFirstName,
  cartCount,
  cartBumping,
}: {
  recipientFirstName: string;
  /** Owned by the buy box — the "Add to Cart" joke drives it from 1 to 2. */
  cartCount: number;
  cartBumping: boolean;
}) {
  const name = recipientFirstName.trim() || "you";

  return (
    <header className="lk-chrome">
      {/* ── Row 1 — 60px ───────────────────────────────────────────────── */}
      <div className="lk-nav">
        <div className="lk-nav-mark">
          <Wordmark />
        </div>

        <span className="lk-deliver">
          <PinGlyph size={13} />
          <span style={{ display: "inline-flex", flexDirection: "column", lineHeight: 1.2 }}>
            <span style={{ fontSize: 11, color: "#CCC" }}>Deliver to {name}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#FFF" }}>Bengaluru 560001</span>
          </span>
        </span>

        {/* Search — 40px tall, 4px radius, category left, yellow button right. */}
        <form
          className="lk-search"
          role="search"
          onSubmit={(e) => e.preventDefault()}
          aria-label="Search this store"
        >
          <span className="lk-search-cat">
            All
            <ChevronDown size={11} color={C.text} />
          </span>
          <input
            className="lk-search-input"
            type="search"
            aria-label="Search for someone better"
            placeholder="Search for someone better (you will not find one)"
          />
          <button className="lk-search-btn" type="submit" aria-label="Search">
            <SearchGlyph size={19} color={C.text} />
          </button>
        </form>

        <div className="lk-nav-right">
          <NavStack top={`Hello, ${name}`} bottom="Account & Lists" />
          <NavStack top="Returns" bottom="& Orders" />
          <span
            className={`lk-cart${cartBumping ? " lk-cart-bump" : ""}`}
            aria-label={`Cart, ${cartCount} item${cartCount === 1 ? "" : "s"}`}
            role="status"
          >
            <span className="lk-cart-count">{cartCount}</span>
            <CartGlyph size={27} />
            <span className="lk-cart-word">Cart</span>
          </span>
        </div>
      </div>

      {/* ── Row 2 — 39px ───────────────────────────────────────────────── */}
      <nav className="lk-subnav" aria-label="Departments">
        {SUB_NAV.map((item) => (
          <span key={item} className="lk-subnav-item">
            {item}
          </span>
        ))}
      </nav>
    </header>
  );
}

/** People &gt; Girlfriends &gt; Bengaluru &gt; <name>. 12px, secondary. */
export function Breadcrumb({ subjectName }: { subjectName: string }) {
  const trail = ["People", "Girlfriends", "Bengaluru"];
  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        fontFamily: FONT,
        fontSize: 12,
        color: C.secondary,
        padding: "9px 0 6px",
        lineHeight: 1.5,
        overflowWrap: "anywhere",
      }}
    >
      {trail.map((step) => (
        <span key={step}>
          <span style={{ color: C.link }}>{step}</span>
          <span style={{ margin: "0 6px", color: "#B8BDBD" }}>&rsaquo;</span>
        </span>
      ))}
      <span style={{ color: C.secondary }}>{subjectName}</span>
    </nav>
  );
}

/**
 * All the chrome's CSS in one place.
 *
 * Rendered once by the template. Class-prefixed `lk-` so nothing here can
 * collide with a sibling template mounted on the same shared page.
 */
export function ChromeStyles() {
  return (
    <style>{`
      /* The offset is a variable so the editor can park it under its own
         floating bar without the two ever overlapping. */
      .lk-chrome { position: sticky; top: var(--lk-chrome-top, 0px); z-index: 60; }

      .lk-nav {
        background: ${C.header};
        display: flex; align-items: center; gap: 10px;
        padding: 0 12px; min-height: 60px;
        flex-wrap: wrap;
      }
      .lk-nav-mark { display: flex; align-items: center; gap: 6px; flex: none; }
      .lk-deliver {
        display: flex; align-items: flex-end; gap: 5px;
        font-family: ${FONT}; padding: 0 4px 8px; white-space: nowrap;
        order: 4; width: 100%;
      }

      .lk-search {
        display: flex; align-items: stretch; height: 40px;
        border-radius: 4px; overflow: hidden; background: #fff;
        flex: 1 1 260px; min-width: 0; order: 3; width: 100%;
        margin-bottom: 8px;
      }
      .lk-search-cat {
        display: inline-flex; align-items: center; gap: 4px;
        padding: 0 9px; background: ${C.section};
        border-right: 1px solid ${C.border};
        font-family: ${FONT}; font-size: 12px; color: ${C.text};
        flex: none; white-space: nowrap;
      }
      .lk-search-input {
        flex: 1 1 auto; min-width: 0; border: 0; outline: none;
        padding: 0 10px; font-family: ${FONT}; font-size: 14px; color: ${C.text};
        background: #fff;
      }
      .lk-search-input::placeholder { color: #7a7f7f; }
      .lk-search-btn {
        flex: none; width: 46px; border: 0; cursor: pointer;
        background: linear-gradient(180deg, ${C.ctaYellow}, ${C.ctaOrange});
        display: grid; place-items: center;
      }

      .lk-nav-right { display: flex; align-items: center; gap: 2px; margin-left: auto; flex: none; }
      .lk-cart {
        position: relative; display: inline-flex; align-items: flex-end; gap: 3px;
        padding: 4px 7px; color: #fff; font-family: ${FONT}; font-size: 13.5px; font-weight: 700;
      }
      .lk-cart-count {
        position: absolute; top: -1px; left: 17px;
        color: ${C.ctaYellow}; font-size: 15px; font-weight: 800; line-height: 1;
      }
      .lk-cart-word { display: none; }
      .lk-cart-bump { animation: lk-cart-pop 420ms ease-out; }
      @keyframes lk-cart-pop {
        0% { transform: none; }
        35% { transform: translateY(-4px) scale(1.12); }
        100% { transform: none; }
      }

      .lk-subnav {
        background: ${C.subHeader}; min-height: 39px;
        display: flex; align-items: center; gap: 4px;
        padding: 0 8px; overflow-x: auto; scrollbar-width: none;
        -webkit-overflow-scrolling: touch;
      }
      .lk-subnav::-webkit-scrollbar { display: none; }
      .lk-subnav-item {
        font-family: ${FONT}; font-size: 13.5px; color: #fff;
        padding: 6px 9px; border: 1px solid transparent; border-radius: 2px;
        white-space: nowrap; flex: none;
      }

      @media (min-width: 820px) {
        .lk-nav { flex-wrap: nowrap; gap: 4px; }
        .lk-deliver { order: 0; width: auto; padding: 4px 6px; }
        .lk-search { order: 0; width: auto; margin-bottom: 0; flex: 1 1 auto; max-width: 900px; }
        .lk-cart-word { display: inline; }
        .lk-cart-count { left: 20px; }
      }

      @media (prefers-reduced-motion: reduce) {
        .lk-cart-bump { animation: none; }
      }
    `}</style>
  );
}
