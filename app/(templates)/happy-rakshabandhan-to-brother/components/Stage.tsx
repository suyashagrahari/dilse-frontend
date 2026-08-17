"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { Toran } from "./Ornaments";

/** Matches the 1024px breakpoint in `rakhi.css`. Change one, change the other. */
const DESKTOP = "(min-width: 1024px)";

// Module scope so the identities are stable — a `subscribe` recreated per render
// makes useSyncExternalStore tear down and re-add the listener every time.
const subscribe = (onChange: () => void) => {
  const mq = window.matchMedia(DESKTOP);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
};
const getSnapshot = () => window.matchMedia(DESKTOP).matches;
const getServerSnapshot = () => false;

/**
 * True once the viewport is at the two-column breakpoint.
 *
 * `useSyncExternalStore` rather than `useState` + an effect, because the
 * viewport is exactly what it is for: state that lives outside React and that
 * the server cannot know. It reads `false` during the server render and the
 * hydration pass, then swaps to the real value — which is the one arrangement
 * React does not treat as a hydration mismatch. Reading `matchMedia` directly in
 * the render body would produce two different trees and throw the server HTML
 * away; setting state in an effect gets the same answer but trips
 * `react-hooks/set-state-in-effect` and costs a cascading render.
 *
 * Use this ONLY for what CSS genuinely cannot express — a pixel size that has to
 * reach a component as a prop, like `ArchFrame`'s. Anything a media query can
 * say belongs in the stylesheet.
 */
export function useIsDesktop(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

// ─── One layout, two shapes ──────────────────────────────────────────────────
//
// Every screen in this template is the same three things: a small heading, a
// piece of artwork, and a column of words ending in a button. On a phone they
// stack. On a desktop the artwork moves to its own column on the left and the
// words sit beside it, which is the entire desktop redesign.
//
// ── WHY SLOTS AND NOT TWO COMPONENTS ────────────────────────────────────────
//
// The obvious version of "make it good on desktop" is a `<CoverDesktop>` beside
// a `<CoverMobile>`, five times over. That doubles the number of places every
// future copy change has to land, and the two halves drift within a release —
// somebody fixes a typo on the phone and nobody sees the laptop for a month.
//
// So there is one tree and CSS decides its shape. `head`, `art` and `body` are
// laid out with `grid-template-areas`, which is the one layout primitive that
// can reorder children between breakpoints without touching the DOM:
//
//     phone     "head"  "art"  "body"      (one column, in that order)
//     desktop   "art head"                 (art spans both rows, left)
//               "art body"
//
// ── WHY NOT A JS BREAKPOINT ─────────────────────────────────────────────────
//
// `useMediaQuery` would let us branch in JS and render each shape properly. It
// also renders the phone shape on the server and the desktop shape on the
// client, and React logs a hydration mismatch and throws the server HTML away.
// CSS gets this right on the first paint, before hydration exists.
//
// ── WHY EVERY SCREEN STILL OWNS ITS OWN CTA ─────────────────────────────────
//
// The button is in `body`, not a `cta` slot, because on a phone it belongs at
// the bottom of the flow and on desktop it belongs directly under the text —
// which is the same position in both. A dedicated slot would only add a prop.

/**
 * "Go back one step." Rendered under the primary action on every screen that
 * has somewhere to return to.
 *
 * ── WHY IT IS DOWN HERE AND NOT A TOP-LEFT ARROW ────────────────────────────
 *
 * The obvious place is a ← in the top-left corner. That corner is already taken
 * on the builder route by the fixed bar's "back to templates" button, and two
 * back arrows a few pixels apart that do completely different things — one
 * leaves the template, one rewinds the ritual — is the kind of thing people only
 * discover by losing their work.
 *
 * Under the CTA it sits exactly where the reader's attention already is after
 * they have decided not to go forward, and it cannot be confused with anything.
 * Deliberately quiet: text-weight, no fill, no border. It is an escape hatch,
 * not an invitation to bounce between screens.
 */
export function BackLink({ onClick, label = "Peeche" }: { onClick: () => void; label?: string }) {
  return (
    <button
      onClick={onClick}
      className="rb-back"
      style={{
        minHeight: 44,
        padding: "8px 16px",
        borderRadius: 999,
        background: "transparent",
        border: "none",
        color: "rgba(138,111,94,0.95)",
        fontSize: 13,
        cursor: "pointer",
        alignSelf: "inherit",
      }}
    >
      ← {label}
    </button>
  );
}

export default function Stage({
  head,
  art,
  body,
  /**
   * Extra decoration that must sit BEHIND the grid and bleed past its padding —
   * a rangoli, a toran. Positioned absolutely by the caller.
   */
  behind,
  /** Painted OVER the grid — the page-turn sweep, a petal fall. */
  overlay,
  className,
}: {
  head?: ReactNode;
  /**
   * Optional. A screen with no artwork — the ritual, which shows a card and
   * nothing else until you tap — collapses to ONE centred column at every
   * width instead of leaving half a desktop grid empty beside the text.
   */
  art?: ReactNode;
  body: ReactNode;
  behind?: ReactNode;
  overlay?: ReactNode;
  className?: string;
}) {
  return (
    <section className={`rb-root rb-screen${className ? ` ${className}` : ""}`}>
      {/* ── The toran, on every screen ────────────────────────────────────────
       *
       * It used to hang on the cover and the memories screen only, so the ritual,
       * the gift and the promise opened on a bare cream field and read as a
       * different, plainer site than the one you arrived at.
       *
       * It lives here rather than in each screen for the reason it drifted in the
       * first place: a garland that five files have to remember to hang is a
       * garland that four of them will eventually forget. Every screen gets it by
       * construction, and `.rb-screen`'s top padding reserves its 92px so nothing
       * is ever laid out underneath it. */}
      <Toran />
      {behind}
      {/* Without a head the desktop grid would leave row 1 empty and drop the
          text half a column down. The modifier lets `.rb-body` span both rows
          instead — see rakhi.css. */}
      <div
        className={[
          "rb-screen-grid",
          head ? "" : "rb-screen-grid--nohead",
          art ? "" : "rb-screen-grid--noart",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {head ? <div className="rb-head">{head}</div> : null}
        {art ? <div className="rb-art">{art}</div> : null}
        <div className="rb-body">{body}</div>
      </div>
      {overlay}
    </section>
  );
}
