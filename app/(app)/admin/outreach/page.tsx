"use client";

// ─── /admin/outreach — one email to a chosen group of creators ───────────────
//
// Three steps, left to right:
//
//   1. Audience — filter everybody (verified email, stars they gave, pages
//      made, activity, payments, last emailed…), tick people by hand or
//      "select all N matching".
//   2. Write    — say what to tell them; the AI writes one common email; edit
//      it; watch the real email render beside it; send yourself a test.
//   3. Send     — the exact recipient list, then a confirmation that names the
//      count, then live progress.
//
// The server owns every rule that matters: it re-runs the filter, drops anyone
// unverified / suspended / opted out, and refuses to send if the count the
// super admin confirmed no longer matches. This screen only asks. See
// server/src/controllers/adminOutreach.controller.ts.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Megaphone, Users, ShieldCheck, Star, Sparkles, Send, Check, ChevronLeft, ChevronRight, X, Mail, History,
  Loader2, RotateCcw, Monitor, Smartphone, AlertTriangle, BellOff, Bell, Wand2, FlaskConical,
  CircleCheck, CircleX, Clock, PenLine, Filter, Link2,
} from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { API_URL } from "@/lib/config";
import { isSuperAdmin } from "@/lib/roles";
import { A, AdminPage, ChipGroup, EmptyState, Hero, HeroStat, Loading, Num, Panel, SearchBox, Tag, fmtNum } from "../adminKit";
import {
  DEFAULT_FILTERS, filtersToQuery, rel,
  type AudienceResponse, type AudienceRow, type Broadcast, type Draft, type Filters, type Length,
  type RecipientList, type Selection, type Tone,
} from "./types";

const STEPS = [
  { key: "audience", label: "Audience", Icon: Users },
  { key: "write", label: "Write", Icon: PenLine },
  { key: "send", label: "Review & send", Icon: Send },
] as const;

/** One-tap starting points. Each is a partial filter over the defaults. */
const SEGMENTS: { key: string; label: string; emoji: string; note: string; f: Partial<Filters> }[] = [
  { key: "all", label: "Everyone", emoji: "🌍", note: "All verified users", f: {} },
  { key: "valentine", label: "Valentine wishlist", emoji: "💘", note: "Joined the Valentine's week wishlist", f: { wishlist: "valentine-2027" } },
  { key: "happy", label: "Happy creators", emoji: "😍", note: "Rated 4–5★", f: { ratings: [4, 5] } },
  { key: "unhappy", label: "Unhappy", emoji: "😟", note: "Rated 1–3★", f: { ratings: [1, 2, 3] } },
  { key: "never", label: "Never created", emoji: "🌱", note: "Signed up, 0 pages", f: { pages: "0" } },
  { key: "drafts", label: "Drafts only", emoji: "📝", note: "Made pages, published none", f: { published: "no" } },
  { key: "power", label: "Power creators", emoji: "🚀", note: "5+ pages", f: { pages: "5+" } },
  { key: "new", label: "New this week", emoji: "✨", note: "Joined in 7 days", f: { joined: "7" } },
  { key: "quiet", label: "Gone quiet", emoji: "🌙", note: "No page in 30+ days", f: { active: "idle30" } },
  { key: "paid", label: "Paying customers", emoji: "💎", note: "Paid at least once", f: { paid: "yes" } },
  { key: "nofeedback", label: "No feedback yet", emoji: "💬", note: "Never rated us", f: { feedback: "none", pages: "1+" } },
];

const BRIEF_IDEAS = [
  "We just launched a new Diwali template — invite everyone to create a page for their family.",
  "Thank our happy creators for the lovely ratings and ask them to share SubhSandesh with one friend.",
  "Apologise to people who had a bad experience, tell them we fixed the slow editor and ask them to give it another try.",
  "Remind people who signed up but never made a page how easy it is — a page takes 2 minutes.",
];

const TONES: { value: Tone; label: string }[] = [
  { value: "warm", label: "💛 Warm" }, { value: "festive", label: "🪔 Festive" }, { value: "excited", label: "🎉 Excited" },
  { value: "professional", label: "💼 Professional" }, { value: "apologetic", label: "🙏 Apologetic" },
];
const LENGTHS: { value: Length; label: string }[] = [{ value: "short", label: "Short" }, { value: "medium", label: "Medium" }, { value: "long", label: "Long" }];

const EMPTY_DRAFT: Draft = { subject: "", body: "", ctaLabel: "", ctaUrl: "" };
const DRAFT_KEY = "ss-outreach-draft";

export default function AdminOutreachPage() {
  const router = useRouter();
  const { user, accessToken, isLoading } = useAppSelector((s) => s.auth);
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    if (isLoading || !user) return;
    if (!isSuperAdmin(user.role)) { router.replace("/admin/analytics"); return; }
    setAllowed(true);
  }, [user, isLoading, router]);

  const hdr = useCallback(() => ({ Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }), [accessToken]);
  const api = useCallback(async <T,>(path: string, init?: RequestInit): Promise<T> => {
    const res = await fetch(`${API_URL}/admin/outreach${path}`, { ...init, headers: hdr() });
    const json = await res.json().catch(() => ({}));
    if (!res.ok || json.success === false) {
      const err = new Error(json.error || `Request failed (${res.status})`) as Error & { code?: string; data?: unknown };
      err.code = json.code; err.data = json;
      throw err;
    }
    return json.data as T;
  }, [hdr]);

  const [toast, setToast] = useState<{ msg: string; tone: "ok" | "err" } | null>(null);
  const say = useCallback((msg: string, tone: "ok" | "err" = "ok") => {
    setToast({ msg, tone });
    setTimeout(() => setToast(null), 3400);
  }, []);

  const [view, setView] = useState<"compose" | "history">("compose");
  const [step, setStep] = useState(0);

  // ── Audience ────────────────────────────────────────────────────────────
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [segment, setSegment] = useState("all");
  const [qInput, setQInput] = useState("");
  const [page, setPage] = useState(1);
  const [aud, setAud] = useState<AudienceResponse | null>(null);
  const [audLoading, setAudLoading] = useState(true);
  const [sel, setSel] = useState<Selection>({ mode: "ids", rows: new Map() });

  useEffect(() => {
    const t = setTimeout(() => setFilters((f) => (f.q === qInput.trim() ? f : { ...f, q: qInput.trim() })), 350);
    return () => clearTimeout(t);
  }, [qInput]);

  const loadAudience = useCallback(async () => {
    if (!allowed || !accessToken) return;
    setAudLoading(true);
    try {
      const q = filtersToQuery(filters);
      q.set("page", String(page)); q.set("limit", "25");
      setAud(await api<AudienceResponse>(`/audience?${q}`));
    } catch (e) {
      say((e as Error).message, "err");
    } finally {
      setAudLoading(false);
    }
  }, [allowed, accessToken, filters, page, api, say]);
  useEffect(() => { void loadAudience(); }, [loadAudience]);

  const setF = (patch: Partial<Filters>) => {
    setFilters((f) => ({ ...f, ...patch }));
    setPage(1);
    setSegment("");
    // "All matching" means THIS filter. Change the filter and it no longer does.
    setSel((s) => (s.mode === "filter" ? { mode: "ids", rows: new Map() } : s));
  };
  // `/admin/outreach?segment=valentine` — the Wishlist tab's "Email them"
  // button lands here with that audience already chosen.
  const linkedSegment = useRef(false);
  useEffect(() => {
    if (linkedSegment.current || !allowed) return;
    linkedSegment.current = true;
    const key = new URLSearchParams(window.location.search).get("segment");
    if (key && key !== "all" && SEGMENTS.some((s) => s.key === key)) applySegmentRef.current(key);
  }, [allowed]);

  const applySegment = (key: string) => {
    const seg = SEGMENTS.find((s) => s.key === key);
    if (!seg) return;
    setFilters({ ...DEFAULT_FILTERS, ...seg.f });
    setQInput("");
    setPage(1);
    setSegment(key);
    setSel({ mode: "ids", rows: new Map() });
  };
  const applySegmentRef = useRef(applySegment);
  applySegmentRef.current = applySegment;

  const selectedCount = sel.mode === "ids" ? sel.rows.size : Math.max(0, (aud?.stats.sendable ?? 0) - sel.exclude.size);
  const isPicked = (r: AudienceRow) => (sel.mode === "ids" ? sel.rows.has(r.userId) : !sel.exclude.has(r.userId) && sendable(r));
  const toggle = (r: AudienceRow) => {
    if (!sendable(r)) return;
    setSel((s) => {
      if (s.mode === "ids") {
        const rows = new Map(s.rows);
        if (rows.has(r.userId)) rows.delete(r.userId); else rows.set(r.userId, r);
        return { mode: "ids", rows };
      }
      const exclude = new Set(s.exclude);
      if (exclude.has(r.userId)) exclude.delete(r.userId); else exclude.add(r.userId);
      return { ...s, exclude };
    });
  };
  const pageRows = aud?.rows ?? [];
  const pageSendable = pageRows.filter(sendable);
  const pageAllPicked = pageSendable.length > 0 && pageSendable.every(isPicked);
  const togglePage = () => {
    setSel((s) => {
      if (s.mode === "filter") {
        const exclude = new Set(s.exclude);
        pageSendable.forEach((r) => (pageAllPicked ? exclude.add(r.userId) : exclude.delete(r.userId)));
        return { ...s, exclude };
      }
      const rows = new Map(s.rows);
      pageSendable.forEach((r) => (pageAllPicked ? rows.delete(r.userId) : rows.set(r.userId, r)));
      return { mode: "ids", rows };
    });
  };
  const selectAllMatching = () => setSel({ mode: "filter", filters, exclude: new Set() });
  const clearSelection = () => setSel({ mode: "ids", rows: new Map() });

  const toggleOptOut = async (r: AudienceRow) => {
    try {
      await api(`/users/${r.userId}/opt-out`, { method: "PATCH", body: JSON.stringify({ optOut: !r.optedOut }) });
      say(r.optedOut ? `${r.email} will receive announcements again` : `${r.email} won't get announcements any more`);
      setSel((s) => {
        if (s.mode !== "ids" || !s.rows.has(r.userId)) return s;
        const rows = new Map(s.rows); rows.delete(r.userId); return { mode: "ids", rows };
      });
      void loadAudience();
    } catch (e) { say((e as Error).message, "err"); }
  };

  const selectionPayload = useCallback(() => (
    sel.mode === "ids"
      ? { mode: "ids", ids: [...sel.rows.keys()] }
      : { mode: "filter", filters: sel.filters, excludeIds: [...sel.exclude] }
  ), [sel]);
  const audienceLabel = sel.mode === "ids" ? `${sel.rows.size} people picked by hand` : aud?.label || "Everyone";

  // ── Writing ─────────────────────────────────────────────────────────────
  const [brief, setBrief] = useState("");
  const [tone, setTone] = useState<Tone>("warm");
  const [length, setLength] = useState<Length>("medium");
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [drafting, setDrafting] = useState(false);
  const [testing, setTesting] = useState(false);

  // The half-written email survives a refresh. Only on this browser.
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
      if (saved?.draft) { setDraft({ ...EMPTY_DRAFT, ...saved.draft }); setBrief(saved.brief || ""); }
    } catch { /* storage blocked */ }
  }, []);
  useEffect(() => {
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify({ draft, brief })); } catch { /* storage blocked */ }
  }, [draft, brief]);

  const generate = async () => {
    if (brief.trim().length < 8) { say("Tell the AI a little more about what to say", "err"); return; }
    setDrafting(true);
    try {
      const d = await api<{ subject: string; body: string; ctaLabel: string }>("/draft", {
        method: "POST",
        body: JSON.stringify({ brief, tone, length, audienceLabel, audienceSize: selectedCount }),
      });
      // A suggested button needs somewhere to go. The gallery is always a real
      // page; the link field stays editable for anything more specific.
      setDraft((prev) => ({
        ...prev,
        subject: d.subject,
        body: d.body,
        ctaLabel: d.ctaLabel || prev.ctaLabel,
        ctaUrl: prev.ctaUrl || (d.ctaLabel ? "https://subhsandesh.in/templates" : ""),
      }));
      say("Email written — read it, tweak anything, then preview");
    } catch (e) { say((e as Error).message, "err"); }
    finally { setDrafting(false); }
  };

  const sendTest = async () => {
    setTesting(true);
    try {
      const r = await api<{ to: string }>("/test", { method: "POST", body: JSON.stringify(draft) });
      say(`Test sent to ${r.to} — check your inbox`);
    } catch (e) { say((e as Error).message, "err"); }
    finally { setTesting(false); }
  };

  const [preview, setPreview] = useState<{ html: string; subject: string; from: string; problem: string | null } | null>(null);
  useEffect(() => {
    if (!allowed || view !== "compose" || step === 0) return;
    if (!draft.subject && !draft.body) { setPreview(null); return; }
    const t = setTimeout(async () => {
      try {
        setPreview(await api("/preview", { method: "POST", body: JSON.stringify({ ...draft, sampleName: user?.name || "Priya" }) }));
      } catch { /* the preview is a nicety */ }
    }, 450);
    return () => clearTimeout(t);
  }, [draft, allowed, step, view, api, user?.name]);

  // ── Review & send ───────────────────────────────────────────────────────
  const [list, setList] = useState<RecipientList | null>(null);
  const [listLoading, setListLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);

  const loadRecipients = useCallback(async () => {
    setListLoading(true);
    try {
      setList(await api<RecipientList>("/recipients", { method: "POST", body: JSON.stringify({ selection: selectionPayload() }) }));
    } catch (e) { say((e as Error).message, "err"); setList(null); }
    finally { setListLoading(false); }
  }, [api, selectionPayload, say]);
  useEffect(() => { if (step === 2 && view === "compose") void loadRecipients(); }, [step, view, loadRecipients]);

  const draftProblem = !draft.subject.trim() ? "Add a subject" : draft.body.trim().length < 30 ? "Write the email (or generate it)" : preview?.problem || null;
  const canNext = step === 0 ? selectedCount > 0 : step === 1 ? !draftProblem : false;

  const doSend = async () => {
    if (!list) return;
    try {
      const r = await api<{ id: string }>("/send", {
        method: "POST",
        body: JSON.stringify({ ...draft, brief, selection: selectionPayload(), expectedCount: list.count }),
      });
      setConfirmOpen(false);
      setSendingId(r.id);
      try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
    } catch (e) {
      const err = e as Error & { code?: string };
      say(err.message, "err");
      if (err.code === "COUNT_CHANGED") { setConfirmOpen(false); void loadRecipients(); }
    }
  };

  const startOver = () => {
    setSendingId(null);
    setStep(0);
    setDraft(EMPTY_DRAFT);
    setBrief("");
    setList(null);
    clearSelection();
    void loadAudience();
  };

  if (!allowed) return <AdminPage title="Outreach"><Loading /></AdminPage>;

  const st = aud?.stats;
  return (
    <AdminPage
      title="Outreach"
      icon={<Megaphone />}
      subtitle={<>Write <b>one email to many creators</b>. Filter your users — verified email, the stars they gave, how many pages they made, when they were last active — pick who it goes to, let the AI write it from a one-line brief, preview the real email, and send. Every email carries the SubhSandesh signature and an unsubscribe line. Unverified, suspended and opted-out people are never emailed, whatever the filter says.</>}
    >
      <style>{OT_CSS}</style>
      <Hero>
        <div className="adk-hero-grid">
          <HeroStat big label="Can receive email" value={st?.sendable ?? 0} sub={`of ${fmtNum(st?.matching ?? 0)} matching`} />
          <HeroStat label="Verified users" value={st?.verifiedUsers ?? 0} sub={`${fmtNum(st?.totalUsers ?? 0)} accounts in all`} />
          <HeroStat label="Avg rating (matching)" value={st?.avgRating != null ? `${st.avgRating}★` : "—"} sub={`${fmtNum(st?.withFeedback ?? 0)} gave feedback`} />
          <HeroStat label="Opted out" value={st?.optedOut ?? 0} sub="never emailed" />
        </div>
      </Hero>

      {aud && !aud.sesConfigured && (
        <div className="ot-warn"><AlertTriangle size={15} /> SES isn&apos;t configured on this server, so tests and sends will be refused. You can still build and preview an email.</div>
      )}

      <div className="ot-topbar">
        <ChipGroup
          id="ot-view"
          value={view}
          onChange={(v) => setView(v)}
          options={[
            { value: "compose", label: <><Mail size={13} /> New email</> },
            { value: "history", label: <><History size={13} /> Sent history</> },
          ]}
        />
        {view === "compose" && !sendingId && <Stepper step={step} onGo={(i) => i < step && setStep(i)} />}
      </div>

      <AnimatePresence mode="wait">
        {view === "history" ? (
          <motion.div key="hist" {...fade}>
            <HistoryView api={api} say={say} />
          </motion.div>
        ) : sendingId ? (
          <motion.div key="prog" {...fade}>
            <ProgressView id={sendingId} api={api} onDone={startOver} />
          </motion.div>
        ) : step === 0 ? (
          <motion.div key="s0" {...fade}>
            {/* Segments */}
            <div className="ot-segs">
              {SEGMENTS.map((s, i) => (
                <motion.button
                  key={s.key}
                  type="button"
                  className="ot-seg"
                  data-on={segment === s.key ? "1" : "0"}
                  onClick={() => applySegment(s.key)}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <span className="ot-seg-emoji">{s.emoji}</span>
                  <span className="ot-seg-t">{s.label}</span>
                  <span className="ot-seg-n">{s.note}</span>
                </motion.button>
              ))}
            </div>

            <div className="ot-aud">
              <FilterPanel filters={filters} setF={setF} aud={aud} onReset={() => applySegment("all")} />

              <Panel
                title="People"
                icon={<Users size={15} color={A.goldDeep} />}
                note={aud ? `${fmtNum(aud.total)} match · ${aud.label}` : undefined}
                right={
                  <select className="ot-select ot-sort" value={`${filters.sort}:${filters.order}`} onChange={(e) => { const [sort, order] = e.target.value.split(":") as [Filters["sort"], Filters["order"]]; setF({ sort, order }); }}>
                    <option value="joined:desc">Newest first</option>
                    <option value="joined:asc">Oldest first</option>
                    <option value="pages:desc">Most pages</option>
                    <option value="rating:desc">Highest rating</option>
                    <option value="rating:asc">Lowest rating</option>
                    <option value="active:desc">Recently active</option>
                    <option value="name:asc">Name A–Z</option>
                  </select>
                }
              >
                <SearchBox value={qInput} onChange={setQInput} placeholder="Search name or email…" style={{ marginBottom: 10 }} />

                <AnimatePresence>
                  {(pageAllPicked || sel.mode === "filter") && aud && aud.stats.sendable > pageSendable.length && (
                    <motion.div className="ot-selbar" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                      {sel.mode === "filter" ? (
                        <>All <b>{fmtNum(selectedCount)}</b> people who can receive email in this filter are selected.
                          <button type="button" onClick={clearSelection}>Clear selection</button></>
                      ) : (
                        <>All {pageSendable.length} on this page are selected.
                          <button type="button" onClick={selectAllMatching}>Select all {fmtNum(aud.stats.sendable)} matching</button></>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {audLoading && !aud ? <Loading h={420} /> : pageRows.length === 0 ? (
                  <EmptyState icon={<Filter size={20} />} title="Nobody matches these filters" note="Loosen a filter or pick another segment." />
                ) : (
                  <div className="ot-table" data-busy={audLoading ? "1" : "0"}>
                    <div className="ot-tr ot-th">
                      <label className="ot-check" title="Select this page">
                        <input type="checkbox" checked={pageAllPicked} onChange={togglePage} disabled={!pageSendable.length} />
                        <span />
                      </label>
                      <span>Person</span><span>Pages</span><span>Feedback</span><span>Activity</span><span />
                    </div>
                    {pageRows.map((r, i) => (
                      <PersonRow key={r.userId} r={r} i={i} picked={isPicked(r)} onToggle={() => toggle(r)} onOptOut={() => toggleOptOut(r)} />
                    ))}
                  </div>
                )}

                {aud && aud.pages > 1 && (
                  <div className="ot-pager">
                    <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}><ChevronLeft size={15} /></button>
                    <span>Page {aud.page} of {aud.pages}</span>
                    <button type="button" disabled={page >= aud.pages} onClick={() => setPage((p) => p + 1)}><ChevronRight size={15} /></button>
                  </div>
                )}
              </Panel>
            </div>
          </motion.div>
        ) : step === 1 ? (
          <motion.div key="s1" {...fade} className="ot-write">
            <div className="ot-col">
              <Panel title="What do you want to tell them?" icon={<Wand2 size={15} color={A.goldDeep} />} note={`${fmtNum(selectedCount)} recipients`}>
                <textarea
                  className="ot-brief"
                  value={brief}
                  onChange={(e) => setBrief(e.target.value)}
                  placeholder="e.g. We launched a Diwali template with diyas and fireworks — invite people to make one for their family before the festival."
                  maxLength={2000}
                />
                <div className="ot-ideas">
                  {BRIEF_IDEAS.map((b) => (
                    <button key={b} type="button" onClick={() => setBrief(b)}>{b.split(" — ")[0].slice(0, 58)}…</button>
                  ))}
                </div>
                <div className="ot-row"><span className="ot-lbl">Tone</span><ChipGroup id="ot-tone" value={tone} onChange={setTone} options={TONES} /></div>
                <div className="ot-row"><span className="ot-lbl">Length</span><ChipGroup id="ot-len" value={length} onChange={setLength} options={LENGTHS} /></div>
                <motion.button type="button" className="ot-gen" onClick={generate} disabled={drafting} whileTap={{ scale: 0.98 }}>
                  <span className="ot-gen-shine" />
                  {drafting ? <><Loader2 size={16} className="ot-spin" /> Writing your email…</> : <><Sparkles size={16} /> {draft.body ? "Write it again" : "Generate email"}</>}
                </motion.button>
              </Panel>

              <Panel title="The email" icon={<PenLine size={15} color={A.goldDeep} />} note="edit anything" delay={0.05}>
                <label className="ot-field">
                  <span>Subject <em>{draft.subject.length}/150</em></span>
                  <input className="adk-input" value={draft.subject} maxLength={150} onChange={(e) => setDraft({ ...draft, subject: e.target.value })} placeholder="Something new for your celebrations" />
                </label>
                <label className="ot-field">
                  <span>Message <em><button type="button" className="ot-merge" onClick={() => setDraft({ ...draft, body: draft.body + "{{firstName}}" })}>+ {"{{firstName}}"}</button></em></span>
                  <textarea className="adk-input ot-body" value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} placeholder={"Hi {{firstName}},\n\n…"} />
                </label>
                <p className="ot-hint"><b>{"{{firstName}}"}</b> becomes each person&apos;s first name (or “there”). The SubhSandesh signature and unsubscribe line are added automatically.</p>
                <div className="ot-cta">
                  <label className="ot-field"><span>Button label <em>optional</em></span>
                    <input className="adk-input" value={draft.ctaLabel} maxLength={40} onChange={(e) => setDraft({ ...draft, ctaLabel: e.target.value })} placeholder="Try it now" /></label>
                  <label className="ot-field"><span><Link2 size={11} /> Button link</span>
                    <input className="adk-input" value={draft.ctaUrl} onChange={(e) => setDraft({ ...draft, ctaUrl: e.target.value })} placeholder="https://subhsandesh.in/templates" /></label>
                </div>
              </Panel>
            </div>

            <div className="ot-col ot-sticky">
              <EmailPreview preview={preview} to={user?.email || "you@example.com"} onTest={sendTest} testing={testing} canTest={!draftProblem} />
            </div>
          </motion.div>
        ) : (
          <motion.div key="s2" {...fade} className="ot-review">
            <div className="ot-col">
              <Panel title="Who receives it" icon={<Users size={15} color={A.goldDeep} />}>
                {listLoading || !list ? <Loading h={260} /> : (
                  <RecipientsBox list={list} />
                )}
              </Panel>
            </div>
            <div className="ot-col">
              <Panel title="What they receive" icon={<Mail size={15} color={A.goldDeep} />} delay={0.05}>
                <div className="ot-sum-subj">{preview?.subject || draft.subject}</div>
                <div className="ot-sum-from">From {preview?.from || "SubhSandesh"}</div>
                <div className="ot-thumb">{preview?.html ? <iframe title="Email" srcDoc={preview.html} sandbox="" /> : <Loading h={200} />}</div>
                <button type="button" className="ot-link" onClick={() => setStep(1)}><PenLine size={12} /> Edit the email</button>
              </Panel>
              <motion.button
                type="button"
                className="ot-send"
                disabled={!list || list.count === 0 || listLoading}
                onClick={() => setConfirmOpen(true)}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Send size={17} /> Send to {list ? fmtNum(list.count) : "…"} {list?.count === 1 ? "person" : "people"}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky footer: where you are, and the way forward. */}
      {view === "compose" && !sendingId && (
        <motion.div className="ot-foot" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <div className="ot-foot-in">
            <div className="ot-foot-count">
              <span className="ot-foot-badge"><Num value={selectedCount} /></span>
              <span>{selectedCount === 1 ? "person" : "people"} selected<small>{audienceLabel}</small></span>
            </div>
            <div className="ot-foot-btns">
              {step > 0 && <button type="button" className="ot-btn" onClick={() => setStep(step - 1)}><ChevronLeft size={15} /> Back</button>}
              {step < 2 ? (
                <button type="button" className="ot-btn" data-v="primary" disabled={!canNext} onClick={() => setStep(step + 1)} title={step === 1 && draftProblem ? draftProblem : undefined}>
                  {step === 0 ? "Next: write the email" : "Next: review & send"} <ChevronRight size={15} />
                </button>
              ) : (
                <button type="button" className="ot-btn" data-v="primary" disabled={!list || list.count === 0 || listLoading} onClick={() => setConfirmOpen(true)}>
                  <Send size={14} /> Send to {list ? fmtNum(list.count) : "…"}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {confirmOpen && list && (
          <ConfirmSend list={list} subject={preview?.subject || draft.subject} onClose={() => setConfirmOpen(false)} onSend={doSend} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && (
          <motion.div className="ot-toast" data-tone={toast.tone} initial={{ opacity: 0, y: 20, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: 20, x: "-50%" }}>
            {toast.tone === "ok" ? <CircleCheck size={16} /> : <AlertTriangle size={16} />} {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </AdminPage>
  );
}

const fade = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] as const },
};

const sendable = (r: AudienceRow) => r.verified && r.status === "active" && !r.optedOut;

// ─── Pieces ──────────────────────────────────────────────────────────────────

function Stepper({ step, onGo }: { step: number; onGo: (i: number) => void }) {
  return (
    <ol className="ot-steps">
      {STEPS.map(({ key, label, Icon }, i) => {
        const state = i < step ? "done" : i === step ? "on" : "todo";
        return (
          <li key={key} data-s={state}>
            <button type="button" onClick={() => onGo(i)} disabled={i >= step}>
              <span className="ot-step-dot">
                {state === "done" ? <Check size={13} /> : <Icon size={13} />}
                {state === "on" && <motion.span layoutId="ot-step-ring" className="ot-step-ring" />}
              </span>
              <span className="ot-step-l">{label}</span>
            </button>
            {i < STEPS.length - 1 && <span className="ot-step-line"><motion.span animate={{ scaleX: i < step ? 1 : 0 }} transition={{ duration: 0.4 }} /></span>}
          </li>
        );
      })}
    </ol>
  );
}

function Stars({ value, size = 12 }: { value: number; size?: number }) {
  return (
    <span className="ot-stars" aria-label={`${value} stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={size} fill={n <= Math.round(value) ? "#e0a82e" : "none"} color={n <= Math.round(value) ? "#e0a82e" : "#d9c8b8"} />
      ))}
    </span>
  );
}

function FilterPanel({ filters, setF, aud, onReset }: { filters: Filters; setF: (p: Partial<Filters>) => void; aud: AudienceResponse | null; onReset: () => void }) {
  const rc = aud?.ratingCounts || {};
  const dirty = JSON.stringify({ ...filters, q: "", sort: "", order: "" }) !== JSON.stringify({ ...DEFAULT_FILTERS, q: "", sort: "", order: "" });
  const toggleStar = (n: number) => setF({ ratings: filters.ratings.includes(n) ? filters.ratings.filter((x) => x !== n) : [...filters.ratings, n].sort() });
  // Phones and tablets: folded by default so the people list is not three screens down.
  const [open, setOpen] = useState(false);
  const active = (Object.keys(DEFAULT_FILTERS) as (keyof Filters)[])
    .filter((k) => !["q", "sort", "order"].includes(k) && JSON.stringify(filters[k]) !== JSON.stringify(DEFAULT_FILTERS[k])).length;
  return (
    <Panel
      title={<>Filters{active > 0 && <span className="ot-fcount">{active}</span>}</>}
      icon={<Filter size={15} color={A.goldDeep} />}
      className="ot-filters"
      right={<>
        {dirty && <button type="button" className="ot-link" style={{ marginTop: 0 }} onClick={onReset}><RotateCcw size={12} /> Reset</button>}
        <button type="button" className="ot-ftoggle" onClick={() => setOpen((v) => !v)} aria-expanded={open}>{open ? "Hide" : "Show"} <ChevronRight size={13} style={{ transform: open ? "rotate(90deg)" : "none", transition: "transform .2s" }} /></button>
      </>}
    >
      <div className="ot-fbody" data-open={open ? "1" : "0"}>
      <FG label="Stars they gave" hint="any of the picked">
        <div className="ot-starpick">
          {[5, 4, 3, 2, 1].map((n) => (
            <motion.button key={n} type="button" data-on={filters.ratings.includes(n) ? "1" : "0"} onClick={() => toggleStar(n)} whileTap={{ scale: 0.92 }}>
              {n}<Star size={12} fill="currentColor" /><small>{rc[n] ?? 0}</small>
            </motion.button>
          ))}
        </div>
      </FG>
      <FG label="Email">
        <ChipGroup id="f-ver" value={filters.verified} onChange={(v) => setF({ verified: v })} options={[{ value: "verified", label: <><ShieldCheck size={12} /> Verified</> }, { value: "all", label: "Everyone" }]} />
      </FG>
      <FG label="Feedback">
        <ChipGroup id="f-fb" value={filters.feedback} onChange={(v) => setF({ feedback: v })} options={[{ value: "any", label: "Any" }, { value: "given", label: "Gave" }, { value: "comment", label: "Wrote a comment" }, { value: "none", label: "None" }]} />
      </FG>
      <FG label="Pages created">
        <ChipGroup id="f-pg" value={filters.pages} onChange={(v) => setF({ pages: v })} options={[{ value: "any", label: "Any" }, { value: "0", label: "0" }, { value: "1", label: "1" }, { value: "1+", label: "1+" }, { value: "2-4", label: "2–4" }, { value: "5+", label: "5+" }]} />
      </FG>
      <FG label="Published">
        <ChipGroup id="f-pub" value={filters.published} onChange={(v) => setF({ published: v })} options={[{ value: "any", label: "Any" }, { value: "yes", label: "Has published" }, { value: "no", label: "Drafts only" }]} />
      </FG>
      <FG label="Template used">
        <select className="ot-select" value={filters.template} onChange={(e) => setF({ template: e.target.value })}>
          <option value="">Any template</option>
          {(aud?.templates || []).map((t) => <option key={t.type} value={t.type}>{t.label} · {t.users}</option>)}
        </select>
      </FG>
      <FG label="Joined">
        <ChipGroup id="f-jn" value={filters.joined} onChange={(v) => setF({ joined: v })} options={[{ value: "any", label: "Any time" }, { value: "7", label: "7d" }, { value: "30", label: "30d" }, { value: "90", label: "90d" }, { value: "365", label: "1y" }]} />
      </FG>
      <FG label="Last created a page">
        <ChipGroup id="f-act" value={filters.active} onChange={(v) => setF({ active: v })} options={[{ value: "any", label: "Any" }, { value: "7", label: "≤7d" }, { value: "30", label: "≤30d" }, { value: "idle30", label: "30d+ ago" }, { value: "idle90", label: "90d+ ago" }]} />
      </FG>
      <FG label="Paid">
        <ChipGroup id="f-paid" value={filters.paid} onChange={(v) => setF({ paid: v })} options={[{ value: "any", label: "Any" }, { value: "yes", label: "Paid" }, { value: "no", label: "Never" }]} />
      </FG>
      <FG label="Sign-in">
        <ChipGroup id="f-prov" value={filters.provider} onChange={(v) => setF({ provider: v })} options={[{ value: "any", label: "Any" }, { value: "google", label: "Google" }, { value: "local", label: "Email" }]} />
      </FG>
      <FG label="Wishlist">
        <ChipGroup id="f-wish" value={filters.wishlist} onChange={(v) => setF({ wishlist: v })} options={[{ value: "any", label: "Any" }, { value: "valentine-2027", label: "💘 Valentine" }, { value: "none", label: "Not joined" }]} />
      </FG>
      <FG label="Last emailed by us">
        <ChipGroup id="f-em" value={filters.emailed} onChange={(v) => setF({ emailed: v })} options={[{ value: "any", label: "Any" }, { value: "not14", label: "Not in 14d" }, { value: "not30", label: "Not in 30d" }, { value: "never", label: "Never" }]} />
      </FG>
      <FG label="Unsubscribed">
        <ChipGroup id="f-opt" value={filters.optout} onChange={(v) => setF({ optout: v })} options={[{ value: "hide", label: "Hide" }, { value: "only", label: <><BellOff size={12} /> Show only</> }]} />
      </FG>
      </div>
    </Panel>
  );
}

function FG({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="ot-fg">
      <div className="ot-fg-l">{label}{hint && <em>{hint}</em>}</div>
      {children}
    </div>
  );
}

function PersonRow({ r, i, picked, onToggle, onOptOut }: { r: AudienceRow; i: number; picked: boolean; onToggle: () => void; onOptOut: () => void }) {
  const ok = sendable(r);
  const why = r.optedOut ? "Unsubscribed" : !r.verified ? "Email not verified" : r.status !== "active" ? `Account ${r.status}` : "";
  return (
    <motion.div
      className="ot-tr"
      data-on={picked ? "1" : "0"}
      data-off={ok ? "0" : "1"}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(i, 12) * 0.02 }}
      onClick={onToggle}
    >
      <label className="ot-check" onClick={(e) => e.stopPropagation()} title={why || "Select"}>
        <input type="checkbox" checked={picked} disabled={!ok} onChange={onToggle} />
        <span />
      </label>
      <div className="ot-person">
        <span className="ot-av" style={{ background: avatarTone(r.email) }}>{(r.name || r.email)[0]?.toUpperCase()}</span>
        <div style={{ minWidth: 0 }}>
          <div className="ot-name">{r.name || "—"} {r.paidOrders > 0 && <Tag tone={A.info}>💎 Paid</Tag>} {r.wishlists?.length > 0 && <Tag tone="#b3243f">💘 Wishlist</Tag>}</div>
          <div className="ot-email">
            {r.verified ? <ShieldCheck size={12} color={A.ok} /> : <AlertTriangle size={12} color={A.warn} />}
            <span>{r.email}</span>
          </div>
          {why && <div className="ot-why">{why}</div>}
        </div>
      </div>
      <div className="ot-cell">
        <b>{r.pages}</b> <span className="ot-sub">{r.published} live</span>
        {r.templates.length > 0 && <div className="ot-tpls">{r.templates.slice(0, 2).map((t) => <span key={t.type}>{t.label}</span>)}{r.templates.length > 2 && <span>+{r.templates.length - 2}</span>}</div>}
      </div>
      <div className="ot-cell">
        {r.avgRating != null ? (<><Stars value={r.avgRating} /> <span className="ot-sub">{r.avgRating} · {r.feedbackCount}×</span></>) : <span className="ot-sub">No feedback</span>}
        {r.commentCount > 0 && <div className="ot-sub">💬 {r.commentCount} comment{r.commentCount > 1 ? "s" : ""}</div>}
      </div>
      <div className="ot-cell ot-sub">
        <div><Clock size={11} /> {r.lastPageAt ? `made a page ${rel(r.lastPageAt)}` : "never made a page"}</div>
        <div>joined {rel(r.joinedAt)}{r.lastEmailedAt && <> · <Mail size={10} /> {rel(r.lastEmailedAt)}</>}</div>
      </div>
      <button type="button" className="ot-icon" onClick={(e) => { e.stopPropagation(); onOptOut(); }} title={r.optedOut ? "Allow announcements again" : "Unsubscribe from announcements"}>
        {r.optedOut ? <Bell size={14} /> : <BellOff size={14} />}
      </button>
    </motion.div>
  );
}

function avatarTone(s: string) {
  const tones = ["#8b5a2b", "#a0522d", "#5a1520", "#6d4ad1", "#1e7a4b", "#b7791f", "#9d174d", "#0e7490"];
  let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return tones[h % tones.length];
}

function EmailPreview({ preview, to, onTest, testing, canTest }: { preview: { html: string; subject: string; from: string; problem: string | null } | null; to: string; onTest: () => void; testing: boolean; canTest: boolean }) {
  const [device, setDevice] = useState<"desktop" | "phone">("desktop");
  return (
    <Panel
      title="Live preview"
      icon={<Mail size={15} color={A.goldDeep} />}
      note="exactly what is sent"
      right={
        <ChipGroup id="ot-dev" value={device} onChange={setDevice} options={[{ value: "desktop", label: <Monitor size={13} /> }, { value: "phone", label: <Smartphone size={13} /> }]} />
      }
    >
      <div className="ot-mail">
        <div className="ot-mail-h">
          <div className="ot-mail-subj">{preview?.subject || "Your subject line"}</div>
          <div className="ot-mail-meta"><span className="ot-av" style={{ background: A.maroon, width: 26, height: 26, fontSize: 11 }}>S</span>
            <div><b>{preview?.from || "SubhSandesh"}</b><div>to {to}</div></div></div>
        </div>
        <motion.div className="ot-mail-body" animate={{ maxWidth: device === "phone" ? 380 : 900 }} transition={{ type: "spring", stiffness: 260, damping: 30 }}>
          {preview?.html ? <iframe title="Email preview" srcDoc={preview.html} sandbox="" /> : (
            <div className="ot-mail-empty"><Sparkles size={22} /><p>Generate or write the email and it appears here, signature and all.</p></div>
          )}
        </motion.div>
      </div>
      {preview?.problem && <div className="ot-problem"><AlertTriangle size={13} /> {preview.problem}</div>}
      <button type="button" className="ot-btn ot-test" onClick={onTest} disabled={!canTest || testing}>
        {testing ? <Loader2 size={14} className="ot-spin" /> : <FlaskConical size={14} />} Send a test to {to}
      </button>
    </Panel>
  );
}

function RecipientsBox({ list }: { list: RecipientList }) {
  const [q, setQ] = useState("");
  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return (s ? list.recipients.filter((r) => r.email.includes(s) || r.name.toLowerCase().includes(s)) : list.recipients).slice(0, 300);
  }, [q, list]);
  const skipped = list.skipped.unverified + list.skipped.inactive + list.skipped.optedOut + list.skipped.duplicate;
  return (
    <>
      <div className="ot-rc-head">
        <div className="ot-rc-big"><Num value={list.count} /><span>{list.count === 1 ? "person" : "people"}</span></div>
        <div className="ot-rc-label">{list.label}</div>
      </div>
      {skipped > 0 && (
        <div className="ot-skipped">
          <AlertTriangle size={13} /> {skipped} left out automatically:
          {list.skipped.unverified > 0 && <Tag tone={A.warn}>{list.skipped.unverified} unverified</Tag>}
          {list.skipped.optedOut > 0 && <Tag tone={A.soft}>{list.skipped.optedOut} unsubscribed</Tag>}
          {list.skipped.inactive > 0 && <Tag tone={A.danger}>{list.skipped.inactive} suspended</Tag>}
          {list.skipped.duplicate > 0 && <Tag tone={A.soft}>{list.skipped.duplicate} duplicate</Tag>}
        </div>
      )}
      <SearchBox value={q} onChange={setQ} placeholder="Find a recipient…" style={{ margin: "10px 0 8px" }} />
      <div className="ot-rc-list">
        {shown.map((r) => (
          <div key={r.userId} className="ot-rc"><span className="ot-av" style={{ background: avatarTone(r.email), width: 24, height: 24, fontSize: 10.5 }}>{(r.name || r.email)[0]?.toUpperCase()}</span>
            <span className="ot-rc-n">{r.name || "—"}</span><span className="ot-rc-e">{r.email}</span></div>
        ))}
        {list.recipients.length > shown.length && !q && <div className="ot-rc-more">+ {fmtNum(list.recipients.length - shown.length)} more — search to find anyone</div>}
      </div>
    </>
  );
}

function ConfirmSend({ list, subject, onClose, onSend }: { list: RecipientList; subject: string; onClose: () => void; onSend: () => Promise<void> }) {
  const [ack, setAck] = useState(false);
  const [busy, setBusy] = useState(false);
  const go = async () => { setBusy(true); await onSend(); setBusy(false); };
  return (
    <motion.div className="ot-modal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div className="ot-modal-card" initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 10 }} transition={{ type: "spring", stiffness: 320, damping: 28 }} onClick={(e) => e.stopPropagation()}>
        <button type="button" className="ot-modal-x" onClick={onClose} aria-label="Close"><X size={16} /></button>
        <div className="ot-modal-ic"><Send size={22} /></div>
        <h3>Send this email to {fmtNum(list.count)} {list.count === 1 ? "person" : "people"}?</h3>
        <p className="ot-modal-sub">“{subject}”</p>
        <div className="ot-modal-list">
          {list.recipients.slice(0, 60).map((r) => <span key={r.userId}>{r.email}</span>)}
          {list.count > 60 && <span className="ot-modal-more">and {fmtNum(list.count - 60)} more</span>}
        </div>
        <label className="ot-ack">
          <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} />
          <span>I&apos;ve read the email and checked who it goes to. This can&apos;t be undone.</span>
        </label>
        <div className="ot-modal-btns">
          <button type="button" className="ot-btn" onClick={onClose}>Cancel</button>
          <button type="button" className="ot-btn" data-v="send" disabled={!ack || busy} onClick={go}>
            {busy ? <Loader2 size={15} className="ot-spin" /> : <Send size={15} />} Yes, send to {fmtNum(list.count)}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

type Api = <T>(path: string, init?: RequestInit) => Promise<T>;

function ProgressView({ id, api, onDone }: { id: string; api: Api; onDone: () => void }) {
  const [b, setB] = useState<Broadcast | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const d = await api<Broadcast>(`/broadcasts/${id}`);
        if (!alive) return;
        setB(d);
        if (d.status === "sending") timer.current = setTimeout(tick, 1200);
      } catch { if (alive) timer.current = setTimeout(tick, 2500); }
    };
    void tick();
    return () => { alive = false; if (timer.current) clearTimeout(timer.current); };
  }, [id, api]);

  const done = b && b.status !== "sending";
  const pct = b ? Math.round(((b.sentCount + b.failedCount) / Math.max(1, b.total)) * 100) : 0;
  const R = 58, C = 2 * Math.PI * R;
  return (
    <Panel style={{ textAlign: "center", padding: "34px 18px" }}>
      <div className="ot-ring">
        <svg viewBox="0 0 140 140" width="150" height="150">
          <circle cx="70" cy="70" r={R} fill="none" stroke="rgba(61,12,17,.08)" strokeWidth="10" />
          <motion.circle cx="70" cy="70" r={R} fill="none" stroke="url(#otg)" strokeWidth="10" strokeLinecap="round" strokeDasharray={C} animate={{ strokeDashoffset: C * (1 - pct / 100) }} transition={{ duration: 0.6 }} transform="rotate(-90 70 70)" />
          <defs><linearGradient id="otg" x1="0" x2="1"><stop offset="0" stopColor="#3d0c11" /><stop offset="1" stopColor="#c9a84c" /></linearGradient></defs>
        </svg>
        <div className="ot-ring-c">
          <AnimatePresence mode="wait">
            {done ? (
              <motion.span key="d" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300, damping: 14 }}>
                {b?.status === "sent" ? <CircleCheck size={44} color={A.ok} /> : <AlertTriangle size={40} color={A.warn} />}
              </motion.span>
            ) : <motion.b key="p">{pct}%</motion.b>}
          </AnimatePresence>
        </div>
      </div>
      <h3 className="ot-prog-t">{!b ? "Starting…" : b.status === "sending" ? "Sending your email…" : b.status === "sent" ? "All sent! 🎉" : b.status === "partial" ? "Sent, with a few failures" : b.status === "interrupted" ? "Interrupted" : "Sending failed"}</h3>
      {b && (
        <div className="ot-prog-n">
          <span><CircleCheck size={14} color={A.ok} /> <Num value={b.sentCount} /> sent</span>
          {b.failedCount > 0 && <span><CircleX size={14} color={A.danger} /> {b.failedCount} failed</span>}
          <span><Users size={14} /> {b.total} total</span>
        </div>
      )}
      {b && <p className="ot-prog-s">“{b.subject}” · {b.audienceLabel}</p>}
      {b?.status === "sending" && <p className="ot-prog-s">You can leave this page — sending continues on the server.</p>}
      {done && <button type="button" className="ot-btn" data-v="primary" onClick={onDone} style={{ marginTop: 14 }}><Mail size={14} /> Write another email</button>}
    </Panel>
  );
}

function HistoryView({ api, say }: { api: Api; say: (m: string, t?: "ok" | "err") => void }) {
  const [rows, setRows] = useState<Broadcast[] | null>(null);
  const [detail, setDetail] = useState<Broadcast | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [reload, setReload] = useState(0);
  useEffect(() => {
    let alive = true;
    api<Broadcast[]>("/broadcasts")
      .then((d) => {
        if (!alive) return;
        setRows(d);
        // Open the most recent broadcast by default, so History shows a result
        // straight away instead of a column of closed rows.
        setOpenId((cur) => cur ?? d[0]?._id ?? null);
      })
      .catch((e) => { if (alive) { say((e as Error).message, "err"); setRows([]); } });
    return () => { alive = false; };
  }, [api, say, reload]);
  useEffect(() => {
    if (!openId) return;
    let alive = true;
    api<Broadcast>(`/broadcasts/${openId}`).then((d) => alive && setDetail(d)).catch((e) => say((e as Error).message, "err"));
    return () => { alive = false; };
  }, [openId, api, say]);
  // Only the detail that belongs to the open row — a stale one never flashes.
  const open = detail && detail._id === openId ? detail : null;
  const resume = async (id: string) => {
    try { await api(`/broadcasts/${id}/resume`, { method: "POST" }); say("Resumed — sending the rest"); setOpenId(null); setReload((n) => n + 1); }
    catch (e) { say((e as Error).message, "err"); }
  };

  if (!rows) return <Loading h={300} />;
  if (!rows.length) return <EmptyState icon={<History size={20} />} title="No emails sent yet" note="Your broadcasts will appear here with who got them." />;
  const tone = { sent: A.ok, partial: A.warn, failed: A.danger, interrupted: A.warn, sending: A.info } as const;
  return (
    <div className="ot-hist">
      {rows.map((b, i) => (
        <motion.div key={b._id} className="ot-h" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
          <button type="button" className="ot-h-top" onClick={() => setOpenId(openId === b._id ? null : b._id)}>
            <span className="ot-h-ic"><Mail size={15} /></span>
            <div className="ot-h-main">
              <div className="ot-h-subj">{b.subject}</div>
              <div className="ot-h-meta">{new Date(b.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })} · {b.audienceLabel} · by {b.createdByEmail}</div>
            </div>
            <div className="ot-h-right">
              <Tag tone={tone[b.status]} solid={b.status === "sent"}>{b.status}</Tag>
              <span className="ot-h-n"><b>{b.sentCount}</b>/{b.total}</span>
            </div>
          </button>
          <AnimatePresence initial={false}>
            {openId === b._id && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
                {!open ? <Loading h={120} /> : (
                  <div className="ot-h-body">
                    {open.brief && <div className="ot-h-brief"><Wand2 size={12} /> Brief: {open.brief}</div>}
                    <pre className="ot-h-text">{open.body}</pre>
                    {open.status === "interrupted" && (
                      <button type="button" className="ot-btn" data-v="primary" onClick={() => resume(open._id)}><RotateCcw size={14} /> Resume — send to {open.pending} remaining</button>
                    )}
                    <div className="ot-h-recips">
                      {(open.recipients || []).map((r) => (
                        <div key={r.userId + r.email} className="ot-h-r" data-s={r.status} title={r.error || ""}>
                          {r.status === "sent" ? <CircleCheck size={12} /> : r.status === "failed" ? <CircleX size={12} /> : <Clock size={12} />}
                          <span>{r.email}</span>{r.error && <em>{r.error}</em>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const OT_CSS = `
.ot-warn { display:flex; align-items:center; gap:8px; margin:0 0 12px; padding:10px 12px; border-radius:12px; font-size:12.5px; font-weight:600;
  color:#7a4a0c; background:#fff5df; border:1px solid #f0d9a4; }
.ot-topbar { display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; margin-bottom:12px; }
.ot-topbar .adk-chip { display:inline-flex; align-items:center; }

.ot-steps { display:flex; align-items:center; gap:0; list-style:none; margin:0; padding:0; }
.ot-steps li { display:flex; align-items:center; }
.ot-steps button { display:flex; align-items:center; gap:7px; border:0; background:none; padding:4px 6px; cursor:pointer; font:inherit; }
.ot-steps button:disabled { cursor:default; }
.ot-step-dot { position:relative; width:28px; height:28px; border-radius:50%; display:grid; place-items:center; flex:none;
  background:#fff; color:${A.muted}; border:1.5px solid rgba(61,12,17,.14); transition:all .3s; }
.ot-steps li[data-s="on"] .ot-step-dot { background:${A.maroon}; color:#ffe3a3; border-color:${A.maroon}; }
.ot-steps li[data-s="done"] .ot-step-dot { background:linear-gradient(135deg,#ffe3a3,#c9a84c); color:${A.maroon}; border-color:transparent; }
.ot-step-ring { position:absolute; inset:-5px; border-radius:50%; border:2px solid rgba(201,168,76,.55); }
.ot-step-l { font-size:12px; font-weight:800; color:${A.muted}; white-space:nowrap; }
.ot-steps li[data-s="on"] .ot-step-l, .ot-steps li[data-s="done"] .ot-step-l { color:${A.ink}; }
.ot-step-line { width:34px; height:2px; background:rgba(61,12,17,.1); border-radius:2px; overflow:hidden; margin:0 2px; }
.ot-step-line span { display:block; height:100%; background:${A.gold}; transform-origin:left; }
@media (max-width:640px){ .ot-step-l{ display:none; } .ot-step-line{ width:22px; } }

.ot-segs { display:grid; grid-auto-flow:column; grid-auto-columns:minmax(138px,1fr); gap:8px; overflow-x:auto; scrollbar-width:none; padding:2px 2px 10px; margin-bottom:4px; }
.ot-segs::-webkit-scrollbar { display:none; }
.ot-seg { position:relative; text-align:left; display:flex; flex-direction:column; gap:2px; padding:11px 12px; border-radius:14px; cursor:pointer; font:inherit;
  background:${A.card}; border:1px solid ${A.edge}; transition:border-color .2s, box-shadow .2s, background .2s; }
.ot-seg:hover { box-shadow:0 10px 22px -16px rgba(61,12,17,.5); }
.ot-seg[data-on="1"] { background:linear-gradient(135deg,#4a0f16,#2a070b); border-color:transparent; box-shadow:0 12px 26px -14px rgba(61,12,17,.8); }
.ot-seg-emoji { font-size:20px; line-height:1; margin-bottom:4px; }
.ot-seg-t { font-size:12.5px; font-weight:800; color:${A.ink}; }
.ot-seg-n { font-size:10.5px; color:${A.muted}; font-weight:600; }
.ot-seg[data-on="1"] .ot-seg-t { color:#fff3dc; } .ot-seg[data-on="1"] .ot-seg-n { color:rgba(255,227,163,.8); }

.ot-aud { display:grid; grid-template-columns:1fr; gap:12px; align-items:start; }
@media (min-width:1080px){ .ot-aud { grid-template-columns:300px minmax(0,1fr); } .ot-filters { position:sticky; top:132px; max-height:calc(100vh - 150px); overflow:auto; scrollbar-width:thin; } }
.ot-fcount { display:inline-grid; place-items:center; min-width:18px; height:18px; padding:0 5px; margin-left:6px; border-radius:99px; background:${A.maroon}; color:#ffe3a3; font-size:10px; vertical-align:1px; }
.ot-ftoggle { display:none; align-items:center; gap:2px; border:1px solid ${A.edge}; background:#fff; border-radius:9px; height:28px; padding:0 9px; font:inherit; font-size:11.5px; font-weight:800; color:${A.ink}; cursor:pointer; }
@media (max-width:1079px){ .ot-ftoggle { display:inline-flex; } .ot-fbody[data-open="0"] { display:none; } .ot-filters .adk-panel-head { margin-bottom:0; } .ot-fbody[data-open="1"] { margin-top:10px; } }
.ot-fg { padding:9px 0; border-top:1px dashed rgba(61,12,17,.08); }
.ot-fg:first-of-type { border-top:0; padding-top:0; }
.ot-fg-l { font-size:10px; font-weight:800; letter-spacing:.08em; text-transform:uppercase; color:${A.muted}; margin-bottom:6px; display:flex; gap:6px; align-items:baseline; }
.ot-fg-l em { text-transform:none; letter-spacing:0; font-weight:600; font-style:normal; opacity:.8; }
.ot-filters .adk-chips { flex-wrap:wrap; overflow:visible; }
.ot-filters .adk-chip { height:28px; padding:0 10px; font-size:11.5px; }
.ot-starpick { display:flex; gap:5px; flex-wrap:wrap; }
.ot-starpick button { display:inline-flex; align-items:center; gap:3px; height:30px; padding:0 9px; border-radius:10px; cursor:pointer; font:inherit; font-size:12.5px; font-weight:800;
  background:#fff; border:1px solid ${A.edge}; color:#b8860b; transition:all .2s; }
.ot-starpick button small { font-size:10px; font-weight:700; color:${A.muted}; margin-left:2px; }
.ot-starpick button[data-on="1"] { background:linear-gradient(135deg,#ffe3a3,#e0a82e); color:${A.maroon}; border-color:transparent; box-shadow:0 6px 14px -8px rgba(224,168,46,.9); }
.ot-starpick button[data-on="1"] small { color:${A.maroon}; }
.ot-select { width:100%; height:32px; border-radius:10px; border:1px solid ${A.edge}; background:#fff; padding:0 8px; font:inherit; font-size:12px; color:${A.ink}; }
.ot-sort { width:auto; height:28px; font-size:11.5px; font-weight:700; }

.ot-selbar { overflow:hidden; display:flex; align-items:center; justify-content:center; flex-wrap:wrap; gap:6px; font-size:12.5px; color:${A.ink};
  background:linear-gradient(90deg,#fff6e0,#fdf0d2); border:1px solid #f0d9a4; border-radius:11px; padding:8px 10px; margin-bottom:8px; }
.ot-selbar button { border:0; background:none; color:${A.maroon}; font-weight:800; cursor:pointer; text-decoration:underline; font:inherit; font-size:12.5px; }

.ot-table { display:flex; flex-direction:column; gap:4px; transition:opacity .2s; }
.ot-table[data-busy="1"] { opacity:.55; }
.ot-tr { display:grid; grid-template-columns:28px minmax(0,2.2fr) minmax(0,1.2fr) minmax(0,1.2fr) minmax(0,1.3fr) 30px; gap:10px; align-items:center;
  padding:9px 10px; border-radius:12px; background:rgba(255,255,255,.6); border:1px solid transparent; cursor:pointer; transition:background .2s, border-color .2s, box-shadow .2s; }
.ot-tr:hover { background:#fff; box-shadow:0 6px 16px -12px rgba(61,12,17,.4); }
.ot-tr[data-on="1"] { background:#fffaf0; border-color:rgba(201,168,76,.55); }
.ot-tr[data-off="1"] { opacity:.55; cursor:default; }
.ot-th { background:none !important; box-shadow:none !important; cursor:default; font-size:10px; font-weight:800; letter-spacing:.08em; text-transform:uppercase; color:${A.muted}; padding-top:2px; padding-bottom:2px; }
.ot-check { position:relative; width:20px; height:20px; display:inline-block; cursor:pointer; }
.ot-check input { position:absolute; opacity:0; inset:0; margin:0; cursor:pointer; }
.ot-check span { position:absolute; inset:0; border-radius:6px; border:1.6px solid rgba(61,12,17,.25); background:#fff; transition:all .15s; }
.ot-check input:checked + span { background:${A.maroon}; border-color:${A.maroon}; }
.ot-check input:checked + span::after { content:""; position:absolute; left:6px; top:2px; width:5px; height:10px; border:solid #ffe3a3; border-width:0 2px 2px 0; transform:rotate(45deg); }
.ot-check input:disabled + span { background:#f3ece6; border-style:dashed; }
.ot-person { display:flex; align-items:center; gap:9px; min-width:0; }
.ot-av { width:32px; height:32px; flex:none; border-radius:50%; display:grid; place-items:center; color:#fff; font-weight:800; font-size:13px; }
.ot-name { font-size:13px; font-weight:800; color:${A.ink}; display:flex; align-items:center; gap:6px; min-width:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.ot-email { display:flex; align-items:center; gap:4px; font-size:11.5px; color:${A.soft}; min-width:0; }
.ot-email span { overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.ot-why { font-size:10.5px; color:${A.warn}; font-weight:700; }
.ot-cell { font-size:12px; color:${A.ink}; min-width:0; }
.ot-cell b { font-size:14px; font-family:'Playfair Display',serif; }
.ot-sub { font-size:11px; color:${A.muted}; display:inline-flex; align-items:center; gap:3px; }
.ot-cell.ot-sub { display:block; } .ot-cell.ot-sub > div { display:flex; align-items:center; gap:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.ot-tpls { display:flex; gap:3px; flex-wrap:wrap; margin-top:3px; }
.ot-tpls span { font-size:9.5px; font-weight:700; padding:2px 6px; border-radius:6px; background:rgba(139,90,43,.09); color:${A.goldDeep}; white-space:nowrap; max-width:110px; overflow:hidden; text-overflow:ellipsis; }
.ot-stars { display:inline-flex; gap:1px; vertical-align:-2px; }
.ot-icon { width:28px; height:28px; border-radius:8px; display:grid; place-items:center; border:1px solid ${A.edge}; background:#fff; color:${A.muted}; cursor:pointer; transition:all .2s; }
.ot-icon:hover { color:${A.maroon}; border-color:${A.gold}; }
@media (max-width:760px){
  .ot-th { display:none; }
  .ot-tr { grid-template-columns:24px minmax(0,1fr) 28px; grid-template-areas:"c p o" ". a a" ". b b" ". d d"; row-gap:4px; }
  .ot-tr > .ot-check { grid-area:c; } .ot-tr > .ot-person { grid-area:p; } .ot-tr > .ot-icon { grid-area:o; }
  /* nth-of-type counts divs, and .ot-person is the first div — so the cells are 2, 3 and 4. */
  .ot-tr > .ot-cell:nth-of-type(2) { grid-area:a; } .ot-tr > .ot-cell:nth-of-type(3) { grid-area:b; } .ot-tr > .ot-cell:nth-of-type(4) { grid-area:d; }
  .ot-tr > .ot-cell { display:flex; flex-wrap:wrap; align-items:center; gap:4px 8px; }
  .ot-tr > .ot-cell .ot-tpls { margin-top:0; }
}
.ot-pager { display:flex; align-items:center; justify-content:center; gap:12px; margin-top:12px; font-size:12px; font-weight:700; color:${A.soft}; }
.ot-pager button { width:32px; height:32px; border-radius:10px; border:1px solid ${A.edge}; background:#fff; display:grid; place-items:center; cursor:pointer; color:${A.ink}; }
.ot-pager button:disabled { opacity:.4; cursor:default; }

.ot-write, .ot-review { display:grid; grid-template-columns:1fr; gap:12px; align-items:start; }
@media (min-width:1080px){ .ot-write { grid-template-columns:minmax(0,1fr) minmax(0,1.05fr); } .ot-review { grid-template-columns:minmax(0,1fr) minmax(0,1fr); } .ot-sticky { position:sticky; top:132px; } }
.ot-col { display:flex; flex-direction:column; gap:12px; min-width:0; }
.ot-brief { width:100%; min-height:110px; resize:vertical; border-radius:14px; border:1.5px solid rgba(201,168,76,.45); background:linear-gradient(180deg,#fffdf8,#fff);
  padding:12px 13px; font:inherit; font-size:13.5px; line-height:1.55; color:${A.ink}; outline:none; transition:box-shadow .2s, border-color .2s; }
.ot-brief:focus { border-color:${A.gold}; box-shadow:0 0 0 4px rgba(201,168,76,.16); }
.ot-ideas { display:flex; gap:6px; flex-wrap:wrap; margin:8px 0 4px; }
.ot-ideas button { border:1px dashed rgba(139,90,43,.35); background:rgba(255,255,255,.7); color:${A.goldDeep}; font:inherit; font-size:11px; font-weight:700; padding:5px 9px; border-radius:99px; cursor:pointer; transition:all .2s; }
.ot-ideas button:hover { background:#fff6e0; border-style:solid; }
.ot-row { display:flex; align-items:center; gap:10px; margin-top:10px; min-width:0; }
.ot-row .adk-chips { flex-wrap:wrap; overflow:visible; }
.ot-row .adk-chip { height:30px; padding:0 11px; }
.ot-lbl { font-size:10px; font-weight:800; letter-spacing:.08em; text-transform:uppercase; color:${A.muted}; width:52px; flex:none; }
.ot-gen { position:relative; overflow:hidden; width:100%; margin-top:14px; height:46px; border:0; border-radius:13px; cursor:pointer; font:inherit; font-size:14px; font-weight:800;
  display:flex; align-items:center; justify-content:center; gap:8px; color:#fff6e6; background:linear-gradient(120deg,#5a1520,#3d0c11 45%,#6b1a22); box-shadow:0 14px 28px -16px rgba(61,12,17,.9); }
.ot-gen:disabled { cursor:progress; }
.ot-gen svg { color:#ffe3a3; }
.ot-gen-shine { position:absolute; top:-20px; bottom:-20px; width:70px; background:linear-gradient(90deg,transparent,rgba(255,227,163,.35),transparent); animation:adk-shine 2.6s ease-in-out infinite; }
.ot-field { display:flex; flex-direction:column; gap:5px; margin-bottom:10px; min-width:0; }
.ot-field > span { display:flex; align-items:center; gap:4px; justify-content:space-between; font-size:10px; font-weight:800; letter-spacing:.08em; text-transform:uppercase; color:${A.muted}; }
.ot-field em { font-style:normal; letter-spacing:0; text-transform:none; font-weight:600; }
.ot-body { min-height:220px; resize:vertical; line-height:1.6; font-family:inherit; }
.ot-merge { border:1px solid rgba(201,168,76,.5); background:#fff8e6; color:${A.goldDeep}; border-radius:7px; font:inherit; font-size:10.5px; font-weight:800; padding:2px 7px; cursor:pointer; }
.ot-hint { margin:-2px 0 10px; font-size:11px; color:${A.muted}; line-height:1.5; }
.ot-cta { display:grid; grid-template-columns:minmax(0,.8fr) minmax(0,1.2fr); gap:8px; }

.ot-mail { border-radius:14px; overflow:hidden; border:1px solid ${A.edge}; background:#fff; box-shadow:0 18px 36px -26px rgba(61,12,17,.55); }
.ot-mail-h { padding:12px 14px; border-bottom:1px solid #f1e8df; background:#fffdfb; }
.ot-mail-subj { font-size:15px; font-weight:800; color:${A.ink}; margin-bottom:8px; }
.ot-mail-meta { display:flex; align-items:center; gap:8px; font-size:11.5px; color:${A.soft}; }
.ot-mail-meta b { color:${A.ink}; font-size:12px; }
.ot-mail-body { margin:0 auto; background:#f5ede6; }
.ot-mail-body iframe { display:block; width:100%; height:620px; border:0; background:#f5ede6; }
.ot-mail-empty { height:360px; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; color:${A.muted}; text-align:center; padding:20px; font-size:12.5px; }
.ot-mail-empty svg { color:${A.gold}; }
.ot-problem { display:flex; align-items:center; gap:6px; margin-top:10px; padding:8px 10px; border-radius:10px; background:#fff1f0; color:${A.danger}; font-size:12px; font-weight:700; }
.ot-test { width:100%; margin-top:10px; justify-content:center; }

.ot-btn { display:inline-flex; align-items:center; gap:6px; height:38px; padding:0 14px; border-radius:11px; border:1px solid ${A.edge}; background:#fff; color:${A.ink};
  font:inherit; font-size:12.5px; font-weight:800; cursor:pointer; transition:transform .15s, box-shadow .2s, opacity .2s; white-space:nowrap; }
.ot-btn:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 8px 18px -12px rgba(61,12,17,.5); }
.ot-btn:disabled { opacity:.45; cursor:default; }
.ot-btn[data-v="primary"] { border:0; color:#fff6e6; background:linear-gradient(135deg,#5a1520,#3d0c11); }
.ot-btn[data-v="send"] { border:0; color:${A.maroon}; background:linear-gradient(135deg,#ffe3a3,#c9a84c); }
.ot-link { display:inline-flex; align-items:center; gap:4px; border:0; background:none; color:${A.goldDeep}; font:inherit; font-size:11.5px; font-weight:800; cursor:pointer; padding:0; margin-top:8px; }

.ot-rc-head { display:flex; align-items:flex-end; gap:12px; flex-wrap:wrap; }
.ot-rc-big { display:flex; align-items:baseline; gap:6px; }
.ot-rc-big > span:first-child { font-family:'Playfair Display',serif; font-size:44px; font-weight:800; color:${A.maroon}; line-height:1; }
.ot-rc-big > span:last-child { font-size:13px; font-weight:700; color:${A.soft}; }
.ot-rc-label { font-size:12px; color:${A.muted}; font-weight:600; padding-bottom:6px; }
.ot-skipped { display:flex; align-items:center; gap:6px; flex-wrap:wrap; margin-top:10px; font-size:11.5px; color:${A.soft}; font-weight:600; }
.ot-rc-list { max-height:420px; overflow:auto; display:flex; flex-direction:column; gap:2px; scrollbar-width:thin; }
.ot-rc { display:grid; grid-template-columns:24px minmax(0,.8fr) minmax(0,1.2fr); gap:8px; align-items:center; padding:6px 8px; border-radius:9px; font-size:12px; }
.ot-rc:nth-child(odd) { background:rgba(255,255,255,.6); }
.ot-rc-n { font-weight:700; color:${A.ink}; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.ot-rc-e { color:${A.soft}; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.ot-rc-more { text-align:center; font-size:11.5px; color:${A.muted}; padding:8px; }
.ot-sum-subj { font-size:16px; font-weight:800; color:${A.ink}; }
.ot-sum-from { font-size:11.5px; color:${A.muted}; margin:3px 0 10px; }
.ot-thumb { border-radius:12px; overflow:hidden; border:1px solid ${A.edge}; height:300px; background:#f5ede6; }
.ot-thumb iframe { width:100%; height:100%; border:0; }
.ot-send { width:100%; height:56px; border:0; border-radius:16px; cursor:pointer; font:inherit; font-size:15.5px; font-weight:800; display:flex; align-items:center; justify-content:center; gap:9px;
  color:${A.maroon}; background:linear-gradient(120deg,#ffe8b0,#c9a84c 60%,#e8c26a); box-shadow:0 18px 34px -18px rgba(139,90,43,.9); }
.ot-send:disabled { opacity:.5; cursor:default; }

.ot-foot { position:fixed; left:0; right:0; bottom:0; z-index:40; padding:0 12px 12px; pointer-events:none; }
@media (max-width:767px){ .ot-foot { bottom:78px; } }
.ot-foot-in { pointer-events:auto; max-width:1232px; margin:0 auto; display:flex; align-items:center; justify-content:space-between; gap:10px; padding:10px 12px 10px 14px; border-radius:16px;
  background:rgba(42,10,14,.94); backdrop-filter:blur(10px); color:#fff3dc; box-shadow:0 20px 40px -18px rgba(0,0,0,.6); border:1px solid rgba(255,227,163,.15); }
.ot-foot-count { display:flex; align-items:center; gap:10px; min-width:0; font-size:13px; font-weight:700; }
.ot-foot-count small { display:block; font-size:10.5px; font-weight:600; color:rgba(255,227,163,.7); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:42vw; }
.ot-foot-badge { min-width:40px; height:32px; padding:0 8px; border-radius:10px; display:grid; place-items:center; font-family:'Playfair Display',serif; font-size:17px; font-weight:800;
  background:linear-gradient(135deg,#ffe3a3,#c9a84c); color:${A.maroon}; }
.ot-foot-btns { display:flex; gap:6px; flex:none; }
.ot-foot .ot-btn { background:rgba(255,255,255,.08); color:#fff3dc; border-color:rgba(255,227,163,.2); }
.ot-foot .ot-btn[data-v="primary"] { background:linear-gradient(135deg,#ffe3a3,#c9a84c); color:${A.maroon}; border:0; }
@media (max-width:560px){ .ot-foot .ot-btn[data-v="primary"] { font-size:0; gap:0; padding:0 12px; } .ot-foot .ot-btn[data-v="primary"] svg { width:18px; height:18px; } }

.ot-modal { position:fixed; inset:0; z-index:100; background:rgba(26,6,9,.55); backdrop-filter:blur(4px); display:grid; place-items:center; padding:16px; }
.ot-modal-card { position:relative; width:min(520px,100%); max-height:90vh; overflow:auto; background:#fffdfb; border-radius:22px; padding:26px 22px 20px; text-align:center;
  box-shadow:0 40px 80px -30px rgba(0,0,0,.6); border:1px solid rgba(201,168,76,.3); }
.ot-modal-x { position:absolute; right:12px; top:12px; width:32px; height:32px; border-radius:50%; border:0; background:rgba(61,12,17,.06); cursor:pointer; display:grid; place-items:center; color:${A.soft}; }
.ot-modal-ic { width:56px; height:56px; border-radius:18px; margin:0 auto 12px; display:grid; place-items:center; color:${A.maroon}; background:linear-gradient(135deg,#ffe3a3,#c9a84c); box-shadow:0 12px 24px -12px rgba(139,90,43,.9); }
.ot-modal-card h3 { margin:0; font-family:'Playfair Display',serif; font-size:21px; color:${A.ink}; }
.ot-modal-sub { margin:6px 0 14px; font-size:13px; color:${A.soft}; font-style:italic; }
.ot-modal-list { display:flex; flex-wrap:wrap; gap:4px; justify-content:center; max-height:150px; overflow:auto; padding:10px; border-radius:12px; background:#f8f1ea; text-align:left; }
.ot-modal-list span { font-size:11px; padding:3px 8px; border-radius:99px; background:#fff; border:1px solid ${A.edge}; color:${A.soft}; }
.ot-modal-list .ot-modal-more { background:${A.maroon}; color:#ffe3a3; border:0; font-weight:800; }
.ot-ack { display:flex; gap:9px; align-items:flex-start; text-align:left; margin:14px 2px; font-size:12.5px; color:${A.ink}; cursor:pointer; }
.ot-ack input { margin-top:2px; accent-color:${A.maroon}; width:16px; height:16px; flex:none; }
.ot-modal-btns { display:flex; gap:8px; justify-content:flex-end; flex-wrap:wrap; }

.ot-ring { position:relative; width:150px; height:150px; margin:0 auto; }
.ot-ring-c { position:absolute; inset:0; display:grid; place-items:center; }
.ot-ring-c b { font-family:'Playfair Display',serif; font-size:32px; color:${A.maroon}; }
.ot-prog-t { margin:14px 0 6px; font-family:'Playfair Display',serif; font-size:22px; color:${A.ink}; }
.ot-prog-n { display:flex; justify-content:center; gap:16px; flex-wrap:wrap; font-size:13px; font-weight:700; color:${A.soft}; }
.ot-prog-n span { display:inline-flex; align-items:center; gap:5px; }
.ot-prog-s { margin:8px 0 0; font-size:12px; color:${A.muted}; }

.ot-hist { display:flex; flex-direction:column; gap:8px; }
.ot-h { background:${A.card}; border:1px solid ${A.edge}; border-radius:14px; overflow:hidden; }
.ot-h-top { width:100%; display:flex; align-items:center; gap:10px; padding:12px 14px; border:0; background:none; cursor:pointer; font:inherit; text-align:left; }
.ot-h-ic { width:34px; height:34px; border-radius:11px; display:grid; place-items:center; flex:none; color:${A.maroon}; background:linear-gradient(135deg,#fff3d6,#f3dfae); }
.ot-h-main { flex:1; min-width:0; }
.ot-h-subj { font-size:13.5px; font-weight:800; color:${A.ink}; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.ot-h-meta { font-size:11px; color:${A.muted}; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.ot-h-right { display:flex; align-items:center; gap:10px; flex:none; }
.ot-h-n { font-size:12px; color:${A.soft}; } .ot-h-n b { color:${A.ink}; font-size:14px; }
.ot-h-body { padding:0 14px 14px; }
.ot-h-brief { font-size:11.5px; color:${A.goldDeep}; font-weight:700; margin-bottom:8px; display:flex; gap:5px; }
.ot-h-text { white-space:pre-wrap; font:inherit; font-size:12.5px; line-height:1.6; color:${A.ink}; background:#fff; border:1px solid ${A.edge}; border-radius:10px; padding:10px 12px; margin:0 0 10px; max-height:260px; overflow:auto; }
.ot-h-recips { display:flex; flex-wrap:wrap; gap:4px; margin-top:10px; max-height:200px; overflow:auto; }
.ot-h-r { display:inline-flex; align-items:center; gap:4px; font-size:11px; padding:3px 8px; border-radius:99px; background:#fff; border:1px solid ${A.edge}; color:${A.soft}; }
.ot-h-r[data-s="sent"] svg { color:${A.ok}; } .ot-h-r[data-s="failed"] { border-color:rgba(179,38,30,.3); color:${A.danger}; } .ot-h-r em { font-style:normal; opacity:.8; }

.ot-toast { position:fixed; left:50%; bottom:96px; z-index:120; display:flex; align-items:center; gap:8px; max-width:min(560px,92vw); padding:11px 16px; border-radius:14px;
  font-size:13px; font-weight:700; color:#fff3dc; background:#2a0a0e; box-shadow:0 18px 40px -16px rgba(0,0,0,.6); }
.ot-toast[data-tone="err"] { background:#7a1a14; }
@media (max-width:767px){ .ot-toast { bottom:170px; } }
.ot-spin { animation:spin 1s linear infinite; }
`;
