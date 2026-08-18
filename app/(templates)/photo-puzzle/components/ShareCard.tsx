"use client";

// ─── The exported 9:16 composition ───────────────────────────────────────────
//
// Fixed pixel size, scaled for display only — `exportNodeToPng` un-scales it,
// so the downloaded file is identical whatever viewport it was captured from.
// Do NOT make this responsive: a card that reflows produces a different image
// on a phone than on a laptop, from the same page.
//
// The photograph arrives here already inlined as a data URL (the board canvas's
// own snapshot), never as a remote URL. A cross-origin `<img>` would taint the
// capture and the export would fail at the last step.

import { forwardRef } from "react";
import { INDIGO, INK, INK_SOFT, OUTFIT, PAPER, ROSE, SERIF } from "./puzzleTheme";

export const SHARE_W = 405;
export const SHARE_H = 720;

export interface ShareCardProps {
  recipientName: string;
  senderName: string;
  /** Already a data URL of the completed photograph, or "". Never a remote URL. */
  imageData: string;
  /** The revealed letter, in letter order. 3–4 are shown. */
  lines: string[];
  closingLine: string;
}

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(function ShareCard(
  { recipientName, senderName, imageData, lines, closingLine },
  ref,
) {
  // Three lines fit comfortably; a fourth only if they are all short. Measuring
  // properly would mean laying out twice, and the cap is what stops the card
  // from ever overflowing.
  const picked = lines.slice(0, 4);
  const budget = picked.reduce((n, l) => n + l.length, 0);
  const shown = budget > 260 ? picked.slice(0, 3) : picked;

  return (
    <div
      ref={ref}
      style={{
        width: SHARE_W,
        height: SHARE_H,
        position: "relative",
        overflow: "hidden",
        background: PAPER,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Corner wash, so the card is not a white rectangle with a photo on it. */}
      <div
        style={{
          position: "absolute",
          top: -120,
          right: -110,
          width: 320,
          height: 320,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${ROSE}33 0%, ${ROSE}00 68%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -140,
          left: -120,
          width: 340,
          height: 340,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${INDIGO}2E 0%, ${INDIGO}00 68%)`,
        }}
      />

      <div style={{ position: "relative", padding: "30px 30px 0" }}>
        <div
          style={{
            fontFamily: OUTFIT,
            fontSize: 10,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            color: INK_SOFT,
          }}
        >
          The Last Piece
        </div>

        <div
          style={{
            marginTop: 8,
            fontFamily: SERIF,
            fontSize: 30,
            lineHeight: 1.1,
            color: INK,
          }}
        >
          {recipientName}
          <span style={{ color: ROSE }}> &amp; </span>
          {senderName}
        </div>
      </div>

      {/* The completed photograph. Square, because the board is drawn at the
          grid's aspect and a square crop is the one that never letterboxes. */}
      <div
        style={{
          position: "relative",
          margin: "20px 30px 0",
          height: 258,
          borderRadius: 18,
          overflow: "hidden",
          background: "#EEECF8",
          boxShadow: "0 14px 30px rgba(30,27,51,0.16)",
        }}
      >
        {imageData ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageData}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : null}
      </div>

      <div style={{ position: "relative", padding: "22px 30px 0", flex: 1 }}>
        {shown.map((line, i) => (
          <p
            key={i}
            style={{
              margin: "0 0 10px",
              fontFamily: SERIF,
              fontSize: 15,
              lineHeight: 1.42,
              color: INK,
            }}
          >
            {line}
          </p>
        ))}

        <p
          style={{
            margin: "16px 0 0",
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: 16,
            lineHeight: 1.4,
            color: INDIGO,
          }}
        >
          {closingLine}
        </p>
      </div>

      <div
        style={{
          position: "relative",
          padding: "0 30px 26px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            fontFamily: OUTFIT,
            fontSize: 10,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: INK_SOFT,
          }}
        >
          twelve pieces · one letter
        </div>
        <div
          style={{
            fontFamily: OUTFIT,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.06em",
            color: INK_SOFT,
          }}
        >
          SubhSandesh
        </div>
      </div>
    </div>
  );
});

export default ShareCard;
