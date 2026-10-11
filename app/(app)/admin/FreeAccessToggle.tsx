"use client";

// ─── "All templates free" for one account ────────────────────────────────────
//
// Super admin only. On: this person publishes every priced template without a
// paywall — the server's publish gate answers `free_access`. Off: they pay like
// everyone else again. Pages they already published stay live either way.
//
// Shared by /admin/influencers (one per card) and /admin/users/[userId], so the
// two surfaces cannot drift on wording or on which endpoint they call.

import { useState } from "react";
import { Gift, Loader2 } from "lucide-react";
import { API_URL } from "@/lib/config";
import { A } from "./adminKit";

export default function FreeAccessToggle({
  userId,
  enabled,
  accessToken,
  onChange,
  disabledReason,
  compact,
}: {
  userId: string;
  enabled: boolean;
  accessToken: string | null | undefined;
  onChange?: (enabled: boolean) => void;
  /** Shown instead of the switch's hint, and the switch is disabled, when set. */
  disabledReason?: string | null;
  compact?: boolean;
}) {
  const [on, setOn] = useState(enabled);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const flip = async () => {
    if (busy || disabledReason) return;
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch(`${API_URL}/admin/super/users/${encodeURIComponent(userId)}/free-access`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ enabled: !on }),
      });
      const d = await r.json();
      if (!d?.success) throw new Error(d?.error || "Could not save");
      const next = !!d.data?.freeAccess?.enabled;
      setOn(next);
      onChange?.(next);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not save");
    } finally {
      setBusy(false);
    }
  };

  const hint = disabledReason
    ? disabledReason
    : on
    ? "Publishes every priced template free — no paywall."
    : "Pays for priced templates like everyone else.";

  return (
    <div className={`fat ${on ? "on" : ""} ${compact ? "compact" : ""}`}>
      <style>{CSS}</style>
      <Gift size={14} className="fat-ic" aria-hidden />
      <span className="fat-txt">
        <b>All templates free</b>
        <small className={err ? "fat-err" : undefined}>{err || hint}</small>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label="All templates free"
        className={`fat-switch ${on ? "on" : ""}`}
        disabled={busy || !!disabledReason}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          void flip();
        }}
      >
        {busy ? <Loader2 size={12} className="fat-spin" /> : <span className="fat-knob" />}
      </button>
    </div>
  );
}

const CSS = `
.fat{display:flex;align-items:center;gap:10px;min-width:0;padding:10px 12px;border-radius:14px;background:rgba(61,12,17,.035);border:1px solid ${A.edge}}
.fat.on{background:rgba(30,122,75,.08);border-color:rgba(30,122,75,.28)}
.fat.compact{padding:8px 10px;border-radius:12px}
.fat-ic{flex:none;color:${A.goldDeep}}
.fat.on .fat-ic{color:${A.ok}}
.fat-txt{flex:1;min-width:0;display:flex;flex-direction:column;gap:1px}
.fat-txt b{font-size:12.5px;color:${A.ink}}
.fat-txt small{font-size:11px;color:${A.muted};line-height:1.35}
.fat-err{color:${A.danger} !important}
.fat-switch{flex:none;position:relative;width:44px;height:26px;border-radius:99px;border:none;background:#e3d6cf;cursor:pointer;display:flex;align-items:center;padding:3px;transition:background .2s}
.fat-switch.on{background:${A.ok};justify-content:flex-end}
.fat-switch:disabled{opacity:.5;cursor:not-allowed}
.fat-knob{width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.2)}
.fat-spin{animation:spin 1s linear infinite;color:#fff;margin:4px}
`;
