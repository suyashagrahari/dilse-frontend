"use client";

import { useCallback, useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
import { C } from "./types";
import { Card, Empty, fmt } from "./ui";

interface Entry {
  _id: string;
  action: string;
  actorEmail: string;
  createdAt: string;
  reason?: string;
  targetTemplateType?: string;
  changes?: Record<string, { from: unknown; to: unknown }>;
}

/**
 * Everything a super admin has done TO this user.
 *
 * The audit log is only worth writing if somebody reads it, so it gets a tab
 * rather than living as a collection only a mongo shell ever sees.
 */
export default function ActivityTab({ userId, hdr }: { userId: string; hdr: () => Record<string, string> }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API_URL}/admin/super/audit?targetUserId=${userId}&limit=200`, { headers: hdr() });
      const j = await r.json();
      if (j.success) setEntries(j.data.entries);
    } finally {
      setLoading(false);
    }
  }, [userId, hdr]);

  useEffect(() => { load(); }, [load]);

  return (
    <Card title="Admin activity on this account">
      {loading ? (
        <Empty>Loading…</Empty>
      ) : entries.length === 0 ? (
        <Empty>Nothing recorded yet.</Empty>
      ) : (
        entries.map((e) => (
          <div key={e._id} style={{ padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.t1 }}>{e.action}</span>
              <span style={{ fontSize: 12, color: C.tM }}>{fmt(e.createdAt)}</span>
            </div>
            <div style={{ fontSize: 12, color: C.t2, marginTop: 2 }}>
              by {e.actorEmail}
              {e.targetTemplateType ? ` · ${e.targetTemplateType}` : ""}
            </div>
            {e.reason && <div style={{ fontSize: 12, color: C.tM, marginTop: 2 }}>“{e.reason}”</div>}
            {e.changes && Object.keys(e.changes).length > 0 && (
              <div style={{ fontSize: 11.5, color: C.tM, marginTop: 3, fontFamily: "monospace" }}>
                {Object.entries(e.changes).map(([k, v]) => (
                  <span key={k} style={{ marginRight: 10 }}>
                    {k}: {String(v.from)} → {String(v.to)}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </Card>
  );
}
