"use client";

// ─── Hero: the five most-created templates ───────────────────────────────────
//
// A spotlight, not a pile: one large poster (the template's three-phone gallery
// cover) floating in a soft gold halo, the next one peeking behind it for depth,
// and a clean #1–#5 leaderboard beside it that doubles as the control. The
// active row fills like a progress bar while it plays. On tablet and phone the
// leaderboard becomes a swipeable strip under the poster.
//
// Order is live from `/api/template-meta` (pages created, all time); until it
// answers, the last known top five render so the first paint already has a
// poster. Auto-advance begins on the first interaction, so an audit that never
// interacts measures a still page.

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
const SLIDE_MS = 4200;
const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

const img = (url?: string) => (url && coverSrcSet(url) ? coverSmall(url) : url);

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
  const [dir, setDir] = useState(1);
  const [paused, setPaused] = useState(false);
  const [autoStarted, setAutoStarted] = useState(false);
  const [tick, setTick] = useState(0);
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
    const t = setInterval(() => { setDir(1); setActive((i) => (i + 1) % n); }, SLIDE_MS);
    return () => clearInterval(t);
  }, [paused, autoStarted, n, tick]);

  const go = useCallback((i: number) => {
    if (!n) return;
    const next = ((i % n) + n) % n;
    setDir(next >= idx ? 1 : -1);
    setActive(next);
    setTick((x) => x + 1);
  }, [n, idx]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -50 || info.velocity.x < -400) go(idx + 1);
    else if (info.offset.x > 50 || info.velocity.x > 400) go(idx - 1);
  };

  if (!n) return null;
  const cur = items[idx];
  const nxt = items[(idx + 1) % n];
  const badge = RANK_BADGES[idx];
  const playing = autoStarted && !paused;

  return (
    <div className="tx" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <style>{TX_CSS}</style>

      {/* ── Spotlight ─────────────────────────────────────────────────── */}
      <div className="tx-spot">
        <div className="tx-halo" aria-hidden />
        <div className="tx-ring" aria-hidden />
        {[0, 1, 2, 3, 4, 5].map((k) => (
          <span key={k} className={`tx-spark s${k}`} aria-hidden>✦</span>
        ))}

        {/* The next poster, peeking behind */}
        <AnimatePresence initial={false}>
          <motion.div
            key={`ghost-${nxt.slug}`}
            className="tx-ghost"
            initial={{ opacity: 0, rotate: 3 }}
            animate={{ opacity: 1, rotate: 7 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            aria-hidden
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img(nxt.coverImage)} alt="" draggable={false} loading="lazy" decoding="async" />
          </motion.div>
        </AnimatePresence>

        {/* The featured poster */}
        <motion.div className="tx-stage" drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.2} onDragEnd={onDragEnd}>
          <AnimatePresence initial={false} custom={dir} mode="popLayout">
            <motion.div
              key={cur.slug}
              className="tx-card"
              custom={dir}
              variants={{
                enter: (d: number) => ({ opacity: 0, x: d * 60, rotateY: d * -18, scale: 0.94 }),
                center: { opacity: 1, x: 0, rotateY: 0, scale: 1 },
                exit: (d: number) => ({ opacity: 0, x: d * -60, rotateY: d * 18, scale: 0.94 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.6, ease: EASE }}
            >
              <Link href={`/${cur.slug}`} className="tx-link" draggable={false} aria-label={`#${idx + 1} ${cur.title} — open the template`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img(cur.coverImage)}
                  srcSet={coverSrcSet(cur.coverImage)}
                  sizes="(max-width:768px) 64vw, 330px"
                  alt={cur.title}
                  draggable={false}
                  fetchPriority={idx === 0 ? "high" : "auto"}
                  decoding="async"
                />
                <span className="tx-sheen" aria-hidden />
              </Link>
              <span className={`tx-medal tx-medal--${badge.tone}`}>
                <span className="tx-medalNum">#{idx + 1}</span>
                <span className="tx-medalLbl">{badge.icon} {badge.label}</span>
              </span>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ── Leaderboard ───────────────────────────────────────────────── */}
      <div className="tx-board">
        <div className="tx-boardHead">
          <span className="tx-live"><span className="tx-liveDot" /> Trending now</span>
          <p className="tx-boardSub">The {n} templates people make the most</p>
        </div>

        <ol className="tx-list" role="tablist" aria-label="Trending templates">
          {items.map((t, i) => {
            const on = i === idx;
            return (
              <li key={t.slug} role="presentation">
                <button type="button" role="tab" aria-selected={on} className="tx-row" data-on={on ? "1" : "0"} onClick={() => go(i)}>
                  {on && <motion.span layoutId="tx-row-bg" className="tx-rowBg" transition={{ type: "spring", stiffness: 380, damping: 34 }} />}
                  <span className="tx-rowNum">{i + 1}</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="tx-rowImg" src={img(t.coverImage)} alt="" loading="lazy" decoding="async" draggable={false} />
                  <span className="tx-rowText">
                    <span className="tx-rowTitle">{t.title}</span>
                    <span className="tx-rowMeta">
                      {RANK_BADGES[i].icon} {RANK_BADGES[i].label}
                      {t.created >= 100 ? ` · ${compactCount(t.created)} made` : ""}
                    </span>
                  </span>
                  {on && (
                    <span className="tx-rowTrack" aria-hidden>
                      <motion.span
                        key={`p${tick}-${idx}-${playing}`}
                        className="tx-rowFill"
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: playing ? 1 : 0 }}
                        transition={{ duration: playing ? SLIDE_MS / 1000 : 0.2, ease: "linear" }}
                      />
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ol>

        <Link href={`/${cur.slug}`} className="tx-cta">
          <span className="tx-ctaText">
            Make{" "}
            <AnimatePresence mode="wait" initial={false}>
              <motion.b key={cur.slug} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
                {cur.title.split(/\s[—–-]\s/)[0]}
              </motion.b>
            </AnimatePresence>
          </span>
          <span className="tx-ctaArrow" aria-hidden>→</span>
        </Link>
      </div>
    </div>
  );
}

const TX_CSS = `
.tx { --tx-w: 290px; --tx-peek: 60px; position: relative; display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 34px; align-items: center; width: 100%; min-width: 0; }
@media (min-width: 1200px) { .tx { --tx-w: 310px; --tx-peek: 66px; gap: 42px; } }
@media (min-width: 769px) and (max-width: 1099px) { .tx { --tx-w: 250px; --tx-peek: 40px; grid-template-columns: minmax(0, 1fr); justify-items: center; gap: 22px; } }
@media (max-width: 768px) { .tx { --tx-w: 236px; --tx-peek: 44px; grid-template-columns: minmax(0, 1fr); justify-items: center; gap: 18px; } }

/* Spotlight */
.tx-spot { position: relative; width: calc(var(--tx-w) + var(--tx-peek)); height: calc(var(--tx-w) * 4 / 3 + 30px); }
.tx-halo { position: absolute; left: 45%; top: 50%; width: calc(var(--tx-w) * 1.7); aspect-ratio: 1; translate: -50% -50%; border-radius: 50%;
  background: radial-gradient(closest-side, rgba(201,168,76,.34), rgba(201,168,76,.12) 55%, transparent 72%); pointer-events: none; animation: txBreathe 6s ease-in-out infinite; }
.tx-ring { position: absolute; left: 45%; top: 50%; width: calc(var(--tx-w) * 1.45); aspect-ratio: 1; translate: -50% -50%; border-radius: 50%;
  border: 1px dashed rgba(139,90,43,.28); pointer-events: none; animation: txSpin 60s linear infinite; }
.tx-spark { position: absolute; color: #c9a84c; font-size: 13px; pointer-events: none; opacity: 0; animation: txTwinkle 4.2s ease-in-out infinite; }
.tx-spark.s0 { left: -6%; top: 14%; animation-delay: .2s; } .tx-spark.s1 { right: -4%; top: 8%; font-size: 10px; animation-delay: 1.1s; }
.tx-spark.s2 { left: -10%; bottom: 22%; font-size: 9px; animation-delay: 2s; } .tx-spark.s3 { right: -8%; bottom: 14%; animation-delay: 2.8s; }
.tx-spark.s4 { left: 40%; top: -3%; font-size: 9px; animation-delay: 3.4s; } .tx-spark.s5 { left: 30%; bottom: -2%; font-size: 11px; animation-delay: 1.6s; }

.tx-ghost { position: absolute; left: var(--tx-peek); top: 22px; width: var(--tx-w); aspect-ratio: 3 / 4; border-radius: 24px; overflow: hidden; transform-origin: 20% 95%;
  box-shadow: 0 24px 50px -26px rgba(42,10,14,.55); filter: saturate(.8) brightness(.9); }
.tx-ghost img { width: 100%; height: 100%; object-fit: cover; display: block; }

.tx-stage { position: absolute; left: 0; top: 10px; width: var(--tx-w); aspect-ratio: 3 / 4; perspective: 1200px; touch-action: pan-y; cursor: grab; }
.tx-stage:active { cursor: grabbing; }
.tx-card { position: absolute; inset: 0; transform-style: preserve-3d; animation: txFloat 6s ease-in-out infinite; }
.tx-link { position: relative; display: block; width: 100%; height: 100%; border-radius: 26px; overflow: hidden; background: #1a0b0d;
  box-shadow: 0 44px 80px -34px rgba(42,10,14,.8), 0 0 0 1.5px rgba(201,168,76,.6); -webkit-tap-highlight-color: transparent; }
.tx-link img { width: 100%; height: 100%; object-fit: cover; display: block; user-select: none; -webkit-user-drag: none; }
.tx-sheen { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.tx-sheen::before { content: ""; position: absolute; top: -20%; bottom: -20%; width: 32%; left: -60%; transform: skewX(-18deg);
  background: linear-gradient(100deg, transparent, rgba(255,248,225,.5), transparent); animation: txSweep 4.2s cubic-bezier(.4,0,.2,1) infinite; }

.tx-medal { position: absolute; left: -16px; bottom: 28px; display: grid; gap: 3px; padding: 9px 14px 9px 12px; border-radius: 16px; color: #fff;
  box-shadow: 0 16px 30px -12px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.45); }
.tx-medalNum { font: 700 24px/1 var(--font-playfair), 'Playfair Display', serif; }
.tx-medalLbl { font: 800 9.5px/1 Inter, system-ui, sans-serif; letter-spacing: .12em; text-transform: uppercase; opacity: .95; }
.tx-medal--gold { background: linear-gradient(135deg, #fff1bf, #e2b44a 45%, #a6751c); color: #3a2505; }
.tx-medal--fire { background: linear-gradient(135deg, #ff9a3c, #ff3d3d 60%, #c2185b); }
.tx-medal--hot  { background: linear-gradient(135deg, #ff6fb5, #e0287d 55%, #8e1a5a); }
.tx-medal--rise { background: linear-gradient(135deg, #9d7bff, #6a3df0 55%, #3b1fa8); }
.tx-medal--fan  { background: linear-gradient(135deg, #3ee0c5, #139e9a 55%, #0b5f6b); }

/* Leaderboard */
.tx-board { min-width: 0; width: 100%; max-width: 290px; }
.tx-boardHead { margin-bottom: 12px; }
.tx-live { display: inline-flex; align-items: center; gap: 7px; padding: 6px 12px; border-radius: 99px; background: #241014; color: #f5ede6;
  font: 700 10.5px/1 Inter, system-ui, sans-serif; letter-spacing: .16em; text-transform: uppercase; }
.tx-liveDot { width: 7px; height: 7px; border-radius: 50%; background: #ff5a5a; animation: txPulse 1.6s infinite; }
.tx-boardSub { margin: 9px 0 0; font: 500 13px/1.4 Inter, system-ui, sans-serif; color: #7d5a5a; }

.tx-list { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; }
.tx-row { position: relative; display: grid; grid-template-columns: 22px 34px minmax(0, 1fr); align-items: center; gap: 10px; width: 100%;
  padding: 8px 10px 9px 8px; border: 0; background: transparent; border-radius: 14px; cursor: pointer; text-align: left; overflow: hidden;
  -webkit-tap-highlight-color: transparent; transition: background .2s ease; }
.tx-row:hover { background: rgba(61,12,17,.04); }
.tx-rowBg { position: absolute; inset: 0; border-radius: 14px; background: #fff; box-shadow: 0 12px 26px -16px rgba(61,12,17,.55), 0 0 0 1px rgba(61,12,17,.08); }
.tx-rowNum { position: relative; font: 700 20px/1 var(--font-playfair), 'Playfair Display', serif; color: rgba(61,12,17,.3); text-align: center; transition: color .3s; }
.tx-row[data-on="1"] .tx-rowNum { color: #8a6a1c; }
.tx-rowImg { position: relative; width: 34px; aspect-ratio: 3 / 4; object-fit: cover; border-radius: 7px; box-shadow: 0 4px 10px -4px rgba(42,10,14,.5); }
.tx-rowText { position: relative; display: grid; gap: 2px; min-width: 0; }
.tx-rowTitle { font: 700 13.5px/1.25 Inter, system-ui, sans-serif; color: #5a3a3a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: color .3s; }
.tx-row[data-on="1"] .tx-rowTitle { color: #2a0a0e; }
.tx-rowMeta { font: 500 11px/1.2 Inter, system-ui, sans-serif; color: #9d7b7b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tx-rowTrack { position: absolute; left: 12px; right: 12px; bottom: 3px; height: 2px; border-radius: 2px; background: rgba(201,168,76,.18); overflow: hidden; }
.tx-rowFill { display: block; height: 100%; background: linear-gradient(90deg, #c9a84c, #8a6a1c); transform-origin: left; }

.tx-cta { margin-top: 14px; display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 12px 12px 12px 18px; border-radius: 14px;
  background: #3d0c11; color: #f5ede6; text-decoration: none; font: 600 13px/1.2 Inter, system-ui, sans-serif; box-shadow: 0 14px 28px -14px rgba(61,12,17,.8);
  transition: transform .2s ease, background .2s ease; min-width: 0; }
.tx-ctaText { min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tx-cta b { display: inline-block; color: #f2cf74; font-weight: 700; }
.tx-cta:hover { background: #2a0809; transform: translateY(-2px); }
.tx-ctaArrow { flex: none; width: 30px; height: 30px; border-radius: 50%; display: grid; place-items: center; background: rgba(242,207,116,.16); color: #f2cf74; transition: transform .2s ease; }
.tx-cta:hover .tx-ctaArrow { transform: translateX(3px); }

/* Tablet + phone: the board becomes a swipe strip under the poster */
@media (max-width: 1099px) {
  .tx-board { max-width: 520px; }
  .tx-boardHead { display: flex; align-items: center; justify-content: center; gap: 10px; flex-wrap: wrap; text-align: center; }
  .tx-boardSub { margin: 0; font-size: 12px; }
  .tx-list { display: flex; gap: 8px; overflow-x: auto; scroll-snap-type: x mandatory; padding: 2px 2px 6px; scrollbar-width: none; }
  .tx-list::-webkit-scrollbar { display: none; }
  .tx-list li { flex: 0 0 auto; scroll-snap-align: center; }
  .tx-row { grid-template-columns: 30px minmax(0, 1fr); width: 200px; padding: 8px 8px 10px; background: rgba(255,255,255,.55); box-shadow: 0 0 0 1px rgba(61,12,17,.08); }
  .tx-rowNum { display: none; }
  .tx-rowImg { width: 30px; }
  .tx-rowTitle { font-size: 12.5px; }
  .tx-cta { max-width: 360px; margin-left: auto; margin-right: auto; }
}
@media (max-width: 768px) {
  .tx-medal { left: -8px; bottom: 18px; padding: 7px 11px 7px 10px; border-radius: 13px; }
  .tx-medalNum { font-size: 19px; }
  .tx-medalLbl { font-size: 8.5px; }
  .tx-link { border-radius: 22px; }
  .tx-ghost { border-radius: 20px; }
}

@keyframes txFloat { 0%, 100% { translate: 0 0; } 50% { translate: 0 -8px; } }
@keyframes txBreathe { 0%, 100% { scale: 1; opacity: 1; } 50% { scale: 1.06; opacity: .85; } }
@keyframes txSpin { to { rotate: 360deg; } }
@keyframes txTwinkle { 0%, 100% { opacity: 0; transform: scale(.6); } 40%, 60% { opacity: .9; transform: scale(1); } }
@keyframes txSweep { 0%, 55% { left: -60%; } 85%, 100% { left: 130%; } }
@keyframes txPulse { 0% { box-shadow: 0 0 0 0 rgba(255,90,90,.7); } 70% { box-shadow: 0 0 0 8px rgba(255,90,90,0); } 100% { box-shadow: 0 0 0 0 rgba(255,90,90,0); } }
@media (prefers-reduced-motion: reduce) { .tx-card, .tx-halo, .tx-ring, .tx-spark, .tx-sheen::before, .tx-liveDot { animation: none; } }
`;
