"use client";

import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAppSelector } from "@/store/hooks";
import { API_URL } from "@/lib/config";
import {
  MessageSquare, ChevronLeft, ChevronRight,
  X, Mail, Phone, Clock, Check, Circle, Trash2, StickyNote, Eye, EyeOff, Send, Sparkles, Loader2,
} from "lucide-react";
import Link from "next/link";
import SortToggle, { type SortOrder } from "@/components/admin/SortToggle";
import { A, AdminPage, Hero, HeroStat, ChipGroup, Loading, EmptyState, Tag, rise } from "../adminKit";

interface IReply { body: string; sentAt: string; }
interface ContactItem {
  _id: string; name: string; email: string; phone?: string; message: string;
  isRead: boolean; adminNotes?: string; createdAt: string; replies?: IReply[];
}
interface Pg { page: number; limit: number; total: number; totalPages: number }
/** What the AI draft was based on — shown so a human can sanity-check it. */
interface AiInfo {
  reading?: string;
  hasAccount: boolean;
  userId: string | null;
  likelyTemplate: string | null;
  pages: { templateLabel: string; isPublished: boolean; access: string; createdAt: string }[];
}

const cB = "rgba(61,12,17,0.08)";
const t1 = "#2a0a0e";
const t2 = "#7f5f5f";
const tM = "#9a7070";
const g = "#c9a84c";
const gD = "#8b5a2b";
const bg = "#3d0c11";

export default function AdminContactsPage() {
  const { accessToken } = useAppSelector((s) => s.auth);
  const [items, setItems] = useState<ContactItem[]>([]);
  const [pg, setPg] = useState<Pg>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState<SortOrder>("newest");
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sel, setSel] = useState<ContactItem | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [replyBody, setReplyBody] = useState("");
  const [replySubject, setReplySubject] = useState("");
  const [replying, setReplying] = useState(false);
  // AI draft state. `aiAssisted` travels with the send so the record says the
  // body began as a draft — a human still reads, edits and presses Send.
  const [aiBusy, setAiBusy] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiInfo, setAiInfo] = useState<AiInfo | null>(null);
  const [aiAssisted, setAiAssisted] = useState(false);

  const hdr = useCallback(() => ({ Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }), [accessToken]);

  const fetchItems = useCallback(async (page = 1) => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const p = new URLSearchParams({ page: String(page), limit: "20", filter, sort });
      const res = await fetch(`${API_URL}/admin/contacts?${p}`, { headers: hdr() });
      const data = await res.json();
      if (data.success) {
        const list: ContactItem[] = data.data.items;
        setItems(list);
        setPg(data.data.pagination);
        setUnread(data.data.unreadCount);
        // Desktop shows list + detail side by side, so open the first message
        // instead of an empty "pick one" panel. Not marked read: opening it
        // automatically is not the same as somebody reading it. Phones keep
        // the list first, where the detail would cover it.
        if (typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches) {
          setSel((prev) => {
            if (prev && list.some((i) => i._id === prev._id)) return prev;
            const first = list[0] ?? null;
            setNotes(first?.adminNotes || "");
            setReplyBody("");
            setReplySubject("");
            setAiInfo(null);
            setAiError(null);
            setAiAssisted(false);
            return first;
          });
        }
      }
    } finally { setLoading(false); }
  }, [accessToken, filter, sort, hdr]);

  useEffect(() => { fetchItems(1); }, [fetchItems]);

  const toggleRead = async (item: ContactItem) => {
    const res = await fetch(`${API_URL}/admin/contacts/${item._id}/read`, {
      method: "PATCH", headers: hdr(), body: JSON.stringify({ isRead: !item.isRead }),
    });
    const data = await res.json();
    if (data.success) {
      setItems((prev) => prev.map((i) => (i._id === item._id ? { ...i, isRead: !item.isRead } : i)));
      setUnread((c) => item.isRead ? c + 1 : c - 1);
      if (sel?._id === item._id) setSel({ ...sel, isRead: !item.isRead });
    }
  };

  const saveNotes = async () => {
    if (!sel) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/admin/contacts/${sel._id}/notes`, {
        method: "PATCH", headers: hdr(), body: JSON.stringify({ adminNotes: notes }),
      });
      const data = await res.json();
      if (data.success) {
        setItems((prev) => prev.map((i) => (i._id === sel._id ? { ...i, adminNotes: notes } : i)));
        setSel({ ...sel, adminNotes: notes });
      }
    } finally { setSaving(false); }
  };

  const deleteItem = async (id: string) => {
    if (!confirm("Delete this inquiry?")) return;
    const res = await fetch(`${API_URL}/admin/contacts/${id}`, { method: "DELETE", headers: hdr() });
    const data = await res.json();
    if (data.success) {
      setItems((prev) => prev.filter((i) => i._id !== id));
      if (sel?._id === id) setSel(null);
      setPg((p) => ({ ...p, total: p.total - 1 }));
    }
  };

  const sendReply = async () => {
    if (!sel || !replyBody.trim()) return;
    setReplying(true);
    try {
      const res = await fetch(`${API_URL}/admin/contacts/${sel._id}/reply`, {
        method: "POST",
        headers: hdr(),
        body: JSON.stringify({ body: replyBody.trim(), subject: replySubject.trim() || undefined, aiAssisted }),
      });
      const data = await res.json();
      if (data.success) {
        const updated = { ...sel, isRead: true, replies: data.data.replies };
        setSel(updated);
        setItems((prev) => prev.map((i) => i._id === sel._id ? updated : i));
        setReplyBody("");
        setReplySubject("");
        setAiInfo(null);
        setAiAssisted(false);
      } else {
        alert(data.error || "Failed to send reply");
      }
    } finally { setReplying(false); }
  };

  /** Ask the server for a reply written from this person's whole context. */
  const draftWithAi = async () => {
    if (!sel || aiBusy) return;
    if (replyBody.trim() && !confirm("Replace what you have written with an AI draft?")) return;
    setAiBusy(true);
    setAiError(null);
    try {
      const res = await fetch(`${API_URL}/admin/contacts/${sel._id}/draft-reply`, { method: "POST", headers: hdr() });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Could not draft a reply");
      setReplyBody(data.data.body);
      setReplySubject(data.data.subject || "");
      setAiInfo({ reading: data.data.reading, ...data.data.context });
      setAiAssisted(true);
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "Could not draft a reply");
    } finally {
      setAiBusy(false);
    }
  };

  const openDetail = (item: ContactItem) => {
    setSel(item);
    setNotes(item.adminNotes || "");
    setReplyBody("");
    setReplySubject("");
    setAiInfo(null);
    setAiError(null);
    setAiAssisted(false);
    if (!item.isRead) toggleRead(item);
  };

  const timeAgo = (d: string) => {
    const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
    if (s < 60) return "just now";
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  };

  const replied = items.filter((i) => (i.replies?.length ?? 0) > 0).length;
  const withNotes = items.filter((i) => !!i.adminNotes).length;
  const awaiting = items.filter((i) => !(i.replies?.length)).length;

  return (
    <AdminPage
      title="Contact inquiries"
      subtitle="Messages from the contact form — read, reply by email, keep private notes."
      icon={<MessageSquare size={18} />}
    >
      <style>{`
        .c-layout { display: grid; grid-template-columns: minmax(0,1fr); gap: 12px; align-items: start; }
        @media (min-width: 1024px) { .c-layout { grid-template-columns: minmax(0,1fr) minmax(0,440px); } }
        .c-list { display: flex; flex-direction: column; gap: 7px; min-width: 0; }
        .c-card { display: flex; align-items: flex-start; gap: 10px; cursor: pointer; }
        .c-card[data-unread="1"] { background: #fff; border-color: rgba(201,168,76,.45); }
        .c-card[data-unread="1"]::before { content: ""; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: ${g}; }
        .c-act { width: 30px; height: 30px; padding: 0; border-radius: 9px; }
        .c-side { display: none; min-width: 0; }
        .c-side[data-open="1"] { display: block; position: fixed; inset: 0; z-index: 190; overflow-y: auto; overscroll-behavior: contain;
          background: linear-gradient(180deg,#fffdfb 0%,#f5ede6 100%); padding: 14px 14px calc(28px + env(safe-area-inset-bottom)); }
        @media (min-width: 1024px) {
          .c-side, .c-side[data-open="1"] { display: block; position: sticky; top: calc(var(--adm-top) + 8px); inset: auto; z-index: 1;
            max-height: calc(100dvh - var(--adm-top) - 24px); overflow-y: auto; padding: 16px; border-radius: 18px;
            background: ${A.card}; border: 1px solid ${cB}; backdrop-filter: blur(8px); }
        }
        .c-ph { display: grid; place-items: center; min-height: 260px; text-align: center; color: ${tM}; font-size: 12.5px; }
        .c-sec { font-size: 10px; font-weight: 800; color: ${tM}; letter-spacing: .1em; text-transform: uppercase; margin: 0 0 8px; display: flex; align-items: center; gap: 5px; }
        .c-ta { resize: vertical; font-family: inherit; line-height: 1.55; }
        .c-compose { margin-bottom: 14px; padding: 12px; border-radius: 14px; background: rgba(255,255,255,0.75); border: 1px solid ${cB}; display: grid; gap: 8px; }
        .c-compose-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
        .c-ai-btn { display: inline-flex; align-items: center; gap: 6px; height: 32px; padding: 0 12px; border-radius: 99px; border: 1px solid rgba(201,168,76,.55); background: linear-gradient(135deg, rgba(201,168,76,.18), rgba(201,168,76,.06)); color: ${gD}; font-weight: 800; font-size: 12px; cursor: pointer; transition: transform .15s, box-shadow .2s; }
        .c-ai-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 14px -8px rgba(139,90,43,.6); }
        .c-ai-btn:disabled { opacity: .7; cursor: wait; }
        .c-spin { animation: c-spin 1s linear infinite; }
        @keyframes c-spin { to { transform: rotate(360deg); } }
        .c-ai-wait { font-size: 12px; color: ${t2}; padding: 8px 10px; border-radius: 10px; background: linear-gradient(90deg, rgba(201,168,76,.08), rgba(201,168,76,.18), rgba(201,168,76,.08)); background-size: 200% 100%; animation: c-shim 1.4s linear infinite; }
        @keyframes c-shim { to { background-position: -200% 0; } }
        .c-ai-err { font-size: 12px; font-weight: 700; color: ${A.danger}; padding: 8px 10px; border-radius: 10px; background: rgba(179,38,30,.07); }
        .c-ai-info { padding: 9px 10px; border-radius: 10px; background: rgba(201,168,76,.08); border: 1px dashed rgba(201,168,76,.45); display: grid; gap: 6px; }
        .c-ai-reading { margin: 0; font-size: 12px; color: ${t1}; line-height: 1.45; }
        .c-ai-chips { display: flex; flex-wrap: wrap; gap: 5px; }
        .c-ai-chips > * { font-size: 10.5px; font-weight: 800; padding: 3px 8px; border-radius: 99px; background: #fff; border: 1px solid ${cB}; color: ${t2}; text-decoration: none; }
        .c-ai-chips .ok { color: ${A.ok}; border-color: rgba(30,122,75,.3); }
        .c-ai-chips .warn { color: ${A.warn}; border-color: rgba(183,121,31,.35); }
        .c-ai-chips .lnk { color: ${gD}; border-color: rgba(201,168,76,.5); }
        .c-ai-note { margin: 0; font-size: 10.5px; color: ${tM}; }
        .c-subject { height: 38px; font-size: 13px; }
        .c-compose-foot { display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
        .c-compose-foot > span { font-size: 10.5px; color: ${tM}; }
      `}</style>

      <Hero>
        <div className="adk-hero-grid">
          <HeroStat big label={filter === "all" ? "Inquiries" : filter === "unread" ? "Unread shown" : "Read shown"} value={pg.total} />
          <HeroStat label="Unread" value={unread} tone={unread ? "#ffb4a8" : undefined} />
          <HeroStat label="Replied · page" value={replied} sub={`${awaiting} awaiting`} />
          <HeroStat label="With notes · page" value={withNotes} />
        </div>
      </Hero>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, minWidth: 0 }}>
        <ChipGroup
          id="c-filter"
          value={filter}
          onChange={setFilter}
          style={{ flex: "1 1 auto" }}
          options={[
            { value: "all", label: "All" },
            { value: "unread", label: "Unread", count: unread },
            { value: "read", label: "Read" },
          ]}
        />
        <div style={{ flex: "none" }}><SortToggle value={sort} onChange={setSort} size="sm" /></div>
      </div>

      <div className="c-layout">
        <div style={{ minWidth: 0 }}>
          {loading ? (
            <Loading label="Loading inquiries…" />
          ) : !items.length ? (
            <EmptyState icon={<MessageSquare size={20} />} title="No inquiries found" note={filter !== "all" ? "Try another filter." : undefined} />
          ) : (
            <div className="c-list">
              {items.map((item, i) => {
                const nReplies = item.replies?.length ?? 0;
                return (
                  <motion.div
                    key={item._id}
                    {...rise(i)}
                    role="button"
                    tabIndex={0}
                    className="adk-card c-card"
                    data-unread={item.isRead ? "0" : "1"}
                    data-on={sel?._id === item._id ? "1" : "0"}
                    onClick={() => openDetail(item)}
                    onKeyDown={(e) => { if (e.key === "Enter") openDetail(item); }}
                    whileHover={{ y: -2 }}
                  >
                    {/* Initial, with the unread dot pinned to it */}
                    <div style={{ position: "relative", flex: "none" }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 11, display: "grid", placeItems: "center", fontSize: 14, fontWeight: 800,
                        background: item.isRead ? "#f6f1ea" : `linear-gradient(135deg,${g},${gD})`, color: item.isRead ? gD : "#fff",
                      }}>{(item.name[0] || "?").toUpperCase()}</div>
                      <span style={{ position: "absolute", right: -3, bottom: -3, width: 16, height: 16, borderRadius: "50%", background: "#fff", display: "grid", placeItems: "center", boxShadow: "0 1px 4px rgba(61,12,17,.25)" }}>
                        {item.isRead ? <Check size={10} color={tM} /> : <Circle size={9} fill={g} color={g} />}
                      </span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
                        <span style={{ fontSize: 13.5, fontWeight: item.isRead ? 700 : 800, color: t1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</span>
                        <span style={{ flex: "none", fontSize: 10.5, color: tM, fontWeight: 600 }}>{timeAgo(item.createdAt)}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, marginTop: 1 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: t2, minWidth: 0, overflow: "hidden" }}>
                          <Mail size={10} style={{ flex: "none" }} /><span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.email}</span>
                        </span>
                        {item.phone && (
                          <span style={{ flex: "none", display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: tM }}>
                            <Phone size={10} /> {item.phone}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: 12, color: t2, margin: "5px 0 0", lineHeight: 1.45, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", overflowWrap: "anywhere" }}>
                        {item.message}
                      </p>
                      {(nReplies > 0 || item.adminNotes) && (
                        <div style={{ display: "flex", gap: 5, marginTop: 6, flexWrap: "wrap" }}>
                          {nReplies > 0 && <Tag tone={A.ok}><Send size={9} /> {nReplies} {nReplies === 1 ? "reply" : "replies"}</Tag>}
                          {item.adminNotes && <Tag><StickyNote size={9} /> Has notes</Tag>}
                        </div>
                      )}
                    </div>
                    {/* Quick actions */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                      <button className="adk-btn c-act" onClick={() => toggleRead(item)} title={item.isRead ? "Mark unread" : "Mark read"} aria-label={item.isRead ? "Mark unread" : "Mark read"}>
                        {item.isRead ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                      <button className="adk-btn c-act" data-v="danger" onClick={() => deleteItem(item._id)} title="Delete" aria-label="Delete">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </motion.div>
                );
              })}

              {/* Pagination */}
              {pg.totalPages > 1 && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: "10px 0 4px" }}>
                  <button className="adk-btn" onClick={() => fetchItems(pg.page - 1)} disabled={pg.page <= 1} aria-label="Previous page" style={{ width: 36, padding: 0 }}>
                    <ChevronLeft size={15} />
                  </button>
                  <span style={{ fontSize: 12, color: tM, fontWeight: 700 }}>{pg.page} / {pg.totalPages}</span>
                  <button className="adk-btn" onClick={() => fetchItems(pg.page + 1)} disabled={pg.page >= pg.totalPages} aria-label="Next page" style={{ width: 36, padding: 0 }}>
                    <ChevronRight size={15} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Detail — sticky beside the list on desktop, a full-screen sheet on a phone */}
        <aside className="c-side" data-open={sel ? "1" : "0"}>
          <AnimatePresence mode="wait">
            {!sel ? (
              <motion.div key="ph" className="c-ph" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <div>
                  <div className="adk-empty-ic" style={{ marginBottom: 10 }}><MessageSquare size={20} /></div>
                  Pick an inquiry to read and reply.
                </div>
              </motion.div>
            ) : (
              <motion.div key={sel._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 14 }}>
                  <button className="adk-btn" onClick={() => setSel(null)} aria-label="Close" style={{ width: 34, height: 34, padding: 0, flex: "none" }}>
                    <X size={15} />
                  </button>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                      <h2 style={{ fontSize: 18, fontWeight: 800, color: t1, margin: 0, fontFamily: "'Playfair Display',serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sel.name}</h2>
                      <Tag tone={sel.isRead ? tM : gD}>{sel.isRead ? "READ" : "UNREAD"}</Tag>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 10px", fontSize: 11.5, color: t2, marginTop: 4, minWidth: 0 }}>
                      <a href={`mailto:${sel.email}`} style={{ display: "flex", alignItems: "center", gap: 3, color: t2, textDecoration: "none", minWidth: 0, overflowWrap: "anywhere" }}><Mail size={11} color={tM} style={{ flex: "none" }} /> {sel.email}</a>
                      {sel.phone && <a href={`tel:${sel.phone}`} style={{ display: "flex", alignItems: "center", gap: 3, color: tM, textDecoration: "none" }}><Phone size={11} color={tM} /> {sel.phone}</a>}
                      <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Clock size={11} color={tM} /> {new Date(sel.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Conversation thread */}
                <div style={{ marginBottom: 14 }}>
                  <p className="c-sec">Conversation</p>

                  {/* User message */}
                  <div style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "flex-start" }}>
                    <div style={{ width: 26, height: 26, borderRadius: "50%", background: `${g}20`, border: `1px solid ${g}40`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: gD }}>
                      {(sel.name[0] || "?").toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: "0 0 3px", fontSize: 10, fontWeight: 700, color: tM }}>{sel.name} &bull; {new Date(sel.createdAt).toLocaleString()}</p>
                      <div style={{ padding: "10px 12px", borderRadius: "4px 14px 14px 14px", background: "#fff", border: `1px solid ${cB}` }}>
                        <p style={{ fontSize: 13, color: t1, lineHeight: 1.65, margin: 0, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{sel.message}</p>
                      </div>
                    </div>
                  </div>

                  {/* Admin replies */}
                  {(sel.replies ?? []).map((r, i) => (
                    <motion.div key={i} {...rise(i)} style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "flex-start", flexDirection: "row-reverse" }}>
                      <div style={{ width: 26, height: 26, borderRadius: "50%", background: bg, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#ffe3a3" }}>
                        S
                      </div>
                      <div style={{ flex: 1, minWidth: 0, textAlign: "right" }}>
                        <p style={{ margin: "0 0 3px", fontSize: 10, fontWeight: 700, color: tM }}>Support &bull; {new Date(r.sentAt).toLocaleString()}</p>
                        <div style={{ padding: "10px 12px", borderRadius: "14px 4px 14px 14px", background: `linear-gradient(135deg,${A.maroon2},${bg})`, display: "inline-block", textAlign: "left", maxWidth: "88%" }}>
                          <p style={{ fontSize: 13, color: "#f5ede6", lineHeight: 1.65, margin: 0, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{r.body}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Reply composer */}
                <div className="c-compose">
                  <div className="c-compose-head">
                    <label className="c-sec" style={{ color: t2, margin: 0 }}>
                      <Send size={11} color={gD} /> Reply from support@subhsandesh.in
                    </label>
                    <button type="button" className="c-ai-btn" onClick={draftWithAi} disabled={aiBusy}>
                      {aiBusy ? <Loader2 size={13} className="c-spin" /> : <Sparkles size={13} />}
                      {aiBusy ? "Writing…" : replyBody.trim() ? "Rewrite with AI" : "Write with AI"}
                    </button>
                  </div>

                  {aiBusy && (
                    <div className="c-ai-wait">
                      Reading {sel.name.split(" ")[0] || "their"}&apos;s message and account — templates made, published or not, and feedback…
                    </div>
                  )}
                  {aiError && <div className="c-ai-err">{aiError}</div>}
                  {aiInfo && !aiBusy && (
                    <div className="c-ai-info">
                      {aiInfo.reading && <p className="c-ai-reading"><b>Understood:</b> {aiInfo.reading}</p>}
                      <div className="c-ai-chips">
                        <span className={aiInfo.hasAccount ? "ok" : "warn"}>{aiInfo.hasAccount ? "Has an account" : "No account for this email"}</span>
                        {aiInfo.likelyTemplate && <span>About: {aiInfo.likelyTemplate.replace(/ \(.*\)$/, "")}</span>}
                        {aiInfo.pages.slice(0, 4).map((p, i) => (
                          <span key={i} className="pg">{p.templateLabel} · {p.isPublished ? "live" : "draft"}{p.access === "paid" ? " · paid" : p.access === "points" ? " · points" : ""}</span>
                        ))}
                        {aiInfo.hasAccount && aiInfo.userId && (
                          <Link href={`/admin/users/${aiInfo.userId}`} className="lnk">Open profile →</Link>
                        )}
                      </div>
                      <p className="c-ai-note">AI draft — read it and edit anything before sending. It never offers refunds, discounts or dates.</p>
                    </div>
                  )}

                  <input
                    className="adk-input c-subject"
                    value={replySubject}
                    onChange={(e) => setReplySubject(e.target.value)}
                    placeholder="Subject (default: Re: Your message to SubhSandesh)"
                    maxLength={150}
                  />
                  <textarea
                    className="adk-input c-ta"
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    placeholder={`Write your reply to ${sel.name}… or press "Write with AI".`}
                    rows={replyBody.length > 200 ? 10 : 4}
                  />
                  <div className="c-compose-foot">
                    <span>Signed automatically as “SubhSandesh Support Team”.</span>
                    <button className="adk-btn" data-v="primary" onClick={sendReply} disabled={replying || !replyBody.trim()}>
                      <Send size={12} /> {replying ? "Sending..." : "Send Reply"}
                    </button>
                  </div>
                </div>

                {/* Admin notes */}
                <div style={{ marginBottom: 14 }}>
                  <label className="c-sec">
                    <StickyNote size={11} color={gD} /> Private Notes (not sent)
                  </label>
                  <textarea
                    className="adk-input c-ta"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add private notes about this inquiry..."
                    rows={2}
                  />
                  <button className="adk-btn" data-v="gold" onClick={saveNotes} disabled={saving} style={{ marginTop: 8 }}>
                    {saving ? "Saving..." : "Save Notes"}
                  </button>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="adk-btn" onClick={() => toggleRead(sel)} style={{ flex: 1 }}>
                    {sel.isRead ? <><EyeOff size={13} /> Mark Unread</> : <><Eye size={13} /> Mark Read</>}
                  </button>
                  <button className="adk-btn" data-v="danger" onClick={() => deleteItem(sel._id)}>
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </aside>
      </div>
    </AdminPage>
  );
}
