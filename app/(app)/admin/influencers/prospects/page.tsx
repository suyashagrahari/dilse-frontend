"use client";

// ─── Super admin: Prospects — creators we invite who have not joined ────────
//
// Add people (+ Add), tick one or many, press Generate:
//   · one   → the AI writes an email for them from what you typed about them;
//   · many  → one template with {{firstName}}, rendered per person.
// The dialog picks the kind of email (first email / follow-up / new email /
// reply) and lists anyone it can't include, with the reason. Review, fix
// anything the spam check flags, Send. The server re-checks each person right
// before sending, so an unsubscribe or bounce that lands meanwhile wins.
//
// Server: server/src/controllers/prospect.controller.ts.
// Deliverability + setup: server/docs/influencer-prospects.md.

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, AtSign, Ban, CheckCircle2, ChevronRight, Clock, ExternalLink, Inbox, Loader2, Mail, Plus, Send, Sparkles, Trash2, Users, X } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { isSuperAdmin } from "@/lib/roles";
import { A, AdminPage, ChipGroup, EmptyState, Hero, HeroStat, Loading, Panel, SearchBox } from "../../adminKit";
import InfluencerTabs from "../InfluencerTabs";
import AddProspectModal from "./AddProspectModal";
import Composer from "./Composer";
import ProspectSheet from "./ProspectSheet";
import TractionPanel from "./TractionPanel";
import { KIND_LABEL, SHARED_CSS, StatusPill, api, ago, senderLine, when, type DeployStatus, type JobKind, type Prospect } from "./shared";

type Filter = "all" | "new" | "followup" | "contacted" | "replied" | "joined" | "closed";

const FILTERS: { value: Filter; label: string; test: (p: Prospect) => boolean }[] = [
  { value: "all", label: "All", test: () => true },
  { value: "new", label: "New", test: (p) => p.status === "new" },
  { value: "followup", label: "Follow-up due", test: (p) => !!p.due?.ok && !!p.due.followupDue },
  { value: "contacted", label: "Contacted", test: (p) => p.status === "contacted" },
  { value: "replied", label: "Replied", test: (p) => p.status === "replied" },
  { value: "joined", label: "Joined", test: (p) => p.status === "joined" },
  { value: "closed", label: "Not interested / bounced", test: (p) => ["not_interested", "bounced", "unsubscribed"].includes(p.status) },
];

interface ListData {
  prospects: Prospect[];
  counts: Record<string, number>;
  status: DeployStatus;
}

export default function ProspectsPage() {
  const router = useRouter();
  const { user, accessToken } = useAppSelector((s) => s.auth);
  const token = accessToken || "";
  const [data, setData] = useState<ListData | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [adding, setAdding] = useState(false);
  /** Bumped on every open, so each dialog mounts fresh instead of resetting in an effect. */
  const [mountKey, setMountKey] = useState(0);
  const [composeIds, setComposeIds] = useState<string[] | null>(null);
  const [composeIntent, setComposeIntent] = useState<{ intent: JobKind | null; allowNotInterested: boolean }>({ intent: null, allowNotInterested: false });
  const [openId, setOpenId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user && !isSuperAdmin(user.role)) router.replace("/admin/analytics");
  }, [user, router]);

  const apply = useCallback((r: { ok: boolean; data: { data: ListData; error?: string } }) => {
    if (!r.ok) { setLoadErr(r.data.error || "Could not load prospects"); return; }
    setData(r.data.data);
    setLoadErr(null);
  }, []);

  const load = useCallback(async () => {
    if (!token) return;
    apply(await api<{ data: ListData }>(token, "/prospects"));
  }, [token, apply]);

  useEffect(() => {
    if (!token) return;
    let live = true;
    api<{ data: ListData }>(token, "/prospects").then((r) => { if (live) apply(r); });
    return () => { live = false; };
  }, [token, apply]);
  // Queue progress and replies arrive on their own; keep the list current.
  useEffect(() => {
    if (!token) return;
    const t = setInterval(() => { if (document.visibilityState === "visible") void load(); }, 20_000);
    return () => clearInterval(t);
  }, [token, load]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 7000);
    return () => clearTimeout(t);
  }, [toast]);

  const rows = useMemo(() => data?.prospects || [], [data]);
  const shown = useMemo(() => {
    const s = q.trim().toLowerCase().replace(/^@/, "");
    const f = FILTERS.find((x) => x.value === filter)!;
    return rows.filter((p) => f.test(p) && (!s || [p.name, p.email, p.instagram, p.niche, p.note].some((v) => v.toLowerCase().includes(s))));
  }, [rows, q, filter]);

  const selected = useMemo(() => rows.filter((p) => sel.has(p.id)), [rows, sel]);
  const allShownSelected = shown.length > 0 && shown.every((p) => sel.has(p.id));
  const toggle = (id: string) => setSel((prev) => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const toggleAll = () => setSel((prev) => {
    const n = new Set(prev);
    if (allShownSelected) shown.forEach((p) => n.delete(p.id));
    else shown.forEach((p) => n.add(p.id));
    return n;
  });

  // Mixed stages are fine: the dialog plans one kind of email for the
  // selection and lists anyone it leaves out, with the reason.
  const emailable = selected.filter((p) => p.due?.ok);
  const generateHint = selected.length > 0 && emailable.length === 0 ? "None of the selected can be emailed (unsubscribed, bounced or joined)" : undefined;

  async function bulk(path: string, label: string) {
    setBusy(true);
    const r = await api<{ data: Record<string, number> }>(token, path, { body: { ids: [...sel], status: "not_interested" } });
    setBusy(false);
    if (!r.ok) { setToast({ ok: false, text: r.data.error || "Failed" }); return; }
    setToast({ ok: true, text: label });
    setSel(new Set());
    await load();
  }

  const st = data?.status;
  const c = data?.counts || {};
  const unread = c.unread || 0;

  return (
    <AdminPage
      title="Influencers"
      icon={<Users size={18} />}
      subtitle="Creators you'd like to invite to the influencer programme. Add them, select one to get an email written for them or several to get a template, review it, and send — first emails, follow-ups and new emails, any time. Emails come from Yash personally (a plain note, then a light ask), under a daily cap, and replies land here."
    >
      <Hero>
        <div className="adk-hero-grid">
          <HeroStat big label="PROSPECTS" value={c.all || 0} sub={`${c.new || 0} not yet emailed`} tone="#ffe3a3" />
          <HeroStat label="CONTACTED" value={(c.contacted || 0) + (c.replied || 0) + (c.joined || 0)} />
          <HeroStat label="REPLIED" value={(c.replied || 0)} sub={unread ? `${unread} unread` : undefined} />
          <HeroStat label="JOINED" value={c.joined || 0} />
        </div>
      </Hero>

      <InfluencerTabs badge={{ prospects: unread }} />

      {st && (
        <ul className="pro-status">
          <li className={st.sendMode === "ses" ? "ok" : st.sendMode === "stub" ? "warn" : "bad"}>
            {st.sendMode === "off" ? <AlertTriangle size={12} /> : <Mail size={12} />}
            <span>
              {st.sendMode === "ses" && <>Sends as <b>{senderLine(st)}</b> · replies land here via {st.personal?.replyToAddress || st.replyToAddress}</>}
              {st.sendMode === "stub" && <>Dev stub — emails are recorded, <b>not delivered</b></>}
              {st.sendMode === "off" && <>Sending is off — SES is not configured on this server</>}
            </span>
          </li>
          {st.quietLane && (st.quietLane.state === "missing" || st.quietLane.state === "off") && (
            <li className="warn">
              <AlertTriangle size={12} />
              <span>{st.quietLane.state === "off" ? "Quiet sending lane is off — prospect mail uses the default SES configuration set (open tracking on)." : st.quietLane.message || "Quiet lane not set up yet."}</span>
            </li>
          )}
          <li className="info">
            <Sparkles size={12} />
            <span>Replies say <b>{st.commissionPercent}% commission</b> — the live programme rate from the Influencers tab{st.commissionPercent !== 30 ? " (not 30%)" : ""}. Join link: {st.joinUrl.replace(/^https:\/\//, "")}</span>
          </li>
          <li className={st.queued ? "info" : "ok"}>
            <Clock size={12} />
            <span>
              <b>{st.sentLast24h}/{st.dailyCap}</b> sent in the last 24h · {st.queued ? <><b>{st.queued} queued</b>{st.queueFinishEstimate ? `, last one ~${when(st.queueFinishEstimate)}` : ""}</> : "queue empty"} · follow-ups any time (suggested after {st.followUpDays} days)
              {st.lastError && <> · <span style={{ color: A.danger }}>last error: {st.lastError}</span></>}
            </span>
          </li>
        </ul>
      )}

      {token && <TractionPanel token={token} />}

      <Panel
        title="Prospects"
        note={data ? `${shown.length} shown` : undefined}
        delay={0.05}
        style={{ marginTop: 12 }}
        right={<button type="button" className="psp-btn primary" onClick={() => { setMountKey((k) => k + 1); setAdding(true); }}><Plus size={15} /> Add</button>}
      >
        <div className="pro-tools">
          <SearchBox value={q} onChange={setQ} placeholder="Search name, email, @handle, note" style={{ flex: "1 1 240px", minWidth: 0 }} />
        </div>
        <div className="pro-chips">
          <ChipGroup
            id="pro-filter"
            value={filter}
            onChange={(v) => { setFilter(v); }}
            options={FILTERS.map((f) => ({ value: f.value, label: f.value === "replied" && unread ? <>{f.label} <i className="pro-dot" /></> : f.label, count: rows.filter(f.test).length }))}
          />
        </div>

        {loadErr && <p className="psp-err">{loadErr}</p>}
        {!data ? (
          <Loading />
        ) : shown.length === 0 ? (
          <EmptyState
            icon={<Send size={22} />}
            title={rows.length ? "No one matches" : "No prospects yet"}
            note={rows.length ? undefined : "Press + Add to invite your first creator."}
          />
        ) : (
          <div className="pro-list" role="table" aria-label="Prospects">
            <div className="pro-head" role="row">
              <label className="pro-cb" role="columnheader">
                <input type="checkbox" checked={allShownSelected} onChange={toggleAll} aria-label="Select all shown" />
              </label>
              <span role="columnheader">Name</span>
              <span role="columnheader">Instagram</span>
              <span role="columnheader">Status</span>
              <span role="columnheader">Last contacted</span>
              <span role="columnheader" />
            </div>
            {shown.map((p) => (
              <div key={p.id} className={`pro-row ${sel.has(p.id) ? "on" : ""} ${p.unread ? "unread" : ""}`} role="row">
                <label className="pro-cb" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" checked={sel.has(p.id)} onChange={() => toggle(p.id)} aria-label={`Select ${p.name}`} />
                </label>
                <button type="button" className="pro-open" onClick={() => setOpenId(p.id)}>
                  <span className="pro-name">
                    <b>{p.name}</b>
                    <small>{p.email}</small>
                    {(p.niche || p.note) && <small className="pro-note" title={p.note || p.niche}>{p.note || p.niche}</small>}
                  </span>
                  {/* The row is a button, so the handle can't be an <a>: open Instagram without opening the row. */}
                  <span className="pro-ig">
                    {p.instagram ? (
                      <span
                        role="link"
                        tabIndex={0}
                        className="pro-ig-link"
                        title={`Open @${p.instagram} on Instagram`}
                        onClick={(e) => { e.stopPropagation(); window.open(`https://www.instagram.com/${p.instagram}/`, "_blank", "noopener,noreferrer"); }}
                        onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); e.preventDefault(); window.open(`https://www.instagram.com/${p.instagram}/`, "_blank", "noopener,noreferrer"); } }}
                      >
                        <AtSign size={11} />{p.instagram}<ExternalLink size={10} />
                      </span>
                    ) : <em>—</em>}
                  </span>
                  <span className="pro-st">
                    <StatusPill status={p.status} />
                    {p.status === "contacted" && p.firstTouch && <span className="pro-touch" title={p.firstTouch === "connect" ? "The first email was a hello asking to connect — no pitch yet" : "The first email pitched the idea"}>{p.firstTouch === "connect" ? "Connect sent" : "Pitch sent"}</span>}
                    {p.unread && <span className="pro-new"><Inbox size={10} /> New reply</span>}
                    {p.job && (p.job.state === "queued" || p.job.state === "sending") && <span className="pro-q"><Loader2 size={10} className="psp-spin" /> {KIND_LABEL[p.job.kind]} queued</span>}
                    {p.job?.state === "failed" && <span className="pro-fail" title={p.job.error}><AlertTriangle size={10} /> Failed</span>}
                    {p.due?.ok && p.due.followupDue && !p.job?.state?.match(/queued|sending/) && <span className="pro-due">Follow-up due</span>}
                  </span>
                  <span className="pro-last">{p.lastContactedAt ? ago(p.lastContactedAt) : <em>never</em>}{p.contactCount > 0 && <small title={`${p.messages} message(s) in the conversation`}><Mail size={10} /> {p.contactCount} sent</small>}</span>
                  <ChevronRight size={15} className="pro-chev" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {sel.size > 0 && (
        <div className="pro-bar" role="toolbar" aria-label="Selection actions">
          <span className="pro-bar-n"><b>{sel.size}</b><span className="pro-sel-word"> selected</span></span>
          <button type="button" className="psp-btn gold" disabled={!!generateHint} title={generateHint} onClick={() => { setMountKey((k) => k + 1); setComposeIntent({ intent: null, allowNotInterested: false }); setComposeIds(selected.map((p) => p.id)); }}>
            <Sparkles size={15} /> Generate{selected.length > 1 ? ` (${selected.length})` : ""}
          </button>
          <button type="button" className="psp-btn" disabled={busy} onClick={() => void bulk("/prospects/status", "Marked not interested")}><Ban size={14} /> <span className="pro-hide-sm">Not interested</span></button>
          <button
            type="button"
            className="psp-btn danger"
            disabled={busy}
            onClick={() => { if (window.confirm(`Delete ${sel.size} prospect${sel.size === 1 ? "" : "s"}? Their conversations stay, and anyone who unsubscribed stays blocked.`)) void bulk("/prospects/delete", "Deleted"); }}
          >
            <Trash2 size={14} /> <span className="pro-hide-sm">Delete</span>
          </button>
          <button type="button" className="pro-bar-x" aria-label="Clear selection" onClick={() => setSel(new Set())}><X size={15} /></button>
          {generateHint && <span className="pro-bar-hint">{generateHint}</span>}
        </div>
      )}

      {toast && (
        <div className={`pro-toast ${toast.ok ? "ok" : ""}`} role="status">
          {toast.ok ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />} {toast.text}
        </div>
      )}

      <AddProspectModal
        key={`add-${mountKey}`}
        open={adding}
        onClose={() => setAdding(false)}
        token={token}
        onAdded={(p) => { setToast({ ok: true, text: p ? `${p.name} added` : "List added" }); void load(); }}
        onOpenProspect={(id) => setOpenId(id)}
      />
      <Composer
        key={`cmp-${mountKey}`}
        open={!!composeIds}
        onClose={() => setComposeIds(null)}
        token={token}
        ids={composeIds || []}
        status={data?.status || null}
        initialIntent={composeIntent.intent}
        initialAllowNotInterested={composeIntent.allowNotInterested}
        onQueued={(m) => { setToast({ ok: true, text: m }); setSel(new Set()); void load(); }}
      />
      <ProspectSheet
        key={`ps-${openId || "none"}`}
        id={openId}
        token={token}
        onClose={() => setOpenId(null)}
        onCompose={(ids, intent, allowNotInterested) => { setOpenId(null); setMountKey((k) => k + 1); setComposeIntent({ intent: intent || null, allowNotInterested: !!allowNotInterested }); setComposeIds(ids); }}
        onChanged={() => void load()}
      />

      <style>{SHARED_CSS + CSS}</style>
    </AdminPage>
  );
}

const CSS = `
  .pro-status { list-style: none; margin: 12px 0 0; padding: 0; display: grid; gap: 4px; }
  .pro-status li { display: flex; align-items: flex-start; gap: 6px; font-size: 12px; line-height: 1.45; padding: 7px 10px; border-radius: 10px; overflow-wrap: anywhere; }
  .pro-status li svg { flex: none; margin-top: 2px; }
  .pro-status li.ok { background: rgba(30,122,75,.07); color: #1b5e3c; }
  .pro-status li.warn { background: rgba(183,121,31,.10); color: #7a4f12; }
  .pro-status li.bad { background: rgba(179,38,30,.08); color: ${A.danger}; }
  .pro-status li.info { background: rgba(201,168,76,.10); color: #6b4a1f; }
  .pro-tools { display: flex; gap: 8px; margin-bottom: 10px; }
  .pro-chips { overflow-x: auto; scrollbar-width: none; margin: 0 -2px 12px; padding: 0 2px; }
  .pro-chips::-webkit-scrollbar { display: none; }
  .pro-dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: ${A.danger}; }
  .pro-list { display: grid; border: 1px solid ${A.edge}; border-radius: 16px; overflow: hidden; background: ${A.paper}; }
  .pro-head, .pro-open { display: grid; grid-template-columns: minmax(0, 2.2fr) minmax(0, 1.2fr) minmax(0, 1.6fr) minmax(0, 1fr) 18px; gap: 12px; align-items: center; }
  .pro-head { grid-template-columns: 44px minmax(0, 2.2fr) minmax(0, 1.2fr) minmax(0, 1.6fr) minmax(0, 1fr) 18px; padding: 0 14px 0 0; height: 40px; background: rgba(61,12,17,.035); font-size: 10.5px; font-weight: 800; letter-spacing: .07em; text-transform: uppercase; color: ${A.muted}; }
  .pro-row { display: grid; grid-template-columns: 44px minmax(0, 1fr); align-items: stretch; border-top: 1px solid ${A.edge}; transition: background .15s; }
  .pro-row:hover { background: rgba(201,168,76,.06); }
  .pro-row.on { background: rgba(201,168,76,.12); }
  .pro-row.unread .pro-name b::after { content: ""; display: inline-block; width: 7px; height: 7px; margin-left: 6px; border-radius: 50%; background: ${A.danger}; vertical-align: middle; }
  .pro-cb { display: flex; align-items: center; justify-content: center; cursor: pointer; min-height: 44px; }
  .pro-cb input { width: 18px; height: 18px; accent-color: ${A.maroon}; cursor: pointer; }
  .pro-open { min-width: 0; padding: 10px 14px 10px 0; border: none; background: none; text-align: left; font: inherit; color: inherit; cursor: pointer; }
  .pro-name { display: flex; flex-direction: column; min-width: 0; }
  .pro-name b { font-size: 14px; color: ${A.ink}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .pro-name small { font-size: 12px; color: ${A.muted}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .pro-ig { display: inline-flex; align-items: center; gap: 1px; font-size: 12.5px; font-weight: 700; color: ${A.goldDeep}; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .pro-ig-link { display: inline-flex; align-items: center; gap: 2px; min-width: 0; overflow: hidden; text-overflow: ellipsis; cursor: pointer; border-radius: 6px; padding: 2px 4px; margin: -2px -4px; }
  .pro-ig-link:hover, .pro-ig-link:focus-visible { background: ${A.goldDeep}14; text-decoration: underline; outline: none; }
  .pro-ig-link svg:last-child { opacity: .6; margin-left: 2px; flex: none; }
  .pro-note { display: block; color: ${A.muted}; font-size: 11.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 100%; }
  .pro-ig em, .pro-last em { color: ${A.muted}; font-style: normal; font-weight: 500; }
  .pro-st { display: flex; flex-wrap: wrap; gap: 4px; align-items: center; min-width: 0; }
  .pro-new, .pro-q, .pro-fail, .pro-due { display: inline-flex; align-items: center; gap: 3px; padding: 2px 7px; border-radius: 99px; font-size: 10.5px; font-weight: 800; white-space: nowrap; }
  .pro-new { background: ${A.danger}; color: #fff; }
  .pro-touch { display: inline-flex; align-items: center; padding: 2px 7px; border-radius: 99px; font-size: 10.5px; font-weight: 800; white-space: nowrap; background: rgba(61,12,17,.06); color: #6b4b4b; }
  .pro-q { background: rgba(109,74,209,.1); color: #4b3296; }
  .pro-fail { background: rgba(179,38,30,.1); color: ${A.danger}; }
  .pro-due { background: rgba(183,121,31,.12); color: #7a4f12; }
  .pro-last { display: flex; flex-direction: column; font-size: 12.5px; color: ${A.soft}; }
  .pro-last small { display: inline-flex; align-items: center; gap: 3px; font-size: 11px; color: ${A.muted}; }
  .pro-chev { color: ${A.muted}; }
  .pro-bar { position: sticky; bottom: 16px; z-index: 40; margin: 14px auto 0; width: fit-content; max-width: 100%; display: flex; align-items: center; flex-wrap: wrap; gap: 8px; padding: 8px 8px 8px 14px; border-radius: 99px; background: ${A.maroon}; box-shadow: 0 18px 40px -16px rgba(42,10,14,.7); }
  .pro-bar-n { color: #f7ece4; font-size: 13px; margin-right: 4px; }
  .pro-bar-n b { color: #f2cf74; }
  .pro-bar .psp-btn { min-height: 38px; }
  .pro-bar .psp-btn:not(.gold) { background: rgba(255,255,255,.1); border-color: rgba(255,255,255,.16); color: #f7ece4; }
  .pro-bar .psp-btn.gold { background: linear-gradient(135deg, #f2cf74, #c9a84c); color: ${A.maroon}; border: none; }
  .pro-bar-x { width: 36px; height: 36px; border-radius: 99px; border: none; background: rgba(255,255,255,.1); color: #f7ece4; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; }
  .pro-bar-hint { flex-basis: 100%; text-align: center; font-size: 11.5px; color: #f2cf74; padding: 0 8px 2px; }
  .pro-toast { position: fixed; left: 50%; transform: translateX(-50%); bottom: 24px; z-index: 210; max-width: calc(100% - 32px); display: flex; gap: 7px; align-items: center; padding: 11px 16px; border-radius: 14px; background: ${A.ink}; color: #fff; font-size: 13px; font-weight: 700; box-shadow: 0 18px 40px -16px rgba(0,0,0,.5); }
  .pro-toast.ok svg { color: #7ee2a8; }
  @media (max-width: 860px) {
    .pro-head { display: none; }
    .pro-row { grid-template-columns: 40px minmax(0, 1fr); }
    .pro-cb { align-items: flex-start; padding-top: 14px; }
    .pro-open { grid-template-columns: auto minmax(0, 1fr) auto; grid-template-areas: "name name chev" "ig st chev" "last last chev"; gap: 5px 10px; padding: 12px 12px 12px 0; }
    .pro-name { grid-area: name; }
    .pro-ig { grid-area: ig; }
    .pro-st { grid-area: st; }
    .pro-last { grid-area: last; flex-direction: row; gap: 8px; font-size: 11.5px; }
    .pro-last::before { content: "Last contacted"; color: ${A.muted}; }
    .pro-chev { grid-area: chev; align-self: center; }
    .pro-bar { position: fixed; left: 12px; right: 12px; bottom: calc(96px + env(safe-area-inset-bottom, 0px)); width: auto; border-radius: 99px; justify-content: space-between; flex-wrap: nowrap; gap: 6px; padding: 6px 6px 6px 14px; }
    .pro-bar .psp-btn { padding: 0 12px; }
    .pro-bar .psp-btn.gold { flex: 1; }
    .pro-bar-hint { position: absolute; bottom: calc(100% + 6px); left: 0; right: 0; background: ${A.maroon}; border-radius: 12px; padding: 6px 10px; }
    .pro-sel-word { display: none; }
    .pro-hide-sm { display: none; }
    .pro-toast { bottom: calc(150px + env(safe-area-inset-bottom, 0px)); }
  }
`;
