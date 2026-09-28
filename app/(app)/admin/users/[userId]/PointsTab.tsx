"use client";

import { useState } from "react";
import { API_URL } from "@/lib/config";
import { C, type ProfileData } from "./types";
import { Card, Empty, Btn, Stat, fmtShort } from "./ui";
import { useToast } from "@/lib/toast/useToast";

export default function PointsTab({
  data, hdr, reload,
}: {
  data: ProfileData; hdr: () => Record<string, string>; reload: () => void;
}) {
  const { pushToast } = useToast();
  const [delta, setDelta] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);

  const apply = async () => {
    const n = Number(delta);
    if (!Number.isFinite(n) || n === 0) { pushToast({ title: "Enter a non-zero number, e.g. 50 or -25", type: "error" }); return; }
    if (!reason.trim()) { pushToast({ title: "A reason is required — it is stored in the ledger", type: "error" }); return; }
    setBusy(true);
    try {
      const r = await fetch(`${API_URL}/admin/super/users/${data.user._id}/points`, {
        method: "POST", headers: hdr(), body: JSON.stringify({ delta: n, reason: reason.trim() }),
      });
      const j = await r.json();
      if (!j.success) pushToast({ title: j.error || "Failed", type: "error" });
      else { pushToast({ title: `Balance is now ${j.data.points}`, type: "success" }); setDelta(""); setReason(""); reload(); }
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <style>{`
        .sa-pts-f { display: grid; gap: 8px; grid-template-columns: minmax(0,1fr); margin-bottom: 9px; }
        @media (min-width: 760px) { .sa-pts-f { grid-template-columns: 140px minmax(0,1fr) auto; } }
      `}</style>
      <div className="sa-stats" style={{ gridTemplateColumns: "repeat(3,minmax(0,1fr))" }}>
        <Stat i={0} label="Balance" value={data.user.points} tone={C.accent} />
        <Stat i={1} label="Lifetime earned" value={data.user.totalPointsEarned} tone={C.goldDeep} />
        <Stat i={2} label="Ledger rows" value={data.points.length} />
      </div>

      <Card title="Adjust balance">
        <div className="sa-pts-f">
          <input className="sa-input" value={delta} onChange={(e) => setDelta(e.target.value)} placeholder="+50 or -25" inputMode="numeric" />
          <input className="sa-input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (required)" onKeyDown={(e) => e.key === "Enter" && apply()} />
          <Btn variant="primary" onClick={apply} disabled={busy}>{busy ? "Applying…" : "Apply adjustment"}</Btn>
        </div>
        <p style={{ fontSize: 12.5, color: C.muted, margin: 0, lineHeight: 1.6 }}>
          Writes a ledger row alongside the balance change, so the adjustment can be
          explained later. A negative adjustment larger than the balance settles at zero.
        </p>
      </Card>

      <Card title="Ledger" note={`${data.points.length} rows`} delay={0.05}>
        {data.points.length === 0 ? (
          <Empty>No transactions.</Empty>
        ) : (
          <>
            <div className="sa-only-lg" style={{ overflowX: "auto" }}>
              <table className="sa-table">
                <thead><tr><th>When</th><th>Type</th><th>Change</th><th>Balance</th><th>Note</th></tr></thead>
                <tbody>
                  {data.points.map((t) => (
                    <tr key={t._id}>
                      <td style={{ color: C.muted, whiteSpace: "nowrap" }}>{fmtShort(t.createdAt)}</td>
                      <td>{t.type}</td>
                      <td style={{ color: t.delta >= 0 ? C.ok : C.danger, fontWeight: 700 }}>{t.delta >= 0 ? `+${t.delta}` : t.delta}</td>
                      <td style={{ color: C.muted }}>{t.balance}</td>
                      <td style={{ color: C.muted, overflowWrap: "anywhere" }}>{String(t.meta?.reason || "")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="sa-only-sm sa-cards">
              {data.points.map((t, i) => (
                <div key={t._id} className="sa-mini" style={{ animationDelay: `${Math.min(i, 12) * 25}ms` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
                    <strong style={{ fontSize: 13 }}>{t.type}</strong>
                    <strong style={{ color: t.delta >= 0 ? C.ok : C.danger }}>{t.delta >= 0 ? `+${t.delta}` : t.delta}</strong>
                  </div>
                  <div className="sa-mini-r"><span className="sa-mini-l">Balance after</span><span>{t.balance}</span></div>
                  <div className="sa-mini-r"><span className="sa-mini-l">When</span><span>{fmtShort(t.createdAt)}</span></div>
                  {t.meta?.reason ? <div className="sa-mini-r"><span className="sa-mini-l">Note</span><span>{String(t.meta.reason)}</span></div> : null}
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </>
  );
}
