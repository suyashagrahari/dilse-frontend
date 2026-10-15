"use client";

// ─── Reading one email conversation ─────────────────────────────────────────
//
// Outbound on the right in maroon, inbound on the left in white — the layout
// every messaging app uses, so nobody has to learn it.
//
// ── THE THINGS THIS SHOWS THAT A CHAT APP DOES NOT ─────────────────────────
//
// A chat app knows exactly who said what. This does not, and pretending
// otherwise would be the worst thing it could do:
//
//   · A pasted message was typed in by a staff member from what they saw in
//     the mailbox. It is labelled, because a message attributed to a customer
//     that a colleague actually typed must never look identical to one that
//     arrived on its own.
//   · A trimmed message had its quoted history removed by a heuristic that can
//     over-trim. "Show the full email" is offered whenever anything was cut.
//   · Threading confidence: our own outbound ids are RECONSTRUCTED, because SES
//     overwrites the Message-ID header and never tells us what it wrote. A
//     message anchored to a guess says so on hover.
//
// See server/src/services/emailThread.service.ts for why each of those is true.

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Check, ChevronDown, Clipboard, Mail, Sparkles, User } from "lucide-react";

const t1 = "#2a0a0e";
const t2 = "#7f5f5f";
const tM = "#9a7070";
const g = "#c9a84c";
const bg = "#3d0c11";
const cB = "rgba(61,12,17,0.08)";

export interface ThreadMessage {
  direction: string;
  subject: string;
  body: string;
  /** Present only when the quoted-history trim actually removed something. */
  rawBody: string;
  at: string;
  byEmail: string;
  /**
   * Which of OUR addresses this went out as.
   *
   * Empty on inbound mail, and on every outbound message sent before replies
   * could choose one — so the badge below is conditional rather than assuming
   * a default that may not have been what was used.
   */
  fromAddress?: string;
  aiAssisted: boolean;
  /**
   * Outbound only: the provider accepted it and returned an id. Not
   * "delivered" — there is no bounce feed — so the badge says "sent".
   */
  sent?: boolean;
  confidence: string;
  source: string;
  trimmed: boolean;
}

export interface Thread {
  id: string;
  threadKey: string;
  subject: string;
  seq: number;
  messageCount: number;
  lastMessageAt: string;
  lastDirection: string;
  unread: boolean;
  status: string;
  notes: string;
  messages: ThreadMessage[];
}

function stamp(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.round(mins / 60)}h ago`;
  if (mins < 10080) return `${Math.round(mins / 1440)}d ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function Bubble({ m }: { m: ThreadMessage }) {
  const [full, setFull] = useState(false);
  const out = m.direction === "outbound";
  const pasted = m.source === "manual";

  return (
    <div style={{ display: "flex", justifyContent: out ? "flex-end" : "flex-start", marginBottom: 8 }}>
      <div style={{ maxWidth: "86%", minWidth: 0 }}>
        <div
          style={{
            // Wraps. This row carries up to five items — direction, time, an
            // AI badge, a pasted badge — inside a column that is 86% of a phone
            // screen, and on a single line the last badge is simply cut off.
            display: "flex", alignItems: "center", gap: 5, marginBottom: 3,
            flexWrap: "wrap", rowGap: 2,
            justifyContent: out ? "flex-end" : "flex-start",
            fontSize: 10.5, color: tM,
          }}
        >
          {out ? <Mail size={10} /> : <User size={10} />}
          <span style={{ fontWeight: 700 }}>{out ? "We wrote" : "They wrote"}</span>
          <span title={m.at ? new Date(m.at).toLocaleString("en-IN") : ""}>· {stamp(m.at)}</span>
          {out && m.sent && (
            <span
              title="Accepted by the mail provider. Delivery to their inbox is not tracked."
              style={{ display: "inline-flex", alignItems: "center", gap: 2, color: "#1e7a4b", fontWeight: 700 }}
            >
              <Check size={10} /> sent
            </span>
          )}
          {/* Replies can go out as feedback@ or support@, so "we wrote" alone no
              longer says who the recipient saw. Only shown when recorded:
              messages sent before the choice existed have nothing to show, and
              guessing the default would be a claim rather than a fact. */}
          {out && m.fromAddress && (
            <span title={`Sent from ${m.fromAddress}`} style={{ fontWeight: 600 }}>
              · from {m.fromAddress}
            </span>
          )}
          {m.aiAssisted && (
            <span
              title="Started as a generated draft, then approved by a person before it was sent"
              style={{ display: "inline-flex", alignItems: "center", gap: 2, color: "#a8823a" }}
            >
              <Sparkles size={9} /> AI
            </span>
          )}
          {pasted && (
            <span
              title="Typed in from the mailbox by a super admin — this message did not arrive here on its own"
              style={{ display: "inline-flex", alignItems: "center", gap: 2, color: "#a8823a", fontWeight: 700 }}
            >
              <Clipboard size={9} /> pasted
            </span>
          )}
        </div>

        <div
          style={{
            padding: "9px 12px",
            borderRadius: 14,
            borderBottomRightRadius: out ? 4 : 14,
            borderBottomLeftRadius: out ? 14 : 4,
            background: out ? bg : "#fff",
            border: out ? "none" : `1px solid ${cB}`,
            color: out ? "#f7ece4" : t1,
            fontSize: 13, lineHeight: "20px", whiteSpace: "pre-wrap", wordBreak: "break-word",
          }}
        >
          {full && m.rawBody ? m.rawBody : m.body}
        </div>

        {m.trimmed && m.rawBody && (
          <button
            type="button"
            onClick={() => setFull((v) => !v)}
            style={{
              marginTop: 3, border: "none", background: "none", padding: 0, cursor: "pointer",
              fontSize: 10.5, color: tM, display: "flex", alignItems: "center", gap: 3,
              marginLeft: out ? "auto" : 0,
            }}
          >
            <ChevronDown size={10} style={{ transform: full ? "rotate(180deg)" : "none" }} />
            {full ? "Hide the quoted original" : "Show the full email"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function ConversationThread({
  thread,
  onPaste,
  pasting,
  maxHeight = 360,
  pastePlaceholder = "Paste their reply from the feedback@ mailbox. The quoted original is removed automatically.",
  scrollToEnd = false,
}: {
  thread: Thread;
  /** Absent hides the paste box — the panel decides whether it is offered. */
  onPaste?: (text: string) => void | Promise<void>;
  pasting?: boolean;
  /** Height of the scrolling message area. A chat view wants more. */
  maxHeight?: number | string;
  pastePlaceholder?: string;
  /** Open scrolled to the newest message, as a chat does. */
  scrollToEnd?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollToEnd && scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight;
  }, [scrollToEnd, thread.messages.length]);

  const anyGuessed = thread.messages.some(
    (m) => m.direction === "outbound" && m.confidence === "reconstructed"
  );

  return (
    <div
      style={{
        border: `1px solid ${cB}`, borderRadius: 14, background: "rgba(255,255,255,0.5)",
        padding: 10, marginBottom: 10,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
        <span
          style={{
            fontSize: 10, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase",
            color: "#8b5a2b", background: "rgba(201,168,76,0.18)", border: `1px solid ${g}`,
            padding: "2px 7px", borderRadius: 99,
          }}
        >
          Thread {thread.seq}
        </span>
        <span
          style={{
            flex: 1, minWidth: 0, fontSize: 12, fontWeight: 700, color: t1,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}
          title={thread.subject}
        >
          {thread.subject || "(no subject)"}
        </span>
        <span style={{ fontSize: 10.5, color: tM, flex: "none" }}>
          {thread.messageCount} msg
        </span>
      </div>

      {/* `paddingRight` leaves room for the scrollbar. At 2px the outbound
          bubbles, which sit flush right, were painted underneath it. */}
      <div ref={scroller} style={{ maxHeight, overflowY: "auto", paddingRight: 8, paddingLeft: 2 }}>
        {thread.messages.map((m, i) => (
          <Bubble key={`${thread.id}-${i}`} m={m} />
        ))}
      </div>

      {anyGuessed && !thread.messages.some((m) => m.direction === "inbound") && (
        <p
          style={{
            margin: "6px 0 0", fontSize: 10.5, color: tM, lineHeight: 1.5,
            display: "flex", gap: 5, alignItems: "flex-start",
          }}
        >
          <AlertTriangle size={11} style={{ color: "#a8823a", flex: "none", marginTop: 1 }} />
          <span>
            SES does not tell us the Message-ID it wrote, so replies are threaded by a
            reconstructed id plus the subject line. Once they reply once, it becomes exact.
          </span>
        </p>
      )}

      {onPaste && (
        <div style={{ marginTop: 8, borderTop: `1px solid ${cB}`, paddingTop: 8 }}>
          {open ? (
            <>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={pastePlaceholder}
                rows={4}
                style={{
                  width: "100%", padding: 10, borderRadius: 10, resize: "vertical",
                  border: `1px solid ${cB}`, background: "#fff", fontSize: 16,
                  lineHeight: "21px", color: t1, outline: "none", fontFamily: "inherit",
                }}
              />
              <div style={{ display: "flex", gap: 7, marginTop: 7 }}>
                <button
                  type="button"
                  disabled={text.trim().length < 2 || pasting}
                  onClick={async () => {
                    await onPaste(text.trim());
                    setText("");
                    setOpen(false);
                  }}
                  style={{
                    flex: 1, minHeight: 38, borderRadius: 10, border: "none",
                    background: text.trim().length >= 2 && !pasting ? bg : "rgba(61,12,17,0.12)",
                    color: text.trim().length >= 2 && !pasting ? "#fff" : tM,
                    fontSize: 12.5, fontWeight: 800,
                    cursor: text.trim().length >= 2 && !pasting ? "pointer" : "default",
                  }}
                >
                  {pasting ? "Adding…" : "Add to this conversation"}
                </button>
                <button
                  type="button"
                  onClick={() => { setOpen(false); setText(""); }}
                  style={{
                    minHeight: 38, padding: "0 13px", borderRadius: 10, border: `1px solid ${cB}`,
                    background: "#fff", color: t2, fontSize: 12, fontWeight: 700, cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setOpen(true)}
              style={{
                border: "none", background: "none", padding: 0, cursor: "pointer",
                fontSize: 11.5, color: "#8b5a2b", fontWeight: 700,
                display: "flex", alignItems: "center", gap: 5,
              }}
            >
              <Clipboard size={12} /> Paste a reply they sent
            </button>
          )}
        </div>
      )}
    </div>
  );
}
