"use client";

// ─── "Priya invited you" ─────────────────────────────────────────────────────
//
// What a follower sees at priya.subhsandesh.in or /r/priya. Its one job is to
// turn a tap from an Instagram bio into a signup, so the page is short: who
// invited you, what you can make, one button. The referral is remembered the
// moment it renders (root-domain cookie — see lib/referral.ts), so a visitor
// who browses away and signs up next week still counts.

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles, Heart, Gift, Clock, Instagram, Check } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { API_URL } from "@/lib/config";
import { saveRefCode } from "@/lib/referral";
import { useAppSelector } from "@/store/hooks";
import AuthModal from "@/components/AuthModal";

export interface PublicInfluencer {
  name: string;
  avatar?: string;
  instagram?: string;
  code: string;
  attributionDays: number;
}

const OCCASIONS = [
  { emoji: "🎂", label: "Birthday" },
  { emoji: "💝", label: "Valentine" },
  { emoji: "🥺", label: "Sorry" },
  { emoji: "💍", label: "Anniversary" },
  { emoji: "💕", label: "Proposal" },
  { emoji: "🌙", label: "Festivals" },
  { emoji: "💫", label: "Miss you" },
  { emoji: "🎉", label: "Wedding" },
];

const STEPS = [
  { icon: <Sparkles size={18} />, title: "Pick a template", text: "Dozens of designs for every occasion." },
  { icon: <Heart size={18} />, title: "Add your words & photos", text: "AI can help you write it in seconds." },
  { icon: <Gift size={18} />, title: "Share one link", text: "They open a surprise made just for them." },
];

/** Count a visit at most once a day per browser, so refreshes don't inflate clicks. */
function pingClick(code: string) {
  try {
    const key = `ss_inf_click_${code}_${new Date().toISOString().slice(0, 10)}`;
    if (localStorage.getItem(key)) return;
    localStorage.setItem(key, "1");
  } catch { /* storage blocked: count anyway */ }
  fetch(`${API_URL}/influencer/click/${encodeURIComponent(code)}`, { method: "POST", keepalive: true }).catch(() => {});
}

export default function InfluencerLanding({ influencer }: { influencer: PublicInfluencer }) {
  const reduce = useReducedMotion();
  const { isAuthenticated } = useAppSelector((s) => s.auth);
  const [authOpen, setAuthOpen] = useState(false);
  const first = influencer.name.split(" ")[0] || influencer.name;

  useEffect(() => {
    saveRefCode(influencer.code, influencer.attributionDays);
    pingClick(influencer.code);
  }, [influencer.code, influencer.attributionDays]);

  const rise = (i: number) =>
    reduce ? {} : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.08 * i, duration: 0.55, ease: [0.22, 1, 0.36, 1] as const } };

  return (
    <main style={{ minHeight: "100dvh", background: BRAND.bg, color: BRAND.text, overflowX: "hidden" }}>
      <style>{CSS}</style>

      {/* Hero */}
      <section className="infl-hero">
        <span aria-hidden className="infl-orb infl-orb-a" />
        <span aria-hidden className="infl-orb infl-orb-b" />
        <div className="infl-wrap" style={{ position: "relative", textAlign: "center" }}>
          <motion.div {...rise(0)} className="infl-brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://cdn.subhsandesh.in/gifts-media/indianFestival/logo-sm.webp" alt="" width={34} height={34} />
            <span>SubhSandesh</span>
          </motion.div>

          <motion.div {...rise(1)} className="infl-avatar-ring">
            {influencer.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={influencer.avatar} alt={influencer.name} referrerPolicy="no-referrer" />
            ) : (
              <span>{first.charAt(0).toUpperCase()}</span>
            )}
            <span className="infl-badge"><Heart size={12} fill="currentColor" /></span>
          </motion.div>

          <motion.p {...rise(2)} className="infl-kicker">
            A personal invite from
          </motion.p>
          <motion.h1 {...rise(3)} className="infl-title">
            {influencer.name}
          </motion.h1>
          {influencer.instagram && (
            <motion.a
              {...rise(3)}
              href={`https://instagram.com/${influencer.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="infl-ig"
            >
              <Instagram size={13} /> @{influencer.instagram}
            </motion.a>
          )}
          <motion.p {...rise(4)} className="infl-sub">
            Make a heartfelt digital surprise for someone you love: a birthday, an apology, a proposal. It takes
            five minutes and it&apos;s free to start.
          </motion.p>

          <motion.div {...rise(5)} className="infl-ctas">
            <Link href="/templates" className="infl-btn-primary">
              Create yours free <ArrowRight size={16} />
            </Link>
            {!isAuthenticated && (
              <button type="button" className="infl-btn-ghost" onClick={() => setAuthOpen(true)}>
                Sign up with {first}&apos;s invite
              </button>
            )}
          </motion.div>

          <motion.ul {...rise(6)} className="infl-trust">
            <li><Check size={13} /> Free templates</li>
            <li><Check size={13} /> No app to install</li>
            <li><Check size={13} /> Ready in minutes</li>
          </motion.ul>
        </div>
      </section>

      {/* Occasions */}
      <section className="infl-wrap infl-section">
        <h2 className="infl-h2">Something for every moment</h2>
        <div className="infl-occ">
          {OCCASIONS.map((o, i) => (
            <motion.div
              key={o.label}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: "some" }}
              transition={{ delay: i * 0.04, duration: 0.4 }}
            >
              <Link href="/templates" className="infl-occ-card">
                <span className="infl-occ-emoji">{o.emoji}</span>
                <span>{o.label}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="infl-wrap infl-section">
        <h2 className="infl-h2">How it works</h2>
        <div className="infl-steps">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              className="infl-step"
              initial={reduce ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: "some" }}
              transition={{ delay: i * 0.08, duration: 0.45 }}
            >
              <span className="infl-step-n">{i + 1}</span>
              <span className="infl-step-ic">{s.icon}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="infl-wrap infl-section" style={{ paddingBottom: 72 }}>
        <div className="infl-final">
          <Clock size={18} />
          <p>
            {first}&apos;s invite is saved on this device for {influencer.attributionDays} days. Start whenever you&apos;re ready.
          </p>
          <Link href="/templates" className="infl-btn-primary" style={{ marginTop: 14 }}>
            Browse templates <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {authOpen && <AuthModal onClose={() => setAuthOpen(false)} onSuccess={() => setAuthOpen(false)} defaultMode="register" />}
    </main>
  );
}

const CSS = `
  .infl-wrap { width: min(1040px, 100%); margin: 0 auto; padding: 0 16px; box-sizing: border-box; }
  .infl-hero { position: relative; padding: 28px 0 56px; background: radial-gradient(120% 80% at 50% 0%, #fffaf3 0%, ${BRAND.bg} 60%); overflow: hidden; }
  .infl-orb { position: absolute; border-radius: 50%; filter: blur(60px); opacity: .55; pointer-events: none; }
  .infl-orb-a { width: 340px; height: 340px; background: rgba(201,168,76,.35); top: -120px; left: -80px; }
  .infl-orb-b { width: 300px; height: 300px; background: rgba(122,22,34,.18); top: 40px; right: -110px; }
  .infl-brand { display: inline-flex; align-items: center; gap: 8px; font-family: 'Playfair Display', serif; font-weight: 700; font-size: 18px; color: ${BRAND.text}; margin-bottom: 34px; }
  .infl-avatar-ring { position: relative; width: 112px; height: 112px; margin: 0 auto 18px; border-radius: 50%; padding: 4px; background: conic-gradient(from 200deg, ${BRAND.gold}, #e9c97a, ${BRAND.accentStrong}, ${BRAND.gold}); box-shadow: 0 18px 40px -16px rgba(61,12,17,.45); }
  .infl-avatar-ring > img, .infl-avatar-ring > span:first-child { width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 3px solid ${BRAND.surface}; display: flex; align-items: center; justify-content: center; background: ${BRAND.gradient}; color: #f5ede6; font: 700 40px 'Playfair Display', serif; box-sizing: border-box; }
  .infl-badge { position: absolute; right: 2px; bottom: 6px; width: 28px; height: 28px; border-radius: 50%; background: ${BRAND.accentStrong}; color: #ffb4bd; display: flex; align-items: center; justify-content: center; border: 3px solid ${BRAND.surface}; }
  .infl-kicker { margin: 0; font-size: 11px; font-weight: 800; letter-spacing: .22em; text-transform: uppercase; color: ${BRAND.accent}; }
  .infl-title { margin: 6px 0 6px; font-family: 'Playfair Display', serif; font-size: clamp(30px, 6vw, 46px); line-height: 1.1; font-weight: 700; color: ${BRAND.text}; overflow-wrap: anywhere; }
  .infl-ig { display: inline-flex; align-items: center; gap: 5px; font-size: 13px; font-weight: 700; color: ${BRAND.accent}; text-decoration: none; padding: 4px 10px; border-radius: 99px; background: rgba(139,90,43,.08); }
  .infl-sub { margin: 16px auto 0; max-width: 520px; font-size: 15.5px; line-height: 1.6; color: ${BRAND.muted}; }
  .infl-ctas { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-top: 26px; }
  .infl-btn-primary { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 14px 24px; border-radius: 99px; background: ${BRAND.gradient}; color: #f5ede6; font-weight: 800; font-size: 15px; text-decoration: none; border: none; cursor: pointer; box-shadow: 0 14px 30px -12px rgba(61,12,17,.55); transition: transform .2s, box-shadow .2s; }
  .infl-btn-primary:hover { transform: translateY(-2px); box-shadow: 0 18px 34px -12px rgba(61,12,17,.6); }
  .infl-btn-ghost { padding: 14px 22px; border-radius: 99px; background: ${BRAND.surface}; color: ${BRAND.accentStrong}; font-weight: 800; font-size: 14.5px; border: 1px solid ${BRAND.borderStrong}; cursor: pointer; }
  .infl-trust { list-style: none; display: flex; flex-wrap: wrap; justify-content: center; gap: 8px 18px; padding: 0; margin: 22px 0 0; font-size: 12.5px; font-weight: 700; color: ${BRAND.muted}; }
  .infl-trust li { display: inline-flex; align-items: center; gap: 5px; }
  .infl-trust svg { color: ${BRAND.ok}; }
  .infl-section { padding-top: 44px; }
  .infl-h2 { margin: 0 0 16px; text-align: center; font-family: 'Playfair Display', serif; font-size: clamp(22px, 4vw, 30px); color: ${BRAND.text}; }
  .infl-occ { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
  .infl-occ-card { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 18px 8px; border-radius: 18px; background: ${BRAND.surface}; border: 1px solid ${BRAND.border}; text-decoration: none; color: ${BRAND.text}; font-weight: 700; font-size: 13.5px; transition: transform .2s, box-shadow .2s; }
  .infl-occ-card:hover { transform: translateY(-3px); box-shadow: ${BRAND.shadow}; }
  .infl-occ-emoji { font-size: 28px; }
  .infl-steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
  .infl-step { position: relative; padding: 22px 18px; border-radius: 20px; background: ${BRAND.surface}; border: 1px solid ${BRAND.border}; }
  .infl-step h3 { margin: 12px 0 4px; font-size: 15.5px; color: ${BRAND.text}; }
  .infl-step p { margin: 0; font-size: 13.5px; line-height: 1.5; color: ${BRAND.muted}; }
  .infl-step-n { position: absolute; top: 14px; right: 16px; font: 700 26px 'Playfair Display', serif; color: rgba(201,168,76,.45); }
  .infl-step-ic { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; background: rgba(201,168,76,.16); color: ${BRAND.accent}; }
  .infl-final { display: flex; flex-direction: column; align-items: center; text-align: center; padding: 28px 18px; border-radius: 24px; background: ${BRAND.gradient}; color: #f5ede6; }
  .infl-final p { margin: 8px 0 0; max-width: 440px; font-size: 14px; line-height: 1.55; color: rgba(245,237,230,.85); }
  .infl-final .infl-btn-primary { background: #f5ede6; color: ${BRAND.accentStrong}; }
  @media (max-width: 640px) {
    .infl-occ { grid-template-columns: repeat(2, 1fr); }
    .infl-steps { grid-template-columns: 1fr; }
    .infl-ctas > * { width: 100%; }
  }
`;
