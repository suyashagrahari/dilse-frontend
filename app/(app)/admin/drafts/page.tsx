"use client";

// ─── /admin/drafts — pages nobody finished, and writing to ask why ────────────
//
// Every unpublished page across all 43 templates, newest first, each one saying
// WHY it stalled and WHAT is still empty — and a composer that can write the
// follow-up.
//
// ── THE REASON CHIP IS THE WHOLE POINT ──────────────────────────────────────
//
// A list of drafts is not useful; a list that separates "hit a ₹99 paywall and
// walked" from "typed two words and left" is. The first is a pricing signal, the
// second is an onboarding one, and they are different problems with different
// emails. The reason is computed on the server from the pricing, the payment
// orders and how much of the template is filled in — not guessed by the model.
//
// ── AND THE MISSING FIELDS ARE THE SECOND HALF OF IT ────────────────────────
//
// "46% filled" says how far somebody got, not what stopped them. A draft
// missing only a photo is one upload from done; a draft missing the message,
// the recipient and the date was abandoned in the first thirty seconds. Both
// read as 46%. So every row names what is still empty — field names only,
// which discloses nothing, because an empty field has nothing in it.
//
// ── TWO BUTTONS, NEVER ONE ──────────────────────────────────────────────────
//
// "Generate email" fills the composer. "Send follow-up" mails it. Nothing does
// both, and the composer is never pre-filled on open, so nobody can send an
// email they have not read. This matters more here than anywhere else in the
// admin: this is the only mail the platform sends that the recipient did not ask
// for, about a document they have not shown to anybody.
//
// The AI also cannot offer anything — no discount, no coupon, no free publish.
// That was a deliberate product decision and the server enforces it by throwing
// the draft away if the model tries. If you want to make an offer, type it in.
//
// ── LAYOUT ──────────────────────────────────────────────────────────────────
//
// List and panel side by side from 980px; below that the panel is a full-screen
// sheet, because a 460px composer next to a 360px list is neither. The row is
// four short lines and no prose — the sentence explaining the reason lives in
// the panel, where somebody is deciding what to write rather than scanning for
// which draft to open.

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { API_URL } from "@/lib/config";
import { BRAND } from "@/lib/brand";
import { isSuperAdmin } from "@/lib/roles";
import TemplateSelect from "@/components/admin/TemplateSelect";
import {
  ArrowLeft, Loader2, FileText, ChevronLeft, ChevronRight,
  Search, Info,
} from "lucide-react";
import DraftDetail from "./DraftDetail";
import DraftRowCard from "./DraftRowCard";
import SortToggle, { type SortOrder } from "@/components/admin/SortToggle";
import { FILTERS, type Detail, type Pg, type Row, type Stats } from "./types";
import { Stat, Warn } from "./parts";

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
  const [sort, setSort] = useState<SortOrder>("newest");
  /**
   * The `?search=` in the URL, once read. `null` means "not read yet".
   *
   * The profile's Drafts tab links here with an email in the query so the
   * composer is one click from the profile rather than a search away.
   *
   * Read in an effect rather than with `useSearchParams()`: that hook opts the
   * whole page out of static prerendering unless it is wrapped in Suspense, and
   * doing it in a lazy `useState` initialiser instead would render one value on
   * the server and another on the client — a hydration mismatch on an input.
   * The state doubles as the first-load gate so the initial fetch already
   * carries the filter instead of firing twice.
   */
  const [urlSearch, setUrlSearch] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [sesOn, setSesOn] = useState(true);

  const [sel, setSel] = useState<Detail | null>(null);
  const [selLoading, setSelLoading] = useState(false);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("search") || "";
    setSearch(q);
    setUrlSearch(q);
  }, []);

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
        const q = new URLSearchParams({ page: String(page), limit: "20", filter, sort });
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
    [accessToken, allowed, filter, templateType, search, sort, hdr]
  );

  useEffect(() => {
    // Wait for the URL to be read, so a linked-in filter is part of the FIRST
    // request rather than a second one that replaces its results.
    if (urlSearch === null) return;
    void load(1);
    // `search` is deliberately not a dependency — retyping would refetch on
    // every keystroke. It is submitted with Enter or the button.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, allowed, filter, templateType, sort, urlSearch]);

  const fetchDetail = useCallback(
    async (type: string, pageId: string): Promise<Detail | null> => {
      const res = await fetch(
        `${API_URL}/admin/drafts/${encodeURIComponent(type)}/${encodeURIComponent(pageId)}`,
        { headers: hdr() }
      );
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || "Could not open this draft");
      return json.data as Detail;
    },
    [hdr]
  );

  const open = async (row: Row) => {
    setSelLoading(true);
    setError(null);
    try {
      setSel(await fetchDetail(row.templateType, row.pageId));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not open this draft");
    } finally {
      setSelLoading(false);
    }
  };

  /**
   * Reload the open draft — after a send, or after a reply is pasted in.
   *
   * Hands the fresh copy BACK rather than only storing it. Deciding what the
   * composer does next — whether the thread-mode toggle moves — belongs to the
   * panel that owns the composer, and it cannot decide that without seeing the
   * server's new default.
   */
  const reload = useCallback(async (): Promise<Detail | null> => {
    if (!sel) return null;
    try {
      const fresh = await fetchDetail(sel.templateType, sel.pageId);
      if (fresh) setSel(fresh);
      return fresh;
    } catch {
      // Non-fatal: whatever prompted the reload already succeeded and was
      // reported. A stale panel is a refresh away.
      return null;
    }
  }, [sel, fetchDetail]);

  /** A follow-up went out: mark the row contacted without refetching the list. */
  const onSent = useCallback((pageId: string) => {
    setItems((prev) =>
      prev.map((i) => (i.pageId === pageId ? { ...i, nudgedAt: new Date().toISOString() } : i))
    );
    setStats((s) => (s ? { ...s, contacted: s.contacted + 1 } : s));
  }, []);

  if (!allowed) {
    return (
      <div style={{ minHeight: "60vh", display: "grid", placeItems: "center", background: BRAND.bg }}>
        <Loader2 size={22} className="animate-spin" style={{ color: BRAND.gold }} />
      </div>
    );
  }

  const chipBase: React.CSSProperties = {
    height: 36, padding: "0 13px", borderRadius: 99, fontSize: 12.5, fontWeight: 700,
    cursor: "pointer", touchAction: "manipulation",
  };

  return (
    <div style={{ minHeight: "100vh", background: BRAND.bg, paddingBottom: 90 }}>
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
            background: ${BRAND.bg};
            padding: 14px 14px calc(82px + env(safe-area-inset-bottom, 0px) + 24px);
          }
        }
        .ad-filters { display: flex; gap: 7px; overflow-x: auto; padding-bottom: 2px; scrollbar-width: none; }
        .ad-filters::-webkit-scrollbar { display: none; }
        .ad-filters > button { flex: none; }

        /* The row's hover lift. Kept to a border and a shadow — a transform
           would move the profile link out from under the cursor on its way to
           being clicked. */
        .ad-row { position: relative; }
        .ad-row-btn {
          text-align: left; width: 100%; display: block; cursor: pointer;
          background: ${BRAND.surface}; border-radius: 13px;
          transition: border-color 140ms ease, box-shadow 140ms ease;
        }
        .ad-row-btn:hover { border-color: rgba(61,12,17,0.22); box-shadow: 0 2px 10px rgba(61,12,17,0.06); }
        .ad-row-btn:focus-visible { outline: 2px solid ${BRAND.gold}; outline-offset: 2px; }
        @media (prefers-reduced-motion: reduce) { .ad-row-btn { transition: none } }
      `}</style>

      <div style={{ maxWidth: 1240, margin: "0 auto", padding: "18px 14px 0" }}>
        <Link
          href="/admin/analytics"
          style={{
            display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13,
            color: BRAND.muted, textDecoration: "none", marginBottom: 14,
          }}
        >
          <ArrowLeft size={14} /> Admin
        </Link>

        <h1 style={{ margin: 0, fontSize: 23, fontWeight: 800, color: BRAND.text, letterSpacing: "-0.01em" }}>
          Unfinished drafts
        </h1>
        <p style={{ margin: "4px 0 0", fontSize: 12.5, lineHeight: "18px", color: BRAND.muted }}>
          Started and never published. Each row says why it stalled and what is still empty —
          open one to see the whole list and write to whoever made it.
        </p>

        {/* SES not configured is not a subtle failure — say it before anybody
            writes an email that cannot be sent. */}
        {!sesOn && (
          <div style={{ marginTop: 12 }}>
            <Warn>
              <strong>SES is not configured on this deployment.</strong> Drafts and reasons work, and
              you can write emails, but sending is disabled until <code>SES_ACCESS_KEY_ID</code> and{" "}
              <code>SES_SECRET_ACCESS_KEY</code> are set.
            </Warn>
          </div>
        )}

        {/* ── Summary ─────────────────────────────────────────────────────── */}
        {stats && (
          <div
            style={{
              marginTop: 12, padding: "10px 13px", borderRadius: 13, background: BRAND.surface,
              border: `1px solid ${BRAND.border}`, display: "flex", flexWrap: "wrap", gap: 16,
              alignItems: "center",
            }}
          >
            <Stat label="Drafts" value={stats.totalDrafts} color={BRAND.text} />
            <Stat label="By price" value={stats.priceBlocked} color={BRAND.danger} />
            <Stat label="Unfinished" value={stats.freeStalled} color={BRAND.goldDeep} />
            <Stat label="Contacted" value={stats.contacted} color={BRAND.ok} />
            {!!stats.hiddenNoOwner && stats.hiddenNoOwner > 0 && (
              <div style={{ display: "flex", gap: 6, alignItems: "flex-start", flex: "1 1 240px", minWidth: 220 }}>
                <Info size={13} style={{ color: BRAND.faint, flex: "none", marginTop: 2 }} />
                <span style={{ fontSize: 11, color: BRAND.faint, lineHeight: 1.5 }}>
                  {stats.hiddenNoOwner} draft{stats.hiddenNoOwner === 1 ? "" : "s"} not listed —
                  the account that made {stats.hiddenNoOwner === 1 ? "it" : "them"} no longer
                  exists, so there is nobody to write to.
                </span>
              </div>
            )}
            {stats.capped && (
              <div style={{ display: "flex", gap: 6, alignItems: "flex-start", flex: "1 1 240px", minWidth: 220 }}>
                <Info size={13} style={{ color: BRAND.faint, flex: "none", marginTop: 2 }} />
                <span style={{ fontSize: 11, color: BRAND.faint, lineHeight: 1.5 }}>
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
            <Search size={15} style={{ position: "absolute", left: 11, top: 14, color: BRAND.faint }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") void load(1); }}
              placeholder="Search name, email or template"
              style={{
                width: "100%", height: 44, paddingLeft: 34, paddingRight: 12, borderRadius: 12,
                border: `1px solid ${BRAND.border}`, background: BRAND.surface, fontSize: 16,
                color: BRAND.text, outline: "none",
              }}
            />
          </div>
          <TemplateSelect value={templateType} options={templates} onChange={setTemplateType} />
          <button
            type="button"
            onClick={() => void load(1)}
            style={{
              height: 44, padding: "0 18px", borderRadius: 12, border: "none",
              background: BRAND.accentStrong, color: BRAND.bg, fontSize: 13.5, fontWeight: 700,
              cursor: "pointer",
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
                aria-pressed={on}
                onClick={() => setFilter(f.key)}
                style={{
                  ...chipBase,
                  border: `1px solid ${on ? BRAND.accentStrong : BRAND.border}`,
                  background: on ? BRAND.accentStrong : BRAND.surface,
                  color: on ? BRAND.bg : BRAND.muted,
                }}
              >
                {f.label}
              </button>
            );
          })}
          {/* Pushed to the end of the row so the filters keep their reading
              order and the sort sits where the list starts. It is `flex: none`
              inside a scrolling row, so on a phone it scrolls into view with
              the last filter rather than squashing them. */}
          <div style={{ marginLeft: "auto", paddingLeft: 6, display: "flex", alignItems: "center" }}>
            <SortToggle value={sort} onChange={setSort} />
          </div>
        </div>

        {error && (
          <div style={{ marginBottom: 12 }}>
            <Warn>{error}</Warn>
          </div>
        )}

        <div className="ad-grid">
          {/* ── List ────────────────────────────────────────────────────── */}
          <div>
            {loading ? (
              <div style={{ padding: 40, display: "grid", placeItems: "center" }}>
                <Loader2 size={20} className="animate-spin" style={{ color: BRAND.gold }} />
              </div>
            ) : items.length === 0 ? (
              <div
                style={{
                  padding: "44px 20px", textAlign: "center", borderRadius: 14,
                  background: BRAND.surface, border: `1px solid ${BRAND.border}`,
                }}
              >
                <FileText size={26} style={{ color: "rgba(61,12,17,0.18)" }} />
                <p style={{ margin: "10px 0 0", fontSize: 14, fontWeight: 700, color: BRAND.text }}>
                  Nothing here
                </p>
                <p style={{ margin: "4px 0 0", fontSize: 12.5, color: BRAND.faint }}>
                  {filter === "all" && !templateType && !search
                    ? "Every page that has been started is published."
                    : "No drafts match this filter."}
                </p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 7 }}>
                {items.map((row) => (
                  <DraftRowCard
                    key={`${row.templateType}:${row.pageId}`}
                    row={row}
                    isOpen={sel?.pageId === row.pageId}
                    onOpen={() => void open(row)}
                  />
                ))}
              </div>
            )}

            {pg.totalPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 14 }}>
                <button
                  type="button" disabled={pg.page <= 1} onClick={() => void load(pg.page - 1)}
                  aria-label="Previous page"
                  style={{
                    width: 38, height: 38, borderRadius: 12, border: `1px solid ${BRAND.border}`,
                    background: BRAND.surface, color: pg.page <= 1 ? BRAND.faint : BRAND.text,
                    display: "grid", placeItems: "center",
                    cursor: pg.page <= 1 ? "default" : "pointer",
                  }}
                >
                  <ChevronLeft size={16} />
                </button>
                <span style={{ fontSize: 12.5, color: BRAND.muted }}>
                  Page {pg.page} of {pg.totalPages}
                </span>
                <button
                  type="button" disabled={pg.page >= pg.totalPages} onClick={() => void load(pg.page + 1)}
                  aria-label="Next page"
                  style={{
                    width: 38, height: 38, borderRadius: 12, border: `1px solid ${BRAND.border}`,
                    background: BRAND.surface,
                    color: pg.page >= pg.totalPages ? BRAND.faint : BRAND.text,
                    display: "grid", placeItems: "center",
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
              {selLoading || !sel ? (
                <div
                  style={{
                    background: BRAND.surface, border: `1px solid ${BRAND.border}`,
                    borderRadius: BRAND.radiusLg, padding: 30,
                    display: "grid", placeItems: "center",
                  }}
                >
                  <Loader2 size={20} className="animate-spin" style={{ color: BRAND.gold }} />
                </div>
              ) : (
                // Keyed on the draft: switching rows unmounts the composer, so
                // text typed for one person can never be sent to another.
                <DraftDetail
                  key={sel.pageId}
                  detail={sel}
                  hdr={hdr}
                  say={say}
                  onClose={() => setSel(null)}
                  onReload={reload}
                  onSent={onSent}
                  onError={setError}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {toast && (
        <div
          role="status"
          style={{
            position: "fixed", bottom: 84, left: "50%", transform: "translateX(-50%)", zIndex: 200,
            padding: "11px 18px", borderRadius: 99, background: BRAND.accentStrong, color: BRAND.bg,
            fontSize: 13, fontWeight: 600, boxShadow: BRAND.shadowElevated,
            maxWidth: "90vw", textAlign: "center",
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
