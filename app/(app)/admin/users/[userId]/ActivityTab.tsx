"use client";

import { useCallback, useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
import { C } from "./types";
import { Card, Empty, Skeleton, Pill, fmt } from "./ui";

interface Entry {
  _id: string; action: string; actorEmail: string; createdAt: string;
  reason?: string; targetTemplateType?: string;
  changes?: Record<string, { from: unknown; to: unknown }>;
}

/** Actions that changed something, so they read as heavier than the reads. */
const TONE: Record<string, string> = {
  "user.ban": C.danger, "user.suspend": C.warn, "user.reinstate": C.ok,
  "page.delete": C.danger, "impersonation.start": C.danger, "impersonation.end": C.muted,
  "user.reveal_password": C.warn, "page.reset_password": C.warn,
  "user.adjust_points": C.accent, "user.force_logout": C.warn, "user.change_role": C.accent,
};

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
        <><Skeleton h={54} /><Skeleton h={54} /><Skeleton h={54} /></>
      ) : entries.length === 0 ? (
        <Empty>Nothing recorded yet.</Empty>
      ) : (
        <div style={{ display: "grid", gap: 2 }}>
          {entries.map((e) => {
            const tone = TONE[e.action] || C.muted;
            return (
              <div key={e._id} style={{ display: "flex", gap: 11, padding: "12px 0", borderBottom: `1px solid ${C.border}` }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: tone, marginTop: 6, flexShrink: 0 }} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
                    <Pill text={e.action.replace(/[._]/g, " ")} color={tone} />
                    <span style={{ fontSize: 11.5, color: C.muted }}>{fmt(e.createdAt)}</span>
                  </div>
                  <div style={{ fontSize: 12.5, color: C.muted, marginTop: 5 }}>
                    by {e.actorEmail}{e.targetTemplateType ? ` · ${e.targetTemplateType}` : ""}
                  </div>
                  {e.reason && (
                    <div style={{ fontSize: 12.5, marginTop: 4, fontStyle: "italic", color: C.text }}>“{e.reason}”</div>
                  )}
                  {e.changes && Object.keys(e.changes).length > 0 && (
                    <div className="sa-mono" style={{ fontSize: 11.5, color: C.muted, marginTop: 5, display: "flex", gap: 10, flexWrap: "wrap" }}>
                      {Object.entries(e.changes).map(([k, v]) => (
                        <span key={k}>{k}: {String(v.from)} → <strong style={{ color: C.text }}>{String(v.to)}</strong></span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
