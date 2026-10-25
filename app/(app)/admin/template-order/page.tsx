"use client";

// ─── Super admin: Template order ─────────────────────────────────────────────
//
// The order templates appear in on /templates and /templates/premium. Drag a
// row by its handle (or tap its number to type a position) and press Save: one PUT replaces the
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
// The numbers on the rows (and in the "Move" dialog) count inside the view the
// admin is looking at, so "#2 on the Premium page" means the second premium
// card, wherever that sits in the global list.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MotionConfig, Reorder, useDragControls } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { API_URL } from "@/lib/config";
import { isSuperAdmin } from "@/lib/roles";
import { ULTRA_PREMIUM_SLUGS } from "@/data/template-registry";
import { GALLERY_LIST, GALLERY_BY_SLUG, pinFirst, isComingSoon } from "@/lib/galleryRules";
import { isPremiumSlug, refreshTemplateMeta, useTemplateMeta } from "@/lib/templateMeta";
import { useHiddenTemplates } from "@/hooks/useHiddenTemplates";
import { coverSmall, coverSrcSet } from "@/lib/templateMedia";
import { ChevronsUpDown, GripVertical, ListOrdered, Loader2, RotateCcw, Save, Undo2, Globe } from "lucide-react";
import { A, AdminPage, Hero, HeroStat, ChipGroup, SearchBox, Loading, Tag } from "../adminKit";
import PositionDialog from "./PositionDialog";

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
  // The row whose "Move" dialog is open, and the row that just moved (flashed).
  const [editing, setEditing] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      // Bring the row into view at its new spot and let it glow for a moment.
      if (flashTimer.current) clearTimeout(flashTimer.current);
      setFlash(slug);
      flashTimer.current = setTimeout(() => setFlash(null), 2200);
      // After the dialog has unmounted and released its scroll lock.
      setTimeout(() => {
        const el = document.querySelector<HTMLElement>(`.to-row[data-slug="${CSS.escape(slug)}"]`);
        const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (!el) return;
        // Measure the row's laid-out spot, not its on-screen box: the slide
        // animation is a transform, so getBoundingClientRect (and with it
        // scrollIntoView) would aim at where the row still appears to be.
        let y = 0;
        for (let n: HTMLElement | null = el; n; n = n.offsetParent as HTMLElement | null) y += n.offsetTop;
        const top = Math.max(0, y - (window.innerHeight - el.offsetHeight) / 2);
        window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
      }, 60);
    },
    [shown, applyShown]
  );

  useEffect(() => () => { if (flashTimer.current) clearTimeout(flashTimer.current); }, []);

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
  const filtered = room !== "all" || !!q;
  const scope = q
    ? "in this search"
    : room === "main" ? "in the main gallery" : room === "premium" ? "on the Premium page" : "";

  if (!allowed) return null;

  return (
    <AdminPage
      title="Template order"
      subtitle="Choose the order templates appear in the gallery. Drag a row by its handle, or tap its number to move it to a position, then press Save — everyone sees the new order within about a minute. Templates added later appear after your list until you place them."
      icon={<ListOrdered size={18} />}
      width={980}
    >
      <style>{TO_CSS}</style>

      <Hero>
        <div className="adk-hero-grid to-stats">
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

      <div className="to-body">
        <div className="to-actions" data-dirty={dirty ? "1" : "0"}>
          <span className="to-state">
            <span className="to-dot" aria-hidden="true" />
            {dirty ? "Unsaved changes" : custom ? "Custom order is live" : "Using the default order"}
          </span>
          <div className="to-btns">
            <button className="to-btn" onClick={discard} disabled={!dirty || !!busy}><Undo2 size={15} /> Discard</button>
            <button className="to-btn" onClick={reset} disabled={!custom || !!busy}>
              {busy === "reset" ? <Loader2 size={15} className="to-spin" /> : <RotateCcw size={15} />}
              <span className="to-wide">Reset to default</span><span className="to-narrow">Reset</span>
            </button>
            <button className="to-btn to-btn--save" onClick={save} disabled={!dirty || !!busy}>
              {busy === "save" ? <Loader2 size={15} className="to-spin" /> : <Save size={15} />} Save order
            </button>
          </div>
        </div>

        {!order ? (
          <Loading label="Loading the gallery order…" />
        ) : (
          <MotionConfig reducedMotion="user">
            <Reorder.Group axis="y" values={shown} onReorder={applyShown} className="to-list" as="ol">
              {shown.map((slug, i) => (
                <Row
                  key={slug}
                  slug={slug}
                  pos={i + 1}
                  overall={filtered ? order.indexOf(slug) + 1 : null}
                  hidden={hidden.has(slug)}
                  premium={isPremiumSlug(slug, tiers)}
                  flash={flash === slug}
                  onPick={() => setEditing(slug)}
                />
              ))}
              {shown.length === 0 && <p className="to-empty">Nothing matches{q ? " that search" : ""}.</p>}
            </Reorder.Group>
          </MotionConfig>
        )}
      </div>

      {editing && shown.includes(editing) && (
        <PositionDialog
          items={shown.map((s) => ({ slug: s, title: GALLERY_BY_SLUG.get(s)?.title ?? s }))}
          slug={editing}
          scope={scope}
          onMove={(to) => moveTo(editing, to)}
          onClose={() => setEditing(null)}
        />
      )}

      {toast && <div className="to-toast" role="status">{toast}</div>}
    </AdminPage>
  );
}

function Row({
  slug, pos, overall, hidden, premium, flash, onPick,
}: {
  slug: string; pos: number; overall: number | null; hidden: boolean; premium: boolean; flash: boolean;
  onPick: () => void;
}) {
  const controls = useDragControls();
  const t = GALLERY_BY_SLUG.get(slug);
  const name = t?.title ?? slug;
  const img = t?.coverImage ? (coverSrcSet(t.coverImage) ? coverSmall(t.coverImage) : t.coverImage) : null;
  return (
    <Reorder.Item
      value={slug}
      dragListener={false}
      dragControls={controls}
      className="to-row"
      data-slug={slug}
      data-hidden={hidden ? "1" : "0"}
      data-flash={flash ? "1" : "0"}
      as="li"
    >
      <button className="to-grip" aria-label={`Drag ${name}`} onPointerDown={(e) => controls.start(e)}>
        <GripVertical size={16} />
      </button>
      <button
        type="button"
        className="to-pos"
        onClick={onPick}
        aria-label={`Change position of ${name}`}
        aria-haspopup="dialog"
        title={overall ? `#${overall} in the full list — tap to move` : "Tap to move"}
      >
        <span className="to-pos-n">{pos}</span>
        <ChevronsUpDown size={11} className="to-pos-ic" aria-hidden="true" />
      </button>
      <span className="to-thumb">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {img ? <img src={img} alt="" loading="lazy" /> : <span>{t?.emoji ?? "✦"}</span>}
      </span>
      <span className="to-name">
        <strong>{name}</strong>
        <small>/{slug}</small>
      </span>
      <span className="to-tags">
        {hidden && <Tag tone={A.muted}>Hidden</Tag>}
        {t && isComingSoon(t) && <Tag tone={A.warn}>Coming soon</Tag>}
        {ULTRA_PREMIUM_SLUGS.has(slug) ? <Tag tone={A.goldDeep}>✦ Both</Tag> : premium ? <Tag tone={A.goldDeep}>Premium</Tag> : null}
      </span>
    </Reorder.Item>
  );
}

const TO_CSS = `
.to-stats > [data-big="1"] { grid-column: 1 / -1; }
@media (min-width: 760px) { .to-stats { grid-template-columns: 1.5fr 1fr 1fr; } .to-stats > [data-big="1"] { grid-column: auto; } }
.to-host { display: flex; align-items: flex-start; gap: 8px; margin-top: 14px; font-size: 12px; line-height: 1.4; color: rgba(253,248,238,.78); }
.to-host svg { margin-top: 2px; }
.to-host strong { overflow-wrap: anywhere; }
.to-bar { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin: 18px 0 10px; }
.to-bar > * { min-width: 0; max-width: 100%; }

/* Bar + list share one column so the bar can sit above the list on a desktop
   and below it on a phone (where it docks above the bottom nav once there is
   something to save) without any change to the DOM order mid-drag. */
.to-body { display: flex; flex-direction: column; }
.to-actions { order: 0; position: sticky; top: 8px; z-index: 6; display: flex; flex-wrap: wrap; gap: 8px 12px; align-items: center;
  padding: 10px 12px; margin-bottom: 12px; border-radius: 16px; background: rgba(255,253,251,.95); border: 1px solid ${A.edge};
  box-shadow: 0 10px 30px -22px rgba(61,12,17,.5); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
  transition: border-color .2s, box-shadow .2s; }
.to-actions[data-dirty="1"] { border-color: rgba(201,168,76,.6); box-shadow: 0 14px 34px -18px rgba(61,12,17,.45); }
.to-state { display: inline-flex; align-items: center; gap: 8px; margin-right: auto; min-width: 0;
  font: 600 12.5px/1.3 Inter, system-ui, sans-serif; color: ${A.soft}; }
.to-dot { flex: none; width: 8px; height: 8px; border-radius: 50%; background: rgba(61,12,17,.2); }
.to-actions[data-dirty="1"] .to-state { color: ${A.goldDeep}; }
.to-actions[data-dirty="1"] .to-dot { background: ${A.gold}; box-shadow: 0 0 0 3px rgba(201,168,76,.25); animation: to-pulse 1.8s ease-in-out infinite; }
.to-btns { display: flex; gap: 8px; }
.to-btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; min-height: 44px; padding: 0 14px; border-radius: 12px;
  cursor: pointer; white-space: nowrap; font: 600 13px/1 Inter, system-ui, sans-serif; color: ${A.ink}; background: #fff; border: 1px solid ${A.edge};
  transition: transform .12s, opacity .15s; }
.to-btn:active:not(:disabled) { transform: scale(.97); }
.to-btn:disabled { opacity: .45; cursor: default; }
.to-btn--save { background: ${A.maroon}; color: #fdf8ee; border-color: transparent; }
.to-btn--save:not(:disabled) { box-shadow: 0 10px 22px -14px rgba(61,12,17,.9); }
.to-narrow { display: none; }
.to-spin { animation: to-spin 1s linear infinite; }
@keyframes to-spin { to { transform: rotate(360deg); } }
@keyframes to-pulse { 50% { opacity: .45; } }

.to-list { order: 1; list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 6px; }
.to-row { position: relative; display: flex; align-items: center; gap: 10px; padding: 8px 10px; border-radius: 14px; background: ${A.paper};
  border: 1px solid ${A.edge}; touch-action: pan-y; }
.to-row::after { content: ""; position: absolute; inset: -1px; border-radius: inherit; pointer-events: none; opacity: 0;
  border: 2px solid ${A.gold}; background: rgba(201,168,76,.14); }
.to-row[data-flash="1"]::after { animation: to-flash 2.2s ease-out both; }
@keyframes to-flash { 0% { opacity: 0; } 12% { opacity: 1; } 60% { opacity: 1; } 100% { opacity: 0; } }
.to-row[data-hidden="1"] > :not(.to-pos):not(.to-grip) { opacity: .62; }
.to-grip { flex: none; display: grid; place-items: center; width: 30px; height: 36px; border-radius: 8px; border: 0; background: rgba(61,12,17,.05);
  color: ${A.soft}; cursor: grab; touch-action: none; }
.to-grip:active { cursor: grabbing; }
.to-pos { flex: none; position: relative; display: inline-flex; align-items: center; justify-content: center; gap: 1px;
  min-width: 44px; height: 40px; padding: 0 6px; border-radius: 11px; cursor: pointer;
  background: linear-gradient(180deg, #fffaf0, #fbf0d8); border: 1px solid rgba(201,168,76,.55); color: ${A.goldDeep};
  box-shadow: 0 1px 0 rgba(255,255,255,.8) inset, 0 4px 10px -8px rgba(139,90,43,.8);
  transition: transform .12s, border-color .15s, background .15s; }
.to-pos-n { font: 700 14px/1 Inter, system-ui, sans-serif; font-variant-numeric: tabular-nums; }
.to-pos-ic { opacity: .7; margin-right: -2px; }
.to-pos:hover { border-color: ${A.goldDeep}; background: #fbecc8; }
.to-pos:active { transform: scale(.94); }
.to-pos:focus-visible, .to-grip:focus-visible, .to-btn:focus-visible { outline: 2px solid ${A.gold}; outline-offset: 2px; }
.to-thumb { flex: none; width: 40px; height: 52px; border-radius: 8px; overflow: hidden; display: grid; place-items: center;
  background: linear-gradient(135deg,#5a1520,#3d0c11); color: #fdf8ee; }
.to-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.to-name { flex: 1 1 auto; min-width: 0; display: flex; flex-direction: column; gap: 3px; }
.to-name strong { font: 600 13.5px/1.25 Inter, system-ui, sans-serif; color: ${A.ink}; overflow: hidden; overflow-wrap: anywhere;
  display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.to-name small { font: 500 11px/1.2 Inter, system-ui, sans-serif; color: ${A.muted}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.to-tags { flex: none; display: flex; gap: 4px; }
.to-empty { padding: 24px; text-align: center; color: ${A.muted}; font-size: 13px; }
.to-toast { position: fixed; left: 50%; bottom: 88px; transform: translateX(-50%); z-index: 60; max-width: calc(100vw - 32px);
  padding: 10px 16px; border-radius: 12px; background: ${A.maroon}; color: #fdf8ee; font: 600 13px/1.3 Inter, system-ui, sans-serif;
  box-shadow: 0 14px 34px -14px rgba(0,0,0,.6); }

@media (max-width: 767px) {
  /* Phone: the bar lives under the list and, with unsaved work, docks just
     above the site's floating bottom nav (68px bar + 14px gap, with the
     "More" bubble rising ~20px above it). */
  .to-actions { order: 2; position: static; flex-direction: column; align-items: stretch; gap: 8px; margin: 12px 0 0; padding: 10px; }
  .to-actions[data-dirty="1"] { position: sticky; top: auto; bottom: calc(110px + env(safe-area-inset-bottom)); }
  .to-state { margin: 0; padding: 0 2px; }
  .to-btns { display: grid; grid-template-columns: 1fr 1fr 1.25fr; gap: 8px; }
  .to-btn { padding: 0 8px; min-width: 0; }
  .to-wide { display: none; }
  .to-narrow { display: inline; }
  .to-toast { bottom: calc(232px + env(safe-area-inset-bottom)); }
}
@media (max-width: 640px) {
  .to-tags { display: none; }
  .to-row { gap: 8px; padding: 6px 8px; }
  .to-thumb { width: 34px; height: 44px; }
}
@media (max-width: 380px) {
  .to-btns { grid-template-columns: 1fr 1fr; }
  .to-btn--save { grid-column: 1 / -1; order: -1; }
}
@media (prefers-reduced-motion: reduce) {
  .to-row[data-flash="1"]::after { animation: none; opacity: 1; }
  .to-actions[data-dirty="1"] .to-dot { animation: none; }
  .to-btn:active:not(:disabled), .to-pos:active { transform: none; }
}
`;
