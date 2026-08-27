"use client";

import { useState } from "react";
import { API_URL, SITE_URL } from "@/lib/config";
import { Eye, EyeOff, KeyRound, Trash2, ExternalLink, Search, Link2 } from "lucide-react";
import { C, type ProfileData, type ProfilePage } from "./types";
import { Card, Empty, Btn, Pill, Dialog, CopyBtn, useToast, fmtShort } from "./ui";

/**
 * What this user has made, as a list of links.
 *
 * Deliberately a LINK LIST, not a content viewer. The super admin's question is
 * "what did they publish, what does it cost to open it, how many people saw it,
 * and should it still exist" — so the share URL is the primary column and the
 * page itself is one click away in a new tab. Rendering the stored document
 * inline put a wall of someone's private photos and messages on screen to
 * answer a question that the link already answers.
 *
 * Passwords are fetched one page at a time and only when asked for: each reveal
 * is its own audit entry, so a bulk "show all" would forge a record of the
 * admin reading forty passwords they never looked at.
 */
export default function PagesTab({
  data, hdr, reload,
}: {
  data: ProfileData;
  hdr: () => Record<string, string>;
  reload: () => void;
}) {
  const toast = useToast();
  const [revealed, setRevealed] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [pwFor, setPwFor] = useState<ProfilePage | null>(null);
  const [pwValue, setPwValue] = useState("");
  const [delFor, setDelFor] = useState<ProfilePage | null>(null);

  const urlOf = (p: ProfilePage) => (p.shareId ? `${SITE_URL}/${p.shareId}` : "");

  const reveal = async (p: ProfilePage) => {
    if (revealed[p._id]) {
      setRevealed((r) => { const n = { ...r }; delete n[p._id]; return n; });
      return;
    }
    setBusy(p._id);
    try {
      const r = await fetch(`${API_URL}/admin/super/pages/${p.templateType}/${p._id}/password`, { headers: hdr() });
      const j = await r.json();
      setRevealed((s) => ({ ...s, [p._id]: j?.data?.password ?? (j?.data?.reason || "Not recoverable") }));
    } catch {
      toast("Could not reveal the password", "bad");
    } finally {
      setBusy(null);
    }
  };

  const savePassword = async () => {
    if (!pwFor) return;
    setBusy(pwFor._id);
    try {
      const r = await fetch(`${API_URL}/admin/super/pages/${pwFor.templateType}/${pwFor._id}/password`, {
        method: "PUT", headers: hdr(), body: JSON.stringify({ password: pwValue }),
      });
      const j = await r.json();
      toast(j.success ? j.message : j.error || "Failed", j.success ? "ok" : "bad");
      if (j.success) {
        setRevealed((s) => { const n = { ...s }; delete n[pwFor._id]; return n; });
        setPwFor(null); setPwValue(""); reload();
      }
    } finally {
      setBusy(null);
    }
  };

  const confirmDelete = async () => {
    if (!delFor) return;
    setBusy(delFor._id);
    try {
      const r = await fetch(`${API_URL}/admin/super/pages/${delFor.templateType}/${delFor._id}`, {
        method: "DELETE", headers: hdr(),
      });
      const j = await r.json();
      toast(j.success ? `${delFor.templateLabel} page deleted.` : j.error || "Failed", j.success ? "ok" : "bad");
      if (j.success) { setDelFor(null); reload(); }
    } finally {
      setBusy(null);
    }
  };

  const pages = data.pages.filter(
    (p) => !filter ||
      p.templateLabel.toLowerCase().includes(filter.toLowerCase()) ||
      (p.shareId || "").includes(filter)
  );

  /** The share link, as the thing you act on: open it or copy it. */
  const Url = ({ p }: { p: ProfilePage }) => {
    if (!p.shareId) return <span style={{ color: C.muted, fontSize: 12.5 }}>Not published</span>;
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, minWidth: 0, maxWidth: "100%" }}>
        <a
          href={urlOf(p)}
          target="_blank"
          rel="noreferrer"
          className="sa-mono"
          title={urlOf(p)}
          style={{
            color: C.accent, textDecoration: "none", overflow: "hidden",
            textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0,
          }}
        >
          /{p.shareId}
        </a>
        <CopyBtn value={urlOf(p)} label="Copy full link" />
      </span>
    );
  };

  const Password = ({ p }: { p: ProfilePage }) =>
    !p.hasPassword ? (
      <span style={{ color: C.muted, fontSize: 12.5 }}>none</span>
    ) : revealed[p._id] ? (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
        <code className="sa-mono" style={{ color: C.text, fontWeight: 700 }}>{revealed[p._id]}</code>
        <CopyBtn value={revealed[p._id]} label="Copy password" />
      </span>
    ) : (
      <span className="sa-mono" style={{ color: C.muted }}>••••••</span>
    );

  const Actions = ({ p }: { p: ProfilePage }) => (
    <div className="sa-actions">
      {p.shareId && (
        <a href={urlOf(p)} target="_blank" rel="noreferrer" className="sa-btn sa-icon-btn" data-v="ghost" title="Open the page">
          <ExternalLink size={13} />
        </a>
      )}
      {p.hasPassword && (
        <Btn variant="ghost" icon title="Reveal password — this is logged" onClick={() => reveal(p)} disabled={busy === p._id}>
          {revealed[p._id] ? <EyeOff size={13} /> : <Eye size={13} />}
        </Btn>
      )}
      {p.supportsPassword && (
        <Btn variant="ghost" icon title="Set or remove the password" onClick={() => { setPwFor(p); setPwValue(""); }}>
          <KeyRound size={13} />
        </Btn>
      )}
      <Btn variant="danger" icon title="Delete permanently" onClick={() => setDelFor(p)} disabled={busy === p._id}>
        <Trash2 size={13} />
      </Btn>
    </div>
  );

  const live = data.pages.filter((p) => p.isPublished).length;
  const locked = data.pages.filter((p) => p.hasPassword).length;

  return (
    <>
      <Card
        title={`Templates — ${data.pages.length} total · ${live} live · ${locked} password-locked`}
        action={
          <div style={{ display: "flex", alignItems: "center", gap: 7, flex: "1 1 200px", maxWidth: 300 }}>
            <Search size={14} color={C.muted} style={{ flexShrink: 0 }} />
            <input
              className="sa-input"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter template or link…"
            />
          </div>
        }
      >
        {pages.length === 0 ? (
          <Empty>{data.pages.length === 0 ? "This user hasn't created any templates yet." : "Nothing matches that filter."}</Empty>
        ) : (
          <>
            {/* Tablet / desktop */}
            <div className="sa-only-lg" style={{ overflowX: "auto" }}>
              <table className="sa-table">
                <thead>
                  <tr>
                    <th>Template</th>
                    <th style={{ minWidth: 200 }}>Link</th>
                    <th>Password</th>
                    <th>Views</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pages.map((p) => (
                    <tr key={p._id}>
                      <td style={{ fontWeight: 600, whiteSpace: "nowrap" }}>{p.templateLabel}</td>
                      <td style={{ maxWidth: 260 }}><Url p={p} /></td>
                      <td><Password p={p} /></td>
                      <td style={{ fontWeight: 700 }}>{p.viewCount.toLocaleString()}</td>
                      <td><Pill text={p.isPublished ? "Live" : "Draft"} color={p.isPublished ? C.green : C.muted} /></td>
                      <td style={{ color: C.muted, whiteSpace: "nowrap" }}>{fmtShort(p.createdAt)}</td>
                      <td>
                        <div style={{ display: "flex", justifyContent: "flex-end" }}><Actions p={p} /></div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Phone — a table here scrolls sideways with invisible columns */}
            <div className="sa-only-sm sa-cards">
              {pages.map((p) => (
                <div key={p._id} className="sa-mini">
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", marginBottom: 9 }}>
                    <strong style={{ fontSize: 14 }}>{p.templateLabel}</strong>
                    <Pill text={p.isPublished ? "Live" : "Draft"} color={p.isPublished ? C.green : C.muted} />
                  </div>
                  <div className="sa-mini-r" style={{ alignItems: "center" }}>
                    <span className="sa-mini-l" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <Link2 size={12} /> Link
                    </span>
                    <span style={{ minWidth: 0, maxWidth: "68%" }}><Url p={p} /></span>
                  </div>
                  <div className="sa-mini-r"><span className="sa-mini-l">Password</span><span><Password p={p} /></span></div>
                  <div className="sa-mini-r"><span className="sa-mini-l">Views</span><strong>{p.viewCount.toLocaleString()}</strong></div>
                  <div className="sa-mini-r"><span className="sa-mini-l">Created</span><span>{fmtShort(p.createdAt)}</span></div>
                  <div style={{ marginTop: 10 }}><Actions p={p} /></div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      <Dialog open={!!pwFor} onClose={() => setPwFor(null)} title={`Password — ${pwFor?.templateLabel || ""}`}>
        <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, margin: "0 0 14px" }}>
          Set a new password for this page, or leave it empty to remove the password
          entirely so it opens for anyone with the link.
        </p>
        <input
          className="sa-input"
          value={pwValue}
          onChange={(e) => setPwValue(e.target.value)}
          placeholder="New password (empty = remove)"
          autoFocus
          onKeyDown={(e) => e.key === "Enter" && savePassword()}
        />
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
          <Btn variant="ghost" onClick={() => setPwFor(null)}>Cancel</Btn>
          <Btn variant="primary" onClick={savePassword} disabled={!!busy}>
            {pwValue.trim() === "" ? "Remove password" : "Set password"}
          </Btn>
        </div>
      </Dialog>

      <Dialog open={!!delFor} onClose={() => setDelFor(null)} title="Delete this template?">
        <p style={{ fontSize: 13.5, lineHeight: 1.65, margin: "0 0 8px" }}>
          <strong>{delFor?.templateLabel}</strong>
          {delFor?.shareId ? <> · <code className="sa-mono">/{delFor.shareId}</code></> : null}
        </p>
        <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.65, margin: "0 0 16px" }}>
          The link will 404 for everyone who has it, including recipients who did
          nothing wrong. This cannot be undone.
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Btn variant="ghost" onClick={() => setDelFor(null)}>Cancel</Btn>
          <Btn variant="danger" onClick={confirmDelete} disabled={!!busy}>Delete permanently</Btn>
        </div>
      </Dialog>
    </>
  );
}
