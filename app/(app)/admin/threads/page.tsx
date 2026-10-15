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

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { API_URL } from "@/lib/config";
import { isSuperAdmin } from "@/lib/roles";
import { AnimatePresence, motion } from "framer-motion";
import {
  Loader2, Sparkles, Send, X, Mail,
  Inbox, CheckCircle2, AlertTriangle, RefreshCw, UserRound,
} from "lucide-react";
import { A, AdminPage, ChipGroup, EmptyState, Hero, HeroStat, Loading, SearchBox, Tag, rise } from "../adminKit";
import ConversationThread, { type Thread } from "@/components/admin/ConversationThread";
import SenderPicker, { type SenderOption } from "@/components/admin/SenderPicker";
import SortToggle, { type SortOrder } from "@/components/admin/SortToggle";

const OK = "#1f7a4d";
const OFF = "#b3261e";

interface Row extends Thread {
  userName: string;
  userEmail: string;
  templateLabel: string;
  templateType: string;
  pageId: string;
  kind: string;
  /**
   * The account behind this conversation, when there is one.
   *
   * Resolved server-side, and NOT the same thing as the thread's `userId`.
   * An unmatched inbound thread has no userId at all — that is what unmatched
   * means — so the server resolves it from the address instead. It is also ""
   * when the account has since been deleted, because a link built from a dead
   * ref 404s and reads as this panel being broken.
   */
  profileUserId?: string;
}

/**
 * An address a reply may be sent FROM.
 *
 * Sent by the server with the conversation, and identified by `id` — never by
 * address. SES sends only from a verified identity, so which addresses are
 * usable is the server's fact to state, not the panel's to remember. A stale
 * copy here would be a bounced reply.
 */
// The shape itself now lives with the picker that renders it, so the two
// cannot drift: `components/admin/SenderPicker`.

const KIND_META: Record<string, { label: string; color: string; bg: string }> = {
  draft:    { label: "Unfinished page", color: "#a8823a", bg: "rgba(201,168,76,0.16)" },
  feedback: { label: "Feedback",        color: OK,        bg: "rgba(31,122,77,0.10)" },
  inbound:  { label: "Unmatched",       color: OFF,       bg: "rgba(179,38,30,0.10)" },
  influencer: { label: "Influencer",    color: "#6d4ad1", bg: "rgba(109,74,209,0.10)" },
};

const FILTERS = [
  { key: "",         label: "All" },
  { key: "unread",   label: "Needs a reply" },
  { key: "draft",    label: "Unfinished pages" },
  { key: "feedback", label: "Feedback" },
  { key: "influencer", label: "Influencers" },
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
  const [sort, setSort] = useState<SortOrder>("newest");
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
      const q = new URLSearchParams({ limit: "50", sort });
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
  }, [accessToken, allowed, filter, search, sort, hdr]);

  useEffect(() => {
    void load();
    // `search` is submitted with Enter, not on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, allowed, filter, sort]);

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
    return <Loading h={360} />;
  }

  const doneShown = rows.filter((r) => r.status === "closed").length;

  return (
    <AdminPage
      title="Conversations"
      icon={<Inbox size={18} />}
      subtitle="Every email exchange, both directions. Replies land here on their own."
      actions={
        <button type="button" className="adk-btn" onClick={() => void load()} aria-label="Refresh">
          <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      }
    >
      <style>{`
        /* minmax(0,…): a bare 1fr track grows to its widest unbreakable child
           (a long address or subject) and pushes the list off a phone. */
        .th-grid { display: grid; grid-template-columns: minmax(0,1fr); gap: 12px; }
        .th-grid > * { min-width: 0; }
        .th-tools { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; min-width: 0; }
        .th-tools > .adk-chips { flex: 1 1 auto; }
        /* Each conversation is its own card: a stripe in the kind's colour,
           a gold wash while it waits on us, a maroon ring when open. */
        .th-card { position: relative; overflow: hidden; border-radius: 15px; border: 1px solid ${A.edge};
          background: linear-gradient(180deg, #fffdfb, #fff7ef); box-shadow: 0 1px 0 rgba(61,12,17,.03), 0 8px 18px -14px rgba(61,12,17,.35);
          transition: transform .18s, box-shadow .18s, border-color .18s; }
        .th-card::before { content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 4px; background: var(--k); opacity: .85; }
        .th-card:hover { transform: translateY(-2px); border-color: rgba(201,168,76,.55); box-shadow: 0 14px 28px -16px rgba(61,12,17,.5); }
        .th-card[data-unread="1"] { background: linear-gradient(120deg, rgba(255,227,163,.28), #fffdfb 55%); border-color: rgba(201,168,76,.45); }
        .th-card[data-on="1"] { border-color: ${A.maroon}; box-shadow: 0 0 0 1.5px ${A.maroon} inset, 0 14px 28px -16px rgba(61,12,17,.55); }
        .th-card[data-on="1"]::before { background: ${A.maroon}; opacity: 1; }
        .th-row { position: relative; width: 100%; text-align: left; border: none; background: transparent; padding: 12px 12px 12px 16px;
          cursor: pointer; display: flex; gap: 11px; align-items: flex-start; min-width: 0; font: inherit; }
        .th-detail {
          /* 189: above the site BottomNav (z-79, 82px) so Send is reachable. */
          position: fixed; inset: 0; z-index: 189;
          background: #f5ede6; overflow-y: auto;
          padding: 12px 10px calc(82px + env(safe-area-inset-bottom, 0px) + 24px);
        }
        @media (min-width: 980px) {
          .th-grid { grid-template-columns: minmax(0,1fr) minmax(0,470px); align-items: start; }
          .th-detail { position: sticky; inset: auto; top: calc(var(--adm-top) + 8px); z-index: auto; padding: 0; background: transparent;
            max-height: calc(100vh - var(--adm-top) - 16px); border-radius: 16px; scrollbar-width: thin; }
        }
      `}</style>

      <div style={{ overflowX: "clip" }}>
        {/* Counters. Unread is over EVERYTHING, not the filter — a badge that
            changes when you filter is telling you about your filter. */}
        <Hero>
          <div className="adk-hero-grid">
            <HeroStat
              big
              label="Need a reply"
              value={unreadTotal}
              sub={unreadTotal > 0 ? "They wrote last — waiting on us" : "Inbox zero. Nothing waiting."}
            />
            <HeroStat label="Conversations" value={total} />
            <HeroStat label="Showing" value={rows.length} />
            <HeroStat label="Done · shown" value={doneShown} tone="#a8e6c1" />
          </div>
        </Hero>

        <SearchBox
          value={search}
          onChange={setSearch}
          onEnter={() => void load()}
          placeholder="Name, email or subject — press Enter"
          style={{ marginBottom: 8 }}
        />

        <div className="th-tools">
          <ChipGroup
            id="th-filter"
            value={filter}
            onChange={setFilter}
            options={FILTERS.map((f) => ({
              value: f.key as string,
              label: f.label,
              count: f.key === "unread" && unreadTotal > 0 ? unreadTotal : undefined,
            }))}
          />
          {/* ── The words are not "Newest" and "Oldest" here ──────────────────
              This list is ordered by LAST MESSAGE, so a thread opened in March
              that somebody answered an hour ago is at the top. Calling that
              "Newest" would claim the conversation started recently, which is
              exactly what it does not mean — and the other end is not "old
              conversations", it is the ones that have been waiting longest for
              an answer. */}
          <div style={{ flex: "none" }}>
            <SortToggle
              value={sort}
              onChange={setSort}
              labels={{ newest: "Latest reply", oldest: "Waiting longest" }}
              size="sm"
            />
          </div>
        </div>

        {error && (
          <div style={{ marginBottom: 10, padding: 11, borderRadius: 12, background: "rgba(179,38,30,0.07)", border: `1px solid rgba(179,38,30,0.28)` }}>
            <p style={{ margin: 0, fontSize: 12.5, color: "#7a2b26", display: "flex", gap: 6, alignItems: "flex-start", overflowWrap: "anywhere" }}>
              <AlertTriangle size={13} style={{ flex: "none", marginTop: 1 }} /> {error}
            </p>
          </div>
        )}

        <div className="th-grid">
          {/* ── List ─────────────────────────────────────────────────────── */}
          {loading && rows.length === 0 ? (
            <Loading label="Loading conversations…" />
          ) : rows.length === 0 ? (
            <EmptyState
              icon={<Mail size={22} />}
              title="Nothing here yet"
              note="Conversations appear once a follow-up is sent from Drafts, a reply is sent from Feedback, or somebody writes in."
            />
          ) : (
            <div style={{ display: "grid", gap: 8 }}>
              {rows.map((r, i) => {
                const meta = KIND_META[r.kind] || KIND_META.inbound;
                const last = r.messages?.[r.messages.length - 1];
                const name = r.userName || r.userEmail || "Unknown";
                return (
                  // Wrapped so the profile link is a SIBLING of the button. An
                  // <a> inside a <button> is invalid HTML and browsers disagree
                  // on what a click, a Tab and a screen reader do with it;
                  // stopPropagation fixes the mouse and none of the rest.
                  <motion.div
                    key={r.id} {...rise(i)} className="th-card"
                    data-on={sel?.id === r.id ? "1" : "0"} data-unread={r.unread ? "1" : "0"}
                    style={{ ["--k" as string]: meta.color }}
                  >
                  <button
                    type="button" className="th-row" data-on={sel?.id === r.id ? "1" : "0"} onClick={() => void open(r)}
                  >
                    <span aria-hidden style={{
                      position: "relative", width: 34, height: 34, borderRadius: 11, flex: "none",
                      display: "grid", placeItems: "center", fontSize: 13, fontWeight: 800,
                      background: meta.bg, color: meta.color,
                    }}>
                      {name.trim().charAt(0).toUpperCase()}
                      {r.unread && (
                        <span style={{ position: "absolute", top: -2, right: -2, width: 10, height: 10, borderRadius: "50%", background: A.gold, border: `2px solid ${A.paper}` }} />
                      )}
                    </span>
                    <span style={{ flex: 1, minWidth: 0, display: "block" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2, minWidth: 0 }}>
                        {r.unread && <span className="sr-only">Needs a reply</span>}
                        <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, fontWeight: r.unread ? 800 : 700, color: A.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {name}
                        </span>
                        <span style={{ fontSize: 10.5, color: r.unread ? A.goldDeep : A.muted, fontWeight: r.unread ? 800 : 500, flex: "none" }}>{when(r.lastMessageAt)}</span>
                      </span>
                      <span style={{ display: "block", fontSize: 12.5, color: r.unread ? A.ink : A.soft, fontWeight: r.unread ? 700 : 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {r.subject || "(no subject)"}
                      </span>
                      <span style={{ display: "block", margin: "1px 0 5px", fontSize: 11.5, color: A.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {last ? `${last.direction === "outbound" ? "You: " : ""}${last.body}` : ""}
                      </span>
                      <span style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap", paddingRight: r.profileUserId ? 70 : 0 }}>
                        <Tag tone={meta.color} style={{ padding: "2px 7px", fontSize: 9.5, textTransform: "uppercase", letterSpacing: ".04em" }}>{meta.label}</Tag>
                        <span style={{ fontSize: 10.5, color: A.muted }}>{r.messageCount} msg</span>
                        {r.status === "closed" && (
                          <span style={{ fontSize: 10.5, color: OK, display: "inline-flex", alignItems: "center", gap: 3, fontWeight: 700 }}>
                            <CheckCircle2 size={10} /> done
                          </span>
                        )}
                      </span>
                    </span>
                  </button>
                  {/* Bottom-right of the row, clear of the timestamp. */}
                  {r.profileUserId && (
                    <Link
                      href={`/admin/users/${r.profileUserId}`}
                      title={`Open ${r.userName || r.userEmail}'s profile`}
                      aria-label="Open this person's profile"
                      style={{
                        position: "absolute", bottom: 8, right: 10,
                        display: "inline-flex", alignItems: "center", gap: 3,
                        minHeight: 24, padding: "3px 8px", borderRadius: 99,
                        border: `1px solid ${A.edge}`, background: "#fff",
                        fontSize: 10, fontWeight: 800, color: A.goldDeep,
                        textDecoration: "none",
                      }}
                    >
                      <UserRound size={10} /> profile
                    </Link>
                  )}
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* ── Detail + composer ────────────────────────────────────────── */}
          {sel && (
            <motion.div
              key={sel.id}
              className="th-detail"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <div style={{ background: A.paper, border: `1px solid ${A.edge}`, borderRadius: 16, padding: 13, position: "relative", overflow: "hidden" }}>
                <span aria-hidden style={{ position: "absolute", left: 0, right: 0, top: 0, height: 3, background: `linear-gradient(90deg, ${A.maroon}, ${A.gold})` }} />
                {selLoading ? (
                  <Loading h={140} />
                ) : (
                  <>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 11 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 15, fontWeight: 800, color: A.ink, overflowWrap: "anywhere" }}>
                          {sel.userName || "Unknown"}
                        </p>
                        <p style={{ margin: "2px 0 0", fontSize: 12, color: A.soft, display: "flex", alignItems: "center", gap: 5, minWidth: 0, overflowWrap: "anywhere" }}>
                          <Mail size={11} style={{ flex: "none" }} /> {sel.userEmail}
                        </p>
                        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "3px 10px", marginTop: 3 }}>
                          {/* Named, not an icon: this is where you decide what to
                              say to somebody, and their account is the context
                              worth one deliberate click. */}
                          {sel.profileUserId && (
                            <Link
                              href={`/admin/users/${sel.profileUserId}`}
                              style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: A.goldDeep, textDecoration: "none" }}
                            >
                              <UserRound size={12} /> Open their profile
                            </Link>
                          )}
                          {sel.templateLabel && (
                            <Tag tone={A.goldDeep} style={{ maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis" }}>{sel.templateLabel}</Tag>
                          )}
                        </div>
                      </div>
                      <button
                        type="button" className="adk-btn" onClick={() => setSel(null)} aria-label="Close"
                        style={{ width: 34, height: 34, padding: 0, flex: "none" }}
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
                        type="button" className="adk-btn" data-v="gold" onClick={() => void generate()} disabled={drafting}
                        style={{ flex: 1, minWidth: 0, height: 44, fontSize: 13.5 }}
                      >
                        {drafting ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                        {drafting ? "Reading the thread…" : "Draft a reply"}
                      </button>
                      <button
                        type="button"
                        className="adk-btn"
                        onClick={() => void setStatus(sel.status === "closed" ? "open" : "closed")}
                        title={sel.status === "closed" ? "Reopen" : "Mark done"}
                        style={{ height: 44, flex: "none", color: sel.status === "closed" ? OK : A.soft }}
                      >
                        <CheckCircle2 size={14} /> {sel.status === "closed" ? "Done" : "Mark done"}
                      </button>
                    </div>

                    {/* What the model thought it was answering. Shown, never
                        sent — the quickest way to spot a draft that has
                        answered the wrong question. */}
                    <AnimatePresence>
                      {reading && (
                        <motion.div
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          style={{ marginBottom: 9, padding: "9px 11px", borderRadius: 11, background: "rgba(201,168,76,0.09)", border: `1px solid rgba(201,168,76,0.3)` }}
                        >
                          <p style={{ margin: 0, fontSize: 10.5, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", color: A.goldDeep }}>
                            What the AI understood
                          </p>
                          <p style={{ margin: "3px 0 0", fontSize: 12.5, color: A.soft, lineHeight: 1.5, overflowWrap: "anywhere" }}>{reading}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Who this comes from, and where it comes back to. Both
                        lines are the picker's own job now — it is shared with
                        the unfinished-drafts composer, which needs exactly the
                        same control, and two copies of a control that decides
                        what a customer sees in their inbox is how the two
                        quietly drift apart. */}
                    <SenderPicker
                      options={senders}
                      value={senderId}
                      onChange={setSenderId}
                      replyToAddress={replyToAddress}
                    />

                    <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="Your reply. It goes into this same thread, so they see one conversation."
                      rows={9}
                      className="adk-input"
                      style={{ padding: 12, resize: "vertical", fontSize: 16, lineHeight: "23px", fontFamily: "inherit" }}
                    />

                    <button
                      type="button" className="adk-btn" data-v="primary" onClick={() => void send()} disabled={!canSend}
                      style={{ width: "100%", height: 46, marginTop: 10, fontSize: 14.5 }}
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
                      <p style={{ margin: "9px 0 0", fontSize: 11.5, color: A.muted, lineHeight: 1.5 }}>
                        This started as a generated draft that read the whole conversation. Read it
                        before sending. It cannot promise a refund, a discount or a date — the server
                        throws the draft away if it tries — but it can still be wrong about tone.
                      </p>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 12, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 12, x: "-50%" }}
            style={{
              position: "fixed", bottom: "calc(82px + env(safe-area-inset-bottom, 0px) + 14px)",
              left: "50%", zIndex: 200,
              padding: "11px 18px", borderRadius: 99, background: A.maroon, color: "#f5ede6",
              fontSize: 13, fontWeight: 600, boxShadow: "0 10px 30px -10px rgba(26,5,7,0.6)",
              maxWidth: "90vw", textAlign: "center",
            }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </AdminPage>
  );
}
