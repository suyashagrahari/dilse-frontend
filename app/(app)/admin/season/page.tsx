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
//   ⏸  Off — no seasonal banners anywhere
//
// Plus the Halloween sale itself: on/off and the percent. The discount is real
// — the server applies it to every price read for the two Halloween templates
// (gallery, quote, publish gate, order) while the mode is Halloween and the sale
// is on. Super admin only; the server refuses everyone else.
//
// And which templates are IN the drop: any templates from the registry —
// Halloween or not — picked from a searchable checklist and saved as
// `saleSlugs`. The sale discounts exactly those, and /halloween-offer shows
// exactly those as gallery cards.

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarClock, ExternalLink, Ghost, LayoutGrid, Loader2, Percent, RotateCcw, Save, Search, X } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { API_URL } from "@/lib/config";
import { isSuperAdmin } from "@/lib/roles";
import { refreshPricing } from "@/lib/pricing";
import { HALLOWEEN_PATH, HALLOWEEN_SLUGS, setSeason, type SeasonMode } from "@/lib/season";
import { GALLERY_BY_SLUG, GALLERY_LIST } from "@/lib/galleryRules";
import { isPremiumSlug, useTemplateMeta } from "@/lib/templateMeta";
import { A, AdminPage, Hero, HeroStat, Loading, Panel } from "../adminKit";

const DEFAULT_DROP: string[] = [...HALLOWEEN_SLUGS];
const sameSet = (a: readonly string[], b: readonly string[]) => a.length === b.length && a.every((x) => b.includes(x));

type View = {
  mode: SeasonMode;
  saleEnabled: boolean;
  salePercent: number;
  saleSlugs: string[];
  updatedAt: string | null;
  updatedBy: string | null;
};

const MODES: { value: SeasonMode; emoji: string; label: string; note: string }[] = [
  { value: "valentine", emoji: "💘", label: "Valentine wishlist", note: "The wishlist banners on the blog and gallery, as before — they show while a countdown runs in Wishlist." },
  { value: "halloween", emoji: "🎃", label: "Halloween drop", note: "Running strip under the navbar on home, blog and gallery; Halloween card in posts; critters on the home hero and blog; the offer page." },
  { value: "off", emoji: "⏸️", label: "Off", note: "No seasonal banners anywhere. The offer page still opens, without the sale." },
];

const QUICK = [25, 30, 40, 49];

/** Accepts the flat admin shape and the public `{ mode, sale }` shape. */
function parseView(json: unknown): View | null {
  const root = json as { data?: unknown } | null;
  const d = ((root && typeof root === "object" && root.data) || root) as Record<string, unknown> | null;
  if (!d || typeof d !== "object") return null;
  const sale = (d.sale ?? {}) as Record<string, unknown>;
  const mode = d.mode as SeasonMode;
  if (!MODES.some((m) => m.value === mode)) return null;
  const by = d.updatedBy as unknown;
  const byText =
    typeof by === "string" ? by
      : by && typeof by === "object" ? String((by as Record<string, unknown>).email ?? (by as Record<string, unknown>).name ?? "")
        : typeof d.updatedByEmail === "string" ? d.updatedByEmail : null;
  return {
    mode,
    saleEnabled: Boolean(d.saleEnabled ?? sale.enabled),
    salePercent: Number(d.salePercent ?? sale.percent) || 0,
    saleSlugs: (Array.isArray(d.saleSlugs) ? d.saleSlugs : Array.isArray(sale.slugs) ? sale.slugs : []) as string[],
    updatedAt: typeof d.updatedAt === "string" ? d.updatedAt : null,
    updatedBy: byText || null,
  };
}

export default function AdminSeasonPage() {
  const router = useRouter();
  const { user, accessToken, isLoading } = useAppSelector((s) => s.auth);
  const [allowed, setAllowed] = useState(false);
  const [view, setView] = useState<View | null>(null);
  const [mode, setMode] = useState<SeasonMode>("halloween");
  const [saleOn, setSaleOn] = useState(true);
  const [pct, setPct] = useState("49");
  const [slugs, setSlugs] = useState<string[]>(DEFAULT_DROP);
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
    setSaleOn(v.saleEnabled);
    setPct(String(v.salePercent || 49));
    setSlugs(v.saleSlugs.length ? v.saleSlugs : DEFAULT_DROP);
  }, []);

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

  const pctNum = Math.round(Number(pct));
  const pctValid = Number.isFinite(pctNum) && pctNum >= 1 && pctNum <= 90;
  const slugsChanged = !!view && !sameSet(slugs, view.saleSlugs.length ? view.saleSlugs : DEFAULT_DROP);
  const dirty = !!view && (mode !== view.mode || saleOn !== view.saleEnabled || (pctValid && pctNum !== view.salePercent) || slugsChanged);

  // The whole registry, Halloween first, then gallery order; searched by name or slug.
  const catalogue = useMemo(() => {
    const hw = new Set<string>(HALLOWEEN_SLUGS);
    return [...GALLERY_LIST]
      .sort((a, b) => Number(hw.has(b.slug)) - Number(hw.has(a.slug)))
      .map((t) => ({ slug: t.slug, title: t.title, emoji: t.emoji, ultra: Boolean(t.ultra), premium: isPremiumSlug(t.slug, tiers) }));
  }, [tiers]);
  const needle = q.trim().toLowerCase();
  const shown = needle ? catalogue.filter((t) => t.title.toLowerCase().includes(needle) || t.slug.includes(needle)) : catalogue;
  const toggleSlug = (slug: string) => setSlugs((cur) => (cur.includes(slug) ? cur.filter((x) => x !== slug) : [...cur, slug]));

  const save = async () => {
    if (!accessToken || busy || !pctValid || slugs.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/admin/super/season`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ mode, saleEnabled: saleOn, salePercent: pctNum, saleSlugs: slugs }),
      });
      const json = await res.json().catch(() => null);
      const v = res.ok ? parseView(json) : null;
      if (!v) throw new Error(json?.error || json?.message || `Save failed (HTTP ${res.status})`);
      adopt(v);
      // This tab sees the change at once: the banners read the season store,
      // and the gallery/offer page read the (now discounted) pricing store.
      setSeason({ mode: v.mode, sale: { enabled: v.saleEnabled && v.salePercent > 0, percent: v.salePercent, slugs: v.saleSlugs } });
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
  const saleLive = view?.mode === "halloween" && view.saleEnabled && view.salePercent > 0;

  return (
    <AdminPage
      title="Season & offers"
      subtitle="What the whole site is wearing: the Valentine wishlist, the Halloween drop, or nothing seasonal. In Halloween mode the running strip shows under the navbar on home, blog and gallery, posts show the Halloween card, and the templates you put in the drop are sold at the sale percent — a real discount applied by the server at quote, publish and checkout."
      icon={<Ghost size={18} />}
      width={1280}
    >
      <style>{SSN_CSS}</style>
      <Hero>
        <div className="adk-hero-grid">
          <HeroStat label="Site is wearing" value={view ? `${liveMode?.emoji ?? ""} ${liveMode?.label ?? view.mode}` : "…"} />
          <HeroStat
            label="Halloween sale"
            value={view ? (saleLive ? `${view.salePercent}% off` : view.saleEnabled ? "Armed" : "Off") : "…"}
            sub={view ? (saleLive ? `live on ${view.saleSlugs.length || 2} drop template${view.saleSlugs.length === 1 ? "" : "s"}` : view.saleEnabled ? "applies once mode is Halloween" : "full price") : undefined}
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
                  onClick={() => setMode(m.value)}
                >
                  <span className="ssn-mode-e" aria-hidden>{m.emoji}</span>
                  <b>{m.label}</b>
                  <span>{m.note}</span>
                  {view.mode === m.value && <i className="ssn-live">LIVE NOW</i>}
                </button>
              ))}
            </div>
          </Panel>

          <Panel
            title="Halloween sale"
            icon={<Percent size={15} color={A.goldDeep} />}
            note={`${slugs.length} template${slugs.length === 1 ? "" : "s"} in the drop`}
            delay={0.1}
            right={
              <button
                type="button"
                role="switch"
                aria-checked={saleOn}
                aria-label={saleOn ? "Switch the Halloween sale off" : "Switch the Halloween sale on"}
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
                  ? mode === "halloween"
                    ? `Every template in the drop sells at ${pctValid ? pctNum : "…"}% off, with the original price struck through on the paywall.`
                    : "Armed — it takes effect when the mode is Halloween."
                  : "Off — the Halloween drop still shows, at full price and without a percent."}
              </p>
            </div>
          </Panel>

          <Panel
            title="Templates in the drop"
            icon={<LayoutGrid size={15} color={A.goldDeep} />}
            note={`${slugs.length} selected`}
            delay={0.15}
            right={
              <button type="button" className="ssn-reset" disabled={sameSet(slugs, DEFAULT_DROP)} onClick={() => setSlugs(DEFAULT_DROP)}>
                <RotateCcw size={13} /> Reset to the two Halloween templates
              </button>
            }
          >
            <p className="ssn-help ssn-pick-help">
              Any templates, Halloween or not. These are the cards on the offer page and the templates the sale discounts. At least one.
            </p>
            <div className="ssn-chips" aria-label="Selected templates">
              {slugs.map((s) => {
                const t = GALLERY_BY_SLUG.get(s);
                return (
                  <span key={s} className={`ssn-chip${t ? "" : " is-unknown"}`} title={t ? s : "Not in the registry — skipped on the site"}>
                    {t ? t.title : s}
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
                    </label>
                  </li>
                );
              })}
              {shown.length === 0 && <li className="ssn-help ssn-empty">No template matches “{q}”.</li>}
            </ul>
          </Panel>

          <div className="ssn-bar">
            <div className="ssn-links">
              <Link href={HALLOWEEN_PATH} target="_blank">Offer page <ExternalLink size={12} /></Link>
              <Link href="/" target="_blank">Home <ExternalLink size={12} /></Link>
              <Link href="/blog" target="_blank">Blog <ExternalLink size={12} /></Link>
              <Link href="/templates" target="_blank">Gallery <ExternalLink size={12} /></Link>
            </div>
            <button type="button" className="ssn-save" disabled={!dirty || busy || !pctValid || slugs.length === 0} onClick={save}>
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
@media (min-width: 720px) { .ssn-modes { grid-template-columns: repeat(3, minmax(0,1fr)); } }
.ssn-mode { position: relative; display: flex; flex-direction: column; align-items: flex-start; gap: 6px; padding: 14px 14px 16px; border-radius: 16px; text-align: left; cursor: pointer;
  border: 1.5px solid rgba(61,12,17,.12); background: #fffdfb; color: #2a0a0e; transition: border-color .2s ease, box-shadow .2s ease, transform .2s ease; }
.ssn-mode:hover { transform: translateY(-1px); }
.ssn-mode b { font: 700 15px/1.2 'Inter', sans-serif; }
.ssn-mode > span:not(.ssn-mode-e) { font: 400 12.5px/1.45 'Inter', sans-serif; color: #7f5f5f; }
.ssn-mode-e { font-size: 26px; line-height: 1; }
.ssn-mode.on { border-color: #3d0c11; box-shadow: 0 10px 24px -14px rgba(61,12,17,.6), inset 0 0 0 1px #3d0c11; }
.ssn-mode.is-halloween.on { border-color: #5a4a7c; color: #f3eefe; background: linear-gradient(180deg, #2b2245, #17132a); box-shadow: 0 10px 24px -14px rgba(23,19,42,.8), inset 0 0 0 1px #b9a6f0; }
.ssn-mode.is-halloween.on > span:not(.ssn-mode-e) { color: rgba(226,216,250,.75); }
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
