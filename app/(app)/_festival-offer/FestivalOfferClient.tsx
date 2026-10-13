"use client";

// ─── The festival drop pages: /dandiya-offer and /diwali-offer ───────────────
//
// One page shape, two festivals that look nothing alike — each painted in its
// own red (components/promo/festivalTheme.ts, as CSS custom properties on the
// root), with its own full-bleed night behind the hero:
//
//   dandiya — a kumkum-red garba night (./DandiyaScene): mandap, garba circle,
//             garbo lamp, dhol, bandhanwar torans, the dancing couple, mirror
//             sparkle. Counts down to Dussehra, 20 October.
//   diwali  — a red-gold Diwali night (./DiwaliScene): a lit haveli with diyas,
//             fireworks, rangoli, the Diwali GIFs. Counts down to Diwali night,
//             8 November.
//
// The offer is laid over the night on frosted glass: the hero %, the countdown,
// "See the template(s)" and "From ₹X". Below: the drop's templates — whatever
// the super admin put in that drop — as the real gallery cards with their admin
// prices (./FestivalDropTemplates), three steps, the FAQ and a closing call.
//
// The first paint — the headline — is pure HTML/CSS with an inline-SVG scene
// behind it; the GIFs arrive after idle into sized boxes, so nothing shifts.
// Every animation stops under reduced motion. Built like /halloween-offer.

import Link from "next/link";
import type { ReactNode } from "react";
import { FestivalLink } from "@/components/promo/FestivalPortal";
import { ArrowRight, Sparkles } from "lucide-react";
import LuxuryMobileTopBrand from "@/components/LuxuryMobileTopBrand";
import IdleGif from "@/components/promo/IdleGif";
import { Dandiya, Diya, Mirror } from "@/components/promo/festivalArt";
import { FT, ftVars } from "@/components/promo/festivalTheme";
import { useSeason } from "@/hooks/useSeason";
import { useNow, countdown, pad2 } from "@/hooks/usePromo";
import { dropSaleOf, DROPS, FESTIVE_GIF, livePercentOf, type FestivalId } from "@/lib/season";
import { festivalFaqs, ENDS_TEXT } from "./content";
import DandiyaScene, { DANDIYA_SCENE_CSS } from "./DandiyaScene";
import DiwaliScene, { DIWALI_SCENE_CSS } from "./DiwaliScene";
import FestivalDropTemplates, { useFestivalDropDiscount, useFestivalDropTemplates } from "./FestivalDropTemplates";
import { useDropFree } from "@/hooks/useDropFree";
import { useTemplatePricing } from "@/hooks/useTemplatePricing";
import { formatINR } from "@/config/templatePricing";
import { useAppSelector } from "@/store/hooks";

type Copy = {
  icon: (size: number) => ReactNode;
  kick: string;
  kickShort: string;
  titleA: ReactNode;
  titleC: string;
  subLong: ReactNode;
  subShort: ReactNode;
  clockKick: string;
  btnIcon: string;
  trustTail: string;
  secTitle: (n: number) => ReactNode;
  secSub: string;
  steps: { ic: string; b: string; s: (pctText: string | null) => string }[];
  stepsTitle: ReactNode;
  faqTitle: ReactNode;
  endTitle: ReactNode;
  endSub: string;
};

const COPY: Record<FestivalId, Copy> = {
  dandiya: {
    icon: (size) => <Mirror size={size} />,
    kick: "Navratri Dandiya drop",
    kickShort: " · till 20 Oct",
    titleA: <>Navratri <i>Dandiya</i> Drop</>,
    titleC: "Ask them to twirl with you",
    subLong: <>Ask the sweetest question of Navratri — <em>Be my Dandiya partner?</em> A twirling, dancing invitation with your photos, your song and your words, answered with a tap.</>,
    subShort: <>Be my <em>Dandiya partner?</em> — sticks, dhol, your photos and your words.</>,
    clockKick: "Ends on Dussehra in",
    btnIcon: "🥢",
    trustTail: "till Dussehra",
    secTitle: (n) => (n === 1 ? <>One invitation, <em>all the twirls</em></> : <>Pick your <em>garba</em> card</>),
    secSub: "Write your words (AI can help), add photos and a song, choose how they answer, and send them one link.",
    steps: [
      { ic: "🥢", b: "Pick your invitation", s: () => "Be My Dandiya Partner — or any card in the drop." },
      { ic: "🪞", b: "Make it yours", s: () => "Your words, your photos, your song — and whether No is even allowed." },
      { ic: "🥁", b: "Send the link", s: (p) => `Publish${p ? ` at ${p} off` : ""} and share it — WhatsApp, Instagram or a QR code.` },
    ],
    stepsTitle: <>Three steps to <em>the garba</em></>,
    faqTitle: <>Questions before <em>the dhol</em></>,
    endTitle: <>Don&apos;t just ask — <em>make them twirl</em></>,
    endSub: "The drop ends at midnight on Dussehra, Tuesday 20 October.",
  },
  diwali: {
    icon: (size) => <Diya size={size} />,
    kick: "The Diwali drop",
    kickShort: " · till 8 Nov",
    titleA: <>The <i>Diwali</i> Drop</>,
    titleC: "Light up someone's Diwali",
    subLong: <>Send a Diwali wish they <em>light up themselves</em> — diyas, rangoli and crackers they burst, with your photos, your song and your words.</>,
    subShort: <>Light up their <em>Diwali</em> — diyas, crackers, your photos and words.</>,
    clockKick: "Ends on Diwali night in",
    btnIcon: "🪔",
    trustTail: "till Diwali night",
    secTitle: (n) => (n === 1 ? <>One card, <em>all the lights</em></> : <>Pick your <em>Diwali</em> card</>),
    secSub: "Write your words (AI can help), add photos and a song, and send them one link they light up.",
    steps: [
      { ic: "🪔", b: "Pick your card", s: () => "Happy Diwali — or any card in the drop." },
      { ic: "✨", b: "Make it yours", s: () => "Your words, your photos, your song — see every scene before you publish." },
      { ic: "🎆", b: "Send the link", s: (p) => `Publish${p ? ` at ${p} off` : ""} and share it — WhatsApp, Instagram or a QR code.` },
    ],
    stepsTitle: <>Three steps, <em>all lights</em></>,
    faqTitle: <>Questions before <em>the first diya</em></>,
    endTitle: <>Don&apos;t just wish them — <em>light it up</em></>,
    endSub: "The drop ends at midnight on Diwali night, Sunday 8 November.",
  },
};

function Countdown({ kind }: { kind: FestivalId }) {
  const t = useNow();
  const endsAt = DROPS[kind].endsAt;
  const c = countdown(endsAt, t || endsAt);
  if (t && c.totalMs <= 0) return null;
  const boxes = [
    { v: c.d, l: "Days" },
    { v: c.h, l: "Hours" },
    { v: c.m, l: "Mins" },
    { v: c.s, l: "Secs" },
  ];
  return (
    <div className="fvoClockWrap">
      <span className="fvoClockKick">{COPY[kind].clockKick}</span>
      <div className="fvoClock" role="timer" aria-label={t ? `Ends in ${c.d} days ${c.h} hours ${c.m} minutes` : `Ends on ${ENDS_TEXT[kind]}`}>
        {boxes.map((b, i) => (
          <span key={b.l} className="fvoCell">
            <b>{t ? pad2(b.v) : "--"}</b>
            <small>{b.l}</small>
            {i < 3 && <i aria-hidden>:</i>}
          </span>
        ))}
      </div>
    </div>
  );
}

const WORDS = ["zero", "one", "two", "three", "four", "five", "six"];

export default function FestivalOfferClient({ kind }: { kind: FestivalId }) {
  const season = useSeason();
  const on = season?.mode === kind;
  const seasonPct = livePercentOf(season, kind);
  const slugs = dropSaleOf(season, kind)?.slugs;
  const drop = useFestivalDropTemplates(kind, slugs);
  // The super admin's numbers: the season percent, unless every template in the
  // drop carries its own discount (from /payment/pricing) — then that one, or
  // "up to" the largest when they differ. Never computed here.
  const own = useFestivalDropDiscount(drop);
  // Every template in the drop made free on /admin/pricing: say FREE, not a percent.
  const free = useDropFree(kind);
  const pct = free ? 0 : on ? (own?.pct ?? seasonPct) : 0;
  const upTo = Boolean(!free && on && own?.upTo);
  const pctText = `${upTo ? "up to " : ""}${pct}%`;
  const faqs = festivalFaqs(kind, pct, upTo, free);
  // The paid entry point: the cheapest priced template in the drop ("From ₹139").
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
  const c = COPY[kind];
  const T = FT[kind];

  return (
    <div className={`fvo fvo-k-${kind}`} style={ftVars(kind)}>
      <style>{FVO_CSS + (kind === "dandiya" ? DANDIYA_SCENE_CSS : DIWALI_SCENE_CSS)}</style>
      <LuxuryMobileTopBrand />

      <section className="fvoHero" aria-labelledby="fvo-title">
        {kind === "dandiya" ? <DandiyaScene /> : <DiwaliScene />}
        <div className="fvoHeroIn">
          <span className="fvoKick">{c.icon(16)} {on ? <>{c.kick}<span className="fvoKickX">{c.kickShort}</span></> : kind === "dandiya" ? "The Navratri collection" : "The Diwali collection"} {c.icon(16)}</span>
          <h1 id="fvo-title" className="fvoTitle">
            <span className="fvoTitleA">{c.titleA}</span>
            {free ? (
              <span className="fvoTitleB"><span className="fvoPct">FREE</span></span>
            ) : pct ? (
              <span className="fvoTitleB">{upTo && <small className="fvoUpTo">up to</small>}<span className="fvoPct">{pct}%</span><small>OFF</small></span>
            ) : (
              <span className="fvoTitleC">{c.titleC}</span>
            )}
          </h1>
          <p className="fvoSub fvoSubLong">
            {c.subLong}{free ? " Free to make and send — no payment." : pct ? " The sale price is applied automatically when you publish." : ""}
          </p>
          {/* Phones get the one-breath version, so the scene fits on the first screen. */}
          <p className="fvoSub fvoSubShort">{c.subShort}</p>
          <div className="fvoGlass">
            {on && <Countdown kind={kind} />}
            <div className="fvoCtas">
              {n > 0 ? (
                <a href="#fvo-templates" className="fvoBtn primary">
                  <span aria-hidden>{c.btnIcon}</span>
                  <span className="fvoBtnLong">See the {n === 1 ? "template" : `${countWord} templates`}</span>
                  <span className="fvoBtnShort">See the drop</span>
                </a>
              ) : (
                <Link href="/templates" className="fvoBtn primary">Browse templates <ArrowRight size={16} aria-hidden /></Link>
              )}
              {first && (
                <FestivalLink href={`/${first.slug}`} className="fvoBtn ghost" prefetch={false}>
                  {free ? <>Make yours · <b className="fvoFrom">free</b></> : cheapest && freeFor ? <>Make yours · <b className="fvoFrom">free for you</b></> : cheapest ? <>From <b className="fvoFrom">{formatINR(cheapest.p.finalPrice)}</b></> : "Make yours"} <ArrowRight size={16} aria-hidden />
                </FestivalLink>
              )}
            </div>
            <p className="fvoTrust"><Sparkles size={13} aria-hidden /> {free ? "Free to make & send · no payment · ready in 2 minutes" : <>{pct ? `${pctText} off ${c.trustTail} · ` : ""}one-time payment · ready in 2 minutes</>}</p>
          </div>
        </div>
      </section>

      <section className="fvoSec" id="fvo-templates" aria-labelledby="fvo-two">
        <p className="fvoSecKick"><span aria-hidden>✨</span> The drop</p>
        <h2 id="fvo-two" className="fvoSecTitle">{c.secTitle(n)}</h2>
        <p className="fvoSecSub">
          {c.secSub}
          {free ? ` ${n === 1 ? "It is" : "Every template here is"} free to make and send ${c.trustTail}.` : pct ? (upTo ? ` Templates here are up to ${pct}% off ${c.trustTail}.` : ` ${n === 1 ? "It is" : "Every template here is"} ${pct}% off ${c.trustTail}.`) : ""}
        </p>
        <div className="fvoFrame">
          <FestivalDropTemplates kind={kind} slugs={slugs} />
        </div>
      </section>

      <section className="fvoSec" aria-labelledby="fvo-how">
        <h2 id="fvo-how" className="fvoSecTitle">{c.stepsTitle}</h2>
        <ol className="fvoSteps">
          {c.steps.map((st) => (
            <li key={st.b}><span className="fvoStepIc">{st.ic}</span><b>{st.b}</b><span>{st.s(pct ? pctText : null)}</span></li>
          ))}
        </ol>
      </section>

      <section className="fvoSec" aria-labelledby="fvo-faq">
        <h2 id="fvo-faq" className="fvoSecTitle">{c.faqTitle}</h2>
        <div className="fvoFaq">
          {faqs.map((f) => (
            <details key={f.q}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="fvoEnd" aria-labelledby="fvo-end">
        {kind === "dandiya" ? (
          <span className="fvoEndArt fvoEndMandala" aria-hidden><Mirror size={240} thread={T.cta} /></span>
        ) : (
          <IdleGif src={FESTIVE_GIF("fireworks-hanabi-skyshot.gif")} width={498} height={498} className="fvoEndSky" />
        )}
        <h2 id="fvo-end" className="fvoEndTitle">{c.endTitle}</h2>
        <p className="fvoSub">{on ? c.endSub : kind === "dandiya" ? "Navratri invitations, ready in minutes." : "Diwali pages, ready in minutes."}</p>
        <div className="fvoCtas">
          {drop.slice(0, 2).map((t, i) => (
            <FestivalLink key={t.slug} href={`/${t.slug}`} className={`fvoBtn ${i === 0 ? "primary" : "ghost"}`} prefetch={false}>
              <span aria-hidden>{kind === "dandiya" ? <Dandiya size={18} /> : "🪔"}</span> {t.title}
            </FestivalLink>
          ))}
        </div>
        <div className="fvoEndGround" aria-hidden>
          {kind === "dandiya" ? (
            <>
              <span className="fvoEndCouple"><IdleGif src={FESTIVE_GIF("dandiyapartyner.webp")} width={240} height={240} className="fvoEndImg" /></span>
              <IdleGif src={FESTIVE_GIF("bubudubu-dandiya-playing.webp")} width={240} height={236} className="fvoEndDiya" />
            </>
          ) : (
            <>
              <span className="fvoEndCouple"><IdleGif src={FESTIVE_GIF("celebration-with-crackers-dudu.webp")} width={240} height={240} className="fvoEndImg" /></span>
              <IdleGif src={FESTIVE_GIF("happy-diwali-diya.webp")} width={451} height={498} className="fvoEndDiya" />
            </>
          )}
        </div>
      </section>
    </div>
  );
}

const FVO_CSS = `
.fvoFrom { font-weight: 800; color: var(--ft-gold-soft); margin-left: 2px; }
.fvo { position: relative; min-height: 100vh; overflow-x: clip; color: var(--ft-text); padding: 0 0 110px;
  background: linear-gradient(180deg, var(--ft-sky1) 0%, var(--ft-sky2) 38%, color-mix(in srgb, var(--ft-ink) 92%, #000) 100%); }
.fvo em { font-style: italic; color: var(--ft-cta); }

/* ── hero: the full-bleed festival night ─────────────────────────────── */
.fvoHero { position: relative; isolation: isolate; overflow: hidden; padding: 64px 16px 340px; background: var(--ft-sky); }
.fvoHero::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 90px; z-index: 1; pointer-events: none;
  background: linear-gradient(180deg, transparent, var(--ft-sky1)); }
.fvoHeroIn { position: relative; z-index: 4; max-width: 600px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; text-align: center; }
.fvoKick { white-space: nowrap; display: inline-flex; align-items: center; gap: 8px; padding: 8px 14px; border-radius: 999px; color: var(--ft-gold-soft);
  border: 1px solid var(--ft-edge); background: var(--ft-glass); -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
  font: 800 10.5px/1 'Inter', sans-serif; letter-spacing: .2em; text-transform: uppercase; }
.fvoKick svg { color: var(--ft-gold); }
.fvoTitle { margin: 18px 0 0; display: flex; flex-direction: column; align-items: center; gap: 4px; }
.fvoTitleA { font: 700 clamp(38px, 7vw, 76px)/1 var(--font-cinzel), 'Cinzel', 'Playfair Display', serif; letter-spacing: .02em; color: var(--ft-text);
  text-shadow: 0 0 30px var(--ft-glow), 0 3px 0 var(--ft-ink); }
.fvoTitleA i { font-style: normal; color: var(--ft-cta); }
.fvoTitleB { display: inline-flex; align-items: flex-start; gap: 8px; }
.fvoPct { font: 800 clamp(80px, 17vw, 168px)/.9 var(--font-playfair), 'Playfair Display', serif;
  background: linear-gradient(180deg, #fff1c9 13%, var(--ft-flame) 38%, var(--ft-cta) 59%, var(--ft-cta-deep) 83%); -webkit-background-clip: text; background-clip: text; color: transparent;
  filter: drop-shadow(0 6px 34px var(--ft-glow)); animation: fvoFlicker 5s ease-in-out infinite;
  /* background-clip:text only paints inside the padding box, and the tight .9 line box
     is shorter than Playfair's digits: pad the box so the 9's tail and the % are painted,
     then pull the margins back so the layout (and the one-screen hero) is unchanged. */
  padding: .1em .04em .2em; margin: -.1em -.04em -.2em; }
.fvoTitleB small { margin-top: .5em; font: 800 clamp(18px, 3vw, 30px)/1 'Inter', sans-serif; letter-spacing: .16em; color: var(--ft-gold-soft); }
.fvoTitleB .fvoUpTo { letter-spacing: .1em; text-transform: uppercase; }
@keyframes fvoFlicker { 0%, 46%, 100% { opacity: 1; } 47% { opacity: .7; } 48% { opacity: 1; } 51% { opacity: .82; } 52% { opacity: 1; } }
.fvoTitleC { font: italic 600 clamp(28px, 4.6vw, 48px)/1.1 var(--font-playfair), 'Playfair Display', serif; color: var(--ft-cta); text-shadow: 0 0 26px var(--ft-glow); }
.fvoSub { max-width: 32rem; margin: 16px auto 0; font: 400 15px/1.6 'Inter', sans-serif; color: var(--ft-muted); text-shadow: 0 1px 12px color-mix(in srgb, var(--ft-ink) 90%, transparent); }
.fvoSub em { color: var(--ft-flame); }
.fvoGlass { width: 100%; max-width: 440px; margin-top: 22px; padding: 18px 16px 16px; border-radius: 26px; display: flex; flex-direction: column; align-items: center;
  background: var(--ft-glass); -webkit-backdrop-filter: blur(16px) saturate(130%); backdrop-filter: blur(16px) saturate(130%);
  box-shadow: inset 0 0 0 1px var(--ft-edge), inset 0 1px 0 rgba(255,255,255,.08), 0 30px 60px -30px color-mix(in srgb, var(--ft-ink) 95%, transparent); }
.fvoClockWrap { width: 100%; display: flex; flex-direction: column; align-items: center; gap: 10px; margin-bottom: 18px; }
.fvoClockKick { font: 700 10px/1 'Inter', sans-serif; letter-spacing: .22em; text-transform: uppercase; color: var(--ft-gold); }
.fvoClock { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; width: 100%; }
.fvoCell { position: relative; display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 12px 0 10px; border-radius: 16px;
  background: color-mix(in srgb, var(--ft-ink) 55%, transparent); box-shadow: inset 0 0 0 1px rgba(244,201,93,.18), inset 0 -10px 20px -14px var(--ft-glow); }
.fvoCell b { font: 800 26px/1 'Inter', sans-serif; font-variant-numeric: tabular-nums; color: #fff; text-shadow: 0 0 16px rgba(255,195,90,.45); }
.fvoCell small { font: 700 9px/1 'Inter', sans-serif; letter-spacing: .16em; text-transform: uppercase; color: var(--ft-gold-soft); opacity: .85; }
.fvoCell i { position: absolute; right: -7px; top: 12px; font: 800 18px/1 'Inter', sans-serif; font-style: normal; color: rgba(255,238,205,.35); }
.fvoCtas { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
.fvoBtn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 15px 22px; border-radius: 999px; text-decoration: none;
  font: 800 14.5px/1 'Inter', sans-serif; transition: transform .2s ease, box-shadow .2s ease; }
.fvoBtn.primary { color: var(--ft-cta-ink); background: linear-gradient(180deg, var(--ft-gold-soft), var(--ft-cta)); box-shadow: 0 14px 30px -12px var(--ft-cta), inset 0 1px 0 rgba(255,255,255,.5); }
.fvoBtn.ghost { color: var(--ft-text); background: rgba(244,201,93,.1); box-shadow: inset 0 0 0 1.5px rgba(244,201,93,.5); }
.fvoBtn:hover { transform: translateY(-2px); }
.fvoTrust { display: inline-flex; align-items: center; gap: 6px; margin: 14px 0 0; font: 500 12px/1.4 'Inter', sans-serif; color: rgba(255,238,205,.6); }

/* ── sections ─────────────────────────────────────────────────────────── */
.fvoSec { position: relative; max-width: 1180px; margin: 0 auto; padding: 56px 16px 0; text-align: center; }
.fvoSecKick { display: inline-flex; align-items: center; gap: 6px; margin: 0 0 8px; color: var(--ft-cta); font: 800 11px/1 'Inter', sans-serif; letter-spacing: .22em; text-transform: uppercase; }
.fvoSecTitle { margin: 0; font: 600 clamp(28px, 4.4vw, 44px)/1.1 var(--font-playfair), 'Playfair Display', serif; color: var(--ft-text); }
.fvoSecSub { max-width: 36rem; margin: 10px auto 0; font: 400 14.5px/1.6 'Inter', sans-serif; color: var(--ft-muted); }
.fvoFrame { position: relative; margin: 0 -4px; }
.fvoSteps { display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; margin: 26px 0 0; padding: 0; list-style: none; text-align: left; }
.fvoSteps li { display: grid; grid-template-columns: 48px 1fr; grid-template-rows: auto auto; column-gap: 14px; row-gap: 3px; align-items: center; padding: 16px 18px; border-radius: 20px;
  background: var(--ft-glass); -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px); box-shadow: inset 0 0 0 1px var(--ft-edge); }
.fvoStepIc { grid-row: 1 / 3; width: 48px; height: 48px; border-radius: 16px; display: grid; place-items: center; font-size: 24px; background: rgba(255,176,32,.14); box-shadow: inset 0 0 0 1px rgba(255,176,32,.25); }
.fvoSteps b { font: 700 16px/1.2 'Inter', sans-serif; color: var(--ft-text); }
.fvoSteps li > span:last-child { font: 400 13.5px/1.5 'Inter', sans-serif; color: var(--ft-muted); }
.fvoFaq { max-width: 760px; margin: 24px auto 0; display: flex; flex-direction: column; gap: 10px; text-align: left; }
.fvoFaq details { border-radius: 18px; background: var(--ft-glass); -webkit-backdrop-filter: blur(12px); backdrop-filter: blur(12px); box-shadow: inset 0 0 0 1px var(--ft-edge); }
.fvoFaq details[open] { box-shadow: inset 0 0 0 1px var(--ft-glow), 0 0 30px -12px var(--ft-glow); }
.fvoFaq summary { cursor: pointer; list-style: none; display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px 18px; font: 600 15px/1.4 'Inter', sans-serif; color: var(--ft-text); }
.fvoFaq summary::-webkit-details-marker { display: none; }
.fvoFaq summary::after { content: "🪔"; flex: none; }
.fvoFaq details[open] summary::after { content: "✨"; }
.fvoFaq p { margin: 0; padding: 0 18px 16px; font: 400 14px/1.6 'Inter', sans-serif; color: var(--ft-muted); }

.fvoEnd { position: relative; isolation: isolate; overflow: hidden; max-width: 1180px; margin: 64px 12px 0; padding: 52px 20px 160px; border-radius: 30px; text-align: center;
  background: radial-gradient(60% 50% at 50% 115%, var(--ft-glow), transparent 70%), var(--ft-sky);
  box-shadow: inset 0 0 0 1px var(--ft-edge), 0 40px 80px -40px rgba(0,0,0,.9); }
.fvoEnd .fvoCtas { margin-top: 22px; }
.fvoEndSky { position: absolute; top: -34px; right: -34px; z-index: -1; width: 120px; height: 120px; opacity: .75; pointer-events: none; mix-blend-mode: screen; }
.fvoEndMoon { position: absolute; z-index: -1; top: 16px; left: 16px; width: 40px; height: 40px; border-radius: 50%;
  background: radial-gradient(circle at 38% 36%, #fffbe6, var(--ft-gold-soft) 55%, #ead48a); box-shadow: 0 0 50px 14px var(--ft-glow); }
.fvoEndTitle { margin: 0; font: 600 clamp(28px, 5vw, 48px)/1.1 var(--font-playfair), 'Playfair Display', serif; color: var(--ft-text); }
.fvoEndGround { position: absolute; left: 0; right: 0; bottom: 0; height: 130px; pointer-events: none; z-index: -1;
  background: radial-gradient(70% 100% at 50% 100%, color-mix(in srgb, var(--ft-ink) 90%, transparent), transparent 75%); }
.fvoEndCouple { position: absolute; left: 6%; bottom: 0; width: 104px; height: 104px; transform-origin: 50% 100%; animation: fvoSway 2.2s ease-in-out infinite; }
.fvoEndImg { width: 100%; height: 100%; }
@keyframes fvoSway { 0%, 100% { transform: rotate(-4deg); } 50% { transform: rotate(4deg) translateY(-4px); } }
.fvoEndDiya { position: absolute; right: 7%; bottom: 0; width: 94px; height: 104px; filter: drop-shadow(0 0 18px var(--ft-glow)); }

.fvoSubShort, .fvoBtnShort { display: none; }
@media (max-width: 767px) {
  /* The layout shell pads 96px under every page for the tab bar; paint it night, not cream. */
  .fvo { margin-bottom: -96px; padding-bottom: 200px; }
  /* The night starts at y=0: the hero slides up under the mobile brand bar's
     84px spacer, so the sky and the corner webs run to the very top edge. */
  .fvoHero { margin-top: -84px; padding: 86px 14px 0; min-height: max(640px, calc(100svh - 34px)); }
  .fvoHero::after { height: 60px; }
  .fvoKick { padding: 7px 12px; font-size: 9.5px; }
  .fvoTitle { margin-top: 12px; gap: 0; }
  .fvoTitleA { font-size: clamp(30px, 9vw, 40px); }
  .fvoPct { font-size: clamp(64px, 19vw, 84px); }
  .fvoTitleB small { font-size: 16px; }
  .fvoSubLong { display: none; }
  .fvoSubShort { display: block; max-width: 22rem; margin-top: 8px; font-size: 14px; line-height: 1.5; }
  /* compact glass: a slim clock and the two buttons side by side */
  .fvoGlass { margin-top: 14px; padding: 12px 12px 12px; border-radius: 22px; max-width: 380px; }
  .fvoClockWrap { gap: 7px; margin-bottom: 11px; }
  .fvoClockKick { font-size: 9px; }
  .fvoClock { gap: 6px; }
  .fvoCell { gap: 4px; padding: 8px 0 7px; border-radius: 12px; }
  .fvoCell b { font-size: 21px; }
  .fvoCell small { font-size: 8px; }
  .fvoCell i { top: 8px; right: -5.5px; font-size: 14px; }
  .fvoGlass .fvoCtas { flex-wrap: nowrap; gap: 8px; width: 100%; }
  .fvoGlass .fvoBtn { flex: 1 1 0; min-width: 0; padding: 13px 10px; font-size: 13.5px; white-space: nowrap; }
  .fvoGlass .fvoTrust { display: none; }
  .fvoBtnLong { display: none; }
  .fvoBtnShort { display: inline; }
}
@media (max-width: 420px) { .fvoKickX { display: none; } }
@media (min-width: 640px) {
  .fvoHero { padding: 100px 32px 380px; }
  .fvoSteps { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .fvoSteps li { grid-template-columns: 1fr; grid-template-rows: auto; text-align: center; justify-items: center; padding: 22px 18px; }
  .fvoStepIc { grid-row: auto; }
  .fvoEndSky { top: -10px; right: -10px; width: 220px; height: 220px; opacity: 1; }
  }
@media (min-width: 768px) {
  .fvoEnd { margin: 80px auto 0; border-radius: 40px; }
}
@media (min-width: 1024px) {
  /* desktop: copy on the left, the house on the right, one full-bleed night that is
     exactly one screen (the floating navbar included): every size keys on the
     viewport height as well as its width, so 1280×720 and 1920×1080 both fit. */
  .fvoHero { height: 100vh; height: 100svh; min-height: 600px; box-sizing: border-box; display: flex; align-items: center;
    padding: clamp(80px, 11.5vh, 116px) 0 clamp(18px, 4vh, 48px); }
  .fvoHeroIn { margin: 0 0 0 max(6vw, calc((100vw - 1240px) / 2)); max-width: min(600px, 46vw); align-items: flex-start; text-align: left; }
  .fvoKick { padding: clamp(6px, .9vh, 8px) 13px; font-size: clamp(9.5px, 1.35vh, 10.5px); }
  .fvoTitle { align-items: flex-start; margin-top: clamp(8px, 1.8vh, 18px); gap: 0; }
  .fvoTitleA { font-size: clamp(32px, min(3.3vw, 5.8vh), 56px); white-space: nowrap; }
  .fvoPct { font-size: clamp(72px, min(10.5vw, 15.5vh), 160px); margin-bottom: -.13em; }
  .fvoTitleB small { font-size: clamp(16px, 2.7vh, 28px); }
  .fvoUpTo { margin-right: 2px; }
  .fvoHero .fvoSub { margin: clamp(6px, 1.4vh, 14px) 0 0; font-size: clamp(13.5px, 1.95vh, 16px); line-height: 1.55; max-width: 30rem; }
  .fvoGlass { align-items: stretch; max-width: 460px; margin-top: clamp(12px, 2.4vh, 24px); padding: clamp(12px, 2.1vh, 22px) clamp(16px, 2vh, 22px) clamp(11px, 1.8vh, 18px); }
  .fvoGlass .fvoCtas { justify-content: flex-start; }
  .fvoClockWrap { align-items: flex-start; gap: clamp(6px, 1.1vh, 10px); margin-bottom: clamp(9px, 1.9vh, 18px); }
  .fvoCell { padding: clamp(7px, 1.25vh, 12px) 0 clamp(6px, 1.05vh, 10px); gap: clamp(3px, .6vh, 6px); }
  .fvoCell b { font-size: clamp(21px, 3.3vh, 30px); }
  .fvoCell i { top: clamp(7px, 1.25vh, 12px); }
  .fvoBtn { padding: clamp(11px, 1.75vh, 15px) 22px; }
  .fvoTrust { align-self: flex-start; margin-top: clamp(8px, 1.5vh, 14px); }
  .fvoEndCouple { width: 140px; height: 140px; }
  .fvoEndDiya { width: 126px; height: 140px; }
}
@media (prefers-reduced-motion: reduce) {
  .fvoPct, .fvoEndCouple, .fvoEndMandala { animation: none !important; }
}

/* ── Dandiya: bandhani dots under the sections, mirror-stitched glass, a twirl on the FAQ ── */
.fvo-k-dandiya::before { content: ""; position: absolute; inset: 0; z-index: 0; pointer-events: none; opacity: .18;
  background: radial-gradient(circle at 50% 50%, rgba(255,240,220,.7) 0 1.3px, transparent 1.8px) 0 0 / 22px 22px; }
.fvo > section { position: relative; z-index: 1; }
.fvo-k-dandiya .fvoGlass { box-shadow: inset 0 0 0 1px var(--ft-edge), inset 0 0 0 5px color-mix(in srgb, var(--ft-ink) 25%, transparent), inset 0 0 0 6px color-mix(in srgb, var(--ft-gold) 40%, transparent), 0 30px 60px -30px color-mix(in srgb, var(--ft-ink) 95%, transparent); }
.fvo-k-dandiya .fvoCell { border-radius: 50% 50% 14px 14px / 34% 34% 14px 14px; }
.fvo-k-dandiya .fvoFaq summary::after { content: "🥢"; }
.fvo-k-dandiya .fvoFaq details[open] summary::after { content: "🪞"; }
.fvo-k-dandiya .fvoTitleA { text-shadow: 0 0 30px rgba(255,61,154,.45), 0 3px 0 var(--ft-ink); }
.fvoEndArt { position: absolute; z-index: -1; pointer-events: none; }
.fvoEndArt svg { display: block; }
.fvoEndMandala { top: -60px; right: -60px; opacity: .35; animation: fvoSpin 50s linear infinite; }
@keyframes fvoSpin { to { transform: rotate(360deg); } }
`;
