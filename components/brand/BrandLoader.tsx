"use client";

// ─── The loader a recipient sees before their page opens ─────────────────────
//
// Somebody is handed a link by a person they care about, taps it, and waits.
// What they waited on before was a bouncing 🎁 emoji, a generic grey spinner
// and "Unwrapping your surprise..." on a rose gradient — a screen that belonged
// to no product in particular. It is the only moment SubhSandesh is guaranteed
// to have this person's full attention, and it was spending it on nothing.
//
// So this is the brand lockup from the site footer, rendered as a loading
// state: the mark inside a turning gold arc, the wordmark resolving letter by
// letter beneath it, DIGITAL CELEBRATIONS tracked out under that, and शुभ संदेश
// in gold. Nothing is asked of the viewer. No button, no offer, no pricing, no
// "sign up" — a recipient is not a lead, and a page a friend sent should not
// open with a pitch in front of it. The advertisement IS the lockup: they learn
// the name, the typeface and the colour, in the two seconds they were going to
// spend waiting anyway, and then their page arrives.
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
// Every animation here is therefore CSS on `transform` and `opacity` only, so
// it runs on the compositor and costs the main thread nothing. The wordmark
// still resolves — each letter rises out of a blur on its own delay, which
// reads as decoding — and the sweep across it is the progress indicator.
//
// ── AND WHY IT DOES NOT PRETEND TO KNOW PROGRESS ────────────────────────────
//
// No percentage and no filling bar. Neither the fetch nor the chunk download
// reports progress we could honestly draw, and a bar that crawls to 90% and
// waits is a worse experience than one that is plainly indeterminate.
//
// Dark mode is a real variant, not an inversion: many of the 43 templates open
// on a dark stage, and a cream flash before one of those is a jolt.

import { BRAND } from "@/lib/brand";

const WORDMARK = "SubhSandesh";

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
  // ── WHY THERE IS NO `inline` VARIANT ──────────────────────────────────────
  //
  // There was one, with `minHeight: 100%`, and the first thing it did was break
  // the caller it was written for. `next/dynamic`'s loading component renders
  // where the component itself would — for a full-page viewer that is the page
  // body, which has no height of its own, so `100%` resolves to ZERO and the
  // loader disappears entirely. Both places this is used are the whole screen,
  // so it is the whole screen, and there is no option to get that wrong.
  return (
    <div
      className="ssbl-host"
      role="status"
      aria-live="polite"
      aria-label="Loading this page"
      // ── NO BACKGROUND HERE ────────────────────────────────────────────
      //
      // It used to be `background: BRAND.bg` inline, and an inline style beats
      // any stylesheet rule that is not `!important` — so the dark-mode block
      // below could never repaint it. On a phone in dark mode the result was
      // the cream background with the DARK palette's near-white wordmark on
      // top of it: an invisible brand name, which is the single worst thing
      // this screen could do. The colour lives in CSS now, where the media
      // query can reach it.
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        padding: 24,
      }}
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
           needs — a logo rotating inside its own ring reads as a broken GIF. */
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
          animation: ssblSpin 1.5s linear infinite;
        }
        /* The plate the logo sits on: a sibling of the arc, so nothing clips it. */
        .ssbl-plate {
          position: absolute; inset: 11px; border-radius: 50%;
          background: ${BRAND.surface};
          box-shadow: 0 6px 20px -8px rgba(61,12,17,0.28);
          display: grid; place-items: center;
          animation: ssblBreathe 3.2s ease-in-out infinite;
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
          /* The sweep sits on top as its own layer: a gradient clipped to the
             text, moving by background-position rather than by a transform, so
             it costs no layout and reads as the thing in progress. */
          position: relative;
        }
        .ssbl-word span {
          display: inline-block;
          opacity: 0;
          animation: ssblResolve 620ms cubic-bezier(0.16,1,0.3,1) forwards;
        }
        /* Specific enough to WIN. As a bare '.ssbl-sheen' it lost the
           animation shorthand to '.ssbl-word span' — one class plus a type
           selector outranks one class — so the sheen inherited the letters'
           animation, kept their 'opacity: 0', and never appeared at all. */
        .ssbl-word .ssbl-sheen {
          position: absolute; inset: 0; pointer-events: none;
          background: linear-gradient(100deg,
            transparent 38%, rgba(201,168,76,0.85) 50%, transparent 62%);
          background-size: 260% 100%;
          -webkit-background-clip: text; background-clip: text;
          color: transparent;
          animation: ssblSheen 2.6s ease-in-out 900ms infinite;
        }

        .ssbl-sub {
          margin: 9px 0 0; font-size: 10.5px; font-weight: 700;
          letter-spacing: 0.15em; text-transform: uppercase;
          color: rgba(201,168,76,0.95);
          opacity: 0; animation: ssblFade 500ms ease 760ms forwards;
        }

        /* ── The indeterminate line ─────────────────────────────────────── */
        .ssbl-bar {
          width: 132px; height: 2px; margin: 16px auto 0;
          border-radius: 2px; overflow: hidden;
          background: rgba(61,12,17,0.10);
        }
        .ssbl-bar i {
          display: block; width: 42%; height: 100%; border-radius: 2px;
          background: linear-gradient(90deg, rgba(201,168,76,0.25), #c9a84c, rgba(201,168,76,0.25));
          animation: ssblSlide 1.35s ease-in-out infinite;
        }

        .ssbl-deva {
          margin: 16px 0 0;
          font-family: var(--font-tiro-devanagari), 'Tiro Devanagari Hindi', serif;
          font-size: 15px; color: rgba(201,168,76,0.9); letter-spacing: 0.05em;
          opacity: 0; animation: ssblFade 600ms ease 1s forwards;
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

        @keyframes ssblSpin   { to { transform: rotate(360deg) } }
        @keyframes ssblBreathe{ 0%,100% { transform: scale(1) } 50% { transform: scale(0.965) } }
        @keyframes ssblResolve{
          0%   { opacity: 0; transform: translateY(7px); filter: blur(5px) }
          100% { opacity: 1; transform: translateY(0);   filter: blur(0) }
        }
        @keyframes ssblSheen  { 0% { background-position: 130% 0 } 55%,100% { background-position: -130% 0 } }
        @keyframes ssblFade   { to { opacity: 1 } }
        @keyframes ssblSlide  {
          0%   { transform: translateX(-115%) }
          100% { transform: translateX(275%) }
        }

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
           there. A person who asked for less motion still gets the brand. */
        @media (prefers-reduced-motion: reduce) {
          .ssbl-ring   { animation: none }
          .ssbl-plate  { animation: none }
          .ssbl-word .ssbl-sheen { display: none }
          .ssbl-word span { animation: none; opacity: 1 }
          .ssbl-sub, .ssbl-deva { animation: none; opacity: 1 }
          .ssbl-bar i  { animation: none; width: 100%; opacity: 0.5 }
        }
      `}</style>

      <div className="ssbl-stack">
        <div className="ssbl-ring">
          <div className="ssbl-arc" aria-hidden="true" />
          <div className="ssbl-plate">
            {/* Local, not the CDN: this has to paint in the first moment of a
                cold visit, and the ring already carries the composition if the
                bitmap has not arrived yet. eslint's next/image rule is waived
                because next/image adds a wrapper and a loader for a 46px mark
                on a screen that must not queue any more work. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.webp" alt="" width={54} height={54} decoding="async" />
          </div>
        </div>

        {/* Split into letters for the resolve. `aria-label` carries the name so
            a screen reader hears one word rather than eleven letters. */}
        <div className="ssbl-word" aria-label="SubhSandesh">
          {WORDMARK.split("").map((ch, i) => (
            <span key={i} style={{ animationDelay: `${i * 45}ms` }} aria-hidden="true">
              {ch}
            </span>
          ))}
          <span className="ssbl-sheen" aria-hidden="true">
            {WORDMARK}
          </span>
        </div>

        <p className="ssbl-sub">Digital Celebrations</p>

        <div className="ssbl-bar" aria-hidden="true"><i /></div>

        <p className="ssbl-deva" aria-hidden="true">शुभ संदेश</p>

        {note && <p className="ssbl-note">{note}</p>}
      </div>

      <p className="ssbl-domain">subhsandesh.in</p>
    </div>
  );
}
