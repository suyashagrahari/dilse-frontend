"use client";

import { useState } from "react";
import { ACCENT, BG_RAISED, FONT_BODY, FONT_DISPLAY, TEXT, TEXT_DIM, Z } from "./theme";
import type { GraphReport } from "./types";

/**
 * The visible failure surface for a bad scene graph.
 *
 * The whole reason `validateSceneGraph` exists is that a dead-ended branch
 * renders a blank screen with no error. So in development the errors get a
 * loud, specific, un-dismissable-until-read panel naming the scene id at fault,
 * and the player runs the demo episode behind it rather than walking into an
 * unrenderable node.
 *
 * This never renders in production — `useSceneGraph` has already swapped in the
 * demo episode by then, and a recipient must not be shown a developer's
 * mistake. Warnings alone render a quieter badge, because uneven branch lengths
 * are worth knowing about but are not a reason to shout.
 */
export default function DevErrorPanel({
  report,
  usedFallback,
  brandHits,
}: {
  report: GraphReport;
  usedFallback: boolean;
  /** Output of `assertBrandSafe(data)`. Non-empty means something slipped. */
  brandHits: string[];
}) {
  const [open, setOpen] = useState(true);

  if (process.env.NODE_ENV === "production") return null;

  const fatal = report.errors.length > 0 || brandHits.length > 0;
  if (!fatal && report.warnings.length === 0) return null;

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        style={{
          position: "fixed",
          left: 12,
          bottom: 12,
          zIndex: Z.devPanel,
          padding: "8px 12px",
          minHeight: 44,
          borderRadius: 6,
          border: `1px solid ${fatal ? "#ff6b6b" : ACCENT}`,
          background: BG_RAISED,
          color: fatal ? "#ff6b6b" : ACCENT,
          fontFamily: FONT_BODY,
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
        }}
      >
        {fatal ? `${report.errors.length + brandHits.length} graph errors` : `${report.warnings.length} warnings`}
      </button>
    );
  }

  return (
    <div
      role="alert"
      style={{
        position: "fixed",
        left: 12,
        right: 12,
        bottom: 12,
        maxWidth: 560,
        zIndex: Z.devPanel,
        borderRadius: 8,
        overflow: "hidden",
        border: `1px solid ${fatal ? "#ff6b6b" : ACCENT}`,
        background: BG_RAISED,
        boxShadow: "0 24px 60px -20px rgba(0,0,0,0.9)",
        fontFamily: FONT_BODY,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 12px",
          background: fatal ? "rgba(255,107,107,0.12)" : "rgba(232,145,58,0.12)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <span
          style={{
            fontFamily: FONT_DISPLAY,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontSize: 12,
            color: fatal ? "#ff6b6b" : ACCENT,
          }}
        >
          {fatal ? "Scene graph is invalid" : "Scene graph warnings"}
        </span>
        <span style={{ flex: 1 }} />
        <button
          onClick={() => setOpen(false)}
          aria-label="Collapse developer panel"
          style={{
            minWidth: 44,
            minHeight: 30,
            border: "none",
            background: "transparent",
            color: TEXT_DIM,
            fontSize: 16,
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>

      <div style={{ padding: "10px 12px 12px", maxHeight: "38vh", overflowY: "auto" }}>
        {usedFallback && (
          <p style={{ margin: "0 0 8px", fontSize: 11, color: ACCENT, fontWeight: 600 }}>
            Playing the demo episode instead. Fix the errors below and the authored one comes back.
          </p>
        )}

        {brandHits.map((h) => (
          <Line key={h} tone="#ff6b6b" label="brand" text={h} />
        ))}
        {report.errors.map((e) => (
          <Line key={e} tone="#ff6b6b" label="error" text={e} />
        ))}
        {report.warnings.map((w) => (
          <Line key={w} tone={ACCENT} label="warn" text={w} />
        ))}

        {report.pathDepths.length > 0 && (
          <p style={{ margin: "8px 0 0", fontSize: 10, color: TEXT_DIM, letterSpacing: "0.04em" }}>
            {report.pathDepths.length} root→finale path{report.pathDepths.length === 1 ? "" : "s"}, depths{" "}
            {Math.min(...report.pathDepths)}–{Math.max(...report.pathDepths)}
          </p>
        )}
      </div>
    </div>
  );
}

function Line({ tone, label, text }: { tone: string; label: string; text: string }) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 6 }}>
      <span
        style={{
          flexShrink: 0,
          marginTop: 1,
          padding: "1px 5px",
          borderRadius: 3,
          border: `1px solid ${tone}`,
          color: tone,
          fontSize: 9,
          fontWeight: 700,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <span style={{ fontSize: 12, lineHeight: 1.45, color: TEXT, wordBreak: "break-word" }}>{text}</span>
    </div>
  );
}
