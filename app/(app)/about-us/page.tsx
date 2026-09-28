import type { Metadata } from "next";
import Image from "next/image";
import {
  Cake,
  Flame,
  Github,
  Globe,
  Heart,
  Instagram,
  Linkedin,
  Lock,
  Moon,
  Palette,
  Sparkles,
  Twitter,
  Users,
  Wand2,
} from "lucide-react";
import { buildMeta, SITE_URL } from "@/lib/seo";
import { BRAND } from "@/lib/brand";
import { BUSINESS } from "@/lib/business";
import LuxuryMobileTopBrand from "@/components/LuxuryMobileTopBrand";
import BusinessDetails from "@/components/legal/BusinessDetails";

export const metadata: Metadata = buildMeta({
  title: "About Us | SubhSandesh",
  description:
    "Learn about SubhSandesh and how we craft heartfelt Indian celebration pages with premium design and emotion-first storytelling.",
  alternates: { canonical: `${SITE_URL}/about-us` },
});

const LINKS = {
  linkedin: "https://www.linkedin.com/in/suyash-agrahari-717260228/",
  portfolio: "https://portfolio-website-mu-fawn-27.vercel.app/",
  twitter: "https://x.com/SuyashAgrahari?t=VicKG-jlXCCOPL5IAX4xOQ&s=08",
  github: "https://github.com/suyashagrahari",
  instagram: "https://www.instagram.com/suyash_agrahari_?igsh=MWx2Z2R0aWY0ZWZocw==",
};

const SOCIALS = [
  { href: LINKS.linkedin, label: "LinkedIn", Icon: Linkedin },
  { href: LINKS.github, label: "GitHub", Icon: Github },
  { href: LINKS.twitter, label: "Twitter", Icon: Twitter },
  { href: LINKS.portfolio, label: "Portfolio", Icon: Globe },
  { href: LINKS.instagram, label: "Instagram", Icon: Instagram },
] as const;

/** The moments the story names — weddings, birthdays, Eid, Holi, Diwali, milestones. */
const MAKES = [
  { Icon: Heart, title: "Weddings & love", text: "Pages for the two of you and everyone who blessed you." },
  { Icon: Cake, title: "Birthdays", text: "A surprise they open, replay and keep." },
  { Icon: Moon, title: "Eid Mubarak", text: "Warm wishes for family near and far." },
  { Icon: Palette, title: "Holi", text: "Colour, joy and memories in one link." },
  { Icon: Flame, title: "Diwali", text: "Light a diya for the people you love." },
  { Icon: Sparkles, title: "Every milestone", text: "Anniversaries, apologies, thank-yous and more." },
] as const;

const VALUES = [
  { Icon: Heart, title: "Emotion first", text: "Feelings, blessings and family stories come before features." },
  { Icon: Users, title: "Made for all of India", text: "Every state, language, religion and tradition should feel at home." },
  { Icon: Lock, title: "Private by design", text: "Your moment is shared with the people you choose." },
  { Icon: Wand2, title: "Premium, not plain", text: "Beyond chats and simple posts — pages worth revisiting for years." },
] as const;

const STATS = [
  { big: "∞", small: "festivals & moments" },
  { big: BUSINESS.hoursShort, small: "support, all days" },
  { big: BUSINESS.established.split(" ").pop() ?? "", small: "building since" },
] as const;

export default function AboutUsPage() {
  return (
    <main className="auPage">
      <LuxuryMobileTopBrand />

      <div className="auWrap">
        {/* ── Hero: the founder's headline and the mission, in one maroon card ── */}
        <section className="auHero" aria-labelledby="about-title">
          <span className="auShine" aria-hidden="true" />
          <span className="auOrb" aria-hidden="true" />
          <span className="auSpark s1" aria-hidden="true">✦</span>
          <span className="auSpark s2" aria-hidden="true">♥</span>
          <span className="auSpark s3" aria-hidden="true">✦</span>

          {/* The founder himself, up front in the hero rather than in a card
              further down: the page is a founder's message, so the face goes
              next to the words. */}
          <div className="auFace">
            <div className="auPortrait">
              <Image
                src="https://cdn.subhsandesh.in/gifts-media/aboutUs/144600880.webp"
                alt="Suyash Agrahari"
                fill
                sizes="(max-width: 900px) 104px, 240px"
                style={{ objectFit: "cover" }}
                priority
              />
            </div>
            <div className="auFaceText">
              <p className="auFaceName">Suyash Agrahari</p>
              <p className="auFaceRole">Founder, SubhSandesh</p>
              <div className="auSocials">
                {SOCIALS.map(({ href, label, Icon }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label}>
                    <Icon size={15} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="auHeroCopy">
            <p className="auBadge">
              <span className="auBadgeDot" aria-hidden="true" />
              Founder Message
            </p>
            <h1 id="about-title" className="auTitle">
              I am Suyash Agrahari,
              <em> Founder of SubhSandesh.</em>
            </h1>
            <p className="auLead">
              In India, celebrations are not just events — they are emotions, blessings, memories, and family
              stories. SubhSandesh helps you express love in a deeper way.
            </p>
          </div>

          <div className="auMission">
            <p className="auMissionLabel">Our motto</p>
            <p className="auMissionText">
              &ldquo;Turn feelings into unforgettable <em>digital memories.</em>&rdquo;
            </p>
            <ul className="auStats">
              {STATS.map((s) => (
                <li key={s.small}>
                  <b>{s.big}</b>
                  <span>{s.small}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── Story ────────────────────────────────────────────────────────── */}
        <div className="auGrid">
          <article className="auCard auStory auReveal" style={{ animationDelay: "80ms" }}>
            <p className="auEyebrow">Our story</p>
            <h2 className="auH2">Why I Created This</h2>
            <p>
              I created SubhSandesh because in India, celebrations are not just events — they are emotions, blessings,
              memories, and family stories. I wanted to build something that helps people express love in a deeper way,
              beyond plain chats and simple posts.
            </p>
            <p>
              My dream is to connect hearts across all Indian states, languages, and traditions — from every religion,
              every family, every festival, every special moment. Whether someone celebrates a wedding, birthday, Eid,
              Holi, Diwali, or any personal milestone, SubhSandesh should feel like home.
            </p>
            <p>
              My motto is simple:
              <strong> turn feelings into unforgettable digital memories.</strong> Not just pages, but moments people
              can revisit for years with the same smile and emotion.
            </p>
          </article>

        </div>

        {/* ── What we make ─────────────────────────────────────────────────── */}
        <section className="auSection auReveal" aria-labelledby="about-makes">
          <div className="auSectionHead">
            <p className="auEyebrow">What we make</p>
            <h2 id="about-makes" className="auH2">
              Pages for every <em>celebration</em>
            </h2>
          </div>
          <ul className="auTiles">
            {MAKES.map(({ Icon, title, text }, i) => (
              <li key={title} className="auCard auTile auReveal" style={{ animationDelay: `${Math.min(i, 6) * 60}ms` }}>
                <span className="auIc" aria-hidden="true">
                  <Icon size={17} />
                </span>
                <div className="auTileText">
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Values ───────────────────────────────────────────────────────── */}
        <section className="auSection auReveal" aria-labelledby="about-values">
          <div className="auSectionHead">
            <p className="auEyebrow">What we believe</p>
            <h2 id="about-values" className="auH2">
              Our <em>values</em>
            </h2>
          </div>
          <ul className="auValues">
            {VALUES.map(({ Icon, title, text }, i) => (
              <li key={title} className="auCard auValue auReveal" style={{ animationDelay: `${i * 70}ms` }}>
                <span className="auNum" aria-hidden="true">0{i + 1}</span>
                <span className="auIc" aria-hidden="true">
                  <Icon size={17} />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* ── The registered business — same component, same facts ─────────── */}
        <div className="auBiz auReveal">
          <BusinessDetails />
        </div>
      </div>

      <style>{`
        .auPage {
          min-height: 100dvh; overflow-x: hidden; color: ${BRAND.text}; font-family: 'Inter', sans-serif;
          background: radial-gradient(900px 480px at 100% 0%, rgba(201,168,76,0.14), transparent 60%), ${BRAND.bg};
        }
        /* Phones: LuxuryMobileTopBrand already reserves its own 84px spacer, and
           the BottomNav floats at the bottom — hence the tall bottom padding.
           768+: the desktop nav is a fixed pill whose lower edge sits at ~74px. */
        .auWrap { width: 100%; max-width: 1080px; margin: 0 auto; padding: 4px 14px 124px; display: grid; gap: 14px }
        @media (min-width: 600px) { .auWrap { padding: 12px 24px 124px; gap: 18px } }
        @media (min-width: 768px) { .auWrap { padding-top: 92px } }
        @media (min-width: 1024px) { .auWrap { padding: 92px 32px 88px } }

        /* ── Hero ─────────────────────────────────────────────────────────── */
        .auHero {
          position: relative; overflow: hidden; display: grid; gap: 18px; min-width: 0;
          padding: 22px 16px 16px; border-radius: 24px; color: ${BRAND.bg};
          background: radial-gradient(120% 140% at 0% 0%, #6b1a22 0%, #3d0c11 55%, #240609 100%);
          box-shadow: ${BRAND.shadowElevated};
          animation: auRise 600ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @media (min-width: 600px) { .auHero { padding: 30px 28px 24px } }
        @media (min-width: 900px) {
          .auHero { grid-template-columns: 220px minmax(0, 1.25fr) minmax(0, 1fr); align-items: center; gap: 30px; padding: 32px 34px }
        }
        .auShine {
          position: absolute; top: -60px; bottom: -60px; width: 80px; pointer-events: none;
          background: linear-gradient(90deg, transparent, rgba(255,236,190,0.14), transparent);
          animation: auShine 6s ease-in-out infinite;
        }
        @keyframes auShine { from { transform: translateX(-160%) rotate(12deg) } to { transform: translateX(1600%) rotate(12deg) } }
        .auOrb {
          position: absolute; right: -90px; top: -110px; width: 320px; height: 320px; border-radius: 50%; pointer-events: none;
          background: radial-gradient(circle, rgba(201,168,76,0.26), transparent 65%);
        }
        .auSpark { position: absolute; color: #ffe3a3; opacity: 0.5; pointer-events: none; animation: auFloat 5s ease-in-out infinite }
        .auSpark.s1 { top: 18px; right: 22px; font-size: 14px }
        .auSpark.s2 { bottom: 18px; left: 48%; font-size: 12px; color: #ffb3c4; animation-delay: 1.2s }
        .auSpark.s3 { top: 52%; left: 8px; font-size: 10px; animation-delay: 2.4s }
        @keyframes auFloat { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-8px) } }

        .auHeroCopy { position: relative; min-width: 0 }
        .auBadge {
          display: inline-flex; align-items: center; gap: 8px; margin: 0 0 12px;
          padding: 6px 13px 6px 10px; border-radius: 999px;
          background: rgba(255,227,163,0.12); border: 1px solid rgba(255,227,163,0.3);
          font-size: 11.5px; font-weight: 700; letter-spacing: 0.04em; color: #ffe3a3;
        }
        .auBadgeDot { width: 7px; height: 7px; flex: none; border-radius: 50%; background: #ffd66b; animation: auPulse 2400ms ease-out infinite }
        @keyframes auPulse {
          0% { box-shadow: 0 0 0 0 rgba(255,214,107,0.6) }
          70% { box-shadow: 0 0 0 7px rgba(255,214,107,0) }
          100% { box-shadow: 0 0 0 0 rgba(255,214,107,0) }
        }
        .auTitle {
          margin: 0; font-family: 'Playfair Display', Georgia, serif;
          font-size: clamp(30px, 7.4vw, 52px); line-height: 1.04; font-weight: 800; letter-spacing: -0.02em; color: #fff6e6;
        }
        .auTitle em { font-style: italic; color: #ffe3a3 }
        .auLead { margin: 12px 0 0; max-width: 54ch; font-size: 14px; line-height: 1.6; color: rgba(255,236,210,0.82) }
        @media (min-width: 600px) { .auLead { font-size: 15px } }

        .auMission {
          position: relative; min-width: 0; padding: 16px; border-radius: 18px;
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,236,190,0.16); backdrop-filter: blur(6px);
          animation: auRise 700ms 120ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @media (min-width: 600px) { .auMission { padding: 20px 22px } }
        .auMissionLabel { margin: 0 0 6px; font-size: 10.5px; font-weight: 800; letter-spacing: 0.24em; text-transform: uppercase; color: rgba(255,227,163,0.8) }
        .auMissionText { margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: clamp(19px, 4.6vw, 24px); line-height: 1.3; font-weight: 700; color: #fff6e6 }
        .auMissionText em { font-style: italic; color: #ffe3a3 }
        .auStats { list-style: none; margin: 14px 0 0; padding: 12px 0 0; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; border-top: 1px solid rgba(255,236,190,0.16) }
        .auStats li { min-width: 0; display: flex; flex-direction: column; gap: 2px }
        .auStats b { font-family: 'Playfair Display', Georgia, serif; font-size: 24px; line-height: 1; font-weight: 800; color: #ffe3a3; text-shadow: 0 6px 20px rgba(255,210,120,0.35) }
        .auStats span { font-size: 11px; line-height: 1.3; color: rgba(255,236,210,0.72) }

        /* ── Paper cards ──────────────────────────────────────────────────── */
        .auCard {
          position: relative; overflow: hidden; min-width: 0; border-radius: 20px;
          background: linear-gradient(180deg, #fffdfb 0%, #fff6ee 100%);
          border: 1px solid ${BRAND.border};
          box-shadow: 0 1px 0 rgba(61,12,17,0.03), 0 10px 24px -18px rgba(61,12,17,0.4);
          transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 260ms ease, border-color 260ms ease;
        }
        .auCard::before {
          content: ""; position: absolute; left: 0; right: 0; top: 0; height: 3px; z-index: 2;
          background: linear-gradient(90deg, #3d0c11, #c9a84c, #ffe3a3);
          transform: scaleX(0); transform-origin: left; transition: transform 380ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .auCard::after {
          content: ""; position: absolute; top: 0; bottom: 0; left: -45%; width: 35%; pointer-events: none;
          background: linear-gradient(100deg, transparent, rgba(255,236,190,0.45), transparent); transform: skewX(-14deg); opacity: 0;
        }
        @media (hover: hover) {
          .auCard:hover { transform: translateY(-4px); border-color: rgba(201,168,76,0.6); box-shadow: 0 22px 40px -20px rgba(61,12,17,0.5) }
          .auCard:hover::before { transform: scaleX(1) }
          .auCard:hover::after { opacity: 1; left: 130%; transition: left 800ms ease, opacity 200ms ease }
          .auCard:hover .auIc { transform: scale(1.1) rotate(-8deg) }
        }

        .auEyebrow { margin: 0 0 4px; font-size: 10.5px; font-weight: 800; letter-spacing: 0.26em; text-transform: uppercase; color: #7d5f18 }
        .auH2 { margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: clamp(24px, 5.6vw, 32px); line-height: 1.08; font-weight: 800; letter-spacing: -0.02em; color: ${BRAND.text} }
        .auH2 em { font-style: italic; color: #8a6a1c }

        .auGrid { display: grid; gap: 14px; min-width: 0 }
        @media (min-width: 600px) { .auGrid { gap: 18px } }


        .auStory { padding: 18px 16px }
        @media (min-width: 600px) { .auStory { padding: 24px 26px } }
        .auStory .auH2 { margin-bottom: 10px }
        .auStory p:not(.auEyebrow) { position: relative; z-index: 1; margin: 0 0 10px; font-size: 14.5px; line-height: 1.65; color: #7a5555 }
        .auStory p:last-child { margin-bottom: 0 }
        .auStory strong { color: ${BRAND.text}; font-weight: 700 }

        /* Founder: a compact row on phones (photo + name + socials), a portrait
           card beside the story from 860. */
        /* Face block: portrait beside name + socials on a phone, a tall
           framed portrait with the name under it on desktop. */
        .auFace { position: relative; z-index: 1; display: flex; align-items: center; gap: 14px; min-width: 0 }
        @media (min-width: 900px) { .auFace { flex-direction: column; align-items: stretch; text-align: center; gap: 12px } }
        .auPortrait {
          position: relative; flex: none; width: 96px; height: 96px; border-radius: 22px; overflow: hidden;
          box-shadow: 0 0 0 3px #3d0c11, 0 0 0 5px #c9a84c, 0 18px 36px -12px rgba(0,0,0,0.6), 0 0 40px rgba(255,210,120,0.25);
          transform: rotate(-3deg); animation: auFloat 6s ease-in-out infinite;
        }
        @media (min-width: 600px) { .auPortrait { width: 116px; height: 116px } }
        @media (min-width: 900px) { .auPortrait { width: 100%; height: auto; aspect-ratio: 4 / 5; border-radius: 26px } }
        .auPortrait img { transition: transform 600ms cubic-bezier(0.22, 1, 0.36, 1) }
        @media (hover: hover) { .auFace:hover .auPortrait img { transform: scale(1.06) } }
        @keyframes auFloat { 0%,100% { transform: rotate(-3deg) translateY(0) } 50% { transform: rotate(-1deg) translateY(-6px) } }
        .auFaceText { min-width: 0 }
        .auFaceName { margin: 0; font-family: 'Playfair Display', Georgia, serif; font-size: 20px; font-weight: 800; color: #fff6e6; line-height: 1.1 }
        .auFaceRole { margin: 3px 0 9px; font-size: 12px; font-weight: 700; letter-spacing: .04em; color: #ffe3a3; opacity: .85 }
        .auSocials { display: flex; flex-wrap: wrap; gap: 6px }
        @media (min-width: 900px) { .auSocials { justify-content: center } }
        .auSocials a {
          display: inline-flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%;
          color: #ffe3a3; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,236,190,0.22); text-decoration: none;
          transition: transform 180ms ease, background 180ms ease, color 180ms ease;
        }
        .auSocials a:hover { transform: translateY(-3px); background: linear-gradient(135deg, #ffe3a3, #c9a84c); color: #3d0c11; border-color: transparent }
        .auSocials a:focus-visible { outline: 2px solid #ffe3a3; outline-offset: 2px }

        /* ── Sections ─────────────────────────────────────────────────────── */
        .auSection { display: grid; gap: 10px; min-width: 0 }
        .auSectionHead { padding: 6px 2px 0 }
        .auIc {
          width: 36px; height: 36px; flex: none; border-radius: 12px; display: grid; place-items: center;
          color: #ffe3a3; background: ${BRAND.gradient}; box-shadow: 0 8px 16px -8px rgba(61,12,17,0.7);
          transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1);
        }
        .auTiles, .auValues { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px }
        .auTiles { grid-template-columns: repeat(2, minmax(0, 1fr)) }
        @media (min-width: 760px) { .auTiles { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px } }
        .auTile { display: flex; flex-direction: column; gap: 9px; padding: 13px }
        @media (min-width: 600px) { .auTile { flex-direction: row; align-items: flex-start; gap: 12px; padding: 16px } }
        .auTileText { position: relative; z-index: 1; min-width: 0 }
        .auTile h3, .auValue h3 { margin: 0; font-size: 14px; font-weight: 800; color: ${BRAND.text} }
        .auTile p, .auValue p { margin: 3px 0 0; font-size: 12.5px; line-height: 1.5; color: #7a5555 }

        .auValues { grid-template-columns: minmax(0, 1fr) }
        @media (min-width: 560px) { .auValues { grid-template-columns: repeat(2, minmax(0, 1fr)) } }
        @media (min-width: 960px) { .auValues { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px } }
        .auValue { display: grid; grid-template-columns: auto minmax(0, 1fr); column-gap: 12px; row-gap: 2px; align-items: center; padding: 14px 16px }
        .auValue .auIc { grid-row: span 2 }
        .auValue p { grid-column: 2 }
        @media (min-width: 960px) {
          .auValue { grid-template-columns: minmax(0, 1fr); row-gap: 8px; align-items: start; padding: 18px 16px }
          .auValue .auIc { grid-row: auto }
          .auValue p { grid-column: auto; margin-top: 0 }
        }
        .auNum {
          position: absolute; right: 12px; top: 6px; font-family: 'Playfair Display', Georgia, serif;
          font-size: 30px; font-weight: 800; font-style: italic; color: rgba(201,168,76,0.22); pointer-events: none;
        }

        .auBiz { min-width: 0 }
        .auBiz > section { background: linear-gradient(180deg, #fffdfb 0%, #fff6ee 100%) !important; box-shadow: 0 10px 24px -18px rgba(61,12,17,0.4) }

        /* ── Motion ───────────────────────────────────────────────────────────
           Everything rises in on load; where the browser supports scroll-driven
           animations, cards below the fold rise as they scroll into view instead.
           Pure CSS, so the page is fully visible without JavaScript. The fill is
           "backwards", not "both": a held end state would pin transform and
           cancel the hover lift. */
        @keyframes auRise { from { opacity: 0; transform: translateY(16px) scale(0.98) } to { opacity: 1; transform: none } }
        .auReveal { animation: auRise 600ms cubic-bezier(0.22, 1, 0.36, 1) backwards }
        @supports (animation-timeline: view()) {
          .auReveal { animation: auRise linear backwards; animation-timeline: view(); animation-range: entry 0% entry 55%; animation-delay: 0ms !important }
        }

        @media (prefers-reduced-motion: reduce) {
          .auHero, .auMission, .auReveal { animation: none !important }
          .auShine, .auSpark, .auBadgeDot { animation: none }
          .auCard, .auCard::before, .auIc, .auSocials a, .auPortrait img { transition: none }
          .auPortrait { animation: none }
        }
      `}</style>
    </main>
  );
}
