"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { getMandalaLineEndpoint, MANDALA_ANGLES } from "./mandala";

const sparks = [
  { top: '12%', left: '8%' }, { top: '22%', right: '6%' }, { top: '65%', left: '5%' },
  { bottom: '18%', right: '7%' }, { top: '40%', left: '2%' }, { top: '48%', right: '3%' },
  { bottom: '30%', left: '15%' }, { top: '15%', right: '18%' },
];

export default function CTASection() {
  const router = useRouter();

  return (
    <section className="cta-section" style={{ background: 'linear-gradient(135deg,#0e0203 0%,#2a0a0e 28%,#3d0c11 52%,#2a0a0e 76%,#0e0203 100%)', padding: '130px 36px 140px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      {/* Gold top line */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,transparent,#c9a84c 25%,#c9a84c 75%,transparent)' }} />
      {/* Gold bottom bar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg,#c9a84c,#a8823a 50%,#c9a84c)' }} />

      {/* Corner gold L-brackets */}
      {[
        { top: 0, left: 0, borderTop: '2px solid rgba(201,168,76,0.45)', borderLeft: '2px solid rgba(201,168,76,0.45)' },
        { top: 0, right: 0, borderTop: '2px solid rgba(201,168,76,0.45)', borderRight: '2px solid rgba(201,168,76,0.45)' },
        { bottom: 0, left: 0, borderBottom: '2px solid rgba(201,168,76,0.45)', borderLeft: '2px solid rgba(201,168,76,0.45)' },
        { bottom: 0, right: 0, borderBottom: '2px solid rgba(201,168,76,0.45)', borderRight: '2px solid rgba(201,168,76,0.45)' },
      ].map((style, i) => (
        <div key={i} style={{ position: 'absolute', ...style as object, width: 48, height: 48, pointerEvents: 'none', zIndex: 3 }} />
      ))}

      {/* Central radial glow */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', marginLeft: -350, marginTop: -350, width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle,rgba(201,168,76,0.07) 0%,transparent 68%)', pointerEvents: 'none' }} />

      {/* Slowly counter-rotating outer ring */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', marginLeft: -280, marginTop: -280, width: 560, height: 560, pointerEvents: 'none' }}>
        <motion.div animate={{ rotate: -360 }} transition={{ repeat: Infinity, duration: 28, ease: 'linear' }}
          style={{ width: '100%', height: '100%', borderRadius: '50%', border: '1px dashed rgba(201,168,76,0.1)' }} />
      </div>
      {/* Inner rotating ring */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', marginLeft: -190, marginTop: -190, width: 380, height: 380, pointerEvents: 'none' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 18, ease: 'linear' }}
          style={{ width: '100%', height: '100%', borderRadius: '50%', border: '1px dashed rgba(201,168,76,0.08)' }} />
      </div>

      {/* Mandala watermark */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', marginLeft: -330, marginTop: -330, width: 660, height: 660, opacity: 0.04, pointerEvents: 'none' }}>
        <svg viewBox="0 0 200 200" fill="none" width="100%" height="100%">
          {[96, 78, 60, 44, 28, 14].map(r => <circle key={r} cx="100" cy="100" r={r} stroke="#c9a84c" strokeWidth="0.4" />)}
          {MANDALA_ANGLES.map(a => {
            const endpoint = getMandalaLineEndpoint(a, 96);
            return <line key={a} x1="100" y1="100" x2={endpoint.x2} y2={endpoint.y2} stroke="#c9a84c" strokeWidth="0.3" />;
          })}
          {[0, 45, 90, 135].map(a => <ellipse key={a} cx="100" cy="100" rx="96" ry="22" stroke="#c9a84c" strokeWidth="0.25" transform={`rotate(${a} 100 100)`} />)}
          {[0, 60, 120].map(a => <ellipse key={`p${a}`} cx="100" cy="100" rx="44" ry="11" stroke="#c9a84c" strokeWidth="0.22" transform={`rotate(${a} 100 100)`} />)}
        </svg>
      </div>

      {/* Floating gold spark stars */}
      {sparks.map((pos, i) => (
        <div key={i} style={{ position: 'absolute', ...(pos as object), pointerEvents: 'none', zIndex: 0 }}>
          <motion.div
            animate={{ y: [-6, 6, -6], opacity: [0.3, 0.7, 0.3], scale: [0.85, 1.1, 0.85] }}
            transition={{ repeat: Infinity, duration: 2.8 + (i * 0.4), ease: 'easeInOut', delay: i * 0.35 }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="#c9a84c">
              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17 5.8 21.3l2.4-7.4L2 9.4h7.6z" />
            </svg>
          </motion.div>
        </div>
      ))}

      {/* CONTENT */}
      <div style={{ maxWidth: 780, margin: '0 auto', position: 'relative', zIndex: 2 }}>
        {/* Top badge */}
        <motion.div initial={{ opacity: 0, y: -16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 18px', borderRadius: 20, border: '1px solid rgba(201,168,76,0.35)', color: '#c9a84c', fontSize: 10.5, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', background: 'rgba(201,168,76,0.07)', marginBottom: 28 }}>
            <svg width="7" height="7" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" fill="#c9a84c" /></svg>
            Start Creating Today
            <svg width="7" height="7" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" fill="#c9a84c" /></svg>
          </span>
        </motion.div>

        {/* Hindi tagline */}
        <motion.p initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.08 }}
          style={{ fontSize: 13, color: 'rgba(201,168,76,0.55)', letterSpacing: '0.12em', fontWeight: 500, marginBottom: 18, fontFamily: 'serif' }}>
          शुभ संदेश — Send Blessings. Make Memories.
        </motion.p>

        {/* Headline */}
        <motion.h2 className="cta-headline" initial={{ opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.88, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay: 0.1 }}
          style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(40px,6vw,80px)', fontWeight: 700, color: '#f5ede6', letterSpacing: '-2px', lineHeight: 1.04, marginBottom: 10 }}>
          Make someone&apos;s day
        </motion.h2>
        <motion.h2 className="cta-headline" initial={{ opacity: 0, y: 36 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.88, ease: [0.22, 1, 0.36, 1] as [number, number, number, number], delay: 0.2 }}
          style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(40px,6vw,80px)', fontWeight: 700, color: '#c9a84c', fontStyle: 'italic', letterSpacing: '-2px', lineHeight: 1.04, marginBottom: 28 }}>
          unforgettable.
        </motion.h2>

        {/* Description */}
        <motion.p initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.32 }}
          style={{ fontSize: 16, color: 'rgba(245,237,230,0.55)', lineHeight: 1.85, marginBottom: 52, maxWidth: 520, margin: '0 auto 52px' }}>
          Create a beautiful celebration page in under 2 minutes.<br />
          No design skills. No credit card. Just pure emotion.
        </motion.p>

        {/* Gold CTA Button */}
        <motion.div initial={{ opacity: 0, y: 22 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.72, delay: 0.42 }} style={{ marginBottom: 28 }}>
          <motion.button className="cta-btn"
            whileHover={{ scale: 1.05, boxShadow: '0 20px 60px rgba(201,168,76,0.35)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push('/templates')}
            style={{
              background: 'linear-gradient(135deg,#c9a84c 0%,#e8c96a 50%,#b8943c 100%)',
              color: '#1a0507', border: 'none',
              padding: '20px 68px', borderRadius: 4,
              fontSize: 12, fontWeight: 800, letterSpacing: '2.5px',
              cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(201,168,76,0.25),inset 0 1px 0 rgba(255,255,255,0.2)',
              display: 'inline-flex', alignItems: 'center', gap: 10,
            }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17 5.8 21.3l2.4-7.4L2 9.4h7.6z" /></svg>
            CREATE YOUR PAGE NOW
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17 5.8 21.3l2.4-7.4L2 9.4h7.6z" /></svg>
          </motion.button>
        </motion.div>

        {/* Trust micro-copy */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.6 }}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, flexWrap: 'wrap' }}>
          {[
            {
              icon: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></>,
              t: 'Privacy Protected'
            },
            {
              icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" fill="none" stroke="currentColor" strokeWidth="2" /><circle cx="9" cy="7" r="4" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" fill="none" /></>,
              t: '50,000+ Families'
            },
            {
              icon: <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /></>,
              t: '4.9★ Rating'
            },
          ].map((b, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, color: 'rgba(201,168,76,0.5)' }}>
              {i > 0 && <div style={{ width: 1, height: 14, background: 'rgba(201,168,76,0.2)', marginRight: 6 }} />}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">{b.icon}</svg>
              <span style={{ fontSize: 11.5, fontWeight: 600, color: 'rgba(245,237,230,0.38)', letterSpacing: '0.06em' }}>{b.t}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
