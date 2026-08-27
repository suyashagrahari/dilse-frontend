"use client";

import { useState } from "react";
import { API_URL } from "@/lib/config";
import { Eye, EyeOff, KeyRound, Trash2, ExternalLink, FileText, Search } from "lucide-react";
import { C, type ProfileData, type ProfilePage } from "./types";
import { Card, Empty, Btn, Pill, Dialog, CopyBtn, useToast, fmtShort } from "./ui";
import PageContentModal from "./PageContentModal";

/**
 * Every page the user has made, with the per-page actions.
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
  const [viewing, setViewing] = useState<ProfilePage | null>(null);
  const [pwFor, setPwFor] = useState<ProfilePage | null>(null);
  const [pwValue, setPwValue] = useState("");
  const [delFor, setDelFor] = useState<ProfilePage | null>(null);

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

  const Actions = ({ p }: { p: ProfilePage }) => (
    <div className="sa-actions">
      <Btn variant="ghost" icon title="See what they created" onClick={() => setViewing(p)}><FileText size={13} /></Btn>
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
      {p.shareId && (
        <a href={`/${p.shareId}`} target="_blank" rel="noreferrer" className="sa-btn sa-icon-btn" data-v="ghost" title="Open the live page">
          <ExternalLink size={13} />
        </a>
      )}
      <Btn variant="danger" icon title="Delete permanently" onClick={() => setDelFor(p)} disabled={busy === p._id}>
        <Trash2 size={13} />
      </Btn>
    </div>
  );

  const Password = ({ p }: { p: ProfilePage }) =>
    !p.hasPassword ? (
      <span style={{ color: C.muted }}>none</span>
    ) : revealed[p._id] ? (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
        <code className="sa-mono" style={{ color: C.accent }}>{revealed[p._id]}</code>
        <CopyBtn value={revealed[p._id]} label="Copy password" />
      </span>
    ) : (
      <span className="sa-mono" style={{ color: C.muted }}>••••••</span>
    );

  return (
    <>
      <Card
        title={`Pages (${data.pages.length})`}
        action={
          <div style={{ display: "flex", alignItems: "center", gap: 7, flex: "1 1 200px", maxWidth: 300 }}>
            <Search size={14} color={C.muted} style={{ flexShrink: 0 }} />
            <input
              className="sa-input"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter template or share id…"
            />
          </div>
        }
      >
        {pages.length === 0 ? (
          <Empty>{data.pages.length === 0 ? "This user hasn't created any pages yet." : "Nothing matches that filter."}</Empty>
        ) : (
          <>
            {/* Desktop / tablet */}
            <div className="sa-only-lg" style={{ overflowX: "auto" }}>
              <table className="sa-table">
                <thead>
                  <tr>
                    <th>Template</th><th>Status</th><th>Views</th><th>Password</th><th>Created</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pages.map((p) => (
                    <tr key={p._id}>
                      <td style={{ fontWeight: 600 }}>{p.templateLabel}</td>
                      <td>
                        <Pill text={p.isPublished ? "Live" : "Draft"} color={p.isPublished ? C.green : C.muted} />
                      </td>
                      <td style={{ color: C.muted }}>{p.viewCount}</td>
                      <td><Password p={p} /></td>
                      <td style={{ color: C.muted, whiteSpace: "nowrap" }}>{fmtShort(p.createdAt)}</td>
                      <td><Actions p={p} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Phone — a table here would either scroll invisibly or crush */}
            <div className="sa-only-sm sa-cards">
              {pages.map((p) => (
                <div key={p._id} className="sa-mini">
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", marginBottom: 8 }}>
                    <strong style={{ fontSize: 14 }}>{p.templateLabel}</strong>
                    <Pill text={p.isPublished ? "Live" : "Draft"} color={p.isPublished ? C.green : C.muted} />
                  </div>
                  <div className="sa-mini-r"><span className="sa-mini-l">Views</span><span>{p.viewCount}</span></div>
                  <div className="sa-mini-r"><span className="sa-mini-l">Password</span><span><Password p={p} /></span></div>
                  <div className="sa-mini-r"><span className="sa-mini-l">Created</span><span>{fmtShort(p.createdAt)}</span></div>
                  <div style={{ marginTop: 10 }}><Actions p={p} /></div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      <PageContentModal page={viewing} hdr={hdr} onClose={() => setViewing(null)} />

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

      <Dialog open={!!delFor} onClose={() => setDelFor(null)} title="Delete this page?">
        <p style={{ fontSize: 13.5, lineHeight: 1.65, margin: "0 0 8px" }}>
          <strong>{delFor?.templateLabel}</strong>, created {fmtShort(delFor?.createdAt)}.
        </p>
        <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.65, margin: "0 0 16px" }}>
          Its share link will 404 for everyone who has it, including recipients who
          did nothing wrong. This cannot be undone.
        </p>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Btn variant="ghost" onClick={() => setDelFor(null)}>Cancel</Btn>
          <Btn variant="danger" onClick={confirmDelete} disabled={!!busy}>Delete permanently</Btn>
        </div>
      </Dialog>
    </>
  );
}
