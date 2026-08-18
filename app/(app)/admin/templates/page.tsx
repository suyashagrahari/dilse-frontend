"use client";

// ─── Admin: which templates are live on this deployment ──────────────────────
//
// The catalogue on the left is CODE — every entry comes from
// `data/template-registry.ts`, the same list the gallery renders from. This page
// does not invent templates and cannot miss one: a template that exists in the
// app appears here the moment it is added, with no row in any table required.
//
// What the server stores is one boolean per slug, and only for slugs somebody has
// actually decided about. A template nobody has touched shows as "default", which
// is a real third state and worth showing: it means "whatever the code says",
// and for a brand-new template the code says hidden. See
// `server/src/config/templateVisibility.ts`.
//
// ── THIS PAGE EDITS THE DEPLOYMENT IT IS SERVED FROM ────────────────────────
//
// Staging and production run the same build against different databases, so the
// switches here apply to whichever one you opened. That is why the header states
// the API it is talking to rather than leaving you to infer it — turning the
// rakhi page on in staging and expecting production to change is the one mistake
// this screen has to make impossible to make quietly.

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAppSelector } from "@/store/hooks";
import { API_URL } from "@/lib/config";
import { templateList, webpageTemplateList } from "@/data/template-registry";
import { refreshTemplateVisibility } from "@/lib/templateVisibility";
import {
  ArrowLeft, Search, Eye, EyeOff, Loader2, Check, RotateCcw, Globe, AlertTriangle,
} from "lucide-react";

const t1 = "#2a0a0e";
const t2 = "#7f5f5f";
const tM = "#9a7070";
const g = "#c9a84c";
const bg = "#3d0c11";
const cB = "rgba(61,12,17,0.08)";
const OK = "#1f7a4d";
const OFF = "#b3261e";

interface Row { slug: string; live: boolean; updatedByEmail: string; updatedAt: string }

/** The full catalogue, in the order the gallery shows it. */
const CATALOGUE = [
  ...templateList.map((t) => ({ ...t, group: "Template" as const })),
  ...webpageTemplateList.map((t) => ({ ...t, group: "Webpage" as const })),
];

type State = "live" | "hidden" | "default-live" | "default-hidden";

export default function AdminTemplatesPage() {
  const { accessToken } = useAppSelector((s) => s.auth);

  const [rows, setRows] = useState<Record<string, Row>>({});
  const [defaultHidden, setDefaultHidden] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [only, setOnly] = useState<"all" | "live" | "hidden">("all");
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hdr = useCallback(
    () => ({ Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }),
    [accessToken]
  );

  const say = useCallback((m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 2600);
  }, []);

  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/admin/template-visibility`, { headers: hdr() });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed to load");
      const map: Record<string, Row> = {};
      for (const r of json.data.rows as Row[]) map[r.slug] = r;
      setRows(map);
      setDefaultHidden(new Set<string>(json.data.defaultHidden || []));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load template visibility");
    } finally {
      setLoading(false);
    }
  }, [accessToken, hdr]);

  useEffect(() => { void load(); }, [load]);

  /** The resolved state of one slug, and whether it came from a decision. */
  const stateOf = useCallback(
    (slug: string): State => {
      const row = rows[slug];
      if (row) return row.live ? "live" : "hidden";
      return defaultHidden.has(slug) ? "default-hidden" : "default-live";
    },
    [rows, defaultHidden]
  );

  const isLive = useCallback(
    (slug: string) => stateOf(slug) === "live" || stateOf(slug) === "default-live",
    [stateOf]
  );

  const setOne = useCallback(
    async (slug: string, live: boolean) => {
      if (!accessToken || saving) return;
      setSaving(slug);
      try {
        const res = await fetch(`${API_URL}/admin/template-visibility/${slug}`, {
          method: "PATCH",
          headers: hdr(),
          body: JSON.stringify({ live }),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "Failed");
        setRows((p) => ({
          ...p,
          [slug]: { slug, live, updatedByEmail: json.data.updatedByEmail || "", updatedAt: new Date().toISOString() },
        }));
        // The gallery in this same tab reads a module-level cache; without this
        // an admin toggles a template on, clicks through to /templates, and it is
        // still missing — which reads as the switch not working.
        void refreshTemplateVisibility();
        say(`${slug} is now ${live ? "live" : "hidden"}`);
      } catch (e) {
        say(e instanceof Error ? e.message : "Could not save");
      } finally {
        setSaving(null);
      }
    },
    [accessToken, hdr, saving, say]
  );

  /** Drop the decision and let the built-in default apply again. */
  const clearOne = useCallback(
    async (slug: string) => {
      if (!accessToken || saving) return;
      setSaving(slug);
      try {
        const res = await fetch(`${API_URL}/admin/template-visibility/${slug}`, {
          method: "DELETE",
          headers: hdr(),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "Failed");
        setRows((p) => {
          const next = { ...p };
          delete next[slug];
          return next;
        });
        void refreshTemplateVisibility();
        say(`${slug} follows the default again`);
      } catch (e) {
        say(e instanceof Error ? e.message : "Could not save");
      } finally {
        setSaving(null);
      }
    },
    [accessToken, hdr, saving, say]
  );

  /**
   * Write an explicit decision for every template in the catalogue at once.
   *
   * Worth its own button because the useful shape of this screen on a fresh
   * production database is "pin everything as it is now, so nothing can change
   * under me later" — which is fifty-odd single writes otherwise, and a gallery
   * that can be read halfway through them.
   */
  const pinAll = useCallback(async () => {
    if (!accessToken || bulkBusy) return;
    setBulkBusy(true);
    try {
      const updates = CATALOGUE.map((t) => ({ slug: t.slug, live: isLive(t.slug) }));
      const res = await fetch(`${API_URL}/admin/template-visibility`, {
        method: "PATCH",
        headers: hdr(),
        body: JSON.stringify({ updates }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Failed");
      await load();
      void refreshTemplateVisibility();
      say(`Pinned ${updates.length} templates to their current state`);
    } catch (e) {
      say(e instanceof Error ? e.message : "Could not save");
    } finally {
      setBulkBusy(false);
    }
  }, [accessToken, bulkBusy, hdr, isLive, load, say]);

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase();
    return CATALOGUE.filter((t) => {
      if (q && !t.title.toLowerCase().includes(q) && !t.slug.includes(q)) return false;
      if (only === "live") return isLive(t.slug);
      if (only === "hidden") return !isLive(t.slug);
      return true;
    });
  }, [search, only, isLive]);

  const liveCount = CATALOGUE.filter((t) => isLive(t.slug)).length;
  const hiddenCount = CATALOGUE.length - liveCount;

  const apiHost = useMemo(() => {
    try { return new URL(API_URL).host; } catch { return API_URL; }
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#f5ede6", paddingBottom: 60 }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "22px 16px 0" }}>
        <Link
          href="/admin/analytics"
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: t2, textDecoration: "none", marginBottom: 14 }}
        >
          <ArrowLeft size={14} /> Admin
        </Link>

        <h1 style={{ margin: 0, fontSize: 23, fontWeight: 800, color: t1, letterSpacing: "-0.01em" }}>
          Template visibility
        </h1>
        <p style={{ margin: "5px 0 0", fontSize: 13, lineHeight: "19px", color: t2 }}>
          What this deployment shows in the gallery, and what users can build. Hidden
          templates disappear from the gallery and their builder closes — pages already
          published from them keep working.
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
            Editing <strong>{apiHost}</strong> — changes apply to this deployment only, and
            reach visitors within about a minute.
          </span>
        </div>

        {/* Counts + controls */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginTop: 16 }}>
          <div style={{ position: "relative", flex: "1 1 220px" }}>
            <Search size={15} style={{ position: "absolute", left: 11, top: 13, color: tM }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or slug"
              style={{
                width: "100%", height: 40, paddingLeft: 34, paddingRight: 12,
                borderRadius: 11, border: `1px solid ${cB}`, background: "#fff",
                fontSize: 13.5, color: t1, outline: "none",
              }}
            />
          </div>

          {([["all", `All ${CATALOGUE.length}`], ["live", `Live ${liveCount}`], ["hidden", `Hidden ${hiddenCount}`]] as const).map(
            ([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => setOnly(key)}
                style={{
                  height: 40, padding: "0 14px", borderRadius: 11, cursor: "pointer",
                  fontSize: 13, fontWeight: 600,
                  background: only === key ? bg : "#fff",
                  color: only === key ? "#fdf8ee" : t2,
                  border: `1px solid ${only === key ? bg : cB}`,
                }}
              >
                {label}
              </button>
            )
          )}

          <button
            type="button"
            onClick={pinAll}
            disabled={bulkBusy}
            title="Write an explicit live/hidden row for every template, matching what it does right now"
            style={{
              height: 40, padding: "0 14px", borderRadius: 11,
              cursor: bulkBusy ? "default" : "pointer", opacity: bulkBusy ? 0.6 : 1,
              fontSize: 13, fontWeight: 600, background: "#fff", color: t2,
              border: `1px solid ${cB}`, display: "inline-flex", alignItems: "center", gap: 6,
            }}
          >
            {bulkBusy ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            Pin all as-is
          </button>
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
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
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
              const state = stateOf(t.slug);
              const live = state === "live" || state === "default-live";
              const decided = state === "live" || state === "hidden";
              const row = rows[t.slug];
              const busy = saving === t.slug;

              return (
                <div
                  key={`${t.group}-${t.slug}`}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "11px 13px", borderRadius: 14,
                    background: "rgba(255,255,255,0.82)", border: `1px solid ${cB}`,
                  }}
                >
                  <span style={{ fontSize: 20, flex: "none" }} aria-hidden="true">{t.emoji}</span>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: t1 }}>{t.title}</span>
                      <span
                        style={{
                          fontSize: 10.5, fontWeight: 700, letterSpacing: "0.04em",
                          textTransform: "uppercase", padding: "2px 7px", borderRadius: 999,
                          color: live ? OK : OFF,
                          background: live ? "rgba(31,122,77,0.1)" : "rgba(179,38,30,0.1)",
                        }}
                      >
                        {live ? "Live" : "Hidden"}
                      </span>
                      {/* "default" is a real state and hiding it would make a
                          brand-new template look like somebody chose to hide it. */}
                      {!decided ? (
                        <span
                          style={{
                            fontSize: 10.5, fontWeight: 600, padding: "2px 7px",
                            borderRadius: 999, color: tM, background: "rgba(61,12,17,0.06)",
                          }}
                          title="No admin decision on record — following the built-in default"
                        >
                          default
                        </span>
                      ) : null}
                      {t.group === "Webpage" ? (
                        <span style={{ fontSize: 10.5, color: tM }}>webpage</span>
                      ) : null}
                    </div>
                    <div style={{ marginTop: 2, fontSize: 11.5, color: tM, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      /{t.slug}
                      {row?.updatedByEmail ? ` · set by ${row.updatedByEmail}` : ""}
                    </div>
                  </div>

                  {decided ? (
                    <button
                      type="button"
                      onClick={() => clearOne(t.slug)}
                      disabled={busy}
                      title="Forget this decision and follow the built-in default"
                      style={{
                        flex: "none", width: 34, height: 34, borderRadius: 10, cursor: "pointer",
                        display: "grid", placeItems: "center",
                        background: "#fff", border: `1px solid ${cB}`, color: tM,
                      }}
                    >
                      <RotateCcw size={14} />
                    </button>
                  ) : null}

                  <button
                    type="button"
                    role="switch"
                    aria-checked={live}
                    aria-label={`${live ? "Hide" : "Show"} ${t.title}`}
                    onClick={() => setOne(t.slug, !live)}
                    disabled={busy}
                    style={{
                      flex: "none", display: "inline-flex", alignItems: "center", gap: 7,
                      height: 34, padding: "0 12px", borderRadius: 999,
                      cursor: busy ? "default" : "pointer", opacity: busy ? 0.6 : 1,
                      fontSize: 12.5, fontWeight: 700,
                      background: live ? "rgba(31,122,77,0.1)" : bg,
                      color: live ? OK : "#fdf8ee",
                      border: `1px solid ${live ? "rgba(31,122,77,0.35)" : bg}`,
                    }}
                  >
                    {busy ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : live ? (
                      <EyeOff size={13} />
                    ) : (
                      <Eye size={13} />
                    )}
                    {busy ? "Saving" : live ? "Hide" : "Show"}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {toast ? (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "fixed", left: "50%", transform: "translateX(-50%)", bottom: 22,
            padding: "10px 16px", borderRadius: 12, background: bg, color: "#fdf8ee",
            fontSize: 12.5, zIndex: 50, maxWidth: "90vw", textAlign: "center",
          }}
        >
          {toast}
        </div>
      ) : null}

      <style>{`
        .animate-spin { animation: adminSpin 0.9s linear infinite; }
        @keyframes adminSpin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
