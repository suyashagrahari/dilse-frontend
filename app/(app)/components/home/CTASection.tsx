"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function CTASection() {
  const router = useRouter();

  return (
    <section className="cta-section" style={{ background: '#f5ede6', padding: '80px 36px 120px', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @media (max-width: 768px) {
          .cta-section { padding: 60px 16px 96px !important; }
          .cta-card { padding: 40px 24px 36px !important; border-radius: 18px !important; }
          .cta-headline { font-size: clamp(30px, 8.6vw, 48px) !important; letter-spacing: -0.6px !important; }
          .cta-btn { padding: 17px 34px !important; letter-spacing: 1.6px !important; }
        }
        @media (max-width: 400px) {
          .cta-card { padding: 34px 18px 32px !important; }
          .cta-headline { font-size: 27px !important; }
        }
      `}</style>
      {/* Gold bottom bar (divider into footer) */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg,#c9a84c,#a8823a 50%,#c9a84c)' }} />

      {/* Clean centered card (matches the new-UI pricing card) */}
      <motion.div className="cta-card"
        initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
        style={{
          maxWidth: 1140, margin: '0 auto', background: '#fffdf8',
          border: '1.5px solid rgba(61,12,17,0.5)', borderRadius: 22,
          boxShadow: '0 22px 60px rgba(61,12,17,0.08)',
          padding: '46px 72px 42px', textAlign: 'center', position: 'relative'
        }}>

        {/* Top badge */}
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 20px', borderRadius: 24, border: '1px solid rgba(61,12,17,0.18)', color: '#3d0c11', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', background: 'rgba(201,168,76,0.08)', marginBottom: 16 }}>
          <svg width="7" height="7" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" fill="#c9a84c" /></svg>
          Start Creating Today
          <svg width="7" height="7" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" fill="#c9a84c" /></svg>
        </span>

        {/* Hindi tagline */}
        <p style={{ fontSize: 13, color: '#a8823a', letterSpacing: '0.12em', fontWeight: 600, marginBottom: 14, fontFamily: "'Playfair Display',serif" }}>
          शुभ संदेश — Send Blessings. Make Memories.
        </p>

        {/* Headline */}
        <h2 className="cta-headline" style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(34px,5vw,62px)', fontWeight: 700, color: '#2a0a0e', letterSpacing: '-1.5px', lineHeight: 1.05, marginBottom: 4 }}>
          Make someone&apos;s day
        </h2>
        <h2 className="cta-headline" style={{
          fontFamily: "'Playfair Display',serif", fontSize: 'clamp(34px,5vw,62px)', fontWeight: 700,
          fontStyle: 'italic', letterSpacing: '-1.5px', lineHeight: 1.18, paddingBottom: 6, marginBottom: 16,
          background: 'linear-gradient(90deg,#c9a84c 0%,#a8823a 55%,#c9a84c 100%)',
          WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent'
        }}>
          unforgettable.
        </h2>

        {/* Description */}
        <p style={{ fontSize: 15.5, color: '#7a5050', lineHeight: 1.8, maxWidth: 480, margin: '0 auto 26px' }}>
          Create a beautiful celebration page in under 2 minutes.<br />
          No design skills. No credit card. Just pure emotion.
        </p>

        {/* Gold CTA Button */}
        <motion.button className="cta-btn"
          whileHover={{ scale: 1.04, boxShadow: '0 22px 56px rgba(201,168,76,0.4)' }}
          whileTap={{ scale: 0.97 }}
          onClick={() => router.push('/templates')}
          style={{
            background: 'linear-gradient(135deg,#c9a84c 0%,#e8c96a 50%,#b8943c 100%)',
            color: '#1a0507', border: 'none',
            padding: '19px 62px', borderRadius: 6,
            fontSize: 12, fontWeight: 800, letterSpacing: '2.5px',
            cursor: 'pointer',
            boxShadow: '0 12px 34px rgba(201,168,76,0.3),inset 0 1px 0 rgba(255,255,255,0.35)',
            display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 22
          }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17 5.8 21.3l2.4-7.4L2 9.4h7.6z" /></svg>
          CREATE YOUR PAGE NOW
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17 5.8 21.3l2.4-7.4L2 9.4h7.6z" /></svg>
        </motion.button>

        {/* Gold hairline divider */}
        <div style={{ height: 1, maxWidth: 320, margin: '0 auto 22px', background: 'linear-gradient(90deg,transparent,rgba(201,168,76,0.5),transparent)' }} />

        {/* Trust micro-copy */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
          {[
            {
              icon: <><rect x="2" y="5" width="20" height="14" rx="2" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M2 10h20" stroke="currentColor" strokeWidth="2" /></>,
              t: 'No Credit Card'
            },
            {
              icon: <><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M12 7v5l3 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></>,
              t: 'Ready in 2 Minutes'
            },
            {
              icon: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></>,
              t: 'Private & Secure'
            },
          ].map((b, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, color: '#a8823a' }}>
              {i > 0 && <div style={{ width: 1, height: 14, background: 'rgba(61,12,17,0.15)', marginRight: 6 }} />}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">{b.icon}</svg>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: '#7a5050', letterSpacing: '0.06em' }}>{b.t}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
