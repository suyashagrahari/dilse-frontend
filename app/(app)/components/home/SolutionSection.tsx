"use client";

import { motion } from "framer-motion";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const GOLD_FILTER = "brightness(0) saturate(100%) invert(70%) sepia(48%) saturate(760%) hue-rotate(2deg) brightness(95%) contrast(110%)";

const pillarIcons = [
  <svg key="photo" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" fill="#c9a84c" stroke="none" />
    <path d="M21 15l-5-5L5 21" />
  </svg>,
  <svg key="music" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
  </svg>,
  <svg key="msg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    <path d="M8.5 11.5l1.5-1.5 1.5 1.5 3-3" strokeWidth="1.4" />
  </svg>,
  <svg key="timer" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" />
    <path d="M9.5 3.5h5M12 2v1.5" />
  </svg>,
];

const pillars = [
  { title: 'Photo Gallery', desc: 'Fill it with precious photos and moments that tell your story.', delay: 0 },
  { title: 'Music & Playlist', desc: 'Add songs that set the mood — from devotional to Bollywood.', delay: 0.12 },
  { title: 'Heartfelt Messages', desc: 'Write from the heart or let AI craft the perfect words for you.', delay: 0.24 },
  { title: 'Live Countdown', desc: 'A ticking clock building excitement right up to the moment.', delay: 0.36 },
];

export default function SolutionSection() {
  return (
    <section className="sol-section" style={{
      background: 'linear-gradient(170deg,#120306 0%,#1c0508 40%,#220709 70%,#120306 100%)',
      padding: '120px 0 110px', position: 'relative', overflow: 'hidden'
    }}>
      {/* Radial glow */}
      <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,168,76,0.05) 0%,transparent 65%)', pointerEvents: 'none' }} />

      {/* Top gold rule */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,transparent,#c9a84c 25%,rgba(245,237,230,0.6) 50%,#c9a84c 75%,transparent)' }} />

      <div className="sol-inner" style={{ maxWidth: 1060, margin: '0 auto', padding: '0 44px', position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger}>

          {/* Badge */}
          <motion.div variants={fadeUp} style={{ marginBottom: 26 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              border: '1px solid rgba(201,168,76,0.45)', padding: '7px 24px',
              fontSize: 10, fontWeight: 700, letterSpacing: '3px', color: '#c9a84c',
              background: 'rgba(201,168,76,0.08)', backdropFilter: 'blur(8px)'
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#c9a84c', display: 'inline-block', animation: 'shimmer 2s infinite' }} />
              THE SOLUTION
            </span>
          </motion.div>

          <motion.h2 variants={fadeUp}
            style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(34px,5.2vw,68px)', fontWeight: 700, color: '#f5ede6', lineHeight: 1.06, letterSpacing: '-2px', marginBottom: 16 }}>
            Meet{' '}
            <em style={{ color: '#c9a84c', fontStyle: 'italic', textShadow: '0 0 40px rgba(201,168,76,0.35)' }}>SubhSandesh</em>
          </motion.h2>

          {/* Ornamental divider */}
          <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, margin: '20px auto 28px' }}>
            <div style={{ width: 80, height: 1, background: 'linear-gradient(to right,transparent,rgba(201,168,76,0.6))' }} />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="akehan3.svg" aria-hidden="true" style={{ width: 22, height: 22, opacity: 0.6, filter: GOLD_FILTER }} alt="" />
            <div style={{ width: 80, height: 1, background: 'linear-gradient(to left,transparent,rgba(201,168,76,0.6))' }} />
          </motion.div>

          <motion.p variants={fadeUp}
            style={{ fontSize: 16.5, color: 'rgba(245,237,230,0.72)', lineHeight: 1.88, maxWidth: 560, margin: '0 auto 56px' }}>
            Transform your wishes into a stunning digital celebration — filled with photos, music &amp; heartfelt messages your loved ones will never forget.
          </motion.p>

          {/* Feature pillars */}
          <motion.div variants={stagger} style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 20, marginBottom: 60 }}
            className="sol-grid">
            {pillars.map((p, i) => (
              <motion.div key={p.title}
                variants={{ hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0, transition: { duration: 0.65, delay: p.delay, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } } }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                whileHover={{ y: -8, boxShadow: '0 28px 56px rgba(0,0,0,0.5),0 0 0 1px rgba(201,168,76,0.5)' } as any}
                style={{
                  background: 'linear-gradient(145deg,#2a0e10 0%,#1e0a0c 100%)',
                  border: '1px solid rgba(201,168,76,0.28)', borderRadius: 14,
                  padding: '36px 22px 32px', position: 'relative', overflow: 'hidden', textAlign: 'center',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  transition: 'all 0.38s cubic-bezier(0.22,1,0.36,1)', cursor: 'default',
                }}>

                {/* Corner ornaments */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="alekhancorner2.svg" aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, width: 56, height: 56, pointerEvents: 'none', transform: 'scaleY(-1)', opacity: 0.55, filter: GOLD_FILTER }} alt="" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="alekhancorner2.svg" aria-hidden="true" style={{ position: 'absolute', top: 0, right: 0, width: 56, height: 56, pointerEvents: 'none', transform: 'scale(-1,-1)', opacity: 0.55, filter: GOLD_FILTER }} alt="" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="alekhancorner2.svg" aria-hidden="true" style={{ position: 'absolute', bottom: 0, left: 0, width: 48, height: 48, pointerEvents: 'none', opacity: 0.40, filter: GOLD_FILTER }} alt="" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="alekhancorner2.svg" aria-hidden="true" style={{ position: 'absolute', bottom: 0, right: 0, width: 48, height: 48, pointerEvents: 'none', transform: 'scaleX(-1)', opacity: 0.40, filter: GOLD_FILTER }} alt="" />

                {/* Icon — double ring */}
                <div style={{ position: 'relative', width: 74, height: 74, margin: '0 auto 22px' }}>
                  <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '1px solid rgba(201,168,76,0.18)', animation: 'pulseSlow 3s ease-in-out infinite' }} />
                  <div style={{ position: 'absolute', inset: 4, borderRadius: '50%', border: '1px solid rgba(201,168,76,0.28)' }} />
                  <div style={{
                    position: 'absolute', inset: 10, borderRadius: '50%',
                    background: 'linear-gradient(145deg,#3a1208 0%,#1e0608 100%)',
                    border: '1.5px solid rgba(201,168,76,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 4px 18px rgba(0,0,0,0.5),inset 0 1px 0 rgba(201,168,76,0.12),0 0 14px rgba(201,168,76,0.08)'
                  }}>
                    {pillarIcons[i]}
                  </div>
                </div>

                {/* Top shimmer line */}
                <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: 1.5, background: 'linear-gradient(90deg,transparent,rgba(201,168,76,0.6),transparent)', borderRadius: 1 }} />

                <h4 style={{ fontFamily: "'Playfair Display',serif", fontSize: 16, fontWeight: 700, color: '#f5ede6', marginBottom: 10, lineHeight: 1.25 }}>{p.title}</h4>
                <p style={{ fontSize: 12.5, color: 'rgba(245,237,230,0.52)', lineHeight: 1.7, margin: 0 }}>{p.desc}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Share link */}
          <motion.div variants={fadeUp}>
            <p style={{ fontSize: 13.5, color: 'rgba(201,168,76,0.65)', marginBottom: 18, letterSpacing: '0.3px' }}>
              Then simply share one beautiful link:
            </p>
            <motion.div className="sol-link-btn"
              whileHover={{ scale: 1.03, boxShadow: '0 14px 44px rgba(201,168,76,0.28)' }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 12,
                background: 'linear-gradient(90deg,#c9a84c 0%,#e8c860 50%,#c9a84c 100%)',
                padding: '15px 36px', borderRadius: 4, cursor: 'pointer',
                boxShadow: '0 8px 32px rgba(201,168,76,0.25)',
                transition: 'all 0.3s', marginBottom: 36
              }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2a0a0e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              <span style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: '2px', color: '#2a0a0e' }}>SUBHSANDESH.IN / YOURPAGE</span>
            </motion.div>
          </motion.div>

          {/* Bottom quote — framed with corner ornaments */}
            <motion.div className="sol-quote" variants={fadeUp} style={{ position: 'relative', display: 'inline-block', maxWidth: 640, margin: '0 auto', padding: '52px 80px' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="alekhancorner2.svg" aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, width: 88, height: 88, pointerEvents: 'none', transform: 'scaleY(-1)', opacity: 0.72, filter: GOLD_FILTER }} alt="" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="alekhancorner2.svg" aria-hidden="true" style={{ position: 'absolute', top: 0, right: 0, width: 88, height: 88, pointerEvents: 'none', transform: 'scale(-1,-1)', opacity: 0.72, filter: GOLD_FILTER }} alt="" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="alekhancorner2.svg" aria-hidden="true" style={{ position: 'absolute', bottom: 0, left: 0, width: 76, height: 76, pointerEvents: 'none', opacity: 0.58, filter: GOLD_FILTER }} alt="" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="alekhancorner2.svg" aria-hidden="true" style={{ position: 'absolute', bottom: 0, right: 0, width: 76, height: 76, pointerEvents: 'none', transform: 'scaleX(-1)', opacity: 0.58, filter: GOLD_FILTER }} alt="" />
            <p style={{ fontSize: 17, color: 'rgba(245,237,230,0.72)', lineHeight: 1.85, fontStyle: 'italic', margin: 0, textAlign: 'center', fontFamily: "'Playfair Display',serif" }}>
              When your loved one opens it, they see a{' '}
              <strong style={{ color: '#c9a84c', fontStyle: 'normal' }}>beautiful surprise</strong>{' '}
              created just for them. 💝
            </p>
          </motion.div>

        </motion.div>
      </div>

      {/* Bottom gold rule */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,transparent,#c9a84c 25%,rgba(245,237,230,0.6) 50%,#c9a84c 75%,transparent)' }} />

      <style>{`
        @media (max-width: 768px) {
          .sol-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media (max-width: 480px) {
          .sol-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </section>
  );
}
