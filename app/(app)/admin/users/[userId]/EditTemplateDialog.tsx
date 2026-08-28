"use client";

import { useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
import { C, type ProfilePage } from "./types";
import { Dialog, Btn, useToast } from "./ui";
import { HIDDEN_KEYS, humanKey, isEditableScalar } from "./TemplateCard";

/**
 * Edits the text a user wrote on their page.
 *
 * Only scalars are offered, matching what the endpoint accepts. Galleries,
 * quiz banks and track lists are listed as counts and left to the real editor —
 * a generic form over them would be a JSON textarea that corrupts a page on one
 * bad keystroke.
 *
 * Only changed fields are sent, so an edit records a small, readable diff in
 * the audit log rather than re-writing every field on the document.
 */
export default function EditTemplateDialog({
  page, content, hdr, onClose, onSaved,
}: {
  page: ProfilePage | null;
  content: Record<string, unknown> | null;
  hdr: () => Record<string, string>;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [initial, setInitial] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!content) return;
    const flat: Record<string, string> = {};
    for (const [k, v] of Object.entries(content)) {
      if (!HIDDEN_KEYS.has(k) && isEditableScalar(v)) flat[k] = String(v);
    }
    setDraft(flat);
    setInitial(flat);
  }, [content]);

  const changed = Object.keys(draft).filter((k) => draft[k] !== initial[k]);

  const save = async () => {
    if (changed.length === 0) return toast("Nothing changed", "bad");
    setBusy(true);
    try {
      const updates = Object.fromEntries(changed.map((k) => [k, draft[k]]));
      const r = await fetch(`${API_URL}/admin/super/pages/${page!.templateType}/${page!._id}`, {
        method: "PATCH", headers: hdr(), body: JSON.stringify({ updates }),
      });
      const j = await r.json();
      if (!j.success) { toast(j.error || "Failed", "bad"); return; }
      toast(j.message || "Saved");
      onSaved();
      onClose();
    } finally {
      setBusy(false);
    }
  };

  const keys = Object.keys(draft);

  return (
    <Dialog open={!!page} onClose={onClose} title={`Edit — ${page?.templateLabel || ""}`} wide>
      {keys.length === 0 ? (
        <p style={{ fontSize: 13, color: C.muted, margin: 0 }}>
          This page has no editable text fields.
        </p>
      ) : (
        <>
          <p style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.6, margin: "0 0 14px" }}>
            Editing on behalf of the user — every change is recorded in the audit log.
            Photos, music and quiz lists are not editable here; they stay as the user set them.
          </p>
          <div className="sa-edit-f">
            {keys.map((k) => {
              const long = (initial[k] || "").length > 60;
              return (
                <div key={k}>
                  <div className="sa-edit-k">
                    {humanKey(k)}
                    {draft[k] !== initial[k] && (
                      <span style={{ color: C.gold, marginLeft: 6 }}>• edited</span>
                    )}
                  </div>
                  {long ? (
                    <textarea className="sa-ta" value={draft[k]} onChange={(e) => setDraft({ ...draft, [k]: e.target.value })} />
                  ) : (
                    <input className="sa-input" value={draft[k]} onChange={(e) => setDraft({ ...draft, [k]: e.target.value })} />
                  )}
                </div>
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", alignItems: "center", marginTop: 16, flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: C.muted, marginRight: "auto" }}>
              {changed.length === 0 ? "No changes" : `${changed.length} field${changed.length > 1 ? "s" : ""} changed`}
            </span>
            <Btn variant="ghost" onClick={onClose}>Cancel</Btn>
            <Btn variant="primary" onClick={save} disabled={busy || changed.length === 0}>
              {busy ? "Saving…" : "Save changes"}
            </Btn>
          </div>
        </>
      )}
    </Dialog>
  );
}
