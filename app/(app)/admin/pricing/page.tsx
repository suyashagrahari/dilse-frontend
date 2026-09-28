"use client";

// ─── Super admin: what each template costs ────────────────────────────────────
//
// The catalogue on the left is CODE — every entry comes from
// `data/template-registry.ts`, the same list the gallery renders from. This page
// does not invent templates and cannot miss one: a template that exists in the
// app appears here the moment it is added, with no row in any table required.
//
// What the server stores is one row per template somebody has actually priced.
// A template nobody has touched is FREE, and shows as such — that is a real
// state and not a placeholder. See `server/src/config/templatePricing.ts`.
//
// ── SUPER ADMIN, NOT ADMIN ──────────────────────────────────────────────────
//
// `admin/layout.tsx` gates on `isAdmin`, which admits staff who moderate
// contacts and flip template visibility. Deciding what users are CHARGED is a
// different kind of power, so this page checks `isSuperAdmin` itself and sends
// anybody else back. The server refuses them too — `requireSuperAdmin` on every
// pricing route — because a hidden button is not an access control.
//
// ── THIS PAGE EDITS THE DEPLOYMENT IT IS SERVED FROM ────────────────────────
//
// Staging and production run the same build against different databases, so a
// price set here applies to whichever one you opened. The header states the API
// it is talking to rather than leaving you to infer it.
//
// ── THE PREVIEW IS THE POINT ────────────────────────────────────────────────
//
// A super admin types a price and a discount; the struck-through MRP is derived.
// Getting that relationship wrong in your head is easy — ₹10 at 90% off means an
// MRP of ₹100, not ₹9 — so the row renders the exact paywall figures live, from
// the same `derivePricing` the paywall uses. What you see while typing is what
// the customer sees.

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { API_URL } from "@/lib/config";
import { isSuperAdmin } from "@/lib/roles";
import { templateList, webpageTemplateList } from "@/data/template-registry";
import { derivePricing, formatINR } from "@/config/templatePricing";
import { refreshPricing } from "@/lib/pricing";
import { UNPRICEABLE } from "./UNPRICEABLE";
import {
  Search, Loader2, Check, RotateCcw, Globe, AlertTriangle, Ban, IndianRupee, Gift, Tag as TagIcon,
} from "lucide-react";
import { A, AdminPage, Hero, HeroStat, ChipGroup, SearchBox, Loading, EmptyState, Tag } from "../adminKit";

const t1 = A.ink;
const t2 = A.soft;
const tM = A.muted;
const bg = A.maroon;
const cB = A.edge;
const OK = A.ok;
const OFF = A.danger;

/** A pricing decision as the server stores it. */
interface Row {
  slug: string;
  isFree: boolean;
  finalPricePaise: number;
  discountPercent: number;
  pointsCost: number;
  updatedByEmail: string;
  updatedAt: string | null;
}

/** What the inputs hold — rupees, because that is what a person thinks in. */
interface Draft {
  paid: boolean;
  rupees: string;
  discount: string;
  points: string;
}

const CATALOGUE = [
  ...templateList.map((t) => ({ ...t, group: "Template" as const })),
  ...webpageTemplateList.map((t) => ({ ...t, group: "Webpage" as const })),
];

const FREE_DRAFT: Draft = { paid: false, rupees: "", discount: "0", points: "0" };

function draftFromRow(row: Row | undefined): Draft {
  if (!row || row.isFree) return FREE_DRAFT;
  return {
    paid: true,
    rupees: String(row.finalPricePaise / 100),
    discount: String(row.discountPercent),
    points: String(row.pointsCost),
  };
}

/**
 * Validate a draft the same way the server does, so a mistake is caught before
 * a round trip. The server remains the authority and its message wins on a 400 —
 * these rules exist to be helpful, not to be trusted.
 */
function checkDraft(d: Draft): string | null {
  if (!d.paid) return null;

  const rupees = Number(d.rupees);
  if (!d.rupees.trim() || !Number.isFinite(rupees) || !Number.isInteger(rupees)) {
    return "Price must be a whole number of rupees.";
  }
  if (rupees < 1) return "A paid template must cost at least ₹1.";
  if (rupees > 100000) return "That is over the ₹1,00,000 cap — did you mean rupees?";

  const pct = Number(d.discount);
  if (!Number.isInteger(pct) || pct < 0 || pct > 99) {
    return "Discount must be a whole number from 0 to 99.";
  }

  const pts = Number(d.points || "0");
  if (!Number.isInteger(pts) || pts < 0) return "Points must be 0 or more.";

  return null;
}

export default function AdminPricingPage() {
  const router = useRouter();
  const { user, accessToken, isLoading } = useAppSelector((s) => s.auth);

  const [rows, setRows] = useState<Record<string, Row>>({});
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [only, setOnly] = useState<"all" | "paid" | "free" | "blocked">("all");
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── Access ────────────────────────────────────────────────────────────────
  //
  // The shared admin layout has already held the render until `checkAuth`
  // settled and bounced non-admins, so by the time this mounts `user` is
  // populated. All that is left is the tier check.
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    if (isLoading) return;
    if (!user) return;
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
    setTimeout(() => setToast(null), 2600);
  }, []);

  const load = useCallback(async () => {
    if (!accessToken || !allowed) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/admin/template-pricing`, { headers: hdr() });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to load");

      const map: Record<string, Row> = {};
      for (const r of json.data.rows as Row[]) map[r.slug] = r;
      setRows(map);

      // Drafts are seeded from the server, so an unsaved edit is never silently
      // kept across a reload — what you see is what is stored.
      const d: Record<string, Draft> = {};
      for (const t of CATALOGUE) d[t.slug] = draftFromRow(map[t.slug]);
      setDrafts(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load template pricing");
    } finally {
      setLoading(false);
    }
  }, [accessToken, allowed, hdr]);

  useEffect(() => { void load(); }, [load]);

  const setDraft = useCallback((slug: string, patch: Partial<Draft>) => {
    setDrafts((p) => ({ ...p, [slug]: { ...(p[slug] ?? FREE_DRAFT), ...patch } }));
  }, []);

  /** The resolved pricing a draft describes — the same maths the paywall runs. */
  const previewOf = useCallback((slug: string, d: Draft) => {
    const rupees = Number(d.rupees);
    return derivePricing({
      slug,
      isFree: !d.paid,
      finalPricePaise: Number.isFinite(rupees) ? Math.round(rupees * 100) : 0,
      discountPercent: Number(d.discount) || 0,
      pointsCost: Number(d.points) || 0,
    });
  }, []);

  const save = useCallback(
    async (slug: string) => {
      const d = drafts[slug];
      if (!d || saving) return;

      const problem = checkDraft(d);
      if (problem) { say(problem); return; }

      setSaving(slug);
      try {
        // Rupees in the input, paise on the wire. The server only accepts
        // integer paise, and this is the one place the conversion happens.
        const body = d.paid
          ? {
              isFree: false,
              finalPricePaise: Math.round(Number(d.rupees) * 100),
              discountPercent: Number(d.discount) || 0,
              pointsCost: Number(d.points) || 0,
            }
          : { isFree: true };

        const res = await fetch(`${API_URL}/admin/template-pricing/${slug}`, {
          method: "PATCH",
          headers: hdr(),
          body: JSON.stringify(body),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "Failed to save");

        setRows((p) => ({
          ...p,
          [slug]: {
            slug,
            isFree: !d.paid,
            finalPricePaise: d.paid ? Math.round(Number(d.rupees) * 100) : 0,
            discountPercent: d.paid ? Number(d.discount) || 0 : 0,
            pointsCost: d.paid ? Number(d.points) || 0 : 0,
            updatedByEmail: json.data?.updatedByEmail || user?.email || "",
            updatedAt: new Date().toISOString(),
          },
        }));

        // The gallery in this same tab reads a module-level cache; without this a
        // super admin saves a price, clicks through to /templates, and sees the
        // old badge — which reads as the save not working.
        void refreshPricing();

        say(d.paid ? `${slug} is now ${formatINR(Number(d.rupees))}` : `${slug} is now free`);
      } catch (e) {
        say(e instanceof Error ? e.message : "Could not save");
      } finally {
        setSaving(null);
      }
    },
    [drafts, saving, hdr, say, user?.email]
  );

  /** Drop the decision entirely, so the template is free by default again. */
  const clear = useCallback(
    async (slug: string) => {
      if (saving) return;
      setSaving(slug);
      try {
        const res = await fetch(`${API_URL}/admin/template-pricing/${slug}`, {
          method: "DELETE",
          headers: hdr(),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "Failed to clear");

        setRows((p) => { const n = { ...p }; delete n[slug]; return n; });
        setDraft(slug, FREE_DRAFT);
        void refreshPricing();
        say(`${slug} is free again`);
      } catch (e) {
        say(e instanceof Error ? e.message : "Could not clear");
      } finally {
        setSaving(null);
      }
    },
    [saving, hdr, say, setDraft]
  );

  const isPaid = useCallback((slug: string) => Boolean(rows[slug] && !rows[slug].isFree), [rows]);

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return CATALOGUE.filter((t) => {
      if (q && !t.title.toLowerCase().includes(q) && !t.slug.includes(q)) return false;
      const blocked = Boolean(UNPRICEABLE[t.slug]);
      if (only === "paid") return !blocked && isPaid(t.slug);
      if (only === "free") return !blocked && !isPaid(t.slug);
      if (only === "blocked") return blocked;
      return true;
    });
  }, [search, only, isPaid]);

  const paidCount = CATALOGUE.filter((t) => !UNPRICEABLE[t.slug] && isPaid(t.slug)).length;
  const blockedCount = CATALOGUE.filter((t) => UNPRICEABLE[t.slug]).length;
  const freeCount = CATALOGUE.length - paidCount - blockedCount;

  // Hero figures, from the stored rows only (not unsaved drafts).
  const paidRows = CATALOGUE.map((t) => rows[t.slug]).filter((r): r is Row => Boolean(r && !r.isFree && !UNPRICEABLE[r.slug]));
  const avgPrice = paidRows.length ? Math.round(paidRows.reduce((s, r) => s + r.finalPricePaise, 0) / paidRows.length / 100) : 0;
  const discounted = paidRows.filter((r) => r.discountPercent > 0).length;
  const pointsPriced = paidRows.filter((r) => r.pointsCost > 0).length;
  const unsaved = CATALOGUE.filter((t) => {
    if (UNPRICEABLE[t.slug]) return false;
    const d = drafts[t.slug];
    if (!d) return false;
    const s = draftFromRow(rows[t.slug]);
    return s.paid !== d.paid || (d.paid && (s.rupees !== d.rupees || s.discount !== d.discount || s.points !== d.points));
  }).length;

  const apiHost = useMemo(() => {
    try { return new URL(API_URL).host; } catch { return API_URL; }
  }, []);

  if (!allowed) {
    return <Loading label="Checking access…" h={320} />;
  }

  const paidPct = CATALOGUE.length ? Math.round((paidCount / CATALOGUE.length) * 100) : 0;

  return (
    <AdminPage
      title="Template pricing"
      subtitle="What a user pays to publish a page. A template nobody has priced is free. Payment is once per page — editing and re-publishing is always free, and pages already published stay live if you make their template paid."
      icon={<IndianRupee size={18} />}
      width={1180}
    >
      {/* ── The responsive rules ────────────────────────────────────────────
          Inline styles cannot hold a media query, and this screen genuinely
          needs several. A super admin sets prices from a phone as often as from
          a desk, and the desktop layout — inputs beside a preview panel —
          collapses into two unreadable columns at 380px.

          Scoped to `ap-` classes so nothing here reaches the rest of the app. */}
      <style>{AP_CSS}</style>

      <Hero>
        <div className="adk-hero-grid">
          <HeroStat big label="PAID TEMPLATES" value={paidCount} sub={paidCount ? `avg ${formatINR(avgPrice)} per page` : "everything is free"} />
          <HeroStat label="FREE" value={freeCount} tone="#bff0d2" />
          <HeroStat label="ON DISCOUNT" value={discounted} sub={pointsPriced ? `${pointsPriced} take points` : undefined} />
          <HeroStat label="CAN'T BE PRICED" value={blockedCount} tone="#ffb4a8" />
        </div>
        <div className="ap-bar" aria-hidden>
          <motion.span initial={{ width: 0 }} animate={{ width: `${paidPct}%` }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} />
        </div>
        {/* Which deployment am I editing. Not decoration: the same screen on
            staging and production looks identical and edits different data. */}
        <div className="ap-host">
          <Globe size={13} style={{ flex: "none", color: "#ffe3a3" }} />
          <span style={{ minWidth: 0, overflowWrap: "anywhere" }}>
            Editing <strong style={{ color: "#ffe3a3" }}>{apiHost}</strong> — prices apply to this deployment only, and
            reach the gallery within about a minute.
          </span>
        </div>
      </Hero>

      {/* Counts + search */}
      <div className="ap-controls">
        <SearchBox value={search} onChange={setSearch} placeholder="Search by name or slug" style={{ flex: "1 1 240px" }} />
        <ChipGroup
          id="ap-only"
          value={only}
          onChange={setOnly}
          options={[
            { value: "all", label: "All", count: CATALOGUE.length },
            { value: "paid", label: <><IndianRupee size={11} /> Paid</>, count: paidCount },
            { value: "free", label: <><Gift size={12} /> Free</>, count: freeCount, tone: OK },
            { value: "blocked", label: <><Ban size={12} /> Can&apos;t be priced</>, count: blockedCount, tone: OFF },
          ]}
        />
        <AnimatePresence>
          {unsaved > 0 && (
            <motion.span key="unsaved" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}>
              <Tag tone={A.warn}>{unsaved} unsaved</Tag>
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {error ? (
        <div className="ap-error">
          <AlertTriangle size={15} style={{ color: OFF, flex: "none", marginTop: 1 }} />
          <span style={{ fontSize: 12.5, color: t1, overflowWrap: "anywhere" }}>{error}</span>
        </div>
      ) : null}

      {/* The list */}
      {loading ? (
        <Loading label="Loading prices…" />
      ) : shown.length === 0 ? (
        <EmptyState icon={<Search size={20} />} title="Nothing matches." note="Try another name, slug or filter." />
      ) : (
        <div className="ap-grid">
          {shown.map((t, i) => {
            const blockedReason = UNPRICEABLE[t.slug];
            const d = drafts[t.slug] ?? FREE_DRAFT;
            const row = rows[t.slug];
            const busy = saving === t.slug;
            const preview = previewOf(t.slug, d);
            const problem = checkDraft(d);

            // "Dirty" compares the draft to the stored row, so Save is only
            // offered when there is something to save.
            const stored = draftFromRow(row);
            const dirty =
              stored.paid !== d.paid ||
              (d.paid && (stored.rupees !== d.rupees || stored.discount !== d.discount || stored.points !== d.points));

            return (
              <motion.div
                key={t.slug}
                className="adk-card ap-card"
                data-blocked={blockedReason ? "1" : "0"}
                data-dirty={dirty && !blockedReason ? "1" : "0"}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i, 14) * 0.025, duration: 0.3 }}
              >
                {/* Head: identity + free/paid */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  <span className="ap-emoji" aria-hidden>{t.emoji}</span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="ap-name">{t.title}</div>
                    <div className="ap-slug">
                      {t.slug}
                      {row && !row.isFree && !blockedReason ? <span style={{ color: A.goldDeep, fontWeight: 700 }}> · {formatINR(row.finalPricePaise / 100)}</span> : null}
                    </div>
                  </div>

                  {blockedReason ? (
                    <Tag tone={OFF} style={{ flex: "none" }}><Ban size={11} /> Can&apos;t be priced</Tag>
                  ) : (
                    <div className="ap-seg" role="radiogroup" aria-label={`${t.title} pricing`}>
                      {([["free", false], ["paid", true]] as const).map(([label, paid]) => {
                        const on = d.paid === paid;
                        return (
                          <button
                            key={label}
                            type="button"
                            role="radio"
                            aria-checked={on}
                            disabled={busy}
                            onClick={() => setDraft(t.slug, { paid })}
                            data-on={on ? "1" : "0"}
                          >
                            {on && (
                              <motion.span
                                layoutId={`ap-seg-${t.slug}`}
                                className="ap-seg-pill"
                                style={{ background: paid ? bg : OK }}
                                transition={{ type: "spring", stiffness: 450, damping: 32 }}
                              />
                            )}
                            <span style={{ position: "relative", zIndex: 1 }}>{label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {blockedReason && (
                  <p style={{ margin: "8px 0 0", fontSize: 11.5, lineHeight: "16px", color: t2, overflowWrap: "anywhere" }}>
                    {blockedReason}
                  </p>
                )}

                {/* Inputs + live preview */}
                <AnimatePresence initial={false}>
                  {!blockedReason && d.paid && (
                    <motion.div
                      key="edit"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                      style={{ overflow: "hidden" }}
                    >
                      <div className="ap-edit" style={{ paddingTop: 10, display: "grid", gap: 10 }}>
                        <div className="ap-fields">
                          <Field
                            label="Price charged"
                            prefix={<IndianRupee size={12} style={{ color: tM }} />}
                            value={d.rupees}
                            onChange={(v) => setDraft(t.slug, { rupees: v })}
                            disabled={busy}
                            placeholder="10"
                          />
                          <Field
                            label="Discount"
                            suffix="%"
                            value={d.discount}
                            onChange={(v) => setDraft(t.slug, { discount: v })}
                            disabled={busy}
                            placeholder="90"
                          />
                          <Field
                            label="Or points"
                            value={d.points}
                            onChange={(v) => setDraft(t.slug, { points: v })}
                            disabled={busy}
                            placeholder="0"
                          />
                        </div>

                        {/* What the customer will actually see. Same derivePricing
                            the paywall runs, so these cannot disagree. */}
                        <div className="ap-preview">
                          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 10, fontWeight: 800, letterSpacing: "0.07em", textTransform: "uppercase", color: tM, marginBottom: 5 }}>
                            <TagIcon size={10} /> Paywall shows
                          </div>
                          {problem ? (
                            <div style={{ fontSize: 12, color: OFF, lineHeight: "16px" }}>{problem}</div>
                          ) : (
                            <>
                              <div style={{ display: "flex", alignItems: "baseline", gap: 6, flexWrap: "wrap" }}>
                                <motion.span
                                  key={preview.finalPrice}
                                  initial={{ opacity: 0, y: 4 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  style={{ fontSize: 20, fontWeight: 800, color: t1, lineHeight: 1, fontFamily: "'Playfair Display',serif" }}
                                >
                                  {formatINR(preview.finalPrice)}
                                </motion.span>
                                {preview.discountPercent > 0 && (
                                  <span style={{ fontSize: 12.5, color: tM, textDecoration: "line-through" }}>
                                    {formatINR(preview.mrp)}
                                  </span>
                                )}
                                {preview.discountPercent > 0 && (
                                  <span style={{ fontSize: 10, fontWeight: 800, color: "#fff", background: bg, padding: "2px 7px", borderRadius: 999 }}>
                                    {preview.discountPercent}% OFF
                                  </span>
                                )}
                              </div>
                              {preview.discountPercent > 0 && (
                                <div style={{ marginTop: 4, fontSize: 11, color: OK, fontWeight: 700 }}>
                                  You save {formatINR(preview.savings)}
                                </div>
                              )}
                              {preview.pointsCost > 0 && (
                                <div style={{ marginTop: 4, fontSize: 11, color: t2 }}>
                                  or {preview.pointsCost.toLocaleString("en-IN")} points
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Footer: provenance + actions */}
                {!blockedReason && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                    <span className="ap-prov">
                      {row
                        ? `Set by ${row.updatedByEmail || "an admin"}${
                            row.updatedAt ? ` on ${new Date(row.updatedAt).toLocaleDateString("en-IN")}` : ""
                          }`
                        : "No decision recorded — free by default"}
                    </span>

                    {row && (
                      <button
                        type="button"
                        className="adk-btn"
                        onClick={() => void clear(t.slug)}
                        disabled={busy}
                        title="Remove the decision entirely, so this template is free by default again"
                        style={{ height: 34, padding: "0 11px", fontSize: 12 }}
                      >
                        <RotateCcw size={12} /> Reset to free
                      </button>
                    )}

                    <button
                      type="button"
                      className="adk-btn"
                      data-v={!dirty || problem ? undefined : "primary"}
                      onClick={() => void save(t.slug)}
                      disabled={busy || !dirty || Boolean(problem)}
                      style={{ height: 34, padding: "0 14px", fontSize: 12 }}
                    >
                      {busy ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                      {dirty ? "Save" : "Saved"}
                    </button>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            role="status"
            aria-live="polite"
            className="ap-toast"
            initial={{ opacity: 0, y: 14, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 14, x: "-50%" }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </AdminPage>
  );
}

const AP_CSS = `
  .animate-spin { animation: spin 0.9s linear infinite; }
  .ap-bar { margin-top: 12px; height: 6px; border-radius: 99px; background: rgba(191,240,210,.22); overflow: hidden; }
  .ap-bar > span { display: block; height: 100%; border-radius: 99px; background: linear-gradient(90deg, #c9a84c, #ffe3a3); }
  .ap-host { display: flex; align-items: flex-start; gap: 7px; margin-top: 11px; font-size: 11.5px; line-height: 1.45; opacity: .9; }
  .ap-controls { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 10px; }
  .ap-controls > .adk-chips { max-width: 100%; }
  .ap-controls .adk-search input { font-size: 16px; } /* no iOS zoom on focus */
  .ap-error { display: flex; gap: 8px; align-items: flex-start; margin-bottom: 10px; padding: 10px 12px; border-radius: 12px;
    background: rgba(179,38,30,0.08); border: 1px solid rgba(179,38,30,0.3); }

  .ap-grid { display: grid; grid-template-columns: minmax(0,1fr); gap: 8px; align-items: start; }
  @media (min-width: 1080px) { .ap-grid { grid-template-columns: repeat(2, minmax(0,1fr)); } }
  .ap-card { padding: 11px 12px; }
  .ap-card:hover { box-shadow: 0 12px 26px -16px rgba(61,12,17,.4); }
  .ap-card[data-blocked="1"] { background: #f9f4ef; opacity: .85; }
  .ap-card[data-dirty="1"] { border-color: ${A.gold}; box-shadow: 0 0 0 1.5px rgba(201,168,76,.35) inset; }
  .ap-emoji { width: 36px; height: 36px; flex: none; border-radius: 11px; display: grid; place-items: center; font-size: 19px; background: rgba(201,168,76,.13); }
  .ap-name { font-size: 13.5px; font-weight: 800; color: ${A.ink}; line-height: 18px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .ap-slug { font-size: 11px; color: ${A.muted}; font-family: ui-monospace, monospace; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .ap-prov { font-size: 11px; color: ${A.muted}; flex: 1 1 140px; min-width: 0; overflow-wrap: anywhere; }

  /* Free / Paid: a sliding pill. */
  .ap-seg { flex: none; display: inline-flex; padding: 3px; border-radius: 99px; background: rgba(61,12,17,.05); border: 1px solid ${A.edge}; }
  .ap-seg button { position: relative; min-height: 32px; padding: 0 14px; border: none; background: transparent; border-radius: 99px; cursor: pointer;
    font-size: 12px; font-weight: 800; text-transform: capitalize; color: ${A.soft}; -webkit-tap-highlight-color: transparent; transition: color .2s; }
  .ap-seg button[data-on="1"] { color: #fdf8ee; }
  .ap-seg button:disabled { cursor: default; }
  .ap-seg-pill { position: absolute; inset: 0; border-radius: 99px; z-index: 0; }

  /* Inputs beside the preview on a mid-width screen; stacked on a phone, where
     a preview next to three number fields leaves ~40px each, and stacked in
     the two-column grid on a desktop for the same reason. */
  .ap-edit { grid-template-columns: minmax(0, 1fr) minmax(0, 200px); }
  .ap-fields { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 7px; }
  .ap-field { min-width: 0; }
  .ap-fieldwrap > span + span:focus-within { border-color: ${A.gold} !important; box-shadow: 0 0 0 3px rgba(201,168,76,.15); }
  .ap-preview { border-radius: 12px; background: linear-gradient(135deg, #f7eee5, #fbf4ea); border: 1px solid ${A.edge}; padding: 9px 11px; min-width: 0; }
  @media (max-width: 640px), (min-width: 1080px) {
    .ap-edit { grid-template-columns: minmax(0, 1fr); }
  }

  .ap-toast { position: fixed; left: 50%; bottom: calc(82px + env(safe-area-inset-bottom, 0px) + 14px); z-index: 200;
    background: ${A.maroon}; color: #fdf8ee; padding: 10px 16px; border-radius: 999px; font-size: 13px; font-weight: 600;
    max-width: 90vw; text-align: center; box-shadow: 0 10px 30px -10px rgba(26,5,7,0.6); }
  @media (min-width: 768px) { .ap-toast { bottom: 22px; } }
`;

/** A small labelled number input. Text, not `number`, so a partial value while
 *  typing does not get silently coerced or rejected by the browser. */
function Field({
  label, value, onChange, disabled, placeholder, prefix, suffix,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
  prefix?: React.ReactNode;
  suffix?: string;
}) {
  return (
    <label className="ap-field ap-fieldwrap" style={{ display: "block" }}>
      <span style={{ display: "block", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: tM, marginBottom: 4 }}>
        {label}
      </span>
      <span
        style={{
          display: "flex", alignItems: "center", gap: 4,
          minHeight: 40, padding: "0 10px", borderRadius: 11,
          background: "#fff", border: `1px solid ${cB}`,
          transition: "border-color .2s, box-shadow .2s",
        }}
      >
        {prefix}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, ""))}
          disabled={disabled}
          placeholder={placeholder}
          inputMode="numeric"
          style={{
            // Fills the 40px wrapper so the whole control is the tap target. As a
            // 24px input inside 40px of padding, two thirds of what looks like
            // the field did nothing on a phone.
            // The padding is on the INPUT, not just the wrapper, so the whole
            // 42px is a real tap target. Relying on the wrapper's minHeight left
            // a 24px input inside 40px of dead space, and two thirds of what
            // looked like the field did nothing on a phone. `align-self:
            // stretch` ought to fix that and does not here, so the input is
            // sized directly rather than left depending on a flex subtlety.
            width: "100%", padding: "11px 0",
            border: "none", outline: "none", background: "transparent",
            // 16px is the threshold below which iOS Safari zooms the whole page
            // on focus. A super admin typing a price should not have the layout
            // jump and then have to pinch back out.
            fontSize: 16, fontWeight: 600, color: t1, minWidth: 0,
          }}
        />
        {suffix && <span style={{ fontSize: 12, color: tM, flex: "none" }}>{suffix}</span>}
      </span>
    </label>
  );
}
