"use client";

// ─── The influencer pitch ────────────────────────────────────────────────────
//
// What a creator sees before they've joined. It has to answer, in order:
// "what do I get?" (money, for good), "how?" (post → link in bio → earn),
// "how much, for someone like me?" (the calculator and the example creators),
// "what would I even post?" (content ideas) and "what's the catch?" (FAQ).
//
// Every figure in the examples is illustrative and labelled as such; the
// calculator's assumptions are visible and adjustable, never a promise.

import { useMemo, useState, type ReactNode } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ArrowRight, Instagram, Youtube, MessageCircle, Link2, IndianRupee, Infinity as InfinityIcon,
  BarChart3, Wallet, Sparkles, Clapperboard, Smartphone, Heart, ChevronDown, Check, Users, Zap, Gift,
} from "lucide-react";
import { BRAND } from "@/lib/brand";

const fmt = (n: number) => "₹" + Math.round(n).toLocaleString("en-IN");

export default function InfluencerPitch({
  percent,
  attributionDays,
  cta,
  compact = false,
}: {
  percent: number;
  attributionDays: number;
  /** The primary call to action (sign in, or scroll to the signup form). */
  cta: { label: string; onClick: () => void };
  /** Signed-in, not-yet-influencer view: the form follows, so skip the closing CTA. */
  compact?: boolean;
}) {
  const reduce = useReducedMotion();
  const fade = (i = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, amount: "some" as const },
          transition: { duration: 0.5, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <div className="ip">
      <style>{CSS}</style>

      {/* ── Hero ── */}
      <section className="ip-hero">
        <span aria-hidden className="ip-glow ip-glow-a" />
        <span aria-hidden className="ip-glow ip-glow-b" />
        <div className="ip-hero-grid">
          <div className="ip-hero-copy">
            <motion.span {...fade(0)} className="ip-eyebrow"><Sparkles size={13} /> SubhSandesh Creator Program</motion.span>
            <motion.h1 {...fade(1)}>
              Turn your reels into <span className="ip-gold">income</span>, forever.
            </motion.h1>
            <motion.p {...fade(2)} className="ip-lead">
              Post content about SubhSandesh on Instagram, YouTube or WhatsApp. Everyone who joins through your link
              is yours for life, and you earn <b>{percent}%</b> of every premium template they ever buy.
            </motion.p>
            <motion.div {...fade(3)} className="ip-hero-cta">
              <button type="button" className="ip-btn" onClick={cta.onClick}>
                {cta.label} <ArrowRight size={17} />
              </button>
              <span className="ip-hero-note"><Check size={14} /> Free to join · No follower minimum</span>
            </motion.div>
            <motion.div {...fade(4)} className="ip-platforms">
              <span><Instagram size={15} /> Reels</span>
              <span><Youtube size={15} /> Shorts</span>
              <span><MessageCircle size={15} /> WhatsApp</span>
              <span><Link2 size={15} /> Link in bio</span>
            </motion.div>
          </div>

          <HeroVisual percent={percent} reduce={!!reduce} />
        </div>
      </section>

      {/* ── Proof strip ── */}
      <section className="ip-strip">
        {[
          { icon: <IndianRupee size={18} />, big: `${percent}%`, small: "of every sale" },
          { icon: <InfinityIcon size={18} />, big: "Lifetime", small: "referrals stay yours" },
          { icon: <BarChart3 size={18} />, big: "Live", small: "earnings dashboard" },
          { icon: <Wallet size={18} />, big: "UPI", small: "payouts" },
        ].map((s, i) => (
          <motion.div key={s.small} {...fade(i)} className="ip-strip-item">
            <span className="ip-strip-ic">{s.icon}</span>
            <b>{s.big}</b>
            <span>{s.small}</span>
          </motion.div>
        ))}
      </section>

      {/* ── How it works ── */}
      <Section kicker="How it works" title="Three steps. One link. Income that keeps coming.">
        <div className="ip-steps">
          {[
            { icon: <Clapperboard size={20} />, t: "Make one video", d: "Film yourself making a birthday or apology surprise, or your partner's reaction opening it. 30 seconds is enough." },
            { icon: <Link2 size={20} />, t: "Put your link in bio", d: "Use your own name link, like yourname.subhsandesh.in. Pin it, add it to stories, or drop it in the YouTube description." },
            { icon: <IndianRupee size={20} />, t: "Earn on every sale", d: `Followers sign up through you and make surprises. Each time one pays, you get ${percent}%, today and every time after.` },
          ].map((s, i) => (
            <motion.div key={s.t} {...fade(i)} className="ip-step">
              <span className="ip-step-n">0{i + 1}</span>
              <span className="ip-step-ic">{s.icon}</span>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── Calculator ── */}
      <Section kicker="Earnings calculator" title="See what your audience could earn you">
        <Calculator percent={percent} />
      </Section>

      {/* ── Example creators ── */}
      <Section kicker="Examples" title="What this looks like for creators like you">
        <div className="ip-examples">
          {EXAMPLES(percent).map((e, i) => (
            <motion.article key={e.name} {...fade(i)} className="ip-ex">
              <div className="ip-ex-head">
                <span className="ip-ex-ava" style={{ background: e.color }}>{e.icon}</span>
                <div>
                  <b>{e.name}</b>
                  <span>{e.who}</span>
                </div>
              </div>
              <p className="ip-ex-story">{e.story}</p>
              <ul className="ip-ex-math">
                {e.math.map((m) => (
                  <li key={m[0]}><span>{m[0]}</span><b>{m[1]}</b></li>
                ))}
              </ul>
              <div className="ip-ex-total">
                <span>Earns about</span>
                <b>{e.total}<small>/month</small></b>
              </div>
            </motion.article>
          ))}
        </div>
        <p className="ip-fine">Illustrative examples based on typical conversion rates, not guaranteed earnings. Your results depend on your audience and content.</p>
      </Section>

      {/* ── Content ideas ── */}
      <Section kicker="Content ideas" title="Not sure what to post? Steal these.">
        <div className="ip-ideas">
          {IDEAS.map((idea, i) => (
            <motion.div key={idea.t} {...fade(i % 3)} className="ip-idea">
              <span className="ip-idea-tag" style={{ color: idea.tone, background: `${idea.tone}14` }}>{idea.icon} {idea.platform}</span>
              <h3>{idea.t}</h3>
              <p>{idea.d}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── Why ── */}
      <Section kicker="Why creators pick us" title="Built to be fair to you">
        <div className="ip-why">
          {[
            { icon: <InfinityIcon size={18} />, t: "Lifetime attribution", d: "A follower who joins through you is yours forever, not just for 24 hours." },
            { icon: <Users size={18} />, t: "See every referral", d: "Names, the templates they made, free or paid, and exactly what you earned from each." },
            { icon: <Zap size={18} />, t: `${attributionDays}-day memory`, d: `If someone taps your link and signs up up to ${attributionDays} days later, it still counts.` },
            { icon: <Gift size={18} />, t: "Easy to sell", d: "Free templates to start, so followers try it without risk, and premium ones they love to buy." },
          ].map((w, i) => (
            <motion.div key={w.t} {...fade(i)} className="ip-why-item">
              <span>{w.icon}</span>
              <div>
                <b>{w.t}</b>
                <p>{w.d}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ── FAQ ── */}
      <Section kicker="FAQ" title="Questions creators ask">
        <Faq percent={percent} days={attributionDays} />
      </Section>

      {!compact && (
        <section className="ip-final">
          <span aria-hidden className="ip-glow ip-glow-a" />
          <h2>Your followers already celebrate birthdays, anniversaries and apologies.</h2>
          <p>Get paid every time they do it with SubhSandesh.</p>
          <button type="button" className="ip-btn ip-btn-light" onClick={cta.onClick}>
            {cta.label} <ArrowRight size={17} />
          </button>
        </section>
      )}
    </div>
  );
}

// ── Hero visual: a phone with a reel and live earning notifications ─────────

function HeroVisual({ percent, reduce }: { percent: number; reduce: boolean }) {
  const toasts = [
    { name: "Rahul", what: "Birthday Surprise", amt: Math.round(149 * percent) / 100 },
    { name: "Ananya", what: "Apology Dashboard", amt: Math.round(199 * percent) / 100 },
    { name: "Karan", what: "Proposal", amt: Math.round(249 * percent) / 100 },
  ];
  return (
    <div className="ip-visual" aria-hidden>
      <div className="ip-phone">
        <div className="ip-phone-notch" />
        <div className="ip-reel">
          <div className="ip-reel-top"><Instagram size={14} /> Reels</div>
          <div className="ip-reel-center">
            <span className="ip-reel-emoji">🎁</span>
            <p>&ldquo;Made her this birthday surprise in 5 mins 😭❤️&rdquo;</p>
          </div>
          <div className="ip-reel-bottom">
            <span className="ip-reel-link"><Link2 size={11} /> yourname.subhsandesh.in</span>
            <span className="ip-reel-stats"><Heart size={12} fill="currentColor" /> 24.8K</span>
          </div>
        </div>
      </div>
      {toasts.map((t, i) => (
        <motion.div
          key={t.name}
          className={`ip-toast ip-toast-${i}`}
          initial={reduce ? false : { opacity: 0, x: 20, scale: 0.92 }}
          animate={reduce ? undefined : { opacity: 1, x: 0, scale: 1, y: [0, -4, 0] }}
          transition={reduce ? undefined : { delay: 0.6 + i * 0.35, duration: 0.5, y: { repeat: Infinity, duration: 3 + i, ease: "easeInOut", delay: 1.2 + i } }}
        >
          <span className="ip-toast-ic"><IndianRupee size={13} /></span>
          <span className="ip-toast-txt"><b>+₹{t.amt.toLocaleString("en-IN", { minimumFractionDigits: t.amt % 1 ? 2 : 0, maximumFractionDigits: 2 })}</b> {t.name} bought {t.what}</span>
        </motion.div>
      ))}
    </div>
  );
}

// ── Calculator ───────────────────────────────────────────────────────────────

function Calculator({ percent }: { percent: number }) {
  const [views, setViews] = useState(20000);
  const [price, setPrice] = useState(149);
  const [clickRate, setClickRate] = useState(2);
  // Funnel assumptions, shown to the user rather than hidden in the number.
  const signupRate = 0.2; // of link taps who create an account
  const payRate = 0.25; // of new accounts who buy at least one premium template

  const r = useMemo(() => {
    const taps = views * (clickRate / 100);
    const signups = taps * signupRate;
    const buyers = signups * payRate;
    const revenue = buyers * price;
    const monthly = revenue * (percent / 100);
    return { taps, signups, buyers, revenue, monthly, yearly: monthly * 12 };
  }, [views, price, clickRate, percent]);

  return (
    <div className="ip-calc">
      <div className="ip-calc-inputs">
        <Slider label="Monthly views on your posts" value={views} min={1000} max={500000} step={1000} onChange={setViews} display={views.toLocaleString("en-IN")} />
        <Slider label="Viewers who tap your link" value={clickRate} min={0.5} max={6} step={0.5} onChange={setClickRate} display={`${clickRate}%`} />
        <Slider label="Average template price" value={price} min={49} max={499} step={10} onChange={setPrice} display={`₹${price}`} />
        <ul className="ip-funnel">
          <li><span>Link taps</span><b>{Math.round(r.taps).toLocaleString("en-IN")}</b></li>
          <li><span>New signups (~20%)</span><b>{Math.round(r.signups).toLocaleString("en-IN")}</b></li>
          <li><span>Buy premium (~25%)</span><b>{Math.round(r.buyers).toLocaleString("en-IN")}</b></li>
        </ul>
      </div>
      <div className="ip-calc-out">
        <span className="ip-calc-label">You could earn</span>
        <motion.span key={Math.round(r.monthly)} initial={{ opacity: 0.4, y: 6 }} animate={{ opacity: 1, y: 0 }} className="ip-calc-big">
          {fmt(r.monthly)}
        </motion.span>
        <span className="ip-calc-sub">every month</span>
        <div className="ip-calc-year">
          <span>In a year</span>
          <b>{fmt(r.yearly)}</b>
        </div>
        <p className="ip-calc-note">
          {percent}% of {fmt(r.revenue)} in sales. And because referrals are lifetime, people who joined last month keep earning for you this month.
        </p>
      </div>
    </div>
  );
}

function Slider({ label, value, min, max, step, onChange, display }: { label: string; value: number; min: number; max: number; step: number; onChange: (v: number) => void; display: string }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <label className="ip-slider">
      <span className="ip-slider-top"><span>{label}</span><b>{display}</b></span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ background: `linear-gradient(90deg, ${BRAND.accentStrong} ${pct}%, rgba(61,12,17,.12) ${pct}%)` }}
      />
    </label>
  );
}

// ── Examples & ideas ─────────────────────────────────────────────────────────

function EXAMPLES(percent: number) {
  const calc = (buyers: number, price: number) => fmt(buyers * price * (percent / 100));
  return [
    {
      name: "Neha · couple reels",
      who: "12K Instagram followers",
      icon: <Instagram size={18} />,
      color: "linear-gradient(135deg,#f58529,#dd2a7b,#8134af)",
      story: "Posts one reel a week of her boyfriend opening a surprise page. Link pinned in bio.",
      math: [["Monthly views", "40,000"], ["Taps → signups", "800 → 160"], ["Buy premium", "40 × ₹149"]] as [string, string][],
      total: calc(40, 149),
    },
    {
      name: "Arjun · tech tutorials",
      who: "8K YouTube subscribers",
      icon: <Youtube size={18} />,
      color: "linear-gradient(135deg,#ff0000,#b30000)",
      story: "One Short: \"Make an apology website in 60 seconds\". Link in the description and pinned comment.",
      math: [["Monthly views", "25,000"], ["Taps → signups", "750 → 150"], ["Buy premium", "35 × ₹199"]] as [string, string][],
      total: calc(35, 199),
    },
    {
      name: "Pooja · college creator",
      who: "3K followers + WhatsApp groups",
      icon: <MessageCircle size={18} />,
      color: "linear-gradient(135deg,#25d366,#128c7e)",
      story: "Shares her link before birthdays and Valentine's week in class groups and stories.",
      math: [["People reached", "6,000"], ["Taps → signups", "300 → 60"], ["Buy premium", "15 × ₹149"]] as [string, string][],
      total: calc(15, 149),
    },
  ];
}

const IDEAS = [
  { platform: "Reel", icon: <Instagram size={12} />, tone: "#c13584", t: "The reaction reel", d: "Film your partner or friend opening their surprise page. Real reactions get shared the most." },
  { platform: "Short", icon: <Youtube size={12} />, tone: "#cc0000", t: "60-second tutorial", d: "Screen-record making a birthday page from start to finish. Search-friendly and evergreen." },
  { platform: "Reel", icon: <Instagram size={12} />, tone: "#c13584", t: "Boring vs. wow", d: "Split screen: a plain 'HBD' text vs. a SubhSandesh page. The contrast sells itself." },
  { platform: "Story", icon: <Smartphone size={12} />, tone: "#8b5a2b", t: "Link sticker countdown", d: "Before Valentine's, Raksha Bandhan or Diwali: \"Last-minute gift? Tap here 👇\"." },
  { platform: "Post", icon: <Clapperboard size={12} />, tone: "#6d4ad1", t: "Apology that worked", d: "Tell the story of a fight and the apology page that fixed it. Relatable content that converts." },
  { platform: "WhatsApp", icon: <MessageCircle size={12} />, tone: "#128c7e", t: "Group drop", d: "Share your link in college, office or family groups right before a birthday." },
];

// ── Shared section + FAQ ─────────────────────────────────────────────────────

function Section({ kicker, title, children }: { kicker: string; title: string; children: ReactNode }) {
  return (
    <section className="ip-section">
      <span className="ip-kicker">{kicker}</span>
      <h2 className="ip-h2">{title}</h2>
      {children}
    </section>
  );
}

function Faq({ percent, days }: { percent: number; days: number }) {
  const [open, setOpen] = useState<number | null>(0);
  const items = [
    { q: "How much do I earn?", a: `${percent}% of what every person you refer pays for premium templates, on every purchase, for as long as they use SubhSandesh.` },
    { q: "Do I need a lot of followers?", a: "No. There's no minimum. A creator with 2,000 engaged followers who posts at the right time (birthdays, Valentine's, festivals) can earn more than a big account that never posts about it." },
    { q: "What counts as a referral?", a: `Someone who opens your link and creates a new SubhSandesh account within ${days} days. Existing users don't count, and neither do your own purchases.` },
    { q: "When and how do I get paid?", a: "Add your UPI ID in your hub. The SubhSandesh team sends your pending earnings to your UPI, and every payout shows in your dashboard." },
    { q: "What if a referral only makes free templates?", a: "They still show in your dashboard as a creator you brought in. You earn the moment they buy a premium template, even months later." },
    { q: "Can I see who joined?", a: "Yes. Your hub lists every person who joined through you, the templates they made, whether each was free or paid, and exactly what you earned from it." },
  ];
  return (
    <div className="ip-faq">
      {items.map((it, i) => (
        <div key={it.q} className={`ip-faq-item ${open === i ? "open" : ""}`}>
          <button type="button" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
            <span>{it.q}</span>
            <ChevronDown size={18} />
          </button>
          <AnimatePresence initial={false}>
            {open === i && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} style={{ overflow: "hidden" }}>
                <p>{it.a}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

const CSS = `
  .ip { display: flex; flex-direction: column; gap: 0; min-width: 0; }
  .ip * { box-sizing: border-box; }
  .ip-hero { position: relative; overflow: hidden; border-radius: 28px; padding: clamp(24px, 5vw, 52px) clamp(18px, 4vw, 48px); background: radial-gradient(120% 120% at 0% 0%, #6a1a26 0%, #3d0c11 55%, #2a070b 100%); color: #f5ede6; box-shadow: ${BRAND.shadowElevated}; }
  .ip-glow { position: absolute; border-radius: 50%; filter: blur(70px); pointer-events: none; }
  .ip-glow-a { width: 360px; height: 360px; background: rgba(242,207,116,.22); top: -140px; right: -80px; }
  .ip-glow-b { width: 300px; height: 300px; background: rgba(221,42,123,.16); bottom: -160px; left: -100px; }
  .ip-hero-grid { position: relative; display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(0, .85fr); gap: clamp(20px, 4vw, 48px); align-items: center; }
  .ip-eyebrow { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border-radius: 99px; background: rgba(242,207,116,.12); border: 1px solid rgba(242,207,116,.28); color: #f2cf74; font-size: 11px; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; }
  .ip-hero h1 { margin: 16px 0 14px; font-family: 'Playfair Display', serif; font-size: clamp(32px, 5.4vw, 58px); line-height: 1.05; letter-spacing: -.01em; }
  .ip-gold { background: linear-gradient(90deg, #f2cf74, #ffe7a8, #c9a84c); -webkit-background-clip: text; background-clip: text; color: transparent; font-style: italic; }
  .ip-lead { margin: 0; max-width: 540px; font-size: clamp(14.5px, 1.6vw, 17px); line-height: 1.65; color: rgba(245,237,230,.82); }
  .ip-lead b { color: #f2cf74; }
  .ip-hero-cta { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 16px; margin-top: 26px; }
  .ip-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 54px; padding: 0 28px; border-radius: 99px; border: none; cursor: pointer; font-weight: 800; font-size: 16px; color: #3d0c11; background: linear-gradient(135deg, #ffe7a8, #f2cf74 45%, #c9a84c); box-shadow: 0 16px 36px -14px rgba(242,207,116,.65), inset 0 1px 0 rgba(255,255,255,.6); transition: transform .2s, box-shadow .2s; }
  .ip-btn:hover { transform: translateY(-2px); box-shadow: 0 20px 40px -14px rgba(242,207,116,.8), inset 0 1px 0 rgba(255,255,255,.6); }
  .ip-hero-note { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: rgba(245,237,230,.75); font-weight: 600; }
  .ip-hero-note svg { color: #7ee2a8; }
  .ip-platforms { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 22px; }
  .ip-platforms span { display: inline-flex; align-items: center; gap: 6px; padding: 7px 12px; border-radius: 99px; background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.1); font-size: 12.5px; font-weight: 700; color: rgba(245,237,230,.9); }

  .ip-visual { position: relative; height: 420px; display: flex; align-items: center; justify-content: center; }
  .ip-phone { position: relative; width: 210px; height: 400px; border-radius: 34px; padding: 10px; background: linear-gradient(160deg, #1a0306, #000); box-shadow: 0 30px 60px -20px rgba(0,0,0,.7), inset 0 0 0 2px rgba(242,207,116,.25); transform: rotate(-4deg); }
  .ip-phone-notch { position: absolute; top: 14px; left: 50%; width: 70px; height: 18px; border-radius: 99px; background: #000; transform: translateX(-50%); z-index: 2; }
  .ip-reel { position: relative; height: 100%; border-radius: 26px; overflow: hidden; background: linear-gradient(170deg, #ffb199 0%, #ff6f91 40%, #8e3bd8 100%); display: flex; flex-direction: column; justify-content: space-between; padding: 34px 14px 16px; color: #fff; }
  .ip-reel-top { display: flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 800; }
  .ip-reel-center { text-align: center; }
  .ip-reel-emoji { font-size: 64px; display: block; filter: drop-shadow(0 10px 20px rgba(0,0,0,.25)); }
  .ip-reel-center p { margin: 10px 0 0; font-size: 13px; font-weight: 700; line-height: 1.4; text-shadow: 0 1px 6px rgba(0,0,0,.3); }
  .ip-reel-bottom { display: flex; flex-direction: column; gap: 8px; }
  .ip-reel-link { display: inline-flex; align-items: center; gap: 4px; align-self: flex-start; padding: 6px 10px; border-radius: 99px; background: rgba(255,255,255,.95); color: #3d0c11; font-size: 10.5px; font-weight: 800; }
  .ip-reel-stats { display: inline-flex; align-items: center; gap: 4px; font-size: 11.5px; font-weight: 800; }
  .ip-toast { position: absolute; display: flex; align-items: center; gap: 8px; padding: 9px 12px 9px 9px; border-radius: 14px; background: rgba(255,253,251,.97); color: ${BRAND.text}; box-shadow: 0 16px 34px -12px rgba(0,0,0,.45); font-size: 12px; max-width: 240px; }
  .ip-toast-ic { width: 26px; height: 26px; flex-shrink: 0; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: rgba(58,167,109,.15); color: ${BRAND.ok}; }
  .ip-toast-txt { line-height: 1.3; }
  .ip-toast-txt b { color: ${BRAND.ok}; }
  .ip-toast-0 { top: 40px; right: -6px; }
  .ip-toast-1 { top: 182px; left: -14px; }
  .ip-toast-2 { bottom: -2px; right: -8px; }

  .ip-strip { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin-top: 14px; }
  .ip-strip-item { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 2px; padding: 16px 10px; border-radius: 20px; background: ${BRAND.surface}; border: 1px solid ${BRAND.border}; box-shadow: ${BRAND.shadow}; }
  .ip-strip-ic { width: 38px; height: 38px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: rgba(201,168,76,.16); color: ${BRAND.accent}; margin-bottom: 6px; }
  .ip-strip-item b { font: 700 22px/1.1 'Playfair Display', serif; color: ${BRAND.text}; }
  .ip-strip-item > span:last-child { font-size: 12px; color: ${BRAND.muted}; }

  .ip-section { margin-top: clamp(40px, 7vw, 72px); min-width: 0; }
  .ip-kicker { display: block; text-align: center; font-size: 11px; font-weight: 800; letter-spacing: .2em; text-transform: uppercase; color: ${BRAND.accent}; }
  .ip-h2 { margin: 8px auto 22px; max-width: 640px; text-align: center; font-family: 'Playfair Display', serif; font-size: clamp(24px, 3.6vw, 38px); line-height: 1.15; color: ${BRAND.text}; }

  .ip-steps { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
  .ip-step { position: relative; padding: 24px 20px; border-radius: 24px; background: ${BRAND.surface}; border: 1px solid ${BRAND.border}; box-shadow: ${BRAND.shadow}; overflow: hidden; }
  .ip-step-n { position: absolute; top: 12px; right: 18px; font: 700 44px/1 'Playfair Display', serif; color: rgba(201,168,76,.25); }
  .ip-step-ic { width: 46px; height: 46px; border-radius: 14px; display: flex; align-items: center; justify-content: center; background: ${BRAND.gradient}; color: #f2cf74; }
  .ip-step h3 { margin: 16px 0 6px; font-size: 17px; color: ${BRAND.text}; }
  .ip-step p { margin: 0; font-size: 14px; line-height: 1.6; color: ${BRAND.muted}; }

  .ip-calc { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr); gap: 0; border-radius: 28px; overflow: hidden; background: ${BRAND.surface}; border: 1px solid ${BRAND.border}; box-shadow: ${BRAND.shadow}; }
  .ip-calc-inputs { padding: clamp(18px, 3vw, 30px); display: flex; flex-direction: column; gap: 18px; min-width: 0; }
  .ip-slider { display: flex; flex-direction: column; gap: 10px; }
  .ip-slider-top { display: flex; justify-content: space-between; gap: 10px; font-size: 13.5px; font-weight: 700; color: ${BRAND.muted}; }
  .ip-slider-top b { color: ${BRAND.text}; font-size: 15px; white-space: nowrap; }
  .ip-slider input { -webkit-appearance: none; appearance: none; width: 100%; height: 8px; border-radius: 99px; outline: none; cursor: pointer; }
  .ip-slider input::-webkit-slider-thumb { -webkit-appearance: none; width: 24px; height: 24px; border-radius: 50%; background: #fff; border: 3px solid ${BRAND.accentStrong}; box-shadow: 0 4px 10px rgba(61,12,17,.3); }
  .ip-slider input::-moz-range-thumb { width: 20px; height: 20px; border-radius: 50%; background: #fff; border: 3px solid ${BRAND.accentStrong}; }
  .ip-funnel { list-style: none; margin: 4px 0 0; padding: 12px 14px; border-radius: 16px; background: ${BRAND.bgAlt}; display: grid; gap: 6px; }
  .ip-funnel li { display: flex; justify-content: space-between; font-size: 13px; color: ${BRAND.muted}; }
  .ip-funnel b { color: ${BRAND.text}; }
  .ip-calc-out { position: relative; padding: clamp(22px, 3vw, 34px); display: flex; flex-direction: column; justify-content: center; background: ${BRAND.gradient}; color: #f5ede6; min-width: 0; }
  .ip-calc-label { font-size: 12px; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; color: rgba(245,237,230,.7); }
  .ip-calc-big { font: 700 clamp(44px, 7vw, 68px)/1.05 'Playfair Display', serif; color: #f2cf74; overflow-wrap: anywhere; }
  .ip-calc-sub { font-size: 14px; color: rgba(245,237,230,.75); }
  .ip-calc-year { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; margin-top: 18px; padding: 12px 14px; border-radius: 14px; background: rgba(255,255,255,.08); }
  .ip-calc-year span { font-size: 13px; color: rgba(245,237,230,.75); }
  .ip-calc-year b { font: 700 22px 'Playfair Display', serif; }
  .ip-calc-note { margin: 14px 0 0; font-size: 12.5px; line-height: 1.55; color: rgba(245,237,230,.7); }

  .ip-examples { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; }
  .ip-ex { display: flex; flex-direction: column; padding: 20px; border-radius: 24px; background: ${BRAND.surface}; border: 1px solid ${BRAND.border}; box-shadow: ${BRAND.shadow}; min-width: 0; }
  .ip-ex-head { display: flex; align-items: center; gap: 10px; }
  .ip-ex-ava { width: 42px; height: 42px; border-radius: 14px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; color: #fff; }
  .ip-ex-head b { display: block; font-size: 15px; color: ${BRAND.text}; }
  .ip-ex-head span { font-size: 12px; color: ${BRAND.faint}; }
  .ip-ex-story { margin: 14px 0; font-size: 13.5px; line-height: 1.55; color: ${BRAND.muted}; flex: 1; }
  .ip-ex-math { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
  .ip-ex-math li { display: flex; justify-content: space-between; gap: 8px; font-size: 12.5px; color: ${BRAND.muted}; padding-bottom: 6px; border-bottom: 1px dashed ${BRAND.border}; }
  .ip-ex-math b { color: ${BRAND.text}; white-space: nowrap; }
  .ip-ex-total { display: flex; justify-content: space-between; align-items: baseline; margin-top: 12px; padding: 12px 14px; border-radius: 14px; background: rgba(58,167,109,.08); }
  .ip-ex-total span { font-size: 12.5px; font-weight: 700; color: ${BRAND.muted}; }
  .ip-ex-total b { font: 700 24px 'Playfair Display', serif; color: ${BRAND.ok}; }
  .ip-ex-total small { font: 600 12px Inter, sans-serif; color: ${BRAND.muted}; margin-left: 2px; }
  .ip-fine { margin: 14px auto 0; max-width: 560px; text-align: center; font-size: 11.5px; color: ${BRAND.faint}; }

  .ip-ideas { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
  .ip-idea { padding: 18px; border-radius: 20px; background: ${BRAND.surface}; border: 1px solid ${BRAND.border}; min-width: 0; }
  .ip-idea-tag { display: inline-flex; align-items: center; gap: 5px; padding: 4px 10px; border-radius: 99px; font-size: 11px; font-weight: 800; }
  .ip-idea h3 { margin: 12px 0 6px; font-size: 15.5px; color: ${BRAND.text}; }
  .ip-idea p { margin: 0; font-size: 13.5px; line-height: 1.55; color: ${BRAND.muted}; }

  .ip-why { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  .ip-why-item { display: flex; gap: 14px; padding: 18px; border-radius: 20px; background: ${BRAND.surface}; border: 1px solid ${BRAND.border}; }
  .ip-why-item > span { width: 40px; height: 40px; flex-shrink: 0; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: rgba(201,168,76,.16); color: ${BRAND.accent}; }
  .ip-why-item b { font-size: 15px; color: ${BRAND.text}; }
  .ip-why-item p { margin: 4px 0 0; font-size: 13.5px; line-height: 1.55; color: ${BRAND.muted}; }

  .ip-faq { max-width: 760px; margin: 0 auto; display: grid; gap: 8px; }
  .ip-faq-item { border-radius: 18px; background: ${BRAND.surface}; border: 1px solid ${BRAND.border}; overflow: hidden; }
  .ip-faq-item.open { border-color: rgba(201,168,76,.5); }
  .ip-faq-item button { width: 100%; display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 16px 18px; border: none; background: none; cursor: pointer; text-align: left; font-size: 15px; font-weight: 800; color: ${BRAND.text}; }
  .ip-faq-item button svg { flex-shrink: 0; color: ${BRAND.faint}; transition: transform .2s; }
  .ip-faq-item.open button svg { transform: rotate(180deg); }
  .ip-faq-item p { margin: 0; padding: 0 18px 16px; font-size: 14px; line-height: 1.6; color: ${BRAND.muted}; }

  .ip-final { position: relative; overflow: hidden; margin-top: clamp(40px, 7vw, 72px); padding: clamp(28px, 5vw, 52px) 20px; border-radius: 28px; text-align: center; background: ${BRAND.gradient}; color: #f5ede6; }
  .ip-final h2 { position: relative; margin: 0 auto 8px; max-width: 640px; font-family: 'Playfair Display', serif; font-size: clamp(22px, 3.4vw, 34px); line-height: 1.2; }
  .ip-final p { position: relative; margin: 0 0 22px; color: rgba(245,237,230,.8); font-size: 15px; }
  .ip-btn-light { position: relative; }

  @media (max-width: 1023px) {
    .ip-examples, .ip-ideas { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  @media (max-width: 860px) {
    .ip-hero-grid { grid-template-columns: minmax(0, 1fr); }
    .ip-visual { height: 360px; }
    .ip-phone { width: 180px; height: 340px; }
    .ip-strip { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .ip-steps { grid-template-columns: minmax(0, 1fr); }
    .ip-calc { grid-template-columns: minmax(0, 1fr); }
  }
  @media (max-width: 640px) {
    .ip-examples, .ip-ideas, .ip-why { grid-template-columns: minmax(0, 1fr); }
    .ip-hero-cta .ip-btn { width: 100%; }
    .ip-toast { max-width: 200px; font-size: 11px; }
    .ip-toast-0 { right: 0; }
    .ip-toast-1 { left: 0; }
    .ip-toast-2 { right: 0; bottom: 0; }
  }
`;
