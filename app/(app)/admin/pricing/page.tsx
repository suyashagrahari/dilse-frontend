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
import Link from "next/link";
import { useAppSelector } from "@/store/hooks";
import { API_URL } from "@/lib/config";
import { isSuperAdmin } from "@/lib/roles";
import { templateList, webpageTemplateList } from "@/data/template-registry";
import { derivePricing, formatINR } from "@/config/templatePricing";
import { refreshPricing } from "@/lib/pricing";
import { purgeSiteCache } from "@/lib/siteCache";
import { isPremiumRoom } from "@/lib/templateMeta";
import { coverSmall, coverSrcSet } from "@/lib/templateMedia";
import { UNPRICEABLE } from "./UNPRICEABLE";
import IntlPricingPanel from "./IntlPricingPanel";
import SuperAdminPaysCard from "./SuperAdminPaysCard";
import {
  Search, Loader2, Check, RotateCcw, Globe, AlertTriangle, Ban, IndianRupee, Gift, Tag as TagIcon, Crown, Layers,
} from "lucide-react";
import { A, AdminPage, Hero, ChipGroup, SearchBox, Loading, EmptyState, Tag } from "../adminKit";

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
  usdPriceCents?: number | null;
  updatedByEmail: string;
  updatedAt: string | null;
}

/** What the inputs hold — rupees, because that is what a person thinks in. */
interface Draft {
  paid: boolean;
  rupees: string;
  discount: string;
  points: string;
  /** Dollars as typed ("4.99"). Empty = derive from INR at the saved rate. */
  usd: string;
}

const CATALOGUE = [
  ...templateList.map((t) => ({ ...t, group: "Template" as const })),
  ...webpageTemplateList.map((t) => ({ ...t, group: "Webpage" as const })),
];

const FREE_DRAFT: Draft = { paid: false, rupees: "", discount: "0", points: "0", usd: "" };

function draftFromRow(row: Row | undefined): Draft {
  if (!row || row.isFree) return FREE_DRAFT;
  return {
    paid: true,
    rupees: String(row.finalPricePaise / 100),
    discount: String(row.discountPercent),
    points: String(row.pointsCost),
    usd: typeof row.usdPriceCents === "number" && row.usdPriceCents > 0 ? (row.usdPriceCents / 100).toFixed(2) : "",
  };
}

/** Same rule as the server (config/currency.ts): ₹ ÷ rate, up to the next .99. */
function derivedUsdCents(inrPaise: number, inrPerUsd: number): number {
  const rate = inrPerUsd > 0 ? inrPerUsd : 88;
  const cents = Math.ceil(Math.max(0, inrPaise) / rate - 1e-9);
  return Math.max(199, Math.ceil((cents + 1) / 100) * 100 - 1);
}

const sameDraft = (a: Draft, b: Draft) =>
  a.paid === b.paid && (!a.paid || (a.rupees === b.rupees && a.discount === b.discount && a.points === b.points && a.usd === b.usd));

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

  if (d.usd.trim()) {
    if (!/^\d{1,4}(\.\d{1,2})?$/.test(d.usd.trim())) return "USD price must look like 4.99.";
    const usd = Number(d.usd);
    if (usd < 1) return "USD price must be at least $1 — PayPal keeps ~$0.30 of every sale.";
    if (usd > 1000) return "USD price must be $1,000 or less.";
  }

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
  /** Which collection is being priced. Membership is set in Premium Studio. */
  const [room, setRoom] = useState<"normal" | "premium">("normal");
  /** Super-admin tier overrides (slug → premium), read-only here. */
  const [tiers, setTiers] = useState<Record<string, boolean>>({});
  // "Same price for every template in this collection", one draft per room.
  const [bulkBy, setBulkBy] = useState<Record<"normal" | "premium", { rupees: string; discount: string; points: string }>>({
    normal: { rupees: "", discount: "0", points: "0" },
    premium: { rupees: "", discount: "0", points: "0" },
  });
  const bulk = { room, ...bulkBy[room] };
  const setBulk = useCallback(
    (fn: (b: { rupees: string; discount: string; points: string }) => { rupees: string; discount: string; points: string }) =>
      setBulkBy((p) => ({ ...p, [room]: fn(p[room]) })),
    [room]
  );
  const [bulkArmed, setBulkArmed] = useState<null | "price" | "free">(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  // INR per USD from the International pricing panel, for derived-price previews.
  const [inrPerUsd, setInrPerUsd] = useState(88);
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
      const [res, tierRes] = await Promise.all([
        fetch(`${API_URL}/admin/template-pricing`, { headers: hdr() }),
        fetch(`${API_URL}/admin/template-tiers`, { headers: hdr() }),
      ]);
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to load");
      const tierJson = await tierRes.json().catch(() => null);
      const tmap: Record<string, boolean> = {};
      for (const r of (tierJson?.data?.rows ?? []) as { slug: string; premium: boolean }[]) tmap[r.slug] = r.premium;
      setTiers(tmap);

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
              // Always sent from this panel: a number sets it, null clears it
              // back to "derived". (A client that omits it keeps the old value.)
              usdPriceCents: d.usd.trim() ? Math.round(Number(d.usd) * 100) : null,
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
            usdPriceCents: d.paid && d.usd.trim() ? Math.round(Number(d.usd) * 100) : null,
            updatedByEmail: json.data?.updatedByEmail || user?.email || "",
            updatedAt: new Date().toISOString(),
          },
        }));

        // The gallery in this same tab reads a module-level cache; without this a
        // super admin saves a price, clicks through to /templates, and sees the
        // old badge — which reads as the save not working.
        void refreshPricing();
        void purgeSiteCache();

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
        void purgeSiteCache();
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
  const isPremium = useCallback((slug: string) => isPremiumRoom(slug, tiers), [tiers]);

  const bulkTargets = useMemo(
    () => CATALOGUE.filter((t) => !UNPRICEABLE[t.slug] && isPremium(t.slug) === (room === "premium")),
    [room, isPremium]
  );
  // Bulk edits never touch USD: the field is omitted, so the server keeps each template's own USD price.
  const bulkDraft: Draft = { paid: true, rupees: bulk.rupees, discount: bulk.discount, points: bulk.points, usd: "" };
  const bulkProblem = checkDraft(bulkDraft);
  const bulkPreview = previewOf("bulk", bulkDraft);

  /** Price (or free) every template in one collection, in one request. */
  const applyBulk = useCallback(
    async (mode: "price" | "free") => {
      if (bulkBusy || !bulkTargets.length) return;
      if (mode === "price" && bulkProblem) { say(bulkProblem); return; }
      if (bulkArmed !== mode) { setBulkArmed(mode); setTimeout(() => setBulkArmed(null), 4000); return; }
      setBulkArmed(null);
      setBulkBusy(true);
      try {
        const updates = bulkTargets.map((t) =>
          mode === "free"
            ? { slug: t.slug, isFree: true }
            : {
                slug: t.slug,
                isFree: false,
                finalPricePaise: Math.round(Number(bulk.rupees) * 100),
                discountPercent: Number(bulk.discount) || 0,
                pointsCost: Number(bulk.points) || 0,
              }
        );
        const res = await fetch(`${API_URL}/admin/template-pricing`, {
          method: "PATCH",
          headers: hdr(),
          body: JSON.stringify({ updates }),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "Failed to apply");
        void refreshPricing();
        void purgeSiteCache();
        await load();
        const room = bulk.room === "premium" ? "Premium" : "Normal";
        say(mode === "free" ? `All ${updates.length} ${room} templates are free` : `${updates.length} ${room} templates now ${formatINR(Number(bulk.rupees))}`);
      } catch (e) {
        say(e instanceof Error ? e.message : "Could not apply");
      } finally {
        setBulkBusy(false);
      }
    },
    [bulkBusy, bulkTargets, bulkProblem, bulkArmed, bulk.rupees, bulk.discount, bulk.points, bulk.room, hdr, say, load]
  );

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return CATALOGUE.filter((t) => {
      if (q && !t.title.toLowerCase().includes(q) && !t.slug.includes(q)) return false;
      const blocked = Boolean(UNPRICEABLE[t.slug]);
      if (isPremium(t.slug) !== (room === "premium")) return false;
      if (only === "paid") return !blocked && isPaid(t.slug);
      if (only === "free") return !blocked && !isPaid(t.slug);
      if (only === "blocked") return blocked;
      return true;
    });
  }, [search, only, isPaid, isPremium, room]);
  /** Per-collection figures for the room tabs and the hero. */
  const roomStats = (prem: boolean) => {
    const list = CATALOGUE.filter((t) => isPremium(t.slug) === prem);
    const priceable = list.filter((t) => !UNPRICEABLE[t.slug]);
    const paid = priceable.filter((t) => isPaid(t.slug));
    const avg = paid.length ? Math.round(paid.reduce((s, t) => s + rows[t.slug].finalPricePaise, 0) / paid.length / 100) : 0;
    const prices = [...new Set(paid.map((t) => rows[t.slug].finalPricePaise))];
    return { total: list.length, priceable: priceable.length, paid: paid.length, avg, uniform: prices.length === 1 && paid.length === priceable.length ? prices[0] / 100 : null };
  };
  const normalStats = roomStats(false);
  const premStats = roomStats(true);
  const cur = room === "premium" ? premStats : normalStats;

  const inRoom = (slug: string) => isPremiumRoom(slug, tiers) === (room === "premium");
  const roomList = CATALOGUE.filter((t) => inRoom(t.slug));
  const paidCount = roomList.filter((t) => !UNPRICEABLE[t.slug] && isPaid(t.slug)).length;
  const blockedCount = roomList.filter((t) => UNPRICEABLE[t.slug]).length;
  const freeCount = roomList.length - paidCount - blockedCount;

  const unsaved = CATALOGUE.filter((t) => {
    if (UNPRICEABLE[t.slug]) return false;
    const d = drafts[t.slug];
    if (!d) return false;
    return !sameDraft(draftFromRow(rows[t.slug]), d);
  }).length;

  const apiHost = useMemo(() => {
    try { return new URL(API_URL).host; } catch { return API_URL; }
  }, []);

  if (!allowed) {
    return <Loading label="Checking access…" h={320} />;
  }

  const paidPct = cur.priceable ? Math.round((cur.paid / cur.priceable) * 100) : 0;
  const P = room === "premium";

  return (
    <AdminPage
      title="Template pricing"
      subtitle="What a user pays to publish a page, priced per collection — Everyday and Premium. Set one price for a whole collection, or fine-tune any single template. Which templates are Premium is chosen in Premium Studio. A template nobody has priced is free. Payment is once per page — editing and re-publishing is always free, and pages already published stay live if you make their template paid."
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
        <div className="ap-rooms-hero">
          {([["normal", normalStats], ["premium", premStats]] as const).map(([r, st]) => (
            <div key={r} className="ap-rh" data-room={r}>
              <span className="ap-rh-label">{r === "premium" ? <><Crown size={11} /> PREMIUM</> : <><Layers size={11} /> EVERYDAY</>}</span>
              <span className="ap-rh-price">
                {st.uniform != null ? formatINR(st.uniform) : st.paid ? `avg ${formatINR(st.avg)}` : "Free"}
              </span>
              <span className="ap-rh-sub">
                {st.paid}/{st.priceable} paid · {st.total} templates{st.uniform != null ? " · one price for all" : ""}
              </span>
            </div>
          ))}
        </div>
        <div className="ap-bar" aria-hidden>
          <motion.span key={room} initial={{ width: 0 }} animate={{ width: `${paidPct}%` }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} />
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

      <SuperAdminPaysCard headers={hdr} />

      <IntlPricingPanel headers={hdr} onRate={setInrPerUsd} />

      {/* ── Everyday / Premium: which collection am I pricing ─────────────── */}
      <div className="ap-rooms" role="tablist" aria-label="Collection">
        {([["normal", normalStats], ["premium", premStats]] as const).map(([r, st]) => {
          const on = room === r;
          return (
            <button key={r} type="button" role="tab" aria-selected={on} data-on={on ? "1" : "0"} data-room={r}
              onClick={() => { setRoom(r); setBulkArmed(null); setOnly("all"); }}>
              {on && <motion.span layoutId="ap-room-pill" className="ap-room-pill" data-room={r} transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
              <span className="ap-room-in">
                <span className="ap-room-ic">{r === "premium" ? <Crown size={16} /> : <Layers size={16} />}</span>
                <span className="ap-room-txt">
                  <b>{r === "premium" ? "Premium pricing" : "Everyday pricing"}</b>
                  <small>{st.total} templates · {st.paid} paid</small>
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <p className="ap-studio-link">
        {P ? "👑 " : ""}Want to change which templates are {P ? "Premium" : "Everyday"}?{" "}
        <Link href="/admin/premium">Open Premium Studio →</Link>
      </p>

      {/* Counts + search */}
      <div className="ap-controls">
        <SearchBox value={search} onChange={setSearch} placeholder="Search by name or slug" style={{ flex: "1 1 240px" }} />
        <ChipGroup
          id="ap-only"
          value={only}
          onChange={setOnly}
          options={[
            { value: "all", label: "All", count: roomList.length },
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

      {/* ── Price a whole collection ─────────────────────────────────────── */}
      <motion.div key={`bulk-${room}`} className="adk-card ap-bulk" data-room={room}
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
        <div className="ap-bulk-head">
          <span className="ap-bulk-title">
            {P ? <Crown size={15} /> : <Layers size={15} />} One price for every {P ? "Premium" : "Everyday"} template
          </span>
          {cur.uniform != null && <Tag tone={P ? A.goldDeep : OK}>All at {formatINR(cur.uniform)}</Tag>}
        </div>
        <p className="ap-bulk-note">
          Applies the same price to all <strong>{bulkTargets.length}</strong> {P ? "Premium" : "Everyday"} templates in one go. Any single template can still be changed below.
        </p>
        <div className="ap-bulk-row">
          <div className="ap-fields" style={{ flex: "1 1 300px" }}>
            <Field label="Price charged" prefix={<IndianRupee size={12} style={{ color: tM }} />} value={bulk.rupees}
              onChange={(v) => { setBulk((b) => ({ ...b, rupees: v })); setBulkArmed(null); }} disabled={bulkBusy} placeholder="49" />
            <Field label="Discount" suffix="%" value={bulk.discount}
              onChange={(v) => { setBulk((b) => ({ ...b, discount: v })); setBulkArmed(null); }} disabled={bulkBusy} placeholder="0" />
            <Field label="Or points" value={bulk.points}
              onChange={(v) => { setBulk((b) => ({ ...b, points: v })); setBulkArmed(null); }} disabled={bulkBusy} placeholder="0" />
          </div>
          <div className="ap-bulk-actions">
            <span className="ap-bulk-preview">
              {bulk.rupees && !bulkProblem ? (
                <>
                  <strong>{formatINR(bulkPreview.finalPrice)}</strong>
                  {bulkPreview.discountPercent > 0 && <s>{formatINR(bulkPreview.mrp)}</s>}
                </>
              ) : bulk.rupees ? <em style={{ color: OFF }}>{bulkProblem}</em> : <em>Type a price</em>}
            </span>
            <button type="button" className="adk-btn" data-v={bulkArmed === "price" ? "primary" : undefined}
              disabled={bulkBusy || !bulkTargets.length || Boolean(bulkProblem)} onClick={() => void applyBulk("price")}
              style={{ height: 38, padding: "0 14px", fontSize: 12 }}>
              {bulkBusy ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
              {bulkArmed === "price" ? "Tap again to confirm" : `Apply to ${bulkTargets.length}`}
            </button>
            <button type="button" className="adk-btn" data-v={bulkArmed === "free" ? "primary" : undefined}
              disabled={bulkBusy || !bulkTargets.length} onClick={() => void applyBulk("free")}
              style={{ height: 38, padding: "0 12px", fontSize: 12 }}>
              <Gift size={12} /> {bulkArmed === "free" ? "Tap again to confirm" : "Make all free"}
            </button>
          </div>
        </div>
      </motion.div>

      <div className="ap-single-head">
        <span>{P ? "Premium" : "Everyday"} templates, one by one</span>
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
        <div className="ap-grid" key={`grid-${room}`} data-room={room}>
          {shown.map((t, i) => {
            const blockedReason = UNPRICEABLE[t.slug];
            const d = drafts[t.slug] ?? FREE_DRAFT;
            const row = rows[t.slug];
            const busy = saving === t.slug;
            const preview = previewOf(t.slug, d);
            const problem = checkDraft(d);

            // "Dirty" compares the draft to the stored row, so Save is only
            // offered when there is something to save.
            const dirty = !sameDraft(draftFromRow(row), d);

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
                  <span className="ap-emoji" aria-hidden>
                    {t.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={coverSrcSet(t.coverImage) ? coverSmall(t.coverImage) : t.coverImage} alt="" loading="lazy" decoding="async" />
                    ) : (
                      t.emoji
                    )}
                  </span>
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
                        <div className="ap-fields ap-fields4">
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
                          <Field
                            label="USD price"
                            prefix={<span style={{ fontSize: 13, fontWeight: 700, color: tM }}>$</span>}
                            value={d.usd}
                            onChange={(v) => setDraft(t.slug, { usd: v })}
                            disabled={busy}
                            decimal
                            placeholder={`${(derivedUsdCents(Math.round(Number(d.rupees || 0) * 100), inrPerUsd) / 100).toFixed(2)} auto`}
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
                              <div style={{ marginTop: 6, paddingTop: 6, borderTop: `1px dashed ${cB}`, fontSize: 11.5, color: t2 }}>
                                Abroad:{" "}
                                <b style={{ color: t1 }}>
                                  ${(
                                    (d.usd.trim() ? Math.round(Number(d.usd) * 100) : derivedUsdCents(preview.finalPricePaise, inrPerUsd)) / 100
                                  ).toFixed(2)}
                                </b>
                                <span style={{ color: tM }}>{d.usd.trim() ? " (set)" : " (auto)"}</span>
                              </div>
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
  .ap-emoji { width: 52px; height: 52px; flex: none; border-radius: 13px; display: grid; place-items: center; font-size: 22px; background: rgba(201,168,76,.13); overflow: hidden; box-shadow: 0 0 0 1px rgba(61,12,17,.08); }
  .ap-emoji img { width: 100%; height: 100%; object-fit: cover; display: block; }
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
  .ap-fields4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  @media (max-width: 520px) { .ap-fields4 { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  .ap-field { min-width: 0; }
  .ap-fieldwrap > span + span:focus-within { border-color: ${A.gold} !important; box-shadow: 0 0 0 3px rgba(201,168,76,.15); }
  .ap-preview { border-radius: 12px; background: linear-gradient(135deg, #f7eee5, #fbf4ea); border: 1px solid ${A.edge}; padding: 9px 11px; min-width: 0; }
  @media (max-width: 640px), (min-width: 1080px) {
    .ap-edit { grid-template-columns: minmax(0, 1fr); }
  }

  .ap-seg-sm button { min-height: 28px; padding: 0 11px; font-size: 11px; }
  .ap-tier { display: flex; align-items: center; gap: 8px; margin-top: 9px; flex-wrap: wrap; }
  .ap-tier-label { font-size: 10.5px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; color: ${A.muted}; }
  .ap-tier-note { font-size: 11px; color: ${A.muted}; }
  .ap-rooms-hero { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .ap-rh { border-radius: 16px; padding: 12px 14px; background: rgba(255,255,255,.06); border: 1px solid rgba(255,227,163,.18); display: grid; gap: 4px; min-width: 0; }
  .ap-rh[data-room="premium"] { background: linear-gradient(135deg, rgba(255,241,191,.16), rgba(166,117,28,.12)); border-color: rgba(255,227,163,.4); }
  .ap-rh-label { display: inline-flex; align-items: center; gap: 5px; font-size: 10.5px; font-weight: 800; letter-spacing: .12em; color: #ffe3a3; }
  .ap-rh-price { font: 700 26px/1.1 'Playfair Display', serif; color: #fdf8ee; }
  .ap-rh-sub { font-size: 11.5px; opacity: .75; overflow-wrap: anywhere; }

  .ap-rooms { position: relative; display: grid; grid-template-columns: 1fr 1fr; gap: 6px; padding: 6px; margin: 4px 0 8px; border-radius: 22px;
    background: rgba(255,255,255,.7); border: 1px solid ${A.edge}; box-shadow: 0 14px 30px -22px rgba(61,12,17,.5); }
  .ap-rooms button { position: relative; border: 0; background: none; cursor: pointer; border-radius: 17px; padding: 12px 14px; text-align: left;
    color: ${A.ink}; -webkit-tap-highlight-color: transparent; }
  .ap-room-pill { position: absolute; inset: 0; border-radius: 17px; background: linear-gradient(135deg, #5a1520, #3d0c11); box-shadow: 0 12px 26px -12px rgba(61,12,17,.8); }
  .ap-room-pill[data-room="premium"] { background: linear-gradient(135deg, #2b1a0c, #1a0d07); box-shadow: 0 12px 26px -10px rgba(120,80,10,.7), inset 0 0 0 1.5px #e2b44a; }
  .ap-room-pill[data-room="premium"]::after { content: ""; position: absolute; inset: 0; border-radius: inherit; background: linear-gradient(110deg, transparent 35%, rgba(255,230,160,.18) 50%, transparent 65%);
    background-size: 250% 100%; animation: apSheen 3.5s linear infinite; }
  .ap-room-in { position: relative; z-index: 1; display: flex; align-items: center; gap: 10px; min-width: 0; }
  .ap-room-ic { width: 36px; height: 36px; border-radius: 12px; display: grid; place-items: center; flex: none; background: rgba(61,12,17,.07); color: ${A.maroon}; transition: background .3s, color .3s; }
  .ap-rooms button[data-on="1"] .ap-room-ic { background: rgba(255,255,255,.14); color: #fdf8ee; }
  .ap-rooms button[data-on="1"][data-room="premium"] .ap-room-ic { background: linear-gradient(135deg, #fff1bf, #e2b44a 45%, #a6751c); color: #3a2505; }
  .ap-room-txt { display: grid; gap: 3px; min-width: 0; }
  .ap-room-txt b { font: 700 16px/1.1 'Playfair Display', serif; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .ap-room-txt small { font-size: 11px; color: ${A.muted}; }
  .ap-rooms button[data-on="1"] .ap-room-txt b { color: #fdf8ee; }
  .ap-rooms button[data-on="1"][data-room="premium"] .ap-room-txt b { background: linear-gradient(90deg, #fff1bf, #e6c77e); -webkit-background-clip: text; background-clip: text; color: transparent; }
  .ap-rooms button[data-on="1"] .ap-room-txt small { color: rgba(253,248,238,.7); }
  @media (max-width: 520px) { .ap-rooms button { padding: 10px; } .ap-room-ic { width: 30px; height: 30px; } .ap-room-txt b { font-size: 14px; } .ap-rh-price { font-size: 21px; } }
  .ap-studio-link { margin: 0 4px 12px; font-size: 12px; color: ${A.soft}; }
  .ap-studio-link a { color: ${A.goldDeep}; font-weight: 800; text-decoration: none; }
  .ap-studio-link a:hover { text-decoration: underline; }
  .ap-single-head { display: flex; align-items: center; gap: 12px; margin: 16px 2px 10px; font-size: 10.5px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; color: ${A.muted}; }
  .ap-single-head::after { content: ""; flex: 1; height: 1px; background: ${A.edge}; }
  @media (max-width: 420px) { .ap-room-ic { display: none; } }
  .ap-grid[data-room="premium"] .ap-card { border-color: rgba(201,168,76,.45); background: linear-gradient(180deg, #fffdf6, #fbf3e0); }
  .ap-grid[data-room="premium"] .ap-emoji { background: linear-gradient(135deg, #fff1bf, #e9c768); box-shadow: 0 4px 12px -6px rgba(166,117,28,.7); }
  @keyframes apSheen { from { background-position: 150% 0; } to { background-position: -100% 0; } }

  .ap-bulk { padding: 14px; margin-bottom: 12px; background: linear-gradient(135deg, #fffaf0, #fbf1df); }
  .ap-bulk[data-room="premium"] { background: linear-gradient(135deg, #fff7e0, #f6e3b4); border-color: rgba(201,168,76,.55); box-shadow: 0 16px 34px -22px rgba(139,90,43,.6); }
  .ap-bulk-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
  .ap-bulk-title { display: inline-flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 800; color: ${A.ink}; }
  .ap-bulk-note { margin: 6px 0 10px; font-size: 12px; color: ${A.soft}; line-height: 1.45; }
  .ap-bulk-row { display: flex; gap: 12px; align-items: flex-end; flex-wrap: wrap; }
  .ap-bulk-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .ap-bulk-preview { font-size: 13px; color: ${A.soft}; display: inline-flex; gap: 6px; align-items: baseline; min-width: 90px; }
  .ap-bulk-preview strong { font-family: 'Playfair Display', serif; font-size: 20px; color: ${A.ink}; }
  .ap-bulk-preview s { color: ${A.muted}; }
  .ap-toast { position: fixed; left: 50%; bottom: calc(82px + env(safe-area-inset-bottom, 0px) + 14px); z-index: 200;
    background: ${A.maroon}; color: #fdf8ee; padding: 10px 16px; border-radius: 999px; font-size: 13px; font-weight: 600;
    max-width: 90vw; text-align: center; box-shadow: 0 10px 30px -10px rgba(26,5,7,0.6); }
  @media (min-width: 768px) { .ap-toast { bottom: 22px; } }
`;

/** A small labelled number input. Text, not `number`, so a partial value while
 *  typing does not get silently coerced or rejected by the browser. */
function Field({
  label, value, onChange, disabled, placeholder, prefix, suffix, decimal,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
  prefix?: React.ReactNode;
  suffix?: string;
  /** Allow one "." and two decimals (USD). Everything else stays whole numbers. */
  decimal?: boolean;
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
          onChange={(e) =>
            onChange(
              decimal
                ? e.target.value.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1").replace(/^(\d*\.\d{0,2}).*$/, "$1")
                : e.target.value.replace(/[^\d]/g, "")
            )
          }
          disabled={disabled}
          placeholder={placeholder}
          inputMode={decimal ? "decimal" : "numeric"}
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
