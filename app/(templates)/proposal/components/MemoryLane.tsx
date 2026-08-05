"use client";

// ─── Act 2 — memory lane ─────────────────────────────────────────────────────
// A scrapbook of polaroids. Each card is two nested elements on purpose: the
// outer one owns the staggered entrance animation, the inner one owns the
// resting tilt and the hover straighten. Keeping them separate is what lets a
// `animation-fill-mode: both` entrance coexist with a CSS transition on hover —
// if both lived on one element the filled animation would win forever.

import { ASSETS } from "./assets";
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
  // The CTA lands after the last polaroid has finished arriving.
  const ctaDelay = reduced ? 0 : 180 + memories.length * 90;

  return (
    <section
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "78px 16px 44px",
        width: "100%",
      }}
    >
      <p style={{ ...chip("rgba(255,255,255,.66)", PINK_DEEP), marginBottom: 12 }}>
        <span aria-hidden>📸</span> chapter one
      </p>

      <h2
        className="ps-rise"
        style={{
          fontFamily: DISPLAY,
          fontWeight: 700,
          fontSize: "clamp(24px,6.8vw,38px)",
          lineHeight: 1.16,
          color: INK,
          textAlign: "center",
          margin: "0 0 6px",
          maxWidth: 620,
          textWrap: "balance",
        }}
      >
        {data.memoryLaneTitle}
      </h2>

      <p
        style={{
          fontFamily: SCRIPT,
          fontSize: "clamp(18px,5vw,23px)",
          color: PINK_DEEP,
          textAlign: "center",
          margin: "0 0 22px",
          opacity: 0.9,
        }}
      >
        {data.senderName || "me"} &amp; {data.recipientName || "you"}
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "18px 14px",
          width: "100%",
          maxWidth: memories.length <= 2 ? 420 : 660,
          margin: "0 auto",
        }}
      >
        {memories.map((m, i) => (
          <div
            key={`${i}-${m.imageUrl.slice(-24)}`}
            className={reduced ? "ps-pola" : "ps-pola ps-pop"}
            style={{ animationDelay: reduced ? undefined : `${140 + i * 90}ms`, position: "relative" }}
          >
            <div
              className="ps-pola-in"
              style={{
                transform: `rotate(${TILTS[i % TILTS.length]}deg)`,
                background: "#fff",
                borderRadius: 10,
                padding: "9px 9px 0",
                boxShadow: "0 16px 34px -18px rgba(150,80,110,.55), 0 2px 6px -2px rgba(150,80,110,.2)",
              }}
            >
              {/* washi tape, alternating corners */}
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
                style={{
                  fontFamily: SCRIPT,
                  fontSize: "clamp(15px,3.9vw,18px)",
                  lineHeight: 1.2,
                  color: "#5b3a4a",
                  textAlign: "center",
                  // The thick bottom strip that makes a polaroid a polaroid.
                  padding: "10px 4px 16px",
                  margin: 0,
                  minHeight: 52,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {m.caption}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className={reduced ? undefined : "ps-bob"}
        src={ASSETS.askHero}
        alt="An illustrated couple mid-proposal inside a heart"
        style={{
          width: "clamp(112px,32vw,150px)",
          height: "auto",
          margin: "26px auto 2px",
          display: "block",
          objectFit: "contain",
          filter: "drop-shadow(0 12px 20px rgba(200,110,150,.26))",
        }}
      />

      <button
        type="button"
        onClick={onNext}
        className="ps-btn ps-rise"
        style={{
          animationDelay: `${ctaDelay}ms`,
          border: "none",
          cursor: "pointer",
          marginTop: 10,
          padding: "14px 26px",
          borderRadius: 999,
          background: PINK_GRADIENT,
          color: "#fff",
          fontFamily: DISPLAY,
          fontWeight: 700,
          fontSize: "clamp(15px,4.3vw,18px)",
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
        <span className="ps-hint-hover">hover a photo to straighten it out</span>
        <span className="ps-hint-tap">tap a photo to straighten it out</span>
      </p>
    </section>
  );
}
