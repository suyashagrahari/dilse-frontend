"use client";

// ─── Hero: the five most-created templates ───────────────────────────────────
//
// Deliberately quiet: one poster (the template's three-phone gallery cover) in
// a fine gold frame, two blank cards stacked behind it for depth, a story-style
// five-segment bar above it, and a single line of caption below. The segments
// are the control; the poster swipes.
//
// Order is live from `/api/template-meta` (pages created, all time); until it
// answers, the last known top five render so the first paint already has a
// poster. Auto-advance begins on the first interaction, so an audit that never
// interacts measures a still page.

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { templateList } from "@/data/template-registry";
import { useTemplateMeta } from "@/lib/templateMeta";
import { useTemplateAccess } from "@/hooks/useTemplateAccess";
import { coverSmall, coverSrcSet } from "@/lib/templateMedia";

/** Production's top five when this was written — the pre-fetch fallback. */
const FALLBACK = ["apology-dashboard", "bouquet-gf", "love-gf", "birthday-gf", "darling"];
const BY_SLUG = new Map(templateList.map((t) => [t.slug, t]));
const SLIDE_MS = 4500;
const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

const img = (url?: string) => (url && coverSrcSet(url) ? coverSmall(url) : url);
const shortTitle = (t: string) => t.split(/\s[—–-]\s/)[0];

export default function TrendingShowcase() {
  const { ranking } = useTemplateMeta();
  const { hidden } = useTemplateAccess();

  const items = useMemo(() => {
    const order = ranking.length ? ranking.map((r) => r.slug) : FALLBACK;
    return order
      .map((slug) => BY_SLUG.get(slug))
      .filter((t): t is NonNullable<typeof t> => Boolean(t && t.coverImage && !hidden.has(t.slug)))
      .slice(0, 5);
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
      t = setTimeout(() => setAutoStarted(true), 1000);
    };
    events.forEach((e) => window.addEventListener(e, start, { passive: true, once: true }));
    return () => {
      events.forEach((e) => window.removeEventListener(e, start));
      if (t) clearTimeout(t);
    };
  }, []);

  // Warm every poster before it is shown, so a slide never lands on an empty
  // frame. Waits for the first interaction, like the carousel, to keep the
  // initial load lean.
  useEffect(() => {
    if (!autoStarted) return;
    for (const t of items) {
      const im = new Image();
      im.decoding = "async";
      const set = coverSrcSet(t.coverImage);
      if (set) { im.sizes = "(max-width:768px) 72vw, 360px"; im.srcset = set; }
      im.src = img(t.coverImage) || "";
    }
  }, [autoStarted, items]);

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
  const playing = autoStarted && !paused;

  return (
    <div className="tq" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <style>{TQ_CSS}</style>

      {/* Story segments */}
      <div className="tq-bars" role="tablist" aria-label="Trending templates">
        {items.map((t, i) => (
          <button key={t.slug} type="button" role="tab" aria-selected={i === idx} aria-label={`#${i + 1} ${t.title}`} className="tq-bar" onClick={() => go(i)}>
            <span className="tq-barTrack">
              {i < idx && <span className="tq-barFill" style={{ transform: "scaleX(1)" }} />}
              {i === idx && (
                <motion.span
                  key={`f${tick}-${idx}-${playing}`}
                  className="tq-barFill"
                  initial={{ scaleX: playing ? 0 : 1 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: playing ? SLIDE_MS / 1000 : 0, ease: "linear" }}
                />
              )}
            </span>
          </button>
        ))}
      </div>

      {/* Poster */}
      <div className="tq-stack">
        <span className="tq-layer l2" aria-hidden />
        <span className="tq-layer l1" aria-hidden />
        <motion.div className="tq-stage" drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.18} onDragEnd={onDragEnd}>
          <AnimatePresence initial={false} custom={dir} mode="popLayout">
            <motion.div
              key={cur.slug}
              className="tq-card"
              custom={dir}
              variants={{
                enter: (d: number) => ({ opacity: 0, x: d * 40, scale: 0.97 }),
                center: { opacity: 1, x: 0, scale: 1 },
                exit: (d: number) => ({ opacity: 0, x: d * -40, scale: 0.97 }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.55, ease: EASE }}
            >
              <Link href={`/${cur.slug}`} className="tq-link" draggable={false} aria-label={`${cur.title} — open the template`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img(cur.coverImage)}
                  srcSet={coverSrcSet(cur.coverImage)}
                  sizes="(max-width:768px) 72vw, 360px"
                  alt={cur.title}
                  draggable={false}
                  fetchPriority={idx === 0 ? "high" : "auto"}
                  decoding="async"
                />
              </Link>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Caption */}
      <div className="tq-cap">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={cur.slug}
            className="tq-capIn"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3, ease: EASE }}
          >
            <span className="tq-eyebrow">
              <span className="tq-dot" /> Trending · No. {idx + 1} of {n}
            </span>
            <span className="tq-title">{shortTitle(cur.title)}</span>
          </motion.div>
        </AnimatePresence>
        <Link href={`/${cur.slug}`} className="tq-cta">
          Make yours <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  );
}

const TQ_CSS = `
.tq { --tq-w: 340px; position: relative; width: var(--tq-w); max-width: 100%; margin: 0 auto; }
@media (min-width: 1200px) { .tq { --tq-w: 360px; } }
@media (min-width: 769px) and (max-width: 1099px) { .tq { --tq-w: 290px; } }
@media (max-width: 768px) { .tq { --tq-w: min(300px, 78vw); } }

.tq-bars { display: flex; gap: 6px; margin: 0 6px 16px; }
.tq-bar { flex: 1; padding: 8px 0; border: 0; background: none; cursor: pointer; -webkit-tap-highlight-color: transparent; }
.tq-barTrack { position: relative; display: block; height: 3px; border-radius: 3px; background: rgba(61,12,17,.12); overflow: hidden; }
.tq-barFill { position: absolute; inset: 0; background: linear-gradient(90deg, #c9a84c, #8a6a1c); transform-origin: left; border-radius: inherit; }
.tq-bar:hover .tq-barTrack { background: rgba(61,12,17,.2); }

.tq-stack { position: relative; width: 100%; aspect-ratio: 3 / 4; }
.tq-layer { position: absolute; inset: 0; border-radius: 28px; background: #fbf6ef; border: 1px solid rgba(201,168,76,.28);
  box-shadow: 0 20px 40px -30px rgba(42,10,14,.45); }
.tq-layer.l1 { transform: translate(14px, 12px) rotate(3deg); }
.tq-layer.l2 { transform: translate(26px, 22px) rotate(6deg); background: #f4ebe0; opacity: .8; }

.tq-stage { position: absolute; inset: 0; touch-action: pan-y; cursor: grab; }
.tq-stage:active { cursor: grabbing; }
.tq-card { position: absolute; inset: 0; animation: tqFloat 7s ease-in-out infinite; }
.tq-link { position: relative; display: block; width: 100%; height: 100%; border-radius: 28px; overflow: hidden; background: #1a0b0d;
  box-shadow: 0 50px 90px -40px rgba(42,10,14,.75), 0 0 0 1px rgba(201,168,76,.55); -webkit-tap-highlight-color: transparent; }
.tq-link::after { content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;
  box-shadow: inset 0 0 0 6px rgba(255,250,240,.06); }
.tq-link img { width: 100%; height: 100%; object-fit: cover; display: block; user-select: none; -webkit-user-drag: none; transition: transform .8s cubic-bezier(.22,1,.36,1); }
@media (hover: hover) { .tq-link:hover img { transform: scale(1.03); } }

.tq-cap { display: flex; align-items: flex-end; justify-content: space-between; gap: 14px; margin: 26px 4px 0; min-height: 50px; }
.tq-capIn { display: grid; gap: 6px; min-width: 0; }
.tq-eyebrow { display: inline-flex; align-items: center; gap: 7px; font: 600 10.5px/1 Inter, system-ui, sans-serif; letter-spacing: .18em; text-transform: uppercase; color: #8a6a1c; }
.tq-dot { width: 6px; height: 6px; border-radius: 50%; background: #c9a84c; box-shadow: 0 0 0 3px rgba(201,168,76,.2); }
.tq-title { font: 600 24px/1.12 var(--font-playfair), 'Playfair Display', serif; color: #2a0a0e; letter-spacing: -.3px;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.tq-cta { flex: none; display: inline-flex; align-items: center; gap: 6px; padding-bottom: 3px; color: #3d0c11; text-decoration: none;
  font: 700 12px/1 Inter, system-ui, sans-serif; letter-spacing: .12em; text-transform: uppercase; border-bottom: 1.5px solid rgba(61,12,17,.35); transition: border-color .2s; }
.tq-cta span { transition: transform .2s ease; }
.tq-cta:hover { border-color: #3d0c11; }
.tq-cta:hover span { transform: translateX(3px); }
@media (max-width: 768px) { .tq-title { font-size: 20px; } .tq-cap { margin-top: 22px; } }

@keyframes tqFloat { 0%, 100% { translate: 0 0; } 50% { translate: 0 -6px; } }
@media (prefers-reduced-motion: reduce) { .tq-card { animation: none; } }
`;
