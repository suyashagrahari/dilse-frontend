"use client";

// ─── The loader a recipient sees before their page opens ─────────────────────
//
// Somebody is handed a link by a person they care about, taps it, and waits.
// What they waited on before was a bouncing gift emoji, a generic grey spinner
// and "Unwrapping your surprise..." on a rose gradient — a screen that belonged
// to no product in particular. It is the only moment SubhSandesh is guaranteed
// to have this person's full attention, and it was spending it on nothing.
//
// So this is the brand lockup from the site footer, played as a sequence: the
// mark drops onto its plate, the wordmark resolves letter by letter, DIGITAL
// CELEBRATIONS fades up, शुभ संदेश after it, and a highlight sweeps once across
// the finished name as the bar reaches the end. Nothing is asked of the viewer.
// No button, no offer, no pricing, no "sign up" — a recipient is not a lead, and
// a page a friend sent should not open with a pitch in front of it. The
// advertisement IS the lockup: they learn the name, the typeface and the colour
// in the seconds they were going to spend waiting anyway.
//
// ── THE SEQUENCE HAS AN END, AND THAT END IS WHEN THE PAGE OPENS ────────────
//
// Every stage finishes. Nothing here loops except the arc, which is texture.
// The sheen makes ONE pass and the bar FILLS rather than sliding back and
// forth, so there is a real moment when the loader is finished instead of a set
// of loops cut off whenever the network happened to answer — which is what used
// to produce a highlight frozen halfway across the name.
//
// Every one of those timings comes from `lib/share/loaderHold`, written onto
// this element as CSS custom properties. The wait that holds the page back is
// computed from the same table, so the animation and the wait cannot disagree.
// Before that, the CSS held its own copy of the delays and a comment did the
// arithmetic — and it was wrong within a day.
//
// ── WHY THE ANIMATION IS CSS AND NOT JAVASCRIPT ─────────────────────────────
//
// A letter-scramble effect — glyphs shuffling until they settle into the name —
// needs a JS timer running at frame rate. This screen is on-stage during
// exactly the two things that must not be starved: the share fetch and the
// parse of a ~40KB viewer chunk. A rAF loop swapping text nodes competes with
// both on the main thread, and the result of winning that fight is that the
// page the person is waiting for arrives LATER.
//
// Every animation here is therefore CSS on 'transform', 'opacity' and 'width'
// only. The wordmark still resolves — each letter rises out of a blur on its
// own delay, which reads as decoding.
//
// Dark mode is a real variant, not an inversion: many of the 43 templates open
// on a dark stage, and a cream flash before one of those is a jolt.

import { useEffect, useState } from "react";
import { BRAND } from "@/lib/brand";
import { letterDelayMs, loaderCssVars } from "@/lib/share/loaderHold";

const WORDMARK = "SubhSandesh";

// ─── The reveal plays ONCE per page load ─────────────────────────────────────
//
// A recipient can go through two waits: the share fetch, then the viewer's own
// JavaScript chunk. Both show this screen, which is deliberate — two different
// loading screens back to back make one page feel like two failed ones. But the
// second one is a fresh MOUNT, and a CSS animation runs on mount, so the letters
// resolved, settled, and then resolved again. Now that the first wait is held
// long enough for the whole sequence to finish, that replay would be the most
// visible thing on the screen.
//
// So the first mount plays the sequence and every later mount renders the
// finished lockup, which is what makes the waits read as one continuous loader.
// Module scope is exactly the right lifetime: it resets on a real page load,
// which is when a recipient should see the sequence again.
let introPlayed = false;

export default function BrandLoader({
  /**
   * One short line, only where the wait has a specific meaning — the password
   * gate checking a code, say. Left off by default: "Loading" under a loading
   * animation is words for their own sake.
   */
  note,
}: {
  note?: string;
} = {}) {
  // ── WHY THERE IS NO 'inline' VARIANT ──────────────────────────────────────
  //
  // There was one, with minHeight 100%, and the first thing it did was break
  // the caller it was written for. next/dynamic's loading component renders
  // where the component itself would — for a full-page viewer that is the page
  // body, which has no height of its own, so 100% resolves to ZERO and the
  // loader disappears entirely. Both places this is used are the whole screen,
  // so it is the whole screen, and there is no option to get that wrong.

  // Read during render, written in an effect. Writing it during render would
  // make React's double-invoked render in development mark the FIRST mount as
  // already-played and skip the sequence it is there to show.
  const [settled] = useState(() => introPlayed);
  useEffect(() => {
    introPlayed = true;
  }, []);

  return (
    <div
      className={settled ? "ssbl-host ssbl-settled" : "ssbl-host"}
      role="status"
      aria-live="polite"
      aria-label="Loading this page"
      // ── NO BACKGROUND HERE ────────────────────────────────────────────────
      //
      // It used to be 'background: BRAND.bg' inline, and an inline style beats
      // any stylesheet rule that is not !important — so the dark-mode block
      // below could never repaint it. On a phone in dark mode the result was
      // the cream background with the DARK palette's near-white wordmark on top
      // of it: an invisible brand name, which is the single worst thing this
      // screen could do. The colour lives in CSS now, where the media query can
      // reach it. The custom properties are the timing table — see the header.
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        padding: 24,
        ...loaderCssVars(),
      } as React.CSSProperties}
    >
      <style>{`
        .ssbl-host {
          position: relative;
          overflow: hidden;
          /* Painted rather than transparent: this sits in front of whatever
             the template's own background is about to be. */
          background-color: ${BRAND.bg};
          /* Corner glows, at the low alpha the landing uses. Two radials, no
             extra elements and nothing to load. */
          background-image:
            radial-gradient(60% 50% at 12% 0%, rgba(201,168,76,0.16), transparent 70%),
            radial-gradient(55% 45% at 100% 100%, rgba(61,12,17,0.10), transparent 70%);
        }

        .ssbl-stack { text-align: center; max-width: 320px }

        /* ── The mark, inside a turning arc ─────────────────────────────── */
        .ssbl-ring {
          width: 104px; height: 104px; margin: 0 auto 22px;
          position: relative;
        }
        /* ── WHY THE ARC IS ITS OWN ELEMENT ───────────────────────────────
           The mask that carves the conic gradient into a 3px band lives here
           and NOT on .ssbl-ring, because a CSS mask clips every DESCENDANT of
           the element it is set on — not just that element's own paint. With
           the mask on the ring, the plate and the logo inside it were masked
           away too: the composition rendered as an empty gold circle with
           nothing in the middle. Found by rendering it and looking; the DOM
           said the logo was loaded (naturalWidth 1280) and sitting exactly
           where it belonged, which is what ruled out every other cause.

           The arc is also the only thing that spins, which is what the plate
           needs — a logo rotating inside its own ring reads as a broken GIF.
           It is the one intentional loop on this screen: ambient texture that
           says 'still working', not part of the reveal. */
        .ssbl-arc {
          position: absolute; inset: 0; border-radius: 50%;
          background: conic-gradient(from 0deg,
            rgba(201,168,76,0) 0deg,
            rgba(201,168,76,0.08) 120deg,
            rgba(201,168,76,0.55) 260deg,
            #c9a84c 330deg,
            rgba(201,168,76,0) 360deg);
          -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px));
          mask: radial-gradient(farthest-side, transparent calc(100% - 3px), #000 calc(100% - 3px));
          animation: ssblSpin 1.6s linear infinite;
        }
        /* The plate the logo sits on: a sibling of the arc, so nothing clips
           it, and it drops in on its own cue rather than pulsing forever. */
        .ssbl-plate {
          position: absolute; inset: 11px; border-radius: 50%;
          background: ${BRAND.surface};
          box-shadow: 0 6px 20px -8px rgba(61,12,17,0.28);
          display: grid; place-items: center;
          animation: ssblPlateIn var(--ssbl-plate-dur) cubic-bezier(0.16,1,0.3,1) var(--ssbl-plate-in) both;
        }
        .ssbl-plate img { width: 54px; height: 54px; object-fit: contain; display: block }

        /* ── The wordmark, resolving ────────────────────────────────────── */
        .ssbl-word {
          /* The fallback goes INSIDE var(). A 'var(--x)' that resolves to
             nothing makes the entire font-family declaration invalid at
             computed-value time — it does not skip to the next family in the
             list — and the wordmark silently drops to the system sans, which
             is what a probe of the rendered page actually reported. */
          font-family: var(--font-playfair, 'Playfair Display'), 'Playfair Display', Georgia, serif;
          font-size: 27px; font-weight: 700; letter-spacing: -0.4px;
          color: #1a0507; line-height: 1;
          display: flex; justify-content: center;
          position: relative;
        }
        .ssbl-word span {
          display: inline-block;
          animation: ssblResolve var(--ssbl-letter-dur) cubic-bezier(0.16,1,0.3,1) both;
        }
        /* Specific enough to WIN. As a bare '.ssbl-sheen' it lost the
           animation shorthand to '.ssbl-word span' — one class plus a type
           selector outranks one class — so the sheen inherited the letters'
           animation, kept their opacity 0, and never appeared at all.

           ONE pass, ending with the bar. This is the finale, and it used to be
           an infinite loop that the page interrupted halfway across the name. */
        .ssbl-word .ssbl-sheen {
          position: absolute; inset: 0; pointer-events: none;
          background: linear-gradient(100deg,
            transparent 38%, rgba(201,168,76,0.9) 50%, transparent 62%);
          background-size: 260% 100%;
          background-position: 130% 0;
          -webkit-background-clip: text; background-clip: text;
          color: transparent;
          animation: ssblSheen var(--ssbl-sheen-dur) ease-in-out var(--ssbl-sheen-in) both;
        }

        .ssbl-sub {
          margin: 9px 0 0; font-size: 10.5px; font-weight: 700;
          letter-spacing: 0.15em; text-transform: uppercase;
          color: rgba(201,168,76,0.95);
          animation: ssblFade var(--ssbl-sub-dur) ease var(--ssbl-sub-in) both;
        }

        /* ── The bar: a fill, not a shuttle ─────────────────────────────────
           It fills once, left to right, finishing exactly when the rest of the
           sequence does — so the bar reaching the end IS the page opening, and
           the two read as one motion rather than as an interruption.

           If the network has not answered by then, it hands off to the
           indeterminate slide underneath. That case is honest: a full bar
           sitting still while nothing happens is a lie, and a bar that is
           still moving is the truth. */
        .ssbl-bar {
          width: 132px; height: 2px; margin: 16px auto 0;
          border-radius: 2px; overflow: hidden;
          background: rgba(61,12,17,0.10);
          position: relative;
        }
        .ssbl-bar i { display: block; position: absolute; inset: 0 auto 0 0; height: 100%; border-radius: 2px }
        .ssbl-fill {
          width: 100%;
          background: linear-gradient(90deg, rgba(201,168,76,0.35), #c9a84c);
          transform-origin: left center;
          animation:
            ssblFill var(--ssbl-bar-dur) cubic-bezier(0.33,0.1,0.25,1) var(--ssbl-bar-in) both,
            ssblOut 240ms linear var(--ssbl-seq-end) both;
        }
        .ssbl-slide {
          width: 42%;
          background: linear-gradient(90deg, rgba(201,168,76,0.25), #c9a84c, rgba(201,168,76,0.25));
          opacity: 0;
          animation:
            ssblIn 240ms linear var(--ssbl-seq-end) both,
            ssblShuttle 1.35s ease-in-out var(--ssbl-seq-end) infinite;
        }

        .ssbl-deva {
          margin: 16px 0 0;
          font-family: var(--font-tiro-devanagari, 'Tiro Devanagari Hindi'), 'Tiro Devanagari Hindi', serif;
          font-size: 15px; color: rgba(201,168,76,0.9); letter-spacing: 0.05em;
          animation: ssblFade var(--ssbl-deva-dur) ease var(--ssbl-deva-in) both;
        }

        .ssbl-note {
          margin: 12px 0 0; font-size: 12px; color: ${BRAND.muted}; line-height: 1.5;
        }

        .ssbl-domain {
          position: absolute; left: 0; right: 0; bottom: calc(20px + env(safe-area-inset-bottom, 0px));
          margin: 0; text-align: center;
          font-size: 10.5px; font-weight: 600; letter-spacing: 0.1em;
          text-transform: uppercase; color: rgba(61,12,17,0.30);
        }

        @keyframes ssblSpin    { to { transform: rotate(360deg) } }
        @keyframes ssblPlateIn {
          0%   { opacity: 0; transform: scale(0.72) }
          100% { opacity: 1; transform: scale(1) }
        }
        @keyframes ssblResolve {
          0%   { opacity: 0; transform: translateY(8px); filter: blur(6px) }
          100% { opacity: 1; transform: translateY(0);   filter: blur(0) }
        }
        @keyframes ssblSheen   { from { background-position: 130% 0 } to { background-position: -130% 0 } }
        @keyframes ssblFade    { from { opacity: 0 } to { opacity: 1 } }
        @keyframes ssblFill    { from { transform: scaleX(0) } to { transform: scaleX(1) } }
        @keyframes ssblOut     { to { opacity: 0 } }
        @keyframes ssblIn      { to { opacity: 1 } }
        @keyframes ssblShuttle {
          0%   { transform: translateX(-115%) }
          100% { transform: translateX(275%) }
        }

        /* ── A remount shows the lockup already landed ──────────────────
           Two classes deep on purpose: '.ssbl-word span' is a class plus a
           type selector, so a single-class rule would lose to it and the
           letters would animate all over again. */
        .ssbl-settled .ssbl-word span,
        .ssbl-settled .ssbl-sub,
        .ssbl-settled .ssbl-deva,
        .ssbl-settled .ssbl-plate {
          animation: none;
          opacity: 1;
        }
        .ssbl-settled .ssbl-word span { filter: none; transform: none }
        .ssbl-settled .ssbl-plate { transform: none }
        /* The sheen has had its pass; on a remount the bar is the only thing
           left saying 'still working', so it goes straight to the shuttle. */
        .ssbl-settled .ssbl-word .ssbl-sheen { animation: none; opacity: 0 }
        .ssbl-settled .ssbl-fill  { animation: none; opacity: 0 }
        .ssbl-settled .ssbl-slide { animation: ssblShuttle 1.35s ease-in-out infinite; opacity: 1 }

        /* ── Dark stage ─────────────────────────────────────────────────────
           A real variant. Many of the 43 templates open dark, and flashing
           cream in front of one of those is a jolt rather than a transition. */
        @media (prefers-color-scheme: dark) {
          .ssbl-host {
            background-color: #140406;
            background-image:
              radial-gradient(60% 50% at 12% 0%, rgba(201,168,76,0.14), transparent 70%),
              radial-gradient(55% 45% at 100% 100%, rgba(201,168,76,0.07), transparent 70%);
          }
          /* ── The plate does NOT go dark ─────────────────────────────────
             It did, and the mark vanished into it: logo.webp is a fixed
             bitmap in deep maroon, so a dark plate leaves a dark mark on a
             dark disc. The plate is the mark's background, not the page's, and
             its job is to give that one bitmap the contrast it was drawn for —
             which is why it stays light in both modes and only its shadow
             changes. Visible only by rendering the dark variant and looking
             at it. */
          .ssbl-plate  { background: #f7ece2; box-shadow: 0 6px 24px -8px rgba(0,0,0,0.65) }
          .ssbl-word   { color: #f7ece2 }
          .ssbl-bar    { background: rgba(255,255,255,0.10) }
          .ssbl-note   { color: rgba(247,236,226,0.62) }
          .ssbl-domain { color: rgba(247,236,226,0.32) }
        }

        /* Nothing moves on its own, and everything that animated IN is simply
           there. A person who asked for less motion still gets the brand — and
           still gets the hold, because the page is not ready any sooner. */
        @media (prefers-reduced-motion: reduce) {
          .ssbl-arc, .ssbl-plate, .ssbl-word span,
          .ssbl-sub, .ssbl-deva, .ssbl-fill, .ssbl-slide {
            animation: none !important;
          }
          .ssbl-plate, .ssbl-word span, .ssbl-sub, .ssbl-deva {
            opacity: 1; transform: none; filter: none;
          }
          .ssbl-word .ssbl-sheen { display: none }
          .ssbl-fill  { opacity: 0.55 }
          .ssbl-slide { display: none }
        }
      `}</style>

      <div className="ssbl-stack">
        <div className="ssbl-ring">
          <div className="ssbl-arc" aria-hidden="true" />
          <div className="ssbl-plate">
            {/* Local, not the CDN: this has to paint in the first moment of a
                cold visit. eslint's next/image rule is waived because
                next/image adds a wrapper and a loader for a 54px mark on a
                screen that must not queue any more work. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.webp" alt="" width={54} height={54} decoding="async" />
          </div>
        </div>

        {/* Split into letters for the resolve. 'aria-label' carries the name so
            a screen reader hears one word rather than eleven letters. */}
        <div className="ssbl-word" aria-label="SubhSandesh">
          {WORDMARK.split("").map((ch, i) => (
            <span key={i} style={{ animationDelay: `${letterDelayMs(i)}ms` }} aria-hidden="true">
              {ch}
            </span>
          ))}
          <span className="ssbl-sheen" aria-hidden="true">
            {WORDMARK}
          </span>
        </div>

        <p className="ssbl-sub">Digital Celebrations</p>

        <div className="ssbl-bar" aria-hidden="true">
          <i className="ssbl-fill" />
          <i className="ssbl-slide" />
        </div>

        <p className="ssbl-deva" aria-hidden="true">शुभ संदेश</p>

        {note && <p className="ssbl-note">{note}</p>}
      </div>

      <p className="ssbl-domain">subhsandesh.in</p>
    </div>
  );
}
