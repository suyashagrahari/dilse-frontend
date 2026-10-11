"use client";

// ─── Super admin: Premium Studio ─────────────────────────────────────────────
//
// Which templates live in the Premium collection. Two lanes — the Everyday
// collection and the Premium Vault — and a template moves between them with a
// click (or a drag on a desktop). The move is saved straight away and the card
// flies across (shared framer `layoutId`), so what you see is what is stored.
//
// Storage is `TemplateTier` on the server: one row per template whose tier a
// super admin changed. Moving a template BACK to its code default deletes the
// row rather than pinning it, so the row list stays a list of real decisions.
// Pricing is a separate screen (/admin/pricing) — this page never charges.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { API_URL } from "@/lib/config";
import { isSuperAdmin } from "@/lib/roles";
import { templateList, webpageTemplateList } from "@/data/template-registry";
import { isPremiumSlug, refreshTemplateMeta } from "@/lib/templateMeta";
import { coverSmall, coverSrcSet } from "@/lib/templateMedia";
import { Crown, Layers, ArrowRight, ArrowLeft, RotateCcw, Loader2, Sparkles, Globe, GripVertical } from "lucide-react";
import { A, AdminPage, Hero, HeroStat, ChipGroup, SearchBox, Loading } from "../adminKit";

const CATALOGUE = [...templateList, ...webpageTemplateList];
type Lane = "everyday" | "vault";

export default function PremiumStudioPage() {
  const router = useRouter();
  const { user, accessToken, isLoading } = useAppSelector((s) => s.auth);

  const [allowed, setAllowed] = useState(false);
  const [tiers, setTiers] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [show, setShow] = useState<"all" | "changed">("all");
  const [phoneLane, setPhoneLane] = useState<Lane>("vault");
  const [dragOver, setDragOver] = useState<Lane | null>(null);
  const [burst, setBurst] = useState(0);
  const [toast, setToast] = useState<{ msg: string; undo?: () => void } | null>(null);
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

  const say = useCallback((msg: string, undo?: () => void) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, undo });
    toastTimer.current = setTimeout(() => setToast(null), 4200);
  }, []);

  useEffect(() => {
    if (!allowed || !accessToken) return;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/admin/template-tiers`, { headers: hdr() });
        const json = await res.json();
        const m: Record<string, boolean> = {};
        for (const r of (json?.data?.rows ?? []) as { slug: string; premium: boolean }[]) m[r.slug] = r.premium;
        setTiers(m);
      } catch {
        say("Could not load the collections");
      } finally {
        setLoading(false);
      }
    })();
  }, [allowed, accessToken, hdr, say]);

  const isPremium = useCallback((slug: string) => isPremiumSlug(slug, tiers), [tiers]);
  // The latest tiers/busy for callbacks that outlive a render (the toast's Undo).
  const tiersRef = useRef(tiers);
  tiersRef.current = tiers;
  const busyRef = useRef<string | null>(null);

  /** Move one template to a lane. Optimistic; rolls back on failure. */
  const move = useCallback(
    async function run(slug: string, toVault: boolean, opts?: { quiet?: boolean }): Promise<void> {
      const tiers = tiersRef.current;
      if (busyRef.current || isPremiumSlug(slug, tiers) === toVault) return;
      busyRef.current = slug;
      const before = tiers;
      const toDefault = isPremiumSlug(slug, {}) === toVault;
      const next = { ...tiers };
      if (toDefault) delete next[slug]; else next[slug] = toVault;
      tiersRef.current = next;
      setTiers(next);
      setBusy(slug);
      if (toVault) setBurst((b) => b + 1);
      try {
        const res = await fetch(`${API_URL}/admin/template-tiers/${slug}`, {
          method: toDefault ? "DELETE" : "PATCH",
          headers: hdr(),
          body: toDefault ? undefined : JSON.stringify({ premium: toVault }),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error || "Failed to save");
        void refreshTemplateMeta();
        if (!opts?.quiet) {
          const title = CATALOGUE.find((t) => t.slug === slug)?.title ?? slug;
          say(toVault ? `👑 ${title} is now Premium` : `${title} moved to Everyday`, () => void run(slug, !toVault, { quiet: true }));
        }
      } catch (e) {
        tiersRef.current = before;
        setTiers(before);
        say(e instanceof Error ? e.message : "Could not move it");
      } finally {
        busyRef.current = null;
        setBusy(null);
      }
    },
    [hdr, say]
  );

  const q = search.trim().toLowerCase();
  const match = useCallback(
    (t: (typeof CATALOGUE)[number]) =>
      (!q || t.title.toLowerCase().includes(q) || t.slug.includes(q)) && (show === "all" || t.slug in tiers),
    [q, show, tiers]
  );
  const vault = useMemo(() => CATALOGUE.filter((t) => isPremium(t.slug) && match(t)), [isPremium, match]);
  const everyday = useMemo(() => CATALOGUE.filter((t) => !isPremium(t.slug) && match(t)), [isPremium, match]);
  const vaultTotal = CATALOGUE.filter((t) => isPremium(t.slug)).length;
  const changed = Object.keys(tiers).length;

  const apiHost = useMemo(() => { try { return new URL(API_URL).host; } catch { return API_URL; } }, []);

  if (!allowed) return <Loading label="Checking access…" h={320} />;

  const onDrop = (lane: Lane) => (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(null);
    const slug = e.dataTransfer.getData("text/slug");
    if (slug) void move(slug, lane === "vault");
  };

  const laneProps = (lane: Lane) => ({
    onDragOver: (e: React.DragEvent) => { e.preventDefault(); if (dragOver !== lane) setDragOver(lane); },
    onDragLeave: (e: React.DragEvent) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(null); },
    onDrop: onDrop(lane),
    "data-over": dragOver === lane ? "1" : "0",
    "data-phone": phoneLane === lane ? "1" : "0",
  });

  const card = (t: (typeof CATALOGUE)[number], i: number, inVault: boolean) => {
    const img = t.coverImage ? (coverSrcSet(t.coverImage) ? coverSmall(t.coverImage) : t.coverImage) : null;
    const moved = t.slug in tiers;
    return (
      <motion.div
        key={t.slug}
        layout
        layoutId={`ps-${t.slug}`}
        className="ps-card"
        data-vault={inVault ? "1" : "0"}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.85 }}
        transition={{ layout: { type: "spring", stiffness: 380, damping: 32 }, delay: Math.min(i, 12) * 0.015 }}
        draggable
        onDragStartCapture={(e: React.DragEvent) => { e.dataTransfer.setData("text/slug", t.slug); e.dataTransfer.effectAllowed = "move"; }}
      >
        <span className="ps-grip" aria-hidden><GripVertical size={13} /></span>
        <div className="ps-thumb">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {img ? <img src={img} alt="" loading="lazy" decoding="async" draggable={false} /> : <span className="ps-emoji">{t.emoji}</span>}
          {inVault && <span className="ps-crown" aria-hidden><Crown size={10} /></span>}
        </div>
        <div className="ps-meta">
          <div className="ps-title">{t.title}</div>
          <div className="ps-slug">/{t.slug}</div>
          <div className="ps-tags">
            {moved ? <span className="ps-tag ps-tag--moved">moved by you</span> : <span className="ps-tag">default</span>}
          </div>
        </div>
        <div className="ps-actions">
          <button
            type="button"
            className="ps-move"
            data-to={inVault ? "everyday" : "vault"}
            disabled={busy === t.slug}
            onClick={() => void move(t.slug, !inVault)}
            aria-label={inVault ? `Move ${t.title} to Everyday` : `Make ${t.title} Premium`}
          >
            {busy === t.slug ? <Loader2 size={13} className="animate-spin" /> : inVault ? <><ArrowLeft size={13} /> Everyday</> : <>Premium <ArrowRight size={13} /></>}
          </button>
          {moved && (
            <button type="button" className="ps-reset" disabled={busy === t.slug} onClick={() => void move(t.slug, !inVault)} title="Back to its default collection">
              <RotateCcw size={11} /> default
            </button>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <AdminPage
      title="Premium Studio"
      subtitle="Choose which templates sit in the Premium collection. Click a card's arrow (or drag it across) to move it — the gallery updates within about a minute. Prices are set on the Pricing tab."
      icon={<Crown size={18} />}
      width={1280}
    >
      <style>{PS_CSS}</style>

      <Hero>
        <div className="adk-hero-grid">
          <HeroStat big label="IN THE PREMIUM VAULT" value={vaultTotal} sub="gold cards · /templates/premium" tone="#ffe3a3" />
          <HeroStat label="EVERYDAY" value={CATALOGUE.length - vaultTotal} tone="#fdf8ee" />
          <HeroStat label="MOVED BY YOU" value={changed} sub={changed ? "differ from the default" : "all on defaults"} />
        </div>
        <div className="ps-host">
          <Globe size={13} style={{ flex: "none", color: "#ffe3a3" }} />
          <span>Editing <strong style={{ color: "#ffe3a3" }}>{apiHost}</strong> — collections apply to this deployment only.</span>
        </div>
      </Hero>

      <div className="ps-controls">
        <SearchBox value={search} onChange={setSearch} placeholder="Find a template" style={{ flex: "1 1 240px" }} />
        <ChipGroup
          id="ps-show"
          value={show}
          onChange={setShow}
          options={[
            { value: "all", label: "All", count: CATALOGUE.length },
            { value: "changed", label: <><Sparkles size={11} /> Moved by you</>, count: changed, tone: A.goldDeep },
          ]}
        />
      </div>

      {/* Phone: one lane at a time. */}
      <div className="ps-phoneSwitch" role="tablist" aria-label="Collection">
        {(["everyday", "vault"] as const).map((lane) => {
          const on = phoneLane === lane;
          return (
            <button key={lane} role="tab" aria-selected={on} data-on={on ? "1" : "0"} data-lane={lane} onClick={() => setPhoneLane(lane)}>
              {on && <motion.span layoutId="ps-phone-pill" className="ps-phonePill" data-lane={lane} transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <span className="ps-phoneLabel">
                {lane === "vault" ? <Crown size={13} /> : <Layers size={13} />}
                {lane === "vault" ? "Premium Vault" : "Everyday"}
                <b>{lane === "vault" ? vault.length : everyday.length}</b>
              </span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <Loading label="Opening the studio…" />
      ) : (
        <LayoutGroup>
          <div className="ps-lanes">
            <section className="ps-lane ps-lane--everyday" aria-label="Everyday collection" {...laneProps("everyday")}>
              <header className="ps-laneHead">
                <span className="ps-laneIcon"><Layers size={16} /></span>
                <div>
                  <h2>Everyday collection</h2>
                  <p>The main gallery · standard cards</p>
                </div>
                <span className="ps-count">{everyday.length}</span>
              </header>
              <div className="ps-list">
                <AnimatePresence mode="popLayout">
                  {everyday.map((t, i) => card(t, i, false))}
                </AnimatePresence>
                {everyday.length === 0 && <p className="ps-empty">Nothing here{q ? " for that search" : ""}.</p>}
              </div>
              <div className="ps-dropHint" aria-hidden>Drop to move to Everyday</div>
            </section>

            <section className="ps-lane ps-lane--vault" aria-label="Premium vault" {...laneProps("vault")}>
              <span className="ps-vaultRing" aria-hidden />
              <header className="ps-laneHead">
                <span className="ps-laneIcon ps-laneIcon--gold"><Crown size={16} /></span>
                <div>
                  <h2>The Premium Vault</h2>
                  <p>Gold cards · the premium page</p>
                </div>
                <motion.span key={vaultTotal} className="ps-count ps-count--gold" initial={{ scale: 1.5 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 500, damping: 18 }}>
                  {vault.length}
                </motion.span>
                <AnimatePresence>
                  {burst > 0 && (
                    <motion.span key={burst} className="ps-burst" aria-hidden initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ duration: 0.9 }}>
                      {Array.from({ length: 10 }, (_, k) => (
                        <motion.i key={k} initial={{ x: 0, y: 0, scale: 1 }} animate={{ x: Math.cos((k / 10) * Math.PI * 2) * 46, y: Math.sin((k / 10) * Math.PI * 2) * 46, scale: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} />
                      ))}
                    </motion.span>
                  )}
                </AnimatePresence>
              </header>
              <div className="ps-list">
                <AnimatePresence mode="popLayout">
                  {vault.map((t, i) => card(t, i, true))}
                </AnimatePresence>
                {vault.length === 0 && <p className="ps-empty ps-empty--dark">The vault is empty{q ? " for that search" : ""}.</p>}
              </div>
              <div className="ps-dropHint" aria-hidden>Drop to make Premium 👑</div>
            </section>
          </div>
        </LayoutGroup>
      )}

      <AnimatePresence>
        {toast && (
          <motion.div key="toast" role="status" aria-live="polite" className="ps-toast"
            initial={{ opacity: 0, y: 14, x: "-50%" }} animate={{ opacity: 1, y: 0, x: "-50%" }} exit={{ opacity: 0, y: 14, x: "-50%" }}>
            <span>{toast.msg}</span>
            {toast.undo && <button type="button" onClick={() => { toast.undo?.(); setToast(null); }}>Undo</button>}
          </motion.div>
        )}
      </AnimatePresence>
    </AdminPage>
  );
}

const PS_CSS = `
  .animate-spin { animation: spin 0.9s linear infinite; }
  .ps-host { display: flex; gap: 7px; align-items: flex-start; margin-top: 12px; font-size: 11.5px; line-height: 1.45; opacity: .9; }
  .ps-controls { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 12px; }
  .ps-controls .adk-search input { font-size: 16px; }

  .ps-lanes { display: grid; grid-template-columns: minmax(0,1fr) minmax(0,1fr); gap: 14px; align-items: start; }
  .ps-lane { position: relative; border-radius: 24px; padding: 14px; min-height: 320px; transition: transform .25s ease, box-shadow .25s ease; isolation: isolate; }
  .ps-lane--everyday { background: linear-gradient(180deg, #fffdf9, #f7eee4); border: 1px solid ${A.edge}; }
  .ps-lane--vault { background: radial-gradient(120% 60% at 50% 0%, #3a2410 0%, #1d0f0a 55%, #140a08 100%); border: 1px solid rgba(230,199,126,.35); overflow: hidden;
    box-shadow: 0 30px 60px -30px rgba(90,55,5,.7); color: #f6ecd9; }
  .ps-vaultRing { position: absolute; inset: -1px; border-radius: inherit; pointer-events: none; z-index: -1;
    background: linear-gradient(115deg, transparent 30%, rgba(255,230,160,.10) 45%, transparent 60%); background-size: 250% 100%; animation: psSheen 5s linear infinite; }
  .ps-lane[data-over="1"] { transform: scale(1.012); box-shadow: 0 0 0 3px ${A.gold}, 0 30px 60px -30px rgba(90,55,5,.7); }
  .ps-dropHint { position: absolute; inset: 10px; border-radius: 18px; border: 2px dashed ${A.gold}; display: grid; place-items: center; pointer-events: none;
    font: 800 14px/1 'Inter', system-ui, sans-serif; color: ${A.goldDeep}; background: rgba(255,248,230,.75); opacity: 0; transition: opacity .2s; }
  .ps-lane--vault .ps-dropHint { background: rgba(20,10,8,.7); color: #f5d77e; }
  .ps-lane[data-over="1"] .ps-dropHint { opacity: 1; }

  .ps-laneHead { position: relative; display: flex; align-items: center; gap: 10px; padding: 4px 4px 12px; }
  .ps-laneHead h2 { margin: 0; font: 700 19px/1.1 'Playfair Display', serif; color: ${A.ink}; }
  .ps-laneHead p { margin: 3px 0 0; font-size: 11.5px; color: ${A.muted}; }
  .ps-lane--vault .ps-laneHead h2 { background: linear-gradient(90deg, #fff1bf, #e6c77e 50%, #fff1bf); -webkit-background-clip: text; background-clip: text; color: transparent; background-size: 200% 100%; animation: psGoldText 4s linear infinite; }
  .ps-lane--vault .ps-laneHead p { color: rgba(246,236,217,.6); }
  .ps-laneIcon { width: 36px; height: 36px; border-radius: 12px; display: grid; place-items: center; background: rgba(61,12,17,.07); color: ${A.maroon}; flex: none; }
  .ps-laneIcon--gold { background: linear-gradient(135deg, #fff1bf, #e2b44a 45%, #a6751c); color: #3a2505; box-shadow: 0 6px 18px -6px rgba(226,180,74,.8); }
  .ps-count { margin-left: auto; min-width: 34px; height: 30px; padding: 0 10px; border-radius: 99px; display: grid; place-items: center; font: 800 13px/1 'Inter', sans-serif; background: rgba(61,12,17,.07); color: ${A.ink}; }
  .ps-count--gold { background: linear-gradient(135deg, #fff1bf, #e2b44a 45%, #a6751c); color: #3a2505; }
  .ps-burst { position: absolute; right: 16px; top: 18px; width: 0; height: 0; pointer-events: none; }
  .ps-burst i { position: absolute; width: 6px; height: 6px; margin: -3px; border-radius: 50%; background: #f5d77e; box-shadow: 0 0 8px #f5d77e; }

  .ps-list { display: grid; grid-template-columns: minmax(0,1fr); gap: 8px; max-height: 70vh; overflow-y: auto; padding: 2px; scrollbar-width: thin; }
  .ps-card { position: relative; min-width: 0; display: flex; align-items: center; gap: 10px; padding: 8px 10px 8px 6px; border-radius: 16px; cursor: grab;
    background: #fff; border: 1px solid ${A.edge}; box-shadow: 0 6px 16px -12px rgba(61,12,17,.35); }
  .ps-card:active { cursor: grabbing; }
  .ps-card[data-vault="1"] { background: linear-gradient(135deg, rgba(255,241,191,.10), rgba(255,255,255,.03)); border-color: rgba(230,199,126,.28); box-shadow: 0 10px 22px -14px rgba(0,0,0,.8); }
  .ps-grip { color: ${A.muted}; opacity: .5; flex: none; }
  .ps-card[data-vault="1"] .ps-grip { color: #e6c77e; }
  .ps-thumb { position: relative; width: 46px; aspect-ratio: 3/4; border-radius: 9px; overflow: hidden; flex: none; background: #f1e6da; display: grid; place-items: center; }
  .ps-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .ps-card[data-vault="1"] .ps-thumb { box-shadow: 0 0 0 1.5px #e2b44a; }
  .ps-emoji { font-size: 20px; }
  .ps-crown { position: absolute; top: 3px; right: 3px; width: 16px; height: 16px; border-radius: 50%; display: grid; place-items: center; background: linear-gradient(135deg,#fff1bf,#e2b44a); color: #3a2505; }
  .ps-meta { min-width: 0; flex: 1; }
  .ps-title { font-size: 13px; font-weight: 800; line-height: 1.3; color: ${A.ink}; overflow: hidden; overflow-wrap: anywhere;
    display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
  .ps-slug { font-size: 10.5px; color: ${A.muted}; font-family: ui-monospace, monospace; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .ps-card[data-vault="1"] .ps-title { color: #fbf3e4; }
  .ps-card[data-vault="1"] .ps-slug { color: rgba(246,236,217,.5); }
  .ps-tags { margin-top: 4px; }
  .ps-tag { font-size: 9.5px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; padding: 2px 7px; border-radius: 99px; background: rgba(61,12,17,.06); color: ${A.muted}; }
  .ps-card[data-vault="1"] .ps-tag { background: rgba(255,255,255,.07); color: rgba(246,236,217,.6); }
  .ps-tag--moved { background: rgba(201,168,76,.18) !important; color: ${A.goldDeep} !important; }
  .ps-card[data-vault="1"] .ps-tag--moved { color: #f5d77e !important; }
  .ps-actions { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex: none; }
  .ps-move { display: inline-flex; align-items: center; gap: 5px; height: 32px; padding: 0 12px; border-radius: 99px; border: 0; cursor: pointer;
    font: 800 11.5px/1 'Inter', system-ui, sans-serif; transition: transform .15s ease, box-shadow .2s ease; -webkit-tap-highlight-color: transparent; }
  .ps-move[data-to="vault"] { background: linear-gradient(135deg, #fff1bf, #e2b44a 45%, #a6751c); color: #3a2505; box-shadow: 0 6px 14px -6px rgba(166,117,28,.8); }
  .ps-move[data-to="everyday"] { background: rgba(255,255,255,.08); color: #f6ecd9; border: 1px solid rgba(230,199,126,.3); }
  .ps-move:hover { transform: translateY(-1px); }
  .ps-move:active { transform: scale(.95); }
  .ps-move:disabled { opacity: .7; cursor: default; }
  .ps-reset { display: inline-flex; align-items: center; gap: 3px; border: 0; background: none; cursor: pointer; font-size: 10.5px; font-weight: 700; color: ${A.muted}; padding: 2px 4px; }
  .ps-card[data-vault="1"] .ps-reset { color: rgba(246,236,217,.55); }
  .ps-empty { margin: 30px 0; text-align: center; font-size: 13px; color: ${A.muted}; }
  .ps-empty--dark { color: rgba(246,236,217,.55); }

  .ps-phoneSwitch { display: none; }
  @media (max-width: 820px) {
    .ps-lanes { grid-template-columns: minmax(0,1fr); }
    .ps-lane[data-phone="0"] { display: none; }
    .ps-list { max-height: none; }
    .ps-phoneSwitch { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; padding: 4px; margin-bottom: 10px; border-radius: 99px; background: rgba(61,12,17,.06); border: 1px solid ${A.edge}; }
    .ps-phoneSwitch button { position: relative; min-height: 42px; border: 0; background: none; border-radius: 99px; cursor: pointer; color: ${A.soft}; font: 800 12.5px/1 'Inter', sans-serif; }
    .ps-phoneSwitch button[data-on="1"] { color: #fdf8ee; }
    .ps-phoneSwitch button[data-on="1"][data-lane="vault"] { color: #3a2505; }
    .ps-phonePill { position: absolute; inset: 0; border-radius: 99px; background: ${A.maroon}; }
    .ps-phonePill[data-lane="vault"] { background: linear-gradient(135deg, #fff1bf, #e2b44a 45%, #a6751c); }
    .ps-phoneLabel { position: relative; z-index: 1; display: inline-flex; align-items: center; gap: 6px; }
    .ps-phoneLabel b { font-size: 11px; padding: 2px 7px; border-radius: 99px; background: rgba(255,255,255,.2); }
    .ps-grip { display: none; }
  }

  .ps-toast { position: fixed; left: 50%; bottom: calc(82px + env(safe-area-inset-bottom, 0px) + 14px); z-index: 200; display: flex; align-items: center; gap: 12px;
    background: ${A.maroon}; color: #fdf8ee; padding: 10px 12px 10px 16px; border-radius: 999px; font-size: 13px; font-weight: 600; max-width: 92vw;
    box-shadow: 0 10px 30px -10px rgba(26,5,7,0.6); }
  .ps-toast button { border: 0; border-radius: 99px; padding: 6px 12px; background: #f5d77e; color: #3a2505; font-weight: 800; font-size: 12px; cursor: pointer; }
  @media (min-width: 768px) { .ps-toast { bottom: 22px; } }
  @keyframes psSheen { from { background-position: 150% 0; } to { background-position: -100% 0; } }
  @keyframes psGoldText { from { background-position: 0 0; } to { background-position: 200% 0; } }
  @media (prefers-reduced-motion: reduce) { .ps-vaultRing, .ps-lane--vault .ps-laneHead h2 { animation: none; } }
`;
