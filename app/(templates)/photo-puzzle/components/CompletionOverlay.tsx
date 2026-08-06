"use client";

// ─── What the completion sequence puts in the DOM ────────────────────────────
//
// The seam fade and the cross-dissolve are canvas work and belong to the
// engine; this component only reacts to the phase it is given.
//
// The staging matters. `sealed` arrives while the photograph is still becoming
// whole, and nothing appears then — that beat of silence is the point. The copy
// and the save control only arrive on `complete`, after the reveal has landed.

import { INK, INK_SOFT, INDIGO, RADIUS, SERIF, OUTFIT } from "./puzzleTheme";

export interface CompletionOverlayProps {
  /** "sealing" | "dissolving" | "complete" drive the staging. */
  sealed: boolean;
  complete: boolean;
  closingLine: string;
  senderName: string;
  recipientName: string;
  saving: boolean;
  onSave: () => void;
  reducedMotion: boolean;
}

export default function CompletionOverlay({
  sealed,
  complete,
  closingLine,
  senderName,
  saving,
  onSave,
  reducedMotion,
}: CompletionOverlayProps) {
  if (!sealed) return null;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        padding: "56px 20px 20px",
        // The photograph is the reward; the scrim only exists so the words on
        // top of it stay legible.
        background: "linear-gradient(180deg, rgba(255,253,249,0) 0%, rgba(255,253,249,0.94) 58%)",
        opacity: complete ? 1 : 0,
        transform: complete || reducedMotion ? "translateY(0)" : "translateY(10px)",
        transition: reducedMotion ? undefined : "opacity 620ms ease, transform 620ms ease",
        pointerEvents: complete ? "auto" : "none",
        textAlign: "center",
      }}
    >
      <p
        style={{
          margin: "0 auto 4px",
          maxWidth: 30 * 16,
          fontFamily: SERIF,
          fontSize: 19,
          lineHeight: 1.45,
          color: INK,
        }}
      >
        {closingLine}
      </p>

      <p
        style={{
          margin: "0 0 16px",
          fontFamily: OUTFIT,
          fontSize: 12,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: INK_SOFT,
        }}
      >
        — {senderName}
      </p>

      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        style={{
          minHeight: 48,
          padding: "0 24px",
          borderRadius: RADIUS,
          border: "none",
          background: INDIGO,
          color: "#fff",
          fontFamily: OUTFIT,
          fontSize: 15,
          fontWeight: 600,
          letterSpacing: "0.02em",
          cursor: saving ? "default" : "pointer",
          opacity: saving ? 0.7 : 1,
          boxShadow: "0 8px 20px rgba(67,56,202,0.28)",
        }}
      >
        {saving ? "Saving…" : "Save the card"}
      </button>
    </div>
  );
}
