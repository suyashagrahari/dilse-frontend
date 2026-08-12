"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { API_URL, IS_NGROK } from "@/lib/config";
import { useAppSelector } from "@/store/hooks";

// ─── Consent to appear on the Wall ───────────────────────────────────────────
//
// ── UNCHECKED, ALWAYS ───────────────────────────────────────────────────────
//
// `on` initialises to false and the only thing that can set it true is the
// server confirming an entry already exists, or the person clicking it. There
// is no prop, no default and no config that can pre-check this box, which is
// deliberate: a pre-ticked consent box is not consent, and the way that ships by
// accident is someone adding `defaultChecked` to make a demo look better.
//
// ── AND REMOVABLE, INSTANTLY ────────────────────────────────────────────────
//
// Unticking calls DELETE and the row is gone. No confirmation dialog, no "are
// you sure", no offer to keep it up a while longer. Retention friction on a
// withdrawal of consent is the same dark pattern this feature exists to avoid,
// pointed at a different moment.

export default function WallConsent({
  templateType,
  pageId,
  accent,
}: {
  templateType: string;
  pageId: string;
  accent: string;
}) {
  const { isAuthenticated, accessToken } = useAppSelector((s) => s.auth);

  const [on, setOn] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const headers = useCallback(
    (): HeadersInit => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      ...(IS_NGROK ? { "ngrok-skip-browser-warning": "true" } : {}),
    }),
    [accessToken]
  );

  // Reflect what the server already holds, so re-opening the sheet shows the
  // real state rather than an unchecked box over an existing entry.
  useEffect(() => {
    if (!isAuthenticated || !accessToken || !pageId) return;
    let live = true;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/wall/mine/${templateType}/${pageId}`, {
          headers: headers(),
        });
        const json = await res.json();
        if (!live || !json?.success) return;
        setOn(Boolean(json.data?.consented));
        setStatus(json.data?.status ?? null);
      } catch {
        // Leave it unchecked. Failing closed is the only safe direction here.
      }
    })();
    return () => {
      live = false;
    };
  }, [isAuthenticated, accessToken, templateType, pageId, headers]);

  async function toggle() {
    if (busy) return;
    setBusy(true);
    setError(null);
    const next = !on;

    try {
      if (next) {
        const res = await fetch(`${API_URL}/wall/consent`, {
          method: "POST",
          headers: headers(),
          body: JSON.stringify({ templateType, pageId }),
        });
        const json = await res.json();
        if (!json?.success) {
          setError(json?.error || "Could not add this to the Wall.");
          return;
        }
        setOn(true);
        setStatus(json.data?.status ?? "pending");
      } else {
        await fetch(`${API_URL}/wall/consent/${templateType}/${pageId}`, {
          method: "DELETE",
          headers: headers(),
        });
        setOn(false);
        setStatus(null);
      }
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setBusy(false);
    }
  }

  // Only the signed-in owner of a saved page can consent to anything.
  if (!isAuthenticated || !pageId) return null;

  return (
    <div
      style={{
        marginTop: 14,
        padding: "12px 14px",
        borderRadius: 12,
        border: "1px solid rgba(0,0,0,0.10)",
        background: "rgba(0,0,0,0.02)",
      }}
    >
      <label
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          cursor: busy ? "wait" : "pointer",
        }}
      >
        <input
          type="checkbox"
          checked={on}
          disabled={busy}
          onChange={toggle}
          style={{
            width: 17,
            height: 17,
            marginTop: 1,
            accentColor: accent,
            flexShrink: 0,
            cursor: "inherit",
          }}
        />
        <span style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: "block", fontSize: 13.5, fontWeight: 600, color: "#1f2937" }}>
            Show this on the Wall
            {busy && (
              <Loader2
                size={12}
                style={{ marginLeft: 6, display: "inline", animation: "spin 1s linear infinite" }}
              />
            )}
          </span>
          {/* Exactly what a stranger will see, in the words they will see it in.
              Vague consent copy is how people end up surprised. */}
          <span style={{ display: "block", fontSize: 12, color: "#6b7280", marginTop: 3, lineHeight: 1.5 }}>
            First names only. Others will see: <em>Karan made this for Meera</em>. No photos, no
            message, no link to your page.
          </span>
        </span>
      </label>

      {on && status === "pending" && (
        <div style={{ fontSize: 11.5, color: "#6b7280", marginTop: 8, paddingLeft: 27 }}>
          Waiting to be approved. You can untick this at any time to remove it.
        </div>
      )}
      {on && status === "removed" && (
        <div style={{ fontSize: 11.5, color: "#92400e", marginTop: 8, paddingLeft: 27 }}>
          This one is being reviewed and is not showing on the Wall.
        </div>
      )}
      {error && (
        <div style={{ fontSize: 11.5, color: "#b91c1c", marginTop: 8, paddingLeft: 27 }}>{error}</div>
      )}
    </div>
  );
}
