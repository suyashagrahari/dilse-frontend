"use client";

import { useState } from "react";
import { API_URL } from "@/lib/config";
import { C, type ProfileData } from "./types";
import { Card, Empty, Btn, Stat, fmt } from "./ui";

export default function PointsTab({
  data, hdr, reload,
}: {
  data: ProfileData;
  hdr: () => Record<string, string>;
  reload: () => void;
}) {
  const [delta, setDelta] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const apply = async () => {
    const n = Number(delta);
    if (!Number.isFinite(n) || n === 0) return window.alert("Enter a non-zero number, e.g. 50 or -25.");
    if (!reason.trim()) return window.alert("A reason is required — it is stored in the ledger.");
    setBusy(true);
    try {
      const r = await fetch(`${API_URL}/admin/super/users/${data.user._id}/points`, {
        method: "POST",
        headers: hdr(),
        body: JSON.stringify({ delta: n, reason: reason.trim() }),
      });
      const j = await r.json();
      if (!j.success) window.alert(j.error || "Failed");
      else { setDelta(""); setReason(""); reload(); }
    } finally {
      setBusy(false);
    }
  };

  const input = {
    border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px",
    fontSize: 13, color: C.t1, background: C.bg, outline: "none",
  } as const;

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 16 }}>
        <Stat label="Current balance" value={data.user.points} />
        <Stat label="Lifetime earned" value={data.user.totalPointsEarned} />
        <Stat label="Ledger entries" value={data.points.length} />
      </div>

      <Card title="Adjust balance">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <input value={delta} onChange={(e) => setDelta(e.target.value)} placeholder="+50 or -25" style={{ ...input, width: 120 }} />
          <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (required)" style={{ ...input, flex: 1, minWidth: 220 }} />
          <Btn onClick={apply} disabled={busy}>{busy ? "Applying…" : "Apply"}</Btn>
        </div>
        <p style={{ fontSize: 12, color: C.tM, margin: "10px 0 0" }}>
          Writes a ledger row alongside the balance change, so the adjustment can be explained later.
          A negative adjustment larger than the balance settles at zero rather than going negative.
        </p>
      </Card>

      <Card title="Ledger">
        {data.points.length === 0 ? (
          <Empty>No transactions.</Empty>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, minWidth: 560 }}>
              <thead>
                <tr style={{ textAlign: "left", color: C.tM }}>
                  <th style={{ padding: "6px 8px" }}>When</th>
                  <th style={{ padding: "6px 8px" }}>Type</th>
                  <th style={{ padding: "6px 8px" }}>Change</th>
                  <th style={{ padding: "6px 8px" }}>Balance</th>
                  <th style={{ padding: "6px 8px" }}>Note</th>
                </tr>
              </thead>
              <tbody>
                {data.points.map((t) => (
                  <tr key={t._id} style={{ borderTop: `1px solid ${C.border}` }}>
                    <td style={{ padding: "8px", color: C.tM }}>{fmt(t.createdAt)}</td>
                    <td style={{ padding: "8px", color: C.t1 }}>{t.type}</td>
                    <td style={{ padding: "8px", color: t.delta >= 0 ? C.ok : C.danger, fontWeight: 700 }}>
                      {t.delta >= 0 ? `+${t.delta}` : t.delta}
                    </td>
                    <td style={{ padding: "8px", color: C.t2 }}>{t.balance}</td>
                    <td style={{ padding: "8px", color: C.tM }}>{String(t.meta?.reason || "")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
