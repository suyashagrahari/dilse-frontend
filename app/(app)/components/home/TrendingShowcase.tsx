"use client";

// ─── Hero: the five most-created templates, on a laptop ──────────────────────
//
// The real desktop page of each trending template, shown on a laptop, with a
// slim #1–#5 ranking beside it (below it on tablet and phone). The ranking is
// the control and fills like a progress bar while it plays; the screen swipes.
//
// Screens are 1440×900 captures of each template's live demo, stored at
// templates/<slug>/desktop-v1[@720w|@1280w].webp. A few pages open on a dim
// intro at that size, so those use the hand-picked stills the old hero had.
// Pages with no good desktop still (unfinished templates) are left out.
//
// Order is live from `/api/template-meta`; until it answers, the last known top
// five render so the first paint already has a screen. Auto-advance begins on
// the first interaction, so an audit that never interacts measures a still page.

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { templateList } from "@/data/template-registry";
import { useTemplateMeta, compactCount } from "@/lib/templateMeta";
import { useTemplateAccess } from "@/hooks/useTemplateAccess";
import { media, templateMedia } from "@/lib/templateMedia";

/** Templates with a captured desktop still (templates/<slug>/desktop-v1.webp). */
const CAPTURED = new Set([
  "anniversary-parents", "apology-dashboard", "app", "birthday-bestfriend", "birthday-friend", "birthday-parents",
  "bouquet-gf", "call", "capsule", "catch", "challan", "christian-wedding", "court-marriage", "court-of-love",
  "darling", "date-invitation", "dedication", "flags", "happy-ganesh-chaturthi", "happy-rakshabandhan-to-brother",
  "happy-rakshabandhan-to-sister", "hold-my-hand", "kundli-milan", "legal-notice", "love-gf", "loveflix",
  "missyou-bestfriend", "missyou-gf", "nutrition", "photo-puzzle", "product", "profile-pro", "proposal", "recharge",
  "rewind", "searched", "shaadi-card", "streak", "train-ticket", "us", "vending-machine", "watch",
]);
/** Hand-picked stills for pages whose live intro is dim at desktop size. */
const CURATED: Record<string, string> = {
  "birthday-gf": media("homePage/happyBirthday.webp"),
  "holi": media("homePage/holi.webp"),
  "eid-mubarak": media("homePage/eid.webp"),
  "wedding-shaadi": media("homePage/wedding.webp"),
  "anniversary-gf": media("homePage/anniversary.webp"),
  "valentine-gf": media("homePage/valentine.webp"),
};

function screenFor(slug: string): { src: string; srcSet?: string } | null {
  if (CURATED[slug]) return { src: CURATED[slug] };
  if (!CAPTURED.has(slug)) return null;
  const at = (w: number) => templateMedia(slug, `desktop-v1@${w}w.webp`);
  return { src: at(1280), srcSet: `${at(720)} 720w, ${at(1280)} 1280w` };
}

/** Production's top five when this was written — the pre-fetch fallback. */
const FALLBACK = ["apology-dashboard", "bouquet-gf", "love-gf", "birthday-gf", "darling"];
const BY_SLUG = new Map(templateList.map((t) => [t.slug, t]));
const SLIDE_MS = 4500;
const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];
const SIZES = "(max-width:768px) 92vw, (max-width:1099px) 560px, 460px";
const shortTitle = (t: string) => t.split(/\s[—–-]\s/)[0];

export default function TrendingShowcase() {
  const { ranking } = useTemplateMeta();
  const { hidden } = useTemplateAccess();

  const items = useMemo(() => {
    const created = new Map(ranking.map((r) => [r.slug, r.created]));
    const order = ranking.length ? ranking.map((r) => r.slug) : FALLBACK;
    return order
      .map((slug) => {
        const t = BY_SLUG.get(slug);
        const screen = screenFor(slug);
        return t && screen && !hidden.has(slug) ? { ...t, screen, created: created.get(slug) ?? 0 } : null;
      })
      .filter((t): t is NonNullable<typeof t> => Boolean(t))
      .slice(0, 5);
  }, [ranking, hidden]);

  const n = items.length;
  const [active, setActive] = useState(0);
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

  // Warm every screen once the carousel is live, so no slide lands on a blank.
  useEffect(() => {
    if (!autoStarted) return;
    for (const t of items) {
      const im = new Image();
      if (t.screen.srcSet) { im.sizes = SIZES; im.srcset = t.screen.srcSet; }
      im.src = t.screen.src;
    }
  }, [autoStarted, items]);

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
  const playing = autoStarted && !paused;

  return (
    <div className="tl" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <style>{TL_CSS}</style>

      {/* ── Laptop ─────────────────────────────────────────────────────── */}
      <div className="tl-device">
        <div className="tl-glow" aria-hidden />
        <div className="tl-lid">
          <span className="tl-cam" aria-hidden />
          <div className="tl-screen">
            <div className="tl-chrome" aria-hidden>
              <span className="tl-dots"><i /><i /><i /></span>
              <span className="tl-url">
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#4d8f6f" strokeWidth="2.6" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                yourname.subhsandesh.in/
                <AnimatePresence mode="wait" initial={false}>
                  <motion.b key={cur.slug} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.2 }}>
                    {cur.slug}
                  </motion.b>
                </AnimatePresence>
              </span>
            </div>
            <motion.div className="tl-view" drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.12} onDragEnd={onDragEnd}>
              <AnimatePresence initial={false}>
                <motion.div
                  key={cur.slug}
                  className="tl-shot"
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7, ease: EASE }}
                >
                  <Link href={`/${cur.slug}`} draggable={false} aria-label={`${cur.title} — open the template`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={cur.screen.src}
                      srcSet={cur.screen.srcSet}
                      sizes={cur.screen.srcSet ? SIZES : undefined}
                      alt={`${cur.title} on a desktop`}
                      draggable={false}
                      fetchPriority={idx === 0 ? "high" : "auto"}
                      decoding="async"
                    />
                  </Link>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
        <div className="tl-base" aria-hidden><span className="tl-notch" /></div>
        <div className="tl-shadow" aria-hidden />
      </div>

      {/* ── Ranking ────────────────────────────────────────────────────── */}
      <div className="tl-rank">
        <p className="tl-kicker"><span className="tl-live" /> Trending now</p>
        <ol className="tl-list" role="tablist" aria-label="Top trending templates">
          {items.map((t, i) => {
            const on = i === idx;
            return (
              <li key={t.slug} role="presentation">
                <button type="button" role="tab" aria-selected={on} className="tl-row" data-on={on ? "1" : "0"} onClick={() => go(i)}>
                  <span className="tl-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="tl-text">
                    <span className="tl-title">{shortTitle(t.title)}</span>
                    <span className="tl-meta">{t.created >= 100 ? `${compactCount(t.created)} pages made` : i === 0 ? "Most loved" : "Trending"}</span>
                  </span>
                  <span className="tl-track" aria-hidden>
                    {on && (
                      <motion.span
                        key={`p${tick}-${idx}-${playing}`}
                        className="tl-fill"
                        initial={{ scale: playing ? 0 : 1 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: playing ? SLIDE_MS / 1000 : 0, ease: "linear" }}
                      />
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        <Link href={`/${cur.slug}`} className="tl-cta">
          Make yours <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  );
}

const TL_CSS = `
.tl { display: grid; grid-template-columns: minmax(0, 1fr) 184px; gap: 30px; align-items: center; width: 100%; min-width: 0; }

/* Laptop */
.tl-device { position: relative; min-width: 0; padding: 0 4%; }
.tl-glow { position: absolute; left: 50%; top: 45%; width: 110%; aspect-ratio: 1.6; translate: -50% -50%; border-radius: 50%;
  background: radial-gradient(closest-side, rgba(201,168,76,.26), rgba(201,168,76,.06) 60%, transparent); pointer-events: none; }
.tl-lid { position: relative; padding: 3.2% 3.2% 3.6%; border-radius: 18px 18px 6px 6px; background: linear-gradient(180deg, #2a1c1f, #140c0e);
  box-shadow: 0 0 0 1px rgba(255,255,255,.06) inset, 0 30px 60px -30px rgba(42,10,14,.6); }
.tl-cam { position: absolute; top: 1.3%; left: 50%; width: 5px; height: 5px; margin-left: -2.5px; border-radius: 50%; background: #3a2c2f; box-shadow: 0 0 0 1px #0b0607; }
.tl-screen { position: relative; border-radius: 6px; overflow: hidden; background: #f5ede6; }
.tl-chrome { display: flex; align-items: center; gap: 10px; height: 26px; padding: 0 10px; background: #efe7db; border-bottom: 1px solid rgba(61,12,17,.08); }
.tl-dots { display: flex; gap: 5px; flex: none; }
.tl-dots i { width: 7px; height: 7px; border-radius: 50%; background: #f96f5d; }
.tl-dots i:nth-child(2) { background: #f5bf4f; } .tl-dots i:nth-child(3) { background: #52c45a; }
.tl-url { flex: 1; max-width: 70%; margin: 0 auto; display: flex; align-items: center; gap: 5px; height: 17px; padding: 0 9px; border-radius: 5px; background: #fbf7f1;
  font: 500 9.5px/1 Inter, system-ui, sans-serif; color: #8a7a68; white-space: nowrap; overflow: hidden; }
.tl-url b { color: #3d0c11; font-weight: 700; }
.tl-view { position: relative; aspect-ratio: 16 / 10; overflow: hidden; background: #efe6dc; touch-action: pan-y; cursor: grab; }
.tl-view:active { cursor: grabbing; }
.tl-shot { position: absolute; inset: 0; }
.tl-shot a { display: block; width: 100%; height: 100%; }
.tl-shot img { width: 100%; height: 100%; object-fit: cover; object-position: top center; display: block; user-select: none; -webkit-user-drag: none; }
.tl-base { position: relative; height: 14px; margin: 0 -4%; border-radius: 0 0 14px 14px;
  background: linear-gradient(180deg, #e9ded3 0%, #cbbcae 55%, #a99a8c 100%); box-shadow: 0 1px 0 rgba(255,255,255,.6) inset; }
.tl-notch { position: absolute; left: 50%; top: 0; width: 16%; height: 5px; translate: -50% 0; border-radius: 0 0 8px 8px; background: #b6a698; }
.tl-shadow { height: 18px; margin: 0 2%; background: radial-gradient(closest-side, rgba(42,10,14,.28), transparent); filter: blur(4px); }

/* Ranking */
.tl-rank { min-width: 0; }
.tl-kicker { display: flex; align-items: center; gap: 8px; margin: 0 0 12px; font: 700 10.5px/1 Inter, system-ui, sans-serif; letter-spacing: .2em; text-transform: uppercase; color: #8a6a1c; }
.tl-live { width: 7px; height: 7px; border-radius: 50%; background: #e0453c; animation: tlPulse 1.8s infinite; }
.tl-list { list-style: none; margin: 0; padding: 0; display: grid; }
.tl-row { position: relative; display: grid; grid-template-columns: 30px minmax(0, 1fr); align-items: center; gap: 8px; width: 100%;
  padding: 10px 0 10px 14px; border: 0; background: none; cursor: pointer; text-align: left; -webkit-tap-highlight-color: transparent; }
.tl-num { font: 600 18px/1 var(--font-playfair), 'Playfair Display', serif; color: rgba(61,12,17,.28); transition: color .3s; }
.tl-row[data-on="1"] .tl-num { color: #8a6a1c; }
.tl-text { display: grid; gap: 3px; min-width: 0; }
.tl-title { font: 600 14px/1.2 Inter, system-ui, sans-serif; color: #7d5a5a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; transition: color .3s; }
.tl-row[data-on="1"] .tl-title { color: #2a0a0e; font-weight: 700; }
.tl-row:hover .tl-title { color: #2a0a0e; }
.tl-meta { font: 500 11px/1 Inter, system-ui, sans-serif; color: #a88c8c; }
.tl-track { position: absolute; left: 0; top: 8px; bottom: 8px; width: 2px; border-radius: 2px; background: rgba(61,12,17,.1); overflow: hidden; }
.tl-fill { position: absolute; inset: 0; background: linear-gradient(180deg, #c9a84c, #8a6a1c); transform-origin: top; }
.tl-cta { display: inline-flex; align-items: center; gap: 7px; margin: 16px 0 0 14px; padding-bottom: 3px; color: #3d0c11; text-decoration: none;
  font: 700 11.5px/1 Inter, system-ui, sans-serif; letter-spacing: .14em; text-transform: uppercase; border-bottom: 1.5px solid rgba(61,12,17,.3); transition: border-color .2s; }
.tl-cta span { transition: transform .2s ease; }
.tl-cta:hover { border-color: #3d0c11; }
.tl-cta:hover span { transform: translateX(3px); }

/* Tablet + phone: ranking goes under the laptop as a slim strip */
@media (max-width: 1099px) {
  .tl { grid-template-columns: minmax(0, 1fr); gap: 22px; max-width: 580px; margin: 0 auto; }
  .tl-rank { text-align: center; }
  .tl-kicker { justify-content: center; }
  .tl-list { display: flex; gap: 6px; overflow-x: auto; scrollbar-width: none; padding: 2px; }
  .tl-list::-webkit-scrollbar { display: none; }
  .tl-list li { flex: 0 0 auto; }
  .tl-row { grid-template-columns: auto auto; gap: 6px; padding: 9px 13px 11px; border-radius: 99px; background: rgba(255,255,255,.6); box-shadow: 0 0 0 1px rgba(61,12,17,.1); }
  .tl-row[data-on="1"] { background: #fff; box-shadow: 0 0 0 1px rgba(201,168,76,.6), 0 8px 18px -12px rgba(61,12,17,.5); }
  .tl-num { font-size: 13px; }
  .tl-title { font-size: 12.5px; }
  .tl-meta { display: none; }
  .tl-track { left: 14px; right: 14px; top: auto; bottom: 4px; width: auto; height: 2px; }
  .tl-fill { transform-origin: left; }
  .tl-cta { margin: 14px auto 0; }
}
@media (max-width: 768px) {
  .tl-lid { border-radius: 12px 12px 4px 4px; }
  .tl-chrome { height: 20px; gap: 6px; padding: 0 7px; }
  .tl-dots i { width: 5px; height: 5px; }
  .tl-url { height: 13px; font-size: 7.5px; padding: 0 6px; }
  .tl-base { height: 10px; }
}
@keyframes tlPulse { 0% { box-shadow: 0 0 0 0 rgba(224,69,60,.6); } 70% { box-shadow: 0 0 0 7px rgba(224,69,60,0); } 100% { box-shadow: 0 0 0 0 rgba(224,69,60,0); } }
@media (prefers-reduced-motion: reduce) { .tl-live { animation: none; } }
`;
