"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { OCCASIONS } from "./data";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

function OccIcon({ type, size = 18, color = '#c9a84c' }: { type: string; size?: number; color?: string }) {
  const c = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: color, strokeWidth: 1.9, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  if (type === 'ring') return <svg {...c}><circle cx="12" cy="14.5" r="4.6" /><path d="M12 4l2.3 2.8h-4.6L12 4z" /></svg>;
  if (type === 'cake') return <svg {...c}><path d="M5 10h14v9H5z" /><path d="M8 10V7m4 3V7m4 3V7" /><path d="M4 14h16" /></svg>;
  if (type === 'heart') return <svg {...c}><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" /></svg>;
  if (type === 'palette') return <svg {...c}><path d="M12 3a9 9 0 1 0 0 18h1.1a2 2 0 0 0 0-4H12a3 3 0 0 1 0-6h6a3 3 0 0 0 3-3A9 9 0 0 0 12 3z" /><circle cx="7.5" cy="10" r="1" /><circle cx="9.5" cy="7.5" r="1" /><circle cx="12.5" cy="7" r="1" /></svg>;
  if (type === 'moon') return <svg {...c}><path d="M20 14.2A8 8 0 1 1 10 4a6.5 6.5 0 0 0 10 10.2z" /></svg>;
  return <svg {...c}><path d="M12 3.8l1.5 3.6 3.6 1.5-3.6 1.5-1.5 3.6-1.5-3.6-3.6-1.5 3.6-1.5L12 3.8z" /></svg>;
}

function OccCard({ occ }: { occ: typeof OCCASIONS[0] }) {
  const [hov, setHov] = useState(false);
  return (
    <div className="occ-card-wrap" style={{ flexShrink: 0, width: 200 }} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div style={{
        borderRadius: '54% 54% 18px 18px / 20% 20% 18px 18px',
        overflow: 'hidden', height: 300, position: 'relative',
        border: `1.5px solid ${hov ? 'rgba(201,168,76,0.75)' : 'rgba(201,168,76,0.25)'}`,
        boxShadow: hov ? '0 28px 72px rgba(0,0,0,0.6),0 0 0 1px rgba(201,168,76,0.2)' : '0 10px 36px rgba(0,0,0,0.4)',
        transition: 'border-color 0.35s,box-shadow 0.35s',
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={occ.img} alt={occ.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transform: hov ? 'scale(1.09)' : 'scale(1)', transition: 'transform 0.85s cubic-bezier(0.22,1,0.36,1)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(20,2,2,0.96) 0%,rgba(20,2,2,0.38) 48%,transparent 100%)' }} />
        {hov && <div style={{ position: 'absolute', top: 0, left: '15%', right: '15%', height: 2, background: 'linear-gradient(90deg,transparent,rgba(201,168,76,0.9),transparent)' }} />}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 14px', textAlign: 'center' }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%', margin: '0 auto 8px',
            background: hov ? 'rgba(201,168,76,0.2)' : 'rgba(15,3,3,0.75)',
            border: `1.5px solid ${hov ? 'rgba(201,168,76,0.7)' : 'rgba(201,168,76,0.32)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.35s',
          }}>
            <OccIcon type={occ.icon} size={16} color={hov ? '#f5ede6' : '#c9a84c'} />
          </div>
          <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 15, fontWeight: 600, color: hov ? '#c9a84c' : '#f5ede6', marginBottom: 5, lineHeight: 1.2, transition: 'color 0.3s', textShadow: '0 2px 10px rgba(0,0,0,0.7)' }}>{occ.name}</h3>
          {hov && <div style={{ fontSize: 9.5, letterSpacing: '3px', fontWeight: 800, color: '#c9a84c', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
            CREATE
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#c9a84c" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </div>}
        </div>
      </div>
    </div>
  );
}

export default function OccasionsSection() {
  const router = useRouter();
  const allCards = [...OCCASIONS, ...OCCASIONS];

  return (
    <section id="occasions" className="occ-section" style={{ background: 'linear-gradient(180deg,#1e0305 0%,#3d0c11 45%,#1e0305 100%)', padding: '110px 0 120px', position: 'relative', overflow: 'hidden' }}>
      {/* Mandala BG dots */}
      {[
        { top: '8%', left: '3%', s: 88, o: 0.07 }, { top: '55%', left: '1%', s: 104, o: 0.05 },
        { bottom: '14%', right: '4%', s: 78, o: 0.07 }, { top: '35%', right: '12%', s: 44, o: 0.05 },
      ].map((d, i) => (
        <div key={i} style={{ position: 'absolute', top: d.top, left: (d as any).left, right: (d as any).right, bottom: (d as any).bottom, width: d.s, height: d.s, pointerEvents: 'none', opacity: d.o }}>
          <svg width={d.s} height={d.s} viewBox="0 0 100 100">
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(a => (
              <g key={a} transform={`rotate(${a} 50 50)`}>
                <ellipse cx="50" cy="22" rx="3.5" ry="7" fill="#c9a84c" />
                <circle cx="50" cy="14" r="2" fill="#c9a84c" />
              </g>
            ))}
            <circle cx="50" cy="50" r="7" fill="none" stroke="#c9a84c" strokeWidth="1.5" />
            <circle cx="50" cy="50" r="13" fill="none" stroke="#c9a84c" strokeWidth="0.8" />
          </svg>
        </div>
      ))}

      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,transparent,#c9a84c 25%,#c9a84c 75%,transparent)' }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,transparent,#c9a84c 25%,#c9a84c 75%,transparent)' }} />

      {/* Header */}
      <div className="occ-header" style={{ maxWidth: 900, margin: '0 auto', padding: '0 44px', textAlign: 'center', marginBottom: 64, position: 'relative', zIndex: 1 }}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger}>
          <motion.span variants={fadeUp} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 20px', borderRadius: 24, border: '1px solid rgba(201,168,76,0.38)', color: '#c9a84c', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', background: 'rgba(201,168,76,0.08)', marginBottom: 20 }}>
            <svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" fill="#c9a84c" /></svg>
            Occasions
            <svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" fill="#c9a84c" /></svg>
          </motion.span>
          <motion.h2 variants={fadeUp} style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(34px,5vw,60px)', fontWeight: 700, color: '#c9a84c', letterSpacing: '-2px', marginBottom: 18, lineHeight: 1.05 }}>
            Perfect for Every Celebration
          </motion.h2>
          <motion.p variants={fadeUp} style={{ color: 'rgba(245,237,230,0.52)', fontSize: 16, lineHeight: 1.8, maxWidth: 500, margin: '0 auto 28px' }}>
            Beautifully crafted pages for every milestone — combining traditional Indian aesthetics with modern digital elegance.
          </motion.p>
          <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            <div style={{ width: 64, height: 1, background: 'linear-gradient(90deg,transparent,#c9a84c)' }} />
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#c9a84c' }} />
            <div style={{ width: 64, height: 1, background: 'linear-gradient(90deg,#c9a84c,transparent)' }} />
          </motion.div>
        </motion.div>
      </div>

      {/* Infinite scroll track */}
      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.8 }} style={{ position: 'relative', zIndex: 1 }}>
        <div className="occ-fade-l" style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 140, background: 'linear-gradient(90deg,#1e0305,transparent)', zIndex: 10, pointerEvents: 'none' }} />
        <div className="occ-fade-r" style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: 140, background: 'linear-gradient(270deg,#1e0305,transparent)', zIndex: 10, pointerEvents: 'none' }} />

        <div style={{ overflow: 'hidden', padding: '16px 0 20px' }}>
          <div style={{ display: 'flex', gap: 20, animation: 'marquee 32s linear infinite', width: 'max-content' }}>
            {allCards.map((o, i) => <OccCard key={i} occ={o} />)}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 1, background: 'rgba(201,168,76,0.3)' }} />
          <span className="occ-hint-desktop" style={{ fontSize: 11, color: 'rgba(245,237,230,0.3)', letterSpacing: '0.12em', fontWeight: 600 }}>HOVER TO PAUSE · SCROLL TO EXPLORE</span>
          <span className="occ-hint-mobile" style={{ display: 'none', fontSize: 10, color: 'rgba(245,237,230,0.3)', letterSpacing: '0.12em', fontWeight: 600 }}>SWIPE TO EXPLORE</span>
          <div style={{ width: 28, height: 1, background: 'rgba(201,168,76,0.3)' }} />
        </div>
      </motion.div>

      {/* CTA */}
      <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-40px' }} transition={{ duration: 0.7, delay: 0.2 }}
        style={{ textAlign: 'center', marginTop: 56, position: 'relative', zIndex: 1 }}>
        <motion.button className="occ-cta-btn"
          whileHover={{ scale: 1.05, boxShadow: '0 24px 60px rgba(201,168,76,0.3)' }} whileTap={{ scale: 0.97 }}
          onClick={() => router.push('/templates')}
          style={{ padding: '16px 44px', background: 'linear-gradient(135deg,#c9a84c,#a8823a)', color: '#1a0507', borderRadius: 50, fontWeight: 800, fontSize: 13.5, border: 'none', cursor: 'pointer', letterSpacing: '0.08em', boxShadow: '0 12px 36px rgba(201,168,76,0.22)' }}>
          VIEW ALL TEMPLATES →
        </motion.button>
        <p className="occ-cta-sub" style={{ marginTop: 14, fontSize: 12, color: 'rgba(245,237,230,0.32)', letterSpacing: '0.06em' }}>
          12+ occasions · New templates added regularly
        </p>
      </motion.div>
    </section>
  );
}
