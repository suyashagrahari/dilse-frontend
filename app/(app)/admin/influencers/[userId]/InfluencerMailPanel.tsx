"use client";

// ─── Email chat with one influencer ─────────────────────────────────────────
//
// The conversation (shared `ConversationThread` bubbles), then a composer:
// pick what the email is for → Generate → the AI drafts subject + body from
// the whole thread and this influencer's real numbers → edit → Send.
//
// Nothing is ever sent without Send being pressed. Every capability this
// deployment lacks — no SES, no inbound route, no OpenAI key — is shown as a
// status line up front rather than discovered by pressing a button.
//
// Server: server/src/controllers/influencerMail.controller.ts.
// Setup: server/docs/influencer-mail-setup.md.

import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, Inbox, Loader2, Mail, MessageSquare, RefreshCw, Send, Sparkles, X } from "lucide-react";
import { API_URL } from "@/lib/config";
import ConversationThread, { type Thread } from "@/components/admin/ConversationThread";
import { A } from "../../adminKit";

type Intent = "welcome" | "how_to_earn" | "payout_update" | "nudge" | "reply";

const INTENTS: { key: Intent; label: string; hint: string }[] = [
  { key: "reply", label: "Reply to last", hint: "Answers their latest message using the whole thread" },
  { key: "welcome", label: "Welcome", hint: "How the programme works, their link and commission" },
  { key: "how_to_earn", label: "How to earn", hint: "Video ideas for Reels / Shorts / TikTok + their numbers" },
  { key: "payout_update", label: "Payout update", hint: "Earned, paid and pending — exact figures" },
  { key: "nudge", label: "Follow-up", hint: "A light check-in when things have gone quiet" },
];

interface InboundStatus {
  configured: boolean;
  mechanisms: string[];
  addresses: string[];
  lastOkAt: string | null;
  lastError: string;
  etaSeconds: number;
}

interface MailState {
  thread: (Thread & { userEmail: string }) | null;
  to: string;
  suggestedIntent: Intent;
  status: {
    sendMode: "ses" | "stub" | "off";
    fromAddress: string;
    replyToAddress: string;
    aiConfigured: boolean;
    inbound: InboundStatus;
  };
}

const MECH: Record<string, string> = {
  "imap-influencer": "mailbox polling",
  "imap-shared": "support@ polling",
  "ses-webhook": "SES receiving",
};

export default function InfluencerMailPanel({ userId, token, name }: { userId: string; token: string; name: string }) {
  const [state, setState] = useState<MailState | null>(null);
  const [loadErr, setLoadErr] = useState<string | null>(null);
  const [intent, setIntent] = useState<Intent>("welcome");
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [reading, setReading] = useState("");
  const [aiDraft, setAiDraft] = useState<string | null>(null);
  const [busy, setBusy] = useState<"gen" | "send" | "paste" | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const touchedIntent = useRef(false);

  const base = `${API_URL}/admin/super/influencers/${userId}/mail`;
  const auth = { Authorization: `Bearer ${token}` };

  const load = useCallback(async () => {
    try {
      const r = await fetch(base, { headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json();
      if (!d.success) throw new Error(d.error || "Could not load the conversation");
      setState(d.data);
      setLoadErr(null);
      if (!touchedIntent.current) setIntent(d.data.suggestedIntent);
    } catch (e) {
      setLoadErr((e as Error).message);
    }
  }, [base, token]);

  useEffect(() => {
    void load();
  }, [load]);

  const thread = state?.thread || null;
  const hasInbound = !!thread?.messages.some((m) => m.direction === "inbound");
  const status = state?.status;
  const canSend = status?.sendMode !== "off";

  async function generate() {
    setBusy("gen");
    setMsg(null);
    try {
      const r = await fetch(`${base}/draft`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...auth },
        body: JSON.stringify({ intent, note: note.trim() || undefined }),
      });
      const d = await r.json();
      if (!d.success) throw new Error(d.error || "Could not generate a draft");
      setSubject(d.data.subject);
      setBody(d.data.body);
      setReading(d.data.reading || "");
      setAiDraft(d.data.body);
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message });
    } finally {
      setBusy(null);
    }
  }

  async function send() {
    if (!subject.trim() || body.trim().length < 20) return;
    setBusy("send");
    setMsg(null);
    try {
      const r = await fetch(`${base}/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...auth },
        body: JSON.stringify({ subject: subject.trim(), body: body.trim(), aiAssisted: aiDraft !== null, intent }),
      });
      const d = await r.json();
      if (!d.success) throw new Error(d.error || "Not sent");
      setSubject("");
      setBody("");
      setReading("");
      setAiDraft(null);
      setNote("");
      touchedIntent.current = false;
      setMsg({ ok: true, text: d.data?.via === "stub" ? "Recorded (dev stub — nothing was delivered)" : d.message || "Sent" });
      await load();
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message });
    } finally {
      setBusy(null);
    }
  }

  async function paste(text: string) {
    if (!thread) return;
    setBusy("paste");
    try {
      const r = await fetch(`${API_URL}/admin/threads/${thread.id}/inbound`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...auth },
        body: JSON.stringify({ text }),
      });
      const d = await r.json();
      if (!d.success) throw new Error(d.error || "Could not add it");
      touchedIntent.current = false;
      await load();
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message });
    } finally {
      setBusy(null);
    }
  }

  const edited = aiDraft !== null && aiDraft !== body;
  const subjectPlaceholder = thread ? `Re: ${thread.subject}` : "Subject";

  return (
    <section className="imp" aria-label={`Email conversation with ${name}`}>
      <style>{CSS}</style>

      <header className="imp-head">
        <h3><MessageSquare size={15} /> Email {name.split(" ")[0] || "influencer"}</h3>
        <button type="button" className="imp-ghost" onClick={() => void load()} aria-label="Refresh conversation">
          <RefreshCw size={13} />
        </button>
      </header>

      {loadErr && <p className="imp-msg">{loadErr}</p>}

      {status && (
        <ul className="imp-status">
          <li className={status.sendMode === "ses" ? "ok" : status.sendMode === "stub" ? "warn" : "bad"}>
            {status.sendMode === "off" ? <AlertTriangle size={12} /> : <Mail size={12} />}
            <span>
              {status.sendMode === "ses" && <>Sends as <b>{status.fromAddress}</b> to <b>{state?.to}</b></>}
              {status.sendMode === "stub" && <>Dev stub — sends are recorded, <b>not delivered</b></>}
              {status.sendMode === "off" && <>Sending is off — SES is not configured on this server</>}
            </span>
          </li>
          <li className={status.inbound.configured ? (status.inbound.lastError ? "warn" : "ok") : "warn"}>
            <Inbox size={12} />
            <span>
            {status.inbound.configured ? (
              <>
                Replies to <b>{status.replyToAddress}</b> appear here automatically
                {" "}(~{Math.max(1, Math.round(status.inbound.etaSeconds / 60))} min, {status.inbound.mechanisms.map((m) => MECH[m] || m).join(" + ")})
                {status.inbound.lastError && <> · last check failed: {status.inbound.lastError}</>}
              </>
            ) : (
              <>
                Replies go to <b>{status.replyToAddress}</b> but won&apos;t appear here automatically yet — paste them in below. Setup: docs/influencer-mail-setup.md
              </>
            )}
            </span>
          </li>
          {!status.aiConfigured && (
            <li className="bad"><AlertTriangle size={12} /> <span>AI drafting is off — OPENAI_API_KEY is not set</span></li>
          )}
        </ul>
      )}

      {!state && !loadErr ? (
        <div className="imp-loading"><Loader2 size={16} className="imp-spin" /> Loading conversation…</div>
      ) : thread ? (
        <ConversationThread
          thread={thread}
          maxHeight="min(56vh, 460px)"
          scrollToEnd
          onPaste={status?.inbound.configured ? undefined : paste}
          pasting={busy === "paste"}
          pastePlaceholder={`Paste their reply from the ${status?.replyToAddress || "influencer-support@"} mailbox. The quoted original is removed automatically.`}
        />
      ) : state ? (
        <div className="imp-empty">
          <Mail size={18} />
          <p><b>No emails yet.</b> Start with a welcome — it explains how they earn, with their link and commission.</p>
        </div>
      ) : null}

      {state && (
        <div className="imp-compose">
          <div className="imp-intents" role="radiogroup" aria-label="What is this email for?">
            {INTENTS.filter((i) => i.key !== "reply" || hasInbound).map((i) => (
              <button
                key={i.key}
                type="button"
                role="radio"
                aria-checked={intent === i.key}
                title={i.hint}
                className={`imp-chip ${intent === i.key ? "on" : ""}`}
                onClick={() => { touchedIntent.current = true; setIntent(i.key); }}
              >
                {i.label}
                {state.suggestedIntent === i.key && <span className="imp-sugg">suggested</span>}
              </button>
            ))}
          </div>

          {showNote ? (
            <div className="imp-note">
              <input
                value={note}
                maxLength={500}
                placeholder="Optional steer for the AI, e.g. “mention Diwali pages”"
                onChange={(e) => setNote(e.target.value)}
              />
              <button type="button" className="imp-ghost" aria-label="Remove note" onClick={() => { setShowNote(false); setNote(""); }}><X size={13} /></button>
            </div>
          ) : (
            <button type="button" className="imp-link" onClick={() => setShowNote(true)}>+ Add a note for the AI</button>
          )}

          <button
            type="button"
            className="imp-gen"
            disabled={busy !== null || !status?.aiConfigured}
            onClick={() => void generate()}
          >
            {busy === "gen" ? <Loader2 size={15} className="imp-spin" /> : <Sparkles size={15} />}
            {busy === "gen" ? "Writing…" : body ? "Generate again" : "Generate email"}
          </button>

          {reading && (
            <p className="imp-reading"><Sparkles size={11} /> {reading}{edited ? " · edited by you" : ""}</p>
          )}

          <label className="imp-field">
            <span>Subject</span>
            <input value={subject} maxLength={200} placeholder={subjectPlaceholder} onChange={(e) => setSubject(e.target.value)} />
          </label>
          <label className="imp-field">
            <span>Message</span>
            <textarea
              value={body}
              rows={9}
              placeholder="Generate a draft above, or write it yourself."
              onChange={(e) => setBody(e.target.value)}
            />
          </label>
          <p className="imp-foot">
            A short footer with {status?.replyToAddress} and a reference code is added automatically.
          </p>

          <div className="imp-actions">
            {(subject || body) && (
              <button type="button" className="imp-ghost wide" disabled={busy !== null} onClick={() => { setSubject(""); setBody(""); setReading(""); setAiDraft(null); }}>
                Clear
              </button>
            )}
            <button
              type="button"
              className="imp-send"
              disabled={busy !== null || !canSend || !subject.trim() || body.trim().length < 20}
              onClick={() => void send()}
            >
              {busy === "send" ? <Loader2 size={15} className="imp-spin" /> : <Send size={15} />}
              {busy === "send" ? "Sending…" : "Send"}
            </button>
          </div>

          {msg && (
            <p className={`imp-msg ${msg.ok ? "ok" : ""}`}>
              {msg.ok ? <CheckCircle2 size={13} /> : <AlertTriangle size={13} />} {msg.text}
            </p>
          )}
        </div>
      )}
    </section>
  );
}

const CSS = `
  @keyframes imp-spin { to { transform: rotate(360deg); } }
  .imp { grid-column: 1 / -1; min-width: 0; margin-top: 10px; padding: 14px; border-radius: 18px; background: ${A.paper}; border: 1px solid rgba(201,168,76,.35); }
  .imp-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 8px; }
  .imp-head h3 { display: flex; align-items: center; gap: 6px; margin: 0; font-size: 14px; color: ${A.ink}; }
  .imp-status { list-style: none; margin: 0 0 10px; padding: 0; display: grid; gap: 4px; }
  .imp-status li { display: flex; align-items: flex-start; gap: 6px; font-size: 11.5px; line-height: 1.45; padding: 6px 9px; border-radius: 10px; overflow-wrap: anywhere; }
  .imp-status li svg { flex: none; margin-top: 2px; }
  .imp-status li.ok { background: rgba(30,122,75,.07); color: #1b5e3c; }
  .imp-status li.warn { background: rgba(183,121,31,.10); color: #7a4f12; }
  .imp-status li.bad { background: rgba(179,38,30,.08); color: ${A.danger}; }
  .imp-loading, .imp-empty { display: flex; align-items: center; gap: 8px; padding: 18px 12px; border-radius: 14px; border: 1px dashed rgba(201,168,76,.55); color: ${A.soft}; font-size: 12.5px; margin-bottom: 10px; }
  .imp-empty p { margin: 0; line-height: 1.5; }
  .imp-empty b { color: ${A.ink}; }
  .imp-compose { display: grid; gap: 8px; border-top: 1px solid ${A.edge}; padding-top: 10px; }
  .imp-intents { display: flex; flex-wrap: wrap; gap: 6px; }
  .imp-chip { position: relative; min-height: 36px; padding: 0 12px; border-radius: 99px; border: 1.5px solid ${A.edge}; background: #fff; color: ${A.soft}; font-size: 12.5px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; }
  .imp-chip.on { border-color: ${A.maroon}; background: ${A.maroon}; color: #f7ece4; }
  .imp-sugg { font-size: 9.5px; font-weight: 800; letter-spacing: .04em; text-transform: uppercase; padding: 1px 6px; border-radius: 99px; background: rgba(201,168,76,.25); color: ${A.goldDeep}; }
  .imp-chip.on .imp-sugg { background: rgba(201,168,76,.35); color: #f7e3b0; }
  .imp-note { display: flex; gap: 6px; align-items: center; }
  .imp-note input { flex: 1; min-width: 0; height: 40px; padding: 0 12px; border-radius: 10px; border: 1.5px solid ${A.edge}; font-size: 16px; outline: none; background: #fff; color: ${A.ink}; }
  .imp-link { justify-self: start; border: none; background: none; padding: 2px 0; font-size: 12px; font-weight: 700; color: ${A.goldDeep}; cursor: pointer; }
  .imp-gen { justify-self: start; min-height: 42px; padding: 0 18px; border-radius: 99px; border: 1.5px solid ${A.gold}; background: linear-gradient(135deg, rgba(201,168,76,.22), rgba(201,168,76,.08)); color: ${A.goldDeep}; font-weight: 800; font-size: 13.5px; display: inline-flex; align-items: center; gap: 7px; cursor: pointer; }
  .imp-gen:disabled { opacity: .5; cursor: not-allowed; }
  .imp-reading { margin: 0; display: flex; gap: 5px; align-items: flex-start; font-size: 11.5px; line-height: 1.45; color: ${A.goldDeep}; background: rgba(201,168,76,.10); padding: 6px 9px; border-radius: 10px; }
  .imp-reading svg { flex: none; margin-top: 2px; }
  .imp-field { display: grid; gap: 4px; }
  .imp-field span { font-size: 10.5px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: ${A.muted}; }
  .imp-field input, .imp-field textarea { width: 100%; box-sizing: border-box; padding: 10px 12px; border-radius: 12px; border: 1.5px solid ${A.edge}; background: #fff; color: ${A.ink}; font-size: 16px; line-height: 1.5; outline: none; font-family: inherit; }
  .imp-field textarea { resize: vertical; min-height: 180px; }
  .imp-field input:focus, .imp-field textarea:focus, .imp-note input:focus { border-color: ${A.gold}; }
  .imp-foot { margin: -2px 0 0; font-size: 11px; color: ${A.muted}; overflow-wrap: anywhere; }
  .imp-actions { display: flex; gap: 8px; justify-content: flex-end; }
  .imp-send { min-height: 44px; padding: 0 22px; border-radius: 99px; border: none; background: ${A.maroon}; color: #f5ede6; font-weight: 800; font-size: 14px; display: inline-flex; align-items: center; gap: 7px; cursor: pointer; }
  .imp-send:disabled { opacity: .4; cursor: not-allowed; }
  .imp-ghost { min-height: 32px; min-width: 32px; display: inline-flex; align-items: center; justify-content: center; border-radius: 99px; border: 1px solid ${A.edge}; background: #fff; color: ${A.soft}; cursor: pointer; font-weight: 700; font-size: 12.5px; }
  .imp-ghost.wide { min-height: 44px; padding: 0 16px; }
  .imp-msg { display: flex; align-items: center; gap: 6px; margin: 0; font-size: 12.5px; font-weight: 700; color: ${A.danger}; overflow-wrap: anywhere; }
  .imp-msg.ok { color: ${A.ok}; }
  .imp-spin { animation: imp-spin 1s linear infinite; }
  @media (max-width: 520px) {
    .imp { padding: 12px 10px; }
    .imp-gen { justify-self: stretch; justify-content: center; }
    .imp-actions { justify-content: stretch; }
    .imp-send { flex: 1; justify-content: center; }
  }
`;
