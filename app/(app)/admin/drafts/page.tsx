"use client";

// ─── /admin/drafts — pages nobody finished, and writing to ask why ────────────
//
// Every unpublished page across all 43 templates, newest first, each one saying
// WHY it stalled — and a composer that can write the follow-up.
//
// ── THE REASON CHIP IS THE WHOLE POINT ──────────────────────────────────────
//
// A list of drafts is not useful; a list that separates "hit a ₹99 paywall and
// walked" from "typed two words and left" is. The first is a pricing signal, the
// second is an onboarding one, and they are different problems with different
// emails. The reason is computed on the server from the pricing, the payment
// orders and how much of the template is filled in — not guessed by the model.
//
// ── TWO BUTTONS, NEVER ONE ──────────────────────────────────────────────────
//
// "Generate email" fills the composer. "Send from feedback@" mails it. Nothing
// does both, and the composer is never pre-filled on open, so nobody can send an
// email they have not read. This matters more here than anywhere else in the
// admin: this is the only mail the platform sends that the recipient did not ask
// for, about a document they have not shown to anybody.
//
// The AI also cannot offer anything — no discount, no coupon, no free publish.
// That was a deliberate product decision and the server enforces it by throwing
// the draft away if the model tries. If you want to make an offer, type it in.

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { API_URL } from "@/lib/config";
import { isSuperAdmin } from "@/lib/roles";
import TemplateSelect from "@/components/admin/TemplateSelect";
import ConversationThread, { type Thread } from "@/components/admin/ConversationThread";
import {
  ArrowLeft, Loader2, Sparkles, Send, X, Mail, Clock, FileText,
  ChevronLeft, ChevronRight, AlertTriangle, Check, Search, IndianRupee, Info,
} from "lucide-react";

const t1 = "#2a0a0e";
const t2 = "#7f5f5f";
const tM = "#9a7070";
const g = "#c9a84c";
const bg = "#3d0c11";
const cB = "rgba(61,12,17,0.08)";
const OK = "#1f7a4d";
const OFF = "#b3261e";

interface Row {
  pageId: string;
  templateType: string;
  templateLabel: string;
  userId: string;
  userName: string;
  userEmail: string;
  createdAt: string;
  updatedAt: string;
  daysIdle: number;
  isPaid: boolean;
  finalPricePaise: number;
  reason: string;
  reasonDetail: string;
  blockedByPrice: boolean;
  completeness: number;
  wordCount: number;
  photoCount: number;
  nudgedAt: string | null;
}

interface Stats {
  totalDrafts: number;
  priceBlocked: number;
  freeStalled: number;
  contacted: number;
  capped: boolean;
}

interface Detail {
  pageId: string;
  templateType: string;
  templateLabel: string;
  user: { name: string; email: string };
  summary: { completeness: number; filledFields: number; totalFields: number; wordCount: number; photoCount: number };
  verdict: { reason: string; detail: string; blockedByPrice: boolean };
  daysIdle: number;
  alreadyContacted: { sentAt: string; subject: string; body: string } | null;
  cooldown: { until: string } | null;
  sesConfigured: boolean;
  fromEmail: string;
  threads: Thread[];
  defaultThreadMode: "same" | "new";
  /** Whether replies arrive on their own, or have to be pasted in. */
  inbound: {
    configured: boolean;
    user?: string;
    filterAddresses: string[];
    pollSeconds?: number;
    lastOkAt?: string | null;
    lastError?: string;
    totalStored?: number;
  };
}

interface Pg { page: number; limit: number; total: number; totalPages: number }

const FILTERS = [
  { key: "all", label: "All drafts" },
  { key: "price-blocked", label: "Stopped by price" },
  { key: "free-stalled", label: "Free, unfinished" },
  { key: "not-contacted", label: "Not contacted" },
  { key: "contacted", label: "Contacted" },
  { key: "idle", label: "Idle 7d+" },
] as const;

/** Short human label per computed reason, plus the colour it earns. */
const REASON_META: Record<string, { label: string; color: string; bg: string }> = {
  paywall_abandoned:   { label: "Left at checkout", color: OFF,   bg: "rgba(179,38,30,0.10)" },
  price_not_attempted: { label: "Saw the price",    color: "#a8823a", bg: "rgba(201,168,76,0.16)" },
  ready_not_published: { label: "Finished, unpublished", color: OK, bg: "rgba(31,122,77,0.10)" },
  unfinished:          { label: "Stopped partway", color: t2,     bg: "rgba(61,12,17,0.06)" },
  just_started:        { label: "Barely started",  color: tM,     bg: "rgba(61,12,17,0.05)" },
};

function when(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.round(mins / 60)}h ago`;
  if (mins < 43200) return `${Math.round(mins / 1440)}d ago`;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function ReasonChip({ reason, small = false }: { reason: string; small?: boolean }) {
  const m = REASON_META[reason] || { label: reason, color: t2, bg: "rgba(61,12,17,0.06)" };
  return (
    <span
      style={{
        fontSize: small ? 10 : 10.5, fontWeight: 800, padding: small ? "3px 7px" : "4px 9px",
        borderRadius: 99, background: m.bg, color: m.color, flex: "none", whiteSpace: "nowrap",
      }}
    >
      {m.label}
    </span>
  );
}

/** A thin progress bar for how much of the template got filled in. */
function Progress({ value }: { value: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, flex: "none" }}>
      <div style={{ width: 46, height: 5, borderRadius: 99, background: "rgba(61,12,17,0.08)", overflow: "hidden" }}>
        <div
          style={{
            width: `${Math.max(2, Math.min(100, value))}%`, height: "100%", borderRadius: 99,
            background: value >= 70 ? OK : value >= 30 ? g : OFF,
          }}
        />
      </div>
      <span style={{ fontSize: 10.5, color: tM, minWidth: 26 }}>{value}%</span>
    </div>
  );
}

export default function AdminDraftsPage() {
  const router = useRouter();
  const { user, accessToken, isLoading } = useAppSelector((s) => s.auth);

  const [items, setItems] = useState<Row[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [templates, setTemplates] = useState<Array<{ templateType: string; label: string }>>([]);
  const [pg, setPg] = useState<Pg>({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [filter, setFilter] = useState<string>("all");
  const [templateType, setTemplateType] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [sesOn, setSesOn] = useState(true);

  const [sel, setSel] = useState<Detail | null>(null);
  const [selLoading, setSelLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [aiAssisted, setAiAssisted] = useState(false);
  const [drafting, setDrafting] = useState(false);
  const [sending, setSending] = useState(false);
  /** Set when the server refuses on a guard and offers "send anyway". */
  const [needsForce, setNeedsForce] = useState<string | null>(null);
  /**
   * Which conversation the next message joins.
   *
   * Chosen by the server on open (`defaultThreadMode`) so the safe answer —
   * continue a conversation if one exists — is decided in one place rather than
   * guessed here.
   */
  const [threadMode, setThreadMode] = useState<"same" | "new">("new");
  const [pasting, setPasting] = useState(false);

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
    setTimeout(() => setToast(null), 3000);
  }, []);

  const load = useCallback(
    async (page = 1) => {
      if (!accessToken || !allowed) return;
      setLoading(true);
      setError(null);
      try {
        const q = new URLSearchParams({ page: String(page), limit: "20", filter });
        if (templateType) q.set("templateType", templateType);
        if (search.trim()) q.set("search", search.trim());
        const res = await fetch(`${API_URL}/admin/drafts?${q}`, { headers: hdr() });
        const json = await res.json();
        if (!res.ok || !json.success) throw new Error(json.error || "Could not load drafts");
        setItems(json.data.items);
        setStats(json.data.stats);
        setPg(json.data.pagination);
        setTemplates(json.data.templates || []);
        setSesOn(Boolean(json.data.sesConfigured));
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not load drafts");
      } finally {
        setLoading(false);
      }
    },
    [accessToken, allowed, filter, templateType, search, hdr]
  );

  useEffect(() => {
    void load(1);
    // `search` is deliberately not a dependency — retyping would refetch on every
    // keystroke. It is submitted with Enter or the button.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, allowed, filter, templateType]);

  const open = async (row: Row) => {
    setSelLoading(true);
    setError(null);
    setSubject("");
    setBody("");
    setAiAssisted(false);
    setNeedsForce(null);
    try {
      const res = await fetch(
        `${API_URL}/admin/drafts/${encodeURIComponent(row.templateType)}/${encodeURIComponent(row.pageId)}`,
        { headers: hdr() }
      );
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Could not open this draft");
      setSel(json.data);
      setThreadMode(json.data.defaultThreadMode === "same" ? "same" : "new");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not open this draft");
    } finally {
      setSelLoading(false);
    }
  };

  /**
   * Reload the open draft — after a send, or after a reply is pasted in.
   *
   * `resetMode` is deliberately a parameter. After a SEND the composer is
   * emptied and the server's default is the right answer again. After a PASTE
   * it is not: the composer still holds unsent text and whatever mode was
   * chosen for it, and quietly flipping "New thread" back to "Same thread"
   * would change where that text goes without saying so.
   */
  const reopen = useCallback(
    async (templateType: string, pageId: string, resetMode: boolean) => {
      try {
        const res = await fetch(
          `${API_URL}/admin/drafts/${encodeURIComponent(templateType)}/${encodeURIComponent(pageId)}`,
          { headers: hdr() }
        );
        const json = await res.json();
        if (res.ok && json.success) {
          setSel(json.data);
          if (resetMode) setThreadMode(json.data.defaultThreadMode === "same" ? "same" : "new");
        }
      } catch {
        // Non-fatal: the send already succeeded and was reported. A stale
        // conversation view is a refresh away.
      }
    },
    [hdr]
  );

  const pasteReply = async (threadId: string, text: string) => {
    if (!sel || pasting) return;
    setPasting(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/admin/threads/${encodeURIComponent(threadId)}/inbound`, {
        method: "POST",
        headers: hdr(),
        body: JSON.stringify({ text }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Could not add the reply");
      await reopen(sel.templateType, sel.pageId, false);
      say("Added to the conversation");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not add the reply");
    } finally {
      setPasting(false);
    }
  };

  const generate = async () => {
    if (!sel || drafting) return;
    setDrafting(true);
    setError(null);
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
      setError(e instanceof Error ? e.message : "Could not generate the email");
    } finally {
      setDrafting(false);
    }
  };

  const send = async (force = false) => {
    if (!sel || sending) return;
    if (!subject.trim() || body.trim().length < 40) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch(
        `${API_URL}/admin/drafts/${encodeURIComponent(sel.templateType)}/${encodeURIComponent(sel.pageId)}/send`,
        {
          method: "POST",
          headers: hdr(),
          body: JSON.stringify({
            subject: subject.trim(),
            body: body.trim(),
            aiAssisted,
            force,
            threadMode,
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

      setItems((prev) =>
        prev.map((i) => (i.pageId === sel.pageId ? { ...i, nudgedAt: new Date().toISOString() } : i))
      );
      setStats((s) => (s ? { ...s, contacted: s.contacted + 1 } : s));
      setNeedsForce(null);
      setSubject("");
      setBody("");
      setAiAssisted(false);
      say(json.message || "Sent");

      // Refetch rather than patch the local copy. The send may have opened a
      // new conversation, appended to an existing one, or rewritten the
      // subject — the panel would have to reimplement all three rules to guess
      // the result, and a conversation view showing a message that is not
      // really there is worse than a moment's wait.
      await reopen(sel.templateType, sel.pageId, true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not send the email");
    } finally {
      setSending(false);
    }
  };

  /** The newest conversation about this draft — the one a reply joins. */
  const latestThread = useMemo(
    () => (sel?.threads?.length ? sel.threads[0] : null),
    [sel]
  );

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
        .ad-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
        @media (min-width: 980px) {
          .ad-grid { grid-template-columns: minmax(0,1fr) minmax(0,460px); align-items: start; }
          .ad-detail { position: sticky; top: 16px; }
        }
        @media (max-width: 979px) {
          /* z-index 189, not 60: components/BottomNav.tsx is z-[79], so the old
             value let the nav paint over this panel — and the nav element is
             82px tall, so the Send button needed clearing too. Same defect the
             early-access sheet had; both now use the same numbers. */
          .ad-detail {
            position: fixed; inset: 0; z-index: 189; overflow-y: auto;
            background: #f5ede6;
            padding: 14px 14px calc(82px + env(safe-area-inset-bottom, 0px) + 24px);
          }
        }
        .ad-filters { display: flex; gap: 7px; overflow-x: auto; padding-bottom: 2px; scrollbar-width: none; }
        .ad-filters::-webkit-scrollbar { display: none; }
        .ad-filters > button { flex: none; }
      `}</style>

      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "18px 14px 0" }}>
        <Link
          href="/admin/analytics"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: t2, textDecoration: "none", marginBottom: 14 }}
        >
          <ArrowLeft size={14} /> Admin
        </Link>

        <h1 style={{ margin: 0, fontSize: 23, fontWeight: 800, color: t1, letterSpacing: "-0.01em" }}>
          Unfinished drafts
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: 12.5, lineHeight: "18px", color: t2 }}>
          Started and never published. Each row says why. Follow-ups send from{" "}
          <strong>feedback@subhsandesh.in</strong>.
        </p>

        {/* SES not configured is not a subtle failure — say it before anybody
            writes an email that cannot be sent. */}
        {!sesOn && (
          <div
            style={{
              display: "flex", gap: 8, alignItems: "flex-start", marginTop: 12,
              padding: "10px 12px", borderRadius: 12,
              background: "rgba(179,38,30,0.08)", border: "1px solid rgba(179,38,30,0.22)",
            }}
          >
            <AlertTriangle size={15} style={{ color: OFF, flex: "none", marginTop: 1 }} />
            <span style={{ fontSize: 12.5, color: t1, lineHeight: 1.5 }}>
              <strong>SES is not configured on this deployment.</strong> Drafts and reasons work, and
              you can write emails, but sending is disabled until <code>SES_ACCESS_KEY_ID</code> and{" "}
              <code>SES_SECRET_ACCESS_KEY</code> are set.
            </span>
          </div>
        )}

        {/* ── Summary ─────────────────────────────────────────────────────── */}
        {stats && (
          <div
            style={{
              marginTop: 12, padding: "10px 13px", borderRadius: 13, background: "#fffdfb",
              border: `1px solid ${cB}`, display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center",
            }}
          >
            {[
              { label: "Drafts", value: stats.totalDrafts, color: t1 },
              { label: "By price", value: stats.priceBlocked, color: OFF },
              { label: "Unfinished", value: stats.freeStalled, color: "#a8823a" },
              { label: "Contacted", value: stats.contacted, color: OK },
            ].map((s) => (
              <div key={s.label}>
                <p style={{ margin: 0, fontSize: 19, fontWeight: 800, color: s.color, lineHeight: 1.15 }}>
                  {s.value}
                </p>
                <p style={{ margin: "1px 0 0", fontSize: 10.5, color: tM, whiteSpace: "nowrap" }}>{s.label}</p>
              </div>
            ))}
            {stats.capped && (
              <div style={{ display: "flex", gap: 6, alignItems: "flex-start", flex: "1 1 240px", minWidth: 220 }}>
                <Info size={13} style={{ color: tM, flex: "none", marginTop: 2 }} />
                <span style={{ fontSize: 11, color: tM, lineHeight: 1.5 }}>
                  One template has more drafts than a single sweep reads. Filter by template for a
                  complete list of that one.
                </span>
              </div>
            )}
          </div>
        )}

        {/* ── Controls ────────────────────────────────────────────────────── */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginTop: 14 }}>
          <div style={{ position: "relative", flex: "1 1 220px" }}>
            <Search size={15} style={{ position: "absolute", left: 11, top: 14, color: tM }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") void load(1); }}
              placeholder="Search name, email or template"
              style={{
                width: "100%", height: 44, paddingLeft: 34, paddingRight: 12, borderRadius: 12,
                border: `1px solid ${cB}`, background: "#fff", fontSize: 16, color: t1, outline: "none",
              }}
            />
          </div>
          <TemplateSelect
            value={templateType}
            options={templates}
            onChange={setTemplateType}
          />
          <button
            type="button"
            onClick={() => void load(1)}
            style={{
              height: 44, padding: "0 18px", borderRadius: 12, border: "none",
              background: bg, color: "#f5ede6", fontSize: 13.5, fontWeight: 700, cursor: "pointer",
            }}
          >
            Search
          </button>
        </div>

        <div className="ad-filters" style={{ marginTop: 12, marginBottom: 12 }}>
          {FILTERS.map((f) => {
            const on = filter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                style={{
                  height: 36, padding: "0 13px", borderRadius: 99,
                  border: `1px solid ${on ? bg : cB}`, background: on ? bg : "#fffdfb",
                  color: on ? "#f5ede6" : t2, fontSize: 12.5, fontWeight: 700, cursor: "pointer",
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
              display: "flex", gap: 8, alignItems: "flex-start", padding: "10px 12px", borderRadius: 12,
              background: "rgba(179,38,30,0.08)", border: "1px solid rgba(179,38,30,0.22)", marginBottom: 12,
            }}
          >
            <AlertTriangle size={15} style={{ color: OFF, flex: "none", marginTop: 1 }} />
            <span style={{ fontSize: 12.5, color: t1, lineHeight: 1.5 }}>{error}</span>
          </div>
        )}

        <div className="ad-grid">
          {/* ── List ────────────────────────────────────────────────────── */}
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
                <FileText size={26} style={{ color: "rgba(61,12,17,0.18)" }} />
                <p style={{ margin: "10px 0 0", fontSize: 14, fontWeight: 700, color: t1 }}>
                  Nothing here
                </p>
                <p style={{ margin: "4px 0 0", fontSize: 12.5, color: tM }}>
                  {filter === "all" && !templateType && !search
                    ? "Every page that has been started is published."
                    : "No drafts match this filter."}
                </p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 7 }}>
                {items.map((row) => {
                  const isOpen = sel?.pageId === row.pageId;
                  return (
                    <button
                      key={`${row.templateType}:${row.pageId}`}
                      type="button"
                      onClick={() => void open(row)}
                      style={{
                        textAlign: "left", padding: "11px 12px", borderRadius: 13, background: "#fffdfb",
                        border: `1px solid ${isOpen ? bg : cB}`,
                        boxShadow: isOpen ? "0 2px 12px rgba(61,12,17,0.08)" : "none",
                        cursor: "pointer", display: "block", width: "100%",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap", marginBottom: 7 }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: t1 }}>{row.templateLabel}</span>
                        <ReasonChip reason={row.reason} />
                        {row.isPaid && (
                          <span style={{ display: "inline-flex", alignItems: "center", fontSize: 10.5, fontWeight: 700, color: "#8b5a2b" }}>
                            <IndianRupee size={10} />{Math.round(row.finalPricePaise / 100)}
                          </span>
                        )}
                        {row.nudgedAt && (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 3, fontSize: 10.5, color: OK, fontWeight: 700 }}>
                            <Check size={11} /> contacted
                          </span>
                        )}
                        <span style={{ marginLeft: "auto", fontSize: 11, color: tM, flex: "none" }}>
                          {when(row.createdAt)}
                        </span>
                      </div>

                      <p style={{ margin: "0 0 8px", fontSize: 12.5, lineHeight: "18px", color: t2 }}>
                        {row.reasonDetail}
                      </p>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
                        <span style={{ fontSize: 11.5, fontWeight: 700, color: t1 }}>{row.userName || "—"}</span>
                        <span style={{ fontSize: 11.5, color: tM }}>{row.userEmail}</span>
                        <Progress value={row.completeness} />
                        <span style={{ fontSize: 10.5, color: tM }}>
                          {row.wordCount}w · {row.photoCount} photo{row.photoCount === 1 ? "" : "s"} · idle {row.daysIdle}d
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {pg.totalPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 14 }}>
                <button
                  type="button" disabled={pg.page <= 1} onClick={() => void load(pg.page - 1)}
                  style={{
                    width: 38, height: 38, borderRadius: 12, border: `1px solid ${cB}`, background: "#fffdfb",
                    color: pg.page <= 1 ? tM : t1, display: "grid", placeItems: "center",
                    cursor: pg.page <= 1 ? "default" : "pointer",
                  }}
                >
                  <ChevronLeft size={16} />
                </button>
                <span style={{ fontSize: 12.5, color: t2 }}>Page {pg.page} of {pg.totalPages}</span>
                <button
                  type="button" disabled={pg.page >= pg.totalPages} onClick={() => void load(pg.page + 1)}
                  style={{
                    width: 38, height: 38, borderRadius: 12, border: `1px solid ${cB}`, background: "#fffdfb",
                    color: pg.page >= pg.totalPages ? tM : t1, display: "grid", placeItems: "center",
                    cursor: pg.page >= pg.totalPages ? "default" : "pointer",
                  }}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>

          {/* ── Detail + composer ───────────────────────────────────────── */}
          {(sel || selLoading) && (
            <div className="ad-detail">
              <div style={{ background: "#fffdfb", border: `1px solid ${cB}`, borderRadius: 16, padding: 14 }}>
                {selLoading || !sel ? (
                  <div style={{ padding: 30, display: "grid", placeItems: "center" }}>
                    <Loader2 size={20} className="animate-spin" style={{ color: g }} />
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 12 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 14, fontWeight: 800, color: t1 }}>{sel.templateLabel}</span>
                          <ReasonChip reason={sel.verdict.reason} />
                        </div>
                        <p style={{ margin: "7px 0 0", fontSize: 13, fontWeight: 700, color: t1 }}>
                          {sel.user.name || "—"}
                        </p>
                        <a
                          href={`mailto:${sel.user.email}`}
                          style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: "#8b5a2b", textDecoration: "none", marginTop: 2 }}
                        >
                          <Mail size={12} /> {sel.user.email}
                        </a>
                        <p style={{ margin: "6px 0 0", fontSize: 11.5, color: tM, display: "flex", alignItems: "center", gap: 5 }}>
                          <Clock size={11} /> idle {sel.daysIdle} day{sel.daysIdle === 1 ? "" : "s"}
                        </p>
                      </div>
                      <button
                        type="button" onClick={() => setSel(null)} aria-label="Close"
                        style={{
                          width: 34, height: 34, borderRadius: 11, border: `1px solid ${cB}`, background: "#fff",
                          color: t2, display: "grid", placeItems: "center", cursor: "pointer", flex: "none",
                        }}
                      >
                        <X size={15} />
                      </button>
                    </div>

                    {/* What we know. Shape only — deliberately not their words. */}
                    <div style={{ padding: 12, borderRadius: 12, background: "#f7eee5", borderLeft: `3px solid ${g}`, marginBottom: 12 }}>
                      <p style={{ margin: 0, fontSize: 13, lineHeight: "20px", color: t1 }}>
                        {sel.verdict.detail}
                      </p>
                      <div style={{ display: "flex", gap: 14, marginTop: 9, flexWrap: "wrap", alignItems: "center" }}>
                        <Progress value={sel.summary.completeness} />
                        <span style={{ fontSize: 11, color: tM }}>
                          {sel.summary.filledFields}/{sel.summary.totalFields} fields ·{" "}
                          {sel.summary.wordCount} words · {sel.summary.photoCount} photo
                          {sel.summary.photoCount === 1 ? "" : "s"}
                        </span>
                      </div>
                      <p style={{ margin: "9px 0 0", fontSize: 10.5, color: tM, lineHeight: 1.5 }}>
                        Their draft&apos;s contents are not shown here and are never sent to the AI —
                        only these counts are. An unpublished page has not been shown to anybody.
                      </p>
                    </div>

                    {/* ── The conversation so far ───────────────────────
                        Replaces what used to be an echo of the single last
                        email we sent. That echo was fine when there could only
                        ever be one message; now that a creator can reply and be
                        replied to, showing one side of a conversation would read
                        as if they never answered. */}
                    {sel.threads.length > 0 && (
                      <div style={{ marginBottom: 12 }}>
                        <p style={{ margin: "0 0 7px", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: tM }}>
                          Conversation
                        </p>
                        {sel.threads.map((th) => (
                          <ConversationThread
                            key={th.id}
                            thread={th}
                            pasting={pasting}
                            // Hidden once the mailbox poller is running: telling
                            // somebody to paste a reply that is already being
                            // collected invites a duplicate of it.
                            onPaste={
                              sel.inbound?.configured ? undefined : (text) => pasteReply(th.id, text)
                            }
                          />
                        ))}
                      </div>
                    )}

                    {sel.threads.length === 0 && sel.alreadyContacted && (
                      // A follow-up sent before conversations existed: the
                      // ledger row survives, the thread does not.
                      <div
                        style={{
                          marginBottom: 12, padding: 10, borderRadius: 12,
                          background: "rgba(61,12,17,0.04)", border: `1px solid ${cB}`,
                        }}
                      >
                        <p style={{ margin: "0 0 4px", fontSize: 10.5, color: tM, fontWeight: 700 }}>
                          Sent {new Date(sel.alreadyContacted.sentAt).toDateString()} · before conversations were recorded
                        </p>
                        <p style={{ margin: "0 0 5px", fontSize: 12.5, fontWeight: 700, color: t1 }}>
                          {sel.alreadyContacted.subject}
                        </p>
                        <p style={{ margin: 0, fontSize: 12.5, lineHeight: "19px", color: t2, whiteSpace: "pre-wrap" }}>
                          {sel.alreadyContacted.body}
                        </p>
                      </div>
                    )}

                    {sel.cooldown && !sel.alreadyContacted && (
                      <p style={{ margin: "0 0 12px", fontSize: 11.5, color: "#a8823a", lineHeight: 1.5 }}>
                        This person was emailed about another draft recently. Sending is held until{" "}
                        {new Date(sel.cooldown.until).toDateString()} unless you override it.
                      </p>
                    )}

                    <p style={{ margin: "0 0 8px", fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: tM }}>
                      {latestThread ? "Write again" : "Follow-up email"}
                    </p>

                    {/* ── Same thread, or a new one ─────────────────────────
                        Only shown when there IS a conversation to continue —
                        a two-way switch with one reachable side is noise. */}
                    {latestThread && (
                      <div style={{ marginBottom: 10 }}>
                        <div
                          role="radiogroup"
                          aria-label="Where this message goes"
                          style={{
                            display: "flex", gap: 4, padding: 3, borderRadius: 11,
                            background: "rgba(61,12,17,0.05)", border: `1px solid ${cB}`,
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
                                  background: on ? "#fff" : "transparent",
                                  boxShadow: on ? "0 1px 4px rgba(61,12,17,0.10)" : "none",
                                  color: on ? t1 : t2,
                                  fontSize: 12.5, fontWeight: on ? 800 : 600, cursor: "pointer",
                                }}
                              >
                                {opt.label}
                              </button>
                            );
                          })}
                        </div>
                        <p style={{ margin: "5px 0 0", fontSize: 10.5, color: tM, lineHeight: 1.5 }}>
                          {usingThread
                            ? "Goes into the conversation above, so they see one thread and not two emails."
                            : "Starts a separate conversation. Right when the subject genuinely changed."}
                        </p>
                      </div>
                    )}

                    <button
                      type="button" onClick={() => void generate()} disabled={drafting}
                      style={{
                        width: "100%", minHeight: 44, borderRadius: 12, marginBottom: 10,
                        border: `1px solid ${g}`, background: "rgba(201,168,76,0.14)", color: "#8b5a2b",
                        fontSize: 13.5, fontWeight: 700, display: "flex", alignItems: "center",
                        justifyContent: "center", gap: 7, cursor: drafting ? "default" : "pointer",
                      }}
                    >
                      {drafting ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
                      {drafting ? "Writing…" : "Generate email"}
                    </button>

                    {/* The subject is derived when replying, and the server
                        derives it again and ignores what we send. It is one of
                        the three things holding a thread together, so letting
                        it drift would break the only thing this mode promises.
                        Shown, not hidden — the recipient sees it. */}
                    <input
                      value={usingThread ? replyingSubject : subject}
                      onChange={(e) => setSubject(e.target.value)}
                      readOnly={usingThread}
                      placeholder="Subject"
                      title={usingThread ? "Fixed while replying in the same thread — changing it would split the conversation" : undefined}
                      style={{
                        width: "100%", height: 44, padding: "0 12px",
                        marginBottom: usingThread ? 3 : 8, borderRadius: 12,
                        border: `1px solid ${cB}`,
                        background: usingThread ? "rgba(61,12,17,0.04)" : "#fff",
                        fontSize: 16, color: usingThread ? t2 : t1, outline: "none",
                        cursor: usingThread ? "default" : "text",
                      }}
                    />
                    {usingThread && (
                      <p style={{ margin: "0 0 8px", fontSize: 10.5, color: tM }}>
                        Fixed while replying — a changed subject splits the thread in their inbox.
                      </p>
                    )}
                    <textarea
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="What we send them. Edit anything before it goes."
                      rows={10}
                      style={{
                        width: "100%", padding: 12, borderRadius: 12, resize: "vertical",
                        border: `1px solid ${cB}`, background: "#fff", fontSize: 16, lineHeight: "23px",
                        color: t1, outline: "none", fontFamily: "inherit",
                      }}
                    />

                    {needsForce ? (
                      <div
                        style={{
                          marginTop: 10, padding: 11, borderRadius: 12,
                          background: "rgba(201,168,76,0.14)", border: `1px solid ${g}`,
                        }}
                      >
                        <p style={{ margin: "0 0 9px", fontSize: 12.5, color: t1, lineHeight: 1.5 }}>
                          {needsForce}
                        </p>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            type="button" onClick={() => void send(true)} disabled={sending}
                            style={{
                              flex: 1, minHeight: 42, borderRadius: 10, border: "none", background: bg,
                              color: "#fff", fontSize: 13.5, fontWeight: 800, cursor: sending ? "default" : "pointer",
                              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                            }}
                          >
                            {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                            Send anyway
                          </button>
                          <button
                            type="button" onClick={() => setNeedsForce(null)}
                            style={{
                              minHeight: 42, padding: "0 16px", borderRadius: 10, border: `1px solid ${cB}`,
                              background: "#fff", color: t2, fontSize: 13, fontWeight: 700, cursor: "pointer",
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button" onClick={() => void send(false)} disabled={!canSend || !sel.sesConfigured}
                        title={sel.sesConfigured ? undefined : "SES is not configured on this deployment"}
                        style={{
                          width: "100%", minHeight: 46, borderRadius: 12, marginTop: 10, border: "none",
                          background: canSend && sel.sesConfigured ? "linear-gradient(135deg,#3d0c11,#5a1620)" : "rgba(61,12,17,0.12)",
                          color: canSend && sel.sesConfigured ? "#fff" : tM,
                          fontSize: 14.5, fontWeight: 800, display: "flex", alignItems: "center",
                          justifyContent: "center", gap: 7,
                          cursor: canSend && sel.sesConfigured ? "pointer" : "default",
                        }}
                      >
                        {sending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
                        {sending
                          ? "Sending"
                          : usingThread
                            ? `Reply from ${sel.fromEmail}`
                            : `Send from ${sel.fromEmail}`}
                      </button>
                    )}

                    {/* Where a reply lands. Worth stating plainly: the whole
                        point of sending from feedback@ rather than a no-reply
                        address is that the creator can answer, and whoever is
                        sending should know somebody has to read that mailbox. */}
                    <p style={{ margin: "8px 0 0", fontSize: 10.5, color: tM, lineHeight: 1.5 }}>
                      If they reply, it goes to <strong style={{ color: t2 }}>{sel.fromEmail}</strong>.{" "}
                      {sel.inbound?.configured
                        ? `It appears above on its own within ${Math.round((sel.inbound.pollSeconds || 120) / 60) || 1} min.`
                        : "Paste it back in above and the conversation stays in one place."}
                    </p>
                    {sel.inbound?.configured && sel.inbound.lastError ? (
                      // Loud, because a silently broken poller looks exactly
                      // like a creator who never replied.
                      <p style={{ margin: "6px 0 0", fontSize: 10.5, color: OFF, lineHeight: 1.5 }}>
                        The mailbox watcher is failing: {sel.inbound.lastError}
                      </p>
                    ) : null}

                    {body.trim().length > 0 && body.trim().length < 40 && (
                      <p style={{ margin: "8px 0 0", fontSize: 11.5, color: OFF }}>
                        A little longer before this can go out.
                      </p>
                    )}

                    {aiAssisted && (
                      <p style={{ margin: "9px 0 0", fontSize: 11.5, color: tM, lineHeight: 1.5 }}>
                        This started as a generated draft. Read it. It cannot offer a discount or a
                        free publish — the server throws the draft away if it tries — but it can still
                        be wrong about tone, and this email arrives uninvited.
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
        <div
          style={{
            position: "fixed", bottom: 84, left: "50%", transform: "translateX(-50%)", zIndex: 80,
            padding: "11px 18px", borderRadius: 99, background: bg, color: "#f5ede6",
            fontSize: 13, fontWeight: 600, boxShadow: "0 10px 30px -10px rgba(26,5,7,0.6)",
            maxWidth: "90vw", textAlign: "center",
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
