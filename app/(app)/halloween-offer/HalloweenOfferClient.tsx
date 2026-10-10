"use client";

// ─── The Halloween drop page ─────────────────────────────────────────────────
//
// A little haunted night in the site's own colours: maroon and gold on a deep
// night sky, pumpkin orange for the offer. The template GIFs (webs flush in the
// corners, the spider dropping from the top, bats, the witch on her broom,
// floating ghosts, the grave hand, the witch-hat pumpkin) all arrive after idle
// into boxes that are already sized, so the first paint — the headline — is
// pure HTML and CSS and nothing shifts when they land. The running ghost and
// crawling spider come from HalloweenCritters, which is off under reduced
// motion; every CSS animation here stops under reduced motion too.

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import LuxuryMobileTopBrand from "@/components/LuxuryMobileTopBrand";
import HalloweenCritters from "@/components/promo/HalloweenCritters";
import IdleGif from "@/components/promo/IdleGif";
import { Bat, Ghost, Spider } from "@/components/promo/halloweenArt";
import { useSeason } from "@/hooks/useSeason";
import { useNow, countdown, pad2 } from "@/hooks/usePromo";
import { useTemplatePricing } from "@/hooks/useTemplatePricing";
import { formatINR } from "@/config/templatePricing";
import { HALLOWEEN_ENDS_AT, HALLOWEEN_GIF } from "@/lib/season";
import { HALLOWEEN_SHOWCASE, halloweenFaqs, type HalloweenShowcase } from "./content";

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
    <div className="hwoClock" role="timer" aria-label={t ? `Ends in ${c.d} days ${c.h} hours ${c.m} minutes` : "Ends 31 October"}>
      {boxes.map((b) => (
        <span key={b.l} className="hwoStone">
          <b>{t ? pad2(b.v) : "--"}</b>
          <small>{b.l}</small>
        </span>
      ))}
    </div>
  );
}

function Price({ slug }: { slug: string }) {
  const { pricingFor, settled } = useTemplatePricing();
  if (!settled) return <span className="hwoPrice is-skel" aria-hidden />;
  const p = pricingFor(slug);
  if (p.isFree) return <span className="hwoPrice"><b>Free</b></span>;
  const struck = p.mrp > p.finalPrice;
  return (
    <span className="hwoPrice" aria-label={struck ? `Was ${formatINR(p.mrp)}, now ${formatINR(p.finalPrice)}` : `${formatINR(p.finalPrice)}`}>
      {struck && <s>{formatINR(p.mrp)}</s>}
      <b>{formatINR(p.finalPrice)}</b>
      {struck && p.discountPercent > 0 && <em>{p.discountPercent}% off</em>}
    </span>
  );
}

function ShowcaseCard({ t, i }: { t: HalloweenShowcase; i: number }) {
  const premium = t.tier !== "Everyday";
  return (
    <article className={`hwoCard${premium ? " is-premium" : ""}`}>
      <CornerWebImg corner="tl" small />
      <div className="hwoCoverWrap">
        <Link href={t.href} className="hwoCover" prefetch={false} aria-label={`Try ${t.name}`}>
          {/* eslint-disable-next-line @next/next/no-img-element -- CDN poster, sized box */}
          <img src={t.cover} alt={`${t.name} — Halloween template preview`} width={720} height={900} loading="lazy" decoding="async" />
          <span className="hwoTier">{premium ? "✦ PREMIUM" : "🎃 EVERYDAY"}</span>
        </Link>
        <IdleGif src={HALLOWEEN_GIF(t.gif.file)} width={t.gif.w} height={t.gif.h} className={`hwoCardGif g${i}`} />
      </div>
      <div className="hwoCardBody">
        <h3 className="hwoCardName">{t.name}</h3>
        <p className="hwoCardTag">{t.tagline}</p>
        <p className="hwoCardKick">What they experience</p>
        <ol className="hwoMoments">
          {t.moments.map((m) => <li key={m}>{m}</li>)}
        </ol>
        <div className="hwoCardFoot">
          <Price slug={t.slug} />
          <Link href={t.href} className="hwoTry" prefetch={false}>
            Try it free <ArrowRight size={16} aria-hidden />
          </Link>
        </div>
      </div>
    </article>
  );
}

/** One of the template's corner webs, flush in a corner of its parent. */
function CornerWebImg({ corner, small }: { corner: "tl" | "tr"; small?: boolean }) {
  const file = corner === "tl" ? "cute-spider-web.webp" : "corner-web-spider.webp";
  const [w, h] = corner === "tl" ? [300, 300] : [280, 362];
  return <IdleGif src={HALLOWEEN_GIF(file)} width={w} height={h} className={`hwoWeb ${corner}${small ? " sm" : ""}`} />;
}

export default function HalloweenOfferClient() {
  const season = useSeason();
  const on = season?.mode === "halloween";
  const pct = on && season.sale.enabled ? season.sale.percent : 0;
  const faqs = halloweenFaqs(pct);

  return (
    <div className="hwo">
      <style>{HWO_CSS}</style>
      <LuxuryMobileTopBrand />

      <section className="hwoHero" aria-labelledby="hwo-title">
        <span className="hwoStars" aria-hidden />
        <span className="hwoMoon" aria-hidden />
        <span className="hwoFog f1" aria-hidden />
        <span className="hwoFog f2" aria-hidden />
        <CornerWebImg corner="tl" />
        <CornerWebImg corner="tr" />
        <IdleGif src={HALLOWEEN_GIF("spider-drop-from-top.gif")} width={214} height={498} className="hwoDrop" />
        <span className="hwoFly hwoBats" aria-hidden><IdleGif src={HALLOWEEN_GIF("cute-bats.webp")} width={360} height={360} className="hwoFlyImg" /></span>
        <span className="hwoFly hwoWitch" aria-hidden><IdleGif src={HALLOWEEN_GIF("witch-seal-broom.webp")} width={280} height={280} className="hwoFlyImg" /></span>
        <HalloweenCritters scope="parent" kinds={["ghost", "crawl"]} avoid=".hwoCtas, .hwoClock, .hwoTitle" />

        <div className="hwoHeroIn">
          <span className="hwoKick"><Bat size={20} /> {on ? <>Halloween drop<span className="hwoKickX"> · till 31 Oct</span></> : "The Halloween collection"} <Bat size={20} /></span>
          <h1 id="hwo-title" className="hwoTitle">
            <span className="hwoTitleA">Halloween Drop</span>
            {pct ? <span className="hwoTitleB">{pct}% <small>OFF</small></span> : <span className="hwoTitleC">Will you be my boo?</span>}
          </h1>
          <p className="hwoSub">
            Two spooky-cute love letters for the one who makes your heart go <em>boo</em> — a tiny haunted house and a boo-tiful night,
            with your photos, your song and your letter.{pct ? " The sale price is applied automatically when you publish." : ""}
          </p>
          {on && <Countdown />}
          <div className="hwoCtas">
            <a href="#hwo-templates" className="hwoBtn primary"><Ghost size={18} /> See the two templates</a>
            <Link href={HALLOWEEN_SHOWCASE[0].href} className="hwoBtn ghost" prefetch={false}>Try one free <ArrowRight size={16} aria-hidden /></Link>
          </div>
          <p className="hwoTrust"><Sparkles size={13} aria-hidden /> Free to try · pay only to publish · ready in 2 minutes</p>
        </div>

        <div className="hwoGround" aria-hidden>
          <IdleGif src={HALLOWEEN_GIF("grave-zombie-hand.webp")} width={150} height={139} className="hwoGrave" />
          <IdleGif src={HALLOWEEN_GIF("witch-hat-pumpkin.webp")} width={240} height={285} className="hwoPumpkin" />
        </div>
      </section>

      <section className="hwoSec" id="hwo-templates" aria-labelledby="hwo-two">
        <p className="hwoSecKick"><Spider size={16} /> The drop</p>
        <h2 id="hwo-two" className="hwoSecTitle">Two ways to say <em>boo</em></h2>
        <p className="hwoSecSub">Pick a haunt, write your letter (AI can help), add photos and a song. Send them one link.</p>
        <div className="hwoGrid">
          {HALLOWEEN_SHOWCASE.map((t, i) => <ShowcaseCard key={t.slug} t={t} i={i} />)}
        </div>
      </section>

      <section className="hwoSec" aria-labelledby="hwo-how">
        <h2 id="hwo-how" className="hwoSecTitle">Three steps, <em>no tricks</em></h2>
        <ol className="hwoSteps">
          <li><span className="hwoStepIc">🎃</span><b>Pick your haunt</b><span>The haunted house, or the ✦ Premium boo-tiful night.</span></li>
          <li><span className="hwoStepIc">🕯️</span><b>Make it yours</b><span>Your letter, your photos, your song. Preview everything free.</span></li>
          <li><span className="hwoStepIc">💌</span><b>Send the link</b><span>Publish{pct ? ` at ${pct}% off` : ""} and share it — WhatsApp, Instagram or a QR code.</span></li>
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
        <CornerWebImg corner="tr" small />
        <h2 id="hwo-end" className="hwoEndTitle">Don&apos;t ghost them <em>this Halloween</em></h2>
        <p className="hwoSub">{on ? "The drop vanishes at midnight on 31 October." : "Two spooky love letters, ready in minutes."}</p>
        <div className="hwoCtas">
          {HALLOWEEN_SHOWCASE.map((t, i) => (
            <Link key={t.slug} href={t.href} className={`hwoBtn ${i === 0 ? "primary" : "ghost"}`} prefetch={false}>
              {i === 0 ? "🏚️" : "👻"} {t.name}
            </Link>
          ))}
        </div>
        <div className="hwoEndGround" aria-hidden>
          <IdleGif src={HALLOWEEN_GIF("grave-zombie-hand.webp")} width={150} height={139} className="hwoEndGrave" />
          <IdleGif src={HALLOWEEN_GIF("witch-hat-pumpkin.webp")} width={240} height={285} className="hwoEndPumpkin" />
        </div>
      </section>
    </div>
  );
}

const HWO_CSS = `
.hwo { --night: #0c0510; --maroon: #3d0c11; --gold: #c9a84c; --gold2: #e9c46a; --cream: #f5ede6; --pump: #f0862f; --pump2: #ffc37a;
  position: relative; min-height: 100vh; overflow-x: clip; color: var(--cream); padding: 70px 0 110px;
  background: radial-gradient(90% 50% at 50% 0%, #3d0c11 0%, transparent 70%), radial-gradient(70% 40% at 100% 40%, rgba(70,24,90,.45) 0%, transparent 70%),
    linear-gradient(180deg, #1a070d 0%, var(--night) 40%, #12060f 100%); }
.hwo em { font-style: italic; color: var(--pump2); }

/* ── hero ─────────────────────────────────────────────────────────────── */
.hwoHero { position: relative; isolation: isolate; overflow: hidden; margin: 4px 12px 0; padding: 64px 20px 150px; border-radius: 30px; text-align: center;
  background: radial-gradient(60% 45% at 50% 108%, rgba(240,134,47,.55) 0%, transparent 70%),
    radial-gradient(120% 90% at 50% 0%, #4a1015 0%, #2a080c 45%, #13050c 100%);
  box-shadow: 0 30px 60px -34px rgba(0,0,0,.95), 0 0 0 1px rgba(201,168,76,.32); }
.hwoStars { position: absolute; inset: 0; z-index: -2; pointer-events: none; opacity: .7;
  background-image: radial-gradient(1.4px 1.4px at 12% 18%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 28% 8%, #fff 50%, transparent 51%),
    radial-gradient(1.2px 1.2px at 46% 22%, #ffe9c2 50%, transparent 51%), radial-gradient(1px 1px at 66% 12%, #fff 50%, transparent 51%),
    radial-gradient(1.6px 1.6px at 84% 26%, #fff 50%, transparent 51%), radial-gradient(1px 1px at 92% 6%, #ffe9c2 50%, transparent 51%),
    radial-gradient(1px 1px at 6% 40%, #fff 50%, transparent 51%), radial-gradient(1.2px 1.2px at 74% 38%, #fff 50%, transparent 51%);
  animation: hwoTwinkle 4s ease-in-out infinite alternate; }
@keyframes hwoTwinkle { from { opacity: .45; } to { opacity: .85; } }
.hwoMoon { position: absolute; z-index: -1; top: 14px; right: 30%; width: 44px; height: 44px; border-radius: 50%;
  background: radial-gradient(circle at 36% 36%, #fff8e2, #f3d98f 58%, #c9a84c);
  box-shadow: 0 0 60px 16px rgba(243,217,143,.28), inset -10px -6px 0 rgba(160,120,40,.25); }
.hwoFog { position: absolute; z-index: -1; left: -20%; right: -20%; height: 140px; bottom: 30px; pointer-events: none; filter: blur(18px); opacity: .55;
  background: radial-gradient(40% 60% at 25% 50%, rgba(245,237,230,.22), transparent 70%), radial-gradient(35% 55% at 70% 60%, rgba(245,237,230,.18), transparent 70%); }
.hwoFog.f1 { animation: hwoFog 18s ease-in-out infinite alternate; }
.hwoFog.f2 { bottom: 70px; opacity: .35; animation: hwoFog 24s ease-in-out -6s infinite alternate-reverse; }
@keyframes hwoFog { from { transform: translateX(-6%); } to { transform: translateX(6%); } }
.hwoWeb { position: absolute; top: 0; z-index: 0; width: 120px; height: 120px; pointer-events: none; }
.hwoWeb.tl { left: 0; }
.hwoWeb.tr { right: 0; width: 104px; height: 134px; }
.hwoWeb.sm.tl { width: 74px; height: 74px; }
.hwoWeb.sm.tr { width: 70px; height: 90px; }
.hwoDrop { position: absolute; top: 0; left: 16%; z-index: 0; width: 46px; height: 107px; pointer-events: none; }
.hwoFly { position: absolute; z-index: 0; pointer-events: none; }
.hwoFlyImg { width: 100%; height: 100%; }
.hwoBats { top: 18%; left: 0; width: 92px; height: 92px; animation: hwoBats 17s linear 2s infinite; transform: translateX(-120px); }
@keyframes hwoBats { 0% { transform: translate(-120px, 0); } 30% { transform: translate(40vw, -30px); } 60% { transform: translate(110vw, 10px); } 100% { transform: translate(110vw, 10px); } }
.hwoWitch { top: 30%; right: 0; width: 110px; height: 110px; animation: hwoWitch 21s linear 9s infinite; transform: translateX(130px); }
@keyframes hwoWitch { 0% { transform: translate(130px, 0) rotate(-4deg); } 45% { transform: translate(-110vw, -40px) rotate(4deg); } 100% { transform: translate(-110vw, -40px); } }
.hwoHeroIn { position: relative; z-index: 2; max-width: 760px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; }
.hwoKick { white-space: nowrap; display: inline-flex; align-items: center; gap: 8px; padding: 7px 14px; border-radius: 999px; color: var(--gold2);
  border: 1px solid rgba(201,168,76,.45); background: rgba(0,0,0,.25); font: 800 10.5px/1 'Inter', sans-serif; letter-spacing: .2em; text-transform: uppercase; }
.hwoKick svg { color: #0b0204; filter: drop-shadow(0 0 4px rgba(255,170,90,.6)); }
.hwoTitle { margin: 18px 0 0; display: flex; flex-direction: column; align-items: center; gap: 6px; }
.hwoTitleA { font: 700 clamp(36px, 7vw, 68px)/1 var(--font-cinzel), 'Cinzel', 'Playfair Display', serif; letter-spacing: .02em; color: var(--cream);
  text-shadow: 0 0 24px rgba(201,168,76,.35), 0 3px 0 rgba(61,12,17,.9); }
.hwoTitleB { display: inline-flex; align-items: flex-start; gap: 8px; font: 800 clamp(76px, 15vw, 150px)/.9 var(--font-playfair), 'Playfair Display', serif;
  background: linear-gradient(180deg, #ffe2b0 8%, #ff9a3d 55%, #c4521c 100%); -webkit-background-clip: text; background-clip: text; color: transparent;
  filter: drop-shadow(0 6px 30px rgba(240,134,47,.6)); animation: hwoFlicker 5s ease-in-out infinite; }
.hwoTitleB small { margin-top: .32em; font: 800 clamp(18px, 3vw, 30px)/1 'Inter', sans-serif; letter-spacing: .14em; -webkit-text-fill-color: var(--gold2); color: var(--gold2); }
@keyframes hwoFlicker { 0%, 100% { opacity: 1; } 47% { opacity: 1; } 48% { opacity: .72; } 49% { opacity: 1; } 51% { opacity: .82; } 52% { opacity: 1; } }
.hwoTitleC { font: italic 600 clamp(26px, 4.6vw, 44px)/1.1 var(--font-playfair), 'Playfair Display', serif; color: var(--pump2); text-shadow: 0 0 26px rgba(240,134,47,.5); }
.hwoSub { max-width: 34rem; margin: 18px auto 0; font: 400 15px/1.6 'Inter', sans-serif; color: rgba(245,237,230,.8); }
.hwoClock { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; width: 100%; max-width: 380px; margin: 24px auto 0; }
.hwoStone { position: relative; display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 16px 0 10px; border-radius: 40px 40px 10px 10px;
  background: linear-gradient(180deg, #4b3d45, #2a2128); box-shadow: inset 0 2px 0 rgba(255,255,255,.14), inset 0 -6px 12px rgba(0,0,0,.35), 0 10px 18px -10px rgba(0,0,0,.8); }
.hwoStone::after { content: ""; position: absolute; left: -4px; right: -4px; bottom: -5px; height: 8px; border-radius: 50%; background: rgba(240,134,47,.2); filter: blur(3px); }
.hwoStone b { font: 800 26px/1 'Inter', sans-serif; font-variant-numeric: tabular-nums; color: #fff; }
.hwoStone small { font: 700 9px/1 'Inter', sans-serif; letter-spacing: .16em; text-transform: uppercase; color: var(--gold2); }
.hwoCtas { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; margin-top: 26px; }
.hwoBtn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 15px 24px; border-radius: 999px; text-decoration: none;
  font: 800 14.5px/1 'Inter', sans-serif; transition: transform .2s ease, box-shadow .2s ease; }
.hwoBtn.primary { color: #2a0a0e; background: linear-gradient(180deg, #ffd08f, var(--pump)); box-shadow: 0 14px 30px -12px rgba(240,134,47,.95); }
.hwoBtn.primary svg { color: #2a0a0e; }
.hwoBtn.ghost { color: var(--cream); background: rgba(255,255,255,.06); box-shadow: inset 0 0 0 1.5px rgba(201,168,76,.55); }
.hwoBtn:hover { transform: translateY(-2px); }
.hwoTrust { display: inline-flex; align-items: center; gap: 6px; margin: 16px 0 0; font: 500 12.5px/1.4 'Inter', sans-serif; color: rgba(245,237,230,.62); }
.hwoGround { position: absolute; left: 0; right: 0; bottom: 0; height: 120px; z-index: 1; pointer-events: none;
  background: radial-gradient(70% 100% at 50% 100%, rgba(10,3,6,.95) 0%, rgba(10,3,6,.6) 50%, transparent 75%); }
.hwoGrave { position: absolute; left: 6%; bottom: 4px; width: 112px; height: 104px; }
.hwoPumpkin { position: absolute; right: 7%; bottom: 0; width: 98px; height: 116px; }

/* ── sections ─────────────────────────────────────────────────────────── */
.hwoSec { max-width: 1120px; margin: 0 auto; padding: 56px 16px 0; text-align: center; }
.hwoSecKick { display: inline-flex; align-items: center; gap: 6px; margin: 0 0 8px; color: var(--pump2); font: 800 11px/1 'Inter', sans-serif; letter-spacing: .22em; text-transform: uppercase; }
.hwoSecKick svg { color: var(--gold2); }
.hwoSecTitle { margin: 0; font: 600 clamp(28px, 4.4vw, 42px)/1.1 var(--font-playfair), 'Playfair Display', serif; color: var(--cream); }
.hwoSecSub { max-width: 34rem; margin: 10px auto 0; font: 400 14.5px/1.6 'Inter', sans-serif; color: rgba(245,237,230,.7); }
.hwoGrid { display: grid; grid-template-columns: minmax(0, 1fr); gap: 22px; margin-top: 30px; text-align: left; }
.hwoCard { position: relative; isolation: isolate; overflow: hidden; display: flex; flex-direction: column; border-radius: 26px;
  background: linear-gradient(180deg, rgba(74,16,21,.75), rgba(26,8,14,.95)); box-shadow: 0 0 0 1px rgba(201,168,76,.35), 0 30px 50px -30px rgba(0,0,0,.9);
  transition: transform .3s ease, box-shadow .3s ease; }
.hwoCard.is-premium { box-shadow: 0 0 0 1px rgba(233,196,106,.6), 0 30px 50px -30px rgba(0,0,0,.9), 0 0 40px -12px rgba(201,168,76,.4); }
.hwoCard:hover { transform: translateY(-4px); box-shadow: 0 0 0 1px rgba(240,134,47,.7), 0 36px 60px -30px rgba(0,0,0,.9), 0 0 50px -10px rgba(240,134,47,.45); }
.hwoCard .hwoWeb { z-index: 3; }
.hwoCover { position: relative; display: block; aspect-ratio: 4 / 3; overflow: hidden; background: #1c0a12; }
.hwoCover img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: 50% 0; transition: transform .6s ease; }
.hwoCard:hover .hwoCover img { transform: scale(1.04); }
.hwoCover::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, transparent 55%, rgba(26,8,14,.85)); }
.hwoTier { position: absolute; z-index: 1; top: 14px; right: 14px; padding: 6px 11px; border-radius: 999px; font: 800 10px/1 'Inter', sans-serif; letter-spacing: .16em;
  color: #2a0a0e; background: linear-gradient(180deg, #f6e3a8, var(--gold)); }
.hwoCoverWrap { position: relative; }
.hwoCardGif { position: absolute; z-index: 2; right: 12px; bottom: -34px; width: 92px; height: 92px; pointer-events: none; filter: drop-shadow(0 8px 14px rgba(0,0,0,.5)); }
.hwoCardBody { padding-right: 20px; }
.hwoCardBody { position: relative; display: flex; flex-direction: column; flex: 1; padding: 18px 20px 20px; }
.hwoCardName { margin: 0; padding-right: 84px; font: 600 26px/1.1 var(--font-playfair), 'Playfair Display', serif; color: var(--cream); }
.hwoCardTag { margin: 6px 0 0; font: italic 400 14px/1.5 var(--font-playfair), 'Playfair Display', serif; color: var(--pump2); }
.hwoCardKick { margin: 16px 0 8px; font: 800 10px/1 'Inter', sans-serif; letter-spacing: .2em; text-transform: uppercase; color: var(--gold2); }
.hwoMoments { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 7px; counter-reset: m; }
.hwoMoments li { position: relative; padding-left: 30px; font: 400 14px/1.45 'Inter', sans-serif; color: rgba(245,237,230,.85); counter-increment: m; }
.hwoMoments li::before { content: counter(m); position: absolute; left: 0; top: -1px; width: 21px; height: 21px; border-radius: 50%; display: grid; place-items: center;
  font: 800 11px/1 'Inter', sans-serif; color: #2a0a0e; background: radial-gradient(circle at 35% 30%, #ffd9a0, var(--pump)); }
.hwoCardFoot { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: auto; padding-top: 20px; flex-wrap: wrap; }
.hwoPrice { display: inline-flex; align-items: baseline; gap: 8px; min-height: 30px; min-width: 120px; }
.hwoPrice.is-skel { border-radius: 8px; background: linear-gradient(90deg, rgba(255,255,255,.06), rgba(255,255,255,.12), rgba(255,255,255,.06)); background-size: 200% 100%; animation: hwoSkel 1.4s linear infinite; }
@keyframes hwoSkel { from { background-position: 100% 0; } to { background-position: -100% 0; } }
.hwoPrice s { font: 500 15px/1 'Inter', sans-serif; color: rgba(245,237,230,.5); }
.hwoPrice b { font: 800 26px/1 'Inter', sans-serif; color: #fff; }
.hwoPrice em { padding: 4px 8px; border-radius: 999px; font: 800 10.5px/1 'Inter', sans-serif; font-style: normal; letter-spacing: .06em; color: #2a0a0e; background: var(--pump2); align-self: center; }
.hwoTry { display: inline-flex; align-items: center; gap: 7px; padding: 13px 20px; border-radius: 999px; text-decoration: none; font: 800 14px/1 'Inter', sans-serif;
  color: #2a0a0e; background: linear-gradient(180deg, #f6e3a8, var(--gold)); box-shadow: 0 10px 24px -12px rgba(233,196,106,.9); transition: transform .2s ease; }
.hwoTry:hover { transform: translateX(2px); }
.hwoSteps { display: grid; grid-template-columns: minmax(0, 1fr); gap: 14px; margin: 26px 0 0; padding: 0; list-style: none; text-align: left; }
.hwoSteps li { display: grid; grid-template-columns: 48px 1fr; grid-template-rows: auto auto; column-gap: 14px; row-gap: 3px; align-items: center; padding: 16px 18px; border-radius: 20px;
  background: rgba(255,255,255,.04); box-shadow: inset 0 0 0 1px rgba(201,168,76,.25); }
.hwoStepIc { grid-row: 1 / 3; width: 48px; height: 48px; border-radius: 16px; display: grid; place-items: center; font-size: 24px; background: rgba(240,134,47,.14); }
.hwoSteps b { font: 700 16px/1.2 'Inter', sans-serif; color: var(--cream); }
.hwoSteps li > span:last-child { font: 400 13.5px/1.5 'Inter', sans-serif; color: rgba(245,237,230,.7); }
.hwoFaq { max-width: 760px; margin: 24px auto 0; display: flex; flex-direction: column; gap: 10px; text-align: left; }
.hwoFaq details { border-radius: 16px; background: rgba(255,255,255,.04); box-shadow: inset 0 0 0 1px rgba(201,168,76,.22); }
.hwoFaq summary { cursor: pointer; list-style: none; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 18px; font: 600 15px/1.4 'Inter', sans-serif; color: var(--cream); }
.hwoFaq summary::-webkit-details-marker { display: none; }
.hwoFaq summary::after { content: "🕸️"; flex: none; transition: transform .25s ease; }
.hwoFaq details[open] summary::after { content: "👻"; }
.hwoFaq p { margin: 0; padding: 0 18px 16px; font: 400 14px/1.6 'Inter', sans-serif; color: rgba(245,237,230,.75); }
.hwoEnd { position: relative; overflow: hidden; max-width: 1120px; margin: 64px 12px 0; padding: 48px 20px 150px; border-radius: 30px; text-align: center;
  background: radial-gradient(70% 60% at 50% 110%, rgba(240,134,47,.45), transparent 70%), linear-gradient(180deg, #2a080c, #13050c);
  box-shadow: 0 0 0 1px rgba(201,168,76,.3); }
.hwoEndTitle { margin: 0; font: 600 clamp(28px, 5vw, 46px)/1.1 var(--font-playfair), 'Playfair Display', serif; color: var(--cream); }
.hwoEndGround { position: absolute; left: 0; right: 0; bottom: 0; height: 130px; pointer-events: none; }
.hwoEndGrave { position: absolute; left: 8%; bottom: 0; width: 120px; height: 111px; }
.hwoEndPumpkin { position: absolute; right: 8%; bottom: 0; width: 100px; height: 119px; }

@media (max-width: 767px) {
  .hwoCardGif { width: 72px; height: 72px; }
  /* The layout shell pads 96px under every page for the tab bar; paint it night, not cream. */
  .hwo { margin-bottom: -96px; padding-bottom: 200px; }
}
@media (max-width: 420px) { .hwoKickX { display: none; } }
@media (min-width: 640px) {
  .hwoHero { padding: 76px 32px 160px; }
  .hwoMoon { top: 30px; right: 22%; width: 70px; height: 70px; }
  .hwoWeb { width: 170px; height: 170px; }
  .hwoWeb.tr { width: 150px; height: 194px; }
  .hwoDrop { width: 58px; height: 135px; }
  .hwoGrave { width: 140px; height: 130px; }
  .hwoPumpkin { width: 120px; height: 142px; }
  .hwoSteps { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .hwoSteps li { grid-template-columns: 1fr; grid-template-rows: auto; text-align: center; justify-items: center; padding: 22px 18px; }
  .hwoStepIc { grid-row: auto; }
}
@media (min-width: 768px) {
  .hwo { padding-top: 104px; }
  .hwoHero { max-width: 1240px; margin: 0 auto; border-radius: 40px; }
  .hwoEnd { margin: 72px auto 0; border-radius: 40px; }
  .hwoGrid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 26px; }
}
@media (min-width: 1024px) {
  .hwoHero { padding: 84px 40px 170px; }
  .hwoMoon { right: 9%; top: 150px; width: 96px; height: 96px; }
  .hwoWeb { width: 220px; height: 220px; }
  .hwoWeb.tr { width: 190px; height: 246px; }
  .hwoDrop { left: 20%; width: 66px; height: 154px; }
  .hwoBats { width: 120px; height: 120px; }
  .hwoWitch { width: 140px; height: 140px; }
  .hwoGrave { left: 10%; width: 160px; height: 148px; }
  .hwoPumpkin { right: 10%; width: 140px; height: 166px; }
  .hwoCardGif { width: 110px; height: 110px; }
}
@media (prefers-reduced-motion: reduce) {
  .hwoStars, .hwoFog, .hwoTitleB, .hwoPrice.is-skel { animation: none !important; }
  .hwoFly { display: none; }
}
`;
