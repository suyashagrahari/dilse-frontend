import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChevronDown, LayoutTemplate, Lock, Mail, MessageCircleQuestion, Phone, Share2, Star } from "lucide-react";
import { buildMeta } from "@/lib/seo";
import { BUSINESS } from "@/lib/business";
import LuxuryMobileTopBrand from "@/components/LuxuryMobileTopBrand";

export const metadata: Metadata = buildMeta({
  title: "Help | SubhSandesh",
  description:
    "Find quick help for creating, publishing, and sharing your SubhSandesh celebration pages.",
});

// Each answer describes what the product does today. The questions open with
// native <details>, so the page works — and animates — without any JavaScript.
const faqs = [
  {
    icon: LayoutTemplate,
    q: "How do I create my first page?",
    a: "Go to Templates, pick an occasion, add your photos and message, then publish your page. You can preview everything before you publish.",
  },
  {
    icon: Lock,
    q: "Can I protect my page with a password?",
    a: "Yes. You can turn on password protection while publishing, and share the password only with the people you trust.",
  },
  {
    icon: Lock,
    q: "Can I add or change a password later?",
    a: "Yes. Open Profile → My Pages and tap “Add password” on the page’s card. If it already has one, tap “Password” to see it or change it.",
  },
  {
    icon: Share2,
    q: "How do I share my page?",
    a: "After publishing you get a link. Copy it or use the share button — from the publish screen or from the page’s card in Profile → My Pages.",
  },
  {
    icon: MessageCircleQuestion,
    q: "Who can see my page?",
    a: "Only people who have its link. If you set a password, they also need the password to open it.",
  },
  {
    icon: Mail,
    q: "How do I reach support?",
    a: `Write to ${BUSINESS.email} or call ${BUSINESS.phone.display}. We are available ${BUSINESS.hoursShort}.`,
  },
];

const QUICK = [
  { href: "/templates", label: "Browse templates", Icon: LayoutTemplate },
  { href: "/contact-us", label: "Contact us", Icon: Mail },
  { href: "/feedback", label: "Read reviews", Icon: Star },
];

export default function HelpPage() {
  return (
    <main className="hpPage">
      <LuxuryMobileTopBrand />

      <div className="hpWrap">
        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <section className="hpHero" aria-labelledby="help-title">
          <span className="hpShine" aria-hidden="true" />
          <span className="hpOrb" aria-hidden="true" />
          <span className="hpSpark s1" aria-hidden="true">✦</span>
          <span className="hpSpark s2" aria-hidden="true">♥</span>
          <span className="hpSpark s3" aria-hidden="true">✦</span>

          <div className="hpHeroCopy">
            <p className="hpBadge">
              <span className="hpBadgeDot" aria-hidden="true" />
              Help Center · {BUSINESS.hoursShort}
            </p>
            <h1 id="help-title" className="hpTitle">
              Quick answers <em>for every moment.</em>
            </h1>
            <p className="hpLead">We are here to make your gifting journey simple, warm, and stress-free.</p>
            <nav className="hpQuick" aria-label="Quick links">
              {QUICK.map(({ href, label, Icon }) => (
                <Link key={href} href={href}>
                  <Icon size={14} aria-hidden="true" /> {label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="hpReach">
            <p className="hpReachLabel">Still stuck? Talk to us</p>
            <a className="hpReachRow" href={`mailto:${BUSINESS.email}`}>
              <span className="hpReachIc"><Mail size={16} /></span>
              <span className="hpReachTx"><b>Email</b><span>{BUSINESS.email}</span></span>
              <ArrowRight size={15} className="hpReachGo" aria-hidden="true" />
            </a>
            <a className="hpReachRow" href={`tel:${BUSINESS.phone.tel}`}>
              <span className="hpReachIc"><Phone size={16} /></span>
              <span className="hpReachTx"><b>Phone</b><span>{BUSINESS.phone.display}</span></span>
              <ArrowRight size={15} className="hpReachGo" aria-hidden="true" />
            </a>
          </div>
        </section>

        {/* ── Questions ──────────────────────────────────────────────────── */}
        <section aria-labelledby="help-faq">
          <div className="hpHead">
            <p className="hpEyebrow">Frequently asked</p>
            <h2 id="help-faq" className="hpH2">
              Everything you <em>need to know</em>
            </h2>
          </div>
          <div className="hpList">
            {faqs.map(({ icon: Icon, q, a }, i) => (
              <details key={q} className="hpItem" style={{ animationDelay: `${80 + i * 60}ms` }} open={i === 0}>
                <summary>
                  <span className="hpIc"><Icon size={16} /></span>
                  <span className="hpNum">{String(i + 1).padStart(2, "0")}</span>
                  <span className="hpQ">{q}</span>
                  <ChevronDown size={18} className="hpChev" aria-hidden="true" />
                </summary>
                <p className="hpA">{a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>

      <style>{`
        .hpPage { min-height: 100dvh; background: radial-gradient(900px 480px at 100% 0%, rgba(201,168,76,0.14), transparent 60%), #f5ede6; color: #2a0a0e; overflow-x: hidden }
        .hpWrap { width: 100%; max-width: 1100px; margin: 0 auto; padding: 14px 14px 124px; display: grid; gap: 16px }
        @media (min-width: 600px) { .hpWrap { padding: 22px 24px 124px; gap: 20px } }
        /* The desktop nav is a fixed pill over the page from 768px. */
        @media (min-width: 768px) { .hpWrap { padding-top: 92px } }
        @media (min-width: 1024px) { .hpWrap { padding: 92px 32px 88px } }

        .hpHero {
          position: relative; overflow: hidden; display: grid; gap: 18px; padding: 20px 16px 16px; border-radius: 24px; color: #f5ede6;
          background: radial-gradient(120% 140% at 0% 0%, #6b1a22 0%, #3d0c11 55%, #240609 100%);
          box-shadow: 0 24px 60px -18px rgba(26,5,7,0.42); animation: hpRise 600ms cubic-bezier(0.22,1,0.36,1) backwards;
        }
        @media (min-width: 600px) { .hpHero { padding: 28px 28px 24px } }
        @media (min-width: 900px) { .hpHero { grid-template-columns: minmax(0,1.3fr) minmax(0,1fr); align-items: center; gap: 30px; padding: 34px 36px } }
        .hpShine { position: absolute; top: -60px; bottom: -60px; width: 80px; pointer-events: none; background: linear-gradient(90deg, transparent, rgba(255,236,190,0.14), transparent); animation: hpShine 6s ease-in-out infinite }
        @keyframes hpShine { from { transform: translateX(-160%) rotate(12deg) } to { transform: translateX(1600%) rotate(12deg) } }
        .hpOrb { position: absolute; right: -90px; top: -110px; width: 320px; height: 320px; border-radius: 50%; pointer-events: none; background: radial-gradient(circle, rgba(201,168,76,0.26), transparent 65%) }
        .hpSpark { position: absolute; color: #ffe3a3; opacity: .5; pointer-events: none; animation: hpFloat 5s ease-in-out infinite }
        .hpSpark.s1 { top: 18px; right: 22px; font-size: 14px }
        .hpSpark.s2 { bottom: 18px; left: 50%; font-size: 12px; color: #ffb3c4; animation-delay: 1.2s }
        .hpSpark.s3 { top: 48%; left: 10px; font-size: 10px; animation-delay: 2.4s }
        @keyframes hpFloat { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-8px) } }

        .hpHeroCopy { position: relative; min-width: 0 }
        .hpBadge { display: inline-flex; align-items: center; gap: 8px; margin: 0 0 12px; padding: 6px 13px 6px 10px; border-radius: 999px; background: rgba(255,227,163,0.12); border: 1px solid rgba(255,227,163,0.3); font-size: 11.5px; font-weight: 700; letter-spacing: .04em; color: #ffe3a3 }
        .hpBadgeDot { width: 7px; height: 7px; border-radius: 50%; background: #7ddc96; animation: hpPulse 2400ms ease-out infinite }
        @keyframes hpPulse { 0% { box-shadow: 0 0 0 0 rgba(125,220,150,.6) } 70% { box-shadow: 0 0 0 7px rgba(125,220,150,0) } 100% { box-shadow: 0 0 0 0 rgba(125,220,150,0) } }
        .hpTitle { margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: clamp(30px, 7vw, 50px); line-height: 1.04; font-weight: 800; letter-spacing: -0.02em; color: #fff6e6 }
        .hpTitle em { font-style: italic; color: #ffe3a3 }
        .hpLead { margin: 12px 0 0; max-width: 52ch; font-size: 14px; line-height: 1.6; color: rgba(255,236,210,0.82) }
        @media (min-width: 600px) { .hpLead { font-size: 15px } }
        .hpQuick { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px }
        .hpQuick a { display: inline-flex; align-items: center; gap: 6px; padding: 7px 12px 7px 10px; border-radius: 999px; font-size: 12.5px; font-weight: 700; color: #f5e6d6; text-decoration: none; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,236,190,0.18); transition: transform 160ms ease, background 160ms ease, color 160ms ease }
        .hpQuick a svg { color: #ffe3a3 }
        .hpQuick a:hover { transform: translateY(-2px); background: linear-gradient(135deg, #ffe3a3, #c9a84c); color: #3d0c11 }
        .hpQuick a:hover svg { color: #3d0c11 }

        .hpReach { position: relative; min-width: 0; display: grid; gap: 8px; padding: 14px; border-radius: 18px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,236,190,0.16); backdrop-filter: blur(6px) }
        .hpReachLabel { margin: 0 0 2px; font-size: 10px; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; color: rgba(255,236,210,0.7) }
        .hpReachRow { display: flex; align-items: center; gap: 11px; min-width: 0; padding: 10px; border-radius: 14px; text-decoration: none; color: inherit; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,236,190,0.1); transition: background 160ms ease, transform 160ms ease }
        .hpReachRow:hover { background: rgba(255,255,255,0.1); transform: translateX(3px) }
        .hpReachIc { width: 34px; height: 34px; flex: none; border-radius: 11px; display: grid; place-items: center; color: #3d0c11; background: linear-gradient(135deg, #ffe3a3, #c9a84c) }
        .hpReachTx { flex: 1; min-width: 0; display: flex; flex-direction: column; line-height: 1.25 }
        .hpReachTx b { font-size: 11px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; color: #ffe3a3 }
        .hpReachTx span { font-size: 13.5px; font-weight: 700; color: #fff6e6; overflow-wrap: anywhere }
        .hpReachGo { flex: none; color: #ffe3a3; opacity: .7 }

        .hpHead { margin: 4px 2px 10px }
        .hpEyebrow { margin: 0; font-size: 10.5px; font-weight: 800; letter-spacing: .2em; text-transform: uppercase; color: #8b5a2b }
        .hpH2 { margin: 4px 0 0; font-family: 'Playfair Display', Georgia, serif; font-size: clamp(22px, 5vw, 30px); font-weight: 800; color: #2a0a0e; line-height: 1.1 }
        .hpH2 em { font-style: italic; color: #a8823a }

        .hpList { display: grid; gap: 10px }
        @media (min-width: 900px) { .hpList { grid-template-columns: repeat(2, minmax(0,1fr)); align-items: start; gap: 12px } }
        .hpItem {
          position: relative; overflow: hidden; border-radius: 18px; background: linear-gradient(180deg, #fffdfb, #fff6ee);
          border: 1px solid rgba(61,12,17,0.1); box-shadow: 0 1px 0 rgba(61,12,17,0.03), 0 10px 24px -18px rgba(61,12,17,0.4);
          animation: hpRise 520ms cubic-bezier(0.22,1,0.36,1) backwards; transition: border-color 220ms ease, box-shadow 220ms ease, transform 220ms ease;
        }
        .hpItem::before { content: ""; position: absolute; left: 0; right: 0; top: 0; height: 3px; background: linear-gradient(90deg, #3d0c11, #c9a84c, #ffe3a3); transform: scaleX(0); transform-origin: left; transition: transform 380ms cubic-bezier(0.22,1,0.36,1) }
        .hpItem[open]::before { transform: scaleX(1) }
        .hpItem[open] { border-color: rgba(201,168,76,0.45); box-shadow: 0 16px 32px -20px rgba(61,12,17,0.5) }
        @media (hover: hover) { .hpItem:hover { transform: translateY(-2px); border-color: rgba(201,168,76,0.5) } }
        .hpItem summary { list-style: none; display: flex; align-items: center; gap: 11px; padding: 14px 14px; cursor: pointer; min-width: 0 }
        .hpItem summary::-webkit-details-marker { display: none }
        .hpItem summary:focus-visible { outline: 2px solid #c9a84c; outline-offset: -2px; border-radius: 18px }
        .hpIc { width: 36px; height: 36px; flex: none; border-radius: 12px; display: grid; place-items: center; color: #ffe3a3; background: linear-gradient(135deg, #5a1520, #3d0c11); box-shadow: 0 6px 14px -8px rgba(61,12,17,0.8); transition: transform 260ms cubic-bezier(0.34,1.56,0.64,1) }
        .hpItem[open] .hpIc { transform: rotate(-8deg) scale(1.06) }
        .hpNum { flex: none; font-family: 'Playfair Display', Georgia, serif; font-style: italic; font-size: 15px; font-weight: 800; color: rgba(168,130,58,0.7) }
        .hpQ { flex: 1; min-width: 0; font-size: 14.5px; font-weight: 800; line-height: 1.3; color: #2a0a0e }
        @media (min-width: 600px) { .hpQ { font-size: 15.5px } }
        .hpChev { flex: none; color: #8b5a2b; transition: transform 260ms ease }
        .hpItem[open] .hpChev { transform: rotate(180deg) }
        .hpA { margin: 0; padding: 0 16px 16px 63px; font-size: 14px; line-height: 1.65; color: #6f4c4c; overflow-wrap: anywhere; animation: hpOpen 320ms ease }
        @media (max-width: 420px) { .hpA { padding-left: 16px } }
        @keyframes hpOpen { from { opacity: 0; transform: translateY(-6px) } to { opacity: 1; transform: none } }
        @keyframes hpRise { from { opacity: 0; transform: translateY(16px) scale(0.98) } to { opacity: 1; transform: none } }

        @media (prefers-reduced-motion: reduce) {
          .hpHero, .hpItem, .hpA, .hpShine, .hpSpark, .hpBadgeDot { animation: none }
          .hpItem, .hpItem::before, .hpIc, .hpChev, .hpQuick a, .hpReachRow { transition: none }
        }
      `}</style>
    </main>
  );
}
