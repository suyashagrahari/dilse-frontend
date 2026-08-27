"use client";

import { useState } from "react";
import { API_URL } from "@/lib/config";
import { Eye, EyeOff, KeyRound, Trash2, ExternalLink, Loader2 } from "lucide-react";
import { C, type ProfileData, type ProfilePage } from "./types";
import { Card, Empty, Btn, fmt } from "./ui";

/**
 * Every page the user has made, with the per-page actions.
 *
 * Passwords are fetched one page at a time and only when asked for: each reveal
 * is a separate audit entry, so a bulk "show all" would forge a record of the
 * admin reading forty passwords they never looked at.
 */
export default function PagesTab({
  data, hdr, reload,
}: {
  data: ProfileData;
  hdr: () => Record<string, string>;
  reload: () => void;
}) {
  const [revealed, setRevealed] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [filter, setFilter] = useState("");

  const reveal = async (p: ProfilePage) => {
    if (revealed[p._id]) {
      setRevealed((r) => { const n = { ...r }; delete n[p._id]; return n; });
      return;
    }
    setBusy(p._id);
    try {
      const r = await fetch(`${API_URL}/admin/super/pages/${p.templateType}/${p._id}/password`, { headers: hdr() });
      const j = await r.json();
      setRevealed((s) => ({
        ...s,
        [p._id]: j?.data?.password ?? (j?.data?.reason || "Not recoverable"),
      }));
    } finally {
      setBusy(null);
    }
  };

  const setPassword = async (p: ProfilePage) => {
    const next = window.prompt(
      `New password for this ${p.templateLabel} page.\nLeave EMPTY to remove the password entirely.`,
      ""
    );
    if (next === null) return;
    setBusy(p._id);
    try {
      const r = await fetch(`${API_URL}/admin/super/pages/${p.templateType}/${p._id}/password`, {
        method: "PUT",
        headers: hdr(),
        body: JSON.stringify({ password: next }),
      });
      const j = await r.json();
      window.alert(j.success ? j.message : j.error || "Failed");
      setRevealed((s) => { const n = { ...s }; delete n[p._id]; return n; });
      reload();
    } finally {
      setBusy(null);
    }
  };

  const del = async (p: ProfilePage) => {
    if (!window.confirm(`Permanently delete this ${p.templateLabel} page?\n\nIts share link will 404 for everyone who has it. This cannot be undone.`)) return;
    setBusy(p._id);
    try {
      const r = await fetch(`${API_URL}/admin/super/pages/${p.templateType}/${p._id}`, {
        method: "DELETE",
        headers: hdr(),
      });
      const j = await r.json();
      if (!j.success) window.alert(j.error || "Failed");
      reload();
    } finally {
      setBusy(null);
    }
  };

  const pages = data.pages.filter(
    (p) =>
      !filter ||
      p.templateLabel.toLowerCase().includes(filter.toLowerCase()) ||
      (p.shareId || "").includes(filter)
  );

  return (
    <Card
      title={`Pages (${data.pages.length})`}
      action={
        <input
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter by template or share id…"
          style={{
            border: `1px solid ${C.border}`, borderRadius: 8, padding: "6px 10px",
            fontSize: 12.5, color: C.t1, background: C.bg, outline: "none", minWidth: 220,
          }}
        />
      }
    >
      {pages.length === 0 ? (
        <Empty>No pages.</Empty>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5, minWidth: 780 }}>
            <thead>
              <tr style={{ textAlign: "left", color: C.tM }}>
                <th style={{ padding: "6px 8px" }}>Template</th>
                <th style={{ padding: "6px 8px" }}>Status</th>
                <th style={{ padding: "6px 8px" }}>Views</th>
                <th style={{ padding: "6px 8px" }}>Password</th>
                <th style={{ padding: "6px 8px" }}>Created</th>
                <th style={{ padding: "6px 8px" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pages.map((p) => (
                <tr key={p._id} style={{ borderTop: `1px solid ${C.border}` }}>
                  <td style={{ padding: "9px 8px", color: C.t1, fontWeight: 600 }}>{p.templateLabel}</td>
                  <td style={{ padding: "9px 8px", color: p.isPublished ? C.ok : C.tM }}>
                    {p.isPublished ? "Published" : "Draft"}
                  </td>
                  <td style={{ padding: "9px 8px", color: C.t2 }}>{p.viewCount}</td>
                  <td style={{ padding: "9px 8px", color: C.t2, fontFamily: "monospace" }}>
                    {!p.hasPassword ? (
                      <span style={{ color: C.tM }}>none</span>
                    ) : revealed[p._id] ? (
                      <span style={{ color: C.t1 }}>{revealed[p._id]}</span>
                    ) : (
                      "••••••"
                    )}
                  </td>
                  <td style={{ padding: "9px 8px", color: C.tM }}>{fmt(p.createdAt)}</td>
                  <td style={{ padding: "9px 8px" }}>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      {busy === p._id && <Loader2 size={13} className="animate-spin" style={{ color: C.gold }} />}
                      {p.hasPassword && (
                        <Btn tone="ghost" onClick={() => reveal(p)} title="Reveal — this is logged">
                          {revealed[p._id] ? <EyeOff size={13} /> : <Eye size={13} />}
                        </Btn>
                      )}
                      {p.supportsPassword && (
                        <Btn tone="ghost" onClick={() => setPassword(p)} title="Set or remove the password">
                          <KeyRound size={13} />
                        </Btn>
                      )}
                      {p.shareId && (
                        <a
                          href={`/${p.shareId}`}
                          target="_blank"
                          rel="noreferrer"
                          style={{ color: C.t2, display: "inline-flex", padding: 6, border: `1px solid ${C.border}`, borderRadius: 8 }}
                          title="Open the shared page"
                        >
                          <ExternalLink size={13} />
                        </a>
                      )}
                      <Btn tone="danger" onClick={() => del(p)} title="Delete permanently">
                        <Trash2 size={13} />
                      </Btn>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
