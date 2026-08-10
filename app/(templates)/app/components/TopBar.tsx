// ─── TopBar — 44px of sticky chrome ──────────────────────────────────────────
//
// The bar that sells the illusion, and the bar most likely to get the template
// taken down if it is built carelessly. It imitates no vendor: the centre mark
// is a plain line-art shopfront (awning, doorway) drawn here in six path
// commands, the label is the sender's own name plus the word "Store", and the
// two glyphs are the generic chevron and the generic box-with-an-arrow that
// every operating system in the world has drawn some version of.
//
// ── THE BACK CHEVRON IS DECORATIVE, ON PURPOSE ───────────────────────────────
//
// There is no `onBack` in the props, and a chevron wired to `history.back()`
// from inside a shared page is worse than no chevron at all — a recipient who
// taps it lands wherever they came from, which is usually a messaging app. So
// it is `aria-hidden` and not a button. A control that lies about what it does
// fails an audit; a drawn shape that never claimed to be a control does not.
//
// ── TRANSLUCENCY ─────────────────────────────────────────────────────────────
//
// The blur is a progressive enhancement: the background colour underneath it is
// already 88% white, so a browser without `backdrop-filter` gets a near-solid
// bar rather than text over screenshots.

"use client";

import { AP, AP_GUTTER, AP_TAP } from "./theme";

/**
 * "Meera" → "Meera Store"; "Meera Store" → "Meera Store".
 *
 * The prop is a sender's name in every real call, but the parent may already
 * have suffixed it, and "Meera Store Store" in the chrome is the kind of detail
 * that a reader notices before anything else on the page.
 */
function storeLabel(storeName: string): string {
  const trimmed = storeName.trim();
  if (!trimmed) return "Store";
  return /\bstore$/i.test(trimmed) ? trimmed : `${trimmed} Store`;
}

/** Generic back chevron. Stroked, round caps, no vendor's proportions. */
function Chevron() {
  return (
    <svg width="11" height="18" viewBox="0 0 11 18" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M9.5 1.5L2 9l7.5 7.5"
        stroke={AP.accent}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Generic share glyph: an open box with an arrow leaving through the top. */
function ShareGlyph() {
  return (
    <svg width="18" height="20" viewBox="0 0 18 20" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M9 1.5v11M9 1.5L5.6 4.9M9 1.5l3.4 3.4"
        stroke={AP.accent}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 7.5H3a1.5 1.5 0 00-1.5 1.5v8A1.5 1.5 0 003 18.5h12a1.5 1.5 0 001.5-1.5V9A1.5 1.5 0 0015 7.5h-1.5"
        stroke={AP.accent}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** The line-art mark in the pill: an awning over a doorway. Six commands. */
function StorefrontMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M2.4 6.2v7.4h11.2V6.2"
        stroke={AP.accent}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1.4 6.2l1.5-3.8h10.2l1.5 3.8"
        stroke={AP.accent}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.4 13.6V9.6h3.2v4"
        stroke={AP.accent}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TopBar({
  storeName,
  onShare,
  /**
   * Where this bar comes to rest when the page scrolls.
   *
   * Zero on the recipient's page, which is the whole viewport. In the editor a
   * floating Back/Create bar is fixed above the template, so this bar has to
   * stop underneath it — sticking at 0 there would slide the store name behind
   * the editor chrome the moment the reader scrolls.
   */
  stickyTop = 0,
}: {
  storeName: string;
  onShare: () => void;
  stickyTop?: number;
}) {
  return (
    <header
      style={{
        position: "sticky",
        top: stickyTop,
        zIndex: 30,
        height: AP_TAP,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: AP_GUTTER - 12,
        paddingRight: AP_GUTTER - 12,
        // 88% white under the blur, so a browser without `backdrop-filter`
        // still gets a legible bar rather than text over a screenshot.
        background: "rgba(255, 255, 255, 0.88)",
        backdropFilter: "saturate(180%) blur(20px)",
        WebkitBackdropFilter: "saturate(180%) blur(20px)",
        borderBottom: `1px solid ${AP.edge}`,
        fontFamily: AP.font,
      }}
    >
      {/* Decorative — see the note at the top of this file. */}
      <span
        aria-hidden="true"
        style={{
          width: AP_TAP,
          height: AP_TAP,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flex: "none",
        }}
      >
        <Chevron />
      </span>

      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          minWidth: 0,
          height: 26,
          padding: "0 10px",
          borderRadius: 13,
          background: AP.card,
          border: `1px solid ${AP.edge}`,
        }}
      >
        <StorefrontMark />
        <span
          style={{
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "-0.01em",
            color: AP.ink,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {storeLabel(storeName)}
        </span>
      </span>

      <button
        type="button"
        onClick={onShare}
        aria-label="Share"
        style={{
          width: AP_TAP,
          height: AP_TAP,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flex: "none",
          padding: 0,
          margin: 0,
          border: "none",
          background: "transparent",
          cursor: "pointer",
          touchAction: "manipulation",
          WebkitTapHighlightColor: "transparent",
        }}
      >
        <ShareGlyph />
      </button>
    </header>
  );
}

export default TopBar;
