"use client";

// ─── /wedding-offer — the wedding season drop ────────────────────────────────
//
// The festival drop pages' shape (../_festival-offer/FestivalOfferClient), in
// the wedding's daylight instead of a festival night (weddingTheme.ts):
//
//   hero  — ivory and rose-blush silk under a marigold toran with gold jhumkas
//           swaying from it; the bride and groom under a floral arch, peacocks
//           at their feet, rose and marigold petals drifting through. The offer
//           sits on frosted ivory glass in a gold-zari frame: the sale %, the
//           countdown to 31 December, "See the designs" and "From ₹X".
//   drop  — the drop's templates (whatever the super admin put in it, in that
//           order) as the real gallery cards with their sale tags and prices
//           (./WeddingDropTemplates).
//   then  — three steps, the FAQ, and a closing call that also points to the
//           /wedding hub for every other wedding design.
//
// The hub and this page are not duplicates: /wedding is the catalogue (every
// wedding template, filters, the functions journey) and is there all year;
// this page is the SEASON's offer — only the drop's designs, the sale and the
// clock. While the season is on, the hub shows a ribbon that leads here.
//
// The first paint is HTML/CSS/inline SVG plus the couple (the LCP image,
// preloaded by page.tsx); the other art arrives after idle into sized boxes.
// Only transforms and opacity animate; everything stops under reduced motion.

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import LuxuryMobileTopBrand from "@/components/LuxuryMobileTopBrand";
import IdleGif from "@/components/promo/IdleGif";
import { Marigold } from "@/components/promo/festivalArt";
import { WeddingPetals } from "@/components/promo/WeddingDecor";
import { Jhumka, MarigoldToran, Rings } from "@/components/promo/weddingArt";
import { GOLD_TEXT, WEDDING_LUX, wtVars } from "@/components/promo/weddingTheme";
import { useSeason } from "@/hooks/useSeason";
import { useNow, countdown, pad2 } from "@/hooks/usePromo";
import { useDropFree } from "@/hooks/useDropFree";
import { useTemplatePricing } from "@/hooks/useTemplatePricing";
import { dropSaleOf, DROPS, livePercentOf } from "@/lib/season";
import { formatPrice } from "@/config/templatePricing";
import { useAppSelector } from "@/store/hooks";
import { useFestivalDropDiscount, useFestivalDropTemplates } from "../_festival-offer/FestivalDropTemplates";
import WeddingDropTemplates from "./WeddingDropTemplates";
import { weddingFaqs, WEDDING_ENDS_TEXT } from "./content";

function Countdown() {
  const t = useNow();
  const endsAt = DROPS.wedding.endsAt;
  const c = countdown(endsAt, t || endsAt);
  if (t && c.totalMs <= 0) return null;
  const boxes = [
    { v: c.d, l: "Days" },
    { v: c.h, l: "Hours" },
    { v: c.m, l: "Mins" },
    { v: c.s, l: "Secs" },
  ];
  return (
    <div className="wvoClockWrap">
      <span className="wvoClockKick">The season offer ends in</span>
      <div className="wvoClock" role="timer" aria-label={t ? `Ends in ${c.d} days ${c.h} hours ${c.m} minutes` : `Ends on ${WEDDING_ENDS_TEXT}`}>
        {boxes.map((b) => (
          <span key={b.l} className="wvoCell">
            <b>{t ? pad2(b.v) : "--"}</b>
            <small>{b.l}</small>
          </span>
        ))}
      </div>
    </div>
  );
}

const STEPS = [
  { ic: "💍", b: "Pick your design", s: () => "Palace doors, a peacock garden, a lotus temple, a chapel — any card in the drop." },
  { ic: "🌼", b: "Make it yours", s: () => "Names, functions, venues and maps, your photos and song — AI can fill the form for you." },
  { ic: "📲", b: "Send one link", s: (p: string | null) => `Publish${p ? ` at ${p} off` : ""} and share it on WhatsApp, Instagram or as a QR code — guests RSVP per function.` },
];

const WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];

export default function WeddingOfferClient() {
  const season = useSeason();
  const on = season?.mode === "wedding";
  const seasonPct = livePercentOf(season, "wedding");
  const slugs = dropSaleOf(season, "wedding")?.slugs;
  const drop = useFestivalDropTemplates("wedding", slugs);
  // The super admin's numbers: the season percent, unless every design carries
  // its own discount (/payment/pricing) — then that one, or "up to" the largest.
  const own = useFestivalDropDiscount(drop);
  const free = useDropFree("wedding");
  const pct = free ? 0 : on ? (own?.pct ?? seasonPct) : 0;
  const upTo = Boolean(!free && on && own?.upTo);
  const pctText = `${upTo ? "up to " : ""}${pct}%`;
  const faqs = weddingFaqs(pct, upTo, free);
  const { pricingFor, settled } = useTemplatePricing();
  const cheapest = settled
    ? drop
        .map((t) => ({ t, p: pricingFor(t.slug) }))
        .filter(({ p }) => p && !p.isFree && p.finalPrice > 0)
        .sort((a, b) => a.p.finalPrice - b.p.finalPrice)[0]
    : undefined;
  const first = cheapest?.t ?? drop[0];
  const freeFor = useAppSelector((s) => s.auth.user?.publishesFree ?? null);
  const n = drop.length;
  const countWord = WORDS[n] ?? String(n);

  return (
    <div className="wvo" style={wtVars()}>
      <style>{WVO_CSS}</style>
      <LuxuryMobileTopBrand />

      <section className="wvoHero" aria-labelledby="wvo-title">
        <div className="wvoScene" aria-hidden>
          <span className="wvoHaze" />
          <WeddingPetals scope="parent" />
          <IdleGif src={WEDDING_LUX("string-lights-900.webp")} width={900} height={519} className="wvoLights" />
          <span className="wvoStage">
            <span className="wvoArchRing" />
            <IdleGif src={WEDDING_LUX("floral-arch-900.webp")} width={900} height={668} className="wvoArch" />
            <picture className="wvoCouple">
              <source media="(min-width: 768px)" srcSet={WEDDING_LUX("c-wedding-800.webp")} />
              <img src={WEDDING_LUX("c-wedding-600.webp")} alt="" width={334} height={600} fetchPriority="high" decoding="async" />
            </picture>
            <IdleGif src={WEDDING_LUX("peacock-360.webp")} width={360} height={410} className="wvoPeacock l" />
            <IdleGif src={WEDDING_LUX("peacock-flowers-360.webp")} width={196} height={360} className="wvoPeacock r" />
            <IdleGif src={WEDDING_LUX("marigold-pots-260.webp")} width={144} height={260} className="wvoPots" />
          </span>
          <span className="wvoToran"><MarigoldToran n={9} /></span>
          <span className="wvoJh j1"><i /><Jhumka size={30} /></span>
          <span className="wvoJh j2"><i /><Jhumka size={24} /></span>
          <span className="wvoJh j3"><i /><Jhumka size={30} /></span>
          <span className="wvoJh j4"><i /><Jhumka size={24} /></span>
          <span className="wvoHem" />
        </div>

        <div className="wvoHeroIn">
          <span className="wvoKick"><Rings size={16} /> {on ? <>Wedding season drop<span className="wvoKickX"> · till 31 Dec</span></> : "The wedding collection"} <Rings size={16} /></span>
          <h1 id="wvo-title" className="wvoTitle">
            <span className="wvoTitleA">The <i>Wedding</i> Season</span>
            {free ? (
              <span className="wvoTitleB"><span className="wvoPct">FREE</span></span>
            ) : pct ? (
              <span className="wvoTitleB">{upTo && <small className="wvoUpTo">up to</small>}<span className="wvoPct">{pct}%</span><small>OFF</small></span>
            ) : (
              <span className="wvoTitleC">Invitations that open like a celebration</span>
            )}
          </h1>
          <p className="wvoSub wvoSubLong">
            Digital wedding invitations with palace doors, peacock gardens and lotus temples — <em>Haldi to reception on one link</em>, RSVP for every function, your photos and your music.
            {free ? " Free to make and send — no payment." : pct ? " The sale price is applied automatically when you publish." : ""}
          </p>
          <p className="wvoSub wvoSubShort">Palace doors, peacocks &amp; lotus temples — <em>every function on one link</em>, RSVP included.</p>
          <div className="wvoGlass">
            {on && <Countdown />}
            <div className="wvoCtas">
              {n > 0 ? (
                <a href="#wvo-templates" className="wvoBtn primary">
                  <Rings size={17} />
                  <span className="wvoBtnLong">See the {n === 1 ? "design" : `${countWord} designs`}</span>
                  <span className="wvoBtnShort">See the drop</span>
                </a>
              ) : (
                <Link href="/wedding" className="wvoBtn primary">Browse wedding designs <ArrowRight size={16} aria-hidden /></Link>
              )}
              {first && (
                <Link href={`/${first.slug}`} className="wvoBtn ghost" prefetch={false}>
                  {free ? <>Make yours · <b className="wvoFrom">free</b></> : cheapest && freeFor ? <>Make yours · <b className="wvoFrom">free for you</b></> : cheapest ? <>From <b className="wvoFrom">{formatPrice(cheapest.p)}</b></> : "Make yours"} <ArrowRight size={16} aria-hidden />
                </Link>
              )}
            </div>
            <p className="wvoTrust"><Sparkles size={13} aria-hidden /> {free ? "Free to make & send · no payment · RSVP included" : <>{pct ? `${pctText} off till 31 Dec · ` : ""}one-time payment · RSVP included</>}</p>
          </div>
        </div>
      </section>

      <section className="wvoSec" id="wvo-templates" aria-labelledby="wvo-drop">
        <p className="wvoSecKick"><Marigold size={14} /> The drop <Marigold size={14} /></p>
        <h2 id="wvo-drop" className="wvoSecTitle">{n === 1 ? <>One invitation, <em>every function</em></> : <>Pick your <em>wedding invitation</em></>}</h2>
        <p className="wvoSecSub">
          Fill it in (AI can help), add your functions, photos and song, and send your guests one link.
          {free ? ` ${n === 1 ? "It is" : "Every design here is"} free to make and send till 31 December.` : pct ? (upTo ? ` Designs here are up to ${pct}% off till 31 December.` : ` ${n === 1 ? "It is" : "Every design here is"} ${pct}% off till 31 December.`) : ""}
        </p>
        <WeddingDropTemplates items={drop} />
        <p className="wvoHub">Looking for court marriage, kundli or another style? <Link href="/wedding">See every wedding design <ArrowRight size={14} aria-hidden /></Link></p>
      </section>

      <section className="wvoSec" aria-labelledby="wvo-how">
        <h2 id="wvo-how" className="wvoSecTitle">Three steps to <em>the mandap</em></h2>
        <ol className="wvoSteps">
          {STEPS.map((st) => (
            <li key={st.b}><span className="wvoStepIc">{st.ic}</span><b>{st.b}</b><span>{st.s(pct ? pctText : null)}</span></li>
          ))}
        </ol>
      </section>

      <section className="wvoSec" aria-labelledby="wvo-faq">
        <h2 id="wvo-faq" className="wvoSecTitle">Questions before <em>the pheras</em></h2>
        <div className="wvoFaq">
          {faqs.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="wvoEnd" aria-labelledby="wvo-end">
        <span className="wvoEndToran" aria-hidden><MarigoldToran n={6} /></span>
        <h2 id="wvo-end" className="wvoEndTitle">Don&apos;t just invite them — <em>welcome them</em></h2>
        <p className="wvoSub">{on ? "The season offer ends at midnight on Thursday, 31 December." : "Wedding invitations, ready in minutes."}</p>
        <div className="wvoCtas">
          {drop.slice(0, 2).map((t, i) => (
            <Link key={t.slug} href={`/${t.slug}`} className={`wvoBtn ${i === 0 ? "primary" : "ghost"}`} prefetch={false}>
              {i === 0 && <Rings size={17} />} {t.title}
            </Link>
          ))}
        </div>
        <div className="wvoEndGround" aria-hidden>
          <IdleGif src={WEDDING_LUX("c-reception-600.webp")} width={453} height={600} className="wvoEndCouple" />
          <IdleGif src={WEDDING_LUX("rose-bouquet-360.webp")} width={360} height={309} className="wvoEndRoses" />
        </div>
      </section>
    </div>
  );
}

const WVO_CSS = `
.wvo { position: relative; min-height: 100vh; overflow-x: clip; color: var(--wt-ink); padding: 0 0 110px;
  background: linear-gradient(180deg, #fffaf2 0%, #fdf3ea 40%, #fbece6 100%); }
.wvo em { font-style: italic; color: var(--wt-sindoor); }
.wvo > section { position: relative; z-index: 1; }

/* ── hero ─────────────────────────────────────────────────────────────── */
.wvoHero { position: relative; isolation: isolate; overflow: hidden; padding: 78px 16px 0; background: var(--wt-silk); }
.wvoScene { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
.wvoHaze { position: absolute; inset: 0; opacity: .7;
  background: radial-gradient(circle at 50% 50%, transparent 7px, rgba(195,154,67,.16) 7.5px 8.5px, transparent 9px) 0 0 / 30px 30px,
    radial-gradient(circle at 50% 50%, rgba(195,154,67,.2) 0 1.2px, transparent 1.7px) 15px 15px / 30px 30px;
  -webkit-mask-image: radial-gradient(85% 80% at 50% 45%, transparent 40%, #000 92%); mask-image: radial-gradient(85% 80% at 50% 45%, transparent 40%, #000 92%); }
/* string lights over the arch, never across the headline: faint on phones, right half only on desktop */
.wvoLights { position: absolute; left: 50%; top: 24px; width: min(900px, 120vw); height: auto; aspect-ratio: 900 / 519; transform: translateX(-50%); opacity: .28; }
.wvoToran { position: absolute; z-index: 3; left: -6px; right: -6px; top: -4px; display: block; filter: drop-shadow(0 4px 4px rgba(110,40,10,.22)); }
.wvoToran svg { display: block; width: 100%; height: auto; }
.wvoJh { position: absolute; z-index: 3; top: 30px; display: block; transform-origin: 50% 0; animation: wvoJh 3.4s ease-in-out infinite; }
.wvoJh i { position: absolute; left: 50%; top: -22px; width: 1px; height: 22px; background: #c39a43; }
.wvoJh svg { display: block; filter: drop-shadow(0 4px 5px rgba(110,70,10,.3)); }
.wvoJh.j1 { left: 6%; } .wvoJh.j2 { left: 22%; top: 38px; animation-delay: -1s; } .wvoJh.j3 { right: 6%; animation-delay: -2s; } .wvoJh.j4 { right: 22%; top: 38px; animation-delay: -.5s; }
@keyframes wvoJh { 0%, 100% { transform: rotate(-8deg); } 50% { transform: rotate(8deg); } }
.wvoHem { position: absolute; left: 0; right: 0; bottom: 0; height: 9px; z-index: 3;
  background: radial-gradient(circle, #f4a21c 2.4px, transparent 2.8px) 0 50% / 14px 9px repeat-x, linear-gradient(90deg, #c39a43, #f2dea4 25%, #c39a43 50%, #f2dea4 75%, #c39a43); }
/* the stage: an arch with the couple, peacocks at their feet. Phones: under the copy, in flow. */
.wvoStage { position: absolute; left: 50%; bottom: 9px; width: 360px; height: 330px; transform: translateX(-50%); }
.wvoArchRing { position: absolute; left: 50%; bottom: 0; width: 230px; height: 300px; transform: translateX(-50%); border-radius: 115px 115px 0 0;
  background: radial-gradient(70% 60% at 50% 30%, #fff, rgba(249,225,220,.7) 70%, rgba(249,225,220,.2) 100%);
  box-shadow: inset 0 0 0 2px rgba(195,154,67,.6), inset 0 0 0 8px rgba(255,250,242,.85), inset 0 0 0 9px rgba(195,154,67,.35), 0 20px 50px -30px rgba(110,30,40,.4); }
.wvoArch { position: absolute; left: 50%; bottom: 40px; width: 420px; height: 312px; transform: translateX(-50%); opacity: .95; }
.wvoCouple { position: absolute; z-index: 2; left: 50%; bottom: 0; width: 150px; height: 270px; transform: translateX(-50%); display: block; }
.wvoCouple img { display: block; width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 12px 18px rgba(110,30,40,.3)); }
.wvoPeacock { position: absolute; z-index: 1; bottom: 0; }
.wvoPeacock.l { left: 0; width: 104px; height: 118px; transform: scaleX(-1); }
.wvoPeacock.r { right: 6px; width: 78px; height: 143px; }
.wvoPots { position: absolute; z-index: 3; right: 78px; bottom: 0; width: 40px; height: 72px; }
.wvoHeroIn { position: relative; z-index: 4; max-width: 600px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; text-align: center; padding-bottom: 344px; }
.wvoKick { white-space: nowrap; display: inline-flex; align-items: center; gap: 8px; padding: 8px 14px; border-radius: 999px; color: var(--wt-gold-deep);
  border: 1px solid var(--wt-edge); background: rgba(255,250,242,.85); -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px);
  font: 800 10.5px/1 'Inter', sans-serif; letter-spacing: .2em; text-transform: uppercase; box-shadow: 0 6px 16px -10px rgba(110,70,10,.4); }
.wvoTitle { margin: 16px 0 0; display: flex; flex-direction: column; align-items: center; gap: 2px; }
.wvoTitleA { font: 700 clamp(34px, 7vw, 70px)/1.02 var(--font-cinzel), 'Cinzel', 'Playfair Display', serif; letter-spacing: .02em; color: var(--wt-ink);
  text-shadow: 0 2px 0 rgba(255,255,255,.8); }
.wvoTitleA i { font-style: normal; background: ${GOLD_TEXT}; -webkit-background-clip: text; background-clip: text; color: transparent; text-shadow: none; padding: 0 .04em; }
.wvoTitleB { display: inline-flex; align-items: flex-start; gap: 8px; }
.wvoPct { font: 800 clamp(80px, 16vw, 160px)/.9 var(--font-playfair), 'Playfair Display', serif;
  background: ${GOLD_TEXT}; -webkit-background-clip: text; background-clip: text; color: transparent;
  filter: drop-shadow(0 4px 0 rgba(143,106,34,.16)) drop-shadow(0 10px 30px rgba(244,162,28,.25));
  padding: .1em .04em .2em; margin: -.1em -.04em -.2em; }
.wvoTitleB small { margin-top: .5em; font: 800 clamp(18px, 3vw, 30px)/1 'Inter', sans-serif; letter-spacing: .16em; color: var(--wt-sindoor); }
.wvoTitleB .wvoUpTo { letter-spacing: .1em; text-transform: uppercase; }
.wvoTitleC { font: italic 600 clamp(24px, 4vw, 42px)/1.15 var(--font-playfair), 'Playfair Display', serif; color: var(--wt-sindoor); max-width: 15em; }
.wvoSub { max-width: 32rem; margin: 14px auto 0; font: 400 15px/1.6 'Inter', sans-serif; color: var(--wt-ink-soft); }
.wvoGlass { width: 100%; max-width: 440px; margin-top: 20px; padding: 18px 16px 16px; border-radius: 26px; display: flex; flex-direction: column; align-items: center;
  background: var(--wt-glass); -webkit-backdrop-filter: blur(14px) saturate(120%); backdrop-filter: blur(14px) saturate(120%);
  box-shadow: inset 0 0 0 1px var(--wt-edge), inset 0 0 0 5px rgba(255,255,255,.6), inset 0 0 0 6px rgba(195,154,67,.25), 0 30px 60px -34px rgba(110,30,40,.5); }
.wvoClockWrap { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 10px; margin-bottom: 16px; }
.wvoClockKick { font: 700 10px/1 'Inter', sans-serif; letter-spacing: .22em; text-transform: uppercase; color: var(--wt-gold-deep); }
.wvoClock { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; width: 100%; }
.wvoCell { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 12px 0 10px; border-radius: 40px 40px 14px 14px / 24px 24px 14px 14px;
  background: linear-gradient(180deg, #fff, var(--wt-blush)); box-shadow: inset 0 0 0 1px var(--wt-edge), 0 6px 14px -10px rgba(110,30,40,.4); }
.wvoCell b { font: 800 26px/1 'Inter', sans-serif; font-variant-numeric: tabular-nums; color: var(--wt-ink); }
.wvoCell small { font: 700 9px/1 'Inter', sans-serif; letter-spacing: .16em; text-transform: uppercase; color: var(--wt-gold-deep); }
.wvoCtas { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
.wvoBtn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 15px 22px; border-radius: 999px; text-decoration: none;
  font: 800 14.5px/1 'Inter', sans-serif; transition: transform .2s ease, box-shadow .2s ease; }
.wvoBtn.primary { color: #fff3d6; background: linear-gradient(180deg, #b8324a, var(--wt-sindoor) 60%, var(--wt-sindoor-deep));
  box-shadow: 0 0 0 1px var(--wt-gold), 0 0 0 3px rgba(255,250,242,.9), 0 0 0 4px rgba(195,154,67,.4), 0 14px 28px -12px rgba(110,16,34,.55); }
.wvoBtn.ghost { color: var(--wt-ink); background: rgba(255,255,255,.75); box-shadow: inset 0 0 0 1.5px var(--wt-gold), 0 8px 18px -12px rgba(110,70,10,.4); }
.wvoBtn:hover { transform: translateY(-2px); }
.wvoFrom { font-weight: 800; color: var(--wt-sindoor); margin-left: 2px; }
.wvoTrust { display: inline-flex; align-items: center; gap: 6px; margin: 14px 0 0; font: 500 12px/1.4 'Inter', sans-serif; color: var(--wt-ink-soft); }

/* ── sections ─────────────────────────────────────────────────────────── */
.wvoSec { max-width: 1180px; margin: 0 auto; padding: 56px 16px 0; text-align: center; }
.wvoSecKick { display: inline-flex; align-items: center; gap: 6px; margin: 0 0 8px; color: var(--wt-gold-deep); font: 800 11px/1 'Inter', sans-serif; letter-spacing: .22em; text-transform: uppercase; }
.wvoSecTitle { margin: 0; font: 600 clamp(28px, 4.4vw, 44px)/1.12 var(--font-playfair), 'Playfair Display', serif; color: var(--wt-ink); }
.wvoSecSub { max-width: 36rem; margin: 10px auto 0; font: 400 14.5px/1.6 'Inter', sans-serif; color: var(--wt-ink-soft); }
.wvoHub { margin: 26px 0 0; font: 500 14px/1.5 'Inter', sans-serif; color: var(--wt-ink-soft); }
.wvoHub a { display: inline-flex; align-items: center; gap: 4px; color: var(--wt-sindoor); font-weight: 700; text-decoration: none; border-bottom: 1px solid rgba(158,31,52,.3); }
.wvoSteps { display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; margin: 26px 0 0; padding: 0; list-style: none; text-align: left; }
.wvoSteps li { display: grid; grid-template-columns: 48px 1fr; grid-template-rows: auto auto; column-gap: 14px; row-gap: 3px; align-items: center; padding: 16px 18px; border-radius: 20px;
  background: rgba(255,255,255,.75); box-shadow: inset 0 0 0 1px var(--wt-edge), 0 14px 30px -24px rgba(110,30,40,.5); }
.wvoStepIc { grid-row: 1 / 3; width: 48px; height: 48px; border-radius: 50%; display: grid; place-items: center; font-size: 22px;
  background: radial-gradient(circle at 35% 30%, #fff, var(--wt-blush)); box-shadow: inset 0 0 0 1px var(--wt-gold), 0 0 0 3px rgba(255,255,255,.8), 0 0 0 4px rgba(195,154,67,.3); }
.wvoSteps b { font: 700 16px/1.2 'Inter', sans-serif; color: var(--wt-ink); }
.wvoSteps li > span:last-child { font: 400 13.5px/1.5 'Inter', sans-serif; color: var(--wt-ink-soft); }
.wvoFaq { max-width: 760px; margin: 24px auto 0; display: flex; flex-direction: column; gap: 10px; text-align: left; }
.wvoFaq details { border-radius: 18px; background: rgba(255,255,255,.75); box-shadow: inset 0 0 0 1px var(--wt-edge); }
.wvoFaq details[open] { box-shadow: inset 0 0 0 1px var(--wt-gold), 0 14px 30px -22px rgba(110,30,40,.45); }
.wvoFaq summary { cursor: pointer; list-style: none; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 18px; font: 600 15px/1.4 'Inter', sans-serif; color: var(--wt-ink); }
.wvoFaq summary::-webkit-details-marker { display: none; }
.wvoFaq summary::after { content: "🌼"; flex: none; }
.wvoFaq details[open] summary::after { content: "💍"; }
.wvoFaq p { margin: 0; padding: 0 18px 16px; font: 400 14px/1.6 'Inter', sans-serif; color: var(--wt-ink-soft); }

.wvoEnd { isolation: isolate; overflow: hidden; max-width: 1180px; margin: 64px 12px 0; padding: 70px 20px 190px; border-radius: 30px; text-align: center;
  background: var(--wt-silk); box-shadow: inset 0 0 0 1px var(--wt-edge), inset 0 0 0 6px rgba(255,255,255,.6), inset 0 0 0 7px rgba(195,154,67,.25), 0 40px 80px -50px rgba(110,30,40,.6); }
.wvoEndToran { position: absolute; left: -4px; right: -4px; top: -3px; display: block; filter: drop-shadow(0 3px 3px rgba(110,40,10,.2)); }
.wvoEndToran svg { display: block; width: 100%; height: auto; }
.wvoEnd .wvoCtas { margin-top: 22px; }
.wvoEndTitle { margin: 0; font: 600 clamp(28px, 5vw, 46px)/1.12 var(--font-playfair), 'Playfair Display', serif; color: var(--wt-ink); }
.wvoEndGround { position: absolute; left: 0; right: 0; bottom: 0; height: 170px; pointer-events: none; z-index: -1; }
.wvoEndCouple { position: absolute; left: 5%; bottom: 0; width: 120px; height: 159px; }
.wvoEndRoses { position: absolute; right: 4%; bottom: 0; width: 150px; height: 129px; }

.wvoSubShort, .wvoBtnShort { display: none; }
@media (max-width: 767px) {
  /* The layout shell pads 96px under every page for the tab bar; keep it silk, not cream. */
  .wvo { margin-bottom: -96px; padding-bottom: 200px; }
  /* The hero slides up under the mobile brand bar's 84px spacer, so the toran runs to the very top. */
  .wvoHero { margin-top: -84px; padding: 106px 14px 0; }
  .wvoHeroIn { padding-bottom: 300px; }
  .wvoStage { width: 330px; height: 290px; }
  .wvoArchRing { width: 196px; height: 262px; border-radius: 98px 98px 0 0; }
  .wvoArch { width: 360px; height: 267px; }
  .wvoCouple { width: 134px; height: 241px; }
  .wvoPeacock.l { width: 90px; height: 102px; }
  .wvoPeacock.r { width: 66px; height: 121px; }
  .wvoPots { right: 64px; width: 34px; height: 61px; }
  .wvoJh.j2, .wvoJh.j4 { display: none; }
  .wvoJh { top: 22px; }
  .wvoJh svg { width: 22px; height: 37px; }
  .wvoKick { padding: 7px 12px; font-size: 9.5px; }
  .wvoTitle { margin-top: 12px; gap: 0; }
  .wvoTitleA { font-size: clamp(30px, 9vw, 40px); }
  .wvoPct { font-size: clamp(64px, 19vw, 84px); }
  .wvoTitleB small { font-size: 16px; }
  .wvoTitleC { font-size: 22px; margin-top: 4px; }
  .wvoSubLong { display: none; }
  .wvoSubShort { display: block; max-width: 22rem; margin-top: 8px; font-size: 14px; line-height: 1.5; }
  .wvoGlass { margin-top: 14px; padding: 12px; border-radius: 22px; max-width: 380px; }
  .wvoClockWrap { gap: 7px; margin-bottom: 11px; }
  .wvoClockKick { font-size: 9px; }
  .wvoClock { gap: 6px; }
  .wvoCell { gap: 4px; padding: 8px 0 7px; }
  .wvoCell b { font-size: 21px; }
  .wvoCell small { font-size: 8px; }
  .wvoGlass .wvoCtas { flex-wrap: nowrap; gap: 8px; width: 100%; }
  .wvoGlass .wvoBtn { flex: 1 1 0; min-width: 0; padding: 13px 8px; font-size: 13px; white-space: nowrap; }
  .wvoGlass .wvoBtn svg { flex: none; }
  .wvoGlass .wvoTrust { display: none; }
  .wvoBtnLong { display: none; }
  .wvoBtnShort { display: inline; }
  .wvoEnd .wvoCtas .wvoBtn { width: 100%; }
  .wvoEndCouple { width: 96px; height: 127px; left: 2%; }
  .wvoEndRoses { width: 110px; height: 94px; right: 2%; }
}
@media (max-width: 420px) { .wvoKickX { display: none; } }
@media (min-width: 640px) {
  .wvoSteps { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .wvoSteps li { grid-template-columns: 1fr; grid-template-rows: auto; text-align: center; justify-items: center; padding: 22px 18px; }
  .wvoStepIc { grid-row: auto; }
}
@media (min-width: 768px) {
  .wvoEnd { margin: 80px auto 0; border-radius: 40px; }
}
@media (min-width: 1024px) {
  /* desktop: copy on the left, the arch on the right — exactly one screen. */
  .wvoHero { height: 100vh; height: 100svh; min-height: 620px; box-sizing: border-box; display: flex; align-items: center;
    padding: clamp(96px, 13vh, 130px) 0 clamp(24px, 4vh, 48px); }
  .wvoHeroIn { margin: 0 0 0 max(6vw, calc((100vw - 1240px) / 2)); max-width: min(600px, 46vw); align-items: flex-start; text-align: left; padding-bottom: 0; }
  .wvoStage { left: auto; right: max(3vw, calc((100vw - 1240px) / 2)); transform: none; bottom: 9px; width: min(46vw, 620px); height: min(76vh, 640px); }
  .wvoLights { left: auto; right: max(2vw, calc((100vw - 1260px) / 2)); transform: none; width: min(48vw, 660px); top: 60px; opacity: .6; }
  .wvoArchRing { width: 62%; height: 88%; border-radius: 999px 999px 0 0; }
  .wvoArch { width: 108%; height: 72%; bottom: 18%; }
  .wvoCouple { width: auto; height: 80%; aspect-ratio: 334 / 600; }
  .wvoPeacock.l { width: 27%; height: auto; aspect-ratio: 360 / 410; }
  .wvoPeacock.r { width: 20%; height: auto; aspect-ratio: 196 / 360; }
  .wvoPots { right: 21%; width: 10%; height: auto; aspect-ratio: 144 / 260; }
  .wvoKick { padding: clamp(6px, .9vh, 8px) 13px; font-size: clamp(9.5px, 1.35vh, 10.5px); }
  .wvoTitle { align-items: flex-start; margin-top: clamp(8px, 1.8vh, 18px); gap: 0; }
  .wvoTitleA { font-size: clamp(34px, min(3.6vw, 6.2vh), 60px); white-space: nowrap; }
  .wvoPct { font-size: clamp(72px, min(10.5vw, 15.5vh), 160px); margin-bottom: -.13em; }
  .wvoTitleB small { font-size: clamp(16px, 2.7vh, 28px); }
  .wvoTitleC { font-size: clamp(26px, 4.4vh, 40px); }
  .wvoHero .wvoSub { margin: clamp(6px, 1.4vh, 14px) 0 0; font-size: clamp(13.5px, 1.95vh, 16px); line-height: 1.55; max-width: 30rem; }
  .wvoGlass { align-items: stretch; max-width: 460px; margin-top: clamp(12px, 2.4vh, 24px); padding: clamp(12px, 2.1vh, 22px) clamp(16px, 2vh, 22px) clamp(11px, 1.8vh, 18px); }
  .wvoGlass .wvoCtas { justify-content: flex-start; }
  .wvoClockWrap { align-items: flex-start; gap: clamp(6px, 1.1vh, 10px); margin-bottom: clamp(9px, 1.9vh, 18px); }
  .wvoCell { padding: clamp(7px, 1.25vh, 12px) 0 clamp(6px, 1.05vh, 10px); gap: clamp(3px, .6vh, 6px); }
  .wvoCell b { font-size: clamp(21px, 3.3vh, 30px); }
  .wvoBtn { padding: clamp(11px, 1.75vh, 15px) 22px; }
  .wvoTrust { align-self: flex-start; margin-top: clamp(8px, 1.5vh, 14px); }
  .wvoEndCouple { width: 150px; height: 199px; }
  .wvoEndRoses { width: 200px; height: 172px; }
}
@media (prefers-reduced-motion: reduce) {
  .wvo * { animation: none !important; }
}
`;
