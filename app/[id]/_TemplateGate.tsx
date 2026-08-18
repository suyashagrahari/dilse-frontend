"use client";

// ─── A password gate that borrows the calling template's palette ─────────────
//
// The older viewers in this directory each carry their own copy of this screen.
// That was fine at two templates and is not at four more: the copies had already
// drifted (different error strings, one missing `autoFocus`, one gating on
// `loading` before `pw.trim()`), and every drift is a bug somebody has to find
// twice. So the four templates added in this batch share this one.
//
// It is still not a generic component with a house style — the whole point of
// the per-template gates is that the unlock reads as the FRONT DOOR of the same
// artifact rather than as a different product bolted on in front of it. So the
// caller passes its own tokens and its own words, and nothing here has a colour
// or a typeface of its own.
//
// The unlock is remembered in sessionStorage under a per-template, per-share key
// so that a reload inside the same tab does not re-prompt. That is the platform
// mechanism every other viewer here already uses; it is not template state.

import { useCallback, useState } from "react";
import { API_URL, IS_NGROK } from "@/lib/config";

export interface GatePalette {
  /** Page behind the card. */
  surround: string;
  /** The card itself. */
  card: string;
  edge: string;
  ink: string;
  muted: string;
  accent: string;
  accentInk: string;
  /** Tint behind the card's header strip. */
  accentTint: string;
  font: string;
  /** 0 for the templates that have no rounded corners (the challan). */
  radius: number;
  danger?: string;
}

function IconLock() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
      <path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7" />
    </svg>
  );
}

export function TemplateGate({
  shareId,
  onUnlocked,
  /** The API segment, e.g. "challan-pages". */
  apiBase,
  /** sessionStorage key prefix, e.g. "challan". */
  storageKey,
  title,
  blurb,
  badge,
  palette,
}: {
  shareId: string;
  onUnlocked: () => void;
  apiBase: string;
  storageKey: string;
  title: string;
  blurb: string;
  badge: React.ReactNode;
  palette: GatePalette;
}) {
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const danger = palette.danger ?? "#C0563F";

  const verify = useCallback(async () => {
    if (!pw.trim() || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/${apiBase}/share/${shareId}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
        },
        body: JSON.stringify({ password: pw }),
      });
      const result = await res.json();
      if (result?.success && result.verified) {
        try { sessionStorage.setItem(`${storageKey}_unlocked_${shareId}`, "true"); } catch {}
        onUnlocked();
      } else {
        setError("Wrong password. Try again.");
        setPw("");
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }, [pw, loading, shareId, apiBase, storageKey, onUnlocked]);

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: palette.surround,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 380,
          background: palette.card,
          border: `1px solid ${palette.edge}`,
          borderRadius: palette.radius,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background: palette.accentTint,
            padding: "18px 20px",
            display: "flex",
            alignItems: "center",
            gap: 9,
            color: palette.accent,
          }}
        >
          {badge}
        </div>

        <div style={{ padding: 20 }}>
          <div style={{ color: palette.accent, marginBottom: 10 }}>
            <IconLock />
          </div>
          <h1 style={{ margin: 0, fontFamily: palette.font, fontSize: 17, fontWeight: 700, color: palette.ink }}>
            {title}
          </h1>
          <p style={{ margin: "6px 0 16px", fontFamily: palette.font, fontSize: 13, lineHeight: 1.55, color: palette.muted }}>
            {blurb}
          </p>

          <input
            type="password"
            value={pw}
            onChange={(ev) => { setPw(ev.target.value); setError(""); }}
            onKeyDown={(ev) => { if (ev.key === "Enter") verify(); }}
            placeholder="Password"
            aria-label="Password"
            autoFocus
            style={{
              width: "100%",
              height: 46,
              minHeight: 46,
              borderRadius: palette.radius === 0 ? 0 : 8,
              border: `1px solid ${error ? danger : palette.edge}`,
              background: palette.card,
              padding: "0 12px",
              fontFamily: palette.font,
              fontSize: 14,
              color: palette.ink,
              outline: "none",
            }}
          />

          {error ? (
            <p aria-live="polite" style={{ margin: "8px 0 0", fontFamily: palette.font, fontSize: 12, color: danger }}>
              {error}
            </p>
          ) : null}

          <button
            type="button"
            onClick={verify}
            disabled={loading || !pw.trim()}
            style={{
              marginTop: 14,
              width: "100%",
              height: 48,
              minHeight: 48,
              borderRadius: palette.radius === 0 ? 0 : 8,
              border: `1px solid ${palette.accent}`,
              background: palette.accent,
              color: palette.accentInk,
              fontFamily: palette.font,
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.1em",
              opacity: loading || !pw.trim() ? 0.5 : 1,
              cursor: loading || !pw.trim() ? "default" : "pointer",
            }}
          >
            {loading ? "VERIFYING…" : "CONTINUE"}
          </button>
        </div>
      </div>
    </div>
  );
}

/** The shared "is this already unlocked in this tab?" read. */
export function initialUnlocked(hasPassword: boolean, storageKey: string, shareId: string): boolean {
  if (typeof window === "undefined") return !hasPassword;
  if (!hasPassword) return true;
  try { return sessionStorage.getItem(`${storageKey}_unlocked_${shareId}`) === "true"; } catch { return false; }
}

export default TemplateGate;
