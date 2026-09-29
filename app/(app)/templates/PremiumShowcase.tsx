"use client";

// ─── The Premium tab's chrome ────────────────────────────────────────────────
//
// Everything that makes the Premium tab feel like a different, quieter, more
// expensive room than the rest of the gallery: the dark backdrop with gold dust,
// the hero, the auto-rotating spotlight, the "what you get" strip, and the
// small teaser the Freemium tab uses to point here.
//
// Performance rules, same as the cards: every animation is transform/opacity,
// there is no backdrop-filter anywhere, the grain is one static tiled image and
// the dust is a couple of dozen 2px dots. Reduced motion stops all of it.

import { memo, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight, ChevronLeft, ChevronRight, Crown, Images, Lock, Palette, ScrollText, Smartphone, WandSparkles,
} from "lucide-react";
import { EVENTS } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";
import type { TemplateListItem } from "@/types/template-config";

/** The Premium room's palette: near-black aubergine with champagne gold. */
export const LUX = {
  bg: "#0c0709",
  bgDeep: "#07040a",
  plum: "#1f0f1d",
  gold: "#e6c77e",
  goldDeep: "#b8893a",
  ivory: "#f6ecd9",
  muted: "rgba(246,236,217,0.64)",
  faint: "rgba(246,236,217,0.42)",
  line: "rgba(230,199,126,0.2)",
};

const SPOT_MS = 6000;

// Fixed positions so the dust is identical on every render (no Math.random in
// render). [left %, top %, size px, duration s, delay s]
const DUST: [number, number, number, number, number][] = [
  [6, 18, 2, 11, 0], [14, 62, 1.5, 14, 3], [22, 34, 2.5, 12, 6], [31, 80, 1.5, 15, 1],
  [38, 12, 2, 13, 8], [46, 52, 1.5, 10, 4], [53, 26, 2.5, 16, 2], [61, 72, 2, 12, 7],
  [68, 40, 1.5, 14, 5], [74, 8, 2, 11, 9], [81, 58, 2.5, 13, 0.5], [88, 30, 1.5, 15, 6.5],
  [94, 76, 2, 12, 3.5], [10, 90, 2, 16, 10], [57, 92, 1.5, 13, 11], [85, 88, 2, 14, 2.5],
  [27, 4, 1.5, 12, 5.5], [42, 70, 2, 15, 9.5],
];

/** The fixed dark room behind the Premium tab. Fades in over the cream page. */
export const PremiumBackdrop = memo(function PremiumBackdrop({ active }: { active: boolean }) {
  return (
    <div className={`pxRoom${active ? " isOn" : ""}`} aria-hidden>
      <div className="pxGlow" />
      <div className="pxGrain" />
      {active && (
        <div className="pxDust">
          {DUST.map(([l, t, s, d, delay], i) => (
            <span
              key={i}
              style={{ left: `${l}%`, top: `${t}%`, width: s, height: s, animationDuration: `${d}s`, animationDelay: `${-delay}s` }}
            />
          ))}
        </div>
      )}
    </div>
  );
});

/** The Premium tab's opening: eyebrow, title, promise. */
export function PremiumHero({ count, compact }: { count: number; compact: boolean }) {
  return (
    <motion.header
      className={`pxHero${compact ? " isCompact" : ""}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <p className="pxEyebrow">
        <span className="pxRule" aria-hidden />
        <Crown size={12} aria-hidden /> SubhSandesh Premium
        <span className="pxRule isRight" aria-hidden />
      </p>
      <h1 className="pxTitle">
        The Premium <em>Collection.</em>
      </h1>
      <p className="pxSub">Real apps, cloned to the pixel — then made to fall in love.</p>
      {!compact && (
        <ul className="pxMeta">
          <li><strong>{count}</strong> signature templates</li>
          <li>AI writes every word</li>
          <li>Private link + password</li>
        </ul>
      )}
    </motion.header>
  );
}

/** A large, slowly rotating showcase of one premium template at a time. */
export function PremiumSpotlight({ items }: { items: TemplateListItem[] }) {
  const reduce = useReducedMotion();
  const [raw, setRaw] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [docHidden, setDocHidden] = useState(false);
  const n = items.length;
  const idx = n ? raw % n : 0;
  const paused = hovered || docHidden || Boolean(reduce) || n < 2;

  useEffect(() => {
    const fn = () => setDocHidden(document.hidden);
    document.addEventListener("visibilitychange", fn);
    return () => document.removeEventListener("visibilitychange", fn);
  }, []);

  useEffect(() => {
    if (paused) return;
    const t = window.setTimeout(() => setRaw((v) => (v + 1) % n), SPOT_MS);
    return () => window.clearTimeout(t);
  }, [idx, paused, n]);

  if (!n) return null;
  const cur = items[idx];
  const back1 = items[(idx + 1) % n];
  const back2 = items[(idx + 2) % n];
  const go = (d: number) => setRaw((v) => (v + d + n) % n);
  const pad = (v: number) => String(v).padStart(2, "0");

  return (
    <section
      className="pxSpot"
      aria-roledescription="carousel"
      aria-label="Premium spotlight"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
    >
      <div className="pxSpotEdge" aria-hidden />

      {/* The cover deck */}
      <div className="pxDeck">
        {n > 2 && (
          <div className="pxDeckCard isBack2" aria-hidden>
            {back2.coverImage && <Image src={back2.coverImage} alt="" fill sizes="220px" className="object-cover" />}
          </div>
        )}
        {n > 1 && (
          <div className="pxDeckCard isBack1" aria-hidden>
            {back1.coverImage && <Image src={back1.coverImage} alt="" fill sizes="240px" className="object-cover" />}
          </div>
        )}
        <Link
          href={`/${cur.slug}`}
          className="pxDeckCard isFront"
          aria-label={`Open ${cur.title}`}
          onClick={() => track(EVENTS.TEMPLATE_CARD_CLICKED, { template: cur.slug, position: idx, is_premium: true })}
        >
          <AnimatePresence initial={false}>
            <motion.div
              key={cur.slug}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduce ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] }}
            >
              {cur.coverImage && (
                <Image src={cur.coverImage} alt={cur.title} fill sizes="(max-width:768px) 40vw, 320px" className="object-cover" priority />
              )}
            </motion.div>
          </AnimatePresence>
          <span className="pxDeckShine" aria-hidden />
        </Link>
      </div>

      {/* The words */}
      <div className="pxSpotText">
        <p className="pxSpotKicker">
          Spotlight <span>{pad(idx + 1)} / {pad(n)}</span>
        </p>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={cur.slug}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: reduce ? 0 : 0.35, ease: [0.22, 1, 0.36, 1] }}
            aria-live="polite"
          >
            <h2 className="pxSpotTitle">{cur.title}</h2>
            <p className="pxSpotDesc">{cur.description}</p>
          </motion.div>
        </AnimatePresence>
        <div className="pxSpotActions">
          <Link
            href={`/${cur.slug}`}
            className="pxCta"
            onClick={() => track(EVENTS.TEMPLATE_CARD_CLICKED, { template: cur.slug, position: idx, is_premium: true })}
          >
            Make yours <ArrowRight size={15} aria-hidden />
          </Link>
          {n > 1 && (
            <div className="pxArrows">
              <button type="button" onClick={() => go(-1)} aria-label="Previous template"><ChevronLeft size={16} /></button>
              <button type="button" onClick={() => go(1)} aria-label="Next template"><ChevronRight size={16} /></button>
            </div>
          )}
        </div>
        {n > 1 && (
          <div className="pxBars">
            {items.map((t, i) => (
              <button
                key={t.slug}
                type="button"
                className={`pxBar${i < idx ? " isDone" : ""}`}
                aria-label={`Show ${t.title}`}
                aria-current={i === idx}
                onClick={() => setRaw(i)}
              >
                {i === idx && (
                  <span key={`${t.slug}-${raw}`} className="pxBarFill" style={{ animationPlayState: paused ? "paused" : "running" }} />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

const PERKS = [
  { Icon: Smartphone, title: "Real-app clones", body: "Streaming apps, caller screens, store listings — rebuilt to the pixel." },
  { Icon: WandSparkles, title: "AI writes every word", body: "Answer a few questions. It drafts every line, in your voice." },
  { Icon: ScrollText, title: "Full-screen letters", body: "Your message, set in the theme of the app it lives in." },
  { Icon: Images, title: "Photos with notes", body: "Pin a memory and a line to every picture you add." },
  { Icon: Palette, title: "Custom themes", body: "Colours and moods tuned to the person opening it." },
  { Icon: Lock, title: "Link + password", body: "One private link. Only the person with the password gets in." },
];

/** "What you get with Premium". */
export function PremiumPerks() {
  return (
    <section className="pxPerks" aria-labelledby="px-perks-h">
      <p className="pxEyebrow isSmall">
        <span className="pxRule" aria-hidden />Included<span className="pxRule isRight" aria-hidden />
      </p>
      <h2 id="px-perks-h" className="pxPerksTitle">What you get with <em>Premium</em></h2>
      <ul className="pxPerkGrid">
        {PERKS.map(({ Icon, title, body }) => (
          <li key={title} className="pxPerk">
            <span className="pxPerkIcon"><Icon size={18} aria-hidden /></span>
            <div>
              <h3>{title}</h3>
              <p>{body}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** The Freemium tab's invitation into the Premium tab. */
export function PremiumTeaser({ items, count, onExplore }: { items: TemplateListItem[]; count: number; onExplore: () => void }) {
  const covers = items.filter((t) => t.coverImage).slice(0, 3);
  return (
    <button type="button" className="pxTeaser" onClick={onExplore} aria-label={`Explore the Premium collection, ${count} templates`}>
      <span className="pxTeaserSheen" aria-hidden />
      <span className="pxTeaserCrown" aria-hidden><Crown size={18} /></span>
      <span className="pxTeaserText">
        <span className="pxTeaserKicker">New · The Premium Collection</span>
        <span className="pxTeaserTitle">{count} real apps, cloned to the pixel.</span>
        <span className="pxTeaserSub">AI writes every word. Themed letters, photos with notes, a private link.</span>
      </span>
      <span className="pxTeaserFan" aria-hidden>
        {covers.map((t, i) => (
          <span key={t.slug} className={`pxFan f${i}`}>
            <Image src={t.coverImage!} alt="" fill sizes="80px" className="object-cover" />
          </span>
        ))}
      </span>
      <span className="pxTeaserGo">Explore <ArrowRight size={14} aria-hidden /></span>
    </button>
  );
}

export const PREMIUM_TAB_CSS = `
/* ── the room ─────────────────────────────────────────────────────────── */
.pxRoom { position: fixed; inset: 0; z-index: 0; pointer-events: none; opacity: 0; transition: opacity .55s ease;
  background: radial-gradient(120% 70% at 50% -10%, #2a1128 0%, ${LUX.plum} 34%, ${LUX.bg} 70%, ${LUX.bgDeep} 100%); }
.pxRoom.isOn { opacity: 1; }
.pxGlow { position: absolute; inset: 0;
  background: radial-gradient(40% 30% at 82% 22%, rgba(230,199,126,.10), transparent 70%),
              radial-gradient(38% 34% at 10% 78%, rgba(120,40,90,.18), transparent 72%); }
.pxGrain { position: absolute; inset: 0; opacity: .07;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }
.pxDust span { position: absolute; border-radius: 50%; background: #f3d98f; box-shadow: 0 0 6px 1px rgba(243,217,143,.55);
  opacity: 0; animation: pxDust linear infinite; }
@keyframes pxDust { 0% { opacity: 0; transform: translate3d(0,0,0); } 15% { opacity: .85; } 70% { opacity: .5; } 100% { opacity: 0; transform: translate3d(14px,-140px,0); } }

/* ── hero ─────────────────────────────────────────────────────────────── */
.pxHero { text-align: center; margin: 6px auto 30px; max-width: 1040px; }
@media (min-width: 768px) { .pxHero { margin-bottom: 44px; } }
.pxHero.isCompact { margin-bottom: 18px; }
.pxEyebrow { display: inline-flex; align-items: center; gap: 8px; margin: 0 0 14px; color: ${LUX.gold};
  font: 700 10.5px/1 'Inter', system-ui, sans-serif; letter-spacing: .32em; text-transform: uppercase; }
.pxEyebrow.isSmall { margin-bottom: 10px; }
.pxRule { width: 38px; height: 1px; background: linear-gradient(90deg, transparent, ${LUX.gold}); }
.pxRule.isRight { background: linear-gradient(270deg, transparent, ${LUX.gold}); }
.pxTitle { margin: 0; color: ${LUX.ivory}; font: 500 clamp(40px, 6vw, 76px)/1 'Playfair Display', serif; letter-spacing: -.03em; }
.pxHero.isCompact .pxTitle { font-size: clamp(32px, 5.6vw, 56px); }
.pxTitle em { font-style: italic; background: linear-gradient(100deg, #f7e3a6 0%, #e6c77e 35%, #b8893a 62%, #f1d489 100%);
  -webkit-background-clip: text; background-clip: text; color: transparent; padding-right: .06em; }
.pxSub { margin: 14px auto 0; max-width: 34ch; color: ${LUX.muted}; font: 400 clamp(14px, 1.6vw, 17px)/1.55 'Inter', system-ui, sans-serif; }
.pxMeta { list-style: none; display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin: 20px 0 0; padding: 0; }
.pxMeta li { padding: 7px 13px; border-radius: 99px; border: 1px solid ${LUX.line}; background: rgba(255,255,255,.03);
  color: ${LUX.muted}; font: 600 11.5px/1 'Inter', system-ui, sans-serif; }
.pxMeta strong { color: ${LUX.gold}; }

/* ── spotlight ────────────────────────────────────────────────────────── */
.pxSpot { position: relative; display: grid; grid-template-columns: 40% 1fr; gap: 16px; align-items: center;
  margin: 0 auto 40px; max-width: 1080px; padding: 16px; border-radius: 24px; isolation: isolate;
  background: linear-gradient(140deg, rgba(64,26,58,.55) 0%, rgba(24,12,22,.82) 55%, rgba(14,8,12,.9) 100%);
  border: 1px solid rgba(230,199,126,.18); box-shadow: 0 40px 80px -40px rgba(0,0,0,.9), inset 0 1px 0 rgba(255,240,200,.07); }
.pxSpotEdge { position: absolute; inset: 0; border-radius: inherit; pointer-events: none; z-index: -1;
  background: radial-gradient(60% 80% at 20% 50%, rgba(230,199,126,.13), transparent 70%); }
.pxDeck { position: relative; aspect-ratio: 3/4; }
.pxDeckCard { position: absolute; inset: 0; border-radius: 14px; overflow: hidden; background: #140a12;
  box-shadow: 0 24px 50px -20px rgba(0,0,0,.85), 0 0 0 1px rgba(230,199,126,.28); }
.pxDeckCard.isBack1, .pxDeckCard.isBack2 { display: none; }
.pxDeckCard.isFront { display: block; z-index: 2; }
.pxDeckShine { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.pxDeckShine::before { content: ""; position: absolute; top: -20%; bottom: -20%; width: 40%; left: -60%; transform: skewX(-18deg);
  background: linear-gradient(100deg, transparent, rgba(255,244,210,.35), transparent); animation: pxSweep 6s cubic-bezier(.4,0,.2,1) infinite; }
@keyframes pxSweep { 0%, 60% { transform: translateX(0) skewX(-18deg); } 90%, 100% { transform: translateX(480%) skewX(-18deg); } }
.pxSpotText { min-width: 0; }
.pxSpotKicker { margin: 0 0 8px; color: ${LUX.gold}; font: 700 9.5px/1 'Inter', system-ui, sans-serif; letter-spacing: .28em; text-transform: uppercase; }
.pxSpotKicker span { color: ${LUX.faint}; margin-left: 6px; letter-spacing: .12em; }
.pxSpotTitle { margin: 0; color: ${LUX.ivory}; font: 600 clamp(22px, 3.6vw, 46px)/1.04 'Playfair Display', serif; letter-spacing: -.02em; }
.pxSpotDesc { margin: 8px 0 0; color: ${LUX.muted}; font: 400 12.5px/1.5 'Inter', system-ui, sans-serif;
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
.pxSpotActions { display: flex; align-items: center; gap: 10px; margin-top: 14px; }
.pxCta { display: inline-flex; align-items: center; gap: 7px; padding: 10px 16px; border-radius: 99px; text-decoration: none;
  background: linear-gradient(135deg, #fbecc0 0%, #e6c77e 45%, #b8893a 100%); color: #241505;
  font: 800 12.5px/1 'Inter', system-ui, sans-serif; letter-spacing: .02em;
  box-shadow: 0 10px 26px -10px rgba(230,199,126,.6), inset 0 1px 0 rgba(255,255,255,.6); transition: transform .25s cubic-bezier(.22,1,.36,1); }
.pxCta:hover { transform: translateY(-2px); }
.pxCta:active { transform: scale(.97); }
.pxArrows { display: none; gap: 6px; }
.pxArrows button { width: 38px; height: 38px; border-radius: 50%; display: grid; place-items: center; cursor: pointer;
  color: ${LUX.ivory}; background: rgba(255,255,255,.04); border: 1px solid ${LUX.line}; transition: transform .2s ease; }
.pxArrows button:hover { transform: scale(1.06); }
.pxBars { display: flex; gap: 4px; margin-top: 16px; }
.pxBar { position: relative; flex: 1; height: 14px; padding: 0; border: 0; background: none; cursor: pointer; }
.pxBar::before { content: ""; position: absolute; left: 0; right: 0; top: 6px; height: 2px; border-radius: 2px; background: rgba(246,236,217,.16); }
.pxBar.isDone::before { background: rgba(230,199,126,.7); }
.pxBarFill { position: absolute; left: 0; right: 0; top: 6px; height: 2px; border-radius: 2px; background: ${LUX.gold};
  transform-origin: left; transform: scaleX(0); animation: pxFill ${SPOT_MS}ms linear forwards; }
@keyframes pxFill { to { transform: scaleX(1); } }
@media (min-width: 768px) {
  .pxSpot { grid-template-columns: 1fr minmax(240px, 32%); gap: 40px; padding: 36px 48px; border-radius: 32px; margin-bottom: 64px; }
  .pxDeck { order: 2; margin: 0 26px 0 0; }
  .pxDeckCard { border-radius: 20px; }
  .pxDeckCard.isBack1 { display: block; transform: translate(18%, 3%) rotate(7deg) scale(.9); opacity: .55; }
  .pxDeckCard.isBack2 { display: block; transform: translate(-14%, 4%) rotate(-7deg) scale(.86); opacity: .35; }
  .pxSpotKicker { font-size: 10.5px; margin-bottom: 14px; }
  .pxSpotDesc { font-size: 15.5px; margin-top: 14px; max-width: 46ch; -webkit-line-clamp: 3; }
  .pxSpotActions { margin-top: 26px; gap: 14px; }
  .pxCta { padding: 14px 24px; font-size: 14px; }
  .pxArrows { display: flex; }
  .pxBars { margin-top: 30px; max-width: 420px; }
}

/* ── grid heading ─────────────────────────────────────────────────────── */
.pxGridHead { display: flex; align-items: center; gap: 14px; margin: 0 auto 18px; max-width: 1080px; color: ${LUX.gold};
  font: 700 10.5px/1 'Inter', system-ui, sans-serif; letter-spacing: .28em; text-transform: uppercase; }
.pxGridHead::before, .pxGridHead::after { content: ""; flex: 1; height: 1px; background: linear-gradient(90deg, transparent, rgba(230,199,126,.4), transparent); }
.pxGrid { max-width: 1080px; margin: 0 auto; }
.pxGrid .pmFrame { box-shadow: 0 26px 50px -26px rgba(0,0,0,.95), 0 0 34px -14px rgba(230,199,126,.35); }
@media (hover: hover) { .pxGrid .pmFrame:hover { box-shadow: 0 34px 60px -24px rgba(0,0,0,.95), 0 0 46px -10px rgba(230,199,126,.5); } }

/* ── perks ────────────────────────────────────────────────────────────── */
.pxPerks { max-width: 1080px; margin: 56px auto 8px; text-align: center; }
.pxPerksTitle { margin: 0 0 22px; color: ${LUX.ivory}; font: 500 clamp(28px, 4.4vw, 46px)/1.05 'Playfair Display', serif; letter-spacing: -.02em; }
.pxPerksTitle em { font-style: italic; color: ${LUX.gold}; }
.pxPerkGrid { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: 1fr; gap: 10px; text-align: left; }
.pxPerk { display: flex; gap: 14px; align-items: flex-start; padding: 16px; border-radius: 18px;
  background: linear-gradient(160deg, rgba(255,255,255,.045), rgba(255,255,255,.015)); border: 1px solid rgba(230,199,126,.14); }
.pxPerkIcon { flex-shrink: 0; width: 40px; height: 40px; border-radius: 12px; display: grid; place-items: center; color: #2a1906;
  background: linear-gradient(135deg, #fbecc0, #e6c77e 50%, #b8893a); box-shadow: 0 8px 20px -10px rgba(230,199,126,.7); }
.pxPerk h3 { margin: 1px 0 4px; color: ${LUX.ivory}; font: 700 14.5px/1.25 'Inter', system-ui, sans-serif; }
.pxPerk p { margin: 0; color: ${LUX.muted}; font: 400 13px/1.5 'Inter', system-ui, sans-serif; }
@media (min-width: 600px) { .pxPerkGrid { grid-template-columns: 1fr 1fr; gap: 12px; } }
@media (min-width: 1024px) { .pxPerkGrid { grid-template-columns: repeat(3, 1fr); gap: 16px; } .pxPerk { padding: 22px; } }

/* ── freemium teaser ──────────────────────────────────────────────────── */
.pxTeaser { position: relative; display: flex; align-items: center; gap: 12px; width: 100%; max-width: 1080px; margin: 0 auto 22px;
  padding: 14px; border-radius: 20px; text-align: left; cursor: pointer; overflow: hidden; isolation: isolate;
  background: radial-gradient(90% 140% at 100% 0%, #3a1636 0%, #1a0c18 55%, #0e070b 100%);
  border: 1px solid rgba(230,199,126,.35); box-shadow: 0 18px 40px -22px rgba(42,10,14,.7);
  transition: transform .3s cubic-bezier(.22,1,.36,1); }
.pxTeaser:hover { transform: translateY(-3px); }
.pxTeaser:active { transform: scale(.99); }
.pxTeaser:focus-visible { outline: 2px solid #c9a84c; outline-offset: 3px; }
.pxTeaserSheen { position: absolute; inset: 0; z-index: -1; overflow: hidden; pointer-events: none; }
.pxTeaserSheen::before { content: ""; position: absolute; top: -30%; bottom: -30%; width: 30%; left: -40%; transform: skewX(-18deg);
  background: linear-gradient(100deg, transparent, rgba(255,240,200,.14), transparent); animation: pxTeaseSweep 5.5s ease-in-out infinite; }
@keyframes pxTeaseSweep { 0%, 55% { transform: translateX(0) skewX(-18deg); } 100% { transform: translateX(600%) skewX(-18deg); } }
.pxTeaserCrown { flex-shrink: 0; width: 42px; height: 42px; border-radius: 13px; display: grid; place-items: center; color: #2a1906;
  background: linear-gradient(135deg, #fbecc0, #e6c77e 50%, #b8893a); box-shadow: 0 8px 20px -8px rgba(230,199,126,.7); }
.pxTeaserText { display: flex; flex-direction: column; gap: 3px; min-width: 0; flex: 1; }
.pxTeaserKicker { color: ${LUX.gold}; font: 700 9px/1.2 'Inter', system-ui, sans-serif; letter-spacing: .22em; text-transform: uppercase; }
.pxTeaserTitle { color: ${LUX.ivory}; font: 600 16px/1.2 'Playfair Display', serif; }
.pxTeaserSub { display: none; color: ${LUX.muted}; font: 400 12.5px/1.4 'Inter', system-ui, sans-serif; }
.pxTeaserFan { display: none; position: relative; width: 112px; height: 76px; flex-shrink: 0; }
.pxFan { position: absolute; top: 4px; width: 50px; height: 67px; border-radius: 8px; overflow: hidden;
  box-shadow: 0 10px 20px -8px rgba(0,0,0,.8), 0 0 0 1px rgba(230,199,126,.4); }
.pxFan.f0 { left: 0; transform: rotate(-9deg); }
.pxFan.f1 { left: 31px; transform: translateY(-3px); z-index: 2; }
.pxFan.f2 { left: 62px; transform: rotate(9deg); }
.pxTeaserGo { flex-shrink: 0; display: inline-flex; align-items: center; gap: 5px; padding: 9px 13px; border-radius: 99px;
  background: linear-gradient(135deg, #fbecc0, #e6c77e 50%, #b8893a); color: #241505; font: 800 12px/1 'Inter', system-ui, sans-serif; }
@media (min-width: 640px) {
  .pxTeaser { padding: 18px 22px; gap: 18px; border-radius: 24px; }
  .pxTeaserTitle { font-size: 21px; }
  .pxTeaserSub { display: block; }
  .pxTeaserFan { display: block; }
  .pxTeaserGo { padding: 11px 18px; font-size: 13px; }
}

@media (prefers-reduced-motion: reduce) {
  .pxRoom { transition: none; }
  .pxDust span { animation: none; opacity: .45; }
  .pxDeckShine::before, .pxTeaserSheen::before { animation: none; display: none; }
  .pxBarFill { animation: none; transform: scaleX(1); }
  .pxCta, .pxTeaser, .pxArrows button { transition: none; }
}
`;
