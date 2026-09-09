"use client";

import { useCallback, useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { API_URL, IS_NGROK } from "@/lib/config";
import { dbToGaneshData } from "@/app/(templates)/happy-ganesh-chaturthi/components/types";
import GaneshTemplate from "@/app/(templates)/happy-ganesh-chaturthi/components/GaneshTemplate";
import { GC, BRAND_GRADIENT, CARD_BORDER, CARD_SHADOW } from "@/app/(templates)/happy-ganesh-chaturthi/components/theme";

import "@/app/(templates)/happy-ganesh-chaturthi/components/ganesh.css";

// ─── The recipient's page ────────────────────────────────────────────────────
//
// `SharePageClient` hands over the raw server document; this turns it into the
// view model and renders the same component the builder previews, with
// `mode="live"`.
//
// ── WHY THE STYLESHEET IS IMPORTED HERE TOO ─────────────────────────────────
//
// `ganesh.css` is imported by the builder's `page.tsx`, which is a completely
// different route tree. The recipient never loads that route, so without this
// import the shared page renders every screen unstyled — no toran spacing, no
// grid, no keyframes — and the failure is invisible in development, where the
// builder route has usually been visited first in the same session and the
// stylesheet is already in the document.

function PasswordGate({
  shareId,
  onUnlocked,
}: {
  shareId: string;
  onUnlocked: () => void;
}) {
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = useCallback(async () => {
    if (!pw.trim() || busy) return;
    setBusy(true);
    setErr("");
    try {
      const res = await fetch(
        `${API_URL}/ganesh-chaturthi-pages/share/${shareId}/verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
          },
          body: JSON.stringify({ password: pw }),
        }
      );
      const json = await res.json();
      if (json?.success && json.verified) {
        // Cached per share id, so a reader who reloads or opens a second screen
        // of the same page is not asked again. `sessionStorage` and not
        // `localStorage`: it should not outlive the tab.
        try {
          sessionStorage.setItem(`ganesh_unlocked_${shareId}`, "true");
        } catch {
          // Private mode, or site data blocked. The unlock still works for this
          // render — it just will not survive a reload, which is the right
          // failure.
        }
        onUnlocked();
      } else {
        setErr("Wrong password. Try again.");
        setPw("");
      }
    } catch {
      setErr("Could not check that — check your connection.");
    } finally {
      setBusy(false);
    }
  }, [pw, busy, shareId, onUnlocked]);

  return (
    <div
      className="gc-root fixed inset-0 z-[200] grid place-items-center px-6"
      style={{ background: `linear-gradient(170deg, ${GC.paper} 0%, ${GC.paperDeep} 100%)` }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 360,
          background: GC.surface,
          border: CARD_BORDER,
          boxShadow: CARD_SHADOW,
          borderRadius: 22,
          padding: 24,
          textAlign: "center",
        }}
      >
        <div
          aria-hidden
          style={{
            width: 52,
            height: 52,
            margin: "0 auto 14px",
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            background: "rgba(193,39,45,0.1)",
            border: `1px solid ${GC.goldSoft}`,
          }}
        >
          <Lock size={22} color={GC.maroon} />
        </div>

        <p className="gc-eyebrow" style={{ margin: "0 0 10px" }}>
          Ganesh Chaturthi
        </p>
        <h1
          className="gc-display"
          style={{ fontSize: 21, fontWeight: 700, color: GC.maroon, margin: "0 0 6px" }}
        >
          This one is locked
        </h1>
        <p style={{ fontSize: 13, color: GC.muted, margin: "0 0 18px", lineHeight: 1.5 }}>
          Whoever sent it will have told you the password.
        </p>

        <div style={{ position: "relative" }}>
          <input
            type={show ? "text" : "password"}
            value={pw}
            onChange={(ev) => setPw(ev.target.value)}
            // Enter is how anybody actually submits a one-field form, and a
            // password field with no <form> around it does not get it for free.
            onKeyDown={(ev) => {
              if (ev.key === "Enter") void submit();
            }}
            placeholder="Password"
            autoFocus
            autoComplete="off"
            aria-label="Password"
            style={{
              width: "100%",
              padding: "12px 44px 12px 14px",
              borderRadius: 12,
              border: `1.5px solid ${err ? GC.maroon : GC.hairline}`,
              background: GC.paper,
              color: GC.ink,
              fontSize: 16,
              fontFamily: "inherit",
              minHeight: 48,
              outline: "none",
            }}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Hide password" : "Show password"}
            style={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              width: 32,
              height: 32,
              borderRadius: 8,
              border: "none",
              background: "transparent",
              color: GC.muted,
              display: "grid",
              placeItems: "center",
              cursor: "pointer",
            }}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        {err && (
          <p role="alert" style={{ fontSize: 12.5, color: GC.maroon, margin: "9px 0 0" }}>
            {err}
          </p>
        )}

        <button
          type="button"
          onClick={() => void submit()}
          disabled={!pw.trim() || busy}
          style={{
            width: "100%",
            marginTop: 16,
            minHeight: 50,
            borderRadius: 999,
            background: BRAND_GRADIENT,
            color: "#fffdf7",
            border: CARD_BORDER,
            boxShadow: CARD_SHADOW,
            fontSize: 15.5,
            fontWeight: 700,
            cursor: !pw.trim() || busy ? "default" : "pointer",
            opacity: !pw.trim() || busy ? 0.6 : 1,
          }}
        >
          {busy ? "Checking…" : "Open it"}
        </button>
      </div>
    </div>
  );
}

export default function GaneshChaturthiViewer({
  rawData,
  hasPassword,
  shareId,
}: {
  rawData: Record<string, unknown>;
  hasPassword: boolean;
  shareId: string;
}) {
  const [unlocked, setUnlocked] = useState(() => {
    if (!hasPassword) return true;
    if (typeof window === "undefined") return false;
    try {
      return sessionStorage.getItem(`ganesh_unlocked_${shareId}`) === "true";
    } catch {
      return false;
    }
  });

  if (hasPassword && !unlocked) {
    return <PasswordGate shareId={shareId} onUnlocked={() => setUnlocked(true)} />;
  }

  const data = dbToGaneshData(rawData);
  return (
    <GaneshTemplate data={data} mode="live" shareId={shareId} hasPassword={hasPassword} />
  );
}
