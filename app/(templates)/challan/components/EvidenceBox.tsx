"use client";

// ─── The evidence box ────────────────────────────────────────────────────────
//
// The single element that decides whether the whole document reads as a scan or
// as a graphic. Everything in here is degradation, and every piece of it is
// load-bearing:
//
//   · grayscale + contrast + a hair of blur — a road camera is a cheap sensor
//     behind a dirty housing. A clean, colour-accurate photo in this frame is
//     the fastest way to make the page read as a poster.
//   · scanlines at 2px / 4% — the frame was captured, compressed, printed and
//     then photocopied. Nobody can name the effect; everybody notices its
//     absence.
//   · a yellow detection rectangle with corner ticks — the camera's own overlay,
//     burned into the pixels, not drawn by this document.
//   · a monospace timestamp bottom-right, white with a hard shadow — burned in
//     the same way, which is why it sits ON the photo rather than beside it.
//
// The plate inset beneath is the cropped zoom every challan carries, because a
// number plate at frame scale is unreadable and the notice has to prove it read
// one.
//
// LEGAL: this is a frame of a VEHICLE. It is never a portrait beside a name and
// a number in a card layout — that is an identity document, which is a
// different legal category from a parody notice, and this template does not go
// anywhere near it.

import { useState } from "react";
import type { ChallanEvidence } from "./types";
import { CH, CH_SCANLINES } from "./theme";

/** The camera's detection rectangle, as a fraction of the frame. */
const BOX = { left: "11%", top: "20%", width: "50%", height: "46%" } as const;
/** Corner tick arm length, in px. */
const TICK = 8;

function CornerTicks() {
  const arm: React.CSSProperties = { position: "absolute", background: CH.detect };
  return (
    <>
      {/* top-left */}
      <span aria-hidden style={{ ...arm, left: -2, top: -2, width: TICK, height: 2 }} />
      <span aria-hidden style={{ ...arm, left: -2, top: -2, width: 2, height: TICK }} />
      {/* top-right */}
      <span aria-hidden style={{ ...arm, right: -2, top: -2, width: TICK, height: 2 }} />
      <span aria-hidden style={{ ...arm, right: -2, top: -2, width: 2, height: TICK }} />
      {/* bottom-left */}
      <span aria-hidden style={{ ...arm, left: -2, bottom: -2, width: TICK, height: 2 }} />
      <span aria-hidden style={{ ...arm, left: -2, bottom: -2, width: 2, height: TICK }} />
      {/* bottom-right */}
      <span aria-hidden style={{ ...arm, right: -2, bottom: -2, width: TICK, height: 2 }} />
      <span aria-hidden style={{ ...arm, right: -2, bottom: -2, width: 2, height: TICK }} />
    </>
  );
}

export function EvidenceBox({ evidence }: { evidence: ChallanEvidence }) {
  const [broken, setBroken] = useState(false);
  const [lastUrl, setLastUrl] = useState(evidence.imageUrl);

  // A new frame gets a fresh chance to load. Adjusted during render rather than
  // in an effect — an effect would paint the SERVER ERROR box for one frame
  // against the new photo before clearing it.
  if (lastUrl !== evidence.imageUrl) {
    setLastUrl(evidence.imageUrl);
    setBroken(false);
  }

  const missing = broken || !evidence.imageUrl;

  return (
    <div
      style={{
        width: "62%",
        minWidth: 190,
        border: `1px solid ${CH.edge}`,
        background: CH.paper,
        padding: 6,
      }}
    >
      <div
        style={{
          fontFamily: CH.serif,
          fontSize: 7,
          letterSpacing: 2.2,
          color: CH.ink,
          textTransform: "uppercase",
          marginBottom: 5,
        }}
      >
        Evidence &mdash; Frame 01
      </div>

      {/* The frame. */}
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "4 / 3",
          overflow: "hidden",
          border: `1px solid ${CH.edge}`,
          background: "#bfbfbf",
        }}
      >
        {missing ? (
          /* Server error, not a broken image icon. A challan portal that cannot
             produce its own evidence is both funnier and far more authentic
             than a torn-page glyph, and it degrades to something readable. */
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              padding: 10,
              background: "#c9c9c9",
              fontFamily: CH.mono,
              fontSize: 9.5,
              letterSpacing: 0.6,
              lineHeight: 1.6,
              color: "#3d3d3d",
            }}
          >
            IMAGE UNAVAILABLE
            <br />&mdash; SERVER ERROR
          </div>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={evidence.imageUrl}
            alt="Road camera frame of the vehicle at the place of offence"
            onError={() => setBroken(true)}
            draggable={false}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              filter: "grayscale(0.4) contrast(1.15) blur(0.4px)",
            }}
          />
        )}

        {/* Scanlines. Over everything, including the error state — the error
            page was photocopied too. */}
        <span
          aria-hidden
          style={{ position: "absolute", inset: 0, background: CH_SCANLINES, pointerEvents: "none" }}
        />

        {/* The camera's detection rectangle. */}
        <span
          aria-hidden
          style={{
            position: "absolute",
            ...BOX,
            border: `2px solid ${CH.detect}`,
            pointerEvents: "none",
          }}
        >
          <CornerTicks />
        </span>

        {/* Burned-in timestamp. */}
        <span
          style={{
            position: "absolute",
            right: 5,
            bottom: 4,
            fontFamily: CH.mono,
            fontSize: 8.5,
            letterSpacing: 0.4,
            color: "rgba(255,255,255,.82)",
            textShadow: "0 1px 2px rgba(0,0,0,.95), 0 0 1px rgba(0,0,0,.9)",
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          {evidence.timestamp}
        </span>
      </div>

      {/* The cropped plate zoom. */}
      <div
        style={{
          marginTop: 6,
          border: `1px solid ${CH.edge}`,
          padding: "4px 5px 6px",
          background: "rgba(17,17,17,.035)",
        }}
      >
        <div
          style={{
            fontFamily: CH.serif,
            fontSize: 6.8,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: CH.ink,
            marginBottom: 4,
          }}
        >
          Number Plate
        </div>
        <div
          style={{
            background: "#ffffff",
            border: `2px solid ${CH.edge}`,
            padding: "5px 4px 4px",
            textAlign: "center",
            fontFamily: CH.mono,
            fontSize: 19,
            fontWeight: 700,
            letterSpacing: 1.6,
            lineHeight: 1.1,
            color: "#000000",
            wordBreak: "break-word",
          }}
        >
          {evidence.plateText || "—"}
        </div>
      </div>
    </div>
  );
}

export default EvidenceBox;
