"use client";

// The exported 9:16 composition. Rules that matter here:
//   - No <video>: html-to-image serialises it as a blank box.
//   - No cross-origin <img>: it taints the canvas and the whole export throws,
//     so the face is inlined as a data URL first and falls back to the initial
//     disc if that fails. The S3 character art never appears in here.
//   - Fixed pixel size, scaled for display only. exportNodeToPng un-scales it.

import { forwardRef } from "react";
import { ACCENT, INK, INK_SOFT, PAPER, PAPER_EDGE, faceFill, initialOf, warmBot, warmTop } from "./catchTheme";

export const SHARE_W = 405;
export const SHARE_H = 720;

export interface ShareCardProps {
  recipientName: string;
  senderName: string;
  /** Already a data URL, or empty. Never a remote URL. */
  faceData: string;
  lines: string[];
  closingLine: string;
  warmth: number;
}

const ShareCard = forwardRef<HTMLDivElement, ShareCardProps>(function ShareCard(
  { recipientName, senderName, faceData, lines, closingLine, warmth },
  ref,
) {
  // "The best four lines if long" — the first four in letter order keeps the
  // narrative reading the way it was written.
  const shown = lines.length > 5 ? lines.slice(0, 4) : lines;
  const trimmed = lines.length > shown.length;

  return (
    <div
      ref={ref}
      style={{
        width: SHARE_W,
        height: SHARE_H,
        background: `linear-gradient(180deg, ${warmTop(warmth)} 0%, ${warmBot(warmth)} 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "34px 28px 26px",
        boxSizing: "border-box",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: 96,
          height: 96,
          borderRadius: 999,
          overflow: "hidden",
          background: faceFill(recipientName),
          boxShadow: "0 0 0 3px rgba(255,253,247,0.95)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {faceData ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={faceData}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
          />
        ) : (
          <span
            style={{
              color: "rgba(255,253,247,0.95)",
              fontSize: 40,
              fontWeight: 600,
              fontFamily: "var(--font-outfit), system-ui, sans-serif",
              lineHeight: 1,
            }}
          >
            {initialOf(recipientName)}
          </span>
        )}
      </div>

      <div
        style={{
          marginTop: 14,
          fontSize: 10,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: INK_SOFT,
          fontFamily: "var(--font-outfit), system-ui, sans-serif",
        }}
      >
        for {recipientName}
      </div>

      <div
        style={{
          marginTop: 16,
          flex: 1,
          width: "100%",
          background: PAPER,
          border: `1px solid ${PAPER_EDGE}`,
          borderRadius: 18,
          padding: "20px 20px 18px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          overflow: "hidden",
        }}
      >
        {shown.map((line, i) => (
          <p
            key={i}
            style={{
              margin: 0,
              fontSize: 14,
              lineHeight: 1.62,
              color: INK,
              fontFamily: "var(--font-tinos), Georgia, serif",
              wordBreak: "break-word",
            }}
          >
            {line}
          </p>
        ))}
        {trimmed && (
          <p style={{ margin: 0, fontSize: 12, color: INK_SOFT, fontFamily: "var(--font-tinos), Georgia, serif" }}>
            …and {lines.length - shown.length} more, in the full letter.
          </p>
        )}
        <p
          style={{
            margin: "auto 0 0",
            paddingTop: 12,
            borderTop: `1px solid ${PAPER_EDGE}`,
            fontSize: 13,
            lineHeight: 1.6,
            fontStyle: "italic",
            color: ACCENT,
            fontFamily: "var(--font-tinos), Georgia, serif",
            wordBreak: "break-word",
          }}
        >
          {closingLine}
        </p>
      </div>

      <div
        style={{
          marginTop: 14,
          width: "100%",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            fontSize: 13,
            color: INK,
            fontFamily: "var(--font-tinos), Georgia, serif",
          }}
        >
          {senderName} <span style={{ color: INK_SOFT }}>→</span> {recipientName}
        </div>
        <div
          style={{
            fontSize: 9,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "rgba(107,101,89,0.75)",
            fontFamily: "var(--font-outfit), system-ui, sans-serif",
          }}
        >
          SubhSandesh
        </div>
      </div>
    </div>
  );
});

export default ShareCard;
