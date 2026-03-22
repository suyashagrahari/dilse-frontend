"use client";

import { motion } from "framer-motion";
import { SECURITY_CARDS } from "./data";
import { getMandalaLineEndpoint, MANDALA_ANGLES } from "./mandala";

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.13 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};
const cardIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const GOLD_FILTER = "brightness(0) saturate(100%) invert(72%) sepia(52%) saturate(700%) hue-rotate(2deg) brightness(96%) contrast(110%)";

const SEC_ICONS = [
  <><rect x="3" y="11" width="18" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" /><circle cx="12" cy="16" r="1.2" fill="currentColor" /></>,
  <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><polyline points="9 12 11 14 15 10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" /></>,
  <><rect x="3" y="11" width="18" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" /><path d="M7 11V7a5 5 0 0 1 9.9-1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" /><line x1="12" y1="15" x2="12" y2="17" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" /></>,
  <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" /><line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></>,
  <><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /><line x1="12" y1="12" x2="12" y2="18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /><polyline points="9 15 12 12 15 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" /></>,
  <><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" /></>,
];

const FEAT_LABELS = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX'];

const TRUST_BADGES = [
  { label: 'Privacy Protected', iconPath: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /> },
  { label: 'End-to-End Encrypted', iconPath: <><rect x="3" y="11" width="18" height="11" rx="2" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" /></> },
  { label: '99.9% Uptime', iconPath: <path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" /> },
  { label: 'HTTPS Secured', iconPath: <><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" /><line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></> },
];

export default function SecuritySection() {
  return (
    <section className="sec-section" style={{ background: 'linear-gradient(180deg,#0e0203 0%,#2a0a0e 28%,#3d0c11 52%,#2a0a0e 72%,#0e0203 100%)', padding: '110px 0 120px', position: 'relative', overflow: 'hidden' }}>
      {/* Large mandala watermark */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 680, height: 680, opacity: 0.04, pointerEvents: 'none', zIndex: 0 }}>
        <svg viewBox="0 0 200 200" fill="none" width="100%" height="100%">
          {[98, 80, 62, 44, 26].map(r => <circle key={r} cx="100" cy="100" r={r} stroke="#c9a84c" strokeWidth="0.4" />)}
          {MANDALA_ANGLES.map(a => {
            const endpoint = getMandalaLineEndpoint(a, 98);
            return <line key={a} x1="100" y1="100" x2={endpoint.x2} y2={endpoint.y2} stroke="#c9a84c" strokeWidth="0.3" />;
          })}
          {[0, 45, 90, 135].map(a => <ellipse key={a} cx="100" cy="100" rx="98" ry="26" stroke="#c9a84c" strokeWidth="0.25" transform={`rotate(${a} 100 100)`} />)}
        </svg>
      </div>

      {/* Floating rings */}
      {[{ top: '6%', left: '3%', s: 90, op: 0.1 }, { top: '72%', right: '2%', s: 66, op: 0.08 }, { bottom: '8%', left: '7%', s: 52, op: 0.09 }, { top: '18%', right: '5%', s: 110, op: 0.07 }].map((d, i) => {
        const { s, op, ...pos } = d;
        return <div key={i} style={{ position: 'absolute', ...pos as object, width: s, height: s, borderRadius: '50%', border: `1px solid rgba(201,168,76,${op})`, pointerEvents: 'none', zIndex: 0 }} />;
      })}

      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg,transparent,#c9a84c 25%,#c9a84c 75%,transparent)', zIndex: 1 }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg,#c9a84c,#a8823a 50%,#c9a84c)', zIndex: 1 }} />

      <div className="sec-inner-wrap" style={{ maxWidth: 1180, margin: '0 auto', padding: '0 44px', position: 'relative', zIndex: 2 }}>
        {/* Header */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger} style={{ textAlign: 'center', marginBottom: 72 }}>
          <motion.span variants={fadeUp} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 20px', borderRadius: 24, border: '1px solid rgba(201,168,76,0.35)', color: '#c9a84c', fontSize: 11, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', background: 'rgba(201,168,76,0.08)', marginBottom: 22 }}>
            <svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" fill="#c9a84c" /></svg>
            Security & Privacy
            <svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="3" fill="#c9a84c" /></svg>
          </motion.span>
          <motion.h2 variants={fadeUp} style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(30px,4.5vw,54px)', fontWeight: 700, color: '#f5ede6', letterSpacing: '-1.5px', marginBottom: 18, lineHeight: 1.1 }}>
            Your Celebrations Stay<br /><em style={{ color: '#c9a84c', fontStyle: 'italic' }}>Private &amp; Secure</em>
          </motion.h2>
          <motion.p variants={fadeUp} style={{ fontSize: 15.5, color: 'rgba(245,237,230,0.58)', lineHeight: 1.82, maxWidth: 540, margin: '0 auto' }}>
            At SubhSandesh, your personal memories, photos, and heartfelt messages are protected with the highest care — always.
          </motion.p>
          <motion.div variants={fadeUp} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginTop: 28 }}>
            <div style={{ width: 80, height: 1, background: 'linear-gradient(90deg,transparent,rgba(201,168,76,0.45))' }} />
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#c9a84c" opacity="0.85"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17 5.8 21.3l2.4-7.4L2 9.4h7.6z" /></svg>
            <div style={{ width: 80, height: 1, background: 'linear-gradient(90deg,rgba(201,168,76,0.45),transparent)' }} />
          </motion.div>
        </motion.div>

        {/* Cards grid */}
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-60px' }} variants={stagger}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 22, marginBottom: 52 }}
          className="sec-grid">
          {SECURITY_CARDS.map((f, i) => (
            <motion.div key={f.title} variants={cardIn}>
              <div style={{
                background: 'linear-gradient(145deg,#260810 0%,#1c0507 60%,#200608 100%)',
                border: '1.5px solid rgba(201,168,76,0.3)', borderRadius: 18,
                padding: '44px 28px 36px', position: 'relative', overflow: 'hidden',
                textAlign: 'center', height: '100%', boxSizing: 'border-box',
                transition: 'border-color 0.4s,box-shadow 0.4s,transform 0.4s', cursor: 'default',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,76,0.65)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 22px 64px rgba(0,0,0,0.55)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-8px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,76,0.3)'; (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.transform = 'none'; }}>

                {/* Corner ornaments */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="alekhancorner2.svg" aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, width: 80, height: 80, pointerEvents: 'none', transform: 'scaleY(-1)', opacity: 0.7, filter: GOLD_FILTER, zIndex: 2 }} alt="" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="alekhancorner2.svg" aria-hidden="true" style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, pointerEvents: 'none', transform: 'scale(-1,-1)', opacity: 0.7, filter: GOLD_FILTER, zIndex: 2 }} alt="" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="alekhancorner2.svg" aria-hidden="true" style={{ position: 'absolute', bottom: 0, left: 0, width: 80, height: 80, pointerEvents: 'none', opacity: 0.7, filter: GOLD_FILTER, zIndex: 2 }} alt="" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="alekhancorner2.svg" aria-hidden="true" style={{ position: 'absolute', bottom: 0, right: 0, width: 80, height: 80, pointerEvents: 'none', transform: 'scaleX(-1)', opacity: 0.7, filter: GOLD_FILTER, zIndex: 2 }} alt="" />

                {/* Ghost number watermark */}
                <div style={{ position: 'absolute', bottom: 12, right: 16, fontSize: 108, fontWeight: 900, color: 'rgba(201,168,76,0.05)', fontFamily: "'Playfair Display',serif", lineHeight: 1, pointerEvents: 'none', userSelect: 'none', letterSpacing: '-3px', zIndex: 1 }}>
                  {String(i + 1).padStart(2, '0')}
                </div>

                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.22em', color: 'rgba(201,168,76,0.42)', marginBottom: 20, textTransform: 'uppercase', position: 'relative', zIndex: 3 }}>
                  FEATURE {FEAT_LABELS[i]}
                </div>

                {/* Icon */}
                <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 26, zIndex: 3 }}>
                  <div style={{ position: 'absolute', width: 104, height: 104, borderRadius: '50%', border: '1px solid rgba(201,168,76,0.1)' }} />
                  <div style={{ position: 'absolute', width: 88, height: 88, borderRadius: '50%', border: '1px solid rgba(201,168,76,0.18)' }} />
                  <div style={{ width: 74, height: 74, borderRadius: '50%', background: '#2a0a0e', border: '2px solid rgba(201,168,76,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c9a84c', boxShadow: '0 0 32px rgba(201,168,76,0.14),inset 0 1px 0 rgba(201,168,76,0.1)', position: 'relative', zIndex: 1 }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">{SEC_ICONS[i]}</svg>
                  </div>
                </div>

                <h3 style={{ fontSize: 15.5, fontWeight: 700, color: '#f5ede6', marginBottom: 12, lineHeight: 1.3, fontFamily: "'Playfair Display',serif", position: 'relative', zIndex: 3 }}>{f.title}</h3>
                <p style={{ fontSize: 12.5, color: 'rgba(245,237,230,0.42)', lineHeight: 1.78, margin: '0 auto', maxWidth: 200, position: 'relative', zIndex: 3 }}>{f.desc}</p>

                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1.5, background: 'linear-gradient(90deg,transparent,rgba(201,168,76,0.28),transparent)', zIndex: 3 }} />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust seal bar */}
        <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.72, delay: 0.2 }}
          style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          {TRUST_BADGES.map((b, i) => (
            <div key={b.label}
              style={{ display: 'flex', alignItems: 'center', gap: 9, background: 'rgba(201,168,76,0.07)', border: '1px solid rgba(201,168,76,0.22)', padding: '11px 22px', borderRadius: 12, cursor: 'default', transition: 'border-color 0.3s,background 0.3s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,76,0.5)'; (e.currentTarget as HTMLElement).style.background = 'rgba(201,168,76,0.12)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,168,76,0.22)'; (e.currentTarget as HTMLElement).style.background = 'rgba(201,168,76,0.07)'; }}>
              <div style={{ color: '#c9a84c', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none">{b.iconPath}</svg>
              </div>
              <span style={{ fontSize: 11.5, fontWeight: 700, color: '#c9a84c', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{b.label}</span>
            </div>
          ))}
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .sec-grid { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 480px) and (max-width: 768px) {
          .sec-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>
    </section>
  );
}
