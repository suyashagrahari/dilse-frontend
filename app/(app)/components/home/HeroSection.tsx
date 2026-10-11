"use client";

import { useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { templateList } from "@/data/template-registry";
import TrendingShowcase from "./TrendingShowcase";
import { useWishlist } from "@/hooks/useWishlist";
import { VALENTINE_CAMPAIGN, VALENTINE_DISCOUNT, VALENTINE_PATH } from "@/lib/wishlist/valentine";
import { useSeason } from "@/hooks/useSeason";
import { DANDIYA_PATH, DIWALI_PATH, HALLOWEEN_PATH } from "@/lib/season";
import HalloweenCritters from "@/components/promo/HalloweenCritters";
import { HalloweenHeroNight } from "@/components/promo/HalloweenCornerWebs";
import FestivalCritters from "@/components/promo/FestivalCritters";
import { FestivalHeroNight } from "@/components/promo/FestivalDecor";
import { Dandiya, Diya, Mirror } from "@/components/promo/festivalArt";

const STATS = [
  { n: "50K+", l: "Pages Created" },
  { n: `${Math.floor(templateList.length / 10) * 10}+`, l: "Templates" },
  { n: "4.9★", l: "Loved Rating" },
];

export default function HeroSection() {
  const router = useRouter();

  const goTemplates = useCallback(() => router.push("/templates"), [router]);
  const goWishlist = useCallback(() => router.push(VALENTINE_PATH), [router]);
  const wishlist = useWishlist(VALENTINE_CAMPAIGN);
  const onList = wishlist.status === "joined";
  // In a drop season the second button is that season's drop instead.
  const season = useSeason();
  const halloween = season?.mode === "halloween";
  const dandiya = season?.mode === "dandiya";
  const diwali = season?.mode === "diwali";
  const dropPct = (halloween || dandiya || diwali) && season.sale.enabled ? season.sale.percent : 0;
  const goHalloween = useCallback(() => router.push(HALLOWEEN_PATH), [router]);
  const goDandiya = useCallback(() => router.push(DANDIYA_PATH), [router]);
  const goDiwali = useCallback(() => router.push(DIWALI_PATH), [router]);
  const avoid = ".hero-btns, .hero-kicker, .hero-copy-pane h1, .hero-desc, .hero-stats, .hero-note, .hwb-wrap, .fsb-wrap";
  return (
    <section id="hero" className="hero-section" style={{
      background: '#f5ede6', display: 'flex', alignItems: 'center',
      paddingTop: 131, paddingBottom: 57, position: 'relative', overflow: 'hidden', width: '100%'
    }}>
      {/* Subtle radial glow */}
      <div style={{ position: 'absolute', top: '18%', right: '12%', width: 560, height: 560, borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,168,76,0.08) 0%,transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '12%', left: '4%', width: 320, height: 320, borderRadius: '50%', background: 'radial-gradient(circle,rgba(61,12,17,0.04) 0%,transparent 70%)', pointerEvents: 'none' }} />

      {/* Halloween mode: a moonlit night behind the hero (moon, fog, corner
          webs) and waves of ghosts, spiders and bats. Decoration only — CSS and
          inline SVG behind the content; the GIFs load right after mount and
          keep clear of the buttons; off under reduced motion. */}
      <HalloweenHeroNight />
      <HalloweenCritters scope="parent" avoid={avoid} />
      {/* Navratri Dandiya mode: a kumkum-red garba wash (bandhani dots, a
          mirror mandala, mirror-work torans with hanging sticks) and waves of
          the dancing panda, twirling sticks, mirror flashes and marigolds.
          Diwali mode: a maroon-gold glow (fairy lights, marigold garlands with
          hanging diyas) and waves of diyas, lanterns, fireworks, rangoli and
          the sparkler penguin. Same rules as the Halloween layer. */}
      <FestivalHeroNight kind="dandiya" />
      <FestivalCritters kind="dandiya" scope="parent" avoid={avoid} />
      <FestivalHeroNight kind="diwali" />
      <FestivalCritters kind="diwali" scope="parent" avoid={avoid} />

      <div className="hero-inner" style={{ maxWidth: 1240, margin: '0 auto', padding: '0 40px', position: 'relative', zIndex: 1, width: '100%', minWidth: 0, boxSizing: 'border-box' }}>
        <div className="hero-grid">

          {/* LEFT: Text Panel */}
          <div className="hero-copy-pane">
            <motion.div className="hero-kicker" initial={false} style={{ marginBottom: 22 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                border: '1.5px solid rgba(61,12,17,0.18)', padding: '7px 18px', borderRadius: 999,
                fontSize: 11, fontWeight: 600, letterSpacing: '2.5px', color: '#6b4545',
                background: 'rgba(255,255,255,0.55)', backdropFilter: 'blur(8px)'
              }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#c9a84c', display: 'inline-block', animation: 'shimmer 2s infinite' }} />
                INDIA&apos;S #1 CELEBRATION STUDIO
              </span>
            </motion.div>

            {/* Static (no entrance animation) — this is the mobile LCP element, so
                it paints immediately at full opacity instead of fading in after a
                delay. Font is the self-hosted, preloaded next/font Playfair. */}
            <h1 className="hero-title"
              style={{
                fontFamily: "var(--font-playfair),'Playfair Display',serif",
                fontSize: 'clamp(34px,3.4vw,54px)', fontWeight: 600,
                color: '#2a0a0e', lineHeight: 1.08, letterSpacing: '-1.6px', marginBottom: 14, textWrap: 'balance'
              }}>
              Every Wish Becomes a<br />
              <em style={{ color: '#8a6a1c', fontStyle: 'italic' }}>Beautiful</em>{' '}
              <span style={{ position: 'relative', display: 'inline-block' }}>
                Memory
                <motion.div
                  initial={false}
                  style={{
                    position: 'absolute', bottom: -4, left: 0, right: 0, height: 3,
                    background: 'linear-gradient(90deg,#c9a84c,rgba(201,168,76,0.2))',
                    transformOrigin: 'left'
                  }} />
              </span>
            </h1>

            <motion.p className="hero-desc"
              initial={false}
              style={{ fontSize: 15, color: '#6b4545', maxWidth: 430, lineHeight: 1.68, marginBottom: 22 }}>
              Design a stunning celebration page in minutes — photos, music, heartfelt messages &amp; a live countdown, all on one link you share with everyone you love.
            </motion.p>

            {/* Stats strip */}
            <motion.div
              initial={false}
              className="hero-stats"
              style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 26 }}>
              {STATS.map((s, i) => (
                <div key={s.n} style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                  <div>
                    <div style={{ fontFamily: "var(--font-playfair),'Playfair Display',serif", fontSize: 24, fontWeight: 700, color: '#2a0a0e', lineHeight: 1 }}>{s.n}</div>
                    <div style={{ fontSize: 10.5, color: '#7d5a5a', letterSpacing: '0.5px', marginTop: 3 }}>{s.l}</div>
                  </div>
                  {i < STATS.length - 1 && (
                    <div style={{ width: 1, height: 30, background: 'rgba(61,12,17,0.15)' }} />
                  )}
                </div>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={false}
              className="hero-btns"
              style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 18 }}>
              <motion.button
                whileHover={{ scale: 1.03, backgroundColor: '#2a0809' }}
                whileTap={{ scale: 0.97 }}
                onClick={goTemplates}
                style={{ background: '#3d0c11', color: '#f5ede6', border: 'none', padding: '15px 30px', fontSize: 11, fontWeight: 700, letterSpacing: '1.6px', cursor: 'pointer', transition: 'background-color 0.22s', borderRadius: 4 }}>
                🎉 CREATE YOUR PAGE
              </motion.button>
              {halloween ? (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={goHalloween}
                  className="hero-wish hero-boo"
                  aria-label={dropPct ? `The Halloween drop — ${dropPct}% off` : "The Halloween drop"}>
                  <span className="hero-wish-h" aria-hidden>🎃</span>
                  HALLOWEEN DROP
                  {dropPct > 0 && <span className="hero-wish-off">{dropPct}% OFF</span>}
                </motion.button>
              ) : dandiya ? (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={goDandiya}
                  className="hero-wish hero-dandiya"
                  aria-label={dropPct ? `The Navratri Dandiya drop — ${dropPct}% off` : "The Navratri Dandiya drop"}>
                  <span className="hero-dd-sticks" aria-hidden><Dandiya size={20} /></span>
                  <span className="hero-fest-s">DANDIYA DROP</span>
                  <span className="hero-fest-l">NAVRATRI DANDIYA DROP</span>
                  {dropPct > 0 && <span className="hero-wish-off"><Mirror size={11} /> {dropPct}% OFF</span>}
                </motion.button>
              ) : diwali ? (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={goDiwali}
                  className="hero-wish hero-diwali"
                  aria-label={dropPct ? `The Diwali drop — ${dropPct}% off` : "The Diwali drop"}>
                  <span className="hero-fest-d" aria-hidden><Diya size={18} /></span>
                  DIWALI DROP
                  {dropPct > 0 && <span className="hero-wish-off">{dropPct}% OFF</span>}
                </motion.button>
              ) : season?.mode === "valentine" ? (
                // The Valentine's week wishlist — joining happens on its page.
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={goWishlist}
                  className={`hero-wish${onList ? " is-on" : ""}`}
                  aria-label={onList ? "You're on the Valentine's week wishlist" : `Join the Valentine's week wishlist — ${VALENTINE_DISCOUNT}% off`}>
                  <span className="hero-wish-h" aria-hidden>{onList ? "💖" : "💌"}</span>
                  {onList ? "ON THE VALENTINE LIST" : "VALENTINE WISHLIST"}
                  {!onList && <span className="hero-wish-off">{VALENTINE_DISCOUNT}% OFF</span>}
                </motion.button>
              ) : null}
            </motion.div>

            <motion.p className="hero-note"
              initial={false}
              style={{ fontSize: 12, color: '#7d5a5a', letterSpacing: '0.3px' }}>
              No design skills needed &nbsp;•&nbsp; Ready in under 2 minutes
            </motion.p>
          </div>

          {/* RIGHT: the five most-created templates, live from the gallery ranking */}
          <div className="hero-laptop-wrap" style={{ position: 'relative', width: '100%', minWidth: 0 }}>
            <TrendingShowcase />
          </div>
        </div>
      </div>

      <style>{`
        /* Desktop and tablet: the hero fills exactly one screen (svh so mobile
           browser chrome never pushes it past the fold). Phones keep a natural,
           scrollable height — see the max-width: 768px rules in globals/home.css. */
        @media (min-width: 769px) {
          .hero-section { min-height: 100vh; min-height: 100svh; }
        }
        /* Wide screens: let the content grow with the screen instead of
           sitting in a 1320px island. */
        @media (min-width: 1700px) {
          .hero-inner { max-width: 1400px !important; padding: 0 48px !important; }
          .hero-title { font-size: clamp(52px, 2.9vw, 56px) !important; }
          .hero-desc { font-size: 17px !important; max-width: 500px !important; }
        }
        @media (min-width: 1100px) {
          /* Copy and devices sit as one compact, centred group: the copy column
             hugs its text and the pair is centred, so neither side drifts to an edge. */
          .hero-grid { grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr) !important; gap: 32px !important; }
        }
        /* Two columns: the kicker lines up with the top edge of the browser window. */
        @media (min-width: 769px) {
          .hero-grid { align-items: start !important; }
        }
        .hero-wish { position: relative; display: inline-flex; align-items: center; justify-content: center; gap: 8px; overflow: hidden;
          background: linear-gradient(135deg, #fff6f3, #ffe7e2); color: #7a1028; border: 1.5px solid rgba(179,36,63,0.35);
          padding: 15px 18px 15px 20px; font-size: 11px; font-weight: 700; letter-spacing: 1.6px; cursor: pointer; border-radius: 4px;
          box-shadow: 0 10px 24px -16px rgba(179,36,63,0.6); }
        .hero-wish::after { content: ""; position: absolute; top: 0; bottom: 0; width: 34%; left: 0; transform: translateX(-147%) skewX(-20deg);
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.75), transparent); animation: heroWishSheen 4s ease-in-out infinite; }
        /* transform, not left: an animated left is reported as a layout shift every frame */
        @keyframes heroWishSheen { 0%, 60% { transform: translateX(-147%) skewX(-20deg); } 92%, 100% { transform: translateX(382%) skewX(-20deg); } }
        .hero-wish-h { font-size: 14px; letter-spacing: 0; animation: heroWishBeat 1.8s ease-in-out infinite; display: inline-block; }
        @keyframes heroWishBeat { 0%, 100% { transform: scale(1); } 14% { transform: scale(1.22); } 28% { transform: scale(1); } 42% { transform: scale(1.14); } 56% { transform: scale(1); } }
        .hero-wish-off { padding: 4px 7px; border-radius: 99px; background: #b3243f; color: #fff4f1; font-size: 9.5px; letter-spacing: 1px; }
        .hero-wish.is-on { background: #fff; }
        /* Halloween: the haunted-house navy night (components/promo/halloweenTheme.ts), glowing, with the pumpkin pill. */
        .hero-boo { background: linear-gradient(135deg, #17132a 0%, #2b2245 55%, #3b2f62 100%); color: #f3eefe; border-color: rgba(185,166,240,.55);
          box-shadow: 0 0 0 1px rgba(185,166,240,.18), 0 10px 26px -12px rgba(23,19,42,.9), 0 0 22px -2px rgba(185,166,240,.55), inset 0 -10px 18px -12px rgba(255,154,60,.75);
          animation: heroBooGlow 3s ease-in-out infinite; }
        .hero-boo .hero-wish-off { background: linear-gradient(180deg, #ffc37a, #ff9a3c 60%, #e36b1c); color: #2a1206; box-shadow: 0 0 0 1px rgba(255,214,150,.7), 0 0 12px rgba(255,154,60,.75); }
        .hero-boo::after { background: linear-gradient(90deg, transparent, rgba(255,195,90,.32), transparent); }
        @keyframes heroBooGlow { 50% { box-shadow: 0 0 0 1px rgba(185,166,240,.28), 0 10px 26px -12px rgba(23,19,42,.9), 0 0 30px 2px rgba(255,154,60,.5), inset 0 -10px 18px -12px rgba(255,154,60,.9); } }
        /* Navratri Dandiya (components/promo/festivalTheme.ts): kumkum red with a row of
           mirror-work studs along both edges, crossed sticks that click and a marigold pill. */
        .hero-dandiya { background:
            radial-gradient(circle, #f4f7fb 0 1.6px, #d4a537 1.9px 2.5px, transparent 2.8px) 6px 3px / 14px 7px repeat-x,
            radial-gradient(circle, #f4f7fb 0 1.6px, #d4a537 1.9px 2.5px, transparent 2.8px) 13px calc(100% - 3px) / 14px 7px repeat-x,
            radial-gradient(120% 140% at 0% 100%, rgba(255,176,0,.35), transparent 55%),
            linear-gradient(135deg, #7a0f12 0%, #b3121b 55%, #d0162a 100%);
          color: #fff6ea; border-color: rgba(255,214,120,.75); letter-spacing: 1.3px; padding-left: 14px; padding-right: 14px;
          box-shadow: 0 0 0 1px rgba(255,61,154,.25), 0 10px 26px -12px rgba(90,7,12,.9), 0 0 22px -2px rgba(255,61,154,.5), inset 0 -10px 18px -12px rgba(255,176,0,.9);
          animation: heroDdGlow 2.6s ease-in-out infinite; }
        .hero-dandiya .hero-wish-off { display: inline-flex; align-items: center; gap: 4px; background: linear-gradient(180deg, #ffe6a6, #ffb000 60%, #e07800); color: #3a0508;
          box-shadow: 0 0 0 1px rgba(255,230,166,.8), 0 0 12px rgba(255,176,0,.85); }
        .hero-dandiya::after { background: linear-gradient(90deg, transparent, rgba(255,255,255,.45), transparent); }
        .hero-dd-sticks { display: inline-flex; margin: -4px 0; filter: drop-shadow(0 0 5px rgba(255,214,120,.9)); }
        .hero-dd-sticks .ft-stick-l { animation: heroDdL 1.3s ease-in-out infinite; }
        .hero-dd-sticks .ft-stick-r { animation: heroDdR 1.3s ease-in-out infinite; }
        @keyframes heroDdL { 0%, 100% { transform: rotate(-14deg); } 46%, 54% { transform: rotate(4deg); } }
        @keyframes heroDdR { 0%, 100% { transform: rotate(14deg); } 46%, 54% { transform: rotate(-4deg); } }
        @keyframes heroDdGlow { 50% { box-shadow: 0 0 0 1px rgba(255,214,120,.4), 0 10px 26px -12px rgba(90,7,12,.9), 0 0 32px 3px rgba(255,176,0,.55), inset 0 -10px 18px -12px rgba(255,176,0,1); } }
        /* Diwali: a maroon night lit by diya gold — a gold rim, a live diya and the gold pill. */
        .hero-diwali { background: radial-gradient(120% 160% at 50% 120%, rgba(255,190,70,.38), transparent 55%), linear-gradient(135deg, #3a070a 0%, #5e0b10 50%, #8f1416 100%);
          color: #ffe7a8; border-color: rgba(255,207,90,.8); letter-spacing: 1.6px;
          box-shadow: 0 0 0 1px rgba(255,207,90,.25), 0 10px 26px -12px rgba(51,6,10,.9), 0 0 24px -2px rgba(255,190,70,.6), inset 0 -10px 18px -12px rgba(255,190,70,.95);
          animation: heroDwGlow 3s ease-in-out infinite; }
        .hero-diwali .hero-wish-off { background: linear-gradient(180deg, #ffe7a8, #ffc53d 60%, #e8860c); color: #3a0a04; box-shadow: 0 0 0 1px rgba(255,231,168,.8), 0 0 12px rgba(255,190,70,.85); }
        .hero-diwali::after { background: linear-gradient(90deg, transparent, rgba(255,207,90,.4), transparent); }
        @keyframes heroDwGlow { 50% { box-shadow: 0 0 0 1px rgba(255,207,90,.4), 0 10px 26px -12px rgba(51,6,10,.9), 0 0 34px 4px rgba(255,190,70,.6), inset 0 -10px 18px -12px rgba(255,207,90,1); } }
        .hero-fest-l { display: none; }
        @media (max-width: 768px) { .hero-dandiya { letter-spacing: 1.6px; } .hero-fest-s { display: none; } .hero-fest-l { display: inline; } }
        .hero-fest-d { display: inline-flex; margin: -3px 0; filter: drop-shadow(0 0 6px rgba(255,196,77,.95)); }
        .hero-fest-d .fv-flame { animation: heroFestFlick 1.1s ease-in-out infinite alternate; transform-box: fill-box; transform-origin: 50% 100%; }
        @keyframes heroFestFlick { from { transform: scale(1, 1) rotate(-4deg); } to { transform: scale(.86, 1.16) rotate(4deg); } }
        .hero-wish.is-on::after { display: none; }
        @media (prefers-reduced-motion: reduce) { .hero-wish::after, .hero-wish-h, .hero-boo, .hero-dandiya, .hero-diwali, .hero-fest-d .fv-flame, .hero-dd-sticks * { animation: none; } }
        .hero-pills{scrollbar-width:none;-ms-overflow-style:none;scroll-snap-type:x proximity;}
        .hero-pills::-webkit-scrollbar{display:none;}
        .hero-pills button{scroll-snap-align:center;}
        @media (max-width: 768px) {
          .hero-inner { padding: 0 20px !important; }
          .hero-grid { grid-template-columns: 1fr !important; gap: 28px !important; }
          .hero-copy-pane { text-align: center; }
          .hero-copy-pane .hero-stats { justify-content: center; }
          .hero-copy-pane .hero-btns { justify-content: center; }
          .hero-copy-pane .hero-desc { margin-left: auto; margin-right: auto; }
          .hero-copy-pane .hero-kicker { justify-content: center; display: flex; }
          .hero-laptop-wrap { max-width: 480px; margin: 0 auto; }
          /* keep the landscape template fully visible instead of cropping its sides */
          .hero-preview-canvas { height: auto !important; aspect-ratio: 3 / 2; }
          .hero-pills { justify-content: flex-start !important; padding-left: 2px; padding-right: 2px; }
        }
        @media (max-width: 480px) {
          .hero-inner { padding: 0 16px !important; }
          .hero-preview-canvas { aspect-ratio: 4 / 3; }
        }
      `}</style>
    </section>
  );
}
