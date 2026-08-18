"use client";

// ─── ProductViewer — what the recipient opens ────────────────────────────────
//
// The share page for `/product`. Two jobs: the password gate, and handing the
// raw share document to the listing in `mode="live"`, which is where the
// contribution poll and the SubhSandesh badge switch on.
//
// The gate stores its answer in `product_unlocked_<shareId>` in sessionStorage
// — the only key this template writes there — so a refresh mid-read does not
// ask again, and closing the tab forgets.

import { useCallback, useState } from "react";
import ProductTemplate from "@/app/(templates)/product/components/ProductTemplate";
import { dbToProductData } from "@/app/(templates)/product/components/types";
import { C, FONT, LockGlyph, WRAP } from "@/app/(templates)/product/components/tokens";
import { API_URL, IS_NGROK } from "@/lib/config";

function ProductPasswordGate({ shareId, onUnlocked }: { shareId: string; onUnlocked: () => void }) {
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const verify = useCallback(async () => {
    if (!pw.trim() || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/product-pages/share/${shareId}/verify`, {
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
          sessionStorage.setItem(`product_unlocked_${shareId}`, "true");
        } catch {
          /* a blocked store just means they answer again on refresh */
        }
        onUnlocked();
      } else {
        setError("That is not it. Try again.");
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
        position: "fixed",
        inset: 0,
        zIndex: 200,
        display: "grid",
        placeItems: "center",
        padding: 20,
        background: C.section,
        fontFamily: FONT,
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 380,
          background: "#fff",
          border: `1px solid ${C.border}`,
          borderRadius: 10,
          padding: "26px 22px 22px",
          boxShadow: "0 4px 18px rgba(15,17,17,0.12)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <LockGlyph size={18} color={C.text} />
          <h1 style={{ margin: 0, fontSize: 19, fontWeight: 700, color: C.text }}>This listing is private</h1>
        </div>
        <p style={{ margin: "8px 0 16px", fontSize: 13.5, color: C.secondary, lineHeight: 1.55, ...WRAP }}>
          Whoever sent you this set a password on it.
        </p>

        <div style={{ position: "relative" }}>
          <input
            type={show ? "text" : "password"}
            value={pw}
            autoFocus
            aria-label="Password"
            placeholder="Enter the password"
            onChange={(ev) => {
              setPw(ev.target.value);
              setError("");
            }}
            onKeyDown={(ev) => {
              if (ev.key === "Enter") void verify();
            }}
            style={{
              width: "100%",
              padding: "11px 62px 11px 12px",
              fontSize: 14,
              fontFamily: FONT,
              color: C.text,
              borderRadius: 8,
              outline: "none",
              background: "#fff",
              border: `1px solid ${error ? C.priceRed : C.border}`,
            }}
          />
          <button
            type="button"
            onClick={() => setShow((v) => !v)}
            style={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              border: "none",
              background: "none",
              color: C.link,
              fontSize: 12.5,
              cursor: "pointer",
            }}
          >
            {show ? "Hide" : "Show"}
          </button>
        </div>

        {error ? (
          <p style={{ margin: "8px 0 0", fontSize: 12.5, color: C.priceRed }} aria-live="polite">
            {error}
          </p>
        ) : null}

        <button
          type="button"
          onClick={() => void verify()}
          disabled={loading || !pw.trim()}
          style={{
            width: "100%",
            marginTop: 14,
            minHeight: 38,
            padding: "9px 16px",
            borderRadius: 100,
            border: "1px solid #E7B93C",
            background: C.ctaYellow,
            color: C.text,
            fontFamily: FONT,
            fontSize: 14,
            fontWeight: 700,
            cursor: loading || !pw.trim() ? "default" : "pointer",
            opacity: loading || !pw.trim() ? 0.6 : 1,
          }}
        >
          {loading ? "Checking…" : "Open the listing"}
        </button>
      </div>
    </div>
  );
}

export default function ProductViewer({
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
      return sessionStorage.getItem(`product_unlocked_${shareId}`) === "true";
    } catch {
      return false;
    }
  });

  const unlock = useCallback(() => setUnlocked(true), []);

  if (hasPassword && !unlocked) {
    return <ProductPasswordGate shareId={shareId} onUnlocked={unlock} />;
  }

  const data = dbToProductData(rawData);
  return <ProductTemplate data={data} mode="live" shareId={shareId} hasPassword={hasPassword} />;
}
