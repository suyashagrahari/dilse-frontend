import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Clapperboard, Heart, Home, Lock, Sparkles, Zap } from "lucide-react";
import { buildMeta } from "@/lib/seo";
import LuxuryMobileTopBrand from "@/components/LuxuryMobileTopBrand";

export const metadata: Metadata = buildMeta({
  title: "The Manifesto | SubhSandesh",
  description:
    "The SubhSandesh manifesto: emotion-first design, privacy by default, and cinematic delivery for meaningful digital gifting.",
});

const principles = [
  {
    id: "01",
    Icon: Heart,
    title: "Emotion First",
    body: "Every interaction should feel human. We design for butterflies, tears, laughter, and memory - not just clicks.",
  },
  {
    id: "02",
    Icon: Lock,
    title: "Privacy by Default",
    body: "Your memories are personal. We keep surprise pages protected and shareable only with the people you choose.",
  },
  {
    id: "03",
    Icon: Clapperboard,
    title: "Cinematic by Design",
    body: "Motion, music, and typography should work together like a short film. Every page should feel premium and alive.",
  },
  {
    id: "04",
    Icon: Zap,
    title: "Fast Everywhere",
    body: "Moments should open instantly, on any device. We optimize for real-world phones, networks, and edge delivery.",
  },
];

const steps = [
  {
    step: "1",
    title: "Pick The Right Template",
    text: "Choose by emotion first (love, apology, celebration), then personalize for the person.",
  },
  {
    step: "2",
    title: "Add Real Memories",
    text: "Use your own photos, voice, and music. Personal assets create the strongest emotional impact.",
  },
  {
    step: "3",
    title: "Publish With Intention",
    text: "Preview before sharing, add password when needed, and send it at the perfect moment.",
  },
];

const CORNER_FILTER =
  "brightness(0) saturate(100%) invert(8%) sepia(55%) saturate(2800%) hue-rotate(330deg) brightness(90%) contrast(120%)";

// The four alekhan corners are part of the page's identity and stay exactly as
// they were; `willChange` only gives each its own layer so the recolour filter
// is painted once instead of on every scroll frame.
const corner = (pos: React.CSSProperties, size: string, opacity: number, transform?: string): React.CSSProperties => ({
  position: "fixed",
  ...pos,
  width: size,
  height: size,
  opacity,
  transform,
  filter: CORNER_FILTER,
  willChange: "transform",
});

export default function ManifestoPage() {
  return (
    <main className="mfPage">
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://cdn.subhsandesh.in/gifts-media/indianFestival/alekhancorner2.svg" alt="" aria-hidden="true" style={corner({ top: 0, left: 0 }, "clamp(112px, 30vw, 180px)", 0.62, "scaleY(-1)")} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://cdn.subhsandesh.in/gifts-media/indianFestival/alekhancorner2.svg" alt="" aria-hidden="true" style={corner({ top: 0, right: 0 }, "clamp(112px, 30vw, 180px)", 0.62, "scale(-1,-1)")} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://cdn.subhsandesh.in/gifts-media/indianFestival/alekhancorner2.svg" alt="" aria-hidden="true" style={corner({ bottom: 0, left: 0 }, "clamp(86px, 24vw, 170px)", 0.54)} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://cdn.subhsandesh.in/gifts-media/indianFestival/alekhancorner2.svg" alt="" aria-hidden="true" style={corner({ bottom: 0, right: 0 }, "clamp(86px, 24vw, 170px)", 0.54, "scaleX(-1)")} />
      </div>
      <LuxuryMobileTopBrand />

      <div className="mfWrap">
        {/* ── Hero ─────────────────────────────────────────────────────────── */}
        <section className="mfHero" aria-labelledby="mf-title">
          <span className="mfShine" aria-hidden="true" />
          <span className="mfOrb" aria-hidden="true" />
          <span className="mfSpark s1" aria-hidden="true">✦</span>
          <span className="mfSpark s2" aria-hidden="true">♥</span>
          <span className="mfSpark s3" aria-hidden="true">✦</span>

          <p className="mfBadge">
            <Sparkles size={12} aria-hidden="true" /> The Manifesto
          </p>
          <h1 id="mf-title" className="mfTitle">
            Design The Moment.
            <br />
            <em>Deliver The Feeling.</em>
          </h1>
          <p className="mfLead">
            SubhSandesh exists to turn simple messages into meaningful experiences. Instead of sending plain text, you
            send a crafted moment that feels personal, alive, and unforgettable.
          </p>
          <div className="mfHeroLine" aria-hidden="true">
            <span />
            <b>♥</b>
            <span />
          </div>
        </section>

        {/* ── Principles ───────────────────────────────────────────────────── */}
        <section aria-labelledby="mf-principles">
          <div className="mfHead">
            <p className="mfEyebrow">What we stand for</p>
            <h2 id="mf-principles" className="mfH2">
              Our Core <em>Principles</em>
            </h2>
            <p className="mfSub">Every template, animation, and interaction follows these fundamentals.</p>
          </div>

          <div className="mfGrid">
            {principles.map(({ id, Icon, title, body }, i) => (
              <article key={id} className="mfCard mfReveal" style={{ animationDelay: `${i * 90}ms` }}>
                <span className="mfNum" aria-hidden="true">{id}</span>
                <span className="mfIc"><Icon size={20} /></span>
                <h3 className="mfCardTitle">{title}</h3>
                <p className="mfCardBody">{body}</p>
              </article>
            ))}
          </div>
        </section>

        {/* ── How to create ────────────────────────────────────────────────── */}
        <section className="mfSteps mfReveal" aria-labelledby="mf-steps">
          <div className="mfHead" style={{ marginBottom: 18 }}>
            <p className="mfEyebrow">Three steps</p>
            <h2 id="mf-steps" className="mfH2">
              Best Way To Create <em>The Perfect Surprise</em>
            </h2>
          </div>
          <ol className="mfTimeline">
            {steps.map((item, i) => (
              <li key={item.step} className="mfStep" style={{ animationDelay: `${120 + i * 110}ms` }}>
                <span className="mfDot" aria-hidden="true">{item.step}</span>
                <div className="mfStepBody">
                  <p className="mfStepKick">Step {item.step}</p>
                  <h3 className="mfStepTitle">{item.title}</h3>
                  <p className="mfStepText">{item.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ── Call to action ───────────────────────────────────────────────── */}
        <section className="mfCta mfReveal" aria-labelledby="mf-cta">
          <span className="mfShine" aria-hidden="true" />
          <span className="mfOrb" aria-hidden="true" />
          <h2 id="mf-cta" className="mfCtaTitle">
            Build Something <em>Unforgettable.</em>
          </h2>
          <p className="mfCtaText">
            Pick a template. Add your story. Publish a private link. One moment can become a forever memory.
          </p>
          <div className="mfCtaBtns">
            <Link href="/templates" className="mfBtn gold">
              <Sparkles size={15} aria-hidden="true" /> Start Building <ArrowRight size={15} aria-hidden="true" />
            </Link>
            <Link href="/" className="mfBtn ghost">
              <Home size={15} aria-hidden="true" /> Back To Home
            </Link>
          </div>
        </section>
      </div>

      <style>{`
        .mfPage { min-height: 100dvh; overflow-x: hidden; color: #2a0a0e; font-family: 'Inter', sans-serif;
          background: radial-gradient(900px 480px at 100% 0%, rgba(201,168,76,0.14), transparent 60%), #f5ede6; }
        .mfWrap { position: relative; z-index: 1; width: 100%; max-width: 1100px; margin: 0 auto; padding: 14px 14px 124px; display: grid; gap: 22px; }
        @media (min-width: 600px) { .mfWrap { padding: 22px 24px 124px; gap: 28px } }
        /* The desktop nav is a fixed pill over the page from 768px. */
        @media (min-width: 768px) { .mfWrap { padding-top: 96px } }
        @media (min-width: 1024px) { .mfWrap { padding: 96px 32px 88px } }

        /* ── Hero ── */
        .mfHero, .mfCta { position: relative; overflow: hidden; border-radius: 26px; color: #f5ede6; text-align: center;
          background: radial-gradient(120% 140% at 50% 0%, #6b1a22 0%, #3d0c11 55%, #240609 100%);
          box-shadow: 0 24px 60px -18px rgba(26,5,7,0.45); }
        .mfHero { padding: 34px 18px 26px; animation: mfRise .7s cubic-bezier(.22,1,.36,1) backwards; }
        @media (min-width: 600px) { .mfHero { padding: 52px 40px 36px } }
        .mfShine { position: absolute; top: -60px; bottom: -60px; width: 90px; pointer-events: none;
          background: linear-gradient(90deg, transparent, rgba(255,236,190,0.14), transparent); animation: mfShine 6.5s ease-in-out infinite; }
        @keyframes mfShine { from { transform: translateX(-200%) rotate(12deg) } to { transform: translateX(1600%) rotate(12deg) } }
        .mfOrb { position: absolute; right: -100px; top: -120px; width: 340px; height: 340px; border-radius: 50%; pointer-events: none;
          background: radial-gradient(circle, rgba(201,168,76,0.28), transparent 65%); }
        .mfSpark { position: absolute; color: #ffe3a3; opacity: .55; pointer-events: none; animation: mfFloat 5s ease-in-out infinite }
        .mfSpark.s1 { top: 22px; left: 26px; font-size: 14px }
        .mfSpark.s2 { top: 40px; right: 34px; font-size: 13px; color: #ffb3c4; animation-delay: 1.2s }
        .mfSpark.s3 { bottom: 26px; left: 18%; font-size: 10px; animation-delay: 2.4s }
        @keyframes mfFloat { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-8px) } }
        .mfBadge { position: relative; display: inline-flex; align-items: center; gap: 7px; margin: 0 0 14px; padding: 6px 14px; border-radius: 99px;
          font-size: 11px; font-weight: 800; letter-spacing: .24em; text-transform: uppercase; color: #ffe3a3;
          background: rgba(255,227,163,0.12); border: 1px solid rgba(255,227,163,0.3); }
        .mfTitle { position: relative; margin: 0; font-family: 'Playfair Display', Georgia, serif; font-weight: 800; letter-spacing: -0.03em;
          font-size: clamp(38px, 9vw, 76px); line-height: .98; color: #fff6e6; }
        .mfTitle em { font-style: italic; color: #ffe3a3; text-shadow: 0 8px 30px rgba(255,210,120,0.3) }
        .mfLead { position: relative; margin: 16px auto 0; max-width: 62ch; font-size: 14.5px; line-height: 1.65; color: rgba(255,236,210,0.84) }
        @media (min-width: 600px) { .mfLead { font-size: 16.5px } }
        .mfHeroLine { position: relative; display: flex; align-items: center; justify-content: center; gap: 12px; margin-top: 22px; color: #ffb3c4 }
        .mfHeroLine span { width: 70px; height: 1px; background: linear-gradient(90deg, transparent, rgba(255,227,163,0.6), transparent) }
        .mfHeroLine b { font-size: 13px; animation: mfBeat 1.6s ease-in-out infinite }
        @keyframes mfBeat { 0%,100% { transform: scale(1) } 50% { transform: scale(1.25) } }

        /* ── Section heads ── */
        .mfHead { text-align: center; margin-bottom: 16px }
        .mfEyebrow { margin: 0; font-size: 10.5px; font-weight: 800; letter-spacing: .24em; text-transform: uppercase; color: #8b5a2b }
        .mfH2 { margin: 6px 0 0; font-family: 'Playfair Display', Georgia, serif; font-weight: 800; letter-spacing: -0.02em;
          font-size: clamp(28px, 6.4vw, 50px); line-height: 1.02; color: #2a0a0e }
        .mfH2 em { font-style: italic; color: #a8823a }
        .mfSub { margin: 8px auto 0; max-width: 52ch; font-size: 13.5px; color: #7a5555 }

        /* ── Principle cards ── */
        .mfGrid { display: grid; grid-template-columns: minmax(0,1fr); gap: 12px }
        @media (min-width: 720px) { .mfGrid { grid-template-columns: repeat(2, minmax(0,1fr)); gap: 16px } }
        .mfCard { position: relative; overflow: hidden; border-radius: 22px; padding: 20px 18px 18px; min-width: 0;
          background: linear-gradient(180deg, #fffdfb 0%, #fff5ea 100%); border: 1px solid rgba(61,12,17,0.1);
          box-shadow: 0 1px 0 rgba(61,12,17,0.03), 0 14px 30px -22px rgba(61,12,17,0.45);
          transition: transform .3s cubic-bezier(.22,1,.36,1), border-color .3s ease; }
        @media (min-width: 600px) { .mfCard { padding: 24px 24px 22px } }
        .mfCard::before { content: ""; position: absolute; left: 0; right: 0; top: 0; height: 3px;
          background: linear-gradient(90deg, #3d0c11, #c9a84c, #ffe3a3); transform: scaleX(0); transform-origin: left; transition: transform .45s cubic-bezier(.22,1,.36,1) }
        .mfCard::after { content: ""; position: absolute; top: 0; bottom: 0; left: -45%; width: 35%; pointer-events: none; opacity: 0;
          background: linear-gradient(100deg, transparent, rgba(255,236,190,0.5), transparent); transform: skewX(-14deg) }
        .mfNum { position: absolute; right: 14px; top: 2px; font-family: 'Playfair Display', Georgia, serif; font-style: italic; font-weight: 800;
          font-size: 76px; line-height: 1; color: rgba(201,168,76,0.16); pointer-events: none; transition: color .3s ease, transform .3s ease }
        .mfIc { position: relative; width: 44px; height: 44px; border-radius: 14px; display: grid; place-items: center; color: #ffe3a3;
          background: radial-gradient(120% 120% at 0% 0%, #6b1a22, #3d0c11); box-shadow: 0 10px 22px -12px rgba(61,12,17,0.8);
          transition: transform .35s cubic-bezier(.34,1.56,.64,1) }
        .mfCardTitle { position: relative; margin: 14px 0 6px; font-family: 'Playfair Display', Georgia, serif; font-weight: 800;
          font-size: clamp(24px, 5vw, 30px); line-height: 1.08; color: #2a0a0e }
        .mfCardBody { position: relative; margin: 0; font-size: 14.5px; line-height: 1.65; color: #6f4c4c }
        @media (hover: hover) {
          .mfCard:hover { transform: translateY(-5px); border-color: rgba(201,168,76,0.55) }
          .mfCard:hover::before { transform: scaleX(1) }
          .mfCard:hover::after { opacity: 1; left: 130%; transition: left .85s ease, opacity .2s ease }
          .mfCard:hover .mfIc { transform: rotate(-8deg) scale(1.08) }
          .mfCard:hover .mfNum { color: rgba(201,168,76,0.3); transform: translateY(-3px) }
        }

        /* ── Steps timeline ── */
        .mfSteps { border-radius: 26px; padding: 24px 16px; background: rgba(255,253,251,0.78); border: 1px solid rgba(61,12,17,0.1);
          box-shadow: 0 14px 30px -24px rgba(61,12,17,0.45) }
        @media (min-width: 600px) { .mfSteps { padding: 34px 32px } }
        .mfTimeline { position: relative; list-style: none; margin: 0; padding: 0; display: grid; gap: 14px }
        .mfTimeline::before { content: ""; position: absolute; left: 21px; top: 22px; bottom: 22px; width: 2px;
          background: linear-gradient(180deg, #c9a84c, rgba(201,168,76,0.15)); }
        @media (min-width: 860px) {
          .mfTimeline { grid-template-columns: repeat(3, minmax(0,1fr)); gap: 16px }
          .mfTimeline::before { left: 44px; right: 44px; top: 21px; bottom: auto; width: auto; height: 2px;
            background: linear-gradient(90deg, #c9a84c, rgba(201,168,76,0.2)); }
        }
        .mfStep { position: relative; display: flex; gap: 14px; align-items: flex-start; min-width: 0; animation: mfRise .6s cubic-bezier(.22,1,.36,1) backwards }
        @media (min-width: 860px) { .mfStep { flex-direction: column } }
        .mfDot { position: relative; z-index: 1; flex: none; width: 44px; height: 44px; border-radius: 50%; display: grid; place-items: center;
          font-family: 'Playfair Display', Georgia, serif; font-style: italic; font-weight: 800; font-size: 19px; color: #3d0c11;
          background: linear-gradient(135deg, #ffe3a3, #c9a84c); box-shadow: 0 0 0 5px #fffaf4, 0 10px 20px -10px rgba(168,130,58,0.8) }
        .mfStepBody { flex: 1; min-width: 0; padding: 14px 16px; border-radius: 18px; background: linear-gradient(180deg, #fffdfb, #fff5ea);
          border: 1px solid rgba(61,12,17,0.08); transition: transform .3s cubic-bezier(.22,1,.36,1), border-color .3s ease }
        @media (hover: hover) { .mfStep:hover .mfStepBody { transform: translateY(-3px); border-color: rgba(201,168,76,0.5) } }
        .mfStepKick { margin: 0; font-size: 10.5px; font-weight: 800; letter-spacing: .2em; text-transform: uppercase; color: #a8823a }
        .mfStepTitle { margin: 4px 0 6px; font-family: 'Playfair Display', Georgia, serif; font-weight: 800; font-size: 21px; line-height: 1.12; color: #2a0a0e }
        .mfStepText { margin: 0; font-size: 13.5px; line-height: 1.6; color: #6f4c4c }

        /* ── CTA ── */
        .mfCta { padding: 34px 18px 30px }
        @media (min-width: 600px) { .mfCta { padding: 48px 40px 42px } }
        .mfCtaTitle { position: relative; margin: 0; font-family: 'Playfair Display', Georgia, serif; font-weight: 800; letter-spacing: -0.03em;
          font-size: clamp(32px, 7.5vw, 60px); line-height: 1; color: #fff6e6 }
        .mfCtaTitle em { font-style: italic; color: #ffe3a3 }
        .mfCtaText { position: relative; margin: 14px auto 24px; max-width: 54ch; font-size: 14.5px; line-height: 1.6; color: rgba(255,236,210,0.82) }
        .mfCtaBtns { position: relative; display: flex; flex-direction: column; gap: 10px; align-items: stretch; max-width: 420px; margin: 0 auto }
        @media (min-width: 560px) { .mfCtaBtns { flex-direction: row; justify-content: center; max-width: none } }
        .mfBtn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 50px; padding: 0 24px; border-radius: 99px;
          font-size: 13px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; text-decoration: none; transition: transform .2s ease, box-shadow .2s ease, background .2s ease }
        .mfBtn.gold { color: #3d0c11; background: linear-gradient(135deg, #ffe3a3, #c9a84c); box-shadow: 0 14px 30px -12px rgba(201,168,76,0.7) }
        .mfBtn.ghost { color: #fff6e6; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,236,190,0.28) }
        .mfBtn:hover { transform: translateY(-2px) }
        .mfBtn.ghost:hover { background: rgba(255,255,255,0.14) }

        /* ── Reveal ── cards rise in on load, and — where the browser supports
           scroll-driven animations — as they scroll into view. */
        .mfReveal { animation: mfRise .7s cubic-bezier(.22,1,.36,1) backwards }
        @supports (animation-timeline: view()) {
          .mfReveal { animation: mfRise linear backwards; animation-timeline: view(); animation-range: entry 0% entry 40%; animation-delay: 0s !important }
        }
        @keyframes mfRise { from { opacity: 0; transform: translateY(22px) } to { opacity: 1; transform: none } }

        @media (prefers-reduced-motion: reduce) {
          .mfHero, .mfReveal, .mfStep, .mfShine, .mfSpark, .mfHeroLine b { animation: none }
          .mfCard, .mfCard::before, .mfIc, .mfNum, .mfStepBody, .mfBtn { transition: none }
        }
      `}</style>
    </main>
  );
}
