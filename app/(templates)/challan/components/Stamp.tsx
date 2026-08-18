"use client";

// ─── Stamp — the rubber stamp that lands on a settled challan ────────────────
//
// Two texts ever reach this component: "PAID" (green) and "OBJECTION UPHELD"
// (red). It is a NOTICE mark, never a seal of any real authority — no emblem,
// no lions, no motto, no force's crest, nothing traced from a government mark.
// It is a rectangle, two rules and some letterspaced type, which is what an
// office rubber stamp actually is.
//
// ── WHY THE INK IS UNEVEN ────────────────────────────────────────────────────
// A flat, fully-opaque block of colour reads as a badge. Real stamp ink is
// semi-transparent, it multiplies into the paper underneath, its edges wobble
// and it drops out in patches where the pad was dry. Three effects stack to get
// there and all three live inside this component's own DOM so an html-to-image
// clone of any ancestor carries them along:
//
//   1. `mix-blend-mode: multiply` + ~0.7 alpha — the paper grain shows through.
//   2. An SVG filter: fractal displacement roughens every edge, then a second,
//      finer noise is composited OUT of the ink to speckle it.
//   3. A CSS radial mask — the pad pressed harder in the middle than at the
//      corners, so the corners fade.
//
// ── MOTION ───────────────────────────────────────────────────────────────────
// One shot, 400ms, and it accelerates the whole way down so it STOPS DEAD on
// contact rather than settling. On impact the page takes a 3px jolt for 160ms.
// Nothing loops, nothing replays. `animate={false}` (reduced motion, or a PNG
// capture in progress) means the stamp is simply already there — the CSS also
// self-guards on `prefers-reduced-motion` in case a caller forgets.

import { useEffect, useId } from "react";
import { CH } from "./theme";

/** Descent duration. The jolt fires at the end of it. */
const DROP_MS = 400;
const JOLT_MS = 160;

/** Deterministic, so SSR and the client pick the same noise seed. */
function seedOf(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i += 1) h = (h * 31 + text.charCodeAt(i)) % 997;
  return h;
}

/**
 * Long marks get smaller type. "PAID" is four characters and wants to be huge;
 * "OBJECTION UPHELD" is sixteen and has to survive a 380px viewport on one
 * line, because a stamp that wraps stops looking like a stamp.
 */
function typeScale(text: string): string {
  const n = text.trim().length;
  if (n <= 6) return "clamp(30px, 11vw, 52px)";
  if (n <= 12) return "clamp(19px, 6.6vw, 32px)";
  return "clamp(13px, 4.6vw, 24px)";
}

function trackingFor(text: string): string {
  return text.trim().length <= 6 ? "0.18em" : "0.09em";
}

export function Stamp({
  text,
  tone,
  animate,
  rotate = -6,
}: {
  text: string;
  tone: "green" | "red";
  animate: boolean;
  rotate?: number;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const filterId = `chStampInk${uid}`;
  const seed = seedOf(text);
  const colour = tone === "green" ? CH.green : CH.red;

  // ── The page jolt ──────────────────────────────────────────────────────────
  //
  // Fired once, at the moment of contact, on <body> — the impact has to be felt
  // by the whole page, not by the stamp, or it reads as a wobbly sticker. The
  // class is removed as soon as it has played so nothing is left on the element
  // for a later capture to clone. `matchMedia` is re-checked here because the
  // jolt is the one part a stale `animate` prop must never sneak past.
  useEffect(() => {
    if (!animate || typeof window === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;

    const body = document.body;
    const hit = window.setTimeout(() => body.classList.add("ch-jolt"), DROP_MS);
    const clear = window.setTimeout(() => body.classList.remove("ch-jolt"), DROP_MS + JOLT_MS + 40);
    return () => {
      window.clearTimeout(hit);
      window.clearTimeout(clear);
      body.classList.remove("ch-jolt");
    };
  }, [animate]);

  // Held in a CSS variable so the keyframes can start from the same angle they
  // end on — the stamp falls straight down, it does not spin into place.
  const restTransform = `rotate(${rotate}deg)`;

  return (
    <span
      style={{
        display: "inline-block",
        pointerEvents: "none",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
    >
      <style>{`
@keyframes ch-stamp-drop {
  0%   { opacity: 0; transform: var(--ch-rest) scale(2.7); }
  70%  { opacity: .78; }
  100% { opacity: 1; transform: var(--ch-rest) scale(1); }
}
@keyframes ch-jolt {
  0%   { transform: translate3d(0, 0, 0); }
  22%  { transform: translate3d(0, 3px, 0); }
  55%  { transform: translate3d(0, -2px, 0); }
  100% { transform: translate3d(0, 0, 0); }
}
/* Accelerating the whole way down, so it arrives and stops. No overshoot,
   no settle, no bounce — a hand pressing a stamp does not rebound. */
.ch-stamp-drop { animation: ch-stamp-drop ${DROP_MS}ms cubic-bezier(.55,.06,.68,.19) both; }
.ch-jolt { animation: ch-jolt ${JOLT_MS}ms ease-out both; }
.ch-static .ch-stamp-drop, .ch-static.ch-stamp-drop { animation: none !important; opacity: 1 !important; }
@media (prefers-reduced-motion: reduce) {
  .ch-stamp-drop { animation: none !important; opacity: 1 !important; transform: var(--ch-rest) !important; }
  .ch-jolt { animation: none !important; transform: none !important; }
}
`}</style>

      {/* Kept in-subtree on purpose: a filter referenced by id only survives a
          clone if its <defs> come along with the node being cloned. */}
      <svg
        width="0"
        height="0"
        aria-hidden="true"
        focusable="false"
        style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
      >
        <defs>
          <filter id={filterId} x="-25%" y="-35%" width="150%" height="170%" colorInterpolationFilters="sRGB">
            {/* Coarse noise → wobbly edges, as if the rubber was not flat. */}
            <feTurbulence type="fractalNoise" baseFrequency="0.052 0.09" numOctaves="4" seed={seed} result="coarse" />
            <feDisplacementMap
              in="SourceGraphic"
              in2="coarse"
              scale="3.2"
              xChannelSelector="R"
              yChannelSelector="G"
              result="wobbled"
            />
            {/* Fine noise, thresholded into an alpha mask and punched OUT of the
                ink — this is the dry-pad speckle. */}
            <feTurbulence type="fractalNoise" baseFrequency="0.78" numOctaves="2" seed={seed + 17} result="fine" />
            <feColorMatrix
              in="fine"
              type="matrix"
              values="0 0 0 0 0
                      0 0 0 0 0
                      0 0 0 0 0
                      1.35 0 0 0 -0.72"
              result="speckle"
            />
            <feComposite in="wobbled" in2="speckle" operator="out" />
          </filter>
        </defs>
      </svg>

      <span
        className={animate ? "ch-stamp-drop" : undefined}
        style={
          {
            "--ch-rest": restTransform,
            display: "block",
            transform: restTransform,
            transformOrigin: "50% 50%",
            filter: `url(#${filterId})`,
            mixBlendMode: "multiply",
          } as React.CSSProperties
        }
      >
        <span
          style={{
            position: "relative",
            display: "block",
            padding: "10px 20px 11px",
            border: `3.5px solid ${colour}`,
            borderRadius: 10,
            opacity: 0.72,
            // The pad pressed hardest in the middle. Corners lose ink.
            WebkitMaskImage:
              "radial-gradient(115% 145% at 42% 38%, #000 0%, #000 54%, rgba(0,0,0,.72) 76%, rgba(0,0,0,.42) 100%)",
            maskImage:
              "radial-gradient(115% 145% at 42% 38%, #000 0%, #000 54%, rgba(0,0,0,.72) 76%, rgba(0,0,0,.42) 100%)",
          }}
        >
          <span
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 3.5,
              border: `1.5px solid ${colour}`,
              borderRadius: 6,
            }}
          />
          <span
            style={{
              position: "relative",
              display: "block",
              fontFamily: CH.serif,
              fontSize: typeScale(text),
              lineHeight: 1.02,
              fontWeight: 800,
              letterSpacing: trackingFor(text),
              // Letterspacing pads the right edge; pull it back so the mark
              // stays optically centred inside its rules.
              textIndent: trackingFor(text),
              color: colour,
              whiteSpace: "nowrap",
              textAlign: "center",
              textTransform: "uppercase",
            }}
          >
            {text}
          </span>
        </span>
      </span>
    </span>
  );
}

export default Stamp;
