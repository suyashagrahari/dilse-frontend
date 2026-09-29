"use client";

// ─── The recipient's watch page ──────────────────────────────────────────────
//
// Everything the share endpoint returns is untrusted input — an older deploy's
// document, a field somebody nulled out — so it goes through `dbToWatchData`,
// which is total: every branch returns something drawable.
//
// The gate, when there is one, wears the template's own dark surface. It is the
// front door of the same thing, not a different product bolted on in front of
// it.

import { useCallback, useState } from "react";
import WatchTemplate from "@/app/(templates)/watch/components/WatchTemplate";
import { dbToWatchData } from "@/app/(templates)/watch/components/types";
import { T, FONT } from "@/app/(templates)/watch/components/theme";
import { WATCH_FONT_VARS } from "@/app/(templates)/watch/components/fonts";
import { Mark } from "@/app/(templates)/watch/components/icons";
import { API_URL, IS_NGROK } from "@/lib/config";

function WatchGate({ shareId, onUnlocked }: { shareId: string; onUnlocked: () => void }) {
  const [password, setPassword] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  const verify = useCallback(async () => {
    if (!password.trim() || checking) return;
    setChecking(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/watch-pages/share/${shareId}/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
        },
        // Trimmed like every other viewer. The stored password is trimmed at
        // save time, so sending the raw value would be the only viewer that
        // could still fail on a stray space.
        body: JSON.stringify({ password: password.trim() }),
      });
      const result = await res.json();
      if (result.success && result.verified) {
        try {
          sessionStorage.setItem(`watch_unlocked_${shareId}`, "true");
        } catch {
          /* a locked-down browser just asks again next time */
        }
        onUnlocked();
        return;
      }
      setError("Not that one. Try again.");
      setPassword("");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setChecking(false);
    }
  }, [password, checking, shareId, onUnlocked]);

  return (
    <div
      className={WATCH_FONT_VARS}
      style={{
        minHeight: "100dvh",
        background: T.page,
        color: T.ink,
        fontFamily: FONT,
        display: "grid",
        placeItems: "center",
        padding: 20,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 360,
          background: T.raised,
          border: `1px solid ${T.line}`,
          borderRadius: 16,
          padding: 24,
        }}
      >
        <p style={{ margin: 0, display: "flex", alignItems: "center", gap: 4, fontSize: 22, fontWeight: 700, letterSpacing: "-0.06em" }}>
          <Mark size={28} />
          us.
        </p>
        <h1 style={{ margin: "14px 0 6px", fontSize: 17, fontWeight: 700, fontFamily: "inherit" }}>This video is private</h1>
        <p style={{ margin: "0 0 16px", fontSize: 13.5, lineHeight: "19px", color: T.inkSoft }}>
          It was made for one person. Type the password they gave you and it starts playing.
        </p>

        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") void verify();
          }}
          placeholder="Password"
          aria-label="Password"
          autoFocus
          style={{
            width: "100%",
            height: 46,
            padding: "0 14px",
            borderRadius: 12,
            border: `1px solid ${error ? T.accent : T.line}`,
            background: T.page,
            color: T.ink,
            fontFamily: FONT,
            fontSize: 15,
            outline: "none",
          }}
        />
        {error ? (
          <p style={{ margin: "8px 0 0", fontSize: 12.5, color: T.accent }} role="alert">
            {error}
          </p>
        ) : null}

        <button
          type="button"
          onClick={() => void verify()}
          disabled={checking || !password.trim()}
          style={{
            width: "100%",
            height: 46,
            marginTop: 14,
            borderRadius: 12,
            border: 0,
            background: password.trim() ? T.accent : T.chip,
            color: password.trim() ? "#FFFFFF" : T.inkSoft,
            fontFamily: FONT,
            fontSize: 15,
            fontWeight: 700,
            cursor: password.trim() ? "pointer" : "default",
          }}
        >
          {checking ? "Checking…" : "Watch it"}
        </button>
      </div>
    </div>
  );
}

export default function WatchViewer({
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
      return sessionStorage.getItem(`watch_unlocked_${shareId}`) === "true";
    } catch {
      return false;
    }
  });

  const onUnlocked = useCallback(() => setUnlocked(true), []);

  if (hasPassword && !unlocked) {
    return <WatchGate shareId={shareId} onUnlocked={onUnlocked} />;
  }

  return (
    <WatchTemplate
      data={dbToWatchData(rawData)}
      mode="live"
      shareId={shareId}
      hasPassword={hasPassword}
    />
  );
}
