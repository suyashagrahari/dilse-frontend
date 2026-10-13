"use client";

import { useCallback, useEffect, useState } from "react";
import { API_URL } from "@/lib/config";
import { EyeOff, Trash2, RefreshCw } from "lucide-react";
import { C, STATUS_COLOR, type ProfileData } from "./types";
import { Card, Btn, Dialog, Pill, Empty, fmtAgo } from "./ui";
import { useToast } from "@/lib/toast/useToast";

type Pending = { kind: "status"; status: string } | { kind: "logout" } | null;

/**
 * The irreversible controls, deliberately separated from everything else.
 *
 * Suspend and ban both require a typed reason — it is stored on the account and
 * in the audit log, and it is what makes the decision reviewable later by
 * somebody who was not there.
 */
export default function DangerTab({
  data, hdr, reload,
}: {
  data: ProfileData; hdr: () => Record<string, string>; reload: () => void;
}) {
  const { pushToast } = useToast();
  const [reason, setReason] = useState("");
  const [until, setUntil] = useState("");
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<Pending>(null);
  const { user } = data;
  const status = user.status || "active";

  const run = async () => {
    if (!pending) return;
    setBusy(true);
    try {
      const path = pending.kind === "logout" ? "force-logout" : "status";
      const body = pending.kind === "logout"
        ? {}
        : { status: pending.status, reason: reason.trim(), until: until || undefined };
      const r = await fetch(`${API_URL}/admin/super/users/${user._id}/${path}`, {
        method: "POST", headers: hdr(), body: JSON.stringify(body),
      });
      const j = await r.json();
      if (!j.success) pushToast({ title: j.error || "Failed", type: "error" });
      else {
        pushToast({ title: pending.kind === "logout" ? "Signed out of all devices" : `Account is now ${(pending as { status: string }).status}`, type: "success" });
        setReason(""); setUntil(""); setPending(null); reload();
      }
    } finally {
      setBusy(false);
    }
  };

  const ask = (status: string) => {
    if (status !== "active" && !reason.trim()) { pushToast({ title: "A reason is required to suspend or ban", type: "error" }); return; }
    setPending({ kind: "status", status });
  };

  const copy = !pending ? "" :
    pending.kind === "logout"
      ? `Sign ${user.email} out of every device. They can sign back in immediately — this is for a token that may have leaked, not a punishment.`
      : pending.status === "banned"
      ? `${user.email} will be signed out everywhere, and ALL of their published pages will 404 for the recipients holding those links.`
      : pending.status === "suspended"
      ? `${user.email} will be signed out everywhere and cannot sign in. Their published pages stay live for recipients.`
      : `${user.email} regains access, and any hidden pages become reachable again.`;

  return (
    <>
      <style>{`
        .sa-dz-f { display: grid; gap: 8px; margin-bottom: 10px; grid-template-columns: minmax(0,1fr); }
        @media (min-width: 760px) { .sa-dz-f { grid-template-columns: minmax(0,1fr) 180px; } }
        .sa-dz-b { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 7px; }
        .sa-dz-b > .sa-btn { min-height: 38px; }
        @media (min-width: 760px) { .sa-dz-b { display: flex; } }
      `}</style>
      <Card title="Account status" tone="danger" action={<Pill text={status} color={STATUS_COLOR[status] || C.muted} />}>
        <p style={{ fontSize: 12.5, color: C.muted, margin: "0 0 11px", lineHeight: 1.6 }}>
          <strong style={{ color: C.text }}>Suspend</strong> blocks sign-in but leaves published pages reachable —
          recipients holding those links did nothing wrong.{" "}
          <strong style={{ color: C.text }}>Ban</strong> also hides every published page.
          Both sign the user out of every device immediately, and both are reversible.
        </p>
        <div className="sa-dz-f">
          <input className="sa-input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (required to suspend or ban)" />
          <input className="sa-input" type="date" value={until} onChange={(e) => setUntil(e.target.value)} title="Optional: auto-expire a suspension" />
        </div>
        <div className="sa-dz-b">
          <Btn variant="accent" onClick={() => ask("suspended")} disabled={busy || status === "suspended"}>Suspend</Btn>
          <Btn variant="danger" onClick={() => ask("banned")} disabled={busy || status === "banned"}>Ban</Btn>
          <Btn variant="ghost" onClick={() => ask("active")} disabled={busy || status === "active"}>Reinstate</Btn>
        </div>
      </Card>

      <Card title="Sessions" tone="danger" delay={0.05}>
        <p style={{ fontSize: 12.5, color: C.muted, margin: "0 0 11px", lineHeight: 1.6 }}>
          Signs the user out of every device at once. They can sign back in immediately —
          use it when a token may have been exposed rather than as a punishment.
        </p>
        <Btn variant="accent" onClick={() => setPending({ kind: "logout" })} disabled={busy}>
          Force sign-out everywhere
        </Btn>
      </Card>

      <CloseAccount data={data} hdr={hdr} reload={reload} />

      <Dialog open={!!pending} onClose={() => setPending(null)} title="Are you sure?">
        <p style={{ fontSize: 13.5, lineHeight: 1.65, margin: "0 0 16px" }}>{copy}</p>
        {pending?.kind === "status" && pending.status !== "active" && reason && (
          <p style={{ fontSize: 12.5, color: C.muted, margin: "0 0 16px" }}>
            Reason recorded: <em style={{ color: C.text }}>“{reason}”</em>
          </p>
        )}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Btn variant="ghost" onClick={() => setPending(null)}>Cancel</Btn>
          <Btn
            variant={pending?.kind === "status" && pending.status === "banned" ? "danger" : "primary"}
            onClick={run}
            disabled={busy}
          >
            {busy ? "Working…" : "Confirm"}
          </Btn>
        </div>
      </Dialog>
    </>
  );
}

// ── Close account ────────────────────────────────────────────────────────────

type CloseMode = "hide" | "delete";

/** "publishedPages" → "Published pages", "page_feedback" → "Page feedback". */
const human = (k: string) => {
  const t = k.replace(/_/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").toLowerCase();
  return t.charAt(0).toUpperCase() + t.slice(1);
};

/** Every numeric leaf of the preview, one level of nesting deep, as label → count. */
function counts(o: unknown, prefix = ""): [string, number][] {
  if (!o || typeof o !== "object") return [];
  return Object.entries(o as Record<string, unknown>).flatMap(([k, v]) =>
    typeof v === "number" ? [[prefix ? `${prefix} · ${human(k)}` : human(k), v] as [string, number]]
      : v && typeof v === "object" && !prefix ? counts(v, human(k)) : []
  );
}

/**
 * Closing an account because its owner asked us to.
 *
 * Two ways, and the copy says plainly which one can be taken back: hiding is
 * the "banned" machinery under a different name — sign-in blocked, every share
 * link 404s — and Reinstate above restores it all. Deleting removes every page
 * and anonymises the account; payment records stay, because the law needs them
 * and the Revenue numbers would otherwise change after the fact.
 *
 * The confirmation asks for the account's email typed out, not a click: it is
 * the one control on this screen that destroys a customer's work outright.
 */
function CloseAccount({ data, hdr, reload }: { data: ProfileData; hdr: () => Record<string, string>; reload: () => void }) {
  const { pushToast } = useToast();
  const { user } = data;
  const closed = user.status === "closed";
  const isSuper = user.role === "superadmin";

  const [preview, setPreview] = useState<Record<string, unknown> | null>(null);
  const [pErr, setPErr] = useState("");
  const [pLoading, setPLoading] = useState(false);
  const [mode, setMode] = useState<CloseMode>("hide");
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ mode: CloseMode; deleted?: Record<string, number>; hiddenShareLinks?: number } | null>(null);

  const loadPreview = useCallback(async () => {
    setPLoading(true);
    setPErr("");
    try {
      const r = await fetch(`${API_URL}/admin/super/users/${user._id}/close/preview`, { headers: hdr() });
      const j = await r.json().catch(() => null);
      if (r.ok && j?.success) setPreview(j.data || {});
      else setPErr(j?.error || `Could not load what would be affected (${r.status})`);
    } catch {
      setPErr("Could not reach the server.");
    } finally {
      setPLoading(false);
    }
  }, [user._id, hdr]);

  useEffect(() => { if (!isSuper && !(closed && user.closureMode === "delete")) loadPreview(); }, [loadPreview, isSuper, closed, user.closureMode]);

  // A hidden account can only go one further way: permanent deletion.
  const effMode: CloseMode = closed ? "delete" : mode;
  const emailOk = typed.trim().toLowerCase() === user.email.toLowerCase();
  const canSubmit = !!reason.trim() && emailOk && !busy;

  const run = async () => {
    if (!canSubmit) return;
    setBusy(true);
    try {
      const r = await fetch(`${API_URL}/admin/super/users/${user._id}/close`, {
        method: "POST", headers: hdr(), body: JSON.stringify({ mode: effMode, reason: reason.trim(), confirmEmail: typed.trim() }),
      });
      const j = await r.json().catch(() => null);
      if (!r.ok || !j?.success) { pushToast({ title: j?.error || `Could not close the account (${r.status})`, type: "error" }); return; }
      const res = (j.data || { mode: effMode }) as NonNullable<typeof done>;
      const n = Object.values(res.deleted || {}).reduce((a, b) => a + (Number(b) || 0), 0);
      pushToast({
        title: res.mode === "delete"
          ? `Account closed — ${n} ${n === 1 ? "record" : "records"} deleted, payment records kept`
          : `Account closed — ${res.hiddenShareLinks ?? 0} share ${res.hiddenShareLinks === 1 ? "link" : "links"} hidden`,
        type: "success",
      });
      setDone(res);
      setOpen(false); setReason(""); setTyped("");
      reload();
    } catch {
      pushToast({ title: "Could not reach the server", type: "error" });
    } finally {
      setBusy(false);
    }
  };

  const rows = counts(preview);

  return (
    <Card title="Close account" tone="danger" delay={0.1} action={closed ? <Pill text="closed" color={STATUS_COLOR.closed} /> : undefined}>
      <style>{`
        .sa-cl-opts { display: grid; gap: 8px; grid-template-columns: minmax(0,1fr); margin: 10px 0; }
        @media (min-width: 760px) { .sa-cl-opts { grid-template-columns: minmax(0,1fr) minmax(0,1fr); } }
        .sa-cl-opt { all: unset; box-sizing: border-box; cursor: pointer; display: flex; gap: 10px; align-items: flex-start; padding: 11px 12px; border-radius: 13px;
          border: 1px solid rgba(61,12,17,.1); background: #fff; transition: border-color .15s, box-shadow .15s; min-width: 0; }
        .sa-cl-opt:focus-visible { outline: 2px solid ${C.gold}; }
        .sa-cl-opt[data-on="1"] { border-color: var(--t); box-shadow: 0 0 0 1.5px var(--t) inset; background: color-mix(in srgb, var(--t) 5%, #fff); }
        .sa-cl-ic { flex: none; width: 30px; height: 30px; border-radius: 9px; display: grid; place-items: center; color: var(--t); background: color-mix(in srgb, var(--t) 13%, transparent); }
        .sa-cl-t { font-weight: 800; font-size: 13px; color: ${C.text}; }
        .sa-cl-d { font-size: 12px; color: ${C.muted}; line-height: 1.55; margin-top: 2px; }
        .sa-cl-counts { display: flex; flex-wrap: wrap; gap: 6px; }
        .sa-cl-c { display: inline-flex; gap: 5px; align-items: baseline; padding: 4px 9px; border-radius: 99px; background: rgba(61,12,17,.05); font-size: 11.5px; color: ${C.muted}; font-weight: 600; }
        .sa-cl-c b { color: ${C.text}; font-size: 12.5px; }
      `}</style>

      {isSuper ? (
        <p style={{ fontSize: 12.5, color: C.muted, margin: 0, lineHeight: 1.6 }}>The super admin account can&apos;t be closed from here.</p>
      ) : closed && user.closureMode === "delete" ? (
        <p style={{ fontSize: 12.5, color: C.muted, margin: 0, lineHeight: 1.6 }}>
          This account was closed {user.closedAt ? fmtAgo(user.closedAt) : ""} and its pages permanently deleted.
          Payment records are kept for accounting{user.closureReason ? <> · reason: <em style={{ color: C.text }}>“{user.closureReason}”</em></> : null}.
        </p>
      ) : (
        <>
          <p style={{ fontSize: 12.5, color: C.muted, margin: 0, lineHeight: 1.6 }}>
            Close any account. Both options sign the person out everywhere and every page they made stops opening.
            Their email is released: if they sign in again — Google, password or code — they get a{" "}
            <strong style={{ color: C.text }}>brand-new, empty account</strong>, never this one.
            {closed && <> It is already closed and hidden — you can still delete everything permanently, or Reinstate above to undo.</>}
          </p>

          <div style={{ marginTop: 10 }}>
            <div className="sa-edit-k" style={{ display: "flex", alignItems: "center", gap: 6 }}>
              What this account holds
              <button type="button" className="sa-btn sa-icon-btn" data-v="ghost" onClick={loadPreview} disabled={pLoading} title="Recount" aria-label="Recount"><RefreshCw size={11} /></button>
            </div>
            {pLoading && !preview ? (
              <div className="sa-skel" style={{ height: 30, borderRadius: 99 }} />
            ) : pErr ? (
              <span style={{ fontSize: 12, color: C.danger, fontWeight: 700 }}>{pErr}</span>
            ) : rows.length ? (
              <div className="sa-cl-counts">
                {rows.map(([k, v]) => <span key={k} className="sa-cl-c"><b>{v.toLocaleString("en-IN")}</b>{k}</span>)}
              </div>
            ) : (
              <Empty>Nothing to delete or hide.</Empty>
            )}
          </div>

          <div className="sa-cl-opts" role="radiogroup" aria-label="How to close">
            {!closed && (
              <button type="button" role="radio" aria-checked={mode === "hide"} className="sa-cl-opt" data-on={mode === "hide" ? "1" : "0"} style={{ ["--t" as string]: C.warn }} onClick={() => setMode("hide")}>
                <span className="sa-cl-ic"><EyeOff size={15} /></span>
                <span style={{ minWidth: 0 }}>
                  <span className="sa-cl-t">Close &amp; hide everything</span> <Pill text="reversible" color={C.ok} />
                  <span className="sa-cl-d" style={{ display: "block" }}>Every share link stops opening. Nothing is deleted — Reinstate brings it all back, unless the person has since made a new account with the same email.</span>
                </span>
              </button>
            )}
            <button type="button" role="radio" aria-checked={effMode === "delete"} className="sa-cl-opt" data-on={effMode === "delete" ? "1" : "0"} style={{ ["--t" as string]: C.danger }} onClick={() => setMode("delete")}>
              <span className="sa-cl-ic"><Trash2 size={15} /></span>
              <span style={{ minWidth: 0 }}>
                <span className="sa-cl-t">Close &amp; permanently delete all pages</span> <Pill text="cannot be undone" color={C.danger} />
                <span className="sa-cl-d" style={{ display: "block" }}>Every page, draft, contribution and saved item is deleted and the account is anonymised. Payment records are kept for accounting.</span>
              </span>
            </button>
          </div>

          <Btn variant="danger" onClick={() => setOpen(true)}>
            {effMode === "delete" ? <Trash2 size={13} /> : <EyeOff size={13} />} Close account…
          </Btn>
        </>
      )}

      {done && (
        <div className="sa-mini" style={{ marginTop: 10 }}>
          <b>{done.mode === "delete" ? "Closed and deleted" : "Closed and hidden"}</b>
          {typeof done.hiddenShareLinks === "number" && <div style={{ fontSize: 12, color: C.muted }}>{done.hiddenShareLinks} share links hidden</div>}
          {done.deleted && Object.keys(done.deleted).length > 0 && (
            <div className="sa-cl-counts" style={{ marginTop: 6 }}>
              {Object.entries(done.deleted).map(([k, v]) => <span key={k} className="sa-cl-c"><b>{v}</b>{human(k)}</span>)}
            </div>
          )}
        </div>
      )}

      <Dialog open={open} onClose={() => !busy && setOpen(false)} title={effMode === "delete" ? "Permanently delete and close?" : "Close and hide this account?"}>
        <p style={{ fontSize: 13.5, lineHeight: 1.65, margin: "0 0 12px" }}>
          {effMode === "delete"
            ? <><strong>{user.email}</strong> will be anonymised and <strong>every page they made deleted</strong>. Recipients holding their links will see a 404. Payment records stay for accounting. <strong>This cannot be undone.</strong></>
            : <><strong>{user.email}</strong> will be signed out everywhere and every share link will stop opening. If they sign in again they start a new, empty account. Nothing is deleted; Reinstate undoes it while their email is still free.</>}
        </p>
        <label style={{ display: "block", marginBottom: 10 }}>
          <span className="sa-edit-k">Reason (required — recorded in the audit log)</span>
          <textarea className="sa-ta" value={reason} onChange={(e) => setReason(e.target.value)} rows={2} placeholder="e.g. User emailed support on 12 Oct asking to close their account" autoFocus />
        </label>
        <label style={{ display: "block" }}>
          <span className="sa-edit-k">Type <span className="sa-mono" style={{ textTransform: "none", letterSpacing: 0, color: C.text }}>{user.email}</span> to confirm</span>
          <input className="sa-input" value={typed} onChange={(e) => setTyped(e.target.value)} autoComplete="off" spellCheck={false} placeholder={user.email}
            onPaste={(e) => e.preventDefault()} onKeyDown={(e) => e.key === "Enter" && run()} />
        </label>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16, flexWrap: "wrap" }}>
          <Btn variant="ghost" onClick={() => setOpen(false)} disabled={busy}>Cancel</Btn>
          <Btn variant="danger" onClick={run} disabled={!canSubmit}>
            {busy ? "Closing…" : effMode === "delete" ? "Delete everything & close" : "Close & hide"}
          </Btn>
        </div>
      </Dialog>
    </Card>
  );
}
