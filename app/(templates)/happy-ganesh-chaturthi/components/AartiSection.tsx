"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Volume2 } from "lucide-react";
import { GANESH_ASSETS } from "../assets";
import { GC } from "./theme";
import { HaloRing, Rays, Thali, Rule } from "./Ornaments";
import { Reveal } from "./Bits";
import { AARTI_LINES, type GaneshData } from "./types";

// ─── The aarti ───────────────────────────────────────────────────────────────
//
// The centre of the page, and the only part of it that moves continuously.
//
// ── WHAT REVOLVES, AND WHAT DOES NOT ────────────────────────────────────────
//
// The murti sits still, centred in a round ivory medallion. Three things go
// round it: the thali orbits, the ornamental ring turns the other way at a third
// of the speed, and the rays behind turn slower still.
//
// Rotating the murti itself was tried and it is wrong — a deity's face tipping
// past horizontal reads unmistakably as a broken transform, and at the bottom of
// the arc it is upside down. It is also not what an aarti is: the plate goes
// round the murti, and the murti stays where it is. So the roundness is the
// medallion and the revolving is everything around it, which is both what was
// asked for and what actually happens in the room.
//
// ── NO ORANGE ───────────────────────────────────────────────────────────────
//
// The murti asset is a transparent WebP and it stands on the page's own ivory,
// with one very soft warm radial behind it. The first build put it on a
// saturated marigold wall, which set the key for the whole composition and made
// the quietest moment on the page the loudest screen in it.
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

export default function AartiSection({
  data,
  playing,
  onPlay,
}: {
  data: GaneshData;
  /** True once the reader has started the recording. */
  playing: boolean;
  onPlay: () => void;
}) {
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
    <section className="gc-section gc-section--sunk" id="gc-aarti">
      <div className="gc-wrap">
        <Reveal>
          <div style={{ textAlign: "center" }}>
            <p className="gc-eyebrow" style={{ margin: "0 0 12px" }}>
              The aarti
            </p>
            <h2
              className="gc-display gc-h2"
              style={{ margin: 0, color: GC.maroon }}
            >
              The lamp goes round
            </h2>
            <div style={{ marginTop: 14, display: "flex", justifyContent: "center" }}>
              <Rule width={180} />
            </div>
          </div>
        </Reveal>

        {/* ── The medallion ─────────────────────────────────────────────────
         *
         * Sized in `vw` with a hard cap, not at breakpoints: it is the largest
         * element on the page and a step change in it at 1024px would be the
         * most obvious thing about the layout.
         *
         * `aspect-ratio: 1` with everything inside positioned absolutely, so the
         * orbit, the ring and the rays are all concentric by construction rather
         * than by three sets of matching offsets. */}
        <Reveal delay={0.1}>
          <div
            style={{
              position: "relative",
              // Capped, but generously: this is the largest thing on the page
              // and the one everything else is arranged around. 520px looked
              // stranded in a 1440px window.
              width: "min(88vw, 620px)",
              aspectRatio: "1 / 1",
              margin: "clamp(28px, 5vw, 56px) auto 0",
              display: "grid",
              placeItems: "center",
            }}
          >
            {/* Warm light behind everything, so the transparent murti is not
                floating on flat cream. */}
            <div
              aria-hidden
              style={{
                position: "absolute",
                inset: "6%",
                borderRadius: "50%",
                background: `radial-gradient(circle at 50% 42%, ${GC.goldPale} 0%, rgba(243,231,201,0.55) 46%, rgba(243,231,201,0) 72%)`,
              }}
            />

            <div aria-hidden style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}>
              <Rays size="100%" />
            </div>

            <div aria-hidden style={{ position: "absolute", inset: "4%", display: "grid", placeItems: "center" }}>
              <HaloRing size="100%" />
            </div>

            {/* The murti, still and centred. */}
            <div
              style={{
                position: "relative",
                zIndex: 3,
                width: "62%",
                aspectRatio: `${GANESH_ASSETS.bappa.ratio}`,
              }}
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

            {/* ── The orbit ───────────────────────────────────────────────────
             *
             * Two nested rotations. The wrapper carries the thali round the
             * circle; `gc-thali-upright` inside counter-rotates the plate at the
             * same rate so the flame stays vertical the whole way. Rotating the
             * plate itself puts the flame upside down at the bottom of the arc —
             * see ganesh.css. */}
            <div
              ref={orbitRef}
              aria-hidden
              className="gc-thali-orbit"
              style={{ position: "absolute", inset: "2%", zIndex: 4, pointerEvents: "none" }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "-7%",
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              >
                <div className="gc-thali-upright">
                  <Thali size={84} />
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* ── The verse, two lines at a time ────────────────────────────────
         *
         * A fixed min-height, because the couplets are not the same height and
         * the block would jump by ~30px in the middle of the calmest part of the
         * page otherwise. */}
        <div
          style={{
            minHeight: 132,
            display: "grid",
            placeItems: "center",
            textAlign: "center",
            marginTop: "clamp(24px, 4vw, 44px)",
          }}
        >
          {couplet ? (
            <div key={step} className="gc-rise">
              {couplet.map((line, i) => (
                <p
                  key={i}
                  className="gc-quote"
                  style={{
                    fontSize: "clamp(19px, 3vw, 27px)",
                    lineHeight: 1.5,
                    color: GC.ink,
                    // `margin: 0 auto` and not `margin: 0`: the cap without auto
                    // margins centres the text on the paragraph's own left-flush
                    // box rather than on the section. See the note in Bits.tsx.
                    margin: "0 auto",
                    maxWidth: "34ch",
                  }}
                >
                  {line}
                </p>
              ))}
            </div>
          ) : (
            // ── The sender's line, alone ──────────────────────────────────
            //
            // Nothing else is on screen when this arrives, and that is the whole
            // design of the moment: four lines of a verse a million people know,
            // and then one sentence only these two people do.
            <div key="own" className="gc-rise">
              {data.aartiLine ? (
                <>
                  <p
                    className="gc-quote"
                    style={{
                      fontSize: "clamp(21px, 3.4vw, 31px)",
                      lineHeight: 1.45,
                      color: GC.ink,
                      margin: "0 auto",
                      maxWidth: "30ch",
                    }}
                  >
                    “{data.aartiLine}”
                  </p>
                  {data.senderName && (
                    <p
                      style={{
                        fontSize: 12.5,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: GC.muted,
                        margin: "18px 0 0",
                      }}
                    >
                      {data.senderName}
                    </p>
                  )}
                </>
              ) : (
                <p className="gc-quote" style={{ fontSize: 22, color: GC.muted, margin: 0 }}>
                  May the obstacles be somebody else’s this year.
                </p>
              )}
            </div>
          )}
        </div>

        {/* ── The recording ─────────────────────────────────────────────────
         *
         * One button, and it has to be a button.
         *
         * Every browser blocks audio that starts without a user gesture, and the
         * block is silent — `play()` returns a rejected promise and nothing
         * happens. Templates that "have music" and are quiet in the wild are
         * almost always that.
         *
         * The gesture requirement is not the only reason, though. A devotional
         * recording that begins the instant a stranger opens a link — possibly
         * in an open-plan office — is a page people close. So it waits to be
         * asked, and once it is playing this collapses to a line of text and the
         * mute control lives in the corner. */}
        <div style={{ display: "grid", placeItems: "center", marginTop: 8 }}>
          {playing ? (
            <p
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                fontSize: 12.5,
                color: GC.muted,
                margin: 0,
              }}
            >
              <Volume2 size={14} style={{ color: GC.saffron }} />
              Karpura Gauram — the closing verse. Mute it in the corner.
            </p>
          ) : (
            <button
              type="button"
              onClick={onPlay}
              style={{
                minHeight: 46,
                padding: "0 22px",
                borderRadius: 999,
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                background: GC.surface,
                color: GC.ink,
                border: `1px solid ${GC.goldSoft}`,
                boxShadow: "0 12px 26px -20px rgba(46,33,25,0.5)",
              }}
            >
              <Play size={15} style={{ color: GC.saffron }} /> Play the aarti
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
