"use client";

// ─── Screen 4 — the last card ────────────────────────────────────────────────
//
// One drag-locked card on warm stock. No game, no download, no next. The
// template ends here, which is the point of it.

import { templateMedia } from "@/lib/templateMedia";
import { HAIRLINE, INK, INK_SOFT, MONO, PAPER_WARM, SERIF } from "./flagsTheme";

interface FinalCardProps {
  text: string;
  senderName: string;
  reduced: boolean;
}

export default function FinalCard({ text, senderName, reduced }: FinalCardProps) {
  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 14,
        padding: "16px 18px calc(env(safe-area-inset-bottom, 0px) + 24px)",
      }}
    >
      {!reduced && (
        <video
          src={templateMedia("flags", "final-card.webm")}
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
          style={{ width: "min(150px, 38vw)", height: "auto", pointerEvents: "none" }}
        />
      )}

      <div
        style={{
          width: "min(340px, 86vw)",
          background: PAPER_WARM,
          border: `1px solid ${INK}`,
          borderRadius: 2,
          padding: "34px 26px 26px",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: SERIF,
            fontStyle: "italic",
            fontSize: "clamp(18px, 5.2vw, 21px)",
            lineHeight: 1.48,
            color: INK,
          }}
        >
          {text}
        </p>
        <div style={{ height: 1, background: HAIRLINE, margin: "22px 0 12px" }} />
        <p
          style={{
            margin: 0,
            textAlign: "right",
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: "0.14em",
            color: INK_SOFT,
          }}
        >
          — {senderName.toLowerCase()}
        </p>
      </div>
    </div>
  );
}
