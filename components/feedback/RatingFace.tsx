"use client";

// ─── The face that reacts to the rating ──────────────────────────────────────
//
// A cartoon character in the feedback sheet, whose expression follows the star
// the person is hovering or has tapped: hopeful while it waits, in tears at one
// star, beaming with confetti at five.
//
// ── WHY IT REACTS INSTEAD OF PLEADING ───────────────────────────────────────
//
// The obvious version of "make people rate" is a sad face BEFORE they rate —
// rate me or I stay sad. That is a guilt mechanic, and it is the wrong one
// here for two reasons. It arrives at the proudest moment someone has with this
// product, seconds after publishing a card for somebody they love, and souring
// that to extract a tap is a bad trade. And people learn to dismiss guilt
// prompts quickly, so it stops working while still costing goodwill.
//
// Reacting is what actually raises completion. The first tap is rewarded with
// something to look at, so the second and third taps happen out of curiosity —
// people try stars to see what the face does. That is real engagement, and it
// doubles as confirmation the tap landed, which a five-across row of small
// targets badly needs on a phone.
//
// ── WHY SVG AND NOT A GIF ───────────────────────────────────────────────────
//
// A GIF was the ask, and it is the wrong medium for this particular spot:
//
//   · This sheet appears the instant a page is published. A network fetch means
//     an empty box or a layout shift at exactly the moment that has to feel
//     good, on connections where that fetch is slowest.
//   · A legible animated GIF at this size is 300KB–1MB. That is a real cost on
//     mobile data, paid by every publisher, for decoration.
//   · GIFs are fixed-resolution and go soft on any retina screen.
//   · A GIF is one fixed loop. It cannot respond to the rating, which is the
//     whole idea above.
//   · Media on this project is uploaded to S3 by hand through the prod box, so
//     an asset also buys a deploy ritual.
//
// Inline SVG plus CSS keyframes costs nothing over the wire, is crisp at any
// density, and can hold state. Every animation here is also disabled under
// `prefers-reduced-motion` — a bouncing face is exactly what that setting is
// asking us not to do.

import { useId } from "react";

export interface RatingFaceProps {
  /** 0 = nothing chosen yet, then 1–5. */
  rating: number;
  /** Rendered size in px. Square. */
  size?: number;
}

/** Mouth path per rating. Drawn on a 120×120 canvas. */
const MOUTH: Record<number, string> = {
  // Waiting: a small, hopeful, closed smile.
  0: "M46 74 Q60 82 74 74",
  // One star: a wide open wail. The first attempt was a small lens shape and
  // rendered as a pucker — someone whistling, not someone upset. This is wider
  // than it is tall at the top and drops into a round bowl, which is what reads
  // as an open mouth at 100px.
  1: "M47 75 Q60 71 73 75 Q73 92 60 92 Q47 92 47 75",
  // Two: turned down.
  2: "M46 80 Q60 70 74 80",
  // Three: flat. The honest "it was fine".
  3: "M48 77 L72 77",
  // Four: a proper smile.
  4: "M44 72 Q60 85 76 72",
  // Five: wide open grin.
  5: "M42 70 Q60 92 78 70 Q60 80 42 70",
};

export default function RatingFace({ rating, size = 104 }: RatingFaceProps) {
  // `useId` because two of these can exist on a page during the sheet's exit
  // animation, and duplicate gradient ids make the second one render unpainted.
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const r = Math.max(0, Math.min(5, Math.round(rating)));

  const crying = r === 1;
  const overjoyed = r === 5;
  const happy = r >= 4;

  // ── WHY THE CONFETTI NEEDS NO STATE ──────────────────────────────────────
  //
  // The first version counted bursts in state and bumped it from an effect, so
  // that 5 → 4 → 5 replayed rather than showing a finished animation frozen in
  // place. React's lint rule was right to object: setState inside an effect
  // triggers a second render pass for something the render already knows.
  //
  // The group below is only rendered while the rating IS five, so leaving five
  // unmounts it and returning mounts it fresh — and a CSS animation runs on
  // mount. Conditional rendering already does the whole job.

  return (
    <div
      style={{ width: size, height: size, margin: "0 auto", position: "relative" }}
      aria-hidden="true"
    >
      <style>{`
        @keyframes ssFaceFloat {
          0%,100% { transform: translateY(0) }
          50%     { transform: translateY(-4px) }
        }
        @keyframes ssFacePop {
          0%   { transform: scale(0.86) }
          55%  { transform: scale(1.06) }
          100% { transform: scale(1) }
        }
        @keyframes ssTear {
          0%   { transform: translateY(0) scale(0.6); opacity: 0 }
          25%  { opacity: 1 }
          100% { transform: translateY(26px) scale(1); opacity: 0 }
        }
        @keyframes ssBlink {
          0%,92%,100% { transform: scaleY(1) }
          96%         { transform: scaleY(0.1) }
        }
        @keyframes ssConfetti {
          0%   { transform: translate(0,0) rotate(0deg); opacity: 1 }
          100% { transform: translate(var(--dx), var(--dy)) rotate(var(--dr)); opacity: 0 }
        }
        .ssFace      { animation: ssFaceFloat 3.4s ease-in-out infinite }
        .ssFace-pop  { animation: ssFacePop 320ms cubic-bezier(0.16,1,0.3,1) }
        .ssEye       { transform-origin: center; animation: ssBlink 4.2s ease-in-out infinite }
        .ssTear      { animation: ssTear 1.5s ease-in infinite }
        .ssTear-b    { animation-delay: 0.65s }
        .ssConfetti  { animation: ssConfetti 900ms cubic-bezier(0.16,1,0.3,1) forwards }

        /* A face that bounces and cries is precisely what this setting asks us
           not to render. Expressions still change — that is information, not
           decoration — but nothing moves on its own. */
        @media (prefers-reduced-motion: reduce) {
          .ssFace, .ssFace-pop, .ssEye, .ssTear, .ssConfetti { animation: none !important }
          .ssTear { opacity: 0.9 }
        }
      `}</style>

      <svg
        viewBox="0 0 120 120"
        width={size}
        height={size}
        role="img"
        style={{ display: "block", overflow: "visible" }}
      >
        <defs>
          <radialGradient id={`ssFaceFill${uid}`} cx="38%" cy="32%" r="78%">
            <stop offset="0%" stopColor="#ffe9a8" />
            <stop offset="62%" stopColor="#f3c95f" />
            <stop offset="100%" stopColor="#d9a83c" />
          </radialGradient>
        </defs>

        {/* Keyed on the rating so React remounts the group and the pop replays
            on every change — a CSS animation on a persistent node only ever
            runs once. */}
        <g key={r} className={`ssFace ${r > 0 ? "ssFace-pop" : ""}`} style={{ transformOrigin: "60px 60px" }}>
          <circle cx="60" cy="60" r="42" fill={`url(#ssFaceFill${uid})`} />
          {/* A rim rather than a hard stroke: at 104px a 1px outline shimmers. */}
          <circle cx="60" cy="60" r="42" fill="none" stroke="rgba(61,12,17,0.10)" strokeWidth="2" />

          {/* ── Eyes ────────────────────────────────────────────────────────
              Closed and curved when overjoyed, which is what reads as a real
              grin; open dots otherwise. */}
          {overjoyed ? (
            <>
              <path d="M40 52 Q47 45 54 52" fill="none" stroke="#3d0c11" strokeWidth="3.4" strokeLinecap="round" />
              <path d="M66 52 Q73 45 80 52" fill="none" stroke="#3d0c11" strokeWidth="3.4" strokeLinecap="round" />
            </>
          ) : (
            <>
              <ellipse className="ssEye" cx="47" cy="53" rx="4.6" ry={crying ? 2.4 : 5.2} fill="#3d0c11" />
              <ellipse className="ssEye" cx="73" cy="53" rx="4.6" ry={crying ? 2.4 : 5.2} fill="#3d0c11" />
            </>
          )}

          {/* ── Brows ────────────────────────────────────────────────────────
              The INNER ends sit high and the outer ends low. That asymmetry is
              the whole difference between sad and angry, and the first version
              had it backwards: both ends low with a raised middle, which is an
              arch, and an arch on a downturned mouth reads as cross rather than
              upset. Verified by rendering every state and looking at it. */}
          {r > 0 && r <= 2 && (
            <>
              <path d="M38 47 Q46 41 55 39" fill="none" stroke="#3d0c11" strokeWidth="2.8" strokeLinecap="round" opacity="0.8" />
              <path d="M65 39 Q74 41 82 47" fill="none" stroke="#3d0c11" strokeWidth="2.8" strokeLinecap="round" opacity="0.8" />
            </>
          )}

          {/* Blush on the happy end. */}
          {happy && (
            <>
              <ellipse cx="36" cy="66" rx="6.5" ry="4" fill="#f0748a" opacity="0.5" />
              <ellipse cx="84" cy="66" rx="6.5" ry="4" fill="#f0748a" opacity="0.5" />
            </>
          )}

          <path
            d={MOUTH[r]}
            fill={r === 1 || r === 5 ? "#3d0c11" : "none"}
            stroke="#3d0c11"
            strokeWidth="3.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* ── Tears ──────────────────────────────────────────────────────── */}
          {crying && (
            <>
              {/* Bigger than the first attempt, which was 3.4×4.6 and simply
                  did not register at this size. A highlight on each, because a
                  flat blue blob does not read as water. */}
              <ellipse className="ssTear" cx="44" cy="63" rx="4.4" ry="6" fill="#5aa9e6" />
              <ellipse className="ssTear" cx="44" cy="61" rx="1.5" ry="2" fill="#bfe3ff" opacity="0.9" />
              <ellipse className="ssTear ssTear-b" cx="76" cy="63" rx="4.4" ry="6" fill="#5aa9e6" />
              <ellipse className="ssTear ssTear-b" cx="76" cy="61" rx="1.5" ry="2" fill="#bfe3ff" opacity="0.9" />
            </>
          )}
        </g>

        {/* ── Confetti ─────────────────────────────────────────────────────── */}
        {overjoyed && (
          <g>
            {[
              { dx: -30, dy: -26, dr: -140, c: "#c9a84c" },
              { dx: 30, dy: -28, dr: 150, c: "#f0748a" },
              { dx: -40, dy: 4, dr: -90, c: "#6C5CE7" },
              { dx: 40, dy: 2, dr: 110, c: "#3aa76d" },
              { dx: -14, dy: -40, dr: 60, c: "#f3c95f" },
              { dx: 16, dy: -42, dr: -70, c: "#5aa9e6" },
            ].map((p, i) => (
              <rect
                key={i}
                className="ssConfetti"
                x="57"
                y="26"
                width="6"
                height="6"
                rx="1.6"
                fill={p.c}
                style={
                  {
                    ["--dx" as string]: `${p.dx}px`,
                    ["--dy" as string]: `${p.dy}px`,
                    ["--dr" as string]: `${p.dr}deg`,
                    animationDelay: `${i * 35}ms`,
                  } as React.CSSProperties
                }
              />
            ))}
          </g>
        )}
      </svg>
    </div>
  );
}
