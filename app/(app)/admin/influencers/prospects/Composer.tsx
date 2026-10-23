"use client";

// ─── Generate → review → send ───────────────────────────────────────────────
//
// Opened from the selection bar (or a conversation). One selected → the AI
// writes an email for them from what you typed about them; several → one
// template with {{firstName}} / {{instagram}}, rendered per person at send
// time. Nothing is sent from here without pressing Send.
//
// WHAT KIND OF EMAIL. One intent per send — First email, Follow-up (same
// thread, "Re:"), New email (fresh subject) or Reply. A mixed selection is
// planned by the server: the picker shows how many each intent reaches, and
// everyone not included is listed with the reason. Nobody is skipped silently.
//
// CONNECT ONLY. Every first email is a personal Connect note: a hello asking
// to connect — nothing about SubhSandesh, no numbers, no links, no screenshot
// (those are saved for after they reply). The server enforces it, so there is
// no style or Pitch picker. A follow-up to a Connect note stays a hello; the
// Reply, once they answer, gives the full context.
//
// TWO DRAFTS. Generate writes two angles (A / B); switch between them, or
// Regenerate for a fresh pair.
//
// The right-hand side is the server's own verdict, refreshed as you type: the
// Spam and Promotions risk scores (with what raises them, and "Make it more
// personal" to rewrite it lower), the Inbox check, the spam check that gates
// Send, and the exact email one chosen recipient will receive — From
// "Suyash <suyash@subhsandesh.in>" as the server reports it.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, BarChart3, CheckCircle2, Clock, Eye, Gauge, ImageIcon, Inbox, Info, Loader2, MessageCircleQuestion, Send, ShieldCheck, Sparkles, Users, Wand2, XCircle } from "lucide-react";
import { A } from "../../adminKit";
import { KIND_LABEL, SOURCE_LABEL, Sheet, ago, api, senderLine, when, type DeployStatus, type FirstTouch, type JobKind, type OutreachStyle, type Proof } from "./shared";

interface Lint {
  ok: boolean;
  errors: { code: string; message: string }[];
  warnings: { code: string; message: string }[];
  words: number;
  links: string[];
}

interface EligibleRow {
  id: string;
  name: string;
  kind: JobKind;
  hasNote?: boolean;
  sentCount?: number;
  lastSentAt?: string | null;
  sentDates?: string[];
  recent?: string;
  notInterested?: boolean;
}

type RiskLevel = "low" | "medium" | "high";
interface Deliverability {
  spam: number;
  promotions: number;
  spamLevel: RiskLevel;
  promotionsLevel: RiskLevel;
  factors: { id: string; affects: "spam" | "promotions" | "both"; points: number; label: string; fix: string }[];
  good: string[];
}

interface Preview {
  to?: { id: string; name: string; email: string };
  kind?: JobKind;
  /** The style this recipient actually gets (a follow-up keeps the thread's). */
  style?: OutreachStyle;
  /** Connect (a hello) or pitch — what this recipient's email is held to. */
  touch?: FirstTouch;
  /** A reply to someone who answered a Connect note. */
  afterConnect?: boolean;
  /** The signature exactly as appended. */
  signature?: string;
  /** The From header exactly as it will appear. */
  from?: string;
  replyTo?: string;
  subject?: string;
  threaded?: boolean;
  text?: string;
  html?: string;
  headers?: string[];
  lint: Lint | null;
  /** The screenshot that goes inline (personal + "attach"): shown in the preview exactly as sent. */
  image?: { url: string; alt: string; source: string; mime: string } | null;
  proof?: { id: string; allowedNumbers?: string[]; attach: boolean } | null;
  inboxCheck?: { ok: boolean; label: string; warn?: boolean }[];
  /** Spam / Promotions risk for this recipient's email, 0–100. */
  deliverability?: Deliverability;
  personalBlocked?: string;
  eligible: EligibleRow[];
  skipped: { id: string; name: string; reason: string }[];
  intent?: JobKind | null;
  reach?: Record<JobKind, number>;
  needsConfirm?: { id: string; name: string }[];
}

interface Draft {
  subject: string;
  body: string;
  reading: string;
  angle?: "a" | "b";
  subjectFallback?: boolean;
}

const LEVEL_LABEL: Record<RiskLevel, string> = { low: "Low", medium: "Medium", high: "High" };

/**
 * "Show our numbers" / "Attach the screenshot", remembered per kind of email.
 * Defaults: numbers in the text for every email; the image off for a first
 * email (images nudge Gmail toward Promotions) and on for later ones and
 * replies. A Connect note never carries either (forced off, not remembered).
 */
type ProofGroup = "first" | "later" | "reply";
type ProofPrefs = Record<ProofGroup, { numbers: boolean; image: boolean }>;
const PREFS_KEY = "psp-proof-prefs";
const DEFAULT_PREFS: ProofPrefs = { first: { numbers: true, image: false }, later: { numbers: true, image: true }, reply: { numbers: true, image: true } };
function readPrefs(): ProofPrefs {
  try {
    const raw = JSON.parse(window.localStorage.getItem(PREFS_KEY) || "null");
    if (raw && raw.first && raw.later) {
      return { first: { ...DEFAULT_PREFS.first, ...raw.first }, later: { ...DEFAULT_PREFS.later, ...raw.later }, reply: { ...DEFAULT_PREFS.reply, ...(raw.reply || {}) } };
    }
  } catch { /* private window, blocked storage: defaults */ }
  return DEFAULT_PREFS;
}
function savePrefs(p: ProofPrefs) {
  try { window.localStorage.setItem(PREFS_KEY, JSON.stringify(p)); } catch { /* not remembered, still works */ }
}
const INTENTS: JobKind[] = ["initial", "followup", "fresh", "reply"];

function istWindow(status: DeployStatus | null): string {
  const w = status?.sendWindow;
  if (!w) return "";
  const pad = (h: number) => `${String(h).padStart(2, "0")}:00`;
  return ` · ${pad(w.startHour)}–${pad(w.endHour)}${w.tzOffsetMinutes === 330 ? " IST" : ""}`;
}

export default function Composer({
  open,
  onClose,
  token,
  ids,
  status,
  onQueued,
  initialIntent,
  initialAllowNotInterested,
}: {
  open: boolean;
  onClose: () => void;
  token: string;
  ids: string[];
  status: DeployStatus | null;
  onQueued: (message: string) => void;
  /** Pre-picked intent (from a conversation's "Follow-up" / "New email" button). */
  initialIntent?: JobKind | null;
  /** The admin already confirmed sending to someone marked not interested. */
  initialAllowNotInterested?: boolean;
}) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [reading, setReading] = useState("");
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [draftIdx, setDraftIdx] = useState(0);
  const [aiBody, setAiBody] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<"gen" | "send" | "improve" | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [previewFor, setPreviewFor] = useState<string>("");
  const [checking, setChecking] = useState(false);
  const [mobileTab, setMobileTab] = useState<"write" | "preview">("write");
  // First emails are always personal Connect notes (the server enforces it).
  const style: OutreachStyle = "personal";
  const touch: FirstTouch = "connect";
  const [intent, setIntent] = useState<JobKind | null>(initialIntent || null);
  const [allowNI, setAllowNI] = useState<boolean>(!!initialAllowNotInterested);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const idsKey = ids.join(",");
  const [proofs, setProofs] = useState<Proof[] | null>(null);
  const [proofId, setProofId] = useState<string>("");
  const [prefs, setPrefs] = useState<ProofPrefs>(() => (typeof window === "undefined" ? DEFAULT_PREFS : readPrefs()));

  // Confirmed traction screenshots; the default one is preselected.
  useEffect(() => {
    if (!open || !token) return;
    let live = true;
    api<{ data: { proofs: Proof[] } }>(token, "/prospects/proofs").then((r) => {
      if (!live) return;
      const list = r.ok ? r.data.data.proofs.filter((p) => p.active && p.quotable.length > 0) : [];
      setProofs(list);
      setProofId((cur) => cur || (list.find((p) => p.isDefault) || list[0])?.id || "");
    });
    return () => { live = false; };
  }, [open, token]);

  const kind: JobKind | null = preview?.intent || preview?.kind || intent || null;
  const eligible = useMemo(() => preview?.eligible || [], [preview]);
  const many = eligible.length > 1 || (ids.length > 1 && !preview);
  const subjectLocked = kind === "followup" || kind === "reply";
  // Anything after the first email keeps the style its conversation started in.
  const styleLocked = kind !== null && kind !== "initial";
  const effectiveStyle: OutreachStyle = (styleLocked && preview?.style) || style;
  const personal = effectiveStyle === "personal";
  const group: ProofGroup = !kind || kind === "initial" ? "first" : kind === "reply" ? "reply" : "later";
  // Connect: the first email (as picked) or a follow-up to one (as the server says).
  const effectiveTouch: FirstTouch = kind === "initial" ? (personal ? touch : "pitch") : preview?.touch || "pitch";
  const connect = personal && effectiveTouch === "connect" && (kind === "initial" || kind === "followup" || !kind);
  const proof = proofs?.find((p) => p.id === proofId) || null;
  const numbersOn = !connect && !!proof && prefs[group].numbers;
  const imageOn = numbersOn && personal && prefs[group].image;
  const proofBody = numbersOn ? { useNumbers: true, proofId: proof!.id, attachImage: imageOn } : {};

  const applyDraft = useCallback((d: Draft) => {
    setSubject(d.subject || "");
    setBody(d.body);
    setReading(d.reading || "");
    setAiBody(d.body);
  }, []);

  const generate = useCallback(async (o: { asStyle?: OutreachStyle; asIntent?: JobKind | null; asNumbers?: boolean; asTouch?: FirstTouch } = {}) => {
    setBusy("gen");
    setErr(null);
    const wantIntent = o.asIntent === undefined ? intent : o.asIntent;
    const wantTouch = o.asTouch || touch;
    const wantNumbers = wantTouch === "connect" && (!wantIntent || wantIntent === "initial") ? false : o.asNumbers === undefined ? numbersOn : o.asNumbers && !!proof;
    const r = await api<{ data: Draft & { alternatives?: Draft[]; intent?: JobKind } }>(token, "/prospects/draft", {
      body: { ids, note: note.trim() || undefined, style: o.asStyle || style, touch: wantTouch, intent: wantIntent || undefined, allowNotInterested: allowNI || undefined, ...(wantNumbers ? { useNumbers: true, proofId: proof!.id } : {}) },
    });
    setBusy(null);
    if (!r.ok) {
      setErr(r.data.error || "Could not generate a draft");
      return;
    }
    const d = r.data.data;
    const alts = d.alternatives?.length ? d.alternatives : [d];
    setDrafts(alts);
    setDraftIdx(0);
    applyDraft(alts[0]);
    if (d.intent && !wantIntent) setIntent(d.intent);
    setMobileTab("write");
  }, [token, ids, note, style, touch, intent, allowNI, applyDraft, numbersOn, proof]);

  // "Make it more personal": the server rewrites with the prospect model and
  // only hands it back when it passes the spam check and scores lower.
  const improve = useCallback(async () => {
    setBusy("improve");
    setErr(null);
    setNotice(null);
    const r = await api<{ data: { improved: boolean; subject: string; body: string; before: Deliverability; after: Deliverability; reason?: string } }>(token, "/prospects/improve", {
      body: { ids, prospectId: previewFor || undefined, subject, body, style, touch, intent: intent || undefined, allowNotInterested: allowNI || undefined, ...proofBody },
    });
    setBusy(null);
    if (!r.ok) {
      setErr(r.data.error || "Could not rewrite the email");
      return;
    }
    const d = r.data.data;
    if (!d.improved) {
      setNotice(d.reason || "Already as personal as it gets.");
      return;
    }
    if (!subjectLocked) setSubject(d.subject);
    setBody(d.body);
    setAiBody(d.body);
    setReading(`Rewritten to read more personal — spam ${d.before.spam}% → ${d.after.spam}%, Promotions ${d.before.promotions}% → ${d.after.promotions}%`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, ids, previewFor, subject, body, intent, allowNI, numbersOn, imageOn, proofId]);

  function setPref(k: "numbers" | "image", v: boolean) {
    const next = { ...prefs, [group]: { ...prefs[group], [k]: v } };
    setPrefs(next);
    savePrefs(next);
    // The numbers line is written by the AI; switching it needs a new draft.
    if (k === "numbers" && status?.aiConfigured && busy === null) void generate({ asNumbers: v });
  }

  function chooseIntent(next: JobKind) {
    if (next === kind || busy !== null) return;
    setIntent(next);
    setPreviewFor("");
    setDrafts([]);
    if (next === "followup" || next === "reply") setSubject("");
    if (status?.aiConfigured) void generate({ asIntent: next });
  }

  function chooseDraft(i: number) {
    if (!drafts[i]) return;
    setDraftIdx(i);
    applyDraft(drafts[i]);
  }

  // The page remounts this per opening (`key`), so state starts empty. Draft
  // straight away — pressing Generate in the list is the request for one.
  const started = useRef(false);
  useEffect(() => {
    if (!open || started.current || !status?.aiConfigured || proofs === null) return;
    started.current = true;
    const t = setTimeout(() => void generate(), 0);
    return () => clearTimeout(t);
  }, [open, status?.aiConfigured, generate, proofs]);

  // The server's verdict, debounced.
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(async () => {
      setChecking(true);
      const r = await api<{ data: Preview }>(token, "/prospects/preview", {
        body: { ids, prospectId: previewFor || undefined, subject, body, style, touch, intent: intent || undefined, allowNotInterested: allowNI || undefined, ...proofBody },
      });
      setChecking(false);
      if (r.ok) setPreview(r.data.data);
    }, 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, idsKey, subject, body, previewFor, token, style, touch, intent, allowNI, numbersOn, imageOn, proofId]);

  function insert(field: string) {
    const el = bodyRef.current;
    const at = el ? el.selectionStart : body.length;
    const next = body.slice(0, at) + field + body.slice(el ? el.selectionEnd : body.length);
    setBody(next);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(at + field.length, at + field.length);
    });
  }

  async function send() {
    setBusy("send");
    setErr(null);
    const r = await api<{ message: string; data: { queued: string[]; already: string[]; skipped: unknown[]; finishEstimate: string | null }; lint?: Lint; for?: string }>(token, "/prospects/send", {
      body: { ids: eligible.map((e) => e.id), intent: kind || undefined, subject, body, style, touch, aiAssisted: aiBody !== null, allowNotInterested: allowNI || undefined, ...proofBody },
    });
    setBusy(null);
    if (!r.ok) {
      setErr(r.data.for ? `${r.data.error} (for ${r.data.for})` : r.data.error || "Not sent");
      return;
    }
    const d = r.data.data;
    const extra = d.already.length ? ` · ${d.already.length} already in the queue` : "";
    const eta = d.finishEstimate && d.queued.length > 1 && !status?.instant ? ` · last one goes out ~${when(d.finishEstimate)}` : "";
    const held = (d as { personalBlocked?: string }).personalBlocked ? " · held: SES doesn't allow this sender yet" : "";
    onQueued(`${r.data.message}${extra}${eta}${held}`);
    onClose();
  }

  const lint = preview?.lint;
  const blocked = !lint || !lint.ok;
  const canSend = status?.sendMode !== "off" && eligible.length > 0 && !blocked && !!body.trim() && (subjectLocked || !!subject.trim()) && busy === null && !checking;
  const edited = aiBody !== null && aiBody !== body;

  const title = useMemo(() => {
    if (!preview && busy === "gen") return "Writing…";
    const k = kind ? KIND_LABEL[kind] : "Email";
    if (eligible.length === 1) return `${k} to ${eligible[0].name}`;
    return `${k} · template for ${eligible.length || ids.length} people`;
  }, [preview, busy, kind, eligible, ids.length]);

  const gapMin = status ? Math.max(1, Math.round(status.minGapSeconds / 60)) : 2;
  const gapMax = status?.maxGapSeconds ? Math.max(gapMin, Math.round(status.maxGapSeconds / 60)) : gapMin;
  const gapText = gapMax > gapMin ? `${gapMin}–${gapMax} min` : `${gapMin} min`;
  const blockedMsg = personal ? preview?.personalBlocked || status?.personal?.blocked?.message || "" : "";
  const noNote = eligible.filter((e) => e.hasNote === false).length;
  const writer = status?.personal?.writer ?? "";
  const signatureText = (preview?.signature || (connect ? status?.personal?.connectSignature : status?.personal?.signature) || writer || "").replace(/\n/g, " / ");
  const fromLine =
    preview?.from ||
    (personal
      ? connect && status?.personal?.connectFromName
        ? `${status.personal.connectFromName} <${status.personal.fromAddress}>`
        : senderLine(status)
      : `${status?.fromName} <${status?.fromAddress}>`);
  const reach = preview?.reach;
  const intentOptions = INTENTS.filter((k) => (reach ? reach[k] > 0 || k === kind : k === kind));
  const one = eligible.length === 1 ? eligible[0] : null;
  const recentOnes = eligible.filter((e) => e.recent);
  const bulkAbove = status?.bulkWarnAbove ?? 10;
  const perDay = status?.recommendedPerDay ?? 15;
  const needsConfirm = preview?.needsConfirm || [];
  const excluded = (preview?.skipped || []).filter((s) => !(allowNI && needsConfirm.some((n) => n.id === s.id)));

  return (
    <Sheet
      open={open}
      onClose={onClose}
      wide
      title={<>{many ? <Users size={16} color={A.goldDeep} /> : <Sparkles size={16} color={A.goldDeep} />} {title}</>}
      footer={
        <>
          <span className="cmp-foot-note">
            <span className="cmp-tip"><MessageCircleQuestion size={12} /> One easy question — a reply moves future emails to Primary.</span>
            <span><Info size={12} /> {status?.instant ? <>Goes out the moment you press Send (max {status.dailyCap}/day)</> : <>Queued, then sent one at a time (every {gapText}{istWindow(status)}, max {status?.dailyCap ?? 30}/day)</>}{status?.sendMode === "stub" ? " · dev stub: nothing is delivered" : ""}</span>
          </span>
          <button type="button" className="psp-btn" onClick={onClose}>Cancel</button>
          <button type="button" className="psp-btn primary" disabled={!canSend} onClick={() => void send()} title={blocked && lint ? lint.errors[0]?.message : undefined}>
            {busy === "send" ? <Loader2 size={15} className="psp-spin" /> : <Send size={15} />}
            {eligible.length > 1 ? `${status?.instant ? "Send" : "Queue"} ${eligible.length} emails` : one ? `Send to ${one.name.split(" ")[0]}` : "Send"}
          </button>
        </>
      }
    >
      <div className="cmp-mtabs" role="tablist">
        <button type="button" data-on={mobileTab === "write" ? "1" : "0"} onClick={() => setMobileTab("write")}>Write</button>
        <button type="button" data-on={mobileTab === "preview" ? "1" : "0"} onClick={() => setMobileTab("preview")}>
          Preview {lint && (lint.ok ? <CheckCircle2 size={12} color={A.ok} /> : <AlertTriangle size={12} color={A.danger} />)}
          {preview?.deliverability && <i className={`cmp-mscore ${worst(preview.deliverability)}`}>{Math.max(preview.deliverability.spam, preview.deliverability.promotions)}%</i>}
        </button>
      </div>

      <div className="cmp">
        <section className="cmp-left" data-show={mobileTab === "write" ? "1" : "0"}>
          {intentOptions.length > 0 && (
            <div className="cmp-intent" role="radiogroup" aria-label="What kind of email">
              {intentOptions.map((k) => (
                <button key={k} type="button" role="radio" aria-checked={kind === k} data-on={kind === k ? "1" : "0"} disabled={busy !== null} onClick={() => chooseIntent(k)}>
                  {KIND_LABEL[k]}{many && reach ? <i>{reach[k]}</i> : null}
                </button>
              ))}
            </div>
          )}
          {connect && (
            <p className="cmp-banner cmp-hint cmp-connect">
              <MessageCircleQuestion size={13} />
              <span>
                {kind === "followup" ? <><b>Follow-up to a Connect note</b> — still just a hello, in the same thread. </> : <><b>Connect</b> — a short hello from {writer || "you"}: a line about their content, that you&apos;d love to connect, one easy question. </>}
                From <b>{fromLine}</b>, signed “{signatureText}”.
              </span>
            </p>
          )}
          {connect && (
            <p className="cmp-proof cmp-proof-off"><BarChart3 size={13} /> <span><b>Numbers &amp; screenshot: off.</b> Saved for after they reply.</span></p>
          )}
          {kind === "reply" && preview?.afterConnect && (
            <p className="cmp-banner cmp-hint">
              <Sparkles size={13} />
              <span>They answered your Connect note — this reply is the first time they hear what SubhSandesh is: it answers them, then who you are, what we make, why it fits them, the numbers and the paid reel idea.</span>
            </p>
          )}
          {!connect && proofs && proofs.length > 0 && (
            <div className="cmp-proof">
              <label className="cmp-switch">
                <input type="checkbox" checked={numbersOn} onChange={(e) => setPref("numbers", e.target.checked)} disabled={busy !== null} />
                <span><BarChart3 size={13} /> <b>Show our numbers</b></span>
              </label>
              {numbersOn && (
                <>
                  {proofs.length > 1 ? (
                    <select value={proofId} onChange={(e) => setProofId(e.target.value)} aria-label="Which numbers">
                      {proofs.map((p) => <option key={p.id} value={p.id}>{SOURCE_LABEL[p.source]} · {p.periodLabel} · {p.quotable.join(", ")}</option>)}
                    </select>
                  ) : (
                    <span className="cmp-proof-what">{SOURCE_LABEL[proof!.source]} · {proof!.periodLabel} · {proof!.quotable.join(", ")}</span>
                  )}
                  {personal && (
                    <label className="cmp-switch">
                      <input type="checkbox" checked={imageOn} onChange={(e) => setPref("image", e.target.checked)} />
                      <span><ImageIcon size={13} /> Attach the screenshot</span>
                    </label>
                  )}
                  <small className="cmp-proof-hint">
                    {imageOn
                      ? group === "first"
                        ? "Images can nudge Gmail toward Promotions — the numbers in the text alone are safest for a first email."
                        : "Shown inline, the way you'd paste a screenshot into Gmail."
                      : "One honest line with the confirmed numbers; only these numbers pass the spam check."}
                  </small>
                </>
              )}
            </div>
          )}
          {blockedMsg && (
            <p className="cmp-error cmp-blocked"><XCircle size={13} /> <span>{blockedMsg}</span></p>
          )}

          {one && (one.sentCount || 0) > 0 && (
            <p className={`cmp-banner ${one.recent ? "cmp-warn" : "cmp-neutral"}`}>
              <Clock size={13} />
              <span>
                Already sent <b>{one.sentCount} email{one.sentCount === 1 ? "" : "s"}</b> to {one.name.split(" ")[0]}
                {one.sentDates?.length ? ` — ${one.sentDates.map((d) => when(d)).join(", ")}` : one.lastSentAt ? ` — last ${ago(one.lastSentAt)}` : ""}.
                {one.recent ? <> <b>{one.recent}</b></> : null}
              </span>
            </p>
          )}
          {!one && recentOnes.length > 0 && (
            <p className="cmp-banner cmp-warn">
              <Clock size={13} />
              <span><b>{recentOnes.length} of these</b> got an email in the last {status?.recentHours ?? 48}h ({recentOnes.slice(0, 4).map((e) => e.name.split(" ")[0]).join(", ")}{recentOnes.length > 4 ? "…" : ""}). Waiting reads better — but you can send.</span>
            </p>
          )}
          {eligible.length > bulkAbove && (
            <p className="cmp-banner cmp-warn">
              <AlertTriangle size={13} />
              <span>Sending to <b>{eligible.length} people at once.</b> For a young sending domain, about {perDay} a day keeps it in good standing — consider sending the rest tomorrow.</span>
            </p>
          )}
          {needsConfirm.length > 0 && (
            <label className="cmp-banner cmp-warn cmp-confirm">
              <input type="checkbox" checked={allowNI} onChange={(e) => setAllowNI(e.target.checked)} />
              <span>
                {needsConfirm.length === 1 ? `${needsConfirm[0].name} said` : `${needsConfirm.length} of these said`} they&apos;re <b>not interested</b>. Include them anyway — only if they asked to hear more.
              </span>
            </label>
          )}
          {personal && kind === "initial" && eligible.length > 1 && (
            <p className="cmp-banner cmp-hint">
              <Sparkles size={13} />
              <span>
                Most personal: generate for <b>one creator at a time</b> — the AI writes a line from your note about them.
                {noNote > 0 ? ` ${noNote} of these ${eligible.length} have no note yet; add one line each (what you liked about their page).` : ""}
              </span>
            </p>
          )}
          {eligible.length > 1 && (
            <p className="cmp-banner">
              <Users size={13} /> <span>One template, sent separately to each person — <code>{"{{firstName}}"}</code> and <code>{"{{instagram}}"}</code> are filled in for each. Nobody sees anyone else.</span>
            </p>
          )}
          {kind === "initial" && one && (
            <p className="cmp-banner">
              <Sparkles size={13} />
              <span>
                Written for {one.name} from your note and their handle only — nothing invented about their content.
                {personal && one.hasNote === false ? " Tip: add a one-line note about them first for a more specific hook." : ""}
              </span>
            </p>
          )}
          {kind && kind !== "initial" && (
            <p className="cmp-banner">
              <Info size={13} />
              <span>
                {kind === "followup"
                  ? "A follow-up stays in the same thread: “Re: …” their last email, with In-Reply-To so Gmail keeps one conversation."
                  : kind === "fresh"
                    ? "A new email gets its own subject and starts a new thread in their inbox. Their reply still lands in this conversation."
                    : "Replies continue the thread under its subject."}
              </span>
            </p>
          )}

          <div className="cmp-ai">
            <input value={note} maxLength={500} placeholder="Optional steer for the AI, e.g. “mention Diwali is coming”" onChange={(e) => setNote(e.target.value)} />
            <button type="button" className="psp-btn gold" disabled={busy !== null || !status?.aiConfigured} onClick={() => void generate()}>
              {busy === "gen" ? <Loader2 size={15} className="psp-spin" /> : <Wand2 size={15} />}
              {busy === "gen" ? "Writing…" : body ? "Regenerate" : "Generate"}
            </button>
          </div>
          {!status?.aiConfigured && <p className="psp-err">AI drafting is off (no OPENAI_API_KEY) — write it by hand.</p>}
          {drafts.length > 1 && (
            <div className="cmp-alts" role="tablist" aria-label="Drafts">
              {drafts.map((d, i) => (
                <button key={i} type="button" role="tab" aria-selected={i === draftIdx} data-on={i === draftIdx ? "1" : "0"} onClick={() => chooseDraft(i)}>
                  Draft {String.fromCharCode(65 + i)}
                </button>
              ))}
              <span>Two angles — pick one, then edit freely.</span>
            </div>
          )}
          {reading && <p className="cmp-reading"><Sparkles size={11} /> {reading}{edited ? " · edited by you" : ""}</p>}

          <label className="psp-field">
            <span>Subject {!subjectLocked && <em>{connect ? "— names them, e.g. “Om & Diya, would love to connect”" : personal ? "— names them and the idea, e.g. “Om & Diya, a reel idea from SubhSandesh”" : "— 4–8 words, says what it’s about"}</em>}</span>
            <input
              value={subjectLocked ? preview?.subject || "Re: …" : subject}
              disabled={subjectLocked}
              maxLength={200}
              placeholder={connect ? "Om & Diya, would love to connect" : personal ? (kind === "fresh" ? "One more reel idea" : "Hey Om and Diya") : kind === "fresh" ? "Another collab idea for @handle" : "Collab idea for @handle"}
              onChange={(e) => setSubject(e.target.value)}
            />
          </label>
          <label className="psp-field">
            <span>Message <em>— {lint ? `${lint.words} words` : "…"} · {personal ? `signed “${signatureText}”; no footer` : "signature and footer are added automatically"}</em></span>
            <textarea ref={bodyRef} rows={13} value={body} placeholder={busy === "gen" ? "Writing a draft…" : connect ? `Hey {{firstName}},\n\n… I'm ${writer || "…"}. I'd love to connect …?` : personal ? `Hey {{firstName}},\n\nI'm ${writer || "…"} from SubhSandesh. …` : "Hi {{firstName}},\n\n…"} onChange={(e) => { setBody(e.target.value); setNotice(null); }} />
          </label>
          {(eligible.length > 1 || /\{\{/.test(body)) && (
            <div className="cmp-merge">
              <span>Insert:</span>
              {["{{firstName}}", "{{instagram}}", "{{name}}"].map((f) => (
                <button key={f} type="button" onClick={() => insert(f)}>{f}</button>
              ))}
            </div>
          )}
          {err && <p className="cmp-error"><AlertTriangle size={13} /> {err}</p>}
        </section>

        <section className="cmp-right" data-show={mobileTab === "preview" ? "1" : "0"}>
          {preview?.deliverability && (
            <RiskCard
              d={preview.deliverability}
              who={preview.to?.name}
              busy={busy === "improve"}
              disabled={busy !== null || !body.trim() || !status?.aiConfigured}
              onImprove={() => void improve()}
              notice={notice}
            />
          )}
          {preview?.inboxCheck && (
            <div className={`cmp-inbox ${personal ? "" : "classic"}`}>
              <h3><Inbox size={14} /> Inbox check {connect ? "— Connect" : personal ? "" : "— Classic looks like bulk mail"}</h3>
              <ul>
                {preview.inboxCheck.map((i, n) => (
                  <li key={n} className={i.ok ? "ok" : i.warn ? "warn" : "bad"}>
                    {i.ok ? <CheckCircle2 size={12} /> : i.warn ? <AlertTriangle size={12} /> : <XCircle size={12} />} {i.label}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className={`cmp-check ${!lint ? "" : lint.ok ? "ok" : "bad"}`}>
            <h3>
              {checking ? <Loader2 size={14} className="psp-spin" /> : <ShieldCheck size={14} />}
              {!lint ? "Spam check" : lint.ok ? "Passes the spam check" : `${lint.errors.length} thing${lint.errors.length === 1 ? "" : "s"} to fix before sending`}
            </h3>
            {lint && (
              <ul>
                {lint.errors.map((e, i) => <li key={`e${i}`} className="bad"><AlertTriangle size={12} /> {e.message}</li>)}
                {lint.warnings.map((w, i) => <li key={`w${i}`} className="warn"><Info size={12} /> {w.message}</li>)}
                {lint.ok && !lint.warnings.length && (
                  <li className="ok">
                    <CheckCircle2 size={12} /> {connect ? "Just a hello — no company, links, numbers or pitch words." : personal ? "Short, plain, no sales numbers, no spam wording." : "Short, plain, one link to subhsandesh.in, no spam wording."}
                  </li>
                )}
              </ul>
            )}
          </div>

          {preview?.to && (
            <div className="cmp-preview">
              <div className="cmp-ph">
                <Eye size={13} />
                <span>Preview for</span>
                {eligible.length > 1 ? (
                  <select value={previewFor || preview.to.id} onChange={(e) => setPreviewFor(e.target.value)} aria-label="Preview for which recipient">
                    {eligible.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                ) : (
                  <b>{preview.to.name}</b>
                )}
              </div>
              <dl className="cmp-env">
                <dt>From</dt><dd className="cmp-from">{fromLine}</dd>
                {preview.replyTo && <><dt>Reply-To</dt><dd>{preview.replyTo}</dd></>}
                <dt>To</dt><dd>{preview.to.email}</dd>
                <dt>Subject</dt><dd><b>{preview.subject || "(no subject)"}</b></dd>
              </dl>
              {preview.image && (
                <p className="cmp-attach"><ImageIcon size={12} /> Inline image: {preview.image.source} screenshot · sent as {preview.image.mime}</p>
              )}
              {preview.html ? (
                <iframe title="Email preview" className={`cmp-frame ${preview.image ? "tall" : ""}`} sandbox="" srcDoc={preview.image ? `<base target="_blank"><style>body{margin:14px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.55;color:#222}</style>${preview.html}` : preview.html} />
              ) : (
                <pre className="cmp-text" aria-label="Email preview (plain text)">{preview.text}</pre>
              )}
            </div>
          )}

          {excluded.length > 0 && (
            <div className="cmp-skip">
              <b>Not included — {excluded.length}:</b>
              <ul>{excluded.slice(0, 30).map((s) => <li key={s.id}>{s.name || "Unknown"} — {s.reason}</li>)}</ul>
              {excluded.length > 30 && <small>…and {excluded.length - 30} more.</small>}
            </div>
          )}
          {status && (
            <p className="cmp-pace">
              {status.sentLast24h}/{status.dailyCap} sent in the last 24h · {status.queued} already queued · {status.instant ? "sends instantly" : <>{gapText} between emails{istWindow(status)}</>}
            </p>
          )}
        </section>
      </div>

      <style>{`
        .cmp { display: grid; grid-template-columns: minmax(0, 1.05fr) minmax(0, 1fr); gap: 16px; }
        .cmp-left, .cmp-right { display: grid; gap: 10px; align-content: start; min-width: 0; }
        .cmp-mtabs { display: none; }
        .cmp-banner { margin: 0; display: flex; gap: 7px; align-items: flex-start; padding: 9px 11px; border-radius: 12px; background: rgba(109,74,209,.07); color: #4b3296; font-size: 12.5px; line-height: 1.5; }
        .cmp-banner svg { flex: none; margin-top: 3px; }
        .cmp-banner code { font-size: 11.5px; background: rgba(109,74,209,.1); padding: 0 4px; border-radius: 4px; }
        .cmp-warn { background: rgba(183,121,31,.1); color: #7a4f12; }
        .cmp-neutral { background: rgba(61,12,17,.045); color: ${A.soft}; }
        .cmp-confirm { cursor: pointer; }
        .cmp-confirm input { flex: none; width: 17px; height: 17px; margin: 2px 0 0; accent-color: ${A.maroon}; }
        .cmp-intent { display: flex; flex-wrap: wrap; gap: 6px; }
        .cmp-intent button { height: 34px; padding: 0 12px; border-radius: 10px; border: 1.5px solid ${A.edge}; background: #fff; font: inherit; font-size: 12.5px; font-weight: 800; color: ${A.soft}; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
        .cmp-intent button[data-on="1"] { border-color: ${A.maroon}; background: ${A.maroon}; color: #f7ece4; }
        .cmp-intent button i { font-style: normal; font-size: 11px; min-width: 18px; height: 18px; padding: 0 5px; border-radius: 99px; background: rgba(61,12,17,.08); display: inline-flex; align-items: center; justify-content: center; }
        .cmp-intent button[data-on="1"] i { background: rgba(255,255,255,.18); }
        .cmp-intent button:disabled { cursor: default; opacity: .75; }
        .cmp-alts { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
        .cmp-alts button { height: 30px; padding: 0 12px; border-radius: 99px; border: 1.5px solid rgba(201,168,76,.55); background: #fff; font: inherit; font-size: 12px; font-weight: 800; color: ${A.goldDeep}; cursor: pointer; }
        .cmp-alts button[data-on="1"] { background: rgba(201,168,76,.18); border-color: ${A.gold}; }
        .cmp-alts span { font-size: 11.5px; color: ${A.muted}; }
        .cmp-ai { display: flex; gap: 8px; }
        .cmp-ai input { flex: 1; min-width: 0; height: 40px; padding: 0 12px; border-radius: 12px; border: 1.5px solid ${A.edge}; font-size: 16px; outline: none; background: #fff; color: ${A.ink}; font-family: inherit; }
        .cmp-ai input:focus { border-color: ${A.gold}; }
        .cmp-reading { margin: 0; display: flex; gap: 5px; font-size: 11.5px; line-height: 1.45; color: ${A.goldDeep}; background: rgba(201,168,76,.1); padding: 6px 9px; border-radius: 10px; }
        .cmp-reading svg { flex: none; margin-top: 2px; }
        .cmp-left textarea { min-height: 260px; resize: vertical; }
        .cmp-left input:disabled { background: rgba(61,12,17,.04); color: ${A.soft}; }
        .cmp-merge { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; font-size: 11.5px; color: ${A.muted}; font-weight: 700; }
        .cmp-merge button { height: 28px; padding: 0 9px; border-radius: 8px; border: 1px dashed rgba(109,74,209,.45); background: rgba(109,74,209,.05); color: #4b3296; font: inherit; font-size: 12px; font-weight: 700; cursor: pointer; }
        .cmp-error { margin: 0; display: flex; gap: 6px; align-items: flex-start; font-size: 12.5px; font-weight: 700; color: ${A.danger}; line-height: 1.45; }
        .cmp-error svg { flex: none; margin-top: 3px; }
        .cmp-risk { padding: 12px; border-radius: 14px; border: 1px solid ${A.edge}; background: #fff; display: grid; gap: 10px; }
        .cmp-risk h3 { margin: 0; display: flex; gap: 6px; align-items: center; font-size: 13px; color: ${A.ink}; }
        .cmp-risk h3 small { font-weight: 600; color: ${A.muted}; font-size: 11.5px; }
        .cmp-meters { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .cmp-meter { display: grid; gap: 5px; }
        .cmp-meter-top { display: flex; justify-content: space-between; align-items: baseline; font-size: 12px; font-weight: 700; color: ${A.soft}; }
        .cmp-meter-top b { font-size: 18px; font-variant-numeric: tabular-nums; }
        .cmp-meter-top em { font-style: normal; font-size: 11px; font-weight: 800; padding: 1px 7px; border-radius: 99px; }
        .cmp-bar { height: 7px; border-radius: 99px; background: rgba(61,12,17,.08); overflow: hidden; }
        .cmp-bar > span { display: block; height: 100%; border-radius: 99px; transition: width .3s ease; }
        .lv-low b { color: ${A.ok}; } .lv-low .cmp-bar > span { background: ${A.ok}; } .lv-low em { background: rgba(30,122,75,.12); color: ${A.ok}; }
        .lv-medium b { color: #b7791f; } .lv-medium .cmp-bar > span { background: #d69e2e; } .lv-medium em { background: rgba(183,121,31,.14); color: #7a4f12; }
        .lv-high b { color: ${A.danger}; } .lv-high .cmp-bar > span { background: ${A.danger}; } .lv-high em { background: rgba(179,38,30,.12); color: ${A.danger}; }
        .cmp-factors { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
        .cmp-factors li { display: grid; grid-template-columns: auto 1fr; gap: 2px 7px; font-size: 12px; line-height: 1.45; }
        .cmp-factors li svg { margin-top: 2px; }
        .cmp-factors li small { grid-column: 2; color: ${A.muted}; font-size: 11.5px; }
        .cmp-factors li i { font-style: normal; font-weight: 800; font-size: 10.5px; color: ${A.muted}; margin-left: 4px; }
        .cmp-factors li.ok { color: ${A.ok}; }
        .cmp-risk-foot { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
        .cmp-risk-foot small { flex: 1 1 180px; font-size: 11px; line-height: 1.45; color: ${A.muted}; }
        .cmp-notice { margin: 0; font-size: 12px; color: ${A.ok}; display: flex; gap: 6px; align-items: flex-start; }
        .cmp-mscore { font-style: normal; font-size: 10.5px; font-weight: 800; padding: 1px 6px; border-radius: 99px; margin-left: 4px; }
        .cmp-mscore.low { background: rgba(30,122,75,.12); color: ${A.ok}; }
        .cmp-mscore.medium { background: rgba(183,121,31,.14); color: #7a4f12; }
        .cmp-mscore.high { background: rgba(179,38,30,.12); color: ${A.danger}; }
        .cmp-check { padding: 11px 12px; border-radius: 14px; border: 1px solid ${A.edge}; background: #fff; }
        .cmp-check.ok { border-color: rgba(30,122,75,.3); background: rgba(30,122,75,.05); }
        .cmp-check.bad { border-color: rgba(179,38,30,.3); background: rgba(179,38,30,.04); }
        .cmp-check h3 { margin: 0; display: flex; gap: 6px; align-items: center; font-size: 13px; color: ${A.ink}; }
        .cmp-check.ok h3 { color: ${A.ok}; }
        .cmp-check.bad h3 { color: ${A.danger}; }
        .cmp-check ul { list-style: none; margin: 8px 0 0; padding: 0; display: grid; gap: 5px; }
        .cmp-check li { display: flex; gap: 6px; align-items: flex-start; font-size: 12px; line-height: 1.45; }
        .cmp-check li svg { flex: none; margin-top: 2px; }
        .cmp-check li.bad { color: ${A.danger}; font-weight: 700; }
        .cmp-check li.warn { color: #7a4f12; }
        .cmp-check li.ok { color: ${A.ok}; }
        .cmp-preview { border: 1px solid ${A.edge}; border-radius: 14px; overflow: hidden; background: #fff; }
        .cmp-ph { display: flex; align-items: center; gap: 6px; padding: 8px 11px; font-size: 12px; color: ${A.soft}; background: rgba(61,12,17,.03); border-bottom: 1px solid ${A.edge}; }
        .cmp-ph select { min-width: 0; flex: 1; max-width: 240px; height: 30px; border-radius: 8px; border: 1px solid ${A.edge}; background: #fff; font: inherit; font-size: 12.5px; font-weight: 700; color: ${A.ink}; }
        .cmp-env { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 3px 10px; margin: 0; padding: 9px 11px; font-size: 12px; border-bottom: 1px solid ${A.edge}; }
        .cmp-env dt { color: ${A.muted}; font-weight: 700; }
        .cmp-env dd { margin: 0; color: ${A.ink}; overflow-wrap: anywhere; }
        .cmp-frame { display: block; width: 100%; height: 400px; border: 0; background: #fff; }
        .cmp-frame.tall { height: 560px; }
        .cmp-attach { margin: 0; display: flex; gap: 6px; align-items: flex-start; padding: 7px 11px; font-size: 11.5px; color: ${A.soft}; border-bottom: 1px solid ${A.edge}; background: rgba(61,12,17,.02); }
        .cmp-attach svg { flex: none; margin-top: 2px; }
        .cmp-proof { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 12px; padding: 9px 11px; border-radius: 12px; border: 1px solid rgba(30,122,75,.25); background: rgba(30,122,75,.05); }
        .cmp-switch { display: inline-flex; align-items: center; gap: 7px; font-size: 12.5px; color: ${A.ink}; cursor: pointer; }
        .cmp-switch input { width: 17px; height: 17px; margin: 0; accent-color: ${A.ok}; }
        .cmp-switch span { display: inline-flex; align-items: center; gap: 5px; }
        .cmp-proof select { min-width: 0; max-width: 100%; height: 32px; border-radius: 8px; border: 1px solid ${A.edge}; background: #fff; font: inherit; font-size: 12.5px; color: ${A.ink}; }
        .cmp-proof-what { font-size: 12px; font-weight: 700; color: ${A.ok}; }
        .cmp-proof-hint { flex-basis: 100%; font-size: 11.5px; color: ${A.muted}; line-height: 1.45; }
        .cmp-skip { padding: 10px 12px; border-radius: 12px; background: rgba(183,121,31,.08); color: #7a4f12; font-size: 12px; line-height: 1.5; }
        .cmp-skip ul { margin: 4px 0 0; padding-left: 18px; }
        .cmp-pace { margin: 0; font-size: 11.5px; color: ${A.muted}; }
        .cmp-foot-note { margin-right: auto; display: grid; gap: 2px; font-size: 11.5px; color: ${A.muted}; min-width: 0; }
        .cmp-foot-note > span { display: inline-flex; gap: 5px; align-items: center; }
        .cmp-foot-note svg { flex: none; }
        .cmp-tip { color: ${A.ok}; font-weight: 700; }
        .cmp-style { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 10px; }
        .cmp-style button { height: 34px; padding: 0 13px; border-radius: 999px; border: 1.5px solid ${A.edge}; background: #fff; font: inherit; font-size: 12.5px; font-weight: 800; color: ${A.soft}; cursor: pointer; }
        .cmp-style button[data-on="1"] { border-color: ${A.ok}; background: rgba(30,122,75,.08); color: ${A.ok}; }
        .cmp-style button:disabled { cursor: default; opacity: .75; }
        .cmp-style-hint { font-size: 11.5px; color: ${A.muted}; }
        .cmp-touch button[data-on="1"] { border-color: ${A.maroon}; background: rgba(61,12,17,.06); color: ${A.maroon}; }
        .cmp-proof-off { margin: 0; gap: 6px; font-size: 12px; color: ${A.soft}; border-color: ${A.edge}; background: rgba(61,12,17,.03); }
        .cmp-proof-off svg { flex: none; }
        .cmp-blocked { padding: 9px 11px; border-radius: 12px; background: rgba(179,38,30,.06); border: 1px solid rgba(179,38,30,.25); }
        .cmp-hint { background: rgba(30,122,75,.06); color: #1d5e3c; }
        .cmp-inbox { padding: 11px 12px; border-radius: 14px; border: 1px solid rgba(30,122,75,.3); background: rgba(30,122,75,.05); }
        .cmp-inbox.classic { border-color: rgba(183,121,31,.35); background: rgba(183,121,31,.06); }
        .cmp-inbox h3 { margin: 0; display: flex; gap: 6px; align-items: center; font-size: 13px; color: ${A.ink}; }
        .cmp-inbox ul { list-style: none; margin: 8px 0 0; padding: 0; display: grid; gap: 5px; }
        .cmp-inbox li { display: flex; gap: 6px; align-items: flex-start; font-size: 12px; line-height: 1.45; overflow-wrap: anywhere; }
        .cmp-inbox li svg { flex: none; margin-top: 2px; }
        .cmp-inbox li.ok { color: ${A.ok}; }
        .cmp-inbox li.bad { color: ${A.danger}; font-weight: 700; }
        .cmp-inbox li.warn { color: #7a4f12; font-weight: 700; }
        .cmp-from { font-weight: 700; }
        .cmp-text { margin: 0; padding: 14px 14px 18px; white-space: pre-wrap; overflow-wrap: anywhere; font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 1.55; color: #222; background: #fff; max-height: 420px; overflow: auto; }
        @media (max-width: 860px) {
          .cmp { grid-template-columns: minmax(0, 1fr); }
          .cmp-mtabs { display: inline-flex; gap: 2px; padding: 3px; margin-bottom: 12px; border-radius: 12px; background: rgba(61,12,17,.05); }
          .cmp-mtabs button { height: 34px; padding: 0 16px; border: none; border-radius: 10px; background: none; font: inherit; font-size: 12.5px; font-weight: 800; color: ${A.soft}; display: inline-flex; gap: 5px; align-items: center; cursor: pointer; }
          .cmp-mtabs button[data-on="1"] { background: #fff; color: ${A.ink}; box-shadow: 0 1px 4px rgba(61,12,17,.12); }
          .cmp-left[data-show="0"], .cmp-right[data-show="0"] { display: none; }
          .cmp-foot-note { flex-basis: 100%; }
          .cmp-frame { height: 460px; }
        }
        @media (max-width: 520px) {
          .cmp-ai { flex-direction: column; }
          .cmp-ai input { flex: none; }
          .cmp-intent button { flex: 1 1 auto; justify-content: center; }
        }
      `}</style>
    </Sheet>
  );
}

const RANK: Record<RiskLevel, number> = { low: 0, medium: 1, high: 2 };
function worst(d: Deliverability): RiskLevel {
  return RANK[d.spamLevel] >= RANK[d.promotionsLevel] ? d.spamLevel : d.promotionsLevel;
}

function Meter({ label, value, level }: { label: string; value: number; level: RiskLevel }) {
  return (
    <div className={`cmp-meter lv-${level}`} role="meter" aria-label={`${label} risk`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}>
      <div className="cmp-meter-top">
        <span>{label}</span>
        <span><b>{value}%</b> <em>{LEVEL_LABEL[level]}</em></span>
      </div>
      <div className="cmp-bar"><span style={{ width: `${value}%` }} /></div>
    </div>
  );
}

/** Spam / Promotions risk for the previewed recipient, what raises it, and the rewrite button. */
function RiskCard({ d, who, busy, disabled, onImprove, notice }: { d: Deliverability; who?: string; busy: boolean; disabled: boolean; onImprove: () => void; notice: string | null }) {
  const clean = d.spamLevel === "low" && d.promotionsLevel === "low";
  return (
    <div className="cmp-risk">
      <h3><Gauge size={14} /> Inbox risk {who ? <small>· email to {who}</small> : null}</h3>
      <div className="cmp-meters">
        <Meter label="Spam" value={d.spam} level={d.spamLevel} />
        <Meter label="Promotions" value={d.promotions} level={d.promotionsLevel} />
      </div>
      <ul className="cmp-factors">
        {d.factors.slice(0, 6).map((f) => (
          <li key={f.id}>
            <AlertTriangle size={12} color={f.points >= 12 ? A.danger : "#b7791f"} />
            <span>{f.label}<i>+{f.points} {f.affects === "both" ? "spam & promo" : f.affects === "spam" ? "spam" : "promo"}</i></span>
            <small>{f.fix}</small>
          </li>
        ))}
        {clean && d.good.slice(0, 4).map((g) => (
          <li key={g} className="ok"><CheckCircle2 size={12} /> <span>{g}</span></li>
        ))}
      </ul>
      {notice && <p className="cmp-notice"><CheckCircle2 size={13} /> <span>{notice}</span></p>}
      <div className="cmp-risk-foot">
        <button type="button" className="psp-btn gold" disabled={disabled} onClick={onImprove}>
          {busy ? <Loader2 size={15} className="psp-spin" /> : <Wand2 size={15} />}
          {busy ? "Rewriting…" : "Make it more personal"}
        </button>
        <small>Our estimate from the signals Gmail and spam filters use — not Gmail&apos;s own number. Replies matter most: one reply moves you to Primary.</small>
      </div>
    </div>
  );
}
