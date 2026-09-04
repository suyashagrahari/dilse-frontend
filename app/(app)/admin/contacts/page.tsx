"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { API_URL } from "@/lib/config";
import {
  BarChart3, Users, MessageSquare, ChevronLeft, ChevronRight,
  X, Mail, Phone, Clock, Check, Circle, Trash2, StickyNote, Eye, EyeOff, Send,
} from "lucide-react";
import SortToggle, { type SortOrder } from "@/components/admin/SortToggle";

interface IReply { body: string; sentAt: string; }
interface ContactItem {
  _id: string; name: string; email: string; phone?: string; message: string;
  isRead: boolean; adminNotes?: string; createdAt: string; replies?: IReply[];
}
interface Pg { page: number; limit: number; total: number; totalPages: number }

const cB = "rgba(61,12,17,0.08)";
const t1 = "#2a0a0e";
const t2 = "#7f5f5f";
const tM = "#9a7070";
const g = "#c9a84c";
const gD = "#8b5a2b";
const bg = "#3d0c11";

export default function AdminContactsPage() {
  const router = useRouter();
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
  const [replying, setReplying] = useState(false);

  const hdr = useCallback(() => ({ Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }), [accessToken]);

  const fetchItems = useCallback(async (page = 1) => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const p = new URLSearchParams({ page: String(page), limit: "20", filter, sort });
      const res = await fetch(`${API_URL}/admin/contacts?${p}`, { headers: hdr() });
      const data = await res.json();
      if (data.success) {
        setItems(data.data.items);
        setPg(data.data.pagination);
        setUnread(data.data.unreadCount);
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
        method: "POST", headers: hdr(), body: JSON.stringify({ body: replyBody.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        const updated = { ...sel, isRead: true, replies: data.data.replies };
        setSel(updated);
        setItems((prev) => prev.map((i) => i._id === sel._id ? updated : i));
        setReplyBody("");
      } else {
        alert(data.error || "Failed to send reply");
      }
    } finally { setReplying(false); }
  };

  const openDetail = (item: ContactItem) => {
    setSel(item);
    setNotes(item.adminNotes || "");
    setReplyBody("");
    if (!item.isRead) toggleRead(item);
  };

  const timeAgo = (d: string) => {
    const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
    if (s < 60) return "just now";
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  };

  return (
    <div className="min-h-screen md:pt-[88px]" style={{ background: "linear-gradient(180deg,#faf3ee 0%,#f5ede6 50%,#efe3d3 100%)" }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        .cw{max-width:1320px;margin:0 auto;display:flex;flex-direction:column;height:calc(100vh)}
        @media(min-width:768px){.cw{height:calc(100vh - 88px)}}
        .c-sticky{flex-shrink:0;padding:16px 14px 0;position:sticky;top:0;z-index:10;background:linear-gradient(180deg,#faf3ee 0%,#f5ede6 100%)}
        @media(min-width:768px){.c-sticky{padding:24px 24px 0}}
        @media(min-width:1024px){.c-sticky{padding:24px 40px 0}}
        .c-body{flex:1;overflow-y:auto;padding:0 14px 110px;-webkit-overflow-scrolling:touch}
        @media(min-width:768px){.c-body{padding:0 24px 60px}}
        @media(min-width:1024px){.c-body{padding:0 40px 60px}}
        .cc{background:rgba(255,255,255,0.65);border:1px solid ${cB};border-radius:14px;backdrop-filter:blur(8px)}
        @media(min-width:768px){.cc{border-radius:16px}}
        .ci:hover{background:rgba(201,168,76,0.05)!important}
      `}</style>

      <div className="cw">
        {/* Sticky header */}
        <div className="c-sticky">
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", background: "rgba(255,255,255,0.6)", border: `1px solid ${cB}`, borderRadius: 12, padding: 3, gap: 2 }}>
              <button onClick={() => router.push("/admin/analytics")} style={{ padding: "7px 16px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", border: "none", background: "transparent", color: t2 }}>
                <BarChart3 size={13} style={{ verticalAlign: "middle", marginRight: 5 }} />Analytics
              </button>
              <button onClick={() => router.push("/admin/users")} style={{ padding: "7px 16px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", border: "none", background: "transparent", color: t2 }}>
                <Users size={13} style={{ verticalAlign: "middle", marginRight: 5 }} />Users
              </button>
              <button style={{ padding: "7px 16px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer", border: "none", background: bg, color: "#f5ede6", position: "relative" }}>
                <MessageSquare size={13} style={{ verticalAlign: "middle", marginRight: 5 }} />Contacts
                {unread > 0 && (
                  <span style={{ position: "absolute", top: -4, right: -4, width: 18, height: 18, borderRadius: 9, background: "#dc2626", color: "#fff", fontSize: 9, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{unread}</span>
                )}
              </button>
            </div>
          </div>

          {/* Filters */}
          <div style={{ display: "flex", gap: 4, marginBottom: 12, flexWrap: "wrap" }}>
            {[
              { key: "all", label: "All" },
              { key: "unread", label: `Unread${unread ? ` (${unread})` : ""}` },
              { key: "read", label: "Read" },
            ].map((f) => (
              <button key={f.key} onClick={() => setFilter(f.key)} style={{
                padding: "6px 14px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer",
                border: filter === f.key ? `1.5px solid ${g}` : `1px solid ${cB}`,
                background: filter === f.key ? `${g}15` : "rgba(255,255,255,0.5)",
                color: filter === f.key ? gD : tM,
              }}>{f.label}</button>
            ))}
            <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            <SortToggle value={sort} onChange={setSort} size="sm" />
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 8, background: "rgba(255,255,255,0.55)", border: `1px solid ${cB}`, fontSize: 11, fontWeight: 700, color: t2 }}>
              <MessageSquare size={12} color={g} /> {pg.total} total
            </span>
            </div>
          </div>
          <div style={{ height: 1, background: cB }} />
        </div>

        {/* Scrollable list */}
        <div className="c-body">
          {loading ? (
            <div style={{ padding: 40, textAlign: "center" }}>
              <div style={{ width: 28, height: 28, border: `2px solid rgba(61,12,17,0.08)`, borderTopColor: g, borderRadius: "50%", animation: "spin .8s linear infinite", margin: "0 auto" }} />
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
              {items.map((item) => (
                <div
                  key={item._id}
                  className="ci"
                  onClick={() => openDetail(item)}
                  style={{
                    padding: "14px 16px", borderRadius: 14, cursor: "pointer", transition: "background 0.15s",
                    background: item.isRead ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.8)",
                    border: item.isRead ? `1px solid ${cB}` : `1px solid ${g}40`,
                    boxShadow: item.isRead ? "none" : `0 2px 8px ${g}10`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    {/* Unread dot */}
                    <div style={{ paddingTop: 4, flexShrink: 0 }}>
                      {item.isRead
                        ? <Check size={14} color={tM} />
                        : <Circle size={14} fill={g} color={g} />
                      }
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: t1 }}>{item.name}</span>
                        <span style={{ fontSize: 10, color: tM }}>{timeAgo(item.createdAt)}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: t2 }}>
                          <Mail size={10} /> {item.email}
                        </span>
                        {item.phone && (
                          <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: tM }}>
                            <Phone size={10} /> {item.phone}
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: 12, color: t2, margin: 0, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {item.message}
                      </p>
                      {item.adminNotes && (
                        <div style={{ marginTop: 6, display: "flex", alignItems: "center", gap: 4, fontSize: 10, color: gD }}>
                          <StickyNote size={10} /> Has notes
                        </div>
                      )}
                    </div>
                    {/* Quick actions */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => toggleRead(item)} title={item.isRead ? "Mark unread" : "Mark read"}
                        style={{ width: 28, height: 28, borderRadius: 7, border: `1px solid ${cB}`, background: "rgba(255,255,255,0.6)", color: tM, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {item.isRead ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                      <button onClick={() => deleteItem(item._id)} title="Delete"
                        style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid rgba(220,38,38,0.15)", background: "rgba(220,38,38,0.04)", color: "#dc2626", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {!items.length && <p style={{ textAlign: "center", color: tM, fontSize: 12, padding: 40 }}>No inquiries found</p>}

              {/* Pagination */}
              {pg.totalPages > 1 && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, padding: 12 }}>
                  <button onClick={() => fetchItems(pg.page - 1)} disabled={pg.page <= 1}
                    style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${cB}`, background: "transparent", color: pg.page <= 1 ? "rgba(61,12,17,0.15)" : t1, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ChevronLeft size={15} />
                  </button>
                  <span style={{ fontSize: 11, color: tM, fontWeight: 600 }}>{pg.page} / {pg.totalPages}</span>
                  <button onClick={() => fetchItems(pg.page + 1)} disabled={pg.page >= pg.totalPages}
                    style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${cB}`, background: "transparent", color: pg.page >= pg.totalPages ? "rgba(61,12,17,0.15)" : t1, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ChevronRight size={15} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal — always centered */}
      {sel && (
        <>
          <div onClick={() => setSel(null)} style={{ position: "fixed", inset: 0, background: "rgba(42,10,14,0.22)", zIndex: 100, backdropFilter: "blur(4px)" }} />
          <div style={{
            position: "fixed", zIndex: 101, top: "50%", left: "50%", transform: "translate(-50%,-50%)",
            width: "min(92vw,540px)", maxHeight: "85vh", overflowY: "auto",
            background: "linear-gradient(180deg,#faf3ee 0%,#f5ede6 100%)",
            border: `1px solid ${cB}`, borderRadius: 20, padding: "22px 18px 28px",
            boxShadow: "0 20px 60px rgba(0,0,0,0.12)",
          }}>
            <button onClick={() => setSel(null)} style={{ position: "absolute", top: 14, right: 14, width: 30, height: 30, borderRadius: 8, border: `1px solid ${cB}`, background: "rgba(255,255,255,0.6)", color: t1, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <X size={15} />
            </button>

            {/* Header */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: t1, margin: 0, fontFamily: "'Playfair Display',serif" }}>{sel.name}</h2>
                <span style={{
                  padding: "2px 8px", borderRadius: 5, fontSize: 9, fontWeight: 700,
                  background: sel.isRead ? `${tM}12` : `${g}15`, color: sel.isRead ? tM : gD,
                  border: `1px solid ${sel.isRead ? `${tM}25` : `${g}30`}`,
                }}>{sel.isRead ? "READ" : "UNREAD"}</span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, fontSize: 11, color: t2 }}>
                <a href={`mailto:${sel.email}`} style={{ display: "flex", alignItems: "center", gap: 3, color: t2, textDecoration: "none" }}><Mail size={11} color={tM} /> {sel.email}</a>
                {sel.phone && <a href={`tel:${sel.phone}`} style={{ display: "flex", alignItems: "center", gap: 3, color: tM, textDecoration: "none" }}><Phone size={11} color={tM} /> {sel.phone}</a>}
                <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Clock size={11} color={tM} /> {new Date(sel.createdAt).toLocaleString()}</span>
              </div>
            </div>

            {/* Conversation thread */}
            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: tM, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Conversation</p>

              {/* User message */}
              <div style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "flex-start" }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: `${g}20`, border: `1px solid ${g}40`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: gD }}>
                  {sel.name[0].toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: "0 0 3px", fontSize: 10, fontWeight: 700, color: tM }}>{sel.name} &bull; {new Date(sel.createdAt).toLocaleString()}</p>
                  <div style={{ padding: "10px 12px", borderRadius: "4px 12px 12px 12px", background: "rgba(255,255,255,0.7)", border: `1px solid ${cB}` }}>
                    <p style={{ fontSize: 13, color: t1, lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>{sel.message}</p>
                  </div>
                </div>
              </div>

              {/* Admin replies */}
              {(sel.replies ?? []).map((r, i) => (
                <div key={i} style={{ display: "flex", gap: 8, marginBottom: 10, alignItems: "flex-start", flexDirection: "row-reverse" }}>
                  <div style={{ width: 26, height: 26, borderRadius: "50%", background: `${bg}`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800, color: "#f5ede6" }}>
                    S
                  </div>
                  <div style={{ flex: 1, textAlign: "right" }}>
                    <p style={{ margin: "0 0 3px", fontSize: 10, fontWeight: 700, color: tM }}>Support &bull; {new Date(r.sentAt).toLocaleString()}</p>
                    <div style={{ padding: "10px 12px", borderRadius: "12px 4px 12px 12px", background: `${bg}`, display: "inline-block", textAlign: "left", maxWidth: "85%" }}>
                      <p style={{ fontSize: 13, color: "#f5ede6", lineHeight: 1.7, margin: 0, whiteSpace: "pre-wrap" }}>{r.body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Reply composer */}
            <div style={{ marginBottom: 16, padding: "12px 14px", borderRadius: 12, background: "rgba(255,255,255,0.45)", border: `1px solid ${cB}` }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: t2, marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
                <Send size={11} color={gD} /> Reply via Email (from support@subhsandesh.in)
              </label>
              <textarea
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                placeholder={`Write your reply to ${sel.name}...`}
                rows={3}
                style={{
                  width: "100%", padding: "10px 12px", borderRadius: 10, fontSize: 12, lineHeight: 1.5,
                  border: `1px solid ${cB}`, background: "rgba(255,255,255,0.7)", color: t1,
                  outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box",
                }}
              />
              <button
                onClick={sendReply}
                disabled={replying || !replyBody.trim()}
                style={{
                  marginTop: 8, padding: "8px 20px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: replying || !replyBody.trim() ? "not-allowed" : "pointer",
                  border: "none", background: replying || !replyBody.trim() ? `${tM}30` : bg, color: replying || !replyBody.trim() ? tM : "#f5ede6",
                  display: "flex", alignItems: "center", gap: 5, transition: "all 0.15s",
                }}>
                <Send size={11} /> {replying ? "Sending..." : "Send Reply"}
              </button>
            </div>

            {/* Admin notes */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 10, fontWeight: 700, color: tM, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}>
                <StickyNote size={11} color={gD} /> Private Notes (not sent)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add private notes about this inquiry..."
                rows={2}
                style={{
                  width: "100%", padding: "10px 12px", borderRadius: 10, fontSize: 12, lineHeight: 1.5,
                  border: `1px solid ${cB}`, background: "rgba(255,255,255,0.6)", color: t1,
                  outline: "none", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box",
                }}
              />
              <button onClick={saveNotes} disabled={saving}
                style={{
                  marginTop: 8, padding: "7px 18px", borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: "pointer",
                  border: `1px solid ${g}40`, background: `${g}12`, color: gD,
                }}>
                {saving ? "Saving..." : "Save Notes"}
              </button>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => toggleRead(sel)}
                style={{
                  flex: 1, padding: "9px 14px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer",
                  border: `1px solid ${cB}`, background: "rgba(255,255,255,0.6)", color: t2,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                }}>
                {sel.isRead ? <><EyeOff size={13} /> Mark Unread</> : <><Eye size={13} /> Mark Read</>}
              </button>
              <button onClick={() => deleteItem(sel._id)}
                style={{
                  padding: "9px 18px", borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: "pointer",
                  border: "1px solid rgba(220,38,38,0.2)", background: "rgba(220,38,38,0.06)", color: "#dc2626",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                }}>
                <Trash2 size={13} /> Delete
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
