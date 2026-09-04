"use client";

// ─── One draft, and the email about it ───────────────────────────────────────
//
// The right-hand panel of /admin/drafts (a full-screen sheet on a phone): what
// this person made, what they never filled in, the conversation so far, and the
// composer.
//
// ── WHY THE COMPOSER'S STATE LIVES HERE ─────────────────────────────────────
//
// The component is keyed on the pageId by its parent, so switching drafts
// unmounts it and everything typed goes with it. That is the behaviour the page
// used to hand-roll with four `setState("")` calls at the top of `open()`, and
// the sender choice would have been a fifth — one more thing to forget, in a
// panel where forgetting it means the next follow-up leaves from whichever
// address the last one did.
//
// ── WHAT THIS PANEL DELIBERATELY DOES NOT SHOW ──────────────────────────────
//
// Their draft. Not a preview, not a field value, not one line of it. An
// unpublished page is the most private document on this platform — an apology,
// a proposal, a letter to a brother — written by somebody who has not decided
// to show it to ANYONE, not even its recipient. So this screen is built out of
// shape only: how much is filled, how many words, which fields are still empty
// by NAME. That is enough to write "you got to the paywall on your Rakhi page
// and stopped — what happened?", and it is all `draftInsight.service` will hand
// over. Showing the draft here would be a product decision with a privacy
// consequence, and it belongs in front of a human, not in a redesign.

import { useState } from "react";
import Link from "next/link";
import { API_URL } from "@/lib/config";
import { BRAND } from "@/lib/brand";
import ConversationThread from "@/components/admin/ConversationThread";
import SenderPicker from "@/components/admin/SenderPicker";
import {
  Loader2, Sparkles, Send, X, Mail, Clock, ExternalLink, UserRound, ShieldCheck,
} from "lucide-react";
import type { Detail } from "./types";
import { MissingFields, Progress, ReasonChip, Warn, replyAddressOf } from "./parts";

const CARD: React.CSSProperties = {
  background: BRAND.surface,
  border: `1px solid ${BRAND.border}`,
  borderRadius: BRAND.radiusLg,
  padding: 14,
};

const LABEL: React.CSSProperties = {
  margin: "0 0 7px", fontSize: 10.5, fontWeight: 800, letterSpacing: "0.06em",
  textTransform: "uppercase", color: BRAND.faint,
};

/** A small square control: close, and anything else that earns only an icon. */
const iconBtn: React.CSSProperties = {
  width: 34, height: 34, borderRadius: 11, border: `1px solid ${BRAND.border}`,
  background: BRAND.bgAlt, color: BRAND.muted, display: "grid", placeItems: "center",
  cursor: "pointer", flex: "none",
};

export default function DraftDetail({
  detail: sel,
  hdr,
  say,
  onClose,
  onReload,
  onSent,
  onError,
}: {
  detail: Detail;
  hdr: () => Record<string, string>;
  say: (m: string) => void;
  onClose: () => void;
  /** Refetch this draft and hand it back, so the composer can re-read its defaults. */
  onReload: () => Promise<Detail | null>;
  onSent: (pageId: string) => void;
  onError: (m: string) => void;
}) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [aiAssisted, setAiAssisted] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [sending, setSending] = useState(false);
  const [pasting, setPasting] = useState(false);
  /** Set when the server refuses on a guard and offers "send anyway". */
  const [needsForce, setNeedsForce] = useState<string | null>(null);
  const [threadMode, setThreadMode] = useState<"same" | "new">(
    sel.defaultThreadMode === "same" ? "same" : "new"
  );
  const [senderId, setSenderId] = useState(
    sel.defaultSenderId || sel.senderOptions?.[0]?.id || ""
  );

  const senders = sel.senderOptions || [];
  const chosenAddress =
    senders.find((o) => o.id === senderId)?.address || sel.fromEmail;

  /** The newest conversation about this draft — the one a reply joins. */
  const latestThread = sel.threads?.length ? sel.threads[0] : null;

  /**
   * In "same" mode the subject is DERIVED, and the server derives it again and
   * ignores whatever we send. Shown read-only rather than hidden, because the
   * recipient will see it and so should whoever is sending it.
   */
  const replyingSubject = latestThread
    ? `Re: ${latestThread.subject.replace(/^\s*(?:re|fwd?)\s*:\s*/i, "")}`
    : "";
  const usingThread = threadMode === "same" && !!latestThread;
  const canSend =
    (usingThread || subject.trim().length > 0) && body.trim().length >= 40 && !sending;

  const pasteReply = async (threadId: string, text: string) => {
    if (pasting) return;
    setPasting(true);
    try {
      const res = await fetch(`${API_URL}/admin/threads/${encodeURIComponent(threadId)}/inbound`, {
        method: "POST", headers: hdr(), body: JSON.stringify({ text }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Could not add the reply");
      // Deliberately does NOT touch the thread-mode toggle. The composer still
      // holds unsent text and whatever mode was chosen for it, and quietly
      // flipping "New thread" back to "Same thread" would change where that
      // text goes without saying so.
      await onReload();
      say("Added to the conversation");
    } catch (e) {
      onError(e instanceof Error ? e.message : "Could not add the reply");
    } finally {
      setPasting(false);
    }
  };

  const generate = async () => {
    if (drafting) return;
    setDrafting(true);
    try {
      const res = await fetch(
        `${API_URL}/admin/drafts/${encodeURIComponent(sel.templateType)}/${encodeURIComponent(sel.pageId)}/draft-email`,
        { method: "POST", headers: hdr() }
      );
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Could not generate the email");
      setSubject(json.data.subject || "");
      setBody(json.data.body || "");
      setAiAssisted(true);
      say("Draft ready — read it before sending");
    } catch (e) {
      onError(e instanceof Error ? e.message : "Could not generate the email");
    } finally {
      setDrafting(false);
    }
  };

  const send = async (force = false) => {
    if (sending) return;
    if (!subject.trim() && !usingThread) return;
    if (body.trim().length < 40) return;
    setSending(true);
    try {
      const res = await fetch(
        `${API_URL}/admin/drafts/${encodeURIComponent(sel.templateType)}/${encodeURIComponent(sel.pageId)}/send`,
        {
          method: "POST",
          headers: hdr(),
          body: JSON.stringify({
            subject: subject.trim(), body: body.trim(),
            aiAssisted, force, threadMode, senderId,
          }),
        }
      );
      const json = await res.json();

      // A guard refusal is not an error — it is a question. Keep the composer
      // exactly as it is and offer to go ahead.
      if (res.status === 409 && json?.code) {
        setNeedsForce(json.error || "Already contacted.");
        return;
      }
      if (!res.ok || !json.success) throw new Error(json.error || "Could not send the email");

      onSent(sel.pageId);
      setNeedsForce(null);
      setSubject("");
      setBody("");
      setAiAssisted(false);
      say(json.message || "Sent");

      // Refetch rather than patch the local copy. The send may have opened a
      // new conversation, appended to an existing one, or rewritten the
      // subject — this panel would have to reimplement all three rules to
      // guess the result.
      //
      // And re-read the thread mode from the fresh answer. A message sent as a
      // "new thread" has just created the thread that the NEXT one should
      // continue; leaving the toggle where it was would quietly open a second
      // conversation about the same page, which the recipient sees as two
      // unrelated emails. The server decides the safe default in one place, so
      // it is asked rather than guessed.
      const fresh = await onReload();
      if (fresh) setThreadMode(fresh.defaultThreadMode === "same" ? "same" : "new");
    } catch (e) {
      onError(e instanceof Error ? e.message : "Could not send the email");
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={CARD}>
      {/* ── Who and what ─────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: BRAND.text }}>
              {sel.templateLabel}
            </span>
            <ReasonChip reason={sel.verdict.reason} />
          </div>

          <p style={{ margin: "7px 0 0", fontSize: 13, fontWeight: 700, color: BRAND.text }}>
            {sel.user.name || "—"}
          </p>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 4 }}>
            <a
              href={`mailto:${sel.user.email}`}
              style={{
                display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12,
                color: BRAND.accent, textDecoration: "none",
              }}
            >
              <Mail size={12} /> {sel.user.email}
            </a>

            {/* ── The profile link ─────────────────────────────────────────
                Only when the server resolved a LIVE account. A link built
                from a raw userId 404s once that account is deleted, which
                reads as this panel being broken rather than as the account
                being gone. */}
            {sel.profileUserId && (
              <Link
                href={`/admin/users/${sel.profileUserId}`}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12,
                  fontWeight: 700, color: BRAND.accent, textDecoration: "none",
                }}
              >
                <UserRound size={12} /> Their profile
              </Link>
            )}

            {sel.templateSlug && (
              <a
                href={`/${sel.templateSlug}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Opens the template itself, not their draft"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12,
                  color: BRAND.accent, textDecoration: "none",
                }}
              >
                <ExternalLink size={12} /> See the template
              </a>
            )}
          </div>

          <p
            style={{
              margin: "6px 0 0", fontSize: 11.5, color: BRAND.faint,
              display: "flex", alignItems: "center", gap: 5,
            }}
          >
            <Clock size={11} /> idle {sel.daysIdle} day{sel.daysIdle === 1 ? "" : "s"}
          </p>
        </div>

        <button type="button" onClick={onClose} aria-label="Close" style={iconBtn}>
          <X size={15} />
        </button>
      </div>

      {/* ── What we know. Shape only — deliberately not their words. ─────── */}
      <div
        style={{
          padding: 12, borderRadius: BRAND.radius, background: BRAND.surfaceAlt,
          borderLeft: `3px solid ${BRAND.gold}`, marginBottom: 12,
        }}
      >
        <p style={{ margin: 0, fontSize: 13, lineHeight: "20px", color: BRAND.text }}>
          {sel.verdict.detail}
        </p>

        <div style={{ display: "flex", gap: 14, marginTop: 9, flexWrap: "wrap", alignItems: "center" }}>
          <Progress value={sel.summary.completeness} width={64} />
          <span style={{ fontSize: 11, color: BRAND.faint }}>
            {sel.summary.filledFields}/{sel.summary.totalFields} fields ·{" "}
            {sel.summary.wordCount} words · {sel.summary.photoCount} photo
            {sel.summary.photoCount === 1 ? "" : "s"}
          </span>
        </div>

        {/* The whole list here, not the row's three. This is where somebody
            decides what to write, and "they never added a photo or a date" is
            the sentence the email wants. */}
        <div style={{ marginTop: 10 }}>
          <MissingFields fields={sel.missingFields} total={sel.missingCount} max={12} />
        </div>

        <p style={{ margin: "9px 0 0", fontSize: 10.5, color: BRAND.faint, lineHeight: 1.5 }}>
          Field names only — never what they typed, and nothing from the draft is sent to the AI.
          An unpublished page has not been shown to anybody.
        </p>
      </div>

      {/* ── The conversation so far ──────────────────────────────────────── */}
      {sel.threads.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <p style={LABEL}>Conversation</p>
          {sel.threads.map((th) => (
            <ConversationThread
              key={th.id}
              thread={th}
              pasting={pasting}
              // Hidden once the mailbox poller is running: telling somebody to
              // paste a reply that is already being collected invites a
              // duplicate of it.
              onPaste={sel.inbound?.configured ? undefined : (text) => pasteReply(th.id, text)}
            />
          ))}
        </div>
      )}

      {sel.threads.length === 0 && sel.alreadyContacted && (
        // A follow-up sent before conversations existed: the ledger row
        // survives, the thread does not.
        <div
          style={{
            marginBottom: 12, padding: 10, borderRadius: BRAND.radius,
            background: "rgba(61,12,17,0.04)", border: `1px solid ${BRAND.border}`,
          }}
        >
          <p style={{ margin: "0 0 4px", fontSize: 10.5, color: BRAND.faint, fontWeight: 700 }}>
            Sent {new Date(sel.alreadyContacted.sentAt).toDateString()} · before conversations were recorded
          </p>
          <p style={{ margin: "0 0 5px", fontSize: 12.5, fontWeight: 700, color: BRAND.text }}>
            {sel.alreadyContacted.subject}
          </p>
          <p style={{ margin: 0, fontSize: 12.5, lineHeight: "19px", color: BRAND.muted, whiteSpace: "pre-wrap" }}>
            {sel.alreadyContacted.body}
          </p>
        </div>
      )}

      {sel.cooldown && !sel.alreadyContacted && (
        <p style={{ margin: "0 0 12px", fontSize: 11.5, color: BRAND.warn, lineHeight: 1.5 }}>
          This person was emailed about another draft recently. Sending is held until{" "}
          {new Date(sel.cooldown.until).toDateString()} unless you override it.
        </p>
      )}

      {/* ── Composer ─────────────────────────────────────────────────────── */}
      <p style={LABEL}>{latestThread ? "Write again" : "Follow-up email"}</p>

      {/* Only shown when there IS a conversation to continue — a two-way
          switch with one reachable side is noise. */}
      {latestThread && (
        <div style={{ marginBottom: 10 }}>
          <div
            role="radiogroup"
            aria-label="Where this message goes"
            style={{
              display: "flex", gap: 4, padding: 3, borderRadius: 11,
              background: "rgba(61,12,17,0.05)", border: `1px solid ${BRAND.border}`,
            }}
          >
            {([
              { key: "same", label: "Same thread", hint: `Continues "${latestThread.subject}" in their inbox` },
              { key: "new", label: "New thread", hint: "Arrives as a separate, unrelated email" },
            ] as const).map((opt) => {
              const on = threadMode === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  title={opt.hint}
                  onClick={() => setThreadMode(opt.key)}
                  style={{
                    flex: 1, minHeight: 34, borderRadius: 9, border: "none",
                    background: on ? BRAND.surface : "transparent",
                    boxShadow: on ? "0 1px 4px rgba(61,12,17,0.10)" : "none",
                    color: on ? BRAND.text : BRAND.muted,
                    fontSize: 12.5, fontWeight: on ? 800 : 600, cursor: "pointer",
                    touchAction: "manipulation",
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          <p style={{ margin: "5px 0 0", fontSize: 10.5, color: BRAND.faint, lineHeight: 1.5 }}>
            {usingThread
              ? "Goes into the conversation above, so they see one thread and not two emails."
              : "Starts a separate conversation. Right when the subject genuinely changed."}
          </p>
        </div>
      )}

      {/* ── Which address it leaves from ──────────────────────────────────
          This composer used to print "Send from feedback@subhsandesh.in" on
          the button and offer no alternative. Now the address is a choice made
          BEFORE writing, and the button is just a button. */}
      <SenderPicker
        options={senders}
        value={senderId}
        onChange={setSenderId}
        replyToAddress={replyAddressOf(sel.replyToAddress || sel.inbound?.replyToAddress)}
        replyNote="If they reply, it comes back to"
      />

      <button
        type="button" onClick={() => void generate()} disabled={drafting}
        style={{
          width: "100%", minHeight: 44, borderRadius: BRAND.radius, marginBottom: 10,
          border: `1px solid ${BRAND.gold}`, background: "rgba(201,168,76,0.14)",
          color: BRAND.accent, fontSize: 13.5, fontWeight: 700, display: "flex",
          alignItems: "center", justifyContent: "center", gap: 7,
          cursor: drafting ? "default" : "pointer",
        }}
      >
        {drafting ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
        {drafting ? "Writing…" : "Generate email"}
      </button>

      {/* The subject is derived when replying, and the server derives it again
          and ignores what we send. Shown, not hidden — the recipient sees it. */}
      <input
        value={usingThread ? replyingSubject : subject}
        onChange={(e) => setSubject(e.target.value)}
        readOnly={usingThread}
        placeholder="Subject"
        title={usingThread ? "Fixed while replying in the same thread — changing it would split the conversation" : undefined}
        style={{
          width: "100%", height: 44, padding: "0 12px",
          marginBottom: usingThread ? 3 : 8, borderRadius: BRAND.radius,
          border: `1px solid ${BRAND.border}`,
          background: usingThread ? "rgba(61,12,17,0.04)" : BRAND.surface,
          fontSize: 16, color: usingThread ? BRAND.muted : BRAND.text, outline: "none",
          cursor: usingThread ? "default" : "text",
        }}
      />
      {usingThread && (
        <p style={{ margin: "0 0 8px", fontSize: 10.5, color: BRAND.faint }}>
          Fixed while replying — a changed subject splits the thread in their inbox.
        </p>
      )}

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="What we send them. Edit anything before it goes."
        rows={9}
        style={{
          width: "100%", padding: 12, borderRadius: BRAND.radius, resize: "vertical",
          border: `1px solid ${BRAND.border}`, background: BRAND.surface, fontSize: 16,
          lineHeight: "23px", color: BRAND.text, outline: "none", fontFamily: "inherit",
        }}
      />

      {needsForce ? (
        <div
          style={{
            marginTop: 10, padding: 11, borderRadius: BRAND.radius,
            background: "rgba(201,168,76,0.14)", border: `1px solid ${BRAND.gold}`,
          }}
        >
          <p style={{ margin: "0 0 9px", fontSize: 12.5, color: BRAND.text, lineHeight: 1.5 }}>
            {needsForce}
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button" onClick={() => void send(true)} disabled={sending}
              style={{
                flex: 1, minHeight: 42, borderRadius: 10, border: "none",
                background: BRAND.accentStrong, color: "#fff", fontSize: 13.5, fontWeight: 800,
                cursor: sending ? "default" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}
            >
              {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Send anyway
            </button>
            <button
              type="button" onClick={() => setNeedsForce(null)}
              style={{
                minHeight: 42, padding: "0 16px", borderRadius: 10,
                border: `1px solid ${BRAND.border}`, background: BRAND.surface,
                color: BRAND.muted, fontSize: 13, fontWeight: 700, cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <button
            type="button" onClick={() => void send(false)} disabled={!canSend || !sel.sesConfigured}
            title={sel.sesConfigured ? undefined : "SES is not configured on this deployment"}
            style={{
              width: "100%", minHeight: 46, borderRadius: BRAND.radius, marginTop: 10,
              border: "none",
              background: canSend && sel.sesConfigured ? BRAND.gradient : "rgba(61,12,17,0.12)",
              color: canSend && sel.sesConfigured ? "#fff" : BRAND.faint,
              fontSize: 14.5, fontWeight: 800, display: "flex", alignItems: "center",
              justifyContent: "center", gap: 7,
              cursor: canSend && sel.sesConfigured ? "pointer" : "default",
              touchAction: "manipulation",
            }}
          >
            {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            {sending ? "Sending…" : usingThread ? "Send reply" : "Send follow-up"}
          </button>

          {/* The address moved OFF the button and under it. On the button it
              made the label a 42-character sentence that wrapped on a phone
              and changed length whenever the address did; here it is a fact
              about what is about to happen, next to the control that changes
              it. */}
          <p
            style={{
              margin: "7px 0 0", fontSize: 11, color: BRAND.faint, lineHeight: 1.5,
              display: "flex", alignItems: "center", gap: 5, justifyContent: "center",
              textAlign: "center", flexWrap: "wrap",
            }}
          >
            <ShieldCheck size={12} style={{ flex: "none" }} />
            <span>
              Leaves as{" "}
              <strong style={{ color: BRAND.muted, fontWeight: 700 }}>{chosenAddress}</strong>
              {sel.inbound?.configured
                ? // Honest per route: the SES webhook lands in seconds, the
                  // mailbox poller on its interval.
                  (sel.inbound.etaSeconds ?? 120) <= 60
                  ? " · a reply appears above within seconds"
                  : ` · a reply appears above within ${Math.max(1, Math.round((sel.inbound.etaSeconds ?? 120) / 60))} min`
                : " · paste any reply back in above"}
            </span>
          </p>
        </>
      )}

      {sel.inbound?.configured && sel.inbound.lastError && sel.inbound.mechanisms?.includes("imap") ? (
        // Loud, because a silently broken poller looks exactly like a creator
        // who never replied.
        <div style={{ marginTop: 8 }}>
          <Warn>The mailbox watcher is failing: {sel.inbound.lastError}</Warn>
        </div>
      ) : null}

      {body.trim().length > 0 && body.trim().length < 40 && (
        <p style={{ margin: "8px 0 0", fontSize: 11.5, color: BRAND.danger }}>
          A little longer before this can go out.
        </p>
      )}

      {aiAssisted && (
        <p style={{ margin: "9px 0 0", fontSize: 11.5, color: BRAND.faint, lineHeight: 1.5 }}>
          This started as a generated draft. Read it. It cannot offer a discount or a free publish —
          the server throws the draft away if it tries — but it can still be wrong about tone, and
          this email arrives uninvited.
        </p>
      )}
    </div>
  );
}
