"use client";

// ─── Super admin: Season & offers ────────────────────────────────────────────
//
// One switch for what the whole site is wearing:
//
//   💘 Valentine wishlist — the wishlist banners on the blog and the gallery,
//      exactly as before (they still need a countdown running in /admin/wishlist)
//   🎃 Halloween drop — the running strip under the navbar on home, blog and
//      gallery, the Halloween card in blog posts, the gallery teaser, the
//      critters on the home hero and blog, and /halloween-offer with the sale
//   🥢 Navratri Dandiya drop — kumkum-red garba theme: strip, blog card,
//      gallery teaser, sticks/mirrors/panda on the hero and blog, /dandiya-offer
//   🪔 Diwali drop — maroon-gold theme: strip, blog card, gallery teaser,
//      diyas/lanterns/fireworks on the hero and blog, /diwali-offer
//   ⏸  Off — no seasonal banners anywhere
//
// Each DROP season (Halloween, Navratri Dandiya, Diwali) keeps its own sale — on/off
// and the percent — and its own list of templates, edited under that season's
// tab. Switching the mode never loses the other season's settings. The
// discount is real: the server applies the ACTIVE mode's sale to every price
// read for that drop's templates (gallery, quote, publish gate, order). Super
// admin only; the server refuses everyone else.
//
// Which templates are IN a drop: any templates from the registry picked from
// a searchable checklist (plus the season's own templates even before they are
// in the registry) and saved as that drop's `saleSlugs`. The sale discounts
// exactly those, and the season's offer page shows exactly those as cards.

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, ExternalLink, Ghost, LayoutGrid, Loader2, Percent, RotateCcw, Save, Search, X } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { API_URL } from "@/lib/config";
import { isSuperAdmin } from "@/lib/roles";
import { refreshPricing } from "@/lib/pricing";
import {
  DROP_IDS, DROP_TEMPLATE_FALLBACK, DROPS, FESTIVAL_PERCENT_DEFAULT, isDropMode, setSeason, type DropId, type DropSale, type SeasonMode,
} from "@/lib/season";
import { GALLERY_BY_SLUG, GALLERY_LIST } from "@/lib/galleryRules";
import { isPremiumSlug, useTemplateMeta } from "@/lib/templateMeta";
import { A, AdminPage, Hero, HeroStat, Loading, Panel } from "../adminKit";

type Drop = { saleEnabled: boolean; salePercent: number; saleSlugs: string[] };
type Draft = { saleOn: boolean; pct: string; slugs: string[] };

/** Each drop's settings when the server has none: what the server defaults to. */
const DROP_DEFAULT: Record<DropId, Drop> = {
  halloween: { saleEnabled: true, salePercent: 49, saleSlugs: [...DROPS.halloween.slugs] },
  dandiya: { saleEnabled: true, salePercent: FESTIVAL_PERCENT_DEFAULT, saleSlugs: [...DROPS.dandiya.slugs] },
  diwali: { saleEnabled: true, salePercent: FESTIVAL_PERCENT_DEFAULT, saleSlugs: [...DROPS.diwali.slugs] },
};
const DROP_UI: Record<DropId, { emoji: string; tab: string; reset: string }> = {
  halloween: { emoji: "🎃", tab: "Halloween drop", reset: "Reset to the two Halloween templates" },
  dandiya: { emoji: "🥢", tab: "Navratri Dandiya drop", reset: "Reset to Be My Dandiya Partner" },
  diwali: { emoji: "🪔", tab: "Diwali drop", reset: "Reset to Happy Diwali" },
};
const sameSet = (a: readonly string[], b: readonly string[]) => a.length === b.length && a.every((x) => b.includes(x));

type View = {
  mode: SeasonMode;
  drops: Record<DropId, Drop>;
  updatedAt: string | null;
  updatedBy: string | null;
};

const MODES: { value: SeasonMode; emoji: string; label: string; note: string }[] = [
  { value: "valentine", emoji: "💘", label: "Valentine wishlist", note: "The wishlist banners on the blog and gallery, as before — they show while a countdown runs in Wishlist." },
  { value: "halloween", emoji: "🎃", label: "Halloween drop", note: "Running strip under the navbar on home, blog and gallery; Halloween card in posts; critters on the home hero and blog; the offer page." },
  { value: "dandiya", emoji: "🥢", label: "Navratri Dandiya drop", note: "Kumkum-red garba theme: Dandiya strip, blog card and gallery teaser; twirling sticks, mirrors and the dancing panda on the hero and blog; /dandiya-offer. Ends 20 Oct." },
  { value: "diwali", emoji: "🪔", label: "Diwali drop", note: "Maroon-gold Diwali theme: Diwali strip, blog card and gallery teaser; diyas, lanterns, fireworks and rangoli on the hero and blog; /diwali-offer. Ends 8 Nov." },
  { value: "off", emoji: "⏸️", label: "Off", note: "No seasonal banners anywhere. The offer pages still open, without the sale." },
];

const QUICK = [25, 30, 40, 49];

function readDrop(raw: unknown, fallback: Drop): Drop {
  const o = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const pct = Number(o.salePercent ?? o.percent);
  const slugs = Array.isArray(o.saleSlugs) ? o.saleSlugs : Array.isArray(o.slugs) ? o.slugs : null;
  const on = o.saleEnabled ?? o.enabled;
  return {
    saleEnabled: typeof on === "boolean" ? on : fallback.saleEnabled,
    salePercent: Number.isFinite(pct) && pct > 0 ? Math.round(pct) : fallback.salePercent,
    saleSlugs: slugs && slugs.length ? slugs.filter((x): x is string => typeof x === "string") : [...fallback.saleSlugs],
  };
}

/**
 * Accepts the admin shape `{ mode, drops, saleEnabled… }`, the older flat admin
 * shape (= the Halloween drop) and the public `{ mode, sale, drops }` shape.
 */
function parseView(json: unknown): View | null {
  const root = json as { data?: unknown } | null;
  const d = ((root && typeof root === "object" && root.data) || root) as Record<string, unknown> | null;
  if (!d || typeof d !== "object") return null;
  // A round-1 server still says "festive" (the merged Navratri & Diwali season): that is the Diwali season now.
  const mode = (d.mode === "festive" ? "diwali" : d.mode) as SeasonMode;
  if (!MODES.some((m) => m.value === mode)) return null;
  const by = d.updatedBy as unknown;
  const byText =
    typeof by === "string" ? by
      : by && typeof by === "object" ? String((by as Record<string, unknown>).email ?? (by as Record<string, unknown>).name ?? "")
        : typeof d.updatedByEmail === "string" ? d.updatedByEmail : null;
  const rawDrops = { ...((d.drops && typeof d.drops === "object" ? d.drops : {}) as Record<string, unknown>) };
  if (rawDrops.diwali === undefined && rawDrops.festive !== undefined) rawDrops.diwali = rawDrops.festive;
  // Without `drops`, the flat fields (or `sale`) describe the drop of the active mode — Halloween's on older servers.
  const flat = { saleEnabled: d.saleEnabled, salePercent: d.salePercent, saleSlugs: d.saleSlugs, ...(d.sale && typeof d.sale === "object" ? (d.sale as object) : {}) };
  const flatFor: DropId = isDropMode(mode) ? mode : "halloween";
  const drops = Object.fromEntries(
    DROP_IDS.map((id) => [id, readDrop(rawDrops[id] ?? (id === flatFor && !d.drops ? flat : undefined), DROP_DEFAULT[id])]),
  ) as Record<DropId, Drop>;
  return {
    mode,
    drops,
    updatedAt: typeof d.updatedAt === "string" ? d.updatedAt : null,
    updatedBy: byText || null,
  };
}

const toDraft = (d: Drop): Draft => ({ saleOn: d.saleEnabled, pct: String(d.salePercent || 30), slugs: d.saleSlugs.length ? [...d.saleSlugs] : [] });

export default function AdminSeasonPage() {
  const router = useRouter();
  const { user, accessToken, isLoading } = useAppSelector((s) => s.auth);
  const [allowed, setAllowed] = useState(false);
  const [view, setView] = useState<View | null>(null);
  const [mode, setMode] = useState<SeasonMode>("halloween");
  /** Which drop's sale and templates the panels below edit. */
  const [tab, setTab] = useState<DropId>("halloween");
  const [drafts, setDrafts] = useState<Record<DropId, Draft>>(() =>
    Object.fromEntries(DROP_IDS.map((id) => [id, toDraft(DROP_DEFAULT[id])])) as Record<DropId, Draft>,
  );
  const [q, setQ] = useState("");
  const { tiers } = useTemplateMeta();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading || !user) return;
    if (!isSuperAdmin(user.role)) {
      router.replace("/admin/analytics");
      return;
    }
    setAllowed(true);
  }, [user, isLoading, router]);

  const adopt = useCallback((v: View) => {
    setView(v);
    setMode(v.mode);
    if (isDropMode(v.mode)) setTab(v.mode);
    setDrafts(Object.fromEntries(DROP_IDS.map((id) => [id, toDraft(v.drops[id])])) as Record<DropId, Draft>);
  }, []);

  // The current tab's draft, with setters that edit only that drop.
  const draft = drafts[tab];
  const { saleOn, pct, slugs } = draft;
  const patchDraft = useCallback((p: Partial<Draft> | ((d: Draft) => Partial<Draft>)) => {
    setDrafts((all) => ({ ...all, [tab]: { ...all[tab], ...(typeof p === "function" ? p(all[tab]) : p) } }));
  }, [tab]);
  const setSaleOn = (f: (v: boolean) => boolean) => patchDraft((d) => ({ saleOn: f(d.saleOn) }));
  const setPct = (v: string) => patchDraft({ pct: v });
  const setSlugs = (v: string[]) => patchDraft({ slugs: v });
  const pickMode = (m: SeasonMode) => {
    setMode(m);
    if (isDropMode(m)) setTab(m);
  };

  useEffect(() => {
    if (!allowed || !accessToken) return;
    let live = true;
    void (async () => {
      try {
        const res = await fetch(`${API_URL}/admin/super/season`, { headers: { Authorization: `Bearer ${accessToken}` } });
        const json = await res.json().catch(() => null);
        if (!live) return;
        const v = res.ok ? parseView(json) : null;
        if (!v) throw new Error(json?.error || json?.message || `Could not load the season (HTTP ${res.status})`);
        adopt(v);
      } catch (e) {
        if (live) setError((e as Error).message);
      }
    })();
    return () => { live = false; };
  }, [allowed, accessToken, adopt]);

  const pctOf = (d: Draft) => Math.round(Number(d.pct));
  const validDraft = (d: Draft) => { const n = pctOf(d); return Number.isFinite(n) && n >= 1 && n <= 90 && d.slugs.length > 0; };
  const draftDirty = (id: DropId) => {
    if (!view) return false;
    const d = drafts[id], v = view.drops[id];
    return d.saleOn !== v.saleEnabled || pctOf(d) !== v.salePercent || !sameSet(d.slugs, v.saleSlugs);
  };
  const pctNum = pctOf(draft);
  const pctValid = Number.isFinite(pctNum) && pctNum >= 1 && pctNum <= 90;
  const allValid = DROP_IDS.every((id) => validDraft(drafts[id]));
  const dirty = !!view && (mode !== view.mode || DROP_IDS.some(draftDirty));
  const defaults = DROP_DEFAULT[tab].saleSlugs;
  const ui = DROP_UI[tab];

  // The whole registry — this drop's own templates first (even before they are
  // in the registry), then gallery order; searched by name or slug.
  const catalogue = useMemo(() => {
    const own = new Set<string>(defaults);
    const listed = [...GALLERY_LIST]
      .sort((a, b) => Number(own.has(b.slug)) - Number(own.has(a.slug)))
      .map((t) => ({ slug: t.slug, title: t.title, emoji: t.emoji, ultra: Boolean(t.ultra), premium: isPremiumSlug(t.slug, tiers), soon: false }));
    const missing = defaults
      .filter((s) => !GALLERY_BY_SLUG.has(s))
      .map((s) => ({ slug: s, title: DROP_TEMPLATE_FALLBACK[s]?.title ?? s, emoji: DROP_TEMPLATE_FALLBACK[s]?.emoji ?? "✨", ultra: false, premium: false, soon: true }));
    return [...missing, ...listed];
  }, [tiers, defaults]);
  const needle = q.trim().toLowerCase();
  const shown = needle ? catalogue.filter((t) => t.title.toLowerCase().includes(needle) || t.slug.includes(needle)) : catalogue;
  const toggleSlug = (slug: string) => patchDraft((d) => ({ slugs: d.slugs.includes(slug) ? d.slugs.filter((x) => x !== slug) : [...d.slugs, slug] }));

  const save = async () => {
    if (!accessToken || busy || !allValid) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/admin/super/season`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        // Every drop's settings, so one save covers edits made under both tabs.
        body: JSON.stringify({
          mode,
          drops: Object.fromEntries(
            DROP_IDS.map((id) => [id, { saleEnabled: drafts[id].saleOn, salePercent: pctOf(drafts[id]), saleSlugs: drafts[id].slugs }]),
          ),
        }),
      });
      const json = await res.json().catch(() => null);
      const v = res.ok ? parseView(json) : null;
      if (!v) throw new Error(json?.error || json?.message || `Save failed (HTTP ${res.status})`);
      adopt(v);
      // This tab sees the change at once: the banners read the season store,
      // and the gallery/offer page read the (now discounted) pricing store.
      const pub = (d: Drop): DropSale => ({ enabled: d.saleEnabled && d.salePercent > 0, percent: d.salePercent, slugs: d.saleSlugs });
      setSeason({
        mode: v.mode,
        sale: pub(v.drops[isDropMode(v.mode) ? v.mode : "halloween"]),
        drops: Object.fromEntries(DROP_IDS.map((id) => [id, pub(v.drops[id])])) as Record<DropId, DropSale>,
      });
      void refreshPricing();
      setToast("Saved — live for visitors within a minute");
      setTimeout(() => setToast(null), 2800);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (!allowed) return <Loading />;

  const liveMode = MODES.find((m) => m.value === view?.mode);
  const activeDrop = view && isDropMode(view.mode) ? view.drops[view.mode] : null;
  const saleLive = !!activeDrop && activeDrop.saleEnabled && activeDrop.salePercent > 0;

  return (
    <AdminPage
      title="Season & offers"
      subtitle="What the whole site is wearing: the Valentine wishlist, a drop season (Halloween, Navratri Dandiya or Diwali), or nothing seasonal. In a drop season its running strip shows under the navbar on home, blog and gallery, posts show its card, and the templates in that drop are sold at its sale percent — a real discount applied by the server at quote, publish and checkout. Each drop keeps its own sale and templates."
      icon={<Ghost size={18} />}
      width={1280}
    >
      <style>{SSN_CSS}</style>
      <Hero>
        <div className="adk-hero-grid">
          <HeroStat label="Site is wearing" value={view ? `${liveMode?.emoji ?? ""} ${liveMode?.label ?? view.mode}` : "…"} />
          <HeroStat
            label="Live sale"
            value={view ? (saleLive && activeDrop ? `${activeDrop.salePercent}% off` : activeDrop ? "Off" : "None") : "…"}
            sub={view ? (activeDrop ? (saleLive ? `live on ${activeDrop.saleSlugs.length} drop template${activeDrop.saleSlugs.length === 1 ? "" : "s"}` : "drop at full price") : "no drop season is on") : undefined}
          />
          <HeroStat
            label="Last updated"
            value={view?.updatedAt ? new Date(view.updatedAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : view ? "Never (defaults)" : "…"}
            sub={view?.updatedBy ?? undefined}
          />
        </div>
      </Hero>

      {error && <div className="ssn-err" role="alert">{error}</div>}
      {!view && !error && <Loading label="Loading the season…" h={160} />}

      {view && (
        <>
          <Panel title="Which season?" icon={<CalendarClock size={15} color={A.goldDeep} />} note="one at a time" delay={0.05}>
            <div className="ssn-modes" role="radiogroup" aria-label="Season">
              {MODES.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  role="radio"
                  aria-checked={mode === m.value}
                  className={`ssn-mode is-${m.value}${mode === m.value ? " on" : ""}`}
                  onClick={() => pickMode(m.value)}
                >
                  <span className="ssn-mode-e" aria-hidden>{m.emoji}</span>
                  <b>{m.label}</b>
                  <span>{m.note}</span>
                  {view.mode === m.value && <i className="ssn-live">LIVE NOW</i>}
                </button>
              ))}
            </div>
          </Panel>

          <div className="ssn-tabs" role="tablist" aria-label="Which drop to edit">
            {DROP_IDS.map((id) => (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={tab === id}
                className={`ssn-tab is-${id}${tab === id ? " on" : ""}`}
                onClick={() => setTab(id)}
              >
                <span aria-hidden>{DROP_UI[id].emoji}</span> {DROP_UI[id].tab}
                {view.mode === id && <i className="ssn-live ssn-live-in">LIVE</i>}
                {draftDirty(id) && <i className="ssn-dot" title="Unsaved changes" />}
              </button>
            ))}
            <span className="ssn-tabs-note">
              {mode === tab ? "Editing the drop that is live once you save." : `Editing the ${DROP_UI[tab].tab} — it goes live only when the season above is “${DROP_UI[tab].tab}”.`}
            </span>
          </div>

          <Panel
            title={`${ui.tab} · sale`}
            icon={<Percent size={15} color={A.goldDeep} />}
            note={`${slugs.length} template${slugs.length === 1 ? "" : "s"} in the drop`}
            delay={0.1}
            right={
              <button
                type="button"
                role="switch"
                aria-checked={saleOn}
                aria-label={saleOn ? `Switch the ${ui.tab} sale off` : `Switch the ${ui.tab} sale on`}
                className={`ssn-switch${saleOn ? " on" : ""}`}
                onClick={() => setSaleOn((v) => !v)}
              >
                <span />
              </button>
            }
          >
            <div className={`ssn-sale${saleOn ? "" : " is-off"}`}>
              <label className="ssn-pct">
                <span>Discount</span>
                <span className="ssn-pct-in">
                  <input
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={90}
                    value={pct}
                    disabled={!saleOn}
                    onChange={(e) => setPct(e.target.value)}
                    aria-invalid={!pctValid}
                  />
                  <b>%</b>
                </span>
              </label>
              <div className="ssn-quick">
                {QUICK.map((q) => (
                  <button key={q} type="button" disabled={!saleOn} className={pctNum === q ? "on" : ""} onClick={() => setPct(String(q))}>{q}%</button>
                ))}
              </div>
              {!pctValid && <p className="ssn-warn">Pick a percent from 1 to 90.</p>}
              <p className="ssn-help">
                {saleOn
                  ? mode === tab
                    ? `Every template in the drop sells at ${pctValid ? pctNum : "…"}% off, with the original price struck through on the paywall.`
                    : `Armed — it takes effect when the season is the ${ui.tab}.`
                  : `Off — the ${ui.tab} still shows, at full price and without a percent.`}
              </p>
            </div>
          </Panel>

          <Panel
            title={`${ui.tab} · templates`}
            icon={<LayoutGrid size={15} color={A.goldDeep} />}
            note={`${slugs.length} selected`}
            delay={0.15}
            right={
              <button type="button" className="ssn-reset" disabled={sameSet(slugs, defaults)} onClick={() => setSlugs([...defaults])}>
                <RotateCcw size={13} /> {ui.reset}
              </button>
            }
          >
            <p className="ssn-help ssn-pick-help">
              Any templates, seasonal or not. These are the cards on {DROPS[tab].path} and the templates its sale discounts. At least one.
            </p>
            <div className="ssn-chips" aria-label="Selected templates">
              {slugs.map((s) => {
                const t = GALLERY_BY_SLUG.get(s);
                const fb = DROP_TEMPLATE_FALLBACK[s];
                return (
                  <span key={s} className={`ssn-chip${t ? "" : fb ? " is-soon" : " is-unknown"}`}
                    title={t ? s : fb ? `${s} — not in this build's registry yet; the offer page shows a placeholder card` : "Not in the registry — skipped on the site"}>
                    {t ? t.title : fb ? fb.title : s}
                    <button type="button" aria-label={`Remove ${t?.title ?? s}`} onClick={() => toggleSlug(s)}><X size={12} /></button>
                  </span>
                );
              })}
              {slugs.length === 0 && <span className="ssn-warn">Pick at least one template.</span>}
            </div>
            <label className="ssn-search">
              <Search size={15} aria-hidden />
              <input type="search" placeholder="Search templates by name or slug" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search templates" />
            </label>
            <ul className="ssn-list" role="group" aria-label="Templates">
              {shown.map((t) => {
                const on = slugs.includes(t.slug);
                return (
                  <li key={t.slug}>
                    <label className={`ssn-row${on ? " on" : ""}`}>
                      <input type="checkbox" checked={on} onChange={() => toggleSlug(t.slug)} />
                      <span className="ssn-row-e" aria-hidden>{t.emoji}</span>
                      <span className="ssn-row-t"><b>{t.title}</b><code>{t.slug}</code></span>
                      {(t.ultra || t.premium) && <i className="ssn-prem">{t.ultra ? "✦ Premium" : "Premium"}</i>}
                      {t.soon && <i className="ssn-prem ssn-soon">Coming</i>}
                    </label>
                  </li>
                );
              })}
              {shown.length === 0 && <li className="ssn-help ssn-empty">No template matches “{q}”.</li>}
            </ul>
          </Panel>

          <div className="ssn-bar">
            <div className="ssn-links">
              <Link href={DROPS[tab].path} target="_blank">{DROP_UI[tab].tab} page <ExternalLink size={12} /></Link>
              <Link href="/" target="_blank">Home <ExternalLink size={12} /></Link>
              <Link href="/blog" target="_blank">Blog <ExternalLink size={12} /></Link>
              <Link href="/templates" target="_blank">Gallery <ExternalLink size={12} /></Link>
            </div>
            <button type="button" className="ssn-save" disabled={!dirty || busy || !allValid} onClick={save}>
              {busy ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} {dirty ? "Save changes" : "Saved"}
            </button>
          </div>
          {toast && <div className="ssn-toast" role="status">{toast}</div>}
        </>
      )}
    </AdminPage>
  );
}

const SSN_CSS = `
.ssn-err { margin: 12px 0; padding: 12px 14px; border-radius: 12px; color: #b3261e; background: #fff1ef; border: 1px solid rgba(179,38,30,.25); font: 500 13px/1.4 'Inter', sans-serif; }
.ssn-modes { display: grid; grid-template-columns: minmax(0,1fr); gap: 10px; }
@media (min-width: 720px) { .ssn-modes { grid-template-columns: repeat(2, minmax(0,1fr)); } }
@media (min-width: 1100px) { .ssn-modes { grid-template-columns: repeat(5, minmax(0,1fr)); } }
.ssn-mode { position: relative; display: flex; flex-direction: column; align-items: flex-start; gap: 6px; padding: 14px 14px 16px; border-radius: 16px; text-align: left; cursor: pointer;
  border: 1.5px solid rgba(61,12,17,.12); background: #fffdfb; color: #2a0a0e; transition: border-color .2s ease, box-shadow .2s ease, transform .2s ease; }
.ssn-mode:hover { transform: translateY(-1px); }
.ssn-mode b { font: 700 15px/1.2 'Inter', sans-serif; }
.ssn-mode > span:not(.ssn-mode-e) { font: 400 12.5px/1.45 'Inter', sans-serif; color: #7f5f5f; }
.ssn-mode-e { font-size: 26px; line-height: 1; }
.ssn-mode.on { border-color: #3d0c11; box-shadow: 0 10px 24px -14px rgba(61,12,17,.6), inset 0 0 0 1px #3d0c11; }
.ssn-mode.is-halloween.on { border-color: #5a4a7c; color: #f3eefe; background: linear-gradient(180deg, #2b2245, #17132a); box-shadow: 0 10px 24px -14px rgba(23,19,42,.8), inset 0 0 0 1px #b9a6f0; }
.ssn-mode.is-halloween.on > span:not(.ssn-mode-e) { color: rgba(226,216,250,.75); }
.ssn-mode.is-dandiya.on { border-color: #ffb000; color: #fff6ea;
  background: radial-gradient(circle at 50% 50%, rgba(255,240,220,.28) 0 1.1px, transparent 1.5px) 0 0 / 14px 14px, radial-gradient(120% 90% at 85% 0%, rgba(255,61,154,.35), transparent 55%), linear-gradient(180deg, #b3121b, #7a0f12);
  box-shadow: 0 10px 24px -14px rgba(90,7,12,.8), inset 0 0 0 1px #ffb000; }
.ssn-mode.is-dandiya.on > span:not(.ssn-mode-e) { color: rgba(255,230,214,.82); }
.ssn-mode.is-diwali.on { border-color: #ffcf5a; color: #ffe7a8; background: radial-gradient(120% 90% at 50% 120%, rgba(255,190,70,.35), transparent 55%), linear-gradient(180deg, #5e0b10, #2b0508);
  box-shadow: 0 10px 24px -14px rgba(51,6,10,.8), inset 0 0 0 1px #ffcf5a; }
.ssn-mode.is-diwali.on > span:not(.ssn-mode-e) { color: rgba(255,228,196,.8); }
.ssn-tabs { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin: 18px 0 2px; }
.ssn-tab { position: relative; display: inline-flex; align-items: center; gap: 7px; padding: 10px 14px; border-radius: 999px; cursor: pointer;
  border: 1.5px solid rgba(61,12,17,.14); background: #fffdfb; color: #2a0a0e; font: 700 13px/1 'Inter', sans-serif; }
.ssn-tab.on.is-halloween { color: #f3eefe; border-color: #b9a6f0; background: linear-gradient(135deg, #17132a, #3b2f62); }
.ssn-tab.on.is-dandiya { color: #fff6ea; border-color: #ffb000; background: linear-gradient(135deg, #7a0f12, #c8141f); }
.ssn-tab.on.is-diwali { color: #ffe7a8; border-color: #ffcf5a; background: linear-gradient(135deg, #2b0508, #8f1416); }
.ssn-tab .ssn-live-in { position: static; padding: 3px 6px; font-size: 8.5px; }
.ssn-dot { width: 7px; height: 7px; border-radius: 50%; background: #e3742a; }
.ssn-tabs-note { flex: 1 1 260px; font: 500 12.5px/1.4 'Inter', sans-serif; color: #7f5f5f; }
.ssn-chip.is-soon { background: linear-gradient(135deg, #5e0b10, #8f1416); box-shadow: inset 0 0 0 1px rgba(255,207,90,.5); }
.ssn-soon { background: linear-gradient(135deg, #ffe3a3, #ffb020); }
.ssn-mode.is-valentine.on { background: linear-gradient(180deg, #fff6f4, #ffe6e1); }
.ssn-live { position: absolute; top: 12px; right: 12px; padding: 4px 7px; border-radius: 999px; font: 800 9px/1 'Inter', sans-serif; font-style: normal; letter-spacing: .12em; color: #fff; background: #1e7a4b; }
.ssn-switch { position: relative; width: 46px; height: 26px; border: 0; border-radius: 999px; cursor: pointer; background: rgba(61,12,17,.18); transition: background .25s ease; }
.ssn-switch span { position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 999px; background: #fff; box-shadow: 0 2px 6px rgba(0,0,0,.25); transition: transform .25s cubic-bezier(.22,1,.36,1); }
.ssn-switch.on { background: linear-gradient(90deg, #f0862f, #c4521c); }
.ssn-switch.on span { transform: translateX(20px); }
.ssn-sale { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 16px; }
.ssn-sale.is-off { opacity: .6; }
.ssn-pct { display: inline-flex; align-items: center; gap: 10px; font: 600 13px/1 'Inter', sans-serif; color: #2a0a0e; }
.ssn-pct-in { display: inline-flex; align-items: center; gap: 4px; padding: 0 12px; height: 42px; border-radius: 12px; border: 1.5px solid rgba(61,12,17,.18); background: #fff; }
.ssn-pct-in input { width: 56px; border: 0; outline: none; font: 800 20px/1 'Inter', sans-serif; color: #2a0a0e; background: transparent; }
.ssn-pct-in b { font: 800 16px/1 'Inter', sans-serif; color: #c4521c; }
.ssn-quick { display: inline-flex; gap: 6px; flex-wrap: wrap; }
.ssn-quick button { padding: 9px 12px; border-radius: 999px; border: 1px solid rgba(61,12,17,.16); background: #fffdfb; font: 700 12.5px/1 'Inter', sans-serif; color: #2a0a0e; cursor: pointer; }
.ssn-quick button.on { color: #fff; background: #c4521c; border-color: #c4521c; }
.ssn-quick button:disabled, .ssn-pct-in input:disabled { cursor: not-allowed; }
.ssn-warn { width: 100%; margin: 0; font: 600 12.5px/1.4 'Inter', sans-serif; color: #b3261e; }
.ssn-help { width: 100%; margin: 0; font: 400 13px/1.5 'Inter', sans-serif; color: #7f5f5f; }
.ssn-bar { position: sticky; bottom: 12px; z-index: 5; display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-top: 14px; padding: 12px 14px;
  border-radius: 16px; background: rgba(255,253,251,.92); backdrop-filter: blur(10px); box-shadow: 0 10px 30px -16px rgba(61,12,17,.45), inset 0 0 0 1px rgba(61,12,17,.08); }
.ssn-links { display: flex; flex-wrap: wrap; gap: 12px; }
.ssn-links a { display: inline-flex; align-items: center; gap: 4px; font: 600 12.5px/1 'Inter', sans-serif; color: #8b5a2b; text-decoration: none; }
.ssn-links a:hover { text-decoration: underline; }
.ssn-save { display: inline-flex; align-items: center; gap: 8px; padding: 12px 18px; border: 0; border-radius: 999px; cursor: pointer; font: 800 13.5px/1 'Inter', sans-serif; color: #f5ede6;
  background: linear-gradient(135deg, #3d0c11, #5a1620); box-shadow: 0 10px 22px -12px rgba(61,12,17,.8); }
.ssn-save:disabled { opacity: .5; cursor: default; }
@media (max-width: 1023px) { .ssn-bar { bottom: 100px; } }
.ssn-reset { display: inline-flex; align-items: center; gap: 6px; padding: 8px 12px; border-radius: 999px; border: 1px solid rgba(61,12,17,.16); background: #fffdfb; cursor: pointer;
  font: 700 12px/1 'Inter', sans-serif; color: #2a0a0e; }
.ssn-reset:disabled { opacity: .45; cursor: default; }
.ssn-pick-help { margin-bottom: 10px; }
.ssn-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
.ssn-chip { display: inline-flex; align-items: center; gap: 6px; padding: 6px 6px 6px 11px; border-radius: 999px; font: 700 12px/1 'Inter', sans-serif; color: #f3eefe;
  background: linear-gradient(135deg, #2b2245, #3a2f58); box-shadow: inset 0 0 0 1px rgba(185,166,240,.35); }
.ssn-chip.is-unknown { background: #b3261e; }
.ssn-chip button { display: grid; place-items: center; width: 20px; height: 20px; border: 0; border-radius: 50%; cursor: pointer; color: #f3eefe; background: rgba(255,255,255,.14); }
.ssn-search { display: flex; align-items: center; gap: 8px; height: 42px; padding: 0 12px; border-radius: 12px; border: 1.5px solid rgba(61,12,17,.16); background: #fff; color: #7f5f5f; }
.ssn-search input { flex: 1; min-width: 0; border: 0; outline: none; background: transparent; font: 500 14px/1 'Inter', sans-serif; color: #2a0a0e; }
.ssn-list { list-style: none; margin: 10px 0 0; padding: 4px; max-height: 420px; overflow-y: auto; border-radius: 14px; border: 1px solid rgba(61,12,17,.1); background: #fffdfb;
  display: grid; grid-template-columns: minmax(0,1fr); gap: 2px; }
@media (min-width: 720px) { .ssn-list { grid-template-columns: repeat(2, minmax(0,1fr)); max-height: 480px; } }
@media (min-width: 1100px) { .ssn-list { grid-template-columns: repeat(3, minmax(0,1fr)); max-height: 540px; } }
.ssn-row { min-width: 0; display: flex; align-items: center; gap: 10px; padding: 9px 10px; border-radius: 10px; cursor: pointer; }
.ssn-row:hover { background: rgba(61,12,17,.04); }
.ssn-row.on { background: rgba(90,74,124,.1); box-shadow: inset 0 0 0 1px rgba(90,74,124,.35); }
.ssn-row input { width: 16px; height: 16px; accent-color: #5a4a7c; flex: none; }
.ssn-row-e { font-size: 18px; flex: none; }
.ssn-row-t { display: flex; flex-direction: column; gap: 3px; min-width: 0; flex: 1; }
.ssn-row-t b { font: 600 13px/1.25 'Inter', sans-serif; color: #2a0a0e; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ssn-row-t code { font: 500 11px/1 ui-monospace, monospace; color: #8b6b6b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.ssn-prem { flex: none; padding: 4px 8px; border-radius: 999px; font: 800 9.5px/1 'Inter', sans-serif; font-style: normal; letter-spacing: .08em; text-transform: uppercase;
  color: #3a2505; background: linear-gradient(135deg, #fff1bf, #e2b44a 45%, #a6751c); }
.ssn-empty { padding: 12px; }
.ssn-toast { position: fixed; left: 50%; bottom: 170px; transform: translateX(-50%); z-index: 90; padding: 10px 16px; border-radius: 999px; color: #fff; background: #1e7a4b; font: 700 13px/1 'Inter', sans-serif; box-shadow: 0 10px 24px -10px rgba(0,0,0,.4); }
`;
