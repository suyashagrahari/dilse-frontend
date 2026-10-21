"use client";

// ─── Super admin: Template order ─────────────────────────────────────────────
//
// The order templates appear in on /templates and /templates/premium. Drag a
// row by its handle (or use the arrows) and press Save: one PUT replaces the
// whole list, and every visitor sees it within about a minute (the public
// /template-meta read is cached for 60s).
//
// What is stored is the full list as arranged here (`TemplateOrder` on the
// server). The gallery puts those slugs first, in this order, and anything not
// in it — a template launched after the last save — after them by "most
// created". "Reset to default" deletes the row and the code's PINNED_FIRST
// order applies again.
//
// Filtering (room chips, search) never loses positions: a move inside a
// filtered view reorders those templates among the slots they already hold.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Reorder, useDragControls } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { API_URL } from "@/lib/config";
import { isSuperAdmin } from "@/lib/roles";
import { ULTRA_PREMIUM_SLUGS } from "@/data/template-registry";
import { GALLERY_LIST, GALLERY_BY_SLUG, pinFirst, isComingSoon } from "@/lib/galleryRules";
import { isPremiumSlug, refreshTemplateMeta, useTemplateMeta } from "@/lib/templateMeta";
import { useHiddenTemplates } from "@/hooks/useHiddenTemplates";
import { coverSmall, coverSrcSet } from "@/lib/templateMedia";
import { ArrowDown, ArrowUp, ArrowUpToLine, GripVertical, ListOrdered, Loader2, RotateCcw, Save, Undo2, Globe } from "lucide-react";
import { A, AdminPage, Hero, HeroStat, ChipGroup, SearchBox, Loading, Tag } from "../adminKit";

type Room = "all" | "main" | "premium";
type Saved = { slugs: string[]; updatedByEmail: string; updatedAt: string | null };

export default function TemplateOrderPage() {
  const router = useRouter();
  const { user, accessToken, isLoading } = useAppSelector((s) => s.auth);
  const { tiers, ranking } = useTemplateMeta();
  const hidden = useHiddenTemplates();

  const [allowed, setAllowed] = useState(false);
  const [saved, setSaved] = useState<Saved | null>(null);
  const [order, setOrder] = useState<string[] | null>(null);
  const [busy, setBusy] = useState<"save" | "reset" | null>(null);
  const [room, setRoom] = useState<Room>("all");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<string | null>(null);
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

  const say = useCallback((msg: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 3600);
  }, []);

  // What the gallery shows with no saved order: PINNED_FIRST, then most created.
  const defaultOrder = useMemo(() => {
    const created = new Map(ranking.map((r) => [r.slug, r.created]));
    const idx = new Map(GALLERY_LIST.map((t, i) => [t.slug, i]));
    const ranked = [...GALLERY_LIST].sort(
      (a, b) => (created.get(b.slug) ?? 0) - (created.get(a.slug) ?? 0) || idx.get(a.slug)! - idx.get(b.slug)!
    );
    return pinFirst(ranked).map((t) => t.slug);
  }, [ranking]);

  // The saved list first (dropping slugs that no longer exist), then everything
  // else in default order — exactly what the gallery does with it.
  const effective = useCallback(
    (slugs: string[]) => {
      const known = slugs.filter((s) => GALLERY_BY_SLUG.has(s));
      const rest = defaultOrder.filter((s) => !known.includes(s));
      return [...known, ...rest];
    },
    [defaultOrder]
  );

  useEffect(() => {
    if (!allowed || !accessToken) return;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/admin/template-order`, { headers: hdr() });
        const json = await res.json();
        if (!json?.success) throw new Error(json?.error || "Could not load the order");
        setSaved({ slugs: json.data.slugs ?? [], updatedByEmail: json.data.updatedByEmail ?? "", updatedAt: json.data.updatedAt ?? null });
      } catch (e) {
        say(e instanceof Error ? e.message : "Could not load the order");
        setSaved({ slugs: [], updatedByEmail: "", updatedAt: null });
      }
    })();
  }, [allowed, accessToken, hdr, say]);

  // Until the admin touches anything, keep following the live default (the
  // ranking arrives in its own fetch and can land after the saved order).
  const touched = useRef(false);
  useEffect(() => {
    if (saved && !touched.current) setOrder(effective(saved.slugs));
  }, [saved, effective]);

  const baseline = useMemo(() => (saved ? effective(saved.slugs) : []), [saved, effective]);
  const dirty = !!order && order.join() !== baseline.join();
  const custom = !!saved && saved.slugs.length > 0;

  const inRoom = useCallback(
    (slug: string, r: Room) => {
      if (r === "all") return true;
      const premium = isPremiumSlug(slug, tiers);
      const both = ULTRA_PREMIUM_SLUGS.has(slug) && !(slug in tiers);
      return both || (r === "premium") === premium;
    },
    [tiers]
  );

  const q = search.trim().toLowerCase();
  const shown = useMemo(
    () =>
      (order ?? []).filter((s) => {
        if (!inRoom(s, room)) return false;
        if (!q) return true;
        const t = GALLERY_BY_SLUG.get(s);
        return s.includes(q) || (t?.title ?? "").toLowerCase().includes(q);
      }),
    [order, room, q, inRoom]
  );

  /** Put `next` (a reordering of `shown`) back into the slots `shown` holds. */
  const applyShown = useCallback(
    (next: string[]) => {
      setOrder((cur) => {
        if (!cur) return cur;
        touched.current = true;
        const set = new Set(next);
        const out = [...cur];
        let k = 0;
        for (let i = 0; i < out.length; i++) if (set.has(out[i])) out[i] = next[k++];
        return out;
      });
    },
    []
  );

  const moveTo = useCallback(
    (slug: string, to: number) => {
      const from = shown.indexOf(slug);
      if (from < 0 || to < 0 || to >= shown.length || to === from) return;
      const next = [...shown];
      next.splice(from, 1);
      next.splice(to, 0, slug);
      applyShown(next);
    },
    [shown, applyShown]
  );

  const save = useCallback(async () => {
    if (!order || busy) return;
    setBusy("save");
    try {
      const res = await fetch(`${API_URL}/admin/template-order`, { method: "PUT", headers: hdr(), body: JSON.stringify({ slugs: order }) });
      const json = await res.json();
      if (!json?.success) throw new Error(json?.error || "Could not save");
      setSaved({ slugs: json.data.slugs, updatedByEmail: json.data.updatedByEmail ?? "", updatedAt: json.data.updatedAt ?? null });
      touched.current = false;
      void refreshTemplateMeta();
      say("Saved — the gallery shows this order within about a minute");
    } catch (e) {
      say(e instanceof Error ? e.message : "Could not save");
    } finally {
      setBusy(null);
    }
  }, [order, busy, hdr, say]);

  const reset = useCallback(async () => {
    if (busy) return;
    setBusy("reset");
    try {
      const res = await fetch(`${API_URL}/admin/template-order`, { method: "DELETE", headers: hdr() });
      const json = await res.json();
      if (!json?.success) throw new Error(json?.error || "Could not reset");
      touched.current = false;
      setSaved({ slugs: [], updatedByEmail: "", updatedAt: null });
      void refreshTemplateMeta();
      say("Back to the default order");
    } catch (e) {
      say(e instanceof Error ? e.message : "Could not reset");
    } finally {
      setBusy(null);
    }
  }, [busy, hdr, say]);

  const discard = useCallback(() => {
    touched.current = false;
    setOrder(baseline);
  }, [baseline]);

  const apiHost = useMemo(() => { try { return new URL(API_URL).host; } catch { return API_URL; } }, []);
  const liveCount = (order ?? []).filter((s) => !hidden.has(s)).length;

  if (!allowed) return null;

  return (
    <AdminPage
      title="Template order"
      subtitle="Choose the order templates appear in the gallery. Drag a row by its handle or use the arrows, then press Save — everyone sees the new order within about a minute. Templates added later appear after your list until you place them."
      icon={<ListOrdered size={18} />}
      width={980}
    >
      <style>{TO_CSS}</style>

      <Hero>
        <div className="adk-hero-grid">
          <HeroStat big label="ORDER" value={custom ? "Custom" : "Default"} sub={custom ? `saved by ${saved?.updatedByEmail || "a super admin"}` : "pinned first, then most created"} tone="#ffe3a3" />
          <HeroStat label="LIVE IN GALLERY" value={liveCount} tone="#fdf8ee" />
          <HeroStat label="HIDDEN" value={(order ?? []).length - liveCount} sub="keep their place for release" />
        </div>
        <div className="to-host">
          <Globe size={13} style={{ flex: "none", color: "#ffe3a3" }} />
          <span>Editing <strong style={{ color: "#ffe3a3" }}>{apiHost}</strong> — the order applies to this deployment only.</span>
        </div>
      </Hero>

      <div className="to-bar">
        <SearchBox value={search} onChange={setSearch} placeholder="Find a template" style={{ flex: "1 1 220px" }} />
        <ChipGroup
          id="to-room"
          value={room}
          onChange={setRoom}
          options={[
            { value: "all", label: "All" },
            { value: "main", label: "Main gallery" },
            { value: "premium", label: "Premium page" },
          ]}
        />
      </div>

      <div className="to-actions" data-dirty={dirty ? "1" : "0"}>
        <span className="to-state">{dirty ? "Unsaved changes" : custom ? "Custom order is live" : "Using the default order"}</span>
        <button className="to-btn" onClick={discard} disabled={!dirty || !!busy}><Undo2 size={14} /> Discard</button>
        <button className="to-btn" onClick={reset} disabled={!custom || !!busy}>
          {busy === "reset" ? <Loader2 size={14} className="to-spin" /> : <RotateCcw size={14} />} Reset to default
        </button>
        <button className="to-btn to-btn--save" onClick={save} disabled={!dirty || !!busy}>
          {busy === "save" ? <Loader2 size={14} className="to-spin" /> : <Save size={14} />} Save order
        </button>
      </div>

      {!order ? (
        <Loading label="Loading the gallery order…" />
      ) : (
        <Reorder.Group axis="y" values={shown} onReorder={applyShown} className="to-list" as="ol">
          {shown.map((slug, i) => (
            <Row
              key={slug}
              slug={slug}
              pos={order.indexOf(slug) + 1}
              first={i === 0}
              last={i === shown.length - 1}
              hidden={hidden.has(slug)}
              premium={isPremiumSlug(slug, tiers)}
              onTop={() => moveTo(slug, 0)}
              onUp={() => moveTo(slug, i - 1)}
              onDown={() => moveTo(slug, i + 1)}
            />
          ))}
          {shown.length === 0 && <p className="to-empty">Nothing matches{q ? " that search" : ""}.</p>}
        </Reorder.Group>
      )}

      {toast && <div className="to-toast" role="status">{toast}</div>}
    </AdminPage>
  );
}

function Row({
  slug, pos, first, last, hidden, premium, onTop, onUp, onDown,
}: {
  slug: string; pos: number; first: boolean; last: boolean; hidden: boolean; premium: boolean;
  onTop: () => void; onUp: () => void; onDown: () => void;
}) {
  const controls = useDragControls();
  const t = GALLERY_BY_SLUG.get(slug);
  const img = t?.coverImage ? (coverSrcSet(t.coverImage) ? coverSmall(t.coverImage) : t.coverImage) : null;
  return (
    <Reorder.Item value={slug} dragListener={false} dragControls={controls} className="to-row" data-hidden={hidden ? "1" : "0"} as="li">
      <button className="to-grip" aria-label={`Drag ${t?.title ?? slug}`} onPointerDown={(e) => controls.start(e)}>
        <GripVertical size={16} />
      </button>
      <span className="to-pos">{pos}</span>
      <span className="to-thumb">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {img ? <img src={img} alt="" loading="lazy" /> : <span>{t?.emoji ?? "✦"}</span>}
      </span>
      <span className="to-name">
        <strong>{t?.title ?? slug}</strong>
        <small>/{slug}</small>
      </span>
      <span className="to-tags">
        {hidden && <Tag tone={A.muted}>Hidden</Tag>}
        {t && isComingSoon(t) && <Tag tone={A.warn}>Coming soon</Tag>}
        {ULTRA_PREMIUM_SLUGS.has(slug) ? <Tag tone={A.goldDeep}>✦ Both</Tag> : premium ? <Tag tone={A.goldDeep}>Premium</Tag> : null}
      </span>
      <span className="to-moves">
        <button onClick={onTop} disabled={first} aria-label="Move to top" title="Move to top"><ArrowUpToLine size={15} /></button>
        <button onClick={onUp} disabled={first} aria-label="Move up" title="Move up"><ArrowUp size={15} /></button>
        <button onClick={onDown} disabled={last} aria-label="Move down" title="Move down"><ArrowDown size={15} /></button>
      </span>
    </Reorder.Item>
  );
}

const TO_CSS = `
.to-host { display: flex; align-items: center; gap: 8px; margin-top: 14px; font-size: 12px; color: rgba(253,248,238,.78); }
.to-bar { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin: 18px 0 10px; }
.to-actions { position: sticky; top: 8px; z-index: 5; display: flex; flex-wrap: wrap; gap: 8px; align-items: center; justify-content: flex-end;
  padding: 10px 12px; margin-bottom: 12px; border-radius: 14px; background: rgba(255,253,251,.94); border: 1px solid ${A.edge};
  box-shadow: 0 10px 30px -22px rgba(61,12,17,.5); backdrop-filter: blur(6px); }
.to-actions[data-dirty="1"] { border-color: rgba(201,168,76,.55); }
.to-state { margin-right: auto; font: 600 12.5px/1.2 Inter, system-ui, sans-serif; color: ${A.soft}; }
.to-actions[data-dirty="1"] .to-state { color: ${A.goldDeep}; }
.to-btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 12px; border-radius: 10px; cursor: pointer;
  font: 600 12.5px/1 Inter, system-ui, sans-serif; color: ${A.ink}; background: #fff; border: 1px solid ${A.edge}; }
.to-btn:disabled { opacity: .45; cursor: default; }
.to-btn--save { background: ${A.maroon}; color: #fdf8ee; border-color: transparent; }
.to-spin { animation: to-spin 1s linear infinite; }
@keyframes to-spin { to { transform: rotate(360deg); } }
.to-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.to-row { display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 12px; background: ${A.paper};
  border: 1px solid ${A.edge}; touch-action: pan-y; }
.to-row[data-hidden="1"] { opacity: .62; }
.to-grip { flex: none; display: grid; place-items: center; width: 30px; height: 36px; border-radius: 8px; border: 0; background: rgba(61,12,17,.05);
  color: ${A.soft}; cursor: grab; touch-action: none; }
.to-grip:active { cursor: grabbing; }
.to-pos { flex: none; width: 28px; text-align: right; font: 700 13px/1 Inter, system-ui, sans-serif; color: ${A.goldDeep}; font-variant-numeric: tabular-nums; }
.to-thumb { flex: none; width: 40px; height: 52px; border-radius: 8px; overflow: hidden; display: grid; place-items: center;
  background: linear-gradient(135deg,#5a1520,#3d0c11); color: #fdf8ee; }
.to-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.to-name { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.to-name strong { font: 600 13.5px/1.25 Inter, system-ui, sans-serif; color: ${A.ink}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.to-name small { font: 500 11px/1 Inter, system-ui, sans-serif; color: ${A.muted}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.to-tags { flex: none; display: flex; gap: 4px; }
.to-moves { flex: none; display: flex; gap: 2px; }
.to-moves button { display: grid; place-items: center; width: 30px; height: 30px; border-radius: 8px; border: 1px solid ${A.edge}; background: #fff;
  color: ${A.ink}; cursor: pointer; }
.to-moves button:disabled { opacity: .3; cursor: default; }
.to-empty { padding: 24px; text-align: center; color: ${A.muted}; font-size: 13px; }
.to-toast { position: fixed; left: 50%; bottom: 88px; transform: translateX(-50%); z-index: 60; max-width: calc(100vw - 32px);
  padding: 10px 16px; border-radius: 12px; background: ${A.maroon}; color: #fdf8ee; font: 600 13px/1.3 Inter, system-ui, sans-serif;
  box-shadow: 0 14px 34px -14px rgba(0,0,0,.6); }
@media (max-width: 640px) {
  .to-tags { display: none; }
  .to-row { gap: 8px; padding: 6px 8px; }
  .to-pos { width: 22px; font-size: 12px; }
  .to-thumb { width: 34px; height: 44px; }
  .to-moves button { width: 28px; height: 30px; }
  .to-actions { justify-content: stretch; }
  .to-state { flex-basis: 100%; }
  .to-btn { flex: 1 1 0; justify-content: center; padding: 9px 8px; }
}
`;
