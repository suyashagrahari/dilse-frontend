"use client";

// ─── Hero: the five most-created templates, as a card deck ───────────────────
//
// Each card is a designed 16:10 showcase of one template — its name, the real
// desktop page in a browser and the real phone screen — rendered offline with
// Puppeteer and stored at templates/<slug>/showcase-v1@{800,1600}w.webp. The
// top five sit in a deck: the front card is the one playing, the next two peek
// out above it, and the rank rides on the card's top-right corner. No text
// beside it; the cards carry everything.
//
// Order is live from `/api/template-meta`; until it answers, the last known top
// five render so the first paint already has a card. Auto-advance begins on the
// first interaction, so an audit that never interacts measures a still page.

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { templateList } from "@/data/template-registry";
import { useTemplateMeta, RANK_BADGES } from "@/lib/templateMeta";
import { useTemplateAccess } from "@/hooks/useTemplateAccess";
import { templateMedia } from "@/lib/templateMedia";

/** Templates with a rendered showcase card. */
const SHOWCASE = new Set([
  "anniversary-gf", "anniversary-parents", "apology-dashboard", "app", "birthday-bestfriend", "birthday-friend",
  "birthday-gf", "birthday-parents", "bouquet-gf", "call", "capsule", "catch", "challan", "christian-wedding",
  "court-marriage", "court-of-love", "darling", "date-invitation", "dedication", "eid-mubarak", "flags",
  "happy-ganesh-chaturthi", "happy-rakshabandhan-to-brother", "happy-rakshabandhan-to-sister", "hold-my-hand", "holi",
  "kundli-milan", "legal-notice", "love-gf", "loveflix", "missyou-bestfriend", "missyou-gf", "nutrition", "photo-puzzle",
  "product", "profile-pro", "proposal", "recharge", "rewind", "searched", "streak", "train-ticket", "us",
  "valentine-gf", "vending-machine", "watch", "wedding-shaadi",
]);
const card = (slug: string) => {
  const at = (w: number) => templateMedia(slug, `showcase-v1@${w}w.webp`);
  return { src: at(800), srcSet: `${at(800)} 800w, ${at(1600)} 1600w` };
};

/** Production's top five when this was written — the pre-fetch fallback. */
const FALLBACK = ["apology-dashboard", "bouquet-gf", "love-gf", "birthday-gf", "darling"];
const BY_SLUG = new Map(templateList.map((t) => [t.slug, t]));
const SLIDE_MS = 4200;
const SIZES = "(max-width:768px) 94vw, (max-width:1099px) 640px, 700px";

export default function TrendingShowcase() {
  const { ranking } = useTemplateMeta();
  const { hidden } = useTemplateAccess();

  const items = useMemo(() => {
    const order = ranking.length ? ranking.map((r) => r.slug) : FALLBACK;
    return order
      .filter((slug) => SHOWCASE.has(slug) && BY_SLUG.has(slug) && !hidden.has(slug))
      .slice(0, 5)
      .map((slug) => ({ ...BY_SLUG.get(slug)!, img: card(slug) }));
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
      t = setTimeout(() => setAutoStarted(true), 900);
    };
    events.forEach((e) => window.addEventListener(e, start, { passive: true, once: true }));
    return () => {
      events.forEach((e) => window.removeEventListener(e, start));
      if (t) clearTimeout(t);
    };
  }, []);

  // Warm every card once the deck is live, so no slide lands on a blank.
  useEffect(() => {
    if (!autoStarted) return;
    for (const t of items) { const im = new Image(); im.sizes = SIZES; im.srcset = t.img.srcSet; im.src = t.img.src; }
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
    if (info.offset.x < -60 || info.velocity.x < -450) go(idx + 1);
    else if (info.offset.x > 60 || info.velocity.x > 450) go(idx - 1);
  };

  if (!n) return null;
  const playing = autoStarted && !paused;

  // Front card + the next two, back to front.
  const deck = [2, 1, 0].filter((k) => k < n).map((k) => ({ k, i: (idx + k) % n }));

  return (
    <div className="td" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <style>{TD_CSS}</style>

      <div className="td-deck">
        <div className="td-glow" aria-hidden />
        <AnimatePresence initial={false} custom={dir}>
          {deck.map(({ k, i }) => {
            const t = items[i];
            const b = RANK_BADGES[i];
            const front = k === 0;
            return (
              <motion.div
                key={t.slug}
                className="td-card"
                data-front={front ? "1" : "0"}
                custom={dir}
                initial={{ opacity: 0, y: -60, scale: 0.8 }}
                animate={{ opacity: k === 2 ? 0.55 : k === 1 ? 0.8 : 1, y: k * -26, scale: 1 - k * 0.06, rotate: 0, x: 0 }}
                exit={{ opacity: 0, x: dir * -140, rotate: dir * -8, scale: 0.96, transition: { duration: 0.45, ease: [0.4, 0, 0.2, 1] } }}
                transition={{ type: "spring", stiffness: 210, damping: 26 }}
                style={{ zIndex: 10 - k }}
                drag={front ? "x" : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.2}
                onDragEnd={front ? onDragEnd : undefined}
              >
                <Link
                  href={`/${t.slug}`}
                  className="td-link"
                  tabIndex={front ? 0 : -1}
                  aria-hidden={!front}
                  draggable={false}
                  aria-label={`#${i + 1} trending: ${t.title} — open the template`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.img.src}
                    srcSet={t.img.srcSet}
                    sizes={SIZES}
                    alt={front ? t.title : ""}
                    draggable={false}
                    fetchPriority={front && i === 0 ? "high" : "auto"}
                    loading={front ? "eager" : "lazy"}
                    decoding="async"
                  />
                  {front && <span className="td-sheen" aria-hidden />}
                </Link>
                <span className={`td-rank td-rank--${b.tone}`}>
                  <span className="td-rankIc">{b.icon}</span>
                  <b>#{i + 1}</b>
                  <span className="td-rankLbl">{b.label}</span>
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Five slim segments — the only control, and they read as "top 5" */}
      <div className="td-segs" role="tablist" aria-label="Top 5 trending templates">
        {items.map((t, i) => (
          <button key={t.slug} type="button" role="tab" aria-selected={i === idx} aria-label={`#${i + 1} ${t.title}`} className="td-seg" onClick={() => go(i)}>
            <span className="td-segTrack">
              {i < idx && <span className="td-segFill" style={{ transform: "scaleX(1)" }} />}
              {i === idx && (
                <motion.span
                  key={`f${tick}-${idx}-${playing}`}
                  className="td-segFill"
                  initial={{ scaleX: playing ? 0 : 1 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: playing ? SLIDE_MS / 1000 : 0, ease: "linear" }}
                />
              )}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

const TD_CSS = `
.td { position: relative; width: 100%; min-width: 0; padding-top: 52px; }
@media (max-width: 768px) { .td { padding-top: 34px; } }

.td-deck { position: relative; width: 100%; aspect-ratio: 16 / 10; }
.td-glow { position: absolute; left: 50%; top: 55%; width: 115%; height: 120%; translate: -50% -50%; border-radius: 50%;
  background: radial-gradient(closest-side, rgba(201,168,76,.28), rgba(122,20,40,.08) 60%, transparent); pointer-events: none; }
.td-card { position: absolute; inset: 0; transform-origin: 50% 0%; will-change: transform; }
.td-card[data-front="1"] { cursor: grab; }
.td-card[data-front="1"]:active { cursor: grabbing; }
.td-link { position: relative; display: block; width: 100%; height: 100%; border-radius: 22px; overflow: hidden; background: #1d0a0f;
  box-shadow: 0 40px 80px -36px rgba(42,10,14,.75), 0 0 0 1px rgba(201,168,76,.4); -webkit-tap-highlight-color: transparent; }
.td-card[data-front="1"] .td-link { box-shadow: 0 50px 100px -40px rgba(42,10,14,.85), 0 0 0 1.5px rgba(230,199,126,.7); }
.td-link img { width: 100%; height: 100%; object-fit: cover; display: block; user-select: none; -webkit-user-drag: none; }
.td-sheen { position: absolute; inset: 0; pointer-events: none; overflow: hidden; border-radius: inherit; }
.td-sheen::before { content: ""; position: absolute; top: -20%; bottom: -20%; width: 26%; left: -40%; transform: skewX(-18deg);
  background: linear-gradient(100deg, transparent, rgba(255,246,220,.28), transparent); animation: tdSweep 5s cubic-bezier(.4,0,.2,1) infinite; }

.td-rank { position: absolute; top: 14px; right: 14px; display: inline-flex; align-items: center; gap: 6px; padding: 6px 13px 6px 6px; border-radius: 99px;
  color: #fff; font: 800 12px/1 Inter, system-ui, sans-serif; box-shadow: 0 10px 24px -8px rgba(0,0,0,.55), inset 0 1px 0 rgba(255,255,255,.45); pointer-events: none; }
.td-rank b { font-size: 14px; font-weight: 900; }
.td-rankIc { width: 22px; height: 22px; border-radius: 50%; display: grid; place-items: center; background: rgba(255,255,255,.25); font-size: 12px; }
.td-rankLbl { font-size: 10px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
.td-card[data-front="0"] .td-rankLbl, .td-card[data-front="0"] .td-rankIc { display: none; }
.td-card[data-front="0"] .td-rank { top: 4px; padding: 3px 9px; box-shadow: none; }
.td-card[data-front="0"] .td-rank b { font-size: 11px; }
.td-rank--gold { background: linear-gradient(135deg, #fff1bf, #e2b44a 45%, #a6751c); color: #3a2505; }
.td-rank--fire { background: linear-gradient(135deg, #ff9a3c, #ff3d3d 60%, #c2185b); }
.td-rank--hot  { background: linear-gradient(135deg, #ff6fb5, #e0287d 55%, #8e1a5a); }
.td-rank--rise { background: linear-gradient(135deg, #9d7bff, #6a3df0 55%, #3b1fa8); }
.td-rank--fan  { background: linear-gradient(135deg, #3ee0c5, #139e9a 55%, #0b5f6b); }

.td-segs { display: flex; gap: 8px; width: min(320px, 70%); margin: 26px auto 0; }
.td-seg { flex: 1; padding: 8px 0; border: 0; background: none; cursor: pointer; -webkit-tap-highlight-color: transparent; }
.td-segTrack { position: relative; display: block; height: 3px; border-radius: 3px; background: rgba(61,12,17,.14); overflow: hidden; }
.td-seg:hover .td-segTrack { background: rgba(61,12,17,.24); }
.td-segFill { position: absolute; inset: 0; border-radius: inherit; background: linear-gradient(90deg, #c9a84c, #8a6a1c); transform-origin: left; }

@media (max-width: 768px) {
  .td-link { border-radius: 16px; }
  .td-rank { top: 9px; right: 9px; padding: 4px 10px 4px 4px; gap: 4px; font-size: 10px; }
  .td-rank b { font-size: 11.5px; }
  .td-rankIc { width: 17px; height: 17px; font-size: 9.5px; }
  .td-rankLbl { font-size: 8.5px; }
  .td-segs { margin-top: 18px; }
}
@keyframes tdSweep { 0%, 60% { left: -40%; } 90%, 100% { left: 130%; } }
@media (prefers-reduced-motion: reduce) { .td-sheen::before { animation: none; } }
`;
