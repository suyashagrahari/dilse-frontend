"use client";

// ─── Act 2 — memory lane ─────────────────────────────────────────────────────
// A scrapbook of polaroids. Each card is two nested elements on purpose: the
// outer one owns the staggered entrance animation, the inner one owns the
// resting tilt and the hover straighten. Keeping them separate is what lets a
// `animation-fill-mode: both` entrance coexist with a CSS transition on hover —
// if both lived on one element the filled animation would win forever.
//
// ── THE ART IS AT THE TOP ───────────────────────────────────────────────────
//
// The couple mid-proposal used to close the act, wedged between the last
// polaroid and the button. That put the one moving thing on the screen directly
// above the only control, which is where the eye goes last and the thumb goes
// first. It opens the chapter now: art, title, then the photographs, then the
// way out. A scrapbook has a cover.
//
// ── WIDTH ───────────────────────────────────────────────────────────────────
//
// The grid was capped at 660px, which on a 1440px laptop is a column of stamps
// down the middle of an empty page. The column count is now driven by the
// number of memories rather than by available space — `repeat(auto-fit, …)`
// gives two photos half a laptop each, which is worse than four across — and
// the cap is derived from that count, so four memories genuinely use the width
// and one memory is still a photograph rather than a billboard.

import type { CSSProperties } from "react";
import { useState } from "react";
import { ASSETS } from "./assets";
import PhotoZoom, { type ZoomTarget } from "./PhotoZoom";
import type { ProposalData } from "./types";
import { chip, DISPLAY, INK, INK_SOFT, PINK_DEEP, PINK_GLOW, PINK_GRADIENT, SCRIPT } from "./theme";

/** Resting tilt per card, cycled. Real photos in a real album are never square. */
const TILTS = [-3, 4, -2, 3.5, -4, 2.5];
const TAPE = ["rgba(255,183,205,.7)", "rgba(200,182,255,.7)", "rgba(255,224,178,.7)"];

export default function MemoryLane({
  data,
  onNext,
  reduced,
}: {
  data: ProposalData;
  onNext: () => void;
  reduced: boolean;
}) {
  const memories = data.memories;
  /**
   * The photo being looked at up close, or null.
   *
   * A scrapbook at 150px a card is a contact sheet; the detail in somebody's
   * actual photograph is the reason it is on the page at all. Tapping opens it
   * full-screen where it can be pinched and dragged — see PhotoZoom.
   */
  const [zoom, setZoom] = useState<ZoomTarget | null>(null);
  // The CTA lands after the last polaroid has finished arriving.
  const ctaDelay = reduced ? 0 : 180 + memories.length * 90;

  /**
   * Column counts per breakpoint, capped by how many photos there actually are.
   *
   * Passed as custom properties because the stylesheet below needs them inside
   * media queries, and an inline `grid-template-columns` cannot be overridden
   * by any rule in a <style> tag — the one hard rule of styling in this
   * template. A number, not a length: `calc(var(--ml-lg) * 330px)` needs it
   * unitless.
   */
  const cols = {
    "--ml-sm": Math.min(memories.length, 2),
    "--ml-md": Math.min(memories.length, 3),
    "--ml-lg": Math.min(memories.length, 4),
  } as CSSProperties;

  return (
    <section
      className="mlAct"
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
      }}
    >
      {/* Safe centring: `justify-content:center` clips both ends of a column
          that overflows, and the part above the start edge cannot be scrolled
          to. `margin:auto` centres the same way and degrades to flex-start. */}
      <div
        style={{
          margin: "auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        <p style={{ ...chip("rgba(255,255,255,.66)", PINK_DEEP), marginBottom: 12 }}>
          <span aria-hidden>📸</span> chapter one
        </p>

        {/* The cover art. A fixed frame, so its own load never shifts the title
            underneath it and it cannot drift out of a clipped region. */}
        <div className="mlHeroFrame">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ASSETS.askHero}
            alt="A couple mid-proposal inside a heart"
            className="mlHero"
            style={{ filter: "drop-shadow(0 16px 26px rgba(200,110,150,.3))" }}
          />
        </div>

        <h2
          className="ps-rise mlTitle"
          style={{
            fontFamily: DISPLAY,
            fontWeight: 700,
            lineHeight: 1.14,
            color: INK,
            textAlign: "center",
            margin: "12px 0 6px",
            textWrap: "balance",
          }}
        >
          {data.memoryLaneTitle}
        </h2>

        <p
          className="mlNames"
          style={{
            fontFamily: SCRIPT,
            color: PINK_DEEP,
            textAlign: "center",
            margin: "0 0 26px",
            opacity: 0.9,
          }}
        >
          {data.senderName || "me"} &amp; {data.recipientName || "you"}
        </p>

        <div className="mlGrid" style={cols}>
          {memories.map((m, i) => (
            <div
              key={`${i}-${m.imageUrl.slice(-24)}`}
              className={reduced ? "ps-pola" : "ps-pola ps-pop"}
              style={{ animationDelay: reduced ? "0ms" : `${140 + i * 90}ms`, position: "relative" }}
            >
              <button
                type="button"
                className="ps-pola-in mlCard"
                onClick={() =>
                  setZoom({
                    src: m.imageUrl,
                    caption: m.caption,
                    alt: m.caption || `A memory of ${data.recipientName || "us"}`,
                  })
                }
                aria-label={m.caption ? `Open photo: ${m.caption}` : "Open photo"}
                style={{
                  display: "block",
                  width: "100%",
                  border: "none",
                  cursor: "zoom-in",
                  textAlign: "inherit",
                  font: "inherit",
                  transform: `rotate(${TILTS[i % TILTS.length]}deg)`,
                  background: "#fff",
                  borderRadius: 10,
                  boxShadow: "0 18px 34px -20px rgba(150,80,110,.55)",
                }}
              >
                {/* Washi tape, alternating corners */}
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    top: -7,
                    left: i % 2 === 0 ? 14 : undefined,
                    right: i % 2 === 0 ? undefined : 14,
                    width: 44,
                    height: 17,
                    borderRadius: 3,
                    transform: `rotate(${i % 2 === 0 ? -8 : 9}deg)`,
                    background: TAPE[i % TAPE.length],
                    boxShadow: "0 3px 8px -4px rgba(150,80,110,.45)",
                  }}
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={m.imageUrl}
                  alt={m.caption || `A memory of ${data.recipientName || "us"}`}
                  loading={i < 2 ? "eager" : "lazy"}
                  style={{
                    display: "block",
                    width: "100%",
                    aspectRatio: "1 / 1",
                    objectFit: "cover",
                    borderRadius: 4,
                    background: "linear-gradient(160deg, #fff1f6 0%, #f4ecff 100%)",
                  }}
                />
                <p
                  className="mlCaption"
                  style={{
                    fontFamily: SCRIPT,
                    lineHeight: 1.2,
                    color: "#5b3a4a",
                    textAlign: "center",
                    margin: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {m.caption}
                </p>
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onNext}
          className="ps-btn ps-rise mlCta"
          style={{
            animationDelay: `${ctaDelay}ms`,
            border: "none",
            cursor: "pointer",
            borderRadius: 999,
            background: PINK_GRADIENT,
            color: "#fff",
            fontFamily: DISPLAY,
            fontWeight: 700,
            boxShadow: PINK_GLOW,
            maxWidth: "88vw",
          }}
        >
          There&rsquo;s one more thing&hellip;
        </button>

        {/* Which verb to use depends on the pointer, not on the motion preference:
            phones have no hover, and this template is opened on a phone most of the
            time. The swap is done in CSS so it survives SSR without a hydration
            mismatch. Tapping genuinely works — `.ps-pola:active` straightens it too. */}
        <p style={{ fontSize: 11.5, color: INK_SOFT, opacity: 0.8, marginTop: 12, textAlign: "center" }}>
          <span className="ps-hint-hover">hover a photo to straighten it — click to open it</span>
          <span className="ps-hint-tap">tap a photo to open it</span>
        </p>
      </div>

      {/* Full-screen, pinchable. Rendered here rather than inside the grid so
          it is not a child of a transformed, tilted polaroid — a fixed element
          inside a transformed ancestor is positioned against that ancestor, not
          the viewport, and would open inside the card. */}
      <PhotoZoom key={zoom?.src ?? "closed"} photo={zoom} onClose={() => setZoom(null)} />

      <style>{`
        .mlAct { padding: 74px 16px 44px }
        .mlHeroFrame {
          height: clamp(92px, 17vh, 150px);
          width: 100%; max-width: 300px;
          display: flex; align-items: center; justify-content: center;
        }
        .mlHero { height: 100%; width: auto; max-width: 100%; object-fit: contain }
        .mlTitle { font-size: clamp(24px, 6.8vw, 40px); max-width: 720px }
        .mlNames { font-size: clamp(18px, 5vw, 24px) }

        /* Column count comes from the photo count, not from available space.
           Two photos stretched across a laptop is not a scrapbook. */
        .mlGrid {
          display: grid;
          grid-template-columns: repeat(var(--ml-sm), minmax(0, 1fr));
          gap: 18px 12px;
          width: 100%;
          max-width: calc(var(--ml-sm) * 200px);
          margin: 0 auto;
        }
        .mlCaption { font-size: clamp(14px, 3.7vw, 16px); padding: 10px 6px 16px; min-height: 52px }
        .mlCta { margin-top: 26px; padding: 14px 26px; font-size: clamp(15px, 4.3vw, 18px) }

        @media (min-width: 700px) {
          .mlAct { padding: 84px 24px 52px }
          .mlGrid {
            grid-template-columns: repeat(var(--ml-md), minmax(0, 1fr));
            gap: 26px 20px;
            max-width: calc(var(--ml-md) * 250px);
          }
        }

        @media (min-width: 1100px) {
          .mlAct { padding: 92px 40px 60px }
          .mlGrid {
            grid-template-columns: repeat(var(--ml-lg), minmax(0, 1fr));
            gap: 34px 28px;
            max-width: min(94vw, calc(var(--ml-lg) * 340px));
          }
          .mlCaption { font-size: 19px; padding: 14px 10px 22px; min-height: 76px }
          .mlCta { margin-top: 34px; padding: 17px 34px }
        }
      `}</style>
    </section>
  );
}
