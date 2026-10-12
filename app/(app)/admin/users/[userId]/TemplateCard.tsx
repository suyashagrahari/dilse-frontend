"use client";

import { useCallback, useState } from "react";
import { API_URL } from "@/lib/config";
import { shareLinkFor } from "@/lib/subdomain";
import {
  Eye, EyeOff, KeyRound, Trash2, ExternalLink, Pencil, ChevronRight, BarChart3,
} from "lucide-react";
import { C, type ProfilePage } from "./types";
import { Btn, Pill, CopyBtn, fmtShort } from "./ui";
import { useToast } from "@/lib/toast/useToast";
import TemplateThumb from "../../TemplateThumb";

/**
 * One template the user made.
 *
 * The footer holds exactly three actions — Open, Edit, Delete — because three
 * is what fits one line at 320px. Password work lives inline on the password
 * row, where it is already in context, rather than competing for footer space.
 *
 * Details are fetched only when the disclosure is opened. Each fetch is its own
 * audit entry, so loading forty pages' contents just to render a list would
 * record forty reads the admin never made.
 */
export default function TemplateCard({
  page, subdomain, hdr, revealed, onReveal, onSetPassword, onDelete, onEdit, busy, index = 0,
}: {
  page: ProfilePage;
  /** The owner's subdomain: their links are only valid under it. */
  subdomain?: string | null;
  hdr: () => Record<string, string>;
  revealed?: string;
  onReveal: (p: ProfilePage) => void;
  onSetPassword: (p: ProfilePage) => void;
  onDelete: (p: ProfilePage) => void;
  onEdit: (p: ProfilePage, content: Record<string, unknown>) => void;
  busy: boolean;
  /** Position in the grid, for the staggered entry. */
  index?: number;
}) {
  const { pushToast } = useToast();
  const [details, setDetails] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(false);
  const url = page.shareId ? shareLinkFor(page.shareId, subdomain) : "";
  const shown = url.replace(/^https?:\/\//, "");

  const loadDetails = useCallback(async () => {
    if (details || loading) return details;
    setLoading(true);
    try {
      const r = await fetch(`${API_URL}/admin/super/pages/${page.templateType}/${page._id}/content`, { headers: hdr() });
      const j = await r.json();
      if (j.success) { setDetails(j.data.page); return j.data.page; }
      pushToast({ title: j.error || "Could not load the details", type: "error" });
    } catch {
      pushToast({ title: "Could not load the details", type: "error" });
    } finally {
      setLoading(false);
    }
    return null;
  }, [details, loading, page, hdr, pushToast]);

  const startEdit = async () => {
    const content = details || (await loadDetails());
    if (content) onEdit(page, content);
  };

  return (
    <div className="sa-tpl" style={{ animationDelay: `${Math.min(index, 12) * 35}ms` }}>
      {/* The template's own cover, so a grid of pages reads at a glance. */}
      <div className="sa-tpl-cover">
        <TemplateThumb slug={page.editorRoute} templateType={page.templateType} label={page.templateLabel} size="100%" ratio={0.46} radius={0}
          style={{ boxShadow: "none" }} />
        <span className="sa-tpl-cover-d">{fmtShort(page.createdAt)}</span>
      </div>
      <div className="sa-tpl-h">
        <h4 className="sa-tpl-name">{page.templateLabel}</h4>
        <Pill text={page.isPublished ? "Live" : "Draft"} color={page.isPublished ? C.ok : C.muted} />
        <span className="sa-reach" title="Views">
          <BarChart3 size={11} /><strong>{page.viewCount.toLocaleString()}</strong>
        </span>
      </div>

      <div className="sa-tpl-b">
        <div className="sa-row">
          <span className="sa-row-l">Link</span>
          <span className="sa-row-v" style={{ display: "flex", alignItems: "center", gap: 4, minWidth: 0 }}>
            {page.shareId ? (
              <>
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="sa-mono"
                  title={url}
                  style={{ color: C.accent, textDecoration: "none", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}
                >
                  {shown}
                </a>
                <CopyBtn value={url} label="Copy full link" />
              </>
            ) : (
              <span style={{ color: C.muted }}>Not published</span>
            )}
          </span>
        </div>

        <div className="sa-row">
          <span className="sa-row-l">Password</span>
          <span className="sa-row-v" style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {!page.hasPassword ? (
              <span style={{ color: C.muted }}>none</span>
            ) : revealed ? (
              <>
                <code className="sa-mono" style={{ fontWeight: 700 }}>{revealed}</code>
                <CopyBtn value={revealed} label="Copy password" />
              </>
            ) : (
              <span className="sa-mono" style={{ color: C.muted }}>••••••</span>
            )}
            {page.hasPassword && (
              <Btn variant="ghost" icon title={revealed ? "Hide" : "Reveal — this is logged"} onClick={() => onReveal(page)} disabled={busy}>
                {revealed ? <EyeOff size={12} /> : <Eye size={12} />}
              </Btn>
            )}
            {page.supportsPassword && (
              <Btn variant="ghost" icon title="Set or remove the password" onClick={() => onSetPassword(page)}>
                <KeyRound size={12} />
              </Btn>
            )}
          </span>
        </div>

        <div className="sa-row">
          <span className="sa-row-l">Created</span>
          <span className="sa-row-v">{fmtShort(page.createdAt)}</span>
        </div>

        <details className="sa-det" onToggle={(e) => (e.currentTarget as HTMLDetailsElement).open && loadDetails()}>
          <summary className="sa-det-sum">
            <ChevronRight size={12} /> What they filled in
          </summary>
          {loading && <div style={{ fontSize: 12, color: C.muted, marginTop: 8 }}>Loading…</div>}
          {details && <DetailGrid content={details} />}
        </details>
      </div>

      <div className="sa-tpl-f">
        {page.shareId ? (
          <a href={url} target="_blank" rel="noreferrer" className="sa-btn" data-v="ghost" title="Open the page">
            <ExternalLink size={13} /> Open
          </a>
        ) : (
          <Btn variant="ghost" disabled title="Not published yet"><ExternalLink size={13} /> Open</Btn>
        )}
        <Btn variant="primary" onClick={startEdit} disabled={busy || loading} title="Edit what they wrote">
          <Pencil size={13} /> Edit
        </Btn>
        <Btn variant="danger" onClick={() => onDelete(page)} disabled={busy} title="Delete permanently">
          <Trash2 size={13} /> Delete
        </Btn>
      </div>
    </div>
  );
}

/** Keys that are plumbing rather than something the user typed. */
export const HIDDEN_KEYS = new Set([
  "_id", "__v", "userId", "shareId", "password", "passwordRaw", "contribToken",
  "viewCount", "installCount", "createdAt", "updatedAt", "isPublished",
  "quizAttempts", "quizAnswers", "gameResponses",
]);

export const humanKey = (k: string) =>
  k.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()).replace(/\s+/g, " ").trim();

/** True for the values a person typed, as opposed to media, lists and objects. */
export const isEditableScalar = (v: unknown) =>
  typeof v === "string" || typeof v === "number" || typeof v === "boolean";

function DetailGrid({ content }: { content: Record<string, unknown> }) {
  const entries = Object.entries(content).filter(
    ([k, v]) => !HIDDEN_KEYS.has(k) && isEditableScalar(v) && String(v).trim() !== ""
  );
  const lists = Object.entries(content).filter(
    ([k, v]) => !HIDDEN_KEYS.has(k) && Array.isArray(v) && v.length > 0
  );

  if (entries.length === 0 && lists.length === 0) {
    return <div style={{ fontSize: 12, color: C.muted, marginTop: 8 }}>Nothing filled in yet.</div>;
  }

  return (
    <>
      <div className="sa-det-grid">
        {entries.map(([k, v]) => (
          <div key={k} className="sa-det-i">
            <div className="sa-det-k">{humanKey(k)}</div>
            <div className="sa-det-v">{typeof v === "boolean" ? (v ? "Yes" : "No") : String(v)}</div>
          </div>
        ))}
      </div>
      {lists.length > 0 && (
        // Counted, not rendered. The link opens the real page; a wall of
        // someone's photos here answers nothing the link does not.
        <div style={{ marginTop: 9, display: "flex", gap: 6, flexWrap: "wrap" }}>
          {lists.map(([k, v]) => (
            <span key={k} className="sa-pill" style={{ color: C.accent, background: "rgba(201,168,76,0.14)", border: `1px solid rgba(201,168,76,0.4)` }}>
              {humanKey(k)}: {(v as unknown[]).length}
            </span>
          ))}
        </div>
      )}
    </>
  );
}
