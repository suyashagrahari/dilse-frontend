"use client";

// ─── /admin/feedback — what creators thought, and writing back ────────────────
//
// A list of every rating left after a publish, with the words that came with it,
// and a reply composer that can write the first draft.
//
// ── THE TWO BUTTONS ARE TWO BUTTONS ─────────────────────────────────────────
//
// "Generate response" fills the composer. "Send" mails it. There is deliberately
// no single button that does both, because the text is machine-written and the
// input to it is a sentence a member of the public typed. The draft is editable
// in between, and the send route on the server does not call the model any more
// than the draft route calls the mailer. See the header of
// `server/src/controllers/adminFeedback.controller.ts`.
//
// So the composer always shows what will actually be sent, and it is never
// pre-filled on open — a super admin has to ask for a draft, which means nobody
// can send one they have not looked at.
//
// ── WHY THE SUMMARY IGNORES THE FILTER ──────────────────────────────────────
//
// The header's average and star histogram are computed over everything, not over
// what is on screen. An average that changes when you click "1 star" is not a
// reading of anything, and the number people will quote in a meeting has to mean
// the same thing every time they look at it.

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { API_URL } from "@/lib/config";
import { isSuperAdmin } from "@/lib/roles";
import {
  ArrowLeft, Loader2, Star, Sparkles, Send, Trash2, X, Mail, Clock,
  StickyNote, ExternalLink, Check, ChevronLeft, ChevronRight, AlertTriangle,
} from "lucide-react";

const t1 = "#2a0a0e";
const t2 = "#7f5f5f";
const tM = "#9a7070";
const g = "#c9a84c";
const bg = "#3d0c11";
const cB = "rgba(61,12,17,0.08)";
const OK = "#1f7a4d";
const OFF = "#b3261e";

interface Reply {
  subject: string;
  body: string;
  sentAt: string;
  sentByEmail?: string;
  aiAssisted?: boolean;
}

interface Item {
  _id: string;
  userName: string;
  userEmail: string;
  templateSlug: string;
  templateLabel: string;
  pageUrl: string;
  rating: number;
  comment: string;
  status: "new" | "read" | "replied";
  adminNotes?: string;
  replies: Reply[];
  createdAt: string;
}

interface Stats {
  count: number;
  avg: number;
  newCount: number;
  repliedCount: number;
  withComment: number;
  starCounts: Record<string, number>;
}

interface Pg { page: number; limit: number; total: number; totalPages: number }

const FILTERS = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "unreplied", label: "Needs reply" },
  { key: "negative", label: "3★ and below" },
  { key: "with-comment", label: "With words" },
  { key: "replied", label: "Replied" },
] as const;

/** Read-only star row, for a list where nothing is being chosen. */
function Stars({ value, size = 13 }: { value: number; size?: number }) {
  return (
    <span style={{ display: "inline-flex", gap: 1, flex: "none" }} aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          strokeWidth={1.9}
          style={{
            color: n <= value ? g : "rgba(61,12,17,0.18)",
            fill: n <= value ? g : "transparent",
          }}
        />
      ))}
    </span>
  );
}

function when(iso: string): string {
  const d = new Date(iso);
  const mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.round(mins / 60)}h ago`;
  if (mins < 43200) return `${Math.round(mins / 1440)}d ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminFeedbackPage() {
  const router = useRouter();
  const { user, accessToken, isLoading } = useAppSelector((s) => s.auth);

  const [items, setItems] = useState<Item[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pg, setPg] = useState<Pg>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // The open row, and the composer that belongs to it.
  const [sel, setSel] = useState<Item | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [notes, setNotes] = useState("");
  const [drafting, setDrafting] = useState(false);
  const [sending, setSending] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);
  /**
   * Whether the text in the composer began as a generated draft.
   *
   * Sent with the reply and stored, so looking back at it later says whether a
   * person wrote it or approved it. Cleared as soon as it is sent, and set only
   * by a successful generate — editing the draft afterwards does not clear it,
   * because "approved a draft" is the honest description of that.
   */
  const [aiAssisted, setAiAssisted] = useState(false);

  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    if (isLoading || !user) return;
    if (!isSuperAdmin(user.role)) {
      router.replace("/admin/analytics");
      return;
    }
    setAllowed(true);
  }, [user, isLoading, router]);

  const hdr = useCallback(
    () => ({ Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }),
    [accessToken]
  );

  const say = useCallback((m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 2800);
  }, []);

  const load = useCallback(
    async (page = 1) => {
      if (!accessToken || !allowed) return;
      setLoading(true);
      setError(null);
      try {
        const q = new URLSearchParams({ page: String(page), limit: "20", filter });
        const res = await fetch(`${API_URL}/admin/feedback?${q}`, { headers: hdr() });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error || "Could not load feedback");
        setItems(json.data.items);
        setStats(json.data.stats);
        setPg(json.data.pagination);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load feedback");
      } finally {
        setLoading(false);
      }
    },
    [accessToken, allowed, filter, hdr]
  );

  useEffect(() => {
    void load(1);
  }, [load]);

  /** Replace one row in place, so a change does not cost a full reload. */
  const patchRow = (id: string, next: Partial<Item>) => {
    setItems((prev) => prev.map((i) => (i._id === id ? { ...i, ...next } : i)));
    setSel((prev) => (prev && prev._id === id ? { ...prev, ...next } : prev));
  };

  const open = async (item: Item) => {
    setSel(item);
    setNotes(item.adminNotes || "");
    // Never pre-filled. The composer showing text nobody asked for is how an
    // unread draft gets sent.
    setSubject("");
    setBody("");
    setAiAssisted(false);

    // Opening it is reading it. Fire-and-forget: a failed status write must not
    // stop the panel opening.
    if (item.status === "new") {
      patchRow(item._id, { status: "read" });
      setStats((s) => (s ? { ...s, newCount: Math.max(0, s.newCount - 1) } : s));
      void fetch(`${API_URL}/admin/feedback/${item._id}/status`, {
        method: "PATCH",
        headers: hdr(),
        body: JSON.stringify({ status: "read" }),
      }).catch(() => {});
    }
  };

  const generate = async () => {
    if (!sel || drafting) return;
    setDrafting(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/admin/feedback/${sel._id}/draft-reply`, {
        method: "POST",
        headers: hdr(),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Could not generate a draft");
      setSubject(json.data.subject || "");
      setBody(json.data.body || "");
      setAiAssisted(true);
      say("Draft ready — read it before sending");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not generate a draft");
    } finally {
      setDrafting(false);
    }
  };

  const send = async () => {
    if (!sel || sending) return;
    if (!subject.trim() || body.trim().length < 20) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/admin/feedback/${sel._id}/reply`, {
        method: "POST",
        headers: hdr(),
        body: JSON.stringify({ subject: subject.trim(), body: body.trim(), aiAssisted }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Could not send the reply");
      patchRow(sel._id, { replies: json.data.replies, status: "replied" });
      setStats((s) => (s ? { ...s, repliedCount: s.repliedCount + 1 } : s));
      setSubject("");
      setBody("");
      setAiAssisted(false);
      say(json.message || "Reply sent");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send the reply");
    } finally {
      setSending(false);
    }
  };

  const saveNotes = async () => {
    if (!sel || savingNotes) return;
    setSavingNotes(true);
    try {
      const res = await fetch(`${API_URL}/admin/feedback/${sel._id}/notes`, {
        method: "PATCH",
        headers: hdr(),
        body: JSON.stringify({ adminNotes: notes }),
      });
      const json = await res.json();
      if (res.ok && json.success) {
        patchRow(sel._id, { adminNotes: json.data.adminNotes });
        say("Notes saved");
      }
    } finally {
      setSavingNotes(false);
    }
  };

  const remove = async (item: Item) => {
    // A native confirm blocks the whole extension surface in some tooling, but
    // this is a destructive, irreversible action on someone else's words and it
    // deserves a stop. Kept deliberately.
    if (!window.confirm(`Delete this ${item.rating}★ feedback from ${item.userName || item.userEmail}?`)) return;
    const res = await fetch(`${API_URL}/admin/feedback/${item._id}`, { method: "DELETE", headers: hdr() });
    const json = await res.json().catch(() => null);
    if (res.ok && json?.success) {
      setItems((prev) => prev.filter((i) => i._id !== item._id));
      if (sel?._id === item._id) setSel(null);
      setPg((p) => ({ ...p, total: Math.max(0, p.total - 1) }));
      say("Deleted");
    }
  };

  const canSend = subject.trim().length > 0 && body.trim().length >= 20 && !sending;

  const histogramMax = useMemo(() => {
    if (!stats) return 1;
    return Math.max(1, ...Object.values(stats.starCounts));
  }, [stats]);

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
        /* Two columns on a laptop, one on a phone: the detail panel is a
           full-screen sheet there rather than a squeezed sidebar. */
        .af-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
        @media (min-width: 900px) {
          .af-grid { grid-template-columns: minmax(0,1fr) minmax(0,440px); align-items: start; }
          .af-detail { position: sticky; top: 16px; }
        }
        /* Filter pills scroll rather than wrap into ragged rows. */
        .af-filters { display: flex; gap: 7px; overflow-x: auto; padding-bottom: 2px; scrollbar-width: none; }
        .af-filters::-webkit-scrollbar { display: none; }
        .af-filters > button { flex: none; }
        @media (max-width: 899px) {
          .af-detail {
            /* 189, not 60: BottomNav is z-[79] and 82px tall, so the old
               value put this panel and its Send button under the nav. */
            position: fixed; inset: 0; z-index: 189; overflow-y: auto;
            background: #f5ede6;
            padding: 14px 14px calc(82px + env(safe-area-inset-bottom, 0px) + 24px);
          }
        }
      `}</style>

      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "18px 14px 0" }}>
        <Link
          href="/admin/analytics"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: t2, textDecoration: "none", marginBottom: 14 }}
        >
          <ArrowLeft size={14} /> Admin
        </Link>

        <h1 style={{ margin: 0, fontSize: 23, fontWeight: 800, color: t1, letterSpacing: "-0.01em" }}>
          Feedback
        </h1>
        <p style={{ margin: "5px 0 0", fontSize: 13, lineHeight: "19px", color: t2 }}>
          What creators said right after publishing. Replies go out from{" "}
          <strong>support@subhsandesh.in</strong> — generate a draft, read it, then send.
        </p>

        {/* ── Summary ─────────────────────────────────────────────────────── */}
        {stats && (
          <div
            style={{
              marginTop: 16, padding: 14, borderRadius: 14, background: "#fffdfb",
              border: `1px solid ${cB}`, display: "flex", flexWrap: "wrap", gap: 18, alignItems: "center",
            }}
          >
            <div style={{ flex: "none" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                <span style={{ fontSize: 30, fontWeight: 800, color: t1, lineHeight: 1 }}>
                  {stats.count ? stats.avg.toFixed(1) : "—"}
                </span>
                <span style={{ fontSize: 12, color: tM }}>/ 5</span>
              </div>
              <div style={{ marginTop: 5 }}>
                <Stars value={Math.round(stats.avg)} size={12} />
              </div>
              <p style={{ margin: "5px 0 0", fontSize: 11.5, color: tM }}>
                {stats.count} {stats.count === 1 ? "rating" : "ratings"}
              </p>
            </div>

            {/* Histogram: which star, how many. Bars rather than numbers,
                because the shape of the distribution is the finding. */}
            <div style={{ flex: "1 1 200px", minWidth: 180 }}>
              {[5, 4, 3, 2, 1].map((star) => {
                const n = stats.starCounts[String(star)] || 0;
                return (
                  <div key={star} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                    <span style={{ fontSize: 11, color: tM, width: 26, textAlign: "right", flex: "none" }}>
                      {star}★
                    </span>
                    <div style={{ flex: 1, height: 7, borderRadius: 99, background: "rgba(61,12,17,0.06)", overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${(n / histogramMax) * 100}%`,
                          height: "100%",
                          borderRadius: 99,
                          background: star >= 4 ? g : star === 3 ? "#c98a4c" : OFF,
                          transition: "width 300ms ease",
                        }}
                      />
                    </div>
                    <span style={{ fontSize: 11, color: tM, width: 24, flex: "none" }}>{n}</span>
                  </div>
                );
              })}
            </div>

            <div style={{ flex: "none", display: "flex", gap: 16 }}>
              {[
                { label: "New", value: stats.newCount, color: OFF },
                { label: "Replied", value: stats.repliedCount, color: OK },
                { label: "With words", value: stats.withComment, color: t2 },
              ].map((s) => (
                <div key={s.label}>
                  <p style={{ margin: 0, fontSize: 19, fontWeight: 800, color: s.color, lineHeight: 1.1 }}>
                    {s.value}
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: tM }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Filters ─────────────────────────────────────────────────────── */}
        <div className="af-filters" style={{ marginTop: 14, marginBottom: 12 }}>
          {FILTERS.map((f) => {
            const on = filter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                style={{
                  height: 36, padding: "0 13px", borderRadius: 99,
                  border: `1px solid ${on ? bg : cB}`,
                  background: on ? bg : "#fffdfb",
                  color: on ? "#f5ede6" : t2,
                  fontSize: 12.5, fontWeight: 700, cursor: "pointer",
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {error && (
          <div
            style={{
              display: "flex", gap: 8, alignItems: "flex-start", padding: "10px 12px",
              borderRadius: 12, background: "rgba(179,38,30,0.08)",
              border: "1px solid rgba(179,38,30,0.22)", marginBottom: 12,
            }}
          >
            <AlertTriangle size={15} style={{ color: OFF, flex: "none", marginTop: 1 }} />
            <span style={{ fontSize: 12.5, color: t1 }}>{error}</span>
          </div>
        )}

        <div className="af-grid">
          {/* ── The list ───────────────────────────────────────────────────── */}
          <div>
            {loading ? (
              <div style={{ padding: 40, display: "grid", placeItems: "center" }}>
                <Loader2 size={20} className="animate-spin" style={{ color: g }} />
              </div>
            ) : items.length === 0 ? (
              <div
                style={{
                  padding: "44px 20px", textAlign: "center", borderRadius: 14,
                  background: "#fffdfb", border: `1px solid ${cB}`,
                }}
              >
                <Star size={26} style={{ color: "rgba(61,12,17,0.18)" }} />
                <p style={{ margin: "10px 0 0", fontSize: 14, fontWeight: 700, color: t1 }}>
                  Nothing here yet
                </p>
                <p style={{ margin: "4px 0 0", fontSize: 12.5, color: tM }}>
                  {filter === "all"
                    ? "Ratings appear the moment somebody publishes a page."
                    : "No feedback matches this filter."}
                </p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 8 }}>
                {items.map((item) => {
                  const isOpen = sel?._id === item._id;
                  return (
                    <button
                      key={item._id}
                      type="button"
                      onClick={() => void open(item)}
                      style={{
                        textAlign: "left", padding: 13, borderRadius: 14,
                        background: "#fffdfb",
                        border: `1px solid ${isOpen ? bg : cB}`,
                        boxShadow: isOpen ? "0 2px 12px rgba(61,12,17,0.08)" : "none",
                        cursor: "pointer", display: "block", width: "100%",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <Stars value={item.rating} />
                        {item.status === "new" && (
                          <span
                            style={{
                              width: 7, height: 7, borderRadius: "50%", background: OFF, flex: "none",
                            }}
                            aria-label="Unread"
                          />
                        )}
                        {item.status === "replied" && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10.5, color: OK, fontWeight: 700 }}>
                            <Check size={11} /> Replied
                          </span>
                        )}
                        <span style={{ marginLeft: "auto", fontSize: 11, color: tM, flex: "none" }}>
                          {when(item.createdAt)}
                        </span>
                      </div>

                      <p
                        style={{
                          margin: 0, fontSize: 13.5, lineHeight: "20px", color: item.comment ? t1 : tM,
                          fontStyle: item.comment ? "normal" : "italic",
                          display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {item.comment || "No words — stars only"}
                      </p>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8, alignItems: "center" }}>
                        <span style={{ fontSize: 11.5, fontWeight: 700, color: t1 }}>
                          {item.userName || "—"}
                        </span>
                        <span style={{ fontSize: 11.5, color: tM }}>{item.userEmail}</span>
                        {item.templateLabel && (
                          <span
                            style={{
                              fontSize: 10.5, fontWeight: 700, padding: "3px 8px", borderRadius: 99,
                              background: "rgba(201,168,76,0.16)", color: "#8b5a2b",
                            }}
                          >
                            {item.templateLabel}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {pg.totalPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 14 }}>
                <button
                  type="button"
                  disabled={pg.page <= 1}
                  onClick={() => void load(pg.page - 1)}
                  style={{
                    width: 38, height: 38, borderRadius: 12, border: `1px solid ${cB}`,
                    background: "#fffdfb", color: pg.page <= 1 ? tM : t1,
                    display: "grid", placeItems: "center", cursor: pg.page <= 1 ? "default" : "pointer",
                  }}
                >
                  <ChevronLeft size={16} />
                </button>
                <span style={{ fontSize: 12.5, color: t2 }}>
                  Page {pg.page} of {pg.totalPages}
                </span>
                <button
                  type="button"
                  disabled={pg.page >= pg.totalPages}
                  onClick={() => void load(pg.page + 1)}
                  style={{
                    width: 38, height: 38, borderRadius: 12, border: `1px solid ${cB}`,
                    background: "#fffdfb", color: pg.page >= pg.totalPages ? tM : t1,
                    display: "grid", placeItems: "center",
                    cursor: pg.page >= pg.totalPages ? "default" : "pointer",
                  }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>

          {/* ── The detail panel and composer ──────────────────────────────── */}
          {sel && (
            <div className="af-detail">
              <div style={{ background: "#fffdfb", border: `1px solid ${cB}`, borderRadius: 16, padding: 14 }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Stars value={sel.rating} size={15} />
                    <p style={{ margin: "7px 0 0", fontSize: 14, fontWeight: 800, color: t1 }}>
                      {sel.userName || "—"}
                    </p>
                    <a
                      href={`mailto:${sel.userEmail}`}
                      style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: "#8b5a2b", textDecoration: "none", marginTop: 2 }}
                    >
                      <Mail size={12} /> {sel.userEmail}
                    </a>
                    <p style={{ margin: "6px 0 0", fontSize: 11.5, color: tM, display: "flex", alignItems: "center", gap: 5 }}>
                      <Clock size={11} /> {when(sel.createdAt)}
                      {sel.templateLabel ? ` · ${sel.templateLabel}` : ""}
                    </p>
                    {sel.pageUrl && (
                      <a
                        href={sel.pageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11.5, color: "#8b5a2b", textDecoration: "none", marginTop: 4 }}
                      >
                        <ExternalLink size={11} /> Open the page they made
                      </a>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setSel(null)}
                    aria-label="Close"
                    style={{
                      width: 34, height: 34, borderRadius: 11, border: `1px solid ${cB}`,
                      background: "#fff", color: t2, display: "grid", placeItems: "center",
                      cursor: "pointer", flex: "none",
                    }}
                  >
                    <X size={15} />
                  </button>
                </div>

                {/* Their words, quoted */}
                <div
                  style={{
                    padding: 12, borderRadius: 12, background: "#f7eee5",
                    borderLeft: `3px solid ${g}`, marginBottom: 14,
                  }}
                >
                  <p
                    style={{
                      margin: 0, fontSize: 13.5, lineHeight: "21px",
                      color: sel.comment ? t1 : tM,
                      fontStyle: sel.comment ? "normal" : "italic",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {sel.comment || "They left the stars but no words."}
                  </p>
                </div>

                {/* Replies already sent */}
                {sel.replies?.length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <p style={{ margin: "0 0 7px", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: tM }}>
                      Sent
                    </p>
                    {sel.replies.map((r, i) => (
                      <div
                        key={i}
                        style={{
                          padding: 11, borderRadius: 12, background: "rgba(31,122,77,0.06)",
                          border: "1px solid rgba(31,122,77,0.16)", marginBottom: 7,
                        }}
                      >
                        <p style={{ margin: "0 0 5px", fontSize: 12.5, fontWeight: 700, color: t1 }}>
                          {r.subject}
                        </p>
                        <p style={{ margin: 0, fontSize: 12.5, lineHeight: "19px", color: t2, whiteSpace: "pre-wrap" }}>
                          {r.body}
                        </p>
                        <p style={{ margin: "7px 0 0", fontSize: 10.5, color: tM }}>
                          {when(r.sentAt)}
                          {r.sentByEmail ? ` · ${r.sentByEmail}` : ""}
                          {r.aiAssisted ? " · from a draft" : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── The composer ─────────────────────────────────────────── */}
                <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: tM }}>
                  {sel.replies?.length ? "Write again" : "Reply"}
                </p>

                <button
                  type="button"
                  onClick={() => void generate()}
                  disabled={drafting}
                  style={{
                    width: "100%", minHeight: 44, borderRadius: 12, marginBottom: 10,
                    border: `1px solid ${g}`, background: "rgba(201,168,76,0.14)",
                    color: "#8b5a2b", fontSize: 13.5, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                    cursor: drafting ? "default" : "pointer",
                  }}
                >
                  {drafting ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                  {drafting ? "Writing…" : sel.replies?.length ? "Generate another draft" : "Generate response email"}
                </button>

                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subject"
                  style={{
                    width: "100%", height: 44, padding: "0 12px", marginBottom: 8,
                    borderRadius: 12, border: `1px solid ${cB}`, background: "#fff",
                    fontSize: 16, color: t1, outline: "none",
                  }}
                />
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="What we send them. Edit anything before it goes."
                  rows={9}
                  style={{
                    width: "100%", padding: 12, borderRadius: 12, resize: "vertical",
                    border: `1px solid ${cB}`, background: "#fff", fontSize: 16,
                    lineHeight: "23px", color: t1, outline: "none", fontFamily: "inherit",
                  }}
                />

                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
                  <button
                    type="button"
                    onClick={() => void send()}
                    disabled={!canSend}
                    style={{
                      flex: 1, minHeight: 46, borderRadius: 12, border: "none",
                      background: canSend ? "linear-gradient(135deg,#3d0c11,#5a1620)" : "rgba(61,12,17,0.12)",
                      color: canSend ? "#fff" : tM,
                      fontSize: 14.5, fontWeight: 800,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                      cursor: canSend ? "pointer" : "default",
                    }}
                  >
                    {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                    {sending ? "Sending" : "Send from support@"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void remove(sel)}
                    aria-label="Delete this feedback"
                    style={{
                      width: 46, height: 46, borderRadius: 12, border: `1px solid rgba(179,38,30,0.25)`,
                      background: "rgba(179,38,30,0.06)", color: OFF,
                      display: "grid", placeItems: "center", cursor: "pointer", flex: "none",
                    }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {body.trim().length > 0 && body.trim().length < 20 && (
                  <p style={{ margin: "8px 0 0", fontSize: 11.5, color: OFF }}>
                    A little longer before this can go out.
                  </p>
                )}
                {aiAssisted && (
                  <p style={{ margin: "8px 0 0", fontSize: 11.5, color: tM, lineHeight: 1.5 }}>
                    This started as a generated draft. Read it — it can be confidently wrong, and
                    it must never promise a refund, a date or a fix.
                  </p>
                )}

                {/* Internal notes: never emailed, and said so on the label. */}
                <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${cB}` }}>
                  <label
                    style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: tM, marginBottom: 7 }}
                  >
                    <StickyNote size={12} /> Internal notes — never emailed
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="For the team"
                    style={{
                      width: "100%", padding: 10, borderRadius: 12, resize: "vertical",
                      border: `1px solid ${cB}`, background: "#f7eee5", fontSize: 16,
                      color: t1, outline: "none", fontFamily: "inherit",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => void saveNotes()}
                    disabled={savingNotes || notes === (sel.adminNotes || "")}
                    style={{
                      marginTop: 7, minHeight: 36, padding: "0 14px", borderRadius: 10,
                      border: `1px solid ${cB}`, background: "#fff", color: t1,
                      fontSize: 12.5, fontWeight: 700,
                      cursor: savingNotes || notes === (sel.adminNotes || "") ? "default" : "pointer",
                      opacity: notes === (sel.adminNotes || "") ? 0.5 : 1,
                    }}
                  >
                    {savingNotes ? "Saving…" : "Save notes"}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div
          style={{
            position: "fixed", bottom: 84, left: "50%", transform: "translateX(-50%)",
            zIndex: 80, padding: "11px 18px", borderRadius: 99, background: bg,
            color: "#f5ede6", fontSize: 13, fontWeight: 600,
            boxShadow: "0 10px 30px -10px rgba(26,5,7,0.6)", maxWidth: "90vw", textAlign: "center",
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
