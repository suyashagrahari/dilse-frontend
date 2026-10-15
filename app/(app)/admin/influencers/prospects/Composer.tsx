"use client";

// ─── Generate → review → queue ──────────────────────────────────────────────
//
// Opened from the selection bar (or a conversation). One selected → the AI
// writes a personal email from what you typed about them; several → one
// template with {{firstName}} / {{instagram}}, rendered per person at send
// time. Nothing is sent from here without pressing Send, and Send only QUEUES:
// the server spaces the emails out under the daily cap.
//
// The right-hand side is the server's own verdict, refreshed as you type: the
// spam check that will gate Send, and the exact email one chosen recipient
// will receive (subject, footer, unsubscribe link and all).

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Eye, Info, Loader2, Send, ShieldCheck, Sparkles, Users, Wand2 } from "lucide-react";
import { A } from "../../adminKit";
import { KIND_LABEL, Sheet, api, when, type DeployStatus, type JobKind } from "./shared";

interface Lint {
  ok: boolean;
  errors: { code: string; message: string }[];
  warnings: { code: string; message: string }[];
  words: number;
  links: string[];
}

interface Preview {
  to: { id: string; name: string; email: string };
  kind: JobKind;
  subject: string;
  text: string;
  html: string;
  lint: Lint | null;
  eligible: { id: string; name: string; kind: JobKind }[];
  skipped: { id: string; name: string; reason: string }[];
}

export default function Composer({
  open,
  onClose,
  token,
  ids,
  status,
  onQueued,
}: {
  open: boolean;
  onClose: () => void;
  token: string;
  ids: string[];
  status: DeployStatus | null;
  onQueued: (message: string) => void;
}) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [reading, setReading] = useState("");
  const [aiBody, setAiBody] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState<"gen" | "send" | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [previewFor, setPreviewFor] = useState<string>("");
  const [checking, setChecking] = useState(false);
  const [mobileTab, setMobileTab] = useState<"write" | "preview">("write");
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const idsKey = ids.join(",");

  const kind: JobKind | null = preview?.kind || null;
  const eligible = useMemo(() => preview?.eligible || [], [preview]);
  const many = eligible.length > 1 || (ids.length > 1 && !preview);
  const subjectLocked = kind === "followup" || kind === "reply";

  const generate = useCallback(async () => {
    setBusy("gen");
    setErr(null);
    const r = await api<{ data: { subject: string; body: string; reading: string } }>(token, "/prospects/draft", { body: { ids, note: note.trim() || undefined } });
    setBusy(null);
    if (!r.ok) {
      setErr(r.data.error || "Could not generate a draft");
      return;
    }
    setSubject(r.data.data.subject || "");
    setBody(r.data.data.body);
    setReading(r.data.data.reading || "");
    setAiBody(r.data.data.body);
    setMobileTab("write");
  }, [token, ids, note]);

  // The page remounts this per opening (`key`), so state starts empty. Draft
  // straight away — pressing Generate in the list is the request for one.
  const started = useRef(false);
  useEffect(() => {
    if (!open || started.current || !status?.aiConfigured) return;
    started.current = true;
    const t = setTimeout(() => void generate(), 0);
    return () => clearTimeout(t);
  }, [open, status?.aiConfigured, generate]);

  // The server's verdict, debounced.
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(async () => {
      setChecking(true);
      const r = await api<{ data: Preview }>(token, "/prospects/preview", { body: { ids, prospectId: previewFor || undefined, subject, body } });
      setChecking(false);
      if (r.ok) setPreview(r.data.data);
    }, 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, idsKey, subject, body, previewFor, token]);

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
      body: { ids: eligible.map((e) => e.id), subject, body, aiAssisted: aiBody !== null },
    });
    setBusy(null);
    if (!r.ok) {
      setErr(r.data.for ? `${r.data.error} (for ${r.data.for})` : r.data.error || "Not queued");
      return;
    }
    const d = r.data.data;
    const extra = d.already.length ? ` · ${d.already.length} already in the queue` : "";
    const eta = d.finishEstimate && d.queued.length > 1 ? ` · last one goes out ~${when(d.finishEstimate)}` : "";
    onQueued(`${r.data.message}${extra}${eta}`);
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

  return (
    <Sheet
      open={open}
      onClose={onClose}
      wide
      title={<>{many ? <Users size={16} color={A.goldDeep} /> : <Sparkles size={16} color={A.goldDeep} />} {title}</>}
      footer={
        <>
          <span className="cmp-foot-note">
            <Info size={12} /> Queued, then sent one at a time (~1 every {status?.minGapSeconds ?? 90}s, max {status?.dailyCap ?? 30}/day){status?.sendMode === "stub" ? " · dev stub: nothing is delivered" : ""}
          </span>
          <button type="button" className="psp-btn" onClick={onClose}>Cancel</button>
          <button type="button" className="psp-btn primary" disabled={!canSend} onClick={() => void send()} title={blocked && lint ? lint.errors[0]?.message : undefined}>
            {busy === "send" ? <Loader2 size={15} className="psp-spin" /> : <Send size={15} />}
            {eligible.length > 1 ? `Queue ${eligible.length} emails` : eligible.length === 1 ? `Send to ${eligible[0].name.split(" ")[0]}` : "Send"}
          </button>
        </>
      }
    >
      <div className="cmp-mtabs" role="tablist">
        <button type="button" data-on={mobileTab === "write" ? "1" : "0"} onClick={() => setMobileTab("write")}>Write</button>
        <button type="button" data-on={mobileTab === "preview" ? "1" : "0"} onClick={() => setMobileTab("preview")}>
          Preview {lint && (lint.ok ? <CheckCircle2 size={12} color={A.ok} /> : <AlertTriangle size={12} color={A.danger} />)}
        </button>
      </div>

      <div className="cmp">
        <section className="cmp-left" data-show={mobileTab === "write" ? "1" : "0"}>
          {eligible.length > 1 && (
            <p className="cmp-banner">
              <Users size={13} /> <span>One template, sent separately to each person — <code>{"{{firstName}}"}</code> and <code>{"{{instagram}}"}</code> are filled in for each. Nobody sees anyone else.</span>
            </p>
          )}
          {kind === "initial" && eligible.length === 1 && (
            <p className="cmp-banner"><Sparkles size={13} /> <span>Written for {eligible[0].name} from your note and their handle only — nothing invented about their content.</span></p>
          )}
          {subjectLocked && (
            <p className="cmp-banner"><Info size={13} /> <span>{kind === "followup" ? "A follow-up continues each person's thread, so its subject is “Re: …” their first email." : "Replies continue the thread under its subject."}</span></p>
          )}

          <div className="cmp-ai">
            <input value={note} maxLength={500} placeholder="Optional steer for the AI, e.g. “mention Diwali is coming”" onChange={(e) => setNote(e.target.value)} />
            <button type="button" className="psp-btn gold" disabled={busy !== null || !status?.aiConfigured} onClick={() => void generate()}>
              {busy === "gen" ? <Loader2 size={15} className="psp-spin" /> : <Wand2 size={15} />}
              {busy === "gen" ? "Writing…" : body ? "Regenerate" : "Generate"}
            </button>
          </div>
          {!status?.aiConfigured && <p className="psp-err">AI drafting is off (no OPENAI_API_KEY) — write it by hand.</p>}
          {reading && <p className="cmp-reading"><Sparkles size={11} /> {reading}{edited ? " · edited by you" : ""}</p>}

          <label className="psp-field">
            <span>Subject</span>
            <input value={subjectLocked ? preview?.subject || "Re: …" : subject} disabled={subjectLocked} maxLength={200} placeholder="Your own link on SubhSandesh" onChange={(e) => setSubject(e.target.value)} />
          </label>
          <label className="psp-field">
            <span>Message <em>— {lint ? `${lint.words} words` : "…"} · signature and footer are added automatically</em></span>
            <textarea ref={bodyRef} rows={13} value={body} placeholder={busy === "gen" ? "Writing a draft…" : "Hi {{firstName}},\n\n…"} onChange={(e) => setBody(e.target.value)} />
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
          <div className={`cmp-check ${!lint ? "" : lint.ok ? "ok" : "bad"}`}>
            <h3>
              {checking ? <Loader2 size={14} className="psp-spin" /> : <ShieldCheck size={14} />}
              {!lint ? "Spam check" : lint.ok ? "Passes the spam check" : `${lint.errors.length} thing${lint.errors.length === 1 ? "" : "s"} to fix before sending`}
            </h3>
            {lint && (
              <ul>
                {lint.errors.map((e, i) => <li key={`e${i}`} className="bad"><AlertTriangle size={12} /> {e.message}</li>)}
                {lint.warnings.map((w, i) => <li key={`w${i}`} className="warn"><Info size={12} /> {w.message}</li>)}
                {lint.ok && !lint.warnings.length && <li className="ok"><CheckCircle2 size={12} /> Short, plain, one link to subhsandesh.in, no spam wording.</li>}
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
                <dt>From</dt><dd>{status?.fromName} &lt;{status?.fromAddress}&gt;</dd>
                <dt>To</dt><dd>{preview.to.email}</dd>
                <dt>Subject</dt><dd><b>{preview.subject || "(no subject)"}</b></dd>
              </dl>
              <iframe title="Email preview" className="cmp-frame" sandbox="" srcDoc={preview.html} />
            </div>
          )}

          {preview && preview.skipped.length > 0 && (
            <div className="cmp-skip">
              <b>{preview.skipped.length} won&apos;t be emailed:</b>
              <ul>{preview.skipped.slice(0, 20).map((s) => <li key={s.id}>{s.name || "Unknown"} — {s.reason}</li>)}</ul>
            </div>
          )}
          {status && (
            <p className="cmp-pace">
              {status.sentLast24h}/{status.dailyCap} sent in the last 24h · {status.queued} already queued · about {gapMin} min between emails
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
        .cmp-skip { padding: 10px 12px; border-radius: 12px; background: rgba(183,121,31,.08); color: #7a4f12; font-size: 12px; line-height: 1.5; }
        .cmp-skip ul { margin: 4px 0 0; padding-left: 18px; }
        .cmp-pace { margin: 0; font-size: 11.5px; color: ${A.muted}; }
        .cmp-foot-note { margin-right: auto; display: inline-flex; gap: 5px; align-items: center; font-size: 11.5px; color: ${A.muted}; min-width: 0; }
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
        }
      `}</style>
    </Sheet>
  );
}
