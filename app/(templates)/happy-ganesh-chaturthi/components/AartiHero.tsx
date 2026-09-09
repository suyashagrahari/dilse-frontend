"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { GANESH_ASSETS } from "../assets";
import { GC } from "./theme";
import { Diya, Garland, HaloRing, PetalFall, Rays, Thali } from "./Ornaments";
import { Reveal } from "./Bits";
import { useNow } from "./useNow";
import { AARTI_LINES, formatFestivalDate, muhuratLine, type GaneshData } from "./types";

// ─── The hero IS the aarti ───────────────────────────────────────────────────
//
// The first thing on the page is the lamp going round. The greeting, the
// offerings, the photograph and everything else follow it.
//
// ── WHY THEY ARE ONE SECTION AND NOT TWO ────────────────────────────────────
//
// They used to be separate: a hero carrying the lettered greeting GIF, and an
// aarti section four screens down. That put the template's best moment below the
// fold on every device, behind a greeting card image that says the same words
// the headline already says.
//
// So the aarti came up to the top and the GIF went down to the greeting section,
// where it sits beside the sender's own lines and finally has something to
// illustrate. The verse comes with the visual rather than being left behind it —
// the words and the plate are the same event and separating them was always
// going to read as two half-sections.
//
// ── WHAT REVOLVES, AND WHAT DOES NOT ────────────────────────────────────────
//
// The murti sits still, centred in a round ivory medallion. Three things go
// round it: the thali orbits, the ornament ring turns the other way at a third
// of the speed, and the rays behind turn slower still.
//
// Rotating the murti itself was tried and it is wrong — a deity's face tipping
// past horizontal reads unmistakably as a broken transform, and at the bottom of
// the arc it is upside down. It is also not what an aarti is: the plate goes
// round the murti, and the murti stays where it is.
//
// ── THE WORDS ARRIVE OFF THE ANIMATION, NOT A TIMER ─────────────────────────
//
// Read from the orbit's own `animationiteration`, the couplet changes exactly as
// the thali completes its circle, every time, on a slow phone and a fast one. A
// parallel `setInterval` drifts against a CSS animation within a few cycles, and
// the drift is visible precisely because the reader is watching one thing go
// round.
//
// Under `prefers-reduced-motion` the animation does not run and emits no
// iterations, so there is a timer fallback at the same cadence — without it the
// verse would never advance for the readers least able to work around that.

/** Must equal `gc-orbit`'s duration in ganesh.css. */
const REVOLUTION_MS = 9000;

/** Two lines at a time: they are couplets, and one line alone reads as a fragment. */
const COUPLETS = [
  [AARTI_LINES[0], AARTI_LINES[1]],
  [AARTI_LINES[2], AARTI_LINES[3]],
] as const;

export default function AartiHero({
  data,
  sample = false,
}: {
  data: GaneshData;
  /** Label this as the demo rather than as somebody's finished page. */
  sample?: boolean;
}) {
  const now = useNow(60_000);
  const date = formatFestivalDate(data.festivalDate);
  const muhurat = now ? muhuratLine(now) : null;

  /** Which couplet is showing. Reaches COUPLETS.length and stops. */
  const [step, setStep] = useState(0);
  const orbitRef = useRef<HTMLDivElement>(null);

  const advance = useCallback(() => {
    setStep((s) => (s >= COUPLETS.length ? s : s + 1));
  }, []);

  useEffect(() => {
    if (step >= COUPLETS.length) return;

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // The animation is switched off under reduced motion, so it emits no
    // iterations. Same cadence, on a timer. Also the fallback if the ref ever
    // fails to attach — better a timer than a verse that never advances.
    if (reduced || !orbitRef.current) {
      const t = setTimeout(advance, REVOLUTION_MS);
      return () => clearTimeout(t);
    }

    const node = orbitRef.current;
    node.addEventListener("animationiteration", advance);
    return () => node.removeEventListener("animationiteration", advance);
  }, [step, advance]);

  const couplet = step < COUPLETS.length ? COUPLETS[step] : null;

  return (
    <section className="gc-section gc-section--hero" id="gc-aarti">
      <Garland pieces={15} />
      <PetalFall count={14} seed={9} />

      <div className="gc-wrap" style={{ position: "relative", zIndex: 2 }}>
        <div
          className="gc-split gc-split--art-right gc-hero-split"
          style={{ ["--gc-split" as string]: "1fr 1fr" }}
        >
          {/* ── The medallion ─────────────────────────────────────────────────
           *
           * First in the DOM so that on a phone the lamp is the thing above the
           * fold. `gc-split--art-right` moves it to the right-hand column once
           * there are two columns to move it between.
           *
           * `aspect-ratio: 1` with everything inside positioned absolutely, so
           * the orbit, the ring and the rays are concentric by construction
           * rather than by three sets of matching offsets. */}
          <div className="gc-art">
            <Reveal>
              <div className="gc-medallion">
                {/* Warm light behind everything, so the transparent murti is not
                    floating on flat cream. */}
                <div aria-hidden className="gc-medallion-glow" />

                <div aria-hidden className="gc-medallion-layer">
                  <Rays size="100%" />
                </div>
                <div aria-hidden className="gc-medallion-layer gc-medallion-layer--ring">
                  <HaloRing size="100%" />
                </div>

                {/* The murti, still and centred. */}
                <div
                  className="gc-medallion-murti"
                  style={{ aspectRatio: `${GANESH_ASSETS.bappa.ratio}` }}
                >
                  <Image
                    src={GANESH_ASSETS.bappa.src}
                    alt="Ganesh"
                    fill
                    priority
                    sizes="(min-width: 1024px) 390px, 62vw"
                    style={{ objectFit: "contain" }}
                  />
                </div>

                {/* ── The orbit ─────────────────────────────────────────────────
                 *
                 * Two nested rotations. The wrapper carries the thali round the
                 * circle; `gc-thali-upright` inside counter-rotates the plate at
                 * the same rate so the flame stays vertical the whole way.
                 * Rotating the plate itself puts the flame upside down at the
                 * bottom of the arc — see ganesh.css. */}
                <div ref={orbitRef} aria-hidden className="gc-medallion-orbit gc-thali-orbit">
                  <div className="gc-medallion-thali">
                    <div className="gc-thali-upright">
                      <Thali size={84} />
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          {/* ── The words ─────────────────────────────────────────────────────*/}
          <div className="gc-words">
            {sample && (
              <Reveal>
                <p className="gc-sample">A sample — yours will use your names and your photo</p>
              </Reveal>
            )}

            <Reveal delay={0.08}>
              <p className="gc-eyebrow" style={{ margin: "0 0 14px" }}>
                {date || "Ganesh Chaturthi"}
              </p>
              <h1 className="gc-display gc-title">Happy Ganesh Chaturthi</h1>
            </Reveal>

            <Reveal delay={0.16}>
              <p className="gc-display gc-hero-name gc-name">
                {data.recipientName || "to your house"}
              </p>
              {(data.senderName || data.city) && (
                <p className="gc-hero-from">
                  from {data.senderName || "someone at home"}
                  {data.city ? ` · ${data.city}` : ""}
                </p>
              )}
            </Reveal>

            {/* ── The countdown, which gates nothing ──────────────────────────
             *
             * Purely informational, and `muhuratLine` is documented as such: a
             * panchang timing differs by a few minutes between almanacs and by
             * city, so a page that refused to open outside the hour would be
             * wrong for somebody, somewhere, every year. */}
            {muhurat && (
              <Reveal delay={0.24}>
                <p
                  className="gc-hero-pill"
                  style={{
                    color: muhurat.phase === "during" ? GC.leaf : GC.muted,
                    fontWeight: muhurat.phase === "during" ? 600 : 400,
                  }}
                >
                  <Diya size={18} />
                  {muhurat.label}
                </p>
              </Reveal>
            )}
          </div>
        </div>

        {/* ── The verse, two lines at a time ──────────────────────────────────
         *
         * Under the split and centred on the page, not tucked into the text
         * column: it belongs to the lamp, and the lamp is the whole width of the
         * composition.
         *
         * A fixed min-height, because the couplets are not the same height and
         * the block would jump by ~30px in the middle of the calmest part of the
         * page otherwise. */}
        <div className="gc-verse">
          {couplet ? (
            <div key={step} className="gc-rise">
              {couplet.map((line, i) => (
                <p key={i} className="gc-quote gc-verse-line">
                  {line}
                </p>
              ))}
            </div>
          ) : (
            // ── The sender's line, alone ──────────────────────────────────────
            //
            // Nothing else is on screen when this arrives, and that is the whole
            // design of the moment: four lines of a verse a million people know,
            // and then one sentence only these two people do.
            <div key="own" className="gc-rise">
              {data.aartiLine ? (
                <>
                  <p className="gc-quote gc-verse-own">“{data.aartiLine}”</p>
                  {data.senderName && <p className="gc-verse-sig">{data.senderName}</p>}
                </>
              ) : (
                <p className="gc-quote gc-verse-line">
                  May the obstacles be somebody else’s this year.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
