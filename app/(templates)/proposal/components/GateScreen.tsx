"use client";

// ─── Act 1 — the welcome gate ────────────────────────────────────────────────
// Its real job is to collect one user gesture so audio may start. Everything
// else is theatre: a waving cat, a name in handwriting, and one button that is
// impossible to miss.

import { ASSETS } from "./assets";
import type { ProposalData } from "./types";
import { chip, DISPLAY, GLASS, INK, INK_SOFT, PINK_DEEP, PINK_GLOW, PINK_GRADIENT, SCRIPT } from "./theme";

export default function GateScreen({
  data,
  onOpen,
  reduced,
}: {
  data: ProposalData;
  onOpen: () => void;
  reduced: boolean;
}) {
  return (
    <section
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "78px 16px 40px",
      }}
    >
      <div
        className="ps-rise"
        style={{
          ...GLASS,
          width: "100%",
          maxWidth: 430,
          padding: "26px 22px 30px",
          textAlign: "center",
          position: "relative",
        }}
      >
        {/* a little washi-tape flourish so the card feels handmade */}
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: -11,
            left: "50%",
            transform: "translateX(-50%) rotate(-2.5deg)",
            width: 96,
            height: 22,
            borderRadius: 4,
            background: "linear-gradient(105deg, rgba(255,183,205,.85), rgba(200,182,255,.85))",
            boxShadow: "0 4px 10px -4px rgba(190,90,130,.45)",
          }}
        />

        <p style={{ ...chip("rgba(255,255,255,.66)", PINK_DEEP), marginBottom: 14 }}>
          <span aria-hidden>💌</span> a letter for you
        </p>

        <p
          style={{
            fontFamily: SCRIPT,
            fontSize: "clamp(26px,8vw,36px)",
            color: PINK_DEEP,
            lineHeight: 1.05,
            margin: "0 0 6px",
          }}
        >
          Dear {data.recipientName || "you"},
        </p>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className={reduced ? undefined : "ps-bob"}
          src={ASSETS.helloCat}
          alt="A cat waving hello with floating hearts"
          width={170}
          height={170}
          style={{
            width: "clamp(132px,42vw,176px)",
            height: "auto",
            margin: "2px auto 6px",
            display: "block",
            objectFit: "contain",
            filter: "drop-shadow(0 14px 22px rgba(200,110,150,.28))",
          }}
        />

        <h1
          style={{
            fontFamily: DISPLAY,
            fontWeight: 700,
            fontSize: "clamp(23px,6.6vw,33px)",
            lineHeight: 1.18,
            color: INK,
            margin: "0 0 8px",
            textWrap: "balance",
          }}
        >
          {data.gateTitle}
        </h1>

        <p style={{ fontSize: 13.5, lineHeight: 1.55, color: INK_SOFT, margin: "0 0 20px" }}>
          {data.senderName || "Someone"} made this whole thing just for you. It only takes a minute — but you
          should probably sit down first.
        </p>

        <div style={{ position: "relative", display: "inline-block" }}>
          {/* halo that breathes behind the button */}
          {!reduced && (
            <span
              aria-hidden
              className="ps-halo"
              style={{
                position: "absolute",
                inset: -8,
                borderRadius: 999,
                background: "radial-gradient(circle, rgba(255,146,180,.55) 0%, rgba(255,146,180,0) 70%)",
              }}
            />
          )}
          <button
            type="button"
            onClick={onOpen}
            className={reduced ? "ps-btn" : "ps-btn ps-pulse"}
            style={{
              position: "relative",
              border: "none",
              cursor: "pointer",
              padding: "16px 30px",
              borderRadius: 999,
              background: PINK_GRADIENT,
              color: "#fff",
              fontFamily: DISPLAY,
              fontWeight: 700,
              fontSize: "clamp(16px,4.6vw,20px)",
              letterSpacing: ".01em",
              boxShadow: PINK_GLOW,
              maxWidth: "84vw",
            }}
          >
            {data.gateButtonLabel}
          </button>
        </div>

        <p style={{ fontSize: 11.5, color: INK_SOFT, opacity: 0.85, margin: "16px 0 0" }}>
          <span aria-hidden>🎧</span> sound makes this better — tapping turns the music on
        </p>
      </div>
    </section>
  );
}
