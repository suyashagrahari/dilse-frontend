"use client";

// ─── Hero: the five most-created templates, as a 3D poster carousel ──────────
//
// Each card is the template's gallery cover — a finished three-phone poster —
// so the hero shows real screens of real templates. Order comes from
// `/api/template-meta` (pages created, all time); until that answers, the last
// known top five render so the first paint (the LCP) already has a poster.
//
// Auto-advance starts on the visitor's first interaction, like the carousel it
// replaced: an audit that never interacts measures a still page.

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { templateList } from "@/data/template-registry";
import { useTemplateMeta, RANK_BADGES, compactCount } from "@/lib/templateMeta";
import { useTemplateAccess } from "@/hooks/useTemplateAccess";
import { coverSmall, coverSrcSet } from "@/lib/templateMedia";

/** Production's top five when this was written — the pre-fetch fallback. */
const FALLBACK = ["apology-dashboard", "bouquet-gf", "love-gf", "birthday-gf", "darling"];
const BY_SLUG = new Map(templateList.map((t) => [t.slug, t]));
const SLIDE_MS = 3800;

/** Horizontal spacing between stacked cards, matching the CSS breakpoints. */
function useStep(): number {
  const [step, setStep] = useState(150);
  useEffect(() => {
    const read = () => {
      const w = window.innerWidth;
      setStep(w <= 400 ? 74 : w <= 768 ? 86 : w < 1100 ? 70 : w >= 1200 ? 122 : 108);
    };
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);
  return step;
}

export default function TrendingShowcase() {
  const { ranking } = useTemplateMeta();
  const { hidden } = useTemplateAccess();

  const items = useMemo(() => {
    const created = new Map(ranking.map((r) => [r.slug, r.created]));
    const order = ranking.length ? ranking.map((r) => r.slug) : FALLBACK;
    return order
      .map((slug) => BY_SLUG.get(slug))
      .filter((t): t is NonNullable<typeof t> => Boolean(t && t.coverImage && !hidden.has(t.slug)))
      .slice(0, 5)
      .map((t) => ({ ...t, created: created.get(t.slug) ?? 0 }));
  }, [ranking, hidden]);

  const n = items.length;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [autoStarted, setAutoStarted] = useState(false);
  const [tick, setTick] = useState(0);
  const step = useStep();

  // Keep the index valid when the list arrives or changes length.
  const idx = n ? active % n : 0;

  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;
    const events = ["pointermove", "pointerdown", "touchstart", "scroll", "keydown"] as const;
    const start = () => {
      events.forEach((e) => window.removeEventListener(e, start));
      t = setTimeout(() => setAutoStarted(true), 1200);
    };
    events.forEach((e) => window.addEventListener(e, start, { passive: true, once: true }));
    return () => {
      events.forEach((e) => window.removeEventListener(e, start));
      if (t) clearTimeout(t);
    };
  }, []);

  useEffect(() => {
    if (paused || !autoStarted || n < 2) return;
    const t = setInterval(() => setActive((i) => (i + 1) % n), SLIDE_MS);
    return () => clearInterval(t);
  }, [paused, autoStarted, n, tick]);

  const go = useCallback((i: number) => {
    if (!n) return;
    setActive(((i % n) + n) % n);
    setTick((x) => x + 1);
  }, [n]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -50 || info.velocity.x < -400) go(idx + 1);
    else if (info.offset.x > 50 || info.velocity.x > 400) go(idx - 1);
  };

  if (!n) return null;
  const cur = items[idx];
  const badge = RANK_BADGES[idx];

  return (
    <div className="ts-wrap" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <style>{TS_CSS}</style>

      {/* Header row */}
      <div className="ts-head">
        <span className="ts-live"><span className="ts-liveDot" /> Trending now</span>
        <span className="ts-headNote">Top {n} most-created templates</span>
      </div>

      {/* Stage */}
      <motion.div
        className="ts-stage"
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.18}
        onDragEnd={onDragEnd}
        aria-roledescription="carousel"
        aria-label="Trending templates"
      >
        <div className="ts-glow" aria-hidden />
        {items.map((t, i) => {
          let d = i - idx;
          if (d > n / 2) d -= n;
          if (d < -n / 2) d += n;
          const ad = Math.abs(d);
          const on = d === 0;
          const b = RANK_BADGES[i];
          return (
            <motion.div
              key={t.slug}
              className="ts-card"
              data-on={on ? "1" : "0"}
              initial={false}
              animate={{
                // The outer pair tuck in closer so the fan stays inside its column.
                x: d * step * (ad >= 2 ? 0.82 : 1),
                scale: 1 - ad * 0.13,
                rotateY: d * -22,
                opacity: ad > 2 ? 0 : 1,
                filter: on ? "brightness(1)" : `brightness(${1 - ad * 0.22}) saturate(${1 - ad * 0.2})`,
              }}
              transition={{ type: "spring", stiffness: 230, damping: 28 }}
              style={{ zIndex: 10 - ad, pointerEvents: ad > 2 ? "none" : "auto" }}
              onClick={() => { if (!on) go(i); }}
            >
              <Link
                href={`/${t.slug}`}
                className="ts-link"
                tabIndex={on ? 0 : -1}
                onClick={(e) => { if (!on) e.preventDefault(); }}
                draggable={false}
                aria-label={`#${i + 1} ${t.title} — open the template`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverSrcSet(t.coverImage) ? coverSmall(t.coverImage!) : t.coverImage}
                  srcSet={coverSrcSet(t.coverImage)}
                  sizes="(max-width:768px) 62vw, 340px"
                  alt={t.title}
                  className="ts-img"
                  draggable={false}
                  loading={ad <= 1 ? "eager" : "lazy"}
                  fetchPriority={on && i === 0 ? "high" : "auto"}
                  decoding="async"
                />
                <span className={`ts-rank ts-rank--${b.tone}`}>
                  <span className="ts-rankIc">{b.icon}</span>#{i + 1}
                  <span className="ts-rankLbl">{b.label}</span>
                </span>
                {on && <span className="ts-shine" aria-hidden />}
              </Link>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Caption for the active card */}
      <div className="ts-caption">
        <AnimatePresence mode="wait">
          <motion.div
            key={cur.slug}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="ts-capIn"
          >
            <div className="ts-capText">
              <span className="ts-capMeta">
                {badge.icon} #{idx + 1} {badge.label}
                {cur.created >= 100 && <> · <b>{compactCount(cur.created)}</b> pages made</>}
              </span>
              <span className="ts-capTitle">{cur.title}</span>
            </div>
            <Link href={`/${cur.slug}`} className="ts-cta">
              Make yours <span aria-hidden>→</span>
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Rank chips + progress */}
      <div className="ts-chips" role="tablist" aria-label="Choose a trending template">
        {items.map((t, i) => {
          const on = i === idx;
          return (
            <button key={t.slug} type="button" role="tab" aria-selected={on} className="ts-chip" data-on={on ? "1" : "0"} onClick={() => go(i)}>
              {on && <motion.span layoutId="ts-chip-pill" className="ts-chipPill" transition={{ type: "spring", stiffness: 420, damping: 34 }} />}
              <span className="ts-chipIn">
                <b>#{i + 1}</b> {t.title.length > 18 ? `${t.title.slice(0, 17)}…` : t.title}
              </span>
              {on && autoStarted && !paused && (
                <motion.span key={`p${tick}-${idx}`} className="ts-chipBar" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: SLIDE_MS / 1000, ease: "linear" }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const TS_CSS = `
.ts-wrap { position: relative; width: 100%; min-width: 0; --ts-w: 290px; }
@media (min-width: 1200px) { .ts-wrap { --ts-w: 310px; } }
@media (min-width: 769px) and (max-width: 1099px) { .ts-wrap { --ts-w: 215px; } .ts-headNote { display: none; } }
@media (max-width: 768px) { .ts-wrap { --ts-w: 230px; } }
@media (max-width: 400px) { .ts-wrap { --ts-w: 210px; } }

.ts-head { display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 10px; flex-wrap: wrap; }
.ts-live { display: inline-flex; align-items: center; gap: 7px; padding: 6px 13px; border-radius: 99px; background: #241014; color: #f5ede6;
  font: 700 11px/1 Inter, system-ui, sans-serif; letter-spacing: .14em; text-transform: uppercase; box-shadow: 0 8px 20px -10px rgba(36,16,20,.7); }
.ts-liveDot { width: 7px; height: 7px; border-radius: 50%; background: #ff5a5a; box-shadow: 0 0 0 0 rgba(255,90,90,.7); animation: tsPulse 1.6s infinite; }
.ts-headNote { font: 500 12px/1.3 Inter, system-ui, sans-serif; color: #7d5a5a; }

.ts-stage { position: relative; height: calc(var(--ts-w) * 4 / 3 + 26px); perspective: 1400px; transform-style: preserve-3d; touch-action: pan-y; cursor: grab; }
.ts-stage:active { cursor: grabbing; }
.ts-glow { position: absolute; left: 50%; top: 50%; width: calc(var(--ts-w) * 1.9); height: calc(var(--ts-w) * 1.2); translate: -50% -50%; border-radius: 50%;
  background: radial-gradient(closest-side, rgba(201,168,76,.32), rgba(201,168,76,.08) 60%, transparent); filter: blur(10px); pointer-events: none; }
.ts-card { position: absolute; left: 50%; margin-left: calc(var(--ts-w) / -2); top: 12px; width: var(--ts-w); aspect-ratio: 3 / 4; transform-origin: 50% 60%; will-change: transform; }
.ts-link { position: relative; display: block; width: 100%; height: 100%; border-radius: 22px; overflow: hidden; background: #1a0b0d;
  box-shadow: 0 30px 60px -28px rgba(42,10,14,.65), 0 0 0 1px rgba(61,12,17,.12); -webkit-tap-highlight-color: transparent; }
.ts-card[data-on="1"] .ts-link { box-shadow: 0 40px 80px -30px rgba(42,10,14,.75), 0 0 0 2px rgba(201,168,76,.75), 0 0 36px -6px rgba(201,168,76,.45); }
.ts-img { width: 100%; height: 100%; object-fit: cover; display: block; user-select: none; -webkit-user-drag: none; }
.ts-shine { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.ts-shine::before { content: ""; position: absolute; top: -20%; bottom: -20%; width: 35%; left: -60%; transform: skewX(-18deg);
  background: linear-gradient(100deg, transparent, rgba(255,246,214,.45), transparent); animation: tsSweep 3.8s cubic-bezier(.4,0,.2,1) infinite; }

.ts-rank { position: absolute; top: 10px; left: 10px; display: inline-flex; align-items: center; gap: 5px; padding: 5px 11px 5px 5px; border-radius: 99px; color: #fff;
  font: 900 12px/1 Inter, system-ui, sans-serif; box-shadow: 0 6px 16px -6px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.45); }
.ts-rankIc { width: 20px; height: 20px; border-radius: 50%; display: grid; place-items: center; background: rgba(255,255,255,.25); font-size: 11px; }
.ts-rankLbl { font-size: 9.5px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; }
.ts-card[data-on="0"] .ts-rankLbl { display: none; }
.ts-rank--gold { background: linear-gradient(135deg, #fff1bf, #e2b44a 45%, #a6751c); color: #3a2505; }
.ts-rank--fire { background: linear-gradient(135deg, #ff9a3c, #ff3d3d 60%, #c2185b); }
.ts-rank--hot  { background: linear-gradient(135deg, #ff6fb5, #e0287d 55%, #8e1a5a); }
.ts-rank--rise { background: linear-gradient(135deg, #9d7bff, #6a3df0 55%, #3b1fa8); }
.ts-rank--fan  { background: linear-gradient(135deg, #3ee0c5, #139e9a 55%, #0b5f6b); }

.ts-caption { position: relative; max-width: 460px; margin: 8px auto 0; min-height: 58px; }
.ts-capIn { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: 10px 10px 10px 18px; border-radius: 18px;
  background: rgba(255,255,255,.72); border: 1px solid rgba(61,12,17,.1); box-shadow: 0 14px 30px -22px rgba(61,12,17,.55); }
.ts-capText { display: grid; gap: 3px; min-width: 0; text-align: left; }
.ts-capMeta { font: 600 11px/1.2 Inter, system-ui, sans-serif; color: #8a6a1c; letter-spacing: .02em; }
.ts-capMeta b { color: #3d0c11; }
.ts-capTitle { font: 700 19px/1.15 var(--font-playfair), 'Playfair Display', serif; color: #2a0a0e; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.ts-cta { flex: none; display: inline-flex; align-items: center; gap: 6px; padding: 11px 16px; border-radius: 12px; background: #3d0c11; color: #f5ede6;
  font: 700 12px/1 Inter, system-ui, sans-serif; letter-spacing: .04em; text-decoration: none; transition: transform .2s ease, background .2s ease; }
.ts-cta:hover { background: #2a0809; transform: translateY(-1px); }
.ts-cta span { transition: transform .2s ease; }
.ts-cta:hover span { transform: translateX(3px); }

.ts-chips { display: flex; justify-content: center; gap: 6px; margin-top: 14px; overflow-x: auto; scrollbar-width: none; padding: 2px; }
.ts-chips::-webkit-scrollbar { display: none; }
.ts-chip { position: relative; flex: none; overflow: hidden; border: 1px solid rgba(61,12,17,.16); background: #fdfaf4; color: #6b4545; border-radius: 99px;
  padding: 8px 13px; cursor: pointer; font: 600 12px/1 Inter, system-ui, sans-serif; white-space: nowrap; -webkit-tap-highlight-color: transparent; }
.ts-chip[data-on="1"] { color: #f5ede6; border-color: #241014; }
.ts-chipPill { position: absolute; inset: 0; background: #241014; border-radius: inherit; }
.ts-chipIn { position: relative; z-index: 1; }
.ts-chipIn b { color: #c9a84c; margin-right: 2px; }
.ts-chipBar { position: absolute; left: 0; right: 0; bottom: 0; height: 2px; background: #e6c77e; transform-origin: left; z-index: 2; }
@media (max-width: 768px) {
  .ts-chips { justify-content: flex-start; } .ts-capTitle { font-size: 17px; }
  .ts-rank { top: 7px; left: 7px; padding: 3px 8px 3px 3px; font-size: 10px; gap: 4px; }
  .ts-rankIc { width: 16px; height: 16px; font-size: 9px; }
  .ts-rankLbl { display: none; }
  .ts-link { border-radius: 18px; }
}

@keyframes tsPulse { 0% { box-shadow: 0 0 0 0 rgba(255,90,90,.7); } 70% { box-shadow: 0 0 0 8px rgba(255,90,90,0); } 100% { box-shadow: 0 0 0 0 rgba(255,90,90,0); } }
@keyframes tsSweep { 0%, 55% { left: -60%; } 85%, 100% { left: 130%; } }
@media (prefers-reduced-motion: reduce) { .ts-liveDot, .ts-shine::before { animation: none; } }
`;
