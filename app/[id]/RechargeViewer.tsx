"use client";

// ─── The published recharge ──────────────────────────────────────────────────
//
// Password gate, then the flow. The gate borrows the template's own palette and
// its own flat chrome so the unlock reads as the front door of the same utility
// app rather than as a different product bolted on in front of it.

import { useCallback, useState } from "react";
import RechargeTemplate from "@/app/(templates)/recharge/components/RechargeTemplate";
import { dbToRechargeData } from "@/app/(templates)/recharge/components/types";
import { BERRY, BERRY_2, FONT, INK, LINE, MUTED, PINK, PINK_DEEP } from "@/app/(templates)/recharge/components/ui";
import { LogoMark } from "@/app/(templates)/recharge/components/icons";
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
        setError("Wrong password. Hint: ask them nicely 🥺");
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
        background: `radial-gradient(120% 80% at 100% 0%, #B3186F 0%, transparent 55%), linear-gradient(160deg, ${BERRY} 0%, ${BERRY_2} 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px 16px",
        fontFamily: FONT,
      }}
    >
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: "#fff", marginBottom: 18 }}>
          <LogoMark size={30} />
          <span style={{ fontFamily: "var(--font-outfit), Outfit, sans-serif", fontWeight: 800, fontSize: 24, letterSpacing: "-0.04em" }}>
            dil<span style={{ color: "#FF8CB8" }}>pay</span>
          </span>
        </div>
        <div style={{ background: "#FFFFFF", borderRadius: 24, padding: 24, boxShadow: "0 30px 60px -30px rgba(0,0,0,.6)" }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              background: "#FFE8F1",
              color: PINK_DEEP,
              display: "grid",
              placeItems: "center",
              marginBottom: 14,
            }}
          >
            <IconLock />
          </div>
          <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: INK, letterSpacing: "-0.02em" }}>A recharge is waiting for you 💗</h1>
          <p style={{ margin: "6px 0 18px", fontSize: 13.5, lineHeight: 1.5, color: MUTED }}>
            Someone locked this one. Enter the password they gave you to see your plans.
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
              height: 52,
              borderRadius: 14,
              border: `1.5px solid ${error ? "#E5383B" : LINE}`,
              background: "#FDFCFE",
              padding: "0 14px",
              fontFamily: FONT,
              fontSize: 16,
              color: INK,
              outline: "none",
              boxSizing: "border-box",
            }}
          />

          {error ? (
            <p aria-live="polite" style={{ margin: "8px 0 0", fontSize: 12.5, color: "#E5383B" }}>
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
              height: 52,
              borderRadius: 14,
              border: 0,
              background: `linear-gradient(180deg, #FF3F8A, ${PINK_DEEP})`,
              color: "#FFFFFF",
              fontFamily: FONT,
              fontSize: 15,
              fontWeight: 800,
              opacity: loading || !pw.trim() ? 0.5 : 1,
              cursor: loading || !pw.trim() ? "default" : "pointer",
            }}
          >
            {loading ? "Verifying…" : "Unlock my recharge"}
          </button>
          <p style={{ margin: "12px 0 0", textAlign: "center", fontSize: 11.5, color: "#9C96A8" }}>
            🔒 secured by <span style={{ color: PINK, fontWeight: 700 }}>dilpay</span>
          </p>
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
