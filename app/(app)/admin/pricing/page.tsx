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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { API_URL } from "@/lib/config";
import { isSuperAdmin } from "@/lib/roles";
import { templateList, webpageTemplateList } from "@/data/template-registry";
import { derivePricing, formatINR } from "@/config/templatePricing";
import { refreshPricing } from "@/lib/pricing";
import { UNPRICEABLE } from "./UNPRICEABLE";
import {
  ArrowLeft, Search, Loader2, Check, RotateCcw, Globe, AlertTriangle, Ban, IndianRupee,
} from "lucide-react";

const t1 = "#2a0a0e";
const t2 = "#7f5f5f";
const tM = "#9a7070";
const g = "#c9a84c";
const bg = "#3d0c11";
const cB = "rgba(61,12,17,0.08)";
const OK = "#1f7a4d";
const OFF = "#b3261e";

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

  const apiHost = useMemo(() => {
    try { return new URL(API_URL).host; } catch { return API_URL; }
  }, []);

  if (!allowed) {
    return (
      <div style={{ minHeight: "100vh", background: "#f5ede6", display: "grid", placeItems: "center" }}>
        <Loader2 size={26} className="animate-spin" style={{ color: g }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f5ede6", paddingBottom: 60 }}>
      {/* ── The responsive rules ────────────────────────────────────────────
          Inline styles cannot hold a media query, and this screen genuinely
          needs three. A super admin sets prices from a phone as often as from a
          desk, and the desktop layout — inputs beside a preview panel — collapses
          into two unreadable columns at 380px.

          Scoped to `ap-` classes so nothing here reaches the rest of the app. */}
      <style>{`
        /* Inputs beside the preview on a wide screen; stacked on a phone, where
           220px of preview next to three number fields leaves ~40px each. */
        .ap-edit { grid-template-columns: minmax(0, 1fr) minmax(0, 220px); }
        .ap-fields { display: flex; gap: 8px; flex-wrap: wrap; }
        .ap-field { flex: 1 1 96px; min-width: 90px; }

        @media (max-width: 640px) {
          .ap-edit { grid-template-columns: 1fr; }
          /* Three fields across even on the narrowest phone: they hold at most
             six digits each, and stacking them makes the row twice as tall for
             no gain. */
          .ap-fields { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 7px; }
          .ap-field { flex: none; min-width: 0; }
          /* The preview reads as the result of the fields above it, so it keeps
             its label but loses the panel inset that implied a sidebar. */
          .ap-preview { order: 2; }
        }

        /* Filter pills scroll rather than wrap into three ragged rows. */
        @media (max-width: 520px) {
          .ap-filters {
            display: flex; gap: 7px; overflow-x: auto; padding-bottom: 2px;
            scrollbar-width: none; -ms-overflow-style: none;
          }
          .ap-filters::-webkit-scrollbar { display: none; }
          .ap-filters > button { flex: none; }
        }
      `}</style>

      <div className="ap-shell" style={{ maxWidth: 900, margin: "0 auto", padding: "18px 14px 0" }}>
        <Link
          href="/admin/analytics"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: t2, textDecoration: "none", marginBottom: 14 }}
        >
          <ArrowLeft size={14} /> Admin
        </Link>

        <h1 style={{ margin: 0, fontSize: 23, fontWeight: 800, color: t1, letterSpacing: "-0.01em" }}>
          Template pricing
        </h1>
        <p style={{ margin: "5px 0 0", fontSize: 13, lineHeight: "19px", color: t2 }}>
          What a user pays to publish a page. A template nobody has priced is free.
          Payment is once per page — editing and re-publishing is always free, and
          pages already published stay live if you make their template paid.
        </p>

        {/* Which deployment am I editing. Not decoration: the same screen on
            staging and production looks identical and edits different data. */}
        <div
          style={{
            display: "flex", alignItems: "center", gap: 8, marginTop: 12,
            padding: "9px 12px", borderRadius: 12,
            background: "rgba(201,168,76,0.12)", border: `1px solid ${g}55`,
          }}
        >
          <Globe size={15} style={{ color: "#8b5a2b", flex: "none" }} />
          <span style={{ fontSize: 12.5, color: t1 }}>
            Editing <strong>{apiHost}</strong> — prices apply to this deployment only, and
            reach the gallery within about a minute.
          </span>
        </div>

        {/* Counts + search */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginTop: 16 }}>
          <div style={{ position: "relative", flex: "1 1 220px" }}>
            <Search size={15} style={{ position: "absolute", left: 11, top: 13, color: tM }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or slug"
              style={{
                width: "100%", height: 44, paddingLeft: 34, paddingRight: 12,
                borderRadius: 12, border: `1px solid ${cB}`, background: "#fff",
                fontSize: 16, color: t1, outline: "none",
              }}
            />
          </div>

          <div className="ap-filters" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {([
            ["all", `All ${CATALOGUE.length}`],
            ["paid", `Paid ${paidCount}`],
            ["free", `Free ${freeCount}`],
            ["blocked", `Can't be priced ${blockedCount}`],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setOnly(key)}
              style={{
                minHeight: 44, padding: "0 15px", borderRadius: 12, cursor: "pointer",
                fontSize: 13, fontWeight: 600, whiteSpace: "nowrap",
                background: only === key ? bg : "#fff",
                color: only === key ? "#fdf8ee" : t2,
                border: `1px solid ${only === key ? bg : cB}`,
              }}
            >
              {label}
            </button>
          ))}
          </div>
        </div>

        {error ? (
          <div
            style={{
              display: "flex", gap: 8, alignItems: "flex-start", marginTop: 14,
              padding: "10px 12px", borderRadius: 12,
              background: "rgba(179,38,30,0.08)", border: "1px solid rgba(179,38,30,0.3)",
            }}
          >
            <AlertTriangle size={15} style={{ color: OFF, flex: "none", marginTop: 1 }} />
            <span style={{ fontSize: 12.5, color: t1 }}>{error}</span>
          </div>
        ) : null}

        {/* The list */}
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 10 }}>
          {loading ? (
            <div style={{ display: "grid", placeItems: "center", padding: 50 }}>
              <Loader2 size={26} className="animate-spin" style={{ color: g }} />
            </div>
          ) : shown.length === 0 ? (
            <p style={{ padding: "30px 0", textAlign: "center", fontSize: 13.5, color: tM }}>
              Nothing matches.
            </p>
          ) : (
            shown.map((t) => {
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
                <div
                  key={t.slug}
                  style={{
                    background: blockedReason ? "#f9f4ef" : "#fffdfb",
                    border: `1px solid ${cB}`, borderRadius: 14,
                    padding: "12px 14px",
                    opacity: blockedReason ? 0.85 : 1,
                  }}
                >
                  {/* Head: identity + free/paid */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 20, flex: "none" }}>{t.emoji}</span>
                    <div style={{ minWidth: 0, flex: "1 1 180px" }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: t1, lineHeight: "18px" }}>
                        {t.title}
                      </div>
                      <div style={{ fontSize: 11.5, color: tM, fontFamily: "ui-monospace, monospace" }}>
                        {t.slug}
                      </div>
                    </div>

                    {blockedReason ? (
                      <span
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          padding: "6px 10px", borderRadius: 999,
                          background: "rgba(179,38,30,0.07)", border: `1px solid rgba(179,38,30,0.25)`,
                          fontSize: 11.5, fontWeight: 600, color: OFF,
                        }}
                      >
                        <Ban size={12} /> Can&apos;t be priced
                      </span>
                    ) : (
                      <div style={{ display: "inline-flex", borderRadius: 999, border: `1px solid ${cB}`, overflow: "hidden", flex: "none" }}>
                        {([["free", false], ["paid", true]] as const).map(([label, paid]) => (
                          <button
                            key={label}
                            type="button"
                            disabled={busy}
                            onClick={() => setDraft(t.slug, { paid })}
                            style={{
                              minHeight: 40, padding: "0 18px", border: "none",
                              cursor: busy ? "default" : "pointer",
                              fontSize: 13, fontWeight: 700, textTransform: "capitalize",
                              WebkitTapHighlightColor: "transparent",
                              background: d.paid === paid ? (paid ? bg : OK) : "#fff",
                              color: d.paid === paid ? "#fdf8ee" : t2,
                            }}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {blockedReason && (
                    <p style={{ margin: "9px 0 0", fontSize: 12, lineHeight: "17px", color: t2 }}>
                      {blockedReason}
                    </p>
                  )}

                  {/* Inputs + live preview */}
                  {!blockedReason && d.paid && (
                    <div
                      className="ap-edit"
                      style={{ marginTop: 12, display: "grid", gap: 12 }}
                    >
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
                      <div
                        className="ap-preview"
                        style={{
                          borderRadius: 12, background: "#f7eee5",
                          border: `1px solid ${cB}`, padding: "10px 12px",
                        }}
                      >
                        <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: tM, marginBottom: 6 }}>
                          Paywall shows
                        </div>
                        {problem ? (
                          <div style={{ fontSize: 12, color: OFF, lineHeight: "17px" }}>{problem}</div>
                        ) : (
                          <>
                            <div style={{ display: "flex", alignItems: "baseline", gap: 7, flexWrap: "wrap" }}>
                              <span style={{ fontSize: 19, fontWeight: 800, color: t1, lineHeight: 1 }}>
                                {formatINR(preview.finalPrice)}
                              </span>
                              {preview.discountPercent > 0 && (
                                <span style={{ fontSize: 13, color: tM, textDecoration: "line-through" }}>
                                  {formatINR(preview.mrp)}
                                </span>
                              )}
                              {preview.discountPercent > 0 && (
                                <span style={{ fontSize: 10.5, fontWeight: 800, color: "#fff", background: bg, padding: "2px 7px", borderRadius: 999 }}>
                                  {preview.discountPercent}% OFF
                                </span>
                              )}
                            </div>
                            {preview.discountPercent > 0 && (
                              <div style={{ marginTop: 5, fontSize: 11.5, color: OK, fontWeight: 600 }}>
                                You save {formatINR(preview.savings)}
                              </div>
                            )}
                            {preview.pointsCost > 0 && (
                              <div style={{ marginTop: 5, fontSize: 11.5, color: t2 }}>
                                or {preview.pointsCost.toLocaleString("en-IN")} points
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Footer: provenance + actions */}
                  {!blockedReason && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11.5, color: tM, flex: "1 1 auto" }}>
                        {row
                          ? `Set by ${row.updatedByEmail || "an admin"}${
                              row.updatedAt ? ` on ${new Date(row.updatedAt).toLocaleDateString("en-IN")}` : ""
                            }`
                          : "No decision recorded — free by default"}
                      </span>

                      {row && (
                        <button
                          type="button"
                          onClick={() => void clear(t.slug)}
                          disabled={busy}
                          title="Remove the decision entirely, so this template is free by default again"
                          style={{
                            minHeight: 40, padding: "0 14px", borderRadius: 11,
                            background: "#fff", border: `1px solid ${cB}`, color: t2,
                            fontSize: 12.5, fontWeight: 600, cursor: busy ? "default" : "pointer",
                            display: "inline-flex", alignItems: "center", gap: 6,
                          }}
                        >
                          <RotateCcw size={13} /> Reset to free
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => void save(t.slug)}
                        disabled={busy || !dirty || Boolean(problem)}
                        style={{
                          minHeight: 40, padding: "0 18px", borderRadius: 11, border: "none",
                          background: !dirty || problem ? "#e6dbd0" : bg,
                          color: !dirty || problem ? tM : "#fdf8ee",
                          fontSize: 12.5, fontWeight: 700,
                          cursor: busy || !dirty || problem ? "default" : "pointer",
                          display: "inline-flex", alignItems: "center", gap: 6,
                        }}
                      >
                        {busy ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
                        {dirty ? "Save" : "Saved"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {toast && (
        <div
          style={{
            position: "fixed", left: "50%", bottom: 22, transform: "translateX(-50%)",
            background: bg, color: "#fdf8ee", padding: "10px 16px", borderRadius: 999,
            fontSize: 13, fontWeight: 600, zIndex: 50, maxWidth: "90vw",
            boxShadow: "0 10px 30px -10px rgba(26,5,7,0.6)",
          }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}

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
    <label className="ap-field" style={{ display: "block" }}>
      <span style={{ display: "block", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: tM, marginBottom: 4 }}>
        {label}
      </span>
      <span
        style={{
          display: "flex", alignItems: "center", gap: 4,
          minHeight: 40, padding: "0 10px", borderRadius: 11,
          background: "#fff", border: `1px solid ${cB}`,
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
