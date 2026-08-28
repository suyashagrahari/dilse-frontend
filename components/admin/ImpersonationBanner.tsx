"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, LogOut } from "lucide-react";
import { API_URL } from "@/lib/config";
import { getImpersonation, clearImpersonation } from "@/lib/impersonation";

/**
 * Always-visible marker that this tab is not the admin's own session.
 *
 * Impersonation's real hazard is forgetting you are in it and taking an action
 * believing it is yours. The banner is fixed, loud, and counts down, so the
 * state is never inferred from memory. Rendered in the app layout so it cannot
 * be scrolled away from or missed on a sub-page.
 */
export default function ImpersonationBanner() {
  const [session, setSession] = useState(getImpersonation());
  const [left, setLeft] = useState(0);

  useEffect(() => {
    const tick = () => {
      const s = getImpersonation();
      setSession(s);
      if (s) setLeft(Math.max(0, Math.floor((s.expiresAt - Date.now()) / 1000)));
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  if (!session) return null;

  const exit = async () => {
    try {
      // Best effort: the audit entry for the end of the session. The local
      // session is cleared regardless, so a failed call cannot strand the tab.
      await fetch(`${API_URL}/admin/impersonate/end`, {
        method: "POST",
        headers: { Authorization: `Bearer ${session.token}`, "Content-Type": "application/json" },
      });
    } catch {
      /* ignore */
    }
    clearImpersonation();
    window.close();
    // window.close() is refused for tabs the script did not open, so fall back
    // to sending this tab somewhere harmless.
    window.location.href = "/admin/users";
  };

  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");

  return (
    <div
      style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 99999,
        background: "linear-gradient(135deg,#3d0c11,#7a1f2a)", color: "#f5ede6",
        borderBottom: "1px solid rgba(201,168,76,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: 10, padding: "9px 14px", fontSize: 12.5, fontWeight: 600,
        flexWrap: "wrap", textAlign: "center",
        boxShadow: "0 4px 16px rgba(26,5,7,0.28)",
      }}
    >
      <AlertTriangle size={16} />
      <span>
        Viewing as <strong>{session.userName}</strong> ({session.userEmail}) — actions are logged
      </span>
      <span style={{ opacity: 0.85, fontVariantNumeric: "tabular-nums" }}>{mm}:{ss}</span>
      <button
        onClick={exit}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: "rgba(201,168,76,0.2)", border: "1px solid rgba(201,168,76,0.65)",
          color: "#f5ede6", borderRadius: 7, padding: "3px 10px",
          fontSize: 12, fontWeight: 700, cursor: "pointer",
        }}
      >
        <LogOut size={13} /> Exit
      </button>
    </div>
  );
}
