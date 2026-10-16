"use client";

// ─── One prospect: details, the whole email conversation, what is queued ────
//
// The conversation is the shared ConversationThread, so a prospect's history
// reads exactly like an influencer's — and once they join it IS their
// influencer conversation (the server re-homes the thread), with a link here.

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AlertTriangle, AtSign, Ban, CheckCircle2, Clock, Loader2, Mail, MailPlus, Reply, RotateCcw, Send, StickyNote, XCircle } from "lucide-react";
import ConversationThread, { type Thread } from "@/components/admin/ConversationThread";
import { A } from "../../adminKit";
import { KIND_LABEL, Sheet, StatusPill, api, ago, when, type JobKind, type Prospect } from "./shared";

interface Detail {
  prospect: Prospect;
  thread: (Thread & { userEmail: string; kind: string }) | null;
  jobs: { id: string; kind: JobKind; state: string; error: string; subject: string; sentAt: string | null; createdAt: string; via: string }[];
}

const JOB_TONE: Record<string, string> = { queued: "#6d4ad1", sending: "#6d4ad1", sent: "#1e7a4b", failed: "#b3261e", cancelled: "#9a7070", skipped: "#b7791f" };

export default function ProspectSheet({
  id,
  token,
  onClose,
  onCompose,
  onChanged,
}: {
  id: string | null;
  token: string;
  onClose: () => void;
  onCompose: (ids: string[], intent?: JobKind, allowNotInterested?: boolean) => void;
  onChanged: () => void;
}) {
  const [d, setD] = useState<Detail | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    const r = await api<{ data: Detail }>(token, `/prospects/${id}`);
    if (!r.ok) setErr(r.data.error || "Could not load");
    else { setD(r.data.data); setErr(null); }
  }, [id, token]);

  // Remounted per prospect by the page (`key`), so state starts empty.
  useEffect(() => {
    if (!id) return;
    let live = true;
    api<{ data: Detail }>(token, `/prospects/${id}`).then((r) => {
      if (!live) return;
      if (!r.ok) setErr(r.data.error || "Could not load");
      else setD(r.data.data);
    });
    return () => { live = false; };
  }, [id, token]);

  async function act(path: string, body: unknown, method = "POST") {
    setBusy(true);
    const r = await api(token, path, { method, body });
    setBusy(false);
    if (!r.ok) { setErr(r.data.error || "Failed"); return; }
    await load();
    onChanged();
  }

  const p = d?.prospect;
  const due = p?.due;
  const queued = d?.jobs.find((j) => j.state === "queued");
  const kinds: JobKind[] = due?.ok ? due.kinds || [due.kind] : [];
  const sentJobs = (d?.jobs || []).filter((j) => j.state === "sent");
  const ICON: Record<JobKind, typeof Send> = { initial: Send, followup: Send, fresh: MailPlus, reply: Reply };
  const LABEL: Record<JobKind, string> = { initial: "Write first email", followup: "Follow-up", fresh: "New email", reply: "Reply" };

  function compose(k: JobKind) {
    if (!p || !due?.ok) return;
    if (due.needsConfirm && !window.confirm(`${p.name} said they're not interested.\n\nSend anyway? Only do this if they asked to hear more.`)) return;
    onCompose([p.id], k, !!due.needsConfirm);
  }

  return (
    <Sheet
      open={!!id}
      onClose={onClose}
      wide
      title={p ? <>{p.name} <StatusPill status={p.status} /></> : "Prospect"}
      footer={
        p && (
          <>
            {p.status === "not_interested" ? (
              <button type="button" className="psp-btn" disabled={busy} onClick={() => void act(`/prospects/${p.id}`, { status: "reopen" }, "PATCH")}><RotateCcw size={14} /> Reopen</button>
            ) : !["joined", "bounced", "unsubscribed"].includes(p.status) ? (
              <button type="button" className="psp-btn danger" disabled={busy} onClick={() => void act(`/prospects/${p.id}`, { status: "not_interested" }, "PATCH")}><Ban size={14} /> Not interested</button>
            ) : null}
            {queued && (
              <button type="button" className="psp-btn" disabled={busy} onClick={() => void act("/prospects/cancel", { ids: [p.id] })}><XCircle size={14} /> Cancel queued</button>
            )}
            {p.joinedUserId && (
              <Link className="psp-btn primary" href={`/admin/influencers/${p.joinedUserId}`}>Open influencer page</Link>
            )}
            {due?.ok && !queued && kinds.map((k, i) => {
              const Icon = ICON[k];
              return (
                <button key={k} type="button" className={`psp-btn ${i === 0 ? "primary" : ""}`} onClick={() => compose(k)}>
                  <Icon size={14} /> {LABEL[k]}
                </button>
              );
            })}
          </>
        )
      }
    >
      {err && <p className="psp-err" style={{ marginBottom: 10 }}>{err}</p>}
      {!d ? (
        <div className="pss-loading"><Loader2 size={16} className="psp-spin" /> Loading…</div>
      ) : (
        <div className="pss">
          <aside className="pss-facts">
            <div><Mail size={13} /><span>{p!.email}</span></div>
            {p!.instagram && (
              <div><AtSign size={13} /><a href={`https://instagram.com/${p!.instagram}`} target="_blank" rel="noreferrer noopener">@{p!.instagram}</a></div>
            )}
            {(p!.niche || p!.followerRange) && <div><StickyNote size={13} /><span>{[p!.niche, p!.followerRange && `${p!.followerRange} followers`].filter(Boolean).join(" · ")}</span></div>}
            {p!.note && <p className="pss-note">“{p!.note}”</p>}
            <dl>
              <dt>Added</dt><dd>{ago(p!.createdAt)}{p!.source === "csv" ? " · from a list" : ""}</dd>
              <dt>Emails sent</dt><dd>{p!.contactCount}{sentJobs.length ? <small className="pss-dates">{sentJobs.slice(0, 6).map((j) => `${KIND_LABEL[j.kind]} ${when(j.sentAt)}`).join(" · ")}</small> : null}</dd>
              <dt>Last contacted</dt><dd>{ago(p!.lastContactedAt)}</dd>
              <dt>Last reply</dt><dd>{ago(p!.lastReplyAt)}</dd>
            </dl>
            <p className={`pss-due ${due?.ok ? (due.needsConfirm ? "warn" : "ok") : ""}`}>
              {due?.ok ? (due.needsConfirm ? <AlertTriangle size={13} /> : <CheckCircle2 size={13} />) : <Clock size={13} />}
              <span>
                {due?.ok
                  ? due.needsConfirm
                    ? due.needsConfirm
                    : `Can send: ${kinds.map((k) => KIND_LABEL[k].toLowerCase()).join(" · ")}${due.followupDue ? " — a follow-up is due" : ""}`
                  : `Can't email: ${due?.reason || "—"}`}
              </span>
            </p>
            {due?.ok && due.recent && (
              <p className="pss-due warn"><Clock size={13} /><span>{due.recent}</span></p>
            )}
            {d.jobs.length > 0 && (
              <div className="pss-jobs">
                <h4>Send log</h4>
                <ul>
                  {d.jobs.map((j) => (
                    <li key={j.id}>
                      <span className="pss-job-state" style={{ color: JOB_TONE[j.state] || A.soft }}>{j.state}</span>
                      <span>{KIND_LABEL[j.kind]} · {when(j.sentAt || j.createdAt)}{j.via === "stub" ? " · stub" : ""}</span>
                      {j.error && <small>{j.error}</small>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
          <section className="pss-thread">
            {d.thread ? (
              <ConversationThread thread={d.thread} maxHeight="min(60vh, 520px)" scrollToEnd />
            ) : (
              <div className="pss-empty"><Mail size={18} /><p><b>No emails yet.</b> Select them in the list and press Generate, or use the button below.</p></div>
            )}
          </section>
        </div>
      )}
      <style>{`
        .pss { display: grid; grid-template-columns: minmax(0, 280px) minmax(0, 1fr); gap: 16px; }
        .pss-loading, .pss-empty { display: flex; align-items: center; gap: 8px; padding: 22px 14px; border-radius: 14px; border: 1px dashed rgba(201,168,76,.55); color: ${A.soft}; font-size: 13px; }
        .pss-empty p { margin: 0; line-height: 1.5; }
        .pss-facts { display: grid; gap: 8px; align-content: start; font-size: 13px; color: ${A.ink}; min-width: 0; }
        .pss-facts > div:not(.pss-jobs) { display: flex; gap: 7px; align-items: center; min-width: 0; }
        .pss-facts > div svg { flex: none; color: ${A.goldDeep}; }
        .pss-facts > div span, .pss-facts > div a { overflow-wrap: anywhere; color: ${A.ink}; }
        .pss-note { margin: 0; padding: 8px 10px; border-radius: 10px; background: rgba(201,168,76,.1); color: ${A.soft}; font-size: 12.5px; line-height: 1.5; }
        .pss-facts dl { display: grid; grid-template-columns: auto 1fr; gap: 4px 10px; margin: 4px 0 0; font-size: 12px; }
        .pss-facts dt { color: ${A.muted}; font-weight: 700; }
        .pss-facts dd { margin: 0; }
        .pss-due { margin: 0; display: flex; gap: 6px; align-items: flex-start; padding: 8px 10px; border-radius: 10px; background: rgba(61,12,17,.04); color: ${A.soft}; font-size: 12px; line-height: 1.45; }
        .pss-due svg { flex: none; margin-top: 2px; }
        .pss-due.ok { background: rgba(30,122,75,.07); color: ${A.ok}; font-weight: 700; }
        .pss-due.warn { background: rgba(183,121,31,.1); color: #7a4f12; font-weight: 700; }
        .pss-dates { display: block; color: ${A.muted}; font-size: 11px; line-height: 1.4; }
        .pss-jobs h4 { margin: 4px 0 6px; font-size: 11px; letter-spacing: .06em; text-transform: uppercase; color: ${A.muted}; }
        .pss-jobs ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
        .pss-jobs li { display: grid; grid-template-columns: auto 1fr; gap: 1px 8px; font-size: 12px; }
        .pss-job-state { font-weight: 800; text-transform: capitalize; }
        .pss-jobs small { grid-column: 1 / -1; color: ${A.danger}; line-height: 1.4; }
        .pss-thread { min-width: 0; }
        @media (max-width: 760px) { .pss { grid-template-columns: minmax(0, 1fr); } }
      `}</style>
    </Sheet>
  );
}
