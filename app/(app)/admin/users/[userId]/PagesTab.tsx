"use client";

import { useState } from "react";
import { API_URL } from "@/lib/config";
import { Search, LayoutGrid } from "lucide-react";
import { C, type ProfileData, type ProfilePage } from "./types";
import { Card, Empty, Btn, Dialog, fmtShort } from "./ui";
import TemplateCard from "./TemplateCard";
import EditTemplateDialog from "./EditTemplateDialog";
import { useToast } from "@/lib/toast/useToast";

/**
 * What this user has made, as a grid of cards.
 *
 * Cards rather than a table at every width. The per-row work here is not
 * scanning a column — it is acting on one page: open it, read what they wrote,
 * fix a typo, delete it. A card holds that comfortably and needs no separate
 * phone layout, which is what the table forced.
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
  const { pushToast } = useToast();
  const [revealed, setRevealed] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [pwFor, setPwFor] = useState<ProfilePage | null>(null);
  const [pwValue, setPwValue] = useState("");
  const [delFor, setDelFor] = useState<ProfilePage | null>(null);
  const [editFor, setEditFor] = useState<ProfilePage | null>(null);
  const [editContent, setEditContent] = useState<Record<string, unknown> | null>(null);

  const reveal = async (p: ProfilePage) => {
    if (revealed[p._id]) {
      setRevealed((r) => { const n = { ...r }; delete n[p._id]; return n; });
      return;
    }
    setBusy(p._id);
    try {
      const r = await fetch(`${API_URL}/admin/super/pages/${p.templateType}/${p._id}/password`, { headers: hdr() });
      const j = await r.json();

      // ── WHY THIS IS NOT ONE `??` EXPRESSION ANY MORE ───────────────────────
      //
      // It used to be `j?.data?.password ?? (j?.data?.reason || "Not
      // recoverable")`, which printed "Not recoverable" for three different
      // situations that need different answers:
      //
      //   - the request FAILED (expired session, 403, 500). `data` is
      //     undefined, so a signed-out admin was told the password could not be
      //     recovered — about a password that is sitting there perfectly fine.
      //   - the page has NO password. The server says so plainly
      //     (`hasPassword: false`), and "Not recoverable" is the wrong reading
      //     of a page that simply opens for anyone.
      //   - the page really is hash-only, which is the one case it described.
      //
      // Those first two are why this reads "Not recoverable" far more often
      // than there are unrecoverable passwords.
      if (!r.ok || !j?.success || !j?.data) {
        // The server already says precisely why — "Access denied. Super Admin
        // privileges required." or "Admin actions are not available while
        // viewing as another user." Both are blanket 403s that would otherwise
        // read as every password on the page being unrecoverable at once.
        pushToast({
          title: typeof j?.error === "string" && j.error
            ? j.error
            : `Could not reveal the password (${r.status})`,
          type: "error",
        });
        return;
      }

      const d = j.data as { hasPassword?: boolean; password?: string | null; reason?: string };
      const text = d.hasPassword === false
        ? "This page has no password — it opens for anyone with the link."
        : d.password || d.reason || "Stored as a one-way hash; it can be reset but not recovered.";

      setRevealed((s) => ({ ...s, [p._id]: text }));
    } catch {
      pushToast({ title: "Could not reveal the password", type: "error" });
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
      pushToast({ title: j.success ? j.message : j.error || "Failed", type: j.success ? "success" : "error" });
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
      pushToast({ title: j.success ? `${delFor.templateLabel} page deleted.` : j.error || "Failed", type: j.success ? "success" : "error" });
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

  const live = data.pages.filter((p) => p.isPublished).length;
  const locked = data.pages.filter((p) => p.hasPassword).length;

  return (
    <>
      <Card
        title={`Templates — ${data.pages.length} total · ${live} live · ${locked} locked`}
        action={
          <div className="sa-search">
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
          <Empty>
            {data.pages.length === 0 ? (
              <><LayoutGrid size={22} style={{ opacity: 0.4, display: "block", margin: "0 auto 8px" }} />This user hasn&apos;t created any templates yet.</>
            ) : "Nothing matches that filter."}
          </Empty>
        ) : (
          <div className="sa-tpl-grid">
            {pages.map((p) => (
              <TemplateCard
                key={p._id}
                page={p}
                hdr={hdr}
                revealed={revealed[p._id]}
                busy={busy === p._id}
                onReveal={reveal}
                onSetPassword={(pg) => { setPwFor(pg); setPwValue(""); }}
                onDelete={setDelFor}
                onEdit={(pg, content) => { setEditContent(content); setEditFor(pg); }}
              />
            ))}
          </div>
        )}
      </Card>

      <EditTemplateDialog
        page={editFor}
        content={editContent}
        hdr={hdr}
        onClose={() => { setEditFor(null); setEditContent(null); }}
        onSaved={reload}
      />

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
          {delFor ? <> · created {fmtShort(delFor.createdAt)}</> : null}
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
