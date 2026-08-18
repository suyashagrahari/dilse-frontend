// ─── The recipient's page ────────────────────────────────────────────────────
//
// What somebody sees when they open the link: the password gate if there is
// one, and then the call, ringing.
//
// The gate posts to the public verify endpoint and remembers the answer in
// `call_unlocked_<shareId>` for the tab — the same two keys this template is
// allowed (`call_draft` and this one) and no others. The brand mark inside
// `CallTemplate` doubles as the recipient's own way to make one.

"use client";

import { useCallback, useState } from "react";
import CallTemplate from "@/app/(templates)/call/components/CallTemplate";
import { dbToCallData } from "@/app/(templates)/call/components/types";
import { DARK, FONT, TAP } from "@/app/(templates)/call/components/theme";
import { LockGlyph } from "@/app/(templates)/call/components/icons";
import { API_URL, IS_NGROK } from "@/lib/config";

function CallPasswordGate({ shareId, onUnlocked }: { shareId: string; onUnlocked: () => void }) {
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const verify = useCallback(async () => {
    if (!pw.trim() || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/call-pages/share/${shareId}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
        },
        body: JSON.stringify({ password: pw }),
      });
      const result = await res.json();
      if (result.success && result.verified) {
        try {
          sessionStorage.setItem(`call_unlocked_${shareId}`, "true");
        } catch {
          /* a locked-down webview just asks again next time */
        }
        onUnlocked();
        return;
      }
      setError("Wrong password. Try again.");
      setPw("");
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
        display: "grid",
        placeItems: "center",
        padding: 22,
        background: DARK.surround,
        fontFamily: FONT,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 340,
          padding: 24,
          borderRadius: 18,
          background: DARK.card,
          border: `1px solid ${DARK.edge}`,
          color: DARK.text,
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            display: "grid",
            placeItems: "center",
            margin: "0 auto 16px",
            background: "rgba(29,163,98,0.14)",
            border: "1px solid rgba(29,163,98,0.32)",
          }}
        >
          <LockGlyph size={22} color={DARK.accentWarm} />
        </div>

        <h1 style={{ margin: 0, fontSize: 19, fontWeight: 600, textAlign: "center" }}>This call is private</h1>
        <p style={{ margin: "8px 0 18px", fontSize: 13.5, lineHeight: 1.5, color: DARK.dim, textAlign: "center" }}>
          Enter the password to take it.
        </p>

        <input
          type="password"
          value={pw}
          onChange={(event) => {
            setPw(event.target.value);
            setError("");
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") void verify();
          }}
          placeholder="Password"
          aria-label="Password"
          autoFocus
          style={{
            width: "100%",
            minHeight: TAP,
            padding: "12px 14px",
            borderRadius: 12,
            fontSize: 15,
            fontFamily: FONT,
            color: DARK.text,
            background: "#12171C",
            border: `1px solid ${error ? DARK.danger : DARK.edge}`,
            outline: "none",
          }}
        />

        {error ? (
          <p aria-live="polite" style={{ margin: "8px 0 0", fontSize: 12.5, color: DARK.danger, textAlign: "center" }}>
            {error}
          </p>
        ) : null}

        <button
          type="button"
          onClick={() => void verify()}
          disabled={loading || !pw.trim()}
          style={{
            width: "100%",
            minHeight: TAP + 4,
            marginTop: 14,
            borderRadius: 12,
            border: "none",
            background: DARK.accentWarm,
            color: "#fff",
            fontFamily: FONT,
            fontSize: 15,
            fontWeight: 600,
            cursor: loading || !pw.trim() ? "default" : "pointer",
            opacity: loading || !pw.trim() ? 0.55 : 1,
            touchAction: "manipulation",
          }}
        >
          {loading ? "Checking…" : "Open the call"}
        </button>
      </div>
    </div>
  );
}

export default function CallViewer({
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
    try {
      return sessionStorage.getItem(`call_unlocked_${shareId}`) === "true";
    } catch {
      return false;
    }
  });

  if (hasPassword && !unlocked) {
    return <CallPasswordGate shareId={shareId} onUnlocked={() => setUnlocked(true)} />;
  }

  return <CallTemplate data={dbToCallData(rawData)} mode="live" shareId={shareId} hasPassword={hasPassword} />;
}
