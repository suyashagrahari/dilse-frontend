"use client";

// ─── Super admin: Wedding & places ───────────────────────────────────────────
//
// One screen for every curated place on the site — which templates appear
// there, and in what order:
//
//   Templates page — the main gallery (/templates, its search and Premium
//               room). Stored as `TemplateCollection` "gallery-exclude": the
//               LIVE templates kept off it (empty = every live template is
//               listed). Excluded templates still open by link and still show
//               in the other places. Apply it only via `isListedOnGallery`.
//   Wedding   — the /wedding hub. Stored as `TemplateCollection` "wedding" on
//               the server (/admin/template-collections/wedding). With no saved
//               list the hub uses its automatic rule (isWeddingTemplate +
//               filterOf); this tab starts from that list. Each template also
//               picks the filter chip it files under. "Reset to automatic"
//               deletes the saved list.
//   Premium   — the Premium page. NO new storage: membership is the existing
//               TemplateTier overrides (/admin/template-tiers), the same rows
//               Premium Studio writes; order is the gallery order
//               (/admin/template-order) — a reorder here moves these templates
//               among the slots they already hold in that order.
//   Drops     — each seasonal drop (Halloween, Dandiya, Diwali…), one tab per
//               drop the server reports. NO new storage: the drop's `saleSlugs`
//               in the season settings, written with a patch that names only
//               that drop's slugs, after re-reading so nothing else moves.
//
// MEMBERSHIP, NOT MOVE: putting a template in a place never takes it out of
// the main gallery — only the Templates page tab does that. Hiding a template
// everywhere (and closing its builder) is /admin/templates.
//
// Every tab tags each template with the OTHER places it is in, so the admin
// sees all of its placements at a glance.
//
// Every tab keeps its own draft; nothing is written until Save. Leaving the
// page (or following a link) with unsaved changes asks first.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Reorder, useDragControls } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { purgeSiteCache } from "@/lib/siteCache";
import { API_URL } from "@/lib/config";
import { isSuperAdmin } from "@/lib/roles";
import { PREMIUM_SLUGS, ULTRA_PREMIUM_SLUGS } from "@/data/template-registry";
import { GALLERY_LIST, GALLERY_BY_SLUG, pinFirst, isComingSoon } from "@/lib/galleryRules";
import { isPremiumRoom, refreshTemplateMeta, useTemplateMeta } from "@/lib/templateMeta";
import { useHiddenTemplates } from "@/hooks/useHiddenTemplates";
import { coverSmall, coverSrcSet } from "@/lib/templateMedia";
import { DROPS, DROP_TEMPLATE_FALLBACK } from "@/lib/season";
import { WEDDING_FILTERS, weddingItems, type WeddingFilter } from "../../wedding/content";
import {
  ArrowDown, ArrowUp, ExternalLink, Eye, EyeOff, Gem, GripVertical, Loader2, Plus, RotateCcw, Save, Undo2, X, Globe, Info,
} from "lucide-react";
import { A, AdminPage, Hero, HeroStat, ChipGroup, SearchBox, Loading, Tag } from "../adminKit";

type Group = Exclude<WeddingFilter, "all">;
type Item = { slug: string; group?: Group };
type TabKind = "gallery" | "wedding" | "premium" | "drop";
type Placement = { id: string; label: string };
type TabState = {
  base: Item[];
  draft: Item[];
  loaded: boolean;
  /** Wedding only: no saved list, so the hub runs on its automatic rule. */
  auto?: boolean;
  /** Premium only: the admin dragged, so Save also writes the gallery order. */
  reordered?: boolean;
  error?: string;
};
type Toast = { msg: string; tone: "ok" | "err" };

const GROUPS = WEDDING_FILTERS.filter((f) => f.id !== "all") as { id: Group; label: string; emoji: string }[];
const DROP_MAX = 50;
const WEDDING_MAX = 300;
const GALLERY_EXCLUDE_MAX = 300;
/** The Templates page's exclusions carry no order: kept sorted so toggling back is not "unsaved". */
const sortItems = (items: Item[]) => [...items].sort((a, b) => (a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0));

/** Name, art and tags for any slug — registry first, then drop fallbacks. */
function info(slug: string) {
  const t = GALLERY_BY_SLUG.get(slug);
  if (t) {
    const img = t.coverImage ? (coverSrcSet(t.coverImage) ? coverSmall(t.coverImage) : t.coverImage) : null;
    return { title: t.title, emoji: t.emoji, img, soon: isComingSoon(t), known: true };
  }
  const f = DROP_TEMPLATE_FALLBACK[slug];
  if (f) return { title: f.title, emoji: f.emoji, img: f.cover, soon: true, known: true };
  return { title: slug, emoji: "✦", img: null, soon: false, known: false };
}

const sameList = (a: Item[], b: Item[]) =>
  a.length === b.length && a.every((x, i) => x.slug === b[i].slug && (x.group ?? "") === (b[i].group ?? ""));

const dropLabel = (id: string) =>
  (DROPS as Record<string, { label: string } | undefined>)[id]?.label.replace(/ drop$/, "") ?? id.charAt(0).toUpperCase() + id.slice(1);
const DROP_TAB_ORDER = ["halloween", "diwali", "dandiya"];
const dropRank = (id: string) => (DROP_TAB_ORDER.includes(id) ? DROP_TAB_ORDER.indexOf(id) : 99);
const dropPath = (id: string) => (DROPS as Record<string, { path: string } | undefined>)[id]?.path;

export default function PlacesPage() {
  const router = useRouter();
  const { user, accessToken, isLoading } = useAppSelector((s) => s.auth);
  const { ranking, order: publicOrder } = useTemplateMeta();
  const hidden = useHiddenTemplates();

  const [allowed, setAllowed] = useState(false);
  const [tab, setTab] = useState<string>("gallery");
  const [dropIds, setDropIds] = useState<string[]>(["halloween", "diwali", "dandiya"]);
  const [tabs, setTabs] = useState<Record<string, TabState>>({});
  const [tiers, setTiers] = useState<Record<string, boolean> | null>(null);
  const [galleryOrder, setGalleryOrder] = useState<string[] | null>(null);
  const [busy, setBusy] = useState<"save" | "reset" | null>(null);
  const [search, setSearch] = useState("");
  const [galleryFilter, setGalleryFilter] = useState<"all" | "listed" | "unlisted" | "hidden">("all");
  const [toast, setToast] = useState<Toast | null>(null);
  const [mobilePane, setMobilePane] = useState<"in" | "add">("in");
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isLoading || !user) return;
    if (!isSuperAdmin(user.role)) { router.replace("/admin/analytics"); return; }
    setAllowed(true);
  }, [user, isLoading, router]);

  const hdr = useCallback(
    () => ({ Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" }),
    [accessToken]
  );

  const say = useCallback((msg: string, tone: Toast["tone"] = "ok") => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, tone });
    toastTimer.current = setTimeout(() => setToast(null), tone === "err" ? 6000 : 3600);
  }, []);

  const api = useCallback(
    async (path: string, init?: RequestInit) => {
      const res = await fetch(`${API_URL}${path}`, { ...init, headers: hdr(), cache: "no-store" });
      let json: { success?: boolean; error?: string; data?: unknown } = {};
      try { json = await res.json(); } catch { /* non-JSON error page */ }
      if (!res.ok || !json?.success) throw new Error(json?.error || `Request failed (${res.status})`);
      return json.data as Record<string, unknown>;
    },
    [hdr]
  );

  const setTabState = useCallback((id: string, patch: Partial<TabState> | ((t: TabState) => Partial<TabState>)) => {
    setTabs((all) => {
      const cur = all[id] ?? { base: [], draft: [], loaded: false };
      return { ...all, [id]: { ...cur, ...(typeof patch === "function" ? patch(cur) : patch) } };
    });
  }, []);

  // ── The automatic wedding list (what the hub shows with nothing saved) ─────
  const created = useMemo(() => new Map(ranking.map((r) => [r.slug, r.created])), [ranking]);
  const rankedAll = useMemo(() => {
    const idx = new Map(GALLERY_LIST.map((t, i) => [t.slug, i]));
    return [...GALLERY_LIST].sort(
      (a, b) => (created.get(b.slug) ?? 0) - (created.get(a.slug) ?? 0) || idx.get(a.slug)! - idx.get(b.slug)!
    );
  }, [created]);
  const autoWedding = useMemo<Item[]>(
    () => weddingItems(pinFirst(rankedAll, publicOrder), null, () => false).map((t) => ({ slug: t.slug, group: t.group })),
    [rankedAll, publicOrder]
  );

  // ── The effective gallery order (for Premium's order) ─────────────────────
  const effectiveGallery = useMemo(() => {
    const saved = (galleryOrder ?? []).filter((s) => GALLERY_BY_SLUG.has(s));
    const rest = pinFirst(rankedAll).map((t) => t.slug).filter((s) => !saved.includes(s));
    return [...saved, ...rest];
  }, [galleryOrder, rankedAll]);
  const galleryIdx = useMemo(() => new Map(effectiveGallery.map((s, i) => [s, i])), [effectiveGallery]);

  const premiumMembers = useCallback(
    (t: Record<string, boolean>): Item[] =>
      effectiveGallery.filter((s) => isPremiumRoom(s, t)).map((slug) => ({ slug })),
    [effectiveGallery]
  );

  // ── Loads ──────────────────────────────────────────────────────────────────
  const loadWedding = useCallback(async () => {
    try {
      const d = await api("/admin/template-collections/wedding");
      const c = d.collection as { items: Item[] } | null;
      if (c) {
        const items = c.items.map((i) => ({ slug: i.slug, group: (i.group as Group) || undefined }));
        setTabState("wedding", { base: items, draft: items, loaded: true, auto: false, error: undefined });
      } else {
        setTabState("wedding", { base: [], draft: [], loaded: true, auto: true, error: undefined });
      }
    } catch (e) {
      setTabState("wedding", { loaded: true, error: e instanceof Error ? e.message : "Could not load" });
    }
  }, [api, setTabState]);

  const loadGallery = useCallback(async () => {
    try {
      const d = await api("/admin/template-collections/gallery-exclude");
      const c = d.collection as { items: Item[] } | null;
      const items = sortItems((c?.items ?? []).map((i) => ({ slug: i.slug })));
      setTabState("gallery", { base: items, draft: items, loaded: true, error: undefined });
    } catch (e) {
      setTabState("gallery", { loaded: true, error: e instanceof Error ? e.message : "Could not load" });
    }
  }, [api, setTabState]);

  const loadPremium = useCallback(async () => {
    try {
      const [t, o] = await Promise.all([api("/admin/template-tiers"), api("/admin/template-order")]);
      const m: Record<string, boolean> = {};
      for (const r of (t.rows ?? []) as { slug: string; premium: boolean }[]) m[r.slug] = r.premium;
      setTiers(m);
      setGalleryOrder(((o.slugs ?? []) as string[]).map(String));
      setTabState("premium", { loaded: true, reordered: false, error: undefined, base: [], draft: [] });
    } catch (e) {
      setTabState("premium", { loaded: true, error: e instanceof Error ? e.message : "Could not load" });
    }
  }, [api, setTabState]);

  const loadSeason = useCallback(async () => {
    try {
      const d = await api("/admin/super/season");
      const drops = (d.drops ?? {}) as Record<string, { saleSlugs?: string[] }>;
      // Server order is storage order; show the season's calendar order first.
      const ids = Object.keys(drops).sort((a, b) => dropRank(a) - dropRank(b));
      if (ids.length) setDropIds(ids);
      setTabs((all) => {
        const next = { ...all };
        for (const id of ids) {
          const slugs = (drops[id]?.saleSlugs ?? []).map((slug) => ({ slug }));
          next[id] = { base: slugs, draft: slugs, loaded: true };
        }
        return next;
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not load";
      setTabs((all) => {
        const next = { ...all };
        for (const id of dropIds) next[id] = { ...(next[id] ?? { base: [], draft: [] }), loaded: true, error: msg };
        return next;
      });
    }
    // dropIds only names the tabs to mark on failure; reading it fresh is not needed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [api]);

  useEffect(() => {
    if (!allowed || !accessToken) return;
    void loadGallery();
    void loadWedding();
    void loadPremium();
    void loadSeason();
  }, [allowed, accessToken, loadGallery, loadWedding, loadPremium, loadSeason]);

  // While the wedding place is automatic and untouched, follow the live
  // automatic list (ranking and order arrive in their own fetch).
  useEffect(() => {
    setTabs((all) => {
      const w = all.wedding;
      if (!w?.loaded || !w.auto || !sameList(w.base, w.draft) || sameList(w.base, autoWedding)) return all;
      return { ...all, wedding: { ...w, base: autoWedding, draft: autoWedding } };
    });
  }, [autoWedding, tabs.wedding?.loaded, tabs.wedding?.auto]);

  // Premium's baseline is derived from tiers + gallery order; keep it current
  // until the admin edits.
  useEffect(() => {
    if (!tiers) return;
    const members = premiumMembers(tiers);
    setTabs((all) => {
      const p = all.premium;
      if (!p?.loaded || p.error || sameList(p.base, members)) return all;
      const untouched = sameList(p.base, p.draft);
      return { ...all, premium: { ...p, base: members, draft: untouched ? members : p.draft } };
    });
  }, [tiers, premiumMembers]);

  // ── Derived for the active tab ────────────────────────────────────────────
  const kind: TabKind = tab === "gallery" ? "gallery" : tab === "wedding" ? "wedding" : tab === "premium" ? "premium" : "drop";
  const cur: TabState = useMemo(() => tabs[tab] ?? { base: [], draft: [], loaded: false }, [tabs, tab]);
  const isDirty = useCallback((t?: TabState) => !!t && t.loaded && !t.error && !sameList(t.base, t.draft), []);
  const dirtyTabs = useMemo(() => Object.keys(tabs).filter((k) => isDirty(tabs[k])), [tabs, isDirty]);
  const dirty = isDirty(cur);
  const inPlace = useMemo(() => new Set(cur.draft.map((i) => i.slug)), [cur.draft]);
  const max = kind === "drop" ? DROP_MAX : kind === "gallery" ? GALLERY_EXCLUDE_MAX : WEDDING_MAX;

  // ── Unsaved-changes guard ─────────────────────────────────────────────────
  useEffect(() => {
    if (!dirtyTabs.length) return;
    const onUnload = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    // In-app links (the admin navbar, the site header) never fire beforeunload.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target === "_blank" || e.metaKey || e.ctrlKey) return;
      if (!window.confirm("You have unsaved changes in Wedding & places. Leave without saving?")) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener("beforeunload", onUnload);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("beforeunload", onUnload);
      document.removeEventListener("click", onClick, true);
    };
  }, [dirtyTabs.length]);

  // ── Edits ─────────────────────────────────────────────────────────────────
  const setDraft = useCallback(
    (fn: (d: Item[]) => Item[], extra?: Partial<TabState>) => setTabState(tab, (t) => ({ draft: fn(t.draft), ...extra })),
    [tab, setTabState]
  );

  const add = useCallback(
    (slug: string) => {
      if (inPlace.has(slug)) return;
      if (cur.draft.length >= max) { say(`A place holds at most ${max} templates`, "err"); return; }
      if (kind === "premium" && !cur.reordered) {
        // Not reordered: keep the gallery order the Premium page will actually show.
        setDraft((d) => [...d, { slug }].sort((a, b) => (galleryIdx.get(a.slug) ?? 1e9) - (galleryIdx.get(b.slug) ?? 1e9)));
        return;
      }
      const group: Group | undefined =
        kind === "wedding" ? (autoWedding.find((i) => i.slug === slug)?.group ?? "indian") : undefined;
      setDraft((d) => [...d, group ? { slug, group } : { slug }]);
    },
    [inPlace, cur.draft.length, cur.reordered, max, kind, setDraft, galleryIdx, autoWedding, say]
  );
  const remove = useCallback((slug: string) => setDraft((d) => d.filter((i) => i.slug !== slug)), [setDraft]);
  const setGroup = useCallback(
    (slug: string, group: Group) => setDraft((d) => d.map((i) => (i.slug === slug ? { ...i, group } : i))),
    [setDraft]
  );
  const reorder = useCallback(
    (slugs: string[]) =>
      setDraft((d) => {
        const by = new Map(d.map((i) => [i.slug, i]));
        return slugs.map((s) => by.get(s)!).filter(Boolean);
      }, kind === "premium" ? { reordered: true } : undefined),
    [setDraft, kind]
  );
  const move = useCallback(
    (slug: string, to: number) =>
      setDraft((d) => {
        const from = d.findIndex((i) => i.slug === slug);
        if (from < 0 || to < 0 || to >= d.length) return d;
        const next = [...d];
        const [it] = next.splice(from, 1);
        next.splice(to, 0, it);
        return next;
      }, kind === "premium" ? { reordered: true } : undefined),
    [setDraft, kind]
  );
  const discard = useCallback(() => setTabState(tab, (t) => ({ draft: t.base, reordered: false })), [tab, setTabState]);

  /** Templates page: list (`true`) or unlist these slugs, in one draft edit. */
  const galleryDraft = tabs.gallery?.draft;
  const setListed = useCallback(
    (slugs: string[], listed: boolean) => {
      const next = new Set((galleryDraft ?? []).map((i) => i.slug));
      for (const s of slugs) {
        if (listed) next.delete(s);
        else next.add(s);
      }
      if (next.size > GALLERY_EXCLUDE_MAX) {
        say(`At most ${GALLERY_EXCLUDE_MAX} templates can be kept off the Templates page`, "err");
        return;
      }
      setTabState("gallery", { draft: sortItems([...next].map((slug) => ({ slug }))) });
    },
    [galleryDraft, setTabState, say]
  );

  // ── Saves ─────────────────────────────────────────────────────────────────
  const saveGallery = useCallback(async () => {
    const d = await api("/admin/template-collections/gallery-exclude", {
      method: "PUT",
      body: JSON.stringify({ items: cur.draft.map((i) => ({ slug: i.slug })) }),
    });
    const c = d.collection as { items: Item[] };
    const items = sortItems(c.items.map((i) => ({ slug: i.slug })));
    setTabState("gallery", { base: items, draft: items });
    // The /templates server shell caches the exclusions for 60s; expire it.
    void purgeSiteCache();
    return items.length
      ? `Saved — ${items.length} live template${items.length === 1 ? " is" : "s are"} kept off /templates (still openable by link)`
      : "Saved — every live template is listed on /templates";
  }, [api, cur.draft, setTabState]);

  const saveWedding = useCallback(async () => {
    const d = await api("/admin/template-collections/wedding", {
      method: "PUT",
      body: JSON.stringify({ items: cur.draft.map((i) => (i.group ? { slug: i.slug, group: i.group } : { slug: i.slug })) }),
    });
    const c = d.collection as { items: Item[] };
    const items = c.items.map((i) => ({ slug: i.slug, group: (i.group as Group) || undefined }));
    setTabState("wedding", { base: items, draft: items, auto: false });
    return `Saved — /wedding shows these ${items.length} templates within about a minute`;
  }, [api, cur.draft, setTabState]);

  const savePremium = useCallback(async () => {
    if (!tiers) throw new Error("Premium is still loading");
    const base = new Set(cur.base.map((i) => i.slug));
    const next = new Set(cur.draft.map((i) => i.slug));
    const writes: { slug: string; method: "PATCH" | "DELETE"; premium?: boolean }[] = [];
    for (const slug of next) {
      if (base.has(slug)) continue;
      // An ✦ template unpinned is already in both rooms; pinned to main → unpin.
      if (ULTRA_PREMIUM_SLUGS.has(slug)) writes.push({ slug, method: "DELETE" });
      else writes.push(PREMIUM_SLUGS.has(slug) ? { slug, method: "DELETE" } : { slug, method: "PATCH", premium: true });
    }
    for (const slug of base) {
      if (next.has(slug)) continue;
      if (ULTRA_PREMIUM_SLUGS.has(slug) || PREMIUM_SLUGS.has(slug)) writes.push({ slug, method: "PATCH", premium: false });
      else writes.push({ slug, method: "DELETE" });
    }
    let done = 0;
    try {
      for (const w of writes) {
        await api(`/admin/template-tiers/${encodeURIComponent(w.slug)}`, {
          method: w.method,
          body: w.method === "PATCH" ? JSON.stringify({ premium: w.premium }) : undefined,
        });
        done++;
      }
      let orderNote = "";
      if (cur.reordered) {
        // Put the Premium templates, in the new order, back into the slots they
        // already hold in the gallery order — nothing else moves.
        const want = cur.draft.map((i) => i.slug).filter((s) => galleryIdx.has(s));
        const set = new Set(want);
        const full = [...effectiveGallery];
        let k = 0;
        for (let i = 0; i < full.length; i++) if (set.has(full[i])) full[i] = want[k++];
        await api("/admin/template-order", { method: "PUT", body: JSON.stringify({ slugs: full }) });
        orderNote = " and the gallery order";
      }
      if (!writes.length) return "Saved the Premium order";
      return `Saved ${writes.length} premium change${writes.length === 1 ? "" : "s"}${orderNote}`;
    } catch (e) {
      throw new Error(`${e instanceof Error ? e.message : "Save failed"} (${done} of ${writes.length} premium changes saved — reloaded)`);
    } finally {
      await loadPremium();
    }
  }, [tiers, cur, api, galleryIdx, effectiveGallery, loadPremium]);

  const saveDrop = useCallback(async () => {
    const slugs = cur.draft.map((i) => i.slug);
    if (slugs.length === 0) throw new Error("A drop needs at least one template");
    if (slugs.length > DROP_MAX) throw new Error(`A drop holds at most ${DROP_MAX} templates`);
    // Read-modify-write: re-read, refuse if this drop changed elsewhere, then
    // send a patch naming only this drop's slugs.
    const before = await api("/admin/super/season");
    const live = (((before.drops ?? {}) as Record<string, { saleSlugs?: string[] }>)[tab]?.saleSlugs ?? []).map(String);
    if (live.join() !== cur.base.map((i) => i.slug).join()) {
      setTabState(tab, { base: live.map((slug) => ({ slug })) });
      throw new Error("This drop was changed elsewhere since you opened it — the saved list was reloaded; check and Save again");
    }
    const after = await api("/admin/super/season", { method: "PUT", body: JSON.stringify({ drops: { [tab]: { saleSlugs: slugs } } }) });
    // Everything but this drop's slugs must be exactly as it was.
    const strip = (s: Record<string, unknown>) => {
      const c = JSON.parse(JSON.stringify(s)) as Record<string, unknown> & { drops?: Record<string, Record<string, unknown>> };
      delete c.updatedAt; delete c.updatedBy;
      if (c.drops?.[tab]) delete c.drops[tab].saleSlugs;
      return JSON.stringify(c);
    };
    const saved = (((after.drops ?? {}) as Record<string, { saleSlugs?: string[] }>)[tab]?.saleSlugs ?? slugs).map((slug) => ({ slug }));
    setTabState(tab, { base: saved, draft: saved });
    if (strip(before) !== strip(after)) return { msg: "Saved — but other season settings look different now; check /admin/season", tone: "err" as const };
    return `Saved — the ${dropLabel(tab)} drop now has ${saved.length} template${saved.length === 1 ? "" : "s"}`;
  }, [api, cur, tab, setTabState]);

  const save = useCallback(async () => {
    if (!dirty || busy) return;
    setBusy("save");
    try {
      const r =
        kind === "gallery" ? await saveGallery()
        : kind === "wedding" ? await saveWedding()
        : kind === "premium" ? await savePremium()
        : await saveDrop();
      void refreshTemplateMeta();
      if (typeof r === "string") say(r); else say(r.msg, r.tone);
    } catch (e) {
      say(e instanceof Error ? e.message : "Could not save", "err");
    } finally {
      setBusy(null);
    }
  }, [dirty, busy, kind, saveGallery, saveWedding, savePremium, saveDrop, say]);

  const resetWedding = useCallback(async () => {
    if (busy) return;
    if (!window.confirm("Reset /wedding to the automatic list? Your saved list and groups are deleted.")) return;
    setBusy("reset");
    try {
      await api("/admin/template-collections/wedding", { method: "DELETE" });
      setTabState("wedding", { base: autoWedding, draft: autoWedding, auto: true });
      void refreshTemplateMeta();
      say("Back to automatic — /wedding shows every wedding template again");
    } catch (e) {
      say(e instanceof Error ? e.message : "Could not reset", "err");
    } finally {
      setBusy(null);
    }
  }, [busy, api, setTabState, autoWedding, say]);

  // ── Catalogue (right pane) ────────────────────────────────────────────────
  const catalogue = useMemo(() => {
    const extra = Object.keys(DROP_TEMPLATE_FALLBACK).filter((s) => !GALLERY_BY_SLUG.has(s));
    return [...extra, ...GALLERY_LIST.map((t) => t.slug)];
  }, []);
  const q = search.trim().toLowerCase();
  const matches = useMemo(
    () => catalogue.filter((s) => !q || s.includes(q) || info(s).title.toLowerCase().includes(q)),
    [catalogue, q]
  );


  // ── Every place each template is in (drafts, so unsaved edits show) ───────
  const excludedDraft = useMemo(() => new Set((galleryDraft ?? []).map((i) => i.slug)), [galleryDraft]);
  const galleryReady = !!tabs.gallery?.loaded && !tabs.gallery?.error;
  const placements = useMemo(() => {
    const m = new Map<string, Placement[]>();
    const push = (slug: string, p: Placement) => {
      const l = m.get(slug);
      if (l) { if (!l.some((x) => x.id === p.id)) l.push(p); } else m.set(slug, [p]);
    };
    if (galleryReady) {
      for (const t of GALLERY_LIST) if (!hidden.has(t.slug) && !excludedDraft.has(t.slug)) push(t.slug, { id: "gallery", label: "Templates page" });
    }
    for (const i of tabs.wedding?.draft ?? []) push(i.slug, { id: "wedding", label: "Wedding" });
    const prem = tabs.premium?.loaded && !tabs.premium.error ? tabs.premium.draft.map((i) => i.slug) : [];
    for (const slug of prem) push(slug, { id: "premium", label: "Premium" });
    for (const id of dropIds) for (const i of tabs[id]?.draft ?? []) push(i.slug, { id, label: `${dropLabel(id)} drop` });
    return m;
  }, [galleryReady, hidden, excludedDraft, tabs, dropIds]);
  const othersOf = useCallback(
    (slug: string) => (placements.get(slug) ?? []).filter((p) => p.id !== tab),
    [placements, tab]
  );
  /** Live but kept off the Templates page — worth saying on the other tabs. */
  const offGallery = useCallback(
    (slug: string) => galleryReady && !hidden.has(slug) && excludedDraft.has(slug),
    [galleryReady, hidden, excludedDraft]
  );

  // ── Templates page tab: every template, in the gallery's display order ────
  const galleryRows = useMemo(() => pinFirst(rankedAll, publicOrder).map((t) => t.slug), [rankedAll, publicOrder]);
  const galleryCounts = useMemo(() => {
    let listed = 0, unlisted = 0, hid = 0;
    for (const slug of galleryRows) {
      if (hidden.has(slug)) hid++;
      else if (excludedDraft.has(slug)) unlisted++;
      else listed++;
    }
    return { listed, unlisted, hidden: hid };
  }, [galleryRows, hidden, excludedDraft]);
  const galleryShown = useMemo(
    () =>
      galleryRows.filter((slug) => {
        if (q && !slug.includes(q) && !info(slug).title.toLowerCase().includes(q)) return false;
        if (galleryFilter === "hidden") return hidden.has(slug);
        if (galleryFilter === "listed") return !hidden.has(slug) && !excludedDraft.has(slug);
        if (galleryFilter === "unlisted") return !hidden.has(slug) && excludedDraft.has(slug);
        return true;
      }),
    [galleryRows, q, galleryFilter, hidden, excludedDraft]
  );
  const shownLive = galleryShown.filter((s) => !hidden.has(s));
  const liveCount = cur.draft.filter((i) => !hidden.has(i.slug) && !info(i.slug).soon).length;
  const apiHost = useMemo(() => { try { return new URL(API_URL).host; } catch { return API_URL; } }, []);

  if (!allowed) return null;

  const tabOptions = [
    { value: "gallery", label: <>🗂️ Templates page{isDirty(tabs.gallery) && <i className="pl-dot" aria-label="unsaved" />}</> },
    { value: "wedding", label: <>💍 Wedding{isDirty(tabs.wedding) && <i className="pl-dot" aria-label="unsaved" />}</> },
    { value: "premium", label: <>👑 Premium{isDirty(tabs.premium) && <i className="pl-dot" aria-label="unsaved" />}</> },
    ...dropIds.map((id) => ({
      value: id,
      label: <>{dropLabel(id)}{isDirty(tabs[id]) && <i className="pl-dot" aria-label="unsaved" />}</>,
    })),
  ];

  const placeHref = kind === "gallery" ? "/templates" : kind === "wedding" ? "/wedding" : kind === "premium" ? "/templates/premium" : dropPath(tab);
  const status =
    kind === "gallery" ? (cur.draft.length ? "Curated" : "Everything live")
    : kind === "wedding" ? (cur.auto ? "Automatic" : "Curated") : kind === "premium" ? "Tiers" : "Drop list";
  const statusSub =
    kind === "gallery" ? "/templates, its search and Premium room"
    : kind === "wedding"
      ? cur.auto ? "every wedding-type template" : "your saved list"
      : kind === "premium" ? "shared with Premium Studio" : "the season's drop templates";

  return (
    <AdminPage
      title="Wedding & places"
      subtitle="Choose which templates appear in each place — the Templates page, the /wedding hub, the Premium page and the seasonal drops. A template can be on several places at once; keeping it off the Templates page still leaves it openable by link and in its other places. To hide a template everywhere use Templates."
      icon={<Gem size={18} />}
      width={1180}
    >
      <style>{PL_CSS}</style>

      <Hero>
        {kind === "gallery" ? (
          <div className="adk-hero-grid">
            <HeroStat big label="TEMPLATES PAGE" value={status} sub={statusSub} tone="#ffe3a3" />
            <HeroStat label="LISTED" value={galleryCounts.listed} tone="#fdf8ee" sub="live and on /templates" />
            <HeroStat label="NOT LISTED" value={galleryCounts.unlisted} sub="live, open by link" />
            <HeroStat label="HIDDEN" value={galleryCounts.hidden} sub="switched off in Templates" tone="#ffb4a8" />
          </div>
        ) : (
          <div className="adk-hero-grid">
            <HeroStat big label={kind === "drop" ? dropLabel(tab).toUpperCase() : kind.toUpperCase()} value={status} sub={statusSub} tone="#ffe3a3" />
            <HeroStat label="IN THIS PLACE" value={cur.draft.length} tone="#fdf8ee" />
            <HeroStat label="VISIBLE TO VISITORS" value={liveCount} sub="not hidden, not coming soon" />
          </div>
        )}
        <div className="pl-host">
          <Globe size={13} style={{ flex: "none", color: "#ffe3a3" }} />
          <span>Editing <strong style={{ color: "#ffe3a3" }}>{apiHost}</strong> — places apply to this deployment only.</span>
        </div>
      </Hero>

      <div className="pl-tabs">
        <ChipGroup id="pl-tab" value={tab} onChange={(v) => { setTab(v); setMobilePane("in"); }} options={tabOptions} />
      </div>

      <div className="pl-note">
        <Info size={14} style={{ flex: "none", marginTop: 1 }} />
        <span>
          {kind === "gallery" && <>Switch a live template off to keep it <strong>off /templates</strong>, its search and the Premium room. It still opens by link and still shows on /wedding or a drop if it is in those lists — so a template can be on both pages, only /templates, or only /wedding. Hidden templates (greyed) are off everywhere; switch them on in <Link href="/admin/templates">Templates</Link> first.</>}
          {kind === "wedding" && (cur.auto
            ? <>Nothing saved yet: <strong>/wedding</strong> runs on its automatic list (every wedding-type template). This list starts from it — edit and Save to curate.</>
            : <>/wedding shows exactly this list, in this order, under each template&rsquo;s group chip. Reset brings back the automatic list.</>)}
          {kind === "premium" && <>Same switches as Premium Studio. Reordering here moves these templates among the places they already hold in the <Link href="/admin/template-order">gallery order</Link>.</>}
          {kind === "drop" && <>The templates of this drop&rsquo;s page and sale. Only this list is written — mode, percent and the other drops stay exactly as they are (<Link href="/admin/season">Season &amp; offers</Link>). A <em>hidden</em> template in a drop is reachable only through the drop while it is active.</>}
          {kind !== "gallery" && <>{" "}To keep a template off the main gallery use the Templates page tab; to hide it everywhere use <Link href="/admin/templates">Templates</Link>.</>}
        </span>
      </div>

      <div className="pl-actions" data-dirty={dirty ? "1" : "0"}>
        <span className="pl-state">{dirty ? "Unsaved changes" : cur.loaded ? "All changes saved" : "Loading…"}</span>
        {placeHref && (
          <a className="pl-btn" href={placeHref} target="_blank" rel="noreferrer"><Eye size={14} /> View <ExternalLink size={11} /></a>
        )}
        <button className="pl-btn" onClick={discard} disabled={!dirty || !!busy}><Undo2 size={14} /> Discard</button>
        {kind === "wedding" && (
          <button className="pl-btn" onClick={resetWedding} disabled={!!cur.auto || !!busy}>
            {busy === "reset" ? <Loader2 size={14} className="pl-spin" /> : <RotateCcw size={14} />} Reset to automatic
          </button>
        )}
        <button className="pl-btn pl-btn--save" onClick={save} disabled={!dirty || !!busy}>
          {busy === "save" ? <Loader2 size={14} className="pl-spin" /> : <Save size={14} />} Save
        </button>
      </div>

      {kind !== "gallery" && (
        <div className="pl-pane-switch">
          <ChipGroup
            id="pl-pane"
            value={mobilePane}
            onChange={setMobilePane}
            options={[
              { value: "in", label: "In this place", count: cur.draft.length },
              { value: "add", label: "Add templates" },
            ]}
          />
        </div>
      )}

      {!cur.loaded ? (
        <Loading label="Loading…" />
      ) : cur.error ? (
        <p className="pl-error">Could not load this place: {cur.error}</p>
      ) : kind === "gallery" ? (
        <section className="pl-col pl-gal" aria-label="Templates page listing">
          <div className="pl-gal-tools">
            <SearchBox value={search} onChange={setSearch} placeholder="Search every template" style={{ flex: "1 1 220px" }} />
            <ChipGroup
              id="pl-gal-filter"
              value={galleryFilter}
              onChange={setGalleryFilter}
              options={[
                { value: "all", label: "All", count: galleryRows.length },
                { value: "listed", label: "Listed", count: galleryCounts.listed, tone: A.ok },
                { value: "unlisted", label: "Not listed", count: galleryCounts.unlisted, tone: A.warn },
                { value: "hidden", label: "Hidden", count: galleryCounts.hidden, tone: A.muted },
              ]}
            />
          </div>
          <div className="pl-gal-bulk">
            <span>{galleryShown.length} shown · {shownLive.length} live</span>
            <button className="pl-btn" onClick={() => setListed(shownLive, true)} disabled={!shownLive.some((s) => excludedDraft.has(s))}>
              <Eye size={14} /> List all shown
            </button>
            <button className="pl-btn" onClick={() => setListed(shownLive, false)} disabled={!shownLive.some((s) => !excludedDraft.has(s))}>
              <EyeOff size={14} /> Unlist all shown
            </button>
          </div>
          <ul className="pl-cat pl-gal-list">
            {galleryShown.map((slug) => {
              const t = info(slug);
              const isHidden = hidden.has(slug);
              const listed = !isHidden && !excludedDraft.has(slug);
              const changed = (tabs.gallery?.base ?? []).some((i) => i.slug === slug) !== excludedDraft.has(slug);
              return (
                <li key={slug} className="pl-cat-row pl-gal-row" data-hidden={isHidden ? "1" : "0"} data-listed={listed ? "1" : "0"}>
                  <Thumb img={t.img} emoji={t.emoji} />
                  <span className="pl-name">
                    <strong>{t.title}</strong>
                    <small>/{slug}</small>
                    <span className="pl-tags">
                      {isHidden ? (
                        <Link href="/admin/templates" className="pl-hidlink" title="Hidden everywhere — switch it on in Templates">
                          <Tag tone={A.muted}>Hidden — manage in Templates ↗</Tag>
                        </Link>
                      ) : listed ? (
                        <Tag tone={A.ok}>Listed</Tag>
                      ) : (
                        <Tag tone={A.warn}>Not listed · open by link</Tag>
                      )}
                      {changed && <Tag tone={A.goldDeep}>unsaved</Tag>}
                      {t.soon && <Tag tone={A.warn}>Coming soon</Tag>}
                      <PlaceTags places={othersOf(slug)} />
                    </span>
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={listed}
                    aria-label={`Listed on Templates page: ${t.title}`}
                    title={isHidden ? "Hidden in Templates — not listed anywhere" : listed ? "Listed on Templates page — click to unlist" : "Not listed — click to list on Templates page"}
                    className="pl-switch"
                    data-on={listed ? "1" : "0"}
                    disabled={isHidden}
                    onClick={() => setListed([slug], !listed)}
                  >
                    <span className="pl-knob">{listed ? <Eye size={11} /> : <EyeOff size={11} />}</span>
                  </button>
                </li>
              );
            })}
            {galleryShown.length === 0 && <li className="pl-empty">Nothing matches.</li>}
          </ul>
        </section>
      ) : (
        <div className="pl-cols" data-pane={mobilePane}>
          <section className="pl-col pl-col--in" aria-label="In this place">
            <h3 className="pl-h">In this place <span>{cur.draft.length}</span></h3>
            {cur.draft.length === 0 ? (
              <p className="pl-empty">Nothing here yet — add templates from the list.</p>
            ) : (
              <Reorder.Group axis="y" values={cur.draft.map((i) => i.slug)} onReorder={reorder} className="pl-list" as="ol">
                {cur.draft.map((it, i) => (
                  <Row
                    key={it.slug}
                    item={it}
                    pos={i + 1}
                    first={i === 0}
                    last={i === cur.draft.length - 1}
                    hidden={hidden.has(it.slug)}
                    inDrop={kind === "drop"}
                    offGallery={offGallery(it.slug)}
                    places={othersOf(it.slug)}
                    groups={kind === "wedding"}
                    onUp={() => move(it.slug, i - 1)}
                    onDown={() => move(it.slug, i + 1)}
                    onRemove={() => remove(it.slug)}
                    onGroup={(g) => setGroup(it.slug, g)}
                  />
                ))}
              </Reorder.Group>
            )}
          </section>

          <section className="pl-col pl-col--add" aria-label="Add templates">
            <h3 className="pl-h">Add templates <span>{catalogue.length}</span></h3>
            <SearchBox value={search} onChange={setSearch} placeholder="Search every template" style={{ marginBottom: 8 }} />
            <ul className="pl-cat">
              {matches.map((slug) => {
                const t = info(slug);
                const on = inPlace.has(slug);
                return (
                  <li key={slug} className="pl-cat-row" data-on={on ? "1" : "0"}>
                    <Thumb img={t.img} emoji={t.emoji} />
                    <span className="pl-name">
                      <strong>{t.title}</strong>
                      <small>/{slug}</small>
                      <span className="pl-tags">
                        {hidden.has(slug) && <HiddenTag inDrop={kind === "drop"} />}
                        {offGallery(slug) && <Tag tone={A.warn}>Not on Templates page</Tag>}
                        {t.soon && <Tag tone={A.warn}>Coming soon</Tag>}
                        <PlaceTags places={othersOf(slug)} />
                      </span>
                    </span>
                    <button className="pl-add" onClick={() => (on ? remove(slug) : add(slug))} aria-label={on ? `Remove ${t.title}` : `Add ${t.title}`}>
                      {on ? <><X size={13} /> Added</> : <><Plus size={13} /> Add</>}
                    </button>
                  </li>
                );
              })}
              {matches.length === 0 && <li className="pl-empty">Nothing matches that search.</li>}
            </ul>
          </section>
        </div>
      )}

      {toast && (
        <div className="pl-toast" data-tone={toast.tone} role={toast.tone === "err" ? "alert" : "status"}>{toast.msg}</div>
      )}
    </AdminPage>
  );
}

function Thumb({ img, emoji }: { img: string | null; emoji: string }) {
  return (
    <span className="pl-thumb">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {img ? <img src={img} alt="" loading="lazy" /> : <span>{emoji}</span>}
    </span>
  );
}

/** The OTHER places a template is in, as small badges. */
function PlaceTags({ places }: { places: Placement[] }) {
  return (
    <>
      {places.map((p) => (
        <Tag key={p.id} tone={p.id === "premium" ? A.goldDeep : p.id === "gallery" ? A.ok : p.id === "wedding" ? A.maroon2 : A.info}>
          {p.id === "gallery" ? "🗂️ " : p.id === "wedding" ? "💍 " : p.id === "premium" ? "👑 " : "🎁 "}{p.label}
        </Tag>
      ))}
    </>
  );
}

/** Hidden in /admin/templates. In a drop that still means reachable — through the drop, while it runs. */
function HiddenTag({ inDrop }: { inDrop: boolean }) {
  return inDrop ? (
    <span title="Hidden in Templates: not in the gallery, but its builder opens through this drop while the drop is active">
      <Tag tone={A.muted}>Hidden — reachable only through this drop while it is active</Tag>
    </span>
  ) : (
    <Tag tone={A.muted}>Hidden</Tag>
  );
}

function Row({
  item, pos, first, last, hidden, inDrop, offGallery, places, groups, onUp, onDown, onRemove, onGroup,
}: {
  item: Item; pos: number; first: boolean; last: boolean; hidden: boolean; inDrop: boolean; offGallery: boolean; places: Placement[]; groups: boolean;
  onUp: () => void; onDown: () => void; onRemove: () => void; onGroup: (g: Group) => void;
}) {
  const controls = useDragControls();
  const t = info(item.slug);
  return (
    <Reorder.Item value={item.slug} dragListener={false} dragControls={controls} className="pl-row" data-hidden={hidden ? "1" : "0"} as="li">
      <button className="pl-grip" aria-label={`Drag ${t.title}`} onPointerDown={(e) => controls.start(e)}>
        <GripVertical size={16} />
      </button>
      <span className="pl-pos">{pos}</span>
      <Thumb img={t.img} emoji={t.emoji} />
      <span className="pl-name">
        <strong>{t.title}</strong>
        <small>/{item.slug}</small>
        <span className="pl-tags">
          {hidden && <HiddenTag inDrop={inDrop} />}
          {offGallery && <Tag tone={A.warn}>Not on Templates page</Tag>}
          {t.soon && <Tag tone={A.warn}>Coming soon</Tag>}
          {!t.known && <Tag tone={A.danger}>Not in this build</Tag>}
          <PlaceTags places={places} />
        </span>
      </span>
      {groups && (
        <select
          className="pl-group"
          value={item.group ?? "indian"}
          onChange={(e) => onGroup(e.target.value as Group)}
          aria-label={`Group for ${t.title}`}
        >
          {GROUPS.map((g) => <option key={g.id} value={g.id}>{g.emoji} {g.label}</option>)}
        </select>
      )}
      <span className="pl-moves">
        <button onClick={onUp} disabled={first} aria-label="Move up" title="Move up"><ArrowUp size={15} /></button>
        <button onClick={onDown} disabled={last} aria-label="Move down" title="Move down"><ArrowDown size={15} /></button>
        <button onClick={onRemove} aria-label={`Remove ${t.title}`} title="Remove" className="pl-x"><X size={15} /></button>
      </span>
    </Reorder.Item>
  );
}

const PL_CSS = `
.pl-host { display: flex; align-items: center; gap: 8px; margin-top: 14px; font-size: 12px; color: rgba(253,248,238,.78); }
.pl-tabs { margin: 18px 0 10px; overflow-x: auto; scrollbar-width: none; }
.pl-tabs::-webkit-scrollbar { display: none; }
.pl-tabs .adk-chips { flex-wrap: nowrap; }
.pl-dot { display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: ${A.warn}; margin-left: 2px; }
.pl-note { display: flex; gap: 8px; align-items: flex-start; padding: 10px 12px; margin-bottom: 10px; border-radius: 12px;
  background: rgba(201,168,76,.1); border: 1px solid rgba(201,168,76,.28); color: ${A.soft}; font: 500 12.5px/1.45 Inter, system-ui, sans-serif; }
.pl-note a { color: ${A.maroon2}; font-weight: 700; text-decoration: underline; }
.pl-note strong { color: ${A.ink}; }
.pl-actions { position: sticky; top: calc(var(--adm-top, 0px) + 6px); z-index: 5; display: flex; flex-wrap: wrap; gap: 8px; align-items: center; justify-content: flex-end;
  padding: 10px 12px; margin-bottom: 12px; border-radius: 14px; background: rgba(255,253,251,.94); border: 1px solid ${A.edge};
  box-shadow: 0 10px 30px -22px rgba(61,12,17,.5); backdrop-filter: blur(6px); }
.pl-actions[data-dirty="1"] { border-color: rgba(201,168,76,.55); }
.pl-state { margin-right: auto; font: 600 12.5px/1.2 Inter, system-ui, sans-serif; color: ${A.soft}; }
.pl-actions[data-dirty="1"] .pl-state { color: ${A.goldDeep}; }
.pl-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 12px; border-radius: 10px; cursor: pointer; text-decoration: none;
  font: 600 12.5px/1 Inter, system-ui, sans-serif; color: ${A.ink}; background: #fff; border: 1px solid ${A.edge}; white-space: nowrap; }
.pl-btn:disabled { opacity: .45; cursor: default; }
.pl-btn--save { background: ${A.maroon}; color: #fdf8ee; border-color: transparent; }
.pl-spin { animation: pl-spin 1s linear infinite; }
@keyframes pl-spin { to { transform: rotate(360deg); } }
.pl-pane-switch { display: none; margin-bottom: 10px; }
.pl-cols { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr); gap: 16px; align-items: start; }
.pl-col { min-width: 0; padding: 12px; border-radius: 16px; background: ${A.card}; border: 1px solid ${A.edge}; }
.pl-col--add { position: sticky; top: calc(var(--adm-top, 0px) + 74px); }
.pl-h { display: flex; align-items: center; gap: 8px; margin: 2px 2px 10px; font: 700 13px/1 Inter, system-ui, sans-serif; color: ${A.ink};
  letter-spacing: .02em; }
.pl-h span { font-weight: 600; color: ${A.muted}; }
.pl-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.pl-row { display: flex; align-items: center; gap: 8px; padding: 7px 8px; border-radius: 12px; background: ${A.paper};
  border: 1px solid ${A.edge}; touch-action: pan-y; }
.pl-row[data-hidden="1"] { opacity: .66; }
.pl-grip { flex: none; display: grid; place-items: center; width: 28px; height: 38px; border-radius: 8px; border: 0; background: rgba(61,12,17,.05);
  color: ${A.soft}; cursor: grab; touch-action: none; }
.pl-grip:active { cursor: grabbing; }
.pl-pos { flex: none; width: 22px; text-align: right; font: 700 12.5px/1 Inter, system-ui, sans-serif; color: ${A.goldDeep}; font-variant-numeric: tabular-nums; }
.pl-thumb { flex: none; width: 38px; height: 50px; border-radius: 8px; overflow: hidden; display: grid; place-items: center;
  background: linear-gradient(135deg,#5a1520,#3d0c11); color: #fdf8ee; }
.pl-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.pl-name { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.pl-name strong { font: 600 13px/1.25 Inter, system-ui, sans-serif; color: ${A.ink}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pl-name small { font: 500 11px/1 Inter, system-ui, sans-serif; color: ${A.muted}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pl-tags { display: flex; flex-wrap: wrap; gap: 4px; }
.pl-tags:empty { display: none; }
.pl-group { flex: none; max-width: 150px; height: 32px; padding: 0 6px; border-radius: 9px; border: 1px solid ${A.edge}; background: #fff;
  font: 600 12px/1 Inter, system-ui, sans-serif; color: ${A.ink}; }
.pl-moves { flex: none; display: flex; gap: 2px; }
.pl-moves button { display: grid; place-items: center; width: 30px; height: 30px; border-radius: 8px; border: 1px solid ${A.edge}; background: #fff;
  color: ${A.ink}; cursor: pointer; }
.pl-moves button:disabled { opacity: .3; cursor: default; }
.pl-moves .pl-x { color: ${A.danger}; }
.pl-cat { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 4px; max-height: calc(100vh - var(--adm-top, 0px) - 190px); overflow-y: auto; }
.pl-cat-row { display: flex; align-items: center; gap: 8px; padding: 6px; border-radius: 10px; }
.pl-cat-row:hover { background: rgba(201,168,76,.08); }
.pl-cat-row[data-on="1"] { background: rgba(30,122,75,.06); }
.pl-add { flex: none; display: inline-flex; align-items: center; gap: 4px; padding: 7px 10px; border-radius: 9px; cursor: pointer;
  font: 700 12px/1 Inter, system-ui, sans-serif; background: ${A.maroon}; color: #fdf8ee; border: 1px solid transparent; }
.pl-cat-row[data-on="1"] .pl-add { background: #fff; color: ${A.ok}; border-color: rgba(30,122,75,.35); }
.pl-empty { padding: 22px; text-align: center; color: ${A.muted}; font-size: 13px; }
.pl-error { padding: 16px; border-radius: 12px; background: rgba(179,38,30,.08); color: ${A.danger}; font: 600 13px/1.4 Inter, system-ui, sans-serif; }
.pl-toast { position: fixed; left: 50%; bottom: 88px; transform: translateX(-50%); z-index: 60; max-width: calc(100vw - 32px);
  padding: 10px 16px; border-radius: 12px; background: ${A.maroon}; color: #fdf8ee; font: 600 13px/1.3 Inter, system-ui, sans-serif;
  box-shadow: 0 14px 34px -14px rgba(0,0,0,.6); }
.pl-toast[data-tone="ok"] { background: ${A.ok}; }
.pl-toast[data-tone="err"] { background: ${A.danger}; }
.pl-gal { padding: 12px; }
.pl-gal-tools { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 8px; }
.pl-gal-tools .adk-chips { max-width: 100%; }
.pl-gal-bulk { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; justify-content: flex-end; margin-bottom: 8px; }
.pl-gal-bulk > span { margin-right: auto; font: 600 12px/1.2 Inter, system-ui, sans-serif; color: ${A.muted}; }
.pl-gal-list { max-height: none; overflow: visible; }
.pl-gal-row { border: 1px solid transparent; }
.pl-gal-row[data-listed="0"][data-hidden="0"] { background: rgba(183,121,31,.06); border-color: rgba(183,121,31,.18); }
.pl-gal-row[data-hidden="1"] { opacity: .55; filter: grayscale(.6); }
.pl-hidlink { text-decoration: none; }
.pl-switch { flex: none; position: relative; width: 50px; height: 28px; padding: 3px; border-radius: 99px; cursor: pointer; display: flex;
  justify-content: flex-start; border: 1px solid rgba(183,121,31,.35); background: rgba(183,121,31,.12); transition: background .2s, border-color .2s; }
.pl-switch[data-on="1"] { justify-content: flex-end; background: ${A.ok}; border-color: ${A.ok}; }
.pl-switch:disabled { opacity: .5; cursor: not-allowed; background: rgba(61,12,17,.08); border-color: ${A.edge}; }
.pl-knob { width: 20px; height: 20px; border-radius: 50%; background: #fff; display: grid; place-items: center; color: ${A.warn};
  box-shadow: 0 2px 6px rgba(61,12,17,.28); }
.pl-switch[data-on="1"] .pl-knob { color: ${A.ok}; }
@media (max-width: 860px) {
  .pl-pane-switch { display: block; }
  .pl-cols { grid-template-columns: minmax(0, 1fr); }
  .pl-cols[data-pane="in"] .pl-col--add, .pl-cols[data-pane="add"] .pl-col--in { display: none; }
  .pl-col--add { position: static; }
  .pl-cat { max-height: none; }
}
@media (max-width: 640px) {
  .pl-col { padding: 8px; }
  .pl-row { flex-wrap: wrap; gap: 6px; padding: 6px; }
  .pl-pos { width: 18px; font-size: 12px; }
  .pl-thumb { width: 32px; height: 42px; }
  .pl-name { flex-basis: calc(100% - 100px); }
  .pl-group { order: 5; flex: 1 1 auto; max-width: none; margin-left: 36px; }
  .pl-moves { order: 6; }
  .pl-moves button { width: 30px; height: 30px; }
  .pl-actions { justify-content: stretch; }
  .pl-state { flex-basis: 100%; }
  .pl-btn { flex: 1 1 0; justify-content: center; padding: 9px 6px; }
}
`;
