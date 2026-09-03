"use client";

// ─── /admin/threads — every email conversation, both directions ─────────────
//
// The feedback panel shows ratings. The drafts panel shows unpublished pages.
// Neither answers the question a person actually has at 9am: "who has written
// to us, and what have we not answered?"
//
// This does. One list, newest activity first, across all three kinds:
//
//   · draft    — we wrote about an unfinished page, and they replied
//   · feedback — they rated a page, we answered, they came back
//   · inbound  — somebody wrote to feedback@ and nothing matched
//
// ── WHY UNREAD IS THE DEFAULT SORT SIGNAL, NOT A FILTER ────────────────────
//
// A conversation is unread when THEY sent the last message. That is the only
// state that needs a human, so it is a badge on the row and a count in the
// header — not something you have to switch a filter on to discover.
//
// ── THE AI BUTTON ───────────────────────────────────────────────────────────
//
// "Draft a reply" sends the WHOLE conversation to the model and fills the
// composer. It does not send. Generate and send are two routes on the server
// and two clicks here, for the same reason as the other two panels: the input
// is text a member of the public typed, and a model that invents a refund
// would be making a promise in the company's name with nobody having read it.
//
// The model also returns a `reading` — one sentence on what it understood the
// person to be asking. It is shown and never sent, because the fastest way to
// catch a draft that answers the wrong question is to see the question it
// thought it was answering.

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { API_URL } from "@/lib/config";
import { isSuperAdmin } from "@/lib/roles";
import {
  ArrowLeft, Loader2, Sparkles, Send, X, Mail, Search,
  Inbox, CheckCircle2, AlertTriangle, MessageSquare, RefreshCw,
} from "lucide-react";
import ConversationThread, { type Thread } from "@/components/admin/ConversationThread";

const t1 = "#2a0a0e";
const t2 = "#7f5f5f";
const tM = "#9a7070";
const g = "#c9a84c";
const bg = "#3d0c11";
const cB = "rgba(61,12,17,0.08)";
const OK = "#1f7a4d";
const OFF = "#b3261e";

interface Row extends Thread {
  userName: string;
  userEmail: string;
  templateLabel: string;
  templateType: string;
  pageId: string;
  kind: string;
}

/**
 * An address a reply may be sent FROM.
 *
 * Sent by the server with the conversation, and identified by `id` — never by
 * address. SES sends only from a verified identity, so which addresses are
 * usable is the server's fact to state, not the panel's to remember. A stale
 * copy here would be a bounced reply.
 */
interface SenderOption {
  id: string;
  address: string;
  label: string;
  description: string;
  isDefault?: boolean;
}

const KIND_META: Record<string, { label: string; color: string; bg: string }> = {
  draft:    { label: "Unfinished page", color: "#a8823a", bg: "rgba(201,168,76,0.16)" },
  feedback: { label: "Feedback",        color: OK,        bg: "rgba(31,122,77,0.10)" },
  inbound:  { label: "Unmatched",       color: OFF,       bg: "rgba(179,38,30,0.10)" },
};

const FILTERS = [
  { key: "",         label: "All" },
  { key: "unread",   label: "Needs a reply" },
  { key: "draft",    label: "Unfinished pages" },
  { key: "feedback", label: "Feedback" },
  { key: "inbound",  label: "Unmatched" },
] as const;

function when(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.round(mins / 60)}h ago`;
  if (mins < 43200) return `${Math.round(mins / 1440)}d ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function AdminThreadsPage() {
  const router = useRouter();
  const { user, accessToken, isLoading } = useAppSelector((s) => s.auth);

  const [allowed, setAllowed] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<string>("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const [sel, setSel] = useState<Row | null>(null);
  const [selLoading, setSelLoading] = useState(false);
  const [body, setBody] = useState("");
  const [reading, setReading] = useState<string | null>(null);
  const [aiAssisted, setAiAssisted] = useState(false);
  const [senders, setSenders] = useState<SenderOption[]>([]);
  const [senderId, setSenderId] = useState("");
  /** Where replies to this conversation come back to. Fixed, shown, not chosen. */
  const [replyToAddress, setReplyToAddress] = useState("");
  const [drafting, setDrafting] = useState(false);
  const [sending, setSending] = useState(false);
  const [pasting, setPasting] = useState(false);

  const hdr = useCallback(
    () => ({ "Content-Type": "application/json", Authorization: `Bearer ${accessToken}` }),
    [accessToken]
  );

  const say = useCallback((m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 3000);
  }, []);

  // Same guard the other admin pages use: wait for auth to resolve, then
  // check the ROLE. Passing the whole user object silently never matches.
  useEffect(() => {
    if (isLoading || !user) return;
    if (!isSuperAdmin(user.role)) {
      router.replace("/admin/analytics");
      return;
    }
    setAllowed(true);
  }, [user, isLoading, router]);

  const load = useCallback(async () => {
    if (!accessToken || !allowed) return;
    setLoading(true);
    setError(null);
    try {
      const q = new URLSearchParams({ limit: "50" });
      if (filter === "unread") q.set("unread", "1");
      else if (filter) q.set("kind", filter);
      if (search.trim()) q.set("q", search.trim());
      const res = await fetch(`${API_URL}/admin/threads?${q}`, { headers: hdr() });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Could not load conversations");
      setRows(json.data.threads || []);
      setUnreadTotal(json.data.unreadTotal || 0);
      setTotal(json.data.total || 0);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load conversations");
    } finally {
      setLoading(false);
    }
  }, [accessToken, allowed, filter, search, hdr]);

  useEffect(() => {
    void load();
    // `search` is submitted with Enter, not on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, allowed, filter]);

  /**
   * Take the sender facts off a conversation response.
   *
   * They sit beside `data` rather than inside it because they describe this
   * deployment, not this conversation. Selecting the default here rather than
   * leaving it blank means the composer always names an address — a picker
   * whose value is "" would send from the default anyway and say nothing about
   * it, which is the state this whole change exists to remove.
   */
  const applySenders = (json: { senderOptions?: SenderOption[]; replyToAddress?: string }) => {
    const options = Array.isArray(json.senderOptions) ? json.senderOptions : [];
    setSenders(options);
    setReplyToAddress(String(json.replyToAddress || ""));
    setSenderId((options.find((o) => o.isDefault) || options[0])?.id || "");
  };

  const open = async (row: Row) => {
    setSelLoading(true);
    setBody("");
    setReading(null);
    setAiAssisted(false);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/admin/threads/${row.id}`, { headers: hdr() });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Could not open it");
      setSel(json.data);
      applySenders(json);
      // Opening marks it read on the server; mirror that here so the badge
      // does not keep claiming attention for something just dealt with.
      setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, unread: false } : r)));
      setUnreadTotal((n) => (row.unread ? Math.max(0, n - 1) : n));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not open it");
    } finally {
      setSelLoading(false);
    }
  };

  const reopen = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/admin/threads/${id}`, { headers: hdr() });
      const json = await res.json();
      if (res.ok && json.success) {
        setSel(json.data);
        applySenders(json);
      }
    } catch { /* a stale view is a refresh away */ }
  };

  const generate = async () => {
    if (!sel || drafting) return;
    setDrafting(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/admin/threads/${sel.id}/draft-reply`, {
        method: "POST", headers: hdr(),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Could not draft a reply");
      setBody(json.data.body || "");
      setReading(json.data.reading || null);
      setAiAssisted(true);
      say("Draft ready — read it before sending");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not draft a reply");
    } finally {
      setDrafting(false);
    }
  };

  const send = async () => {
    if (!sel || sending || body.trim().length < 20) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/admin/threads/${sel.id}/reply`, {
        method: "POST", headers: hdr(),
        body: JSON.stringify({ body: body.trim(), aiAssisted, senderId }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Could not send");
      setBody("");
      setReading(null);
      setAiAssisted(false);
      say(json.message || "Sent");
      await reopen(sel.id);
      void load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send");
    } finally {
      setSending(false);
    }
  };

  const pasteReply = async (text: string) => {
    if (!sel || pasting) return;
    setPasting(true);
    try {
      const res = await fetch(`${API_URL}/admin/threads/${sel.id}/inbound`, {
        method: "POST", headers: hdr(), body: JSON.stringify({ text }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Could not add it");
      await reopen(sel.id);
      say("Added to the conversation");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not add it");
    } finally {
      setPasting(false);
    }
  };

  const setStatus = async (status: "open" | "closed") => {
    if (!sel) return;
    try {
      const res = await fetch(`${API_URL}/admin/threads/${sel.id}`, {
        method: "PATCH", headers: hdr(), body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setSel({ ...sel, status });
        setRows((prev) => prev.map((r) => (r.id === sel.id ? { ...r, status } : r)));
        say(status === "closed" ? "Marked done" : "Reopened");
      }
    } catch { /* non-fatal */ }
  };

  const canSend = body.trim().length >= 20 && !sending;

  if (!allowed) {
    return (
      <div style={{ minHeight: "60vh", display: "grid", placeItems: "center", background: "#f5ede6" }}>
        <Loader2 size={22} className="animate-spin" style={{ color: g }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5ede6", paddingBottom: 90 }}>
      <style>{`
        .th-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
        @media (min-width: 980px) {
          .th-grid { grid-template-columns: minmax(0,1fr) minmax(0,470px); align-items: start; }
          .th-detail { position: sticky; top: 16px; }
        }
        .th-detail {
          position: fixed; inset: 0; z-index: 189;
          background: #f5ede6; overflow-y: auto;
          padding: 14px 10px calc(82px + env(safe-area-inset-bottom, 0px) + 24px);
        }
        @media (min-width: 980px) {
          .th-detail { position: sticky; inset: auto; padding: 0; background: transparent; z-index: auto; }
        }
        .th-row:hover { background: rgba(201,168,76,0.07); }
      `}</style>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "14px 12px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <Link href="/admin/analytics" style={{ display: "grid", placeItems: "center", width: 36, height: 36, borderRadius: 11, background: "#fffdfb", border: `1px solid ${cB}`, color: t2 }}>
            <ArrowLeft size={16} />
          </Link>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ margin: 0, fontSize: 19, fontWeight: 800, color: t1, letterSpacing: "-0.01em" }}>
              Conversations
            </h1>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: tM }}>
              Every email exchange, both directions. Replies land here on their own.
            </p>
          </div>
          <button
            type="button" onClick={() => void load()}
            aria-label="Refresh"
            style={{ display: "grid", placeItems: "center", width: 36, height: 36, borderRadius: 11, background: "#fffdfb", border: `1px solid ${cB}`, color: t2, cursor: "pointer" }}
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Counters. Unread is over EVERYTHING, not the filter — a badge that
            changes when you filter is telling you about your filter. */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          {[
            { icon: <Inbox size={13} />, label: "Conversations", value: total },
            { icon: <MessageSquare size={13} />, label: "Need a reply", value: unreadTotal, hot: unreadTotal > 0 },
          ].map((s) => (
            <div key={s.label} style={{
              flex: "1 1 150px", padding: "9px 12px", borderRadius: 13,
              background: s.hot ? "rgba(201,168,76,0.14)" : "#fffdfb",
              border: `1px solid ${s.hot ? g : cB}`,
            }}>
              <p style={{ margin: 0, fontSize: 10.5, color: tM, display: "flex", alignItems: "center", gap: 5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {s.icon} {s.label}
              </p>
              <p style={{ margin: "3px 0 0", fontSize: 21, fontWeight: 800, color: s.hot ? "#8b5a2b" : t1 }}>{s.value}</p>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 7, marginBottom: 10, flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: "1 1 190px", minWidth: 0 }}>
            <Search size={13} style={{ position: "absolute", left: 10, top: 15, color: tM }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") void load(); }}
              placeholder="Name, email or subject"
              style={{
                width: "100%", height: 42, paddingLeft: 30, paddingRight: 10, borderRadius: 12,
                border: `1px solid ${cB}`, background: "#fffdfb", fontSize: 16, color: t1, outline: "none",
              }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 6, marginBottom: 12, overflowX: "auto", paddingBottom: 2 }}>
          {FILTERS.map((f) => {
            const on = filter === f.key;
            return (
              <button
                key={f.key || "all"} type="button" onClick={() => setFilter(f.key)}
                style={{
                  flex: "none", minHeight: 34, padding: "0 13px", borderRadius: 99,
                  border: `1px solid ${on ? bg : cB}`,
                  background: on ? bg : "#fffdfb",
                  color: on ? "#f5ede6" : t2,
                  fontSize: 12.5, fontWeight: on ? 700 : 600, cursor: "pointer", whiteSpace: "nowrap",
                }}
              >
                {f.label}
                {f.key === "unread" && unreadTotal > 0 ? ` (${unreadTotal})` : ""}
              </button>
            );
          })}
        </div>

        {error && (
          <div style={{ marginBottom: 10, padding: 11, borderRadius: 12, background: "rgba(179,38,30,0.07)", border: `1px solid rgba(179,38,30,0.28)` }}>
            <p style={{ margin: 0, fontSize: 12.5, color: "#7a2b26", display: "flex", gap: 6, alignItems: "flex-start" }}>
              <AlertTriangle size={13} style={{ flex: "none", marginTop: 1 }} /> {error}
            </p>
          </div>
        )}

        <div className="th-grid">
          {/* ── List ─────────────────────────────────────────────────────── */}
          <div style={{ background: "#fffdfb", border: `1px solid ${cB}`, borderRadius: 16, overflow: "hidden" }}>
            {loading && rows.length === 0 ? (
              <div style={{ padding: 40, display: "grid", placeItems: "center" }}>
                <Loader2 size={20} className="animate-spin" style={{ color: g }} />
              </div>
            ) : rows.length === 0 ? (
              <div style={{ padding: "36px 20px", textAlign: "center" }}>
                <Mail size={26} style={{ color: tM, marginBottom: 8 }} />
                <p style={{ margin: 0, fontSize: 13.5, color: t2, fontWeight: 700 }}>Nothing here yet</p>
                <p style={{ margin: "5px 0 0", fontSize: 12, color: tM, lineHeight: 1.55 }}>
                  Conversations appear once a follow-up is sent from Drafts, a reply
                  is sent from Feedback, or somebody writes in.
                </p>
              </div>
            ) : (
              rows.map((r, i) => {
                const meta = KIND_META[r.kind] || KIND_META.inbound;
                const last = r.messages?.[r.messages.length - 1];
                return (
                  <button
                    key={r.id} type="button" className="th-row" onClick={() => void open(r)}
                    style={{
                      width: "100%", textAlign: "left", border: "none", background: sel?.id === r.id ? "rgba(201,168,76,0.10)" : "transparent",
                      borderTop: i === 0 ? "none" : `1px solid ${cB}`,
                      padding: "12px 13px", cursor: "pointer", display: "block",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4 }}>
                      {r.unread && (
                        <span aria-label="Needs a reply" style={{ width: 8, height: 8, borderRadius: "50%", background: g, flex: "none" }} />
                      )}
                      <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: r.unread ? 800 : 700, color: t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {r.userName || r.userEmail || "Unknown"}
                      </span>
                      <span style={{ fontSize: 10.5, color: tM, flex: "none" }}>{when(r.lastMessageAt)}</span>
                    </div>
                    <p style={{ margin: "0 0 4px", fontSize: 12.5, color: t2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {r.subject || "(no subject)"}
                    </p>
                    <p style={{ margin: "0 0 6px", fontSize: 11.5, color: tM, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {last ? `${last.direction === "outbound" ? "You: " : ""}${last.body}` : ""}
                    </p>
                    <div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                      <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.04em", textTransform: "uppercase", color: meta.color, background: meta.bg, padding: "2px 7px", borderRadius: 99 }}>
                        {meta.label}
                      </span>
                      <span style={{ fontSize: 10.5, color: tM }}>{r.messageCount} msg</span>
                      {r.status === "closed" && (
                        <span style={{ fontSize: 10.5, color: OK, display: "inline-flex", alignItems: "center", gap: 3 }}>
                          <CheckCircle2 size={10} /> done
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* ── Detail + composer ────────────────────────────────────────── */}
          {sel && (
            <div className="th-detail">
              <div style={{ background: "#fffdfb", border: `1px solid ${cB}`, borderRadius: 16, padding: 13 }}>
                {selLoading ? (
                  <div style={{ padding: 30, display: "grid", placeItems: "center" }}>
                    <Loader2 size={19} className="animate-spin" style={{ color: g }} />
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 11 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: t1 }}>
                          {sel.userName || "Unknown"}
                        </p>
                        <p style={{ margin: "2px 0 0", fontSize: 12, color: t2, display: "flex", alignItems: "center", gap: 5 }}>
                          <Mail size={11} /> {sel.userEmail}
                        </p>
                        {sel.templateLabel && (
                          <p style={{ margin: "2px 0 0", fontSize: 11.5, color: tM }}>{sel.templateLabel}</p>
                        )}
                      </div>
                      <button
                        type="button" onClick={() => setSel(null)} aria-label="Close"
                        style={{ display: "grid", placeItems: "center", width: 32, height: 32, borderRadius: 10, border: `1px solid ${cB}`, background: "#fff", color: t2, cursor: "pointer", flex: "none" }}
                      >
                        <X size={15} />
                      </button>
                    </div>

                    <ConversationThread
                      thread={sel}
                      pasting={pasting}
                      onPaste={pasteReply}
                    />

                    <div style={{ display: "flex", gap: 7, marginBottom: 10 }}>
                      <button
                        type="button" onClick={() => void generate()} disabled={drafting}
                        style={{
                          flex: 1, minHeight: 44, borderRadius: 12,
                          border: `1px solid ${g}`, background: "rgba(201,168,76,0.14)", color: "#8b5a2b",
                          fontSize: 13.5, fontWeight: 700, display: "flex", alignItems: "center",
                          justifyContent: "center", gap: 7, cursor: drafting ? "default" : "pointer",
                        }}
                      >
                        {drafting ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                        {drafting ? "Reading the thread…" : "Draft a reply"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void setStatus(sel.status === "closed" ? "open" : "closed")}
                        title={sel.status === "closed" ? "Reopen" : "Mark done"}
                        style={{
                          minHeight: 44, padding: "0 13px", borderRadius: 12,
                          border: `1px solid ${cB}`, background: "#fff",
                          color: sel.status === "closed" ? OK : t2,
                          fontSize: 12.5, fontWeight: 700, cursor: "pointer", flex: "none",
                          display: "flex", alignItems: "center", gap: 5,
                        }}
                      >
                        <CheckCircle2 size={14} /> {sel.status === "closed" ? "Done" : "Mark done"}
                      </button>
                    </div>

                    {/* What the model thought it was answering. Shown, never
                        sent — the quickest way to spot a draft that has
                        answered the wrong question. */}
                    {reading && (
                      <div style={{ marginBottom: 9, padding: "9px 11px", borderRadius: 11, background: "rgba(61,12,17,0.04)", border: `1px solid ${cB}` }}>
                        <p style={{ margin: 0, fontSize: 10.5, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", color: tM }}>
                          What the AI understood
                        </p>
                        <p style={{ margin: "3px 0 0", fontSize: 12.5, color: t2, lineHeight: 1.5 }}>{reading}</p>
                      </div>
                    )}

                    {/* ── Who this comes from, and where it comes back to ────────
                        The composer used to say nothing about either. A super
                        admin wrote a reply, sent it, and found out which
                        address it left from by checking their own inbox.

                        Both lines are here on purpose. From is a choice; Reply-To
                        is NOT, and showing them together is the only way that
                        reads as deliberate rather than broken — apex mail is
                        GoDaddy's, so a reply sent back to feedback@ never
                        reaches this panel. Only reply.subhsandesh.in does. */}
                    {senders.length > 0 && (
                      <div style={{ marginBottom: 10 }}>
                        <p style={{ margin: "0 0 6px", fontSize: 10.5, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", color: tM }}>
                          Send as
                        </p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {senders.map((o) => {
                            const on = o.id === senderId;
                            return (
                              <button
                                key={o.id}
                                type="button"
                                onClick={() => setSenderId(o.id)}
                                title={o.description}
                                aria-pressed={on}
                                style={{
                                  padding: "7px 11px", borderRadius: 999, cursor: "pointer",
                                  border: `1px solid ${on ? bg : cB}`,
                                  background: on ? bg : "#fff",
                                  color: on ? "#fff" : t2,
                                  fontSize: 12.5, fontWeight: 700, fontFamily: "inherit",
                                  display: "flex", alignItems: "center", gap: 6,
                                }}
                              >
                                {o.label}
                                <span style={{ fontSize: 11, fontWeight: 600, opacity: on ? 0.75 : 0.6 }}>
                                  {o.address}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        {/* The chosen option's own sentence, so the choice is
                            explained at the moment it is made rather than in a
                            tooltip nobody hovers on a phone. */}
                        {senders.find((o) => o.id === senderId)?.description && (
                          <p style={{ margin: "7px 0 0", fontSize: 11.5, color: tM, lineHeight: 1.5 }}>
                            {senders.find((o) => o.id === senderId)?.description}
                          </p>
                        )}

                        {replyToAddress && (
                          <p style={{ margin: "6px 0 0", fontSize: 11.5, color: tM, lineHeight: 1.5 }}>
                            Their reply comes back to{" "}
                            <span style={{ fontWeight: 700, color: t2 }}>{replyToAddress}</span>{" "}
                            whichever address you send as — that is the only one this panel can read.
                          </p>
                        )}
                      </div>
                    )}

                    <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="Your reply. It goes into this same thread, so they see one conversation."
                      rows={9}
                      style={{
                        width: "100%", padding: 12, borderRadius: 12, resize: "vertical",
                        border: `1px solid ${cB}`, background: "#fff", fontSize: 16,
                        lineHeight: "23px", color: t1, outline: "none", fontFamily: "inherit",
                      }}
                    />

                    <button
                      type="button" onClick={() => void send()} disabled={!canSend}
                      style={{
                        width: "100%", minHeight: 46, borderRadius: 12, marginTop: 10, border: "none",
                        background: canSend ? "linear-gradient(135deg,#3d0c11,#5a1620)" : "rgba(61,12,17,0.12)",
                        color: canSend ? "#fff" : tM,
                        fontSize: 14.5, fontWeight: 800, display: "flex", alignItems: "center",
                        justifyContent: "center", gap: 7, cursor: canSend ? "pointer" : "default",
                      }}
                    >
                      {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                      {sending ? "Sending" : "Reply in this thread"}
                    </button>

                    {body.trim().length > 0 && body.trim().length < 20 && (
                      <p style={{ margin: "8px 0 0", fontSize: 11.5, color: OFF }}>
                        A little longer before this can go out.
                      </p>
                    )}

                    {aiAssisted && (
                      <p style={{ margin: "9px 0 0", fontSize: 11.5, color: tM, lineHeight: 1.5 }}>
                        This started as a generated draft that read the whole conversation. Read it
                        before sending. It cannot promise a refund, a discount or a date — the server
                        throws the draft away if it tries — but it can still be wrong about tone.
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div style={{
          position: "fixed", bottom: "calc(82px + env(safe-area-inset-bottom, 0px) + 14px)",
          left: "50%", transform: "translateX(-50%)", zIndex: 200,
          padding: "11px 18px", borderRadius: 99, background: bg, color: "#f5ede6",
          fontSize: 13, fontWeight: 600, boxShadow: "0 10px 30px -10px rgba(26,5,7,0.6)",
          maxWidth: "90vw", textAlign: "center",
        }}>
          {toast}
        </div>
      )}
    </div>
  );
}
