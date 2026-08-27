"use client";

import { useState } from "react";
import { API_URL } from "@/lib/config";
import { C, type ProfileData } from "./types";
import { Card, Btn } from "./ui";

/**
 * The irreversible controls, deliberately separated from everything else.
 *
 * Suspend and ban both require a typed reason — it is stored on the account and
 * in the audit log, and it is what makes the decision reviewable later by
 * somebody who was not there.
 */
export default function DangerTab({
  data, hdr, reload,
}: {
  data: ProfileData;
  hdr: () => Record<string, string>;
  reload: () => void;
}) {
  const [reason, setReason] = useState("");
  const [until, setUntil] = useState("");
  const [busy, setBusy] = useState(false);
  const { user } = data;

  const call = async (path: string, body?: unknown, confirmMsg?: string) => {
    if (confirmMsg && !window.confirm(confirmMsg)) return;
    setBusy(true);
    try {
      const r = await fetch(`${API_URL}/admin/super/users/${user._id}/${path}`, {
        method: "POST",
        headers: hdr(),
        body: JSON.stringify(body || {}),
      });
      const j = await r.json();
      if (!j.success) window.alert(j.error || "Failed");
      else { setReason(""); setUntil(""); reload(); }
    } finally {
      setBusy(false);
    }
  };

  const setStatus = (status: string) => {
    if (status !== "active" && !reason.trim()) {
      window.alert("A reason is required to suspend or ban.");
      return;
    }
    const msg =
      status === "banned"
        ? `Ban ${user.email}?\n\nThey are signed out everywhere and ALL their published pages will 404 for recipients.`
        : status === "suspended"
        ? `Suspend ${user.email}?\n\nThey are signed out everywhere. Their published pages stay live for recipients.`
        : `Reinstate ${user.email}?`;
    call("status", { status, reason: reason.trim(), until: until || undefined }, msg);
  };

  const input = {
    border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px",
    fontSize: 13, color: C.t1, background: C.bg, outline: "none",
  } as const;

  return (
    <>
      <Card title="Account status">
        <p style={{ fontSize: 12.5, color: C.t2, margin: "0 0 12px", lineHeight: 1.55 }}>
          Currently <strong style={{ color: C.t1 }}>{user.status || "active"}</strong>.
          <br />
          <strong>Suspend</strong> blocks sign-in but leaves published pages reachable — recipients
          holding those links did nothing wrong.
          <br />
          <strong>Ban</strong> also hides every published page.
          Both sign the user out of every device immediately, and both are reversible.
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
          <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (required to suspend or ban)" style={{ ...input, flex: 1, minWidth: 240 }} />
          <input type="date" value={until} onChange={(e) => setUntil(e.target.value)} title="Optional: auto-expire a suspension" style={input} />
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Btn onClick={() => setStatus("suspended")} disabled={busy || user.status === "suspended"}>Suspend</Btn>
          <Btn tone="danger" onClick={() => setStatus("banned")} disabled={busy || user.status === "banned"}>Ban</Btn>
          <Btn tone="ghost" onClick={() => setStatus("active")} disabled={busy || (user.status || "active") === "active"}>Reinstate</Btn>
        </div>
      </Card>

      <Card title="Sessions">
        <p style={{ fontSize: 12.5, color: C.t2, margin: "0 0 12px", lineHeight: 1.55 }}>
          Signs the user out of every device at once. They can sign back in immediately —
          use it when a token may have been exposed rather than as a punishment.
        </p>
        <Btn
          onClick={() => call("force-logout", {}, `Sign ${user.email} out of all devices?`)}
          disabled={busy}
        >
          Force sign-out everywhere
        </Btn>
      </Card>
    </>
  );
}
