"use client";

// ─── The published recharge ──────────────────────────────────────────────────
//
// Password gate, then the flow. The gate borrows the template's own palette and
// its own flat chrome so the unlock reads as the front door of the same utility
// app rather than as a different product bolted on in front of it.

import { useCallback, useState } from "react";
import RechargeTemplate from "@/app/(templates)/recharge/components/RechargeTemplate";
import { dbToRechargeData } from "@/app/(templates)/recharge/components/types";
import {
  ACCENT,
  ACCENT_TINT,
  BORDER,
  FONT,
  INK,
  MUTED,
  OperatorMark,
  SURROUND,
} from "@/app/(templates)/recharge/components/ui";
import { API_URL, IS_NGROK } from "@/lib/config";

function IconLock() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
      <path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7" />
    </svg>
  );
}

function RechargePasswordGate({ shareId, onUnlocked }: { shareId: string; onUnlocked: () => void }) {
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const verify = useCallback(async () => {
    if (!pw.trim() || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/recharge-pages/share/${shareId}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
        },
        body: JSON.stringify({ password: pw }),
      });
      const result = await res.json();
      if (result?.success && result.verified) {
        sessionStorage.setItem(`recharge_unlocked_${shareId}`, "true");
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
  }, [pw, loading, shareId, onUnlocked]);

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: SURROUND,
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
          background: "#FFFFFF",
          border: `1px solid ${BORDER}`,
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <div style={{ background: ACCENT_TINT, padding: "18px 20px", display: "flex", alignItems: "center", gap: 9, color: ACCENT }}>
          <OperatorMark size={22} />
          <span style={{ fontFamily: FONT, fontSize: 15, fontWeight: 700, color: ACCENT }}>Secure recharge</span>
        </div>

        <div style={{ padding: 20 }}>
          <div style={{ color: ACCENT, marginBottom: 10 }}>
            <IconLock />
          </div>
          <h1 style={{ margin: 0, fontFamily: FONT, fontSize: 17, fontWeight: 700, color: INK }}>
            This number is protected
          </h1>
          <p style={{ margin: "6px 0 16px", fontFamily: FONT, fontSize: 13, lineHeight: 1.55, color: MUTED }}>
            Enter the password to see the plans.
          </p>

          <input
            type="password"
            value={pw}
            onChange={(ev) => {
              setPw(ev.target.value);
              setError("");
            }}
            onKeyDown={(ev) => {
              if (ev.key === "Enter") verify();
            }}
            placeholder="Password"
            aria-label="Password"
            autoFocus
            style={{
              width: "100%",
              height: 46,
              borderRadius: 8,
              border: `1px solid ${error ? "#C0563F" : BORDER}`,
              background: "#FFFFFF",
              padding: "0 12px",
              fontFamily: FONT,
              fontSize: 14,
              color: INK,
              outline: "none",
            }}
          />

          {error ? (
            <p aria-live="polite" style={{ margin: "8px 0 0", fontFamily: FONT, fontSize: 12, color: "#C0563F" }}>
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
              borderRadius: 8,
              border: `1px solid ${ACCENT}`,
              background: ACCENT,
              color: "#FFFFFF",
              fontFamily: FONT,
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

export default function RechargeViewer({
  rawData,
  hasPassword,
  shareId,
}: {
  rawData: Record<string, unknown>;
  hasPassword: boolean;
  shareId: string;
}) {
  const [unlocked, setUnlocked] = useState(() => {
    if (typeof window === "undefined") return !hasPassword;
    if (!hasPassword) return true;
    return sessionStorage.getItem(`recharge_unlocked_${shareId}`) === "true";
  });

  const unlock = useCallback(() => setUnlocked(true), []);

  if (hasPassword && !unlocked) {
    return <RechargePasswordGate shareId={shareId} onUnlocked={unlock} />;
  }

  // The coercer clamps and repairs everything — the payload is untrusted input
  // and this is the one place that decides what a malformed field becomes.
  const data = dbToRechargeData(rawData);

  return <RechargeTemplate data={data} mode="live" shareId={shareId} hasPassword={hasPassword} />;
}
