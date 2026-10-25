"use client";

// ─── Admin: templates, and where each one shows ──────────────────────────────
//
// The catalogue is CODE — every card comes from `data/template-registry.ts`,
// the same list the gallery renders from. This page does not invent templates
// and cannot miss one: a template that exists in the app appears here the
// moment it is added, with no row in any table required.
//
// Each card opens one dialog — "Where does this template show?" — holding
// every switch that decides it:
//
//   Visibility — the master Live/Hidden switch (/admin/template-visibility,
//                admin). The server stores one boolean per slug, and only for
//                slugs somebody decided about. A template nobody has touched
//                is "default", a real third state: "whatever the code says".
//                The default depends on the host — on the live (apex) domain a
//                brand-new template starts hidden, elsewhere it starts live.
//                The server sends the default IN FORCE as `defaultHidden`;
//                `apexDefaultHidden` is only for the note on non-apex hosts.
//   Show on    — the curated places (super admin): the Templates page
//                (TemplateCollection "gallery-exclude"), the /wedding hub
//                (TemplateCollection "wedding", with a group per template),
//                the Premium room (TemplateTier overrides) and every seasonal
//                drop the server's season settings report (drops[id].saleSlugs).
//                Drop ids come from the API, never from this file, so a new
//                drop appears here the moment the server has it.
//
// Every switch saves on its own, optimistically, and rolls back with a toast
// if the server refuses. Places are read-modify-write: each write re-reads the
// saved list and changes only this template, and a drop refuses outright if it
// changed elsewhere since this page loaded it (see placesShared.ts).
//
// ── THIS PAGE EDITS THE DEPLOYMENT IT IS SERVED FROM ────────────────────────
//
// Staging and production run the same build against different databases, so
// the switches here apply to whichever one you opened. The header names the
// API it is talking to — turning a page on in staging and expecting production
// to change is the one mistake this screen has to make impossible to make
// quietly.

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useAppSelector } from "@/store/hooks";
import { API_URL } from "@/lib/config";
import { isSuperAdmin } from "@/lib/roles";
import { templateList, webpageTemplateList } from "@/data/template-registry";
import { refreshTemplateVisibility } from "@/lib/templateVisibility";
import { purgeSiteCache } from "@/lib/siteCache";
import { coverSmall, coverSrcSet } from "@/lib/templateMedia";
import { galleryExcludedSet, isPremiumRoom, refreshTemplateMeta, useTemplateMeta } from "@/lib/templateMeta";
import {
  Eye, EyeOff, Loader2, Check, Globe, AlertTriangle, LayoutGrid, Search, Info, X, ExternalLink, ChevronRight, Lock, RotateCcw,
} from "lucide-react";
import { A, AdminPage, Hero, HeroStat, ChipGroup, SearchBox, Loading, EmptyState } from "../adminKit";
import { WEDDING_FILTERS, filterOf } from "../../wedding/content";
import {
  adminApi, getCollection, putCollection, getTiers, writePremium, premiumWrite, getSeason, writeDropSlugs, DropConflictError,
  useAutoWedding, sortItems, dropIdsOf, dropSlugsIn, activeDropIds, dropLabel, dropPath, GALLERY_EXCLUDE_MAX, WEDDING_MAX, DROP_MAX,
  type PlaceItem, type SeasonSnapshot, type WeddingGroup,
} from "../placesShared";

const OK = A.ok;
const OFF = A.danger;

interface Row { slug: string; live: boolean; updatedByEmail: string; updatedAt: string }

/** The full catalogue, in the order the gallery shows it. */
const CATALOGUE = [
  ...templateList.map((t) => ({ ...t, group: "Template" as const })),
  ...webpageTemplateList.map((t) => ({ ...t, group: "Webpage" as const })),
];
type Entry = (typeof CATALOGUE)[number];

const GROUPS = WEDDING_FILTERS.filter((f) => f.id !== "all") as { id: WeddingGroup; label: string; emoji: string }[];

type State = "live" | "hidden" | "default-live" | "default-hidden";
type Toast = { msg: string; tone: "ok" | "err" | "warn" };

/** What the curated places hold. `wedding: null` = /wedding runs on its automatic list. */
type Places = {
  loaded: boolean;
  error?: string;
  excluded: string[];
  wedding: PlaceItem[] | null;
  tiers: Record<string, boolean>;
  season: SeasonSnapshot | null;
};

/** One place a template is in, for the badges and the dialog's rows. */
type PlaceId = "gallery" | "wedding" | "premium" | `drop:${string}`;
type Placement = { id: PlaceId; label: string; on: boolean; active?: boolean };

const imgOf = (t: Entry) => (t.coverImage ? (coverSrcSet(t.coverImage) ? coverSmall(t.coverImage) : t.coverImage) : null);
const nameOf = (email: string) => email.split("@")[0] || email;

export default function AdminTemplatesPage() {
  const { accessToken, user } = useAppSelector((s) => s.auth);
  const superAdmin = isSuperAdmin(user?.role);
  const meta = useTemplateMeta();
  const autoWedding = useAutoWedding();

  const [rows, setRows] = useState<Record<string, Row>>({});
  const [defaultHidden, setDefaultHidden] = useState<Set<string>>(new Set());
  /** Null until loaded (or from an older server that did not say). */
  const [isApex, setIsApex] = useState<boolean | null>(null);
  const [apexDefaultHidden, setApexDefaultHidden] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [only, setOnly] = useState<"all" | "live" | "hidden">("all");
  const [group, setGroup] = useState<"all" | "Template" | "Webpage">("all");
  const [toast, setToast] = useState<Toast | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const [places, setPlaces] = useState<Places>({ loaded: false, excluded: [], wedding: null, tiers: {}, season: null });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const api = useCallback((path: string, init?: RequestInit) => adminApi(accessToken, path, init), [accessToken]);

  const say = useCallback((msg: string, tone: Toast["tone"] = "ok") => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, tone });
    toastTimer.current = setTimeout(() => setToast(null), tone === "ok" ? 2800 : 6000);
  }, []);

  const mark = useCallback((key: string, on: boolean) => {
    setBusy((b) => {
      const n = new Set(b);
      if (on) n.add(key); else n.delete(key);
      return n;
    });
  }, []);

  // ── Loads ──────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    setError(null);
    try {
      const d = await api("/admin/template-visibility");
      const map: Record<string, Row> = {};
      for (const r of d.rows as Row[]) map[r.slug] = r;
      setRows(map);
      setDefaultHidden(new Set<string>((d.defaultHidden as string[]) || []));
      setIsApex(typeof d.isApex === "boolean" ? d.isApex : null);
      setApexDefaultHidden(new Set<string>(Array.isArray(d.apexDefaultHidden) ? (d.apexDefaultHidden as string[]) : []));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load template visibility");
    } finally {
      setLoading(false);
    }
  }, [accessToken, api]);

  useEffect(() => { void load(); }, [load]);

  // Super admin: the admin endpoints (fresh, uncached). A plain admin cannot
  // read those, so the same facts come from the public answers instead — the
  // switches are read-only for them anyway.
  const loadPlaces = useCallback(async () => {
    if (!accessToken || !user) return;
    try {
      if (superAdmin) {
        const [ex, wed, tiers, season] = await Promise.all([
          getCollection(accessToken, "gallery-exclude"),
          getCollection(accessToken, "wedding"),
          getTiers(accessToken),
          getSeason(accessToken),
        ]);
        setPlaces({ loaded: true, excluded: (ex ?? []).map((i) => i.slug), wedding: wed, tiers, season });
      } else {
        const res = await fetch(`${API_URL}/season`, { cache: "no-store" });
        const json = await res.json();
        const d = (json?.data ?? {}) as {
          mode?: string; split?: boolean; audiences?: { india?: string; abroad?: string };
          drops?: Record<string, { slugs?: string[] }>;
        };
        const season: SeasonSnapshot = {
          mode: d.mode, split: !!d.split, modeIndia: d.audiences?.india, modeAbroad: d.audiences?.abroad,
          drops: Object.fromEntries(Object.entries(d.drops ?? {}).map(([id, v]) => [id, { saleSlugs: v?.slugs ?? [] }])),
        };
        setPlaces((p) => ({ ...p, loaded: true, error: undefined, season }));
      }
    } catch (e) {
      setPlaces((p) => ({ ...p, loaded: true, error: e instanceof Error ? e.message : "Could not load places" }));
    }
  }, [accessToken, user, superAdmin]);

  useEffect(() => { void loadPlaces(); }, [loadPlaces]);

  // A plain admin reads the collections and tiers from the public meta.
  const view: Places = useMemo(() => {
    if (superAdmin) return places;
    return {
      ...places,
      excluded: [...galleryExcludedSet(meta.collections.galleryExclude)],
      wedding: (meta.collections.wedding?.items as PlaceItem[] | undefined) ?? null,
      tiers: meta.tiers,
    };
  }, [superAdmin, places, meta.collections, meta.tiers]);

  // ── Resolved state ─────────────────────────────────────────────────────────
  const stateOf = useCallback(
    (slug: string): State => {
      const row = rows[slug];
      if (row) return row.live ? "live" : "hidden";
      return defaultHidden.has(slug) ? "default-hidden" : "default-live";
    },
    [rows, defaultHidden]
  );
  const isLive = useCallback((slug: string) => stateOf(slug) === "live" || stateOf(slug) === "default-live", [stateOf]);

  const excludedSet = useMemo(() => new Set(view.excluded.map((s) => s.toLowerCase())), [view.excluded]);
  const weddingList = useMemo(() => view.wedding ?? autoWedding, [view.wedding, autoWedding]);
  const weddingBy = useMemo(() => new Map(weddingList.map((i) => [i.slug, i])), [weddingList]);
  const dropIds = useMemo(() => dropIdsOf(view.season), [view.season]);
  const activeDrops = useMemo(() => activeDropIds(view.season), [view.season]);
  const dropSets = useMemo(
    () => new Map(dropIds.map((id) => [id, new Set(dropSlugsIn(view.season, id))])),
    [dropIds, view.season]
  );

  const placementsOf = useCallback(
    (slug: string): Placement[] => [
      { id: "gallery", label: "Templates", on: !excludedSet.has(slug.toLowerCase()) },
      { id: "wedding", label: "Wedding", on: weddingBy.has(slug) },
      { id: "premium", label: "Premium", on: isPremiumRoom(slug, view.tiers) },
      ...dropIds.map((id) => ({
        id: `drop:${id}` as const, label: dropLabel(id), on: !!dropSets.get(id)?.has(slug), active: activeDrops.has(id),
      })),
    ],
    [excludedSet, weddingBy, view.tiers, dropIds, dropSets, activeDrops]
  );

  // ── Master visibility ──────────────────────────────────────────────────────
  const afterVisibility = useCallback(() => {
    // The gallery in this same tab reads a module-level cache; without this
    // an admin toggles a template on, clicks through to /templates, and it is
    // still missing — which reads as the switch not working.
    void refreshTemplateVisibility();
    void purgeSiteCache();
  }, []);

  const setOne = useCallback(
    async (slug: string, live: boolean) => {
      const key = `${slug}:vis`;
      if (!accessToken || busy.has(key)) return;
      const prev = rows[slug];
      mark(key, true);
      setRows((p) => ({ ...p, [slug]: { slug, live, updatedByEmail: user?.email || prev?.updatedByEmail || "", updatedAt: new Date().toISOString() } }));
      try {
        const d = await api(`/admin/template-visibility/${encodeURIComponent(slug)}`, { method: "PATCH", body: JSON.stringify({ live }) });
        setRows((p) => ({ ...p, [slug]: { slug, live, updatedByEmail: String(d.updatedByEmail || ""), updatedAt: new Date().toISOString() } }));
        afterVisibility();
        say(`${slug} is now ${live ? "live" : "hidden"}`);
      } catch (e) {
        setRows((p) => {
          const n = { ...p };
          if (prev) n[slug] = prev; else delete n[slug];
          return n;
        });
        say(e instanceof Error ? e.message : "Could not save", "err");
      } finally {
        mark(key, false);
      }
    },
    [accessToken, busy, rows, user?.email, api, mark, afterVisibility, say]
  );

  /** Drop the decision and let the built-in default apply again. */
  const clearOne = useCallback(
    async (slug: string) => {
      const key = `${slug}:vis`;
      if (!accessToken || busy.has(key)) return;
      const prev = rows[slug];
      mark(key, true);
      setRows((p) => { const n = { ...p }; delete n[slug]; return n; });
      try {
        await api(`/admin/template-visibility/${encodeURIComponent(slug)}`, { method: "DELETE" });
        afterVisibility();
        say(`${slug} follows the default again`);
      } catch (e) {
        if (prev) setRows((p) => ({ ...p, [slug]: prev }));
        say(e instanceof Error ? e.message : "Could not save", "err");
      } finally {
        mark(key, false);
      }
    },
    [accessToken, busy, rows, api, mark, afterVisibility, say]
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
      await api("/admin/template-visibility", { method: "PATCH", body: JSON.stringify({ updates }) });
      await load();
      afterVisibility();
      say(`Pinned ${updates.length} templates to their current state`);
    } catch (e) {
      say(e instanceof Error ? e.message : "Could not save", "err");
    } finally {
      setBulkBusy(false);
    }
  }, [accessToken, bulkBusy, isLive, api, load, afterVisibility, say]);

  // ── Places (super admin) ───────────────────────────────────────────────────
  const afterPlaces = useCallback(() => {
    void refreshTemplateMeta();
    void purgeSiteCache();
  }, []);

  /** Run one optimistic place write: apply `optimistic`, roll back to the snapshot on failure. */
  const runPlace = useCallback(
    async (key: string, optimistic: (p: Places) => Partial<Places>, write: () => Promise<Partial<Places> | void>, ok: string) => {
      if (!superAdmin || busy.has(key)) return;
      // Only the fields this write touches roll back, so a parallel save of another place survives.
      let undo: Partial<Places> = {};
      setPlaces((p) => {
        const patch = optimistic(p);
        undo = Object.fromEntries(Object.keys(patch).map((f) => [f, p[f as keyof Places]])) as Partial<Places>;
        return { ...p, ...patch };
      });
      mark(key, true);
      try {
        const patch = await write();
        if (patch) setPlaces((p) => ({ ...p, ...patch }));
        afterPlaces();
        say(ok);
      } catch (e) {
        const conflict = e instanceof DropConflictError;
        setPlaces((p) => {
          const back = { ...p, ...undo };
          if (!conflict || !back.season) return back;
          // Show the drop as it really is now.
          const id = key.split(":drop:")[1];
          return { ...back, season: { ...back.season, drops: { ...back.season.drops, [id]: { ...back.season.drops?.[id], saleSlugs: e.live } } } };
        });
        say(e instanceof Error ? e.message : "Could not save", "err");
      } finally {
        mark(key, false);
      }
    },
    [superAdmin, busy, mark, afterPlaces, say]
  );

  const toggleGallery = useCallback(
    (slug: string, on: boolean) =>
      runPlace(
        `${slug}:gallery`,
        (p) => ({ excluded: on ? p.excluded.filter((s) => s !== slug) : [...p.excluded, slug] }),
        async () => {
          const fresh = new Set(((await getCollection(accessToken, "gallery-exclude")) ?? []).map((i) => i.slug));
          if (on) fresh.delete(slug); else fresh.add(slug);
          if (fresh.size > GALLERY_EXCLUDE_MAX) throw new Error(`At most ${GALLERY_EXCLUDE_MAX} templates can be kept off the Templates page`);
          const saved = await putCollection(accessToken, "gallery-exclude", sortItems([...fresh].map((s) => ({ slug: s }))));
          return { excluded: saved.map((i) => i.slug) };
        },
        on ? "Listed on /templates" : "Kept off /templates — it still opens by link"
      ),
    [runPlace, accessToken]
  );

  const setWedding = useCallback(
    (slug: string, on: boolean, group?: WeddingGroup) => {
      const apply = (list: PlaceItem[]): PlaceItem[] => {
        if (!on) return list.filter((i) => i.slug !== slug);
        const g = group ?? list.find((i) => i.slug === slug)?.group ?? (filterOf(slug) as WeddingGroup);
        return list.some((i) => i.slug === slug) ? list.map((i) => (i.slug === slug ? { ...i, group: g } : i)) : [...list, { slug, group: g }];
      };
      const label = GROUPS.find((g) => g.id === group)?.label;
      const wasIn = weddingBy.has(slug);
      return runPlace(
        `${slug}:wedding`,
        (p) => ({ wedding: apply(p.wedding ?? autoWedding) }),
        async () => {
          // Nothing saved yet → start from the automatic list the hub shows now.
          const base = (await getCollection(accessToken, "wedding")) ?? autoWedding;
          const next = apply(base);
          if (next.length > WEDDING_MAX) throw new Error(`/wedding holds at most ${WEDDING_MAX} templates`);
          return { wedding: await putCollection(accessToken, "wedding", next) };
        },
        !on ? "Removed from /wedding" : wasIn ? `Moved to ${label ?? "its group"} on /wedding` : `Added to /wedding${label ? ` under ${label}` : ""}`
      );
    },
    [runPlace, accessToken, autoWedding, weddingBy]
  );

  const togglePremium = useCallback(
    (slug: string, on: boolean) =>
      runPlace(
        `${slug}:premium`,
        (p) => {
          const w = premiumWrite(slug, on);
          const tiers = { ...p.tiers };
          if (w.method === "PATCH") tiers[slug] = !!w.premium; else delete tiers[slug];
          return { tiers };
        },
        async () => {
          await writePremium(accessToken, slug, on);
          return { tiers: await getTiers(accessToken) };
        },
        on ? "Added to the Premium page" : "Removed from the Premium page"
      ),
    [runPlace, accessToken]
  );

  const toggleDrop = useCallback(
    (slug: string, id: string, on: boolean) => {
      // What this page showed — the drop is refused if it changed elsewhere since.
      const expected = dropSlugsIn(places.season, id);
      const next = on ? [...expected.filter((s) => s !== slug), slug] : expected.filter((s) => s !== slug);
      if (!on && next.length === 0) { say("A drop needs at least one template — add another before removing this one", "err"); return; }
      if (next.length > DROP_MAX) { say(`A drop holds at most ${DROP_MAX} templates`, "err"); return; }
      let warn = false;
      return runPlace(
        `${slug}:drop:${id}`,
        (p) => (p.season ? { season: { ...p.season, drops: { ...p.season.drops, [id]: { ...p.season.drops?.[id], saleSlugs: next } } } } : {}),
        async () => {
          const r = await writeDropSlugs(accessToken, id, expected, next);
          warn = r.otherChanged;
          if (warn) setTimeout(() => say("Saved — but other season settings look different now; check Season & offers", "warn"), 0);
          return { season: r.season };
        },
        `${on ? "Added to" : "Removed from"} the ${dropLabel(id)} drop`
      );
    },
    [places.season, runPlace, accessToken, say]
  );

  // ── Filters ────────────────────────────────────────────────────────────────
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

  const apiHost = useMemo(() => { try { return new URL(API_URL).host; } catch { return API_URL; } }, []);
  const openEntry = useMemo(() => CATALOGUE.find((t) => t.slug === openSlug) ?? null, [openSlug]);
  const closeModal = useCallback(() => setOpenSlug(null), []);

  return (
    <AdminPage
      title="Templates"
      subtitle="Every template, whether it is live on this deployment, and where it shows. Tap a template to choose where it appears — the Templates page, /wedding, the Premium page and the seasonal drops — or to hide it everywhere. Hidden templates disappear from every listing and their builder closes; pages already published from them keep working."
      icon={<LayoutGrid size={18} />}
      width={1280}
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
          <HeroStat big label="LIVE" value={liveCount} sub={`${livePct}% of ${CATALOGUE.length} templates`} />
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
        {isApex === false && apexDefaultHidden.size > 0 ? (
          <div className="tv-host">
            <Info size={13} style={{ flex: "none", color: "#ffe3a3" }} />
            <span style={{ minWidth: 0, overflowWrap: "anywhere" }}>
              This is not the live domain, so templates without an admin decision are <strong style={{ color: "#ffe3a3" }}>live here</strong>.
              On the live domain {apexDefaultHidden.size} newer templates start hidden until switched on there (marked &ldquo;hidden on live domain&rdquo;).
            </span>
          </div>
        ) : null}
      </Hero>

      <div className="tv-controls">
        <SearchBox value={search} onChange={setSearch} placeholder="Search by name or slug" style={{ flex: "1 1 240px" }} />
        <div className="tv-chiprow">
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
      </div>

      {error ? (
        <div className="tv-error" role="alert">
          <AlertTriangle size={15} style={{ color: OFF, flex: "none", marginTop: 1 }} />
          <span style={{ fontSize: 12.5, color: A.ink, overflowWrap: "anywhere" }}>{error}</span>
        </div>
      ) : null}
      {places.error ? (
        <div className="tv-error" role="alert">
          <AlertTriangle size={15} style={{ color: A.warn, flex: "none", marginTop: 1 }} />
          <span style={{ fontSize: 12.5, color: A.ink, overflowWrap: "anywhere" }}>Could not load where templates show: {places.error}</span>
        </div>
      ) : null}

      {loading ? (
        <Loading label="Loading templates…" />
      ) : shown.length === 0 ? (
        <EmptyState icon={<Search size={20} />} title="Nothing matches." note="Try another name, slug or filter." />
      ) : (
        <ul className="tc-grid" aria-label="Templates">
          {shown.map((t) => {
            const state = stateOf(t.slug);
            const live = state === "live" || state === "default-live";
            const decided = state === "live" || state === "hidden";
            const row = rows[t.slug];
            const img = imgOf(t);
            const on = places.loaded ? placementsOf(t.slug).filter((p) => p.on) : [];
            const notes = [
              !decided ? "default" : null,
              !decided && isApex === false && apexDefaultHidden.has(t.slug) ? "hidden on live domain" : null,
              t.group === "Webpage" ? "webpage" : null,
            ].filter(Boolean);
            return (
              <li key={`${t.group}-${t.slug}`} className="tc-li">
                <button
                  type="button"
                  className="tc-card"
                  data-live={live ? "1" : "0"}
                  aria-haspopup="dialog"
                  onClick={() => setOpenSlug(t.slug)}
                >
                  <span className="tc-cover" aria-hidden="true">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {img ? <img src={img} alt="" loading="lazy" decoding="async" /> : <span className="tc-emoji">{t.emoji}</span>}
                  </span>
                  <span className="tc-body">
                    <span className="tc-name">{t.title}</span>
                    <span className="tc-status">
                      <span className="tc-pill" data-live={live ? "1" : "0"}>
                        <i aria-hidden="true" />{live ? "Live" : "Hidden"}
                      </span>
                      {notes.length ? <span className="tc-note">{notes.join(" · ")}</span> : null}
                    </span>
                    <span className="tc-meta">
                      /{t.slug}
                      {row?.updatedByEmail ? <> · set by <span title={row.updatedByEmail}>{nameOf(row.updatedByEmail)}</span></> : null}
                    </span>
                    {places.loaded && !places.error ? (
                      <span className="tc-places" data-dim={live ? "0" : "1"} aria-label={on.length ? `Shows on: ${on.map((p) => p.label).join(", ")}` : "Not on any page — opens by link only"}>
                        {on.length ? on.map((p) => <PlaceBadge key={p.id} p={p} />) : <span className="tc-none">Link only</span>}
                      </span>
                    ) : null}
                  </span>
                  <ChevronRight size={16} className="tc-chev" aria-hidden="true" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <AnimatePresence>
        {openEntry ? (
          <PlacementModal
            key={openEntry.slug}
            t={openEntry}
            state={stateOf(openEntry.slug)}
            row={rows[openEntry.slug]}
            hiddenOnApex={isApex === false && apexDefaultHidden.has(openEntry.slug)}
            defaultIsHidden={defaultHidden.has(openEntry.slug)}
            isApex={isApex}
            superAdmin={superAdmin}
            placesLoaded={places.loaded && !places.error}
            placements={placementsOf(openEntry.slug)}
            weddingGroup={weddingBy.get(openEntry.slug)?.group}
            weddingAuto={view.wedding === null}
            busy={busy}
            onClose={closeModal}
            onLive={(live) => setOne(openEntry.slug, live)}
            onReset={() => clearOne(openEntry.slug)}
            onGallery={(on) => toggleGallery(openEntry.slug, on)}
            onWedding={(on, g) => setWedding(openEntry.slug, on, g)}
            onPremium={(on) => togglePremium(openEntry.slug, on)}
            onDrop={(id, on) => toggleDrop(openEntry.slug, id, on)}
          />
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {toast ? (
          <motion.div
            key="toast"
            role={toast.tone === "err" ? "alert" : "status"}
            aria-live="polite"
            className="tv-toast"
            data-tone={toast.tone}
            initial={{ opacity: 0, y: 14, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 14, x: "-50%" }}
          >
            {toast.msg}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </AdminPage>
  );
}

const PLACE_TONE = (id: PlaceId) =>
  id === "gallery" ? A.ok : id === "wedding" ? A.maroon2 : id === "premium" ? A.goldDeep : A.info;

function PlaceBadge({ p }: { p: Placement }) {
  return (
    <span className="tc-badge" style={{ ["--t" as string]: PLACE_TONE(p.id) }} title={p.active ? `${p.label} — active now` : p.label}>
      {p.active ? <i className="tc-live-dot" aria-hidden="true" /> : null}
      {p.label}
    </span>
  );
}

// ── The dialog ───────────────────────────────────────────────────────────────

function Switch({ on, busy, disabled, label, onChange }: { on: boolean; busy?: boolean; disabled?: boolean; label: string; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      aria-busy={busy || undefined}
      disabled={disabled}
      className="pm-switch"
      data-on={on ? "1" : "0"}
      data-busy={busy ? "1" : "0"}
      onClick={() => { if (!busy) onChange(!on); }}
    >
      <span className="pm-knob">{busy ? <Loader2 size={11} className="animate-spin" /> : on ? <Check size={11} strokeWidth={3} /> : null}</span>
    </button>
  );
}

function PlaceRow({ title, sub, extra, children }: { title: ReactNode; sub?: ReactNode; extra?: ReactNode; children: ReactNode }) {
  return (
    <div className="pm-row">
      <div className="pm-row-main">
        <div className="pm-row-text">
          <span className="pm-row-title">{title}</span>
          {sub ? <span className="pm-row-sub">{sub}</span> : null}
        </div>
        {children}
      </div>
      {extra}
    </div>
  );
}

function PlacementModal({
  t, state, row, hiddenOnApex, defaultIsHidden, isApex, superAdmin, placesLoaded, placements, weddingGroup, weddingAuto, busy,
  onClose, onLive, onReset, onGallery, onWedding, onPremium, onDrop,
}: {
  t: Entry; state: State; row?: Row; hiddenOnApex: boolean; defaultIsHidden: boolean; isApex: boolean | null; superAdmin: boolean; placesLoaded: boolean;
  placements: Placement[]; weddingGroup?: WeddingGroup; weddingAuto: boolean; busy: Set<string>;
  onClose: () => void; onLive: (live: boolean) => void; onReset: () => void; onGallery: (on: boolean) => void;
  onWedding: (on: boolean, g?: WeddingGroup) => void; onPremium: (on: boolean) => void; onDrop: (id: string, on: boolean) => void;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const live = state === "live" || state === "default-live";
  const decided = state === "live" || state === "hidden";
  const img = imgOf(t);
  const titleId = `pm-title-${t.slug}`;
  const [pickGroup, setPickGroup] = useState<WeddingGroup | null>(null);
  const by = (id: PlaceId) => placements.find((p) => p.id === id);
  const drops = placements.filter((p) => p.id.startsWith("drop:"));
  const can = superAdmin && placesLoaded;
  const k = (s: string) => busy.has(`${t.slug}:${s}`);

  // Focus in, trap Tab, Esc closes, page behind does not scroll, focus back out.
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const node = ref.current;
    node?.focus();
    const focusables = () =>
      Array.from(node?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), select:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])') ?? []);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); return; }
      if (e.key !== "Tab") return;
      const f = focusables();
      if (!f.length) { e.preventDefault(); return; }
      const first = f[0], last = f[f.length - 1];
      const at = document.activeElement;
      if (e.shiftKey && (at === first || at === node)) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && at === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      prev?.focus?.();
    };
  }, [onClose]);

  const wedding = by("wedding");
  const lockNote = !superAdmin ? (
    <p className="pm-lock"><Lock size={12} /> Only a super admin can change where a template shows.</p>
  ) : null;

  return (
    <motion.div
      className="pm-backdrop"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduce ? 0 : 0.18 }}
    >
      <motion.div
        ref={ref}
        className="pm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.94, y: 8 }}
        animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
        exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97, y: 4 }}
        transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34, mass: 0.8 }}
      >
        <header className="pm-head">
          <span className="pm-cover" aria-hidden="true">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {img ? <img src={img} alt="" /> : <span className="tc-emoji">{t.emoji}</span>}
          </span>
          <div className="pm-head-text">
            <p className="pm-eyebrow">Where does this template show?</p>
            <h2 id={titleId} className="pm-title">{t.title}</h2>
            <div className="pm-head-meta">
              <span className="pm-slug">/{t.slug}</span>
              <a className="pm-view" href={`/${t.slug}`} target="_blank" rel="noreferrer">
                View page <ExternalLink size={11} />
              </a>
            </div>
          </div>
          <button type="button" className="pm-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </header>

        <div className="pm-scroll">
          <section className="pm-sec" aria-labelledby={`${titleId}-vis`}>
            <h3 id={`${titleId}-vis`} className="pm-h">Visibility</h3>
            <div className="pm-card">
              <PlaceRow
                title={<><span className="tc-pill" data-live={live ? "1" : "0"}><i aria-hidden="true" />{live ? "Live" : "Hidden"}</span></>}
                sub={live
                  ? "Listed on the pages switched on below, and its builder opens."
                  : "Not listed anywhere and its page will not open — except through an active seasonal drop it belongs to. Pages already published keep working."}
              >
                <Switch on={live} busy={k("vis")} label={`Live: ${t.title}`} onChange={onLive} />
              </PlaceRow>
              <div className="pm-default">
                {decided ? (
                  <>
                    <span>
                      Set by <strong title={row?.updatedByEmail}>{row?.updatedByEmail ? nameOf(row.updatedByEmail) : "an admin"}</strong>
                      {row?.updatedAt ? ` · ${new Date(row.updatedAt).toLocaleDateString(undefined, { day: "numeric", month: "short" })}` : ""}
                    </span>
                    <button type="button" className="pm-text-btn" onClick={onReset} disabled={k("vis")}>
                      <RotateCcw size={12} /> Reset to default ({defaultIsHidden ? "hidden" : "live"} here)
                    </button>
                  </>
                ) : (
                  <span>
                    Following the default — <strong>{defaultIsHidden ? "hidden" : "live"}</strong> on this deployment
                    {hiddenOnApex ? "; hidden on the live domain until switched on there" : isApex ? " (the live domain)" : ""}.
                  </span>
                )}
              </div>
            </div>
          </section>

          <section className="pm-sec" aria-labelledby={`${titleId}-on`}>
            <h3 id={`${titleId}-on`} className="pm-h">Show on</h3>
            {lockNote}
            {!live ? (
              <p className="pm-warn"><EyeOff size={13} /> Hidden right now — these places list it again once it is Live. An active drop still opens it.</p>
            ) : null}
            {!placesLoaded ? (
              <div className="pm-card"><div className="pm-loading"><Loader2 size={14} className="animate-spin" /> Loading places…</div></div>
            ) : (
              <div className="pm-card">
                <PlaceRow title="Templates page" sub={by("gallery")?.on ? "/templates, its search and Premium room" : "Off — not listed, still opens by link"}>
                  <Switch on={!!by("gallery")?.on} busy={k("gallery")} disabled={!can} label={`Templates page: ${t.title}`} onChange={onGallery} />
                </PlaceRow>

                <PlaceRow
                  title="Wedding page"
                  sub={wedding?.on
                    ? <>/wedding · {weddingAuto ? "automatic list" : "curated list"}</>
                    : <>/wedding{weddingAuto ? " · automatic list (saving curates it)" : ""}</>}
                  extra={
                    wedding?.on ? (
                      <label className="pm-group">
                        <span>Group</span>
                        <select
                          value={weddingGroup ?? (filterOf(t.slug) as WeddingGroup)}
                          disabled={!can || k("wedding")}
                          onChange={(e) => onWedding(true, e.target.value as WeddingGroup)}
                        >
                          {GROUPS.map((g) => <option key={g.id} value={g.id}>{g.emoji} {g.label}</option>)}
                        </select>
                      </label>
                    ) : pickGroup ? (
                      <div className="pm-pick" role="group" aria-label="Wedding group">
                        <p>Which group on /wedding?</p>
                        <div className="pm-pick-chips">
                          {GROUPS.map((g) => (
                            <button
                              key={g.id}
                              type="button"
                              className="pm-chip"
                              aria-pressed={pickGroup === g.id}
                              data-on={pickGroup === g.id ? "1" : "0"}
                              onClick={() => setPickGroup(g.id)}
                            >
                              {g.emoji} {g.label}
                            </button>
                          ))}
                        </div>
                        <div className="pm-pick-act">
                          <button type="button" className="pm-text-btn" onClick={() => setPickGroup(null)}>Cancel</button>
                          <button
                            type="button"
                            className="adk-btn"
                            data-v="primary"
                            onClick={() => { onWedding(true, pickGroup); setPickGroup(null); }}
                          >
                            Add to Wedding
                          </button>
                        </div>
                      </div>
                    ) : null
                  }
                >
                  <Switch
                    on={!!wedding?.on || !!pickGroup}
                    busy={k("wedding")}
                    disabled={!can}
                    label={`Wedding page: ${t.title}`}
                    onChange={(v) => {
                      if (!v) { if (pickGroup) setPickGroup(null); else onWedding(false); return; }
                      setPickGroup(filterOf(t.slug) as WeddingGroup);
                    }}
                  />
                </PlaceRow>

                <PlaceRow title="Premium page" sub="/templates/premium">
                  <Switch on={!!by("premium")?.on} busy={k("premium")} disabled={!can} label={`Premium page: ${t.title}`} onChange={onPremium} />
                </PlaceRow>

                {drops.map((p) => {
                  const id = p.id.slice(5);
                  return (
                    <PlaceRow
                      key={p.id}
                      title={<>{p.label} drop {p.active ? <span className="pm-active"><i className="tc-live-dot" aria-hidden="true" />Active now</span> : null}</>}
                      sub={<>{dropPath(id) ?? "Seasonal drop"}{p.active ? " · reachable even while hidden" : " · not running"}</>}
                    >
                      <Switch on={p.on} busy={k(`drop:${id}`)} disabled={!can} label={`${p.label} drop: ${t.title}`} onChange={(v) => onDrop(id, v)} />
                    </PlaceRow>
                  );
                })}
              </div>
            )}
            {superAdmin ? (
              <p className="pm-foot">
                Each switch saves at once. Order and bulk edits live in{" "}
                <Link href="/admin/places">Wedding &amp; places</Link>; drop prices and the active season in{" "}
                <Link href="/admin/season">Season &amp; offers</Link>.
              </p>
            ) : null}
          </section>
        </div>
      </motion.div>
    </motion.div>
  );
}

const TV_CSS = `
  .animate-spin { animation: spin 0.9s linear infinite; }
  .tv-bar { margin-top: 12px; height: 6px; border-radius: 99px; background: rgba(255,120,110,.28); overflow: hidden; }
  .tv-bar > span { display: block; height: 100%; border-radius: 99px; background: linear-gradient(90deg, #c9a84c, #ffe3a3); }
  .tv-host { display: flex; align-items: flex-start; gap: 7px; margin-top: 11px; font-size: 11.5px; line-height: 1.45; opacity: .9; }
  .tv-controls { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 12px; }
  .tv-chiprow { display: flex; gap: 8px; min-width: 0; max-width: 100%; overflow-x: auto; scrollbar-width: none; }
  .tv-chiprow::-webkit-scrollbar { display: none; }
  .tv-chiprow > .adk-chips { flex: none; overflow: visible; }
  @media (max-width: 640px) { .tv-controls > .adk-search { flex-basis: 100% !important; } .tv-chiprow { width: 100%; } }
  .tv-error { display: flex; gap: 8px; align-items: flex-start; margin-bottom: 10px; padding: 10px 12px; border-radius: 12px;
    background: rgba(179,38,30,0.08); border: 1px solid rgba(179,38,30,0.3); }

  /* ── cards ── */
  .tc-grid { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: minmax(0,1fr); gap: 10px; }
  @media (min-width: 700px) { .tc-grid { grid-template-columns: repeat(2, minmax(0,1fr)); gap: 12px; } }
  @media (min-width: 1100px) { .tc-grid { grid-template-columns: repeat(3, minmax(0,1fr)); } }
  .tc-li { min-width: 0; display: flex; }
  .tc-card { position: relative; flex: 1; min-width: 0; min-height: 44px; display: flex; align-items: stretch; gap: 13px; padding: 10px 12px 10px 10px;
    text-align: left; font: inherit; color: inherit; cursor: pointer; border-radius: 18px; background: #fffdfb;
    border: 1px solid rgba(61,12,17,.09); box-shadow: 0 1px 0 rgba(255,255,255,.8) inset, 0 6px 18px -14px rgba(61,12,17,.35);
    transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease; -webkit-tap-highlight-color: transparent; }
  .tc-card:hover { transform: translateY(-2px); border-color: rgba(201,168,76,.55); box-shadow: 0 16px 30px -18px rgba(61,12,17,.45); }
  .tc-card:active { transform: translateY(0) scale(.99); }
  .tc-card:focus-visible { outline: 2.5px solid ${A.gold}; outline-offset: 2px; }
  .tc-cover { flex: none; width: 88px; aspect-ratio: 3/4; align-self: flex-start; border-radius: 12px; overflow: hidden; display: grid; place-items: center;
    background: linear-gradient(160deg, #f6ebdd, #ead9c4); box-shadow: 0 0 0 1px rgba(61,12,17,.06), 0 8px 16px -10px rgba(61,12,17,.45); }
  .tc-cover img { width: 100%; height: 100%; object-fit: cover; object-position: top; display: block; }
  .tc-card[data-live="0"] .tc-cover img { filter: grayscale(.65); opacity: .78; }
  .tc-emoji { font-size: 30px; }
  .tc-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 6px; padding: 2px 0; }
  .tc-name { font-family: 'Playfair Display', Georgia, serif; font-size: 16px; font-weight: 700; line-height: 1.22; color: ${A.ink};
    overflow-wrap: anywhere; text-wrap: balance; }
  .tc-status { display: flex; align-items: center; flex-wrap: wrap; gap: 4px 8px; }
  .tc-pill { display: inline-flex; align-items: center; gap: 5px; height: 22px; padding: 0 9px 0 8px; border-radius: 99px;
    font-size: 11px; font-weight: 800; letter-spacing: .02em; color: ${OK}; background: rgba(30,122,75,.1); border: 1px solid rgba(30,122,75,.22); }
  .tc-pill i { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
  .tc-pill[data-live="0"] { color: ${OFF}; background: rgba(179,38,30,.08); border-color: rgba(179,38,30,.2); }
  .tc-note { font-size: 11px; font-weight: 600; color: ${A.muted}; }
  .tc-meta { font-size: 11.5px; color: ${A.muted}; overflow-wrap: anywhere; line-height: 1.35; }
  .tc-places { display: flex; flex-wrap: wrap; gap: 4px; margin-top: auto; padding-top: 2px; }
  .tc-places[data-dim="1"] .tc-badge { opacity: .55; }
  .tc-badge { display: inline-flex; align-items: center; gap: 4px; height: 20px; padding: 0 7px; border-radius: 6px; font-size: 10.5px; font-weight: 700;
    color: var(--t); background: color-mix(in srgb, var(--t) 9%, transparent); border: 1px solid color-mix(in srgb, var(--t) 18%, transparent); white-space: nowrap; }
  .tc-none { font-size: 10.5px; font-weight: 700; color: ${A.warn}; }
  .tc-live-dot { width: 6px; height: 6px; border-radius: 50%; background: #e0592a; box-shadow: 0 0 0 0 rgba(224,89,42,.5); animation: tc-pulse 1.8s ease-out infinite; }
  @keyframes tc-pulse { 0% { box-shadow: 0 0 0 0 rgba(224,89,42,.5); } 70% { box-shadow: 0 0 0 5px rgba(224,89,42,0); } 100% { box-shadow: 0 0 0 0 rgba(224,89,42,0); } }
  .tc-chev { flex: none; align-self: center; color: rgba(61,12,17,.28); transition: transform .18s, color .18s; }
  .tc-card:hover .tc-chev { color: ${A.goldDeep}; transform: translateX(2px); }
  @media (min-width: 700px) { .tc-cover { width: 96px; } }

  /* ── dialog ── */
  .pm-backdrop { position: fixed; inset: 0; z-index: 150; display: grid; place-items: center; padding: 16px;
    padding-top: max(16px, env(safe-area-inset-top)); padding-bottom: max(16px, env(safe-area-inset-bottom));
    background: rgba(26,5,7,.52); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); }
  .pm-dialog { width: min(560px, 100%); max-height: calc(100dvh - 32px); display: flex; flex-direction: column; overflow: hidden;
    border-radius: 22px; background: #fffaf3; outline: none; transform-origin: center;
    box-shadow: 0 0 0 1px rgba(201,168,76,.35), 0 40px 80px -30px rgba(26,5,7,.75); }
  .pm-head { position: relative; display: flex; gap: 14px; align-items: flex-start; padding: 16px 56px 14px 16px;
    background: linear-gradient(135deg, #4a0f17, #2a070c); color: #fdf3e3; }
  .pm-cover { flex: none; width: 64px; aspect-ratio: 3/4; border-radius: 11px; overflow: hidden; display: grid; place-items: center;
    background: rgba(255,255,255,.08); box-shadow: 0 0 0 1px rgba(255,227,163,.35), 0 10px 20px -10px rgba(0,0,0,.6); }
  .pm-cover img { width: 100%; height: 100%; object-fit: cover; object-position: top; display: block; }
  .pm-head-text { min-width: 0; flex: 1; }
  .pm-eyebrow { margin: 0 0 4px; font-size: 10px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; color: #e9c979; }
  .pm-title { margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 20px; font-weight: 700; line-height: 1.2; color: #fff7e8;
    overflow-wrap: anywhere; text-wrap: balance; }
  .pm-head-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 12px; margin-top: 8px; }
  .pm-slug { font-size: 12px; color: rgba(253,243,227,.7); overflow-wrap: anywhere; }
  .pm-view { display: inline-flex; align-items: center; gap: 4px; min-height: 28px; padding: 0 10px; border-radius: 99px; font-size: 11.5px; font-weight: 800;
    color: #3d0c11; background: linear-gradient(135deg, #ffe3a3, #c9a84c); text-decoration: none; }
  .pm-view:focus-visible, .pm-close:focus-visible { outline: 2px solid #ffe3a3; outline-offset: 2px; }
  .pm-close { position: absolute; top: 10px; right: 10px; width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center; cursor: pointer;
    color: #fdf3e3; background: rgba(255,255,255,.08); border: 1px solid rgba(255,227,163,.18); }
  .pm-close:hover { background: rgba(255,255,255,.16); }
  .pm-scroll { overflow-y: auto; overscroll-behavior: contain; padding: 14px 16px 18px; -webkit-overflow-scrolling: touch; }
  .pm-sec + .pm-sec { margin-top: 18px; }
  .pm-h { margin: 0 2px 8px; font-size: 11px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: ${A.goldDeep}; }
  .pm-card { border-radius: 16px; background: #fff; border: 1px solid rgba(61,12,17,.08); box-shadow: 0 6px 16px -14px rgba(61,12,17,.4); overflow: hidden; }
  .pm-row { padding: 12px 14px; }
  .pm-row + .pm-row { border-top: 1px solid rgba(61,12,17,.07); }
  .pm-row-main { display: flex; align-items: center; gap: 12px; min-height: 44px; }
  .pm-row-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
  .pm-row-title { display: flex; align-items: center; flex-wrap: wrap; gap: 6px; font-size: 14px; font-weight: 700; color: ${A.ink}; }
  .pm-row-sub { font-size: 12px; line-height: 1.4; color: ${A.soft}; }
  .pm-active { display: inline-flex; align-items: center; gap: 5px; height: 20px; padding: 0 8px; border-radius: 99px; font-size: 10.5px; font-weight: 800;
    color: #b8441c; background: rgba(224,89,42,.1); }
  .pm-switch { flex: none; position: relative; width: 50px; height: 30px; padding: 3px; border-radius: 99px; cursor: pointer; display: flex; align-items: center;
    justify-content: flex-start; border: 1px solid rgba(61,12,17,.16); background: rgba(61,12,17,.1); transition: background .2s, border-color .2s, opacity .2s; }
  .pm-switch[data-on="1"] { justify-content: flex-end; background: ${OK}; border-color: ${OK}; }
  .pm-switch[data-busy="1"] { cursor: progress; }
  .pm-switch:disabled { opacity: .45; cursor: not-allowed; }
  .pm-switch:focus-visible { outline: 2.5px solid ${A.gold}; outline-offset: 2px; }
  .pm-switch::before { content: ""; position: absolute; inset: -8px -4px; }
  .pm-knob { width: 22px; height: 22px; border-radius: 50%; background: #fff; display: grid; place-items: center; color: ${OK};
    box-shadow: 0 2px 6px rgba(61,12,17,.3); }
  .pm-default { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 6px 10px; padding: 10px 14px;
    border-top: 1px solid rgba(61,12,17,.07); background: rgba(201,168,76,.06); font-size: 12px; color: ${A.soft}; line-height: 1.4; }
  .pm-default strong { color: ${A.ink}; }
  .pm-text-btn { display: inline-flex; align-items: center; gap: 5px; min-height: 36px; padding: 0 6px; border: 0; background: none; cursor: pointer;
    font: inherit; font-size: 12.5px; font-weight: 800; color: ${A.maroon2}; text-decoration: underline; text-underline-offset: 3px; }
  .pm-text-btn:disabled { opacity: .5; cursor: default; }
  .pm-group { display: flex; align-items: center; gap: 8px; margin-top: 8px; font-size: 12px; font-weight: 700; color: ${A.soft}; }
  .pm-group select { flex: 1; min-width: 0; height: 38px; padding: 0 10px; border-radius: 10px; border: 1px solid rgba(61,12,17,.14); background: #fffdfb;
    font: inherit; font-size: 13px; font-weight: 600; color: ${A.ink}; }
  .pm-pick { margin-top: 10px; padding: 12px; border-radius: 12px; background: rgba(90,21,32,.04); border: 1px dashed rgba(90,21,32,.2); }
  .pm-pick p { margin: 0 0 8px; font-size: 12.5px; font-weight: 700; color: ${A.ink}; }
  .pm-pick-chips { display: flex; flex-wrap: wrap; gap: 6px; }
  .pm-chip { min-height: 36px; padding: 0 12px; border-radius: 99px; cursor: pointer; font: inherit; font-size: 12.5px; font-weight: 700;
    color: ${A.ink}; background: #fff; border: 1px solid rgba(61,12,17,.14); }
  .pm-chip[data-on="1"] { color: #fff6e6; background: ${A.maroon}; border-color: ${A.maroon}; }
  .pm-pick-act { display: flex; justify-content: flex-end; gap: 8px; margin-top: 10px; }
  .pm-lock, .pm-warn { display: flex; align-items: flex-start; gap: 6px; margin: 0 2px 8px; font-size: 12px; line-height: 1.4; font-weight: 600; }
  .pm-lock { color: ${A.soft}; }
  .pm-lock svg, .pm-warn svg { flex: none; margin-top: 2px; }
  .pm-warn { color: ${A.warn}; }
  .pm-loading { display: flex; align-items: center; gap: 8px; padding: 18px 14px; font-size: 12.5px; color: ${A.muted}; }
  .pm-foot { margin: 10px 2px 0; font-size: 11.5px; line-height: 1.5; color: ${A.muted}; }
  .pm-foot a { color: ${A.maroon2}; font-weight: 700; }
  @media (max-width: 420px) {
    .pm-backdrop { padding: 12px; }
    .pm-dialog { max-height: calc(100dvh - 24px); }
    .pm-head { padding: 14px 52px 12px 14px; gap: 12px; }
    .pm-cover { width: 54px; }
    .pm-eyebrow { font-size: 9.5px; letter-spacing: .07em; }
    .pm-title { font-size: 18px; }
    .pm-scroll { padding: 12px 12px 16px; }
    .pm-row { padding: 11px 12px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .tc-card, .tc-chev, .pm-switch { transition: none; }
    .tc-card:hover { transform: none; }
    .tc-live-dot { animation: none; }
  }

  .tv-toast { position: fixed; left: 50%; bottom: calc(82px + env(safe-area-inset-bottom, 0px) + 14px); z-index: 200;
    padding: 10px 16px; border-radius: 12px; background: ${A.maroon}; color: #fdf8ee; font-size: 12.5px; font-weight: 600;
    max-width: calc(100vw - 32px); width: max-content; text-align: center; box-shadow: 0 10px 30px -10px rgba(26,5,7,.6); }
  .tv-toast[data-tone="ok"] { background: ${OK}; }
  .tv-toast[data-tone="err"] { background: ${OFF}; }
  .tv-toast[data-tone="warn"] { background: ${A.warn}; }
  @media (min-width: 768px) { .tv-toast { bottom: 22px; } }
`;
