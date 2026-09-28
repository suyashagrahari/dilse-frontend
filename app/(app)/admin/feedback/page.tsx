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
import { AnimatePresence, motion } from "framer-motion";
import {
  Loader2, Star, Sparkles, Send, Trash2, X, Mail, Clock, StickyNote, ExternalLink, Check, ChevronLeft, ChevronRight, AlertTriangle, UserRound, PenLine,
} from "lucide-react";
import SortToggle, { type SortOrder } from "@/components/admin/SortToggle";
import { A, AdminPage, ChipGroup, EmptyState, Hero, HeroStat, Loading, Num, Tag, fmtNum, rise } from "../adminKit";

const g = A.gold;
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
  /**
   * The account behind this feedback, when there still is one.
   *
   * Answered by the server rather than derived from `userId` here, because
   * "has a userId" and "has an account you can open" are different questions:
   * the ref has no cascade, so a deleted user leaves the row pointing at
   * nothing and a link built from it 404s. Empty means no button.
   */
  profileUserId?: string;
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

/** One row of the per-template rollup the list endpoint already returns. */
interface TemplateStat { slug: string; label: string; count: number; avg: number }

const FILTERS = [
  { key: "all", label: "All" },
  { key: "new", label: "New" },
  { key: "unreplied", label: "Needs reply" },
  { key: "negative", label: "3★ and below" },
  { key: "with-comment", label: "With words" },
  { key: "replied", label: "Replied" },
] as const;

/** Read-only star row, for a list where nothing is being chosen. */
function Stars({ value, size = 13, empty = "rgba(61,12,17,0.18)" }: { value: number; size?: number; empty?: string }) {
  return (
    <span style={{ display: "inline-flex", gap: 1, flex: "none" }} aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          strokeWidth={1.9}
          style={{
            color: n <= value ? g : empty,
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
  /** "" = every template. Narrows the list AND the rating read-out below it. */
  const [slug, setSlug] = useState<string>("");
  /** 0 = any number of stars. */
  const [star, setStar] = useState<number>(0);
  const [templates, setTemplates] = useState<TemplateStat[]>([]);
  const [sort, setSort] = useState<SortOrder>("newest");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // The open row, and the composer that belongs to it.
  const [sel, setSel] = useState<Item | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [notes, setNotes] = useState("");
  const [drafting, setDrafting] = useState(false);
  /**
   * What the admin wants THIS email to do, in their own words.
   *
   * Empty = generate straight from the rating and the comment, exactly as
   * before. Filled = the model is told to follow it, ranked above the default
   * per-star intent but below the prompt's hard rules (no money, no dates, no
   * invented fixes) — so a hurried "offer a refund" cannot put one in writing.
   */
  const [guidance, setGuidance] = useState("");
  const [guideOpen, setGuideOpen] = useState(false);
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
        const q = new URLSearchParams({ page: String(page), limit: "20", filter, sort });
        if (slug) q.set("slug", slug);
        if (star) q.set("rating", String(star));
        const res = await fetch(`${API_URL}/admin/feedback?${q}`, { headers: hdr() });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error || "Could not load feedback");
        setItems(json.data.items);
        setStats(json.data.stats);
        // The rollup is over EVERYTHING, so it must not be narrowed by the very
        // filter it populates — otherwise choosing a template empties the menu
        // you chose it from.
        if (!slug && !star) setTemplates(json.data.templates || []);
        setPg(json.data.pagination);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load feedback");
      } finally {
        setLoading(false);
      }
    },
    [accessToken, allowed, filter, sort, slug, star, hdr]
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
        body: JSON.stringify({ guidance: guidance.trim() }),
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

  // Opening a different piece of feedback drops the note. An instruction
  // written about somebody else's two-star is the last thing that should
  // quietly shape the next reply.
  useEffect(() => { setGuidance(""); setGuideOpen(false); }, [sel?._id]);

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
    return <Loading h={360} />;
  }

  const starOptions = [
    { value: 0, label: "Any rating" },
    ...[5, 4, 3, 2, 1].map((n) => ({ value: n, label: <>{n}<Star size={11} style={{ fill: "currentColor" }} /></>, count: stats?.starCounts[String(n)] || 0 })),
  ];
  const filterOptions = FILTERS.map((f) => ({
    value: f.key as string,
    label: f.label,
    count: !stats ? undefined : f.key === "new" ? stats.newCount : f.key === "replied" ? stats.repliedCount : f.key === "with-comment" ? stats.withComment : undefined,
  }));

  return (
    <AdminPage
      title="Feedback"
      icon={<Star size={18} />}
      subtitle={<>What creators said right after publishing. Replies go out from <strong>support@subhsandesh.in</strong> — generate a draft, read it, then send.</>}
    >
      <style>{`
        /* Two columns on a laptop, one on a phone: the detail panel is a
           full-screen sheet there rather than a squeezed sidebar. */
        /* minmax(0,…), not 1fr: a bare 1fr track grows to its widest
           unbreakable child (a long name, email or URL) and pushes the
           cards off a phone screen. */
        .af-grid { display: grid; grid-template-columns: minmax(0,1fr); gap: 12px; }
        .af-grid > * { min-width: 0; }
        .af-hero { display: grid; grid-template-columns: auto minmax(0,1fr); gap: 14px 18px; align-items: center; }
        .af-hero-stats { grid-column: 1 / -1; display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 10px;
          padding-top: 12px; border-top: 1px solid rgba(255,236,190,.14); }
        .af-bar { flex: 1; height: 7px; border-radius: 99px; background: rgba(255,255,255,.1); overflow: hidden; }
        .af-tools { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-bottom: 8px; min-width: 0; }
        .af-row2 { display: flex; align-items: center; gap: 8px; margin-bottom: 12px; min-width: 0; }
        .af-row2 > .adk-chips { flex: 1 1 auto; }
        @media (min-width: 900px) {
          .af-grid { grid-template-columns: minmax(0,1fr) minmax(0,440px); align-items: start; }
          .af-hero { grid-template-columns: auto minmax(0,1fr) auto; gap: 24px; }
          .af-hero-stats { grid-column: auto; padding-top: 0; border-top: none; padding-left: 22px; border-left: 1px solid rgba(255,236,190,.14); gap: 22px; }
          .af-detail { position: sticky; top: calc(var(--adm-top) + 8px);
            max-height: calc(100vh - var(--adm-top) - 16px); overflow-y: auto; border-radius: 16px; scrollbar-width: thin; }
        }
        @media (max-width: 899px) {
          .af-detail {
            /* 189, not 60: BottomNav is z-[79] and 82px tall, so the old
               value put this panel and its Send button under the nav. */
            position: fixed; inset: 0; z-index: 189; overflow-y: auto;
            background: #f5ede6;
            padding: 12px 12px calc(82px + env(safe-area-inset-bottom, 0px) + 24px);
          }
        }
        .af-kicker { margin: 0 0 7px; font-size: 10.5px; font-weight: 800; letter-spacing: .07em; text-transform: uppercase; color: ${A.muted}; }
        .af-link { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 700; color: ${A.goldDeep}; text-decoration: none; min-width: 0; }
        .af-link:hover { text-decoration: underline; }
        .af-preset { padding: 5px 9px; border-radius: 99px; border: 1px solid ${A.edge}; background: #fff; color: ${A.soft}; font-size: 11px; font-weight: 700; cursor: pointer; transition: transform .15s, border-color .15s; }
        .af-preset:hover { transform: translateY(-1px); border-color: ${A.gold}; }
      `}</style>

      <div style={{ overflowX: "clip" }}>
        {/* ── Summary ─────────────────────────────────────────────────────── */}
        {stats && (
          <Hero>
            <div className="af-hero">
              <div style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
                  <span style={{ fontSize: 44, fontWeight: 800, lineHeight: 1, color: "#ffe3a3", fontFamily: "'Playfair Display',serif" }}>
                    {stats.count ? stats.avg.toFixed(1) : "—"}
                  </span>
                  <span style={{ fontSize: 12, opacity: 0.7 }}>/ 5</span>
                </div>
                <div style={{ marginTop: 6 }}>
                  <Stars value={Math.round(stats.avg)} size={13} empty="rgba(255,236,190,0.22)" />
                </div>
                <p style={{ margin: "5px 0 0", fontSize: 10.5, fontWeight: 700, opacity: 0.72, letterSpacing: ".03em" }}>
                  <Num value={stats.count} /> {stats.count === 1 ? "rating" : "ratings"}
                </p>
              </div>

              {/* Histogram: which star, how many. Bars rather than numbers,
                  because the shape of the distribution is the finding. */}
              <div style={{ minWidth: 0 }}>
                {[5, 4, 3, 2, 1].map((s, i) => {
                  const n = stats.starCounts[String(s)] || 0;
                  return (
                    <div key={s} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                      <span style={{ fontSize: 10.5, fontWeight: 700, opacity: 0.75, width: 22, textAlign: "right", flex: "none" }}>{s}★</span>
                      <div className="af-bar">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(n / histogramMax) * 100}%` }}
                          transition={{ duration: 0.7, delay: 0.15 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                          style={{ height: "100%", borderRadius: 99, background: s >= 4 ? A.gold : s === 3 ? "#d99a5c" : "#e0605a" }}
                        />
                      </div>
                      <span style={{ fontSize: 10.5, opacity: 0.8, width: 26, flex: "none" }}>{fmtNum(n)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="af-hero-stats">
                <HeroStat label="New" value={stats.newCount} tone={stats.newCount ? "#ffb4a8" : undefined} />
                <HeroStat label="Replied" value={stats.repliedCount} tone="#a8e6c1" />
                <HeroStat label="With words" value={stats.withComment} />
              </div>
            </div>
          </Hero>
        )}

        {/* ── Filters ─────────────────────────────────────────────────────── */}
        {/*
          Template + star filters.

          The list endpoint already accepted `slug` and `rating` and already
          returned a per-template rollup; nothing here was reachable from the
          panel. Choosing a template narrows the list and swaps the headline
          numbers for that template's own — which is the question being asked
          when somebody opens this: "how is THIS one doing?"
        */}
        <div className="af-tools">
          <select
            value={slug}
            onChange={(e) => { setSlug(e.target.value); void load(1); }}
            className="adk-input"
            style={{ height: 36, padding: "0 10px", fontWeight: 600, flex: "1 1 200px", minWidth: 0, maxWidth: 320, width: "auto" }}
          >
            <option value="">All templates ({stats?.count ?? 0})</option>
            {templates.map((t) => (
              <option key={t.slug} value={t.slug}>
                {t.label || t.slug} — {t.count} · {t.avg}★
              </option>
            ))}
          </select>
          <ChipGroup
            id="af-star"
            value={star}
            onChange={(v) => { setStar(v); void load(1); }}
            options={starOptions}
            style={{ flex: "1 1 260px" }}
          />
          {(slug || star > 0) && (
            <button type="button" className="adk-btn" onClick={() => { setSlug(""); setStar(0); void load(1); }} style={{ height: 32 }}>
              <X size={13} /> Clear
            </button>
          )}
        </div>

        {/* What this template alone is scoring. */}
        <AnimatePresence>
          {slug && (() => {
            const t = templates.find((x) => x.slug === slug);
            if (!t) return null;
            return (
              <motion.div
                key={t.slug}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="adk-panel"
                style={{ marginBottom: 8, padding: "10px 13px", display: "flex", alignItems: "center", gap: "6px 14px", flexWrap: "wrap" }}
              >
                <span style={{ fontWeight: 800, color: A.ink, fontSize: 13.5, minWidth: 0, overflowWrap: "anywhere" }}>{t.label || t.slug}</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                  <Stars value={Math.round(t.avg)} size={13} />
                  <b style={{ color: A.ink, fontSize: 14 }}>{t.avg}</b>
                  <span style={{ color: A.soft, fontSize: 12 }}>average</span>
                </span>
                <span style={{ color: A.soft, fontSize: 12 }}>
                  from {t.count} {t.count === 1 ? "rating" : "ratings"}
                </span>
              </motion.div>
            );
          })()}
        </AnimatePresence>

        <div className="af-row2">
          <ChipGroup id="af-status" value={filter} onChange={setFilter} options={filterOptions} />
          {/* Oldest first is the un-replied backlog in the order it arrived. */}
          <div style={{ flex: "none" }}>
            <SortToggle value={sort} onChange={setSort} size="sm" />
          </div>
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
            <span style={{ fontSize: 12.5, color: A.ink, overflowWrap: "anywhere" }}>{error}</span>
          </div>
        )}

        <div className="af-grid">
          {/* ── The list ───────────────────────────────────────────────────── */}
          <div>
            {loading ? (
              <Loading label="Loading feedback…" />
            ) : items.length === 0 ? (
              <EmptyState
                icon={<Star size={22} />}
                title="Nothing here yet"
                note={filter === "all" ? "Ratings appear the moment somebody publishes a page." : "No feedback matches this filter."}
              />
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 7 }}>
                {items.map((item, idx) => {
                  const isOpen = sel?._id === item._id;
                  return (
                    // ── WHY THE ROW IS WRAPPED ──────────────────────────────
                    //
                    // So the profile link can sit BESIDE the button instead of
                    // inside it. An <a> nested in a <button> is invalid HTML —
                    // interactive elements cannot nest — and browsers disagree
                    // about what a click, a Tab and a screen reader should do
                    // with it. `stopPropagation` makes the mouse behave and
                    // fixes none of the rest.
                    //
                    // As siblings, both are real controls: the button opens the
                    // feedback, the link opens the account, and neither needs
                    // to know about the other.
                    <motion.div key={item._id} {...rise(idx)} style={{ position: "relative", minWidth: 0 }}>
                    <button
                      type="button"
                      onClick={() => void open(item)}
                      className="adk-card"
                      data-on={isOpen ? "1" : "0"}
                      style={{ padding: "10px 12px 10px 16px" }}
                    >
                      {/* Rating stripe down the left edge: green, amber, red. */}
                      <span aria-hidden style={{
                        position: "absolute", left: 0, top: 0, bottom: 0, width: 4,
                        background: item.rating >= 4 ? OK : item.rating === 3 ? "#c98a4c" : OFF,
                      }} />
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5, minWidth: 0, paddingRight: item.profileUserId ? 76 : 0 }}>
                        <Stars value={item.rating} />
                        {item.status === "new" && <Tag tone={OFF} solid style={{ padding: "2px 7px", fontSize: 9.5 }}>NEW</Tag>}
                        {item.status === "replied" && (
                          <Tag tone={OK} style={{ padding: "2px 7px" }}><Check size={10} /> Replied</Tag>
                        )}
                      </div>

                      <p
                        style={{
                          margin: 0, fontSize: 13, lineHeight: "19px", color: item.comment ? A.ink : A.muted,
                          fontStyle: item.comment ? "normal" : "italic",
                          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                          overflow: "hidden", overflowWrap: "anywhere",
                        }}
                      >
                        {item.comment || "No words — stars only"}
                      </p>

                      {/*
                        Identity as one compact footer line rather than three
                        wrapping spans. The initial gives the eye something to
                        scan a long queue by, and the template is the chip that
                        matters now that the list can be filtered by it — so it
                        is pinned to the right where it lines up down the page.
                      */}
                      <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 7, minWidth: 0 }}>
                        <span style={{
                          width: 20, height: 20, borderRadius: 6, flex: "none",
                          background: "rgba(201,168,76,0.18)", color: A.goldDeep,
                          display: "grid", placeItems: "center", fontSize: 10, fontWeight: 800,
                        }}>
                          {(item.userName || item.userEmail || "?").trim().charAt(0).toUpperCase()}
                        </span>
                        <span style={{
                          fontSize: 11.5, fontWeight: 700, color: A.ink, flex: "0 1 auto", minWidth: 0,
                          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        }}>
                          {item.userName || item.userEmail}
                        </span>
                        <span style={{ fontSize: 10.5, color: A.muted, flex: "none", whiteSpace: "nowrap" }}>
                          · {when(item.createdAt)}
                        </span>
                        {item.templateLabel && (
                          <span
                            style={{
                              marginLeft: "auto", flex: "0 1 auto", minWidth: 0,
                              fontSize: 10, fontWeight: 800, padding: "3px 8px", borderRadius: 99,
                              background: "rgba(201,168,76,0.16)", color: A.goldDeep,
                              maxWidth: "50%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                            }}
                          >
                            {item.templateLabel}
                          </span>
                        )}
                      </div>
                    </button>
                    {/* Top-right, clear of the stars on the left. 34px tall so
                        it is a real tap target rather than a decoration. */}
                    {item.profileUserId && (
                      <Link
                        href={`/admin/users/${item.profileUserId}`}
                        title={`Open ${item.userName || item.userEmail}'s profile`}
                        aria-label="Open this person's profile"
                        style={{
                          position: "absolute", top: 7, right: 8,
                          display: "inline-flex", alignItems: "center", gap: 4,
                          minHeight: 26, padding: "4px 9px", borderRadius: 99,
                          border: `1px solid ${A.edge}`, background: "#fff",
                          fontSize: 10.5, fontWeight: 800, color: A.goldDeep,
                          textDecoration: "none",
                        }}
                      >
                        <UserRound size={11} /> profile
                      </Link>
                    )}
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {pg.totalPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 12 }}>
                <button type="button" className="adk-btn" aria-label="Previous page" disabled={pg.page <= 1} onClick={() => void load(pg.page - 1)} style={{ width: 36, padding: 0 }}>
                  <ChevronLeft size={16} />
                </button>
                <span style={{ fontSize: 12.5, color: A.soft, fontWeight: 700 }}>
                  Page {pg.page} of {pg.totalPages}
                </span>
                <button type="button" className="adk-btn" aria-label="Next page" disabled={pg.page >= pg.totalPages} onClick={() => void load(pg.page + 1)} style={{ width: 36, padding: 0 }}>
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>

          {/* ── The detail panel and composer ──────────────────────────────── */}
          {sel && (
            <motion.div
              key={sel._id}
              className="af-detail"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <div style={{ background: A.paper, border: `1px solid ${A.edge}`, borderRadius: 16, padding: 14, position: "relative", overflow: "hidden" }}>
                <span aria-hidden style={{
                  position: "absolute", left: 0, right: 0, top: 0, height: 3,
                  background: sel.rating >= 4 ? OK : sel.rating === 3 ? "#c98a4c" : OFF,
                }} />
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Stars value={sel.rating} size={15} />
                    <p style={{ margin: "7px 0 0", fontSize: 15, fontWeight: 800, color: A.ink, overflowWrap: "anywhere" }}>
                      {sel.userName || "—"}
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 12px", marginTop: 3, minWidth: 0 }}>
                      {/* Spelled out here rather than shown as a bare icon: this
                          panel is where you decide what to say to somebody, and
                          their history is the thing worth a full-width link. */}
                      {sel.profileUserId && (
                        <Link href={`/admin/users/${sel.profileUserId}`} className="af-link">
                          <UserRound size={12} /> Open their profile
                        </Link>
                      )}
                      <a href={`mailto:${sel.userEmail}`} className="af-link" style={{ fontWeight: 600, overflowWrap: "anywhere" }}>
                        <Mail size={12} style={{ flex: "none" }} /> {sel.userEmail}
                      </a>
                    </div>
                    <p style={{ margin: "6px 0 0", fontSize: 11.5, lineHeight: "16px", color: A.muted, display: "flex", alignItems: "flex-start", gap: 5, overflowWrap: "anywhere" }}>
                      <Clock size={11} style={{ flex: "none", marginTop: 2.5 }} /> {when(sel.createdAt)}
                      {sel.templateLabel ? ` · ${sel.templateLabel}` : ""}
                    </p>
                    {sel.pageUrl && (
                      <a href={sel.pageUrl} target="_blank" rel="noopener noreferrer" className="af-link" style={{ fontSize: 11.5, marginTop: 4 }}>
                        <ExternalLink size={11} /> Open the page they made
                      </a>
                    )}
                  </div>
                  <button type="button" className="adk-btn" onClick={() => setSel(null)} aria-label="Close" style={{ width: 34, height: 34, padding: 0, flex: "none" }}>
                    <X size={15} />
                  </button>
                </div>

                {/* Their words, quoted */}
                <div style={{ padding: 12, borderRadius: 12, background: "#f7eee5", borderLeft: `3px solid ${A.gold}`, marginBottom: 14 }}>
                  <p
                    style={{
                      margin: 0, fontSize: 13.5, lineHeight: "21px",
                      color: sel.comment ? A.ink : A.muted,
                      fontStyle: sel.comment ? "normal" : "italic",
                      whiteSpace: "pre-wrap", overflowWrap: "anywhere",
                    }}
                  >
                    {sel.comment || "They left the stars but no words."}
                  </p>
                </div>

                {/* Replies already sent */}
                {sel.replies?.length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <p className="af-kicker">Sent</p>
                    {sel.replies.map((r, i) => (
                      <div
                        key={i}
                        style={{
                          padding: 11, borderRadius: 12, background: "rgba(31,122,77,0.06)",
                          border: "1px solid rgba(31,122,77,0.16)", marginBottom: 7,
                        }}
                      >
                        <p style={{ margin: "0 0 5px", fontSize: 12.5, fontWeight: 700, color: A.ink, overflowWrap: "anywhere" }}>
                          {r.subject}
                        </p>
                        <p style={{ margin: 0, fontSize: 12.5, lineHeight: "19px", color: A.soft, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>
                          {r.body}
                        </p>
                        <p style={{ margin: "7px 0 0", fontSize: 10.5, color: A.muted, overflowWrap: "anywhere" }}>
                          {when(r.sentAt)}
                          {r.sentByEmail ? ` · ${r.sentByEmail}` : ""}
                          {r.aiAssisted ? " · from a draft" : ""}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {/* ── The composer ─────────────────────────────────────────── */}
                <p className="af-kicker">{sel.replies?.length ? "Write again" : "Reply"}</p>

                {/*
                  Two ways to generate, one control.

                  Pressing Generate with the note closed writes from the rating
                  and their comment — the original behaviour, one click, nothing
                  in the way. Opening "Steer it" adds an instruction the model
                  must follow: why they gave two stars, what would have made it
                  five, what we should own up to. The presets exist because the
                  same four asks cover most of the queue and nobody wants to type
                  them a hundred times.

                  Collapsed by default so the panel does not grow a block of
                  empty textarea on a phone for the common case.
                */}
                <div style={{ display: "flex", gap: 7, marginBottom: guideOpen ? 8 : 10 }}>
                  <button
                    type="button"
                    className="adk-btn"
                    data-v="gold"
                    onClick={() => void generate()}
                    disabled={drafting}
                    style={{ flex: 1, minWidth: 0, height: 44, fontSize: 13.5 }}
                  >
                    {drafting ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                      {drafting ? "Writing…" : guidance.trim() ? "Generate with your note" : sel.replies?.length ? "Generate another" : "Generate reply"}
                    </span>
                  </button>
                  <button
                    type="button"
                    className="adk-btn"
                    data-v={guidance.trim() ? "gold" : undefined}
                    onClick={() => setGuideOpen((v) => !v)}
                    aria-expanded={guideOpen}
                    title="Tell the AI what this email should do"
                    style={{ flex: "none", height: 44, padding: "0 12px" }}
                  >
                    <PenLine size={14} />
                    {guidance.trim() ? "Note added" : "Steer it"}
                  </button>
                </div>

                <AnimatePresence initial={false}>
                  {guideOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.22 }}
                      style={{ overflow: "hidden" }}
                    >
                      <div style={{ marginBottom: 10, padding: 10, borderRadius: 12, border: `1px solid ${A.edge}`, background: "#fff8ef" }}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 7 }}>
                          {[
                            ["Why so low?", `Ask plainly why they gave ${sel.rating} star${sel.rating === 1 ? "" : "s"} and what specifically went wrong for them.`],
                            ["What'd make it 5?", "Ask the one change that would have made this a five-star experience for them."],
                            ["Own the problem", "Acknowledge the exact problem they hit, take responsibility for it, and ask for the page link so we can look at it."],
                            ["What were they doing?", "Ask what they were trying to do when it went wrong, on which device, and at which step."],
                          ].map(([label, text]) => (
                            <button
                              key={label}
                              type="button"
                              className="af-preset"
                              onClick={() => setGuidance((prev) => (prev.trim() ? `${prev.trim()} ${text}` : text))}
                            >
                              + {label}
                            </button>
                          ))}
                        </div>

                        <textarea
                          value={guidance}
                          onChange={(e) => setGuidance(e.target.value.slice(0, 600))}
                          rows={3}
                          className="adk-input"
                          placeholder="e.g. Ask why it was 2 stars, what broke, and what would fix it. Mention we are a small team and we read every reply."
                          style={{ fontSize: 13, lineHeight: "19px", resize: "vertical", minHeight: 76, fontFamily: "inherit" }}
                        />

                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 6, gap: 8 }}>
                          <span style={{ fontSize: 10.5, color: A.muted, lineHeight: "14px" }}>
                            Their template and what else they&apos;ve made is sent as context. Money, dates and
                            promised fixes stay off-limits.
                          </span>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "none" }}>
                            <span style={{ fontSize: 10.5, color: guidance.length > 540 ? OFF : A.muted }}>
                              {guidance.length}/600
                            </span>
                            {guidance && (
                              <button
                                type="button"
                                onClick={() => setGuidance("")}
                                style={{ background: "none", border: "none", color: A.muted, fontSize: 11, fontWeight: 700, cursor: "pointer", padding: 0 }}
                              >
                                Clear
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subject"
                  className="adk-input"
                  style={{ height: 44, marginBottom: 8, fontSize: 16 }}
                />
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="What we send them. Edit anything before it goes."
                  rows={9}
                  className="adk-input"
                  style={{ padding: 12, resize: "vertical", fontSize: 16, lineHeight: "23px", fontFamily: "inherit" }}
                />

                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
                  <button
                    type="button"
                    className="adk-btn"
                    data-v="primary"
                    onClick={() => void send()}
                    disabled={!canSend}
                    style={{ flex: 1, height: 46, fontSize: 14.5 }}
                  >
                    {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                    {sending ? "Sending" : "Send from support@"}
                  </button>
                  <button
                    type="button"
                    className="adk-btn"
                    data-v="danger"
                    onClick={() => void remove(sel)}
                    aria-label="Delete this feedback"
                    style={{ width: 46, height: 46, padding: 0, flex: "none" }}
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
                  <p style={{ margin: "8px 0 0", fontSize: 11.5, color: A.muted, lineHeight: 1.5 }}>
                    This started as a generated draft. Read it — it can be confidently wrong, and
                    it must never promise a refund, a date or a fix.
                  </p>
                )}

                {/* Internal notes: never emailed, and said so on the label. */}
                <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${A.edge}` }}>
                  <label className="af-kicker" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <StickyNote size={12} /> Internal notes — never emailed
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    placeholder="For the team"
                    className="adk-input"
                    style={{ padding: 10, resize: "vertical", background: "#f7eee5", fontSize: 16, fontFamily: "inherit" }}
                  />
                  <button
                    type="button"
                    className="adk-btn"
                    onClick={() => void saveNotes()}
                    disabled={savingNotes || notes === (sel.adminNotes || "")}
                    style={{ marginTop: 7 }}
                  >
                    {savingNotes ? "Saving…" : "Save notes"}
                  </button>
                </div>
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
              // Above the phone sheet (189), which is where Send is pressed.
              position: "fixed", bottom: "calc(82px + env(safe-area-inset-bottom, 0px) + 14px)", left: "50%",
              zIndex: 200, padding: "11px 18px", borderRadius: 99, background: A.maroon,
              color: "#f5ede6", fontSize: 13, fontWeight: 600,
              boxShadow: "0 10px 30px -10px rgba(26,5,7,0.6)", maxWidth: "90vw", textAlign: "center",
            }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </AdminPage>
  );
}
