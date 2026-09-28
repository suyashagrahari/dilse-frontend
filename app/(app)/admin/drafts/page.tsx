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
// List and panel side by side from 980px, the panel sticky under the admin
// navbar; below that the panel is a full-screen sheet, because a 460px composer
// next to a 360px list is neither. The row is
// four short lines and no prose — the sentence explaining the reason lives in
// the panel, where somebody is deciding what to write rather than scanning for
// which draft to open.

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAppSelector } from "@/store/hooks";
import { API_URL } from "@/lib/config";
import { BRAND } from "@/lib/brand";
import { isSuperAdmin } from "@/lib/roles";
import TemplateSelect from "@/components/admin/TemplateSelect";
import { Loader2, FileText, ChevronLeft, ChevronRight, Search, Info } from "lucide-react";
import { A, AdminPage, ChipGroup, EmptyState, Hero, HeroStat, Loading, SearchBox } from "../adminKit";
import DraftDetail from "./DraftDetail";
import DraftRowCard from "./DraftRowCard";
import SortToggle, { type SortOrder } from "@/components/admin/SortToggle";
import { FILTERS, type Detail, type Pg, type Row, type Stats } from "./types";
import { Warn } from "./parts";

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
      <div style={{ minHeight: "60vh", display: "grid", placeItems: "center" }}>
        <Loader2 size={22} className="animate-spin" style={{ color: BRAND.gold }} />
      </div>
    );
  }

  return (
    <AdminPage
      title="Unfinished drafts"
      subtitle="Started and never published. Each card says why it stalled and what is still empty — open one to see the whole list and write to whoever made it."
      icon={<FileText size={18} />}
    >
      <style>{`
        .ad-grid { display: grid; grid-template-columns: minmax(0,1fr); gap: 12px; }
        @media (min-width: 980px) {
          .ad-grid { grid-template-columns: minmax(0,1fr) minmax(0,460px); align-items: start; }
          /* Sticky under the fixed admin navbar. Capped to the viewport and
             scrolling on its own: the composer is taller than most screens, and
             a sticky panel taller than the viewport hides its Send button until
             the list runs out. */
          .ad-detail {
            position: sticky; top: calc(var(--adm-top) + 8px);
            max-height: calc(100dvh - var(--adm-top) - 16px); overflow-y: auto;
            border-radius: 16px; scrollbar-width: thin;
          }
        }
        @media (max-width: 979px) {
          /* z-index 189, not 60: components/BottomNav.tsx is z-[79], so the old
             value let the nav paint over this panel — and the nav element is
             82px tall, so the Send button needed clearing too. Same defect the
             early-access sheet had; both now use the same numbers. */
          .ad-detail {
            position: fixed; inset: 0; z-index: 189; overflow-y: auto; overscroll-behavior: contain;
            background: ${BRAND.bg};
            padding: 12px 12px calc(82px + env(safe-area-inset-bottom, 0px) + 24px);
          }
          /* 16px stops iOS zooming the page on focus. */
          .ad-controls .adk-search input { font-size: 16px; }
        }

        .ad-hero-grid { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 12px 14px; align-items: end; }
        .ad-hero-grid > :first-child { grid-column: 1 / -1; }
        @media (min-width: 640px) {
          .ad-hero-grid { grid-template-columns: minmax(0,1.4fr) repeat(3, minmax(0,1fr)); }
          .ad-hero-grid > :first-child { grid-column: auto; }
        }
        .ad-controls { display: grid; grid-template-columns: minmax(0,1fr) auto; gap: 8px; align-items: center; margin-bottom: 10px; }
        .ad-controls > .adk-search { grid-column: 1 / -1; }
        @media (min-width: 720px) {
          .ad-controls { grid-template-columns: minmax(0,1fr) auto auto; }
          .ad-controls > .adk-search { grid-column: auto; }
        }
        .ad-controls .adk-search, .ad-controls .adk-btn { height: 40px; }
        .ad-controls > :nth-child(2) { min-width: 0; }
        .ad-filterbar { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; min-width: 0; }

        /* The lift lives on the wrapper so the profile link moves with the
           card; the button itself only changes border and shadow. */
        .ad-row { position: relative; transition: transform .18s; min-width: 0; }
        .ad-row:hover { transform: translateY(-2px); }
        .ad-row .ad-row-btn:hover { transform: none; }
        .ad-row-btn:focus-visible { outline: 2px solid ${A.gold}; outline-offset: 2px; }
        .ad-row-stripe { position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: var(--ad-acc); opacity: .75; }
        .ad-row-btn[data-on="1"] .ad-row-stripe { width: 4px; opacity: 1; }
        .ad-row-profile {
          position: absolute; top: 8px; right: 8px; display: inline-flex; align-items: center; gap: 4px;
          min-height: 26px; padding: 4px 9px; border-radius: 99px; border: 1px solid ${A.edge};
          background: rgba(201,168,76,.12); font-size: 10.5px; font-weight: 800; color: ${A.goldDeep};
          text-decoration: none; transition: background .15s, color .15s;
        }
        .ad-row-profile:hover { background: ${A.maroon}; color: #fff6e6; }
        @media (prefers-reduced-motion: reduce) { .ad-row, .ad-row-btn { transition: none } .ad-row:hover { transform: none } }
      `}</style>

      {/* SES not configured is not a subtle failure — say it before anybody
          writes an email that cannot be sent. */}
      {!sesOn && (
        <div style={{ marginBottom: 10 }}>
          <Warn>
            <strong>SES is not configured on this deployment.</strong> Drafts and reasons work, and
            you can write emails, but sending is disabled until <code>SES_ACCESS_KEY_ID</code> and{" "}
            <code>SES_SECRET_ACCESS_KEY</code> are set.
          </Warn>
        </div>
      )}

      {/* ── Summary ─────────────────────────────────────────────────────── */}
      {stats && (
        <Hero>
          <div className="ad-hero-grid">
            <HeroStat big label="Unpublished drafts" value={stats.totalDrafts} />
            <HeroStat label="Stopped by price" value={stats.priceBlocked} tone="#ffb4a8" />
            <HeroStat label="Free, unfinished" value={stats.freeStalled} tone="#ffe3a3" />
            <HeroStat label="Contacted" value={stats.contacted} tone="#a8e6c1" />
          </div>
          {(!!stats.hiddenNoOwner && stats.hiddenNoOwner > 0) || stats.capped ? (
            <div
              style={{
                marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(255,236,190,.14)",
                display: "grid", gap: 5,
              }}
            >
              {!!stats.hiddenNoOwner && stats.hiddenNoOwner > 0 && (
                <div style={{ display: "flex", gap: 6, alignItems: "flex-start", minWidth: 0 }}>
                  <Info size={12} style={{ flex: "none", marginTop: 2, opacity: 0.7 }} />
                  <span style={{ fontSize: 11, lineHeight: 1.5, opacity: 0.8 }}>
                    {stats.hiddenNoOwner} draft{stats.hiddenNoOwner === 1 ? "" : "s"} not listed —
                    the account that made {stats.hiddenNoOwner === 1 ? "it" : "them"} no longer
                    exists, so there is nobody to write to.
                  </span>
                </div>
              )}
              {stats.capped && (
                <div style={{ display: "flex", gap: 6, alignItems: "flex-start", minWidth: 0 }}>
                  <Info size={12} style={{ flex: "none", marginTop: 2, opacity: 0.7 }} />
                  <span style={{ fontSize: 11, lineHeight: 1.5, opacity: 0.8 }}>
                    One template has more drafts than a single sweep reads. Filter by template for a
                    complete list of that one.
                  </span>
                </div>
              )}
            </div>
          ) : null}
        </Hero>
      )}

      {/* ── Controls ────────────────────────────────────────────────────── */}
      <div className="ad-controls">
        <SearchBox
          value={search}
          onChange={setSearch}
          onEnter={() => void load(1)}
          placeholder="Search name, email or template"
        />
        <TemplateSelect value={templateType} options={templates} onChange={setTemplateType} />
        <button type="button" className="adk-btn" data-v="primary" onClick={() => void load(1)}>
          <Search size={14} /> Search
        </button>
      </div>

      <div className="ad-filterbar">
        <ChipGroup
          id="drafts-filter"
          value={filter}
          onChange={setFilter}
          options={FILTERS.map((f) => ({ value: f.key as string, label: f.label }))}
          style={{ flex: "1 1 auto" }}
        />
        {/* Outside the scrolling chip row so the sort stays put where the list
            starts while the filters scroll sideways on a phone. */}
        <div style={{ flex: "none", display: "flex", alignItems: "center" }}>
          <SortToggle value={sort} onChange={setSort} />
        </div>
      </div>

      {error && (
        <div style={{ marginBottom: 10 }}>
          <Warn>{error}</Warn>
        </div>
      )}

      <div className="ad-grid">
        {/* ── List ────────────────────────────────────────────────────── */}
        <div style={{ minWidth: 0 }}>
          {loading ? (
            <Loading label="Reading drafts…" h={200} />
          ) : items.length === 0 ? (
            <EmptyState
              icon={<FileText size={22} />}
              title="Nothing here"
              note={
                filter === "all" && !templateType && !search
                  ? "Every page that has been started is published."
                  : "No drafts match this filter."
              }
            />
          ) : (
            <div style={{ display: "grid", gap: 6 }}>
              {items.map((row, i) => (
                <DraftRowCard
                  key={`${row.templateType}:${row.pageId}`}
                  row={row}
                  index={i}
                  isOpen={sel?.pageId === row.pageId}
                  onOpen={() => void open(row)}
                />
              ))}
            </div>
          )}

          {pg.totalPages > 1 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 12 }}>
              <button
                type="button" className="adk-btn" disabled={pg.page <= 1} onClick={() => void load(pg.page - 1)}
                aria-label="Previous page" style={{ width: 36, padding: 0 }}
              >
                <ChevronLeft size={16} />
              </button>
              <span style={{ fontSize: 12, fontWeight: 700, color: A.soft }}>
                Page {pg.page} of {pg.totalPages}
              </span>
              <button
                type="button" className="adk-btn" disabled={pg.page >= pg.totalPages} onClick={() => void load(pg.page + 1)}
                aria-label="Next page" style={{ width: 36, padding: 0 }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>

        {/* ── Detail + composer ───────────────────────────────────────── */}
        {(sel || selLoading) && (
          <motion.div
            className="ad-detail"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {selLoading || !sel ? (
              <div className="adk-panel" style={{ padding: 8 }}>
                <Loading label="Opening draft…" h={180} />
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
          </motion.div>
        )}
      </div>

      {toast && (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: 12, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          style={{
            position: "fixed", bottom: 96, left: "50%", zIndex: 200,
            padding: "10px 18px", borderRadius: 99, color: "#fff6e6",
            background: `linear-gradient(135deg, ${A.maroon2}, ${A.maroon})`,
            fontSize: 13, fontWeight: 700, boxShadow: "0 14px 30px -14px rgba(61,12,17,.7)",
            maxWidth: "90vw", textAlign: "center",
          }}
        >
          {toast}
        </motion.div>
      )}
    </AdminPage>
  );
}
