"use client";

import { useCallback, useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
import { C } from "./types";
import { Card, Empty, Skeleton, Pill, fmt, fmtAgo } from "./ui";

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
    <Card title="Admin activity on this account" note={loading ? undefined : `${entries.length} entr${entries.length === 1 ? "y" : "ies"}`}>
      {loading ? (
        <><Skeleton h={54} /><Skeleton h={54} /><Skeleton h={54} /></>
      ) : entries.length === 0 ? (
        <Empty>Nothing recorded yet.</Empty>
      ) : (
        // A timeline: one rail, a dot per entry coloured by how heavy it was.
        <div style={{ position: "relative", display: "grid", gap: 2, paddingLeft: 4 }}>
          <span aria-hidden style={{ position: "absolute", left: 7.5, top: 10, bottom: 10, width: 1, background: `linear-gradient(${C.gold}66, ${C.border})` }} />
          {entries.map((e, i) => {
            const tone = TONE[e.action] || C.muted;
            return (
              <div key={e._id} style={{ display: "flex", gap: 11, padding: "8px 0", animation: "saRise .3s cubic-bezier(.22,1,.36,1) both", animationDelay: `${Math.min(i, 14) * 25}ms` }}>
                <span style={{ position: "relative", width: 8, height: 8, borderRadius: 999, background: tone, marginTop: 5, flexShrink: 0, boxShadow: `0 0 0 3px ${tone}22` }} />
                <div className="sa-mini" style={{ minWidth: 0, flex: 1, padding: "8px 10px", animation: "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <Pill text={e.action.replace(/[._]/g, " ")} color={tone} />
                    <span style={{ fontSize: 11, color: C.muted }} title={fmt(e.createdAt)}>{fmtAgo(e.createdAt)}</span>
                  </div>
                  <div style={{ fontSize: 12, color: C.muted, marginTop: 4, overflowWrap: "anywhere" }}>
                    by {e.actorEmail}{e.targetTemplateType ? ` · ${e.targetTemplateType}` : ""}
                  </div>
                  {e.reason && (
                    <div style={{ fontSize: 12.5, marginTop: 3, fontStyle: "italic", color: C.text, overflowWrap: "anywhere" }}>“{e.reason}”</div>
                  )}
                  {e.changes && Object.keys(e.changes).length > 0 && (
                    <div className="sa-mono" style={{ fontSize: 11.5, color: C.muted, marginTop: 4, display: "flex", gap: 10, flexWrap: "wrap", overflowWrap: "anywhere" }}>
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
