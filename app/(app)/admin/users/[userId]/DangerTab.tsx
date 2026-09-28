"use client";

import { useState } from "react";
import { API_URL } from "@/lib/config";
import { C, STATUS_COLOR, type ProfileData } from "./types";
import { Card, Btn, Dialog, Pill } from "./ui";
import { useToast } from "@/lib/toast/useToast";

type Pending = { kind: "status"; status: string } | { kind: "logout" } | null;

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
  data: ProfileData; hdr: () => Record<string, string>; reload: () => void;
}) {
  const { pushToast } = useToast();
  const [reason, setReason] = useState("");
  const [until, setUntil] = useState("");
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<Pending>(null);
  const { user } = data;
  const status = user.status || "active";

  const run = async () => {
    if (!pending) return;
    setBusy(true);
    try {
      const path = pending.kind === "logout" ? "force-logout" : "status";
      const body = pending.kind === "logout"
        ? {}
        : { status: pending.status, reason: reason.trim(), until: until || undefined };
      const r = await fetch(`${API_URL}/admin/super/users/${user._id}/${path}`, {
        method: "POST", headers: hdr(), body: JSON.stringify(body),
      });
      const j = await r.json();
      if (!j.success) pushToast({ title: j.error || "Failed", type: "error" });
      else {
        pushToast({ title: pending.kind === "logout" ? "Signed out of all devices" : `Account is now ${(pending as { status: string }).status}`, type: "success" });
        setReason(""); setUntil(""); setPending(null); reload();
      }
    } finally {
      setBusy(false);
    }
  };

  const ask = (status: string) => {
    if (status !== "active" && !reason.trim()) { pushToast({ title: "A reason is required to suspend or ban", type: "error" }); return; }
    setPending({ kind: "status", status });
  };

  const copy = !pending ? "" :
    pending.kind === "logout"
      ? `Sign ${user.email} out of every device. They can sign back in immediately — this is for a token that may have leaked, not a punishment.`
      : pending.status === "banned"
      ? `${user.email} will be signed out everywhere, and ALL of their published pages will 404 for the recipients holding those links.`
      : pending.status === "suspended"
      ? `${user.email} will be signed out everywhere and cannot sign in. Their published pages stay live for recipients.`
      : `${user.email} regains access, and any hidden pages become reachable again.`;

  return (
    <>
      <style>{`
        .sa-dz-f { display: grid; gap: 8px; margin-bottom: 10px; grid-template-columns: minmax(0,1fr); }
        @media (min-width: 760px) { .sa-dz-f { grid-template-columns: minmax(0,1fr) 180px; } }
        .sa-dz-b { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 7px; }
        .sa-dz-b > .sa-btn { min-height: 38px; }
        @media (min-width: 760px) { .sa-dz-b { display: flex; } }
      `}</style>
      <Card title="Account status" tone="danger" action={<Pill text={status} color={STATUS_COLOR[status] || C.muted} />}>
        <p style={{ fontSize: 12.5, color: C.muted, margin: "0 0 11px", lineHeight: 1.6 }}>
          <strong style={{ color: C.text }}>Suspend</strong> blocks sign-in but leaves published pages reachable —
          recipients holding those links did nothing wrong.{" "}
          <strong style={{ color: C.text }}>Ban</strong> also hides every published page.
          Both sign the user out of every device immediately, and both are reversible.
        </p>
        <div className="sa-dz-f">
          <input className="sa-input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (required to suspend or ban)" />
          <input className="sa-input" type="date" value={until} onChange={(e) => setUntil(e.target.value)} title="Optional: auto-expire a suspension" />
        </div>
        <div className="sa-dz-b">
          <Btn variant="accent" onClick={() => ask("suspended")} disabled={busy || status === "suspended"}>Suspend</Btn>
          <Btn variant="danger" onClick={() => ask("banned")} disabled={busy || status === "banned"}>Ban</Btn>
          <Btn variant="ghost" onClick={() => ask("active")} disabled={busy || status === "active"}>Reinstate</Btn>
        </div>
      </Card>

      <Card title="Sessions" tone="danger" delay={0.05}>
        <p style={{ fontSize: 12.5, color: C.muted, margin: "0 0 11px", lineHeight: 1.6 }}>
          Signs the user out of every device at once. They can sign back in immediately —
          use it when a token may have been exposed rather than as a punishment.
        </p>
        <Btn variant="accent" onClick={() => setPending({ kind: "logout" })} disabled={busy}>
          Force sign-out everywhere
        </Btn>
      </Card>

      <Dialog open={!!pending} onClose={() => setPending(null)} title="Are you sure?">
        <p style={{ fontSize: 13.5, lineHeight: 1.65, margin: "0 0 16px" }}>{copy}</p>
        {pending?.kind === "status" && pending.status !== "active" && reason && (
          <p style={{ fontSize: 12.5, color: C.muted, margin: "0 0 16px" }}>
            Reason recorded: <em style={{ color: C.text }}>“{reason}”</em>
          </p>
        )}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Btn variant="ghost" onClick={() => setPending(null)}>Cancel</Btn>
          <Btn
            variant={pending?.kind === "status" && pending.status === "banned" ? "danger" : "primary"}
            onClick={run}
            disabled={busy}
          >
            {busy ? "Working…" : "Confirm"}
          </Btn>
        </div>
      </Dialog>
    </>
  );
}
