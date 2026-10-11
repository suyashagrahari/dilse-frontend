"use client";

// ─── The Halloween drop page ─────────────────────────────────────────────────
//
// The happy-halloween template's haunted night, full-bleed: a navy-violet sky,
// a giant butter moon and the crooked lavender house with one warm window
// (./HauntedScene), with the offer laid over it on frosted navy glass. Colours
// come from components/promo/halloweenTheme (HW), shared with the strip, the
// blog card and the gallery teaser so the whole drop reads as one place.
//
// The templates below are the season's `sale.slugs` — whatever the super admin
// put in the drop — shown as the real gallery cards (./DropTemplates).
//
// The first paint — the headline — is pure HTML/CSS with an inline-SVG house
// behind it; the GIFs arrive after idle into sized boxes, so nothing shifts.
// Every animation stops under reduced motion.

import { WitchLink } from "@/components/promo/WitchPortal";
import { ArrowRight, Sparkles } from "lucide-react";
import LuxuryMobileTopBrand from "@/components/LuxuryMobileTopBrand";
import IdleGif from "@/components/promo/IdleGif";
import { HW, HW_SKY } from "@/components/promo/halloweenTheme";
import { useSeason } from "@/hooks/useSeason";
import { useNow, countdown, pad2 } from "@/hooks/usePromo";
import { HALLOWEEN_ENDS_AT, HALLOWEEN_GIF } from "@/lib/season";
import { halloweenFaqs } from "./content";
import HauntedScene, { HS_CSS } from "./HauntedScene";
import DropTemplates, { useDropDiscount, useDropTemplates } from "./DropTemplates";
import { useTemplatePricing } from "@/hooks/useTemplatePricing";
import { formatINR } from "@/config/templatePricing";

function Countdown() {
  const t = useNow();
  const c = countdown(HALLOWEEN_ENDS_AT, t || HALLOWEEN_ENDS_AT);
  if (t && c.totalMs <= 0) return null;
  const boxes = [
    { v: c.d, l: "Days" },
    { v: c.h, l: "Hours" },
    { v: c.m, l: "Mins" },
    { v: c.s, l: "Secs" },
  ];
  return (
    <div className="hwoClockWrap">
      <span className="hwoClockKick">The drop vanishes in</span>
      <div className="hwoClock" role="timer" aria-label={t ? `Ends in ${c.d} days ${c.h} hours ${c.m} minutes` : "Ends 31 October"}>
        {boxes.map((b, i) => (
          <span key={b.l} className="hwoCell">
            <b>{t ? pad2(b.v) : "--"}</b>
            <small>{b.l}</small>
            {i < 3 && <i aria-hidden>:</i>}
          </span>
        ))}
      </div>
    </div>
  );
}

function SmallBat() {
  return (
    <svg viewBox="0 0 64 32" width="22" height="11" aria-hidden>
      <path d="M32 10 C29 6 27 6 26 9 C22 4 14 3 6 6 C10 8 12 12 11 16 C15 13 20 14 22 18 C25 15 28 16 32 22 C36 16 39 15 42 18 C44 14 49 13 53 16 C52 12 54 8 58 6 C50 3 42 4 38 9 C37 6 35 6 32 10 Z" fill="currentColor" />
    </svg>
  );
}

export default function HalloweenOfferClient() {
  const season = useSeason();
  const on = season?.mode === "halloween";
  const seasonPct = on && season.sale.enabled ? season.sale.percent : 0;
  const slugs = season?.sale.slugs;
  const drop = useDropTemplates(slugs);
  // The super admin's numbers: the season percent, unless every template in the
  // drop carries its own discount (from /payment/pricing) — then that one, or
  // "up to" the largest when they differ. Never computed here.
  const own = useDropDiscount(drop);
  const pct = on ? (own?.pct ?? seasonPct) : 0;
  const upTo = Boolean(on && own?.upTo);
  const pctText = `${upTo ? "up to " : ""}${pct}%`;
  const faqs = halloweenFaqs(pct, upTo);
  // The paid entry point: the cheapest priced template in the drop, at the
  // price the super admin set ("From ₹49"). Until prices land, a plain "Make yours".
  const { pricingFor, settled } = useTemplatePricing();
  const cheapest = settled
    ? drop
        .map((t) => ({ t, p: pricingFor(t.slug) }))
        .filter(({ p }) => p && !p.isFree && p.finalPrice > 0)
        .sort((a, b) => a.p.finalPrice - b.p.finalPrice)[0]
    : undefined;
  const first = cheapest?.t ?? drop[0];
  const n = drop.length;
  const countWord = n === 1 ? "one" : n === 2 ? "two" : n === 3 ? "three" : n === 4 ? "four" : String(n);

  return (
    <div className="hwo">
      <style>{HWO_CSS + HS_CSS}</style>
      <LuxuryMobileTopBrand />

      <section className="hwoHero" aria-labelledby="hwo-title">
        <HauntedScene />
        <div className="hwoHeroIn">
          <span className="hwoKick"><SmallBat /> {on ? <>Halloween drop<span className="hwoKickX"> · till 31 Oct</span></> : "The Halloween collection"} <SmallBat /></span>
          <h1 id="hwo-title" className="hwoTitle">
            <span className="hwoTitleA">Halloween Drop</span>
            {pct ? (
              <span className="hwoTitleB">{upTo && <small className="hwoUpTo">up to</small>}<span className="hwoPct">{pct}%</span><small>OFF</small></span>
            ) : (
              <span className="hwoTitleC">Will you be my boo?</span>
            )}
          </h1>
          <p className="hwoSub hwoSubLong">
            Spooky-cute love letters for the one who makes your heart go <em>boo</em> — with your photos, your song and your
            letter.{pct ? " The sale price is applied automatically when you publish." : ""}
          </p>
          {/* Phones get the one-breath version, so the haunted house fits on the first screen. */}
          <p className="hwoSub hwoSubShort">
            Spooky-cute love letters for your <em>boo</em> — your photos, your song, your words.
          </p>
          <div className="hwoGlass">
            {on && <Countdown />}
            <div className="hwoCtas">
              <a href="#hwo-templates" className="hwoBtn primary">
                <span aria-hidden>👻</span>
                <span className="hwoBtnLong">See the {countWord} template{n === 1 ? "" : "s"}</span>
                <span className="hwoBtnShort">See the drop</span>
              </a>
              {first && (
                <WitchLink href={`/${first.slug}`} className="hwoBtn ghost" prefetch={false}>
                  {cheapest ? <>From <b className="hwoFrom">{formatINR(cheapest.p.finalPrice)}</b></> : "Make yours"} <ArrowRight size={16} aria-hidden />
                </WitchLink>
              )}
            </div>
            <p className="hwoTrust"><Sparkles size={13} aria-hidden /> {pct ? `${pctText} off till 31 Oct · ` : ""}one-time payment · ready in 2 minutes</p>
          </div>
        </div>
      </section>

      <section className="hwoSec" id="hwo-templates" aria-labelledby="hwo-two">
        <p className="hwoSecKick"><span aria-hidden>🕷️</span> The drop</p>
        <h2 id="hwo-two" className="hwoSecTitle">
          {n === 2 ? <>Two ways to say <em>boo</em></> : <>Pick your <em>haunt</em></>}
        </h2>
        <p className="hwoSecSub">
          Pick one, write your letter (AI can help), add photos and a song, and send them one link.
          {pct ? (upTo ? ` Templates here are up to ${pct}% off till 31 October.` : ` Every template here is ${pct}% off till 31 October.`) : ""}
        </p>
        <div className="hwoFrame">
          <DropTemplates slugs={slugs} />
        </div>
      </section>

      <section className="hwoSec" aria-labelledby="hwo-how">
        <h2 id="hwo-how" className="hwoSecTitle">Three steps, <em>no tricks</em></h2>
        <ol className="hwoSteps">
          <li><span className="hwoStepIc">🎃</span><b>Pick your haunt</b><span>Any template in the drop — the ✦ Premium ones included.</span></li>
          <li><span className="hwoStepIc">🕯️</span><b>Make it yours</b><span>Your letter, your photos, your song — see every scene before you publish.</span></li>
          <li><span className="hwoStepIc">💌</span><b>Send the link</b><span>Publish{pct ? ` at ${pctText} off` : ""} and share it — WhatsApp, Instagram or a QR code.</span></li>
        </ol>
      </section>

      <section className="hwoSec" aria-labelledby="hwo-faq">
        <h2 id="hwo-faq" className="hwoSecTitle">Questions from <em>the crypt</em></h2>
        <div className="hwoFaq">
          {faqs.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="hwoEnd" aria-labelledby="hwo-end">
        <IdleGif src={HALLOWEEN_GIF("corner-web-spider.webp")} width={280} height={362} className="hwoEndWeb" />
        <span className="hwoEndMoon" aria-hidden />
        <h2 id="hwo-end" className="hwoEndTitle">Don&apos;t ghost them <em>this Halloween</em></h2>
        <p className="hwoSub">{on ? "The drop vanishes at midnight on 31 October." : "Spooky love letters, ready in minutes."}</p>
        <div className="hwoCtas">
          {drop.slice(0, 2).map((t, i) => (
            <WitchLink key={t.slug} href={`/${t.slug}`} className={`hwoBtn ${i === 0 ? "primary" : "ghost"}`} prefetch={false}>
              <span aria-hidden>{i === 0 ? "🏚️" : "👻"}</span> {t.title}
            </WitchLink>
          ))}
        </div>
        <div className="hwoEndGround" aria-hidden>
          <IdleGif src={HALLOWEEN_GIF("grave-zombie-hand.webp")} width={150} height={139} className="hwoEndGrave" />
          <IdleGif src={HALLOWEEN_GIF("pumpkin-light-up.webp")} width={240} height={240} className="hwoEndPumpkin" />
        </div>
      </section>
    </div>
  );
}

const HWO_CSS = `
.hwoFrom { font-weight: 800; color: #ffb35c; margin-left: 2px; }
.hwo { position: relative; min-height: 100vh; overflow-x: clip; color: ${HW.text}; padding: 0 0 110px;
  background: linear-gradient(180deg, ${HW.sky1} 0%, ${HW.sky2} 38%, #100c1e 100%); }
.hwo em { font-style: italic; color: ${HW.pumpkin}; }

/* ── hero: the full-bleed haunted night ───────────────────────────────── */
.hwoHero { position: relative; isolation: isolate; overflow: hidden; padding: 64px 16px 340px; background: ${HW_SKY}; }
.hwoHero::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 90px; z-index: 1; pointer-events: none;
  background: linear-gradient(180deg, transparent, ${HW.sky1}); }
.hwoHeroIn { position: relative; z-index: 4; max-width: 600px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; text-align: center; }
.hwoKick { white-space: nowrap; display: inline-flex; align-items: center; gap: 8px; padding: 8px 14px; border-radius: 999px; color: ${HW.moon};
  border: 1px solid ${HW.glassEdge}; background: ${HW.glass}; -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
  font: 800 10.5px/1 'Inter', sans-serif; letter-spacing: .2em; text-transform: uppercase; }
.hwoKick svg { color: ${HW.lilac}; }
.hwoTitle { margin: 18px 0 0; display: flex; flex-direction: column; align-items: center; gap: 4px; }
.hwoTitleA { font: 700 clamp(38px, 7vw, 76px)/1 var(--font-cinzel), 'Cinzel', 'Playfair Display', serif; letter-spacing: .02em; color: ${HW.text};
  text-shadow: 0 0 30px rgba(185,166,240,.45), 0 3px 0 ${HW.ink}; }
.hwoTitleB { display: inline-flex; align-items: flex-start; gap: 8px; }
.hwoPct { font: 800 clamp(80px, 17vw, 168px)/.9 var(--font-playfair), 'Playfair Display', serif;
  background: linear-gradient(180deg, #fff1c9 13%, ${HW.window} 38%, ${HW.pumpkin} 59%, ${HW.pumpkinDeep} 83%); -webkit-background-clip: text; background-clip: text; color: transparent;
  filter: drop-shadow(0 6px 34px rgba(255,154,60,.55)); animation: hwoFlicker 5s ease-in-out infinite;
  /* background-clip:text only paints inside the padding box, and the tight .9 line box
     is shorter than Playfair's digits: pad the box so the 9's tail and the % are painted,
     then pull the margins back so the layout (and the one-screen hero) is unchanged. */
  padding: .1em .04em .2em; margin: -.1em -.04em -.2em; }
.hwoTitleB small { margin-top: .5em; font: 800 clamp(18px, 3vw, 30px)/1 'Inter', sans-serif; letter-spacing: .16em; color: ${HW.moon}; }
.hwoTitleB .hwoUpTo { letter-spacing: .1em; text-transform: uppercase; }
@keyframes hwoFlicker { 0%, 46%, 100% { opacity: 1; } 47% { opacity: .7; } 48% { opacity: 1; } 51% { opacity: .82; } 52% { opacity: 1; } }
.hwoTitleC { font: italic 600 clamp(28px, 4.6vw, 48px)/1.1 var(--font-playfair), 'Playfair Display', serif; color: ${HW.pumpkin}; text-shadow: 0 0 26px rgba(255,154,60,.5); }
.hwoSub { max-width: 32rem; margin: 16px auto 0; font: 400 15px/1.6 'Inter', sans-serif; color: ${HW.muted}; text-shadow: 0 1px 12px rgba(23,19,42,.9); }
.hwoSub em { color: ${HW.window}; }
.hwoGlass { width: 100%; max-width: 440px; margin-top: 22px; padding: 18px 16px 16px; border-radius: 26px; display: flex; flex-direction: column; align-items: center;
  background: ${HW.glass}; -webkit-backdrop-filter: blur(16px) saturate(130%); backdrop-filter: blur(16px) saturate(130%);
  box-shadow: inset 0 0 0 1px ${HW.glassEdge}, inset 0 1px 0 rgba(255,255,255,.08), 0 30px 60px -30px rgba(5,3,14,.95); }
.hwoClockWrap { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 10px; margin-bottom: 18px; }
.hwoClockKick { font: 700 10px/1 'Inter', sans-serif; letter-spacing: .22em; text-transform: uppercase; color: ${HW.lilac}; }
.hwoClock { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; width: 100%; }
.hwoCell { position: relative; display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 12px 0 10px; border-radius: 16px;
  background: rgba(16,12,30,.55); box-shadow: inset 0 0 0 1px rgba(185,166,240,.18), inset 0 -10px 20px -14px rgba(255,154,60,.35); }
.hwoCell b { font: 800 26px/1 'Inter', sans-serif; font-variant-numeric: tabular-nums; color: #fff; text-shadow: 0 0 16px rgba(255,195,90,.45); }
.hwoCell small { font: 700 9px/1 'Inter', sans-serif; letter-spacing: .16em; text-transform: uppercase; color: ${HW.moon}; opacity: .85; }
.hwoCell i { position: absolute; right: -7px; top: 12px; font: 800 18px/1 'Inter', sans-serif; font-style: normal; color: rgba(226,216,250,.35); }
.hwoCtas { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
.hwoBtn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 15px 22px; border-radius: 999px; text-decoration: none;
  font: 800 14.5px/1 'Inter', sans-serif; transition: transform .2s ease, box-shadow .2s ease; }
.hwoBtn.primary { color: #1e1230; background: linear-gradient(180deg, #ffd08f, ${HW.pumpkin}); box-shadow: 0 14px 30px -12px rgba(255,154,60,.95), inset 0 1px 0 rgba(255,255,255,.5); }
.hwoBtn.ghost { color: ${HW.text}; background: rgba(185,166,240,.1); box-shadow: inset 0 0 0 1.5px rgba(185,166,240,.5); }
.hwoBtn:hover { transform: translateY(-2px); }
.hwoTrust { display: inline-flex; align-items: center; gap: 6px; margin: 14px 0 0; font: 500 12px/1.4 'Inter', sans-serif; color: rgba(226,216,250,.6); }

/* ── sections ─────────────────────────────────────────────────────────── */
.hwoSec { position: relative; max-width: 1180px; margin: 0 auto; padding: 56px 16px 0; text-align: center; }
.hwoSecKick { display: inline-flex; align-items: center; gap: 6px; margin: 0 0 8px; color: ${HW.pumpkin}; font: 800 11px/1 'Inter', sans-serif; letter-spacing: .22em; text-transform: uppercase; }
.hwoSecTitle { margin: 0; font: 600 clamp(28px, 4.4vw, 44px)/1.1 var(--font-playfair), 'Playfair Display', serif; color: ${HW.text}; }
.hwoSecSub { max-width: 36rem; margin: 10px auto 0; font: 400 14.5px/1.6 'Inter', sans-serif; color: ${HW.muted}; }
.hwoFrame { position: relative; margin: 0 -4px; }
.hwoSteps { display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; margin: 26px 0 0; padding: 0; list-style: none; text-align: left; }
.hwoSteps li { display: grid; grid-template-columns: 48px 1fr; grid-template-rows: auto auto; column-gap: 14px; row-gap: 3px; align-items: center; padding: 16px 18px; border-radius: 20px;
  background: ${HW.glass}; -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px); box-shadow: inset 0 0 0 1px ${HW.glassEdge}; }
.hwoStepIc { grid-row: 1 / 3; width: 48px; height: 48px; border-radius: 16px; display: grid; place-items: center; font-size: 24px; background: rgba(255,154,60,.14); box-shadow: inset 0 0 0 1px rgba(255,154,60,.25); }
.hwoSteps b { font: 700 16px/1.2 'Inter', sans-serif; color: ${HW.text}; }
.hwoSteps li > span:last-child { font: 400 13.5px/1.5 'Inter', sans-serif; color: ${HW.muted}; }
.hwoFaq { max-width: 760px; margin: 24px auto 0; display: flex; flex-direction: column; gap: 10px; text-align: left; }
.hwoFaq details { border-radius: 18px; background: ${HW.glass}; -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px); box-shadow: inset 0 0 0 1px ${HW.glassEdge}; }
.hwoFaq details[open] { box-shadow: inset 0 0 0 1px rgba(255,154,60,.45), 0 0 30px -12px rgba(255,154,60,.4); }
.hwoFaq summary { cursor: pointer; list-style: none; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 18px; font: 600 15px/1.4 'Inter', sans-serif; color: ${HW.text}; }
.hwoFaq summary::-webkit-details-marker { display: none; }
.hwoFaq summary::after { content: "🕸️"; flex: none; }
.hwoFaq details[open] summary::after { content: "👻"; }
.hwoFaq p { margin: 0; padding: 0 18px 16px; font: 400 14px/1.6 'Inter', sans-serif; color: ${HW.muted}; }

.hwoEnd { position: relative; isolation: isolate; overflow: hidden; max-width: 1180px; margin: 64px 12px 0; padding: 52px 20px 160px; border-radius: 30px; text-align: center;
  background: radial-gradient(60% 50% at 50% 115%, rgba(255,154,60,.32), transparent 70%), ${HW_SKY};
  box-shadow: inset 0 0 0 1px ${HW.glassEdge}, 0 40px 80px -40px rgba(0,0,0,.9); }
.hwoEnd .hwoCtas { margin-top: 22px; }
.hwoEndWeb { position: absolute; top: 0; right: 0; z-index: -1; width: 96px; height: 124px; pointer-events: none; }
.hwoEndMoon { position: absolute; z-index: -1; top: 16px; left: 16px; width: 40px; height: 40px; border-radius: 50%;
  background: radial-gradient(circle at 38% 36%, #fffbe6, ${HW.moon} 55%, #ead48a); box-shadow: 0 0 50px 14px ${HW.moonGlow}; }
.hwoEndTitle { margin: 0; font: 600 clamp(28px, 5vw, 48px)/1.1 var(--font-playfair), 'Playfair Display', serif; color: ${HW.text}; }
.hwoEndGround { position: absolute; left: 0; right: 0; bottom: 0; height: 130px; pointer-events: none; z-index: -1;
  background: radial-gradient(70% 100% at 50% 100%, rgba(10,7,20,.9), transparent 75%); }
.hwoEndGrave { position: absolute; left: 7%; bottom: 0; width: 112px; height: 104px; }
.hwoEndPumpkin { position: absolute; right: 7%; bottom: 0; width: 104px; height: 104px; }

.hwoSubShort, .hwoBtnShort { display: none; }
@media (max-width: 767px) {
  /* The layout shell pads 96px under every page for the tab bar; paint it night, not cream. */
  .hwo { margin-bottom: -96px; padding-bottom: 200px; }
  /* The night starts at y=0: the hero slides up under the mobile brand bar's
     84px spacer, so the sky and the corner webs run to the very top edge. */
  .hwoHero { margin-top: -84px; padding: 86px 14px 0; min-height: max(640px, calc(100svh - 34px)); }
  .hwoHero::after { height: 60px; }
  .hwoKick { padding: 7px 12px; font-size: 9.5px; }
  .hwoTitle { margin-top: 12px; gap: 0; }
  .hwoTitleA { font-size: clamp(30px, 9vw, 40px); }
  .hwoPct { font-size: clamp(64px, 19vw, 84px); }
  .hwoTitleB small { font-size: 16px; }
  .hwoSubLong { display: none; }
  .hwoSubShort { display: block; max-width: 22rem; margin-top: 8px; font-size: 14px; line-height: 1.5; }
  /* compact glass: a slim clock and the two buttons side by side */
  .hwoGlass { margin-top: 14px; padding: 12px 12px 12px; border-radius: 22px; max-width: 380px; }
  .hwoClockWrap { gap: 7px; margin-bottom: 11px; }
  .hwoClockKick { font-size: 9px; }
  .hwoClock { gap: 6px; }
  .hwoCell { gap: 4px; padding: 8px 0 7px; border-radius: 12px; }
  .hwoCell b { font-size: 21px; }
  .hwoCell small { font-size: 8px; }
  .hwoCell i { top: 8px; right: -5.5px; font-size: 14px; }
  .hwoGlass .hwoCtas { flex-wrap: nowrap; gap: 8px; width: 100%; }
  .hwoGlass .hwoBtn { flex: 1 1 0; min-width: 0; padding: 13px 10px; font-size: 13.5px; white-space: nowrap; }
  .hwoGlass .hwoTrust { display: none; }
  .hwoBtnLong { display: none; }
  .hwoBtnShort { display: inline; }
}
@media (max-width: 420px) { .hwoKickX { display: none; } }
@media (min-width: 640px) {
  .hwoHero { padding: 100px 32px 380px; }
  .hwoSteps { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .hwoSteps li { grid-template-columns: 1fr; grid-template-rows: auto; text-align: center; justify-items: center; padding: 22px 18px; }
  .hwoStepIc { grid-row: auto; }
  .hwoEndWeb { width: 150px; height: 194px; }
  .hwoEndMoon { top: 30px; left: 8%; width: 64px; height: 64px; }
}
@media (min-width: 768px) {
  .hwoEnd { margin: 80px auto 0; border-radius: 40px; }
}
@media (min-width: 1024px) {
  /* desktop: copy on the left, the house on the right, one full-bleed night that is
     exactly one screen (the floating navbar included): every size keys on the
     viewport height as well as its width, so 1280×720 and 1920×1080 both fit. */
  .hwoHero { height: 100vh; height: 100svh; min-height: 600px; box-sizing: border-box; display: flex; align-items: center;
    padding: clamp(80px, 11.5vh, 116px) 0 clamp(18px, 4vh, 48px); }
  .hwoHeroIn { margin: 0 0 0 max(6vw, calc((100vw - 1240px) / 2)); max-width: min(600px, 46vw); align-items: flex-start; text-align: left; }
  .hwoKick { padding: clamp(6px, .9vh, 8px) 13px; font-size: clamp(9.5px, 1.35vh, 10.5px); }
  .hwoTitle { align-items: flex-start; margin-top: clamp(8px, 1.8vh, 18px); gap: 0; }
  .hwoTitleA { font-size: clamp(40px, min(4.4vw, 7.2vh), 70px); white-space: nowrap; }
  .hwoPct { font-size: clamp(72px, min(10.5vw, 15.5vh), 160px); margin-bottom: -.13em; }
  .hwoTitleB small { font-size: clamp(16px, 2.7vh, 28px); }
  .hwoUpTo { margin-right: 2px; }
  .hwoHero .hwoSub { margin: clamp(6px, 1.4vh, 14px) 0 0; font-size: clamp(13.5px, 1.95vh, 16px); line-height: 1.55; max-width: 30rem; }
  .hwoGlass { align-items: stretch; max-width: 460px; margin-top: clamp(12px, 2.4vh, 24px); padding: clamp(12px, 2.1vh, 22px) clamp(16px, 2vh, 22px) clamp(11px, 1.8vh, 18px); }
  .hwoGlass .hwoCtas { justify-content: flex-start; }
  .hwoClockWrap { align-items: flex-start; gap: clamp(6px, 1.1vh, 10px); margin-bottom: clamp(9px, 1.9vh, 18px); }
  .hwoCell { padding: clamp(7px, 1.25vh, 12px) 0 clamp(6px, 1.05vh, 10px); gap: clamp(3px, .6vh, 6px); }
  .hwoCell b { font-size: clamp(21px, 3.3vh, 30px); }
  .hwoCell i { top: clamp(7px, 1.25vh, 12px); }
  .hwoBtn { padding: clamp(11px, 1.75vh, 15px) 22px; }
  .hwoTrust { align-self: flex-start; margin-top: clamp(8px, 1.5vh, 14px); }
  .hwoEndGrave { width: 150px; height: 139px; }
  .hwoEndPumpkin { width: 140px; height: 140px; }
}
@media (prefers-reduced-motion: reduce) {
  .hwoPct { animation: none !important; }
}
`;
