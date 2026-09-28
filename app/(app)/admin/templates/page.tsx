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
import { motion, AnimatePresence } from "framer-motion";
import { useAppSelector } from "@/store/hooks";
import { API_URL } from "@/lib/config";
import { templateList, webpageTemplateList } from "@/data/template-registry";
import { refreshTemplateVisibility } from "@/lib/templateVisibility";
import { Eye, EyeOff, Loader2, Check, RotateCcw, Globe, AlertTriangle, LayoutGrid, Search } from "lucide-react";
import { A, AdminPage, Hero, HeroStat, ChipGroup, SearchBox, Loading, EmptyState, Tag } from "../adminKit";

const OK = A.ok;
const OFF = A.danger;

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
  const [group, setGroup] = useState<"all" | "Template" | "Webpage">("all");
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
      if (group !== "all" && t.group !== group) return false;
      if (only === "live") return isLive(t.slug);
      if (only === "hidden") return !isLive(t.slug);
      return true;
    });
  }, [search, only, group, isLive]);

  const liveCount = CATALOGUE.filter((t) => isLive(t.slug)).length;
  const hiddenCount = CATALOGUE.length - liveCount;
  const decidedCount = CATALOGUE.filter((t) => rows[t.slug]).length;
  const webpageCount = CATALOGUE.filter((t) => t.group === "Webpage").length;
  const livePct = CATALOGUE.length ? Math.round((liveCount / CATALOGUE.length) * 100) : 0;

  const apiHost = useMemo(() => {
    try { return new URL(API_URL).host; } catch { return API_URL; }
  }, []);

  return (
    <AdminPage
      title="Template visibility"
      subtitle="What this deployment shows in the gallery, and what users can build. Hidden templates disappear from the gallery and their builder closes — pages already published from them keep working."
      icon={<LayoutGrid size={18} />}
      width={1100}
      actions={
        <button
          type="button"
          className="adk-btn"
          data-v="gold"
          onClick={pinAll}
          disabled={bulkBusy}
          title="Write an explicit live/hidden row for every template, matching what it does right now"
        >
          {bulkBusy ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
          Pin all as-is
        </button>
      }
    >
      <style>{TV_CSS}</style>

      <Hero>
        <div className="adk-hero-grid">
          <HeroStat big label="LIVE IN GALLERY" value={liveCount} sub={`${livePct}% of ${CATALOGUE.length} templates`} />
          <HeroStat label="HIDDEN" value={hiddenCount} tone="#ffb4a8" />
          <HeroStat label="PINNED BY ADMIN" value={decidedCount} sub={`${CATALOGUE.length - decidedCount} on default`} />
          <HeroStat label="WEBPAGES" value={webpageCount} sub={`${CATALOGUE.length - webpageCount} templates`} />
        </div>
        <div className="tv-bar" aria-hidden>
          <motion.span initial={{ width: 0 }} animate={{ width: `${livePct}%` }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} />
        </div>
        {/* Which deployment am I editing. Not decoration: the same screen on
            staging and production looks identical and edits different data. */}
        <div className="tv-host">
          <Globe size={13} style={{ flex: "none", color: "#ffe3a3" }} />
          <span style={{ minWidth: 0, overflowWrap: "anywhere" }}>
            Editing <strong style={{ color: "#ffe3a3" }}>{apiHost}</strong> — changes apply to this deployment only, and
            reach visitors within about a minute.
          </span>
        </div>
      </Hero>

      <div className="tv-controls">
        <SearchBox value={search} onChange={setSearch} placeholder="Search by name or slug" style={{ flex: "1 1 240px" }} />
        <ChipGroup
          id="tv-only"
          value={only}
          onChange={setOnly}
          options={[
            { value: "all", label: "All", count: CATALOGUE.length },
            { value: "live", label: <><Eye size={12} /> Live</>, count: liveCount, tone: OK },
            { value: "hidden", label: <><EyeOff size={12} /> Hidden</>, count: hiddenCount, tone: OFF },
          ]}
        />
        <ChipGroup
          id="tv-group"
          value={group}
          onChange={setGroup}
          options={[
            { value: "all", label: "Any kind" },
            { value: "Template", label: "Templates" },
            { value: "Webpage", label: "Webpages" },
          ]}
        />
      </div>

      {error ? (
        <div className="tv-error">
          <AlertTriangle size={15} style={{ color: OFF, flex: "none", marginTop: 1 }} />
          <span style={{ fontSize: 12.5, color: A.ink, overflowWrap: "anywhere" }}>{error}</span>
        </div>
      ) : null}

      {loading ? (
        <Loading label="Loading visibility…" />
      ) : shown.length === 0 ? (
        <EmptyState icon={<Search size={20} />} title="Nothing matches." note="Try another name, slug or filter." />
      ) : (
        <div className="tv-grid">
          {shown.map((t, i) => {
            const state = stateOf(t.slug);
            const live = state === "live" || state === "default-live";
            const decided = state === "live" || state === "hidden";
            const row = rows[t.slug];
            const busy = saving === t.slug;

            return (
              <motion.div
                key={`${t.group}-${t.slug}`}
                className="adk-card tv-card"
                data-live={live ? "1" : "0"}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i, 14) * 0.025, duration: 0.3 }}
              >
                <span className="tv-emoji" aria-hidden="true">{t.emoji}</span>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, minWidth: 0 }}>
                    <span className="tv-name">{t.title}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
                    <Tag tone={live ? OK : OFF}>{live ? "Live" : "Hidden"}</Tag>
                    {/* "default" is a real state and hiding it would make a
                        brand-new template look like somebody chose to hide it. */}
                    {!decided ? (
                      <span title="No admin decision on record — following the built-in default">
                        <Tag tone={A.muted}>default</Tag>
                      </span>
                    ) : null}
                    {t.group === "Webpage" ? <Tag tone={A.info}>webpage</Tag> : null}
                  </div>
                  <div className="tv-slug">
                    /{t.slug}
                    {row?.updatedByEmail ? ` · set by ${row.updatedByEmail}` : ""}
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {decided ? (
                    <motion.button
                      key="reset"
                      type="button"
                      onClick={() => clearOne(t.slug)}
                      disabled={busy}
                      title="Forget this decision and follow the built-in default"
                      aria-label={`Reset ${t.title} to the default`}
                      className="tv-reset"
                      initial={{ opacity: 0, scale: 0.6 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.6 }}
                      whileTap={{ rotate: -90 }}
                    >
                      <RotateCcw size={13} />
                    </motion.button>
                  ) : null}
                </AnimatePresence>

                <button
                  type="button"
                  role="switch"
                  aria-checked={live}
                  aria-label={`${live ? "Hide" : "Show"} ${t.title}`}
                  title={busy ? "Saving" : live ? "Hide" : "Show"}
                  onClick={() => setOne(t.slug, !live)}
                  disabled={busy}
                  className="tv-switch"
                  data-on={live ? "1" : "0"}
                >
                  <motion.span
                    layout
                    className="tv-knob"
                    transition={{ type: "spring", stiffness: 500, damping: 32 }}
                  >
                    {busy ? (
                      <Loader2 size={11} className="animate-spin" />
                    ) : live ? (
                      <Eye size={11} />
                    ) : (
                      <EyeOff size={11} />
                    )}
                  </motion.span>
                </button>
              </motion.div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {toast ? (
          <motion.div
            key="toast"
            role="status"
            aria-live="polite"
            className="tv-toast"
            initial={{ opacity: 0, y: 14, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 14, x: "-50%" }}
          >
            {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </AdminPage>
  );
}

const TV_CSS = `
  .animate-spin { animation: spin 0.9s linear infinite; }
  .tv-bar { margin-top: 12px; height: 6px; border-radius: 99px; background: rgba(255,120,110,.28); overflow: hidden; }
  .tv-bar > span { display: block; height: 100%; border-radius: 99px; background: linear-gradient(90deg, #c9a84c, #ffe3a3); }
  .tv-host { display: flex; align-items: flex-start; gap: 7px; margin-top: 11px; font-size: 11.5px; line-height: 1.45; opacity: .9; }
  .tv-controls { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 10px; }
  .tv-controls > .adk-chips { max-width: 100%; }
  .tv-error { display: flex; gap: 8px; align-items: flex-start; margin-bottom: 10px; padding: 10px 12px; border-radius: 12px;
    background: rgba(179,38,30,0.08); border: 1px solid rgba(179,38,30,0.3); }
  .tv-grid { display: grid; grid-template-columns: minmax(0,1fr); gap: 7px; }
  @media (min-width: 760px) { .tv-grid { grid-template-columns: repeat(2, minmax(0,1fr)); gap: 8px; } }
  .tv-card { display: flex; align-items: center; gap: 10px; padding: 10px 11px; }
  .tv-card:hover { transform: translateY(-2px); box-shadow: 0 12px 26px -16px rgba(61,12,17,.45); border-color: rgba(201,168,76,.55); }
  .tv-card::before { content: ""; position: absolute; left: 0; top: 10px; bottom: 10px; width: 3px; border-radius: 0 3px 3px 0;
    background: ${OFF}; opacity: .55; transition: background .25s; }
  .tv-card[data-live="1"]::before { background: ${OK}; }
  .tv-emoji { width: 36px; height: 36px; flex: none; border-radius: 11px; display: grid; place-items: center; font-size: 19px; background: rgba(201,168,76,.13); }
  .tv-name { font-size: 13.5px; font-weight: 800; color: ${A.ink}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0; }
  .tv-slug { margin-top: 3px; font-size: 11px; color: ${A.muted}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .tv-reset { flex: none; width: 30px; height: 30px; border-radius: 9px; cursor: pointer; display: grid; place-items: center;
    background: #fff; border: 1px solid ${A.edge}; color: ${A.muted}; transition: color .15s, border-color .15s; }
  .tv-reset:hover:not(:disabled) { color: ${A.goldDeep}; border-color: ${A.gold}; }
  .tv-switch { flex: none; position: relative; width: 50px; height: 28px; padding: 3px; border-radius: 99px; cursor: pointer; display: flex;
    justify-content: flex-start; border: 1px solid rgba(179,38,30,.3); background: rgba(179,38,30,.12); transition: background .25s, border-color .25s, opacity .2s; }
  .tv-switch[data-on="1"] { justify-content: flex-end; background: ${OK}; border-color: ${OK}; }
  .tv-switch:disabled { opacity: .65; cursor: default; }
  .tv-knob { width: 20px; height: 20px; border-radius: 50%; background: #fff; display: grid; place-items: center; color: ${OFF};
    box-shadow: 0 2px 6px rgba(61,12,17,.28); }
  .tv-switch[data-on="1"] .tv-knob { color: ${OK}; }
  .tv-toast { position: fixed; left: 50%; bottom: calc(82px + env(safe-area-inset-bottom, 0px) + 14px); z-index: 200;
    padding: 10px 16px; border-radius: 12px; background: ${A.maroon}; color: #fdf8ee; font-size: 12.5px; font-weight: 600;
    max-width: 90vw; text-align: center; box-shadow: 0 10px 30px -10px rgba(26,5,7,.6); }
  @media (min-width: 768px) { .tv-toast { bottom: 22px; } }
`;
