"use client";

// ─── EndingActions — the four buttons every ending has ───────────────────────
//
//   1. Send one back on WhatsApp (prefilled reply — day default or your text)
//   2. Save the keepsake PNG (1080×1920)
//   3. Replay
//   4. "Make one for someone" → /templates (live mode only — it's the growth loop)
//
//   <EndingActions day={day} data={data} mode={mode} onReplay={restart}
//     keepsake={() => defaultKeepsake(day, data, { headline: "said YES 💍" })} />

import { useState, type CSSProperties } from "react";
import Link from "next/link";
import type { DayConfig, ValentineDayData } from "../types";
import { FONTS, VW } from "../theme";
import { defaultKeepsake, downloadKeepsake, type KeepsakeLayout } from "./keepsake";
import { haptic } from "./haptic";

export interface EndingActionsProps {
  day: DayConfig;
  data: ValentineDayData;
  mode: "preview" | "live";
  onReplay?: () => void;
  /** Layout (or a builder) for the keepsake. Defaults to defaultKeepsake(day, data). */
  keepsake?: KeepsakeLayout | (() => KeepsakeLayout);
  /** WhatsApp text. Defaults to the day's reply line. */
  replyText?: string;
  /** The WhatsApp button's label (default "💬 Send one back"). */
  replyLabel?: string;
  style?: CSSProperties;
}

export default function EndingActions({ day, data, mode, onReplay, keepsake, replyText, replyLabel = "💬 Send one back", style }: EndingActionsProps) {
  const [saving, setSaving] = useState<"idle" | "busy" | "failed" | "done">("idle");
  const reply = (replyText ?? (day.extras.some((f) => f.key === "kissBackText") && typeof data.extras.kissBackText === "string" && data.extras.kissBackText ? data.extras.kissBackText : day.copy.replyText)) as string;
  const wa = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${reply}${data.senderName ? `\n— to ${data.senderName}` : ""}`)}`;

  const save = async () => {
    setSaving("busy");
    haptic(10);
    const layout = typeof keepsake === "function" ? keepsake() : keepsake ?? defaultKeepsake(day, data);
    const ok = await downloadKeepsake(layout, `${day.slug}-${data.recipientName || "keepsake"}`);
    setSaving(ok ? "done" : "failed");
  };

  const base: CSSProperties = {
    minHeight: 50,
    padding: "12px 18px",
    borderRadius: 16,
    font: `600 15px ${FONTS.ui}`,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    textDecoration: "none",
    border: `1.5px solid ${VW.edge}`,
    background: VW.glass,
    color: VW.ink,
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
  };

  return (
    <div style={{ display: "grid", gap: 10, width: "100%", maxWidth: 380, ...style }}>
      <a
        href={wa}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => haptic(10)}
        style={{ ...base, border: 0, background: VW.accent, color: VW.accentInk, boxShadow: `0 5px 0 ${VW.accentDeep}`, fontSize: 16 }}
      >
        {replyLabel}
      </a>
      <div style={{ display: "grid", gridTemplateColumns: onReplay ? "1fr 1fr" : "1fr", gap: 10 }}>
        <button type="button" onClick={save} disabled={saving === "busy"} style={base} aria-live="polite">
          {saving === "busy" ? "Making it…" : saving === "done" ? "Saved ✓" : saving === "failed" ? "Try again" : "⬇ Keepsake"}
        </button>
        {onReplay && (
          <button type="button" onClick={onReplay} style={base}>
            ↺ Replay
          </button>
        )}
      </div>
      {saving === "failed" && <p style={{ margin: 0, font: `400 13px ${FONTS.ui}`, color: VW.inkSoft, textAlign: "center" }}>Couldn&apos;t save here — take a screenshot instead 📸</p>}
      {mode === "live" && (
        <Link href="/templates" style={{ ...base, background: "transparent", border: 0, minHeight: 44, fontSize: 14, color: VW.inkSoft }}>
          ✨ Make one for someone
        </Link>
      )}
    </div>
  );
}
