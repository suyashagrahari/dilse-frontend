"use client";

// The strip itself: four frames on glossy booth paper, a date stamp, and a
// footer where the kisses land: the sender's print is already there, the
// recipient's arrives when they kiss the screen. Used three times: printing
// (Booth), keeping (Ending), and as the TeaserArt silhouette's cousin.
// Sized by --sw (CSS length); everything inside scales with it (cqw).

import type { CSSProperties } from "react";
import { CroppedPhoto } from "../../../_valentine/kit";
import { LipPrint } from "./LipPrint";
import { MONO } from "./fonts";
import { initialOf, stampDate, type Booth } from "./model";

export const FRAME_FILTER = { mono: "grayscale(1) contrast(1.14) brightness(1.04)", colour: "saturate(.92) contrast(1.06) sepia(.12) brightness(1.02)" } as const;

export interface StripProps {
  b: Booth;
  /** How many frames have developed (0–4). */
  developed?: number;
  /** The recipient's kiss is on the footer. */
  kissed?: boolean;
  /** Stamp text (default: today + initials). */
  width?: string;
  onFrame?: (i: number) => void;
  style?: CSSProperties;
  className?: string;
}

export default function Strip({ b, developed = 4, kissed = false, width = "200px", onFrame, style, className }: StripProps) {
  const filter = b.mono ? FRAME_FILTER.mono : FRAME_FILTER.colour;
  return (
    <div
      className={`pb-strip${className ? ` ${className}` : ""}`}
      style={{ ["--sw" as string]: width, ...style }}
      role="img"
      aria-label={`A photo-booth strip of ${b.recipient} and ${b.sender}: four frames${kissed ? `, with both of your kisses on it` : ""}.`}
    >
      <div className="pb-stripFrames">
        {b.frames.map((ph, i) => {
          const body = (
            <>
              {ph ? <CroppedPhoto photo={ph} eager style={{ filter, background: "#222" }} /> : <span className="pb-frameEmpty">{initialOf(b.recipient)}♥{initialOf(b.sender)}</span>}
              <span className={`pb-milk${i < developed ? " is-dev" : ""}`} aria-hidden />
              <span className="pb-gloss" aria-hidden />
            </>
          );
          return onFrame ? (
            <button key={i} type="button" className="pb-frame is-btn" onClick={() => onFrame(i)} aria-label={`Frame ${i + 1}`}>
              {body}
            </button>
          ) : (
            <span key={i} className="pb-frame">
              {body}
            </span>
          );
        })}
      </div>
      <div className="pb-stripFoot">
        <span className="pb-prints">
          <LipPrint color={b.S.c} lipstick={b.lipstick} seed={7} className="pb-printA" />
          <span className={`pb-printB${kissed ? " is-on" : ""}`}>
            <LipPrint color={b.S.c} lipstick={b.lipstick} seed={19} />
          </span>
        </span>
        <span className="pb-stamp" style={{ fontFamily: MONO }}>
          {stampDate()} · {initialOf(b.recipient)}+{initialOf(b.sender)}
        </span>
      </div>
    </div>
  );
}

export const STRIP_CSS = `
/* The strip's own box is sized from --sw (cqw on an element resolves against its ANCESTOR container); everything inside uses cqw. */
.pb-strip { container-type: inline-size; position: relative; width: var(--sw); box-sizing: border-box; padding: calc(var(--sw) * .06) calc(var(--sw) * .06) 0;
  background: #F7F2E8; border-radius: calc(var(--sw) * .016);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .35 0 0 0 0 .3 0 0 0 0 .25 0 0 0 .09 0'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)'/%3E%3C/svg%3E"),
    linear-gradient(180deg, #FBF7EF, #F1EADC);
  box-shadow: 0 1px 0 rgba(255,255,255,.7) inset, 0 -1px 0 rgba(0,0,0,.06) inset, 0 40px 70px -30px rgba(0,0,0,.85), 0 12px 24px -12px rgba(0,0,0,.6); }
.pb-stripFrames { display: grid; gap: 3.4cqw; }
.pb-frame { position: relative; display: block; aspect-ratio: 4 / 3; overflow: hidden; background: #1d1a1a; border-radius: .6cqw; padding: 0; border: 0; }
.pb-frame.is-btn { cursor: pointer; touch-action: manipulation; transition: transform .25s cubic-bezier(.22,1,.36,1); }
.pb-frame.is-btn:active { transform: scale(.97); }
.pb-frame.is-btn:focus-visible { outline: 3px solid var(--pb-shade); outline-offset: 3px; }
.pb-frameEmpty { position: absolute; inset: 0; display: grid; place-items: center; color: rgba(244,237,225,.55); font: 400 14cqw/1 var(--font-pb-display), Georgia, serif; }
/* developing: milky silver paper clears to the picture (opacity only) */
.pb-milk { position: absolute; inset: 0; background: radial-gradient(120% 90% at 50% 40%, #efe9dc, #d9d2c4); opacity: 1; transition: opacity 1.6s cubic-bezier(.4,0,.2,1); }
.pb-milk.is-dev { opacity: 0; }
.pb-gloss { position: absolute; inset: 0; pointer-events: none; background: linear-gradient(125deg, rgba(255,255,255,.16), rgba(255,255,255,0) 38%, rgba(255,255,255,0) 70%, rgba(255,255,255,.08)); mix-blend-mode: screen; }
.pb-stripFoot { position: relative; display: grid; justify-items: center; gap: 1cqw; padding: 4cqw 0 5cqw; }
.pb-prints { display: flex; align-items: center; justify-content: center; gap: 2cqw; height: 22cqw; }
.pb-prints svg { width: 34cqw; height: auto; mix-blend-mode: multiply; }
.pb-printA { transform: rotate(-8deg); }
.pb-printB { display: block; opacity: 0; transform: rotate(10deg) scale(1.6); transition: opacity .35s ease, transform .55s cubic-bezier(.2,1.4,.4,1); }
.pb-printB.is-on { opacity: 1; transform: rotate(10deg) scale(1); }
.pb-stamp { font-size: 6.2cqw; letter-spacing: .16em; color: #8a1520; opacity: .78; text-transform: uppercase; white-space: nowrap; }
@media (prefers-reduced-motion: reduce) { .pb-milk, .pb-printB { transition: opacity .3s ease; } }
`;
